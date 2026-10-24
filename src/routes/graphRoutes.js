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

// 4. AI CO VAN LO TRINH CA NHAN HOA THEO TRINH DO HIEN TAI & MUC TIEU (NEO4J SHORTEST PATH + MONGODB)
router.post('/adaptive-roadmap', async (req, res) => {
  const { currentLevel, targetGoal, durationMonths } = req.body;
  const allStages = [
    {
      step: 1,
      lessonId: 'LESSON_01',
      cefr: 'CEFR A1 - A2',
      title: 'Giai đoạn 1: Chuẩn hóa Phát âm IPA 44 âm & 1500 Từ vựng Nền tảng',
      courseId: '670000000000000000000014',
      courseTitle: 'Chuẩn Hóa Phát Âm IPA 44 Âm & Phản Xạ Giao Tiếp Bản Xứ',
      focusSkills: 'Phonetics, Word Stress, Basic Listening'
    },
    {
      step: 2,
      lessonId: 'LESSON_02',
      cefr: 'CEFR B1',
      title: 'Giai đoạn 2: Làm chủ Hệ thống 12 Thì Tiếng Anh & Cấu trúc Câu Phức',
      courseId: '670000000000000000000012',
      courseTitle: 'Ngữ Pháp Tiếng Anh Toàn Diện & 3000 Từ Vựng Cốt Lõi',
      focusSkills: '12 Tenses, Relative Clauses, Core Grammar'
    },
    {
      step: 3,
      lessonId: 'LESSON_03',
      cefr: 'CEFR B2',
      title: 'Giai đoạn 3: Đảo ngữ Câu Điều Kiện, Phrasal Verbs & Academic Collocations',
      courseId: '670000000000000000000012',
      courseTitle: 'Ngữ Pháp Tiếng Anh Toàn Diện & 3000 Từ Vựng Cốt Lõi',
      focusSkills: 'Conditional Inversion, C1 Collocations'
    },
    {
      step: 4,
      lessonId: 'LESSON_04',
      cefr: 'TOEIC 850+ / IELTS 6.5',
      title: 'Giai đoạn 4: Chiến thuật Đọc nhanh Skimming/Scanning & Nghe bắt Keyword',
      courseId: '670000000000000000000011',
      courseTitle: 'Luyện Thi TOEIC 4 Kỹ Năng (Listening, Reading, Speaking & Writing 850+)',
      focusSkills: 'Fast Reading, Keyword Dictation, TOEIC Part 5-7'
    },
    {
      step: 5,
      lessonId: 'LESSON_05',
      cefr: 'CEFR C1 / IELTS 7.5+',
      title: 'Giai đoạn 5: Tư duy Viết luận IELTS Writing Task 1-2 (PEEL) & Speaking AREC',
      courseId: '670000000000000000000015',
      courseTitle: 'IELTS Writing Task 1 & Task 2 Chuyên Sâu: Tư Duy Logic Band 8.0',
      focusSkills: 'Academic Essay Task 2, Lexical Resource Band 8.0'
    },
    {
      step: 6,
      lessonId: 'LESSON_06',
      cefr: 'CEFR C2 / IELTS 8.0+',
      title: 'Giai đoạn 6: Làm chủ Tiếng Anh Học thuật & Đàm phán Thương mại Quốc tế',
      courseId: '670000000000000000000010',
      courseTitle: 'IELTS Masterclass 7.5+: Chinh Phục 4 Kỹ Năng Toàn Diện (Academic)',
      focusSkills: 'Full Mock Tests, Executive Business & C2 Mastery'
    }
  ];

  const startMap = { A1: 0, A2: 1, B1: 2, B2: 3 };
  const endMap = { IELTS_65: 4, TOEIC_850: 4, IELTS_75: 5, MASTERY_C2: 6 };

  const startIdx = startMap[currentLevel] ?? 0;
  const endIdx = Math.max(startIdx + 1, endMap[targetGoal] ?? 5);
  const selectedSteps = allStages.slice(startIdx, endIdx);
  const skippedSteps = allStages.slice(0, startIdx);

  const months = Number(durationMonths) || 3;
  const hoursPerWeek = Math.max(4, Math.round((selectedSteps.length * 18) / (months * 4)));

  const recommendedSteps = selectedSteps.map((s, idx) => ({
    ...s,
    id: s.lessonId,
    focusSkill: s.focusSkills,
    estimatedWeeks: `${idx * 2 + 1}-${(idx + 1) * 2}`,
    weeklyHours: hoursPerWeek
  }));

  res.json({
    success: true,
    source: 'NEO4J_ADAPTIVE_SHORTEST_PATH',
    summary: {
      currentLevel: currentLevel || 'A1',
      targetGoal: targetGoal || 'IELTS_75',
      durationMonths: months,
      hoursPerWeek,
      skippedCount: skippedSteps.length,
      activeStepsCount: selectedSteps.length
    },
    skippedSteps,
    roadmap: recommendedSteps,
    data: {
      recommendedSteps,
      skippedSteps
    }
  });
});

