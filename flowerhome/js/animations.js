/* ============================================================
   FlowerHome — анимации
   Всё на vanilla JS, без библиотек.
   При prefers-reduced-motion эффекты выключаются.
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   ПРЕЛОАДЕР
   ============================================================ */

function initPreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;

  const countEl = document.getElementById('preCount');
  const fill = document.getElementById('introFill');
  const hero = document.getElementById('hero');

  /* выход в три такта: гасим контент → смыкаем занавес → уводим вверх */
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;

    if (REDUCED) {
      pre.classList.add('is-done');
      document.body.classList.remove('is-locked');
      if (hero) hero.classList.add('is-in');
      pre.remove();
      return;
    }

    pre.classList.add('is-out');

    setTimeout(() => {
      pre.classList.add('is-lift');
      document.body.classList.remove('is-locked');
      if (hero) hero.classList.add('is-in');
    }, 780);

    setTimeout(() => pre.remove(), 1700);
  };

  /* показываем один раз за сессию — на переходах между страницами не мешаем */
  let seen = false;
  try { seen = sessionStorage.getItem('fh_intro') === '1'; } catch (e) {}

  if (REDUCED || seen) {
    if (countEl) countEl.textContent = '100';
    finish();
    return;
  }

  try { sessionStorage.setItem('fh_intro', '1'); } catch (e) {}

  document.body.classList.add('is-locked');
  pre.classList.add('is-active');

  /* Прогресс считаем от реального времени, а не от числа кадров.
     rAF замирает в фоновой вкладке, поэтому дублируем таймером
     и подстраховываемся жёстким setTimeout — интро не должно зависнуть. */
  const DURATION = 4200;
  const t0 = Date.now();

  const draw = () => {
    if (finished) return;

    const p = Math.min(1, (Date.now() - t0) / DURATION);
    const eased = 1 - Math.pow(1 - p, 2);   // к концу замедляется
    const n = Math.round(eased * 100);

    countEl.textContent = n;
    if (fill) fill.style.width = n + '%';

    if (p >= 1) {
      clearInterval(timer);
      setTimeout(finish, 420);
      return;
    }
    requestAnimationFrame(draw);
  };

  const timer = setInterval(draw, 250);   // работает и когда вкладка в фоне
  requestAnimationFrame(draw);

  setTimeout(() => { clearInterval(timer); finish(); }, DURATION + 1200);
}

/* ============================================================
   КАСТОМНЫЙ КУРСОР
   ============================================================ */

function initCursor() {
  const cursor = document.getElementById('cursor');
  const label = document.getElementById('cursorLabel');
  if (!cursor || REDUCED) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let cx = x, cy = y;

  window.addEventListener('mousemove', e => {
    x = e.clientX;
    y = e.clientY;
    cursor.classList.add('is-visible');
  });

  window.addEventListener('mouseout', e => {
    if (!e.relatedTarget) cursor.classList.remove('is-visible');
  });

  const loop = () => {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  loop();

  // наведение на интерактив
  const hoverSel = 'a, button, .card, [data-cursor], input, select, textarea';

  document.addEventListener('mouseover', e => {
    const t = e.target.closest(hoverSel);
    if (!t) return;
    cursor.classList.add('is-hover');
    label.textContent = t.dataset.cursor || '';
  });

  document.addEventListener('mouseout', e => {
    const t = e.target.closest(hoverSel);
    if (!t) return;
    if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(hoverSel)) return;
    cursor.classList.remove('is-hover');
    label.textContent = '';
  });
}

/* ============================================================
   МАГНИТНЫЕ КНОПКИ
   ============================================================ */

function initMagnetic() {
  if (REDUCED || window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ============================================================
   3D-НАКЛОН ОБЛОЖКИ ВСЛЕД ЗА КУРСОРОМ
   ============================================================ */

function initHeroTilt() {
  const hero = document.getElementById('hero');
  const card = document.getElementById('heroCard');
  if (!hero || !card || REDUCED) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const floats = [...hero.querySelectorAll('.hero__float')];
  let raf = null;
  let tx = 0, ty = 0;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);   // -1 … 1
    ty = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);

    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      card.style.transform =
        `rotateY(${tx * 9}deg) rotateX(${-ty * 9}deg) translateZ(0)`;

      floats.forEach(f => {
        const d = Number(f.dataset.depth) || 0.05;
        f.style.transform = `translate(${tx * d * 260}px, ${ty * d * 200}px)`;
      });
    });
  });

  hero.addEventListener('mouseleave', () => {
    card.style.transform = '';
    floats.forEach(f => { f.style.transform = ''; });
  });
}

/* ============================================================
   3D-НАКЛОН ФОТО САЛОНА
   ============================================================ */

function initSalonTilt() {
  const box = document.getElementById('salonArt');
  const frame = document.getElementById('salonFrame');
  if (!box || !frame || REDUCED) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let raf = null;

  box.addEventListener('mousemove', e => {
    const r = box.getBoundingClientRect();
    const tx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ty = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);

    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      frame.style.transform =
        `rotateY(${tx * 7}deg) rotateX(${-ty * 6}deg) translateZ(0)`;
    });
  });

  box.addEventListener('mouseleave', () => { frame.style.transform = ''; });
}

/* ============================================================
   РОЗОВОЕ СВЕЧЕНИЕ ЗА КУРСОРОМ НА ОБЛОЖКЕ
   ============================================================ */

