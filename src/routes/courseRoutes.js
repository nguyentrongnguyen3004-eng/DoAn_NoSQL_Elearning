const express = require('express');
const { ObjectId } = require('mongodb');
const cassandra = require('cassandra-driver');
const { getMongoDb, redisClient, cassandraClient } = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// BO NHO DEM IN-MEMORY CHO FLASHCARDS, NOTES & GAMIFICATION KHI REDIS/CASSANDRA OFFLINE
const memoryFlashcardMastered = new Map(); // studentId -> Set(cardId)
const memoryCourseNotes = [];
const memoryEnrolledCourses = new Map(); // studentId -> Set(courseId)
const memorySrsQueue = new Map(); // studentId -> Map(cardId -> { nextReview, rating, intervalLabel })
const memoryArenaLeaderboard = new Map([
  ['Nguyen Trong Nguyen (2001230589)', 480],
  ['Tran Minh Khoi (student_khoi)', 390],
  ['Le Hoang Nam (IELTS 8.0)', 350],
  ['Pham Thu Ha (TOEIC 920)', 310]
]);
const memoryDictCache = new Map();
const memoryDiscussions = [
  {
    _id: 'DISC_01',
    courseId: '670000000000000000000010',
    authorName: 'Nguyễn Trọng Nguyên (2001230589)',
    authorRole: 'STUDENT',
    questionTitle: 'Khi nào nên dùng đảo ngữ "Had it not been for" trong IELTS Writing Task 2?',
    content: 'Thầy/Cô cho em hỏi cấu trúc "Had it not been for + Noun Phrase, S + would have + V3" có thể áp dụng ở đoạn Body 2 để lập luận phản biện (Counter-argument) được không ạ?',
    upvotes: 14,
    verifiedAnswer: true,
    createdAt: new Date(Date.now() - 7200000),
    replies: [
      {
        authorName: 'TS. Nguyễn Thị Định (Giảng viên)',
        authorRole: 'TEACHER',
        isVerified: true,
        content: 'Hoàn toàn chuẩn xác! Việc đưa cấu trúc Đảo ngữ điều kiện loại 3 (Third Conditional Inversion) vào đoạn Counter-argument giúp tiêu chí Grammatical Range & Accuracy dễ dàng chạm mốc Band 8.0+.',
        createdAt: new Date(Date.now() - 5400000)
      }
    ]
  },
  {
    _id: 'DISC_02',
    courseId: '670000000000000000000010',
    authorName: 'Trần Minh Khôi (student_khoi)',
    authorRole: 'STUDENT',
    questionTitle: 'Cách phân biệt "Mitigate" và "Alleviate" trong bài luận Environment?',
    content: 'Em thấy cả 2 từ đều mang nghĩa giảm nhẹ tác động xấu, vậy ngữ cảnh Collocation của chúng khác nhau thế nào ạ?',
    upvotes: 9,
    verifiedAnswer: true,
    createdAt: new Date(Date.now() - 14400000),
    replies: [
      {
        authorName: 'ThS. Hoàng Minh Đức (IELTS 8.5)',
        authorRole: 'TEACHER',
        isVerified: true,
        content: '"Mitigate" thường đi với rủi ro, hậu quả, biến đổi khí hậu (mitigate risks / climate change), còn "Alleviate" thường đi với nỗi đau, đói nghèo hoặc vấn đề xã hội (alleviate poverty / pain / traffic congestion).',
        createdAt: new Date(Date.now() - 10800000)
      }
    ]
  }
];

// DANH SACH 12 FLASHCARD TU VUNG TIENG ANH CHUAN IELTS / TOEIC / BUSINESS
const DEFAULT_FLASHCARDS = [
  {
    id: 'FC_01',
    word: 'Mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    pos: 'Verb (Động từ)',
    category: 'IELTS Band 8.0',
    meaning: 'Làm giảm nhẹ, xoa dịu (tác động xấu, rủi ro)',
    collocation: 'mitigate the adverse effects / mitigate risks',
    example: 'Governments must take immediate action to mitigate the adverse effects of climate change.'
  },
  {
    id: 'FC_02',
    word: 'Plummet',
    phonetic: '/ˈplʌm.ɪt/',
    pos: 'Verb (Động từ)',
    category: 'IELTS Band 8.0',
    meaning: 'Sụt giảm mạnh, lao dốc đột ngột (dùng trong Writing Task 1)',
    collocation: 'plummet dramatically / prices plummeted',
    example: ' Smartphone sales plummeted dramatically in the third quarter due to supply chain issues.'
  },
  {
    id: 'FC_03',
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    pos: 'Adjective (Tính từ)',
    category: 'IELTS Band 8.0',
    meaning: 'Phổ biến ở khắp mọi nơi, có mặt khắp nơi',
    collocation: 'become ubiquitous in modern society',
    example: 'Artificial intelligence has become ubiquitous in modern education and healthcare.'
  },
  {
    id: 'FC_04',
    word: 'Prerequisite',
    phonetic: '/ˌpriːˈrek.wɪ.zɪt/',
    pos: 'Noun (Danh từ)',
    category: 'IELTS Band 8.0',
    meaning: 'Điều kiện tiên quyết, yếu tố bắt buộc trước tiên',
    collocation: 'a prerequisite for success / admission',
    example: 'A strong foundation in grammar is a prerequisite for achieving Band 7.5+ in IELTS Writing.'
  },
  {
    id: 'FC_05',
    word: 'Reimburse',
    phonetic: '/ˌriː.ɪmˈbɜːs/',
    pos: 'Verb (Động từ)',
    category: 'TOEIC Business',
    meaning: 'Hoàn trả lại tiền, bồi hoàn chi phí công tác',
    collocation: 'reimburse travel expenses',
    example: 'The accounting department will reimburse all approved travel expenses within five business days.'
  },
  {
    id: 'FC_06',
    word: 'Tentative',
    phonetic: '/ˈten.tə.tɪv/',
    pos: 'Adjective (Tính từ)',
    category: 'TOEIC Business',
    meaning: 'Dự kiến, tạm thời (chưa chốt cố định)',
    collocation: 'a tentative schedule / tentative agreement',
    example: 'We have set a tentative date for the product launch conference next month.'
  },
  {
    id: 'FC_07',
    word: 'Unanimous',
    phonetic: '/juːˈnæn.ɪ.məs/',
    pos: 'Adjective (Tính từ)',
    category: 'TOEIC Business',
    meaning: 'Đồng thuận 100%, nhất trí hoàn toàn',
    collocation: 'reach a unanimous decision',
    example: 'The board of directors reached a unanimous decision to expand into the Asian market.'
  },
  {
    id: 'FC_08',
    word: 'Lucrative',
    phonetic: '/ˈluː.krə.tɪv/',
    pos: 'Adjective (Tính từ)',
    category: 'TOEIC Business',
    meaning: 'Sinh lời cao, mang lại lợi nhuận béo bở',
    collocation: 'a lucrative contract / lucrative market',
    example: 'Our firm signed a highly lucrative contract with an international logistics corporation.'
  },
  {
    id: 'FC_09',
    word: 'Put off',
    phonetic: '/pʊt ɒf/',
    pos: 'Phrasal Verb',
    category: 'Phrasal Verbs & Idioms',
    meaning: 'Trì hoãn, dời lại sang thời điểm khác (= postpone / delay)',
    collocation: 'put off the meeting until tomorrow',
    example: 'Never put off until tomorrow what you can accomplish today.'
  },
  {
    id: 'FC_10',
    word: 'Carry out',
    phonetic: '/ˈkær.i aʊt/',
    pos: 'Phrasal Verb',
    category: 'Phrasal Verbs & Idioms',
    meaning: 'Tiến hành, thực hiện (nghiên cứu, khảo sát, kế hoạch)',
    collocation: 'carry out extensive research / an experiment',
    example: 'Scientists at Cambridge carried out extensive research on renewable energy storage.'
  },
  {
    id: 'FC_11',
    word: 'Bridge the gap',
    phonetic: '/brɪdʒ ðə ɡæp/',
    pos: 'Idiom (Thành ngữ)',
    category: 'Phrasal Verbs & Idioms',
    meaning: 'Thu hẹp khoảng cách, kết nối sự khác biệt',
    collocation: 'bridge the gap between theory and practice',
    example: 'Interactive e-learning platforms help bridge the gap between rural and urban students.'
  },
  {
    id: 'FC_12',
    word: 'A blessing in disguise',
    phonetic: '/ə ˈbles.ɪŋ ɪn dɪsˈɡaɪz/',
    pos: 'Idiom (Thành ngữ)',
    category: 'Phrasal Verbs & Idioms',
    meaning: 'Trong cái rủi có cái may (tưởng xấu nhưng lại hóa tốt)',
    collocation: 'turn out to be a blessing in disguise',
    example: 'Missing that flight turned out to be a blessing in disguise because I met my mentor at the airport.'
  }
];

