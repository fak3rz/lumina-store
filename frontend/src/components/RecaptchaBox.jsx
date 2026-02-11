import React, { useEffect, useRef, useState } from 'react';

export default function RecaptchaBox({ onToken, onFallbackReady }) {
  const containerRef = useRef(null);
  const [mode, setMode] = useState('loading'); // 'recaptcha' | 'math' | 'loading'
  const widgetIdRef = useRef(null);
  const [challenge, setChallenge] = useState('');

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const r = await fetch('/api/captcha/sitekey');
        const j = await r.json().catch(() => ({}));
        const siteKey = j && j.siteKey ? j.siteKey : '';
        if (!siteKey) {
          await initMath();
          return;
        }
        await loadRecaptchaScript();
        if (!window.grecaptcha || !window.grecaptcha.render) {
          await initMath();
          return;
        }
        if (!mounted) return;
        setMode('recaptcha');
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            if (typeof onToken === 'function') onToken(token);
          }
        });
      } catch {
        await initMath();
      }
    }
    async function initMath() {
      try {
        const r = await fetch('/api/captcha/new');
        const j = await r.json().catch(() => ({}));
        if (!mounted) return;
        setChallenge(j.challenge || '12 + 3 =');
        setMode('math');
        if (typeof onFallbackReady === 'function') onFallbackReady(true);
      } catch {
        setMode('math');
        setChallenge('12 + 3 =');
        if (typeof onFallbackReady === 'function') onFallbackReady(true);
      }
    }
    function loadRecaptchaScript() {
      return new Promise((resolve) => {
        if (document.getElementById('recaptcha-script')) return resolve();
        const s = document.createElement('script');
        s.id = 'recaptcha-script';
        s.src = 'https://www.google.com/recaptcha/api.js';
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
      });
    }
    init();
    return () => { mounted = false; };
  }, [onToken, onFallbackReady]);

  if (mode === 'loading') return <div className="mt-4 text-sm text-slate-400">Memuat captcha…</div>;
  if (mode === 'recaptcha') return <div className="mt-4"><div ref={containerRef} /></div>;
  return (
    <div className="mt-4">
      <label className="block mb-2 text-sm text-slate-500">{challenge}</label>
      <input
        type="text"
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-500 outline-none transition"
        placeholder="Jawaban captcha"
        onChange={(e) => onToken && onToken(e.target.value)}
      />
    </div>
  );
}
