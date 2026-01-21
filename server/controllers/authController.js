const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ ok: false, error: 'email & password required' });
      const result = await authService.register(email, password);
      res.json({ ok: true, user: { id: result.user.id, email: result.user.email }, otp_sent: result.sent });
    } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ ok: false, error: 'email & password required' });

      // Just validate credentials, don't send OTP yet
      const result = await authService.validateCredentials(email, password);
      res.json({ ok: true, message: 'Credentials valid' });
    } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
  }

  async requestLoginOtp(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ ok: false, error: 'email & password required' });

      // Validate credentials and send OTP
      const result = await authService.requestLoginOtp(email, password);
      res.json({
        ok: true,
        otp_sent: result.sent,
        message: 'OTP sent to your email',
        debug_otp: result.debug_otp
      });
    } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
  }

  async verifyLoginOtp(req, res) {
    try {
      const { email, code } = req.body || {};
      if (!email || !code) return res.status(400).json({ ok: false, error: 'email & code required' });
      const result = await authService.verifyLoginOtp(email, code);
      res.json({ ok: true, token: result.token, user: result.user });
    } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
  }

  async verifyLogin(req, res) {
    try {
      const { email, code } = req.body || {};
      if (!email || !code) return res.status(400).json({ ok: false, error: 'email & code required' });
      const result = await authService.verifyLoginOtp(email, code);
      res.json({ ok: true, token: result.token, user: result.user });
    } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
  }
  async requestOtp(req, res) {
    try {
      const { email, purpose } = req.body || {};
      if (!email || !purpose) return res.status(400).json({ ok: false, error: 'email & purpose required' });
      const result = await authService.requestOtp(email, purpose);
      res.json({ ok: true, otp_sent: result.sent });
    } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
  }
  async verifyOtp(req, res) { // Verifies Account Registration OTP
    try {
      const { email, code } = req.body || {};
      if (!email || !code) return res.status(400).json({ ok: false, error: 'email & code required' });
      const result = await authService.verifyAccountOtp(email, code);
      res.json({ ok: true, verified: result.verified, user: result.user });
    } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
  }
  async resetPassword(req, res) {
    try {
      const { email, code, password } = req.body || {};
      if (!email || !code || !password) return res.status(400).json({ ok: false, error: 'email, code & password required' });
      const result = await authService.resetPassword(email, code, password);
      res.json({ ok: true, reset: result.reset });
    } catch (e) { res.status(400).json({ ok: false, error: e.message }); }
  }
}

module.exports = new AuthController();

