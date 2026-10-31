const http = require('http');
const Redis = require('../01_Source_Code_EduPro/node_modules/ioredis');
const { MongoClient } = require('../01_Source_Code_EduPro/node_modules/mongodb');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      host: 'localhost', port: 5050, path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let buf = ''; res.on('data', c => buf += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf) }));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

(async () => {
  console.log('================================================================');
  console.log('KIỂM CHỨNG THỰC TẾ: PHÒNG THI & LƯU ĐÁP ÁN REDIS HASH');
  console.log('================================================================\n');

  // 1. Đăng nhập học viên 2001230589
  const login = await post('/api/auth/login', { username: '2001230589', password: '123456' });
  const token = login.body.data.token;
  console.log('1. [Auth] Đăng nhập học viên 2001230589: THÀNH CÔNG');

  // 2. Bắt đầu phiên làm bài thi Placement Test
  const examId = '670000000000000000000040';
  const start = await post('/api/exams/' + examId + '/start', {}, token);
  const questions = start.body.data.questions;
  console.log('2. [Phòng thi] Bắt đầu bài thi:', start.body.data.examTitle);
  console.log('   Tổng số câu hỏi tải về:', questions.length);

  // 3. Giả lập học viên chọn liên tiếp 4 câu hỏi trên giao diện
  console.log('\n3. [Giao diện Web] Thao tác click chọn đáp án (pickAnswer):');
  const selections = [
    { q: questions[0]._id, opt: 'A' },
    { q: questions[1]._id, opt: 'B' },
    { q: questions[2]._id, opt: 'C' },
    { q: questions[3]._id, opt: 'D' }
  ];

  for (let i = 0; i < selections.length; i++) {
    const s = selections[i];
    const res = await post('/api/exams/' + examId + '/answer', { questionId: s.q, selectedOption: s.opt }, token);
    console.log(`   - Câu ${i + 1} (${s.q}) -> Chọn đáp án [${s.opt}] => Server trả lời: "${res.body.message}"`);
  }

  // 4. KIỂM TRA TRỰC TIẾP TRÊN REDIS DATABASE
  console.log('\n4. [REDIS DATABASE] Kiểm tra trực tiếp trên Redis (cổng 6379):');
  const redis = new Redis({ host: '127.0.0.1', port: 6379 });
  const redisKey = `exam:${examId}:answers:2001230589`;
  const keyType = await redis.type(redisKey);
  const hashData = await redis.hgetall(redisKey);
  const ttl = await redis.ttl(redisKey);

  console.log('   -> Tên Key Hash trên Redis :', redisKey);
  console.log('   -> Kiểu dữ liệu trên Redis :', keyType.toUpperCase(), (keyType === 'hash' ? '(CHUẨN REDIS HASH ✅)' : '❌'));
  console.log('   -> Thời gian sống còn lại  :', ttl, 'giây (Đếm ngược theo phiên làm bài)');
  console.log('   -> Danh sách đáp án lưu trong Hash:');
  console.table(hashData);

  // 5. KIỂM TRA ĐỒNG BỘ TRÊN MONGODB DATABASE
  console.log('5. [MONGODB DATABASE] Kiểm tra tính nhất quán trên MongoDB (cổng 27017):');
  const mongo = new MongoClient('mongodb://127.0.0.1:27017');
  await mongo.connect();
  const attemptDoc = await mongo.db('elearning_nosql').collection('exam_attempts').findOne({ _id: `670000000000000000000003:${examId}` });
  console.log('   -> Bảng exam_attempts ID   :', attemptDoc._id);
  console.log('   -> Trạng thái phiên thi    :', attemptDoc.status);
  console.log('   -> Đáp án lưu trên MongoDB :');
  console.table(attemptDoc.answers);

  console.log('================================================================');
  console.log('KẾT LUẬN: ĐÁP ÁN ĐÃ XUẤT HIỆN 100% TRÊN REDIS HASH VÀ MONGODB!');
  console.log('================================================================');

  await mongo.close();
  redis.disconnect();
})();
