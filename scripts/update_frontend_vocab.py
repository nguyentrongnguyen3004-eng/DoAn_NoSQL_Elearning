import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Update public/index.html
html_path = '01_Source_Code_EduPro/public/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

old_btns = """        <!-- Bộ lọc chủ đề từ vựng -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button onclick="filterFlashcards('ALL', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm transition-all">Tất cả (12)</button>
          <button onclick="filterFlashcards('IELTS Band 8.0', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all">IELTS Band 8.0</button>
          <button onclick="filterFlashcards('TOEIC Business', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all">TOEIC Business</button>
          <button onclick="filterFlashcards('Phrasal Verbs & Idioms', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all">Phrasal Verbs & Idioms</button>
        </div>"""

new_btns = """        <!-- Bộ lọc chủ đề từ vựng -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button id="fc-btn-all" onclick="filterFlashcards('ALL', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm transition-all">Tất cả (60)</button>
          <button id="fc-btn-ielts" onclick="filterFlashcards('IELTS Band 8.0', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all">IELTS Band 8.0 (20)</button>
          <button id="fc-btn-toeic" onclick="filterFlashcards('TOEIC Business', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all">TOEIC Business (20)</button>
          <button id="fc-btn-idioms" onclick="filterFlashcards('Phrasal Verbs & Idioms', this)" class="fc-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all">Phrasal Verbs & Idioms (20)</button>
        </div>"""

if old_btns in html:
    html = html.replace(old_btns, new_btns)
    print("index.html: Updated filter buttons with dynamic IDs and initial (60) count.")
else:
    # Try more flexible replacement if whitespace differs
    print("WARNING: Exact old_btns block not found in index.html, searching line by line...")
    if 'Tất cả (12)' in html:
        html = html.replace('Tất cả (12)', 'Tất cả (60)')
        html = html.replace("onclick=\"filterFlashcards('ALL', this)\"", "id=\"fc-btn-all\" onclick=\"filterFlashcards('ALL', this)\"")
        html = html.replace("onclick=\"filterFlashcards('IELTS Band 8.0', this)\"", "id=\"fc-btn-ielts\" onclick=\"filterFlashcards('IELTS Band 8.0', this)\"")
        html = html.replace("onclick=\"filterFlashcards('TOEIC Business', this)\"", "id=\"fc-btn-toeic\" onclick=\"filterFlashcards('TOEIC Business', this)\"")
        html = html.replace("onclick=\"filterFlashcards('Phrasal Verbs & Idioms', this)\"", "id=\"fc-btn-idioms\" onclick=\"filterFlashcards('Phrasal Verbs & Idioms', this)\"")
        print("index.html: Replaced with fallback string matching.")

if 'Đã thuộc: 2 / 12 từ' in html:
    html = html.replace('Đã thuộc: 2 / 12 từ', 'Đã thuộc: 0 / 60 từ')
    print("index.html: Updated initial counter to 0 / 60 từ.")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Saved updated index.html!")

# 2. Update public/js/study.js
study_path = '01_Source_Code_EduPro/public/js/study.js'
with open(study_path, 'r', encoding='utf-8') as f:
    study = f.read()

old_load = """    async function loadFlashcards() {
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
    }"""

new_load = """    async function loadFlashcards() {
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

    function updateFilterButtons(cats) {
      const allCount = cats.ALL || allFlashcards.length;
      const ieltsCount = cats['IELTS Band 8.0'] || allFlashcards.filter(c => c.category === 'IELTS Band 8.0').length;
      const toeicCount = cats['TOEIC Business'] || allFlashcards.filter(c => c.category === 'TOEIC Business').length;
      const idiomsCount = cats['Phrasal Verbs & Idioms'] || allFlashcards.filter(c => c.category === 'Phrasal Verbs & Idioms').length;

      const btnAll = document.getElementById('fc-btn-all');
      const btnIelts = document.getElementById('fc-btn-ielts');
      const btnToeic = document.getElementById('fc-btn-toeic');
      const btnIdioms = document.getElementById('fc-btn-idioms');

      if (btnAll) btnAll.textContent = `Tất cả (${allCount})`;
      if (btnIelts) btnIelts.textContent = `IELTS Band 8.0 (${ieltsCount})`;
      if (btnToeic) btnToeic.textContent = `TOEIC Business (${toeicCount})`;
      if (btnIdioms) btnIdioms.textContent = `Phrasal Verbs & Idioms (${idiomsCount})`;
    }"""

if old_load in study:
    study = study.replace(old_load, new_load)
    print("study.js: Added updateFilterButtons and updated loadFlashcards.")
else:
    print("WARNING: old_load not matched in study.js. Trying flexible replace...")
    sub_old = "renderFlashcardsGrid();\n        }"
    sub_new = "updateFilterButtons(json.categories || {});\n          renderFlashcardsGrid();\n        }"
    if sub_old in study:
        study = study.replace(sub_old, sub_new, 1)
        # Also add updateFilterButtons
        idx = study.find("function updateFlashcardProgress")
        if idx != -1:
            fn_add = """    function updateFilterButtons(cats) {
      const allCount = cats.ALL || allFlashcards.length;
      const ieltsCount = cats['IELTS Band 8.0'] || allFlashcards.filter(c => c.category === 'IELTS Band 8.0').length;
      const toeicCount = cats['TOEIC Business'] || allFlashcards.filter(c => c.category === 'TOEIC Business').length;
      const idiomsCount = cats['Phrasal Verbs & Idioms'] || allFlashcards.filter(c => c.category === 'Phrasal Verbs & Idioms').length;

      const btnAll = document.getElementById('fc-btn-all');
      const btnIelts = document.getElementById('fc-btn-ielts');
      const btnToeic = document.getElementById('fc-btn-toeic');
      const btnIdioms = document.getElementById('fc-btn-idioms');

      if (btnAll) btnAll.textContent = `Tất cả (${allCount})`;
      if (btnIelts) btnIelts.textContent = `IELTS Band 8.0 (${ieltsCount})`;
      if (btnToeic) btnToeic.textContent = `TOEIC Business (${toeicCount})`;
      if (btnIdioms) btnIdioms.textContent = `Phrasal Verbs & Idioms (${idiomsCount})`;
    }\n\n"""
            study = study[:idx] + fn_add + study[idx:]
            print("study.js: Injected updateFilterButtons via fallback.")

with open(study_path, 'w', encoding='utf-8') as f:
    f.write(study)
print("Saved updated study.js!")
