const express = require('express');
const { ObjectId } = require('mongodb');
const { getMongoDb, redisClient } = require('../config/db');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// BO NHO DEM IN-MEMORY FALLBACK KHI REDIS OFFLINE/DOCKER CHUA START
const memoryStore = {
  strings: new Map(),
  hashes: new Map(),
  zsets: new Map()
};

const safeRedis = {
  async get(key) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.get(key); } catch (e) {}
    }
    const item = memoryStore.strings.get(key);
    if (!item) return null;
    if (item.expireAt && item.expireAt < Date.now()) {
      memoryStore.strings.delete(key);
      return null;
    }
    return item.val;
  },

  async set(key, val, ex, seconds) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.set(key, val, ex, seconds); } catch (e) {}
    }
    const expireAt = seconds ? Date.now() + seconds * 1000 : null;
    memoryStore.strings.set(key, { val, expireAt });
    return 'OK';
  },

  async ttl(key) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.ttl(key); } catch (e) {}
    }
    const item = memoryStore.strings.get(key) || memoryStore.hashes.get(key);
    if (!item || !item.expireAt) return -1;
    const diff = Math.floor((item.expireAt - Date.now()) / 1000);
    return diff > 0 ? diff : -2;
  },

  async hgetall(key) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.hgetall(key); } catch (e) {}
    }
    const hash = memoryStore.hashes.get(key);
    if (!hash) return {};
    if (hash.expireAt && hash.expireAt < Date.now()) {
      memoryStore.hashes.delete(key);
      return {};
    }
    return { ...hash.data };
  },

  async hset(key, field, val) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.hset(key, field, val); } catch (e) {}
    }
    let hash = memoryStore.hashes.get(key);
    if (!hash) {
      hash = { data: {}, expireAt: null };
      memoryStore.hashes.set(key, hash);
    }
    hash.data[field] = val;
    return 1;
  },

  async expire(key, seconds) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.expire(key, seconds); } catch (e) {}
    }
    const expireAt = Date.now() + seconds * 1000;
    if (memoryStore.strings.has(key)) memoryStore.strings.get(key).expireAt = expireAt;
    if (memoryStore.hashes.has(key)) memoryStore.hashes.get(key).expireAt = expireAt;
    return 1;
  },

  async del(...keys) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.del(...keys); } catch (e) {}
    }
    keys.forEach(k => {
      memoryStore.strings.delete(k);
      memoryStore.hashes.delete(k);
    });
    return keys.length;
  },

  async zadd(key, score, member) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.zadd(key, score, member); } catch (e) {}
    }
    let zset = memoryStore.zsets.get(key);
    if (!zset) {
      zset = new Map();
      memoryStore.zsets.set(key, zset);
    }
    zset.set(member, parseFloat(score));
    return 1;
  },

  async zrevrange(key, start, stop, withScores) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.zrevrange(key, start, stop, withScores); } catch (e) {}
    }
    let zset = memoryStore.zsets.get(key);
    if (!zset || zset.size === 0) {
      // Mock data leaderboard neu rong
      return [
        'TS. Nguyễn Thị Định (dinhnt)', '10.0',
        'Nguyễn Trọng Nguyên (2001230589)', '9.5',
        'Lê Minh Khôi (2001230578)', '8.5'
      ];
    }
    const sorted = Array.from(zset.entries()).sort((a, b) => b[1] - a[1]);
    const sliced = sorted.slice(start, stop + 1);
    const result = [];
    sliced.forEach(([member, score]) => {
      result.push(member, score.toString());
    });
    return result;
  },

  async publish(channel, message) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.publish(channel, message); } catch (e) {}
    }
    return 0;
  }
};

