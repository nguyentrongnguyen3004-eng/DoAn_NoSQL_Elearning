// ==============================================================================
// HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
// SCRIPT KHOI TAO SCHEMA & SEED DATA ĐA DẠNG QUY MÔ LỚN CHO MONGODB
// NHOM 18: NEN TANG E-LEARNING TIENG ANH & LUYEN THI QUOC TE (EDUPRO ENGLISH)
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
        fullName: 'Ban Giám Đốc Học Thuật EduPro',
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000002'),
        username: 'dinhnt',
        email: 'dinhnt@huit.edu.vn',
        fullName: 'Ban Chuyên Môn EduPro (IELTS 8.5+)',
        role: 'TEACHER',
        department: 'Khoa Ngôn Ngữ Anh & Học Thuật Quốc Tế',
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
        fullName: 'ThS. Hoàng Minh Đức (TESOL / TOEIC 990)',
        role: 'TEACHER',
        department: 'Chuyên gia Luyện thi TOEIC & Business English',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      },
      {
        _id: new ObjectId('670000000000000000000007'),
        username: 'instructor_lan',
        email: 'huonglan.do@huit.edu.vn',
        fullName: 'TS. Đỗ Thị Hương Lan (Cambridge CELTA)',
        role: 'TEACHER',
        department: 'Chuyên gia Ngữ Âm IPA & Giao Tiếp Quốc Tế',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date()
      }
    ];
    await db.collection('users').insertMany(users);

    // 3. SEED COURSES (12 KHÓA HỌC TIẾNG ANH CHIA THEO 4 DANH MỤC CHUẨN)
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
      // Danh mục 1: IELTS Academic
      {
        _id: courseId1,
        code: 'IELTS-750',
        title: 'IELTS Masterclass 7.5+: Chinh Phục 4 Kỹ Năng Toàn Diện (Academic)',
        tagline: 'Làm chủ chiến thuật Listening, Reading Skimming/Scanning, Writing Task 1-2 và Speaking Band 7.5+.',
        instructorId: new ObjectId('670000000000000000000002'),
        instructorName: 'Ban Chuyên Môn EduPro (IELTS 8.5+)',
        category: 'IELTS Academic',
        credits: 4,
        price: 1890000,
        originalPrice: 2590000,
        rating: 4.96,
        reviewsCount: 2840,
        durationHours: 48,
        description: 'Lộ trình luyện thi IELTS Academic chuyên sâu từ Band 5.5 lên 7.5+. Làm chủ chiến thuật Skimming & Scanning trong Reading, phân tích biểu đồ Task 1, viết luận Task 2 chuẩn tiêu chí chấm thi IDP/BC và phản xạ Speaking Part 2-3 tự nhiên.',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        totalLessons: 4,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId6,
        code: 'IELTS-WR8',
        title: 'IELTS Writing Task 1 & Task 2 Chuyên Sâu: Tư Duy Logic Band 8.0',
        tagline: 'Phương pháp phân tích mọi dạng biểu đồ Line, Bar, Pie, Map, Process & Viết luận học thuật PEEL.',
        instructorId: new ObjectId('670000000000000000000002'),
        instructorName: 'Ban Chuyên Môn EduPro (IELTS 8.5+)',
        category: 'IELTS Academic',
        credits: 3,
        price: 1650000,
        originalPrice: 2300000,
        rating: 4.94,
        reviewsCount: 1480,
        durationHours: 36,
        description: 'Giải quyết triệt để nỗi sợ viết luận IELTS: Phương pháp phân tích mọi dạng biểu đồ Task 1 và triển khai lập luận Coherence & Cohesion chặt chẽ cho Opinion, Discussion, Problem-Solution Essays (Task 2).',
        thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId7,
        code: 'IELTS-SP7',
        title: 'IELTS Speaking Fluency & Idioms: Tự Tin Bứt Phá Band 7.5+',
        tagline: 'Mở rộng ý tưởng nhanh trong phòng thi với công thức AREC & Bộ 50 chủ đề Forecast mới nhất.',
        instructorId: new ObjectId('670000000000000000000007'),
        instructorName: 'TS. Đỗ Thị Hương Lan (Cambridge CELTA)',
        category: 'IELTS Academic',
        credits: 3,
        price: 1490000,
        originalPrice: 2100000,
        rating: 4.92,
        reviewsCount: 1920,
        durationHours: 32,
        description: 'Mở rộng ý tưởng nhanh chóng trong phòng thi Speaking với công thức AREC & PPF. Bộ 50 chủ đề Forecast mới nhất kèm Collocations, Phrasal Verbs và Idioms ăn điểm Lexical Resource.',
        thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },

      // Danh mục 2: TOEIC Quốc Tế
      {
        _id: courseId2,
        code: 'TOEIC-850',
        title: 'Luyện Thi TOEIC 4 Kỹ Năng (Listening, Reading, Speaking & Writing 850+)',
        tagline: 'Bứt phá điểm số TOEIC 850+ theo cấu trúc đề thi mới nhất của viện khảo thí ETS Hoa Kỳ.',
        instructorId: new ObjectId('670000000000000000000006'),
        instructorName: 'ThS. Hoàng Minh Đức (TESOL / TOEIC 990)',
        category: 'TOEIC Quốc Tế',
        credits: 3,
        price: 1390000,
        originalPrice: 1990000,
        rating: 4.91,
        reviewsCount: 3190,
        durationHours: 42,
        description: 'Bứt phá điểm số TOEIC 850+ theo cấu trúc đề thi mới nhất của ETS. Bao trọn mẹo tránh bẫy âm thanh Part 1-4, tốc độ xử lý ngữ pháp Part 5-6 và kỹ thuật đọc nối thông tin Triple Passages Part 7.',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId8,
        code: 'TOEIC-650',
        title: 'Cấp Tốc TOEIC Listening & Reading 650+ Trong 60 Ngày Cho Người Mất Gốc',
        tagline: 'Lộ trình 60 ngày lấy lại gốc ngữ pháp thương mại và luyện nghe bắt Keyword chuẩn đầu ra.',
        instructorId: new ObjectId('670000000000000000000006'),
        instructorName: 'ThS. Hoàng Minh Đức (TESOL / TOEIC 990)',
        category: 'TOEIC Quốc Tế',
        credits: 3,
        price: 990000,
        originalPrice: 1490000,
        rating: 4.88,
        reviewsCount: 2950,
        durationHours: 36,
        description: 'Lộ trình 60 ngày lấy lại gốc ngữ pháp và từ vựng thương mại cốt lõi, luyện nghe bắt từ khóa (Keyword Catching) giúp sinh viên đạt chuẩn đầu ra TOEIC 650+ nhanh chóng.',
        thumbnail: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId12,
        code: 'TOEIC-900',
        title: 'Luyện Giải Bộ Đề ETS TOEIC Thực Chiến & Chiến Thuật Phân Bổ Thời Gian 900+',
        tagline: 'Giải chi tiết từng câu bộ đề ETS mới nhất, phân tích bẫy Paraphrase nâng cao trong Part 4 & Part 7.',
        instructorId: new ObjectId('670000000000000000000006'),
        instructorName: 'ThS. Hoàng Minh Đức (TESOL / TOEIC 990)',
        category: 'TOEIC Quốc Tế',
        credits: 3,
        price: 1450000,
        originalPrice: 2050000,
        rating: 4.95,
        reviewsCount: 1540,
        durationHours: 40,
        description: 'Giải chi tiết từng câu bộ đề ETS TOEIC mới nhất, phân tích bẫy Paraphrase nâng cao trong Part 4 & Part 7, giúp học viên tối ưu 120 phút phòng thi để chạm mốc 900 - 990 TOEIC.',
        thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },

      // Danh mục 3: Ngữ Pháp & Từ Vựng
      {
        _id: courseId3,
        code: 'GRAM-300',
        title: 'Ngữ Pháp Tiếng Anh Toàn Diện & 3000 Từ Vựng Cốt Lõi (CEFR A2 - B2)',
        tagline: 'Hệ thống hóa 12 thì Tiếng Anh, Câu bị động, Câu điều kiện, Mệnh đề quan hệ & 3000 từ Oxford.',
        instructorId: new ObjectId('670000000000000000000002'),
        instructorName: 'Ban Chuyên Môn EduPro (IELTS 8.5+)',
        category: 'Ngữ Pháp & Từ Vựng',
        credits: 3,
        price: 890000,
        originalPrice: 1390000,
        rating: 4.95,
        reviewsCount: 4120,
        durationHours: 38,
        description: 'Xây dựng nền tảng Tiếng Anh vững chắc từ gốc: Hệ thống hóa 12 thì trong Tiếng Anh, Câu bị động (Passive Voice), Câu điều kiện (Conditionals), Mệnh đề quan hệ (Relative Clauses) kết hợp 3000 từ vựng Oxford theo chủ đề.',
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId9,
        code: 'VOCAB-401',
        title: '1000 Collocations, Phrasal Verbs & Idioms Thông Dụng Trong Học Thuật',
        tagline: 'Nâng cấp diễn đạt Tiếng Anh tự nhiên như người bản xứ qua 25 chủ đề học thuật & đời sống.',
        instructorId: new ObjectId('670000000000000000000007'),
        instructorName: 'TS. Đỗ Thị Hương Lan (Cambridge CELTA)',
        category: 'Ngữ Pháp & Từ Vựng',
        credits: 2,
        price: 790000,
        originalPrice: 1200000,
        rating: 4.90,
        reviewsCount: 1640,
        durationHours: 28,
        description: 'Nâng cấp diễn đạt Tiếng Anh từ sơ cấp lên tự nhiên như người bản xứ thông qua 1000 cụm từ cố định (Collocations), cụm động từ (Phrasal Verbs) và thành ngữ (Idioms) theo 25 chủ đề học thuật & đời sống.',
        thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId11,
        code: 'READ-205',
        title: 'Kỹ Thuật Đọc Hiểu Nhanh & Nghe Chép Chính Tả (Active Listening & Speed Reading)',
        tagline: 'Luyện nghe Dictation qua TED Talks/BBC và phương pháp đọc cụm từ (Chunking) 300 từ/phút.',
        instructorId: new ObjectId('670000000000000000000007'),
        instructorName: 'TS. Đỗ Thị Hương Lan (Cambridge CELTA)',
        category: 'Ngữ Pháp & Từ Vựng',
        credits: 2,
        price: 750000,
        originalPrice: 1150000,
        rating: 4.89,
        reviewsCount: 1870,
        durationHours: 30,
        description: 'Đột phá kỹ năng tiếp nhận ngôn ngữ (Receptive Skills): Luyện nghe Dictation qua TED Talks/BBC Learning English và phương pháp đọc cụm từ (Chunking) giúp tăng gấp đôi tốc độ đọc hiểu.',
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },

      // Danh mục 4: Giao Tiếp & Doanh Nghiệp
      {
        _id: courseId4,
        code: 'BIZ-401',
        title: 'Tiếng Anh Giao Tiếp Thương Mại & Phỏng Vấn Quốc Tế (Business English)',
        tagline: 'Viết Email thương mại chuyên nghiệp, thuyết trình dự án, đàm phán và phỏng vấn mô hình STAR.',
        instructorId: new ObjectId('670000000000000000000006'),
        instructorName: 'ThS. Hoàng Minh Đức (TESOL / TOEIC 990)',
        category: 'Giao Tiếp & Doanh Nghiệp',
        credits: 3,
        price: 1550000,
        originalPrice: 2200000,
        rating: 4.93,
        reviewsCount: 1750,
        durationHours: 34,
        description: 'Làm chủ Tiếng Anh công sở tại các tập đoàn đa quốc gia: Viết Email thương mại chuyên nghiệp, thuyết trình Pitching dự án, đàm phán hợp đồng và trả lời phỏng vấn bằng phương pháp STAR.',
        thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId5,
        code: 'IPA-101',
        title: 'Chuẩn Hóa Phát Âm IPA 44 Âm & Phản Xạ Giao Tiếp Giọng Bản Xứ',
        tagline: 'Chỉnh sửa khẩu hình chuẩn bảng IPA, quy tắc Trọng âm, Nối âm (Linking) và kỹ thuật Shadowing.',
        instructorId: new ObjectId('670000000000000000000007'),
        instructorName: 'TS. Đỗ Thị Hương Lan (Cambridge CELTA)',
        category: 'Giao Tiếp & Doanh Nghiệp',
        credits: 2,
        price: 950000,
        originalPrice: 1450000,
        rating: 4.97,
        reviewsCount: 2630,
        durationHours: 28,
        description: 'Chỉnh sửa tận gốc khẩu hình miệng chuẩn bảng phiên âm quốc tế IPA 44 âm. Nắm vững quy tắc Trọng âm (Word Stress), Nối âm (Linking Sounds), Ngữ điệu (Intonation) và kỹ thuật Shadowing nghe nói tự nhiên.',
        thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      },
      {
        _id: courseId10,
        code: 'ENG-IT01',
        title: 'Tiếng Anh Chuyên Ngành Công Nghệ Thông Tin (English for IT & Software Engineers)',
        tagline: 'Giao tiếp trong họp Daily Standup, Sprint Planning, đọc hiểu tài liệu kỹ thuật & Phỏng vấn Global.',
        instructorId: new ObjectId('670000000000000000000001'),
        instructorName: 'Ban Giám Đốc Học Thuật EduPro',
        category: 'Giao Tiếp & Doanh Nghiệp',
        credits: 3,
        price: 1290000,
        originalPrice: 1890000,
        rating: 4.96,
        reviewsCount: 2180,
        durationHours: 36,
        description: 'Thiết kế riêng cho lập trình viên, BA, QA và kỹ sư hệ thống: Giao tiếp trong họp Daily Standup, Sprint Planning, đọc hiểu tài liệu kỹ thuật (Technical Documentation), Code Review và phỏng vấn công ty Global.',
        thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        totalLessons: 3,
        status: 'PUBLISHED',
        createdAt: new Date()
      }
    ];
    await db.collection('courses').insertMany(courses);

    // 4. SEED LESSONS CHO CÁC KHÓA HỌC TIẾNG ANH
    console.log('Seeding Lessons...');
    await db.collection('lessons').deleteMany({});
    const lessons = [
      // Lessons cho Khóa 1 (IELTS Masterclass 7.5+)
      {
        _id: new ObjectId('670000000000000000000021'),
        courseId: courseId1,
        order: 1,
        title: 'Tổng quan cấu trúc đề thi IELTS Academic & Tiêu chí chấm điểm Band 7.5+',
        content: 'Phân tích chi tiết 4 kỹ năng Listening, Reading, Writing, Speaking và 4 tiêu chí chấm điểm: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy...',
        video: { url: 'https://video.huit.edu.vn/ielts-overview.mp4', durationSeconds: 2100 },
        materials: ['ielts_band_descriptors_official.pdf', 'academic_word_list_570.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000022'),
        courseId: courseId1,
        order: 2,
        title: 'Chiến thuật Skimming, Scanning & Xử lý dạng True/False/Not Given trong Reading',
        content: 'Cách định vị từ khóa (Keywords), nhận diện cấu trúc Paraphrase đồng nghĩa và phân biệt rạch ròi giữa False (Ngược thông tin) với Not Given (Không đề cập)...',
        video: { url: 'https://video.huit.edu.vn/ielts-reading-strategies.mp4', durationSeconds: 2700 },
        materials: ['cambridge_reading_practice_test.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000023'),
        courseId: courseId1,
        order: 3,
        title: 'Phương pháp phân tích biểu đồ IELTS Writing Task 1 (Line, Bar, Pie, Map & Process)',
        content: 'Công thức viết câu Overview sắc bén ăn trọn điểm Task Achievement, cách nhóm số liệu thông minh và bộ động từ/trạng từ mô tả xu hướng tăng giảm (surge, plummet, fluctuate)...',
        video: { url: 'https://video.huit.edu.vn/ielts-writing-task1.mp4', durationSeconds: 3000 },
        materials: ['task1_chart_vocabulary_band8.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000024'),
        courseId: courseId1,
        order: 4,
        title: 'Tư duy viết luận IELTS Writing Task 2 chuẩn cấu trúc PEEL & Phản xạ Speaking Part 2-3',
        content: 'Xây dựng đoạn văn thân bài theo mô hình Point - Explanation - Example - Link (PEEL), ứng dụng câu phức, đảo ngữ và công thức AREC mở rộng ý tưởng Speaking.',
        video: { url: 'https://video.huit.edu.vn/ielts-writing-task2-speaking.mp4', durationSeconds: 3300 },
        materials: ['20_sample_essays_band_8.0.pdf', 'speaking_part2_cue_cards.pdf']
      },

      // Lessons cho Khóa 2 (TOEIC 850+)
      {
        _id: new ObjectId('670000000000000000000025'),
        courseId: courseId2,
        order: 1,
        title: 'Chiến thuật tránh bẫy âm thanh đồng âm & Câu hỏi gián tiếp trong TOEIC Listening Part 1-2',
        content: 'Nhận diện bẫy từ đồng âm (Homophones), từ gần âm (Similar-sounding words) và cách xử lý các câu trả lời gián tiếp trong Part 2 Question-Response.',
        video: { url: 'https://video.huit.edu.vn/toeic-listening-part1-2.mp4', durationSeconds: 2400 },
        materials: ['toeic_part1_2_audio_transcript.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000026'),
        courseId: courseId2,
        order: 2,
        title: 'Giải nhanh ngữ pháp TOEIC Part 5 trong 20 giây & Đọc ghép thông tin Part 7',
        content: 'Mẹo nhìn dấu hiệu nhận biết từ loại (Word Form), liên từ (Conjunctions), giới từ và kỹ thuật đọc lướt tìm thông tin chéo trong bài đọc đôi/ba (Double & Triple Passages).',
        video: { url: 'https://video.huit.edu.vn/toeic-reading-part5-7.mp4', durationSeconds: 2800 },
        materials: ['ets_part5_grammar_formulas.pdf']
      },

      // Lessons cho Khóa 3 (Ngữ Pháp & 3000 Từ Vựng)
      {
        _id: new ObjectId('670000000000000000000027'),
        courseId: courseId3,
        order: 1,
        title: 'Bản đồ tư duy 12 Thì trong Tiếng Anh & Dấu hiệu nhận biết thực tế',
        content: 'Hiểu bản chất trục thời gian (Past - Present - Future) kết hợp tính chất hành động (Simple - Continuous - Perfect) thay vì học vẹt công thức.',
        video: { url: 'https://video.huit.edu.vn/english-12-tenses.mp4', durationSeconds: 2500 },
        materials: ['12_tenses_mindmap.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000028'),
        courseId: courseId3,
        order: 2,
        title: 'Câu điều kiện (Conditionals Type 0, 1, 2, 3, Mixed), Mệnh đề quan hệ & Đảo ngữ',
        content: 'Làm chủ toàn bộ các loại câu điều kiện, mệnh đề quan hệ xác định/không xác định và cấu trúc đảo ngữ (Should / Were / Had) thường gặp trong đề thi.',
        video: { url: 'https://video.huit.edu.vn/conditionals-relative-clauses.mp4', durationSeconds: 2700 },
        materials: ['conditionals_inversion_exercises.pdf']
      },

      // Lessons cho Khóa 4 (Business English)
      {
        _id: new ObjectId('670000000000000000000029'),
        courseId: courseId4,
        order: 1,
        title: 'Cấu trúc viết Email thương mại chuyên nghiệp & Đàm phán với đối tác quốc tế',
        content: 'Mẫu câu mở đầu, trình bày vấn đề trang trọng (Formal Register), thương lượng báo giá và kết thư chuyên nghiệp trong môi trường đa quốc gia.',
        video: { url: 'https://video.huit.edu.vn/business-email-writing.mp4', durationSeconds: 2200 },
        materials: ['50_business_email_templates.pdf']
      },
      {
        _id: new ObjectId('67000000000000000000002a'),
        courseId: courseId4,
        order: 2,
        title: 'Kỹ năng trả lời phỏng vấn Tiếng Anh theo mô hình STAR & Thuyết trình dự án',
        content: 'Cách triển khai câu trả lời phỏng vấn theo Situation - Task - Action - Result (STAR) ấn tượng với nhà tuyển dụng nhân sự quốc tế.',
        video: { url: 'https://video.huit.edu.vn/star-interview-english.mp4', durationSeconds: 2600 },
        materials: ['star_interview_guide.pdf']
      },

      // Lessons cho Khóa 5 (Phát âm IPA 44 Âm)
      {
        _id: new ObjectId('67000000000000000000002b'),
        courseId: courseId5,
        order: 1,
        title: 'Chuẩn hóa khẩu hình 20 Nguyên âm (Vowels & Diphthongs) trong bảng IPA',
        content: 'Phân biệt âm ngắn và âm dài (/ɪ/ vs /iː/, /ʊ/ vs /uː/) cùng cách đặt vị trí lưỡi và độ mở hàm chuẩn xác.',
        video: { url: 'https://video.huit.edu.vn/ipa-vowels.mp4', durationSeconds: 2100 },
        materials: ['ipa_phonemic_chart_guide.pdf']
      },
      {
        _id: new ObjectId('67000000000000000000002c'),
        courseId: courseId5,
        order: 2,
        title: 'Quy tắc Nối âm (Linking), Nuốt âm (Elision) & Ngữ điệu câu (Intonation)',
        content: 'Bí quyết giúp bạn nghe hiểu người bản xứ nói nhanh và luyện tập kỹ thuật Shadowing theo ngữ điệu lên xuống tự nhiên.',
        video: { url: 'https://video.huit.edu.vn/linking-intonation-shadowing.mp4', durationSeconds: 2400 },
        materials: ['shadowing_scripts_audio.pdf']
      },

      // Lessons cho Khóa 6 -> 12
      {
        _id: new ObjectId('67000000000000000000002d'),
        courseId: courseId6,
        order: 1,
        title: 'Kỹ thuật Paraphrasing & Nominalization (Danh hóa) nâng band Writing lên 8.0',
        content: 'Biến đổi câu văn giao tiếp thông thường thành văn phong học thuật trang trọng thông qua kỹ thuật danh hóa cụm động từ và cấu trúc câu chẻ (Cleft Sentences).',
        video: { url: 'https://video.huit.edu.vn/academic-nominalization.mp4', durationSeconds: 2500 },
        materials: ['academic_nominalization_handbook.pdf']
      },
      {
        _id: new ObjectId('67000000000000000000002e'),
        courseId: courseId7,
        order: 1,
        title: 'Công thức mở rộng câu trả lời IELTS Speaking Part 1, 2, 3 & Bộ Idioms ăn điểm',
        content: 'Áp dụng chiến thuật Past - Present - Future để nói trôi chảy suốt 2 phút trong Part 2 Cue Card mà không bị bí ý tưởng.',
        video: { url: 'https://video.huit.edu.vn/ielts-speaking-fluency.mp4', durationSeconds: 2300 },
        materials: ['speaking_forecast_handbook.pdf']
      },
      {
        _id: new ObjectId('67000000000000000000002f'),
        courseId: courseId8,
        order: 1,
        title: 'Hệ thống từ vựng TOEIC cốt lõi theo 12 chủ đề thương mại & Văn phòng',
        content: 'Tổng hợp từ vựng xuất hiện trong 95% đề thi TOEIC: Contracts, Marketing, Warranties, Accounting, Human Resources và Logistics.',
        video: { url: 'https://video.huit.edu.vn/600-toeic-words.mp4', durationSeconds: 2100 },
        materials: ['600_essential_words_toeic.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000030'),
        courseId: courseId9,
        order: 1,
        title: '200 Academic Collocations & Phrasal Verbs chủ đề Education, Technology & Environment',
        content: 'Cách kết hợp từ tự nhiên (make an effort, pose a threat, bridge the gap, carry out research) ứng dụng ngay vào bài nói và bài viết.',
        video: { url: 'https://video.huit.edu.vn/collocations-in-use.mp4', durationSeconds: 2500 },
        materials: ['collocations_in_use_summary.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000041'),
        courseId: courseId10,
        order: 1,
        title: 'Giao tiếp trong Daily Standup, Sprint Review & Thảo luận Kiến trúc Phần mềm',
        content: 'Mẫu câu báo cáo tiến độ (What I accomplished yesterday, What I am working on today, Blockers) và cách giải thích giải pháp kỹ thuật bằng Tiếng Anh.',
        video: { url: 'https://video.huit.edu.vn/english-for-it.mp4', durationSeconds: 2600 },
        materials: ['english_for_software_engineers.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000042'),
        courseId: courseId11,
        order: 1,
        title: 'Phương pháp Nghe chép chính tả (Dictation) 4 bước & Đọc theo cụm từ (Chunking)',
        content: 'Kỹ thuật rèn luyện tai nghe nhạy bén với hiện tượng nối âm/giảm âm và cách mở rộng tầm mắt để đọc 300 từ/phút.',
        video: { url: 'https://video.huit.edu.vn/dictation-speed-reading.mp4', durationSeconds: 2400 },
        materials: ['ted_talks_dictation_workbook.pdf']
      },
      {
        _id: new ObjectId('670000000000000000000043'),
        courseId: courseId12,
        order: 1,
        title: 'Giải chi tiết ETS TOEIC Test 1 & Chiến thuật phân bổ 75 phút Reading',
        content: 'Quy tắc vàng phân bổ thời gian: 10 phút cho Part 5, 8 phút cho Part 6 và 57 phút cho Part 7 để không bao giờ bị lố giờ.',
        video: { url: 'https://video.huit.edu.vn/ets-toeic-test1.mp4', durationSeconds: 2800 },
        materials: ['ets_test1_detailed_explanation.pdf']
      }
    ];
    await db.collection('lessons').insertMany(lessons);

    // 5. SEED QUESTIONS (NGÂN HÀNG 8 CÂU HỎI ĐÁNH GIÁ NĂNG LỰC TIẾNG ANH IELTS / TOEIC / CEFR)
    console.log('Seeding Questions...');
    await db.collection('questions').deleteMany({});
    const questions = [
      {
        _id: new ObjectId('670000000000000000000031'),
        subject: 'English Proficiency',
        topic: 'Grammar & Tenses',
        difficulty: 'EASY',
        content: '[TOEIC Part 5 - Tenses] By the time the international delegates arrive at the conference hall tomorrow morning, our logistics team ________ all the presentation equipment.',
        options: [
          { key: 'A', text: 'installed' },
          { key: 'B', text: 'will have installed' },
          { key: 'C', text: 'has been installing' },
          { key: 'D', text: 'was installing' }
        ],
        correctAnswer: 'B',
        explanation: 'Cấu trúc "By the time + S + V (hiện tại đơn chỉ tương lai), S + will have + V3/ed" (Thì tương lai hoàn thành) diễn tả một hành động sẽ hoàn tất trước một thời điểm hoặc hành động khác trong tương lai.'
      },
      {
        _id: new ObjectId('670000000000000000000032'),
        subject: 'English Proficiency',
        topic: 'Conditionals & Inversion',
        difficulty: 'MEDIUM',
        content: '[IELTS Grammar - Inversion] ________ the scholarship committee reviewed her research proposal more carefully, she would have been granted full funding for the Cambridge program.',
        options: [
          { key: 'A', text: 'If' },
          { key: 'B', text: 'Should' },
          { key: 'C', text: 'Had' },
          { key: 'D', text: 'Were' }
        ],
        correctAnswer: 'C',
        explanation: 'Đây là cấu trúc đảo ngữ của câu điều kiện loại 3 (trái với quá khứ): "Had + S + V3/ed, S + would have + V3/ed" (tương đương với "If the scholarship committee had reviewed...").'
      },
      {
        _id: new ObjectId('670000000000000000000033'),
        subject: 'English Proficiency',
        topic: 'Academic Collocations',
        difficulty: 'HARD',
        content: '[IELTS Lexical Resource] Governments worldwide must take immediate action to ________ the adverse effects of climate change on coastal ecosystems.',
        options: [
          { key: 'A', text: 'exaggerate' },
          { key: 'B', text: 'mitigate' },
          { key: 'C', text: 'hesitate' },
          { key: 'D', text: 'imitate' }
        ],
        correctAnswer: 'B',
        explanation: 'Cụm Collocation học thuật chuẩn Band 8.0: "mitigate the adverse effects/impacts" có nghĩa là làm giảm nhẹ, xoa dịu những tác động tiêu cực.'
      },
      {
        _id: new ObjectId('670000000000000000000034'),
        subject: 'English Proficiency',
        topic: 'Relative Clauses',
        difficulty: 'EASY',
        content: '[TOEIC Part 5 - Relative Clauses] The marketing director ________ strategy increased our quarterly revenue by 45% was promoted to Vice President yesterday.',
        options: [
          { key: 'A', text: 'who' },
          { key: 'B', text: 'whom' },
          { key: 'C', text: 'whose' },
          { key: 'D', text: 'which' }
        ],
        correctAnswer: 'C',
        explanation: 'Đại từ quan hệ sở hữu "whose" đứng trước danh từ ("strategy") để chỉ mối quan hệ sở hữu ("chiến lược của giám đốc marketing đó").'
      },
      {
        _id: new ObjectId('670000000000000000000035'),
        subject: 'English Proficiency',
        topic: 'Phrasal Verbs',
        difficulty: 'MEDIUM',
        content: '[Business English] Due to unexpected supply chain disruptions, the board of directors decided to ________ the product launch until the third quarter.',
        options: [
          { key: 'A', text: 'call off' },
          { key: 'B', text: 'look into' },
          { key: 'C', text: 'put off' },
          { key: 'D', text: 'turn down' }
        ],
        correctAnswer: 'C',
        explanation: 'Phrasal verb "put off" = "postpone / delay" (trì hoãn sang một thời điểm khác). Còn "call off" là hủy bỏ hoàn toàn, "look into" là điều tra, "turn down" là từ chối.'
      },
      {
        _id: new ObjectId('670000000000000000000036'),
        subject: 'English Proficiency',
        topic: 'Reading Strategies',
        difficulty: 'EASY',
        content: '[IELTS Reading Strategy] In an IELTS Academic Reading passage, if a statement directly contradicts the information presented in the text, how should you mark your answer?',
        options: [
          { key: 'A', text: 'FALSE' },
          { key: 'B', text: 'TRUE' },
          { key: 'C', text: 'NOT GIVEN' },
          { key: 'D', text: 'OMITTED' }
        ],
        correctAnswer: 'A',
        explanation: 'Trong dạng bài True/False/Not Given: nếu thông tin trong câu hỏi trái ngược/mâu thuẫn trực tiếp (contradicts) với bài đọc thì đáp án là FALSE (còn nếu không được đề cập thì mới chọn NOT GIVEN).'
      },
      {
        _id: new ObjectId('670000000000000000000037'),
        subject: 'English Proficiency',
        topic: 'Phonetics & Word Stress',
        difficulty: 'MEDIUM',
        content: '[Phonetics & Word Stress] Which of the following words has the primary stress on the SECOND syllable?',
        options: [
          { key: 'A', text: 'industry (/ˈɪn.də.stri/)' },
          { key: 'B', text: 'management (/ˈmæn.ɪdʒ.mənt/)' },
          { key: 'C', text: 'economy (/ɪˈkɒn.ə.mi/)' },
          { key: 'D', text: 'politics (/ˈpɒl.ə.tɪks/)' }
        ],
        correctAnswer: 'C',
        explanation: 'Từ "economy" (/ɪˈkɒn.ə.mi/) có trọng âm rơi vào âm tiết thứ 2. Ba từ còn lại đều có trọng âm rơi vào âm tiết thứ 1.'
      },
      {
        _id: new ObjectId('670000000000000000000038'),
        subject: 'English Proficiency',
        topic: 'Academic Writing Task 1',
        difficulty: 'MEDIUM',
        content: '[IELTS Writing Task 1] Which verb phrase best describes a sharp and sudden decrease in sales figures on a line graph?',
        options: [
          { key: 'A', text: 'plummeted dramatically' },
          { key: 'B', text: 'remained stable at' },
          { key: 'C', text: 'experienced a gradual rise' },
          { key: 'D', text: 'peaked at the highest point' }
        ],
        correctAnswer: 'A',
        explanation: 'Trong IELTS Writing Task 1, động từ "plummet" (hoặc "plunge") kết hợp với trạng từ "dramatically" được dùng để mô tả sự sụt giảm mạnh và đột ngột trên biểu đồ.'
      }
    ];
    await db.collection('questions').insertMany(questions);

    // 6. SEED EXAMS (KỲ THI ĐÁNH GIÁ NĂNG LỰC TIẾNG ANH QUỐC TẾ 8 CÂU HỎI)
    console.log('Seeding Exams...');
    await db.collection('exams').deleteMany({});
    const examId = new ObjectId('670000000000000000000040');
    const exams = [
      {
        _id: examId,
        title: 'Đánh Giá Năng Lực Tiếng Anh Quốc Tế (English Placement & IELTS/TOEIC Test)',
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

    console.log('=== HOAN THANH SEED DU LIEU EDUPRO ENGLISH CHO MONGODB ===');
  } catch (err) {
    console.error('Loi khi seed du lieu MongoDB:', err);
  } finally {
    await client.close();
  }
}

seedMongoDB();
