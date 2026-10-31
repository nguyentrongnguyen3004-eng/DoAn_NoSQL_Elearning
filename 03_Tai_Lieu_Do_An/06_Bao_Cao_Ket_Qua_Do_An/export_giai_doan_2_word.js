const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} = require('docx');

console.log('--- BAT DAU TAO TAI LIEU WORD: GIAI DOAN 2 - DATABASE MODEL (HUIT) ---');

// Dinh nghia cac thong so chuan hoc thuat
const FONT_NAME = 'Times New Roman';
const COLOR_PRIMARY = '1F497D'; // Xanh navy dam HUIT
const COLOR_SECONDARY = '595959';
const COLOR_BORDER = 'D3D3D3';

function p(text = '', options = {}) {
  const runs = Array.isArray(text)
    ? text
    : [
        new TextRun({
          text,
          font: FONT_NAME,
          size: options.size || 26, // 13pt = 26 half-points
          bold: options.bold || false,
          italics: options.italics || false,
          color: options.color || '000000'
        })
      ];

  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: {
      line: options.line || 360, // 1.5 line spacing (240 * 1.5 = 360)
      before: options.before !== undefined ? options.before : 100,
      after: options.after !== undefined ? options.after : 100
    },
    children: runs
  });
}

function h1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180, line: 360 },
    children: [
      new TextRun({
        text: title,
        font: FONT_NAME,
        size: 32, // 16pt
        bold: true,
        color: COLOR_PRIMARY
      })
    ]
  });
}

function h2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 360 },
    children: [
      new TextRun({
        text: title,
        font: FONT_NAME,
        size: 28, // 14pt
        bold: true,
        color: '2E75B6'
      })
    ]
  });
}

function h3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80, line: 360 },
    children: [
      new TextRun({
        text: title,
        font: FONT_NAME,
        size: 26, // 13pt
        bold: true,
        italics: true,
        color: '1F497D'
      })
    ]
  });
}

function codeBlock(codeText) {
  const lines = codeText.split('\n');
  return lines.map(line => 
    new Paragraph({
      spacing: { line: 240, before: 30, after: 30 },
      indent: { left: 400 },
      children: [
        new TextRun({
          text: line,
          font: 'Consolas',
          size: 20, // 10pt
          color: '262626'
        })
      ]
    })
  );
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { line: 360, before: 60, after: 60 },
    children: [
      new TextRun({
        text: text,
        font: FONT_NAME,
        size: 26
      })
    ]
  });
}

function createTable(headers, rowsData) {
  const borderStyle = { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER };
  const borders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { fill: 'EBF1F5' },
      borders,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 280, before: 60, after: 60 },
          children: [
            new TextRun({
              text: h,
              font: FONT_NAME,
              size: 24, // 12pt
              bold: true,
              color: COLOR_PRIMARY
            })
          ]
        })
      ]
    }))
  });

  const bodyRows = rowsData.map(row => new TableRow({
    children: row.map((cellText, idx) => new TableCell({
      borders,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: idx === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { line: 280, before: 40, after: 40 },
          children: [
            new TextRun({
              text: cellText,
              font: FONT_NAME,
              size: 24
            })
          ]
        })
      ]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows]
  });
}

// ==============================================================================
// XAY DUNG NOI DUNG CHI TIET TAI LIEU GIAI DOAN 2
// ==============================================================================

