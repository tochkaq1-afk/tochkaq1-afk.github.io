/* ============================================================
   FlowerHome — рендер и интерфейс
   ============================================================ */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const SUB_TITLES = {};
CATEGORIES.forEach(c => c.subs.forEach(s => { SUB_TITLES[s.id] = s.title; }));

const CAT_TITLES = {};
CATEGORIES.forEach(c => { CAT_TITLES[c.id] = c.title; });

/* ---------- иконки ---------- */

const ICONS = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>'
};

/* ============================================================
   КАРТОЧКА ТОВАРА
   ============================================================ */

function cardHTML(p, i = 0) {
  const sub = SUB_TITLES[p.sub] || '';
  return `
    <article class="card ${p.stock ? '' : 'is-out'} is-filtering"
             style="animation-delay:${Math.min(i, 12) * 45}ms"
             data-id="${p.id}">
      <div class="card__media">
        <img class="card__img" src="${p.img}" alt="${p.name}" loading="lazy" width="400" height="457">
        ${p.hit && p.stock ? '<span class="card__tag">Хит</span>' : ''}
        ${!p.stock ? '<span class="card__tag card__tag--out">Нет в наличии</span>' : ''}
        ${p.stock ? `<button class="card__add" data-add="${p.id}" type="button">${ICONS.plus} В корзину</button>` : ''}
      </div>
      <button class="card__link" data-open="${p.id}" aria-label="Подробнее: ${p.name}"></button>
      <div class="card__body">
        <h3 class="card__name">${p.name}</h3>
        <p class="card__price price">${formatPrice(p.price)}</p>
      </div>
      <p class="card__sub">${sub}</p>
    </article>`;
}

/* ============================================================
   РЕНДЕР БЛОКОВ ЛЕНДИНГА
   ============================================================ */

function renderMarquee() {
  const el = $('#marquee');
  if (!el) return;
  const item = `<div class="marquee__item">${FLOWER_TYPES.join('</div><div class="marquee__item">')}</div>`;
  el.innerHTML = item + item;  // дублируем для бесшовной прокрутки
}

function renderCats() {
  const el = $('#cats');
  if (!el) return;
  el.innerHTML = CATEGORIES.map(c => `
    <article class="cat">
      <img class="cat__img" src="${c.cover}" alt="" loading="lazy">
      <h3 class="cat__title">${c.title}</h3>
      <p class="cat__lead">${c.lead}</p>
      <div class="cat__subs">${c.subs.map(s => `<span>${s.title}</span>`).join('')}</div>
      <a class="cat__link" href="catalog.html?cat=${c.id}" aria-label="Открыть раздел «${c.title}»" data-cursor="Смотреть"></a>
    </article>`).join('');
}

function renderHits() {
  const el = $('#hits');
  if (!el) return;
  el.innerHTML = PRODUCTS.filter(p => p.hit).slice(0, 8).map(cardHTML).join('');
}

function renderSteps() {
  const el = $('#steps');
  if (!el) return;
  el.innerHTML = STEPS.map(s => `
    <div class="step" data-reveal>
      <span class="step__n">${s.n}</span>
      <h3 class="h3">${s.title}</h3>
      <p>${s.text}</p>
    </div>`).join('');
}

function renderStats() {
  const el = $('#stats');
  if (!el) return;
  el.innerHTML = ABOUT.stats.map(s => `
    <div class="stat" data-reveal>
      <p class="stat__n"><span data-count="${s.n}">0</span>${s.suffix}</p>
      <p class="stat__label">${s.label}</p>
    </div>`).join('');
}

function renderServices() {
  const el = $('#services');
  if (!el) return;
  el.innerHTML = SERVICES.map(s => `
    <article class="service" data-reveal>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
    </article>`).join('');
}

function renderPromos() {
  const el = $('#promos');
  if (!el) return;
  el.innerHTML = PROMOS.map(p => `
    <div class="promo" data-reveal>
      <span class="promo__code">${p.code}</span>
      <div>
        <strong>${p.title}</strong>
        <p>${p.text}</p>
      </div>
    </div>`).join('');
}

function renderDelivery() {
  const tiers = $('#tiers');
  if (tiers) {
    tiers.innerHTML = DELIVERY.tiers.map(t => `
      <div class="tier">
        <p class="tier__zone">${t.zone}</p>
        <p class="tier__price">${t.price}</p>
        <p class="tier__note">${t.note}</p>
      </div>`).join('');
  }

  const facts = $('#facts');
  if (facts) {
    facts.innerHTML = DELIVERY.facts.map(f => `
      <p class="fact">${ICONS.check}<span>${f}</span></p>`).join('');
  }

  const pay = $('#pay');
  if (pay) {
    pay.innerHTML = PAYMENT.methods.map(m => `
      <div class="pay__item">
        <h4>${m.title}</h4>
        <p>${m.desc}</p>
      </div>`).join('');
  }

  const note = $('#payNote');
  if (note) note.textContent = PAYMENT.refund;
}

