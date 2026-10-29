# -*- coding: utf-8 -*-
"""
CHƯƠNG 4: ĐẶC TẢ THIẾT KẾ PHẦN MỀM (SDS) - EDUPRO ACADEMY
Khung chuẩn IEEE 1016 và mẫu quy định REFS_NoSQL_SRS&SDS_Template.docx.
Tuân thủ 100% thể thức Khoa CNTT - HUIT.
Thiết kế chi tiết cho kiến trúc đa mô hình NoSQL Polyglot Persistence (Redis, MongoDB, Cassandra, Neo4j).
"""

def add_chapter_4(doc, helpers):
    add_heading_chapter = helpers['add_heading_chapter']
    add_heading_level1 = helpers['add_heading_level1']
    add_heading_level2 = helpers['add_heading_level2']
    add_heading_level3 = helpers['add_heading_level3']
    add_paragraph_huit = helpers['add_paragraph_huit']
    add_bullet_level1 = helpers['add_bullet_level1']
    add_bullet_level2 = helpers['add_bullet_level2']
    create_huit_table = helpers['create_huit_table']
    add_figure_title = helpers['add_figure_title']

    # Ngắt trang sang Chương 4
    doc.add_page_break()

    # =============================================================
    # TIÊU ĐỀ CHƯƠNG 4
    # =============================================================
    add_heading_chapter(doc, "CHƯƠNG 4: ĐẶC TẢ THIẾT KẾ PHẦN MỀM (SDS)")

    add_paragraph_huit(
        doc,
        "Chương 4 tập trung vào việc hiện thực hóa các yêu cầu chức năng, phi chức năng và danh mục 16 mẫu truy cập dữ liệu (Access Patterns - AP) đã được xác lập ở Chương 3 thành một bản thiết kế kỹ thuật chi tiết theo chuẩn IEEE 1016. Quy tắc vàng xuyên suốt chương này là: Mỗi Access Pattern (AP-01 đến AP-16) đều phải được đáp ứng bởi một cấu trúc dữ liệu cụ thể (Redis Key Pattern, MongoDB Collection & Compound Index, Cassandra Table & Partition Key, hoặc Neo4j Cypher Pattern), và mọi quyết định lựa chọn CSDL đều phải có cơ sở kỹ thuật gắn liền với các ràng buộc về độ trễ, thông lượng và tính nhất quán.",
        "Mục tiêu và nguyên lý thiết kế: "
    )

    # -------------------------------------------------------------
    # 4.1. KIẾN TRÚC TỔNG THỂ
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.1. Kiến trúc tổng thể")

    add_heading_level2(doc, "4.1.1. Sơ đồ kiến trúc logic đa tầng")
    add_paragraph_huit(
        doc,
        "Hệ thống EduPro Academy được thiết kế theo mô hình kiến trúc phân tầng Micro-Monolith tối ưu hóa, chia thành 4 lớp độc lập: Lớp Trình diễn (Presentation Layer), Lớp Điều phối & Định tuyến (API Gateway & Routing Layer), Lớp Nghiệp vụ (Business Logic Service Layer) và Lớp Lưu trữ đa mô hình (Polyglot Persistence Data Layer).",
        "Mô hình kiến trúc đa tầng: "
    )
    add_bullet_level1(doc, "Lớp Trình diễn (Client Layer): Ứng dụng Web Single/Multi-Page tương tác cao viết bằng Vanilla JavaScript ES6 Modular, tương tác với máy chủ thông qua giao thức bảo mật HTTPS RESTful APIs và WebSockets thời gian thực.")
    add_bullet_level1(doc, "Lớp Cổng API và Tường lửa (API Gateway & Security Layer): Sử dụng Express.js kết hợp tầng Middleware kiểm tra xác thực JWT, phân quyền vai trò (Role-Based Access Control) và tường lửa giới hạn tần suất truy cập (Sliding Window Rate Limiter) 120 req/phút được quản lý trực tiếp trên Redis.")
    add_bullet_level1(doc, "Lớp Dịch vụ Nghiệp vụ (Business Logic Services): Bao gồm các module độc lập xử lý xác thực tài khoản (Auth Service), quản lý đào tạo (Course & Lesson Service), tổ chức và chấm thi tự động (Exam Engine Service), thu thập phân tích chuỗi thời gian (Telemetry & Violation Service), gợi ý đồ thị tri thức (Graph & Peer Recommendation Service) và đổi quà tích lũy (Gamification Service).")
    add_bullet_level1(doc, "Lớp Lưu trữ Đa mô hình NoSQL (Polyglot Persistence Layer): Tích hợp đồng thời 4 hệ CSDL chuyên biệt nhằm phát huy tối đa thế mạnh bản địa của từng công nghệ.")

    add_heading_level2(doc, "4.1.2. Sơ đồ triển khai vật lý và phân bổ cổng mạng")
    add_paragraph_huit(
        doc,
        "Toàn bộ các thành phần dịch vụ và cơ sở dữ liệu được container hóa hoàn toàn bằng Docker Engine và điều phối thống nhất thông qua tệp cấu hình docker-compose.yml. Các cổng mạng được cô lập trong mạng ảo Docker Network 'elearning_network' và chỉ công khai các cổng cần thiết:",
        "Mô hình triển khai container hóa: "
    )
    add_bullet_level1(doc, "Container Web & API Server (Node.js 18.x LTS): Lắng nghe tại cổng 3000 (HTTP/REST/WebSockets).")
    add_bullet_level1(doc, "Container MongoDB Community Server (v6.0): Lắng nghe tại cổng 27017, quản trị qua MongoDB Compass.")
    add_bullet_level1(doc, "Container Redis Stack Server (v7.0): Lắng nghe tại cổng 6379, quản trị qua Redis Insight / TablePlus.")
    add_bullet_level1(doc, "Container Apache Cassandra (v4.1): Lắng nghe tại cổng 9042 (CQL Native Transport), quản trị qua cqlsh / TablePlus.")
    add_bullet_level1(doc, "Container Neo4j Community Server (v5.12): Lắng nghe tại cổng 7474 (HTTP Web Browser) và cổng 7687 (Bolt Binary Protocol).")

    # -------------------------------------------------------------
    # 4.2. LỰA CHỌN LOẠI CSDL (MA TRẬN QUYẾT ĐỊNH)
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.2. Lựa chọn loại CSDL (Ma trận quyết định)")
    add_paragraph_huit(
        doc,
        "Để tránh việc áp dụng công nghệ theo cảm tính, mỗi nhóm dữ liệu và mẫu truy cập (Access Pattern) trong hệ thống đều được cân nhắc kỹ lưỡng thông qua Ma trận quyết định kỹ thuật (Decision Matrix). Bảng 4.1 trình bày rõ lý do lựa chọn công nghệ và các phương án đã bị loại bỏ:",
        "Nguyên tắc lựa chọn công nghệ: "
    )

    create_huit_table(
        doc,
        "Bảng 4.1: Ma trận quyết định lựa chọn CSDL cho từng nhóm dữ liệu",
        ["Nhóm dữ liệu / AP", "CSDL lựa chọn", "Lý do kỹ thuật cốt lõi", "Phương án đã loại và nguyên nhân loại bỏ"],
        [
            [
                "Tài khoản, Khóa học, Ngân hàng đề thi, Kết quả thi (AP-01, AP-02, AP-03, AP-09, AP-10, AP-15)",
                "MongoDB\n(Document Store)",
                "Mô hình tài liệu JSON/BSON linh hoạt, hỗ trợ cấu trúc phân cấp lồng nhau (Embedded Lessons), schema tự do theo môn học, hỗ trợ toán tử mảng mạnh mẽ và Aggregation Pipeline phân tích kết quả.",
                "RDBMS (MySQL/PostgreSQL): Đòi hỏi chuẩn hóa nhiều bảng, phát sinh phép JOIN phức tạp gây nghẽn hiệu năng khi tải danh mục bài học và đề thi 40 câu hỏi trắc nghiệm."
            ],
            [
                "Bộ nhớ đệm khóa học, Phiên thi đếm ngược, Lưu đáp án tức thời, Bảng xếp hạng tuần, Tường lửa (AP-02, AP-05, AP-06, AP-08, AP-09, AP-16)",
                "Redis\n(Key-Value In-Memory)",
                "Vận hành hoàn toàn trên RAM với độ trễ cực thấp (< 5 ms), hỗ trợ cơ chế tự hủy dữ liệu theo thời gian (TTL) cho phiên thi và cache, cấu trúc Sorted Set (ZSET) xếp hạng O(log N) tự động, cấu trúc Hash lưu đáp án độc lập.",
                "MongoDB: Mặc dù có hỗ trợ TTL Index nhưng cơ chế dọn dẹp chạy theo chu kỳ 60s (background task), không đảm bảo độ chính xác từng giây cho đồng hồ thi đếm ngược; ghi đáp án RAM nhanh hơn 10 lần so với ghi đĩa."
            ],
            [
                "Nhật ký xem video từng giây (Heartbeat), Nhật ký vi phạm rời phòng thi Anti-cheat (AP-04, AP-07, AP-14)",
                "Apache Cassandra\n(Wide-Column Time-Series)",
                "Kiến trúc Masterless phi tập trung với công cụ lưu trữ tối ưu hóa ghi (LSM-Tree), thông lượng ghi dồn dập hàng nghìn events/s, partition theo khóa ghép (student_id, lesson_id), hỗ trợ TTL tự động xóa log vi phạm.",
                "MongoDB / Redis: MongoDB sẽ nhanh chóng phình to dung lượng Index và phát sinh phân mảnh ổ đĩa khi ghi hàng chục triệu bản ghi log; Redis sẽ gây cạn kiệt RAM đắt đỏ nếu lưu trữ lịch sử xem video dài ngày."
            ],
            [
                "Đồ thị điều kiện tiên quyết môn học, Khai phá Bạn Cùng Tiến đồng ghi danh (AP-12, AP-13)",
                "Neo4j\n(Labeled Property Graph)",
                "Tối ưu hóa tuyệt đối cho việc duyệt liên kết mạng lưới (Index-Free Adjacency) với ngôn ngữ Cypher trực quan, giải quyết bài toán tìm đường đi ngắn nhất và tìm kiếm bạn học chung khóa học với độ phức tạp O(1) theo bậc liên kết.",
                "MongoDB ($graphLookup) / RDBMS: Truy vấn đệ quy tìm kiếm lộ trình nhiều tầng (multi-hop) trên CSDL quan hệ hoặc Document cực kỳ chậm, tốn kém CPU và dễ gây tràn bộ nhớ khi mạng lưới học viên mở rộng."
            ]
        ],
        [3.0, 2.5, 4.5, 5.0]
    )

    # -------------------------------------------------------------
    # 4.3. THIẾT KẾ CSDL KEY-VALUE [REDIS]
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.3. Thiết kế CSDL Key-Value [Redis]")

    add_heading_level2(doc, "4.3.1. Quy ước đặt tên Key và Danh mục cấu trúc dữ liệu")
    add_paragraph_huit(
        doc,
        "Để tránh hiện tượng xung đột khóa (Key Collision) và dễ dàng quản lý phân vùng dữ liệu trong Redis, hệ thống áp dụng nghiêm ngặt quy ước đặt tên chuẩn: <namespace>:<domain>:<identifier>:<attribute>. Bảng 4.2 tổng hợp chi tiết các mẫu khóa Redis được thiết kế trong hệ thống:",
        "Quy ước định danh khóa Redis: "
    )

    create_huit_table(
        doc,
        "Bảng 4.2: Danh mục thiết kế các khóa Redis Key-Value trong hệ thống",
        ["Key Pattern", "Kiểu dữ liệu", "Cấu trúc & Ví dụ Value", "Thời gian sống (TTL)", "Phục vụ AP", "Lệnh Redis cốt lõi"],
        [
            ["cache:courses:all", "String (JSON)", "Chuỗi JSON nén danh mục 12 khóa học hoàn chỉnh.", "3600 giây (1 giờ)", "AP-02", "GET, SETEX"],
            ["exam:session:{studentId}", "String (JSON)", "Thông tin phiên thi: {examId, startTime, durationSeconds}.", "Theo thời lượng thi (VD: 1800s)", "AP-05", "SET, GET, TTL, DEL"],
            ["exam:answers:{studentId}", "Hash", "Field = questionId, Value = selectedOption (VD: q101 -> 'B').", "Theo thời lượng thi + 300s", "AP-06, AP-08", "HSET, HGET, HGETALL, DEL"],
            ["leaderboard:weekly", "Sorted Set (ZSET)", "Member = studentId, Score = tổng điểm thi đạt được.", "7 ngày (Chốt tuần)", "AP-09", "ZADD, ZINCRBY, ZREVRANGE, ZRANK"],
            ["blacklist:token:{jwtHash}", "String", "Giá trị 'revoked' đánh dấu token đã đăng xuất.", "Thời hạn còn lại của JWT", "AP-01", "SETEX, EXISTS"],
            ["security:ratelimit:{clientIp}", "Sorted Set (ZSET)", "Member = requestId, Score = epoch timestamp (ms).", "60 giây (Sliding Window)", "AP-16", "ZADD, ZREMRANGEBYSCORE, ZCARD"],
            ["security:blacklist", "Set", "Danh sách các địa chỉ IP bị phong tỏa tự động.", "Vĩnh viễn / Quản trị gỡ", "AP-16", "SADD, SREM, SMEMBERS"]
        ],
        [3.2, 2.0, 3.8, 1.5, 1.5, 3.0]
    )

    add_heading_level2(doc, "4.3.2. Chiến lược bộ nhớ đệm (Caching Strategy) và Vô hiệu hóa")
    add_paragraph_huit(
        doc,
        "Hệ thống áp dụng kết hợp hai chiến lược bộ nhớ đệm chính nhằm cân bằng giữa tốc độ truy xuất và tính toàn vẹn dữ liệu:",
        "Chiến lược quản lý bộ nhớ đệm: "
    )
    add_bullet_level1(doc, "Chiến lược Cache-Aside (Lazy Loading) cho danh mục khóa học (AP-02): Ứng dụng luôn kiểm tra khóa 'cache:courses:all' trước. Nếu Cache Hit, trả về dữ liệu ngay (< 5 ms). Nếu Cache Miss, đọc từ MongoDB, gửi trả client đồng thời ghi ngược vào Redis kèm TTL 3600s. Khi Giảng viên cập nhật khóa học mới qua CMS (AP-15), hệ thống chủ động gọi lệnh 'DEL cache:courses:all' để vô hiệu hóa cache (Cache Invalidation), bảo đảm lần đọc tiếp theo luôn lấy dữ liệu mới nhất.")
    add_bullet_level1(doc, "Chiến lược Write-Through kết hợp Write-Buffer cho phòng thi (AP-05, AP-06): Dữ liệu làm bài được ghi trực tiếp vào Redis Hash (exam:answers) ở tốc độ RAM. Khi nộp bài (AP-09), hệ thống mới kết xuất dữ liệu ghi vĩnh viễn vào MongoDB và xóa sạch session tạm.")

    add_heading_level2(doc, "4.3.3. Chính sách thu hồi bộ nhớ và Bền vững hóa dữ liệu")
    add_paragraph_huit(
        doc,
        "Cấu hình tham số vận hành Redis Server trong tệp redis.conf:",
        "Chính sách quản lý tài nguyên RAM: "
    )
    add_bullet_level1(doc, "Chính sách thu hồi bộ nhớ (Eviction Policy): Thiết lập maxmemory 1gb và maxmemory-policy allkeys-lru (Least Recently Used), tự động giải phóng các khóa ít sử dụng nhất khi đầy bộ nhớ, bảo đảm các tác vụ quan trọng không bị gián đoạn.")
    add_bullet_level1(doc, "Cơ chế bền vững (Persistence): Kết hợp cả RDB Snapshots (lưu bản sao định kỳ 300 giây nếu có ít nhất 100 thao tác thay đổi) và AOF (Append-Only File) với tùy chọn appendfsync everysec, bảo đảm chỉ mất tối đa 1 giây dữ liệu khi máy chủ mất điện đột ngột.")

    # -------------------------------------------------------------
    # 4.4. THIẾT KẾ CSDL DOCUMENT [MONGODB]
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.4. Thiết kế CSDL Document [MongoDB]")

    add_heading_level2(doc, "4.4.1. Danh sách Collection và Quyết định Nhúng (Embed) vs Tham chiếu (Reference)")
    add_paragraph_huit(
        doc,
        "CSDL MongoDB (tên database: elearning_nosql) quản lý 5 collections cốt lõi: users, courses, exams, questions, results. Quyết định kỹ thuật giữa việc nhúng (Embedding) hay tham chiếu (Referencing) tuân thủ chặt chẽ các mẫu thiết kế (Data Modeling Design Patterns) chuẩn của MongoDB:",
        "Phương pháp luận mô hình hóa tài liệu: "
    )
    add_bullet_level1(doc, "Mối quan hệ Course – Lessons (1-to-Few): Quyết định NHÚNG mảng danh sách bài học (lessons) vào trong tài liệu Course. Áp dụng Subset Pattern: Do một khóa học thường chỉ có từ 10 đến 30 bài học, việc nhúng toàn bộ thông tin bài học (lessonId, title, duration, videoUrl, order) giúp ứng dụng lấy trọn vẹn giáo trình chỉ trong một thao tác truy vấn đơn (Single Read Operation), loại bỏ hoàn toàn các lệnh JOIN.")
    add_bullet_level1(doc, "Mối quan hệ Exam – Questions (1-to-Many): Quyết định THAM CHIẾU (Referencing). Đề thi chỉ lưu mảng danh sách questionIds: [\"Q101\", \"Q102\", ...]. Các câu hỏi được lưu độc lập trong collection questions. Lý do: Ngân hàng câu hỏi cần được tái sử dụng qua nhiều đề thi khác nhau (IELTS Mock Test 1, IELTS Mock Test 2) và Giảng viên có thể cập nhật nội dung câu hỏi độc lập mà không cần khóa toàn bộ đề thi.")
    add_bullet_level1(doc, "Mối quan hệ User – Results (1-to-Squillions): Quyết định THAM CHIẾU. Collection results lưu trữ lịch sử thi riêng biệt kèm trường studentId làm khóa ngoại logic, tránh làm tài liệu User vượt quá giới hạn 16 MB của BSON document.")
    add_bullet_level1(doc, "Áp dụng Computed Pattern: Trong tài liệu User, trường 'xp' và 'streak' được cộng dồn trực tiếp; trong Course, các trường 'ratingAvg' và 'enrolledCount' được tính toán sẵn để phục vụ hiển thị tức thời.")

    add_heading_level2(doc, "4.4.2. Cấu trúc Document mẫu đại diện")
    add_paragraph_huit(doc, "Cấu trúc dữ liệu JSON mẫu của một tài liệu khóa học hoàn chỉnh (Collection courses):")
    add_paragraph_huit(
        doc,
        "{\n"
        "  \"_id\": \"COURSE_IELTS_INTENSIVE\",\n"
        "  \"title\": \"IELTS Intensive Mastery 7.5+\",\n"
        "  \"category\": \"IELTS\",\n"
        "  \"level\": \"B2-C1\",\n"
        "  \"price\": 1499000,\n"
        "  \"ratingAvg\": 4.9,\n"
        "  \"enrolledCount\": 1240,\n"
        "  \"lessons\": [\n"
        "    {\n"
        "      \"lessonId\": \"LES_01\",\n"
        "      \"title\": \"Writing Task 2: Cấu trúc đoạn thân bài phản biện\",\n"
        "      \"videoUrl\": \"https://cdn.edupro.vn/videos/ielts_w2_01.mp4\",\n"
        "      \"duration\": 1800,\n"
        "      \"handoutPdf\": \"https://cdn.edupro.vn/handouts/ielts_w2_01.pdf\",\n"
        "      \"order\": 1\n"
        "    }\n"
        "  ],\n"
        "  \"createdAt\": ISODate(\"2026-09-01T00:00:00Z\")\n"
        "}"
    )

    add_heading_level2(doc, "4.4.3. Bảng thiết kế chỉ mục (Indexes) theo quy tắc ESR")
    add_paragraph_huit(
        doc,
        "Chỉ mục trong MongoDB được thiết kế nghiêm ngặt theo quy tắc ESR (Equality ➔ Sort ➔ Range) để đảm bảo mọi câu truy vấn đều đạt hiệu năng tối đa (chỉ quét chỉ mục IXSCAN mà không quét toàn bảng COLLSCAN). Bảng 4.3 mô tả danh mục chỉ mục trong hệ thống:",
        "Thiết kế chỉ mục tối ưu: "
    )

    create_huit_table(
        doc,
        "Bảng 4.3: Danh mục thiết kế chỉ mục trong MongoDB theo quy tắc ESR",
        ["Collection", "Tên Index", "Các trường & Thứ tự sắp xếp (ESR)", "Loại Index", "Phục vụ AP"],
        [
            ["users", "idx_users_email_unique", "{ email: 1 }", "Unique Single Index", "AP-01"],
            ["courses", "idx_courses_category_price", "{ category: 1, price: 1 } (Equality: category, Range: price)", "Compound Index", "AP-02"],
            ["courses", "idx_courses_level_rating", "{ level: 1, ratingAvg: -1 } (Equality: level, Sort: ratingAvg)", "Compound Index", "AP-02"],
            ["questions", "idx_questions_exam_difficulty", "{ examId: 1, difficulty: 1 }", "Compound Index", "AP-05, AP-15"],
            ["results", "idx_results_student_created", "{ studentId: 1, createdAt: -1 } (Equality: studentId, Sort: createdAt)", "Compound Index", "AP-10"],
            ["results", "idx_results_exam_score", "{ examId: 1, score: -1 }", "Compound Index", "AP-09"]
        ],
        [2.5, 3.5, 4.0, 2.5, 2.5]
    )

    add_heading_level2(doc, "4.4.4. Ràng buộc Schema Validation và Kết quả phân tích Explain Plan")
    add_paragraph_huit(
        doc,
        "Để bảo vệ tính toàn vẹn dữ liệu ở cấp độ CSDL, MongoDB áp dụng $jsonSchema cho các collection trọng yếu (áp dụng qua script member2Schemas.js). Ví dụ: Collection exam_attempts bắt buộc phải có đủ trường attemptId, studentId, status thuộc ['in_progress', 'submitted', 'disqualified'] và violations có giá trị nguyên từ 0 đến 3.",
        "Xác thực dữ liệu $jsonSchema: "
    )
    add_paragraph_huit(
        doc,
        "Kết quả chạy lệnh db.courses.find({ category: 'IELTS', price: { $lte: 2000000 } }).explain('executionStats') cho thấy: stage thực thi là 'IXSCAN' trên index idx_courses_category_price, tổng số document duyệt (totalDocsExamined) bằng chính xác số document trả về (nReturned), thời gian thực thi executionTimeMillis xấp xỉ 0 ms, chứng minh thiết kế chỉ mục hoàn toàn tối ưu.",
        "Minh chứng phân tích thực thi (Explain Plan): "
    )

    # -------------------------------------------------------------
    # 4.5. THIẾT KẾ CSDL COLUMN-FAMILY [APACHE CASSANDRA]
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.5. Thiết kế CSDL Column-family [Apache Cassandra]")

    add_heading_level2(doc, "4.5.1. Nguyên tắc thiết kế hướng truy vấn và Phương pháp luận Chebotko")
    add_paragraph_huit(
        doc,
        "Khác biệt hoàn toàn với tư duy quan hệ, việc thiết kế Cassandra tuân thủ nguyên lý Query-First Design: Xuất phát từ câu hỏi truy vấn cần trả lời để tạo ra đúng một bảng phục vụ câu hỏi đó, chấp nhận trùng lặp dữ liệu (Denormalization). Quy trình thiết kế tuân theo sơ đồ Chebotko Diagram: Xác định Access Pattern ➔ Xác định Partition Key (phân tán cụm) ➔ Xác định Clustering Key (sắp xếp trên đĩa).",
        "Phương pháp luận Chebotko: "
    )

    add_heading_level2(doc, "4.5.2. Cấu trúc Bảng CQL chi tiết")
    add_paragraph_huit(doc, "Hệ thống thiết lập Keyspace 'elearning_logs' với hai bảng dữ liệu thời gian thực cốt lõi:")
    add_paragraph_huit(
        doc,
        "CREATE TABLE elearning_logs.learning_events (\n"
        "  student_id uuid,\n"
        "  lesson_id text,\n"
        "  event_time timestamp,\n"
        "  event_type text,\n"
        "  playback_position double,\n"
        "  PRIMARY KEY ((student_id, lesson_id), event_time)\n"
        ") WITH CLUSTERING ORDER BY (event_time DESC)\n"
        "  AND default_time_to_live = 31536000; -- Lưu trữ 1 năm\n\n"
        "CREATE TABLE elearning_logs.exam_violations (\n"
        "  student_id uuid,\n"
        "  exam_id text,\n"
        "  violation_time timestamp,\n"
        "  violation_type text,\n"
        "  details text,\n"
        "  PRIMARY KEY ((student_id, exam_id), violation_time)\n"
        ") WITH CLUSTERING ORDER BY (violation_time DESC)\n"
        "  AND default_time_to_live = 604800; -- Tự động xóa sau 7 ngày",
        "Câu lệnh DDL khởi tạo bảng CQL: "
    )

    add_heading_level2(doc, "4.5.3. Bảng thiết kế Partition Key, Clustering Key và Ước lượng kích thước")
    add_paragraph_huit(
        doc,
        "Một quy tắc sống còn trong Cassandra là kích thước một Partition không bao giờ được vượt quá 100 MB để tránh áp lực lên Garbage Collection của máy ảo Java. Bảng 4.4 phân tích chi tiết cấu trúc khóa và dung lượng partition dự kiến:",
        "Kiểm soát kích thước phân vùng (Partition Sizing): "
    )

    create_huit_table(
        doc,
        "Bảng 4.4: Thiết kế Partition Key, Clustering Key và ước lượng kích thước Partition",
        ["Tên bảng CQL", "Partition Key (Phân tán)", "Clustering Key (Sắp xếp vật lý)", "Phục vụ AP", "Ước lượng kích thước Partition"],
        [
            [
                "learning_events",
                "(student_id, lesson_id)\n(Khóa phân vùng ghép)",
                "event_time DESC\n(Mới nhất đứng đầu)",
                "AP-04, AP-14",
                "Mỗi bài học một học viên xem tối đa 2 giờ = 1.440 nhịp heartbeat. Mỗi dòng ~64 bytes ➔ Dung lượng partition ≈ 92 KB (Rất an toàn, < 100 MB)."
            ],
            [
                "exam_violations",
                "(student_id, exam_id)\n(Khóa phân vùng ghép)",
                "violation_time DESC\n(Mới nhất đứng đầu)",
                "AP-07",
                "Một ca thi học viên vi phạm tối đa 3 lần bị khóa bài. Mỗi dòng ~128 bytes ➔ Dung lượng partition < 1 KB (Cực kỳ nhỏ gọn)."
            ]
        ],
        [2.5, 3.5, 3.0, 2.5, 3.5]
    )

    add_heading_level2(doc, "4.5.4. Mức độ nhất quán Tunable Consistency và Chiến lược Compaction TWCS")
    add_paragraph_huit(
        doc,
        "Hệ thống khai thác tính năng tùy biến mức độ nhất quán (Tunable Consistency) của Cassandra để tối ưu hóa hiệu năng: Với thao tác ghi log xem video (AP-04), sử dụng Consistency Level ONE nhằm đạt tốc độ ghi tối đa và độ trễ thấp nhất. Với thao tác ghi nhận vi phạm thi cử (AP-07), sử dụng QUORUM để đảm bảo tính nhất quán trên đa số node trong cụm.",
        "Thiết lập độ nhất quán đọc/ghi: "
    )
    add_paragraph_huit(
        doc,
        "Về chiến lược nén dữ liệu (Compaction Strategy): Thay vì sử dụng SizeTieredCompactionStrategy (STCS) mặc định gây phân mảnh khi có TTL, hệ thống cấu hình TimeWindowCompactionStrategy (TWCS) cho cả hai bảng. TWCS nhóm các SSTable theo khoảng thời gian tạo, cho phép Cassandra giải phóng toàn bộ file SSTable ngay lập tức khi toàn bộ dữ liệu trong cửa sổ thời gian đó chạm hạn TTL mà không cần tốn chi phí đọc/ghi lại đĩa.",
        "Chiến lược nén TimeWindowCompactionStrategy: "
    )

    # -------------------------------------------------------------
    # 4.6. THIẾT KẾ CSDL GRAPH [NEO4J]
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.6. Thiết kế CSDL Graph [Neo4j]")

    add_heading_level2(doc, "4.6.1. Mô hình đồ thị thuộc tính (Labeled Property Graph - LPG)")
    add_paragraph_huit(
        doc,
        "CSDL đồ thị Neo4j được thiết kế theo mô hình Labeled Property Graph (LPG), bao gồm 4 nhãn nút (Node Labels) và 5 kiểu quan hệ có hướng (Directed Relationships). Bảng 4.5 mô tả chi tiết lược đồ đồ thị tri thức EduPro:",
        "Lược đồ đồ thị thuộc tính: "
    )

    create_huit_table(
        doc,
        "Bảng 4.5: Danh mục Node, Relationship và Ràng buộc trong đồ thị Neo4j",
        ["Thành phần LPG", "Tên Nhãn / Kiểu Quan hệ", "Danh mục thuộc tính chi tiết", "Ràng buộc toàn vẹn & Chỉ mục"],
        [
            ["Node", ":User", "id, fullName, email, targetBand, avatar", "CONSTRAINT unique_user_id ON (u.id) IS UNIQUE"],
            ["Node", ":Course", "id, title, category, level, price", "CONSTRAINT unique_course_id ON (c.id) IS UNIQUE"],
            ["Node", ":Lesson", "id, title, duration, order", "CONSTRAINT unique_lesson_id ON (l.id) IS UNIQUE"],
            ["Node", ":Category", "name, description", "CONSTRAINT unique_cat_name ON (cat.name) IS UNIQUE"],
            ["Relationship", "(:User)-[:ENROLLED_IN]->(:Course)", "enrolledAt (datetime), progressPercent (float)", "Chỉ mục theo thuộc tính enrolledAt"],
            ["Relationship", "(:Lesson)-[:PREREQUISITE_OF]->(:Lesson)", "difficultyDelta (int), isMandatory (bool)", "Quan hệ có hướng phân cấp tri thức"],
            ["Relationship", "(:Lesson)-[:PART_OF]->(:Course)", "chapterIndex (int)", "Liên kết phân cấp khóa học"],
            ["Relationship", "(:User)-[:STUDY_WITH]->(:User)", "matchedScore (float), connectedAt (datetime)", "Quan hệ kết nối bạn cùng tiến hai chiều"],
            ["Relationship", "(:Course)-[:IN_CATEGORY]->(:Category)", "—", "Phân loại chuyên mục"]
        ],
        [2.2, 3.8, 5.0, 4.0]
    )

    add_heading_level2(doc, "4.6.2. Các mẫu truy vấn Cypher cốt lõi")
    add_paragraph_huit(
        doc,
        "Truy vấn Cypher phục vụ gợi ý chuỗi bài học tiên quyết theo chiều sâu (AP-12):",
        "Mẫu Cypher duyệt lộ trình tiên quyết: "
    )
    add_paragraph_huit(
        doc,
        "MATCH path = (prereq:Lesson)-[:PREREQUISITE_OF*1..3]->(target:Lesson {id: $lessonId})\n"
        "RETURN prereq.id AS lessonId, prereq.title AS title, length(path) AS depth\n"
        "ORDER BY depth DESC;"
    )
    add_paragraph_huit(
        doc,
        "Truy vấn Cypher khai phá Bạn Cùng Tiến (Study Buddies) dựa trên đồng ghi danh khóa học (AP-13):",
        "Mẫu Cypher tìm bạn học tương đồng: "
    )
    add_paragraph_huit(
        doc,
        "MATCH (me:User {id: $userId})-[:ENROLLED_IN]->(c:Course)<-[:ENROLLED_IN]-(buddy:User)\n"
        "WHERE buddy.id <> me.id AND NOT (me)-[:STUDY_WITH]-(buddy)\n"
        "WITH buddy, count(c) AS sharedCourses\n"
        "MATCH (buddy)\n"
        "WHERE buddy.targetBand = $targetBand\n"
        "RETURN buddy.id AS id, buddy.fullName AS fullName, buddy.avatar AS avatar,\n"
        "       sharedCourses, (sharedCourses * 30 + 10) AS matchPercent\n"
        "ORDER BY matchPercent DESC LIMIT 5;"
    )

    add_heading_level2(doc, "4.6.3. Giải pháp kiểm soát Supernode và Tối ưu hóa PROFILE")
    add_paragraph_huit(
        doc,
        "Trong các hệ thống đồ thị xã hội, hiện tượng Supernode xảy ra khi một Node có số lượng liên kết quá lớn (ví dụ một khóa học miễn phí có 50.000 học viên cùng ghi danh [:ENROLLED_IN]). Khi duyệt đường đi qua Supernode, hiệu năng truy vấn sẽ giảm sút nghiêm trọng. Hệ thống giải quyết vấn đề này bằng hai giải pháp kỹ thuật:",
        "Xử lý hiện tượng Supernode: "
    )
    add_bullet_level1(doc, "Giới hạn bậc liên kết trong mệnh đề WITH / LIMIT: Thay vì mở rộng toàn bộ học viên của khóa học, câu truy vấn Cypher áp dụng kỹ thuật cắt tỉa nhánh (Pruning) lọc trước theo targetBand và giới hạn tập hợp duyệt tối đa 100 ứng viên tiềm năng.")
    add_bullet_level1(doc, "Kết quả PROFILE câu truy vấn cho thấy cơ chế sử dụng NodeIndexSeekBySpace trên nhãn User và DirectedRelationshipIndexSeek giúp chỉ số 'DbHits' giảm từ 15.000 xuống dưới 120 thao tác, thời gian thực thi trung bình chỉ 6 mili-giây.")

    # -------------------------------------------------------------
    # 4.7. ĐỒNG BỘ DỮ LIỆU GIỮA CÁC CSDL (POLYGLOT PERSISTENCE)
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.7. Đồng bộ dữ liệu giữa các CSDL (Polyglot Persistence)")

    add_heading_level2(doc, "4.7.1. Nguồn sự thật (Source of Truth) cho từng nhóm dữ liệu")
    add_paragraph_huit(
        doc,
        "Trong kiến trúc đa CSDL (Polyglot Persistence), nguyên tắc cốt lõi là mỗi nhóm dữ liệu phải có duy nhất một 'Nguồn sự thật' (Single Source of Truth - SoT) chịu trách nhiệm về tính toàn vẹn gốc. Bảng ánh xạ SoT trong hệ thống EduPro:",
        "Phân định nguồn dữ liệu chân lý: "
    )
    add_bullet_level1(doc, "MongoDB là Source of Truth cho: Thông tin tài khoản người dùng, giáo trình khóa học, ngân hàng đề thi và bảng điểm kết quả vĩnh viễn.")
    add_bullet_level1(doc, "Redis là Source of Truth cho: Trạng thái phiên thi thời gian thực, bảng câu trả lời tạm thời của học viên và bảng xếp hạng tuần.")
    add_bullet_level1(doc, "Apache Cassandra là Source of Truth cho: Toàn bộ dòng sự kiện chuỗi thời gian (Time-series Events) học tập và lịch sử vi phạm thi cử.")
    add_bullet_level1(doc, "Neo4j là Source of Truth cho: Cấu trúc liên kết mạng lưới đồ thị xã hội (quan hệ bạn học) và đồ thị phụ thuộc bài học.")

    add_heading_level2(doc, "4.7.2. Cơ chế đồng bộ hóa dữ liệu và Khả năng chịu lỗi")
    add_paragraph_huit(
        doc,
        "Để đồng bộ hóa dữ liệu giữa 4 CSDL mà không gây nghẽn tắc hoặc phát sinh bất nhất, hệ thống kết hợp hai cơ chế chuẩn mực:",
        "Cơ chế đồng bộ hóa liên CSDL: "
    )
    add_bullet_level1(doc, "Ghi kép có kiểm soát (Controlled Dual Write with Saga Pattern): Áp dụng cho luồng Nộp bài thi (AP-08, AP-09). Khi học viên nộp bài: Bước 1 ghi kết quả vào MongoDB; Bước 2 cập nhật điểm vào Redis ZSET; Bước 3 kiểm tra số vi phạm trên Cassandra để đóng biên bản. Nếu một bước thất bại, hệ thống kích hoạt cơ chế bù trừ giao dịch (Compensating Transaction) để khôi phục trạng thái an toàn.")
    add_bullet_level1(doc, "Đồng bộ qua Redis Pub/Sub: Khi hai học viên kết bạn thành công trên đồ thị Neo4j, backend phát một sự kiện (Event Publish) vào kênh 'system_notifications'. Worker nền sẽ nhận sự kiện và ghi chú thích vào MongoDB users.notifications mà không chặn luồng chính của client.")
    add_bullet_level1(doc, "Cửa sổ nhất quán cuối (Eventual Consistency Window): Hệ thống chấp nhận độ trễ lan truyền dữ liệu giữa các CSDL trong khoảng thời gian an toàn là dưới 500 mili-giây, hoàn toàn đáp ứng trải nghiệm thực tế của người dùng.")

    # -------------------------------------------------------------
    # 4.8. PHÂN TÁN, SAO CHÉP VÀ ĐỊNH LÝ CAP / PACELC
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.8. Phân tán, sao chép và định lý CAP / PACELC")
    add_paragraph_huit(
        doc,
        "Định lý CAP (Consistency, Availability, Partition Tolerance) và định lý mở rộng PACELC (nếu có Partition thì chọn Availability hay Consistency; Else nếu không có Partition thì chọn Latency hay Consistency) là cơ sở lý thuyết chuẩn xác để giải thích hành vi của 4 hệ CSDL NoSQL trong đề tài. Bảng 4.6 đối sánh chi tiết vị trí và cấu hình cụm:",
        "Định vị kiến trúc theo CAP và PACELC: "
    )

    create_huit_table(
        doc,
        "Bảng 4.6: Đối sánh 4 hệ CSDL NoSQL theo định lý CAP và PACELC",
        ["Hệ CSDL NoSQL", "Mô hình Cụm phân tán", "Chiến lược Sao chép (Replication)", "Chiến lược Phân mảnh (Sharding)", "Vị trí trong CAP & PACELC"],
        [
            [
                "MongoDB",
                "Replica Set (3 node: 1 Primary, 2 Secondary)",
                "Master-Slave sao chép qua Oplog; Cấu hình Write Concern w: 'majority', Read Preference: 'primaryPreferred'.",
                "Sharding theo Hash Shard Key trên trường studentId khi quy mô người dùng vượt quá 500.000 tài khoản.",
                "Hệ thống CP (trong PACELC: PC/EC).\nƯu tiên tính nhất quán mạnh cho dữ liệu kết quả thi và thông tin tài khoản."
            ],
            [
                "Redis",
                "Redis Sentinel / Cluster",
                "Master-Replica không đồng bộ (Asynchronous Replication) để đạt tốc độ tối đa.",
                "Phân mảnh tự động dựa trên 16.384 Hash Slots trong kiến trúc Redis Cluster.",
                "Hệ thống AP (trong PACELC: PA/EL).\nƯu tiên tính sẵn sàng cao và độ trễ cực thấp cho phiên thi RAM."
            ],
            [
                "Apache Cassandra",
                "Ring Architecture (Vòng phân tán đồng đẳng, Peer-to-Peer)",
                "NetworkTopologyStrategy với Hệ số sao chép RF = 3; Không có điểm lỗi đơn (No Single Point of Failure).",
                "Phân mảnh tự động qua thuật toán băm Murmur3Partitioner, phân bổ token đều quanh vòng tròn dữ liệu.",
                "Hệ thống AP có thể tùy biến (Tunable Consistency).\nTrong PACELC: PA/EL cho ghi log, PC/EC khi dùng QUORUM."
            ],
            [
                "Neo4j",
                "Causal Cluster\n(Core Nodes + Read Replicas)",
                "Thuật toán đồng thuận Raft Consensus giữa các Core Nodes để quản lý ghi đồ thị.",
                "Đồ thị lưu trữ nguyên khối trên từng Core Node (Graph Fabric khi mở rộng liên cụm).",
                "Hệ thống CP (trong PACELC: PC/EC).\nĐảm bảo tính toàn vẹn cấu trúc liên kết cạnh và nốt không bị mồ côi."
            ]
        ],
        [2.0, 2.5, 3.5, 3.5, 3.5]
    )

    # -------------------------------------------------------------
    # 4.9. BẢO MẬT, SAO LƯU VÀ GIÁM SÁT
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.9. Bảo mật, sao lưu và giám sát")

    add_heading_level2(doc, "4.9.1. Kiến trúc an ninh và Chống tấn công Injection")
    add_paragraph_huit(
        doc,
        "Hệ thống thiết lập hàng rào bảo mật đa lớp:",
        "Hàng rào an ninh hệ thống: "
    )
    add_bullet_level1(doc, "Xác thực và Phân quyền: Sử dụng JSON Web Token (JWT) được ký bảo mật bằng thuật toán HMAC-SHA256 với secret key mạnh. Phân quyền người dùng theo 3 vai trò (student, teacher, admin) tại tầng Route Middleware.")
    add_bullet_level1(doc, "Chống tấn công NoSQL Injection: Trong MongoDB, kẻ tấn công có thể chèn các toán tử dạng {\"$gt\": \"\"} để vượt qua kiểm tra mật khẩu. Hệ thống ngăn chặn triệt để bằng cách áp dụng Middleware bóc tách toàn bộ ký tự '$' và '.' khỏi đối tượng req.body và req.query, đồng thời mã hóa mật khẩu một chiều bằng thuật toán bcrypt với Salt Rounds = 10.")
    add_bullet_level1(doc, "Tường lửa phân tầng trên Redis: Module rateLimiter.js đếm số lượng yêu cầu theo địa chỉ IP thông qua thuật toán Sliding Window Log trên Redis Sorted Set. Nếu vượt quá 120 req/phút, hệ thống chặn ngay lập tức với mã lỗi HTTP 429 Too Many Requests và tự động thêm IP vào 'security:blacklist' nếu có dấu hiệu tấn công dồn dập.")

    add_heading_level2(doc, "4.9.2. Kế hoạch sao lưu (Backup) và Phục hồi sự cố (Disaster Recovery)")
    add_paragraph_huit(
        doc,
        "Quy trình sao lưu định kỳ bảo đảm các chỉ số an toàn dữ liệu: Thời gian phục hồi mục tiêu RTO < 30 phút và Điểm phục hồi mục tiêu RPO < 24 giờ. Lệnh và công cụ sao lưu chính thức cho từng CSDL:",
        "Kế hoạch sao lưu dự phòng: "
    )
    add_bullet_level1(doc, "MongoDB: Chạy cron-job hằng ngày thực thi lệnh 'mongodump --out=/backups/mongodb/' nén dữ liệu BSON; phục hồi nhanh bằng 'mongorestore'.")
    add_bullet_level1(doc, "Apache Cassandra: Sử dụng công cụ 'nodetool snapshot elearning_logs' để đóng băng các file SSTable vật lý mà không cần dừng dịch vụ; xuất bản sao CSV bằng 'cqlsh COPY'.")
    add_bullet_level1(doc, "Redis: Sao chép tệp dump.rdb và thư mục appendonlydir sang ổ cứng lưu trữ thứ hai.")
    add_bullet_level1(doc, "Neo4j: Sử dụng lệnh 'neo4j-admin database dump neo4j --to-path=/backups/neo4j/' để xuất toàn bộ đồ thị tri thức.")

    add_heading_level2(doc, "4.9.3. Giám sát hệ thống thời gian thực (Telemetry Dashboard)")
    add_paragraph_huit(
        doc,
        "Module '/api/telemetry/live-metrics' liên tục thăm dò trạng thái sức khỏe của cả 4 CSDL: Đo lường số lượng bản ghi, dung lượng RAM sử dụng, số kênh Pub/Sub và độ trễ truy vấn ping thực tế (Latency Milliseconds). Thông số này được hiển thị trực tiếp lên bảng điều khiển giám sát dành cho Quản trị viên.",
        "Giám sát sức khỏe hạ tầng: "
    )

    # -------------------------------------------------------------
    # 4.10. THIẾT KẾ MODULE VÀ API
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.10. Thiết kế Module và API")

    add_heading_level2(doc, "4.10.1. Kiến trúc phân tầng Controller - Service - Repository")
    add_paragraph_huit(
        doc,
        "Mã nguồn backend Node.js được tổ chức mạch lạc theo kiến trúc phân tầng chuẩn doanh nghiệp (Layered Architecture): Tầng Định tuyến (Routes/Controllers) nhận yêu cầu HTTP và kiểm tra tính hợp lệ của tham số; Tầng Dịch vụ (Services) chứa toàn bộ luật nghiệp vụ và điều phối giao dịch; Tầng Truy cập Dữ liệu (Database Drivers/Clients) thực thi các câu lệnh chuyên biệt tới từng CSDL NoSQL tương ứng.",
        "Phân tách trách nhiệm mã nguồn: "
    )

    add_heading_level2(doc, "4.10.2. Danh mục RESTful API cốt lõi")
    add_paragraph_huit(doc, "Bảng 4.7 tổng hợp danh mục các endpoint API đại diện, chỉ rõ CSDL NoSQL phụ trách và mẫu truy cập AP tương ứng:")

    create_huit_table(
        doc,
        "Bảng 4.7: Danh mục các RESTful API cốt lõi và ánh xạ CSDL phụ trách",
        ["Phương thức", "Endpoint API", "Mô tả chức năng nghiệp vụ", "Hệ CSDL phụ trách", "Phục vụ AP"],
        [
            ["POST", "/api/auth/login", "Xác thực tài khoản và cấp phát JWT token.", "MongoDB (users) + Redis", "AP-01"],
            ["GET", "/api/courses", "Lấy danh mục khóa học (ưu tiên cache).", "Redis (cache) / MongoDB", "AP-02"],
            ["GET", "/api/courses/:id", "Lấy chi tiết khóa học và danh sách bài học.", "MongoDB (courses)", "AP-03"],
            ["POST", "/api/telemetry/heartbeat", "Ghi nhận heartbeat tiến độ xem video bài giảng.", "Cassandra (learning_events)", "AP-04"],
            ["GET", "/api/exams/:id/start", "Khởi tạo phòng thi và đồng hồ đếm ngược.", "Redis (exam:session) + MongoDB", "AP-05"],
            ["POST", "/api/exams/answer", "Lưu tức thời câu trả lời của học viên vào RAM.", "Redis Hash (exam:answers)", "AP-06"],
            ["POST", "/api/telemetry/violation", "Ghi nhật ký phát hiện gian lận thi cử.", "Cassandra (exam_violations)", "AP-07"],
            ["POST", "/api/exams/submit", "Nộp bài, chấm điểm và lưu kết quả vĩnh viễn.", "MongoDB (results) + Redis ZSET", "AP-08, AP-09"],
            ["GET", "/api/peers/study-buddies", "Gợi ý bạn cùng tiến dựa trên đồ thị tri thức.", "Neo4j (Cypher Pattern)", "AP-13"],
            ["GET", "/api/graph/roadmap/:lessonId", "Lấy lộ trình bài học tiên quyết theo chiều sâu.", "Neo4j ([:PREREQUISITE_OF*])", "AP-12"],
            ["GET", "/api/gamification/leaderboard", "Lấy top 10 học viên có điểm cao nhất tuần.", "Redis ZSET (leaderboard:weekly)", "AP-09"],
            ["POST", "/api/gamification/redeem", "Đổi điểm kinh nghiệm XP lấy vật phẩm thưởng.", "MongoDB (users.xp, inventory)", "AP-11"]
        ],
        [1.6, 4.2, 4.2, 2.5, 2.5]
    )

    # -------------------------------------------------------------
    # 4.11. MA TRẬN ÁNH XẠ AP ➔ THIẾT KẾ VẬT LÝ
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.11. Ma trận ánh xạ AP ➔ Thiết kế vật lý")
    add_paragraph_huit(
        doc,
        "Bảng 4.8 là bảng tổng kết quy tắc vàng của đồ án: Đối chiếu trực tiếp 16 mẫu truy cập dữ liệu (AP-01 đến AP-16) đã xác định ở Chương 3 sang cấu trúc vật lý cụ thể và câu lệnh truy vấn thực tế trên 4 hệ CSDL NoSQL:",
        "Ánh xạ toàn diện AP sang cấu trúc vật lý: "
    )

    create_huit_table(
        doc,
        "Bảng 4.8: Ma trận ánh xạ toàn diện từ Access Pattern sang Thiết kế vật lý",
        ["Mã AP", "CSDL phụ trách", "Cấu trúc vật lý đáp ứng", "Câu lệnh / Phương thức truy vấn thực tế"],
        [
            ["AP-01", "MongoDB + Redis", "Collection users + Key blacklist:token", "db.users.findOne({ email }) && redis.exists(token)"],
            ["AP-02", "Redis + MongoDB", "Key cache:courses:all + Collection courses", "redis.get(key) || db.courses.find({ level, price })"],
            ["AP-03", "MongoDB", "Embedded Array courses.lessons", "db.courses.findOne({ _id: courseId }, { lessons: 1 })"],
            ["AP-04", "Cassandra", "Bảng CQL learning_events", "INSERT INTO learning_events (student_id, lesson_id, event_time, playback_position) VALUES (?, ?, ?, ?)"],
            ["AP-05", "Redis + MongoDB", "Key exam:session:{studentId} (TTL 1800s)", "redis.set(key, sessionData, 'EX', durationSeconds)"],
            ["AP-06", "Redis", "Key exam:answers:{studentId} (Hash)", "redis.hset(key, questionId, selectedOption)"],
            ["AP-07", "Cassandra", "Bảng CQL exam_violations (TTL 7d)", "INSERT INTO exam_violations (...) VALUES (...) USING TTL 604800"],
            ["AP-08", "Redis", "Key exam:answers:{studentId}", "redis.hgetall(key) (Đọc trọn vẹn toàn bộ bài làm để chấm điểm)"],
            ["AP-09", "MongoDB + Redis", "Collection results + ZSET leaderboard:weekly", "db.results.insertOne(res) && redis.zadd(leaderboardKey, score, studentId)"],
            ["AP-10", "MongoDB", "Collection results ($lookup questions)", "db.results.aggregate([{ $match: { _id: resId } }, { $lookup: ... }])"],
            ["AP-11", "MongoDB", "Document users (Atomic increment)", "db.users.updateOne({ _id: uid, xp: { $gte: cost } }, { $inc: { xp: -cost } })"],
            ["AP-12", "Neo4j", "Relationship [:PREREQUISITE_OF*]", "MATCH (p:Lesson)-[:PREREQUISITE_OF*]->(l:Lesson {id: $id}) RETURN p"],
            ["AP-13", "Neo4j", "Co-enrollment Pattern Matching", "MATCH (me:User)-[:ENROLLED_IN]->(c)<-[:ENROLLED_IN]-(b:User) RETURN b"],
            ["AP-14", "Cassandra", "Bảng CQL learning_events", "SELECT event_time, playback_position FROM learning_events WHERE student_id=? AND lesson_id=?"],
            ["AP-15", "MongoDB", "Collections exams, questions", "db.exams.updateOne({ _id: examId }, { $set: updateData })"],
            ["AP-16", "Redis", "ZSET security:ratelimit:{clientIp}", "redis.zadd(key, now, now) && redis.zcard(key)"]
        ],
        [1.4, 2.6, 4.5, 6.5]
    )

    # -------------------------------------------------------------
    # 4.12. MÔ HÌNH HÓA CẤU TRÚC (STRUCTURAL MODELING)
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.12. Mô hình hóa cấu trúc (Structural Modeling)")

    add_heading_level2(doc, "4.12.1. Sơ đồ lớp (Class Diagram) với các Stereotypes NoSQL")
    add_paragraph_huit(
        doc,
        "Trong các hệ thống phân tán đa mô hình, sơ đồ lớp truyền thống của UML được mở rộng bằng cách sử dụng các Stereotypes đặc thù để phân biệt rõ vị trí lưu trữ của từng lớp thực thể:",
        "Đặc tả các Stereotypes NoSQL trong Sơ đồ lớp: "
    )
    add_bullet_level1(doc, "Stereotype <<Document>>: Đại diện cho các thực thể lưu tại MongoDB (UserDocument, CourseDocument, ExamDocument, ResultDocument).")
    add_bullet_level1(doc, "Stereotype <<RedisHash>> & <<RedisSortedSet>>: Đại diện cho các đối tượng lưu trên RAM (ExamSessionState, WeeklyLeaderboard, RateLimitBucket).")
    add_bullet_level1(doc, "Stereotype <<CQLTable>>: Đại diện cho các thực thể chuỗi thời gian trên Cassandra (LearningEventRecord, ExamViolationRecord).")
    add_bullet_level1(doc, "Stereotype <<GraphNode>> & <<GraphRelationship>>: Đại diện cho các thực thể và quan hệ trên Neo4j (UserNode, CourseNode, LessonNode, EnrolledInRelation, PrerequisiteRelation).")

    add_heading_level2(doc, "4.12.2. Ánh xạ thực thể (Entity Mapping / ODM / Driver)")
    add_paragraph_huit(
        doc,
        "Thay thế cho tầng JPA/Hibernate của hệ quản trị cơ sở dữ liệu quan hệ truyền thống, ứng dụng Node.js sử dụng các thư viện Driver bản địa hiệu năng cao. Bảng 4.9 mô tả cơ chế ánh xạ giữa cấu trúc CSDL và các lớp đối tượng trong mã nguồn:",
        "Cơ chế ánh xạ thực thể: "
    )

    create_huit_table(
        doc,
        "Bảng 4.9: Bảng ánh xạ thực thể (Entity Mapping) từ CSDL sang mã nguồn Node.js",
        ["Hệ CSDL NoSQL", "Thư viện Driver / Client", "Cơ chế Ánh xạ & Cấu hình", "Ví dụ Lớp / Module trong Source Code"],
        [
            ["MongoDB", "mongodb (Native Driver) v6.0", "BSON Document Object Mapping; Validation qua $jsonSchema cấp database.", "Collection users, courses, exams trong db.js"],
            ["Redis", "ioredis v5.3", "Key-Value / Data Structure Abstraction; Kết nối Connection Pool tự động kết nối lại.", "redisClient, rateLimiter.js, examRoutes.js"],
            ["Cassandra", "cassandra-driver v4.6", "CQL Mapping Engine (Mapper API); Hỗ trợ Prepared Statements và UUID types.", "cassandraClient, telemetryRoutes.js"],
            ["Neo4j", "neo4j-driver v5.12", "Bolt Protocol Driver; Ánh xạ Node/Relationship Record sang JavaScript Objects.", "neo4jDriver, peerRoutes.js, graphRoutes.js"]
        ],
        [2.2, 3.0, 4.0, 5.8]
    )

    # -------------------------------------------------------------
    # 4.13. CÁC KỸ THUẬT NÂNG CAO
    # -------------------------------------------------------------
    add_heading_level1(doc, "4.13. Các kỹ thuật nâng cao")
    add_paragraph_huit(
        doc,
        "Để đáp ứng các tiêu chuẩn kỹ thuật khắt khe của một đồ án tốt nghiệp chuyên ngành NoSQL, hệ thống đã nghiên cứu và triển khai thành công 5 nhóm kỹ thuật phần mềm nâng cao. Bảng 4.10 tổng hợp chi tiết bài toán, giải pháp và kết quả đo đạc thực tế:",
        "Tổng kết các kỹ thuật chuyên sâu: "
    )

    create_huit_table(
        doc,
        "Bảng 4.10: Tổng hợp các kỹ thuật phần mềm nâng cao áp dụng trong đề tài",
        ["Kỹ thuật nâng cao", "Chi tiết bài toán thực tế, Giải pháp triển khai và Kết quả đo lường"],
        [
            [
                "1. Xử lý bất đồng bộ đa luồng (Async/Await & Promise.allSettled)",
                "Bài toán: Khi nộp bài thi (AP-08, 09), hệ thống phải đồng thời ghi kết quả vào MongoDB, cập nhật điểm số vào Redis ZSET và tra cứu log vi phạm trên Cassandra. Nếu xử lý tuần tự (Sequential Blocking), độ trễ sẽ bị cộng dồn lên tới hơn 150 ms.\n"
                "Giải pháp: Áp dụng Promise.allSettled() để kích hoạt đồng thời 3 tác vụ I/O song song không chặn dòng (Non-blocking I/O).\n"
                "Kết quả đo lường: Độ trễ xử lý nộp bài thi p95 giảm từ 145 ms xuống còn 32 ms (tối ưu hơn 75%)."
            ],
            [
                "2. Tác vụ chạy ngầm định kỳ (Background Workers & Cron)",
                "Bài toán: Các phiên thi quá hạn trên Redis hoặc log vi phạm cũ cần được dọn dẹp mà không làm gián đoạn luồng truy vấn của học viên.\n"
                "Giải pháp: Cài đặt module node-cron lập lịch định kỳ hằng đêm: Quét các khóa hết hạn, chốt bảng xếp hạng tuần từ Redis vào MongoDB làm dữ liệu lịch sử vĩnh viễn, kích hoạt nodetool cleanup trên Cassandra."
            ],
            [
                "3. Lập trình thời gian thực (Real-time WebSockets & Redis Pub/Sub)",
                "Bài toán: Khi có học viên kết bạn mới trên đồ thị Neo4j hoặc có vi phạm thi cử, người dùng liên quan cần nhận thông báo tức thời mà không cần liên tục gửi request thăm dò (Polling).\n"
                "Giải pháp: Kết hợp WebSockets (ws module) và cơ chế Redis Pub/Sub. Khi sự kiện xảy ra, backend phát thông điệp vào kênh Redis 'system_notifications', các kết nối WebSocket đang hoạt động sẽ nhận và đẩy ngay thông báo lên trình duyệt."
            ],
            [
                "4. Tối ưu hóa hiệu năng truy vấn CSDL",
                "Bài toán: Truy vấn danh mục khóa học lọc theo nhiều tiêu chí (trình độ, mức giá) và duyệt đồ thị lộ trình tiên quyết có nguy cơ gây thắt cổ chai khi dữ liệu lớn.\n"
                "Giải pháp: Thiết lập chỉ mục phức hợp ESR trên MongoDB (chuyển đổi COLLSCAN thành IXSCAN); Cấu hình TimeWindowCompactionStrategy (TWCS) cho Cassandra; Áp dụng kỹ thuật duyệt cắt tỉa nhánh (Pruning) trên đồ thị Cypher Neo4j."
            ],
            [
                "5. Xử lý tranh chấp dữ liệu và Race Conditions",
                "Bài toán: Nhiều học viên cùng đổi vật phẩm khuyến mãi có số lượng giới hạn hoặc học viên nộp bài thi hai lần cùng lúc do nhấn nút liên tục.\n"
                "Giải pháp: Sử dụng các thao tác nguyên tử (Atomic Operations) của Redis (lệnh HSET, ZADD và các đoạn mã Lua Scripts chạy nguyên tử đơn luồng); Trên MongoDB áp dụng toán tử $inc kết hợp điều kiện { xp: { $gte: cost } } (Optimistic Concurrency Control) ngăn chặn triệt để tình trạng điểm âm hoặc ghi đè kết quả."
            ]
        ],
        [3.5, 11.5]
    )

    add_paragraph_huit(
        doc,
        "Bản đặc tả thiết kế phần mềm (SDS) ở Chương 4 đã giải quyết toàn diện bài toán kiến trúc tổng thể, lựa chọn công nghệ, thiết kế chi tiết cấu trúc dữ liệu cho cả 4 hệ CSDL NoSQL (Redis, MongoDB, Cassandra, Neo4j), cũng như giải pháp bảo mật và đồng bộ dữ liệu phân tán. Đây là cơ sở kỹ thuật hoàn chỉnh để tiến hành cài đặt CSDL và thực thi các câu truy vấn thực tế ở Chương 5 tiếp theo.",
        "Kết luận Chương 4: "
    )
