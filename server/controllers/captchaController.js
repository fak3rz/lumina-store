function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class CaptchaController {
  new(req, res) {
    const a = randInt(10, 99);
    const b = randInt(1, 9);
    const op = ['+', '-', '+'][randInt(0, 2)];
    const answer = op === '+' ? a + b : a - b;
    res.cookie('captcha_expected', String(answer), { maxAge: 7 * 60 * 1000, httpOnly: false, sameSite: 'lax', path: '/' });
    res.json({ ok: true, challenge: `${a} ${op} ${b} =` });
  }
  sitekey(req, res) {
    const config = require('../config');
    res.json({ ok: true, siteKey: config.recaptcha.siteKey || '' });
  }
}

module.exports = new CaptchaController();
