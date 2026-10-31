const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../01_Source_Code_EduPro/public/js/classroom.js');
let code = fs.readFileSync(jsPath, 'utf8');

// Rich academic lesson content dictionary
const academicLessonContentCode = `
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
        const res = await fetch(\`\${API_BASE}/courses/\${currentClassroomCourseId}/lessons/\${currentLessonIndex}/toggle-complete?force=true\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: \`Bearer \${currentToken}\`
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
        const res = await fetch(\`\${API_BASE}/courses/\${currentClassroomCourseId}/lessons/\${index}/resources\`, {
          headers: { Authorization: \`Bearer \${getValidToken()}\` }
        });
        const json = await res.json();
        if (json.success && json.data) materials = json.data;
      } catch (e) {}

      if (!materials.length && Array.isArray(lesson.materials) && lesson.materials.length) {
        materials = lesson.materials.map((m, i) => {
          const cleanName = typeof m === 'string' ? m : (m.title || \`Tai_Lieu_\${i+1}.pdf\`);
          const displayName = cleanName.replace(/_/g, ' ').replace(/\\.pdf$/i, '').toUpperCase();
          return {
            id: \`mat-\${index}-\${i}\`,
            title: \`\${displayName}.pdf\`,
            type: 'pdf',
            size: \`\${(2.8 + i * 1.3).toFixed(1)} MB\`,
            url: \`/api/courses/materials/\${encodeURIComponent(cleanName)}\`,
            description: i === 0 ? 'Tài liệu độc quyền kèm tiêu chí chấm điểm & chiến lược giải đề' : 'Bộ từ vựng học thuật & bài tập tự luyện có đáp án chi tiết'
          };
        });
      }

      if (countBadge) countBadge.textContent = materials.length;

      container.innerHTML = materials.map((item, i) => \`
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-brand-500/50 transition-all gap-3">
          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-500 flex items-center justify-center text-lg shrink-0 mt-0.5">
              <i class="fa-solid fa-file-pdf"></i>
            </div>
            <div>
              <div class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>\${item.title}</span>
                <span class="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">\${item.size || '3.2 MB'}</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">\${item.description || 'Tài liệu độc quyền dành cho học viên EduPro'}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <a href="\${item.url || \`/api/courses/materials/\${encodeURIComponent(item.title)}\`}" target="_blank" download class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <i class="fa-solid fa-download"></i> Tải về (.PDF)
            </a>
          </div>
        </div>
      \`).join('');
    }

    function downloadCourseZipBundle() {
      if (typeof showToast === 'function') {
        showToast('📥 Đang đóng gói trọn bộ giáo trình PDF & bài tập tự luyện của khóa học...', 'info');
      }
      const link = document.createElement('a');
      link.href = \`/api/courses/materials/\${encodeURIComponent('IELTS_Masterclass_Complete_Syllabus_2026.pdf')}\`;
      link.download = 'IELTS_Masterclass_Complete_Syllabus_2026.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    window.downloadCourseZipBundle = downloadCourseZipBundle;
`;

