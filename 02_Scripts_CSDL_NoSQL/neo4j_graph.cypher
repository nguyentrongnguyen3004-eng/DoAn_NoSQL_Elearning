// ==============================================================================
// HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
// SCRIPT TAO DO THI TRI THUC (KNOWLEDGE GRAPH) VA TRUY VAN CHO NEO4J
// NHOM 18: NEN TANG E-LEARNING TIENG ANH & LUYEN THI QUOC TE (EDUPRO ENGLISH)
// ==============================================================================

// 1. XOA DU LIEU CU DE KHOI TAO LAI MO HINH SACH SE (NEU CAN)
// MATCH (n) DETACH DELETE n;

// 2. TAO CONSTRAINT / INDEX DE TOI UU HIEU NANG TRUY VAN
CREATE CONSTRAINT unique_course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT unique_lesson_id IF NOT EXISTS FOR (l:Lesson) REQUIRE l.id IS UNIQUE;
CREATE CONSTRAINT unique_topic_id IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT unique_skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;

// 3. TAO CAC NODE CHINH (4 LOAI NODE THEO SRS: Course, Lesson, Topic, Skill)
CREATE 
  // Node Khoa hoc Tieng Anh
  (c_ielts:Course {id: 'COURSE_01', name: 'IELTS Masterclass 7.5+: Chinh Phuc 4 Ky Nang Toan Dien', credits: 4, level: 'NangCao'}),
  (c_toeic:Course {id: 'COURSE_02', name: 'Luyen Thi TOEIC 4 Ky Nang 850+', credits: 3, level: 'TrungCap'}),
  (c_grammar:Course {id: 'COURSE_03', name: 'Ngu Phap Tieng Anh Toan Dien & 3000 Tu Vung Cot Loi (CEFR A2-B2)', credits: 3, level: 'CoBan'}),
  (c_biz:Course {id: 'COURSE_04', name: 'Tieng Anh Giao Tiep Thuong Mai & Phong Van Quoc Te', credits: 3, level: 'TrungCap'}),
  (c_ipa:Course {id: 'COURSE_05', name: 'Chuan Hoa Phat Am IPA 44 Am & Phan Xa Giao Tiep', credits: 2, level: 'CoBan'}),

  // Node Chu de kien thuc ngon ngu (Topic)
  (t_ipa:Topic {id: 'TOPIC_PHONETICS', name: 'Phonetics & IPA 44 Sounds', description: 'Ngu am hoc, trong am va ngu dieu cau'}),
  (t_tenses:Topic {id: 'TOPIC_GRAMMAR_TENSES', name: '12 English Tenses & Syntax', description: 'He thong 12 thi va cu phap cau chuan'}),
  (t_colloc:Topic {id: 'TOPIC_COLLOCATIONS', name: 'Academic Vocabulary & Idioms', description: 'Tu vung hoc thuat, Collocations va Phrasal Verbs'}),
  (t_receptive:Topic {id: 'TOPIC_RECEPTIVE', name: 'Reading & Listening Strategies', description: 'Chien thuat Skimming, Scanning va nghe bat Keyword'}),
  (t_productive:Topic {id: 'TOPIC_PRODUCTIVE', name: 'Academic Writing & Speaking', description: 'Viet luan PEEL Task 1-2 va phan xa Speaking'}),

  // Node Bai hoc theo khung tham chieu CEFR A1 -> C2 (Lesson)
  (l_01:Lesson {id: 'LESSON_01', title: 'Chuan hoa Phat am IPA 44 am & Tu vung nen tang (CEFR A1-A2)', order: 1}),
  (l_02:Lesson {id: 'LESSON_02', title: 'He thong 12 Thi Tieng Anh & Cau truc cau cot loi (CEFR B1)', order: 2}),
  (l_03:Lesson {id: 'LESSON_03', title: 'Cau dieu kien, Menh de quan he & Academic Collocations (CEFR B2)', order: 3}),
  (l_04:Lesson {id: 'LESSON_04', title: 'Chien thuat doc nhanh Skimming/Scanning & Nghe bat Keyword (TOEIC/IELTS)', order: 4}),
  (l_05:Lesson {id: 'LESSON_05', title: 'Tu duy viet luan IELTS Task 1-2 & Phan xa Speaking Fluency (CEFR C1)', order: 5}),
  (l_06:Lesson {id: 'LESSON_06', title: 'Lam chu Tieng Anh Hoc thuat & Giao tiep Quoc te (Mastery C2 / IELTS 8.0+)', order: 6}),

  // Node Ky nang dau ra (Skill)
  (s_pronun:Skill {id: 'SKILL_PRONUNCIATION', name: 'Phat Am & Ngu Dieu Ban Xu'}),
  (s_grammar:Skill {id: 'SKILL_GRAMMAR_ACCURACY', name: 'Grammatical Range & Accuracy'}),
  (s_reading:Skill {id: 'SKILL_SPEED_READING', name: 'Doc Hieu & Nghe Bat Y Chinh Toc Do Cao'}),
  (s_writing:Skill {id: 'SKILL_ACADEMIC_WRITING', name: 'Viet Luan Hoc Thuat Band 8.0'}),
  (s_speaking:Skill {id: 'SKILL_FLUENT_SPEAKING', name: 'Giao Tiep & Thuyet Trinh Quoc Te'});

