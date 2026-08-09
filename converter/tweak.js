/* ============================================================
   Твикер. Открывается шестерёнкой, клавишей «~»/«Ё»
   или ссылкой ?tweak=1. Значения летят в CVT.cfg и localStorage.
   ============================================================ */
(() => {
'use strict';

const CVT = window.CVT;
if (!CVT || !CVT.cfg) return;
const { cfg, DEFAULTS, PALETTES, FONTS, EASE, CARD_ANIMS } = CVT;

const paletteNames = {};
Object.keys(PALETTES).forEach(k => paletteNames[k] = PALETTES[k].name);

const EASE_NAMES = {
  outCubic:'Мягкий выход', linear:'Ровно', inOutCubic:'Мягко туда-обратно',
  outQuint:'Резкий выход', outExpo:'Экспонента', outBack:'С отскоком',
  inOutSine:'Синус', snap:'Щелчок'
};

/* ------------------------------------------------- схема панели */
const SCHEMA = [
  { title:'Цвет', open:true, items:[
    { k:'palette', t:'palette', label:'Палитра', opts:Object.keys(PALETTES), names:paletteNames },
    { k:'accent',  t:'color', label:'Акцент' },
    { k:'bg',      t:'color', label:'Фон' },
    { k:'card',    t:'color', label:'Карточка' },
    { k:'ink',     t:'color', label:'Текст' },
    { k:'inkDim',  t:'color', label:'Приглушённый текст' }
  ]},

  { title:'Шрифт', open:true, items:[
    { k:'font',       t:'select', label:'Основной',  opts:Object.keys(FONTS), names:FONTS },
    { k:'fontNum',    t:'select', label:'Для цифр',  opts:Object.keys(FONTS), names:FONTS },
    { k:'numWeight',  t:'range',  label:'Толщина цифр',      min:100, max:700, step:50 },
    { k:'valueSize',  t:'range',  label:'Размер результата', min:24, max:80, step:1, unit:'px' },
    { k:'track',      t:'range',  label:'Межбуквенное',      min:-1, max:3, step:.05, unit:'px' },
    { k:'labelTrack', t:'range',  label:'Разрядка подписей', min:0, max:.5, step:.01, unit:'em' }
  ]},

  { title:'Форма', items:[
    { k:'radius', t:'range', label:'Скругление', min:0,  max:34, step:1, unit:'px' },
    { k:'border', t:'range', label:'Толщина рамок', min:0, max:3, step:.5, unit:'px' },
    { k:'pad',    t:'range', label:'Внутренние отступы', min:8, max:30, step:1, unit:'px' },
    { k:'gap',    t:'range', label:'Расстояние между блоками', min:4, max:24, step:1, unit:'px' }
  ]},

  { title:'Движение', open:true, items:[
    { k:'dur',      t:'range',  label:'Скорость',  min:.1, max:1.6, step:.05, unit:'с' },
    { k:'ease',     t:'select', label:'Плавность', opts:Object.keys(EASE), names:EASE_NAMES },
    { k:'rollOn',   t:'bool',   label:'Цифры-барабан' },
    { k:'roll',     t:'range',  label:'Длительность барабана', min:.1, max:2, step:.05, unit:'с' },
    { k:'waveOn',   t:'bool',   label:'Волна по клавишам' },
    { k:'flipOn',   t:'bool',   label:'Переворот карточек' },
    { k:'cardAnim', t:'select', label:'Появление карточек', opts:Object.keys(CARD_ANIMS), names:CARD_ANIMS },
    { k:'riseStep', t:'range',  label:'Задержка появления',    min:0, max:.3, step:.01, unit:'с' },
    { t:'replayRise' }
  ]},

  { title:'Интро', items:[
    { k:'introOn',  t:'bool',  label:'Показывать заставку' },
    { k:'introDur', t:'range', label:'Длительность заставки', min:.8, max:4, step:.1, unit:'с' },
    { t:'replay' }
  ]},

  { title:'Атмосфера', items:[
    { k:'grain',    t:'range', label:'Зерно',    min:0, max:.2, step:.005 },
    { k:'vignette', t:'range', label:'Виньетка', min:0, max:1, step:.02 },
    { k:'glow',     t:'range', label:'Свечение акцента', min:0, max:1, step:.02 },
    { k:'auraOn',   t:'bool',  label:'Живой фон' },
    { k:'aura',     t:'range', label:'Сила живого фона', min:0, max:1.5, step:.05 }
  ]},

  { title:'Поведение', items:[
    { k:'decimals', t:'range', label:'Знаков после запятой', min:0, max:6, step:1 },
    { k:'padOn',    t:'bool',  label:'Своя клавиатура' },
    { k:'hapticOn', t:'bool',  label:'Вибро-отклик' }
  ]},

  { title:'Пресеты', items:[ { t:'presets' } ] }
];

const PRESETS = {
  'Строго':   { radius:6, border:1, grain:.02, vignette:.35, glow:.15, numWeight:300, valueSize:40, dur:.35, ease:'outQuint', track:.4 },
  'Роскошь':  { radius:20, border:1, grain:.06, vignette:.7, glow:.55, numWeight:200, valueSize:52, dur:.7, ease:'outExpo', font:'Cormorant Garamond', fontNum:'Cormorant Garamond', labelTrack:.3 },
  'Терминал': { radius:2, border:1, grain:.09, vignette:.25, glow:.4, numWeight:300, valueSize:38, dur:.2, ease:'snap', font:'JetBrains Mono', fontNum:'JetBrains Mono', track:.6 },
  'Мягко':    { radius:28, border:0, grain:.02, vignette:.4, glow:.35, numWeight:250, valueSize:46, dur:.8, ease:'outBack', gap:14, pad:20 }
};

/* ------------------------------------------------- каркас панели */
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

const toggle = el('button', 'tw-toggle', '⚙');
toggle.type = 'button';
toggle.setAttribute('aria-label', 'Настройки вида');

const panel = el('aside', 'tw');
panel.innerHTML =
  '<div class="tw__head">' +
    '<span class="tw__title">Твикер</span>' +
    '<span class="tw__acts">' +
      '<button class="tw__btn" data-act="reset" type="button">Сброс</button>' +
      '<button class="tw__btn" data-act="copy" type="button">JSON</button>' +
      '<button class="tw__btn" data-act="close" type="button">✕</button>' +
    '</span>' +
  '</div>' +
  '<div class="tw__body"></div>';

document.body.append(toggle, panel);
const body = panel.querySelector('.tw__body');
const bind = {};

/* ------------------------------------------------- сборка */
function rebuildPanel(){
  body.innerHTML = '';
  Object.keys(bind).forEach(k => delete bind[k]);

  SCHEMA.forEach(group => {
    const g = el('section', 'tw__group' + (group.open ? '' : ' is-closed'));
    const title = el('button', 'tw__gtitle', `${group.title}<i>▾</i>`);
    title.type = 'button';
    title.addEventListener('click', () => g.classList.toggle('is-closed'));
    const items = el('div', 'tw__items');
    group.items.forEach(it => items.appendChild(buildRow(it)));
    g.append(title, items);
    body.appendChild(g);
  });

  body.appendChild(el('p', 'tw__hint',
    'Панель зовётся клавишей «~» или ссылкой <b>?tweak=1</b>. ' +
    'Настройки живут в localStorage — «JSON» копирует отличия от исходных.'));
}

function buildPresets(){
  const wrap = el('div', 'tw__chips');
  Object.keys(PRESETS).forEach(name => {
    const b = el('button', 'tw__btn', name);
    b.type = 'button';
    b.addEventListener('click', () => {
      Object.assign(cfg, PRESETS[name]);
      cfg.palette = 'custom';
      CVT.apply(); CVT.save(); CVT.recalc(false);
      syncAll();
    });
    wrap.appendChild(b);
  });
  return wrap;
}

function buildRow(it){
  const row = el('div', 'tw__row');
  if (it.t === 'presets'){ row.appendChild(buildPresets()); return row; }

  if (it.t === 'replay' || it.t === 'replayRise'){
    const intro = it.t === 'replay';
    const b = el('button', 'tw__btn tw__btn--wide',
      intro ? '↻ Проиграть заставку заново' : '↻ Проиграть появление заново');
    b.type = 'button';
    b.addEventListener('click', () => intro ? CVT.replayIntro() : CVT.replayRise());
    row.appendChild(b);
    return row;
  }

  const lab = el('label', 'tw__lab', `<b>${it.label}</b>`);
  const val = el('em');
  lab.appendChild(val);
  let input;

  if (it.t === 'range'){
    input = el('input');
    input.type = 'range';
    input.min = it.min; input.max = it.max; input.step = it.step;
    input.value = cfg[it.k];
    input.addEventListener('input', () => set(it.k, parseFloat(input.value)));
    row.append(lab, input);
  }
  else if (it.t === 'select' || it.t === 'palette'){
    lab.removeChild(val);
    input = el('select');
    it.opts.forEach(o => {
      const opt = el('option', null, (it.names && it.names[o]) || o);
      opt.value = o;
      input.appendChild(opt);
    });
    input.value = cfg[it.k];
    input.addEventListener('change', () => {
      if (it.t === 'palette'){ CVT.usePalette(input.value); syncAll(); }
      else set(it.k, input.value);
    });
    row.append(lab, input);
  }
  else if (it.t === 'color'){
    lab.removeChild(val);
    input = el('input');
    input.type = 'color';
    input.value = cfg[it.k];
    input.addEventListener('input', () => set(it.k, input.value));
    row.append(lab, input);
  }
  else if (it.t === 'bool'){
    const wrap = el('label', 'tw__check');
    input = el('input');
    input.type = 'checkbox';
    input.checked = !!cfg[it.k];
    input.addEventListener('change', () => set(it.k, input.checked));
    wrap.append(input, el('span', 'tw__box'), el('span', null, it.label));
    row.appendChild(wrap);
  }

  bind[it.k] = () => {
    if (it.t === 'bool') input.checked = !!cfg[it.k];
    else if (input.value != cfg[it.k]) input.value = cfg[it.k];
    if (it.t === 'range'){
      const n = cfg[it.k];
      const dec = String(it.step).includes('.') ? String(it.step).split('.')[1].length : 0;
      val.textContent = (dec ? n.toFixed(dec) : n) + (it.unit || '');
    }
  };
  bind[it.k]();
  return row;
}

function set(k, v){
  cfg[k] = v;
  if (k === 'bg' || k === 'ink' || k === 'accent' || k === 'card' || k === 'inkDim') cfg.palette = 'custom';
  CVT.apply();
  if (k === 'decimals' || k === 'rollOn') CVT.recalc(false);
  if (bind[k]) bind[k]();
  CVT.save();
}

function syncAll(){ Object.values(bind).forEach(f => f()); }

/* ------------------------------------------------- управление */
function open(v){
  panel.classList.toggle('is-open', v);
  toggle.textContent = v ? '✕' : '⚙';
}
toggle.addEventListener('click', () => open(!panel.classList.contains('is-open')));

panel.addEventListener('click', e => {
  const act = e.target.dataset.act;
  if (act === 'close') open(false);
  if (act === 'reset'){ CVT.reset(); CVT.recalc(false); rebuildPanel(); }
  if (act === 'copy'){
    const diff = {};
    for (const k in cfg) if (cfg[k] !== DEFAULTS[k]) diff[k] = cfg[k];
    const txt = JSON.stringify(Object.keys(diff).length ? diff : cfg, null, 2);
    navigator.clipboard.writeText(txt).then(() => {
      e.target.textContent = 'скопировано';
      setTimeout(() => e.target.textContent = 'JSON', 1400);
    }).catch(() => console.log(txt));
  }
});

window.addEventListener('keydown', e => {
  if (e.key === '`' || e.key === '~' || e.key === 'ё' || e.key === 'Ё'){
    e.preventDefault();
    open(!panel.classList.contains('is-open'));
  }
});

rebuildPanel();
if (new URLSearchParams(location.search).get('tweak') === '1') open(true);

})();
