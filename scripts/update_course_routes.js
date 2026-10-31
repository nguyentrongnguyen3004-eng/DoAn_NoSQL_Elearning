const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../01_Source_Code_EduPro/src/routes/courseRoutes.js');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Update courseLessonList
const oldLessonList = `async function courseLessonList(db, courseId) {
  const c = await db.collection('courses').findOne({ _id: ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId });
  if (c && Array.isArray(c.lessons) && c.lessons.length) return c.lessons;
  return db.collection('lessons').find({ courseId: ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId }).sort({ order: 1 }).toArray();
}`;

const newLessonList = `async function courseLessonList(db, courseId) {
  const cId = ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId;
  const colLessons = await db.collection('lessons').find({ courseId: cId }).sort({ order: 1 }).toArray();
  if (colLessons && colLessons.length) return colLessons;
  const c = await db.collection('courses').findOne({ _id: cId });
  if (c && Array.isArray(c.lessons) && c.lessons.length) return c.lessons;
  return [];
}`;

// 2. Update router.get('/:id')
const oldGetDetail = `    const lessons = Array.isArray(course.lessons) && course.lessons.length ? course.lessons : await db.collection('lessons').find({ courseId: courseId }).sort({ order: 1 }).toArray();`;
const newGetDetail = `    const colLessons = await db.collection('lessons').find({ courseId: courseId }).sort({ order: 1 }).toArray();
    const lessons = (colLessons && colLessons.length) ? colLessons : (Array.isArray(course.lessons) && course.lessons.length ? course.lessons : []);`;

// 3. Update router.get('/:id/lessons/:lessonIndex/resources')
const oldResources = `    const resources = Array.isArray(lessons[index].resources) && lessons[index].resources.length ? lessons[index].resources : [
      { id: \`slide-\${index + 1}\`, title: \`Lecture slides \${index + 1}.pdf\`, type: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '2.4 MB' },
      { id: \`audio-\${index + 1}\`, title: \`Listening practice \${index + 1}.mp3\`, type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', size: '5.1 MB' },
      { id: \`exercise-\${index + 1}\`, title: \`Homework \${index + 1}.doc\`, type: 'doc', url: 'https://file-examples.com/storage/fe1a2a5b9b4cbe/2017/02/file-sample_100kB.doc', size: '100 KB' }
    ];`;

const newResources = `    const currentLesson = lessons[index];
    let resources = [];
    if (Array.isArray(currentLesson.materials) && currentLesson.materials.length) {
      resources = currentLesson.materials.map((mat, i) => {
        const cleanName = typeof mat === 'string' ? mat : (mat.title || \`Tài liệu bài học \${i+1}\`);
        const displayName = cleanName.replace(/_/g, ' ').replace(/\\.pdf$/i, '').toUpperCase();
        return {
          id: \`mat-\${index + 1}-\${i + 1}\`,
          title: typeof mat === 'string' ? \`\${displayName}.pdf\` : (mat.title || cleanName),
          type: 'pdf',
          size: \`\${(2.8 + (i * 1.4)).toFixed(1)} MB\`,
          url: \`/api/courses/materials/\${encodeURIComponent(cleanName)}\`,
          description: i === 0 ? 'Tài liệu giáo trình chính thức kèm tiêu chí chấm điểm' : 'Bộ đề luyện tập chuyên sâu có đáp án chi tiết và từ vựng'
        };
      });
    } else {
      resources = [
        { id: \`slide-\${index + 1}\`, title: \`Slide_Bài_Giảng_Bài_\${index + 1}_EduPro.pdf\`, type: 'pdf', size: '3.4 MB', url: \`/api/courses/materials/Slide_Bai_Giang_\${index + 1}.pdf\`, description: 'Bộ slide bài giảng chuẩn quốc tế kèm sơ đồ tư duy' },
        { id: \`cheatsheet-\${index + 1}\`, title: \`Cong_Thuc_Va_Tu_Vung_Chuyen_Sau_\${index + 1}\`, type: 'pdf', size: '2.1 MB', url: \`/api/courses/materials/Tu_Vung_\${index + 1}.pdf\`, description: 'Tóm tắt cấu trúc ngữ pháp và collocations Band 8.0+' }
      ];
    }`;