// 4. TAO CAC QUAN HE (5 LOAI RELATIONSHIP: CONTAINS, COVERS, PREREQUISITE_OF, DEVELOPS, RELATED_TO)
CREATE
  // Course -> Lesson (CONTAINS)
  (c_ipa)-[:CONTAINS]->(l_01),
  (c_grammar)-[:CONTAINS]->(l_02),
  (c_grammar)-[:CONTAINS]->(l_03),
  (c_toeic)-[:CONTAINS]->(l_04),
  (c_ielts)-[:CONTAINS]->(l_05),
  (c_ielts)-[:CONTAINS]->(l_06),
  (c_biz)-[:CONTAINS]->(l_06),

  // Lesson -> Topic (COVERS)
  (l_01)-[:COVERS]->(t_ipa),
  (l_02)-[:COVERS]->(t_tenses),
  (l_03)-[:COVERS]->(t_colloc),
  (l_04)-[:COVERS]->(t_receptive),
  (l_05)-[:COVERS]->(t_productive),

  // Dieu kien tien quyet giua cac khoa hoc va bai hoc (PREREQUISITE_OF)
  (c_grammar)-[:PREREQUISITE_OF]->(c_toeic),
  (c_toeic)-[:PREREQUISITE_OF]->(c_ielts),
  (l_01)-[:PREREQUISITE_OF]->(l_02),
  (l_02)-[:PREREQUISITE_OF]->(l_03),
  (l_03)-[:PREREQUISITE_OF]->(l_04),
  (l_04)-[:PREREQUISITE_OF]->(l_05),
  (l_05)-[:PREREQUISITE_OF]->(l_06),

  // Lesson -> Skill (DEVELOPS)
  (l_01)-[:DEVELOPS {score: 85}]->(s_pronun),
  (l_02)-[:DEVELOPS {score: 80}]->(s_grammar),
  (l_03)-[:DEVELOPS {score: 85}]->(s_grammar),
  (l_04)-[:DEVELOPS {score: 90}]->(s_reading),
  (l_05)-[:DEVELOPS {score: 95}]->(s_writing),
  (l_06)-[:DEVELOPS {score: 95}]->(s_speaking),

  // Quan he bo tro giua cac Topic (RELATED_TO)
  (t_tenses)-[:RELATED_TO {relevance: 'high'}]->(t_productive),
  (t_colloc)-[:RELATED_TO {relevance: 'high'}]->(t_receptive);

// ==============================================================================
// CAC CAU TRUY VAN MINH CHUNG NANG LUC (DEMO TREN NEO4J BROWSER CHO GIANG VIEN)
// ==============================================================================

// 1. Truy van truc quan toan bo cay do thi cua khoa hoc IELTS:
// MATCH p=(c:Course {id: 'COURSE_01'})-[*1..2]->(x)
// RETURN p;

// 2. Truy van tim lo trinh hoc tap CEFR (Cac bai hoc tien quyet can hoc de toi Lesson 05 - IELTS C1):
// MATCH path = (start:Lesson)-[:PREREQUISITE_OF*]->(target:Lesson {id: 'LESSON_05'})
// RETURN [n in nodes(path) | n.title] AS LoTrinhHocTapCEFR;

// 3. Truy van tim tat ca ky nang ma khoa hoc giup sinh vien phat trien:
// MATCH (c:Course)-[:CONTAINS]->(l:Lesson)-[r:DEVELOPS]->(s:Skill)
// RETURN c.name AS KhoaHoc, l.title AS BaiHoc, s.name AS KyNangDatDuoc, r.score AS DiemDanhGia
// ORDER BY DiemDanhGia DESC;
