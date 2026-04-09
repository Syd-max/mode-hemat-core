/**
 * MODE HEMAT v2 — app.js
 * Fresh Sky Blue Edition — Remaja Indo vibes 🇮🇩
 * Changes:
 *  - New mode options (Gaul, Santai, Petualang, Hemat Abis)
 *  - User-editable Quick Log prices
 *  - Custom activity additions per vibe
 *  - Expanded places (Jakarta vibes, gunung, FOMO spots)
 *  - Collapsed transaction history (expandable button)
 *  - Export to CSV/Excel instead of JSON
 *  - Aesthetic welcome sound on homepage load
 *  - Budget slider range 500k–10jt
 */

'use strict';

/* ============================================================
   CONSTANTS & DEFAULT DATA
============================================================ */

const STORAGE_KEY = 'modeHematDataV2';

/** Default quick-log prices — user can override */
const DEFAULT_QL_PRICES = {
  coffee:    25000,
  food:      40000,
  walk:      0,
  shopping:  100000,
  transport: 15000,
};

const QUICK_CATEGORIES_META = {
  coffee:    { label: 'Kopi',      icon: '☕' },
  food:      { label: 'Makan',     icon: '🍜' },
  walk:      { label: 'Jalan',     icon: '🚶' },
  shopping:  { label: 'Belanja',   icon: '🛍️' },
  transport: { label: 'Transport', icon: '🛵' },
};

const MODE_META = {
  'gaul':       { label: 'Gaul Sosmed',    icon: '📱', color: '#ff6b6b' },
  'santai':     { label: 'Santai di Rumah',icon: '🛋️', color: '#00c9a7' },
  'petualang':  { label: 'Semangat Jalan', icon: '🏔️', color: '#ff9f43' },
  'hemat-abis': { label: 'Hemat Abis',     icon: '💸', color: '#a29bfe' },
};

/**
 * Default places — expanded, Jakarta-focused, relevant for teens
 */
const DEFAULT_PLACES = [
  // Kafe
  { id:'p1',  name:'Kopi Kenangan',          type:'cafe',     price:25000, desc:'Kopi kekinian harga terjangkau, ada dimana-mana', isDefault:true },
  { id:'p2',  name:'Fore Coffee',            type:'cafe',     price:35000, desc:'Minimalis aesthetic, teman WFC favorit', isDefault:true },
  { id:'p3',  name:'Kopi Nako Rumah Sangrai',type:'cafe',     price:30000, desc:'Specialty coffee cozy, cocok santai sore', isDefault:true },
  { id:'p4',  name:'Arutala Coffee Kemang',  type:'cafe',     price:40000, desc:'Viral golden hour setup, wajib foto', isDefault:true },
  { id:'p5',  name:'Skyhook Coffee Rooftop', type:'cafe',     price:35000, desc:'Rooftop vibes, Jaktim, hampir 24 jam', isDefault:true },
  { id:'p6',  name:'Sarang Semut Blok M',    type:'cafe',     price:30000, desc:'Hidden gem, minimalis hangat, dekat transportasi', isDefault:true },
  // Thrifting
  { id:'p7',  name:'Pasar Santa',            type:'thrifting',price:50000, desc:'Thrift branded dengan vibes seru, Jaksel', isDefault:true },
  { id:'p8',  name:'Glodok Plaza Thrift',    type:'thrifting',price:40000, desc:'Fashion impor harga reasonable, Jakarta Kota', isDefault:true },
  { id:'p9',  name:'Pasar Senen',            type:'thrifting',price:30000, desc:'Thrift legendaris, murah banget!', isDefault:true },
  { id:'p10', name:'Pasar Baru Trade Center',type:'thrifting',price:45000, desc:'Branded second, strategis banget', isDefault:true },
  // Gratis
  { id:'p11', name:'Hutan Kota GBK',         type:'free',     price:0,     desc:'Gratis, adem, cocok joging atau rebahan', isDefault:true },
  { id:'p12', name:'Taman Suropati Menteng', type:'free',     price:0,     desc:'Taman estetik, favorit anak gaul Jakpus', isDefault:true },
  { id:'p13', name:'Taman Langsat Kebayoran',type:'free',     price:0,     desc:'Gratis, tenang, hidden gem Jaksel', isDefault:true },
  { id:'p14', name:'Kota Tua Jakarta',       type:'free',     price:0,     desc:'Historical vibes, foto oke, transport mudah', isDefault:true },
  { id:'p15', name:'Waduk Lebak Bulus',      type:'free',     price:0,     desc:'Viral di X/Twitter, dekat MRT, view adem', isDefault:true },
  // Explore / Gunung / Alam
  { id:'p16', name:'Gunung Gede Pangrango',  type:'explore',  price:50000, desc:'Trek populer dari Cianjur, ± 3-4 jam ke puncak', isDefault:true },
  { id:'p17', name:'Gunung Papandayan',      type:'explore',  price:40000, desc:'Kawah cantik, cocok pemula, via Garut', isDefault:true },
  { id:'p18', name:'Pantai Sawarna Banten',  type:'explore',  price:30000, desc:'Budget trip seru, ombak gede, vibes bagus', isDefault:true },
  { id:'p19', name:'Tebing Keraton Bandung', type:'explore',  price:15000, desc:'HTM murah, view sunrise amazing', isDefault:true },
  { id:'p20', name:'Curug Cilember Bogor',   type:'explore',  price:25000, desc:'Waterfall hop, sejuk, bisa dari Jakarta', isDefault:true },
  // FOMO Spots
  { id:'p21', name:'Blok M Square & Area',   type:'fomo',     price:50000, desc:'Nongkrong seru anak muda, banyak pilihan makan', isDefault:true },
  { id:'p22', name:'Officers Cafe Tanjung Priok',type:'fomo', price:35000, desc:'Viral TikTok, view kapal + sunset, dekat tol', isDefault:true },
  { id:'p23', name:'ROOFPARK Jakarta',       type:'fomo',     price:75000, desc:'Golden hour reels hits, rooftop premium', isDefault:true },
  { id:'p24', name:'K Mall Kemayoran',       type:'fomo',     price:0,     desc:'Mall baru 2025, vibes luar negeri, gratis masuk', isDefault:true },
  { id:'p25', name:'Anora Cafe Jakarta Timur',type:'fomo',    price:40000, desc:'Aesthetic Santorini, viral TikTok, bougenvile', isDefault:true },
  // Cozy
  { id:'p26', name:'Coffee Toffee',          type:'cozy',     price:28000, desc:'Cozy chain, cocok nugas, ada colokan', isDefault:true },
  { id:'p27', name:'Excelso',                type:'cozy',     price:45000, desc:'Tenang, Wi-Fi kencang, cocok WFC seharian', isDefault:true },
  { id:'p28', name:'Rumah sendiri / kos',    type:'cozy',     price:0,     desc:'Budget paling hemat, mager is self care 😴', isDefault:true },
];

