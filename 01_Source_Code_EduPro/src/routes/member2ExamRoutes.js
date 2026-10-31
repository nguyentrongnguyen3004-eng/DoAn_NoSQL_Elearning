const express = require('express');
const { randomUUID, createHash } = require('crypto');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { redisClient, cassandraClient } = require('../config/db');
const { fail, db, id, text, wrap } = require('../services/member2Common');
const router = express.Router();
const staff = authorizeRoles('ADMIN', 'TEACHER');
const BASE_ID = '670000000000000000000040';
const variants = [
  [BASE_ID, 'Placement Test A1-C2', 'placement', 30],
  ['67000000000000000000004a', 'TOEIC Part 5 - 850+', 'toeic', 15],
  ['67000000000000000000004b', 'IELTS Academic Reading', 'ielts', 25],
  ['67000000000000000000004c', 'Core Grammar', 'grammar', 20]
];
// Existing main only seeds the placement exam. Materialize independent banks once.
async function ensureCatalog() {
  const base = await db().collection('exams').findOne({ _id: id(BASE_ID) });
  if (!base) return;
  for (const [examId, title, category, durationMinutes] of variants) {
    if (examId === BASE_ID) { await db().collection('exams').updateOne({ _id: id(examId) }, { $set: { category } }); continue; }
    if (await db().collection('exams').findOne({ _id: id(examId) })) continue;
    const questions = await db().collection('questions').find({ _id: { $in: (base.questions || []).map(q => id(String(q))) } }).toArray();
    const copies = [];
    for (const q of questions) {
      const copyId = id(createHash('sha256').update(examId + String(q._id)).digest('hex').slice(0, 24));
      await db().collection('questions').updateOne({ _id: copyId }, { $setOnInsert: { ...q, _id: copyId } }, { upsert: true });
      copies.push(copyId);
    }
    await db().collection('exams').updateOne({ _id: id(examId) }, { $setOnInsert: { ...base, _id: id(examId), title, category, durationMinutes, questions: copies, totalQuestions: copies.length } }, { upsert: true });
  }
}
async function getExam(examId) {
  id(examId); await ensureCatalog();
  const exam = await db().collection('exams').findOne({ _id: id(examId), status: 'PUBLISHED' });
  if (!exam) fail(404, 'Đề thi không tồn tại.');
  return exam;
}
const attemptId = (req, examId) => `${req.user.id}:${examId}`;
const cheatKey = (req, examId) => `exam:anti-cheat:${req.user.id}:${examId}`;
async function mirrorAttempt(req, a) {
  if (redisClient.status !== 'ready') return;
  try {
    const ttl = Math.max(60, Math.ceil((new Date(a.expiresAt) - Date.now()) / 1000));
    await redisClient.set(cheatKey(req, a.examId), String(a.violations), 'EX', ttl + 86400);
    await redisClient.set(`exam:${a.examId}:attempt:${req.user.username}`, JSON.stringify({ attemptId: a.attemptId, status: a.status }), 'EX', ttl);
    if (a.answers && Object.keys(a.answers).length > 0) {
      const keyUser = `exam:${a.examId}:answers:${req.user.username}`;
      const keyId = `exam:${a.examId}:answers:${req.user.id}`;
      for (const [qid, opt] of Object.entries(a.answers)) {
        await redisClient.hset(keyUser, qid, opt);
        await redisClient.hset(keyId, qid, opt);
      }
      await redisClient.expire(keyUser, ttl + 120);
      await redisClient.expire(keyId, ttl + 120);
    }
  } catch (e) { console.warn('Redis exam cache unavailable:', e.message); }
}
async function newAttempt(req, exam) {
  const questions = await db().collection('questions').find({ _id: { $in: (exam.questions || []).map(q => id(String(q))) } }).toArray();
  if (!questions.length) fail(400, 'Đề thi chưa có câu hỏi.');
  for (let i = questions.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [questions[i], questions[j]] = [questions[j], questions[i]]; }
  return { _id: attemptId(req, String(exam._id)), attemptId: randomUUID(), examId: String(exam._id), studentCode: req.user.username, studentId: req.user.id, studentName: req.user.fullName,
    examTitle: exam.title, category: exam.category || 'placement', status: 'in_progress', violations: 0, answers: {}, questions,
    startedAt: new Date(), expiresAt: new Date(Date.now() + (exam.durationMinutes || 30) * 60000) };
}
router.get('/list/all', wrap(async (req, res) => {
  await ensureCatalog();
  const exams = await db().collection('exams').find({ status: 'PUBLISHED' }, { projection: { questions: 0 } }).toArray();
  res.json({ success: true, data: exams });
}));
router.post('/:id/retake', authenticateToken, wrap(async (req, res) => {
  const exam = await getExam(req.params.id);
  const old = await db().collection('exam_attempts').findOne({ _id: attemptId(req, req.params.id) });
  if (old && old.status === 'in_progress' && old.violations < 3 && new Date(old.expiresAt) > new Date()) fail(409, 'Hãy nộp bài hiện tại trước khi thi lại.');
  if (old && old.status !== 'submitted') await finalize(req, old);
  const a = await newAttempt(req, exam);
  if (old) {
    const changed = await db().collection('exam_attempts').replaceOne({ _id: a._id, attemptId: old.attemptId, status: 'submitted' }, a);
    if (!changed.matchedCount) fail(409, 'Lượt thi đã thay đổi. Vui lòng tải lại bài thi.');
  } else {
    await db().collection('exam_attempts').updateOne({ _id: a._id }, { $setOnInsert: a }, { upsert: true });
  }
  if (redisClient.status === 'ready') {
    await redisClient.del(cheatKey(req, req.params.id), `exam:${req.params.id}:cheats:${req.user.username}`, `exam:${req.params.id}:answers:${req.user.username}`, `exam:${req.params.id}:order:${req.user.username}`);
  }
  await mirrorAttempt(req, a);
  res.json({ success: true, message: 'Đã sẵn sàng thi lại', violations: 0, status: 'in_progress' });
}));
router.post('/:id/start', authenticateToken, wrap(async (req, res) => {
  const exam = await getExam(req.params.id);
  const key = attemptId(req, req.params.id);
  let a = await db().collection('exam_attempts').findOne({ _id: key });
  if (!a) {
    const fresh = await newAttempt(req, exam);
    await db().collection('exam_attempts').updateOne({ _id: key }, { $setOnInsert: fresh }, { upsert: true });
    a = await db().collection('exam_attempts').findOne({ _id: key });
  }
  if (a.status === 'submitted') {
    const fresh = await newAttempt(req, exam);
    await db().collection('exam_attempts').updateOne({ _id: key }, { $set: fresh });
    a = await db().collection('exam_attempts').findOne({ _id: key });
  } else if (a.status !== 'in_progress' || a.violations >= 3) {
    fail(409, 'Bài thi đã kết thúc. Bấm Làm lại đề thi để bắt đầu lượt mới.');
  }
  await mirrorAttempt(req, a);
  const questions = a.questions.map(({ correctAnswer, explanation, ...q }) => q);
  res.json({ success: true, data: { examTitle: a.examTitle, durationMinutes: exam.durationMinutes, attempt: { attemptId: a.attemptId, status: a.status }, violations: a.violations,
    ttlLeftSeconds: Math.max(0, Math.ceil((new Date(a.expiresAt) - Date.now()) / 1000)), savedAnswers: a.answers, questions } });
}));
router.post('/:id/answer', authenticateToken, wrap(async (req, res) => {
  id(req.params.id); const questionId = String(id(req.body.questionId));
  const a = await db().collection('exam_attempts').findOne({ _id: attemptId(req, req.params.id) });
  if (!a || a.status !== 'in_progress' || a.violations >= 3 || new Date(a.expiresAt) <= new Date()) fail(409, 'Phiên thi đã hết hạn hoặc bị khóa.');
  const q = a.questions.find(q => String(q._id) === questionId);
  if (!q || !q.options.some(o => o.key === req.body.selectedOption)) fail(400, 'Câu hỏi hoặc đáp án không thuộc đề thi.');
  const result = await db().collection('exam_attempts').updateOne({ _id: a._id, attemptId: a.attemptId, status: 'in_progress', violations: { $lt: 3 }, expiresAt: { $gt: new Date() } }, { $set: { [`answers.${questionId}`]: req.body.selectedOption } });
  if (!result.matchedCount) fail(409, 'Phiên thi đã bị khóa.');

  // GHI NHẬN TỨC THÌ ĐÁP ÁN VÀO REDIS HASH CÓ TTL (ĐỒNG BỘ ĐA MÔ HÌNH NOSQL)
  if (redisClient.status === 'ready') {
    try {
      const ttl = Math.max(60, Math.ceil((new Date(a.expiresAt) - Date.now()) / 1000));
      const keyUser = `exam:${req.params.id}:answers:${req.user.username}`;
      const keyId = `exam:${req.params.id}:answers:${req.user.id}`;
      await redisClient.hset(keyUser, questionId, req.body.selectedOption);
      await redisClient.expire(keyUser, ttl + 120);
      await redisClient.hset(keyId, questionId, req.body.selectedOption);
      await redisClient.expire(keyId, ttl + 120);
    } catch (e) {
      console.warn('Redis answers hash sync error:', e.message);
    }
  }

  res.json({ success: true, message: 'Đã lưu đáp án vào MongoDB và Redis Hash' });
}));
function certHash(c) { return createHash('sha256').update(JSON.stringify([c._id, c.studentName, c.examTitle, c.score, c.cefrLevel, new Date(c.issuedDate).toISOString()])).digest('hex'); }
async function finalize(req, a) {
  const collection = db().collection('results');
  let result = await collection.findOne({ _id: a.attemptId });
  if (!result) {
    // Lock answers before grading; concurrent submissions read the same immutable snapshot.
    await db().collection('exam_attempts').updateOne({ _id: a._id, attemptId: a.attemptId, status: { $in: ['in_progress', 'disqualified'] } }, { $set: { status: 'submitted' } });
    const locked = await db().collection('exam_attempts').findOne({ _id: a._id, attemptId: a.attemptId });
    if (!locked) fail(409, 'Phiên thi đã thay đổi.');
    a = locked;
    const answers = a.questions.map(q => ({ questionId: q._id, content: q.content, options: q.options, selected: a.answers[String(q._id)] || null,
      selectedOption: a.answers[String(q._id)] || null, correctAnswer: q.correctAnswer, isCorrect: a.answers[String(q._id)] === q.correctAnswer, explanation: q.explanation || 'Chưa có lời giải thích.' }));
    const isDisqualified = a.violations >= 3;
    const correctCount = isDisqualified ? 0 : answers.filter(q => q.isCorrect).length;
    const score = Math.round(correctCount / answers.length * 100) / 10;
    result = { _id: a.attemptId, examId: id(a.examId), examTitle: a.examTitle, category: a.category, studentId: id(req.user.id), studentCode: req.user.username,
      studentName: req.user.fullName, score, correctCount, totalCount: answers.length, isDisqualified, submittedAt: new Date(), answers };
    await collection.updateOne({ _id: a.attemptId }, { $setOnInsert: result }, { upsert: true });
    result = await collection.findOne({ _id: a.attemptId });
  }
  if (result.score >= 5 && !result.isDisqualified) {
    const certificate = { _id: 'EDUPRO-' + result._id, studentName: result.studentName, examTitle: result.examTitle, score: result.score,
      cefrLevel: result.score >= 9 ? 'C1' : result.score >= 7 ? 'B2' : 'B1', issuedDate: result.submittedAt, submissionId: result._id, revoked: false };
    certificate.verifyHash = certHash(certificate);
    await db().collection('certificates').updateOne({ _id: certificate._id }, { $setOnInsert: certificate }, { upsert: true });
    await collection.updateOne({ _id: result._id }, { $set: { certificateId: certificate._id } });
    result.certificateId = certificate._id;
  }
  if (!result.isDisqualified) {
    await require('../services/rewardService').wallet(req.user.id);
    await db().collection('users').updateOne({ _id: id(req.user.id), rewardedAttempts: { $ne: result._id } }, { $inc: { xp: 150 }, $addToSet: { rewardedAttempts: result._id } });
  }
  await mirrorAttempt(req, { ...a, status: 'submitted' });
  if (!result.isDisqualified && redisClient.status === 'ready') {
    try { await redisClient.zadd(`leaderboard:${a.examId}`, result.score, `${req.user.fullName} (${req.user.username})`); } catch (e) { console.warn(e.message); }
  }
  return result;
}
router.post('/:id/submit', authenticateToken, wrap(async (req, res) => {
  id(req.params.id);
  const a = await db().collection('exam_attempts').findOne({ _id: attemptId(req, req.params.id) });
  if (!a) fail(409, 'Chưa bắt đầu bài thi.');
  const result = await finalize(req, a);
  res.json({ success: true, data: { ...result, detailedAnswers: result.answers } });
}));
router.post('/anti-cheat/log-violation', authenticateToken, wrap(async (req, res) => {
  const examId = String(id(req.body.examId));
  const key = attemptId(req, examId);
  const a = await db().collection('exam_attempts').findOneAndUpdate({ _id: key, status: 'in_progress', violations: { $lt: 3 }, expiresAt: { $gt: new Date() } }, { $inc: { violations: 1 } }, { returnDocument: 'after' });
  if (!a) fail(409, 'Không có phiên thi đang hoạt động.');
  await mirrorAttempt(req, a);
  let auditSaved = false;
  try {
    if (cassandraClient.getState().getConnectedHosts().length) {
      await cassandraClient.execute('INSERT INTO learning_events (student_id,event_time,event_id,event_type,course_id,lesson_id,session_id,duration_seconds,payload) VALUES (?,?,?,?,?,?,?,?,?)',
        [req.user.username, new Date(), randomUUID(), 'EXAM_CHEATING_WARNING', examId, 'EXAM_ROOM', a.attemptId, 0, JSON.stringify({ reason: String(req.body.reason || 'TAB_SWITCH').slice(0, 200), violationCount: a.violations })], { prepare: true });
      auditSaved = true;
    }
  } catch (e) { console.warn('Cassandra audit:', e.message); }
  // Preserve the audit even when Cassandra is unavailable.
  await db().collection('exam_audit').insertOne({ attemptId: a.attemptId, studentId: req.user.id, violations: a.violations, createdAt: new Date(), cassandraSaved: auditSaved });
  if (a.violations >= 3) await finalize(req, a);
  res.json({ success: true, violationCount: a.violations, maxAllowed: 3, isDisqualified: a.violations >= 3 });
}));
router.post('/anti-cheat/reset', authenticateToken, wrap(async () => { fail(409, 'Sử dụng nút Làm lại đề thi sau khi kết thúc lượt thi.'); }));
router.get('/anti-cheat/status', authenticateToken, wrap(async (req, res) => {
  const a = await db().collection('exam_attempts').findOne({ _id: attemptId(req, String(id(req.query.examId))) });
  res.json({ success: true, violationCount: a?.violations || 0, maxAllowed: 3, isDisqualified: (a?.violations || 0) >= 3 });
}));
router.get('/submissions/:submissionId/review', authenticateToken, wrap(async (req, res) => {
  const value = req.params.submissionId;
  const result = await db().collection('results').findOne({ _id: /^[a-f\d]{24}$/i.test(value) ? id(value) : value, studentCode: req.user.username });
  if (!result) fail(404, 'Không tìm thấy bài làm của bạn.');
  res.json({ success: true, data: result });
}));
router.get('/results/my-history', authenticateToken, wrap(async (req, res) => {
  const page = Number(req.query.page || 1), limit = Number(req.query.limit || 5), category = req.query.category || '';
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50 || !['', 'placement', 'toeic', 'ielts', 'grammar'].includes(category)) fail(400, 'Bộ lọc hoặc phân trang không hợp lệ.');
  const filter = { studentCode: req.user.username };
  if (category) filter.$or = [{ category }, { category: { $exists: false }, examTitle: { $regex: category === 'placement' ? '^Đánh Giá' : category, $options: 'i' } }];
  const total = await db().collection('results').countDocuments(filter);
  const data = await db().collection('results').find(filter, { projection: { answers: 0 } }).sort({ submittedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).toArray();
  res.json({ success: true, data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
}));
router.get('/certificates/qr/:certId', wrap(async (req, res) => {
  const c = await db().collection('certificates').findOne({ _id: req.params.certId, revoked: false });
  if (!c || c.verifyHash !== certHash(c)) fail(404, 'Chứng chỉ không tồn tại hoặc đã bị thu hồi');
  const origin = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const svg = await require('qrcode').toString(`${origin}/verify?certId=${encodeURIComponent(c._id)}`, { type: 'svg', width: 180 });
  res.type('image/svg+xml').send(svg);
}));
router.get('/certificates/verify/:certId', wrap(async (req, res) => {
  if (req.params.certId.length > 100) fail(404, 'Chứng chỉ không tồn tại hoặc đã bị thu hồi');
  const c = await db().collection('certificates').findOne({ _id: req.params.certId, revoked: false });
  if (!c || c.verifyHash !== certHash(c)) fail(404, 'Chứng chỉ không tồn tại hoặc đã bị thu hồi');
  res.json({ success: true, isValid: true, studentName: c.studentName, examTitle: c.examTitle, score: c.score, cefrLevel: c.cefrLevel, issuedDate: c.issuedDate, verifyHash: c.verifyHash, certId: c._id });
}));
router.get('/:id/questions', authenticateToken, staff, wrap(async (req, res) => {
  const exam = await getExam(req.params.id);
  const data = await db().collection('questions').find({ _id: { $in: exam.questions } }).toArray();
  res.json({ success: true, data });
}));
function questionFields(body) {
  const content = text(body.questionText ?? body.content, 'Nội dung câu hỏi');
  if (!Array.isArray(body.options) || body.options.length !== 4) fail(400, 'Cần đủ 4 đáp án A, B, C, D.');
  const options = body.options.map((o, i) => ({ key: 'ABCD'[i], text: text(typeof o === 'string' ? o : o.text, 'Đáp án', 2000) }));
  if (!['A', 'B', 'C', 'D'].includes(body.correctAnswer)) fail(400, 'Đáp án đúng không hợp lệ.');
  return { content, options, correctAnswer: body.correctAnswer, explanation: text(body.explanation, 'Giải thích') };
}
router.put('/questions/:questionId', authenticateToken, staff, wrap(async (req, res) => {
  const fields = questionFields(req.body);
  const r = await db().collection('questions').updateOne({ _id: id(req.params.questionId) }, { $set: fields });
  if (!r.matchedCount) fail(404, 'Câu hỏi không tồn tại.');
  res.json({ success: true });
}));
router.delete('/questions/:questionId', authenticateToken, authorizeRoles('ADMIN'), wrap(async (req, res) => {
  const qid = id(req.params.questionId);
  const r = await db().collection('questions').deleteOne({ _id: qid });
  if (!r.deletedCount) fail(404, 'Câu hỏi không tồn tại.');
  await db().collection('exams').updateMany({ questions: qid }, [{ $set: { questions: { $filter: { input: '$questions', as: 'q', cond: { $ne: ['$$q', qid] } } } } }, { $set: { totalQuestions: { $size: '$questions' } } }]);
  res.json({ success: true });
}));
module.exports = { router, ensureCatalog, certHash, questionFields };
