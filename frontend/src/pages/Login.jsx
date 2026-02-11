import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecaptchaBox from '../components/RecaptchaBox.jsx';
import AuthIllustration from '../components/AuthIllustration.jsx';
import { auth as authApi } from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!captchaToken && !useFallback) {
      setError('Captcha belum terisi');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(email, password, { token: captchaToken, fallback: useFallback });
      if (!res || res.ok === false) throw new Error(res.error || 'Login gagal');
      // Redirect or handle success (usually window.location.reload or similar if session based)
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-600 font-sans">
      {/* Left: Illustration */}
      <AuthIllustration />

      {/* Right: Login Form */}
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

          <h1 className="text-2xl font-semibold text-slate-700 mb-1">Selamat Datang! 👋</h1>
          <p className="text-sm text-slate-400 mb-8">Masuk ke akun Anda untuk melanjutkan</p>

          <form onSubmit={onSubmit}>
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 outline-none transition bg-white"
                  placeholder="············"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <RecaptchaBox onToken={setCaptchaToken} onFallbackReady={() => setUseFallback(true)} />

            <div className="flex items-center justify-between mb-6 mt-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500" />
                Remember Me
              </label>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-500 text-sm px-3.5 py-2.5 rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 active:scale-[0.98] transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>

            <div className="text-center mt-4">
              <Link to="/forgot" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition">Lupa Password?</Link>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Belum punya akun? <Link to="/register" className="font-medium text-purple-600 hover:text-purple-700 transition">Daftar</Link>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 font-medium uppercase">atau</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="flex justify-center gap-3">
            {/* Social Buttons Placeholder - Visual Only */}
            <button className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:border-slate-400 hover:shadow-sm transition bg-white" title="Facebook">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </button>
            <button className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:border-slate-400 hover:shadow-sm transition bg-white" title="Google">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            </button>
            <button className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:border-slate-400 hover:shadow-sm transition bg-white" title="Twitter">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
