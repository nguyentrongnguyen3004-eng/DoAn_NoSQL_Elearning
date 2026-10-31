const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectAllDatabases, getMongoDb, redisClient, cassandraClient, neo4jDriver } = require('./config/db');

const { createRateLimiter } = require('./middlewares/rateLimiter');
const Redis = require('ioredis');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const examRoutes = require('./routes/examRoutes');
const graphRoutes = require('./routes/graphRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const copilotRoutes = require('./routes/copilotRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const peerRoutes = require('./routes/peerRoutes');
const backupRoutes = require('./routes/backupRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Giao dien Web Client tinh (phuc vu truc tiep giao dien demo E-learning)
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
app.get('/verify', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// Ap dung Redis Rate Limiter toan cuc (bao ve API chong tan cong DoS)
app.use(createRateLimiter({ windowSeconds: 60, maxRequests: 120 }));

// DANG KY CAC MODULE API THEO DUNG NGHIEP VU VA 4 DATABASE
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/peers', peerRoutes);
app.use('/api/backups', backupRoutes);

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
redisSubscriber.on('error', () => {});

redisSubscriber.connect().then(() => {
  // Subscribe kenh leaderboard update, system notifications va kenh expired event cua Redis Keyspace Notifications
  redisSubscriber.subscribe('leaderboard_update', 'system_notifications', '__keyevent@0__:expired', (err, count) => {
    if (err) console.error('[Redis Subscriber] Error subscribing:', err.message);
    else console.log(`[Redis Pub/Sub & Keyspace] Da subscribe vao ${count} kenh (Leaderboard, Notifications & Expired Events)`);
  });
}).catch(err => console.error('[Redis Subscriber Connect Error]:', err.message));

// NANG CAP 3: LANG NGHE KEYSPACE EVENT DE TU DONG CHAM DIEM KHI HET GIO (AUTO-SUBMIT ON TTL EXPIRE)
// TICH HOP DISTRIBUTED LOCK VA IDEMPOTENCY CHONG DUPLICATE SUBMIT
redisSubscriber.on('message', async (channel, message) => {
  if (channel === '__keyevent@0__:expired') {
    // message chinh la ten key bi expired, vi du: exam:670000000000000000000040:attempt:student_nguyen
    if (message.startsWith('exam:') && message.includes(':attempt:')) {
      const parts = message.split(':');
      const examId = parts[1];
      const studentId = parts[3];
      console.log(`[Redis Keyspace Notification] Phat hien phien thi ${examId} cua thi sinh ${studentId} da het han TTL. Tu dong nop bai!`);
      
      const lockKey = `lock:submit:${examId}:${studentId}`;
      let acquired = false;
      try {
        if (redisClient && redisClient.status === 'ready') {
          const lockRes = await redisClient.set(lockKey, 'AUTO_SUBMIT', 'EX', 15, 'NX');
          acquired = (lockRes === 'OK');
        } else {
          acquired = true;
        }

        if (!acquired) {
          console.log(`[Redis Auto-Submit] Khoa phan tan ${lockKey} dang ban (nguoi dung dang nop tay hoac da xu ly). Bo qua auto-submit.`);
          return;
        }

        const db = getMongoDb();
        if (db) {
          const { ObjectId } = require('mongodb');
          const answersKey = `exam:${examId}:answers:${studentId}`;
          
          // IDEMPOTENCY CHECK: Kiem tra sinh vien da duoc cham diem hoac da nop bai chua
          const existingResult = await db.collection('results').findOne({
            $or: [
              { examId: ObjectId.isValid(examId) ? new ObjectId(examId) : examId, studentCode: studentId },
              { examId: examId, studentCode: studentId }
            ]
          });

          if (existingResult) {
            console.log(`[Redis Auto-Submit] Sinh vien ${studentId} da co ket qua nop bai (ID: ${existingResult._id}). Khong chen trung lap.`);
            if (redisClient && redisClient.status === 'ready') {
              await redisClient.del(answersKey);
            }
            return;
          }

          let userAnswers = {};
          if (redisClient && redisClient.status === 'ready') {
            userAnswers = await redisClient.hgetall(answersKey) || {};
          }
          
          const exam = await db.collection('exams').findOne({ _id: ObjectId.isValid(examId) ? new ObjectId(examId) : examId });
          if (exam) {
            const questionIds = (exam.questions || []).map(q => ObjectId.isValid(q) ? new ObjectId(q) : q);
            const questions = await db.collection('questions').find({ _id: { $in: questionIds } }).toArray();
            
            let correctCount = 0;
            const detailedAnswers = [];
            questions.forEach(q => {
              const qIdStr = q._id.toString();
              const selected = userAnswers[qIdStr] || null;
              const isCorrect = (selected && selected === q.correctAnswer);
              if (isCorrect) correctCount++;
              detailedAnswers.push({
                questionId: q._id,
                content: q.content,
                selectedOption: selected,
                correctAnswer: q.correctAnswer,
                isCorrect: isCorrect,
                explanation: q.explanation
              });
            });
            const score = questions.length > 0 ? Math.round(((correctCount / questions.length) * 10) * 10) / 10 : 0;
            
            const autoResultDoc = {
              examId: ObjectId.isValid(examId) ? new ObjectId(examId) : examId,
              examTitle: exam.title,
              studentCode: studentId,
              studentName: studentId,
              score: score,
              correctCount: correctCount,
              totalCount: questions.length,
              autoSubmitted: true,
              submittedAt: new Date(),
              answers: detailedAnswers
            };

            await db.collection('results').insertOne(autoResultDoc);
            await db.collection('exam_attempts').updateOne(
              { studentId, examId },
              { $set: { status: 'submitted', score, autoSubmitted: true, submittedAt: new Date() } }
            );

            if (redisClient && redisClient.status === 'ready') {
              await redisClient.del(answersKey, `exam:${examId}:order:${studentId}`);
              await redisClient.zadd(`leaderboard:${examId}`, score, `${studentId} (${studentId})`);
            }
            console.log(`[Redis Auto-Submit] Da tu dong luu ket qua thi an toan cho SV ${studentId}: ${score} diem (Idempotent)`);
          }
        }
      } catch (e) {
        console.error('[Auto-Submit Error]:', e.message);
      } finally {
        // Giai phong lock sau khi hoan tat
        if (redisClient && redisClient.status === 'ready') {
          await redisClient.del(lockKey).catch(() => {});
        }
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
    } else if (channel === 'system_notifications') {
      res.write(`data: ${JSON.stringify({ type: 'NOTIFICATION', payload: JSON.parse(message) })}\n\n`);
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

      if (redisClient && redisClient.status === 'ready' && typeof redisClient[command] === 'function') {
        const result = await redisClient[command](...args);
        return res.json({ success: true, target: 'Redis (Live Container)', command, result });
      } else {
        return res.json({
          success: true,
          target: 'Redis (In-Memory Fallback Mode)',
          command,
          note: 'Bật Docker Desktop (docker compose up -d) để kết nối Redis Container thật trên cổng 6379.',
          result: ['exam:670000000000000000000040:leaderboard', 'exam:670000000000000000000040:attempt:2001230589', 'courses:catalog:published']
        });
      }
    }

    if (targetDb === 'neo4j') {
      const session = neo4jDriver.session();
      try {
        const result = await session.run(query);
        const records = result.records.map(r => r.toObject());
        return res.json({ success: true, target: 'Neo4j Cypher (Live Container)', total: records.length, result: records });
      } catch (e) {
        return res.json({
          success: true,
          target: 'Neo4j Cypher (Embedded Graph Fallback Mode)',
          query,
          note: 'Bật Docker Desktop (docker compose up -d) để truy vấn Cypher trực tiếp trên Neo4j Container cổng 7687.',
          result: [{ count_nodes: 23, count_relationships: 25, model: 'CEFR A1 -> C2 English Knowledge Graph' }]
        });
      } finally {
        try { await session.close(); } catch (e) {}
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
      return res.json({ success: true, target: 'MongoDB (Live Native Service)', summary });
    }

    if (targetDb === 'cassandra') {
      try {
        const result = await cassandraClient.execute(query || 'SELECT * FROM elearning_logs.learning_events LIMIT 5;');
        return res.json({ success: true, target: 'Cassandra CQL (Live Container)', rows: result.rows });
      } catch (e) {
        return res.json({
          success: true,
          target: 'Cassandra CQL (In-Memory Telemetry Fallback Mode)',
          query: query || 'SELECT * FROM elearning_logs.learning_events LIMIT 5;',
          note: 'Bật Docker Desktop (docker compose up -d) để truy vấn CQL trực tiếp trên Cassandra Container cổng 9042.',
          rows: [
            { student_id: '2001230589', event_type: 'PLAY_LESSON', course_id: '670000000000000000000010', lesson_id: '670000000000000000000021', duration_seconds: 300, event_time: new Date().toISOString() }
          ]
        });
      }
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
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`==============================================================================`);
  console.log(`Backend API E-learning dang khoi chay tren: http://localhost:${PORT}`);
  console.log(`==============================================================================`);
  await connectAllDatabases();
});
