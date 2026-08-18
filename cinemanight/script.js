/* =========================================================
   КИНОНОЧЬ — анимации и интерактив
   ========================================================= */
(() => {
'use strict';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH   = matchMedia('(hover: none), (pointer: coarse)').matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   Разбивка текста
   --------------------------------------------------------- */
// по буквам — для заголовка героя
function splitChars(el){
  const text = el.textContent.trim();
  el.textContent = '';
  el.setAttribute('aria-label', text);
  return [...text].map(ch => {
    const s = document.createElement('span');
    s.textContent = ch;
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
    return s;
  });
}

// по строкам — оборачивает слова и группирует по фактическому переносу
function splitLines(el){
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  const spans = words.map((w, i) => {
    const s = document.createElement('span');
    s.className = 'rl-word';
    s.textContent = w + (i < words.length - 1 ? ' ' : '');
    s.style.display = 'inline-block';
    el.appendChild(s);
    return s;
  });

  // группируем по вертикальной позиции
  const rows = new Map();
  spans.forEach(s => {
    const top = Math.round(s.offsetTop);
    if (!rows.has(top)) rows.set(top, []);
    rows.get(top).push(s);
  });

  el.textContent = '';
  const inners = [];
  [...rows.values()].forEach(group => {
    const line  = document.createElement('span');
    line.className = 'rl-line';
    const inner = document.createElement('span');
    group.forEach(w => { w.style.display = ''; inner.appendChild(w); });
    line.appendChild(inner);
    el.appendChild(line);
    inners.push(inner);
  });
  return inners;
}

/* ---------------------------------------------------------
   Прелоадер
   --------------------------------------------------------- */
function boot(){
  const loader = $('#loader');
  const heroLines = $$('.hero__title [data-split]');
  heroLines.forEach(splitChars);

  // прелоадер только при первом заходе за сессию — повторные визиты открываются сразу
  let seen = false;
  try { seen = sessionStorage.getItem('cn-seen') === '1'; } catch(e){}
  const skip = seen || /[?&]nopre\b/.test(location.search);

  if (REDUCED || !loader || skip){
    loader?.remove();
    document.body.classList.remove('is-loading');
    gsap.set('.hero__title .line > span', { y: 0, opacity: 1 });
    start();
    return;
  }
  try { sessionStorage.setItem('cn-seen', '1'); } catch(e){}

  document.body.classList.add('is-loading');
  const bar  = $('#loaderBar');
  const num  = $('#loaderNum');
  const word = $$('.loader__word span');
  const state = { v: 0 };

  const tl = gsap.timeline();
  tl.to(word, { y: 0, opacity: 1, duration: .55, stagger: .045, ease: 'expo.out' })
    .to(state, {
      v: 100, duration: 1.15, ease: 'power2.inOut',
      onUpdate(){
        const v = Math.round(state.v);
        num.textContent = v;
        bar.style.width = v + '%';
      }
    }, .25)
    .to('.loader__word span', { y: '-110%', duration: .45, stagger: .025, ease: 'expo.in' }, '+=.1')
    .to('.loader__bar, .loader__num', { opacity: 0, duration: .25 }, '<')
    .to('.loader__wipe', { y: '0%', duration: .55, ease: 'expo.inOut' }, '-=.2')
    .set(loader, { background: 'transparent' })
    .to('.loader__wipe', { y: '-100%', duration: .65, ease: 'expo.inOut' }, '+=.05')
    .add(() => {
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      loader.remove();
    })
    .from('.hero__title .line > span', {
      y: '105%', duration: .85, stagger: .035, ease: 'expo.out'
    }, '-=.5')
    .from('.hero__top > *', { y: 14, opacity: 0, duration: .5, stagger: .08, ease: 'power2.out' }, '-=.6')
    // главное фото проявляем без сдвига — оно же фон на мобильных
    .from('.hero__shot', { opacity: 0, duration: .9, ease: 'power2.out' }, '-=.75')
    .add(start, '-=.7');
}

/* ---------------------------------------------------------
   Основные анимации
   --------------------------------------------------------- */
function start(){
  document.documentElement.classList.add('is-ready');

  /* --- reveal блоков --- */
  $$('[data-reveal]').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: .7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* --- reveal построчно --- */
  $$('[data-reveal-lines]').forEach(el => {
    const lines = splitLines(el);
    gsap.to(lines, {
      y: '0%', duration: .9, stagger: .09, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  /* --- счётчики --- */
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.5, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate(){ el.textContent = Math.round(obj.v).toLocaleString('ru-RU'); }
    });
  });

  /* --- бегущие строки --- */
  $$('[data-ticker]').forEach(track => {
    const dir = +(track.dataset.dir || 1);
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

    // ширина исходного набора — на неё и будем сдвигать, тогда шва не видно
    const original = [...track.children];
    const setW = original.reduce((s, n) => s + n.getBoundingClientRect().width + gap, 0);
    if (!setW) return;

    // клонируем набор, пока лента не покроет экран с запасом
    const need = track.parentElement.offsetWidth + setW;
    let guard = 0;
    while (track.scrollWidth < need && guard++ < 20){
      original.forEach(n => track.appendChild(n.cloneNode(true)));
    }

    gsap.set(track, { x: dir < 0 ? -setW : 0 });
    gsap.to(track, {
      x: dir < 0 ? 0 : -setW,
      duration: setW / 55,
      ease: 'none',
      repeat: -1
    });
  });

  /* --- параллакс картинок --- */
  if (!REDUCED){
    $$('[data-parallax]').forEach(img => {
      const amt = +img.dataset.parallax;
      gsap.fromTo(img, { yPercent: -amt }, {
        yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* --- горизонтальная галерея --- */
  const track = $('[data-hscroll]');
  const pin   = $('.gallery__pin');
  if (track && pin && !REDUCED){
    const build = () => {
      const dist = track.scrollWidth - window.innerWidth;
      if (dist <= 0) return;
      gsap.to(track, {
        x: -dist, ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'top top', end: () => '+=' + (dist + window.innerHeight * .6),
          pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: self => {
            const p = $('[data-hprogress]');
            if (p) p.style.width = (self.progress * 100).toFixed(1) + '%';
          }
        }
      });
    };
    build();
  }

  /* --- инверсия шапки по теме секции --- */
  const nav = $('#nav');
  $$('[data-theme]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top ' + (parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--nav-h')) || 74) / 2 + 'px',
      end: 'bottom ' + (parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--nav-h')) || 74) / 2 + 'px',
      onToggle: self => {
        if (!self.isActive) return;
        const light = ['cream', 'acid', 'flame'].includes(sec.dataset.theme);
        nav.classList.toggle('nav--onlight', light);
      }
    });
  });

  /* --- шапка: фон при скролле + скрытие вниз --- */
  let last = window.scrollY;
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: () => {
      const y = window.scrollY;
      nav.classList.toggle('is-stuck', y > 40);
      if (!$('#menu').classList.contains('is-open')){
        nav.classList.toggle('is-hidden', y > last && y > 400);
      }
      last = y;
    }
  });

  /* --- активная ссылка в меню --- */
  const ids = ['about', 'gallery', 'occasions', 'pricing', 'faq'];
  ids.forEach(id => {
    const sec = document.getElementById(id);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: self => {
        $$(`.nav__links a[href="#${id}"]`).forEach(a =>
          a.classList.toggle('is-active', self.isActive));
      }
    });
  });

  ScrollTrigger.refresh();
}

/* ---------------------------------------------------------
   Курсор
   --------------------------------------------------------- */
function initCursor(){
  const cur = $('#cursor');
  if (!cur || TOUCH || REDUCED){ cur?.remove(); return; }
  const dot  = $('.cursor__dot', cur);
  const ring = $('.cursor__ring', cur);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.set(dot, { x: mx, y: my });
  }, { passive: true });

  gsap.ticker.add(() => {
    rx += (mx - rx) * .16;
    ry += (my - ry) * .16;
    gsap.set(ring, { x: rx, y: ry });
  });

  const hot = 'a, button, [data-magnet], .acc__q, .occ, .tariff, .fact';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hot)) document.body.classList.add('cursor-hot');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hot)) document.body.classList.remove('cursor-hot');
  });
}