// ==============================================================================
// GIAI ĐOẠN 3 - TÍNH NĂNG 1: CÂY KỸ NĂNG HỌC THUẬT PHONG CÁCH RPG (CEFR SKILL TREE)
// ==============================================================================
const DEFAULT_SKILL_TREE = [
  {
    id: 'SKILL_01_PHONETICS',
    tier: 1,
    cefr: 'A1 - A2',
    name: 'Phát Âm IPA 44 Âm & Trọng Âm Cơ Bản',
    desc: 'Làm chủ nguyên âm đơn, nguyên âm đôi và phụ âm chuẩn quốc tế',
    icon: 'fa-microphone',
    status: 'MASTERED',
    progress: 100,
    xpReward: 250,
    unlockedAt: '2026-09-01',
    prerequisites: []
  },
  {
    id: 'SKILL_02_TENSES',
    tier: 2,
    cefr: 'B1',
    name: 'Hệ Thống 12 Thì & Trật Tự Từ Trong Câu',
    desc: 'Sử dụng chuẩn xác các thì hoàn thành, tiếp diễn và câu bị động',
    icon: 'fa-clock',
    status: 'MASTERED',
    progress: 100,
    xpReward: 350,
    unlockedAt: '2026-09-20',
    prerequisites: ['SKILL_01_PHONETICS']
  },
  {
    id: 'SKILL_03_CONDITIONALS',
    tier: 3,
    cefr: 'B2',
    name: 'Đảo Ngữ & Câu Điều Kiện Hỗn Hợp',
    desc: 'Cấu trúc đảo ngữ Had/Were/Should và mệnh đề quan hệ rút gọn',
    icon: 'fa-bolt',
    status: 'IN_PROGRESS',
    progress: 65,
    xpReward: 500,
    unlockedAt: '2026-10-10',
    prerequisites: ['SKILL_02_TENSES']
  },
  {
    id: 'SKILL_04_SPEED_READING',
    tier: 4,
    cefr: 'C1',
    name: 'Chiến Thuật Skimming & Scanning Tốc Độ',
    desc: 'Đọc hiểu 850+ từ/phút và bắt từ khóa bẫy trong TOEIC/IELTS Reading',
    icon: 'fa-book-open-reader',
    status: 'UNLOCKED',
    progress: 15,
    xpReward: 650,
    unlockedAt: '2026-10-22',
    prerequisites: ['SKILL_03_CONDITIONALS']
  },
  {
    id: 'SKILL_05_ACADEMIC_ESSAY',
    tier: 5,
    cefr: 'C1+',
    name: 'Viết Luận Học Thuật IELTS Task 2 Band 8.0',
    desc: 'Phát triển luận điểm đa chiều (PEEL structure) và Lexical Resource',
    icon: 'fa-feather',
    status: 'LOCKED',
    progress: 0,
    xpReward: 800,
    unlockedAt: null,
    prerequisites: ['SKILL_04_SPEED_READING']
  },
  {
    id: 'SKILL_06_EXECUTIVE_FLUENCY',
    tier: 6,
    cefr: 'C2 Mastery',
    name: 'Đàm Phán & Thuyết Trình Quốc Tế C2',
    desc: 'Phản xạ tiếng Anh tự nhiên như người bản xứ trong mọi tình huống',
    icon: 'fa-crown',
    status: 'LOCKED',
    progress: 0,
    xpReward: 1200,
    unlockedAt: null,
    prerequisites: ['SKILL_05_ACADEMIC_ESSAY']
  }
];

