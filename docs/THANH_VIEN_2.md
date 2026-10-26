# Phần việc thành viên 2 — Exam, Gamification & CMS

Mã nguồn được lấy từ nhánh `main`, commit `3eb586c`, ngày 25/10/2026. Nhánh thực hiện: `feature/member-2-exam-cms`.

## Chạy trong VS Code

Yêu cầu Node.js từ 20.19 trở lên để chạy bộ kiểm thử; nên dùng Node.js 22 hoặc 24.

1. Giải nén, chọn **File → Open Folder** và mở thư mục `DoAn_NoSQL_Elearning`.
2. Mở **Terminal → New Terminal**, chạy:

```bash
npm install
```

3. Bật các CSDL theo cấu hình hiện có của nhóm. MongoDB bắt buộc cho các chức năng này; bật Redis để kiểm tra cache và bitmap. Cassandra dùng ghi nhật ký vi phạm. Neo4j phục vụ các chức năng còn lại của dự án.
4. Nếu đã có dữ liệu nhóm, **không chạy lại seed MongoDB** vì script seed gốc xóa dữ liệu trong các collection. Chỉ chạy lệnh bổ sung không xóa dữ liệu:

```bash
npm run migrate:member2
npm start
```

5. Mở `http://localhost:5000`. Nếu `.env` đặt `PORT` khác, dùng cổng đó. Không mở bằng Live Server.

Nếu máy hoàn toàn chưa có dữ liệu: cấu hình `.env` theo file mẫu của dự án, chạy `npm run seed:mongo`, rồi chạy `npm run migrate:member2` và `npm start`.

Các tài khoản trong seed hiện có khác ví dụ trong Word: `admin`, `dinhnt`, `2001230303`, `2001230589`, `2001230578`. Dùng tài khoản/mật khẩu mà nhóm đang sử dụng. Phân quyền trong code là `ADMIN`, `TEACHER`, `STUDENT`.

## Đối chiếu 10 task và cách demo

| Task | Phần đã thực hiện | Cách kiểm tra |
|---|---|---|
| 2.1 Thi lại | API retake, lượt thi riêng, reset vi phạm/đáp án/thứ tự/đồng hồ; chặn reset giữa lượt; 3 vi phạm tự chấm 0 ở server | Vào thi, dùng nút mô phỏng vi phạm 3 lần, bấm Làm lại đề thi; thấy 0/3 và có thể nộp bài mới |
| 2.2 Xem bài cũ | Lưu nguyên câu hỏi, các lựa chọn, đáp án chọn, đáp án đúng, lời giải theo từng lượt; chỉ chủ bài được xem | Lịch sử → Xem chi tiết bài làm; đúng viền xanh, sai viền đỏ |
| 2.3 Cửa hàng XP | 4 vật phẩm đúng giá; trừ XP và thêm kho đồ trong cùng một cập nhật MongoDB; không chi vượt số dư khi bấm đồng thời | Lịch sử → Cửa hàng; 1.450 XP đổi Freeze 500 XP còn 950 XP |
| 2.4 Streak Freeze | Ngày học theo giờ Việt Nam; tiêu 1 thẻ khi bỏ đúng 1 ngày; bảo toàn chuỗi bằng Redis Bitmap, dữ liệu bền ở MongoDB; có toast và bông tuyết | Chạy kịch bản kiểm thử tự động bên dưới; xem chuỗi và kho đồ sau điểm danh |
| 2.5 Sửa/xóa khóa học | Admin/teacher sửa tiêu đề, mô tả, danh mục, giá, bài học; chỉ admin xóa mềm; làm mới cache | Quản trị → Quản lý khóa học → Sửa/Xóa; quay lại danh mục kiểm tra |
| 2.6 Sửa/xóa câu hỏi | Chọn đề, sửa câu và lời giải; chỉ admin xóa; cập nhật số câu trong đề; không đổi bài làm đã nộp | Quản trị → Quản lý ngân hàng câu hỏi → chọn đề → Sửa/Xóa |
| 2.7 Tra cứu chứng chỉ | Mã cố định gắn lượt thi, tra cứu công khai, SHA-256, QR, từ chối mã sai/thu hồi/sai hash | Bài đạt từ 5/10 → Chứng chỉ → mở link bằng cửa sổ ẩn danh |
| 2.8 Cờ xem lại | Cờ tạm theo lượt thi, ô điều hướng màu cam, nhắc số câu còn cờ trước khi nộp | Đặt cờ một câu rồi bấm Nộp; chọn Hủy để quay lại kiểm tra |
| 2.9 Lịch sử | Phân trang MongoDB 5 bài/trang, bộ lọc Placement/TOEIC/IELTS/Grammar, tổng số trang | Có 12 bài cùng loại thì hiển thị 5/5/2; chuyển trang và lọc |
| 2.10 Kiểm duyệt | Admin/teacher xóa thảo luận, admin xóa đánh giá; ẩn nút theo vai trò; xóa không bị dữ liệu mẫu xuất hiện lại | Mở lớp học bằng 3 vai trò và đối chiếu nút xóa |

## Kiểm thử

```bash
npm test
```

Lần kiểm tra cuối: **23/23 test đạt** khi bật Redis thử nghiệm, gồm cả kiểm tra migration chạy lặp không mất dữ liệu. Nếu không đặt `TEST_REDIS_PORT`, một test Redis được bỏ qua có ghi rõ trong kết quả.

Bộ test thành viên 2 chạy MongoDB tạm, không dùng CSDL học tập của nhóm; lần đầu cần Internet để tải MongoDB thử nghiệm. Bao gồm kiểm thử API với MongoDB thực và kiểm thử DOM giao diện bằng JSDOM. Bộ test kiểm tra phân quyền, nộp trùng, đổi quà đồng thời, đóng băng chuỗi, dữ liệu bài làm, phân trang và modal/nút bấm.

