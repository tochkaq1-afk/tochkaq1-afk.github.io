/* ═══════════════════════════════════════════════════════════
   ЛЕКАЛО — каталог, корзина, интерактив
   Всё хранится в localStorage: бэкенда у демо-сайта нет.
   ═══════════════════════════════════════════════════════════ */

/* ─── Чертежи мебели ───────────────────────────────────────────
   Вместо фотостоков — штриховая графика в стиле лекал мастерской.
   Каждая форма рисуется латунным контуром по цвету обивки.        */

const SH = {
  sofa: `
    <rect x="52" y="78" width="316" height="86" rx="16"/>
    <path d="M158 82v78M262 82v78"/>
    <rect x="44" y="156" width="332" height="58" rx="14"/>
    <path d="M158 160v50M262 160v50"/>
    <rect x="26" y="110" width="36" height="104" rx="17"/>
    <rect x="358" y="110" width="36" height="104" rx="17"/>
    <path d="M58 214l-9 34M362 214l9 34M150 214v30M270 214v30"/>`,

  corner: `
    <rect x="112" y="66" width="264" height="80" rx="15"/>
    <path d="M244 70v76"/>
    <rect x="104" y="138" width="272" height="54" rx="13"/>
    <rect x="366" y="98" width="30" height="94" rx="15"/>
    <rect x="40" y="150" width="150" height="52" rx="13"/>
    <path d="M40 150v-34a10 10 0 0110-10h34"/>
    <path d="M118 202v30M362 192l8 32M50 202v30M244 192v34"/>`,

  chester: `
    <rect x="60" y="72" width="300" height="92" rx="22"/>
    <path d="M104 96h0M148 96h0M192 96h0M236 96h0M280 96h0M324 96h0
             M126 124h0M170 124h0M214 124h0M258 124h0M302 124h0" stroke-width="7" stroke-linecap="round"/>
    <rect x="34" y="96" width="46" height="118" rx="23"/>
    <rect x="340" y="96" width="46" height="118" rx="23"/>
    <rect x="52" y="158" width="316" height="56" rx="14"/>
    <path d="M210 162v48"/>
    <path d="M66 214l-8 30M354 214l8 30"/>`,

  daybed: `
    <rect x="70" y="112" width="290" height="46" rx="12"/>
    <rect x="46" y="76" width="34" height="126" rx="16"/>
    <rect x="60" y="150" width="304" height="54" rx="13"/>
    <ellipse cx="122" cy="132" rx="30" ry="20"/>
    <path d="M300 116v40"/>
    <path d="M74 204v30M348 204v30M210 204v26"/>`,

  armchair: `
    <rect x="126" y="58" width="168" height="104" rx="24"/>
    <path d="M126 108h168" stroke-dasharray="3 6"/>
    <rect x="118" y="152" width="184" height="56" rx="14"/>
    <rect x="98" y="104" width="30" height="104" rx="15"/>
    <rect x="292" y="104" width="30" height="104" rx="15"/>
    <path d="M120 208l-12 34M300 208l12 34M138 208v30M282 208v30"/>`,

  shell: `
    <path d="M132 168c-14-62 22-104 78-104s92 42 78 104z"/>
    <path d="M132 168h156" stroke-dasharray="3 6"/>
    <rect x="122" y="162" width="176" height="46" rx="20"/>
    <path d="M156 208l-16 36M264 208l16 36M210 208v32"/>
    <path d="M170 244h80" stroke-dasharray="4 5"/>`,

  bench: `
    <rect x="64" y="148" width="292" height="52" rx="13"/>
    <path d="M64 172h292" stroke-dasharray="3 6"/>
    <path d="M78 200v40M342 200v40M78 226h264" stroke-linecap="round"/>
    <path d="M132 200v40M288 200v40"/>`,

  pouf: `
    <rect x="132" y="140" width="156" height="72" rx="24"/>
    <path d="M210 152v0M180 176v0M240 176v0M210 200v0" stroke-width="7" stroke-linecap="round"/>
    <path d="M150 212v24M270 212v24"/>
    <path d="M132 176h156" stroke-dasharray="3 6" opacity=".5"/>`
};

const art = (shape, tint) => `
  <svg viewBox="0 0 420 264" role="img" aria-hidden="true">
    <g fill="${tint}" fill-opacity=".3" stroke="#C9A227" stroke-width="1.4"
       stroke-linejoin="round" vector-effect="non-scaling-stroke">
      ${SH[shape]}
    </g>
  </svg>`;

/* ─── Каталог ──────────────────────────────────────────────── */