// 4. Add Download Material endpoint and Certificate endpoint
const additionalEndpoints = `
// ==============================================================================
// XUAT TAI LIEU KHOA HOC (HANDOUT / SLIDES) & CHUNG CHI HOAN THANH
// ==============================================================================
router.get('/materials/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename || 'tai_lieu_edupro.pdf');
    const safeName = filename.endsWith('.pdf') ? filename : \`\${filename}.pdf\`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', \`attachment; filename="\${safeName}"\`);
    
    // PDF 1.4 hop le tieu chuan mo duoc ngay tren Chrome/Edge/Adobe
    const pdfContent = \`%PDF-1.4
1 0 obj << /Title (\${safeName}) /Author (Ban Chuyen Mon EduPro - IELTS 8.5+) >> endobj
2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj
3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj
4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >> endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
5 0 obj << /Length 420 >> stream
BT
/F1 20 Tf
50 720 Td
(EDUPRO ENGLISH - TAI LIEU HOC THUAT DOC QUYEN) Tj
/F1 14 Tf
0 -36 Td
(Giao trinh: \${safeName}) Tj
0 -28 Td
(Giang vien: Ban Chuyen Mon EduPro - IELTS 8.5+) Tj
0 -28 Td
(Ban quyen thuoc ve He thong E-Learning NoSQL - Truong DH Cong Thuong TP.HCM HUIT) Tj
0 -40 Td
(Chuc ban hoc tap tot va dat muc tieu IELTS/TOEIC nhu y!) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000100 00000 n 
0000000155 00000 n 
0000000218 00000 n 
0000000395 00000 n 
0000000325 00000 n 
trailer << /Size 7 /Root 2 0 R /Info 1 0 R >>
startxref
868
%%EOF\`;
    res.send(Buffer.from(pdfContent, 'utf-8'));
  } catch (err) {
    res.status(500).send('Error generating material');
  }
});

router.get('/:id/certificate', authenticateToken, async (req, res) => {
  try {
    const db = getMongoDb();
    const courseId = ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : req.params.id;
    const course = await db.collection('courses').findOne({ _id: courseId });
    if (!course) return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });
    
    const studentName = req.user.fullName || req.user.username || 'Nguyễn Trọng Nguyên';
    const certCode = 'EDUPRO-CERT-' + Math.floor(100000 + Math.random() * 900000);
    const issueDate = new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return res.json({
      success: true,
      data: {
        certificateId: certCode,
        studentName,
        courseTitle: course.title,
        instructorName: course.instructorName || 'Ban Chuyên Môn EduPro (IELTS 8.5+)',
        issueDate,
        issuedBy: 'Khoa Ngoại ngữ & Bộ môn Hệ thống Thông tin - Trường ĐH Công Thương TP.HCM (HUIT)',
        grade: 'Xuất Sắc (Mastery Grade A+)',
        cefrLevel: (course.category && course.category.includes('IELTS')) ? 'C1 Advanced (CEFR)' : 'B2 Upper-Intermediate',
        verifyUrl: \`https://edupro.huit.edu.vn/verify/\${certCode}\`
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
`;

// Normalize line endings for replacement
code = code.replace(/\r\n/g, '\n');
const normOldLessonList = oldLessonList.replace(/\r\n/g, '\n');
const normNewLessonList = newLessonList.replace(/\r\n/g, '\n');
const normOldGetDetail = oldGetDetail.replace(/\r\n/g, '\n');
const normNewGetDetail = newGetDetail.replace(/\r\n/g, '\n');
const normOldResources = oldResources.replace(/\r\n/g, '\n');
const normNewResources = newResources.replace(/\r\n/g, '\n');

if (code.includes(normOldLessonList)) {
  code = code.replace(normOldLessonList, normNewLessonList);
  console.log('Replaced courseLessonList');
} else {
  console.log('Could not find oldLessonList');
}

if (code.includes(normOldGetDetail)) {
  code = code.replace(normOldGetDetail, normNewGetDetail);
  console.log('Replaced getDetail lessons logic');
} else {
  console.log('Could not find oldGetDetail');
}

if (code.includes(normOldResources)) {
  code = code.replace(normOldResources, normNewResources);
  console.log('Replaced resources logic');
} else {
  console.log('Could not find oldResources');
}

// Append endpoints right before module.exports
const exportIdx = code.lastIndexOf('module.exports');
if (exportIdx !== -1) {
  code = code.slice(0, exportIdx) + additionalEndpoints + '\n\n' + code.slice(exportIdx);
  console.log('Appended additional endpoints');
}

// Convert back to CRLF
code = code.replace(/\n/g, '\r\n');
fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully updated courseRoutes.js!');
