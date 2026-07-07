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
});
