// ==============================================================================
// HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
// SCRIPT KHOI TAO SCHEMA & SEED DATA CHO MONGODB
// NHOM 18: NEN TANG E-LEARNING & LUYEN THI TRAC NGHIEM
// ==============================================================================

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/elearning_nosql';

async function seedMongoDB() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Da ket noi thanh cong toi MongoDB!');
    const db = client.db('elearning_nosql');

    // 1. TAO INDEX CHO CAC COLLECTION
    console.log('Dang tao Indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('courses').createIndex({ code: 1 }, { unique: true });
    await db.collection('lessons').createIndex({ courseId: 1, order: 1 });
    await db.collection('questions').createIndex({ subject: 1, difficulty: 1 });
    await db.collection('exams').createIndex({ courseId: 1, status: 1 });
    await db.collection('results').createIndex({ examId: 1, studentId: 1 });

    // 2. SEED USERS (3 ROLES THEO SRS: Sinh vien, Giang vien, Quan tri vien)
    console.log('Seeding Users...');
    await db.collection('users').deleteMany({});
    const users = [
      {
        _id: new ObjectId('670000000000000000000001'),
        username: 'admin',
        email: 'admin@huit.edu.vn',
        passwordHash: '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8H7D5p412XN930v21hWk0Q4eT8nI6S', // mật khẩu: admin123
        fullName: 'Quan Tri Vien He Thong',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000002'),
        username: 'dinhnt',
        email: 'dinhnt@huit.edu.vn',
        fullName: 'TS. Nguyen Thi Dinh',
        role: 'TEACHER',
        department: 'He thong thong tin - Khoa CNTT',
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000003'),
        username: '2001230589',
        email: 'trongnguyen@student.huit.edu.vn',
        fullName: 'Nguyen Trong Nguyen',
        role: 'STUDENT',
        class: '14DH',
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000004'),
        username: '2001230578',
        email: 'khoinguyen@student.huit.edu.vn',
        fullName: 'Pham Nguyen Khoi Nguyen',
        role: 'STUDENT',
        class: '14DH',
        status: 'ACTIVE',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000005'),
        username: '2001230303',
        email: 'giahuy@student.huit.edu.vn',
        fullName: 'Vo Huynh Gia Huy',
        role: 'STUDENT',
        class: '14DH',
        status: 'ACTIVE',
        createdAt: new Date()
      }
    ];
    await db.collection('users').insertMany(users);

    // 3. SEED COURSES
    console.log('Seeding Courses...');
    await db.collection('courses').deleteMany({});
    const courseId = new ObjectId('670000000000000000000010');
    const courses = [
      {
        _id: courseId,
        code: '01201073',
        title: 'Du lieu NoSQL',
        instructorId: new ObjectId('670000000000000000000002'),
        instructorName: 'TS. Nguyen Thi Dinh',
        credits: 2,
        description: 'Mon hoc cung cap kien thuc ve 4 he CSDL NoSQL: MongoDB, Redis, Cassandra va Neo4j.',
        thumbnail: 'https://cdn.huit.edu.vn/courses/nosql.png',
        totalLessons: 5,
        status: 'PUBLISHED',
        createdAt: new Date()
      }
    ];
    await db.collection('courses').insertMany(courses);

    // 4. SEED LESSONS
    console.log('Seeding Lessons...');
    await db.collection('lessons').deleteMany({});
    const lessons = [
      {
        _id: new ObjectId('670000000000000000000021'),
        courseId: courseId,
        order: 1,
        title: 'Tong quan ve NoSQL va So sanh voi RDBMS',
        content: 'NoSQL ra doi nham giai quyet bai toan du lieu lon (Big Data), do tre thap va kha nang mo rong ngang...',
        video: {
          url: 'https://video.huit.edu.vn/nosql-ch1.mp4',
          durationSeconds: 1800
        },
        materials: ['slide_ch1.pdf', 'tailieu_thamkhao.docx']
      },
      {
        _id: new ObjectId('670000000000000000000022'),
        courseId: courseId,
        order: 2,
        title: 'He quan tri CSDL Document - MongoDB',
        content: 'MongoDB luu tru du lieu duoi dang BSON/JSON, ho tro linh hoat mo hinh Embedded va Reference...',
        video: {
          url: 'https://video.huit.edu.vn/nosql-mongodb.mp4',
          durationSeconds: 2400
        },
        materials: ['lab_mongodb.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000023'),
        courseId: courseId,
        order: 3,
        title: 'He CSDL Key-Value - Redis va Ky thuat Cache',
        content: 'Redis la In-memory datastore voi toc do doc/ghi vuot troi, ho tro TTL, ZSET va Pub/Sub...',
        video: {
          url: 'https://video.huit.edu.vn/nosql-redis.mp4',
          durationSeconds: 2100
        },
        materials: ['lab_redis.pdf']
      }
    ];
    await db.collection('lessons').insertMany(lessons);

    // 5. SEED QUESTIONS (Ngan hang cau hoi trac nghiem)
    console.log('Seeding Questions...');
    await db.collection('questions').deleteMany({});
    const questions = [
      {
        _id: new ObjectId('670000000000000000000031'),
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
        explanation: 'MongoDB su dung BSON de ma hoa va bieu dien cac document mot cach nho gon va ho tro them nhieu kieu du lieu.'
      },
      {
        _id: new ObjectId('670000000000000000000032'),
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
        explanation: 'Sorted Set lien ket moi thanh vien voi mot diem so (score) va luon tu dong sap xep thu tu.'
      },
      {
        _id: new ObjectId('670000000000000000000033'),
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
        explanation: 'Partition key duoc dua vao ham băm (Murmur3Partitioner) de xac dinh vi tri phan vung du lieu tren vong cluster.'
      },
      {
        _id: new ObjectId('670000000000000000000034'),
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
    ];
    await db.collection('questions').insertMany(questions);

    // 6. SEED EXAMS (Ky thi trac nghiem)
    console.log('Seeding Exams...');
    await db.collection('exams').deleteMany({});
    const examId = new ObjectId('670000000000000000000040');
    const exams = [
      {
        _id: examId,
        title: 'Kiem Tra Giua Ky - Mon Du Lieu NoSQL',
        courseId: courseId,
        durationMinutes: 30,
        totalQuestions: 4,
        questions: [
          new ObjectId('670000000000000000000031'),
          new ObjectId('670000000000000000000032'),
          new ObjectId('670000000000000000000033'),
          new ObjectId('670000000000000000000034')
        ],
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-10-30T17:00:00Z'),
        status: 'PUBLISHED'
      }
    ];
    await db.collection('exams').insertMany(exams);

    // 7. SEED RESULTS (Ket qua nop bai ben vung sau khi cham diem)
    console.log('Seeding Results...');
    await db.collection('results').deleteMany({});
    const results = [
      {
        _id: new ObjectId('670000000000000000000051'),
        examId: examId,
        studentId: new ObjectId('670000000000000000000003'),
        studentName: 'Nguyen Trong Nguyen',
        submittedAt: new Date('2026-10-14T09:30:00Z'),
        score: 10.0,
        correctCount: 4,
        totalCount: 4,
        answers: [
          { questionId: new ObjectId('670000000000000000000031'), selected: 'B', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000032'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000033'), selected: 'B', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000034'), selected: 'C', isCorrect: true }
        ]
      },
      {
        _id: new ObjectId('670000000000000000000052'),
        examId: examId,
        studentId: new ObjectId('670000000000000000000004'),
        studentName: 'Pham Nguyen Khoi Nguyen',
        submittedAt: new Date('2026-10-14T09:45:00Z'),
        score: 7.5,
        correctCount: 3,
        totalCount: 4,
        answers: [
          { questionId: new ObjectId('670000000000000000000031'), selected: 'B', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000032'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000033'), selected: 'A', isCorrect: false },
          { questionId: new ObjectId('670000000000000000000034'), selected: 'C', isCorrect: true }
        ]
      }
    ];
    await db.collection('results').insertMany(results);

    console.log('=== HOAN THANH KHOI TAO DU LIEU MAU MONGODB ===');
  } catch (err) {
    console.error('Loi seed MongoDB:', err.message);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seedMongoDB();
}

module.exports = { seedMongoDB };
