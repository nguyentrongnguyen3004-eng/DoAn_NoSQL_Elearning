// ==============================================================================
// 2. CLASSROOM ENGINE: VIDEO PLAYER, RETENTION CURVE, NOTES & REVIEWS
// ==============================================================================

    function getValidToken() {
      if (!currentToken || currentToken === 'null') {
        currentToken = window.currentToken || localStorage.getItem('edupro_token') || null;
        window.currentToken = currentToken;
      }
      return currentToken;
    }

    // ==============================================================================
    // TÍNH NĂNG KIẾN TRÚC 2: KHUYẾN NGHỊ ĐỒ THỊ NEO4J COLLABORATIVE AI
    // ==============================================================================
    async function loadCollaborativeRecommendations() {
      const container = document.getElementById('collaborative-recommendations-grid');
      if (!container) return;
      container.innerHTML = '<div class="col-span-3 text-center py-6 text-xs text-indigo-300"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang phân tích đồ thị Neo4j...</div>';

      try {
        if (typeof fetchEnrolledCourses === 'function' && (!userEnrolledCourseIds || userEnrolledCourseIds.size === 0) && currentToken) {
          await fetchEnrolledCourses();
        }
        const res = await fetch('/api/graph/collaborative-recommendations?targetBand=IELTS 7.5+');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          container.innerHTML = data.data.map(item => {
            const isEnrolled = typeof isCourseEnrolled === 'function' ? isCourseEnrolled(item.courseId) : false;
            return `
            <div class="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-indigo-400/60 hover:bg-white/10 transition-all text-left flex flex-col justify-between shadow-lg">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ${item.matchPercent}% Phù hợp lộ trình
                  </span>
                  <span class="text-[11px] text-indigo-300 font-bold">${item.category || 'Học thuật'}</span>
                </div>
                <h4 class="font-bold text-sm text-white mb-2 leading-snug">${item.title}</h4>
                <p class="text-xs text-slate-300 leading-relaxed mb-4">${item.reason}</p>
              </div>
              ${isEnrolled ? `
                <button onclick="openClassroomModal('${item.courseId}')" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Vào học ngay</span>
                  <i class="fa-solid fa-circle-play text-[11px]"></i>
                </button>
              ` : `
                <button onclick="enrollCurrentCourse('${item.courseId}')" class="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <i class="fa-solid fa-cart-plus text-[11px]"></i>
                  <span>Đăng ký học ngay</span>
                </button>
              `}
            </div>
          `;
          }).join('');
        }
      } catch (e) {
        console.warn('Loi khi load collaborative recommendations:', e);
      }
    }

    // ==============================================================================

    // TÍNH NĂNG KIẾN TRÚC 3: PHÂN TÍCH TỶ LỆ GIỮ CHÂN VIDEO CASSANDRA TIME-SERIES
    // ==============================================================================
    async function loadVideoRetentionAnalytics(courseId = '670000000000000000000010') {
      const container = document.getElementById('video-retention-container');
      if (!container) return;

      try {
        const res = await fetch('/api/courses/' + courseId + '/analytics/video-retention');
        const data = await res.json();
        if (data.success && data.timeline) {
          container.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
                <div class="text-[10px] font-bold text-slate-400 uppercase">Tỷ lệ xem trung bình</div>
                <div class="text-base font-black text-brand-600 dark:text-indigo-400 mt-0.5">${data.summary.averageRetentionRate}</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
                <div class="text-[10px] font-bold text-slate-400 uppercase">Hoàn thành toàn bài</div>
                <div class="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">${data.summary.completionRate}</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
                <div class="text-[10px] font-bold text-slate-400 uppercase">Tổng lượt tương tác</div>
                <div class="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">${data.summary.totalWatchSessions} lượt</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
                <div class="text-[10px] font-bold text-slate-400 uppercase">Điểm tua lại cao nhất</div>
                <div class="text-base font-black text-amber-500 mt-0.5">${data.summary.replaySpike.time}</div>
              </div>
            </div>

            <!-- Đường cong tỷ lệ giữ chân (Retention Drop-off Timeline) -->
            <div class="space-y-2">
              ${data.timeline.map(step => `
                <div class="space-y-1">
                  <div class="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>${step.time} • ${step.label}</span>
                    <span class="${step.percent >= 80 ? 'text-emerald-600' : step.percent >= 70 ? 'text-indigo-600' : 'text-rose-500'}">${step.percent}%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div class="h-full rounded-full ${step.percent >= 80 ? 'bg-emerald-500' : step.percent >= 70 ? 'bg-brand-600' : 'bg-rose-500'} transition-all duration-500" style="width: ${step.percent}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-left text-xs text-slate-600 dark:text-slate-300">
              <span class="font-bold text-brand-600 dark:text-indigo-400">💡 Insight học thuật từ Cassandra:</span>
              ${data.summary.dropOffSpike.reason}. Khuyến nghị bổ sung bài tập mini-quiz tương tác để giữ chân học viên ở mốc này.
            </div>
          `;
        }
      } catch (e) {
        console.warn('Loi khi load video retention:', e);
      }
    }


    async function enterClassroom(courseId) {
      if (!getValidToken()) { openLoginModal(); return; }

      // KIỂM TRA QUYỀN TRUY CẬP: Bắt buộc học viên phải ĐÃ ĐĂNG KÝ khóa học mới được vào học
      const isEnrolled = typeof isCourseEnrolled === 'function' ? isCourseEnrolled(courseId) : false;
      const isPrivileged = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER');

      if (!isEnrolled && !isPrivileged) {
        showCustomAlert('⚠️ Bạn chưa đăng ký khóa học này! Vui lòng nhấn "Đăng ký" và hoàn tất thanh toán để vào lớp học.');
        setTimeout(() => {
          if (typeof enrollCurrentCourse === 'function') {
            enrollCurrentCourse(courseId);
          }
        }, 600);
        return;
      }

      currentCourseId = courseId;
      currentClassroomCourseId = courseId;

      try {
        const res = await fetch(`${API_BASE}/courses/${courseId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const { lessons, title, reviews, rating } = json.data;
          document.getElementById('classroom-course-header-title').textContent = title || 'Lớp Học Trực Tuyến';
          if (lessons && lessons.length > 0) {
            renderClassroomPlaylist(lessons);
            playLesson(lessons[0]);
          } else {
            document.getElementById('classroom-playlist').innerHTML = '<div class="text-xs text-slate-400 p-4">Khóa học này đang cập nhật bài giảng.</div>';
          }
          renderCourseReviews(reviews || [], rating || 4.9);
          loadCourseNotes(courseId);
          loadCourseDiscussions(courseId);
          loadNeo4jCourseRecommendations(courseId);
          showSection('classroom');
          loadTelemetryLogs();
          loadVideoRetentionAnalytics(courseId);
        }
      } catch (err) {
        alert('Lỗi vào lớp học: ' + err.message);
      }
    }

    function renderClassroomPlaylist(lessons) {
      const container = document.getElementById('classroom-playlist');
      document.getElementById('playlist-count').textContent = `${lessons.length} bài học`;
      let html = '';
      lessons.forEach((l, idx) => {
        html += `
          <button onclick='playLesson(${JSON.stringify(l)})' id="playlist-item-${l._id}" class="playlist-btn w-full p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-brand-50/60 dark:hover:bg-slate-800 text-left flex items-start gap-3 transition-all">
            <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">${idx + 1}</span>
            <div class="flex-grow">
              <div class="text-xs font-bold text-slate-900 dark:text-white leading-snug">${l.title}</div>
              <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span><i class="fa-solid fa-circle-play mr-1 text-brand-600"></i> ${l.video && l.video.durationSeconds ? Math.round(l.video.durationSeconds / 60) : 35} phút</span>
                <span class="text-emerald-500 font-semibold"><i class="fa-solid fa-circle-check text-[10px]"></i> Sẵn sàng học</span>
              </div>
            </div>
          </button>
        `;
      });
      container.innerHTML = html;
    }

    
    function switchVideoSource(source) {
      const ytFrame = document.getElementById('classroom-video-frame');
      const html5Video = document.getElementById('classroom-native-video');
      const lbl = document.getElementById('video-source-label');
      const btnYt = document.getElementById('btn-src-yt');
      const btnHtml5 = document.getElementById('btn-src-html5');

      if (source === 'html5') {
        if (ytFrame) ytFrame.classList.add('hidden');
        if (html5Video) {
          html5Video.classList.remove('hidden');
          html5Video.play().catch(() => {});
        }
        if (lbl) lbl.textContent = 'Nguồn: Máy chủ EduPro CDN (HTML5 Direct Stream)';
        btnYt?.classList.replace('bg-brand-50', 'bg-slate-100');
        btnYt?.classList.replace('text-brand-600', 'text-slate-600');
        btnHtml5?.classList.replace('bg-slate-100', 'bg-brand-50');
        btnHtml5?.classList.replace('text-slate-600', 'text-brand-600');
      } else {
        if (html5Video) {
          html5Video.pause();
          html5Video.classList.add('hidden');
        }
        if (ytFrame) ytFrame.classList.remove('hidden');
        if (lbl) lbl.textContent = 'Nguồn: YouTube Cloud Stream (HD 1080p)';
        btnHtml5?.classList.replace('bg-brand-50', 'bg-slate-100');
        btnHtml5?.classList.replace('text-brand-600', 'text-slate-600');
        btnYt?.classList.replace('bg-slate-100', 'bg-brand-50');
        btnYt?.classList.replace('text-slate-600', 'text-brand-600');
      }
    }

    function openClassroomModal(courseId) {
      enterClassroom(courseId);
    }

    function playLesson(lesson) {
      currentLessonId = lesson._id;
      document.getElementById('lesson-module-tag').textContent = `Bài ${lesson.order || 1} • Video bài giảng thực chiến`;
      document.getElementById('lesson-main-title').textContent = lesson.title;
      document.getElementById('lesson-main-desc').textContent = lesson.content || lesson.description || 'Nội dung thực hành phân tích và tối ưu hóa hệ thống dữ liệu.';
      
      const frame = document.getElementById('classroom-video-frame');
      // Tự động gán video minh họa chất lượng cao tương thích
      const sampleVideos = [
        'https://www.youtube-nocookie.com/embed/84jVz0D-KkY', // All English Tenses C1-Advanced
        'https://www.youtube-nocookie.com/embed/QxQUapA-2w4', // Complete Guide to English Pronunciation
        'https://www.youtube-nocookie.com/embed/iG9CE55wbtY', // Sir Ken Robinson TED Talk
        'https://www.youtube-nocookie.com/embed/UF8uR6Z6KLc'  // Steve Jobs Stanford Address
      ];
      frame.src = sampleVideos[(lesson.order || 1) % sampleVideos.length];

      // Đánh dấu active trong danh sách
      document.querySelectorAll('.playlist-btn').forEach(btn => btn.classList.remove('border-brand-500', 'bg-brand-50/50', 'dark:bg-slate-800'));
      const activeItem = document.getElementById(`playlist-item-${lesson._id}`);
      if (activeItem) activeItem.classList.add('border-brand-500', 'bg-brand-50/50', 'dark:bg-slate-800');

      sendTelemetry('PLAY_LESSON', 0);
    }

    async function sendTelemetry(eventType, duration) {
      if (!currentToken) return;
      try {
        const videoElem = document.querySelector('video');
        const curTime = videoElem ? Math.round(videoElem.currentTime) : (window.__mockVideoTime = (window.__mockVideoTime || 0) + 10);
        const sessId = window.__eduSessionId || (window.__eduSessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6));

        // 1. Ghi nhan su kien xem video vao Cassandra
        await fetch(`${API_BASE}/courses/events/video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({
            eventType, durationSeconds: duration,
            courseId: currentCourseId || '670000000000000000000010', 
            lessonId: currentLessonId || '670000000000000000000021'
          })
        });

        // 2. Gui heartbeat xac thuc thoi luong va phat hien tua nhanh bat thuong
        const hbRes = await fetch(`${API_BASE}/telemetry/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({
            courseId: currentCourseId || '670000000000000000000010',
            lessonId: currentLessonId || '670000000000000000000021',
            videoCurrentTime: curTime,
            durationSeconds: duration || 10,
            sessionId: sessId
          })
        }).then(r => r.json()).catch(() => null);

        if (hbRes && hbRes.isAnomalousFastForward) {
          if (typeof showToast === 'function') {
            showToast('⚠️ Cảnh báo: Bạn đang tua video quá nhanh! Thời gian tua sẽ không được tích lũy vào tiến độ.', 'warning');
          }
        }

        loadTelemetryLogs();
      } catch (err) {
        console.error('Lỗi telemetry:', err);
      }
    }

    async function loadTelemetryLogs() {
      if (!currentToken) return;
      try {
        const res = await fetch(`${API_BASE}/courses/events/history/me`, {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const json = await res.json();
        if (json.success && json.data) {
          const container = document.getElementById('telemetry-log-stream');
          if (json.data.length === 0) {
            container.innerHTML = '<div class="text-center py-4 text-slate-400 text-xs">Chưa có dữ liệu học tập.</div>';
            return;
          }
          let html = '';
          json.data.forEach(item => {
            const time = new Date(item.event_time).toLocaleTimeString('vi-VN');
            html += `
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span class="font-bold text-slate-800 dark:text-slate-200">${item.event_type}</span>
                  <span class="text-slate-400 text-[10px] ml-1">(${item.duration_seconds}s)</span>
                </div>
                <span class="text-[10px] font-mono text-slate-400">${time}</span>
              </div>
            `;
          });
          container.innerHTML = html;
        }
      } catch (err) {
        console.error('Lỗi tải logs:', err);
      }
    }

    // 7. KHẢO SÁT & BÀI THI

    async function loadCourseNotes(courseId) {
      if (!currentToken) return;
      try {
        const res = await fetch(`${API_BASE}/courses/${courseId}/notes`, {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const json = await res.json();
        const box = document.getElementById('classroom-notes-list') || document.getElementById('lesson-notes-list');
        if (!box) return;
        if (json.success && json.data && json.data.length > 0) {
          box.innerHTML = json.data.map(n => `
            <div class="p-3 rounded-2xl bg-amber-50/50 dark:bg-slate-800 border border-amber-200/70 dark:border-slate-700 flex items-start justify-between gap-3 text-xs">
              <div>
                <span class="px-2 py-0.5 rounded-md bg-amber-500 text-white font-mono font-bold text-[10px] mr-2">⏱ ${n.timestampFormatted || n.videoTimestamp || '05:00'}</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">${n.content}</span>
              </div>
              <span class="text-[10px] text-slate-400 shrink-0">${new Date(n.createdAt).toLocaleTimeString('vi-VN')}</span>
            </div>
          `).join('');
        } else {
          box.innerHTML = '<div class="text-xs text-slate-400 italic">Chưa có ghi chú cho bài giảng này. Thêm ghi chú để lưu lại kiến thức quan trọng.</div>';
        }
      } catch (err) {
        console.error('Lỗi tải ghi chú:', err);
      }
    }

    async function saveLessonNote() {
      if (!getValidToken()) { openLoginModal(); return; }
      const tsEl = document.getElementById('note-timestamp-input') || document.getElementById('lesson-note-timestamp');
      const contentEl = document.getElementById('note-content-input') || document.getElementById('lesson-note-input');
      const ts = tsEl ? tsEl.value.trim() : '05:20';
      const content = contentEl ? contentEl.value.trim() : '';
      if (!content) {
        alert('Vui lòng nhập nội dung ghi chú bài giảng!');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/courses/${currentCourseId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ lessonId: currentLessonId, timestampFormatted: ts, videoTimestamp: ts, content })
        });
        const json = await res.json();
        if (json.success) {
          if (contentEl) contentEl.value = '';
          loadCourseNotes(currentCourseId);
          loadTelemetryLogs();
        }
      } catch (err) {
        alert('Lỗi lưu ghi chú: ' + err.message);
      }
    }

    function renderCourseReviews(reviews, rating) {
      const badge = document.getElementById('course-avg-rating-badge');
      const box = document.getElementById('classroom-reviews-list') || document.getElementById('course-reviews-list');
      if (badge) badge.textContent = `⭐ ${rating || 4.9} / 5.0 (${(reviews || []).length} nhận xét)`;
      if (!box) return;
      if (!reviews || reviews.length === 0) {
        box.innerHTML = '<div class="text-xs text-slate-400 italic">Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận về khóa học!</div>';
        return;
      }
      box.innerHTML = reviews.map(r => `
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-slate-900 dark:text-white">${r.userName || r.studentName || 'Học viên EduPro'}</span>
            <span class="text-amber-500 font-bold">${'⭐'.repeat(r.rating || 5)}</span>
          </div>
          <p class="text-slate-600 dark:text-slate-300">${typeof esc === 'function' ? esc(r.comment) : r.comment}</p>
          ${typeof m2Admin === 'function' && m2Admin() && r._id ? m2Button("🗑 Xóa đánh giá", `m2Moderate('reviews','${r._id}')`) : ""}
        </div>
      `).join('');
    }

    async function submitCourseReview() {
      if (!getValidToken()) { openLoginModal(); return; }
      const ratingEl = document.getElementById('review-rating-select') || document.getElementById('course-review-rating');
      const commentEl = document.getElementById('review-comment-input') || document.getElementById('course-review-comment');
      const rating = Number(ratingEl ? ratingEl.value : 5);
      const comment = commentEl ? commentEl.value.trim() : '';
      if (!comment) {
        alert('Vui lòng nhập nhận xét của bạn về khóa học!');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/courses/${currentCourseId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ rating, comment })
        });
        const json = await res.json();
        if (json.success) {
          if (commentEl) commentEl.value = '';
          const courseRes = await fetch(`${API_BASE}/courses/${currentCourseId}`);
          const courseJson = await courseRes.json();
          if (courseJson.success && courseJson.data) {
            renderCourseReviews(courseJson.data.reviews || [], courseJson.data.rating);
          }
          loadCoursesCatalog();
        }
      } catch (err) {
        alert('Lỗi gửi đánh giá: ' + err.message);
      }
    }

    async function loadNeo4jCourseRecommendations(courseId) {
      const box = document.getElementById('neo4j-course-recommendations');
      if (!box) return;
      try {
        const res = await fetch(`${API_BASE}/graph/recommendations/${courseId}`);
        const json = await res.json();
        if (json.success && json.data) {
          box.innerHTML = json.data.map(rec => `
            <div onclick="enterClassroom('${rec.courseId || '670000000000000000000015'}')" class="p-3 rounded-2xl bg-indigo-50/50 dark:bg-slate-800 border border-indigo-200/70 dark:border-slate-700 hover:border-brand-500 cursor-pointer transition-all">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-600 text-white">${rec.targetBand || 'IELTS / TOEIC'}</span>
                <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Đề xuất</span>
              </div>
              <div class="font-bold text-xs text-slate-900 dark:text-white">${rec.title}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${rec.reason || 'Khóa học phù hợp tiếp theo với lộ trình của bạn'}</div>
            </div>
          `).join('');
        }
      } catch (err) {
        console.error('Lỗi tải gợi ý Neo4j:', err);
      }
    }

    // ==============================================================

// ==============================================================================
// LESSON PROGRESS, RESOURCES & UNENROLL (TASK 1.3, 1.4, 1.5)
// ==============================================================================
async function toggleLessonComplete() {
  if (!currentToken || !currentClassroomCourseId) return;
  try {
    const r = await fetch(`${API_BASE}/courses/${currentClassroomCourseId}/lessons/${currentLessonIndex}/toggle-complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    const j = await r.json();
    if (!r.ok || !j.success) throw new Error(j.message || 'Không thể cập nhật tiến độ');
    showToast(j.isCompleted ? '✅ Đã hoàn thành bài học này!' : 'Đã bỏ hoàn thành bài học', 'success');
    loadCourseProgress(currentClassroomCourseId);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function loadCourseProgress(courseId) {
  if (!currentToken || !courseId) return;
  try {
    const r = await fetch(`${API_BASE}/courses/${courseId}/progress`, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    const j = await r.json();
    if (j.success && Array.isArray(j.completedLessons)) {
      const chk = document.getElementById('chk-lesson-complete');
      if (chk) chk.checked = j.completedLessons.includes(currentLessonIndex);
    }
  } catch (e) {}
}

async function loadLessonResources(index) {
  const box = document.getElementById('lesson-resources-list');
  if (!box || !currentToken || !currentClassroomCourseId) return;
  try {
    const r = await fetch(`${API_BASE}/courses/${currentClassroomCourseId}/lessons/${index}/resources`, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    const j = await r.json();
    const list = j.data || [];
    if (!list.length) {
      box.innerHTML = '<p class="text-sm text-slate-500">Chưa có tài liệu đính kèm cho bài học này.</p>';
      return;
    }
    box.innerHTML = list.map(item => `
      <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div class="flex items-center gap-3">
          <i class="fa-solid ${item.type === 'pdf' ? 'fa-file-pdf text-rose-500' : (item.type === 'audio' ? 'fa-file-audio text-indigo-500' : 'fa-file-word text-blue-500')} text-xl"></i>
          <div>
            <div class="font-bold text-sm text-slate-900 dark:text-white">${item.title}</div>
            <div class="text-xs text-slate-500 font-mono">${item.size || 'Tài liệu học tập'}</div>
          </div>
        </div>
        <a href="${item.url}" target="_blank" download class="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-slate-700 hover:bg-brand-600 hover:text-white text-brand-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 transition-all">
          <i class="fa-solid fa-download"></i> Tải xuống
        </a>
      </div>
    `).join('');
  } catch (e) {
    box.innerHTML = '<p class="text-sm text-rose-500">Lỗi khi tải tài liệu đính kèm.</p>';
  }
}

async function confirmUnenrollCourse() {
  if (!confirm('Bạn có chắc chắn muốn hủy đăng ký khóa học này không? Tiến độ học tập sẽ bị xóa.')) return;
  try {
    const r = await fetch(`${API_BASE}/courses/${currentClassroomCourseId}/enroll`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    const j = await r.json();
    if (!r.ok || !j.success) throw new Error(j.message || 'Không thể hủy đăng ký');
    if (typeof userEnrolledCourseIds !== 'undefined') {
      userEnrolledCourseIds.delete(String(currentClassroomCourseId));
      window.userEnrolledCourseIds = userEnrolledCourseIds;
    }
    showToast(j.message, 'success');
    showSection('courses');
    loadCoursesCatalog();
    if (typeof loadCollaborativeRecommendations === 'function') loadCollaborativeRecommendations();
  } catch (e) {
    showToast(e.message, 'error');
  }
}
