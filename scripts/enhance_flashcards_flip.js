// -*- coding: utf-8 -*-
const fs = require('fs');
const path = require('path');
const { MongoClient } = require(path.join(__dirname, '../01_Source_Code_EduPro/node_modules/mongodb'));

const INDEX_PATH = path.join(__dirname, '../01_Source_Code_EduPro', 'public', 'index.html');
const STUDY_JS_PATH = path.join(__dirname, '../01_Source_Code_EduPro', 'public', 'js', 'study.js');
const DATA_PATH = path.join(__dirname, '../01_Source_Code_EduPro', 'src', 'data', 'flashcardsData.js');

async function run() {
  console.log('Bắt đầu nâng cấp giao diện Flashcard 3D lật 2 mặt chuẩn theo yêu cầu...');

  // 1. Cập nhật thẻ 'resign' vào MongoDB
  try {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    await client.connect();
    const db = client.db('elearning_nosql');
    const resignCard = {
      id: 'FC_RESIGN',
      word: 'resign',
      phonetic: '/rɪˈzaɪn/',
      pos: 'verb',
      category: 'Kinh doanh & Tài chính',
      topic: 'Kinh doanh & Tài chính',
      topicIcon: '💼',
      cefr: 'B2',
      meaning: 'từ chức, xin thôi (việc)',
      collocation: 'resign as director / tender one\'s resignation',
      example: 'She resigned as director. (Cô ấy đã từ chức giám đốc.)',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80'
    };
    await db.collection('flashcards').updateOne(
      { word: { $regex: /^resign$/i } },
      { $set: resignCard },
      { upsert: true }
    );
    console.log('✓ Đã cập nhật từ vựng "resign" vào MongoDB collection flashcards!');
    await client.close();
  } catch (err) {
    console.log('⚠ Lưu ý MongoDB:', err.message);
  }

  // 2. Thêm CSS 3D Flip vào index.html
  let html = fs.readFileSync(INDEX_PATH, 'utf-8');
  const flipCss = `
    /* ============================================================== */
    /* 3D FLASHCARD FLIP SYSTEM (CHUẨN 2 MẶT CÓ HÌNH ẢNH MINH HỌA)   */
    /* ============================================================== */
    .flashcard-3d-wrapper {
      perspective: 1200px;
    }
    .flashcard-3d-inner {
      position: relative;
      width: 100%;
      min-height: 280px;
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-style: preserve-3d;
      cursor: pointer;
    }
    .flashcard-3d-inner.is-flipped {
      transform: rotateY(180deg);
    }
    .flashcard-3d-face {
      width: 100%;
      height: 100%;
      min-height: 280px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 1.5rem;
    }
    .flashcard-3d-front {
      position: relative;
    }
    .flashcard-3d-back {
      position: absolute;
      top: 0;
      left: 0;
      transform: rotateY(180deg);
    }
  `;

  if (!html.includes('flashcard-3d-inner')) {
    html = html.replace('</style>', flipCss + '\n  </style>');
    fs.writeFileSync(INDEX_PATH, html, 'utf-8');
    console.log('✓ Đã thêm CSS hiệu ứng Flashcard 3D lật 2 mặt vào index.html!');
  } else {
    console.log('ℹ CSS Flashcard 3D đã tồn tại trong index.html');
  }

  // 3. Cập nhật hàm renderSingleFlashcardCard và toggleFlipCard trong study.js
  let js = fs.readFileSync(STUDY_JS_PATH, 'utf-8');

  const newRenderSingleFn = `
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
      const inner = document.getElementById(\`fc-inner-\${cardId}\`);
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
      const safeWord = (card.word || '').replace(/'/g, "\\\\'");
      const safeEx = (card.example || '').replace(/'/g, "\\\\'");
      const topicIcon = card.topicIcon || (FLASHCARD_TOPIC_DEFS.find(t => t.category === card.category) || {}).icon || '📘';
      const cardImg = getFlashcardIllustration(card);

      return \`
        <div class="flashcard-3d-wrapper select-none group" id="fc-card-\${card.id}">
          <!-- KHỐI 3D LẬT THẺ -->
          <div class="flashcard-3d-inner rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all \${isMastered ? 'ring-2 ring-emerald-500/30' : ''}" id="fc-inner-\${card.id}" onclick="toggleFlipCard('\${card.id}')">
            
            <!-- ========================================== -->
            <!-- MẶT TRƯỚC (FRONT): TỪ VỰNG, PHIÊN ÂM, LOA 🔊 -->
            <!-- ========================================== -->
            <div class="flashcard-3d-face flashcard-3d-front p-6 rounded-3xl bg-white dark:bg-slate-900 flex flex-col justify-between">
              <!-- Hàng trên: Phân loại & Badge 'Từ mới' -->
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  \${topicIcon} \${card.category}
                </span>
                <span class="px-3.5 py-1 rounded-full text-xs font-semibold \${isMastered ? 'text-emerald-600 border border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40' : 'text-amber-500 border border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'}">
                  \${isMastered ? '✓ Đã thuộc' : 'Từ mới'}
                </span>
              </div>

              <!-- Khu vực trung tâm: Từ vựng to đậm & Nút phát âm -->
              <div class="text-center py-6">
                <div class="inline-flex items-center justify-center gap-2.5">
                  <h3 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">\${card.word}</h3>
                  <button onclick="event.stopPropagation(); speakText('\${safeWord}', 'en-US')" title="Phát âm từ vựng" class="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm shadow-2xs transition-transform active:scale-95">
                    <i class="fa-solid fa-volume-high"></i>
                  </button>
                </div>
                <div class="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                  <span class="font-bold text-slate-600 dark:text-slate-400">(\${pos})</span> \${phonetic}
                </div>
              </div>

              <!-- Hàng dưới: Lời nhắc lật thẻ & Nút Rotate 🔄 -->
              <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span class="text-[11px] italic text-slate-400 flex items-center gap-1">
                  <i class="fa-solid fa-hand-pointer text-brand-500"></i> Bấm để lật xem định nghĩa & hình ảnh
                </span>
                <button onclick="event.stopPropagation(); toggleFlipCard('\${card.id}')" title="Lật sang mặt sau" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-600 dark:hover:text-indigo-400 text-lg transition-transform hover:rotate-180 duration-500">
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
                <span class="px-3.5 py-1 rounded-full text-xs font-semibold \${isMastered ? 'text-emerald-600 border border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40' : 'text-amber-500 border border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'}">
                  \${isMastered ? '✓ Đã thuộc' : 'Từ mới'}
                </span>
              </div>

              <!-- Thân thẻ: Bố cục 2 cột (Trái: Định nghĩa & Ví dụ, Phải: Ảnh minh họa) -->
              <div class="grid grid-cols-12 gap-3 py-1 items-center">
                <!-- Cột trái: Text -->
                <div class="col-span-7 space-y-2 text-left">
                  <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">Định nghĩa:</div>
                    <div class="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">\${meaning}</div>
                  </div>
                  <div>
                    <div class="font-bold text-sm text-slate-900 dark:text-white">Ví dụ:</div>
                    <div class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-3">
                      • \${card.example}
                    </div>
                  </div>
                </div>

                <!-- Cột phải: Hình ảnh minh họa -->
                <div class="col-span-5 flex justify-end">
                  <div class="w-full max-w-[150px] aspect-4/3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                    <img src="\${cardImg}" alt="\${card.word}" loading="lazy" class="w-full h-full object-cover">
                  </div>
                </div>
              </div>

              <!-- Hàng dưới: Lời nhắc lật lại & Nút Rotate 🔄 -->
              <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button onclick="event.stopPropagation(); speakText('\${safeEx}', 'en-US')" class="text-[11px] font-bold text-brand-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  <i class="fa-solid fa-volume-low"></i> Nghe câu ví dụ
                </button>
                <button onclick="event.stopPropagation(); toggleFlipCard('\${card.id}')" title="Lật về mặt trước" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-600 dark:hover:text-indigo-400 text-lg transition-transform hover:rotate-180 duration-500">
                  <i class="fa-solid fa-arrows-rotate"></i>
                </button>
              </div>
            </div>

          </div>

          <!-- THANH CÔNG CỤ HỌC TẬP SRS & ĐÁNH DẤU BÊN DƯỚI -->
          <div class="mt-3 space-y-2">
            <!-- 4 Nút Ôn tập ngắt quãng Anki / Leitner -->
            <div class="grid grid-cols-4 gap-1.5">
              <button onclick="scheduleSrsReview('\${card.id}', '\${safeWord}', 'AGAIN')" title="Ôn lại sau 1 phút" class="py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-300 text-[10px] font-bold transition-all border border-rose-200/60 dark:border-rose-900/40">Again 1p</button>
              <button onclick="scheduleSrsReview('\${card.id}', '\${safeWord}', 'HARD')" title="Ôn lại sau 1 ngày" class="py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-300 text-[10px] font-bold transition-all border border-amber-200/60 dark:border-amber-900/40">Hard 1d</button>
              <button onclick="scheduleSrsReview('\${card.id}', '\${safeWord}', 'GOOD')" title="Ôn lại sau 3 ngày" class="py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-300 text-[10px] font-bold transition-all border border-sky-200/60 dark:border-sky-900/40">Good 3d</button>
              <button onclick="scheduleSrsReview('\${card.id}', '\${safeWord}', 'EASY')" title="Ôn lại sau 7 ngày" class="py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-300 text-[10px] font-bold transition-all border border-emerald-200/60 dark:border-emerald-900/40">Easy 7d</button>
            </div>

            <!-- Nút đánh dấu đã thuộc -->
            <button onclick="toggleFlashcardMaster('\${card.id}')" class="w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 \${isMastered ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300'}">
              <i class="fa-solid \${isMastered ? 'fa-circle-check' : 'fa-check'}"></i>
              <span>\${isMastered ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
            </button>
          </div>
        </div>
      \`;
    }
  `;

  // Thay thế hàm renderSingleFlashcardCard cũ bằng hàm mới
  const oldRenderRegex = /function renderSingleFlashcardCard\(card\)[\s\S]*?return `[\s\S]*?`;\s*\}/;
  if (oldRenderRegex.test(js)) {
    js = js.replace(oldRenderRegex, newRenderSingleFn);
    fs.writeFileSync(STUDY_JS_PATH, js, 'utf-8');
    console.log('✓ Đã cập nhật hàm renderSingleFlashcardCard dạng 3D lật 2 mặt vào study.js!');
  } else {
    console.log('⚠ Không tìm thấy hàm renderSingleFlashcardCard cũ trong study.js');
  }

  console.log('🎉 Hoàn tất nâng cấp giao diện Flashcard 3D lật 2 mặt!');
}

run();
