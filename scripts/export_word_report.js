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

console.log('--- BAT DAU TAO TAI LIEU WORD BAO CAO DO AN (HUIT FORMAT) ---');

// Dinh nghia mau sac & font chu tieu chuan
const FONT_NAME = 'Times New Roman';
const COLOR_PRIMARY = '1F497D'; // Xanh navy dam HUIT
const COLOR_SECONDARY = '595959'; // Xam
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
        color: '2E75B6'
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
        color: '1F497D'
      })
    ]
  });
}

function codeBlock(codeText) {
  const lines = codeText.split('\n');
  return lines.map(line =>
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 240, before: 20, after: 20 },
      children: [
        new TextRun({
          text: line,
          font: 'Consolas',
          size: 20, // 10pt
          color: '0F172A'
        })
      ]
    })
  );
}

function createTable(headers, rows) {
  const tableRows = [];

  // Header Row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map(
        h =>
          new TableCell({
            width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
            shading: { fill: '1F497D' },
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
          })
      )
    })
  );

  // Data Rows
  rows.forEach((row, rIdx) => {
    tableRows.push(
      new TableRow({
        children: row.map(
          cell =>
            new TableCell({
              width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
              shading: { fill: rIdx % 2 === 1 ? 'F2F4F7' : 'FFFFFF' },
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
            })
        )
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

async function generateDocx() {
  const doc = new Document({
    creator: 'Nhom 18 - 14DH HUIT',
    title: 'Báo Cáo Đồ Án Môn Dữ Liệu NoSQL - Nền Tảng E-Learning & Luyện Thi',
    description: 'Báo cáo kỹ thuật chi tiết hoàn chỉnh theo mẫu chuẩn Đại học Công Thương TP.HCM',
    styles: {
      default: {
        document: {
          run: {
            font: FONT_NAME,
            size: 26,
            color: '000000'
          },
          paragraph: {
            spacing: { line: 360, before: 120, after: 120 }
          }
        }
      }
    },
    sections: [
      // ==========================================
      // TRANG BÌA (COVER PAGE)
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1700, right: 1440 } // 2.5cm, 2.5cm, 3cm, 2.5cm
          }
        },
        children: [
          p('BỘ CÔNG THƯƠNG', { alignment: AlignmentType.CENTER, bold: true, size: 28, before: 0, after: 60 }),
          p('TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH', { alignment: AlignmentType.CENTER, bold: true, size: 28, before: 0, after: 60, color: COLOR_PRIMARY }),
          p('KHOA CÔNG NGHỆ THÔNG TIN', { alignment: AlignmentType.CENTER, bold: true, size: 26, before: 0, after: 120 }),
          p('----------------------------------------------------', { alignment: AlignmentType.CENTER, size: 20, color: COLOR_SECONDARY, before: 0, after: 360 }),

          p('', { before: 300, after: 300 }),

          p('BÁO CÁO ĐỒ ÁN MÔN HỌC', { alignment: AlignmentType.CENTER, bold: true, size: 36, color: 'C00000', before: 120, after: 120 }),
          p('HỌC PHẦN: DỮ LIỆU NOSQL (MÃ HP: 01201073)', { alignment: AlignmentType.CENTER, bold: true, size: 28, color: COLOR_PRIMARY, before: 60, after: 360 }),

          p('', { before: 200, after: 200 }),

          p('ĐỀ TÀI:', { alignment: AlignmentType.CENTER, bold: true, size: 28, before: 60, after: 60 }),
          p('XÂY DỰNG NỀN TẢNG HỌC TRỰC TUYẾN VÀ ĐÁNH GIÁ NĂNG LỰC TOÀN DIỆN VỚI 4 HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU NOSQL', {
            alignment: AlignmentType.CENTER,
            bold: true,
            size: 32,
            color: COLOR_PRIMARY,
            before: 60,
            after: 120
          }),
          p('(EDUPRO ACADEMY - MULTI-MODEL NOSQL PLATFORM)', { alignment: AlignmentType.CENTER, italics: true, bold: true, size: 24, color: '595959', before: 0, after: 600 }),

          p('', { before: 400, after: 400 }),

          new Table({
            width: { size: 90, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      p('GIẢNG VIÊN HƯỚNG DẪN:', { bold: true, size: 26, color: COLOR_PRIMARY }),
                      p('TS. NGUYỄN THỊ ĐỊNH', { bold: true, size: 26 }),
                      p('Bộ môn Hệ thống thông tin', { italics: true, size: 24 }),
                      p('Khoa Công nghệ thông tin', { italics: true, size: 24 })
                    ]
                  }),
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      p('SINH VIÊN THỰC HIỆN:', { bold: true, size: 26, color: COLOR_PRIMARY }),
                      p('1. Nguyễn Trọng Nguyên  - MSSV: 2001230589 (Trưởng nhóm)', { bold: true, size: 24 }),
                      p('2. Phạm Nguyễn Khôi Nguyên - MSSV: 2001230578', { size: 24 }),
                      p('3. Võ Huỳnh Gia Huy       - MSSV: 2001230303', { size: 24 }),
                      p('LỚP SINH VIÊN: 14DHTH06 (Khóa 14 ĐH)', { bold: true, size: 24 })
                    ]
                  })
                ]
              })
            ]
          }),

          p('', { before: 800, after: 800 }),
          p('TP. HỒ CHÍ MINH - NĂM 2026', { alignment: AlignmentType.CENTER, bold: true, size: 26, before: 300, after: 0 })
        ]
      },

      // ==========================================
      // PHẦN THÂN BÁO CÁO (NỘI DUNG CHÍNH)
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1700, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Học phần Dữ liệu NoSQL (HUIT) - Đồ án E-learning EduPro Academy',
                    font: FONT_NAME,
                    size: 18,
                    italics: true,
                    color: '888888'
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
                    color: '555555'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_NAME,
                    size: 20,
                    bold: true
                  })
                ]
              })
            ]
          })
        },
        children: [
          // LỜI CẢM ƠN
          h1('LỜI CẢM ƠN'),
          p(
            'Lời đầu tiên, nhóm sinh viên thực hiện đề tài xin gửi lời tri ân sâu sắc nhất tới Ban Giám hiệu Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT), Ban Chủ nhiệm Khoa Công nghệ Thông tin đã tạo điều kiện học tập và môi trường nghiên cứu thực hành công nghệ hiện đại.'
          ),
          p(
            'Đặc biệt, nhóm chúng em xin gửi lời cảm ơn chân thành và sâu sắc nhất tới TS. Nguyễn Thị Định – giảng viên trực tiếp hướng dẫn học phần Dữ liệu NoSQL. Cô đã tận tình truyền đạt cho chúng em những nền tảng kiến thức quý báu về các mô hình cơ sở dữ liệu phi quan hệ, phương pháp tư duy mô hình hóa dữ liệu quy mô lớn và định hướng thiết kế kiến trúc phân tán. Những góp ý chuyên môn sát sao của Cô chính là kim chỉ nam giúp nhóm hoàn thiện đồ án này một cách toàn diện và đáp ứng tiêu chuẩn phần mềm thương mại thực chiến.'
          ),
          p(
            'Mặc dù đã rất nỗ lực, đề tài khó tránh khỏi những thiếu sót nhất định. Nhóm kính mong tiếp tục nhận được những ý kiến đóng góp quý báu từ Cô và Hội đồng để sản phẩm ngày càng hoàn thiện hơn nữa.'
          ),
          p('Nhóm sinh viên thực hiện xin chân thành cảm ơn!', { italics: true, alignment: AlignmentType.RIGHT }),

          // MỤC LỤC TÓM TẮT
          h1('MỤC LỤC TỔNG QUAN'),
          p('CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI & CƠ SỞ KHOA HỌC 4 CSDL NOSQL .................... Trang 4'),
          p('CHƯƠNG 2: PHÂN TÍCH YÊU CẦU & THIẾT KẾ MÔ HÌNH DỮ LIỆU ...................... Trang 9'),
          p('CHƯƠNG 3: CÀI ĐẶT & HIỆN THỰC HÓA HỆ THỐNG EDUPRO ACADEMY ............ Trang 18'),
          p('CHƯƠNG 4: CÁC TÍNH NĂNG NÂNG CAO & KIẾN TRÚC THƯƠNG MẠI .................. Trang 28'),
          p('CHƯƠNG 5: KIỂM THỬ TOÀN DIỆN, HIỆU NĂNG & SAO LƯU PHỤC HỒI ............ Trang 38'),
          p('CHƯƠNG 6: KẾT LUẬN & HƯỚNG PHÁT TRIỂN ..................................................... Trang 46'),

          // CHƯƠNG 1
          h1('CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI & CƠ SỞ KHOA HỌC 4 CSDL NOSQL'),
          h2('1.1. Đặt vấn đề và tính cấp thiết của đề tài'),
          p(
            'Trong kỷ nguyên chuyển đổi số và bùng nổ của EdTech (Công nghệ giáo dục), các hệ thống đào tạo trực tuyến quy mô lớn (như Coursera, Udemy, edX) phải xử lý đồng thời hàng triệu người dùng truy cập. Các hệ quản trị cơ sở dữ liệu quan hệ truyền thống (RDBMS) bộc lộ nhiều điểm nghẽn nghiêm trọng khi đối mặt với dữ liệu phi cấu trúc, tải đọc/ghi dồn dập (Write Heavy) và các bài toán phân tích mạng lưới kết nối phức tạp.'
          ),
          p(
            'Đề tài "Xây dựng nền tảng học trực tuyến và đánh giá năng lực toàn diện với 4 hệ quản trị cơ sở dữ liệu NoSQL" ra đời nhằm giải quyết triệt để bài toán kiến trúc phân tán, áp dụng phương pháp Multi-model NoSQL: mỗi loại dữ liệu sẽ được lưu trữ trên đúng hệ quản trị có thế mạnh tối ưu nhất.'
          ),

          h2('1.2. Phân chia vai trò và lý do lựa chọn 4 CSDL NoSQL'),
          p(
            'Hệ thống kết hợp chặt chẽ 4 mô hình NoSQL cốt lõi mà không có sự chồng chéo về mặt nghiệp vụ:'
          ),

          createTable(
            ['Hệ CSDL', 'Mô hình NoSQL', 'Trọng trách nghiệp vụ', 'Lý do kỹ thuật lựa chọn'],
            [
              [
                'MongoDB',
                'Document Store (BSON/JSON)',
                'Quản lý Người dùng (Users), Danh mục khóa học (Courses), Bài học (Lessons), Ngân hàng câu hỏi (Questions), Kỳ thi (Exams) & Kết quả chính thức (Results).',
                'Lược đồ động linh hoạt (Schema-less), hỗ trợ Document lồng nhau (Embedded Array) giúp hạn chế tối đa JOIN, tốc độ đọc tài liệu cao và hỗ trợ Text Search toàn văn.'
              ],
              [
                'Redis',
                'Key-Value (In-Memory)',
                'Quản lý phiên làm bài thi (Attempt Session) với TTL 30 phút, bộ nhớ đệm đáp án tạm thời theo thời gian thực (Hash), Bảng xếp hạng thi đua (ZSET) & Rate Limiting.',
                'Tốc độ đọc ghi trên RAM siêu việt (<1ms), cơ chế tự động hết hạn key (TTL), cấu trúc Sorted Set hỗ trợ xếp hạng O(log(N)) và Pub/Sub sự kiện tức thời.'
              ],
              [
                'Apache Cassandra',
                'Wide-Column Store (Time-Series)',
                'Ghi nhận nhật ký tiến trình xem video (Telemetry Stream), lịch sử dừng/tua video tần suất cao của học viên.',
                'Kiến trúc phân tán Masterless, tối ưu hóa tốc độ ghi cực nhanh (High-throughput Write), mở rộng tuyến tính (Linear Scalability), không khóa bảng.'
              ],
              [
                'Neo4j',
                'Graph Database (Property Graph)',
                'Quản lý Bản đồ tri thức (Knowledge Graph), điều kiện tiên quyết (Prerequisites) và thuật toán gợi ý lộ trình học tập tối ưu.',
                'Lưu trữ con trỏ vật lý trực tiếp giữa các nút (Index-free Adjacency), ngôn ngữ truy vấn Cypher duyệt hàng nghìn quan hệ mà không tốn chi phí JOIN đắt đỏ.'
              ]
            ]
          ),

          // CHƯƠNG 2
          h1('CHƯƠNG 2: PHÂN TÍCH YÊU CẦU & THIẾT KẾ MÔ HÌNH DỮ LIỆU'),
          h2('2.1. Thiết kế Lược đồ Dữ liệu MongoDB (Document Model)'),
          p(
            'MongoDB đóng vai trò là kho lưu trữ bền vững (Persistent Core Store). Lược đồ được thiết kế kết hợp giữa kỹ thuật Embedding (lồng tài liệu) và Referencing (tham chiếu ID):'
          ),
          h3('a. Collection `users`: Quản lý tài khoản và phân quyền'),
          p('Cấu trúc Document mẫu:'),
          ...codeBlock(
            `{\n  "_id": ObjectId("670000000000000000000003"),\n  "username": "student_nguyen",\n  "fullName": "Nguyễn Trọng Nguyên",\n  "email": "trongnguyen@gmail.com",\n  "role": "STUDENT", // STUDENT | TEACHER | ADMIN\n  "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",\n  "status": "ACTIVE"\n}`
          ),

          h3('b. Collection `courses` & `lessons`: Danh mục khóa học & bài giảng'),
          p(
            'Khóa học được thiết kế hỗ trợ tìm kiếm toàn văn với Text Index trên 4 trường: `title`, `tagline`, `description`, `category`. Bài học (`lessons`) tham chiếu khóa học qua `courseId` và được sắp xếp theo thứ tự trường `order: 1`.'
          ),

          h3('c. Collection `exams` & `results`: Đề thi và Kết quả đánh giá'),
          p(
            'Tài liệu `results` lưu vết toàn bộ bài nộp của học viên, gồm điểm số, số câu đúng/sai, thời gian nộp và mảng chi tiết câu trả lời (`detailedAnswers`). Đây là nguồn dữ liệu cho các truy vấn Aggregation của Giảng viên.'
          ),

          h2('2.2. Thiết kế Cấu trúc Key-Value trên Redis'),
          p('Redis được tận dụng tối đa 4 cấu trúc dữ liệu kinh điển:'),
          p('1. String with TTL: `exam:{examId}:attempt:{studentId}` lưu phiên làm bài với TTL = 1800 giây.'),
          p('2. Hash: `exam:{examId}:answers:{studentId}` lưu từng câu trả lời dạng Key-Value: `{ questionId: selectedOption }`.'),
          p('3. Sorted Set (ZSET): `leaderboard:{examId}` lưu điểm số của thí sinh dạng Member-Score: `ZADD leaderboard 8.5 "Nguyễn Trọng Nguyên"`.'),
          p('4. Counter String: `ratelimit:{studentId}` kiểm soát số lượng request trên phút với lệnh `INCR` và `EXPIRE`.'),

          h2('2.3. Thiết kế Lược đồ Wide-Column trên Apache Cassandra'),
          p(
            'Cassandra lưu trữ chuỗi thời gian sự kiện học tập trong Keyspace `elearning_logs`. Bảng `learning_events` được thiết kế theo đúng quy tắc truy vấn NoSQL:'
          ),
          ...codeBlock(
            `CREATE TABLE elearning_logs.learning_events (\n    student_id text,\n    event_time timestamp,\n    event_id uuid,\n    event_type text,\n    course_id text,\n    lesson_id text,\n    session_id text,\n    duration_seconds int,\n    payload text,\n    PRIMARY KEY ((student_id), event_time, event_id)\n) WITH CLUSTERING ORDER BY (event_time DESC, event_id ASC);`
          ),
          p(
            'Giải thích thiết kế: `student_id` là Partition Key giúp gom nhóm dữ liệu của một học viên vào cùng một Node vật lý. `event_time DESC` là Clustering Key giúp dữ liệu luôn được sắp xếp sẵn từ mới nhất đến cũ nhất trên đĩa.'
          ),

          h2('2.4. Thiết kế Mô hình Đồ thị trên Neo4j'),
          p(
            'Đồ thị tri thức bao gồm 4 loại Nút (Labels): Course, Lesson, Topic, Skill và 5 loại Cung quan hệ (Relationships): `CONTAINS`, `COVERS`, `PREREQUISITE_OF`, `DEVELOPS`, `RELATED_TO`. Điều này cho phép duyệt đồ thị đa chiều để lập lộ trình học tập cá nhân hóa.'
          ),

          // CHƯƠNG 3
          h1('CHƯƠNG 3: CÀI ĐẶT & HIỆN THỰC HÓA HỆ THỐNG EDUPRO ACADEMY'),
          h2('3.1. Môi trường triển khai Docker Compose'),
          p(
            'Toàn bộ 4 hệ CSDL được đóng gói trong tệp `docker-compose.yml` với giới hạn tài nguyên RAM tối ưu (< 2.2 GB), các thư mục dữ liệu được ánh xạ bền vững (Persistence Volumes) trên Ổ đĩa D:'
          ),
          p('- MongoDB 7.0: Cổng 27017, volume `./data/mongo/db`.'),
          p('- Redis 7.2: Cổng 6379, volume `./data/redis/data`.'),
          p('- Apache Cassandra 4.1: Cổng 9042, volume `./data/cassandra/data`.'),
          p('- Neo4j 5.15 Community: Cổng 7474 (HTTP) và 7687 (Bolt), volume `./data/neo4j/data`.'),

          h2('3.2. Hiện thực hóa Backend API (Node.js & Express)'),
          p(
            'Backend được xây dựng theo kiến trúc RESTful Controller - Route phân tách rõ ràng. Máy chủ chạy tại cổng `5050` (`http://localhost:5050`) cung cấp các endpoint cốt lõi:'
          ),
          p('• `/api/auth/login`: Xác thực và cấp JWT Token.'),
          p('• `/api/courses`: Lấy danh sách khóa học có đệm Redis Cache.'),
          p('• `/api/courses/search/text`: Tìm kiếm toàn văn với MongoDB Text Index.'),
          p('• `/api/exams/:id/start`: Khởi tạo phiên thi, xáo trộn câu hỏi và đặt TTL trên Redis.'),
          p('• `/api/exams/:id/answer`: Lưu đáp án thời gian thực vào Redis Hash.'),
          p('• `/api/exams/:id/submit`: Chấm điểm server, lưu Mongo và phát sự kiện qua Redis Pub/Sub.'),
          p('• `/api/exams/:id/export-csv`: Xuất báo cáo điểm thi ra file CSV mã hóa UTF-8 BOM.'),
          p('• `/api/graph/knowledge-graph`: Xuất mạng lưới đồ thị tri thức cho Vis.js.'),
          p('• `/api/graph/recommendations/:id`: Gợi ý khóa học bằng thuật toán Cypher.'),

          // CHƯƠNG 4
          h1('CHƯƠNG 4: CÁC TÍNH NĂNG NÂNG CAO & KIẾN TRÚC THƯƠNG MẠI'),
          h2('4.1. Cơ chế Cấp Chứng Chỉ Điện Tử (Digital Certificate) & In PDF'),
          p(
            'Khi học viên hoàn thành bài khảo sát đạt từ 5.0 điểm trở lên, hệ thống tự động xuất Bản Chứng Nhận Năng Lực Quốc Tế (EduPro Certificate of Excellence). Chứng chỉ có mã định danh duy nhất (`EDUPRO-xxxxxx`), con dấu bảo chứng Verified Seal và tích hợp tính năng in / xuất file PDF theo chuẩn @media print.'
          ),

          h2('4.2. Trợ lý Gia sư ảo AI Tutor Chatbot'),
          p(
            'Tích hợp Floating Chatbot Widget 24/7 ở góc phải màn hình, hỗ trợ trả lời tự động các câu hỏi về lộ trình nghề nghiệp (Data Architect, Fullstack, DevOps), hướng dẫn thi và giải thích kiến trúc hệ thống.'
          ),

          h2('4.3. Real-time Live Stream với Server-Sent Events (SSE) & Redis Pub/Sub'),
          p(
            'Khi có thí sinh nộp bài thi, Backend gọi `redisClient.publish("leaderboard_update", data)`. Tất cả các máy trạm đang mở màn hình phòng thi được kết nối qua kênh SSE (`/api/events/live-stream`) sẽ tự động nhận diện và cập nhật Bảng xếp hạng tức thời mà không cần reload trang.'
          ),

          h2('4.4. Cơ chế chống gian lận: Xáo trộn Đề thi Cá nhân hóa (Anti-Cheat Shuffling)'),
          p(
            'Thuật toán Fisher-Yates Shuffle xáo trộn ngẫu nhiên thứ tự câu hỏi riêng biệt cho từng thí sinh. Thứ tự này được lưu vào Redis `exam:{id}:order:{studentId}` có TTL đồng bộ, đảm bảo khi học viên tải lại trang thì đề thi vẫn giữ nguyên vẹn thứ tự câu hỏi cá nhân.'
          ),

          h2('4.5. Tự động thu gom và chấm điểm hết hạn (Auto-submit on TTL Expire)'),
          p(
            'Kích hoạt tính năng Redis Keyspace Notifications (`notify-keyspace-events KEx`). Khi thời gian 30 phút kết thúc mà thí sinh chưa bấm nộp bài, Redis bắn sự kiện `__keyevent@0__:expired`. Backend lắng nghe sự kiện này và tự động thu thập đáp án từ Hash để chấm điểm và lưu vào MongoDB.'
          ),

          h2('4.6. Công cụ quản trị trực quan NoSQL Live Query Inspector'),
          p(
            'Console Terminal nhúng ngay trên giao diện web dành cho Giảng viên / Admin: cho phép chạy trực tiếp các lệnh Redis (`KEYS`, `DBSIZE`), câu lệnh Cypher Neo4j (`MATCH`), kiểm tra collections MongoDB và chạy truy vấn CQL Cassandra với kết quả JSON trực quan.'
          ),

          // CHƯƠNG 5
          h1('CHƯƠNG 5: KIỂM THỬ TOÀN DIỆN, HIỆU NĂNG & SAO LƯU PHỤC HỒI'),
          h2('5.1. Kết quả kiểm thử tự động (14/14 Test Cases Passed)'),
          p(
            'Kịch bản kiểm thử tự động `scripts/automated_tests.js` đã được thực thi và đạt tỷ lệ vượt qua tuyệt đối 100%:'
          ),

          createTable(
            ['Mã TC', 'Hạng mục kiểm thử', 'Hệ CSDL kiểm tra', 'Kết quả'],
            [
              ['TC-01', 'Kiểm tra kết nối đồng thời cả 4 hệ CSDL', 'Mongo, Redis, Cassandra, Neo4j', 'PASS (100%)'],
              ['TC-02', 'Đăng nhập học viên & Cấp JWT Token', 'MongoDB', 'PASS (100%)'],
              ['TC-03', 'Đăng nhập giảng viên & Xác thực phân quyền', 'MongoDB', 'PASS (100%)'],
              ['TC-04', 'Tra cứu danh mục khóa học (Redis Cache Hit)', 'Redis + MongoDB', 'PASS (100%)'],
              ['TC-05', 'Chi tiết khóa học lồng danh sách bài học', 'MongoDB', 'PASS (100%)'],
              ['TC-06', 'Ghi log sự kiện xem video Time-Series', 'Apache Cassandra', 'PASS (100%)'],
              ['TC-07', 'Truy vấn lịch sử học tập theo Partition Key', 'Apache Cassandra', 'PASS (100%)'],
              ['TC-08', 'Khởi tạo phiên thi có TTL & Chống gian lận', 'Redis Key-Value', 'PASS (100%)'],
              ['TC-09', 'Lưu đáp án trắc nghiệm thời gian thực', 'Redis Hash', 'PASS (100%)'],
              ['TC-10', 'Đồng bộ toàn bộ đáp án trước khi nộp', 'Redis Hash', 'PASS (100%)'],
              ['TC-11', 'Server chấm điểm tự động & Cập nhật điểm', 'MongoDB Results + Redis', 'PASS (100%)'],
              ['TC-12', 'Truy vấn Bảng xếp hạng Real-time ZSET', 'Redis Sorted Set', 'PASS (100%)'],
              ['TC-13', 'Truy vấn toàn bộ Đồ thị tri thức', 'Neo4j Graph Database', 'PASS (100%)'],
              ['TC-14', 'Gợi ý lộ trình học tập qua Cypher Matching', 'Neo4j Cypher', 'PASS (100%)']
            ]
          ),

          h2('5.2. Quy trình Sao lưu & Phục hồi dữ liệu (Backup & Restore)'),
          p(
            'Hệ thống đã kiểm thử thành công kịch bản sao lưu tự động `scripts/backup/backup_all.bat`. Kết quả sao lưu trọn gói 4 CSDL được lưu tại thư mục `backups/`:'
          ),
          p('• MongoDB: Sử dụng tiện ích `mongodump` xuất dữ liệu chuẩn BSON.'),
          p('• Redis: Lệnh `BGSAVE` trích xuất tệp snapshot `redis_dump.rdb`.'),
          p('• Cassandra: Sử dụng công cụ `nodetool snapshot` chụp lại toàn vẹn Keyspace `elearning_logs`.'),
          p('• Neo4j: Dữ liệu được đồng bộ bền vững qua volume ánh xạ `./data/neo4j/data`.'),

          // CHƯƠNG 6
          h1('CHƯƠNG 6: KẾT LUẬN & HƯỚNG PHÁT TRIỂN'),
          h2('6.1. Những kết quả đạt được'),
          p(
            '1. Xây dựng thành công nền tảng E-Learning thương mại hoàn chỉnh với kiến trúc 100% NoSQL đa mô hình.'
          ),
          p(
            '2. Phân định ranh giới nghiệp vụ chuẩn xác giữa 4 hệ CSDL: MongoDB (Core Document), Redis (Session, Cache, Rank), Cassandra (High-throughput Logs) và Neo4j (Knowledge Graph).'
          ),
          p(
            '3. Tích hợp đầy đủ các tính năng công nghệ hiện đại: Cấp chứng chỉ PDF, AI Tutor Chatbot, Dark Mode, Redis Pub/Sub SSE, Anti-Cheat Shuffling và Live Query Inspector.'
          ),
          p('4. Vượt qua 100% các kịch bản kiểm thử tự động và hoàn thiện quy trình sao lưu phục hồi dữ liệu.'),

          h2('6.2. Hướng phát triển tương lai'),
          p('- Mở rộng cụm Cassandra Cluster đa Data Center để kiểm thử khả năng chịu lỗi (Fault Tolerance).'),
          p('- Tích hợp mô hình AI nhúng đồ thị (Graph Neural Networks - GNN) trên Neo4j để nâng cao độ chính xác của hệ khuyến nghị khóa học.'),
          p('- Triển khai giải pháp Kubernetes để tự động co giãn (Auto-scaling) các container cơ sở dữ liệu khi tải người dùng tăng đột biến.')
        ]
      }
    ]
  });

  const outputPath = path.join(__dirname, 'BAO_CAO_DO_AN_NOSQL_HUIT.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  console.log(`\n================================================================`);
  console.log(`✅ DA XUAT FILE WORD THANH CONG TAI:`);
  console.log(`👉 ${outputPath}`);
  console.log(`================================================================\n`);
}

generateDocx();
