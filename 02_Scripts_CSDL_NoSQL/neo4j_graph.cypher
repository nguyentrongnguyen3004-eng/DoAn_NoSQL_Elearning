// ==============================================================================
// HỌC PHẦN DỮ LIỆU NOSQL - ĐẠI HỌC CÔNG THƯƠNG TP.HCM (HUIT)
// SCRIPT KHỞI TẠO ĐỒ THỊ TRI THỨC (KNOWLEDGE GRAPH) & MẠNG XÃ HỘI HỌC TẬP (NEO4J)
// NHÓM 18: NỀN TẢNG E-LEARNING TIẾNG ANH & LUYỆN THI THỰC CHIẾN (EDUPRO)
// ==============================================================================

// 1. DỌN DẸP DỮ LIỆU CŨ TRƯỚC KHI TẠO MỚI
MATCH (n) DETACH DELETE n;

// 2. KHỞI TẠO RÀNG BUỘC DUY NHẤT (CONSTRAINTS) ĐỂ TỐI ƯU TRUY VẤN
CREATE CONSTRAINT unique_course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT unique_lesson_id IF NOT EXISTS FOR (l:Lesson) REQUIRE l.id IS UNIQUE;
CREATE CONSTRAINT unique_topic_id IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT unique_skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT unique_user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;

// 3. TẠO TẤT CẢ CÁC NỐT (NODES) CHÍNH (KHỚP 100% VỚI HỆ THỐNG BACKEND & FRONTEND)
CREATE 
  // [3.1] Khóa học Tiếng Anh (Course) - 6 Khóa
  (c_ielts:Course {id: 'COURSE_01', name: 'IELTS Masterclass 7.5+: Chinh Phục 4 Kỹ Năng Toàn Diện', credits: 4, level: 'Nâng cao'}),
  (c_toeic:Course {id: 'COURSE_02', name: 'Luyện Thi TOEIC 4 Kỹ Năng 850+', credits: 3, level: 'Trung cấp'}),
  (c_grammar:Course {id: 'COURSE_03', name: 'Ngữ Pháp Tiếng Anh Toàn Diện & 3000 Từ Vựng (CEFR A2-B2)', credits: 3, level: 'Cơ bản'}),
  (c_biz:Course {id: 'COURSE_04', name: 'Tiếng Anh Giao Tiếp Thương Mại & Phỏng Vấn Quốc Tế', credits: 3, level: 'Trung cấp'}),
  (c_ipa:Course {id: 'COURSE_05', name: 'Chuẩn Hóa Phát Âm IPA 44 Âm & Phản Xạ Giao Tiếp', credits: 2, level: 'Cơ bản'}),
  (c_writing:Course {id: 'COURSE_06', name: 'IELTS Writing Task 1 & Task 2 Band 8.0', credits: 3, level: 'Nâng cao'}),

  // [3.2] Chủ điểm kiến thức ngôn ngữ (Topic) - 6 Chủ điểm
  (t_ipa:Topic {id: 'TOPIC_PHONETICS', name: 'Phonetics & IPA 44 Sounds', description: 'Ngữ âm học, trọng âm và ngữ điệu câu'}),
  (t_tenses:Topic {id: 'TOPIC_GRAMMAR_TENSES', name: '12 English Tenses & Syntax', description: 'Hệ thống 12 thì và cú pháp câu chuẩn'}),
  (t_colloc:Topic {id: 'TOPIC_COLLOCATIONS', name: 'Academic Vocabulary & Idioms', description: 'Từ vựng học thuật, Collocations và Phrasal Verbs'}),
  (t_receptive:Topic {id: 'TOPIC_RECEPTIVE', name: 'Reading & Listening Strategies', description: 'Chiến thuật Skimming, Scanning và nghe bắt Keyword'}),
  (t_productive:Topic {id: 'TOPIC_PRODUCTIVE', name: 'Academic Writing & Speaking', description: 'Viết luận PEEL Task 1-2 và phản xạ Speaking'}),
  (t_biz:Topic {id: 'TOPIC_BUSINESS', name: 'Global Business Communication', description: 'Kỹ năng đàm phán, email và thuyết trình quốc tế'}),

  // [3.3] Chuỗi bài học theo khung tham chiếu CEFR A1 -> C2 (Lesson) - 6 Bài học
  (l_01:Lesson {id: 'LESSON_01', title: 'Chuẩn hóa Phát âm IPA 44 âm & Từ vựng nền tảng (CEFR A1-A2)', order: 1}),
  (l_02:Lesson {id: 'LESSON_02', title: 'Hệ thống 12 Thì Tiếng Anh & Cấu trúc câu cốt lõi (CEFR B1)', order: 2}),
  (l_03:Lesson {id: 'LESSON_03', title: 'Câu điều kiện, Mệnh đề quan hệ & Academic Collocations (CEFR B2)', order: 3}),
  (l_04:Lesson {id: 'LESSON_04', title: 'Chiến thuật đọc nhanh Skimming/Scanning & Nghe bắt Keyword (TOEIC/IELTS)', order: 4}),
  (l_05:Lesson {id: 'LESSON_05', title: 'Tư duy viết luận IELTS Task 1-2 & Phản xạ Speaking Fluency (CEFR C1)', order: 5}),
  (l_06:Lesson {id: 'LESSON_06', title: 'Làm chủ Tiếng Anh Học thuật & Giao tiếp Quốc tế (Mastery C2 / IELTS 8.0+)', order: 6}),

  // [3.4] Kỹ năng chuẩn đầu ra (Skill) - 5 Kỹ năng
  (s_pronun:Skill {id: 'SKILL_PRONUNCIATION', name: 'Phát Âm & Ngữ Điệu Bản Xứ'}),
  (s_grammar:Skill {id: 'SKILL_GRAMMAR_ACCURACY', name: 'Grammatical Range & Accuracy'}),
  (s_reading:Skill {id: 'SKILL_SPEED_READING', name: 'Đọc Hiểu & Nghe Bắt Ý Chính'}),
  (s_writing:Skill {id: 'SKILL_ACADEMIC_WRITING', name: 'Viết Luận Học Thuật Band 8.0'}),
  (s_speaking:Skill {id: 'SKILL_FLUENT_SPEAKING', name: 'Giao Tiếp & Thuyết Trình Quốc Tế'}),

  // [3.5] Người dùng / Sinh viên (User) phục vụ tính năng Bạn Cùng Tiến (Study Buddies)
  (u_nguyen:User {id: '2001230589', fullName: 'Nguyễn Trọng Nguyên', targetBand: 'IELTS 7.5+', role: 'Student'}),
  (u_khoi:User {id: 'student_khoi', fullName: 'Trần Minh Khởi', targetBand: 'IELTS 7.5+', role: 'Student'}),
  (u_alex:User {id: 'student_alex', fullName: 'Alex Johnson', targetBand: 'IELTS 8.0+', role: 'Student'}),
  (u_mai:User {id: 'student_mai', fullName: 'Lê Thị Mai', targetBand: 'IELTS 7.5+', role: 'Student'}),
  (u_bao:User {id: 'student_bao', fullName: 'Hoàng Gia Bảo', targetBand: 'TOEIC 850+', role: 'Student'});

