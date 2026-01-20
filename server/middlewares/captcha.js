const fetch = require('node-fetch');
const config = require('../config');

function parseCookies(header) {
  const h = header || '';
  const out = {};
  h.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  });
  return out;
}

function captchaGuard(req, res, next) {
  const isDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development';
  if (!config.captcha.enabled) return next();
  if (config.captcha.bypass || isDev) return next();
  const recaptchaToken = req.headers['x-recaptcha-token'] || (req.body && (req.body.recaptcha || req.body['g-recaptcha-response'])) || '';
  if (config.recaptcha && config.recaptcha.secret && recaptchaToken) {
    return verifyRecaptcha(recaptchaToken, req.ip)
      .then(ok => { if (!ok) return res.status(400).json({ ok: false, error: 'invalid captcha' }); next(); })
      .catch(() => res.status(400).json({ ok: false, error: 'invalid captcha' }));
  }
  const token = req.headers['x-captcha-token'] || (req.body && req.body.captcha) || '';
  const cookies = parseCookies(req.headers.cookie || '');
  const expected = cookies['captcha_expected'] || '';
  if (!token) return res.status(400).json({ ok: false, error: 'captcha required' });
  if (config.captcha.token && token !== config.captcha.token) return res.status(400).json({ ok: false, error: 'invalid captcha' });
  if (expected && String(token) !== String(expected)) return res.status(400).json({ ok: false, error: 'invalid captcha' });
  next();
}

module.exports = { captchaGuard };

async function verifyRecaptcha(token, remoteip) {
  try {
    const params = new URLSearchParams();
    params.set('secret', config.recaptcha.secret);
    params.set('response', token);
    if (remoteip) params.set('remoteip', remoteip);
    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const j = await resp.json().catch(() => null);
    return !!(j && j.success);
  } catch (e) { return false; }
}
