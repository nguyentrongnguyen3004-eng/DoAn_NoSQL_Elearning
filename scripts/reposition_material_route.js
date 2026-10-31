const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../01_Source_Code_EduPro/src/routes/courseRoutes.js');
let code = fs.readFileSync(targetPath, 'utf8');

const matRouteStart = '// ==============================================================================\n// XUAT TAI LIEU KHOA HOC (HANDOUT / SLIDES) & CHUNG CHI HOAN THANH\n// ==============================================================================\nrouter.get(\'/materials/:filename\'';
const certRouteStart = 'router.get(\'/:id/certificate\'';

const normCode = code.replace(/\r\n/g, '\n');

const matIdx = normCode.indexOf(matRouteStart);
const certIdx = normCode.indexOf(certRouteStart);

if (matIdx !== -1 && certIdx !== -1) {
  const matRouteBlock = normCode.slice(matIdx, certIdx);
  // Remove from bottom
  let updated = normCode.slice(0, matIdx) + normCode.slice(certIdx);
  
  // Insert before router.get('/:id'
  const detailRouteMarker = '// 2. LAY CHI TIET KHOA HOC & DANH SACH BAI HOC + REVIEWS + NOTES\nrouter.get(\'/:id\',';
  const detailIdx = updated.indexOf(detailRouteMarker);
  
  if (detailIdx !== -1) {
    updated = updated.slice(0, detailIdx) + matRouteBlock + '\n\n' + updated.slice(detailIdx);
    updated = updated.replace(/\n/g, '\r\n');
    fs.writeFileSync(targetPath, updated, 'utf8');
    console.log('Successfully repositioned materials route before /:id!');
  } else {
    console.log('Could not find detailRouteMarker');
  }
} else {
  console.log('Could not find matRouteStart or certRouteStart');
}
