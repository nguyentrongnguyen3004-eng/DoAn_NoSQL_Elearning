const path = require('path');
const { MongoClient } = require(path.join(__dirname, '../01_Source_Code_EduPro/node_modules/mongodb'));

async function updateDb() {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('elearning_nosql');

  // 1. Update courses
  const courseRes = await db.collection('courses').updateMany(
    { instructorName: { $regex: /Định|Dinh/i } },
    { $set: { instructorName: 'Ban Chuyên Môn EduPro (IELTS 8.5+)', updatedAt: new Date() } }
  );
  console.log(`Updated ${courseRes.modifiedCount} courses in MongoDB.`);

  // 2. Update users
  const userRes = await db.collection('users').updateMany(
    { fullName: { $regex: /Định|Dinh/i } },
    { 
      $set: { 
        fullName: 'Ban Chuyên Môn EduPro (IELTS 8.5+)',
        email: 'chuyenmon@edupro.huit.edu.vn',
        updatedAt: new Date()
      } 
    }
  );
  console.log(`Updated ${userRes.modifiedCount} users in MongoDB.`);

  // 3. Update any discussions / reviews mentioning Dinh
  const discRes = await db.collection('discussions').updateMany(
    { 'replies.authorName': { $regex: /Định|Dinh/i } },
    { $set: { 'replies.$[elem].authorName': 'Ban Chuyên Môn EduPro (Giảng viên)' } },
    { arrayFilters: [{ 'elem.authorName': { $regex: /Định|Dinh/i } }] }
  );
  console.log(`Updated discussions.`);

  await client.close();
  console.log('MongoDB update complete.');
}

updateDb().catch(console.error);
