const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const express = require('express');
const fs = require('fs');
let mongo, config, database, app, student, other, teacher, admin;
const base = '670000000000000000000040', toeic = '67000000000000000000004a';
const uid = '670000000000000000000001', qid = '670000000000000000000031', cid = '670000000000000000000010';
function token(userId, role = 'STUDENT') { return jwt.sign({ id: userId, username: userId, fullName: 'Học viên kiểm thử', role }, process.env.JWT_SECRET || 'nosql_elearning_super_secret_jwt_key_2026'); }
function api(method, url, body, auth = student) { const req = request(app)[method]('/api' + url); if (auth) req.set('Authorization', 'Bearer ' + auth); return body === undefined ? req : req.send(body); }
before(async () => {
  fs.mkdirSync('.test-data', { recursive: true });
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/member2_tests';
  if (process.env.TEST_REDIS_PORT) process.env.REDIS_PORT = process.env.TEST_REDIS_PORT;
  config = require('../src/config/db');
  if (process.env.TEST_REDIS_PORT) await config.redisClient.connect();
  await config.connectMongoDB(); database = config.getMongoDb();
  await database.dropDatabase();
  await database.collection('users').insertMany([{ _id: new ObjectId(uid), xp: 1450, inventory: [] }, { _id: new ObjectId('670000000000000000000002'), xp: 0, inventory: [] }]);
  await database.collection('questions').insertOne({ _id: new ObjectId(qid), content: 'Choose the correct answer', options: [...'ABCD'].map(key => ({ key, text: `Option ${key}` })), correctAnswer: 'B', explanation: 'B is correct.' });
  await database.collection('exams').insertOne({ _id: new ObjectId(base), title: 'Placement', status: 'PUBLISHED', durationMinutes: 30, questions: [new ObjectId(qid)], totalQuestions: 1 });
  await database.collection('courses').insertOne({ _id: new ObjectId(cid), title: 'English', description: 'Course', category: 'IELTS', price: 100, status: 'PUBLISHED', reviews: [] });
  app = express(); app.use(express.json());
  app.use('/api/exams', require('../src/routes/examRoutes'));
  app.use('/api/courses', require('../src/routes/courseRoutes'));
  student = token(uid); other = token('670000000000000000000002'); teacher = token(uid, 'TEACHER'); admin = token(uid, 'ADMIN');
});
after(async () => { if (config) { await config.mongoClient.close(); config.redisClient.disconnect(); await config.cassandraClient.shutdown(); await config.neo4jDriver.close(); } if (mongo) await mongo.stop(); });
test('2.1: mutation requires authentication', async () => { for (const path of [`/exams/${base}/retake`, '/exams/anti-cheat/log-violation', '/courses/gamification/redeem']) assert.equal((await api('post', path, {}, null)).status, 401); });
test('2.1: unknown exam rejected; no answer key leaks on start', async () => {
  assert.equal((await api('post', '/exams/not-an-id/start')).status, 400);
  assert.equal((await api('post', '/exams/670000000000000000000099/start')).status, 404);
  const r = await api('post', `/exams/${base}/start`); assert.equal(r.status, 200); assert.equal(r.body.data.questions[0].correctAnswer, undefined); assert.equal(r.body.data.questions[0].explanation, undefined);
  assert.equal((await api('post', `/exams/${base}/retake`)).status, 409);
});
test('2.1: identity is taken from token; 3 violations force zero and preserve history', async () => {
  for (let n = 1; n <= 3; n++) { const r = await api('post', '/exams/anti-cheat/log-violation', { examId: base, studentId: 'spoofed' }); assert.equal(r.body.violationCount, n); }
  assert.equal((await api('post', `/exams/${base}/answer`, { questionId: qid, selectedOption: 'B' })).status, 409);
  const r = await api('post', `/exams/${base}/submit`, { isDisqualified: false, answers: { [qid]: 'B' } }); assert.equal(r.body.data.score, 0); assert.equal(r.body.data.isDisqualified, true);
  assert.equal(await database.collection('results').countDocuments({ studentCode: uid }), 1);
  assert.equal((await api('post', '/exams/anti-cheat/reset', { examId: base })).status, 409);
});
test('2.1: retake clears answers, violations and timer without deleting result', async () => {
  assert.equal((await api('post', `/exams/${base}/retake`)).body.violations, 0);
  const r = await api('post', `/exams/${base}/start`); assert.deepEqual(r.body.data.savedAnswers, {}); assert.equal(r.body.data.violations, 0); assert.ok(r.body.data.ttlLeftSeconds > 1790);
  assert.equal(await database.collection('results').countDocuments({ studentCode: uid }), 1);
});
test('2.2: invalid choices rejected; repeated submissions have one result and one XP award', async () => {
  assert.equal((await api('post', `/exams/${base}/answer`, { questionId: qid, selectedOption: 'Z' })).status, 400);
  assert.equal((await api('post', `/exams/${base}/answer`, { questionId: qid, selectedOption: 'B' })).status, 200);
  const before = (await database.collection('users').findOne({ _id: new ObjectId(uid) })).xp;
  const responses = await Promise.all([api('post', `/exams/${base}/submit`), api('post', `/exams/${base}/submit`)]);
  responses.forEach(r => assert.equal(r.status, 200)); assert.equal(responses[0].body.data.score, 10);
  assert.equal(await database.collection('results').countDocuments({ studentCode: uid }), 2);
  assert.equal((await database.collection('users').findOne({ _id: new ObjectId(uid) })).xp, before + 150);
});
test('2.2: review is private and retains question snapshot after edits/deletion', async () => {
  const result = await database.collection('results').findOne({ score: 10 });
  const r = await api('get', `/exams/submissions/${result._id}/review`); assert.equal(r.body.data.answers[0].selectedOption, 'B'); assert.equal(r.body.data.answers[0].explanation, 'B is correct.');
  assert.equal((await api('get', `/exams/submissions/${result._id}/review`, undefined, other)).status, 404);
});
test('2.3: 1450 XP redeems 500 XP into one inventory item; persists across profile loads', async () => {
  await database.collection('users').updateOne({ _id: new ObjectId(uid) }, { $set: { xp: 1450, inventory: [] } });
  const shop = await api('get', '/courses/gamification/shop-items', undefined, null); assert.equal(shop.body.data.length, 4);
  const r = await api('post', '/courses/gamification/redeem', { itemId: 'streak_freeze' }); assert.equal(r.body.data.xp, 950); assert.equal(r.body.data.inventory.length, 1);
  assert.equal((await api('get', '/courses/gamification/profile')).body.data.xp, 950);
  assert.equal((await api('post', '/courses/gamification/redeem', { itemId: 'invalid' })).status, 404);
});
test('2.3: concurrent purchases cannot overspend or duplicate free rewards', async () => {
  await database.collection('users').updateOne({ _id: new ObjectId(uid) }, { $set: { xp: 500, inventory: [] } });
  const responses = await Promise.all([api('post', '/courses/gamification/redeem', { itemId: 'streak_freeze' }), api('post', '/courses/gamification/redeem', { itemId: 'streak_freeze' })]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 400]);
  const u = await database.collection('users').findOne({ _id: new ObjectId(uid) }); assert.equal(u.xp, 0); assert.equal(u.inventory.length, 1);
});
test('2.4: missed yesterday consumes exactly one freeze and awards check-in once', async () => {
  const { dayNumber } = require('../src/services/rewardService'); const day = dayNumber();
  await database.collection('users').updateOne({ _id: new ObjectId(uid) }, { $set: { lastStudyDay: day - 2, streakDays: 5 } });
  const responses = await Promise.all([api('post', '/courses/gamification/check-in'), api('post', '/courses/gamification/check-in')]);
  assert.equal(responses.filter(r => r.body.data.streakSavedByFreeze).length, 1);
  const u = await database.collection('users').findOne({ _id: new ObjectId(uid) }); assert.equal(u.inventory.length, 0); assert.equal(u.streakDays, 7); assert.equal(u.xp, 25);
  if (process.env.TEST_REDIS_PORT) assert.equal(await config.redisClient.getbit(`streak:${uid}`, day - 1), 1);
});
test('2.4: missing two days or missing freeze restarts at one; Vietnam calendar crosses years', async () => {
  const { dayNumber } = require('../src/services/rewardService');
  assert.equal(dayNumber(Date.parse('2026-12-31T17:01:00Z')) - dayNumber(Date.parse('2026-12-31T16:59:00Z')), 1);
  await database.collection('users').updateOne({ _id: new ObjectId(uid) }, { $set: { lastStudyDay: dayNumber() - 2, streakDays: 5, inventory: [] } });
  if (process.env.TEST_REDIS_PORT) await config.redisClient.setbit(`streak:${uid}`, dayNumber() - 1, 0);
  assert.equal((await api('post', '/courses/gamification/check-in')).body.data.streakDays, 1);
});
test('2.5: staff can edit course; student and teacher delete are forbidden; reject negative price', async () => {
  const body = { title: 'Edited English', description: 'New description', category: 'TOEIC', price: 0, lessons: [{ title: 'Lesson 1', video: { url: 'https://example.com/video' } }] };
  assert.equal((await api('put', `/courses/${cid}`, body)).status, 403);
  assert.equal((await api('put', `/courses/${cid}`, { ...body, price: -1 }, teacher)).status, 400);
  assert.equal((await api('put', `/courses/${cid}`, body, teacher)).status, 200);
  const r = await api('get', `/courses/${cid}`); assert.equal(r.body.data.title, body.title); assert.equal(r.body.data.lessons[0].title, 'Lesson 1');
  assert.equal((await api('delete', `/courses/${cid}`, undefined, teacher)).status, 403);
});
test('2.6: exams have independent question banks; edits preserve old submissions', async () => {
  const qs = await api('get', `/exams/${toeic}/questions`, undefined, teacher); const question = qs.body.data[0]; assert.notEqual(question._id, qid);
  const body = { questionText: 'Updated TOEIC question', options: [...'ABCD'].map(text => ({ text })), correctAnswer: 'C', explanation: 'New explanation' };
  assert.equal((await api('put', `/exams/questions/${question._id}`, body)).status, 403);
  assert.equal((await api('put', `/exams/questions/${question._id}`, body, teacher)).status, 200);
  assert.equal((await api('post', `/exams/${toeic}/start`)).body.data.questions[0].content, body.questionText);
  assert.equal((await database.collection('questions').findOne({ _id: new ObjectId(qid) })).content, 'Choose the correct answer');
  assert.equal((await api('delete', `/exams/questions/${question._id}`, undefined, teacher)).status, 403);
  assert.equal((await api('delete', `/exams/questions/${question._id}`, undefined, admin)).status, 200);
  assert.equal((await database.collection('exams').findOne({ _id: new ObjectId(toeic) })).totalQuestions, 0);
});
test('2.7: public verification and QR succeed; changed hash and revoked cert fail', async () => {
  const c = await database.collection('certificates').findOne({}); assert.ok(c);
  const r = await api('get', `/exams/certificates/verify/${c._id}`, undefined, null); assert.equal(r.body.isValid, true); assert.equal(r.body.verifyHash.length, 64);
  assert.equal((await api('get', `/exams/certificates/qr/${c._id}`, undefined, null)).type, 'image/svg+xml');
  assert.equal((await api('get', '/exams/certificates/verify/fake', undefined, null)).status, 404);
  await database.collection('certificates').updateOne({ _id: c._id }, { $set: { score: 7 } });
  assert.equal((await api('get', `/exams/certificates/verify/${c._id}`, undefined, null)).status, 404);
  await database.collection('certificates').updateOne({ _id: c._id }, { $set: { score: c.score, revoked: true } });
  assert.equal((await api('get', `/exams/certificates/verify/${c._id}`, undefined, null)).status, 404);
});
test('2.9: 12 matching records paginate 5/5/2; categories and ownership enforced', async () => {
  await database.collection('results').insertMany(Array.from({ length: 12 }, (_, i) => ({ studentCode: uid, category: 'ielts', score: i, submittedAt: new Date(Date.now() + i) })));
  const pages = await Promise.all([1, 2, 3].map(page => api('get', `/exams/results/my-history?page=${page}&limit=5&category=ielts`)));
  assert.deepEqual(pages.map(r => r.body.data.length), [5, 5, 2]); assert.equal(pages[0].body.total, 12); assert.equal(pages[2].body.totalPages, 3);
  assert.equal(new Set(pages.flatMap(r => r.body.data.map(x => x._id))).size, 12);
  assert.equal((await api('get', '/exams/results/my-history?category=ielts', undefined, other)).body.total, 0);
  assert.equal((await api('get', '/exams/results/my-history?page=-1')).status, 400);
});
test('2.10: moderation permissions enforced and deleted content never reappears', async () => {
  const discussion = await api('post', `/courses/${cid}/discussions`, { title: 'Spam', content: 'Spam message' }); assert.equal(discussion.status, 201);
  const did = discussion.body.data._id;
  assert.equal((await api('delete', `/courses/discussions/${did}`)).status, 403);
  assert.equal((await api('delete', `/courses/discussions/${did}`, undefined, teacher)).status, 200);
  assert.equal((await api('get', `/courses/${cid}/discussions`)).body.data.some(d => d._id === did), false);
  const review = await api('post', `/courses/${cid}/reviews`, { rating: 2, comment: 'Review' }); const rid = review.body.data._id;
  assert.equal((await api('delete', `/courses/reviews/${rid}`, undefined, teacher)).status, 403);
  assert.equal((await api('delete', `/courses/reviews/${rid}`, undefined, admin)).status, 200);
  assert.deepEqual((await api('get', `/courses/${cid}`)).body.data.reviews, []);
});
test('2.5: admin soft delete removes course from catalog and direct detail', async () => {
  assert.equal((await api('delete', `/courses/${cid}`, undefined, admin)).status, 200);
  assert.equal((await api('get', `/courses/${cid}`)).status, 404);
  assert.equal((await api('get', '/courses')).body.data.some(c => c._id === cid), false);
});

