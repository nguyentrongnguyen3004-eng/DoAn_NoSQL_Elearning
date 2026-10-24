const express = require('express');
const { neo4jDriver } = require('../config/db');

const router = express.Router();

// Bộ dữ liệu đồ thị tri thức Tiếng Anh (CEFR A1 -> C2) & Lộ trình chuẩn (Fallback khi Neo4j chưa khởi động hoặc offline)
const FALLBACK_KNOWLEDGE_GRAPH = {
  nodes: [
    // Courses (Khóa học Tiếng Anh)
    { id: 'COURSE_01', label: 'Course: IELTS Masterclass 7.5+', group: 'Course', properties: { title: 'IELTS Masterclass 7.5+: Chinh Phục 4 Kỹ Năng Toàn Diện' } },
    { id: 'COURSE_02', label: 'Course: TOEIC 4 Kỹ Năng 850+', group: 'Course', properties: { title: 'Luyện Thi TOEIC 4 Kỹ Năng (Listening, Reading, Speaking & Writing 850+)' } },
    { id: 'COURSE_03', label: 'Course: Ngữ Pháp & 3000 Từ Vựng', group: 'Course', properties: { title: 'Ngữ Pháp Tiếng Anh Toàn Diện & 3000 Từ Vựng Cốt Lõi (CEFR A2 - B2)' } },
    { id: 'COURSE_04', label: 'Course: Business English', group: 'Course', properties: { title: 'Tiếng Anh Giao Tiếp Thương Mại & Phỏng Vấn Quốc Tế' } },
    { id: 'COURSE_05', label: 'Course: Phát Âm IPA 44 Âm', group: 'Course', properties: { title: 'Chuẩn Hóa Phát Âm IPA 44 Âm & Phản Xạ Giao Tiếp Bản Xứ' } },
    { id: 'COURSE_06', label: 'Course: IELTS Writing Band 8.0', group: 'Course', properties: { title: 'IELTS Writing Task 1 & Task 2 Chuyên Sâu: Tư Duy Logic Band 8.0' } },

    // Lessons (Chuỗi bài học tiên quyết theo khung tham chiếu châu Âu CEFR A1 -> C2)
    { id: 'LESSON_01', label: 'Lesson 1: Phát âm IPA 44 âm & Từ vựng A1-A2', group: 'Lesson', properties: { title: 'Chuẩn hóa Phát âm IPA 44 âm & Từ vựng nền tảng (CEFR A1-A2)', order: 1 } },
    { id: 'LESSON_02', label: 'Lesson 2: 12 Thì Tiếng Anh & Cấu trúc câu B1', group: 'Lesson', properties: { title: 'Hệ thống 12 Thì Tiếng Anh & Cấu trúc câu cốt lõi (CEFR B1)', order: 2 } },
    { id: 'LESSON_03', label: 'Lesson 3: Ngữ pháp nâng cao & Collocations B2', group: 'Lesson', properties: { title: 'Câu điều kiện, Mệnh đề quan hệ & Academic Collocations (CEFR B2)', order: 3 } },
    { id: 'LESSON_04', label: 'Lesson 4: Chiến thuật Skimming, Scanning & Listening', group: 'Lesson', properties: { title: 'Chiến thuật đọc nhanh Skimming/Scanning & Nghe bắt Keyword (TOEIC/IELTS)', order: 4 } },
    { id: 'LESSON_05', label: 'Lesson 5: IELTS Academic Writing & Speaking C1', group: 'Lesson', properties: { title: 'Tư duy viết luận IELTS Task 1-2 & Phản xạ Speaking Fluency (CEFR C1)', order: 5 } },
    { id: 'LESSON_06', label: 'Lesson 6: Làm chủ Tiếng Anh Học Thuật & Thương Mại C2', group: 'Lesson', properties: { title: 'Làm chủ Tiếng Anh Học thuật & Giao tiếp Quốc tế (Mastery C2 / IELTS 8.0+)', order: 6 } },

    // Topics (Chủ điểm kiến thức ngôn ngữ)
    { id: 'TOPIC_PHONETICS', label: 'Topic: Phonetics & IPA 44 Sounds', group: 'Topic', properties: { name: 'Ngữ âm học, Trọng âm & Ngữ điệu câu' } },
    { id: 'TOPIC_GRAMMAR_TENSES', label: 'Topic: 12 English Tenses & Syntax', group: 'Topic', properties: { name: 'Hệ thống 12 thì & Cú pháp câu chuẩn' } },
    { id: 'TOPIC_COLLOCATIONS', label: 'Topic: Academic Vocabulary & Idioms', group: 'Topic', properties: { name: 'Từ vựng học thuật, Collocations & Phrasal Verbs' } },
    { id: 'TOPIC_RECEPTIVE', label: 'Topic: Reading & Listening Strategies', group: 'Topic', properties: { name: 'Chiến thuật xử lý bài đọc & nghe học thuật' } },
    { id: 'TOPIC_PRODUCTIVE', label: 'Topic: Essay Writing & Speaking', group: 'Topic', properties: { name: 'Viết luận học thuật PEEL & Phản xạ nói AREC' } },
    { id: 'TOPIC_BUSINESS', label: 'Topic: Global Business Communication', group: 'Topic', properties: { name: 'Đàm phán, Thuyết trình & Email thương mại' } },

    // Skills (Kỹ năng đầu ra đạt được)
    { id: 'SKILL_PRONUNCIATION', label: 'Skill: Phát Âm & Ngữ Điệu Bản Xứ', group: 'Skill', properties: { name: 'Phát âm chuẩn xác & nối âm tự nhiên' } },
    { id: 'SKILL_GRAMMAR_ACCURACY', label: 'Skill: Grammatical Range & Accuracy', group: 'Skill', properties: { name: 'Sử dụng linh hoạt cấu trúc câu phức & đảo ngữ' } },
    { id: 'SKILL_SPEED_READING', label: 'Skill: Đọc Hiểu & Nghe Bắt Ý Chính', group: 'Skill', properties: { name: 'Giải quyết đề Reading/Listening tốc độ cao' } },
    { id: 'SKILL_ACADEMIC_WRITING', label: 'Skill: Viết Luận Học Thuật Band 8.0', group: 'Skill', properties: { name: 'Phân tích biểu đồ & viết Essay sắc bén' } },
    { id: 'SKILL_FLUENT_SPEAKING', label: 'Skill: Giao Tiếp & Thuyết Trình Quốc Tế', group: 'Skill', properties: { name: 'Phản xạ tiếng Anh trôi chảy trong công việc' } }
  ],
  edges: [
    // Course -> Lesson
    { from: 'COURSE_05', to: 'LESSON_01', label: 'CONTAINS' },
    { from: 'COURSE_03', to: 'LESSON_02', label: 'CONTAINS' },
    { from: 'COURSE_03', to: 'LESSON_03', label: 'CONTAINS' },
    { from: 'COURSE_02', to: 'LESSON_04', label: 'CONTAINS' },
    { from: 'COURSE_01', to: 'LESSON_05', label: 'CONTAINS' },
    { from: 'COURSE_06', to: 'LESSON_05', label: 'CONTAINS' },
    { from: 'COURSE_04', to: 'LESSON_06', label: 'CONTAINS' },
    { from: 'COURSE_01', to: 'LESSON_06', label: 'CONTAINS' },

    // Prerequisite chain (Lộ trình tiên quyết từ A1 -> C2)
    { from: 'LESSON_01', to: 'LESSON_02', label: 'PREREQUISITE_OF' },
    { from: 'LESSON_02', to: 'LESSON_03', label: 'PREREQUISITE_OF' },
    { from: 'LESSON_03', to: 'LESSON_04', label: 'PREREQUISITE_OF' },
    { from: 'LESSON_04', to: 'LESSON_05', label: 'PREREQUISITE_OF' },
    { from: 'LESSON_05', to: 'LESSON_06', label: 'PREREQUISITE_OF' },

    // Lesson -> Topic
    { from: 'LESSON_01', to: 'TOPIC_PHONETICS', label: 'COVERS' },
    { from: 'LESSON_02', to: 'TOPIC_GRAMMAR_TENSES', label: 'COVERS' },
    { from: 'LESSON_03', to: 'TOPIC_COLLOCATIONS', label: 'COVERS' },
    { from: 'LESSON_04', to: 'TOPIC_RECEPTIVE', label: 'COVERS' },
    { from: 'LESSON_05', to: 'TOPIC_PRODUCTIVE', label: 'COVERS' },
    { from: 'LESSON_06', to: 'TOPIC_BUSINESS', label: 'COVERS' },

    // Lesson -> Skill
    { from: 'LESSON_01', to: 'SKILL_PRONUNCIATION', label: 'DEVELOPS' },
    { from: 'LESSON_02', to: 'SKILL_GRAMMAR_ACCURACY', label: 'DEVELOPS' },
    { from: 'LESSON_03', to: 'SKILL_GRAMMAR_ACCURACY', label: 'DEVELOPS' },
    { from: 'LESSON_04', to: 'SKILL_SPEED_READING', label: 'DEVELOPS' },
    { from: 'LESSON_05', to: 'SKILL_ACADEMIC_WRITING', label: 'DEVELOPS' },
    { from: 'LESSON_06', to: 'SKILL_FLUENT_SPEAKING', label: 'DEVELOPS' }
  ]
};