/**
 * Activity templates per vibe — lebih banyak opsi
 */
const ACTIVITY_TEMPLATES = {
  cozy: [
    { name:'Ngopi di Kafe Cozy',      cat:'cafe',      icon:'☕', price:30000, unsplash:'photo-1459755486867-b55449bb39ff?w=600&q=70' },
    { name:'Baca Buku di Rumah',      cat:'free',      icon:'📚', price:0,     unsplash:'photo-1519682337058-a94d519337bc?w=600&q=70' },
    { name:'Makan Comfort Food',      cat:'food',      icon:'🍲', price:40000, unsplash:'photo-1546069901-ba9599a7e63c?w=600&q=70' },
    { name:'Nonton Series di Kos',    cat:'free',      icon:'📺', price:0,     unsplash:'photo-1522869635100-9f4c5e86aa37?w=600&q=70' },
    { name:'Bobo Siang Quality Time', cat:'free',      icon:'😴', price:0,     unsplash:'photo-1520206183501-b80df61043c2?w=600&q=70' },
    { name:'Bikin Minuman Sendiri',   cat:'free',      icon:'🍵', price:5000,  unsplash:'photo-1544787219-7f47ccb76574?w=600&q=70' },
  ],
  explore: [
    { name:'Trip ke Gunung Gede',     cat:'explore',   icon:'🏔️', price:150000,unsplash:'photo-1464822759023-fed622ff2c3b?w=600&q=70' },
    { name:'Day Trip ke Pantai',      cat:'explore',   icon:'🏖️', price:100000,unsplash:'photo-1507525428034-b723cf961d3e?w=600&q=70' },
    { name:'Jalan ke Taman Kota',     cat:'free',      icon:'🌳', price:0,     unsplash:'photo-1504208434309-cb69f4fe52b0?w=600&q=70' },
    { name:'Explore Kafe Baru',       cat:'cafe',      icon:'🗺️', price:40000, unsplash:'photo-1600093463592-8e36ae95ef56?w=600&q=70' },
    { name:'Curug Hunting',           cat:'explore',   icon:'💦', price:30000, unsplash:'photo-1471513671800-b09c87e1497c?w=600&q=70' },
    { name:'Keliling Kota Tua',       cat:'free',      icon:'🏛️', price:0,     unsplash:'photo-1555881400-74d7acaacd8b?w=600&q=70' },
  ],
  fomo: [
    { name:'Kafe Aesthetic Viral',    cat:'cafe',      icon:'📸', price:45000, unsplash:'photo-1501339847302-ac426a4a7cbb?w=600&q=70' },
    { name:'Thrift Item Viral',       cat:'thrifting', icon:'✨', price:75000, unsplash:'photo-1558769132-cb1aea458c5e?w=600&q=70' },
    { name:'Kulineran Trending',      cat:'food',      icon:'🍱', price:55000, unsplash:'photo-1555396273-367ea4eb4db5?w=600&q=70' },
    { name:'Blok M Hangout',         cat:'fomo',      icon:'🔥', price:60000, unsplash:'photo-1512453979798-5ea266f8880c?w=600&q=70' },
    { name:'Rooftop Golden Hour',     cat:'fomo',      icon:'🌅', price:80000, unsplash:'photo-1477959858617-67f85cf4f1df?w=600&q=70' },
    { name:'OOTD Spot Baru',          cat:'free',      icon:'🤳', price:0,     unsplash:'photo-1529636798458-92182e662485?w=600&q=70' },
  ],
  biasa: [
    { name:'Ngopi Sambil Kerja',      cat:'cafe',      icon:'💻', price:30000, unsplash:'photo-1531498860502-7c67cf519b9e?w=600&q=70' },
    { name:'Makan Siang Warteg',      cat:'food',      icon:'🍛', price:20000, unsplash:'photo-1504674900247-0877df9cc836?w=600&q=70' },
    { name:'Jalan Santai Sore',       cat:'free',      icon:'🌤️', price:0,     unsplash:'photo-1475924156734-496f6cac6ec1?w=600&q=70' },
    { name:'Beli Jajan Pinggir Jalan',cat:'food',      icon:'🧆', price:15000, unsplash:'photo-1567620905732-2d1ec7ab7445?w=600&q=70' },
    { name:'Scroll TikTok di Rumah', cat:'free',      icon:'📲', price:0,     unsplash:'photo-1522869635100-9f4c5e86aa37?w=600&q=70' },
  ],
};

