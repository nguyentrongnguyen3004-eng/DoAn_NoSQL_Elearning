import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = '01_Source_Code_EduPro/src/routes/courseRoutes.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace DEFAULT_FLASHCARDS definition
old_flashcards_start = "// DANH SACH 12 FLASHCARD TU VUNG TIENG ANH CHUAN IELTS / TOEIC / BUSINESS\nconst DEFAULT_FLASHCARDS = ["
old_flashcards_end = "Missing that flight turned out to be a blessing in disguise because I met my mentor at the airport.'\n  }\n];"

idx_start = content.find(old_flashcards_start)
idx_end = content.find(old_flashcards_end)

if idx_start != -1 and idx_end != -1:
    new_flashcards_def = """// DANH SACH 60 FLASHCARD TU VUNG TIENG ANH CHUAN IELTS / TOEIC / BUSINESS
const { FLASHCARDS_60 } = require('../data/flashcardsData');
let DEFAULT_FLASHCARDS = [...FLASHCARDS_60];"""
    content = content[:idx_start] + new_flashcards_def + content[idx_end + len(old_flashcards_end):]
    print("Step 1: Replaced DEFAULT_FLASHCARDS with FLASHCARDS_60 module import.")
else:
    print(f"Step 1 WARNING: Not found. idx_start={idx_start}, idx_end={idx_end}")

# 2. Replace router.get('/flashcards/list')
old_get_list = """// A1. LAY DANH SACH FLASHCARD TU VUNG + TRANG THAI DA THUOC TU REDIS SET
router.get('/flashcards/list', async (req, res) => {
  try {
    const studentId = req.query.studentId || '2001230589';
    const redisKey = `flashcards:mastered:${studentId}`;
    let masteredIds = [];

    if (redisClient && redisClient.status === 'ready') {
      try {
        masteredIds = await redisClient.smembers(redisKey);
      } catch (e) {}
    }
    if (!masteredIds || masteredIds.length === 0) {
      const memSet = memoryFlashcardMastered.get(studentId) || new Set(['FC_01', 'FC_05']);
      memoryFlashcardMastered.set(studentId, memSet);
      masteredIds = Array.from(memSet);
    }

    const cards = DEFAULT_FLASHCARDS.map(c => ({
      ...c,
      mastered: masteredIds.includes(c.id)
    }));

    res.json({
      success: true,
      source: (redisClient && redisClient.status === 'ready') ? 'MONGODB_AND_REDIS_SET' : 'MONGODB_AND_MEMORY_SET',
      masteredCount: masteredIds.length,
      totalCount: cards.length,
      data: cards
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});"""

new_get_list = """// A1. LAY DANH SACH FLASHCARD TU VUNG + TRANG THAI DA THUOC TU REDIS SET
router.get('/flashcards/list', async (req, res) => {
  try {
    const studentId = (req.user && (req.user.username || req.user.id)) || req.query.studentId || 'student01';
    const redisKey = `flashcards:mastered:${studentId}`;
    let masteredIds = [];

    if (redisClient && redisClient.status === 'ready') {
      try {
        masteredIds = await redisClient.smembers(redisKey);
      } catch (e) {}
    }
    if (!masteredIds || masteredIds.length === 0) {
      const memSet = memoryFlashcardMastered.get(studentId) || new Set();
      masteredIds = Array.from(memSet);
    }

    const db = getMongoDb();
    let rawCards = [];
    if (db) {
      rawCards = await db.collection('flashcards').find({}).sort({ id: 1 }).toArray().catch(() => []);
      const userCustom = await db.collection('custom_flashcards').find({
        $or: [{ userId: studentId }, { studentId: studentId }, { createdBy: studentId }]
      }).toArray().catch(() => []);
      if (userCustom.length > 0) {
        rawCards = [...userCustom, ...rawCards];
      }
    }
    if (!rawCards || rawCards.length === 0) {
      rawCards = DEFAULT_FLASHCARDS;
    }

    const cards = rawCards.map(c => {
      const isM = masteredIds.includes(c.id);
      return {
        ...c,
        mastered: isM,
        isMastered: isM
      };
    });

    const categories = {
      ALL: cards.length,
      'IELTS Band 8.0': cards.filter(c => c.category === 'IELTS Band 8.0').length,
      'TOEIC Business': cards.filter(c => c.category === 'TOEIC Business').length,
      'Phrasal Verbs & Idioms': cards.filter(c => c.category === 'Phrasal Verbs & Idioms').length
    };

    const actualMasteredCount = cards.filter(c => c.mastered).length;

    res.json({
      success: true,
      source: (redisClient && redisClient.status === 'ready') ? 'MONGODB_AND_REDIS_SET' : 'MONGODB_AND_MEMORY_SET',
      masteredCount: actualMasteredCount,
      totalCount: cards.length,
      categories,
      data: cards
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});"""