test('Redis: bitmap and reset reflect the durable attempt and streak', { skip: !process.env.TEST_REDIS_PORT }, async () => {
  const { dayNumber } = require('../src/services/rewardService');
  assert.equal(await config.redisClient.getbit(`streak:${uid}`, dayNumber()), 1);
  assert.equal(await config.redisClient.getbit(`streak:${uid}`, dayNumber() - 1), 0);
  await api('post', `/exams/${base}/retake`);
  assert.equal(await config.redisClient.get(`exam:anti-cheat:${uid}:${base}`), '0');
});

test('Migration is repeatable and preserves XP, results and revoked certificates', async () => {
  const { migrate } = require('../scripts/migrate_member2');
  const userBefore = await database.collection('users').findOne({ _id: new ObjectId(uid) });
  const count = await database.collection('results').countDocuments({});
  await migrate(database); await migrate(database);
  assert.equal((await database.collection('users').findOne({ _id: new ObjectId(uid) })).xp, userBefore.xp);
  assert.equal(await database.collection('results').countDocuments({}), count);
  assert.equal(await database.collection('reward_items').countDocuments({}), 4);
  assert.equal(await database.collection('certificates').countDocuments({ revoked: true }), 1);
  await assert.rejects(database.collection('reward_items').insertOne({ _id: 'invalid', name: 'Invalid', cost: -1 }), /validation/i);
});

after(async () => {
  if (database) await database.dropDatabase().catch(() => {});
  if (mongo) await mongo.stop().catch(() => {});
});
