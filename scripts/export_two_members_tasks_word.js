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

console.log('--- BAT DAU TAO TAI LIEU WORD PHAN CONG CHI TIET CHO 2 THANH VIEN ---');

const FONT_NAME = 'Times New Roman';
const COLOR_PRIMARY = '1F497D'; // Navy blue HUIT
const COLOR_SECONDARY = '2E75B6'; // Light blue
const COLOR_MUTED = '595959'; // Gray
const COLOR_BORDER = 'D3D3D3';
const COLOR_BG_LIGHT = 'F2F4F7';
const COLOR_CALLOUT_BG = 'EDF2F7';
const COLOR_SUCCESS = '10B981';
const COLOR_DANGER = 'DC2626';

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

function createTaskCard(taskId, taskName, type, description, backendInfo, frontendInfo, dodChecklist) {
  return [
    h3(`${taskId}: ${taskName} [${type}]`),
    createTable(
      ['Hạng mục kỹ thuật', 'Chi tiết đặc tả thực hiện'],
      [
        ['Mục tiêu nghiệp vụ:', description],
        ['Xử lý Backend & API:', backendInfo],
        ['Xử lý Frontend UI/UX:', frontendInfo],
        ['Tiêu chuẩn nghiệm thu (DoD):', dodChecklist]
      ],
      [28, 72]
    ),
    p('', { before: 60, after: 60 })
  ];
}