/* ============================================================
   STATE
============================================================ */

let data = {};
let pendingConfirmCallback = null;
let currentPlaceFilter = 'all';
let historyExpanded = false;
let currentVibe = null;
let customActivities = {}; // keyed by vibe

/* ============================================================
   STORAGE
============================================================ */

const Storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.mode || typeof parsed.totalBudget !== 'number') return null;
      return parsed;
    } catch { return null; }
  },
  save(d) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
    catch { UI.showToast('⚠️ Gagal simpan. Storage penuh?'); }
  },
  clear() { localStorage.removeItem(STORAGE_KEY); },
};

/* ============================================================
   DATA
============================================================ */

const Data = {
  createInitial(mode, budget) {
    return {
      mode,
      totalBudget:     budget,
      remainingBudget: budget,
      transactions:    [],
      places:          JSON.parse(JSON.stringify(DEFAULT_PLACES)),
      customActivities:{},
      qlPrices:        { ...DEFAULT_QL_PRICES },
      vibes:           [],
      createdAt:       new Date().toISOString(),
    };
  },

  migrate(raw) {
    if (!raw.places || !Array.isArray(raw.places)) raw.places = JSON.parse(JSON.stringify(DEFAULT_PLACES));
    if (!raw.transactions || !Array.isArray(raw.transactions)) raw.transactions = [];
    if (!raw.vibes || !Array.isArray(raw.vibes)) raw.vibes = [];
    if (!raw.createdAt) raw.createdAt = new Date().toISOString();
    if (!raw.qlPrices) raw.qlPrices = { ...DEFAULT_QL_PRICES };
    if (!raw.customActivities) raw.customActivities = {};
    // Merge any new default places not in saved data
    const savedIds = new Set(raw.places.map(p => p.id));
    DEFAULT_PLACES.forEach(dp => { if (!savedIds.has(dp.id)) raw.places.push({ ...dp }); });
    return raw;
  },

  addTransaction(amount, name, category, icon) {
    const safeAmount = Math.max(0, Number(amount) || 0);
    data.remainingBudget = Math.max(0, data.remainingBudget - safeAmount);
    data.transactions.unshift({
      id:       `txn_${Date.now()}`,
      amount:   safeAmount,
      name:     name || 'Transaksi',
      category: category || 'other',
      icon:     icon || '💸',
      date:     new Date().toISOString(),
    });
    Storage.save(data);
  },

  addPlace(name, type, price, desc) {
    data.places.push({
      id:   `place_${Date.now()}`,
      name: name.trim(),
      type,
      price: Math.max(0, Number(price) || 0),
      desc: desc?.trim() || '',
    });
    Storage.save(data);
  },

  addCustomActivity(vibe, act) {
    if (!data.customActivities[vibe]) data.customActivities[vibe] = [];
    data.customActivities[vibe].push(act);
    Storage.save(data);
  },

  getTodayTransactions() {
    const today = new Date().toDateString();
    return data.transactions.filter(t => new Date(t.date).toDateString() === today);
  },

  countHappyDays() {
    const days = {};
    data.transactions.forEach(t => {
      const day = new Date(t.date).toDateString();
      if (!days[day]) days[day] = 0;
      days[day] += t.amount;
    });
    return Object.values(days).filter(v => v <= 100000).length;
  },

  countBorosWeeks() {
    const weeks = {};
    data.transactions.forEach(t => {
      const d = new Date(t.date);
      const jan1 = new Date(d.getFullYear(),0,1);
      const wn = Math.ceil(((d-jan1)/86400000 + jan1.getDay()+1)/7);
      const key = `${d.getFullYear()}-W${wn}`;
      if (!weeks[key]) weeks[key] = 0;
      weeks[key] += t.amount;
    });
    return Object.values(weeks).filter(v => v > 500000).length;
  },

  getTotalSpent() {
    return data.transactions.reduce((s,t) => s + t.amount, 0);
  },
};

/* ============================================================
   FORMAT UTILITIES
============================================================ */

const Fmt = {
  rupiah(n) {
    return new Intl.NumberFormat('id-ID',{ style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n);
  },
  rupiahShort(n) {
    if (n === 0) return 'Gratis';
    if (n >= 1000000) return `${(n/1000000).toFixed(1).replace('.0','')}jt`;
    if (n >= 1000)    return `${Math.round(n/1000)}rb`;
    return `Rp ${n}`;
  },
  relativeDate(iso) {
    const d = new Date(iso), now = new Date();
    const diffMin = Math.floor((now-d)/60000);
    const diffHr  = Math.floor((now-d)/3600000);
    if (diffMin < 1)  return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHr  < 24) return `${diffHr} jam lalu`;
    return d.toLocaleDateString('id-ID',{ day:'numeric', month:'short' });
  },
};

