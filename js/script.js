/* ═══════════════════════════════════════════════════
   INKED STUDIOS — script.js
   Runs on every page. Each feature checks whether
   its required elements exist before executing.
═══════════════════════════════════════════════════ */

/* ── NAV SCROLL EFFECT ── */
const mainNav = document.getElementById('mainNav');
if (mainNav) {
  window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── HAMBURGER / FULLSCREEN MENU ── */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const fullMenu     = document.getElementById('fullMenu');
const menuClose    = document.getElementById('menuClose');

function closeMenu() {
  hamburgerBtn && hamburgerBtn.classList.remove('open');
  fullMenu     && fullMenu.classList.remove('open');
}
hamburgerBtn && hamburgerBtn.addEventListener('click', () => {
  hamburgerBtn.classList.toggle('open');
  fullMenu.classList.toggle('open');
});
menuClose && menuClose.addEventListener('click', closeMenu);

/* highlight current page link in fullscreen menu */
if (fullMenu) {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  fullMenu.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      a.classList.add('current');
    }
  });
}

/* ── FADE-UP ON SCROLL ── */
function initFadeUps() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}
document.addEventListener('DOMContentLoaded', initFadeUps);

/* ── DIGITAL COUNTERS (index.html / home) ── */
let countersTriggered = false;
const s4 = document.getElementById('s4');
if (s4) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !countersTriggered) {
        countersTriggered = true;
        document.querySelectorAll('.counter-num[data-target]').forEach(el => {
          const target   = parseFloat(el.dataset.target);
          const decimals = parseInt(el.dataset.decimal) || 0;
          const duration = 2200;
          const t0 = performance.now();
          function tick(now) {
            const p = Math.min((now - t0) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            el.textContent = decimals > 0 ? (e * target).toFixed(decimals) : Math.floor(e * target).toString();
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toString();
          }
          requestAnimationFrame(tick);
        });
      }
    });
  }, { threshold: 0.3 }).observe(s4);
}

/* ── REVIEWS CAROUSEL (index.html) ── */
const revSlider = document.getElementById('reviewsSlider');
if (revSlider) {
  const revTiles    = revSlider.querySelectorAll('.review-tile');
  const totalSlides = revTiles.length;
  let revIdx = 0;

  const visibleCount = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;

  function buildDots() {
    const dotsEl = document.getElementById('sliderDots');
    if (!dotsEl) return;
    const pages = Math.ceil(totalSlides / visibleCount());
    dotsEl.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('div');
      d.className = 'slider-dot' + (i === 0 ? ' active' : '');
      d.onclick = () => goTo(i);
      dotsEl.appendChild(d);
    }
  }

  function goTo(idx) {
    const vc     = visibleCount();
    const maxIdx = Math.ceil(totalSlides / vc) - 1;
    revIdx = Math.max(0, Math.min(idx, maxIdx));
    const tileW = revTiles[0].offsetWidth + 24;
    revSlider.style.transform = `translateX(-${revIdx * tileW * vc}px)`;
    document.querySelectorAll('.slider-dot').forEach((d, i) =>
      d.classList.toggle('active', i === revIdx));
  }

  document.getElementById('revPrev') &&
    document.getElementById('revPrev').addEventListener('click', () => goTo(revIdx - 1));
  document.getElementById('revNext') &&
    document.getElementById('revNext').addEventListener('click', () => goTo(revIdx + 1));

  window.addEventListener('resize', () => { buildDots(); goTo(0); });
  buildDots();
}

/* ── WORK FILTER (work.html) ── */
function filterWork(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.work-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'block' : 'none';
  });
}

/* ── PACKAGE BUILDER (pricing.html) ── */
let selectedItems = {};

function toggleOption(el) {
  el.classList.toggle('selected');
  const name  = el.dataset.name;
  const price = parseInt(el.dataset.price);
  if (el.classList.contains('selected')) selectedItems[name] = price;
  else delete selectedItems[name];
  updateSummary();
}

function updateSummary() {
  const container = document.getElementById('summaryItems');
  const totalEl   = document.getElementById('summaryTotal');
  const btn       = document.getElementById('quoteBtn');
  const keys      = Object.keys(selectedItems);

  if (!keys.length) {
    if (container) container.innerHTML = '<div class="sum-empty">Select services on the left to build your package.</div>';
    if (totalEl)   totalEl.textContent = 'R0';
    if (btn) { btn.disabled = true; btn.style.opacity = '.5'; btn.style.cursor = 'not-allowed'; }
    return;
  }
  let total = 0;
  if (container) {
    container.innerHTML = keys.map(k => {
      total += selectedItems[k];
      return `<div class="sum-item"><span>${k}</span><span>R${selectedItems[k].toLocaleString()}</span></div>`;
    }).join('');
  }
  if (totalEl) totalEl.textContent = 'R' + total.toLocaleString();
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
}

function requestQuote() {
  const items = Object.keys(selectedItems).join(', ');
  const total = Object.values(selectedItems).reduce((a, b) => a + b, 0);
  window.location.href =
    `contact.html?ref=builder&services=${encodeURIComponent(items)}&total=${total}`;
}

/* Pre-fill contact textarea if arriving from builder */
window.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('contactTextarea');
  if (ta) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref') === 'builder') {
      ta.value = `Package Builder Request:\n${params.get('services')}\nEstimated Total: R${parseInt(params.get('total')).toLocaleString()}\n\nPlease confirm availability and finalise my quote.`;
    }
  }
});

/* ── CONTACT FORM ── */
function submitForm(btn) {
  const orig = btn.textContent;
  btn.textContent = 'Sending…'; btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Message Sent!';
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
  }, 1400);
}