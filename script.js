'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Scrolled nav ──────────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav ────────────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const drawer    = document.querySelector('.nav-drawer');
  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ── Active nav link ───────────────────────────────────────── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* ── Fade-in on scroll ─────────────────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io.observe(el));
  }

  /* ── Count-up stats ────────────────────────────────────────── */
  const statEls = document.querySelectorAll('.stat-value[data-target]');
  if (statEls.length) {
    const countUp = (el) => {
      const target   = parseFloat(el.dataset.target);
      const prefix   = el.dataset.prefix || '';
      const suffix   = el.dataset.suffix || '';
      const steps    = 50;
      const interval = 1400 / steps;
      let   current  = 0;
      const inc      = target / steps;
      const timer    = setInterval(() => {
        current = Math.min(current + inc, target);
        el.textContent = prefix + Math.round(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, interval);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    statEls.forEach(el => io.observe(el));
  }

  /* ── Hero scroll indicator ─────────────────────────────────── */
  const scrollBtn = document.querySelector('.hero-scroll');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const next = document.querySelector('.pillars') ||
                   document.querySelector('main > *:nth-child(2)');
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    });
    window.addEventListener('scroll', () => {
      scrollBtn.style.opacity = window.scrollY > 80 ? '0' : '';
    }, { passive: true });
  }

  /* ── Gallery filter ────────────────────────────────────────── */
  const catBtns  = document.querySelectorAll('.gallery-cat-btn');
  const galItems = document.querySelectorAll('.gallery-item');
  if (catBtns.length) {
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        galItems.forEach(item => {
          const match = cat === 'all' || item.dataset.cat === cat;
          item.style.opacity       = match ? '1' : '0.15';
          item.style.pointerEvents = match ? '' : 'none';
        });
      });
    });
  }

  /* ── FAQ accordion ─────────────────────────────────────────── */
  const faqBtns = document.querySelectorAll('.faq-question');
  if (faqBtns.length) {
    faqBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const item   = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        // close all
        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          i.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
        });
        // open this one if it was closed
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          item.querySelector('.faq-answer').setAttribute('aria-hidden', 'false');
        }
      });
    });
  }

  /* ── Private bookings form ─────────────────────────────────── */
  const form    = document.querySelector('.pdq-form');
  const success = document.querySelector('.form-success');
  if (form && success) {
    const showError = (input, msg) => {
      input.classList.add('error');
      let err = input.parentElement.querySelector('.form-error-msg');
      if (!err) { err = document.createElement('span'); err.className = 'form-error-msg'; input.after(err); }
      err.textContent = msg;
      err.classList.add('show');
    };
    const clearError = (input) => {
      input.classList.remove('error');
      const err = input.parentElement.querySelector('.form-error-msg');
      if (err) err.classList.remove('show');
    };
    const validate = (field) => {
      if (!field.required && !field.value) { clearError(field); return true; }
      if (field.required && !field.value.trim()) { showError(field, 'This field is required.'); return false; }
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        showError(field, 'Please enter a valid email address.'); return false;
      }
      if (field.type === 'number') {
        const v = parseInt(field.value, 10), min = parseInt(field.min, 10), max = parseInt(field.max, 10);
        if (isNaN(v) || v < min) { showError(field, `Minimum ${min} guests required.`); return false; }
        if (max && v > max)      { showError(field, `Maximum capacity is ${max} guests.`); return false; }
      }
      clearError(field); return true;
    };
    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('blur',  () => validate(f));
      f.addEventListener('input', () => { if (f.classList.contains('error')) validate(f); });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const allValid = Array.from(form.querySelectorAll('input, select, textarea')).map(validate).every(Boolean);
      if (!allValid) { const first = form.querySelector('.error'); if (first) first.focus(); return; }
      form.style.display = 'none';
      success.classList.add('show');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

});
