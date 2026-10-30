# 🎬 KỊCH BẢN CHI TIẾT QUAY VIDEO DEMO ĐỒ ÁN DỮ LIỆU NoSQL (5 - 7 PHÚT)
## HỆ SINH THÁI E-LEARNING & KHẢO SÁT NĂNG LỰC TIẾNG ANH EDUPRO ACADEMY
**Học phần:** Dữ liệu NoSQL (14DH) — Trường Đại học Công Thương TP.HCM (HUIT)  
**Nhóm thực hiện:** Nhóm 18  
**Thành viên:**
1. **Nguyễn Trọng Nguyên** (MSSV: `2001230589`) — Trưởng nhóm / Lead Architect & Full-stack
2. **Phạm Nguyễn Khôi Nguyên** (MSSV: `2001230578`) — Thành viên / Backend & Document/Key-Value
3. **Võ Huỳnh Gia Huy** (MSSV: `2001230303`) — Thành viên / Big Data Telemetry & Graph Database

---

## 🎯 NGUYÊN TẮC VÀNG KHI QUAY DEMO ĐẠT ĐIỂM TỐI ĐA (TIÊU CHÍ 9 & 10)
1. **Chia đôi màn hình hoặc chuyển đổi song song (Side-by-Side):** Mỗi thao tác click trên Web **BẮT BUỘC** phải mở ngay phần mềm GUI Tool tương ứng (Compass, RedisInsight, TablePlus, Neo4j Browser) để chứng minh dữ liệu NoSQL được ghi nhận và thay đổi thật 100%.
2. **Khớp thời lượng chuẩn:** Từ **5 phút 30 giây đến 6 phút 45 giây** (đúng khung quy định 5–7 phút của Hội đồng chấm thi HUIT).
3. **Phân chia đồng đều 3 thành viên:** Mỗi bạn phụ trách trọn vẹn một mảng CSDL và nghiệp vụ sở trường theo bảng phân công ở Bảng 1.2 của Báo cáo.

---

