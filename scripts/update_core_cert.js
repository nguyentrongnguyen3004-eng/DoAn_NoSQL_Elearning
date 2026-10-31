const fs = require('fs');
const path = require('path');

const corePath = path.join(__dirname, '../01_Source_Code_EduPro/public/js/core.js');
let code = fs.readFileSync(corePath, 'utf8');

const oldTarget = `      const title = certData ? certData.title : (lastExamResult ? lastExamResult.title : 'Đánh Giá Năng Lực Tiếng Anh Quốc Tế (English Placement & IELTS/TOEIC Test)');`;
const newTarget = `      const courseTitle = document.getElementById('classroom-course-header-title')?.textContent;
      const defaultTitle = (typeof currentSection !== 'undefined' && currentSection === 'classroom' && courseTitle) ? courseTitle : (lastExamResult ? lastExamResult.title : 'Đánh Giá Năng Lực Tiếng Anh Quốc Tế (English Placement & IELTS/TOEIC Test)');
      const title = certData ? certData.title : defaultTitle;`;

code = code.replace(/\r\n/g, '\n');
const normOld = oldTarget.replace(/\r\n/g, '\n');
const normNew = newTarget.replace(/\r\n/g, '\n');

if (code.includes(normOld)) {
  code = code.replace(normOld, normNew);
  code = code.replace(/\n/g, '\r\n');
  fs.writeFileSync(corePath, code, 'utf8');
  console.log('Successfully updated openCertificateModal in core.js!');
} else {
  console.log('Target not found in core.js');
}
