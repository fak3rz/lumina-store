import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecaptchaBox from '../components/RecaptchaBox.jsx';
import AuthIllustration from '../components/AuthIllustration.jsx';
import { auth as authApi } from '../services/api.js';

export default function Forgot() {
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States for subsequent steps
  const [captchaTokenVerify, setCaptchaTokenVerify] = useState('');
  const [useFallbackVerify, setUseFallbackVerify] = useState(false);
  const [captchaTokenReset, setCaptchaTokenReset] = useState('');
  const [useFallbackReset, setUseFallbackReset] = useState(false);

  async function submitRequest(e) {
    e.preventDefault();
    setError('');
    if (!captchaToken && !useFallback) {
      setError('Captcha belum terisi');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.requestOtp(email, 'reset', { token: captchaToken, fallback: useFallback });
      if (!res || res.ok === false) throw new Error(res.error || 'Permintaan OTP gagal');
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  async function submitVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, code, { token: captchaTokenVerify, fallback: useFallbackVerify });
      if (!res || res.ok === false) throw new Error(res.error || 'Verifikasi OTP gagal');
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.resetPassword(email, code, password, { token: captchaTokenReset, fallback: useFallbackReset });
      if (!res || res.ok === false) throw new Error(res.error || 'Reset password gagal');
      alert('Password telah direset, silakan login');
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-600 font-sans">
      <AuthIllustration type="forgot" />

      <div className="w-full lg:w-[460px] min-w-[320px] flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[380px]">
          <Link to="/" className="flex items-center gap-2 mb-6 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-600 tracking-tight">
              <span className="text-purple-600">Lumia</span>store
            </span>
          </Link>

          <h1 className="text-2xl font-semibold text-slate-700 mb-1">Lupa Password? 🔒</h1>
          <p className="text-sm text-slate-400 mb-8">
            {step === 'request' && 'Masukkan email untuk reset password'}
            {step === 'verify' && 'Masukkan kode OTP yang dikirim ke email'}
            {step === 'reset' && 'Buat password baru Anda'}
          </p>

          {step === 'request' && (
            <form onSubmit={submitRequest}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 outline-none transition bg-white"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <RecaptchaBox onToken={setCaptchaToken} onFallbackReady={() => setUseFallback(true)} />

              {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-500 text-sm px-3.5 py-2.5 rounded-lg">{error}</div>}

              <button disabled={loading} className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-sm mt-4">
                {loading ? 'Memproses...' : 'Kirim OTP'}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={submitVerify}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kode OTP</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 outline-none transition bg-white"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              {/* Note: OTP Verify usually doesn't need Recaptcha if preceded by Request, but API might require it or it's good practice. Assuming yes based on original Forgot.jsx */}
              <RecaptchaBox onToken={setCaptchaTokenVerify} onFallbackReady={() => setUseFallbackVerify(true)} />

              {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-500 text-sm px-3.5 py-2.5 rounded-lg">{error}</div>}

              <button disabled={loading} className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-sm mt-4">
                {loading ? 'Memproses...' : 'Verifikasi OTP'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={submitReset}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 outline-none transition bg-white"
                    placeholder="············"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <RecaptchaBox onToken={setCaptchaTokenReset} onFallbackReady={() => setUseFallbackReset(true)} />

              {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-500 text-sm px-3.5 py-2.5 rounded-lg">{error}</div>}

              <button disabled={loading} className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-sm mt-4">
                {loading ? 'Memproses...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-slate-400">
            Ingat password? <Link to="/login" className="font-medium text-purple-600 hover:text-purple-700 transition">Kembali ke Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
