// ==============================================================================
// 1. CORE ENGINE: STATE, AUTH, NAV, CATALOG, VIETQR, CERT & CMS
// ==============================================================================

    window.API_BASE = window.location.origin + '/api';
var API_BASE = window.API_BASE;

    // ==============================================================================
    // TÍNH NĂNG KIẾN TRÚC 1: THÔNG BÁO THỜI GIAN THỰC QUA REDIS PUB/SUB & SSE
    // ==============================================================================
    var sseLiveSource = null;

    function initSSELiveStream() {
      if (window.location.search.includes('screenshot=1')) return;
      if (sseLiveSource) return;
      try {
        sseLiveSource = new EventSource('/api/events/live-stream');
        sseLiveSource.onmessage = function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NOTIFICATION') {
              const notif = data.payload;
              showLiveToast(notif.title, notif.message, notif.icon || '📢');
              loadRecentNotifications();
            } else if (data.type === 'LEADERBOARD_UPDATE') {
              console.log('[SSE] Leaderboard update received:', data.payload);
            }
          } catch (e) {}
        };
        sseLiveSource.onerror = function() {
          console.warn('[SSE] Ket noi SSE tam gian doan, tu dong thu lai...');
        };
      } catch (e) {
        console.warn('[SSE] Trinh duyet khong ho tro SSE:', e.message);
      }
    }

    function showLiveToast(title, message, icon = '📢') {
      const container = document.getElementById('live-toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl flex items-start gap-3 max-w-sm w-full animate-in slide-in-from-top-4 duration-300 transition-all';
      toast.innerHTML = `
        <div class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-lg">
          ${icon}
        </div>
        <div class="flex-grow text-left">
          <div class="text-xs font-bold text-slate-900 dark:text-white leading-tight">${title}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">${message}</div>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 6000);
    }

    async function loadRecentNotifications() {
      try {
        const res = await fetch('/api/notifications/my-recent');
        const data = await res.json();
        const badge = document.getElementById('notification-badge');
        const listContainer = document.getElementById('notification-list');
        if (!badge || !listContainer) return;

        if (data.success && data.data && data.data.length > 0) {
          if (data.unreadCount > 0) {
            badge.textContent = data.unreadCount;
            badge.classList.remove('hidden');
          } else {
            badge.classList.add('hidden');
          }

          listContainer.innerHTML = data.data.map(n => `
            <div class="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left ${!n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
              <div class="flex items-start gap-3">
                <span class="text-lg shrink-0 mt-0.5">${n.icon || '📢'}</span>
                <div class="flex-grow">
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">${n.title}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">${n.message}</div>
                  <div class="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <i class="fa-regular fa-clock"></i> ${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          `).join('');
        }
      } catch (e) {
        console.warn('Loi khi tai thong bao:', e.message);
      }
    }

    function toggleNotificationDropdown() {
      const dd = document.getElementById('notification-dropdown');
      if (dd) {
        dd.classList.toggle('hidden');
        if (!dd.classList.contains('hidden')) {
          loadRecentNotifications();
        }
      }
    }

    async function markAllNotificationsRead() {
      try {
        await fetch('/api/notifications/mark-read', { method: 'POST' });
        const badge = document.getElementById('notification-badge');
        if (badge) badge.classList.add('hidden');
        loadRecentNotifications();
      } catch (e) {}
    }

    function openBroadcastModal() {
      document.getElementById('modal-broadcast-notification')?.classList.remove('hidden');
      document.getElementById('notification-dropdown')?.classList.add('hidden');
    }

    function closeBroadcastModal() {
      document.getElementById('modal-broadcast-notification')?.classList.add('hidden');
    }

    async function submitBroadcastNotification() {
      const title = document.getElementById('broadcast-title')?.value?.trim();
      const message = document.getElementById('broadcast-message')?.value?.trim();
      const type = document.getElementById('broadcast-type')?.value || 'system';

      if (!title || !message) {
        showCustomAlert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!');
        return;
      }

      try {
        const res = await fetch('/api/notifications/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, message, type })
        });
        const data = await res.json();
        if (data.success) {
          closeBroadcastModal();
          showCustomAlert('Đã phát sóng thông báo thành công qua Redis Pub/Sub!');
          loadRecentNotifications();
        } else {
          showCustomAlert(data.message || 'Lỗi khi phát thông báo');
        }
      } catch (e) {
        showCustomAlert('Lỗi mạng khi phát thông báo: ' + e.message);
      }
    }


    var EXAM_ID = '670000000000000000000040';
    var currentToken = localStorage.getItem('edupro_token') || null;
    var currentUser = JSON.parse(localStorage.getItem('edupro_user') || 'null');
    var userEnrolledCourseIds = new Set();

    window.currentToken = currentToken;
    window.currentUser = currentUser;
    window.userEnrolledCourseIds = userEnrolledCourseIds;
    window.getAuthToken = function() {
      if (!currentToken || currentToken === 'null') {
        currentToken = localStorage.getItem('edupro_token') || window.currentToken || null;
      }
      return currentToken;
    };
    var getValidToken = window.getAuthToken;
    window.getValidToken = getValidToken;
    window.getCurrentUser = function() {
      if (!currentUser) {
        try { currentUser = JSON.parse(localStorage.getItem('edupro_user') || 'null'); } catch(e) {}
      }
      return currentUser;
    };
    window.isCourseEnrolled = function(courseId) {
      if (!courseId) return false;
      return userEnrolledCourseIds.has(String(courseId));
    };
    var examCountdown = null;
    var loadedQuestions = [];
    var userAnswers = {};
    var isPracticeMode = false;
    var isExamDisqualified = false;
    var bookmarkedQuestionIds = [];
    var visGraph = null;
    var rawCoursesData = [];
    var lastExamResult = null;
    var allFlashcards = [];
    var currentFlashcardFilter = 'ALL';
    var allDictations = [];
    var currentDictationItem = null;
    var currentDictLookupEntry = null;
    var arenaTimerInterval = null;
    var arenaTimeLeft = 60;
    var arenaScore = 0;
    var arenaCombo = 1;
    var arenaMaxCombo = 1;
    var arenaMatchedCount = 0;
    var currentArenaQuestion = null;

    // 1. CHUYỂN ĐỔI DARK MODE (TÍNH NĂNG 4)
    function initTheme() {
      const isDark = localStorage.getItem('edupro_theme') === 'dark' || 
        (!('edupro_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    function toggleDarkMode() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('edupro_theme', isDark ? 'dark' : 'light');
      // Redraw graph if active
      if (visGraph) setTimeout(() => initKnowledgeGraph(), 100);
    }

    // TOGGLE MOBILE MENU DRAWER
    function toggleMobileMenu() {
      const drawer = document.getElementById('mobile-menu-drawer');
      const icon = document.getElementById('mobile-menu-icon');
      if (!drawer) return;
      const isClosed = drawer.classList.contains('hidden');
      if (isClosed) {
        drawer.classList.remove('hidden');
        if (icon) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        }
      } else {
        drawer.classList.add('hidden');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    }

    // 2. CHUYỂN SECTION TAB
    function showSection(sectionId) {
      document.querySelectorAll('.main-section').forEach(s => s.classList.add('hidden'));
      const target = document.getElementById(`section-${sectionId}`);
      if (target) target.classList.remove('hidden');

      document.querySelectorAll('.nav-item-btn').forEach(btn => {
        btn.classList.remove('bg-brand-50', 'dark:bg-brand-900/30', 'text-brand-600', 'dark:text-indigo-400');
        btn.classList.add('text-slate-600', 'dark:text-slate-300');
      });
      const activeBtn = document.getElementById(`nav-btn-${sectionId}`);
      if (activeBtn) {
        activeBtn.classList.add('bg-brand-50', 'dark:bg-brand-900/30', 'text-brand-600', 'dark:text-indigo-400');
        activeBtn.classList.remove('text-slate-600', 'dark:text-slate-300');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (sectionId === 'vocab') { loadFlashcards(); loadDictations(); loadWordArenaLeaderboard(); loadSrsDueQueue(); loadCollocationMindmap('problem'); loadClozeExercise(); loadAccentSamples(); loadVisualGrammarCards(); }
      if (sectionId === 'writing') { updateEssayWordCount(); loadPvPSpeakingLeaderboard();
      loadStudyBuddies(); }
      if (sectionId === 'exam') {
        if (!window.isExamActive) {
          showExamLobby();
        }
        loadBookmarkedQuestions();
        loadLeaderboard();
      }
      if (sectionId === 'graph') { initKnowledgeGraph(); generateAdaptiveRoadmap(); loadSkillTreeData(); }
      if (sectionId === 'history') { loadUserHistory(); loadGamificationProfile(); loadCassandraHeatmap(); loadWeaknessDiagnosticData(); loadRegionalClubs(); }
      if (sectionId === 'analytics') { loadAnalyticsData(); check4DatabasesHealth(); loadAdminUsersList(); }
      if (sectionId === 'courses') { loadPomodoroPresence(); }
    }

    function scrollToCoursesList() {
      document.getElementById('courses-list-anchor').scrollIntoView({ behavior: 'smooth' });
    }

    // 3. TÌM KIẾM TỨC THÌ & LỌC DANH MỤC KHÓA HỌC (TÍNH NĂNG 3)
    function handleInstantSearch(keyword) {
      showSection('courses');
      const kw = keyword.toLowerCase().trim();
      const filtered = rawCoursesData.filter(c => 
        c.title.toLowerCase().includes(kw) || 
        (c.tagline && c.tagline.toLowerCase().includes(kw)) ||
        (c.category && c.category.toLowerCase().includes(kw))
      );
      renderCoursesGrid(filtered);
    }

    function filterCoursesByCategory(category, btnElement) {
      document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.remove('bg-brand-600', 'text-white', 'shadow-sm', 'shadow-md', 'shadow-brand-500/20');
        p.classList.add('bg-white', 'dark:bg-slate-900', 'border', 'border-slate-200', 'dark:border-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      const targetBtn = btnElement || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
      if (targetBtn && targetBtn.classList) {
        targetBtn.classList.add('bg-brand-600', 'text-white', 'shadow-sm');
        targetBtn.classList.remove('bg-white', 'dark:bg-slate-900', 'border', 'border-slate-200', 'dark:border-slate-800', 'text-slate-700', 'dark:text-slate-300');
      }

      if (category === 'ALL') {
        renderCoursesGrid(rawCoursesData);
      } else {
        const filtered = rawCoursesData.filter(c => c.category === category);
        renderCoursesGrid(filtered);
      }
    }

    // 4. AUTH VÀ SYNC USER
    function openLoginModal(tab = 'login') {
      const activeToken = window.currentToken || currentToken || localStorage.getItem('edupro_token');
      const activeUser = window.currentUser || currentUser || (function() {
        try { return JSON.parse(localStorage.getItem('edupro_user') || 'null'); } catch(e) { return null; }
      })();

      if (activeToken && activeUser && activeUser.username) {
        if (typeof showToast === 'function') {
          showToast(`Bạn đang đăng nhập với tài khoản: ${activeUser.fullName || activeUser.username}`, 'info');
        }
        syncUserUI();
        return;
      }

      document.getElementById('login-modal').classList.remove('hidden');
      switchAuthTab(tab);
      hideAuthAlert();
    }

    function resetRegisterForm() {
      const form = document.getElementById('form-register');
      if (form) form.reset();

      // Reset từng input về chuỗi rỗng
      const inputIds = ['reg-fullname', 'reg-username', 'reg-email', 'reg-otp', 'reg-password', 'reg-confirm-password'];
      inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      // Reset các trường mật khẩu về type='password'
      const pwd = document.getElementById('reg-password');
      if (pwd) pwd.type = 'password';
      const confirmPwd = document.getElementById('reg-confirm-password');
      if (confirmPwd) confirmPwd.type = 'password';

      // Reset icon con mắt về fa-eye
      document.querySelectorAll('#auth-view-register .btn-toggle-eye i').forEach(icon => {
        icon.className = 'fa-solid fa-eye';
      });

      // Ẩn hộp nhập mã OTP (chỉ hiện khi bấm gửi mã thành công)
      const boxOtp = document.getElementById('box-reg-otp');
      if (boxOtp) boxOtp.classList.add('hidden');

      const txtOtp = document.getElementById('txt-reg-otp');
      if (txtOtp) txtOtp.textContent = 'Gửi mã OTP';
      const btnOtp = document.getElementById('btn-send-reg-otp');
      if (btnOtp) btnOtp.disabled = false;

      // Reset giao diện kiểm tra độ mạnh mật khẩu
      resetPasswordStrengthUI();
      hideAuthAlert();
    }
    window.resetRegisterForm = resetRegisterForm;

    function resetPasswordStrengthUI() {
      const label = document.getElementById('pwd-strength-label');
      if (label) {
        label.textContent = 'Chưa nhập';
        label.className = 'text-xs font-black text-slate-400';
      }
      const bars = ['pwd-bar-1', 'pwd-bar-2', 'pwd-bar-3', 'pwd-bar-4'];
      bars.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = 'h-full flex-1 rounded-full bg-slate-300 dark:bg-slate-600 transition-all duration-300';
      });
      ['rule-length', 'rule-upper', 'rule-lower', 'rule-number', 'rule-special'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.className = 'flex items-center gap-1.5 text-slate-400 transition-colors';
          const icon = el.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-circle-xmark text-slate-300 dark:text-slate-600 text-xs';
        }
      });
      const matchIndicator = document.getElementById('pwd-match-indicator');
      if (matchIndicator) {
        matchIndicator.classList.add('hidden');
        matchIndicator.innerHTML = '';
      }
    }
    window.resetPasswordStrengthUI = resetPasswordStrengthUI;

    function checkRegisterPasswordStrength() {
      const pwdInput = document.getElementById('reg-password');
      const confirmInput = document.getElementById('reg-confirm-password');
      if (!pwdInput) return { isValid: false };

      const pwd = pwdInput.value || '';
      const confirmPwd = confirmInput ? (confirmInput.value || '') : '';

      const hasLength = pwd.length >= 8;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);

      function updateItem(id, valid) {
        const el = document.getElementById(id);
        if (!el) return;
        const icon = el.querySelector('i');
        if (valid) {
          el.className = 'flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold transition-colors';
          if (icon) icon.className = 'fa-solid fa-circle-check text-emerald-500 text-xs';
        } else {
          el.className = 'flex items-center gap-1.5 text-slate-400 dark:text-slate-500 transition-colors';
          if (icon) icon.className = 'fa-solid fa-circle-xmark text-slate-300 dark:text-slate-600 text-xs';
        }
      }

      updateItem('rule-length', hasLength);
      updateItem('rule-upper', hasUpper);
      updateItem('rule-lower', hasLower);
      updateItem('rule-number', hasNumber);
      updateItem('rule-special', hasSpecial);

      let score = 0;
      if (hasLength) score++;
      if (hasUpper) score++;
      if (hasLower) score++;
      if (hasNumber) score++;
      if (hasSpecial) score++;

      const label = document.getElementById('pwd-strength-label');
      const bar1 = document.getElementById('pwd-bar-1');
      const bar2 = document.getElementById('pwd-bar-2');
      const bar3 = document.getElementById('pwd-bar-3');
      const bar4 = document.getElementById('pwd-bar-4');

      const defaultBarClass = 'h-full flex-1 rounded-full bg-slate-300 dark:bg-slate-600 transition-all duration-300';
      if (bar1) bar1.className = defaultBarClass;
      if (bar2) bar2.className = defaultBarClass;
      if (bar3) bar3.className = defaultBarClass;
      if (bar4) bar4.className = defaultBarClass;

      if (!pwd) {
        if (label) {
          label.textContent = 'Chưa nhập';
          label.className = 'text-xs font-black text-slate-400';
        }
      } else if (score <= 2) {
        if (label) {
          label.textContent = 'Yếu ⚠️';
          label.className = 'text-xs font-black text-rose-500';
        }
        if (bar1) bar1.className = 'h-full flex-1 rounded-full bg-rose-500 transition-all duration-300';
      } else if (score === 3) {
        if (label) {
          label.textContent = 'Trung bình ⚡';
          label.className = 'text-xs font-black text-amber-500';
        }
        if (bar1) bar1.className = 'h-full flex-1 rounded-full bg-amber-500 transition-all duration-300';
        if (bar2) bar2.className = 'h-full flex-1 rounded-full bg-amber-500 transition-all duration-300';
      } else if (score === 4) {
        if (label) {
          label.textContent = 'Khá 👍';
          label.className = 'text-xs font-black text-blue-500';
        }
        if (bar1) bar1.className = 'h-full flex-1 rounded-full bg-blue-500 transition-all duration-300';
        if (bar2) bar2.className = 'h-full flex-1 rounded-full bg-blue-500 transition-all duration-300';
        if (bar3) bar3.className = 'h-full flex-1 rounded-full bg-blue-500 transition-all duration-300';
      } else if (score === 5) {
        if (label) {
          label.textContent = 'Rất mạnh & An toàn ✓';
          label.className = 'text-xs font-black text-emerald-600 dark:text-emerald-400';
        }
        if (bar1) bar1.className = 'h-full flex-1 rounded-full bg-emerald-500 transition-all duration-300';
        if (bar2) bar2.className = 'h-full flex-1 rounded-full bg-emerald-500 transition-all duration-300';
        if (bar3) bar3.className = 'h-full flex-1 rounded-full bg-emerald-500 transition-all duration-300';
        if (bar4) bar4.className = 'h-full flex-1 rounded-full bg-emerald-500 transition-all duration-300';
      }

      // Kiểm tra sự trùng khớp
      const matchIndicator = document.getElementById('pwd-match-indicator');
      if (matchIndicator) {
        if (!confirmPwd) {
          matchIndicator.classList.add('hidden');
        } else if (pwd === confirmPwd) {
          matchIndicator.classList.remove('hidden');
          matchIndicator.className = 'text-[11px] font-bold pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400';
          matchIndicator.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Mật khẩu xác nhận hoàn toàn trùng khớp</span>';
        } else {
          matchIndicator.classList.remove('hidden');
          matchIndicator.className = 'text-[11px] font-bold pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 text-rose-500';
          matchIndicator.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <span>Mật khẩu xác nhận chưa trùng khớp</span>';
        }
      }

      return {
        hasLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
        isStrong: score === 5,
        isMatch: Boolean(pwd && confirmPwd && pwd === confirmPwd)
      };
    }
    window.checkRegisterPasswordStrength = checkRegisterPasswordStrength;

    function closeLoginModal() {
      document.getElementById('login-modal').classList.add('hidden');
      resetRegisterForm();
      hideAuthAlert();
    }

    function switchAuthTab(tab) {
      const loginTabBtn = document.getElementById('tab-btn-login');
      const regTabBtn = document.getElementById('tab-btn-register');
      const tabsContainer = document.getElementById('auth-tabs-container');
      const loginView = document.getElementById('auth-view-login');
      const regView = document.getElementById('auth-view-register');
      const forgotView = document.getElementById('auth-view-forgot');
      const modalTitle = document.getElementById('auth-modal-title');
      const modalSubtitle = document.getElementById('auth-modal-subtitle');

      hideAuthAlert();

      if (tab === 'login') {
        tabsContainer.classList.remove('hidden');
        loginTabBtn.className = 'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm bg-white dark:bg-slate-900 text-brand-600 dark:text-indigo-400 flex items-center justify-center gap-2';
        regTabBtn.className = 'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-2';
        loginView.classList.remove('hidden');
        regView.classList.add('hidden');
        if (forgotView) forgotView.classList.add('hidden');
        modalTitle.textContent = 'Chào Mừng Trở Lại';
        modalSubtitle.textContent = 'Nền tảng Học trực tuyến & Đánh giá năng lực NoSQL Đa mô hình';
      } else if (tab === 'register') {
        tabsContainer.classList.remove('hidden');
        regTabBtn.className = 'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm bg-white dark:bg-slate-900 text-brand-600 dark:text-indigo-400 flex items-center justify-center gap-2';
        loginTabBtn.className = 'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-2';
        regView.classList.remove('hidden');
        loginView.classList.add('hidden');
        if (forgotView) forgotView.classList.add('hidden');
        modalTitle.textContent = 'Đăng Ký Tài Khoản';
        modalSubtitle.textContent = 'Tạo hồ sơ học tập và xác thực kích hoạt qua Gmail OTP';
        resetRegisterForm();
      } else if (tab === 'forgot') {
        tabsContainer.classList.add('hidden');
        loginView.classList.add('hidden');
        regView.classList.add('hidden');
        if (forgotView) forgotView.classList.remove('hidden');
        modalTitle.textContent = 'Khôi Phục Mật Khẩu';
        modalSubtitle.textContent = 'Nhận mã OTP bảo mật qua Gmail để thiết lập lại mật khẩu mới';
      }
    }

    function togglePasswordVisibility(inputId, btn) {
      const input = document.getElementById(inputId);
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    }

    function showAuthAlert(message, type = 'error') {
      const box = document.getElementById('auth-alert-box');
      box.classList.remove('hidden', 'bg-rose-50', 'text-rose-700', 'border-rose-200', 'dark:bg-rose-950/40', 'dark:text-rose-300', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200', 'dark:bg-emerald-950/40', 'dark:text-emerald-300');
      
      if (type === 'error') {
        box.classList.add('bg-rose-50', 'text-rose-700', 'border', 'border-rose-200', 'dark:bg-rose-950/40', 'dark:text-rose-300');
        box.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${message}</span>`;
      } else {
        box.classList.add('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200', 'dark:bg-emerald-950/40', 'dark:text-emerald-300');
        box.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
      }
    }

    function hideAuthAlert() {
      const box = document.getElementById('auth-alert-box');
      if (box) box.classList.add('hidden');
    }

    // Gửi OTP xác thực Đăng ký qua Gmail
    async function requestRegisterOtp() {
      const username = document.getElementById('reg-username').value.trim();
      const fullName = document.getElementById('reg-fullname').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const btn = document.getElementById('btn-send-reg-otp');
      const txt = document.getElementById('txt-reg-otp');

      if (!fullName) {
        showAuthAlert('Vui lòng nhập Họ và Tên trước');
        document.getElementById('reg-fullname')?.focus();
        return;
      }
      if (!username) {
        showAuthAlert('Vui lòng nhập Tên đăng nhập trước');
        document.getElementById('reg-username')?.focus();
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthAlert('Vui lòng nhập địa chỉ Email hợp lệ trước khi gửi mã OTP');
        document.getElementById('reg-email')?.focus();
        return;
      }

      btn.disabled = true;
      txt.textContent = 'Đang gửi...';

      try {
        const res = await fetch(`${API_BASE}/auth/register/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, fullName, email })
        });
        const json = await res.json();
        if (json.success) {
          showAuthAlert(json.message, 'success');

          // HIỂN THỊ Ô NHẬP OTP (MẶC ĐỊNH BAN ĐẦU ẨN)
          const boxOtp = document.getElementById('box-reg-otp');
          if (boxOtp) {
            boxOtp.classList.remove('hidden');
          }
          const otpInput = document.getElementById('reg-otp');
          if (otpInput) {
            otpInput.value = '';
            otpInput.focus();
          }

          // Đếm ngược 60s trước khi cho phép gửi lại
          let countdown = 60;
          txt.textContent = `${countdown}s`;
          const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
              clearInterval(timer);
              btn.disabled = false;
              txt.textContent = 'Gửi lại mã';
            } else {
              txt.textContent = `${countdown}s`;
            }
          }, 1000);
        } else {
          showAuthAlert(json.message || 'Không thể gửi OTP');
          btn.disabled = false;
          txt.textContent = 'Gửi mã OTP';
        }
      } catch (err) {
        showAuthAlert('Lỗi kết nối máy chủ khi gửi OTP: ' + err.message);
        btn.disabled = false;
        txt.textContent = 'Gửi mã OTP';
      }
    }

    // Gửi OTP khôi phục Mật khẩu qua Gmail
    async function requestForgotOtp() {
      const email = document.getElementById('forgot-email').value.trim();
      const btn = document.getElementById('btn-send-forgot-otp');
      const txt = document.getElementById('txt-forgot-otp');

      if (!email) {
        showAuthAlert('Vui lòng nhập địa chỉ Email tài khoản của bạn');
        return;
      }

      btn.disabled = true;
      txt.textContent = 'Đang gửi...';

      try {
        const res = await fetch(`${API_BASE}/auth/forgot-password/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const json = await res.json();
        if (json.success) {
          showAuthAlert(json.message, 'success');
          let countdown = 60;
          txt.textContent = `${countdown}s`;
          const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
              clearInterval(timer);
              btn.disabled = false;
              txt.textContent = 'Gửi lại mã';
            } else {
              txt.textContent = `${countdown}s`;
            }
          }, 1000);
          document.getElementById('forgot-otp').focus();
        } else {
          showAuthAlert(json.message || 'Không thể gửi OTP');
          btn.disabled = false;
          txt.textContent = 'Gửi mã OTP';
        }
      } catch (err) {
        showAuthAlert('Lỗi kết nối máy chủ: ' + err.message);
        btn.disabled = false;
        txt.textContent = 'Gửi mã OTP';
      }
    }

    // Xử lý nộp form Khôi phục mật khẩu
    async function handleFormForgotPassword(e) {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      const otp = document.getElementById('forgot-otp').value.trim();
      const newPassword = document.getElementById('forgot-new-password').value;
      const submitBtn = document.getElementById('btn-submit-forgot');

      if (!email || !otp || !newPassword) {
        showAuthAlert('Vui lòng nhập đầy đủ Email, OTP và Mật khẩu mới');
        return;
      }

      if (newPassword.length < 6) {
        showAuthAlert('Mật khẩu mới phải có tối thiểu 6 ký tự');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang cập nhật...</span>';

      try {
        const res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword })
        });
        const json = await res.json();

        if (json.success) {
          showAuthAlert(json.message, 'success');
          setTimeout(() => {
            switchAuthTab('login');
            document.getElementById('login-input-username').value = email;
            document.getElementById('login-input-password').value = '';
          }, 1500);
        } else {
          showAuthAlert(json.message || 'Đặt lại mật khẩu thất bại!');
        }
      } catch (err) {
        showAuthAlert('Lỗi kết nối máy chủ: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Xác Nhận Đổi Mật Khẩu</span> <i class="fa-solid fa-check text-xs"></i>';
      }
    }

    async function handleFormLogin(e) {
      e.preventDefault();
      const username = document.getElementById('login-input-username').value.trim();
      const password = document.getElementById('login-input-password').value;
      const submitBtn = document.getElementById('btn-submit-login');

      if (!username) {
        showAuthAlert('Vui lòng nhập tên đăng nhập hoặc email');
        document.getElementById('login-input-username')?.focus();
        return;
      }

      if (!password || !password.trim()) {
        showAuthAlert('Vui lòng nhập mật khẩu đăng nhập');
        document.getElementById('login-input-password')?.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang xác thực...</span>';

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const json = await res.json();
        if (json.success) {
          showAuthAlert('Đăng nhập thành công! Đang tải dữ liệu...', 'success');
          currentToken = json.data.token;
          currentUser = json.data.user;
          window.currentToken = currentToken;
          window.currentUser = currentUser;
          localStorage.setItem('edupro_token', currentToken);
          localStorage.setItem('edupro_user', JSON.stringify(currentUser));

          setTimeout(() => {
            syncUserUI();
            closeLoginModal();
            loadUserHistory();
            loadTelemetryLogs();
          }, 600);
        } else {
          showAuthAlert(json.message || 'Đăng nhập thất bại!');
        }
      } catch (err) {
        showAuthAlert('Lỗi kết nối máy chủ: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Đăng Nhập Hệ Thống</span> <i class="fa-solid fa-arrow-right text-xs"></i>';
      }
    }

    async function handleFormRegister(e) {
      e.preventDefault();
      const fullName = document.getElementById('reg-fullname').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const otp = document.getElementById('reg-otp').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const role = 'STUDENT';
      const submitBtn = document.getElementById('btn-submit-register');

      if (!fullName || !username || !email) {
        showAuthAlert('Vui lòng điền đầy đủ Họ và tên, Tên đăng nhập và Email');
        return;
      }

      // Kiểm tra trạng thái gửi và nhập mã OTP
      const boxOtp = document.getElementById('box-reg-otp');
      if (boxOtp && boxOtp.classList.contains('hidden')) {
        showAuthAlert('Vui lòng bấm nút "Gửi mã OTP" để nhận mã xác thực qua Gmail trước!');
        return;
      }

      if (!otp || otp.length !== 6) {
        showAuthAlert('Vui lòng nhập chính xác mã xác thực OTP (6 chữ số) đã gửi vào Gmail!');
        document.getElementById('reg-otp')?.focus();
        return;
      }

      // RÀNG BUỘC MẬT KHẨU MẠNH: TỐI THIỂU 8 KÝ TỰ, CÓ HOA, THƯỜNG, SỐ VÀ KÝ TỰ ĐẶC BIỆT
      const strength = checkRegisterPasswordStrength();
      if (!strength.isStrong) {
        showAuthAlert('Mật khẩu chưa đạt tiêu chuẩn bảo mật! Cần tối thiểu 8 ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt.');
        document.getElementById('reg-password')?.focus();
        return;
      }

      if (password !== confirmPassword) {
        showAuthAlert('Mật khẩu xác nhận không trùng khớp! Vui lòng nhập lại.');
        document.getElementById('reg-confirm-password')?.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang xác thực OTP & tạo tài khoản...</span>';

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, username, email, password, role, otp })
        });
        const json = await res.json();

        if (json.success) {
          showAuthAlert('Xác thực OTP thành công! Đang tự động đăng nhập...', 'success');
          currentToken = json.data.token;
          currentUser = json.data.user;
          window.currentToken = currentToken;
          window.currentUser = currentUser;
          localStorage.setItem('edupro_token', currentToken);
          localStorage.setItem('edupro_user', JSON.stringify(currentUser));

          setTimeout(() => {
            syncUserUI();
            closeLoginModal();
            loadUserHistory();
            loadTelemetryLogs();
          }, 800);
        } else {
          showAuthAlert(json.message || 'Đăng ký không thành công!');
        }
      } catch (err) {
        showAuthAlert('Lỗi kết nối máy chủ: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Xác Thực OTP & Đăng Ký Tài Khoản</span> <i class="fa-solid fa-check text-xs"></i>';
      }
    }

    async function execLogin(username, password = '123456') {
      const uInput = document.getElementById('login-input-username');
      const pInput = document.getElementById('login-input-password');
      if (uInput) uInput.value = username;
      if (pInput) pInput.value = password;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const json = await res.json();
        if (json.success) {
          currentToken = json.data.token;
          currentUser = json.data.user;
          window.currentToken = currentToken;
          window.currentUser = currentUser;
          localStorage.setItem('edupro_token', currentToken);
          localStorage.setItem('edupro_user', JSON.stringify(currentUser));

          syncUserUI();
          closeLoginModal();
          loadUserHistory();
          loadTelemetryLogs();
        } else {
          alert('Đăng nhập thất bại: ' + json.message);
        }
      } catch (err) {
        alert('Lỗi máy chủ: ' + err.message);
      }
    }

    function syncUserUI() {
      if (!currentToken || currentToken === 'null') {
        currentToken = localStorage.getItem('edupro_token') || null;
      }
      if (!currentUser) {
        try { currentUser = JSON.parse(localStorage.getItem('edupro_user') || 'null'); } catch(e) {}
      }
      window.currentToken = currentToken;
      window.currentUser = currentUser;

      const mobileAnalyticsBtn = document.getElementById('mobile-nav-btn-analytics');
      if (currentUser && currentToken) {
        document.getElementById('auth-unlogged').classList.add('hidden');
        document.getElementById('auth-logged').classList.remove('hidden');

        const roleMap = {
          ADMIN: 'Quản trị viên (Admin)',
          STUDENT: 'Người dùng (Học viên)'
        };
        document.getElementById('nav-user-name').textContent = currentUser.fullName;
        document.getElementById('nav-user-role').textContent = roleMap[currentUser.role] || 'Học viên';
        document.getElementById('nav-user-avatar').src = currentUser.avatar || (currentUser.role === 'ADMIN' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80');

        if (currentUser.role === 'ADMIN') {
          document.getElementById('nav-btn-analytics').classList.remove('hidden');
          if (mobileAnalyticsBtn) mobileAnalyticsBtn.classList.remove('hidden');
        } else {
          document.getElementById('nav-btn-analytics').classList.add('hidden');
          if (mobileAnalyticsBtn) mobileAnalyticsBtn.classList.add('hidden');
        }

        // BẢNG ĐIỀU KHIỂN CẤU HÌNH & GIÁM SÁT 4 CSDL TELEMETRY CHỈ DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)
        const telemBtn = document.getElementById('nav-btn-telemetry');
        const mobileTelemBtn = document.getElementById('mobile-nav-btn-telemetry');
        if (currentUser.role === 'ADMIN') {
          if (telemBtn) telemBtn.classList.remove('hidden');
          if (mobileTelemBtn) mobileTelemBtn.classList.remove('hidden');
        } else {
          if (telemBtn) telemBtn.classList.add('hidden');
          if (mobileTelemBtn) mobileTelemBtn.classList.add('hidden');
        }

        fetchEnrolledCourses().then(() => {
          if (rawCoursesData && rawCoursesData.length) {
            renderCoursesGrid(rawCoursesData);
          }
        });
      } else {
        document.getElementById('auth-unlogged').classList.remove('hidden');
        document.getElementById('auth-logged').classList.add('hidden');
        document.getElementById('nav-btn-analytics').classList.add('hidden');
        if (mobileAnalyticsBtn) mobileAnalyticsBtn.classList.add('hidden');
        const telemBtn = document.getElementById('nav-btn-telemetry');
        const mobileTelemBtn = document.getElementById('mobile-nav-btn-telemetry');
        if (telemBtn) telemBtn.classList.add('hidden');
        if (mobileTelemBtn) mobileTelemBtn.classList.add('hidden');
        userEnrolledCourseIds.clear();
        if (rawCoursesData && rawCoursesData.length) {
          renderCoursesGrid(rawCoursesData);
        }
      }

      // ĐỒNG BỘ TRẠNG THÁI SẢNH CHỜ PHÒNG THI (EXAM LOBBY) THEO TRẠNG THÁI ĐĂNG NHẬP
      if (typeof showExamLobby === 'function' && !window.isExamActive) {
        showExamLobby();
      }
    }

    function logout() {
      currentToken = null;
      currentUser = null;
      userEnrolledCourseIds.clear();
      window.userEnrolledCourseIds = userEnrolledCourseIds;
      localStorage.removeItem('edupro_token');
      localStorage.removeItem('edupro_user');
      clearInterval(examCountdown);
      if (typeof closeSystemTelemetryModal === 'function') closeSystemTelemetryModal();
      syncUserUI();
      showSection('courses');
      if (typeof loadCollaborativeRecommendations === 'function') loadCollaborativeRecommendations();
    }

    async function fetchEnrolledCourses() {
      if (!currentToken) {
        userEnrolledCourseIds.clear();
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/courses/my/enrolled`, {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          userEnrolledCourseIds = new Set(json.data.map(id => String(id)));
          window.userEnrolledCourseIds = userEnrolledCourseIds;
          if (typeof loadCollaborativeRecommendations === 'function') {
            loadCollaborativeRecommendations();
          }
        }
      } catch (e) {
        console.warn('Lỗi tải danh sách khóa học đã đăng ký:', e);
      }
    }
    window.fetchEnrolledCourses = fetchEnrolledCourses;

    // 5. TẢI VÀ RENDER DANH MỤC KHÓA HỌC
    async function loadCoursesCatalog() {
      try {
        if (currentToken) {
          await fetchEnrolledCourses();
        }
        const res = await fetch(`${API_BASE}/courses`);
        const json = await res.json();
        if (json.success && json.data) {
          rawCoursesData = json.data;
          renderCoursesGrid(rawCoursesData);
        }
      } catch (err) {
        console.error('Lỗi tải danh mục khóa học:', err);
      }
    }

    function renderCoursesGrid(courses) {
      const grid = document.getElementById('courses-grid');
      if (!courses || courses.length === 0) {
        grid.innerHTML = '<div class="col-span-3 text-center py-12 text-slate-400">Không tìm thấy khóa học phù hợp với từ khóa.</div>';
        return;
      }

      let html = '';
      courses.forEach(c => {
        const priceStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.price || 1890000);
        const origPriceStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.originalPrice || 2490000);
        const isEnrolled = typeof isCourseEnrolled === 'function' ? isCourseEnrolled(c._id) : false;

        html += `
          <div class="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group">
            <div class="relative overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
              <img src="${c.thumbnail}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur text-slate-800 dark:text-slate-200 shadow-sm">
                ${c.category || 'Công nghệ'}
              </span>
              <span class="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/80 text-white backdrop-blur">
                <i class="fa-solid fa-clock mr-1 text-slate-300"></i> ${c.durationHours || 24}h
              </span>
            </div>
            <div class="p-6 flex flex-col flex-grow">
              <div class="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-2">
                <i class="fa-solid fa-star"></i>
                <span>${c.rating || 4.9}</span>
                <span class="text-slate-400 font-normal">(${c.reviewsCount || 1200} đánh giá)</span>
              </div>
              <h3 class="font-extrabold text-slate-900 dark:text-white text-lg leading-snug mb-2 group-hover:text-brand-600 dark:group-hover:text-indigo-400 transition-colors">
                ${c.title}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                ${c.tagline || c.description}
              </p>
              
              <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div class="text-lg font-black text-slate-900 dark:text-white">${priceStr}</div>
                  <div class="text-xs text-slate-400 line-through">${origPriceStr}</div>
                </div>
                <div class="flex items-center gap-2">
                  ${isEnrolled ? `
                    <button onclick="enterClassroom('${c._id}')" class="px-4 py-2 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer">
                      <i class="fa-solid fa-circle-play text-[11px]"></i>
                      <span>Vào học</span>
                    </button>
                  ` : `
                    <button onclick="enrollCurrentCourse('${c._id}')" class="px-5 py-2 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex items-center gap-1.5 cursor-pointer">
                      <i class="fa-solid fa-cart-plus text-[11px]"></i>
                      <span>Đăng ký</span>
                    </button>
                  `}
                </div>
              </div>
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;
    }

    let currentCourseId = null;
    let currentLessonId = null;
    var currentClassroomCourseId = null;

    function showToast(message, type = 'info') {
      const iconMap = {
        success: '✅',
        error: '⚠️',
        warning: '🔔',
        info: 'ℹ️'
      };
      if (typeof showLiveToast === 'function') {
        showLiveToast('Thông Báo Hệ Thống', message, iconMap[type] || '📢');
      } else {
        alert(message);
      }
    }

    function showCustomAlert(message, type = 'info') {
      showToast(message, type);
    }

    // 6. LỚP HỌC TRỰC TUYẾN

    function openCertificateModal(certData = null) {
      const studentName = currentUser ? currentUser.fullName : 'Nguyễn Trọng Nguyên';
      const score = certData ? certData.score : (lastExamResult ? lastExamResult.score : 10.0);
      const courseTitle = document.getElementById('classroom-course-header-title')?.textContent;
      const defaultTitle = (typeof currentSection !== 'undefined' && currentSection === 'classroom' && courseTitle) ? courseTitle : (lastExamResult ? lastExamResult.title : 'Đánh Giá Năng Lực Tiếng Anh Quốc Tế (English Placement & IELTS/TOEIC Test)');
      const title = certData ? certData.title : defaultTitle;

      document.getElementById('cert-student-name').textContent = studentName;
      document.getElementById('cert-exam-title').textContent = title;
      document.getElementById('cert-score').textContent = `${score} / 10`;
      document.getElementById('cert-date').textContent = new Date().toLocaleDateString('vi-VN');
      document.getElementById('cert-id').textContent = 'EDUPRO-' + Math.floor(100000 + Math.random() * 900000);

      document.getElementById('certificate-modal').classList.remove('hidden');
    }

    function closeCertificateModal() {
      document.getElementById('certificate-modal').classList.add('hidden');
    }

    async function downloadCertificateAsPDF() {
      const element = document.getElementById('certificate-content');
      const btn = document.getElementById('btn-download-cert-pdf');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xuất PDF...';

      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('landscape', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const yOffset = (pdfHeight - imgHeight) / 2;

        pdf.addImage(imgData, 'PNG', 20, Math.max(10, yOffset), imgWidth, imgHeight);
        pdf.save(`Chung_Chi_EduPro_${(currentUser ? currentUser.username : 'HocVien')}.pdf`);
      } catch (err) {
        alert('Lỗi xuất file PDF: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> <span>Tải file PDF</span>';
      }
    }

    async function downloadCertificateAsImage() {
      const element = document.getElementById('certificate-content');
      const btn = document.getElementById('btn-download-cert-img');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo ảnh...';

      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.download = `Chung_Chi_EduPro_${(currentUser ? currentUser.username : 'HocVien')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        alert('Lỗi xuất ảnh: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-image"></i> <span>Tải ảnh PNG</span>';
      }
    }

    // 9. TRỢ LÝ GIA SƯ ẢO AI COPILOT (DELEGATE TO 4-NOSQL COPILOT)
    function toggleAiChat() {
      if (typeof toggleCopilotWidget === 'function') {
        toggleCopilotWidget();
      }
    }

    function sendQuickPrompt(promptText) {
      if (typeof toggleCopilotWidget === 'function') {
        const card = document.getElementById('copilot-chat-card');
        if (card && card.classList.contains('hidden')) {
          toggleCopilotWidget();
        }
      }
      if (typeof sendCopilotMessage === 'function') {
        sendCopilotMessage(promptText);
      }
    }

    function sendChatMessage() {
      const input = document.getElementById('ai-chat-input');
      const text = input.value.trim();
      if (!text) return;

      appendChatMessage(text, 'user');
      input.value = '';

      // Hiệu ứng đang gõ
      setTimeout(() => {
        const reply = generateAiReply(text);
        appendChatMessage(reply, 'bot');
      }, 600);
    }

    function appendChatMessage(msg, sender) {
      const box = document.getElementById('ai-chat-messages');
      const isUser = sender === 'user';

      const bubble = document.createElement('div');
      bubble.className = `flex gap-2.5 items-start ${isUser ? 'flex-row-reverse' : ''}`;
      bubble.innerHTML = `
        <div class="w-7 h-7 rounded-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-indigo-400'} flex items-center justify-center shrink-0 text-xs">
          <i class="fa-solid ${isUser ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="p-3 rounded-2xl ${isUser ? 'rounded-tr-sm bg-brand-600 text-white' : 'rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'} leading-relaxed max-w-[85%] text-xs shadow-sm">
          ${msg}
        </div>
      `;
      box.appendChild(bubble);
      box.scrollTop = box.scrollHeight;
    }

    function generateAiReply(prompt) {
      const lower = prompt.toLowerCase();
      if (lower.includes('lộ trình') || lower.includes('ielts') || lower.includes('toeic') || lower.includes('cefr') || lower.includes('bản đồ')) {
        return 'Lộ trình chinh phục <strong>IELTS 7.5+ & TOEIC 850+ (Chuẩn CEFR A1 ➔ C2)</strong> tại EduPro gồm 4 giai đoạn:<br>1. <strong>Foundation (A1-A2)</strong>: Chuẩn hóa bảng phiên âm IPA 44 âm & 3000 từ vựng Oxford.<br>2. <strong>Intermediate (B1-B2)</strong>: Làm chủ 12 thì Tiếng Anh, Câu điều kiện, Mệnh đề quan hệ & Academic Collocations.<br>3. <strong>Receptive Mastery</strong>: Chiến thuật đọc nhanh Skimming/Scanning & Nghe bắt Keyword.<br>4. <strong>Productive Mastery (C1-C2)</strong>: Viết luận IELTS Task 1-2 chuẩn PEEL & Phản xạ Speaking AREC. Xem trực quan tại mục <em>Bản đồ Tri thức</em> nhé!';
      } else if (lower.includes('12 thì') || lower.includes('ngữ pháp') || lower.includes('đảo ngữ') || lower.includes('điều kiện') || lower.includes('grammar')) {
        return '<strong>Mẹo nhớ nhanh Ngữ pháp & Đảo ngữ Câu điều kiện:</strong><br>• <strong>Loại 1 (Có thật ở HT/TL)</strong>: <em>Should + S + V_inf, S + will + V_inf</em><br>• <strong>Loại 2 (Trái với HT)</strong>: <em>Were + S + (to V), S + would + V_inf</em><br>• <strong>Loại 3 (Trái với QK)</strong>: <em>Had + S + V3/ed, S + would have + V3/ed</em> (Xuất hiện trong câu số 2 của bài thi Placement Test!).';
      } else if (lower.includes('chứng chỉ') || lower.includes('nhận chứng chỉ') || lower.includes('certificate')) {
        return 'Để nhận <strong>Chứng nhận Năng lực Tiếng Anh Quốc tế (Certificate of English Proficiency)</strong>, bạn chỉ cần hoàn thành bài <em>Khảo sát Năng lực (Placement Test)</em> và đạt từ <strong>5.0 điểm</strong> trở lên. Hệ thống sẽ cấp ngay chứng chỉ có thể in, tải ảnh PNG hoặc xuất PDF!';
      } else if (lower.includes('khóa học') || lower.includes('học phí') || lower.includes('đăng ký')) {
        return 'EduPro English hiện có <strong>12 khóa học Tiếng Anh chuyên sâu</strong> chia thành 4 nhóm: <em>IELTS Academic</em>, <em>TOEIC Quốc Tế</em>, <em>Ngữ Pháp & Từ Vựng</em> và <em>Giao Tiếp & Doanh Nghiệp</em>. Bạn có thể bấm nút <strong>"Vào học"</strong> ở bất kỳ khóa nào trên trang chủ!';
      } else if (lower.includes('mongodb') || lower.includes('bson')) {
        return '<strong>MongoDB</strong> là hệ CSDL Document Store lưu trữ toàn bộ 12 khóa học Tiếng Anh, 19 bài giảng, ngân hàng câu hỏi trắc nghiệm IELTS/TOEIC và kết quả thi của học viên dưới định dạng BSON linh hoạt.';
      } else if (lower.includes('redis') || lower.includes('zset') || lower.includes('cache')) {
        return '<strong>Redis</strong> là In-Memory Data Store tốc độ siêu cao (&lt;1ms) đảm nhiệm: Cache danh mục khóa học Tiếng Anh, đếm ngược phiên thi 30 phút (TTL), tự động lưu từng câu trả lời và xếp hạng học viên qua <em>Sorted Set (ZSET)</em>.';
      } else if (lower.includes('cassandra') || lower.includes('partition')) {
        return '<strong>Apache Cassandra</strong> là CSDL Wide-Column phân tán Masterless dùng để ghi nhận luồng sự kiện học tập (Time-series Video Telemetry: PLAY_LESSON, VIDEO_PROGRESS, LESSON_COMPLETE) của học viên.';
      } else if (lower.includes('neo4j') || lower.includes('cypher')) {
        return '<strong>Neo4j</strong> là CSDL đồ thị (Graph Database) sử dụng ngôn ngữ Cypher để mô hình hóa lộ trình học Tiếng Anh từ CEFR A1 ➔ C2 (Bài học tiên quyết ➔ Chủ điểm ngữ pháp/từ vựng ➔ Kỹ năng Nghe/Nói/Đọc/Viết).';
      } else if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
        return 'Hello! Mình là <strong>EduPro English AI Tutor</strong>. Bạn muốn hỏi về mẹo làm bài IELTS/TOEIC, công thức ngữ pháp 12 thì hay kiến trúc 4 hệ quản trị NoSQL của nền tảng?';
      } else {
        return `Câu hỏi rất thú vị về <em>"${prompt}"</em>! Tại <strong>EduPro English</strong>, bạn có thể luyện thi IELTS/TOEIC, tra cứu lộ trình CEFR A1 ➔ C2 trên đồ thị Neo4j, làm bài thi thử lưu trạng thái tức thì trên Redis và nhận chứng chỉ quốc tế. Hãy thử khám phá ngay trên thanh menu nhé!`;
      }
    }

    // 10. ĐỒ THỊ BẢN ĐỒ TRI THỨC

    // ==============================================================
    // TIỆN ÍCH PHÂN TRANG CHUẨN GIAO DIỆN CHUYÊN NGHIỆP (REUSABLE PAGINATION)
    // ==============================================================
    function buildPaginationControls(containerId, currentPage, totalPages, totalItems, pageSize, onPageChangeFnName) {
      const container = document.getElementById(containerId);
      if (!container) return;
      if (totalItems === 0 || totalPages <= 1) {
        if (totalItems > 0) {
          container.innerHTML = `
            <div class="w-full flex items-center justify-between text-xs text-slate-500 py-1">
              <span>Hiển thị tất cả <strong>${totalItems}</strong> bản ghi</span>
              <span class="font-medium text-slate-400">Trang 1 / 1</span>
            </div>
          `;
        } else {
          container.innerHTML = '';
        }
        return;
      }

      const startItem = (currentPage - 1) * pageSize + 1;
      const endItem = Math.min(currentPage * pageSize, totalItems);

      let pagesHtml = '';
      for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        pagesHtml += `
          <button onclick="${onPageChangeFnName}(${i})" class="w-8 h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${isActive ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
            ${i}
          </button>
        `;
      }

      container.innerHTML = `
        <div class="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div class="flex items-center gap-1.5">
            <span>Hiển thị <strong>${startItem} - ${endItem}</strong> trên tổng số <strong>${totalItems}</strong> bản ghi</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="${onPageChangeFnName}(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${currentPage <= 1 ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed opacity-50' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
              <i class="fa-solid fa-chevron-left text-[10px]"></i> Trước
            </button>
            <div class="flex items-center gap-1">
              ${pagesHtml}
            </div>
            <button onclick="${onPageChangeFnName}(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${currentPage >= totalPages ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed opacity-50' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
              Sau <i class="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        </div>
      `;
    }
    window.buildPaginationControls = buildPaginationControls;

    // --- PHÂN TRANG LỊCH SỬ KẾT QUẢ BÀI THI HỌC VIÊN ---
    let rawUserHistoryList = [];
    let userHistoryCurrentPage = 1;
    const USER_HISTORY_PAGE_SIZE = 5;

    function renderUserHistoryTablePage(page = 1) {
      userHistoryCurrentPage = page;
      const tbody = document.getElementById('history-table-body');
      if (!tbody) return;
      if (!rawUserHistoryList || rawUserHistoryList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400">Bạn chưa thực hiện bài khảo sát nào.</td></tr>';
        buildPaginationControls('history-pagination', 1, 0, 0, USER_HISTORY_PAGE_SIZE, 'changeUserHistoryPage');
        return;
      }

      const total = rawUserHistoryList.length;
      const totalPages = Math.ceil(total / USER_HISTORY_PAGE_SIZE);
      if (userHistoryCurrentPage > totalPages) userHistoryCurrentPage = totalPages;
      if (userHistoryCurrentPage < 1) userHistoryCurrentPage = 1;

      const start = (userHistoryCurrentPage - 1) * USER_HISTORY_PAGE_SIZE;
      const pageItems = rawUserHistoryList.slice(start, start + USER_HISTORY_PAGE_SIZE);

      let html = '';
      pageItems.forEach((r, idx) => {
        const timeStr = new Date(r.submittedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const isPass = r.score >= 5.0;
        html += `
          <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="py-4 px-4 font-mono text-xs text-slate-500">${timeStr}</td>
            <td class="py-4 px-4 font-bold text-slate-900 dark:text-white">${r.examTitle}</td>
            <td class="py-4 px-4 font-black text-brand-600 dark:text-indigo-400">${r.score} đ</td>
            <td class="py-4 px-4 text-slate-600 dark:text-slate-300">${r.correctCount} / ${r.totalCount}</td>
            <td class="py-4 px-4">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold ${isPass ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'}">
                ${isPass ? 'ĐẠT TIÊU CHUẨN' : 'CHƯA ĐẠT'}
              </span>
            </td>
            <td class="py-4 px-4 text-center">
              ${isPass ? `
                <button onclick='openCertificateModal(${JSON.stringify({ score: r.score, title: r.examTitle })})' class="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 mx-auto transition-all">
                  <i class="fa-solid fa-certificate"></i>
                  <span>Xem</span>
                </button>
              ` : '<span class="text-xs text-slate-400">-</span>'}
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;

      buildPaginationControls('history-pagination', userHistoryCurrentPage, totalPages, total, USER_HISTORY_PAGE_SIZE, 'changeUserHistoryPage');
    }

    function changeUserHistoryPage(page) {
      renderUserHistoryTablePage(page);
    }
    window.changeUserHistoryPage = changeUserHistoryPage;

    async function loadUserHistory() {
      if (!currentToken) return;
      try {
        const res = await fetch(`${API_BASE}/exams/results/my-history`, {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const json = await res.json();
        if (json.success) {
          rawUserHistoryList = json.data || [];
          renderUserHistoryTablePage(1);
        }
      } catch (err) {
        console.error('Lỗi tải lịch sử:', err);
      }
    }

    let chartGradeInstance = null;
    let chartTopicInstance = null;

    // --- BỘ LỌC NÂNG CAO, TÌM KIẾM, SẮP XẾP & PHÂN TRANG DANH SÁCH BÀI NỘP GẦN ĐÂY ---
    let rawAnalyticsSubmissionsList = [];
    let filteredAnalyticsSubmissionsList = [];
    let analyticsCurrentPage = 1;
    const ANALYTICS_PAGE_SIZE = 6;

    function applyAnalyticsFilters() {
      const searchKeyword = (document.getElementById('analytics-search-input')?.value || '').trim().toLowerCase();
      const statusFilter = document.getElementById('analytics-filter-status')?.value || 'ALL';
      const scoreFilter = document.getElementById('analytics-filter-score')?.value || 'ALL';
      const sortBy = document.getElementById('analytics-sort-by')?.value || 'time_desc';

      let list = [...rawAnalyticsSubmissionsList];

      // 1. Tìm kiếm theo từ khóa (Mã sinh viên / Tài khoản / Họ tên)
      if (searchKeyword) {
        list = list.filter(s => {
          const code = (s.studentCode || '').toLowerCase();
          const name = (s.studentName || '').toLowerCase();
          return code.includes(searchKeyword) || name.includes(searchKeyword);
        });
      }

      // 2. Lọc theo kết quả (ĐẠT / KHÔNG ĐẠT)
      if (statusFilter === 'PASS') {
        list = list.filter(s => Number(s.score) >= 5.0);
      } else if (statusFilter === 'FAIL') {
        list = list.filter(s => Number(s.score) < 5.0);
      }

      // 3. Lọc theo mức điểm
      if (scoreFilter === 'EXCELLENT') {
        list = list.filter(s => Number(s.score) >= 8.5);
      } else if (scoreFilter === 'GOOD') {
        list = list.filter(s => Number(s.score) >= 7.0 && Number(s.score) < 8.5);
      } else if (scoreFilter === 'AVERAGE') {
        list = list.filter(s => Number(s.score) >= 5.0 && Number(s.score) < 7.0);
      } else if (scoreFilter === 'WEAK') {
        list = list.filter(s => Number(s.score) < 5.0);
      }

      // 4. Sắp xếp theo các trường dữ liệu
      list.sort((a, b) => {
        if (sortBy === 'time_desc') {
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        } else if (sortBy === 'time_asc') {
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        } else if (sortBy === 'score_desc') {
          return Number(b.score) - Number(a.score);
        } else if (sortBy === 'score_asc') {
          return Number(a.score) - Number(b.score);
        } else if (sortBy === 'name_asc') {
          return (a.studentName || '').localeCompare(b.studentName || '', 'vi');
        } else if (sortBy === 'name_desc') {
          return (b.studentName || '').localeCompare(a.studentName || '', 'vi');
        }
        return 0;
      });

      filteredAnalyticsSubmissionsList = list;

      // Cập nhật huy hiệu đếm
      const countBadge = document.getElementById('analytics-filter-count-badge');
      if (countBadge) {
        if (list.length === rawAnalyticsSubmissionsList.length) {
          countBadge.innerText = `${list.length} bài nộp`;
        } else {
          countBadge.innerText = `${list.length} / ${rawAnalyticsSubmissionsList.length} bài nộp phù hợp`;
        }
      }

      // Render lại trang 1
      renderAnalyticsSubmissionsTablePage(1);
    }
    window.applyAnalyticsFilters = applyAnalyticsFilters;

    function resetAnalyticsFilters() {
      const sInput = document.getElementById('analytics-search-input');
      const sStatus = document.getElementById('analytics-filter-status');
      const sScore = document.getElementById('analytics-filter-score');
      const sSort = document.getElementById('analytics-sort-by');
      if (sInput) sInput.value = '';
      if (sStatus) sStatus.value = 'ALL';
      if (sScore) sScore.value = 'ALL';
      if (sSort) sSort.value = 'time_desc';
      applyAnalyticsFilters();
    }
    window.resetAnalyticsFilters = resetAnalyticsFilters;

    function toggleAnalyticsSort(column) {
      const sortSelect = document.getElementById('analytics-sort-by');
      if (!sortSelect) return;
      if (column === 'score') {
        sortSelect.value = sortSelect.value === 'score_desc' ? 'score_asc' : 'score_desc';
      } else if (column === 'name') {
        sortSelect.value = sortSelect.value === 'name_asc' ? 'name_desc' : 'name_asc';
      } else if (column === 'time') {
        sortSelect.value = sortSelect.value === 'time_desc' ? 'time_asc' : 'time_desc';
      } else if (column === 'account') {
        sortSelect.value = sortSelect.value === 'name_asc' ? 'name_desc' : 'name_asc';
      } else if (column === 'status') {
        const statusFilter = document.getElementById('analytics-filter-status');
        if (statusFilter) {
          statusFilter.value = statusFilter.value === 'PASS' ? 'FAIL' : (statusFilter.value === 'FAIL' ? 'ALL' : 'PASS');
        }
      }
      applyAnalyticsFilters();
    }
    window.toggleAnalyticsSort = toggleAnalyticsSort;

    function renderAnalyticsSubmissionsTablePage(page = 1) {
      analyticsCurrentPage = page;
      const tbody = document.getElementById('analytics-table-body');
      if (!tbody) return;
      if (!filteredAnalyticsSubmissionsList || filteredAnalyticsSubmissionsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400">Không tìm thấy bài nộp nào phù hợp với bộ lọc hiện tại.</td></tr>';
        buildPaginationControls('analytics-pagination', 1, 0, 0, ANALYTICS_PAGE_SIZE, 'changeAnalyticsPage');
        return;
      }

      const total = filteredAnalyticsSubmissionsList.length;
      const totalPages = Math.ceil(total / ANALYTICS_PAGE_SIZE);
      if (analyticsCurrentPage > totalPages) analyticsCurrentPage = totalPages;
      if (analyticsCurrentPage < 1) analyticsCurrentPage = 1;

      const start = (analyticsCurrentPage - 1) * ANALYTICS_PAGE_SIZE;
      const pageItems = filteredAnalyticsSubmissionsList.slice(start, start + ANALYTICS_PAGE_SIZE);

      let html = '';
      pageItems.forEach(sub => {
        const timeStr = new Date(sub.submittedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const isPass = Number(sub.score) >= 5.0;
        html += `
          <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="py-4 px-4 font-mono text-xs font-semibold text-slate-500">${sub.studentCode}</td>
            <td class="py-4 px-4 font-bold text-slate-900 dark:text-white">${sub.studentName}</td>
            <td class="py-4 px-4 text-xs text-slate-500">${timeStr}</td>
            <td class="py-4 px-4 font-black text-brand-600 dark:text-indigo-400">${sub.score} đ</td>
            <td class="py-4 px-4">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold ${isPass ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'}">
                ${isPass ? 'ĐẠT' : 'KHÔNG ĐẠT'}
              </span>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;

      buildPaginationControls('analytics-pagination', analyticsCurrentPage, totalPages, total, ANALYTICS_PAGE_SIZE, 'changeAnalyticsPage');
    }

    function changeAnalyticsPage(page) {
      renderAnalyticsSubmissionsTablePage(page);
    }
    window.changeAnalyticsPage = changeAnalyticsPage;

    // 12. BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN & BIỂU ĐỒ CHART.JS
    async function loadAnalyticsData() {
      if (!currentToken) return;
      try {
        const res = await fetch(`${API_BASE}/exams/${EXAM_ID}/analytics`, {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const json = await res.json();
        if (json.success) {
          const { stats, submissions } = json;
          document.getElementById('kpi-total-subs').textContent = stats.totalSubmissions;
          document.getElementById('kpi-avg-score').textContent = stats.avgScore.toFixed(1);
          document.getElementById('kpi-max-score').textContent = stats.maxScore.toFixed(1);
          document.getElementById('kpi-min-score').textContent = stats.minScore.toFixed(1);

          // Vẽ Biểu Đồ Phân Bổ Xếp Loại & Chủ đề NoSQL (Chart.js)
          renderAnalyticsCharts(submissions || []);

          rawAnalyticsSubmissionsList = submissions || [];
          applyAnalyticsFilters();
        }
      } catch (err) {
        console.error('Lỗi tải analytics:', err);
      }
    }

    function renderAnalyticsCharts(submissions) {
      if (typeof Chart === 'undefined') return;

      // 1. Phân loại phổ điểm
      let excellent = 0, good = 0, average = 0, fail = 0;
      submissions.forEach(s => {
        if (s.score >= 8.5) excellent++;
        else if (s.score >= 7.0) good++;
        else if (s.score >= 5.0) average++;
        else fail++;
      });
      if (submissions.length === 0) { excellent = 1; good = 2; average = 1; }

      const ctxGrade = document.getElementById('chart-grade-distribution');
      if (ctxGrade) {
        if (chartGradeInstance) chartGradeInstance.destroy();
        chartGradeInstance = new Chart(ctxGrade, {
          type: 'doughnut',
          data: {
            labels: ['Xuất sắc (≥8.5)', 'Khá (7.0 - 8.4)', 'Trung bình (5.0 - 6.9)', 'Chưa đạt (<5.0)'],
            datasets: [{
              data: [excellent, good, average, fail],
              backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#f43f5e'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, family: 'Be Vietnam Pro' } } }
            }
          }
        });
      }

      // 2. Tỷ lệ chính xác theo kỹ năng Tiếng Anh
      const ctxTopic = document.getElementById('chart-topic-accuracy');
      if (ctxTopic) {
        if (chartTopicInstance) chartTopicInstance.destroy();
        chartTopicInstance = new Chart(ctxTopic, {
          type: 'bar',
          data: {
            labels: ['Grammar & Tenses', 'Vocabulary & Idioms', 'Reading Strategy', 'Listening & IPA'],
            datasets: [{
              label: 'Độ chính xác trung bình (%)',
              data: [94, 88, 82, 86],
              backgroundColor: ['#4f46e5', '#ef4444', '#06b6d4', '#10b981'],
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }

    // 13. XUAT DANH SACH DIEM RA FILE CSV TAI VE
    async function exportSubmissionsToCSV() {
      if (!currentToken) return;
      try {
        const res = await fetch(`${API_BASE}/exams/${EXAM_ID}/export-csv`, {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Bang_Diem_Khao_Sat_${new Date().toISOString().slice(0,10)}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } else {
          alert('Không thể xuất báo cáo CSV');
        }
      } catch (err) {
        alert('Lỗi xuất CSV: ' + err.message);
      }
    }

    // 14. KET NOI REAL-TIME SERVER-SENT EVENTS (SSE) QUA REDIS PUB/SUB
    function initLiveEventStream() {
      if (window.location.search.includes('screenshot=1')) return;
      try {
        const eventSource = new EventSource(`${API_BASE}/events/live-stream`);
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'LEADERBOARD_UPDATE') {
              console.log('[SSE Event] Nhan thong bao cap nhat Leaderboard tu Redis Pub/Sub:', data.payload);
              // Tu dong cap nhat lai Bang xep hang tuc thi
              loadLeaderboard();
              if (currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN')) {
                loadAnalyticsData();
              }
            }
          } catch (e) {}
        };
        eventSource.onerror = () => {
          // Tu dong thu ket noi lai sau vai giay neu ngat ket noi
          eventSource.close();
          setTimeout(initLiveEventStream, 5000);
        };
      } catch (err) {
        console.error('Loi khoi tao Live Event Stream:', err);
      }
    }

    // 15. THUC THI LENH TRUC TIEP TREN NOSQL QUERY RUNNER
    async function executeLiveQuery() {
      const targetDb = document.getElementById('query-runner-target').value;
      const query = document.getElementById('query-runner-cmd').value.trim();
      const output = document.getElementById('query-runner-output');

      output.textContent = 'Đang gửi truy vấn tới ' + targetDb.toUpperCase() + ' Engine...';

      try {
        const res = await fetch(`${API_BASE}/admin/query-runner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetDb, query })
        });
        const json = await res.json();
        output.textContent = JSON.stringify(json, null, 2);
      } catch (err) {
        output.textContent = 'Lỗi thực thi: ' + err.message;
      }
    }

    // ==============================================================

    // 19. CỤM TÍNH NĂNG BỔ SUNG 4: ENROLL, NOTES, REVIEWS & NEO4J RECS
    // ==============================================================
    // ==============================================================================
    // TÍNH NĂNG THƯƠNG MẠI: CỔNG THANH TOÁN VIETQR ĐỘNG (NAPAS 247)
    // ==============================================================================
    var currentVietQROrder = null;
    var vietqrCountdownInterval = null;

    async function openVietQRCheckout(courseId = '670000000000000000000010') {
      try {
        const token = localStorage.getItem('edupro_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        showCustomAlert('Đang khởi tạo mã VietQR thanh toán...');
        const res = await fetch('/api/courses/' + courseId + '/checkout-order', {
          method: 'POST',
          headers
        });
        const data = await res.json();

        if (data.success && data.data) {
          currentVietQROrder = data.data;

          const imgEl = document.getElementById('vietqr-image');
          if (imgEl) imgEl.src = data.data.qrUrl;
          document.getElementById('vietqr-course-title').textContent = data.data.courseTitle;
          document.getElementById('vietqr-amount').textContent = data.data.formattedAmount || (data.data.amount.toLocaleString('vi-VN') + ' ₫');
          document.getElementById('vietqr-bank').textContent = data.data.bankName;
          document.getElementById('vietqr-account-no').textContent = data.data.accountNo;
          document.getElementById('vietqr-account-name').textContent = data.data.accountName;
          document.getElementById('vietqr-order-code').textContent = data.data.orderId;

          // Bắt đầu đếm ngược 10 phút
          startVietQRTimer(10 * 60);

          document.getElementById('modal-vietqr-checkout')?.classList.remove('hidden');
        } else {
          showCustomAlert(data.message || 'Không thể tạo đơn hàng thanh toán.');
        }
      } catch (e) {
        showCustomAlert('Lỗi mạng khi tạo mã VietQR: ' + e.message);
      }
    }

    function startVietQRTimer(seconds) {
      if (vietqrCountdownInterval) clearInterval(vietqrCountdownInterval);
      let timeLeft = seconds;
      const el = document.getElementById('vietqr-countdown');

      vietqrCountdownInterval = setInterval(() => {
        if (timeLeft <= 0) {
          clearInterval(vietqrCountdownInterval);
          if (el) el.textContent = 'HẾT HẠN';
          return;
        }
        timeLeft--;
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        if (el) el.textContent = `${m}:${s}`;
      }, 1000);
    }

    function closeVietQRModal() {
      if (vietqrCountdownInterval) clearInterval(vietqrCountdownInterval);
      document.getElementById('modal-vietqr-checkout')?.classList.add('hidden');
    }

    async function confirmVietQRPayment() {
      if (!currentVietQROrder) return;
      const btn = document.getElementById('btn-confirm-vietqr');
      const btnText = document.getElementById('btn-confirm-vietqr-text');

      if (btn) btn.disabled = true;
      if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Đang xác thực biến động số dư ngân hàng...';

      try {
        const token = localStorage.getItem('edupro_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        // Mô phỏng 1.2s độ trễ xác thực ngân hàng
        await new Promise(r => setTimeout(r, 1200));

        const res = await fetch('/api/courses/orders/' + currentVietQROrder.orderId + '/confirm', {
          method: 'POST',
          headers
        });
        const data = await res.json();

        if (data.success) {
          closeVietQRModal();
          showCustomAlert('🎉 Thanh toán thành công! Khóa học đã được kích hoạt (+200 XP)');
          if (typeof loadRecentNotifications === 'function') loadRecentNotifications();

          if (currentVietQROrder && currentVietQROrder.courseId) {
            userEnrolledCourseIds.add(String(currentVietQROrder.courseId));
            window.userEnrolledCourseIds = userEnrolledCourseIds;
            if (rawCoursesData && rawCoursesData.length) {
              renderCoursesGrid(rawCoursesData);
            }
            if (typeof loadCollaborativeRecommendations === 'function') {
              loadCollaborativeRecommendations();
            }
          }
          if (typeof loadGamificationProfile === 'function') loadGamificationProfile();

          // Mở giao diện lớp học ngay
          setTimeout(() => {
            openClassroomModal(currentVietQROrder.courseId);
          }, 800);
        } else {
          showCustomAlert(data.message || 'Xác nhận thanh toán chưa thành công.');
        }
      } catch (e) {
        showCustomAlert('Lỗi kết nối xác nhận: ' + e.message);
      } finally {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = 'Tôi Đã Chuyển Khoản Thành Công';
      }
    }

    function copyVietQRField(elementId, labelName) {
      const text = document.getElementById(elementId)?.textContent?.trim();
      if (text) {
        navigator.clipboard.writeText(text);
        showCustomAlert(`Đã sao chép ${labelName}: ${text}`);
      }
    }

    async function enrollCurrentCourse(targetCourseId) {
      const courseIdToEnroll = targetCourseId || currentCourseId || currentClassroomCourseId;
      if (!getValidToken()) { 
        openLoginModal(); 
        return; 
      }
      if (courseIdToEnroll) {
        currentCourseId = courseIdToEnroll;
        currentClassroomCourseId = courseIdToEnroll;
        openVietQRCheckout(courseIdToEnroll);
        return;
      }
      showToast('Vui lòng chọn khóa học để đăng ký.', 'warning');
    }


    // 20. CỤM TÍNH NĂNG BỔ SUNG 5 & 6: GAMIFICATION, 4-DB HEALTH & CMS
    // ==============================================================
    async function loadGamificationProfile() {
      if (!currentToken) return;
      try {
        const res = await fetch(`${API_BASE}/courses/gamification/profile`, {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          const streakEl = document.getElementById('gamification-streak-badge');
          const levelEl = document.getElementById('gamification-level-title');
          const xpEl = document.getElementById('gamification-xp-value');
          const wordsEl = document.getElementById('gamification-mastered-words');
          const essaysEl = document.getElementById('gamification-essays-count');

          const xpVal = d.xp ?? d.xpPoints ?? 850;
          if (streakEl) streakEl.textContent = `Chuỗi học liên tiếp: ${d.streakDays || 7} ngày 🔥`;
          if (levelEl) levelEl.textContent = `Cấp độ: ${d.levelTitle || d.cefrLevel || 'CEFR B2'}`;
          if (xpEl) xpEl.textContent = `${xpVal.toLocaleString()} XP`;
          if (wordsEl) wordsEl.textContent = `${d.masteredVocab ?? d.masteredWordsCount ?? 2} Từ`;
          if (essaysEl) essaysEl.textContent = `${d.totalExams ?? d.essaysSubmittedCount ?? 1} Bài`;

          if (Array.isArray(d.enrolledCourses)) {
            d.enrolledCourses.forEach(c => {
              if (c._id || c.courseId) userEnrolledCourseIds.add(String(c._id || c.courseId));
            });
            window.userEnrolledCourseIds = userEnrolledCourseIds;
            if (rawCoursesData && rawCoursesData.length) {
              renderCoursesGrid(rawCoursesData);
            }
          }

          const grid = document.getElementById('enrolled-courses-progress-grid');
          if (grid && d.enrolledCourses) {
            grid.innerHTML = d.enrolledCourses.map(c => `
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between text-xs mb-2">
                    <span class="px-2.5 py-0.5 rounded-full font-bold bg-brand-50 dark:bg-slate-900 text-brand-600 dark:text-indigo-400">${c.category}</span>
                    <span class="font-extrabold text-emerald-600 dark:text-emerald-400">${c.progressPercent}% hoàn thành</span>
                  </div>
                  <h4 class="font-extrabold text-sm text-slate-900 dark:text-white mb-3">${c.title}</h4>
                </div>
                <div>
                  <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
                    <div class="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full" style="width: ${c.progressPercent}%"></div>
                  </div>
                  <button onclick="enterClassroom('${c._id || c.courseId}')" class="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all">
                    Tiếp tục bài học ➔
                  </button>
                </div>
              </div>
            `).join('');
          }
        }
      } catch (err) {
        console.error('Lỗi tải Gamification:', err);
      }
    }

    async function check4DatabasesHealth() {
      const targets = [
        { db: 'mongodb', query: 'STATS', badgeId: 'health-badge-mongo' },
        { db: 'redis', query: 'KEYS *', badgeId: 'health-badge-redis' },
        { db: 'cassandra', query: 'SELECT * FROM video_tracking_by_user LIMIT 5;', badgeId: 'health-badge-cassandra' },
        { db: 'neo4j', query: 'MATCH (n) RETURN count(n)', badgeId: 'health-badge-neo4j' }
      ];

      for (const t of targets) {
        try {
          const res = await fetch(`${API_BASE}/admin/query-runner`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetDb: t.db, query: t.query })
          });
          const json = await res.json();
          const badge = document.getElementById(t.badgeId);
          if (badge && json.success) {
            badge.textContent = json.engine && json.engine.includes('Fallback') ? 'READY (HYBRID)' : 'LIVE CONTAINER';
          }
        } catch (e) {}
      }
    }

    async function handleCreateCourseCMS(e) {
      e.preventDefault();
      if (!getValidToken()) { openLoginModal(); return; }
      const title = document.getElementById('cms-course-title').value.trim();
      const category = document.getElementById('cms-course-category').value;
      const price = Number(document.getElementById('cms-course-price').value || 1590000);
      const tagline = document.getElementById('cms-course-tagline').value.trim();

      try {
        const res = await fetch(`${API_BASE}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({
            title,
            category,
            price,
            originalPrice: price + 600000,
            tagline,
            description: tagline,
            thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
            durationHours: 36,
            rating: 5.0,
            reviewsCount: 1
          })
        });
        const json = await res.json();
        if (json.success) {
          alert('Đã tạo khóa học mới thành công!');
          document.getElementById('cms-course-title').value = '';
          document.getElementById('cms-course-tagline').value = '';
          await loadCoursesCatalog();
        } else {
          alert('Lỗi: ' + (json.message || 'Không thể tạo khóa học'));
        }
      } catch (err) {
        alert('Lỗi kết nối: ' + err.message);
      }
    }

    async function handleCreateQuestionCMS(e) {
      e.preventDefault();
      if (!getValidToken()) { openLoginModal(); return; }
      const content = document.getElementById('cms-q-content').value.trim();
      const optionA = document.getElementById('cms-q-optA').value.trim();
      const optionB = document.getElementById('cms-q-optB').value.trim();
      const optionC = document.getElementById('cms-q-optC').value.trim();
      const optionD = document.getElementById('cms-q-optD').value.trim();
      const correctOption = document.getElementById('cms-q-correct').value;
      const explanation = document.getElementById('cms-q-explanation').value.trim();

      try {
        const res = await fetch(`${API_BASE}/exams/questions/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({
            examId: EXAM_ID,
            content,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer: correctOption,
            correctOption,
            explanation
          })
        });
        const json = await res.json();
        if (json.success) {
          alert('Đã thêm câu hỏi mới vào ngân hàng đề thi thành công!');
          document.getElementById('cms-q-content').value = '';
          document.getElementById('cms-q-optA').value = '';
          document.getElementById('cms-q-optB').value = '';
          document.getElementById('cms-q-optC').value = '';
          document.getElementById('cms-q-optD').value = '';
          document.getElementById('cms-q-explanation').value = '';
        } else {
          alert('Lỗi: ' + (json.message || 'Không thể thêm câu hỏi'));
        }
      } catch (err) {
        alert('Lỗi kết nối: ' + err.message);
      }
    }

    // ==============================================================

// ==============================================================================
// PROFILE & PASSWORD MANAGEMENT (TASK 1.1 & 1.2)
// ==============================================================================
function toggleAccountMenu() {
  const menu = document.getElementById('account-menu');
  if (menu) menu.classList.toggle('hidden');
}

function openEditProfileModal() {
  const menu = document.getElementById('account-menu');
  if (menu) menu.classList.add('hidden');
  const u = currentUser || {};
  const nameEl = document.getElementById('profile-full-name');
  const phoneEl = document.getElementById('profile-phone');
  const schoolEl = document.getElementById('profile-school');
  const bandEl = document.getElementById('profile-target-band');
  const avatarEl = document.getElementById('profile-avatar-url');
  if (nameEl) nameEl.value = u.fullName || '';
  if (phoneEl) phoneEl.value = u.phone || '';
  if (schoolEl) schoolEl.value = u.school || '';
  if (bandEl) bandEl.value = u.targetBand || '';
  if (avatarEl) avatarEl.value = u.avatar || '';
  updateProfileAvatarPreview();
  const modal = document.getElementById('modal-edit-profile');
  if (modal) modal.classList.remove('hidden');
}

function closeEditProfileModal() {
  const modal = document.getElementById('modal-edit-profile');
  if (modal) modal.classList.add('hidden');
}

function updateProfileAvatarPreview() {
  const avatarEl = document.getElementById('profile-avatar-url');
  const previewEl = document.getElementById('profile-avatar-preview');
  if (previewEl && avatarEl) {
    const url = avatarEl.value.trim();
    previewEl.src = url || (currentUser && currentUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  }
}

async function saveUserProfile(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!getValidToken()) { openLoginModal(); return; }
  const fullName = document.getElementById('profile-full-name').value.trim();
  const phone = document.getElementById('profile-phone').value.trim();
  const school = document.getElementById('profile-school').value.trim();
  const targetBand = document.getElementById('profile-target-band').value;
  const avatarUrl = document.getElementById('profile-avatar-url').value.trim();

  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
      body: JSON.stringify({ fullName, phone, school, targetBand, avatarUrl })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Cập nhật thất bại');
    currentUser = { ...currentUser, ...json.data.user };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInterface();
    closeEditProfileModal();
    showToast(json.message || 'Đã cập nhật hồ sơ thành công!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openChangePasswordModal() {
  const menu = document.getElementById('account-menu');
  if (menu) menu.classList.add('hidden');
  const form = document.getElementById('form-change-password');
  if (form) form.reset();
  const modal = document.getElementById('modal-change-password');
  if (modal) modal.classList.remove('hidden');
}

function closeChangePasswordModal() {
  const form = document.getElementById('form-change-password');
  if (form) form.reset();
  const modal = document.getElementById('modal-change-password');
  if (modal) modal.classList.add('hidden');
}

function togglePasswordVisibility(fieldId, btn) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  if (btn) btn.innerHTML = isPw ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
}

async function submitChangePassword(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!getValidToken()) { openLoginModal(); return; }
  const oldPassword = document.getElementById('pw-old').value;
  const newPassword = document.getElementById('pw-new').value;
  const confirmPassword = document.getElementById('pw-confirm').value;

  if (newPassword !== confirmPassword) {
    showToast('Xác nhận mật khẩu mới không khớp!', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Đổi mật khẩu thất bại');
    closeChangePasswordModal();
    showToast(json.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
