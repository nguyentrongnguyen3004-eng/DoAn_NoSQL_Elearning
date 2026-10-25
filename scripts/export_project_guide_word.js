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

console.log('--- BAT DAU TAO TAI LIEU WORD: HUONG DAN DU AN VA PHAN CONG CONG VIEC ---');

const FONT_NAME = 'Times New Roman';
const COLOR_PRIMARY = '1F497D'; // Navy blue HUIT
const COLOR_SECONDARY = '2E75B6'; // Light blue
const COLOR_MUTED = '595959'; // Gray
const COLOR_BORDER = 'D3D3D3';
const COLOR_BG_LIGHT = 'F2F4F7';
const COLOR_CALLOUT_BG = 'EDF2F7';
const COLOR_SUCCESS = '10B981';

function p(text = '', options = {}) {
  const runs = Array.isArray(text)
    ? text
    : [
        new TextRun({
          text,
          font: FONT_NAME,
          size: options.size || 26, // 13pt
          bold: options.bold || false,
          italics: options.italics || false,
          color: options.color || '000000'
        })
      ];

  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: {
      line: options.line || 360, // 1.5 line spacing
      before: options.before !== undefined ? options.before : 120,
      after: options.after !== undefined ? options.after : 120
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
        color: COLOR_SECONDARY
      })
    ]
  });
}

function h3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 90, line: 360 },
    children: [
      new TextRun({
        text: title,
        font: FONT_NAME,
        size: 26, // 13pt
        bold: true,
        italics: true,
        color: COLOR_PRIMARY
      })
    ]
  });
}

function codeBlock(codeText) {
  const lines = codeText.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_SECONDARY },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC' },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: lines.map(
              l =>
                new Paragraph({
                  spacing: { line: 240, before: 10, after: 10 },
                  children: [
                    new TextRun({
                      text: l || ' ',
                      font: 'Consolas',
                      size: 20, // 10pt
                      color: '0F172A'
                    })
                  ]
                })
            )
          })
        ]
      })
    ]
  });
}

function calloutBox(title, message, isSuccess = false) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 8, color: isSuccess ? COLOR_SUCCESS : COLOR_PRIMARY },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_CALLOUT_BG },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { line: 280, before: 40, after: 60 },
                children: [
                  new TextRun({
                    text: (isSuccess ? '✅ ' : '📌 ') + title,
                    font: FONT_NAME,
                    size: 24,
                    bold: true,
                    color: isSuccess ? '047857' : COLOR_PRIMARY
                  })
                ]
              }),
              new Paragraph({
                spacing: { line: 300, before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: message,
                    font: FONT_NAME,
                    size: 24,
                    italics: true,
                    color: '1E293B'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createTable(headers, rows, colWidths = []) {
  const tableRows = [];

  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => {
        const w = colWidths[i] || Math.floor(100 / headers.length);
        return new TableCell({
          width: { size: w, type: WidthType.PERCENTAGE },
          shading: { fill: COLOR_PRIMARY },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: h,
                  font: FONT_NAME,
                  size: 24,
                  bold: true,
                  color: 'FFFFFF'
                })
              ]
            })
          ]
        });
      })
    })
  );

  rows.forEach((row, rIdx) => {
    tableRows.push(
      new TableRow({
        children: row.map((cell, cIdx) => {
          const w = colWidths[cIdx] || Math.floor(100 / row.length);
          return new TableCell({
            width: { size: w, type: WidthType.PERCENTAGE },
            shading: { fill: rIdx % 2 === 1 ? COLOR_BG_LIGHT : 'FFFFFF' },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: cell,
                    font: FONT_NAME,
                    size: 22,
                    color: '1E293B'
                  })
                ]
              })
            ]
          });
        })
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER }
    },
    rows: tableRows
  });
}