/* ============================================================
   SOUND MODULE — aesthetic welcome chime
============================================================ */

const Sound = {
  ctx: null,
  init() {
    // We'll create audio context on first user interaction
    document.addEventListener('click', Sound._ensureCtx, { once: true });
    document.addEventListener('touchstart', Sound._ensureCtx, { once: true });
  },
  _ensureCtx() {
    if (!Sound.ctx) {
      try { Sound.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch {}
    }
  },
  /** Play a gentle ascending chime */
  playWelcome() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.18 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.5);
        osc.start(ctx.currentTime + i * 0.18);
        osc.stop(ctx.currentTime + i * 0.18 + 0.5);
      });
    } catch {}
  },
  playTap() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  },
};

/* ============================================================
   UI MODULE
============================================================ */

const UI = {
  updateBudgetBar() {
    const pct = data.totalBudget > 0
      ? Math.max(0, Math.min(100, (data.remainingBudget / data.totalBudget) * 100))
      : 0;

    const fill  = document.getElementById('budget-bar-fill');
    const emoji = document.getElementById('budget-emoji');
    const track = document.getElementById('budget-bar-track');
    if (!fill || !emoji) return;

    fill.style.width = `${pct}%`;
    track?.setAttribute('aria-valuenow', Math.round(pct));

    if (pct > 60)     fill.style.background = 'linear-gradient(90deg,#00c9a7,#6bcb77)';
    else if (pct > 25) fill.style.background = 'linear-gradient(90deg,#ffb347,#f4c86a)';
    else               fill.style.background = 'linear-gradient(90deg,#ff6b6b,#e53e3e)';

    emoji.textContent = pct > 60 ? '😊' : pct > 25 ? '😐' : '😰';
  },

  updateBudgetDisplay() {
    const el      = document.getElementById('budget-amount');
    const totalEl = document.getElementById('budget-total');
    if (el)      el.textContent = Fmt.rupiah(data.remainingBudget);
    if (totalEl) totalEl.textContent = Fmt.rupiah(data.totalBudget);
  },

  showToast(msg, dur = 2800) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    if (UI._toastTimer) clearTimeout(UI._toastTimer);
    toast.textContent = msg;
    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('show');
    UI._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, dur);
  },
  _toastTimer: null,

  openConfirmModal(description, onConfirm) {
    const backdrop = document.getElementById('modal-backdrop');
    const descEl   = document.getElementById('modal-desc');
    if (!backdrop || !descEl) return;
    descEl.textContent = description;
    pendingConfirmCallback = onConfirm;
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
    document.getElementById('modal-confirm')?.focus();
  },

  closeConfirmModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.classList.add('hidden');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    pendingConfirmCallback = null;
  },

  renderTodayTransactions() {
    const container = document.getElementById('today-transactions-list');
    if (!container) return;
    const txns = Data.getTodayTransactions();
    container.innerHTML = txns.length
      ? txns.map(t => UI._txnItemHTML(t)).join('')
      : '<p class="empty-state">Belum ada transaksi hari ini. 🌟</p>';
  },

  renderAllTransactions() {
    const container = document.getElementById('all-transactions-list');
    if (!container) return;
    const txns = data.transactions.slice(0, 50);
    container.innerHTML = txns.length
      ? txns.map(t => UI._txnItemHTML(t)).join('')
      : '<p class="empty-state">Belum ada transaksi.</p>';

    // Apply collapsed state
    if (!historyExpanded) {
      container.classList.add('collapsed');
    } else {
      container.classList.remove('collapsed');
    }
    UI._updateHistoryToggle(txns.length);
  },

  _updateHistoryToggle(total) {
    const btn = document.getElementById('btn-toggle-history');
    if (!btn) return;
    if (total <= 3) { btn.style.display = 'none'; return; }
    btn.style.display = '';
    btn.textContent = historyExpanded ? 'Sembunyikan ↑' : `Lihat Semua (${total}) ↓`;
  },

  _txnItemHTML(t) {
    const cls  = t.amount === 0 ? 'txn-amount free' : 'txn-amount';
    const txt  = t.amount === 0 ? 'Gratis' : `−${Fmt.rupiah(t.amount)}`;
    return `
      <div class="transaction-item" role="listitem">
        <div class="txn-icon" aria-hidden="true">${t.icon || '💸'}</div>
        <div class="txn-info">
          <p class="txn-name">${escapeHTML(t.name)}</p>
          <p class="txn-date">${Fmt.relativeDate(t.date)}</p>
        </div>
        <span class="${cls}">${txt}</span>
      </div>`;
  },

  renderPlaces() {
    const container = document.getElementById('places-list');
    if (!container) return;

    const filtered = currentPlaceFilter === 'all'
      ? data.places
      : data.places.filter(p => p.type === currentPlaceFilter);

    if (!filtered.length) {
      container.innerHTML = '<p class="empty-state">Tidak ada tempat di kategori ini.</p>';
      return;
    }

    const typeIcon = { cafe:'☕', thrifting:'🛍️', free:'🌳', explore:'🏔️', fomo:'🔥', cozy:'☁️' };

    container.innerHTML = filtered.map(p => `
      <div class="place-item" role="listitem">
        <div class="place-icon" aria-hidden="true">${typeIcon[p.type] || '📍'}</div>
        <div class="place-info">
          <p class="place-name">${escapeHTML(p.name)}</p>
          <p class="place-sub">${p.price > 0 ? `~${Fmt.rupiah(p.price)}` : 'Gratis ✓'}</p>
          ${p.desc ? `<p style="font-size:11px;color:var(--text-muted);margin-top:2px">${escapeHTML(p.desc)}</p>` : ''}
        </div>
        <a class="btn-maps"
           href="https://maps.google.com/?q=${encodeURIComponent(p.name)}"
           target="_blank" rel="noopener noreferrer"
           aria-label="Buka ${escapeHTML(p.name)} di Google Maps">
          🗺️ Maps
        </a>
      </div>`).join('');
  },

  renderStats() {
    const happyEl = document.getElementById('stat-happy-days');
    const borosEl = document.getElementById('stat-boros-weeks');
    const totalEl = document.getElementById('stat-total-spent');
    if (happyEl) happyEl.textContent = Data.countHappyDays();
    if (borosEl) borosEl.textContent = Data.countBorosWeeks();
    if (totalEl) totalEl.textContent = Fmt.rupiahShort(Data.getTotalSpent());
  },

  renderActivities(vibe) {
    currentVibe = vibe;
    const section   = document.getElementById('activities-section');
    const container = document.getElementById('activity-cards');
    if (!section || !container) return;

    const templates = [
      ...(ACTIVITY_TEMPLATES[vibe] || ACTIVITY_TEMPLATES.biasa),
      ...(data.customActivities?.[vibe] || []),
    ];
    const budget = data.remainingBudget;

    container.innerHTML = templates.map(tpl => {
      const price      = tpl.price ?? 0;
      const canAfford  = price === 0 || budget >= price;
      const priceLabel = price === 0 ? 'Gratis ✓' : Fmt.rupiah(price);
      const imgSrc     = tpl.imgUrl
        ? escapeHTML(tpl.imgUrl)
        : `https://images.unsplash.com/${tpl.unsplash || 'photo-1531498860502-7c67cf519b9e?w=600&q=70'}`;

      return `
        <div class="activity-card" role="listitem">
          <img class="activity-card-img" src="${imgSrc}" alt="${escapeHTML(tpl.name)}"
               loading="lazy"
               onerror="this.style.background='var(--bg-elevated)';this.style.height='120px';this.removeAttribute('src');" />
          <div class="activity-card-body">
            <h3>${tpl.icon || '✦'} ${escapeHTML(tpl.name)}</h3>
            <div class="activity-meta">
              <span class="activity-price${price===0?' free':''}">${priceLabel}</span>
              <span class="activity-cat-badge">${tpl.cat}</span>
            </div>
            <button class="btn-pilih"
              data-amount="${price}"
              data-name="${escapeHTML(tpl.name)}"
              data-icon="${tpl.icon || '✦'}"
              data-cat="${tpl.cat}"
              ${canAfford ? '' : 'disabled aria-disabled="true"'}
              aria-label="Pilih ${escapeHTML(tpl.name)}">
              ${canAfford ? 'Pilih ✦' : 'Budget Kurang'}
            </button>
          </div>
        </div>`;
    }).join('');

    section.classList.remove('hidden');
    section.scrollIntoView({ behavior:'smooth', block:'nearest' });
  },

  renderQuickLog() {
    const grid = document.getElementById('quick-log-grid');
    if (!grid) return;
    const prices = data.qlPrices || DEFAULT_QL_PRICES;
    grid.innerHTML = Object.entries(QUICK_CATEGORIES_META).map(([key, meta]) => {
      const price = prices[key] ?? DEFAULT_QL_PRICES[key];
      return `
        <button class="quick-btn" data-cat="${key}"
          aria-label="${meta.label} ${price > 0 ? Fmt.rupiah(price) : 'Gratis'}">
          <span>${meta.icon}</span>
          <small>${meta.label}</small>
          <small class="ql-price">${price > 0 ? Fmt.rupiahShort(price) : 'Gratis'}</small>
        </button>`;
    }).join('');

    // Re-attach click listeners
    grid.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.playTap();
        Spending.quickLog(btn.dataset.cat);
      });
    });
  },

  applyModeTheme() {
    const meta = MODE_META[data.mode] || MODE_META['santai'];
    document.body.className = document.body.className.replace(/mode-\S+/g,'').trim();
    document.body.classList.add(`mode-${data.mode}`);
    const badge = document.getElementById('mode-badge');
    if (badge) badge.textContent = `${meta.icon} ${meta.label}`;
  },
};

