import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecaptchaBox from '../components/RecaptchaBox.jsx';
import { auth as authApi } from '../services/api.js';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!captchaToken && !useFallback) {
      setError('Captcha belum terisi');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(email, password, { token: captchaToken, fallback: useFallback });
      if (!res || res.ok === false) throw new Error(res.error || 'Registrasi gagal');
      alert('Registrasi berhasil, cek email untuk OTP');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2 className="title">Daftar</h2>
      <form onSubmit={onSubmit} className="form">
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <RecaptchaBox onToken={setCaptchaToken} onFallbackReady={() => setUseFallback(true)} />
        {error && <div className="error">{error}</div>}
        <button className="btn primary" disabled={loading}>{loading ? 'Memproses…' : 'Daftar'}</button>
      </form>
      <div className="links">
        <Link to="/login">Masuk</Link>
        <Link to="/forgot">Lupa Password</Link>
      </div>
    </div>
  );
}