Để kiểm thử thêm Redis thật trên máy đã bật Redis, dùng PowerShell:

```powershell
$env:TEST_REDIS_PORT="6379"
npm test
Remove-Item Env:TEST_REDIS_PORT
```

Nên dùng Redis thử nghiệm riêng: bộ test ghi các key của tài khoản `670000000000000000000001`, cache khóa học và bảng xếp hạng các đề mẫu. Không chạy test Redis trên Redis chứa dữ liệu cần giữ của nhóm.

Bộ kiểm thử gốc của nhóm vẫn được giữ tại `scripts/automated_tests.js` và chạy bằng `npm run test:legacy`. Bộ đó gọi server ở cổng 5050 và dùng tên tài khoản mẫu cũ; không phải bộ kiểm thử độc lập mới. Chưa xác nhận toàn bộ các chức năng ngoài phần thành viên 2 bằng bộ legacy.

Không khẳng định đã kiểm thử tích hợp Cassandra/Neo4j trực tiếp hoặc đã kiểm tra hình thức trên trình duyệt thật. Các kiểm tra giao diện tự động chạy bằng JSDOM; cần kiểm tra thêm F12 khi demo trên máy nhóm.

## Dữ liệu và tích hợp

- `exam_attempts`: một trạng thái hiện hành theo người dùng và đề; lưu bản chụp câu hỏi, đáp án, thời hạn và số vi phạm. Mỗi lần thi lại có `attemptId` mới.
- `results`: `_id` của bài mới là UUID lượt thi; bài cũ dùng ObjectId vẫn xem được. Truy vấn lịch sử luôn giới hạn theo người đăng nhập. Thang điểm giữ nguyên của dự án: **0–10**.
- `certificates`: mã `EDUPRO-<submissionId>`, tên, đề, điểm, CEFR, ngày cấp, hash, trạng thái thu hồi. CEFR là quy đổi nội bộ để demo, không phải chứng nhận IELTS/TOEIC chính thức. Có thể đặt `PUBLIC_BASE_URL` khi triển khai để QR dùng tên miền thật; không gắn cứng tên miền chưa thuộc dự án.
- `users`: `xp`, `inventory`, `lastStudyDay`, `streakDays`, `freezeSavedDay`, `rewardedAttempts`. Đổi quà là cập nhật nguyên tử trên một document. Điểm danh +25 XP/ngày, nộp bài hợp lệ +150 XP/lượt; không cộng lại khi gửi trùng. Migration khởi tạo XP từ các lượt thi cũ nếu tài khoản chưa có số dư bền vững. Số XP giả lập tính lại mỗi lần tải trang của bản cũ đã được bỏ.
- `reward_items`: `streak_freeze` 500, `vip_avatar` 300, `writing_deep` 400, `ielts_mock_pro` 600. Task này triển khai mua và lưu kho; không bổ sung cơ chế sử dụng ba quà còn lại ngoài Freeze vì Word không giao phần đó.
- Redis: `streak:<userId>` dùng Bitmap với offset ngày từ epoch, không bị đứt khi qua năm; `exam:anti-cheat:<userId>:<examId>` lưu bộ đếm; `cache:courses:all` bị xóa khi sửa/xóa khóa học. MongoDB giữ bản bền và điều kiện cập nhật để không thể né vi phạm khi Redis bị khởi động lại.
- Cassandra: ghi `EXAM_CHEATING_WARNING` vào `learning_events` theo schema sẵn có. MongoDB `exam_audit` giữ bản ghi và cờ `cassandraSaved` nếu Cassandra không sẵn sàng; không giả báo ghi Cassandra thành công.
- Đánh giá trong code gốc được nhúng trong `courses.reviews`, nên giữ mô hình này và bổ sung `_id` cho từng đánh giá. API xóa cũng hỗ trợ bản ghi ở collection `reviews` nếu có.
- Bản `main` chỉ có đề gốc, các mã đề khác trước đây đều trỏ về đề đó. Migration tạo các bản sao ngân hàng câu hỏi độc lập cho từng mã đề; nội dung ban đầu giữ từ ngân hàng có sẵn để không tự đổi tài liệu nhóm. Giảng viên/admin có thể chỉnh từng đề trong CMS.
- Khóa học đã sửa lưu `lessons` trong document khóa học và API chi tiết ưu tiên danh sách đó; khóa học cũ vẫn đọc collection `lessons`. Khi ghép phần thành viên 1, dùng cùng quy tắc nguồn bài học này cho API tiến độ và tài liệu.

## File chính

- `src/routes/member2ExamRoutes.js`: API thi, chống gian lận, lịch sử, chứng chỉ, câu hỏi.
- `src/routes/member2CourseRoutes.js`: API shop, điểm danh, CMS khóa học và kiểm duyệt.
- `src/services/rewardService.js`, `member2Common.js`: nghiệp vụ XP/streak, kiểm tra dữ liệu, xử lý lỗi.
- `public/member2.js`, `member2.css`: giao diện; được nạp sau script hiện có trong `public/index.html` để giữ riêng phần việc của thành viên 2.
- `scripts/migrate_member2.js`: bổ sung dữ liệu, chỉ mục và mã chứng chỉ cho kết quả cũ.
- `tests/member2.test.js`, `member2-ui.test.js`: kiểm thử API và DOM.

Chưa push hoặc merge thay đổi vào GitHub. Bản bàn giao có toàn bộ mã nguồn hiện tại và bản vá so với commit gốc.
