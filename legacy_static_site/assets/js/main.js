// Shared JS: AOS init, navbar behavior and slider
AOS && AOS.init({ once: true, offset: 100, duration: 800, easing: 'ease-out-cubic' });

// Navbar shrink on scroll
(function(){
    const navbar = document.getElementById('navbar') || document.querySelector('nav');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { navbar.classList.add('glass-nav', 'py-3'); navbar.classList.remove('py-6'); }
        else { navbar.classList.remove('glass-nav', 'py-3'); navbar.classList.add('py-6'); }
    });
})();

// Auth UI toggle: replace login/signup with profile menu when logged in
(function(){
    function initProfileUI() {
        const token = localStorage.getItem('lumi_token');
        const navAuth = document.getElementById('nav-auth');
        const navProfile = document.getElementById('nav-profile');
        const btn = document.getElementById('profile-btn');
        const menu = document.getElementById('profile-menu');
        const letterEl = document.getElementById('profile-letter');
        const emailEl = document.getElementById('profile-email');
        const logoutBtn = document.getElementById('logout-btn');
        if (!navProfile) return;
        if (token) {
            if (navAuth) navAuth.classList.add('hidden');
            navProfile.classList.remove('hidden');
            try {
                const u = JSON.parse(localStorage.getItem('lumi_user') || '{}');
                if (u && u.email) {
                    if (letterEl) letterEl.textContent = String(u.email).trim().charAt(0).toUpperCase() || 'U';
                    if (emailEl) emailEl.textContent = u.email;
                }
            } catch (_) {}
        } else {
            if (navAuth) navAuth.classList.remove('hidden');
            navProfile.classList.add('hidden');
            return;
        }
        if (btn && menu) {
            btn.addEventListener('click', () => { menu.classList.toggle('hidden'); });
            document.addEventListener('click', (e) => { if (!e.target.closest('#nav-profile')) menu.classList.add('hidden'); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') menu.classList.add('hidden'); });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('lumi_token');
                localStorage.removeItem('lumi_user');
                window.location.href = '/index.html';
            });
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initProfileUI);
    else initProfileUI();
})();

// Search input navigation and suggestions (desktop + mobile)
(function(){
    const desktopInput = document.getElementById('desktop-search-input');
    const desktopSuggestions = document.getElementById('search-suggestions');
    const mobileToggle = document.getElementById('search-toggle');
    const mobileSearch = document.getElementById('mobile-search');
    const mobileInput = document.getElementById('mobile-search-input');
    const mobileSuggestions = document.getElementById('mobile-search-suggestions');

    function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function flash(el) { if (!el) return; el.classList.add('ring','ring-red-500'); setTimeout(()=>el.classList.remove('ring','ring-red-500'),800); }

    // Build product index
    const products = Array.from(document.querySelectorAll('.product-card')).map(c => {
        const title = c.querySelector('h3')?.innerText?.trim() || '';
        const icon = c.querySelector('.aspect-square span')?.innerText?.trim() || c.querySelector('img')?.getAttribute('src') || '';
        const slug = c.dataset.game || (c.getAttribute('onclick')?.match(/game=([^'"\)]+)/) || [])[1] || '';
        const url = slug ? `pages/topup.html?game=${slug}` : null;
        return { title, icon, slug, url, el: c };
    });

    function showSuggestions(container, list) {
        if (!container) return;
        if (!list || !list.length) { container.classList.add('hidden'); container.innerHTML = ''; return; }
        container.innerHTML = '';
        list.slice(0,6).forEach((p, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'w-full text-left px-3 py-2 flex items-center hover:bg-white/10 focus:bg-white/10 suggestion-item';
            btn.setAttribute('data-slug', p.slug);
            btn.setAttribute('data-url', p.url || '');
            btn.innerHTML = `<div class="w-10 h-10 flex items-center justify-center text-2xl mr-3">${escapeHtml(p.icon)}</div><div class="truncate">${escapeHtml(p.title)}</div>`;
            btn.addEventListener('click', () => { if (p.url) window.location.href = p.url; else p.el && p.el.click(); });
            container.appendChild(btn);
        });
        container.classList.remove('hidden');
    }

    function hideSuggestions(container){ if (!container) return; setTimeout(()=>container.classList.add('hidden'), 120); }

    function handleInputEvent(inputEl, suggEl) {
        inputEl.addEventListener('input', (e) => {
            const q = (inputEl.value || '').trim().toLowerCase();
            if (!q) { hideSuggestions(suggEl); return; }
            const results = products.filter(p => p.title.toLowerCase().includes(q));
            showSuggestions(suggEl, results);
        });
        inputEl.addEventListener('keydown', (e) => {
            const visible = !suggEl.classList.contains('hidden');
            const items = visible ? Array.from(suggEl.querySelectorAll('.suggestion-item')) : [];
            let idx = items.findIndex(it => it.classList.contains('suggestion-active'));
            if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) { if (idx >= 0) items[idx].classList.remove('suggestion-active'); idx = (idx + 1) % items.length; items[idx].classList.add('suggestion-active'); items[idx].scrollIntoView({block:'nearest'}); } }
            else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { if (idx >= 0) items[idx].classList.remove('suggestion-active'); idx = (idx - 1 + items.length) % items.length; items[idx].classList.add('suggestion-active'); items[idx].scrollIntoView({block:'nearest'}); } }
            else if (e.key === 'Enter') {
                if (items.length && typeof idx === 'number' && idx >=0) { items[idx].click(); e.preventDefault(); }
                else { // fallback to first match
                    const q = (inputEl.value || '').trim().toLowerCase();
                    if (!q) { document.getElementById('products')?.scrollIntoView({behavior:'smooth'}); return; }
                    const found = products.find(p => p.title.toLowerCase().includes(q));
                    if (found) { if (found.url) window.location.href = found.url; else found.el && found.el.click(); }
                    else flash(inputEl);
                }
            }
            else if (e.key === 'Escape') { hideSuggestions(suggEl); }
        });
        inputEl.addEventListener('blur', () => hideSuggestions(suggEl));
    }

    if (desktopInput && desktopSuggestions) handleInputEvent(desktopInput, desktopSuggestions);
    if (mobileInput && mobileSuggestions) handleInputEvent(mobileInput, mobileSuggestions);

    if (mobileToggle && mobileSearch && mobileInput) {
        mobileToggle.addEventListener('click', () => {
            mobileSearch.classList.toggle('hidden');
            if (!mobileSearch.classList.contains('hidden')) setTimeout(()=> mobileInput.focus(), 50);
        });
        document.getElementById('mobile-search-close')?.addEventListener('click', (e)=> { mobileSearch.classList.add('hidden'); mobileToggle.focus(); });
    }
    const desktopToggle = document.getElementById('search-toggle-desktop');
    if (desktopToggle && desktopInput) {
        desktopToggle.addEventListener('click', () => {
            desktopInput.focus();
            desktopInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
})();

// Slider logic (if slider exists) 
(function(){
    const track = document.getElementById('slider-track');
    const bullets = document.querySelectorAll('.vueperslides__bullet');
    if (!track || !bullets.length) return;

    let currentSlide = 0;
    const slideCount = track.children.length || 3;

    function goToSlide(index) {
        currentSlide = (index + slideCount) % slideCount;
        // Use percentage transform per slide
        track.style.transition = 'transform 300ms cubic-bezier(.22,.9,.2,1)';
        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        bullets.forEach((bullet, i) => bullet.classList.toggle('vueperslides__bullet--active', i === currentSlide));
    }
    window.goToSlide = goToSlide;

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    // Auto-advance
    let autoTimer = setInterval(nextSlide, 5000);
    function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(nextSlide, 5000); }

    document.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { prevSlide(); resetAuto(); } if (e.key === 'ArrowRight') { nextSlide(); resetAuto(); } });

    // Generic swipe helper: calls onLeft/onRight on sufficient horizontal swipe
    // Also tracks whether the interaction included a move so quick taps can be distinguished
    function enableSwipe(el, onLeft, onRight) {
        let pointerDown = false;
        let startX = 0;
        let moved = false;
        const threshold = 50; // pixels to consider a swipe

        function getX(e) {
            if (e.touches && e.touches.length) return e.touches[0].clientX;
            if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0].clientX;
            return e.clientX !== undefined ? e.clientX : (e.pageX || 0);
        }

        function onDown(e) {
            pointerDown = true; moved = false; startX = getX(e);
            el._swipeMoved = false; // reset flag used by click handler
            // stop autoplay while interaction
            clearInterval(autoTimer);
            try { if (e.pointerId) el.setPointerCapture(e.pointerId); } catch (err) {}
        }
        function onMove(e) {
            if (!pointerDown) return;
            const x = getX(e);
            const dx = x - startX;
            if (Math.abs(dx) > 10) moved = true;
            el._swipeMoved = moved;
            // Optional: visual feedback could be added here by translating the track by dx px
        }
        function onUp(e) {
            if (!pointerDown) return;
            pointerDown = false;
            const endX = getX(e);
            const dx = endX - startX;
            el._swipeMoved = moved;
            if (Math.abs(dx) > threshold) {
                if (dx < 0) { onLeft && onLeft(); }
                else { onRight && onRight(); }
            }
            resetAuto();
            // clear the moved flag shortly after to allow subsequent taps
            setTimeout(() => { el._swipeMoved = false; }, 60);
        }
        function onCancel(e) {
            pointerDown = false; moved = false; el._swipeMoved = false; resetAuto();
        }

        // Pointer events first
        el.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerup', onUp, { passive: true });
        el.addEventListener('pointercancel', onCancel);
        // Fallback touch events
        el.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp, { passive: true });
        el.addEventListener('touchcancel', onCancel);
        // Mouse fallback
        el.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        // Click/tap handler: quick taps navigate based on click position (left -> prev, right -> next)
        el.addEventListener('click', function (e) {
            // ignore clicks that were part of a drag/swipe
            if (el._swipeMoved) return;
            // ignore clicks on interactive elements inside the slide
            if (e.target.closest('button,a,input,select,textarea')) return;
            const rect = el.getBoundingClientRect();
            const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
            const center = rect.left + rect.width / 2;
            // left of center -> go to previous slide (swipe right), right of center -> next slide (swipe left)
            if (clientX < center) { onRight && onRight(); }
            else { onLeft && onLeft(); }
            resetAuto();
        });
    }

    // Enable swipe on the slider track
    enableSwipe(track, () => { nextSlide(); }, () => { prevSlide(); });

    // Also enable swipe on a generic menu element if present
    const menuEl = document.getElementById('menu') || document.querySelector('.menu-carousel');
    if (menuEl) {
        enableSwipe(menuEl, () => {
            // If menu has built-in next/prev controls, try to trigger them, otherwise scroll
            const nextBtn = menuEl.querySelector('.next') || document.querySelector('.menu-next');
            if (nextBtn) nextBtn.click(); else menuEl.scrollBy({ left: menuEl.clientWidth * 0.7, behavior: 'smooth' });
        }, () => {
            const prevBtn = menuEl.querySelector('.prev') || document.querySelector('.menu-prev');
            if (prevBtn) prevBtn.click(); else menuEl.scrollBy({ left: -menuEl.clientWidth * 0.7, behavior: 'smooth' });
        });
    }

    // Make product title clickable (clicking text opens the game)
    (function () {
        const titles = document.querySelectorAll('.product-card h3');
        titles.forEach(h => {
            h.style.cursor = 'pointer';
            h.addEventListener('click', function (e) {
                e.stopPropagation();
                const card = h.closest('.product-card');
                if (card) card.click();
            });
        });
    })();
})();
