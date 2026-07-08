/* ============================================
   The Missouri Barber Company — Scripts
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* --- Helper: debounce --- */
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /* ==========================================
     Hero loader class
     ========================================== */
  const hero = document.getElementById('hero');
  if (hero) {
    // Small delay to allow the bg image to start loading, then fade in
    setTimeout(() => hero.classList.add('loaded'), 100);
  }

  /* ==========================================
     Mobile Navigation
     ========================================== */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__link');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpen);
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });

    // Close menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        navToggle.focus();
      }
    });
  }

  /* ==========================================
     Header scroll effect
     ========================================== */
  const header = document.getElementById('header');

  const handleScroll = debounce(() => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, 10);

  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ==========================================
     Smooth scroll for anchor links
     ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ==========================================
     Scroll-triggered fade-in animations
     ========================================== */
  const animateElements = () => {
    const elements = document.querySelectorAll(
      '.service-card, .barber-card, .about__feature, .stat, .contact__card'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  };

  animateElements();

  /* ==========================================
     Counter animation for stats
     ========================================== */
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const isDecimal = target % 1 !== 0;
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isDecimal) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = Math.round(current) + '+';
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : Math.round(target) + '+';
      }
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target.querySelector('.stat__number');
          if (counter && !counter.dataset.counted) {
            counter.dataset.counted = 'true';
            animateCounter(counter);
          }
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.stat').forEach(stat => {
    counterObserver.observe(stat);
  });

  /* ==========================================
     Form validation
     ========================================== */
  const form = document.getElementById('contactForm');
  if (form) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    const showError = (input, message) => {
      const error = input.parentElement.querySelector('.form__error');
      input.classList.add('error');
      if (error) error.textContent = message;
    };

    const clearError = (input) => {
      const error = input.parentElement.querySelector('.form__error');
      input.classList.remove('error');
      if (error) error.textContent = '';
    };

    const validateName = () => {
      if (!nameInput.value.trim()) {
        showError(nameInput, 'Please enter your name.');
        return false;
      }
      if (nameInput.value.trim().length < 2) {
        showError(nameInput, 'Name must be at least 2 characters.');
        return false;
      }
      clearError(nameInput);
      return true;
    };

    const validateEmail = () => {
      const val = emailInput.value.trim();
      if (!val) {
        showError(emailInput, 'Please enter your email address.');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showError(emailInput, 'Please enter a valid email address.');
        return false;
      }
      clearError(emailInput);
      return true;
    };

    const validatePhone = () => {
      const val = phoneInput.value.trim();
      if (!val) {
        showError(phoneInput, 'Please enter your phone number.');
        return false;
      }
      // Accept various formats: (660) 555-0123, 660-555-0123, 6605550123
      const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
      if (!/^\d{10,11}$/.test(cleaned)) {
        showError(phoneInput, 'Please enter a valid 10-digit phone number.');
        return false;
      }
      clearError(phoneInput);
      return true;
    };

    // Real-time validation on blur
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    phoneInput.addEventListener('blur', validatePhone);

    // Clear errors on focus
    [nameInput, emailInput, phoneInput].forEach(input => {
      input.addEventListener('focus', () => clearError(input));
    });

    const showToast = (message, type = 'success') => {
      // Remove existing toast
      const existing = document.querySelector('.toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.textContent = message;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      // Auto remove
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isPhoneValid = validatePhone();

      if (isNameValid && isEmailValid && isPhoneValid) {
        // Simulate submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending…';
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          form.reset();
          // Clear any lingering errors
          form.querySelectorAll('.form__error').forEach(el => el.textContent = '');
          form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
          showToast('Thanks! We\'ll be in touch within a few hours.', 'success');
        }, 1200);
      } else {
        showToast('Please fix the highlighted fields.', 'error');
        // Focus the first error
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
      }
    });
  }

  /* ==========================================
     Back to Top button
     ========================================== */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const toggleBackToTop = debounce(() => {
      if (window.scrollY > 600) {
        backToTop.setAttribute('aria-hidden', 'false');
        backToTop.classList.add('visible');
      } else {
        backToTop.setAttribute('aria-hidden', 'true');
        backToTop.classList.remove('visible');
      }
    }, 100);

    window.addEventListener('scroll', toggleBackToTop, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================
     Active nav link highlighting
     ========================================== */
  const setActiveNav = debounce(() => {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--color-accent)';
      }
    });
  }, 80);

  window.addEventListener('scroll', setActiveNav, { passive: true });

  /* ==========================================
     Booking Modal
     ========================================== */

  // --- Data ---
  const SERVICES = [
    { name: 'Classic Haircuts', duration: '30 min', price: 'From $20', icon: 'fa-cut', priceVal: 20, durVal: 30 },
    { name: 'Beard Trim', duration: '15 min', price: 'From $12', icon: 'fa-user-tie', priceVal: 12, durVal: 15 },
    { name: 'Haircut & Beard Trim', duration: '30 min', price: 'From $27', icon: 'fa-hot-tub', priceVal: 27, durVal: 30 },
    { name: 'Shave', duration: '30 min', price: 'From $20', icon: 'fa-child', priceVal: 20, durVal: 30 },
    { name: 'Haircut & Shave', duration: '45 min', price: 'From $34', icon: 'fa-magic', priceVal: 34, durVal: 45 },
    { name: 'Wax', duration: '15 min', price: 'From $12', icon: 'fa-gem', priceVal: 12, durVal: 15 },
  ];

  const BARBERS = [
    { name: 'Stephanie', role: 'Barber' },
    { name: 'Josh', role: 'Barber' },
    { name: 'Jason', role: 'Barber' },
    { name: 'Rory', role: 'Barber' },
  ];

  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // --- Booking state ---
  const state = {
    step: 1,
    serviceIdxs: [],   // array of selected service indices (multi-select)
    barberIdx: null,
    dateIdx: null,
    time: null,
  };

  // --- DOM refs ---
  const overlay = document.getElementById('bookingModal');
  const modalEl = overlay?.querySelector('.modal');
  const modalBody = overlay?.querySelector('.modal__body');
  const backBtn = document.getElementById('modalBack');
  const closeBtn = document.getElementById('modalClose');
  const stepIndicators = overlay?.querySelectorAll('.modal__step-indicator');
  const panels = overlay?.querySelectorAll('.modal__panel');
  const servicesContainer = document.getElementById('modalServices');
  const barbersContainer = document.getElementById('modalBarbers');
  const dateStripEl = document.getElementById('dateStrip');
  const timeSlotsEl = document.getElementById('timeSlots');
  const bookingForm = document.getElementById('bookingForm');
  const confirmClose = document.getElementById('modalConfirmClose');
  const summaryEl = document.getElementById('bookingSummary');
  const totalBar = document.getElementById('modalTotalBar');
  const totalText = document.getElementById('modalTotalText');
  const continueBtn = document.getElementById('modalStep1Continue');

  // Bail if modal doesn't exist
  if (!overlay) return;

  // --- Helpers ---
  function getBusinessHours(date) {
    const day = date.getDay();
    if (day === 0) return null;
    return day === 6 ? { open: 9, close: 17 } : { open: 9, close: 19 };
  }

  function isSameDay(a, b) {
    return a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();
  }

  function getNext10Days() {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }

  let generatedDates = [];

  function generateTimeSlots(date) {
    const hours = getBusinessHours(date);
    if (!hours) return [];
    const now = new Date();
    const slots = [];
    for (let h = hours.open; h < hours.close; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (isSameDay(date, now) && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()))) {
          continue;
        }
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        const minStr = m === 0 ? '00' : String(m);
        slots.push(`${hour12}:${minStr} ${ampm}`);
      }
    }
    return slots;
  }

  // --- Focus trap ---
  let focusCleanup = null;

  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'button:not([disabled]):not([tabindex^="-"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex^="-"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first.focus();

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }

  // --- Render: Step 1 — Services (multi-select) ---
  function renderServices() {
    if (!servicesContainer) return;

    const selected = state.serviceIdxs;
    servicesContainer.innerHTML = SERVICES.map((s, i) => {
      const isSel = selected.includes(i);
      return (
        `<button class="modal__option-card${isSel ? ' selected' : ''}" data-idx="${i}" type="button">
          <span class="modal__option-checkbox" aria-hidden="true">
            <i class="fas ${isSel ? 'fa-check-square' : 'fa-square'}"></i>
          </span>
          <div class="modal__option-icon" aria-hidden="true"><i class="fas ${s.icon}"></i></div>
          <div class="modal__option-info">
            <span class="modal__option-name">${s.name}</span>
            <span class="modal__option-duration">${s.duration}</span>
          </div>
          <span class="modal__option-price">${s.price}</span>
        </button>`
      );
    }).join('');

    servicesContainer.querySelectorAll('.modal__option-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const pos = state.serviceIdxs.indexOf(idx);
        if (pos === -1) {
          state.serviceIdxs.push(idx);
        } else {
          state.serviceIdxs.splice(pos, 1);
        }
        renderServices();
        updateTotalBar();
      });
    });
  }

  // --- Running total update ---
  function updateTotalBar() {
    if (!totalText || !totalBar) return;
    const count = state.serviceIdxs.length;

    if (count === 0) {
      totalText.textContent = 'No services selected';
      totalBar.classList.remove('total-active');
      if (continueBtn) continueBtn.disabled = true;
      return;
    }

    let totalPrice = 0;
    let totalDur = 0;
    state.serviceIdxs.forEach(idx => {
      const s = SERVICES[idx];
      totalPrice += s.priceVal;
      totalDur += s.durVal;
    });

    totalBar.classList.add('total-active');
    const label = count === 1 ? 'service' : 'services';
    totalText.textContent = `${count} ${label} selected — $${totalPrice}, ${totalDur} min`;
    if (continueBtn) continueBtn.disabled = false;
  }

  // --- Render: Step 2 — Barbers (single-select) ---
  function renderBarbers() {
    if (!barbersContainer) return;

    const barberIdx = state.barberIdx;

    const noPref =
      `<button class="modal__option-card modal__option-card--no-pref${barberIdx === -1 ? ' selected' : ''}" data-idx="-1" type="button">
        <div class="modal__option-icon" aria-hidden="true"><i class="fas fa-user-friends"></i></div>
        <div class="modal__option-info">
          <span class="modal__option-name">No preference</span>
          <span class="modal__option-duration">Maximum availability</span>
        </div>
        ${barberIdx === -1 ? '<span class="modal__option-check"><i class="fas fa-check-circle"></i></span>' : ''}
      </button>`;

    const cards = BARBERS.map((b, i) =>
      `<button class="modal__option-card${barberIdx === i ? ' selected' : ''}" data-idx="${i}" type="button">
        <div class="modal__option-icon modal__option-icon--barber" aria-hidden="true"><i class="fas fa-user"></i></div>
        <div class="modal__option-info">
          <span class="modal__option-name">${b.name}</span>
          <span class="modal__option-role">${b.role}</span>
        </div>
        ${barberIdx === i ? '<span class="modal__option-check"><i class="fas fa-check-circle"></i></span>' : ''}
      </button>`
    ).join('');

    barbersContainer.innerHTML = noPref + cards;

    barbersContainer.querySelectorAll('.modal__option-card').forEach(btn => {
      btn.addEventListener('click', () => {
        state.barberIdx = parseInt(btn.dataset.idx);
        renderBarbers();
        setTimeout(() => goToStep(3), 300);
      });
    });
  }

  // --- Render: Step 3 — Date & Time ---
  function renderDates() {
    if (!dateStripEl) return;
    generatedDates = getNext10Days();

    if (state.dateIdx === null && generatedDates.length) {
      state.dateIdx = 0;
    }

    const today = new Date();
    dateStripEl.innerHTML = generatedDates.map((d, i) => {
      const isToday = isSameDay(d, today);
      return (
        `<button class="date-strip__item${state.dateIdx === i ? ' selected' : ''}${isToday ? ' date-strip__item--today' : ''}" data-idx="${i}" type="button">
          <span class="date-strip__day">${DAYS_SHORT[d.getDay()]}</span>
          <span class="date-strip__num">${d.getDate()}</span>
        </button>`
      );
    }).join('');

    dateStripEl.querySelectorAll('.date-strip__item').forEach(btn => {
      btn.addEventListener('click', () => {
        state.dateIdx = parseInt(btn.dataset.idx);
        state.time = null;
        renderDates();
        renderTimes(generatedDates[state.dateIdx]);
      });
    });

    if (state.dateIdx !== null && generatedDates[state.dateIdx]) {
      renderTimes(generatedDates[state.dateIdx]);
    }
  }

  function renderTimes(date) {
    if (!timeSlotsEl) return;
    const slots = generateTimeSlots(date);

    if (!slots.length) {
      timeSlotsEl.innerHTML = '<p class="time-slots__closed">We&#8217;re closed on Sundays. Please select another day.</p>';
      return;
    }

    timeSlotsEl.innerHTML = slots.map(s =>
      `<button class="time-slot${state.time === s ? ' selected' : ''}" data-time="${s.replace(/'/g, "\\'")}" type="button">${s}</button>`
    ).join('');

    timeSlotsEl.querySelectorAll('.time-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        state.time = btn.dataset.time;
        timeSlotsEl.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
        setTimeout(() => goToStep(4), 300);
      });
    });
  }

  // --- Summary on Step 4 ---
  function updateSummary() {
    if (!summaryEl) return;

    const items = [];

    // Show all selected services
    if (state.serviceIdxs.length) {
      const names = state.serviceIdxs.map(i => SERVICES[i].name).join(', ');
      const totalPrice = state.serviceIdxs.reduce((sum, i) => sum + SERVICES[i].priceVal, 0);
      items.push(`<div class="modal__summary-item"><span class="modal__summary-label">Services</span><span class="modal__summary-value">${names}</span></div>`);
      items.push(`<div class="modal__summary-item"><span class="modal__summary-label">Est. total</span><span class="modal__summary-value">From $${totalPrice}</span></div>`);
    }

    const barber = state.barberIdx === -1
      ? { name: 'No preference' }
      : (state.barberIdx !== null ? BARBERS[state.barberIdx] : null);
    if (barber) items.push(`<div class="modal__summary-item"><span class="modal__summary-label">Barber</span><span class="modal__summary-value">${barber.name}</span></div>`);

    const date = state.dateIdx !== null && generatedDates[state.dateIdx] ? generatedDates[state.dateIdx] : null;
    if (date) items.push(`<div class="modal__summary-item"><span class="modal__summary-label">Date</span><span class="modal__summary-value">${DAYS_SHORT[date.getDay()]} ${date.getDate()}</span></div>`);
    if (state.time) items.push(`<div class="modal__summary-item"><span class="modal__summary-label">Time</span><span class="modal__summary-value">${state.time}</span></div>`);

    summaryEl.innerHTML = items.join('');
  }

  // --- Step navigation ---
  function goToStep(n) {
    state.step = n;

    panels.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`modalStep${n}`);
    if (target) target.classList.add('active');

    stepIndicators.forEach(ind => {
      ind.classList.remove('active', 'completed');
      const stepNum = parseInt(ind.dataset.step);
      if (stepNum === n) ind.classList.add('active');
      else if (stepNum < n) ind.classList.add('completed');
    });

    backBtn.classList.toggle('is-hidden', n === 1);

    if (modalBody) modalBody.scrollTop = 0;

    if (n === 4) updateSummary();

    if (overlay.classList.contains('open') && modalEl) {
      if (focusCleanup) focusCleanup();
      focusCleanup = trapFocus(modalEl);
    }
  }

  // --- Modal open / close ---
  let lastFocused = null;

  function openBookingModal() {
    lastFocused = document.activeElement;

    // Close mobile nav if open
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
    }

    // Reset state
    state.step = 1;
    state.serviceIdxs = [];
    state.barberIdx = null;
    state.dateIdx = null;
    state.time = null;

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    renderServices();
    updateTotalBar();
    renderBarbers();
    renderDates();
    goToStep(1);

    if (modalEl) {
      if (focusCleanup) focusCleanup();
      focusCleanup = trapFocus(modalEl);
    }
  }

  function closeBookingModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (focusCleanup) {
      focusCleanup();
      focusCleanup = null;
    }

    if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  }

  // --- Event listeners ---
  closeBtn.addEventListener('click', closeBookingModal);

  backBtn.addEventListener('click', () => {
    if (state.step > 1) goToStep(state.step - 1);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeBookingModal();
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBookingModal();
  });

  confirmClose.addEventListener('click', closeBookingModal);

  // Open modal triggers
  document.querySelectorAll('[data-open-modal]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal();
    });
  });

  // Step 1 Continue button
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (state.serviceIdxs.length > 0) goToStep(2);
    });
  }

  // --- Booking form submit (Step 4) ---
  if (bookingForm) {
    const nameInput = document.getElementById('bookName');
    const emailInput = document.getElementById('bookEmail');
    const phoneInput = document.getElementById('bookPhone');

    const showError = (input, msg) => {
      const err = input.parentElement.querySelector('.form__error');
      input.classList.add('error');
      if (err) err.textContent = msg;
    };

    const clearError = (input) => {
      const err = input.parentElement.querySelector('.form__error');
      input.classList.remove('error');
      if (err) err.textContent = '';
    };

    const validateName = () => {
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        showError(nameInput, 'Please enter your name.');
        return false;
      }
      clearError(nameInput);
      return true;
    };

    const validateEmail = () => {
      const val = emailInput.value.trim();
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showError(emailInput, 'Please enter a valid email.');
        return false;
      }
      clearError(emailInput);
      return true;
    };

    const validatePhone = () => {
      const val = phoneInput.value.trim();
      const cleaned = val.replace(/[\s\-\(\)\.]/g, '');
      if (!val || !/^\d{10,11}$/.test(cleaned)) {
        showError(phoneInput, 'Please enter a valid phone number.');
        return false;
      }
      clearError(phoneInput);
      return true;
    };

    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    phoneInput.addEventListener('blur', validatePhone);
    [nameInput, emailInput, phoneInput].forEach(inp => {
      inp.addEventListener('focus', () => clearError(inp));
    });

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const valid = validateName() & validateEmail() & validatePhone();
      if (!valid) {
        const firstErr = bookingForm.querySelector('.error');
        if (firstErr) firstErr.focus();
        return;
      }

      // Simulate submission then show confirmation
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const origHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending&#8230;';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = origHTML;
        submitBtn.disabled = false;

        panels.forEach(p => p.classList.remove('active'));
        const confirmPanel = document.getElementById('modalConfirm');
        if (confirmPanel) {
          confirmPanel.classList.add('active');
          stepIndicators.forEach(ind => ind.classList.add('completed'));
          modalBody.scrollTop = 0;
          if (focusCleanup) focusCleanup();
          focusCleanup = trapFocus(modalEl);
        }
      }, 1000);
    });
  }
});
