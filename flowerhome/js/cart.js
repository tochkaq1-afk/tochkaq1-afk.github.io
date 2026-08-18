/* ============================================================
   FlowerHome — корзина
   Состояние хранится в localStorage: { id: количество }
   ============================================================ */

const FREE_SHIPPING = 170;   // от этой суммы доставка по МКАД бесплатно
const SHIPPING_COST = 20;    // доставка в пределах МКАД

const Cart = {
  KEY: 'flowerhome_cart_v1',
  items: {},

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      // отбрасываем позиции, которых больше нет в каталоге
      this.items = {};
      Object.keys(parsed).forEach(id => {
        const qty = Number(parsed[id]);
        if (findProduct(id) && qty > 0) this.items[id] = Math.min(qty, 99);
      });
    } catch (e) {
      this.items = {};
    }
    return this.items;
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.items));
    } catch (e) {
      /* приватный режим — просто работаем в памяти */
    }
  },

  add(id, qty = 1) {
    const p = findProduct(id);
    if (!p || !p.stock) return false;
    this.items[id] = Math.min((this.items[id] || 0) + qty, 99);
    this.save();
    return true;
  },

  setQty(id, qty) {
    if (qty <= 0) return this.remove(id);
    this.items[id] = Math.min(qty, 99);
    this.save();
  },

  remove(id) {
    delete this.items[id];
    this.save();
  },

  clear() {
    this.items = {};
    this.save();
  },

  count() {
    return Object.values(this.items).reduce((s, q) => s + q, 0);
  },

  total() {
    return Object.keys(this.items).reduce((sum, id) => {
      const p = findProduct(id);
      return p ? sum + p.price * this.items[id] : sum;
    }, 0);
  },

  list() {
    return Object.keys(this.items)
      .map(id => ({ product: findProduct(id), qty: this.items[id] }))
      .filter(row => row.product);
  }
};

function findProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

function formatPrice(n) {
  const fixed = Math.round(n * 100) / 100;
  const str = Number.isInteger(fixed)
    ? String(fixed)
    : fixed.toFixed(2).replace('.', ',');
  return str + ' BYN';
}

/* ============================================================
   ИНТЕРФЕЙС КОРЗИНЫ
   ============================================================ */

