# 🎓 EDUPRO ENGLISH - NỀN TẢNG E-LEARNING & KHẢO SÁT NĂNG LỰC ĐA CƠ SỞ DỮ LIỆU NOSQL

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.22-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7.0%20Document-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-v7.2%20In--Memory-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Apache Cassandra](https://img.shields.io/badge/Cassandra-v4.1%20Wide--Column-1287B1?style=for-the-badge&logo=apachecassandra&logoColor=white)](https://cassandra.apache.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-v5.20%20Graph-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![Tests](https://img.shields.io/badge/Automated%20Tests-21%2F21%20Passed%20(100%25)-10B981?style=for-the-badge&logo=checkmarx&logoColor=white)](scripts/automated_tests.js)

> **Học phần:** Cơ sở dữ liệu NoSQL (Học kỳ 7 - Khóa 14DH)  
> **Đơn vị:** Khoa Công nghệ Thông tin - Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT)  
> **Giảng viên hướng dẫn:** TS. Nguyễn Thị Định  
> **Nhóm thực hiện:** Nhóm 18 (Lớp 14DHTH)  
> **Trưởng nhóm & Kiến trúc sư:** Nguyễn Trọng Nguyên  
> **Kho lưu trữ GitHub:** [https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git](https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git)

---

## 📌 1. BẢNG PHÂN ĐỊNH KIẾN TRÚC 4 CƠ SỞ DỮ LIỆU NOSQL (POLYGLOT PERSISTENCE)

Hệ thống được thiết kế theo nguyên lý **Đa mô hình dữ liệu (Polyglot Persistence)**, phân định ranh giới nghiệp vụ chuẩn xác theo định lý CAP:

| CSDL NoSQL | Mô hình lưu trữ | Cổng mặc định | Nghiệp vụ đảm nhiệm chính |
| :--- | :--- | :---: | :--- |
| **MongoDB** | Document Store (JSON / BSON) | `27017` | Quản lý thực thể lõi có cấu trúc phức hợp: Khóa học, bài học, đề thi trắc nghiệm, tài khoản người dùng, bài luận Writing, đơn hàng VietQR và đánh giá bài học. |
| **Redis** | In-Memory Data Structures | `6379` | Tốc độ phản hồi `< 1ms`: Xác thực OTP có TTL 5 phút, giám sát Anti-cheat 3/3 vi phạm, chuỗi học tập Streak (Redis Bitmap), thông báo thời gian thực qua Redis Pub/Sub, bảng xếp hạng tuần (ZSET). |
| **Apache Cassandra** | Wide-Column Store (Time-Series) | `9042` | Lưu trữ dữ liệu ghi cực lớn (Write-intensive): Telemetry đo lường xem video bài giảng (play, pause, seek, speed), phân tích đường cong giữ chân video (Video Retention Drop-off), lịch sử làm bài thi. |
| **Neo4j** | Property Graph Database | `7474` / `7687` | Quản lý mạng lưới đồ thị: Bản đồ tri thức (Knowledge Graph CEFR A1 ➔ C2), Cây kỹ năng học thuật, Sơ đồ mạng nhện Collocations, và thuật toán Dijkstra gợi ý lộ trình thích ứng (Adaptive Roadmap). |

---

## ✨ 2. TÍNH NĂNG NỔI BẬT ĐÃ HOÀN THIỆN

1. **💳 Cổng Thanh Toán VietQR Động (NAPAS 247):** Sinh mã QR ngân hàng thật 100% với số tiền và cú pháp đơn hàng duy nhất, tích hợp đồng hồ đếm ngược 10:00 và nút xác thực Webhook tự động kích hoạt khóa học (+200 XP).
2. **🔔 Trung Tâm Thông Báo Thời Gian Thực (Redis Pub/Sub & SSE):** Chuông thông báo trên Navbar, cập nhật tức thời các sự kiện thành tích, lịch thi và thông báo khẩn cấp từ Admin mà không cần tải lại trang.
3. **🧠 Hệ Khuyến Nghị Đồ Thị Neo4j Collaborative AI:** Thuật toán duyệt đồ thị cộng tác (Co-enrollment & Shortest Prerequisite Path) đề xuất khóa học tối ưu theo mục tiêu đầu ra CEFR.
4. **📈 Phân Tích Tỷ Lệ Giữ Chân Video (Cassandra Video Retention Analytics):** Trực quan hóa chuỗi thời gian lượt xem video từng mốc 2 phút, chỉ rõ điểm rơi (Drop-off) và điểm tua lại (Replay Spike) cao nhất.
5. **🛡️ Hệ Thống Chống Gian Lận Phòng Thi (Anti-Cheat 3/3):** Bắt sự kiện chuyển tab/mở DevTools qua Redis Atomic Counter (`INCR`), khóa cứng bài thi và nộp 0 điểm khi vi phạm 3/3.
6. **✍️ Phòng Luyện Viết & Chấm Điểm AI (IELTS Writing Task 1 & 2):** Đánh giá bài luận tự động theo 4 tiêu chí chuẩn IELTS (TR/TA, CC, LR, GRA) từ 1.0 đến 9.0.
7. **💾 Bộ Công Cụ Tự Động Sao Lưu Đồng Bộ 4 CSDL (Disaster Recovery):** Sao lưu toàn bộ 4 database chỉ với 1 câu lệnh `node scripts/backup_restore_unified.js`.