async function buildWordDocument() {
  const doc = new Document({
    creator: 'Nhóm 18 - 14DH HUIT',
    title: 'HƯỚNG DẪN DỰ ÁN, KIẾN TRÚC 4 NOSQL & PHÂN CÔNG CÔNG VIỆC',
    description: 'Tài liệu hướng dẫn kỹ thuật toàn diện, cách cài đặt, chạy hệ thống và phân công công việc chi tiết',
    styles: {
      default: {
        document: {
          run: { font: FONT_NAME, size: 26, color: '000000' }
        }
      }
    },
    sections: [
      // TRANG BÌA
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 }
          }
        },
        children: [
          p('BỘ CÔNG THƯƠNG', { alignment: AlignmentType.CENTER, bold: true, size: 26, line: 280, before: 0, after: 40 }),
          p('TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH (HUIT)', { alignment: AlignmentType.CENTER, bold: true, size: 28, color: COLOR_PRIMARY, line: 280, before: 40, after: 40 }),
          p('KHOA CÔNG NGHỆ THÔNG TIN - BỘ MÔN CƠ SỞ DỮ LIỆU', { alignment: AlignmentType.CENTER, bold: true, size: 24, color: COLOR_MUTED, line: 280, before: 40, after: 200 }),

          p('----------------------------------------------------', { alignment: AlignmentType.CENTER, color: COLOR_SECONDARY, before: 0, after: 300 }),

          p('BÁO CÁO ĐỒ ÁN MÔN HỌC', { alignment: AlignmentType.CENTER, bold: true, size: 34, color: 'C00000', before: 200, after: 100 }),
          p('HỌC PHẦN: CƠ SỞ DỮ LIỆU NOSQL (HỌC KỲ 7)', { alignment: AlignmentType.CENTER, bold: true, size: 28, color: COLOR_PRIMARY, before: 60, after: 300 }),

          p('TÊN ĐỀ TÀI:', { alignment: AlignmentType.CENTER, bold: true, size: 26, color: COLOR_MUTED, before: 100, after: 60 }),
          p('XÂY DỰNG NỀN TẢNG E-LEARNING & KHẢO SÁT NĂNG LỰC TIẾNG ANH THỰC CHIẾN TÍCH HỢP ĐA MÔ HÌNH 4 CƠ SỞ DỮ LIỆU NOSQL (MONGODB, REDIS, APACHE CASSANDRA, NEO4J)', {
            alignment: AlignmentType.CENTER,
            bold: true,
            size: 32,
            color: COLOR_PRIMARY,
            before: 60,
            after: 400
          }),

          p('TÀI LIỆU TOÀN DIỆN:', { alignment: AlignmentType.CENTER, bold: true, size: 24, italics: true, color: COLOR_SECONDARY, before: 100, after: 40 }),
          p('HƯỚNG DẪN NGUỒN GITHUB, VẬN HÀNH 4 CSDL, CÁCH CHẠY DỰ ÁN, PHÂN CÔNG CHI TIẾT 2 THÀNH VIÊN VÀ KỊCH BẢN THUYẾT TRÌNH BẢO VỆ', {
            alignment: AlignmentType.CENTER,
            bold: true,
            size: 24,
            color: '0F172A',
            before: 40,
            after: 600
          }),

          createTable(
            ['Thông tin', 'Chi tiết'],
            [
              ['Giảng viên hướng dẫn:', 'ThS. Nguyễn Văn A (Giảng viên Bộ môn NoSQL)'],
              ['Đơn vị đào tạo:', 'Khoa Công nghệ Thông tin - Trường ĐH Công Thương TP.HCM'],
              ['Nhóm sinh viên thực hiện:', 'Nhóm 18 - Lớp 14DHTH / Học kỳ 7'],
              ['Trưởng nhóm (Lead & Architect):', 'Nguyễn Trọng Nguyên (MSSV: 200121xxxx)'],
              ['Thành viên 2 (Academic & LMS):', '[Tên sinh viên 2] (MSSV: 200121xxxx)'],
              ['Thành viên 3 (Exam & Gamification):', '[Tên sinh viên 3] (MSSV: 200121xxxx)'],
              ['Link GitHub chính thức:', 'https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git'],
              ['Môi trường triển khai:', 'Node.js v18+ | Express | MongoDB | Redis | Cassandra | Neo4j']
            ],
            [35, 65]
          ),

          p('TP. HỒ CHÍ MINH, THÁNG 10 NĂM 2026', { alignment: AlignmentType.CENTER, bold: true, size: 24, color: COLOR_MUTED, before: 600, after: 0 })
        ]
      },

      // PHẦN NỘI DUNG CHÍNH
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'HUIT - Đồ Án NoSQL: Nền Tảng E-Learning & Khảo Sát 4 NoSQL (Nhóm 18)',
                    font: FONT_NAME,
                    size: 18,
                    italics: true,
                    color: COLOR_MUTED
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
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    font: FONT_NAME,
                    size: 20,
                    color: COLOR_MUTED
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_NAME,
                    size: 20,
                    bold: true,
                    color: COLOR_PRIMARY
                  }),
                  new TextRun({
                    text: ' / ',
                    font: FONT_NAME,
                    size: 20,
                    color: COLOR_MUTED
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT_NAME,
                    size: 20,
                    color: COLOR_MUTED
                  })
                ]
              })
            ]
          })
        },
        children: [
          // LỜI NÓI ĐẦU
          h1('LỜI MỞ ĐẦU & TỔNG QUAN HỆ THỐNG'),
          p(
            'Tài liệu này được biên soạn nhằm cung cấp bức tranh toàn cảnh, hướng dẫn kỹ thuật chi tiết từ A-Z và phân chia công việc rõ ràng cho nhóm sinh viên thực hiện đề tài Đồ án môn học Dữ liệu NoSQL. Hệ thống EduPro English là một nền tảng giáo dục trực tuyến thương mại hiện đại, được xây dựng trên nền tảng kiến trúc 100% NoSQL đa mô hình (Polyglot Persistence) bao gồm 4 hệ quản trị cơ sở dữ liệu hàng đầu hiện nay: MongoDB, Redis, Apache Cassandra và Neo4j.'
          ),
          p(
            'Mỗi hệ cơ sở dữ liệu được phân định ranh giới nghiệp vụ chuẩn xác, khai thác tối đa ưu thế đặc thù của từng mô hình dữ liệu (Document, In-Memory Data Structure, Wide-Column Time-Series, và Property Graph), giúp hệ thống đạt hiệu năng cao, khả năng mở rộng linh hoạt và tính sẵn sàng vượt trội.'
          ),

          calloutBox(
            'Mục Tiêu Tài Liệu Này',
            '1. Giúp mọi thành viên hiểu rõ nguồn mã nguồn GitHub, cách đồng bộ và quy trình quản trị code.\n2. Nắm vững bản chất kiến trúc và vai trò của từng CSDL NoSQL để trả lời câu hỏi vấn đáp.\n3. Hướng dẫn chi tiết từng bước cài đặt, khởi tạo database và chạy dự án trơn tru.\n4. Phân chia rõ ràng 10 Task cho Thành viên 1 và 10 Task cho Thành viên 2 kèm ràng buộc kỹ thuật.\n5. Cung cấp kịch bản thuyết trình và câu hỏi bảo vệ đồ án đạt điểm tối đa trước Hội đồng.',
            true
          ),

          // CHƯƠNG 1
          h1('CHƯƠNG 1: NGUỒN MÃ NGUỒN GITHUB & QUY TRÌNH QUẢN TRỊ CODE'),
          h2('1.1. Thông tin Kho lưu trữ GitHub (GitHub Repository)'),
          p('Mã nguồn hoàn chỉnh của dự án được lưu trữ và quản lý phiên bản tập trung tại GitHub:'),
          p('• Link GitHub Repository: https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git', { bold: true, color: COLOR_PRIMARY }),
          p('• Giao thức kết nối: Hỗ trợ cả HTTPS (`https://...`) và SSH (`git@github.com:...`).'),
          p('• Nhánh chính (Production / Stable): `main`. Mọi tính năng mới phải được phát triển trên nhánh riêng và kiểm thử thành công trước khi gộp (merge) vào nhánh chính.'),

          h2('1.2. Cấu trúc Cây Thư mục Dự án (Project Directory Tree)'),
          p('Dự án được tổ chức theo mô hình kiến trúc phân lớp hướng module (Modular Monolith) tối ưu cho việc đọc hiểu và phát triển nhóm:'),

          codeBlock(`D:\\TRONGNGUYEN_HK7\\NoSQL\\ĐỒ ÁN\\
├── public/                     # Frontend Single Page Application (SPA)
│   ├── index.html              # Toàn bộ giao diện người dùng, CSS Tailwind & Audio/Speech logic
│   └── assets/                 # Hình ảnh, file âm thanh Lofi, tài liệu đính kèm
├── src/                        # Backend Node.js / Express Server
│   ├── config/
│   │   └── db.js               # Khởi tạo kết nối tới 4 CSDL: MongoDB, Redis, Cassandra, Neo4j
│   ├── middlewares/
│   │   └── auth.js             # Middleware xác thực JWT token và phân quyền User/Teacher/Admin
│   ├── routes/
│   │   ├── authRoutes.js       # Xác thực, Đăng ký, Đăng nhập, OTP Redis, Đổi mật khẩu
│   │   ├── courseRoutes.js     # Khóa học LMS, Flashcard, Dictation, Gamification, Telemetry
│   │   ├── examRoutes.js       # Phòng thi trắc nghiệm, Anti-cheat 3/3, Writing AI, Chứng chỉ
│   │   └── graphRoutes.js      # Neo4j: Knowledge Graph, Skill Tree, Collocations, Adaptive Roadmap
│   ├── services/
│   │   └── emailService.js     # Gửi mã OTP xác thực qua Gmail SMTP Nodemailer
│   └── server.js               # Điểm khởi động Express server (Port 5050), Static routes, Healthcheck
├── scripts/                    # Scripts tự động hóa, Database Seed, Tests & Word Export
│   ├── seed_all_4_nosql.js     # Nạp dữ liệu đồng bộ cho toàn bộ 4 CSDL NoSQL
│   ├── mongo_seed.js           # Khởi tạo Collections, Schemas và Indexes trên MongoDB
│   ├── cassandra_schema.cql    # Mã DDL tạo Keyspace & Tables chuỗi thời gian trên Cassandra
│   ├── neo4j_graph.cypher      # Mã Cypher tạo Nodes (Course, Topic, Word) & Relationships
│   ├── redis_demo.js           # Script demo các kiểu dữ liệu Redis (String, Hash, Bitmap, Set, ZSet)
│   ├── automated_tests.js      # Kịch bản kiểm thử tự động toàn bộ 4 NoSQL endpoints
│   └── backup/                 # Scripts sao lưu tự động (mongodump, bgsave, nodetool snapshot)
├── .env                        # File cấu hình biến môi trường (Database URIs, Secrets, Ports)
├── package.json                # Quản lý thư viện phụ thuộc (Express, ioredis, mongodb, neo4j, docx)
└── README.md                   # Tài liệu hướng dẫn tóm tắt của dự án`),

          h2('1.3. Quy trình Phân nhánh Git & Phối hợp Nhóm (Git Branching Strategy)'),
          p('Để 2 thành viên còn lại phát triển song song mà tuyệt đối không xảy ra xung đột mã nguồn (Merge Conflict), nhóm áp dụng mô hình phân nhánh Git chuẩn công nghiệp:'),
          p('1. Nhánh `main`: Chỉ chứa code đã kiểm thử chạy tốt 100%, sẵn sàng để demo với Giảng viên.'),
          p('2. Nhánh `feature/member-1-lms-vocab`: Dành riêng cho Thành viên 1 phát triển các tính năng Khóa học, Từ vựng, Flashcard và AI Writing.'),
          p('3. Nhánh `feature/member-2-exam-cms`: Dành riêng cho Thành viên 2 phát triển các tính năng Phòng thi, Anti-cheat, Cửa hàng XP và Quản trị CMS.'),

          p('Các lệnh Git thao tác hàng ngày:'),
          codeBlock(`# 1. Lấy mã nguồn mới nhất từ GitHub về máy
git checkout main
git pull origin main

# 2. Tạo nhánh làm việc cá nhân (Thành viên 1 ví dụ)
git checkout -b feature/member-1-lms-vocab

# 3. Sau khi hoàn thành 1 task, kiểm tra trạng thái và commit
git status
git add .
git commit -m "feat(lms): them tinh nang tien do hoc tap va tai lieu dinh kem Task 1.3"

# 4. Đẩy nhánh cá nhân lên GitHub
git push -u origin feature/member-1-lms-vocab

# 5. Khi hoàn thiện và kiểm thử thành công, gộp vào main
git checkout main
git merge feature/member-1-lms-vocab
git push origin main`),

          // CHƯƠNG 2
          h1('CHƯƠNG 2: KIẾN TRÚC KỸ THUẬT & VAI TRÒ CỦA 4 CSDL NOSQL'),
          p(
            'Điểm nhấn học thuật lớn nhất của đồ án là việc giải quyết bài toán lưu trữ đa mô hình (Polyglot Persistence). Thay vì ép buộc một cơ sở dữ liệu quan hệ truyền thống (RDBMS) gánh vác mọi loại dữ liệu, hệ thống chia sẻ tải trọng hợp lý cho 4 CSDL NoSQL chuyên dụng:'
          ),

          h2('2.1. MongoDB (Document-Oriented Database) - Thực thể Nghiệp vụ Phức hợp'),
          p('• Vai trò kiến trúc: Đóng vai trò là CSDL nghiệp vụ cốt lõi (Core Business Store).'),
          p('• Lý do lựa chọn: MongoDB lưu trữ dưới định dạng BSON (JSON nhị phân), cực kỳ lý tưởng cho các thực thể có cấu trúc phân cấp phức tạp, tài liệu lồng nhau (Embedded Sub-documents) và mảng dữ liệu biến đổi linh hoạt.'),
          p('• Các thực thể và Collections chính:'),
          p('  + `users`: Lưu trữ thông tin tài khoản, mật khẩu đã hash bcrypt, vai trò (role: student, teacher, admin), hồ sơ cá nhân và kho đồ quà tặng (inventory).'),
          p('  + `courses`: Lưu trữ thông tin khóa học, danh mục, giá tiền, mảng bài giảng `lessons: [{ title, videoUrl, duration, resources }]`.'),
          p('  + `exams`: Ngân hàng đề thi trắc nghiệm, danh sách câu hỏi đa lựa chọn, đáp án đúng và giải thích chi tiết.'),
          p('  + `custom_flashcards`: Kho thẻ từ vựng cá nhân của từng học viên.'),
          p('  + `reviews` & `discussions`: Nhận xét đánh giá sao và diễn đàn hỏi đáp theo từng bài học.'),

          h2('2.2. Redis (In-Memory Data Structure Store) - Tốc độ Cao & Thời gian Thực'),
          p('• Vai trò kiến trúc: Bộ nhớ đệm (Cache), Quản lý phiên đăng nhập (Session Store), Bộ đếm thời gian thực và Cấu trúc dữ liệu nâng cao.'),
          p('• Lý do lựa chọn: Redis hoạt động hoàn toàn trên RAM với độ trễ siêu thấp (< 1 mili-giây), hỗ trợ cơ chế tự hủy dữ liệu theo thời gian (Time-To-Live - TTL) và các cấu trúc dữ liệu nguyên tử (Atomic Operations).'),
          p('• Ứng dụng thực tế trong đồ án:'),
          p('  + String có TTL: Quản lý mã OTP đăng ký và quên mật khẩu (`SETEX otp:email 300 849201` - hết hạn tự hủy sau 5 phút). Lưu trữ nháp bài viết Writing (`draft:writing:userId`).'),
          p('  + Atomic Counter (INCR): Hệ thống Giám sát thi Anti-cheat (`INCR exam:anti-cheat:userId:examId`). Khi số lần vi phạm chạm ngưỡng 3/3, hệ thống lập tức khóa bài thi và thu hồi quyền làm bài.'),
          p('  + Redis Bitmap: Theo dõi chuỗi ngày học liên tục (Study Streak). Mỗi ngày học viên vào học, hệ thống set bit tương ứng (`SETBIT streak:userId dayOfYear 1`). Cho phép tính chuỗi học cực nhanh với bộ nhớ chỉ vài bytes.'),
          p('  + Sorted Set (ZSET): Bảng xếp hạng Đấu trường từ vựng 60s (Word Arena) và Bảng xếp hạng Song đấu phát âm 1v1 theo điểm số thực tế.'),

          h2('2.3. Apache Cassandra (Wide-Column Store) - Dữ liệu Chuỗi Thời Gian Khối Lượng Lớn'),
          p('• Vai trò kiến trúc: Lưu trữ dữ liệu ghi cực lớn (Write-intensive), nhật ký sự kiện theo chuỗi thời gian (Time-series Logs) và lịch sử hoạt động học tập.'),
          p('• Lý do lựa chọn: Cassandra sở hữu kiến trúc ngang hàng (Peer-to-Peer Masterless), không có điểm chết đơn lẻ (No Single Point of Failure), tốc độ ghi cực kỳ nhanh (nhờ kiến trúc LSM-Tree và CommitLog). Rất phù hợp cho telemetry giáo dục với hàng triệu lượt tương tác video mỗi ngày.'),
          p('• Ứng dụng thực tế trong đồ án:'),
          p('  + Bảng `video_playback_events`: Ghi nhận nhật ký phát video từng giây của học viên (sự kiện: play, pause, seek, complete, playback_speed) kèm timestamp UUID v1 để thống kê độ tập trung.'),
          p('  + Bảng `exam_attempt_logs`: Lưu vết từng lần nộp bài thi, số điểm, thời gian làm bài.'),
          p('  + Bảng `learning_activity_telemetry`: Phục vụ thuật toán chẩn đoán lỗ hổng kiến thức (Weakness Diagnostic) và vẽ Biểu đồ nhiệt hoạt động học tập (Heatmap tương tự GitHub).'),

          h2('2.4. Neo4j (Graph Database) - Bản đồ Tri thức & Mối quan hệ Mạng lưới'),
          p('• Vai trò kiến trúc: Cơ sở dữ liệu đồ thị quản lý Bản đồ tri thức (Knowledge Graph), Cây kỹ năng học thuật (Skill Tree) và Mạng lưới ngữ nghĩa.'),
          p('• Lý do lựa chọn: Neo4j sử dụng mô hình Property Graph (Đỉnh Nodes - Cạnh Relationships) và ngôn ngữ Cypher trực quan. Khác với SQL phải JOIN nhiều bảng tốn kém chi phí tính toán O(N), Neo4j sử dụng con trỏ bộ nhớ (Index-free Adjacency) với chi phí duyệt đồ thị O(1), tối ưu cho bài toán tìm đường đi ngắn nhất.'),
          p('• Ứng dụng thực tế trong đồ án:'),
          p('  + Cây kỹ năng học thuật (Skill Tree): Các đỉnh `(Skill {name, cefrLevel})` liên kết qua quan hệ `[:REQUIRES]`. Thuật toán Cypher kiểm tra điều kiện tiên quyết trước khi mở khóa kỹ năng cao hơn (A1 ➔ C2).'),
          p('  + Lộ trình học thích ứng (Adaptive Learning Roadmap): Tìm đường đi học tập tối ưu từ trình độ hiện tại đến mục tiêu mong muốn bằng thuật toán đồ thị ngắn nhất.'),
          p('  + Sơ đồ mạng nhện cụm từ (Collocation Mindmap): Trực quan hóa các mối quan hệ giữa từ vựng học thuật `(Word)-[:COLLOCATES_WITH]->(Word)`.'),

          h2('2.5. Bảng Tổng hợp Ranh giới Nghiệp vụ 4 CSDL NoSQL'),
          createTable(
            ['Cơ sở dữ liệu', 'Mô hình dữ liệu', 'Điểm mạnh kỹ thuật', 'Nghiệp vụ đảm nhiệm trong dự án'],
            [
              ['MongoDB', 'Document Store (JSON/BSON)', 'Lược đồ linh hoạt, nested documents, aggregation pipeline mạnh mẽ', 'Khóa học, Bài học, Đề thi trắc nghiệm, Tài khoản người dùng, Đánh giá & Thảo luận.'],
              ['Redis', 'In-Memory Key-Value & Data Structures', 'Độ trễ < 1ms, cấu trúc dữ liệu phong phú (String, Hash, Bitmap, ZSet)', 'Xác thực OTP (TTL), Chống gian lận thi cử Anti-cheat, Chuỗi học Streak Bitmap, Bảng xếp hạng tuần, Auto-save nháp bài viết.'],
              ['Apache Cassandra', 'Wide-Column Store', 'Tốc độ ghi siêu cao, chịu lỗi phân tán, tối ưu cho Time-series data', 'Telemetry xem video (seek, pause, speed), Lịch sử chi tiết bài thi, Chẩn đoán lỗ hổng kiến thức, Heatmap hoạt động.'],
              ['Neo4j', 'Property Graph Database', 'Index-free adjacency, ngôn ngữ Cypher trực quan, duyệt mạng lưới đồ thị', 'Bản đồ tri thức (Knowledge Graph), Cây kỹ năng CEFR, Sơ đồ Collocation Mindmap, Gợi ý lộ trình thích ứng (Adaptive Roadmap).']
            ],
            [18, 22, 30, 30]
          ),

          // CHƯƠNG 3
          h1('CHƯƠNG 3: HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY HỆ THỐNG TOÀN DIỆN'),
          h2('3.1. Yêu cầu Môi trường Phần mềm (Prerequisites)'),
          p('Trước khi chạy dự án, máy tính phát triển cần cài đặt sẵn:'),
          p('1. Node.js: Phiên bản LTS v18.x hoặc v20.x trở lên (đã đi kèm npm).'),
          p('2. Git: Công cụ quản lý mã nguồn dòng lệnh.'),
          p('3. 4 Hệ quản trị CSDL NoSQL (Chạy trực tiếp trên Windows hoặc qua Docker):'),
          p('   • MongoDB: Port mặc định `27017`'),
          p('   • Redis Server: Port mặc định `6379`'),
          p('   • Apache Cassandra: Port mặc định `9042`'),
          p('   • Neo4j Desktop / Community: Port HTTP `7474`, Port Bolt `7687` (Mật khẩu: `nosql_project_2026`)'),

          h2('3.2. Hướng dẫn Từng bước Cài đặt & Khởi động'),
          p('Thực hiện tuần tự 6 bước chuẩn sau trong cửa sổ PowerShell hoặc Terminal:'),

          codeBlock(`# BƯỚC 1: Clone mã nguồn từ GitHub về thư mục làm việc
git clone https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git
cd DoAn_NoSQL_Elearning

# BƯỚC 2: Cài đặt toàn bộ các thư viện phụ thuộc (Dependencies)
npm install

# BƯỚC 3: Kiểm tra tệp cấu hình môi trường .env
# Tệp .env đã được cấu hình sẵn các cổng mặc định:
# PORT=5050
# MONGO_URI=mongodb://127.0.0.1:27017/elearning_nosql
# REDIS_HOST=127.0.0.1, REDIS_PORT=6379
# NEO4J_URI=bolt://127.0.0.1:7687 (User: neo4j, Pass: nosql_project_2026)
# CASSANDRA_CONTACT_POINTS=127.0.0.1, KEYSPACE=elearning_logs

# BƯỚC 4: Nạp dữ liệu mẫu ban đầu (Database Seeding) cho cả 4 CSDL
npm run seed:all
# (Hoặc chạy lệnh: node scripts/seed_all_4_nosql.js)

# BƯỚC 5: Chạy kịch bản kiểm thử tự động để đảm bảo 4 CSDL đều xanh
npm test
# (Hoặc chạy lệnh: node scripts/automated_tests.js)

# BƯỚC 6: Khởi động máy chủ E-Learning Backend
npm start
# (Máy chủ sẽ khởi chạy thành công tại địa chỉ: http://localhost:5050)`),

          h2('3.3. Danh sách Tài khoản Mẫu Đăng nhập Thử nghiệm (Demo Accounts)'),
          p('Hệ thống đã nạp sẵn 3 tài khoản tương ứng với 3 vai trò (Roles) trong CSDL MongoDB để phục vụ kiểm thử và thuyết trình:'),
          createTable(
            ['Vai trò (Role)', 'Email đăng nhập', 'Mật khẩu mặc định', 'Quyền hạn trên hệ thống'],
            [
              ['Học viên (Student)', 'student@edupro.vn', '123456', 'Xem khóa học, làm bài thi, lưu nháp writing, học từ vựng, đổi quà XP.'],
              ['Giảng viên (Teacher)', 'teacher@edupro.vn', '123456', 'Xem tiến độ học viên, tạo/sửa đề thi, kiểm duyệt bình luận thảo luận.'],
              ['Quản trị viên (Admin)', 'admin@edupro.vn', '123456', 'Toàn quyền CMS: Kiểm tra 4 CSDL, CRUD Khóa học, CRUD Câu hỏi, Phân quyền User, Xuất CSV.']
            ],
            [22, 28, 20, 30]
          ),
          p('Gợi ý: Tại giao diện đăng nhập web có sẵn các nút bấm "Tài khoản Student", "Tài khoản Teacher", "Tài khoản Admin" giúp đăng nhập nhanh 1-click mà không cần gõ phím.', { italics: true }),

          // CHƯƠNG 4
          h1('CHƯƠNG 4: BẢNG ĐẶC TẢ CHI TIẾT CÔNG VIỆC PHÂN CHIA CHO 2 THÀNH VIÊN'),
          p(
            'Để đảm bảo tính chuyên nghiệp và công bằng, toàn bộ khối lượng công việc còn thiếu được chia thành 2 phần cân xứng (mỗi thành viên đảm nhiệm 10 Tasks) với đầy đủ đặc tả kỹ thuật, ràng buộc biên và kịch bản nghiệm thu:'
          ),

          h2('4.1. Nhiệm vụ của THÀNH VIÊN 1: Phân hệ Học tập, Từ vựng & AI Lab'),
          p('Thành viên 1 chịu trách nhiệm về toàn bộ hành trình tiếp thu kiến thức và luyện tập kỹ năng của người học:'),

          createTable(
            ['Mã Task', 'Tên chức năng', 'Phân loại', 'File can thiệp', 'Tóm tắt kỹ thuật & Nghiệm thu'],
            [
              ['Task 1.1', 'Chỉnh sửa Hồ sơ cá nhân (Edit Profile)', '[BỔ SUNG MỚI]', 'authRoutes.js\nindex.html', 'PUT /api/auth/profile. Cập nhật fullName, phone, school, targetBand trong MongoDB users. Có modal nhập liệu và validate phone regex.'],
              ['Task 1.2', 'Đổi mật khẩu trực tiếp (Change Password)', '[BỔ SUNG MỚI]', 'authRoutes.js\nindex.html', 'POST /api/auth/change-password. Xác thực mật khẩu cũ bằng bcrypt, validate mật khẩu mới >= 6 ký tự, hash và lưu vào MongoDB.'],
              ['Task 1.3', 'Tiến độ khóa học động (Progress Tracker)', '[BỔ SUNG MỚI]', 'courseRoutes.js\nindex.html', 'POST /:id/lessons/:idx/toggle-complete. Lưu mảng completedLessons vào MongoDB và cache % tiến độ trên Redis. Hiển thị thanh progress bar trên card khóa học.'],
              ['Task 1.4', 'Tài liệu đính kèm bài giảng (Handouts)', '[BỔ SUNG MỚI]', 'courseRoutes.js\nindex.html', 'Bổ sung mảng resources: [{title, type, url, size}] vào bài học trong MongoDB. Thêm Tab Tài liệu trong Classroom cho phép tải file PDF/Audio.'],
              ['Task 1.5', 'Hủy đăng ký / Lưu trữ khóa học (Unenroll)', '[BỔ SUNG MỚI]', 'courseRoutes.js\nindex.html', 'DELETE /api/courses/:id/enroll. Xóa học viên khỏi danh sách đăng ký MongoDB và dọn sạch Redis cache. Nút hủy có popup xác nhận.'],
              ['Task 1.6', 'Modal Tạo Thẻ từ vựng cá nhân', '[BỔ SUNG MỚI]', 'courseRoutes.js\nindex.html', 'Hoàn thiện POST /flashcards/custom. Thêm nút "+ Thêm từ mới" và Modal nhập từ, IPA, nghĩa, ví dụ. Thẻ mới tạo hiện ngay lên đầu danh sách.'],
              ['Task 1.7', 'Chế độ Nghe từ vựng rảnh tay (Autoplay)', '[BỔ SUNG MỚI]', 'index.html', 'Nút "Autoplay" đọc tiếng Anh qua SpeechSynthesis ➔ nghỉ 1.5s ➔ đọc nghĩa tiếng Việt ➔ lật thẻ 3D ➔ tự chuyển sang thẻ kế tiếp.'],
              ['Task 1.8', 'Xuất kho từ vựng ra file CSV / Excel', '[BỔ SUNG MỚI]', 'courseRoutes.js\nindex.html', 'GET /flashcards/export. Trả về file CSV có gắn UTF-8 BOM chống lỗi font tiếng Việt khi mở bằng Excel, tải file EduPro_Vocabulary.csv về máy.'],
              ['Task 1.9', 'Tự động lưu nháp Writing (Draft Autosave)', '[BỔ SUNG MỚI]', 'examRoutes.js\nindex.html', 'POST & GET /writing/draft. Lưu bài viết vào Redis key draft:writing:userId với TTL 24h. Bắt sự kiện gõ phím debounce 2s, có nút Khôi phục nháp.'],
              ['Task 1.10', 'IELTS Writing Task 1 (Mô tả biểu đồ)', '[BỔ SUNG MỚI]', 'examRoutes.js\nindex.html', 'Nâng cấp POST /writing/evaluate hỗ trợ taskType: task1 (chuẩn 150 từ, tiêu chí Task Achievement). Bổ sung hình ảnh biểu đồ mẫu và tab chuyển đổi.']
            ],
            [12, 22, 16, 20, 30]
          ),

          h2('4.2. Nhiệm vụ của THÀNH VIÊN 2: Phân hệ Thi cử, Gamification & Quản trị CMS'),
          p('Thành viên 2 chịu trách nhiệm về quy trình khảo sát năng lực, chống gian lận, cửa hàng quà tặng và cổng quản trị CMS:'),

          createTable(
            ['Mã Task', 'Tên chức năng', 'Phân loại', 'File can thiệp', 'Tóm tắt kỹ thuật & Nghiệm thu'],
            [
              ['Task 2.1', 'Làm lại đề thi (Retake Exam) & Reset Anti-cheat', '[BỔ SUNG MỚI]', 'examRoutes.js\nindex.html', 'POST /exams/:id/retake. Xóa key vi phạm trên Redis DEL exam:anti-cheat:userId:examId về 0/3, reset đồng hồ đếm ngược và tạo attempt thi mới sạch sẽ.'],
              ['Task 2.2', 'Xem lại chi tiết bài làm cũ (Exam Review Modal)', '[BỔ SUNG MỚI]', 'examRoutes.js\nindex.html', 'GET /submissions/:id/review. Modal hiển thị lại đề thi: câu đúng viền xanh, câu sai viền đỏ, hiển thị đáp án học viên chọn vs đáp án đúng kèm lời giải thích.'],
              ['Task 2.3', 'Cửa hàng đổi quà điểm thưởng XP (Reward Store)', '[BỔ SUNG MỚI]', 'courseRoutes.js\nindex.html', 'Seed collection reward_items (Streak Freeze 500 XP, Khung Avatar 300 XP). POST /redeem trừ XP và lưu vật phẩm vào inventory của user.'],
              ['Task 2.4', 'Nghiệp vụ Bảo lưu chuỗi học (Streak Freeze)', '[BỔ SUNG MỚI]', 'courseRoutes.js', 'Nếu bỏ lỡ 1 ngày học, kiểm tra inventory nếu có thẻ Streak Freeze thì tự động tiêu thụ 1 thẻ để giữ nguyên chuỗi Streak trên Redis Bitmap không bị về 0.'],
              ['Task 2.5', 'Quản trị Vòng đời Khóa học (CRUD đầy đủ)', '[BỔ SUNG MỚI]', 'courseRoutes.js\nindex.html', 'PUT & DELETE /api/courses/:id. Bổ sung bảng quản lý khóa học trong CMS với 2 nút [✏️ Sửa] và [🗑️ Xóa] (chỉ dành cho tài khoản Admin/Teacher).'],
              ['Task 2.6', 'Quản trị Ngân hàng Câu hỏi đề thi (Sửa/Xóa)', '[BỔ SUNG MỚI]', 'examRoutes.js\nindex.html', 'PUT & DELETE /api/exams/questions/:id. Bổ sung giao diện quản lý câu hỏi trong CMS, cho phép sửa nội dung câu hỏi, 4 phương án và đáp án đúng.'],
              ['Task 2.7', 'Tra cứu & Xác thực Chứng chỉ công khai', '[BỔ SUNG MỚI]', 'examRoutes.js\nindex.html', 'GET /certificates/verify/:certId (API công khai không cần token). Tra cứu thông tin thí sinh, điểm số, ngày cấp và mã băm SHA-256 chống giả mạo.'],
              ['Task 2.8', 'Cờ đánh dấu câu hỏi xem lại (Flag for Review)', '[BỔ SUNG MỚI]', 'index.html', 'Thêm nút cờ 🚩 dưới mỗi câu hỏi thi. Nút câu hỏi trên bảng điều hướng đổi sang màu cam. Cảnh báo trước khi nộp bài nếu còn câu đặt cờ chưa rà soát.'],
              ['Task 2.9', 'Phân trang & Lọc bảng Lịch sử Khảo sát', '[HOÀN THIỆN]', 'examRoutes.js\nindex.html', 'Cập nhật GET /results/my-history hỗ trợ phân trang ?page=1&limit=5 và lọc theo thể loại đề thi (Placement/TOEIC/IELTS), tránh tải dồn dập dữ liệu Cassandra.'],
              ['Task 2.10', 'Kiểm duyệt bình luận vi phạm (Moderation)', '[BỔ SUNG MỚI]', 'courseRoutes.js\nindex.html', 'DELETE /discussions/:id và DELETE /reviews/:id. Hiển thị icon thùng rác nhỏ màu đỏ cho tài khoản Admin/Teacher để xóa trực tiếp bình luận vi phạm.']
            ],
            [12, 22, 16, 20, 30]
          ),

          // CHƯƠNG 5
          h1('CHƯƠNG 5: KỊCH BẢN THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN TRƯỚC HỘI ĐỒNG'),
          h2('5.1. Phân chia Thời lượng Thuyết trình (Khung giờ chuẩn: 20 phút)'),
          p('• Phút 01 - 03 (Trưởng nhóm): Giới thiệu đề tài, lý do lựa chọn bài toán E-Learning và tổng quan kiến trúc 4 CSDL NoSQL.'),
          p('• Phút 04 - 08 (Thành viên 1): Trình bày và Demo trực tiếp phân hệ Học tập LMS, Kho thẻ từ vựng Spaced Repetition và Phòng luyện viết AI (MongoDB & Redis).'),
          p('• Phút 09 - 13 (Thành viên 2): Trình bày và Demo trực tiếp Phòng thi trắc nghiệm, Cơ chế Anti-cheat giám sát chuyển tab 3/3, Cửa hàng đổi quà XP và Cổng CMS quản trị (Redis, Cassandra & MongoDB).'),
          p('• Phút 14 - 17 (Trưởng nhóm): Trình bày và Demo Bản đồ tri thức Knowledge Graph, Cây kỹ năng và Lộ trình thích ứng Adaptive Roadmap (Neo4j).'),
          p('• Phút 18 - 20 (Cả nhóm): Trả lời câu hỏi vấn đáp trực tiếp từ Hội đồng Giảng viên chấm thi.'),

          h2('5.2. Kịch bản Demo Live 5 Bước Gây Ấn Tượng Nhất'),
          p('1. Demo Anti-Cheat 3/3 Vi Phạm: Bắt đầu bài thi TOEIC ➔ Chuyển tab trình duyệt lần 1 (Cảnh báo vàng 1/3) ➔ Chuyển tab lần 2 (Cảnh báo cam 2/3) ➔ Chuyển tab lần 3 (Lập tức khóa bài, modal đỏ hiện lên "ĐÌNH CHỈ THI - BÀI THI BỊ THU HỒI", nộp 0 điểm). Sau đó bấm "Làm lại đề thi" để thấy cơ chế reset sạch sẽ trên Redis.'),
          p('2. Demo AI Writing & Autosave: Chọn bài thi Writing Task 2 ➔ Bấm nút "Chèn bài mẫu Band 8.0" ➔ Tắt tab hoặc reload trang để chứng minh bản nháp được Redis phục hồi 100% ➔ Bấm "Chấm Điểm Bài Viết" để thấy AI phân tích 4 tiêu chí chuẩn IELTS.'),
          p('3. Demo Telemetry Video Cassandra: Vào bài học số 1 ➔ Kéo thanh thời gian video tua đi tua lại ➔ Mở trang Giám sát Cassandra để xem các bản ghi chuỗi thời gian (seek, pause, playback_speed) được ghi nhận tức thời với timestamp chuẩn xác.'),
          p('4. Demo Bản Đồ Tri Thức & Cây Kỹ Năng Neo4j: Vào mục Bản đồ tri thức ➔ Bấm "Lộ trình IELTS 7.5+ C1" ➔ Mạng lưới đồ thị Neo4j co giãn mượt mà, hiển thị rõ các quan hệ tiên quyết `[:REQUIRES]` giữa các chủ đề.'),
          p('5. Demo Cửa Hàng Đổi Quà XP & Bảo Lưu Chuỗi Streak: Đổi quà Thẻ bảo lưu chuỗi học 500 XP ➔ Trừ điểm XP ngay trên thanh Header ➔ Giải thích cơ chế Redis Bitmap chống đứt chuỗi.'),

          h2('5.3. Bộ Câu Hỏi Vấn Đáp Tiềm Năng & Câu Trả Lời Mẫu Đạt Điểm 10'),
          p(
            '❓ Câu 1: Tại sao nhóm lại sử dụng tới 4 CSDL NoSQL thay vì dùng 1 hệ CSDL quan hệ như PostgreSQL hay MySQL?',
            { bold: true, color: COLOR_PRIMARY }
          ),
          p(
            '👉 Trả lời: Mỗi hệ CSDL NoSQL sinh ra để tối ưu cho một cấu trúc dữ liệu và mô hình truy vấn khác nhau theo định lý CAP. Trong hệ thống EduPro: MongoDB xử lý hoàn hảo dữ liệu dạng tài liệu lồng nhau phức tạp của khóa học và đề thi; Redis cung cấp tốc độ phản hồi micro-giây cho Anti-cheat và session; Cassandra chịu tải ghi hàng triệu log telemetry video chuỗi thời gian mà không nghẽn cổ chai; còn Neo4j giải quyết bài toán duyệt đồ thị tri thức O(1) mà SQL JOIN nhiều bảng sẽ bị suy giảm hiệu năng nghiêm trọng.'
          ),

          p(
            '❓ Câu 2: Cơ chế Anti-cheat hoạt động như thế nào và tại sao lại dùng Redis thay vì MongoDB?',
            { bold: true, color: COLOR_PRIMARY }
          ),
          p(
            '👉 Trả lời: Sự kiện chuyển tab xảy ra rất nhanh và liên tục. Nếu mỗi lần chuyển tab đều gọi câu lệnh UPDATE vào MongoDB trên ổ đĩa sẽ gây quá tải I/O. Nhóm sử dụng lệnh nguyên tử `INCR` của Redis hoạt động hoàn toàn trên RAM, đảm bảo đếm số lần vi phạm chính xác tuyệt đối ngay cả khi mạng lag, đồng thời thiết lập ràng buộc chặn cứng ở mức tối đa 3 lần.'
          ),

          p(
            '❓ Câu 3: Thuật toán gợi ý lộ trình thích ứng trên Neo4j hoạt động ra sao?',
            { bold: true, color: COLOR_PRIMARY }
          ),
          p(
            '👉 Trả lời: Nhóm mô hình hóa các bài học và kỹ năng thành các đỉnh `(:Topic)` và `(:Skill)` kết nối qua mối quan hệ có trọng số `[:PREREQUISITE {weight: ...}]`. Khi học viên chọn mục tiêu đầu ra (ví dụ IELTS 7.5 C1), câu truy vấn Cypher sử dụng thuật toán Shortest Path (Dijkstra) để tìm chuỗi bài học ngắn nhất mà học viên bắt buộc phải hoàn thành, loại bỏ các bài học dư thừa.'
          ),

          calloutBox(
            'Chúc Nhóm 18 Hoàn Thành Xuất Sắc Đồ Án!',
            'Tài liệu này là cẩm nang hướng dẫn đầy đủ nhất từ thiết kế kiến trúc, mã nguồn GitHub, cách chạy hệ thống đến phân công công việc chi tiết. Hãy bám sát kế hoạch phân công để đạt kết quả bảo vệ đồ án cao nhất!',
            true
          )
        ]
      }
    ]
  });

  const outputPath = path.join(__dirname, '..', 'HUONG_DAN_DU_AN_VA_PHAN_CONG_CONG_VIEC_NOSQL.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  console.log(`\n================================================================`);
  console.log(`✅ DA XUAT FILE WORD THANH CONG TAI:`);
  console.log(`👉 ${outputPath}`);
  console.log(`================================================================\n`);
}

buildWordDocument().catch(err => {
  console.error('Loi khi tao file Word:', err);
});
