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

  // New elements for OTP flow
  const credentialsDiv = document.getElementById('login-credentials');
  const otpDiv = document.getElementById('login-otp-section');
  const otpInput = document.getElementById('login-otp');
  const loginBtn = document.getElementById('login-btn');

  let isOtpMode = false;
  let cachedEmail = '';

  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err && (err.textContent = '');
    err && err.classList.add('hidden');

    try {
      if (!isOtpMode) {
        // Step 1: Normal Login (Password)
        const recaptcha = recaptchaWidgetId !== null && window.grecaptcha ? window.grecaptcha.getResponse(recaptchaWidgetId) : '';
        const captchaVal = mathCaptchaActive && mathInputEl ? mathInputEl.value.trim() : '';

        if (!recaptcha && !captchaVal) {
          if (err) { err.textContent = 'Harap selesaikan verifikasi captcha'; err.classList.remove('hidden'); }
          const el = document.getElementById('recaptcha'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const j = await postJSON('/api/auth/login', {
          email: email.value.trim(),
          password: password.value,
          recaptcha,
          captcha: captchaVal
        });

        if (j.otp_required) {
          // Switch to OTP mode
          isOtpMode = true;
          cachedEmail = j.email; // Use email from response

          credentialsDiv.classList.add('hidden');
          otpDiv.classList.remove('hidden');
          loginBtn.textContent = 'Verifikasi Masuk';
          otpInput.focus();

          // Show message from server (e.g., "OTP Sent") via error/info box mechanism or internal alert?
          // For now, let's just proceed. The UI says "Cek Email".
        } else {
          // Direct login (should not happen with new logic, but handled)
          localStorage.setItem('lumi_token', j.token);
          try { localStorage.setItem('lumi_user', JSON.stringify(j.user || {})); } catch (_) { }
          location.href = '/index.html';
        }
      } else {
        // Step 2: Verify OTP
        const code = getOtpValue('login-otp-inputs');
        if (code.length < 6) throw new Error('Silakan masukkan 6 digit kode OTP');

        const j = await postJSON('/api/auth/login/verify', {
          email: cachedEmail,
          code
        });

        localStorage.setItem('lumi_token', j.token);
        try { localStorage.setItem('lumi_user', JSON.stringify(j.user || {})); } catch (_) { }
        location.href = '/index.html';
      }
    } catch (e2) {
      if (err) {
        const msg = (e2 && e2.message ? e2.message : '').toLowerCase();
        err.textContent = msg.includes('captcha') ? 'Harap selesaikan verifikasi captcha' : (e2.message || 'Login gagal');
        err.classList.remove('hidden');
      }

      // Handle "Unverified Account" special case (only relevant during Step 1)
      if (!isOtpMode) {
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
      localStorage.setItem('pending_email', email.value.trim());
      location.href = '/pages/verify-otp.html?mode=reset';
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

async function resendOtp(email, btnId) {
  if (!email) return alert('Email tidak ditemukan');
  try {
    startCooldown(btnId);
    // Determine purpose based on current page/mode
    const isReset = location.href.includes('mode=reset') || location.href.includes('forgot');
    const purpose = isReset ? 'reset' : 'login'; // 'login' is safe default for re-auth

    // Check if we are in verify-otp.html (registration verification uses 'verify')
    // Or login page (uses 'login')
    // We can infer purpose or just try 'verify' if 'login' fails, but keeping it simple:
    // If we are on verify-otp.html, we likely need 'verify' unless it's reset.
    // If we are on login.html, we need 'login'.

    let actualPurpose = purpose;
    if (location.pathname.includes('verify-otp')) {
      actualPurpose = isReset ? 'reset' : 'verify';
    } else if (location.pathname.includes('login')) {
      actualPurpose = 'login';
    }

    await postJSON('/api/auth/request-otp', { email, purpose: actualPurpose });
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
  // For verify-otp.html
  const resendBtn = document.getElementById('resend-btn');
  if (resendBtn) {
    resendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('otp-email').value || localStorage.getItem('pending_email');
      resendOtp(email, 'resend-btn');
    });
  }

  // For login.html (dynamic)
  const loginResendBtn = document.getElementById('login-resend-btn');
  if (loginResendBtn) {
    loginResendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Logic handled inside bindLogin context usually, but here we need global access or event
      // We can grab email from input
      const email = document.getElementById('login-email').value;
      resendOtp(email, 'login-resend-btn');
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initRecaptcha();
  bindLogin(); bindRegister(); bindForgot(); bindVerifyOtp(); bindResend();
});