const docChildren = [
  // TRANG BIA
  p('BỘ CÔNG THƯƠNG', { alignment: AlignmentType.CENTER, bold: true, size: 28, line: 280 }),
  p('TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH', { alignment: AlignmentType.CENTER, bold: true, size: 28, line: 280 }),
  p('KHOA CÔNG NGHỆ THÔNG TIN', { alignment: AlignmentType.CENTER, bold: true, size: 28, color: COLOR_PRIMARY, line: 280 }),
  p('-----o0o-----', { alignment: AlignmentType.CENTER, size: 26, line: 280 }),
  p('', { line: 360, before: 600 }),

  p('BÁO CÁO TIẾN ĐỘ ĐỒ ÁN - GIAI ĐOẠN 2', { alignment: AlignmentType.CENTER, bold: true, size: 36, color: COLOR_PRIMARY, line: 360 }),
  p('(NỘP DATABASE MODEL & DESIGN SCRIPTS)', { alignment: AlignmentType.CENTER, bold: true, size: 28, color: 'C00000', line: 360 }),
  p('', { line: 360, before: 300 }),

  p('HỌC PHẦN: DỮ LIỆU NOSQL (LỚP 14DH)', { alignment: AlignmentType.CENTER, bold: true, size: 28, line: 360 }),
  p('ĐỀ TÀI: NỀN TẢNG HỌC TẬP TRỰC TUYẾN (E-LEARNING) & LUYỆN THI TRẮC NGHIỆM ĐA MÔ HÌNH NOSQL', { alignment: AlignmentType.CENTER, bold: true, size: 28, color: '2E75B6', line: 360 }),
  p('', { line: 360, before: 800 }),

  // THONG TIN GIANG VIEN & SINH VIEN
  new Table({
    width: { size: 90, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              p([new TextRun({ text: 'Giảng viên hướng dẫn: ', bold: true, font: FONT_NAME, size: 26 }), new TextRun({ text: 'Bộ môn Hệ thống Thông tin', font: FONT_NAME, size: 26 })]),
              p([new TextRun({ text: 'Nhóm sinh viên thực hiện: ', bold: true, font: FONT_NAME, size: 26 }), new TextRun({ text: 'Nhóm 18', font: FONT_NAME, size: 26 })]),
              p([new TextRun({ text: '1. Nguyễn Trọng Nguyên', font: FONT_NAME, size: 26 }), new TextRun({ text: ' - MSSV: 2001230589 (Nhóm trưởng)', bold: true, font: FONT_NAME, size: 26 })]),
              p([new TextRun({ text: '2. Phạm Nguyễn Khôi Nguyên', font: FONT_NAME, size: 26 }), new TextRun({ text: ' - MSSV: 2001230578', font: FONT_NAME, size: 26 })]),
              p([new TextRun({ text: '3. Võ Huỳnh Gia Huy', font: FONT_NAME, size: 26 }), new TextRun({ text: ' - MSSV: 2001230303', font: FONT_NAME, size: 26 })]),
              p([new TextRun({ text: 'Ngành đào tạo: ', bold: true, font: FONT_NAME, size: 26 }), new TextRun({ text: 'Công nghệ Thông tin', font: FONT_NAME, size: 26 })])
            ]
          })
        ]
      })
    ]
  }),

  p('', { line: 360, before: 1200 }),
  p('TP. Hồ Chí Minh, Tháng 10 Năm 2026', { alignment: AlignmentType.CENTER, italics: true, size: 26, line: 360 }),
  new Paragraph({ pageBreakBefore: true }),

  // TRANG PHAN CONG NHIEM VU
  h1('BẢNG PHÂN CÔNG NHIỆM VỤ THỰC HIỆN GIAI ĐOẠN 2'),
  p('Giai đoạn 2 tập trung hoàn toàn vào việc thiết kế cấu trúc dữ liệu, hiện thực hóa các mô hình CSDL NoSQL (Database Model) và xây dựng scripts tạo lập dữ liệu mẫu tương ứng với các yêu cầu đã đặc tả trong tài liệu SRS ở Giai đoạn 1.'),
  createTable(
    ['STT', 'Họ và tên', 'MSSV', 'Nhiệm vụ phụ trách trong Giai đoạn 2', 'Đánh giá'],
    [
      ['1', 'Nguyễn Trọng Nguyên (Trưởng nhóm)', '2001230589', 'Chịu trách nhiệm chính thiết kế Data Model MongoDB (Document) & Redis (Key-Value/TTL/ZSET); Xây dựng kịch bản tráo câu hỏi chống gian lận; Viết script seed data và tổng hợp báo cáo Giai đoạn 2.', 'Hoàn thành 100%'],
      ['2', 'Phạm Nguyễn Khôi Nguyên', '2001230578', 'Chịu trách nhiệm thiết kế Data Model Apache Cassandra (Wide-Column/Column-Family); Thiết kế Keyspace elearning_logs, bảng learning_events, xác định Partition Key & Clustering Key; Viết script CQL và kiểm thử hiệu năng.', 'Hoàn thành 100%'],
      ['3', 'Võ Huỳnh Gia Huy', '2001230303', 'Chịu trách nhiệm thiết kế Knowledge Graph trên Neo4j; Xây dựng mô hình Node (Course, Topic, Lesson, Skill) và 5 loại Relationship; Xây dựng tập lệnh Cypher truy vấn lộ trình học tập và kiểm thử đồ thị.', 'Hoàn thành 100%']
    ]
  ),
  new Paragraph({ pageBreakBefore: true }),

  // CHUONG 1: TONG QUAN KIEN TRUC
  h1('CHƯƠNG 1. TỔNG QUAN KIẾN TRÚC ĐA CƠ SỞ DỮ LIỆU (POLYGLOT ARCHITECTURE)'),
  p('Trong các hệ thống EdTech quy mô lớn hiện đại, một cơ sở dữ liệu quan hệ truyền thống (RDBMS) duy nhất không thể đồng thời tối ưu hóa được cho tất cả các loại tải trọng: nghiệp vụ bài học dạng tài liệu động, ghi nhật ký telemetry thời gian thực hàng triệu sự kiện/phút, truy xuất điểm số bảng xếp hạng tức thì dưới 1ms, và phân tích đồ thị tri thức đa cấp.'),
  p('Do đó, nhóm 18 lựa chọn kiến trúc Polyglot Persistence sử dụng 100% NoSQL, phân chia vai trò rõ ràng cho 4 hệ CSDL NoSQL đại diện cho 4 mô hình dữ liệu chính:'),
  createTable(
    ['Hệ CSDL', 'Mô hình NoSQL', 'Vai trò & Trách nhiệm trong Hệ thống', 'Cơ chế triển khai'],
    [
      ['MongoDB 7.0', 'Document Database (BSON/JSON)', 'Lưu trữ nghiệp vụ chính: Danh mục Khóa học, Bài học, Ngân hàng câu hỏi trắc nghiệm, Cấu hình đề thi và Bảng kết quả làm bài của học viên.', 'Docker Container (Port 27017)'],
      ['Redis 7.2', 'In-Memory Key-Value & Cache', 'Lưu trữ phiên thi đếm ngược có gắn TTL (hết giờ tự khóa), lưu trữ thứ tự tráo đề ngẫu nhiên (Anti-cheat), bảng xếp hạng thời gian thực (Sorted Set) và Pub/Sub cập nhật điểm.', 'Docker Container (Port 6379)'],
      ['Apache Cassandra 4.1', 'Wide-Column Store (Column-Family)', 'Lưu trữ dữ liệu chuỗi thời gian (Time-Series) và nhật ký hành vi học tập (Learning Telemetry): clickstream, tiến độ xem video, lịch sử nộp bài với tốc độ ghi cực lớn.', 'Docker Container (Port 9042)'],
      ['Neo4j 5.20', 'Graph Database (Node - Relationship)', 'Mô hình hóa Đồ thị Tri thức môn học (Knowledge Graph): quan hệ tiên quyết giữa các môn học, quan hệ bao hàm bài học - chủ đề, thuật toán gợi ý lộ trình học tập cá nhân hóa.', 'Docker Container (Port 7474 / 7687)']
    ]
  ),
  new Paragraph({ pageBreakBefore: true }),

  // CHUONG 2: MONGODB MODEL
  h1('CHƯƠNG 2. THIẾT KẾ MÔ HÌNH DỮ LIỆU MONGODB (DOCUMENT DATABASE)'),
  p('MongoDB được sử dụng làm CSDL nghiệp vụ trung tâm. Cấu trúc JSON linh hoạt cho phép nhúng (embedding) hoặc liên kết (referencing) dữ liệu bài học và bài thi một cách tự nhiên, giảm thiểu tối đa chi phí JOIN.'),
  
  h2('2.1. Danh sách các Collections và Cấu trúc Schema'),
  p('Hệ thống thiết kế gồm 6 collections chính (vượt xa yêu cầu tối thiểu 2 collections của giảng viên):'),
  bullet('users: Lưu thông tin người dùng với 3 phân quyền (STUDENT, TEACHER, ADMIN).'),
  bullet('courses: Lưu danh mục khóa học, mô tả, giảng viên phụ trách, danh mục, cấp độ và ảnh đại diện.'),
  bullet('lessons: Lưu nội dung chi tiết bài học, tài liệu, liên kết video bài giảng và thứ tự bài học.'),
  bullet('questions: Ngân hàng câu hỏi trắc nghiệm, các phương án lựa chọn, đáp án đúng và điểm số.'),
  bullet('exams: Đề thi trực tuyến, thời lượng, số lượng câu hỏi, trạng thái kích hoạt.'),
  bullet('results: Kết quả làm bài thi của học viên, danh sách chi tiết câu trả lời, điểm số và xếp loại.'),

  h2('2.2. Thiết kế Indexes tối ưu hiệu năng'),
  p('Để tăng tốc độ truy vấn trên tập dữ liệu lớn, các chỉ mục được thiết lập cụ thể:'),
  ...codeBlock(`// Thiết lập Single Index, Compound Index và Text Index trên MongoDB
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.courses.createIndex({ "code": 1 }, { unique: true });
db.lessons.createIndex({ "courseId": 1, "order": 1 }); // Compound Index
db.questions.createIndex({ "subject": 1, "difficulty": 1 });
db.exams.createIndex({ "courseId": 1, "status": 1 });
db.results.createIndex({ "examId": 1, "studentId": 1 });

// Full-Text Index đa trường hỗ trợ tìm kiếm khóa học tiếng Việt
db.courses.createIndex(
  { "title": "text", "tagline": "text", "description": "text", "category": "text" },
  { default_language: "none" }
);`),

  h2('2.3. Cấu trúc Document mẫu chi tiết'),
  p('Dưới đây là cấu trúc Document tiêu biểu cho Collection Khóa học và Đề thi:'),
  ...codeBlock(`// Document mẫu trong collection 'courses':
{
  "_id": ObjectId("670000000000000000000010"),
  "code": "NOSQL01",
  "title": "Cơ Sở Dữ Liệu NoSQL & Phân Tích Dữ Liệu Lớn",
  "category": "Database",
  "level": "Chuyên ngành",
  "instructor": "Bộ môn Hệ thống Thông tin",
  "durationHours": 45,
  "lessonsCount": 5,
  "status": "PUBLISHED",
  "createdAt": ISODate("2026-10-14T00:00:00Z")
}

// Document mẫu trong collection 'results' (Lưu kết quả nộp bài thi):
{
  "_id": ObjectId("670000000000000000000050"),
  "examId": ObjectId("670000000000000000000040"),
  "studentId": "2001230589",
  "studentName": "Nguyễn Trọng Nguyên",
  "score": 10.0,
  "correctCount": 3,
  "totalQuestions": 3,
  "timeSpentSeconds": 540,
  "submittedAt": ISODate("2026-10-14T09:40:00Z")
}`),

  h2('2.4. Các câu lệnh thao tác mẫu (CRUD, Text Search & Aggregation Pipeline)'),
  p('Hệ thống triển khai đầy đủ các dạng truy vấn nâng cao:'),
  ...codeBlock(`// 1. Tìm kiếm Full-Text Search với xếp hạng textScore:
db.courses.find(
  { $text: { $search: "NoSQL Cassandra" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } });

// 2. Aggregation Pipeline: Thống kê phân tích điểm thi theo từng đề cho Giảng viên
db.results.aggregate([
  { $match: { examId: ObjectId("670000000000000000000040") } },
  { $group: {
      _id: "$examId",
      totalSubmissions: { $sum: 1 },
      avgScore: { $avg: "$score" },
      maxScore: { $max: "$score" },
      minScore: { $min: "$score" }
    }
  }
]);`),
  new Paragraph({ pageBreakBefore: true }),

  // CHUONG 3: REDIS MODEL
  h1('CHƯƠNG 3. THIẾT KẾ MÔ HÌNH DỮ LIỆU REDIS (KEY-VALUE & REAL-TIME STORE)'),
  p('Redis đóng vai trò là tầng In-Memory đệm trung gian tốc độ cao, giải quyết triệt để vấn đề nghẽn cổ chai (I/O Bottleneck) trong giờ cao điểm làm bài thi.'),

  h2('3.1. Các nhóm Key-Value & Cấu trúc Dữ liệu'),
  p('Hệ thống phân chia Redis thành 4 nhóm key chuyên biệt với tiền tố chuẩn xác:'),
  bullet('Nhóm 1: Cache danh mục khóa học (String JSON): Tiền tố cache:courses:all, cache:course:summary:{id}. Tự động giải phóng hoặc ghi đè khi có cập nhật.'),
  bullet('Nhóm 2: Phiên làm bài thi tạm thời (String JSON + Hash kèm TTL): Tiền tố exam:session:{studentId} và exam:{examId}:attempt:{studentId}. Quản lý thời gian làm bài đếm ngược (TTL = 1800s).'),
  bullet('Nhóm 3: Thứ tự tráo câu hỏi chống gian lận (Anti-Cheat Shuffling): Tiền tố exam:{examId}:order:{studentId}. Lưu mảng ID câu hỏi được tráo bằng thuật toán Fisher-Yates riêng biệt cho từng thí sinh.'),
  bullet('Nhóm 4: Bảng xếp hạng Real-time (Sorted Set - ZSET): Tiền tố leaderboard:{examId} và leaderboard:overall. Lưu trữ điểm số (Score) của học viên (Member) để sắp xếp xếp hạng tức thì.'),

  h2('3.2. Bảng đặc tả chi tiết các Keys trong Redis'),
  createTable(
    ['Tên mẫu Key trong Redis', 'Kiểu dữ liệu (Redis Type)', 'Thời gian sống (TTL)', 'Mục đích & Ý nghĩa nghiệp vụ'],
    [
      ['cache:courses:all', 'String (JSON)', '300 giây (5 phút)', 'Cache toàn bộ danh sách khóa học, giảm tải cho MongoDB read'],
      ['exam:{id}:attempt:{studentId}', 'String (JSON)', '1800 giây (30 phút)', 'Lưu phiên làm bài thi đang diễn ra, thời điểm bắt đầu'],
      ['exam:{id}:answers:{attemptId}', 'Hash (Field-Value)', '1800 giây (30 phút)', 'Lưu tạm các câu trả lời trắc nghiệm học viên vừa bấm chọn'],
      ['exam:{id}:order:{studentId}', 'String (JSON array)', '1800 giây (30 phút)', 'Lưu thứ tự câu hỏi và đáp án đã tráo ngẫu nhiên chống gian lận'],
      ['leaderboard:{examId}', 'Sorted Set (ZSET)', 'Không hết hạn (Persist)', 'Bảng xếp hạng điểm thi theo từng bài thi'],
      ['leaderboard:overall', 'Sorted Set (ZSET)', 'Không hết hạn (Persist)', 'Bảng xếp hạng tổng điểm tích lũy toàn hệ thống'],
      ['ratelimit:{ip}:{minute}', 'String (Integer counter)', '60 giây', 'Token-bucket rate limiter ngăn chặn spam API']
    ]
  ),

  h2('3.3. Các thao tác tập lệnh mẫu trên Redis'),
  ...codeBlock(`// 1. Thao tác lưu phiên làm bài với thời gian đếm ngược (TTL 30 phút = 1800s)
SET exam:670000000000000000000040:attempt:2001230589 "{\\"startTime\\":\\"2026-10-14T09:00:00Z\\",\\"duration\\":30}" EX 1800
TTL exam:670000000000000000000040:attempt:2001230589

// 2. Thao tác lưu câu trả lời tạm thời dạng Hash
HSET exam:670000000000000000000040:answers:ATTEMPT_01 "q1" "A" "q2" "C" "q3" "B"
EXPIRE exam:670000000000000000000040:answers:ATTEMPT_01 1800

// 3. Thao tác cập nhật và lấy Top 10 Bảng xếp hạng tức thì (Sorted Set)
ZADD leaderboard:overall 9.5 "2001230589" 8.0 "2001230578" 8.5 "2001230303"
ZREVRANGEBYSCORE leaderboard:overall +inf -inf WITHSCORES LIMIT 0 10

// 4. Redis Pub/Sub phát sự kiện Live Stream điểm số thời gian thực
PUBLISH leaderboard_update "{\\"studentId\\":\\"2001230589\\",\\"score\\":10,\\"time\\":\\"09:30:00\\"}"`),
  new Paragraph({ pageBreakBefore: true }),

  // CHUONG 4: CASSANDRA MODEL
  h1('CHƯƠNG 4. THIẾT KẾ MÔ HÌNH DỮ LIỆU APACHE CASSANDRA (WIDE-COLUMN STORE)'),
  p('Apache Cassandra được sử dụng chuyên biệt cho bài toán dữ liệu lớn chuỗi thời gian (Time-Series Learning Telemetry), nơi yêu cầu tốc độ ghi cực nhanh, không bao giờ xảy ra tình trạng nghẽn khóa bảng (Lock contention) và khả năng mở rộng tuyến tính (Linear Scalability).'),

  h2('4.1. Thiết kế Keyspace và Chiến lược Nhân bản (Replication Strategy)'),
  p('Hệ thống khởi tạo Keyspace riêng biệt với cấu hình tối ưu môi trường:'),
  bullet('Tên Keyspace: elearning_logs'),
  bullet('Replication Strategy: SimpleStrategy (cho môi trường kiểm thử/đồ án) hoặc NetworkTopologyStrategy (cho môi trường sản xuất nhiều Datacenter).'),
  bullet('Replication Factor: 1 (kiểm thử) / 3 (môi trường sản xuất).'),

  h2('4.2. Thiết kế Bảng và Phân tích Khóa (Partition Key & Clustering Key)'),
  p('Quy tắc cốt lõi khi thiết kế bảng trên Cassandra là "Query-Driven Design" (thiết kế bảng phục vụ chính xác câu truy vấn):'),
  createTable(
    ['Tên Bảng (Column Family)', 'Mục đích nghiệp vụ', 'Partition Key (Khóa phân vùng)', 'Clustering Key (Khóa sắp xếp)'],
    [
      ['learning_events', 'Lưu nhật ký hành vi học tập, click video, thời gian tương tác', 'student_id', 'event_time DESC, event_id ASC'],
      ['lesson_activity_by_day', 'Thống kê tổng hợp số lượt tương tác bài học theo ngày', '(course_id, lesson_id)', 'day text, event_type text']
    ]
  ),
  p('Giải thích nguyên lý khóa bảng learning_events:'),
  bullet('Partition Key ((student_id)): Gom toàn bộ lịch sử học tập của cùng một sinh viên vào cùng một Node vật lý trên cụm máy chủ, giúp việc đọc lịch sử cá nhân diễn ra với độ trễ cực thấp (1 lần đọc ổ đĩa).'),
  bullet('Clustering Key (event_time DESC, event_id ASC): Sắp xếp các sự kiện mới nhất lên trước theo thứ tự thời gian giảm dần, phục vụ hoàn hảo cho việc hiển thị "Hoạt động gần đây" của sinh viên.'),

  h2('4.3. Script CQL tạo bảng và câu lệnh truy vấn mẫu'),
  ...codeBlock(`-- 1. Tạo Keyspace
CREATE KEYSPACE IF NOT EXISTS elearning_logs
WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 };

USE elearning_logs;

-- 2. Tạo Bảng learning_events với Partition & Clustering Key
CREATE TABLE IF NOT EXISTS learning_events (
    student_id text,
    event_time timestamp,
    event_id uuid,
    event_type text,       -- 'video_start', 'video_progress', 'video_completed', 'quiz_click'
    course_id text,
    lesson_id text,
    session_id text,
    duration_seconds int,
    payload text,          -- Dữ liệu JSON mở rộng (thiết bị, vị trí video)
    PRIMARY KEY ((student_id), event_time, event_id)
) WITH CLUSTERING ORDER BY (event_time DESC, event_id ASC);

-- 3. Truy vấn mẫu: Lấy 10 hoạt động học tập mới nhất của sinh viên '2001230589'
SELECT student_id, event_time, event_type, course_id, duration_seconds 
FROM learning_events 
WHERE student_id = '2001230589' 
LIMIT 10;

-- 4. Truy vấn mẫu theo khoảng thời gian học tập:
SELECT * FROM learning_events
WHERE student_id = '2001230589' 
  AND event_time >= '2026-10-14 00:00:00' 
  AND event_time <= '2026-10-14 23:59:59';`),
  new Paragraph({ pageBreakBefore: true }),

  // CHUONG 5: NEO4J MODEL
  h1('CHƯƠNG 5. THIẾT KẾ ĐỒ THỊ TRI THỨC NEO4J (GRAPH DATABASE)'),
  p('Neo4j là CSDL đồ thị hàng đầu, được sử dụng để quản lý Đồ thị Tri thức môn học (Knowledge Graph), xử lý các mối quan hệ đa chiều và thuật toán duyệt đồ thị (Graph Traversal) để gợi ý lộ trình học tập tối ưu mà RDBMS hoặc Document Store rất khó thực hiện hiệu quả.'),

  h2('5.1. Thiết kế các loại Nodes (Đỉnh đồ thị)'),
  p('Hệ thống thiết kế 4 loại Node chính (vượt yêu cầu tối thiểu 2 loại):'),
  bullet('Course: Đại diện cho môn học/khóa học (id, name, credits, level).'),
  bullet('Lesson: Đại diện cho từng bài học cụ thể (id, title, order).'),
  bullet('Topic: Đại diện cho chủ đề kiến thức cốt lõi (id, name, description).'),
  bullet('Skill: Đại diện cho kỹ năng đầu ra đạt được (id, name).'),

  h2('5.2. Thiết kế các loại Relationships (Cạnh quan hệ)'),
  p('Hệ thống thiết kế 5 loại quan hệ có hướng và thuộc tính (vượt yêu cầu tối thiểu 3 loại):'),
  bullet('[:PREREQUISITE_OF]: Môn học A hoặc bài học A là điều kiện tiên quyết bắt buộc phải hoàn thành trước môn/bài B.'),
  bullet('[:CONTAINS]: Khóa học chứa các bài học (có thuộc tính order, semester).'),
  bullet('[:COVERS]: Bài học giảng dạy và bao hàm các chủ đề kiến thức (Topic).'),
  bullet('[:DEVELOPS]: Bài học hoặc khóa học giúp sinh viên rèn luyện kỹ năng (Skill).'),
  bullet('[:RELATED_TO]: Mối quan hệ liên thông kiến thức tương đồng giữa các môn học.'),

  h2('5.3. Script Cypher tạo cấu trúc Đồ thị Tri thức mẫu'),
  ...codeBlock(`// 1. Tạo ràng buộc duy nhất (Unique Constraints)
CREATE CONSTRAINT unique_course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT unique_topic_id IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE;

// 2. Tạo Nodes mẫu
CREATE 
  (c_dbms:Course {id: 'COURSE_DBMS', name: 'Hệ Quản Trị CSDL', credits: 3, level: 'CoSoNganh'}),
  (c_nosql:Course {id: 'COURSE_NOSQL', name: 'Cơ Sở Dữ Liệu NoSQL', credits: 2, level: 'ChuyenNganh'}),
  (t_doc:Topic {id: 'TOPIC_DOC', name: 'Document Store (MongoDB)'}),
  (t_graph:Topic {id: 'TOPIC_GRAPH', name: 'Graph Database (Neo4j)'}),
  (s_model:Skill {id: 'SKILL_MODELING', name: 'Thiết Kế Data Model NoSQL'});

// 3. Tạo Quan hệ (Relationships)
CREATE
  (c_dbms)-[:PREREQUISITE_OF]->(c_nosql),
  (c_nosql)-[:COVERS]->(t_doc),
  (c_nosql)-[:COVERS]->(t_graph),
  (c_nosql)-[:DEVELOPS]->(s_model);`),

  h2('5.4. Các truy vấn Cypher phân tích và gợi ý lộ trình học tập'),
  ...codeBlock(`// 1. Kiểm tra môn học tiên quyết cần hoàn thành trước khi đăng ký khóa NoSQL:
MATCH (pre:Course)-[:PREREQUISITE_OF]->(target:Course {id: 'COURSE_NOSQL'})
RETURN pre.name AS MonHocTienQuyet, target.name AS MonHocMucTieu;

// 2. Thuật toán gợi ý môn học tiếp theo dựa trên sự tương đồng về kỹ năng và chủ đề:
MATCH (completed:Course {id: 'COURSE_DBMS'})-[:COVERS]->(t:Topic)<-[:COVERS]-(recommended:Course)
WHERE completed <> recommended
RETURN recommended.name AS KhoaHocGoiY, count(t) AS SoChuDeChung
ORDER BY SoChuDeChung DESC;`),
  new Paragraph({ pageBreakBefore: true }),

  // CHUONG 6: KIEM THU & SCRIPTS
  h1('CHƯƠNG 6. KẾT QUẢ TRIỂN KHAI VÀ BỘ SCRIPTS ĐI KÈM'),
  p('Toàn bộ 4 mô hình CSDL NoSQL đã được triển khai thực tế trên hệ thống máy chủ Docker và kiểm thử tự động 100% bằng script kiểm thử chuyên dụng (scripts/automated_tests.js).'),
  
  h2('6.1. Bảng tổng hợp kết quả kiểm thử mô hình dữ liệu'),
  createTable(
    ['STT', 'Bài kiểm thử mô hình CSDL (Test Case)', 'Hệ CSDL', 'Mô tả kết quả thực thi', 'Trạng thái'],
    [
      ['1', 'Test MongoDB Connection & Ping', 'MongoDB', 'Kết nối thành công tới Database elearning_nosql', 'PASS (100%)'],
      ['2', 'Test MongoDB CRUD Course & Lesson', 'MongoDB', 'Tạo, đọc, cập nhật thành công khóa học NOSQL01', 'PASS (100%)'],
      ['3', 'Test MongoDB Text Search Tiếng Việt', 'MongoDB', 'Tìm kiếm "NoSQL" khớp chính xác khóa học và bài giảng', 'PASS (100%)'],
      ['4', 'Test MongoDB Aggregation Pipeline', 'MongoDB', 'Tính đúng điểm trung bình, điểm min/max đề thi', 'PASS (100%)'],
      ['5', 'Test Redis Cache String & TTL', 'Redis', 'Lưu cache khóa học với thời gian sống TTL chính xác', 'PASS (100%)'],
      ['6', 'Test Redis Session Attempt (TTL 1800s)', 'Redis', 'Khởi tạo phiên thi tạm đếm ngược 30 phút thành công', 'PASS (100%)'],
      ['7', 'Test Redis Anti-Cheat Question Shuffle', 'Redis', 'Tráo câu hỏi Fisher-Yates lưu thành công trên Redis', 'PASS (100%)'],
      ['8', 'Test Redis Leaderboard Sorted Sets', 'Redis', 'ZADD cập nhật điểm và ZREVRANGE lấy BXH chính xác', 'PASS (100%)'],
      ['9', 'Test Redis Pub/Sub Event Stream', 'Redis', 'Phát sự kiện leaderboard_update cho client qua SSE', 'PASS (100%)'],
      ['10', 'Test Cassandra Keyspace & Table', 'Cassandra', 'Keyspace elearning_logs và bảng learning_events hoạt động tốt', 'PASS (100%)'],
      ['11', 'Test Cassandra Telemetry Insert & Query', 'Cassandra', 'Ghi nhận log video và truy vấn theo student_id thành công', 'PASS (100%)'],
      ['12', 'Test Neo4j Driver Connection', 'Neo4j', 'Kết nối thành công tới neo4j://localhost:7687', 'PASS (100%)'],
      ['13', 'Test Neo4j Node & Prerequisite Query', 'Neo4j', 'Truy vấn MATCH tìm đúng môn tiên quyết COURSE_DBMS', 'PASS (100%)'],
      ['14', 'Test Neo4j Course Recommendation', 'Neo4j', 'Thuật toán tìm khóa học liên quan qua Topic hoạt động chính xác', 'PASS (100%)']
    ]
  ),

  h2('6.2. Cấu trúc thư mục Scripts đính kèm bài nộp Giai đoạn 2'),
  p('Toàn bộ mã nguồn scripts tạo lập CSDL và dữ liệu mẫu đã được nhóm tổ chức khoa học trong thư mục scripts/ của đồ án:'),
  bullet('scripts/mongo_seed.js: Script khởi tạo 6 Collections, Indexes và nạp dữ liệu mẫu cho MongoDB.'),
  bullet('scripts/redis_demo.js: Script thực thi và mô phỏng các nhóm Key-Value, TTL và Sorted Sets trên Redis.'),
  bullet('scripts/cassandra_schema.cql: Script CQL tạo Keyspace elearning_logs, bảng learning_events và nạp log mẫu.'),
  bullet('scripts/neo4j_graph.cypher: Script Cypher tạo Nodes, Relationships và các câu truy vấn gợi ý lộ trình đồ thị.'),
  bullet('scripts/automated_tests.js: Bộ kịch bản kiểm thử tự động 14 ca kiểm thử trên cả 4 CSDL.'),
  bullet('docker-compose.yml: File cấu hình môi trường khởi chạy trọn gói cả 4 container CSDL.'),

  p('', { line: 360, before: 600 }),
  p('--- HẾT BÁO CÁO GIAI ĐOẠN 2 ---', { alignment: AlignmentType.CENTER, bold: true, size: 26, color: COLOR_PRIMARY, line: 360 })
];

