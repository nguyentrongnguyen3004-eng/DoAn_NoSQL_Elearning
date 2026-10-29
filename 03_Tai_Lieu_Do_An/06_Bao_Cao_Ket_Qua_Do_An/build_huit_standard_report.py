# -*- coding: utf-8 -*-
"""
Script xây dựng Báo cáo Đồ án NoSQL - Chương 1 & Chương 2
TUÂN THỦ 100% QUY ĐỊNH THỂ THỨC TRÌNH BÀY CỦA KHOA CNTT - HUIT:
- Font: Times New Roman
- Lề trang: Trái 3.5 cm, Phải 2.5 cm, Trên 2.5 cm, Dưới 2.5 cm
- Cấp chương: cỡ chữ 18, in hoa, canh giữa, tô đậm, màu đen
- Đề mục cấp 1.1: cỡ chữ 14, in hoa, tô đậm, màu đen
- Đề mục cấp 1.1.1 & 1.1.1.1: cỡ chữ 13, in thường, tô đậm, màu đen
- Đề mục bảng: Phía trên bảng, canh giữa. Nội dung bảng cỡ chữ 12, Line spacing 1.3, Before 0pt, After 0pt.
- Bảng: KHÔNG MÀU NỀN, CHỮ TOÀN BỘ MÀU ĐEN, lặp lại tiêu đề bảng nếu sang trang mới.
- Đoạn văn: Cỡ chữ 13, Line spacing 1.3, Before 6pt, After 6pt, canh đều 2 bên, thụt đầu dòng 1.0 cm.
- Bullet cấp 1: Dấu gạch "–", Position 0.3 cm, Text indent 0.8 cm, Line spacing 1.3, Before 6pt, After 6pt.
- Bullet cấp 2: Dấu "+", Position 0.8 cm, Text indent 1.3 cm.
- Đánh số trang: Phía dưới mỗi trang, canh giữa.
"""

import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from chapter_3_srs import add_chapter_3
from chapter_4_sds import add_chapter_4
from chapter_5_gui import add_chapter_5
from chapter_6_app_demo import add_chapter_6
from chapter_7_testing import add_chapter_7
from chapter_8_conclusion import add_chapter_8
from references import add_references
from front_matter import (
    add_cover_page,
    add_acknowledgements,
    add_advisor_review,
    add_reviewer_review,
    add_table_of_contents,
    add_abbreviations,
    add_list_of_tables,
    add_list_of_figures,
    set_section_page_number_type,
    clear_section_borders
)

import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

BLACK = RGBColor(0, 0, 0)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    """Đặt khoảng đệm lề cho ô trong bảng (dxa)"""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_border_black(cell):
    """Viền đen mảnh đơn giản chuẩn học thuật, không màu mè"""
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right'):
        border = OxmlElement(f'w:{edge}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '4') # 0.5 pt
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), '000000') # Đen
        tcBorders.append(border)
    tcPr.append(tcBorders)

def set_repeat_table_header(row):
    """Lặp lại tiêu đề bảng khi sang trang mới"""
    trPr = row._tr.get_or_add_trPr()
    tblHeader = OxmlElement('w:tblHeader')
    trPr.append(tblHeader)

def set_cant_split(row):
    """Không cắt đôi dòng dữ liệu giữa 2 trang"""
    trPr = row._tr.get_or_add_trPr()
    cantSplit = OxmlElement('w:cantSplit')
    trPr.append(cantSplit)

def add_page_number_field(run):
    """Thêm trường số trang tự động vào Footer"""
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = 'PAGE'
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    r = run._r
    r.append(fldChar1)
    r.append(instrText)
    r.append(fldChar2)
    r.append(fldChar3)

# -------------------------------------------------------------
# CÁC HÀM TẠO ĐỀ MỤC VÀ ĐOẠN VĂN THEO CHUẨN HUIT
# -------------------------------------------------------------

def add_heading_chapter(doc, text):
    """Cấp chương: cỡ chữ 18, in hoa, canh giữa, tô đậm, màu đen"""
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.first_line_indent = Cm(0)
    run = p.add_run(text.upper())
    run.font.name = 'Times New Roman'
    run.font.size = Pt(18)
    run.bold = True
    run.font.color.rgb = BLACK
    return p

def add_heading_level1(doc, text):
    """Đề mục số cấp 1.1: cỡ chữ 14, in hoa, tô đậm, màu đen"""
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.first_line_indent = Cm(0)
    run = p.add_run(text.upper())
    run.font.name = 'Times New Roman'
    run.font.size = Pt(14)
    run.bold = True
    run.font.color.rgb = BLACK
    return p

def add_heading_level2(doc, text):
    """Đề mục số cấp 1.1.1: Cỡ chữ 13, in thường, tô đậm, màu đen"""
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.first_line_indent = Cm(0)
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(13)
    run.bold = True
    run.font.color.rgb = BLACK
    return p

def add_heading_level3(doc, text):
    """Đề mục số cấp 1.1.1.1 (nếu có): Cỡ chữ 13, in thường, tô đậm, màu đen"""
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.first_line_indent = Cm(0)
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(13)
    run.bold = True
    run.font.color.rgb = BLACK
    return p

def add_table_title(doc, text):
    """Đề mục bảng: đặt phía trên bảng, canh giữa, màu đen"""
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1.3
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.bold = True
    run.font.color.rgb = BLACK
    return p

def add_figure_huit(doc, img_path, caption, width_cm=13.5):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.first_line_indent = Cm(0)
    if os.path.exists(img_path):
        run = p.add_run()
        run.add_picture(img_path, width=Cm(width_cm))
    else:
        run = p.add_run(f'[{caption}]')
        run.italic = True
    add_figure_title(doc, caption)

