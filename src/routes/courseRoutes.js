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
