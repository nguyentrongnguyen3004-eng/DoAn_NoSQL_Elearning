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


    
    let currentCourseLessons = [];
    let currentLessonIndex = 0;
    let currentCourseCompletedLessons = [];

    const ACADEMIC_LESSON_CONTENT = [
      {
        objectives: [
          { icon: 'fa-scale-balanced', title: 'Band Descriptors IDP/BC', desc: 'Nắm vững 4 tiêu chí Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.' },
          { icon: 'fa-stopwatch', title: 'Phân bổ 60 phút', desc: 'Dành tối đa 20 phút cho Task 1 (tối thiểu 150 từ) và 40 phút cho Task 2 (tối thiểu 250 từ).' },
          { icon: 'fa-triangle-exclamation', title: 'Tránh lỗi trừ điểm', desc: 'Không viết lạc đề, không dùng lối viết thân mật (informal) và kiểm tra lỗi chính tả/chia động từ.' }
        ],
        vocab: [
          { word: 'Criterion', ipa: '/kraɪˈtɪə.ri.ən/ (n)', meaning: 'Tiêu chuẩn đánh giá', example: 'Each candidate essay is rigorously evaluated across four distinct scoring criteria.' },
          { word: 'Cohesive Device', ipa: '/kəʊˈhiː.sɪv/ (n)', meaning: 'Từ nối liên kết câu', example: 'Appropriate cohesive devices establish seamless logical progression between body paragraphs.' },
          { word: 'Nominalization', ipa: '/ˌnɒm.ɪ.nə.laɪˈzeɪ.ʃən/ (n)', meaning: 'Kỹ thuật danh từ hóa', example: 'Nominalization significantly elevates the formal academic register required for Band 8.0+.' }
        ],
        takeaway: 'Hãy luôn lập dàn ý (Outline) trong 3-5 phút trước khi viết. Một dàn ý chặt chẽ giúp bạn tập trung 100% vào việc sử dụng cấu trúc câu phức và từ vựng phong phú mà không lo thiếu ý tưởng.'
      },
      {
        objectives: [
          { icon: 'fa-eye', title: 'Kỹ thuật Skimming', desc: 'Đọc lướt tiêu đề, câu đầu (Topic Sentence) và câu cuối mỗi đoạn để nắm trọn ý chính trong 30 giây.' },
          { icon: 'fa-magnifying-glass', title: 'Kỹ thuật Scanning', desc: 'Định vị từ khóa bất biến: Tên riêng viết hoa, năm tháng, số liệu phần trăm và thuật ngữ khoa học.' },
          { icon: 'fa-code-compare', title: 'Phân biệt False vs Not Given', desc: 'False: Thông tin bài đọc trực tiếp phản bác câu hỏi. Not Given: Bài đọc không nhắc đến hoặc không đủ dữ liệu khẳng định.' }
        ],
        vocab: [
          { word: 'Contradict', ipa: '/ˌkɒn.trəˈdɪkt/ (v)', meaning: 'Mâu thuẫn, bác bỏ', example: 'The latest archaeological discoveries directly contradict earlier geological assertions.' },
          { word: 'Inference', ipa: '/ˈɪn.fər.əns/ (n)', meaning: 'Sự suy diễn logic', example: 'Candidates must avoid making unsupported subjective inferences beyond explicitly stated facts.' },
          { word: 'Paraphrase', ipa: '/ˈpær.ə.freɪz/ (v)', meaning: 'Diễn giải đồng nghĩa', example: 'Reading questions frequently paraphrase passages using academic synonyms and inverted syntax.' }
        ],
        takeaway: 'Trong Reading, đừng bao giờ suy đoán theo hiểu biết thực tế bên ngoài. Mọi câu trả lời ĐÚNG hay SAI đều phải được trích xuất bằng chứng xác thực trực tiếp từ văn bản.'
      },
      {
        objectives: [
          { icon: 'fa-chart-pie', title: 'Overview ăn trọn điểm', desc: 'Viết từ 1 đến 2 câu nêu bật xu hướng chung rõ ràng nhất hoặc khoảng cách lớn nhất giữa các nhóm số liệu.' },
          { icon: 'fa-layer-group', title: 'Gom nhóm số liệu thông minh', desc: 'Chia 2 đoạn thân bài logic: Đoạn 1 mô tả các đối tượng tăng trưởng, Đoạn 2 mô tả các đối tượng suy giảm.' },
          { icon: 'fa-arrow-trend-up', title: 'Bộ từ vựng xu hướng đa dạng', desc: 'Thay thế increase/decrease bằng: surge, soar, plummet, slump, oscillate, plateau.' }
        ],
        vocab: [
          { word: 'Surge', ipa: '/sɜːdʒ/ (v/n)', meaning: 'Tăng vọt đột biến', example: 'Global investment in solar power experienced an unprecedented surge over the past decade.' },
          { word: 'Plummet', ipa: '/ˈplʌm.ɪt/ (v)', meaning: 'Lao dốc thẳng đứng', example: 'Coal consumption plummeted dramatically following the implementation of stringent carbon taxes.' },
          { word: 'Fluctuate', ipa: '/ˈflʌk.tʃu.eɪt/ (v)', meaning: 'Biến động liên tục', example: 'Agricultural commodity prices fluctuated wildly due to unpredictable seasonal weather events.' }
        ],
        takeaway: 'Tuyệt đối không đưa cảm nghĩ hoặc nguyên nhân cá nhân vào Task 1 (không viết "because of..."). Chỉ tường thuật trung thực các số liệu và xu hướng hiển thị trên biểu đồ.'
      },
      {
        objectives: [
          { icon: 'fa-pen-nib', title: 'Cấu trúc đoạn PEEL', desc: 'Mỗi đoạn thân bài phát triển theo: Point (Luận điểm) -> Explanation (Giải thích) -> Example (Dẫn chứng) -> Link (Chốt ý).' },
          { icon: 'fa-puzzle-piece', title: 'Ngữ pháp đa dạng Band 8.0+', desc: 'Ứng dụng linh hoạt câu điều kiện loại 3/hỗn hợp, mệnh đề quan hệ rút gọn, phân từ hiện tại và đảo ngữ Had/Should.' },
          { icon: 'fa-microphone-lines', title: 'Phản xạ Speaking AREC', desc: 'Công thức mở rộng câu trả lời tự nhiên: Answer (Trả lời) -> Reason (Lý do) -> Example (Ví dụ) -> Counterpoint (Mặt khác).' }
        ],
        vocab: [
          { word: 'Substantiate', ipa: '/səbˈstæn.ʃi.eɪt/ (v)', meaning: 'Chứng minh bằng chứng cứ', example: 'Robust academic research is required to substantiate arguments regarding AI in education.' },
          { word: 'Preponderance', ipa: '/prɪˈpɒn.dər.əns/ (n)', meaning: 'Sự chiếm ưu thế', example: 'A preponderance of clinical evidence indicates that balanced screen time improves student focus.' },
          { word: 'Indispensable', ipa: '/ˌɪn.dɪˈspen.sə.bəl/ (adj)', meaning: 'Không thể thiếu', example: 'Autonomous language immersion tools remain indispensable for advanced fluency acquisition.' }
        ],
        takeaway: 'Chất lượng quan trọng hơn số lượng: Thay vì liệt kê 3 ý tưởng rời rạc trong một đoạn, hãy tập trung giải thích sâu 1 luận điểm duy nhất với chuỗi nguyên nhân - kết quả chặt chẽ.'
      }
    ];

    function switchClassroomTab(tabName) {
      document.querySelectorAll('.classroom-tab-btn').forEach(btn => {
        btn.classList.remove('text-brand-600', 'dark:text-indigo-400', 'bg-white', 'dark:bg-slate-800', 'shadow-sm');
        btn.classList.add('text-slate-600', 'dark:text-slate-400');
      });
      const activeBtn = document.getElementById('nav-' + tabName);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
        activeBtn.classList.add('text-brand-600', 'dark:text-indigo-400', 'bg-white', 'dark:bg-slate-800', 'shadow-sm');
      }

      document.querySelectorAll('.classroom-tab-content').forEach(content => {
        content.classList.add('hidden');
      });
      const activeContent = document.getElementById('content-' + tabName);
      if (activeContent) {
        activeContent.classList.remove('hidden');
      }
    }
    window.switchClassroomTab = switchClassroomTab;

    function selectClassroomLesson(index) {
      if (index >= 0 && index < currentCourseLessons.length) {
        currentLessonIndex = index;
        playLesson(currentCourseLessons[index], index);
      }
    }
    window.selectClassroomLesson = selectClassroomLesson;

    function updateCompleteButtonState(isCompleted) {
      const btn = document.getElementById('btn-toggle-complete-main');
      const txt = document.getElementById('btn-toggle-complete-text');
      if (!btn || !txt) return;
      if (isCompleted) {
        btn.className = 'px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700';
        txt.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500 mr-1"></i> Đã hoàn thành (Bấm để hủy)';
      } else {
        btn.className = 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer';
        txt.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> Đánh dấu hoàn thành bài';
      }
    }

    async function handleToggleLessonComplete() {
      if (!getValidToken() || !currentClassroomCourseId) return;
      try {
        const res = await fetch(`${API_BASE}/courses/${currentClassroomCourseId}/lessons/${currentLessonIndex}/toggle-complete?force=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`
          },
          body: JSON.stringify({ force: true })
        });
        const json = await res.json();
        if (json.success) {
          if (typeof showToast === 'function') {
            showToast(json.isCompleted ? '🎉 Đã hoàn thành bài học! Tiến độ đã được ghi nhận vào MongoDB & Redis.' : 'Đã hủy trạng thái hoàn thành bài học.', 'success');
          }
          await loadCourseProgress(currentClassroomCourseId);
          updateCompleteButtonState(json.isCompleted);
          renderClassroomPlaylist(currentCourseLessons);
        } else {
          if (typeof showToast === 'function') showToast(json.message || 'Không thể cập nhật tiến độ', 'warning');
        }
      } catch (err) {
        console.error('Loi toggle complete:', err);
      }
    }
    window.handleToggleLessonComplete = handleToggleLessonComplete;

    async function loadLessonMaterials(index, lesson) {
      const container = document.getElementById('lesson-materials-container');
      const countBadge = document.getElementById('badge-materials-count');
      if (!container) return;

      let materials = [];
      try {
        const res = await fetch(`${API_BASE}/courses/${currentClassroomCourseId}/lessons/${index}/resources`, {
          headers: { Authorization: `Bearer ${getValidToken()}` }
        });
        const json = await res.json();
        if (json.success && json.data) materials = json.data;
      } catch (e) {}

      if (!materials.length && Array.isArray(lesson.materials) && lesson.materials.length) {
        materials = lesson.materials.map((m, i) => {
          const cleanName = typeof m === 'string' ? m : (m.title || `Tai_Lieu_${i+1}.pdf`);
          const displayName = cleanName.replace(/_/g, ' ').replace(/\.pdf$/i, '').toUpperCase();
          return {
            id: `mat-${index}-${i}`,
            title: `${displayName}.pdf`,
            type: 'pdf',
            size: `${(2.8 + i * 1.3).toFixed(1)} MB`,
            url: `/api/courses/materials/${encodeURIComponent(cleanName)}`,
            description: i === 0 ? 'Tài liệu độc quyền kèm tiêu chí chấm điểm & chiến lược giải đề' : 'Bộ từ vựng học thuật & bài tập tự luyện có đáp án chi tiết'
          };
        });
      }

      if (countBadge) countBadge.textContent = materials.length;

      container.innerHTML = materials.map((item, i) => `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-brand-500/50 transition-all gap-3">
          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-500 flex items-center justify-center text-lg shrink-0 mt-0.5">
              <i class="fa-solid fa-file-pdf"></i>
            </div>
            <div>
              <div class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>${item.title}</span>
                <span class="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">${item.size || '3.2 MB'}</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${item.description || 'Tài liệu độc quyền dành cho học viên EduPro'}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <a href="${item.url || `/api/courses/materials/${encodeURIComponent(item.title)}`}" target="_blank" download class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <i class="fa-solid fa-download"></i> Tải về (.PDF)
            </a>
          </div>
        </div>
      `).join('');
    }

    function downloadCourseZipBundle() {
      if (typeof showToast === 'function') {
        showToast('📥 Đang đóng gói trọn bộ giáo trình PDF & bài tập tự luyện của khóa học...', 'info');
      }
      const link = document.createElement('a');
      link.href = `/api/courses/materials/${encodeURIComponent('IELTS_Masterclass_Complete_Syllabus_2026.pdf')}`;
      link.download = 'IELTS_Masterclass_Complete_Syllabus_2026.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    window.downloadCourseZipBundle = downloadCourseZipBundle;

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
      window.currentClassroomCourseId = courseId;

      try {
        const res = await fetch(`${API_BASE}/courses/${courseId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const course = json.data;
          const { lessons, title, reviews, rating, category, instructorName, durationHours, reviewsCount } = course;
          
          // 1. Cập nhật Course Header Banner
          if (document.getElementById('classroom-course-header-title')) {
            document.getElementById('classroom-course-header-title').textContent = title || 'Lớp Học Trực Tuyến';
          }
          if (document.getElementById('classroom-badge-category')) {
            document.getElementById('classroom-badge-category').textContent = category || 'IELTS Academic Mastery';
          }
          if (document.getElementById('classroom-instructor-name')) {
            document.getElementById('classroom-instructor-name').textContent = instructorName || 'Ban Chuyên Môn EduPro (IELTS 8.5+)';
          }
          if (document.getElementById('classroom-total-hours')) {
            document.getElementById('classroom-total-hours').textContent = `${durationHours || 48} giờ học thực chiến`;
          }
          if (document.getElementById('classroom-rating-text')) {
            document.getElementById('classroom-rating-text').textContent = `${rating || 4.96} (${reviewsCount || 2843} học viên)`;
          }

          // 2. Khởi tạo danh sách bài học và tiến độ
          currentCourseLessons = lessons || [];
          currentLessonIndex = 0;
          await loadCourseProgress(courseId);

          if (lessons && lessons.length > 0) {
            renderClassroomPlaylist(lessons);
            playLesson(lessons[0], 0);
          } else {
            document.getElementById('classroom-playlist').innerHTML = '<div class="text-xs text-slate-400 p-4">Khóa học này đang cập nhật bài giảng.</div>';
          }

          renderCourseReviews(reviews || [], rating || 4.96);
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
      if (!container) return;
      document.getElementById('playlist-count').textContent = `${lessons.length} bài học`;
      let html = '';
      lessons.forEach((l, idx) => {
        const isCompleted = currentCourseCompletedLessons.includes(idx);
        const matCount = (Array.isArray(l.materials) && l.materials.length) ? l.materials.length : 2;
        const duration = l.video && l.video.durationSeconds ? Math.round(l.video.durationSeconds / 60) : (35 + idx * 5);
        const isActive = idx === currentLessonIndex;

        html += `
          <div onclick='selectClassroomLesson(${idx})' id="playlist-item-${idx}" class="playlist-btn w-full p-3.5 rounded-2xl border ${isActive ? 'border-brand-500 bg-brand-50/60 dark:bg-slate-800' : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'} text-left flex items-start gap-3 transition-all cursor-pointer">
            <span class="w-6 h-6 rounded-full ${isCompleted ? 'bg-emerald-500 text-white' : (isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')} flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ${isCompleted ? '<i class="fa-solid fa-check text-[10px]"></i>' : (idx + 1)}
            </span>
            <div class="flex-grow min-w-0">
              <div class="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">${l.title}</div>
              <div class="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span><i class="fa-regular fa-clock mr-1 text-indigo-500"></i>${duration} phút</span>
                <span><i class="fa-solid fa-file-pdf mr-1 text-rose-500"></i>${matCount} PDFs</span>
                ${isCompleted ? '<span class="text-emerald-500 font-bold"><i class="fa-solid fa-circle-check text-[10px]"></i> Đã xong</span>' : '<span class="text-slate-400">Chưa hoàn thành</span>'}
              </div>
            </div>
          </div>
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

    function playLesson(lesson, index = 0) {
      currentLessonIndex = index;
      currentLessonId = lesson._id;
      
      const durationMin = lesson.video && lesson.video.durationSeconds ? Math.round(lesson.video.durationSeconds / 60) : (35 + index * 5);
      
      if (document.getElementById('lesson-module-tag')) {
        document.getElementById('lesson-module-tag').textContent = `Bài ${lesson.order || (index + 1)} • Video bài giảng thực chiến`;
      }
      if (document.getElementById('lesson-duration-badge')) {
        document.getElementById('lesson-duration-badge').innerHTML = `<i class="fa-regular fa-clock mr-1 text-indigo-500"></i> ${durationMin} phút`;
      }
      if (document.getElementById('lesson-main-title')) {
        document.getElementById('lesson-main-title').textContent = lesson.title;
      }
      if (document.getElementById('lesson-main-desc')) {
        document.getElementById('lesson-main-desc').textContent = lesson.content || lesson.description || 'Nội dung thực hành phân tích và tối ưu hóa hệ thống dữ liệu.';
      }

      // Video Source URL
      const frame = document.getElementById('classroom-video-frame');
      const sampleVideos = [
        'https://www.youtube-nocookie.com/embed/84jVz0D-KkY', // All English Tenses C1-Advanced
        'https://www.youtube-nocookie.com/embed/QxQUapA-2w4', // Complete Guide to English Pronunciation
        'https://www.youtube-nocookie.com/embed/iG9CE55wbtY', // Sir Ken Robinson TED Talk
        'https://www.youtube-nocookie.com/embed/UF8uR6Z6KLc'  // Steve Jobs Stanford Address
      ];
      if (frame) frame.src = sampleVideos[(lesson.order || (index + 1)) % sampleVideos.length];

      // Đổ nội dung học thuật chuyên sâu vào Tab 1 (Overview & Key Takeaways)
      const meta = ACADEMIC_LESSON_CONTENT[index % ACADEMIC_LESSON_CONTENT.length];
      const objBox = document.getElementById('lesson-objectives-container');
      if (objBox) {
        objBox.innerHTML = meta.objectives.map((obj) => `
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                <i class="fa-solid ${obj.icon}"></i>
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">${obj.title}</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">${obj.desc}</p>
          </div>
        `).join('');
      }

      const vocabBox = document.getElementById('lesson-vocab-tbody');
      if (vocabBox) {
        vocabBox.innerHTML = meta.vocab.map(v => `
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
            <td class="p-3 font-bold text-brand-600 dark:text-indigo-400 font-mono">${v.word}</td>
            <td class="p-3 text-slate-600 dark:text-slate-300">
              <div class="font-mono text-[11px] text-slate-400">${v.ipa}</div>
              <div class="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">${v.meaning}</div>
            </td>
            <td class="p-3 text-slate-600 dark:text-slate-300 italic">${v.example}</td>
          </tr>
        `).join('');
      }

      const takeBox = document.getElementById('lesson-takeaways-text');
      if (takeBox) takeBox.textContent = meta.takeaway;

      // Nạp tài liệu vào Tab 2
      loadLessonMaterials(index, lesson);

      // Cập nhật trạng thái nút hoàn thành
      const isCompleted = currentCourseCompletedLessons.includes(index);
      updateCompleteButtonState(isCompleted);

      // Cập nhật highlight active trong playlist
      renderClassroomPlaylist(currentCourseLessons);

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
    if (j.success) {
      currentCourseCompletedLessons = Array.isArray(j.completedLessons) ? j.completedLessons : [];
      const total = currentCourseLessons.length || 4;
      const completed = currentCourseCompletedLessons.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const lbl = document.getElementById('classroom-progress-label');
      const pct = document.getElementById('classroom-progress-percent');
      const bar = document.getElementById('classroom-progress-bar-fill');
      
      if (lbl) lbl.textContent = `${completed}/${total} bài học hoàn thành`;
      if (pct) pct.textContent = `${percent}%`;
      if (bar) bar.style.width = `${percent}%`;
    }
  } catch (e) {
    console.warn('Lỗi tải tiến độ:', e);
  }
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
