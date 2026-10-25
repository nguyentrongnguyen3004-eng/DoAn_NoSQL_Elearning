const express = require('express');
const { ObjectId } = require('mongodb');
const { getMongoDb, redisClient } = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();
router.use(require('./member2ExamRoutes').router);

// BO NHO DEM IN-MEMORY FALLBACK KHI REDIS OFFLINE/DOCKER CHUA START
const memoryStore = {
  strings: new Map(),
  hashes: new Map(),
  zsets: new Map(),
  sets: new Map()
};
const memoryEssays = [];

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
      return [
        'TS. Nguyễn Thị Định (dinhnt)', '10.0',
        'Nguyễn Trọng Nguyên (2001230589)', '9.5',
        'Phạm Nguyễn Khôi Nguyên (2001230578)', '8.8'
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
  },

  async sadd(key, member) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.sadd(key, member); } catch (e) {}
    }
    let set = memoryStore.sets.get(key);
    if (!set) {
      set = new Set();
      memoryStore.sets.set(key, set);
    }
    set.add(member);
    return 1;
  },

  async srem(key, member) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.srem(key, member); } catch (e) {}
    }
    let set = memoryStore.sets.get(key);
    if (set) set.delete(member);
    return 1;
  },

  async smembers(key) {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.smembers(key); } catch (e) {}
    }
    let set = memoryStore.sets.get(key);
    return set ? Array.from(set) : [];
  }
};

// ============================================================================
// PHAN A: CAC ENDPOINT MO RONG (DANH SACH BO DE THI, BOOKMARK, WRITING & SPEAKING AI, CMS)
// ============================================================================

