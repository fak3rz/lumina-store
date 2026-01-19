const base = '/api';

async function request(method, path, body) {
  const resp = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await resp.json().catch(() => ({}));
  if (!resp.ok || j.ok === false) {
    const msg = j.error || j.message || 'Request gagal';
    throw new Error(msg);
  }
  return j;
}

export const captcha = {
  sitekey: () => request('GET', '/captcha/sitekey'),
  newChallenge: () => request('GET', '/captcha/new')
};

export const auth = {
  login: (email, password, { token, fallback } = {}) => {
    const body = { email, password };
    if (fallback) body.captcha = token;
    else body.recaptcha = token;
    return request('POST', '/auth/login', body);
  },
  register: (email, password, { token, fallback } = {}) => {
    const body = { email, password };
    if (fallback) body.captcha = token;
    else body.recaptcha = token;
    return request('POST', '/auth/register', body);
  },
  requestOtp: (email, purpose, { token, fallback } = {}) => {
    const body = { email, purpose };
    if (fallback) body.captcha = token;
    else body.recaptcha = token;
    return request('POST', '/auth/request-otp', body);
  },
  verifyOtp: (email, code, { token, fallback } = {}) => {
    const body = { email, code };
    if (fallback) body.captcha = token;
    else body.recaptcha = token;
    return request('POST', '/auth/verify-otp', body);
  },
  resetPassword: (email, code, password, { token, fallback } = {}) => {
    const body = { email, code, password };
    if (fallback) body.captcha = token;
    else body.recaptcha = token;
    return request('POST', '/auth/reset-password', body);
  }
};

export const orders = {
  create: (data, { token, fallback } = {}) => {
    const body = { ...data };
    if (fallback) body.captcha = token;
    else body.recaptcha = token;
    return request('POST', '/orders', body);
  },
  get: (id) => request('GET', `/orders/${encodeURIComponent(id)}`)
};
