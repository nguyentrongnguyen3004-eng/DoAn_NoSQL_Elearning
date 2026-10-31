const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../01_Source_Code_EduPro/public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// The new section-classroom HTML
const newSectionClassroom = `  <!-- ============================================================== -->
  <!-- 4. PHÂN HỆ 3: LỚP HỌC TRỰC TUYẾN CAO CẤP (PREMIUM LMS PORTAL)  -->
  <!-- ============================================================== -->
  <section id="section-classroom" class="main-section hidden flex-grow py-6 sm:py-8 bg-slate-50/50 dark:bg-slate-950/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

      <!-- 1. COURSE BANNER: HEADER CAO CẤP (THỂ HIỆN GIÁ TRỊ KHÓA HỌC) -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <!-- Background Glow Effects -->
        <div class="absolute -right-16 -top-16 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div class="space-y-3 max-w-3xl">
            <!-- Breadcrumb & Badges -->
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <button onclick="showSection('courses')" class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-all flex items-center gap-1.5 backdrop-blur-sm cursor-pointer">
                <i class="fa-solid fa-arrow-left text-[11px]"></i> <span>Danh mục khóa học</span>
              </button>
              <span class="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-bold" id="classroom-badge-category">
                IELTS Academic Mastery
              </span>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold flex items-center gap-1">
                <i class="fa-solid fa-shield-halved text-[10px]"></i> Bản quyền vĩnh viễn (Lifetime)
              </span>
              <span class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold flex items-center gap-1">
                ⭐ <span id="classroom-rating-text">4.96 (2,843 học viên)</span>
              </span>
            </div>

            <!-- Course Title -->
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug" id="classroom-course-header-title">
              IELTS Masterclass 7.5+: Chiến Thuật Toàn Diện (CMS Verified)
            </h1>

            <!-- Instructor Credential & University Accreditation -->
            <div class="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[11px] ring-2 ring-white/20">
                  <i class="fa-solid fa-chalkboard-user"></i>
                </div>
                <span>Giảng viên: <strong class="text-white" id="classroom-instructor-name">Ban Chuyên Môn EduPro (IELTS 8.5+)</strong></span>
              </div>
              <span class="text-slate-500 hidden sm:inline">•</span>
              <div class="flex items-center gap-1.5 text-slate-300">
                <i class="fa-solid fa-graduation-cap text-indigo-400"></i>
                <span>Khoa Ngoại ngữ - ĐH Công Thương TP.HCM (HUIT)</span>
              </div>
              <span class="text-slate-500 hidden sm:inline">•</span>
              <div class="flex items-center gap-1.5 text-slate-300">
                <i class="fa-solid fa-clock text-amber-400"></i>
                <span id="classroom-total-hours">48 giờ học thực chiến</span>
              </div>
            </div>

            <!-- Progress Bar inside Banner -->
            <div class="pt-2 max-w-xl">
              <div class="flex justify-between items-center text-xs mb-1.5">
                <span class="text-slate-300 font-medium flex items-center gap-1.5">
                  <i class="fa-solid fa-bars-progress text-indigo-400"></i>
                  <span>Tiến độ học tập cá nhân:</span>
                  <strong class="text-white" id="classroom-progress-label">1/4 bài học hoàn thành</strong>
                </span>
                <span class="text-emerald-400 font-black font-mono text-sm" id="classroom-progress-percent">25%</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/5">
                <div id="classroom-progress-bar-fill" class="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500" style="width: 25%"></div>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons on Header -->
          <div class="flex flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-auto">
            <button onclick="downloadCourseZipBundle()" class="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              <i class="fa-solid fa-cloud-arrow-down text-indigo-300"></i>
              <span>Tải trọn bộ tài liệu (.ZIP)</span>
            </button>
            <button onclick="openCertificateModal()" class="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <i class="fa-solid fa-award text-sm"></i>
              <span>Xem chứng chỉ hoàn thành</span>
            </button>
            <button onclick="switchClassroomTab('tab-discussions')" class="hidden lg:flex px-4 py-2 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 text-indigo-200 font-bold text-xs transition-all items-center justify-center gap-2 cursor-pointer">
              <i class="fa-solid fa-comments"></i>
              <span>Hỏi đáp cùng Giảng viên</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. MAIN WORKSPACE: VIDEO & TABS (LEFT) + PLAYLIST & WIDGETS (RIGHT) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <!-- CỘT TRÁI (8/12): VIDEO PLAYER + TAB WORKSTATION -->
        <div class="lg:col-span-8 space-y-5">
          
          <!-- Video Player Box -->
          <div class="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative group border border-slate-800">
            <iframe id="classroom-video-frame" class="w-full h-full" src="https://www.youtube-nocookie.com/embed/84jVz0D-KkY" title="Video Bài Học" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <video id="classroom-native-video" class="hidden w-full h-full object-cover" controls playsinline>
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>

            <!-- Overlay resolution badge -->
            <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-400 font-bold border border-white/10 flex items-center gap-1.5 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>1080p HD • 60fps</span>
            </div>
          </div>

          <!-- Video Source & Telemetry Heartbeat Status Bar -->
          <div class="flex flex-wrap items-center justify-between text-xs px-2 gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span id="video-source-label" class="font-medium">Nguồn: YouTube Cloud Stream (Chuẩn quốc tế)</span>
              <span class="text-slate-400 hidden sm:inline">•</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">Cassandra Heartbeat: Active</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" onclick="switchVideoSource('youtube')" id="btn-src-yt" class="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-indigo-400 font-bold border border-brand-200 dark:border-brand-800 text-[11px] transition-all cursor-pointer">
                <i class="fa-brands fa-youtube text-red-500 mr-1"></i> YouTube
              </button>
              <button type="button" onclick="switchVideoSource('html5')" id="btn-src-html5" class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] transition-all cursor-pointer">
                <i class="fa-solid fa-server mr-1 text-sky-500"></i> EduPro CDN (HTML5)
              </button>
            </div>
          </div>

          <!-- Active Lesson Header & Quick Actions -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-indigo-300 text-xs font-black" id="lesson-module-tag">
                  Bài 1 • Video bài giảng thực chiến
                </span>
                <span class="text-xs text-slate-500 dark:text-slate-400 font-medium" id="lesson-duration-badge">
                  <i class="fa-regular fa-clock mr-1 text-indigo-500"></i> 35 phút
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="handleToggleLessonComplete()" id="btn-toggle-complete-main" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="fa-solid fa-circle-check"></i>
                  <span id="btn-toggle-complete-text">Đánh dấu hoàn thành bài</span>
                </button>
                <button onclick="sendTelemetry('VIDEO_PROGRESS', 300)" class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="fa-solid fa-bookmark text-amber-500"></i>
                  <span>Đánh dấu 5:00</span>
                </button>
              </div>
            </div>

            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 leading-snug" id="lesson-main-title">
              Bài 1: Tổng quan cấu trúc đề thi IELTS Academic & Tiêu chí chấm điểm Band 7.5+
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed" id="lesson-main-desc">
              Phân tích chi tiết 4 kỹ năng Listening, Reading, Writing, Speaking và chiến thuật tối ưu điểm số theo chuẩn khảo thí quốc tế.
            </p>
          </div>

          <!-- ACADEMIC WORKSTATION: MULTI-TABBED NAVIGATION (6 CHỦ ĐỀ CHUYÊN SÂU) -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <!-- Tab Headers Bar -->
            <div class="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none bg-slate-50/70 dark:bg-slate-800/40 p-1.5 gap-1">
              <button onclick="switchClassroomTab('tab-overview')" id="nav-tab-overview" class="classroom-tab-btn active px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-brand-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-sm">
                <i class="fa-solid fa-book-open-reader"></i>
                <span>📖 Trọng tâm bài giảng</span>
              </button>
              <button onclick="switchClassroomTab('tab-materials')" id="nav-tab-materials" class="classroom-tab-btn px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <i class="fa-solid fa-file-pdf text-rose-500"></i>
                <span>📥 Giáo trình & Slide PDF</span>
                <span class="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 text-[10px] font-mono font-bold" id="badge-materials-count">2</span>
              </button>
              <button onclick="switchClassroomTab('tab-notes')" id="nav-tab-notes" class="classroom-tab-btn px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <i class="fa-solid fa-note-sticky text-amber-500"></i>
                <span>📝 Sổ tay ghi chú</span>
              </button>
              <button onclick="switchClassroomTab('tab-discussions')" id="nav-tab-discussions" class="classroom-tab-btn px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <i class="fa-solid fa-comments text-sky-500"></i>
                <span>💬 Hỏi đáp Giảng viên</span>
              </button>
              <button onclick="switchClassroomTab('tab-reviews')" id="nav-tab-reviews" class="classroom-tab-btn px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <i class="fa-solid fa-star text-amber-400"></i>
                <span>⭐ Đánh giá (5★)</span>
              </button>
              <button onclick="switchClassroomTab('tab-retention')" id="nav-tab-retention" class="classroom-tab-btn px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <i class="fa-solid fa-chart-line text-indigo-500"></i>
                <span>📊 Phân tích Cassandra</span>
              </button>
            </div>

            <!-- Tab 1: Trọng tâm & Giáo trình tóm tắt -->
            <div id="content-tab-overview" class="classroom-tab-content p-6 space-y-6">
              <!-- Mục tiêu đầu ra (Learning Objectives) -->
              <div>
                <h4 class="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <i class="fa-solid fa-bullseye text-brand-600"></i>
                  <span>Mục tiêu đầu ra của bài học (Learning Objectives)</span>
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="lesson-objectives-container">
                  <!-- Rendered dynamically -->
                </div>
              </div>

              <!-- Từ vựng học thuật & cấu trúc điểm cao xuất hiện trong bài -->
              <div>
                <h4 class="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <i class="fa-solid fa-spell-check text-indigo-500"></i>
                  <span>Từ vựng & Cấu trúc ngữ pháp Band 8.0+ trong bài giảng</span>
                </h4>
                <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th class="p-3">Từ vựng / Cụm từ</th>
                        <th class="p-3">Phiên âm & Nghĩa</th>
                        <th class="p-3">Mẫu câu ứng dụng Band 8.0+</th>
                      </tr>
                    </thead>
                    <tbody id="lesson-vocab-tbody" class="divide-y divide-slate-100 dark:divide-slate-800">
                      <!-- Rendered dynamically -->
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Tóm tắt chiến thuật làm bài -->
              <div class="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50">
                <h5 class="text-xs font-black text-indigo-950 dark:text-indigo-200 mb-2 flex items-center gap-2">
                  <i class="fa-solid fa-lightbulb text-amber-500"></i>
                  <span>Chiến thuật thi thực chiến từ Giảng viên:</span>
                </h5>
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed" id="lesson-takeaways-text">
                  Hãy ghi nhớ quy tắc phân bổ thời gian: Đừng dừng lại quá 90 giây ở một câu hỏi chưa rõ; đánh dấu keyword và dùng kỹ thuật Scanning để định vị vùng thông tin trong đoạn trước khi chốt đáp án.
                </p>
              </div>
            </div>

            <!-- Tab 2: Giáo trình & Slide PDF đính kèm -->
            <div id="content-tab-materials" class="classroom-tab-content hidden p-6 space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <i class="fa-solid fa-folder-open text-rose-500"></i>
                    <span>Tài liệu & Giáo trình số đính kèm bài học</span>
                  </h4>
                  <p class="text-xs text-slate-500 mt-0.5">Toàn bộ slide bài giảng, bài tập tự luyện và tài liệu chuẩn Cambridge 2026</p>
                </div>
                <button onclick="downloadCourseZipBundle()" class="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer">
                  <i class="fa-solid fa-download"></i> Tải tất cả (.ZIP)
                </button>
              </div>

              <!-- Danh sách tài liệu nạp động -->
              <div id="lesson-materials-container" class="space-y-3">
                <!-- Dynamic cards -->
              </div>

              <div class="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <i class="fa-solid fa-circle-exclamation text-base mt-0.5 shrink-0"></i>
                <div class="leading-relaxed">
                  <strong>Bản quyền giáo trình:</strong> Tài liệu học tập được biên soạn độc quyền bởi Hội đồng Học thuật EduPro English & Khoa Ngoại ngữ HUIT. Nghiêm cấm sao chép, thương mại hóa dưới mọi hình thức ngoài phạm vi học tập cá nhân.
                </div>
              </div>
            </div>

            <!-- Tab 3: Sổ tay ghi chú theo mốc thời gian -->
            <div id="content-tab-notes" class="classroom-tab-content hidden p-6 space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <i class="fa-solid fa-note-sticky text-amber-500"></i>
                  <span>Sổ Tay Ghi Chú Theo Mốc Giờ Video (MongoDB Embedded)</span>
                </h4>
                <span class="text-[11px] text-slate-400">Đồng bộ tự động theo bài giảng</span>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <input type="text" id="note-timestamp-input" value="05:20" class="w-full sm:w-24 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center text-brand-600 dark:text-indigo-400 outline-none" placeholder="05:20">
                <input type="text" id="note-content-input" placeholder="Nhập ghi chú công thức ngữ pháp / từ vựng quan trọng tại mốc giờ này..." class="flex-grow px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-brand-500 dark:text-white">
                <button onclick="saveLessonNote()" class="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shrink-0 transition-all cursor-pointer">
                  <i class="fa-solid fa-plus mr-1"></i> Lưu ghi chú
                </button>
              </div>
              <div id="classroom-notes-list" class="space-y-2 max-h-60 overflow-y-auto pr-1"></div>
            </div>

            <!-- Tab 4: Diễn đàn Hỏi đáp Giảng viên & Học thuật -->
            <div id="content-tab-discussions" class="classroom-tab-content hidden p-6 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 class="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <i class="fa-solid fa-comments text-sky-500"></i>
                    <span>Diễn Đàn Hỏi Đáp Giảng Viên & Trợ Giảng</span>
                  </h4>
                  <p class="text-xs text-slate-500 mt-0.5">Đặt câu hỏi chuyên môn để nhận giải đáp chuẩn khảo thí trong 24 giờ</p>
                </div>
                <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <i class="fa-solid fa-circle-check mr-1"></i> Giảng viên trực tiếp trả lời (Verified)
                </span>
              </div>

              <div class="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700">
                <input type="text" id="qa-question-title" placeholder="Tiêu đề câu hỏi (Vd: Cách dùng đảo ngữ Had it not been for trong IELTS Writing?)" class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-brand-500">
                <div class="flex flex-col sm:flex-row gap-2">
                  <input type="text" id="qa-question-content" placeholder="Mô tả chi tiết câu hỏi ngữ pháp / từ vựng của bạn..." class="flex-grow px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-brand-500">
                  <button onclick="submitCourseDiscussion()" class="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shrink-0 transition-all cursor-pointer">
                    <i class="fa-solid fa-paper-plane mr-1"></i> Đăng câu hỏi
                  </button>
                </div>
              </div>
              <div id="classroom-discussions-list" class="space-y-3 max-h-80 overflow-y-auto pr-1"></div>
            </div>

            <!-- Tab 5: Đánh giá & Nhận xét 5 sao -->
            <div id="content-tab-reviews" class="classroom-tab-content hidden p-6 space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 class="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <i class="fa-solid fa-star text-amber-400"></i>
                  <span>Đánh Giá & Nhận Xét Của Học Viên Đã Mua Khóa Học</span>
                </h4>
                <span class="text-xs font-bold text-amber-600 dark:text-amber-400" id="course-avg-rating-badge">⭐ 4.96 / 5.0</span>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <select id="review-rating-select" class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-amber-600 outline-none">
                  <option value="5">⭐⭐⭐⭐⭐ (5/5 Xuất sắc)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5 Rất tốt)</option>
                  <option value="3">⭐⭐⭐ (3/5 Khá)</option>
                </select>
                <input type="text" id="review-comment-input" placeholder="Chia sẻ cảm nhận của bạn về khóa học Tiếng Anh này..." class="flex-grow px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-brand-500 dark:text-white">
                <button onclick="submitCourseReview()" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shrink-0 transition-all cursor-pointer">
                  Gửi đánh giá
                </button>
              </div>
              <div id="classroom-reviews-list" class="space-y-3 max-h-72 overflow-y-auto pr-1"></div>
            </div>

            <!-- Tab 6: Phân tích Cassandra (Video Retention Curve) -->
            <div id="content-tab-retention" class="classroom-tab-content hidden p-6 space-y-4 text-left">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 class="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <i class="fa-solid fa-chart-line text-brand-600"></i>
                  <span>Phân Tích Tỷ Lệ Giữ Chân Video (Cassandra Time-Series Analytics)</span>
                </h4>
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-brand-600 dark:text-indigo-400">
                  Chuỗi thời gian thực
                </span>
              </div>
              <div id="video-retention-container" class="space-y-4"></div>
            </div>
          </div>
        </div>

        <!-- CỘT PHẢI (4/12): PLAYLIST BÀI GIẢNG + MENTOR ONLINE + NHẬT KÝ TELEMETRY + KHÓA HỌC NEO4J -->
        <div class="lg:col-span-4 space-y-5">
          
          <!-- Playlist Box cao cấp -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <i class="fa-solid fa-list-check text-brand-600"></i>
                  <span>Nội dung khóa học</span>
                </h4>
                <div class="text-[11px] text-slate-400 mt-0.5">Học tuần tự để mở khóa chứng chỉ</div>
              </div>
              <span class="text-xs font-black px-2.5 py-1 rounded-full bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-indigo-400" id="playlist-count">4 bài học</span>
            </div>

            <!-- Container danh sách bài giảng nạp động -->
            <div id="classroom-playlist" class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1"></div>
          </div>

          <!-- Box Giảng viên hỗ trợ trực tiếp -->
          <div class="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800/80 rounded-3xl p-5 border border-indigo-100 dark:border-slate-800 shadow-sm text-left">
            <div class="flex items-center gap-3 mb-3">
              <div class="relative">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" alt="Giảng viên" class="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500">
                <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </div>
              <div>
                <div class="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Ban Chuyên Môn EduPro</span>
                  <i class="fa-solid fa-circle-check text-brand-600 text-[11px]" title="Verified Lecturer"></i>
                </div>
                <div class="text-[11px] text-brand-600 dark:text-indigo-400 font-bold">IELTS 8.5 • Trưởng Bộ môn</div>
                <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Đang trực tuyến hỗ trợ</span>
                </div>
              </div>
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Nếu bạn có bất kỳ câu hỏi nào về từ vựng, ngữ pháp hoặc bài tập trong bài, hãy đặt câu hỏi tại mục Hỏi đáp hoặc nhắn tin cho tôi.
            </p>
            <button onclick="switchClassroomTab('tab-discussions')" class="w-full py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 text-brand-600 dark:text-indigo-400 border border-brand-200 dark:border-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-comment-dots"></i>
              <span>Gửi câu hỏi cho Giảng viên</span>
            </button>
          </div>

          <!-- Nhật ký tiến trình học tập (Cassandra Telemetry Log Stream) -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h4 class="font-extrabold text-slate-900 dark:text-white mb-3 flex items-center justify-between text-xs">
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-timeline text-sky-500"></i>
                <span>Nhật Ký Học Tập (Cassandra)</span>
              </span>
              <span class="text-[10px] text-slate-400 font-mono">Heartbeat Stream</span>
            </h4>
            <div id="telemetry-log-stream" class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <div class="text-center py-4 text-slate-400 text-xs">Đang tải nhật ký...</div>
            </div>
          </div>

          <!-- Khóa học bổ trợ đề xuất (Neo4j Graph AI) -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h4 class="font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-xs">
              <i class="fa-solid fa-diagram-project text-emerald-500"></i>
              <span>Lộ Trình Bổ Trợ (Neo4j Graph AI)</span>
            </h4>
            <div id="neo4j-course-recommendations" class="space-y-2"></div>
          </div>
        </div>

      </div>
    </div>
  </section>`;

// Replace old section-classroom
const startTag = '<section id="section-classroom"';
const endTag = '</section>';

const startIdx = indexHtml.indexOf(startTag);
if (startIdx === -1) {
  console.error('Cannot find #section-classroom start');
  process.exit(1);
}

const endIdx = indexHtml.indexOf(endTag, startIdx);
if (endIdx === -1) {
  console.error('Cannot find #section-classroom end');
  process.exit(1);
}

const finalEndIdx = endIdx + endTag.length;
indexHtml = indexHtml.slice(0, startIdx) + newSectionClassroom + indexHtml.slice(finalEndIdx);

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('Successfully updated index.html with new classroom UI!');