const PRODUCTS = [
  { id:'barokko', name:'Барокко',  cat:'Диваны', shape:'sofa',     tint:'#2E5A4B', price:148900,
    size:'240 × 96 × 84 см', fabric:'велюр Alpaca', extra:'спальное место 200 × 145', tag:'хит' },
  { id:'nord',    name:'Норд',     cat:'Диваны', shape:'corner',   tint:'#2C3D5A', price:214500,
    size:'296 × 176 × 82 см', fabric:'рогожка Malta', extra:'оттоманка меняется местами' },
  { id:'chester', name:'Честер',   cat:'Диваны', shape:'chester',  tint:'#6B2B33', price:176000,
    size:'196 × 92 × 78 см', fabric:'велюр Bergamo', extra:'каретная стяжка вручную', tag:'ручная стяжка' },
  { id:'mila',    name:'Мила',     cat:'Диваны', shape:'daybed',   tint:'#8A7355', price:118000,
    size:'204 × 84 × 76 см', fabric:'лён Toscana', extra:'кушетка с валиком в комплекте' },
  { id:'tuluza',  name:'Тулуза',   cat:'Кресла', shape:'armchair', tint:'#5A5C3A', price:64900,
    size:'88 × 92 × 104 см', fabric:'букле Nube', extra:'высокая спинка с «ушами»' },
  { id:'oval',    name:'Овал',     cat:'Кресла', shape:'shell',    tint:'#8C4A32', price:57500,
    size:'82 × 80 × 74 см', fabric:'шенилл Roma', extra:'гнутая скорлупа, опоры из бука', tag:'новинка' },
  { id:'lotta',   name:'Лотта',    cat:'Пуфы',   shape:'bench',    tint:'#4A4844', price:27400,
    size:'120 × 42 × 46 см', fabric:'антивандальный велюр', extra:'банкетка для прихожей' },
  { id:'kube',    name:'Кубе',     cat:'Пуфы',   shape:'pouf',     tint:'#8A6B22', price:18900,
    size:'60 × 60 × 42 см', fabric:'микрофибра Suet', extra:'ящик для хранения под крышкой', tag:'в наличии' }
];

const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

/* Правильная форма слова для счётчика позиций */
const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

const ICON_PLUS  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';

/* ─── Отрисовка сетки ──────────────────────────────────────── */

const grid = document.getElementById('grid');

function renderGrid(cat = 'all') {
  const list = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat);

  grid.innerHTML = list.map((p, i) => `
    <article class="card rv" style="--tint:${p.tint}; --d:${i * 45}ms">
      <div class="card__art">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}
        ${art(p.shape, p.tint)}
      </div>
      <h3 class="card__name">«${p.name}»</h3>
      <p class="card__cat">${p.cat === 'Пуфы' ? 'Пуфы и банкетки' : p.cat}</p>
      <p class="card__spec">
        <b>${p.size}</b><br>${p.fabric}<br>${p.extra}
      </p>
      <div class="card__foot">
        <p class="card__price">${money(p.price)}<small>в ткани категории I</small></p>
        <button class="add" data-add="${p.id}" aria-label="Добавить «${p.name}» в корзину">
          ${ICON_PLUS} В корзину
        </button>
      </div>
    </article>`).join('');

  grid.querySelectorAll('.rv').forEach(el => observer.observe(el));
}

/* ─── Корзина ──────────────────────────────────────────────── */

const KEY = 'lekalo_cart_v1';

let cart = [];
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  // Отбрасываем позиции, которых больше нет в каталоге
  if (Array.isArray(saved)) {
    cart = saved.filter(it => PRODUCTS.some(p => p.id === it.id))
                .map(it => ({ id: it.id, n: Math.min(Math.max(1, it.n | 0), 99) }));
  }
} catch { cart = []; }

const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {}
};

const find = id => PRODUCTS.find(p => p.id === id);
const total = () => cart.reduce((s, it) => s + find(it.id).price * it.n, 0);
const count = () => cart.reduce((s, it) => s + it.n, 0);

const cartBody  = document.getElementById('cartBody');
const cartFoot  = document.getElementById('cartFoot');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

function renderCart() {
  const n = count();
  cartCount.textContent = n;
  cartCount.setAttribute('aria-label', `${n} ${plural(n, 'товар', 'товара', 'товаров')} в корзине`);

  if (!cart.length) {
    cartBody.innerHTML = `
      <div class="empty">
        <b>Пока пусто</b>
        Выберите модель в каталоге — размеры и ткань обсудим при замере.
      </div>`;
    cartFoot.hidden = true;
    return;
  }

  cartBody.innerHTML = cart.map(it => {
    const p = find(it.id);
    return `
      <div class="li">
        <p class="li__name">«${p.name}»</p>
        <p class="li__price">${money(p.price * it.n)}</p>
        <p class="li__meta">${p.size} · ${p.fabric}</p>
        <div class="li__ctrl" style="grid-column:1/-1">
          <button class="qty" data-step="-1" data-id="${p.id}" aria-label="Уменьшить количество «${p.name}»">−</button>
          <span class="li__n">${it.n}</span>
          <button class="qty" data-step="1" data-id="${p.id}" aria-label="Увеличить количество «${p.name}»">+</button>
          <button class="li__del" data-del="${p.id}">Убрать</button>
        </div>
      </div>`;
  }).join('');

  cartTotal.textContent = money(total());
  cartFoot.hidden = false;
}

