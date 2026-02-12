async function postJSON(url, body) {
  const resp = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await resp.json().catch(() => ({}));
  if (!resp.ok || j.ok === false) throw new Error(j.error || ('HTTP ' + resp.status));
  return j;
}

let recaptchaWidgetId = null;
let recaptchaSiteKey = '';
let mathCaptchaActive = false;
let mathInputEl = null;
function debounce(fn, wait) { let t = null; return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); }; }
function renderRecaptcha() {
  const el = document.getElementById('recaptcha');
  if (!el || !window.grecaptcha || !recaptchaSiteKey) return;
  if (recaptchaWidgetId !== null) return;
  if (!document.body.contains(el)) return;
  try {
    const w = el.offsetWidth || window.innerWidth;
    const size = w < 330 ? 'compact' : 'normal';
    recaptchaWidgetId = window.grecaptcha.render('recaptcha', { sitekey: recaptchaSiteKey, size });
  } catch (_) { /* ignore render errors */ }
}
async function enableMathCaptcha() {
  try {
    const r = await fetch('/api/captcha/new');
    const j = await r.json().catch(() => ({}));
    const wrap = document.getElementById('recaptcha');
    if (!wrap) return;
    const box = document.createElement('div');
    box.className = 'mt-2';
    const label = document.createElement('div');
    label.className = 'text-sm text-gray-300 mb-1';
    label.textContent = j && j.challenge ? j.challenge : 'Captcha';
    mathInputEl = document.createElement('input');
    mathInputEl.type = 'text';
    mathInputEl.placeholder = 'Jawaban';
    mathInputEl.className = 'w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500';
    box.appendChild(label);
    box.appendChild(mathInputEl);
    wrap.innerHTML = '';
    wrap.appendChild(box);
    mathCaptchaActive = true;
  } catch (_) { mathCaptchaActive = false; }
}

// OTP Input Helper Functions
function setupOtpInput(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const inputs = container.querySelectorAll('input[type="text"]');
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      if (value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').slice(0, 6);
      pastedData.split('').forEach((char, i) => {
        if (inputs[index + i]) {
          inputs[index + i].value = char;
        }
      });
      const lastFilledIndex = Math.min(index + pastedData.length - 1, inputs.length - 1);
      inputs[lastFilledIndex].focus();
    });
  });
}

function getOtpValue(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return '';

  const inputs = container.querySelectorAll('input[type="text"]');
  return Array.from(inputs).map(input => input.value).join('');
}

async function initRecaptcha() {
  try {
    const r = await fetch('/api/captcha/sitekey');
    const j = await r.json().catch(() => ({}));
    recaptchaSiteKey = j && j.siteKey ? j.siteKey : '';
    const ready = () => renderRecaptcha();
    if (window.grecaptcha && window.grecaptcha.render) ready();
    else window.grecaptcha.ready(ready);
    // Fallback if recaptcha gagal dalam 2500ms
    setTimeout(() => { if (recaptchaWidgetId === null) enableMathCaptcha(); }, 2500);
  } catch (_) { enableMathCaptcha(); }
}

function bindLogin() {
  const form = document.getElementById('login-form');
  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  const err = document.getElementById('login-error');

  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err && (err.textContent = '');
    err && err.classList.add('hidden');

    try {
      // Verify credentials and request OTP
      const recaptcha = recaptchaWidgetId !== null && window.grecaptcha ? window.grecaptcha.getResponse(recaptchaWidgetId) : '';
      const captchaVal = mathCaptchaActive && mathInputEl ? mathInputEl.value.trim() : '';

      if (!recaptcha && !captchaVal) {
        if (err) { err.textContent = 'Harap selesaikan verifikasi captcha'; err.classList.remove('hidden'); }
        const el = document.getElementById('recaptcha'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Request login OTP
      const j = await postJSON('/api/auth/request-login-otp', {
        email: email.value.trim(),
        password: password.value,
        recaptcha,
        captcha: captchaVal
      });

      // Store email for OTP verification page
      localStorage.setItem('login_email', email.value.trim());

      // Redirect to login OTP page
      location.href = '/pages/login-otp.html';

    } catch (e2) {
      if (err) {
        const msg = (e2 && e2.message ? e2.message : '').toLowerCase();
        err.textContent = msg.includes('captcha') ? 'Harap selesaikan verifikasi captcha' : (e2.message || 'Login gagal');
        err.classList.remove('hidden');
      }

      // Handle "Unverified Account" special case
      try {
        const msg = (e2 && e2.message ? e2.message : '').toLowerCase();
        if (msg.includes('belum terverifikasi')) {
          const em = email.value.trim();
          localStorage.setItem('pending_email', em);
          await postJSON('/api/auth/request-otp', { email: em, purpose: 'verify' });
          location.href = '/pages/verify-otp.html';
        }
      } catch (_) { }
    }
  });
}

