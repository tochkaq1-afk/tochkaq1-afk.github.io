/* ═══════════════════════════════════════════════════════════
   МОТОАРЕНА — движение
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var isNarrow = function () { return window.innerWidth <= 720; };

  gsap.registerPlugin(ScrollTrigger);

  /* ── плавный скролл ─────────────────────────────────────── */
  var lenis = null;
  if (!reduced && typeof Lenis === 'function') {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function goTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: -8, duration: 1.35 });
    else { var el = typeof target === 'string' ? $(target) : target; if (el) el.scrollIntoView({ behavior: 'smooth' }); }
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || !$(id)) return;
      e.preventDefault();
      closeMenu();
      goTo(id);
    });
  });

  /* ═══ ИНТРО «РАЗГОН» ══════════════════════════════════════ */
  var ign = $('#intro');

  function startSite() {
    document.body.classList.remove('is-loading');
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
    heroIntro();
  }

  function ignite() {
    if (!ign) { startSite(); return; }

    var finished = false, streakTl = null, guard = null;
    var done = function () {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      if (streakTl) streakTl.kill();
      if (ign.isConnected) ign.remove();
      startSite();
    };
    /* страховка: что бы ни случилось с анимацией, сайт откроется */
    guard = setTimeout(done, 6000);

    if (reduced) {
      gsap.to(ign, { opacity: 0, duration: .4, onComplete: done });
      return;
    }

    /* полосы-стрики, летящие навстречу */
    var box = $('#streaks');
    for (var i = 0; i < 26; i++) {
      var s = document.createElement('i');
      s.style.top = (Math.random() * 100).toFixed(1) + '%';
      s.style.width = (60 + Math.random() * 320).toFixed(0) + 'px';
      box.appendChild(s);
    }
    var streaks = $$('i', box);

    var speedEl = $('#introSpeed'), gearEl = $('#introGear'), vid = $('#introVid');
    var st = { v: 0 };
    var GEARS = [[0, 'N'], [40, '1'], [90, '2'], [150, '3'], [210, '4'], [260, '5'], [299, '6']];

    if (vid) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }

    /* полосы живут отдельно: бесконечный повтор внутри основного таймлайна
       не дал бы ему завершиться, и сайт так и не открылся бы */
    streakTl = gsap.to(streaks, {
      opacity: 1, x: function () { return -(window.innerWidth + 500); },
      duration: .55, ease: 'power1.in',
      stagger: { each: .045, repeat: -1, from: 'random' }
    });

    var tl = gsap.timeline({ onComplete: done });

    /* 1. разгон: цифры + тряска + стрики */
    tl.to(st, {
      v: 299, duration: 2.1, ease: 'power2.in',
      onUpdate: function () {
        var v = Math.round(st.v);
        speedEl.textContent = v;
        for (var k = GEARS.length - 1; k >= 0; k--) {
          if (v >= GEARS[k][0]) { gearEl.textContent = GEARS[k][1]; break; }
        }
      }
    })
      .to('.intro__speed', {
        x: '+=3', duration: .06, repeat: 22, yoyo: true, ease: 'none'
      }, .9)
      .to('#introGear', { color: '#FF4D0A', scale: 1.25, duration: .12, repeat: 5, yoyo: true }, 1.1)

      /* 2. скорость гаснет, из неё собирается слово */
      .to('.intro__hud', { opacity: 0, scale: .8, duration: .38, ease: 'power2.in' }, '>-.05')
      .set('.intro__word', { opacity: 1 })
      .fromTo('.intro__word span',
        {
          opacity: 0,
          x: function (i) { return (i % 2 ? 1 : -1) * (160 + i * 26); },
          filter: 'blur(14px)'
        },
        {
          opacity: 1, x: 0, filter: 'blur(0px)',
          duration: .72, ease: 'expo.out', stagger: .045
        }, '<')
      .to('.intro__gear', { opacity: 1, duration: .4 }, '<')

      /* 3. окно раскрывается и проглатывает камеру */
      .to('.intro__hole', { opacity: 1, scale: 1, duration: .55, ease: 'expo.out' }, '>-.1')
      .to('.intro__word span', { opacity: 0, y: -18, duration: .4, ease: 'power2.in', stagger: .03 }, '<.15')
      .to('.intro__gear', { opacity: 0, duration: .3 }, '<')
      .to('.intro__hole', { scale: 42, duration: 1.05, ease: 'power2.inOut' }, '>-.15')
      .to('#introFlash', { opacity: .85, duration: .18 }, '>-.28')
      .to(ign, { opacity: 0, duration: .45, ease: 'power2.inOut' }, '>-.08');
  }

  /* ═══ ШАПКА + МЕНЮ ════════════════════════════════════════ */
  var hdr = $('#hdr'), burger = $('#burger'), menu = $('#menu'), menuOpen = false, menuTl = null;

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: function (self) { hdr.classList.toggle('is-stuck', self.scroll() > 80); },
    onRefresh: function (self) { hdr.classList.toggle('is-stuck', self.scroll() > 80); }
  });

  function buildMenuTl() {
    var tl = gsap.timeline({ paused: true });
    tl.set(menu, { display: 'grid' })
      .fromTo('.menu__bg', { scaleY: 0 }, { scaleY: 1, duration: .75, ease: 'expo.inOut' })
      .fromTo('.menu__list a', { y: '110%' }, { y: '0%', duration: .8, ease: 'expo.out', stagger: .055 }, '-=.32')
      .fromTo('.menu__meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, '-=.5');
    return tl;
  }

  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    menu.hidden = false;
    document.body.classList.add('is-menu');
    burger.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
    if (!menuTl) menuTl = buildMenuTl();
    menuTl.play(0);
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    document.body.classList.remove('is-menu');
    burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
    menuTl.reverse().eventCallback('onReverseComplete', function () { menu.hidden = true; });
  }
  burger.addEventListener('click', function () { menuOpen ? closeMenu() : openMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMenu();
    if (!lbox.hidden) closeBox();
  });

  /* ═══ ОБЛОЖКА ═════════════════════════════════════════════ */
  function heroIntro() {
    var tl = gsap.timeline();
    tl.to('.hero__title b', { y: '0%', duration: 1.15, ease: 'expo.out', stagger: .045 })
      .from('.hero__eyebrow', { opacity: 0, y: 14, duration: .7, ease: 'power2.out' }, '-=.95')
      .from('.hero__lede', { opacity: 0, y: 22, duration: .8, ease: 'power2.out' }, '-=.72')
      .from('.hero__cta .btn', { opacity: 0, y: 22, duration: .7, ease: 'power2.out', stagger: .09 }, '-=.6')
      .from('.reel', { opacity: 0, y: 34, scale: .94, duration: .9, ease: 'expo.out' }, '-=.7')
      .from('.hero__scroll', { opacity: 0, duration: .6 }, '-=.5');
  }

  /* луч фары */
  (function beam() {
    var stage = $('#beamStage'), dark = $('.hero__img--dark'), glow = $('.hero__glow');
    if (!stage || reduced) return;
    var tx = 55, ty = 45, cx = 55, cy = 45, raf = null, idle = true, t0 = performance.now();

    function apply() {
      cx = lerp(cx, tx, .1); cy = lerp(cy, ty, .1);
      var mx = cx.toFixed(2) + '%', my = cy.toFixed(2) + '%';
      dark.style.setProperty('--mx', mx); dark.style.setProperty('--my', my);
      glow.style.setProperty('--mx', mx); glow.style.setProperty('--my', my);
      raf = requestAnimationFrame(apply);
    }

    function drift() {
      if (!idle) return;
      var t = (performance.now() - t0) / 1000;
      tx = 50 + Math.sin(t * .38) * 24;
      ty = 46 + Math.cos(t * .27) * 12;
    }
    setInterval(drift, 40);

    stage.addEventListener('pointermove', function (e) {
      idle = false;
      var r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
    });
    stage.addEventListener('pointerleave', function () { idle = true; t0 = performance.now(); });
    apply();

    // параллакс обложки
    gsap.to('.hero__stage', {
      yPercent: 16, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__body', {
      yPercent: -14, opacity: .1, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  })();

  /* ═══ РОЛИК ═══════════════════════════════════════════════ */
  var lbox = $('#lbox'), lboxVid = $('#lboxVid'), reelVid = $('#reelVid');

  if (reelVid) {
    reelVid.addEventListener('loadedmetadata', function () {
      var d = Math.round(reelVid.duration);
      $('#reelLen').textContent = Math.floor(d / 60) + ':' + String(d % 60).padStart(2, '0');
    });
    var tryPlay = reelVid.play();
    if (tryPlay && tryPlay.catch) tryPlay.catch(function () {});
  }
  function openBox() {
    lbox.hidden = false;
    document.body.classList.add('is-locked');
    if (lenis) lenis.stop();
    lboxVid.currentTime = reelVid ? reelVid.currentTime : 0;
    lboxVid.play().catch(function () {});
    gsap.fromTo(lbox, { opacity: 0 }, { opacity: 1, duration: .35 });
    gsap.fromTo('.lbox__vid', { scale: .94, y: 20 }, { scale: 1, y: 0, duration: .6, ease: 'expo.out' });
  }
  function closeBox() {
    lboxVid.pause();
    document.body.classList.remove('is-locked');
    if (lenis) lenis.start();
    gsap.to(lbox, { opacity: 0, duration: .3, onComplete: function () { lbox.hidden = true; } });
  }
  $('#reelOpen').addEventListener('click', openBox);
  $('#lboxClose').addEventListener('click', closeBox);
  lbox.addEventListener('click', function (e) { if (e.target === lbox) closeBox(); });

  /* ═══ БЕГУЩИЕ СТРОКИ ══════════════════════════════════════ */
  var HERO_WORDS = ['Мотоциклы', 'Шлемы', 'Экипировка', 'Обувь', 'Тюнинг', 'Запчасти', 'Мотохимия', 'Сервис', 'Комиссия', 'Мотоциклы из США'];
  (function fillHero() {
    var row = $('#heroTick');
    if (!row) return;
    var unit = document.createElement('div');
    HERO_WORDS.forEach(function (w) {
      var s = document.createElement('span'); s.textContent = w;
      var d = document.createElement('span'); d.className = 'dot';
      unit.appendChild(s); unit.appendChild(d);
    });
    row.appendChild(unit);
    row.appendChild(unit.cloneNode(true));
  })();

  var BRANDS = [
    ['b-hd', 'Harley-Davidson'], ['b-shoei', 'Shoei'], ['b-alpine', 'Alpinestars'],
    ['b-ls2', 'LS2'], ['b-schuberth', 'Schuberth'], ['b-icon', 'ICON'],
    ['b-johndoe', 'John Doe'], ['b-airoh', 'Airoh'], ['b-givi', 'GIVI'],
    ['b-sena', 'Sena'], ['b-motul', 'Motul'], ['b-rokker', 'Rokker'],
    ['b-hiflo', 'Hiflofiltro'], ['b-ipone', 'Ipone'], ['b-mcp', 'MCP'],
    ['b-hawk', 'Hawk Moto'], ['b-boot', 'Magelan & Mulloy']
  ];
  function fillBrands(id, list) {
    var row = $(id);
    if (!row) return;
    var unit = document.createElement('div');
    list.forEach(function (b) {
      var a = document.createElement('a');
      a.className = 'brand';
      a.href = 'https://motoarena.by/brands/';
      a.target = '_blank'; a.rel = 'noopener';
      /* без lazy: логотипы крошечные, а бесконечная лента уезжает из вьюпорта
         и ленивые картинки в ней могут так и не загрузиться */
      a.innerHTML = '<img src="img/' + b[0] + '.webp" alt="' + b[1] + '" decoding="async">';
      unit.appendChild(a);
    });
    row.appendChild(unit);
    row.appendChild(unit.cloneNode(true));
  }
  fillBrands('#brandRow', BRANDS);
  fillBrands('#brandRow2', BRANDS.slice().reverse());

  /* прокрутка лент: базовая скорость + добавка от скролла */
  (function tickers() {
    var rows = $$('[data-ticker]').map(function (t) {
      return {
        row: $('.ticker__row', t),
        speed: parseFloat(t.dataset.speed || '.7'),
        dir: parseFloat(t.dataset.dir || '1'),
        x: 0, w: 0
      };
    });
    function measure() { rows.forEach(function (r) { r.w = r.row.scrollWidth / 2; }); }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    /* пока грузятся логотипы, ширина ленты меняется — перемеряем */
    $$('.ticker__row img').forEach(function (im) {
      if (!im.complete) im.addEventListener('load', measure, { once: true });
    });

    var boost = 0, lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      boost = clamp((y - lastY) * .35, -22, 22);
      lastY = y;
    }, { passive: true });

    gsap.ticker.add(function () {
      boost = lerp(boost, 0, .06);
      rows.forEach(function (r) {
        if (!r.w) return;
        r.x -= (r.speed + boost * .1) * r.dir;
        if (r.x <= -r.w) r.x += r.w;
        if (r.x > 0) r.x -= r.w;
        r.row.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0)';
      });
    });
  })();

  /* ═══ МАНИФЕСТ ════════════════════════════════════════════ */
  (function manifest() {
    var el = $('[data-words]');
    if (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
      var spans = $$('.w', el);
      if (reduced) spans.forEach(function (s) { s.classList.add('on'); });
      else {
        ScrollTrigger.create({
          trigger: el, start: 'top 78%', end: 'bottom 42%', scrub: .4,
          onUpdate: function (self) {
            var n = Math.round(self.progress * spans.length);
            spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
          }
        });
      }
    }

    $$('[data-count]').forEach(function (b) {
      var to = parseFloat(b.dataset.count);
      ScrollTrigger.create({
        trigger: b, start: 'top 88%', once: true,
        onEnter: function () {
          gsap.fromTo(b, { textContent: 0 },
            { textContent: to, duration: 1.5, ease: 'power2.out', snap: { textContent: 1 } });
        }
      });
    });

    gsap.from('.manifest__grid', {
      opacity: 0, y: 40, duration: .9, ease: 'power2.out',
      scrollTrigger: { trigger: '.manifest__grid', start: 'top 85%' }
    });
  })();

  /* ═══ АРЕНА — 3D-КОЛЬЦО ═══════════════════════════════════ */
  (function arena() {
    var scene = $('#ringScene'), ring = $('#ring');
    if (!scene || !ring) return;
    var cards = $$('.cat', ring);
    var N = cards.length, STEP = 360 / N;
    var label = $('#ringLabel'), bar = $('#ringBar');
    var names = cards.map(function (c) { return $('h3', c).textContent; });

    function setRadius() {
      var w = cards[0].offsetWidth || 240;
      var r = Math.round((w / 2) / Math.tan(Math.PI / N) * 1.22);
      ring.style.setProperty('--rad', r + 'px');   /* наследуется карточками */
    }
    setRadius();
    window.addEventListener('resize', setRadius);

    if (reduced || isNarrow()) {
      cards.forEach(function (c) { c.classList.add('is-front'); });
      return;
    }

    var rot = 0, vel = 0, drag = false, lastX = 0, scrollRot = 0, autoOn = true, active = -1;

    function paint() {
      ring.style.setProperty('--ry', (rot + scrollRot).toFixed(2) + 'deg');
      var total = rot + scrollRot;
      var idx = ((Math.round(-total / STEP) % N) + N) % N;
      if (idx !== active) {
        active = idx;
        cards.forEach(function (c, i) { c.classList.toggle('is-front', i === idx); });
        if (label) label.textContent = names[idx];
        if (bar) bar.style.transform = 'translateX(' + (idx * 100) + '%)';
      }
    }

    gsap.ticker.add(function () {
      if (!drag) {
        if (autoOn) rot -= .09;
        rot += vel;
        vel *= .93;
      }
      paint();
    });

    scene.addEventListener('pointerdown', function (e) {
      drag = true; lastX = e.clientX; autoOn = false;
      scene.classList.add('is-drag');
      scene.setPointerCapture(e.pointerId);
    });
    scene.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var d = (e.clientX - lastX) * .32;
      rot += d; vel = d * .5; lastX = e.clientX;
    });
    function endDrag(e) {
      if (!drag) return;
      drag = false;
      scene.classList.remove('is-drag');
      try { scene.releasePointerCapture(e.pointerId); } catch (err) {}
      setTimeout(function () { autoOn = true; }, 1400);
    }
    scene.addEventListener('pointerup', endDrag);
    scene.addEventListener('pointercancel', endDrag);

    /* камера едет внутрь арены + кольцо доворачивается по скроллу */
    ScrollTrigger.create({
      trigger: '.arena', start: 'top top', end: 'bottom bottom', scrub: .6,
      onUpdate: function (self) {
        var p = self.progress;
        scrollRot = -p * 300;
        var rx = -4 + Math.sin(p * Math.PI) * 16;
        ring.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        scene.style.setProperty('--po', (52 + Math.sin(p * Math.PI) * 22).toFixed(1) + '%');
        gsap.set('.arena__floor', { opacity: .35 + Math.sin(p * Math.PI) * .65 });
      }
    });

    gsap.fromTo('.arena__title',
      { letterSpacing: '.14em', opacity: .35 },
      {
        letterSpacing: '-.03em', opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.arena', start: 'top top', end: '25% top', scrub: .5 }
      });
  })();

  /* ═══ ВИТРИНА ═════════════════════════════════════════════ */
  gsap.from('.prod', {
    opacity: 0, y: 46, duration: .85, ease: 'power3.out', stagger: { each: .07, grid: 'auto', from: 'start' },
    scrollTrigger: { trigger: '.stock__grid', start: 'top 82%' }
  });

  /* ═══ АКЦИИ — горизонтальный проезд ═══════════════════════ */
  (function deals() {
    var rail = $('#dealsRail');
    if (!rail || reduced) return;
    ScrollTrigger.create({
      trigger: '.deals', start: 'top bottom', end: 'bottom top', scrub: .7,
      onUpdate: function (self) {
        var over = rail.scrollWidth - window.innerWidth;
        if (over <= 0) return;
        gsap.set(rail, { x: -over * self.progress * .82 });
      }
    });
    $$('.deal').forEach(function (d, i) {
      gsap.fromTo(d, { rotate: i % 2 ? 1.5 : -1.5, y: 30, opacity: 0 },
        {
          rotate: 0, y: 0, opacity: 1, duration: .8, ease: 'power3.out',
          scrollTrigger: { trigger: '.deals__rail', start: 'top 88%' }, delay: i * .06
        });
    });
  })();

  /* ═══ ВИЗОР ═══════════════════════════════════════════════ */
  (function visor() {
    var sec = $('.visor');
    if (!sec || reduced || isNarrow()) return;
    var shades = $$('.visor__shade');
    var content = $('.visor__content');

    gsap.set(content, { opacity: 0, y: 40 });

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .5,
      onUpdate: function (self) {
        var p = self.progress;
        var open = clamp(p / .5, 0, 1);              // 0 → закрыт, 1 → открыт
        var e = 1 - Math.pow(1 - open, 3);
        shades.forEach(function (s) { s.style.setProperty('--sh', (-e * 100).toFixed(2) + '%'); });
        gsap.set('.visor__img', { scale: 1.1 - e * .08, yPercent: (1 - e) * 4 });
        var reveal = clamp((p - .28) / .32, 0, 1);
        gsap.set(content, { opacity: reveal, y: 40 - reveal * 40 });
      }
    });

    gsap.from('.svc__item', {
      opacity: 0, y: 26, duration: .7, ease: 'power2.out', stagger: .1,
      scrollTrigger: { trigger: sec, start: '38% top' }
    });
  })();

  /* ═══ ЖУРНАЛ ══════════════════════════════════════════════ */
  $$('.post').forEach(function (p, i) {
    gsap.fromTo($('.post__media', p),
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)', duration: 1.15, ease: 'expo.out', delay: i * .12,
        scrollTrigger: { trigger: p, start: 'top 82%' }
      });
    gsap.from($('.post__body', p), {
      opacity: 0, y: 28, duration: .8, ease: 'power2.out', delay: .18 + i * .12,
      scrollTrigger: { trigger: p, start: 'top 82%' }
    });
  });

  /* ═══ ЗАГОЛОВКИ СЕКЦИЙ ════════════════════════════════════ */
  $$('.sec-head, .deals__head, .lead__copy').forEach(function (h) {
    gsap.from(h, {
      opacity: 0, y: 34, duration: .85, ease: 'power3.out',
      scrollTrigger: { trigger: h, start: 'top 88%' }
    });
  });

  /* ═══ ПОДВАЛ — заливка вордмарка ══════════════════════════ */
  (function footMark() {
    var fill = $('#footFill');
    if (!fill) return;
    ScrollTrigger.create({
      trigger: '.foot__mark', start: 'top 92%', end: 'bottom 60%', scrub: .5,
      onUpdate: function (self) {
        fill.style.clipPath = 'inset(0 ' + ((1 - self.progress) * 100).toFixed(1) + '% 0 0)';
      }
    });
  })();

  /* ═══ ТАХОМЕТР ПРОГРЕССА ══════════════════════════════════ */
  (function gauge() {
    var g = $('#gauge'), arc = $('#gaugeArc'), needle = $('#gaugeNeedle'), val = $('#gaugeVal');
    if (!g) return;

    var ticks = $('#gaugeTicks'), html = '';
    for (var i = 0; i <= 24; i++) {
      var a = (-120 + i * 10) * Math.PI / 180;
      var r2 = i % 6 === 0 ? 26 : 29;
      html += '<line class="' + (i > 19 ? 'hot' : '') + '"' +
        ' x1="' + (44 + Math.sin(a) * 32).toFixed(1) + '" y1="' + (44 - Math.cos(a) * 32).toFixed(1) +
        '" x2="' + (44 + Math.sin(a) * r2).toFixed(1) + '" y2="' + (44 - Math.cos(a) * r2).toFixed(1) + '"/>';
    }
    ticks.innerHTML = html;

    ScrollTrigger.create({
      start: 0, end: 'max', scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        /* прячем у подвала, иначе наезжает на реквизиты */
        g.classList.toggle('is-on', p > 0.035 && p < 0.955);
        arc.style.strokeDashoffset = String(226 - 226 * p);
        needle.style.transform = 'rotate(' + (-120 + p * 240) + 'deg)';
        val.textContent = Math.round(p * 100);
        g.classList.toggle('is-red', p > 0.82);
      }
    });
  })();

  /* ═══ КУРСОР + МАГНИТ ═════════════════════════════════════ */
  (function cursor() {
    var c = $('#cur');
    if (!c || isTouch || reduced) { if (c) c.remove(); return; }
    var x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;

    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      c.style.opacity = '1';
    });
    document.addEventListener('pointerleave', function () { c.style.opacity = '0'; });

    gsap.ticker.add(function () {
      x = lerp(x, tx, .22); y = lerp(y, ty, .22);
      c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    });

    var HOT = 'a, button, [data-magnet], .prod, .deal, .cat';
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest && e.target.closest(HOT)) c.classList.add('is-hot');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest && e.target.closest(HOT)) c.classList.remove('is-hot');
    });

    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * .28,
          y: (e.clientY - r.top - r.height / 2) * .32,
          duration: .5, ease: 'power3.out'
        });
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' });
      });
    });
  })();

  /* ═══ ОТЗЫВЫ ══════════════════════════════════════════════ */
  (function reviews() {
    var rowA = $('#revRowA'), rowB = $('#revRowB');
    if (!rowA) return;

    /* реальные отзывы с Яндекс.Карт, приведены с сокращениями */
    var REVS = [
      ['Андрей Подкуйко', '20 мая', 'Покупал дистанционно, из Перми. Общался с менеджером Никитой. Никита всегда на связи — 24×7, подробно ответит на любой вопрос. Вместе с мотоциклом пришёл полный комплект документов. Всё грамотно, профессионально, быстро.'],
      ['Дмитрий Чуянов', '27 марта', 'Покупал мотоцикл удалённо из Самары. Присылал подробные видеообзоры по всем действиям с мотоциклом, сразу подобрал по размеру чехол, подготовил документы для постановки на учёт. Всё сделано быстро и профессионально.'],
      ['Andrew Deshenia', '26 марта', 'Покупал свой первый мотоцикл в МотоАрене. Очень большой выбор на любой вкус и кошелёк, мотоциклы ухоженные, качественно подготовлены к продаже. Атмосфера доброжелательная, консультанты приветливые.'],
      ['Alexander V.', '18 июня', 'Приобрёл Harley-Davidson Road King. Живу в Орле, весь процесс проходил удалённо: полный видеообзор перед договором, ТО оригинальными расходниками. Доставка из Минска — 4 дня. Мотоцикл приехал полностью готовым.'],
      ['Сергей Гундерак', '10 ноября', 'В 2022 году покупал у них свой первый мотоцикл. В этом году сдал его же на комиссию — оценили, аргументированно предложили адекватную цену и продали всего за одну неделю. Рекомендую и по покупке, и по продаже.'],
      ['Антон П.', '23 сентября', 'Огромное спасибо команде «МотоАрены»! Помогли выбрать крутой CFMOTO 450CL-C, а сегодня сделали ТО в день обращения. Сервис на высоте, персонал отзывчивый, атмосфера — лучшая в городе.'],
      ['Надежда Чепуркова', '20 декабря', 'Долго выбираю себе первый мотоцикл. Специалисты знают мой рост, вес и предпочтения — периодически звонят и сообщают о появлении подходящей модели. Спасибо, что помнят, и за терпение!'],
      ['Дима Романчик', '6 июня', 'Хочу выразить огромную благодарность работникам «МотоАрены» за качественный, профессиональный ремонт регулировки клапанов на мотоцикле Bajaj Dominar 400. Ребята, огромное вам спасибо.'],
      ['Александр Петух', '3 марта', 'Привозил Harley из США — всё в сроки, сопровождение клиента до выдачи мотоцикла. Сервис помог обслужить и поставить на ход. Расходники есть и оригинальные, и бюджетные заменители.'],
      ['Мила Б.', '22 ноября', 'Очень приятные и компетентные ребята, помогли с выбором шлема, всё объяснили, приняли заказ и оформили доставку. Шлем пришёл, я очень рада покупке, огромное спасибо за вашу работу.']
    ];

    var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1l2.6 5.7 6.2.7-4.6 4.2 1.2 6.1L10 14.8 4.6 17.7l1.2-6.1L1.2 7.4l6.2-.7z"/></svg>';

    function card(r) {
      var el = document.createElement('article');
      el.className = 'rev';
      el.innerHTML =
        '<div class="rev__stars">' + STAR + STAR + STAR + STAR + STAR + '</div>' +
        '<p class="rev__txt">' + r[2] + '</p>' +
        '<div class="rev__who">' +
          '<span class="rev__ava">' + r[0].charAt(0) + '</span>' +
          '<span><span class="rev__name">' + r[0] + '</span>' +
          '<span class="rev__date">' + r[1] + '</span></span>' +
        '</div>';
      return el;
    }

    function fill(row, list) {
      var unit = document.createElement('div');
      unit.style.display = 'flex';
      unit.style.gap = '16px';
      list.forEach(function (r) { unit.appendChild(card(r)); });
      row.appendChild(unit);
      row.appendChild(unit.cloneNode(true));
    }
    fill(rowA, REVS.slice(0, 5));
    fill(rowB, REVS.slice(5));

    /* бесконечная прокрутка лент, пауза при наведении */
    var rails = $$('[data-rev-rail]').map(function (t) {
      var r = { row: $('.revs__row', t), dir: parseFloat(t.dataset.dir || '1'), x: 0, w: 0, hold: false };
      t.addEventListener('pointerenter', function () { r.hold = true; });
      t.addEventListener('pointerleave', function () { r.hold = false; });
      return r;
    });
    function measure() { rails.forEach(function (r) { r.w = r.row.scrollWidth / 2; }); }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    if (!reduced) {
      gsap.ticker.add(function () {
        rails.forEach(function (r) {
          if (!r.w || r.hold) return;
          r.x -= 0.42 * r.dir;
          if (r.x <= -r.w) r.x += r.w;
          if (r.x > 0) r.x -= r.w;
          r.row.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0)';
        });
      });
    }

    /* шкала рейтинга */
    var fillPath = $('#scoreFill'), valEl = $('#scoreVal');
    var ticks = $('#scoreTicks');
    if (ticks) {
      var NS = 'http://www.w3.org/2000/svg';
      for (var i = 0; i <= 10; i++) {
        var a = Math.PI - (i / 10) * Math.PI;
        var l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', (100 + Math.cos(a) * 68).toFixed(1));
        l.setAttribute('y1', (118 - Math.sin(a) * 68).toFixed(1));
        l.setAttribute('x2', (100 + Math.cos(a) * (i % 5 === 0 ? 57 : 62)).toFixed(1));
        l.setAttribute('y2', (118 - Math.sin(a) * (i % 5 === 0 ? 57 : 62)).toFixed(1));
        ticks.appendChild(l);
      }
    }

    var stt = { trigger: '.revs__score', start: 'top 82%', once: true };
    var s = { v: 0 };
    gsap.to(s, {
      v: 5, duration: 1.6, ease: 'power2.out', scrollTrigger: stt,
      onUpdate: function () {
        valEl.textContent = s.v.toFixed(1).replace('.', ',');
        if (fillPath) fillPath.style.strokeDashoffset = String(258 - 258 * (s.v / 5));
      }
    });

    $$('.bars li').forEach(function (li, n) {
      var b = $('b', li), em = $('em', li), pct = parseFloat(b.dataset.pct);
      var o = { v: 0 };
      gsap.to(o, {
        v: pct, duration: 1.3, ease: 'power2.out', delay: n * .1,
        scrollTrigger: { trigger: '.bars', start: 'top 86%', once: true },
        onUpdate: function () {
          b.style.width = o.v.toFixed(1) + '%';
          em.textContent = Math.round(o.v) + '%';
        }
      });
    });

    gsap.from('.rev', {
      opacity: 0, y: 30, duration: .7, ease: 'power3.out', stagger: .04,
      scrollTrigger: { trigger: '.revs__rail', start: 'top 88%', once: true }
    });
  })();

  /* ═══ КАРТА ═══════════════════════════════════════════════ */
  (function geo() {
    var map = $('#geoMap');
    if (!map) return;

    /* сетка прицела поверх карты */
    var g = $('#geoGridLines');
    if (g) {
      /* innerHTML внутри SVG создаёт узлы в HTML-namespace и не рисуется — только createElementNS */
      var NS = 'http://www.w3.org/2000/svg', i;
      var line = function (a, b, c, d) {
        var l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', a); l.setAttribute('y1', b);
        l.setAttribute('x2', c); l.setAttribute('y2', d);
        g.appendChild(l);
      };
      for (i = 0; i <= 1280; i += 80) line(i, 0, i, 768);
      for (i = 0; i <= 768; i += 80) line(0, i, 1280, i);
    }

    var st = { trigger: '.geo__body', start: 'top 82%' };
    gsap.from(map, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: st });
    gsap.from('.geo__card', { opacity: 0, y: 40, duration: 1, ease: 'power3.out', delay: .12, scrollTrigger: st });
    gsap.from('.tag', { opacity: 0, x: -14, duration: .7, ease: 'power2.out', stagger: .14, delay: .5, scrollTrigger: st });

    /* кольца дистанций расходятся от магазина */
    $$('.geo__rings .rg').forEach(function (c, n) {
      var r = c.getAttribute('r');
      gsap.fromTo(c, { attr: { r: 0 }, opacity: 0 },
        {
          attr: { r: r }, opacity: 1, duration: 1.1, ease: 'power2.out',
          delay: .35 + n * .16, scrollTrigger: st
        });
    });

    if (reduced || isTouch) return;

    /* карта смещается за курсором — «камера над районом» */
    var tiles = $('.geo__tiles', map);
    var tx = 0, ty = 0, cx = 0, cy = 0, live = false;

    map.addEventListener('pointermove', function (e) {
      var r = map.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * -30;
      ty = ((e.clientY - r.top) / r.height - .5) * -22;
      live = true;
    });
    map.addEventListener('pointerleave', function () { tx = 0; ty = 0; });

    gsap.ticker.add(function () {
      if (!live) return;
      cx = lerp(cx, tx, .07); cy = lerp(cy, ty, .07);
      tiles.style.translate = cx.toFixed(2) + 'px ' + cy.toFixed(2) + 'px';
    });
  })();

  /* ═══ ФОРМА ═══════════════════════════════════════════════ */
  (function form() {
    var f = $('#leadForm'), ok = $('#leadOk');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) {
        f.reportValidity();
        gsap.fromTo(f, { x: -8 }, { x: 0, duration: .6, ease: 'elastic.out(1,.35)' });
        return;
      }
      var btn = $('button[type="submit"]', f);
      btn.disabled = true;
      $('span', btn).textContent = 'Отправляем…';
      setTimeout(function () {
        f.reset();
        btn.disabled = false;
        $('span', btn).textContent = 'Отправить заявку';
        ok.hidden = false;
        gsap.fromTo(ok, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' });
        gsap.fromTo(f, { boxShadow: 'inset 0 0 0 1px rgba(255,77,10,.9), 0 40px 80px -40px #000' },
          { boxShadow: 'inset 0 0 0 1px rgba(237,235,230,.18), 0 40px 80px -40px #000', duration: 1.2 });
      }, 700);
    });
  })();

  /* ═══ СТАРТ ═══════════════════════════════════════════════ */
  if (lenis) lenis.stop();

  /* во вкладке в фоне браузер душит rAF — ждём, пока на страницу посмотрят */
  function whenVisible(fn) {
    if (!document.hidden) return fn();
    var h = function () {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', h);
      fn();
    };
    document.addEventListener('visibilitychange', h);
  }

  var fired = false;
  function boot() {
    if (fired) return;
    fired = true;
    whenVisible(ignite);
  }
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
    setTimeout(boot, 120);
  });
  setTimeout(boot, 4200);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) ScrollTrigger.refresh();
  });

  window.addEventListener('resize', function () {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
  });
  document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
})();
