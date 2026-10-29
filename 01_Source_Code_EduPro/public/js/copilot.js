// ==============================================================================
// 5. COPILOT & SOCIAL: AI ASSISTANT, STUDY BUDDIES, POMODORO & APP BOOTSTRAP
// ==============================================================================

    // GIAI ĐOẠN 4 - TÍNH NĂNG 6: VIRTUAL LOFI STUDY ROOM & POMODORO
    // ==============================================================
    window.tier4Pomodoro = {
      timer: null,
      secondsLeft: 25 * 60,
      totalSeconds: 25 * 60,
      isRunning: false,
      mode: 'focus',
      audioContext: null,
      isAudioPlaying: false,
      gainNode: null,
      oscillatorNodes: []
    };

    async function loadPomodoroPresence() {
      try {
        const res = await fetch(`${API_BASE}/courses/pomodoro/presence`);
        const json = await res.json();
        const pText = document.getElementById('lofi-presence-text');
        if (pText && json.success) {
          pText.innerText = `${json.activeCount || 128} học viên đang cùng online`;
        }
      } catch (e) {}
    }

    function setPomodoroMode(minutes, mode) {
      if (window.tier4Pomodoro.timer) {
        clearInterval(window.tier4Pomodoro.timer);
        window.tier4Pomodoro.timer = null;
      }
      window.tier4Pomodoro.isRunning = false;
      window.tier4Pomodoro.mode = mode;
      window.tier4Pomodoro.totalSeconds = minutes * 60;
      window.tier4Pomodoro.secondsLeft = minutes * 60;

      ['focus', 'short', 'long'].forEach(m => {
        const btn = document.getElementById(`pomo-mode-${m}`);
        if (!btn) return;
        if (m === mode) {
          btn.className = 'px-3 py-1 rounded-lg bg-indigo-600 text-white transition-all';
        } else {
          btn.className = 'px-3 py-1 rounded-lg text-slate-300 hover:text-white transition-all';
        }
      });

      const toggleLabel = document.getElementById('pomodoro-toggle-label');
      const toggleIcon = document.getElementById('pomodoro-toggle-icon');
      if (toggleLabel) toggleLabel.innerText = 'Bắt đầu tập trung';
      if (toggleIcon) toggleIcon.className = 'fa-solid fa-play';

      const floatingStatus = document.getElementById('floating-pomo-status');
      if (floatingStatus) {
        floatingStatus.innerText = mode === 'focus' ? 'Focus Mode' : 'Break Time';
      }

      updatePomodoroDisplay();
    }

    function togglePomodoroTimer() {
      if (window.tier4Pomodoro.isRunning) {
        clearInterval(window.tier4Pomodoro.timer);
        window.tier4Pomodoro.timer = null;
        window.tier4Pomodoro.isRunning = false;
        const toggleLabel = document.getElementById('pomodoro-toggle-label');
        const toggleIcon = document.getElementById('pomodoro-toggle-icon');
        if (toggleLabel) toggleLabel.innerText = 'Tiếp tục';
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-play';
      } else {
        window.tier4Pomodoro.isRunning = true;
        const toggleLabel = document.getElementById('pomodoro-toggle-label');
        const toggleIcon = document.getElementById('pomodoro-toggle-icon');
        if (toggleLabel) toggleLabel.innerText = 'Tạm dừng';
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-pause';

        window.tier4Pomodoro.timer = setInterval(() => {
          if (window.tier4Pomodoro.secondsLeft > 0) {
            window.tier4Pomodoro.secondsLeft--;
            updatePomodoroDisplay();
          } else {
            clearInterval(window.tier4Pomodoro.timer);
            window.tier4Pomodoro.timer = null;
            window.tier4Pomodoro.isRunning = false;
            finishPomodoroSession();
          }
        }, 1000);
      }
    }

    function resetPomodoroTimer() {
      if (window.tier4Pomodoro.timer) {
        clearInterval(window.tier4Pomodoro.timer);
        window.tier4Pomodoro.timer = null;
      }
      window.tier4Pomodoro.isRunning = false;
      window.tier4Pomodoro.secondsLeft = window.tier4Pomodoro.totalSeconds;
      const toggleLabel = document.getElementById('pomodoro-toggle-label');
      const toggleIcon = document.getElementById('pomodoro-toggle-icon');
      if (toggleLabel) toggleLabel.innerText = 'Bắt đầu tập trung';
      if (toggleIcon) toggleIcon.className = 'fa-solid fa-play';
      updatePomodoroDisplay();
    }

    function updatePomodoroDisplay() {
      const s = window.tier4Pomodoro.secondsLeft;
      const m = Math.floor(s / 60);
      const remS = s % 60;
      const formatted = `${String(m).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;

      const disp = document.getElementById('pomodoro-timer-display');
      if (disp) disp.innerText = formatted;

      const floatDisp = document.getElementById('floating-pomo-display');
      if (floatDisp) floatDisp.innerText = formatted;
    }

    async function finishPomodoroSession() {
      updatePomodoroDisplay();
      const toggleLabel = document.getElementById('pomodoro-toggle-label');
      const toggleIcon = document.getElementById('pomodoro-toggle-icon');
      if (toggleLabel) toggleLabel.innerText = 'Bắt đầu lại';
      if (toggleIcon) toggleIcon.className = 'fa-solid fa-rotate-right';

      try {
        const res = await fetch(`${API_BASE}/courses/pomodoro/finish-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durationMinutes: 25 })
        });
        const json = await res.json();
        if (json.success) {
          showToast('🍅 Hoàn thành xuất sắc phiên tập trung 25 phút (+100 XP tích lũy)!', 'success');
        }
      } catch (e) {
        showToast('🍅 Hoàn thành phiên Pomodoro 25 phút! (+100 XP)', 'success');
      }

      setPomodoroMode(5, 'short');
    }

    function toggleLofiAudio() {
      if (window.tier4Pomodoro.isAudioPlaying) {
        stopLofiAudio();
      } else {
        startLofiAudio();
      }
    }

    function startLofiAudio() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!window.tier4Pomodoro.audioContext) {
          window.tier4Pomodoro.audioContext = new AudioContext();
        }
        const ctx = window.tier4Pomodoro.audioContext;
        if (ctx.state === 'suspended') ctx.resume();

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
        masterGain.connect(ctx.destination);
        window.tier4Pomodoro.gainNode = masterGain;

        const chordFrequencies = [220.00, 261.63, 329.63, 392.00]; // Am7 chord
        window.tier4Pomodoro.oscillatorNodes = chordFrequencies.map(freq => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, ctx.currentTime);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.connect(filter);
          filter.connect(masterGain);
          osc.start();
          return osc;
        });

        window.tier4Pomodoro.isAudioPlaying = true;
        const icon = document.getElementById('lofi-audio-icon');
        const label = document.getElementById('lofi-audio-label');
        if (icon) icon.className = 'fa-solid fa-pause';
        if (label) label.innerText = 'Tạm dừng Lofi Ambient';
        showToast('🎵 Đang phát Lofi Study Chords thư giãn...', 'info');
      } catch (e) {
        console.error('AudioContext error:', e);
      }
    }

    function stopLofiAudio() {
      if (window.tier4Pomodoro.oscillatorNodes) {
        window.tier4Pomodoro.oscillatorNodes.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        window.tier4Pomodoro.oscillatorNodes = [];
      }
      window.tier4Pomodoro.isAudioPlaying = false;
      const icon = document.getElementById('lofi-audio-icon');
      const label = document.getElementById('lofi-audio-label');
      if (icon) icon.className = 'fa-solid fa-play';
      if (label) label.innerText = 'Bật nhạc Lofi Study Beat';
    }

    function changeLofiVolume(val) {
      if (window.tier4Pomodoro.gainNode && window.tier4Pomodoro.audioContext) {
        const gainVal = (parseFloat(val) / 100) * 0.15;
        window.tier4Pomodoro.gainNode.gain.setValueAtTime(gainVal, window.tier4Pomodoro.audioContext.currentTime);
      }
    }


