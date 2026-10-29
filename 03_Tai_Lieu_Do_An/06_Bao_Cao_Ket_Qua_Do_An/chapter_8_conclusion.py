# -*- coding: utf-8 -*-
"""
CHƯƠNG 8: KẾT QUẢ ĐẠT ĐƯỢC VÀ TỔNG KẾT HOẠT ĐỘNG NHÓM - EDUPRO ACADEMY
Tiêu chuẩn IEEE / HUIT và mẫu quy định REFS_NoSQL_SRS&SDS_Template.docx.
Trình bày đánh giá mục tiêu, đối chiếu NFR, đóng góp thành viên, bài học kinh nghiệm và hướng phát triển.
"""

def add_chapter_8(doc, helpers):
    add_heading_chapter = helpers['add_heading_chapter']
    add_heading_level1 = helpers['add_heading_level1']
    add_heading_level2 = helpers['add_heading_level2']
    add_heading_level3 = helpers['add_heading_level3']
    add_paragraph_huit = helpers['add_paragraph_huit']
    add_bullet_level1 = helpers['add_bullet_level1']
    add_bullet_level2 = helpers['add_bullet_level2']
    create_huit_table = helpers['create_huit_table']

    # Ngắt trang sang Chương 8
    doc.add_page_break()

    # =============================================================
    # TIÊU ĐỀ CHƯƠNG 8
    # =============================================================
    add_heading_chapter(doc, "CHƯƠNG 8: KẾT QUẢ ĐẠT ĐƯỢC VÀ TỔNG KẾT HOẠT ĐỘNG NHÓM")

    add_paragraph_huit(
        doc,
        "Chương 8 tổng kết toàn diện các kết quả nghiên cứu lý thuyết và sản phẩm phần mềm thực tế đã đạt được sau quá trình thực hiện đồ án, đối chiếu nghiêm túc với các mục tiêu đề ra ở Chương 1 và các chỉ số yêu cầu phi chức năng ở Chương 3. Đồng thời, chương này tổng kết quy trình làm việc nhóm, đánh giá mức độ đóng góp của từng thành viên, rút ra các bài học kinh nghiệm sâu sắc về NoSQL và định hướng các bước phát triển tiếp theo của hệ thống.",
        "Mục tiêu chương 8: "
    )

    # -------------------------------------------------------------
    # 8.1. KẾT QUẢ ĐẠT ĐƯỢC SO VỚI MỤC TIÊU BAN ĐẦU
    # -------------------------------------------------------------
    add_heading_level1(doc, "8.1. Kết quả đạt được so với mục tiêu ban đầu")
    add_paragraph_huit(
        doc,
        "Đối chiếu với các mục tiêu nghiên cứu và phạm vi đề tài đã xác định tại Chương 1, nhóm sinh viên đã hoàn thành xuất sắc 100% khối lượng công việc được giao. Bảng 8.1 tổng hợp mức độ hoàn thành của các nhóm chức năng chính:",
        "Đánh giá mức độ hoàn thành mục tiêu: "
    )

    create_huit_table(
        doc,
        "Bảng 8.1: Bảng đánh giá mức độ hoàn thành các nhóm chức năng so với mục tiêu ban đầu",
        ["Nhóm chức năng nghiệp vụ", "Mục tiêu kỹ thuật ban đầu", "Mức độ hoàn thành", "Ghi chú đối chiếu thực tế"],
        [
            ["Quản trị tài khoản & Bảo mật", "Đăng ký, Đăng nhập JWT, Phân quyền 3 vai trò, Tường lửa Rate Limit 120 RPM.", "100%", "Vận hành hoàn hảo trên MongoDB + Redis."],
            ["Khám phá & Học tập bài giảng", "Duyệt danh mục khóa học có cache, Xem video bài giảng, Ghi log heartbeat.", "100%", "Redis Cache đạt 3.8ms, Cassandra lưu 50k log."],
            ["Phòng thi trắc nghiệm trực tuyến", "Thi toàn màn hình, Đồng hồ đếm ngược TTL, Lưu đáp án RAM, Anti-cheat.", "100%", "Lưu đáp án RAM tức thời < 2ms, phát hiện chuyển tab."],
            ["Chấm điểm & Vinh danh đua top", "Chấm điểm tự động, Lưu kết quả vĩnh viễn, Đua top BXH tuần, Đổi quà XP.", "100%", "Redis ZSET xếp hạng tức thời, shop đổi quà nguyên tử."],
            ["Bản đồ tri thức & Bạn Cùng Tiến", "Trực quan hóa cây bài học tiên quyết, Khai phá bạn học đồng ghi danh.", "100%", "Neo4j Cypher gợi ý bạn học tương đồng chính xác."],
            ["Quản trị CMS & Giám sát Telemetry", "Soạn thảo đề thi, Phân tích Retention Curve video, Giám sát 4 CSDL realtime.", "100%", "Dashboard trực quan hiển thị thông số 4 CSDL."]
        ],
        [2.8, 5.0, 1.8, 5.4]
    )

    # -------------------------------------------------------------
    # 8.2. ĐÁNH GIÁ ĐỐI CHIẾU CÁC CHỈ SỐ NFR
    # -------------------------------------------------------------
    add_heading_level1(doc, "8.2. Đánh giá đối chiếu các chỉ số NFR")
    add_paragraph_huit(
        doc,
        "Toàn bộ 6 chỉ số yêu cầu phi chức năng (NFR-01 đến NFR-06) đặt ra ở Chương 3 đã được kiểm chứng bằng thực nghiệm đo tải ở Chương 7. Bảng 8.2 đối chiếu chi tiết số liệu mục tiêu và số liệu đo đạc thực tế:",
        "Đối chiếu các chỉ số kỹ thuật đo lường được: "
    )

    create_huit_table(
        doc,
        "Bảng 8.2: Bảng đối chiếu các chỉ số yêu cầu phi chức năng (NFR) với thực tế đo kiểm",
        ["Mã NFR", "Nhóm yêu cầu", "Chỉ số yêu cầu đặt ra (Chương 3)", "Kết quả đo kiểm thực tế (Chương 7)", "Đánh giá kết quả"],
        [
            ["NFR-01", "Hiệu năng truy xuất", "Đọc cache Redis p95 < 10 ms; Đọc MongoDB p95 < 50 ms tại tải 500 req/s.", "Redis Cache đạt p95 = 3.8 ms; MongoDB đạt p95 = 32.0 ms.", "Vượt chỉ tiêu đề ra"],
            ["NFR-02", "Khả năng mở rộng", "Thông lượng ghi Cassandra tăng ≥ 70% khi mở rộng cụm node.", "Thông lượng tăng 85% từ 2.900 lên 5.300 ops/s khi thêm node.", "Vượt chỉ tiêu đề ra"],
            ["NFR-03", "Độ sẵn sàng hệ thống", "Hệ thống sẵn sàng ≥ 99.9%; Tắt 1 node cụm vẫn hoạt động bình thường.", "Chaos test tắt 1 node Cassandra, cụm tiếp tục đọc/ghi 100%.", "Đạt chuẩn yêu cầu"],
            ["NFR-04", "Tính nhất quán dữ liệu", "Strong Consistency cho bài thi; Eventual cho lượt xem và xếp hạng.", "Áp dụng thành công Write Concern majority và Redis ZSET.", "Đạt chuẩn yêu cầu"],
            ["NFR-05", "An toàn và Bảo mật", "Bcrypt salt 10, JWT Token, Tường lửa 120 req/phút chặn IP spam.", "Chặn thành công request thứ 121+, mã hóa mật khẩu 100%.", "Đạt chuẩn yêu cầu"],
            ["NFR-06", "Sao lưu và Phục hồi", "Thời gian phục hồi sự cố RTO < 30 phút, RPO < 24 giờ.", "Thực nghiệm phục hồi 1.000 users MongoDB chỉ mất 4.2 giây.", "Vượt chỉ tiêu đề ra"]
        ],
        [1.4, 2.5, 4.5, 4.5, 2.1]
    )

    # -------------------------------------------------------------
    # 8.3. TỔNG KẾT HOẠT ĐỘNG NHÓM VÀ ĐÁNH GIÁ ĐÓNG GÓP
    # -------------------------------------------------------------
    add_heading_level1(doc, "8.3. Tổng kết hoạt động nhóm và Đánh giá đóng góp")
    add_paragraph_huit(
        doc,
        "Nhóm 18 gồm 3 thành viên đã phối hợp chặt chẽ, tuân thủ nghiêm ngặt lịch trình công việc và hoàn thành xuất sắc các nhiệm vụ được phân công. Bảng 8.3 tổng hợp chi tiết vai trò và tỷ lệ đóng góp thực tế của từng thành viên:",
        "Đánh giá mức độ đóng góp của các thành viên: "
    )

    create_huit_table(
        doc,
        "Bảng 8.3: Bảng tổng kết phân công nhiệm vụ và tỷ lệ đóng góp thực tế của nhóm",
        ["STT", "Họ và tên sinh viên", "Mã số sinh viên", "Vai trò và Nhiệm vụ phụ trách chính", "Đóng góp (%)"],
        [
            [
                "1",
                "Nguyễn Trọng Nguyên",
                "2001230589",
                "Trưởng nhóm: Phụ trách kiến trúc tổng thể Polyglot Persistence, Lập trình Backend Express.js, Cấu hình và tối ưu hóa Redis (Cache, Session, Rate Limiter) & Apache Cassandra (Time-series Log, Anti-cheat), Viết mã nguồn kiểm thử tự động (automated_tests.js) và Biên soạn báo cáo tổng hợp.",
                "100%"
            ],
            [
                "2",
                "Thành viên nhóm 2",
                "200123xxxx",
                "Lập trình viên CSDL Document: Phụ trách thiết kế và quản trị MongoDB (Collections users, courses, exams, questions, results), Thiết lập chỉ mục phức hợp ESR, Viết các Aggregation Pipelines, Xây dựng phân hệ CMS quản trị đề thi và Kiểm thử chức năng thi cử.",
                "100%"
            ],
            [
                "3",
                "Thành viên nhóm 3",
                "200123yyyy",
                "Lập trình viên CSDL Đồ thị & Frontend: Phụ trách thiết kế mô hình đồ thị LPG trên Neo4j, Lập trình các truy vấn Cypher (Lộ trình học tập tiên quyết, Gợi ý Bạn Cùng Tiến), Thiết kế giao diện Frontend người dùng Modular ES6 và Biên soạn danh mục kiểm thử.",
                "100%"
            ]
        ],
        [1.0, 3.2, 2.0, 7.3, 1.5]
    )

    add_paragraph_huit(
        doc,
        "Quy trình phối hợp làm việc của nhóm được duy trì kỷ luật qua các nguyên tắc: Tổ chức họp giao ban trực tuyến định kỳ hằng tuần qua Google Meet để rà soát tiến độ; Toàn bộ mã nguồn và tài liệu được lưu trữ, đồng bộ và phân nhánh chặt chẽ trên kho lưu trữ GitHub theo mô hình Git Flow; Mọi tính năng mới đều phải vượt qua bộ 22 ca kiểm thử tự động trước khi hợp nhất vào nhánh chính (main branch).",
        "Phương thức phối hợp và kỷ luật làm việc: "
    )

    # -------------------------------------------------------------
    # 8.4. BÀI HỌC KINH NGHIỆM
    # -------------------------------------------------------------
    add_heading_level1(doc, "8.4. Bài học kinh nghiệm")
    add_paragraph_huit(
        doc,
        "Quá trình nghiên cứu và triển khai đề tài thực tế đã mang lại cho nhóm những bài học kinh nghiệm quý báu cả về kỹ năng làm việc nhóm lẫn kiến thức chuyên môn kỹ thuật sâu sắc:",
        "Đúc kết bài học thực tiễn: "
    )
    add_bullet_level1(doc, "Loại bỏ tư duy chuẩn hóa quan hệ (RDBMS) khi thiết kế NoSQL: Bài học lớn nhất là không được chuẩn hóa dữ liệu (1NF, 2NF, 3NF) một cách máy móc như trong SQL Server/MySQL. Trong NoSQL, phương pháp luận thiết kế bắt buộc phải theo hướng Tiếp cận theo câu hỏi truy vấn (Query-Driven Modeling). Phải xác định rõ danh mục Access Patterns trước khi thiết kế bảng CQL của Cassandra hoặc cấu trúc Document của MongoDB.")
    add_bullet_level1(doc, "Tầm quan trọng của việc kiểm soát kích thước phân vùng (Partition Sizing) trong Cassandra: Nhóm đã hiểu sâu sắc rằng việc chọn sai Partition Key trong Cassandra có thể tạo ra các phân vùng khổng lồ (Hotspot Partition) gây treo JVM Garbage Collection. Việc chia khóa phân vùng ghép ((student_id, lesson_id)) đã giải quyết triệt để vấn đề này, giữ kích thước phân vùng luôn an toàn dưới 100 KB.")
    add_bullet_level1(doc, "Quản lý bộ nhớ RAM và chính sách TTL trong Redis: Redis rất mạnh mẽ nhưng tài nguyên RAM là hữu hạn và đắt đỏ. Nhóm đã học được cách kết hợp chính sách thu hồi allkeys-lru và gán nhãn TTL nghiêm ngặt cho toàn bộ các khóa tạm thời (phiên thi, cache, rate limit) để tránh cạn kiệt bộ nhớ.")
    add_bullet_level1(doc, "Kỹ năng làm việc nhóm và Quản trị phiên bản: Việc thống nhất quy chuẩn đặt tên biến, cấu trúc thư mục phân tầng và tuân thủ Git Flow giúp nhóm giảm thiểu tối đa các xung đột mã nguồn (Merge Conflicts) và duy trì sự đồng bộ nhịp nhàng trong suốt 8 tuần thực hiện dự án.")

    # -------------------------------------------------------------
    # 8.5. HƯỚNG PHÁT TRIỂN TRONG TƯƠNG LAI
    # -------------------------------------------------------------
    add_heading_level1(doc, "8.5. Hướng phát triển trong tương lai")
    add_paragraph_huit(
        doc,
        "Để phát triển EduPro Academy thành một nền tảng thương mại hóa hoàn chỉnh phục vụ hàng trăm nghìn học viên, nhóm định hướng các mục tiêu mở rộng tiếp theo:",
        "Định hướng nâng cấp hệ thống: "
    )
    add_bullet_level1(doc, "Chuyển dịch hạ tầng lên môi trường Đám mây (Cloud Native): Nâng cấp hệ thống lên các dịch vụ CSDL phân tán có khả năng tự động co giãn (Auto-scaling) trên nền tảng Cloud: MongoDB Atlas Serverless, DataStax Astra DB (Cassandra Managed), Neo4j AuraDB và Redis Cloud Enterprise.")
    add_bullet_level1(doc, "Tích hợp công nghệ Tìm kiếm Vector và Trí tuệ Nhân tạo sinh (Vector Search & GenAI Copilot): Tích hợp Elasticsearch hoặc MongoDB Atlas Vector Search để lưu trữ các véc-tơ ngữ nghĩa (Embeddings) của câu hỏi và bài giảng, từ đó xây dựng tính năng Trợ lý ảo AI Copilot phân tích điểm yếu học tập và tự động tạo đề thi cá nhân hóa cho từng học viên.")
    add_bullet_level1(doc, "Phát triển ứng dụng di động đa nền tảng (Mobile App): Xây dựng ứng dụng di động trên nền tảng Flutter hoặc React Native kết nối đồng bộ tới hệ sinh thái API của EduPro, hỗ trợ học viên làm bài thi và luyện tập mọi lúc mọi nơi trên điện thoại thông minh.")
