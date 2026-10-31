// ==============================================================================
// 3. STUDY ENGINE: FLASHCARDS 3D, DICTATION, WRITING AI, EXAM & TIER 1-4 LABS
// ==============================================================================

    function getValidToken() {
      if (!currentToken || currentToken === 'null') {
        currentToken = window.currentToken || localStorage.getItem('edupro_token') || null;
        window.currentToken = currentToken;
      }
      return currentToken;
    }

    async function startExam(silent = false) {
      const activeToken = window.currentToken || (typeof currentToken !== 'undefined' ? currentToken : null) || localStorage.getItem('edupro_token');
      if (!activeToken) { openLoginModal(); return; }
      currentToken = activeToken;
      window.currentToken = activeToken;

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
          window.isExamActive = true;

          initAntiCheatMonitoring();
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
          window.isExamActive = false;
          if (typeof m2 !== 'undefined') m2.active = false;
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
          updateFilterButtons(json.categories || {});
          renderFlashcardsGrid();
        }
      } catch (err) {
        console.error('Lỗi tải Flashcards:', err);
      }
    }

    const FLASHCARD_TOPIC_DEFS = [
      { category: 'Môi trường & Khí hậu', icon: '🌍', desc: 'Từ vựng học thuật chuyên sâu về sinh thái, bảo tồn và biến đổi khí hậu (IELTS Band 7.5 - 8.5+)' },
      { category: 'Kinh doanh & Tài chính', icon: '💼', desc: 'Từ vựng cốt lõi cho môi trường doanh nghiệp, đàm phán hợp đồng & tài chính (TOEIC 850+ & Business English)' },
      { category: 'Công nghệ & AI', icon: '💻', desc: 'Từ vựng công nghệ số, cơ sở dữ liệu phân tán, trí tuệ nhân tạo & an ninh thông tin' },
      { category: 'Giáo dục & Học thuật', icon: '🎓', desc: 'Từ vựng học thuật đỉnh cao phục vụ IELTS Academic Reading/Writing & Nghiên cứu khoa học' },
      { category: 'Y tế & Sức khỏe', icon: '🏥', desc: 'Từ vựng y khoa thông dụng, dinh dưỡng, miễn dịch & chăm sóc sức khỏe cộng đồng' },
      { category: 'Thành ngữ & Cụm từ', icon: '🗣️', desc: 'Thành ngữ (Idioms) & Cụm động từ (Phrasal Verbs) tự nhiên nhất giúp nâng band Speaking & Writing' }
    ];

    function updateFilterButtons(cats) {
      const container = document.getElementById('vocab-category-filters');
      if (!container) return;
      const allCount = cats.ALL || allFlashcards.length;

      let html = `
        <button id="fc-btn-all" onclick="filterFlashcards('ALL', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold ${currentFlashcardFilter === 'ALL' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'} transition-all">
          Tất cả (${allCount})
        </button>
      `;

      FLASHCARD_TOPIC_DEFS.forEach(topic => {
        const count = cats[topic.category] !== undefined
          ? cats[topic.category]
          : allFlashcards.filter(c => c.category === topic.category).length;
        const isActive = currentFlashcardFilter === topic.category;
        html += `
          <button onclick="filterFlashcards('${topic.category}', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold ${isActive ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'} transition-all">
            ${topic.icon} ${topic.category} (${count})
          </button>
        `;
      });

      // Catch additional categories (custom user flashcards)
      Object.keys(cats || {}).forEach(cat => {
        if (cat !== 'ALL' && !FLASHCARD_TOPIC_DEFS.some(t => t.category === cat)) {
          const isActive = currentFlashcardFilter === cat;
          html += `
            <button onclick="filterFlashcards('${cat}', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold ${isActive ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'} transition-all">
              🏷️ ${cat} (${cats[cat]})
            </button>
          `;
        }
      });

      container.innerHTML = html;
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

    
    // Tra cứu hình ảnh minh họa chất lượng cao cho thẻ từ vựng Flashcard
    function getFlashcardIllustration(card) {
      if (card.image && card.image.startsWith('http')) return card.image;
      const w = (card.word || '').toLowerCase();
      if (w.includes('resign')) return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80';
      if (w.includes('mitigate')) return 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=400&q=80';
      if (w.includes('biodiversity')) return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80';
      if (w.includes('deforest')) return 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=400&q=80';
      if (w.includes('sustain')) return 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=400&q=80';
      if (w.includes('reimburse')) return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80';
      if (w.includes('revenue') || w.includes('profit')) return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80';
      if (w.includes('algorithm') || w.includes('data')) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
      if (w.includes('curriculum') || w.includes('academic')) return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80';
      if (w.includes('vaccin') || w.includes('health') || w.includes('immune')) return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80';

      const cat = (card.category || '').toLowerCase();
      if (cat.includes('môi trường')) return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80';
      if (cat.includes('kinh doanh')) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80';
      if (cat.includes('công nghệ')) return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80';
      if (cat.includes('giáo dục')) return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80';
      if (cat.includes('y tế')) return 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80';
      return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80';
    }

    // Hàm lật thẻ Flashcard 3D hai mặt
    function toggleFlipCard(cardId) {
      const inner = document.getElementById(`fc-inner-${cardId}`);
      if (inner) {
        inner.classList.toggle('is-flipped');
      }
    }
    window.toggleFlipCard = toggleFlipCard;

    // RENDER THẺ TỪ VỰNG DẠNG FLASHCARD 3D CHUẨN 2 MẶT CÓ HÌNH ẢNH
    function renderSingleFlashcardCard(card) {
      const isMastered = Boolean(card.mastered || card.isMastered);
      const phonetic = card.phonetic || card.ipa || '';
      let pos = (card.pos || card.type || 'verb').toLowerCase();
      if (pos.includes('verb') || pos.includes('động từ')) pos = 'verb';
      else if (pos.includes('noun') || pos.includes('danh từ')) pos = 'noun';
      else if (pos.includes('adj') || pos.includes('tính từ')) pos = 'adj';
      else if (pos.includes('adv') || pos.includes('phó từ')) pos = 'adv';

      const meaning = card.meaning || card.meaningVi || '';
      const safeWord = (card.word || '').replace(/'/g, "\\'");
      const safeEx = (card.example || '').replace(/'/g, "\\'");
      const topicIcon = card.topicIcon || (FLASHCARD_TOPIC_DEFS.find(t => t.category === card.category) || {}).icon || '📘';
      const cardImg = getFlashcardIllustration(card);

      return `
        <div class="flashcard-3d-wrapper select-none group" id="fc-card-${card.id}">
          <!-- KHỐI 3D LẬT THẺ -->
          <div class="flashcard-3d-inner rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all ${isMastered ? 'ring-2 ring-emerald-500/30' : ''}" id="fc-inner-${card.id}" onclick="toggleFlipCard('${card.id}')">
            
            <!-- ========================================== -->
            <!-- MẶT TRƯỚC (FRONT): TỪ VỰNG, PHIÊN ÂM, LOA 🔊 -->
            <!-- ========================================== -->
            <div class="flashcard-3d-face flashcard-3d-front p-6 rounded-3xl bg-white dark:bg-slate-900 flex flex-col justify-between">
              <!-- Hàng trên: Phân loại & Badge 'Từ mới' -->
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  ${topicIcon} ${card.category}
                </span>
                <span class="px-3.5 py-1 rounded-full text-xs font-semibold ${isMastered ? 'text-emerald-600 border border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40' : 'text-amber-500 border border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'}">
                  ${isMastered ? '✓ Đã thuộc' : 'Từ mới'}
                </span>
              </div>

              <!-- Khu vực trung tâm: Từ vựng to đậm & Nút phát âm -->
              <div class="text-center py-6">
                <div class="inline-flex items-center justify-center gap-2.5">
                  <h3 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">${card.word}</h3>
                  <button onclick="event.stopPropagation(); speakText('${safeWord}', 'en-US')" title="Phát âm từ vựng" class="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm shadow-2xs transition-transform active:scale-95">
                    <i class="fa-solid fa-volume-high"></i>
                  </button>
                </div>
                <div class="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                  <span class="font-bold text-slate-600 dark:text-slate-400">(${pos})</span> ${phonetic}
                </div>
              </div>

              <!-- Hàng dưới: Lời nhắc lật thẻ & Nút Rotate 🔄 -->
              <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span class="text-[11px] italic text-slate-400 flex items-center gap-1">
                  <i class="fa-solid fa-hand-pointer text-brand-500"></i> Bấm để lật xem định nghĩa & hình ảnh
                </span>
                <button onclick="event.stopPropagation(); toggleFlipCard('${card.id}')" title="Lật sang mặt sau" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-600 dark:hover:text-indigo-400 text-lg transition-transform hover:rotate-180 duration-500">
                  <i class="fa-solid fa-arrows-rotate"></i>
                </button>
              </div>
            </div>

            <!-- ========================================== -->
            <!-- MẶT SAU (BACK): ĐỊNH NGHĨA, VÍ DỤ & HÌNH ẢNH 🖼️ -->
            <!-- ========================================== -->
            <div class="flashcard-3d-face flashcard-3d-back p-6 rounded-3xl bg-white dark:bg-slate-900 flex flex-col justify-between border border-slate-200/90 dark:border-slate-800">
              <!-- Hàng trên: Tiêu đề mặt sau & Badge 'Từ mới' -->
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                  📖 Chi tiết từ vựng
                </span>
                <span class="px-3.5 py-1 rounded-full text-xs font-semibold ${isMastered ? 'text-emerald-600 border border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40' : 'text-amber-500 border border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'}">
                  ${isMastered ? '✓ Đã thuộc' : 'Từ mới'}
                </span>
              </div>

              <!-- Thân thẻ: Bố cục 2 cột (Trái: Định nghĩa & Ví dụ, Phải: Ảnh minh họa) -->
              <div class="grid grid-cols-12 gap-3 py-1 items-center">
                <!-- Cột trái: Text -->
                <div class="col-span-7 space-y-2 text-left">
                  <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">Định nghĩa:</div>
                    <div class="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">${meaning}</div>
                  </div>
                  <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">Ví dụ:</div>
                    <div class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-3">
                      • ${card.example}
                    </div>
                  </div>
                </div>

                <!-- Cột phải: Hình ảnh minh họa -->
                <div class="col-span-5 flex justify-end">
                  <div class="w-full max-w-[150px] aspect-4/3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                    <img src="${cardImg}" alt="${card.word}" loading="lazy" class="w-full h-full object-cover">
                  </div>
                </div>
              </div>

              <!-- Hàng dưới: Lời nhắc lật lại & Nút Rotate 🔄 -->
              <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button onclick="event.stopPropagation(); speakText('${safeEx}', 'en-US')" class="text-[11px] font-bold text-brand-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  <i class="fa-solid fa-volume-low"></i> Nghe câu ví dụ
                </button>
                <button onclick="event.stopPropagation(); toggleFlipCard('${card.id}')" title="Lật về mặt trước" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-600 dark:hover:text-indigo-400 text-lg transition-transform hover:rotate-180 duration-500">
                  <i class="fa-solid fa-arrows-rotate"></i>
                </button>
              </div>
            </div>

          </div>

          <!-- THANH CÔNG CỤ HỌC TẬP SRS & ĐÁNH DẤU BÊN DƯỚI -->
          <div class="mt-3 space-y-2">
            <!-- 4 Nút Ôn tập ngắt quãng Anki / Leitner -->
            <div class="grid grid-cols-4 gap-1.5">
              <button onclick="scheduleSrsReview('${card.id}', '${safeWord}', 'AGAIN')" title="Ôn lại sau 1 phút" class="py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-300 text-[10px] font-bold transition-all border border-rose-200/60 dark:border-rose-900/40">Again 1p</button>
              <button onclick="scheduleSrsReview('${card.id}', '${safeWord}', 'HARD')" title="Ôn lại sau 1 ngày" class="py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-300 text-[10px] font-bold transition-all border border-amber-200/60 dark:border-amber-900/40">Hard 1d</button>
              <button onclick="scheduleSrsReview('${card.id}', '${safeWord}', 'GOOD')" title="Ôn lại sau 3 ngày" class="py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-300 text-[10px] font-bold transition-all border border-sky-200/60 dark:border-sky-900/40">Good 3d</button>
              <button onclick="scheduleSrsReview('${card.id}', '${safeWord}', 'EASY')" title="Ôn lại sau 7 ngày" class="py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-300 text-[10px] font-bold transition-all border border-emerald-200/60 dark:border-emerald-900/40">Easy 7d</button>
            </div>

            <!-- Nút đánh dấu đã thuộc -->
            <button onclick="toggleFlashcardMaster('${card.id}')" class="w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${isMastered ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300'}">
              <i class="fa-solid ${isMastered ? 'fa-circle-check' : 'fa-check'}"></i>
              <span>${isMastered ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
            </button>
          </div>
        </div>
      `;
    }
  

    function renderFlashcardsGrid() {
      const container = document.getElementById('flashcards-grid');
      if (!container) return;

      // Use vertical space so each topic group stands out clearly
      container.className = 'space-y-12';

      let targetTopics = [];
      if (currentFlashcardFilter === 'ALL') {
        targetTopics = [...FLASHCARD_TOPIC_DEFS];
        const knownCats = new Set(targetTopics.map(t => t.category));
        allFlashcards.forEach(c => {
          if (c.category && !knownCats.has(c.category)) {
            knownCats.add(c.category);
            targetTopics.push({ category: c.category, icon: '🏷️', desc: 'Từ vựng do người học tùy chỉnh & tra cứu' });
          }
        });
      } else {
        const found = FLASHCARD_TOPIC_DEFS.find(t => t.category === currentFlashcardFilter);
        if (found) {
          targetTopics = [found];
        } else {
          targetTopics = [{ category: currentFlashcardFilter, icon: '🏷️', desc: 'Từ vựng chủ đề: ' + currentFlashcardFilter }];
        }
      }

      let html = '';
      let topicCounter = 1;

      targetTopics.forEach(topic => {
        const topicCards = allFlashcards.filter(c => c.category === topic.category);
        if (topicCards.length === 0) return;

        const masteredInTopic = topicCards.filter(c => c.mastered || c.isMastered).length;
        const cardsGridHtml = topicCards.map(c => renderSingleFlashcardCard(c)).join('');

        html += `
          <section class="vocab-topic-section">
            <!-- Header Nhóm Chủ Đề Chuyên Biệt -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-5 rounded-3xl bg-gradient-to-r from-slate-100/90 via-indigo-50/60 to-slate-100/90 dark:from-slate-900/90 dark:via-indigo-950/40 dark:to-slate-900/90 border border-slate-200/90 dark:border-slate-800 mb-6 shadow-xs">
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0">
                  ${topic.icon || '📘'}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-indigo-300">
                      Chủ đề 0${topicCounter}
                    </span>
                    <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      ${topic.category}
                    </h3>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    ${topic.desc || 'Bộ từ vựng trọng tâm theo chủ đề'}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <span class="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs">
                  <span class="text-brand-600 dark:text-indigo-400"><strong>${topicCards.length}</strong> từ</span> • <span class="text-emerald-600 dark:text-emerald-400"><strong>${masteredInTopic}</strong> đã thuộc</span>
                </span>
              </div>
            </div>

            <!-- Lưới 3 Cột Các Thẻ Của Chủ Đề Này -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${cardsGridHtml}
            </div>
          </section>
        `;
        topicCounter++;
      });

      if (!html) {
        html = '<div class="text-center py-12 text-slate-400 text-sm">Không tìm thấy từ vựng nào trong chủ đề này.</div>';
      }

      container.innerHTML = html;
    }

    async function toggleFlashcardMaster(cardId) {
      if (!getValidToken()) { openLoginModal(); return; }
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
      if (!getValidToken()) { openLoginModal(); return; }
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

    
    // ==============================================================================
    // KHO DỮ LIỆU 15 CHỦ ĐỀ IELTS WRITING TASK 2 & BÀI LUẬN MẪU BAND 8.0+
    // ==============================================================================
    const IELTS_WRITING_TOPICS = [
      {
        id: 1,
        title: "Chủ đề 1 (Education & AI): Online platforms & AI replacing traditional classrooms",
        prompt: "Some people believe that artificial intelligence and online platforms will replace traditional classrooms and teachers in the near future. To what extent do you agree or disagree?",
        category: "Giáo Dục & Trí Tuệ Nhân Tạo",
        type: "Opinion (Agree/Disagree)",
        tip: "Cấu trúc 4 đoạn: Khẳng định quan điểm một phần (Partially Agree) hoặc phản bác (Disagree) rằng AI chỉ đóng vai trò bổ trợ, không thể thay thế sự đồng cảm và định hướng đạo đức của giáo viên.",
        sampleEssay: `In the contemporary era, artificial intelligence and automated online platforms have revolutionized instructional delivery. While some proponents assert that digital technologies will render conventional classrooms and human educators obsolete, I firmly disagree with this view, as interpersonal mentorship and holistic pedagogy remain irreducibly human.

On the one hand, digital learning environments provide undeniable pedagogical advantages. Automated algorithms can personalize learning pace, deliver immediate diagnostic feedback, and democratize access to world-class academic resources regardless of geographical constraints. For instance, intelligent tutoring systems can identify a student\'s grammatical vulnerabilities in seconds, thereby optimizing rote academic drills.

Nevertheless, education extends far beyond algorithmic knowledge dissemination. Human educators cultivate critical inquiry, emotional resilience, and moral discernment—facets that artificial neural networks cannot replicate. Furthermore, the physical classroom functions as a vital social crucible where collaborative negotiation, empathy, and conflict resolution are organically nurtured through peer-to-peer discourse.

In conclusion, although artificial intelligence represents an invaluable auxiliary instrument in modern pedagogical frameworks, it cannot substitute the transformative intellectual and psychosocial guidance provided by human teachers. Therefore, institutions should embrace hybrid learning rather than attempting wholesale teacher replacement.`
      },
      {
        id: 2,
        title: "Chủ đề 2 (Higher Education): Free university tuition vs. Self-funded tuition",
        prompt: "Some people think that university education should be free for all students, while others believe students should pay tuition fees since they benefit individually. Discuss both views and give your opinion.",
        category: "Giáo Dục Đại Học",
        type: "Discussion (Discuss both views & Opinion)",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 bàn về lợi ích xã hội của miễn học phí đại học; Đoạn 2 bàn về trách nhiệm cá nhân và ngân sách nhà nước; Đoạn kết đưa ra giải pháp học bổng kết hợp tín dụng sinh viên.",
        sampleEssay: `The question of whether tertiary education should be entirely state-funded or financed by individual undergraduates remains a contentious socioeconomic debate. While subsidized tuition promotes social mobility, I contend that a shared-cost model combined with meritocratic subsidies is the most sustainable approach.

Advocates of universal free higher education argue that intellectual capital is a public good that fuels national economic prosperity. When universities abolish financial barriers, underprivileged students can access tertiary degrees, mitigating systemic socioeconomic inequality. For example, Scandinavian nations that offer tuition-free universities boast lower wage disparity and higher research outputs, demonstrating the profound collective dividends of an educated populace.

Conversely, opponents emphasize fiscal constraints and personal accountability. Higher education primarily enhances an individual\'s lifetime earning potential; thus, graduates ought to invest in their own upward mobility. Furthermore, when governments absorb all tuition expenses, public budgets for vital primary healthcare and secondary schooling are inevitably strained, and university diplomas may suffer from credential inflation due to declining per-student university revenue.

In conclusion, while total state funding fosters educational equality, complete individual liability risks disenfranchising talented students. A balanced system—where subsidized tuition is coupled with income-contingent loans and targeted scholarships—ensures both institutional quality and broad societal equity.`
      },
      {
        id: 3,
        title: "Chủ đề 3 (Child Development): Screen time and digital devices for children",
        prompt: "Children are spending an increasing amount of time using digital screens and smartphones for study and leisure. Is this a positive or negative development?",
        category: "Phát Triển Trẻ Em & Kỹ Thuật Số",
        type: "Positive or Negative Development",
        tip: "Cấu trúc 4 đoạn: Phân tích các lợi ích về học tập số, sau đó chứng minh các tác động tiêu cực đối với thể chất và tâm lý (sedentary lifestyle, social isolation) chiếm ưu thế hơn.",
        sampleEssay: `The pervasive integration of electronic tablets and smartphones into the daily routines of adolescents has ignited fierce debate among pediatricians and educators. In my view, while digital literacy is advantageous, the disproportionate allocation of screen time represents a predominantly detrimental development for youth development.

Admittedly, digital devices serve as formidable learning instruments when deployed judiciously. Interactive educational applications stimulate early numeracy, foster linguistic proficiency, and facilitate interactive research for academic projects. Moreover, exposure to digital media familiarizes youngsters with technological tools indispensable for future employability in an increasingly computerized global economy.

However, these cognitive benefits are overshadowed by severe physical and psychological repercussions. Excessive sedentary screen time precipitates alarming rates of childhood obesity, optical strain, and chronic sleep disruption caused by blue-light emission. More critically, constant exposure to algorithmically curated content truncates attention spans and curtails spontaneous physical socialization, precipitating heightened adolescent anxiety and interpersonal detachment.

In conclusion, despite the educational utility of electronic devices, unregulated screen immersion fundamentally undermines children\'s physical well-being and emotional maturation. Guardians and academic institutions must therefore enforce rigorous screen-time quotas and revive active outdoor exploration.`
      },
      {
        id: 4,
        title: "Chủ đề 4 (Environment & Economy): Economic growth vs. Environmental protection",
        prompt: "Governments worldwide should prioritize economic growth even if it leads to environmental damage. Discuss both views and give your opinion.",
        category: "Môi Trường & Kinh Tế",
        type: "Discussion (Discuss both views & Opinion)",
        tip: "Cấu trúc 4 đoạn: Thảo luận tại sao tăng trưởng kinh tế tạo công ăn việc làm; thảo luận hậu quả suy thoái môi trường không thể phục hồi; kết luận rằng kinh tế xanh bền vững là bắt buộc.",
        sampleEssay: `A perennial dilemma confronting policy architects is whether macroeconomic expansion should take precedence over ecological conservation. While financial prosperity provides the capital required for societal well-being, I firmly believe that sacrificing the environment for short-term fiscal gains is fundamentally self-destructive.

Proponents of unrestrained economic growth contend that rapid industrial expansion is the most effective weapon against poverty. Developing nations, in particular, rely on manufacturing and natural resource extraction to construct infrastructure, generate employment, and elevate living standards. Without substantial GDP growth, governments cannot accumulate the sovereign tax revenue needed to fund social safety nets or invest in green technological innovations.

Nonetheless, prioritizing industrial output at the expense of ecological equilibrium induces irreversible catastrophes. Anthropogenic climate change, deforestation, and biodiversity depletion directly trigger agricultural failures, severe weather events, and public health crises that ultimately inflict staggering economic losses far exceeding initial industrial profits. A contaminated ecosystem undermines the very biological foundations upon which human economies depend.

In conclusion, treating economic growth and environmental preservation as mutually exclusive is a flawed paradigm. Governments must decouple economic prosperity from environmental exploitation by mandating circular economy principles and clean energy subsidies, ensuring that progress does not compromise planetary survival.`
      },
      {
        id: 5,
        title: "Chủ đề 5 (Climate Action): Individual lifestyle changes vs. Strict government legislation",
        prompt: "Many scientists argue that individual lifestyle changes are insufficient to combat climate change, and only strict government environmental regulations can succeed. To what extent do you agree or disagree?",
        category: "Hành Động Khí Hậu",
        type: "Opinion (Agree/Disagree)",
        tip: "Cấu trúc 4 đoạn: Đồng ý mạnh mẽ rằng chỉ có luật pháp và thuế carbon mới thay đổi được các tập đoàn xả thải lớn, trong khi cá nhân hóa trách nhiệm là không đủ.",
        sampleEssay: `In recent years, environmental discourse has increasingly questioned whether grass-roots lifestyle modifications alone can arrest planetary warming. I completely concur with the scientific consensus that voluntary civic measures are inadequate, and that rigorous governmental mandate is the only viable catalyst for meaningful climate remediation.

Undeniably, conscientious consumer behaviors—such as recycling household plastics or embracing public transit—foster environmental awareness and incrementally lower residential emissions. However, the cumulative magnitude of these individual initiatives is negligible when compared against the colossal carbon footprint generated by heavy manufacturing, fossil-fuel power grids, and international cargo shipping.

In stark contrast, sovereign governments wield unique legislative and regulatory levers capable of systemic structural transformation. By enforcing stringent carbon taxation, mandating rigorous corporate emissions disclosures, and terminating subsidies for coal and petroleum exploration, states can compel multinational conglomerates to decarbonize supply chains. For example, statutory bans on internal combustion engines across European jurisdictions have accelerated commercial investments in electric vehicle infrastructure far more effectively than voluntary consumer restraint ever could.

In conclusion, while personal ecological stewardship is commendable, it cannot dismantle the industrial architecture of pollution. Only decisive, legally binding government interventions can enforce industrial accountability and safeguard the global biosphere at the required scale.`
      },
      {
        id: 6,
        title: "Chủ đề 6 (Renewable Energy): Phasing out fossil fuels for clean green energy",
        prompt: "Some countries are transitioning from fossil fuels to renewable energy sources such as solar and wind. Do the advantages of this transition outweigh the disadvantages?",
        category: "Năng Lượng Tái Tạo",
        type: "Advantages vs. Disadvantages",
        tip: "Cấu trúc 4 đoạn: Nêu ngắn gọn thách thức gián đoạn năng lượng và chi phí ban đầu; sau đó chứng minh lợi ích to lớn về giảm khí thải, an ninh năng lượng và sức khỏe cộng đồng.",
        sampleEssay: `The geopolitical transition from combustible hydrocarbons toward sustainable energy infrastructures represents a defining epoch in modern history. Although this paradigm shift involves formidable initial capital expenditure and grid instability, I am convinced that the enduring benefits vastly outweigh the drawbacks.

The primary challenges associated with renewable energy stem from technical intermittency and transitional economic disruption. Solar photovoltaics and wind turbines rely heavily on ambient meteorological conditions, necessitating expensive battery storage technologies to maintain steady baseload power. Furthermore, the decommissioning of fossil-fuel extraction industries inevitably displaces hundreds of thousands of miners and refinery workers, causing localized economic distress.

Nevertheless, the environmental, geopolitical, and economic imperatives for decarbonization are overwhelming. Eliminating coal and petroleum consumption drastically curtails atmospheric greenhouse gases, thereby mitigating catastrophic ocean acidification and global warming. Moreover, harnessing domestic solar, geothermal, and wind resources liberates sovereign nations from price volatility in global oil markets, cementing national energy security while stimulating millions of high-tech engineering jobs.

In conclusion, despite the transitional costs and storage hurdles, the shift toward renewable power is an ecological and economic necessity. The long-term dividends of planetary preservation and decentralized energy independence unequivocally surpass the temporary friction of industrial realignment.`
      },
      {
        id: 7,
        title: "Chủ đề 7 (Globalization & Work): English proficiency in multinational corporations",
        prompt: "Many multinational corporations require employees to possess certified English proficiency. Why is this happening, and is it a positive or negative development?",
        category: "Toàn Cầu Hóa & Việc Làm",
        type: "Two-part Question (Causes & Evaluation)",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 giải thích nguyên nhân do chuỗi cung ứng toàn cầu và chuẩn hóa giao tiếp; Đoạn 2 đánh giá đây là sự phát triển tích cực nhưng cần bảo tồn ngôn ngữ bản địa.",
        sampleEssay: `In the contemporary corporate landscape, an overwhelming proportion of multinational enterprises mandate standardized English fluency as an indispensable employment prerequisite. This phenomenon is primarily driven by operational globalization, and I consider it a decidedly positive development for international collaboration.

The paramount catalyst behind this institutional requirement is the necessity for frictionless cross-border coordination. Modern conglomerates disperse research, manufacturing, and legal departments across diverse continents; without a universally recognized lingua franca, organizational cohesion collapses under the weight of translation delays and miscommunication. Implementing English as a standardized operational medium streamlines virtual meetings, technical documentation, and strategic alignment across culturally diverse teams.

From a socioeconomic perspective, this linguistic homogenization is overwhelmingly beneficial. For ambitious professionals, certified English proficiency serves as an egalitarian passport to lucrative career advancement, knowledge transfer, and international mobility. Furthermore, a shared language facilitates accelerated global knowledge dissemination, allowing breakthrough technological innovations and medical research to transcend parochial borders seamlessly.

In conclusion, corporate mandates for certified English proficiency reflect the practical demands of globalized commerce. Provided that local linguistic traditions are respectfully nurtured in cultural spheres, establishing a universal corporate language fosters unprecedented global productivity and mutual commercial prosperity.`
      },
      {
        id: 8,
        title: "Chủ đề 8 (Modern Workforce): Remote working from home",
        prompt: "Remote working and telecommuting from home have become widespread across many corporate sectors. Do the benefits of working from home outweigh the drawbacks?",
        category: "Xu Hướng Lao Động",
        type: "Advantages vs. Disadvantages",
        tip: "Cấu trúc 4 đoạn: Trình bày nhược điểm về ranh giới công việc-gia đình và sự suy giảm văn hóa công ty; chứng minh ưu điểm về tiết kiệm thời gian di chuyển và năng suất vượt trội.",
        sampleEssay: `The accelerated diffusion of telecommuting and remote work models has fundamentally restructured contemporary employment dynamics. While this paradigm introduces challenges regarding workplace cohesion and blurred domestic boundaries, I maintain that its advantages for productivity and personal well-being clearly eclipse the disadvantages.

On the negative side, remote working can erode organizational culture and psychological well-being. The absence of spontaneous hallway interactions inhibits organic brainstorming and weakens corporate camaraderie, occasionally culminating in feelings of professional isolation. Moreover, when domestic residences transform into operational offices, employees frequently struggle to disconnect from digital communications, exacerbating burnout and work-family conflict.

Conversely, the tangible benefits of telecommuting are monumental. By eradicating arduous daily commutes, workers reclaim hours each week, drastically reducing chronic commuter stress and greenhouse gas emissions associated with urban vehicular congestion. Furthermore, empirical workplace studies indicate that remote employees enjoy enhanced concentration on complex cognitive tasks when shielded from open-office distractions, resulting in heightened qualitative output and superior job satisfaction.

In conclusion, while telecommuting necessitates sophisticated managerial adaptations to preserve corporate identity, its capacity to optimize work-life balance and operational efficiency is unmatched. The merits of remote employment unequivocally outweigh its transitional challenges.`
      },
      {
        id: 9,
        title: "Chủ đề 9 (AI & Employment): Technological unemployment and labor automation",
        prompt: "Rapid advances in automation and artificial intelligence are threatening both manual and white-collar jobs. What problems does this cause, and what solutions can governments propose?",
        category: "Công Nghệ & Việc Làm",
        type: "Problems & Solutions",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 nêu các vấn đề về bất bình đẳng giàu nghèo và thất nghiệp cơ cấu; Đoạn 2 đề xuất chính sách đào tạo lại (reskilling) và thuế tự động hóa (robot tax).",
        sampleEssay: `The rapid deployment of generative artificial intelligence and industrial robotics has cast a formidable shadow over global labor markets, threatening to displace workers across clerical, creative, and technical domains. This dislocation precipitates severe socioeconomic crises, but proactive legislative interventions can mitigate its worst impacts.

The principal crisis unleashed by hyper-automation is widespread structural unemployment and acute income polarization. Unlike previous industrial revolutions that primarily automated manual tasks, contemporary algorithms rapidly surpass human proficiency in cognitive workflows like paralegal research, financial forecasting, and coding. Workers whose competencies become abruptly obsolete face protracted unemployment, widening the socioeconomic chasm between capital owners who monopolize automated intellectual property and disenfranchised laborers.

To avert catastrophic societal instability, sovereign states must implement systemic policy countermeasures. Firstly, educational curricula must be radically overhauled, emphasizing lifelong vocational reskilling programs funded through automation levies or targeted corporate robotics taxes. Secondly, governments should pilot Universal Basic Income (UBI) mechanisms to establish a non-negotiable living floor for citizens transitioning between traditional employment and the emerging digital gig economy.

In conclusion, unchecked labor automation threatens to unravel social cohesion through widespread technological unemployment. However, through aggressive vocational re-education and progressive redistribution mechanisms, societies can navigate this technological transition safely.`
      },
      {
        id: 10,
        title: "Chủ đề 10 (Public Health): Sugar and junk food taxation to combat obesity",
        prompt: "The rate of obesity and lifestyle-related diseases is increasing worldwide. Some believe governments should impose heavy taxes on fast food and sugary drinks to encourage healthier diets. To what extent do you agree or disagree?",
        category: "Sức Khỏe Cộng Đồng",
        type: "Opinion (Agree/Disagree)",
        tip: "Cấu trúc 4 đoạn: Đồng ý rằng thuế tiêu thụ đặc biệt là đòn bẩy kinh tế hiệu quả, nhưng cần kết hợp trợ cấp thực phẩm sạch và giáo dục dinh dưỡng học đường.",
        sampleEssay: `The modern epidemic of morbid obesity and cardiovascular morbidity poses an existential strain on public healthcare systems globally. I strongly agree that implementing fiscal penalties on ultra-processed foods and carbonated sugary beverages is a justified and potent intervention to promote public wellness.

The fundamental justification for punitive sin taxes lies in proven behavioral economics. Consumption of heavily sweetened drinks and fast food is highly price-elastic among vulnerable demographics, particularly adolescents and low-income households. When excise taxes artificially elevate the retail price of sugary sodas, consumer purchasing patterns predictably pivot toward healthier, un-taxed alternatives such as fresh water and unadulterated milk, as evidenced by successful tax rollouts in Mexico and the United Kingdom.

Furthermore, the revenue generated from junk food taxation can be ring-fenced to subsidize nutritious agrarian produce, such as fresh fruits and vegetables, while funding municipal sports facilities and preventative healthcare screening. Relying purely on voluntary nutritional labeling has proved utterly ineffective against the multi-billion-dollar marketing machines of multinational confectionery corporations; statutory economic disincentives are therefore indispensable.

In conclusion, imposing heavy excise duties on nutritionally bankrupt food products represents a medically urgent and economically sound policy. Combined with affordable healthy food subsidies, it constitutes our most effective bulwark against global chronic illness.`
      },
      {
        id: 11,
        title: "Chủ đề 11 (Urban Planning): Megacity congestion and housing shortages",
        prompt: "Rapid urbanization has caused traffic congestion, air pollution, and housing shortages in megacities. What are the main causes, and what urban planning measures can resolve these issues?",
        category: "Đô Thị Hóa & Quy Hoạch",
        type: "Problems & Solutions",
        tip: "Cấu trúc 4 đoạn: Nêu nguyên nhân do tập trung cơ hội việc làm và hạ tầng thiếu đồng bộ; giải pháp gồm phát triển đô thị vệ tinh và mở rộng giao thông công cộng tàu điện ngầm.",
        sampleEssay: `Across the developing and developed world, the exponential migration of citizens from rural hinterlands into metropolitan hubs has overwhelmed municipal infrastructure, precipitating crippling gridlock, deteriorating air quality, and astronomical housing costs. Addressing these crises requires identifying their root causes and deploying visionary regional planning.

The chief driver of hyper-urbanization is the intense concentration of economic capital, elite universities, and specialized healthcare facilities within primary metropolitan centers. Rural regions frequently languish in infrastructural underinvestment, compelling young demographics to migrate in pursuit of professional advancement. Consequently, municipal transit networks and residential zoning frameworks, designed for modest populations, collapse under excessive demographic density.

To rectify this unsustainable spatial imbalance, governments must prioritize regional decentralization and Transit-Oriented Development (TOD). By establishing connected satellite cities equipped with subsidized commercial zones, fiscal tax holidays, and high-speed intercity railway links, states can incentivize corporations and citizens to relocate away from congested megacity centers. Simultaneously, metropolitan authorities must mandate high-density affordable housing quotas near mass rapid transit (MRT) hubs to suppress speculative real estate inflation.

In conclusion, urban congestion and housing scarcity stem from centralized socioeconomic opportunity. Dispersing economic incentives toward vibrant secondary cities and funding mass rapid transit offer the most durable resolution.`
      },
      {
        id: 12,
        title: "Chủ đề 12 (Mental Health): Social media addiction and youth mental health",
        prompt: "The widespread use of social media platforms has led to rising anxiety, depression, and social isolation among adolescents. What factors contribute to this, and how can society address it?",
        category: "Sức Khỏe Tâm Thần & Mạng Xã Hội",
        type: "Causes & Solutions",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 phân tích nguyên nhân do thuật toán gây nghiện dopamine và văn hóa so sánh ngoại hình; Đoạn 2 đưa ra giải pháp kiểm soát độ tuổi và giáo dục sức khỏe tâm lý.",
        sampleEssay: `The contemporary epidemic of adolescent psychiatric distress has coincided precisely with the ubiquitous adoption of algorithmic social networking applications. This alarming crisis is fueled by predatory digital design and toxic social comparison, requiring concerted multi-stakeholder remedies.

The primary catalyst underlying youth mental degradation is the deliberate architecture of social media algorithms engineered to maximize user screen-retention via variable dopamine rewards. Constant exposure to hyper-curated, digitally enhanced portrayals of peers\' affluent lifestyles and beauty standards induces relentless status anxiety, body dysmorphia, and fear of missing out (FOMO). Furthermore, the substitution of nuanced face-to-face interaction with superficial digital metrics like likes and shares starves developing adolescents of authentic interpersonal intimacy, fostering acute existential loneliness.

To dismantle this digital crisis, regulatory and familial interventions must be enacted concurrently. National telecommunication watchdogs should mandate rigorous age-verification safeguards and ban algorithmic recommendation feeds for minors during nocturnal hours. Concurrently, academic institutions must embed mandatory digital resilience modules into health curricula, teaching adolescents to deconstruct virtual illusions while encouraging parents to establish screen-free dinner and bedroom sanctuaries.

In conclusion, adolescent psychological distress in the digital era is an engineered consequence of unregulated social platforms. Only by curtailing algorithmic exploitation and re-establishing grounded interpersonal relationships can society preserve the mental sanctity of youth.`
      },
      {
        id: 13,
        title: "Chủ đề 13 (Cultural Heritage): Preserving historical heritage vs. Modern public services",
        prompt: "Some argue that government budgets should be spent on preserving historical monuments and cultural heritage, while others think money is better spent on modern public services like hospitals. Discuss both views and give your opinion.",
        category: "Văn Hóa & Ngân Sách Quốc Gia",
        type: "Discussion (Discuss both views & Opinion)",
        tip: "Cấu trúc 4 đoạn: Thảo luận tầm quan trọng của y tế và cơ sở hạ tầng thiết yếu; thảo luận vai trò linh hồn dân tộc và kinh tế du lịch của di sản; kết luận mô hình công tư kết hợp.",
        sampleEssay: `The allocation of sovereign fiscal budgets frequently sparks passionate philosophical debates regarding whether priority should be accorded to historical preservation or immediate public infrastructure. While safeguarding citizen physical welfare is imperative, I contend that cultural conservation is equally vital for national identity and economic vitality.

Those who advocate prioritizing modern public amenities point to the non-negotiable necessities of life. In many nations, overloaded public hospitals, dilapidated schools, and congested transport arteries directly impair citizens\' quality of life and economic productivity. Diverting millions of dollars to restore ancient masonry while impoverished patients face acute healthcare shortages strikes many as a misplaced, morally questionable budgetary priority.

Nevertheless, preserving architectural landmarks and intangible cultural heritage is far from an indulgent vanity. Historic monuments embody a society\'s collective memory, anchoring citizen identity and national solidarity against the tide of cultural homogenization. Furthermore, well-conserved cultural landmarks serve as potent economic engines that stimulate vibrant international tourism industries, generating substantial tax revenues that can subsequently be reinvested into public health and education.

In conclusion, public administration should not treat civic infrastructure and cultural conservation as mutually exclusive adversaries. A judicious fiscal policy combines public funding with private heritage philanthropy, ensuring both bodily health and cultural enrichment.`
      },
      {
        id: 14,
        title: "Chủ đề 14 (Crime & Punishment): Incarceration vs. Education & Vocational rehabilitation",
        prompt: "Some believe that harsher prison sentences are the most effective deterrent to crime, while others argue that education and vocational rehabilitation are far more effective. Discuss both views and give your opinion.",
        category: "Pháp Luật & Cải Tạo Tội Phạm",
        type: "Discussion (Discuss both views & Opinion)",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 nêu tính răn đe của án tù nặng; Đoạn 2 chứng minh giáo dục nghề nghiệp giải quyết gốc rễ tái phạm (recidivism); Kết luận mô hình cải tạo tiến bộ.",
        sampleEssay: `The optimal philosophical orientation of the criminal justice system remains an enduring source of legal and moral contention. While punitive incarceration delivers retributive deterrence, I am firmly convinced that comprehensive educational and vocational rehabilitation provides a far more sustainable strategy for reducing recidivism.

Advocates of severe penal sentencing maintain that prolonged imprisonment is necessary to incapacitate dangerous offenders and satisfy civic demands for retributive justice. The prospect of lengthy confinement behind bars theoretically functions as a psychological deterrent to prospective lawbreakers, while assuring crime victims that their suffering has been acknowledged by the state. Without stringent penalties, public faith in the rule of law may erode, potentially encouraging vigilantism.

However, empirical penal research consistently proves that harsh prison sentences fail to deter crime and frequently exacerbate criminal tendencies. Incarceration concentrates offenders in antisocial environments where criminal networks are reinforced, while societal stigmatization upon release renders lawful employment virtually unattainable. In contrast, correctional models that provide accredited secondary schooling, psychological trauma therapy, and vocational apprenticeships equip ex-convicts with viable socioeconomic alternatives, driving recidivism rates downward dramatically, as evidenced by Nordic justice systems.

In conclusion, although punitive confinement remains necessary for incorrigible violent criminals, education and humane vocational rehabilitation must constitute the primary pillar of modern justice. Healing societal wounds is vastly superior to perpetual punishment.`
      },
      {
        id: 15,
        title: "Chủ đề 15 (Consumerism & Ads): Commercial advertising manipulating consumer behavior",
        prompt: "Modern advertising creates artificial consumer needs and promotes an unsustainable culture of materialistic consumerism. To what extent do you agree or disagree?",
        category: "Văn Hóa Tiêu Dùng & Quảng Cáo",
        type: "Opinion (Agree/Disagree)",
        tip: "Cấu trúc 4 đoạn: Đồng ý mạnh mẽ rằng quảng cáo hiện đại khai thác tâm lý bất an để bán những thứ không cần thiết, gây lãng phí tài nguyên và rác thải môi trường.",
        sampleEssay: `In our hyper-commercialized global economy, promotional marketing campaigns permeate virtually every digital interface and public space. I wholeheartedly agree that contemporary advertising no longer merely informs citizens of product availability, but aggressively manufactures artificial desires, cultivating a toxic and ecologically destructive culture of consumerism.

The primary methodology of modern advertising relies on sophisticated psychological manipulation. Rather than highlighting objective utilitarian utility, marketing agencies orchestrate campaigns that associate ownership of luxury automobiles, fast fashion, or cutting-edge smartphones with elite social prestige, romantic desirability, and personal self-worth. By subtly exacerbating consumers\' insecurities regarding their social standing, promotional algorithms convince individuals that happiness is contingent upon acquiring non-essential, ephemeral goods.

This manufactured consumerism yields profound ecological and economic consequences. The culture of planned obsolescence and fast consumption drives catastrophic planetary resource depletion, accumulating mountains of electronic waste and non-biodegradable plastics in landfills. Moreover, widespread advertising encourages irresponsible personal credit accumulation, plunging ordinary working-class families into crippling consumer debt in pursuit of unneeded status symbols.

In conclusion, modern advertising has devolved from benign commercial notification into aggressive psychological coercion. Governments must enforce stricter truth-in-advertising regulations and ban targeted predatory marketing directed at impressionable youth to arrest this unsustainable materialistic tide.`
      }
    ];

    // Cập nhật thẻ hiển thị đề bài chi tiết khi học viên đổi chủ đề
    function onWritingTopicChange() {
      const select = document.getElementById('writing-topic-select');
      if (!select) return;
      const selectedValue = select.value;
      const topicObj = IELTS_WRITING_TOPICS.find(t => t.prompt === selectedValue) || IELTS_WRITING_TOPICS[0];

      const fullTextEl = document.getElementById('writing-topic-full-text');
      const badgeEl = document.getElementById('writing-topic-type-badge');
      const tipEl = document.getElementById('writing-topic-tip');

      if (fullTextEl) fullTextEl.textContent = `"${topicObj.prompt}"`;
      if (badgeEl) badgeEl.textContent = topicObj.type;
      if (tipEl) tipEl.textContent = topicObj.tip;
    }

    // Chèn bài luận mẫu Band 8.0+ tương ứng chuẩn xác với chủ đề đang chọn
    function insertSampleBand8Essay() {
      const select = document.getElementById('writing-topic-select');
      const selectedValue = select ? select.value : '';
      const topicObj = IELTS_WRITING_TOPICS.find(t => t.prompt === selectedValue) || IELTS_WRITING_TOPICS[0];

      const essayInput = document.getElementById('writing-essay-input');
      if (essayInput) {
        essayInput.value = topicObj.sampleEssay.trim();
        updateEssayWordCount();
        if (typeof showToast === 'function') {
          showToast(`Đã chèn bài luận mẫu Band 8.0 cho ${topicObj.category}!`, 'success');
        }
      }
    }

    // Danh sách 8 câu Speaking mẫu kèm IPA
    const SPEAKING_SENTENCES = [
      {
        title: "IELTS Speaking Part 3 (Technology & Education)",
        text: "Interactive online platforms help bridge the gap between theoretical knowledge and practical skills.",
        ipa: "/ˌɪn.təˈræk.tɪv ˈɒn.laɪn ˈplæt.fɔːmz help brɪdʒ ðə ɡæp bɪˈtwiːn θɪəˈret.ɪ.kəl ˈnɒl.ɪdʒ ænd ˈpræk.tɪ.kəl skɪlz/"
      },
      {
        title: "Business English (Corporate Strategy)",
        text: "Sustainable business practices foster long-term shareholder value and brand loyalty.",
        ipa: "/səˈsteɪ.nə.bəl ˈbɪz.nɪs ˈpræk.tɪ.sɪz ˈfɒs.tər ˌlɒŋ.tɜːm ˈʃeəˌhəʊl.dər ˈvæl.juː ænd brænd ˈlɔɪ.əl.ti/"
      },
      {
        title: "IELTS Speaking Part 2 (Personal Growth & Resilience)",
        text: "Overcoming academic obstacles requires resilience, disciplined habits, and critical thinking.",
        ipa: "/ˌəʊ.vəˈkʌm.ɪŋ ˌæk.əˈdem.ɪk ˈɒb.stə.kəlz rɪˈkwaɪəz rɪˈzɪl.jəns, ˈdɪs.ə.plɪnd ˈhæb.ɪts, ænd ˈkrɪt.ɪ.kəl ˈθɪŋ.kɪŋ/"
      },
      {
        title: "IELTS Speaking Part 3 (Environmental Sustainability)",
        text: "Renewable energy adoption plays a pivotal role in mitigating catastrophic climate change.",
        ipa: "/rɪˈnjuː.ə.bəl ˈen.ə.dʒi əˈdɒp.ʃən pleɪz ə ˈpɪv.ə.təl rəʊl ɪn ˈmɪt.ɪ.ɡeɪ.tɪŋ ˌkæt.əˈstrɒf.ɪk ˈklaɪ.mət tʃeɪndʒ/"
      },
      {
        title: "IELTS Speaking Part 3 (AI & Future Workforce)",
        text: "Artificial intelligence will inevitably reshape occupational landscapes across all corporate sectors.",
        ipa: "/ˌɑː.tɪˈfɪʃ.əl ɪnˈtel.ɪ.dʒəns wɪl ɪnˈev.ɪ.tə.bli ˌriːˈʃeɪp ˌɒk.jəˈpeɪ.ʃən.əl ˈlænd.skeɪps əˈkrɒs ɔːl ˈsek.tərz/"
      },
      {
        title: "IELTS Speaking Part 1 (Urbanization & Hometown)",
        text: "My hometown has experienced tremendous urbanization with high-rise buildings and modern transport.",
        ipa: "/maɪ ˈhəʊm.taʊn hæz ɪkˈspɪə.ri.ənst trəˈmen.dəs ˌɜː.bən.aɪˈzeɪ.ʃən wɪð haɪ-raɪz ˈbɪl.dɪŋz ænd ˈmɒd.ən ˈtræn.spɔːt/"
      },
      {
        title: "IELTS Speaking Part 3 (Cultural Heritage Preservation)",
        text: "Preserving indigenous cultural traditions is paramount in our increasingly homogenized world.",
        ipa: "/prɪˈzɜː.vɪŋ ɪnˈdɪdʒ.ɪ.nəs ˈkʌl.tʃər.əl trəˈdɪʃ.ənz ɪz ˈpær.ə.maʊnt ɪn ˈaʊə.li ɪnˈkriː.sɪŋ.li həˈmɒdʒ.ə.naɪzd wɜːld/"
      },
      {
        title: "IELTS Speaking Part 2 (Technological Breakthroughs)",
        text: "Technological breakthroughs have fundamentally altered how individuals communicate and collaborate.",
        ipa: "/ˌtek.nəˈlɒdʒ.ɪ.kəl ˈbreɪk.θruːz hæv ˌfʌn.dəˈmen.təl.i ˈɔːl.təd haʊ ˌɪn.dɪˈvɪdʒ.u.əlz kəˈmjuː.nɪ.keɪt ænd kəˈlæb.ə.reɪt/"
      }
    ];

    function changeSpeakingSentence(idx) {
      const item = SPEAKING_SENTENCES[Number(idx)] || SPEAKING_SENTENCES[0];
      const targetText = document.getElementById('speaking-target-text');
      const targetIpa = document.getElementById('speaking-target-ipa');
      if (targetText) targetText.textContent = `"${item.text}

    window.onWritingTopicChange = onWritingTopicChange;
    window.insertSampleBand8Essay = insertSampleBand8Essay;
    window.changeSpeakingSentence = changeSpeakingSentence;
"`;
      if (targetIpa) targetIpa.textContent = item.ipa;
    }


    async function evaluateIeltsWriting() {
      if (!getValidToken()) { openLoginModal(); return; }
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
    // changeSpeakingSentence moved to IELTS SPEAKING DATABASE

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
      if (!getValidToken()) { openLoginModal(); return; }
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
    // 18. CỤM TÍNH NĂNG BỔ SUNG 3: MULTI-EXAM, LOBBY, PRACTICE MODE & BOOKMARKS
    // ==============================================================
    window.isExamActive = false;

        const EXAM_METADATA = {
      '670000000000000000000040': {
        code: 'Đề số 1 • Placement Test',
        title: 'Đánh Giá Năng Lực Quốc Tế (English Placement & IELTS/TOEIC Test)',
        durationMinutes: 30,
        questionsCount: 8,
        level: 'A1 - C2 Toàn Diện (CEFR)',
        badgeColor: 'text-brand-600 bg-brand-50 border-brand-200 dark:bg-brand-950/40 dark:text-indigo-400',
        description: 'Bài khảo sát toàn diện đánh giá ngữ pháp, từ vựng và năng lực tư duy học thuật. Điểm số bài thi sẽ tự động phân loại trình độ và đồng bộ vào Cây kỹ năng tri thức (Knowledge Graph).'
      },
      '67000000000000000000004a': {
        code: 'Đề số 2 • ETS TOEIC 850+',
        title: 'ETS TOEIC 850+ Part 5 Ngữ Pháp & Từ Vựng Chuyên Sâu',
        durationMinutes: 15,
        questionsCount: 8,
        level: 'Intermediate - Advanced (TOEIC 750-990)',
        badgeColor: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
        description: 'Chuyên đề rèn luyện phản xạ hoàn thành câu ngắn Part 5 theo chuẩn format ETS, tập trung bẫy từ loại, liên từ chỉ quan hệ logic và thành ngữ kinh doanh quốc tế.'
      },
      '67000000000000000000004b': {
        code: 'Đề số 3 • IELTS Academic',
        title: 'IELTS Academic Reading & Lexical Band 7.5+',
        durationMinutes: 25,
        questionsCount: 8,
        level: 'High Intermediate - Advanced (IELTS 6.5 - 8.0+)',
        badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
        description: 'Thử thách kỹ năng đọc quét thông tin, nhận diện bẫy suy luận ngữ cảnh và kho từ vựng học thuật thuộc danh mục Academic Word List (AWL).'
      },
      '67000000000000000000004c': {
        code: 'Đề số 4 • Core Grammar',
        title: 'Chuyên Đề 12 Thì & Mệnh Đề Điều Kiện (Core Grammar Mastery)',
        durationMinutes: 20,
        questionsCount: 8,
        level: 'Foundational Grammar (A2 - B2)',
        badgeColor: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400',
        description: 'Đánh giá độ chuẩn xác về hệ thống 12 thì cơ bản & nâng cao, thể bị động đặc biệt, câu điều kiện loại 0, 1, 2, 3 và đảo ngữ điều kiện.'
      },
      '67000000000000000000004d': {
        code: 'Đề số 5 • IELTS Lexicon 7.0+',
        title: 'IELTS Speaking & Listening: Academic Lexical Resource & Signposting Band 7.0+',
        durationMinutes: 20,
        questionsCount: 8,
        level: 'Trung cao cấp (CEFR B2 - C1)',
        badgeColor: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400',
        description: 'Chuyên sâu về từ vựng học thuật chủ đề Speaking Part 1, 2, 3 và từ định hướng tư duy (Signpost Words) trong bài thi Listening Section 3 & 4.'
      },
      '67000000000000000000004e': {
        code: 'Đề số 6 • Business English',
        title: 'Business English: Giao Tiếp, Thuyết Trình & Thư Tín Thương Mại Quốc Tế',
        durationMinutes: 20,
        questionsCount: 8,
        level: 'Chuyên nghiệp (CEFR B2 - C1)',
        badgeColor: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
        description: 'Rèn luyện văn phong đàm phán, email thương mại, xử lý xung đột dự án và thuật ngữ quản trị doanh nghiệp đa quốc gia.'
      },
      '67000000000000000000004f': {
        code: 'Đề số 7 • VSTEP B2 - C1',
        title: 'VSTEP B2 - C1: Đọc Hiểu Học Thuật & Ngữ Pháp Ứng Dụng Sau Đại Học',
        durationMinutes: 25,
        questionsCount: 8,
        level: 'Bậc 4 - Bậc 5 Khung 6 Bậc VN',
        badgeColor: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400',
        description: 'Đề luyện thi định hướng chứng chỉ VSTEP chuẩn Bộ GD&ĐT dành cho học viên thạc sĩ, tiến sĩ và giảng viên đại học.'
      },
      '670000000000000000000050': {
        code: 'Đề số 8 • Collocations & Idioms',
        title: 'Cụm Từ Cố Định & Cụm Động Từ Bản Xứ (Collocations & Phrasal Verbs Mastery)',
        durationMinutes: 15,
        questionsCount: 8,
        level: 'Lưu loát tự nhiên (CEFR B2 - C1)',
        badgeColor: 'text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400',
        description: 'Làm chủ các cụm từ kết hợp tự nhiên (Natural Collocations) và Phrasal Verbs nâng cao giúp bài viết và bài nói tự nhiên như người bản xứ.'
      },
      '670000000000000000000051': {
        code: 'Đề số 9 • Phonetics & Stress',
        title: 'Ngữ Âm IPA, Quy Tắc Trọng Âm & Connected Speech (Phonetics Mastery)',
        durationMinutes: 15,
        questionsCount: 8,
        level: 'Ngữ âm chuẩn (Mọi cấp độ)',
        badgeColor: 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
        description: 'Phân biệt các cặp nguyên âm dễ nhầm lẫn (/i:/ vs /ɪ/, /æ/ vs /e/), quy tắc nhấn trọng âm từ 2-4 âm tiết và hiện tượng nuốt âm/nối âm trong hội thoại thực tế.'
      },
      '670000000000000000000052': {
        code: 'Đề số 10 • SAT / GRE Verbal',
        title: 'SAT / GRE Advanced Lexical Reasoning: Tư Duy Phản Biện & Từ Vựng Cực Khó',
        durationMinutes: 25,
        questionsCount: 8,
        level: 'Thành thạo bản ngữ (CEFR C2)',
        badgeColor: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
        description: 'Đề khảo sát tư duy ngữ nghĩa cao cấp, văn cảnh học thuật phức tạp và suy luận logic tương đương các kỳ thi tuyển sinh sau đại học tại Mỹ.'
      }
    };

    function showExamLobby() {
      window.isExamActive = false;
      if (typeof m2 !== 'undefined') m2.active = false;
      clearInterval(examCountdown);

      const meta = EXAM_METADATA[EXAM_ID] || EXAM_METADATA['670000000000000000000040'];

      const titleEl = document.getElementById('exam-page-title');
      if (titleEl) titleEl.textContent = meta.title;

      const timerEl = document.getElementById('exam-timer-display');
      if (timerEl) timerEl.textContent = `${String(meta.durationMinutes).padStart(2, '0')}:00`;

      const acBadge = document.getElementById('anti-cheat-status-badge');
      if (acBadge) {
        acBadge.textContent = 'CHỜ BẮT ĐẦU (0/3)';
        acBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-700/60 text-slate-300 border border-slate-600';
      }

      document.getElementById('m2-question-nav')?.remove();
      
      const resCard = document.getElementById('exam-result-card');
      if (resCard) resCard.classList.add('hidden');

      const container = document.getElementById('exam-questions-box');
      if (!container) return;

      const activeToken = window.currentToken || (typeof currentToken !== 'undefined' ? currentToken : null) || localStorage.getItem('edupro_token');
      const isLogged = !!activeToken;

      container.innerHTML = `
        <div id="exam-lobby-card" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div class="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.badgeColor} mb-2">
                <i class="fa-solid fa-graduation-cap"></i> ${meta.code}
              </span>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                ${meta.title}
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                ${meta.description}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0">
                <i class="fa-solid fa-stopwatch"></i>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Thời gian</div>
                <div class="text-sm font-extrabold text-slate-900 dark:text-white">${meta.durationMinutes} Phút</div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0">
                <i class="fa-solid fa-list-check"></i>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Số câu hỏi</div>
                <div class="text-sm font-extrabold text-slate-900 dark:text-white">${meta.questionsCount} Câu Trắc Nghiệm</div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0">
                <i class="fa-solid fa-database"></i>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Lưu tự động</div>
                <div class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">Redis Hash Realtime</div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg shrink-0">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <div class="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Chống gian lận</div>
                <div class="text-sm font-extrabold text-rose-600 dark:text-rose-400">Giám sát Tab (Tối đa 3)</div>
              </div>
            </div>
          </div>

          <div class="mb-8 p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/40 border border-indigo-100 dark:border-slate-700/60">
            <h4 class="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-circle-info text-brand-600"></i> Hướng dẫn & Quy chế làm bài thi:
            </h4>
            <ul class="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li class="flex items-start gap-2.5">
                <i class="fa-solid fa-circle-check text-emerald-500 mt-1 shrink-0 text-xs"></i>
                <span><strong>Đồng hồ đếm ngược:</strong> Chỉ chính thức bắt đầu tính giờ khi bạn bấm nút <strong>"Bắt đầu làm bài thi"</strong> bên dưới.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <i class="fa-solid fa-circle-check text-emerald-500 mt-1 shrink-0 text-xs"></i>
                <span><strong>Cơ chế tự động lưu:</strong> Mỗi lựa chọn đáp án được đồng bộ tức thì vào <strong>Redis Hash</strong> kèm TTL và dự phòng MongoDB, không lo mất bài khi gián đoạn mạng.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <i class="fa-solid fa-circle-exclamation text-amber-500 mt-1 shrink-0 text-xs"></i>
                <span><strong>Quy định nghiêm ngặt:</strong> Không chuyển tab, đổi cửa sổ hoặc thu nhỏ trình duyệt trong lúc làm bài. Rời màn hình quá 3 lần sẽ bị khóa bài (0 điểm).</span>
              </li>
              <li class="flex items-start gap-2.5">
                <i class="fa-solid fa-flag text-indigo-500 mt-1 shrink-0 text-xs"></i>
                <span><strong>Đặt cờ câu hỏi (Flag):</strong> Bạn có thể gắn cờ các câu khó để xem lại nhanh qua thanh số điều hướng trước khi nộp bài.</span>
              </li>
            </ul>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div class="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <i class="fa-solid fa-clock text-brand-500"></i>
              <span>Bạn đã sẵn sàng? Hãy chuẩn bị tâm lý và bấm bắt đầu để tính giờ.</span>
            </div>
            ${isLogged ? `
              <button id="btn-start-exam-now" onclick="confirmStartExam()" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 hover:from-brand-700 hover:to-indigo-800 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer">
                <i class="fa-solid fa-play text-xs"></i>
                <span>BẮT ĐẦU LÀM BÀI THI</span>
              </button>
            ` : `
              <button onclick="handleExamStartOrLogin()" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer">
                <i class="fa-solid fa-right-to-bracket text-xs"></i>
                <span>ĐĂNG NHẬP ĐỂ BẮT ĐẦU</span>
              </button>
            `}
          </div>
        </div>
      `;
    }

    function handleExamStartOrLogin() {
      const activeToken = window.currentToken || (typeof currentToken !== 'undefined' ? currentToken : null) || localStorage.getItem('edupro_token');
      if (activeToken) {
        currentToken = activeToken;
        window.currentToken = activeToken;
        if (typeof syncUserUI === 'function') syncUserUI();
        confirmStartExam();
      } else {
        openLoginModal();
      }
    }
    window.handleExamStartOrLogin = handleExamStartOrLogin;

    async function confirmStartExam() {
      const activeToken = window.currentToken || (typeof currentToken !== 'undefined' ? currentToken : null) || localStorage.getItem('edupro_token');
      if (!activeToken) {
        openLoginModal();
        return;
      }
      currentToken = activeToken;
      window.currentToken = activeToken;
      const btn = document.getElementById('btn-start-exam-now');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Đang khởi tạo bài thi...</span>';
      }
      window.isExamActive = true;
      if (typeof m2 !== 'undefined') m2.active = true;
      initAntiCheatMonitoring();
      await startExam();
    }

    function selectExamFromCatalog(examId, btnElem) {
      if (window.isExamActive && (typeof m2 === 'undefined' || m2.active)) {
        if (!confirm('Bạn đang trong một phiên làm bài thi. Rời sang đề khác sẽ không xóa kết quả hiện tại nhưng đồng hồ của đề thi này vẫn tiếp tục tính. Bạn có chắc muốn xem đề khác?')) {
          return;
        }
        window.isExamActive = false;
        if (typeof m2 !== 'undefined') m2.active = false;
        clearInterval(examCountdown);
      }
      EXAM_ID = examId;
      document.querySelectorAll('.exam-cat-card, .exam-catalog-btn').forEach(card => {
        card.className = 'exam-cat-card p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 text-left transition-all';
      });
      if (btnElem) {
        btnElem.className = 'exam-cat-card p-3.5 rounded-2xl border-2 border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 text-left transition-all';
      }
      showExamLobby();
    }

    function togglePracticeMode(checked) {
      const cb = document.getElementById('practice-mode-checkbox');
      isPracticeMode = typeof checked === 'boolean' ? checked : (cb ? cb.checked : !isPracticeMode);
      renderExamQuestions();
    }

    async function toggleQuestionBookmark(questionId) {
      if (!getValidToken()) { openLoginModal(); return; }
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
      let q = null;
      if (Array.isArray(allFlashcards) && allFlashcards.length >= 4) {
        const target = allFlashcards[Math.floor(Math.random() * allFlashcards.length)];
        const distractors = allFlashcards.filter(c => c.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        const opts = [target.meaning || target.meaningVi, ...distractors.map(d => d.meaning || d.meaningVi)];
        const correctIdx = Math.floor(Math.random() * 4);
        const temp = opts[correctIdx];
        opts[correctIdx] = opts[0];
        opts[0] = temp;
        q = {
          word: target.word,
          phonetic: `${target.phonetic || ''} • ${target.pos || ''}`,
          options: opts,
          answer: correctIdx
        };
      } else {
        q = ARENA_QUESTION_POOL[Math.floor(Math.random() * ARENA_QUESTION_POOL.length)];
      }
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
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${typeof esc === 'function' ? esc(d.content) : d.content}</p>
              ${typeof m2Staff === 'function' && m2Staff() ? m2Button("🗑 Xóa bình luận", `m2Moderate('discussions','${d._id}')`) : ""}
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

    // --- TÍNH NĂNG 2: GIÁM SÁT GIAN LẬN THI TRỰC TUYẾN (ANTI-CHEAT REAL-TIME FOCUS TRACKER) ---
    var antiCheatListenerInitialized = false;
    var lastAntiCheatViolationAt = 0;

    function initAntiCheatMonitoring() {
      if (antiCheatListenerInitialized) return;
      antiCheatListenerInitialized = true;

      function triggerRealViolation(reason) {
        const examSection = document.getElementById('section-exam');
        if (!examSection || examSection.classList.contains('hidden')) return;
        if (!window.isExamActive || (typeof m2 !== 'undefined' && !m2.active) || isExamDisqualified) return;

        // Debounce / Throttle: Tránh 1 lần chuyển tab bị kích hoạt 2 lần do cả blur lẫn visibilitychange
        const now = Date.now();
        if (now - lastAntiCheatViolationAt < 2500) return;
        lastAntiCheatViolationAt = now;

        logAntiCheatViolation(reason);
      }

      // 1. Bắt sự kiện chuyển Tab hoặc thu nhỏ trình duyệt
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          triggerRealViolation('TAB_SWITCH_OR_MINIMIZE');
        }
      });

      // 2. Bắt sự kiện rời cửa sổ (Alt + Tab, mở cửa sổ khác, rời màn hình làm bài)
      window.addEventListener('blur', () => {
        triggerRealViolation('WINDOW_FOCUS_LOST');
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

            clearInterval(examCountdown);
            submitExam(true);
          } else {
            if (modalTitle) modalTitle.innerText = 'Cảnh Báo Vi Phạm Quy Chế Thi';
            if (modalDesc) modalDesc.innerText = 'Bạn vừa chuyển tab hoặc rời màn hình làm bài thi. Hành vi này đã được ghi nhận vào nhật ký kiểm toán hệ thống (Cassandra & Redis).';
            if (btnText) btnText.innerText = 'Tôi Đã Hiểu & Quay Lại Làm Bài Ngay';
            if (btnIcon) btnIcon.className = 'fa-solid fa-rotate-left text-xs';
            if (modalBtn) modalBtn.className = 'w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2';
          }

          const modal = document.getElementById('anti-cheat-modal');
          if (modal) modal.classList.remove('hidden');
        }
      } catch (e) {}
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

// ==============================================================================
// VOCABULARY CREATOR, AUTOPLAY & WRITING LAB (TASK 1.6 - 1.10)
// ==============================================================================
function openAddFlashcardModal() {
  const modal = document.getElementById('modal-add-flashcard');
  if (modal) modal.classList.remove('hidden');
}

function closeAddFlashcardModal() {
  const modal = document.getElementById('modal-add-flashcard');
  if (modal) modal.classList.add('hidden');
}

async function addNewCustomFlashcard(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!getValidToken()) { openLoginModal(); return; }
  const word = document.getElementById('vocab-word').value.trim();
  const phonetic = document.getElementById('vocab-phonetic').value.trim();
  const meaning = document.getElementById('vocab-meaning').value.trim();
  const example = document.getElementById('vocab-example').value.trim();
  const category = document.getElementById('vocab-category').value;

  try {
    const res = await fetch(`${API_BASE}/courses/flashcards/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
      body: JSON.stringify({ word, phonetic, meaning, example, category })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Thêm từ vựng thất bại');
    const form = document.querySelector('#modal-add-flashcard form');
    if (form) form.reset();
    closeAddFlashcardModal();
    showToast(json.message || 'Đã thêm từ vựng mới vào kho lưu trữ!', 'success');
    loadFlashcardDeck();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

var isAutoplayingVocab = false;
var vocabAutoplayTimer = null;

function stopVocabAutoplay() {
  isAutoplayingVocab = false;
  if (vocabAutoplayTimer) clearTimeout(vocabAutoplayTimer);
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const btn = document.getElementById('btn-vocab-autoplay');
  if (btn) btn.innerHTML = '🎧 Tự động phát (Autoplay)';
}

function toggleVocabAutoplay() {
  if (isAutoplayingVocab) { stopVocabAutoplay(); return; }
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    showToast('Trình duyệt không hỗ trợ đọc âm thanh Web Speech API', 'error');
    return;
  }
  const cards = (typeof allFlashcards !== 'undefined' && allFlashcards.length) ? allFlashcards : [];
  if (!cards.length) { showToast('Chưa có từ vựng nào để tự động phát', 'warning'); return; }

  isAutoplayingVocab = true;
  const btn = document.getElementById('btn-vocab-autoplay');
  if (btn) btn.innerHTML = '⏹️ Dừng phát';

  const wait = ms => new Promise(r => { vocabAutoplayTimer = setTimeout(r, ms); });
  const say = (text, lang) => new Promise(resolve => {
    if (!isAutoplayingVocab) return resolve();
    const utt = new SpeechSynthesisUtterance(String(text || ''));
    utt.lang = lang;
    utt.onend = resolve;
    utt.onerror = resolve;
    window.speechSynthesis.speak(utt);
  });

  (async () => {
    for (const card of cards) {
      if (!isAutoplayingVocab) break;
      const cardEl = document.getElementById(`fc-card-${card.id}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardEl.classList.add('ring-4', 'ring-brand-500');
      }
      await say(card.word, 'en-US');
      if (!isAutoplayingVocab) break;
      await wait(1500);
      if (typeof toggleFlashcardMeaning === 'function') toggleFlashcardMeaning(card.id, true);
      await say(card.meaning || card.meaningVi || '', 'vi-VN');
      if (!isAutoplayingVocab) break;
      await wait(1800);
      if (cardEl) cardEl.classList.remove('ring-4', 'ring-brand-500');
    }
    if (isAutoplayingVocab) stopVocabAutoplay();
  })();
}

