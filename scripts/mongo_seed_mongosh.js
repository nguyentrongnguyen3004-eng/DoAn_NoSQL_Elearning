// ==============================================================================
// MONGOSH SCRIPT: SEED DATA CHO ELEANING_NOSQL TRUC TIEP TREN SHELL
// ==============================================================================

const dbName = 'elearning_nosql';
const dbTarget = db.getSiblingDB(dbName);

print('--- DANG TAO INDEXES MONGODB ---');
dbTarget.users.createIndex({ email: 1 }, { unique: true });
dbTarget.users.createIndex({ username: 1 }, { unique: true });
dbTarget.courses.createIndex({ code: 1 }, { unique: true });
dbTarget.lessons.createIndex({ courseId: 1, order: 1 });
dbTarget.questions.createIndex({ subject: 1, difficulty: 1 });
dbTarget.exams.createIndex({ courseId: 1, status: 1 });
dbTarget.results.createIndex({ examId: 1, studentId: 1 });

print('--- SEEDING USERS ---');
dbTarget.users.deleteMany({});
dbTarget.users.insertMany([
  {
    _id: ObjectId('670000000000000000000001'),
    username: 'admin',
    email: 'admin@huit.edu.vn',
    fullName: 'Quan Tri Vien He Thong',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date()
  },
  {
    _id: ObjectId('670000000000000000000002'),
    username: 'dinhnt',
    email: 'dinhnt@huit.edu.vn',
    fullName: 'TS. Nguyen Thi Dinh',
    role: 'TEACHER',
    department: 'He thong thong tin - Khoa CNTT',
    status: 'ACTIVE',
    createdAt: new Date()
  },
  {
    _id: ObjectId('670000000000000000000003'),
    username: '2001230589',
    email: 'trongnguyen@student.huit.edu.vn',
    fullName: 'Nguyen Trong Nguyen',
    role: 'STUDENT',
    class: '14DH',
    status: 'ACTIVE',
    createdAt: new Date()
  },
  {
    _id: ObjectId('670000000000000000000004'),
    username: '2001230578',
    email: 'khoinguyen@student.huit.edu.vn',
    fullName: 'Pham Nguyen Khoi Nguyen',
    role: 'STUDENT',
    class: '14DH',
    status: 'ACTIVE',
    createdAt: new Date()
  },
  {
    _id: ObjectId('670000000000000000000005'),
    username: '2001230303',
    email: 'giahuy@student.huit.edu.vn',
    fullName: 'Vo Huynh Gia Huy',
    role: 'STUDENT',
    class: '14DH',
    status: 'ACTIVE',
    createdAt: new Date()
  }
]);

print('--- SEEDING COURSES ---');
dbTarget.courses.deleteMany({});
const courseId = ObjectId('670000000000000000000010');
dbTarget.courses.insertOne({
  _id: courseId,
  code: '01201073',
  title: 'Du lieu NoSQL',
  instructorId: ObjectId('670000000000000000000002'),
  instructorName: 'TS. Nguyen Thi Dinh',
  credits: 2,
  description: 'Mon hoc cung cap kien thuc ve 4 he CSDL NoSQL: MongoDB, Redis, Cassandra va Neo4j.',
  totalLessons: 5,
  status: 'PUBLISHED',
  createdAt: new Date()
});

print('--- SEEDING LESSONS ---');
dbTarget.lessons.deleteMany({});
dbTarget.lessons.insertMany([
  {
    _id: ObjectId('670000000000000000000021'),
    courseId: courseId,
    order: 1,
    title: 'Tong quan ve NoSQL va So sanh voi RDBMS',
    content: 'NoSQL ra doi nham giai quyet bai toan du lieu lon (Big Data), do tre thap va kha nang mo rong ngang...',
    video: {
      url: 'https://video.huit.edu.vn/nosql-ch1.mp4',
      durationSeconds: 1800
    }
  },
  {
    _id: ObjectId('670000000000000000000022'),
    courseId: courseId,
    order: 2,
    title: 'He quan tri CSDL Document - MongoDB',
    content: 'MongoDB luu tru du lieu duoi dang BSON/JSON, ho tro linh hoat mo hinh Embedded va Reference...',
    video: {
      url: 'https://video.huit.edu.vn/nosql-mongodb.mp4',
      durationSeconds: 2400
    }
  },
  {
    _id: ObjectId('670000000000000000000023'),
    courseId: courseId,
    order: 3,
    title: 'He CSDL Key-Value - Redis va Ky thuat Cache',
    content: 'Redis la In-memory datastore voi toc do doc/ghi vuot troi, ho tro TTL, ZSET va Pub/Sub...',
    video: {
      url: 'https://video.huit.edu.vn/nosql-redis.mp4',
      durationSeconds: 2100
    }
  }
]);

