const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { JSDOM } = require('jsdom');
function setup(role = 'STUDENT') {
  const html = fs.readFileSync('public/index.html', 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost:5000', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.structuredClone = structuredClone; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
  w.localStorage.setItem('edupro_token', 'test'); w.localStorage.setItem('edupro_user', JSON.stringify({ id: 'student', fullName: 'Huy', role }));
  const main = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('const API_BASE'));
  const boot = main.replace(/if \(document.readyState === 'loading'\) \{[\s\S]*?bootstrapApplication\(\);\s*\}/, '');
  const requests = [];
  w.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    let data = { success: true, data: [] };
    if (url.endsWith('/start')) data.data = { questions: [{ _id: '670000000000000000000031', content: 'Question', options: [{ key: 'A', text: 'Answer' }] }], savedAnswers: {}, violations: 0, examTitle: 'Placement', attempt: { attemptId: 'one' }, ttlLeftSeconds: 1800 };
    if (url.endsWith('/submit')) data.data = { score: 0, correctCount: 0, totalCount: 1, answers: [], isDisqualified: false };
    if (url.includes('my-history')) Object.assign(data, { data: [], page: 1, totalPages: 1, total: 0 });
    if (url.endsWith('/gamification/profile')) data.data = { xp: 950, inventory: [{ itemId: 'streak_freeze' }], streakDays: 7, freezeCount: 1 };
    if (url.endsWith('/shop-items')) data.data = [{ _id: 'streak_freeze', name: 'Thẻ Streak Freeze', cost: 500 }, { _id: 'expensive', name: 'VIP', cost: 1000 }];
    return { ok: true, json: async () => data };
  };
  w.confirm = () => false;
  w.eval(boot + '\n' + fs.readFileSync('public/member2.js', 'utf8') + '\nwindow.__test={state:m2,setUser:r=>{currentUser.role=r},setQuestions:q=>{loadedQuestions=q},getAnswers:()=>userAnswers};');
  return { dom, w, requests };
}
test('2.8 UI: flag toggles orange navigation and blocks submission on cancel', async () => {
  const { dom, w, requests } = setup();
  try {
    await w.startExam(); w.m2Flag('670000000000000000000031');
    assert.equal(w.document.querySelectorAll('#m2-question-nav .m2-flag').length, 1);
    let message; w.confirm = value => { message = value; return false; };
    await w.submitExam(); assert.match(message, /1 câu hỏi/); assert.equal(requests.some(r => r.url.endsWith('/submit')), false);
    w.m2Flag('670000000000000000000031'); assert.equal(w.document.querySelectorAll('.m2-flag').length, 0);
  } finally { dom.window.close(); }
});
test('2.1 UI: retake resets flags, answers, modal and active state without reload', async () => {
  const { dom, w } = setup();
  try { await w.startExam(); w.m2Flag('670000000000000000000031'); await w.pickAnswer('670000000000000000000031', 'A'); w.document.getElementById('anti-cheat-modal').classList.remove('hidden');
    await w.retakeCurrentExam(); assert.equal(w.__test.state.flags.size, 0); assert.equal(Object.keys(w.__test.getAnswers()).length, 0); assert.ok(w.document.getElementById('anti-cheat-modal').classList.contains('hidden')); assert.equal(w.__test.state.active, true);
  } finally { dom.window.close(); }
});
test('2.3/2.4 UI: current balance, inventory, disabled purchase and snowflake', async () => {
  const { dom, w } = setup(); try { await w.m2LoadShop(); assert.equal(w.document.getElementById('m2-shop-balance').textContent, '950 XP'); assert.match(w.document.getElementById('m2-nav-xp').textContent, /❄️/); assert.equal(w.document.querySelectorAll('#m2-shop-items button:disabled').length, 1); assert.match(w.document.getElementById('m2-inventory').textContent, /Thẻ Streak Freeze: 1/); } finally { dom.window.close(); }
});
test('2.2/2.10 UI: review text is escaped; review delete shown only to admin', () => {
  const { dom, w } = setup(); try {
    const markup = w.m2ReviewHtml([{ content: '<script>attack()</script>', isCorrect: false, explanation: '<img onerror=attack()>' }]); assert.ok(!markup.includes('<script>')); assert.match(markup, /&lt;script&gt;/);
    const reviews = [{ _id: '670000000000000000000088', comment: 'Review', rating: 4 }];
    w.renderCourseReviews(reviews, 4); assert.ok(!w.document.getElementById('classroom-reviews-list').textContent.includes('Xóa đánh giá'));
    w.__test.setUser('TEACHER'); w.renderCourseReviews(reviews, 4); assert.ok(!w.document.getElementById('classroom-reviews-list').textContent.includes('Xóa đánh giá'));
    w.__test.setUser('ADMIN'); w.renderCourseReviews(reviews, 4); assert.ok(w.document.getElementById('classroom-reviews-list').textContent.includes('Xóa đánh giá'));
  } finally { dom.window.close(); }
});
test('2.5/2.6 UI: course and question editor prefill current values', () => {
  const { dom, w } = setup('ADMIN'); try {
    w.__test.state.courses = [{ _id: 'course', title: 'English', description: 'Desc', category: 'IELTS', price: 100, lessons: [{ title: 'Lesson 1', video: { url: 'https://example.com' } }] }];
    w.m2EditCourse(0); assert.equal(w.document.getElementById('m2-title').value, 'English'); assert.equal(w.document.querySelector('[data-lesson] input').value, 'Lesson 1');
    w.__test.state.questions = [{ _id: 'q', content: 'Choose', options: [...'ABCD'].map(text => ({ text })), correctAnswer: 'C', explanation: 'Reason' }];
    w.m2EditQuestion(0); assert.equal(w.document.getElementById('m2-correct').value, 'C'); assert.equal(w.document.getElementById('m2-explanation').value, 'Reason');
  } finally { dom.window.close(); }
});
