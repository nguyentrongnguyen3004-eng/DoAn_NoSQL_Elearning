const express = require('express');
const { neo4jDriver } = require('../config/db');

const router = express.Router();

// 1. LAY TOAN BO DO THI TRI THUC (NODES & EDGES CHO VIS.JS / D3 TREN FRONTEND)
router.get('/knowledge-graph', async (req, res) => {
  const session = neo4jDriver.session();
  try {
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
          label: nodeA.labels[0] + ': ' + (nodeA.properties.name || nodeA.properties.title || nodeA.properties.id),
          group: nodeA.labels[0],
          properties: nodeA.properties
        });
      }

      if (nodeB && !nodesMap.has(nodeB.identity.toString())) {
        nodesMap.set(nodeB.identity.toString(), {
          id: nodeB.properties.id || nodeB.identity.toString(),
          label: nodeB.labels[0] + ': ' + (nodeB.properties.name || nodeB.properties.title || nodeB.properties.id),
          group: nodeB.labels[0],
          properties: nodeB.properties
        });
      }

      if (rel) {
        edges.push({
          from: nodeA.properties.id || nodeA.identity.toString(),
          to: nodeB.properties.id || nodeB.identity.toString(),
          label: rel.type
        });
      }
    });

    res.json({
      success: true,
      source: 'NEO4J_GRAPH_DATABASE',
      data: {
        nodes: Array.from(nodesMap.values()),
        edges: edges
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi Neo4j: ' + err.message });
  } finally {
    await session.close();
  }
});

// 2. TIM LO TRINH HOC TAP (CAC BAI HOC TIEN QUYET DE DAT TOI 1 BAI HOC MUC TIEU)
router.get('/learning-path/:lessonId', async (req, res) => {
  const session = neo4jDriver.session();
  try {
    const targetLessonId = req.params.lessonId;
    const query = `
      MATCH path = (start:Lesson)-[:PREREQUISITE_OF*]->(target:Lesson {id: $targetId})
      RETURN [n in nodes(path) | {id: n.id, title: n.title, order: n.order}] AS learningPath;
    `;

    const result = await session.run(query, { targetId: targetLessonId });
    const paths = result.records.map(r => r.get('learningPath'));

    res.json({
      success: true,
      source: 'NEO4J_CYPHER_GRAPH',
      targetLessonId: targetLessonId,
      data: paths.length > 0 ? paths[0] : [{ id: targetLessonId, note: 'Khong co dieu kien tien quyet' }]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
});

// 3. GOI Y KHOA HOC LIEN QUAN QUA DO THI TRI THUC NEO4J (COLLABORATIVE GRAPH RECOMMENDATION)
router.get('/recommendations/:courseId', async (req, res) => {
  const session = neo4jDriver.session();
  try {
    const courseId = req.params.courseId;
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

    // Fallback neu khong co quan he trung
    const data = recommendations.length > 0 ? recommendations : [
      { id: 'COURSE_DBMS', title: 'Hệ Quản Trị Cơ Sở Dữ Liệu Chuyên Sâu', sharedConnections: 2 }
    ];

    res.json({
      success: true,
      source: 'NEO4J_GRAPH_RECOMMENDATION',
      targetCourse: courseId,
      data: data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi Neo4j Recommendation: ' + err.message });
  } finally {
    await session.close();
  }
});

module.exports = router;