async function exportVocabCsv() {
  if (!getValidToken()) { openLoginModal(); return; }
  try {
    const res = await fetch(`${API_BASE}/courses/flashcards/export`, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    if (!res.ok) throw new Error('Không thể xuất file từ vựng');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EduPro_Vocabulary.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file từ vựng EduPro_Vocabulary.csv!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// IELTS WRITING LAB EXTENSIONS (TASK 1.9 & 1.10)
var currentWritingTask = 'task2';
var writingDrafts = { task1: '', task2: '' };
var writingAutosaveTimer = null;

function switchWritingTask(type) {
  currentWritingTask = type === 'task1' ? 'task1' : 'task2';
  const isTask1 = currentWritingTask === 'task1';
  const task1Btn = document.getElementById('btn-task1-tab');
  const task2Btn = document.getElementById('btn-task2-tab');
  if (task1Btn) task1Btn.className = isTask1 ? 'px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md' : 'px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs';
  if (task2Btn) task2Btn.className = !isTask1 ? 'px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md' : 'px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs';

  const chartBox = document.getElementById('writing-task1-chart');
  if (chartBox) chartBox.classList.toggle('hidden', !isTask1);

  const topicInput = document.getElementById('writing-topic-input');
  if (topicInput) {
    topicInput.value = isTask1
      ? 'The graph below shows the proportion of the population aged 65 and over between 1940 and 2040 in three countries (USA, Sweden, Japan).'
      : 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?';
  }
  loadWritingDraft(currentWritingTask);
}

async function loadWritingDraft(taskType = currentWritingTask) {
  if (!currentToken) return;
  try {
    const res = await fetch(`${API_BASE}/exams/writing/draft?taskType=${taskType}`, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    const json = await res.json();
    if (json.success && json.essay && json.essay.trim()) {
      writingDrafts[taskType] = json.essay;
      const banner = document.getElementById('writing-draft-banner');
      if (banner) banner.classList.remove('hidden');
    }
  } catch (e) {}
}

function restoreWritingDraft() {
  const essayInput = document.getElementById('writing-essay-input') || document.getElementById('ielts-writing-input');
  if (essayInput && writingDrafts[currentWritingTask]) {
    essayInput.value = writingDrafts[currentWritingTask];
    showToast('Đã khôi phục bài viết từ bản nháp Redis!', 'success');
  }
  const banner = document.getElementById('writing-draft-banner');
  if (banner) banner.classList.add('hidden');
}

async function discardWritingDraft() {
  const banner = document.getElementById('writing-draft-banner');
  if (banner) banner.classList.add('hidden');
  writingDrafts[currentWritingTask] = '';
  if (currentToken) {
    await fetch(`${API_BASE}/exams/writing/draft?taskType=${currentWritingTask}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${currentToken}` }
    }).catch(() => {});
  }
}