/* ---------- Почему выбирают нас ---------- */

function renderWhy() {
  const list = $('#whyList');
  if (!list) return;

  $('#whyLead').textContent = WHY.lead;
  $('#chartTitle').textContent = WHY.chart.title;
  $('#chartNote').textContent = WHY.chart.note;

  list.innerHTML = WHY.reasons.map(r => `
    <li class="why__item" data-reveal>
      <span class="why__n">${r.n}</span>
      <h3>${r.title}</h3>
      <p>${r.text}</p>
    </li>`).join('');

  renderChart();
}

/* Плоская диаграмма со скруглёнными столбиками */
function renderChart() {
  const el = $('#chart');
  if (!el) return;

  const bars = WHY.chart.bars;

  el.innerHTML = `
    <p class="sr-only" id="chartAlt">Диаграмма: ${WHY.chart.title}. ` +
      bars.map(b => `${b.label} — ${b.value}%`).join(', ') + `</p>
    <div class="chart__plot">
      ${bars.map((b, i) => `
        <div class="chart__col" style="--v:${b.value}; --i:${i}">
          <span class="chart__value">${b.value}<i>%</i></span>
          <span class="chart__bar"></span>
          <span class="chart__label">${b.label}</span>
        </div>`).join('')}
    </div>`;
}

/* ---------- Частые вопросы ---------- */

