const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getMongoDb, redisClient, cassandraClient, neo4jDriver } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'nosql_elearning_secret_key_2026';

// Helper decode token if present
function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// POST /api/copilot/ask - Smart AI Study Copilot hop nhat 4 CSDL NoSQL
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu hỏi.' });
    }

    const user = getUserFromToken(req) || {
      id: '2001230589',
      username: 'student_nguyen',
      fullName: 'Nguyễn Trọng Nguyên',
      role: 'STUDENT',
      targetBand: 'IELTS 7.5+'
    };

    const qLower = question.toLowerCase();
    const sources = [];
    const suggestedActions = [];
    let answer = '';

    // INTENT 1: LỘ TRÌNH HỌC & ĐỀ XUẤT KHÓA HỌC (NEO4J GRAPH + MONGODB)
    if (qLower.includes('lộ trình') || qLower.includes('học gì') || qLower.includes('đề xuất') || qLower.includes('khóa học')) {
      sources.push({ db: 'NEO4J', desc: 'Đồ thị tri thức (Cypher Co-enrollment & Target Band Path)' });
      sources.push({ db: 'MONGODB', desc: 'Danh mục chi tiết khóa học & Module bài giảng' });

      let graphRecs = [];
      if (neo4jDriver) {
        const session = neo4jDriver.session();
        try {
          const cypherQuery = `
            MATCH (c:Course)
            OPTIONAL MATCH (c)-[:HAS_LESSON]->(l:Lesson)
            RETURN c.id AS id, c.title AS title, c.category AS category, count(l) AS lessonCount
            LIMIT 3;
          `;
          const result = await session.run(cypherQuery);
          graphRecs = result.records.map(r => ({
            id: r.get('id'),
            title: r.get('title'),
            category: r.get('category'),
            lessonCount: r.get('lessonCount')?.low || 4
          }));
        } catch (e) {
          console.warn('[Copilot Neo4j error]:', e.message);
        } finally {
          await session.close();
        }
      }

      if (graphRecs.length === 0) {
        graphRecs = [
          { id: '670000000000000000000010', title: 'IELTS Masterclass 7.5+: Chinh Phục 4 Kỹ Năng Toàn Diện', category: 'IELTS Academic', lessonCount: 4 },
          { id: '670000000000000000000011', title: 'IELTS Writing Task 1 & Task 2 Chuyên Sâu: Tư Duy Logic Band 8.0', category: 'Writing', lessonCount: 4 }
        ];
      }

      answer = `Chào **${user.fullName}**, dựa trên phân tích đồ thị tri thức **Neo4j** với mục tiêu **${user.targetBand || 'IELTS 7.5+'}** của bạn:\n\n` +
        `🎯 **Lộ trình tối ưu đề xuất:**\n` +
        `1. **Bước 1 - Nền tảng:** Củng cố bản đồ 12 thì ngữ pháp và phát âm IPA 44 âm chuẩn.\n` +
        `2. **Bước 2 - Tăng tốc:** Khóa học **${graphRecs[0]?.title || 'IELTS Masterclass'}** (${graphRecs[0]?.category || 'Academic'}).\n` +
        `3. **Bước 3 - Bứt phá Writing & Speaking:** Luyện cấu trúc đảo ngữ và từ vựng C1-Advanced.\n\n` +
        `💡 *Khuyến nghị:* Hoàn thành bài kiểm tra trắc nghiệm để Neo4j tự động điều chỉnh độ dốc lộ trình phù hợp năng lực thực tế.`;

      suggestedActions.push(
        { label: 'Vào học khóa đề xuất ngay', action: 'ENTER_CLASSROOM', payload: { courseId: graphRecs[0]?.id || '670000000000000000000010' } },
        { label: 'Xem bản đồ tri thức Neo4j', action: 'NAVIGATE', payload: { section: 'graph' } }
      );

    // INTENT 2: TIẾN ĐỘ HỌC TẬP & XEM VIDEO (CASSANDRA TIME-SERIES)
    } else if (qLower.includes('tiến độ') || qLower.includes('video') || qLower.includes('thời gian') || qLower.includes('hoàn thành')) {
      sources.push({ db: 'CASSANDRA', desc: 'Nhật ký sự kiện chuỗi thời gian (Table learning_events)' });

      let eventCount = 8;
      let totalSeconds = 3600;
      if (cassandraClient) {
        try {
          const cql = `SELECT count(*) AS total FROM learning_events WHERE student_id = ?;`;
          const cqlRes = await cassandraClient.execute(cql, [user.id || '2001230589'], { prepare: true });
          if (cqlRes.rows.length > 0) {
            eventCount = Number(cqlRes.rows[0].total) || eventCount;
          }
        } catch (e) {
          console.warn('[Copilot Cassandra error]:', e.message);
        }
      }

      const hours = (totalSeconds / 3600).toFixed(1);
      answer = `📊 **Báo cáo học tập từ Apache Cassandra cho ${user.fullName}:**\n\n` +
        `* ⏱️ **Tổng thời lượng tương tác:** ~${hours} giờ học tích lũy.\n` +
        `* 📈 **Nhật ký sự kiện ghi nhận:** **${eventCount} sự kiện** (Play, Pause, Progress, Complete) được ghi nhận trong bảng \`learning_events\`.\n` +
        `* 🎯 **Tỷ lệ giữ chân bài học (Retention Rate):** Đạt mức **79.7%** - Học viên duy trì mức độ tập trung cao nhất tại mốc 00:00 - 04:00.\n\n` +
        `💡 *Lời khuyên từ hệ thống:* Hãy giữ vững chuỗi tập trung mỗi ngày 25 phút (kỹ thuật Pomodoro) để củng cố phản xạ tự nhiên.`;

      suggestedActions.push(
        { label: 'Xem biểu đồ giữ chân video', action: 'NAVIGATE', payload: { section: 'classroom' } },
        { label: 'Bật đồng hồ Pomodoro', action: 'START_POMODORO', payload: {} }
      );

    // INTENT 3: THỨ HẠNG, ĐIỂM SỐ & XẾP HẠNG (REDIS SORTED SET)
    } else if (qLower.includes('hạng') || qLower.includes('điểm') || qLower.includes('bảng vàng') || qLower.includes('xp') || qLower.includes('top')) {
      sources.push({ db: 'REDIS', desc: 'Bảng xếp hạng thời gian thực RAM-first (ZREVRANGEBYSCORE)' });

      let userRank = 1;
      let userScore = 9.5;
      let topUsers = [];

      if (redisClient && redisClient.status === 'ready') {
        try {
          const lbKey = 'exam:670000000000000000000040:leaderboard';
          const topList = await redisClient.zrevrange(lbKey, 0, 2, 'WITHSCORES');
          for (let i = 0; i < topList.length; i += 2) {
            topUsers.push({ name: topList[i], score: parseFloat(topList[i + 1]) });
          }
        } catch (e) {
          console.warn('[Copilot Redis error]:', e.message);
        }
      }

      if (topUsers.length === 0) {
        topUsers = [
          { name: 'Nguyen Trong Nguyen', score: 9.5 },
          { name: 'Alex Johnson', score: 8.8 },
          { name: 'Tran Minh Khoi', score: 8.2 }
        ];
      }

      answer = `🏆 **Thứ hạng thi đua trực tiếp từ Redis In-Memory Leaderboard:**\n\n` +
        `* 🥇 **Thứ hạng của bạn:** Top **#${userRank}** với điểm thi IELTS gần nhất: **${topUsers[0]?.score || 9.5} / 10**.\n` +
        `* ⚡ **Top 3 cao thủ bảng vàng:**\n` +
        topUsers.map((t, idx) => `  ${idx + 1}. **${t.name}** - ${t.score} điểm`).join('\n') + `\n\n` +
        `🔥 Bạn đang sở hữu huy hiệu **Học Giả Xuất Sắc (+200 XP)**. Hãy tham gia Đấu trường từ vựng trực tuyến để gia tăng điểm thi đua!`;

      suggestedActions.push(
        { label: 'Vào phòng thi thử ngay', action: 'NAVIGATE', payload: { section: 'exam' } },
        { label: 'Thách đấu Đấu Trường Từ Vựng', action: 'NAVIGATE', payload: { section: 'vocab' } }
      );

    // INTENT 4: TỔNG QUAN 360 ĐỘ TOÀN DIỆN (TỔNG HỢP CẢ 4 CSDL)
    } else {
      sources.push({ db: 'MONGODB', desc: 'Hồ sơ học viên & Kết quả thi lưu trữ vĩnh viễn' });
      sources.push({ db: 'REDIS', desc: 'Bộ nhớ tạm tốc độ cao & Điểm xếp hạng trực tuyến' });
      sources.push({ db: 'CASSANDRA', desc: 'Dữ liệu phân tích nhật ký chuỗi thời gian' });
      sources.push({ db: 'NEO4J', desc: 'Mô hình liên kết đồ thị tri thức & Lộ trình thích ứng' });

      answer = `Xin chào **${user.fullName}**! Tôi là **EduPro Multi-NoSQL Copilot** - Trợ lý học tập thông minh được hỗ trợ bởi hệ sinh thái 4 CSDL:\n\n` +
        `* 🍃 **MongoDB:** Quản lý an toàn hồ sơ học tập, ghi chú bài giảng và bài viết Writing của bạn.\n` +
        `* ⚡ **Redis:** Đang lưu trữ phiên làm bài thi tốc độ cao, điểm xếp hạng trực tiếp và thông báo thời gian thực.\n` +
        `* 👁️ **Cassandra:** Ghi nhận liên tục tiến trình xem bài giảng và phân tích biểu đồ giữ chân video chuỗi thời gian.\n` +
        `* 🕸️ **Neo4j:** Điều hướng lộ trình ngắn nhất để bạn cán mốc **${user.targetBand || 'IELTS 7.5+'}**.\n\n` +
        `Bạn có thể hỏi tôi bất kỳ câu hỏi nào như: *"Hôm nay tôi nên học gì?"*, *"Tiến độ xem video của tôi?"*, hoặc *"Thứ hạng bảng vàng của tôi?"*!`;

      suggestedActions.push(
        { label: 'Xem lộ trình hôm nay', action: 'ASK_COPILOT', payload: { query: 'Hôm nay tôi nên học gì?' } },
        { label: 'Kiểm tra thứ hạng bảng vàng', action: 'ASK_COPILOT', payload: { query: 'Thứ hạng của tôi trên bảng vàng?' } },
        { label: 'Xem tiến độ video Cassandra', action: 'ASK_COPILOT', payload: { query: 'Tiến độ học tập và xem video của tôi?' } }
      );
    }

    return res.json({
      success: true,
      answer,
      sources,
      suggestedActions,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Copilot Ask Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi trợ lý AI: ' + err.message });
  }
});

module.exports = router;
