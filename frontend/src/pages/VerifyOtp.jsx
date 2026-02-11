import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import RecaptchaBox from '../components/RecaptchaBox.jsx';
import AuthIllustration from '../components/AuthIllustration.jsx';
import { auth as authApi } from '../services/api.js';

export default function VerifyOtp() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [code, setCode] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [useFallback, setUseFallback] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If email is missing, redirect back to register
    useEffect(() => {
        if (!emailParam) {
            // navigate('/register'); // Optional: enforce email presence
        }
    }, [emailParam, navigate]);

    async function onSubmit(e) {
        e.preventDefault();
        setError('');

        // Validasi dasar
        if (!code) {
            setError('Masukkan kode OTP');
            return;
        }

        setLoading(true);
        try {
            // Panggil API verifyOtp (endpoint yang sama dengan forgot password biasanya bisa dipakai ulang 
            // atau ada endpoint khusus /verify-account. 
            // Cek authService.js: authApi.verifyOtp biasanya untuk forgot-password step 2.
            // Kita perlu pastikan backend support verify account. 
            // TAPI, biasanya verify account itu pakai token link di email.
            // Jika sistemnya OTP angka, maka kita pakai endpoint verify-otp.

            // Asumsi: Backend punya endpoint verifyOtp yang generik atau kita pakai yang ada.
            const res = await authApi.verifyOtp(email, code, { token: captchaToken, fallback: useFallback });

            if (!res || res.ok === false) throw new Error(res.error || 'Verifikasi gagal');

            alert('Akun berhasil diverifikasi! Silakan login.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Kode OTP salah atau kadaluarsa');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-white text-slate-600 font-sans">
            <AuthIllustration type="register" /> {/* Reuse register/login illustration */}

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

                    <h1 className="text-2xl font-semibold text-slate-700 mb-1">Verifikasi Akun 🛡️</h1>
                    <p className="text-sm text-slate-400 mb-8">
                        Masukkan kode OTP yang dikirim ke <span className="font-medium text-slate-600">{email}</span>
                    </p>

                    <form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Kode OTP</label>
                            <input
                                type="text"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 outline-none transition bg-white"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        {/* Reuse RecaptchaBox if needed by API security */}
                        {/* <RecaptchaBox onToken={setCaptchaToken} onFallbackReady={() => setUseFallback(true)} /> */}

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
                            {loading ? 'Memproses...' : 'Verifikasi'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Salah email? <Link to="/register" className="font-medium text-purple-600 hover:text-purple-700 transition">Daftar Ulang</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
