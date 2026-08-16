/* ============================================================
   Твикер. Открывается шестерёнкой, клавишей «~»/«Ё» или ?tweak=1.
   Перенесён из Метриума, схема переписана под главный экран.
   ============================================================ */
(() => {
'use strict';

const PF = window.PF;
if (!PF) return;
const { cfg, DEFAULTS, FONTS, PALETTES, CURSORS, BTNS } = PF;

const names = obj => { const m = {}; Object.keys(obj).forEach(k => m[k] = obj[k].name || obj[k]); return m; };
const fontNames = names(FONTS);
const palNames  = names(PALETTES);

/* фигуры пыли живут в dust.js — он подключён раньше твикера */
const SH = (PF.dust && PF.dust.SHAPES) || { inf:{ name:'Бесконечность' } };
const shapeKeys = Object.keys(SH);
const shapeNames = names(SH);

const EASE_NAMES = {
  linear:'Ровно', outCubic:'Мягкий выход', outQuint:'Резкий выход',
  outExpo:'Экспонента', outBack:'С отскоком', inOutCubic:'Мягко туда-обратно'
};

/* ------------------------------------------------- схема панели */
const SCHEMA = [
  { title:'Плеер сборки', open:true, items:[
    { t:'player' },
    { t:'replay' }
  ]},

  { title:'Шрифт', open:true, items:[
    { k:'font',     t:'select', label:'Пара шрифтов', opts:Object.keys(FONTS), names:fontNames },
    { k:'h1size',   t:'range',  label:'Размер имени',      min:4,    max:16,  step:.1,  unit:'vw' },
    { k:'h1w',      t:'range',  label:'Жирность имени',    min:100,  max:900, step:100 },
    { k:'h1track',  t:'range',  label:'Разрядка имени',    min:-.09, max:.3,  step:.005, unit:'em' },
    { k:'h1lh',     t:'range',  label:'Межстрочный',       min:.7,   max:1.4, step:.01 },
    { k:'bodysize', t:'range',  label:'Размер текста',     min:.8,   max:1.4, step:.01 }
  ]},

  { title:'Курсор', open:true, items:[
    { k:'cursor',  t:'select', label:'Вид',        opts:Object.keys(CURSORS), names:CURSORS },
    { k:'curSize', t:'range',  label:'Точка',      min:3,  max:26, step:1, unit:'px' },
    { k:'curRing', t:'range',  label:'Кольцо',     min:12, max:90, step:1, unit:'px' },
    { k:'curLag',  t:'range',  label:'Отставание', min:.03, max:1, step:.01 }
  ]},

  { title:'Цвет', items:[
    { k:'palette', t:'palette', label:'Палитра', opts:Object.keys(PALETTES), names:palNames },
    { k:'bg',     t:'color', label:'Фон' },
    { k:'ink',    t:'color', label:'Текст' },
    { k:'dim',    t:'color', label:'Приглушённый' },
    { k:'accent', t:'color', label:'Акцент' },
    { k:'wire',   t:'color', label:'Блок каркаса' },
    { k:'line',   t:'color', label:'Линия сетки' }
  ]},

  { title:'Неоновая рамка', open:true, items:[
    { k:'neon1',      t:'color', label:'Цвет 1' },
    { k:'neon2',      t:'color', label:'Цвет 2' },
    { k:'neon3',      t:'color', label:'Цвет 3' },
    { k:'neonW',      t:'range', label:'Толщина',    min:.5, max:6,  step:.1, unit:'px' },
    { k:'neonSpin',   t:'range', label:'Оборот',     min:1,  max:14, step:.5, unit:'с' },
    { k:'neonGlow',   t:'range', label:'Свечение',   min:0,  max:1,  step:.02 },
    { k:'neonBlur',   t:'range', label:'Мягкость',   min:0,  max:36, step:1, unit:'px' },
    { k:'neonAlways', t:'bool',  label:'Гореть всегда, без курсора' }
  ]},

  { title:'Кнопки', open:true, items:[
    { k:'btn',      t:'select', label:'Вид кнопок', opts:Object.keys(BTNS), names:BTNS },
    { k:'btnR',     t:'range',  label:'Скругление кнопки', min:0,  max:60,  step:1, unit:'px' },
    { k:'btnBw',    t:'range',  label:'Толщина рамки',     min:0,  max:4,   step:.5, unit:'px' },
    { k:'btnPadY',  t:'range',  label:'Отступ сверху',     min:6,  max:34,  step:1, unit:'px' },
    { k:'btnPadX',  t:'range',  label:'Отступ по бокам',   min:10, max:70,  step:1, unit:'px' },
    { k:'btnMinW',  t:'range',  label:'Мин. ширина',       min:0,  max:24,  step:.5, unit:'em' },
    { k:'btnFs',    t:'range',  label:'Размер текста',     min:.6, max:1.4, step:.01, unit:'rem' },
    { k:'btnTrack', t:'range',  label:'Разрядка',          min:0,  max:.4,  step:.005, unit:'em' },
    { k:'btnLower', t:'bool',   label:'Строчными, без КАПСА' },
    { k:'btnDot',   t:'range',  label:'Точка в кнопке',    min:0,  max:18,  step:1, unit:'px' },
    { k:'btnFill',  t:'range',  label:'Скорость заливки',  min:.1, max:1.6, step:.05, unit:'с' },
    { k:'btnSpeed', t:'range',  label:'Скорость раскрытия',min:.1, max:1.6, step:.05, unit:'с' },
    { k:'radius',   t:'range',  label:'Скругление блоков', min:0, max:40, step:1, unit:'px' }
  ]},

  { title:'Пыль и знак', open:true, items:[
    { k:'dustOn',       t:'bool',  label:'Включить пыль' },
    { k:'dustCount',    t:'range', label:'Частиц',            min:2000, max:90000, step:1000 },
    { k:'dustScale',    t:'range', label:'Размер знака',      min:.4,  max:1.3,  step:.01 },
    { k:'dustWidth',    t:'range', label:'Толщина штриха',    min:2,   max:70,   step:1, unit:'px' },
    { k:'dustJitter',   t:'range', label:'Лохматость края',   min:0,   max:24,   step:.5, unit:'px' },
    { k:'dustFlow',     t:'range', label:'Течение по петле',  min:0,   max:4,    step:.05 },
    { k:'dustMin',      t:'range', label:'Слабейшая крупинка',min:.05, max:1,    step:.01 },
    { k:'dustAccent',   t:'range', label:'Доля акцентных',    min:0,   max:.5,   step:.01 }
  ]},

  { title:'Смена фигуры', open:true, items:[
    { k:'dustShape',  t:'select', label:'Фигура', opts:shapeKeys, names:shapeNames },
    { k:'dustAuto',   t:'bool',   label:'Менять сама' },
    { k:'dustHold',   t:'range',  label:'Держать фигуру',      min:1,  max:14, step:.5, unit:'с' },
    { k:'dustMorph',  t:'range',  label:'Длина перехода',      min:.2, max:5,  step:.1, unit:'с' },
    { k:'dustChaos',  t:'range',  label:'Разлёт при переходе', min:0,  max:120, step:2, unit:'px' },
    { k:'dustShapes', t:'text',   label:'Порядок через |' }
  ]},

  { title:'Курсор в пыли', open:true, items:[
    { k:'dustRadius',   t:'range', label:'Радиус проплешины', min:20,  max:340,  step:5, unit:'px' },
    { k:'dustPush',     t:'range', label:'Сила расталкивания',min:0,   max:20,   step:.25 },
    { k:'dustSpring',   t:'range', label:'Пружина домой',     min:.005,max:.25,  step:.005 },
    { k:'dustFriction', t:'range', label:'Вязкость',          min:.6,  max:.98,  step:.01 }
  ]},

  { title:'Чертёжная сетка', items:[
    { k:'cols',     t:'range', label:'Колонок',      min:2, max:24, step:1 },
    { k:'rows',     t:'range', label:'Строк',        min:2, max:16, step:1 },
    { k:'gridop',   t:'range', label:'Заметность',   min:0, max:1, step:.01 },
    { k:'gridKeys', t:'bool',  label:'Красить опорные линии' }
  ]},

  { title:'Тайминг сборки', items:[
    { k:'tGrid',   t:'range', label:'Фаза «сетка»',   min:.1, max:3, step:.05, unit:'с' },
    { k:'tWire',   t:'range', label:'Фаза «каркас»',  min:.1, max:3, step:.05, unit:'с' },
    { k:'tFill',   t:'range', label:'Фаза «контент»', min:.1, max:3, step:.05, unit:'с' },
    { k:'tColor',  t:'range', label:'Фаза «цвет»',    min:.1, max:3, step:.05, unit:'с' },
    { k:'stagger', t:'range', label:'Разбег блоков',  min:0,  max:.4, step:.005, unit:'с' },
    { k:'ease',    t:'select', label:'Характер', opts:Object.keys(PF.EASE), names:EASE_NAMES },
    { k:'autoplay',  t:'bool', label:'Играть при загрузке' },
    { k:'showStage', t:'bool', label:'Показывать название фазы' }
  ]},

  { title:'Тексты', items:[
    { k:'txtName',  t:'text', label:'Имя' },
    { k:'txtMark',  t:'text', label:'Знак в шапке' },
    { k:'txtPlace', t:'text', label:'Город' },
    { k:'txtRole',  t:'text', label:'Кто ты' },
    { k:'txtTag',   t:'text', label:'Строка под именем' },
    { k:'txtLead',  t:'text', label:'Описание' },
    { k:'txtBtn1',  t:'text', label:'Кнопка 1' },
    { k:'txtBtn2',  t:'text', label:'Кнопка 2' },
    { k:'txtBtnLoad', t:'text', label:'Кнопка: отправка' },
    { k:'txtBtnDone', t:'text', label:'Кнопка: готово' },
    { k:'txtTgUrl',  t:'text', label:'Ссылка в телеграм' }
  ]},

  { title:'Преимущества', items:[
    { k:'txtAdvEyebrow', t:'text', label:'Надзаголовок' },
    { k:'txtAdvTitle',   t:'text', label:'Заголовок' },
    { k:'txtAdvLead',    t:'text', label:'Описание' },
    { k:'txtAdvList',    t:'text', label:'Плитки: имя :: текст, через |' }
  ]},

  { title:'Принципы', items:[
    { k:'txtPrEyebrow', t:'text', label:'Надзаголовок' },
    { k:'txtPrTitle',   t:'text', label:'Заголовок' },
    { k:'txtPrLead',    t:'text', label:'Описание' },
    { k:'txtPrList',    t:'text', label:'Карточки: номер :: имя :: текст, через |' }
  ]},

  { title:'Стек', items:[
    { k:'txtStkEyebrow', t:'text', label:'Надзаголовок' },
    { k:'txtStkTitle',   t:'text', label:'Заголовок' },
    { k:'txtStkKey',     t:'text', label:'Подпись справа' },
    { k:'txtStkNote',    t:'text', label:'Сноска' },
    { k:'txtStkList',    t:'text', label:'Строки: имя :: зачем, через | (звёздочка — «пока не делал»)' }
  ]},

  { title:'Второй экран — работы', items:[
    { k:'txtWorksEyebrow', t:'text', label:'Надзаголовок' },
    { k:'txtWorksTitle',   t:'text', label:'Заголовок' },
    { k:'txtWorksLead',    t:'text', label:'Описание' },
    { k:'txtWorksHint',    t:'text', label:'Подпись в заглушке' }
  ]},

  { title:'Третий экран — услуги', open:true, items:[
    { k:'txtSvcEyebrow', t:'text', label:'Надзаголовок' },
    { k:'txtSvcTitle',   t:'text', label:'Заголовок' },
    { k:'txtSvcLead',    t:'text', label:'Описание' },
    { k:'txtSvcFmt',     t:'text', label:'Форматы: имя :: цена :: дней :: метка, через |' },
    { k:'txtSvcAdds',    t:'text', label:'Допы: имя :: цена :: дней, через |' },
    { k:'txtSvcAddsK',   t:'text', label:'Заголовок допов' },
    { k:'txtSvcDiffKSites', t:'text', label:'Разница (сайты): заголовок' },
    { k:'txtSvcDiffSites',  t:'text', label:'Разница (сайты): что :: текст, через |' },
    { k:'txtSvcDiffKTg',    t:'text', label:'Разница (телеграм): заголовок' },
    { k:'txtSvcDiffTg',     t:'text', label:'Разница (телеграм): что :: текст, через |' },
    { k:'txtSvcDiffKEvt',   t:'text', label:'Разница (события): заголовок' },
    { k:'txtSvcDiffEvt',    t:'text', label:'Разница (события): что :: текст, через |' },
    { k:'txtSvcRestT',   t:'text', label:'Строка «другое»: заголовок' },
    { k:'txtSvcRestD',   t:'text', label:'Строка «другое»: текст' },
    { k:'txtSvcRestBtn', t:'text', label:'Строка «другое»: кнопка' },
    { k:'txtSvcCta',     t:'text', label:'Кнопка под чеком' },
    { k:'txtSvcHint',    t:'text', label:'Подпись под кнопкой' },
    { k:'txtSvcCheckK',  t:'text', label:'Чек: надпись сверху' },
    { k:'txtSvcChFmt',   t:'text', label:'Чек: раздел «формат»' },
    { k:'txtSvcChInc',   t:'text', label:'Чек: раздел «входит»' },
    { k:'txtSvcChAdd',   t:'text', label:'Чек: раздел «добавлено»' },
    { k:'txtSvcChN',     t:'text', label:'Чек: строка «позиций»' },
    { k:'txtSvcChOff',   t:'text', label:'Чек: строка «скидка»' },
    { k:'txtSvcChDays',  t:'text', label:'Чек: строка «срок»' },
    { k:'txtSvcChTot',   t:'text', label:'Чек: «итого»' },
    { k:'txtSvcChMonth', t:'text', label:'Чек: «потом»' },
    { k:'txtSvcChBye',   t:'text', label:'Чек: прощание' },
    { k:'txtSvcIncWord', t:'text', label:'Чек: слово вместо цены у входящего' },
    { k:'txtSvcSndOn',   t:'text', label:'Кнопка звука: включён' },
    { k:'txtSvcSndOff',  t:'text', label:'Кнопка звука: выключен' }
  ]},

  { title:'Четвёртый экран — как я работаю', items:[
    { k:'txtFlowEyebrow', t:'text', label:'Надзаголовок' },
    { k:'txtFlowTitle',   t:'text', label:'Заголовок' },
    { k:'txtFlowLead',    t:'text', label:'Описание' },
    { k:'txtFlowKeys',    t:'text', label:'Подписи шагов через |' },
    { k:'txtFlowList',    t:'text', label:'Шаги: имя :: текст, через |' }
  ]},

  { title:'Пятый экран — обо мне', items:[
    { k:'txtAboutEyebrow', t:'text', label:'Надзаголовок' },
    { k:'txtAboutPhrase',  t:'text', label:'Фраза (*приглушённое*)' },
    { k:'txtAboutFacts',   t:'text', label:'Факты: имя :: текст, через |' }
  ]},

  { title:'Шестой экран — контакты', items:[
    { k:'txtCtEyebrow', t:'text', label:'Надзаголовок' },
    { k:'txtCtTitle',   t:'text', label:'Заголовок' },
    { k:'txtCtLead',    t:'text', label:'Описание' },
    { k:'txtCtWho',     t:'text', label:'Имя на визитке' },
    { k:'txtCtCard',    t:'text', label:'Визитка: подпись :: значение, через |' },
    { k:'txtTgName',    t:'text', label:'Адрес телеграма' },
    { k:'txtCtKinds',   t:'text', label:'Варианты задачи через |' },
    { k:'txtCtPhName',    t:'text', label:'Подсказка: имя' },
    { k:'txtCtPhContact', t:'text', label:'Подсказка: связь' },
    { k:'txtCtPhAbout',   t:'text', label:'Подсказка: о задаче' },
    { k:'txtCtSend',    t:'text', label:'Кнопка' },
    { k:'txtCtErr',     t:'text', label:'Ошибка' },
    { k:'txtCtOk',      t:'text', label:'Успех' },
    { k:'txtCtOffline', t:'text', label:'Сервера нет' },
    { k:'txtFootNote',  t:'text', label:'Подпись в подвале' }
  ]},

  { title:'Меню', items:[
    { k:'txtMenu',     t:'text', label:'Кнопка закрыта' },
    { k:'txtMenuOpen', t:'text', label:'Кнопка открыта' },
    { k:'txtMenuList', t:'text', label:'Пункты через |' },
    { k:'txtTg',       t:'text', label:'Подпись ссылки' }
  ]}
];

/* ------------------------------------------------- разметка */
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

const toggle = el('button', 'tw-toggle', '⚙');
toggle.title = 'Твикер (~)';
document.body.appendChild(toggle);

const panel = el('aside', 'tw');
panel.innerHTML = `
  <div class="tw__head">
    <span class="tw__title">Твикер</span>
    <div class="tw__acts">
      <button class="tw__btn" data-act="copy">JSON</button>
      <button class="tw__btn" data-act="reset">Сброс</button>
      <button class="tw__btn" data-act="close">✕</button>
    </div>
  </div>
  <div class="tw__body"></div>`;
document.body.appendChild(panel);

const bodyEl = panel.querySelector('.tw__body');
const bind = {};

let playing = false, playSpeed = .4, loopPlay = true, scrubbing = false;
let scrubInput = null, scrubVal = null, syncPlayBtn = () => {};

function rebuildPanel(){
  const openState = [...bodyEl.querySelectorAll('.tw__group')].map(g => !g.classList.contains('is-closed'));
  bodyEl.innerHTML = '';
  for (const k in bind) delete bind[k];

  SCHEMA.forEach((group, gi) => {
    const wasOpen = openState.length ? openState[gi] : !!group.open;
    const g = el('div', 'tw__group' + (wasOpen ? '' : ' is-closed'));
    const head = el('button', 'tw__gtitle', `<span>${group.title}</span><i>▾</i>`);
    const items = el('div', 'tw__items');
    head.addEventListener('click', () => g.classList.toggle('is-closed'));
    group.items.forEach(it => items.appendChild(buildRow(it)));
    g.append(head, items);
    bodyEl.appendChild(g);
  });

  bodyEl.appendChild(el('div', 'tw__hint',
    'Настройки лежат в браузере. «JSON» копирует только то, что отличается от кода — пришли мне, я вобью. «~» открывает и закрывает панель, пробел — играть/пауза.'));
}

/* ------------------------------------------------- плеер */
function buildPlayer(){
  const wrap = el('div', 'tw__player');

  const lab = el('div', 'tw__lab', '<b>Позиция</b>');
  scrubVal = el('em', null, '0%');
  lab.appendChild(scrubVal);

  scrubInput = el('input');
  scrubInput.type = 'range';
  scrubInput.min = 0; scrubInput.max = 1000; scrubInput.step = 1; scrubInput.value = 0;
  scrubInput.addEventListener('pointerdown', () => { scrubbing = true; playing = false; syncPlayBtn(); });
  window.addEventListener('pointerup', () => { scrubbing = false; });
  scrubInput.addEventListener('input', () => PF.seek(scrubInput.value / 1000));

  const bar = el('div', 'tw__acts tw__acts--wide');
  const playBtn = el('button', 'tw__btn tw__btn--play', '▶ Играть');
  playBtn.addEventListener('click', () => {
    playing = !playing;
    if (playing && PF.progress >= .999) PF.seek(0);
    syncPlayBtn();
  });
  const loopBtn = el('button', 'tw__btn is-on', '⟲ Петля');
  loopBtn.addEventListener('click', () => {
    loopPlay = !loopPlay;
    loopBtn.classList.toggle('is-on', loopPlay);
  });
  bar.append(playBtn, loopBtn);

  const speedLab = el('div', 'tw__lab', '<b>Скорость</b>');
  const speedVal = el('em', null, playSpeed.toFixed(2));
  speedLab.appendChild(speedVal);
  const speed = el('input');
  speed.type = 'range'; speed.min = .05; speed.max = 2; speed.step = .05; speed.value = playSpeed;
  speed.addEventListener('input', () => {
    playSpeed = parseFloat(speed.value);
    speedVal.textContent = playSpeed.toFixed(2);
  });

  const jumpLab = el('div', 'tw__lab', '<b>Прыжок к фазе</b>');
  const jumps = el('div', 'tw__acts tw__acts--wide');
  [['Сетка',0],['Каркас',.22],['Контент',.55],['Цвет',.85],['Готово',1]].forEach(([n,p]) => {
    const b = el('button', 'tw__btn', n);
    b.addEventListener('click', () => { playing = false; syncPlayBtn(); PF.seek(p); });
    jumps.appendChild(b);
  });

  syncPlayBtn = () => {
    playBtn.textContent = playing ? '❚❚ Пауза' : '▶ Играть';
    playBtn.classList.toggle('is-on', playing);
  };

  wrap.append(lab, scrubInput, bar, speedLab, speed, jumpLab, jumps);
  return wrap;
}

/* плеер крутит шкалу сам, чтобы смотреть сборку не трогая страницу */
let last = performance.now();
(function playLoop(now){
  now = now || performance.now();
  const dt = (now - last) / 1000; last = now;
  if (playing && !scrubbing){
    let p = PF.progress + dt * playSpeed;
    if (p >= 1){ p = loopPlay ? 0 : 1; if (!loopPlay){ playing = false; syncPlayBtn(); } }
    PF.seek(p);
  }
  if (scrubInput && !scrubbing){
    const v = Math.round(PF.progress * 1000);
    if (+scrubInput.value !== v) scrubInput.value = v;
  }
  if (scrubVal) scrubVal.textContent = Math.round(PF.progress * 100) + '%';
  requestAnimationFrame(playLoop);
})();

/* ------------------------------------------------- строки панели */
function buildRow(it){
  const row = el('div', 'tw__row');

  if (it.t === 'player'){ row.appendChild(buildPlayer()); return row; }

  if (it.t === 'replay'){
    const b = el('button', 'tw__btn tw__btn--wide', '↻ Проиграть сборку заново');
    b.addEventListener('click', () => { playing = false; syncPlayBtn(); PF.replay(); });
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
      if (it.t === 'palette'){ PF.usePalette(input.value); syncAll(); }
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
  else if (it.t === 'text'){
    lab.removeChild(val);
    input = el('input');
    input.type = 'text';
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

let saveT = 0;
function set(k, v){
  cfg[k] = v;
  if (['bg','ink','dim','accent','wire','line'].includes(k)) cfg.palette = 'custom';
  PF.apply();
  if (k === 'cols' || k === 'rows' || k === 'gridKeys') PF.buildGrid();
  if (k === 'txtWorks') PF.buildTiles();
  if (k === 'txtMenuList') PF.buildMenu();
  if (k.startsWith('txtSvc')) PF.buildSvc();
  if (k.startsWith('txtAdv')) PF.buildAdv();
  if (k.startsWith('txtPr')) PF.buildPrinciples();
  if (k.startsWith('txtStk')) PF.buildStack();
  if (k.startsWith('txtFlow')) PF.buildFlow();
  if (k.startsWith('txtAbout')) PF.buildAbout();
  if (k.startsWith('txtCt') || k === 'txtTgName') PF.buildContact();
  if (PF.dust){
    if (k === 'dustCount') PF.dust.respawn();
    else if (['bg','ink','accent','dustMin','dustAccent'].includes(k)) PF.dust.repaint();
    else if (k === 'dustScale') PF.dust.resize();
    else if (k === 'dustShape') PF.dust.morphTo(v);
    else if (k === 'dustShapes') PF.dust.resetOrder();
  }
  PF.seek(PF.progress);
  if (bind[k]) bind[k]();
  clearTimeout(saveT);
  saveT = setTimeout(PF.save, 250);
}
function syncAll(){ Object.values(bind).forEach(f => f()); }

/* ------------------------------------------------- управление панелью */
function open(v){
  panel.classList.toggle('is-open', v);
  toggle.textContent = v ? '✕' : '⚙';
}
toggle.addEventListener('click', () => open(!panel.classList.contains('is-open')));

panel.addEventListener('click', e => {
  const act = e.target.dataset.act;
  if (act === 'close') open(false);
  if (act === 'reset'){ PF.reset(); rebuildPanel(); }
  if (act === 'copy'){
    const diff = {};
    for (const k in cfg) if (cfg[k] !== DEFAULTS[k]) diff[k] = cfg[k];
    const txt = JSON.stringify(Object.keys(diff).length ? diff : {}, null, 2);
    navigator.clipboard.writeText(txt).then(() => {
      e.target.textContent = 'скопировано';
      setTimeout(() => e.target.textContent = 'JSON', 1400);
    }).catch(() => console.log(txt));
  }
});

window.addEventListener('keydown', e => {
  if (e.target.matches('input, select, textarea')) return;
  if (e.key === '`' || e.key === '~' || e.key === 'ё' || e.key === 'Ё'){
    e.preventDefault();
    open(!panel.classList.contains('is-open'));
  }
  if (e.code === 'Space' && panel.classList.contains('is-open')){
    e.preventDefault();
    playing = !playing;
    syncPlayBtn();
  }
});

rebuildPanel();
/* панель подгружается по требованию, поэтому открываем её сразу и когда
   загрузчик так попросил: первое нажатие «~» иначе только скачало бы файл,
   а открывать пришлось бы вторым */
if (new URLSearchParams(location.search).has('tweak') || window.PF_TWEAK_OPEN) open(true);

})();