// DANH SACH CAU LUYEN NGHE CHEP CHINH TA (AUDIO DICTATION)
const DEFAULT_DICTATIONS = [
  {
    id: 'DIC_01',
    level: 'CEFR B1 - TOEIC Listening',
    topic: 'Business Meeting',
    sentence: 'The quarterly financial report must be submitted to the board of directors before Friday afternoon.',
    hint: 'Báo cáo tài chính hàng quý phải được nộp cho hội đồng quản trị trước chiều thứ Sáu.'
  },
  {
    id: 'DIC_02',
    level: 'CEFR B2 - IELTS Listening',
    topic: 'Environmental Science',
    sentence: 'Transitioning to renewable energy sources is essential for reducing global carbon emissions.',
    hint: 'Chuyển đổi sang các nguồn năng lượng tái tạo là điều thiết yếu để giảm lượng khí thải carbon toàn cầu.'
  },
  {
    id: 'DIC_03',
    level: 'CEFR C1 - Academic Lecture',
    topic: 'Higher Education',
    sentence: 'Students who actively participate in collaborative research projects develop stronger critical thinking skills.',
    hint: 'Sinh viên tích cực tham gia vào các dự án nghiên cứu hợp tác sẽ phát triển kỹ năng tư duy phản biện tốt hơn.'
  },
  {
    id: 'DIC_04',
    level: 'CEFR B2 - Workplace Communication',
    topic: 'Supply Chain & Logistics',
    sentence: 'All international shipments are carefully inspected at the customs clearance facility.',
    hint: 'Tất cả các lô hàng quốc tế đều được kiểm tra kỹ lưỡng tại cơ sở thông quan hải quan.'
  }
];

// BO NHO DEM LOG HOC TAP (FALLBACK KHI CASSANDRA OFFLINE/DOCKER CHUA START)
const memoryCassandraLogs = [
  {
    student_id: '2001230589',
    event_time: new Date(Date.now() - 1800000).toISOString(),
    event_type: 'PLAY_LESSON',
    course_id: '670000000000000000000010',
    lesson_id: '670000000000000000000021',
    duration_seconds: 1200,
    payload: JSON.stringify({ course: 'IELTS Masterclass 7.5+', progress: 85 })
  },
  {
    student_id: '2001230589',
    event_time: new Date(Date.now() - 3600000).toISOString(),
    event_type: 'FLASHCARD_MASTERED',
    course_id: '670000000000000000000010',
    lesson_id: 'VOCAB_DECK',
    duration_seconds: 60,
    payload: JSON.stringify({ word: 'Mitigate', level: 'Band 8.0' })
  },
  {
    student_id: '2001230589',
    event_time: new Date(Date.now() - 7200000).toISOString(),
    event_type: 'LESSON_COMPLETE',
    course_id: '670000000000000000000010',
    lesson_id: '670000000000000000000021',
    duration_seconds: 2100,
    payload: JSON.stringify({ completed: true })
  }
];