// KHỞI CHẠY LẦN ĐẦU (ĐẢM BẢO CHẠY KỂ CẢ KHI DOM ĐÃ READY)
    
    // ==============================================================================

    // TÍNH NĂNG KIẾN TRÚC 1: SMART AI STUDY COPILOT (4 NOSQL INTEGRATION)
    // ==============================================================================
    let isCopilotOpen = false;

    function toggleAiChat() { toggleCopilotWidget(); }
    function toggleCopilotWidget() {
      const card = document.getElementById('copilot-chat-card');
      if (!card) return;
      isCopilotOpen = !isCopilotOpen;
      if (isCopilotOpen) {
        card.classList.remove('hidden');
        document.getElementById('copilot-input')?.focus();
      } else {
        card.classList.add('hidden');
      }
    }

    async function handleCopilotSubmit() {
      const input = document.getElementById('copilot-input');
      const query = input?.value?.trim();
      if (!query) return;
      input.value = '';
      await sendCopilotMessage(query);
    }

    async function sendCopilotMessage(userQuery) {
      const container = document.getElementById('copilot-messages');
      if (!container) return;

      // Append user message
      const userBubble = document.createElement('div');
      userBubble.className = 'flex items-start justify-end gap-2 text-right';
      userBubble.innerHTML = `
        <div class="p-3 rounded-2xl rounded-tr-sm bg-brand-600 text-white text-xs leading-relaxed max-w-[85%] text-left">
          ${userQuery}
        </div>
      `;
      container.appendChild(userBubble);
      container.scrollTop = container.scrollHeight;

      // Append typing indicator
      const typingBubble = document.createElement('div');
      typingBubble.id = 'copilot-typing-indicator';
      typingBubble.className = 'flex items-start gap-2.5';
      typingBubble.innerHTML = `
        <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-brand-600 dark:text-indigo-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="p-2.5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-1.5">
          <i class="fa-solid fa-circle-notch fa-spin"></i> Đang truy vấn hợp nhất 4 CSDL NoSQL...
        </div>
      `;
      container.appendChild(typingBubble);
      container.scrollTop = container.scrollHeight;

      try {
        const token = localStorage.getItem('edupro_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const res = await fetch('/api/copilot/ask', {
          method: 'POST',
          headers,
          body: JSON.stringify({ question: userQuery })
        });
        const data = await res.json();

        typingBubble.remove();

        if (data.success) {
          const botBubble = document.createElement('div');
          botBubble.className = 'flex items-start gap-2.5 text-left';
          
          const sourceBadges = (data.sources || []).map(s => `
            <span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-indigo-300 border border-brand-200 dark:border-brand-800">
              ${s.db}
            </span>
          `).join(' ');

          const actionBtns = (data.suggestedActions || []).map(act => `
            <button onclick='handleCopilotAction("${act.action}", ${JSON.stringify(act.payload)})' class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-brand-500 font-bold text-[10px] text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1">
              <span>${act.label}</span>
              <i class="fa-solid fa-chevron-right text-[8px]"></i>
            </button>
          `).join('');

          botBubble.innerHTML = `
            <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-brand-600 dark:text-indigo-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div class="space-y-2 max-w-[88%]">
              <div class="p-3 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                ${data.answer}
              </div>
              <div class="flex flex-wrap items-center gap-1">
                <span class="text-[9px] text-slate-400">Nguồn:</span>
                ${sourceBadges}
              </div>
              ${actionBtns ? `<div class="flex flex-wrap gap-1.5 pt-1">${actionBtns}</div>` : ''}
            </div>
          `;
          container.appendChild(botBubble);
        } else {
          typingBubble.remove();
          showToast('Lỗi phản hồi Copilot: ' + data.message, 'error');
        }
      } catch (err) {
        typingBubble.remove();
        showToast('Lỗi kết nối Copilot: ' + err.message, 'error');
      }

      container.scrollTop = container.scrollHeight;
    }

    function handleCopilotAction(action, payload) {
      if (action === 'ENTER_CLASSROOM' && payload?.courseId) {
        enterClassroom(payload.courseId);
        toggleCopilotWidget();
      } else if (action === 'NAVIGATE' && payload?.section) {
        showSection(payload.section);
        toggleCopilotWidget();
      } else if (action === 'ASK_COPILOT' && payload?.query) {
        sendCopilotMessage(payload.query);
      } else if (action === 'START_POMODORO') {
        if (typeof togglePomodoroTimer === 'function') togglePomodoroTimer();
        toggleCopilotWidget();
      }
    }

    // ==============================================================================

    // TÍNH NĂNG KIẾN TRÚC 3: MẠNG LƯỚI BẠN CÙNG TIẾN (NEO4J STUDY BUDDY GRAPH)
    // ==============================================================================
    async function loadStudyBuddies() {
      const container = document.getElementById('study-buddies-grid');
      if (!container) return;
      container.innerHTML = '<div class="col-span-4 text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang phân tích đồ thị kết nối bạn học trên Neo4j...</div>';

      try {
        const token = localStorage.getItem('edupro_token');
        const headers = {};
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const res = await fetch('/api/peers/study-buddies', { headers });
        const data = await res.json();

        if (data.success && data.data) {
          container.innerHTML = data.data.map(p => `
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-500/50 transition-all text-left group">
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <img src="${p.avatar}" alt="${p.fullName}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700">
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white text-xs leading-tight">${p.fullName}</div>
                    <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Mục tiêu: ${p.targetBand}</div>
                  </div>
                </div>

                <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 mb-3 space-y-1">
                  <div class="flex justify-between text-[10px]">
                    <span class="text-slate-400">Độ tương đồng đồ thị:</span>
                    <span class="font-bold text-emerald-600">${p.matchPercent}%</span>
                  </div>
                  <div class="flex justify-between text-[10px]">
                    <span class="text-slate-400">Khóa học chung:</span>
                    <span class="font-bold text-indigo-600">${p.sharedCoursesCount} khóa</span>
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
                    Đang ôn: <b>${p.currentFocus}</b>
                  </div>
                </div>
              </div>

              <button onclick="connectStudyBuddy('${p.id}', '${p.fullName}')" class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-user-plus text-[10px]"></i>
                <span>Kết nối học cùng (+50 XP)</span>
              </button>
            </div>
          `).join('');
        }
      } catch (e) {
        console.warn('Loi khi load study buddies:', e);
      }
    }

    async function connectStudyBuddy(peerId, peerName) {
      try {
        const token = localStorage.getItem('edupro_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const res = await fetch('/api/peers/connect', {
          method: 'POST',
          headers,
          body: JSON.stringify({ peerId, peerName })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          if (typeof loadRecentNotifications === 'function') loadRecentNotifications();
        } else {
          showToast(data.message || 'Không thể kết nối.', 'error');
        }
      } catch (e) {
        showToast('Lỗi kết nối bạn học: ' + e.message, 'error');
      }
    }



    function bootstrapApplication() {
      initTheme();
      syncUserUI();
      loadCoursesCatalog();
      loadFlashcards();
      loadDictations();
      initLiveEventStream();
      initSSELiveStream();
      loadRecentNotifications();
      loadCollaborativeRecommendations();
      loadVideoRetentionAnalytics();
      initInstantHighlightDictionary();
      loadWordArenaLeaderboard();
      loadSrsDueQueue();
      generateAdaptiveRoadmap();
      loadSkillTreeData();
      loadCollocationMindmap('problem');
      loadClozeExercise();
      loadWeaknessDiagnosticData();
      loadPvPSpeakingLeaderboard();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrapApplication);
    } else {
      bootstrapApplication();
    }