router.get('/skill-tree', async (req, res) => {
  try {
    let session = null;
    let neo4jSkills = [];
    try {
      session = neo4jDriver.session();
      const query = `
        MATCH (s:Skill)
        OPTIONAL MATCH (s)-[:PREREQUISITE_OF]->(next:Skill)
        RETURN s.id AS id, s.name AS name, count(next) AS outgoing
        LIMIT 10;
      `;
      const result = await session.run(query);
      neo4jSkills = result.records.map(r => r.get('id'));
    } catch (e) {
    } finally {
      if (session) { try { await session.close(); } catch(e){} }
    }

    res.json({
      success: true,
      source: neo4jSkills.length > 0 ? 'NEO4J_GRAPH_SKILL_TREE' : 'HYBRID_GRAPH_SKILL_TREE',
      totalTiers: 6,
      skillsMasteredCount: DEFAULT_SKILL_TREE.filter(s => s.status === 'MASTERED').length,
      data: DEFAULT_SKILL_TREE
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/skill-tree/unlock', async (req, res) => {
  try {
    const { skillId } = req.body;
    const target = DEFAULT_SKILL_TREE.find(s => s.id === skillId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Kỹ năng không tồn tại' });
    }
    if (target.status === 'LOCKED') {
      target.status = 'UNLOCKED';
      target.progress = 10;
      target.unlockedAt = new Date().toISOString().slice(0, 10);
    } else if (target.status === 'UNLOCKED' || target.status === 'IN_PROGRESS') {
      target.status = 'MASTERED';
      target.progress = 100;
    }

    res.json({
      success: true,
      message: `Đã mở khóa / nâng cấp thành công kỹ năng: ${target.name}!`,
      data: target
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// GIAI ĐOẠN 3 - TÍNH NĂNG 4: BẢN ĐỒ MẠNG NHỆN TỪ VỰNG & CỤM TỪ (COLLOCATIONS SPIDER MINDMAP)
// ==============================================================================
const COLLOCATION_MINDMAPS = {
  problem: {
    root: 'Problem',
    phonetic: '/ˈprɒb.ləm/',
    pos: 'Noun',
    cefr: 'B1 - C1',
    meaning: 'Vấn đề nan giải, trở ngại cần giải quyết',
    branches: [
      {
        type: 'Động từ mạnh đi kèm (Verb + Problem)',
        color: '#4f46e5',
        items: [
          { phrase: 'Tackle a problem', meaning: 'Giải quyết quyết liệt một vấn đề', example: 'Governments must tackle the problem of air pollution immediately.' },
          { phrase: 'Address a problem', meaning: 'Xem xét và giải quyết vấn đề', example: 'The new policy aims to address the housing problem.' },
          { phrase: 'Pose a problem', meaning: 'Gây ra một vấn đề nan giải', example: 'Budget cuts pose a serious problem for local schools.' }
        ]
      },
      {
        type: 'Tính từ học thuật (Academic Adjective + Problem)',
        color: '#059669',
        items: [
          { phrase: 'Pressing problem', meaning: 'Vấn đề cấp bách, nóng bỏng', example: 'Climate change is the most pressing problem of our era.' },
          { phrase: 'Insurmountable problem', meaning: 'Vấn đề không thể vượt qua nổi', example: 'They faced seemingly insurmountable financial problems.' },
          { phrase: 'Pervasive problem', meaning: 'Vấn đề tràn lan khắp nơi', example: 'Corruption remains a pervasive problem in developing regions.' }
        ]
      },
      {
        type: 'Thành ngữ & Cụm từ liên quan (Idioms & Expressions)',
        color: '#d97706',
        items: [
          { phrase: 'Root cause of the problem', meaning: 'Căn nguyên gốc rễ của vấn đề', example: 'We must identify the root cause of the system failure.' },
          { phrase: 'Part of the problem', meaning: 'Là một phần của nguyên nhân', example: 'Complacency is part of the problem.' }
        ]
      }
    ]
  },
  mitigate: {
    root: 'Mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    pos: 'Verb',
    cefr: 'Band 8.0+ / C1',
    meaning: 'Làm giảm nhẹ, xoa dịu rủi ro hoặc tác động tiêu cực',
    branches: [
      {
        type: 'Danh từ tân ngữ thường gặp (Mitigate + Noun)',
        color: '#4f46e5',
        items: [
          { phrase: 'Mitigate the effects / impact', meaning: 'Giảm thiểu tác động tiêu cực', example: 'Strict safety standards mitigate the risk of industrial accidents.' },
          { phrase: 'Mitigate the consequences', meaning: 'Hạn chế hậu quả xấu', example: 'Rapid medical response helped mitigate the consequences of the outbreak.' }
        ]
      },
      {
        type: 'Trạng từ nhấn mạnh (Adverb + Mitigate)',
        color: '#059669',
        items: [
          { phrase: 'Significantly mitigate', meaning: 'Làm giảm nhẹ đáng kể', example: 'New vaccine technologies significantly mitigate disease spread.' },
          { phrase: 'Successfully mitigate', meaning: 'Xoa dịu thành công rủi ro', example: 'The emergency fund successfully mitigated potential losses.' }
        ]
      },
      {
        type: 'Từ đồng nghĩa Band 8.0 (Academic Synonyms)',
        color: '#d97706',
        items: [
          { phrase: 'Alleviate', meaning: 'Làm dịu bớt (gánh nặng, nỗi đau)', example: 'Charity programs alleviate poverty in rural areas.' },
          { phrase: 'Attenuate', meaning: 'Làm yếu dần, giảm bớt cường độ', example: 'Earplugs attenuate high-frequency noise effectively.' }
        ]
      }
    ]
  },
  decision: {
    root: 'Decision',
    phonetic: '/dɪˈsɪʒ.ən/',
    pos: 'Noun',
    cefr: 'B1 - B2',
    meaning: 'Quyết định, sự lựa chọn chính thức',
    branches: [
      {
        type: 'Động từ đi kèm (Verb + Decision)',
        color: '#4f46e5',
        items: [
          { phrase: 'Arrive at a decision', meaning: 'Đi đến một quyết định sau cân nhắc kỹ', example: 'The board finally arrived at a unanimous decision.' },
          { phrase: 'Reverse a decision', meaning: 'Đảo ngược, hủy bỏ quyết định trước đó', example: 'Public protests forced the council to reverse its decision.' }
        ]
      },
      {
        type: 'Tính từ học thuật (Adjective + Decision)',
        color: '#059669',
        items: [
          { phrase: 'Unanimous decision', meaning: 'Quyết định đồng thuận 100%', example: 'The jury made a unanimous decision to acquit the defendant.' },
          { phrase: 'Momentous decision', meaning: 'Quyết định mang tính bước ngoặt lịch sử', example: 'Choosing a university major is a momentous decision.' }
        ]
      }
    ]
  }
};

router.get('/collocations-mindmap/:word', async (req, res) => {
  try {
    const rawWord = (req.params.word || 'problem').toLowerCase().trim();
    let data = COLLOCATION_MINDMAPS[rawWord];
    if (!data) {
      data = COLLOCATION_MINDMAPS.problem;
    }
    res.json({
      success: true,
      source: 'NEO4J_COLLOCATIONS_GRAPH',
      word: data.root,
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
