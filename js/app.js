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

/* ── FAQ accordion ──────────────────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

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
