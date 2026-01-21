const crypto = require('crypto');
const userModel = require('../models/userModel');
const otpModel = require('../models/otpModel');
const emailService = require('./emailService');

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

class AuthService {
  async register(email, password) {
    const existing = await userModel.findByEmail(email);
    if (existing) throw new Error('Email sudah terdaftar');
    const user = await userModel.createUser({ email, password });
    const code = genOtp();
    await otpModel.create(email, code, 'verify', 10);
    await emailService.sendOtp(email, code, 'verify');
    return { user, sent: true };
  }

  async login(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) throw new Error('Email tidak ditemukan');

    // Verify password
    const ok = userModel.verifyPassword(user, password);
    if (!ok) throw new Error('Password salah');

    // Check if account is verified first
    if (!user.verified) throw new Error('Akun belum terverifikasi. Silakan cek email untuk kode verifikasi pendaftaran.');

    // Generate and send OTP for Login
    const code = genOtp();
    await otpModel.create(email, code, 'login', 10);
    const emailResult = await emailService.sendOtp(email, code, 'login');

    return {
      otp_required: true,
      email: user.email,
      message: 'Kode OTP telah dikirim ke email anda via Gmail',
      debug_otp: emailResult.sent ? undefined : code // Only for dev if email fails
    };
  }

  async verifyLoginOtp(email, code) {
    const res = await otpModel.validate(email, code, 'login');
    if (!res.ok) throw new Error('Kode OTP login tidak valid atau kadaluarsa');

    await otpModel.consume(email);
    const user = await userModel.findByEmail(email);

    // Generate Token
    const token = crypto.createHash('sha256').update(user.id + ':' + Date.now()).digest('hex');
    return { token, user: { id: user.id, email: user.email } };
  }

  async verifyAccountOtp(email, code) {
    const res = await otpModel.validate(email, code, 'verify');
    if (!res.ok) throw new Error('Kode OTP verifikasi tidak valid atau kadaluarsa');

    await otpModel.consume(email);
    const u = await userModel.setVerified(email, true);
    return { verified: true, user: { id: u.id, email: u.email } };
  }

  async requestOtp(email, purpose) {
    const user = await userModel.findByEmail(email);
    if (!user) throw new Error('Email tidak ditemukan');
    const code = genOtp();
    await otpModel.create(email, code, purpose, 10);
    await emailService.sendOtp(email, code, purpose);
    return { sent: true };
  }

  async resetPassword(email, code, newPassword) {
    const res = await otpModel.validate(email, code, 'reset');
    if (!res.ok) throw new Error('Kode OTP tidak valid atau kadaluarsa');

    await otpModel.consume(email);
    await userModel.updatePassword(email, newPassword);
    return { reset: true };
  }
}

module.exports = new AuthService();

