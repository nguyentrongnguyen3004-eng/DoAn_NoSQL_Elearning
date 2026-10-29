# -*- coding: utf-8 -*-
"""
TÀI LIỆU THAM KHẢO (REFERENCES) - EDUPRO ACADEMY
Tiêu chuẩn học thuật IEEE / HUIT.
Bao gồm tài liệu Tiếng Việt (Giáo trình HUIT) và Tiếng Anh (Chuẩn IEEE, Sách chuyên khảo, Tài liệu chính thức).
"""

def add_references(doc, helpers):
    add_heading_chapter = helpers['add_heading_chapter']
    add_heading_level1 = helpers['add_heading_level1']
    add_paragraph_huit = helpers['add_paragraph_huit']
    add_bullet_level1 = helpers['add_bullet_level1']

    # Ngắt trang sang phần Tài liệu tham khảo
    doc.add_page_break()

    # =============================================================
    # TIÊU ĐỀ TÀI LIỆU THAM KHẢO
    # =============================================================
    add_heading_chapter(doc, "TÀI LIỆU THAM KHẢO")

    # -------------------------------------------------------------
    # I. TÀI LIỆU TIẾNG VIỆT
    # -------------------------------------------------------------
    add_heading_level1(doc, "I. TÀI LIỆU TIẾNG VIỆT")

    add_bullet_level1(doc, "[1] Khoa Công nghệ Thông tin, Trường Đại học Công Thương TP. Hồ Chí Minh (HUIT), \"Đề cương chi tiết học phần Các hệ cơ sở dữ liệu mới (NoSQL)\", TP. Hồ Chí Minh, 2024.")
    add_bullet_level1(doc, "[2] Bộ môn Hệ thống Thông tin - HUIT, \"Hướng dẫn thực hiện và trình bày Báo cáo Đồ án môn học Các hệ cơ sở dữ liệu mới\", Trường Đại học Công Thương TP. Hồ Chí Minh, 2024.")
    add_bullet_level1(doc, "[3] Trần Nguyên Phong, \"Giáo trình Cơ sở dữ liệu nâng cao và Hệ phân tán\", Nhà xuất bản Đại học Quốc gia TP. Hồ Chí Minh, 2021.")
    add_bullet_level1(doc, "[4] Nguyễn Hữu Thể, \"Phát triển ứng dụng Web tương tác cao với Node.js và hệ quản trị NoSQL MongoDB\", Nhà xuất bản Thông tin và Truyền thông, Hà Nội, 2022.")

    # -------------------------------------------------------------
    # II. TÀI LIỆU TIẾNG ANH
    # -------------------------------------------------------------
    add_heading_level1(doc, "II. TÀI LIỆU TIẾNG ANH")

    add_bullet_level1(doc, "[5] IEEE Computer Society, \"IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications\", IEEE Standards Association, New York, 1998.")
    add_bullet_level1(doc, "[6] IEEE Computer Society, \"IEEE Std 1016-2009: IEEE Standard for Information Technology - Systems Design - Software Design Descriptions\", IEEE Standards Association, New York, 2009.")
    add_bullet_level1(doc, "[7] ISO/IEC/IEEE, \"ISO/IEC/IEEE 29148:2018: Systems and software engineering - Life cycle processes - Requirements engineering\", International Organization for Standardization, Geneva, Switzerland, 2018.")
    add_bullet_level1(doc, "[8] Martin Fowler, Pramod J. Sadalage, \"NoSQL Distilled: A Brief Guide to the Emerging World of Polyglot Persistence\", Addison-Wesley Professional, Boston, 2013.")
    add_bullet_level1(doc, "[9] Alex Petrov, \"Database Internals: A Deep Dive into How Distributed Data Systems Work\", O'Reilly Media, Sebastopol, CA, 2019.")
    add_bullet_level1(doc, "[10] Jeff Carpenter, Eben Hewitt, \"Cassandra: The Definitive Guide - Distributed Data at Web Scale (3rd Edition)\", O'Reilly Media, Sebastopol, CA, 2022.")
    add_bullet_level1(doc, "[11] Ian Robinson, Jim Webber, Emil Eifrem, \"Graph Databases: New Opportunities for Connected Data (2nd Edition)\", O'Reilly Media, Sebastopol, CA, 2015.")
    add_bullet_level1(doc, "[12] Shannon Bradshaw, Eoin Brazil, Kristina Chodorow, \"MongoDB: The Definitive Guide - Powerful and Scalable Data Storage (3rd Edition)\", O'Reilly Media, Sebastopol, CA, 2019.")
    add_bullet_level1(doc, "[13] Josiah L. Carlson, \"Redis in Action\", Manning Publications, Shelter Island, NY, 2013.")
    add_bullet_level1(doc, "[14] Daniel J. Abadi, \"Consistency Tradeoffs in Modern Distributed Database System Design: CAP is Only Part of the Story\", IEEE Computer, Vol. 45, No. 2, pp. 37-42, 2012.")
    add_bullet_level1(doc, "[15] MongoDB Inc., \"MongoDB Server Documentation v6.0 - High Performance Document Storage\", Truy cập trực tuyến tại: https://www.mongodb.com/docs/v6.0/ [Truy cập tháng 10/2026].")
    add_bullet_level1(doc, "[16] Redis Ltd., \"Redis Documentation v7.0 - In-Memory Data Store & Real-Time Computing\", Truy cập trực tuyến tại: https://redis.io/docs/ [Truy cập tháng 10/2026].")
    add_bullet_level1(doc, "[17] The Apache Software Foundation, \"Apache Cassandra Documentation v4.1 - Ultra-Scalable Distributed Database\", Truy cập trực tuyến tại: https://cassandra.apache.org/doc/ [Truy cập tháng 10/2026].")
    add_bullet_level1(doc, "[18] Neo4j Inc., \"Neo4j Graph Database Manual v5.12 - Enterprise Graph Platform\", Truy cập trực tuyến tại: https://neo4j.com/docs/ [Truy cập tháng 10/2026].")
