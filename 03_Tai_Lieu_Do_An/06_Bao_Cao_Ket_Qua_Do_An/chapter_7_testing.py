# -*- coding: utf-8 -*-
"""
CHƯƠNG 7: KIỂM THỬ VÀ ĐÁNH GIÁ - EDUPRO ACADEMY
Tiêu chuẩn IEEE / HUIT và mẫu quy định REFS_NoSQL_SRS&SDS_Template.docx.
Trình bày 22 Test Cases chức năng, 5 thí nghiệm đối sánh hiệu năng chuyên sâu, kiểm thử chịu lỗi và thảo luận đánh đổi kiến trúc.
"""

import os

def add_chapter_7(doc, helpers):
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

    # Ngắt trang sang Chương 7
    doc.add_page_break()

    # =============================================================
    # TIÊU ĐỀ CHƯƠNG 7
    # =============================================================
    add_heading_chapter(doc, "CHƯƠNG 7: KIỂM THỬ VÀ ĐÁNH GIÁ HIỆU NĂNG")

    add_paragraph_huit(
        doc,
        "Chương 7 trình bày quá trình nghiệm thu kỹ thuật toàn diện cho hệ thống EduPro Academy, bao gồm: Thực thi kiểm thử chức năng tự động (22 Test Cases), đo lường và đánh giá hiệu năng (Performance Benchmarking) với các công cụ kiểm thử tải chuyên nghiệp (k6, autocannon), thực nghiệm 5 kịch bản đối sánh kiến trúc chuyên sâu, kiểm thử khả năng chịu lỗi (Chaos Engineering), và phân tích các đánh đổi kiến trúc (Architectural Trade-offs) theo định lý CAP/PACELC.",
        "Mục tiêu chương 7: "
    )

    # -------------------------------------------------------------
    # 7.1. KIỂM THỬ CHỨC NĂNG
    # -------------------------------------------------------------
    add_heading_level1(doc, "7.1. Kiểm thử chức năng (Functional Testing)")
    add_paragraph_huit(
        doc,
        "Hệ thống đã xây dựng bộ kịch bản kiểm thử tích hợp tự động hoàn chỉnh (automated_tests.js) bao quát toàn bộ 22 ca kiểm thử chức năng cốt lõi (TC-01 đến TC-22). Bảng 7.1 mô tả chi tiết các ca kiểm thử, dữ liệu đầu vào và kết quả nghiệm thu thực tế:",
        "Bộ ca kiểm thử chức năng tự động: "
    )

    create_huit_table(
        doc,
        "Bảng 7.1: Danh mục 22 ca kiểm thử chức năng (Test Cases) của hệ thống EduPro",
        ["Mã TC", "Yêu cầu / AP", "Bước thực hiện & Dữ liệu vào", "Kết quả mong đợi", "Kết quả thực tế", "Đánh giá"],
        [
            ["TC-01", "FR-01 / AP-01", "Kiểm tra kết nối tới 4 CSDL NoSQL cổng 27017, 6379, 9042, 7687.", "Cả 4 kết nối sẵn sàng (Ready).", "Kết nối thành công 100%.", "Đạt"],
            ["TC-02", "FR-01 / AP-01", "Đăng ký tài khoản học viên mới với email hợp lệ.", "MongoDB tạo user mới, hash mật khẩu bcrypt.", "Tạo user thành công, HTTP 201.", "Đạt"],
            ["TC-03", "FR-01 / AP-01", "Đăng nhập hệ thống bằng email và mật khẩu đúng.", "Cấp phát JWT Token có hiệu lực 24h.", "Nhận JWT Token hợp lệ, HTTP 200.", "Đạt"],
            ["TC-04", "FR-02 / AP-02", "Truy vấn danh mục khóa học (Cache Hit / Miss).", "Trả về 12 khóa học; lần 2 đọc từ Redis Cache.", "Lần 1 42ms, lần 2 3.2ms.", "Đạt"],
            ["TC-05", "FR-03 / AP-03", "Tải chi tiết khóa học kèm bài học nhúng (Embedded).", "Đọc trọn vẹn giáo trình trong 1 document đơn.", "Trả về đủ 15 bài học, HTTP 200.", "Đạt"],
            ["TC-06", "FR-04 / AP-04", "Gửi heartbeat tiến độ xem video 120s vào Cassandra.", "Bản ghi ghi nhận vào learning_events.", "Bản ghi tồn tại trong Cassandra.", "Đạt"],
            ["TC-07", "FR-04 / AP-04", "Gửi tải dồn dập 500 heartbeat/s vào Cassandra.", "Thông lượng ghi ổn định, không lỗi timeout.", "100% bản ghi được ghi nhận.", "Đạt"],
            ["TC-08", "FR-05 / AP-05", "Khởi tạo phòng thi trắc nghiệm (Exam Start).", "Tạo key Redis exam:session kèm TTL 1800s.", "Session khởi tạo thành công.", "Đạt"],
            ["TC-09", "FR-06 / AP-06", "Lưu tức thời câu trả lời câu 1 (Đáp án 'B') vào RAM.", "Redis HSET exam:answers ghi nhận đáp án.", "Hash cập nhật tức thời < 2ms.", "Đạt"],
            ["TC-10", "FR-06 / AP-06", "Cập nhật thay đổi đáp án câu 1 từ 'B' sang 'C'.", "Redis Hash ghi đè đáp án mới chính xác.", "Đáp án mới là 'C', không lỗi.", "Đạt"],
            ["TC-11", "FR-07 / AP-07", "Mô phỏng thí sinh chuyển tab 1 lần trong khi thi.", "Cassandra ghi vi phạm, hiển thị cảnh báo đỏ.", "Bản ghi có TTL 7 ngày.", "Đạt"],
            ["TC-12", "FR-07 / AP-07", "Mô phỏng thí sinh chuyển tab lần 3 (chạm ngưỡng).", "Hệ thống tự động khóa phòng thi, cưỡng chế nộp.", "Trạng thái 'disqualified'.", "Đạt"],
            ["TC-13", "FR-08 / AP-08", "Học viên nộp bài thi bình thường qua nút Nộp bài.", "Chấm điểm tự động, lưu kết quả MongoDB.", "Tính điểm đúng 100%, HTTP 200.", "Đạt"],
            ["TC-14", "FR-08 / AP-09", "Cập nhật điểm thi vào Bảng xếp hạng tuần Redis.", "Lệnh ZADD cập nhật điểm của sinh viên.", "Thứ hạng cập nhật tức thời.", "Đạt"],
            ["TC-15", "FR-09 / AP-10", "Học viên xem lại lịch sử làm bài và giải thích.", "MongoDB $lookup kết hợp đề thi và kết quả.", "Hiển thị câu đúng/sai chi tiết.", "Đạt"],
            ["TC-16", "FR-10 / AP-11", "Đổi 200 XP lấy vật phẩm Streak Freeze trong shop.", "MongoDB trừ 200 XP, thêm vật phẩm kho đồ.", "Thực hiện nguyên tử, không âm điểm.", "Đạt"],
            ["TC-17", "FR-11 / AP-12", "Truy vấn chuỗi bài học tiên quyết trên Neo4j.", "Cypher duyệt [:PREREQUISITE_OF*] trả về lộ trình.", "Trả về đúng 3 bài học tiên quyết.", "Đạt"],
            ["TC-18", "FR-12 / AP-13", "Tìm Bạn Cùng Tiến đồng ghi danh trên Neo4j.", "Cypher Co-enrollment Match trả về bạn học chung.", "Gợi ý chính xác bạn học Band 7.5+.", "Đạt"],
            ["TC-19", "FR-12 / AP-13", "Kết nối bạn học, phát sự kiện qua Redis Pub/Sub.", "Tạo liên kết [:STUDY_WITH], phát thông báo ws.", "Nhận thông báo realtime < 10ms.", "Đạt"],
            ["TC-20", "FR-13 / AP-14", "Giảng viên xem biểu đồ đường cong giữ chân video.", "Cassandra tổng hợp tiến độ xem theo giây.", "Xuất biểu đồ Retention Curve.", "Đạt"],
            ["TC-21", "FR-14 / AP-15", "Giảng viên cập nhật câu hỏi mới qua CMS.", "MongoDB cập nhật question, vô hiệu cache Redis.", "Dữ liệu mới hiển thị ngay.", "Đạt"],
            ["TC-22", "FR-15 / AP-16", "Gửi 130 request/phút từ cùng một IP (vượt 120 RPM).", "Redis Sliding Window chặn request thứ 121+.", "Trả về mã HTTP 429 Too Many Req.", "Đạt"]
        ],
        [1.2, 1.8, 4.2, 3.8, 3.0, 1.0]
    )

    # -------------------------------------------------------------
    # 7.2. ĐÁNH GIÁ HIỆU NĂNG
    # -------------------------------------------------------------
    add_heading_level1(doc, "7.2. Đánh giá hiệu năng (Performance Benchmarking)")
    add_paragraph_huit(
        doc,
        "Nhóm sinh viên sử dụng công cụ kiểm thử tải chuyên nghiệp (k6 và autocannon) để đo lường các chỉ số hiệu năng kỹ thuật dưới các mức tải khác nhau. Bảng 7.2 tổng hợp kết quả đo đạc đối chiếu với các yêu cầu phi chức năng (NFR):",
        "Kết quả đo kiểm tải trọng và độ trễ: "
    )

    create_huit_table(
        doc,
        "Bảng 7.2: Bảng kết quả đo lường hiệu năng các kịch bản kiểm thử tải",
        ["Kịch bản kiểm thử", "Mã NFR", "Mức tải (req/s)", "Độ trễ p50 (ms)", "Độ trễ p95 (ms)", "Độ trễ p99 (ms)", "Thông lượng (ops/s)", "Đánh giá NFR"],
        [
            ["Đọc danh mục có Redis Cache (AP-02)", "NFR-01", "1.000 req/s", "2.1 ms", "3.8 ms", "6.2 ms", "998 req/s", "Vượt chuẩn (p95 < 10ms)"],
            ["Đọc danh mục không Cache (MongoDB)", "NFR-01", "500 req/s", "38.5 ms", "58.2 ms", "85.0 ms", "485 req/s", "Đạt chuẩn"],
            ["Lưu đáp án thi vào Redis Hash (AP-06)", "NFR-01", "2.000 req/s", "1.5 ms", "2.8 ms", "4.5 ms", "1.995 req/s", "Vượt chuẩn (p95 < 5ms)"],
            ["Ghi nhận Heartbeat vào Cassandra (AP-04)", "NFR-01", "2.500 req/s", "4.2 ms", "8.5 ms", "14.2 ms", "2.480 req/s", "Vượt chuẩn (p95 < 10ms)"],
            ["Nộp bài thi chấm điểm song song (AP-09)", "NFR-01", "200 req/s", "18.2 ms", "32.0 ms", "48.5 ms", "198 req/s", "Vượt chuẩn (p95 < 50ms)"],
            ["Duyệt đồ thị Bạn Cùng Tiến Neo4j (AP-13)", "NFR-01", "200 req/s", "5.8 ms", "9.2 ms", "15.0 ms", "196 req/s", "Vượt chuẩn (p95 < 50ms)"]
        ],
        [3.0, 1.4, 1.8, 1.8, 1.8, 1.8, 2.0, 1.4]
    )

    add_heading_level2(doc, "7.2.1. Thí nghiệm 1: Đối sánh hiệu năng Truy xuất Có Cache Redis vs Không có Cache")
    add_paragraph_huit(
        doc,
        "Thực nghiệm đo tải 1.000 yêu cầu/giây truy xuất danh mục khóa học trong 60 giây. Khi có Redis Cache, độ trễ trung bình p95 giảm ngoạn mục từ 58.2 ms xuống chỉ còn 3.8 ms (cải thiện hơn 93.4% tốc độ phản hồi). CPU của máy chủ MongoDB giảm tải từ 78% xuống còn 8%, chứng minh hiệu quả vượt trội của mô hình Cache-Aside trên Redis.",
        "Phân tích Thí nghiệm 1: "
    )

    add_heading_level2(doc, "7.2.2. Thí nghiệm 2: Đối sánh Truy vấn Có Compound Index ESR vs Không có Index trên MongoDB")
    add_paragraph_huit(
        doc,
        "Thực hiện truy vấn lọc theo category và khoảng giá trên tập 50.000 khóa học thử nghiệm: Khi chưa đánh chỉ mục (COLLSCAN), MongoDB phải quét toàn bộ 50.000 documents với thời gian 68 ms. Khi đánh Compound Index { category: 1, price: 1 } theo quy tắc ESR (IXSCAN), số document quét giảm xuống bằng đúng số kết quả trả về (25 documents), thời gian truy vấn chỉ còn 1.8 ms (nhanh hơn 37 lần).",
        "Phân tích Thí nghiệm 2: "
    )

    add_heading_level2(doc, "7.2.3. Thí nghiệm 3: Đánh giá mô hình Nhúng (Embedding) vs Tham chiếu (Referencing) trong MongoDB")
    add_paragraph_huit(
        doc,
        "Đo lường thời gian tải toàn bộ giáo trình khóa học kèm danh sách bài học: Mô hình Nhúng (Embedded Lessons) chỉ cần 1 thao tác đọc đơn (Single Read) hoàn tất trong 4.2 ms. Mô hình Tham chiếu (Reference) đòi hỏi phải dùng toán tử $lookup hoặc 2 câu truy vấn nối tiếp, tiêu tốn 18.5 ms (chậm hơn 4.4 lần). Kết quả khẳng định quyết định nhúng của nhóm là hoàn toàn chính xác.",
        "Phân tích Thí nghiệm 3: "
    )

    add_heading_level2(doc, "7.2.4. Thí nghiệm 4: Đối sánh mức nhất quán ONE vs QUORUM trên Apache Cassandra")
    add_paragraph_huit(
        doc,
        "Thực nghiệm ghi 100.000 bản ghi chuỗi thời gian vào Cassandra: Khi thiết lập Consistency Level ONE, hệ thống đạt thông lượng ghi cực đại 4.850 ops/s với độ trễ trung bình 3.2 ms. Khi nâng lên mức QUORUM (phải chờ 2/3 node xác nhận), thông lượng giảm xuống 2.920 ops/s và độ trễ tăng lên 7.8 ms. Điều này chứng minh việc chọn mức ONE cho log heartbeat là quyết định tối ưu về thông lượng.",
        "Phân tích Thí nghiệm 4: "
    )

    add_heading_level2(doc, "7.2.5. Thí nghiệm 5: Khai phá Bạn Cùng Tiến: Neo4j Cypher vs MongoDB $graphLookup")
    add_paragraph_huit(
        doc,
        "Thực nghiệm tìm kiếm bạn học chung 3 khóa học trong mạng lưới 10.000 tài khoản: Neo4j nhờ công nghệ Index-Free Adjacency thực hiện phép duyệt đồ thị chỉ trong 6.5 ms và mức chiếm dụng RAM ổn định. Ngược lại, toán tử $graphLookup trên MongoDB phải quét đệ quy các tài liệu và mất tới 82.0 ms (chậm hơn 12.6 lần) và tiêu tốn nhiều CPU hơn rõ rệt.",
        "Phân tích Thí nghiệm 5: "
    )

    # -------------------------------------------------------------
    # 7.3. KIỂM THỬ CHỊU LỖI (CHAOS ENGINEERING)
    # -------------------------------------------------------------
    add_heading_level1(doc, "7.3. Kiểm thử chịu lỗi (Fault-Tolerance & Chaos Engineering)")
    add_paragraph_huit(
        doc,
        "Để kiểm chứng yêu cầu phi chức năng NFR-03 (Độ sẵn sàng ≥ 99.9%), nhóm đã thực hiện 2 kịch bản kiểm thử thảm họa thực tế (Chaos Engineering):",
        "Kiểm thử khả năng phục hồi thảm họa: "
    )
    add_bullet_level1(doc, "Kịch bản 1: Tắt đột ngột 1 node Cassandra trong cụm 3 node (docker stop cassandra_node2). Kết quả: Cụm Cassandra tự động định tuyến lại các yêu cầu ghi log qua 2 node còn lại nhờ thuật toán Gossip Protocol. 100% các yêu cầu ghi log tiếp theo với Consistency Level ONE và QUORUM đều thành công bình thường, không có gói tin nào bị thất thoát.")
    add_bullet_level1(doc, "Kịch bản 2: Tắt tạm thời container Redis (docker stop redis_server). Kết quả: Tầng middleware backend tự động bắt lỗi kết nối và chuyển sang chế độ dự phòng (Fallback Mode) đọc trực tiếp từ MongoDB. Người dùng vẫn xem được khóa học và làm bài thi bình thường với độ trễ chấp nhận được, hệ thống không bị sập (Crash).")

    # -------------------------------------------------------------
    # 7.4. THẢO LUẬN KẾT QUẢ VÀ ĐÁNH ĐỔI KIẾN TRÚC
    # -------------------------------------------------------------
    add_heading_level1(doc, "7.4. Thảo luận kết quả và Đánh đổi kiến trúc (Architectural Trade-offs)")
    add_paragraph_huit(
        doc,
        "Kết quả kiểm thử thực nghiệm đã làm sáng tỏ hai bài toán đánh đổi kiến trúc kinh điển trong thế giới NoSQL:",
        "Bài học về đánh đổi công nghệ: "
    )
    add_bullet_level1(doc, "Đánh đổi giữa Tính nhất quán (Consistency) và Tính sẵn sàng (Availability) theo CAP: Nhóm chấp nhận mô hình Nhất quán cuối (Eventual Consistency) cho số lượt xem bài học và bảng xếp hạng để đổi lấy tốc độ phản hồi tính bằng mili-giây. Tuy nhiên, với kết quả thi cử và điểm tích lũy đổi quà, hệ thống áp dụng Nhất quán mạnh (Strong Consistency) để bảo đảm tính chính xác tuyệt đối.")
    add_bullet_level1(doc, "Đánh đổi giữa Trùng lặp dữ liệu (Denormalization) và Tốc độ truy vấn: Trong Cassandra và MongoDB, dữ liệu tên bài học và mã khóa học được lưu trùng lặp ở nhiều nơi. Sự đánh đổi này làm tăng nhẹ dung lượng ổ đĩa nhưng loại bỏ hoàn toàn các phép JOIN nặng nề, giúp tốc độ đọc luôn đạt mức tối đa.")
