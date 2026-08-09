/* ==========================================================
   Nuvelle — SALE −60%
   Вёрстка по мотивам Wibe Studio (CodeBucks): Locomotive-скролл,
   параллакс, шторка-меню. Здесь всё то же самое, но без React —
   чистый JS, свой плавный скролл и свой курсор.
   ========================================================== */

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 0. Личный кабинет (Supabase) ---------- */
const supa = supabase.createClient(
  'https://dowstjqhxudhtpjrmiuk.supabase.co',
  'sb_publishable_ai5F1LY-A1EAh8FU-WnzmQ_xp79ye6l'
);
let authUser = null;
supa.auth.getSession().then(({ data }) => { authUser = data.session?.user || null; markUserIcon(); });
supa.auth.onAuthStateChange((_evt, session) => {
  authUser = session?.user || null;
  markUserIcon();
  if (document.getElementById('drawer').classList.contains('open') && drawerTitle.textContent.includes('кабинет')) drawUser();
});
function markUserIcon() {
  document.getElementById('btnUser').classList.toggle('is-in', !!authUser);
}

/* ---------- 1. Курсор: шлейф из 8 точек ---------- */
const cursor = document.getElementById('cursor');
const DOTS = 14;
const dots = [];
if (matchMedia('(hover:hover)').matches) {
  for (let i = 0; i < DOTS; i++) {
    const d = document.createElement('i');
    const s = 13 - i * 0.72;
    d.style.width = d.style.height = s.toFixed(1) + 'px';
    d.style.opacity = 1 - i * 0.055;
    cursor.appendChild(d);
    dots.push({ el: d, x: innerWidth / 2, y: innerHeight / 2 });
  }
}
let mx = innerWidth / 2, my = innerHeight / 2;
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

function cursorFrame() {
  let ax = mx, ay = my;
  dots.forEach((d, i) => {
    d.x = lerp(d.x, ax, 0.34 - i * 0.022);
    d.y = lerp(d.y, ay, 0.34 - i * 0.022);
    d.el.style.transform = `translate(${d.x}px, ${d.y}px) translate(-50%,-50%)`;
    ax = d.x; ay = d.y;
  });
}

/* курсор работает в режиме инверсии (mix-blend-mode: difference),
   поэтому подстраивать цвет под секции не нужно */

/* ---------- 2. Плавный скролл ---------- */
let target = 0, current = 0;
const app = document.getElementById('app');
function initScroll() {
  document.body.style.height = app.getBoundingClientRect().height + 'px';
  app.style.position = 'fixed';
  app.style.top = '0';
  app.style.left = '0';
  app.style.width = '100%';
  app.style.willChange = 'transform';
}
addEventListener('scroll', () => { target = scrollY; }, { passive: true });
addEventListener('resize', () => { document.body.style.height = app.getBoundingClientRect().height + 'px'; });

/* ---------- 3. Параллакс ---------- */
const speedEls = [...document.querySelectorAll('[data-speed]')];
function parallax() {
  speedEls.forEach(el => {
    const sp = parseFloat(el.dataset.speed);
    const box = el.getBoundingClientRect();
    const mid = box.top + box.height / 2 - innerHeight / 2;
    const shift = -(mid / innerHeight) * sp * 26;
    el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
  });
}

/* ---------- 4. Бегущие строки ---------- */
const marquees = [...document.querySelectorAll('[data-marquee]')].map(el => ({
  el, dir: parseFloat(el.dataset.marquee), x: 0, w: 0
}));
function measureMarquees() { marquees.forEach(m => m.w = m.el.scrollWidth / 2); }
function marqueeFrame(dt) {
  marquees.forEach(m => {
    m.x -= m.dir * dt * 0.045;
    if (m.w && Math.abs(m.x) > m.w) m.x += m.dir > 0 ? -m.w * Math.sign(m.x) : m.w * -Math.sign(m.x) * -1;
    if (m.w) m.x = ((m.x % m.w) + m.w) % m.w - m.w;
    m.el.style.transform = `translate3d(${m.x.toFixed(2)}px,0,0)`;
  });
}

/* ---------- 5. Главный кадр ---------- */
const hero = document.querySelector('.hero');
const heroLetters = [...document.querySelectorAll('.hero__title span')];
function heroFrame() {
  const p = clamp(current / innerHeight, 0, 1);
  hero.classList.toggle('lifted', p > 0.04);
  heroLetters.forEach((s, i) => {
    const d = parseFloat(s.dataset.delay);
    s.style.transform = `translate3d(0, ${(-p * 260 * (1 + d * 2)).toFixed(1)}px, 0)`;
    s.style.opacity = String(1 - p * 1.1);
  });
}

/* вход букв после прелоадера */
function heroIntro() {
  heroLetters.forEach((s, i) => {
    s.animate(
      [{ transform: 'translateY(120%) rotate(6deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 1200, delay: 120 * i, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'both' }
    );
  });
  document.querySelector('.hero__sub').animate(
    [{ opacity: 0, letterSpacing: '1.2em' }, { opacity: 1, letterSpacing: '.42em' }],
    { duration: 1600, delay: 700, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'both' }
  );
}

/* ---------- 6. Меню-шторка ---------- */
const menu = document.getElementById('menu');
document.getElementById('menuTab').addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  document.getElementById('menuTab').setAttribute('aria-expanded', String(open));
  document.querySelector('.menu__tabtext').textContent = open ? 'закрыть' : 'меню';
});
document.querySelectorAll('[data-nav]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const t = document.querySelector(a.getAttribute('href'));
  if (!t) return;
  menu.classList.remove('open');
  document.querySelector('.menu__tabtext').textContent = 'меню';
  if (a.dataset.cat) applyCat(a.dataset.cat);
  scrollTo({ top: t.getBoundingClientRect().top + current, behavior: 'smooth' });
}));

