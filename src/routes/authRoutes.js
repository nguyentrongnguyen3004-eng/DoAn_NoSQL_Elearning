const express = require('express');
const jwt = require('jsonwebtoken');
const { getMongoDb } = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nosql_elearning_super_secret_jwt_key_2026';

// 1. DANG NHAP (FR-01, TC-01, TC-02)
router.post('/login', async (req, res) => {
  try {
    const { username, email } = req.body;
    const db = getMongoDb();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database MongoDB chưa sẵn sàng' });
    }

    const query = username ? { username } : { email };
    const user = await db.collection('users').findOne(query);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại trên hệ thống' });
    }

    // Sinh Token JWT chua role
    const tokenPayload = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: tokenPayload
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. LAY DANH SACH TAI KHOAN MAU DE TEST NHANH (SINH VIEN, GIANG VIEN, ADMIN)
router.get('/demo-accounts', async (req, res) => {
  try {
    const db = getMongoDb();
    const users = await db.collection('users').find({}, { projection: { passwordHash: 0 } }).toArray();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
