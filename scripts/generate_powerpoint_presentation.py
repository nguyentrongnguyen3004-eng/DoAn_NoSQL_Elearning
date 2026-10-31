# -*- coding: utf-8 -*-
"""
Tự động tạo file PowerPoint Báo cáo Đồ án NoSQL E-Learning (EduPro Academy)
Chuẩn thể thức Đại học Công Thương TP.HCM (HUIT)
Bao gồm 24 Slide nội dung hoàn chỉnh kèm phần ghi chú (Presenter Notes) cho từng slide.
"""

import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# Reconfigure stdout for utf-8
sys.stdout.reconfigure(encoding='utf-8')

# Colors
C_DARK_NAVY  = RGBColor(15, 23, 42)     # #0F172A
C_INDIGO_600 = RGBColor(79, 70, 229)    # #4F46E5
C_INDIGO_500 = RGBColor(99, 102, 241)   # #6366F1
C_EMERALD    = RGBColor(16, 185, 129)   # #10B981
C_AMBER      = RGBColor(245, 158, 11)   # #F59E0B
C_ROSE       = RGBColor(244, 63, 94)    # #F43F5E
C_SLATE_700  = RGBColor(51, 65, 85)     # #334155
C_MUTED      = RGBColor(100, 116, 139)  # #64748B
C_BG_LIGHT   = RGBColor(248, 250, 252)  # #F8FAFC
C_WHITE      = RGBColor(255, 255, 255)  # #FFFFFF
C_BORDER     = RGBColor(226, 232, 240)  # #E2E8F0
C_CARD_BG    = RGBColor(255, 255, 255)  # #FFFFFF

IMG_DIR = os.path.abspath('03_Tai_Lieu_Do_An/08_Hinh_Anh_Giao_Dien_Web')

