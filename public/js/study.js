// ==============================================================================
// 3. STUDY ENGINE: FLASHCARDS 3D, DICTATION, WRITING AI, EXAM & TIER 1-4 LABS
// ==============================================================================

    async function startExam(silent = false) {
      if (!currentToken) { openLoginModal(); return; }

      // Reset Anti-Cheat State for new/reloaded exam session
      isExamDisqualified = false;
      const acBadge = document.getElementById('anti-cheat-status-badge');
      if (acBadge) {
        acBadge.innerText = 'BÌNH THƯỜNG (0/3)';
        acBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      }
      const countEl = document.getElementById('anti-cheat-modal-count');
      if (countEl) countEl.innerText = '0/3';
      const demoBtn = document.getElementById('btn-demo-violation');
      if (demoBtn) demoBtn.disabled = false;

      fetch(`${API_BASE}/exams/anti-cheat/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
        },
        body: JSON.stringify({ examId: EXAM_ID })
      }).catch(() => {});

      try {
        const res = await fetch(`${API_BASE}/exams/${EXAM_ID}/start`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const json = await res.json();
        if (json.success) {
          const { examTitle, ttlLeftSeconds, savedAnswers, questions } = json.data;
          document.getElementById('exam-page-title').textContent = examTitle;
          loadedQuestions = questions;
          userAnswers = savedAnswers || {};

          renderExamQuestions();
          runTimer(ttlLeftSeconds);
          loadLeaderboard();

          if (!silent) document.getElementById('exam-result-card').classList.add('hidden');
        }
      } catch (err) {
        console.error('Lỗi bài thi:', err);
      }
    }

    function renderExamQuestions() {
      const container = document.getElementById('exam-questions-box');
      if (!loadedQuestions || loadedQuestions.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-slate-400">Không có câu hỏi nào.</div>';
        return;
      }

      let html = '';
      loadedQuestions.forEach((q, idx) => {
        const selected = userAnswers[q._id];
        const isBookmarked = bookmarkedQuestionIds.includes(String(q._id));
        const safeSpeechText = String(q.content || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        html += `
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-start gap-3">
                <span class="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-indigo-400 font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  ${idx + 1}
                </span>
                <h3 class="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg leading-snug">
                  ${q.content}
                </h3>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="speakText('${safeSpeechText}', 'en-US')" title="Nghe phát âm câu hỏi" class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-600 dark:text-slate-300 hover:text-brand-600 flex items-center justify-center text-xs transition-all">
                  <i class="fa-solid fa-volume-high"></i>
                </button>
                <button onclick="toggleQuestionBookmark('${q._id}')" title="Lưu câu hỏi vào Sổ tay ôn tập" class="px-2.5 h-8 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${isBookmarked ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600'}">
                  <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
                  <span class="hidden sm:inline">${isBookmarked ? 'Đã lưu' : 'Lưu'}</span>
                </button>
              </div>
            </div>
            <div class="space-y-3">
        `;

        q.options.forEach((opt, optIdx) => {
          const letter = (opt && opt.key) ? opt.key : String.fromCharCode(65 + optIdx);
          const optText = (opt && typeof opt === 'object') ? (opt.text || JSON.stringify(opt)) : opt;
          const isChosen = selected === letter;
          html += `
            <div onclick="pickAnswer('${q._id}', '${letter}')" class="p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${isChosen ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-indigo-200 font-semibold shadow-sm' : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}">
              <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isChosen ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">
                ${letter}
              </span>
              <span class="text-sm flex-grow">${optText}</span>
              ${isChosen ? '<i class="fa-solid fa-circle-check text-brand-600 dark:text-indigo-400"></i>' : ''}
            </div>
          `;
        });

        if (isPracticeMode && selected) {
          html += `
            <div class="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5">
              <i class="fa-solid fa-lightbulb text-amber-500 mt-0.5"></i>
              <div>
                <strong>Chế độ Luyện tập:</strong> Bạn đã chọn đáp án <strong>${selected}</strong>. Nộp bài để xem đáp án chi tiết hoặc nhấn biểu tượng 🔖 để lưu câu hỏi vào sổ tay ôn tập.
              </div>
            </div>
          `;
        }

        html += `</div></div>`;
      });

      container.innerHTML = html;
    }

    async function pickAnswer(qId, letter) {
      userAnswers[qId] = letter;
      renderExamQuestions();

      try {
        await fetch(`${API_BASE}/exams/${EXAM_ID}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ questionId: qId, selectedOption: letter })
        });
      } catch (err) {
        console.error('Lỗi lưu đáp án:', err);
      }
    }

    function runTimer(seconds) {
      clearInterval(examCountdown);
      let remain = seconds;
      const tick = () => {
        const m = Math.floor(remain / 60);
        const s = remain % 60;
        document.getElementById('exam-timer-display').textContent = 
          `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        if (remain <= 0) {
          clearInterval(examCountdown);
          alert('Thời gian làm bài đã kết thúc! Hệ thống tự động nộp bài...');
          submitExam();
        }
        remain--;
      };
      tick();
      examCountdown = setInterval(tick, 1000);
    }

    async function submitExam(force = false) {
      if (!force) {
        if (!confirm('Bạn có chắc chắn muốn nộp bài đánh giá?')) return;
      }
      clearInterval(examCountdown);

      try {
        const res = await fetch(`${API_BASE}/exams/${EXAM_ID}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ answers: userAnswers, isDisqualified: isExamDisqualified })
        });

        const json = await res.json();
        if (json.success) {
          const { score, correctCount, totalCount, detailedAnswers } = json.data;
          const displayScore = isExamDisqualified ? 0 : score;
          const displayCorrect = isExamDisqualified ? 0 : correctCount;
          lastExamResult = { score: displayScore, correctCount: displayCorrect, totalCount, title: 'Đánh Giá Năng Lực Tiếng Anh Quốc Tế (English Placement & IELTS/TOEIC Test)' };

          document.getElementById('res-score-number').textContent = displayScore;
          document.getElementById('res-correct-fraction').textContent = `${displayCorrect}/${totalCount}`;
          
          const isPass = !isExamDisqualified && displayScore >= 5.0;
          const verdictEl = document.getElementById('res-verdict');
          if (verdictEl) {
            if (isExamDisqualified) {
              verdictEl.textContent = 'ĐÌNH CHỈ THI (0 ĐIỂM)';
              verdictEl.className = 'text-lg font-bold text-rose-600 mt-2';
            } else {
              verdictEl.textContent = isPass ? 'ĐẠT CHUẨN' : 'CẦN ÔN TẬP';
              verdictEl.className = `text-lg font-bold mt-2 ${isPass ? 'text-emerald-600' : 'text-amber-600'}`;
            }
          }

          // Hiển thị nút nhận chứng chỉ nếu Đạt (Tính năng 1)
          const certBtn = document.getElementById('btn-view-certificate');
          if (certBtn) {
            if (isPass && !isExamDisqualified) {
              certBtn.classList.remove('hidden');
            } else {
              certBtn.classList.add('hidden');
            }
          }

          let detailsHtml = '<h4 class="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Giải thích chi tiết kết quả:</h4>';
          detailedAnswers.forEach((ans, i) => {
            detailsHtml += `
              <div class="p-4 rounded-2xl border ${ans.isCorrect ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'}">
                <div class="flex items-center justify-between text-xs font-bold mb-1">
                  <span class="text-slate-800 dark:text-slate-200">Câu ${i + 1}: ${ans.content}</span>
                  <span class="${ans.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}">${ans.isCorrect ? 'CHÍNH XÁC' : 'CHƯA ĐÚNG'}</span>
                </div>
                <div class="text-xs text-slate-600 dark:text-slate-400">Bạn chọn: <strong>${ans.selected || 'Bỏ qua'}</strong> • Đáp án chuẩn: <strong>${ans.correctAnswer}</strong></div>
                <div class="text-xs text-slate-500 italic mt-1">${ans.explanation}</div>
              </div>
            `;
          });

          document.getElementById('res-details-container').innerHTML = detailsHtml;
          document.getElementById('exam-result-card').classList.remove('hidden');

          loadLeaderboard();
          loadUserHistory();
        }
      } catch (err) {
        alert('Lỗi nộp bài: ' + err.message);
      }
    }

    async function loadLeaderboard() {
      try {
        const res = await fetch(`${API_BASE}/exams/${EXAM_ID}/leaderboard`);
        const json = await res.json();
        if (json.success && json.data) {
          const container = document.getElementById('exam-leaderboard-list');
          if (json.data.length === 0) {
            container.innerHTML = '<div class="text-center py-4 text-slate-400 text-xs">Chưa có lượt nộp bài.</div>';
            return;
          }

          let html = '';
          json.data.forEach((item, idx) => {
            const isTop1 = idx === 0;
            html += `
              <div class="flex items-center justify-between p-3 rounded-2xl border ${isTop1 ? 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 font-bold' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'}">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${isTop1 ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">
                    ${item.rank}
                  </span>
                  <span class="text-xs text-slate-800 dark:text-slate-200 font-semibold">${item.student}</span>
                </div>
                <span class="text-xs font-black text-brand-600 dark:text-indigo-400">${item.score} đ</span>
              </div>
            `;
          });
          container.innerHTML = html;
        }
      } catch (err) {
        console.error('Lỗi leaderboard:', err);
      }
    }

    // 8. CHỨNG CHỈ ĐIỆN TỬ MODAL & XUẤT FILE PDF/PNG

    async function initKnowledgeGraph() {
      try {
        const res = await fetch(`${API_BASE}/graph/knowledge-graph`);
        const json = await res.json();
        if (json.success && json.data) {
          const container = document.getElementById('vis-graph-viewport');
          const isDark = document.documentElement.classList.contains('dark');

          const nodes = new vis.DataSet(json.data.nodes.map(n => {
            let bg = '#6366f1';
            if (n.group === 'Course') bg = '#4f46e5';
            if (n.group === 'Lesson') bg = '#10b981';
            if (n.group === 'Topic') bg = '#f59e0b';
            if (n.group === 'Skill') bg = '#ec4899';

            return {
              id: n.id,
              label: n.label,
              shape: 'box',
              margin: 12,
              color: {
                background: bg,
                border: isDark ? '#1e293b' : '#ffffff',
                highlight: { background: '#312e81', border: '#ffffff' }
              },
              font: { color: '#ffffff', face: 'Plus Jakarta Sans', size: 12, bold: true }
            };
          }));

          const edges = new vis.DataSet(json.data.edges.map(e => ({
            from: e.from, to: e.to, label: e.label, arrows: 'to',
            font: { align: 'horizontal', size: 10, color: isDark ? '#94a3b8' : '#64748b' },
            color: { color: isDark ? '#334155' : '#e2e8f0', highlight: '#6366f1' }
          })));

          const data = { nodes, edges };
          const options = {
            physics: {
              solver: 'forceAtlas2Based',
              forceAtlas2Based: { gravitationalConstant: -40, centralGravity: 0.005, springLength: 120 }
            },
            interaction: { hover: true }
          };

          visGraph = new vis.Network(container, data, options);

          // Tự động căn chỉnh vừa khung hình và ổn định đồ thị
          setTimeout(() => {
            if (visGraph) visGraph.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
          }, 350);

          // Tương tác khi click vào node trên đồ thị (Tính năng 5)
          visGraph.on('click', function(params) {
            if (params.nodes.length > 0) {
              const nodeId = params.nodes[0];
              const clickedNode = json.data.nodes.find(n => n.id === nodeId);
              if (clickedNode) {
                showGraphNodeDetail(clickedNode);
              }
            } else {
              document.getElementById('graph-node-detail-card').classList.add('hidden');
            }
          });
        }
      } catch (err) {
        console.error('Lỗi đồ thị:', err);
      }
    }

    let currentSelectedNode = null;
    function showGraphNodeDetail(node) {
      currentSelectedNode = node;
      const card = document.getElementById('graph-node-detail-card');
      const badge = document.getElementById('graph-node-type-badge');
      const title = document.getElementById('graph-node-title');
      const desc = document.getElementById('graph-node-desc');

      badge.textContent = node.group || 'Node';
      title.textContent = node.label || node.id;
      
      const descriptions = {
        'Course': 'Khóa học Tiếng Anh chuyên sâu (IELTS, TOEIC, Giao tiếp, Ngữ pháp) trong hệ sinh thái EduPro English.',
        'Lesson': 'Chuyên đề bài học theo chuẩn khung tham chiếu châu Âu CEFR từ A1 đến C2.',
        'Topic': 'Chủ điểm ngôn ngữ trọng tâm: Ngữ âm IPA, 12 Thì, Collocations, Chiến thuật Đọc/Nghe & Viết luận.',
        'Skill': 'Kỹ năng đầu ra đạt được sau khi hoàn thành lộ trình học tập và vượt qua bài thi đánh giá.'
      };
      desc.textContent = (node.properties && (node.properties.name || node.properties.title)) || descriptions[node.group] || `Kỹ năng và chuẩn kiến thức Tiếng Anh: ${node.label}.`;

      card.classList.remove('hidden');
    }

    function askAiAboutTopic() {
      if (!currentSelectedNode) return;
      toggleAiChat();
      const prompt = `Giải thích lộ trình học và phương pháp làm chủ "${currentSelectedNode.label}" trong Tiếng Anh?`;
      sendQuickPrompt(prompt);
    }

    async function renderPrerequisiteRoute(lessonId) {
      try {
        const res = await fetch(`${API_BASE}/graph/learning-path/${lessonId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const box = document.getElementById('route-recommendation-box');
          const txt = document.getElementById('route-recommendation-text');
          const steps = json.data.map(i => i.title || i.id).join(' ➔ ');
          txt.innerHTML = `<strong>Lộ trình học tập đề xuất:</strong> Để đạt chuẩn năng lực <strong>${lessonId}</strong>, bạn nên hoàn thành các nội dung theo thứ tự: <span class="font-bold underline ml-1">${steps}</span>`;
          box.classList.remove('hidden');
        }
      } catch (err) {
        console.error('Lỗi lộ trình:', err);
      }
    }

    // 11. LỊCH SỬ KẾT QUẢ VÀ NÚT CHỨNG CHỈ (TÍNH NĂNG 1)

    // 16. CỤM TÍNH NĂNG BỔ SUNG 1: FLASHCARDS 3D & AUDIO DICTATION LAB
    // ==============================================================
    function speakText(text, lang = 'en-US', rate = 0.95) {
      if (!('speechSynthesis' in window)) {
        alert('Trình duyệt của bạn không hỗ trợ Web Speech API');
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = rate;
      window.speechSynthesis.speak(utter);
    }

    async function loadFlashcards() {
      try {
        const headers = currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {};
        const res = await fetch(`${API_BASE}/courses/flashcards/list`, { headers });
        const json = await res.json();
        if (json.success && json.data) {
          allFlashcards = json.data;
          updateFlashcardProgress(json.masteredCount || 0, json.totalCount || allFlashcards.length);
          renderFlashcardsGrid();
        }
      } catch (err) {
        console.error('Lỗi tải Flashcards:', err);
      }
    }

    function updateFlashcardProgress(masteredCount, totalCount) {
      const countEl = document.getElementById('vocab-mastered-counter') || document.getElementById('vocab-mastered-count');
      const barEl = document.getElementById('vocab-mastered-bar');
      if (countEl) countEl.textContent = `Đã thuộc: ${masteredCount} / ${totalCount} từ`;
      if (barEl) {
        const pct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
        barEl.style.width = `${pct}%`;
      }
    }

    function filterFlashcards(category, btnEl) {
      currentFlashcardFilter = category;
      document.querySelectorAll('.fc-filter-btn, .vocab-cat-btn').forEach(btn => {
        btn.className = 'fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all';
      });
      const targetBtn = btnEl || (event && event.target);
      if (targetBtn) {
        targetBtn.className = 'fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm transition-all';
      }
      renderFlashcardsGrid();
    }

    function renderFlashcardsGrid() {
      const grid = document.getElementById('flashcards-grid');
      if (!grid) return;
      const list = currentFlashcardFilter === 'ALL'
        ? allFlashcards
        : allFlashcards.filter(c => c.category === currentFlashcardFilter);

      let html = '';
      list.forEach(card => {
        const isMastered = Boolean(card.mastered || card.isMastered);
        const phonetic = card.phonetic || card.ipa || '';
        const pos = card.pos || card.type || 'Word';
        const meaning = card.meaning || card.meaningVi || '';
        const collocation = card.collocation || card.synonyms || '';
        const safeWord = (card.word || '').replace(/'/g, "\\'");
        const safeEx = (card.example || '').replace(/'/g, "\\'");
        html += `
          <div class="p-5 rounded-3xl border transition-all flex flex-col justify-between ${isMastered ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-400 shadow-sm hover:shadow-lg'}">
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-indigo-400">${card.category}</span>
                <div class="flex items-center gap-1">
                  <button onclick="speakText('${safeWord}', 'en-GB')" title="Phát âm chuẩn Anh-Anh (UK)" class="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-[10px] font-bold transition-all">
                    🔊 UK
                  </button>
                  <button onclick="speakText('${safeWord}', 'en-US')" title="Phát âm chuẩn Anh-Mỹ (US)" class="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-[10px] font-bold transition-all">
                    🔊 US
                  </button>
                </div>
              </div>

              <div class="mb-2">
                <h4 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">${card.word}</h4>
                <div class="text-xs font-mono text-brand-600 dark:text-indigo-400">${phonetic} <span class="text-slate-400">(${pos})</span></div>
              </div>

              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-3">
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">🇻🇳 ${meaning}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 italic">"${card.example}"</div>
                <button onclick="speakText('${safeEx}', 'en-US')" class="mt-1.5 text-[10px] font-bold text-brand-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  <i class="fa-solid fa-volume-low"></i> Nghe câu ví dụ
                </button>
              </div>

              <div class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                <strong>Collocation:</strong> <span class="font-mono text-slate-700 dark:text-slate-300">${collocation}</span>
              </div>

              <!-- 4 nút SRS Anki Mode (Redis ZSET Time-Queue) -->
              <div class="grid grid-cols-4 gap-1 mb-2.5">
                <button onclick="scheduleSrsReview('${card.id}', '${safeWord}', 'AGAIN')" class="py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-300 text-[10px] font-bold transition-all">Again 1p</button>
                <button onclick="scheduleSrsReview('${card.id}', '${safeWord}', 'HARD')" class="py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-300 text-[10px] font-bold transition-all">Hard 1d</button>
                <button onclick="scheduleSrsReview('${card.id}', '${safeWord}', 'GOOD')" class="py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-300 text-[10px] font-bold transition-all">Good 3d</button>
                <button onclick="scheduleSrsReview('${card.id}', '${safeWord}', 'EASY')" class="py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-300 text-[10px] font-bold transition-all">Easy 7d</button>
              </div>
            </div>

            <button onclick="toggleFlashcardMaster('${card.id}')" class="w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${isMastered ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300'}">
              <i class="fa-solid ${isMastered ? 'fa-circle-check' : 'fa-check'}"></i>
              <span>${isMastered ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
            </button>
          </div>
        `;
      });
      grid.innerHTML = html;
    }

    async function toggleFlashcardMaster(cardId) {
      if (!currentToken) { openLoginModal(); return; }
      try {
        const cardObj = allFlashcards.find(c => c.id === cardId);
        const res = await fetch(`${API_BASE}/courses/flashcards/master`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ cardId, word: cardObj ? cardObj.word : cardId })
        });
        const json = await res.json();
        if (json.success) {
          allFlashcards = allFlashcards.map(c =>
            c.id === cardId ? { ...c, mastered: json.mastered, isMastered: json.mastered } : c
          );
          updateFlashcardProgress(json.masteredCount, json.totalCount || allFlashcards.length);
          renderFlashcardsGrid();
        }
      } catch (err) {
        alert('Lỗi lưu từ vựng: ' + err.message);
      }
    }

    // AUDIO DICTATION LAB
    async function loadDictations() {
      try {
        const res = await fetch(`${API_BASE}/courses/dictation/list`);
        const json = await res.json();
        if (json.success && json.data) {
          allDictations = json.data;
          const select = document.getElementById('dictation-selector');
          if (select) {
            select.innerHTML = allDictations.map((d, idx) =>
              `<option value="${d.id}">Bài ${idx + 1}: ${d.topic || d.title} (${d.level})</option>`
            ).join('');
          }
          currentDictationItem = allDictations[0];
          updateDictationHintUI();
        }
      } catch (err) {
        console.error('Lỗi tải Dictation:', err);
      }
    }

    function selectDictationItem(dictId) {
      currentDictationItem = allDictations.find((d, idx) => d.id === dictId || String(idx) === String(dictId)) || allDictations[0];
      document.getElementById('dictation-user-input').value = '';
      updateDictationHintUI();
    }

    function updateDictationHintUI() {
      if (!currentDictationItem) return;
      const hintEl = document.getElementById('dictation-hint-text');
      const levelEl = document.getElementById('dictation-level-badge');
      if (hintEl) hintEl.textContent = `💡 Gợi ý nghĩa Tiếng Việt: ${currentDictationItem.hint}`;
      if (levelEl) levelEl.textContent = currentDictationItem.level;
    }

    function playDictationAudio(rate = 1.0) {
      if (!currentDictationItem) return;
      speakText(currentDictationItem.sentence || currentDictationItem.transcript, 'en-US', rate);
    }

    function fillSampleDictation() {
      if (!currentDictationItem) return;
      document.getElementById('dictation-user-input').value = currentDictationItem.sentence || currentDictationItem.transcript;
    }

    async function checkDictationAnswer() {
      if (!currentDictationItem) return;
      if (!currentToken) { openLoginModal(); return; }
      const userText = document.getElementById('dictation-user-input').value.trim();
      if (!userText) {
        alert('Vui lòng nhập nội dung bạn nghe được trước khi chấm điểm.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/courses/dictation/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ dictationId: currentDictationItem.id, userTranscript: userText, userText })
        });
        const json = await res.json();
        if (json.success) {
          const d = json.data || json;
          const words = d.wordComparison || d.wordDiff || [];
          const scoreBadge = document.getElementById('dictation-score-badge') || document.getElementById('dictation-accuracy-badge');
          if (scoreBadge) {
            scoreBadge.textContent = `Chính xác: ${d.accuracy}% (${d.matchedWords ?? d.matchedCount}/${d.totalWords} từ)`;
            scoreBadge.className = 'px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700';
          }
          const resultBox = document.getElementById('dictation-result-box');
          if (resultBox) {
            resultBox.innerHTML = `
              <div class="flex flex-wrap gap-1.5 mb-3">
                ${words.map(w => {
                  const ok = w.correct ?? w.isCorrect;
                  const label = w.word || w.expectedWord;
                  return `<span class="px-2.5 py-1 rounded-lg text-xs font-bold ${ok ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 underline decoration-wavy'}">${label}</span>`;
                }).join('')}
              </div>
              <div class="text-xs text-slate-600 dark:text-slate-300 font-semibold">🇻🇳 Dịch nghĩa: ${d.hint || d.vietnamese || currentDictationItem.hint}</div>
            `;
            resultBox.classList.remove('hidden');
          }
          loadTelemetryLogs();
        }
      } catch (err) {
        alert('Lỗi chấm bài Dictation: ' + err.message);
      }
    }

    // ==============================================================
    // 17. CỤM TÍNH NĂNG BỔ SUNG 2: AI IELTS WRITING & SPEAKING COACH
    // ==============================================================
    function updateEssayWordCount() {
      const textarea = document.getElementById('writing-essay-input');
      const badge = document.getElementById('writing-word-count');
      if (!textarea || !badge) return;
      const text = textarea.value.trim();
      const count = text ? text.split(/\s+/).length : 0;
      badge.textContent = `Số từ: ${count} words`;
    }

    function insertSampleBand8Essay() {
      const sample = `In the contemporary era, artificial intelligence and automated translation systems have revolutionized cross-border communication. While some people think that machine translation will render foreign language acquisition obsolete, I firmly believe that mastering a second language remains indispensable for cognitive development and deep cultural empathy.\n\nOn the one hand, it is undeniable that AI-powered translation tools offer unprecedented convenience. Travelers and international corporations can instantaneously decipher documents or hold basic conversations without spending years studying grammar and vocabulary. Nevertheless, relying solely on algorithms often strips communication of its subtle nuances, idioms, and emotional resonance.\n\nOn the other hand, learning a foreign language such as English cultivates critical thinking and executive brain function. Furthermore, in high-stakes diplomatic negotiations and academic leadership, speaking directly to counterparts fosters authentic trust that no electronic device can replicate. From a socioeconomic perspective, bilingual professionals consistently enjoy broader career prospects in the globalized workforce.\n\nIn conclusion, although translation technology serves as a valuable auxiliary tool, it cannot substitute the intellectual and interpersonal rewards of mastering a foreign language. Therefore, educational institutions should continue to prioritize comprehensive language curricula alongside digital literacy.`;
      document.getElementById('writing-essay-input').value = sample;
      updateEssayWordCount();
    }

    async function evaluateIeltsWriting() {
      if (!currentToken) { openLoginModal(); return; }
      const topicEl = document.getElementById('writing-topic-select') || document.getElementById('writing-prompt-select');
      const topic = topicEl ? topicEl.value : 'IELTS Task 2';
      const essayText = document.getElementById('writing-essay-input').value.trim();
      const btn = document.getElementById('btn-evaluate-writing');

      if (!essayText) {
        alert('Vui lòng nhập bài luận Tiếng Anh hoặc bấm nút "Chèn bài luận mẫu Band 8.0" để chấm thử!');
        return;
      }
      const wordsCount = essayText.split(/\s+/).filter(Boolean).length;
      if (wordsCount < 15) {
        alert('Bài luận quá ngắn (tối thiểu 15 từ để phân tích 4 tiêu chí). Chuẩn thi IELTS Task 2 khuyến nghị từ 250 từ trở lên.');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>AI đang phân tích 4 tiêu chí IELTS...</span>';

      try {
        const res = await fetch(`${API_BASE}/exams/writing/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ topic, promptTopic: topic, essayText })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const r = json.data;
          const tr = r.criteria.taskResponse || 7.5;
          const cc = r.criteria.coherence ?? r.criteria.coherenceCohesion ?? 7.5;
          const lr = r.criteria.lexical ?? r.criteria.lexicalResource ?? 7.5;
          const gra = r.criteria.grammar ?? r.criteria.grammaticalRange ?? 7.5;

          const overallEl = document.getElementById('writing-overall-band');
          if (overallEl) overallEl.textContent = `Band ${Number(r.overallBand).toFixed(1)}`;
          const trEl = document.getElementById('crit-tr') || document.getElementById('writing-tr-score');
          const ccEl = document.getElementById('crit-cc') || document.getElementById('writing-cc-score');
          const lrEl = document.getElementById('crit-lr') || document.getElementById('writing-lr-score');
          const graEl = document.getElementById('crit-gra') || document.getElementById('writing-gra-score');
          if (trEl) trEl.textContent = Number(tr).toFixed(1);
          if (ccEl) ccEl.textContent = Number(cc).toFixed(1);
          if (lrEl) lrEl.textContent = Number(lr).toFixed(1);
          if (graEl) graEl.textContent = Number(gra).toFixed(1);

          const fbBox = document.getElementById('writing-feedback-box') || document.getElementById('writing-ai-feedback');
          if (fbBox) {
            const feedbackHtml = Array.isArray(r.feedback)
              ? r.feedback.map(f => `<div class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">• ${f}</div>`).join('')
              : r.feedback;
            const upgradesHtml = (r.vocabularyUpgrades || []).map(u => `
              <div class="p-2 rounded-xl bg-emerald-50/60 dark:bg-slate-900 border border-emerald-200/60 dark:border-slate-800 flex items-center justify-between">
                <span class="line-through text-rose-500">${u.basic || u.original}</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">➔ ${u.band8 || u.upgrade}</span>
              </div>
            `).join('');
            fbBox.innerHTML = `${feedbackHtml}<div class="pt-2 font-bold text-slate-900 dark:text-white">Gợi ý nâng cấp từ vựng Band 8.0+:</div>${upgradesHtml}`;
          }
        }
      } catch (err) {
        alert('Lỗi chấm bài IELTS Writing: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Chấm Điểm Bài Viết</span>';
      }
    }

    // AI SPEAKING & PRONUNCIATION COACH
    function changeSpeakingSentence(sentence) {
      const disp = document.getElementById('speaking-target-display') || document.getElementById('speaking-target-sentence');
      if (disp) disp.textContent = `"${sentence}"`;
    }

    function playSpeakingTargetAudio() {
      const sel = document.getElementById('speaking-sentence-select');
      const target = sel ? sel.value : 'Artificial intelligence is transforming global education.';
      speakText(target, 'en-US', 0.95);
    }

    function startSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const sel = document.getElementById('speaking-sentence-select');
      const targetSentence = sel ? sel.value : 'Artificial intelligence is transforming global education.';
      if (!SpeechRecognition) {
        simulateSpeakingCheck();
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      recognition.onresult = async (event) => {
        const spokenSentence = event.results[0][0].transcript;
        await submitSpeakingEvaluation(targetSentence, spokenSentence);
      };
      recognition.onerror = () => simulateSpeakingCheck();
    }

    async function simulateSpeakingCheck() {
      const sel = document.getElementById('speaking-sentence-select');
      const targetSentence = sel ? sel.value : 'Artificial intelligence is transforming global education.';
      await submitSpeakingEvaluation(targetSentence, targetSentence);
    }

    async function submitSpeakingEvaluation(targetSentence, spokenSentence) {
      if (!currentToken) { openLoginModal(); return; }
      try {
        const res = await fetch(`${API_BASE}/exams/speaking/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ targetSentence, spokenText: spokenSentence, spokenSentence })
        });
        const json = await res.json();
        if (json.success) {
          const d = json.data || json;
          const score = d.accuracy ?? d.pronunciationScore ?? 100;
          const badge = document.getElementById('speaking-score-badge');
          if (badge) badge.textContent = `Pronunciation: ${score}% • Band ${d.estimatedBand}`;
          const resBox = document.getElementById('speaking-result-box') || document.getElementById('speaking-words-feedback');
          if (resBox) {
            resBox.innerHTML = `
              <div class="flex flex-wrap gap-1.5 mb-2">
                ${(d.wordBreakdown || []).map(w => {
                  const ok = w.correct ?? w.matched;
                  return `<span class="px-2.5 py-1 rounded-lg text-xs font-bold ${ok ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 text-rose-700'}">${w.word}</span>`;
                }).join('')}
              </div>
              <div class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">${d.pronunciationTip || 'Phát âm chuẩn xác!'}</div>
            `;
            resBox.classList.remove('hidden');
          }
        }
      } catch (err) {
        alert('Lỗi chấm phát âm: ' + err.message);
      }
    }

    // ==============================================================
    // 18. CỤM TÍNH NĂNG BỔ SUNG 3: MULTI-EXAM, PRACTICE MODE & BOOKMARKS
    // ==============================================================
    function selectExamFromCatalog(examId, btnElem) {
      EXAM_ID = examId;
      document.querySelectorAll('.exam-cat-card, .exam-catalog-btn').forEach(card => {
        card.className = 'exam-cat-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-brand-400 transition-all';
      });
      if (btnElem) {
        btnElem.className = 'exam-cat-card p-4 rounded-2xl border-2 border-brand-600 bg-brand-50/60 dark:bg-brand-950/30 text-left transition-all';
      }
      startExam();
    }

    function togglePracticeMode(checked) {
      const cb = document.getElementById('practice-mode-checkbox');
      isPracticeMode = typeof checked === 'boolean' ? checked : (cb ? cb.checked : !isPracticeMode);
      renderExamQuestions();
    }

    async function toggleQuestionBookmark(questionId) {
      if (!currentToken) { openLoginModal(); return; }
      try {
        const res = await fetch(`${API_BASE}/exams/bookmarks/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
          body: JSON.stringify({ questionId })
        });
        const json = await res.json();
        if (json.success) {
          bookmarkedQuestionIds = json.bookmarkedIds || json.bookmarks || [];
          renderExamQuestions();
          loadBookmarkedQuestions();
        }
      } catch (err) {
        console.error('Lỗi bookmark câu hỏi:', err);
      }
    }

    async function loadBookmarkedQuestions() {
      if (!currentToken) return;
      try {
        const res = await fetch(`${API_BASE}/exams/bookmarks/my`, {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const json = await res.json();
        if (json.success) {
          const list = json.data || [];
          bookmarkedQuestionIds = json.bookmarkedIds || list.map(q => String(q._id));
          const countBadge = document.getElementById('bookmark-count-badge');
          const box = document.getElementById('bookmarked-questions-list');
          if (countBadge) countBadge.textContent = list.length;
          if (!box) return;

          if (list.length === 0) {
            box.innerHTML = '<div class="text-center py-4 text-slate-400 text-xs">Nhấn biểu tượng 🔖 trên câu hỏi để lưu vào sổ tay ôn tập.</div>';
            return;
          }

          box.innerHTML = list.map(q => `
            <div class="p-3 rounded-2xl bg-rose-50/50 dark:bg-slate-800/70 border border-rose-200/70 dark:border-slate-700 text-xs">
              <div class="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mb-1">${q.content}</div>
              <div class="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Đáp án đúng: ${q.correctAnswer || q.correctOption}</span>
                <button onclick="toggleQuestionBookmark('${q._id}')" class="text-rose-500 hover:underline">Bỏ lưu</button>
              </div>
            </div>
          `).join('');
        }
      } catch (err) {
        console.error('Lỗi tải sổ tay câu hỏi:', err);
      }
    }

    // ==============================================================

    // TÍNH NĂNG GIAI ĐOẠN 2 (6 TÍNH NĂNG NÂNG CAO ĐA CSDL NOSQL)
    // ==============================================================

    // --- TÍNH NĂNG 1: ĐẤU TRƯỜNG PHẢN XẠ TỪ VỰNG TỐC ĐỘ 60 GIÂY (WORD ARENA - REDIS ZSET + CASSANDRA) ---
    var arenaInterval = null;

    const ARENA_QUESTION_POOL = [
      { word: 'Mitigate', phonetic: '/ˈmɪt.ɪ.ɡeɪt/ • Verb', options: ['Làm giảm nhẹ, xoa dịu tác động xấu', 'Tăng vọt đột biến về số lượng', 'Trì hoãn sang thời điểm khác', 'Đồng thuận 100% trong cuộc họp'], answer: 0 },
      { word: 'Ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/ • Adj', options: ['Hiếm gặp và khó tìm', 'Hiện diện ở khắp mọi nơi, phổ biến', 'Thuộc về tài chính ngân hàng', 'Mang tính tạm thời ngắn hạn'], answer: 1 },
      { word: 'Plummet', phonetic: '/ˈplʌm.ɪt/ • Verb', options: ['Tăng trưởng bền vững', 'Giữ nguyên mức trung bình', 'Sụt giảm mạnh, lao dốc đứng', 'Mở rộng chi nhánh quốc tế'], answer: 2 },
      { word: 'Remuneration', phonetic: '/rɪˌmjuː.nərˈeɪ.ʃən/ • Noun', options: ['Hợp đồng thuê mặt bằng', 'Tiền lương, thù lao và đãi ngộ', 'Biên bản kỷ luật nhân sự', 'Chiến dịch quảng cáo thương hiệu'], answer: 1 },
      { word: 'Call off', phonetic: '/kɔːl ɒf/ • Phrasal Verb', options: ['Gọi điện thoại khẩn cấp', 'Tiếp tục triển khai dự án', 'Hủy bỏ (cuộc họp, sự kiện)', 'Bổ nhiệm trưởng phòng mới'], answer: 2 },
      { word: 'Deteriorate', phonetic: '/dɪˈtɪə.ri.ə.reɪt/ • Verb', options: ['Cải thiện vượt bậc', 'Xuống cấp, trở nên tồi tệ hơn', 'Bảo tồn nguyên trạng', 'Hợp tác song phương'], answer: 1 },
      { word: 'Unanimous', phonetic: '/juːˈnæn.ɪ.məs/ • Adj', options: ['Bất đồng quan điểm gay gắt', 'Đồng thuận hoàn toàn (100% nhất trí)', 'Chưa đưa ra quyết định cuối', 'Thiếu minh bạch tài chính'], answer: 1 },
      { word: 'Comply with', phonetic: '/kəmˈplaɪ wɪð/ • Phrasal Verb', options: ['Tuân thủ nghiêm ngặt quy định/luật lệ', 'Phản đối đề xuất mới', 'Thay thế thiết bị hỏng', 'Cắt giảm ngân sách vận hành'], answer: 0 }
    ];

    async function loadWordArenaLeaderboard() {
      const box = document.getElementById('arena-leaderboard-list');
      if (!box) return;
      try {
        const res = await fetch(`${API_BASE}/courses/arena/leaderboard`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          box.innerHTML = json.data.map((item, idx) => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/10">
              <div class="flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-lg ${idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-300'} font-black text-[11px] flex items-center justify-center">#${item.rank || (idx + 1)}</span>
                <div>
                  <div class="font-bold text-white text-xs">${item.fullName}</div>
                  <div class="text-[10px] text-indigo-200">${item.badge || '⚡ Speedster'}</div>
                </div>
              </div>
              <span class="font-mono font-black text-amber-300 text-sm">${item.score} pts</span>
            </div>
          `).join('');
        }
      } catch (e) {}
    }

    function startWordArenaGame() {
      arenaScore = 0;
      arenaCombo = 1;
      arenaTimeLeft = 60;
      document.getElementById('arena-score').innerText = '0';
      document.getElementById('arena-combo').innerText = 'x1';
      document.getElementById('arena-timer').innerText = '60s';
      document.getElementById('arena-feedback-status').innerText = '🔥 Đang thi đấu! Chọn nhanh đáp án đúng!';
      if (arenaInterval) clearInterval(arenaInterval);
      nextWordArenaQuestion();
      arenaInterval = setInterval(() => {
        arenaTimeLeft--;
        const timerEl = document.getElementById('arena-timer');
        if (timerEl) timerEl.innerText = `${arenaTimeLeft}s`;
        if (arenaTimeLeft <= 0) {
          clearInterval(arenaInterval);
          arenaInterval = null;
          document.getElementById('arena-feedback-status').innerText = `🏁 Hết giờ! Tổng điểm: ${arenaScore} pts`;
          document.querySelectorAll('#arena-options-grid button').forEach(b => {
            b.disabled = true;
            b.classList.add('opacity-50', 'cursor-not-allowed');
          });
          submitWordArenaScore();
        }
      }, 1000);
    }

    function nextWordArenaQuestion() {
      const q = ARENA_QUESTION_POOL[Math.floor(Math.random() * ARENA_QUESTION_POOL.length)];
      currentArenaQuestion = q;
      document.getElementById('arena-target-word').innerText = q.word;
      document.getElementById('arena-word-phonetic').innerText = q.phonetic;
      const grid = document.getElementById('arena-options-grid');
      const labels = ['A', 'B', 'C', 'D'];
      grid.innerHTML = q.options.map((opt, idx) => `
        <button onclick="answerWordArena(${idx})" class="p-3.5 rounded-xl bg-white/10 hover:bg-indigo-600/60 border border-white/15 text-left text-xs font-bold transition-all text-white">
          <span class="text-amber-300 mr-1.5">${labels[idx]}.</span> ${opt}
        </button>
      `).join('');
    }

    function answerWordArena(choiceIdx) {
      if (arenaTimeLeft <= 0 || !arenaInterval) return; // Constraint: Cannot answer when game ended
      if (!currentArenaQuestion) {
        nextWordArenaQuestion();
        return;
      }
      const feedbackEl = document.getElementById('arena-feedback-status');
      if (choiceIdx === currentArenaQuestion.answer) {
        const gained = 100 * arenaCombo;
        arenaScore += gained;
        arenaCombo = Math.min(3, arenaCombo + 1);
        document.getElementById('arena-score').innerText = arenaScore;
        document.getElementById('arena-combo').innerText = `x${arenaCombo}`;
        feedbackEl.innerText = `✅ Chính xác! +${gained} pts (Combo x${arenaCombo})`;
        feedbackEl.className = 'text-xs font-bold text-emerald-300';
      } else {
        arenaCombo = 1;
        document.getElementById('arena-combo').innerText = 'x1';
        feedbackEl.innerText = `❌ Sai rồi! Reset Combo về x1`;
        feedbackEl.className = 'text-xs font-bold text-rose-400';
      }
      nextWordArenaQuestion();
    }

    async function submitWordArenaScore() {
      const scoreToSubmit = arenaScore;
      try {
        const res = await fetch(`${API_BASE}/courses/arena/submit-score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
          },
          body: JSON.stringify({ score: scoreToSubmit, comboMax: arenaCombo })
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.leaderboard)) {
          loadWordArenaLeaderboard();
          document.getElementById('arena-feedback-status').innerText = `🏆 Đã cộng ${scoreToSubmit} điểm vào bảng xếp hạng!`;
        }
      } catch (e) {}
    }

    // --- TÍNH NĂNG 2: POPUP TRA TỪ ĐIỂN TỨC THÌ KHI BÔI ĐEN VĂN BẢN (REDIS HASH CACHE + MONGODB CUSTOM FLASHCARD) ---
    let currentDictPopupData = null;

    function initInstantHighlightDictionary() {
      document.addEventListener('dblclick', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('#instant-dict-popup'))) return;
        const selected = window.getSelection().toString().trim();
        if (selected && /^[a-zA-Z\-]{3,24}$/.test(selected)) {
          showInstantDictPopup(selected, e.clientX, e.clientY);
        }
      });
    }

    function lookupWordFromInput() {
      const input = document.getElementById('quick-dict-search-input');
      const word = (input ? input.value.trim() : '') || 'ubiquitous';
      showInstantDictPopup(word, window.innerWidth / 2 - 160, 180);
    }

    async function showInstantDictPopup(word, clientX, clientY) {
      const popup = document.getElementById('instant-dict-popup');
      if (!popup) return;
      try {
        const res = await fetch(`${API_BASE}/courses/dictionary/lookup?word=${encodeURIComponent(word)}`);
        const json = await res.json();
        if (json.success && json.data) {
          currentDictPopupData = json.data;
          document.getElementById('dict-popup-word').innerText = json.data.word;
          document.getElementById('dict-popup-pos').innerText = `${json.data.pos} • ${json.data.cefr || 'B2'}`;
          document.getElementById('dict-popup-phonetic').innerText = json.data.phonetic;
          document.getElementById('dict-popup-meaning').innerText = `🇻🇳 ${json.data.meaning}`;
          document.getElementById('dict-popup-example').innerText = `"${json.data.example}"`;
          document.getElementById('dict-popup-source').innerText = '⚡ Tra cứu tức thì';

          const left = Math.min(Math.max(16, clientX || 200), window.innerWidth - 340);
          const top = Math.min(Math.max(16, (clientY || 180) + 14), window.innerHeight - 230);
          popup.style.left = `${left}px`;
          popup.style.top = `${top}px`;
          popup.classList.remove('hidden');
        }
      } catch (e) {}
    }

    function hideInstantDictPopup() {
      const popup = document.getElementById('instant-dict-popup');
      if (popup) popup.classList.add('hidden');
    }

    function speakDictPopupWord(lang) {
      const word = document.getElementById('dict-popup-word')?.innerText || 'Ubiquitous';
      speakText(word, lang || 'en-GB');
    }

    async function saveDictWordToCustomFlashcard() {
      if (!currentDictPopupData) return;
      try {
        const res = await fetch(`${API_BASE}/courses/flashcards/custom`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
          },
          body: JSON.stringify(currentDictPopupData)
        });
        const json = await res.json();
        if (json.success) {
          document.getElementById('dict-popup-source').innerText = '✅ Đã thêm vào bộ Flashcard!';
          loadFlashcards();
        }
      } catch (e) {}
    }

    // --- TÍNH NĂNG 3: DIỄN ĐÀN HỎI ĐÁP HỌC THUẬT Q&A (MONGODB DISCUSSIONS + REDIS UPVOTE) ---
    async function loadCourseDiscussions(courseId) {
      const cid = courseId || currentClassroomCourseId || '670000000000000000000010';
      const box = document.getElementById('classroom-discussions-list');
      if (!box) return;
      try {
        const res = await fetch(`${API_BASE}/courses/${cid}/discussions`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          box.innerHTML = json.data.map(d => `
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">${d.title}</span>
                    ${d.isVerified ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"><i class="fa-solid fa-check mr-0.5"></i> Giảng viên xác nhận</span>` : ''}
                  </div>
                  <div class="text-[11px] text-slate-400">Đăng bởi <strong>${d.authorName}</strong> (${d.authorRole})</div>
                </div>
                <button onclick="upvoteDiscussion('${d._id}')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-brand-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 shrink-0">
                  <i class="fa-solid fa-thumbs-up"></i> <span id="upvote-count-${d._id}">${d.upvotes || 0}</span>
                </button>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${d.content}</p>
              ${Array.isArray(d.replies) && d.replies.length > 0 ? `
                <div class="pl-3 border-l-2 border-emerald-500 space-y-1.5 pt-1">
                  ${d.replies.map(r => `
                    <div class="text-xs bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-xl">
                      <span class="font-bold text-emerald-700 dark:text-emerald-300">${r.authorName}:</span>
                      <span class="text-slate-700 dark:text-slate-200 ml-1">${r.content}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('');
        }
      } catch (e) {}
    }

    async function submitCourseDiscussion() {
      const cid = currentClassroomCourseId || '670000000000000000000010';
      const titleEl = document.getElementById('qa-question-title');
      const contentEl = document.getElementById('qa-question-content');
      const title = titleEl ? titleEl.value.trim() : '';
      const content = contentEl ? contentEl.value.trim() : '';
      if (!title || !content) {
        alert('Vui lòng nhập tiêu đề và nội dung câu hỏi!');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/courses/${cid}/discussions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
          },
          body: JSON.stringify({ title, content })
        });
        const json = await res.json();
        if (json.success) {
          titleEl.value = '';
          contentEl.value = '';
          loadCourseDiscussions(cid);
        }
      } catch (e) {}
    }

    async function upvoteDiscussion(discussionId) {
      try {
        const res = await fetch(`${API_BASE}/courses/discussions/${discussionId}/upvote`, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          const el = document.getElementById(`upvote-count-${discussionId}`);
          if (el) el.innerText = json.upvotes;
        }
      } catch (e) {}
    }

    // --- TÍNH NĂNG 4: HỆ THỐNG ÔN TẬP NGẮT QUÃNG THÔNG MINH (SRS ANKI MODE - REDIS ZSET TIME-QUEUE) ---
    async function loadSrsDueQueue() {
      const badgeEl = document.getElementById('srs-due-badge');
      const pillsEl = document.getElementById('srs-due-words-pills');
      if (!badgeEl || !pillsEl) return;
      try {
        const res = await fetch(`${API_BASE}/courses/flashcards/srs-due`, {
          headers: currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {}
        });
        const json = await res.json();
        if (json.success && json.data) {
          badgeEl.innerText = `${json.data.dueCount || 0} từ đến hạn ôn`;
          const list = json.data.schedule || [];
          pillsEl.innerHTML = list.slice(0, 6).map(item => {
            const cardObj = allFlashcards.find(c => c.id === item.cardId);
            const wordDisplay = cardObj ? cardObj.word : (item.word || item.cardId);
            return `
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${item.isDue ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}">
                ${wordDisplay} • ${item.isDue ? 'Đến hạn ôn' : item.intervalLabel}
              </span>
            `;
          }).join('');
        }
      } catch (e) {}
    }

    async function scheduleSrsReview(cardId, word, rating) {
      try {
        const res = await fetch(`${API_BASE}/courses/flashcards/srs-review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
          },
          body: JSON.stringify({ cardId, word, rating })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const badgeEl = document.getElementById('srs-due-badge');
          if (badgeEl) badgeEl.innerText = `Đã xếp lịch "${word}" (${json.data.intervalLabel})`;
          loadSrsDueQueue();
        }
      } catch (e) {}
    }

    // --- TÍNH NĂNG 5: BIỂU ĐỒ NHIỆT HOẠT ĐỘNG HỌC TẬP 84 NGÀY (CASSANDRA TIME-SERIES HEATMAP) ---
    async function loadCassandraHeatmap() {
      const grid = document.getElementById('cassandra-heatmap-grid');
      const badge = document.getElementById('heatmap-summary-badge');
      if (!grid) return;
      try {
        const res = await fetch(`${API_BASE}/courses/events/heatmap`, {
          headers: currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {}
        });
        const json = await res.json();
        if (json.success && json.data) {
          if (badge) {
            badge.innerText = `${json.data.totalActiveDays} ngày học tập • ${json.data.totalEvents} hoạt động`;
          }
          const colorMap = [
            'bg-slate-200 dark:bg-slate-700',
            'bg-emerald-200 dark:bg-emerald-900',
            'bg-emerald-400 dark:bg-emerald-700',
            'bg-emerald-500 dark:bg-emerald-500',
            'bg-emerald-700 dark:bg-emerald-300'
          ];
          grid.innerHTML = (json.data.days || []).map(d => `
            <div title="Ngày ${d.date}: ${d.count} hoạt động học tập" class="w-3.5 h-3.5 rounded-sm ${colorMap[d.intensity] || colorMap[0]} hover:scale-125 transition-transform cursor-pointer"></div>
          `).join('');
        }
      } catch (e) {}
    }

    async function logStudyActionAndRefreshHeatmap() {
      await sendTelemetry('DAILY_STUDY_CHECKIN', 600);
      await loadCassandraHeatmap();
    }

    // --- TÍNH NĂNG 6: AI CỐ VẤN LỘ TRÌNH CÁ NHÂN HÓA THEO ĐIỂM THI & MỤC TIÊU (NEO4J SHORTEST PATH) ---
    async function generateAdaptiveRoadmap() {
      const currentLevel = document.getElementById('adaptive-current-level')?.value || 'A2';
      const targetGoal = document.getElementById('adaptive-target-goal')?.value || 'IELTS_75';
      const durationMonths = Number(document.getElementById('adaptive-duration-months')?.value || 3);
      const box = document.getElementById('adaptive-roadmap-result');
      if (!box) return;
      try {
        const res = await fetch(`${API_BASE}/graph/adaptive-roadmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentLevel, targetGoal, durationMonths })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const steps = json.data.recommendedSteps || [];
          box.innerHTML = steps.slice(0, 3).map((s, idx) => `
            <div class="p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between text-[11px] font-bold text-amber-300 mb-1">
                  <span>CHẶNG ${idx + 1} • CEFR ${s.cefr}</span>
                  <span>Tuần ${s.estimatedWeeks}</span>
                </div>
                <h5 class="font-extrabold text-sm text-white mb-1">${s.title}</h5>
                <p class="text-xs text-slate-300 leading-relaxed">Trọng tâm: <strong>${s.focusSkill}</strong> (${s.weeklyHours} giờ/tuần)</p>
              </div>
              <div class="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span class="text-emerald-300 font-mono"><i class="fa-solid fa-diagram-project mr-1"></i>Node: ${s.id}</span>
                <button onclick="renderPrerequisiteRoute('${s.id}')" class="text-indigo-300 hover:text-white font-bold underline">Tô sáng trên Đồ thị</button>
              </div>
            </div>
          `).join('');
        }
      } catch (e) {}
    }

    // --- PHÂN HỆ QUẢN TRỊ VIÊN: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN HỆ THỐNG (ROLE ADMIN - MONGODB) ---
    async function loadAdminUsersList() {
      const tbody = document.getElementById('admin-users-table-body');
      if (!tbody) return;
      try {
        const res = await fetch(`${API_BASE}/auth/users`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const badge = document.getElementById('admin-users-count-badge');
          if (badge) badge.innerText = `${json.total || json.data.length} tài khoản trong CSDL`;
          tbody.innerHTML = json.data.map(u => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="py-3.5 px-4 flex items-center gap-3">
                <img src="${u.avatar || (u.role === 'ADMIN' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80')}" class="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">${u.fullName || u.username}</div>
                  <div class="text-[10px] text-slate-400 font-mono">@${u.username}</div>
                </div>
              </td>
              <td class="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">${u.email || 'N/A'}</td>
              <td class="py-3.5 px-4">
                <select onchange="updateUserRole('${u._id}', this.value)" class="px-2.5 py-1.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${u.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800' : u.role === 'TEACHER' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}">
                  <option value="STUDENT" ${u.role === 'STUDENT' ? 'selected' : ''}>STUDENT (Học viên)</option>
                  <option value="TEACHER" ${u.role === 'TEACHER' ? 'selected' : ''}>TEACHER (Giảng viên)</option>
                  <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN (Quản trị viên)</option>
                </select>
              </td>
              <td class="py-3.5 px-4 text-center">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>ACTIVE
                </span>
              </td>
              <td class="py-3.5 px-4 text-right text-[11px] text-slate-400 font-mono">
                ${u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}
              </td>
            </tr>
          `).join('');
        }
      } catch (e) {
        console.error('Lỗi load users:', e);
      }
    }

    async function updateUserRole(userId, newRole) {
      try {
        const res = await fetch(`${API_BASE}/auth/users/${userId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        });
        const json = await res.json();
        if (json.success) {
          alert(`Đã cập nhật phân quyền tài khoản thành công sang: ${newRole}`);
          loadAdminUsersList();
        } else {
          alert('Lỗi: ' + json.message);
        }
      } catch (e) {
        alert('Lỗi kết nối: ' + e.message);
      }
    }

    // ==============================================================
    // GIAI ĐOẠN 3: 6 TÍNH NĂNG ĐỘT PHÁ ENTERPRISE & AI CO-PILOT
    // ==============================================================

    // --- TÍNH NĂNG 1: CÂY KỸ NĂNG HỌC THUẬT PHONG CÁCH RPG (CEFR SKILL TREE - NEO4J & MONGODB) ---
    async function loadSkillTreeData() {
      const grid = document.getElementById('skill-tree-grid');
      const badge = document.getElementById('skill-tree-mastered-badge');
      if (!grid) return;
      try {
        const res = await fetch(`${API_BASE}/graph/skill-tree`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const masteredCount = json.data.filter(s => s.status === 'MASTERED').length;
          if (badge) badge.innerText = `${masteredCount}/${json.data.length} Kỹ năng đã Master`;
          grid.innerHTML = json.data.map(s => {
            const isMastered = s.status === 'MASTERED';
            const isInProgress = s.status === 'IN_PROGRESS';
            const isUnlocked = s.status === 'UNLOCKED';
            const isLocked = s.status === 'LOCKED';

            const borderClass = isMastered 
              ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' 
              : (isInProgress ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20' : (isUnlocked ? 'border-brand-500 bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 opacity-70'));

            const badgeColor = isMastered 
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
              : (isInProgress ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : (isUnlocked ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'));

            const statusText = isMastered ? 'MASTERED (100%)' : (isInProgress ? `ĐANG LUYỆN (${s.progress}%)` : (isUnlocked ? 'MỞ KHÓA' : 'ĐANG KHÓA 🔒'));

            return `
              <div class="p-5 rounded-2xl border-2 ${borderClass} flex flex-col justify-between space-y-4 transition-all hover:shadow-lg">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}">
                      TIER ${s.tier} • ${s.cefr}
                    </span>
                    <span class="text-xs font-mono font-bold text-amber-500">+${s.xpReward} XP</span>
                  </div>
                  <div class="flex items-center gap-2.5 mb-1.5">
                    <div class="w-8 h-8 rounded-xl ${isMastered ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-indigo-400'} flex items-center justify-center text-sm shrink-0">
                      <i class="fa-solid ${s.icon}"></i>
                    </div>
                    <h5 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">${s.name}</h5>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">${s.desc}</p>
                </div>

                <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500 ${isMastered ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${s.progress}%"></div>
                  </div>
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-bold text-slate-600 dark:text-slate-300">${statusText}</span>
                    ${!isMastered ? `
                      <button onclick="unlockSkillTreeNode('${s.id}')" class="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-[10px] transition-all">
                        ${isLocked ? 'Mở khóa ngay' : 'Luyện tập'}
                      </button>
                    ` : '<span class="text-emerald-500 font-bold text-[10px]"><i class="fa-solid fa-circle-check"></i> Đạt chuẩn</span>'}
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      } catch (e) {}
    }

    async function unlockSkillTreeNode(skillId) {
      try {
        const res = await fetch(`${API_BASE}/graph/skill-tree/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId })
        });
        const json = await res.json();
        if (json.success) {
          alert(json.message);
          loadSkillTreeData();
        }
      } catch (e) {
        alert('Lỗi: ' + e.message);
      }
    }

    // --- TÍNH NĂNG 2: GIÁM SÁT GIAN LẬN THI TRỰC TUYẾN (ANTI-CHEAT FOCUS TRACKER) ---
    var antiCheatListenerInitialized = false;

    function initAntiCheatMonitoring() {
      if (antiCheatListenerInitialized) return;
      antiCheatListenerInitialized = true;

      document.addEventListener('visibilitychange', () => {
        const examSection = document.getElementById('section-exam');
        if (examSection && !examSection.classList.contains('hidden') && document.hidden) {
          logAntiCheatViolation('TAB_SWITCH_OR_MINIMIZE');
        }
      });
    }

    async function logAntiCheatViolation(reason) {
      if (isExamDisqualified) return; // Strict lock: no more increments after 3
      try {
        const res = await fetch(`${API_BASE}/exams/anti-cheat/log-violation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
          },
          body: JSON.stringify({ reason: reason || 'FOCUS_LOST', examId: EXAM_ID })
        });
        const json = await res.json();
        if (json.success) {
          // Strict Constraint: Clamp violation count to max 3
          const violationCount = Math.min(3, json.violationCount || 1);
          const isDisqualified = Boolean(json.isDisqualified || violationCount >= 3);

          const badge = document.getElementById('anti-cheat-status-badge');
          if (badge) {
            if (isDisqualified) {
              badge.innerText = 'ĐÌNH CHỈ (3/3)';
              badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse shadow-sm';
            } else {
              badge.innerText = `CẢNH BÁO (${violationCount}/3)`;
              badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse';
            }
          }

          const countEl = document.getElementById('anti-cheat-modal-count');
          if (countEl) countEl.innerText = isDisqualified ? '3/3 (ĐÃ ĐẠT GIỚI HẠN)' : `${violationCount}/3`;

          const modalTitle = document.getElementById('anti-cheat-modal-title');
          const modalDesc = document.getElementById('anti-cheat-modal-desc');
          const btnText = document.getElementById('anti-cheat-btn-text');
          const btnIcon = document.getElementById('anti-cheat-btn-icon');
          const modalBtn = document.getElementById('anti-cheat-modal-btn');

          if (isDisqualified) {
            isExamDisqualified = true;
            if (modalTitle) modalTitle.innerText = 'ĐÌNH CHỈ THI - BÀI THI ĐÃ BỊ THU HỒI';
            if (modalDesc) modalDesc.innerText = 'Bạn đã vi phạm quy chế rời màn hình làm bài 3/3 lần. Hệ thống đã tự động khóa và thu bài thi của bạn theo đúng quy chế thi cử.';
            if (btnText) btnText.innerText = 'Xem Biên Bản Vi Phạm & Kết Quả';
            if (btnIcon) btnIcon.className = 'fa-solid fa-file-lines text-xs';
            if (modalBtn) modalBtn.className = 'w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2';

            // Disable all inputs in exam questions
            document.querySelectorAll('#exam-questions-box input').forEach(input => {
              input.disabled = true;
            });
            const demoBtn = document.getElementById('btn-demo-violation');
            if (demoBtn) demoBtn.disabled = true;

            clearInterval(examCountdown);
            submitExam(true);
          } else {
            if (modalTitle) modalTitle.innerText = 'Cảnh Báo Vi Phạm Quy Chế Thi';
            if (modalDesc) modalDesc.innerText = 'Bạn vừa chuyển tab hoặc rời màn hình làm bài thi. Hành vi này đã được ghi nhận vào nhật ký kiểm toán hệ thống.';
            if (btnText) btnText.innerText = 'Tôi Đã Hiểu & Quay Lại Làm Bài Ngay';
            if (btnIcon) btnIcon.className = 'fa-solid fa-rotate-left text-xs';
            if (modalBtn) modalBtn.className = 'w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2';
          }

          const modal = document.getElementById('anti-cheat-modal');
          if (modal) modal.classList.remove('hidden');
        }
      } catch (e) {}
    }

    function simulateTabSwitchViolation() {
      if (isExamDisqualified) return;
      logAntiCheatViolation('DEMO_TAB_SWITCH_VIOLATION');
    }

    function closeAntiCheatModal() {
      const modal = document.getElementById('anti-cheat-modal');
      if (modal) modal.classList.add('hidden');
      if (isExamDisqualified) {
        const resultCard = document.getElementById('exam-result-card');
        if (resultCard) {
          resultCard.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }

    // --- TÍNH NĂNG 3: CHẨN ĐOÁN LỖ HỔNG KIẾN THỨC TỰ ĐỘNG (AI WEAKNESS DIAGNOSTICS) ---
    async function loadWeaknessDiagnosticData() {
      const summaryBox = document.getElementById('diagnostic-summary-box');
      const domainsGrid = document.getElementById('diagnostic-domains-grid');
      const stepsBox = document.getElementById('diagnostic-remedy-steps');
      if (!summaryBox || !domainsGrid) return;

      try {
        const res = await fetch(`${API_BASE}/courses/analytics/weakness-diagnostic`);
        const json = await res.json();
        if (json.success && json.weaknesses) {
          summaryBox.innerHTML = `
            <div class="flex items-start gap-3">
              <i class="fa-solid fa-brain text-brand-600 dark:text-indigo-400 text-lg mt-0.5"></i>
              <div>
                <div class="font-bold text-slate-900 dark:text-white mb-0.5">Đánh Giá Tổng Quan Từ AI Diagnostic Engine:</div>
                <div>${json.overallAssessment}</div>
              </div>
            </div>
          `;

          domainsGrid.innerHTML = json.weaknesses.map(w => `
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-900 dark:text-white">${w.domain}</span>
                <span class="font-mono font-bold ${w.severity === 'HIGH' ? 'text-rose-500' : (w.severity === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500')}">
                  Tỷ lệ sai: ${w.errorRate}%
                </span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full ${w.severity === 'HIGH' ? 'bg-rose-500' : (w.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${w.errorRate}%"></div>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 italic">${w.note}</p>
              <div class="pt-1.5 flex items-center justify-between text-[11px]">
                <span class="text-brand-600 dark:text-indigo-400 font-semibold line-clamp-1">${w.remedyTitle}</span>
                <button onclick="enterClassroom('${w.remedyCourseId}')" class="text-xs font-bold text-brand-600 dark:text-indigo-400 hover:underline shrink-0">Học ngay</button>
              </div>
            </div>
          `).join('');

          if (stepsBox && Array.isArray(json.remedySteps)) {
            stepsBox.innerHTML = json.remedySteps.map(step => `
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                <span>${step}</span>
              </div>
            `).join('');
          }
        }
      } catch (e) {}
    }

    // --- TÍNH NĂNG 4: BẢN ĐỒ MẠNG NHỆN TỪ VỰNG & CỤM TỪ (COLLOCATIONS SPIDER MINDMAP) ---
    async function loadCollocationMindmap(word) {
      const targetWord = word || 'problem';
      const container = document.getElementById('collocation-mindmap-container');
      if (!container) return;
      try {
        const res = await fetch(`${API_BASE}/graph/collocations-mindmap/${targetWord}`);
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          container.innerHTML = (d.branches || []).map(b => `
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span class="w-3 h-3 rounded-full" style="background-color: ${b.color}"></span>
                <h5 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">${b.type}</h5>
              </div>
              <div class="space-y-2">
                ${b.items.map(it => `
                  <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-xs text-brand-600 dark:text-indigo-400">${it.phrase}</span>
                      <button onclick="speakText('${it.phrase.replace(/'/g, "\\'")}', 'en-GB')" class="text-slate-400 hover:text-brand-600 text-xs">
                        <i class="fa-solid fa-volume-high"></i>
                      </button>
                    </div>
                    <div class="text-[11px] font-semibold text-slate-700 dark:text-slate-300">🇻🇳 ${it.meaning}</div>
                    <div class="text-[10px] text-slate-500 italic">"${it.example}"</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('');
        }
      } catch (e) {}
    }

    // --- TÍNH NĂNG 5: PHÒNG LUYỆN NGHE ĐIỀN KHUYẾT CHẠY CHỮ KARAOKE (INTERACTIVE AUDIO CLOZE) ---
    var currentClozeData = null;

    async function loadClozeExercise() {
      const titleBadge = document.getElementById('cloze-title-badge');
      const textEl = document.getElementById('cloze-interactive-text');
      if (!textEl) return;
      try {
        const res = await fetch(`${API_BASE}/courses/dictation/cloze-exercises`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          currentClozeData = json.data[0];
          if (titleBadge) titleBadge.innerText = `${currentClozeData.title} • ${currentClozeData.cefr}`;
          renderClozeText();
        }
      } catch (e) {}
    }

    function renderClozeText() {
      const textEl = document.getElementById('cloze-interactive-text');
      if (!currentClozeData || !textEl) return;
      let html = '';
      currentClozeData.sentences.forEach(s => {
        let sentenceHtml = s.displayWithBlanks;
        s.blanks.forEach(b => {
          sentenceHtml = sentenceHtml.replace(
            `[${b.key}]`,
            `<input type="text" id="cloze-input-${b.key}" placeholder="(${b.hint})" class="px-2.5 py-1 rounded-lg border border-brand-400 bg-brand-50/40 dark:bg-slate-800 text-brand-700 dark:text-indigo-300 font-bold text-xs outline-none focus:ring-2 focus:ring-brand-500 w-44 inline-block text-center mx-1">`
          );
        });
        html += `<p class="mb-3 leading-relaxed">${sentenceHtml}</p>`;
      });
      textEl.innerHTML = html;
    }

    function playClozeAudioSentence() {
      if (!currentClozeData) return;
      const firstFull = currentClozeData.sentences.map(s => s.fullText).join(' ');
      speakText(firstFull, 'en-GB');
    }

    function fillSampleClozeAnswers() {
      if (!currentClozeData) return;
      currentClozeData.sentences.forEach(s => {
        s.blanks.forEach(b => {
          const input = document.getElementById(`cloze-input-${b.key}`);
          if (input) input.value = b.answer;
        });
      });
    }

    async function submitClozeAnswers() {
      if (!currentClozeData) return;
      const answers = {};
      currentClozeData.sentences.forEach(s => {
        s.blanks.forEach(b => {
          const input = document.getElementById(`cloze-input-${b.key}`);
          if (input) answers[b.key] = input.value.trim();
        });
      });

      try {
        const res = await fetch(`${API_BASE}/courses/dictation/cloze-submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
          },
          body: JSON.stringify({ exerciseId: currentClozeData.id, answers })
        });
        const json = await res.json();
        if (json.success) {
          const feedbackBadge = document.getElementById('cloze-feedback-badge');
          if (feedbackBadge) {
            feedbackBadge.innerText = `Chính xác ${json.correctCount}/${json.totalBlanks} (${json.scorePct}%) • +${json.xpEarned} XP`;
            feedbackBadge.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
          }
          alert(json.message);
        }
      } catch (e) {
        alert('Lỗi: ' + e.message);
      }
    }

    // --- TÍNH NĂNG 6: ĐẤU TRƯỜNG LUYỆN NÓI SONG ĐẤU 1V1 (SPEAKING BATTLE 1V1) ---
    async function startSpeakingMatchmake() {
      const btn = document.getElementById('btn-start-matchmake');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang tìm đối thủ...</span>';
      }
      try {
        const res = await fetch(`${API_BASE}/courses/speaking/matchmake`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
          }
        });
        const json = await res.json();
        if (json.success) {
          document.getElementById('pvp-opp-name').innerText = json.opponent.name;
          document.getElementById('pvp-opp-avatar').src = json.opponent.avatar;
          document.getElementById('pvp-challenge-topic').innerText = `Chủ đề: ${json.challenge.topic}`;
          document.getElementById('pvp-target-sentence').innerText = `"${json.challenge.targetSentence}"`;
          document.getElementById('pvp-duel-result-text').innerText = '🔥 Trận đấu bắt đầu! Bấm "Nói & Chấm Điểm Đối Đầu" để tranh tài!';
          document.getElementById('pvp-duel-result-text').className = 'text-xs font-bold text-amber-300 animate-pulse';
        }
      } catch (e) {
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-bolt"></i> <span>Tìm Đối Thủ 1v1 Ngay</span>';
        }
      }
    }

    async function simulateSpeakingDuel() {
      const myScore = Math.floor(88 + Math.random() * 10);
      const oppScore = Math.floor(75 + Math.random() * 18);
      document.getElementById('pvp-my-score-display').innerText = `Điểm: ${myScore}/100`;
      document.getElementById('pvp-opp-score-display').innerText = `Điểm: ${oppScore}/100`;

      try {
        const res = await fetch(`${API_BASE}/courses/speaking/submit-duel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': 'Bearer ' + currentToken } : {})
          },
          body: JSON.stringify({ myScore, opponentScore: oppScore })
        });
        const json = await res.json();
        if (json.success) {
          const resEl = document.getElementById('pvp-duel-result-text');
          resEl.innerText = `${json.resultText} (+${json.xpEarned} XP)`;
          resEl.className = json.isWinner ? 'text-xs font-black text-emerald-400' : 'text-xs font-bold text-amber-300';
          loadPvPSpeakingLeaderboard();
        }
      } catch (e) {}
    }

    async function loadPvPSpeakingLeaderboard() {
      const box = document.getElementById('pvp-speaking-leaderboard-box');
      if (!box) return;
      try {
        const res = await fetch(`${API_BASE}/courses/speaking/pvp-leaderboard`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          box.innerHTML = json.data.map((item, idx) => `
            <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-md ${idx === 0 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 text-slate-300'} text-[10px] flex items-center justify-center">#${item.rank}</span>
                <div>
                  <div class="font-bold text-white text-[11px] line-clamp-1">${item.player}</div>
                  <div class="text-[9px] text-indigo-300">${item.title} • ${item.wins} trận thắng</div>
                </div>
              </div>
              <span class="font-mono font-black text-amber-300 text-xs">${item.score} pts</span>
            </div>
          `).join('');
        }
      } catch (e) {}
    }

    
    // ==============================================================
    // GIAI ĐOẠN 4 - TÍNH NĂNG 1: MULTI-ACCENT LISTENING LAB
    // ==============================================================
    window.tier4Accents = {
      samples: [],
      currentIndex: 0,
      practiceCount: 0
    };

    async function loadAccentSamples() {
      const tabs = document.getElementById('accent-sentence-tabs');
      if (!tabs) return;
      try {
        const res = await fetch(`${API_BASE}/courses/accents/samples`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          window.tier4Accents.samples = json.data;
          window.tier4Accents.currentIndex = 0;
          renderAccentTabs();
          selectAccentSentence(0);
        }
      } catch (err) {
        console.error('Error loading accent samples:', err);
      }
    }

    function renderAccentTabs() {
      const tabs = document.getElementById('accent-sentence-tabs');
      if (!tabs) return;
      tabs.innerHTML = window.tier4Accents.samples.map((s, idx) => `
        <button onclick="selectAccentSentence(${idx})" id="accent-tab-btn-${idx}" class="accent-tab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${idx === window.tier4Accents.currentIndex ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}">
          Câu ${idx + 1}: ${s.topic || 'Giao tiếp'}
        </button>
      `).join('');
    }

    function selectAccentSentence(idx) {
      window.tier4Accents.currentIndex = idx;
      document.querySelectorAll('.accent-tab-btn').forEach((b, i) => {
        if (i === idx) {
          b.className = 'accent-tab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-sky-600 text-white shadow-sm';
        } else {
          b.className = 'accent-tab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200';
        }
      });

      const s = window.tier4Accents.samples[idx];
      if (!s) return;

      const txtEl = document.getElementById('accent-sentence-text');
      const meanEl = document.getElementById('accent-sentence-meaning');
      const topicEl = document.getElementById('accent-topic-badge');
      if (txtEl) txtEl.innerText = `"${s.sentence}"`;
      if (meanEl) meanEl.innerText = s.translation || '';
      if (topicEl) topicEl.innerText = `Chủ đề: ${s.topic || 'Giao tiếp thực tế'}`;

      const container = document.getElementById('accent-cards-container');
      if (!container) return;

      const accentDefs = [
        { key: 'uk', flag: '🇬🇧', name: 'Anh - Anh (UK)', dialect: 'Received Pronunciation', bcp47: 'en-GB' },
        { key: 'us', flag: '🇺🇸', name: 'Anh - Mỹ (US)', dialect: 'General American', bcp47: 'en-US' },
        { key: 'au', flag: '🇦🇺', name: 'Anh - Úc (AU)', dialect: 'General Australian', bcp47: 'en-AU' },
        { key: 'in', flag: '🇮🇳', name: 'Anh - Ấn (IN)', dialect: 'Indian English Standard', bcp47: 'en-IN' }
      ];

      container.innerHTML = accentDefs.map(def => {
        const item = (s.accents && s.accents[def.key]) || {};
        return `
          <div onclick="playAccentAudio('${def.key}', '${def.bcp47}')" id="accent-card-${def.key}" class="accent-play-card cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-sky-500 hover:shadow-lg transition-all space-y-2 group">
            <div class="flex items-center justify-between">
              <span class="text-2xl">${def.flag}</span>
              <span class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-500 group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs transition-colors">
                <i class="fa-solid fa-play"></i>
              </span>
            </div>
            <div>
              <div class="font-extrabold text-xs text-slate-900 dark:text-white">${def.name}</div>
              <div class="text-[10px] text-slate-400">${def.dialect}</div>
            </div>
            <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 font-mono text-[11px] text-sky-600 dark:text-sky-400">
              ${item.phoneticKey || '/phonetic/'}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
              ${item.accentNote || 'Ngữ điệu đặc trưng'}
            </div>
          </div>
        `;
      }).join('');
    }

    async function playAccentAudio(accentKey, bcp47) {
      document.querySelectorAll('.accent-play-card').forEach(c => {
        c.classList.remove('border-sky-500', 'ring-2', 'ring-sky-400/50');
      });
      const activeCard = document.getElementById(`accent-card-${accentKey}`);
      if (activeCard) {
        activeCard.classList.add('border-sky-500', 'ring-2', 'ring-sky-400/50');
      }

      const s = window.tier4Accents.samples[window.tier4Accents.currentIndex];
      if (!s) return;
      const accentData = (s.accents && s.accents[accentKey]) || {};

      const detailEl = document.getElementById('accent-detail-text');
      if (detailEl) {
        detailEl.innerHTML = `
          <div class="space-y-1">
            <div class="font-bold text-sky-600 dark:text-sky-400">${accentData.phoneticKey || ''}</div>
            <div class="text-slate-700 dark:text-slate-200"><strong>Đặc trưng âm học:</strong> ${accentData.accentNote || 'Âm vị chuẩn vùng miền'}</div>
            <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <i class="fa-solid fa-circle-check"></i> Đang phát giọng đọc ${accentKey.toUpperCase()} qua Web Speech Engine...
            </div>
          </div>
        `;
      }

      speakText(s.sentence, bcp47);

      try {
        const res = await fetch(`${API_BASE}/courses/accents/log-practice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accent: accentKey,
            sentenceId: s.id || s._id,
            sentence: s.sentence
          })
        });
        const json = await res.json();
        if (json.success) {
          window.tier4Accents.practiceCount = json.totalPracticeCount || (window.tier4Accents.practiceCount + 1);
          const countBadge = document.getElementById('accent-practice-count-text');
          if (countBadge) countBadge.innerText = `${window.tier4Accents.practiceCount} lượt luyện`;
          showToast(`🎧 Hoàn thành luyện nghe giọng ${accentKey.toUpperCase()} (+15 XP)`, 'success');
        }
      } catch (e) {
        window.tier4Accents.practiceCount++;
        const countBadge = document.getElementById('accent-practice-count-text');
        if (countBadge) countBadge.innerText = `${window.tier4Accents.practiceCount} lượt luyện`;
      }
    }

    // ==============================================================
    // GIAI ĐOẠN 4 - TÍNH NĂNG 5: VISUAL GRAMMAR TIMELINES & MINDCARDS
    // ==============================================================
    window.tier4Grammar = {
      cards: [],
      selectedIndex: 0
    };

    async function loadVisualGrammarCards() {
      const container = document.getElementById('visual-grammar-card-display');
      if (!container) return;
      try {
        const res = await fetch(`${API_BASE}/courses/grammar/visual-cards`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          window.tier4Grammar.cards = json.data;
          renderGrammarCardTabs();
          selectGrammarCard(0);
        }
      } catch (err) {
        console.error('Error loading grammar cards:', err);
      }
    }

    function renderGrammarCardTabs() {
      const tabs = document.getElementById('grammar-card-tabs');
      if (!tabs) return;
      tabs.innerHTML = window.tier4Grammar.cards.map((c, idx) => `
        <button onclick="selectGrammarCard(${idx})" id="grammar-tab-btn-${idx}" class="grammar-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${idx === window.tier4Grammar.selectedIndex ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}">
          <i class="fa-solid fa-layer-group mr-1.5"></i> ${c.title}
        </button>
      `).join('');
    }

    function selectGrammarCard(idx) {
      window.tier4Grammar.selectedIndex = idx;
      document.querySelectorAll('.grammar-tab-btn').forEach((b, i) => {
        if (i === idx) {
          b.className = 'grammar-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-600 text-white shadow-sm';
        } else {
          b.className = 'grammar-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200';
        }
      });

      const card = window.tier4Grammar.cards[idx];
      const display = document.getElementById('visual-grammar-card-display');
      if (!card || !display) return;

      display.innerHTML = `
        <div class="space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">${card.level || 'B1-C1'} • ${card.category || 'Ngữ pháp thực hành'}</span>
              <h4 class="text-xl font-black text-slate-900 dark:text-white mt-2">${card.title}</h4>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">${card.conceptOverview || ''}</p>
            </div>
          </div>

          <!-- Sơ đồ Dòng thời gian Visual Timeline SVG -->
          <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <i class="fa-solid fa-timeline text-emerald-500"></i> Sơ đồ trực quan Timeline:
              </span>
              <span class="text-[11px] text-slate-400 font-mono">Past ➔ Present ➔ Future</span>
            </div>
            
            <div class="w-full overflow-x-auto py-2">
              <div class="min-w-[500px] h-28 relative flex items-center justify-between px-6 border-b-2 border-dashed border-slate-300 dark:border-slate-700">
                <!-- Point A (Past) -->
                <div class="flex flex-col items-center relative z-10">
                  <div class="w-8 h-8 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-md">A</div>
                  <span class="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">Past Simple</span>
                  <span class="text-[10px] text-slate-400">Point in past (ended)</span>
                </div>

                <!-- Span Line (Present Perfect) -->
                <div class="flex-1 mx-4 h-3 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full relative flex items-center justify-center">
                  <span class="text-[10px] font-extrabold text-white uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-sm">Present Perfect Connection</span>
                </div>

                <!-- Point NOW (Present) -->
                <div class="flex flex-col items-center relative z-10">
                  <div class="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">NOW</div>
                  <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">Present (Now)</span>
                  <span class="text-[10px] text-slate-400">Result connected</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bảng so sánh cấu trúc & ví dụ phân tích -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${(card.comparisonRules || []).map(r => `
              <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div class="font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                  <span>${r.name}</span>
                  <span class="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40">${r.formula}</span>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  "${r.example}"
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  💡 ${r.usageNote}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Bẫy đề thi & Mẹo ghi nhớ thần tốc -->
          <div class="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2 text-xs">
            <div class="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation"></i> Bẫy đề thi hay gặp (Exam Pitfalls):
            </div>
            <div class="text-amber-900/80 dark:text-amber-200 leading-relaxed">
              ${card.commonTrap || 'Tránh nhầm lẫn mốc thời gian xác định (yesterday, in 2020) với khoảng thời gian kéo dài (for 3 years, since then).'}
            </div>
          </div>
        </div>
      `;
    }

    // ==============================================================
    // GIAI ĐOẠN 4 - TÍNH NĂNG 2: AI JOB & IELTS MOCK INTERVIEW SIMULATOR
    // ==============================================================
    window.tier4Interview = {
      sessionId: null,
      stage: 1,
      currentQuestion: '',
      history: [],
      completed: false
    };

    function resetInterviewState() {
      window.tier4Interview = {
        sessionId: null,
        stage: 1,
        currentQuestion: '',
        history: [],
        completed: false
      };
      const stream = document.getElementById('interview-chat-stream');
      if (stream) {
        stream.innerHTML = `
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-950/40 shadow-sm">
            <div class="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-comment-dots"></i> Giám khảo phỏng vấn đặt câu hỏi:
            </div>
            <div id="interview-current-question" class="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              "Bấm 'Bắt đầu phỏng vấn' để kết nối với giám khảo AI và nhận câu hỏi đầu tiên."
            </div>
          </div>
        `;
      }
      updateInterviewStageIndicators(1);
      const ansInput = document.getElementById('interview-answer-input');
      if (ansInput) ansInput.value = '';
    }

    function updateInterviewStageIndicators(currentStage) {
      for (let s = 1; s <= 3; s++) {
        const el = document.getElementById(`interview-stage-indicator-${s}`);
        if (!el) continue;
        if (s === currentStage) {
          el.className = 'py-2 px-3 rounded-xl bg-violet-600 text-white shadow-sm transition-all flex items-center justify-center gap-1.5';
        } else if (s < currentStage) {
          el.className = 'py-2 px-3 rounded-xl bg-emerald-600 text-white shadow-sm transition-all flex items-center justify-center gap-1.5';
        } else {
          el.className = 'py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center gap-1.5';
        }
      }
    }

    async function startMockInterview() {
      const typeSelect = document.getElementById('interview-type-select');
      const interviewType = typeSelect ? typeSelect.value : 'JOB';
      const btn = document.getElementById('btn-start-interview');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Kết nối...`;
      }

      try {
        const res = await fetch(`${API_BASE}/courses/interview/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewType })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          window.tier4Interview.sessionId = d.sessionId;
          window.tier4Interview.stage = d.stage || 1;
          window.tier4Interview.currentQuestion = d.question;
          window.tier4Interview.completed = false;

          const qEl = document.getElementById('interview-current-question');
          if (qEl) qEl.innerText = `"${d.question}"`;

          const nameEl = document.getElementById('interviewer-name');
          const roleEl = document.getElementById('interviewer-role');
          const avatarEl = document.getElementById('interviewer-avatar');
          if (nameEl && d.interviewerName) nameEl.innerText = d.interviewerName;
          if (roleEl && d.interviewerRole) roleEl.innerText = d.interviewerRole;
          if (avatarEl && d.interviewerAvatar) avatarEl.src = d.interviewerAvatar;

          updateInterviewStageIndicators(d.stage || 1);
          showToast(`🎙️ Đã kết nối với giám khảo (${interviewType === 'JOB' ? 'Tuyển dụng' : 'IELTS'})!`, 'success');
          speakInterviewerQuestion();
        }
      } catch (err) {
        console.error('Error starting interview:', err);
        showToast('Không thể kết nối phòng phỏng vấn.', 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Bắt đầu lại`;
        }
      }
    }

    function speakInterviewerQuestion() {
      const q = window.tier4Interview.currentQuestion || (document.getElementById('interview-current-question') ? document.getElementById('interview-current-question').innerText : '');
      if (q) speakText(q, 'en-US');
    }

    function fillSampleInterviewAnswer() {
      const input = document.getElementById('interview-answer-input');
      if (!input) return;
      const stage = window.tier4Interview.stage || 1;
      const sampleAnswers = {
        1: "Certainly! I have been working as a software developer for the past 4 years, specializing in distributed systems and cloud microservices. I am passionate about tackling scalable architectural problems and collaborating with cross-functional international teams.",
        2: "In my previous project, we faced a critical database bottleneck during a major product launch. I took the initiative to implement a Redis caching layer and partitioned our time-series logs, which successfully reduced query latency by 75% and kept system uptime at 99.9%.",
        3: "I believe effective communication and empathy are vital when handling conflicting opinions. I always focus on objective metrics and user impact to align the team towards shared milestones."
      };
      input.value = sampleAnswers[stage] || sampleAnswers[1];
    }

    function startInterviewVoiceInput() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Trình duyệt không hỗ trợ nhận diện giọng nói Web Speech. Vui lòng nhập bằng bàn phím.', 'info');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      const micBtn = document.getElementById('btn-interview-mic');
      if (micBtn) micBtn.innerHTML = `<i class="fa-solid fa-circle-dot text-rose-500 animate-ping"></i> Đang nghe...`;

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const input = document.getElementById('interview-answer-input');
        if (input) input.value = (input.value ? input.value + ' ' : '') + transcript;
        showToast('Đã ghi nhận giọng nói!', 'success');
      };
      recognition.onend = () => {
        if (micBtn) micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> Nói qua Mic`;
      };
      recognition.onerror = () => {
        if (micBtn) micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> Nói qua Mic`;
      };
      recognition.start();
    }

    async function sendInterviewResponse() {
      const input = document.getElementById('interview-answer-input');
      const answer = input ? input.value.trim() : '';
      if (!answer) {
        showToast('Vui lòng nhập hoặc nói câu trả lời của bạn trước khi gửi.', 'warning');
        return;
      }
      if (!window.tier4Interview.sessionId) {
        showToast('Vui lòng bấm Bắt đầu phỏng vấn trước.', 'warning');
        return;
      }

      const btn = document.getElementById('btn-send-interview-answer');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Giám khảo đang chấm...`;
      }

      try {
        const res = await fetch(`${API_BASE}/courses/interview/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: window.tier4Interview.sessionId,
            answer: answer
          })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          const stream = document.getElementById('interview-chat-stream');
          if (stream) {
            stream.innerHTML += `
              <div class="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 text-xs space-y-1">
                <div class="font-bold text-violet-700 dark:text-violet-300">👤 Câu trả lời của bạn:</div>
                <div class="text-slate-800 dark:text-slate-200 font-medium">"${answer}"</div>
              </div>
            `;
            if (d.nextQuestion) {
              stream.innerHTML += `
                <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-violet-100 dark:border-violet-950/40 shadow-sm space-y-1">
                  <div class="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                    <i class="fa-solid fa-comment-dots"></i> Giám khảo chuyển tiếp:
                  </div>
                  <div class="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    "${d.nextQuestion}"
                  </div>
                </div>
              `;
            }
            stream.scrollTop = stream.scrollHeight;
          }

          if (input) input.value = '';

          const fScore = d.fluencyScore || 85;
          const cScore = d.confidenceScore || 88;
          const lBand = d.lexicalScoreBand || '7.5';

          const fEl = document.getElementById('interview-score-fluency');
          const cEl = document.getElementById('interview-score-confidence');
          const lEl = document.getElementById('interview-score-lexical');
          const fBar = document.getElementById('interview-bar-fluency');
          const cBar = document.getElementById('interview-bar-confidence');
          const lBar = document.getElementById('interview-bar-lexical');

          if (fEl) fEl.innerText = `${fScore}%`;
          if (cEl) cEl.innerText = `${cScore}%`;
          if (lEl) lEl.innerText = `${lBand} / 9.0`;

          if (fBar) fBar.style.width = `${fScore}%`;
          if (cBar) cBar.style.width = `${cScore}%`;
          if (lBar) lBar.style.width = `${(parseFloat(lBand) / 9.0) * 100}%`;

          const feedbackEl = document.getElementById('interview-feedback-text');
          if (feedbackEl) {
            feedbackEl.innerHTML = `
              <div class="space-y-1.5">
                <div class="text-emerald-600 dark:text-emerald-400 font-bold">✨ Điểm cộng: ${d.compliment || 'Cấu trúc câu tự nhiên, phản xạ tốt.'}</div>
                <div class="text-slate-700 dark:text-slate-300">💡 <strong>Gợi ý nâng tầm:</strong> ${d.suggestion || 'Hãy sử dụng thêm các transition phrases như "Furthermore", "In retrospective".'}</div>
              </div>
            `;
          }

          window.tier4Interview.stage = d.stage;
          window.tier4Interview.currentQuestion = d.nextQuestion || '';
          updateInterviewStageIndicators(d.stage);

          if (d.completed) {
            window.tier4Interview.completed = true;
            showToast('🎉 Chúc mừng! Bạn đã hoàn thành trọn vẹn buổi phỏng vấn (+150 XP)!', 'success');
          } else {
            speakInterviewerQuestion();
          }
        }
      } catch (err) {
        console.error('Error sending interview response:', err);
        showToast('Lỗi gửi phản hồi phỏng vấn.', 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>Gửi câu trả lời & Nhận đánh giá</span> <i class="fa-solid fa-arrow-right"></i>`;
        }
      }
    }

    // ==============================================================
    // GIAI ĐOẠN 4 - TÍNH NĂNG 4: SMART LEXICAL UPGRADER (NEO4J)
    // ==============================================================
    window.tier4Lexical = {
      currentAnalysis: null,
      sampleEssay: "In this modern world, pollution is a very big problem. Many people do a lot of things to make money, but it has a bad effect on nature. The government must do something to solve this problem quickly because it is very important for our future."
    };

    function updateLexicalWordCount() {
      const input = document.getElementById('lexical-input-text');
      const countEl = document.getElementById('lexical-word-count');
      if (!input || !countEl) return;
      const words = input.value.trim().split(/\s+/).filter(Boolean);
      countEl.innerText = `${words.length} từ`;
    }

    function fillSampleLexicalEssay() {
      const input = document.getElementById('lexical-input-text');
      if (!input) return;
      input.value = window.tier4Lexical.sampleEssay;
      updateLexicalWordCount();
      analyzeEssayLexicalUpgrades();
    }

    async function analyzeEssayLexicalUpgrades() {
      const input = document.getElementById('lexical-input-text');
      const text = input ? input.value.trim() : '';
      if (!text) {
        showToast('Vui lòng dán đoạn văn cần phân tích từ vựng.', 'warning');
        return;
      }

      const btn = document.getElementById('btn-analyze-lexical');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Đang phân tích collocations...`;
      }

      try {
        const res = await fetch(`${API_BASE}/graph/lexical-upgrader/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          window.tier4Lexical.currentAnalysis = d;

          const bandEl = document.getElementById('lexical-result-band');
          const collocEl = document.getElementById('lexical-result-colloc');
          const weakEl = document.getElementById('lexical-result-weak');
          if (bandEl) bandEl.innerText = d.lexicalScoreBand || '6.0';
          if (collocEl) collocEl.innerText = d.academicCollocationsCount || 0;
          if (weakEl) weakEl.innerText = d.weakWordsCount || 0;

          const outEl = document.getElementById('lexical-annotated-output');
          if (outEl && d.annotatedHtml) {
            outEl.innerHTML = d.annotatedHtml;
          }

          const sugContainer = document.getElementById('lexical-suggestions-container');
          if (sugContainer && Array.isArray(d.suggestions)) {
            if (d.suggestions.length === 0) {
              sugContainer.innerHTML = `<div class="p-3 text-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">Đoạn văn của bạn có vốn từ vựng học thuật rất tốt!</div>`;
            } else {
              sugContainer.innerHTML = d.suggestions.map((s, idx) => `
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span class="line-through text-rose-500 font-bold mr-1.5">${s.original}</span>
                    <i class="fa-solid fa-arrow-right text-[10px] text-slate-400 mr-1.5"></i>
                    <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">${s.replacement}</span>
                    <span class="text-[10px] text-slate-400 ml-1">(${s.reason || 'Academic C1/C2'})</span>
                  </div>
                  <button onclick="applySingleLexicalUpgrade('${s.original}', '${s.replacement}')" class="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-[11px] font-bold transition-all">
                    Áp dụng
                  </button>
                </div>
              `).join('');
            }
          }

          const applyAllBtn = document.getElementById('btn-apply-all-upgrades');
          if (applyAllBtn) {
            if (d.suggestions && d.suggestions.length > 0) applyAllBtn.classList.remove('hidden');
            else applyAllBtn.classList.add('hidden');
          }

          showToast('✨ Đã đối sánh từ vựng và gợi ý collocations chuẩn Band 8.0+!', 'success');
        }
      } catch (err) {
        console.error('Error analyzing lexical upgrades:', err);
        showToast('Lỗi phân tích từ vựng qua đồ thị.', 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Nâng cấp đoạn văn`;
        }
      }
    }

    function applySingleLexicalUpgrade(original, replacement) {
      const input = document.getElementById('lexical-input-text');
      if (!input) return;
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      input.value = input.value.replace(regex, replacement);
      updateLexicalWordCount();
      analyzeEssayLexicalUpgrades();
    }

    function applyAllLexicalUpgrades() {
      const d = window.tier4Lexical.currentAnalysis;
      if (!d || !Array.isArray(d.suggestions)) return;
      const input = document.getElementById('lexical-input-text');
      if (!input) return;
      let text = input.value;
      d.suggestions.forEach(s => {
        const regex = new RegExp(`\\b${s.original}\\b`, 'gi');
        text = text.replace(regex, s.replacement);
      });
      input.value = text;
      updateLexicalWordCount();
      analyzeEssayLexicalUpgrades();
      showToast('🚀 Đã thay thế toàn bộ từ vựng Band 8.0+!', 'success');
    }

    // ==============================================================
    // GIAI ĐOẠN 4 - TÍNH NĂNG 3: REDIS GEOSPATIAL ENGLISH LEADERBOARD
    // ==============================================================
    window.tier4Geo = {
      clubs: [],
      userCoords: { lat: 10.8018, lon: 106.6397 }
    };

    async function loadRegionalClubs(city = 'all') {
      const container = document.getElementById('geo-clubs-container');
      if (!container) return;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            window.tier4Geo.userCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            const coordEl = document.getElementById('geo-my-coords-display');
            if (coordEl) coordEl.innerText = `📍 Vị trí: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
            fetchClubsAndLeaderboard(city);
          },
          () => {
            fetchClubsAndLeaderboard(city);
          },
          { timeout: 3000 }
        );
      } else {
        fetchClubsAndLeaderboard(city);
      }
    }

    async function fetchClubsAndLeaderboard(city) {
      const container = document.getElementById('geo-clubs-container');
      const { lat, lon } = window.tier4Geo.userCoords;

      try {
        const res = await fetch(`${API_BASE}/courses/geo/clubs?city=${city}&lat=${lat}&lon=${lon}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          window.tier4Geo.clubs = json.data;
          if (container) {
            container.innerHTML = json.data.map(club => `
              <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-sm transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">${club.city || 'TP.HCM'}</span>
                    <span class="text-xs font-black text-slate-900 dark:text-white">${club.name}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">
                    <i class="fa-solid fa-location-dot text-amber-500 mr-1"></i> ${club.address || 'Khuôn viên trường'}
                  </div>
                  <div class="text-[10px] text-slate-400 flex items-center gap-3">
                    <span><i class="fa-regular fa-clock mr-1"></i> ${club.weeklySchedule || 'Tối T7 18:30'}</span>
                    <span><i class="fa-solid fa-users mr-1"></i> ${club.membersCount || 150} thành viên</span>
                  </div>
                </div>

                <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                    Cách ${club.distanceKm !== undefined ? club.distanceKm : '1.2'} km
                  </span>
                  <button onclick="checkinGeoLocation('${club.id}', '${club.name}')" class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all flex items-center gap-1.5">
                    <i class="fa-solid fa-map-pin"></i> Check-in (+50 XP)
                  </button>
                </div>
              </div>
            `).join('');
          }
        }
      } catch (err) {
        console.error('Error loading geo clubs:', err);
      }

      try {
        const lbRes = await fetch(`${API_BASE}/courses/geo/regional-leaderboard`);
        const lbJson = await lbRes.json();
        const lbBox = document.getElementById('regional-leaderboard-container');
        if (lbBox && lbJson.success && Array.isArray(lbJson.data)) {
          lbBox.innerHTML = lbJson.data.map((item, idx) => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div class="flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-lg ${idx === 0 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold'} text-xs flex items-center justify-center">
                  #${idx + 1}
                </span>
                <div>
                  <div class="font-extrabold text-xs text-slate-900 dark:text-white">${item.university}</div>
                  <div class="text-[10px] text-slate-400">${item.region} • ${item.activeStudents} sinh viên</div>
                </div>
              </div>
              <span class="font-mono font-black text-xs text-amber-600 dark:text-amber-400">${item.totalPoints ? item.totalPoints.toLocaleString() : '12,500'} pts</span>
            </div>
          `).join('');
        }
      } catch (e) {}
    }

    async function checkinGeoLocation(clubId, clubName) {
      const { lat, lon } = window.tier4Geo.userCoords;
      try {
        const res = await fetch(`${API_BASE}/courses/geo/checkin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubId, clubName, lat, lon })
        });
        const json = await res.json();
        if (json.success) {
          showToast(`📍 Check-in thành công tại ${clubName}! (+50 XP)`, 'success');
          loadRegionalClubs(document.getElementById('geo-city-filter') ? document.getElementById('geo-city-filter').value : 'all');
        }
      } catch (err) {
        showToast(`📍 Đã check-in tại ${clubName}! (+50 XP)`, 'success');
      }
    }

    // ==============================================================