/* ---------------------------------------------------------
   Магнитные элементы
   --------------------------------------------------------- */
function initMagnet(){
  if (TOUCH || REDUCED) return;
  $$('[data-magnet]').forEach(el => {
    const strength = 0.28;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - (r.left + r.width / 2)) * strength,
        y: (e.clientY - (r.top + r.height / 2)) * strength,
        duration: .5, ease: 'power3.out'
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1, .4)' });
    });
  });
}

/* ---------------------------------------------------------
   Свет за курсором по первой секции
   --------------------------------------------------------- */
function initSpotlight(){
  if (TOUCH || REDUCED) return;

  $$('[data-spotlight]').forEach(sec => {
    const light = $('.hero__light', sec);
    if (!light) return;

    // pointermove браузер и так отдаёт не чаще кадра, поэтому пишем сразу в CSS-переменные
    sec.addEventListener('pointermove', e => {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty('--lx', (e.clientX - r.left).toFixed(0) + 'px');
      sec.style.setProperty('--ly', (e.clientY - r.top).toFixed(0) + 'px');
      sec.classList.add('is-lit');
    });
    sec.addEventListener('pointerleave', () => sec.classList.remove('is-lit'));
  });
}

/* ---------------------------------------------------------
   3D-наклон фото за курсором + блик
   --------------------------------------------------------- */