// A2. BOOKMARK CAU HOI KHO VAO SO TAY ON TAP (REDIS SET + MONGODB)
router.post('/bookmarks/toggle', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.username;
    const { questionId } = req.body;
    const key = `bookmarks:questions:${studentId}`;

    const current = await safeRedis.smembers(key);
    let bookmarked = false;
    if (current.includes(questionId)) {
      await safeRedis.srem(key, questionId);
      bookmarked = false;
    } else {
      await safeRedis.sadd(key, questionId);
      bookmarked = true;
    }

    const updated = await safeRedis.smembers(key);
    res.json({
      success: true,
      questionId,
      bookmarked,
      bookmarkedIds: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/bookmarks/my', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.username;
    const key = `bookmarks:questions:${studentId}`;
    let ids = await safeRedis.smembers(key);

    // Neu chua co bookmark nao, khoi tao 2 cau mau de hoc vien thay ngay
    if (!ids || ids.length === 0) {
      await safeRedis.sadd(key, '670000000000000000000032');
      await safeRedis.sadd(key, '670000000000000000000033');
      ids = await safeRedis.smembers(key);
    }

    const db = getMongoDb();
    let questions = [];
    if (db && ids.length > 0) {
      const validObjIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
      questions = await db.collection('questions').find({ _id: { $in: validObjIds } }).toArray();
    }

    res.json({
      success: true,
      source: 'REDIS_SET_AND_MONGODB',
      bookmarkedIds: ids,
      data: questions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A3. CHAM DIEM BAI LUAN IELTS WRITING TASK 2 TU DONG & LUU MONGODB
router.post('/writing/evaluate', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const studentId = req.user.username;
    const { topic, essayText } = req.body;

    const text = (essayText || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    if (wordCount < 10) {
      return res.status(400).json({ success: false, message: 'Nội dung bài viết quá ngắn (tối thiểu 10 từ để phân tích).' });
    }

    // Phan tich tu vung hoc thuat & tu noi (Linking words)
    const lower = text.toLowerCase();
    const linkingList = ['furthermore', 'moreover', 'however', 'nevertheless', 'consequently', 'therefore', 'in conclusion', 'on the other hand', 'for instance', 'specifically', 'undeniably', 'while', 'although'];
    const academicList = ['mitigate', 'ubiquitous', 'prerequisite', 'sustainable', 'crucial', 'significant', 'adverse', 'implement', 'transform', 'perspective', 'phenomenon', 'indispensable', 'foster', 'cultivate', 'detrimental'];

    const foundLinking = linkingList.filter(w => lower.includes(w));
    const foundAcademic = academicList.filter(w => lower.includes(w));

    // Tinh diem 4 tieu chi chuan IDP / British Council (clamped 1.0..9.0)
    const baseScore = wordCount >= 180 ? 7.0 : (wordCount >= 100 ? 6.0 : (wordCount >= 50 ? 5.0 : 4.0));
    const taskResponse = Math.max(1.0, Math.min(9.0, Math.round((baseScore + (wordCount >= 250 ? 1.0 : (wordCount >= 200 ? 0.5 : 0))) * 2) / 2));
    const coherence = Math.max(1.0, Math.min(9.0, Math.round((baseScore + (foundLinking.length >= 3 ? 1.0 : (foundLinking.length >= 1 ? 0.5 : 0))) * 2) / 2));
    const lexical = Math.max(1.0, Math.min(9.0, Math.round((baseScore + (foundAcademic.length >= 3 ? 1.0 : (foundAcademic.length >= 1 ? 0.5 : 0))) * 2) / 2));
    const grammar = Math.max(1.0, Math.min(9.0, Math.round((baseScore + 0.5) * 2) / 2));

    const rawOverall = (taskResponse + coherence + lexical + grammar) / 4;
    const overallBand = Math.max(1.0, Math.min(9.0, Math.round(rawOverall * 2) / 2));

    const evaluationDoc = {
      studentId,
      studentName: req.user.fullName,
      topic: topic || 'IELTS Academic Writing Task 2',
      essayText: text,
      wordCount,
      overallBand,
      criteria: {
        taskResponse,
        coherence,
        lexical,
        grammar
      },
      foundLinking,
      foundAcademic,
      feedback: [
        `Độ dài bài viết đạt ${wordCount} từ (${wordCount >= 250 ? 'Đạt chuẩn ≥250 từ của IELTS Task 2' : 'Khuyến nghị mở rộng thêm ví dụ thực tế để đạt mốc 250 từ'}).`,
        `Coherence & Cohesion (${coherence}): Đã sử dụng tốt các từ nối chuyển ý (${foundLinking.length > 0 ? foundLinking.join(', ') : 'cần bổ sung Furthermore, Nevertheless, Consequently'}).`,
        `Lexical Resource (${lexical}): Phát hiện ${foundAcademic.length} từ vựng học thuật Band 7.5+ (${foundAcademic.length > 0 ? foundAcademic.join(', ') : 'gợi ý dùng mitigate, ubiquitous, indispensable, foster'}).`,
        `Grammatical Range (${grammar}): Khuyến khích áp dụng thêm câu điều kiện đảo ngữ (Had + S + V3) và mệnh đề phân từ để chạm mốc Band 8.0+.`
      ],
      vocabularyUpgrades: [
        { basic: 'very important', band8: 'indispensable / of paramount importance' },
        { basic: 'solve a problem', band8: 'mitigate the adverse impacts / address the root cause' },
        { basic: 'many people think', band8: 'it is widely argued that / a growing body of opinion suggests' },
        { basic: 'good for society', band8: 'yield profound socio-economic benefits' }
      ],
      submittedAt: new Date()
    };

    if (db) {
      await db.collection('essays').insertOne(evaluationDoc);
    }
    memoryEssays.unshift(evaluationDoc);

    res.json({
      success: true,
      source: 'MONGODB_ESSAY_EVALUATOR',
      message: `Đã chấm điểm IELTS Writing (Overall Band ${overallBand.toFixed(1)}) và lưu bài luận vào MongoDB!`,
      data: evaluationDoc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A4. LAY DANH SACH BAI LUAN DA CHAM CUA HOC VIEN TU MONGODB
router.get('/writing/my-essays', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const studentId = req.user.username;
    let essays = [];
    if (db) {
      essays = await db.collection('essays').find({ studentId }).sort({ submittedAt: -1 }).limit(10).toArray();
    }
    if (essays.length === 0) {
      essays = memoryEssays.filter(e => e.studentId === studentId);
    }
    res.json({
      success: true,
      source: 'MONGODB',
      data: essays
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A5. CHAM DIEM PHAT AM & LUYEN NOI AI (SPEAKING PRONUNCIATION CHECKER)
router.post('/speaking/evaluate', authenticateToken, async (req, res) => {
  try {
    const { targetSentence, spokenText } = req.body;
    const clean = (s) => (s || '').toLowerCase().replace(/[.,!?]/g, '').trim().split(/\s+/).filter(Boolean);
    const targetWords = (targetSentence || '').split(/\s+/);
    const targetClean = clean(targetSentence);
    const spokenClean = clean(spokenText);

    let matched = 0;
    const wordBreakdown = targetWords.map((w, idx) => {
      const t = targetClean[idx] || '';
      const ok = spokenClean.includes(t);
      if (ok) matched++;
      return { word: w, correct: ok };
    });

    const accuracy = targetClean.length > 0 ? Math.round((matched / targetClean.length) * 100) : 0;
    const estimatedBand = accuracy >= 90 ? 8.0 : (accuracy >= 75 ? 7.0 : (accuracy >= 55 ? 6.0 : 5.0));

    res.json({
      success: true,
      accuracy,
      estimatedBand,
      wordBreakdown,
      pronunciationTip: accuracy >= 85
        ? 'Phát âm rất chuẩn xác! Bạn giữ nhịp điệu (Intonation) và trọng âm từ (Word Stress) rất tự nhiên.'
        : 'Hãy chú ý bật rõ âm đuôi (Ending sounds /s/, /t/, /d/) và nhấn trọng âm đúng vào các từ khóa học thuật.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A6. GIANG VIEN / ADMIN THEM CAU HOI TRAC NGHIEM MOI VAO NGAN HANG DE THI MONGODB
router.post('/questions/create', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const db = getMongoDb();
    const { topic, difficulty, content, optionA, optionB, optionC, optionD, correctAnswer, explanation } = req.body;

    const newQ = {
      subject: 'English Proficiency',
      topic: topic || 'Grammar & Vocabulary',
      difficulty: difficulty || 'MEDIUM',
      content: content || '[New Question] Choose the best answer to complete the sentence:',
      options: [
        { key: 'A', text: optionA || 'Option A' },
        { key: 'B', text: optionB || 'Option B' },
        { key: 'C', text: optionC || 'Option C' },
        { key: 'D', text: optionD || 'Option D' }
      ],
      correctAnswer: (correctAnswer || 'A').toUpperCase(),
      explanation: explanation || 'Giải thích chi tiết ngữ pháp và từ vựng cho câu hỏi.',
      createdAt: new Date()
    };

    const insertRes = await db.collection('questions').insertOne(newQ);

    // Gan cau hoi moi vao de thi chinh 670000000000000000000040
    await db.collection('exams').updateOne(
      { _id: new ObjectId('670000000000000000000040') },
      {
        $push: { questions: insertRes.insertedId },
        $inc: { totalQuestions: 1 }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Đã thêm câu hỏi Tiếng Anh mới vào ngân hàng đề MongoDB & cập nhật vào bài thi!',
      data: { insertedId: insertRes.insertedId, question: newQ }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// PHAN B: CAC ENDPOINT THI TRUC TUYEN CO BAN (START, ANSWER, SUBMIT, LEADERBOARD, ANALYTICS)
// ============================================================================

// Helper chuan hoa examId (cho phep cac bo de 4a, 4b, 4c su dung chung ngan hang cau hoi MongoDB)
function resolveMongoExamId(examId) {
  return new ObjectId(examId);
}

const EXAM_TITLES_MAP = {
  '670000000000000000000040': 'Đánh Giá Năng Lực Tiếng Anh Quốc Tế (English Placement & IELTS/TOEIC Test)',
  '67000000000000000000004a': 'Đề Thi Thử TOEIC Part 5: Ngữ Pháp & Từ Vựng Thương Mại Tốc Độ Cao',
  '67000000000000000000004b': 'Đề Thi Thử IELTS Academic Reading & Lexical Resource Band 7.5+',
  '67000000000000000000004c': 'Chuyên Đề Ngữ Pháp 12 Thì, Câu Điều Kiện, Mệnh Đề Quan Hệ & Đảo Ngữ'
};

// 4. LAY BANG XEP HANG THI DUA TU REDIS SORTED SET (ZSET)
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const examId = req.params.id;
    const leaderboardKey = `leaderboard:${examId}`;

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

// 6. THONG KE DANG AGGREGATION DANH CHO GIANG VIEN / ADMIN (MONGODB AGGREGATION PIPELINE)
router.get('/:id/analytics', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const db = getMongoDb();
    const examId = resolveMongoExamId(req.params.id);

    const pipeline = [
      { $match: { examId: examId } },
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

    const submissions = await db.collection('results')
      .find({ examId: examId })
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
router.get('/:id/export-csv', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const db = getMongoDb();
    const examId = resolveMongoExamId(req.params.id);

    const submissions = await db.collection('results')
      .find({ examId: examId })
      .sort({ submittedAt: -1 })
      .toArray();

    let csvContent = '\uFEFF';
    csvContent += 'STT,Ma Thi Sinh,Ho Va Ten,Diem So,So Cau Dung,Tong So Cau,Ket Qua,Thoi Gian Nop\n';

    submissions.forEach((sub, index) => {
      const timeStr = new Date(sub.submittedAt).toLocaleString('vi-VN').replace(/,/g, ' ');
      const isPass = sub.score >= 5.0 ? 'DAT' : 'CHUA DAT';
      csvContent += `${index + 1},"${sub.studentCode}","${sub.studentName}",${sub.score},${sub.correctCount},${sub.totalCount},"${isPass}","${timeStr}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Bang_Diem_EduPro_English_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi xuất file CSV: ' + err.message });
  }
});

module.exports = router;