/* ============================================================
   NAVIGATION
============================================================ */

const Nav = {
  SECTIONS: ['section-dashboard','section-tempat','section-profil'],

  goTo(targetId) {
    if (!Nav.SECTIONS.includes(targetId)) return;
    Nav.SECTIONS.forEach(id => {
      document.getElementById(id)?.classList.toggle('hidden', id !== targetId);
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === targetId);
    });
    if (targetId === 'section-tempat')  UI.renderPlaces();
    if (targetId === 'section-profil') { UI.renderStats(); UI.renderAllTransactions(); }
    if (targetId === 'section-dashboard') UI.renderTodayTransactions();
  },
};

/* ============================================================
   SPENDING
============================================================ */

const Spending = {
  prompt(amount, name, icon, category) {
    const safeAmount = Math.max(0, Number(amount) || 0);
    const desc = safeAmount > 0
      ? `Catat ${name} senilai ${Fmt.rupiah(safeAmount)}?`
      : `Catat ${name} (Gratis)?`;

    UI.openConfirmModal(desc, () => {
      Data.addTransaction(safeAmount, name, category, icon);
      UI.updateBudgetBar();
      UI.updateBudgetDisplay();
      UI.renderTodayTransactions();
      UI.showToast(`${icon} Tersimpan!`);
      Sound.playTap();
    });
  },

  quickLog(catKey) {
    const meta  = QUICK_CATEGORIES_META[catKey];
    if (!meta) return;
    const price = data.qlPrices?.[catKey] ?? DEFAULT_QL_PRICES[catKey];
    Data.addTransaction(price, meta.label, catKey, meta.icon);
    UI.updateBudgetBar();
    UI.updateBudgetDisplay();
    UI.renderTodayTransactions();
    UI.showToast(`${meta.icon} ${meta.label} ${price > 0 ? '−'+Fmt.rupiahShort(price) : 'Gratis'}`);
  },
};

