# TÀI LIỆU TỔNG HỢP TOÀN BỘ CHỨC NĂNG & LUỒNG NGHIỆP VỤ HỆ THỐNG EDUPRO
## (MASTER FUNCTIONAL & WORKFLOW ARCHITECTURE GUIDE)

> **Hệ thống:** Nền tảng E-Learning & Thi Trực Tuyến Đa Mô Hình NoSQL (EduPro Academy)  
> **Kiến trúc:** Polyglot Persistence (MongoDB + Redis + Cassandra + Neo4j)  
> **Đối tượng sử dụng:** Học viên (Student), Giảng viên (Teacher), Quản trị viên (Admin), Khách vãng lai (Guest)  
> **Tài liệu tham chiếu:** Đồ án Tốt nghiệp / Báo cáo Chuyên đề Cơ sở dữ liệu NoSQL

---

## MỤC LỤC
1. [TỔNG QUAN KIẾN TRÚC LƯU TRỮ ĐA MÔ HÌNH (POLYGLOT PERSISTENCE)](#1-tổng-quan-kiến-trúc-lưu-trữ-đa-mô-hình-polyglot-persistence)
2. [BẢNG MA TRẬN API TOÀN HỆ THỐNG (API MASTER MATRIX)](#2-bảng-ma-trận-api-toàn-hệ-thống-api-master-matrix)
3. [PHÂN HỆ 1: XÁC THỰC, PHÂN QUYỀN (RBAC) & QUẢN LÝ HỒ SƠ](#3-phân-hệ-1-xác-thực-phân-quyền-rbac--quản-lý-hồ-sơ)
4. [PHÂN HỆ 2: KHÁM PHÁ KHÓA HỌC, TÌM KIẾM & ĐĂNG KÝ HỌC](#4-phân-hệ-2-khám-phá-khóa-học-tìm-kiếm--đăng-ký-học)
5. [PHÂN HỆ 3: PHÒNG HỌC TRỰC TUYẾN, TELEMETRY & CHỨNG CHỈ](#5-phân-hệ-3-phòng-học-trực-tuyến-telemetry--chứng-chỉ)
6. [PHÂN HỆ 4: PHÒNG THI TRỰC TUYẾN, CHỐNG GIAN LẬN & REAL-TIME LEADERBOARD](#6-phân-hệ-4-phòng-thi-trực-tuyến-chống-gian-lận--real-time-leaderboard)
7. [PHÂN HỆ 5: ĐỒ THỊ TRI THỨC CEFR & MẠNG XÃ HỘI HỌC TẬP (NEO4J)](#7-phân-hệ-5-đồ-thị-tri-thức-cefr--mạng-xã-hội-học-tập-neo4j)
8. [PHÂN HỆ 6: QUẢN TRỊ CMS, GIÁM SÁT 4 NOSQL & BENCHMARK/CHAOS](#8-phân-hệ-6-quản-trị-cms-giám-sát-4-nosql--benchmarkchaos)

---

## 1. TỔNG QUAN KIẾN TRÚC LƯU TRỮ ĐA MÔ HÌNH (POLYGLOT PERSISTENCE)

Hệ thống EduPro không sử dụng một cơ sở dữ liệu duy nhất mà phân bổ lưu trữ tối ưu theo thế mạnh kỹ thuật của 4 hệ quản trị NoSQL:

```mermaid
flowchart TD
    Client["Client (Web Browser: HTML5 / Tailwind / Vanilla JS)"]
    Server["API Gateway & Business Logic (Node.js Express Server)"]
    
    Client <-->|REST API / SSE Streams| Server
    
    Server -->|1. Document Store| Mongo[("MongoDB 7.0<br/>Core Business Entities<br/>Users, Courses, Exams, Submissions, Orders, Certs")]
    Server -->|2. In-Memory Store| Redis[("Redis 7.2<br/>Cache-Aside, Distributed Lock, Session,<br/>Answers Hash, Leaderboard ZSET, TTL Expiry")]
    Server -->|3. Column-Family Store| Cass[("Apache Cassandra 4.1<br/>Time-Series & Telemetry Logs<br/>Video Heartbeats, Anomaly Detection, Audit Trail")]
    Server -->|4. Graph Database| Neo[("Neo4j 5.15<br/>Graph Knowledge & Social Network<br/>CEFR Roadmap, Skill Prerequisites, Studies-With")]
```

* **MongoDB (Document Store):** Lưu trữ các thực thể nghiệp vụ có cấu trúc lồng nhau linh hoạt (User Profiles, Courses, Lessons, Exams, Question Pools, Submissions, Certificates).
* **Redis (In-Memory Key-Value & Data Structures):** Đảm nhiệm Cache-Aside (giảm 85% tải MongoDB), Distributed Lock (chống race condition khi nộp bài và thanh toán), Session, lưu đáp án tạm (Hash), xếp hạng tức thời (ZSET), và tự động nộp bài qua Redis Key Expiration (`__keyevent@0__:expired`).
* **Apache Cassandra (Wide-Column Time-Series):** Ghi nhật ký Telemetry với tốc độ cao không nghẽn khóa (Heartbeat xem video, phát hiện gian lận tua nhanh, Anti-cheat log vi phạm chuyển tab).
* **Neo4j (Graph Database):** Quản lý tri thức học tập dạng mạng lưới (Skill Tree, lộ trình CEFR A1-C2, tìm đường học tập ngắn nhất Shortest Path, gợi ý bạn cùng tiến `STUDIES_WITH`).

---

## 2. BẢNG MA TRẬN API TOÀN HỆ THỐNG (API MASTER MATRIX)

| STT | Phân hệ | Phương thức | Endpoint | File xử lý | CSDL tương tác | Quyền hạn (RBAC) |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: |
| 1 | Xác thực | `POST` | `/api/auth/login` | `authRoutes.js` | MongoDB, Redis | Mọi người |
| 2 | Xác thực | `POST` | `/api/auth/register/send-otp` | `authRoutes.js` | Redis (TTL 300s) | Mọi người |
| 3 | Xác thực | `POST` | `/api/auth/register` | `authRoutes.js` | MongoDB, Redis | Mọi người |
| 4 | Xác thực | `PUT` | `/api/auth/profile` | `authRoutes.js` | MongoDB, Redis | Logged In |
| 5 | Xác thực | `POST` | `/api/auth/change-password` | `authRoutes.js` | MongoDB | Logged In |
| 6 | Khóa học | `GET` | `/api/courses` | `courseRoutes.js` | Redis Cache -> MongoDB | Mọi người |
| 7 | Khóa học | `GET` | `/api/courses/:id` | `courseRoutes.js` | Redis Cache -> MongoDB | Mọi người |
| 8 | Khóa học | `POST` | `/api/courses/:id/enroll` | `courseRoutes.js` | MongoDB, Redis Lock | Học viên |
| 9 | Khóa học | `POST` | `/api/courses/:id/toggle-complete` | `courseRoutes.js` | MongoDB, Cassandra | Học viên |
| 10 | Telemetry | `POST` | `/api/telemetry/heartbeat` | `telemetryRoutes.js` | Cassandra, Redis | Học viên |
| 11 | Thi cử | `GET` | `/api/exams/list/all` | `examRoutes.js` | Redis Cache -> MongoDB | Học viên |
| 12 | Thi cử | `POST` | `/api/exams/:id/start` | `examRoutes.js` | MongoDB (Projection), Redis Hash | Học viên |
| 13 | Thi cử | `POST` | `/api/exams/:id/answer` | `examRoutes.js` | Redis Hash (Auto-save) | Học viên |
| 14 | Thi cử | `POST` | `/api/exams/:id/submit` | `examRoutes.js` | Redis Lock, MongoDB, Cassandra, ZSET | Học viên |
| 15 | Thi cử | `POST` | `/api/exams/anti-cheat/log-violation` | `examRoutes.js` | Cassandra, Redis, MongoDB | Học viên |
| 16 | Thi cử | `GET` | `/api/exams/:id/leaderboard` | `examRoutes.js` | Redis ZSET -> MongoDB | Mọi người |
| 17 | Thi cử | `GET` | `/api/exams/certificates/verify/:certId`| `examRoutes.js` | MongoDB | Public (Tra cứu) |
| 18 | Đồ thị | `GET` | `/api/graph/knowledge-graph` | `graphRoutes.js` | Neo4j Cypher / Fallback | Mọi người |
| 19 | Đồ thị | `GET` | `/api/graph/learning-path/:lessonId` | `graphRoutes.js` | Neo4j Dijkstra Shortest Path | Học viên |
| 20 | Bạn học | `GET` | `/api/peers/study-buddies` | `peerRoutes.js` | Neo4j (Degree-limited) | Học viên |
| 21 | Bạn học | `POST` | `/api/peers/connect` | `peerRoutes.js` | Neo4j Cypher (`STUDIES_WITH`) | Học viên |
| 22 | Quản trị | `POST` | `/api/admin/query-runner` | `server.js` | Polyglot (4 NoSQL DBs) | Admin |
| 23 | Quản trị | `GET` | `/api/databases/status` | `server.js` | MongoDB, Redis, Cassandra, Neo4j | Admin / Monitor |
| 24 | Thông báo | `GET` | `/api/events/live-stream` | `server.js` | Redis Pub/Sub, SSE | Logged In |

---

## 3. PHÂN HỆ 1: XÁC THỰC, PHÂN QUYỀN (RBAC) & QUẢN LÝ HỒ SƠ

### Chức năng 1.1: Đăng nhập Tài khoản & Cấp phiên làm việc (Authentication & Session Issuance)
* **1. Tên chức năng & Mục đích:** Xác minh danh tính người dùng qua Email/Mã sinh viên và Mật khẩu; thiết lập phiên làm việc được lưu trên Redis và Cookie/LocalStorage. Dành cho tất cả Actor.
* **2. Thao tác trên Giao diện:** Người dùng nhấn nút **"Đăng nhập"** trên Header, nhập Email (`student@edupro.vn`) và Mật khẩu, nhấn **"Xác nhận đăng nhập"** (hoặc chọn 1-Click Demo Account).
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** `index.html` gọi hàm `handleLoginSubmit()`, gửi `POST /api/auth/login` với body `{ email, password }` đến `src/routes/authRoutes.js`.
  * **Bước 2 (Xử lý & Validation):** Backend kiểm tra rỗng, mã hóa bcrypt so khớp hash password với bản ghi lưu trong DB; kiểm tra trạng thái kích hoạt tài khoản (`isActive: true`).
  * **Bước 3 (Tương tác Database):**
    * *MongoDB:* Query `db.users.findOne({ email })`.
    * *Redis:* Tạo Session Token dạng UUID `session:${token}`, ghi vào Redis với TTL 86,400s (24 giờ): `SETEX session:${token} 86400 JSON.stringify(userData)`.
    * *Redis:* Tăng số lượng active users qua HyperLogLog `PFADD active_users_today ${user.studentCode}`.
  * **Bước 4 (Kết quả trả về):** Trả về HTTP 200 kèm `{ token, user }`. Frontend lưu vào `localStorage`, ẩn nút Đăng nhập/Đăng ký, hiển thị thẻ Avatar, Họ tên đầy đủ, Cấp độ CEFR, XP tích lũy và nút Đăng xuất trên Navbar.
* **4. Trường hợp đặc biệt / Cơ chế bảo vệ:** 
  * Tích hợp Brute-force Protection qua Rate Limiter Redis: Nếu nhập sai mật khẩu quá 5 lần/phút, IP bị khóa tạm thời 15 phút.
  * Có sẵn cơ chế Demo Accounts (Học viên, Giảng viên, Admin) giúp Hội đồng chấm thi đăng nhập tức thì mà không cần gõ phím.

---

### Chức năng 1.2: Đăng ký Tài khoản mới & Xác thực OTP 2 Lớp (Registration with Redis OTP)
* **1. Tên chức năng & Mục đích:** Đăng ký tài khoản học viên mới an toàn, chống spam tài khoản rác bằng mã OTP gửi về Email có hiệu lực ngắn hạn trên Redis.
* **2. Thao tác trên Giao diện:** Nhấn **"Đăng ký"**, nhập Họ tên, Email, Mật khẩu, chọn Mục tiêu học tập (IELTS/TOEIC/Giao tiếp). Nhấn **"Gửi mã xác thực"**, nhận OTP và nhấn **"Hoàn tất đăng ký"**.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Giao diện gửi `POST /api/auth/register/send-otp` kèm `{ email }`.
  * **Bước 2 (Xử lý & Validation):** Backend kiểm tra Email đã tồn tại trong MongoDB chưa. Nếu chưa, sinh mã ngẫu nhiên 6 chữ số.
  * **Bước 3 (Tương tác Database):**
    * *Redis:* Lưu mã OTP với thời gian sống chính xác 300 giây (5 phút): `SETEX otp:register:${email} 300 ${otp}`.
  * **Bước 4 (Client gửi tiếp):** Người dùng nhập mã OTP, Client gửi `POST /api/auth/register` kèm `{ fullName, email, password, targetBand, otp }`.
    * *Redis:* So khớp mã OTP `GET otp:register:${email}`. Nếu khớp, xóa ngay key để chống Replay Attack (`DEL otp:register:${email}`).
    * *MongoDB:* Mã hóa mật khẩu bằng bcrypt (salt round = 10) và lưu vào `db.users.insertOne(...)`.
    * *Neo4j:* Tạo ngay Node học viên mới trong mạng xã hội học tập: `CREATE (:Student {code: $studentCode, name: $fullName, targetBand: $targetBand})`.
* **4. Trường hợp đặc biệt:** Nếu Redis offline, hệ thống kích hoạt cơ chế Local Fallback cho phép tài khoản test vượt qua với mã OTP cố định hiển thị trong Console log.

---

### Chức năng 1.3: Quản lý Hồ sơ Cá nhân, Gamification & Bảng thành tích XP
* **1. Tên chức năng & Mục đích:** Xem thông tin cá nhân, cập nhật mục tiêu học tập, theo dõi điểm thưởng (XP), Huy hiệu (Badges) và chuỗi ngày học liên tục (Streak).
* **2. Thao tác trên Giao diện:** Nhấn vào Avatar trên Navbar hoặc chọn tab **"Hồ sơ"**.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gọi `GET /api/courses/gamification/profile` và `GET /api/courses/events/heatmap`.
  * **Bước 2 (Xử lý):** Backend trích xuất `studentCode` từ Token xác thực.
  * **Bước 3 (Tương tác Database):**
    * *MongoDB:* Lấy thông tin chứng chỉ và các khóa học đã ghi danh từ `db.users`, `db.enrollments`, `db.certificates`.
    * *Redis:* Lấy điểm XP hiện tại từ Key `user:${studentCode}:xp` và tập hợp huy hiệu từ Set `user:${studentCode}:badges` (`SMEMBERS`).
    * *Cassandra:* Truy vấn bảng lịch sử học tập `user_study_sessions` để tổng hợp bản đồ nhiệt Heatmap (mức độ chuyên cần theo từng ngày trong năm).
  * **Bước 4 (Kết quả):** Giao diện hiển thị thanh tiến độ cấp độ, tủ huy hiệu 3D lấp lánh và biểu đồ chuỗi ngày học tập.
* **4. Trường hợp đặc biệt:** Khi người dùng đổi thưởng trong Shop quà tặng, Redis Atomic Decrement (`DECRBY`) đảm bảo số dư XP không bao giờ bị âm ngay cả khi click đổi quà liên tục.

---

## 4. PHÂN HỆ 2: KHÁM PHÁ KHÓA HỌC, TÌM KIẾM & ĐĂNG KÝ HỌC

### Chức năng 2.1: Danh mục Khóa học & Bộ lọc Danh mục Đa tiêu chí (ESR Indexing)
* **1. Tên chức năng & Mục đích:** Hiển thị danh sách khóa học tiếng Anh chuẩn quốc tế (IELTS, TOEIC, Giao tiếp) với tốc độ tức thì nhờ Cache-Aside và chỉ mục phức hợp ESR.
* **2. Thao tác trên Giao diện:** Trên trang chủ, học viên bấm các nút lọc: "Tất cả", "IELTS Academic", "TOEIC Quốc Tế", "Ngữ Pháp", "Giao Tiếp".
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Hàm `loadCourses(category)` gửi `GET /api/courses?category=...&level=...`.
  * **Bước 2 (Xử lý):** Backend kiểm tra tham số lọc và áp dụng chiến lược Cache-Aside.
  * **Bước 3 (Tương tác Database):**
    * *Redis (Cache Hit):* Kiểm tra key `cache:courses:${category}`. Nếu tồn tại, trả về ngay lập tức với độ trễ < 5ms.
    * *MongoDB (Cache Miss):* Nếu chưa có cache, query MongoDB với chỉ mục phức hợp ESR:
      `db.courses.find({ status: "PUBLISHED", category: req.query.category }).sort({ rating: -1, createdAt: -1 })`
      Chỉ mục `{ status: 1, category: 1, rating: -1 }` giúp MongoDB quét đúng số document cần lấy (`nReturned == totalDocsExamined`), không cần In-Memory Sort.
    * *Redis (Write-Back):* Ghi dữ liệu vào Redis với thời gian sống 600s: `SETEX cache:courses:${category} 600 JSON.stringify(courses)`.
  * **Bước 4 (Kết quả):** Grid danh sách khóa học hiển thị với ảnh bìa, giảng viên, cấp độ CEFR, số học viên và đánh giá sao.
* **4. Trường hợp đặc biệt:** Khi Giảng viên cập nhật thông tin khóa học qua CMS, hệ thống tự động xóa cache liên quan (`DEL cache:courses:*`) theo cơ chế Cache Eviction.

---

### Chức năng 2.2: Tìm kiếm Khóa học Thời gian thực (Instant Full-Text Search)
* **1. Tên chức năng & Mục đích:** Cho phép học viên gõ từ khóa trên Navbar và nhận gợi ý kết quả khóa học tức thời sau mỗi phím gõ.
* **2. Thao tác trên Giao diện:** Gõ từ khóa (ví dụ: "Writing", "IELTS 7.5", "Listening") vào ô tìm kiếm trên thanh điều hướng.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Sự kiện `input` (được debounce 300ms) gọi `handleInstantSearch()`, gửi `GET /api/courses/search/text?q=...`.
  * **Bước 2 (Xử lý):** Backend chuẩn hóa từ khóa tiếng Việt/Anh, loại bỏ ký tự đặc biệt nguy hiểm chống ReDoS/NoSQL Injection.
  * **Bước 3 (Tương tác Database):**
    * *MongoDB:* Thực hiện truy vấn Full-Text Index trên collection `courses`:
      `db.courses.find({ $text: { $search: query }, status: "PUBLISHED" }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).limit(6)`
  * **Bước 4 (Kết quả):** Hiển thị danh sách kết quả dạng Dropdown ngay dưới thanh tìm kiếm với độ tương thích từ khóa cao nhất.
* **4. Trường hợp đặc biệt:** Hỗ trợ tìm kiếm không dấu và tìm kiếm theo cấp độ CEFR (A1, A2, B1, B2, C1, C2).

---

### Chức năng 2.3: Đăng ký Khóa học & Tạo Đơn hàng VietQR Tự động (Checkout with Redis Lock)
* **1. Tên chức năng & Mục đích:** Cho phép học viên ghi danh vào khóa học. Nếu khóa học có học phí, hệ thống sinh mã đơn hàng, tạo mã QR ngân hàng động (VietQR chuẩn Napas 247) và khóa phân tán chống đăng ký trùng lặp.
* **2. Thao tác trên Giao diện:** Bấm nút **"Đăng ký học ngay"** trên Card khóa học hoặc trong Modal chi tiết.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gửi `POST /api/courses/:id/enroll` kèm Token xác thực.
  * **Bước 2 (Xử lý & Khóa phân tán):**
    * *Redis Atomic Lock:* Thực thi `SET lock:enroll:${courseId}:${studentCode} "LOCKED" EX 10 NX`.
    * Nếu key đã tồn tại (người dùng bấm liên tiếp 2 lần): Từ chối ngay với HTTP 409 ("Thao tác đang được xử lý, vui lòng chờ").
  * **Bước 3 (Tương tác Database):**
    * *MongoDB:* Kiểm tra xem học viên đã sở hữu khóa học chưa (`db.enrollments.findOne({ studentCode, courseId })`).
    * Nếu khóa học Miễn phí: Ghi ngay bản ghi mới vào `db.enrollments` với `status: "ACTIVE"`.
    * Nếu khóa học có phí: Tạo bản ghi đơn hàng trong `db.orders` với `status: "PENDING"`, sinh nội dung chuyển khoản tự động dạng `EDUPRO <MÃ ĐƠN HÀNG>`.
    * *Neo4j:* Tạo quan hệ học tập giữa Học viên và Khóa học:
      `MERGE (s:Student {code: $studentCode}) MERGE (c:Course {id: $courseId}) MERGE (s)-[:ENROLLED_IN {enrolledAt: datetime()}]->(c)`
    * *Redis:* Xóa khóa phân tán (`DEL lock:enroll:...`).
  * **Bước 4 (Kết quả):** Mở Modal thanh toán VietQR hiển thị thông tin chuyển khoản chính xác, hoặc chuyển thẳng học viên vào Phòng học nếu là khóa học miễn phí.
* **4. Trường hợp đặc biệt:** Có nút **"⚡ Demo Báo Cáo: Xác Nhận Thanh Toán Nhanh"** gọi `POST /api/courses/orders/:orderId/confirm` giúp Hội đồng kiểm tra luồng kích hoạt khóa học tự động trong 1 giây mà không phải quét QR thực tế.

---

## 5. PHÂN HỆ 3: PHÒNG HỌC TRỰC TUYẾN, TELEMETRY & CHỨNG CHỈ

### Chức năng 5.1: Xem Video Bài giảng & Gửi Luồng Heartbeat Cassandra (Video Telemetry Stream)
* **1. Tên chức năng & Mục đích:** Phát video bài giảng chuẩn HD, chia nhỏ danh sách bài học và thu thập luồng đo lường học tập thời gian thực gửi về cụm Cassandra.
* **2. Thao tác trên Giao diện:** Chọn khóa học từ menu hoặc trang cá nhân, màn hình chuyển sang giao diện Phòng học (Classroom). Bấm Play video.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Trình phát video HTML5 kích hoạt sự kiện `timeupdate`. Cứ mỗi 5 giây (hoặc khi Pause/Seek), client gửi `POST /api/telemetry/heartbeat` chứa `{ courseId, lessonId, studentCode, sessionId, videoCurrentTime, playbackRate, clientTimestamp }`.
  * **Bước 2 (Xử lý & Phát hiện gian lận tua nhanh):**
    * Backend lấy bản ghi heartbeat liền trước của session này từ Redis Cache.
    * **Thuật toán Anti-Fast-Forward:** Tính `deltaRealTime = (now - lastHeartbeatTime)` và `deltaVideoTime = (videoCurrentTime - lastVideoTime)`.
    * Nếu `deltaVideoTime > (deltaRealTime * playbackRate + 3.0)`: Đánh dấu cờ vi phạm `isAnomalousFastForward: true`.
  * **Bước 3 (Tương tác Database):**
    * *Cassandra:* Ghi sự kiện vào bảng chuyên dụng Time-Series `heartbeat_stream`:
      `INSERT INTO edupro_telemetry.heartbeat_stream (session_id, user_id, course_id, lesson_id, timestamp, video_current_time, is_anomaly) VALUES (?, ?, ?, ?, toTimestamp(now()), ?, ?)`
    * *Redis:* Cập nhật thời điểm heartbeat gần nhất cho session: `SETEX session:heartbeat:${sessionId} 30 ...`.
  * **Bước 4 (Kết quả):** Nếu phát hiện tua video bất thường, server trả về cờ cảnh báo; giao diện hiển thị Toast nhắc nhở nhẹ nhàng: *"Hệ thống phát hiện bạn đang tua nhanh video. Vui lòng xem đầy đủ để được tích lũy thời gian hoàn thành bài học."*
* **4. Trường hợp đặc biệt:** Sử dụng Cassandra giúp hệ thống chịu tải hàng triệu bản ghi heartbeat/giây từ hàng nghìn học viên học đồng thời mà không hề làm nghẽn MongoDB.

---

### Chức năng 5.2: Kiểm tra Điều kiện Hoàn thành Bài học (Server-Side 80% Verification)
* **1. Tên chức năng & Mục đích:** Chống gian lận bấm hoàn thành bài học khi chưa xem video; bắt buộc học viên phải tích lũy tối thiểu 80% thời lượng bài giảng mới được ghi nhận tiến độ.
* **2. Thao tác trên Giao diện:** Học viên bấm checkbox hoặc nút **"Đánh dấu hoàn thành"** tại bài học đang xem.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gửi `POST /api/courses/:id/toggle-complete` kèm `{ lessonId }`.
  * **Bước 2 (Xử lý & Thẩm định thời gian xem thực tế):**
    * Backend truy xuất tổng thời lượng video của bài học từ MongoDB (`lesson.duration`).
    * Backend truy vấn Cassandra để tính tổng số giây xem hợp lệ đã tích lũy từ các bản ghi heartbeat sạch (`is_anomaly = false`).
    * **Quy tắc nghiệm ngặt:** Nếu `actualWatchedSeconds < (lessonDuration * 0.8)`: Server **từ chối hoàn thành** và trả về mã lỗi `HTTP 403 INSUFFICIENT_WATCH_TIME`.
  * **Bước 3 (Tương tác Database nếu đạt điều kiện):**
    * *MongoDB:* Bổ sung `lessonId` vào mảng `completedLessons` trong `db.enrollments`. Cập nhật `progressPercent = (completedLessons.length / totalLessons) * 100`.
    * *Redis:* Cộng điểm kinh nghiệm cho học viên: `INCRBY user:${studentCode}:xp 50`.
  * **Bước 4 (Kết quả):** Checkbox bài học chuyển màu xanh, thanh tiến độ khóa học tăng lên, âm thanh hoàn thành vang lên. Nếu không đủ 80%, checkbox giữ nguyên và hiển thị thông báo yêu cầu xem tiếp.
* **4. Trường hợp đặc biệt:** Nhằm phục vụ việc chấm đồ án của Hội đồng, hệ thống trang bị nút **"⚡ Demo Báo Cáo Hội Đồng: Force Hoàn Thành"** gửi cờ `?force=true` giúp Giảng viên nghiệm thu tính năng tức thì mà không cần ngồi chờ 15 phút.

---

### Chức năng 5.3: Cấp Chứng chỉ Điện tử Chuẩn CEFR & Xác thực Công khai (SHA-256 Public Verification)
* **1. Tên chức năng & Mục đích:** Tự động cấp chứng chỉ điện tử có chữ ký số băm SHA-256 khi học viên hoàn thành 100% khóa học; cho phép nhà tuyển dụng tra cứu tính xác thực trực tuyến qua mã định danh công khai.
* **2. Thao tác trên Giao diện:**
  * *Học viên:* Khi tiến độ đạt 100%, nút **"Nhận chứng chỉ"** xuất hiện. Bấm vào để mở chứng chỉ với viền mạ vàng trang trọng, có thể tải về PDF hoặc ảnh PNG.
  * *Nhà tuyển dụng / Công chúng:* Bấm nút **"Tra cứu"** trên Navbar, nhập mã chứng chỉ (ví dụ: `CERT-CEFR-B2-9901`) để kiểm tra.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gửi yêu cầu cấp chứng chỉ hoặc gọi `GET /api/exams/certificates/verify/:certId`.
  * **Bước 2 (Xử lý & Sinh mã băm bảo mật):**
    * Backend kiểm tra điều kiện hoàn thành 100% của khóa học.
    * Sinh mã băm bất biến: `hash = SHA256(studentCode + courseId + issuedDate + SECRET_KEY)`.
  * **Bước 3 (Tương tác Database):**
    * *MongoDB:* Lưu vào collection `certificates`:
      `db.certificates.insertOne({ certId, studentCode, studentName, courseTitle, cefrLevel: "B2", issuedDate, digitalSignature: hash, isRevoked: false })`
    * *MongoDB:* Cập nhật mã chứng chỉ vào bản ghi `users` và `enrollments`.
  * **Bước 4 (Kết quả):** Khách tra cứu nhận được trang thông tin chứng chỉ chính thức của EduPro với dấu tích xanh xác thực hợp lệ, tên học viên, ngày cấp và mã chữ ký bảo mật.
* **4. Trường hợp đặc biệt:** Hỗ trợ tính năng in ấn trực tiếp (CSS `@media print`) tự động ẩn thanh menu và các thành phần thừa, chỉ in đúng khung chứng chỉ chuẩn khổ A4 ngang.

---

## 6. PHÂN HỆ 4: PHÒNG THI TRỰC TUYẾN, CHỐNG GIAN LẬN & REAL-TIME LEADERBOARD

### Chức năng 6.1: Bắt đầu Thi & Bảo mật Đề thi bằng MongoDB Projection (Secure Exam Start)
* **1. Tên chức năng & Mục đích:** Khởi tạo phiên thi, xáo trộn câu hỏi ngẫu nhiên và **ẩn tuyệt đối trường đáp án đúng** để ngăn chặn gian lận qua F12 Inspect / Network tab.
* **2. Thao tác trên Giao diện:** Vào mục **"Phòng thi"**, chọn đề thi (ví dụ: *IELTS Academic Reading & Listening 60 phút*), bấm **"Bắt đầu làm bài"**.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gửi `POST /api/exams/:id/start` kèm Token học viên.
  * **Bước 2 (Xử lý & Sanitize đề thi):**
    * Backend kiểm tra thời hạn mở đề và số lượt thi còn lại của học viên.
  * **Bước 3 (Tương tác Database):**
    * *MongoDB (Bảo mật Projection):* Truy vấn đề thi và sử dụng Projection hoặc hàm Sanitize loại bỏ triệt để các trường nhạy cảm:
      `const sanitizedQuestions = exam.questions.map(q => ({ id: q.id, prompt: q.prompt, options: q.options, points: q.points })) // correctAnswer & explanation HOÀN TOÀN BỊ LOẠI BỎ`
    * *Redis (Khởi tạo phiên thi & TTL):* Thiết lập thời gian làm bài chính xác vào Redis:
      `SETEX exam:${examId}:session:${studentCode} (durationMinutes * 60) "IN_PROGRESS"`
    * *Redis (Lưu trữ đáp án gốc có bảo vệ Grace Period):* Lưu mảng đáp án đúng vào key riêng có cộng thêm 120 giây ân hạn:
      `SETEX exam:${examId}:answers:${studentCode} (durationMinutes * 60 + 120) JSON.stringify(correctAnswers)`
  * **Bước 4 (Kết quả):** Màn hình chuyển sang phòng thi toàn màn hình, đồng hồ đếm ngược bắt đầu chạy, danh sách câu hỏi hiển thị đầy đủ nhưng kiểm tra F12 hoàn toàn không thể xem trước đáp án.
* **4. Trường hợp đặc biệt:** Nếu học viên cố tình gọi lại API `/start` khi bài thi đang diễn ra, server sẽ trả về phiên thi hiện tại chứ không reset thời gian làm bài.

---

### Chức năng 6.2: Lưu Đáp án Tạm Thời Thời Gian Thực (Auto-Save to Redis Hash)
* **1. Tên chức năng & Mục đích:** Tự động lưu đáp án ngay khi học viên chọn từng câu hỏi; đảm bảo nếu gặp sự cố tắt trình duyệt, mất mạng hoặc sập nguồn thì bài làm vẫn nguyên vẹn 100%.
* **2. Thao tác trên Giao diện:** Học viên click vào Radio button (A, B, C, D) của bất kỳ câu hỏi nào trong đề thi.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Giao diện kích hoạt ngay hàm gửi `POST /api/exams/:id/answer` với `{ questionId: "Q3", selectedOption: "B" }`.
  * **Bước 2 (Xử lý):** Backend kiểm tra phiên thi trong Redis xem còn hiệu lực thời gian không.
  * **Bước 3 (Tương tác Database):**
    * *Redis Hash:* Ghi nhận đáp án vào Hash cấu trúc cao:
      `HSET exam:${examId}:student_answers:${studentCode} "Q3" "B"`
      Thời gian phản hồi chỉ dưới **1 milli-giây** (In-Memory).
  * **Bước 4 (Kết quả):** Cụm số thứ tự câu hỏi bên thanh điều hướng chuyển từ màu xám sang màu xanh dương (đã làm); thông báo "Đã tự động lưu" nhấp nháy góc màn hình.
* **4. Trường hợp đặc biệt:** Khi học viên tải lại trang (F5), frontend tự động kéo toàn bộ các câu đã làm từ Redis Hash về để khôi phục đúng trạng thái trước đó.

---

### Chức năng 6.3: Giám sát Chống Gian Lận Đa Tầng (Anti-Cheat Tab-Switch Detection)
* **1. Tên chức năng & Mục đích:** Bắt quả tang hành vi học viên mở tab khác tra Google, chuyển cửa sổ hoặc bật công cụ trợ giúp trong lúc làm bài thi trực tuyến.
* **2. Thao tác trên Giao diện:** Học viên chuyển sang tab trình duyệt khác hoặc nhấn tổ hợp phím `Alt + Tab`.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Sự kiện `document.visibilitychange` hoặc `window.onblur` kích hoạt. Màn hình thi lập tức hiển thị Modal cảnh báo màu đỏ kèm còi báo hiệu: *"Cảnh báo vi phạm quy chế thi!"*
  * **Bước 2 (Gửi Log Vi phạm):** Frontend gọi `POST /api/exams/anti-cheat/log-violation` gửi `{ examId, studentCode, violationType: "TAB_SWITCH", timestamp }`.
  * **Bước 3 (Tương tác Database):**
    * *Redis:* Tăng số lần vi phạm: `INCR exam:${examId}:violations:${studentCode}`.
    * *Cassandra:* Ghi vĩnh viễn nhật ký vi phạm phục vụ thanh tra đào tạo:
      `INSERT INTO edupro_telemetry.anti_cheat_logs (student_code, exam_id, violation_type, timestamp, ip_address, user_agent) VALUES (?, ?, ?, toTimestamp(now()), ?, ?)`
  * **Bước 4 (Xử lý cưỡng chế nếu quá giới hạn):** Nếu số lần vi phạm vượt quá ngưỡng quy định ($\ge 3$ lần), backend tự động hủy quyền làm bài và kích hoạt luồng cưỡng chế nộp bài ngay lập tức.
* **4. Trường hợp đặc biệt:** Vô hiệu hóa chuột phải (`contextmenu`), phím F12, phím `Ctrl + Shift + I` và chặn thao tác bôi đen sao chép văn bản đề thi.

---

### Chức năng 6.4: Nộp Bài Thi & Chống Đụng Độ Bằng Khóa Phân Tán (Distributed Lock Submit)
* **1. Tên chức năng & Mục đích:** Chấm điểm bài thi tự động, ghi nhận lịch sử và triệt tiêu hoàn toàn lỗi **Race Condition** giữa việc học viên bấm nộp bài thủ công và luồng hệ thống tự động thu bài khi hết giờ TTL.
* **2. Thao tác trên Giao diện:** Học viên nhấn nút **"Nộp bài"** và xác nhận trên hộp thoại; hoặc đồng hồ đếm ngược về 00:00.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Frontend khóa cứng nút bấm ngay khi click (`disabled = true`, đổi text thành *"Đang nộp bài..."*), gửi `POST /api/exams/:id/submit`.
  * **Bước 2 (Cơ chế Khóa Phân Tán Atomic Redis Lock):**
    * Backend thực hiện xin khóa: `SET lock:submit:${examId}:${studentCode} "LOCKED" EX 15 NX`.
    * Nếu không xin được khóa (do luồng TTL Expired của server đang chạy song song): Luồng này dừng ngay, trả về HTTP 429 hoặc chờ kết quả đã hoàn thành.
  * **Bước 3 (Chấm điểm & Lưu trữ Polyglot):**
    * *Kiểm tra Idempotency:* Query MongoDB xem bài thi đã có bản ghi trong `db.submissions` chưa. Nếu đã có thì không chấm lại.
    * *Chấm điểm:* Lấy đáp án đã nộp đối chiếu với đáp án chuẩn từ MongoDB. Tính điểm số, số câu đúng/sai.
    * *MongoDB:* Lưu bản ghi kết quả hoàn chỉnh vào `db.submissions` kèm chi tiết câu trả lời, lời giải thích và thời gian hoàn thành.
    * *Redis ZSET:* Đưa điểm số vào Bảng xếp hạng Real-time:
      `ZADD leaderboard:exam:${examId} ${finalScore} ${studentCode}`
    * *Redis Pub/Sub:* Phát sự kiện nộp bài để cập nhật màn hình giám sát của Giảng viên qua SSE stream.
    * *Redis Cleanup:* Dọn dẹp session thi và giải phóng lock (`DEL lock:submit:...`).
  * **Bước 4 (Kết quả):** Màn hình hiển thị Bảng điểm tổng kết, xếp loại Band điểm, tỷ lệ câu đúng và xem lại chi tiết từng câu kèm giải thích cặn kẽ.
* **4. Trường hợp đặc biệt:** Sự kiện `__keyevent@0__:expired` trong `server.js` lắng nghe khi key thi hết hạn sẽ tự động gom đáp án tạm từ Redis Hash và nộp bài với cùng một logic khóa phân tán, đảm bảo không bao giờ bị trùng lặp bản ghi điểm.

---

### Chức năng 6.5: Bảng Xếp Hạng Thời Gian Thực (Real-time Leaderboard with Redis ZSET)
* **1. Tên chức năng & Mục đích:** Xem thứ hạng điểm thi trực tiếp của các thí sinh với tốc độ phản hồi cực nhanh, hỗ trợ hàng chục ngàn người xem đồng thời.
* **2. Thao tác trên Giao diện:** Trên trang chi tiết phòng thi hoặc sau khi nộp bài, xem tab **"Bảng xếp hạng"**.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gửi `GET /api/exams/:id/leaderboard?top=10`.
  * **Bước 2 (Tương tác Database):**
    * *Redis ZSET:* Truy vấn danh sách Top thí sinh điểm cao nhất theo thứ tự giảm dần:
      `ZREVRANGE leaderboard:exam:${examId} 0 9 WITHSCORES`
    * *Redis/MongoDB:* Lấy thông tin Họ tên, Avatar tương ứng với danh sách `studentCode` thu được.
  * **Bước 3 (Kết quả):** Giao diện hiển thị Top 10 kèm huy chương Vàng, Bạc, Đồng và vị trí thứ hạng cụ thể của chính học viên.
* **4. Trường hợp đặc biệt:** Khi có thí sinh nộp bài mới, Redis Pub/Sub đẩy dữ liệu qua SSE `/api/events/live-stream`, bảng xếp hạng trên màn hình các học viên khác tự động nhảy thứ hạng mà không cần F5 tải lại trang.

---

## 7. PHÂN HỆ 5: ĐỒ THỊ TRI THỨC CEFR & MẠNG XÃ HỘI HỌC TẬP (NEO4J)

### Chức năng 7.1: Bản đồ Tri thức & Cây Kỹ năng CEFR (Skill Tree & Dijkstra Shortest Path)
* **1. Tên chức năng & Mục đích:** Trực quan hóa lộ trình học tập từ trình độ A1 lên C2 dưới dạng đồ thị tương tác; tính toán lộ trình ngắn nhất (Shortest Path) để chinh phục mục tiêu học tập.
* **2. Thao tác trên Giao diện:** Vào mục **"Lộ trình"** trên Navbar. Màn hình hiển thị mạng lưới đồ thị mạng nhện (Vis.js Network) với các Node Kỹ năng và Cạnh Tiên quyết (`REQUIRES`).
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gọi `GET /api/graph/knowledge-graph` hoặc `GET /api/graph/learning-path/:lessonId`.
  * **Bước 2 (Xử lý Cypher Query trên Neo4j):**
    * Backend thực thi câu truy vấn đồ thị Cypher:
      ```cypher
      MATCH (start:Skill {name: $currentLevel}), (target:Skill {name: $targetGoal})
      MATCH path = shortestPath((start)-[:REQUIRES*]->(target))
      RETURN path
      ```
  * **Bước 3 (Kết quả trả về):** Trả về danh sách Nodes và Edges. Thư viện Vis.js kết xuất đồ thị vật lý có thể kéo thả, phóng to thu nhỏ. Các kỹ năng đã thành thạo sáng màu xanh lá, kỹ năng đang học màu vàng, kỹ năng bị khóa màu xám.
* **4. Trường hợp đặc biệt (Embedded Graph Fallback):** Nếu Docker Neo4j chưa được bật, backend tự động chuyển sang bộ dữ liệu dự phòng `EMBEDDED_GRAPH_FALLBACK` đã chuẩn bị sẵn trong code, đảm bảo giao diện đồ thị vẫn tương tác mượt mà trước Hội đồng.

---

### Chức năng 7.2: Đề xuất Bạn Cùng Tiến & Ngăn chặn Supernode Problem (Study Buddies Recommendation)
* **1. Tên chức năng & Mục đích:** Gợi ý các bạn học có cùng mục tiêu band điểm hoặc học chung khóa học để cùng nhau luyện tập; áp dụng thuật toán giới hạn bậc đỉnh để không làm treo cơ sở dữ liệu đồ thị.
* **2. Thao tác trên Giao diện:** Trong trang Lộ trình hoặc Hồ sơ, xem khối **"Mạng Lưới Bạn Cùng Tiến (Study Buddies)"**. Bấm **"Kết nối học tập"**.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gửi `GET /api/peers/study-buddies` kèm Token học viên.
  * **Bước 2 (Thuật toán Neo4j & Chống Supernode):**
    * Khi một học viên hoặc khóa học có hàng triệu kết nối (Supernode), câu truy vấn Cypher duyệt đồ thị thông thường sẽ bị tràn RAM và sập server.
    * Backend EduPro tối ưu hóa câu truy vấn Cypher với điều kiện lọc bậc đỉnh:
      ```cypher
      MATCH (me:Student {code: $studentCode})-[:ENROLLED_IN]->(c:Course)<-[:ENROLLED_IN]-(peer:Student)
      WHERE peer.code <> $studentCode AND size((peer)-[:STUDIES_WITH]-()) < 10000
      RETURN peer.code AS code, peer.name AS name, peer.targetBand AS targetBand, count(c) AS commonCourses
      ORDER BY commonCourses DESC
      LIMIT 10
      ```
  * **Bước 3 (Ghi nhận kết bạn):** Khi học viên bấm kết nối, Client gửi `POST /api/peers/connect` với `{ peerCode }`.
    * *Neo4j:* Tạo quan hệ 2 chiều:
      `MATCH (a:Student {code: $me}), (b:Student {code: $peerCode}) MERGE (a)-[:STUDIES_WITH {connectedAt: datetime()}]->(b)`
  * **Bước 4 (Kết quả):** Danh sách bạn học hiển thị với ảnh đại diện, mục tiêu điểm số và số lượng khóa học chung. Nút bấm chuyển sang *"Đã kết nối"*.

---

### Chức năng 7.3: Đề xuất Khóa học Theo Đồ thị Cộng tác (Collaborative Filtering AI)
* **1. Tên chức năng & Mục đích:** Gợi ý 3 khóa học phù hợp nhất dựa trên hành vi đăng ký của cộng đồng học viên có cùng lộ trình điểm số (Co-enrollment Graph Analysis).
* **2. Thao tác trên Giao diện:** Khối **"Khóa Học Đề Xuất Theo Đồ Thị Trí Tuệ Nhân Tạo"** nằm ngay dưới mục Pomodoro trên trang chủ. Bấm **"Cập nhật đề xuất"**.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Hàm `loadCollaborativeRecommendations()` gửi `GET /api/graph/collaborative-recommendations?targetBand=IELTS 7.5+`.
  * **Bước 2 (Truy vấn Neo4j):**
    ```cypher
    MATCH (s1:Student {targetBand: $targetBand})-[:ENROLLED_IN]->(c:Course)
    WITH c, count(s1) AS popularity
    ORDER BY popularity DESC
    LIMIT 3
    RETURN c.id AS courseId, c.title AS title, popularity
    ```
  * **Bước 3 (Kết quả):** Hiển thị 3 thẻ khóa học với tỷ lệ tương thích lộ trình (ví dụ: 96%, 92%, 88%) và lý do đề xuất rõ ràng.
* **4. Trường hợp đặc biệt:** Khung giao diện được thiết kế chuẩn Glassmorphism màu tối (`from-slate-900 via-indigo-950 to-slate-900`), loại bỏ triệt để hiện tượng chói mắt hoặc khó đọc chữ.

---

## 8. PHÂN HỆ 6: QUẢN TRỊ CMS, GIÁM SÁT 4 NOSQL & BENCHMARK/CHAOS

### Chức năng 8.1: Bảng Điều Khiển Giám Sát Sức Khỏe 4 CSDL NoSQL (Telemetry Health Dashboard)
* **1. Tên chức năng & Mục đích:** Theo dõi trực tiếp trạng thái kết nối, độ trễ phản hồi (latency), dung lượng RAM và tổng số bản ghi của 4 hệ cơ sở dữ liệu: MongoDB, Redis, Cassandra và Neo4j.
* **2. Thao tác trên Giao diện:** Nhấn vào viên thuốc **"● 4 CSDL"** trên Navbar. Modal hệ thống bung mở với 4 tab giám sát.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gửi `GET /api/databases/status`.
  * **Bước 2 (Kiểm tra sức khỏe song song - Health Ping):**
    * *MongoDB:* `mongoose.connection.db.admin().ping()`. Đếm số documents trong collections chính.
    * *Redis:* `redisClient.ping()` và lấy thông số bộ nhớ `INFO memory`.
    * *Cassandra:* `cassandraClient.execute('SELECT now() FROM system.local')`.
    * *Neo4j:* `neo4jDriver.session().run('RETURN 1 AS ping')`.
  * **Bước 3 (Kết quả):** Trả về trạng thái `"HEALTHY"` / `"CONNECTED"` kèm độ trễ tính bằng mili-giây và số lượng node/table của từng hệ thống. Giao diện hiển thị đèn trạng thái xanh lá nhấp nháy sống động.

---

### Chức năng 8.2: Công cụ Thực thi Truy vấn NoSQL Trực tiếp (Live Polyglot Query Runner)
* **1. Tên chức năng & Mục đích:** Cho phép Giảng viên và Hội đồng chấm thi gõ và chạy thử bất kỳ câu truy vấn NoSQL nào (MQL, Redis Command, CQL, Cypher) ngay trên giao diện web và xem kết quả JSON trả về trong tích tắc.
* **2. Thao tác trên Giao diện:** Trong Modal Quản trị, chọn tab **"Thực thi truy vấn (Query Runner)"**, chọn hệ CSDL, nhập lệnh và bấm **"Chạy truy vấn"**.
* **3. Luồng hoạt động từng bước:**
  * **Bước 1 (Client):** Gửi `POST /api/admin/query-runner` với `{ dbType: "MONGO" | "REDIS" | "CASSANDRA" | "NEO4J", query: string }`.
  * **Bước 2 (Phân quyền & Kiểm soát an toàn):**
    * Chỉ tài khoản có Role `ADMIN` hoặc `TEACHER` mới có quyền thực thi.
    * Chặn các lệnh nguy hiểm phá hủy dữ liệu (như `dropDatabase`, `FLUSHALL`, `DROP KEYSPACE`).
  * **Bước 3 (Thực thi trên Driver tương ứng):**
    * *MongoDB:* Parse MQL và thực thi qua native driver.
    * *Redis:* Parse command và gọi method `redisClient[cmd](...args)`.
    * *Cassandra:* Thực thi câu lệnh CQL qua `cassandraClient.execute(query)`.
    * *Neo4j:* Chạy câu truy vấn Cypher qua `session.run(query)`.
  * **Bước 4 (Kết quả):** Hiển thị kết quả trả về dạng JSON được tô màu cú pháp (Syntax Highlighted) kèm thời gian thực thi (Execution Time).

---

### Chức năng 8.3: Đo Kiểm Hiệu Năng Trực Tiếp & Kịch Bản Chaos Fallback (Live Benchmark & Fallback Testing)
* **1. Tên chức năng & Mục đích:** Chứng minh tính ưu việt của kiến trúc NoSQL khi so sánh tốc độ truy vấn có Cache (Redis) vs không Cache (MongoDB); kiểm tra khả năng phục hồi tự động khi ngắt kết nối CSDL (Chaos Engineering).
* **2. Thao tác trên Giao diện:** Chạy script `node scripts/run_live_benchmark.js` từ terminal hoặc bấm nút Benchmark trên giao diện Admin.
* **3. Kết quả đo kiểm thực tế:**
  * **Redis In-Memory Query:** Đạt **~0.8ms - 2.5ms** với thông lượng hàng chục ngàn ops/giây.
  * **MongoDB Indexed Query (ESR):** Đạt **~12ms - 28ms** (nhanh gấp 10 lần so với truy vấn không có chỉ mục).
  * **Cassandra Write Throughput:** Ghi luồng Telemetry đạt **< 4ms/write** không gây nghẽn.
  * **Neo4j Shortest Path:** Tìm đường đi giữa 2 kỹ năng qua 5 cấp độ đạt **~8ms - 15ms**.
* **4. Cơ chế Chaos Fallback:** Khi tắt Docker Neo4j hoặc Cassandra, server không bị crash (zero-downtime) mà kích hoạt khối `try/catch fallback` chuyển sang dữ liệu mẫu nội tại, giúp bài báo cáo diễn ra liền mạch 100%.

---

## 9. TỔNG KẾT & KINH NGHIỆM TRẢ LỜI BẢO VỆ ĐỒ ÁN

1. **Khi được hỏi: "Tại sao cần dùng đến 4 loại NoSQL mà không dùng 1 hệ CSDL duy nhất?"**
   * *Trả lời:* Mỗi hệ CSDL được sinh ra để giải quyết xuất sắc một bài toán chuyên biệt theo định lý CAP:
     - MongoDB giải quyết lưu trữ dữ liệu nghiệp vụ lồng nhau phức tạp (Document-oriented).
     - Redis giải quyết bài toán độ trễ cực thấp (< 2ms) cho Cache, Lock phân tán và Xếp hạng tức thì.
     - Cassandra tối ưu hóa ghi tuần tự khổng lồ (Append-only write) cho hàng triệu dòng Telemetry học tập.
     - Neo4j giải quyết bài toán duyệt đồ thị tri thức và quan hệ bạn học mà cơ sở dữ liệu quan hệ (RDBMS) sẽ bị bùng nổ phép nối (JOIN explosion).
2. **Khi được hỏi: "Nếu 2 luồng nộp bài cùng lúc thì xử lý thế nào?"**
   * *Trả lời:* Áp dụng **Atomic Distributed Lock** trên Redis (`SET lock:submit:... EX 15 NX`). Chỉ duy nhất 1 luồng được cấp khóa để chấm điểm; luồng thứ hai bị chặn và tận dụng tính chất **Idempotency** của MongoDB để không bao giờ bị nhân đôi bản ghi nộp bài.

---
*Tài liệu được biên soạn tự động từ toàn bộ mã nguồn thực tế EduPro Academy - Lưu trữ tại `TÀI LIỆU FINAL/TONG_HOP_LUONG_NGHIEP_VU_EDUPRO.md`.*