const CartUI = {
  els: {},
  lastFocus: null,

  init() {
    this.els = {
      btn:    document.getElementById('cartBtn'),
      count:  document.getElementById('cartCount'),
      drawer: document.getElementById('drawer'),
      scrim:  document.getElementById('drawerScrim'),
      close:  document.getElementById('drawerClose'),
      body:   document.getElementById('drawerBody'),
      foot:   document.getElementById('drawerFoot')
    };

    if (!this.els.drawer) return;

    Cart.load();

    this.els.btn.addEventListener('click', () => this.open());
    this.els.close.addEventListener('click', () => this.close());
    this.els.scrim.addEventListener('click', () => this.close());

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.els.drawer.classList.contains('is-open')) {
        this.close();
      }
    });

    // делегирование действий внутри корзины
    this.els.body.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const id = btn.dataset.id;
      const act = btn.dataset.act;

      if (act === 'inc') Cart.setQty(id, (Cart.items[id] || 0) + 1);
      if (act === 'dec') Cart.setQty(id, (Cart.items[id] || 0) - 1);
      if (act === 'del') {
        const row = btn.closest('.ci');
        if (row && !prefersReducedMotion()) {
          row.classList.add('is-leaving');
          setTimeout(() => { Cart.remove(id); this.render(); }, 320);
          this.syncCount();
          return;
        }
        Cart.remove(id);
      }
      this.render();
    });

    this.render();
  },

  open() {
    this.lastFocus = document.activeElement;
    this.els.drawer.classList.add('is-open');
    this.els.scrim.classList.add('is-open');
    this.els.drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    this.els.close.focus();
  },

  close() {
    this.els.drawer.classList.remove('is-open');
    this.els.scrim.classList.remove('is-open');
    this.els.drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (this.lastFocus) this.lastFocus.focus();
  },

  syncCount() {
    const n = Cart.count();
    this.els.count.textContent = n;
    this.els.count.classList.toggle('is-shown', n > 0);
  },

  bump() {
    const el = this.els.count;
    el.classList.remove('is-bump');
    void el.offsetWidth;
    el.classList.add('is-bump');
  },

  render() {
    const rows = Cart.list();
    this.syncCount();

    if (!rows.length) {
      this.els.body.innerHTML = `
        <div class="drawer__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p>Пока пусто</p>
          <a class="btn btn--ghost btn--sm" href="catalog.html">Выбрать букет</a>
        </div>`;
      this.els.foot.hidden = true;
      return;
    }

    this.els.body.innerHTML = rows.map((row, i) => {
      const p = row.product;
      return `
        <article class="ci" style="animation-delay:${i * 55}ms">
          <img class="ci__img" src="${p.img}" alt="" loading="lazy">
          <div class="ci__main">
            <h3 class="ci__name">${p.name}</h3>
            <p class="ci__price">${formatPrice(p.price)} × ${row.qty} = <b>${formatPrice(p.price * row.qty)}</b></p>
            <div class="ci__row">
              <div class="qty">
                <button type="button" data-act="dec" data-id="${p.id}" aria-label="Убрать одну штуку">−</button>
                <output aria-label="Количество">${row.qty}</output>
                <button type="button" data-act="inc" data-id="${p.id}" aria-label="Добавить одну штуку">+</button>
              </div>
              <button type="button" class="ci__del" data-act="del" data-id="${p.id}">Удалить</button>
            </div>
          </div>
        </article>`;
    }).join('');

    const total = Cart.total();
    const left = Math.max(0, FREE_SHIPPING - total);
    const pct = Math.min(100, (total / FREE_SHIPPING) * 100);

    this.els.foot.hidden = false;
    this.els.foot.innerHTML = `
      <div class="ship-hint">
        <span>${left > 0
          ? `До бесплатной доставки по МКАД осталось <b>${formatPrice(left)}</b>`
          : `Доставка по МКАД — <b>бесплатно</b>`}</span>
        <div class="ship-bar"><i style="width:${pct}%"></i></div>
      </div>

      <div class="drawer__total">
        <span>Итого за товары</span>
        <strong>${formatPrice(total)}</strong>
      </div>

      <button class="btn btn--full" id="checkoutBtn">Оформить заказ</button>
      <p style="font-size:.74rem;color:var(--moss);text-align:center">
        Доставка ${left > 0 ? formatPrice(SHIPPING_COST) : 'бесплатно'} · оплатить можно картой, ЕРИП или наличными в салоне
      </p>`;

    const btn = document.getElementById('checkoutBtn');
    if (btn) btn.addEventListener('click', () => this.showCheckout());
  },

  /* ---------- форма оформления ---------- */

  showCheckout() {
    const total = Cart.total();

    this.els.body.innerHTML = `
      <button class="link-arrow" id="backToCart" style="margin-bottom:var(--sp-3)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        Назад в корзину
      </button>

      <form class="checkout" id="orderForm" novalidate>
        <div class="field">
          <label for="fName">Ваше имя</label>
          <input id="fName" name="name" type="text" autocomplete="name" required>
          <span class="field__err">Пожалуйста, укажите имя</span>
        </div>

        <div class="field">
          <label for="fPhone">Телефон для связи</label>
          <input id="fPhone" name="phone" type="tel" autocomplete="tel" placeholder="+375 (__) ___-__-__" required>
          <span class="field__hint">Менеджер перезвонит, чтобы подтвердить заказ</span>
          <span class="field__err">Введите телефон — не меньше 7 цифр</span>
        </div>

        <div class="field">
          <label for="fWay">Способ получения</label>
          <select id="fWay" name="way">
            <option value="dostavka">Доставка по Минску</option>
            <option value="samovyvoz">Самовывоз — ул. Маяковского 146</option>
          </select>
        </div>

        <div class="field" id="addrField">
          <label for="fAddr">Адрес доставки</label>
          <input id="fAddr" name="address" type="text" autocomplete="street-address">
          <span class="field__err">Укажите адрес доставки</span>
        </div>

        <div class="checkout__row">
          <div class="field">
            <label for="fDate">Дата</label>
            <input id="fDate" name="date" type="date">
          </div>
          <div class="field">
            <label for="fTime">Время</label>
            <select id="fTime" name="time">
              <option>09:00 — 12:00</option>
              <option>12:00 — 15:00</option>
              <option>15:00 — 18:00</option>
              <option>18:00 — 21:00</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="fPay">Оплата</label>
          <select id="fPay" name="payment">
            <option>Банковской картой через интернет (bePaid)</option>
            <option>ЕРИП / E-POS, код услуги 5300951</option>
            <option>Банковской картой при получении</option>
            <option>Наличными в салоне</option>
          </select>
        </div>

        <div class="field">
          <label for="fNote">Комментарий и текст открытки</label>
          <textarea id="fNote" name="note" placeholder="Пожелания к букету, что написать на открытке…"></textarea>
        </div>

        <div class="drawer__total" style="padding-top:var(--sp-2);border-top:1px solid var(--line)">
          <span id="sumLine"></span>
          <strong id="sumTotal"></strong>
        </div>

        <button class="btn btn--full" type="submit">Отправить заказ</button>
        <p style="font-size:.74rem;color:var(--moss);text-align:center">
          Нажимая кнопку, вы соглашаетесь на обработку данных.
          Изменения в заказ принимаем не позднее чем за 2 часа до доставки.
        </p>
      </form>`;

    this.els.foot.hidden = true;

    document.getElementById('backToCart')
      .addEventListener('click', () => this.render());

    const form = document.getElementById('orderForm');
    const way = document.getElementById('fWay');
    const addrField = document.getElementById('addrField');

    /* самовывоз бесплатный — пересчитываем сумму при смене способа */
    const recalc = () => {
      const pickup = way.value === 'samovyvoz';
      const ship = pickup || total >= FREE_SHIPPING ? 0 : SHIPPING_COST;

      addrField.style.display = pickup ? 'none' : '';
      if (pickup) addrField.classList.remove('has-error');

      document.getElementById('sumLine').textContent =
        `Товары ${formatPrice(total)} + ${pickup ? 'самовывоз' : 'доставка'} ${ship ? formatPrice(ship) : '0 BYN'}`;
      document.getElementById('sumTotal').textContent = formatPrice(total + ship);

      return total + ship;
    };

    way.addEventListener('change', recalc);
    recalc();

    // дата по умолчанию — сегодня, в прошлое не пускаем
    const dateInput = document.getElementById('fDate');
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
    dateInput.min = today;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (this.validate(form, way.value)) this.showDone(recalc());
    });
  },

  validate(form, way) {
    let ok = true;

    const check = (id, valid) => {
      const field = document.getElementById(id).closest('.field');
      field.classList.toggle('has-error', !valid);
      if (!valid) ok = false;
    };

    check('fName', form.name.value.trim().length >= 2);
    check('fPhone', (form.phone.value.match(/\d/g) || []).length >= 7);
    if (way !== 'samovyvoz') {
      check('fAddr', form.address.value.trim().length >= 5);
    }

    if (!ok) {
      const first = form.querySelector('.has-error input');
      if (first) first.focus();
    }
    return ok;
  },

  showDone(sum) {
    this.els.body.innerHTML = `
      <div class="done">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>
        </svg>
        <h3>Заказ принят</h3>
        <p>Спасибо! Менеджер перезвонит в ближайшее время, чтобы подтвердить
           состав, время доставки и способ оплаты.</p>
        <p style="font-family:var(--serif);font-size:1.4rem;color:var(--ink)">
          К оплате: ${formatPrice(sum)}
        </p>
        <button class="btn btn--ghost btn--sm" id="doneClose">Вернуться к покупкам</button>
      </div>`;

    Cart.clear();
    this.syncCount();

    document.getElementById('doneClose').addEventListener('click', () => {
      this.close();
      setTimeout(() => this.render(), 400);
    });
  }
};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