print('--- SEEDING QUESTIONS ---');
dbTarget.questions.deleteMany({});
dbTarget.questions.insertMany([
  {
    _id: ObjectId('670000000000000000000031'),
    subject: 'NoSQL',
    topic: 'MongoDB',
    difficulty: 'EASY',
    content: 'Dinh dang luu tru du lieu mac dinh ben trong cua MongoDB la gi?',
    options: [
      { key: 'A', text: 'XML' },
      { key: 'B', text: 'BSON (Binary JSON)' },
      { key: 'C', text: 'CSV' },
      { key: 'D', text: 'YAML' }
    ],
    correctAnswer: 'B',
    explanation: 'MongoDB su dung BSON de ma hoa va bieu dien cac document.'
  },
  {
    _id: ObjectId('670000000000000000000032'),
    subject: 'NoSQL',
    topic: 'Redis',
    difficulty: 'MEDIUM',
    content: 'Kieu du lieu nao trong Redis phu hop nhat de xay dung bang xep hang (Leaderboard) theo diem so?',
    options: [
      { key: 'A', text: 'String' },
      { key: 'B', text: 'List' },
      { key: 'C', text: 'Sorted Set (ZSET)' },
      { key: 'D', text: 'Hash' }
    ],
    correctAnswer: 'C',
    explanation: 'Sorted Set lien ket moi thanh vien voi mot diem so (score) va tu dong sap xep.'
  },
  {
    _id: ObjectId('670000000000000000000033'),
    subject: 'NoSQL',
    topic: 'Cassandra',
    difficulty: 'HARD',
    content: 'Trong Apache Cassandra, thanh phan nao quyet dinh node nao se luu tru ban ghi tren cluster?',
    options: [
      { key: 'A', text: 'Clustering Key' },
      { key: 'B', text: 'Partition Key' },
      { key: 'C', text: 'Index Key' },
      { key: 'D', text: 'Foreign Key' }
    ],
    correctAnswer: 'B',
    explanation: 'Partition key duoc dua vao ham băm de xac dinh vi tri phan vung du lieu.'
  },
  {
    _id: ObjectId('670000000000000000000034'),
    subject: 'NoSQL',
    topic: 'Neo4j',
    difficulty: 'EASY',
    content: 'Ngon ngu truy van do thi chinh thuc duoc su dung trong Neo4j la gi?',
    options: [
      { key: 'A', text: 'SQL' },
      { key: 'B', text: 'GraphQL' },
      { key: 'C', text: 'Cypher' },
      { key: 'D', text: 'SPARQL' }
    ],
    correctAnswer: 'C',
    explanation: 'Cypher la ngon ngu truy van khai bao mau khop duong di trong do thi cua Neo4j.'
  }
]);

print('--- SEEDING EXAMS ---');
dbTarget.exams.deleteMany({});
const examId = ObjectId('670000000000000000000040');
dbTarget.exams.insertOne({
  _id: examId,
  title: 'Kiem Tra Giua Ky - Mon Du Lieu NoSQL',
  courseId: courseId,
  durationMinutes: 30,
  totalQuestions: 4,
  questions: [
    ObjectId('670000000000000000000031'),
    ObjectId('670000000000000000000032'),
    ObjectId('670000000000000000000033'),
    ObjectId('670000000000000000000034')
  ],
  status: 'PUBLISHED',
  createdAt: new Date()
});

print('--- SEEDING RESULTS ---');
dbTarget.results.deleteMany({});
dbTarget.results.insertMany([
  {
    _id: ObjectId('670000000000000000000051'),
    examId: examId,
    studentId: ObjectId('670000000000000000000003'),
    studentName: 'Nguyen Trong Nguyen',
    score: 10.0,
    correctCount: 4,
    totalCount: 4,
    submittedAt: new Date()
  },
  {
    _id: ObjectId('670000000000000000000052'),
    examId: examId,
    studentId: ObjectId('670000000000000000000004'),
    studentName: 'Pham Nguyen Khoi Nguyen',
    score: 7.5,
    correctCount: 3,
    totalCount: 4,
    submittedAt: new Date()
  }
]);

print('=== DA HOAN THANH SEED DU LIEU MONGODB THANH CONG! ===');
