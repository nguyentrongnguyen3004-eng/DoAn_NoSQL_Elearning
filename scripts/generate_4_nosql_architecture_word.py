# -*- coding: utf-8 -*-
"""
Script generate_4_nosql_architecture_word.py
Xuất tệp Word (.docx) ĐẶC TẢ KIẾN TRÚC & PHÂN ĐỊNH NGHIỆP VỤ 4 CƠ SỞ DỮ LIỆU NOSQL (POLYGLOT PERSISTENCE)
Tuân thủ chuẩn thể thức trình bày: Font Times New Roman, Bảng biểu chuyên nghiệp, màu sắc chuẩn học thuật.
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
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\TÀI LIỆU FINAL\PHAN_DINH_NGHIEP_VU_4_CSDL_NOSQL_EDUPRO.docx',
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\PHAN_DINH_NGHIEP_VU_4_CSDL_NOSQL_EDUPRO.docx',
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\PHAN_DINH_NGHIEP_VU_4_CSDL_NOSQL_EDUPRO.docx'
]

# Bảng màu chuẩn học thuật (Navy & Slate)
COLOR_PRIMARY = RGBColor(26, 54, 93)     # Navy đậm (#1A365D)
COLOR_SECONDARY = RGBColor(37, 99, 235)  # Xanh dương (#2563EB)
COLOR_TEXT = RGBColor(15, 23, 42)        # Đen xám (#0F172A)
COLOR_MUTED = RGBColor(71, 85, 105)      # Xám trung tính (#475569)
COLOR_SUCCESS = RGBColor(5, 150, 105)    # Xanh lá (#059669)
COLOR_WARNING = RGBColor(217, 119, 6)    # Cam hổ phách (#D97706)

HEX_PRIMARY = "1A365D"
HEX_LIGHT_BG = "F8FAFC"
HEX_BORDER = "CBD5E1"
HEX_ACCENT = "EFF6FF"
HEX_HIGHLIGHT = "FEF3C7"
HEX_CODE_BG = "F1F5F9"

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

def set_repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    tblHeader = OxmlElement('w:tblHeader')
    trPr.append(tblHeader)

def set_cant_split(row):
    trPr = row._tr.get_or_add_trPr()
    cantSplit = OxmlElement('w:cantSplit')
    trPr.append(cantSplit)

def add_header_footer(doc):
    for s in doc.sections:
        # Header
        hdr = s.header
        hp = hdr.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("EDUPRO ACADEMY — ĐẶC TẢ KIẾN TRÚC PHÂN ĐỊNH 4 CƠ SỞ DỮ LIỆU NOSQL")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(8.5)
        hrun.font.italic = True
        hrun.font.color.rgb = COLOR_MUTED

        # Footer
        ftr = s.footer
        fp = ftr.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun1 = fp.add_run("Khoa CNTT - HUIT | Nhóm 18 | Trang ")
        frun1.font.name = "Times New Roman"
        frun1.font.size = Pt(9)
        frun1.font.color.rgb = COLOR_MUTED
        
        # XML page number
        fld1 = OxmlElement('w:fldSimple')
        fld1.set(qn('w:instr'), 'PAGE')
        fp._p.append(fld1)
        
        frun2 = fp.add_run(" / ")
        frun2.font.name = "Times New Roman"
        frun2.font.size = Pt(9)
        frun2.font.color.rgb = COLOR_MUTED
        
        fld2 = OxmlElement('w:fldSimple')
        fld2.set(qn('w:instr'), 'NUMPAGES')
        fp._p.append(fld2)

def build_document():
    doc = docx.Document()
    
    # Thiết lập lề chuẩn A4
    for section in doc.sections:
        section.top_margin = Cm(2.2)
        section.bottom_margin = Cm(2.2)
        section.left_margin = Cm(2.8)
        section.right_margin = Cm(2.2)
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        
    add_header_footer(doc)
    
    # -------------------------------------------------------------
    # TRANG TIÊU ĐỀ ĐẦU TÀI LIỆU (TITLE BANNER)
    # -------------------------------------------------------------
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_meta1 = p_meta.add_run("TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH (HUIT)\n")
    r_meta1.font.name = "Times New Roman"
    r_meta1.font.size = Pt(11)
    r_meta1.font.bold = True
    r_meta1.font.color.rgb = COLOR_PRIMARY
    
    r_meta2 = p_meta.add_run("KHOA CÔNG NGHỆ THÔNG TIN — BỘ MÔN CÔNG NGHỆ PHẦN MỀM & CSDL\n")
    r_meta2.font.name = "Times New Roman"
    r_meta2.font.size = Pt(10)
    r_meta2.font.color.rgb = COLOR_MUTED
    
    r_meta3 = p_meta.add_run("HỌC PHẦN: CƠ SỞ DỮ LIỆU NOSQL (HỌC KỲ 7 - KHÓA 14DH)")
    r_meta3.font.name = "Times New Roman"
    r_meta3.font.size = Pt(10.5)
    r_meta3.font.bold = True
    r_meta3.font.color.rgb = COLOR_SECONDARY
    p_meta.paragraph_format.space_after = Pt(14)
    
    # Khung Tiêu Đề Chính
    tbl_title = doc.add_table(rows=1, cols=1)
    tbl_title.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_title = tbl_title.cell(0, 0)
    c_title.width = Cm(16.0)
    set_cell_background(c_title, HEX_PRIMARY)
    set_cell_margins(c_title, top=200, bottom=200, left=240, right=240)
    
    p_main_title = c_title.paragraphs[0]
    p_main_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_main_title.add_run("TÀI LIỆU ĐẶC TẢ KIẾN TRÚC & PHÂN ĐỊNH NGHIỆP VỤ\n4 HỆ CƠ SỞ DỮ LIỆU NOSQL (POLYGLOT PERSISTENCE)")
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(15)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(255, 255, 255)
    
    p_sub_title = c_title.add_paragraph()
    p_sub_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub_title.add_run("Đề tài: Nền tảng E-Learning & Khảo sát Năng lực Tiếng Anh EduPro Academy\nỨng dụng kết hợp chuyên sâu: MongoDB, Redis, Apache Cassandra và Neo4j")
    r_sub.font.name = "Times New Roman"
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(224, 231, 255)
    
    # Thông tin nhóm thực hiện
    p_info = doc.add_paragraph()
    p_info.paragraph_format.space_before = Pt(14)
    p_info.paragraph_format.space_after = Pt(14)
    r_info = p_info.add_run(
        "• Giảng viên hướng dẫn: Giảng viên Bộ môn Hệ thống Thông tin\n"
        "• Đơn vị đào tạo: Khoa Công nghệ Thông tin - Trường ĐH Công Thương TP.HCM (HUIT)\n"
        "• Nhóm sinh viên thực hiện: Nhóm 18 (Lớp 14DHTH)\n"
        "   1. Nguyễn Trọng Nguyên (MSSV: 2001230589) — Trưởng nhóm / Kiến trúc sư trưởng (Lead Architect)\n"
        "   2. Phạm Nguyễn Khôi Nguyên (MSSV: 2001230578) — Thành viên / Phụ trách MongoDB & Redis\n"
        "   3. Võ Huỳnh Gia Huy (MSSV: 2001230303) — Thành viên / Phụ trách Cassandra & Neo4j\n"
        "• Phiên bản tài liệu: 2.4 (Chính thức nghiệm thu cuối kỳ - Tháng 10/2026)"
    )
    r_info.font.name = "Times New Roman"
    r_info.font.size = Pt(10.5)
    r_info.font.color.rgb = COLOR_TEXT
    
    # Helper functions cho nội dung
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(13.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.color.rgb = COLOR_SECONDARY
        return p

    def add_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.name = "Times New Roman"
            rb.font.size = Pt(11)
            rb.font.bold = True
            rb.font.color.rgb = COLOR_TEXT
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)
        r.font.color.rgb = COLOR_TEXT
        return p

    def add_bullet(text, level=1):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.left_indent = Cm(0.6 * level)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_mark = p.add_run("▪ " if level == 1 else "▫ ")
        r_mark.font.name = "Times New Roman"
        r_mark.font.size = Pt(10.5)
        r_mark.font.bold = True
        r_mark.font.color.rgb = COLOR_SECONDARY
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(10.5)
        r.font.color.rgb = COLOR_TEXT
        return p

    def add_callout(text, title="LƯU Ý QUAN TRỌNG KHI BẢO VỆ:", hex_bg=HEX_ACCENT, border_color=COLOR_SECONDARY):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Cm(16.0)
        set_cell_background(cell, hex_bg)
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        
        # Left border highlight
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:top w:val="none"/>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{HEX_PRIMARY}"/>'
            f'<w:bottom w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(tcBorders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        rt = p.add_run(f"📌 {title}\n")
        rt.font.name = "Times New Roman"
        rt.font.size = Pt(10.5)
        rt.font.bold = True
        rt.font.color.rgb = border_color
        
        rc = p.add_run(text)
        rc.font.name = "Times New Roman"
        rc.font.size = Pt(10.5)
        rc.font.color.rgb = COLOR_TEXT
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # PHẦN 1: TỔNG QUAN KIẾN TRÚC POLYGLOT VÀ ĐỊNH VỊ CAP
    # -------------------------------------------------------------
    add_h1("1. TỔNG QUAN KIẾN TRÚC POLYGLOT PERSISTENCE VÀ ĐỊNH LÝ CAP")
    
    add_p(
        "Trong các hệ thống E-Learning và Khảo sát năng lực quy mô lớn, một cơ sở dữ liệu quan hệ (RDBMS) truyền thống "
        "thường gặp phải hiện tượng 'nút thắt cổ chai' (bottleneck) khi phải gánh vác đồng thời nhiều tác vụ đối nghịch: "
        "vừa phải lưu trữ dữ liệu phân cấp phức tạp (khóa học, bài học, câu hỏi), vừa phải tiếp nhận hàng nghìn luồng ghi "
        "nhật ký xem video mỗi giây, vừa phải đảm bảo tốc độ phản hồi tính bằng mili-giây cho phòng thi trực tuyến, "
        "lại vừa phải duyệt cây kỹ năng và mạng lưới bạn học nhiều tầng. "
        "Để giải quyết triệt để bài toán này, nền tảng EduPro Academy áp dụng mô hình Polyglot Persistence, "
        "tận dụng chính xác thế mạnh tự nhiên của 4 hệ CSDL NoSQL hàng đầu:"
    )
    
    # Bảng 1: Bảng Ma Trận Tổng Quan 4 CSDL
    p_tbl1_title = doc.add_paragraph()
    p_tbl1_title.paragraph_format.space_before = Pt(8)
    p_tbl1_title.paragraph_format.space_after = Pt(3)
    r_t1 = p_tbl1_title.add_run("Bảng 1.1: Ma trận phân định kiến trúc 4 Cơ sở dữ liệu NoSQL trong EduPro Academy")
    r_t1.font.name = "Times New Roman"
    r_t1.font.size = Pt(10.5)
    r_t1.font.bold = True
    r_t1.font.color.rgb = COLOR_PRIMARY
    
    tbl_overview = doc.add_table(rows=5, cols=5)
    tbl_overview.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_overview)
    set_repeat_header(tbl_overview.rows[0])
    
    headers = ["Hệ CSDL", "Mô hình lưu trữ", "Vị trí CAP / PACELC", "Cổng kết nối", "Nghiệp vụ cốt lõi đảm nhiệm"]
    col_widths = [Cm(2.6), Cm(2.8), Cm(2.8), Cm(1.8), Cm(6.0)]
    
    for i, h in enumerate(headers):
        cell = tbl_overview.cell(0, i)
        cell.width = col_widths[i]
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "Times New Roman"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    data_overview = [
        [
            "MongoDB\n(v7.0)",
            "Document Store\n(JSON / BSON)",
            "Hệ CP\n(PACELC: PC/EC)\nƯu tiên nhất quán mạnh",
            "27017\n(Native Mongo)",
            "Quản lý thực thể lõi có cấu trúc phân cấp: Tài khoản người dùng, phân quyền RBAC, danh mục khóa học & giáo trình lồng nhau, ngân hàng câu hỏi, đề thi trắc nghiệm, bài luận Writing AI chấm điểm, kết quả thi vĩnh viễn và giao dịch VietQR."
        ],
        [
            "Redis\n(v7.2)",
            "In-Memory Data Structures (Key-Value)",
            "Hệ AP\n(PACELC: PA/EL)\nĐộ trễ cực thấp (<1ms)",
            "6379\n(TCP Socket)",
            "Bộ nhớ đệm danh mục (Cache-Aside), phiên thi đếm ngược TTL tự hủy, bộ đệm lưu đáp án thi thời gian thực (Hash), bảng xếp hạng tuần (ZSET), tường lửa chống DoS Sliding Window (120 RPM), thông báo tức thời (Pub/Sub & SSE) và mã OTP."
        ],
        [
            "Apache Cassandra\n(v4.1)",
            "Wide-Column Store (Time-Series)",
            "Hệ AP (Tunable)\n(PA/EL ghi, PC/EC Quorum)\nThông lượng ghi lớn",
            "9042\n(CQL Native)",
            "Tiếp nhận luồng ghi khổng lồ (Write-Intensive): Nhật ký xem video từng giây (Heartbeat Telemetry), phân tích đường cong giữ chân người xem video (Video Retention Analytics), nhật ký vi phạm phòng thi trực tuyến (Anti-Cheat 3/3)."
        ],
        [
            "Neo4j\n(v5.20)",
            "Property Graph Database (LPG)",
            "Hệ CP\n(PACELC: PC/EC)\nToàn vẹn cấu trúc nốt/cạnh",
            "7474 (HTTP)\n7687 (Bolt)",
            "Mạng lưới liên kết nhiều chiều: Bản đồ tri thức chuẩn CEFR A1➔C2, gợi ý chuỗi bài học tiên quyết thích ứng (Adaptive Learning Path), thuật toán tìm kiếm Bạn Cùng Tiến (Study Buddies Match %) và hỗ trợ trợ lý Smart AI Copilot."
        ]
    ]
    
    for row_idx, row_data in enumerate(data_overview, start=1):
        row = tbl_overview.rows[row_idx]
        set_cant_split(row)
        bg = HEX_LIGHT_BG if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(row_data):
            cell = row.cells[col_idx]
            cell.width = col_widths[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=130, right=130)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            if col_idx in [0, 1, 2, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            r = p.add_run(text)
            r.font.name = "Times New Roman"
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_PRIMARY
            else:
                r.font.color.rgb = COLOR_TEXT

    # -------------------------------------------------------------
    # PHẦN 2: CHI TIẾT TỪNG CƠ SỞ DỮ LIỆU
    # -------------------------------------------------------------
    add_h1("2. ĐẶC TẢ CHI TIẾT VÀ PHÂN ĐỊNH NGHIỆP VỤ TỪNG CƠ SỞ DỮ LIỆU")
    
    # 2.1 MONGODB
    add_h2("2.1. MongoDB (Document Store) — Quản lý Thực thể Lõi và Dữ liệu Cấu trúc Phức hợp")
    add_p(
        "MongoDB là CSDL Document mã nguồn mở hàng đầu, lưu trữ dữ liệu dưới định dạng BSON (Binary JSON). "
        "Trong EduPro Academy, MongoDB đóng vai trò là Nguồn Sự Thật (Single Source of Truth - SoT) cho toàn bộ "
        "thực thể quản trị và nghiệp vụ tĩnh/bán tĩnh của nền tảng.",
        bold_prefix="Bản chất và vai trò: "
    )
    add_bullet("Quản lý Người dùng & Hồ sơ Học tập (Collection users): Lưu trữ thông tin tài khoản, mật khẩu băm bcrypt, phân quyền vai trò (STUDENT, TEACHER, ADMIN), điểm thưởng Gamification (XP), chuỗi học tập (Streak) và danh sách các khóa học đã ghi danh (enrolledCourses).")
    add_bullet("Quản lý Danh mục Khóa học & Giáo trình (Collection courses): Lưu trữ thông tin khóa học (IELTS, TOEIC, Giao tiếp), học phí, đánh giá sao trung bình. Áp dụng Subset Pattern để NHÚNG (Embed) trực tiếp danh sách bài học (lessons) vào trong tài liệu khóa học. Do một khóa học thường chỉ có từ 10 đến 30 bài học, việc nhúng loại bỏ hoàn toàn các câu lệnh JOIN phức tạp, giúp nạp toàn bộ giáo trình chỉ trong 1 thao tác đọc.")
    add_bullet("Ngân hàng Câu hỏi & Đề thi Trắc nghiệm (Collection questions & exams): Đề thi trắc nghiệm áp dụng kỹ thuật THAM CHIẾU (Referencing), chỉ lưu danh sách ID câu hỏi (questionIds). Nhờ đó, ngân hàng câu hỏi có thể được tái sử dụng qua nhiều đề thi thử khác nhau và Giảng viên có thể cập nhật nội dung câu hỏi độc lập.")
    add_bullet("Lưu trữ Kết quả Đánh giá Vĩnh viễn (Collection results): Lưu bài làm đã nộp của thí sinh, chi tiết từng câu đúng/sai, điểm số quy đổi, chứng chỉ năng lực và toàn văn bài luận Writing được AI chấm điểm theo 4 tiêu chí IELTS.")
    add_bullet("Xử lý Đơn hàng & Thanh toán VietQR Động: Xử lý giao dịch nạp tiền, kích hoạt khóa học và cộng điểm thưởng XP tức thời bằng các toán tử cập nhật nguyên tử ($inc, $push) bảo đảm tính toàn vẹn tài chính.")
    
    add_p(
        "Theo định lý CAP, MongoDB được cấu hình hoạt động ở chế độ CP (Consistency & Partition Tolerance). "
        "Với dữ liệu tài khoản và kết quả thi cử, hệ thống bắt buộc phải ưu tiên Tính Nhất Quán Mạnh (Strong Consistency): "
        "học viên không thể nhìn thấy kết quả thi sai lệch hay số dư XP bị mâu thuẫn giữa các phiên truy cập.",
        bold_prefix="Định vị CAP & Lý do kỹ thuật: "
    )

    # 2.2 REDIS
    add_h2("2.2. Redis (In-Memory Key-Value) — Bộ nhớ đệm, Phiên thi & Xếp hạng Thời gian thực")
    add_p(
        "Redis là hệ quản trị cơ sở dữ liệu In-Memory với toàn bộ dữ liệu nằm trên bộ nhớ RAM, mang lại tốc độ truy xuất "
        "cực cao với độ trễ chỉ dưới 1 mili-giây. Trong hệ thống EduPro, Redis phụ trách các tác vụ thời gian thực cao độ:",
        bold_prefix="Bản chất và vai trò: "
    )
    add_bullet("Bộ nhớ đệm danh mục (Cache-Aside Pattern): Khóa cache:courses:all lưu chuỗi JSON danh mục 12 khóa học có thời gian sống (TTL) 3600 giây. Khi có người truy cập, hệ thống đọc trực tiếp từ Redis trong ~3.2ms (thay vì 38ms trên MongoDB). Khi Giảng viên sửa khóa học qua CMS, khóa cache này lập tức bị xóa (Cache Invalidation) để làm mới dữ liệu.")
    add_bullet("Phòng thi trực tuyến & Đồng hồ đếm ngược (Session TTL): Khi học viên bắt đầu bài thi, khóa exam:session:{studentId} được kích hoạt với TTL chính xác bằng thời lượng làm bài (ví dụ 1800 giây). Redis tự động đếm ngược và giải phóng session khi hết giờ, ngăn chặn việc nộp bài quá hạn.")
    add_bullet("Bộ đệm lưu đáp án thi thời gian thực (Real-time Answer Buffer): Sử dụng cấu trúc Redis Hash tại khóa exam:answers:{studentId}. Mỗi khi học viên click chọn đáp án (A, B, C, D), lệnh HSET được thực thi trong < 2ms để lưu ngay vào RAM. Nếu học viên lỡ tay F5 trình duyệt, mất điện hoặc chập chờn mạng, toàn bộ đáp án đã làm được phục hồi nguyên vẹn từ Redis Hash mà không bị mất.")
    add_bullet("Bảng xếp hạng tuần & Đua top Gamification: Sử dụng cấu trúc Sorted Set (ZSET) tại khóa leaderboard:weekly. Khi học viên nộp bài thi, lệnh ZADD hoặc ZINCRBY cập nhật điểm số. Redis tự động sắp xếp thứ tự từ cao xuống thấp với độ phức tạp O(log N). API lấy bảng xếp hạng thông qua lệnh ZREVRANGEBYSCORE phản hồi gần như tức thì mà không cần quét đĩa.")
    add_bullet("Tường lửa an ninh Sliding Window (Rate Limiting): Dùng ZSET tại khóa security:ratelimit:{ip} ghi nhận timestamp từng request. Khi một địa chỉ IP gửi vượt quá 120 request/phút, Redis tự động chặn và đưa IP vào khóa security:blacklist.")
    add_bullet("Thông báo thời gian thực & Xác thực ngắn hạn: Quản lý mã OTP đăng ký (TTL 300s), danh sách đen thu hồi JWT Token khi đăng xuất (blacklist:token:{jwtHash}) và phát sóng thông báo khẩn cấp tới chuông thông báo người dùng thông qua Redis Pub/Sub kết hợp Server-Sent Events (SSE).")

    # Bảng 2: Thiết kế Key Pattern Redis
    p_tbl2_title = doc.add_paragraph()
    p_tbl2_title.paragraph_format.space_before = Pt(6)
    p_tbl2_title.paragraph_format.space_after = Pt(2)
    r_t2 = p_tbl2_title.add_run("Bảng 1.2: Bảng quy ước định danh và cấu trúc dữ liệu Redis trong EduPro Academy")
    r_t2.font.name = "Times New Roman"
    r_t2.font.size = Pt(10.5)
    r_t2.font.bold = True
    r_t2.font.color.rgb = COLOR_PRIMARY

    tbl_redis = doc.add_table(rows=7, cols=5)
    tbl_redis.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_redis)
    set_repeat_header(tbl_redis.rows[0])
    
    headers_redis = ["Key Pattern", "Kiểu dữ liệu", "Thời gian sống (TTL)", "Mục đích nghiệp vụ", "Lệnh Redis cốt lõi"]
    col_w_redis = [Cm(3.8), Cm(2.2), Cm(2.4), Cm(4.8), Cm(2.8)]
    
    for i, h in enumerate(headers_redis):
        cell = tbl_redis.cell(0, i)
        cell.width = col_w_redis[i]
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "Times New Roman"
        r.font.size = Pt(9.0)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    data_redis = [
        ["cache:courses:all", "String (JSON)", "3600s (1 giờ)", "Cache toàn bộ danh mục khóa học", "GET, SETEX, DEL"],
        ["exam:session:{studentId}", "String (JSON)", "Theo ca thi (1800s)", "Quản lý phiên thi và đồng hồ đếm ngược", "SET, GET, TTL, DEL"],
        ["exam:answers:{studentId}", "Hash", "Ca thi + 300s", "Đệm lưu đáp án từng câu trên RAM", "HSET, HGETALL, DEL"],
        ["leaderboard:weekly", "Sorted Set (ZSET)", "7 ngày (Chốt tuần)", "Xếp hạng thi đua học viên theo điểm số", "ZADD, ZREVRANGE"],
        ["security:ratelimit:{ip}", "Sorted Set (ZSET)", "60s (Sliding Window)", "Tường lửa chặn DoS quá 120 req/phút", "ZADD, ZCARD, ZREMRANGE"],
        ["security:blacklist", "Set", "Vĩnh viễn", "Danh sách các IP bị cách ly tự động", "SADD, SREM, SMEMBERS"]
    ]
    for r_idx, r_data in enumerate(data_redis, start=1):
        row = tbl_redis.rows[r_idx]
        set_cant_split(row)
        bg = HEX_LIGHT_BG if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = row.cells[c_idx]
            c.width = col_w_redis[c_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.line_spacing = 1.1
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [1, 2, 4] else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(9.0)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_PRIMARY

    # 2.3 APACHE CASSANDRA
    add_h2("2.3. Apache Cassandra (Wide-Column Store) — Dữ liệu Lớn Chuỗi Thời Gian & Giám Sát")
    add_p(
        "Apache Cassandra là CSDL phân tán cột rộng (Wide-Column Store) thiết kế theo kiến trúc vòng tròn đồng đẳng "
        "(Masterless / Peer-to-Peer Ring Architecture), không có điểm lỗi đơn (No Single Point of Failure). "
        "Với cơ chế lưu trữ Log-Structured Merge-Tree (LSM-Tree), Cassandra tối ưu hóa tuyệt đối cho các tác vụ "
        "ghi dồn dập (Write-Intensive):",
        bold_prefix="Bản chất và vai trò: "
    )
    add_bullet("Thu thập Nhật ký Học tập Chuỗi thời gian (Video Telemetry Heartbeat): Khi hàng nghìn học viên xem video bài giảng, trình duyệt gửi liên tục các tín hiệu heartbeat (sự kiện phát video VIDEO_PLAY, tiến trình VIDEO_PROGRESS, vị trí tua seek, tốc độ tua speed). Dữ liệu được ghi thẳng vào bảng learning_events trên Cassandra với tốc độ trên 2.480 bản ghi/giây mà không làm nghẽn đĩa cứng.")
    add_bullet("Phân tích Tỷ lệ Giữ chân Người xem (Video Retention Analytics): Từ dữ liệu chuỗi thời gian, hệ thống tổng hợp và trực quan hóa biểu đồ đường cong giữ chân người học theo từng mốc thời gian 2 phút. Giảng viên có thể nhìn thấy rõ điểm rơi bỏ học (Drop-off Spike) hoặc đoạn video khó hiểu được học viên tua đi tua lại nhiều lần (Replay Spike) để nâng cao chất lượng bài giảng.")
    add_bullet("Giám sát Gian lận Phòng thi (Anti-Cheat 3/3): Bắt các sự kiện học viên chuyển tab trình duyệt, thu nhỏ màn hình hoặc mở công cụ lập trình F12. Mỗi vi phạm được ghi ngay vào bảng exam_violations trên Cassandra kèm default_time_to_live = 604800 (tự động xóa sau 7 ngày). Khi vi phạm chạm mốc 3/3, hệ thống lập tức thu hồi quyền làm bài và nộp 0 điểm.")
    
    add_p(
        "Cassandra được thiết kế theo nguyên lý Query-First (thiết kế bảng bám sát câu hỏi truy vấn). "
        "Khóa phân vùng ghép PRIMARY KEY ((student_id, lesson_id), event_time) bảo đảm mọi log của cùng một bài học "
        "nằm trọn vẹn trong một phân vùng vật lý duy nhất, sắp xếp giảm dần theo thời gian (CLUSTERING ORDER BY event_time DESC). "
        "Dung lượng mỗi partition chỉ khoảng 92 KB (rất nhỏ so với trần 100 MB an toàn của Cassandra). "
        "Hệ thống sử dụng chiến lược nén TimeWindowCompactionStrategy (TWCS) để xóa gọn toàn bộ SSTable khi dữ liệu hết hạn TTL.",
        bold_prefix="Thiết kế Khóa và Chiến lược Nén: "
    )

    # 2.4 NEO4J
    add_h2("2.4. Neo4j (Graph Database) — Bản đồ Tri thức & Mạng lưới Học tập Xã hội")
    add_p(
        "Neo4j là CSDL đồ thị thuộc tính (Labeled Property Graph - LPG) hàng đầu thế giới. Khác biệt với CSDL quan hệ "
        "phải dùng các phép JOIN đệ quy vô cùng tốn kém tài nguyên máy chủ, Neo4j áp dụng nguyên lý Index-Free Adjacency "
        "(mỗi nốt trực tiếp lưu con trỏ vật lý đến các nốt lân cận). Nhờ đó, tốc độ duyệt đồ thị đạt O(1) độc lập với quy mô toàn mạng:",
        bold_prefix="Bản chất và vai trò: "
    )
    add_bullet("Bản đồ Tri thức Đồ thị (Knowledge Graph): Mô hình hóa toàn bộ lộ trình năng lực tiếng Anh từ chuẩn CEFR A1, A2, B1, B2 đến C1, C2. Các nốt bao gồm :Course, :Lesson, :Skill, :Category và các cạnh liên kết có hướng như [:PREREQUISITE_OF] (bài học tiên quyết), [:PART_OF] (thuộc khóa học), [:IN_CATEGORY] (chuyên mục).")
    add_bullet("Gợi ý Lộ trình Học tập Thích ứng (Adaptive Learning Path): Khi học viên muốn đạt mục tiêu IELTS 7.5+, câu truy vấn Cypher duyệt ngược quan hệ [:PREREQUISITE_OF*1..3] để tìm chuỗi bài học nền tảng bắt buộc phải hoàn thành trước. Thời gian thực thi chỉ mất ~5.8 mili-giây.")
    add_bullet("Mạng lưới Bạn Cùng Tiến (Study Buddies Peer Matching): Khai phá cộng đồng học tập thông qua giải thuật đồ thị Co-enrollment Pattern Matching. Neo4j tìm kiếm những học viên cùng ghi danh ([:ENROLLED_IN]) vào các khóa học chung và có cùng mục tiêu Band điểm (:User {targetBand: '7.5+'}), tính toán tỷ lệ tương thích học tập (Match 96%, 92%) để gợi ý kết nối bạn cùng tiến.")
    add_bullet("Hạt nhân cho Smart AI Study Copilot: Cung cấp bức tranh toàn cảnh về quan hệ phụ thuộc bài học và cấu trúc tri thức ngữ nghĩa giúp trợ lý ảo AI trả lời chuẩn xác lộ trình học tập tối ưu cho từng cá nhân.")

    # -------------------------------------------------------------
    # PHẦN 3: PHỐI HỢP ĐỒNG BỘ LIÊN CSDL
    # -------------------------------------------------------------
    add_h1("3. CƠ CHẾ PHỐI HỢP ĐỒNG BỘ LIÊN CƠ SỞ DỮ LIỆU (POLYGLOT COORDINATION)")
    
    add_p(
        "Trong kiến trúc Polyglot Persistence, việc phối hợp đồng bộ giữa 4 CSDL được tổ chức theo nguyên tắc "
        "Phân định rõ Nguồn Sự Thật (Single Source of Truth - SoT) cho từng nhóm dữ liệu và áp dụng kiến trúc "
        "hướng sự kiện (Event-Driven) để đảm bảo Tính Nhất Quán Cuối Cùng (Eventual Consistency):",
        bold_prefix="Nguyên tắc phân định chân lý: "
    )
    add_bullet("MongoDB là Source of Truth cho: Hồ sơ người dùng, danh mục khóa học, nội dung câu hỏi và kết quả thi vĩnh viễn.")
    add_bullet("Redis là Source of Truth cho: Trạng thái phiên làm bài thời gian thực, bảng đáp án tạm thời và bảng xếp hạng điểm tuần.")
    add_bullet("Apache Cassandra là Source of Truth cho: Dữ liệu lớn chuỗi thời gian xem video (heartbeat) và lịch sử vi phạm thi.")
    add_bullet("Neo4j là Source of Truth cho: Cấu trúc liên kết mạng lưới tri thức và quan hệ bạn bè cùng tiến.")
    
    add_h2("Kịch bản phối hợp thực tế: Luồng Thi Trực Tuyến Toàn Diện (Exam End-to-End Workflow)")
    add_p("Khi một học viên tham gia phòng thi trực tuyến, cả 4 CSDL cùng phối hợp nhịp nhàng theo chu trình 6 bước khép kín:")
    add_bullet("Bước 1 — Tải đề thi: Ứng dụng kiểm tra Redis Cache trước; nếu Cache Miss sẽ truy vấn MongoDB để nạp danh sách câu hỏi trắc nghiệm.")
    add_bullet("Bước 2 — Bắt đầu ca thi: Redis khởi tạo khóa exam:session:{studentId} với TTL 1800 giây để đếm ngược đồng hồ thời gian thực.")
    add_bullet("Bước 3 — Làm bài thi: Mỗi khi học viên click chọn đáp án, lệnh HSET lập tức lưu vào Redis Hash exam:answers:{studentId} ở tốc độ RAM (< 2ms) để chống mất bài khi rớt mạng.")
    add_bullet("Bước 4 — Giám sát gian lận: Nếu học viên chuyển tab hoặc mở F12, sự kiện vi phạm lập tức được bắn vào Apache Cassandra (bảng exam_violations). Nếu vi phạm chạm 3/3, hệ thống tự động khóa đề thi.")
    add_bullet("Bước 5 — Nộp bài và Chấm điểm: Hệ thống rút toàn bộ đáp án từ Redis Hash, đối soát với đáp án gốc từ MongoDB, tính điểm số và ghi bản ghi kết quả vĩnh viễn vào collection results trên MongoDB.")
    add_bullet("Bước 6 — Xếp hạng & Cập nhật lộ trình: Điểm số lập tức được ghi vào Redis Sorted Set (leaderboard:weekly) để cập nhật bảng xếp hạng tuần theo thời gian thực; đồng thời đồ thị Neo4j được cập nhật để mở khóa các kỹ năng tiếp theo trên bản đồ tri thức.")

    # -------------------------------------------------------------
    # PHẦN 4: HƯỚNG DẪN CÔNG CỤ QUẢN TRỊ KHI BẢO VỆ
    # -------------------------------------------------------------
    add_h1("4. HƯỚNG DẪN MỞ CÔNG CỤ GIAO DIỆN (GUI) & TRUY VẤN DEMO KHI BẢO VỆ")
    
    add_p(
        "Khi bảo vệ đồ án trước Hội đồng / Giảng viên hướng dẫn (Giảng viên phụ trách), sinh viên có thể khởi động nhanh "
        "toàn bộ 4 phần mềm quản trị CSDL bằng cách chạy tệp Mo_4_Phan_Mem_CSDL.bat tại thư mục gốc (hoặc bấm phím A để mở tất cả). "
        "Bảng 1.3 cung cấp hướng dẫn thao tác chi tiết và câu lệnh truy vấn mẫu cho từng phần mềm:",
        bold_prefix="Quy trình minh chứng thực tế: "
    )

    # Bảng 3: Hướng dẫn mở 4 GUI Tool
    p_tbl3_title = doc.add_paragraph()
    p_tbl3_title.paragraph_format.space_before = Pt(6)
    p_tbl3_title.paragraph_format.space_after = Pt(2)
    r_t3 = p_tbl3_title.add_run("Bảng 1.3: Danh mục phần mềm giao diện GUI và câu lệnh truy vấn demo khi bảo vệ đồ án")
    r_t3.font.name = "Times New Roman"
    r_t3.font.size = Pt(10.5)
    r_t3.font.bold = True
    r_t3.font.color.rgb = COLOR_PRIMARY

    tbl_gui = doc.add_table(rows=5, cols=4)
    tbl_gui.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_gui)
    set_repeat_header(tbl_gui.rows[0])
    
    headers_gui = ["Hệ CSDL", "Phần mềm GUI quản trị", "Thông số kết nối", "Thao tác & Câu lệnh truy vấn demo cho Giảng viên xem"]
    col_w_gui = [Cm(2.6), Cm(3.2), Cm(3.2), Cm(7.0)]
    
    for i, h in enumerate(headers_gui):
        cell = tbl_gui.cell(0, i)
        cell.width = col_w_gui[i]
        set_cell_background(cell, HEX_PRIMARY)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "Times New Roman"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    data_gui = [
        [
            "MongoDB",
            "MongoDB Compass",
            "URI: mongodb://localhost:27017\nCSDL: elearning_nosql",
            "1. Chọn collection courses -> Filter: {\"category\": \"IELTS\"} để xem danh mục khóa học nhúng bài học.\n2. Chọn collection results để xem kết quả thi và bài luận Writing chấm điểm AI."
        ],
        [
            "Redis",
            "RedisInsight\n(Port 6379)",
            "Host: 127.0.0.1\nPort: 6379\nName: EduPro Redis",
            "1. Mở Key List thấy: exam:answers:*, leaderboard:weekly, security:blacklist.\n2. Mở CLI gõ lệnh lấy bảng xếp hạng top thi:\n   ZREVRANGE leaderboard:weekly 0 -1 WITHSCORES"
        ],
        [
            "Apache Cassandra",
            "TablePlus\n(Khuyên dùng) hoặc DBeaver",
            "Host: 127.0.0.1\nPort: 9042\nKeyspace: elearning_tracking",
            "1. Nhấp đúp bảng learning_events để xem trực quan log xem video chuỗi thời gian.\n2. Chạy câu lệnh CQL theo Partition Key:\n   SELECT * FROM learning_events WHERE student_id = '2001230589' LIMIT 10;"
        ],
        [
            "Neo4j",
            "Neo4j Browser (Web)\nhoặc Neo4j Desktop",
            "URL: http://localhost:7474\nBolt: bolt://localhost:7687\nUser: neo4j / Pass: nosql_project_2026",
            "1. Mở màn hình đồ thị nốt trực quan:\n   MATCH (n) RETURN n LIMIT 25;\n2. Demo tìm Bạn Cùng Tiến (Study Buddies):\n   MATCH (u1:Student)-[:ENROLLED_IN]->(c:Course)<-[:ENROLLED_IN]-(u2:Student) RETURN u1.fullName, c.title, u2.fullName;"
        ]
    ]
    
    for r_idx, r_data in enumerate(data_gui, start=1):
        row = tbl_gui.rows[r_idx]
        set_cant_split(row)
        bg = HEX_LIGHT_BG if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            c = row.cells[c_idx]
            c.width = col_w_gui[c_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 1] else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(9.0)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_PRIMARY

    # Hộp Callout lưu ý
    add_callout(
        "1. Luôn kết hợp song song: Khi click một nút trên giao diện Web (ví dụ: bấm Đăng ký khóa học, làm 1 câu trắc nghiệm, phát video bài giảng), "
        "hãy mở ngay phần mềm GUI Tool tương ứng (Compass, RedisInsight, TablePlus, Neo4j Browser) để chứng minh dữ liệu được cập nhật thật 100%.\n"
        "2. Nhấn mạnh định lý CAP: Giảng viên rất hay hỏi lý do tại sao không dùng MongoDB để lưu tất cả dữ liệu. Hãy trả lời dựa trên: "
        "(1) Tốc độ RAM và TTL của Redis cho phòng thi; (2) Thông lượng ghi khổng lồ và LSM-Tree của Cassandra cho video heartbeat; "
        "(3) Khả năng duyệt đồ thị Index-Free Adjacency O(1) của Neo4j cho bản đồ tri thức.",
        title="MẸO BẢO VỆ ĐỒ ÁN ĐẠT ĐIỂM TỐI ĐA (ĐIỂM 10)",
        hex_bg=HEX_HIGHLIGHT,
        border_color=COLOR_WARNING
    )

    # Lưu tài liệu ra nhiều đường dẫn
    print("Đang tiến hành lưu tài liệu Word...")
    for out_path in OUTPUT_PATHS:
        try:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            doc.save(out_path)
            print(f" -> Đã xuất thành công: {out_path}")
        except PermissionError:
            alt_path = out_path.replace(".docx", "_UPDATED.docx")
            doc.save(alt_path)
            print(f" -> File đang được mở trong Word ({out_path}), đã lưu bản mới sạch tại: {alt_path}")

if __name__ == "__main__":
    build_document()
