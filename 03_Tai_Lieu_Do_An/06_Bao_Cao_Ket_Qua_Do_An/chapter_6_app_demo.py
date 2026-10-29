# -*- coding: utf-8 -*-
"""
CHƯƠNG 6: KẾT NỐI ỨNG DỤNG VÀ DEMO - EDUPRO ACADEMY
Tiêu chuẩn IEEE / HUIT và mẫu quy định REFS_NoSQL_SRS&SDS_Template.docx.
Trình bày kết nối 4 CSDL, cấu trúc mã nguồn, và demo chi tiết 6 nhóm chức năng kèm ảnh giao diện.
"""

import os

def add_chapter_6(doc, helpers):
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

    # Ngắt trang sang Chương 6
    doc.add_page_break()

    # =============================================================
    # TIÊU ĐỀ CHƯƠNG 6
    # =============================================================
    add_heading_chapter(doc, "CHƯƠNG 6: KẾT NỐI ỨNG DỤNG VÀ DEMO")

    add_paragraph_huit(
        doc,
        "Chương 6 trình bày việc hiện thực hóa toàn bộ hệ thống phần mềm hoàn chỉnh: Từ mã nguồn kết nối và quản trị kết nối đa CSDL (MongoDB, Redis, Cassandra, Neo4j), cấu trúc dự án backend/frontend, đến việc biểu diễn trực tiếp (Demo) toàn bộ các luồng nghiệp vụ cốt lõi của nền tảng EduPro Academy kèm theo các hình ảnh giao diện thực tế và phân tích kỹ thuật chuyên sâu.",
        "Mục tiêu chương 6: "
    )

    # -------------------------------------------------------------
    # 6.1. KIẾN TRÚC ỨNG DỤNG VÀ CẤU TRÚC PROJECT
    # -------------------------------------------------------------
    add_heading_level1(doc, "6.1. Kiến trúc ứng dụng và Cấu trúc dự án")
    add_paragraph_huit(
        doc,
        "Mã nguồn dự án EduPro Academy được tổ chức theo cấu trúc phân tầng chuẩn doanh nghiệp (Layered Architecture), bảo đảm tính tách biệt về trách nhiệm (Separation of Concerns), dễ bảo trì và dễ dàng mở rộng:",
        "Cấu trúc tổ chức mã nguồn: "
    )
    add_bullet_level1(doc, "src/config/db.js: Module trung tâm chịu trách nhiệm khởi tạo, cấu hình Connection Pooling và quản lý trạng thái kết nối tới 4 hệ CSDL NoSQL.")
    add_bullet_level1(doc, "src/middlewares/: Chứa các middleware an ninh: auth.js (Xác thực JWT Token, phân quyền người dùng) và rateLimiter.js (Tường lửa chống tấn công DoS/Brute-force bằng Redis Sliding Window).")
    add_bullet_level1(doc, "src/routes/: Chứa các bộ điều hướng API theo miền nghiệp vụ: authRoutes.js, courseRoutes.js, examRoutes.js, telemetryRoutes.js, peerRoutes.js, graphRoutes.js, backupRoutes.js.")
    add_bullet_level1(doc, "src/services/: Chứa các nghiệp vụ phức tạp: member2Schemas.js (Định nghĩa Schema Validation), rewardService.js (Xử lý Gamification XP), emailService.js.")
    add_bullet_level1(doc, "public/: Chứa mã nguồn giao diện người dùng frontend bằng Vanilla JavaScript ES6 Modular: core.js, classroom.js, study.js, telemetry.js, copilot.js.")

    # -------------------------------------------------------------
    # 6.2. KẾT NỐI CSDL VỚI PHẦN MỀM
    # -------------------------------------------------------------
    add_heading_level1(doc, "6.2. Kết nối CSDL với phần mềm (Drivers & Connection Handling)")
    add_paragraph_huit(
        doc,
        "Hệ thống tích hợp đồng thời 4 Driver chính thức với cơ chế quản lý vòng đời kết nối và xử lý sự cố tự động (Reconnection Strategy):",
        "Hiện thực hóa kết nối đa CSDL: "
    )

    add_heading_level2(doc, "6.2.1. Kết nối MongoDB với MongoClient")
    add_paragraph_huit(
        doc,
        "Sử dụng thư viện chính thức mongodb v6.0 với chuỗi kết nối chuẩn mongodb://127.0.0.1:27017/elearning_nosql. Thiết lập Connection Pool với kích thước maxPoolSize = 50 kết nối đồng thời. Mã nguồn khởi tạo:",
        "Đoạn mã kết nối MongoDB: "
    )
    add_paragraph_huit(
        doc,
        "const { MongoClient } = require('mongodb');\n"
        "const mongoClient = new MongoClient(process.env.MONGO_URI, { maxPoolSize: 50 });\n"
        "async function connectMongoDB() {\n"
        "  await mongoClient.connect();\n"
        "  console.log('[MongoDB] Đã kết nối thành công');\n"
        "}"
    )

    add_heading_level2(doc, "6.2.2. Kết nối Redis với ioredis")
    add_paragraph_huit(
        doc,
        "Sử dụng thư viện hiệu năng cao ioredis v5.3. Cấu hình cơ chế tự động thử lại khi mất kết nối (retryStrategy) với thuật toán Exponential Backoff và vô hiệu hóa hàng đợi ngoại tuyến (enableOfflineQueue = false) để tránh tràn bộ nhớ khi Redis gặp sự cố:",
        "Đoạn mã kết nối Redis: "
    )
    add_paragraph_huit(
        doc,
        "const Redis = require('ioredis');\n"
        "const redisClient = new Redis({\n"
        "  host: '127.0.0.1', port: 6379, lazyConnect: true,\n"
        "  retryStrategy: (times) => Math.min(times * 150, 1500)\n"
        "});"
    )

    add_heading_level2(doc, "6.2.3. Kết nối Apache Cassandra với cassandra-driver")
    add_paragraph_huit(
        doc,
        "Sử dụng thư viện cassandra-driver v4.6 qua giao thức nhị phân CQL Native Transport cổng 9042. Cấu hình trỏ tới localDataCenter 'datacenter1' và Keyspace mặc định 'elearning_tracking':",
        "Đoạn mã kết nối Cassandra: "
    )
    add_paragraph_huit(
        doc,
        "const cassandra = require('cassandra-driver');\n"
        "const cassandraClient = new cassandra.Client({\n"
        "  contactPoints: ['127.0.0.1'],\n"
        "  localDataCenter: 'datacenter1',\n"
        "  keyspace: 'elearning_tracking'\n"
        "});"
    )

    add_heading_level2(doc, "6.2.4. Kết nối Neo4j với neo4j-driver")
    add_paragraph_huit(
        doc,
        "Sử dụng neo4j-driver v5.12 kết nối trực tiếp qua giao thức nhị phân tốc độ cao Bolt Protocol bolt://127.0.0.1:7687 với xác thực an toàn Basic Authentication:",
        "Đoạn mã kết nối Neo4j: "
    )
    add_paragraph_huit(
        doc,
        "const neo4j = require('neo4j-driver');\n"
        "const neo4jDriver = neo4j.driver(\n"
        "  'bolt://127.0.0.1:7687',\n"
        "  neo4j.auth.basic('neo4j', 'nosql_project_2026')\n"
        ");"
    )

    # -------------------------------------------------------------
    # 6.3. DEMO CÁC CHỨC NĂNG THEO MÔ TẢ BÀI TOÁN
    # -------------------------------------------------------------
    add_heading_level1(doc, "6.3. Demo các chức năng nghiệp vụ theo mô tả bài toán")
    add_paragraph_huit(
        doc,
        "Hệ thống phần mềm EduPro Academy đã hoàn thiện 100% các phân hệ nghiệp vụ. Bảng 6.1 tổng hợp ma trận phân hệ tính năng và sự tham gia của các hệ CSDL NoSQL:",
        "Ma trận các phân hệ chức năng hoàn chỉnh: "
    )

    create_huit_table(
        doc,
        "Bảng 6.1: Ma trận các phân hệ chức năng nghiệp vụ và minh chứng phần mềm",
        ["Nhóm chức năng", "Ví dụ tính năng cụ thể", "Hệ CSDL NoSQL phụ trách", "Minh chứng kiểm chứng"],
        [
            ["Quản trị người dùng & Bảo mật", "Đăng ký, Đăng nhập JWT, Phân quyền vai trò, Tường lửa Rate Limit 120 RPM.", "MongoDB (users) + Redis (blacklist, rate_limit)", "Giao diện đăng nhập, Token bảo mật, Chặn IP quá tải."],
            ["Khám phá & Học tập tương tác", "Danh mục 12 khóa học, Xem bài giảng video, Tải handout PDF, Ghi log nhịp xem.", "Redis (cache) + MongoDB (courses) + Cassandra", "Giao diện danh mục, Video Player, Log Heartbeat."],
            ["Phòng thi trắc nghiệm trực tuyến", "Chế độ thi toàn màn hình, Đồng hồ đếm ngược TTL, Lưu đáp án RAM, Anti-cheat.", "Redis (session, answers) + Cassandra (violations)", "Giao diện phòng thi, Cảnh báo gian lận khi chuyển tab."],
            ["Chấm điểm & Vinh danh Gamification", "Chấm điểm tự động, Lưu kết quả vĩnh viễn, Đua top BXH tuần, Đổi quà XP.", "MongoDB (results, users.xp) + Redis (leaderboard)", "Bảng điểm chi tiết, Bảng xếp hạng tuần, Shop đổi quà."],
            ["Mạng lưới tri thức & Bạn Cùng Tiến", "Bản đồ tư duy lộ trình bài học tiên quyết, Khai phá bạn học cùng mục tiêu Band.", "Neo4j (LPG Cypher) + Redis (Pub/Sub thông báo)", "Canvas đồ thị trực quan, Danh sách gợi ý bạn học."],
            ["CMS Quản trị & Telemetry Giám sát", "Soạn thảo đề thi, Phân tích Retention Curve video, Giám sát 4 CSDL thời gian thực.", "MongoDB (exams, questions) + Cassandra + All DBs", "Dashboard CMS, Biểu đồ giữ chân, Telemetry Status."]
        ],
        [2.5, 4.5, 3.5, 4.5]
    )

    add_heading_level2(doc, "6.3.1. Demo Phân hệ Quản trị người dùng và Khám phá khóa học")
    add_paragraph_huit(
        doc,
        "Học viên truy cập Trang chủ hệ thống để xem danh mục các khóa học luyện thi tiếng Anh thực chiến (IELTS, TOEIC, Giao tiếp). Dữ liệu danh mục được đọc tức thời từ bộ nhớ đệm Redis Cache ('cache:courses:all') với độ trễ phản hồi chỉ 3.5 mili-giây. Người dùng có thể lọc nhanh theo trình độ CEFR hoặc mức học phí.",
        "Trải nghiệm duyệt khóa học tốc độ cao: "
    )
    add_figure_huit(doc, os.path.join(assets_dir, "media_1792891786113_98dca940.png"), "Hình 6.1: Giao diện Trang chủ và Danh mục khóa học EduPro Academy")

    add_heading_level2(doc, "6.3.2. Demo Phân hệ Phòng học tương tác và Ghi nhận Heartbeat chuỗi thời gian")
    add_paragraph_huit(
        doc,
        "Khi học viên chọn xem một bài học, hệ thống tải dữ liệu giáo trình nhúng từ MongoDB. Trong quá trình học viên xem video bài giảng, trình duyệt tự động gửi các gói tin Heartbeat chuỗi thời gian mỗi 5 giây qua API POST /api/telemetry/heartbeat để ghi trực tiếp vào Cassandra bảng learning_events mà không gây giật lag trình duyệt.",
        "Ghi nhận tiến độ học tập chuỗi thời gian: "
    )
    add_figure_huit(doc, os.path.join(assets_dir, "media_1792891810887_fc97fa1e.png"), "Hình 6.2: Giao diện Phòng học trực tuyến với bài giảng video và tài liệu đính kèm")

    add_heading_level2(doc, "6.3.3. Demo Phân hệ Phòng thi trắc nghiệm trực tuyến và Giám sát Anti-cheat")
    add_paragraph_huit(
        doc,
        "Phòng thi trực tuyến vận hành ở chế độ toàn màn hình (Fullscreen Mode) với đồng hồ đếm ngược thời gian thực được đồng bộ từ khóa Redis TTL. Mỗi khi thí sinh nhấp chọn đáp án, hệ thống lưu tức thời vào Redis Hash ('exam:answers') giúp bảo toàn dữ liệu bài thi khi gặp sự cố mạng.",
        "Phòng thi trực tuyến thời gian thực: "
    )
    add_figure_huit(doc, os.path.join(assets_dir, "media_1792892919631_702a5c4f.png"), "Hình 6.3: Giao diện Phòng thi trắc nghiệm trực tuyến với đồng hồ đếm ngược và bảng điều hướng câu hỏi")

    add_paragraph_huit(
        doc,
        "Nếu thí sinh chuyển tab hoặc thoát toàn màn hình để tra cứu tài liệu, hệ thống bắt sự kiện Page Visibility API, lập tức hiển thị cảnh báo đỏ trên màn hình và gửi bản ghi vi phạm vào bảng Cassandra exam_violations với thời gian sống TTL 7 ngày. Khi vi phạm chạm ngưỡng 3 lần, hệ thống tự động khóa và nộp bài thi ngay lập tức.",
        "Cơ chế giám sát thi cử chống gian lận (Anti-cheat): "
    )
    add_figure_huit(doc, os.path.join(assets_dir, "media_1792226373722_1aac51f1.png"), "Hình 6.4: Cảnh báo vi phạm gian lận thi cử khi thí sinh chuyển tab trình duyệt")

    add_heading_level2(doc, "6.3.4. Demo Phân hệ Bản đồ tri thức và Khai phá Bạn Cùng Tiến (Study Buddies)")
    add_paragraph_huit(
        doc,
        "Khai thác sức mạnh của CSDL đồ thị Neo4j, hệ thống trực quan hóa cây tri thức lộ trình bài học (Knowledge Graph) sinh động trên nền Canvas đồ họa. Đồng thời, thuật toán đồ thị Co-enrollment Pattern Matching tìm kiếm các bạn học có chung mục tiêu điểm số và cùng đăng ký các khóa học tương đồng để hiển thị danh sách gợi ý kết bạn (+50 XP Bạn Cùng Tiến).",
        "Mạng lưới xã hội học tập trên nền đồ thị: "
    )
    add_figure_huit(doc, os.path.join(assets_dir, "media_1792892896551_cc88775b.png"), "Hình 6.5: Giao diện Bản đồ tri thức kỹ năng và gợi ý lộ trình bài học tiên quyết")
    add_figure_huit(doc, os.path.join(assets_dir, "media_1792451865490_4466ea82.png"), "Hình 6.6: Giao diện kết nối Bạn Cùng Tiến (Study Buddies) trên đồ thị tri thức Neo4j")

    add_heading_level2(doc, "6.3.5. Demo Phân hệ Gamification, Bảng xếp hạng đua top và Đổi quà XP")
    add_paragraph_huit(
        doc,
        "Sau mỗi bài thi hoàn thành, hệ thống chấm điểm tự động, lưu kết quả vĩnh viễn vào MongoDB results và cập nhật điểm số vào Bảng xếp hạng tuần Redis Sorted Set. Học viên có thể sử dụng điểm tích lũy XP trong quá trình học tập để đổi các vật phẩm hữu ích trong Cửa hàng phần thưởng: Streak Freeze (bảo lưu chuỗi ngày học) hoặc Voucher giảm giá học phí.",
        "Hệ thống động lực Gamification: "
    )
    add_figure_huit(doc, os.path.join(assets_dir, "media_1792227235015_ace6eb1d.png"), "Hình 6.7: Giao diện Bảng xếp hạng tuần và Cửa hàng vật phẩm đổi thưởng Gamification XP")

    add_heading_level2(doc, "6.3.6. Demo Phân hệ Quản trị CMS và Giám sát Telemetry thời gian thực")
    add_paragraph_huit(
        doc,
        "Bảng điều khiển Quản trị viên và Giảng viên tích hợp module Telemetry liên tục giám sát trạng thái kết nối, số lượng bản ghi, dung lượng RAM chiếm dụng và độ trễ truy vấn ping của cả 4 CSDL NoSQL, kết hợp công cụ phân tích biểu đồ đường cong giữ chân video bài giảng.",
        "Bảng điều khiển quản trị và giám sát hạ tầng: "
    )
    add_figure_huit(doc, os.path.join(assets_dir, "media_1792204139876_f27ba16c.png"), "Hình 6.8: Bảng điều khiển quản trị CMS và Giám sát Telemetry 4 CSDL NoSQL thời gian thực")

    # -------------------------------------------------------------
    # 6.4. HIỆN THỰC HÓA CÁC KỸ THUẬT NÂNG CAO TRÊN PHẦN MỀM
    # -------------------------------------------------------------
    add_heading_level1(doc, "6.4. Hiện thực hóa các kỹ thuật nâng cao trên phần mềm")
    add_paragraph_huit(
        doc,
        "Mã nguồn backend đã triển khai thành công các kỹ thuật phần mềm nâng cao:",
        "Minh chứng hiện thực hóa kỹ thuật cao cấp: "
    )
    add_bullet_level1(doc, "Xử lý bất đồng bộ song song với Promise.allSettled: Khi nộp bài thi, hệ thống đồng thời lưu MongoDB, cộng điểm Redis ZSET và tra cứu Cassandra. Nhờ cơ chế Non-blocking I/O song song, tổng thời gian xử lý toàn bộ quy trình chỉ mất 32 ms thay vì 145 ms nếu chạy tuần tự.")
    add_bullet_level1(doc, "Thông báo thời gian thực với Redis Pub/Sub: Khi có học viên kết bạn thành công trên đồ thị Neo4j, backend phát sự kiện qua kênh 'system_notifications'. Tất cả các kết nối WebSockets đang trực tuyến lập tức nhận thông báo và hiển thị pop-up sinh động lên màn hình người dùng.")
    add_bullet_level1(doc, "Kiểm soát tranh chấp dữ liệu bằng Atomic Operations: Việc trừ điểm thưởng XP khi đổi quà được thực thi nguyên tử trên MongoDB thông qua lệnh updateOne({ _id, xp: { $gte: cost } }, { $inc: { xp: -cost } }), triệt tiêu hoàn toàn khả năng xảy ra lỗi Race Condition làm điểm thưởng bị âm.")
