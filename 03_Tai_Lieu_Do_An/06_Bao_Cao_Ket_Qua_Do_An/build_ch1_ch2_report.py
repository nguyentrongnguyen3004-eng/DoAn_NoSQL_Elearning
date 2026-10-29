# -*- coding: utf-8 -*-
"""
Script xây dựng hoàn chỉnh Chương 1 & Chương 2 cho Báo cáo Đồ án NoSQL
Nhóm 18 - Đại học Công Thương TP.HCM (HUIT)
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            border = OxmlElement(f'w:{edge}')
            border.set(qn('w:val'), edge_data.get('val', 'single'))
            border.set(qn('w:sz'), str(edge_data.get('sz', 4)))
            border.set(qn('w:space'), '0')
            border.set(qn('w:color'), edge_data.get('color', 'CCCCCC'))
            tcBorders.append(border)
    tcPr.append(tcBorders)

def add_header_styled(doc, text, level):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.bold = True
    
    if level == 1:
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(15, 44, 89)
    elif level == 2:
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(31, 78, 121)
    elif level == 3:
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        run.font.size = Pt(13)
        run.font.italic = True
        run.font.color.rgb = RGBColor(46, 91, 130)
    return p

def add_body_p(doc, text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(13)
        r_pre.bold = True
        r_pre.font.color.rgb = RGBColor(20, 20, 20)
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.italic = italic
    r.font.color.rgb = RGBColor(35, 35, 35)
    return p

def add_callout_box(doc, text, title="GHI CHÚ KIẾN TRÚC & NGUYÊN TẮC THIẾT KẾ"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, 'F0F4F8')
    set_cell_margins(cell, top=140, bottom=140, left=180, right=140)
    set_cell_border(cell, 
                    left={'sz': 24, 'val': 'single', 'color': '1F4E79'},
                    top={'sz': 4, 'val': 'single', 'color': 'D0D7DE'},
                    bottom={'sz': 4, 'val': 'single', 'color': 'D0D7DE'},
                    right={'sz': 4, 'val': 'single', 'color': 'D0D7DE'})
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    r_title = p.add_run(f"📌 {title}\n")
    r_title.font.name = 'Times New Roman'
    r_title.bold = True
    r_title.font.size = Pt(12)
    r_title.font.color.rgb = RGBColor(31, 78, 121)
    
    r_body = p.add_run(text)
    r_body.font.name = 'Times New Roman'
    r_body.font.size = Pt(12)
    r_body.italic = True
    r_body.font.color.rgb = RGBColor(50, 50, 50)
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(4)

def format_custom_table(table, col_widths, headers, data):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], '1F4E79')
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(11)
            r.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            
    for row_idx, row_data in enumerate(data):
        row_cells = table.add_row().cells
        bg_color = 'F8FAFC' if row_idx % 2 == 1 else 'FFFFFF'
        for col_idx, text in enumerate(row_data):
            row_cells[col_idx].text = str(text)
            set_cell_background(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], top=90, bottom=90, left=100, right=100)
            set_cell_border(row_cells[col_idx], 
                            top={'sz': 4, 'val': 'single', 'color': 'CBD5E1'},
                            bottom={'sz': 4, 'val': 'single', 'color': 'CBD5E1'},
                            left={'sz': 4, 'val': 'single', 'color': 'CBD5E1'},
                            right={'sz': 4, 'val': 'single', 'color': 'CBD5E1'})
            p = row_cells[col_idx].paragraphs[0]
            p.paragraph_format.line_spacing = 1.2
            p.paragraph_format.space_after = Pt(2)
            if col_idx == 0 or len(str(text)) <= 5:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(10.5)
                r.font.color.rgb = RGBColor(35, 35, 35)
                
    for row in table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = Inches(w)

def build_report():
    doc = docx.Document()
    
    # Page Margins (A4 chuẩn: Top 2cm, Bottom 2cm, Left 3cm, Right 2cm)
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.79)     # 2.0 cm
        s.bottom_margin = Inches(0.79)  # 2.0 cm
        s.left_margin = Inches(1.18)    # 3.0 cm đóng gáy sách
        s.right_margin = Inches(0.79)   # 2.0 cm
        s.page_width = Inches(8.27)     # A4
        s.page_height = Inches(11.69)

    # -------------------------------------------------------------
    # BÌA VÀ TIÊU ĐỀ BÁO CÁO
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_inst.add_run("BỘ CÔNG THƯƠNG\nTRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP. HỒ CHÍ MINH (HUIT)\nKHOA CÔNG NGHỆ THÔNG TIN - BỘ MÔN CƠ SỞ DỮ LIỆU\n------------------------o0o------------------------\n\n")
    r_inst.font.name = 'Times New Roman'
    r_inst.font.size = Pt(13)
    r_inst.bold = True
    r_inst.font.color.rgb = RGBColor(15, 44, 89)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("BÁO CÁO ĐỒ ÁN HỌC PHẦN: DỮ LIỆU NOSQL\n")
    r_title.font.name = 'Times New Roman'
    r_title.font.size = Pt(18)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(15, 44, 89)

    r_sub = p_title.add_run("ĐỀ TÀI: XÂY DỰNG NỀN TẢNG E-LEARNING & KHẢO SÁT NĂNG LỰC TIẾNG ANH THỰC CHIẾN TÍCH HỢP ĐA MÔ HÌNH NOSQL (EDUPRO ACADEMY)\n\n")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(15)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(31, 78, 121)

    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_info = p_info.add_run(
        "Nhóm thực hiện: NHÓM 18 - LỚP 14DHTH\n"
        "Thành viên 1: Nguyễn Trọng Nguyên - MSSV: 2001230589 (Nhóm trưởng)\n"
        "Thành viên 2: Phạm Nguyễn Khôi Nguyên - MSSV: 2001230578\n"
        "Thành viên 3: Võ Huỳnh Gia Huy - MSSV: 2001230303\n"
        "TP. HỒ CHÍ MINH, THÁNG 10 NĂM 2026\n"
    )
    r_info.font.name = 'Times New Roman'
    r_info.font.size = Pt(12)
    r_info.italic = True
    r_info.font.color.rgb = RGBColor(60, 60, 60)

    doc.add_page_break()

    # -------------------------------------------------------------
    # PHẦN A – ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
    # -------------------------------------------------------------
    p_part = doc.add_paragraph()
    p_part.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_part = p_part.add_run("PHẦN A – ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)\n")
    r_part.font.name = 'Times New Roman'
    r_part.font.size = Pt(16)
    r_part.bold = True
    r_part.font.color.rgb = RGBColor(15, 44, 89)

    # -------------------------------------------------------------
    # CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KẾ HOẠCH DỰ ÁN
    # -------------------------------------------------------------
    add_header_styled(doc, "CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KẾ HOẠCH DỰ ÁN", 1)

    add_header_styled(doc, "1.1. Bối cảnh và lý do chọn đề tài", 2)
    add_body_p(doc, 
        "Trong bối cảnh toàn cầu hóa và cách mạng công nghiệp 4.0, công nghệ giáo dục (EdTech) đã trở thành một trong những lĩnh vực phát triển vượt bậc nhất. Các hệ sinh thái học tập và luyện thi chứng chỉ trực tuyến (như Coursera, Udemy, edX, Duolingo) ngày càng thu hút hàng chục triệu người học trên toàn cầu. Tại Việt Nam, nhu cầu học tập và khảo sát năng lực tiếng Anh thực chiến (chuẩn quốc tế IELTS, TOEIC và khung tham chiếu Châu Âu CEFR A1-C2) luôn duy trì ở mức rất cao trong giới học sinh, sinh viên và người đi làm.",
        "Bối cảnh kỷ nguyên chuyển đổi số giáo dục: "
    )
    add_body_p(doc, 
        "Tuy nhiên, khi số lượng học viên tăng trưởng đột biến và lưu lượng truy cập tương tác dồn dập (hàng nghìn học viên cùng vào thi trắc nghiệm, bấm nộp bài cùng lúc, liên tục phát sinh sự kiện log xem video và thảo luận trực tiếp), kiến trúc cơ sở dữ liệu quan hệ truyền thống (RDBMS như MySQL, PostgreSQL, SQL Server) bộc lộ bốn điểm nghẽn nghiêm trọng không thể khắc phục triệt để:",
        "Hạn chế cốt tử của RDBMS truyền thống trong bài toán E-Learning: "
    )
    add_body_p(doc, 
        "Cơ sở dữ liệu RDBMS đòi hỏi cấu trúc bảng cố định (rigid schema). Trong hệ thống học tiếng Anh, cấu trúc bài giảng vô cùng linh hoạt (bài tập nghe kèm file audio MP3, bài tập phát âm kèm sóng âm, câu hỏi đọc hiểu kèm đoạn văn lồng nhau, bài viết luận PEEL). Nếu ép buộc vào RDBMS sẽ dẫn đến hàng chục bảng trung gian phân mảnh, số lượng khóa ngoại (Foreign Keys) dày đặc, làm phức tạp hóa mã nguồn và suy giảm hiệu năng nghiêm trọng.",
        "1. Nghẽn về tính linh hoạt lược đồ (Schema Rigidity): "
    )
    add_body_p(doc, 
        "Khi tổ chức các kỳ thi đánh giá năng lực tập trung (Placement Test, IELTS Mock Test), hàng ngàn học viên nộp bài cùng một thời điểm. Đồng thời, trình duyệt gửi định kỳ tín hiệu theo dõi tiến độ (Heartbeat video tracking mỗi 5 giây). Tần suất ghi ồ ạt (Write-Heavy) khiến các bảng trong RDBMS bị khóa (row-level/table-level lock) và nghẽn hàng đợi I/O đĩa cứng.",
        "2. Tắc nghẽn tải ghi dồn dập (Write-Heavy Bottleneck): "
    )
    add_body_p(doc, 
        "Các chức năng thời gian thực như Bảng xếp hạng tuần (Leaderboard), kiểm soát phiên làm bài thi (Exam Timer TTL) và tường lửa giới hạn tần suất truy cập (Rate Limiter) đòi hỏi thời gian phản hồi dưới 5 mili-giây. RDBMS lưu trữ trên đĩa cứng (disk-based) không thể đáp ứng được độ trễ cực thấp này.",
        "3. Độ trễ truy vấn RAM không thể đáp ứng (In-Memory Latency Gap): "
    )
    add_body_p(doc, 
        "Bài toán xác định lộ trình học tập tiên quyết (Prerequisite Learning Path: học xong bài A mới được học bài B) và thuật toán gợi ý bạn cùng tiến (Study Buddies dựa trên đồng ghi danh khóa học) đòi hỏi duyệt mạng lưới quan hệ phức tạp. Trong RDBMS, việc thực hiện các phép JOIN đệ quy nhiều cấp (Recursive Self-JOIN) gây bùng nổ không gian tìm kiếm, độ phức tạp thuật toán tăng theo hàm mũ, dẫn đến treo hệ thống.",
        "4. Bất lực trước mạng lưới quan hệ đa tầng (Graph Traversal Complexity): "
    )

    add_callout_box(doc, 
        "Giải pháp kiến trúc: Thay vì cố gắng gượng ép mọi loại dữ liệu vào một hệ quản trị duy nhất, đề tài áp dụng triết lý Polyglot Persistence (Kiến trúc đa mô hình NoSQL). Mỗi loại dữ liệu nghiệp vụ sẽ được trao quyền xử lý cho đúng hệ CSDL có sở trường tối ưu nhất: MongoDB cho dữ liệu tài liệu linh hoạt, Redis cho tốc độ bộ nhớ RAM, Cassandra cho chuỗi thời gian ghi tải cao và Neo4j cho liên kết đồ thị.",
        "TRIẾT LÝ THIẾT KẾ POLYGLOT PERSISTENCE TRONG ĐỒ ÁN"
    )

    add_header_styled(doc, "1.2. Mục tiêu đề tài", 2)
    add_body_p(doc, 
        "Đề tài hướng tới việc nghiên cứu chuyên sâu, thiết kế kiến trúc và hiện thực hóa trọn vẹn nền tảng học trực tuyến và khảo sát năng lực tiếng Anh thực chiến EduPro Academy tích hợp đồng thời 4 hệ quản trị cơ sở dữ liệu NoSQL tiêu biểu thuộc 4 mô hình khác nhau. Các mục tiêu cụ thể được định lượng và đo lường minh bạch như sau:",
        "Mục tiêu tổng quát & Định lượng kỹ thuật: "
    )
    add_body_p(doc, 
        "1. Xây dựng nền tảng E-Learning đáp ứng 3 nhóm đối tượng người dùng (Học viên, Giảng viên, Quản trị viên) với đầy đủ nghiệp vụ: quản lý 12 khóa học chuẩn CEFR, khảo sát năng lực trực tuyến, hệ thống từ vựng cá nhân, phòng luyện AI Writing Lab và chống gian lận thi cử 3 lần cảnh báo.\n"
        "2. Về độ trễ đọc Cache Redis: Thời gian phản hồi API lấy dữ liệu bảng xếp hạng và danh mục khóa học đạt dưới 5 ms ở phân vị p95.\n"
        "3. Về thông lượng ghi Cassandra: Đảm bảo ghi nhận chuỗi thời gian log học tập (Learning Events) đạt thông lượng trên 2.000 ops/giây mà không gây khóa bảng.\n"
        "4. Về hiệu năng tìm kiếm MongoDB: Thời gian truy vấn tìm kiếm khóa học và đề thi dưới 40 ms nhờ hệ thống chỉ mục phức hợp (Compound Index).\n"
        "5. Về khả năng duyệt đồ thị Neo4j: Thuật toán gợi ý lộ trình học tập và tìm bạn học cùng tiến thực thi dưới 30 ms đối với đồ thị từ 3 đến 4 bước nhảy (hops).\n"
        "6. Về chất lượng kiểm thử: Đạt 100% tỷ lệ vượt qua toàn bộ 22 kịch bản kiểm thử tự động (Automated Test Cases) bao quát cả 4 hệ CSDL và giao diện người dùng."
    )

    add_header_styled(doc, "1.3. Phạm vi đề tài", 2)
    add_body_p(doc, 
        "• Quản lý tài khoản và xác thực bảo mật JWT Token cho 3 vai trò: Student, Teacher, Admin.\n"
        "• Quản lý danh mục 12 khóa học tiếng Anh toàn diện (IELTS, TOEIC, Ngữ pháp B2, Giao tiếp thương mại, Chuẩn hóa IPA).\n"
        "• Hệ thống khảo sát năng lực trực tuyến: Phòng thi thời gian thực, lưu bài làm tạm thời trên Redis, tính điểm tự động, cơ chế Anti-cheat cảnh báo chuyển tab 3 lần.\n"
        "• Gamification & Đổi quà XP: Tích lũy điểm kinh nghiệm khi học bài, đổi vật phẩm trong cửa hàng XP (Streak Freeze, Voucher giảm giá).\n"
        "• Quản lý log học tập chuỗi thời gian (Time-series) trên Apache Cassandra: Lưu lịch sử xem video, tính toán đường cong giữ chân người học (Retention Curve).\n"
        "• Đồ thị tri thức (Knowledge Graph) và Mạng xã hội học tập trên Neo4j: Biểu diễn mối quan hệ phụ thuộc bài học, gợi ý lộ trình học tập và gợi ý Bạn Cùng Tiến (Study Buddies).\n"
        "• Bảo vệ hệ thống: Tường lửa Redis Sliding Window Rate Limiter ngăn chặn spam/DDoS.\n"
        "• Sao lưu và phục hồi dữ liệu đồng bộ (Unified Backup & Restore) cho cả 4 CSDL NoSQL.",
        "Phạm vi thực hiện trong đề tài (In-Scope): "
    )
    add_body_p(doc, 
        "• Tích hợp cổng thanh toán thực tế với ngân hàng (đề tài sử dụng cơ chế tạo mã VietQR động giả lập và kích hoạt khóa học tức thời).\n"
        "• Xây dựng mô hình Deep Learning xử lý tiếng nói (Speech-to-Text) tự huấn luyện (hệ thống sử dụng các bài tập đánh giá dựa trên tiêu chí chuẩn CEFR).\n"
        "• Triển khai cụm phân tán đa vùng địa lý trên đám mây (đề tài tập trung kiểm thử và triển khai cụm Container/Local tối ưu hóa hiệu năng).",
        "Phạm vi ngoài đề tài (Out-of-Scope): "
    )

    add_header_styled(doc, "1.4. Phương pháp thực hiện và tiếp cận", 2)
    add_body_p(doc, 
        "Đề tài áp dụng phương pháp Thiết kế định hướng truy cập (Access Pattern Driven Design) - đây là phương pháp tiếp cận kinh điển và bắt buộc khi làm việc với NoSQL. Khác với mô hình quan hệ truyền thống (thiết kế lược đồ chuẩn hóa 3NF rồi sau đó mới nghĩ đến câu truy vấn), trong NoSQL, nhóm tiến hành liệt kê tất cả các mẫu truy cập nghiệp vụ mà ứng dụng sẽ hỏi CSDL (Access Patterns - AP). Sau đó, dựa vào đặc thù của từng AP để lựa chọn mô hình dữ liệu (Document, Key-Value, Wide-Column hay Graph) phù hợp nhất.",
        "Quy trình thiết kế định hướng truy cập (Access Pattern Driven): "
    )

    add_header_styled(doc, "1.5. Công nghệ sử dụng trong hệ thống", 2)
    add_body_p(doc, "Hệ thống EduPro được xây dựng hoàn chỉnh trên ngăn xếp công nghệ hiện đại, đảm bảo tính liên kết chặt chẽ giữa ứng dụng và 4 hệ thống lưu trữ:")

    table_tech = doc.add_table(rows=1, cols=4)
    format_custom_table(
        table_tech,
        [1.2, 1.6, 1.8, 1.9],
        ["Thành phần", "Công nghệ / Phiên bản", "Vai trò trong hệ sinh thái", "Ghi chú kỹ thuật"],
        [
            ["Backend API", "Node.js 20+ / Express.js", "Xử lý Business Logic, RESTful APIs", "Kiến trúc Service-Repository"],
            ["Frontend", "Vanilla JavaScript ES6 Modular", "Giao diện Web SPA tương tác cao", "5 Modules tách biệt: core, study..."],
            ["Document DB", "MongoDB Community 7.0+", "Lưu trữ Users, Courses, Exams, Results", "Mongoose ODM & Native Driver"],
            ["In-Memory DB", "Redis 7.0+ / Memurai", "Cache, Session, Leaderboard, Rate Limiter", "ioredis Client, Redis Hashes & ZSET"],
            ["Wide-Column", "Apache Cassandra 3.11.17", "Time-series Learning Events, Anti-cheat", "cassandra-driver (CQL native port 9042)"],
            ["Graph DB", "Neo4j Community 5.x", "Knowledge Graph, Lộ trình, Bạn cùng tiến", "neo4j-driver (Bolt protocol port 7687)"],
            ["DevOps / Tool", "Docker, Compass, TablePlus", "Đóng gói container, quản trị GUI trực quan", "Git/GitHub quản lý phiên bản mã nguồn"]
        ]
    )

    add_header_styled(doc, "1.6. Kế hoạch triển khai dự án", 2)
    
    add_header_styled(doc, "a) Cơ cấu tổ chức và vai trò thành viên", 3)
    add_body_p(doc, "Nhóm 18 gồm 3 sinh viên phối hợp chặt chẽ, phân chia trách nhiệm rõ ràng theo từng mảng nghiệp vụ và hệ thống CSDL NoSQL phụ trách:")

    table_roles = doc.add_table(rows=1, cols=4)
    format_custom_table(
        table_roles,
        [1.8, 1.2, 1.7, 1.8],
        ["Họ và tên", "MSSV", "Vai trò chính", "Phụ trách chuyên sâu CSDL"],
        [
            ["Nguyễn Trọng Nguyên", "2001230589", "Nhóm trưởng, Kiến trúc sư hệ thống", "MongoDB, Redis, Cassandra, Neo4j Core"],
            ["Phạm Nguyễn Khôi Nguyên", "2001230578", "Thành viên, Kỹ sư Backend & GUI", "MongoDB Document Model, Redis Cache"],
            ["Võ Huỳnh Gia Huy", "2001230303", "Thành viên, Kỹ sư Dữ liệu & Test", "Apache Cassandra, Neo4j Graph Queries"]
        ]
    )

    add_header_styled(doc, "b) Bảng phân công nhiệm vụ chi tiết", 3)
    add_body_p(doc, "Bảng theo dõi tiến độ công việc xuyên suốt học kỳ theo chuẩn Bảng 4 của đề cương môn học:")

    table_tasks = doc.add_table(rows=1, cols=7)
    format_custom_table(
        table_tasks,
        [0.6, 1.8, 1.3, 0.7, 0.7, 1.0, 0.8],
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
        ]
    )

    add_header_styled(doc, "c) Quy trình phát triển phần mềm (SDLC)", 3)
    add_body_p(doc, 
        "Nhóm áp dụng mô hình Agile / Scrum rút gọn với chu kỳ Sprint 2 tuần. Mỗi Sprint bao gồm các bước: Lập kế hoạch ➔ Thiết kế Schema NoSQL ➔ Xây dựng API Endpoint ➔ Tích hợp Giao diện ➔ Kiểm thử hồi quy tự động. Việc sử dụng Git Flow (nhánh main và các nhánh feature riêng biệt) giúp các thành viên phát triển tính năng độc lập, tránh xung đột mã nguồn và kiểm soát chất lượng qua từng lần commit.",
        "Mô hình phát triển phần mềm Agile/Scrum: "
    )

    add_header_styled(doc, "d) Lịch trình và các mốc quan trọng", 3)
    add_body_p(doc, "Lịch trình bàn giao sản phẩm đồ án khớp chính xác với mốc thời gian quy định của Khoa CNTT - HUIT:")

    table_milestones = doc.add_table(rows=1, cols=4)
    format_custom_table(
        table_milestones,
        [1.1, 2.2, 2.0, 1.2],
        ["Giai đoạn", "Nội dung thực hiện", "Sản phẩm bàn giao", "Mốc thời gian"],
        [
            ["Giai đoạn 1", "Khảo sát yêu cầu, xác định bài toán NoSQL", "Tài liệu đặc tả yêu cầu SRS", "Tuần 6"],
            ["Giai đoạn 2", "Thiết kế Database Model & Kiến trúc đa mô hình", "Tài liệu đặc tả thiết kế SDS", "Tuần 7"],
            ["Giai đoạn 3", "Lập trình ứng dụng, tích hợp 4 CSDL, kiểm thử", "Mã nguồn, Test Suite 22 TCs", "Tuần 10"],
            ["Giai đoạn 4", "Nghiệm thu đồ án, báo cáo hội đồng & demo", "Báo cáo hoàn chỉnh, Video demo", "Tuần 11"]
        ]
    )

    add_header_styled(doc, "e) Công nghệ và công cụ phát triển", 3)
    add_body_p(doc, "• Môi trường phát triển tích hợp: Visual Studio Code, Node.js Runtime v20+.\n"
                    "• Công cụ kiểm thử API: Postman Collection, Node.js Native Test Runner.\n"
                    "• Công cụ giao diện đồ họa (GUI Tool): MongoDB Compass, RedisInsight, TablePlus Community, Neo4j Desktop 2.\n"
                    "• Quản lý phiên bản & Làm việc nhóm: Git, GitHub Repository (https://github.com/nguyentrongnguyen3004-eng/DoAn_NoSQL_Elearning.git).")

    add_header_styled(doc, "f) Kế hoạch kiểm thử hệ thống", 3)
    add_body_p(doc, 
        "Hệ thống kiểm thử được thiết kế theo 3 tầng nghiêm ngặt:\n"
        "1. Kiểm thử đơn vị (Unit Testing): Kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation Middleware), hàm tính điểm thi và thuật toán xếp hạng.\n"
        "2. Kiểm thử tích hợp (Integration Testing): Kiểm tra kết nối và truy vấn trực tiếp trên 4 CSDL NoSQL thật đang chạy (không sử dụng mock).\n"
        "3. Kịch bản kiểm thử tự động toàn diện (Automated End-to-End Suite): File automated_tests.js thực thi tuần tự 22 kịch bản từ TC-01 đến TC-22, đo lường thời gian phản hồi và tính toàn vẹn dữ liệu xuyên suốt các tầng kiến trúc.",
        "Chiến lược kiểm thử đa tầng: "
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHƯƠNG 2: TỔNG QUAN NOSQL VÀ TÌM HIỂU TOOL
    # -------------------------------------------------------------
    add_header_styled(doc, "CHƯƠNG 2: TỔNG QUAN NOSQL VÀ TÌM HIỂU TOOL", 1)

    add_header_styled(doc, "2.1. Tổng quan về Cơ sở dữ liệu NoSQL", 2)
    add_body_p(doc, 
        "Thuật ngữ 'NoSQL' lần đầu tiên xuất hiện vào năm 1998 bởi Carlo Strozzi khi ông phát triển một CSDL quan hệ mã nguồn mở không dùng ngôn ngữ SQL. Tuy nhiên, khái niệm NoSQL theo nghĩa hiện đại được tái định nghĩa vào đầu năm 2009 bởi Johan Oskarsson nhằm diễn tả một phong trào công nghệ mới: các hệ cơ sở dữ liệu phân tán, phi quan hệ, có khả năng mở rộng quy mô theo chiều ngang (Scale-Out) và không bị ràng buộc bởi các quy chuẩn khắt khe của mô hình quan hệ.",
        "Khái niệm & Lịch sử hình thành: "
    )
    add_body_p(doc, 
        "Ngày nay, NoSQL được hiểu phổ biến là 'Not Only SQL' (Không chỉ có SQL), ngụ ý rằng các hệ thống hiện đại không hoàn toàn chối bỏ SQL mà kết hợp linh hoạt nhiều mô hình lưu trữ dữ liệu khác nhau để đạt được hiệu năng và độ co giãn tối ưu nhất cho từng loại tác vụ nghiệp vụ.",
        "Thuật ngữ 'Not Only SQL': "
    )

    add_body_p(doc, "Bảng đối sánh toàn diện giữa mô hình quan hệ truyền thống và cơ sở dữ liệu NoSQL hiện đại:")
    table_compare = doc.add_table(rows=1, cols=3)
    format_custom_table(
        table_compare,
        [1.8, 2.3, 2.4],
        ["Tiêu chí đối sánh", "Hệ quản trị quan hệ (RDBMS)", "Hệ quản trị NoSQL"],
        [
            ["Mô hình dữ liệu", "Bảng 2 chiều gồm dòng và cột (Tabular).", "Đa dạng: Document (JSON/BSON), Key-Value, Column-Family, Graph."],
            ["Lược đồ dữ liệu", "Cố định (Fixed Schema), phải định nghĩa trước bằng DDL.", "Linh hoạt (Schema-Free / Dynamic Schema), dễ mở rộng cấu trúc."],
            ["Mô hình mở rộng", "Mở rộng theo chiều dọc (Scale-Up: nâng cấp CPU, RAM).", "Mở rộng theo chiều ngang (Scale-Out: thêm các máy chủ phổ thông)."],
            ["Giao dịch & Nhất quán", "Tuân thủ nghiêm ngặt tính chất ACID (Nhất quán mạnh).", "Tuân thủ mô hình BASE (Nhất quán cuối cùng - Eventual Consistency)."],
            ["Khả năng chịu lỗi", "Phức tạp, chi phí cao (cần giải pháp phần cứng đắt tiền).", "Tích hợp sẵn cơ chế tự động nhân bản (Auto-Replication) và chịu lỗi."],
            ["Hiệu năng ghi", "Bị giới hạn bởi cơ chế Transaction Lock và Index B-Tree.", "Tối ưu hóa ghi cực cao (In-Memory, Log-Structured Merge Tree)."],
            ["Độ phức tạp quan hệ", "Hỗ trợ JOIN nhiều bảng mạnh mẽ nhưng chậm khi phình to.", "Hạn chế JOIN; riêng Graph Database giải quyết quan hệ cực nhanh."],
            ["Trường hợp sử dụng", "Tài chính ngân hàng, kế toán, ERP, thanh toán cốt lõi.", "Mạng xã hội, E-learning, Big Data, IoT, Real-time Leaderboard."]
        ]
    )

    add_body_p(doc, 
        "• Ưu điểm: Khả năng mở rộng quy mô gần như không giới hạn; Tốc độ đọc/ghi siêu nhanh nhờ tối ưu hóa kiến trúc bộ nhớ RAM hoặc cấu trúc Append-Only; Cho phép phát triển ứng dụng nhanh chóng nhờ lược đồ mềm dẻo, không cần chạy các câu lệnh ALTER TABLE làm nghẽn hệ thống đang hoạt động.\n"
        "• Nhược điểm: Không hỗ trợ đầy đủ các giao dịch ACID đa bảng phức tạp (trừ một số CSDL mới hỗ trợ Document-level ACID); Khả năng kiểm tra ràng buộc toàn vẹn tham chiếu (Foreign Key) phải do tầng ứng dụng tự xử lý; Ngôn ngữ truy vấn chưa chuẩn hóa hoàn toàn giữa các nhà cung cấp.",
        "Ưu điểm và Nhược điểm của NoSQL: "
    )

    add_header_styled(doc, "Hệ quy chiếu ACID so với BASE", 3)
    add_body_p(doc, 
        "Trong khi RDBMS đặt trọn niềm tin vào hệ quy chiếu ACID (Atomicity - Nguyên tử, Consistency - Nhất quán, Isolation - Cô lập, Durability - Bền vững) để đảm bảo dữ liệu luôn chính xác 100% tại mọi thời điểm, thì các hệ NoSQL phân tán chấp nhận đánh đổi để đạt được tính sẵn sàng cao thông qua mô hình BASE:\n"
        "• Basically Available (Khả dụng cơ bản): Hệ thống đảm bảo tính sẵn sàng phục vụ các yêu cầu của người dùng, ngay cả khi một số nốt mạng gặp sự cố (có thể phản hồi chậm hoặc suy giảm tính năng nhẹ nhưng không sập toàn bộ).\n"
        "• Soft state (Trạng thái mềm): Trạng thái của dữ liệu có thể biến động theo thời gian mà không cần sự tương tác trực tiếp của người dùng, do quá trình đồng bộ ngầm giữa các nốt bản sao.\n"
        "• Eventual consistency (Nhất quán cuối cùng): Dữ liệu không nhất thiết phải đồng nhất tức thì tại thời điểm ghi trên tất cả các nốt, nhưng hệ thống đảm bảo đến một thời điểm nào đó trong tương lai, tất cả các bản sao sẽ hội tụ về cùng một giá trị chính xác."
    )

    add_header_styled(doc, "Định lý CAP và Định lý mở rộng PACELC", 3)
    add_body_p(doc, 
        "Định lý CAP (do Eric Brewer công bố năm 2000) khẳng định rằng: Trong một hệ thống phân tán, khi xảy ra hiện tượng phân vùng mạng (Network Partition - P), hệ thống chỉ có thể lựa chọn thỏa mãn một trong hai yếu tố: Tính nhất quán (Consistency - C) hoặc Tính sẵn sàng (Availability - A), không bao giờ có thể đạt được đồng thời cả ba yếu tố.",
        "Định lý CAP của Eric Brewer: "
    )
    add_body_p(doc, 
        "• Consistency (C - Tính nhất quán): Mọi thao tác đọc đều nhận được dữ liệu được ghi mới nhất hoặc trả về lỗi.\n"
        "• Availability (A - Tính sẵn sàng): Mọi yêu cầu gửi đến đều nhận được phản hồi thành công (không bị lỗi), nhưng không đảm bảo đó là dữ liệu mới nhất.\n"
        "• Partition Tolerance (P - Khả năng chịu phân vùng mạng): Hệ thống vẫn tiếp tục vận hành ngay cả khi các liên kết mạng giữa các cụm máy chủ bị đứt đoạn hoặc trễ gói tin."
    )

    add_callout_box(doc, 
        "Trong môi trường mạng phân tán thực tế, phân vùng mạng (P) là điều tất yếu không thể tránh khỏi. Vì vậy, các hệ thống bắt buộc phải chọn giữa CP (ưu tiên Nhất quán, ví dụ MongoDB khi mất kết nối Primary) hoặc AP (ưu tiên Sẵn sàng, ví dụ Cassandra luôn cho phép ghi nhận log học tập).",
        "QUY TẮC BẮT BUỘC TRONG ĐỊNH LÝ CAP"
    )

    add_body_p(doc, 
        "Định lý mở rộng PACELC của Daniel Abadi hoàn thiện định lý CAP bằng cách xem xét cả trạng thái bình thường (khi không có sự cố phân vùng mạng):\n"
        "• Nếu có Partition (P): Hệ thống chọn giữa Availability (A) hay Consistency (C).\n"
        "• Else (E - Ngược lại khi mạng hoạt động bình thường): Hệ thống đánh đổi giữa Latency (L - Độ trễ thấp) hay Consistency (C - Tính nhất quán cao).\n"
        "Dựa vào đó: MongoDB thuộc nhóm PC/EC (ưu tiên nhất quán trong mọi trường hợp); Apache Cassandra thuộc nhóm PA/EL (khi có sự cố mạng ưu tiên sẵn sàng, khi bình thường ưu tiên độ trễ cực thấp); Redis thuộc nhóm PC/EL (bộ nhớ RAM đem lại độ trễ thấp nhất).",
        "Định lý mở rộng PACELC: "
    )

    add_header_styled(doc, "2.2. Phân tán dữ liệu trong NoSQL", 2)
    add_body_p(doc, 
        "Để xử lý khối lượng dữ liệu khổng lồ vượt quá sức chứa của một máy chủ vật lý, NoSQL áp dụng hai kỹ thuật cốt lõi:\n"
        "1. Phân mảnh dữ liệu (Sharding / Partitioning): Chia nhỏ tập dữ liệu thành nhiều phần độc lập lưu trữ trên các nốt khác nhau. Cassandra sử dụng thuật toán Băm nhất quán (Consistent Hashing) trên vòng tròn Token Ring để phân bổ dữ liệu đồng đều, loại bỏ điểm nghẽn tập trung.\n"
        "2. Sao chép dữ liệu (Replication): Nhân bản dữ liệu sang nhiều nốt để đảm bảo an toàn. MongoDB sử dụng mô hình Replica Set (1 Primary nhận ghi, nhiều Secondary nhận đọc). Ngược lại, Cassandra sử dụng mô hình Masterless (Peer-to-Peer), mọi nốt đều bình đẳng và có khả năng tiếp nhận yêu cầu từ client.\n"
        "3. Mức độ nhất quán có thể điều chỉnh (Tunable Consistency): Trong Cassandra, người lập trình có thể linh hoạt chọn mức độ nhất quán trên từng câu truy vấn: ONE (nhanh nhất), QUORUM (đa số: R + W > N đảm bảo nhất quán mạnh) hoặc ALL (chờ tất cả nốt phản hồi)."
    )

    add_header_styled(doc, "2.3. Phân loại 4 mô hình NoSQL cốt lõi", 2)
    add_body_p(doc, "Bảng phân loại chuẩn 4 mô hình cơ sở dữ liệu NoSQL theo quy chuẩn Bảng 6 của đề cương môn học:")

    table_models = doc.add_table(rows=1, cols=4)
    format_custom_table(
        table_models,
        [1.3, 1.8, 2.0, 1.4],
        ["Mô hình NoSQL", "Đặc trưng lưu trữ", "Mạnh nhất khi xử lý", "Hệ quản trị tiêu biểu"],
        [
            ["Document Store", "Tài liệu JSON / BSON phân cấp, không cố định cấu trúc.", "Nội dung đa dạng, hồ sơ người dùng, bài thi, câu hỏi trắc nghiệm.", "MongoDB, Couchbase, ArangoDB."],
            ["Key-Value Store", "Cặp khóa - giá trị đơn giản, truy cập qua Key duy nhất.", "Cache tốc độ cao, Session, Giỏ hàng, Leaderboard điểm số.", "Redis, Memcached, DynamoDB."],
            ["Wide-Column Store", "Bảng gồm các họ cột (Column Families), khóa phân vùng.", "Dữ liệu chuỗi thời gian (Time-series), Log hệ thống, I/O ghi cực lớn.", "Apache Cassandra, ScyllaDB, HBase."],
            ["Graph Database", "Đồ thị gồm các Nốt (Nodes) và Quan hệ (Edges/Relationships).", "Mạng xã hội, đường đi ngắn nhất, gợi ý sản phẩm, lộ trình học tập.", "Neo4j, Amazon Neptune, OrientDB."]
        ]
    )

    add_header_styled(doc, "2.4. Các hệ quản trị cơ sở dữ liệu đề tài sử dụng", 2)

    # 2.4.1 MongoDB
    add_header_styled(doc, "2.4.1. MongoDB (Mô hình Document Store)", 3)
    add_body_p(doc, 
        "MongoDB là hệ quản trị CSDL NoSQL hướng tài liệu phổ biến nhất thế giới hiện nay. Dữ liệu trong MongoDB được tổ chức dưới dạng các Document tuân theo định dạng BSON (Binary JSON), cho phép lưu trữ các trường dữ liệu có cấu trúc lồng nhau (Nested Objects) và các mảng giá trị (Arrays).",
        "Đặc điểm kiến trúc: "
    )
    add_body_p(doc, 
        "Hệ thống phân cấp tổ chức dữ liệu gồm 4 cấp: Database ➔ Collection (tương đương bảng trong RDBMS) ➔ Document (tương đương dòng) ➔ Field (tương đương cột). Trong đề tài EduPro, cơ sở dữ liệu elearning_nosql được phân chia thành các Collection: users, courses, questions, exams, results, certificates, flashcards.",
        "Cấu trúc dữ liệu: "
    )
    add_body_p(doc, 
        "• Nhúng tài liệu (Embedded / Denormalization): Nhóm áp dụng nhúng danh sách các câu trả lời trắc nghiệm (options) và đáp án giải thích vào ngay bên trong Document của câu hỏi (Question). Việc này giúp đọc toàn bộ câu hỏi trong 1 truy vấn duy nhất, không cần JOIN.\n"
        "• Tham chiếu tài liệu (Reference / Normalized): Đối với kết quả bài thi (Result), hệ thống lưu trữ userId và examId dạng ObjectId tham chiếu đến Collection tương ứng để tránh phình to dữ liệu lặp lại.",
        "Chiến lược thiết kế Embedded vs Reference: "
    )
    add_body_p(doc, 
        "MongoDB hỗ trợ cơ chế Aggregation Pipeline vô cùng mạnh mẽ với các toán tử $match, $group, $sort, $lookup, $unwind, $project. Điều này cho phép thực hiện các thống kê phân tích điểm thi, phổ điểm của học viên trực tiếp trên tầng cơ sở dữ liệu với tốc độ cao.",
        "Cơ chế Aggregation Pipeline: "
    )

    # 2.4.2 Redis
    add_header_styled(doc, "2.4.2. Redis (Mô hình In-Memory Key-Value Store)", 3)
    add_body_p(doc, 
        "Redis (Remote Dictionary Server) là kho lưu trữ cấu trúc dữ liệu trên bộ nhớ RAM (In-Memory Data Structure Store). Nhờ kiến trúc đơn luồng (Single-Threaded Event Loop) kết hợp cơ chế I/O Multiplexing, Redis loại bỏ hoàn toàn hiện tượng tranh chấp khóa (Lock Contention) và đạt tốc độ xử lý hàng trăm nghìn thao tác trên giây với độ trễ dưới 1 mili-giây.",
        "Kiến trúc In-Memory siêu tốc: "
    )
    add_body_p(doc, 
        "Đề tài EduPro khai thác triệt để các cấu trúc dữ liệu phong phú của Redis:\n"
        "• String: Lưu trữ chuỗi JSON của danh mục khóa học đã xuất bản (cache:courses:catalog:published) với cơ chế hết hạn thời gian (TTL = 1800 giây).\n"
        "• Hash: Quản lý phiên làm bài thi trực tiếp (exam:examId:answers:studentId). Mỗi câu trả lời của thí sinh được lưu tức thời vào một field trong Hash mà không cần ghi đè toàn bộ đối tượng.\n"
        "• Sorted Set (ZSET): Đây là cấu trúc xuất sắc nhất của Redis để xây dựng Bảng xếp hạng tuần (leaderboard:weekly). Các phần tử được sắp xếp tự động theo điểm số (Score) dựa trên cấu trúc dữ liệu SkipList, cho phép lấy Top 10 học viên bằng lệnh ZREVRANGEBYSCORE với độ phức tạp thuật toán chỉ O(log(N) + M).\n"
        "• Set: Quản lý danh sách đen các IP vi phạm (security:blacklist:ips) phục vụ kiểm tra tức thời bằng lệnh SISMEMBER với độ phức tạp O(1).\n"
        "• Pub/Sub: Kênh phát sóng thông báo thời gian thực (system_notifications) cập nhật khi có học viên đạt điểm tuyệt đối hoặc kết nối bạn học mới.",
        "Cấu trúc dữ liệu và ứng dụng trong đề tài: "
    )
    add_body_p(doc, 
        "Mặc dù dữ liệu lưu trên RAM, Redis vẫn đảm bảo tính bền vững thông qua 2 cơ chế: Chụp ảnh bộ nhớ định kỳ (RDB Snapshotting) và ghi nhật ký mọi thao tác ghi (Append-Only File - AOF), cho phép phục hồi 100% dữ liệu khi khởi động lại.",
        "Cơ chế bền vững dữ liệu (Persistence): "
    )

    # 2.4.3 Apache Cassandra
    add_header_styled(doc, "2.4.3. Apache Cassandra (Mô hình Wide-Column Family Store)", 3)
    add_body_p(doc, 
        "Apache Cassandra được thiết kế dựa trên sự kết hợp tinh hoa giữa kiến trúc phân tán Dynamo của Amazon và mô hình dữ liệu Bigtable của Google. Cassandra vận hành theo kiến trúc hoàn toàn không có nốt chủ (Masterless / Peer-to-Peer), không có điểm chết đơn lẻ (No Single Point of Failure).",
        "Kiến trúc phân tán Masterless: "
    )
    add_body_p(doc, 
        "Dữ liệu trong Cassandra được tổ chức theo cấu trúc: Keyspace (tương đương Database) ➔ Table / Column Family ➔ Row gồm nhiều Column. Trong đề tài, Keyspace elearning_tracking được tạo với chiến lược SimpleStrategy và replication_factor = 1 để ghi nhận dữ liệu chuỗi thời gian.",
        "Cấu trúc Keyspace và Table: "
    )
    add_body_p(doc, 
        "Một trong những nguyên tắc cốt tử của Cassandra là thiết kế khóa chính gồm hai thành phần:\n"
        "• Partition Key (Khóa phân vùng): Ví dụ student_id. Thuật toán băm Murmur3Partitioner sẽ dựa vào khóa này để xác định chính xác nốt vật lý nào trong cụm sẽ lưu trữ bản ghi.\n"
        "• Clustering Key (Khóa gom cụm): Ví dụ event_time. Thành phần này quy định thứ tự sắp xếp vật lý của dữ liệu bên trong nốt (mặc định sắp xếp theo event_time DESC để đọc các sự kiện mới nhất ngay lập tức).",
        "Thiết kế Partition Key & Clustering Key: "
    )
    add_body_p(doc, 
        "Khi có yêu cầu ghi (INSERT), Cassandra ghi tuần tự vào Commit Log trên đĩa (đảm bảo độ bền) và đồng thời ghi vào cấu trúc Memtable trên RAM. Khi Memtable đầy, nó sẽ được xả (flush) bất đồng bộ xuống các tập tin bất biến SSTable (Sorted String Table). Nhờ cơ chế chỉ ghi thêm nối đuôi (Append-Only) không cần tìm kiếm và ghi đè, Cassandra đạt tốc độ ghi nhanh nhất trong tất cả các hệ CSDL NoSQL.",
        "Quy trình ghi tối ưu (Write Path): "
    )
    add_body_p(doc, 
        "Bảng nhật ký vi phạm thi cử (exam_violations) sử dụng mệnh đề USING TTL 604800 (tự hủy sau 7 ngày). Cassandra tự động xóa bỏ các bản ghi đã quá hạn bằng cơ chế Tombstone trong quá trình Compaction mà không cần bất kỳ cron job nào của ứng dụng.",
        "Cơ chế TTL tự động hủy bản ghi: "
    )

    # 2.4.4 Neo4j
    add_header_styled(doc, "2.4.4. Neo4j (Mô hình Graph Database)", 3)
    add_body_p(doc, 
        "Neo4j là hệ quản trị cơ sở dữ liệu đồ thị hàng đầu thế giới được xây dựng trên mô hình Đồ thị thuộc tính có nhãn (Labeled Property Graph - LPG). Khác biệt đột phá nhất của Neo4j nằm ở cơ chế Index-free Adjacency: mỗi nốt trực tiếp lưu trữ con trỏ trỏ tới các nốt lân cận của nó trong bộ nhớ vật lý. Nhờ vậy, khi duyệt qua các mối quan hệ (traversal), độ phức tạp chỉ là O(1) cho mỗi bước nhảy, hoàn toàn độc lập với tổng kích thước dữ liệu của toàn bộ đồ thị.",
        "Đột phá công nghệ Index-free Adjacency: "
    )
    add_body_p(doc, 
        "• Nốt (Nodes): Biểu diễn các thực thể, gồm 5 loại nhãn: Course (Khóa học), Topic (Chủ điểm kiến thức), Lesson (Bài học CEFR), Skill (Kỹ năng đầu ra) và User (Học viên).\n"
        "• Thuộc tính (Properties): Cặp khóa-giá trị lưu thông tin chi tiết trên nốt hoặc trên quan hệ.\n"
        "• Mối quan hệ (Relationships): Kết nối định hướng có tên cụ thể giữa 2 nốt: CONTAINS (Khóa học chứa Bài học), COVERS (Bài học bao hàm Chủ điểm), PREREQUISITE_OF (Bài học A là điều kiện tiên quyết của Bài học B), DEVELOPS (Bài học phát triển Kỹ năng) và ENROLLED_IN (Học viên ghi danh Khóa học).",
        "Thành phần cốt lõi của đồ thị EduPro: "
    )
    add_body_p(doc, 
        "Neo4j sử dụng ngôn ngữ truy vấn khai báo Cypher mang tính trực quan cao, sử dụng các ký hiệu nghệ thuật ASCII để mô tả mẫu đường đi đồ thị: (nốt_nguồn)-[mối_quan_hệ]->(nốt_đích). Mệnh đề MATCH cho phép nhận diện các mẫu đồ thị phức tạp như tìm đường đi ngắn nhất (shortestPath) hoặc tìm giao điểm bạn cùng tiến (Co-enrollment Intersection) chỉ trong vài dòng lệnh ngắn gọn.",
        "Ngôn ngữ truy vấn Cypher: "
    )

    add_header_styled(doc, "2.5. Tìm hiểu và khảo sát công cụ quản trị giao diện (GUI Tools)", 2)
    add_body_p(doc, 
        "Để phục vụ công tác giám sát, bảo trì và trực quan hóa dữ liệu trong quá trình phát triển và báo cáo đồ án, nhóm đã tiến hành cài đặt, khảo sát và sử dụng 4 công cụ giao diện đồ họa (GUI Tool) chính thức cho 4 hệ CSDL. Bảng đánh giá chi tiết theo 4 tiêu chí chuẩn barem điểm của Giảng viên (Table 7 trong đề cương hướng dẫn):",
        "Khảo sát và đánh giá công cụ GUI: "
    )

    table_gui = doc.add_table(rows=1, cols=4)
    format_custom_table(
        table_gui,
        [1.3, 1.8, 1.8, 1.6],
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
        ]
    )

    add_body_p(doc, 
        "Việc làm chủ cả 4 công cụ giao diện trên giúp nhóm tự tin biểu diễn trực tiếp các thao tác dữ liệu biến động thời gian thực (Live Demonstration) khi bảo vệ đồ án trước Hội đồng chấm điểm của Khoa Công nghệ Thông tin - HUIT.",
        "Kết luận Chương 2: "
    )

    out_file = r'd:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\06_Bao_Cao_Ket_Qua_Do_An\BAO_CAO_NOSQL_CHUONG_1_VA_CHUONG_2.docx'
    doc.save(out_file)
    print(f"✅ Đã tạo thành công tài liệu Word hoàn chỉnh tại:\n{out_file}")

if __name__ == '__main__':
    build_report()