/* ============================================================
   ONBOARDING
============================================================ */

const Onboarding = {
  selectedMode: null,

  init() {
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        Sound.playTap();
        Onboarding.selectMode(card.dataset.mode);
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Onboarding.selectMode(card.dataset.mode); }
      });
    });

    const slider  = document.getElementById('budget-slider');
    const display = document.getElementById('budget-display-value');
    if (slider && display) {
      const update = () => {
        const val = Number(slider.value);
        display.textContent = Fmt.rupiah(val);
        // Update slider track fill
        const pct = ((val - Number(slider.min)) / (Number(slider.max) - Number(slider.min))) * 100;
        slider.style.setProperty('--pct', `${pct}%`);
      };
      slider.addEventListener('input', update);
      update(); // init
    }

    document.getElementById('btn-start')?.addEventListener('click', Onboarding.startApp);
  },

  selectMode(mode) {
    if (!MODE_META[mode]) return;
    Onboarding.selectedMode = mode;
    document.querySelectorAll('.mode-card').forEach(card => {
      const sel = card.dataset.mode === mode;
      card.classList.toggle('selected', sel);
      card.setAttribute('aria-checked', sel ? 'true' : 'false');
    });
    const btn = document.getElementById('btn-start');
    if (btn) { btn.disabled = false; btn.removeAttribute('aria-disabled'); }
  },

  startApp() {
    if (!Onboarding.selectedMode) { UI.showToast('✦ Pilih Mode-mu dulu!'); return; }
    const slider = document.getElementById('budget-slider');
    const budget = slider ? Number(slider.value) : 2500000;
    if (isNaN(budget) || budget < 500000) { UI.showToast('⚠️ Budget tidak valid.'); return; }
    data = Data.createInitial(Onboarding.selectedMode, budget);
    Storage.save(data);
    Sound.playWelcome();
    App.showDashboard();
  },
};

/* ============================================================
   PLACES
============================================================ */