def add_figure_title(doc, text):
    """Đề mục hình: đặt phía dưới hình, canh giữa, màu đen"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1.3
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.italic = True
    run.bold = True
    run.font.color.rgb = BLACK
    return p

def add_paragraph_huit(doc, text, bold_prefix=""):
    """
    Nội dung: Viết dạng đoạn văn, thục vào đầu dòng mỗi đoạn. 
    Cỡ chữ 13, Line spacing Multiple at 1.3, Before 6pt, After 6pt, canh đều 2 bên. 
    Chữ màu đen.
    """
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.first_line_indent = Cm(1.0) # Thụt đầu dòng đoạn văn
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(13)
        r_pre.bold = True
        r_pre.font.color.rgb = BLACK
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.color.rgb = BLACK
    return p

def add_bullet_level1(doc, text):
    """
    Bullet cấp 1 sử dụng dấu gạch “–”; Line spacing Multiple at 1.3, 
    Before 6pt, After 6pt, canh đều 2 bên; Position 0.3 cm, Text indent 0.8 cm.
    """
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(0.8)
    p.paragraph_format.first_line_indent = Cm(-0.5) # Để dấu gạch ở 0.3 cm
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    
    run_bullet = p.add_run("–\t")
    run_bullet.font.name = 'Times New Roman'
    run_bullet.font.size = Pt(13)
    run_bullet.font.color.rgb = BLACK
    
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(13)
    run.font.color.rgb = BLACK
    return p

def add_bullet_level2(doc, text):
    """
    Bullet cấp 2 sử dụng dấu “+”; Position 0.8 cm, Text indent 1.3 cm.
    Định dạng paragraph giống như Bullet cấp 1.
    """
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(1.3)
    p.paragraph_format.first_line_indent = Cm(-0.5) # Để dấu cộng ở 0.8 cm
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    
    run_bullet = p.add_run("+\t")
    run_bullet.font.name = 'Times New Roman'
    run_bullet.font.size = Pt(13)
    run_bullet.font.color.rgb = BLACK
    
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(13)
    run.font.color.rgb = BLACK
    return p

def create_huit_table(doc, table_title, headers, data, col_widths):
    """
    Tạo bảng chuẩn HUIT:
    - Đề mục bảng phía trên, canh giữa.
    - Không màu nền (nền trắng).
    - Toàn bộ chữ màu đen.
    - Cỡ chữ 12, Line spacing 1.3, Before 0pt, After 0pt.
    - Lặp lại tiêu đề bảng khi sang trang mới.
    """
    add_table_title(doc, table_title)
    
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Dòng Header
    hdr_row = table.rows[0]
    set_repeat_table_header(hdr_row)
    set_cant_split(hdr_row)
    
    for i, title in enumerate(headers):
        cell = hdr_row.cells[i]
        cell.text = title
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        set_cell_border_black(cell)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.first_line_indent = Cm(0)
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(12)
            r.bold = True
            r.font.color.rgb = BLACK
            
    # Các dòng dữ liệu
    for row_data in data:
        row = table.add_row()
        set_cant_split(row)
        for col_idx, val in enumerate(row_data):
            cell = row.cells[col_idx]
            cell.text = str(val)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            set_cell_border_black(cell)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.3
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.first_line_indent = Cm(0)
            if col_idx == 0 or len(str(val)) <= 5:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(12)
                r.font.color.rgb = BLACK
                
    # Thiết lập độ rộng cột
    for row in table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = Cm(w)
            
    # Thêm khoảng cách nhỏ sau bảng
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(6)
    p_sp.paragraph_format.first_line_indent = Cm(0)

def generate_full_document(output_paths):
    doc = docx.Document()
    
    helpers = {
        'add_heading_chapter': add_heading_chapter,
        'add_heading_level1': add_heading_level1,
        'add_heading_level2': add_heading_level2,
        'add_heading_level3': add_heading_level3,
        'add_table_title': add_table_title,
        'add_figure_title': add_figure_title,
        'add_paragraph_huit': add_paragraph_huit,
        'add_bullet_level1': add_bullet_level1,
        'add_bullet_level2': add_bullet_level2,
        'create_huit_table': create_huit_table,
        'add_figure_huit': add_figure_huit,
        'set_cell_margins': set_cell_margins,
        'set_cell_border_black': set_cell_border_black,
        'assets_dir': r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\06_Bao_Cao_Ket_Qua_Do_An\report_assets'
    }

    # =============================================================
    # PHẦN 1: TRANG BÌA CHÍNH (IN GIẤY BÌA CỨNG, KHUNG VIỀN MỸ THUẬT)
    # =============================================================
    add_cover_page(doc, helpers, is_main_cover=True)

    # =============================================================
    # PHẦN 2: TRANG BÌA PHỤ (IN GIẤY TRẮNG THƯỜNG A4, KHÔNG KHUNG VIỀN)
    # =============================================================
    sec_sub = doc.add_section()
    add_cover_page(doc, helpers, is_main_cover=False)

    # =============================================================
    # PHẦN 3: CÁC TRANG ĐẦU (FRONT MATTER): LỜI CẢM ƠN, NHẬN XÉT GVHD,
    # NHẬN XÉT GVPB, MỤC LỤC, DANH MỤC VIẾT TẮT, DANH MỤC BẢNG, HÌNH
    # QUY ĐỊNH ĐÁNH SỐ TRANG: LA MÃ (i, ii, iii...), CANH GIỮA
    # =============================================================
    sec_front = doc.add_section()
    sec_front.left_margin = Cm(3.5)
    sec_front.right_margin = Cm(2.5)
    sec_front.top_margin = Cm(2.5)
    sec_front.bottom_margin = Cm(2.5)
    sec_front.footer.is_linked_to_previous = False
    clear_section_borders(sec_front)
    set_section_page_number_type(sec_front, fmt='lowerRoman', start=1)
    
    f_roman = sec_front.footer.paragraphs[0]
    f_roman.alignment = WD_ALIGN_PARAGRAPH.CENTER
    f_roman.paragraph_format.first_line_indent = Cm(0)
    run_r = f_roman.add_run()
    run_r.font.name = 'Times New Roman'
    run_r.font.size = Pt(12)
    run_r.font.color.rgb = BLACK
    add_page_number_field(run_r)

    # Thêm từng trang Front Matter
    add_acknowledgements(doc, helpers)
    doc.add_page_break()
    add_advisor_review(doc, helpers)
    doc.add_page_break()
    add_reviewer_review(doc, helpers)
    doc.add_page_break()
    add_table_of_contents(doc, helpers)
    doc.add_page_break()
    add_abbreviations(doc, helpers)
    doc.add_page_break()
    add_list_of_tables(doc, helpers)
    doc.add_page_break()
    add_list_of_figures(doc, helpers)

    # =============================================================
    # PHẦN 4: TOÀN BỘ NỘI DUNG CHÍNH (MỞ ĐẦU, CHƯƠNG 1-8, TÀI LIỆU THAM KHẢO)
    # QUY ĐỊNH ĐÁNH SỐ TRANG: SỐ Ả RẬP (1, 2, 3...), CANH GIỮA BẮT ĐẦU TỪ 1
    # =============================================================
    sec_main = doc.add_section()
    sec_main.left_margin = Cm(3.5)
    sec_main.right_margin = Cm(2.5)
    sec_main.top_margin = Cm(2.5)
    sec_main.bottom_margin = Cm(2.5)
    sec_main.footer.is_linked_to_previous = False
    clear_section_borders(sec_main)
    set_section_page_number_type(sec_main, fmt='decimal', start=1)
    
    f_dec = sec_main.footer.paragraphs[0]
    f_dec.alignment = WD_ALIGN_PARAGRAPH.CENTER
    f_dec.paragraph_format.first_line_indent = Cm(0)
    run_d = f_dec.add_run()
    run_d.font.name = 'Times New Roman'
    run_d.font.size = Pt(12)
    run_d.font.color.rgb = BLACK
    add_page_number_field(run_d)

        # =============================================================
    # PHẦN MỞ ĐẦU
    # =============================================================
    add_heading_chapter(doc, "MỞ ĐẦU")

    add_heading_level1(doc, "1. GIỚI THIỆU")
    add_paragraph_huit(doc, 
        "Bước vào kỷ nguyên số hóa toàn diện và sự bùng nổ của cuộc cách mạng công nghiệp lần thứ tư, công nghệ giáo dục (EdTech) đang chứng kiến bước chuyển mình mạnh mẽ từ các lớp học truyền thống sang các mô hình đào tạo trực tuyến quy mô lớn (E-Learning). Các nền tảng học tập thông minh ngày càng đòi hỏi khả năng cá nhân hóa lộ trình, tương tác thời gian thực và quản lý khối lượng dữ liệu khổng lồ từ hành vi học tập của người dùng. Trong các lĩnh vực đào tạo trực tuyến tại Việt Nam, nhu cầu học tập, rèn luyện kỹ năng và khảo sát năng lực tiếng Anh thực chiến nhằm đạt các chuẩn chứng chỉ quốc tế (IELTS, TOEIC, CEFR A1-C2) luôn chiếm tỷ trọng lớn và không ngừng gia tăng qua từng năm.",
        "Xu thế phát triển của công nghệ giáo dục: "
    )
    add_paragraph_huit(doc, 
        "Tuy nhiên, trong quá trình vận hành thực tế các hệ thống E-Learning có lưu lượng truy cập cao, các kiến trúc cơ sở dữ liệu quan hệ truyền thống (RDBMS) thường xuyên đối mặt với những vấn đề nan giải và điểm nghẽn nghiêm trọng, có thể dẫn chứng cụ thể qua các kịch bản thực tế sau:",
        "Những vấn đề kỹ thuật và dẫn chứng thực tiễn: "
    )
    add_bullet_level1(doc, 
        "Dẫn chứng về sự bùng nổ lưu lượng truy cập đồng thời (Concurrency): Trong các đợt tổ chức kỳ thi khảo sát năng lực tập trung (Placement Test hoặc IELTS Mock Test), hàng ngàn thí sinh cùng truy cập làm bài, liên tục gửi đáp án và cùng bấm nộp bài vào những giây cuối cùng. CSDL RDBMS truyền thống (như MySQL hay SQL Server) lập tức bị quá tải hàng đợi I/O đĩa từ, xảy ra hiện tượng khóa bảng (table locking) hoặc khóa dòng (row-level locking), dẫn đến nghẽn cổng thi và làm sập máy chủ dịch vụ."
    )
    add_bullet_level1(doc, 
        "Dẫn chứng về tần suất phát sinh dữ liệu hành vi cực cao (High Velocity): Để phục vụ thống kê tiến độ học tập và chống gian lận, trình duyệt của học viên liên tục gửi tín hiệu heartbeat theo dõi thời gian xem video (chu kỳ 5 giây một lần) cùng các sự kiện chuyển tab, rời khỏi màn hình thi. Với hàng ngàn học viên học đồng thời, số lượng bản ghi log phát sinh lên tới hàng chục ngàn dòng mỗi phút (Write-heavy). RDBMS truyền thống với cơ chế ghi đĩa đồng bộ kèm duy trì chỉ mục B-Tree không thể đáp ứng được thông lượng ghi khổng lồ này."
    )
    add_bullet_level1(doc, 
        "Dẫn chứng về tính đa dạng và biến đổi của dữ liệu học tập (High Variety): Nội dung đào tạo tiếng Anh hiện đại không chỉ có văn bản đơn giản mà bao gồm đa dạng các dạng thức: bài nghe đính kèm file audio MP3, bài phát âm kèm phân tích sóng âm, câu hỏi đọc hiểu chứa văn bản đoạn văn lồng nhau, bài viết luận PEEL có chấm điểm tiêu chí mở rộng, sổ tay từ vựng flashcard cá nhân hóa. Nếu ép buộc toàn bộ các cấu trúc phức tạp này vào các bảng RDBMS sẽ làm nảy sinh hàng chục bảng trung gian phân mảnh, số lượng khóa ngoại dày đặc, khiến mã nguồn tầng Backend trở nên cồng kềnh và truy vấn rất chậm."
    )
    add_bullet_level1(doc, 
        "Dẫn chứng về bài toán mạng lưới quan hệ đa tầng (Graph Traversal): Việc xây dựng lộ trình học tập phụ thuộc (học xong bài này mới được mở khóa bài nâng cao) và thuật toán gợi ý bạn cùng tiến (tìm những học viên có cùng mục tiêu Band điểm và cùng đăng ký nhiều khóa học chung) đòi hỏi duyệt qua đồ thị liên kết nhiều bước. Trong RDBMS, việc thực hiện các câu lệnh SQL JOIN đệ quy nhiều cấp (Recursive Self-JOIN) gây bùng nổ không gian tìm kiếm, độ phức tạp tính toán tăng theo cấp số nhân, khiến thời gian phản hồi kéo dài hàng chục giây."
    )
    add_paragraph_huit(doc, 
        "Xuất phát từ những đòi hỏi cấp thiết và bài toán thực tế nêu trên, đề tài 'Xây dựng nền tảng E-Learning & Khảo sát năng lực tiếng Anh thực chiến tích hợp đa mô hình NoSQL (EduPro Academy)' được lựa chọn thực hiện. Đề tài nhằm mục đích nghiên cứu chuyên sâu và áp dụng giải pháp kiến trúc đa mô hình NoSQL (Polyglot Persistence) - kết hợp hài hòa sức mạnh của 4 hệ quản trị NoSQL tiên tiến: MongoDB (lưu trữ tài liệu linh hoạt), Redis (bộ nhớ đệm RAM siêu tốc), Apache Cassandra (xử lý chuỗi thời gian ghi tải cao) và Neo4j (khai phá mạng lưới đồ thị tri thức), mang lại giải pháp công nghệ toàn diện, bền vững và đạt hiệu năng tối ưu.",
        "Lý do lựa chọn đề tài: "
    )

    add_heading_level1(doc, "2. MỤC TIÊU ĐỀ TÀI")
    add_paragraph_huit(doc, 
        "Đề tài xác định các mục tiêu cốt lõi cần phải đạt được trên cả hai phương diện nghiên cứu lý thuyết và hiện thực hóa sản phẩm ứng dụng, cụ thể như sau:",
        "Mục tiêu tổng quát: "
    )
    add_bullet_level1(doc, 
        "Về mặt nghiên cứu khoa học và lý thuyết:"
    )
    add_bullet_level2(doc, 
        "Nghiên cứu chuyên sâu về nguyên lý vận hành, kiến trúc lưu trữ và phạm vi ứng dụng tối ưu của 4 mô hình cơ sở dữ liệu NoSQL tiêu biểu: Document Store, In-Memory Key-Value Store, Wide-Column Family Store và Graph Database."
    )
    add_bullet_level2(doc, 
        "Làm chủ các lý thuyết phân tán dữ liệu hiện đại: Định lý CAP của Eric Brewer, định lý mở rộng PACELC của Daniel Abadi, mô hình đảm bảo tính nhất quán BASE, cơ chế Băm nhất quán (Consistent Hashing) trên vòng tròn Token Ring và nguyên lý duyệt đồ thị Index-free Adjacency."
    )
    add_bullet_level1(doc, 
        "Về mặt hiện thực hóa sản phẩm ứng dụng:"
    )
    add_bullet_level2(doc, 
        "Xây dựng thành công nền tảng E-Learning EduPro Academy với đầy đủ chức năng phục vụ 3 nhóm tác nhân (Học viên, Giảng viên, Quản trị viên): quản lý danh mục 12 khóa học tiếng Anh chuẩn quốc tế, tổ chức phòng thi khảo sát năng lực trực tuyến, hệ thống chống gian lận thi cử 3 lần cảnh báo, cơ chế Gamification đổi quà bằng điểm thưởng XP, theo dõi tiến độ xem bài giảng chuỗi thời gian và gợi ý Bạn Cùng Tiến."
    )
    add_bullet_level2(doc, 
        "Tích hợp đồng thời và vận hành trơn tru cả 4 hệ CSDL NoSQL (MongoDB, Redis, Apache Cassandra, Neo4j) trong một ngăn xếp công nghệ RESTful API thống nhất, không để xảy ra xung đột hay chồng chéo về mặt nghiệp vụ."
    )
    add_bullet_level2(doc, 
        "Đạt được các chỉ số hiệu năng định lượng (Non-Functional Requirements - NFR) đo lường thực tế: thời gian truy xuất Cache Redis dưới 5 ms ở phân vị p95; thông lượng ghi log học tập vào Cassandra trên 2.000 ops/giây; truy vấn tìm kiếm khóa học trên MongoDB dưới 40 ms; thuật toán duyệt đồ thị tri thức trên Neo4j dưới 30 ms; và đạt 100% tỷ lệ vượt qua bộ kiểm thử tự động 22 Test Cases."
    )

    add_heading_level1(doc, "3. ĐỐI TƯỢNG VÀ PHẠM VI ĐỀ TÀI")
    add_paragraph_huit(doc, 
        "Để đảm bảo tính khả thi, chiều sâu nghiên cứu và sự tập trung của đề tài, các đối tượng nghiên cứu và phạm vi giới hạn được xác định rõ ràng như sau:",
        "Xác định đối tượng và phạm vi: "
    )
    add_bullet_level1(doc, 
        "Đối tượng nghiên cứu:"
    )
    add_bullet_level2(doc, 
        "Đối tượng công nghệ: 4 hệ quản trị cơ sở dữ liệu NoSQL đại diện cho 4 mô hình lưu trữ cốt lõi: MongoDB Community (phiên bản 7.0+), Redis / Memurai (phiên bản 7.0+), Apache Cassandra (phiên bản 3.11.17) và Neo4j Community (phiên bản 5.x); ngăn xếp phát triển ứng dụng web hiện đại Node.js/Express.js và kiến trúc Module hóa Frontend Vanilla ES6."
    )
    add_bullet_level2(doc, 
        "Đối tượng người dùng (Tác nhân hệ thống): Học viên (Student - người học, làm bài thi, đổi quà XP), Giảng viên (Teacher - tạo khóa học, quản lý ngân hàng câu hỏi, theo dõi thống kê) và Quản trị viên (Admin - kiểm duyệt nội dung, quản lý an ninh hệ thống và phân quyền)."
    )
    add_bullet_level1(doc, 
        "Phạm vi và giới hạn đề tài:"
    )
    add_bullet_level2(doc, 
        "Phạm vi môi trường triển khai: Đề tài tập trung triển khai và đánh giá thực nghiệm trên môi trường máy chủ cục bộ (Local Server) kết hợp công nghệ đóng gói Container (Docker, Docker Compose), kết nối và kiểm thử trực tiếp qua các giao thức mạng bản địa: MongoDB (cổng 27017), Redis (cổng 6379), Cassandra Native Transport (cổng 9042), Neo4j Bolt Protocol (cổng 7687) và Web HTTP (cổng 5050)."
    )
    add_bullet_level2(doc, 
        "Phạm vi nghiệp vụ chức năng (In-Scope): Tập trung vào 5 phân hệ nòng cốt: (1) Quản trị đào tạo LMS và từ vựng cá nhân; (2) Phòng thi trắc nghiệm trực tuyến thời gian thực và Anti-cheat 3/3; (3) Phân tích dữ liệu chuỗi thời gian tỷ lệ giữ chân video (Retention Curve); (4) Đồ thị tri thức bài học và mạng lưới xã hội học tập Bạn Cùng Tiến; (5) Tường lửa giới hạn tần suất truy cập trượt (Sliding Window Rate Limiter) và cơ chế sao lưu phục hồi dữ liệu đồng bộ."
    )
    add_bullet_level2(doc, 
        "Giới hạn nghiên cứu (Out-of-Scope): Đề tài không đi sâu vào việc tích hợp cổng thanh toán trực tiếp với các tổ chức tín dụng ngoài môi trường Sandbox (sử dụng giải pháp tạo mã VietQR động giả lập); không xây dựng mô hình trí tuệ nhân tạo nhận dạng giọng nói (Speech Recognition) tự huấn luyện từ đầu; và không triển khai cụm phân tán đa vùng địa lý trên hạ tầng đám mây thương mại đa quốc gia."
    )

    add_heading_level1(doc, "4. PHƯƠNG PHÁP NGHIÊN CỨU")
    add_paragraph_huit(doc, 
        "Để giải quyết triệt để các bài toán kỹ thuật đặt ra và hiện thực hóa mục tiêu đồ án, nhóm nghiên cứu kết hợp hài hòa hai phương pháp luận khoa học sau:",
        "Phương pháp luận nghiên cứu: "
    )
    add_bullet_level1(doc, 
        "Phương pháp nghiên cứu lý thuyết: Thu thập, tổng hợp và phân tích có hệ thống các công trình nghiên cứu học thuật, giáo trình chuyên ngành và tài liệu kỹ thuật chính thức từ các tổ chức phát triển NoSQL (MongoDB Inc., Redis Ltd., Apache Cassandra Project, Neo4j Graph Database). Trọng tâm nghiên cứu làm chủ các nguyên lý cốt lõi: Định lý CAP, Định lý PACELC, mô hình đảm bảo tính nhất quán BASE, thuật toán Băm nhất quán (Consistent Hashing), cấu trúc lưu trữ LSM-tree, cơ chế In-memory Datastore và nguyên lý duyệt đồ thị Index-free Adjacency."
    )
    add_bullet_level1(doc, 
        "Phương pháp nghiên cứu thực nghiệm: Xây dựng nền tảng ứng dụng thực tế EduPro Academy; thiết kế cấu trúc dữ liệu tối ưu trên 4 CSDL NoSQL theo hướng mẫu truy cập (Access Pattern); tích hợp bộ kiểm thử tự động 22 Test Cases chức năng; thực hiện kiểm thử tải định lượng bằng k6; và tiến hành các kịch bản kiểm thử chịu lỗi Chaos Engineering nhằm đo lường chính xác các chỉ số hiệu năng và khả năng phục hồi của hệ thống."
    )

    add_heading_level1(doc, "5. BỐ CỤC ĐỒ ÁN")
    add_paragraph_huit(doc, 
        "Nội dung của quyển báo cáo đồ án được cấu trúc chặt chẽ thành 8 chương trọng tâm và phần tài liệu tham khảo, cụ thể như sau:",
        "Cấu trúc bố cục đồ án: "
    )
    add_bullet_level1(doc, 
        "Chương 1: Tổng quan đề tài và Kế hoạch dự án – Trình bày bối cảnh, lý do chọn đề tài, mục tiêu, phạm vi nghiên cứu, công nghệ sử dụng và kế hoạch triển khai theo quy trình Agile Scrum kèm phân công nhiệm vụ chi tiết cho từng thành viên."
    )
    add_bullet_level1(doc, 
        "Chương 2: Tổng quan NoSQL và Tìm hiểu Tool – Giới thiệu tổng quan về CSDL NoSQL, các nguyên lý phân tán dữ liệu, phân loại 4 mô hình NoSQL cốt lõi và nghiên cứu chuyên sâu về công cụ quản trị giao diện GUI Tool."
    )
    add_bullet_level1(doc, 
        "Chương 3: Đặc tả yêu cầu phần mềm (SRS) – Xây dựng tài liệu đặc tả yêu cầu theo chuẩn IEEE 830 / ISO 29148, bao gồm 15 yêu cầu chức năng, mô hình BPMN, mô hình hóa chức năng, 6 yêu cầu phi chức năng, đặc tính dữ liệu 3V, 16 mẫu truy cập dữ liệu (AP) và ma trận truy vết yêu cầu."
    )
    add_bullet_level1(doc, 
        "Chương 4: Đặc tả thiết kế phần mềm (SDS) – Thiết kế kiến trúc theo chuẩn IEEE 1016, bao gồm ma trận quyết định chọn CSDL, thiết kế chi tiết trên 4 hệ NoSQL (Redis, MongoDB, Cassandra, Neo4j), cơ chế đồng bộ Polyglot, phân tích CAP/PACELC, thiết kế 15 API Backend, sơ đồ lớp và 5 kỹ thuật tối ưu nâng cao."
    )
    add_bullet_level1(doc, 
        "Chương 5: Xây dựng CSDL và Truy vấn trên GUI Tool – Thiết lập môi trường triển khai Docker, khởi tạo cơ sở dữ liệu và hiện thực hóa 20 câu truy vấn (10 cơ bản + 10 nâng cao) trực tiếp trên các công cụ GUI Tool cùng minh chứng sao lưu, phục hồi."
    )
    add_bullet_level1(doc, 
        "Chương 6: Kết nối ứng dụng và Demo – Trình bày kiến trúc phân tầng kết nối 4 CSDL NoSQL và minh chứng thực tế 6 nhóm chức năng nghiệp vụ trọng yếu của hệ thống EduPro Academy kèm hình ảnh giao diện thực tế."
    )
    add_bullet_level1(doc, 
        "Chương 7: Kiểm thử và Đánh giá hiệu năng – Trình bày kết quả kiểm thử tự động 22 Test Cases chức năng, đánh giá hiệu năng chịu tải với k6, 5 thí nghiệm so sánh thực nghiệm và kiểm thử chịu lỗi Chaos Engineering."
    )
    add_bullet_level1(doc, 
        "Chương 8: Kết quả đạt được và Tổng kết hoạt động nhóm – Đánh giá mức độ hoàn thành so với mục tiêu và NFR, bảng tổng kết tỷ lệ đóng góp cá nhân của từng thành viên, bài học kinh nghiệm và hướng phát triển trong tương lai."
    )
    add_bullet_level1(doc, 
        "Tài liệu tham khảo – Danh mục 18 tài liệu khoa học, giáo trình đại học HUIT, tiêu chuẩn IEEE và tài liệu chính thức của các tổ chức NoSQL quốc tế."
    )

    doc.add_page_break()

# =============================================================
    # CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KẾ HOẠCH DỰ ÁN
    # =============================================================
    add_heading_chapter(doc, "CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KẾ HOẠCH DỰ ÁN")

    add_heading_level1(doc, "1.1. Bối cảnh và lý do chọn đề tài")
    add_paragraph_huit(doc, 
        "Trong bối cảnh toàn cầu hóa và sự bùng nổ của cuộc cách mạng công nghiệp lần thứ tư, công nghệ giáo dục (EdTech) đã trở thành một trong những lĩnh vực mũi nhọn phát triển với tốc độ ấn tượng. Các nền tảng học tập trực tuyến quy mô lớn (như Coursera, Udemy, edX, Duolingo) ngày càng thu hút hàng chục triệu người học trên toàn thế giới. Tại Việt Nam, nhu cầu học tập, rèn luyện và khảo sát năng lực tiếng Anh thực chiến nhằm chinh phục các chứng chỉ quốc tế (IELTS, TOEIC, CEFR A1-C2) luôn là mối quan tâm hàng đầu của học sinh, sinh viên và người đi làm.",
        "Bối cảnh kỷ nguyên chuyển đổi số giáo dục: "
    )
    add_paragraph_huit(doc, 
        "Tuy nhiên, khi quy mô người dùng tăng trưởng vượt bậc và lưu lượng truy cập phát sinh đồng thời dồn dập (hàng ngàn học viên cùng truy cập làm bài thi trắc nghiệm, liên tục bấm gửi đáp án, gửi tín hiệu theo dõi tiến độ xem bài giảng video theo chu kỳ 5 giây một lần), các hệ quản trị cơ sở dữ liệu quan hệ truyền thống (RDBMS như MySQL, PostgreSQL, Microsoft SQL Server) bộc lộ bốn điểm nghẽn nghiêm trọng không thể giải quyết triệt để:",
        "Hạn chế cố hữu của hệ thống RDBMS truyền thống: "
    )

    add_bullet_level1(doc, 
        "Nghẽn về tính linh hoạt của lược đồ dữ liệu (Schema Rigidity): Mô hình RDBMS đòi hỏi cấu trúc bảng cố định (rigid schema). Trong hệ thống học tiếng Anh, cấu trúc bài giảng vô cùng linh hoạt (bài tập nghe kèm file audio MP3, bài tập phát âm kèm sóng âm, câu hỏi đọc hiểu kèm đoạn văn lồng nhau, bài viết luận PEEL). Nếu ép buộc vào RDBMS sẽ dẫn đến hàng chục bảng trung gian phân mảnh, số lượng khóa ngoại (Foreign Keys) dày đặc, làm phức tạp hóa mã nguồn và suy giảm hiệu năng nghiêm trọng."
    )
    add_bullet_level1(doc, 
        "Tắc nghẽn tải ghi dồn dập (Write-Heavy Bottleneck): Khi tổ chức các kỳ thi đánh giá năng lực tập trung (Placement Test, IELTS Mock Test), hàng ngàn học viên nộp bài cùng một thời điểm. Đồng thời, trình duyệt gửi định kỳ tín hiệu theo dõi tiến độ (Heartbeat video tracking mỗi 5 giây). Tần suất ghi ồ ạt khiến các bảng trong RDBMS bị khóa (row-level/table-level lock) và nghẽn hàng đợi I/O đĩa cứng."
    )
    add_bullet_level1(doc, 
        "Độ trễ truy vấn RAM không thể đáp ứng (In-Memory Latency Gap): Các chức năng thời gian thực như Bảng xếp hạng tuần (Leaderboard), kiểm soát phiên làm bài thi (Exam Timer TTL) và tường lửa giới hạn tần suất truy cập (Rate Limiter) đòi hỏi thời gian phản hồi dưới 5 mili-giây. RDBMS lưu trữ trên đĩa cứng (disk-based) không thể đáp ứng được độ trễ cực thấp này."
    )
    add_bullet_level1(doc, 
        "Bất lực trước mạng lưới quan hệ đa tầng (Graph Traversal Complexity): Bài toán xác định lộ trình học tập tiên quyết (Prerequisite Learning Path) và thuật toán gợi ý bạn cùng tiến (Study Buddies dựa trên đồng ghi danh khóa học) đòi hỏi duyệt mạng lưới quan hệ phức tạp. Trong RDBMS, việc thực hiện các phép JOIN đệ quy nhiều cấp (Recursive Self-JOIN) gây bùng nổ không gian tìm kiếm, độ phức tạp thuật toán tăng theo hàm mũ, dẫn đến treo hệ thống."
    )

    add_paragraph_huit(doc, 
        "Để giải quyết triệt để các thách thức trên, đề tài áp dụng triết lý Polyglot Persistence (Kiến trúc đa mô hình NoSQL). Thay vì cố gắng ép buộc toàn bộ dữ liệu vào một hệ quản trị duy nhất, hệ thống phân chia lưu trữ cho 4 hệ NoSQL tiêu biểu dựa trên đúng thế mạnh cốt lõi: MongoDB quản lý tài liệu JSON linh hoạt; Redis xử lý tốc độ cao trên bộ nhớ RAM; Apache Cassandra ghi nhận chuỗi thời gian tải nặng và Neo4j biểu diễn mạng lưới đồ thị tri thức.",
        "Giải pháp kiến trúc Polyglot Persistence: "
    )

    add_heading_level1(doc, "1.2. Mục tiêu đề tài")
    add_paragraph_huit(doc, 
        "Mục tiêu tổng quát của đề tài là xây dựng hoàn chỉnh nền tảng E-Learning và khảo sát năng lực tiếng Anh thực chiến EduPro Academy tích hợp đồng thời 4 hệ quản trị cơ sở dữ liệu NoSQL, đáp ứng đầy đủ nghiệp vụ đào tạo và đạt được các chỉ tiêu hiệu năng định lượng cụ thể sau:",
        "Mục tiêu tổng quát và định lượng kỹ thuật: "
    )
    add_bullet_level1(doc, "Xây dựng hệ thống đào tạo trực tuyến phục vụ 3 nhóm đối tượng (Học viên, Giảng viên, Quản trị viên) với đầy đủ quy trình học tập, thi chứng chỉ, gamification đổi quà và quản trị nội dung CMS.")
    add_bullet_level1(doc, "Độ trễ đọc Cache Redis: Thời gian phản hồi API lấy dữ liệu bảng xếp hạng và danh mục khóa học đạt dưới 5 ms ở phân vị p95.")
    add_bullet_level1(doc, "Thông lượng ghi Cassandra: Đảm bảo ghi nhận chuỗi thời gian log học tập (Learning Events) đạt thông lượng trên 2.000 ops/giây mà không gây khóa bảng.")
    add_bullet_level1(doc, "Hiệu năng tìm kiếm MongoDB: Thời gian truy vấn tìm kiếm khóa học và đề thi dưới 40 ms nhờ hệ thống chỉ mục phức hợp (Compound Index).")
    add_bullet_level1(doc, "Khả năng duyệt đồ thị Neo4j: Thuật toán gợi ý lộ trình học tập và tìm bạn học cùng tiến thực thi dưới 30 ms đối với đồ thị từ 3 đến 4 bước nhảy (hops).")
    add_bullet_level1(doc, "Độ tin cậy kiểm thử: Đạt tỷ lệ vượt qua 100% (22/22 Test Cases) của bộ kiểm thử tự động toàn diện.")

    add_heading_level1(doc, "1.3. Phạm vi đề tài")
    add_paragraph_huit(doc, 
        "Hệ thống EduPro Academy tập trung giải quyết các bài toán nghiệp vụ đào tạo tiếng Anh trong phạm vi nghiên cứu thực nghiệm bao gồm:",
        "Phạm vi thực hiện trong đề tài (In-Scope): "
    )
    add_bullet_level1(doc, "Quản lý tài khoản và phân quyền người dùng theo 3 vai trò (Student, Teacher, Admin) với cơ chế xác thực JWT Token.")
    add_bullet_level1(doc, "Quản lý danh mục 12 khóa học tiếng Anh chuẩn quốc tế (IELTS Masterclass, TOEIC 850+, Ngữ pháp cốt lõi, Giao tiếp thương mại, Phát âm IPA).")
    add_bullet_level1(doc, "Khảo sát năng lực trực tuyến: Phòng thi thời gian thực, đồng bộ đáp án vào Redis Hash, tính điểm tự động và cơ chế Anti-cheat 3 lần cảnh báo chuyển tab.")
    add_bullet_level1(doc, "Hệ thống Gamification: Tích lũy điểm kinh nghiệm XP, đổi vật phẩm trong cửa hàng (Streak Freeze, Voucher giảm học phí).")
    add_bullet_level1(doc, "Quản lý chuỗi thời gian học tập trên Apache Cassandra: Ghi nhận log xem video, tính toán đường cong giữ chân người học (Retention Curve).")
    add_bullet_level1(doc, "Bản đồ tri thức và mạng xã hội học tập trên Neo4j: Biểu diễn quan hệ tiên quyết bài học, gợi ý lộ trình và kết nối Bạn Cùng Tiến (Study Buddies).")
    add_bullet_level1(doc, "Bảo mật hệ thống: Tường lửa Redis Sliding Window Rate Limiter ngăn chặn tấn công từ chối dịch vụ (DDoS) và spam API.")
    add_bullet_level1(doc, "Cơ chế sao lưu và phục hồi dữ liệu đồng bộ (Unified Backup & Restore) cho cả 4 hệ CSDL NoSQL.")

    add_paragraph_huit(doc, 
        "Các nội dung sau không thuộc phạm vi nghiên cứu của đề tài: Tích hợp cổng thanh toán trực tiếp với ngân hàng (sử dụng cơ chế tạo mã VietQR động giả lập và kích hoạt khóa học tức thời); Xây dựng mô hình Deep Learning xử lý tiếng nói (Speech-to-Text) tự huấn luyện; Triển khai cụm phân tán đa vùng địa lý trên đám mây thương mại.",
        "Phạm vi ngoài đề tài (Out-of-Scope): "
    )

    add_heading_level1(doc, "1.4. Phương pháp thực hiện và tiếp cận")
    add_paragraph_huit(doc, 
        "Đề tài áp dụng phương pháp Thiết kế định hướng truy cập (Access Pattern Driven Design) - đây là phương pháp tiếp cận bắt buộc và kinh điển đối với cơ sở dữ liệu NoSQL. Khác với quy trình truyền thống của RDBMS (chuẩn hóa dữ liệu theo các dạng chuẩn 1NF, 2NF, 3NF rồi sau đó mới viết câu lệnh truy vấn), trong NoSQL, nhóm tiến hành khảo sát và liệt kê toàn bộ các câu hỏi nghiệp vụ mà ứng dụng sẽ truy vấn vào cơ sở dữ liệu. Sau đó, cấu trúc lưu trữ của từng bảng, collection, key hay nốt đồ thị sẽ được thiết kế may đo chính xác để phục vụ cho các mẫu truy cập đó với số lượng thao tác I/O ít nhất.",
        "Quy trình thiết kế định hướng truy cập: "
    )

    add_heading_level1(doc, "1.5. Công nghệ sử dụng trong hệ thống")
    add_paragraph_huit(doc, "Toàn bộ hệ thống EduPro được xây dựng dựa trên ngăn xếp công nghệ hiện đại, đảm bảo tính liên kết chặt chẽ giữa tầng ứng dụng và 4 hệ thống lưu trữ:")

    create_huit_table(
        doc,
        "Bảng 1.1: Danh mục công nghệ sử dụng trong hệ thống",
        ["Thành phần", "Công nghệ / Phiên bản", "Vai trò trong hệ sinh thái", "Ghi chú kỹ thuật"],
        [
            ["Backend API", "Node.js 20+ / Express.js", "Xử lý Business Logic, RESTful APIs", "Kiến trúc Service-Repository"],
            ["Frontend", "Vanilla JavaScript ES6 Modular", "Giao diện Web SPA tương tác cao", "5 Modules tách biệt: core, study..."],
            ["Document DB", "MongoDB Community 7.0+", "Lưu Users, Courses, Exams, Results", "Mongoose ODM & Native Driver"],
            ["In-Memory DB", "Redis 7.0+ / Memurai", "Cache, Session, Leaderboard, Rate Limiter", "ioredis Client, Redis Hashes & ZSET"],
            ["Wide-Column", "Apache Cassandra 3.11.17", "Time-series Learning Events, Anti-cheat", "cassandra-driver (CQL native port 9042)"],
            ["Graph DB", "Neo4j Community 5.x", "Knowledge Graph, Lộ trình, Bạn cùng tiến", "neo4j-driver (Bolt protocol port 7687)"],
            ["DevOps / Tool", "Docker, Compass, TablePlus", "Đóng gói container, quản trị GUI trực quan", "Git/GitHub quản lý phiên bản mã nguồn"]
        ],
        [3.0, 3.8, 4.4, 3.8]
    )

    add_heading_level1(doc, "1.6. Kế hoạch triển khai dự án")

    add_heading_level2(doc, "1.6.1. Cơ cấu tổ chức và vai trò thành viên")
    add_paragraph_huit(doc, "Nhóm 18 gồm 3 sinh viên phối hợp chặt chẽ, phân chia trách nhiệm rõ ràng theo từng mảng nghiệp vụ và hệ thống CSDL NoSQL phụ trách:")

    create_huit_table(
        doc,
        "Bảng 1.2: Cơ cấu tổ chức và vai trò của các thành viên",
        ["Họ và tên", "MSSV", "Vai trò chính", "Phụ trách chuyên sâu CSDL"],
        [
            ["Nguyễn Trọng Nguyên", "2001230589", "Nhóm trưởng, Kiến trúc sư hệ thống", "MongoDB, Redis, Cassandra, Neo4j Core"],
            ["Phạm Nguyễn Khôi Nguyên", "2001230578", "Thành viên, Kỹ sư Backend & GUI", "MongoDB Document Model, Redis Cache"],
            ["Võ Huỳnh Gia Huy", "2001230303", "Thành viên, Kỹ sư Dữ liệu & Test", "Apache Cassandra, Neo4j Graph Queries"]
        ],
        [4.2, 2.8, 4.2, 3.8]
    )

    add_heading_level2(doc, "1.6.2. Bảng phân công nhiệm vụ chi tiết")
    add_paragraph_huit(doc, "Tiến độ thực hiện các hạng mục công việc xuyên suốt học kỳ theo chuẩn Bảng 4 của đề cương môn học:")

    create_huit_table(
        doc,
        "Bảng 1.3: Bảng phân công nhiệm vụ chi tiết và tiến độ thực hiện",
        ["Mã", "Nội dung công việc", "Người thực hiện", "Bắt đầu", "Kết thúc", "Sản phẩm bàn giao", "Trạng thái"],
        [
            ["W01", "Khảo sát đề tài & Lập tài liệu SRS", "Nguyễn Trọng Nguyên", "Tuần 1", "Tuần 2", "Nhom_18_SRS.docx", "Hoàn thành"],
            ["W02", "Thiết kế mô hình 4 CSDL NoSQL (SDS)", "Cả 3 thành viên", "Tuần 3", "Tuần 4", "Database_Model.docx", "Hoàn thành"],
            ["W03", "Cài đặt & Seed dữ liệu 4 hệ NoSQL", "Võ Huỳnh Gia Huy", "Tuần 5", "Tuần 6", "Scripts seed CSDL", "Hoàn thành"],
            ["W04", "Hiện thực API MongoDB (Auth, Course)", "P.N. Khôi Nguyên", "Tuần 6", "Tuần 7", "authRoutes, courseRoutes", "Hoàn thành"],
            ["W05", "Hiện thực API Redis (Cache, Thi cử)", "Nguyễn Trọng Nguyên", "Tuần 7", "Tuần 8", "examRoutes, Redis ZSET", "Hoàn thành"],
            ["W06", "Hiện thực Cassandra Time-series Events", "Võ Huỳnh Gia Huy", "Tuần 8", "Tuần 9", "learning_events CQL", "Hoàn thành"],
            ["W07", "Hiện thực Neo4j Graph & Bạn Cùng Tiến", "Nguyễn Trọng Nguyên", "Tuần 8", "Tuần 9", "graphRoutes, peerRoutes", "Hoàn thành"],
            ["W08", "Module hóa Frontend Vanilla ES6", "P.N. Khôi Nguyên", "Tuần 9", "Tuần 10", "public/js (5 modules)", "Hoàn thành"],
            ["W09", "Viết bộ kiểm thử tự động 22 Test Cases", "Nguyễn Trọng Nguyên", "Tuần 10", "Tuần 11", "automated_tests.js (Pass 100%)", "Hoàn thành"],
            ["W10", "Hoàn thiện Báo cáo & Video Demo", "Cả 3 thành viên", "Tuần 11", "Tuần 11", "Báo cáo Word + Video", "Hoàn thành"]
        ],
        [1.2, 3.6, 2.6, 1.4, 1.4, 3.0, 1.8]
    )

    add_heading_level2(doc, "1.6.3. Quy trình phát triển phần mềm (SDLC)")
    add_paragraph_huit(doc, 
        "Nhóm áp dụng mô hình Agile / Scrum rút gọn với chu kỳ Sprint kéo dài 2 tuần. Quy trình phát triển bao gồm các giai đoạn lặp: Lập kế hoạch ➔ Thiết kế Schema NoSQL ➔ Xây dựng API Endpoint ➔ Tích hợp Giao diện người dùng ➔ Kiểm thử hồi quy tự động. Việc sử dụng mô hình phân nhánh Git Flow (nhánh main và các nhánh feature riêng biệt) giúp các thành viên làm việc độc lập, giảm thiểu xung đột mã nguồn và kiểm soát chất lượng qua từng lần commit.",
        "Mô hình phát triển Agile/Scrum: "
    )

    add_heading_level2(doc, "1.6.4. Lịch trình và các mốc quan trọng")
    add_paragraph_huit(doc, "Lịch trình thực hiện và bàn giao các sản phẩm đồ án theo quy định của Khoa Công nghệ Thông tin - HUIT:")

    create_huit_table(
        doc,
        "Bảng 1.4: Lịch trình thực hiện và các mốc bàn giao sản phẩm",
        ["Giai đoạn", "Nội dung thực hiện", "Sản phẩm bàn giao", "Mốc thời gian"],
        [
            ["Giai đoạn 1", "Khảo sát yêu cầu, xác định bài toán NoSQL", "Tài liệu đặc tả yêu cầu SRS", "Tuần 6"],
            ["Giai đoạn 2", "Thiết kế Database Model & Kiến trúc đa mô hình", "Tài liệu đặc tả thiết kế SDS", "Tuần 7"],
            ["Giai đoạn 3", "Lập trình ứng dụng, tích hợp 4 CSDL, kiểm thử", "Mã nguồn, Test Suite 22 TCs", "Tuần 10"],
            ["Giai đoạn 4", "Nghiệm thu đồ án, báo cáo hội đồng & demo", "Báo cáo hoàn chỉnh, Video demo", "Tuần 11"]
        ],
        [2.5, 5.0, 5.0, 2.5]
    )

    add_heading_level2(doc, "1.6.5. Công nghệ và công cụ phát triển")
    add_paragraph_huit(doc, "Hệ thống công cụ phục vụ phát triển, quản lý mã nguồn và quản trị cơ sở dữ liệu bao gồm:")
    add_bullet_level1(doc, "Môi trường phát triển tích hợp: Visual Studio Code, Node.js Runtime phiên bản 20+.")
    add_bullet_level1(doc, "Công cụ kiểm thử API: Postman Collection, Node.js Native Test Runner.")
    add_bullet_level1(doc, "Công cụ giao diện đồ họa (GUI Tool): MongoDB Compass, RedisInsight, TablePlus Community, Neo4j Desktop 2.")
    add_bullet_level1(doc, "Hệ thống quản lý phiên bản mã nguồn: Git, GitHub Repository (https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git).")

    add_heading_level2(doc, "1.6.6. Kế hoạch kiểm thử hệ thống")
    add_paragraph_huit(doc, 
        "Hệ thống kiểm thử được thiết kế theo 3 tầng nghiêm ngặt nhằm đảm bảo tính toàn vẹn và độ tin cậy cao nhất:\n"
        "– Kiểm thử đơn vị (Unit Testing): Kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation Middleware), hàm tính điểm thi và thuật toán xếp hạng.\n"
        "– Kiểm thử tích hợp (Integration Testing): Kiểm tra kết nối và truy vấn trực tiếp trên 4 CSDL NoSQL thật đang chạy (không sử dụng mock).\n"
        "– Kịch bản kiểm thử tự động toàn diện (Automated End-to-End Suite): File automated_tests.js thực thi tuần tự 22 kịch bản từ TC-01 đến TC-22, đo lường thời gian phản hồi và tính toàn vẹn dữ liệu xuyên suốt các tầng kiến trúc.",
        "Chiến lược kiểm thử đa tầng: "
    )

    doc.add_page_break()

    # =============================================================
    # CHƯƠNG 2: TỔNG QUAN NOSQL VÀ TÌM HIỂU TOOL
    # =============================================================
    add_heading_chapter(doc, "CHƯƠNG 2: TỔNG QUAN NOSQL VÀ TÌM HIỂU TOOL")

    add_heading_level1(doc, "2.1. Tổng quan về Cơ sở dữ liệu NoSQL")

    add_heading_level2(doc, "2.1.1. Lịch sử hình thành và thuật ngữ NoSQL")
    add_paragraph_huit(doc, 
        "Thuật ngữ 'NoSQL' lần đầu tiên xuất hiện vào năm 1998 bởi Carlo Strozzi khi ông phát triển một cơ sở dữ liệu quan hệ mã nguồn mở không sử dụng giao diện ngôn ngữ SQL. Tuy nhiên, khái niệm NoSQL theo nghĩa hiện đại được tái định nghĩa vào đầu năm 2009 bởi Johan Oskarsson nhằm diễn tả một phong trào công nghệ mới: các hệ cơ sở dữ liệu phân tán, phi quan hệ, có khả năng mở rộng quy mô theo chiều ngang (Scale-Out) và không bị ràng buộc bởi các quy chuẩn khắt khe của mô hình quan hệ.",
        "Nguồn gốc lịch sử: "
    )
    add_paragraph_huit(doc, 
        "Ngày nay, NoSQL được hiểu phổ biến là 'Not Only SQL' (Không chỉ có SQL), ngụ ý rằng các hệ thống hiện đại không hoàn toàn chối bỏ SQL mà kết hợp linh hoạt nhiều mô hình lưu trữ dữ liệu khác nhau để đạt được hiệu năng và độ co giãn tối ưu nhất cho từng loại tác vụ nghiệp vụ.",
        "Ý nghĩa thuật ngữ 'Not Only SQL': "
    )

    add_heading_level2(doc, "2.1.2. So sánh toàn diện giữa NoSQL và RDBMS")
    add_paragraph_huit(doc, "Bảng đối sánh toàn diện giữa mô hình quan hệ truyền thống và cơ sở dữ liệu NoSQL hiện đại theo 8 tiêu chuẩn kỹ thuật:")

    create_huit_table(
        doc,
        "Bảng 2.1: So sánh toàn diện giữa hệ quản trị RDBMS và NoSQL",
        ["Tiêu chí đối sánh", "Hệ quản trị quan hệ (RDBMS)", "Hệ quản trị NoSQL"],
        [
            ["Mô hình dữ liệu", "Bảng 2 chiều gồm dòng và cột (Tabular).", "Đa dạng: Document (JSON/BSON), Key-Value, Column-Family, Graph."],
            ["Lược đồ dữ liệu", "Cố định (Fixed Schema), bắt buộc DDL trước.", "Linh hoạt (Schema-Free / Dynamic Schema), dễ mở rộng cấu trúc."],
            ["Mô hình mở rộng", "Mở rộng theo chiều dọc (Scale-Up: nâng CPU, RAM).", "Mở rộng theo chiều ngang (Scale-Out: thêm máy chủ phổ thông)."],
            ["Giao dịch & Nhất quán", "Tuân thủ nghiêm ngặt tính chất ACID (Nhất quán mạnh).", "Tuân thủ mô hình BASE (Nhất quán cuối cùng - Eventual Consistency)."],
            ["Khả năng chịu lỗi", "Phức tạp, chi phí cao (cần giải pháp phần cứng đắt tiền).", "Tích hợp sẵn cơ chế tự động nhân bản (Auto-Replication) và chịu lỗi."],
            ["Hiệu năng ghi", "Bị giới hạn bởi cơ chế Transaction Lock và Index B-Tree.", "Tối ưu hóa ghi cực cao (In-Memory, Log-Structured Merge Tree)."],
            ["Độ phức tạp quan hệ", "Hỗ trợ JOIN nhiều bảng mạnh mẽ nhưng chậm khi phình to.", "Hạn chế JOIN; riêng Graph Database giải quyết quan hệ cực nhanh."],
            ["Trường hợp sử dụng", "Tài chính ngân hàng, kế toán, ERP, thanh toán cốt lõi.", "Mạng xã hội, E-learning, Big Data, IoT, Real-time Leaderboard."]
        ],
        [3.5, 5.5, 6.0]
    )

    add_heading_level2(doc, "2.1.3. Ưu điểm và nhược điểm của cơ sở dữ liệu NoSQL")
    add_paragraph_huit(doc, 
        "Hệ cơ sở dữ liệu NoSQL sở hữu các ưu điểm vượt trội bao gồm: Khả năng mở rộng quy mô theo chiều ngang gần như vô hạn mà không đòi hỏi phần cứng chuyên dụng đắt đỏ; Tốc độ đọc và ghi dữ liệu siêu nhanh nhờ kiến trúc tối ưu hóa bộ nhớ RAM hoặc cấu trúc Append-Only tuần tự; Cho phép phát triển ứng dụng nhanh chóng nhờ cấu trúc tài liệu mềm dẻo, không cần chạy các câu lệnh khóa bảng để thay đổi lược đồ.",
        "Ưu điểm nổi bật: "
    )
    add_paragraph_huit(doc, 
        "Bên cạnh các ưu thế vượt bậc, NoSQL tồn tại một số nhược điểm cần lưu ý: Hầu hết các hệ NoSQL không hỗ trợ đầy đủ các giao dịch ACID đa bảng phức tạp (trừ mức độ Document-level ACID); Khả năng kiểm tra ràng buộc toàn vẹn tham chiếu (Foreign Key) phải do tầng ứng dụng tự xử lý; Cú pháp truy vấn chưa được chuẩn hóa hoàn toàn giữa các nhà phát triển.",
        "Nhược điểm và hạn chế: "
    )

    add_heading_level2(doc, "2.1.4. Hệ quy chiếu giao dịch ACID so với BASE")
    add_paragraph_huit(doc, 
        "Trong khi RDBMS đặt trọn niềm tin vào hệ quy chiếu ACID (Atomicity - Nguyên tử, Consistency - Nhất quán, Isolation - Cô lập, Durability - Bền vững) để đảm bảo dữ liệu luôn chính xác 100% tại mọi thời điểm, thì các hệ NoSQL phân tán chấp nhận đánh đổi để đạt được tính sẵn sàng cao thông qua mô hình BASE:",
        "Đối sánh mô hình ACID và BASE: "
    )
    add_bullet_level1(doc, "Basically Available (Khả dụng cơ bản): Hệ thống đảm bảo tính sẵn sàng phục vụ các yêu cầu của người dùng, ngay cả khi một số nốt mạng gặp sự cố (có thể phản hồi chậm hoặc suy giảm tính năng nhẹ nhưng không sập toàn bộ hệ thống).")
    add_bullet_level1(doc, "Soft state (Trạng thái mềm): Trạng thái của dữ liệu có thể biến động theo thời gian mà không cần sự tương tác trực tiếp của người dùng, do quá trình đồng bộ ngầm giữa các nốt bản sao.")
    add_bullet_level1(doc, "Eventual consistency (Nhất quán cuối cùng): Dữ liệu không nhất thiết phải đồng nhất tức thì tại thời điểm ghi trên tất cả các nốt, nhưng hệ thống đảm bảo đến một thời điểm nào đó trong tương lai, tất cả các bản sao sẽ hội tụ về cùng một giá trị chính xác.")

    add_heading_level2(doc, "2.1.5. Định lý CAP và định lý mở rộng PACELC")
    add_paragraph_huit(doc, 
        "Định lý CAP (do Eric Brewer công bố năm 2000) khẳng định rằng: Trong một hệ thống phân tán, khi xảy ra hiện tượng phân vùng mạng (Network Partition - P), hệ thống chỉ có thể lựa chọn thỏa mãn một trong hai yếu tố: Tính nhất quán (Consistency - C) hoặc Tính sẵn sàng (Availability - A), không bao giờ có thể đạt được đồng thời cả ba yếu tố.",
        "Định lý CAP của Eric Brewer: "
    )
    add_bullet_level1(doc, "Consistency (C - Tính nhất quán): Mọi thao tác đọc đều nhận được dữ liệu được ghi mới nhất hoặc trả về lỗi.")
    add_bullet_level1(doc, "Availability (A - Tính sẵn sàng): Mọi yêu cầu gửi đến đều nhận được phản hồi thành công (không bị lỗi), nhưng không đảm bảo đó là dữ liệu mới nhất.")
    add_bullet_level1(doc, "Partition Tolerance (P - Khả năng chịu phân vùng mạng): Hệ thống vẫn tiếp tục vận hành ngay cả khi các liên kết mạng giữa các cụm máy chủ bị đứt đoạn hoặc trễ gói tin.")

    add_paragraph_huit(doc, 
        "Định lý mở rộng PACELC của Daniel Abadi hoàn thiện định lý CAP bằng cách xem xét cả trạng thái bình thường (khi không có sự cố phân vùng mạng):\n"
        "– Nếu có Partition (P): Hệ thống chọn giữa Availability (A) hay Consistency (C).\n"
        "– Else (E - Ngược lại khi mạng hoạt động bình thường): Hệ thống đánh đổi giữa Latency (L - Độ trễ thấp) hay Consistency (C - Tính nhất quán cao).\n"
        "Áp dụng vào 4 hệ CSDL trong đề tài: MongoDB thuộc nhóm PC/EC (ưu tiên nhất quán trong mọi trường hợp); Apache Cassandra thuộc nhóm PA/EL (khi có sự cố mạng ưu tiên sẵn sàng, khi bình thường ưu tiên độ trễ cực thấp); Redis thuộc nhóm PC/EL (bộ nhớ RAM đem lại độ trễ thấp nhất).",
        "Định lý mở rộng PACELC: "
    )

    add_heading_level1(doc, "2.2. Kỹ thuật phân tán dữ liệu trong NoSQL")

    add_heading_level2(doc, "2.2.1. Kỹ thuật phân mảnh dữ liệu (Sharding / Partitioning)")
    add_paragraph_huit(doc, 
        "Để xử lý khối lượng dữ liệu khổng lồ vượt quá sức chứa của một máy chủ vật lý, NoSQL áp dụng kỹ thuật phân mảnh dữ liệu (Sharding). Cassandra sử dụng thuật toán Băm nhất quán (Consistent Hashing) trên vòng tròn Token Ring để phân bổ dữ liệu đồng đều giữa các nốt trong cụm, loại bỏ hoàn toàn điểm nghẽn tập trung.",
        "Phân mảnh dữ liệu theo Hash nhất quán: "
    )

    add_heading_level2(doc, "2.2.2. Kỹ thuật sao chép dữ liệu (Replication)")
    add_paragraph_huit(doc, 
        "Sao chép dữ liệu là kỹ thuật nhân bản dữ liệu sang nhiều nốt nhằm đảm bảo an toàn và tính sẵn sàng cao. MongoDB sử dụng mô hình Master-Slave (Replica Set) với 1 nốt Primary tiếp nhận ghi và các nốt Secondary đồng bộ phục vụ đọc. Ngược lại, Cassandra sử dụng mô hình Masterless (Peer-to-Peer) phi tập trung hoàn toàn, nơi mọi nốt đều bình đẳng và có khả năng tiếp nhận yêu cầu từ ứng dụng.",
        "Mô hình Master-Slave so với Peer-to-Peer: "
    )

    add_heading_level2(doc, "2.2.3. Các mức độ nhất quán dữ liệu (Consistency Levels)")
    add_paragraph_huit(doc, 
        "Cassandra cung cấp cơ chế Mức độ nhất quán có thể điều chỉnh (Tunable Consistency). Người lập trình có thể linh hoạt chọn mức độ nhất quán trên từng câu truy vấn: ONE (nhanh nhất), QUORUM (đa số: R + W > N đảm bảo luôn đọc được dữ liệu mới nhất) hoặc ALL (chờ tất cả các nốt phản hồi).",
        "Cơ chế Tunable Consistency: "
    )

    add_heading_level1(doc, "2.3. Phân loại 4 mô hình NoSQL cốt lõi")
    add_paragraph_huit(doc, "Bảng phân loại chuẩn 4 mô hình cơ sở dữ liệu NoSQL theo quy chuẩn Bảng 6 của đề cương môn học:")

    create_huit_table(
        doc,
        "Bảng 2.2: Phân loại 4 mô hình cơ sở dữ liệu NoSQL cốt lõi",
        ["Mô hình NoSQL", "Đặc trưng lưu trữ", "Mạnh nhất khi xử lý", "Hệ quản trị tiêu biểu"],
        [
            ["Document Store", "Tài liệu JSON / BSON phân cấp, không cố định cấu trúc.", "Nội dung đa dạng, hồ sơ người dùng, bài thi, câu hỏi trắc nghiệm.", "MongoDB, Couchbase, ArangoDB."],
            ["Key-Value Store", "Cặp khóa - giá trị đơn giản, truy cập qua Key duy nhất.", "Cache tốc độ cao, Session, Giỏ hàng, Leaderboard điểm số.", "Redis, Memcached, DynamoDB."],
            ["Wide-Column Store", "Bảng gồm các họ cột (Column Families), khóa phân vùng.", "Dữ liệu chuỗi thời gian (Time-series), Log hệ thống, I/O ghi cực lớn.", "Apache Cassandra, ScyllaDB, HBase."],
            ["Graph Database", "Đồ thị gồm các Nốt (Nodes) và Quan hệ (Edges/Relationships).", "Mạng xã hội, đường đi ngắn nhất, gợi ý sản phẩm, lộ trình học tập.", "Neo4j, Amazon Neptune, OrientDB."]
        ],
        [3.0, 4.0, 4.8, 3.2]
    )

    add_heading_level1(doc, "2.4. Các hệ quản trị cơ sở dữ liệu đề tài sử dụng")

    add_heading_level2(doc, "2.4.1. Hệ quản trị MongoDB (Mô hình Document Store)")
    add_paragraph_huit(doc, 
        "MongoDB là hệ quản trị CSDL NoSQL hướng tài liệu phổ biến nhất hiện nay. Dữ liệu trong MongoDB được tổ chức dưới dạng các Document tuân theo định dạng BSON (Binary JSON), cho phép lưu trữ các trường dữ liệu có cấu trúc lồng nhau (Nested Objects) và các mảng giá trị (Arrays). Cấu trúc phân cấp gồm: Database ➔ Collection ➔ Document ➔ Field.",
        "Đặc điểm kiến trúc & Cấu trúc BSON: "
    )
    add_paragraph_huit(doc, 
        "Trong đề tài EduPro, cơ sở dữ liệu elearning_nosql áp dụng kết hợp hai chiến lược thiết kế: Nhúng tài liệu (Embedded) đối với các phương án trả lời trắc nghiệm (options) bên trong câu hỏi để đọc nhanh trong 1 truy vấn; và Tham chiếu tài liệu (Reference) đối với kết quả bài thi (Result) lưu userId và examId dạng ObjectId để tránh phình to dữ liệu lặp lại.",
        "Thiết kế Embedded và Reference: "
    )
    add_paragraph_huit(doc, 
        "MongoDB hỗ trợ cơ chế Aggregation Pipeline vô cùng mạnh mẽ với các toán tử $match, $group, $sort, $lookup, $unwind, $project. Điều này cho phép thực hiện các thống kê phân tích điểm thi, phổ điểm của học viên trực tiếp trên tầng cơ sở dữ liệu với tốc độ cao.",
        "Cơ chế Aggregation Pipeline: "
    )

    add_heading_level2(doc, "2.4.2. Hệ quản trị Redis (Mô hình In-Memory Key-Value Store)")
    add_paragraph_huit(doc, 
        "Redis (Remote Dictionary Server) là kho lưu trữ cấu trúc dữ liệu trên bộ nhớ RAM (In-Memory Data Structure Store). Nhờ kiến trúc đơn luồng (Single-Threaded Event Loop) kết hợp cơ chế I/O Multiplexing, Redis loại bỏ hoàn toàn hiện tượng tranh chấp khóa (Lock Contention) và đạt tốc độ xử lý hàng trăm nghìn thao tác trên giây với độ trễ dưới 1 mili-giây.",
        "Kiến trúc In-Memory đơn luồng: "
    )
    add_paragraph_huit(doc, 
        "Đề tài EduPro khai thác triệt để các cấu trúc dữ liệu phong phú của Redis:\n"
        "– String: Lưu trữ chuỗi JSON của danh mục khóa học đã xuất bản (cache:courses:catalog:published) với cơ chế hết hạn thời gian (TTL = 1800 giây).\n"
        "– Hash: Quản lý phiên làm bài thi trực tiếp (exam:examId:answers:studentId). Mỗi câu trả lời của thí sinh được lưu tức thời vào một field trong Hash mà không cần ghi đè toàn bộ đối tượng.\n"
        "– Sorted Set (ZSET): Đây là cấu trúc xuất sắc nhất của Redis để xây dựng Bảng xếp hạng tuần (leaderboard:weekly). Các phần tử được sắp xếp tự động theo điểm số (Score) dựa trên cấu trúc dữ liệu SkipList, cho phép lấy Top 10 học viên bằng lệnh ZREVRANGEBYSCORE với độ phức tạp thuật toán chỉ O(log(N) + M).\n"
        "– Set: Quản lý danh sách đen các IP vi phạm (security:blacklist:ips) phục vụ kiểm tra tức thời bằng lệnh SISMEMBER với độ phức tạp O(1).\n"
        "– Pub/Sub: Kênh phát sóng thông báo thời gian thực (system_notifications) cập nhật khi có học viên đạt điểm tuyệt đối hoặc kết nối bạn học mới.",
        "Cấu trúc dữ liệu chuyên sâu: "
    )
    add_paragraph_huit(doc, 
        "Mặc dù dữ liệu lưu trên RAM, Redis vẫn đảm bảo tính bền vững thông qua 2 cơ chế: Chụp ảnh bộ nhớ định kỳ (RDB Snapshotting) và ghi nhật ký mọi thao tác ghi (Append-Only File - AOF), cho phép phục hồi 100% dữ liệu khi khởi động lại.",
        "Cơ chế bền vững dữ liệu: "
    )

    add_heading_level2(doc, "2.4.3. Hệ quản trị Apache Cassandra (Mô hình Wide-Column Family Store)")
    add_paragraph_huit(doc, 
        "Apache Cassandra được thiết kế dựa trên sự kết hợp tinh hoa giữa kiến trúc phân tán Dynamo của Amazon và mô hình dữ liệu Bigtable của Google. Cassandra vận hành theo kiến trúc hoàn toàn không có nốt chủ (Masterless / Peer-to-Peer), không có điểm chết đơn lẻ (No Single Point of Failure).",
        "Kiến trúc phân tán Masterless: "
    )
    add_paragraph_huit(doc, 
        "Trong đề tài, Keyspace elearning_tracking được tạo với chiến lược SimpleStrategy và replication_factor = 1. Khóa chính của bảng learning_events gồm hai thành phần:\n"
        "– Partition Key: student_id xác định nốt vật lý lưu trữ bản ghi theo thuật toán băm Murmur3Partitioner.\n"
        "– Clustering Key: event_time quy định thứ tự sắp xếp vật lý giảm dần của dữ liệu bên trong nốt (đọc log mới nhất cực nhanh).",
        "Thiết kế Partition Key và Clustering Key: "
    )
    add_paragraph_huit(doc, 
        "Khi ghi dữ liệu, Cassandra ghi tuần tự vào Commit Log trên đĩa và đồng thời ghi vào cấu trúc Memtable trên RAM. Khi Memtable đầy, nó được xả (flush) bất đồng bộ xuống các tập tin bất biến SSTable (Sorted String Table). Nhờ cơ chế chỉ ghi thêm nối đuôi (Append-Only) không cần lock, Cassandra đạt tốc độ ghi nhanh nhất trong các hệ NoSQL.",
        "Quy trình ghi tối ưu (Write Path): "
    )
    add_paragraph_huit(doc, 
        "Bảng nhật ký vi phạm thi cử (exam_violations) sử dụng mệnh đề USING TTL 604800 (tự hủy sau 7 ngày). Cassandra tự động xóa bỏ các bản ghi đã quá hạn bằng cơ chế Tombstone trong quá trình Compaction mà không cần can thiệp từ phía ứng dụng.",
        "Cơ chế tự hủy bản ghi (TTL): "
    )

    add_heading_level2(doc, "2.4.4. Hệ quản trị Neo4j (Mô hình Graph Database)")
    add_paragraph_huit(doc, 
        "Neo4j là hệ quản trị cơ sở dữ liệu đồ thị hàng đầu thế giới được xây dựng trên mô hình Đồ thị thuộc tính có nhãn (Labeled Property Graph - LPG). Khác biệt đột phá nhất của Neo4j nằm ở cơ chế Index-free Adjacency: mỗi nốt trực tiếp lưu trữ con trỏ trỏ tới các nốt lân cận của nó trong bộ nhớ vật lý. Nhờ vậy, khi duyệt qua các mối quan hệ (traversal), độ phức tạp chỉ là O(1) cho mỗi bước nhảy, hoàn toàn độc lập với tổng kích thước dữ liệu của toàn bộ đồ thị.",
        "Đột phá công nghệ Index-free Adjacency: "
    )
    add_paragraph_huit(doc, 
        "Đồ thị tri thức EduPro bao gồm 5 loại nốt: Course (Khóa học), Topic (Chủ điểm kiến thức), Lesson (Bài học CEFR), Skill (Kỹ năng đầu ra) và User (Học viên). Các nốt kết nối chặt chẽ qua 5 loại quan hệ có hướng: CONTAINS, COVERS, PREREQUISITE_OF, DEVELOPS và ENROLLED_IN.",
        "Thành phần đồ thị tri thức EduPro: "
    )
    add_paragraph_huit(doc, 
        "Neo4j sử dụng ngôn ngữ truy vấn khai báo Cypher mang tính trực quan cao. Mệnh đề MATCH cho phép nhận diện các mẫu đồ thị phức tạp như tìm đường đi ngắn nhất (shortestPath) hoặc tìm giao điểm bạn cùng tiến (Co-enrollment Intersection) chỉ trong vài dòng lệnh ngắn gọn và dễ hiểu.",
        "Ngôn ngữ Cypher trực quan: "
    )

    add_heading_level1(doc, "2.5. Tìm hiểu và khảo sát công cụ quản trị giao diện (GUI Tools)")
    add_paragraph_huit(doc, 
        "Để phục vụ công tác giám sát, bảo trì và trực quan hóa dữ liệu trong quá trình phát triển và báo cáo đồ án, nhóm đã tiến hành cài đặt, khảo sát và sử dụng 4 công cụ giao diện đồ họa (GUI Tool) chính thức cho 4 hệ CSDL. Bảng đánh giá chi tiết theo 4 tiêu chí chuẩn barem điểm của Giảng viên (Bảng 7 trong đề cương hướng dẫn):",
        "Khảo sát và đánh giá công cụ GUI: "
    )

    create_huit_table(
        doc,
        "Bảng 2.3: Khảo sát và đánh giá 4 công cụ giao diện đồ họa (GUI Tools)",
        ["Công cụ GUI", "Tiêu chí 1: Cài đặt & Kết nối", "Tiêu chí 2: Tính năng nổi bật", "Tiêu chí 3: Đánh giá & So sánh"],
        [
            [
                "MongoDB Compass",
                "Cài đặt dạng Desktop App trên Windows/macOS. Kết nối trực tiếp qua URI mongodb://localhost:27017.",
                "Trực quan hóa Document JSON, cây thư mục Collection, công cụ xây dựng Aggregation Pipeline trực quan, Visual Explain Plan xem index.",
                "Trực quan và dễ dùng nhất cho Document DB. Vượt trội hơn dòng lệnh mongosh khi kiểm tra dữ liệu lồng nhau."
            ],
            [
                "RedisInsight",
                "Phần mềm đồ họa chính thức của Redis Labs. Kết nối qua cổng 6379, hỗ trợ bảo mật mật khẩu.",
                "Giao diện phân tích bộ nhớ (Memory Profiler), trình duyệt trực quan cấu trúc Sorted Set (ZSET) và Hash, tích hợp Workbench CLI chạy lệnh thời gian thực.",
                "Mạnh mẽ hơn Another Redis Desktop Manager nhờ tính năng gợi ý cú pháp lệnh và trực quan hóa tỷ lệ chiếm dụng RAM theo từng nhóm Key."
            ],
            [
                "TablePlus\n(và DBeaver)",
                "Cài đặt nhẹ nhàng, giao diện bản địa native. Kết nối Cassandra qua driver JDBC/Native Transport cổng 9042.",
                "Giao diện bảng tính (Spreadsheet Mode) chỉnh sửa trực tiếp, hỗ trợ soạn thảo CQL Editor với tính năng tự động hoàn thành từ khóa, duyệt cây Keyspaces.",
                "Nhanh và nhẹ hơn hẳn DataStax Studio. Chế độ bảng tính xem log time-series trực quan và dễ hiểu nhất cho giảng viên."
            ],
            [
                "Neo4j Desktop &\nNeo4j Browser",
                "Neo4j Desktop quản lý cụm DBMS; Neo4j Browser tích hợp sẵn giao diện Web tại cổng 7474.",
                "Vẽ đồ thị tương tác vật lý (Physics Force Layout), các nốt tròn đa màu sắc có thể kéo thả, phóng to thu nhỏ, hiển thị nhãn và thuộc tính khi click.",
                "Vượt trội hoàn toàn so với việc xem bảng dữ liệu dòng cột truyền thống. Giúp người xem nhìn thấy ngay lập tức bản chất mạng lưới của đồ thị tri thức."
            ]
        ],
        [3.0, 4.0, 4.8, 3.2]
    )

    add_paragraph_huit(doc, 
        "Việc làm chủ cả 4 công cụ giao diện trên giúp nhóm tự tin biểu diễn trực tiếp các thao tác dữ liệu biến động thời gian thực (Live Demonstration) khi bảo vệ đồ án trước Hội đồng chấm điểm của Khoa Công nghệ Thông tin - HUIT.",
        "Kết luận Chương 2: "
    )

    # =============================================================
    # CHƯƠNG 3: ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) - IEEE 830 / ISO 29148
    # =============================================================
    helpers = {
        'add_heading_chapter': add_heading_chapter,
        'add_heading_level1': add_heading_level1,
        'add_heading_level2': add_heading_level2,
        'add_heading_level3': add_heading_level3,
        'add_table_title': add_table_title,
        'add_figure_title': add_figure_title,
        'add_paragraph_huit': add_paragraph_huit,
        'add_bullet_level1': add_bullet_level1,
        'add_bullet_level2': add_bullet_level2,
        'create_huit_table': create_huit_table,
        'add_figure_huit': add_figure_huit,
        'assets_dir': r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\06_Bao_Cao_Ket_Qua_Do_An\report_assets'
    }
    add_chapter_3(doc, helpers)

    # =============================================================
    # CHƯƠNG 4: ĐẶC TẢ THIẾT KẾ PHẦN MỀM (SDS) - IEEE 1016
    # =============================================================
    add_chapter_4(doc, helpers)

    # =============================================================
    # CHƯƠNG 5: XÂY DỰNG CSDL VÀ TRUY VẤN TRÊN GUI TOOL
    # =============================================================
    add_chapter_5(doc, helpers)

    # =============================================================
    # CHƯƠNG 6: KẾT NỐI ỨNG DỤNG VÀ DEMO
    # =============================================================
    add_chapter_6(doc, helpers)

    # =============================================================
    # CHƯƠNG 7: KIỂM THỬ VÀ ĐÁNH GIÁ HIỆU NĂNG
    # =============================================================
    add_chapter_7(doc, helpers)

    # =============================================================
    # CHƯƠNG 8: KẾT QUẢ ĐẠT ĐƯỢC VÀ TỔNG KẾT HOẠT ĐỘNG NHÓM
    # =============================================================
    add_chapter_8(doc, helpers)

    # =============================================================
    # TÀI LIỆU THAM KHẢO
    # =============================================================
    add_references(doc, helpers)


    # Lưu ra cả 2 thư mục: TÀI LIỆU FINAL và 03_Tai_Lieu_Do_An
    for p in output_paths:
        try:
            doc.save(p)
            print(f"✅ Đã lưu tệp Word chuẩn thể thức HUIT tại: {p}")
        except PermissionError:
            alt_path = p.replace('.docx', '_CHUAN_THE_THUC_HUIT.docx')
            doc.save(alt_path)
            print(f"⚠️ Tệp đang mở trong Word nên đã lưu bản mới tại: {alt_path}")

if __name__ == '__main__':
    paths = [
        r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\TÀI LIỆU FINAL\BAO_CAO_NOSQL_EDUPRO_ACADEMY_FINAL.docx',
        r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\06_Bao_Cao_Ket_Qua_Do_An\BAO_CAO_NOSQL_EDUPRO_ACADEMY_FINAL.docx'
    ]
    generate_full_document(paths)
