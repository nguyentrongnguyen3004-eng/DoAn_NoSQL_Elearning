# -*- coding: utf-8 -*-
"""
Script update_word_images.py
Cập nhật toàn bộ các ảnh giao diện web thực tế (1600x1000) vào file Word BAO_CAO.docx
Đồng thời chuẩn hóa tỷ lệ hiển thị chuẩn (cx=4860000, cy=3037500) chống méo hình.
"""

import os
import sys
import shutil
import zipfile
import tempfile
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

DOCX_PATHS = [
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\TÀI LIỆU FINAL\BAO_CAO.docx',
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\TÀI LIỆU FINAL\BAO_CAO_NOSQL_EDUPRO_ACADEMY_FINAL.docx',
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\TÀI LIỆU FINAL\BAO_CAO_NOSQL_TOAN_VAN_CHUAN_HUIT.docx',
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\06_Bao_Cao_Ket_Qua_Do_An\BAO_CAO_NOSQL_EDUPRO_ACADEMY_FINAL.docx',
    r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\06_Bao_Cao_Ket_Qua_Do_An\BAO_CAO_NOSQL_TOAN_VAN_CHUAN_HUIT.docx'
]

IMG_DIR = r'D:\TRONGNGUYEN_HK7\NoSQL\ĐỒ ÁN\03_Tai_Lieu_Do_An\08_Hinh_Anh_Giao_Dien_Web'

REPLACEMENT_MAP = {
    'word/media/image3.png': os.path.join(IMG_DIR, '01_Trang_Chu_Danh_Muc_Khoa_Hoc.png'),
    'word/media/image4.png': os.path.join(IMG_DIR, '02_Phong_Hoc_Truc_Tuyen_Classroom.png'),
    'word/media/image5.png': os.path.join(IMG_DIR, '05_Phong_Thi_Trac_Nghiem_Online.png'),
    'word/media/image6.png': os.path.join(IMG_DIR, '06_Canh_Bao_Gian_Lan_Anti_Cheat.png'),
    'word/media/image7.png': os.path.join(IMG_DIR, '07_Ban_Do_Tri_Thuc_Neo4j_Graph.png'),
    'word/media/image8.png': os.path.join(IMG_DIR, '08_Mang_Luoi_Ban_Cung_Tien_Study_Buddies.png'),
    'word/media/image9.png': os.path.join(IMG_DIR, '10_Bang_Xep_Hang_Va_Shop_Doi_Qua_XP.png'),
    'word/media/image10.png': os.path.join(IMG_DIR, '13_Bang_Dieu_Khien_Quan_Tri_CMS_Telemetry.png')
}

# Namespaces in Word document.xml
NAMESPACES = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

for prefix, uri in NAMESPACES.items():
    ET.register_namespace(prefix, uri)

def update_docx(docx_file):
    if not os.path.exists(docx_file):
        print(f"Bỏ qua: Không tìm thấy {docx_file}")
        return

    print(f"\n==============================================================================")
    print(f"Đang xử lý tệp: {os.path.basename(docx_file)}")
    print(f"Đường dẫn: {docx_file}")
    print(f"==============================================================================")

    temp_dir = tempfile.mkdtemp()
    try:
        # 1. Giải nén docx
        with zipfile.ZipFile(docx_file, 'r') as z:
            z.extractall(temp_dir)

        # 2. Thay thế binary hình ảnh trong word/media/
        for media_rel_path, src_img_path in REPLACEMENT_MAP.items():
            dest_path = os.path.join(temp_dir, media_rel_path.replace('/', os.sep))
            if os.path.exists(src_img_path):
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                shutil.copy2(src_img_path, dest_path)
                print(f"  -> Đã cập nhật ảnh {media_rel_path} <- {os.path.basename(src_img_path)}")
            else:
                print(f"  -> CẢNH BÁO: Không tìm thấy nguồn ảnh {src_img_path}")

        # 3. Điều chỉnh kích thước tỷ lệ khung hình trong word/document.xml
        doc_xml_path = os.path.join(temp_dir, 'word', 'document.xml')
        if os.path.exists(doc_xml_path):
            tree = ET.parse(doc_xml_path)
            root = tree.getroot()

            # Chuẩn hóa tỷ lệ: Chiều rộng 13.50 cm (4860000 EMUs), chiều cao 8.44 cm (3037500 EMUs) cho ảnh 1600x1000
            TARGET_CX = '4860000'
            TARGET_CY = '3037500'

            # Tìm các thẻ blip của rId11 đến rId18
            target_rids = {'rId11', 'rId12', 'rId13', 'rId14', 'rId15', 'rId16', 'rId17', 'rId18'}

            modified_count = 0
            for drawing in root.iter(f"{{{NAMESPACES['w']}}}drawing"):
                # Tìm xem drawing này có chứa blip target không
                has_target = False
                for blip in drawing.iter(f"{{{NAMESPACES['a']}}}blip"):
                    embed = blip.get(f"{{{NAMESPACES['r']}}}embed")
                    if embed in target_rids:
                        has_target = True
                        break

                if has_target:
                    # Cập nhật wp:extent
                    for extent in drawing.iter(f"{{{NAMESPACES['wp']}}}extent"):
                        extent.set('cx', TARGET_CX)
                        extent.set('cy', TARGET_CY)

                    # Cập nhật a:ext trong a:xfrm
                    for ext in drawing.iter(f"{{{NAMESPACES['a']}}}ext"):
                        ext.set('cx', TARGET_CX)
                        ext.set('cy', TARGET_CY)

                    modified_count += 1

            tree.write(doc_xml_path, xml_declaration=True, encoding='utf-8')
            print(f"  -> Đã chuẩn hóa tỷ lệ hiển thị (13.5cm x 8.44cm) cho {modified_count} hình ảnh trong document.xml")

        # 4. Đóng gói lại thành docx hoàn chỉnh
        temp_zip = os.path.join(tempfile.gettempdir(), 'temp_updated.docx')
        if os.path.exists(temp_zip):
            os.remove(temp_zip)

        with zipfile.ZipFile(temp_zip, 'w', zipfile.ZIP_DEFLATED) as z_out:
            for root_dir, dirs, files in os.walk(temp_dir):
                for file in files:
                    full_path = os.path.join(root_dir, file)
                    arcname = os.path.relpath(full_path, temp_dir)
                    z_out.write(full_path, arcname)

        # Ghi đè vào file đích
        shutil.copy2(temp_zip, docx_file)
        os.remove(temp_zip)
        print(f"  ✅ Đã lưu thành công tệp Word: {docx_file}")

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == '__main__':
    for path in DOCX_PATHS:
        try:
            update_docx(path)
        except Exception as e:
            print(f"  ❌ Lỗi khi xử lý {path}: {e}")

    print("\n==============================================================================")
    print("HOÀN TẤT CẬP NHẬT TOÀN BỘ CÁC FILE WORD BÁO CÁO!")
    print("==============================================================================")
