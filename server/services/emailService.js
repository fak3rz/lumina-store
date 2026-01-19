const config = require('../config');

class EmailService {
  async sendOtp(email, code, purpose) {
    const subject = purpose === 'verify' ? 'Verifikasi Akun' : 'Reset Password';
    const text = `Kode OTP: ${code}\nBerlaku 10 menit.\nTujuan: ${subject}`;
    // Default provider: console (no external dependencies)
    console.log(`[Email] To: ${email} | ${subject} | ${text}`);
    return { ok: true };
  }
}

module.exports = new EmailService();

