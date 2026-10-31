import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

prs = pptx.Presentation('03_Tai_Lieu_Do_An/BAO_CAO_THUYET_TRINH_NOSQL_EDUPRO_ACADEMY.pptx')
FONT_FAMILY = "Segoe UI"
C_PRIMARY = RGBColor(79, 70, 229)
C_TITLE = RGBColor(15, 23, 42)
C_BODY = RGBColor(51, 65, 85)

# --- Update Slide 16 ---
slide16 = prs.slides[15]
for sh in slide16.shapes:
    if sh.name == 'Rounded Rectangle 6':
        tf = sh.text_frame
        tf.clear()
        
        paras = [
            ("TÍNH TOÀN VẸN & BẢO MẬT PHÒNG THI TRỰC TUYẾN", True, Pt(13), C_PRIMARY, Pt(8)),
            ("• Ngân Hàng 10 Bộ Đề Thi Quốc Tế (80 Câu Hỏi):", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Bao gồm: Placement Test, TOEIC 850+, IELTS Academic, Core Grammar, Speaking/Listening, Business English, VSTEP B2-C1, Collocations, Ngữ âm IPA & SAT/GRE Reasoning. Quản lý đồng thời qua trình duyệt và TTL Redis, nạp câu hỏi từ MongoDB `questions`.", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Lưu Đáp Án Siêu Tốc (Redis Hash Realtime):", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Mỗi khi thí sinh chọn đáp án, hệ thống ghi ngay vào Redis Hash `exam:{id}:answers:{student}` trong < 2ms kèm bộ đệm TTL +120s, bảo đảm không mất câu trả lời nếu mất kết nối mạng.", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Giám Sát Chống Gian Lận Anti-Cheat:", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Bắt sự kiện `visibilitychange` & `window.blur`: Rời màn hình hoặc chuyển tab quá 3 lần sẽ tự động khóa bài thi (0 điểm). Lịch sử vi phạm ghi vết chi tiết vào Cassandra `anti_cheat_events`.", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Chấm Thi Tự Động, Khóa Phân Tán & Đua Top ZSET:", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Khóa phân tán Redis Lock chống spam nộp bài; tự động chấm điểm, lưu kết quả an toàn vào MongoDB `results` và đẩy ngay điểm số vào Redis Sorted Set `exam:{id}:leaderboard`.", False, Pt(9.5), C_BODY, Pt(4))
        ]
        for text, bold, size, color, space in paras:
            p = tf.add_paragraph()
            p.text = text
            p.font.name = FONT_FAMILY
            p.font.bold = bold
            p.font.size = size
            p.font.color.rgb = color
            p.space_after = space

# --- Update Slide 17 ---
slide17 = prs.slides[16]
for sh in slide17.shapes:
    if sh.name == 'Rounded Rectangle 6':
        tf = sh.text_frame
        tf.clear()
        
        paras = [
            ("KÍCH THÍCH ĐỘNG LỰC HỌC TẬP & XÁC THỰC CHỨNG CHỈ", True, Pt(13), C_PRIMARY, Pt(8)),
            ("• Tích Lũy Điểm Thưởng XP & Chuỗi Ngày Học (Streak):", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Mỗi bài học, bài thi và thẻ từ vựng hoàn thành đều được cộng điểm XP. Hệ thống duy trì chuỗi ngày học liên tục (Streak Days) với cơ chế bảo lưu Streak Freeze.", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Bảng Xếp Hạng Đua Top Tuần (Redis ZSET):", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Truy xuất Top học viên xuất sắc từ Redis Sorted Set qua lệnh `ZREVRANGE` với độ phức tạp cực thấp O(log N), hiển thị huy hiệu Vàng, Bạc, Đồng danh dự.", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Cửa Hàng Vật Phẩm Đổi Quà XP:", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Học viên dùng điểm XP tích lũy để mua vật phẩm hỗ trợ: Thẻ Streak Freeze bảo lưu chuỗi ngày học hoặc khung Avatar cao cấp trong hồ sơ cá nhân.", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Cấp & Tra Cứu Chứng Chỉ Điện Tử (SHA-256 Hash):", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Học viên thi đạt điểm chuẩn được cấp chứng chỉ điện tử. Hệ thống hỗ trợ tra cứu công khai 1-click, đối soát mã băm mật mã SHA-256 lưu trực tiếp trên MongoDB `certificates` để chống giả mạo.", False, Pt(9.5), C_BODY, Pt(4))
        ]
        for text, bold, size, color, space in paras:
            p = tf.add_paragraph()
            p.text = text
            p.font.name = FONT_FAMILY
            p.font.bold = bold
            p.font.size = size
            p.font.color.rgb = color
            p.space_after = space

# --- Update Slide 19 ---
slide19 = prs.slides[18]
for sh in slide19.shapes:
    if sh.name == 'Rounded Rectangle 6':
        tf = sh.text_frame
        tf.clear()
        
        paras = [
            ("QUẢN TRỊ HẠ TẦNG, AN NINH MẠNG & SAO LƯU DỰ PHÒNG", True, Pt(13), C_PRIMARY, Pt(8)),
            ("• Phân Quyền Bảo Mật & Ẩn Nút 4 CSDL:", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Nút quản trị '4 CSDL' trên thanh điều hướng chỉ hiển thị cho tài khoản `ADMIN`. Học viên và khách vãng lai bị ẩn hoàn toàn trên giao diện và chặn truy cập API (403 Forbidden).", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Bảng Điều Khiển CMS Giảng Viên & Admin:", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Quản trị ngân hàng câu hỏi đề thi và khóa học. Khi lưu thay đổi, MongoDB cập nhật document và backend tự động xóa khóa cache Redis liên quan (Cache Invalidation).", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Tường Lửa Redis Sliding Window Rate Limiter:", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Ngăn chặn tấn công DoS/Brute-force với cơ chế trượt 120 req/phút theo IP trong Redis Sorted Set. Vượt ngưỡng sẽ tự động phản hồi HTTP 429.", False, Pt(9.5), C_BODY, Pt(6)),
            ("• Sao Lưu & Phục Hồi Hợp Nhất 4 CSDL NoSQL:", True, Pt(10.5), C_TITLE, Pt(2)),
            ("Hỗ trợ đồng thời 4 CSDL: `mongodump`, `redis SAVE/BGSAVE`, `cqlsh snapshot` và `neo4j-admin dump`. Phục hồi 1.000 bản ghi an toàn chỉ trong 4.2 giây.", False, Pt(9.5), C_BODY, Pt(4))
        ]
        for text, bold, size, color, space in paras:
            p = tf.add_paragraph()
            p.text = text
            p.font.name = FONT_FAMILY
            p.font.bold = bold
            p.font.size = size
            p.font.color.rgb = color
            p.space_after = space

prs.save('03_Tai_Lieu_Do_An/BAO_CAO_THUYET_TRINH_NOSQL_EDUPRO_ACADEMY.pptx')
prs.save('TÀI LIỆU FINAL/BAO_CAO_THUYET_TRINH_NOSQL_EDUPRO_ACADEMY.pptx')
print("Successfully updated Slides 16, 17, and 19 text!")