function bindRegister() {
  const form = document.getElementById('register-form');
  const email = document.getElementById('register-email');
  const password = document.getElementById('register-password');
  const err = document.getElementById('register-error');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err && (err.textContent = '');
    try {
      const recaptcha = recaptchaWidgetId !== null && window.grecaptcha ? window.grecaptcha.getResponse(recaptchaWidgetId) : '';
      const captchaVal = mathCaptchaActive && mathInputEl ? mathInputEl.value.trim() : '';
      if (!recaptcha && !captchaVal) {
        if (err) { err.textContent = 'Harap selesaikan verifikasi captcha'; err.classList.remove('hidden'); }
        const el = document.getElementById('recaptcha'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      await postJSON('/api/auth/register', { email: email.value.trim(), password: password.value, recaptcha, captcha: captchaVal });
      localStorage.setItem('pending_email', email.value.trim());
      location.href = '/pages/verify-otp.html';
    } catch (e2) {
      if (err) {
        const msg = (e2 && e2.message ? e2.message : '').toLowerCase();
        err.textContent = msg.includes('captcha') ? 'Harap selesaikan verifikasi captcha' : (e2.message || 'Registrasi gagal');
        err.classList.remove('hidden');
      }
    }
  });
}

function bindForgot() {
  const form = document.getElementById('forgot-form');
  const email = document.getElementById('forgot-email');
  const err = document.getElementById('forgot-error');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err && (err.textContent = '');
    try {
      const recaptcha = recaptchaWidgetId !== null && window.grecaptcha ? window.grecaptcha.getResponse(recaptchaWidgetId) : '';
      const captchaVal = mathCaptchaActive && mathInputEl ? mathInputEl.value.trim() : '';
      if (!recaptcha && !captchaVal) {
        if (err) { err.textContent = 'Harap selesaikan verifikasi captcha'; err.classList.remove('hidden'); }
        const el = document.getElementById('recaptcha'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      await postJSON('/api/auth/request-otp', { email: email.value.trim(), purpose: 'reset', recaptcha, captcha: captchaVal });
      localStorage.setItem('forgot_email', email.value.trim());
      location.href = '/pages/forgot-otp.html';
    } catch (e2) {
      if (err) {
        const msg = (e2 && e2.message ? e2.message : '').toLowerCase();
        err.textContent = msg.includes('captcha') ? 'Harap selesaikan verifikasi captcha' : (e2.message || 'Permintaan OTP gagal');
        err.classList.remove('hidden');
      }
    }
  });
}




function bindVerifyOtp() {
  const form = document.getElementById('otp-form');
  const emailEl = document.getElementById('otp-email');
  const err = document.getElementById('otp-error');
  const mode = new URLSearchParams(location.search).get('mode') || 'verify';
  const storedEmail = localStorage.getItem('pending_email') || '';
  if (emailEl && !emailEl.value) emailEl.value = storedEmail;
  if (!form) return;

  // Setup inputs
  setupOtpInput('otp-inputs');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err && (err.textContent = '');
    const email = emailEl.value.trim();
    const code = getOtpValue('otp-inputs');
    try {
      if (code.length < 6) throw new Error('Silakan masukkan 6 digit kode OTP');

      if (mode === 'reset') {
        const pwd = document.getElementById('new-password').value;
        await postJSON('/api/auth/reset-password', { email, code, password: pwd });
        location.href = '/pages/login.html';
      } else {
        await postJSON('/api/auth/verify-otp', { email, code });
        location.href = '/pages/login.html';
      }
    } catch (e2) {
      if (err) { err.textContent = e2.message || 'Verifikasi gagal'; err.classList.remove('hidden'); }
    }
  });
}


