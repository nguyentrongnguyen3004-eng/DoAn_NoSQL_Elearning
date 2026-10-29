const express = require('express');
const { getMongoDb, redisClient } = require('../config/db');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Danh sách thông báo mẫu ban đầu (Fallback)
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif_welcome',
    title: 'Chào mừng bạn đến với EduPro English!',
    message: 'Hãy bắt đầu với bài kiểm tra năng lực Placement Test để nhận diện trình độ CEFR hiện tại của bạn.',
    type: 'system',
    icon: '🎓',
    link: '#section-exam',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: false
  },
  {
    id: 'notif_streak',
    title: 'Duy trì chuỗi học tập 3 ngày liên tiếp!',
    message: 'Xuất sắc! Bạn đã nhận thêm +50 XP điểm thưởng vào tài khoản.',
    type: 'achievement',
    icon: '🔥',
    link: '#section-history',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isRead: false
  },
  {
    id: 'notif_exam',
    title: 'Đề thi mới: ETS TOEIC 850+ Part 5',
    message: 'Bộ đề thi thử ngữ pháp và từ vựng doanh nghiệp quốc tế đã mở tại phòng thi.',
    type: 'exam',
    icon: '📝',
    link: '#section-exam',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isRead: true
  }
];

// 1. GET /api/notifications/my-recent - Lấy danh sách thông báo của người dùng
router.get('/my-recent', async (req, res) => {
  try {
    let notifications = [];

    // Ưu tiên đọc từ Redis List nếu Redis sẵn sàng
    if (redisClient && redisClient.status === 'ready') {
      try {
        const cachedRaw = await redisClient.lrange('notifications:all', 0, 9);
        if (cachedRaw && cachedRaw.length > 0) {
          notifications = cachedRaw.map(item => {
            try { return JSON.parse(item); } catch (e) { return null; }
          }).filter(Boolean);
        }
      } catch (err) {
        console.warn('[Notifications] Redis lrange error:', err.message);
      }
    }

    // Nếu Redis trống hoặc chưa có, thử đọc từ MongoDB
    if (notifications.length === 0) {
      const db = getMongoDb();
      if (db) {
        try {
          const dbNotifs = await db.collection('notifications')
            .find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();
          if (dbNotifs && dbNotifs.length > 0) {
            notifications = dbNotifs;
          }
        } catch (e) {}
      }
    }

    // Fallback sang danh sách mặc định nếu chưa có bản ghi nào
    if (notifications.length === 0) {
      notifications = DEFAULT_NOTIFICATIONS;
    }

    // Tính số lượng chưa đọc
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      total: notifications.length,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: DEFAULT_NOTIFICATIONS, unreadCount: 2 });
  }
});

// 2. POST /api/notifications/broadcast - Phát thông báo thời gian thực qua Redis Pub/Sub
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, type = 'system', link = '#' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung thông báo không được để trống.' });
    }

    const newNotif = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type,
      icon: type === 'achievement' ? '🏆' : type === 'exam' ? '📝' : type === 'reminder' ? '⏰' : '📢',
      link,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // 1. Lưu vào MongoDB
    const db = getMongoDb();
    if (db) {
      try {
        await db.collection('notifications').insertOne({ ...newNotif });
      } catch (e) {}
    }

    // 2. Lưu vào Redis List và Publish vào Channel system_notifications
    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.lpush('notifications:all', JSON.stringify(newNotif));
        await redisClient.ltrim('notifications:all', 0, 49); // Giữ tối đa 50 thông báo gần nhất
        await redisClient.publish('system_notifications', JSON.stringify(newNotif));
      } catch (e) {
        console.warn('[Notifications] Redis publish error:', e.message);
      }
    }

    res.json({
      success: true,
      message: 'Đã phát sóng thông báo thời gian thực thành công qua Redis Pub/Sub',
      data: newNotif
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. POST /api/notifications/mark-read - Đánh dấu tất cả thông báo là đã đọc
router.post('/mark-read', async (req, res) => {
  try {
    const db = getMongoDb();
    if (db) {
      try {
        await db.collection('notifications').updateMany({}, { $set: { isRead: true } });
      } catch (e) {}
    }
    res.json({ success: true, message: 'Đã đánh dấu đã đọc toàn bộ thông báo.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