// 4. THIẾT LẬP CÁC MỐI QUAN HỆ (RELATIONSHIPS)
CREATE
  // Khóa học chứa bài học (CONTAINS)
  (c_ipa)-[:CONTAINS]->(l_01),
  (c_grammar)-[:CONTAINS]->(l_02),
  (c_grammar)-[:CONTAINS]->(l_03),
  (c_toeic)-[:CONTAINS]->(l_04),
  (c_ielts)-[:CONTAINS]->(l_05),
  (c_writing)-[:CONTAINS]->(l_05),
  (c_biz)-[:CONTAINS]->(l_06),
  (c_ielts)-[:CONTAINS]->(l_06),

  // Bài học bao hàm chủ điểm ngôn ngữ (COVERS)
  (l_01)-[:COVERS]->(t_ipa),
  (l_02)-[:COVERS]->(t_tenses),
  (l_03)-[:COVERS]->(t_colloc),
  (l_04)-[:COVERS]->(t_receptive),
  (l_05)-[:COVERS]->(t_productive),
  (l_06)-[:COVERS]->(t_biz),

  // Điều kiện tiên quyết giữa các bài học & khóa học (PREREQUISITE_OF)
  (c_grammar)-[:PREREQUISITE_OF]->(c_toeic),
  (c_toeic)-[:PREREQUISITE_OF]->(c_ielts),
  (l_01)-[:PREREQUISITE_OF]->(l_02),
  (l_02)-[:PREREQUISITE_OF]->(l_03),
  (l_03)-[:PREREQUISITE_OF]->(l_04),
  (l_04)-[:PREREQUISITE_OF]->(l_05),
  (l_05)-[:PREREQUISITE_OF]->(l_06),

  // Bài học phát triển kỹ năng (DEVELOPS)
  (l_01)-[:DEVELOPS {score: 85}]->(s_pronun),
  (l_02)-[:DEVELOPS {score: 80}]->(s_grammar),
  (l_03)-[:DEVELOPS {score: 85}]->(s_grammar),
  (l_04)-[:DEVELOPS {score: 90}]->(s_reading),
  (l_05)-[:DEVELOPS {score: 95}]->(s_writing),
  (l_06)-[:DEVELOPS {score: 95}]->(s_speaking),

  // Quan hệ bổ trợ giữa các chủ điểm (RELATED_TO)
  (t_tenses)-[:RELATED_TO {relevance: 'high'}]->(t_productive),
  (t_colloc)-[:RELATED_TO {relevance: 'high'}]->(t_receptive),

  // Học viên ghi danh khóa học (ENROLLED_IN) phục vụ gợi ý bạn cùng tiến
  (u_nguyen)-[:ENROLLED_IN {enrolledDate: '2026-10-01'}]->(c_ielts),
  (u_nguyen)-[:ENROLLED_IN {enrolledDate: '2026-10-05'}]->(c_grammar),
  (u_nguyen)-[:ENROLLED_IN {enrolledDate: '2026-10-10'}]->(c_writing),

  (u_khoi)-[:ENROLLED_IN {enrolledDate: '2026-10-02'}]->(c_ielts),
  (u_khoi)-[:ENROLLED_IN {enrolledDate: '2026-10-06'}]->(c_grammar),
  (u_khoi)-[:ENROLLED_IN {enrolledDate: '2026-10-12'}]->(c_writing),

  (u_alex)-[:ENROLLED_IN {enrolledDate: '2026-10-03'}]->(c_ielts),
  (u_alex)-[:ENROLLED_IN {enrolledDate: '2026-10-07'}]->(c_writing),

  (u_mai)-[:ENROLLED_IN {enrolledDate: '2026-10-04'}]->(c_grammar),
  (u_mai)-[:ENROLLED_IN {enrolledDate: '2026-10-08'}]->(c_ielts),

  (u_bao)-[:ENROLLED_IN {enrolledDate: '2026-10-09'}]->(c_toeic);