/* ---------- 6b. Верхняя панель ---------- */
const bar = document.getElementById('bar');
function barFrame() {
  bar.classList.toggle('show', current > innerHeight * 0.85);
}

const barBurger = document.getElementById('barBurger');
barBurger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  barBurger.classList.toggle('x', open);
  barBurger.querySelector('span').textContent = open ? 'Закрыть' : 'Меню';
  document.querySelector('.menu__tabtext').textContent = open ? 'закрыть' : 'меню';
});

let bag = 0;
const bagCount = document.getElementById('bagCount');

/* ---------- 7. Барабанные цифры (как NumberFlow) ---------- */
const ROLL_EASE = 'cubic-bezier(.16,1,.3,1)';
function rollNumber(el, to, dur = 1100) {
  const str = String(to);
  el.textContent = '';
  el.style.display = 'inline-flex';
  [...str].forEach((ch, i) => {
    if (!/\d/.test(ch)) { el.insertAdjacentHTML('beforeend', `<b style="font-weight:inherit">${ch}</b>`); return; }
    const slot = document.createElement('span');
    slot.style.cssText = 'display:inline-block;overflow:hidden;height:1em;line-height:1';
    const col = document.createElement('span');
    col.style.cssText = 'display:block;will-change:transform';
    const target = +ch;
    for (let n = 0; n <= target + 10; n++) {
      const d = document.createElement('span');
      d.style.cssText = 'display:block;height:1em;line-height:1';
      d.textContent = String(n % 10);
      col.appendChild(d);
    }
    slot.appendChild(col);
    el.appendChild(slot);
    requestAnimationFrame(() => {
      col.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(-${(target + 10)}em)` }],
        { duration: dur + i * 90, easing: ROLL_EASE, fill: 'forwards' }
      );
    });
  });
}

/* ---------- 8. Появление блоков + разбивка заголовков ---------- */
document.querySelectorAll('[data-split]').forEach(h => {
  /* режем на буквы, но слова не рвём по переносу */
  h.innerHTML = h.textContent.trim().split(' ').map(word =>
    `<span class="wd">${[...word].map(c => `<span class="ch">${c}</span>`).join('')}</span>`
  ).join(' ');
  [...h.querySelectorAll('.ch')].forEach((c, i) => c.style.transitionDelay = (i * 45) + 'ms');
});

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    const roll = e.target.matches('[data-roll]') ? e.target : e.target.querySelector('[data-roll]');
    if (roll && !roll.dataset.done) { roll.dataset.done = '1'; rollNumber(roll, +roll.dataset.roll); }
    io.unobserve(e.target);
  });
}, { threshold: 0.18 });

/* ---------- 9. Каталог ---------- */
const grid = document.getElementById('grid');
const stage = {
  frame: document.querySelector('.stage__frame'),
  a: document.getElementById('stageA'),
  b: document.getElementById('stageB'),
  img: document.getElementById('stageImg'),
  name: document.getElementById('stageName'),
  price: document.getElementById('stagePrice'),
  old: document.getElementById('stageOld')
};
let items = [], cards = [], activeId = null;

const GROUPS = [
  ['все', () => true],
  ['худи и свитшоты', n => /худи|свитшот/i.test(n)],
  ['джемперы', n => /джемпер|свитер|кардиган/i.test(n)],
  ['топы', n => /топ/i.test(n)],
  ['брюки', n => /брюк|джоггер/i.test(n)],
  ['куртки', n => /куртк/i.test(n)]
];

document.getElementById('stageOpen').addEventListener('click', () => {
  const p = items.find(x => x.id === activeId);
  if (p) openPdp(p);
});

fetch('catalog.json?v=' + Date.now())
  .then(r => r.json())
  .then(data => {
    items = data;
    buildFilters();
    buildFilterUI();
    render(items);
    /* стартуем с самого длинного ролика — он дольше держит кадр */
    const longest = items.find(i => i.id === '71959') || items.find(i => i.video) || items[0];
    setStage(longest, true);
  })
  .catch(() => { grid.innerHTML = '<p style="grid-column:1/-1">Не удалось загрузить каталог — запусти сайт через локальный сервер.</p>'; });

function buildFilters() {
  const box = document.getElementById('filters');
  GROUPS.forEach(([label, test], i) => {
    const b = document.createElement('button');
    b.className = 'chip' + (i === 0 ? ' on' : '');
    b.dataset.cat = label;
    b.innerHTML = `<span>${label}</span>`;
    b.addEventListener('click', () => {
      [...box.children].forEach(c => c.classList.remove('on'));
      b.classList.add('on');
      F.cat = label;
      applyFilters();
    });
    box.appendChild(b);
  });
}

/* ссылки в верхней панели переключают ту же фильтрацию */
function applyCat(label) {
  const chip = document.querySelector(`.chip[data-cat="${label}"]`);
  if (chip) chip.click();
}

/* ---------- фильтры: размер, цвет, цена, сортировка ---------- */
const F = { cat: 'все', sizes: new Set(), colors: new Set(), max: 999, sort: 'def', video: false };
const toNum = s => parseFloat(String(s).replace(',', '.')) || 0;

function buildFilterUI() {
  const sizeBox = document.getElementById('fSizes');
  ['XXS', 'XS', 'S', 'M', 'L'].forEach(s => {
    const b = document.createElement('button');
    b.className = 'fsz';
    b.innerHTML = `<span>${s}</span>`;
    b.addEventListener('click', () => {
      b.classList.toggle('on');
      F.sizes.has(s) ? F.sizes.delete(s) : F.sizes.add(s);
      applyFilters();
    });
    sizeBox.appendChild(b);
  });

  const palette = new Map();
  items.forEach(p => { if (p.color) palette.set(p.color.name, p.color.hex); });
  const colBox = document.getElementById('fColors');
  [...palette].forEach(([name, hex]) => {
    const b = document.createElement('button');
    b.className = 'fcl';
    b.title = name;
    b.style.background = hex;
    b.addEventListener('click', () => {
      b.classList.toggle('on');
      F.colors.has(name) ? F.colors.delete(name) : F.colors.add(name);
      applyFilters();
    });
    colBox.appendChild(b);
  });

  const prices = items.map(p => toNum(p.now));
  const min = Math.floor(Math.min(...prices)), max = Math.ceil(Math.max(...prices));
  const slider = document.getElementById('fPrice');
  slider.min = min; slider.max = max; slider.value = max;
  F.max = max;
  document.getElementById('fPriceVal').textContent = max;
  slider.addEventListener('input', () => {
    F.max = +slider.value;
    document.getElementById('fPriceVal').textContent = slider.value;
    applyFilters();
  });

  document.getElementById('fSort').addEventListener('change', e => { F.sort = e.target.value; applyFilters(); });
  document.getElementById('fVideo').addEventListener('click', e => {
    F.video = !F.video;
    e.currentTarget.classList.toggle('on', F.video);
    applyFilters();
  });
  document.getElementById('fToggle').addEventListener('click', e => {
    document.getElementById('fPanel').classList.toggle('on');
    e.currentTarget.classList.toggle('on');
  });
  document.getElementById('fClear').addEventListener('click', () => {
    F.sizes.clear(); F.colors.clear(); F.max = max; F.sort = 'def'; F.video = false;
    document.getElementById('fVideo').classList.remove('on');
    slider.value = max;
    document.getElementById('fPriceVal').textContent = max;
    document.getElementById('fSort').value = 'def';
    document.querySelectorAll('.fsz.on,.fcl.on').forEach(x => x.classList.remove('on'));
    applyFilters();
  });
}

function applyFilters() {
  const test = (GROUPS.find(g => g[0] === F.cat) || GROUPS[0])[1];
  let list = items.filter(p =>
    test(p.name) &&
    (!F.video || !!p.video) &&
    toNum(p.now) <= F.max &&
    (!F.sizes.size || (p.sizes || []).some(s => !s.out && F.sizes.has(s.s))) &&
    (!F.colors.size || (p.color && F.colors.has(p.color.name)))
  );
  const by = {
    cheap: (a, b) => toNum(a.now) - toNum(b.now),
    rich: (a, b) => toNum(b.now) - toNum(a.now),
    save: (a, b) => (toNum(b.old) - toNum(b.now)) - (toNum(a.old) - toNum(a.now)),
    az: (a, b) => a.name.localeCompare(b.name, 'ru')
  }[F.sort];
  if (by) list = [...list].sort(by);
  renderTags();
  render(list);
}

function renderTags() {
  const box = document.getElementById('fTags');
  const tags = [];
  F.sizes.forEach(s => tags.push(['размер ' + s, () => {
    F.sizes.delete(s);
    document.querySelectorAll('.fsz').forEach(b => { if (b.textContent === s) b.classList.remove('on'); });
  }]));
  F.colors.forEach(c => tags.push([c, () => {
    F.colors.delete(c);
    document.querySelectorAll('.fcl').forEach(b => { if (b.title === c) b.classList.remove('on'); });
  }]));
  const slider = document.getElementById('fPrice');
  if (+slider.value < +slider.max) tags.push(['до ' + slider.value + ' Br', () => {
    slider.value = slider.max;
    F.max = +slider.max;
    document.getElementById('fPriceVal').textContent = slider.max;
  }]);

  box.innerHTML = '';
  tags.forEach(([label, off]) => {
    const t = document.createElement('span');
    t.className = 'ftag';
    t.innerHTML = `${label} <button aria-label="Убрать фильтр">×</button>`;
    t.querySelector('button').addEventListener('click', () => { off(); applyFilters(); });
    box.appendChild(t);
  });
}

function render(list) {
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = '<p class="catalog__empty">По этим фильтрам ничего не осталось. Попробуйте сбросить размер или поднять цену.</p>';
    cards = [];
    document.getElementById('more').hidden = true;
    const c0 = document.getElementById('count');
    if (c0) { rollNumber(c0, 0, 500); c0.parentElement.lastChild.textContent = ' товаров'; }
    return;
  }
  cards = list.map(p => {
    const el = document.createElement('article');
    el.className = 'card';
    const left = stockLeft(p);
    el.innerHTML = `
      <div class="card__shot">
        <span class="card__badge">−60%</span>
        ${left ? `<span class="card__left">осталось ${left} ${plural(left, 'штука', 'штуки', 'штук')}</span>` : ''}
        ${p.video ? '<span class="card__play"></span>' : ''}
        <img class="a" src="${p.images[0]}" alt="${p.name}" loading="lazy">
        ${p.images[1] ? `<img class="b" src="${p.images[1]}" alt="" loading="lazy">` : ''}
        <button class="card__quick"><span>Быстрый просмотр</span></button>
      </div>
      <div class="card__meta">
        <span class="card__name">${p.name}</span>
        <span class="card__price"><b class="card__now">${p.now} Br</b><s class="card__old">${p.old} Br</s></span>
      </div>`;
    el.addEventListener('mouseenter', () => setStage(p));
    el.addEventListener('click', () => openPdp(p));
    el.querySelector('.card__quick').addEventListener('click', e => {
      e.stopPropagation();
      openQuick(p, el);
    });
    grid.appendChild(el);
    io.observe(el);
    return { el, data: p };
  });
  requestAnimationFrame(() => cards.forEach((c, i) => c.el.style.transitionDelay = (i % 12) * 45 + 'ms'));

  const c = document.getElementById('count');
  if (c) {
    rollNumber(c, list.length, 800);
    c.parentElement.lastChild.textContent = ' ' + plural(list.length, 'товар', 'товара', 'товаров');
  }
  collapse(true);
}

/* каталог свёрнут до 12 карточек — чтобы не листать всё до низа */
const PREVIEW = 12;
const moreBtn = document.getElementById('more');
let expanded = false;

function collapse(reset) {
  if (reset) expanded = false;
  cards.forEach((c, i) => c.el.classList.toggle('hide', !expanded && i >= PREVIEW));
  const hidden = Math.max(0, cards.length - PREVIEW);
  moreBtn.hidden = hidden === 0;
  moreBtn.classList.toggle('up', expanded);
  moreBtn.querySelector('span').textContent = expanded
    ? 'Свернуть каталог'
    : `Развернуть каталог — ещё ${hidden}`;
}

moreBtn.addEventListener('click', () => {
  const top = document.getElementById('catalog').getBoundingClientRect().top + current;
  expanded = !expanded;
  collapse(false);
  if (!expanded) scrollTo({ top, behavior: 'smooth' });
});

/* остаток: считаем по доступным размерам, «мало» показываем только когда их 1–2 */
function stockLeft(p) {
  const free = (p.sizes || []).filter(s => !s.out).length;
  return free <= 2 ? free : 0;
}

/* быстрый просмотр — размеры и корзина прямо в сетке */
let quickBox = null;
function openQuick(p, card) {
  if (quickBox) quickBox.remove();
  quickBox = document.createElement('div');
  quickBox.className = 'quick';
  quickBox.innerHTML = `
    <span class="quick__n">${p.name}</span>
    <span class="quick__p">${p.now} Br <s>${p.old} Br</s></span>
    <div class="quick__sizes">${(p.sizes || []).map(s =>
    `<button class="size${s.out ? ' out' : ''}"><span>${s.s}</span></button>`).join('')}</div>
    <button class="btn quick__add"><span>В корзину</span></button>
    <button class="quick__more">открыть карточку →</button>`;
  card.querySelector('.card__shot').appendChild(quickBox);
  requestAnimationFrame(() => quickBox.classList.add('on'));

  let size = null;
  const btns = [...quickBox.querySelectorAll('.size')];
  btns.forEach((b, i) => b.addEventListener('click', e => {
    e.stopPropagation();
    if (p.sizes[i].out) return;
    btns.forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    size = p.sizes[i].s;
  }));
  quickBox.querySelector('.quick__add').addEventListener('click', e => {
    e.stopPropagation();
    if (!size) {
      quickBox.querySelector('.quick__sizes').animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }],
        { duration: 300 });
      return;
    }
    cart.push({ p, size });
    flyToBag(p, card);
    syncBag();
    closeQuick();
  });
  quickBox.querySelector('.quick__more').addEventListener('click', e => { e.stopPropagation(); closeQuick(); openPdp(p); });
  setTimeout(() => document.addEventListener('click', closeQuick, { once: true }), 0);
}
function closeQuick() {
  if (!quickBox) return;
  const b = quickBox; quickBox = null;
  b.classList.remove('on');
  setTimeout(() => b.remove(), 300);
}

function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

/* показываем текущий слой, следующий готовим в фоне и проявляем поверх */
let front = 'a';
function setStage(p, instant) {
  if (!p || p.id === activeId) return;
  activeId = p.id;

  stage.name.textContent = p.name;
  stage.price.textContent = p.now;
  stage.old.textContent = p.old + ' Br';

  if (!p.video) {                       /* у восьми вещей ролика нет — показываем фото */
    stage.img.src = p.images[0];
    stage.frame.classList.add('photo');
    return;
  }
  stage.frame.classList.remove('photo');

  const cur = stage[front];
  const next = stage[front === 'a' ? 'b' : 'a'];
  if (cur.getAttribute('src') === p.video) return;

  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    if (activeId !== p.id) return;      /* пока грузилось, курсор ушёл на другой товар */
    next.play().catch(() => { });
    next.classList.add('on');
    cur.classList.remove('on');
    front = front === 'a' ? 'b' : 'a';
    setTimeout(() => { if (!cur.classList.contains('on')) cur.pause(); }, 900);
  };

  next.src = p.video;
  next.currentTime = 0;
  if (instant || reduced) { next.load(); show(); return; }
  next.addEventListener('canplay', show, { once: true });
  next.addEventListener('loadeddata', show, { once: true });
  setTimeout(show, 450);                /* подстраховка: не ждём событие бесконечно */
  next.load();
}

/* видео-панель прижата к верху экрана, пока идёт каталог */
const stageEl = document.getElementById('stage');
const catalogBody = document.querySelector('.catalog__body');
function pinStage() {
  if (innerWidth < 900) { stageEl.style.transform = ''; return; }
  const r = catalogBody.getBoundingClientRect();
  const max = r.height - stageEl.offsetHeight;
  if (max <= 0) { stageEl.style.transform = ''; return; }
  stageEl.style.transform = `translate3d(0, ${clamp(-r.top, 0, max).toFixed(1)}px, 0)`;
}

/* видео-панель следует за карточкой в центре экрана */
let stageTick = 0;
function stageFollow() {
  if (++stageTick % 12 || !cards.length || innerWidth < 900) return;
  const mid = innerHeight * 0.42;
  let best = null, dist = 1e9;
  cards.forEach(c => {
    const r = c.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const d = Math.abs(r.top + r.height / 2 - mid);
    if (d < dist) { dist = d; best = c; }
  });
  if (best) setStage(best.data);
}

/* ---------- 9b. Карточка товара ---------- */
const BELL = '<svg class="bell" viewBox="0 0 24 24" width="11" height="11"><path d="M12 3a5 5 0 0 1 5 5v4l1.6 2.6H5.4L7 12V8a5 5 0 0 1 5-5zM10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const TRUCK = '<svg viewBox="0 0 24 24" width="15" height="15" style="flex:none"><path d="M2 7h10v9H2zM12 10h4l3 3v3h-7z" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="6.5" cy="18" r="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="16.5" cy="18" r="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
function shipText(t) {
  document.getElementById('pdpShip').innerHTML = TRUCK + '<span>' + t + '</span>';
}

const pdp = document.getElementById('pdp');
const pdpGallery = document.getElementById('pdpGallery');
let pdpItem = null, pdpSize = null;

/* галерея: слева видео с моделью, дальше — фотографии выбранного цвета */
function paintGallery(p, variant) {
  const imgs = (variant && variant.images && variant.images.length) ? variant.images : p.images;
  const withVideo = p.video && (!variant || variant.self);
  pdpGallery.innerHTML =
    (withVideo ? `<video src="${p.video}" muted loop playsinline autoplay></video>` : '') +
    imgs.map(src => `<img src="${src}" alt="${p.name}">`).join('');
  pdpGallery.scrollTop = 0;
  [...pdpGallery.children].forEach((el, i) => el.animate(
    [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
    { duration: 520, delay: i * 70, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'both' }));
}

function openPdp(p) {
  pdpItem = p; pdpSize = null;

  const own = (p.family || []).find(v => v.self);
  paintGallery(p, own);

  document.getElementById('pdpName').textContent = p.name;
  document.getElementById('pdpOld').textContent = p.old + ' Br';
  document.getElementById('pdpNow').textContent = p.now + ' Br';
  document.getElementById('pdpDesc').textContent = p.desc || 'Дизайн из Лос-Анджелеса. Ручная стирка в холодной воде.';

  /* настоящие цветовые варианты товара с Nuvelle.by */
  const colors = document.getElementById('pdpColors');
  const fam = p.family || [];
  document.querySelector('.pdp__block').hidden = fam.length < 2;
  colors.innerHTML = fam.map(v => `
    <button class="sw${v.self ? ' on' : ''}" title="${v.name}">
      <img src="${v.thumb}" alt="${v.name}">
      <i style="background:${v.hex}"></i>
    </button>`).join('');
  document.getElementById('pdpColorName').textContent = (fam.find(v => v.self) || {}).name || '';
  [...colors.children].forEach((b, i) => b.addEventListener('click', () => {
    [...colors.children].forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    const v = fam[i];
    document.getElementById('pdpColorName').textContent = v.name;
    paintGallery(p, v);
  }));

  const sizes = document.getElementById('pdpSizes');
  sizes.innerHTML = (p.sizes || []).map(s =>
    `<button class="size${s.out ? ' out' : ''}"><span>${s.s}</span>${s.out ? BELL : ''}</button>`).join('');
  [...sizes.children].forEach((b, i) => b.addEventListener('click', () => {
    if (p.sizes[i].out) {
      shipText(`Размер ${p.sizes[i].s} закончился — сообщим, когда вернётся в наличие`);
      b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
        { duration: 380, easing: 'cubic-bezier(.19,1,.22,1)' });
      return;
    }
    [...sizes.children].forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    pdpSize = p.sizes[i].s;
    shipText(`Размер ${pdpSize} — доставка по Минску завтра, по Беларуси 2–3 дня`);
  }));
  shipText('Выберите размер, чтобы узнать дату доставки');

  pdp.classList.add('open');
  pdp.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePdp() {
  pdp.classList.remove('open');
  pdp.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  pdpGallery.querySelectorAll('video').forEach(v => v.pause());
}
document.getElementById('pdpClose').addEventListener('click', closePdp);
addEventListener('keydown', e => { if (e.key === 'Escape' && pdp.classList.contains('open')) closePdp(); });

document.getElementById('pdpAdd').addEventListener('click', () => {
  const btn = document.getElementById('pdpAdd');
  if (!pdpSize) {
    document.getElementById('pdpShip').textContent = 'Сначала выберите размер';
    document.getElementById('pdpSizes').animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
      { duration: 320 });
    return;
  }
  cart.push({ p: pdpItem, size: pdpSize });
  flyToBag(pdpItem, btn);
  syncBag();
  btn.classList.add('done');
  btn.querySelector('span').textContent = 'Добавлено';
  setTimeout(() => {
    btn.classList.remove('done');
    btn.querySelector('span').textContent = 'Добавить в корзину';
  }, 1700);
});

/* картинка товара летит по дуге в иконку корзины */
function flyToBag(p, fromEl) {
  if (reduced) return;
  const start = (pdpGallery.querySelector('img') || fromEl).getBoundingClientRect();
  const end = document.getElementById('btnBag').getBoundingClientRect();
  const ghost = document.createElement('img');
  ghost.src = p.images[0];
  ghost.className = 'fly';
  document.body.appendChild(ghost);

  const w = Math.min(start.width, 190), h = w * 1.4;
  const x0 = start.left + start.width / 2, y0 = start.top + start.height / 2;
  const x1 = end.left + end.width / 2, y1 = end.top + end.height / 2;
  const mx = (x0 + x1) / 2 + 120, my = Math.min(y0, y1) - 160;

  ghost.style.width = w + 'px';
  ghost.style.height = h + 'px';

  const path = t => {
    const u = 1 - t;
    return [u * u * x0 + 2 * u * t * mx + t * t * x1, u * u * y0 + 2 * u * t * my + t * t * y1];
  };
  const frames = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, [x, y] = path(t);
    frames.push({
      transform: `translate(${x - w / 2}px, ${y - h / 2}px) scale(${1 - t * 0.86}) rotate(${t * 26}deg)`,
      opacity: t > 0.86 ? 0 : 1,
      offset: t
    });
  }
  ghost.animate(frames, { duration: 850, easing: 'cubic-bezier(.5,.05,.35,1)' })
    .onfinish = () => ghost.remove();

  setTimeout(() => {
    const bagBtn = document.getElementById('btnBag');
    bagBtn.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.35) rotate(-8deg)' }, { transform: 'scale(1)' }],
      { duration: 520, easing: 'cubic-bezier(.19,1,.22,1)' });
  }, 780);
}

document.querySelector('.pdp__fav').addEventListener('click', e => {
  const on = e.currentTarget.classList.toggle('on');
  const i = favs.indexOf(pdpItem);
  if (on && i < 0) favs.push(pdpItem);
  if (!on && i >= 0) favs.splice(i, 1);
  syncFav();
});

document.querySelectorAll('.acc').forEach(a => {
  const head = a.querySelector('.acc__head'), body = a.querySelector('.acc__body');
  head.addEventListener('click', () => {
    const open = a.classList.toggle('open');
    body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
  });
});

/* ---------- 9d. Поиск, избранное, корзина, кабинет ---------- */
const scrim = document.getElementById('scrim');
const searchBox = document.getElementById('search');
const searchInput = document.getElementById('searchInput');
const searchHits = document.getElementById('searchHits');
const drawer = document.getElementById('drawer');
const drawerTitle = document.getElementById('drawerTitle');
const drawerBody = document.getElementById('drawerBody');
const drawerFoot = document.getElementById('drawerFoot');

const cart = [];
const favs = [];

function lockScroll(on) { document.body.style.overflow = on ? 'hidden' : ''; }
function closeAll() {
  searchBox.classList.remove('on');
  drawer.classList.remove('on');
  scrim.classList.remove('on');
  lockScroll(false);
}
scrim.addEventListener('click', closeAll);
addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
document.getElementById('searchClose').addEventListener('click', closeAll);
document.getElementById('drawerClose').addEventListener('click', closeAll);

/* поиск */
document.getElementById('btnSearch').addEventListener('click', () => {
  closeAll();
  searchBox.classList.add('on');
  scrim.classList.add('on');
  lockScroll(true);
  setTimeout(() => searchInput.focus(), 320);
  renderHits(items.slice(0, 8));
});
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return renderHits(items.slice(0, 8));
  const hits = items.filter(p => p.name.toLowerCase().includes(q));
  renderHits(hits);
});
function renderHits(list) {
  if (!list.length) {
    searchHits.innerHTML = '<p class="search__empty">Ничего не нашлось. Попробуйте «худи», «топ», «брюки».</p>';
    return;
  }
  searchHits.innerHTML = list.map((p, i) => `
    <a class="hit" data-i="${items.indexOf(p)}">
      <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      <span>${p.name}</span><b>${p.now} Br</b>
    </a>`).join('');
  [...searchHits.children].forEach(a => a.addEventListener('click', () => {
    closeAll();
    openPdp(items[+a.dataset.i]);
  }));
}

/* корзина и избранное */
function openDrawer(kind) {
  closeAll();
  drawer.classList.add('on');
  scrim.classList.add('on');
  lockScroll(true);
  drawer.dataset.kind = kind;
  if (kind === 'cart') drawCart();
  if (kind === 'fav') drawFavs();
  if (kind === 'user') drawUser();
}
document.getElementById('btnBag').addEventListener('click', () => openDrawer('cart'));
document.getElementById('btnFav').addEventListener('click', () => openDrawer('fav'));
document.getElementById('btnUser').addEventListener('click', () => openDrawer('user'));

function priceNum(s) { return parseFloat(String(s).replace(',', '.')) || 0; }

function drawCart() {
  drawerTitle.textContent = 'Корзина';
  if (!cart.length) {
    drawerBody.innerHTML = '<p class="dempty">Пока пусто.<br>Откройте любую вещь из каталога, выберите размер — и она появится здесь.</p>';
    drawerFoot.innerHTML = '';
    return;
  }
  drawerBody.innerHTML = cart.map((it, i) => `
    <div class="drow" style="animation-delay:${i * 70}ms">
      <img src="${it.p.images[0]}" alt="">
      <div class="drow__m">
        <span class="drow__n">${it.p.name}</span>
        <span class="drow__s">размер ${it.size}</span>
        <span class="drow__p">${it.p.now} Br</span>
        <button class="drow__x" data-i="${i}">убрать</button>
      </div>
    </div>`).join('');
  [...drawerBody.querySelectorAll('.drow__x')].forEach(b => b.addEventListener('click', () => {
    const row = b.closest('.drow');
    row.classList.add('out');
    setTimeout(() => {
      cart.splice(+b.dataset.i, 1);
      syncBag();
      drawCart();
    }, 380);
  }));
  const total = cart.reduce((s, it) => s + priceNum(it.p.now), 0);
  const old = cart.reduce((s, it) => s + priceNum(it.p.old), 0);
  drawerFoot.innerHTML = `
    <div class="dtotal"><span>Итого</span><b>${total.toFixed(2).replace('.', ',')} Br</b></div>
    <div class="dtotal"><span style="font-size:12px;color:var(--muted)">Вы экономите</span>
      <span style="color:var(--hot)">${(old - total).toFixed(2).replace('.', ',')} Br</span></div>
    <button class="btn" style="width:100%"><span>Оформить заказ</span></button>`;
}

function drawFavs() {
  drawerTitle.textContent = 'Избранное';
  if (!favs.length) {
    drawerBody.innerHTML = '<p class="dempty">Здесь будут вещи, которые вы отметили сердечком в карточке товара.</p>';
    drawerFoot.innerHTML = '';
    return;
  }
  drawerBody.innerHTML = favs.map((p, i) => `
    <div class="drow">
      <img src="${p.images[0]}" alt="">
      <div class="drow__m">
        <span class="drow__n">${p.name}</span>
        <span class="drow__p">${p.now} Br <s style="color:var(--muted);font-size:12px">${p.old} Br</s></span>
        <button class="drow__x" data-i="${i}">убрать</button>
      </div>
    </div>`).join('');
  [...drawerBody.querySelectorAll('.drow__x')].forEach(b => b.addEventListener('click', () => {
    favs.splice(+b.dataset.i, 1);
    syncFav();
    drawFavs();
  }));
  drawerFoot.innerHTML = '';
}

function drawUser() {
  drawerTitle.textContent = 'Личный кабинет';
  if (authUser) { drawUserLoggedIn(); return; }
  drawUserForm('login');
}

function drawUserLoggedIn() {
  drawerBody.innerHTML = `
    <p class="dnote" style="margin-top:0">Вы вошли как<br><b style="color:var(--ink);font-size:15px">${authUser.email}</b></p>
    <p class="dnote">Заказы, адреса доставки и история покупок будут храниться здесь.</p>`;
  drawerFoot.innerHTML = '<button class="btn" id="btnLogout" style="width:100%"><span>Выйти</span></button>';
  document.getElementById('btnLogout').addEventListener('click', async () => {
    await supa.auth.signOut();
    drawUser();
  });
}

function drawUserForm(mode) {
  const isLogin = mode === 'login';
  drawerBody.innerHTML = `
    <div class="dtabs">
      <button type="button" class="dtab${isLogin ? ' on' : ''}" data-mode="login">Вход</button>
      <button type="button" class="dtab${!isLogin ? ' on' : ''}" data-mode="signup">Регистрация</button>
    </div>
    <div class="dfield"><label>E-mail</label><input type="email" id="authEmail" placeholder="you@mail.com" autocomplete="email"></div>
    <div class="dfield"><label>Пароль</label><input type="password" id="authPass" placeholder="минимум 6 символов" autocomplete="${isLogin ? 'current-password' : 'new-password'}"></div>
    <p class="dnote dnote--err" id="authErr" hidden></p>
    <p class="dnote" id="authOk" hidden></p>`;
  [...drawerBody.querySelectorAll('.dtab')].forEach(b => b.addEventListener('click', () => drawUserForm(b.dataset.mode)));
  drawerFoot.innerHTML = `<button class="btn" id="authSubmit" style="width:100%"><span>${isLogin ? 'Войти' : 'Создать аккаунт'}</span></button>`;
  document.getElementById('authSubmit').addEventListener('click', () => submitAuth(isLogin));
  drawerBody.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(isLogin); }));
}

async function submitAuth(isLogin) {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPass').value;
  const errEl = document.getElementById('authErr');
  const okEl = document.getElementById('authOk');
  errEl.hidden = true; okEl.hidden = true;
  if (!email || !password) { errEl.textContent = 'Заполните e-mail и пароль.'; errEl.hidden = false; return; }
  const btn = document.getElementById('authSubmit');
  btn.disabled = true;
  const { error } = isLogin
    ? await supa.auth.signInWithPassword({ email, password })
    : await supa.auth.signUp({ email, password });
  btn.disabled = false;
  if (error) { errEl.textContent = error.message; errEl.hidden = false; return; }
  if (isLogin) { drawUser(); }
  else { okEl.textContent = 'Готово! Проверьте почту и подтвердите e-mail, чтобы войти.'; okEl.hidden = false; }
}

function syncBag() {
  bag = cart.length;
  bagCount.textContent = String(bag);
  bagCount.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }],
    { duration: 420, easing: 'cubic-bezier(.19,1,.22,1)' });
}
function syncFav() {
  const el = document.getElementById('favCount');
  el.textContent = String(favs.length);
  el.hidden = favs.length === 0;
}

/* ---------- 9e. Меню: превью-фото за курсором и часы ---------- */
const preview = document.getElementById('menuPreview');
const previewImg = preview.querySelector('img');
let pvX = 0, pvY = 0, pvTX = 0, pvTY = 0;

document.querySelectorAll('.menu__main a').forEach(a => {
  a.addEventListener('mouseenter', () => {
    previewImg.src = a.dataset.img;
    preview.classList.add('on');
  });
  a.addEventListener('mouseleave', () => preview.classList.remove('on'));
});
document.querySelector('.menu__panel').addEventListener('mousemove', e => {
  const r = document.querySelector('.menu__panel').getBoundingClientRect();
  pvTX = e.clientX - r.left; pvTY = e.clientY - r.top;
});
function previewFrame() {
  if (!preview.classList.contains('on')) return;
  pvX = lerp(pvX, pvTX, 0.11);
  pvY = lerp(pvY, pvTY, 0.11);
  const tilt = clamp((pvTX - pvX) * 0.12, -12, 12);
  preview.style.transform = `translate(${pvX - preview.offsetWidth / 2}px, ${pvY - preview.offsetHeight / 2}px) rotate(${tilt}deg)`;
}

const clock = document.getElementById('menuClock');
setInterval(() => {
  const d = new Date();
  clock.textContent = 'Минск ' + [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0')).join(':');
}, 1000);

/* ---------- 9f. Новинки: карточки листаются внутри окна, пока секция залипла ---------- */
const arrivals = document.getElementById('arrivals');
const reelCards = [...document.querySelectorAll('.reel__card')];
const reelNow = document.getElementById('reelNow');
document.getElementById('reelAll').textContent = String(reelCards.length);

const arrivalsSide = document.querySelector('.arrivals__side');
const arrivalsStage = document.querySelector('.arrivals__stage');
const reelWindow = document.querySelector('.arrivals__window');

function reelFrame() {
  if (!arrivals || innerWidth < 900) return;
  const r = arrivals.getBoundingClientRect();
  const total = r.height - innerHeight;
  if (total <= 0) return;
  const p = clamp(-r.top / total, 0, 1);

  /* держим экран на месте, пока не пролистаны все карточки
     (position:sticky с нашим трансформ-скроллом не работает) */
  arrivalsStage.style.transform = `translate3d(0, ${(p * total).toFixed(1)}px, 0)`;

  /* заголовок и текст появляются, как только секция встала на место */
  arrivals.classList.toggle('live', r.top < innerHeight * 0.88 && r.bottom > innerHeight * 0.4);

  /* карточки едут сквозь рамку снизу вверх, как на Wibe */
  const winH = reelWindow.clientHeight;
  const cardH = reelCards[0] ? reelCards[0].offsetHeight : winH * 0.62;
  const step = winH * 0.86;                       /* расстояние между соседними карточками */
  const pos = p * reelCards.length;               /* сколько карточек уже прошло */
  const rest = (winH - cardH) / 2;                /* карточка в покое стоит по центру рамки */

  reelCards.forEach((c, i) => {
    const y = rest + (i - pos) * step;
    c.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    c.style.visibility = (y > winH + 40 || y < -cardH - 90) ? 'hidden' : 'visible';
  });

  /* заголовок слегка дрейфует вбок вместе со скроллом */
  if (arrivalsSide) arrivalsSide.style.transform = `translate3d(${(-70 + p * 140).toFixed(1)}px,0,0)`;

  const n = clamp(Math.floor(pos) + 1, 1, reelCards.length);
  if (reelNow.textContent !== String(n)) reelNow.textContent = String(n);
}

/* ---------- 9c. Цитата: строки разъезжаются по горизонтали ---------- */
const quote = document.getElementById('quote');
const qLines = [...document.querySelectorAll('.quote__line')];
function quoteFrame() {
  if (!quote) return;
  const r = quote.getBoundingClientRect();
  if (r.bottom < -200 || r.top > innerHeight + 200) return;
  const p = (innerHeight - r.top) / (innerHeight + r.height) - 0.5;
  qLines.forEach(l => {
    l.style.transform = `translate3d(${(p * parseFloat(l.dataset.shift) * 620).toFixed(1)}px,0,0)`;
  });
}

/* ---------- 9h. Таймер распродажи ---------- */
(function saleTimer() {
  const end = new Date(new Date().getFullYear(), 7, 31, 23, 59, 59); /* 31 августа */
  const pad = n => String(n).padStart(2, '0');
  const slots = { d: document.getElementById('tD'), h: document.getElementById('tH'), m: document.getElementById('tM'), s: document.getElementById('tS') };
  const prev = {};
  const tick = () => {
    let left = Math.max(0, end - Date.now()) / 1000 | 0;
    const v = {
      d: pad(left / 86400 | 0),
      h: pad((left % 86400) / 3600 | 0),
      m: pad((left % 3600) / 60 | 0),
      s: pad(left % 60)
    };
    Object.keys(v).forEach(k => {
      if (prev[k] === v[k]) return;
      prev[k] = v[k];
      slots[k].textContent = v[k];
      slots[k].animate([{ transform: 'translateY(60%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  };
  tick();
  setInterval(tick, 1000);
})();

/* ---------- 9g. Режим работы, аккордеоны вопрос-ответа ---------- */
/* адрес в подвале — обычная ссылка на Яндекс Карты, JS не нужен */

/* открыт ли магазин прямо сейчас */
(function shopState() {
  const el = document.getElementById('shopState');
  const tick = () => {
    const h = new Date().getHours();
    const open = h >= 10 && h < 21;
    el.textContent = open ? 'открыт' : 'закрыт';
    el.style.color = open ? '#7bd389' : 'var(--hot)';
  };
  tick();
  setInterval(tick, 60000);
})();

/* ---------- 10. Прелоадер ---------- */
const loader = document.getElementById('loader');
const num = document.querySelector('.loader__num');
let pct = 0;
const counter = setInterval(() => {
  pct = Math.min(100, pct + Math.random() * 9 + 3);
  num.textContent = Math.floor(pct);
  if (pct >= 100) {
    clearInterval(counter);
    setTimeout(() => {
      loader.classList.add('done');
      app.classList.add('ready');
      heroIntro();
      document.querySelector('.hero__video')?.play().catch(() => { });
      measureMarquees();
      const pctEl = document.querySelector('.hero__pct i');
      if (pctEl) rollNumber(pctEl, 60, 1400);
    }, 420);
  }
}, 130);

/* ---------- 11. Общий цикл ---------- */
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);          /* планируем следующий кадр первым делом:
                                            сбой в одной функции не убьёт весь цикл */
  const dt = Math.min(now - last, 60); last = now;
  current = lerp(current, target, reduced ? 1 : 0.09);
  if (Math.abs(current - target) < 0.05) current = target;
  app.style.transform = `translate3d(0, ${-current.toFixed(2)}px, 0)`;
  try {
    cursorFrame();
    parallax();
    marqueeFrame(dt);
    heroFrame();
    barFrame();
    quoteFrame();
    reelFrame();
    previewFrame();
    pinStage();
    stageFollow();
  } catch (e) { /* один сбойный кадр не должен останавливать сайт */ }
}

function boot() {
  initScroll();
  measureMarquees();
  document.querySelectorAll('[data-reveal],[data-split],[data-roll]').forEach(el => io.observe(el));
  requestAnimationFrame(frame);
}

boot();
addEventListener('load', () => {                /* после подгрузки картинок пересчитываем высоты */
  document.body.style.height = app.getBoundingClientRect().height + 'px';
  measureMarquees();
});
