const path = require('path');
const { MongoClient, ObjectId } = require(path.join(__dirname, '../01_Source_Code_EduPro/node_modules/mongodb'));

async function sync() {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('elearning_nosql');
  const cId = new ObjectId('670000000000000000000010');
  const richLessons = await db.collection('lessons').find({ courseId: cId }).sort({ order: 1 }).toArray();
  console.log(`Found ${richLessons.length} rich lessons in lessons collection.`);
  
  await db.collection('courses').updateOne(
    { _id: cId },
    { 
      $set: { 
        lessons: richLessons, 
        totalLessons: richLessons.length,
        updatedAt: new Date()
      } 
    }
  );
  console.log('Successfully synced courses collection.');
  await client.close();
}

sync().catch(console.error);