// TAO DOCUMENT WORD HOAN CHINH
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT_NAME,
          size: 26, // 13pt
          color: '000000'
        },
        paragraph: {
          spacing: {
            line: 360 // 1.5 lines
          }
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440,    // 2.54 cm
            bottom: 1440, // 2.54 cm
            left: 1700,   // 3.0 cm
            right: 1134   // 2.0 cm
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { line: 240, after: 120 },
              children: [
                new TextRun({
                  text: 'Đồ án NoSQL (14DH) - Giai đoạn 2: Database Model & Design Scripts - Nhóm 18',
                  font: FONT_NAME,
                  size: 18, // 9pt
                  italics: true,
                  color: '808080'
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { line: 240, before: 120 },
              children: [
                new TextRun({
                  text: 'Trang ',
                  font: FONT_NAME,
                  size: 20
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT_NAME,
                  size: 20,
                  bold: true
                }),
                new TextRun({
                  text: ' / ',
                  font: FONT_NAME,
                  size: 20
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: FONT_NAME,
                  size: 20
                })
              ]
            })
          ]
        })
      },
      children: docChildren
    }
  ]
});

// GHI RA FILE WORD
const outputPath1 = path.join(__dirname, 'Nhom_18_GiaiDoan2_Database_Model.docx');
const outputPath2 = path.join(__dirname, '..', 'Nhom_18_GiaiDoan2_Database_Model.docx');

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath1, buffer);
  fs.writeFileSync(outputPath2, buffer);
  console.log('XUAT FILE THANH CONG!');
  console.log('File 1:', outputPath1);
  console.log('File 2:', outputPath2);
}).catch(err => {
  console.error('Loi khi tao file Word:', err);
});