const Places = {
  init() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPlaceFilter = btn.dataset.filter;
        UI.renderPlaces();
      });
    });

    const btnToggle = document.getElementById('btn-toggle-add-place');
    const form      = document.getElementById('add-place-form');
    const btnCancel = document.getElementById('btn-cancel-place');
    const btnSave   = document.getElementById('btn-save-place');

    btnToggle?.addEventListener('click', () => {
      form?.classList.toggle('hidden');
      btnToggle.textContent = form?.classList.contains('hidden') ? '+ Tambah Tempat Sendiri' : '✕ Tutup';
    });

    btnCancel?.addEventListener('click', () => {
      form?.classList.add('hidden');
      if (btnToggle) btnToggle.textContent = '+ Tambah Tempat Sendiri';
      Places.clearForm();
    });

    btnSave?.addEventListener('click', Places.savePlace);
  },

  savePlace() {
    const name  = document.getElementById('place-name')?.value.trim() || '';
    const type  = document.getElementById('place-type')?.value || 'cafe';
    const price = Number(document.getElementById('place-price')?.value) || 0;
    const desc  = document.getElementById('place-desc')?.value.trim() || '';

    if (!name || name.length < 2) { UI.showToast('⚠️ Nama minimal 2 karakter.'); return; }
    if (price < 0 || price > 10000000) { UI.showToast('⚠️ Harga tidak valid.'); return; }

    Data.addPlace(name, type, price, desc);
    UI.renderPlaces();
    UI.showToast('📍 Tempat tersimpan!');
    Places.clearForm();
    document.getElementById('add-place-form')?.classList.add('hidden');
    const btn = document.getElementById('btn-toggle-add-place');
    if (btn) btn.textContent = '+ Tambah Tempat Sendiri';
  },

  clearForm() {
    ['place-name','place-price','place-desc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  },
};

/* ============================================================
   PROFILE / DATA
============================================================ */

const Profile = {
  init() {
    document.getElementById('btn-export')?.addEventListener('click', Profile.exportCSV);
    document.getElementById('import-file-input')?.addEventListener('change', Profile.importData);
    document.getElementById('btn-ganti-mode')?.addEventListener('click', Profile.gantiMode);
    document.getElementById('btn-hapus')?.addEventListener('click', Profile.hapusData);

    document.getElementById('btn-toggle-history')?.addEventListener('click', () => {
      historyExpanded = !historyExpanded;
      const container = document.getElementById('all-transactions-list');
      container?.classList.toggle('collapsed', !historyExpanded);
      UI._updateHistoryToggle(data.transactions.length);
    });
  },

  exportCSV() {
    try {
      const header = ['Tanggal','Nama','Kategori','Jumlah (Rp)'];
      const rows = data.transactions.map(t => [
        new Date(t.date).toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}),
        t.name.replace(/,/g,';'),
        t.category,
        t.amount,
      ]);
      const csv = [header, ...rows].map(r => r.join(',')).join('\n');
      const bom = '\uFEFF'; // UTF-8 BOM untuk Excel compatibility
      const blob = new Blob([bom + csv], { type:'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `modehemat-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      UI.showToast('📊 Export CSV berhasil! Bisa dibuka di Excel / Sheets 🎉');
    } catch { UI.showToast('⚠️ Export gagal.'); }
  },

  importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      UI.showToast('⚠️ File harus .json');
      e.target.value = '';
      return;
    }
    if (file.size > 5*1024*1024) { UI.showToast('⚠️ File terlalu besar.'); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed?.mode || typeof parsed.totalBudget !== 'number') throw new Error('invalid');
        if (!Array.isArray(parsed.transactions)) throw new Error('invalid txn');
        data = Data.migrate(parsed);
        Storage.save(data);
        UI.showToast('📥 Import berhasil!');
        setTimeout(() => window.location.reload(), 1200);
      } catch { UI.showToast('⚠️ File tidak valid.'); }
      finally  { e.target.value = ''; }
    };
    reader.onerror = () => { UI.showToast('⚠️ Gagal baca file.'); e.target.value = ''; };
    reader.readAsText(file);
  },

  gantiMode() {
    if (!confirm('Ganti Mode akan reset aplikasi. Data akan hilang.\n\nLanjutkan?')) return;
    Storage.clear();
    window.location.reload();
  },

  hapusData() {
    if (!confirm('Hapus SEMUA data Mode Hemat?\nAksi ini tidak bisa dibatalkan.')) return;
    if (!confirm('Yakin? Riwayat transaksi akan ikut terhapus.')) return;
    Storage.clear();
    window.location.reload();
  },
};

/* ============================================================
   QUICK LOG SETTINGS MODAL
============================================================ */

const QLSettings = {
  init() {
    document.getElementById('btn-ql-settings')?.addEventListener('click', QLSettings.open);
    document.getElementById('ql-settings-cancel')?.addEventListener('click', QLSettings.close);
    document.getElementById('ql-settings-save')?.addEventListener('click', QLSettings.save);
    document.getElementById('ql-settings-backdrop')?.addEventListener('click', e => {
      if (e.target === document.getElementById('ql-settings-backdrop')) QLSettings.close();
    });
  },

  open() {
    const grid = document.getElementById('ql-settings-grid');
    if (grid) {
      grid.innerHTML = Object.entries(QUICK_CATEGORIES_META).map(([key, meta]) => {
        const price = data.qlPrices?.[key] ?? DEFAULT_QL_PRICES[key];
        return `
          <div class="ql-setting-row">
            <span class="ql-setting-icon">${meta.icon}</span>
            <span class="ql-setting-label">${meta.label}</span>
            <input class="ql-setting-input" type="number"
              data-key="${key}" value="${price}" min="0" max="1000000"
              aria-label="Harga ${meta.label}" />
          </div>`;
      }).join('');
    }
    const backdrop = document.getElementById('ql-settings-backdrop');
    backdrop?.classList.remove('hidden');
    backdrop?.setAttribute('aria-hidden','false');
  },

  save() {
    if (!data.qlPrices) data.qlPrices = { ...DEFAULT_QL_PRICES };
    document.querySelectorAll('.ql-setting-input').forEach(input => {
      const key = input.dataset.key;
      const val = Math.max(0, Number(input.value) || 0);
      data.qlPrices[key] = val;
    });
    Storage.save(data);
    UI.renderQuickLog();
    QLSettings.close();
    UI.showToast('✅ Harga Quick Log disimpan!');
  },

  close() {
    const backdrop = document.getElementById('ql-settings-backdrop');
    backdrop?.classList.add('hidden');
    backdrop?.setAttribute('aria-hidden','true');
  },
};

/* ============================================================
   CUSTOM ACTIVITY (Tambah Aktivitas per Vibe)
============================================================ */