---

## 🚀 3. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG TOÀN DIỆN

### Bước 1: Clone mã nguồn về máy
```bash
git clone https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git
cd DoAn_NoSQL_Elearning
```

### Bước 2: Cài đặt các thư viện phụ thuộc
```bash
npm install
```

### Bước 3: Cấu hình biến môi trường
Sao chép tệp mẫu `.env.example` thành `.env` (file `.env` đã được cấu hình sẵn các cổng kết nối):
* **Trên Windows PowerShell:**
  ```powershell
  copy .env.example .env
  ```
* **Trên Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

### Bước 4: Khởi động 4 CSDL NoSQL (Bằng Docker Compose)
Khởi động ứng dụng **Docker Desktop**, sau đó mở Terminal tại thư mục dự án và chạy:
```bash
docker compose up -d
```
> *Lệnh này sẽ tự động khởi tạo và chạy ngầm cùng lúc 4 Container: MongoDB, Redis, Apache Cassandra và Neo4j với giới hạn RAM tối ưu cho laptop.*

### Bước 5: Nạp dữ liệu mẫu ban đầu (Database Seeding)
```bash
npm run seed:all
```
*(Hoặc chạy lệnh: `node scripts/seed_all_4_nosql.js` để nạp đồng bộ dữ liệu vào 4 CSDL).*

