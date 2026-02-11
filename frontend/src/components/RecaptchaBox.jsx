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
          console.warn('Recaptcha siteKey missing, using fallback');
          await initMath();
          return;
        }

        // Define callback
        const callbackName = 'onRecaptchaLoad_' + Math.random().toString(36).substring(7);
        let scriptLoaded = false;

        window[callbackName] = () => {
          if (!mounted) return;
          renderWidget(siteKey);
        };

        // Load script if not already present or global grecaptcha not ready
        if (window.grecaptcha && window.grecaptcha.render) {
          renderWidget(siteKey);
        } else {
          await loadRecaptchaScript(callbackName);
          // Fallback if callback never fires (timeout)
          setTimeout(() => {
            if (mounted && mode === 'loading') {
              console.warn('Recaptcha timeout, using fallback');
              initMath();
            }
          }, 10000);
        }

      } catch (e) {
        console.error('Recaptcha init error:', e);
        await initMath();
      }
    }

    function renderWidget(siteKey) {
      if (!window.grecaptcha || !containerRef.current) return;
      window.grecaptcha.ready(() => {
        if (!mounted) return;
        try {
          if (containerRef.current && containerRef.current.innerHTML === '') {
            setMode('recaptcha');
            widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
              sitekey: siteKey,
              callback: (token) => {
                if (typeof onToken === 'function') onToken(token);
              },
              'error-callback': () => {
                console.error('Recaptcha service error');
                initMath();
              }
            });
          }
        } catch (err) {
          console.error('Render error:', err);
          initMath();
        }
      });
    }

    async function initMath() {
      try {
        if (!mounted) return;
        const r = await fetch('/api/captcha/new');
        const j = await r.json().catch(() => ({}));
        if (!mounted) return;
        setChallenge(j.challenge || '12 + 3 =');
        setMode('math');
        if (typeof onFallbackReady === 'function') onFallbackReady(true);
      } catch {
        if (!mounted) return;
        setMode('math');
        setChallenge('12 + 3 =');
        if (typeof onFallbackReady === 'function') onFallbackReady(true);
      }
    }

    function loadRecaptchaScript(cbName) {
      return new Promise((resolve) => {
        if (document.getElementById('recaptcha-lib')) {
          return resolve();
        }
        const s = document.createElement('script');
        s.id = 'recaptcha-lib';
        s.src = `https://www.google.com/recaptcha/api.js?onload=${cbName}&render=explicit`;
        s.async = true;
        s.defer = true;
        s.onerror = () => resolve(); // Resolves but callback won't fire
        document.head.appendChild(s);
        resolve();
      });
    }

    init();
    return () => { mounted = false; };
  }, [onToken, onFallbackReady]);

  if (mode === 'loading') return <div className="mt-4 text-sm text-slate-400">Memuat captcha…</div>;
  if (mode === 'recaptcha') return <div className="mt-4 flex justify-center"><div ref={containerRef} /></div>;

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
