const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'public', 'index.html');
const backupPath = path.join(rootDir, 'public', 'index.html.backup');

// Ensure backup exists
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(indexPath, backupPath);
  console.log('[BACKUP] Created public/index.html.backup');
} else {
  console.log('[BACKUP] public/index.html.backup already exists');
}

// Read from backup to ensure source of truth
const content = fs.readFileSync(backupPath, 'utf8');
const lines = content.split('\n');

function sliceLines(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join('\n');
}

// 1. core.js
let coreParts = [
  sliceLines(3169, 3316), // SSE & notifications
  sliceLines(3410, 4044), // Global vars + Theme + Nav + Courses + Auth + Toast
  sliceLines(4462, 4600), // Certs + Chat redirects
  sliceLines(4716, 4953), // History + Analytics + Live stream + Query runner
  sliceLines(5413, 5544), // VietQR + Enroll
  sliceLines(5674, 5833), // Gamification + CMS Question management
];

let coreJs = '// ==============================================================================\n'
          + '// 1. CORE ENGINE: STATE, AUTH, NAV, CATALOG, VIETQR, CERT & CMS\n'
          + '// ==============================================================================\n\n'
          + coreParts.join('\n\n');

// Set window.API_BASE and var API_BASE
coreJs = coreJs.replace(
  "const API_BASE = window.location.origin + '/api';",
  "window.API_BASE = window.location.origin + '/api';\nvar API_BASE = window.API_BASE;"
);

// Ensure shared state uses 'var' so it is attached to window and globally accessible
const varsToVar = [
  'EXAM_ID', 'currentToken', 'currentUser', 'examCountdown', 'loadedQuestions',
  'userAnswers', 'isPracticeMode', 'isExamDisqualified', 'bookmarkedQuestionIds',
  'visGraph', 'rawCoursesData', 'lastExamResult', 'allFlashcards',
  'currentFlashcardFilter', 'allDictations', 'currentDictationItem',
  'currentDictLookupEntry', 'arenaTimerInterval', 'arenaTimeLeft', 'arenaScore',
  'arenaCombo', 'arenaMaxCombo', 'arenaMatchedCount', 'currentArenaQuestion',
  'currentClassroomCourseId', 'currentVietQROrder', 'vietqrCountdownInterval', 'sseLiveSource'
];

varsToVar.forEach(v => {
  coreJs = coreJs.replace(new RegExp('let ' + v + ' =', 'g'), 'var ' + v + ' =');
});

// 2. classroom.js
let classroomParts = [
  sliceLines(3317, 3353), // Neo4j Collaborative recommendations
  sliceLines(3354, 3409), // Cassandra Video retention analytics
  sliceLines(4045, 4208), // Enter classroom + Video player + Playlist + Telemetry logs
  sliceLines(5545, 5673), // Notes + Reviews + Neo4j Course recommendations
];
let classroomJs = '// ==============================================================================\n'
               + '// 2. CLASSROOM ENGINE: VIDEO PLAYER, RETENTION CURVE, NOTES & REVIEWS\n'
               + '// ==============================================================================\n\n'
               + classroomParts.join('\n\n');

// 3. study.js
let studyParts = [
  sliceLines(4209, 4461), // Exam engine + Leaderboard
  sliceLines(4601, 4715), // Knowledge Graph Vis.js
  sliceLines(4954, 5412), // Flashcard 3D + Dictation + Writing Coach + Multi-exam
  sliceLines(5834, 7477), // Advanced labs: Arena, Dictionary, Q&A, SRS Anki, Heatmap, Roadmap, RPG Tree, Anti-cheat, Tier 4 labs
];
let studyJs = '// ==============================================================================\n'
            + '// 3. STUDY ENGINE: FLASHCARDS 3D, DICTATION, WRITING AI, EXAM & TIER 1-4 LABS\n'
            + '// ==============================================================================\n\n'
            + studyParts.join('\n\n');

// 4. telemetry.js
let telemetryParts = [
  sliceLines(7821, 8031), // 4-NoSQL Telemetry + Firewall + Disaster Recovery
];
let telemetryJs = '// ==============================================================================\n'
                + '// 4. TELEMETRY ENGINE: 4-NOSQL LIVE MONITOR, REDIS FIREWALL & DISASTER RECOVERY\n'
                + '// ==============================================================================\n\n'
                + telemetryParts.join('\n\n');

// 5. copilot.js
let copilotParts = [
  sliceLines(7478, 7690), // Lofi Pomodoro timer
  sliceLines(7691, 7820), // Smart AI Study Copilot Drawer
  sliceLines(8032, 8109), // Study Buddies Peer Matching (Neo4j)
  sliceLines(8110, 8136), // bootstrapApplication + DOMContentLoaded
];
let copilotJs = '// ==============================================================================\n'
              + '// 5. COPILOT & SOCIAL: AI ASSISTANT, STUDY BUDDIES, POMODORO & APP BOOTSTRAP\n'
              + '// ==============================================================================\n\n'
              + copilotParts.join('\n\n');

// Validate syntax of all 5 modules
const modules = {
  'public/js/core.js': coreJs,
  'public/js/classroom.js': classroomJs,
  'public/js/study.js': studyJs,
  'public/js/telemetry.js': telemetryJs,
  'public/js/copilot.js': copilotJs
};

let allOk = true;
for (const [relPath, code] of Object.entries(modules)) {
  try {
    new vm.Script(code);
    console.log(`[SYNTAX VALID] ${relPath} (${code.split('\n').length} lines)`);
  } catch (err) {
    console.error(`[SYNTAX ERROR] ${relPath}:`, err.message);
    allOk = false;
  }
}

if (!allOk) {
  console.error('Validation failed. Aborting.');
  process.exit(1);
}

// Create public/js directory
const jsDir = path.join(rootDir, 'public', 'js');
if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}

// Write the 5 files
for (const [relPath, code] of Object.entries(modules)) {
  const fullPath = path.join(rootDir, relPath);
  fs.writeFileSync(fullPath, code, 'utf8');
  console.log(`[FILE WRITTEN] ${fullPath}`);
}

// Assemble clean modular public/index.html
const htmlBeforeScript = lines.slice(0, 3167).join('\n');
const htmlAfterScript = lines.slice(8137).join('\n');

const modularScriptTags = [
  '  <!-- ============================================================== -->',
  '  <!-- MODULAR JAVASCRIPT ARCHITECTURE (SEPARATION OF CONCERNS)       -->',
  '  <!-- ============================================================== -->',
  '  <script src="/js/core.js?v=2.0.0"></script>',
  '  <script src="/js/classroom.js?v=2.0.0"></script>',
  '  <script src="/js/study.js?v=2.0.0"></script>',
  '  <script src="/js/telemetry.js?v=2.0.0"></script>',
  '  <script src="/js/copilot.js?v=2.0.0"></script>'
].join('\n');

const newIndexHtml = htmlBeforeScript + '\n' + modularScriptTags + '\n' + htmlAfterScript;
fs.writeFileSync(indexPath, newIndexHtml, 'utf8');

console.log('[INDEX UPDATED] Successfully replaced inline scripts with 5 clean modules!');
console.log(`[STATS] Old index.html: ${lines.length} lines -> New index.html: ${newIndexHtml.split('\n').length} lines (Reduced by ${(lines.length - newIndexHtml.split('\n').length)} lines!)`);