### Bước 6: Khởi chạy máy chủ ứng dụng
```bash
npm start
```
Truy cập hệ thống trên trình duyệt:
* 🌐 **Website E-Learning & Khảo sát:** [http://localhost:5050](http://localhost:5050)
* 📊 **Neo4j Browser GUI:** [http://localhost:7474](http://localhost:7474) *(User: `neo4j` | Password: `nosql_project_2026`)*

---

## 🧪 4. KIỂM THỬ TỰ ĐỘNG TOÀN BỘ HỆ THỐNG (17/17 TESTS)

Hệ thống tích hợp bộ kịch bản kiểm thử tự động toàn diện kiểm chứng 100% chức năng kết nối và nghiệp vụ trên 4 CSDL NoSQL:
```bash
npm test
```
*(Hoặc chạy lệnh: `node scripts/automated_tests.js`)*

```text
================================================================
BAT DAU CHAY 21 TEST CASES VERIFICATION CHO HE THONG 4 NOSQL
================================================================

✅ TC-01 PASS: Ket noi Database he thong san sang (Active: MONGODB)
✅ TC-02 PASS: Dang nhap hoc vien (student_nguyen) thanh cong tren MongoDB, nhan JWT Token
✅ TC-03 PASS: Dang nhap giang vien (instructor_alex) thanh cong tren MongoDB, phan quyen TEACHER dung
✅ TC-04 PASS: Lay danh sach 12 khoa hoc (Nguon: MONGODB)
✅ TC-05 PASS: Chi tiet khoa hoc "IELTS Masterclass 7.5+" co 4 bai hoc (MongoDB)
✅ TC-06 PASS: Ghi log tien trinh xem video vao Cassandra (table learning_events) thanh cong
✅ TC-07 PASS: Truy van thanh cong 4 event hoc tap tu Cassandra theo Partition Key (student_id)
✅ TC-08 PASS: Khoi tao phien thi thanh cong tren Redis (TTL con lai: 1800s, 8 cau hoi)
✅ TC-09 PASS: Luu cau tra loi truc tiep vao Redis Hash
✅ TC-10 PASS: Dong bo day du tat ca dap an vao Redis Hash bo nho RAM truoc khi nop bai
✅ TC-11 PASS: Nop bai cham diem tu dong, luu MongoDB results va cap nhat Redis Leaderboard (ZADD)
✅ TC-12 PASS: Lay bang xep hang thoi gian thuc tu Redis ZREVRANGEBYSCORE
✅ TC-13 PASS: Truy van Knowledge Graph tu Neo4j thanh cong (23 Nodes, 25 Edges)
✅ TC-14 PASS: Goi y lo trinh hoc tap (Learning Path) qua Cypher pattern matching tren Neo4j thanh cong
✅ TC-15 PASS: Phat song & nhan thong bao thoi gian thuc qua Redis Pub/Sub thanh cong
✅ TC-16 PASS: Phan tich chuoi thoi gian Ty le giu chan Video (Cassandra Retention Curve) thanh cong
✅ TC-17 PASS: Tao ma VietQR dong va xac nhan thanh toan kich hoat khoa hoc thanh cong (+200 XP)
✅ TC-18 PASS: Smart AI Study Copilot tra loi tu nguon 4 CSDL (NEO4J, MONGODB, CASSANDRA, REDIS)
✅ TC-19 PASS: Giam sat Telemetry 4 CSDL thanh cong (Mongo, Redis RAM, Cassandra Events, Neo4j Nodes)
✅ TC-20 PASS: Kiem tra Tuong lua Redis Sliding Window Firewall (120 RPM, Blacklist Isolation)
✅ TC-21 PASS: Quet do thi Neo4j tim kiem Ban Cung Tien (Study Buddies Graph Match 96%)

================================================================
KET QUA KIEM THU: 21/21 TEST CASES PASSED (100%)
================================================================
```

---

## 🏛️ 5. PHÂN HỆ ĐỘC QUYỀN CỦA KIẾN TRÚC SƯ HỆ THỐNG (LEAD ARCHITECT)

Các chức năng cấp cao độc lập, nâng tầm ứng dụng lên chuẩn Enterprise:
1. 🤖 **Smart AI Study Copilot Widget:** Trợ lý ảo hợp nhất dữ liệu từ cả 4 CSDL NoSQL (Neo4j lộ trình, Cassandra video retention, Redis điểm thi đua, MongoDB bài học).
2. 📊 **Live 4-NoSQL Telemetry Monitor:** Dashboard giám sát tài nguyên thời gian thực qua Server-Sent Events (SSE) đo lường RAM Redis, Documents Mongo, Events Cassandra và Cypher latency Neo4j.
3. 🛡️ **Redis Sliding-Window Security Firewall:** Bức tường lửa ngăn chặn tấn công DoS, tự động cách ly IP spam > 120 req/phút vào `security:blacklist` với tính năng mở khóa 1-click.
4. 🕸️ **Neo4j Social Learning Graph Peer Matching:** Thuật toán so khớp đồ thị kết nối "Bạn Cùng Tiến" dựa trên Graph Intersection (Khóa học chung & Mục tiêu Band điểm).
5. 💾 **Web UI Disaster Recovery 1-Click:** Trung tâm sao lưu và khôi phục thảm họa đồng bộ cả 4 CSDL NoSQL ngay trên giao diện web.

---

## 👥 5. DANH SÁCH TÀI KHOẢN MẪU ĐĂNG NHẬP (DEMO ACCOUNTS)

Hệ thống đã nạp sẵn 3 tài khoản tương ứng với 3 vai trò (Roles) trong MongoDB:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn trên hệ thống |
| :--- | :--- | :---: | :--- |
| **Học viên (Student)** | `student@edupro.vn` | `123456` | Đăng ký khóa học qua VietQR, làm bài thi, nộp bài, luyện viết AI, học từ vựng, đổi quà XP. |
| **Giảng viên (Teacher)** | `teacher@edupro.vn` | `123456` | Xem tiến độ học viên, tạo/sửa đề thi, kiểm duyệt thảo luận và phát thông báo khẩn cấp. |
| **Quản trị viên (Admin)** | `admin@edupro.vn` | `123456` | Toàn quyền CMS: Kiểm tra 4 CSDL, CRUD Khóa học & Câu hỏi, phân quyền người dùng, xuất file CSV. |

> 💡 *Mẹo: Tại giao diện đăng nhập có sẵn các nút bấm 1-click để đăng nhập nhanh từng vai trò mà không cần gõ phím.*

---

## 📂 6. TÀI LIỆU PHÂN CÔNG & ĐẶC TẢ CHI TIẾT ĐỒ ÁN
* **Bản phân công chi tiết 20 Tasks cho 2 thành viên:** [BANG_PHAN_CONG_CHI_TIET_2_THANH_VIEN.docx](BANG_PHAN_CONG_CHI_TIET_2_THANH_VIEN.docx)
* **Tài liệu Hướng dẫn toàn diện & Kịch bản bảo vệ:** [HUONG_DAN_DU_AN_VA_PHAN_CONG_CONG_VIEC_NOSQL.docx](HUONG_DAN_DU_AN_VA_PHAN_CONG_CONG_VIEC_NOSQL.docx)
* **Script Sao lưu phục hồi 4 CSDL (Disaster Recovery):** [scripts/backup_restore_unified.js](scripts/backup_restore_unified.js)
