/* ==========================================================================
   SUMIT KUMAR — Portfolio interactions
   Organized as small, independent modules — each owns one behaviour.
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------- Mobile menu ---------------------------------- */
  const MobileMenu = (() => {
    const toggle = document.getElementById('menuToggle');
    const panel = document.getElementById('mobilePanel');
    if (!toggle || !panel) return;

    function close() {
      panel.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function open() {
      panel.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', () => {
      panel.classList.contains('open') ? close() : open();
    });

    panel.querySelectorAll('[data-mobile-link]').forEach((link) => {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    return { close };
  })();

  /* ---------------------------------- Active tab tracking ---------------------------------- */
  const TabTracker = (() => {
    const sections = document.querySelectorAll('main section[id]');
    const tabs = document.querySelectorAll('[data-tab]');
    const mobileLinks = document.querySelectorAll('[data-mobile-link]');
    const statusSection = document.getElementById('statusSection');
    if (!sections.length) return;

    function setActive(id) {
      tabs.forEach((t) => {
        const match = t.getAttribute('href') === `#${id}`;
        t.classList.toggle('active', match);
      });
      mobileLinks.forEach((t) => {
        const match = t.getAttribute('href') === `#${id}`;
        t.classList.toggle('active', match);
      });
      if (statusSection) statusSection.textContent = `${id}.tsx`;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
  })();

  /* ---------------------------------- Scroll reveal ---------------------------------- */
  const ScrollReveal = (() => {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    items.forEach((el) => observer.observe(el));
  })();

  /* ---------------------------------- Hero typing effect ---------------------------------- */
  const TypedCode = (() => {
    const el = document.getElementById('typedCode');
    if (!el) return;

    const lines = [
      [{ t: 'const', c: 'kw' }, { t: ' developer ', c: '' }, { t: '=', c: 'punc' }, { t: ' {', c: 'punc' }],
      [{ t: '  name', c: 'prop' }, { t: ':', c: 'punc' }, { t: ' ', c: '' }, { t: `'Sumit Kumar'`, c: 'str' }, { t: ',', c: 'punc' }],
      [{ t: '  role', c: 'prop' }, { t: ':', c: 'punc' }, { t: ' ', c: '' }, { t: `'AI & Web Developer'`, c: 'str' }, { t: ',', c: 'punc' }],
      [{ t: '  stack', c: 'prop' }, { t: ':', c: 'punc' }, { t: ' [', c: 'punc' }, { t: `'React'`, c: 'str' }, { t: ', ', c: 'punc' }, { t: `'Node'`, c: 'str' }, { t: ', ', c: 'punc' }, { t: `'LLMs'`, c: 'str' }, { t: '],', c: 'punc' }],
      [{ t: '  focus', c: 'prop' }, { t: ':', c: 'punc' }, { t: ' ', c: '' }, { t: `'fast, intelligent products'`, c: 'str' }, { t: ',', c: 'punc' }],
      [{ t: '  status', c: 'prop' }, { t: ':', c: 'punc' }, { t: ' ', c: '' }, { t: `'open to work'`, c: 'str' }],
      [{ t: '};', c: 'punc' }],
      [{ t: '', c: '' }],
      [{ t: 'export default', c: 'kw' }, { t: ' function ', c: 'kw' }, { t: 'buildSomething', c: 'fn' }, { t: '(idea) {', c: 'punc' }],
      [{ t: '  return', c: 'kw' }, { t: ' developer', c: '' }, { t: '.', c: 'punc' }, { t: 'ship', c: 'fn' }, { t: '(idea);', c: 'punc' }],
      [{ t: '}', c: 'punc' }],
    ];

    function renderStatic() {
      el.innerHTML = lines
        .map((line, i) => {
          const num = `<span class="ln">${String(i + 1).padStart(2, '0')}</span>`;
          const content = line.map(seg => segHTML(seg)).join('');
          return `<div class="code-line">${num}${content}</div>`;
        })
        .join('');
    }

    function segHTML(seg) {
      if (!seg.t) return '';
      const cls = seg.c ? ` tok-${seg.c}` : '';
      return `<span class="${cls}">${escapeHTML(seg.t)}</span>`;
    }

    function escapeHTML(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    if (prefersReducedMotion) {
      renderStatic();
      return;
    }

    // Build DOM structure up front, then reveal text char-by-char per line.
    const lineEls = lines.map((_, i) => {
      const div = document.createElement('div');
      div.className = 'code-line';
      const num = document.createElement('span');
      num.className = 'ln';
      num.textContent = String(i + 1).padStart(2, '0');
      div.appendChild(num);
      el.appendChild(div);
      return div;
    });

    let lineIndex = 0;
    let segIndex = 0;
    let charIndex = 0;
    let currentSpan = null;
    const speed = 14; // ms per character — quick, confident typing

    function typeStep() {
      if (lineIndex >= lines.length) {
        // finished — blinking cursor stays on the last non-empty line
        const lastLine = lineEls[lines.length - 1] || lineEls[lineEls.length - 1];
        const cursor = document.createElement('span');
        cursor.className = 'type-cursor';
        lastLine.appendChild(cursor);
        return;
      }
      const line = lines[lineIndex];
      const lineEl = lineEls[lineIndex];

      if (segIndex >= line.length) {
        lineIndex++;
        segIndex = 0;
        charIndex = 0;
        currentSpan = null;
        requestAnimationFrame(() => setTimeout(typeStep, 40));
        return;
      }

      const seg = line[segIndex];
      if (!seg.t) {
        segIndex++;
        currentSpan = null;
        typeStep();
        return;
      }

      if (charIndex === 0) {
        currentSpan = document.createElement('span');
        if (seg.c) currentSpan.className = 'tok-' + seg.c;
        lineEl.appendChild(currentSpan);
      }

      charIndex++;
      currentSpan.textContent = seg.t.slice(0, charIndex);

      if (charIndex >= seg.t.length) {
        segIndex++;
        charIndex = 0;
        currentSpan = null;
      }

      setTimeout(typeStep, speed);
    }

    // Start typing once the hero panel scrolls into view (or immediately if already visible).
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(typeStep, 350);
          heroObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    heroObserver.observe(el);
  })();

  /* ---------------------------------- Project filtering ---------------------------------- */
  const ProjectFilter = (() => {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  })();

  /* ---------------------------------- Contact form ---------------------------------- */
  const ContactForm = (() => {
    const form = document.getElementById('contactForm');
    const note = document.getElementById('formNote');
    if (!form || !note) return;

    // Delivers to sumikumar40596@gmail.com via FormSubmit — no backend required.
    // First submission triggers a one-time confirmation email from FormSubmit
    // that must be verified before further messages will be delivered.
    const ENDPOINT = 'https://formsubmit.co/ajax/sumikumar40596@gmail.com';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        note.textContent = 'Please fill in all fields with a valid email.';
        note.classList.remove('success');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      note.textContent = '';
      note.classList.remove('success');

      const data = new FormData(form);
      data.append('_subject', `New portfolio message from ${data.get('name')}`);
      data.append('_template', 'table');
      data.append('_captcha', 'false');

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });

        if (!res.ok) throw new Error('Request failed');

        note.textContent = "Message sent — I'll get back to you within a day or two.";
        note.classList.add('success');
        form.reset();
      } catch (err) {
        note.textContent = "Something went wrong sending that. Please email sumikumar40596@gmail.com directly.";
        note.classList.remove('success');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  })();

  /* ---------------------------------- Footer year ---------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