// ==============================================================================
// PHẦN MINH CHỨNG CHƯƠNG 5: CÂU LỆNH TRUY VẤN TRÊN NEO4J BROWSER / GUI TOOL
// ==============================================================================

// --- [A] CÁC TRUY VẤN CƠ BẢN (BASIC CYPHER QUERIES) ---

// Truy vấn 1 (Cơ bản): Lấy danh sách tất cả các khóa học có mức độ "Nâng cao"
MATCH (c:Course)
WHERE c.level = 'Nâng cao'
RETURN c.id AS MaKhoaHoc, c.name AS TenKhoaHoc, c.credits AS TinChi
ORDER BY c.credits DESC;

// Truy vấn 2 (Cơ bản): Lấy toàn bộ danh sách kỹ năng chuẩn đầu ra (Skill)
MATCH (s:Skill)
RETURN s.id AS MaKyNang, s.name AS TenKyNang;

// Truy vấn 3 (Cơ bản): Đếm số lượng bài học có trong từng khóa học
MATCH (c:Course)-[:CONTAINS]->(l:Lesson)
RETURN c.name AS TenKhoaHoc, count(l) AS SoLuongBaiHoc
ORDER BY SoLuongBaiHoc DESC;

// --- [B] CÁC TRUY VẤN NÂNG CAO (ADVANCED CYPHER QUERIES) ---

// Truy vấn 4 (Nâng cao): Tìm lộ trình học tập tiên quyết (Learning Path) để đạt được Lesson 05
MATCH path = (start:Lesson)-[:PREREQUISITE_OF*]->(target:Lesson {id: 'LESSON_05'})
RETURN [n in nodes(path) | n.title] AS LoTrinhTienQuyet;

// Truy vấn 5 (Nâng cao): Thuật toán tìm Bạn Cùng Tiến (Study Buddies) dựa trên đồng ghi danh (Co-enrollment)
MATCH (me:User {id: '2001230589'})-[:ENROLLED_IN]->(c:Course)<-[:ENROLLED_IN]-(peer:User)
WHERE me <> peer
RETURN peer.fullName AS BanCungTien, 
       peer.targetBand AS MucTieu, 
       collect(c.name) AS KhoaHocChung, 
       count(c) AS SoKhoaHocChung
ORDER BY SoKhoaHocChung DESC;

// Truy vấn 6 (Nâng cao): Tìm đường đi ngắn nhất (Shortest Path) giữa 2 khóa học
MATCH path = shortestPath((c1:Course {id: 'COURSE_03'})-[:PREREQUISITE_OF*]->(c2:Course {id: 'COURSE_01'}))
RETURN path;

// Truy vấn 7 (Nâng cao): Trực quan hóa toàn bộ đồ thị tri thức đa tầng (Visual Graph Rendering)
MATCH (n)
OPTIONAL MATCH (n)-[r]->(m)
RETURN n, r, m 
LIMIT 50;