// 1. LAY TOAN BO DO THI TRI THUC (NODES & EDGES CHO VIS.JS / D3 TREN FRONTEND)
router.get('/knowledge-graph', async (req, res) => {
  let session = null;
  try {
    session = neo4jDriver.session();
    const query = `
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m;
    `;

    const result = await session.run(query);
    const nodesMap = new Map();
    const edges = [];

    result.records.forEach(record => {
      const nodeA = record.get('n');
      const rel = record.get('r');
      const nodeB = record.get('m');

      if (nodeA && !nodesMap.has(nodeA.identity.toString())) {
        nodesMap.set(nodeA.identity.toString(), {
          id: nodeA.properties.id || nodeA.identity.toString(),
          label: (nodeA.labels[0] || 'Node') + ': ' + (nodeA.properties.name || nodeA.properties.title || nodeA.properties.id),
          group: nodeA.labels[0] || 'Topic',
          properties: nodeA.properties
        });
      }

      if (nodeB && !nodesMap.has(nodeB.identity.toString())) {
        nodesMap.set(nodeB.identity.toString(), {
          id: nodeB.properties.id || nodeB.identity.toString(),
          label: (nodeB.labels[0] || 'Node') + ': ' + (nodeB.properties.name || nodeB.properties.title || nodeB.properties.id),
          group: nodeB.labels[0] || 'Topic',
          properties: nodeB.properties
        });
      }

      if (rel && nodeA && nodeB) {
        edges.push({
          from: nodeA.properties.id || nodeA.identity.toString(),
          to: nodeB.properties.id || nodeB.identity.toString(),
          label: rel.type
        });
      }
    });

    if (nodesMap.size === 0) {
      // Nếu Neo4j rỗng, trả fallback đồ thị tri thức Tiếng Anh
      return res.json({
        success: true,
        source: 'FALLBACK_KNOWLEDGE_GRAPH',
        data: FALLBACK_KNOWLEDGE_GRAPH
      });
    }

    res.json({
      success: true,
      source: 'NEO4J_GRAPH_DATABASE',
      data: {
        nodes: Array.from(nodesMap.values()),
        edges: edges
      }
    });
  } catch (err) {
    // Fallback mượt mà khi Neo4j chưa khởi chạy hoặc Docker offline
    console.warn('[KnowledgeGraph] Neo4j offline/error, falling back to embedded graph:', err.message);
    res.json({
      success: true,
      source: 'FALLBACK_KNOWLEDGE_GRAPH',
      note: 'Dữ liệu đồ thị tri thức Tiếng Anh hiển thị ở chế độ Offline/Embedded (English Knowledge Graph)',
      data: FALLBACK_KNOWLEDGE_GRAPH
    });
  } finally {
    if (session) {
      try { await session.close(); } catch (e) {}
    }
  }
});

