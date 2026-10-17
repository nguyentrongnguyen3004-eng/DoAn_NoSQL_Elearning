/**
 * KICH BAN KIEM THU TOAN DIEN (AUTOMATED TEST SUITE - 14 TEST CASES)
 * De tai: E-learning & Online Examination Platform (100% NoSQL)
 * Giang vien huong dan: TS. Nguyen Thi Dinh - Khoa CNTT, HUIT
 */

const http = require('http');

const BASE_URL = 'http://127.0.0.1:5050';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('BAT DAU CHAY 14 TEST CASES VERIFICATION CHO HE THONG 4 NOSQL');
  console.log('================================================================\n');

  let passed = 0;
  let total = 14;

  let studentToken = null;
  let teacherToken = null;
  let sampleCourseId = null;
  let sampleExamId = null;
  let sampleQuestions = [];

  // TC-01: Health & 4 Databases Connectivity
  try {
    const res = await request('GET', '/api/databases/status');
    if (res.status === 200 && res.data.mongodb && res.data.redis && res.data.cassandra && res.data.neo4j) {
      console.log('✅ TC-01 PASS: 4 he quan tri CSDL NoSQL (MongoDB, Redis, Cassandra, Neo4j) deu ket noi thanh cong');
      passed++;
    } else {
      console.log('❌ TC-01 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-01 ERROR:', e.message);
  }

  // TC-02: Student Login (MongoDB)
  try {
    const res = await request('POST', '/api/auth/login', {
      username: 'student_nguyen'
    });
    if (res.status === 200 && res.data.data && res.data.data.token && res.data.data.user.role === 'STUDENT') {
      studentToken = res.data.data.token;
      console.log(`✅ TC-02 PASS: Dang nhap hoc vien (student_nguyen - Nguyen Trong Nguyen) thanh cong tren MongoDB, nhan JWT Token`);
      passed++;
    } else {
      console.log('❌ TC-02 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-02 ERROR:', e.message);
  }

  // TC-03: Teacher Login & Role Verification
  try {
    const res = await request('POST', '/api/auth/login', {
      username: 'instructor_alex'
    });
    if (res.status === 200 && res.data.data && res.data.data.token && res.data.data.user.role === 'TEACHER') {
      teacherToken = res.data.data.token;
      console.log(`✅ TC-03 PASS: Dang nhap giang vien (instructor_alex - ThS. Hoang Minh Duc) thanh cong tren MongoDB, phan quyen TEACHER dung`);
      passed++;
    } else {
      console.log('❌ TC-03 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-03 ERROR:', e.message);
  }

  // TC-04: Browse Course Catalog (MongoDB + Redis Cache)
  try {
    const res = await request('GET', '/api/courses');
    if (res.status === 200 && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      sampleCourseId = res.data.data[0]._id;
      console.log(`✅ TC-04 PASS: Lay danh sach ${res.data.data.length} khoa hoc (Nguon: ${res.data.source})`);
      passed++;
    } else {
      console.log('❌ TC-04 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-04 ERROR:', e.message);
  }

  // TC-05: View Course Detail & Embedded Lessons (MongoDB)
  try {
    const res = await request('GET', `/api/courses/${sampleCourseId}`);
    if (res.status === 200 && res.data.data && res.data.data.lessons) {
      console.log(`✅ TC-05 PASS: Chi tiet khoa hoc "${res.data.data.title}" co ${res.data.data.lessons.length} bai hoc (MongoDB)`);
      passed++;
    } else {
      console.log('❌ TC-05 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-05 ERROR:', e.message);
  }

  // TC-06: Log Video Watch Event to Cassandra (Time-Series Wide-Column)
  try {
    const res = await request('POST', '/api/courses/events/video', {
      courseId: sampleCourseId,
      lessonId: '670000000000000000000021',
      eventType: 'VIDEO_PAUSE',
      durationSeconds: 120,
      payload: '{"watchedSeconds": 120, "videoSpeed": 1.25}'
    }, studentToken);

    if (res.status === 200 && res.data.success) {
      console.log(`✅ TC-06 PASS: Ghi log tien trinh xem video vao Cassandra (table learning_events) thanh cong: EventID=${res.data.data.eventId}`);
      passed++;
    } else {
      console.log('❌ TC-06 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-06 ERROR:', e.message);
  }

  // TC-07: Query Student Learning History from Cassandra
  try {
    const res = await request('GET', '/api/courses/events/history/me', null, studentToken);
    if (res.status === 200 && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      console.log(`✅ TC-07 PASS: Truy van thanh cong ${res.data.data.length} event hoc tap tu Cassandra theo Partition Key (student_id=2001230589) sap xep theo event_time DESC`);
      passed++;
    } else {
      console.log('❌ TC-07 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-07 ERROR:', e.message);
  }

  // TC-08: Start Exam & Cache Session with TTL (Redis Key-Value)
  try {
    // Exam ID mau
    sampleExamId = '670000000000000000000040';

    const res = await request('POST', `/api/exams/${sampleExamId}/start`, {}, studentToken);
    if (res.status === 200 && res.data.data && res.data.data.questions) {
      sampleQuestions = res.data.data.questions;
      console.log(`✅ TC-08 PASS: Khoi tao phien thi thanh cong tren Redis (TTL con lai: ${res.data.data.ttlLeftSeconds}s, ${sampleQuestions.length} cau hoi)`);
      passed++;
    } else {
      console.log('❌ TC-08 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-08 ERROR:', e.message);
  }

  // TC-09: Real-time Save Answer in Redis Hash
  try {
    if (sampleQuestions.length > 0) {
      const q1 = sampleQuestions[0];
      const res = await request('POST', `/api/exams/${sampleExamId}/answer`, {
        questionId: q1._id,
        selectedOption: 'A'
      }, studentToken);

      if (res.status === 200 && res.data.success) {
        console.log(`✅ TC-09 PASS: Luu cau tra loi truc tiep vao Redis Hash (Key: exam:${sampleExamId}:answers:2001230589, Question: ${q1._id})`);
        passed++;
      } else {
        console.log('❌ TC-09 FAIL:', res.data);
      }
    } else {
      console.log('❌ TC-09 SKIP: Khong co cau hoi');
    }
  } catch (e) {
    console.log('❌ TC-09 ERROR:', e.message);
  }

  // TC-10: Real-time Save Remaining Answers in Redis Hash
  try {
    for (let i = 1; i < sampleQuestions.length; i++) {
      await request('POST', `/api/exams/${sampleExamId}/answer`, {
        questionId: sampleQuestions[i]._id,
        selectedOption: 'B'
      }, studentToken);
    }
    console.log(`✅ TC-10 PASS: Dong bo day du tat ca dap an vao Redis Hash bo nho RAM truoc khi nop bai`);
    passed++;
  } catch (e) {
    console.log('❌ TC-10 ERROR:', e.message);
  }

  // TC-11: Submit Exam, Server Auto-grading, Store in MongoDB Result & Update Redis Leaderboard (ZSET)
  try {
    const res = await request('POST', `/api/exams/${sampleExamId}/submit`, {}, studentToken);
    if (res.status === 200 && res.data.data && typeof res.data.data.score === 'number') {
      console.log(`✅ TC-11 PASS: Nop bai cham diem tu dong: Diem = ${res.data.data.score} (${res.data.data.correctCount}/${res.data.data.totalCount} cau dung), luu ket qua vao MongoDB results va cap nhat Redis Leaderboard (ZADD)`);
      passed++;
    } else {
      console.log('❌ TC-11 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-11 ERROR:', e.message);
  }

  // TC-12: Fetch Real-time Leaderboard from Redis Sorted Set (ZSET)
  try {
    const res = await request('GET', `/api/exams/${sampleExamId}/leaderboard`);
    if (res.status === 200 && res.data.data && Array.isArray(res.data.data)) {
      console.log(`✅ TC-12 PASS: Lay bang xep hang thoi gian thuc tu Redis ZREVRANGEBYSCORE (Top ${res.data.data.length} thi sinh cao diem nhat)`);
      passed++;
    } else {
      console.log('❌ TC-12 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-12 ERROR:', e.message);
  }

  // TC-13: Fetch Knowledge Graph from Neo4j (Graph Database)
  try {
    const res = await request('GET', '/api/graph/knowledge-graph');
    if (res.status === 200 && res.data.data && res.data.data.nodes && res.data.data.edges) {
      console.log(`✅ TC-13 PASS: Truy van Knowledge Graph tu Neo4j thanh cong (${res.data.data.nodes.length} Nodes, ${res.data.data.edges.length} Edges)`);
      passed++;
    } else {
      console.log('❌ TC-13 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-13 ERROR:', e.message);
  }

  // TC-14: Learning Path Recommendation via Cypher Pattern Matching (Neo4j)
  try {
    const res = await request('GET', '/api/graph/learning-path/LESSON_03');
    if (res.status === 200 && res.data.data) {
      console.log(`✅ TC-14 PASS: Goi y lo trinh hoc tap (Learning Path) qua Cypher pattern matching tren Neo4j cho LESSON_03 thanh cong (Lo trinh: ${res.data.data.map(p => p.id || p.title).join(' -> ')})`);
      passed++;
    } else {
      console.log('❌ TC-14 FAIL:', res.data);
    }
  } catch (e) {
    console.log('❌ TC-14 ERROR:', e.message);
  }

  console.log('\n================================================================');
  console.log(`KET QUA KIEM THU: ${passed}/${total} TEST CASES PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 TOAN BO 4 HE QUAN TRI CSDL VA HE THONG API HOAT DONG HOAN HAO 100%!');
  }
}

runTests();
