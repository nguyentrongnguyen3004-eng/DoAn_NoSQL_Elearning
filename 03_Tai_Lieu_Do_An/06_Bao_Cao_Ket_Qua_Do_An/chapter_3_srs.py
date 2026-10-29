# -*- coding: utf-8 -*-
"""
CHƯƠNG 3: ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) - EDUPRO ACADEMY
Tuân thủ chuẩn IEEE 830 / ISO/IEC/IEEE 29148 và Thể thức quy định Khoa CNTT - HUIT.
Bổ sung đặc tả chuyên sâu cho kiến trúc đa mô hình NoSQL Polyglot Persistence.
"""

def add_chapter_3(doc, helpers):
    add_heading_chapter = helpers['add_heading_chapter']
    add_heading_level1 = helpers['add_heading_level1']
    add_heading_level2 = helpers['add_heading_level2']
    add_heading_level3 = helpers['add_heading_level3']
    add_paragraph_huit = helpers['add_paragraph_huit']
    add_bullet_level1 = helpers['add_bullet_level1']
    add_bullet_level2 = helpers['add_bullet_level2']
    create_huit_table = helpers['create_huit_table']
    add_figure_title = helpers['add_figure_title']

    # Ngắt trang sang Chương 3
    doc.add_page_break()

    # =============================================================
    # TIÊU ĐỀ CHƯƠNG 3
    # =============================================================
    add_heading_chapter(doc, "CHƯƠNG 3: ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)")

    # -------------------------------------------------------------
    # 3.1. GIỚI THIỆU
    # -------------------------------------------------------------
    add_heading_level1(doc, "3.1. Giới thiệu")

    add_heading_level2(doc, "3.1.1. Mục đích tài liệu")
    add_paragraph_huit(
        doc,
        "Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) này định nghĩa toàn diện và chi tiết toàn bộ các yêu cầu nghiệp vụ, yêu cầu chức năng (Functional Requirements - FR), yêu cầu phi chức năng (Non-Functional Requirements - NFR), đặc tính dữ liệu 3V và danh mục các mẫu truy cập dữ liệu (Access Patterns - AP) cho Nền tảng học trực tuyến và khảo sát năng lực tiếng Anh thực chiến EduPro Academy. Tài liệu được biên soạn tuân thủ nghiêm ngặt khung hướng dẫn IEEE 830-1998 và ISO/IEC/IEEE 29148:2018, đồng thời mở rộng các mục đặc thù cho kiến trúc đa mô hình NoSQL (Polyglot Persistence). Đây là văn bản kỹ thuật cốt lõi làm căn cứ chuẩn mực để thiết kế kiến trúc chi tiết (SDS) ở Chương 4 và xây dựng kịch bản kiểm thử nghiệm thu (Testing) ở Chương 7.",
        "Mục đích và vai trò của tài liệu: "
    )

    add_heading_level2(doc, "3.1.2. Đối tượng đọc tài liệu")
    add_paragraph_huit(doc, "Tài liệu này được biên soạn phục vụ các nhóm đối tượng độc giả chính sau:")
    add_bullet_level1(doc, "Giảng viên hướng dẫn và Hội đồng chấm bảo vệ đồ án: Sử dụng tài liệu làm căn cứ khoa học để đối chiếu, đánh giá mức độ hoàn thành các mục tiêu nghiên cứu và chất lượng kỹ thuật của đề tài.")
    add_bullet_level1(doc, "Thành viên nhóm phát triển phần mềm (Nhóm 18): Sử dụng làm kim chỉ nam kỹ thuật để thiết kế mô hình dữ liệu NoSQL, lập trình các API endpoints và xây dựng giao diện người dùng frontend.")
    add_bullet_level1(doc, "Chuyên viên kiểm thử (QA/Tester): Sử dụng tài liệu để thiết kế các ca kiểm thử chức năng (Test Cases), đo lường các chỉ số hiệu năng (Latency, Throughput) và nghiệm thu chất lượng hệ thống.")

    add_heading_level2(doc, "3.1.3. Phạm vi sản phẩm")
    add_paragraph_huit(
        doc,
        "Sản phẩm phần mềm là Nền tảng học trực tuyến và khảo sát năng lực tiếng Anh thực chiến EduPro Academy, vận hành trên nền tảng Web tương tác cao, tích hợp đồng thời 4 hệ quản trị cơ sở dữ liệu NoSQL chuyên biệt (MongoDB, Redis, Apache Cassandra, Neo4j) nhằm giải quyết triệt để các bài toán về tải ghi dồn dập, độ trễ truy xuất RAM, phân tích chuỗi thời gian học tập và khai phá mạng lưới đồ thị tri thức.",
        "Phạm vi ứng dụng của sản phẩm: "
    )

    add_heading_level2(doc, "3.1.4. Định nghĩa và từ viết tắt")
    add_paragraph_huit(doc, "Các thuật ngữ chuyên ngành và từ viết tắt được sử dụng xuyên suốt tài liệu được tổng hợp trong Bảng 3.1:")

    create_huit_table(
        doc,
        "Bảng 3.1: Danh mục các thuật ngữ và từ viết tắt",
        ["Thuật ngữ", "Tên tiếng Anh đầy đủ", "Ý nghĩa và giải thích nghiệp vụ trong đề tài"],
        [
            ["SRS", "Software Requirements Specification", "Tài liệu đặc tả yêu cầu phần mềm theo chuẩn IEEE 830 / ISO/IEC/IEEE 29148."],
            ["SDS", "Software Design Specification", "Tài liệu đặc tả thiết kế phần mềm và thiết kế chi tiết CSDL."],
            ["FR", "Functional Requirement", "Yêu cầu chức năng mà hệ thống phần mềm bắt buộc phải thực hiện được."],
            ["NFR", "Non-Functional Requirement", "Yêu cầu phi chức năng (hiệu năng, độ trễ, khả năng mở rộng, bảo mật)."],
            ["AP", "Access Pattern", "Mẫu truy cập dữ liệu (câu hỏi nghiệp vụ truy xuất CSDL) quyết định thiết kế NoSQL."],
            ["NoSQL", "Not Only SQL", "Hệ thống cơ sở dữ liệu phi quan hệ, phân tán, có khả năng mở rộng quy mô theo chiều ngang."],
            ["LPG", "Labeled Property Graph", "Mô hình đồ thị có nhãn và thuộc tính của Neo4j biểu diễn liên kết tri thức."],
            ["TTL", "Time To Live", "Thời gian sống tự động hết hạn của bản ghi dữ liệu (ứng dụng trong Redis và Cassandra)."],
            ["BASE", "Basically Available, Soft state, Eventual consistency", "Mô hình nhất quán mở rộng trong các hệ thống NoSQL phân tán."],
            ["ACID", "Atomicity, Consistency, Isolation, Durability", "Mô hình giao dịch truyền thống đảm bảo tính toàn vẹn tuyệt đối."],
            ["JWT", "JSON Web Token", "Chuẩn mở định dạng mã hóa bảo mật dùng để xác thực và phân quyền người dùng."],
            ["BPMN", "Business Process Model and Notation", "Ký hiệu chuẩn hóa để mô hình hóa quy trình nghiệp vụ thực tế."],
            ["DFD", "Data Flow Diagram", "Sơ đồ luồng dữ liệu mô tả sự chuyển dịch thông tin qua các tiến trình và kho dữ liệu."],
            ["CMS", "Content Management System", "Phân hệ quản trị nội dung dành cho Giảng viên quản lý khóa học và đề thi."]
        ],
        [2.5, 4.5, 8.0]
    )

    add_heading_level2(doc, "3.1.5. Tài liệu tham chiếu")
    add_paragraph_huit(doc, "Tài liệu SRS được xây dựng dựa trên các căn cứ pháp lý và tài liệu kỹ thuật sau:")
    add_bullet_level1(doc, "Đề cương chi tiết học phần Các hệ cơ sở dữ liệu mới (NoSQL) - Khoa Công nghệ Thông tin, Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT).")
    add_bullet_level1(doc, "Chuẩn IEEE 830-1998: IEEE Recommended Practice for Software Requirements Specifications.")
    add_bullet_level1(doc, "Chuẩn quốc tế ISO/IEC/IEEE 29148:2018: Systems and software engineering - Life cycle processes - Requirements engineering.")
    add_bullet_level1(doc, "Tài liệu kỹ thuật chính thức từ MongoDB Manual v6.0, Redis Documentation v7.0, Apache Cassandra Documentation v4.1, Neo4j Graph Database Manual v5.12.")

    # -------------------------------------------------------------
    # 3.2. MÔ TẢ TỔNG QUAN
    # -------------------------------------------------------------
    add_heading_level1(doc, "3.2. Mô tả tổng quan")

    add_heading_level2(doc, "3.2.1. Bối cảnh sản phẩm (Context Diagram)")
    add_paragraph_huit(
        doc,
        "EduPro Academy là một giải pháp giáo dục điện tử độc lập, được thiết kế theo kiến trúc Micro-Monolith mở rộng. Hệ thống giao tiếp trực tiếp với người dùng cuối thông qua ứng dụng Web tương tác cao (Web App SPA/MPA) qua giao thức bảo mật HTTPS/WSS. Phía backend giao tiếp với hạ tầng lưu trữ đa mô hình NoSQL Polyglot Persistence qua các cổng mạng tiêu chuẩn: MongoDB (Cổng 27017 - Document Store), Redis (Cổng 6379 - In-memory Key-Value & Cache), Apache Cassandra (Cổng 9042 - Wide-column Time-series Store) và Neo4j (Cổng 7474/7687 - Graph Database). Ngoài ra, hệ thống sẵn sàng tích hợp các cổng thanh toán học phí (VnPay/MoMo) và dịch vụ gửi thư điện tử tự động (SMTP/SendGrid).",
        "Mô hình bối cảnh tích hợp: "
    )

    add_heading_level2(doc, "3.2.2. Các tác nhân (Actor) và đặc điểm người dùng")
    add_paragraph_huit(doc, "Hệ thống phục vụ 4 nhóm tác nhân chính với các vai trò và quyền hạn phân định rõ ràng:")
    add_bullet_level1(doc, "Học viên (Student): Tác nhân chiếm tỷ trọng lớn nhất (khoảng 90% lượng người dùng). Trình độ tin học ở mức phổ thông. Sử dụng hệ thống để duyệt khóa học, xem video bài giảng, làm bài tập, thi khảo sát trực tuyến, nhận diện lộ trình học tập, tìm kiếm Bạn Cùng Tiến và đổi thưởng điểm tích lũy XP.")
    add_bullet_level1(doc, "Giảng viên (Teacher): Có kiến thức chuyên môn sư phạm và tin học khá. Sử dụng phân hệ CMS để biên tập nội dung khóa học, cập nhật tài liệu handout PDF, tạo ngân hàng câu hỏi thi trắc nghiệm và theo dõi đường cong giữ chân người học (Retention Curve) qua các video bài giảng.")
    add_bullet_level1(doc, "Quản trị viên hệ thống (Admin): Có trình độ kỹ thuật cao. Quản lý phân quyền tài khoản người dùng, giám sát sức khỏe các node CSDL NoSQL, cấu hình tường lửa hạn chế tần suất truy cập (Rate Limiter) và sao lưu/phục hồi dữ liệu.")
    add_bullet_level1(doc, "Hệ thống tự động (Automated System Cron/Worker): Tác nhân nền đảm nhận việc thu hồi phiên thi hết hạn theo TTL, định kỳ tính toán bảng xếp hạng tuần (Weekly Leaderboard) và dọn dẹp log giám sát quá hạn.")

    add_heading_level2(doc, "3.2.3. Ràng buộc hệ thống")
    add_paragraph_huit(doc, "Các ràng buộc kỹ thuật và môi trường triển khai của đề tài bao gồm:")
    add_bullet_level1(doc, "Ràng buộc hạ tầng phần cứng: Triển khai trên máy chủ vật lý hoặc máy ảo nội bộ với dung lượng RAM 16 GB, CPU 8 Cores, ổ cứng SSD tối thiểu 100 GB để chạy đồng thời 4 cụm dịch vụ NoSQL và máy chủ ứng dụng Node.js.")
    add_bullet_level1(doc, "Ràng buộc công nghệ: Backend bắt buộc phát triển bằng Node.js (Express.js), Frontend sử dụng kiến trúc Vanilla JavaScript ES6 Modular (không dùng framework cồng kềnh nhằm tối ưu hiệu năng trang web); Cơ sở dữ liệu bắt buộc tích hợp đủ 4 hệ: MongoDB, Redis, Apache Cassandra và Neo4j.")
    add_bullet_level1(doc, "Ràng buộc tiêu chuẩn: Toàn bộ dữ liệu hiển thị phải hỗ trợ chuẩn mã hóa UTF-8 tiếng Việt hoàn chỉnh; bảo mật các API nhạy cảm bằng chuẩn xác thực JSON Web Token (JWT).")

    add_heading_level2(doc, "3.2.4. Giả định và phụ thuộc")
    add_paragraph_huit(doc, "Các giả định kỹ thuật làm tiền đề cho quá trình vận hành hệ thống:")
    add_bullet_level1(doc, "Trình duyệt của người dùng là các trình duyệt hiện đại (Google Chrome, Microsoft Edge, Mozilla Firefox) hỗ trợ đầy đủ HTML5, CSS3, JavaScript ES6 và sự kiện Page Visibility API.")
    add_bullet_level1(doc, "Kết nối mạng nội bộ giữa máy chủ ứng dụng và các cổng dịch vụ NoSQL (27017, 6379, 9042, 7687) luôn thông suốt với độ trễ ping dưới 10 mili-giây.")

    # -------------------------------------------------------------
    # 3.3. YÊU CẦU CHỨC NĂNG
    # -------------------------------------------------------------
    add_heading_level1(doc, "3.3. Yêu cầu chức năng")
    add_paragraph_huit(doc, "Bảng 3.2 tổng hợp 15 yêu cầu chức năng (Functional Requirements - FR) cốt lõi của hệ thống EduPro Academy, ánh xạ trực tiếp đến các mẫu truy cập dữ liệu (Access Patterns):")

    create_huit_table(
        doc,
        "Bảng 3.2: Danh mục yêu cầu chức năng và truy vết Access Pattern",
        ["Mã FR", "Tên yêu cầu chức năng", "Tác nhân", "Mô tả nghiệp vụ", "Ưu tiên", "Truy vết AP"],
        [
            ["FR-01", "Đăng ký & Đăng nhập phân quyền", "Tất cả", "Xác thực tài khoản, cấp phát JWT Token bảo mật và phân quyền vai trò.", "Cao", "AP-01"],
            ["FR-02", "Xem danh mục khóa học & Lọc", "Học viên", "Hiển thị danh mục khóa học, lọc theo trình độ CEFR và học phí.", "Cao", "AP-02"],
            ["FR-03", "Xem bài giảng & Tài liệu đính kèm", "Học viên", "Xem video bài học, tải handout PDF và thảo luận hỏi đáp.", "Cao", "AP-03"],
            ["FR-04", "Ghi log tiến độ học tập chuỗi thời gian", "Học viên", "Heartbeat mỗi 5s ghi nhận thời lượng xem video vào Cassandra.", "Cao", "AP-04"],
            ["FR-05", "Khởi tạo phòng thi & Đếm ngược", "Học viên", "Tải đề thi, tạo phiên thi thời gian thực trên Redis kèm TTL đếm ngược.", "Cao", "AP-05"],
            ["FR-06", "Lưu đáp án trực tiếp vào RAM", "Học viên", "Ghi nhận tức thời từng câu trả lời vào Redis Hash chống mất bài.", "Cao", "AP-06"],
            ["FR-07", "Giám sát chống gian lận Anti-cheat", "Học viên", "Bắt sự kiện chuyển tab 3 lần, ghi log vi phạm vào Cassandra.", "Cao", "AP-07"],
            ["FR-08", "Nộp bài, chấm điểm & Cập nhật BXH", "Học viên", "Chấm điểm tự động, lưu MongoDB và xếp hạng Redis Sorted Set.", "Cao", "AP-08, AP-09"],
            ["FR-09", "Xem lại chi tiết bài thi cũ", "Học viên", "Xem lại đáp án đã chọn, đáp án đúng và lời giải chi tiết từng câu.", "Trung bình", "AP-10"],
            ["FR-10", "Gamification tích lũy XP & Đổi quà", "Học viên", "Tích lũy điểm XP, đổi Streak Freeze và Voucher học phí.", "Trung bình", "AP-11"],
            ["FR-11", "Gợi ý lộ trình học tập tiên quyết", "Học viên", "Duyệt đồ thị Neo4j tìm chuỗi bài học điều kiện tiên quyết.", "Cao", "AP-12"],
            ["FR-12", "Khai phá Bạn Cùng Tiến (Study Buddies)", "Học viên", "Gợi ý bạn học dựa trên giao điểm đồng ghi danh khóa học.", "Cao", "AP-13"],
            ["FR-13", "Phân tích đường cong giữ chân video", "Giảng viên", "Tính toán tỷ lệ xem video chuỗi thời gian trên Cassandra.", "Trung bình", "AP-14"],
            ["FR-14", "Quản lý ngân hàng câu hỏi & Đề thi", "Giảng viên", "Tạo, cập nhật câu hỏi trắc nghiệm, cấu hình đề thi CMS.", "Cao", "AP-15"],
            ["FR-15", "Tường lửa giới hạn tần suất truy cập", "Hệ thống", "Sliding Window Rate Limiter 120 req/phút trên Redis.", "Cao", "AP-16"]
        ],
        [1.6, 3.4, 1.8, 5.2, 1.5, 1.5]
    )

    add_heading_level2(doc, "3.3.1. Đặc tả các Use Case cốt lõi")

    add_heading_level3(doc, "Use Case UC-01: Tham gia phòng thi trực tuyến và nộp bài chống gian lận")
    add_paragraph_huit(doc, "Mã Use Case: UC-01. Tên Use Case: Khảo sát năng lực trực tuyến và Chống gian lận thi cử. Tác nhân kích hoạt: Học viên (Student). Tiền điều kiện: Học viên đã đăng nhập thành công vào hệ thống và được cấp JWT Token hợp lệ.")
    add_paragraph_huit(
        doc,
        "1. Học viên truy cập danh sách kỳ thi, chọn đề thi (ví dụ: IELTS Academic Reading Mock Test) và bấm 'Bắt đầu làm bài'. "
        "2. Hệ thống kiểm tra điều kiện, đọc dữ liệu đề thi từ MongoDB, khởi tạo phiên thi trên Redis với đồng hồ đếm ngược TTL (ví dụ: 1800 giây) và danh sách câu hỏi xáo trộn. "
        "3. Giao diện phòng thi hiển thị toàn màn hình kèm đồng hồ đếm ngược. Trong quá trình làm bài, mỗi khi học viên nhấp chọn một đáp án, trình duyệt lập tức gửi yêu cầu API lưu ngay đáp án vào Redis Hash của phiên thi (lệnh HSET) mà không cần chờ nộp bài, giúp bảo toàn dữ liệu khi rớt mạng. "
        "4. Học viên hoàn thành bài thi và bấm nút 'Nộp bài thi' (hoặc đồng hồ đếm ngược trên Redis chạm mốc 0 giây). "
        "5. Hệ thống kích hoạt module chấm điểm tự động: Đối chiếu các câu trả lời trong Redis Hash với ngân hàng đáp án gốc, tính toán điểm số tổng kết. "
        "6. Hệ thống lưu kết quả vĩnh viễn vào MongoDB collection results, đồng thời cập nhật điểm số vào Bảng xếp hạng tuần Redis Sorted Set leaderboard:weekly bằng lệnh ZADD, và cộng điểm kinh nghiệm (+200 XP) cho học viên vào MongoDB users. "
        "7. Màn hình hiển thị kết quả bài thi, số câu đúng/sai, số điểm đạt được và vị trí xếp hạng mới của học viên.",
        "Luồng sự kiện chính (Main Flow): "
    )
    add_paragraph_huit(
        doc,
        "3a. Học viên chuyển sang tab trình duyệt khác hoặc thoát chế độ toàn màn hình để tra cứu tài liệu: "
        "3a.1. Trình duyệt bắt sự kiện visibilitychange và window blur, hiển thị cảnh báo đỏ trên màn hình: 'Cảnh báo gian lận! Bạn không được rời khỏi phòng thi'. "
        "3a.2. Hệ thống ghi nhận một sự kiện vi phạm vào bảng Cassandra elearning_tracking.exam_violations với thời gian sống TTL 7 ngày. "
        "3a.3. Nếu số lần vi phạm chạm ngưỡng quy định (3 lần cảnh báo), hệ thống tự động khóa bài thi, cưỡng chế nộp bài ngay lập tức và chuyển sang Bước 5.",
        "Luồng sự kiện rẽ nhánh (Alternative Flow): "
    )
    add_paragraph_huit(
        doc,
        "Kết quả bài thi được lưu vĩnh viễn trong MongoDB, điểm số phản ánh ngay trên Bảng xếp hạng Redis, dữ liệu phiên tạm trên Redis được dọn dẹp, và toàn bộ nhật ký vi phạm được lưu trữ phục vụ hậu kiểm trên Cassandra.",
        "Hậu điều kiện: "
    )
    add_paragraph_huit(
        doc,
        "Đọc: MongoDB (exams, questions), Redis (exam:answers:studentId). Ghi: Redis (exam:session, exam:answers, leaderboard:weekly), Cassandra (exam_violations), MongoDB (results, users.xp).",
        "Dữ liệu đọc/ghi phân tán: "
    )

    add_heading_level3(doc, "Use Case UC-02: Khai phá đồ thị lộ trình học tập và kết nối Bạn Cùng Tiến")
    add_paragraph_huit(doc, "Mã Use Case: UC-02. Tên Use Case: Khai phá đồ thị lộ trình học tập và Gợi ý Bạn Cùng Tiến. Tác nhân kích hoạt: Học viên (Student). Tiền điều kiện: Học viên đang xem một bài học hoặc truy cập trang hồ sơ cá nhân.")
    add_paragraph_huit(
        doc,
        "1. Học viên mở xem chi tiết một bài học ngữ pháp chuyên sâu (ví dụ: 'Mệnh đề quan hệ nâng cao'). "
        "2. Hệ thống gửi truy vấn Cypher tới Neo4j để tìm kiếm toàn bộ các bài học tiên quyết (Prerequisites) thông qua quan hệ [:PREREQUISITE_OF*]. "
        "3. Giao diện trực quan hóa đồ thị lộ trình học tập hiển thị các bài học cần hoàn thành trước đó với trạng thái trực quan (Đã học / Chưa học). "
        "4. Đồng thời, học viên nhấp vào mục 'Tìm Bạn Cùng Tiến': Hệ thống thực hiện thuật toán đồ thị tìm kiếm các học viên khác cùng ghi danh vào các khóa học tương tự nhưng chưa kết bạn (Co-enrollment Graph Pattern Matching). "
        "5. Danh sách các bạn học tiềm năng hiển thị kèm độ tương đồng học tập (Match Score tính theo số lượng khóa học chung). "
        "6. Học viên bấm 'Gửi lời mời kết bạn' để mở rộng mạng lưới học tập xã hội.",
        "Luồng sự kiện chính (Main Flow): "
    )
    add_paragraph_huit(
        doc,
        "Đọc: Neo4j (đồ thị Lesson, User, Course), MongoDB (chi tiết hồ sơ người dùng). Ghi: Neo4j (tạo quan hệ [:FRIEND_REQUEST] hoặc [:STUDY_WITH]).",
        "Dữ liệu đọc/ghi phân tán: "
    )

    add_heading_level2(doc, "3.3.2. Mô hình hóa nghiệp vụ (Business Process Modeling)")
    add_paragraph_huit(
        doc,
        "Quy trình nghiệp vụ thực tế ngoài đời thực của nền tảng EduPro Academy được mô phỏng khép kín theo chuỗi hành trình học tập và kiểm định năng lực của học viên: Học viên duyệt khóa học ➔ Đăng ký & Học bài ➔ Tương tác video & Đọc tài liệu ➔ Tham gia kỳ thi sát hạch ➔ Giám sát thi cử & Chống gian lận ➔ Chấm điểm tự động & Xếp hạng ➔ Đổi quà vinh danh Gamification ➔ Kết nối mạng lưới bạn học.",
        "Mô tả quy trình thực tế: "
    )
    add_paragraph_huit(
        doc,
        "Bảng 3.3 mô tả chi tiết quy trình BPMN với 4 làn bơi (Swimlanes: Học viên, Giảng viên, Hệ thống NoSQL, Quản trị viên), phân tích rõ dữ liệu sinh ra hoặc đọc tại mỗi bước nghiệp vụ - đây chính là cơ sở cốt lõi để xác lập danh mục Access Patterns ở mục 3.6:"
    )

    create_huit_table(
        doc,
        "Bảng 3.3: Ma trận phân tích quy trình nghiệp vụ BPMN và dữ liệu đọc/ghi",
        ["Làn bơi (Swimlane)", "Bước nghiệp vụ", "Hành động & Xử lý nghiệp vụ", "Dữ liệu sinh ra / Đọc (Truy vết NoSQL)"],
        [
            ["Học viên", "1. Đăng ký / Đăng nhập", "Nhập email và mật khẩu để xác thực tài khoản học tập.", "Đọc MongoDB users; Ghi Redis JWT token."],
            ["Học viên", "2. Chọn khóa & Học video", "Chọn bài học IELTS/TOEIC, xem bài giảng video bài học.", "Đọc Redis Cache courses; Ghi Cassandra events."],
            ["Hệ thống NoSQL", "3. Heartbeat ghi nhận", "Cứ mỗi 5 giây ghi nhận thời lượng xem của học viên vào CSDL.", "Ghi dồn dập vào Cassandra learning_events."],
            ["Học viên", "4. Vào phòng thi trắc nghiệm", "Bắt đầu làm bài thi khảo sát năng lực tiếng Anh trực tuyến.", "Đọc MongoDB exams; Ghi Redis exam:session."],
            ["Hệ thống NoSQL", "5. Giám sát thi & Anti-cheat", "Bắt sự kiện chuyển tab, ghi nhận số lần vi phạm gian lận.", "Ghi tức thời vào Cassandra exam_violations."],
            ["Học viên", "6. Nộp bài & Chấm điểm", "Nộp bài thi hoặc hết giờ làm bài, nhận điểm số tự động.", "Đọc Redis answers; Ghi MongoDB results."],
            ["Hệ thống NoSQL", "7. Xếp hạng & Tặng thưởng", "Cập nhật bảng xếp hạng tuần và cộng điểm kinh nghiệm XP.", "Ghi Redis leaderboard (ZADD); Ghi MongoDB users."],
            ["Học viên", "8. Đổi vật phẩm XP Store", "Dùng XP đổi Streak Freeze hoặc Voucher giảm giá học phí.", "Đọc/Ghi MongoDB users.xp, users.inventory."],
            ["Học viên", "9. Kết nối Bạn Cùng Tiến", "Xem gợi ý lộ trình tiên quyết và kết nối bạn học tương đồng.", "Đọc đồ thị Neo4j (:User)-[:ENROLLED_IN]->(:Course)."],
            ["Giảng viên", "10. Quản trị CMS & Đề thi", "Tạo bài học mới, cấu hình ngân hàng câu hỏi trắc nghiệm.", "Ghi MongoDB courses, exams, questions."],
            ["Giảng viên", "11. Xem Retention Curve", "Xem biểu đồ giữ chân người học để cải tiến chất lượng bài giảng.", "Đọc tổng hợp Cassandra learning_events."],
            ["Quản trị viên", "12. Giám sát & Rate Limiting", "Giám sát an ninh hệ thống, chặn tấn công brute-force/DDoS.", "Đọc/Ghi Redis Sliding Window Rate Limiter."]
        ],
        [2.0, 3.2, 4.8, 5.0]
    )

    add_heading_level2(doc, "3.3.3. Mô hình hóa chức năng (Functional Modeling)")
    add_paragraph_huit(
        doc,
        "Để chuẩn bị cho bản thiết kế kiến trúc phần mềm và cơ sở dữ liệu chi tiết ở Chương 4, hệ thống EduPro Academy được mô hình hóa chức năng thông qua 5 loại sơ đồ kỹ thuật chuẩn mực, trong đó mỗi sơ đồ đều làm nổi bật sự tham gia của 4 hệ cơ sở dữ liệu NoSQL chuyên biệt:",
        "Phương pháp luận mô hình hóa chức năng: "
    )

    create_huit_table(
        doc,
        "Bảng 3.4: Tổng hợp các sơ đồ mô hình hóa chức năng và điểm nhấn NoSQL",
        ["Loại sơ đồ kỹ thuật", "Phạm vi mô hình hóa tối thiểu", "Điểm nhấn và cơ chế NoSQL tham gia"],
        [
            ["Sơ đồ Use Case", "1 Use Case tổng quát toàn hệ thống + 4 Use Case phân hệ chuyên sâu.", "Mỗi ca sử dụng được gắn mã truy vết trực tiếp tới các mẫu truy cập Access Patterns (AP)."],
            ["Sơ đồ Hoạt động (Activity Diagram)", "2 luồng nghiệp vụ chính: Thi trắc nghiệm trực tuyến và Xem khóa học trực tuyến.", "Rẽ nhánh rõ ràng giữa cơ chế đọc bộ nhớ đệm (Cache Hit trên Redis) và đọc CSDL gốc (Cache Miss trên MongoDB)."],
            ["Sơ đồ Tuần tự (Sequence Diagram)", "2 luồng nghiệp vụ phức tạp: Nộp bài chấm điểm và Giám sát chống gian lận.", "Thiết kế Lifeline độc lập cho cả 4 CSDL NoSQL: MongoDB, Redis, Cassandra và Neo4j."],
            ["Sơ đồ Máy trạng thái (State Machine)", "Vòng đời của Thực thể Phiên thi trắc nghiệm (Exam Session Lifecycle).", "Chỉ rõ trạng thái lưu tại Redis Hash (TTL), chuyển trạng thái sang MongoDB khi nộp bài; phân tích yêu cầu nhất quán Strong vs Eventual."],
            ["Sơ đồ Luồng dữ liệu (DFD Mức 0, 1)", "Sơ đồ ngữ cảnh (Mức 0) và phân rã các tiến trình chính (Mức 1).", "Các kho dữ liệu (Data Stores) ánh xạ chính xác vào: MongoDB Collections, Cassandra Tables, Redis Key Patterns, Neo4j Node Labels."]
        ],
        [2.5, 4.5, 8.0]
    )

    add_heading_level3(doc, "Diễn giải chi tiết các sơ đồ mô hình hóa chức năng:")
    add_paragraph_huit(
        doc,
        "Sơ đồ Use Case tổng quát phân định rõ 3 tác nhân người dùng (Học viên, Giảng viên, Quản trị viên) và 1 tác nhân hệ thống tự động. Phân hệ Học viên bao gồm các nhóm chức năng học tập, thi cử, xã hội học tập và đổi thưởng. Điểm nhấn NoSQL thể hiện ở việc mỗi chức năng đều được ánh xạ rõ ràng với kho dữ liệu phụ trách, ví dụ: Chức năng thi cử gắn với Redis (tốc độ cao) và Cassandra (nhật ký vi phạm), chức năng gợi ý bạn học gắn với Neo4j (đồ thị xã hội).",
        "1. Phân hệ Use Case: "
    )
    add_paragraph_huit(
        doc,
        "Mô tả luồng hoạt động khi học viên yêu cầu xem thông tin chi tiết một khóa học. Hệ thống trước tiên kiểm tra khóa 'cache:courses' trên Redis. Nếu dữ liệu tồn tại (Cache Hit), trả về ngay lập tức với độ trễ dưới 5 ms. Nếu không có (Cache Miss), hệ thống đọc từ MongoDB collection courses, gửi trả dữ liệu cho người dùng đồng thời ghi ngược vào Redis với TTL là 3600 giây.",
        "2. Sơ đồ Hoạt động với nhánh Cache Hit / Cache Miss: "
    )
    add_paragraph_huit(
        doc,
        "Mô tả sự phối hợp đồng bộ giữa máy chủ ứng dụng và 4 hệ CSDL trong quá trình học viên nộp bài thi. Máy chủ đọc toàn bộ câu trả lời từ Lifeline Redis, đối chiếu đáp án với Lifeline MongoDB, lưu bảng kết quả vào Lifeline MongoDB, cập nhật thứ hạng trên Lifeline Redis Sorted Set, đồng thời kiểm tra số lần vi phạm gian lận trên Lifeline Cassandra để ghi chú vào biên bản thi cử.",
        "3. Sơ đồ Tuần tự với 4 Lifelines NoSQL riêng biệt: "
    )
    add_paragraph_huit(
        doc,
        "Một phiên thi trải qua các trạng thái tuần tự: CREATED (Khởi tạo phiên trên Redis với TTL 1800s) ➔ IN_PROGRESS (Học viên đang làm bài, cập nhật đáp án liên tục vào Redis Hash) ➔ SUBMITTED (Học viên chủ động nộp bài, chấm điểm và chuyển dữ liệu sang MongoDB) hoặc EXPIRED (Hết giờ làm bài trên Redis, hệ thống tự động thu hồi và nộp bài) hoặc TERMINATED_CHEATING (Học viên vi phạm quá 3 lần trên Cassandra, hệ thống cưỡng chế đóng bài thi). Quá trình lưu đáp án trong khi thi chấp nhận tính nhất quán cuối (Eventual Consistency), nhưng thời điểm nộp bài đòi hỏi tính nhất quán mạnh (Strong Consistency) để bảo đảm điểm số chính xác.",
        "4. Sơ đồ Máy trạng thái vòng đời phiên thi (Exam Session Lifecycle): "
    )
    add_paragraph_huit(
        doc,
        "Sơ đồ DFD Mức 1 phân rã hệ thống thành 6 tiến trình cốt lõi: P1 (Xác thực tài khoản), P2 (Quản lý học tập), P3 (Tổ chức thi cử), P4 (Giám sát chuỗi thời gian), P5 (Khai phá đồ thị xã hội), P6 (Bảo mật tường lửa). Các kho lưu trữ dữ liệu (Data Stores) tương ứng gồm: D1 (MongoDB: users, courses, exams, results), D2 (Redis: cache, exam_sessions, leaderboards, rate_limit), D3 (Cassandra: learning_events, exam_violations), D4 (Neo4j: User, Course, Lesson nodes và quan hệ).",
        "5. Sơ đồ Luồng dữ liệu DFD Mức 0 và Mức 1: "
    )

    # -------------------------------------------------------------
    # 3.4. YÊU CẦU PHI CHỨC NĂNG
    # -------------------------------------------------------------
    add_heading_level1(doc, "3.4. Yêu cầu phi chức năng")
    add_paragraph_huit(
        doc,
        "Các yêu cầu phi chức năng (Non-Functional Requirements - NFR) được định lượng bằng các chỉ số kỹ thuật cụ thể và có phương pháp đo lường, kiểm chứng rõ ràng, làm căn cứ trực tiếp để đối chiếu ở Chương 7 (Kiểm thử và Đánh giá hiệu năng):",
        "Tiêu chuẩn định lượng yêu cầu phi chức năng: "
    )

    create_huit_table(
        doc,
        "Bảng 3.5: Danh mục yêu cầu phi chức năng và phương pháp kiểm chứng",
        ["Mã NFR", "Nhóm yêu cầu", "Chỉ số yêu cầu kỹ thuật (Đo lường được)", "Phương pháp và công cụ kiểm chứng (Chương 7)"],
        [
            ["NFR-01", "Hiệu năng (Performance)", "Độ trễ đọc dữ liệu cached trên Redis p95 < 10 ms; Đọc chi tiết bài học MongoDB p95 < 50 ms tại tải 500 req/s.", "Sử dụng công cụ k6 / Apache JMeter để benchmark tải dồn dập."],
            ["NFR-02", "Khả năng mở rộng (Scalability)", "Khi mở rộng cụm Cassandra từ 1 node lên 3 node, thông lượng ghi sự kiện tăng tuyến tính ≥ 70%.", "Sử dụng công cụ cassandra-stress tool để đo thông lượng (ops/sec)."],
            ["NFR-03", "Độ sẵn sàng (Availability)", "Hệ thống duy trì độ sẵn sàng ≥ 99.9%. Khi 1 node Cassandra gặp sự cố tắt đột ngột, cụm vẫn đọc/ghi bình thường.", "Thực nghiệm tắt container Docker (Chaos Engineering) và kiểm tra log."],
            ["NFR-04", "Tính nhất quán (Consistency)", "Kết quả nộp bài và trừ điểm đổi quà: Strong Consistency; Thống kê lượt xem và bảng xếp hạng: Eventual Consistency.", "Thiết lập mức Write Concern / Consistency Level (QUORUM vs ONE)."],
            ["NFR-05", "Bảo mật (Security)", "Mã hóa toàn bộ mật khẩu người dùng bằng bcrypt (salt round = 10); Xác thực API qua JWT Token có thời hạn.", "Kiểm thử thâm nhập (Penetration Test) và rà soát cấu hình an ninh."],
            ["NFR-06", "Sao lưu & Phục hồi (Backup)", "Hỗ trợ tạo bản sao lưu dữ liệu tự động hằng ngày; Thời gian phục hồi hệ thống khi có sự cố (RTO) < 30 phút.", "Thực nghiệm kịch bản mongodump/mongorestore và cqlsh COPY export/import."]
        ],
        [1.6, 2.4, 6.0, 5.0]
    )

    # -------------------------------------------------------------
    # 3.5. YÊU CẦU DỮ LIỆU (ĐẶC THÙ NOSQL)
    # -------------------------------------------------------------
    add_heading_level1(doc, "3.5. Yêu cầu dữ liệu (Đặc thù NoSQL)")

    add_heading_level2(doc, "3.5.1. Đặc tính dữ liệu 3V (Volume, Velocity, Variety, TTL)")
    add_paragraph_huit(
        doc,
        "Đặc thù của một hệ thống E-Learning và Luyện thi quy mô lớn đòi hỏi phải xử lý các luồng dữ liệu đa dạng về cấu trúc, vận tốc sinh ra cực nhanh và khối lượng tích lũy tăng trưởng theo thời gian. Bảng 3.6 phân tích chi tiết đặc tính 3V (Volume, Velocity, Variety) kèm chính sách vòng đời dữ liệu (Time-to-Live - TTL):",
        "Phân tích đặc tính dữ liệu theo mô hình 3V: "
    )

    create_huit_table(
        doc,
        "Bảng 3.6: Đặc tính dữ liệu 3V và vòng đời TTL của hệ thống EduPro",
        ["Nhóm dữ liệu", "Volume (Dung lượng, Số bản ghi)", "Velocity (Vận tốc truy xuất)", "Variety (Đặc trưng cấu trúc)", "Vòng đời / TTL"],
        [
            ["Người dùng & Khóa học", "Khoảng 50.000 học viên, 500 khóa học (~10 GB).", "Đọc: 200 req/s;\nGhi: 5 req/s.", "Bán cấu trúc (Document JSON/BSON), cấu trúc bài học lồng nhau linh hoạt.", "Lưu trữ vĩnh viễn (MongoDB)."],
            ["Phiên thi & Bộ nhớ tạm", "Khoảng 2.000 phiên thi đồng thời (~500 MB RAM).", "Đọc/Ghi: 1.500 req/s\n(Ghi nhận từng đáp án).", "Key-Value, Hash, Set, String tối ưu cấu trúc dữ liệu trên RAM.", "TTL tự động: 30 - 90 phút (Redis)."],
            ["Sự kiện học tập & Vi phạm", "Khoảng 50 triệu bản ghi/tháng (~50 GB/tháng).", "Ghi dồn dập: 2.000 events/s;\nĐọc: 50 req/s.", "Chuỗi thời gian (Time-series), phân vùng theo học viên và mốc thời gian.", "TTL 7 ngày đối với vi phạm thi; 1 năm đối với tiến độ (Cassandra)."],
            ["Mạng lưới tri thức & Bạn bè", "Khoảng 100.000 nốt, 1 triệu quan hệ đồ thị.", "Đọc: 100 req/s;\nGhi: 10 req/s.", "Đồ thị thuộc tính có nhãn (LPG), quan hệ nhiều chiều không chuẩn hóa.", "Lưu trữ vĩnh viễn (Neo4j)."],
            ["Bảng xếp hạng & Thưởng", "Khoảng 50.000 thành viên xếp hạng (~50 MB RAM).", "Đọc: 500 req/s;\nGhi: 50 req/s.", "Sorted Set có trọng số điểm số (Score-Member pairs).", "Hết hạn định kỳ theo tuần (Redis)."],
            ["Ngân hàng đề & Câu hỏi", "Khoảng 10.000 câu hỏi, 500 bộ đề thi (~2 GB).", "Đọc: 300 req/s;\nGhi: 2 req/s.", "Bán cấu trúc JSON, hỗ trợ đa dạng loại câu hỏi trắc nghiệm.", "Lưu trữ vĩnh viễn (MongoDB)."]
        ],
        [2.5, 3.0, 3.0, 4.5, 2.0]
    )

    add_heading_level2(doc, "3.5.2. Mô hình khái niệm và từ điển dữ liệu")
    add_paragraph_huit(
        doc,
        "Ở mức độ quan niệm (Conceptual Level), hệ thống bao gồm các thực thể cốt lõi: Người dùng (User), Khóa học (Course), Bài học (Lesson), Kỳ thi (Exam), Câu hỏi (Question), Kết quả thi (Result), Phiên thi trực tuyến (ExamSession), Sự kiện học tập (LearningEvent), Nhật ký vi phạm (ExamViolation) và Quan hệ bạn bè/tiên quyết (GraphRelationships). Bảng 3.7 định nghĩa từ điển dữ liệu khái niệm chi tiết:",
        "Mô hình dữ liệu khái niệm: "
    )

    create_huit_table(
        doc,
        "Bảng 3.7: Từ điển dữ liệu mức quan niệm của hệ thống EduPro",
        ["Tên thực thể", "Tên thuộc tính", "Kiểu dữ liệu", "Bắt buộc", "Mô tả nghiệp vụ và ví dụ dữ liệu"],
        [
            ["User", "userId, email, passwordHash, fullName, role, xp, streak", "String, Int", "Có", "Thông tin tài khoản học viên, số điểm tích lũy XP (ví dụ: 1200 XP)."],
            ["Course", "courseId, title, level, price, lessonsCount, category", "String, Double, Int", "Có", "Khóa học luyện thi (ví dụ: 'IELTS Intensive 6.5+', Level B2)."],
            ["Lesson", "lessonId, courseId, title, videoUrl, duration, order", "String, Int", "Có", "Bài học thuộc khóa học kèm link video và thời lượng (giây)."],
            ["Exam", "examId, title, durationMinutes, passingScore, questionsCount", "String, Int", "Có", "Đề thi sát hạch (ví dụ: 'IELTS Academic Reading Test 01', 60 phút)."],
            ["Question", "questionId, examId, content, options, correctOption, explanation", "String, Array, Int", "Có", "Nội dung câu hỏi trắc nghiệm kèm 4 lựa chọn và giải thích đáp án."],
            ["ExamSession", "sessionId, studentId, examId, answersHash, startTime, ttlExpiry", "String, Hash, Timestamp", "Có", "Phiên thi đang làm trên RAM, chứa danh sách câu trả lời tức thời."],
            ["LearningEvent", "studentId, lessonId, timestamp, eventType, playbackPosition", "UUID, Timestamp, String, Double", "Có", "Sự kiện heartbeat xem video bài giảng (play, pause, progress)."],
            ["ExamViolation", "studentId, examId, timestamp, violationType, details", "UUID, Timestamp, String", "Có", "Nhật ký phát hiện chuyển tab hoặc thoát toàn màn hình khi làm bài."],
            ["StudyBuddy", "studentId1, studentId2, commonCoursesCount, matchScore", "String, Int, Double", "Có", "Quan hệ bạn cùng tiến khai phá từ đồ thị đồng ghi danh khóa học."]
        ],
        [2.2, 2.8, 2.0, 1.5, 6.5]
    )

    # -------------------------------------------------------------
    # 3.6. MẪU TRUY CẬP DỮ LIỆU (ACCESS PATTERNS)
    # -------------------------------------------------------------
    add_heading_level1(doc, "3.6. Mẫu truy cập dữ liệu (Access Patterns) – Bắt buộc")
    add_paragraph_huit(
        doc,
        "Trong thiết kế cơ sở dữ liệu quan hệ (RDBMS), việc thiết kế bảng thường bắt đầu từ việc chuẩn hóa thực thể (1NF, 2NF, 3NF). Tuy nhiên, trong kỷ nguyên NoSQL, phương pháp luận thiết kế bắt buộc phải theo hướng Tiếp cận theo câu hỏi truy vấn (Query-Driven Data Modeling). Điều này có nghĩa là mọi cấu trúc dữ liệu (Collections, Column Families, Redis Keys, Graph Edges) phải được thiết kế xoay quanh các Mẫu truy cập dữ liệu (Access Patterns) thực tế của ứng dụng.",
        "Nguyên lý thiết kế hướng truy vấn: "
    )
    add_paragraph_huit(
        doc,
        "Bảng 3.8 liệt kê đầy đủ 16 mẫu truy cập dữ liệu cốt lõi (AP-01 đến AP-16) của hệ thống EduPro Academy. Mọi dòng trong bảng này sẽ được ánh xạ trực tiếp sang cấu trúc dữ liệu vật lý ở Chương 4 và kiểm chứng bằng các ca kiểm thử ở Chương 7:"
    )

    create_huit_table(
        doc,
        "Bảng 3.8: Danh mục 16 mẫu truy cập dữ liệu cốt lõi (Access Patterns)",
        ["Mã AP", "Mẫu truy cập nghiệp vụ", "Loại", "Tham số đầu vào", "Tần suất", "Độ trễ", "Nhất quán"],
        [
            ["AP-01", "Xác thực đăng nhập và lấy thông tin User kèm Role", "Đọc", "email, password", "Rất cao", "< 20 ms", "Strong"],
            ["AP-02", "Xem danh sách khóa học, lọc theo trình độ CEFR", "Đọc", "level, minPrice, maxPrice", "Rất cao", "< 10 ms", "Eventual"],
            ["AP-03", "Lấy chi tiết khóa học kèm danh sách bài học và handout", "Đọc", "courseId", "Cao", "< 50 ms", "Eventual"],
            ["AP-04", "Ghi nhận heartbeat tiến độ xem video bài học", "Ghi", "studentId, lessonId, timestamp, pos", "Cực cao", "< 10 ms", "Eventual"],
            ["AP-05", "Khởi tạo phiên thi trắc nghiệm kèm đồng hồ đếm ngược", "Ghi", "studentId, examId, duration", "Cao", "< 10 ms", "Strong"],
            ["AP-06", "Lưu tức thời câu trả lời từng câu vào bộ nhớ RAM", "Ghi", "studentId, questionId, selectedOption", "Cực cao", "< 5 ms", "Eventual"],
            ["AP-07", "Ghi nhật ký vi phạm rời phòng thi (Anti-cheat)", "Ghi", "studentId, examId, timestamp, reason", "Trung bình", "< 10 ms", "Eventual"],
            ["AP-08", "Đọc toàn bộ bài làm từ RAM để chấm điểm tự động", "Đọc", "studentId, examId", "Cao", "< 10 ms", "Strong"],
            ["AP-09", "Lưu vĩnh viễn kết quả bài thi và cập nhật bảng xếp hạng", "Ghi", "studentId, examId, score, answers", "Cao", "< 50 ms", "Strong"],
            ["AP-10", "Xem lại lịch sử kết quả thi và lời giải chi tiết", "Đọc", "studentId, resultId", "Trung bình", "< 50 ms", "Eventual"],
            ["AP-11", "Tích lũy điểm XP và đổi vật phẩm Gamification", "Đọc/Ghi", "studentId, itemId, xpCost", "Trung bình", "< 30 ms", "Strong"],
            ["AP-12", "Truy vấn chuỗi bài học điều kiện tiên quyết (Prerequisites)", "Đọc", "lessonId", "Cao", "< 50 ms", "Eventual"],
            ["AP-13", "Khai phá gợi ý Bạn Cùng Tiến (Study Buddies)", "Đọc", "studentId, limit", "Trung bình", "< 100 ms", "Eventual"],
            ["AP-14", "Tính toán đường cong giữ chân video (Retention Curve)", "Đọc", "lessonId, videoDuration", "Trung bình", "< 100 ms", "Eventual"],
            ["AP-15", "Thêm mới/Cập nhật ngân hàng câu hỏi và bộ đề thi CMS", "Ghi", "examId, questionData", "Thấp", "< 50 ms", "Strong"],
            ["AP-16", "Kiểm tra giới hạn tần suất truy cập (Rate Limiter)", "Đọc/Ghi", "clientIp / userId, currentTimestamp", "Cực cao", "< 5 ms", "Strong"]
        ],
        [1.5, 5.0, 1.5, 3.0, 1.5, 1.3, 1.2]
    )

    # -------------------------------------------------------------
    # 3.7. YÊU CẦU GIAO DIỆN
    # -------------------------------------------------------------
    add_heading_level1(doc, "3.7. Yêu cầu giao diện")

    add_heading_level2(doc, "3.7.1. Giao diện người dùng (User Interface)")
    add_paragraph_huit(
        doc,
        "Giao diện người dùng EduPro Academy được thiết kế theo phong cách hiện đại, trực quan, hỗ trợ hiển thị đáp ứng (Responsive Design) hoàn hảo trên cả máy tính để bàn (Desktop), máy tính bảng (Tablet) và điện thoại thông minh (Mobile). Hệ thống bao gồm 5 cụm màn hình giao diện chính:",
        "Đặc tả các màn hình giao diện cốt lõi: "
    )
    add_bullet_level1(doc, "Màn hình Trang chủ & Danh mục khóa học: Hiển thị các khóa học nổi bật, bộ lọc khóa học đa tiêu chí (IELTS, TOEIC, Giao tiếp), thanh tìm kiếm nhanh và bảng tin vinh danh top học viên xuất sắc.")
    add_bullet_level1(doc, "Màn hình Phòng học trực tuyến (Learning Studio): Khung phát video bài giảng với thanh tiến độ thông minh, bảng danh sách bài học bên phải, khu vực tải tài liệu Handout PDF và tab thảo luận hỏi đáp.")
    add_bullet_level1(doc, "Màn hình Phòng thi trắc nghiệm trực tuyến (Exam Room): Giao diện toàn màn hình (Fullscreen Mode) loại bỏ mọi yếu tố gây xao nhãng, đồng hồ đếm ngược thời gian thực, bảng điều hướng 40 câu hỏi và hệ thống pop-up cảnh báo gian lận vi phạm.")
    add_bullet_level1(doc, "Màn hình Mạng lưới bạn học & Đồ thị tri thức (Knowledge & Social Graph): Trực quan hóa cây tri thức lộ trình bài học bằng canvas đồ họa sinh động và danh sách gợi ý bạn học tương đồng.")
    add_bullet_level1(doc, "Màn hình Quản trị CMS & Phân tích chuyên sâu: Bảng điều khiển dành cho Giảng viên theo dõi biểu đồ đường cong giữ chân video và công cụ soạn thảo đề thi trực quan.")

    add_heading_level2(doc, "3.7.2. Giao diện lập trình ứng dụng (RESTful API)")
    add_paragraph_huit(
        doc,
        "Hệ thống cung cấp danh mục API chuẩn RESTful, định dạng dữ liệu JSON, bảo mật qua Header 'Authorization: Bearer <JWT_Token>'. Các nhóm endpoint chính bao gồm:",
        "Đặc tả kiến trúc RESTful API: "
    )
    add_bullet_level1(doc, "Nhóm Auth API: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout.")
    add_bullet_level1(doc, "Nhóm Courses API: GET /api/courses, GET /api/courses/:id, POST /api/courses (Admin).")
    add_bullet_level1(doc, "Nhóm Exams API: GET /api/exams, GET /api/exams/:id/start, POST /api/exams/answer, POST /api/exams/submit, GET /api/exams/results/:id.")
    add_bullet_level1(doc, "Nhóm Telemetry API: POST /api/telemetry/heartbeat (Cassandra), POST /api/telemetry/violation (Anti-cheat), GET /api/analytics/retention/:lessonId.")
    add_bullet_level1(doc, "Nhóm Graph & Peers API: GET /api/peers/buddies (Neo4j), GET /api/graph/roadmap/:lessonId.")
    add_bullet_level1(doc, "Nhóm Gamification API: GET /api/gamification/leaderboard (Redis ZSET), POST /api/gamification/redeem.")

    add_heading_level2(doc, "3.7.3. Giao diện phần cứng và phần mềm")
    add_paragraph_huit(
        doc,
        "Hệ thống yêu cầu máy chủ chạy trên hệ điều hành Ubuntu Linux 22.04 LTS hoặc Windows Server 2022. Môi trường triển khai bao gồm Docker Engine v24.0+ và Docker Compose v2.20+ để điều phối container đồng thời cho: Node.js runtime (v18.x hoặc v20.x LTS), MongoDB Community Server (v6.0), Redis Stack Server (v7.0), Apache Cassandra (v4.1) và Neo4j Community Edition (v5.12).",
        "Môi trường hạ tầng và phiên bản phần mềm: "
    )

    # -------------------------------------------------------------
    # 3.8. MA TRẬN TRUY VẾT YÊU CẦU (TRACEABILITY MATRIX)
    # -------------------------------------------------------------
    add_heading_level1(doc, "3.8. Ma trận truy vết yêu cầu")
    add_paragraph_huit(
        doc,
        "Ma trận truy vết yêu cầu (Requirements Traceability Matrix - RTM) trong Bảng 3.9 thiết lập sợi dây liên kết chặt chẽ xuyên suốt từ Yêu cầu chức năng (FR ở Chương 3) ➔ Mẫu truy cập dữ liệu (AP ở Chương 3) ➔ Cấu trúc CSDL NoSQL đáp ứng (sẽ được thiết kế chi tiết ở Chương 4) ➔ Mã ca kiểm thử nghiệm thu (sẽ được thực thi ở Chương 7). Điều này bảo đảm mọi yêu cầu đặt ra đều được thiết kế và kiểm thử đầy đủ, không bị bỏ sót bất kỳ tính năng nào:",
        "Vai trò của ma trận truy vết: "
    )

    create_huit_table(
        doc,
        "Bảng 3.9: Ma trận truy vết yêu cầu FR ➔ AP ➔ CSDL ➔ Test Case",
        ["Mã FR", "Tên yêu cầu chức năng", "Truy vết AP", "CSDL & Cấu trúc đáp ứng (Chương 4)", "Mã Test Case (Chương 7)"],
        [
            ["FR-01", "Đăng ký & Đăng nhập JWT", "AP-01", "MongoDB (collection: users) + Redis Blacklist", "TC-02, TC-03"],
            ["FR-02", "Xem danh mục khóa học & Lọc", "AP-02", "Redis String (cache:courses) + MongoDB courses", "TC-04"],
            ["FR-03", "Chi tiết bài học & Handouts", "AP-03", "MongoDB courses.lessons (Embedded Document)", "TC-05"],
            ["FR-04", "Log xem video chuỗi thời gian", "AP-04", "Cassandra (table: learning_events CQL)", "TC-06, TC-07"],
            ["FR-05", "Khởi tạo phòng thi đếm ngược", "AP-05", "Redis Key TTL (exam:session:studentId)", "TC-08"],
            ["FR-06", "Lưu đáp án trực tiếp vào RAM", "AP-06", "Redis Hash (exam:answers:studentId)", "TC-09, TC-10"],
            ["FR-07", "Giám sát Anti-cheat 3 lần", "AP-07", "Cassandra (table: exam_violations USING TTL)", "TC-11"],
            ["FR-08", "Chấm điểm & Cập nhật BXH", "AP-08, 09", "MongoDB results + Redis ZSET (leaderboard:weekly)", "TC-11, TC-12"],
            ["FR-09", "Xem lại chi tiết bài thi cũ", "AP-10", "MongoDB results ($lookup với questions)", "TC-11"],
            ["FR-10", "Gamification & Đổi quà XP", "AP-11", "MongoDB users.xp + Cửa hàng vật phẩm", "TC-17"],
            ["FR-11", "Gợi ý lộ trình học tập", "AP-12", "Neo4j LPG ([:PREREQUISITE_OF*]-> Lesson)", "TC-14"],
            ["FR-12", "Gợi ý Bạn Cùng Tiến", "AP-13", "Neo4j (Co-enrollment Match) + Redis Pub/Sub", "TC-15, TC-21"],
            ["FR-13", "Phân tích Retention Curve", "AP-14", "Cassandra learning_events time-series aggregation", "TC-16"],
            ["FR-14", "CMS Khóa học & Đề thi", "AP-15", "MongoDB courses, exams, questions", "TC-04, TC-05"],
            ["FR-15", "Tường lửa Rate Limiter", "AP-16", "Redis Sorted Set (Sliding Window Algorithm)", "TC-20"]
        ],
        [1.4, 3.6, 1.8, 5.2, 3.0]
    )

    add_paragraph_huit(
        doc,
        "Toàn bộ các đặc tả yêu cầu chức năng, yêu cầu phi chức năng, đặc tính dữ liệu 3V và danh mục 16 mẫu truy cập dữ liệu (Access Patterns) ở Chương 3 đã thiết lập nền tảng khoa học vững chắc. Đây là kim chỉ nam trực tiếp để nhóm tiến hành thiết kế chi tiết kiến trúc mô hình dữ liệu (Software Design Specification - SDS) cho cả 4 hệ CSDL NoSQL trong Chương 4 tiếp theo.",
        "Kết luận Chương 3: "
    )
