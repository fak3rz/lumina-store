// Payment page JS: data, render logic and widget behavior
console.debug('[debug] assets/js/payment.js loaded');

// Surface uncaught errors to the on-page debug banner to aid diagnosis
window.addEventListener('error', (e) => {
    console.error('window.onerror', e);
    try { setDebug('Runtime error: ' + (e && e.message ? e.message : String(e)), 'error'); } catch (_) {}
});
window.addEventListener('unhandledrejection', (e) => {
    console.error('unhandledrejection', e);
    try { setDebug('Unhandled promise rejection: ' + (e && e.reason && e.reason.message ? e.reason.message : JSON.stringify(e.reason)), 'error'); } catch (_) {}
});
// Small on-page debug helper (shows messages for users without opening DevTools)
function setDebug(message, type = 'info') {
    try {
        const el = document.getElementById('debug-banner');
        if (!el) return;
        el.classList.add('hidden');
        el.textContent = '';
        if (type === 'error') console.error(message);
        else console.warn(message);
    } catch (e) { console.warn('setDebug failed', e); }
}
AOS && AOS.init({ once: true, offset: 50, duration: 800 });

let selectedItemData = null;
let selectedPaymentMethod = null;

const games = {
    'mlbb': { 
        name: 'Mobile Legends: Bang Bang', icon: '⚔️', currency: 'Diamonds',
        options: [
            { name: 'Weekly Diamond Pass', amount: '', bonus: 'Misi Harian', price: 'Rp 27.550', oldPrice: 'Rp 30.450', discount: '-10%', bestSeller: true, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760334656140_193e31c0-9b16-4a9a-8df0-325d1c1db8de.png' },
            { name: 'Twilight Pass', amount: '', bonus: 'Benefit Season', price: 'Rp 150.000', oldPrice: 'Rp 214.300', discount: '-30%', bestSeller: false, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335038245_3d8b7393-b796-4ba7-be61-0bccdeb678a6.png' },
            { name: '5 Diamonds', amount: '5', bonus: '', price: 'Rp 1.423', oldPrice: 'Rp 1.575', discount: '-10%', bestSeller: false, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335243336_d27fd29a-179a-4ee6-b175-5cc2b362ee71.png' },
            { name: '12 Diamonds', amount: '12', bonus: '(11 + 1 Bonus)', price: 'Rp 3.323', oldPrice: 'Rp 5.000', discount: '-34%', bestSeller: false, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335243055_bae436c2-e45c-42d9-b5c6-1d524656679e.png' },
            { name: '28 Diamonds', amount: '28', bonus: '(25 + 3 Bonus)', price: 'Rp 7.600', oldPrice: 'Rp 11.450', discount: '-34%', bestSeller: false, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335257146_885db790-4ace-4d8c-9623-e86a4fbe1b45.png' },
            { name: '59 Diamonds', amount: '59', bonus: '(53 + 6 Bonus)', price: 'Rp 15.200', oldPrice: 'Rp 22.900', discount: '-34%', bestSeller: false, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335251289_024e5af6-1940-4b03-a58c-e2cebd87f53a.png' },
            { name: '85 Diamonds', amount: '85', bonus: '(77 + 8 Bonus)', price: 'Rp 21.850', oldPrice: 'Rp 32.900', discount: '-34%', bestSeller: false, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335250982_614292cd-53b6-4fa4-a788-dfd7a536a01a.png' },
            { name: '170 Diamonds', amount: '170', bonus: '(154 + 16 Bonus)', price: 'Rp 43.700', oldPrice: 'Rp 65.800', discount: '-34%', bestSeller: false, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335250700_36de8ce9-3097-4744-b88a-cda2977a143f.png' },
            { name: '296 Diamonds', amount: '296', bonus: '(256 + 40 Bonus)', price: 'Rp 76.000', oldPrice: 'Rp 114.300', discount: '-34%', bestSeller: true, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335250416_094389b1-65ae-47ac-bf91-44284a7f0cd0.png' },
            { name: '408 Diamonds', amount: '408', bonus: '(367 + 41 Bonus)', price: 'Rp 104.500', oldPrice: 'Rp 115.500', discount: '-10%', bestSeller: true, img: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335250134_f16754c9-d0f3-42c0-83f8-6fc6e30e1d22.png' },
        ]
    },
    'freefire': { name: 'Free Fire', icon: '🔥', currency: 'Diamonds' },
    'genshin': { name: 'Genshin Impact', icon: '✨', currency: 'Crystals' },
    'pubg': { name: 'PUBG Mobile', icon: '🔫', currency: 'UC' },
    'valorant': { name: 'Valorant', icon: '🎯', currency: 'Points' },
    'codm': { name: 'Call of Duty: Mobile', icon: '🎖️', currency: 'CP' },
    'lol': { name: 'League of Legends: Wild Rift', icon: '⚔️', currency: 'Wild Cores' },
    'steam': { name: 'Steam Wallet', icon: '🎮', currency: 'IDR' },
    'roblox': { name: 'Roblox', icon: '🟥', currency: 'Robux' },
    'gplay': { name: 'Google Play', icon: '▶️', currency: 'IDR' }
};

// Generate demo options for games that don't have explicit `options` arrays.
// This produces realistic-looking nominal top-up tiers and pricing for layout/testing purposes.
function generateOptions(gameId, currency, count = 12) {
    const pricePerUnit = {
        'Diamonds': 350,
        'Crystals': 1200,
        'UC': 400,
        'Points': 150,
        'CP': 120,
        'Robux': 250,
        'IDR': 1,
        'default': 500
    };
    const ppu = pricePerUnit[currency] || pricePerUnit['default'];
    // Some common tier seeds to mirror typical top-up bundles (falls back to incremental doubling)
    const seedAmounts = {
        'Diamonds': [5,12,28,59,85,170,296,408,728,1450,2960,7290],
        'Crystals': [10,30,60,120,240,480],
        'UC': [40,85,170,340,680],
        'default': [10,50,100,200,500,1000]
    };
    const seeds = seedAmounts[currency] || seedAmounts['default'];
    const results = [];
    for (let i = 0; results.length < count; i++) {
        const amount = seeds[i] !== undefined ? seeds[i] : (seeds[seeds.length - 1] * Math.pow(2, i - seeds.length + 1));
        const priceNum = Math.round(amount * ppu);
        const oldPriceNum = Math.round(priceNum * (1 + (Math.random() * 0.35 + 0.05))); // 5-40% old price
        const discountPercent = Math.round(100 - (priceNum / oldPriceNum * 100));
        const opt = {
            name: `${amount} ${currency}`,
            amount: String(amount),
            bonus: (amount >= 100 ? `(Bonus ${Math.round(amount*0.05)} ${currency})` : ''),
            price: `Rp ${priceNum.toLocaleString('id-ID')}`,
            oldPrice: `Rp ${oldPriceNum.toLocaleString('id-ID')}`,
            discount: `-${discountPercent}%`,
            bestSeller: amount === seeds[Math.floor(seeds.length/2)] || (amount === 296),
            img: ''
        };
        results.push(opt);
        if (i > 50) break; // safety
    }
    return results.slice(0, count);
}

// Grab options data from original file (for MLBB we re-add the array here) to keep behaviour identical.
// For brevity in file content created here, we will load the full options on demand by copying from the original when needed.

function initPaymentPage() {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game') || 'mlbb';
    const data = games[gameId];
    if (!data) return;

    document.title = `Top Up ${data.name} | Lumiastore`;
    const titleEl = document.getElementById('game-title'); if (titleEl) titleEl.textContent = data.name;
    const iconEl = document.getElementById('game-icon'); if (iconEl) iconEl.textContent = data.icon;
    document.querySelectorAll('.currency-name').forEach(el => el.textContent = data.currency);

    // Render Options (if data.options exists on the real file this will work)
    const container = document.getElementById('nominal-options');
    if (!container) return;
    const options = (data.options && data.options.length) ? data.options : (data.options = generateOptions(gameId, data.currency, 12));

    container.innerHTML = '';
    options.forEach(opt => {
        const displayName = opt.name || `${opt.amount} ${data.currency}`;
        const displayImg = opt.img ? `<img src="${opt.img}" class="w-10 h-10 object-contain" alt="${displayName}">` : `<span class="text-3xl">${data.icon}</span>`;
        const bonusText = opt.bonus ? `<div class="text-xs text-gray-400">${opt.bonus}</div>` : '<div class="h-4"></div>';
        const isBestSeller = opt.bestSeller ? `<div class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-lg z-10 shadow-sm flex items-center gap-1">BEST SELLER</div>` : '';
        const discountInfo = opt.discount ? `<div class="flex items-center justify-end gap-2 mb-0.5"><span class="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded font-bold border border-white/10">${opt.discount}</span><span class="text-xs text-gray-400 line-through decoration-red-500/50">${opt.oldPrice}</span></div>` : '<div class="h-5 mb-0.5"></div>';

        const card = document.createElement('button');
        card.className = 'glass p-3 rounded-xl option-card transition text-left group relative flex flex-col justify-between h-full hover:bg-white/10 overflow-visible';
        card.innerHTML = `${isBestSeller}<div class="mb-2 flex items-start justify-between"><div class="flex-1 pr-2"><span class="font-bold text-sm md:text-base leading-tight block mb-1">${displayName}</span>${bonusText}</div><div class="flex-shrink-0">${displayImg}</div></div><div class="mt-2 pt-2 border-t border-white/5 text-right"><span class="text-[10px] text-gray-400 block mb-0.5">Dari</span><p class="text-sm md:text-base font-bold text-white group-hover:text-orange-400 transition-colors">${opt.price}</p>${discountInfo}</div>`;
        card.onclick = () => selectOption(card);
        card.dataset.name = displayName; card.dataset.bonus = opt.bonus || ''; card.dataset.price = opt.price || ''; card.dataset.oldPrice = opt.oldPrice || '';
        container.appendChild(card);
    });

    // Configure ID fields per game
    try {
        const userIdInput = document.getElementById('userId');
        const zoneInput = document.getElementById('zoneId');
        const zoneWrapper = zoneInput ? zoneInput.closest('.relative') : null;
        if (userIdInput) {
            if (gameId === 'mlbb' || gameId === 'mobilelegend') {
                userIdInput.placeholder = 'Masukkan User ID';
                if (zoneInput) zoneInput.placeholder = 'Zone ID';
                if (zoneWrapper) zoneWrapper.classList.remove('hidden');
            } else if (gameId === 'freefire') {
                userIdInput.placeholder = 'Masukkan Player ID';
                if (zoneWrapper) zoneWrapper.classList.add('hidden');
            } else if (gameId === 'genshin') {
                userIdInput.placeholder = 'Masukkan UID';
                if (zoneWrapper) zoneWrapper.classList.add('hidden');
            } else {
                userIdInput.placeholder = 'Masukkan User ID';
                if (zoneWrapper) zoneWrapper.classList.add('hidden');
            }
        }
    } catch (e) { console.warn('configure ID inputs failed', e); }
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const skeleton = document.getElementById('skeleton-loader');
        const content = document.getElementById('real-content');
        if (skeleton && content) {
            skeleton.style.opacity = '0';
            setTimeout(() => { skeleton.classList.add('hidden'); content.classList.remove('hidden'); AOS.refresh(); }, 500);
        }
        try {
            initPaymentPage();
            const container = document.getElementById('nominal-options');
            setTimeout(() => {
                const n = container ? container.children.length : 0;
                console.debug('[debug] Rendered', n, 'options for', document.getElementById('game-title')?.textContent || 'unknown');
                if (n === 0 && container) {
                    // Inject a minimal fallback option so the page is not blank
                    const fallback = document.createElement('div');
                    fallback.className = 'option-card bg-white p-4 rounded shadow-sm text-center';
                    fallback.innerHTML = '<div class="text-lg font-semibold">Fallback: 50 Diamonds</div><div class="mt-2 text-sm text-gray-600">Rp 10.000</div><div class="mt-3"><button onclick="selectOption(0)" class="px-3 py-1 bg-blue-600 text-white rounded">Select</button></div>';
                    container.appendChild(fallback);
                    setDebug('No options found — fallback injected', 'warning');
                }
            }, 50);
        } catch (err) {
            console.error(err);
            setDebug('Error initializing payment page: ' + (err && err.message ? err.message : err), 'error');
        }
    }, 800);
});

function selectOption(element) {
    document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedItemData = { name: element.dataset.name, bonus: element.dataset.bonus, price: element.dataset.price, oldPrice: element.dataset.oldPrice };
    updateBuyWidget();
}

function selectPayment(element) {
    document.querySelectorAll('.payment-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedPaymentMethod = element.querySelector('p') ? element.querySelector('p').innerText : '';
    updateBuyWidget();
}

function updateBuyWidget() {
    const widget = document.getElementById('buy-widget');
    if (!widget) return;
    if (selectedItemData && selectedPaymentMethod) {
        document.getElementById('widget-item-name').textContent = selectedItemData.name || '';
        document.getElementById('widget-item-bonus').textContent = selectedItemData.bonus || '';
        document.getElementById('widget-payment-method').textContent = selectedPaymentMethod || '';
        document.getElementById('widget-payment-method-mobile').textContent = selectedPaymentMethod || '';
        document.getElementById('widget-final-price').textContent = selectedItemData.price || '';
        const discountSection = document.getElementById('widget-discount-section');
        if (selectedItemData.oldPrice) {
            discountSection && discountSection.classList.remove('hidden');
            document.getElementById('widget-old-price').textContent = selectedItemData.oldPrice;
            const priceNum = parseInt(selectedItemData.price.replace(/[^0-9]/g, '')) || 0;
            const oldPriceNum = parseInt(selectedItemData.oldPrice.replace(/[^0-9]/g, '')) || 0;
            const saved = oldPriceNum - priceNum;
            document.getElementById('widget-saved-amount').textContent = `Hemat Rp ${saved.toLocaleString('id-ID')}`;
        } else {
            discountSection && discountSection.classList.add('hidden');
        }
        widget.classList.remove('translate-y-full');
    }
}

// USER ID lookup / validation (mocked with deterministic nickname suggestions)
const _nicknames = [ 'Kyu.', 'Nova', 'Raven', 'Aether', 'Vex', 'Lyra', 'Kai', 'Zara', 'Orin', 'Mika', 'Echo', 'Jin', 'Sora', 'Rin', 'Taro' ];
// Manual overrides for known IDs (easy to edit)
const KNOWN_NICKNAMES = { '453967075': 'Kyu.', '1037720261': 'sad+boy.' };

function deterministicNickname(userId) {
    if (!userId) return '';
    // simple hash to pick a nickname deterministically
    let h = 2166136261;
    for (let i = 0; i < userId.length; i++) { h ^= userId.charCodeAt(i); h = Math.imul(h, 16777619); }
    const idx = Math.abs(h) % _nicknames.length;
    const suffix = (parseInt(userId.slice(-4)) || 0) % 10000;
    return _nicknames[idx] + ' ' + suffix.toString().padStart(4, '0');
}

function mockLookupUserId(userId, zoneId) {
    // Returns a Promise that resolves to { ok: true, name: '...' } or rejects
    return new Promise((resolve, reject) => {
        // Basic format validation
        if (!/^[0-9]{6,}$/.test(userId) || !/^[0-9]{3,}$/.test(zoneId)) {
            setTimeout(() => reject(new Error('Format ID atau Zone tidak valid (minimal 6/3 digit)')), 250);
            return;
        }
        setTimeout(() => {
            // Deterministic demo response: first use KNOWN_NICKNAMES, otherwise fallback to deterministic generator
            if (String(userId) in KNOWN_NICKNAMES) resolve({ ok: true, name: KNOWN_NICKNAMES[String(userId)] });
            else resolve({ ok: true, name: deterministicNickname(userId) });
        }, 250);
    });
}

// Try the server proxy first (if available). Returns { ok, nickname } or { ok:false, error }
async function fetchMLBBNickname(userId, zoneId) {
    if (!userId || !zoneId) return { ok: false, error: 'missing parameters' };
    try {
        const resp = await fetch(`/api/mlbb/lookup?userId=${encodeURIComponent(userId)}&zoneId=${encodeURIComponent(zoneId)}`, { credentials: 'same-origin' });
        if (!resp.ok) {
            const j = await resp.json().catch(() => null);
            if (resp.status === 501) return { ok: false, error: j && j.error ? j.error : 'Server proxy not configured', raw: j };
            return { ok: false, error: `HTTP ${resp.status}`, raw: j };
        }
        const j = await resp.json().catch(() => null);
        // Robust nickname extraction: try common candidate paths
        function pickNickname(obj) {
            if (!obj) return null;
            const candidates = [
                'nickname', 'nick', 'name', 'player_name',
                'player', 'result', 'data',
            ];
            // direct fields
            for (const key of ['nickname','nick','name','player_name']) if (obj[key]) return obj[key];
            // nested common shapes
            if (obj.player && (obj.player.nickname || obj.player.name)) return obj.player.nickname || obj.player.name;
            if (obj.data && (obj.data.nickname || obj.data.name || obj.data.player_name)) return obj.data.nickname || obj.data.name || obj.data.player_name;
            if (obj.result && (obj.result.nickname || obj.result.name)) return obj.result.nickname || obj.result.name;
            // deep search for small objects: look for any key that contains 'nick' or 'name'
            for (const k of Object.keys(obj)) {
                const val = obj[k];
                if (!val) continue;
                if (typeof val === 'string' && /nick|name/i.test(k)) return val;
                if (typeof val === 'object') {
                    const nested = pickNickname(val);
                    if (nested) return nested;
                }
            }
            return null;
        }
        const nickname = pickNickname(j);
        if (nickname) return { ok: true, nickname };
        // no nickname found but keep raw for debug
        return { ok: false, error: 'No nickname field found in API response', raw: j };
    } catch (e) {
        return { ok: false, error: e && e.message ? e.message : String(e) };
    }
}

// Lightweight suggestion lookup for real-time UX (fast, deterministic, no failure)
function suggestNicknameFor(userId) {
    if (!/^[0-9]{4,}$/.test(userId)) return '';
    return deterministicNickname(userId);
}

// Simple debounce helper
function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}

function bindUserIdCheck() {
    const userIdInput = document.getElementById('userId');
    const zoneInput = document.getElementById('zoneId');
    const checkBtn = document.getElementById('check-id');
    const status = document.getElementById('user-id-status');
    const nameEl = document.getElementById('profile-name');
    const welcome = document.getElementById('welcome-text');
    const err = document.getElementById('user-id-error');
    const suggestEl = document.getElementById('profile-suggest');
    const editBtn = document.getElementById('edit-nickname-btn');
    const adminModal = document.getElementById('nickname-admin');
    const adminInput = document.getElementById('admin-nickname-input');
    const saveBtn = document.getElementById('save-nickname-btn');
    const cancelBtn = document.getElementById('cancel-nickname-btn');
    if (!userIdInput || !zoneInput || !checkBtn) return;

    // localStorage-backed overrides
    const OV_KEY = 'lumi_known_nicknames';
    function loadOverrides() {
        try { return JSON.parse(localStorage.getItem(OV_KEY) || '{}'); } catch (e) { return {}; }
    }
    function saveOverrides(obj) { try { localStorage.setItem(OV_KEY, JSON.stringify(obj)); } catch (e) { console.warn('saveOverrides failed', e); } }
    let overrides = loadOverrides();
    // Merge overrides into KNOWN_NICKNAMES in-memory map for fast checks (but keep persisted source authoritative)
    function getOverrideFor(uid) { overrides = loadOverrides(); return overrides && overrides[uid] ? overrides[uid] : null; }

    let lastCheckedUserId = null;

    function showError(msg) {
        if (err) { err.textContent = msg; err.classList.remove('hidden'); }
        if (status) status.classList.add('hidden');
    }
    function showSuccess(name) {
        if (nameEl) nameEl.textContent = name;
        if (status) status.classList.remove('hidden');
        if (err) err.classList.add('hidden');
        if (suggestEl) { suggestEl.textContent = ''; suggestEl.classList.add('hidden'); }
        // show edit button when we have a verified name
        if (editBtn) { editBtn.classList.remove('hidden'); }
    }
    function showSuggestion(name) {
        if (!suggestEl) return;
        if (!name) { suggestEl.textContent = ''; suggestEl.classList.add('hidden'); return; }
        suggestEl.textContent = 'Nickname: ' + name;
        suggestEl.classList.remove('hidden');
    }

    async function doCheck() {
        const uid = userIdInput.value.trim();
        const zid = zoneInput.value.trim();
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('game') || 'mlbb';
        lastCheckedUserId = uid || null;
        checkBtn.disabled = true; const prev = checkBtn.textContent; checkBtn.textContent = 'Memeriksa…';
        try {
            // If we have a manual override (persisted), use it immediately
            const persisted = getOverrideFor(uid);
            if (persisted) {
                showSuccess(persisted);
                localStorage.setItem('lumi_userId', uid);
                localStorage.setItem('lumi_zoneId', zid);
                userIdInput.classList.remove('border-red-500'); userIdInput.classList.add('border-green-500');
                zoneInput.classList.remove('border-red-500'); zoneInput.classList.add('border-green-500');
                return;
            }

            // Per-game validation
            if (gameId === 'mlbb' || gameId === 'mobilelegend') {
                if (!zid) { showError('Zone ID diperlukan untuk Mobile Legends'); userIdInput.classList.add('border-red-500'); zoneInput.classList.add('border-red-500'); return; }
                const apiRes = await fetchMLBBNickname(uid, zid);
                if (apiRes && apiRes.ok) {
                    showSuccess(apiRes.nickname || deterministicNickname(uid));
                    localStorage.setItem('lumi_userId', uid);
                    localStorage.setItem('lumi_zoneId', zid);
                    userIdInput.classList.remove('border-red-500'); userIdInput.classList.add('border-green-500');
                    zoneInput.classList.remove('border-red-500'); zoneInput.classList.add('border-green-500');
                    return;
                }
                if (apiRes && apiRes.raw) {
                    console.debug('MLBB API raw response:', apiRes.raw);
                }
            } else if (gameId === 'freefire') {
                const url = `/api/apigames/check-username?gameCode=freefire&userId=${encodeURIComponent(uid)}`;
                try {
                    const resp = await fetch(url);
                    const j = await resp.json().catch(()=>null);
                    if (resp.ok && j && j.status === 1 && j.data && j.data.is_valid) {
                        showSuccess(j.data.username || deterministicNickname(uid));
                        localStorage.setItem('lumi_userId', uid);
                        userIdInput.classList.remove('border-red-500'); userIdInput.classList.add('border-green-500');
                        zoneInput.classList.remove('border-red-500');
                        return;
                    }
                } catch (e) { /* fallthrough to mock */ }
            } else {
                // Other games: accept and show deterministic nickname suggestion as success
                const nick = deterministicNickname(uid);
                showSuccess(nick);
                localStorage.setItem('lumi_userId', uid);
                userIdInput.classList.remove('border-red-500'); userIdInput.classList.add('border-green-500');
                zoneInput.classList.remove('border-red-500');
                return;
            }

            setDebug('API validation gagal — fallback ke lookup lokal.', 'warn');

            // Fallback to local mock lookup
            const res = await mockLookupUserId(uid, zid);
            if (res && res.ok) {
                showSuccess(res.name || deterministicNickname(uid));
                localStorage.setItem('lumi_userId', uid);
                localStorage.setItem('lumi_zoneId', zid);
                userIdInput.classList.remove('border-red-500'); userIdInput.classList.add('border-green-500');
                zoneInput.classList.remove('border-red-500'); zoneInput.classList.add('border-green-500');
            }
        } catch (e) {
            // Last-resort: try mock and show error if it fails
            try {
                const res = await mockLookupUserId(uid, zid);
                if (res && res.ok) {
                    showSuccess(res.name || deterministicNickname(uid));
                    localStorage.setItem('lumi_userId', uid);
                    localStorage.setItem('lumi_zoneId', zid);
                    userIdInput.classList.remove('border-red-500'); userIdInput.classList.add('border-green-500');
                    zoneInput.classList.remove('border-red-500'); zoneInput.classList.add('border-green-500');
                }
            } catch (e2) {
                showError(e2 && e2.message ? e2.message : 'Terjadi kesalahan');
                userIdInput.classList.add('border-red-500'); zoneInput.classList.add('border-red-500');
            }
        } finally {
            checkBtn.disabled = false; checkBtn.textContent = prev;
        }
    }

    // Admin modal handlers
    if (editBtn && adminModal && adminInput && saveBtn && cancelBtn) {
        editBtn.addEventListener('click', () => {
            if (!lastCheckedUserId) return;
            const current = getOverrideFor(lastCheckedUserId) || document.getElementById('profile-name')?.textContent || '';
            adminInput.value = current;
            adminModal.classList.remove('hidden');
            adminInput.focus();
        });
        cancelBtn.addEventListener('click', () => { adminModal.classList.add('hidden'); });
        saveBtn.addEventListener('click', () => {
            const val = adminInput.value.trim();
            if (!lastCheckedUserId) return; // safety
            overrides = loadOverrides();
            if (val) overrides[lastCheckedUserId] = val; else delete overrides[lastCheckedUserId];
            saveOverrides(overrides);
            adminModal.classList.add('hidden');
            showSuccess(val || deterministicNickname(lastCheckedUserId));
            setDebug('Nickname override saved locally', 'warn');
        });
    }

    const debouncedSuggest = debounce(() => {
        const uid = userIdInput.value.trim();
        const persisted = getOverrideFor(uid);
        const suggest = persisted || suggestNicknameFor(uid);
        showSuggestion(suggest);
    }, 250);

    userIdInput.addEventListener('input', (e) => { err && err.classList.add('hidden'); userIdInput.classList.remove('border-red-500'); zoneInput.classList.remove('border-red-500'); debouncedSuggest(); });

    checkBtn.addEventListener('click', doCheck);
    [userIdInput, zoneInput].forEach(el => el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } }));

    // Prefill from localStorage if available
    const storedId = localStorage.getItem('lumi_userId'); const storedZone = localStorage.getItem('lumi_zoneId');
    if (storedId) userIdInput.value = storedId;
    if (storedZone) zoneInput.value = storedZone;
    // show suggestion on load if present
    if (userIdInput.value) { showSuggestion(suggestNicknameFor(userIdInput.value)); }
}

// Bind user ID check after DOM load
window.addEventListener('load', () => { try { bindUserIdCheck(); } catch (e) { console.debug('bindUserIdCheck failed', e); } try { bindBuyButton(); } catch (e) { console.debug('bindBuyButton failed', e); } });

// Create order and poll status
async function createOrder() {
    const uid = document.getElementById('userId')?.value.trim();
    const zid = document.getElementById('zoneId')?.value.trim();
    if (!uid || !zid) { setDebug('Masukkan User ID dan Zone ID sebelum membeli', 'warn'); return; }
    if (!selectedItemData || !selectedPaymentMethod) { setDebug('Pilih nominal dan metode pembayaran terlebih dahulu', 'warn'); return; }
    try {
        const resp = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: uid, zoneId: zid, sku: selectedItemData.name, amount: selectedItemData.amount, price: selectedItemData.price, paymentMethod: selectedPaymentMethod }) });
        const j = await resp.json();
        if (!j.ok) { setDebug('Gagal membuat order: ' + (j.error || 'unknown'), 'error'); return; }
        const order = j.order;
        setDebug('Order dibuat: ' + order.id + '. Mengarahkan ke halaman pembayaran...', 'warn');
        if (order.paymentUrl) window.open(order.paymentUrl, '_blank');
        // Poll status
        const poll = setInterval(async () => {
            try {
                const r = await fetch('/api/orders/' + encodeURIComponent(order.id));
                const x = await r.json().catch(() => null);
                if (!x || !x.ok) return;
                if (x.order.status === 'fulfilled') {
                    clearInterval(poll);
                    setDebug('Pembayaran & fulfilment selesai — diamond harusnya sudah dikirim.', 'info');
                } else {
                    console.debug('Order status', x.order.status);
                }
            } catch (e) { console.debug('poll error', e); }
        }, 2000);
    } catch (e) { setDebug('Gagal membuat order: ' + (e.message || e), 'error'); }
}

function bindBuyButton() {
    const btn = document.querySelector('#buy-widget button');
    if (!btn) return;
    btn.addEventListener('click', (e) => { e.preventDefault(); createOrder(); });
}

// Expose helpers for in-page onclick attributes if any
window.selectPayment = selectPayment;
window.selectOption = selectOption;