function addToCart(id) {
  const it = cart.find(x => x.id === id);
  if (it) { it.n = Math.min(it.n + 1, 99); } else { cart.push({ id, n: 1 }); }
  save(); renderCart();
  toast(`«${find(id).name}» в корзине`);
}

/* ─── Выдвижная панель ─────────────────────────────────────── */

const drawer = document.getElementById('drawer');
const scrim  = document.getElementById('scrim');
let lastFocus = null;

function openCart() {
  lastFocus = document.activeElement;
  scrim.hidden = false;
  requestAnimationFrame(() => scrim.classList.add('is-on'));
  drawer.classList.add('is-on');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  document.getElementById('cartClose').focus();
}

function closeCart() {
  drawer.classList.remove('is-on');
  drawer.setAttribute('aria-hidden', 'true');
  scrim.classList.remove('is-on');
  document.body.classList.remove('is-locked');
  setTimeout(() => { scrim.hidden = true; }, 300);
  lastFocus?.focus();
}

document.getElementById('cartOpen').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
scrim.addEventListener('click', closeCart);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('is-on')) closeCart();
});

/* Фокус не должен уходить из открытой панели */
drawer.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const f = [...drawer.querySelectorAll('button, input, [href]')].filter(el => !el.disabled && el.offsetParent);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ─── Обработка кликов ─────────────────────────────────────── */

grid.addEventListener('click', e => {
  const btn = e.target.closest('[data-add]');
  if (btn) addToCart(btn.dataset.add);
});

cartBody.addEventListener('click', e => {
  const step = e.target.closest('[data-step]');
  if (step) {
    const it = cart.find(x => x.id === step.dataset.id);
    if (!it) return;
    it.n += Number(step.dataset.step);
    if (it.n < 1) cart = cart.filter(x => x.id !== it.id);
    if (it.n > 99) it.n = 99;
    save(); renderCart();
    return;
  }
  const del = e.target.closest('[data-del]');
  if (del) {
    cart = cart.filter(x => x.id !== del.dataset.del);
    save(); renderCart();
  }
});

document.getElementById('filters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => {
    const on = c === chip;
    c.classList.toggle('is-on', on);
    c.setAttribute('aria-selected', String(on));
  });
  renderGrid(chip.dataset.cat);
});

/* ─── Оформление заявки (демо, без отправки) ───────────────── */

const form = document.getElementById('orderForm');
const err  = document.getElementById('orderErr');

form.addEventListener('submit', e => {
  e.preventDefault();

  const name  = form.name.value.trim();
  const phone = form.phone.value.trim();
  const digits = phone.replace(/\D/g, '').length;

  const bad = [];
  if (name.length < 2)  bad.push([form.name,  'Напишите, как к вам обращаться']);
  if (digits < 10)      bad.push([form.phone, 'Телефон должен содержать не меньше 10 цифр']);

  form.name.setAttribute('aria-invalid', 'false');
  form.phone.setAttribute('aria-invalid', 'false');

  if (bad.length) {
    bad.forEach(([field]) => field.setAttribute('aria-invalid', 'true'));
    err.textContent = bad[0][1];
    err.hidden = false;
    bad[0][0].focus();
    return;
  }

  err.hidden = true;

  const n = count(), sum = money(total());
  cart = []; save(); renderCart();

  cartBody.innerHTML = `
    <div class="done">
      ${ICON_CHECK.replace('viewBox', 'width="46" height="46" viewBox')}
      <h3>Заявка принята</h3>
      <p>${name}, спасибо! Мы бы позвонили на ${phone} в течение часа
         и согласовали замер: ${n} ${plural(n, 'позиция', 'позиции', 'позиций')} на ${sum}.</p>
      <p style="margin-top:14px">Но это демонстрационный сайт — заявка осталась
         в вашем браузере и никуда не ушла.</p>
    </div>`;
  cartFoot.hidden = true;
});

/* ─── Появление блоков при скролле ─────────────────────────── */

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

/* ─── Уведомление ──────────────────────────────────────────── */

const toastEl = Object.assign(document.createElement('div'), { className: 'toast' });
toastEl.setAttribute('role', 'status');
document.body.appendChild(toastEl);

let toastTimer;
function toast(text) {
  toastEl.innerHTML = ICON_CHECK + '<span></span>';
  toastEl.querySelector('span').textContent = text;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
}

/* ─── Старт ────────────────────────────────────────────────── */

document.getElementById('heroArt').innerHTML = art('sofa', '#2E5A4B');
renderGrid();
renderCart();
document.querySelectorAll('.rv').forEach(el => observer.observe(el));
