const nodemailer = require('nodemailer');
require('dotenv').config();

// Khởi tạo Transporter cho Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nguyentrongnguyen30042005@gmail.com',
    pass: (process.env.EMAIL_PASS || 'fdwv lpjz pakd cifz').replace(/\s+/g, '') // loại bỏ khoảng trắng nếu có
  }
});

/**
 * Gửi email chứa mã OTP xác thực
 * @param {string} toEmail - Địa chỉ email người nhận
 * @param {string} otp - Mã OTP 6 chữ số
 * @param {'REGISTER' | 'FORGOT_PASSWORD'} purpose - Mục đích gửi
 * @param {string} recipientName - Tên người nhận
 */
async function sendOtpEmail(toEmail, otp, purpose = 'REGISTER', recipientName = 'Học viên') {
  const isRegister = purpose === 'REGISTER';
  const title = isRegister ? 'Xác thực kích hoạt tài khoản' : 'Yêu cầu đặt lại mật khẩu';
  const subtitle = isRegister 
    ? 'Cảm ơn bạn đã đăng ký tham gia nền tảng EduPro Academy. Dưới đây là mã xác thực OTP của bạn:' 
    : 'Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Dưới đây là mã OTP xác thực:';

  const senderName = process.env.EMAIL_SENDER_NAME || 'EduPro Academy - Hệ Thống E-Learning & Khảo Sát NoSQL';
  const senderAddress = process.env.EMAIL_USER || 'nguyentrongnguyen30042005@gmail.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .desc { font-size: 14px; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f8fafc; border: 2px dashed #6366f1; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 8px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1e1b4b; line-height: 1.2; }
        .note { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 10px; }
        .warning { font-size: 13px; color: #dc2626; background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 8px; margin-top: 20px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🎓 EduPro Academy</h1>
          <p>Nền tảng E-Learning & Đánh giá năng lực NoSQL Đa mô hình</p>
        </div>
        <div class="content">
          <div class="greeting">Xin chào ${recipientName},</div>
          <div class="desc">${subtitle}</div>
          
          <div class="otp-box">
            <div class="otp-label">MÃ XÁC THỰC OTP</div>
            <div class="otp-code">${otp}</div>
            <div class="note">Mã này có hiệu lực trong vòng <strong>5 phút</strong></div>
          </div>

          <div class="warning">
            ⚠️ <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Ban quản trị hệ thống EduPro không bao giờ yêu cầu cung cấp OTP của bạn.
          </div>
        </div>
        <div class="footer">
          © 2026 EduPro Academy - Đồ án Tốt nghiệp / Cuối kỳ NoSQL (Nhóm 18 - HUIT).<br>
          Email này được gửi tự động, vui lòng không trả lời.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${senderName}" <${senderAddress}>`,
    to: toEmail,
    subject: `[EduPro Academy] ${otp} là mã ${title} của bạn`,
    html: htmlContent
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = {
  sendOtpEmail
};