if old_get_list in content:
    content = content.replace(old_get_list, new_get_list)
    print("Step 2: Replaced router.get('/flashcards/list') with MongoDB integration & dynamic categories.")
else:
    print("Step 2 WARNING: old_get_list not matched.")

# 3. Replace router.get('/dictionary/lookup')
old_lookup_start = "router.get('/dictionary/lookup', async (req, res) => {"
old_lookup_end = "    res.json({\n      success: true,\n      source: 'DICTIONARY_ENGINE_CACHED_TO_REDIS',\n      data: entry\n    });\n  } catch (err) {\n    res.status(500).json({ success: false, message: err.message });\n  }\n});"

idx_l_start = content.find(old_lookup_start)
idx_l_end = content.find(old_lookup_end, idx_l_start)

if idx_l_start != -1 and idx_l_end != -1:
    new_lookup = """router.get('/dictionary/lookup', async (req, res) => {
  try {
    const rawWord = (req.query.word || '').trim();
    const cleanKey = rawWord.toLowerCase().replace(/[^a-z-\\s]/g, '');
    if (!cleanKey) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn 1 từ Tiếng Anh để tra cứu' });
    }

    const redisKey = `dict:lookup:${cleanKey}`;
    if (redisClient && redisClient.status === 'ready') {
      try {
        const cached = await redisClient.get(redisKey);
        if (cached) {
          return res.json({ success: true, source: 'REDIS_HASH_CACHE', data: JSON.parse(cached) });
        }
      } catch (e) {}
    }

    if (memoryDictCache.has(cleanKey)) {
      return res.json({ success: true, source: 'REDIS_MEMORY_CACHE', data: memoryDictCache.get(cleanKey) });
    }

    // 1. Tìm trong MongoDB flashcards
    const db = getMongoDb();
    let entry = null;
    if (db) {
      const dbCard = await db.collection('flashcards').findOne({
        word: { $regex: new RegExp(`^${cleanKey}$`, 'i') }
      }).catch(() => null);
      if (dbCard) {
        entry = {
          word: dbCard.word,
          phonetic: dbCard.phonetic,
          pos: dbCard.pos,
          category: dbCard.category,
          cefr: dbCard.cefr || 'B2',
          meaning: dbCard.meaning,
          example: dbCard.example,
          synonyms: dbCard.collocation
        };
      }
    }

    // 2. Tìm trong BUILTIN_DICTIONARY hoặc DEFAULT_FLASHCARDS
    if (!entry) {
      entry = BUILTIN_DICTIONARY[cleanKey];
      if (!entry) {
        const foundCard = DEFAULT_FLASHCARDS.find(c => c.word.toLowerCase() === cleanKey);
        if (foundCard) {
          entry = {
            word: foundCard.word,
            phonetic: foundCard.phonetic,
            pos: foundCard.pos,
            category: foundCard.category,
            cefr: foundCard.cefr || 'B2',
            meaning: foundCard.meaning,
            example: foundCard.example,
            synonyms: foundCard.collocation
          };
        }
      }
    }

    // 3. Tra cứu online Dictionary API (timeout 2.5s)
    if (!entry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const apiRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanKey)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (Array.isArray(apiJson) && apiJson.length > 0) {
            const first = apiJson[0];
            const phonetic = first.phonetic || (first.phonetics && first.phonetics.find(p => p.text) && first.phonetics.find(p => p.text).text) || `/${cleanKey}/`;
            const meaningGroup = first.meanings && first.meanings[0] ? first.meanings[0] : null;
            const pos = meaningGroup ? meaningGroup.partOfSpeech.toUpperCase() : 'WORD';
            const defObj = meaningGroup && meaningGroup.definitions && meaningGroup.definitions[0] ? meaningGroup.definitions[0] : null;
            const defEn = defObj ? defObj.definition : `Lexical term: ${cleanKey}`;
            const exEn = defObj && defObj.example ? defObj.example : `Mastering "${cleanKey}" strengthens your English communication skills.`;

            entry = {
              word: first.word.charAt(0).toUpperCase() + first.word.slice(1).toLowerCase(),
              phonetic: phonetic,
              pos: `${pos} (Từ vựng tra cứu)`,
              category: 'General & Academic English',
              cefr: 'B2',
              meaning: defEn,
              example: exEn,
              synonyms: (meaningGroup && meaningGroup.synonyms && meaningGroup.synonyms.length > 0) ? meaningGroup.synonyms.slice(0, 3).join(', ') : cleanKey
            };
          }
        }
      } catch (e) {}
    }

    // 4. Fallback tự nhiên
    if (!entry) {
      const capWord = rawWord.charAt(0).toUpperCase() + rawWord.slice(1).toLowerCase();
      entry = {
        word: capWord,
        phonetic: `/${cleanKey}/`,
        pos: 'English Vocabulary (Từ vựng tiếng Anh)',
        category: 'Tổng quát',
        cefr: 'B2',
        meaning: `Từ vựng tiếng Anh: "${capWord}". Tra cứu nhanh phục vụ việc học tập và bổ sung vốn từ.`,
        example: `Practicing "${capWord}" regularly will reinforce your reading comprehension and vocabulary retention.`,
        synonyms: cleanKey
      };
    }

    memoryDictCache.set(cleanKey, entry);
    if (redisClient && redisClient.status === 'ready') {
      try { await redisClient.set(redisKey, JSON.stringify(entry), 'EX', 86400); } catch (e) {}
    }

    res.json({
      success: true,
      source: 'DICTIONARY_ENGINE_CACHED_TO_REDIS',
      data: entry
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});"""
    content = content[:idx_l_start] + new_lookup + content[idx_l_end + len(old_lookup_end):]
    print("Step 3: Replaced router.get('/dictionary/lookup') with Mongo/Online dictionary search.")