function renderFaq() {
  const el = $('#faqList');
  if (!el) return;

  el.innerHTML = FAQ.map((f, i) => `
    <div class="faq__item" data-reveal>
      <button class="faq__q" type="button"
              aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}">
        <span>${f.q}</span>
        <span class="faq__sign" aria-hidden="true"></span>
      </button>
      <div class="faq__a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}">
        <div><p>${f.a}</p></div>
      </div>
    </div>`).join('');

  // аккордеон: открытый вопрос закрывается повторным кликом,
  // соседние сворачиваются, чтобы не растягивать страницу
  el.addEventListener('click', e => {
    const btn = e.target.closest('.faq__q');
    if (!btn) return;

    const item = btn.closest('.faq__item');
    const willOpen = !item.classList.contains('is-open');

    $$('.faq__item', el).forEach(other => {
      other.classList.remove('is-open');
      $('.faq__q', other).setAttribute('aria-expanded', 'false');
    });

    if (willOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

/* ---------- Отзывы стопкой ---------- */

function renderReviews() {
  const el = $('#reviewsList');
  if (!el) return;

  const star = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.6 7 .9-5.1 4.8 1.3 7L12 18l-6.2 3.3 1.3-7L2 9.5l7-.9z"/></svg>';
  const badge = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5 14.6 4l3.5-.3.6 3.5 3 1.9-1.6 3.2 1.6 3.2-3 1.9-.6 3.5-3.5-.3L12 22.5 9.4 20l-3.5.3-.6-3.5-3-1.9L3.9 12 2.3 8.8l3-1.9.6-3.5L9.4 4z"/><path d="m8.5 12 2.4 2.4 4.6-5" stroke="var(--paper)" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const n = REVIEWS.length;

  el.innerHTML = REVIEWS.map((r, i) => {
    // раскладываем веером: середина прямо, края — развёрнуты
    const t = (i - (n - 1) / 2) / ((n - 1) / 2);   // -1 … 1
    const ry = -t * 20;
    const rz = t * 4;
    const ty = Math.abs(t) * 22;
    const tz = -Math.abs(t) * 46;

    return `
      <article class="rev" tabindex="0"
               style="--ry:${ry.toFixed(1)}deg; --rz:${rz.toFixed(1)}deg;
                      --ty:${ty.toFixed(0)}px; --tz:${tz.toFixed(0)}px;
                      z-index:${n - Math.abs(Math.round(t * n))}">
        <div class="rev__head">
          <span class="rev__ava" aria-hidden="true">${r.name[0]}</span>
          <div class="rev__who">
            <p class="rev__name">${r.name} ${badge}</p>
            <p class="rev__src">${r.src} · ${r.date}</p>
          </div>
        </div>
        <div class="rev__stars" aria-label="Оценка ${r.rating} из 5">${star.repeat(r.rating)}</div>
        <p class="rev__text">${r.text}</p>
        <div class="rev__foot">
          <span class="rev__order">${r.order}</span>
          <span>Проверенный заказ</span>
        </div>
      </article>`;
  }).join('');
}

function renderSocials() {
  const el = $('#socials');
  if (!el) return;
  el.innerHTML = SITE.socials.map(s => `
    <a class="social" href="${s.url}" target="_blank" rel="noopener">
      ${s.name} <span class="muted">${s.handle}</span>
    </a>`).join('');
}

function renderFooterCats() {
  const el = $('#footerCats');
  if (!el) return;
  el.innerHTML = CATEGORIES.map(c =>
    `<li><a href="catalog.html?cat=${c.id}">${c.title}</a></li>`).join('');
}

/* ============================================================
   ДОБАВЛЕНИЕ В КОРЗИНУ + «ПОЛЁТ» МИНИАТЮРЫ
   ============================================================ */

function flyToCart(sourceImg) {
  if (!sourceImg || prefersReducedMotion()) return;

  const target = $('#cartBtn');
  if (!target) return;

  const from = sourceImg.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const ghost = document.createElement('img');
  ghost.src = sourceImg.currentSrc || sourceImg.src;
  ghost.className = 'fly';
  ghost.alt = '';
  ghost.style.width = from.width + 'px';
  ghost.style.height = from.height + 'px';
  ghost.style.left = from.left + 'px';
  ghost.style.top = from.top + 'px';
  document.body.appendChild(ghost);

  requestAnimationFrame(() => {
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.08)`;
    ghost.style.opacity = '0.15';
  });

  setTimeout(() => ghost.remove(), 850);
}

let toastTimer;
function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-shown'), 2600);
}

function addToCart(id, sourceImg) {
  const p = findProduct(id);
  if (!p) return;

  if (!p.stock) {
    toast('Этой позиции сейчас нет в наличии');
    return;
  }

  if (Cart.add(id)) {
    flyToCart(sourceImg);
    CartUI.render();
    CartUI.bump();
    toast(`«${p.name}» — в корзине`);
  }
}

/* ============================================================
   МОДАЛКА ТОВАРА
   ============================================================ */

const Modal = {
  el: null,
  lastFocus: null,
  currentId: null,

  init() {
    this.el = $('#modal');
    if (!this.el) return;

    $$('[data-close]', this.el).forEach(b =>
      b.addEventListener('click', () => this.close()));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.el.classList.contains('is-open')) this.close();
    });

    $('#modalAdd').addEventListener('click', () => {
      if (!this.currentId) return;
      addToCart(this.currentId, $('#modalImg'));
      this.close();
    });
  },

  open(id) {
    const p = findProduct(id);
    if (!p) return;

    this.currentId = id;
    this.lastFocus = document.activeElement;

    $('#modalImg').src = p.img;
    $('#modalImg').alt = p.name;
    $('#modalCat').textContent =
      [CAT_TITLES[p.cat], SUB_TITLES[p.sub]].filter(Boolean).join(' · ');
    $('#modalTitle').textContent = p.name;
    $('#modalPrice').textContent = formatPrice(p.price);
    $('#modalNote').textContent = p.note || '';

    const addBtn = $('#modalAdd');
    addBtn.textContent = p.stock ? 'В корзину' : 'Нет в наличии';
    addBtn.disabled = !p.stock;

    this.el.classList.add('is-open');
    this.el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('.modal__close', this.el).focus();
  },

  close() {
    this.el.classList.remove('is-open');
    this.el.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (this.lastFocus) this.lastFocus.focus();
    this.currentId = null;
  }
};

/* делегирование кликов по карточкам — работает и на лендинге, и в каталоге */
document.addEventListener('click', e => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    e.preventDefault();
    const card = addBtn.closest('.card');
    addToCart(addBtn.dataset.add, card ? $('.card__img', card) : null);
    return;
  }

  const openBtn = e.target.closest('[data-open]');
  if (openBtn) {
    e.preventDefault();
    Modal.open(openBtn.dataset.open);
  }
});

/* ============================================================
   КАТАЛОГ: фильтры, сортировка, цена
   ============================================================ */

const Catalog = {
  state: { cat: 'all', sub: 'all', sort: 'popular', maxPrice: null },
  maxPrice: 0,

  init() {
    const grid = $('#catalogGrid');
    if (!grid) return;

    this.maxPrice = Math.ceil(Math.max(...PRODUCTS.map(p => p.price)));
    this.state.maxPrice = this.maxPrice;

    // раздел из адреса: catalog.html?cat=cvety
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat && CATEGORIES.some(c => c.id === cat)) this.state.cat = cat;

    this.renderCatChips();
    this.bind();
    this.apply();
  },

  /* доступные разделы — только те, где реально есть товары */
  activeCats() {
    return CATEGORIES.filter(c => PRODUCTS.some(p => p.cat === c.id));
  },

  activeSubs(catId) {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return [];
    return cat.subs.filter(s => PRODUCTS.some(p => p.sub === s.id));
  },

  renderCatChips() {
    const el = $('#catChips');
    if (!el) return;

    const chips = [`<button class="chip ${this.state.cat === 'all' ? 'is-active' : ''}" data-cat="all">
        Всё <span class="chip__n">${PRODUCTS.length}</span></button>`];

    this.activeCats().forEach(c => {
      const n = PRODUCTS.filter(p => p.cat === c.id).length;
      chips.push(`<button class="chip ${this.state.cat === c.id ? 'is-active' : ''}" data-cat="${c.id}">
        ${c.title} <span class="chip__n">${n}</span></button>`);
    });

    el.innerHTML = chips.join('');
    this.renderSubChips();
  },

  renderSubChips() {
    const el = $('#subChips');
    if (!el) return;

    if (this.state.cat === 'all') {
      el.innerHTML = '';
      el.hidden = true;
      return;
    }

    const subs = this.activeSubs(this.state.cat);
    if (subs.length < 2) {
      el.innerHTML = '';
      el.hidden = true;
      return;
    }

    el.hidden = false;
    const chips = [`<button class="chip ${this.state.sub === 'all' ? 'is-active' : ''}" data-sub="all">Все</button>`];
    subs.forEach(s => {
      const n = PRODUCTS.filter(p => p.sub === s.id).length;
      chips.push(`<button class="chip ${this.state.sub === s.id ? 'is-active' : ''}" data-sub="${s.id}">
        ${s.title} <span class="chip__n">${n}</span></button>`);
    });
    el.innerHTML = chips.join('');
  },

  bind() {
    $('#catChips').addEventListener('click', e => {
      const chip = e.target.closest('[data-cat]');
      if (!chip) return;
      this.state.cat = chip.dataset.cat;
      this.state.sub = 'all';
      this.renderCatChips();
      this.apply();
    });

    $('#subChips').addEventListener('click', e => {
      const chip = e.target.closest('[data-sub]');
      if (!chip) return;
      this.state.sub = chip.dataset.sub;
      this.renderSubChips();
      this.apply();
    });

    const sort = $('#sortSelect');
    sort.addEventListener('change', () => {
      this.state.sort = sort.value;
      this.apply();
    });

    const range = $('#priceRange');
    const out = $('#priceOut');
    range.min = 0;
    range.max = this.maxPrice;
    range.value = this.maxPrice;
    out.textContent = 'до ' + formatPrice(this.maxPrice);

    range.addEventListener('input', () => {
      this.state.maxPrice = Number(range.value);
      out.textContent = 'до ' + formatPrice(this.state.maxPrice);
      this.apply();
    });

    $('#resetFilters').addEventListener('click', () => {
      this.state = { cat: 'all', sub: 'all', sort: 'popular', maxPrice: this.maxPrice };
      range.value = this.maxPrice;
      out.textContent = 'до ' + formatPrice(this.maxPrice);
      sort.value = 'popular';
      this.renderCatChips();
      this.apply();
    });
  },

  filtered() {
    let list = PRODUCTS.filter(p => {
      if (this.state.cat !== 'all' && p.cat !== this.state.cat) return false;
      if (this.state.sub !== 'all' && p.sub !== this.state.sub) return false;
      if (p.price > this.state.maxPrice) return false;
      return true;
    });

    const by = {
      cheap:   (a, b) => a.price - b.price,
      pricey:  (a, b) => b.price - a.price,
      name:    (a, b) => a.name.localeCompare(b.name, 'ru'),
      popular: (a, b) => (b.hit ? 1 : 0) - (a.hit ? 1 : 0) || (b.stock ? 1 : 0) - (a.stock ? 1 : 0)
    };

    return list.sort(by[this.state.sort] || by.popular);
  },

  apply() {
    const list = this.filtered();
    const grid = $('#catalogGrid');
    const empty = $('#emptyState');
    const count = $('#resultCount');

    count.textContent = list.length
      ? `Найдено: ${list.length} ${plural(list.length, 'позиция', 'позиции', 'позиций')}`
      : '';

    if (!list.length) {
      grid.innerHTML = '';
      empty.hidden = false;
    } else {
      empty.hidden = true;
      grid.innerHTML = list.map(cardHTML).join('');
    }

    // подзаголовок каталога
    const title = $('#catalogTitle');
    const crumb = $('#crumbCurrent');
    const name = this.state.sub !== 'all'
      ? SUB_TITLES[this.state.sub]
      : (this.state.cat !== 'all' ? CAT_TITLES[this.state.cat] : 'Весь каталог');
    if (title) title.textContent = name;
    if (crumb) crumb.textContent = name;
  }
};

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

/* ============================================================
   СТАРТ
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderMarquee();
  renderCats();
  renderHits();
  renderSteps();
  renderStats();
  renderServices();
  renderPromos();
  renderDelivery();
  renderWhy();
  renderFaq();
  renderReviews();
  renderSocials();
  renderFooterCats();

  CartUI.init();
  Modal.init();
  Catalog.init();

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
});
