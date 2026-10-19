// ==============================================================================
// HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
// SCRIPT KHOI TAO SCHEMA & SEED DATA ĐA DẠNG QUY MÔ LỚN CHO MONGODB
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
    await db.collection('courses').createIndex({ title: 'text', description: 'text', tagline: 'text' });
    await db.collection('lessons').createIndex({ courseId: 1, order: 1 });
    await db.collection('questions').createIndex({ subject: 1, difficulty: 1 });
    await db.collection('exams').createIndex({ courseId: 1, status: 1 });
    await db.collection('results').createIndex({ examId: 1, studentId: 1 });

    // 2. SEED USERS
    console.log('Seeding Users...');
    await db.collection('users').deleteMany({});
    const users = [
      {
        _id: new ObjectId('670000000000000000000001'),
        username: 'admin',
        email: 'admin@huit.edu.vn',
        passwordHash: '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8H7D5p412XN930v21hWk0Q4eT8nI6S', // admin123
        fullName: 'Quản Trị Viên Hệ Thống',
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000002'),
        username: 'dinhnt',
        email: 'dinhnt@huit.edu.vn',
        fullName: 'TS. Nguyễn Thị Định',
        role: 'TEACHER',
        department: 'Hệ thống thông tin - Khoa CNTT',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000003'),
        username: '2001230589',
        email: 'trongnguyen@student.huit.edu.vn',
        fullName: 'Nguyễn Trọng Nguyên',
        role: 'STUDENT',
        class: '14DH',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000004'),
        username: '2001230578',
        email: 'khoinguyen@student.huit.edu.vn',
        fullName: 'Phạm Nguyễn Khôi Nguyên',
        role: 'STUDENT',
        class: '14DH',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000005'),
        username: '2001230303',
        email: 'giahuy@student.huit.edu.vn',
        fullName: 'Võ Huỳnh Gia Huy',
        role: 'STUDENT',
        class: '14DH',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000006'),
        username: 'instructor_alex',
        email: 'alex.hoang@huit.edu.vn',
        fullName: 'ThS. Hoàng Minh Đức',
        role: 'TEACHER',
        department: 'Khoa học Máy tính',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000007'),
        username: 'instructor_lan',
        email: 'huonglan.do@huit.edu.vn',
        fullName: 'TS. Đỗ Thị Hương Lan',
        role: 'TEACHER',
        department: 'Trí Tuệ Nhân Tạo & Dữ Liệu',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      }
    ];
    await db.collection('users').insertMany(users);

    // 3. SEED COURSES (DANH MỤC KHÓA HỌC PHONG PHÚ: 12 KHÓA HỌC CHUYÊN SÂU ĐỦ CÁC LĨNH VỰC)
    console.log('Seeding Courses...');
    await db.collection('courses').deleteMany({});
    
    const courseId1 = new ObjectId('670000000000000000000010');
    const courseId2 = new ObjectId('670000000000000000000011');
    const courseId3 = new ObjectId('670000000000000000000012');
    const courseId4 = new ObjectId('670000000000000000000013');
    const courseId5 = new ObjectId('670000000000000000000014');
    const courseId6 = new ObjectId('670000000000000000000015');
    const courseId7 = new ObjectId('670000000000000000000016');
    const courseId8 = new ObjectId('670000000000000000000017');
    const courseId9 = new ObjectId('670000000000000000000018');
    const courseId10 = new ObjectId('670000000000000000000019');
    const courseId11 = new ObjectId('67000000000000000000001a');
    const courseId12 = new ObjectId('67000000000000000000001b');

    const courses = [
      // 1. Data Engineering
      {
        _id: courseId1,
        code: '01201073',
        title: 'Kiến Trúc Dữ Liệu NoSQL Enterprise',
        tagline: 'Làm chủ 4 hệ quản trị NoSQL chuẩn công nghiệp: MongoDB, Redis, Cassandra & Neo4j.',
        instructorId: new ObjectId('670000000000000000000002'),
        instructorName: 'TS. Nguyễn Thị Định',
        category: 'Data Engineering',
        credits: 3,
        price: 1890000,
        originalPrice: 2490000,
        rating: 4.95,
        reviewsCount: 1480,
        durationHours: 36,
        description: 'Môn học cốt lõi cung cấp kiến trúc chuyên sâu về Polyglot Persistence, thiết kế phân vùng Sharding, In-Memory Caching và đồ thị tri thức.',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        totalLessons: 4,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId2,
        code: 'DE-201',
        title: 'Xây Dựng Data Pipeline & Real-Time Streaming',
        tagline: 'Kỹ thuật xử lý luồng dữ liệu lớn với Apache Kafka, Spark Streaming và Cassandra Data Lake.',
        instructorId: new ObjectId('670000000000000000000006'),
        instructorName: 'ThS. Hoàng Minh Đức',
        category: 'Data Engineering',
        credits: 3,
        price: 2190000,
        originalPrice: 2990000,
        rating: 4.9,
        reviewsCount: 920,
        durationHours: 42,
        description: 'Học cách thiết kế pipeline dữ liệu triệu bản ghi mỗi giây, chuẩn hóa ETL/ELT và lưu trữ phân tán bền vững.',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId5,
        code: 'GRAPH-501',
        title: 'Neo4j & Đồ Thị Tri Thức Cho Mạng Xã Hội',
        tagline: 'Phân tích mối quan hệ dữ liệu phức tạp, Graph AI, Fraud Detection và Gợi ý khóa học thông minh.',
        instructorId: new ObjectId('670000000000000000000002'),
        instructorName: 'TS. Nguyễn Thị Định',
        category: 'Data Engineering',
        credits: 2,
        price: 1750000,
        originalPrice: 2200000,
        rating: 4.96,
        reviewsCount: 760,
        durationHours: 28,
        description: 'Làm chủ ngôn ngữ Cypher, tối ưu thuật toán tìm đường đi ngắn nhất Dijkstra, và xây dựng Knowledge Graph doanh nghiệp.',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId7,
        code: 'DE-202',
        title: 'Apache Spark & Big Data Analytics với PySpark',
        tagline: 'Xử lý dữ liệu phân tán quy mô Terabyte, tối ưu hóa RDD, DataFrame và kiến trúc Hadoop HDFS.',
        instructorId: new ObjectId('670000000000000000000002'),
        instructorName: 'TS. Nguyễn Thị Định',
        category: 'Data Engineering',
        credits: 3,
        price: 2290000,
        originalPrice: 2890000,
        rating: 4.93,
        reviewsCount: 1120,
        durationHours: 40,
        description: 'Thành thạo lập trình PySpark xử lý song song phân tán trên cluster, xây dựng mô hình trích xuất dữ liệu tự động.',
        thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },

      // 2. Fullstack Development
      {
        _id: courseId3,
        code: 'FS-301',
        title: 'Fullstack Microservices với Node.js & React',
        tagline: 'Phát triển hệ sinh thái ứng dụng quy mô lớn, Event-Driven Architecture và Docker Container.',
        instructorId: new ObjectId('670000000000000000000006'),
        instructorName: 'ThS. Hoàng Minh Đức',
        category: 'Fullstack Development',
        credits: 4,
        price: 2450000,
        originalPrice: 3200000,
        rating: 4.88,
        reviewsCount: 2150,
        durationHours: 48,
        description: 'Khóa học thực chiến giúp lập trình viên thành thạo xây dựng API Gateway, Microservices, xác thực JWT, Redis Session và UI hiện đại.',
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId6,
        code: 'FS-302',
        title: 'Bảo Mật Ứng Dụng Web & An Toàn API Enterprise',
        tagline: 'Phòng chống OWASP Top 10, phân quyền RBAC/ABAC, mã hóa end-to-end và Rate Limiting.',
        instructorId: new ObjectId('670000000000000000000001'),
        instructorName: 'Quản Trị Viên Hệ Thống',
        category: 'Fullstack Development',
        credits: 3,
        price: 1950000,
        originalPrice: 2600000,
        rating: 4.87,
        reviewsCount: 610,
        durationHours: 30,
        description: 'Kỹ thuật bảo mật toàn diện cho hệ thống: chống tấn công DDoS, SQL/NoSQL Injection, bảo vệ khóa JWT và kiểm thử thâm nhập an toàn.',
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId8,
        code: 'FS-303',
        title: 'Next.js 15, TypeScript & Tailwind CSS Fullstack',
        tagline: 'Xây dựng ứng dụng web hiện đại với Server Components, SSR/SSG và Server Actions chuẩn quốc tế.',
        instructorId: new ObjectId('670000000000000000000006'),
        instructorName: 'ThS. Hoàng Minh Đức',
        category: 'Fullstack Development',
        credits: 3,
        price: 1990000,
        originalPrice: 2790000,
        rating: 4.94,
        reviewsCount: 1850,
        durationHours: 38,
        description: 'Làm chủ framework web dẫn đầu thị trường với kiến trúc App Router, tối ưu SEO, Core Web Vitals và thiết kế Glassmorphism.',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },

      // 3. DevOps & Cloud
      {
        _id: courseId4,
        code: 'DEV-401',
        title: 'DevOps & Triển Khai Kubernetes Trên Cloud',
        tagline: 'Tự động hóa CI/CD, Container Orchestration với K8s, Docker Swarm và giám sát Prometheus.',
        instructorId: new ObjectId('670000000000000000000001'),
        instructorName: 'Quản Trị Viên Hệ Thống',
        category: 'DevOps & Cloud',
        credits: 3,
        price: 2350000,
        originalPrice: 3100000,
        rating: 4.92,
        reviewsCount: 840,
        durationHours: 32,
        description: 'Lộ trình chuyển đổi số toàn diện: Triển khai cụm Kubernetes, cấu hình Ingress, Helm chart, và quản trị cụm database đa đám mây.',
        thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId9,
        code: 'DEV-402',
        title: 'AWS Certified Solutions Architect & Terraform IaC',
        tagline: 'Thiết kế hạ tầng chịu tải cao trên Amazon Web Services, tự động hóa với Terraform Code.',
        instructorId: new ObjectId('670000000000000000000001'),
        instructorName: 'Quản Trị Viên Hệ Thống',
        category: 'DevOps & Cloud',
        credits: 4,
        price: 2690000,
        originalPrice: 3500000,
        rating: 4.97,
        reviewsCount: 1420,
        durationHours: 46,
        description: 'Luyện thi chứng chỉ AWS SAA-C03 và thành thạo hạ tầng code hóa: VPC đa vùng, Auto Scaling, RDS Multi-AZ, S3 và CloudFront.',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },

      // 4. Trí Tuệ Nhân Tạo & AI Engineering
      {
        _id: courseId10,
        code: 'AI-601',
        title: 'Xây Dựng Ứng Dụng Generative AI & RAG Chuyên Sâu',
        tagline: 'Tích hợp Large Language Models (LLMs), Vector Database Milvus/Pinecone và LangChain Framework.',
        instructorId: new ObjectId('670000000000000000000007'),
        instructorName: 'TS. Đỗ Thị Hương Lan',
        category: 'AI & Data Science',
        credits: 3,
        price: 2890000,
        originalPrice: 3800000,
        rating: 4.98,
        reviewsCount: 2310,
        durationHours: 44,
        description: 'Kỹ thuật tiên tiến nhất về Retrieval-Augmented Generation (RAG), Fine-tuning mô hình ngôn ngữ và xây dựng AI Agent doanh nghiệp.',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId11,
        code: 'AI-602',
        title: 'Machine Learning & Deep Learning Với Python',
        tagline: 'Nắm vững toán đại số tuyến tính, giải thuật Scikit-Learn, PyTorch và mạng nơ-ron tích chập (CNN).',
        instructorId: new ObjectId('670000000000000000000007'),
        instructorName: 'TS. Đỗ Thị Hương Lan',
        category: 'AI & Data Science',
        credits: 4,
        price: 2490000,
        originalPrice: 3290000,
        rating: 4.91,
        reviewsCount: 1670,
        durationHours: 50,
        description: 'Từ cơ bản đến chuyên sâu: Huấn luyện mô hình phân loại, dự đoán chuỗi thời gian, Computer Vision và xử lý ngôn ngữ tự nhiên (NLP).',
        thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId12,
        code: 'DE-203',
        title: 'Data Warehouse Hiện Đại Với Google BigQuery & dbt',
        tagline: 'Mô hình hóa dữ liệu sao/tuyết, tối ưu hóa chi phí truy vấn phân tích SQL Petabyte quy mô lớn.',
        instructorId: new ObjectId('670000000000000000000002'),
        instructorName: 'TS. Nguyễn Thị Định',
        category: 'Data Engineering',
        credits: 3,
        price: 1990000,
        originalPrice: 2590000,
        rating: 4.89,
        reviewsCount: 890,
        durationHours: 34,
        description: 'Chiến lược xây dựng kho dữ liệu đám mây doanh nghiệp: Partitioning, Clustering, kiểm thử tự động với data build tool (dbt).',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      }
    ];
    await db.collection('courses').insertMany(courses);

    // 4. SEED LESSONS CHO CÁC KHÓA HỌC
    console.log('Seeding Lessons...');
    await db.collection('lessons').deleteMany({});
    const lessons = [
      // Lessons cho Khóa 1 (NoSQL)
      {
        _id: new ObjectId('670000000000000000000021'),
        courseId: courseId1,
        order: 1,
        title: 'Tổng quan về NoSQL và So sánh chuyên sâu với RDBMS',
        content: 'NoSQL giải quyết bài toán Big Data, độ trễ mili-giây, tính nhất quán lỏng lẻo (BASE) và khả năng mở rộng ngang (Horizontal Scaling)...',
        video: { url: 'https://video.huit.edu.vn/nosql-ch1.mp4', durationSeconds: 1800 },
        materials: ['slide_tong_quan_nosql.pdf', 'bang_so_sanh_cap_theorem.docx']
      },
      {
        _id: new ObjectId('670000000000000000000022'),
        courseId: courseId1,
        order: 2,
        title: 'Hệ Quản Trị CSDL Tài Liệu (Document Store) - MongoDB',
        content: 'Cơ chế lưu trữ BSON, thiết kế Schema nhúng (Embedded) vs tham chiếu (Reference), Text Index và Aggregation Pipeline đa tầng...',
        video: { url: 'https://video.huit.edu.vn/nosql-mongodb.mp4', durationSeconds: 2400 },
        materials: ['huong_dan_thuc_hanh_mongodb.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000023'),
        courseId: courseId1,
        order: 3,
        title: 'Hệ CSDL Khóa - Giá Trị (Key-Value) - Redis & Kỹ Thuật Cache',
        content: 'Redis In-Memory Datastore: Cấu trúc Sorted Set (ZSET) cho bảng xếp hạng, TTL tự động hết hạn và cơ chế Redis Pub/Sub thời gian thực...',
        video: { url: 'https://video.huit.edu.vn/nosql-redis.mp4', durationSeconds: 2100 },
        materials: ['lab_redis_caching.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000024'),
        courseId: courseId1,
        order: 4,
        title: 'Hệ Phân Tán Cassandra & Đồ Thị Neo4j',
        content: 'Kiến trúc Masterless Peer-to-Peer của Apache Cassandra kết hợp ngôn ngữ đồ thị Cypher để xây dựng mạng lưới quan hệ đa chiều.',
        video: { url: 'https://video.huit.edu.vn/nosql-cassandra-neo4j.mp4', durationSeconds: 2700 },
        materials: ['lab_cassandra_keyspace.pdf', 'cypher_cheat_sheet.pdf']
      },

      // Lessons cho Khóa 2 (Data Pipeline)
      {
        _id: new ObjectId('670000000000000000000025'),
        courseId: courseId2,
        order: 1,
        title: 'Kiến Trúc Lambda và Kappa trong Xử Lý Dữ Liệu Lớn',
        content: 'Tìm hiểu 2 mô hình kinh điển để xử lý kết hợp cả Batch layer và Speed layer.',
        video: { url: 'https://video.huit.edu.vn/data-arch.mp4', durationSeconds: 2000 },
        materials: ['lambda_vs_kappa_architecture.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000026'),
        courseId: courseId2,
        order: 2,
        title: 'Apache Kafka: Topic, Partition & Consumer Group',
        content: 'Thiết kế thông điệp phân tán, đảm bảo thứ tự dữ liệu và cơ chế tái cân bằng (Rebalancing).',
        video: { url: 'https://video.huit.edu.vn/kafka-deepdive.mp4', durationSeconds: 2500 },
        materials: ['kafka_setup_cluster.pdf']
      },

      // Lessons cho Khóa 3 (Microservices)
      {
        _id: new ObjectId('670000000000000000000027'),
        courseId: courseId3,
        order: 1,
        title: 'Thiết Kế RESTful & GraphQL API Gateway',
        content: 'Nguyên lý định tuyến tập trung, xác thực JWT tập trung và xử lý CORS/Rate Limiting.',
        video: { url: 'https://video.huit.edu.vn/api-gateway.mp4', durationSeconds: 2200 },
        materials: ['microservice_design_pattern.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000028'),
        courseId: courseId3,
        order: 2,
        title: 'Event-Driven Microservices với RabbitMQ & Redis Pub/Sub',
        content: 'Mô hình phát tán thông điệp bất đồng bộ, Saga pattern và phân tán giao dịch.',
        video: { url: 'https://video.huit.edu.vn/event-driven.mp4', durationSeconds: 2400 },
        materials: ['event_driven_saga.pdf']
      },

      // Lessons cho Khóa 4 (DevOps & K8s)
      {
        _id: new ObjectId('670000000000000000000029'),
        courseId: courseId4,
        order: 1,
        title: 'Containerization với Docker & Docker Compose Nâng Cao',
        content: 'Tối ưu Multi-stage build, quản lý network và persistent volumes an toàn.',
        video: { url: 'https://video.huit.edu.vn/docker-adv.mp4', durationSeconds: 2100 },
        materials: ['docker_best_practices.pdf']
      },
      {
        _id: new ObjectId('67000000000000000000002a'),
        courseId: courseId4,
        order: 2,
        title: 'Triển Khai Cụm Kubernetes: Pod, Deployment & StatefulSet',
        content: 'Triển khai NoSQL database trên K8s với StatefulSet, PersistentVolumeClaim và Ingress.',
        video: { url: 'https://video.huit.edu.vn/k8s-statefulset.mp4', durationSeconds: 2700 },
        materials: ['k8s_architecture.pdf']
      },

      // Lessons cho Khóa 5 (Neo4j Graph)
      {
        _id: new ObjectId('67000000000000000000002b'),
        courseId: courseId5,
        order: 1,
        title: 'Cơ Sở Đồ Thị Thuộc Tính (Property Graph Model)',
        content: 'Mô hình hóa Node, Label, Relationship và các thuộc tính liên kết ngữ nghĩa.',
        video: { url: 'https://video.huit.edu.vn/graph-intro.mp4', durationSeconds: 1900 },
        materials: ['property_graph_model.pdf']
      },
      {
        _id: new ObjectId('67000000000000000000002c'),
        courseId: courseId5,
        order: 2,
        title: 'Cypher Query Language: Pattern Matching & Thuật Toán Gợi Ý',
        content: 'Tìm đường đi ngắn nhất (Shortest Path), PageRank và phân cụm cộng đồng.',
        video: { url: 'https://video.huit.edu.vn/cypher-advanced.mp4', durationSeconds: 2400 },
        materials: ['graph_algorithms_neo4j.pdf']
      },

      // Lessons cho Khóa 6 (Bảo mật Web)
      {
        _id: new ObjectId('67000000000000000000002d'),
        courseId: courseId6,
        order: 1,
        title: 'Bảo Vệ API Khỏi Tấn Công NoSQL Injection & Broken Auth',
        content: 'Kỹ thuật lọc query MongoDB, kiểm tra JWT expiration và phân quyền theo vai trò.',
        video: { url: 'https://video.huit.edu.vn/security-api.mp4', durationSeconds: 2000 },
        materials: ['owasp_top10_api.pdf']
      },

      // Lessons cho Khóa 7 (Spark & Big Data)
      {
        _id: new ObjectId('67000000000000000000002e'),
        courseId: courseId7,
        order: 1,
        title: 'Khởi Tạo PySpark Cluster & Kiến Trúc Resilient Distributed Datasets',
        content: 'Hiểu sâu về cơ chế tính toán lười (Lazy Evaluation) và DAG Scheduler trong Spark.',
        video: { url: 'https://video.huit.edu.vn/spark-rdd.mp4', durationSeconds: 2300 },
        materials: ['pyspark_handbook.pdf']
      },

      // Lessons cho Khóa 8 (Next.js 15)
      {
        _id: new ObjectId('67000000000000000000002f'),
        courseId: courseId8,
        order: 1,
        title: 'Next.js 15 App Router & Server Components',
        content: 'Xây dựng giao diện hiệu năng cao, streaming SSR và tối ưu hóa tải trang.',
        video: { url: 'https://video.huit.edu.vn/nextjs15.mp4', durationSeconds: 2100 },
        materials: ['nextjs_architecture.pdf']
      },

      // Lessons cho Khóa 9 (AWS Architect)
      {
        _id: new ObjectId('670000000000000000000030'),
        courseId: courseId9,
        order: 1,
        title: 'Thiết Kế Mạng Đa Vùng VPC & Bảo Mật AWS Cloud',
        content: 'Thiết lập Subnet công khai/riêng tư, NAT Gateway, Security Group và Route Table.',
        video: { url: 'https://video.huit.edu.vn/aws-vpc.mp4', durationSeconds: 2500 },
        materials: ['aws_solutions_architect.pdf']
      },

      // Lessons cho Khóa 10 (Generative AI & RAG)
      {
        _id: new ObjectId('670000000000000000000041'),
        courseId: courseId10,
        order: 1,
        title: 'Xây Dựng Pipeline RAG Với Vector Database & LLM',
        content: 'Kỹ thuật Chunking văn bản, Embeddings generation và truy vấn tương đồng Cosine.',
        video: { url: 'https://video.huit.edu.vn/rag-ai.mp4', durationSeconds: 2600 },
        materials: ['generative_ai_rag_blueprint.pdf']
      },

      // Lessons cho Khóa 11 (Machine Learning)
      {
        _id: new ObjectId('670000000000000000000042'),
        courseId: courseId11,
        order: 1,
        title: 'Quy Trình Xây Dựng & Đánh Giá Mô Hình Học Máy',
        content: 'Tiền xử lý dữ liệu, kiểm thử chéo K-Fold, Ma trận nhầm lẫn và chỉ số F1-Score.',
        video: { url: 'https://video.huit.edu.vn/ml-pipeline.mp4', durationSeconds: 2400 },
        materials: ['ml_evaluation_metrics.pdf']
      },

      // Lessons cho Khóa 12 (BigQuery Data Warehouse)
      {
        _id: new ObjectId('670000000000000000000043'),
        courseId: courseId12,
        order: 1,
        title: 'Thiết Kế Kho Dữ Liệu Lớn Với Google BigQuery',
        content: 'Phân vùng theo ngày (Partitioning), gom cụm (Clustering) và tối ưu hóa chi phí slot.',
        video: { url: 'https://video.huit.edu.vn/bigquery-optimization.mp4', durationSeconds: 2200 },
        materials: ['bigquery_best_practices.pdf']
      }
    ];
    await db.collection('lessons').insertMany(lessons);

    // 5. SEED QUESTIONS (NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM ĐA DẠNG 10 CÂU HỎI)
    console.log('Seeding Questions...');
    await db.collection('questions').deleteMany({});
    const questions = [
      {
        _id: new ObjectId('670000000000000000000031'),
        subject: 'NoSQL',
        topic: 'MongoDB',
        difficulty: 'EASY',
        content: 'Định dạng lưu trữ dữ liệu mặc định bên trong của MongoDB là gì?',
        options: [
          { key: 'A', text: 'XML' },
          { key: 'B', text: 'BSON (Binary JSON)' },
          { key: 'C', text: 'CSV' },
          { key: 'D', text: 'YAML' }
        ],
        correctAnswer: 'B',
        explanation: 'MongoDB sử dụng định dạng BSON để tuần tự hóa và lưu trữ văn bản linh hoạt với hiệu suất nén cao.'
      },
      {
        _id: new ObjectId('670000000000000000000032'),
        subject: 'NoSQL',
        topic: 'Redis',
        difficulty: 'MEDIUM',
        content: 'Kiểu dữ liệu nào trong Redis phù hợp nhất để xây dựng bảng xếp hạng (Leaderboard) theo điểm số?',
        options: [
          { key: 'A', text: 'String' },
          { key: 'B', text: 'List' },
          { key: 'C', text: 'Sorted Set (ZSET)' },
          { key: 'D', text: 'Hash' }
        ],
        correctAnswer: 'C',
        explanation: 'Sorted Set liên kết mỗi thành viên với một trọng số (score) và tự động duy trì thứ tự xếp hạng với độ phức tạp O(log(N)).'
      },
      {
        _id: new ObjectId('670000000000000000000033'),
        subject: 'NoSQL',
        topic: 'Cassandra',
        difficulty: 'HARD',
        content: 'Trong Apache Cassandra, thành phần nào quyết định node nào sẽ lưu trữ bản ghi trên vòng tròn phân tán (ring)?',
        options: [
          { key: 'A', text: 'Clustering Key' },
          { key: 'B', text: 'Partition Key' },
          { key: 'C', text: 'Index Key' },
          { key: 'D', text: 'Foreign Key' }
        ],
        correctAnswer: 'B',
        explanation: 'Partition Key được đưa vào hàm băm (Murmur3Partitioner) để xác định node sở hữu token tương ứng trong cluster.'
      },
      {
        _id: new ObjectId('670000000000000000000034'),
        subject: 'NoSQL',
        topic: 'Neo4j',
        difficulty: 'EASY',
        content: 'Ngôn ngữ truy vấn đồ thị chính thức được sử dụng trong Neo4j là gì?',
        options: [
          { key: 'A', text: 'SQL' },
          { key: 'B', text: 'GraphQL' },
          { key: 'C', text: 'Cypher' },
          { key: 'D', text: 'SPARQL' }
        ],
        correctAnswer: 'C',
        explanation: 'Cypher là ngôn ngữ truy vấn khai báo mạnh mẽ mô tả các mẫu hình đồ thị dạng node và quan hệ (relationship).'
      },
      {
        _id: new ObjectId('670000000000000000000035'),
        subject: 'NoSQL',
        topic: 'MongoDB',
        difficulty: 'MEDIUM',
        content: 'Toán tử nào trong MongoDB Aggregation Pipeline dùng để gom nhóm và tính toán các đại lượng tổng hợp?',
        options: [
          { key: 'A', text: '$match' },
          { key: 'B', text: '$project' },
          { key: 'C', text: '$group' },
          { key: 'D', text: '$sort' }
        ],
        correctAnswer: 'C',
        explanation: '$group nhóm các tài liệu theo giá trị trường được chỉ định và tính toán tổng, trung bình, min, max,...'
      },
      {
        _id: new ObjectId('670000000000000000000036'),
        subject: 'NoSQL',
        topic: 'Redis',
        difficulty: 'EASY',
        content: 'Lệnh nào trong Redis được sử dụng để thiết lập thời gian tự động hủy (TTL) cho một khóa?',
        options: [
          { key: 'A', text: 'EXPIRE' },
          { key: 'B', text: 'TIMEOUT' },
          { key: 'C', text: 'DESTROY' },
          { key: 'D', text: 'DELETE_AFTER' }
        ],
        correctAnswer: 'A',
        explanation: 'Lệnh EXPIRE key seconds gán thời gian sống tính bằng giây cho một khóa trong Redis.'
      },
      {
        _id: new ObjectId('670000000000000000000037'),
        subject: 'NoSQL',
        topic: 'Cassandra',
        difficulty: 'MEDIUM',
        content: 'Kiến trúc của Apache Cassandra là dạng nào sau đây?',
        options: [
          { key: 'A', text: 'Master - Slave' },
          { key: 'B', text: 'Leader - Follower' },
          { key: 'C', text: 'Masterless (Peer-to-Peer)' },
          { key: 'D', text: 'Single Node Centralized' }
        ],
        correctAnswer: 'C',
        explanation: 'Cassandra có kiến trúc phi tập trung hoàn toàn (Masterless), mọi node đều có vai trò bình đẳng và không có Single Point of Failure.'
      },
      {
        _id: new ObjectId('670000000000000000000038'),
        subject: 'NoSQL',
        topic: 'Neo4j',
        difficulty: 'MEDIUM',
        content: 'Trong Neo4j, mối quan hệ (Relationship) giữa hai nút (Node) bắt buộc phải có thuộc tính nào?',
        options: [
          { key: 'A', text: 'Bắt buộc phải có hướng (Direction) và Kiểu (Type)' },
          { key: 'B', text: 'Không cần hướng, chỉ cần tên' },
          { key: 'C', text: 'Bắt buộc phải có trọng số số học' },
          { key: 'D', text: 'Bắt buộc phải là quan hệ hai chiều đối xứng' }
        ],
        correctAnswer: 'A',
        explanation: 'Mọi quan hệ trong Property Graph của Neo4j đều có tên phân loại (Type), nút bắt đầu và nút kết thúc (Direction).'
      }
    ];
    await db.collection('questions').insertMany(questions);

    // 6. SEED EXAMS (KỲ THI TRẮC NGHIỆM ĐẦY ĐỦ 8 CÂU HỎI)
    console.log('Seeding Exams...');
    await db.collection('exams').deleteMany({});
    const examId = new ObjectId('670000000000000000000040');
    const exams = [
      {
        _id: examId,
        title: 'Khảo Sát & Đánh Giá Năng Lực Kiến Trúc Dữ Liệu NoSQL Enterprise',
        courseId: courseId1,
        durationMinutes: 30,
        totalQuestions: questions.length,
        questions: questions.map(q => q._id),
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-12-30T17:00:00Z'),
        status: 'PUBLISHED'
      }
    ];
    await db.collection('exams').insertMany(exams);

    // 7. SEED RESULTS (KẾT QUẢ BẢNG XẾP HẠNG & LỊCH SỬ THI MẪU)
    console.log('Seeding Results...');
    await db.collection('results').deleteMany({});
    const results = [
      {
        _id: new ObjectId('670000000000000000000051'),
        examId: examId,
        studentId: new ObjectId('670000000000000000000003'),
        studentCode: '2001230589',
        studentName: 'Nguyễn Trọng Nguyên',
        submittedAt: new Date(Date.now() - 3600000 * 2), // 2 giờ trước
        score: 10.0,
        correctCount: 8,
        totalCount: 8,
        answers: [
          { questionId: new ObjectId('670000000000000000000031'), selected: 'B', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000032'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000033'), selected: 'B', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000034'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000035'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000036'), selected: 'A', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000037'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000038'), selected: 'A', isCorrect: true }
        ]
      },
      {
        _id: new ObjectId('670000000000000000000052'),
        examId: examId,
        studentId: new ObjectId('670000000000000000000004'),
        studentCode: '2001230578',
        studentName: 'Phạm Nguyễn Khôi Nguyên',
        submittedAt: new Date(Date.now() - 3600000 * 4), // 4 giờ trước
        score: 8.75,
        correctCount: 7,
        totalCount: 8,
        answers: [
          { questionId: new ObjectId('670000000000000000000031'), selected: 'B', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000032'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000033'), selected: 'B', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000034'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000035'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000036'), selected: 'A', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000037'), selected: 'A', isCorrect: false },
          { questionId: new ObjectId('670000000000000000000038'), selected: 'A', isCorrect: true }
        ]
      },
      {
        _id: new ObjectId('670000000000000000000053'),
        examId: examId,
        studentId: new ObjectId('670000000000000000000005'),
        studentCode: '2001230303',
        studentName: 'Võ Huỳnh Gia Huy',
        submittedAt: new Date(Date.now() - 3600000 * 6), // 6 giờ trước
        score: 7.5,
        correctCount: 6,
        totalCount: 8,
        answers: [
          { questionId: new ObjectId('670000000000000000000031'), selected: 'B', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000032'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000033'), selected: 'A', isCorrect: false },
          { questionId: new ObjectId('670000000000000000000034'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000035'), selected: 'C', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000036'), selected: 'A', isCorrect: true },
          { questionId: new ObjectId('670000000000000000000037'), selected: 'B', isCorrect: false },
          { questionId: new ObjectId('670000000000000000000038'), selected: 'A', isCorrect: true }
        ]
      }
    ];
    await db.collection('results').insertMany(results);

    console.log('=== HOAN THANH SEED DU LIEU MAU QUY MO LON CHO MONGODB ===');
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
