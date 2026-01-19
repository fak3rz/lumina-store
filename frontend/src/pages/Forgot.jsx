import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecaptchaBox from '../components/RecaptchaBox.jsx';
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
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2 className="title">Lupa Password</h2>
      {step === 'request' && (
        <form onSubmit={submitRequest} className="form">
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <RecaptchaBox onToken={setCaptchaToken} onFallbackReady={() => setUseFallback(true)} />
          {error && <div className="error">{error}</div>}
          <button className="btn primary" disabled={loading}>{loading ? 'Memproses…' : 'Minta OTP'}</button>
        </form>
      )}
      {step === 'verify' && (
        <form onSubmit={submitVerify} className="form">
          <input className="input" type="text" placeholder="Kode OTP" value={code} onChange={(e) => setCode(e.target.value)} required />
          <RecaptchaBox onToken={setCaptchaTokenVerify} onFallbackReady={() => setUseFallbackVerify(true)} />
          {error && <div className="error">{error}</div>}
          <button className="btn primary" disabled={loading}>{loading ? 'Memproses…' : 'Verifikasi OTP'}</button>
        </form>
      )}
      {step === 'reset' && (
        <form onSubmit={submitReset} className="form">
          <input className="input" type="password" placeholder="Password Baru" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <RecaptchaBox onToken={setCaptchaTokenReset} onFallbackReady={() => setUseFallbackReset(true)} />
          {error && <div className="error">{error}</div>}
          <button className="btn primary" disabled={loading}>{loading ? 'Memproses…' : 'Reset Password'}</button>
        </form>
      )}
      <div className="links">
        <Link to="/login">Masuk</Link>
        <Link to="/register">Daftar</Link>
      </div>
    </div>
  );
}
