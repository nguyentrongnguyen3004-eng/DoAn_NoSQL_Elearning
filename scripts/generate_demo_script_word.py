# -*- coding: utf-8 -*-
"""
Script generate_demo_script_word.py
Xuất tệp Word (.docx) Kịch bản chi tiết quay video demo & phân chia record
Định dạng chuẩn thể thức HUIT: Times New Roman, A4 (Trái 3cm, Phải 2cm, Trên 2cm, Dưới 2cm).
"""

import os
import sys
import docx
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_PATHS = [
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\TÀI LIỆU FINAL\KICH_BAN_DEMO_VIDEO_5_7_PHUT_3_THANH_VIEN.docx',
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\07_Video_Demo\KICH_BAN_DEMO_CHI_TIET_VIDEO_5_7_PHUT.docx',
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\07_Kich_Ban_Demo_Video_5_7_Phut.docx'
]

# Bảng màu chuẩn báo cáo học thuật
COLOR_PRIMARY = RGBColor(26, 54, 93)     # Xanh Navy đậm (#1A365D)
COLOR_SECONDARY = RGBColor(37, 99, 235)  # Xanh dương (#2563EB)
COLOR_TEXT = RGBColor(15, 23, 42)        # Đen xám (#0F172A)
COLOR_MUTED = RGBColor(71, 85, 105)      # Xám vừa (#475569)
COLOR_SUCCESS = RGBColor(5, 150, 105)    # Xanh lá (#059669)

