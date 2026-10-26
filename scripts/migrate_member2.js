// Non-destructive migration: indexes, inventory, reward catalog, independent exam banks.
require('dotenv').config();
const { mongoClient, connectMongoDB, redisClient, cassandraClient, neo4jDriver } = require('../src/config/db');
const { ObjectId } = require('mongodb');
const { seedItems } = require('../src/services/rewardService');
const { ensureCatalog, certHash } = require('../src/routes/member2ExamRoutes');
async function migrate(database) {
  await require('../src/services/member2Schemas').applySchemas(database);
  await database.collection('results').createIndex({ studentCode: 1, category: 1, submittedAt: -1, _id: -1 });
  await database.collection('results').createIndex({ studentCode: 1, submittedAt: -1, _id: -1 });
  await database.collection('exam_audit').createIndex({ attemptId: 1, createdAt: -1 });
  await database.collection('discussions').createIndex({ courseId: 1, createdAt: -1 });
  await database.collection('certificates').createIndex({ submissionId: 1 }, { unique: true, sparse: true });
  const users = await database.collection('users').find({}).toArray();
  for (const user of users) {
    const oldResults = await database.collection('results').find({ studentCode: user.username, isDisqualified: { $ne: true } }).toArray();
    if (user.xp === undefined) await database.collection('users').updateOne({ _id: user._id, xp: { $exists: false } }, { $set: { xp: oldResults.length * 150, rewardedAttempts: oldResults.map(r => r._id) } });
    if (!Array.isArray(user.inventory)) await database.collection('users').updateOne({ _id: user._id }, { $set: { inventory: [] } });
  }
  const courses = await database.collection('courses').find({ reviews: { $exists: true } }).toArray();
  for (const c of courses) {
    const reviews = c.reviews.map(r => ({ ...r, _id: r._id || new ObjectId() }));
    await database.collection('courses').updateOne({ _id: c._id }, { $set: { reviews, reviewsCount: reviews.length } });
  }
  const results = await database.collection('results').find({}).toArray();
  for (const r of results) {
    const title = r.examTitle || '';
    const category = r.category || (/^Đánh Giá|placement/i.test(title) ? 'placement' : /toeic/i.test(title) ? 'toeic' : /ielts/i.test(title) ? 'ielts' : 'grammar');
    await database.collection('results').updateOne({ _id: r._id }, { $set: { category } });
    if (r.score >= 5 && !r.isDisqualified && r.studentName && r.submittedAt) {
      const c = { _id: 'EDUPRO-' + r._id, submissionId: r._id, studentName: r.studentName, examTitle: title, score: r.score, cefrLevel: r.score >= 9 ? 'C1' : r.score >= 7 ? 'B2' : 'B1', issuedDate: r.submittedAt, revoked: false };
      c.verifyHash = certHash(c);
      await database.collection('certificates').updateOne({ _id: c._id }, { $setOnInsert: c }, { upsert: true });
      await database.collection('results').updateOne({ _id: r._id }, { $set: { certificateId: c._id } });
    }
  }
  await seedItems(); await ensureCatalog();
}
if (require.main === module) (async () => {
  try { const database = await connectMongoDB(); if (!database) throw new Error('Không kết nối được MongoDB.'); await migrate(database); console.log('Đã bổ sung dữ liệu thành viên 2; không xóa dữ liệu hiện có.'); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { await mongoClient.close(); redisClient.disconnect(); await cassandraClient.shutdown(); await neo4jDriver.close(); }
})();
module.exports = { migrate };
