/* Exam, rewards and CMS - member 2 */
const m2 = { active: false, submitting: false, saving: Promise.resolve(), failedAnswers: new Set(), flags: new Set(), page: 1, category: '', courses: [], questions: [], history: [], lessons: [] };
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const m2Staff = () => ['ADMIN', 'TEACHER'].includes(currentUser?.role);
const m2Admin = () => currentUser?.role === 'ADMIN';
const m2Button = (label, click, disabled = false) => `<button type="button" class="m2-btn" onclick="${click}" ${disabled ? 'disabled' : ''}>${label}</button>`;
async function m2Api(path, method = 'GET', body) {
  const response = await fetch(API_BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const json = await response.json();
  if (!response.ok || json.success === false) throw new Error(json.message || 'Yêu cầu không thành công.');
  return json;
}
function m2Error(e) { showToast(e.message, 'error'); }
function m2Modal(id, title, content) {
  document.getElementById(id)?.remove();
  const modal = document.createElement('div'); modal.id = id; modal.className = 'm2-overlay';
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', title);
  modal.innerHTML = `<div class="m2-dialog"><header><h2>${esc(title)}</h2>${m2Button('Đóng', `document.getElementById('${id}').remove()`)}</header>${content}</div>`;
  document.body.append(modal); modal.querySelector('input,button')?.focus();
}
async function retakeCurrentExam() {
  if (m2.submitting) return;
  try {
    await m2Api(`/exams/${EXAM_ID}/retake`, 'POST');
    sessionStorage.removeItem(`exam-flags:${m2.attemptId}`);
    m2.failedAnswers.clear(); m2.saving = Promise.resolve();
    m2.flags.clear(); userAnswers = {}; loadedQuestions = []; isExamDisqualified = false;
    clearInterval(examCountdown);
    document.getElementById('anti-cheat-modal').classList.add('hidden');
    document.getElementById('anti-cheat-modal-count').textContent = '0/3';
    document.getElementById('anti-cheat-btn-text').textContent = 'Tôi đã hiểu & quay lại làm bài';
    document.getElementById('anti-cheat-modal-title').textContent = 'Cảnh báo vi phạm quy chế thi';
    await startExam();
  } catch (e) { m2Error(e); }
}
startExam = async function () {
  if (!currentToken) { openLoginModal(); return; }
  m2.active = false; clearInterval(examCountdown);
  try {
    const { data } = await m2Api(`/exams/${EXAM_ID}/start`, 'POST');
    loadedQuestions = data.questions; userAnswers = data.savedAnswers || {}; isExamDisqualified = false;
    m2.flags = new Set(JSON.parse(sessionStorage.getItem(`exam-flags:${data.attempt.attemptId}`) || '[]'));
    m2.attemptId = data.attempt.attemptId; m2.active = true; window.isExamActive = true;
    document.getElementById('exam-page-title').textContent = data.examTitle;
    document.getElementById('anti-cheat-status-badge').textContent = `Vi phạm: ${data.violations}/3`;
    document.getElementById('anti-cheat-modal-count').textContent = `${data.violations}/3`;
    const demoBtn = document.getElementById('btn-demo-violation'); if (demoBtn) demoBtn.disabled = false;
    document.getElementById('exam-result-card').classList.add('hidden');
    renderExamQuestions(); runTimer(data.ttlLeftSeconds); await loadLeaderboard();

  } catch (e) {
    window.isExamActive = false; m2.active = false;
    document.getElementById('exam-questions-box').innerHTML = `<div class="m2-card">${esc(e.message)} ${m2Button('Làm lại đề thi', 'retakeCurrentExam()')}</div>`;
    m2Error(e);
  }
};
const m2RenderQuestions = renderExamQuestions;
renderExamQuestions = function () {
  m2RenderQuestions();
  const container = document.getElementById('exam-questions-box');
  [...container.children].forEach((card, i) => {
    const q = loadedQuestions[i]; if (!q) return;
    card.id = `question-${q._id}`;
    card.insertAdjacentHTML('beforeend', m2Button(m2.flags.has(String(q._id)) ? '🚩 Gỡ cờ xem lại' : 'Đặt cờ xem lại', `m2Flag('${q._id}')`));
  });
  document.getElementById('m2-question-nav')?.remove();
  const nav = document.createElement('div'); nav.id = 'm2-question-nav'; nav.className = 'm2-card m2-nav';
  nav.innerHTML = '<strong>Điều hướng câu hỏi</strong><p>Cam: cần xem lại · Xanh: đã trả lời</p>' + loadedQuestions.map((q, i) => `<button class="m2-btn ${m2.flags.has(String(q._id)) ? 'm2-flag' : userAnswers[q._id] ? 'm2-answered' : ''}" onclick="document.getElementById('question-${q._id}').scrollIntoView({behavior:'smooth',block:'center'})">${i + 1}</button>`).join('');
  container.before(nav);
};
function m2Flag(qid) {
  if (!m2.active) return;
  m2.flags.has(qid) ? m2.flags.delete(qid) : m2.flags.add(qid);
  sessionStorage.setItem(`exam-flags:${m2.attemptId}`, JSON.stringify([...m2.flags])); renderExamQuestions();
}
pickAnswer = async function (qid, letter) {
  if (!m2.active || isExamDisqualified || m2.submitting) return;
  userAnswers[qid] = letter; renderExamQuestions();
  const examId = EXAM_ID;
  m2.saving = m2.saving.then(() => m2Api(`/exams/${examId}/answer`, 'POST', { questionId: qid, selectedOption: letter }));
  try { await m2.saving; m2.failedAnswers.delete(qid); } catch (e) { m2.failedAnswers.add(qid); m2.saving = Promise.resolve(); m2Error(e); }
};
runTimer = function (seconds) {
  clearInterval(examCountdown);
  const expires = Date.now() + seconds * 1000;
  const tick = () => {
    const remaining = Math.max(0, Math.ceil((expires - Date.now()) / 1000));
    document.getElementById('exam-timer-display').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    if (!remaining) { clearInterval(examCountdown); submitExam(true); }
  };
  examCountdown = setInterval(tick, 1000); tick();
};
submitExam = async function (force = false) {
  if (m2.submitting || (!m2.active && !isExamDisqualified)) return;
  if (!force && !confirm(m2.flags.size ? `Bạn còn ${m2.flags.size} câu hỏi đã đặt cờ chưa kiểm tra lại. Bạn có chắc chắn muốn nộp bài ngay?` : 'Bạn có chắc chắn muốn nộp bài?')) return;
  m2.submitting = true;

  // UI/UX: Disable tất cả các nút nộp bài ngay lập tức để chặn Double-Click từ tầng giao diện
  const submitBtns = document.querySelectorAll("button[onclick*='submitExam']");
  submitBtns.forEach(btn => {
    btn.disabled = true;
    btn.dataset.origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang nộp bài...';
    btn.classList.add('opacity-75', 'cursor-not-allowed');
  });

  try {
    await m2.saving;
    if (m2.failedAnswers.size && !force) throw new Error('Có đáp án chưa lưu được. Chọn lại đáp án trước khi nộp.');
    const { data } = await m2Api(`/exams/${EXAM_ID}/submit`, 'POST');
    m2.active = false; window.isExamActive = false; clearInterval(examCountdown); isExamDisqualified = data.isDisqualified;
    lastExamResult = { ...data, title: data.examTitle };
    document.getElementById('res-score-number').textContent = data.score;
    document.getElementById('res-correct-fraction').textContent = `${data.correctCount}/${data.totalCount}`;
    document.getElementById('res-verdict').textContent = data.isDisqualified ? 'ĐÌNH CHỈ THI - 0 ĐIỂM' : data.score >= 5 ? 'ĐẠT TIÊU CHUẨN' : 'CẦN LUYỆN TẬP';
    document.getElementById('btn-view-certificate').classList.toggle('hidden', !data.certificateId);
    // Lấy dữ liệu giải thích và đáp án đúng từ response của submit (data.answers), không phụ thuộc loadedQuestions
    document.getElementById('res-details-container').innerHTML = m2ReviewHtml(data.answers || data.detailedAnswers || []);
    document.getElementById('exam-result-card').classList.remove('hidden');
    sessionStorage.removeItem(`exam-flags:${m2.attemptId}`);
    await loadUserHistory(); await loadLeaderboard();
  } catch (e) { 
    m2Error(e); 
  } finally { 
    m2.submitting = false; 
    submitBtns.forEach(btn => {
      btn.disabled = false;
      if (btn.dataset.origHtml) btn.innerHTML = btn.dataset.origHtml;
      btn.classList.remove('opacity-75', 'cursor-not-allowed');
    });
  }
};
const m2LogViolation = logAntiCheatViolation;
logAntiCheatViolation = async function (reason) { if (m2.active && !m2.submitting && !m2.logging) { m2.logging = true; try { await m2LogViolation(reason); } finally { m2.logging = false; } } };
function m2ReviewHtml(answers = []) {
  return answers.map((a, i) => `<article class="m2-card" style="border:2px solid ${a.isCorrect ? '#16a34a' : '#e11d48'}"><strong>Câu ${i + 1}: ${esc(a.content)}</strong>${(a.options || []).map(o => `<p>${esc(o.key)}. ${esc(o.text)}</p>`).join('')}<p>Bạn chọn: <b>${esc(a.selectedOption || a.selected || 'Bỏ qua')}</b> · Đáp án đúng: <b>${esc(a.correctAnswer)}</b></p><p class="m2-explanation">💡 ${esc(a.explanation || 'Chưa có lời giải thích.')}</p></article>`).join('') || '<p>Bài làm cũ chưa lưu chi tiết câu trả lời.</p>';
}
async function m2Review(submissionId) {
  try { const { data } = await m2Api(`/exams/submissions/${submissionId}/review`); m2Modal('modal-past-exam-review', `${data.examTitle} — ${data.score}/10`, m2ReviewHtml(data.answers)); } catch (e) { m2Error(e); }
}
loadUserHistory = async function () {
  if (!currentToken) return;
  try {
    const json = await m2Api(`/exams/results/my-history?page=${m2.page}&limit=5&category=${m2.category}`); m2.history = json.data;
    document.getElementById('history-table-body').innerHTML = json.data.map((r, i) => `<tr><td class="p-4">${new Date(r.submittedAt).toLocaleString('vi-VN')}</td><td class="p-4">${esc(r.examTitle)}</td><td>${r.score}/10</td><td>${r.correctCount}/${r.totalCount}</td><td>${r.isDisqualified ? 'Đình chỉ' : r.score >= 5 ? 'Đạt' : 'Chưa đạt'}</td><td>${m2Button('Xem chi tiết bài làm', `m2Review('${r._id}')`)}${r.certificateId ? m2Button('Chứng chỉ', `openCertificateModal(m2.history[${i}])`) : ''}</td></tr>`).join('') || '<tr><td colspan="6" class="p-4">Chưa có bài thi phù hợp.</td></tr>';
    document.getElementById('m2-page').textContent = `Trang ${json.page} / ${json.totalPages} · ${json.total} bài`;
    document.getElementById('m2-prev').disabled = json.page <= 1; document.getElementById('m2-next').disabled = json.page >= json.totalPages;
  } catch (e) { m2Error(e); }
};
async function m2HistoryPage(delta) { m2.page = Math.max(1, m2.page + delta); await loadUserHistory(); }
async function m2LoadShop() {
  if (!currentToken) return;
  try {
    const [shop, profile] = await Promise.all([m2Api('/courses/gamification/shop-items'), m2Api('/courses/gamification/profile')]);
    const d = profile.data;
    document.getElementById('m2-shop-balance').textContent = `${d.xp.toLocaleString()} XP`;
    document.getElementById('m2-nav-xp').textContent = `${d.xp.toLocaleString()} XP ${d.freezeCount ? '❄️' : ''}`;
    document.getElementById('gamification-xp-value').textContent = `${d.xp.toLocaleString()} XP`;
    document.getElementById('gamification-streak-badge').textContent = `Chuỗi học: ${d.streakDays} ngày 🔥 ${d.freezeCount ? '❄️' : ''}`;
    document.getElementById('m2-shop-items').innerHTML = shop.data.map(item => `<article class="m2-card"><h3>${esc(item.name)}</h3><p>${item.cost} XP</p>${m2Button(`Đổi quà (${item.cost} XP)`, `m2Redeem('${item._id}',this)`, d.xp < item.cost)}</article>`).join('');
    const counts = {}; d.inventory.forEach(i => { counts[i.itemId] = (counts[i.itemId] || 0) + 1; });
    document.getElementById('m2-inventory').textContent = shop.data.filter(i => counts[i._id]).map(i => `${i.name}: ${counts[i._id]}`).join(' · ') || 'Kho đồ chưa có vật phẩm.';
  } catch (e) { m2Error(e); }
}
async function m2Redeem(itemId, button) {
  button.disabled = true;
  try { await m2Api('/courses/gamification/redeem', 'POST', { itemId }); showToast('🎉 Đổi quà thành công!', 'success'); await m2LoadShop(); } catch (e) { m2Error(e); button.disabled = false; }
}
const m2SyncUser = syncUserUI;
syncUserUI = function () {
  m2SyncUser();
  if (currentToken) m2Api('/courses/gamification/check-in', 'POST').then(({ data }) => {
    if (data.streakSavedByFreeze) showToast('Thẻ Streak Freeze đã được kích hoạt để cứu chuỗi học của bạn!', 'success');
    return m2LoadShop();
  }).catch(m2Error);
  else document.getElementById('m2-nav-xp').textContent = '';
};
const m2LoadProfile = loadGamificationProfile;
loadGamificationProfile = async function () { await m2LoadProfile(); await m2LoadShop(); };
openCertificateModal = async function (certData = null) {
  try {
    const certId = (certData || lastExamResult)?.certificateId;
    if (!certId) throw new Error('Bài thi này chưa có chứng chỉ được cấp.');
    const c = await m2Api(`/exams/certificates/verify/${encodeURIComponent(certId)}`);
    document.getElementById('cert-student-name').textContent = c.studentName;
    document.getElementById('cert-exam-title').textContent = c.examTitle;
    document.getElementById('cert-score').textContent = `${c.score}/10 — ${c.cefrLevel}`;
    document.getElementById('cert-id').textContent = c.certId;
    document.getElementById('cert-date').textContent = new Date(c.issuedDate).toLocaleDateString('vi-VN');
    const link = `${location.origin}/verify?certId=${encodeURIComponent(certId)}`;
    document.getElementById('m2-certificate-link').href = link;
    document.getElementById('m2-certificate-link').textContent = link;
    document.getElementById('m2-certificate-qr').src = `${API_BASE}/exams/certificates/qr/${encodeURIComponent(certId)}`;
    document.getElementById('certificate-modal').classList.remove('hidden');
  } catch (e) { m2Error(e); }
};
function m2OpenVerify(certId = '') {
  const sampleCerts = [
    { id: 'EDUPRO-d7e8e72f-be96-4b9f-925a-67604dc90164', label: 'Nguyễn Trọng Nguyên (C1 - 10/10)' },
    { id: 'EDUPRO-5be6ed39-37ca-454e-b6ee-2ead7e972c67', label: 'Nguyễn Trọng Nguyên (B2 - 8.8/10)' }
  ];

  m2Modal('modal-verify-certificate', 'Tra Cứu & Xác Thực Chứng Chỉ Quốc Tế', `
    <div style="font-size:13px;color:#64748b;margin-bottom:14px;line-height:1.5">
      Hệ thống tra cứu tính hợp lệ của <strong>Chứng chỉ Năng lực Tiếng Anh Quốc tế (CEFR A1 - C2)</strong> cấp bởi EduPro Academy.
      Dữ liệu chứng chỉ được đồng bộ và xác thực tính toàn vẹn bằng hàm băm mật mã <strong>SHA-256</strong> trên cơ sở dữ liệu <strong>MongoDB</strong>.
    </div>

    <form onsubmit="event.preventDefault();m2Verify()" style="margin-bottom:12px">
      <label style="font-weight:700;margin-bottom:6px;display:block">Nhập Mã Chứng Chỉ (Certificate ID):
        <input id="m2-cert-input" required placeholder="Ví dụ: EDUPRO-d7e8e72f-be96-4b9f-925a-67604dc90164" value="${esc(certId)}" style="margin-top:6px;font-family:monospace">
      </label>
      <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
        <button class="m2-btn" type="submit" style="background:#4f46e5;color:white;border:none;padding:10px 20px;border-radius:12px;font-weight:700">🔍 Tra Cứu Ngay</button>
      </div>
    </form>

    <div style="background:#f8fafc;padding:12px 14px;border-radius:12px;border:1px dashed #cbd5e1;margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:6px">💡 Mã chứng chỉ mẫu sẵn có trong CSDL để thử nghiệm:</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${sampleCerts.map(sc => `<button type="button" onclick="document.getElementById('m2-cert-input').value='${sc.id}';m2Verify()" style="background:#fff;border:1px solid #cbd5e1;padding:5px 10px;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600;color:#334155;text-align:left">🎯 ${sc.label}</button>`).join('')}
      </div>
    </div>

    <div id="m2-verify-result" aria-live="polite"></div>
  `);
  if (certId) m2Verify();
}

async function m2Verify() {
  const box = document.getElementById('m2-verify-result');
  const inputVal = (document.getElementById('m2-cert-input')?.value || '').trim();
  if (!inputVal) {
    box.innerHTML = '<div style="color:#e11d48;font-weight:700">Vui lòng nhập mã chứng chỉ cần tra cứu.</div>';
    return;
  }
  box.innerHTML = '<div style="padding:15px;color:#4f46e5;font-weight:700">⏳ Đang truy vấn MongoDB và xác thực chữ ký số SHA-256…</div>';
  try {
    const c = await m2Api(`/exams/certificates/verify/${encodeURIComponent(inputVal)}`);
    box.innerHTML = `
      <article class="m2-card" style="border:2px solid #22c55e;background:#f0fdf4;padding:18px;border-radius:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="background:#22c55e;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900">✓</span>
          <h3 style="color:#15803d;font-size:16px;font-weight:800;margin:0">CHỨNG CHỈ HỢP LỆ VÀ ĐÃ ĐƯỢC XÁC THỰC</h3>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;color:#1e293b;margin-bottom:12px">
          <div><strong>Họ và tên:</strong> ${esc(c.studentName)}</div>
          <div><strong>Mã chứng chỉ:</strong> <span style="font-family:monospace;font-weight:700;color:#047857">${esc(c.certId)}</span></div>
          <div><strong>Kỳ thi hoàn thành:</strong> ${esc(c.examTitle)}</div>
          <div><strong>Kết quả đạt được:</strong> <span style="font-weight:800;color:#16a34a">${c.score}/10 — CEFR ${esc(c.cefrLevel)}</span></div>
          <div><strong>Ngày cấp chứng chỉ:</strong> ${new Date(c.issuedDate).toLocaleDateString('vi-VN')}</div>
          <div><strong>Cơ quan cấp:</strong> EduPro Global Examination Council</div>
        </div>
        <div style="padding:8px 12px;background:#e2e8f0;border-radius:8px;font-size:11px;font-family:monospace;color:#334155;word-break:break-all">
          <strong>SHA-256 Verify Hash:</strong> ${esc(c.verifyHash)}
        </div>
        <div style="margin-top:12px;text-align:right">
          <button type="button" onclick="m2OpenCertificate({ certificateId: '${c.certId}' })" style="background:#059669;color:white;border:none;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer">📜 Xem Bản In Chứng Chỉ Đầy Đủ & QR</button>
        </div>
      </article>
    `;
  } catch (e) {
    box.innerHTML = `
      <article class="m2-card" style="border:2px solid #f43f5e;background:#fff1f2;padding:16px;border-radius:16px">
        <div style="display:flex;align-items:center;gap:8px;color:#e11d48;font-weight:800;margin-bottom:6px">
          <span>❌</span> <span>KHÔNG TÌM THẤY CHỨNG CHỈ HOẶC ĐÃ BỊ THU HỒI</span>
        </div>
        <p style="font-size:13px;color:#64748b;margin:0">Mã chứng chỉ <code>${esc(inputVal)}</code> không tồn tại trên hệ thống hoặc mã băm không trùng khớp.</p>
      </article>
    `;
  }
}
async function m2LoadCMS() {
  if (!m2Staff()) return;
  try {
    const [{ data }, exams] = await Promise.all([m2Api('/courses/cms/list'), m2Api('/exams/list/all')]); m2.courses = data;
    document.getElementById('m2-cms-courses').innerHTML = `<table><thead><tr><th>Khóa học</th><th>Giá</th><th>Thao tác</th></tr></thead><tbody>${data.map((c, i) => `<tr><td>${esc(c.title)}</td><td>${Number(c.price).toLocaleString()} đ</td><td>${m2Button('Sửa', `m2EditCourse(${i})`)}${m2Admin() ? m2Button('Xóa', `m2DeleteCourse('${c._id}')`) : ''}</td></tr>`).join('')}</tbody></table>`;
    const select = document.getElementById('m2-cms-exam'); const selected = select.value;
    select.innerHTML = exams.data.map(e => `<option value="${e._id}">${esc(e.title)}</option>`).join('');
    if (exams.data.some(e => e._id === selected)) select.value = selected;
    await m2LoadQuestions();
  } catch (e) { m2Error(e); }
}
function m2EditCourse(index) {
  const c = m2.courses[index]; m2.editCourse = c._id; m2.lessons = structuredClone(c.lessons || []);
  m2Modal('modal-edit-course', 'Chỉnh sửa khóa học', `<form onsubmit="event.preventDefault();m2SaveCourse()"><label>Tiêu đề<input id="m2-title" value="${esc(c.title)}" required maxlength="250"></label><label>Mô tả<textarea id="m2-description" required>${esc(c.description || c.tagline)}</textarea></label><label>Danh mục<input id="m2-category" value="${esc(c.category)}" required></label><label>Giá<input id="m2-price" type="number" min="0" step="1000" value="${c.price}" required></label><h3>Danh sách bài học</h3><div id="m2-lessons"></div>${m2Button('Thêm bài học', "m2ReadLessons();m2.lessons.push({title:'',video:{url:''}});m2RenderLessons()") }<button class="m2-btn" type="submit">Lưu khóa học</button></form>`); m2RenderLessons();
}
function m2ReadLessons() { document.querySelectorAll('[data-lesson]').forEach((row, i) => { m2.lessons[i].title = row.querySelector('input').value; m2.lessons[i].video = { ...(m2.lessons[i].video || {}), url: row.querySelectorAll('input')[1].value }; }); }
function m2RenderLessons() { document.getElementById('m2-lessons').innerHTML = m2.lessons.map((l, i) => `<div data-lesson class="m2-card"><label>Bài ${i + 1}<input value="${esc(l.title)}" required></label><label>URL video<input value="${esc(l.video?.url || '')}" type="url"></label>${m2Button('Bỏ bài học', `m2ReadLessons();m2.lessons.splice(${i},1);m2RenderLessons()`)}</div>`).join(''); }
async function m2SaveCourse() {
  try { m2ReadLessons(); await m2Api(`/courses/${m2.editCourse}`, 'PUT', { title: document.getElementById('m2-title').value, description: document.getElementById('m2-description').value, category: document.getElementById('m2-category').value, price: Number(document.getElementById('m2-price').value), lessons: m2.lessons }); document.getElementById('modal-edit-course').remove(); await m2LoadCMS(); await loadCoursesCatalog(); showToast('Đã cập nhật khóa học.', 'success'); } catch (e) { m2Error(e); }
}
async function m2DeleteCourse(cid) { if (!confirm('Xóa khóa học này khỏi danh mục?')) return; try { await m2Api(`/courses/${cid}`, 'DELETE'); await m2LoadCMS(); await loadCoursesCatalog(); } catch (e) { m2Error(e); } }
async function m2LoadQuestions() {
  const examId = document.getElementById('m2-cms-exam').value; if (!examId) return;
  try { const { data } = await m2Api(`/exams/${examId}/questions`); m2.questions = data;
    document.getElementById('m2-cms-questions').innerHTML = data.map((q, i) => `<div class="m2-card"><strong>${i + 1}. ${esc(q.content)}</strong><p>Đáp án: ${esc(q.correctAnswer)}</p>${m2Button('Sửa', `m2EditQuestion(${i})`)}${m2Admin() ? m2Button('Xóa', `m2DeleteQuestion('${q._id}')`) : ''}</div>`).join('') || '<p>Đề thi chưa có câu hỏi.</p>';
  } catch (e) { m2Error(e); }
}
function m2EditQuestion(index) {
  const q = m2.questions[index]; m2.editQuestion = q._id;
  m2Modal('modal-edit-question', 'Chỉnh sửa câu hỏi', `<form onsubmit="event.preventDefault();m2SaveQuestion()"><label>Câu hỏi<textarea id="m2-question" required>${esc(q.content)}</textarea></label>${q.options.map((o, i) => `<label>Đáp án ${'ABCD'[i]}<input id="m2-option-${i}" value="${esc(o.text)}" required></label>`).join('')}<label>Đáp án đúng<select id="m2-correct">${[...'ABCD'].map(a => `<option ${a === q.correctAnswer ? 'selected' : ''}>${a}</option>`).join('')}</select></label><label>Giải thích<textarea id="m2-explanation" required>${esc(q.explanation)}</textarea></label><button class="m2-btn">Lưu câu hỏi</button></form>`);
}
async function m2SaveQuestion() { try { await m2Api(`/exams/questions/${m2.editQuestion}`, 'PUT', { questionText: document.getElementById('m2-question').value, options: [0, 1, 2, 3].map(i => ({ key: 'ABCD'[i], text: document.getElementById(`m2-option-${i}`).value })), correctAnswer: document.getElementById('m2-correct').value, explanation: document.getElementById('m2-explanation').value }); document.getElementById('modal-edit-question').remove(); await m2LoadQuestions(); } catch (e) { m2Error(e); } }
async function m2DeleteQuestion(qid) { if (!confirm('Xóa câu hỏi này khỏi ngân hàng đề?')) return; try { await m2Api(`/exams/questions/${qid}`, 'DELETE'); await m2LoadQuestions(); } catch (e) { m2Error(e); } }
async function m2Moderate(kind, recordId) {
  if (!confirm('Xóa nội dung này?')) return;
  try { await m2Api(`/courses/${kind}/${recordId}`, 'DELETE'); if (kind === 'discussions') await loadCourseDiscussions(currentClassroomCourseId); else { const { data } = await m2Api(`/courses/${currentClassroomCourseId}`); renderCourseReviews(data.reviews, data.rating); } showToast('Đã xóa nội dung.', 'success'); } catch (e) { m2Error(e); }
}
const m2LoadAnalytics = loadAnalyticsData;
loadAnalyticsData = async function () { if (!m2Staff()) return; await m2LoadAnalytics(); await m2LoadCMS(); };
function m2Init() {
  document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="/member2.css">');
  if (!document.getElementById('m2-nav-xp') && document.getElementById('nav-user-name')) {
    document.getElementById('nav-user-name').insertAdjacentHTML('afterend', '<span id="m2-nav-xp" class="text-xs font-bold"></span>');
  }
  document.getElementById('exam-result-card').insertAdjacentHTML('beforeend', m2Button('🔄 Làm lại đề thi này', 'retakeCurrentExam()'));
  document.getElementById('anti-cheat-modal-btn').insertAdjacentHTML('afterend', m2Button('🔄 Làm lại đề thi này', 'retakeCurrentExam()'));
  const history = document.getElementById('history-table-body').closest('table');
  history.insertAdjacentHTML('beforebegin', '<div class="m2-card"><label>Lọc loại đề <select onchange="m2.category=this.value;m2.page=1;loadUserHistory()"><option value="">Tất cả</option><option value="placement">Placement</option><option value="toeic">TOEIC</option><option value="ielts">IELTS</option><option value="grammar">Grammar</option></select></label></div>');
  history.insertAdjacentHTML('afterend', '<div class="m2-card"><button id="m2-prev" class="m2-btn" onclick="m2HistoryPage(-1)">◀ Trang trước</button><span id="m2-page"></span><button id="m2-next" class="m2-btn" onclick="m2HistoryPage(1)">Trang sau ▶</button></div>');
  document.querySelector('#section-history > div').insertAdjacentHTML('beforeend', '<div class="m2-card"><h2>🎁 Cửa hàng đổi quà điểm thưởng XP</h2><p>Số dư: <strong id="m2-shop-balance">0 XP</strong></p><div id="m2-shop-items" class="m2-grid"></div><h3>Kho đồ cá nhân</h3><p id="m2-inventory"></p></div>');
  document.querySelector('#section-analytics > div').insertAdjacentHTML('beforeend', '<div class="m2-card"><h2>Quản lý khóa học</h2><div id="m2-cms-courses" style="overflow:auto"></div><h2>Quản lý ngân hàng câu hỏi đề thi</h2><label>Chọn đề thi <select id="m2-cms-exam" onchange="m2LoadQuestions()"></select></label><div id="m2-cms-questions"></div></div>');
  document.getElementById('certificate-content').insertAdjacentHTML('beforeend', '<div class="m2-card"><img id="m2-certificate-qr" alt="Mã QR tra cứu chứng chỉ" width="140" height="140" style="margin:auto"><a id="m2-certificate-link" target="_blank" rel="noopener" style="overflow-wrap:anywhere"></a></div>');
  if (!document.getElementById('nav-btn-verify-cert') && document.querySelector('nav')) {
    document.querySelector('nav').insertAdjacentHTML('beforeend', m2Button('Tra cứu chứng chỉ', 'm2OpenVerify()'));
  }
  const certId = new URLSearchParams(location.search).get('certId'); if (certId) m2OpenVerify(certId);
}
m2Init();
