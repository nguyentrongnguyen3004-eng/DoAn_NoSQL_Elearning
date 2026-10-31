import sys
import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

sys.stdout.reconfigure(encoding='utf-8')

FILE_PATH = '03_Tai_Lieu_Do_An/BAO_CAO_THUYET_TRINH_NOSQL_EDUPRO_ACADEMY.pptx'
FINAL_PATH = 'TÀI LIỆU FINAL/BAO_CAO_THUYET_TRINH_NOSQL_EDUPRO_ACADEMY.pptx'

prs = pptx.Presentation(FILE_PATH)
print(f"Loaded presentation with {len(prs.slides)} slides.")

# Color constants
C_DARK_BG = RGBColor(10, 15, 29)       # #0A0F1D Deep Obsidian
C_LIGHT_BG = RGBColor(248, 250, 252)   # #F8FAFC Crisp Light Slate
C_WHITE = RGBColor(255, 255, 255)
C_DARK_CARD = RGBColor(19, 29, 49)     # #131D31
C_DARK_BORDER = RGBColor(49, 46, 129)  # #312E81
C_LIGHT_CARD = RGBColor(255, 255, 255)
C_LIGHT_BORDER = RGBColor(226, 232, 240) # #E2E8F0

C_PRIMARY = RGBColor(79, 70, 229)     # #4F46E5 Indigo
C_PRIMARY_LIGHT = RGBColor(99, 102, 241) # #6366F1
C_TITLE = RGBColor(15, 23, 42)        # #0F172A
C_BODY = RGBColor(51, 65, 85)         # #334155
C_MUTED = RGBColor(100, 116, 139)     # #64748B

# DB Colors
C_MONGO = RGBColor(5, 150, 105)       # Emerald #059669
C_REDIS = RGBColor(220, 38, 38)       # Red #DC2626
C_CASSANDRA = RGBColor(37, 99, 235)   # Blue #2563EB
C_NEO4J = RGBColor(217, 119, 6)       # Amber #D97706
C_CYAN = RGBColor(6, 182, 212)        # Cyan #06B6D4
C_GOLD = RGBColor(245, 158, 11)       # Gold #F59E0B

FONT_FAMILY = "Segoe UI"

def format_text_run(p, font_name=FONT_FAMILY, size_pt=10.5, bold=False, color_rgb=C_BODY, space_after=2):
    p.font.name = font_name
    p.font.size = Pt(size_pt)
    p.font.bold = bold
    p.font.color.rgb = color_rgb
    p.space_after = Pt(space_after)

