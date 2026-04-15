/* ─────────────────────────────────────────────────────────────
   LCERMF — app.js
   ───────────────────────────────────────────────────────────── */

/* ── Nav scroll behaviour ───────────────────────────────────── */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Hero image pan on load ─────────────────────────────────── */
window.addEventListener('load', () => {
  document.getElementById('hero').classList.add('loaded');
});

/* ── Mobile menu ─────────────────────────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-close');

hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
mobileClose.addEventListener('click', closeMobileMenu);

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
}

/* ── Sticky mobile donate bar ───────────────────────────────── */
const stickyBar  = document.getElementById('sticky-donate');
const heroEl     = document.getElementById('hero');

window.addEventListener('scroll', () => {
  const heroBtm = heroEl.getBoundingClientRect().bottom;
  stickyBar.classList.toggle('visible', heroBtm < 0);
}, { passive: true });

/* ── Scroll reveal ───────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Donation widget ─────────────────────────────────────────── */

/*
 * ─── STRIPE SETUP ────────────────────────────────────────────────────────────
 * You only need to create 2 Payment Links in your Stripe dashboard:
 *
 *   1. Go to https://dashboard.stripe.com/payment-links → "New"
 *   2. ONE-TIME link:  Add a product → enable "Let customer choose price" → Save
 *   3. MONTHLY link:   Same, but set Billing Period → Monthly under Pricing
 *   4. Paste each https://buy.stripe.com/... URL below
 *
 * Preset amounts ($10, $25, $50, $100) will pre-fill automatically in checkout.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const STRIPE_LINKS = {
  once: {
    10:     'https://donate.stripe.com/14AeVf64k6K7adEa5s9ws0a',
    25:     'https://donate.stripe.com/eVq14p0K01pN3Pg6Tg9ws0c',
    50:     'https://donate.stripe.com/dRm14pgIY9WjetUa5s9ws0e',
    100:    'https://donate.stripe.com/4gM28t3Wc5G33Pg3H49ws0g',
    250:    'https://donate.stripe.com/00w3cxfEUgkHgC2gtQ9ws0k',
    500:    'https://donate.stripe.com/3cIaEZcsIgkH0D4gtQ9ws0m',
    1000:   'https://donate.stripe.com/cNi7sN0K0d8vfxYfpM9ws0o',
    custom: 'https://donate.stripe.com/28EaEZ9gw8Sf5Xo4L89ws0i'
  },
  monthly: {
    10:     'https://donate.stripe.com/14AeVf1O45G33PgdhE9ws0b',
    25:     'https://donate.stripe.com/00w8wR2S83xV5Xo6Tg9ws0d',
    50:     'https://donate.stripe.com/14AdRbgIYc4rdpQcdA9ws0f',
    100:    'https://donate.stripe.com/28E3cx50g6K71H8elI9ws0h',
    250:    'https://donate.stripe.com/00w14p1O47ObfxYcdA9ws0l',
    500:    'https://donate.stripe.com/28E3cx3Wc7ObetU2D09ws0n',
    1000:   'https://donate.stripe.com/bJe28tcsIgkHclM5Pc9ws0p',
    custom: 'https://donate.stripe.com/7sY14pcsIc4r99AcdA9ws0j'
  }
};

let donationType = 'once';

/* Toggle between one-time and monthly */
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    donationType = btn.dataset.type;
  });
});

const amountBtns    = document.querySelectorAll('.amount-btn');
const customWrap    = document.getElementById('custom-wrap');
const customInput   = document.getElementById('custom-amount');
const impactText    = document.getElementById('impact-text');
const donateAction  = document.getElementById('donate-action');
const impactIcons   = { 10: '📚', 25: '🦟', 50: '📖', 100: '🎓', 250: '🎓', 500: '🏫', 1000: '🌟' };

let selectedAmount = 25;
let isCustomAmount = false;

/* Show custom input always */
customWrap.classList.add('show');

function updateDonateBtn(amount) {
  donateAction.textContent = `Donate $${amount} Now`;
}

function updateImpact(btn) {
  const impact = btn.dataset.impact;
  const amount = btn.dataset.amount;
  if (impact) {
    impactText.textContent = impact;
    const icon = impactIcons[amount] || '💚';
    btn.closest('.donation-widget').querySelector('.impact-icon').textContent = icon;
  }
}

amountBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    amountBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    isCustomAmount = false;
    customInput.value = '';
    selectedAmount = parseInt(btn.dataset.amount, 10);
    updateDonateBtn(selectedAmount);
    updateImpact(btn);
  });
});

customInput.addEventListener('input', () => {
  const val = parseFloat(customInput.value);
  if (val > 0) {
    isCustomAmount = true;
    selectedAmount = val;
    amountBtns.forEach(b => b.classList.remove('active'));
    updateDonateBtn(val);
    impactText.textContent = 'Your gift goes directly to scholarships and malaria prevention.';
    document.querySelector('.impact-icon').textContent = '💚';
  } else {
    isCustomAmount = false;
    // restore default $25 selection
    const defaultBtn = document.querySelector('[data-amount="25"]');
    if (defaultBtn) { defaultBtn.classList.add('active'); selectedAmount = 25; updateDonateBtn(25); updateImpact(defaultBtn); }
  }
});

/* Open Stripe Payment Link on donate button click */
donateAction.addEventListener('click', () => {
  const links = STRIPE_LINKS[donationType];
  const url = isCustomAmount ? links.custom : links[selectedAmount];
  window.open(url, '_blank', 'noopener,noreferrer');
});

/* ── FAQ accordion ──────────────────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Malaria stat counters ───────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('.malaria-stat-number[data-target]');
  if (!counters.length) return;

  const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start   = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(ease(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => observer.observe(el));
})();

/* ── Scholars — encouragement message wall ───────────────────── */
(function () {
  const form        = document.getElementById('message-form');
  const wall        = document.getElementById('messages-wall');
  const STORAGE_KEY = 'lcermf_messages';

  function renderMessage({ name, text }) {
    const card = document.createElement('div');
    card.className = 'message-card';
    const safeName = (name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    card.innerHTML = `<p class="message-text">&ldquo;${safeText}&rdquo;</p>
      <span class="message-author">&mdash; ${safeName || 'Anonymous Supporter'}</span>`;
    wall.prepend(card);
  }

  function loadMessages() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.forEach(m => renderMessage(m));
  }

  if (form && wall) {
    loadMessages();

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('msg-name').value.trim();
      const text = document.getElementById('msg-text').value.trim();
      if (!text) return;

      const msg   = { name, text };
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      saved.unshift(msg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.slice(0, 30)));

      renderMessage(msg);
      form.reset();

      const btn = form.querySelector('button');
      const orig = btn.textContent;
      btn.textContent = '✓ Thank you!';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2600);
    });
  }
})();

/* ── Smooth anchor scroll (with nav offset) ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = nav.offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
