const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectAllDatabases, getMongoDb, redisClient, cassandraClient, neo4jDriver } = require('./config/db');

const { createRateLimiter } = require('./middlewares/rateLimiter');
const Redis = require('ioredis');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const examRoutes = require('./routes/examRoutes');
const graphRoutes = require('./routes/graphRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Giao dien Web Client tinh (phuc vu truc tiep giao dien demo E-learning)
app.use(express.static('public'));

// Ap dung Redis Rate Limiter toan cuc (bao ve API chong tan cong DoS)
app.use(createRateLimiter({ windowSeconds: 60, maxRequests: 120 }));

// DANG KY CAC MODULE API THEO DUNG NGHIEP VU VA 4 DATABASE
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/graph', graphRoutes);

// KET NOI REDIS DEDICATED CHO PUB/SUB SU KIEN THOI GIAN THUC
const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 150, 1500);
  }
});

redisSubscriber.connect().then(() => {
  // Subscribe kenh leaderboard update va kenh expired event cua Redis Keyspace Notifications
  redisSubscriber.subscribe('leaderboard_update', '__keyevent@0__:expired', (err, count) => {
    if (err) console.error('[Redis Subscriber] Error subscribing:', err.message);
    else console.log(`[Redis Pub/Sub & Keyspace] Da subscribe vao ${count} kenh (Leaderboard & Expired Events)`);
  });
}).catch(err => console.error('[Redis Subscriber Connect Error]:', err.message));

// NANG CAP 3: LANG NGHE KEYSPACE EVENT DE TU DONG CHAM DIEM KHI HET GIO (AUTO-SUBMIT ON TTL EXPIRE)
redisSubscriber.on('message', async (channel, message) => {
  if (channel === '__keyevent@0__:expired') {
    // message chinh la ten key bi expired, vi du: exam:670000000000000000000040:attempt:student_nguyen
    if (message.startsWith('exam:') && message.includes(':attempt:')) {
      const parts = message.split(':');
      const examId = parts[1];
      const studentId = parts[3];
      console.log(`[Redis Keyspace Notification] Phat hien phien thi ${examId} cua thi sinh ${studentId} da het han TTL. Tu dong nop bai!`);
      
      try {
        const db = getMongoDb();
        if (db) {
          const { ObjectId } = require('mongodb');
          const answersKey = `exam:${examId}:answers:${studentId}`;
          const userAnswers = await redisClient.hgetall(answersKey);
          
          const exam = await db.collection('exams').findOne({ _id: new ObjectId(examId) });
          if (exam) {
            const questionIds = exam.questions.map(q => new ObjectId(q));
            const questions = await db.collection('questions').find({ _id: { $in: questionIds } }).toArray();
            
            let correctCount = 0;
            questions.forEach(q => {
              if (userAnswers && userAnswers[q._id.toString()] === q.correctAnswer) correctCount++;
            });
            const score = questions.length > 0 ? Math.round(((correctCount / questions.length) * 10) * 10) / 10 : 0;
            
            await db.collection('results').insertOne({
              examId: new ObjectId(examId),
              examTitle: exam.title,
              studentCode: studentId,
              studentName: studentId,
              score: score,
              correctCount: correctCount,
              totalCount: questions.length,
              autoSubmitted: true,
              submittedAt: new Date()
            });

            await redisClient.del(answersKey);
            console.log(`[Redis Auto-Submit] Da tu dong luu ket qua thi cho SV ${studentId}: ${score} diem`);
          }
        }
      } catch (e) {
        console.error('[Auto-Submit Error]:', e.message);
      }
    }
  }
});

// REAL-TIME SERVER-SENT EVENTS (SSE) STREAMING QUA REDIS PUB/SUB
app.get('/api/events/live-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Gui thong diep handshake ban dau
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Live Stream Ready' })}\n\n`);

  const onMessage = (channel, message) => {
    if (channel === 'leaderboard_update') {
      res.write(`data: ${JSON.stringify({ type: 'LEADERBOARD_UPDATE', payload: JSON.parse(message) })}\n\n`);
    }
  };

  redisSubscriber.on('message', onMessage);

  req.on('close', () => {
    redisSubscriber.removeListener('message', onMessage);
  });
});

