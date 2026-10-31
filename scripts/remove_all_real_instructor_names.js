const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  for (const { from, to } of replacements) {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      count++;
    }
  }
  if (count > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${count} replacement(s) in ${filePath}`);
  } else {
    console.log(`No match found in ${filePath}`);
  }
}

// 1. public/index.html
replaceInFile(path.join(__dirname, '../01_Source_Code_EduPro/public/index.html'), [
  { from: 'TS. Nguyễn Thị Định (IELTS 8.5)', to: 'Ban Chuyên Môn EduPro (IELTS 8.5+)' },
  { from: 'TS. Nguyễn Thị Định', to: 'Ban Chuyên Môn EduPro' },
  { from: 'IELTS 8.5 • Trưởng Bộ môn', to: 'IELTS 8.5+ • Hội Đồng Học Thuật' }
]);

// 2. public/js/classroom.js
replaceInFile(path.join(__dirname, '../01_Source_Code_EduPro/public/js/classroom.js'), [
  { from: 'TS. Nguyễn Thị Định (IELTS 8.5)', to: 'Ban Chuyên Môn EduPro (IELTS 8.5+)' },
  { from: 'TS. Nguyễn Thị Định', to: 'Ban Chuyên Môn EduPro' }
]);

// 3. src/routes/courseRoutes.js
replaceInFile(path.join(__dirname, '../01_Source_Code_EduPro/src/routes/courseRoutes.js'), [
  { from: 'TS. Nguyễn Thị Định (IELTS 8.5 - Verified Instructor)', to: 'Ban Chuyên Môn EduPro (IELTS 8.5+ - Verified Instructor)' },
  { from: 'TS. Nguyễn Thị Định (Giảng viên)', to: 'Ban Chuyên Môn EduPro (Giảng viên)' },
  { from: 'TS. Nguyễn Thị Định (Instructor)', to: 'Ban Chuyên Môn EduPro (Instructor)' },
  { from: 'TS. Nguyễn Thị Định (IELTS 8.5)', to: 'Ban Chuyên Môn EduPro (IELTS 8.5+)' },
  { from: 'TS. Nguyễn Thị Định', to: 'Ban Chuyên Môn EduPro' },
  { from: 'TS. Nguyen Thi Dinh - EduPro English', to: 'Ban Chuyen Mon EduPro - IELTS 8.5+' },
  { from: 'TS. Nguyen Thi Dinh - IELTS 8.5', to: 'Ban Chuyen Mon EduPro - IELTS 8.5+' },
  { from: 'TS. Nguyen Thi Dinh', to: 'Ban Chuyen Mon EduPro' }
]);

// 4. src/routes/examRoutes.js
replaceInFile(path.join(__dirname, '../01_Source_Code_EduPro/src/routes/examRoutes.js'), [
  { from: "'TS. Nguyễn Thị Định (dinhnt)'", to: "'ThS. Hoàng Minh Đức (instructor_alex)'" }
]);

// 5. 02_Scripts_CSDL_NoSQL/mongo_seed.js
replaceInFile(path.join(__dirname, '../02_Scripts_CSDL_NoSQL/mongo_seed.js'), [
  { from: 'TS. Nguyễn Thị Định (IELTS 8.5)', to: 'Ban Chuyên Môn EduPro (IELTS 8.5+)' }
]);

// 6. 02_Scripts_CSDL_NoSQL/mongo_seed_mongosh.js
replaceInFile(path.join(__dirname, '../02_Scripts_CSDL_NoSQL/mongo_seed_mongosh.js'), [
  { from: 'TS. Nguyen Thi Dinh', to: 'Ban Chuyen Mon EduPro' }
]);

// 7. automated_tests.js
replaceInFile(path.join(__dirname, '../03_Tai_Lieu_Do_An/05_Tai_Lieu_Kiem_Thu/automated_tests.js'), [
  { from: 'TS. Nguyen Thi Dinh - Khoa CNTT, HUIT', to: 'Bo mon He thong Thong tin - Khoa CNTT, HUIT' }
]);

// 8. README.md
replaceInFile(path.join(__dirname, '../README.md'), [
  { from: '**Giảng viên hướng dẫn:** TS. Nguyễn Thị Định', to: '**Giảng viên hướng dẫn:** Bộ môn Hệ thống Thông tin - HUIT' }
]);

// 9. scripts/generate_4_nosql_architecture_word.py
replaceInFile(path.join(__dirname, './generate_4_nosql_architecture_word.py'), [
  { from: '• Giảng viên hướng dẫn: TS. Nguyễn Thị Định', to: '• Giảng viên hướng dẫn: Giảng viên Bộ môn Hệ thống Thông tin' },
  { from: '(TS. Nguyễn Thị Định)', to: '(Giảng viên phụ trách)' }
]);

// 10. Word reports scripts
replaceInFile(path.join(__dirname, '../03_Tai_Lieu_Do_An/06_Bao_Cao_Ket_Qua_Do_An/export_giai_doan_2_word.js'), [
  { from: 'TS. Nguyễn Thị Định', to: 'Bộ môn Hệ thống Thông tin' }
]);
replaceInFile(path.join(__dirname, '../03_Tai_Lieu_Do_An/06_Bao_Cao_Ket_Qua_Do_An/export_word_report.js'), [
  { from: 'TS. NGUYỄN THỊ ĐỊNH', to: 'BỘ MÔN HỆ THỐNG THÔNG TIN' },
  { from: 'TS. Nguyễn Thị Định', to: 'Giảng viên phụ trách học phần Dữ liệu NoSQL' },
  { from: 'Cô đã tận tình', to: 'Giảng viên đã tận tình' },
  { from: 'sát sao của Cô', to: 'sát sao của Thầy/Cô' }
]);
replaceInFile(path.join(__dirname, '../03_Tai_Lieu_Do_An/06_Bao_Cao_Ket_Qua_Do_An/front_matter.py'), [
  { from: 'TS. Nguyễn Thị Định', to: 'Bộ môn Hệ thống Thông tin' },
  { from: 'Cô đã luôn dành', to: 'Thầy/Cô đã luôn dành' },
  { from: 'chỉ dẫn ân cần của Cô', to: 'chỉ dẫn ân cần của Giảng viên' }
]);

console.log('All replacements processed!');
