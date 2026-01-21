const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = null;
    this._initTransporter();
  }

  _initTransporter() {
    // Only init if credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Built-in support for Gmail
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.warn('[Email] credentials (EMAIL_USER, EMAIL_PASS) not found. OTPs will be logged to console only.');
    }
  }

  async sendOtp(email, code, purpose) {
    const subject = purpose === 'verify' ? 'Verifikasi Akun - Lumina Store' : 'Reset Password - Lumina Store';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Lumina Store</h2>
        <p>Kode OTP Anda adalah:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${code}</h1>
        <p>Kode ini berlaku selama 10 menit.</p>
        <p style="font-size: 12px; color: #666;">Jangan berikan kode ini kepada siapapun.</p>
      </div>
    `;
    const text = `Kode OTP: ${code}\nBerlaku 10 menit.\nJangan berikan kepada siapapun.`;

    // Always log to console for dev/debugging
    console.log(`[Email] To: ${email} | ${subject} | Code: ${code}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"Lumina Store" <${process.env.EMAIL_USER}>`,
          to: email,
          subject,
          text,
          html
        });
        return { ok: true, sent: true };
      } catch (error) {
        console.error('[Email] Failed to send email:', error);
        // Fallback: return success if logged to console, but mark as not sent via email
        return { ok: true, sent: false, error: 'email_send_failed' };
      }
    }

    return { ok: true, sent: false, warning: 'no_transporter' };
  }
}

module.exports = new EmailService();