const CustomActivity = {
  init() {
    document.getElementById('btn-show-add-activity')?.addEventListener('click', () => {
      const form = document.getElementById('add-activity-form');
      form?.classList.toggle('hidden');
    });

    document.getElementById('btn-cancel-act')?.addEventListener('click', () => {
      document.getElementById('add-activity-form')?.classList.add('hidden');
      CustomActivity.clearForm();
    });

    document.getElementById('btn-save-act')?.addEventListener('click', CustomActivity.save);
  },

  save() {
    const name  = document.getElementById('act-name')?.value.trim() || '';
    const desc  = document.getElementById('act-desc')?.value.trim() || '';
    const price = Number(document.getElementById('act-price')?.value) || 0;
    const img   = document.getElementById('act-img')?.value.trim() || '';

    if (!name || name.length < 2) { UI.showToast('⚠️ Nama minimal 2 karakter.'); return; }
    if (!currentVibe)              { UI.showToast('⚠️ Pilih vibe dulu ya!'); return; }

    const act = {
      name, cat: 'custom', icon: '✨',
      price: Math.max(0, price),
      desc,
      imgUrl: img || undefined,
    };
    Data.addCustomActivity(currentVibe, act);
    UI.renderActivities(currentVibe);
    CustomActivity.clearForm();
    document.getElementById('add-activity-form')?.classList.add('hidden');
    UI.showToast('✨ Aktivitas tersimpan!');
  },

  clearForm() {
    ['act-name','act-desc','act-price','act-img'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  },
};

/* ============================================================
   SETTINGS MODAL
============================================================ */

const Settings = {
  init() {
    document.getElementById('btn-settings')?.addEventListener('click', Settings.open);
    document.getElementById('settings-close')?.addEventListener('click', Settings.close);
    document.getElementById('settings-backdrop')?.addEventListener('click', e => {
      if (e.target === document.getElementById('settings-backdrop')) Settings.close();
    });
  },

  open() {
    const infoEl = document.getElementById('settings-info');
    if (infoEl && data.mode) {
      const meta    = MODE_META[data.mode] || {};
      const created = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'})
        : '—';
      infoEl.innerHTML = `
        <strong>Mode:</strong> ${meta.icon || ''} ${meta.label || data.mode}<br>
        <strong>Budget Awal:</strong> ${Fmt.rupiah(data.totalBudget)}<br>
        <strong>Sisa:</strong> ${Fmt.rupiah(data.remainingBudget)}<br>
        <strong>Transaksi:</strong> ${data.transactions.length}<br>
        <strong>Tempat:</strong> ${data.places.length}<br>
        <strong>Mulai sejak:</strong> ${created}
      `;
    }
    const backdrop = document.getElementById('settings-backdrop');
    backdrop?.classList.remove('hidden');
    backdrop?.setAttribute('aria-hidden','false');
  },

  close() {
    const backdrop = document.getElementById('settings-backdrop');
    backdrop?.classList.add('hidden');
    backdrop?.setAttribute('aria-hidden','true');
  },
};

/* ============================================================
   MAIN APP
============================================================ */

const App = {
  init() {
    Sound.init();

    const stored = Storage.load();
    if (stored) {
      data = Data.migrate(stored);
      App.showDashboard();
    } else {
      App.showOnboarding();
      // Play welcome sound after short delay (needs user interaction first on some browsers)
      setTimeout(() => Sound.playWelcome(), 800);
    }

    Onboarding.init();
    Places.init();
    Profile.init();
    Settings.init();
    QLSettings.init();
    CustomActivity.init();
    App.initGlobalEvents();
  },

  showOnboarding() {
    document.getElementById('section-onboarding')?.classList.remove('hidden');
    ['section-dashboard','section-tempat','section-profil'].forEach(id =>
      document.getElementById(id)?.classList.add('hidden')
    );
    document.getElementById('bottom-nav')?.classList.add('hidden');
  },

  showDashboard() {
    document.getElementById('section-onboarding')?.classList.add('hidden');
    document.getElementById('bottom-nav')?.classList.remove('hidden');

    UI.applyModeTheme();
    UI.updateBudgetBar();
    UI.updateBudgetDisplay();
    UI.renderTodayTransactions();
    UI.renderQuickLog();

    Nav.goTo('section-dashboard');

    // Play welcome sound when returning to dashboard after initial setup
    // (will only fire on the first showDashboard after data creation)
  },

  initGlobalEvents() {
    // Bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => Nav.goTo(btn.dataset.target));
    });

    // Vibe buttons
    document.getElementById('vibe-grid')?.addEventListener('click', e => {
      const btn = e.target.closest('.vibe-btn');
      if (!btn) return;
      document.querySelectorAll('.vibe-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed','false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      Sound.playTap();
      UI.renderActivities(btn.dataset.vibe);
    });

    // Activity card "Pilih"
    document.getElementById('activity-cards')?.addEventListener('click', e => {
      const btn = e.target.closest('.btn-pilih');
      if (!btn || btn.disabled) return;
      Spending.prompt(Number(btn.dataset.amount)||0, btn.dataset.name||'Aktivitas', btn.dataset.icon||'✦', btn.dataset.cat||'other');
    });

    // Confirm modal
    document.getElementById('modal-confirm')?.addEventListener('click', () => {
      if (typeof pendingConfirmCallback === 'function') pendingConfirmCallback();
      UI.closeConfirmModal();
    });
    document.getElementById('modal-cancel')?.addEventListener('click', UI.closeConfirmModal);
    document.getElementById('modal-backdrop')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-backdrop')) UI.closeConfirmModal();
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      UI.closeConfirmModal();
      Settings.close();
      QLSettings.close();
    });
  },
};

/* ============================================================
   SECURITY
============================================================ */

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

/* ============================================================
   BOOT
============================================================ */

document.addEventListener('DOMContentLoaded', App.init);
