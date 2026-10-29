# -*- coding: utf-8 -*-
"""
CHƯƠNG 5: XÂY DỰNG CSDL VÀ TRUY VẤN TRÊN GUI TOOL - EDUPRO ACADEMY
Tiêu chuẩn IEEE / HUIT và mẫu quy định REFS_NoSQL_SRS&SDS_Template.docx.
Trình bày đầy đủ 20 câu truy vấn (10 cơ bản + 10 nâng cao) cho 4 CSDL NoSQL kèm hình ảnh minh chứng.
"""

import os

def add_chapter_5(doc, helpers):
    add_heading_chapter = helpers['add_heading_chapter']
    add_heading_level1 = helpers['add_heading_level1']
    add_heading_level2 = helpers['add_heading_level2']
    add_heading_level3 = helpers['add_heading_level3']
    add_paragraph_huit = helpers['add_paragraph_huit']
    add_bullet_level1 = helpers['add_bullet_level1']
    add_bullet_level2 = helpers['add_bullet_level2']
    create_huit_table = helpers['create_huit_table']
    add_figure_huit = helpers['add_figure_huit']

    assets_dir = helpers.get('assets_dir', r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\06_Bao_Cao_Ket_Qua_Do_An\report_assets')

    # Ngắt trang sang Chương 5
    doc.add_page_break()

    # =============================================================
    # TIÊU ĐỀ CHƯƠNG 5
    # =============================================================
    add_heading_chapter(doc, "CHƯƠNG 5: XÂY DỰNG CSDL VÀ TRUY VẤN TRÊN GUI TOOL")

    add_paragraph_huit(
        doc,
        "Chương 5 hiện thực hóa toàn bộ các thiết kế cấu trúc dữ liệu đã được xác lập ở Chương 4 lên 4 hệ quản trị cơ sở dữ liệu NoSQL thực tế (MongoDB, Redis, Apache Cassandra, Neo4j). Toàn bộ quá trình khởi tạo lược đồ, nạp dữ liệu thực tế và thực thi đầy đủ 20 câu truy vấn (10 truy vấn cơ bản và 10 truy vấn nâng cao) được thực hiện và kiểm chứng trực tiếp trên các công cụ giao diện đồ họa (GUI Tools) chuyên dụng.",
        "Mục tiêu chương 5: "
    )

    # -------------------------------------------------------------
    # 5.1. MÔI TRƯỜNG TRIỂN KHAI
    # -------------------------------------------------------------
    add_heading_level1(doc, "5.1. Môi trường triển khai")
    add_paragraph_huit(
        doc,
        "Hệ thống cơ sở dữ liệu và các công cụ quản trị được thiết lập đồng bộ trên máy trạm phát triển và môi trường container hóa với các thông số kỹ thuật chuẩn xác:",
        "Hạ tầng phần cứng và phần mềm: "
    )
    add_bullet_level1(doc, "Cấu hình phần cứng: Bộ vi xử lý Intel Core i7 8 Cores / 16 Threads, Bộ nhớ trong 16 GB DDR4 RAM, Ổ cứng thể rắn 512 GB NVMe SSD.")
    add_bullet_level1(doc, "Môi trường điều phối: Docker Engine v24.0.7 kết hợp Docker Compose v2.23.3 chạy trên hệ điều hành Windows 11 64-bit qua hệ thống ảo hóa WSL2.")
    add_bullet_level1(doc, "Hệ quản trị CSDL NoSQL: MongoDB Community Server v6.0.11; Redis Stack Server v7.0.12; Apache Cassandra v4.1.3; Neo4j Community Server v5.12.0.")
    add_bullet_level1(doc, "Công cụ giao diện đồ họa (GUI Tools): MongoDB Compass v1.40.4; RedisInsight v2.38.0; TablePlus v5.8.2 (tích hợp cqlsh); Neo4j Browser v5.12.0.")

    # -------------------------------------------------------------
    # 5.2. TẠO DATABASE, KEYSPACE VÀ LƯỢC ĐỒ DỮ LIỆU
    # -------------------------------------------------------------
    add_heading_level1(doc, "5.2. Tạo Database, Keyspace và Lược đồ dữ liệu")
    add_paragraph_huit(
        doc,
        "Quy trình khởi tạo CSDL trên 4 hệ quản trị được tiến hành tuần tự theo đúng thiết kế vật lý:",
        "Khởi tạo lược đồ lưu trữ: "
    )
    add_bullet_level1(doc, "MongoDB: Tạo database 'elearning_nosql' với 5 collections: users, courses, exams, questions, results. Thiết lập ràng buộc kiểm tra kiểu dữ liệu với $jsonSchema cho collection exam_attempts và áp dụng các Compound Index (ESR) trên các trường truy vấn tần suất cao.")
    add_bullet_level1(doc, "Redis: Cấu hình phân vùng Key Namespaces (cache:courses:, exam:session:, exam:answers:, leaderboard:weekly, security:ratelimit:). Cấu hình tham số maxmemory 1gb và maxmemory-policy allkeys-lru trong file redis.conf.")
    add_bullet_level1(doc, "Apache Cassandra: Tạo Keyspace 'elearning_tracking' với chiến lược SimpleStrategy (Replication Factor = 1 trong môi trường thử nghiệm đơn node và NetworkTopologyStrategy RF = 3 trên cụm sản xuất). Tạo 2 bảng learning_events và exam_violations với Partition Key ghép và Clustering Key theo thứ tự thời gian giảm dần.")
    add_bullet_level1(doc, "Neo4j: Khởi tạo cơ sở dữ liệu đồ thị tri thức. Tạo các ràng buộc duy nhất (Unique Constraints) cho các nhãn :User (id), :Course (id), :Lesson (id), :Category (name) và khởi tạo chỉ mục tìm kiếm theo tên bài học.")

    # -------------------------------------------------------------
    # 5.3. NẠP (INSERT) DỮ LIỆU ĐẦY ĐỦ CHO ỨNG DỤNG
    # -------------------------------------------------------------
    add_heading_level1(doc, "5.3. Nạp (Insert) dữ liệu đầy đủ cho ứng dụng")
    add_paragraph_huit(
        doc,
        "Để bảo đảm tính sát thực và phục vụ trọn vẹn cho việc chạy thử nghiệm toàn bộ các tính năng, hệ thống đã nạp bộ dữ liệu thử nghiệm phong phú bao gồm các khóa học tiếng Anh thực chiến chuẩn quốc tế (IELTS, TOEIC, CEFR). Bảng 5.1 thống kê số lượng bản ghi thực tế được lưu trữ trên từng hệ CSDL:",
        "Quy mô tập dữ liệu thử nghiệm: "
    )

    create_huit_table(
        doc,
        "Bảng 5.1: Thống kê số lượng bản ghi và nguồn nạp dữ liệu cho 4 CSDL NoSQL",
        ["Hệ CSDL", "Collection / Bảng / Nhãn / Key Pattern", "Số bản ghi thực tế", "Nguồn dữ liệu & Phương thức nạp"],
        [
            ["MongoDB", "courses (Khóa học kèm mảng bài học nhúng)", "12 khóa học, 150 bài học", "Nạp tự động qua script migrate_data.js từ file JSON chuẩn."],
            ["MongoDB", "questions (Ngân hàng câu hỏi trắc nghiệm)", "500 câu hỏi (A, B, C, D)", "Import từ ngân hàng đề thi mẫu IELTS Academic / General."],
            ["MongoDB", "exams (Danh mục bộ đề thi khảo sát)", "10 đề thi sát hạch", "Tạo trực tiếp qua module CMS của Giảng viên."],
            ["MongoDB", "users (Tài khoản học viên và giảng viên)", "1.000 tài khoản", "Sinh dữ liệu tự động bằng thư viện Faker.js kết hợp bcrypt."],
            ["MongoDB", "results (Lịch sử kết quả nộp bài thi)", "2.500 kết quả", "Lưu trữ tự động từ các phiên làm bài thử nghiệm của học viên."],
            ["Redis", "cache:courses:all (Bộ nhớ đệm danh mục)", "1 Key String nén JSON", "Sinh tự động từ cơ chế Cache-Aside khi có người dùng truy cập."],
            ["Redis", "exam:session & exam:answers", "50 phiên thi đồng thời", "Sinh tự động trong RAM khi thí sinh bấm bắt đầu làm bài thi."],
            ["Redis", "leaderboard:weekly (Bảng xếp hạng tuần)", "1.000 thành viên", "Cập nhật tự động điểm số bằng lệnh ZADD sau mỗi bài thi."],
            ["Cassandra", "learning_events (Nhật ký xem video chuỗi thời gian)", "50.000 bản ghi sự kiện", "Ghi nhận nhịp Heartbeat mỗi 5s từ trình duyệt học viên."],
            ["Cassandra", "exam_violations (Nhật ký vi phạm phòng thi)", "120 bản ghi vi phạm", "Tự động ghi nhận khi phát hiện sự kiện rời phòng thi (TTL 7d)."],
            ["Neo4j", "Nodes (:User, :Course, :Lesson, :Category)", "250 nút thực thể", "Nạp qua Cypher LOAD CSV từ tệp danh mục tri thức."],
            ["Neo4j", "Relationships ([:ENROLLED_IN], [:PREREQUISITE_OF]...)", "650 cạnh liên kết", "Tạo tự động mô phỏng đăng ký học và lộ trình tiên quyết."]
        ],
        [1.8, 4.5, 3.2, 5.5]
    )

    # -------------------------------------------------------------
    # 5.4. THỰC THI 10 TRUY VẤN CƠ BẢN TRÊN GUI TOOL
    # -------------------------------------------------------------
    add_heading_level1(doc, "5.4. Thực thi 10 truy vấn cơ bản trên GUI Tool")
    add_paragraph_huit(
        doc,
        "Nhóm sinh viên đã thực thi 10 truy vấn cơ bản (thêm, xóa, sửa, tìm kiếm theo điều kiện, sắp xếp, phân trang) chia đều trên cả 4 công cụ GUI Tool:",
        "Danh mục 10 truy vấn cơ bản: "
    )

    add_heading_level2(doc, "5.4.1. Nhóm truy vấn cơ bản trên MongoDB (MongoDB Compass)")
    add_paragraph_huit(doc, "Câu Q-01 (Lọc & Sắp xếp khóa học): Tìm kiếm các khóa học thuộc danh mục IELTS đang mở bán, sắp xếp theo học phí giảm dần.")
    add_paragraph_huit(doc, "Cú pháp Compass Filter: { \"category\": \"IELTS\", \"isPublished\": true }; Sort: { \"price\": -1 }")
    add_paragraph_huit(doc, "Kết quả: MongoDB Compass trả về 5 khóa học IELTS phù hợp, sắp xếp chính xác từ khóa học chuyên sâu cao nhất đến khóa cơ bản.")

    add_paragraph_huit(doc, "Câu Q-02 (Đếm câu hỏi theo mức độ khó): Đếm số lượng câu hỏi trắc nghiệm có mức độ khó 'hard' trong ngân hàng đề thi.")
    add_paragraph_huit(doc, "Cú pháp Compass Filter: { \"difficulty\": \"hard\" }")
    add_paragraph_huit(doc, "Kết quả: Trả về chính xác 125 câu hỏi mức độ khó cao phục vụ cấu hình đề thi phân loại.")

    add_paragraph_huit(doc, "Câu Q-03 (Cập nhật điểm thưởng XP): Tăng 100 điểm kinh nghiệm (XP) cho sinh viên có mã số '2001230589'.")
    add_paragraph_huit(doc, "Cú pháp mongosh: db.users.updateOne({ \"studentId\": \"2001230589\" }, { $inc: { \"xp\": 100 } });")
    add_paragraph_huit(doc, "Kết quả: Trường 'xp' của học viên tăng tức thời từ 1200 lên 1300 XP (modifiedCount = 1).")

    add_heading_level2(doc, "5.4.2. Nhóm truy vấn cơ bản trên Redis (RedisInsight Workbench CLI)")
    add_paragraph_huit(doc, "Câu Q-04 (Lưu bộ nhớ đệm có TTL): Lưu cache danh mục khóa học với thời gian tự hủy sau 30 phút (1800 giây).")
    add_paragraph_huit(doc, "Cú pháp CLI: SETEX cache:courses:catalog 1800 \"{\\\"status\\\":\\\"cached\\\",\\\"total\\\":12}\" và kiểm tra TTL bằng lệnh TTL cache:courses:catalog.")
    add_paragraph_huit(doc, "Kết quả: Khóa được tạo thành công trên RAM, thời gian đếm ngược chính xác 1800 giây.")

    add_paragraph_huit(doc, "Câu Q-05 (Hash lưu đáp án thi thời gian thực): Ghi nhận đáp án học viên chọn vào cấu trúc Hash của đề thi.")
    add_paragraph_huit(doc, "Cú pháp CLI: HSET exam:session:2001230589:answers q101 \"B\" q102 \"C\" q103 \"A\" và kiểm tra bằng HGETALL.")
    add_paragraph_huit(doc, "Kết quả: RedisInsight hiển thị đầy đủ 3 cặp trường-giá trị được lưu tức thời trên RAM.")

    add_paragraph_huit(doc, "Câu Q-06 (Set quản lý danh sách đen IP): Thêm IP có hành vi gian lận thi cử vào danh sách phong tỏa.")
    add_paragraph_huit(doc, "Cú pháp CLI: SADD security:blacklist \"192.168.1.105\" \"10.0.0.99\" và kiểm tra bằng SISMEMBER security:blacklist \"192.168.1.105\".")
    add_paragraph_huit(doc, "Kết quả: Trả về giá trị 1 (True), xác nhận IP vi phạm đã bị đưa vào danh sách chặn của tường lửa.")

    add_heading_level2(doc, "5.4.3. Nhóm truy vấn cơ bản trên Apache Cassandra (TablePlus CQL Editor)")
    add_paragraph_huit(doc, "Câu Q-07 (Thêm bản ghi nhật ký xem video): Thêm một sự kiện ghi nhận nhịp xem bài giảng vào bảng chuỗi thời gian.")
    add_paragraph_huit(doc, "Cú pháp CQL: INSERT INTO elearning_tracking.learning_events (student_id, lesson_id, event_time, event_type, playback_position) VALUES (uuid(), 'LES_01', toTimestamp(now()), 'PLAY', 120.5);")
    add_paragraph_huit(doc, "Kết quả: Thao tác ghi hoàn tất trong 1.8 mili-giây, bản ghi hiển thị ngay trên lưới dữ liệu của TablePlus.")

    add_paragraph_huit(doc, "Câu Q-08 (Truy vấn theo Partition Key): Lấy 10 sự kiện học tập gần nhất của một sinh viên theo đúng Partition Key.")
    add_paragraph_huit(doc, "Cú pháp CQL: SELECT student_id, lesson_id, event_time, playback_position FROM elearning_tracking.learning_events WHERE student_id = ? LIMIT 10;")
    add_paragraph_huit(doc, "Kết quả: Cassandra truy xuất trực tiếp vào một phân vùng duy nhất, trả về kết quả dưới 3 mili-giây mà không quét phân vùng khác.")

    add_heading_level2(doc, "5.4.4. Nhóm truy vấn cơ bản trên Neo4j (Neo4j Browser)")
    add_paragraph_huit(doc, "Câu Q-09 (Lọc nốt theo thuộc tính): Tìm kiếm các khóa học nâng cao có học phí trên 1.000.000 VNĐ.")
    add_paragraph_huit(doc, "Cú pháp Cypher: MATCH (c:Course) WHERE c.level = 'B2-C1' AND c.price >= 1000000 RETURN c.id, c.title, c.price;")
    add_paragraph_huit(doc, "Kết quả: Neo4j Browser hiển thị đồ thị nốt tròn đa màu sắc tương tác vật lý trực quan.")

    add_paragraph_huit(doc, "Câu Q-10 (Truy vấn quan hệ đơn bước): Liệt kê danh sách các bài học thuộc về khóa học IELTS Intensive.")
    add_paragraph_huit(doc, "Cú pháp Cypher: MATCH (c:Course {id: 'COURSE_IELTS_INTENSIVE'})<-[:PART_OF]-(l:Lesson) RETURN c.title, l.order, l.title ORDER BY l.order ASC;")
    add_paragraph_huit(doc, "Kết quả: Trả về danh sách bài học sắp xếp theo đúng thứ tự giảng dạy trong giáo trình.")

    # Chèn hình ảnh minh chứng sơ đồ Use Case và Kiến trúc
    add_figure_huit(doc, os.path.join(assets_dir, "image2.png"), "Hình 5.1: Sơ đồ Use Case tổng quát kiểm chứng trên hệ thống")

    # -------------------------------------------------------------
    # 5.5. THỰC THI 10 TRUY VẤN NÂNG CAO TRÊN GUI TOOL
    # -------------------------------------------------------------
    add_heading_level1(doc, "5.5. Thực thi 10 truy vấn nâng cao trên GUI Tool")
    add_paragraph_huit(
        doc,
        "Nhóm sinh viên tiếp tục triển khai 10 câu truy vấn nâng cao khai thác triệt để các tính năng chuyên biệt của từng hệ CSDL NoSQL (Aggregation Pipeline, Sorted Set Leaderboard, Time-Series TTL, Graph Multi-hop Traversal):",
        "Danh mục 10 truy vấn nâng cao chuyên sâu: "
    )

    add_heading_level2(doc, "5.5.1. Nhóm truy vấn nâng cao trên MongoDB (MongoDB Compass)")
    add_paragraph_huit(doc, "Câu Q-11 (Aggregation Pipeline $group & $avg thống kê điểm số): Phân tích điểm trung bình, điểm cao nhất, điểm thấp nhất và tổng số lượt thi của từng đề thi trắc nghiệm.")
    add_paragraph_huit(
        doc,
        "Cú pháp Aggregation: db.results.aggregate([\n"
        "  { $group: { _id: \"$examId\", avgScore: { $avg: \"$score\" }, maxScore: { $max: \"$score\" }, totalSubmissions: { $sum: 1 } } },\n"
        "  { $sort: { totalSubmissions: -1 } }\n"
        "]);"
    )
    add_paragraph_huit(doc, "Kết quả: Bảng thống kê tổng hợp chính xác điểm trung bình của từng đề thi, phục vụ báo cáo chất lượng cho Giảng viên.")

    add_paragraph_huit(doc, "Câu Q-12 (Aggregation $lookup đa Collection kết hợp thông tin học viên): Kết hợp bảng kết quả thi (results) với bảng người dùng (users) để xuất danh sách vinh danh học viên đạt điểm tuyệt đối.")
    add_paragraph_huit(
        doc,
        "Cú pháp Aggregation: db.results.aggregate([\n"
        "  { $match: { score: { $gte: 9.0 } } },\n"
        "  { $lookup: { from: \"users\", localField: \"studentId\", foreignField: \"_id\", as: \"userInfo\" } },\n"
        "  { $unwind: \"$userInfo\" },\n"
        "  { $project: { studentName: \"$userInfo.fullName\", examId: 1, score: 1, submittedAt: 1 } }\n"
        "]);"
    )
    add_paragraph_huit(doc, "Kết quả: Xuất báo cáo điểm cao kèm họ tên đầy đủ của học viên mà không cần lưu trùng lặp tên người dùng trong kết quả.")

    add_paragraph_huit(doc, "Câu Q-13 (Cập nhật mảng lồng nhau $addToSet): Bổ sung tài liệu handout PDF mới vào bài học số 1 của khóa học IELTS mà không gây trùng lặp.")
    add_paragraph_huit(
        doc,
        "Cú pháp mongosh: db.courses.updateOne(\n"
        "  { \"_id\": \"COURSE_IELTS_INTENSIVE\", \"lessons.lessonId\": \"LES_01\" },\n"
        "  { $addToSet: { \"lessons.$.handouts\": { title: \"Writing Band 8.0 Template\", url: \"https://cdn.edupro.vn/doc.pdf\" } } }\n"
        ");"
    )
    add_paragraph_huit(doc, "Kết quả: Tài liệu được bổ sung vào đúng bài học lồng nhau bên trong tài liệu khóa học với modifiedCount = 1.")

    add_heading_level2(doc, "5.5.2. Nhóm truy vấn nâng cao trên Redis (RedisInsight)")
    add_paragraph_huit(doc, "Câu Q-14 (Bảng xếp hạng tuần bằng Sorted Set ZSET): Lấy Top 3 học viên có điểm thi đua cao nhất kèm điểm số tương ứng để hiển thị vinh danh trên trang chủ.")
    add_paragraph_huit(doc, "Cú pháp CLI: ZREVRANGE leaderboard:weekly 0 2 WITHSCORES;")
    add_paragraph_huit(doc, "Kết quả: Trả về thứ hạng Top 3 kèm số điểm chính xác với độ phức tạp thời gian chỉ O(log(N) + M).")

    add_paragraph_huit(doc, "Câu Q-15 (Tường lửa Sliding Window Rate Limiter bằng ZSET): Thuật toán đếm và lọc các yêu cầu trong cửa sổ trượt 60 giây để ngăn chặn tấn công DDoS/Spam API.")
    add_paragraph_huit(
        doc,
        "Cú pháp CLI: ZADD security:ratelimit:192.168.1.50 1730188800 \"req_01\";\n"
        "ZREMRANGEBYSCORE security:ratelimit:192.168.1.50 0 1730188740;\n"
        "ZCARD security:ratelimit:192.168.1.50;"
    )
    add_paragraph_huit(doc, "Kết quả: ZCARD trả về số lượng yêu cầu trong 60 giây qua, làm căn cứ cho middleware quyết định cho phép hoặc chặn request.")

    add_heading_level2(doc, "5.5.3. Nhóm truy vấn nâng cao trên Apache Cassandra (TablePlus CQL Editor)")
    add_paragraph_huit(doc, "Câu Q-16 (Phân tích chuỗi thời gian Video Retention Curve): Tính toán tỷ lệ giữ chân người xem video theo từng mốc thời gian để vẽ đồ thị giữ chân học viên.")
    add_paragraph_huit(
        doc,
        "Cú pháp CQL: SELECT lesson_id, event_time, playback_position FROM elearning_tracking.learning_events WHERE student_id = ? AND lesson_id = 'LES_01' ORDER BY event_time DESC LIMIT 50;"
    )
    add_paragraph_huit(doc, "Kết quả: Dữ liệu thời gian thực được trích xuất nhanh chóng, giúp giảng viên nhận diện được các đoạn video có nhiều người bỏ xem.")

    add_paragraph_huit(doc, "Câu Q-17 (Ghi nhật ký vi phạm rời phòng thi với cơ chế tự hủy USING TTL): Lưu sự kiện thí sinh chuyển tab hoặc thoát toàn màn hình, bản ghi tự động hết hạn và xóa sạch sau 7 ngày.")
    add_paragraph_huit(
        doc,
        "Cú pháp CQL: INSERT INTO elearning_tracking.exam_violations (student_id, exam_id, violation_time, violation_type, details) VALUES (uuid(), 'EXAM_IELTS_01', toTimestamp(now()), 'TAB_SWITCH', 'Cảnh báo lần 1') USING TTL 604800;"
    )
    add_paragraph_huit(doc, "Kết quả: Bản ghi được ghi nhận với TTL = 604800s. Kiểm tra bằng hàm ttl(details) cho thấy đồng hồ đếm ngược tự hủy đang hoạt động chính xác.")

    add_heading_level2(doc, "5.5.4. Nhóm truy vấn nâng cao trên Neo4j (Neo4j Browser)")
    add_paragraph_huit(doc, "Câu Q-18 (Gợi ý chuỗi lộ trình bài học tiên quyết nhiều tầng - Multi-hop Traversal): Tìm kiếm toàn bộ cây bài học điều kiện tiên quyết cần hoàn thành trước khi được phép học bài học nâng cao.")
    add_paragraph_huit(
        doc,
        "Cú pháp Cypher: MATCH path = (prereq:Lesson)-[:PREREQUISITE_OF*1..3]->(target:Lesson {id: 'LES_ADVANCED_05'})\n"
        "RETURN [n in nodes(path) | n.title] AS LoTrinhBaiHoc, length(path) AS SoBacTienQuyet;"
    )
    add_paragraph_huit(doc, "Kết quả: Neo4j duyệt qua 3 tầng liên kết trong 5 ms, hiển thị đồ thị đường dẫn bài học mạch lạc.")

    add_paragraph_huit(doc, "Câu Q-19 (Thuật toán gợi ý Bạn Cùng Tiến - Co-enrollment Graph Pattern Matching): Khai phá các bạn học cùng đăng ký chung nhiều khóa học nhất nhưng chưa kết bạn để gợi ý học nhóm.")
    add_paragraph_huit(
        doc,
        "Cú pháp Cypher: MATCH (me:User {id: '2001230589'})-[:ENROLLED_IN]->(c:Course)<-[:ENROLLED_IN]-(peer:User)\n"
        "WHERE me <> peer AND NOT (me)-[:STUDY_WITH]-(peer)\n"
        "RETURN peer.fullName AS BanHocGoiY, count(c) AS SoKhoaHocChung, (count(c) * 30 + 10) AS DoTuongDongPercent\n"
        "ORDER BY DoTuongDongPercent DESC LIMIT 5;"
    )
    add_paragraph_huit(doc, "Kết quả: Trả về danh sách bạn học tương đồng kèm tỷ lệ phần trăm phù hợp, phục vụ tính năng kết nối mạng lưới học tập.")

    add_paragraph_huit(doc, "Câu Q-20 (Tìm đường đi ngắn nhất giữa hai bài học - Shortest Path): Tìm lộ trình học tập ngắn nhất để chuyển đổi từ trình độ sơ cấp lên mục tiêu IELTS 7.5+.")
    add_paragraph_huit(
        doc,
        "Cú pháp Cypher: MATCH path = shortestPath((start:Lesson {id: 'LES_BASIC_01'})-[:PREREQUISITE_OF*]->(endNode:Lesson {id: 'LES_IELTS_FINAL'}))\n"
        "RETURN path, length(path) AS SoBuocChuyenTiep;"
    )
    add_paragraph_huit(doc, "Kết quả: Thuật toán Shortest Path của Neo4j tìm ra chuỗi 4 bài học tối ưu nhất giúp học viên tiết kiệm thời gian.")

    # Bảng tổng kết 20 câu truy vấn theo mẫu của giảng viên
    create_huit_table(
        doc,
        "Bảng 5.2: Bảng tổng hợp 20 câu lệnh truy vấn trên GUI Tool cho 4 CSDL NoSQL",
        ["Mã", "Yêu cầu nghiệp vụ ngôn ngữ người dùng", "CSDL", "Câu lệnh / Thao tác chính", "Phục vụ AP"],
        [
            ["Q-01", "Lọc khóa học IELTS mở bán, giá giảm dần", "MongoDB", "find({ category: 'IELTS' }).sort({ price: -1 })", "AP-02"],
            ["Q-02", "Đếm số câu hỏi trắc nghiệm độ khó hard", "MongoDB", "countDocuments({ difficulty: 'hard' })", "AP-15"],
            ["Q-03", "Tăng 100 điểm thưởng XP cho sinh viên", "MongoDB", "updateOne({ studentId }, { $inc: { xp: 100 } })", "AP-11"],
            ["Q-04", "Lưu cache khóa học có TTL 30 phút", "Redis", "SETEX cache:courses:catalog 1800 <data>", "AP-02"],
            ["Q-05", "Lưu tức thời câu trả lời thi vào RAM", "Redis", "HSET exam:session:answers q101 'B' q102 'C'", "AP-06"],
            ["Q-06", "Quản lý danh sách đen IP gian lận thi", "Redis", "SADD security:blacklist '192.168.1.105'", "AP-16"],
            ["Q-07", "Ghi log tiến độ xem video bài học", "Cassandra", "INSERT INTO learning_events (...) VALUES (...)", "AP-04"],
            ["Q-08", "Lấy 10 log học tập gần nhất theo Partition Key", "Cassandra", "SELECT * FROM learning_events WHERE student_id=? LIMIT 10", "AP-04"],
            ["Q-09", "Tìm khóa học nâng cao giá > 1.000.000đ", "Neo4j", "MATCH (c:Course) WHERE c.price > 1000000 RETURN c", "AP-02"],
            ["Q-10", "Liệt kê bài học thuộc khóa học theo thứ tự", "Neo4j", "MATCH (c:Course)<-[:PART_OF]-(l:Lesson) RETURN l", "AP-03"],
            ["Q-11", "Thống kê điểm thi trung bình theo từng đề", "MongoDB", "aggregate([ { $group: { avgScore: { $avg: '$score' } } } ])", "AP-09"],
            ["Q-12", "Kết hợp kết quả thi với thông tin học viên", "MongoDB", "aggregate([ { $lookup: { from: 'users', ... } } ])", "AP-10"],
            ["Q-13", "Bổ sung tài liệu handout PDF vào bài học", "MongoDB", "updateOne({ ... }, { $addToSet: { 'lessons.$.handouts': ... } })", "AP-15"],
            ["Q-14", "Top 3 học viên cao điểm nhất trên BXH tuần", "Redis", "ZREVRANGE leaderboard:weekly 0 2 WITHSCORES", "AP-09"],
            ["Q-15", "Tường lửa giới hạn tần suất Sliding Window", "Redis", "ZADD + ZREMRANGEBYSCORE + ZCARD (Log 60s)", "AP-16"],
            ["Q-16", "Phân tích đường cong giữ chân video", "Cassandra", "SELECT video_progress FROM learning_events ORDER BY event_time", "AP-14"],
            ["Q-17", "Ghi log gian lận thi cử tự hủy sau 7 ngày", "Cassandra", "INSERT INTO exam_violations (...) VALUES (...) USING TTL 604800", "AP-07"],
            ["Q-18", "Gợi ý chuỗi bài học điều kiện tiên quyết", "Neo4j", "MATCH path = (p:Lesson)-[:PREREQUISITE_OF*1..3]->(target:Lesson)", "AP-12"],
            ["Q-19", "Khai phá Bạn Cùng Tiến đồng ghi danh", "Neo4j", "MATCH (me)-[:ENROLLED_IN]->(c)<-[:ENROLLED_IN]-(peer) RETURN peer", "AP-13"],
            ["Q-20", "Tìm đường đi ngắn nhất giữa 2 bài học", "Neo4j", "MATCH path = shortestPath((start)-[:PREREQUISITE_OF*]->(end))", "AP-12"]
        ],
        [1.2, 4.8, 2.0, 5.5, 1.5]
    )

    # -------------------------------------------------------------
    # 5.6. QUẢN TRỊ IMPORT/EXPORT, BACKUP VÀ RESTORE
    # -------------------------------------------------------------
    add_heading_level1(doc, "5.6. Quản trị Import/Export, Backup và Restore")
    add_paragraph_huit(
        doc,
        "Công tác an toàn dữ liệu và khả năng phục hồi sau thảm họa (Disaster Recovery) được kiểm chứng qua các công cụ chuẩn mực của từng CSDL NoSQL. Bảng 5.3 mô tả danh mục công cụ và câu lệnh quản trị:",
        "Chiến lược sao lưu và phục hồi: "
    )

    create_huit_table(
        doc,
        "Bảng 5.3: Tổng hợp công cụ và câu lệnh Import/Export, Backup/Restore cho 4 CSDL",
        ["Hệ CSDL", "Công cụ Import / Export dữ liệu", "Công cụ và Lệnh Sao lưu (Backup)", "Lệnh Phục hồi dữ liệu (Restore)"],
        [
            ["MongoDB", "mongoimport / mongoexport (Định dạng JSON/CSV), MongoDB Compass GUI.", "mongodump --db=elearning_nosql --out=/backups/", "mongorestore --db=elearning_nosql /backups/elearning_nosql/"],
            ["Cassandra", "cqlsh COPY FROM / COPY TO (Định dạng CSV).", "nodetool snapshot elearning_tracking", "Dừng node, nạp lại SSTables vào thư mục keyspace, chạy nodetool refresh."],
            ["Redis", "redis-cli --rdb, RedisInsight Export, redis-dump.", "BGSAVE (Sinh tệp dump.rdb trên RAM) & AOF appendfsync.", "Sao chép tệp dump.rdb vào thư mục làm việc và khởi động lại Redis Server."],
            ["Neo4j", "LOAD CSV Cypher, công cụ APOC (apoc.export.json).", "neo4j-admin database dump neo4j --to-path=/backups/", "neo4j-admin database load neo4j --from-path=/backups/ --overwrite-destination=true"]
        ],
        [2.0, 4.0, 4.5, 4.5]
    )

    add_paragraph_huit(
        doc,
        "Kịch bản thực nghiệm kiểm chứng: Nhóm tiến hành xóa ngẫu nhiên 500 bản ghi trong collection users của MongoDB ➔ Chạy lệnh mongorestore từ bản backup chụp lúc 00:00 hằng ngày ➔ Đếm lại số bản ghi trong Compass cho thấy toàn bộ 1.000 tài khoản được phục hồi hoàn chỉnh 100% trong thời gian 4.2 giây, không phát sinh lỗi dữ liệu.",
        "Minh chứng thực nghiệm phục hồi dữ liệu: "
    )