# Iterate through slides
for s_idx, slide in enumerate(prs.slides):
    slide_num = s_idx + 1

    # ----------------------------------------------------
    # SLIDE 1: COVER SLIDE
    # ----------------------------------------------------
    if slide_num == 1:
        print(f"Formatting Slide {slide_num} (Cover)...")
        # Ensure deep dark background
        for sh in slide.shapes:
            if sh.name == 'Rectangle 1':
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_DARK_BG
                sh.line.fill.background()
            elif sh.name == 'Rectangle 2':
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_PRIMARY
                sh.line.fill.background()
            elif sh.name == 'TextBox 3':
                # HUIT header
                tf = sh.text_frame
                tf.word_wrap = True
                if len(tf.paragraphs) >= 1:
                    p1 = tf.paragraphs[0]
                    p1.font.name = FONT_FAMILY
                    p1.font.size = Pt(13)
                    p1.font.bold = True
                    p1.font.color.rgb = C_WHITE
                if len(tf.paragraphs) >= 2:
                    p2 = tf.paragraphs[1]
                    p2.font.name = FONT_FAMILY
                    p2.font.size = Pt(10.5)
                    p2.font.bold = True
                    p2.font.color.rgb = RGBColor(129, 140, 248) # Indigo 400
            elif sh.name == 'TextBox 4':
                # Main Title block
                tf = sh.text_frame
                tf.word_wrap = True
                if len(tf.paragraphs) >= 1:
                    p1 = tf.paragraphs[0]
                    p1.font.name = FONT_FAMILY
                    p1.font.size = Pt(11)
                    p1.font.bold = True
                    p1.font.color.rgb = C_GOLD
                if len(tf.paragraphs) >= 2:
                    p2 = tf.paragraphs[1]
                    p2.font.name = FONT_FAMILY
                    p2.font.size = Pt(25)
                    p2.font.bold = True
                    p2.font.color.rgb = C_WHITE
                if len(tf.paragraphs) >= 3:
                    p3 = tf.paragraphs[2]
                    p3.font.name = FONT_FAMILY
                    p3.font.size = Pt(12)
                    p3.font.bold = True
                    p3.font.color.rgb = RGBColor(56, 189, 248) # Sky 400
            elif sh.name == 'Rounded Rectangle 5':
                # Team Card
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_DARK_CARD
                sh.line.color.rgb = C_DARK_BORDER
                sh.line.width = Pt(1.5)
                tf = sh.text_frame
                tf.word_wrap = True
                for p_i, p in enumerate(tf.paragraphs):
                    p.font.name = FONT_FAMILY
                    if p_i == 0:
                        p.font.size = Pt(12.5)
                        p.font.bold = True
                        p.font.color.rgb = C_GOLD
                        p.space_after = Pt(6)
                    else:
                        p.font.size = Pt(10.5)
                        p.font.bold = (p_i == 1)
                        p.font.color.rgb = C_WHITE if p_i == 1 else RGBColor(203, 213, 225)
                        p.space_after = Pt(4)
            elif sh.name == 'Rounded Rectangle 6':
                # Course & Instructor Card
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_DARK_CARD
                sh.line.color.rgb = C_DARK_BORDER
                sh.line.width = Pt(1.5)
                tf = sh.text_frame
                tf.word_wrap = True
                for p_i, p in enumerate(tf.paragraphs):
                    p.font.name = FONT_FAMILY
                    if p_i == 0:
                        p.font.size = Pt(12.5)
                        p.font.bold = True
                        p.font.color.rgb = RGBColor(56, 189, 248)
                        p.space_after = Pt(6)
                    else:
                        p.font.size = Pt(10.5)
                        p.font.color.rgb = RGBColor(226, 232, 240)
                        p.font.bold = ('Định' in p.text)
                        p.space_after = Pt(4)
        continue

    # ----------------------------------------------------
    # SLIDE 24: CONCLUSION / Q&A SLIDE
    # ----------------------------------------------------
    if slide_num == 24:
        print(f"Formatting Slide {slide_num} (Conclusion)...")
        for sh in slide.shapes:
            if sh.name == 'Rectangle 1':
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_DARK_BG
                sh.line.fill.background()
            elif sh.name == 'Rectangle 2':
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_PRIMARY
                sh.line.fill.background()
            elif sh.name == 'Rounded Rectangle 3':
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_DARK_CARD
                sh.line.color.rgb = C_DARK_BORDER
                sh.line.width = Pt(2)
                tf = sh.text_frame
                tf.word_wrap = True
                for p_i, p in enumerate(tf.paragraphs):
                    p.font.name = FONT_FAMILY
                    p.alignment = PP_ALIGN.CENTER
                    if p_i == 0:
                        p.font.size = Pt(24)
                        p.font.bold = True
                        p.font.color.rgb = C_GOLD
                        p.space_after = Pt(12)
                    elif p_i == 1:
                        p.font.size = Pt(14)
                        p.font.bold = True
                        p.font.color.rgb = C_WHITE
                        p.space_after = Pt(10)
                    elif p_i == 2:
                        p.font.size = Pt(11.5)
                        p.font.color.rgb = RGBColor(148, 163, 184)
                        p.space_after = Pt(24)
                    elif p_i == 3:
                        p.font.size = Pt(16)
                        p.font.bold = True
                        p.font.color.rgb = RGBColor(56, 189, 248)
        continue

    # ----------------------------------------------------
    # SLIDES 2 to 23: ALL CONTENT SLIDES
    # ----------------------------------------------------
    print(f"Formatting Slide {slide_num}...")

    # Check if slide already has top accent line, if not add one
    has_accent_bar = any(s.name == 'EduProAccentBar' for s in slide.shapes)
    if not has_accent_bar:
        accent_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.06))
        accent_bar.name = 'EduProAccentBar'
        accent_bar.fill.solid()
        accent_bar.fill.fore_color.rgb = C_PRIMARY
        accent_bar.line.fill.background()

    # Format header shapes
    for sh in slide.shapes:
        # 1. Background Rectangle
        if sh.name == 'Rectangle 1':
            sh.fill.solid()
            sh.fill.fore_color.rgb = C_LIGHT_BG
            sh.line.fill.background()

        # 2. Category Eyebrow Subtitle (TextBox 2)
        elif sh.name == 'TextBox 2':
            if sh.has_text_frame:
                tf = sh.text_frame
                tf.word_wrap = True
                for p in tf.paragraphs:
                    p.font.name = FONT_FAMILY
                    p.font.size = Pt(10)
                    p.font.bold = True
                    p.font.color.rgb = C_PRIMARY_LIGHT
                    p.space_after = Pt(2)

        # 3. Main Slide Title (TextBox 3)
        elif sh.name == 'TextBox 3':
            if sh.has_text_frame:
                tf = sh.text_frame
                tf.word_wrap = True
                for p in tf.paragraphs:
                    p.font.name = FONT_FAMILY
                    p.font.size = Pt(22)
                    p.font.bold = True
                    p.font.color.rgb = C_TITLE
                    p.space_after = Pt(4)

        # 4. Slide Number Badge (Rounded Rectangle 4)
        elif sh.name == 'Rounded Rectangle 4':
            sh.left = Inches(12.0)
            sh.top = Inches(0.55)
            sh.width = Inches(0.70)
            sh.height = Inches(0.42)
            sh.fill.solid()
            sh.fill.fore_color.rgb = C_PRIMARY
            sh.line.fill.background()
            if sh.has_text_frame:
                tf = sh.text_frame
                for p in tf.paragraphs:
                    p.font.name = FONT_FAMILY
                    p.font.size = Pt(11)
                    p.font.bold = True
                    p.font.color.rgb = C_WHITE
                    p.alignment = PP_ALIGN.CENTER

    # ----------------------------------------------------
    # SLIDE-SPECIFIC CUSTOMIZATIONS FOR EXCELLENCE
    # ----------------------------------------------------

    # Subsystems Slides (Slides 12 to 19): Add mock browser frame & tech stack badge bar
    if 12 <= slide_num <= 19:
        subsystem_pills = {
            12: "📦 MONGODB: Users & Courses  |  ⚡ REDIS: Cache-Aside 3.8ms (TTL 1800s)  |  💳 VIETQR: Napas 24/7",
            13: "📹 MULTI-BITRATE VIDEO  |  📊 CASSANDRA: Heartbeat LSM-Tree Stream  |  📈 RETENTION CURVE ANALYTICS",
            14: "🗂️ KHO 150 FLASHCARDS (6 Chủ Đề)  |  🧠 ANKI SM-2: Spaced Repetition  |  🔊 WEB SPEECH IPA",
            15: "🎧 AUDIO DICTATION: Fuzzy Match Algorithm  |  ✍️ WRITING AI: IELTS 4 Tiêu Chí  |  📑 MONGODB ESSAYS",
            16: "📋 NGÂN HÀNG 10 BỘ ĐỀ THI (80 CÂU)  |  ⚡ REDIS HASH: Lưu Đáp Án Realtime  |  🛡️ CASSANDRA ANTI-CHEAT",
            17: "🏆 REDIS ZSET: Đua Top XP Tuần  |  📜 MONGODB: Chứng Chỉ Số SHA-256  |  🔍 XÁC THỰC TRA CỨU 1-CLICK",
            18: "🕸️ NEO4J: Bản Đồ Tri Thức CEFR (A1-C2)  |  👥 BẠN CÙNG TIẾN: Co-Enrollment  |  🤖 COPILOT AI 4 NoSQL",
            19: "🛡️ PHÂN QUYỀN: Nút 4 CSDL Chỉ Dành Cho Admin  |  🔄 SAO LƯU DỰ PHÒNG 4 CSDL  |  📊 K6 / AUTOCANNON"
        }

        # Check if browser frame & tech pill already exist
        has_tech_pill = any(s.name == 'SubsystemTechPill' for s in slide.shapes)
        if not has_tech_pill:
            # Add subtle tech pill container under picture at top=5.85, height=0.68
            pill_sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.80), Inches(5.82), Inches(6.20), Inches(0.70))
            pill_sh.name = 'SubsystemTechPill'
            pill_sh.fill.solid()
            pill_sh.fill.fore_color.rgb = RGBColor(30, 27, 75) # Deep Indigo 950
            pill_sh.line.color.rgb = RGBColor(99, 102, 241) # Indigo 500
            pill_sh.line.width = Pt(1.2)
            tf = pill_sh.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = subsystem_pills.get(slide_num, "")
            p.font.name = FONT_FAMILY
            p.font.size = Pt(9.5)
            p.font.bold = True
            p.font.color.rgb = RGBColor(56, 189, 248) # Sky 400
            p.alignment = PP_ALIGN.CENTER

        # Format Right Info Card (Rounded Rectangle 6)
        for sh in slide.shapes:
            if sh.name == 'Rounded Rectangle 6':
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_WHITE
                sh.line.color.rgb = C_LIGHT_BORDER
                sh.line.width = Pt(1.5)
                if sh.has_text_frame:
                    tf = sh.text_frame
                    tf.word_wrap = True
                    tf.margin_left = Inches(0.20)
                    tf.margin_right = Inches(0.20)
                    tf.margin_top = Inches(0.20)
                    tf.margin_bottom = Inches(0.20)
                    for p_i, p in enumerate(tf.paragraphs):
                        p.font.name = FONT_FAMILY
                        txt = p.text.strip()
                        if p_i == 0:
                            # Subsystem Main Title inside card
                            p.font.size = Pt(13.5)
                            p.font.bold = True
                            p.font.color.rgb = C_PRIMARY
                            p.space_after = Pt(6)
                        elif txt.startswith('•') or txt.startswith('-'):
                            # Key Feature Bullet Title
                            p.font.size = Pt(11)
                            p.font.bold = True
                            p.font.color.rgb = C_TITLE
                            p.space_after = Pt(2)
                        else:
                            # Feature Explanation
                            p.font.size = Pt(10)
                            p.font.color.rgb = C_BODY
                            p.space_after = Pt(6)

    # ----------------------------------------------------
    # SLIDE 6: MA TRẬN PHÂN BỔ 4 CSDL NOSQL
    # ----------------------------------------------------
    elif slide_num == 6:
        db_configs = {
            'Rounded Rectangle 5': (C_MONGO, 'MONGODB (DOCUMENT)'),
            'Rounded Rectangle 6': (C_REDIS, 'REDIS (KEY-VALUE RAM)'),
            'Rounded Rectangle 7': (C_CASSANDRA, 'APACHE CASSANDRA'),
            'Rounded Rectangle 8': (C_NEO4J, 'NEO4J (GRAPH DB)')
        }
        for sh in slide.shapes:
            if sh.name in db_configs:
                color, label = db_configs[sh.name]
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_WHITE
                sh.line.color.rgb = color
                sh.line.width = Pt(2.0)
                if sh.has_text_frame:
                    tf = sh.text_frame
                    tf.word_wrap = True
                    for p_i, p in enumerate(tf.paragraphs):
                        p.font.name = FONT_FAMILY
                        if p_i == 0:
                            p.font.size = Pt(13)
                            p.font.bold = True
                            p.font.color.rgb = color
                            p.space_after = Pt(4)
                        elif p_i == 1:
                            p.font.size = Pt(10.5)
                            p.font.bold = True
                            p.font.color.rgb = C_TITLE
                            p.space_after = Pt(4)
                        else:
                            p.font.size = Pt(9.8)
                            p.font.color.rgb = C_BODY
                            p.space_after = Pt(3)

    # ----------------------------------------------------
    # SLIDE 20: BENCHMARK & PERFORMANCE KPI
    # ----------------------------------------------------
    elif slide_num == 20:
        stat_configs = {
            'Rounded Rectangle 5': C_MONGO,
            'Rounded Rectangle 6': C_PRIMARY,
            'Rounded Rectangle 7': C_CASSANDRA,
            'Rounded Rectangle 8': C_NEO4J
        }
        for sh in slide.shapes:
            if sh.name in stat_configs:
                accent = stat_configs[sh.name]
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_WHITE
                sh.line.color.rgb = accent
                sh.line.width = Pt(1.5)
                if sh.has_text_frame:
                    tf = sh.text_frame
                    tf.word_wrap = True
                    tf.margin_top = Inches(0.12)
                    for p_i, p in enumerate(tf.paragraphs):
                        p.font.name = FONT_FAMILY
                        p.alignment = PP_ALIGN.CENTER
                        if p_i == 0:
                            p.font.size = Pt(10.5)
                            p.font.bold = True
                            p.font.color.rgb = C_TITLE
                            p.space_after = Pt(2)
                        elif p_i == 1:
                            # Big Stat Number
                            p.font.size = Pt(26)
                            p.font.bold = True
                            p.font.color.rgb = accent
                            p.space_after = Pt(2)
                        else:
                            p.font.size = Pt(9)
                            p.font.color.rgb = C_MUTED
            elif sh.name == 'Rounded Rectangle 9':
                # Comparison Table Box
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_WHITE
                sh.line.color.rgb = C_LIGHT_BORDER
                sh.line.width = Pt(1.5)
                if sh.has_text_frame:
                    tf = sh.text_frame
                    tf.word_wrap = True
                    for p_i, p in enumerate(tf.paragraphs):
                        p.font.name = "Consolas" if p_i > 0 else FONT_FAMILY
                        if p_i == 0:
                            p.font.size = Pt(12)
                            p.font.bold = True
                            p.font.color.rgb = C_PRIMARY
                            p.space_after = Pt(4)
                        elif p_i == 1:
                            p.font.size = Pt(9.5)
                            p.font.bold = True
                            p.font.color.rgb = C_TITLE
                        else:
                            p.font.size = Pt(9.2)
                            p.font.color.rgb = C_BODY

    # ----------------------------------------------------
    # GENERAL CONTENT CARDS (SLIDES 2-5, 7-11, 21-23)
    # ----------------------------------------------------
    else:
        for sh in slide.shapes:
            if 'Rounded Rectangle' in sh.name and sh.name != 'Rounded Rectangle 4':
                sh.fill.solid()
                sh.fill.fore_color.rgb = C_WHITE
                sh.line.color.rgb = C_LIGHT_BORDER
                sh.line.width = Pt(1.5)
                if sh.has_text_frame:
                    tf = sh.text_frame
                    tf.word_wrap = True
                    tf.margin_left = Inches(0.18)
                    tf.margin_right = Inches(0.18)
                    tf.margin_top = Inches(0.16)
                    tf.margin_bottom = Inches(0.16)
                    for p_i, p in enumerate(tf.paragraphs):
                        p.font.name = FONT_FAMILY
                        txt = p.text.strip()
                        if p_i == 0:
                            p.font.size = Pt(12.5)
                            p.font.bold = True
                            p.font.color.rgb = C_PRIMARY
                            p.space_after = Pt(5)
                        elif txt.startswith('•') or txt.startswith('-'):
                            p.font.size = Pt(10.5)
                            p.font.color.rgb = C_BODY
                            p.space_after = Pt(3)
                        else:
                            p.font.size = Pt(10)
                            p.font.color.rgb = C_BODY
                            p.space_after = Pt(4)

# Save presentation
prs.save(FILE_PATH)
print(f"Successfully formatted and saved to {FILE_PATH}")

# Also save to final directory
prs.save(FINAL_PATH)
print(f"Synchronized copy to {FINAL_PATH}")