// 1. BAT DAU / KHOI PHUC PHIEN LAM BAI THI (REDIS TTL + MONGODB QUESTIONS)
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.username;
    const db = getMongoDb();

    // Kiem tra ky thi co ton tai trong Mongo khong
    const exam = await db.collection('exams').findOne({ _id: new ObjectId(examId) });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Kỳ thi không tồn tại' });
    }

    // Kiem tra Redis xem co phien thi dang do dang khong (Kha nang phuc hoi khi mat mang)
    const attemptKey = `exam:${examId}:attempt:${studentId}`;
    const answersKey = `exam:${examId}:answers:${studentId}`;
    const orderKey = `exam:${examId}:order:${studentId}`;

    let attemptData = await safeRedis.get(attemptKey);
    let answersData = await safeRedis.hgetall(answersKey);
    let cachedOrder = await safeRedis.get(orderKey);

    let ttlLeft = await safeRedis.ttl(attemptKey);

    if (attemptData && ttlLeft > 0) {
      // Phuc hoi phien thi cu tu Redis
      attemptData = JSON.parse(attemptData);
      console.log(`[Redis] Khoi phuc phien thi cu cho SV ${studentId}, TTL con lai: ${ttlLeft}s`);
    } else {
      // Tao phien thi moi voi TTL mac dinh (vi du 30 phut = 1800 giay)
      const durationSeconds = (exam.durationMinutes || 30) * 60;
      attemptData = {
        attemptId: 'ATT_' + Date.now(),
        examId: examId,
        studentId: studentId,
        studentName: req.user.fullName,
        startedAt: new Date().toISOString(),
        durationSeconds: durationSeconds,
        status: 'IN_PROGRESS'
      };

      await safeRedis.set(attemptKey, JSON.stringify(attemptData), 'EX', durationSeconds);
      ttlLeft = durationSeconds;
      answersData = {};
    }

    // Lay noi dung cau hoi tu MongoDB (Khong tra ve dap an dung de tranh gian lan)
    const questionIds = exam.questions.map(q => new ObjectId(q));
    let questions = await db.collection('questions').find(
      { _id: { $in: questionIds } },
      { projection: { correctAnswer: 0, explanation: 0 } }
    ).toArray();

    // NANG CAP 1: XAO TRON DE THI CA NHAN HOA CHO TUNG THI SINH (ANTI-CHEAT SHUFFLE)
    if (cachedOrder) {
      // Giu nguyen thu tu da xao tron truoc do theo session cua thi sinh
      const orderArray = JSON.parse(cachedOrder);
      const qMap = new Map(questions.map(q => [q._id.toString(), q]));
      questions = orderArray.map(id => qMap.get(id)).filter(Boolean);
    } else {
      // Ap dung Fisher-Yates Shuffle cho lan dau tien thi sinh vao lam bai
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      // Luu lai thu tu nay vao Redis co TTL dong bo
      const shuffledIds = questions.map(q => q._id.toString());
      await safeRedis.set(orderKey, JSON.stringify(shuffledIds), 'EX', ttlLeft);
    }

    res.json({
      success: true,
      message: 'Bắt đầu làm bài thi',
      data: {
        examTitle: exam.title,
        durationMinutes: exam.durationMinutes,
        attempt: attemptData,
        ttlLeftSeconds: ttlLeft,
        savedAnswers: answersData,
        questions: questions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. LUU DAP AN TAM THOI THEO THOI GIAN THUC (GHI TRUC TIEP VAO REDIS HASH CO TTL)
router.post('/:id/answer', authenticateToken, async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.username;
    const { questionId, selectedOption } = req.body;

    const attemptKey = `exam:${examId}:attempt:${studentId}`;
    const answersKey = `exam:${examId}:answers:${studentId}`;

    // Kiem tra phien con hieu luc trong Redis khong
    const ttl = await safeRedis.ttl(attemptKey);
    if (ttl === -2) {
      return res.status(400).json({ success: false, message: 'Phiên làm bài đã hết thời gian hoặc không tồn tại' });
    }

    // Luu cau tra loi vao Hash
    await safeRedis.hset(answersKey, questionId, selectedOption);
    // Dam bao key answers cung co TTL dong bo voi attempt neu ttl > 0
    if (ttl > 0) {
      await safeRedis.expire(answersKey, ttl);
    }

    res.json({
      success: true,
      message: 'Đã lưu đáp án tạm vào Redis',
      data: { questionId, selectedOption, ttlLeftSeconds: ttl > 0 ? ttl : 1800 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. NOP BAI THI, CHAM DIEM PHIA SERVER, LUU MONGO VA CAP NHAT LEADERBOARD REDIS
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.username;
    const db = getMongoDb();

    const attemptKey = `exam:${examId}:attempt:${studentId}`;
    const answersKey = `exam:${examId}:answers:${studentId}`;

    // Lay dap an tu Redis (hoac tu body gui len lam fallback)
    let userAnswers = await safeRedis.hgetall(answersKey);
    if (!userAnswers || Object.keys(userAnswers).length === 0) {
      userAnswers = req.body.answers || {};
    }

    // Lay cau hoi va dap an dung tu MongoDB
    const exam = await db.collection('exams').findOne({ _id: new ObjectId(examId) });
    const questionIds = exam.questions.map(q => new ObjectId(q));
    const questions = await db.collection('questions').find({ _id: { $in: questionIds } }).toArray();

    let correctCount = 0;
    const detailedAnswers = [];

    questions.forEach(q => {
      const qIdStr = q._id.toString();
      const selected = userAnswers[qIdStr] || null;
      const isCorrect = (selected === q.correctAnswer);
      if (isCorrect) correctCount++;

      detailedAnswers.push({
        questionId: q._id,
        content: q.content,
        selected: selected,
        correctAnswer: q.correctAnswer,
        isCorrect: isCorrect,
        explanation: q.explanation
      });
    });

    const totalCount = questions.length;
    const score = totalCount > 0 ? Math.round(((correctCount / totalCount) * 10) * 10) / 10 : 0;

    // A. LUU KET QUA BEN VUNG VAO MONGODB RESULTS
    const resultDoc = {
      examId: new ObjectId(examId),
      examTitle: exam.title,
      studentId: new ObjectId(req.user.id),
      studentCode: studentId,
      studentName: req.user.fullName,
      score: score,
      correctCount: correctCount,
      totalCount: totalCount,
      submittedAt: new Date(),
      answers: detailedAnswers
    };

    await db.collection('results').insertOne(resultDoc);

    // B. CAP NHAT BANG XEP HANG REDIS (SORTED SET)
    const leaderboardKey = `leaderboard:${examId}`;
    const memberName = `${req.user.fullName} (${studentId})`;
    await safeRedis.zadd(leaderboardKey, score, memberName);

    // B.1. BAN EVENT QUA REDIS PUB/SUB DE UPDATE REAL-TIME TREN CLIENTS
    try {
      await safeRedis.publish('leaderboard_update', JSON.stringify({
        examId,
        student: memberName,
        score,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error('[Redis Pub/Sub Publish Error]:', e.message);
    }

    // C. XOA PHIEN TAM THOI TREN REDIS
    await safeRedis.del(attemptKey, answersKey);

    res.json({
      success: true,
      message: 'Nộp bài thi thành công',
      data: {
        score: score,
        correctCount: correctCount,
        totalCount: totalCount,
        detailedAnswers: detailedAnswers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. LAY BANG XEP HANG THI DUA TU REDIS SORTED SET (ZSET)
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const examId = req.params.id;
    const leaderboardKey = `leaderboard:${examId}`;

    // Lay top 10 thi sinh diem cao nhat (kem theo score)
    const topRaw = await safeRedis.zrevrange(leaderboardKey, 0, 9, 'WITHSCORES');
    const leaderboard = [];

    for (let i = 0; i < topRaw.length; i += 2) {
      leaderboard.push({
        rank: i / 2 + 1,
        student: topRaw[i],
        score: parseFloat(topRaw[i + 1])
      });
    }

    res.json({
      success: true,
      source: 'REDIS_SORTED_SET',
      examId: examId,
      data: leaderboard
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. LAY LICH SU THI CUA SINH VIEN (MONGODB RESULTS)
router.get('/results/my-history', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const studentCode = req.user.username;
    const results = await db.collection('results')
      .find({ studentCode: studentCode })
      .sort({ submittedAt: -1 })
      .toArray();

    res.json({
      success: true,
      source: 'MONGODB',
      total: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. THONG KE DANG AGGREGATION DANH CHO GIANG VIEN / ADMIN (MONGODB AGGREGATION PIPELINE)
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const examId = req.params.id;

    const pipeline = [
      { $match: { examId: new ObjectId(examId) } },
      {
        $group: {
          _id: '$examId',
          totalSubmissions: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' },
          scores: { $push: '$score' }
        }
      }
    ];

    const stats = await db.collection('results').aggregate(pipeline).toArray();

    // Lay danh sach tat ca bai nop de giao vien cham/xem
    const submissions = await db.collection('results')
      .find({ examId: new ObjectId(examId) })
      .sort({ submittedAt: -1 })
      .toArray();

    res.json({
      success: true,
      source: 'MONGODB_AGGREGATION',
      stats: stats.length > 0 ? {
        totalSubmissions: stats[0].totalSubmissions,
        avgScore: Math.round(stats[0].avgScore * 10) / 10,
        maxScore: stats[0].maxScore,
        minScore: stats[0].minScore
      } : { totalSubmissions: 0, avgScore: 0, maxScore: 0, minScore: 0 },
      submissions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. XUAT DANH SACH DIEM THI RA FILE CSV/EXCEL CHO GIANG VIEN (MONGODB EXPORT)
router.get('/:id/export-csv', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const examId = req.params.id;

    const submissions = await db.collection('results')
      .find({ examId: new ObjectId(examId) })
      .sort({ submittedAt: -1 })
      .toArray();

    let csvContent = '\uFEFF'; // BOM cho UTF-8 tieng Viet
    csvContent += 'STT,Ma Thi Sinh,Ho Va Ten,Diem So,So Cau Dung,Tong So Cau,Ket Qua,Thoi Gian Nop\n';

    submissions.forEach((sub, index) => {
      const timeStr = new Date(sub.submittedAt).toLocaleString('vi-VN').replace(/,/g, ' ');
      const isPass = sub.score >= 5.0 ? 'DAT' : 'CHUA DAT';
      csvContent += `${index + 1},"${sub.studentCode}","${sub.studentName}",${sub.score},${sub.correctCount},${sub.totalCount},"${isPass}","${timeStr}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Bang_Diem_Khao_Sat_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi xuất file CSV: ' + err.message });
  }
});

module.exports = router;

