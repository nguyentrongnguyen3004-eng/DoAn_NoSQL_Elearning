// ==============================================================================
// HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
// SCRIPT DONG BO & KHOI TAO DU LIEU TOAN DIEN CHO CA 4 DATABASE NOSQL:
// 1. MongoDB (Document Store)
// 2. Redis (Key-Value In-Memory Cache & ZSET Leaderboard)
// 3. Apache Cassandra (Wide-Column Time-Series Telemetry)
// 4. Neo4j (Graph Database - CEFR A1 -> C2 Knowledge Graph)
// ==============================================================================

require('dotenv').config();
const { execSync } = require('child_process');
const Redis = require('ioredis');
const cassandra = require('cassandra-driver');
const neo4j = require('neo4j-driver');

async function seedAll4Databases() {
  console.log('==================================================================');
  console.log('🚀 BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU EDUPRO ENGLISH LÊN CẢ 4 HỆ CSDL NOSQL');
  console.log('==================================================================\n');

  // 1. SEED MONGODB
  console.log('📦 [1/4] Đang khởi tạo dữ liệu trên MongoDB...');
  try {
    execSync('node scripts/mongo_seed.js', { stdio: 'inherit' });
    console.log('✅ [1/4] MongoDB: Đã nạp xong 7 Users, 12 Khóa học Tiếng Anh, 19 Bài giảng, 8 Câu hỏi & Đề thi!\n');
  } catch (err) {
    console.error('⚠️ [1/4] MongoDB lỗi:', err.message, '\n');
  }

  // 2. SEED REDIS
  console.log('⚡ [2/4] Đang khởi tạo Cache & Bảng xếp hạng ZSET trên Redis...');
  const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000
  });
  redis.on('error', () => {});

  try {
    await redis.connect();
    await redis.del('courses:catalog:published');
    const lbKey = 'exam:670000000000000000000040:leaderboard';
    await redis.del(lbKey);
    await redis.zadd(lbKey, 10.0, 'Nguyễn Trọng Nguyên (2001230589)');
    await redis.zadd(lbKey, 8.75, 'Phạm Nguyễn Khôi Nguyên (2001230578)');
    await redis.zadd(lbKey, 7.5, 'Võ Huỳnh Gia Huy (2001230303)');
    console.log('✅ [2/4] Redis: Đã làm mới Cache khóa học & khởi tạo Bảng xếp hạng ZSET!\n');
  } catch (err) {
    console.log('ℹ️ [2/4] Redis Container đang tắt (Hệ thống sẽ dùng In-Memory Redis Fallback cho đến khi bật Docker).\n');
  } finally {
    try { redis.disconnect(); } catch (e) {}
  }

  // 3. SEED APACHE CASSANDRA
  console.log('📊 [3/4] Đang khởi tạo Keyspace & Bảng Time-Series Log trên Apache Cassandra...');
  const cassandraInitClient = new cassandra.Client({
    contactPoints: [process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1'],
    localDataCenter: process.env.CASSANDRA_LOCAL_DATA_CENTER || 'datacenter1',
    socketOptions: { connectTimeout: 3000 }
  });

  try {
    await cassandraInitClient.connect();
    await cassandraInitClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS elearning_logs
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
    `);
    await cassandraInitClient.execute(`
      CREATE TABLE IF NOT EXISTS elearning_logs.learning_events (
        student_id text,
        event_time timestamp,
        event_id uuid,
        event_type text,
        course_id text,
        lesson_id text,
        session_id text,
        duration_seconds int,
        payload text,
        PRIMARY KEY ((student_id), event_time, event_id)
      ) WITH CLUSTERING ORDER BY (event_time DESC, event_id ASC);
    `);
    await cassandraInitClient.execute(`
      INSERT INTO elearning_logs.learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload)
      VALUES ('2001230589', toTimestamp(now()), uuid(), 'PLAY_LESSON', '670000000000000000000010', '670000000000000000000021', 'SESS_IELTS_01', 300, '{"course":"IELTS Masterclass 7.5+"}');
    `);
    console.log('✅ [3/4] Apache Cassandra: Đã tạo Keyspace elearning_logs, bảng learning_events & ghi log mẫu!\n');
  } catch (err) {
    console.log('ℹ️ [3/4] Cassandra Container đang tắt (Hệ thống sẽ dùng In-Memory Telemetry Fallback cho đến khi bật Docker).\n');
  } finally {
    try { await cassandraInitClient.shutdown(); } catch (e) {}
  }

  // 4. SEED NEO4J KNOWLEDGE GRAPH
  console.log('🕸️ [4/4] Đang khởi tạo Đồ thị Tri thức Tiếng Anh (CEFR A1 -> C2) trên Neo4j...');
  const neo4jDriver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://127.0.0.1:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USER || 'neo4j',
      process.env.NEO4J_PASSWORD || 'nosql_project_2026'
    ),
    { connectionTimeout: 3000 }
  );

  let session = null;
  try {
    await neo4jDriver.verifyConnectivity();
    session = neo4jDriver.session();
    await session.run('MATCH (n) DETACH DELETE n');
    await session.run(`
      CREATE 
        (c_ielts:Course {id: 'COURSE_01', name: 'IELTS Masterclass 7.5+: Chinh Phục 4 Kỹ Năng Toàn Diện', credits: 4, level: 'Nâng cao'}),
        (c_toeic:Course {id: 'COURSE_02', name: 'Luyện Thi TOEIC 4 Kỹ Năng 850+', credits: 3, level: 'Trung cấp'}),
        (c_grammar:Course {id: 'COURSE_03', name: 'Ngữ Pháp Tiếng Anh Toàn Diện & 3000 Từ Vựng (CEFR A2-B2)', credits: 3, level: 'Cơ bản'}),
        (c_biz:Course {id: 'COURSE_04', name: 'Tiếng Anh Giao Tiếp Thương Mại & Phỏng Vấn Quốc Tế', credits: 3, level: 'Trung cấp'}),
        (c_ipa:Course {id: 'COURSE_05', name: 'Chuẩn Hóa Phát Âm IPA 44 Âm & Phản Xạ Giao Tiếp', credits: 2, level: 'Cơ bản'}),
        (c_writing:Course {id: 'COURSE_06', name: 'IELTS Writing Task 1 & Task 2 Band 8.0', credits: 3, level: 'Nâng cao'}),

        (t_ipa:Topic {id: 'TOPIC_PHONETICS', name: 'Phonetics & IPA 44 Sounds'}),
        (t_tenses:Topic {id: 'TOPIC_GRAMMAR_TENSES', name: '12 English Tenses & Syntax'}),
        (t_colloc:Topic {id: 'TOPIC_COLLOCATIONS', name: 'Academic Vocabulary & Idioms'}),
        (t_receptive:Topic {id: 'TOPIC_RECEPTIVE', name: 'Reading & Listening Strategies'}),
        (t_productive:Topic {id: 'TOPIC_PRODUCTIVE', name: 'Academic Writing & Speaking'}),
        (t_biz:Topic {id: 'TOPIC_BUSINESS', name: 'Global Business Communication'}),

        (l_01:Lesson {id: 'LESSON_01', title: 'Chuẩn hóa Phát âm IPA 44 âm & Từ vựng nền tảng (CEFR A1-A2)', order: 1}),
        (l_02:Lesson {id: 'LESSON_02', title: 'Hệ thống 12 Thì Tiếng Anh & Cấu trúc câu cốt lõi (CEFR B1)', order: 2}),
        (l_03:Lesson {id: 'LESSON_03', title: 'Câu điều kiện, Mệnh đề quan hệ & Academic Collocations (CEFR B2)', order: 3}),
        (l_04:Lesson {id: 'LESSON_04', title: 'Chiến thuật đọc nhanh Skimming/Scanning & Nghe bắt Keyword (TOEIC/IELTS)', order: 4}),
        (l_05:Lesson {id: 'LESSON_05', title: 'Tư duy viết luận IELTS Task 1-2 & Phản xạ Speaking Fluency (CEFR C1)', order: 5}),
        (l_06:Lesson {id: 'LESSON_06', title: 'Làm chủ Tiếng Anh Học thuật & Giao tiếp Quốc tế (Mastery C2 / IELTS 8.0+)', order: 6}),

        (s_pronun:Skill {id: 'SKILL_PRONUNCIATION', name: 'Phát Âm & Ngữ Điệu Bản Xứ'}),
        (s_grammar:Skill {id: 'SKILL_GRAMMAR_ACCURACY', name: 'Grammatical Range & Accuracy'}),
        (s_reading:Skill {id: 'SKILL_SPEED_READING', name: 'Đọc Hiểu & Nghe Bắt Ý Chính'}),
        (s_writing:Skill {id: 'SKILL_ACADEMIC_WRITING', name: 'Viết Luận Học Thuật Band 8.0'}),
        (s_speaking:Skill {id: 'SKILL_FLUENT_SPEAKING', name: 'Giao Tiếp & Thuyết Trình Quốc Tế'}),

        (c_ipa)-[:CONTAINS]->(l_01),
        (c_grammar)-[:CONTAINS]->(l_02),
        (c_grammar)-[:CONTAINS]->(l_03),
        (c_toeic)-[:CONTAINS]->(l_04),
        (c_ielts)-[:CONTAINS]->(l_05),
        (c_writing)-[:CONTAINS]->(l_05),
        (c_biz)-[:CONTAINS]->(l_06),
        (c_ielts)-[:CONTAINS]->(l_06),

        (l_01)-[:PREREQUISITE_OF]->(l_02),
        (l_02)-[:PREREQUISITE_OF]->(l_03),
        (l_03)-[:PREREQUISITE_OF]->(l_04),
        (l_04)-[:PREREQUISITE_OF]->(l_05),
        (l_05)-[:PREREQUISITE_OF]->(l_06),

        (l_01)-[:COVERS]->(t_ipa),
        (l_02)-[:COVERS]->(t_tenses),
        (l_03)-[:COVERS]->(t_colloc),
        (l_04)-[:COVERS]->(t_receptive),
        (l_05)-[:COVERS]->(t_productive),
        (l_06)-[:COVERS]->(t_biz),

        (l_01)-[:DEVELOPS]->(s_pronun),
        (l_02)-[:DEVELOPS]->(s_grammar),
        (l_03)-[:DEVELOPS]->(s_grammar),
        (l_04)-[:DEVELOPS]->(s_reading),
        (l_05)-[:DEVELOPS]->(s_writing),
        (l_06)-[:DEVELOPS]->(s_speaking);
    `);
    console.log('✅ [4/4] Neo4j: Đã tạo 23 Nodes & 25 Relationships đồ thị tri thức Tiếng Anh CEFR A1 -> C2!\n');
  } catch (err) {
    console.log('ℹ️ [4/4] Neo4j Container đang tắt (Hệ thống sẽ dùng Embedded Graph Fallback cho đến khi bật Docker).\n');
  } finally {
    if (session) { try { await session.close(); } catch (e) {} }
    try { await neo4jDriver.close(); } catch (e) {}
  }

  console.log('==================================================================');
  console.log('🎉 HOÀN TẤT ĐỒNG BỘ DỮ LIỆU CHO HỆ THỐNG 4 DATABASE NOSQL!');
  console.log('==================================================================');
  process.exit(0);
}

seedAll4Databases();
