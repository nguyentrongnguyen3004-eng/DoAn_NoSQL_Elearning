const express = require('express');
const { ObjectId } = require('mongodb');
const cassandra = require('cassandra-driver');
const { getMongoDb, redisClient, cassandraClient } = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// 1. LAY DANH SACH KHOA HOC (CO DUNG REDIS CACHE)
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'cache:courses:all';
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, source: 'REDIS_CACHE', data: JSON.parse(cached) });
    }

    const db = getMongoDb();
    const courses = await db.collection('courses').find({ status: 'PUBLISHED' }).toArray();
    
    // Luu cache 10 phut (600 giay)
    await redisClient.set(cacheKey, JSON.stringify(courses), 'EX', 600);

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

    // Su dung $text search va cham diem $meta: "textScore"
    const results = await db.collection('courses').find(
      { $text: { $search: q }, status: 'PUBLISHED' },
      { projection: { score: { $meta: 'textScore' } } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .toArray();

    // Fallback sang Regex tim kiem gan dung neu Text Index khong khop tu don le
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


// 2. LAY CHI TIET KHOA HOC & DANH SACH BAI HOC
router.get('/:id', async (req, res) => {
  try {
    const db = getMongoDb();
    const courseId = new ObjectId(req.params.id);
    const course = await db.collection('courses').findOne({ _id: courseId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
    }

    const lessons = await db.collection('lessons').find({ courseId: courseId }).sort({ order: 1 }).toArray();

    res.json({ success: true, data: { ...course, lessons } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2.1 THEM/CAP NHAT KHOA HOC & TU DONG XOA CACHE (CACHE INVALIDATION STRATEGY)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const newCourse = {
      ...req.body,
      createdAt: new Date(),
      status: req.body.status || 'PUBLISHED'
    };

    const result = await db.collection('courses').insertOne(newCourse);

    // XOA CACHE REDIS DE DAM BAO DATA CONSISTENCY (CACHE INVALIDATION)
    await redisClient.del('cache:courses:all');
    console.log('[Redis Cache Invalidation] Da huy cache khoa hoc cu thanh cong');

    res.status(201).json({
      success: true,
      message: 'Tạo khóa học thành công & đã làm mới bộ nhớ đệm Redis',
      data: { insertedId: result.insertedId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// 3. GHI NHAN SU KIEN HOC TAP / XEM VIDEO (GHI TRUC TIEP VAO APACHE CASSANDRA)
router.post('/events/video', authenticateToken, async (req, res) => {
  try {
    const { eventType, courseId, lessonId, durationSeconds, payload } = req.body;
    const studentId = req.user.username; // Dùng mã SV làm Partition Key
    const eventTime = new Date();
    const eventId = cassandra.types.Uuid.random();
    const sessionId = req.body.sessionId || 'SESS_' + Date.now();

    const query = `
      INSERT INTO learning_events (
        student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const params = [
      studentId,
      eventTime,
      eventId,
      eventType || 'video_progress',
      courseId || 'COURSE_NOSQL',
      lessonId || 'LESSON_01',
      sessionId,
      durationSeconds || 0,
      JSON.stringify(payload || {})
    ];

    await cassandraClient.execute(query, params, { prepare: true });

    res.json({
      success: true,
      message: 'Đã ghi nhận log học tập vào Apache Cassandra thành công',
      data: {
        studentId,
        eventTime,
        eventType
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi ghi Cassandra: ' + err.message });
  }
});

// 4. TRUY VAN LICH SU HOAT DONG TU CASSANDRA CUA SINH VIEN (DEMO CHO GIANG VIEN)
router.get('/events/history/me', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.username;
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
    res.status(500).json({ success: false, message: 'Lỗi đọc Cassandra: ' + err.message });
  }
});

module.exports = router;