// 2. TIM LO TRINH HOC TAP (CAC BAI HOC TIEN QUYET DE DAT TOI 1 BAI HOC MUC TIEU)
router.get('/learning-path/:lessonId', async (req, res) => {
  const targetLessonId = req.params.lessonId;
  let session = null;
  try {
    session = neo4jDriver.session();
    const query = `
      MATCH path = (start:Lesson)-[:PREREQUISITE_OF*]->(target:Lesson {id: $targetId})
      RETURN [n in nodes(path) | {id: n.id, title: n.title, order: n.order}] AS learningPath;
    `;

    const result = await session.run(query, { targetId: targetLessonId });
    const paths = result.records.map(r => r.get('learningPath'));

    if (paths.length > 0) {
      return res.json({
        success: true,
        source: 'NEO4J_CYPHER_GRAPH',
        targetLessonId: targetLessonId,
        data: paths[0]
      });
    }
  } catch (err) {
    console.warn('[LearningPath] Neo4j offline/error:', err.message);
  } finally {
    if (session) {
      try { await session.close(); } catch (e) {}
    }
  }

  // Fallback lộ trình chuẩn theo khung năng lực Tiếng Anh CEFR (A1 -> C2)
  const lessonSteps = [
    { id: 'LESSON_01', title: 'Chuẩn hóa Phát âm IPA 44 âm & Từ vựng nền tảng (CEFR A1-A2)', order: 1 },
    { id: 'LESSON_02', title: 'Hệ thống 12 Thì Tiếng Anh & Cấu trúc câu cốt lõi (CEFR B1)', order: 2 },
    { id: 'LESSON_03', title: 'Câu điều kiện, Mệnh đề quan hệ & Academic Collocations (CEFR B2)', order: 3 },
    { id: 'LESSON_04', title: 'Chiến thuật đọc nhanh Skimming/Scanning & Nghe bắt Keyword (TOEIC/IELTS)', order: 4 },
    { id: 'LESSON_05', title: 'Tư duy viết luận IELTS Task 1-2 & Phản xạ Speaking Fluency (CEFR C1)', order: 5 },
    { id: 'LESSON_06', title: 'Làm chủ Tiếng Anh Học thuật & Giao tiếp Quốc tế (Mastery C2 / IELTS 8.0+)', order: 6 }
  ];

  const targetIdx = lessonSteps.findIndex(l => l.id === targetLessonId);
  const fallbackPath = targetIdx >= 0 ? lessonSteps.slice(0, targetIdx + 1) : [
    { id: targetLessonId, title: 'Bài học Tiếng Anh mục tiêu', order: 1 }
  ];

  res.json({
    success: true,
    source: 'FALLBACK_LEARNING_PATH',
    targetLessonId: targetLessonId,
    data: fallbackPath
  });
});

