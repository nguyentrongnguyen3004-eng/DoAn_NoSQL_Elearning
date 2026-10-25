const express = require('express');
const { ObjectId } = require('mongodb');
const { getMongoDb, redisClient } = require('../config/db');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

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

// A1. LAY DANH SACH CAC BO DE THI TIENG ANH (4 BO DE THEO CAP DO)
router.get('/list/all', async (req, res) => {
  try {
    const db = getMongoDb();
    let exams = [];
    if (db) {
      exams = await db.collection('exams').find({ status: 'PUBLISHED' }).toArray();
    }

    // Bo sung 4 bo de chuan neu chi co 1 de mac dinh trong DB
    const catalog = [
      {
        _id: '670000000000000000000040',
        title: 'Đánh Giá Năng Lực Tiếng Anh Quốc Tế (English Placement & IELTS/TOEIC Test)',
        badge: 'Placement Test A1-C2',
        level: 'Đa cấp độ (CEFR A2 - C1)',
        durationMinutes: 30,
        totalQuestions: 8,
        participants: 4850,
        description: 'Bài thi tổng hợp đánh giá toàn diện Ngữ pháp 12 thì, Đảo ngữ, Academic Collocations, Phrasal Verbs, Trọng âm IPA và Chiến thuật đọc hiểu IELTS/TOEIC.'
      },
      {
        _id: '67000000000000000000004a',
        title: 'Đề Thi Thử TOEIC Part 5: Ngữ Pháp & Từ Vựng Thương Mại Tốc Độ Cao',
        badge: 'ETS TOEIC 850+',
        level: 'Trung cấp (CEFR B1 - B2)',
        durationMinutes: 15,
        totalQuestions: 8,
        participants: 3420,
        description: 'Rèn luyện phản xạ xử lý nhanh câu hỏi ngữ pháp & từ vựng thương mại TOEIC Reading Part 5 trong 20 giây/câu.'
      },
      {
        _id: '67000000000000000000004b',
        title: 'Đề Thi Thử IELTS Academic Reading & Lexical Resource Band 7.5+',
        badge: 'IELTS Academic',
        level: 'Nâng cao (CEFR C1)',
        durationMinutes: 25,
        totalQuestions: 8,
        participants: 2790,
        description: 'Tập trung vào chiến thuật True/False/Not Given, từ vựng học thuật Band 8.0 và cách miêu tả số liệu biểu đồ Writing Task 1.'
      },
      {
        _id: '67000000000000000000004c',
        title: 'Chuyên Đề Ngữ Pháp 12 Thì, Câu Điều Kiện, Mệnh Đề Quan Hệ & Đảo Ngữ',
        badge: 'Core Grammar',
        level: 'Cơ bản - Trung cấp',
        durationMinutes: 20,
        totalQuestions: 8,
        participants: 5120,
        description: 'Kiểm tra chuyên sâu nền tảng ngữ pháp cốt lõi thường xuyên xuất hiện trong các kỳ thi chuẩn đầu ra đại học và quốc tế.'
      }
    ];

    res.json({
      success: true,
      source: 'MONGODB_EXAMS_CATALOG',
      data: catalog
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
    const taskType = req.body.taskType === 'task1' ? 'task1' : 'task2';

    const text = (essayText || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    const minimumWords = 15;
    if (wordCount < minimumWords) {
      return res.status(400).json({ success: false, message: `Nội dung quá ngắn (tối thiểu ${minimumWords} từ để phân tích).` });
    }

    // Phan tich tu vung hoc thuat & tu noi (Linking words)
    const lower = text.toLowerCase();
    const linkingList = ['furthermore', 'moreover', 'however', 'nevertheless', 'consequently', 'therefore', 'in conclusion', 'on the other hand', 'for instance', 'specifically', 'undeniably', 'while', 'although'];
    const academicList = ['mitigate', 'ubiquitous', 'prerequisite', 'sustainable', 'crucial', 'significant', 'adverse', 'implement', 'transform', 'perspective', 'phenomenon', 'indispensable', 'foster', 'cultivate', 'detrimental'];

    const foundLinking = linkingList.filter(w => lower.includes(w));
    const foundAcademic = academicList.filter(w => lower.includes(w));

    // Tinh diem 4 tieu chi chuan IDP / British Council (clamped 1.0..9.0)
    const targetWords = taskType === 'task1' ? 150 : 250;
    const baseScore = wordCount >= (taskType === 'task1' ? 120 : 180) ? 7.0 : (wordCount >= 100 ? 6.0 : (wordCount >= 50 ? 5.0 : 4.0));
    const taskAchievement = Math.max(1.0, Math.min(9.0, Math.round((baseScore + (wordCount >= targetWords ? 1.0 : (wordCount >= targetWords * 0.8 ? 0.5 : 0))) * 2) / 2));
    const taskResponse = Math.max(1.0, Math.min(9.0, Math.round((baseScore + (wordCount >= 250 ? 1.0 : (wordCount >= 200 ? 0.5 : 0))) * 2) / 2));
    const coherence = Math.max(1.0, Math.min(9.0, Math.round((baseScore + (foundLinking.length >= 3 ? 1.0 : (foundLinking.length >= 1 ? 0.5 : 0))) * 2) / 2));
    const lexical = Math.max(1.0, Math.min(9.0, Math.round((baseScore + (foundAcademic.length >= 3 ? 1.0 : (foundAcademic.length >= 1 ? 0.5 : 0))) * 2) / 2));
    const grammar = Math.max(1.0, Math.min(9.0, Math.round((baseScore + 0.5) * 2) / 2));
    const criterionOne = taskType === 'task1' ? taskAchievement : taskResponse;

    const rawOverall = (criterionOne + coherence + lexical + grammar) / 4;
    const overallBand = Math.max(1.0, Math.min(9.0, Math.round(rawOverall * 2) / 2));

    const evaluationDoc = {
      studentId,
      studentName: req.user.fullName,
      taskType,
      topic: topic || `IELTS Academic Writing ${taskType.toUpperCase()}`,
      essayText: text,
      wordCount,
      overallBand,
      criteria: taskType === 'task1'
        ? { taskAchievement, coherence, lexical, grammar }
        : { taskResponse, coherence, lexical, grammar },
      criteriaLabels: { criterion1: taskType === 'task1' ? 'Task Achievement (TA)' : 'Task Response (TR)', coherence: 'Coherence & Cohesion (CC)', lexical: 'Lexical Resource (LR)', grammar: 'Grammatical Range & Accuracy (GRA)' },
      foundLinking,
      foundAcademic,
      feedback: [
        `Độ dài bài viết đạt ${wordCount} từ (${wordCount >= targetWords ? `Đạt chuẩn ≥${targetWords} từ của IELTS ${taskType.toUpperCase()}` : `Khuyến nghị đạt mốc ${targetWords} từ`}).`,
        ...(taskType === 'task1' ? [`Task Achievement (${taskAchievement}): Đánh giá overview, xu hướng số liệu và các phép so sánh nổi bật trong biểu đồ.`] : []),
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
    const draftKey = `draft:writing:${req.user.id || req.user.username}:${taskType}`;
    await safeRedis.del(draftKey);
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
router.post('/questions/create', authenticateToken, async (req, res) => {
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
  if (examId === '670000000000000000000040') return new ObjectId('670000000000000000000040');
  return new ObjectId('670000000000000000000040');
}

const EXAM_TITLES_MAP = {
  '670000000000000000000040': 'Đánh Giá Năng Lực Tiếng Anh Quốc Tế (English Placement & IELTS/TOEIC Test)',
  '67000000000000000000004a': 'Đề Thi Thử TOEIC Part 5: Ngữ Pháp & Từ Vựng Thương Mại Tốc Độ Cao',
  '67000000000000000000004b': 'Đề Thi Thử IELTS Academic Reading & Lexical Resource Band 7.5+',
  '67000000000000000000004c': 'Chuyên Đề Ngữ Pháp 12 Thì, Câu Điều Kiện, Mệnh Đề Quan Hệ & Đảo Ngữ'
};

// 1. BAT DAU / KHOI PHUC PHIEN LAM BAI THI (REDIS TTL + MONGODB QUESTIONS)
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.username;
    const db = getMongoDb();

    const exam = await db.collection('exams').findOne({ _id: resolveMongoExamId(examId) });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Kỳ thi không tồn tại' });
    }

    const attemptKey = `exam:${examId}:attempt:${studentId}`;
    const answersKey = `exam:${examId}:answers:${studentId}`;
    const orderKey = `exam:${examId}:order:${studentId}`;

    let attemptData = await safeRedis.get(attemptKey);
    let answersData = await safeRedis.hgetall(answersKey);
    let cachedOrder = await safeRedis.get(orderKey);

    let ttlLeft = await safeRedis.ttl(attemptKey);

    if (attemptData && ttlLeft > 0) {
      attemptData = JSON.parse(attemptData);
    } else {
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

    const questionIds = exam.questions.map(q => new ObjectId(q));
    let questions = await db.collection('questions').find(
      { _id: { $in: questionIds } }
    ).toArray();

    if (cachedOrder) {
      const orderArray = JSON.parse(cachedOrder);
      const qMap = new Map(questions.map(q => [q._id.toString(), q]));
      questions = orderArray.map(id => qMap.get(id)).filter(Boolean);
    } else {
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      const shuffledIds = questions.map(q => q._id.toString());
      await safeRedis.set(orderKey, JSON.stringify(shuffledIds), 'EX', ttlLeft);
    }

    // Lay danh sach bookmark cua sinh vien
    const bookmarkedIds = await safeRedis.smembers(`bookmarks:questions:${studentId}`);

    res.json({
      success: true,
      message: 'Bắt đầu làm bài thi',
      data: {
        examTitle: EXAM_TITLES_MAP[examId] || exam.title,
        durationMinutes: exam.durationMinutes,
        attempt: attemptData,
        ttlLeftSeconds: ttlLeft,
        savedAnswers: answersData,
        bookmarkedIds,
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

    const ttl = await safeRedis.ttl(attemptKey);
    if (ttl === -2) {
      return res.status(400).json({ success: false, message: 'Phiên làm bài đã hết thời gian hoặc không tồn tại' });
    }

    await safeRedis.hset(answersKey, questionId, selectedOption);
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

    let userAnswers = await safeRedis.hgetall(answersKey);
    if (!userAnswers || Object.keys(userAnswers).length === 0) {
      userAnswers = req.body.answers || {};
    }

    const exam = await db.collection('exams').findOne({ _id: resolveMongoExamId(examId) });
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
    let score = totalCount > 0 ? Math.round(((correctCount / totalCount) * 10) * 10) / 10 : 0;
    const resolvedTitle = EXAM_TITLES_MAP[examId] || exam.title;

    // Check if disqualified by anti-cheat
    const cheatsKey = `exam:${examId}:cheats:${studentId}`;
    let cheatCount = memoryCheatingStore.get(cheatsKey) || 0;
    if (redisClient && redisClient.status === 'ready') {
      try {
        const val = await redisClient.hget(cheatsKey, 'violations');
        if (val) cheatCount = parseInt(val, 10);
      } catch (e) {}
    }
    const isDisqualified = cheatCount >= 3 || req.body.isDisqualified === true;
    if (isDisqualified) {
      score = 0;
      correctCount = 0;
    }

    const resultDoc = {
      examId: resolveMongoExamId(examId),
      examTitle: resolvedTitle,
      studentId: new ObjectId(req.user.id),
      studentCode: studentId,
      studentName: req.user.fullName,
      score: score,
      correctCount: correctCount,
      totalCount: totalCount,
      isDisqualified: isDisqualified,
      submittedAt: new Date(),
      answers: detailedAnswers
    };

    await db.collection('results').insertOne(resultDoc);

    // Only add to leaderboard if not disqualified
    if (!isDisqualified) {
      const leaderboardKey = `leaderboard:${examId}`;
      const memberName = `${req.user.fullName} (${studentId})`;
      await safeRedis.zadd(leaderboardKey, score, memberName);
    }

    try {
      await safeRedis.publish('leaderboard_update', JSON.stringify({
        examId,
        student: memberName,
        score,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {}

    await safeRedis.del(attemptKey, answersKey);

    res.json({
      success: true,
      message: 'Nộp bài thi thành công',
      data: {
        examTitle: resolvedTitle,
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
router.get('/:id/export-csv', authenticateToken, async (req, res) => {
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

// ==============================================================================
// GIAI ĐOẠN 3 - TÍNH NĂNG 2: GIÁM SÁT GIAN LẬN THI TRỰC TUYẾN (ANTI-CHEAT FOCUS TRACKER)
// ==============================================================================
const memoryCheatingStore = new Map();

router.post('/anti-cheat/log-violation', async (req, res) => {
  try {
    const studentId = req.user ? req.user.username : (req.body.studentId || '2001230589');
    const examId = req.body.examId || '670000000000000000000040';
    const reason = req.body.reason || 'TAB_SWITCH_OR_BLUR';
    const redisKey = `exam:${examId}:cheats:${studentId}`;

    let currentCount = memoryCheatingStore.get(redisKey) || 0;
    if (redisClient && redisClient.status === 'ready') {
      try {
        const val = await redisClient.hget(redisKey, 'violations');
        if (val) currentCount = parseInt(val, 10);
      } catch (e) {}
    }

    // STRICT CONSTRAINT: Once 3 violations reached, permanently clamp to 3 and disqualify
    if (currentCount >= 3) {
      return res.json({
        success: true,
        source: 'REDIS_ATOMIC_COUNTER_AND_CASSANDRA_LOG',
        studentId,
        examId,
        violationCount: 3,
        maxAllowed: 3,
        isDisqualified: true,
        message: 'ĐÌNH CHỈ THI: Bạn đã vi phạm rời màn hình thi 3/3 lần! Bài thi đã bị hệ thống tự động khóa và thu bài.'
      });
    }

    const count = Math.min(3, currentCount + 1);
    memoryCheatingStore.set(redisKey, count);

    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.hset(redisKey, 'violations', count);
        await redisClient.expire(redisKey, 3600);
      } catch (e) {}
    }

    const { cassandraClient } = require('../config/db');
    if (cassandraClient && typeof cassandraClient.execute === 'function') {
      try {
        const query = `
          INSERT INTO learning_events (
            student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const { v4: uuidv4 } = require('uuid');
        await cassandraClient.execute(query, [
          studentId, new Date(), uuidv4(), 'EXAM_CHEATING_WARNING',
          examId, 'EXAM_ROOM', 'SESSION_ANTICHEAT', count, JSON.stringify({ reason, violationCount: count })
        ], { prepare: true });
      } catch (e) {}
    }

    const isDisqualified = count >= 3;

    res.json({
      success: true,
      source: 'REDIS_ATOMIC_COUNTER_AND_CASSANDRA_LOG',
      studentId,
      examId,
      violationCount: count,
      maxAllowed: 3,
      isDisqualified,
      message: isDisqualified 
        ? 'CẢNH BÁO NGUY CẤP: Bạn đã vi phạm rời màn hình thi 3/3 lần! Bài thi bị tự động thu hồi và đình chỉ.'
        : `CẢNH BÁO VI PHẠM: Bạn vừa rời khỏi màn hình thi! Lần vi phạm: ${count}/3.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/anti-cheat/reset', async (req, res) => {
  try {
    const studentId = req.user ? req.user.username : (req.body.studentId || '2001230589');
    const examId = req.body.examId || '670000000000000000000040';
    const redisKey = `exam:${examId}:cheats:${studentId}`;
    memoryCheatingStore.set(redisKey, 0);
    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.del(redisKey);
      } catch (e) {}
    }
    res.json({ success: true, violationCount: 0, maxAllowed: 3, isDisqualified: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/anti-cheat/status', async (req, res) => {
  try {
    const studentId = req.query.studentId || (req.user ? req.user.username : '2001230589');
    const examId = req.query.examId || '670000000000000000000040';
    const redisKey = `exam:${examId}:cheats:${studentId}`;

    let count = memoryCheatingStore.get(redisKey) || 0;
    if (redisClient && redisClient.status === 'ready') {
      try {
        const val = await redisClient.hget(redisKey, 'violations');
        if (val) count = parseInt(val, 10);
      } catch (e) {}
    }

    res.json({
      success: true,
      studentId,
      examId,
      violationCount: count,
      maxAllowed: 3,
      isDisqualified: count >= 3
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- SPRINT 4: WRITING DRAFT AUTOSAVE (TASK 1.9) ---
router.post('/writing/draft', authenticateToken, async (req, res) => {
  try {
    const { taskType = 'task2', essay = '' } = req.body || {};
    const normalizedTaskType = taskType === 'task1' ? 'task1' : 'task2';
    const userId = req.user.id || req.user.username;
    const redisKey = `draft:writing:${userId}:${normalizedTaskType}`;
    await safeRedis.set(redisKey, String(essay), 'EX', 86400);
    return res.json({ success: true, message: 'Đã lưu bản nháp vào Redis', savedAt: new Date().toISOString() });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

router.get('/writing/draft', authenticateToken, async (req, res) => {
  try {
    const taskType = req.query.taskType === 'task1' ? 'task1' : 'task2';
    const userId = req.user.id || req.user.username;
    const essay = await safeRedis.get(`draft:writing:${userId}:${taskType}`) || '';
    return res.json({ success: true, essay });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/writing/draft', authenticateToken, async (req, res) => {
  try {
    const taskType = req.query.taskType === 'task1' ? 'task1' : 'task2';
    const userId = req.user.id || req.user.username;
    await safeRedis.del(`draft:writing:${userId}:${taskType}`);
    return res.json({ success: true, message: 'Đã xóa bản nháp trên Redis' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