function bindLoginOtp() {
  const form = document.getElementById('login-otp-form');
  const emailEl = document.getElementById('login-otp-email');
  const err = document.getElementById('login-otp-error');
  const storedEmail = localStorage.getItem('login_email') || '';

  if (emailEl && !emailEl.value) emailEl.value = storedEmail;
  if (!form) return;

  // Setup OTP inputs
  setupOtpInput('login-otp-inputs');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err && (err.textContent = '');
    err && err.classList.add('hidden');

    const email = emailEl.value.trim();
    const code = getOtpValue('login-otp-inputs');

    try {
      if (code.length < 6) throw new Error('Silakan masukkan 6 digit kode OTP');

      const j = await postJSON('/api/auth/verify-login-otp', { email, code });

      // Store token and redirect
      localStorage.setItem('lumi_token', j.token);
      try { localStorage.setItem('lumi_user', JSON.stringify(j.user || {})); } catch (_) { }
      localStorage.removeItem('login_email');
      // Force reload with timestamp to bypass cache
      window.location.href = '/home?t=' + new Date().getTime();
    } catch (e2) {
      if (err) {
        err.textContent = e2.message || 'Verifikasi gagal';
        err.classList.remove('hidden');
      }
    }
  });
}

function bindForgotOtp() {
  const form = document.getElementById('forgot-otp-form');
  const emailEl = document.getElementById('forgot-otp-email');
  const passwordEl = document.getElementById('forgot-new-password');
  const err = document.getElementById('forgot-otp-error');
  const storedEmail = localStorage.getItem('forgot_email') || '';

  if (emailEl && !emailEl.value) emailEl.value = storedEmail;
  if (!form) return;

  // Setup OTP inputs
  setupOtpInput('forgot-otp-inputs');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err && (err.textContent = '');
    err && err.classList.add('hidden');

    const email = emailEl.value.trim();
    const code = getOtpValue('forgot-otp-inputs');
    const password = passwordEl.value;

    try {
      if (code.length < 6) throw new Error('Silakan masukkan 6 digit kode OTP');
      if (!password) throw new Error('Password baru harus diisi');

      await postJSON('/api/auth/reset-password', { email, code, password });

      localStorage.removeItem('forgot_email');
      alert('Password berhasil direset! Silakan login dengan password baru Anda.');
      location.href = '/pages/login.html';
    } catch (e2) {
      if (err) {
        err.textContent = e2.message || 'Reset password gagal';
        err.classList.remove('hidden');
      }
    }
  });
}

function startCooldown(btnId, duration = 60) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const originalText = btn.dataset.originalText || btn.textContent;
  btn.dataset.originalText = originalText;
  btn.disabled = true;
  btn.classList.add('opacity-50', 'cursor-not-allowed');

  let left = duration;
  btn.textContent = `Kirim Ulang (${left}s)`;

  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    left--;
    btn.textContent = `Kirim Ulang (${left}s)`;
    if (left <= 0) {
      clearInterval(resendTimer);
      btn.textContent = originalText;
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 1000);
}

async function resendOtp(email, btnId, purpose) {
  if (!email) return alert('Email tidak ditemukan');
  try {
    startCooldown(btnId);

    // Determine the correct endpoint and purpose
    let endpoint = '/api/auth/request-otp';
    let actualPurpose = purpose;

    if (location.pathname.includes('login-otp')) {
      // For login OTP, we need to use the special login OTP endpoint
      endpoint = '/api/auth/request-login-otp';
      actualPurpose = 'login';
    } else if (location.pathname.includes('forgot-otp')) {
      actualPurpose = 'reset';
    } else if (location.pathname.includes('verify-otp')) {
      const isReset = location.href.includes('mode=reset');
      actualPurpose = isReset ? 'reset' : 'verify';
    }

    await postJSON(endpoint, { email, purpose: actualPurpose });
    alert('Kode OTP baru telah dikirim ke email Anda');
  } catch (e) {
    alert(e.message || 'Gagal mengirim ulang OTP');
    clearInterval(resendTimer);
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.textContent = btn.dataset.originalText;
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

function bindResend() {
  // For verify-otp.html (registration)
  const resendBtn = document.getElementById('resend-btn');
  if (resendBtn) {
    resendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('otp-email').value || localStorage.getItem('pending_email');
      resendOtp(email, 'resend-btn');
    });
  }

  // For login-otp.html
  const loginOtpResendBtn = document.getElementById('login-otp-resend-btn');
  if (loginOtpResendBtn) {
    loginOtpResendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-otp-email').value || localStorage.getItem('login_email');
      resendOtp(email, 'login-otp-resend-btn', 'login');
    });
  }

  // For forgot-otp.html
  const forgotOtpResendBtn = document.getElementById('forgot-otp-resend-btn');
  if (forgotOtpResendBtn) {
    forgotOtpResendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-otp-email').value || localStorage.getItem('forgot_email');
      resendOtp(email, 'forgot-otp-resend-btn', 'reset');
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initRecaptcha();
  bindLogin();
  bindRegister();
  bindForgot();
  bindVerifyOtp();
  bindLoginOtp();
  bindForgotOtp();
  bindResend();
});
