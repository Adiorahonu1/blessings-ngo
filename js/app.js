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
 * Replace each placeholder URL with your real Stripe Payment Link.
 * How to create them:
 *   1. Go to https://dashboard.stripe.com/payment-links → click "New"
 *   2. For ONE-TIME links: set a fixed price (e.g. $25), name it "Donation – $25"
 *   3. For MONTHLY links: set the same price but choose "Recurring" → Monthly
 *   4. For CUSTOM links: enable "Let customer decide" price
 *   5. Copy the generated https://buy.stripe.com/... URL and paste below
 * ─────────────────────────────────────────────────────────────────────────────
 */
const STRIPE_LINKS = {
  once: {
    10:     'https://buy.stripe.com/REPLACE_ONCE_10',
    25:     'https://buy.stripe.com/REPLACE_ONCE_25',
    50:     'https://buy.stripe.com/REPLACE_ONCE_50',
    100:    'https://buy.stripe.com/REPLACE_ONCE_100',
    custom: 'https://buy.stripe.com/REPLACE_ONCE_CUSTOM'
  },
  monthly: {
    10:     'https://buy.stripe.com/REPLACE_MONTHLY_10',
    25:     'https://buy.stripe.com/REPLACE_MONTHLY_25',
    50:     'https://buy.stripe.com/REPLACE_MONTHLY_50',
    100:    'https://buy.stripe.com/REPLACE_MONTHLY_100',
    custom: 'https://buy.stripe.com/REPLACE_MONTHLY_CUSTOM'
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
const impactIcons   = { 10: '📚', 25: '🦟', 50: '📖', 100: '🎓' };

let selectedAmount = 25;

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

    if (btn.dataset.amount === 'other') {
      customWrap.classList.add('show');
      customInput.focus();
      const val = parseInt(customInput.value, 10);
      if (val > 0) {
        selectedAmount = val;
        updateDonateBtn(val);
      } else {
        donateAction.textContent = 'Donate Now';
      }
      impactText.textContent = 'Your gift goes directly to scholarships and malaria prevention.';
      btn.closest('.donation-widget').querySelector('.impact-icon').textContent = '💚';
    } else {
      customWrap.classList.remove('show');
      selectedAmount = parseInt(btn.dataset.amount, 10);
      updateDonateBtn(selectedAmount);
      updateImpact(btn);
    }
  });
});

customInput.addEventListener('input', () => {
  const val = parseInt(customInput.value, 10);
  if (val > 0) {
    selectedAmount = val;
    updateDonateBtn(val);
  } else {
    donateAction.textContent = 'Donate Now';
  }
});

/* Open Stripe Payment Link on donate button click */
donateAction.addEventListener('click', () => {
  const links = STRIPE_LINKS[donationType];
  const url   = links[selectedAmount] || links.custom;
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