def create_presentation():
    prs = pptx.Presentation()
    # 16:9 Widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Helper functions
    def set_slide_background(slide, color=C_BG_LIGHT):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_notes(slide, notes_content):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_content

    def add_slide_header(slide, title, category="EDUPRO ACADEMY • HỆ SINH THÁI E-LEARNING NoSQL", slide_num=None):
        # Header category
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_INDIGO_600

        # Header Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(10.5), Inches(0.8))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = C_DARK_NAVY

        # Slide Number Badge
        if slide_num:
            num_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(12.0), Inches(0.6), Inches(0.6), Inches(0.45))
            num_box.fill.solid()
            num_box.fill.fore_color.rgb = C_INDIGO_500
            num_box.line.fill.background()
            tf_num = num_box.text_frame
            p_num = tf_num.paragraphs[0]
            p_num.text = f"{slide_num:02d}"
            p_num.font.size = Pt(12)
            p_num.font.bold = True
            p_num.font.color.rgb = C_WHITE
            p_num.alignment = PP_ALIGN.CENTER

    def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: TRANG BÌA (TITLE SLIDE)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, C_DARK_NAVY)

    # Accent decorative banner
    banner = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(0.4), prs.slide_height)
    banner.fill.solid()
    banner.fill.fore_color.rgb = C_INDIGO_600
    banner.line.fill.background()

    # University header
    u_box = s1.shapes.add_textbox(Inches(1.0), Inches(0.7), Inches(11.5), Inches(0.8))
    tf_u = u_box.text_frame
    p_u1 = tf_u.paragraphs[0]
    p_u1.text = "TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH (HUIT)"
    p_u1.font.size = Pt(13)
    p_u1.font.bold = True
    p_u1.font.color.rgb = C_AMBER

    p_u2 = tf_u.add_paragraph()
    p_u2.text = "KHOA CÔNG NGHỆ THÔNG TIN • HỌC PHẦN: DỮ LIỆU NoSQL (14DH)"
    p_u2.font.size = Pt(11)
    p_u2.font.color.rgb = RGBColor(203, 213, 225)

    # Main Title
    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.5), Inches(2.2))
    tf_main = t_box.text_frame
    tf_main.word_wrap = True
    p_m1 = tf_main.paragraphs[0]
    p_m1.text = "BÁO CÁO ĐỒ ÁN MÔN HỌC CUỐI KỲ"
    p_m1.font.size = Pt(15)
    p_m1.font.bold = True
    p_m1.font.color.rgb = C_INDIGO_500

    p_m2 = tf_main.add_paragraph()
    p_m2.text = "HỆ SINH THÁI E-LEARNING & KHẢO SÁT NĂNG LỰC TIẾNG ANH\nEDUPRO ACADEMY TRÊN NỀN TẢNG ĐA CSDL POLYGLOT NoSQL"
    p_m2.font.size = Pt(24)
    p_m2.font.bold = True
    p_m2.font.color.rgb = C_WHITE

    p_m3 = tf_main.add_paragraph()
    p_m3.text = "Tích hợp đồng bộ 4 công nghệ NoSQL: MongoDB (Document) • Redis (In-Memory) • Apache Cassandra (Wide-Column) • Neo4j (Graph)"
    p_m3.font.size = Pt(12)
    p_m3.font.color.rgb = RGBColor(148, 163, 184)

    # Info card 1: Team members
    card_team = add_card(s1, Inches(1.0), Inches(4.3), Inches(7.5), Inches(2.5), RGBColor(30, 41, 59), RGBColor(51, 65, 85))
    tf_team = card_team.text_frame
    tf_team.word_wrap = True
    p_th = tf_team.paragraphs[0]
    p_th.text = "NHÓM THỰC HIỆN: NHÓM 18"
    p_th.font.size = Pt(13)
    p_th.font.bold = True
    p_th.font.color.rgb = C_EMERALD

    members = [
        "1. Nguyễn Trọng Nguyên  — MSSV: 2001230589 (Trưởng nhóm / Lead Architect & Full-stack)",
        "2. Phạm Nguyễn Khôi Nguyên — MSSV: 2001230578 (Thành viên / Backend & Document / Key-Value)",
        "3. Võ Huỳnh Gia Huy       — MSSV: 2001230303 (Thành viên / Big Data Telemetry & Graph Database)"
    ]
    for m in members:
        pm = tf_team.add_paragraph()
        pm.text = m
        pm.font.size = Pt(11)
        pm.font.color.rgb = RGBColor(241, 245, 249)

    # Info card 2: Instructors & Date
    card_sub = add_card(s1, Inches(8.8), Inches(4.3), Inches(3.7), Inches(2.5), RGBColor(30, 41, 59), RGBColor(51, 65, 85))
    tf_sub = card_sub.text_frame
    tf_sub.word_wrap = True
    p_sh = tf_sub.paragraphs[0]
    p_sh.text = "THÔNG TIN ĐỒ ÁN"
    p_sh.font.size = Pt(13)
    p_sh.font.bold = True
    p_sh.font.color.rgb = C_AMBER

    sub_items = [
        "• Lớp học phần: 14DH - Dữ liệu NoSQL",
        "• Khoa: Công nghệ Thông tin",
        "• Trường: ĐH Công Thương TP.HCM (HUIT)",
        "• Năm học: 2025 - 2026 (Học kỳ 7)",
        "• Trạng thái hệ thống: 100% Hoàn chỉnh"
    ]
    for item in sub_items:
        psi = tf_sub.add_paragraph()
        psi.text = item
        psi.font.size = Pt(11)
        psi.font.color.rgb = RGBColor(226, 232, 240)

    add_notes(s1, """[LỜI THOẠI MỞ ĐẦU - NGUYỄN TRỌNG NGUYÊN]
Kính chào quý Thầy Cô trong Hội đồng chấm đồ án tốt nghiệp/cuối kỳ Bộ môn Công nghệ Phần mềm & Cơ sở dữ liệu - Khoa Công nghệ Thông tin, Trường Đại học Công Thương TP.HCM (HUIT)!
Em là Nguyễn Trọng Nguyên, trưởng nhóm 18. Hôm nay nhóm em rất vinh hạnh được đại diện trình bày và bảo vệ đề tài: "Xây dựng Nền tảng E-Learning & Khảo sát Năng lực Tiếng Anh EduPro Academy trên nền tảng Đa Cơ sở dữ liệu Polyglot NoSQL".
Nhóm gồm 3 thành viên: Em - Nguyễn Trọng Nguyên phụ trách Kiến trúc tổng thể và Full-stack; bạn Phạm Nguyễn Khôi Nguyên phụ trách mô hình Document MongoDB và Key-Value Redis; bạn Võ Huỳnh Gia Huy phụ trách Big Data Cassandra và Graph Database Neo4j.
Hôm nay, nhóm em sẽ chứng minh tính ưu việt của kiến trúc đa cơ sở dữ liệu NoSQL trong việc giải quyết bài toán chịu tải cao, thời gian thực và phân tích đồ thị tri thức trong giáo dục trực tuyến hiện đại.""")

    # =========================================================================
    # SLIDE 2: MỤC LỤC BÁO CÁO (AGENDA)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_slide_header(s2, "Mục Lục & Cấu Trúc Nội Dung Báo Cáo", slide_num=2)

    agenda_items = [
        ("01", "Tính Cấp Thiết & Lý Do Chọn Đề Tài", "Hạn chế của RDBMS cổ điển & thách thức dữ liệu lớn trong E-Learning quy mô cao."),
        ("02", "Kiến Trúc Đa CSDL Polyglot Persistence", "Mô hình phân tầng Micro-Monolith & Ma trận phân công 4 hệ CSDL chuyên biệt."),
        ("03", "Thiết Kế Chi Tiết 4 CSDL NoSQL", "MongoDB (Document), Redis (Key-Value), Cassandra (Wide-Column), Neo4j (Graph)."),
        ("04", "Hiện Thực Hóa Các Phân Hệ Nghiệp Vụ", "15 chức năng cốt lõi: Lớp học video, Flashcards 3D, Phòng thi, Anti-cheat, AI Copilot."),
        ("05", "Đo Kiểm Hiệu Năng & Khả Năng Chịu Lỗi", "Benchmark tải k6/Autocannon, kiểm thử phục hồi thảm họa và độ bền bỉ In-Memory."),
        ("06", "Đánh Giá Kết Quả & Hướng Phát Triển", "Tổng kết kết quả đạt được, đối chiếu 16 Access Patterns và lộ trình mở rộng tương lai.")
    ]

    for idx, (num, title, desc) in enumerate(agenda_items):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 1.7)
        card = add_card(s2, left, top, Inches(5.6), Inches(1.45))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = f"{num}. {title}"
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = C_DARK_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_MUTED

    add_notes(s2, """[LỜI THOẠI MỤC LỤC - NGUYỄN TRỌNG NGUYÊN]
Bài báo cáo của nhóm em hôm nay được cô đọng trong 6 phần trọng tâm:
1. Đầu tiên là bối cảnh thực tiễn và lý do tại sao các hệ thống E-Learning bắt buộc phải chuyển dịch từ RDBMS sang Polyglot NoSQL.
2. Thứ hai là sơ đồ kiến trúc tổng thể và nguyên lý phân bổ 4 hệ CSDL.
3. Thứ ba là bản thiết kế kỹ thuật chi tiết của MongoDB, Redis, Cassandra và Neo4j gắn liền với từng Access Pattern.
4. Thứ tư là phần hiện thực hóa 15 tính năng nghiệp vụ người dùng trên nền tảng web EduPro Academy.
5. Thứ năm là kết quả đo kiểm hiệu năng thực tế bằng k6 và kiểm thử khả năng chịu lỗi.
6. Và cuối cùng là kết luận, đánh giá kết quả so với mục tiêu ban đầu.""")

    # =========================================================================
    # SLIDE 3: TÍNH CẤP THIẾT & LÝ DO CHỌN ĐỀ TÀI
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_slide_header(s3, "Tính Cấp Thiết & Thách Thức Kỹ Thuật", slide_num=3)

    challenges = [
        ("Nút Thắt Cổ Chai RDBMS", "Khi có hàng ngàn học viên thi đồng thời hoặc gửi heartbeat video liên tục, RDBMS truyền thống (MySQL, PostgreSQL) phải khóa bảng (table locking) và ghi đĩa ngẫu nhiên, dẫn đến nghẽn cổ chai (I/O Bottleneck), độ trễ vượt quá 2000ms.", C_ROSE),
        ("Bùng Nổ Dữ Liệu Chuỗi Thời Gian", "Mỗi học viên xem video tạo ra hàng trăm gói tin Telemetry Heartbeat mỗi phút. Hệ thống cần khả năng ghi cực nhanh với thông lượng trên 2.000 writes/s mà không cần giao dịch khóa ngoại phức tạp.", C_AMBER),
        ("Đồ Thị Tri Thức & Quan Hệ Đa Chiều", "Mối quan hệ giữa hàng trăm chuẩn kỹ năng CEFR, bài học tiên quyết và mạng lưới bạn học tạo ra các phép toán JOIN nhiều cấp (n-n). Trên RDBMS, query này tiêu tốn bộ nhớ và thời gian tăng theo cấp số nhân O(N^k).", C_INDIGO_600)
    ]

    for idx, (title, desc, color) in enumerate(challenges):
        left = Inches(0.8 + idx * 3.95)
        top = Inches(1.8)
        card = add_card(s3, left, top, Inches(3.75), Inches(4.8))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = f"THÁCH THỨC 0{idx+1}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = color

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(16)
        p2.font.bold = True
        p2.font.color.rgb = C_DARK_NAVY

        p3 = tf.add_paragraph()
        p3.text = "\n" + desc
        p3.font.size = Pt(11.5)
        p3.font.color.rgb = C_SLATE_700

    add_notes(s3, """[LỜI THOẠI THÁCH THỨC - PHẠM NGUYỄN KHÔI NGUYÊN]
Kính thưa Thầy Cô! Trong thời đại giáo dục số, các nền tảng E-Learning quy mô lớn phải đối mặt với 3 thách thức dữ liệu cực kỳ khốc liệt:
Thứ nhất: Hiện tượng nghẽn I/O tại các giờ cao điểm thi trực tuyến. Với RDBMS truyền thống, cơ chế ACID và khóa dòng làm sụp đổ hệ thống khi hàng ngàn thí sinh nộp bài cùng lúc.
Thứ hai: Khối lượng dữ liệu chuỗi thời gian (Time-series) sinh ra từ hành vi xem video của người học là khổng lồ. Một RDBMS thông thường không thể chịu nổi tốc độ ghi hàng ngàn bản ghi mỗi giây.
Thứ ba: Mạng lưới kiến thức ngôn ngữ chuẩn CEFR và tính năng tìm bạn cùng tiến đòi hỏi việc duyệt đồ thị phức tạp. Các phép JOIN bảng đa cấp trong SQL trở nên quá chậm chạp.
Chính vì vậy, một hệ CSDL duy nhất không thể giải quyết trọn vẹn mọi yêu cầu. Đây là lý do nhóm em chọn giải pháp Polyglot Persistence!""")

    # =========================================================================
    # SLIDE 4: MỤC TIÊU & PHẠM VI NGHIÊN CỨU
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_slide_header(s4, "Mục Tiêu Đề Tài & Phạm Vi Nghiên Cứu", slide_num=4)

    # 4 objective boxes
    objs = [
        ("Mục Tiêu Tổng Quát", "Thiết kế và triển khai hoàn chỉnh nền tảng E-Learning EduPro Academy ứng dụng kiến trúc Đa cơ sở dữ liệu Polyglot NoSQL, đáp ứng trọn vẹn 16 mẫu truy cập dữ liệu (AP-01 đến AP-16) với độ trễ thấp và tính sẵn sàng cao."),
        ("Chỉ Số Hiệu Năng (NFR)", "• Thời gian phản hồi p95 < 50ms cho mọi truy vấn đọc danh mục.\n• Thông lượng ghi Cassandra > 2.000 events/giây.\n• Khả năng chịu lỗi: 99.9% High Availability với cơ chế In-Memory Fallback.\n• Không xảy ra tình trạng mất dữ liệu bài thi khi đứt mạng."),
        ("Phạm Vi Nghiệp Vụ", "• Học viên: Khóa học, lớp học video, 150 flashcards 3D, thi trắc nghiệm, Anti-cheat, Gamification XP, Certificate.\n• Giảng viên & Admin: CMS biên tập câu hỏi, kiểm soát tường lửa Redis Sliding Window (120 RPM), giám sát hạ tầng 4 CSDL."),
        ("Nguyên Tắc Minh Chứng Dữ Liệu Thật", "Hệ thống vận hành 100% trên dữ liệu thực tế kết nối trực tiếp tới 4 CSDL đang chạy. Không sử dụng Mock Data, không làm số liệu ảo, mọi thao tác người dùng đều được ghi nhận trực quan vào GUI Tool.")
    ]

    for idx, (title, desc) in enumerate(objs):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 2.5)
        card = add_card(s4, left, top, Inches(5.6), Inches(2.25))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = C_INDIGO_600

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_SLATE_700

    add_notes(s4, """[LỜI THOẠI MỤC TIÊU - VÕ HUỲNH GIA HUY]
Về mục tiêu đề tài, nhóm đặt ra các cam kết rất rõ ràng và định lượng được:
Thứ nhất: Đáp ứng toàn diện 16 Access Patterns chuẩn IEEE 1016.
Thứ hai: Đạt các chỉ số phi chức năng nghiêm ngặt: độ trễ đọc danh mục dưới 50 mili-giây, thông lượng ghi chuỗi sự kiện trên 2.000 req/giây và cam kết chịu lỗi 99.9%.
Thứ ba: Phục vụ cả hai phân hệ Học viên và Quản trị viên với 15 tính năng thực chiến.
Và đặc biệt: Nhóm tuân thủ nghiêm ngặt nguyên tắc trung thực học thuật: 100% số liệu là dữ liệu thật từ 4 CSDL đang chạy, tuyệt đối không có dữ liệu ảo hay mock data tạm bợ.""")

    # =========================================================================
    # SLIDE 5: KIẾN TRÚC TỔNG THỂ HỆ THỐNG
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_slide_header(s5, "Kiến Trúc Phân Tầng Hệ Thống (Micro-Monolith)", slide_num=5)

    layers = [
        ("TẦNG TRÌNH DIỄN (CLIENT LAYER)", "Giao diện Web SPA tương tác cao: Vanilla JS ES6 Modular, TailwindCSS, FontAwesome, Chart.js (Retention), Vis.js (Graph Network). Tích hợp Web Speech API (Phát âm UK/US).", C_INDIGO_600),
        ("TẦNG CỔNG DỊCH VỤ & BẢO MẬT (API GATEWAY)", "Node.js Express Server, JWT Authentication, Role-Based Access Control (RBAC), Tường lửa Redis Sliding Window Rate Limiter (120 RPM), CORS & Helmet Protection.", C_DARK_NAVY),
        ("TẦNG DỊCH VỤ NGHIỆP VỤ (BUSINESS LOGIC SERVICES)", "Module hóa 7 dịch vụ độc lập: Auth & User Service, Course Catalog Service, Exam Engine Service, Telemetry & Anti-Cheat Service, Graph & Recommendation Service, Gamification Service, Unified Backup Service.", C_EMERALD),
        ("TẦNG LƯU TRỮ ĐA CƠ SỞ DỮ LIỆU (POLYGLOT DATA LAYER)", "• MongoDB (Port 27017): Document Store • Redis (Port 6379): In-Memory Key-Value & ZSET\n• Apache Cassandra (Port 9042): Wide-Column Time-Series • Neo4j (Port 7687 Bolt): Labeled Property Graph", C_AMBER)
    ]

    for idx, (title, desc, color) in enumerate(layers):
        top = Inches(1.8 + idx * 1.25)
        card = add_card(s5, Inches(0.8), top, Inches(11.733), Inches(1.15))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = color

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = C_SLATE_700

    add_notes(s5, """[LỜI THOẠI KIẾN TRÚC - NGUYỄN TRỌNG NGUYÊN]
Kính thưa Thầy Cô, hệ thống EduPro Academy được kiến trúc theo mô hình phân tầng Micro-Monolith tối ưu:
- Tầng Client sử dụng Vanilla JS ES6 dạng Module hóa, gọn nhẹ và tối đa hiệu năng render không phụ thuộc vào framework nặng.
- Tầng API Gateway kiểm soát bảo mật bằng JWT và đặc biệt là Tường lửa Redis Sliding Window giới hạn 120 request/phút để chống DoS và Brute-force.
- Tầng Nghiệp vụ chia tách thành 7 service độc lập, xử lý từ thi cử, bài giảng đến gamification.
- Và nền móng vững chắc dưới cùng là 4 hệ quản trị NoSQL hoạt động song song, kết nối qua các driver chính thức chuyên dụng.""")

    # =========================================================================
    # SLIDE 6: MA TRẬN PHÂN BỔ 4 CSDL NoSQL (POLYGLOT MATRIX)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_slide_header(s6, "Ma Trận Phân Bổ 4 Hệ Quản Trị CSDL NoSQL", slide_num=6)

    databases = [
        ("MongoDB (Document)", "Quản trị Danh mục & Nghiệp vụ Cốt lõi", "• Lưu trữ tài khoản, khóa học, giáo trình, ngân hàng câu hỏi, kết quả thi và 150 flashcards.\n• Cấu trúc JSON Document linh hoạt, cho phép nhúng (embedding) bài học và câu hỏi con.\n• Hỗ trợ Atomic Update và Compound Index tối ưu hóa truy vấn.", C_EMERALD),
        ("Redis (Key-Value RAM)", "Bộ Nhớ Đệm & Thời Gian Thực", "• Cache-Aside danh mục khóa học (TTL 1800s), giảm độ trễ từ 38ms xuống 3.8ms.\n• Lưu đáp án thi tạm thời trên RAM (Hash), đếm ngược phiên thi (TTL).\n• Bảng xếp hạng điểm số tuần & Hàng đợi ôn tập SRS ngắt quãng (Sorted Set - ZSET).", C_ROSE),
        ("Apache Cassandra", "Xử Lý Dữ Liệu Lớn Chuỗi Thời Gian", "• Tiếp nhận luồng sự kiện Heartbeat xem video học tập và nhật ký gian lận Anti-Cheat.\n• Kiến trúc Masterless phân tán, ghi dữ liệu liên tục qua cấu trúc LSM-Tree.\n• Phục vụ phân tích đường cong giữ chân người học (Video Retention Analytics).", C_INDIGO_600),
        ("Neo4j (Graph DB)", "Mô Hình Hóa Đồ Thị Tri Thức & Kết Nối", "• Xây dựng Bản đồ tri thức kỹ năng ngôn ngữ từ CEFR A1 đến C2.\n• Giải thuật Shortest Path tìm lộ trình học bài tiên quyết (Prerequisite Chain).\n• Thuật toán lọc cộng tác (Co-enrollment Matching) gợi ý mạng lưới Bạn Cùng Tiến.", C_AMBER)
    ]

    for idx, (name, role, details, color) in enumerate(databases):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 2.5)
        card = add_card(s6, left, top, Inches(5.6), Inches(2.3))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = name.upper()
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = color

        p2 = tf.add_paragraph()
        p2.text = f"Vai trò: {role}"
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = C_DARK_NAVY

        p3 = tf.add_paragraph()
        p3.text = details
        p3.font.size = Pt(10)
        p3.font.color.rgb = C_SLATE_700

    add_notes(s6, """[LỜI THOẠI MA TRẬN CSDL - PHẠM NGUYỄN KHÔI NGUYÊN]
Tại sao nhóm em chọn 4 CSDL này mà không phải là một? Đây chính là nguyên lý 'Right Tool for the Right Job':
1. MongoDB làm tốt nhất việc lưu trữ các document có cấu trúc phân tầng như khóa học, câu hỏi thi trắc nghiệm và kho từ vựng.
2. Redis đứng ở tiền tuyến, giải quyết bài toán tốc độ: đưa độ trễ về dưới 4ms và xử lý bảng xếp hạng đua top mà không cần lệnh ORDER BY trên đĩa cứng.
3. Cassandra là cỗ máy ghi vô song: kiến trúc Masterless giúp tiếp nhận hàng ngàn nhịp heartbeat video mỗi giây của học viên mà không bao giờ bị nghẽn nút đơn (Single Point of Failure).
4. Neo4j làm điều mà 3 CSDL kia không thể làm hiệu quả: duyệt cây tri thức kỹ năng CEFR và giải thuật tìm bạn học tương thích trong vài mili-giây.""")

    # =========================================================================
    # SLIDE 7: CƠ SỞ LÝ THUYẾT NoSQL (CAP & PACELC)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_slide_header(s7, "Cơ Sở Lý Thuyết: Định Lý CAP & Định Lý PACELC", slide_num=7)

    cap_boxes = [
        ("MongoDB: Lựa Chọn Phân Vùng CP", "• Ưu tiên Tính nhất quán (Consistency) và Chịu lỗi phân vùng (Partition Tolerance).\n• Cần thiết cho các nghiệp vụ tài chính, kích hoạt khóa học và kết quả thi để ngăn ngừa dữ liệu mâu thuẫn.\n• Cơ chế Majority Write Concern bảo đảm dữ liệu ghi thành công an toàn."),
        ("Cassandra: Lựa Chọn Phân Vùng AP", "• Ưu tiên Tính sẵn sàng cao (Availability) và Chịu lỗi phân vùng (Partition Tolerance).\n• Phù hợp hoàn hảo cho Telemetry: Việc ghi nhận nhịp xem video không bao giờ bị gián đoạn ngay cả khi mạng bị chập chờn.\n• Mô hình Nhất quán Cuối cùng (Eventual Consistency) qua cơ chế Read Repair."),
        ("Redis: Bộ Nhớ Đệm In-Memory Siêu Tốc", "• Trong bài toán định lý PACELC: Khi có phân vùng (P), Redis ưu tiên Availability; khi bình thường (E), Redis đánh đổi độ bền vững đĩa cứng để tối đa hóa Tốc độ (Latency < 2ms).\n• Hỗ trợ cơ chế đồng bộ nền RDB Snapshot và AOF (Append-Only File)."),
        ("Neo4j: Giao Dịch ACID Trên Đồ Thị", "• Tuân thủ nghiêm ngặt chuẩn ACID cho các thao tác ghi nhận quan hệ học tập.\n• Bảo đảm tính toàn vẹn ngữ nghĩa của cây tri thức CEFR và mạng lưới bạn học.\n• Thuật toán duyệt đồ thị Index-Free Adjacency (Truy xuất lân cận O(1) không qua bảng chỉ mục).")
    ]

    for idx, (title, desc) in enumerate(cap_boxes):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 2.5)
        card = add_card(s7, left, top, Inches(5.6), Inches(2.3))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = C_INDIGO_600

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = C_SLATE_700

    add_notes(s7, """[LỜI THOẠI LÝ THUYẾT CAP - VÕ HUỲNH GIA HUY]
Về mặt cơ sở khoa học máy tính:
Theo Định lý CAP của Eric Brewer và mở rộng PACELC của Daniel Abadi, không một hệ thống phân tán nào có thể đồng thời đạt được cả 3 yếu tố: Nhất quán hoàn hảo (Consistency), Sẵn sàng tuyệt đối (Availability) và Chịu lỗi phân vùng (Partition Tolerance).
Trong hệ thống EduPro Academy:
- Chúng em phân định rõ: MongoDB là hệ thống CP, dùng cho các nghiệp vụ bắt buộc phải nhất quán nghiêm ngặt như nạp tiền học và điểm bài thi.
- Ngược lại, Cassandra là hệ thống AP, ưu tiên nhận gói tin liên tục dù mạng có chậm, áp dụng Eventual Consistency.
- Redis giải quyết nhánh Latency trong định lý PACELC: giảm thời gian chờ của người dùng xuống mức mili-giây.
- Và Neo4j đảm bảo giao dịch ACID trên toàn bộ đồ thị tri thức ngôn ngữ.""")

    # =========================================================================
    # SLIDE 8: THIẾT KẾ CSDL 1 - MONGODB DOCUMENT STORE
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_slide_header(s8, "Thiết Kế CSDL 1: MongoDB Document Collections", slide_num=8)

    mongo_cols = [
        ("users", "Hồ sơ học viên & Giảng viên", "• Lưu thông tin cá nhân, phân quyền RBAC (STUDENT/TEACHER/ADMIN), mật khẩu hash bcrypt.\n• Mảng nhúng `enrolledCourses`: Danh sách ID khóa học đã kích hoạt.\n• Điểm thưởng XP và chuỗi ngày học `streakCount`."),
        ("courses & lessons", "Danh mục & Giáo trình Đào tạo", "• `courses`: Thông tin khóa học, cấp độ CEFR, học phí, số bài học, ratings.\n• `lessons`: Nội dung bài giảng nhúng, video URL, handouts PDF tải kèm.\n• Compound Index: `{ category: 1, cefrLevel: 1 }` tăng tốc nạp trang chủ."),
        ("questions & results", "Ngân hàng Đề thi & Kết quả", "• `questions`: Đề thi phân loại theo đề thi, 4 options trắc nghiệm, đáp án giải thích.\n• `results`: Điểm số, thời gian làm bài, danh sách câu trả lời chi tiết và mã băm chứng chỉ.\n• Index: `{ examId: 1, studentId: 1, createdAt: -1 }`."),
        ("flashcards (150 từ)", "Kho Từ Vựng 3D Theo 6 Chủ Đề", "• 150 thẻ từ vựng chuẩn quốc tế chia đều 6 nhóm: Môi trường, Kinh doanh, AI, Giáo dục, Y tế, Idioms.\n• Đầy đủ IPA, loại từ, nghĩa tiếng Việt, câu ví dụ và Collocations thực chiến.\n• Index: `{ category: 1, word: 1 }` và `{ id: 1 }` unique.")
    ]

    for idx, (col_name, title, details) in enumerate(mongo_cols):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 2.5)
        card = add_card(s8, left, top, Inches(5.6), Inches(2.3))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = f"COLLECTION: {col_name.upper()}"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = C_EMERALD

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = C_DARK_NAVY

        p3 = tf.add_paragraph()
        p3.text = details
        p3.font.size = Pt(10)
        p3.font.color.rgb = C_SLATE_700

    add_notes(s8, """[LỜI THOẠI MONGODB - PHẠM NGUYỄN KHÔI NGUYÊN]
Đi vào chi tiết thiết kế MongoDB:
Nhóm đã xây dựng mô hình document chuẩn hóa với các quyết định kỹ thuật cụ thể:
1. Trong collection `courses`, chúng em áp dụng kỹ thuật nhúng (Embedding) danh sách bài học để người dùng chỉ cần 1 thao tác đọc là hiển thị trọn vẹn giáo trình khóa học.
2. Với collection `questions` và `results`, việc tách riêng collection giúp tránh hiện tượng tài liệu bị phình to vượt giới hạn 16MB của MongoDB khi có hàng chục ngàn lượt thi.
3. Đặc biệt, collection `flashcards` đã được nạp đủ 150 từ vựng thực tế theo 6 chủ đề, đánh chỉ mục phức hợp `{ category: 1, word: 1 }` giúp việc tìm kiếm và lọc từ diễn ra tức thì trong vài mili-giây.""")

    # =========================================================================
    # SLIDE 9: THIẾT KẾ CSDL 2 - REDIS DATA STRUCTURES
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_slide_header(s9, "Thiết Kế CSDL 2: Cấu Trúc Dữ Liệu Bản Địa Redis", slide_num=9)

    redis_keys = [
        ("STRING (Cache-Aside)", "cache:courses:catalog", "• Cache danh mục 12 khóa học với thời gian sống TTL = 1800s (30 phút).\n• Tự động xóa khóa (Cache Invalidation) khi Admin cập nhật dữ liệu khóa học."),
        ("HASH (In-Memory Exam)", "exam:{id}:answers:{student}", "• Lưu trực tiếp từng đáp án thí sinh chọn vào RAM máy chủ với độ trễ < 2ms.\n• Phòng ngừa mất dữ liệu khi mất kết nối Internet hoặc rớt nguồn."),
        ("SORTED SET (Leaderboard)", "exam:{id}:leaderboard", "• Điểm số bài thi được làm Score trong ZSET. Lấy Top 10 thí sinh cao điểm nhất qua lệnh `ZREVRANGE 0 9 WITHSCORES` với độ phức tạp cực thấp O(log N)."),
        ("SORTED SET (SRS Time-Queue)", "flashcards:srs:{student}", "• Thuật toán Spaced Repetition Anki: Mốc thời gian ôn tập kế tiếp (Timestamp) là Score.\n• Hệ thống truy vấn các từ đến hạn ôn tập siêu nhanh bằng lệnh `ZRANGEBYSCORE`."),
        ("SET (Mastered Words)", "flashcards:mastered:{student}", "• Quản lý tập hợp các ID từ vựng học viên đã học thuộc.\n• Kiểm tra trạng thái đã thuộc bằng lệnh `SISMEMBER` trong O(1)."),
        ("ZSET (Sliding Window)", "security:ratelimit:ip:{ip}", "• Tường lửa thông minh: Giới hạn 120 req/phút theo IP.\n• Loại bỏ request cũ bằng `ZREMRANGEBYSCORE` và đếm request hiện tại bằng `ZCARD`.")
    ]

    for idx, (ktype, pattern, desc) in enumerate(redis_keys):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 1.65)
        card = add_card(s9, left, top, Inches(5.6), Inches(1.5))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = f"{ktype} • KEY: {pattern}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_ROSE

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_SLATE_700

    add_notes(s9, """[LỜI THOẠI REDIS - PHẠM NGUYỄN KHÔI NGUYÊN]
Kính thưa Thầy Cô, điểm đặc sắc của nhóm là không chỉ dùng Redis làm bộ nhớ đệm chuỗi đơn thuần mà đã khai thác triệt để các cấu trúc dữ liệu bản địa tiên tiến nhất:
- Redis Hash dùng lưu đáp án phòng thi giúp giảm thiểu I/O đĩa cứng xuống 0 trong suốt thời gian học viên làm bài.
- Redis Sorted Set (ZSET) giải quyết bài toán đua top bảng vàng: thay vì phải chạy câu lệnh SQL ORDER BY quét qua hàng ngàn dòng, Redis trả về bảng xếp hạng tuần ngay lập tức với độ phức tạp O(log N).
- Và đặc biệt là Tường lửa Sliding Window Rate Limiter dùng ZSET lưu timestamp: vừa ngăn chặn tấn công DDoS, vừa loại trừ các truy vấn rác mà không gây nghẽn RAM máy chủ.""")

    # =========================================================================
    # SLIDE 10: THIẾT KẾ CSDL 3 - APACHE CASSANDRA WIDE-COLUMN
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_slide_header(s10, "Thiết Kế CSDL 3: Apache Cassandra Wide-Column", slide_num=10)

    # Left: Architecture details
    card_cas1 = add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    tf_c1 = card_cas1.text_frame
    tf_c1.word_wrap = True
    p_c1 = tf_c1.paragraphs[0]
    p_c1.text = "KIẾN TRÚC GHI TUẦN TỰ KHÔNG KHÓA"
    p_c1.font.size = Pt(14)
    p_c1.font.bold = True
    p_c1.font.color.rgb = C_INDIGO_600

    c1_content = [
        ("Masterless Ring Architecture", "Tất cả các node trong cụm đều bình đẳng. Không có Master Node, loại bỏ hoàn toàn rủi ro điểm nghẽn đơn (No Single Point of Failure)."),
        ("Cấu Trúc Ghi LSM-Tree", "Mọi sự kiện Heartbeat ghi tuần tự (sequential append) vào CommitLog trên đĩa và Memtable trên RAM, đạt tốc độ > 2.480 writes/s mà không cần khóa bảng."),
        ("Cơ Chế Flush & Compaction", "Dữ liệu từ Memtable được flush định kỳ thành các SSTable bất biến (Immutable), tránh phân mảnh đĩa cứng và tăng độ bền bỉ.")
    ]
    for h, b in c1_content:
        ph = tf_c1.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(11)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_c1.add_paragraph()
        pb.text = b
        pb.font.size = Pt(10)
        pb.font.color.rgb = C_SLATE_700

    # Right: Schema & Retention
    card_cas2 = add_card(s10, Inches(6.9), Inches(1.8), Inches(5.6), Inches(4.8))
    tf_c2 = card_cas2.text_frame
    tf_c2.word_wrap = True
    p_c2 = tf_c2.paragraphs[0]
    p_c2.text = "THIẾT KẾ BẢNG & PHÂN TÍCH RETENTION"
    p_c2.font.size = Pt(14)
    p_c2.font.bold = True
    p_c2.font.color.rgb = C_INDIGO_600

    c2_content = [
        ("Thiết Kế Khóa Phân Vùng Tối Ưu", "Bảng `learning_events`:\n• Partition Key: `student_id` (Phân tán dữ liệu đồng đều qua Murmur3Partitioner).\n• Clustering Key: `event_time DESC` (Xếp thứ tự thời gian giảm dần, truy xuất sự kiện mới nhất trong vài ms)."),
        ("Bảng Giám Sát Anti-Cheat", "Bảng `anti_cheat_events`: Lưu vết chi tiết từng hành vi chuyển tab, rời màn hình thi, số lần cảnh báo và địa chỉ IP của thí sinh."),
        ("Ứng Dụng Thực Chiến: Video Retention", "Từ các gói tin `video_progress`, hệ thống tính toán tỷ lệ giữ chân người xem theo từng mốc giây (0s, 30s, 60s, 90s...), hiển thị biểu đồ trực quan cho giảng viên.")
    ]
    for h, b in c2_content:
        ph = tf_c2.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(11)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_c2.add_paragraph()
        pb.text = b
        pb.font.size = Pt(10)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s10, """[LỜI THOẠI CASSANDRA - VÕ HUỲNH GIA HUY]
Về Apache Cassandra, đây là giải pháp then chốt để xử lý bài toán dữ liệu lớn của EduPro Academy:
- Cassandra sở hữu kiến trúc phân tán Masterless: nghĩa là nếu một node bị hỏng hoặc mất mạng, các node còn lại vẫn hoạt động bình thường, bảo đảm độ sẵn sàng 99.9%.
- Cơ chế ghi dữ liệu tuần tự vào CommitLog và Memtable giúp Cassandra đạt tốc độ ghi trên 2.480 request/giây mà không hề bị khóa bảng như RDBMS.
- Về mặt thiết kế bảng: Nhóm chọn Partition Key là `student_id` kết hợp với Clustering Key là `event_time DESC`. Thiết kế này cho phép hệ thống truy vấn ngay lập tức 5 sự kiện gần nhất của học viên để vẽ đường cong giữ chân người xem video (Retention Curve) hỗ trợ đắc lực cho việc cải tiến bài giảng.""")

    # =========================================================================
    # SLIDE 11: THIẾT KẾ CSDL 4 - NEO4J GRAPH DATABASE
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_slide_header(s11, "Thiết Kế CSDL 4: Neo4j Labeled Property Graph", slide_num=11)

    graph_blocks = [
        ("MÔ HÌNH THỰC THỂ & QUAN HỆ (LPG)", "• Nodes: `(:Student)`, `(:Course)`, `(:Lesson)`, `(:Topic)`, `(:Skill)`.\n• Relationships:\n  - `[:ENROLLED_IN]` (Học viên tham gia khóa học)\n  - `[:HAS_LESSON]` (Khóa học chứa bài học)\n  - `[:TEACHES]` (Bài học truyền đạt chủ điểm kiến thức)\n  - `[:COVERS]` (Chủ điểm kiến thức bao hàm kỹ năng)\n  - `[:PREREQUISITE_OF]` (Mối quan hệ tiên quyết giữa các bài học)"),
        ("THUẬT TOÁN ĐỒ THỊ 1: LỘ TRÌNH TIÊN QUYẾT", "• Thuật toán Shortest Path trên đồ thị hướng duyệt các bài học tiên quyết:\n  `MATCH p = shortestPath((a:Lesson)-[:PREREQUISITE_OF*]->(b:Lesson))`\n• Trả về chuỗi bài học bắt buộc phải hoàn thành trước khi mở khóa bài học nâng cao.\n• Thời gian truy vấn chỉ 5.8ms nhờ tính chất Index-Free Adjacency O(1)."),
        ("THUẬT TOÁN ĐỒ THỊ 2: BẠN CÙNG TIẾN (STUDY BUDDIES)", "• Thuật toán lọc cộng tác đồ thị (Co-enrollment Pattern Matching):\n  `MATCH (s:Student {id: $id})-[:ENROLLED_IN]->(c)<-[:ENROLLED_IN]-(b:Student)`\n  `WHERE s <> b RETURN b, count(c) AS commonCourses ORDER BY commonCourses DESC`\n• Đề xuất những bạn học có cùng mục tiêu Band điểm IELTS/TOEIC và độ tương thích cao (>90%).")
    ]

    for idx, (title, details) in enumerate(graph_blocks):
        top = Inches(1.8 + idx * 1.65)
        card = add_card(s11, Inches(0.8), top, Inches(11.733), Inches(1.5))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = C_AMBER

        p2 = tf.add_paragraph()
        p2.text = details
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_SLATE_700

    add_notes(s11, """[LỜI THOẠI NEO4J - VÕ HUỲNH GIA HUY]
Chuyển sang Neo4j: CSDL đồ thị mạnh mẽ nhất hiện nay:
- Nhóm đã mô hình hóa toàn bộ cây tri thức CEFR theo dạng Labeled Property Graph với 5 loại Node và 5 loại Relationship có hướng.
- Nhờ nguyên lý Index-Free Adjacency (duyệt lân cận qua con trỏ bộ nhớ RAM thay vì quét chỉ mục B-Tree), câu truy vấn Cypher tìm lộ trình học bài tiên quyết ngắn nhất chỉ mất 5.8 mili-giây.
- Đặc biệt, giải thuật gợi ý Bạn Cùng Tiến (Study Buddies) dựa trên mẫu đồng ghi danh (Co-enrollment) giúp kết nối các học viên có cùng mục tiêu học tập, tạo nên một cộng đồng học thuật gắn kết và nâng cao tỷ lệ hoàn thành khóa học.""")

    # =========================================================================
    # SLIDE 12: PHÂN HỆ HỌC TẬP 1 - TRANG CHỦ & ĐĂNG KÝ KHÓA HỌC
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)
    add_slide_header(s12, "Phân Hệ 1: Trang Chủ, Danh Mục & Đăng Ký VietQR", slide_num=12)

    # Left: Image
    img1 = os.path.join(IMG_DIR, '01_Trang_Chu_Danh_Muc_Khoa_Hoc.png')
    if os.path.exists(img1):
        s12.shapes.add_picture(img1, Inches(0.8), Inches(1.8), width=Inches(6.2))

    # Right: Description
    card_desc1 = add_card(s12, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8))
    tf_d1 = card_desc1.text_frame
    tf_d1.word_wrap = True
    p_d1 = tf_d1.paragraphs[0]
    p_d1.text = "TƯƠNG TÁC ĐA CSDL TẠI TRANG CHỦ"
    p_d1.font.size = Pt(13)
    p_d1.font.bold = True
    p_d1.font.color.rgb = C_INDIGO_600

    d1_points = [
        ("Tối Ưu Hóa Cache-Aside (Redis):", "Khi học viên duyệt danh mục 12 khóa học, backend đọc khóa `cache:courses:catalog` trong Redis chỉ mất 3.8ms. Nếu cache rỗng, hệ thống nạp từ MongoDB và tự động cập nhật lại vào Redis với TTL 1800s."),
        ("Đăng Ký & Thanh Toán VietQR Động:", "Hệ thống sinh mã VietQR động chuẩn Napas 24/7 kèm mã giao dịch `EDUPRO_XXXX` và số tiền thực tế."),
        ("Xử Lý Giao Dịch Nguyên Tử (MongoDB):", "Khi bấm 'Xác nhận thanh toán', MongoDB thực hiện cập nhật nguyên tử (Atomic Update): Khóa học được thêm vào mảng `enrolledCourses` và học viên nhận ngay `+200 XP` thưởng."),
        ("Chế Độ Giao Diện (Dark/Light Mode):", "Tối ưu hóa trải nghiệm người dùng với chế độ tối chuyên nghiệp, chuyển đổi mượt mà.")
    ]
    for h, b in d1_points:
        ph = tf_d1.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(10.5)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_d1.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s12, """[LỜI THOẠI PHÂN HỆ 1 - NGUYỄN TRỌNG NGUYÊN]
Bây giờ em xin phép bắt đầu phần walkthrough giao diện thực tế và sự tương tác với 4 CSDL:
Tại Trang chủ:
- Học viên duyệt danh mục 12 khóa học tiêu biểu. Nhờ chiến lược Cache-Aside trên Redis, trang chủ hiển thị tức thì với độ trễ chỉ 3.8ms.
- Khi nhấp đăng ký khóa học, modal thanh toán xuất hiện mã VietQR động theo chuẩn ngân hàng.
- Khi người dùng bấm xác nhận đã thanh toán, backend chạy cập nhật nguyên tử trên MongoDB: thêm ID khóa học vào mảng `enrolledCourses` của học viên và cộng ngay 200 điểm XP thưởng. Thầy Cô có thể kiểm chứng trực tiếp sự thay đổi trường dữ liệu này ngay lập tức trên MongoDB Compass!""")

    # =========================================================================
    # SLIDE 13: PHÂN HỆ HỌC TẬP 2 - PHÒNG HỌC & VIDEO TELEMETRY
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13)
    add_slide_header(s13, "Phân Hệ 2: Lớp Học Video & Chuỗi Sự Kiện Cassandra", slide_num=13)

    img2 = os.path.join(IMG_DIR, '02_Phong_Hoc_Truc_Tuyen_Classroom.png')
    if os.path.exists(img2):
        s13.shapes.add_picture(img2, Inches(0.8), Inches(1.8), width=Inches(6.2))

    card_desc2 = add_card(s13, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8))
    tf_d2 = card_desc2.text_frame
    tf_d2.word_wrap = True
    p_d2 = tf_d2.paragraphs[0]
    p_d2.text = "CHUỖI THỜI GIAN TELEMETRY THỰC CHIẾN"
    p_d2.font.size = Pt(13)
    p_d2.font.bold = True
    p_d2.font.color.rgb = C_INDIGO_600

    d2_points = [
        ("Lớp Học Trực Tuyến Đa Phương Tiện:", "Trình phát video bài giảng chuyên sâu kết hợp tải tài liệu đính kèm (Handouts PDF) lưu trữ tại MongoDB."),
        ("Luồng Ghi Heartbeat (Apache Cassandra):", "Mỗi 5 giây hoặc khi người dùng tua video (Seek), trình duyệt tự động gửi gói tin Heartbeat về endpoint `/telemetry/heartbeat`.\nCassandra ghi nhận sự kiện `VIDEO_PROGRESS` với Partition Key `student_id` và Clustering Key `event_time DESC`."),
        ("Phân Tích Đường Cong Giữ Chân (Retention):", "Biểu đồ Retention Curve trực quan trên giao diện giúp giảng viên phân tích chính xác tỷ lệ học viên xem đến hết bài giảng hay bỏ dở ở mốc thời gian nào."),
        ("Ghi Chú Cá Nhân & Trao Đổi Thảo Luận:", "Học viên tạo ghi chú bài học cá nhân và thảo luận hỏi đáp trực tiếp với giảng viên.")
    ]
    for h, b in d2_points:
        ph = tf_d2.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(10.5)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_d2.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s13, """[LỜI THOẠI PHÂN HỆ 2 - VÕ HUỲNH GIA HUY]
Tiếp theo là Phân hệ Lớp học trực tuyến (Classroom) và luồng dữ liệu lớn Cassandra:
- Khi học viên bấm Play bài giảng, trình duyệt phát sinh cơ chế Heartbeat định kỳ gửi gói tin tiến độ về backend.
- Apache Cassandra tiếp nhận các gói tin này với tốc độ xử lý siêu nhanh mà không làm chậm video của học viên.
- Mở TablePlus kết nối Cassandra keyspace `elearning_tracking`, chúng ta thấy các bản ghi sự kiện `VIDEO_PLAY`, `VIDEO_PROGRESS` xuất hiện với timestamp chuẩn từng giây.
- Dữ liệu này được tổng hợp thành Biểu đồ Video Retention Curve, cung cấp cho giảng viên cái nhìn sâu sắc về chất lượng bài giảng và điểm rơi chú ý của sinh viên.""")

    # =========================================================================
    # SLIDE 14: PHÂN HỆ HỌC TẬP 3 - KHO TỪ VỰNG FLASHCARDS 3D & SRS
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14)
    add_slide_header(s14, "Phân Hệ 3: Kho 150 Từ Vựng Flashcards & SRS Anki", slide_num=14)

    img3 = os.path.join(IMG_DIR, '03_Kho_Tu_Vung_Flashcards_SRS.png')
    if os.path.exists(img3):
        s14.shapes.add_picture(img3, Inches(0.8), Inches(1.8), width=Inches(6.2))

    card_desc3 = add_card(s14, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8))
    tf_d3 = card_desc3.text_frame
    tf_d3.word_wrap = True
    p_d3 = tf_d3.paragraphs[0]
    p_d3.text = "GOM NHÓM 6 CHỦ ĐỀ & THUẬT TOÁN SRS"
    p_d3.font.size = Pt(13)
    p_d3.font.bold = True
    p_d3.font.color.rgb = C_INDIGO_600

    d3_points = [
        ("Kho 150 Từ Vựng Chuẩn Quốc Tế:", "Gom thành 6 nhóm chủ đề chuyên biệt:\n🌍 Môi trường & Khí hậu (25 từ) • 💼 Kinh doanh & Tài chính (25 từ)\n💻 Công nghệ & AI (25 từ) • 🎓 Giáo dục & Học thuật (25 từ)\n🏥 Y tế & Sức khỏe (20 từ) • 🗣️ Thành ngữ & Cụm từ (30 từ)"),
        ("Luyện Phát Âm Chuẩn UK & US:", "Tích hợp Web Speech API cho phép nghe phát âm chuẩn ngữ điệu Anh-Anh và Anh-Mỹ kèm câu ví dụ ngữ cảnh."),
        ("Thuật Toán Ôn Tập Ngắt Quãng (SRS Anki):", "4 mốc đánh giá: Again (1 phút), Hard (1 ngày), Good (3 ngày), Easy (7 ngày). Xếp lịch hàng đợi tự động qua Redis Sorted Set `flashcards:srs:{student}`."),
        ("Đánh Dấu Thuộc Từ (Redis Set):", "Lưu trạng thái đã thuộc vào Redis Set `flashcards:mastered:{student}` với chi phí kiểm tra O(1).")
    ]
    for h, b in d3_points:
        ph = tf_d3.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(10.5)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_d3.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s14, """[LỜI THOẠI PHÂN HỆ 3 - PHẠM NGUYỄN KHÔI NGUYÊN]
Tại phân hệ Kho từ vựng Flashcards 3D:
- Hệ thống đã được nâng cấp toàn diện với 150 từ vựng thực tế trong cơ sở dữ liệu MongoDB, gom nhóm thành 6 chủ đề học thuật rõ ràng: Môi trường, Kinh doanh, AI, Giáo dục, Y tế và Thành ngữ.
- Mỗi thẻ từ vựng có nút phát âm UK và US chuẩn xác, phiên âm IPA, loại từ, nghĩa tiếng Việt và Collocations.
- Đặc biệt, hệ thống tích hợp thuật toán ôn tập ngắt quãng (Spaced Repetition System - SRS) chuẩn Anki: với 4 mức độ đánh giá Again, Hard, Good, Easy. Mốc thời gian ôn tập kế tiếp được lưu vào Redis ZSET, tự động thông báo khi có từ vựng đến hạn ôn tập!""")

    # =========================================================================
    # SLIDE 15: PHÂN HỆ HỌC TẬP 4 - AUDIO DICTATION & WRITING AI
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15)
    add_slide_header(s15, "Phân Hệ 4: Audio Dictation Lab & Writing AI Lab", slide_num=15)

    img4 = os.path.join(IMG_DIR, '04_Phong_Luyen_Viet_Writing_AI.png')
    if os.path.exists(img4):
        s15.shapes.add_picture(img4, Inches(0.8), Inches(1.8), width=Inches(6.2))

    card_desc4 = add_card(s15, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8))
    tf_d4 = card_desc4.text_frame
    tf_d4.word_wrap = True
    p_d4 = tf_d4.paragraphs[0]
    p_d4.text = "LUYỆN TẬP ĐA KỸ NĂNG NGÔN NGỮ"
    p_d4.font.size = Pt(13)
    p_d4.font.bold = True
    p_d4.font.color.rgb = C_INDIGO_600

    d4_points = [
        ("Phòng Nghe Chép Chính Tả (Audio Dictation):", "Rèn luyện phản xạ nghe và viết chính xác từng từ vựng. Hệ thống phát âm thanh tốc độ chuẩn (1.0x) hoặc chậm (0.8x) với câu ví dụ ngữ cảnh."),
        ("Thuật Toán So Sánh Ký Tự & Từ Vựng:", "Áp dụng thuật toán Word Diff / Levenshtein Distance để đối chiếu văn bản học viên nhập với câu gốc, tô màu xanh từ đúng, màu đỏ từ sai/thiếu."),
        ("Phòng Luyện Viết Writing AI Lab:", "Học viên viết bài luận theo các chủ đề IELTS Writing Task 2. Tích hợp AI phân tích và chấm điểm bài viết theo 4 tiêu chí chuẩn quốc tế:\n• Task Response • Coherence & Cohesion • Lexical Resource • Grammar."),
        ("Lưu Vết Lịch Sử Bài Viết (MongoDB):", "Mỗi bài viết kèm phản hồi nhận xét chi tiết của AI được lưu vết vĩnh viễn vào collection `writing_submissions`.")
    ]
    for h, b in d4_points:
        ph = tf_d4.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(10.5)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_d4.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s15, """[LỜI THOẠI PHÂN HỆ 4 - NGUYỄN TRỌNG NGUYÊN]
Bên cạnh từ vựng và bài giảng, EduPro Academy mở rộng trải nghiệm học tập với hai phòng lab chuyên sâu:
1. Audio Dictation Lab: Cho phép học viên nghe và chép lại câu văn tiếng Anh. Thuật toán Word Diff tự động so khớp từng từ, tính độ chính xác phần trăm và chỉ ra các lỗi sai chính tả.
2. Writing AI Lab: Hỗ trợ người học luyện viết bài luận học thuật. Trợ lý AI sẽ đọc bài viết, phân tích cấu trúc ngữ pháp và từ vựng, sau đó đưa ra điểm số ước lượng và gợi ý sửa lỗi chi tiết theo chuẩn chấm thi quốc tế IELTS.""")

    # =========================================================================
    # SLIDE 16: PHÂN HỆ KHẢO SÁT NĂNG LỰC - PHÒNG THI & ANTI-CHEAT
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    set_slide_background(s16)
    add_slide_header(s16, "Phân Hệ 5: Phòng Thi Trực Tuyến & Giám Sát Anti-Cheat", slide_num=16)

    img5 = os.path.join(IMG_DIR, '05_Phong_Thi_Trac_Nghiem_Online.png')
    if os.path.exists(img5):
        s16.shapes.add_picture(img5, Inches(0.8), Inches(1.8), width=Inches(6.2))

    card_desc5 = add_card(s16, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8))
    tf_d5 = card_desc5.text_frame
    tf_d5.word_wrap = True
    p_d5 = tf_d5.paragraphs[0]
    p_d5.text = "TÍNH TOÀN VẸN & BẢO MẬT PHÒNG THI"
    p_d5.font.size = Pt(13)
    p_d5.font.bold = True
    p_d5.font.color.rgb = C_INDIGO_600

    d5_points = [
        ("Phòng Thi Trắc Nghiệm Chuẩn Hóa:", "Đồng hồ đếm ngược 1800s quản lý đồng thời qua trình duyệt và TTL Redis. Nạp đề thi từ MongoDB `questions`."),
        ("Lưu Đáp Án Siêu Tốc (Redis Hash):", "Mỗi khi thí sinh chọn đáp án, hệ thống ghi ngay vào Redis Hash `exam:{id}:answers:{student}` trong < 2ms, đảm bảo không mất câu trả lời nếu rớt mạng."),
        ("Giám Sát Gian Lận Anti-Cheat:", "Bắt sự kiện `visibilitychange` và `window.blur`: Khi thí sinh chuyển tab hoặc bật phần mềm ngoài, màn hình lập tức khóa và bật cảnh báo đỏ (1/3).\nSự kiện gian lận ghi vào Cassandra `anti_cheat_events`."),
        ("Chấm Thi Tự Động & Đua Top ZSET:", "Nộp bài thi: Tính điểm tự động, lưu kết quả vào MongoDB `results` và đẩy ngay điểm số vào Redis Sorted Set `exam:{id}:leaderboard`.")
    ]
    for h, b in d5_points:
        ph = tf_d5.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(10.5)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_d5.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s16, """[LỜI THOẠI PHÂN HỆ 5 - PHẠM NGUYỄN KHÔI NGUYÊN]
Tại phân hệ Phòng thi trắc nghiệm trực tuyến:
- Từng đáp án thí sinh bấm được lưu trực tiếp vào Redis Hash với độ trễ dưới 2ms, bảo vệ an toàn tuyệt đối kết quả làm bài ngay cả khi máy tính học viên bị mất điện đột ngột.
- Tính năng Anti-Cheat giám sát nghiêm ngặt: khi học viên chuyển tab để tra cứu đáp án, hệ thống phát hiện ngay lập tức, bật cảnh báo đỏ vi phạm quy chế (1/3) và lưu bằng chứng vào bảng `anti_cheat_events` trên Cassandra.
- Khi nộp bài, điểm số được tính toán tự động và cập nhật ngay vào Redis Sorted Set để xếp hạng bảng vàng tuần theo thời gian thực!""")

    # =========================================================================
    # SLIDE 17: PHÂN HỆ GAMIFICATION & CHỨNG CHỈ SỐ
    # =========================================================================
    s17 = prs.slides.add_slide(blank_layout)
    set_slide_background(s17)
    add_slide_header(s17, "Phân Hệ 6: Gamification XP & Chứng Chỉ Số Điện Tử", slide_num=17)

    img9 = os.path.join(IMG_DIR, '09_Bang_Diem_Lich_Su_Gamification.png')
    if os.path.exists(img9):
        s17.shapes.add_picture(img9, Inches(0.8), Inches(1.8), width=Inches(6.2))

    card_desc6 = add_card(s17, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8))
    tf_d6 = card_desc6.text_frame
    tf_d6.word_wrap = True
    p_d6 = tf_d6.paragraphs[0]
    p_d6.text = "KÍCH THÍCH ĐỘNG LỰC HỌC TẬP"
    p_d6.font.size = Pt(13)
    p_d6.font.bold = True
    p_d6.font.color.rgb = C_INDIGO_600

    d6_points = [
        ("Tích Lũy Điểm Thưởng XP & Streak:", "Mỗi bài học, bài thi và thẻ từ vựng hoàn thành đều được cộng điểm XP. Hệ thống duy trì chuỗi ngày học liên tục (Streak Count) kích thích học tập."),
        ("Bảng Xếp Hạng Đua Top Tuần:", "Lấy Top thí sinh xuất sắc từ Redis ZSET qua lệnh `ZREVRANGE`, hiển thị huy hiệu Vàng, Bạc, Đồng trực quan."),
        ("Cửa Hàng Đổi Quà Tích Lũy XP:", "Học viên dùng điểm XP để mua các vật phẩm hữu ích như: Streak Freeze (bảo lưu chuỗi ngày học) hoặc khung avatar danh dự."),
        ("Cấp Chứng Chỉ Số Điện Tử (Certificate):", "Sau khi hoàn thành bài thi đạt chuẩn, học viên được cấp chứng chỉ điện tử kèm mã định danh băm SHA-256 xác thực trực tiếp trên MongoDB.")
    ]
    for h, b in d6_points:
        ph = tf_d6.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(10.5)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_d6.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s17, """[LỜI THOẠI PHÂN HỆ 6 - NGUYỄN TRỌNG NGUYÊN]
Hệ thống Gamification và Chứng chỉ số điện tử:
- Gamification được thiết kế sâu vào từng hành động học tập: tích lũy XP, đua top bảng vàng bằng Redis ZSET và cửa hàng đổi quà ảo.
- Học viên có thể dùng XP đổi vật phẩm Streak Freeze để bảo lưu chuỗi học khi bận việc.
- Sau khi thi đạt điểm chuẩn, học viên được cấp một Chứng chỉ số điện tử với mã băm xác thực, có thể tra cứu và xác thực tính hợp lệ trực tiếp trên MongoDB, khẳng định sự hoàn thiện nghiệp vụ của đề tài.""")

    # =========================================================================
    # SLIDE 18: BẢN ĐỒ TRI THỨC NEO4J & TRỢ LÝ AI COPILOT
    # =========================================================================
    s18 = prs.slides.add_slide(blank_layout)
    set_slide_background(s18)
    add_slide_header(s18, "Phân Hệ 7: Bản Đồ Tri Thức Neo4j & Trợ Lý AI Copilot", slide_num=18)

    img7 = os.path.join(IMG_DIR, '07_Ban_Do_Tri_Thuc_Neo4j_Graph.png')
    if os.path.exists(img7):
        s18.shapes.add_picture(img7, Inches(0.8), Inches(1.8), width=Inches(6.2))

    card_desc7 = add_card(s18, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8))
    tf_d7 = card_desc7.text_frame
    tf_d7.word_wrap = True
    p_d7 = tf_d7.paragraphs[0]
    p_d7.text = "ĐỒ THỊ TƯƠNG TÁC & TRÍ TUỆ NHÂN TẠO"
    p_d7.font.size = Pt(13)
    p_d7.font.bold = True
    p_d7.font.color.rgb = C_INDIGO_600

    d7_points = [
        ("Bản Đồ Tri Thức Ngôn Ngữ (Vis.js + Neo4j):", "Hiển thị trực quan mạng lưới các thực thể: Khóa học, Bài học, Chủ điểm và Kỹ năng CEFR. Học viên nhấp vào từng nốt để xem chi tiết và lộ trình tiên quyết."),
        ("Mạng Lưới Bạn Cùng Tiến (Study Buddies):", "Thuật toán lọc cộng tác Cypher trên Neo4j tự động tìm kiếm những bạn học có chung mục tiêu Band điểm để ghép đôi học tập."),
        ("EduPro Smart AI Copilot:", "Trợ lý ảo học tập thông minh tích hợp ngay góc màn hình, hỗ trợ giải đáp thắc mắc về lộ trình học, ngữ pháp và phân tích tổng hợp từ cả 4 CSDL NoSQL."),
        ("Giao Thức Truyền Tin Thời Gian Thực:", "Sử dụng Server-Sent Events (SSE) để truyền dữ liệu phản hồi mượt mà cho học viên.")
    ]
    for h, b in d7_points:
        ph = tf_d7.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(10.5)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_d7.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s18, """[LỜI THOẠI PHÂN HỆ 7 - VÕ HUỲNH GIA HUY]
Tại Bản đồ tri thức kỹ năng Neo4j:
- Thư viện Vis.js kết nối trực tiếp với Neo4j qua giao thức Bolt, render toàn bộ mạng lưới bài học và kỹ năng.
- Khi người dùng click vào một node bài học, hệ thống chạy Cypher Shortest Path và hiển thị ngay lộ trình các bài học tiên quyết cần học trước.
- Mục Bạn Cùng Tiến tự động gợi ý bạn học tương thích trên 90% dựa trên giải thuật đồ thị Co-enrollment.
- Và trợ lý thông minh EduPro Smart AI Copilot ở góc phải hỗ trợ giải đáp tức thì cho học viên bằng cách truy xuất thông tin tổng hợp từ 4 nguồn CSDL NoSQL.""")

    # =========================================================================
    # SLIDE 19: QUẢN TRỊ CMS, TƯỜNG LỬA REDIS & SAO LƯU PHỤC HỒI
    # =========================================================================
    s19 = prs.slides.add_slide(blank_layout)
    set_slide_background(s19)
    add_slide_header(s19, "Phân Hệ 8: CMS Quản Trị, Tường Lửa & Phục Hồi Dữ Liệu", slide_num=19)

    img13 = os.path.join(IMG_DIR, '13_Bang_Dieu_Khien_Quan_Tri_CMS_Telemetry.png')
    if os.path.exists(img13):
        s19.shapes.add_picture(img13, Inches(0.8), Inches(1.8), width=Inches(6.2))

    card_desc8 = add_card(s19, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.8))
    tf_d8 = card_desc8.text_frame
    tf_d8.word_wrap = True
    p_d8 = tf_d8.paragraphs[0]
    p_d8.text = "QUẢN TRỊ HẠ TẦNG & AN NINH MẠNG"
    p_d8.font.size = Pt(13)
    p_d8.font.bold = True
    p_d8.font.color.rgb = C_INDIGO_600

    d8_points = [
        ("Bảng Điều Khiển CMS Giảng Viên & Admin:", "Quản trị ngân hàng câu hỏi đề thi, khóa học. Khi lưu thay đổi, MongoDB cập nhật document và backend tự động xóa khóa cache Redis liên quan (Cache Invalidation)."),
        ("Tường Lửa Redis Sliding Window (120 RPM):", "Ngăn chặn các cuộc tấn công Brute-force hoặc DDoS. Ghi nhận timestamp mỗi request vào Sorted Set. Khi vượt ngưỡng 120 req/phút, tự động chặn bằng mã lỗi HTTP 429 và cách ly IP."),
        ("Giám Sát Trạng Thái 4 CSDL Realtime:", "4 đèn trạng thái hiển thị kết nối trực tiếp: MongoDB (Native Live), Redis (Cache Ready), Cassandra (CQL Connected), Neo4j (Bolt Active)."),
        ("Sao Lưu Hợp Nhất 4 CSDL (Unified Backup):", "Module tự động sao lưu đồng thời (mongodump, redis RDB, cqlsh snapshot, neo4j dump). Phục hồi 1.000 bản ghi trong 4.2 giây.")
    ]
    for h, b in d8_points:
        ph = tf_d8.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(10.5)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_d8.add_paragraph()
        pb.text = b
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s19, """[LỜI THOẠI PHÂN HỆ 8 - NGUYỄN TRỌNG NGUYÊN]
Chuyển sang phân hệ Quản trị viên và An ninh hạ tầng:
- Đăng nhập quyền Admin, bảng điều khiển CMS cho phép chỉnh sửa nội dung đề thi trực tiếp trên MongoDB.
- Phía an ninh: Backend tích hợp Tường lửa Redis Sliding Window Rate Limiter 120 RPM. Mỗi request được ghi nhận timestamp vào ZSET; nếu có IP gửi quá 120 request/phút, hệ thống chặn ngay bằng mã HTTP 429 và đưa vào danh sách đen.
- Bảng giám sát hạ tầng hiển thị đèn xanh kết nối của cả 4 hệ CSDL.
- Và nút 'Tạo bản sao lưu hợp nhất' cho phép backup an toàn dữ liệu từ cả 4 CSDL và phục hồi 100% trong vòng dưới 4.5 giây khi có sự cố.""")

    # =========================================================================
    # SLIDE 20: ĐO KIỂM HIỆU NĂNG & BENCHMARK THỰC TẾ
    # =========================================================================
    s20 = prs.slides.add_slide(blank_layout)
    set_slide_background(s20)
    add_slide_header(s20, "Đo Kiểm Hiệu Năng & Kết Quả Benchmark Thực Tế", slide_num=20)

    # 4 Stat Cards
    bench_stats = [
        ("Độ Trễ Đọc Redis Cache", "3.8 ms", "NFR: < 50ms (Vượt mục tiêu gấp 13 lần)"),
        ("Throughput Đọc Redis", "4,250 req/s", "Tăng tốc gấp 8.1 lần so với đọc đĩa MongoDB"),
        ("Thông Lượng Ghi Cassandra", "2,480 writes/s", "Ghi tuần tự Heartbeat không khóa bảng"),
        ("Truy Vấn Đồ Thị Neo4j", "5.8 ms", "Duyệt đường đi ngắn nhất Index-Free Adjacency")
    ]
    for idx, (lbl, val, sub) in enumerate(bench_stats):
        left = Inches(0.8 + idx * 2.95)
        top = Inches(1.8)
        card = add_card(s20, left, top, Inches(2.8), Inches(1.8))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = lbl
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_INDIGO_600

        p2 = tf.add_paragraph()
        p2.text = val
        p2.font.size = Pt(24)
        p2.font.bold = True
        p2.font.color.rgb = C_DARK_NAVY

        p3 = tf.add_paragraph()
        p3.text = sub
        p3.font.size = Pt(9)
        p3.font.color.rgb = C_MUTED

    # Comparison Table Card
    card_table = add_card(s20, Inches(0.8), Inches(3.8), Inches(11.733), Inches(2.8))
    tf_tbl = card_table.text_frame
    tf_tbl.word_wrap = True
    p_th = tf_tbl.paragraphs[0]
    p_th.text = "BẢNG ĐỐI SÁNH HIỆU NĂNG THỰC NGHIỆM (K6 & AUTOCANNON BENCHMARK)"
    p_th.font.size = Pt(12)
    p_th.font.bold = True
    p_th.font.color.rgb = C_DARK_NAVY

    table_rows = [
        "Mẫu truy cập (Access Pattern)             | Công nghệ NoSQL   | Throughput (req/s) | Độ trễ p50 | Độ trễ p95 | Trạng thái NFR",
        "-------------------------------------------------------------------------------------------------------------------------",
        "AP-01: Đọc danh mục khóa học (Cache Hit)  | Redis Cache-Aside | 4,250 req/s        | 2.1 ms     | 3.8 ms     | Đạt xuất sắc",
        "AP-01: Đọc danh mục từ MongoDB (No Cache) | MongoDB Collection| 520 req/s          | 24.5 ms    | 38.2 ms    | Đạt tiêu chuẩn",
        "AP-06: Ghi nhật ký video Telemetry       | Apache Cassandra  | 2,480 writes/s     | 3.9 ms     | 6.4 ms     | Đạt xuất sắc",
        "AP-07: Đua top bảng xếp hạng tuần (ZSET)  | Redis Sorted Set  | 3,890 req/s        | 1.8 ms     | 3.2 ms     | Đạt xuất sắc",
        "AP-09: Tìm lộ trình học bài tiên quyết    | Neo4j ShortestPath| 1,120 req/s        | 3.4 ms     | 5.8 ms     | Đạt xuất sắc"
    ]
    for row in table_rows:
        pr = tf_tbl.add_paragraph()
        pr.text = row
        pr.font.size = Pt(9.5)
        pr.font.name = "Consolas"
        pr.font.color.rgb = C_SLATE_700

    add_notes(s20, """[LỜI THOẠI BENCHMARK - NGUYỄN TRỌNG NGUYÊN]
Kính thưa Hội đồng, đây là phần số liệu đo kiểm thực nghiệm bằng công cụ k6 và autocannon:
- Khi có Redis Cache-Aside, độ trễ đọc danh mục ở phân vị p95 chỉ còn 3.8 mili-giây, thông lượng đạt 4.250 request/giây, tăng tốc gấp hơn 8 lần so với việc đọc trực tiếp từ đĩa MongoDB.
- Cassandra tiếp nhận luồng ghi Telemetry với thông lượng ấn tượng 2.480 lượt ghi mỗi giây, độ trễ p95 chỉ 6.4ms.
- Lệnh truy vấn bảng xếp hạng trên Redis ZSET đạt tốc độ 3.890 req/s và độ trễ p95 là 3.2ms.
- Và câu truy vấn đồ thị Cypher trên Neo4j trả về kết quả chỉ sau 5.8ms. Mọi chỉ số đều vượt xa yêu cầu NFR ban đầu đề ra!""")

    # =========================================================================
    # SLIDE 21: ĐÁNH GIÁ CHỊU LỖI & TÍNH SẴN SÀNG CAO
    # =========================================================================
    s21 = prs.slides.add_slide(blank_layout)
    set_slide_background(s21)
    add_slide_header(s21, "Đánh Giá Khả Năng Chịu Lỗi & Tính Sẵn Sàng Cao", slide_num=21)

    ft_blocks = [
        ("IN-MEMORY FALLBACK RESILIENCE (REDIS OFFLINE)", "• Cơ chế: Nếu Redis gặp sự cố tạm thời, backend tự động chuyển vùng đệm sang bộ nhớ RAM cục bộ (`Map` & `Set` in-memory).\n• Kết quả: Thí sinh đang làm bài thi vẫn tiếp tục chọn đáp án bình thường, không bị văng khỏi phòng thi.\n• Khi Redis online trở lại: Hệ thống tự động đồng bộ ngược dữ liệu."),
        ("OFFLINE BUFFER LOGGING (CASSANDRA OFFLINE)", "• Cơ chế: Khi Cassandra mất kết nối mạng, các gói tin Heartbeat và Anti-cheat được chuyển vào bộ đệm bộ nhớ đệm `memoryCassandraLogs`.\n• Kết quả: Không làm gián đoạn luồng phát video của học viên.\n• Không gây lỗi 500 Internal Server Error cho ứng dụng."),
        ("TÍNH TOÀN VẸN GIAO DỊCH & SAO LƯU PHỤC HỒI", "• Cơ chế: Module Unified Backup đồng bộ dữ liệu của cả 4 CSDL.\n• Kịch bản thử nghiệm: Giả lập xóa dữ liệu 1.000 bản ghi, hệ thống thực hiện khôi phục hoàn chỉnh trong vòng 4.2 giây.\n• Tỷ lệ toàn vẹn dữ liệu: 100% không suy hao.")
    ]

    for idx, (title, details) in enumerate(ft_blocks):
        top = Inches(1.8 + idx * 1.65)
        card = add_card(s21, Inches(0.8), top, Inches(11.733), Inches(1.5))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = C_EMERALD

        p2 = tf.add_paragraph()
        p2.text = details
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_SLATE_700

    add_notes(s21, """[LỜI THOẠI CHỊU LỖI - VÕ HUỲNH GIA HUY]
Về mặt kiểm thử khả năng chịu lỗi và tính sẵn sàng cao:
Hệ thống tích hợp kiến trúc In-Memory Fallback Resilience độc quyền:
- Khi thử nghiệm tắt tiến trình Redis đột ngột trong lúc đang thi, backend tự động kích hoạt bộ đệm RAM cục bộ, học viên vẫn chọn đáp án và nộp bài bình thường mà không hề thấy màn hình báo lỗi.
- Tương tự với Cassandra: các sự kiện Telemetry được tạm lưu vào buffer ngoại tuyến và không làm đơ trình phát video.
- Thử nghiệm phục hồi sau sự cố chứng minh 1.000 bản ghi được khôi phục nguyên vẹn 100% trong 4.2 giây, khẳng định tính sẵn sàng và độ tin cậy cấp doanh nghiệp.""")

    # =========================================================================
    # SLIDE 22: ĐÁNH GIÁ KẾT QUẢ ĐẠT ĐƯỢC
    # =========================================================================
    s22 = prs.slides.add_slide(blank_layout)
    set_slide_background(s22)
    add_slide_header(s22, "Đánh Giá Kết Quả Đạt Được So Với Mục Tiêu", slide_num=22)

    results = [
        ("16/16 Access Patterns", "Đáp ứng hoàn chỉnh 100% các mẫu truy xuất dữ liệu từ AP-01 đến AP-16 theo đặc tả IEEE 1016.", C_EMERALD),
        ("Tích Hợp 4 CSDL NoSQL", "Vận hành đồng thời MongoDB, Redis, Cassandra và Neo4j trong cùng một hệ sinh thái duy nhất.", C_INDIGO_600),
        ("15 Tính Năng Hoàn Chỉnh", "Triển khai đầy đủ từ Lớp học video, Flashcards 150 từ, Phòng thi, Anti-cheat, Gamification đến CMS.", C_AMBER),
        ("100% Dữ Liệu Thực Tế", "Không sử dụng mock data, toàn bộ nghiệp vụ đều tương tác và thay đổi trạng thái thật trên database.", C_DARK_NAVY)
    ]

    for idx, (title, desc, color) in enumerate(results):
        col = idx % 2
        row = idx // 2
        left = Inches(0.8 + col * 5.9)
        top = Inches(1.8 + row * 2.5)
        card = add_card(s22, left, top, Inches(5.6), Inches(2.3))
        tf = card.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = color

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_SLATE_700

    add_notes(s22, """[LỜI THOẠI KẾT QUẢ - PHẠM NGUYỄN KHÔI NGUYÊN]
Tổng kết lại các kết quả đã đạt được:
- Nhóm đã hoàn thành 100% các mục tiêu đề ra ban đầu.
- Toàn bộ 16 Access Patterns từ AP-01 đến AP-16 đều được hiện thực hóa trọn vẹn và tối ưu trên 4 CSDL NoSQL.
- Xây dựng thành công 15 tính năng người dùng phong phú, hỗ trợ học tập toàn diện.
- Toàn bộ đồ án vận hành trên dữ liệu thật, minh chứng rõ ràng qua cả 4 công cụ quản trị GUI Tool.""")

    # =========================================================================
    # SLIDE 23: HẠN CHẾ & HƯỚNG PHÁT TRIỂN TƯƠNG LAI
    # =========================================================================
    s23 = prs.slides.add_slide(blank_layout)
    set_slide_background(s23)
    add_slide_header(s23, "Hạn Chế Của Hệ Thống & Hướng Phát Triển", slide_num=23)

    card_lim = add_card(s23, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    tf_lim = card_lim.text_frame
    tf_lim.word_wrap = True
    p_lim_h = tf_lim.paragraphs[0]
    p_lim_h.text = "HẠN CHẾ HIỆN TẠI CỦA HỆ THỐNG"
    p_lim_h.font.size = Pt(14)
    p_lim_h.font.bold = True
    p_lim_h.font.color.rgb = C_ROSE

    lim_items = [
        ("Tìm Kiếm Toàn Văn (Full-Text Search):", "Hiện tại việc tìm kiếm tài liệu và bài học vẫn dùng regex trên MongoDB, chưa có bộ phân tích hình thái học (Morphological Analyzer) tiếng Việt chuyên sâu."),
        ("Mô Hình Trợ Lý AI:", "AI Copilot hiện tại hoạt động theo quy tắc kịch bản và API tĩnh, chưa có khả năng truy xuất tăng cường ngữ nghĩa sâu."),
        ("Quy Mô Cụm Phân Tán:", "Hiện tại 4 CSDL đang chạy trên mô hình Single-Node Container; chưa triển khai phân cụm đa vùng (Multi-Region Clustering).")
    ]
    for h, b in lim_items:
        ph = tf_lim.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(11)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_lim.add_paragraph()
        pb.text = b
        pb.font.size = Pt(10)
        pb.font.color.rgb = C_SLATE_700

    card_fut = add_card(s23, Inches(6.9), Inches(1.8), Inches(5.6), Inches(4.8))
    tf_fut = card_fut.text_frame
    tf_fut.word_wrap = True
    p_fut_h = tf_fut.paragraphs[0]
    p_fut_h.text = "HƯỚNG PHÁT TRIỂN TƯƠNG LAI"
    p_fut_h.font.size = Pt(14)
    p_fut_h.font.bold = True
    p_fut_h.font.color.rgb = C_INDIGO_600

    fut_items = [
        ("Tích Hợp Elasticsearch / OpenSearch:", "Bổ sung công cụ tìm kiếm toàn văn Full-Text Search chuyên dụng cho hàng triệu tài liệu và từ vựng học thuật."),
        ("Tích Hợp Vector Database (Milvus / Qdrant):", "Nâng cấp trợ lý AI Copilot với công nghệ Retrieval-Augmented Generation (RAG) để học viên tra cứu ngữ pháp thông minh."),
        ("Mở Rộng Cụm Kubernetes (K8s):", "Triển khai Auto-scaling đa cụm cho Cassandra và MongoDB Sharding để sẵn sàng phục vụ quy mô trên 100.000 học viên đồng thời.")
    ]
    for h, b in fut_items:
        ph = tf_fut.add_paragraph()
        ph.text = "\n• " + h
        ph.font.size = Pt(11)
        ph.font.bold = True
        ph.font.color.rgb = C_DARK_NAVY
        pb = tf_fut.add_paragraph()
        pb.text = b
        pb.font.size = Pt(10)
        pb.font.color.rgb = C_SLATE_700

    add_notes(s23, """[LỜI THOẠI HƯỚNG PHÁT TRIỂN - NGUYỄN TRỌNG NGUYÊN]
Nhìn nhận một cách khách quan về mặt học thuật:
- Hệ thống hiện tại vẫn còn một số điểm có thể nâng cấp như công cụ tìm kiếm toàn văn tài liệu tiếng Việt và quy mô phân cụm Kubernetes.
- Trong tương lai, nhóm định hướng sẽ tích hợp thêm Elasticsearch cho Full-Text Search, và đặc biệt là Vector Database (như Milvus hay Qdrant) để xây dựng trợ lý AI RAG có thể đọc hiểu và giải đáp giáo trình bài học một cách tự nhiên và chính xác nhất.""")

    # =========================================================================
    # SLIDE 24: TỔNG KẾT & LỜI CẢM ƠN (Q&A)
    # =========================================================================
    s24 = prs.slides.add_slide(blank_layout)
    set_slide_background(s24, C_DARK_NAVY)

    banner24 = s24.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(0.4), prs.slide_height)
    banner24.fill.solid()
    banner24.fill.fore_color.rgb = C_INDIGO_600
    banner24.line.fill.background()

    card_end = add_card(s24, Inches(1.5), Inches(1.2), Inches(10.5), Inches(5.0), RGBColor(30, 41, 59), RGBColor(51, 65, 85))
    tf_end = card_end.text_frame
    tf_end.word_wrap = True

    p_e1 = tf_end.paragraphs[0]
    p_e1.text = "XIN CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ VÀ CÁC BẠN!"
    p_e1.font.size = Pt(22)
    p_e1.font.bold = True
    p_e1.font.color.rgb = C_AMBER
    p_e1.alignment = PP_ALIGN.CENTER

    p_e2 = tf_end.add_paragraph()
    p_e2.text = "\nNHÓM 18 KÍNH CHÚC QUÝ THẦY CÔ SỨC KHỎE VÀ CÔNG TÁC TỐT!"
    p_e2.font.size = Pt(14)
    p_e2.font.bold = True
    p_e2.font.color.rgb = C_WHITE
    p_e2.alignment = PP_ALIGN.CENTER

    p_e3 = tf_end.add_paragraph()
    p_e3.text = "\nNhóm em rất mong nhận được những nhận xét, góp ý quý báu của Quý Thầy Cô trong Hội đồng để đồ án được hoàn thiện hơn nữa."
    p_e3.font.size = Pt(12)
    p_e3.font.color.rgb = RGBColor(203, 213, 225)
    p_e3.alignment = PP_ALIGN.CENTER

    p_e4 = tf_end.add_paragraph()
    p_e4.text = "\n--- PHẦN HỎI ĐÁP VẤN ĐÁP (Q & A) ---"
    p_e4.font.size = Pt(15)
    p_e4.font.bold = True
    p_e4.font.color.rgb = C_EMERALD
    p_e4.alignment = PP_ALIGN.CENTER

    add_notes(s24, """[LỜI KẾT - CẢ 3 THÀNH VIÊN]
Kính thưa Quý Thầy Cô trong Hội đồng chấm thi!
Qua quá trình thực hiện đồ án, nhóm 18 đã tích lũy được những kiến thức vô cùng quý giá về cách phối hợp sức mạnh của 4 hệ cơ sở dữ liệu NoSQL trong một ứng dụng thực tế quy mô lớn.
Nhóm em xin bày tỏ lòng biết ơn sâu sắc đến Quý Thầy Cô Bộ môn Công nghệ Phần mềm & Cơ sở dữ liệu - Khoa Công nghệ Thông tin HUIT đã tận tình hướng dẫn, truyền đạt kiến thức và đồng hành cùng chúng em trong suốt học phần.
Bây giờ, nhóm 18 xin được lắng nghe những câu hỏi vấn đáp và đóng góp ý kiến của Thầy Cô. Nhóm em xin chân thành cảm ơn!""")

    # Output paths
    output_path1 = os.path.abspath('03_Tai_Lieu_Do_An/BAO_CAO_THUYET_TRINH_NOSQL_EDUPRO_ACADEMY.pptx')
    prs.save(output_path1)
    print(f"Saved: {output_path1}")

    output_path2 = os.path.abspath('TÀI LIỆU FINAL/BAO_CAO_THUYET_TRINH_NOSQL_EDUPRO_ACADEMY.pptx')
    os.makedirs(os.path.dirname(output_path2), exist_ok=True)
    prs.save(output_path2)
    print(f"Saved: {output_path2}")

    return output_path1, output_path2

if __name__ == '__main__':
    create_presentation()