else:
    print(f"Step 3 WARNING: idx_l_start={idx_l_start}, idx_l_end={idx_l_end}")

# 4. Replace custom_flashcards insert logic
old_custom = """router.post('/flashcards/custom', async (req, res) => {
  try {
    const db = getMongoDb();
    const studentId = req.user ? req.user.username : '2001230589';
    const { word, phonetic, pos, meaning, example, collocation } = req.body;

    const newCard = {
      id: 'FC_CUSTOM_' + Date.now().toString().slice(-4),
      word: word || 'New Vocabulary',
      phonetic: phonetic || '/vəˈkæb.jə.lər.i/',
      pos: pos || 'Academic Word',
      category: 'IELTS Band 8.0',
      meaning: meaning || 'Từ vựng lưu từ Trợ lý Tra từ điển tức thì',
      collocation: collocation || word,
      example: example || `Using "${word}" accurately will elevate your IELTS Band score.`,
      createdBy: studentId,
      createdAt: new Date()
    };"""

new_custom = """router.post('/flashcards/custom', async (req, res) => {
  try {
    const db = getMongoDb();
    const studentId = (req.user && (req.user.username || req.user.id)) || req.body.studentId || 'student01';
    const { word, phonetic, pos, meaning, example, collocation, category } = req.body;

    const newCard = {
      id: 'FC_CUSTOM_' + Date.now().toString().slice(-4),
      word: word || 'New Vocabulary',
      phonetic: phonetic || `/${(word || '').toLowerCase()}/`,
      pos: pos || 'Academic Word',
      category: category || 'IELTS Band 8.0',
      meaning: meaning || 'Từ vựng lưu từ Trợ lý Tra từ điển tức thì',
      collocation: collocation || word,
      example: example || `Using "${word}" accurately will elevate your IELTS / TOEIC score.`,
      studentId: studentId,
      userId: studentId,
      createdBy: studentId,
      createdAt: new Date()
    };"""

if old_custom in content:
    content = content.replace(old_custom, new_custom)
    print("Step 4: Updated router.post('/flashcards/custom') with proper studentId/userId.")
else:
    print("Step 4 WARNING: old_custom not found.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully wrote updated courseRoutes.js!")
