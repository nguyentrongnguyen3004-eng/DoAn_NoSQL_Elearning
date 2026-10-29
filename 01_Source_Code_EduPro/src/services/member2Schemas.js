// Validators are applied by npm run migrate:member2; existing LMS schemas stay untouched.
const schemas = {
  reward_items: {
    bsonType: 'object', required: ['_id', 'name', 'cost'],
    properties: { _id: { bsonType: 'string' }, name: { bsonType: 'string' }, cost: { bsonType: ['int', 'double'], minimum: 0 } }
  },
  exam_attempts: {
    bsonType: 'object', required: ['_id', 'attemptId', 'examId', 'studentId', 'questions', 'answers', 'status', 'violations', 'expiresAt'],
    properties: {
      _id: { bsonType: 'string' }, attemptId: { bsonType: 'string' }, examId: { bsonType: 'string' }, studentId: { bsonType: 'string' },
      questions: { bsonType: 'array' }, answers: { bsonType: 'object' }, violations: { bsonType: 'int', minimum: 0, maximum: 3 },
      status: { enum: ['in_progress', 'disqualified', 'submitted'] }, expiresAt: { bsonType: 'date' }
    }
  },
  certificates: {
    bsonType: 'object', required: ['_id', 'studentName', 'examTitle', 'score', 'cefrLevel', 'issuedDate', 'verifyHash', 'revoked'],
    properties: {
      _id: { bsonType: 'string' }, studentName: { bsonType: 'string' }, examTitle: { bsonType: 'string' },
      score: { bsonType: ['int', 'double'], minimum: 0, maximum: 10 }, cefrLevel: { bsonType: 'string' },
      issuedDate: { bsonType: 'date' }, verifyHash: { bsonType: 'string', pattern: '^[a-f0-9]{64}$' }, revoked: { bsonType: 'bool' }
    }
  }
};
async function applySchemas(db) {
  for (const [name, schema] of Object.entries(schemas)) {
    const options = { validator: { $jsonSchema: schema }, validationLevel: 'moderate', validationAction: 'error' };
    if (await db.listCollections({ name }).hasNext()) await db.command({ collMod: name, ...options });
    else await db.createCollection(name, options);
  }
}
module.exports = { applySchemas };