function initHeroGlow() {
  const hero = document.getElementById('hero');
  const glow = document.getElementById('heroGlow');
  if (!hero || !glow || REDUCED) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let x = 0, y = 0, gx = 0, gy = 0;
  let active = false;
  let raf = null;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    x = e.clientX - r.left;
    y = e.clientY - r.top;

    if (!active) {
      active = true;
      gx = x; gy = y;                 // не тянем шлейф от угла при первом входе
      glow.classList.add('is-on');
      loop();
    }
  });

  hero.addEventListener('mouseleave', () => {
    glow.classList.remove('is-on');
    active = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  });

  function loop() {
    gx += (x - gx) * 0.11;            // мягкое отставание — свет «тянется» за мышкой
    gy += (y - gy) * 0.11;
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    if (active) raf = requestAnimationFrame(loop);
  }
}

/* ============================================================
   ОБЪЁМНАЯ ДИАГРАММА: запуск и наклон за курсором
   ============================================================ */

function initChart3d() {
  const fig = document.getElementById('whyChart');
  if (!fig) return;

  if (REDUCED || !('IntersectionObserver' in window)) {
    fig.classList.add('is-in');
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      fig.classList.add('is-in');
      obs.unobserve(en.target);
    });
  }, { threshold: 0.3 });

  io.observe(fig);
}

/* ============================================================
   ПАДАЮЩИЕ ЛЕПЕСТКИ
   ============================================================ */

function initPetals() {
  const canvas = document.getElementById('petals');
  if (!canvas || REDUCED) return;

  const ctx = canvas.getContext('2d');
  const COLORS = ['#E8C9C2', '#C4694F', '#D9B7AE', '#B08A5A'];
  let w = 0, h = 0, dpr = 1;
  let petals = [];
  let running = true;

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = w < 700 ? 9 : 16;
    petals = Array.from({ length: count }, () => spawn(true));
  }

  function spawn(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : -30,
      size: 5 + Math.random() * 8,
      speed: 0.25 + Math.random() * 0.55,
      drift: (Math.random() - 0.5) * 0.5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.018,
      alpha: 0.18 + Math.random() * 0.4,
      color: COLORS[(Math.random() * COLORS.length) | 0]
    };
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    petals.forEach((p, i) => {
      p.y += p.speed;
      p.x += p.drift + Math.sin(p.y / 90) * 0.35;
      p.angle += p.spin;

      if (p.y > h + 30) petals[i] = spawn(false);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', debounce(resize, 200));

  // не тратим кадры, когда обложка ушла из вида
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting && !running) { running = true; draw(); }
      else if (!en.isIntersecting) running = false;
    });
  }, { threshold: 0 });
  io.observe(canvas);

  draw();
}

/* ============================================================
   БЕГУЩАЯ СТРОКА
   ============================================================ */

function initMarquee() {
  const track = document.getElementById('marquee');
  if (!track) return;

  if (REDUCED) { track.style.transform = 'none'; return; }

  let offset = 0;
  let base = 0.42;
  let boost = 0;
  let lastScroll = window.scrollY;
  let half = 0;

  const measure = () => { half = track.scrollWidth / 2; };
  measure();
  window.addEventListener('resize', debounce(measure, 250));

  window.addEventListener('scroll', () => {
    const d = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    boost = Math.max(-6, Math.min(6, d * 0.35));
  }, { passive: true });

  const loop = () => {
    boost *= 0.92;
    offset -= base + boost;
    if (half && offset <= -half) offset += half;
    if (offset > 0) offset -= half;
    track.style.transform = `translate3d(${offset}px,0,0)`;
    requestAnimationFrame(loop);
  };
  loop();
}

/* ============================================================
   СКРОЛЛ-РЕВИЛЫ
   ============================================================ */

function initReveals() {
  const items = document.querySelectorAll('[data-reveal], [data-reveal-clip]');
  if (!items.length) return;

  if (REDUCED || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  // каскад внутри одного контейнера
  const groups = new Map();
  items.forEach(el => {
    const parent = el.parentElement;
    const idx = groups.get(parent) || 0;
    el.style.transitionDelay = Math.min(idx, 6) * 70 + 'ms';
    groups.set(parent, idx + 1);
    io.observe(el);
  });
}

/* ============================================================
   СЧЁТЧИКИ ЦИФР
   ============================================================ */

function initCounters() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  if (REDUCED || !('IntersectionObserver' in window)) {
    nums.forEach(el => { el.textContent = el.dataset.count; });
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = Number(el.dataset.count);
      const dur = 1400;
      const t0 = performance.now();

      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => io.observe(el));
}

/* ============================================================
   ШАПКА: тень при скролле + прячется вниз
   ============================================================ */

function initHeader() {
  const header = document.getElementById('header');
  const toTop = document.getElementById('toTop');
  if (!header) return;

  let last = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;

    header.classList.toggle('is-stuck', y > 20);

    // прячем только когда меню закрыто и скроллим вниз
    const menuOpen = document.getElementById('nav').classList.contains('is-open');
    if (!menuOpen && y > 400 && y > last + 4) {
      header.classList.add('is-hidden');
    } else if (y < last - 4 || y < 200) {
      header.classList.remove('is-hidden');
    }

    if (toTop) toTop.classList.toggle('is-shown', y > 900);

    last = y;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }
}

/* ============================================================
   МОБИЛЬНОЕ МЕНЮ
   ============================================================ */

function initBurger() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!burger || !nav) return;

  const toggle = force => {
    const open = force !== undefined ? force : !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  };

  burger.addEventListener('click', () => toggle());

  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') toggle(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) toggle(false);
  });
}

/* ============================================================
   ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ
   ============================================================ */

function initAnchors() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });
}

/* ============================================================
   УТИЛИТА
   ============================================================ */

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ============================================================
   СТАРТ
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursor();
  initMagnetic();
  initHeroTilt();
  initSalonTilt();
  initHeroGlow();
  initChart3d();
  initPetals();
  initMarquee();
  initReveals();
  initCounters();
  initHeader();
  initBurger();
  initAnchors();
});