## 🖥️ CHUẨN BỊ TRƯỚC KHI BẤM QUAY (CHECKLIST 1 PHÚT)
1. **Chạy server Backend:** Chạy `Chay_He_Thong.bat` -> Truy cập [http://localhost:5050](http://localhost:5050).
2. **Mở sẵn 4 phần mềm GUI Tool bằng 1 cú click:** Chạy `Mo_4_Phan_Mem_CSDL.bat` (chọn phím `A`):
   - 🍃 **MongoDB Compass:** Kết nối `mongodb://127.0.0.1:27017` -> Chọn CSDL `elearning_nosql`.
   - ⚡ **RedisInsight:** Kết nối `127.0.0.1:6379`.
   - 👁️ **TablePlus (hoặc DBeaver):** Kết nối Cassandra cổng `9042`, keyspace `elearning_tracking`.
   - 🕸️ **Neo4j Desktop / Browser:** Mở `http://localhost:7474`, đăng nhập user `neo4j` / pass `nosql_project_2026`.
3. **Phần mềm quay video:** OBS Studio hoặc Bandicam / Windows Game Bar (Win + G), độ phân giải Full HD 1080p, bật mic thu âm rõ ràng.

---

# ⏱️ BẢNG PHÂN CHIA RECORD & TIMELINE TỪNG GIÂY (TỔNG: 6 PHÚT 30 GIÂY)

| Thời lượng | Phân đoạn | Người trình bày | Hệ CSDL & GUI Tool minh chứng |
| :---: | :--- | :--- | :--- |
| **0:00 – 1:05** | **Phần 1: Giới thiệu tổng quan & Kiến trúc Polyglot 4 NoSQL** | **Nguyễn Trọng Nguyên** | Sơ đồ Kiến trúc Polyglot Persistence, Slide/Sơ đồ hệ thống |
| **1:05 – 2:50** | **Phần 2A: Nghiệp vụ Học viên, Cache, Thi & Gamification** | **Phạm Nguyễn Khôi Nguyên** | **MongoDB Compass** (`users`, `courses`, `results`) & **RedisInsight** (`cache`, `exam:answers`, `leaderboard:weekly`) |
| **2:50 – 4:40** | **Phần 2B: Lớp học Video, Cassandra Telemetry & Đồ thị Neo4j** | **Võ Huỳnh Gia Huy** | **TablePlus / cqlsh** (`learning_events`) & **Neo4j Browser** (Đồ thị kỹ năng & Bạn Cùng Tiến) |
| **4:40 – 5:50** | **Phần 3: Quản trị CMS, Tường lửa Redis & Sao lưu phục hồi** | **Nguyễn Trọng Nguyên** | **RedisInsight** (`security:firewall`), **Compass** (`questions`), Admin Dashboard |
| **5:50 – 6:30** | **Phần 4: Đánh giá hiệu năng, Hạn chế & Lời kết** | **Nguyễn Trọng Nguyên** (hoặc cả nhóm) | Bảng Benchmark p95, Biểu đồ đối sánh, Kết thúc video |

---

# 🎙️ CHI TIẾT KỊCH BẢN THUYẾT MINH & THAO TÁC MÀN HÌNH

---

### 🟢 PHẦN 1: GIỚI THIỆU TỔNG QUAN & KIẾN TRÚC HỆ THỐNG (0:00 – 1:05)
* **Người thực hiện:** **Nguyễn Trọng Nguyên** (Trưởng nhóm)
* **Màn hình hiển thị:** Trang bìa slide / Trang chủ Web EduPro Academy và Sơ đồ kiến trúc 4 CSDL.

**Lời thoại thuyết minh:**
> *"Kính chào Thầy Cô và các bạn! Em là Nguyễn Trọng Nguyên, đại diện Nhóm 18 môn Dữ liệu NoSQL, lớp 14DH trường Đại học Công Thương TP.HCM (HUIT). Hôm nay nhóm em xin phép được báo cáo và demo sản phẩm đồ án cuối kỳ với đề tài: **'Xây dựng Nền tảng E-Learning & Khảo sát Năng lực Tiếng Anh EduPro Academy trên nền tảng Đa Cơ sở dữ liệu Polyglot NoSQL'**.*
>
> *Nhóm em gồm có 3 thành viên: Em - Nguyễn Trọng Nguyên đảm nhiệm vai trò Lead Architect và Full-stack; bạn Phạm Nguyễn Khôi Nguyên phụ trách mô hình Document MongoDB và Key-Value Redis; bạn Võ Huỳnh Gia Huy phụ trách Big Data Telemetry trên Apache Cassandra và Graph Database trên Neo4j.*
>
> *Thay vì sử dụng một hệ quản trị RDBMS truyền thống gặp nút thắt cổ chai về hiệu năng và giới hạn mở rộng, EduPro Academy áp dụng kiến trúc **Polyglot Persistence**, kết hợp sức mạnh chuyên biệt của 4 hệ CSDL NoSQL hàng đầu:*
> 1. * **MongoDB (Document Store):** Quản trị danh mục khóa học, giáo trình nhúng, hồ sơ học viên và ngân hàng câu hỏi đề thi.*
> 2. * **Redis (In-Memory Key-Value):** Tăng tốc bộ nhớ đệm Cache-Aside, đếm ngược phiên thi theo thời gian thực (TTL), bộ đệm lưu đáp án RAM và đua top bảng vàng bằng Sorted Set.*
> 3. * **Apache Cassandra (Wide-Column Store):** Tiếp nhận luồng sự kiện học tập Heartbeat chuỗi thời gian khổng lồ (Time-series Video Telemetry) và phân tích tỷ lệ giữ chân người xem.*
> 4. * **Neo4j (Graph Database):** Mô hình hóa bản đồ tri thức ngôn ngữ CEFR A1 đến C2 và giải thuật toán tìm kiếm Bạn Cùng Tiến (Study Buddies).*
>
> *Sau đây, em xin nhường lại phần trình bày cho bạn Khôi Nguyên để demo phân hệ học viên, phòng thi trực tuyến và hệ thống Gamification."*

---

### 🟢 PHẦN 2A: NGHIỆP VỤ HỌC VIÊN, REDIS CACHE, PHÒNG THI & GAMIFICATION (1:05 – 2:50)
* **Người thực hiện:** **Phạm Nguyễn Khôi Nguyên**
* **Màn hình hiển thị:** Web EduPro [http://localhost:5050](http://localhost:5050) chuyển tab song song với **MongoDB Compass** và **RedisInsight**.

#### 1. Đăng nhập học viên & Duyệt khóa học có Redis Cache (1:05 – 1:35)
* **Thao tác Web:**
  - Nhấp nút "Đăng nhập" góc phải -> Điền tài khoản `student_nguyen` / Mật khẩu `123456` -> Bấm Đăng nhập.
  - Web hiển thị lời chào *"Xin chào, Nguyễn Trọng Nguyên (Updated)"* kèm số dư XP (ví dụ: `1,175 XP`).
  - Lướt xem danh mục 12 khóa học.
* **Thao tác GUI Tool:**
  - Mở **RedisInsight** -> Vào mục Keys -> Chỉ vào key `cache:courses:catalog` (TTL 1800s).
* **Lời thoại thuyết minh:**
  > *"Chào Thầy Cô! Em là Phạm Nguyễn Khôi Nguyên. Đầu tiên, em tiến hành đăng nhập với tài khoản học viên `student_nguyen`. Hệ thống xác thực danh tính qua MongoDB và cấp phát JWT Token an toàn.*
  >
  > *Tại Trang chủ, danh mục 12 khóa học được nạp cực nhanh nhờ chiến lược **Cache-Aside trên Redis**. Khi kiểm tra trên RedisInsight, Thầy Cô có thể thấy key `cache:courses:catalog` đang được lưu với thời gian sống TTL 30 phút, giúp giảm độ trễ truy vấn từ 38ms trên MongoDB xuống chỉ còn 3.2ms trên Redis."*

#### 2. Đăng ký khóa học & Thanh toán VietQR Động (1:35 – 2:00)
* **Thao tác Web:**
  - Chọn khóa học *"IELTS Intensive: Chiến Thuật Bứt Phá Band 7.5+"* -> Bấm nút **"Đăng ký ngay"**.
  - Modal xuất hiện mã **VietQR động** kèm mã giao dịch `EDUPRO_XXXX`, số tiền 1.890.000 VNĐ và đồng hồ đếm ngược giao dịch.
  - Bấm nút xanh **"Xác nhận đã thanh toán"**.
  - Web hiện thông báo kích hoạt thành công và cộng ngay `+200 XP` thưởng.
* **Thao tác GUI Tool:**
  - Mở **MongoDB Compass** -> Collection `users` -> Tìm `student_nguyen` -> Nhấn Refresh -> Trường `xp` tăng lên `+200` và mảng `enrolledCourses` xuất hiện ID khóa học vừa đăng ký.
* **Lời thoại thuyết minh:**
  > *"Tiếp theo, khi học viên đăng ký khóa học, hệ thống sinh mã VietQR động theo chuẩn Napas 24/7. Ngay khi bấm 'Xác nhận đã thanh toán', giao dịch được xử lý nguyên tử qua MongoDB Atomic Operations: khóa học được kích hoạt vào danh sách của học viên và điểm thưởng XP lập tức được cộng thêm 200 điểm trên Compass."*

#### 3. Phòng thi trắc nghiệm, Anti-Cheat & Bảng xếp hạng Redis ZSET (2:00 – 2:50)
* **Thao tác Web:**
  - Bấm vào menu **"Phòng Thi"** -> Đề thi bắt đầu ở chế độ thi chuẩn, đồng hồ đếm ngược 1800 giây chạy liên tục.
  - Chọn đáp án các câu: Câu 1 chọn B, Câu 2 chọn A, Câu 3 chọn C.
* **Thao tác GUI Tool (Lưu đáp án RAM):**
  - Mở **RedisInsight** -> Tìm key `exam:670000000000000000000040:answers:2001230589` (dạng kiểu dữ liệu **Hash**) -> Mở xem: Các field câu hỏi tương ứng đúng các đáp án B, A, C vừa nhấp!
* **Thao tác Web (Demo Anti-Cheat):**
  - Mở một tab trình duyệt khác hoặc ấn `Alt + Tab` ra ngoài màn hình desktop -> Quay lại tab thi.
  - Màn hình lập tức bật pop-up cảnh báo màu đỏ: **"Cảnh Báo Vi Phạm Quy Chế Thi: Bạn vừa chuyển tab (1/3)"**.
* **Thao tác Web (Nộp bài & Đua Top):**
  - Bấm nút **"Nộp bài thi"** -> Điểm số được chấm tự động: ví dụ `8.8/10 điểm` kèm cấp mã chứng chỉ số.
  - Nhìn sang cột phải: **"Bảng Xếp Hạng Tuần"** lập tức cập nhật tên học viên lên top đầu.
  - Cuộn xuống **"Cửa hàng đổi quà XP"**: Nhấp nút đổi vật phẩm *"Streak Freeze (Bảo lưu chuỗi ngày học)"* tốn 200 XP -> Số dư XP cập nhật tức thời.
* **Thao tác GUI Tool:**
  - Mở **RedisInsight** -> Key `exam:670000000000000000000040:leaderboard` (kiểu **Sorted Set / ZSET**) -> Điểm số `8.8` của thí sinh được xếp hạng ngay tại đỉnh.
  - Mở **MongoDB Compass** -> Collection `results` -> Xuất hiện bản ghi nộp bài mới nhất với đầy đủ thời gian và câu đúng.
* **Lời thoại thuyết minh:**
  > *"Tại phòng thi trực tuyến, từng đáp án học viên chọn được lưu tức thời vào **Redis Hash** với độ trễ < 2ms để phòng ngừa mất điện hay đứt cáp mạng. Hệ thống giám sát **Anti-Cheat** theo dõi hành vi chuyển tab: khi học viên rời tab làm bài, sự kiện vi phạm được ghi nhận ngay vào Cassandra và cảnh báo 1/3.*
  >
  > *Khi nộp bài thi, hệ thống sử dụng `Promise.allSettled` chấm điểm tự động, lưu kết quả vĩnh viễn vào MongoDB và đồng thời cập nhật điểm vào **Redis Sorted Set (ZSET)**. Bảng xếp hạng tuần được render lại theo thời gian thực mà không cần query lại CSDL đĩa, bảo đảm chịu tải hàng ngàn thí sinh thi cùng lúc.*
  >
  > *Sau đây, bạn Gia Huy sẽ tiếp tục demo phần Big Data Cassandra và đồ thị tri thức Neo4j."*

---

### 🟢 PHẦN 2B: LỚP HỌC VIDEO, CASSANDRA TELEMETRY & ĐỒ THỊ TRI THỨC NEO4J (2:50 – 4:40)
* **Người thực hiện:** **Võ Huỳnh Gia Huy**
* **Màn hình hiển thị:** Web EduPro [http://localhost:5050](http://localhost:5050) chuyển tab song song với **TablePlus (Cassandra)** và **Neo4j Browser**.

#### 1. Lớp học tương tác & Chuỗi thời gian Telemetry trên Apache Cassandra (2:50 – 3:45)
* **Thao tác Web:**
  - Chọn một khóa học -> Bấm **"Vào học ngay"** để chuyển sang giao diện Phòng học (Classroom).
  - Bấm Play video bài giảng -> Tua video đến giây 45, giây 90.
  - Bấm nút **"Tải tài liệu đính kèm"** để xem handout bài học PDF được nạp từ MongoDB.
  - Bấm sang tab **"Bảng điều khiển Giám sát"** (Analytics) -> Xem mục **"Video Retention Analytics"**: Biểu đồ đường cong tỷ lệ giữ chân người xem video theo từng mốc thời gian hiển thị trực quan.
* **Thao tác GUI Tool:**
  - Mở **TablePlus** -> Chọn kết nối Cassandra `elearning_tracking` -> Mở bảng `learning_events`.
  - Chạy câu lệnh CQL:
    ```sql
    SELECT student_id, event_time, course_id, event_type, video_progress, duration_seconds 
    FROM learning_events 
    WHERE student_id = '2001230589' 
    LIMIT 5;
    ```
  - Chỉ rõ các bản ghi sự kiện `VIDEO_PLAY`, `VIDEO_PROGRESS` vừa được bắn vào với mốc `event_time` chính xác theo từng giây.
* **Lời thoại thuyết minh:**
  > *"Em là Võ Huỳnh Gia Huy, xin phép trình bày phân hệ xử lý dữ liệu lớn với Apache Cassandra và CSDL đồ thị Neo4j.*
  >
  > *Trong phòng học trực tuyến, mỗi khi học viên phát video, trình duyệt tự động gửi các gói tin Heartbeat chuỗi thời gian về backend. **Apache Cassandra** với kiến trúc phân tán Masterless và cấu trúc LSM-Tree được chọn để xử lý luồng ghi khổng lồ này.*
  >
  > *Như Thầy Cô thấy trên TablePlus, bảng `learning_events` được thiết kế tối ưu với Partition Key là `student_id` và Clustering Key là `event_time DESC`. Dữ liệu được ghi thẳng vào CommitLog và Memtable với tốc độ trên 2.500 lượt ghi/giây. Từ nguồn dữ liệu này, hệ thống vẽ biểu đồ đường cong giữ chân video (Retention Curve) giúp giảng viên nắm bắt được đoạn nào bài giảng hấp dẫn hoặc gây khó hiểu cho người học."*

#### 2. Bản đồ tri thức kỹ năng & Bạn Cùng Tiến trên Neo4j (3:45 – 4:40)
* **Thao tác Web:**
  - Bấm vào menu **"Bản Đồ Tri Thức"** (Knowledge Graph).
  - Web hiển thị đồ thị mạng lưới kỹ năng ngôn ngữ bằng thư viện Vis.js: Các nốt `Course`, `Lesson`, `Topic`, `Skill` liên kết trực quan.
  - Bấm vào một nốt bài học -> Hệ thống hiển thị pop-up: *"Lộ trình đề xuất: LESSON_01 ➔ LESSON_02 ➔ LESSON_03"*.
  - Cuộn xuống mục **"Mạng Lưới Bạn Cùng Tiến (Study Buddies)"**: Hiển thị danh sách các bạn học được gợi ý kèm độ tương thích (Match 96%, 92%) và nút "Kết nối học tập".
* **Thao tác GUI Tool:**
  - Mở **Neo4j Desktop / Browser** -> Chạy câu lệnh Cypher:
    ```cypher
    MATCH (s:Student {id: '2001230589'})-[:ENROLLED_IN]->(c:Course)<-[:ENROLLED_IN]-(buddy:Student)
    WHERE buddy <> s
    RETURN buddy.fullName AS BanHoc, buddy.targetBand AS MucTieu, c.name AS KhoaHocChung;
    ```
  - Neo4j trả về đồ thị trực quan nối giữa sinh viên Trọng Nguyên với các bạn học Khôi Nguyên, Gia Huy qua các cạnh `ENROLLED_IN`.
* **Thao tác Web (Realtime SSE):**
  - Quay lại web, nhấp bot **EduPro Smart AI Copilot** ở góc dưới phải -> Bấm nút gợi ý *"Hôm nay tôi nên học gì để đạt IELTS 7.5+?"* -> AI Copilot trả lời ngay lập tức thông tin tổng hợp từ Neo4j và MongoDB.
* **Lời thoại thuyết minh:**
  > *"Tiếp theo là **Bản đồ tri thức Neo4j**. Thay vì các bảng quan hệ nhiều khóa ngoại chậm chạp, toàn bộ lộ trình học từ CEFR A1 đến C2 được mô hình hóa dưới dạng Đồ thị thuộc tính (Labeled Property Graph). Khi học viên chọn một bài học, câu lệnh Cypher duyệt quan hệ `[:PREREQUISITE_OF*]` chỉ mất 5.8ms để trả về chuỗi bài học tiên quyết.*
  >
  > *Đặc biệt, tính năng **Bạn Cùng Tiến (Study Buddies)** sử dụng giải thuật đồ thị Co-enrollment Pattern Matching trên Neo4j để tìm kiếm những bạn học có chung mục tiêu Band điểm và cùng đăng ký khóa học tương tự. Ngoài ra, trợ lý **EduPro Smart AI Copilot** góc dưới phải cho phép học viên tra cứu tự động từ cả 4 nguồn CSDL.*
  >
  > *Sau đây, bạn Trọng Nguyên sẽ tiếp tục phần quản trị CMS, an ninh Redis và sao lưu phục hồi."*

---

### 🟢 PHẦN 3: QUẢN TRỊ CMS, TƯỜNG LỬA REDIS & PHỤC HỒI DỮ LIỆU (4:40 – 5:50)
* **Người thực hiện:** **Nguyễn Trọng Nguyên** (Trưởng nhóm)
* **Màn hình hiển thị:** Web EduPro Dashboard Quản trị [http://localhost:5050](http://localhost:5050) chuyển tab song song với **RedisInsight** và **MongoDB Compass**.

#### 1. Đăng nhập Giảng viên/Admin & Quản trị CMS Đề thi (4:40 – 5:15)
* **Thao tác Web:**
  - Bấm avatar -> Chọn Đăng xuất -> Đăng nhập tài khoản Admin: `admin` / `admin123`.
  - Thanh menu xuất hiện thêm mục **"Bảng Điều Khiển CMS"**.
  - Vào mục Quản lý đề thi -> Nhấp chỉnh sửa câu hỏi số 1: Sửa nội dung câu hỏi hoặc đáp án giải thích -> Bấm **"Lưu thay đổi"**.
* **Thao tác GUI Tool:**
  - Mở **MongoDB Compass** -> Collection `questions` -> Nhấn Refresh -> Nội dung câu hỏi vừa sửa được cập nhật ngay lập tức.
* **Lời thoại thuyết minh:**
  > *"Em xin tiếp tục với phân hệ Quản trị viên và Giảng viên. Khi đăng nhập với tài khoản `admin`, hệ thống kiểm tra phân quyền RBAC và mở khóa bảng điều khiển CMS.*
  >
  > *Giảng viên có thể chỉnh sửa cấu trúc khóa học, ngân hàng câu hỏi đề thi trực tiếp trên giao diện. Khi lưu, MongoDB cập nhật document câu hỏi và backend tự động xóa khóa cache liên quan trên Redis, đảm bảo học viên luôn nhận được nội dung mới nhất mà không gặp lỗi stale cache."*

#### 2. Tường lửa Redis Sliding Window & Sao lưu phục hồi (5:15 – 5:50)
* **Thao tác Web:**
  - Cuộn xuống phần **"Giám Sát Hạ Tầng & Tường Lửa NoSQL"**:
    - Mục **Trạng thái 4 CSDL:** Cả 4 đèn xanh hiển thị MongoDB (Live Native), Redis (Cache Ready), Cassandra (CQL Connected), Neo4j (Bolt Active).
    - Mục **Tường lửa Redis:** Hiển thị lưu lượng truy cập, số lượng request/phút (Sliding Window 120 RPM) và danh sách IP bị cách ly.
    - Bấm nút **"Kiểm tra Tường lửa"** -> Hệ thống hiển thị mô phỏng chặn tấn công DoS khi vượt quá 120 req/phút.
    - Mục **Sao lưu dữ liệu:** Bấm **"Tạo bản sao lưu hợp nhất 4 CSDL"** -> Hệ thống xuất gói backup an toàn.
* **Thao tác GUI Tool:**
  - Mở **RedisInsight** -> Chỉ vào key `security:ratelimit:ip:...` (kiểu Sorted Set với timestamp tính bằng mili-giây) và key `security:blacklist:ips`.
* **Lời thoại thuyết minh:**
  > *"Để bảo vệ nền tảng trước các cuộc tấn công Brute-force hoặc DDoS, backend tích hợp **Tường lửa Redis Sliding Window** với ngưỡng 120 request/phút. Mỗi request được ghi nhận một timestamp dạng score vào Sorted Set. Khi phát hiện IP gửi quá tần suất cho phép, Redis tự động từ chối bằng mã lỗi HTTP 429 và đưa IP vào danh sách đen.*
  >
  > *Về sao lưu và phục hồi: Hệ thống xây dựng module sao lưu hợp nhất (mongodump, redis RDB, cqlsh snapshot, neo4j dump). Kịch bản thực nghiệm chứng minh khi gặp sự cố, toàn bộ 1.000 bản ghi được phục hồi nguyên vẹn 100% trong vòng dưới 4.5 giây."*

---

### 🟢 PHẦN 4: ĐÁNH GIÁ HIỆU NĂNG, HẠN CHẾ & LỜI KẾT (5:50 – 6:30)
* **Người thực hiện:** **Nguyễn Trọng Nguyên** (hoặc cả 3 thành viên cùng xuất hiện)
* **Màn hình hiển thị:** Bảng tổng kết kết quả Benchmark (Bảng 7.2 trong Báo cáo) và Slide lời cảm ơn.

**Lời thoại thuyết minh:**
> *"Kính thưa Thầy Cô, qua quá trình đo kiểm tải với k6 và autocannon, hệ thống EduPro Academy đã chứng minh tính ưu việt vượt trội của kiến trúc Polyglot NoSQL:*
> - *Độ trễ đọc danh mục khóa học với Redis Cache đạt p95 chỉ **3.8 mili-giây**, vượt xa mục tiêu NFR đề ra.*
> - *Thông lượng ghi nhật ký học tập trên Cassandra đạt trên **2.480 request/giây** mà không gây nghẽn cổ chai.*
> - *Khả năng chịu lỗi: Hệ thống tích hợp cơ chế In-Memory Fallback tự động, giúp toàn bộ ứng dụng vẫn vận hành liên tục ngay cả khi một node CSDL gặp sự cố tạm thời.*
>
> *Về mặt hạn chế: Hiện tại hệ thống chưa tích hợp công cụ tìm kiếm toàn văn chuyên sâu và mô hình Vector Database. Trong phiên bản tiếp theo, nhóm dự kiến sẽ tích hợp **Elasticsearch** cho Full-text search tài liệu học thuật và **Milvus** để nâng cấp trợ lý AI Copilot với công nghệ Retrieval-Augmented Generation (RAG).*
>
> *Nhóm 18 xin trân trọng cảm ơn Thầy Cô trong Bộ môn Công nghệ Phần mềm & CSDL Khoa CNTT - HUIT đã tận tình hướng dẫn và định hướng cho nhóm trong suốt học kỳ vừa qua. Nhóm em rất mong nhận được những góp ý quý báu của Thầy Cô để hoàn thiện đề tài hơn nữa. Em xin chân thành cảm ơn!"*

---

# 📋 CHECKLIST PHÂN CÔNG CHUẨN BỊ CHI TIẾT CHO TỪNG THÀNH VIÊN

### 1. Nguyễn Trọng Nguyên (Trưởng nhóm):
- [ ] Chạy server backend Node.js (`Chay_He_Thong.bat`) và chuẩn bị trình duyệt ở [http://localhost:5050](http://localhost:5050).
- [ ] Soạn sẵn slide hoặc hình ảnh sơ đồ kiến trúc 4 NoSQL để mở ở 30 giây đầu tiên.
- [ ] Quay đoạn mở đầu (0:00 - 1:05), đoạn CMS/Tường lửa (4:40 - 5:50) và đoạn kết luận (5:50 - 6:30).

### 2. Phạm Nguyễn Khôi Nguyên:
- [ ] Mở sẵn **MongoDB Compass** (collection `users`, `courses`, `results`) và **RedisInsight** (mục Keys).
- [ ] Luyện tập thao tác: Đăng nhập `student_nguyen` ➔ Đăng ký khóa học VietQR ➔ Làm bài thi 3 câu ➔ Chuyển tab gây lỗi Anti-Cheat ➔ Nộp bài ➔ Xem BXH ZSET và đổi Streak Freeze trong Shop XP.
- [ ] Quay màn hình phân đoạn (1:05 - 2:50) kèm lồng tiếng rõ ràng.

### 3. Võ Huỳnh Gia Huy:
- [ ] Mở sẵn **TablePlus** (kết nối Cassandra, mở sẵn tab truy vấn `learning_events`) và **Neo4j Desktop / Browser** (mở sẵn `http://localhost:7474`).
- [ ] Luyện tập thao tác: Vào lớp học phát video ➔ Query Cassandra thấy log `video_progress` ➔ Mở Bản đồ tri thức ➔ Chạy Cypher tìm Bạn Cùng Tiến ➔ Nhấp thử AI Copilot.
- [ ] Quay màn hình phân đoạn (2:50 - 4:40) kèm lồng tiếng rõ ràng.

### 4. Hậu kỳ & Nộp bài:
- [ ] Ghép 3 clip theo đúng timeline (bằng CapCut, Premiere hoặc Camtasia).
- [ ] Thêm nhạc nền nhẹ nhàng (âm lượng 5-10% để tiếng nói rõ ràng).
- [ ] Xuất video định dạng MP4 Full HD 1080p -> Upload lên Google Drive / YouTube (chế độ Không công khai) -> Dán đường link vào tệp `07_Video_Demo/LINK_VIDEO_DEMO.txt`!