HEX_PRIMARY = "1A365D"
HEX_LIGHT_BG = "F1F5F9"
HEX_BORDER = "CBD5E1"
HEX_ACCENT = "E0E7FF"

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def create_document():
    doc = docx.Document()

    # Cấu hình lề chuẩn A4 HUIT (Trái 3cm, Phải 2cm, Trên 2cm, Dưới 2cm)
    for section in doc.sections:
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(3.0)
        section.right_margin = Cm(2.0)

    # Cấu hình Normal style
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(13)
    style_normal.font.color.rgb = COLOR_TEXT
    style_normal.paragraph_format.line_spacing = 1.25
    style_normal.paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # HEADER TRANG ĐẦU TIÊN
    # -------------------------------------------------------------
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p_header.add_run("BỘ CÔNG THƯƠNG\nTRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH (HUIT)\nKHOA CÔNG NGHỆ THÔNG TIN\n")
    r1.font.size = Pt(12)
    r1.font.bold = True
    r1.font.color.rgb = COLOR_PRIMARY

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_div = p_div.add_run("━━━━━━━━━━━━━━━━━━━ ◆ ━━━━━━━━━━━━━━━━━━━")
    r_div.font.size = Pt(10)
    r_div.font.color.rgb = COLOR_SECONDARY

    # Tiêu đề tài liệu
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(8)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("KỊCH BẢN CHI TIẾT QUAY VIDEO DEMO & PHÂN CHIA RECORD")
    r_title.font.size = Pt(16)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(12)
    r_sub = p_sub.add_run("ĐỒ ÁN HỌC PHẦN: DỮ LIỆU NoSQL (14DH) — HỆ THỐNG EDUPRO ACADEMY\n(Thời lượng chuẩn quy định: 5 — 7 phút | Khung thực hiện: 6 phút 30 giây)")
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_SECONDARY

    # -------------------------------------------------------------
    # HỘP THÔNG TIN NHÓM THỰC HIỆN
    # -------------------------------------------------------------
    tbl_team = doc.add_table(rows=4, cols=4)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_team, color="1A365D", sz="6")

    headers_team = ["Họ và tên", "MSSV", "Vai trò trong nhóm", "Phụ trách chuyên sâu CSDL NoSQL"]
    for j, h in enumerate(headers_team):
        cell = tbl_team.cell(0, j)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, 160, 160, 160, 160)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.font.bold = True
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(255, 255, 255)

    data_team = [
        ["Nguyễn Trọng Nguyên", "2001230589", "Trưởng nhóm / Lead Architect", "Kiến trúc Polyglot Core, MongoDB, Redis, Cassandra, Neo4j"],
        ["Phạm Nguyễn Khôi Nguyên", "2001230578", "Thành viên", "MongoDB Document Model, Redis Cache, Exam Session & Gamification"],
        ["Võ Huỳnh Gia Huy", "2001230303", "Thành viên", "Apache Cassandra Time-Series Telemetry, Neo4j Graph Queries"]
    ]

    col_widths = [Cm(4.5), Cm(2.5), Cm(4.0), Cm(5.0)]
    for i, row in enumerate(data_team):
        for j, val in enumerate(row):
            cell = tbl_team.cell(i + 1, j)
            set_cell_margins(cell, 120, 120, 140, 140)
            if i % 2 == 1:
                set_cell_background(cell, HEX_LIGHT_BG)
            p = cell.paragraphs[0]
            if j == 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(val)
            run.font.size = Pt(11)
            if j == 0:
                run.font.bold = True

    for row in tbl_team.rows:
        for j, w in enumerate(col_widths):
            row.cells[j].width = w

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # MỤC 1: QUY CHUẨN THI CÔNG VIDEO DEMO
    # -------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(4)
    r_h1 = h1.add_run("1. NGUYÊN TẮC VÀ TIÊU CHÍ ĐÁNH GIÁ VIDEO DEMO (HUIT)")
    r_h1.font.size = Pt(14)
    r_h1.font.bold = True
    r_h1.font.color.rgb = COLOR_PRIMARY

    p_rule = doc.add_paragraph()
    p_rule.paragraph_format.first_line_indent = Cm(1.25)
    p_rule.add_run("Để đạt điểm tối đa ở Tiêu chí 9 (Giao diện & Nghiệp vụ - 2.5 điểm) và Tiêu chí 10 (Tính năng nâng cao & Tối ưu - 2.0 điểm), toàn bộ quy trình quay video bắt buộc phải tuân thủ nghiêm ngặt 3 nguyên tắc sau:")

    rules = [
        ("Nguyên tắc Side-by-Side (Bắt buộc 100%): ", "Mỗi thao tác click trên giao diện Web (http://localhost:5050) phải được chuyển tab hoặc chia đôi màn hình song song với phần mềm GUI Tool tương ứng (MongoDB Compass, RedisInsight, TablePlus/Cassandra, Neo4j Browser) để chứng minh dữ liệu NoSQL được lưu trữ và biến đổi thật trên CSDL."),
        ("Chuẩn hóa thời lượng (5 — 7 phút): ", "Thời gian video được thiết kế chuẩn xác ở mốc 6 phút 30 giây, không vượt quá 7 phút tránh bị trừ điểm vi phạm thời lượng, và không ngắn dưới 5 phút để bảo đảm show trọn vẹn 100% chức năng."),
        ("Phân chia vai trò đồng đều 3 thành viên: ", "Mỗi thành viên phụ trách trình bày và thực hiện thao tác demo gắn liền với phân hệ CSDL chuyên môn đã đăng ký trong đồ án.")
    ]
    for b_title, b_desc in rules:
        p_b = doc.add_paragraph()
        p_b.paragraph_format.left_indent = Cm(0.75)
        p_b.paragraph_format.space_after = Pt(2)
        r_bt = p_b.add_run("• " + b_title)
        r_bt.font.bold = True
        r_bt.font.color.rgb = COLOR_PRIMARY
        p_b.add_run(b_desc)

    # -------------------------------------------------------------
    # MỤC 2: BẢNG TIMELINE PHÂN CHIA RECORD TỪNG GIÂY
    # -------------------------------------------------------------
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(4)
    r_h2 = h2.add_run("2. BẢNG PHÂN CHIA RECORD & TIMELINE TỪNG PHÂN ĐOẠN")
    r_h2.font.size = Pt(14)
    r_h2.font.bold = True
    r_h2.font.color.rgb = COLOR_PRIMARY

    tbl_timeline = doc.add_table(rows=6, cols=4)
    tbl_timeline.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_timeline, color="1A365D", sz="6")

    headers_tl = ["Thời lượng", "Phân đoạn nội dung", "Người thực hiện", "Hệ CSDL & GUI Tool minh chứng"]
    for j, h in enumerate(headers_tl):
        cell = tbl_timeline.cell(0, j)
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, 160, 160, 160, 160)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.font.bold = True
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(255, 255, 255)

    data_tl = [
        ["0:00 – 1:05\n(65 giây)", "Phần 1: Giới thiệu đề tài, thành viên & Kiến trúc Polyglot 4 NoSQL", "Nguyễn Trọng Nguyên\n(Trưởng nhóm)", "Slide / Sơ đồ Kiến trúc Polyglot 4 NoSQL, Web Trang chủ"],
        ["1:05 – 2:50\n(105 giây)", "Phần 2A: Nghiệp vụ Học viên, Redis Cache, Thi trắc nghiệm, Anti-Cheat & Gamification XP", "Phạm Nguyễn Khôi Nguyên", "MongoDB Compass (users, courses, results)\nRedisInsight (cache, exam:answers, leaderboard:weekly)"],
        ["2:50 – 4:40\n(110 giây)", "Phần 2B: Lớp học trực tuyến Video, Cassandra Telemetry Heartbeat & Đồ thị Neo4j", "Võ Huỳnh Gia Huy", "TablePlus / cqlsh (learning_events)\nNeo4j Desktop / Browser (Knowledge Graph & Buddies)"],
        ["4:40 – 5:50\n(70 giây)", "Phần 3: Quản trị CMS Đề thi, Tường lửa Redis Sliding Window & Sao lưu phục hồi", "Nguyễn Trọng Nguyên\n(Trưởng nhóm)", "MongoDB Compass (questions)\nRedisInsight (security:ratelimit, blacklist)\nDashboard CMS Admin"],
        ["5:50 – 6:30\n(40 giây)", "Phần 4: Đánh giá hiệu năng p95, Khả năng chịu lỗi, Hạn chế & Lời cảm ơn", "Nguyễn Trọng Nguyên\n(Hoặc cả 3 cùng nói)", "Bảng tổng hợp Benchmark k6, Slide Lời cảm ơn Hội đồng"]
    ]

    widths_tl = [Cm(2.6), Cm(5.4), Cm(3.6), Cm(4.4)]
    for i, row in enumerate(data_tl):
        for j, val in enumerate(row):
            cell = tbl_timeline.cell(i + 1, j)
            set_cell_margins(cell, 120, 120, 140, 140)
            if i % 2 == 1:
                set_cell_background(cell, HEX_LIGHT_BG)
            p = cell.paragraphs[0]
            if j in (0, 2):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(val)
            run.font.size = Pt(10.5)
            if j == 0:
                run.font.bold = True

    for row in tbl_timeline.rows:
        for j, w in enumerate(widths_tl):
            row.cells[j].width = w

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # MỤC 3: KỊCH BẢN CHI TIẾT TỪNG PHÂN ĐOẠN (LỜI THOẠI & THAO TÁC)
    # -------------------------------------------------------------
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(4)
    r_h3 = h3.add_run("3. KỊCH BẢN CHI TIẾT LỜI THOẠI THUYẾT MINH & THAO TÁC MÀN HÌNH")
    r_h3.font.size = Pt(14)
    r_h3.font.bold = True
    r_h3.font.color.rgb = COLOR_PRIMARY

    def add_section_box(title, person, timer, intro_text):
        p_sec = doc.add_paragraph()
        p_sec.paragraph_format.space_before = Pt(10)
        p_sec.paragraph_format.space_after = Pt(3)
        r_s = p_sec.add_run(title)
        r_s.font.size = Pt(13)
        r_s.font.bold = True
        r_s.font.color.rgb = COLOR_PRIMARY

        p_meta = doc.add_paragraph()
        p_meta.paragraph_format.space_after = Pt(4)
        r_m1 = p_meta.add_run("Người thực hiện: ")
        r_m1.font.bold = True
        p_meta.add_run(person + "  |  ")
        r_m2 = p_meta.add_run("Thời lượng: ")
        r_m2.font.bold = True
        p_meta.add_run(timer)

        p_in = doc.add_paragraph()
        p_in.paragraph_format.first_line_indent = Cm(1.25)
        p_in.add_run(intro_text)

    def add_dialogue(text):
        p_d = doc.add_paragraph()
        p_d.paragraph_format.left_indent = Cm(1.0)
        p_d.paragraph_format.right_indent = Cm(0.5)
        p_d.paragraph_format.space_before = Pt(4)
        p_d.paragraph_format.space_after = Pt(6)
        r_lead = p_d.add_run("🎙️ Lời thoại thuyết minh: ")
        r_lead.font.bold = True
        r_lead.font.color.rgb = COLOR_SECONDARY
        r_t = p_d.add_run(f'"{text}"')
        r_t.font.italic = True
        r_t.font.color.rgb = COLOR_TEXT

    def add_steps_table(step_headers, step_rows, widths):
        tbl = doc.add_table(rows=len(step_rows) + 1, cols=len(step_headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="1A365D", sz="4")

        for j, h in enumerate(step_headers):
            cell = tbl.cell(0, j)
            set_cell_background(cell, HEX_PRIMARY)
            set_cell_margins(cell, 120, 120, 120, 120)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(h)
            run.font.bold = True
            run.font.size = Pt(10)
            run.font.color.rgb = RGBColor(255, 255, 255)

        for i, row in enumerate(step_rows):
            for j, val in enumerate(row):
                cell = tbl.cell(i + 1, j)
                set_cell_margins(cell, 100, 100, 120, 120)
                if i % 2 == 1:
                    set_cell_background(cell, HEX_LIGHT_BG)
                p = cell.paragraphs[0]
                if j == 0:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run(val)
                run.font.size = Pt(10)
                if j == 0:
                    run.font.bold = True

        for row in tbl.rows:
            for j, w in enumerate(widths):
                row.cells[j].width = w
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ------------------
    # PHẦN 1
    # ------------------
    add_section_box(
        "PHẦN 1: GIỚI THIỆU TỔNG QUAN & KIẾN TRÚC HỆ THỐNG",
        "Nguyễn Trọng Nguyên (Trưởng nhóm)",
        "0:00 – 1:05 (65 giây)",
        "Thiết lập bối cảnh đề tài, giới thiệu cơ cấu thành viên và trình bày sơ đồ kiến trúc Polyglot Persistence giải quyết các bài toán kỹ thuật mà RDBMS truyền thống gặp nút thắt cổ chai."
    )
    add_dialogue(
        "Kính chào Thầy Cô và các bạn! Em là Nguyễn Trọng Nguyên, đại diện Nhóm 18 môn Dữ liệu NoSQL lớp 14DH - Trường Đại học Công Thương TP.HCM (HUIT). "
        "Hôm nay nhóm em xin phép được báo cáo và demo sản phẩm đồ án với đề tài: 'Xây dựng Nền tảng E-Learning & Khảo sát Năng lực Tiếng Anh EduPro Academy trên nền tảng Đa Cơ sở dữ liệu Polyglot NoSQL'.\n\n"
        "Nhóm em gồm 3 thành viên: Em - Nguyễn Trọng Nguyên đảm nhiệm vai trò Lead Architect & Full-stack; bạn Phạm Nguyễn Khôi Nguyên phụ trách mô hình Document MongoDB và Key-Value Redis; bạn Võ Huỳnh Gia Huy phụ trách Big Data Telemetry trên Apache Cassandra và Graph Database trên Neo4j.\n\n"
        "EduPro Academy kết hợp sức mạnh chuyên biệt của 4 hệ CSDL NoSQL hàng đầu: "
        "MongoDB quản trị 12 khóa học, giáo trình nhúng và ngân hàng đề thi; "
        "Redis tăng tốc bộ nhớ đệm Cache-Aside, đếm ngược phiên thi thời gian thực TTL và đua top bảng vàng bằng Sorted Set; "
        "Apache Cassandra tiếp nhận hàng ngàn gói tin Heartbeat chuỗi thời gian phân tích đường cong giữ chân video; "
        "và Neo4j mô hình hóa bản đồ tri thức ngôn ngữ CEFR A1-C2 cùng thuật toán tìm Bạn Cùng Tiến.\n\n"
        "Sau đây, em xin nhường lại phần trình bày cho bạn Khôi Nguyên để demo phân hệ học viên, phòng thi trực tuyến và Gamification."
    )

    steps_p1 = [
        ["Bước 1 (0:00 - 0:25)", "Màn hình mở đầu", "Mở slide trang bìa hoặc Trang chủ Web EduPro [http://localhost:5050](http://localhost:5050), giới thiệu tên đề tài và 3 thành viên."],
        ["Bước 2 (0:25 - 1:05)", "Sơ đồ Polyglot NoSQL", "Chuyển sang sơ đồ kiến trúc 4 CSDL: Chỉ rõ luồng dữ liệu phân tán tương ứng giữa MongoDB, Redis, Cassandra và Neo4j."]
    ]
    add_steps_table(["Bước / Thời gian", "Màn hình hiển thị", "Nội dung thao tác cần biểu diễn"], steps_p1, [Cm(3.0), Cm(4.5), Cm(8.5)])

    # ------------------
    # PHẦN 2A
    # ------------------
    add_section_box(
        "PHẦN 2A: NGHIỆP VỤ HỌC VIÊN, REDIS CACHE, PHÒNG THI & GAMIFICATION XP",
        "Phạm Nguyễn Khôi Nguyên",
        "1:05 – 2:50 (105 giây)",
        "Minh chứng các luồng nghiệp vụ người học cốt lõi: Xác thực tài khoản, kiểm chứng tốc độ Cache-Aside, tạo mã VietQR động kích hoạt khóa học, phòng thi chống gian lận và đua top Bảng xếp hạng Redis ZSET."
    )
    add_dialogue(
        "Chào Thầy Cô! Em là Phạm Nguyễn Khôi Nguyên. Em bắt đầu với tài khoản học viên student_nguyen. "
        "Hệ thống xác thực qua MongoDB và cấp JWT Token an toàn. "
        "Tại Trang chủ, danh mục 12 khóa học được nạp tức thời nhờ chiến lược Cache-Aside trên Redis. "
        "Kiểm tra trên RedisInsight, key cache:courses:catalog đang hoạt động với TTL 30 phút, giảm độ trễ từ 38.5ms trên MongoDB xuống chỉ còn 3.2ms trên Redis.\n\n"
        "Khi đăng ký khóa học, hệ thống sinh mã VietQR động chuẩn Napas 24/7. "
        "Bấm 'Xác nhận đã thanh toán', khóa học được kích hoạt ngay và cộng 200 XP thưởng trên MongoDB Compass.\n\n"
        "Tại Phòng thi trực tuyến, từng đáp án chọn được lưu tức thời vào Redis Hash với độ trễ dưới 2ms phòng ngừa rủi ro mất mạng. "
        "Hệ thống Anti-Cheat tự động phát hiện khi thí sinh chuyển tab trình duyệt và cảnh báo 1/3. "
        "Nộp bài thi, điểm số 8.8/10 được tính tự động, lưu vào MongoDB và đẩy lên đỉnh Bảng xếp hạng tuần Redis Sorted Set. "
        "Học viên dùng điểm đổi vật phẩm Streak Freeze trong Shop XP, trường xp được trừ nguyên tử, triệt tiêu lỗi Race Condition."
    )

    steps_p2 = [
        ["Bước 1 (1:05 - 1:30)", "Web: Đăng nhập học viên & duyệt khóa học", "RedisInsight: Key `cache:courses:catalog` (TTL 1800s), chứng minh Cache Hit < 3.5ms."],
        ["Bước 2 (1:30 - 1:55)", "Web: Đăng ký khóa học, quét mã VietQR động", "Compass: Collection `users` tăng `+200 XP` và mảng `enrolledCourses` kích hoạt."],
        ["Bước 3 (1:55 - 2:20)", "Web: Vào Phòng thi, chọn câu 1-B, 2-A, 3-C", "RedisInsight: Hash `exam:answers:2001230589` hiển thị các field đáp án thời gian thực."],
        ["Bước 4 (2:20 - 2:35)", "Web: Alt+Tab sang ứng dụng khác", "Web bật cảnh báo đỏ Anti-Cheat (1/3 vi phạm quy chế thi)."],
        ["Bước 5 (2:35 - 2:50)", "Web: Nộp bài (8.8đ) & Đổi quà Streak Freeze", "RedisInsight: ZSET `leaderboard:weekly` xếp hạng 8.8đ lên Top; Compass: `results` lưu bản ghi."]
    ]
    add_steps_table(["Bước / Thời gian", "Thao tác trên Web Client", "Minh chứng đối chiếu GUI Tool CSDL"], steps_p2, [Cm(3.0), Cm(6.5), Cm(6.5)])

    # ------------------
    # PHẦN 2B
    # ------------------
    add_section_box(
        "PHẦN 2B: LỚP HỌC VIDEO, CASSANDRA TELEMETRY & ĐỒ THỊ NEO4J",
        "Võ Huỳnh Gia Huy",
        "2:50 – 4:40 (110 giây)",
        "Trình diễn kiến trúc dữ liệu lớn Big Data chuỗi thời gian trên Apache Cassandra qua luồng Heartbeat video và mô hình đồ thị thuộc tính (Labeled Property Graph) trên Neo4j."
    )
    add_dialogue(
        "Em là Võ Huỳnh Gia Huy, xin phép trình bày phân hệ xử lý dữ liệu lớn với Apache Cassandra và CSDL đồ thị Neo4j. "
        "Trong phòng học trực tuyến, mỗi khi học viên phát video, trình duyệt tự động gửi các gói tin Heartbeat chuỗi thời gian. "
        "Apache Cassandra với kiến trúc phân tán Masterless và cấu trúc LSM-Tree được chọn để xử lý luồng ghi khổng lồ này.\n\n"
        "Như Thầy Cô thấy trên TablePlus, bảng learning_events được thiết kế tối ưu với Partition Key là student_id và Clustering Key là event_time DESC. "
        "Dữ liệu được ghi thẳng vào CommitLog và Memtable với tốc độ trên 2.480 lượt ghi/giây. "
        "Từ nguồn dữ liệu này, hệ thống vẽ biểu đồ Retention Curve giúp giảng viên nắm bắt được đoạn nào bài giảng hấp dẫn hoặc gây khó hiểu cho người học.\n\n"
        "Tiếp theo là Bản đồ tri thức Neo4j: Toàn bộ lộ trình học từ CEFR A1 đến C2 được mô hình hóa dưới dạng Đồ thị thuộc tính. "
        "Khi học viên chọn một bài học, câu lệnh Cypher duyệt quan hệ [:PREREQUISITE_OF*] chỉ mất 5.8ms để trả về chuỗi bài học tiên quyết. "
        "Đặc biệt, tính năng Bạn Cùng Tiến (Study Buddies) sử dụng giải thuật đồ thị Co-enrollment Matching trên Neo4j để tìm kiếm những bạn học có chung mục tiêu Band điểm và cùng đăng ký khóa học tương tự. "
        "Ngoài ra, trợ lý EduPro Smart AI Copilot góc dưới phải cho phép học viên tra cứu tự động từ cả 4 nguồn CSDL."
    )

    steps_p3 = [
        ["Bước 1 (2:50 - 3:25)", "Web: Vào phòng học, phát video, tua tiến độ", "TablePlus: Query `SELECT * FROM learning_events WHERE student_id='2001230589'` thấy log theo giây."],
        ["Bước 2 (3:25 - 3:45)", "Web: Xem biểu đồ Analytics Retention Curve", "Biểu đồ đường cong giữ chân video xuất trực quan từ Cassandra."],
        ["Bước 3 (3:45 - 4:15)", "Web: Mở Bản đồ tri thức CEFR (A1 -> C2)", "Neo4j Browser: Chạy Cypher `MATCH (c:Course)-[:CONTAINS]->(l:Lesson) RETURN c, l`."],
        ["Bước 4 (4:15 - 4:40)", "Web: Xem Bạn Cùng Tiến & Hỏi AI Copilot", "Neo4j Browser: Chạy Cypher Co-enrollment Match gợi ý bạn học cùng Band 7.5+."]
    ]
    add_steps_table(["Bước / Thời gian", "Thao tác trên Web Client", "Minh chứng đối chiếu GUI Tool CSDL"], steps_p3, [Cm(3.0), Cm(6.5), Cm(6.5)])

    # ------------------
    # PHẦN 3
    # ------------------
    add_section_box(
        "PHẦN 3: QUẢN TRỊ CMS, TƯỜNG LỬA BẢO MẬT REDIS & SAO LƯU PHỤC HỒI",
        "Nguyễn Trọng Nguyên (Trưởng nhóm)",
        "4:40 – 5:50 (70 giây)",
        "Minh chứng phân quyền quản trị cấp cao, công cụ CMS kiểm duyệt nội dung, cơ chế tường lửa bảo vệ hệ thống trước tấn công DoS và khả năng khôi phục dữ liệu thảm họa."
    )
    add_dialogue(
        "Em xin tiếp tục với phân hệ Quản trị viên và Giảng viên. Khi đăng nhập với tài khoản admin, hệ thống kiểm tra phân quyền RBAC và mở khóa bảng điều khiển CMS. "
        "Giảng viên có thể chỉnh sửa ngân hàng câu hỏi đề thi trực tiếp trên giao diện. "
        "Khi lưu, MongoDB cập nhật document câu hỏi và backend tự động xóa khóa cache liên quan trên Redis, đảm bảo học viên luôn nhận được nội dung mới nhất.\n\n"
        "Để bảo vệ nền tảng trước các cuộc tấn công Brute-force hoặc DDoS, backend tích hợp Tường lửa Redis Sliding Window với ngưỡng 120 request/phút. "
        "Mỗi request được ghi nhận timestamp dạng score vào Sorted Set. Khi phát hiện IP gửi quá tần suất cho phép, Redis tự động từ chối bằng mã lỗi HTTP 429 và đưa IP vào danh sách đen.\n\n"
        "Về sao lưu và phục hồi: Hệ thống xây dựng module sao lưu hợp nhất mongodump, redis RDB, cqlsh snapshot và neo4j dump. "
        "Kịch bản thực nghiệm chứng minh khi gặp sự cố, toàn bộ 1.000 bản ghi được phục hồi nguyên vẹn 100% trong vòng dưới 4.5 giây."
    )

    steps_p4 = [
        ["Bước 1 (4:40 - 5:10)", "Web: Đăng nhập Admin, sửa câu hỏi đề thi CMS", "Compass: Collection `questions` cập nhật tức thời nội dung và đáp án mới."],
        ["Bước 2 (5:10 - 5:35)", "Web: Bấm kiểm tra Tường lửa Redis (120 RPM)", "RedisInsight: Key `security:ratelimit:...` và danh sách đen IP `security:blacklist:ips`."],
        ["Bước 3 (5:35 - 5:50)", "Web: Xem Telemetry 4 CSDL & Tạo bản sao lưu", "Xuất file gói backup hợp nhất 4 CSDL NoSQL an toàn."]
    ]
    add_steps_table(["Bước / Thời gian", "Thao tác trên Web Client", "Minh chứng đối chiếu GUI Tool CSDL"], steps_p4, [Cm(3.0), Cm(6.5), Cm(6.5)])

    # ------------------
    # PHẦN 4
    # ------------------
    add_section_box(
        "PHẦN 4: ĐÁNH GIÁ HIỆU NĂNG p95, KHẢ NĂNG CHỊU LỖI, HẠN CHẾ & LỜI KẾT",
        "Nguyễn Trọng Nguyên (Hoặc cả 3 thành viên)",
        "5:50 – 6:30 (40 giây)",
        "Tổng kết các chỉ số đo lường NFR vượt trội so với mục tiêu ban đầu, cơ chế In-Memory Fallback chịu lỗi và định hướng mở rộng hệ thống trong tương lai."
    )
    add_dialogue(
        "Kính thưa Thầy Cô, qua quá trình đo kiểm tải với k6 và autocannon, hệ thống EduPro Academy đã chứng minh tính ưu việt vượt trội của kiến trúc Polyglot NoSQL: "
        "Độ trễ đọc danh mục với Redis Cache đạt p95 chỉ 3.8 mili-giây, vượt xa mục tiêu NFR đề ra; "
        "Thông lượng ghi nhật ký trên Cassandra đạt trên 2.480 request/giây; "
        "Hệ thống tích hợp cơ chế In-Memory Fallback tự động, giúp toàn bộ ứng dụng vẫn vận hành liên tục ngay cả khi một node CSDL gặp sự cố tạm thời.\n\n"
        "Về mặt hạn chế: Hiện tại hệ thống chưa tích hợp công cụ tìm kiếm toàn văn và Vector Database. Trong phiên bản tiếp theo, nhóm dự kiến sẽ tích hợp Elasticsearch cho Full-text search và Milvus để nâng cấp trợ lý AI Copilot với công nghệ RAG.\n\n"
        "Nhóm 18 xin trân trọng cảm ơn Thầy Cô Bộ môn Công nghệ Phần mềm & CSDL Khoa CNTT - HUIT đã tận tình hướng dẫn nhóm trong suốt học kỳ vừa qua. Nhóm em rất mong nhận được những góp ý quý báu của Thầy Cô để hoàn thiện đề tài hơn nữa. Em xin chân thành cảm ơn!"
    )

    steps_p5 = [
        ["Bước 1 (5:50 - 6:15)", "Slide Bảng tổng hợp Benchmark k6 (Bảng 7.2)", "Trình chiếu các chỉ số p95 < 10ms, thông lượng ghi Cassandra 2.480 ops/s, chịu lỗi Fallback."],
        ["Bước 2 (6:15 - 6:30)", "Slide Lời cảm ơn Hội đồng Giám khảo", "3 thành viên cùng xuất hiện gửi lời cảm ơn và kết thúc video demo."]
    ]
    add_steps_table(["Bước / Thời gian", "Màn hình hiển thị", "Nội dung tổng kết"], steps_p5, [Cm(3.0), Cm(5.0), Cm(8.0)])

    # -------------------------------------------------------------
    # MỤC 4: HƯỚNG DẪN KỸ THUẬT QUAY & HẬU KỲ (CHECKLIST)
    # -------------------------------------------------------------
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(4)
    r_h4 = h4.add_run("4. HƯỚNG DẪN KỸ THUẬT QUAY VÀ HẬU KỲ VIDEO")
    r_h4.font.size = Pt(14)
    r_h4.font.bold = True
    r_h4.font.color.rgb = COLOR_PRIMARY

    tips = [
        ("Phần mềm quay màn hình: ", "Sử dụng OBS Studio (khuyến nghị) hoặc Bandicam / Windows Game Bar (phím tắt Win + G). Đặt độ phân giải màn hình 1920x1080 (Full HD), tỷ lệ 16:9, tốc độ 30fps hoặc 60fps."),
        ("Âm thanh lồng tiếng: ", "Sử dụng tai nghe có mic chống ồn, nói to rõ ràng, ngữ điệu tự tin, đọc sát lời thoại mẫu đã soạn sẵn."),
        ("Bố cục cửa sổ màn hình: ", "Nên chia màn hình theo tỷ lệ 60/40: 60% bên trái là trình duyệt Web, 40% bên phải là GUI Tool CSDL để người xem thấy rõ hiệu ứng thay đổi dữ liệu tức thì."),
        ("Khởi động nhanh hạ tầng: ", "Chạy Chay_He_Thong.bat để bật máy chủ Node.js cổng 5050; Chạy Mo_4_Phan_Mem_CSDL.bat chọn phím A để mở tự động cả 4 phần mềm Compass, RedisInsight, TablePlus và Neo4j."),
        ("Hậu kỳ và Nộp bài: ", "Ghép 3 đoạn video của 3 bạn thành 1 video duy nhất bằng CapCut hoặc Premiere, thêm nhạc nền nhẹ nhàng âm lượng 5-8%, xuất file MP4 nén H.264 và tải lên Google Drive / YouTube (chế độ Không công khai), dán đường link vào tệp 07_Video_Demo/LINK_VIDEO_DEMO.txt.")
    ]

    for t_title, t_desc in tips:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.left_indent = Cm(0.75)
        p_t.paragraph_format.space_after = Pt(2)
        r_tt = p_t.add_run("✔ " + t_title)
        r_tt.font.bold = True
        r_tt.font.color.rgb = COLOR_PRIMARY
        p_t.add_run(t_desc)

    return doc

if __name__ == '__main__':
    doc = create_document()
    for p in OUTPUT_PATHS:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        try:
            doc.save(p)
            print(f"✅ Đã tạo tệp Word kịch bản demo tại: {p}")
        except PermissionError:
            alt = p.replace('.docx', '_MOI.docx')
            doc.save(alt)
            print(f"⚠️ Tệp đang mở, đã lưu tại: {alt}")
