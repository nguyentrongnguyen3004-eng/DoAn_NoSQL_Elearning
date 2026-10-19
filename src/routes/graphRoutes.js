const express = require('express');
const { neo4jDriver } = require('../config/db');

const router = express.Router();

// Bộ dữ liệu đồ thị tri thức kiến trúc NoSQL & Lộ trình chuẩn (Fallback khi Neo4j chưa khởi động hoặc offline)
const FALLBACK_KNOWLEDGE_GRAPH = {
  nodes: [
    // Courses
    { id: 'COURSE_01', label: 'Course: MongoDB Masterclass', group: 'Course', properties: { title: 'MongoDB Masterclass: Document Store Toàn Diện' } },
    { id: 'COURSE_02', label: 'Course: Redis High-Performance', group: 'Course', properties: { title: 'Redis Chuyên Sâu: Caching, Pub/Sub & In-Memory' } },
    { id: 'COURSE_03', label: 'Course: Cassandra Big Data', group: 'Course', properties: { title: 'Apache Cassandra: Phân Tán Dữ Liệu Quy Mô Lớn' } },
    { id: 'COURSE_04', label: 'Course: Neo4j Knowledge Graph', group: 'Course', properties: { title: 'Neo4j & Đồ Thị Tri Thức Doanh Nghiệp' } },
    { id: 'COURSE_05', label: 'Course: Enterprise Data Architect', group: 'Course', properties: { title: 'Kiến Trúc Sư Dữ Liệu Enterprise Polyglot' } },
    { id: 'COURSE_06', label: 'Course: Elasticsearch Fulltext', group: 'Course', properties: { title: 'Elasticsearch & Phân Tích Dữ Liệu Tìm Kiếm' } },

    // Lessons
    { id: 'LESSON_01', label: 'Lesson: MongoDB Cơ bản & CRUD', group: 'Lesson', properties: { title: 'MongoDB Cơ bản & CRUD', order: 1 } },
    { id: 'LESSON_02', label: 'Lesson: Thiết kế Schema & Sharding', group: 'Lesson', properties: { title: 'Thiết kế Schema & Sharding', order: 2 } },
    { id: 'LESSON_03', label: 'Lesson: In-Memory Caching & Sorted Sets', group: 'Lesson', properties: { title: 'In-Memory Caching & Sorted Sets', order: 3 } },
    { id: 'LESSON_04', label: 'Lesson: Phân vùng Cassandra & Ring Token', group: 'Lesson', properties: { title: 'Phân vùng Cassandra & Ring Token', order: 4 } },
    { id: 'LESSON_05', label: 'Lesson: Cypher Query & Graph Analytics', group: 'Lesson', properties: { title: 'Cypher Query & Graph Analytics', order: 5 } },
    { id: 'LESSON_06', label: 'Lesson: Tích Hợp Polyglot Persistence', group: 'Lesson', properties: { title: 'Tích Hợp Polyglot Persistence', order: 6 } },

    // Topics
    { id: 'TOPIC_DOCUMENT', label: 'Topic: Document Modeling BSON', group: 'Topic', properties: { name: 'Mô hình hóa tài liệu BSON linh hoạt' } },
    { id: 'TOPIC_SHARDING', label: 'Topic: Sharding & Horizontal Scalability', group: 'Topic', properties: { name: 'Mở rộng phân cụm ngang' } },
    { id: 'TOPIC_CACHE', label: 'Topic: TTL Cache & ZSET Leaderboard', group: 'Topic', properties: { name: 'Bộ nhớ đệm siêu tốc độ & Xếp hạng' } },
    { id: 'TOPIC_PARTITIONING', label: 'Topic: Masterless & Murmur3 Token Hash', group: 'Topic', properties: { name: 'Kiến trúc không điểm lỗi đơn' } },
    { id: 'TOPIC_GRAPH_REASONING', label: 'Topic: Graph Traversal & Path Finding', group: 'Topic', properties: { name: 'Duyệt đồ thị và suy luận tri thức' } },
    { id: 'TOPIC_POLYGLOT', label: 'Topic: Multi-Model Architecture', group: 'Topic', properties: { name: 'Kiến trúc kết hợp đa CSDL NoSQL' } },

    // Skills
    { id: 'SKILL_SCHEMA_OPT', label: 'Skill: Tối Ưu Schema MongoDB', group: 'Skill', properties: { name: 'Thiết kế schema chịu tải cao' } },
    { id: 'SKILL_CACHE_STRATEGY', label: 'Skill: Chiến Lược Cache Invalidation', group: 'Skill', properties: { name: 'Quản lý cache hiệu quả' } },
    { id: 'SKILL_DISTRIBUTED_WRITE', label: 'Skill: Ghi Phân Tán High-Throughput', group: 'Skill', properties: { name: 'Ghi log hàng triệu TPS' } },
    { id: 'SKILL_GRAPH_MODELING', label: 'Skill: Khám Phá Tri Thức Đồ Thị', group: 'Skill', properties: { name: 'Phân tích mạng lưới liên kết' } },
    { id: 'SKILL_ENTERPRISE_ARCH', label: 'Skill: Thiết Kế Hệ Thống Đa NoSQL', group: 'Skill', properties: { name: 'Data Architect toàn diện' } }
  ],
  edges: [
    // Course -> Lesson
    { from: 'COURSE_01', to: 'LESSON_01', label: 'CONTAINS' },
    { from: 'COURSE_01', to: 'LESSON_02', label: 'CONTAINS' },
    { from: 'COURSE_02', to: 'LESSON_03', label: 'CONTAINS' },
    { from: 'COURSE_03', to: 'LESSON_04', label: 'CONTAINS' },
    { from: 'COURSE_04', to: 'LESSON_05', label: 'CONTAINS' },
    { from: 'COURSE_05', to: 'LESSON_06', label: 'CONTAINS' },

    // Prerequisite chain (Lộ trình tiên quyết)
    { from: 'LESSON_01', to: 'LESSON_02', label: 'PREREQUISITE_OF' },
    { from: 'LESSON_02', to: 'LESSON_03', label: 'PREREQUISITE_OF' },
    { from: 'LESSON_03', to: 'LESSON_04', label: 'PREREQUISITE_OF' },
    { from: 'LESSON_04', to: 'LESSON_05', label: 'PREREQUISITE_OF' },
    { from: 'LESSON_05', to: 'LESSON_06', label: 'PREREQUISITE_OF' },

    // Lesson -> Topic
    { from: 'LESSON_01', to: 'TOPIC_DOCUMENT', label: 'COVERS' },
    { from: 'LESSON_02', to: 'TOPIC_SHARDING', label: 'COVERS' },
    { from: 'LESSON_03', to: 'TOPIC_CACHE', label: 'COVERS' },
    { from: 'LESSON_04', to: 'TOPIC_PARTITIONING', label: 'COVERS' },
    { from: 'LESSON_05', to: 'TOPIC_GRAPH_REASONING', label: 'COVERS' },
    { from: 'LESSON_06', to: 'TOPIC_POLYGLOT', label: 'COVERS' },

    // Lesson -> Skill
    { from: 'LESSON_02', to: 'SKILL_SCHEMA_OPT', label: 'DEVELOPS' },
    { from: 'LESSON_03', to: 'SKILL_CACHE_STRATEGY', label: 'DEVELOPS' },
    { from: 'LESSON_04', to: 'SKILL_DISTRIBUTED_WRITE', label: 'DEVELOPS' },
    { from: 'LESSON_05', to: 'SKILL_GRAPH_MODELING', label: 'DEVELOPS' },
    { from: 'LESSON_06', to: 'SKILL_ENTERPRISE_ARCH', label: 'DEVELOPS' }
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
      // Nếu Neo4j rỗng, trả fallback đồ thị tri thức
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
      note: 'Dữ liệu đồ thị tri thức hiển thị ở chế độ Offline/Embedded (NoSQL Learning Network)',
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

  // Fallback lộ trình chuẩn theo thứ tự bài học
  const lessonSteps = [
    { id: 'LESSON_01', title: 'MongoDB Cơ bản & CRUD', order: 1 },
    { id: 'LESSON_02', title: 'Thiết kế Schema & Sharding', order: 2 },
    { id: 'LESSON_03', title: 'In-Memory Caching & Sorted Sets (Redis)', order: 3 },
    { id: 'LESSON_04', title: 'Phân vùng Cassandra & Ring Token', order: 4 },
    { id: 'LESSON_05', title: 'Cypher Query & Graph Analytics (Neo4j)', order: 5 },
    { id: 'LESSON_06', title: 'Tích Hợp Polyglot Persistence', order: 6 }
  ];

  const targetIdx = lessonSteps.findIndex(l => l.id === targetLessonId);
  const fallbackPath = targetIdx >= 0 ? lessonSteps.slice(0, targetIdx + 1) : [
    { id: targetLessonId, title: 'Bài học mục tiêu', order: 1 }
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
    const recommendations = result.records.map(r => ({
      id: r.get('id'),
      title: r.get('title'),
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

  // Fallback gợi ý thông minh
  res.json({
    success: true,
    source: 'FALLBACK_GRAPH_RECOMMENDATION',
    targetCourse: courseId,
    data: [
      { id: 'COURSE_02', title: 'Redis Chuyên Sâu: Caching, Pub/Sub & In-Memory', sharedConnections: 4 },
      { id: 'COURSE_03', title: 'Apache Cassandra: Phân Tán Dữ Liệu Quy Mô Lớn', sharedConnections: 3 },
      { id: 'COURSE_04', title: 'Neo4j & Đồ Thị Tri Thức Doanh Nghiệp', sharedConnections: 2 }
    ]
  });
});

module.exports = router;