// 3. GOI Y KHOA HOC LIEN QUAN QUA DO THI TRI THUC NEO4J (COLLABORATIVE GRAPH RECOMMENDATION)
router.get('/recommendations/:courseId', async (req, res) => {
  const courseId = req.params.courseId;
  let session = null;
  try {
    session = neo4jDriver.session();
    const query = `
      MATCH (c:Course {id: $courseId})-[:CONTAINS]->(l:Lesson)-[:DEVELOPS|COVERS]->(entity)
      MATCH (otherCourse:Course)-[:CONTAINS]->(otherLesson:Lesson)-[:DEVELOPS|COVERS]->(entity)
      WHERE otherCourse.id <> $courseId
      RETURN otherCourse.id AS id, otherCourse.name AS title, count(DISTINCT entity) AS sharedConnections
      ORDER BY sharedConnections DESC
      LIMIT 3;
    `;

    const result = await session.run(query, { courseId });
    const recommendations = result.records.map((r, idx) => ({
      id: r.get('id'),
      courseId: ['670000000000000000000015', '670000000000000000000011', '670000000000000000000012'][idx % 3],
      title: r.get('title'),
      targetBand: ['IELTS 8.0+', 'TOEIC 850+', 'CEFR B2'][idx % 3],
      reason: 'Liên kết qua Đồ thị Kỹ năng Neo4j (Cùng nhánh từ vựng & ngữ pháp học thuật)',
      sharedConnections: r.get('sharedConnections').toInt ? r.get('sharedConnections').toInt() : r.get('sharedConnections')
    }));

    if (recommendations.length > 0) {
      return res.json({
        success: true,
        source: 'NEO4J_GRAPH_RECOMMENDATION',
        targetCourse: courseId,
        data: recommendations
      });
    }
  } catch (err) {
    console.warn('[Recommendations] Neo4j offline/error:', err.message);
  } finally {
    if (session) {
      try { await session.close(); } catch (e) {}
    }
  }

  // Fallback gợi ý khóa học Tiếng Anh bổ trợ thông minh
  res.json({
    success: true,
    source: 'FALLBACK_GRAPH_RECOMMENDATION',
    targetCourse: courseId,
    data: [
      {
        id: 'COURSE_06',
        courseId: '670000000000000000000015',
        title: 'IELTS Writing Task 1 & Task 2 Chuyên Sâu: Tư Duy Logic Band 8.0',
        targetBand: 'IELTS 8.0+',
        reason: 'Cùng phát triển kỹ năng Academic Writing & Lexical Resource trên đồ thị Neo4j',
        sharedConnections: 5
      },
      {
        id: 'COURSE_02',
        courseId: '670000000000000000000011',
        title: 'Luyện Thi TOEIC 4 Kỹ Năng (Listening, Reading, Speaking & Writing 850+)',
        targetBand: 'TOEIC 850+',
        reason: 'Bổ trợ chiến thuật Skimming/Scanning & Nghe bắt Keyword tốc độ cao',
        sharedConnections: 4
      },
      {
        id: 'COURSE_03',
        courseId: '670000000000000000000012',
        title: 'Ngữ Pháp Tiếng Anh Toàn Diện & 3000 Từ Vựng Cốt Lõi (CEFR A2 - B2)',
        targetBand: 'CEFR B2',
        reason: 'Củng cố nền tảng 12 Thì Tiếng Anh, Đảo ngữ & Academic Collocations',
        sharedConnections: 3
      }
    ]
  });
});

module.exports = router;
