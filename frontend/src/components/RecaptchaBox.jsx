import React, { useEffect, useRef, useState } from 'react';

// Hardcoded for zero-latency loading (Public Site Key)
const SITE_KEY = '6Lete2gsAAAAAN9lpnamn2feLC9TrotZg7G-7dxO';

export default function RecaptchaBox({ onToken, onFallbackReady }) {
  const containerRef = useRef(null);
  const [mode, setMode] = useState('loading'); // 'recaptcha' | 'math' | 'loading'
  const widgetIdRef = useRef(null);
  const [challenge, setChallenge] = useState('');

  useEffect(() => {
    let mounted = true;
    const POLLING_INTERVAL = 100;
    const MAX_POLLING_TIME = 10000;

    async function init() {
      try {
        // Method 1: grecaptcha already exists
        if (window.grecaptcha && window.grecaptcha.render) {
          renderWidget();
          return;
        }

        // Method 2: Script tag exists but grecaptcha not ready (Downloading)
        if (document.getElementById('recaptcha-lib')) {
          waitForGrecaptcha();
          return;
        }

        // Method 3: Clean start, load script
        const callbackName = 'onRecaptchaLoad_' + Math.random().toString(36).substring(7);
        window[callbackName] = () => {
          if (!mounted) return;
          renderWidget();
        };

        const s = document.createElement('script');
        s.id = 'recaptcha-lib';
        s.src = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit`;
        s.async = true;
        s.defer = true;
        s.onerror = () => {
          console.error('Recaptcha script failed to load');
          initMath();
        };
        document.head.appendChild(s);

        // Fallback safety if network hangs
        setTimeout(() => {
          if (mounted && mode === 'loading') {
            console.warn('Recaptcha initial load timeout');
            initMath();
          }
        }, 10000);

      } catch (e) {
        console.error('Recaptcha init error:', e);
        await initMath();
      }
    }

    function waitForGrecaptcha() {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (!mounted) {
          clearInterval(interval);
          return;
        }
        if (window.grecaptcha && window.grecaptcha.render) {
          clearInterval(interval);
          renderWidget();
        } else if (Date.now() - startTime > MAX_POLLING_TIME) {
          clearInterval(interval);
          console.warn('Recaptcha polling timeout');
          initMath();
        }
      }, POLLING_INTERVAL);
    }

    function renderWidget() {
      if (!window.grecaptcha || !containerRef.current) return;

      try {
        window.grecaptcha.ready(() => {
          if (!mounted) return;
          if (containerRef.current && containerRef.current.innerHTML === '') {
            setMode('recaptcha');
            try {
              widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                sitekey: SITE_KEY,
                callback: (token) => {
                  if (typeof onToken === 'function') onToken(token);
                },
                'error-callback': () => {
                  console.error('Recaptcha execution error');
                  initMath();
                }
              });
            } catch (renderErr) {
              console.error('Render call error:', renderErr);
              // If render fails (e.g. duplicate), checking innerHTML usually prevents this,
              // but as a fallback, we allow silent fail or math.
            }
          }
        });
      } catch (err) {
        console.error('Ready callback error:', err);
        initMath();
      }
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

    init();
    return () => { mounted = false; };
  }, [onToken, onFallbackReady]);

  if (mode === 'loading') return <div className="mt-4 text-sm text-slate-400">Memuat captcha...</div>;
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
