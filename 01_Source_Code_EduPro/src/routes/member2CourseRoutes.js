const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { db, id, text, fail, wrap, cacheDelete } = require('../services/member2Common');
const { seedItems, wallet, checkIn, redeem } = require('../services/rewardService');
const router = express.Router();
const staff = authorizeRoles('ADMIN', 'TEACHER');
router.get('/gamification/shop-items', wrap(async (req, res) => { await seedItems(); res.json({ success: true, data: await db().collection('reward_items').find({}).toArray() }); }));
router.post('/gamification/redeem', authenticateToken, wrap(async (req, res) => { res.json({ success: true, data: await redeem(req.user.id, req.body.itemId) }); }));
router.post('/gamification/check-in', authenticateToken, wrap(async (req, res) => {
  const { user, streakSavedByFreeze } = await checkIn(req.user.id);
  res.json({ success: true, data: { xp: user.xp, streakDays: user.streakDays, inventory: user.inventory, streakSavedByFreeze } });
}));
router.get('/gamification/profile', authenticateToken, wrap(async (req, res) => {
  const user = await wallet(req.user.id);
  const results = await db().collection('results').find({ studentCode: req.user.username }, { projection: { score: 1 } }).toArray();
  const enrollments = await db().collection('user_enrollments').find({ $or: [{ userId: req.user.id }, { studentId: req.user.username }] }).toArray();
  const enrolledCourses = [];
  const known = new Set(enrollments.map(en => String(en.courseId)));
  for (const courseId of req.member2EnrollmentIds?.(req.user.username) || []) {
    if (!known.has(courseId)) enrollments.push({ courseId });
  }
  for (const en of enrollments) {
    const c = await db().collection('courses').findOne({ _id: id(String(en.courseId)), isDeleted: { $ne: true } });
    if (c) enrolledCourses.push({ ...c, progressPercent: en.progressPercent || 0 });
  }
  res.json({ success: true, data: { xp: user.xp, inventory: user.inventory, streakDays: user.streakDays || 0, streakSavedByFreeze: false,
    freezeCount: user.inventory.filter(i => i.itemId === 'streak_freeze').length, totalExams: results.length, maxScore: Math.max(0, ...results.map(r => r.score)), enrolledCourses, levelTitle: user.xp >= 800 ? 'Advanced Scholar' : 'English Learner' } });
}));
router.get('/cms/list', authenticateToken, staff, wrap(async (req, res) => {
  const courses = await db().collection('courses').find({ isDeleted: { $ne: true } }).toArray();
  for (const c of courses) c.lessons = Array.isArray(c.lessons) ? c.lessons : await db().collection('lessons').find({ courseId: c._id }).sort({ order: 1 }).toArray();
  res.json({ success: true, data: courses });
}));
function courseFields(body) {
  const title = text(body.title, 'Tiêu đề', 250), description = text(body.description, 'Mô tả'), category = text(body.category, 'Danh mục', 100);
  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) fail(400, 'Giá phải là số không âm.');
  if (!Array.isArray(body.lessons) || body.lessons.length > 200) fail(400, 'Danh sách bài học không hợp lệ.');
  const lessons = body.lessons.map((l, i) => {
    const title = text(l.title, 'Tên bài học', 250);
    const url = l.video?.url || l.videoUrl || '';
    if (url && !/^https?:\/\//i.test(url)) fail(400, 'URL video phải dùng HTTP hoặc HTTPS.');
    return { ...l, title, order: i + 1, video: { ...(l.video || {}), url } };
  });
  return { title, description, tagline: description, category, price: body.price, lessons, updatedAt: new Date() };
}
router.put('/:id', authenticateToken, staff, wrap(async (req, res) => {
  const fields = courseFields(req.body);
  const result = await db().collection('courses').updateOne({ _id: id(req.params.id), isDeleted: { $ne: true } }, { $set: fields });
  if (!result.matchedCount) fail(404, 'Khóa học không tồn tại.');
  await cacheDelete('cache:courses:all');
  res.json({ success: true });
}));
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), wrap(async (req, res) => {
  const r = await db().collection('courses').updateOne({ _id: id(req.params.id), isDeleted: { $ne: true } }, { $set: { isDeleted: true, status: 'DELETED', deletedAt: new Date() } });
  if (!r.matchedCount) fail(404, 'Khóa học không tồn tại.');
  await cacheDelete('cache:courses:all'); res.json({ success: true });
}));
router.delete('/discussions/:discussionId', authenticateToken, staff, wrap(async (req, res) => {
  const r = await db().collection('discussions').deleteOne({ _id: id(req.params.discussionId) });
  if (!r.deletedCount) fail(404, 'Bình luận không tồn tại.');
  res.json({ success: true });
}));
router.delete('/reviews/:reviewId', authenticateToken, authorizeRoles('ADMIN'), wrap(async (req, res) => {
  const reviewId = id(req.params.reviewId);
  const r = await db().collection('courses').updateOne({ 'reviews._id': reviewId }, { $pull: { reviews: { _id: reviewId } }, $inc: { reviewsCount: -1 } });
  const standalone = await db().collection('reviews').deleteOne({ _id: reviewId });
  if (!r.matchedCount && !standalone.deletedCount) fail(404, 'Đánh giá không tồn tại.');
  await cacheDelete('cache:courses:all'); res.json({ success: true });
}));
module.exports = { router, courseFields };