// NANG CAP 4: EMBEDDED NOSQL QUERY RUNNER & INSPECTOR CHO GIANG VIEN / ADMIN
app.post('/api/admin/query-runner', async (req, res) => {
  const { targetDb, query } = req.body;
  try {
    if (targetDb === 'redis') {
      // Cho phep chay cac query an toan tren Redis nhu KEYS, HGETALL, ZREVRANGE, DBSIZE, INFO
      const parts = query.trim().split(' ');
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (['flushall', 'flushdb', 'shutdown'].includes(command)) {
        return res.status(403).json({ success: false, message: 'Lệnh này bị hạn chế vì lý do an toàn.' });
      }

      if (typeof redisClient[command] === 'function') {
        const result = await redisClient[command](...args);
        return res.json({ success: true, target: 'Redis', command, result });
      } else {
        return res.status(400).json({ success: false, message: `Lệnh Redis '${command}' không được hỗ trợ trực tiếp.` });
      }
    }

    if (targetDb === 'neo4j') {
      const session = neo4jDriver.session();
      try {
        const result = await session.run(query);
        const records = result.records.map(r => r.toObject());
        return res.json({ success: true, target: 'Neo4j Cypher', total: records.length, result: records });
      } finally {
        await session.close();
      }
    }

    if (targetDb === 'mongodb') {
      const db = getMongoDb();
      // Lay danh sach collections va so luong documents
      const collections = await db.listCollections().toArray();
      const summary = [];
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        summary.push({ collection: col.name, count });
      }
      return res.json({ success: true, target: 'MongoDB', summary });
    }

    if (targetDb === 'cassandra') {
      const result = await cassandraClient.execute(query || 'SELECT * FROM elearning_logs.learning_events LIMIT 5;');
      return res.json({ success: true, target: 'Cassandra CQL', rows: result.rows });
    }

    res.status(400).json({ success: false, message: 'Database target không hợp lệ (hỗ trợ: redis, neo4j, mongodb, cassandra)' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi thực thi Query Runner: ' + err.message });
  }
});


// API Health Check & Thong tin he thong
app.get('/api/health', (req, res) => {
  res.json({
    project: 'E-learning & Online Examination Platform',
    course: 'Du lieu NoSQL (14DH) - HUIT',
    team: 'Nhom 18',
    status: 'API Service Running',
    databases: ['MongoDB', 'Redis', 'Apache Cassandra', 'Neo4j'],
    timestamp: new Date().toISOString()
  });
});

// Helper timeout cho kiem tra ket noi nhanh tranh treo request
function withTimeout(promise, ms = 1200) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
}

// API Tra cuu trang thai ket noi thuc te toi 4 CSDL
app.get('/api/databases/status', async (req, res) => {
  const status = {
    mongodb: false,
    redis: false,
    cassandra: false,
    neo4j: false
  };

  try {
    const db = getMongoDb();
    if (db) {
      await withTimeout(db.command({ ping: 1 }), 1000);
      status.mongodb = true;
    }
  } catch (e) {}

  try {
    const pong = await withTimeout(redisClient.ping(), 1000);
    if (pong === 'PONG') status.redis = true;
  } catch (e) {}

  try {
    if (cassandraClient.getState().getConnectedHosts().length > 0) {
      status.cassandra = true;
    }
  } catch (e) {}

  try {
    await withTimeout(neo4jDriver.verifyConnectivity(), 1200);
    status.neo4j = true;
  } catch (e) {}

  res.json(status);
});

// Khoi dong server
app.listen(PORT, async () => {
  console.log(`==============================================================================`);
  console.log(`Backend API E-learning dang khoi chay tren: http://localhost:${PORT}`);
  console.log(`==============================================================================`);
  await connectAllDatabases();
});
