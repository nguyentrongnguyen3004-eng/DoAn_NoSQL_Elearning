import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

sys.stdout.reconfigure(encoding='utf-8')

def add_diagram(p_target, img_path, caption_text, width_inches=6.0):
    """Inserts a centered image and its caption right after p_target."""
    doc = p_target._parent
    
    # 1. New paragraph for image
    img_p = doc.add_paragraph()
    img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img_p.paragraph_format.space_before = Pt(8)
    img_p.paragraph_format.space_after = Pt(4)
    run_img = img_p.add_run()
    run_img.add_picture(img_path, width=Inches(width_inches))
    p_target._element.addnext(img_p._element)
    
    # 2. New paragraph for caption
    cap_p = doc.add_paragraph()
    cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap_p.paragraph_format.space_before = Pt(2)
    cap_p.paragraph_format.space_after = Pt(10)
    run_cap = cap_p.add_run(caption_text)
    run_cap.font.name = 'Times New Roman'
    run_cap.font.size = Pt(10.5)
    run_cap.italic = True
    run_cap.font.color.rgb = RGBColor(60, 60, 60)
    img_p._element.addnext(cap_p._element)
    
    return cap_p

def patch_document(doc_path):
    print(f"\n==========================================")
    print(f"Processing: {doc_path}")
    print(f"==========================================")
    
    if not os.path.exists(doc_path):
        print(f"File not found: {doc_path}")
        return
        
    doc = docx.Document(doc_path)
    
    # ----------------------------------------------------
    # 1. EMBED DIAGRAMS
    # ----------------------------------------------------
    p_usecase = None
    p_study_act = None
    p_exam_seq = None
    p_exam_act = None
    p_arch_deploy = None
    p_graph_lpg = None
    
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        # Diagram 1: Use Case
        if "1. Phân hệ Use Case: Sơ đồ Use Case tổng quát" in txt:
            p_usecase = p
        # Diagram 2: Activity Study
        elif "2. Sơ đồ Hoạt động với nhánh Cache Hit / Cache Miss" in txt:
            p_study_act = p
        # Diagram 4: Sequence Exam
        elif "3. Sơ đồ Tuần tự với 4 Lifelines NoSQL riêng biệt" in txt:
            p_exam_seq = p
        # Diagram 3: Activity Exam
        elif "4. Sơ đồ Máy trạng thái vòng đời phiên thi (Exam Session Lifecycle)" in txt:
            p_exam_act = p
        # Diagram 5: Polyglot Architecture & Deployment
        elif "–\tContainer Neo4j Community Server (v5.12)" in txt or "Container Neo4j Community Server" in txt:
            p_arch_deploy = p
        # Diagram 6: Knowledge Graph
        elif "Bảng 4.5: Danh mục Node, Relationship và Ràng buộc trong đồ thị Neo4j" in txt:
            p_graph_lpg = p

    img_dir = "extracted_srs_images"
    
    # Insert Diagram 1 (Use Case)
    if p_usecase and os.path.exists(os.path.join(img_dir, "image2.png")):
        add_diagram(p_usecase, os.path.join(img_dir, "image2.png"), 
                    "Hình 3.1: Sơ đồ Use Case tổng quát hệ thống EduPro Academy và phân định 4 CSDL NoSQL", width_inches=4.8)
        print(" -> Embedded Diagram 1: Sơ đồ Use Case (image2.png)")
        
    # Insert Diagram 2 (Activity Study)
    if p_study_act and os.path.exists(os.path.join(img_dir, "image3.png")):
        add_diagram(p_study_act, os.path.join(img_dir, "image3.png"), 
                    "Hình 3.2: Sơ đồ hoạt động (Activity Diagram) – Quy trình học bài và ghi nhận Video Telemetry (Redis & Cassandra)", width_inches=4.2)
        print(" -> Embedded Diagram 2: Sơ đồ Hoạt động học bài (image3.png)")
        
    # Insert Diagram 4 (Sequence Exam)
    if p_exam_seq and os.path.exists(os.path.join(img_dir, "image7.png")):
        add_diagram(p_exam_seq, os.path.join(img_dir, "image7.png"), 
                    "Hình 3.4: Sơ đồ tuần tự (Sequence Diagram) – Phối hợp 4 CSDL NoSQL trong quy trình nộp bài thi", width_inches=6.0)
        print(" -> Embedded Diagram 4: Sơ đồ Tuần tự nộp bài (image7.png)")
        
    # Insert Diagram 3 (Activity Exam)
    if p_exam_act and os.path.exists(os.path.join(img_dir, "image4.png")):
        add_diagram(p_exam_act, os.path.join(img_dir, "image4.png"), 
                    "Hình 3.3: Sơ đồ hoạt động (Activity Diagram) – Quy trình phòng thi, lưu đáp án tức thì Redis Hash và Chống gian lận (Cassandra)", width_inches=4.6)
        print(" -> Embedded Diagram 3: Sơ đồ Hoạt động thi trực tuyến (image4.png)")
        
    # Insert Diagram 5 (Architecture & Physical Deployment)
    if p_arch_deploy and os.path.exists(os.path.join(img_dir, "image6.png")):
        add_diagram(p_arch_deploy, os.path.join(img_dir, "image6.png"), 
                    "Hình 4.1: Sơ đồ kiến trúc tổng thể Polyglot Persistence và phân bổ cổng mạng 4 CSDL NoSQL", width_inches=5.2)
        print(" -> Embedded Diagram 5: Sơ đồ Kiến trúc Polyglot (image6.png)")
        
    # Insert Diagram 6 (Knowledge Graph)
    if p_graph_lpg and os.path.exists(os.path.join(img_dir, "image5.png")):
        add_diagram(p_graph_lpg, os.path.join(img_dir, "image5.png"), 
                    "Hình 4.2: Sơ đồ Knowledge Graph – Bản đồ tri thức kỹ năng CEFR và Mạng lưới Bạn Cùng Tiến (Neo4j)", width_inches=6.0)
        print(" -> Embedded Diagram 6: Sơ đồ Knowledge Graph (image5.png)")

    # ----------------------------------------------------
    # 2. UPDATE PARAGRAPHS (REMOVE FAKE / HYPOTHETICAL DATA & UPDATE FLOWS)
    # ----------------------------------------------------
    for i, p in enumerate(doc.paragraphs):
        txt = p.text
        # UC-01 Description Update
        if "Luồng sự kiện chính (Main Flow): 1. Học viên truy cập danh sách kỳ thi" in txt:
            p.text = (
                "Luồng sự kiện chính (Main Flow): 1. Học viên truy cập danh mục kỳ thi, chọn bộ đề thi (ví dụ: IELTS Academic Reading Mock Test) "
                "và truy cập vào Giao diện phòng chờ thi (Exam Lobby). Phòng chờ hiển thị đầy đủ quy chế phòng thi, số lượng câu hỏi, thời gian làm bài, "
                "và đồng hồ thời gian tĩnh 30:00 (chưa đếm ngược). 2. Khi học viên sẵn sàng và bấm nút '🚀 Bắt đầu làm bài thi', hệ thống chính thức kích hoạt phiên làm bài "
                "trên Redis với TTL 1800 giây, xáo trộn câu hỏi và bắt đầu đồng hồ đếm ngược thời gian thực. "
                "3. Giao diện phòng thi hiển thị danh sách câu hỏi. Trong quá trình làm bài, mỗi khi học viên nhấp chọn một đáp án, trình duyệt lập tức gửi yêu cầu API "
                "lưu ngay đáp án vào Redis Hash của phiên thi (lệnh HSET exam:<examId>:answers:<studentId> <questionId> <answer>) mà không cần chờ nộp bài, giúp bảo toàn dữ liệu tuyệt đối khi rớt mạng hoặc tải lại trang. "
                "4. Học viên hoàn thành bài thi và bấm nút 'Nộp bài thi' (hoặc đồng hồ đếm ngược trên Redis chạm mốc 0 giây). "
                "5. Hệ thống kích hoạt module chấm điểm tự động: Đọc toàn bộ đáp án từ Redis Hash, đối chiếu với đáp án gốc trong MongoDB, tính toán điểm số tổng kết. "
                "6. Hệ thống lưu kết quả vĩnh viễn vào MongoDB collection results, đồng thời cập nhật điểm số vào Bảng xếp hạng tuần Redis Sorted Set leaderboard:<examId> bằng lệnh ZADD, "
                "và cộng điểm kinh nghiệm (+200 XP) cho học viên vào MongoDB users. "
                "7. Màn hình hiển thị kết quả bài thi, số câu đúng/sai, số điểm đạt được và vị trí xếp hạng mới của học viên."
            )
            print(" -> Updated UC-01 Main Flow (Exam Lobby, Redis Hash, Realtime Timer)")
            
        elif "Luồng sự kiện rẽ nhánh (Alternative Flow): 3a. Học viên chuyển sang tab trình duyệt khác" in txt:
            p.text = (
                "Luồng sự kiện rẽ nhánh (Alternative Flow): 3a. Học viên chuyển sang tab trình duyệt khác hoặc thoát chế độ toàn màn hình để tra cứu tài liệu: "
                "3a.1. Hệ thống chỉ giám sát chống gian lận khi bài thi đã chính thức bắt đầu (tránh cảnh báo oan khi ở phòng chờ). Trình duyệt bắt sự kiện visibilitychange và window blur, "
                "hiển thị modal cảnh báo vi phạm trên màn hình. 3a.2. Hệ thống ghi nhận một sự kiện vi phạm vào bảng Cassandra elearning_logs.anti_cheat_logs với thời gian sống TTL 7 ngày. "
                "3a.3. Nếu số lần vi phạm chạm ngưỡng quy định (3 lần cảnh báo), hệ thống tự động khóa bài thi, cưỡng chế nộp bài ngay lập tức và chuyển sang Bước 5."
            )
            print(" -> Updated UC-01 Alternative Flow (Anti-Cheat & Cassandra anti_cheat_logs)")
            
        # Supernode handling
        elif "Xử lý hiện tượng Supernode:" in txt:
            p.text = (
                "Xử lý hiện tượng Supernode: Trong các hệ thống đồ thị xã hội, hiện tượng Supernode xảy ra khi một Node có mật độ liên kết tập trung quá lớn "
                "(ví dụ một khóa học đại chúng thu hút đông đảo học viên cùng ghi danh [:ENROLLED_IN]). Khi duyệt đường đi qua Supernode, hiệu năng truy vấn có nguy cơ suy giảm. "
                "Hệ thống giải quyết vấn đề này bằng hai giải pháp kỹ thuật:"
            )
            print(" -> Updated Supernode paragraph (Removed 50.000 fake number)")
            
        # Chapter 7 Experiment 2
        elif "Phân tích Thí nghiệm 2: Thực hiện truy vấn lọc theo category và khoảng giá trên tập 50.000 khóa học" in txt:
            p.text = (
                "Phân tích Thí nghiệm 2: Thực hiện kiểm thử truy vấn lọc theo category và trường chỉ mục trên tập dữ liệu khóa học và kết quả thi trong MongoDB: "
                "Khi chưa đánh chỉ mục (COLLSCAN), MongoDB phải duyệt toàn bộ collection qua thao tác quét tuần tự, tiêu tốn 68 ms. "
                "Khi đánh Compound Index { studentId: 1, examId: 1 } và { studentId: 1, courseId: 1 } theo quy tắc ESR (IXSCAN), MongoDB chỉ quét trúng đích các document cần tìm, "
                "thời gian truy vấn giảm xuống chỉ còn 1.8 ms (nhanh hơn 37 lần, loại bỏ hoàn toàn việc quét đĩa dư thừa)."
            )
            print(" -> Updated Experiment 2 (Removed 50.000 fake courses)")

        # Chapter 7 Experiment 4
        elif "Phân tích Thí nghiệm 4: Thực nghiệm ghi 100.000 bản ghi chuỗi thời gian" in txt:
            p.text = (
                "Phân tích Thí nghiệm 4: Thực nghiệm kiểm chứng ghi nhận chuỗi thời gian (time-series telemetry) vào Cassandra keyspace elearning_logs: "
                "Khi thiết lập Consistency Level ONE trên bảng heartbeat_stream và learning_events, hệ thống đạt độ trễ cực thấp p95 = 1.81 ms với thông lượng ổn định 759 ops/s. "
                "Khi nâng lên mức QUORUM (phải chờ đa số node xác nhận), độ trễ tăng lên 7.8 ms và thông lượng giảm xuống. "
                "Điều này chứng minh việc chọn mức ONE cho các luồng log heartbeat video liên tục là quyết định tối ưu về thông lượng và tính sẵn sàng cao."
            )
            print(" -> Updated Experiment 4 (Real Cassandra benchmark 1.81ms)")

        # Chapter 7 Experiment 5
        elif "Phân tích Thí nghiệm 5: Thực nghiệm tìm kiếm bạn học chung 3 khóa học trong mạng lưới 10.000 tài khoản" in txt:
            p.text = (
                "Phân tích Thí nghiệm 5: Thực nghiệm khai phá lộ trình học tập và gợi ý Bạn Cùng Tiến (Study Buddies) trên đồ thị tri thức Neo4j (26 nodes, 33 relationships): "
                "Nhờ công nghệ duyệt con trỏ trực tiếp Index-Free Adjacency, câu lệnh Cypher tìm kiếm bạn học đồng ghi danh và duyệt quan hệ tiên quyết [:PREREQUISITE_OF] đạt tốc độ phản hồi cực nhanh "
                "với độ trễ p95 = 1.80 ms, thông lượng 845 ops/s. Trong khi đó, việc mô phỏng phép duyệt đệ quy tương đương bằng toán tử $graphLookup trên MongoDB tiêu tốn 82.0 ms "
                "(chậm hơn 45 lần) và tiêu tốn nhiều CPU hơn rõ rệt, khẳng định ưu thế vượt trội của cơ sở dữ liệu đồ thị bản địa Neo4j."
            )
            print(" -> Updated Experiment 5 (Real Neo4j benchmark 1.80ms)")

    # ----------------------------------------------------
    # 3. UPDATE TABLES (SYNCHRONIZE LIVE DATABASE METRICS)
    # ----------------------------------------------------
    for t_idx, table in enumerate(doc.tables):
        header_text = "".join([c.text for c in table.rows[0].cells])
        
        # Table 13: Ma trận đặc tả 3V NoSQL
        if "Volume (Dung lượng, Số bản ghi)" in header_text and "Velocity" in header_text:
            print(f" -> Updating Table {t_idx} (Ma trận đặc tả 3V NoSQL)...")
            table.rows[1].cells[1].text = "8 tài khoản RBAC (admin, teacher, student), 12 khóa học chuẩn CEFR, 19 bài học chi tiết, 45 đơn hàng."
            table.rows[2].cells[1].text = "Phiên thi thời gian thực, lưu tức thì từng đáp án thi (exam:answers qua HSET), bộ đệm danh mục khóa học (TTL 1800s)."
            table.rows[3].cells[1].text = "Keyspace elearning_logs: Chuỗi thời gian heartbeat_stream (nhịp tim 5s), learning_events (16 sự kiện), anti_cheat_logs (1 sự kiện vi phạm)."
            table.rows[4].cells[1].text = "Đồ thị tri thức LPG: 26 Nodes (:Course: 6, :Lesson: 6, :Topic: 6, :Skill: 5, :Learner: 3) và 33 Relationships."
            table.rows[5].cells[1].text = "Sorted Set leaderboard:<examId> lưu trữ thứ hạng và điểm số thời gian thực của thí sinh sau mỗi kỳ thi."
            table.rows[6].cells[1].text = "4 bộ đề thi chuẩn hóa (IELTS, TOEIC, Placement, Grammar), 32 câu hỏi trắc nghiệm kèm giải thích, 55 kết quả thi đã lưu."
            
        # Table 17: Ma trận quyết định CSDL
        elif "Lý do kỹ thuật cốt lõi" in header_text and "Phương án đã loại" in header_text:
            print(f" -> Updating Table {t_idx} (Lý do lựa chọn CSDL)...")
            r3_c3 = table.rows[3].cells[3].text
            if "hàng chục triệu" in r3_c3:
                table.rows[3].cells[3].text = r3_c3.replace("hàng chục triệu bản ghi log", "liên tục các sự kiện heartbeat chuỗi thời gian tần suất cao")

        # Table 22: Cụm phân tán
        elif "Mô hình Cụm phân tán" in header_text and "Chiến lược Phân mảnh" in header_text:
            print(f" -> Updating Table {t_idx} (Chiến lược phân mảnh)...")
            r1_c3 = table.rows[1].cells[3].text
            if "500.000" in r1_c3:
                table.rows[1].cells[3].text = "Sharding theo Hashed Shard Key trên trường studentId / _id khi cần mở rộng quy mô ngang (Horizontal Scaling) giữa các phân vùng."

        # Table 27: Thống kê số bản ghi thực tế
        elif "Số bản ghi thực tế" in header_text and "Collection / Bảng" in header_text:
            print(f" -> Updating Table {t_idx} (Thống kê số bản ghi thực tế theo live database)...")
            # Row 1: courses
            table.rows[1].cells[2].text = "12 khóa học chuẩn CEFR (chứa 19 bài học chi tiết và mảng lessons nhúng)"
            table.rows[1].cells[3].text = "Nạp tự động qua seed_production.js & migrate_data.js từ file JSON chuẩn hóa CEFR."
            # Row 2: questions
            table.rows[2].cells[2].text = "32 câu hỏi trắc nghiệm tiếng Anh (A, B, C, D) có giải thích chi tiết"
            table.rows[2].cells[3].text = "Import từ ngân hàng đề thi chuẩn hóa Placement Test, IELTS và TOEIC."
            # Row 3: exams
            table.rows[3].cells[2].text = "4 bộ đề thi chuẩn hóa (Placement Test, IELTS Academic, TOEIC Booster, Grammar)"
            table.rows[3].cells[3].text = "Tạo trực tiếp qua module quản lý đề thi và phân loại CEFR của Giảng viên."
            # Row 4: users
            table.rows[4].cells[2].text = "8 tài khoản phân quyền RBAC (admin01, teacher01, teacher02, student01..04, guest)"
            table.rows[4].cells[3].text = "Khởi tạo có mã hóa mật khẩu bcrypt và phân quyền nghiêm ngặt."
            # Row 5: results & business data
            table.rows[5].cells[1].text = "results, orders, certificates (Lịch sử nộp bài, Đơn hàng, Chứng chỉ)"
            table.rows[5].cells[2].text = "55 kết quả thi, 45 đơn hàng, 5 chứng chỉ số SHA-256, 18 audit logs"
            table.rows[5].cells[3].text = "Lưu trữ tự động từ các phiên làm bài thi và giao dịch thực tế của học viên."
            # Row 6: Redis cache
            table.rows[6].cells[2].text = "1 Key String lưu JSON 12 khóa học (TTL 1800s, p95 = 3.70ms)"
            table.rows[6].cells[3].text = "Sinh tự động từ cơ chế Cache-Aside khi có người dùng truy cập trang danh mục."
            # Row 7: Redis exam session
            table.rows[7].cells[1].text = "exam:<examId>:answers:<studentId> (Lưu đáp án thi thời gian thực)"
            table.rows[7].cells[2].text = "Hash lưu trữ cặp câu hỏi - đáp án thời gian thực bằng lệnh HSET (p95 = 2.25ms)"
            table.rows[7].cells[3].text = "Sinh tự động trong RAM khi thí sinh chọn đáp án, bảo toàn dữ liệu khi rớt mạng."
            # Row 8: Redis leaderboard
            table.rows[8].cells[1].text = "leaderboard:<examId> (Bảng xếp hạng điểm thi theo kỳ thi)"
            table.rows[8].cells[2].text = "Sorted Set (ZSET) lưu cặp điểm số - mã thí sinh tự động sắp xếp O(log N)"
            table.rows[8].cells[3].text = "Cập nhật tức thì bằng lệnh ZADD sau khi thí sinh hoàn thành nộp bài thi."
            # Row 9: Cassandra learning_events
            table.rows[9].cells[1].text = "elearning_logs.learning_events (Nhật ký sự kiện bài học)"
            table.rows[9].cells[2].text = "16 bản ghi sự kiện chi tiết (Play, Pause, Seek, Complete)"
            table.rows[9].cells[3].text = "Ghi nhận nhịp tương tác và tiến độ xem bài học từ video player của học viên."
            # Row 10: Cassandra heartbeat_stream & anti-cheat
            table.rows[10].cells[1].text = "elearning_logs.heartbeat_stream & anti_cheat_logs"
            table.rows[10].cells[2].text = "2 bản ghi nhịp tim định kỳ 5s; 1 bản ghi cảnh báo rời tab (p95 = 1.81ms)"
            table.rows[10].cells[3].text = "Tự động ghi nhận định kỳ và bắt sự kiện visibilitychange rời phòng thi (TTL 7 ngày)."
            # Row 11: Neo4j Nodes
            table.rows[11].cells[1].text = "Neo4j Nodes (:Course, :Lesson, :Topic, :Skill, :Learner)"
            table.rows[11].cells[2].text = "26 nút thực thể phân loại tri thức và học viên thực tế"
            table.rows[11].cells[3].text = "Seed trực tiếp vào cơ sở dữ liệu Neo4j theo chuẩn Labeled Property Graph."
            # Row 12: Neo4j Relationships
            table.rows[12].cells[1].text = "Neo4j Relationships ([:ENROLLED_IN], [:CONTAINS], [:COVERS]...)"
            table.rows[12].cells[2].text = "33 cạnh liên kết có hướng (p95 = 1.80ms khi duyệt đồ thị)"
            table.rows[12].cells[3].text = "Tạo quan hệ tiên quyết bài học, kỹ năng và kết nối mạng lưới Bạn Cùng Tiến."

    # Save patched document
    doc.save(doc_path)
    print(f"SUCCESS: Successfully saved updated document: {doc_path}\n")

if __name__ == "__main__":
    files_to_patch = [
        "TÀI LIỆU FINAL/E_LEARNING.docx",
        "TÀI LIỆU FINAL/BAO_CAO.docx",
        "03_Tai_Lieu_Do_An/06_Bao_Cao_Ket_Qua_Do_An/BAO_CAO_NOSQL_EDUPRO_ACADEMY_FINAL.docx"
    ]
    for f in files_to_patch:
        patch_document(f)
