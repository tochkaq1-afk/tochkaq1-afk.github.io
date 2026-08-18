/* ═══════════════════════════════════════════════════════════
   МОТОАРЕНА — каталог
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var DATA = (window.CATALOG || []).map(function (it, i) {
    return {
      i: i, cat: it.cat, catName: it.catName, name: it.name, brand: it.brand || '',
      link: it.link, img: it.img, priceTxt: it.price, oldTxt: it.old || '',
      cut: it.cut !== 0,
      num: parseFloat(String(it.price).replace(/\s/g, '').replace(',', '.')) || 0,
      sale: !!it.old,
      hay: (it.name + ' ' + (it.brand || '') + ' ' + it.catName).toLowerCase()
    };
  });

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (!reduced && typeof Lenis === 'function') {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── категории и бренды ─────────────────────────────────── */
  var ORDER = ['moto', 'helmets', 'clothes', 'boots', 'tuning', 'gifts', 'chem', 'parts'];
  var cats = {}, brands = {};
  DATA.forEach(function (d) {
    cats[d.cat] = { key: d.cat, name: d.catName, n: (cats[d.cat] ? cats[d.cat].n : 0) + 1 };
    if (d.brand) brands[d.brand] = (brands[d.brand] || 0) + 1;
  });
  var CATS = ORDER.filter(function (k) { return cats[k]; }).map(function (k) { return cats[k]; });
  var BRANDS = Object.keys(brands).sort(function (a, b) { return brands[b] - brands[a]; });

  var state = { cat: 'all', brand: '', q: '', sort: 'pop', page: 1 };
  var PER = 24;

  /* ── чипсы ──────────────────────────────────────────────── */
  var chipBox = $('#catChips'), brandBox = $('#brandChips');

  function chip(label, count, key, active) {
    var b = document.createElement('button');
    b.className = 'chip' + (active ? ' is-on' : '');
    b.type = 'button';
    b.dataset.key = key;
    b.innerHTML = '<span>' + label + '</span>' + (count != null ? '<i>' + count + '</i>' : '');
    return b;
  }

  chipBox.appendChild(chip('Всё', DATA.length, 'all', true));
  CATS.forEach(function (c) { chipBox.appendChild(chip(c.name, c.n, c.key, false)); });

  BRANDS.forEach(function (b) {
    var el = document.createElement('button');
    el.className = 'bchip';
    el.type = 'button';
    el.dataset.brand = b;
    el.textContent = b;
    brandBox.appendChild(el);
  });

  chipBox.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    state.cat = b.dataset.key;
    state.page = 1;
    $$('.chip', chipBox).forEach(function (c) { c.classList.toggle('is-on', c === b); });
    syncHash();
    render(true);
  });

  brandBox.addEventListener('click', function (e) {
    var b = e.target.closest('.bchip');
    if (!b) return;
    state.brand = state.brand === b.dataset.brand ? '' : b.dataset.brand;
    state.page = 1;
    $$('.bchip', brandBox).forEach(function (c) {
      c.classList.toggle('is-on', c.dataset.brand === state.brand);
    });
    render(true);
  });

  var qEl = $('#q'), tq = null;
  qEl.addEventListener('input', function () {
    clearTimeout(tq);
    tq = setTimeout(function () { state.q = qEl.value.trim().toLowerCase(); state.page = 1; render(true); }, 180);
  });

  $('#sort').addEventListener('change', function (e) { state.sort = e.target.value; state.page = 1; render(true); });

  $('#reset').addEventListener('click', function () {
    state = { cat: 'all', brand: '', q: '', sort: 'pop', page: 1 };
    qEl.value = ''; $('#sort').value = 'pop';
    $$('.chip', chipBox).forEach(function (c) { c.classList.toggle('is-on', c.dataset.key === 'all'); });
    $$('.bchip', brandBox).forEach(function (c) { c.classList.remove('is-on'); });
    syncHash();
    render(true);
  });

  $('#more').addEventListener('click', function () { state.page++; render(false); });

  /* ── выборка ────────────────────────────────────────────── */
  function pick() {
    var out = DATA.filter(function (d) {
      if (state.cat !== 'all' && d.cat !== state.cat) return false;
      if (state.brand && d.brand !== state.brand) return false;
      if (state.q && d.hay.indexOf(state.q) < 0) return false;
      return true;
    });
    var s = state.sort;
    if (s === 'asc') out.sort(function (a, b) { return a.num - b.num; });
    else if (s === 'desc') out.sort(function (a, b) { return b.num - a.num; });
    else if (s === 'az') out.sort(function (a, b) { return a.name.localeCompare(b.name, 'ru'); });
    else if (s === 'sale') out.sort(function (a, b) { return (b.sale - a.sale) || a.num - b.num; });
    return out;
  }

  function card(d) {
    var a = document.createElement('a');
    /* с вырезанным фоном товар «парит» на подиуме, иначе показываем как фотокарточку */
    a.className = 'ware ' + (d.cut ? 'ware--cut' : 'ware--photo') + (d.cat === 'moto' ? ' ware--moto' : '');
    a.href = d.link;
    a.target = '_blank';
    a.rel = 'noopener';
    var off = '';
    if (d.sale) {
      var o = parseFloat(d.oldTxt.replace(/\s/g, '').replace(',', '.'));
      if (o > d.num) off = '−' + Math.round((1 - d.num / o) * 100) + '%';
    }
    a.innerHTML =
      '<div class="ware__stage">' +
        '<img src="' + d.img + '" alt="' + d.name.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async">' +
      '</div>' +
      (off ? '<span class="ware__badge">' + off + '</span>' : '') +
      '<div class="ware__info">' +
        (d.brand ? '<span class="ware__brand">' + d.brand + '</span>' : '<span class="ware__brand ware__brand--dim">' + d.catName + '</span>') +
        '<h3>' + d.name + '</h3>' +
        '<p class="ware__price"><b>' + d.priceTxt + '</b> BYN' +
          (d.sale ? ' <s>' + d.oldTxt + '</s>' : '') + '</p>' +
      '</div>';
    return a;
  }

  var grid = $('#grid'), empty = $('#empty'), more = $('#more'), shown = $('#shown');

  function render(fresh) {
    var list = pick();
    var end = state.page * PER;
    var slice = list.slice(0, end);

    if (fresh) grid.innerHTML = '';
    var from = fresh ? 0 : grid.children.length;
    var frag = document.createDocumentFragment();
    for (var i = from; i < slice.length; i++) frag.appendChild(card(slice[i]));
    var added = Array.prototype.slice.call(frag.children);
    grid.appendChild(frag);

    if (!reduced && added.length) {
      gsap.from(added, { opacity: 0, y: 26, duration: .55, ease: 'power3.out', stagger: .025, overwrite: true });
    }

    empty.hidden = list.length !== 0;
    more.parentElement.hidden = slice.length >= list.length;
    shown.textContent = list.length
      ? 'Показано ' + slice.length + ' из ' + list.length
      : 'Ничего не найдено';
    $('#reset').hidden = state.cat === 'all' && !state.brand && !state.q && state.sort === 'pop';
    ScrollTrigger.refresh();
  }

  /* ── адрес вида catalog.html#c=moto ─────────────────────── */
  function syncHash() {
    var h = state.cat === 'all' ? '' : '#c=' + state.cat;
    if (history.replaceState) history.replaceState(null, '', location.pathname + h);
  }
  function fromHash() {
    var m = /c=([a-z]+)/.exec(location.hash || '');
    if (!m || !cats[m[1]]) return;
    state.cat = m[1];
    $$('.chip', chipBox).forEach(function (c) { c.classList.toggle('is-on', c.dataset.key === state.cat); });
  }
  fromHash();
  window.addEventListener('hashchange', function () { fromHash(); state.page = 1; render(true); });

  render(true);

  /* ── шапка / меню ───────────────────────────────────────── */
  var burger = $('#burger'), menu = $('#menu'), open = false, tl = null;
  function buildTl() {
    return gsap.timeline({ paused: true })
      .set(menu, { display: 'grid' })
      .fromTo('.menu__bg', { scaleY: 0 }, { scaleY: 1, duration: .7, ease: 'expo.inOut' })
      .fromTo('.menu__list a', { y: '110%' }, { y: '0%', duration: .8, ease: 'expo.out', stagger: .055 }, '-=.3')
      .fromTo('.menu__meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6 }, '-=.5');
  }
  burger.addEventListener('click', function () {
    open = !open;
    document.body.classList.toggle('is-menu', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!tl) tl = buildTl();
    if (open) { menu.hidden = false; if (lenis) lenis.stop(); tl.play(0); }
    else { if (lenis) lenis.start(); tl.reverse().eventCallback('onReverseComplete', function () { menu.hidden = true; }); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) burger.click(); });

  /* ── обложка каталога ───────────────────────────────────── */
  if (!reduced) {
    gsap.to('.cat-hero__title b', { y: '0%', duration: 1.05, ease: 'expo.out', stagger: .04, delay: .1 });
    gsap.from('.cat-hero__lede', { opacity: 0, y: 20, duration: .8, ease: 'power2.out', delay: .5 });
    gsap.from('.cat-bar', { opacity: 0, y: 18, duration: .7, ease: 'power2.out', delay: .6 });
  } else {
    gsap.set('.cat-hero__title b', { y: '0%' });
  }

  /* панель прилипает */
  ScrollTrigger.create({
    trigger: '.cat-bar', start: 'top 8',
    onToggle: function (self) { $('#catBar').classList.toggle('is-pinned', self.isActive); }
  });

  /* ── курсор ─────────────────────────────────────────────── */
  (function cursor() {
    var c = $('#cur');
    if (!c || isTouch || reduced) { if (c) c.remove(); return; }
    var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; c.style.opacity = '1'; });
    gsap.ticker.add(function () {
      x = lerp(x, tx, .22); y = lerp(y, ty, .22);
      c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    });
    var HOT = 'a, button, input, select, .ware, .chip, .bchip';
    document.addEventListener('pointerover', function (e) { if (e.target.closest(HOT)) c.classList.add('is-hot'); });
    document.addEventListener('pointerout', function (e) { if (e.target.closest(HOT)) c.classList.remove('is-hot'); });
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .3, duration: .5, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }); });
    });
  })();
})();
