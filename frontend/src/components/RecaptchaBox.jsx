import React, { useEffect, useRef, useState, useCallback } from 'react';

// Hardcoded for zero-latency loading (Public Site Key)
const SITE_KEY = '6Lete2gsAAAAAN9lpnamn2feLC9TrotZg7G-7dxO';

export default function RecaptchaBox({ onToken, onFallbackReady }) {
  const containerRef = useRef(null);
  const [mode, setMode] = useState('loading'); // 'recaptcha' | 'math' | 'loading'
  const widgetIdRef = useRef(null);
  const [challenge, setChallenge] = useState('');
  const mountedRef = useRef(true);

  // Fallback function
  const initMath = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const r = await fetch('/api/captcha/new');
      const j = await r.json().catch(() => ({}));
      if (!mountedRef.current) return;
      setChallenge(j.challenge || '12 + 3 =');
      setMode('math');
      if (typeof onFallbackReady === 'function') onFallbackReady(true);
    } catch {
      if (!mountedRef.current) return;
      setMode('math');
      setChallenge('12 + 3 =');
      if (typeof onFallbackReady === 'function') onFallbackReady(true);
    }
  }, [onFallbackReady]);

  // Global Safety Timeout (5 seconds)
  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      // If still loading after 5 seconds, FORCE fallback
      if (mode === 'loading') {
        console.warn('Global Recaptcha timeout (5s) -> Forcing Fallback');
        initMath();
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
    };
  }, [mode, initMath]);

  // Main Init Logic
  useEffect(() => {
    const POLLING_INTERVAL = 100;
    const MAX_POLLING_TIME = 8000;

    async function init() {
      try {
        if (window.grecaptcha && window.grecaptcha.render) {
          renderWidget();
          return;
        }

        if (document.getElementById('recaptcha-lib')) {
          waitForGrecaptcha();
          return;
        }

        const callbackName = 'onRecaptchaLoad_' + Math.random().toString(36).substring(7);
        window[callbackName] = () => {
          if (!mountedRef.current) return;
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

      } catch (e) {
        console.error('Recaptcha init error:', e);
        initMath();
      }
    }

    function waitForGrecaptcha() {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (!mountedRef.current) {
          clearInterval(interval);
          return;
        }
        if (window.grecaptcha && window.grecaptcha.render) {
          clearInterval(interval);
          renderWidget();
        } else if (Date.now() - startTime > MAX_POLLING_TIME) {
          clearInterval(interval);
        }
      }, POLLING_INTERVAL);
    }

    function renderWidget() {
      if (!window.grecaptcha || !containerRef.current) return;

      try {
        window.grecaptcha.ready(() => {
          if (!mountedRef.current) return;
          if (containerRef.current && containerRef.current.innerHTML === '') {
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
              // Set mode to recaptcha to clear the global timeout
              setMode('recaptcha');
            } catch (renderErr) {
              console.error('Render call error:', renderErr);
              initMath();
            }
          }
        });
      } catch (err) {
        console.error('Ready callback error:', err);
        initMath();
      }
    }

    init();
  }, [onToken, initMath]);

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
