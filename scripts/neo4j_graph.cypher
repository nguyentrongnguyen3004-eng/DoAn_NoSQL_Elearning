// ==============================================================================
// HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
// SCRIPT TAO DO THI TRI THUC (KNOWLEDGE GRAPH) VA TRUY VAN CHO NEO4J
// NHOM 18: NEN TANG E-LEARNING & LUYEN THI TRAC NGHIEM
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
  // Node Khoa hoc
  (c_nosql:Course {id: 'COURSE_NOSQL', name: 'Co So Du Lieu NoSQL', credits: 2, level: 'ChuyenNganh'}),
  (c_dbms:Course {id: 'COURSE_DBMS', name: 'He Quan Tri Co So Du Lieu', credits: 3, level: 'CoSoNganh'}),

  // Node Chu de kien thuc (Topic)
  (t_doc:Topic {id: 'TOPIC_DOC', name: 'Document Store Architecture', description: 'Mo hinh tai lieu BSON/JSON'}),
  (t_graph:Topic {id: 'TOPIC_GRAPH', name: 'Graph Database & Cypher', description: 'Mo hinh do thi va duong di'}),
  (t_kv:Topic {id: 'TOPIC_KV', name: 'Key-Value Memory Cache', description: 'Bo nho dem truy cap nhanh'}),
  (t_col:Topic {id: 'TOPIC_COL', name: 'Wide-Column Cassandra', description: 'Luu tru cot theo thoi gian'}),

  // Node Bai hoc (Lesson)
  (l_01:Lesson {id: 'LESSON_01', title: 'Tong quan ve NoSQL va RDBMS', order: 1}),
  (l_02:Lesson {id: 'LESSON_02', title: 'Thiet ke CSDL voi MongoDB', order: 2}),
  (l_03:Lesson {id: 'LESSON_03', title: 'Toi uu truy cap voi Redis', order: 3}),
  (l_04:Lesson {id: 'LESSON_04', title: 'Moi truong phan tan Cassandra', order: 4}),
  (l_05:Lesson {id: 'LESSON_05', title: 'Mo hinh hoa quan he voi Neo4j', order: 5}),

  // Node Ky nang (Skill)
  (s_design:Skill {id: 'SKILL_MODELING', name: 'Thiet ke Data Model NoSQL'}),
  (s_query:Skill {id: 'SKILL_CYPHER', name: 'Truy van Cypher Graph'}),
  (s_cache:Skill {id: 'SKILL_CACHE_STRATEGY', name: 'Chien luoc Cache & Leaderboard'}),
  (s_log:Skill {id: 'SKILL_TIME_SERIES', name: 'To chuc du lieu Time-Series'});

// 4. TAO CAC QUAN HE (5 LOAI RELATIONSHIP: CONTAINS, COVERS, REQUIRES, DEVELOPS, RELATED_TO)
CREATE
  // Course -> Lesson (CONTAINS)
  (c_nosql)-[:CONTAINS {semester: 7}]->(l_01),
  (c_nosql)-[:CONTAINS {semester: 7}]->(l_02),
  (c_nosql)-[:CONTAINS {semester: 7}]->(l_03),
  (c_nosql)-[:CONTAINS {semester: 7}]->(l_04),
  (c_nosql)-[:CONTAINS {semester: 7}]->(l_05),

  // Lesson -> Topic (COVERS)
  (l_02)-[:COVERS]->(t_doc),
  (l_03)-[:COVERS]->(t_kv),
  (l_04)-[:COVERS]->(t_col),
  (l_05)-[:COVERS]->(t_graph),

  // Dieu kien tien quyet giua cac khoa hoc va bai hoc (PREREQUISITE_OF / REQUIRES)
  (c_dbms)-[:PREREQUISITE_OF]->(c_nosql),
  (l_01)-[:PREREQUISITE_OF]->(l_02),
  (l_02)-[:PREREQUISITE_OF]->(l_03),
  (l_01)-[:PREREQUISITE_OF]->(l_05),

  // Lesson -> Skill (DEVELOPS)
  (l_02)-[:DEVELOPS {score: 80}]->(s_design),
  (l_03)-[:DEVELOPS {score: 75}]->(s_cache),
  (l_04)-[:DEVELOPS {score: 70}]->(s_log),
  (l_05)-[:DEVELOPS {score: 90}]->(s_query),

  // Quan he bo tro giua cac Topic (RELATED_TO)
  (t_doc)-[:RELATED_TO {relevance: 'high'}]->(t_graph),
  (t_kv)-[:RELATED_TO {relevance: 'medium'}]->(t_col);

// ==============================================================================
// CAC CAU TRUY VAN MINH CHUNG NANG LUC (DEMO TREN NEO4J BROWSER CHO GIANG VIEN)
// ==============================================================================

// 1. Truy van truc quan toan bo cay do thi cua khoa hoc NoSQL:
// MATCH p=(c:Course {id: 'COURSE_NOSQL'})-[*1..2]->(x)
// RETURN p;

// 2. Truy van tim lo trinh hoc tap (Cac bai hoc tien quyet can hoc de toi Lesson 05):
// MATCH path = (start:Lesson)-[:PREREQUISITE_OF*]->(target:Lesson {id: 'LESSON_05'})
// RETURN [n in nodes(path) | n.title] AS LoTrinhHocTap;

// 3. Truy van tim tat ca ky nang ma khoa hoc NoSQL giup sinh vien phat trien:
// MATCH (:Course {id: 'COURSE_NOSQL'})-[:CONTAINS]->(l:Lesson)-[r:DEVELOPS]->(s:Skill)
// RETURN l.title AS BaiHoc, s.name AS KyNangDatDuoc, r.score AS DiemDanhGia
// ORDER BY DiemDanhGia DESC;
