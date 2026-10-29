// ==============================================================================
// SCRIPT CHUP TOAN BO ANH GIAO DIEN WEB EDUPRO ACADEMY (15 PHAN HE)
// Su dung Node.js execFileSync goi Chrome Headless Engine
// ==============================================================================

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'D:\\TRONGNGUYEN_HK7\\NoSQL\\ĐỒ ÁN\\03_Tai_Lieu_Do_An\\08_Hinh_Anh_Giao_Dien_Web';
const reportDir = 'D:\\TRONGNGUYEN_HK7\\NoSQL\\ĐỒ ÁN\\03_Tai_Lieu_Do_An\\06_Bao_Cao_Ket_Qua_Do_An\\report_assets';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const screens = [
  {
    name: '01_Trang_Chu_Danh_Muc_Khoa_Hoc.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=courses',
    reportMap: 'media_1792891786113_98dca940.png'
  },
  {
    name: '02_Phong_Hoc_Truc_Tuyen_Classroom.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=classroom',
    reportMap: 'media_1792891810887_fc97fa1e.png'
  },
  {
    name: '03_Kho_Tu_Vung_Flashcards_SRS.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=vocab',
    reportMap: null
  },
  {
    name: '04_Phong_Luyen_Viet_Writing_AI.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=writing',
    reportMap: null
  },
  {
    name: '05_Phong_Thi_Trac_Nghiem_Online.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=exam',
    reportMap: 'media_1792892919631_702a5c4f.png'
  },
  {
    name: '06_Canh_Bao_Gian_Lan_Anti_Cheat.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=exam&anticheat=1',
    reportMap: 'media_1792226373722_1aac51f1.png'
  },
  {
    name: '07_Ban_Do_Tri_Thuc_Neo4j_Graph.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=graph',
    reportMap: 'media_1792892896551_cc88775b.png'
  },
  {
    name: '08_Mang_Luoi_Ban_Cung_Tien_Study_Buddies.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=graph',
    reportMap: 'media_1792451865490_4466ea82.png'
  },
  {
    name: '09_Bang_Diem_Lich_Su_Gamification.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=history',
    reportMap: null
  },
  {
    name: '10_Bang_Xep_Hang_Va_Shop_Doi_Qua_XP.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&section=history',
    reportMap: 'media_1792227235015_ace6eb1d.png'
  },
  {
    name: '11_Chung_Chi_Nang_Luc_Certificate.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&modal=cert',
    reportMap: null
  },
  {
    name: '12_Tro_Ly_Hoc_Tap_AI_Copilot_4_NoSQL.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&copilot=1',
    reportMap: null
  },
  {
    name: '13_Bang_Dieu_Khien_Quan_Tri_CMS_Telemetry.png',
    url: 'http://localhost:5050/?screenshot=1&login=admin&section=analytics',
    reportMap: 'media_1792204139876_f27ba16c.png'
  },
  {
    name: '14_Modal_Dang_Nhap_Dang_Ky_OTP.png',
    url: 'http://localhost:5050/?screenshot=1&modal=login',
    reportMap: null
  },
  {
    name: '15_Che_Do_Toi_Dark_Mode_Trang_Chu.png',
    url: 'http://localhost:5050/?screenshot=1&login=student&dark=1&section=courses',
    reportMap: null
  }
];

console.log('==============================================================================');
console.log('  BẮT ĐẦU CHỤP TOÀN BỘ 15 ẢNH GIAO DIỆN WEB EDUPRO ACADEMY (1600x1000)');
console.log('==============================================================================');

let successCount = 0;

for (let i = 0; i < screens.length; i++) {
  const s = screens[i];
  const outPath = path.join(outDir, s.name);
  console.log(`[${i + 1}/${screens.length}] Đang chụp: ${s.name}...`);

  try {
    execFileSync(chromePath, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1600,1000',
      '--screenshot=' + outPath,
      s.url
    ], { stdio: 'pipe' });

    if (fs.existsSync(outPath)) {
      const stats = fs.statSync(outPath);
      console.log(`   ✅ Đã tạo thành công: ${s.name} (${stats.size} bytes)`);
      successCount++;

      // Đồng bộ ảnh sang report_assets để cập nhật báo cáo Word
      if (s.reportMap) {
        const dest = path.join(reportDir, s.reportMap);
        fs.copyFileSync(outPath, dest);
        console.log(`   🔄 Đã đồng bộ sang report_assets: ${s.reportMap}`);
      }
    } else {
      console.log(`   ❌ Thất bại: Không tìm thấy file sau khi chụp.`);
    }
  } catch (err) {
    console.error(`   ❌ Lỗi chụp ${s.name}:`, err.message);
  }
}

console.log('');
console.log('==============================================================================');
console.log(`  HOÀN TẤT CHỤP ẢNH: ${successCount}/${screens.length} ẢNH THÀNH CÔNG!`);
console.log(`  Thư mục lưu trữ chính: ${outDir}`);
console.log('==============================================================================');