function initTilt(){
  if (TOUCH || REDUCED) return;

  const MAX_TILT_X = 4;   // наклон вперёд/назад, градусы
  const MAX_TILT_Y = 5.5; // наклон влево/вправо, градусы

  $$('[data-tilt]').forEach(wrap => {
    const inner = $('.hero__shot-inner', wrap) || wrap.firstElementChild;
    const shine = $('.hero__shot-shine', wrap);
    if (!inner) return;

    const tilt = e => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 слева .. 1 справа
      const py = (e.clientY - r.top)  / r.height;  // 0 сверху .. 1 снизу
      const rotX = (0.5 - py) * MAX_TILT_X * 2;
      const rotY = (px - 0.5) * MAX_TILT_Y * 2;
      inner.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.015)`;
      if (shine) shine.style.background =
        `radial-gradient(circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(237,231,217,.34), rgba(237,231,217,0) 42%)`;
    };
    const reset = () => { inner.style.transform = ''; };

    /* pointermove покрывает мышь, перо и палец разом */
    wrap.addEventListener('pointermove', tilt);
    wrap.addEventListener('pointerleave', reset);

    /* клавиатурный фокус даёт тот же наклон в фиксированное положение */
    wrap.setAttribute('tabindex', '0');
    wrap.addEventListener('focus', () => {
      inner.style.transform = `rotateX(${MAX_TILT_X * .5}deg) rotateY(${-MAX_TILT_Y * .5}deg) scale(1.015)`;
    });
    wrap.addEventListener('blur', reset);
  });
}

/* ---------------------------------------------------------
   Аккордеон FAQ
   --------------------------------------------------------- */
function initAccordion(){
  $$('.acc__item').forEach(item => {
    const btn  = $('.acc__q', item);
    const body = $('.acc__a', item);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';

      // закрываем остальные
      $$('.acc__item').forEach(other => {
        if (other === item) return;
        const ob = $('.acc__q', other), oa = $('.acc__a', other);
        if (ob.getAttribute('aria-expanded') === 'true'){
          ob.setAttribute('aria-expanded', 'false');
          gsap.to(oa, { height: 0, duration: .45, ease: 'power2.inOut',
            onComplete: () => ScrollTrigger.refresh() });
        }
      });

      btn.setAttribute('aria-expanded', String(!open));
      gsap.to(body, {
        height: open ? 0 : 'auto',
        duration: .5, ease: 'power2.inOut',
        onComplete: () => ScrollTrigger.refresh()
      });
    });
  });
}

/* ---------------------------------------------------------
   Мобильное меню
   --------------------------------------------------------- */
function initMenu(){
  const burger = $('#burger'), menu = $('#menu');
  if (!burger || !menu) return;

  const setOpen = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (open){
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      gsap.fromTo('.menu__links a',
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: .55, stagger: .06, ease: 'expo.out', delay: .18 });
    } else {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { menu.hidden = true; }, 700);
    }
  };

  burger.addEventListener('click', () =>
    setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setOpen(false);
  });
}

/* ---------------------------------------------------------
   Плавная прокрутка по якорям
   --------------------------------------------------------- */
function initAnchors(){
  const navH = () => parseInt(getComputedStyle(document.documentElement)
                        .getPropertyValue('--nav-h')) || 74;
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : navH() - 2);
      window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  });
}

/* ---------------------------------------------------------
   Форма
   --------------------------------------------------------- */
function initForm(){
  const form = $('.form');
  if (!form) return;
  const hint = $('[data-formhint]', form);

  const rules = {
    name:  v => v.trim().length >= 2 || 'Напишите, как к вам обращаться',
    phone: v => /^[\d\s+()-]{10,}$/.test(v.trim()) || 'Проверьте номер телефона',
    email: v => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Проверьте адрес почты'
  };

  const check = input => {
    const rule = rules[input.name];
    if (!rule) return true;
    const res = rule(input.value);
    const field = input.closest('.field');
    const err = $('[data-err]', field);
    if (res === true){
      field.classList.remove('has-err');
      if (err) err.textContent = '';
      return true;
    }
    field.classList.add('has-err');
    if (err) err.textContent = res;
    return false;
  };

  $$('input, textarea', form).forEach(inp => {
    inp.addEventListener('blur', () => check(inp));
    inp.addEventListener('input', () => {
      if (inp.closest('.field')?.classList.contains('has-err')) check(inp);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = $$('input[name], textarea[name]', form);
    const ok = inputs.every(check);
    const agreed = $('.check input', form).checked;

    hint.classList.remove('is-ok', 'is-err');
    if (!ok){
      hint.textContent = 'Проверьте выделенные поля';
      hint.classList.add('is-err');
      const bad = $('.field.has-err input, .field.has-err textarea', form);
      bad?.focus();
      return;
    }
    if (!agreed){
      hint.textContent = 'Нужно согласие на обработку данных';
      hint.classList.add('is-err');
      return;
    }
    // Бэкенд не подключён — здесь будет отправка на сервер.
    hint.textContent = 'Форма заполнена верно. Отправка появится после подключения сервера.';
    hint.classList.add('is-ok');
  });
}

/* ---------------------------------------------------------
   Мелочи
   --------------------------------------------------------- */
function initMisc(){
  const y = $('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // пересчёт после загрузки картинок
  addEventListener('load', () => ScrollTrigger.refresh());
  let t;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => ScrollTrigger.refresh(), 220);
  });
}

/* --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initMagnet();
  initSpotlight();
  initTilt();
  initAccordion();
  initMenu();
  initAnchors();
  initForm();
  initMisc();
  boot();
});

})();