async function buildFocusedWordDocument() {
  const doc = new Document({
    creator: 'Nhóm 18 - 14DH HUIT',
    title: 'BẢNG PHÂN CÔNG & ĐẶC TẢ CÔNG VIỆC CHI TIẾT DÀNH CHO 2 THÀNH VIÊN',
    description: 'Tài liệu phân công chi tiết 20 đầu việc kỹ thuật cân bằng giữa 2 thành viên nhóm đồ án NoSQL',
    styles: {
      default: {
        document: {
          run: { font: FONT_NAME, size: 26, color: '000000' }
        }
      }
    },
    sections: [
      // TRANG BÌA CHUYÊN NGHIỆP
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 }
          }
        },
        children: [
          p('TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH (HUIT)', { alignment: AlignmentType.CENTER, bold: true, size: 26, color: COLOR_PRIMARY, line: 280, before: 0, after: 40 }),
          p('KHOA CÔNG NGHỆ THÔNG TIN - BỘ MÔN CƠ SỞ DỮ LIỆU', { alignment: AlignmentType.CENTER, bold: true, size: 24, color: COLOR_MUTED, line: 280, before: 40, after: 200 }),
          p('----------------------------------------------------', { alignment: AlignmentType.CENTER, color: COLOR_SECONDARY, before: 0, after: 200 }),

          p('ĐỒ ÁN HỌC PHẦN: DỮ LIỆU NOSQL (HỌC KỲ 7)', { alignment: AlignmentType.CENTER, bold: true, size: 26, color: 'C00000', before: 100, after: 60 }),
          p('BẢN ĐẶC TẢ CÔNG VIỆC CHI TIẾT & PHÂN CHIA NHIỆM VỤ DÀNH CHO 2 THÀNH VIÊN', {
            alignment: AlignmentType.CENTER,
            bold: true,
            size: 32,
            color: COLOR_PRIMARY,
            before: 60,
            after: 300
          }),

          p('Đề tài: Nền tảng E-Learning & Khảo sát năng lực tiếng Anh thực chiến tích hợp 4 CSDL NoSQL (MongoDB, Redis, Apache Cassandra, Neo4j)', {
            alignment: AlignmentType.CENTER,
            italics: true,
            size: 24,
            color: '0F172A',
            before: 40,
            after: 500
          }),

          createTable(
            ['Thông tin phân công', 'Nội dung chi tiết'],
            [
              ['Nhóm thực hiện:', 'Nhóm 18 - Lớp 14DHTH'],
              ['Kho lưu trữ GitHub:', 'https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git'],
              ['THÀNH VIÊN 1 (Academic & LMS):', 'Phụ trách 10 Tasks: Khóa học LMS, Từ vựng cá nhân, Chế độ rảnh tay, AI Writing Lab (MongoDB + Redis)'],
              ['THÀNH VIÊN 2 (Exam, Gamification & CMS):', 'Phụ trách 10 Tasks: Phòng thi & Anti-cheat 3/3, Cửa hàng đổi quà XP, Vòng đời CMS, Xác thực chứng chỉ (Redis + Cassandra + MongoDB)'],
              ['Thời gian thực hiện dự kiến:', '5 ngày (Hoàn thành trước hạn nộp đồ án và bảo vệ)']
            ],
            [35, 65]
          ),

          p('TP. HỒ CHÍ MINH, THÁNG 10/2026', { alignment: AlignmentType.CENTER, bold: true, size: 24, color: COLOR_MUTED, before: 600, after: 0 })
        ]
      },

      // NỘI DUNG CHI TIẾT
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
                    text: 'HUIT - Đặc Tả Công Việc Chi Tiết Cho 2 Thành Viên (Nhóm 18)',
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
                  new TextRun({ text: 'Trang ', font: FONT_NAME, size: 20, color: COLOR_MUTED }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT_NAME, size: 20, bold: true, color: COLOR_PRIMARY }),
                  new TextRun({ text: ' / ', font: FONT_NAME, size: 20, color: COLOR_MUTED }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_NAME, size: 20, color: COLOR_MUTED })
                ]
              })
            ]
          })
        },
        children: [
          h1('1. NGUYÊN TẮC PHỐI HỢP & QUY CHUẨN KỸ THUẬT CHO 2 THÀNH VIÊN'),
          p('Để đảm bảo tiến độ và chất lượng đồ án, 2 thành viên cần tuân thủ nghiêm ngặt các quy tắc sau:'),
          p('1. Tính độc lập mã nguồn: Mỗi thành viên phát triển trên nhánh Git riêng biệt, không chỉnh sửa chéo vào các file của nhau khi chưa trao đổi:'),
          p('   • Thành viên 1: Nhánh `feature/member-1-lms-vocab` (chủ yếu thao tác tại `courseRoutes.js`, `authRoutes.js` và `#section-courses`, `#section-vocab`, `#section-writing`).'),
          p('   • Thành viên 2: Nhánh `feature/member-2-exam-cms` (chủ yếu thao tác tại `examRoutes.js`, gamification shop và `#section-exam`, `#section-history`, `#section-analytics`).'),
          p('2. Tiêu chuẩn hoàn thành (Definition of Done - DoD): Mọi Task đều phải có đủ: Schema NoSQL hợp lệ ➔ API Endpoint có kiểm tra lỗi (validate) ➔ Giao diện Modal/Nút bấm trực quan ➔ Test script chạy pass 100%.'),
          p('3. Ràng buộc bảo mật & dữ liệu: Tất cả API thay đổi trạng thái đều phải bảo vệ bằng middleware `authenticateToken`, không để lọt lỗi 500 Unhandled Exception ra ngoài.'),

          calloutBox(
            'Lưu Ý Quan Trọng Về Git',
            'Trước khi bắt đầu làm bất kỳ Task nào, hãy chạy lệnh: `git pull origin main` để lấy mã nguồn mới nhất. Khi hoàn thành 1 Task, commit ngay với thông điệp rõ ràng theo chuẩn: `feat(module): description`.',
            true
          ),

          // PHẦN A: THÀNH VIÊN 1
          h1('2. ĐẶC TẢ CHI TIẾT 10 CÔNG VIỆC CỦA THÀNH VIÊN 1'),
          p('Thành viên 1 phụ trách hoàn thiện Trải nghiệm Học tập, Quản lý Khóa học LMS, Hệ thống Từ vựng cá nhân hóa và Phòng luyện kỹ năng AI (10 Tasks).', { bold: true }),

          // Task 1.1
          ...createTaskCard(
            'TASK 1.1',
            'Chỉnh Sửa Hồ Sơ Cá Nhân (Edit Profile Management)',
            'BỔ SUNG MỚI',
            'Cho phép học viên cập nhật thông tin cá nhân: Họ tên, Số điện thoại, Đơn vị/Trường học, Mục tiêu Band điểm (Target Band CEFR A1-C2 / IELTS 7.5 / TOEIC 850) và Avatar URL.',
            '• File: src/routes/authRoutes.js\n• Method & Path: PUT /api/auth/profile (Middleware: authenticateToken)\n• Request Body: { fullName, phone, school, targetBand, avatarUrl }\n• CSDL: MongoDB - cập nhật document tương ứng trong collection users.\n• Validation: Số điện thoại phải đúng định dạng VN (/^(0|\\+84)[3|5|7|8|9][0-9]{8}$/). fullName không được để trống hoặc chứa thẻ HTML. Báo lỗi 400 nếu sai.',
            '• File: public/index.html\n• Vị trí: Click vào tên học viên trên thanh Navbar (#user-display-name) ➔ Mở Modal #modal-edit-profile.\n• UI Elements: Form nhập Họ tên, SĐT, Trường học, Dropdown chọn Mục tiêu Band điểm (A2, B1, B2, C1, IELTS 6.5+, IELTS 7.5+, TOEIC 800+).\n• JS Function: saveUserProfile() gọi PUT /api/auth/profile, cập nhật text trên Navbar và hiển thị Toast xanh.',
            '[ ] Mở modal điền thông tin mới và lưu thành công.\n[ ] Nhập SĐT sai định dạng hiển thị thông báo lỗi đỏ.\n[ ] Tải lại trang (F5), thông tin tên mới và avatar mới vẫn hiển thị chính xác.'
          ),

          // Task 1.2
          ...createTaskCard(
            'TASK 1.2',
            'Đổi Mật Khẩu Trực Tiếp Trong Phiên Đăng Nhập (Change Password)',
            'BỔ SUNG MỚI & RÀNG BUỘC',
            'Người dùng đang đăng nhập có thể đổi mật khẩu định kỳ an toàn ngay trong menu tài khoản mà không cần làm quy trình Quên mật khẩu OTP.',
            '• File: src/routes/authRoutes.js\n• Method & Path: POST /api/auth/change-password (authenticateToken)\n• Request Body: { oldPassword, newPassword, confirmPassword }\n• CSDL & Logic: Dùng bcrypt.compare(oldPassword, user.password). Nếu sai trả về 400 "Mật khẩu hiện tại không chính xác". Kiểm tra newPassword >= 6 ký tự, không trùng oldPassword. Hash bằng bcrypt.hash(newPassword, 10) và lưu vào MongoDB users.',
            '• File: public/index.html\n• Vị trí: Thêm nút "Đổi mật khẩu" trong menu tài khoản góc trên bên phải.\n• UI Elements: Modal #modal-change-password gồm 3 ô nhập: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới (có icon mắt ẩn/hiện password).\n• JS Function: submitChangePassword() kiểm tra so khớp mật khẩu trước khi gửi API.',
            '[ ] Nhập sai mật khẩu cũ báo lỗi đỏ ngay lập tức.\n[ ] Nhập mật khẩu mới < 6 ký tự hoặc không khớp báo lỗi chuẩn xác.\n[ ] Đổi thành công, đăng xuất và dùng mật khẩu mới đăng nhập lại được.'
          ),

          // Task 1.3
          ...createTaskCard(
            'TASK 1.3',
            'Theo Dõi % Tiến Độ Hoàn Thành Khóa Học Động (Course Progress Tracker)',
            'BỔ SUNG MỚI',
            'Tự động ghi nhận và hiển thị thanh tiến độ phần trăm hoàn thành khóa học động (ví dụ: 2/4 bài học = 50%) trên Card trang chủ và màn hình lớp học.',
            '• File: src/routes/courseRoutes.js\n• Method & Path 1: POST /api/courses/:id/lessons/:lessonIndex/toggle-complete\n• Logic & CSDL: Cập nhật mảng completedLessons trong MongoDB (collection user_enrollments). Cập nhật tiến độ % vào Redis cache: SET course:progress:userId:courseId percent EX 86400.\n• Method & Path 2: GET /api/courses/:id/progress ➔ Trả về { totalLessons, completedLessons, progressPercent }.',
            '• File: public/index.html\n• Vị trí 1: Trên mỗi thẻ khóa học tại #section-courses: Thêm thanh progress bar màu xanh lam và nhãn "2/4 bài học (50%)".\n• Vị trí 2: Trong #section-classroom: Thêm checkbox lớn <input type="checkbox" id="chk-lesson-complete"> cạnh tiêu đề bài giảng: "Đánh dấu đã hoàn thành bài học này".',
            '[ ] Tick chọn hoàn thành bài 1 ➔ Thanh tiến độ trên card nhảy từ 0% lên 25%.\n[ ] Bỏ tick ➔ Thanh tiến độ giảm tương ứng.\n[ ] Lưu bền vững trong MongoDB và truy xuất nhanh qua Redis cache.'
          ),

          // Task 1.4
          ...createTaskCard(
            'TASK 1.4',
            'Tài Liệu Bài Giảng & Bài Tập Đính Kèm (Handouts & Resources)',
            'BỔ SUNG MỚI',
            'Cung cấp khu vực tài liệu đính kèm dưới mỗi bài giảng (PDF Slide, bài tập về nhà, file Audio nghe thêm) để học viên tải về học tập.',
            '• File: src/routes/courseRoutes.js\n• CSDL: Cập nhật schema khóa học trong MongoDB, mỗi lesson bổ sung mảng resources: [{ id, title, type: "pdf"|"audio", url, size }].\n• Endpoint: GET /api/courses/:id/lessons/:lessonIndex/resources ➔ Trả về danh sách tài liệu đính kèm của bài học hiện tại.',
            '• File: public/index.html\n• Vị trí: Trong #section-classroom: Bổ sung Tab "Tài liệu đính kèm" song song với Tab "Ghi chú" và "Thảo luận".\n• UI Elements: Danh sách tài liệu có icon trực quan (File PDF màu đỏ, File Audio màu tím, Dung lượng file) kèm nút bấm "Tải xuống (Download)".',
            '[ ] Chọn bài học bất kỳ ➔ Chuyển qua tab Tài liệu thấy hiện đầy đủ file đính kèm.\n[ ] Click vào nút Tải xuống kích hoạt tải file về máy tính.'
          ),

          // Task 1.5
          ...createTaskCard(
            'TASK 1.5',
            'Hủy Đăng Ký / Lưu Trữ Khóa Học (Unenroll & Archive Course)',
            'BỔ SUNG MỚI & HOÀN THIỆN',
            'Cho phép học viên chủ động hủy đăng ký khỏi khóa học không còn nhu cầu hoặc chuyển khóa học đã học xong vào mục Lưu trữ để làm gọn danh sách.',
            '• File: src/routes/courseRoutes.js\n• Endpoint: DELETE /api/courses/:id/enroll (authenticateToken)\n• CSDL: Xóa bản ghi đăng ký trong MongoDB user_enrollments. Xóa key cache Redis course:progress:userId:courseId.\n• Endpoint 2: POST /api/courses/:id/archive để chuyển trạng thái status: "archived".',
            '• File: public/index.html\n• Vị trí: Trong #section-classroom và phần Khóa học của tôi tại #section-history: Thêm nút "Hủy đăng ký khóa học".\n• UI Elements: Modal xác nhận cảnh báo: "Bạn có chắc chắn muốn hủy đăng ký khóa học này không?".',
            '[ ] Bấm Hủy đăng ký và xác nhận ➔ Khóa học biến mất khỏi danh sách khóa học đang theo học.\n[ ] Trạng thái nút tại trang chủ chuyển lại thành "Đăng ký ngay".'
          ),

          // Task 1.6
          ...createTaskCard(
            'TASK 1.6',
            'Modal Tạo Bộ Thẻ Từ Vựng Cá Nhân (Custom Flashcard Creator)',
            'BỔ SUNG MỚI',
            'Tạo giao diện cho phép người học tự thêm từ vựng mới của riêng mình vào kho lưu trữ cá nhân (kết nối endpoint POST /courses/flashcards/custom đã có sẵn).',
            '• File: src/routes/courseRoutes.js\n• Endpoint: POST /api/courses/flashcards/custom (authenticateToken)\n• CSDL: MongoDB collection custom_flashcards theo userId.\n• Validation: word bắt buộc (không quá 50 ký tự), meaning bắt buộc, phonetic và example tùy chọn, category thuộc (IELTS / TOEIC / Daily).',
            '• File: public/index.html\n• Vị trí: Đầu trang #section-vocab: Bổ sung nút nổi bật "+ Thêm từ mới".\n• UI Elements: Modal #modal-add-flashcard gồm các trường nhập: Từ tiếng Anh, Phiên âm IPA, Nghĩa tiếng Việt, Câu ví dụ, Danh mục.\n• JS Function: addNewCustomFlashcard() gọi API và chèn ngay thẻ mới vào đầu danh sách.',
            '[ ] Bấm "+ Thêm từ mới" ➔ Mở modal điền từ "Resilience" nghĩa "Sự kiên cường".\n[ ] Bấm Lưu ➔ Thẻ mới xuất hiện ngay trên giao diện, lật thẻ đọc được nghĩa bình thường.'
          ),

          // Task 1.7
          ...createTaskCard(
            'TASK 1.7',
            'Chế Độ Nghe Từ Vựng Rảnh Tay Tự Động (Hands-Free Audio Autoplay)',
            'BỔ SUNG MỚI',
            'Chế độ học từ vựng lúc chạy bộ/thư giãn: Hệ thống tự động đọc từ tiếng Anh ➔ ngưng 1.5s ➔ đọc nghĩa tiếng Việt ➔ tự lật thẻ và chuyển sang thẻ tiếp theo.',
            '• Backend: Tái sử dụng dữ liệu từ vựng hiện có, không cần thêm endpoint mới.',
            '• File: public/index.html\n• Vị trí: Tại thanh công cụ lọc từ vựng ở #section-vocab: Bổ sung nút "🎧 Tự động phát (Autoplay)".\n• JS Logic: toggleVocabAutoplay() sử dụng window.speechSynthesis: Đọc từ tiếng Anh (en-US) ➔ await setTimeout 1500ms ➔ kích hoạt hiệu ứng lật thẻ 3D ➔ đọc nghĩa tiếng Việt (vi-VN) ➔ chuyển thẻ kế tiếp.\n• Có nút "Dừng phát" để hủy chu kỳ bất kỳ lúc nào.',
            '[ ] Bật nút Autoplay ➔ Không cần click chuột, âm thanh tự động đọc tiếng Anh và tiếng Việt.\n[ ] Thẻ tự động lật mặt và tự động chuyển tuần tự qua từng từ vựng.'
          ),

          // Task 1.8
          ...createTaskCard(
            'TASK 1.8',
            'Xuất Kho Từ Vựng Ra File CSV / Excel (Export Vocab Deck)',
            'BỔ SUNG MỚI',
            'Cho phép học viên tải toàn bộ danh sách từ vựng đã lưu về máy tính dưới định dạng file CSV/Excel để in ấn hoặc nhập vào ứng dụng Anki trên điện thoại.',
            '• File: src/routes/courseRoutes.js\n• Method & Path: GET /api/courses/flashcards/export (authenticateToken)\n• Logic: Truy vấn từ vựng của user trong MongoDB. Định dạng file CSV gắn tiền tố UTF-8 BOM (\\uFEFF) chống lỗi font tiếng Việt trên Microsoft Excel. Header: Content-Type: text/csv; charset=utf-8, Content-Disposition: attachment; filename="EduPro_Vocabulary.csv".',
            '• File: public/index.html\n• Vị trí: Cạnh nút Autoplay tại #section-vocab: Thêm nút "📥 Xuất file CSV / Anki".\n• JS Function: exportVocabCsv() kích hoạt tải trực tiếp file về máy.',
            '[ ] Bấm nút Xuất file ➔ Trình duyệt tự tải file EduPro_Vocabulary.csv về máy.\n[ ] Mở bằng Microsoft Excel: Các cột Từ, IPA, Nghĩa tiếng Việt hiển thị rõ đẹp, không lỗi font.'
          ),

          // Task 1.9
          ...createTaskCard(
            'TASK 1.9',
            'Tự Động Lưu Bản Nháp Bài Viết Writing (Draft Autosave & Recovery)',
            'BỔ SUNG MỚI & RÀNG BUỘC',
            'Bảo vệ bài làm của học viên khi viết bài luận dài 250-400 từ, tự động lưu bản nháp vào Redis để khôi phục nếu lỡ tay F5, mất mạng hoặc chuyển tab.',
            '• File: src/routes/examRoutes.js\n• Endpoint 1: POST /api/exams/writing/draft (authenticateToken) ➔ Lưu nháp vào Redis: SETEX draft:writing:userId:taskType 86400 essay.\n• Endpoint 2: GET /api/exams/writing/draft ➔ Lấy lại nội dung nháp.\n• Endpoint 3: DELETE /api/exams/writing/draft ➔ Xóa nháp khi học viên bấm nộp bài thành công.',
            '• File: public/index.html\n• Vị trí: Tại #section-writing: Bắt sự kiện input trên #ielts-writing-input với debounce 2000ms.\n• UI Elements: Hiển thị badge nhỏ ở góc dưới khung viết: "🟢 Đã tự động lưu nháp lúc 10:45". Khi vào lại trang, nếu có bản nháp cũ, hiển thị thanh: "Bạn có bài viết chưa nộp. [Khôi phục] [Xóa]".',
            '[ ] Nhập bài luận 100 từ ➔ F5 tải lại trang ➔ Bấm Khôi phục ➔ 100 từ hiện lại nguyên vẹn.\n[ ] Nộp bài thành công ➔ Bản nháp tự động xóa sạch trên Redis.'
          ),

          // Task 1.10
          ...createTaskCard(
            'TASK 1.10',
            'Bổ Sung Phòng Luyện Viết IELTS Writing Task 1 (Mô Tả Biểu Đồ 150 Từ)',
            'BỔ SUNG MỚI',
            'Kỳ thi IELTS gồm Task 1 (Mô tả biểu đồ 150 từ) và Task 2 (Bài luận 250 từ). Cần bổ sung đầy đủ phần thi Task 1 với hình ảnh biểu đồ và tiêu chí chấm Task Achievement.',
            '• File: src/routes/examRoutes.js\n• Cập nhật hàm evaluateIeltsWriting: Nhận tham số taskType: "task1" | "task2".\n• Ràng buộc Task 1: Tối thiểu >= 15 từ (dưới báo lỗi 400), chuẩn 150 từ. Tiêu chí 1 chấm theo Task Achievement (TA) thay vì Task Response (TR), đánh giá khả năng mô tả Overview, xu hướng tăng giảm và dữ liệu số liệu.',
            '• File: public/index.html\n• Vị trí: Đầu trang #section-writing: Thêm 2 nút chuyển đổi tab: [IELTS Writing Task 1 (Biểu đồ)] và [IELTS Writing Task 2 (Bài luận)].\n• UI Elements: Khi chọn Task 1: Hiển thị hình ảnh biểu đồ mẫu (Line Graph xu hướng tiêu thụ năng lượng) và đề bài chuẩn.',
            '[ ] Chọn tab Task 1 ➔ Nhập bài miêu tả biểu đồ ➔ Bấm Chấm Điểm ➔ AI trả về bảng điểm chi tiết 4 tiêu chí chuẩn IELTS Task 1 (TA, CC, LR, GRA).'
          ),

          // PHẦN B: THÀNH VIÊN 2
          h1('3. ĐẶC TẢ CHI TIẾT 10 CÔNG VIỆC CỦA THÀNH VIÊN 2'),
          p('Thành viên 2 phụ trách hoàn thiện Quy trình Khảo sát Năng lực, Chống gian lận thi cử Anti-cheat, Cửa hàng Gamification và Cổng Quản trị CMS (10 Tasks).', { bold: true }),

          // Task 2.1
          ...createTaskCard(
            'TASK 2.1',
            'Quy Trình "Làm Lại Đề Thi" (Retake Exam) & Reset Anti-Cheat Triệt Để',
            'BỔ SUNG MỚI & HOÀN THIỆN',
            'Khi thí sinh đã thi xong hoặc không may bị đình chỉ (do vi phạm chuyển tab 3/3), cung cấp nút cho phép thi lại sạch sẽ mà không phải tải lại toàn bộ trang web.',
            '• File: src/routes/examRoutes.js\n• Endpoint: POST /api/exams/:id/retake (authenticateToken)\n• Logic & CSDL: Gọi await redisClient.del("exam:anti-cheat:" + userId + ":" + examId) để xóa sạch lịch sử vi phạm, đưa counter về 0/3. Đặt lại trạng thái bài thi thành in_progress. Trả về { success: true, message: "Đã sẵn sàng thi lại", violations: 0 }.',
            '• File: public/index.html\n• Vị trí: Trên màn hình kết quả thi và cả trong Modal Đình chỉ thi #anti-cheat-modal: Thêm nút nổi bật "🔄 Làm lại đề thi này (Retake Exam)".\n• JS Function: retakeCurrentExam() gọi API retake ➔ đặt lại currentViolationCount = 0 ➔ xóa trắng các đáp án radio đã chọn ➔ reset đồng hồ đếm ngược giờ thi ➔ đóng modal cảnh báo.',
            '[ ] Chuyển tab 3 lần để bị phạt 0 điểm và mở modal đình chỉ thi.\n[ ] Bấm "Làm lại đề thi" ➔ Modal đóng lại, vi phạm về 0/3, cho phép làm bài và nộp bài bình thường.'
          ),

          // Task 2.2
          ...createTaskCard(
            'TASK 2.2',
            'Xem Lại Chi Tiết Bài Làm Cũ & Lời Giải Thích (Past Exam Review Modal)',
            'BỔ SUNG MỚI',
            'Trong bảng Lịch sử thi, khi học viên bấm vào một bài thi cũ (ví dụ được 75/100 điểm), mở modal xem lại từng câu đã chọn, câu nào đúng, câu nào sai và đọc giải thích chi tiết.',
            '• File: src/routes/examRoutes.js\n• Cập nhật hàm nộp bài POST /api/exams/:id/submit: Lưu mảng chi tiết bài làm vào MongoDB / Cassandra: answers: [{ questionId, selectedOption, isCorrect, explanation }].\n• Endpoint mới: GET /api/exams/submissions/:submissionId/review ➔ Trả về danh sách câu hỏi, đáp án thí sinh chọn, đáp án đúng và lời giải thích.',
            '• File: public/index.html\n• Vị trí: Tại bảng Lịch sử khảo sát ở #section-history: Cột Thao tác bổ sung nút "👁️ Xem chi tiết bài làm".\n• UI Elements: Modal #modal-past-exam-review: Câu đúng highlight viền xanh lá, câu sai highlight viền đỏ, hiển thị: Bạn chọn: [B] ➔ Đáp án đúng: [D] kèm khung màu vàng: "💡 Lời giải thích chi tiết: ...".',
            '[ ] Vào lịch sử thi bấm xem bài thi 75 điểm ➔ Modal hiện rõ câu nào xanh, câu nào đỏ.\n[ ] Đọc được đầy đủ lời giải thích chi tiết cho từng câu hỏi.'
          ),

          // Task 2.3
          ...createTaskCard(
            'TASK 2.3',
            'Cửa Hàng Đổi Quà Điểm Thưởng XP (XP Reward Store / Redemption)',
            'BỔ SUNG MỚI',
            'Tạo nơi tiêu điểm kinh nghiệm (XP) mà học viên đã tích lũy (ví dụ: 1,450 XP), đổi lấy vật phẩm hỗ trợ học tập như Thẻ bảo lưu chuỗi học, Khung avatar VIP.',
            '• File: src/routes/courseRoutes.js\n• CSDL: MongoDB collection reward_items seed sẵn 4 vật phẩm: Thẻ Streak Freeze (500 XP), Khung Avatar VIP (300 XP), Chấm Writing chuyên sâu (400 XP), Vé thi thử IELTS Mock Test Pro (600 XP).\n• Endpoint 1: GET /api/courses/gamification/shop-items.\n• Endpoint 2: POST /api/courses/gamification/redeem (authenticateToken): Kiểm tra user.xp >= item.cost ➔ trừ XP và lưu vật phẩm vào mảng inventory của user.',
            '• File: public/index.html\n• Vị trí: Thêm khối giao diện "🎁 Cửa Hàng Đổi Quà Điểm Thưởng XP" trong #section-history.\n• UI Elements: Hiển thị số dư XP hiện tại và danh sách 4 thẻ quà tặng kèm nút "Đổi quà (x XP)". Nếu không đủ điểm thì nút tự động mờ (disabled).\n• Đổi thành công: Số XP trên Navbar trừ ngay lập tức và bắn hiệu ứng chúc mừng.',
            '[ ] Có 1,450 XP ➔ Bấm đổi Thẻ bảo lưu chuỗi 500 XP ➔ Số dư còn 950 XP.\n[ ] Kho đồ cá nhân xuất hiện 1 Thẻ bảo lưu chuỗi học Streak Freeze.'
          ),

          // Task 2.4
          ...createTaskCard(
            'TASK 2.4',
            'Cơ Chế Nghiệp Vụ Bảo Lưu Chuỗi Học (Streak Freeze Logic Trên Redis Bitmap)',
            'BỔ SUNG MỚI & RÀNG BUỘC',
            'Chuẩn nghiệp vụ Duolingo: Nếu ngày hôm qua học viên bận không vào học, kiểm tra trong kho đồ nếu có "Thẻ Streak Freeze" thì tự kích hoạt để bảo toàn chuỗi ngày học trên Redis Bitmap mà không bị reset về 0.',
            '• File: src/routes/courseRoutes.js\n• Logic: Trong hàm kiểm tra chuỗi ngày học (GET /gamification/profile hoặc điểm danh hàng ngày): Khi phát hiện ngày hôm qua không có bit nào được set trên Redis Bitmap streak:userId:\n  1. Kiểm tra inventory trong MongoDB xem có thẻ streak_freeze không.\n  2. Nếu có: Trừ 1 thẻ trong kho ➔ Set bit ngày hôm qua trên Redis Bitmap để nối liền chuỗi ➔ Trả về flag { streakSavedByFreeze: true }.\n  3. Nếu không có: Reset chuỗi ngày học về 1.',
            '• File: public/index.html\n• UI Elements: Hiển thị biểu tượng bông tuyết xanh ❄️ cạnh số ngày Streak trên Navbar nếu tài khoản đang có thẻ bảo lưu sẵn sàng trong kho.\n• Toast: Khi thẻ được kích hoạt, hiện thông báo: "Thẻ Streak Freeze đã được kích hoạt để cứu chuỗi học của bạn!".',
            '[ ] Bỏ bẵng 1 ngày không học, tài khoản có thẻ Freeze ➔ Đăng nhập lại chuỗi Streak vẫn giữ nguyên.\n[ ] Số lượng thẻ Freeze trong kho đồ tự động giảm đi 1.'
          ),

          // Task 2.5
          ...createTaskCard(
            'TASK 2.5',
            'Quản Trị Vòng Đời Khóa Học Đầy Đủ (Full CRUD: Sửa & Xóa Khóa Học)',
            'BỔ SUNG MỚI & HOÀN THIỆN',
            'Admin và Giảng viên hiện chỉ tạo mới được khóa học. Cần bổ sung đầy đủ chức năng Chỉnh sửa thông tin và Xóa khóa học khi nhập sai hoặc khóa học hết hạn.',
            '• File: src/routes/courseRoutes.js\n• Endpoint 1: PUT /api/courses/:id (authenticateToken, quyền admin/teacher) ➔ Cập nhật title, description, category, price, lessons trong MongoDB. Xóa cache Redis DEL cache:courses:all.\n• Endpoint 2: DELETE /api/courses/:id (authenticateToken, quyền admin) ➔ Đổi trạng thái isDeleted: true hoặc xóa khỏi MongoDB.',
            '• File: public/index.html\n• Vị trí: Trong CMS Quản trị (#section-analytics): Bổ sung Bảng danh sách khóa học hiện có.\n• UI Elements: Mỗi dòng có 2 nút thao tác: [✏️ Sửa] và [🗑️ Xóa]. Bấm Sửa mở Modal điền sẵn thông tin cũ để sửa nhanh. Bấm Xóa hiện hộp thoại xác nhận trước khi xóa.',
            '[ ] Đăng nhập tài khoản Admin ➔ Sửa giá tiền hoặc tiêu đề khóa học ➔ Ra trang chủ thấy cập nhật ngay.\n[ ] Bấm Xóa khóa học ➔ Khóa học biến mất khỏi danh mục.'
          ),

          // Task 2.6
          ...createTaskCard(
            'TASK 2.6',
            'Quản Trị Ngân Hàng Câu Hỏi Đề Thi (Sửa & Xóa Câu Hỏi Trong CMS)',
            'BỔ SUNG MỚI & HOÀN THIỆN',
            'Cho phép Admin/Giảng viên chỉnh sửa câu hỏi bị sai chính tả/đáp án hoặc xóa câu hỏi lỗi khỏi đề thi trắc nghiệm.',
            '• File: src/routes/examRoutes.js\n• Endpoint 1: PUT /api/exams/questions/:questionId (authenticateToken, quyền admin/teacher) ➔ Cập nhật questionText, options, correctAnswer, explanation trong MongoDB.\n• Endpoint 2: DELETE /api/exams/questions/:questionId (authenticateToken, quyền admin) ➔ Xóa câu hỏi khỏi đề thi tương ứng.',
            '• File: public/index.html\n• Vị trí: Trong #section-analytics: Thêm khu vực "Quản lý ngân hàng câu hỏi đề thi".\n• UI Elements: Dropdown chọn đề thi (Placement Test, TOEIC 850+, IELTS Reading) ➔ Hiển thị danh sách câu hỏi kèm nút [✏️ Sửa] và [🗑️ Xóa].',
            '[ ] Chọn đề thi TOEIC ➔ Sửa nội dung câu số 1 ➔ Vào làm đề thi thấy câu hỏi đã cập nhật nội dung mới.\n[ ] Xóa câu hỏi ➔ Số lượng câu trong đề thi giảm đi 1.'
          ),

          // Task 2.7
          ...createTaskCard(
            'TASK 2.7',
            'Tra Cứu & Xác Thực Chứng Chỉ Công Khai (Public Certificate Verification)',
            'BỔ SUNG MỚI',
            'Cung cấp trang tra cứu công khai để nhà tuyển dụng hoặc bên thứ 3 quét mã QR hoặc nhập mã chứng chỉ kiểm tra tính hợp pháp của chứng chỉ mà không cần đăng nhập.',
            '• File: src/routes/examRoutes.js\n• Endpoint: GET /api/exams/certificates/verify/:certId (Endpoint CÔNG KHAI, không yêu cầu token).\n• Logic: Tìm mã chứng chỉ trong MongoDB. Trả về: { isValid: true, studentName, examTitle, score, cefrLevel, issuedDate, verifyHash } kèm mã băm SHA-256 chống giả mạo. Nếu không tìm thấy trả về 404.',
            '• File: public/index.html\n• Vị trí 1: Trên Modal Chứng chỉ (#certificate-modal): Thêm đường link công khai https://edupro.vn/verify?certId=... và mã QR Code.\n• Vị trí 2: Thêm Modal "Tra cứu chứng chỉ": Nhập mã chứng chỉ ➔ Hiện thẻ xác thực chính thức có khiên bảo mật xanh.',
            '[ ] Nhập mã chứng chỉ hợp lệ ➔ Hiện đúng tên thí sinh và xếp loại CEFR.\n[ ] Nhập mã sai/giả mạo ➔ Báo lỗi "Chứng chỉ không tồn tại hoặc đã bị thu hồi".'
          ),

          // Task 2.8
          ...createTaskCard(
            'TASK 2.8',
            'Cờ Đánh Dấu Câu Hỏi Cần Xem Lại Khi Thi (Flag For Review)',
            'BỔ SUNG MỚI',
            'Phân biệt giữa Bookmark (lưu vào sổ tay lâu dài) và Flag for Review (cờ tạm thời để rà soát lại các câu chưa chắc chắn trước khi bấm Nộp bài).',
            '• Backend: Không cần thêm endpoint mới (quản lý state trực tiếp trong giao diện bài thi).',
            '• File: public/index.html\n• Vị trí: Trong giao diện thi tại #section-exam: Dưới mỗi câu hỏi, thêm nút "🚩 Đặt cờ xem lại (Flag)".\n• UI Elements: Trên Bảng câu hỏi điều hướng bên cột phải: Câu nào được đặt cờ thì đổi nút sang màu cam cảnh báo.\n• Popup xác nhận: Khi bấm "Nộp bài thi", nếu còn câu đặt cờ chưa gỡ, hiện nhắc nhở: "Bạn còn 2 câu hỏi đã đặt cờ chưa kiểm tra lại. Bạn có chắc chắn muốn nộp bài ngay?".',
            '[ ] Đặt cờ câu số 3 ➔ Nút số 3 trên bảng điều hướng đổi sang màu cam.\n[ ] Bấm Nộp bài thi nhận được thông báo nhắc nhở chuẩn xác.'
          ),

          // Task 2.9
          ...createTaskCard(
            'TASK 2.9',
            'Phân Trang & Lọc Bảng Lịch Sử Khảo Sát (Pagination & Filter History)',
            'RÀ SOÁT & HOÀN THIỆN',
            'Tránh tải ồ ạt hàng trăm bản ghi từ Cassandra / MongoDB làm đơ giao diện khi học viên đã thi nhiều lần.',
            '• File: src/routes/examRoutes.js\n• Endpoint: Cập nhật GET /api/exams/results/my-history hỗ trợ query params ?page=1&limit=5&category=ielts.\n• CSDL: Thêm phân trang skip/limit trong MongoDB hoặc Cassandra query.',
            '• File: public/index.html\n• Vị trí: Tại bảng Lịch sử thi ở #section-history:\n• UI Elements: Bổ sung bộ lọc dropdown theo loại đề thi (Tất cả, Placement, TOEIC, IELTS) và cụm nút phân trang: [◀ Trang trước] [Trang x / y] [Trang sau ▶].',
            '[ ] Khi có 12 bài thi, bảng hiển thị đúng 5 bài mỗi trang và chuyển trang mượt mà.\n[ ] Lọc theo đề thi TOEIC chỉ hiển thị kết quả của các bài thi TOEIC.'
          ),

          // Task 2.10
          ...createTaskCard(
            'TASK 2.10',
            'Kiểm Duyệt & Ẩn/Xóa Bình Luận Vi Phạm (Discussion & Review Moderation)',
            'BỔ SUNG MỚI & BẢO MẬT',
            'Giảng viên và Admin có quyền xóa hoặc ẩn các bình luận, câu hỏi hỏi đáp hoặc đánh giá khóa học có nội dung spam hoặc vi phạm tiêu chuẩn cộng đồng.',
            '• File: src/routes/courseRoutes.js\n• Endpoint 1: DELETE /api/courses/discussions/:discussionId (authenticateToken, quyền admin/teacher).\n• Endpoint 2: DELETE /api/courses/reviews/:reviewId (authenticateToken, quyền admin).\n• CSDL: Xóa bản ghi trong MongoDB reviews và discussions.',
            '• File: public/index.html\n• Vị trí: Phần Thảo luận bài học và Đánh giá khóa học trong #section-classroom.\n• UI Elements: Nếu user đăng nhập có role === "admin" hoặc role === "teacher": Hiển thị icon thùng rác nhỏ màu đỏ 🗑️ cạnh mỗi bình luận để xóa trực tiếp sau khi xác nhận.',
            '[ ] Tài khoản Student không thấy icon thùng rác.\n[ ] Tài khoản Teacher/Admin bấm vào icon xóa được bình luận spam ngay lập tức.'
          ),

          // BẢNG TIẾN ĐỘ 5 NGÀY
          h1('4. KẾ HOẠCH TRIỂN KHAI 5 NGÀY & CHECKLIST NGHIỆM THU'),
          p('Lộ trình thực hiện chi tiết theo từng ngày để đảm bảo hoàn thành đúng hạn:'),

          createTable(
            ['Thời gian', 'Công việc của THÀNH VIÊN 1', 'Công việc của THÀNH VIÊN 2', 'Mục tiêu kiểm thử chung'],
            [
              ['Ngày 1', 'Task 1.1 (Profile) & Task 1.2 (Change Pass)', 'Task 2.1 (Retake Exam) & Task 2.8 (Flag Review)', 'Kiểm thử xác thực tài khoản & Reset Anti-cheat 0/3.'],
              ['Ngày 2', 'Task 1.3 (Progress) & Task 1.4 (Handouts)', 'Task 2.2 (Exam Review) & Task 2.9 (Pagination)', 'Kiểm thử % tiến độ LMS & Xem chi tiết bài thi cũ.'],
              ['Ngày 3', 'Task 1.6 (Custom Vocab) & Task 1.7 (Autoplay)', 'Task 2.3 (XP Store) & Task 2.4 (Streak Freeze)', 'Kiểm thử tạo thẻ từ vựng & Đổi quà bằng điểm XP.'],
              ['Ngày 4', 'Task 1.8 (Export CSV) & Task 1.9 (Autosave)', 'Task 2.5 (CRUD Course) & Task 2.6 (CRUD Exam)', 'Kiểm thử xuất file CSV & Quản trị CMS Admin.'],
              ['Ngày 5', 'Task 1.10 (Writing Task 1)', 'Task 2.7 (Verify Cert) & Task 2.10 (Moderation)', 'Merge 2 nhánh vào main, chạy npm test đạt 100% PASS.']
            ],
            [15, 28, 28, 29]
          ),

          p('', { before: 100, after: 100 }),

          calloutBox(
            'Checklist Nghiệm Thu Cuối Cùng',
            'Trước khi nộp bài cho Giảng viên hướng dẫn:\n1. Chạy lệnh: `npm test` đảm bảo toàn bộ các bài kiểm thử NoSQL đều đạt trạng thái PASSED.\n2. Kiểm tra console trình duyệt (F12) không có bất kỳ dòng báo lỗi đỏ nào.\n3. Đăng nhập thử bằng cả 3 tài khoản: student@edupro.vn, teacher@edupro.vn, admin@edupro.vn để kiểm tra phân quyền.',
            true
          )
        ]
      }
    ]
  });

  const outputPath = path.join(__dirname, '..', 'BANG_PHAN_CONG_CHI_TIET_2_THANH_VIEN.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  console.log(`\n================================================================`);
  console.log(`✅ DA XUAT FILE WORD CHUYEN BIET CHO 2 THANH VIEN TAI:`);
  console.log(`👉 ${outputPath}`);
  console.log(`================================================================\n`);
}

buildFocusedWordDocument().catch(err => {
  console.error('Loi khi tao file Word:', err);
});