// Replace enterClassroom, renderClassroomPlaylist, playLesson, loadCourseProgress
const oldEnterClassroomRegex = /async function enterClassroom\(courseId\) \{[\s\S]*?async function sendTelemetry\(eventType, duration\) \{/;

const newClassroomEngineCode = `    async function enterClassroom(courseId) {
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
        const res = await fetch(\`\${API_BASE}/courses/\${courseId}\`);
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
            document.getElementById('classroom-instructor-name').textContent = instructorName || 'TS. Nguyễn Thị Định (IELTS 8.5)';
          }
          if (document.getElementById('classroom-total-hours')) {
            document.getElementById('classroom-total-hours').textContent = \`\${durationHours || 48} giờ học thực chiến\`;
          }
          if (document.getElementById('classroom-rating-text')) {
            document.getElementById('classroom-rating-text').textContent = \`\${rating || 4.96} (\${reviewsCount || 2843} học viên)\`;
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
      document.getElementById('playlist-count').textContent = \`\${lessons.length} bài học\`;
      let html = '';
      lessons.forEach((l, idx) => {
        const isCompleted = currentCourseCompletedLessons.includes(idx);
        const matCount = (Array.isArray(l.materials) && l.materials.length) ? l.materials.length : 2;
        const duration = l.video && l.video.durationSeconds ? Math.round(l.video.durationSeconds / 60) : (35 + idx * 5);
        const isActive = idx === currentLessonIndex;

        html += \`
          <div onclick='selectClassroomLesson(\${idx})' id="playlist-item-\${idx}" class="playlist-btn w-full p-3.5 rounded-2xl border \${isActive ? 'border-brand-500 bg-brand-50/60 dark:bg-slate-800' : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'} text-left flex items-start gap-3 transition-all cursor-pointer">
            <span class="w-6 h-6 rounded-full \${isCompleted ? 'bg-emerald-500 text-white' : (isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')} flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              \${isCompleted ? '<i class="fa-solid fa-check text-[10px]"></i>' : (idx + 1)}
            </span>
            <div class="flex-grow min-w-0">
              <div class="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">\${l.title}</div>
              <div class="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span><i class="fa-regular fa-clock mr-1 text-indigo-500"></i>\${duration} phút</span>
                <span><i class="fa-solid fa-file-pdf mr-1 text-rose-500"></i>\${matCount} PDFs</span>
                \${isCompleted ? '<span class="text-emerald-500 font-bold"><i class="fa-solid fa-circle-check text-[10px]"></i> Đã xong</span>' : '<span class="text-slate-400">Chưa hoàn thành</span>'}
              </div>
            </div>
          </div>
        \`;
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
        document.getElementById('lesson-module-tag').textContent = \`Bài \${lesson.order || (index + 1)} • Video bài giảng thực chiến\`;
      }
      if (document.getElementById('lesson-duration-badge')) {
        document.getElementById('lesson-duration-badge').innerHTML = \`<i class="fa-regular fa-clock mr-1 text-indigo-500"></i> \${durationMin} phút\`;
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
        objBox.innerHTML = meta.objectives.map((obj) => \`
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-6 h-6 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                <i class="fa-solid \${obj.icon}"></i>
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">\${obj.title}</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">\${obj.desc}</p>
          </div>
        \`).join('');
      }

      const vocabBox = document.getElementById('lesson-vocab-tbody');
      if (vocabBox) {
        vocabBox.innerHTML = meta.vocab.map(v => \`
          <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
            <td class="p-3 font-bold text-brand-600 dark:text-indigo-400 font-mono">\${v.word}</td>
            <td class="p-3 text-slate-600 dark:text-slate-300">
              <div class="font-mono text-[11px] text-slate-400">\${v.ipa}</div>
              <div class="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">\${v.meaning}</div>
            </td>
            <td class="p-3 text-slate-600 dark:text-slate-300 italic">\${v.example}</td>
          </tr>
        \`).join('');
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

    async function sendTelemetry(eventType, duration) {`;

code = code.replace(/\r\n/g, '\n');

// Insert academicLessonContentCode before enterClassroom
if (code.includes('async function enterClassroom(courseId) {')) {
  code = code.replace('async function enterClassroom(courseId) {', academicLessonContentCode + '\n    async function enterClassroom(courseId) {');
}

// Replace enterClassroom -> sendTelemetry
code = code.replace(oldEnterClassroomRegex, newClassroomEngineCode);

// Also update loadCourseProgress
const oldLoadProgress = `async function loadCourseProgress(courseId) {
  if (!currentToken || !courseId) return;
  try {
    const r = await fetch(\`\${API_BASE}/courses/\${courseId}/progress\`, {
      headers: { Authorization: \`Bearer \${currentToken}\` }
    });
    const j = await r.json();
    if (j.success && Array.isArray(j.completedLessons)) {
      const chk = document.getElementById('chk-lesson-complete');
      if (chk) chk.checked = j.completedLessons.includes(currentLessonIndex);
    }
  } catch (e) {}
}`;

const newLoadProgress = `async function loadCourseProgress(courseId) {
  if (!currentToken || !courseId) return;
  try {
    const r = await fetch(\`\${API_BASE}/courses/\${courseId}/progress\`, {
      headers: { Authorization: \`Bearer \${currentToken}\` }
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
      
      if (lbl) lbl.textContent = \`\${completed}/\${total} bài học hoàn thành\`;
      if (pct) pct.textContent = \`\${percent}%\`;
      if (bar) bar.style.width = \`\${percent}%\`;
    }
  } catch (e) {
    console.warn('Lỗi tải tiến độ:', e);
  }
}`;

code = code.replace(oldLoadProgress, newLoadProgress);

// Convert back to CRLF
code = code.replace(/\n/g, '\r\n');
fs.writeFileSync(jsPath, code, 'utf8');
console.log('Successfully updated classroom.js!');