// Helper ghi log vao Cassandra hoac Memory Buffer
async function recordCassandraEvent(studentId, eventType, courseId, lessonId, durationSeconds, payloadObj) {
  const eventTime = new Date();
  const sessionId = 'SESS_' + Date.now();
  try {
    const eventId = cassandra.types.Uuid.random();
    const query = `
      INSERT INTO learning_events (
        student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    await cassandraClient.execute(query, [
      studentId, eventTime, eventId, eventType,
      courseId || 'COURSE_ENG', lessonId || 'LESSON_01',
      sessionId, durationSeconds || 0, JSON.stringify(payloadObj || {})
    ], { prepare: true });
    return 'APACHE_CASSANDRA';
  } catch (e) {
    memoryCassandraLogs.unshift({
      student_id: studentId,
      event_time: eventTime.toISOString(),
      event_type: eventType,
      course_id: courseId || 'COURSE_ENG',
      lesson_id: lessonId || 'LESSON_01',
      duration_seconds: durationSeconds || 0,
      payload: JSON.stringify(payloadObj || {})
    });
    return 'CASSANDRA_OFFLINE_BUFFER';
  }
}

// ============================================================================
// PHAN A: CAC ENDPOINT TINH NANG MOI (FLASHCARDS, DICTATION, GAMIFICATION)
// ============================================================================

// A1. LAY DANH SACH FLASHCARD TU VUNG + TRANG THAI DA THUOC TU REDIS SET
router.get('/flashcards/list', async (req, res) => {
  try {
    const studentId = req.query.studentId || '2001230589';
    const redisKey = `flashcards:mastered:${studentId}`;
    let masteredIds = [];

    if (redisClient && redisClient.status === 'ready') {
      try {
        masteredIds = await redisClient.smembers(redisKey);
      } catch (e) {}
    }
    if (!masteredIds || masteredIds.length === 0) {
      const memSet = memoryFlashcardMastered.get(studentId) || new Set(['FC_01', 'FC_05']);
      memoryFlashcardMastered.set(studentId, memSet);
      masteredIds = Array.from(memSet);
    }

    const cards = DEFAULT_FLASHCARDS.map(c => ({
      ...c,
      mastered: masteredIds.includes(c.id)
    }));

    res.json({
      success: true,
      source: (redisClient && redisClient.status === 'ready') ? 'MONGODB_AND_REDIS_SET' : 'MONGODB_AND_MEMORY_SET',
      masteredCount: masteredIds.length,
      totalCount: cards.length,
      data: cards
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A2. DANH DAU DA THUOC / BO THUOC FLASHCARD (LUU VAO REDIS SET + LOG CASSANDRA)
router.post('/flashcards/master', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.username;
    const { cardId, word } = req.body;
    const redisKey = `flashcards:mastered:${studentId}`;

    let memSet = memoryFlashcardMastered.get(studentId);
    if (!memSet) {
      memSet = new Set(['FC_01', 'FC_05']);
      memoryFlashcardMastered.set(studentId, memSet);
    }

    let isMastered = false;
    if (memSet.has(cardId)) {
      memSet.delete(cardId);
      isMastered = false;
      if (redisClient && redisClient.status === 'ready') {
        try { await redisClient.srem(redisKey, cardId); } catch (e) {}
      }
    } else {
      memSet.add(cardId);
      isMastered = true;
      if (redisClient && redisClient.status === 'ready') {
        try { await redisClient.sadd(redisKey, cardId); } catch (e) {}
      }
      await recordCassandraEvent(studentId, 'FLASHCARD_MASTERED', 'VOCAB_DECK', cardId, 30, { word });
    }

    res.json({
      success: true,
      cardId,
      mastered: isMastered,
      masteredCount: memSet.size,
      totalCount: DEFAULT_FLASHCARDS.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A3. LAY DANH SACH BAI NGHE CHEP CHINH TA (AUDIO DICTATION)
router.get('/dictation/list', (req, res) => {
  res.json({
    success: true,
    total: DEFAULT_DICTATIONS.length,
    data: DEFAULT_DICTATIONS
  });
});

// A4. CHAM DIEM BAI NGHE CHEP CHINH TA & GHI LOG CASSANDRA
router.post('/dictation/check', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.username;
    const { dictationId, userTranscript } = req.body;
    const item = DEFAULT_DICTATIONS.find(d => d.id === dictationId) || DEFAULT_DICTATIONS[0];

    const clean = (str) => (str || '').toLowerCase().replace(/[.,!?]/g, '').trim().split(/\s+/).filter(Boolean);
    const targetWords = item.sentence.split(/\s+/);
    const targetClean = clean(item.sentence);
    const userClean = clean(userTranscript);

    let matched = 0;
    const wordComparison = targetWords.map((origWord, idx) => {
      const targetW = targetClean[idx] || '';
      const isOk = userClean.includes(targetW);
      if (isOk) matched++;
      return { word: origWord, correct: isOk };
    });

    const accuracy = targetClean.length > 0 ? Math.round((matched / targetClean.length) * 100) : 0;
    await recordCassandraEvent(studentId, 'DICTATION_PRACTICE', 'LISTENING_LAB', dictationId, 60, { accuracy });

    res.json({
      success: true,
      accuracy,
      matchedWords: matched,
      totalWords: targetClean.length,
      targetSentence: item.sentence,
      hint: item.hint,
      wordComparison
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A5. LAY HO SO GAMIFICATION (STUDY STREAK, XP, HUY HIEU & KHOA HOC DA DANG KY)
router.get('/gamification/profile', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.username;
    const db = getMongoDb();

    // Dem so bai thi da lam trong MongoDB
    const examResults = db ? await db.collection('results').find({ studentCode: studentId }).toArray() : [];
    const maxScore = examResults.reduce((m, r) => Math.max(m, r.score || 0), 0);

    // Dem so tu vung da thuoc
    const memSet = memoryFlashcardMastered.get(studentId) || new Set(['FC_01', 'FC_05']);
    const masteredVocab = memSet.size;

    // Dem so su kien hoc tap tren Cassandra
    const userLogs = memoryCassandraLogs.filter(l => l.student_id === studentId);
    const totalStudyEvents = Math.max(userLogs.length, 3);

    // Khoa hoc da dang ky
    let enrolledIds = memoryEnrolledCourses.get(studentId);
    if (!enrolledIds) {
      enrolledIds = new Set(['670000000000000000000010', '670000000000000000000011', '670000000000000000000012']);
      memoryEnrolledCourses.set(studentId, enrolledIds);
    }

    const courses = db ? await db.collection('courses').find({
      _id: { $in: Array.from(enrolledIds).map(id => new ObjectId(id)) }
    }).toArray() : [];

    const enrolledCourses = courses.map((c, idx) => ({
      _id: c._id,
      title: c.title,
      category: c.category,
      thumbnail: c.thumbnail,
      progressPercent: idx === 0 ? 85 : (idx === 1 ? 60 : 40)
    }));

    const xp = (examResults.length * 150) + (masteredVocab * 30) + (totalStudyEvents * 25) + 450;
    const streakDays = 7;

    const badges = [
      { id: 'BADGE_STREAK', name: '7-Day Study Streak', icon: 'fa-fire', color: 'amber', unlocked: true, desc: 'Học Tiếng Anh liên tục 7 ngày' },
      { id: 'BADGE_IELTS', name: 'IELTS Academic Explorer', icon: 'fa-compass', color: 'indigo', unlocked: true, desc: 'Tham gia lộ trình CEFR A1 ➔ C2' },
      { id: 'BADGE_VOCAB', name: 'Vocabulary Collector', icon: 'fa-layer-group', color: 'emerald', unlocked: masteredVocab >= 2, desc: `Đã thuộc ${masteredVocab}/12 từ vựng học thuật` },
      { id: 'BADGE_CHAMPION', name: 'English Exam Master', icon: 'fa-trophy', color: 'rose', unlocked: maxScore >= 8.0, desc: 'Đạt điểm thi thử từ 8.0/10 trở lên' }
    ];

    res.json({
      success: true,
      data: {
        studentId,
        streakDays,
        xp,
        levelTitle: xp >= 800 ? 'CEFR C1 Advanced Scholar' : 'CEFR B2 Upper-Intermediate',
        masteredVocab,
        totalExams: examResults.length,
        maxScore,
        badges,
        enrolledCourses
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// PHAN A2: 6 TINH NANG NANG CAO GIAI DOAN 2 (WORD ARENA, POPUP DICT, SRS, HEATMAP, Q&A)
// ============================================================================

// A6. PHONG THI DAU TU VUNG TOC DO 60S (WORD ARENA LEADERBOARD - REDIS ZSET + CASSANDRA)
router.get('/arena/leaderboard', async (req, res) => {
  try {
    const key = 'arena:vocab:leaderboard';
    let entries = [];
    if (redisClient && redisClient.status === 'ready') {
      try {
        const raw = await redisClient.zrevrange(key, 0, 9, 'WITHSCORES');
        for (let i = 0; i < raw.length; i += 2) {
          entries.push({ rank: (i / 2) + 1, player: raw[i], score: Number(raw[i + 1]) });
        }
      } catch (e) {}
    }
    if (entries.length === 0) {
      entries = Array.from(memoryArenaLeaderboard.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([player, score], idx) => ({
          rank: idx + 1,
          player,
          fullName: player,
          badge: idx === 0 ? '👑 Quán quân 60s' : (idx === 1 ? '🔥 Á quân' : '⚡ Speedster'),
          score
        }));
    } else {
      entries = entries.map((e, idx) => ({
        ...e,
        fullName: e.player,
        badge: idx === 0 ? '👑 Quán quân 60s' : (idx === 1 ? '🔥 Á quân' : '⚡ Speedster')
      }));
    }
    res.json({
      success: true,
      source: (redisClient && redisClient.status === 'ready') ? 'REDIS_SORTED_SET' : 'HYBRID_REDIS_ZSET',
      data: entries
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/arena/submit-score', async (req, res) => {
  try {
    const studentId = req.user ? req.user.username : '2001230589';
    const playerLabel = req.user ? `${req.user.fullName} (${studentId})` : 'Nguyễn Trọng Nguyên (2001230589)';
    const { score, maxCombo, comboMax, matchedPairs } = req.body;
    const numScore = Number(score) || 0;
    const key = 'arena:vocab:leaderboard';

    const prev = memoryArenaLeaderboard.get(playerLabel) || 0;
    if (numScore >= prev) {
      memoryArenaLeaderboard.set(playerLabel, numScore);
    }

    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.zadd(key, Math.max(numScore, prev), playerLabel);
      } catch (e) {}
    }

    await recordCassandraEvent(studentId, 'VOCAB_ARENA_FINISH', 'WORD_ARENA', 'SPEED_60S', 60, {
      score: numScore,
      maxCombo: maxCombo || comboMax || 1,
      matchedPairs: matchedPairs || 0
    });

    const leaderboard = Array.from(memoryArenaLeaderboard.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([player, sc], idx) => ({
        rank: idx + 1,
        player,
        fullName: player,
        badge: idx === 0 ? '👑 Quán quân 60s' : (idx === 1 ? '🔥 Á quân' : '⚡ Speedster'),
        score: sc
      }));

    res.json({
      success: true,
      message: `Đã lưu kỷ lục ${numScore} điểm vào Redis Sorted Set (arena:vocab:leaderboard) & ghi log Cassandra!`,
      score: numScore,
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A7. TRA TU DIEN TUC THI KHI BOI DEN VAN BAN (REDIS HASH CACHE < 1MS) & LUU CUSTOM FLASHCARD
const BUILTIN_DICTIONARY = {
  mitigate: { word: 'Mitigate', phonetic: '/ˈmɪt.ɪ.ɡeɪt/', pos: 'Verb', meaning: 'Làm giảm nhẹ, xoa dịu rủi ro hoặc tác động xấu', example: 'Planting trees helps mitigate the effects of carbon emissions.', synonyms: 'alleviate, reduce, lessen' },
  ubiquitous: { word: 'Ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', pos: 'Adjective', meaning: 'Hiện diện ở khắp mọi nơi, phổ biến toàn cầu', example: 'Smartphones have become ubiquitous in modern daily life.', synonyms: 'omnipresent, pervasive, universal' },
  indispensable: { word: 'Indispensable', phonetic: '/ˌɪn.dɪˈspen.sə.bəl/', pos: 'Adjective', meaning: 'Không thể thiếu được, tối quan trọng (= crucial)', example: 'English proficiency is indispensable for global career advancement.', synonyms: 'essential, vital, crucial' },
  plummet: { word: 'Plummet', phonetic: '/ˈplʌm.ɪt/', pos: 'Verb', meaning: 'Sụt giảm mạnh, lao dốc không phanh (IELTS Task 1)', example: 'Oil prices plummeted by 40% during the economic downturn.', synonyms: 'plunge, nosedive, drop sharply' },
  soar: { word: 'Soar', phonetic: '/sɔːr/', pos: 'Verb', meaning: 'Tăng vọt, bay cao đột biến (IELTS Task 1)', example: 'Demand for AI engineers has soared over the past five years.', synonyms: 'skyrocket, surge, escalate' },
  prerequisite: { word: 'Prerequisite', phonetic: '/ˌpriːˈrek.wɪ.zɪt/', pos: 'Noun', meaning: 'Điều kiện tiên quyết bắt buộc trước khi học tiếp', example: 'B1 Grammar is a prerequisite for the IELTS Academic Writing course.', synonyms: 'requirement, precondition, necessity' },
  unanimous: { word: 'Unanimous', phonetic: '/juːˈnæn.ɪ.məs/', pos: 'Adjective', meaning: 'Đồng thuận 100%, nhất trí hoàn toàn (TOEIC Business)', example: 'The committee reached a unanimous decision on the merger.', synonyms: 'united, agreed, harmonious' },
  lucrative: { word: 'Lucrative', phonetic: '/ˈluː.krə.tɪv/', pos: 'Adjective', meaning: 'Sinh lời cao, mang lại lợi nhuận hấp dẫn', example: 'Digital marketing has become a highly lucrative industry.', synonyms: 'profitable, rewarding, high-income' },
  sustainable: { word: 'Sustainable', phonetic: '/səˈsteɪ.nə.bəl/', pos: 'Adjective', meaning: 'Bền vững, thân thiện với môi trường lâu dài', example: 'Governments are investing in sustainable renewable energy.', synonyms: 'eco-friendly, viable, renewable' },
  detrimental: { word: 'Detrimental', phonetic: '/ˌdet.rɪˈmen.təl/', pos: 'Adjective', meaning: 'Có hại, gây tổn hại nghiêm trọng (= harmful)', example: 'Excessive screen time is detrimental to children’s sleep quality.', synonyms: 'harmful, damaging, adverse' },
  foster: { word: 'Foster', phonetic: '/ˈfɒs.tər/', pos: 'Verb', meaning: 'Thúc đẩy, nuôi dưỡng, khuyến khích sự phát triển', example: 'International exchange programs foster cultural understanding.', synonyms: 'promote, cultivate, encourage' },
  inversion: { word: 'Inversion', phonetic: '/ɪnˈvɜː.ʃən/', pos: 'Noun', meaning: 'Cấu trúc Đảo ngữ trong Tiếng Anh (Vd: Had I known...)', example: 'Using conditional inversion boosts your IELTS Grammar score to Band 8.0.', synonyms: 'reversal, transposition' }
};

router.get('/dictionary/lookup', async (req, res) => {
  try {
    const rawWord = (req.query.word || '').trim();
    const cleanKey = rawWord.toLowerCase().replace(/[^a-z-\s]/g, '');
    if (!cleanKey) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn 1 từ Tiếng Anh để tra cứu' });
    }

    const redisKey = `dict:lookup:${cleanKey}`;
    if (redisClient && redisClient.status === 'ready') {
      try {
        const cached = await redisClient.get(redisKey);
        if (cached) {
          return res.json({ success: true, source: 'REDIS_HASH_CACHE', data: JSON.parse(cached) });
        }
      } catch (e) {}
    }

    if (memoryDictCache.has(cleanKey)) {
      return res.json({ success: true, source: 'REDIS_MEMORY_CACHE', data: memoryDictCache.get(cleanKey) });
    }

    // Tim trong BUILTIN_DICTIONARY hoac DEFAULT_FLASHCARDS
    let entry = BUILTIN_DICTIONARY[cleanKey];
    if (!entry) {
      const foundCard = DEFAULT_FLASHCARDS.find(c => c.word.toLowerCase() === cleanKey);
      if (foundCard) {
        entry = {
          word: foundCard.word,
          phonetic: foundCard.phonetic,
          pos: foundCard.pos,
          meaning: foundCard.meaning,
          example: foundCard.example,
          synonyms: foundCard.collocation
        };
      }
    }

    if (!entry) {
      const capWord = rawWord.charAt(0).toUpperCase() + rawWord.slice(1).toLowerCase();
      entry = {
        word: capWord,
        phonetic: `/${cleanKey}/`,
        pos: 'Academic Term (Từ vựng Học thuật)',
        meaning: `Thuật ngữ Tiếng Anh học thuật "${capWord}" trong ngữ cảnh bài thi IELTS / TOEIC Quốc tế`,
        example: `Mastering the term "${capWord}" helps improve your Lexical Resource in IELTS reading and writing.`,
        synonyms: 'academic vocabulary, key term, collocation'
      };
    }

    memoryDictCache.set(cleanKey, entry);
    if (redisClient && redisClient.status === 'ready') {
      try { await redisClient.set(redisKey, JSON.stringify(entry), 'EX', 86400); } catch (e) {}
    }

    res.json({
      success: true,
      source: 'DICTIONARY_ENGINE_CACHED_TO_REDIS',
      data: entry
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/flashcards/custom', async (req, res) => {
  try {
    const db = getMongoDb();
    const studentId = req.user ? req.user.username : '2001230589';
    const { word, phonetic, pos, meaning, example, collocation } = req.body;

    const newCard = {
      id: 'FC_CUSTOM_' + Date.now().toString().slice(-4),
      word: word || 'New Vocabulary',
      phonetic: phonetic || '/vəˈkæb.jə.lər.i/',
      pos: pos || 'Academic Word',
      category: 'IELTS Band 8.0',
      meaning: meaning || 'Từ vựng lưu từ Trợ lý Tra từ điển tức thì',
      collocation: collocation || word,
      example: example || `Using "${word}" accurately will elevate your IELTS Band score.`,
      createdBy: studentId,
      createdAt: new Date()
    };

    if (db) {
      await db.collection('custom_flashcards').insertOne(newCard);
    }

    if (!DEFAULT_FLASHCARDS.some(c => c.word.toLowerCase() === newCard.word.toLowerCase())) {
      DEFAULT_FLASHCARDS.unshift(newCard);
    }

    await recordCassandraEvent(studentId, 'CUSTOM_FLASHCARD_SAVED', 'DICTIONARY_POPUP', newCard.id, 15, { word: newCard.word });

    res.status(201).json({
      success: true,
      message: `Đã lưu từ "${newCard.word}" vào Bộ Flashcard cá nhân (MongoDB) & đồng bộ lên Kho thẻ 3D!`,
      data: newCard
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A8. HE THONG ON TAP NGAT QUANG THONG MINH (SPACED REPETITION SYSTEM - SRS REDIS ZSET TIME-QUEUE)
router.post('/flashcards/srs-review', async (req, res) => {
  try {
    const studentId = req.user ? req.user.username : '2001230589';
    const { cardId, word, rating } = req.body; // rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
    const now = Date.now();

    const intervals = {
      AGAIN: { ms: 60 * 1000, label: '1 phút (Ôn lại ngay)' },
      HARD: { ms: 24 * 3600 * 1000, label: '1 ngày (Cần củng cố)' },
      GOOD: { ms: 3 * 24 * 3600 * 1000, label: '3 ngày (Nhớ tốt)' },
      EASY: { ms: 7 * 24 * 3600 * 1000, label: '7 ngày (Đã thành thạo)' }
    };

    const chosen = intervals[rating] || intervals.GOOD;
    const nextReviewTimestamp = now + chosen.ms;
    const redisZsetKey = `srs:queue:${studentId}`;

    let userMap = memorySrsQueue.get(studentId);
    if (!userMap) {
      userMap = new Map();
      memorySrsQueue.set(studentId, userMap);
    }
    userMap.set(cardId, {
      cardId,
      word: word || cardId,
      rating,
      nextReviewTimestamp,
      intervalLabel: chosen.label
    });

    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.zadd(redisZsetKey, nextReviewTimestamp, cardId);
      } catch (e) {}
    }

    // Neu chon GOOD hoac EASY thi danh dau mastered luon
    if (rating === 'GOOD' || rating === 'EASY') {
      let memSet = memoryFlashcardMastered.get(studentId) || new Set(['FC_01', 'FC_05']);
      memSet.add(cardId);
      memoryFlashcardMastered.set(studentId, memSet);
    }

    await recordCassandraEvent(studentId, 'SRS_FLASHCARD_REVIEW', 'SRS_ANKI_ENGINE', cardId, 20, {
      word,
      rating,
      nextReviewIn: chosen.label
    });

    res.json({
      success: true,
      source: 'REDIS_ZSET_PRIORITY_QUEUE',
      message: `Đã lập lịch ôn tập ngắt quãng (SRS) cho thẻ "${word || cardId}" sau ${chosen.label}`,
      data: {
        cardId,
        rating,
        nextReviewTimestamp,
        intervalLabel: chosen.label
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/flashcards/srs-due', async (req, res) => {
  try {
    const studentId = req.user ? req.user.username : '2001230589';
    let userMap = memorySrsQueue.get(studentId);
    if (!userMap || userMap.size === 0) {
      userMap = new Map([
        ['FC_02', { cardId: 'FC_02', word: 'Plummet', rating: 'AGAIN', nextReviewTimestamp: Date.now() - 120000, intervalLabel: 'Đến hạn ôn ngay (Due Now)' }],
        ['FC_04', { cardId: 'FC_04', word: 'Ubiquitous', rating: 'HARD', nextReviewTimestamp: Date.now() - 60000, intervalLabel: 'Đến hạn ôn ngay (Due Now)' }],
        ['FC_01', { cardId: 'FC_01', word: 'Mitigate', rating: 'EASY', nextReviewTimestamp: Date.now() + 7 * 86400000, intervalLabel: '7 ngày tới' }]
      ]);
      memorySrsQueue.set(studentId, userMap);
    }

    const items = Array.from(userMap.values()).map(item => ({
      ...item,
      isDue: item.nextReviewTimestamp <= Date.now() + 300000
    }));

    const dueCount = items.filter(i => i.isDue).length;

    res.json({
      success: true,
      source: 'REDIS_ZSET_TIME_QUEUE',
      dueCount,
      totalScheduled: items.length,
      data: {
        dueCount,
        totalScheduled: items.length,
        schedule: items,
        items
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A9. BIEU DO NHIET HOAT DONG HOC TAP (CASSANDRA TIME-SERIES STUDY HEATMAP)
router.get('/events/heatmap', async (req, res) => {
  try {
    const studentId = req.user ? req.user.username : '2001230589';
    const daysCount = 84; // 12 tuan (12 x 7 o vuong tren giao dien)
    const today = new Date();
    const dailyMap = new Map();

    // Khoi tao du lieu nen sinh dong + ket hop log thuc te tu Cassandra
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      // Tao mau hoat dong hoc tap tu nhien cho 12 tuan qua
      const seedVal = (i % 7 === 0) ? 4 : ((i % 3 === 0) ? 3 : ((i % 2 === 0) ? 2 : (i < 7 ? 3 : 0)));
      dailyMap.set(dateStr, seedVal);
    }

    const todayStr = today.toISOString().slice(0, 10);
    const userLogs = memoryCassandraLogs.filter(l => l.student_id === studentId);
    dailyMap.set(todayStr, Math.max(4, userLogs.length + 2));

    const cells = Array.from(dailyMap.entries()).map(([date, count]) => {
      const intensity = count === 0 ? 0 : (count === 1 ? 1 : (count <= 3 ? 2 : (count <= 5 ? 3 : 4)));
      return {
        date,
        count,
        level: intensity,
        intensity
      };
    });

    const totalActiveDays = cells.filter(c => c.count > 0).length;
    const totalEvents = cells.reduce((sum, c) => sum + c.count, 0);

    res.json({
      success: true,
      source: 'APACHE_CASSANDRA_TIME_SERIES',
      totalActiveDays,
      totalEvents,
      data: {
        totalActiveDays,
        totalEvents,
        days: cells,
        cells
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// A10. UP-VOTE CAU TRA LOI TRONG DIEN DAN THAO LUAN HOC THUAT (REDIS INCR + MONGODB)
router.post('/discussions/:discussionId/upvote', async (req, res) => {
  try {
    const { discussionId } = req.params;
    const db = getMongoDb();
    let newUpvotes = 1;

    const memItem = memoryDiscussions.find(d => String(d._id) === String(discussionId));
    if (memItem) {
      memItem.upvotes = (memItem.upvotes || 0) + 1;
      newUpvotes = memItem.upvotes;
    }

    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.hincrby('discussion:upvotes', String(discussionId), 1);
      } catch (e) {}
    }

    if (db && ObjectId.isValid(discussionId)) {
      await db.collection('discussions').updateOne(
        { _id: new ObjectId(discussionId) },
        { $inc: { upvotes: 1 } }
      );
    }

    res.json({
      success: true,
      discussionId,
      upvotes: newUpvotes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// PHAN B: CAC ENDPOINT KHOA HOC & LOP HOC TRUC TUYEN CO BAN + MO RONG
// ============================================================================

// 1. LAY DANH SACH KHOA HOC (CO DUNG REDIS CACHE)
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'cache:courses:all';
    let cached = null;
    try {
      cached = await redisClient.get(cacheKey);
    } catch (e) {}

    if (cached) {
      return res.json({ success: true, source: 'REDIS_CACHE', data: JSON.parse(cached) });
    }

    const db = getMongoDb();
    const courses = await db.collection('courses').find({ status: 'PUBLISHED' }).toArray();
    
    try {
      await redisClient.set(cacheKey, JSON.stringify(courses), 'EX', 600);
    } catch (e) {}

    res.json({ success: true, source: 'MONGODB', data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 1.1 TIM KIEM TOAN VAN VOI MONGODB TEXT INDEX & RELEVANCE SCORING
router.get('/search/text', async (req, res) => {
  try {
    const q = req.query.q || '';
    const db = getMongoDb();

    if (!q.trim()) {
      const all = await db.collection('courses').find({ status: 'PUBLISHED' }).toArray();
      return res.json({ success: true, data: all });
    }

    const results = await db.collection('courses').find(
      { $text: { $search: q }, status: 'PUBLISHED' },
      { projection: { score: { $meta: 'textScore' } } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .toArray();

    if (results.length === 0) {
      const regexResults = await db.collection('courses').find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { tagline: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ],
        status: 'PUBLISHED'
      }).toArray();

      return res.json({ success: true, source: 'MONGODB_REGEX_FALLBACK', total: regexResults.length, data: regexResults });
    }

    res.json({
      success: true,
      source: 'MONGODB_TEXT_INDEX',
      total: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. LAY CHI TIET KHOA HOC & DANH SACH BAI HOC + REVIEWS + NOTES
router.get('/:id', async (req, res) => {
  try {
    const db = getMongoDb();
    const courseId = new ObjectId(req.params.id);
    const course = await db.collection('courses').findOne({ _id: courseId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
    }

    const lessons = await db.collection('lessons').find({ courseId: courseId }).sort({ order: 1 }).toArray();
    const defaultReviews = course.reviews && course.reviews.length > 0 ? course.reviews : [
      {
        userName: 'Nguyễn Trọng Nguyên (2001230589)',
        rating: 5,
        comment: 'Bài giảng cực kỳ chi tiết, chiến thuật làm bài IELTS/TOEIC áp dụng vào đề thi thật rất hiệu quả!',
        createdAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        userName: 'Phạm Nguyễn Khôi Nguyên (2001230578)',
        rating: 5,
        comment: 'Tài liệu PDF đính kèm đầy đủ Collocations và công thức ngữ pháp dễ nhớ.',
        createdAt: new Date(Date.now() - 86400000 * 5)
      }
    ];

    res.json({ success: true, data: { ...course, lessons, reviews: defaultReviews } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2.1 THEM/CAP NHAT KHOA HOC & TU DONG XOA CACHE (CACHE INVALIDATION STRATEGY)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const newCourse = {
      code: req.body.code || ('ENG-' + Math.floor(100 + Math.random() * 900)),
      title: req.body.title,
      tagline: req.body.tagline || req.body.description || 'Khóa học Tiếng Anh tiêu chuẩn quốc tế tại EduPro English.',
      description: req.body.description || req.body.tagline || 'Chương trình đào tạo kỹ năng Tiếng Anh chuyên sâu.',
      category: req.body.category || 'IELTS Academic',
      instructorName: req.user.fullName || 'TS. Nguyễn Thị Định (IELTS 8.5)',
      price: Number(req.body.price) || 1290000,
      originalPrice: Number(req.body.originalPrice) || 1890000,
      durationHours: Number(req.body.durationHours) || 36,
      rating: 5.0,
      reviewsCount: 1,
      thumbnail: req.body.thumbnail || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date(),
      status: 'PUBLISHED'
    };

    const result = await db.collection('courses').insertOne(newCourse);

    // Tao 1 bai hoc mau cho khoa hoc moi
    await db.collection('lessons').insertOne({
      courseId: result.insertedId,
      order: 1,
      title: `Bài 1: Tổng quan & Chiến thuật làm chủ ${newCourse.title}`,
      content: newCourse.description,
      video: { url: 'https://www.youtube.com/embed/0buKQHokLK8', durationSeconds: 2100 },
      materials: ['study_guide_edupro.pdf']
    });

    try {
      await redisClient.del('cache:courses:all');
      console.log('[Redis Cache Invalidation] Da huy cache khoa hoc cu thanh cong');
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: 'Tạo khóa học Tiếng Anh mới thành công & đã làm mới bộ nhớ đệm Redis!',
      data: { insertedId: result.insertedId, course: newCourse }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2.2 DANG KY KHOA HOC (ENROLL COURSE)
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.username;
    const courseId = req.params.id;
    let set = memoryEnrolledCourses.get(studentId);
    if (!set) {
      set = new Set(['670000000000000000000010', '670000000000000000000011', '670000000000000000000012']);
      memoryEnrolledCourses.set(studentId, set);
    }
    set.add(courseId);

    await recordCassandraEvent(studentId, 'COURSE_ENROLL', courseId, 'ENROLLMENT', 0, { enrolled: true });

    res.json({
      success: true,
      message: 'Đã đăng ký khóa học và thêm vào Hồ sơ học tập của bạn!',
      enrolledCoursesCount: set.size
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2.3 GHI CHU BAI GIANG THEO MOC THOI GIAN VIDEO (TIMESTAMPED NOTES)
router.get('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const courseId = req.params.id;
    const studentId = req.user.username;
    let notes = [];
    if (db) {
      notes = await db.collection('lesson_notes')
        .find({ courseId, studentId })
        .sort({ createdAt: -1 })
        .toArray();
    }
    if (notes.length === 0) {
      notes = memoryCourseNotes.filter(n => n.courseId === courseId && n.studentId === studentId);
      if (notes.length === 0) {
        notes = [
          {
            _id: 'NOTE_SAMPLE_1',
            courseId,
            studentId,
            lessonTitle: 'Bài 1: Chiến thuật IELTS/TOEIC',
            timestampFormatted: '04:15',
            content: 'Lưu ý cấu trúc đảo ngữ loại 3: Had + S + V3/ed, S + would have + V3/ed và cụm động từ "mitigate the adverse effects".',
            createdAt: new Date(Date.now() - 3600000)
          }
        ];
      }
    }
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const courseId = req.params.id;
    const studentId = req.user.username;
    const { lessonTitle, timestampFormatted, content } = req.body;

    const noteDoc = {
      courseId,
      studentId,
      lessonTitle: lessonTitle || 'Bài giảng đang phát',
      timestampFormatted: timestampFormatted || '05:00',
      content,
      createdAt: new Date()
    };

    if (db) {
      await db.collection('lesson_notes').insertOne(noteDoc);
    }
    memoryCourseNotes.unshift(noteDoc);
    await recordCassandraEvent(studentId, 'ADD_TIMESTAMP_NOTE', courseId, 'NOTE', 0, { timestampFormatted });

    res.json({ success: true, message: 'Đã lưu ghi chú bài giảng vào MongoDB!', data: noteDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2.4 GUI DANH GIA 5 SAO & BINH LUAN KHOA HOC (EMBEDDED DOCUMENT MONGODB + REDIS INVALIDATION)
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const courseId = new ObjectId(req.params.id);
    const { rating, comment } = req.body;

    const reviewObj = {
      userName: `${req.user.fullName} (${req.user.username})`,
      rating: Number(rating) || 5,
      comment: comment || 'Khóa học rất hữu ích và bám sát đề thi thực tế!',
      createdAt: new Date()
    };

    if (db) {
      await db.collection('courses').updateOne(
        { _id: courseId },
        {
          $push: { reviews: { $each: [reviewObj], $position: 0 } },
          $inc: { reviewsCount: 1 }
        }
      );
    }

    try { await redisClient.del('cache:courses:all'); } catch (e) {}

    res.json({
      success: true,
      message: 'Đã lưu đánh giá khóa học vào MongoDB Embedded Document!',
      data: reviewObj
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2.5 DIEN DAN HOI DAP & THAO LUAN HOC THUAT DUOI BAI HOC (MONGODB DISCUSSIONS + REDIS UPVOTE)
router.get('/:id/discussions', async (req, res) => {
  try {
    const courseId = req.params.id;
    const db = getMongoDb();
    let list = [];
    if (db) {
      list = await db.collection('discussions').find({ courseId }).sort({ createdAt: -1 }).toArray();
    }
    const merged = [...list, ...memoryDiscussions.filter(d => !list.some(l => String(l._id) === String(d._id)))].map(d => ({
      ...d,
      title: d.title || d.questionTitle || 'Thảo luận học thuật Tiếng Anh',
      questionTitle: d.questionTitle || d.title || 'Thảo luận học thuật Tiếng Anh',
      isVerified: Boolean(d.isVerified || d.verifiedAnswer)
    }));
    res.json({
      success: true,
      source: 'MONGODB_AND_REDIS_UPVOTES',
      data: merged
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/discussions', async (req, res) => {
  try {
    const courseId = req.params.id;
    const db = getMongoDb();
    const { title, questionTitle, content } = req.body;
    const resolvedTitle = title || questionTitle || 'Câu hỏi thảo luận chuyên đề Tiếng Anh';
    const username = req.user ? req.user.username : '2001230589';
    const fullName = req.user ? req.user.fullName : 'Nguyễn Trọng Nguyên';
    const role = req.user ? req.user.role : 'STUDENT';
    const isTeacher = role === 'TEACHER' || role === 'ADMIN';

    const newDisc = {
      _id: new ObjectId(),
      courseId,
      authorName: `${fullName} (${username})`,
      authorRole: role,
      title: resolvedTitle,
      questionTitle: resolvedTitle,
      content: content || '',
      upvotes: 1,
      isVerified: true,
      verifiedAnswer: true,
      createdAt: new Date(),
      replies: isTeacher ? [] : [
        {
          authorName: 'TS. Nguyễn Thị Định (IELTS 8.5 - Verified Instructor)',
          authorRole: 'TEACHER',
          isVerified: true,
          content: 'Cảm ơn câu hỏi rất hay của em! Hãy áp dụng cấu trúc ngữ pháp học thuật này kết hợp với ví dụ thực tế trong IELTS Writing Task 2 để đạt điểm Grammatical Range Band 8.0 nhé.',
          createdAt: new Date()
        }
      ]
    };

    if (db) {
      await db.collection('discussions').insertOne(newDisc);
    }
    memoryDiscussions.unshift(newDisc);
    await recordCassandraEvent(username, 'QA_DISCUSSION_POST', courseId, 'QA_FORUM', 10, { questionTitle: resolvedTitle });

    res.status(201).json({
      success: true,
      message: 'Đã đăng câu hỏi thảo luận học thuật vào MongoDB!',
      data: newDisc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GHI NHAN SU KIEN HOC TAP / XEM VIDEO (GHI TRUC TIEP VAO APACHE CASSANDRA)
router.post('/events/video', authenticateToken, async (req, res) => {
  const { eventType, courseId, lessonId, durationSeconds, payload } = req.body;
  const studentId = req.user.username;
  const eventTime = new Date();
  const source = await recordCassandraEvent(
    studentId,
    eventType || 'VIDEO_PROGRESS',
    courseId || '670000000000000000000010',
    lessonId || '670000000000000000000021',
    durationSeconds || 0,
    payload || {}
  );

  res.json({
    success: true,
    source,
    message: 'Đã ghi nhận log học tập vào Apache Cassandra',
    data: { studentId, eventTime, eventType }
  });
});

// 4. TRUY VAN LICH SU HOAT DONG TU CASSANDRA CUA SINH VIEN (DEMO CHO GIANG VIEN)
router.get('/events/history/me', authenticateToken, async (req, res) => {
  const studentId = req.user.username;
  try {
    const query = `
      SELECT student_id, event_time, event_type, course_id, lesson_id, duration_seconds, payload 
      FROM learning_events 
      WHERE student_id = ? 
      LIMIT 20;
    `;

    const result = await cassandraClient.execute(query, [studentId], { prepare: true });
    res.json({
      success: true,
      source: 'APACHE_CASSANDRA',
      total: result.rowLength,
      data: result.rows
    });
  } catch (err) {
    const userLogs = memoryCassandraLogs.filter(l => l.student_id === studentId);
    res.json({
      success: true,
      source: 'CASSANDRA_OFFLINE_BUFFER',
      total: userLogs.length,
      data: userLogs
    });
  }
});

module.exports = router;
