(async () => {
  const loginRes = await fetch('http://localhost:5050/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '2001230589', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  console.log('Login OK, student:', loginData.data.user.fullName);

  const listRes = await fetch('http://localhost:5050/api/exams/list/all');
  const listData = await listRes.json();
  console.log('Exams catalog count:', listData.data.length);

  const examIds = [
    '670000000000000000000040',
    '67000000000000000000004a',
    '67000000000000000000004b',
    '67000000000000000000004c',
    '67000000000000000000004d',
    '67000000000000000000004e',
    '67000000000000000000004f',
    '670000000000000000000050',
    '670000000000000000000051',
    '670000000000000000000052'
  ];

  for (let i = 0; i < examIds.length; i++) {
    const eid = examIds[i];
    const startRes = await fetch('http://localhost:5050/api/exams/' + eid + '/start', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const startData = await startRes.json();
    if (!startData.success) {
      console.error('Failed to start exam', eid, startData);
      continue;
    }
    const qCount = startData.data.questions.length;
    const title = startData.data.examTitle;
    const sampleQ = startData.data.questions[0];
    const hasLeak = ('correctAnswer' in sampleQ) || ('explanation' in sampleQ);
    console.log(`[Exam ${i + 1}] ID: ${eid} | Title: '${title}' | Questions: ${qCount} | Anti-leak verified: ${!hasLeak}`);
  }

  // Test submitting exam 5
  const testExamId = '67000000000000000000004d';
  console.log('\nTesting answer submission for Exam 5...');
  const answerRes = await fetch('http://localhost:5050/api/exams/' + testExamId + '/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ questionId: '670000000000000000000053', selectedOption: 'B' })
  });
  const answerData = await answerRes.json();
  console.log('Realtime answer saved to Redis:', answerData.success);

  const submitRes = await fetch('http://localhost:5050/api/exams/' + testExamId + '/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ answers: { '670000000000000000000053': 'B' } })
  });
  const submitData = await submitRes.json();
  console.log('Submit result:', submitData.success, '| Score:', submitData.data.score, '| Correct:', submitData.data.correctCount, '/', submitData.data.totalCount);
  console.log('Detailed answer sample explanation:', submitData.data.detailedAnswers[0].explanation);
})();
