const { MongoClient } = require('../01_Source_Code_EduPro/node_modules/mongodb');
const { FLASHCARDS_150, TOPIC_METADATA } = require('../01_Source_Code_EduPro/src/data/flashcardsData');

async function seedFlashcards() {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('elearning_nosql');
    const col = db.collection('flashcards');

    console.log(`Seeding ${FLASHCARDS_150.length} authentic flashcards into MongoDB collection \`flashcards\`...`);
    await col.deleteMany({});
    const res = await col.insertMany(FLASHCARDS_150);
    console.log(`Successfully inserted ${res.insertedCount} flashcards!`);

    await col.createIndex({ category: 1, word: 1 });
    await col.createIndex({ id: 1 }, { unique: true });
    console.log('Created indexes: { category: 1, word: 1 } and { id: 1 } unique.');

    // Clean up junk test records in custom_flashcards
    const customCol = db.collection('custom_flashcards');
    const delJunk = await customCol.deleteMany({ userId: { $in: [null, undefined, 'undefined'] } });
    console.log(`Cleaned up ${delJunk.deletedCount} junk records from custom_flashcards.`);

    // Summary counts per topic
    console.log(`\nVerified Counts in MongoDB by Topic:`);
    for (const meta of TOPIC_METADATA) {
      const count = await col.countDocuments({ category: meta.category });
      console.log(` - ${meta.icon} ${meta.category}: ${count} từ`);
    }
    const total = await col.countDocuments();
    console.log(` - Tổng cộng trong DB: ${total} từ\n`);

    await client.close();
  } catch (err) {
    console.error('Error seeding flashcards:', err.message);
  }
}

seedFlashcards();
