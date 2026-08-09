/* ============================================================
   Конвертер — логика приложения.
   Наружу торчит window.CVT: cfg, DEFAULTS, apply(), save() —
   этим пользуется твикер.
   ============================================================ */
(() => {
'use strict';

const CVT = window.CVT;
const tg = window.Telegram && window.Telegram.WebApp;

/* ---------------------------------------------------- настройки */
const DEFAULTS = {
  bg:'#000000', card:'#111114', ink:'#f2f2f4', inkDim:'#6a6a78', accent:'#c9a961',
  palette:'gold',
  font:'Manrope', fontNum:'Manrope',
  numWeight:150, valueSize:44, track:0, labelTrack:.18,
  radius:15, border:1, pad:16, gap:10,
  dur:.5, ease:'outCubic', roll:.55, riseStep:.07,
  grain:.03, vignette:.68, glow:.74, aura:.65,
  decimals:2, rollOn:true, padOn:true, hapticOn:true,
  introOn:true, introDur:2.5, auraOn:true, waveOn:true, flipOn:true,
  cardAnim:'line',
  soundOn:true, sound:'tick', volume:.5,
  grainLive:false
};

/* Готовые связки «красота ↔ плавность». Слабым телефонам тяжело даётся
   всё разом: движущееся зерно во весь экран, дышащий фон, волна и переворот. */
const QUALITY = {
  max:    { name:'Максимум эффектов', cfg:{ grainLive:true,  auraOn:true,  waveOn:true,  flipOn:true,  cardAnim:'line' } },
  medium: { name:'Сбалансированно',   cfg:{ grainLive:false, auraOn:true,  waveOn:true,  flipOn:true,  cardAnim:'line' } },
  smooth: { name:'Максимум плавности',cfg:{ grainLive:false, auraOn:false, waveOn:false, flipOn:false, cardAnim:'zoom' } }
};

const CARD_ANIMS = {
  line:'Сборка из линии', unfold:'Разворот', split:'Разъезд',
  zoom:'Приближение', blur:'Из размытия', rise:'Всплытие'
};

const PALETTES = {
  gold:   { name:'Золото',   accent:'#c9a961', bg:'#000000', card:'#111114' },
  copper: { name:'Медь',     accent:'#c97a4a', bg:'#0a0807', card:'#141110' },
  emerald:{ name:'Изумруд',  accent:'#4ec9a0', bg:'#06090a', card:'#0f1413' },
  ice:    { name:'Лёд',      accent:'#7fb6e8', bg:'#07090c', card:'#101318' },
  acid:   { name:'Кислота',  accent:'#d6f24a', bg:'#08090a', card:'#121316' },
  rose:   { name:'Роза',     accent:'#e2879f', bg:'#0a0709', card:'#151013' },
  paper:  { name:'Бумага',   accent:'#c1442a', bg:'#f7f5f0', card:'#ffffff', ink:'#141412', inkDim:'#8b887f' }
};

const FONTS = {
  Manrope:'Manrope', Onest:'Onest', Unbounded:'Unbounded',
  'Cormorant Garamond':'Антиква', 'JetBrains Mono':'Моно',
  'system-ui':'Системный', Georgia:'Georgia'
};

const EASE = {
  outCubic:'cubic-bezier(.22,.61,.36,1)',
  linear:'linear',
  inOutCubic:'cubic-bezier(.65,.05,.36,1)',
  outQuint:'cubic-bezier(.23,1,.32,1)',
  outExpo:'cubic-bezier(.16,1,.3,1)',
  outBack:'cubic-bezier(.34,1.56,.64,1)',
  inOutSine:'cubic-bezier(.37,0,.63,1)',
  snap:'cubic-bezier(.85,0,.15,1)'
};

const STORE_CFG = 'cvt.cfg';
const STORE_RATES = 'cvt.rates';
const RATES_TTL = 3600 * 1000;

const cfg = Object.assign({}, DEFAULTS, load(STORE_CFG) || {});

function load(key){
  try { return JSON.parse(localStorage.getItem(key) || 'null'); }
  catch { return null; }
}
function store(key, value){
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/* ---------------------------------------------------- состояние */
const state = {
  mode:'currency',
  category:'length',
  input:'100',
  from:{ currency:'USD', length:'km', mass:'kg', volume:'l', temperature:'c', area:'m2', speed:'kmh' },
  to:  { currency:'BYN', length:'mi', mass:'lb', volume:'gal', temperature:'f', area:'ha', speed:'mph' },
  rates:null, rateStamp:0, rateBase:null, loading:false
};

/* ---------------------------------------------------- узлы */
const $ = id => document.getElementById(id);
const nodes = {
  head:$('catBtn'), catLabel:$('catLabel'),
  tabInk:$('tabInk'),
  codeFrom:$('codeFrom'), nameFrom:$('nameFrom'), valueFrom:$('valueFrom'),
  codeTo:$('codeTo'),     nameTo:$('nameTo'),     valueTo:$('valueTo'),
  cardFrom:$('cardFrom'), cardTo:$('cardTo'), swap:$('swapBtn'), rate:$('rateLine'),
  pad:$('pad'), sheet:$('sheet'), sheetList:$('sheetList'), sheetTitle:$('sheetTitle'),
  aura:$('aura'), intro:$('intro')
};

/* ---------------------------------------------------- применение стилей */
function apply(){
  const r = document.documentElement.style;
  r.setProperty('--bg', cfg.bg);
  r.setProperty('--card', cfg.card);
  r.setProperty('--ink', cfg.ink);
  r.setProperty('--ink-dim', cfg.inkDim);
  r.setProperty('--accent', cfg.accent);
  r.setProperty('--line-accent', hexToRgba(cfg.accent, .42));
  r.setProperty('--font', `'${cfg.font}', system-ui, sans-serif`);
  r.setProperty('--font-num', `'${cfg.fontNum}', system-ui, sans-serif`);
  r.setProperty('--num-weight', cfg.numWeight);
  r.setProperty('--value-size', cfg.valueSize);
  r.setProperty('--track', cfg.track);
  r.setProperty('--label-track', cfg.labelTrack);
  r.setProperty('--radius', cfg.radius);
  r.setProperty('--border', cfg.border);
  r.setProperty('--pad', cfg.pad);
  r.setProperty('--gap', cfg.gap);
  r.setProperty('--dur', cfg.dur);
  r.setProperty('--ease', EASE[cfg.ease] || EASE.outCubic);
  r.setProperty('--rise-step', cfg.riseStep);
  r.setProperty('--grain', cfg.grain);
  r.setProperty('--vignette', cfg.vignette);
  r.setProperty('--glow', cfg.glow);
  r.setProperty('--aura', cfg.auraOn ? cfg.aura : 0);
  document.body.classList.toggle('grain-live', !!cfg.grainLive);
  r.setProperty('--roll', cfg.roll);
  r.setProperty('--intro-dur', cfg.introDur);

  Object.keys(CARD_ANIMS).forEach(k => document.body.classList.remove('anim-' + k));
  if (cfg.cardAnim !== 'rise') document.body.classList.add('anim-' + cfg.cardAnim);

  nodes.pad.hidden = !cfg.padOn;
  document.querySelector('meta[name=theme-color]').setAttribute('content', cfg.bg);
  if (tg && tg.setBackgroundColor){
    try { tg.setBackgroundColor(cfg.bg); tg.setHeaderColor(cfg.bg); } catch {}
  }
}

function usePalette(key){
  const p = PALETTES[key];
  if (!p) return;
  cfg.palette = key;
  cfg.accent = p.accent; cfg.bg = p.bg; cfg.card = p.card;
  cfg.ink = p.ink || DEFAULTS.ink;
  cfg.inkDim = p.inkDim || DEFAULTS.inkDim;
  apply(); save();
}

function hexToRgba(hex, a){
  const h = hex.replace('#','');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

let saveT = 0;
function save(){
  clearTimeout(saveT);
  saveT = setTimeout(() => store(STORE_CFG, cfg), 200);
}

function reset(){
  Object.assign(cfg, DEFAULTS);
  apply(); save();
}

/* ---------------------------------------------------- формат чисел */
function fmt(value){
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  let digits = cfg.decimals;
  if (abs > 0 && abs < 1) digits = Math.max(digits, 4);
  if (abs >= 100000) digits = Math.min(digits, 1);
  const text = value.toLocaleString('ru-RU', {
    minimumFractionDigits:0, maximumFractionDigits:digits
  });
  return text;
}

/* ---------------------------------------------------- цифры-барабан
   Каждый разряд — колонка «0…9», сдвинутая по вертикали через CSS-переменную.
   Пересобираем разметку только когда меняется рисунок строки (длина,
   расстановка запятых и пробелов) — иначе просто крутим готовые колонки. */
function setValue(node, target, animate){
  const text = fmt(target);
  const shape = text.replace(/\d/g, '#');
  let live = cfg.rollOn && animate && !document.hidden;

  if (node.__shape !== shape){
    node.__shape = shape;
    live = false;   /* разметку только что пересобрали — крутить неоткуда */
    node.innerHTML = '';
    node.__cells = [];
    [...text].forEach(ch => {
      if (!/\d/.test(ch)){
        node.appendChild(Object.assign(document.createElement('span'),
          { className:'od od--still', textContent:ch }));
        return;
      }
      const cell = document.createElement('span');
      cell.className = 'od';
      const strip = document.createElement('span');
      strip.className = 'od__strip';
      /* в разметке лежат все десять цифр — читалке и копированию они не нужны */
      strip.setAttribute('aria-hidden', 'true');
      strip.innerHTML = '<i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i>';
      cell.appendChild(strip);
      node.appendChild(cell);
      node.__cells.push(strip);
    });
  }

  node.classList.toggle('is-frozen', !live);
  let i = 0;
  [...text].forEach(ch => {
    if (!/\d/.test(ch)) return;
    const strip = node.__cells[i];
    strip.style.setProperty('--d', ch);
    strip.style.setProperty('--n', node.__cells.length - i);
    i++;
  });
}

/* ---------------------------------------------------- курсы валют */
async function ensureRates(base){
  if (state.rateBase === base && state.rates && Date.now() - state.rateStamp < RATES_TTL) return true;

  const cached = load(STORE_RATES);
  if (cached && cached.base === base && Date.now() - cached.at < RATES_TTL){
    state.rates = cached.rates; state.rateStamp = cached.at; state.rateBase = base;
    return true;
  }

  state.loading = true;
  nodes.rate.classList.add('is-loading');
  nodes.rate.textContent = 'Загружаю курс…';

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    const data = await res.json();
    if (data.result !== 'success') throw new Error('bad result');
    state.rates = data.rates; state.rateStamp = Date.now(); state.rateBase = base;
    store(STORE_RATES, { base, rates:data.rates, at:state.rateStamp });
    return true;
  } catch {
    if (cached && cached.base === base){
      state.rates = cached.rates; state.rateStamp = cached.at; state.rateBase = base;
      return 'stale';
    }
    return false;
  } finally {
    state.loading = false;
    nodes.rate.classList.remove('is-loading');
  }
}

/* ---------------------------------------------------- пересчёт */
async function recalc(animate = true){
  const amount = parseFloat(state.input.replace(',', '.')) || 0;

  if (state.mode === 'units'){
    const cat = state.category;
    const from = state.from[cat], to = state.to[cat];
    const result = CVT.convertUnit(amount, cat, from, to);
    setValue(nodes.valueTo, result, animate);
    const one = CVT.convertUnit(1, cat, from, to);
    const u = CVT.UNITS[cat].units;
    nodes.rate.innerHTML = cat === 'temperature'
      ? `${u[from].name} → ${u[to].name}`
      : `1 ${u[from].short} = <b>${fmt(one)}</b> ${u[to].short}`;
    flash();
    return;
  }

  const from = state.from.currency, to = state.to.currency;
  if (from === to){
    setValue(nodes.valueTo, amount, animate);
    nodes.rate.innerHTML = '1 : 1';
    flash();
    return;
  }

  const ok = await ensureRates(from);
  if (!ok){
    nodes.valueTo.textContent = '—';
    nodes.rate.textContent = 'Нет связи с сервисом курсов';
    return;
  }

  const rate = state.rates[to];
  if (rate == null){
    nodes.valueTo.textContent = '—';
    nodes.rate.textContent = `Курс ${to} недоступен`;
    return;
  }

  setValue(nodes.valueTo, amount * rate, animate);
  const when = new Date(state.rateStamp).toLocaleDateString('ru-RU', { day:'numeric', month:'short' });
  nodes.rate.innerHTML = `1 ${from} = <b>${fmt(rate)}</b> ${to}` +
    (ok === 'stale' ? ` · данные от ${when}` : '');
  flash();
}

function flash(){
  nodes.cardTo.classList.remove('is-fresh');
  void nodes.cardTo.offsetWidth;
  nodes.cardTo.classList.add('is-fresh');
}

/* ---------------------------------------------------- отрисовка шапок */
function labelFor(side){
  if (state.mode === 'currency'){
    const code = state[side].currency;
    const c = CVT.CURRENCIES[code];
    return { code, name:`${c.flag} ${c.name}` };
  }
  const cat = state.category;
  const key = state[side][cat];
  const u = CVT.UNITS[cat].units[key];
  return { code:u.short, name:u.name };
}

/* если подпись сменилась — перезапускаем на ней анимацию */
function markChanged(pick, code, name, key){
  if (pick.__last === key) return;
  const first = pick.__last === undefined;
  pick.__last = key;
  if (first || document.hidden) return;
  pick.classList.remove('is-changed'); void pick.offsetWidth; pick.classList.add('is-changed');
}

function render(){
  const a = labelFor('from'), b = labelFor('to');
  markChanged($('pickFrom'), a.code, a.name, a.code + a.name);
  markChanged($('pickTo'),   b.code, b.name, b.code + b.name);
  nodes.codeFrom.textContent = a.code; nodes.nameFrom.textContent = a.name;
  nodes.codeTo.textContent = b.code;   nodes.nameTo.textContent = b.name;
  nodes.valueFrom.textContent = state.input || '0';
  nodes.valueFrom.classList.toggle('is-empty', !state.input);
  nodes.head.hidden = state.mode !== 'units';
  if (state.mode === 'units') nodes.catLabel.textContent = CVT.UNITS[state.category].title;
}

/* ---------------------------------------------------- лист выбора */
let sheetTarget = null;

function openSheet(side){
  sheetTarget = side;
  const list = nodes.sheetList;
  list.innerHTML = '';

  const isCurrency = state.mode === 'currency';
  nodes.sheetTitle.textContent = isCurrency ? 'Выбери валюту' : 'Выбери единицу';

  const entries = isCurrency
    ? Object.entries(CVT.CURRENCIES).map(([k, v]) => ({ key:k, flag:v.flag, code:k, word:v.name }))
    : Object.entries(CVT.UNITS[state.category].units).map(([k, v]) => ({ key:k, flag:'', code:v.short, word:v.name }));

  const current = isCurrency ? state[side].currency : state[side][state.category];

  entries.forEach(e => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sheet__item' + (e.key === current ? ' is-on' : '');
    btn.innerHTML =
      (e.flag ? `<span class="sheet__flag">${e.flag}</span>` : '') +
      `<span class="sheet__code">${e.code}</span>` +
      `<span class="sheet__word">${e.word}</span>` +
      `<span class="sheet__tick">●</span>`;
    btn.addEventListener('click', () => {
      if (isCurrency) state[side].currency = e.key;
      else state[side][state.category] = e.key;
      haptic('light'); click(.8);
      closeSheet();
      render(); recalc();
    });
    list.appendChild(btn);
  });

  nodes.sheet.hidden = false;
  requestAnimationFrame(() => nodes.sheet.classList.add('is-open'));
  if (tg && tg.BackButton){ tg.BackButton.show(); }
}

function openCategorySheet(){
  const list = nodes.sheetList;
  list.innerHTML = '';
  nodes.sheetTitle.textContent = 'Что конвертируем';

  Object.entries(CVT.UNITS).forEach(([key, cat]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sheet__item' + (key === state.category ? ' is-on' : '');
    btn.innerHTML =
      `<svg class="sheet__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
         <path d="${CVT.ICONS[key]}"/>
       </svg>` +
      `<span class="sheet__word" style="flex:1">${cat.title}</span>` +
      `<span class="sheet__tick">●</span>`;
    btn.addEventListener('click', () => {
      state.category = key;
      haptic('light');
      closeSheet();
      render(); recalc();
    });
    list.appendChild(btn);
  });

  nodes.sheet.hidden = false;
  requestAnimationFrame(() => nodes.sheet.classList.add('is-open'));
  if (tg && tg.BackButton){ tg.BackButton.show(); }
}

function closeSheet(){
  nodes.sheet.classList.remove('is-open');
  if (tg && tg.BackButton){ tg.BackButton.hide(); }
  setTimeout(() => { nodes.sheet.hidden = true; }, cfg.dur * 1100);
}

/* ---------------------------------------------------- звук клавиш
   Щелчок синтезируется на лету: короткий шумовой всплеск через полосовой
   фильтр плюс низкий «тук». Файлов не нужно — работает офлайн и не весит. */
const SOUNDS = { tick:'Клавиатура', pop:'Пузырёк', wood:'Дерево', glass:'Стекло' };

const TONES = {
  tick:  { freq:2300, q:1.1, len:.028, thock:180, thockGain:.5 },
  pop:   { freq:900,  q:2.4, len:.05,  thock:320, thockGain:.9 },
  wood:  { freq:1400, q:3.2, len:.06,  thock:220, thockGain:1.2 },
  glass: { freq:5200, q:.8,  len:.045, thock:0,   thockGain:0 }
};

let actx = null, noise = null;

function audio(){
  if (actx) return actx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  actx = new Ctx();

  /* полсекунды белого шума — переиспользуем на каждый щелчок */
  noise = actx.createBuffer(1, actx.sampleRate * .5, actx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return actx;
}

function click(strength = 1){
  if (!cfg.soundOn || !cfg.volume) return;
  const ctx = audio();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const t = ctx.currentTime;
  const tone = TONES[cfg.sound] || TONES.tick;
  const vol = cfg.volume * strength;

  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = .8 + Math.random() * .4;   /* лёгкий разброс, чтобы не звучало механически */

  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = tone.freq * (.94 + Math.random() * .12);
  band.Q.value = tone.q;

  const env = ctx.createGain();
  env.gain.setValueAtTime(vol * .5, t);
  env.gain.exponentialRampToValueAtTime(.0001, t + tone.len);

  src.connect(band).connect(env).connect(ctx.destination);
  src.start(t);
  src.stop(t + tone.len + .02);

  if (!tone.thock) return;
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(tone.thock, t);
  osc.frequency.exponentialRampToValueAtTime(tone.thock * .55, t + .04);
  const og = ctx.createGain();
  og.gain.setValueAtTime(vol * .09 * tone.thockGain, t);
  og.gain.exponentialRampToValueAtTime(.0001, t + .05);
  osc.connect(og).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + .06);
}

/* ---------------------------------------------------- ввод */
function haptic(kind){
  if (!cfg.hapticOn || !tg || !tg.HapticFeedback) return;
  try { tg.HapticFeedback.impactOccurred(kind); } catch {}
}

function press(key){
  if (key === 'del'){
    state.input = state.input.slice(0, -1);
  } else if (key === '.'){
    if (!state.input.includes(',')) state.input = (state.input || '0') + ',';
  } else {
    if (state.input === '0') state.input = '';
    if (state.input.replace(/[^\d]/g, '').length >= 12) return;
    state.input += key;
  }
  render();
  recalc();
}

/* волна: чем дальше клавиша от нажатой по сетке 3×4, тем позже вздрагивает */
function waveFrom(btn){
  if (!cfg.waveOn) return;
  const keys = [...nodes.pad.children];
  const at = keys.indexOf(btn);
  const col = i => i % 3, row = i => Math.floor(i / 3);
  keys.forEach((k, i) => {
    const dist = Math.abs(col(i) - col(at)) + Math.abs(row(i) - row(at));
    if (!dist) return;
    k.style.setProperty('--w', dist);
    k.classList.remove('is-wave'); void k.offsetWidth; k.classList.add('is-wave');
  });
}

function pulseAura(){
  if (!cfg.auraOn) return;
  const a = nodes.aura;
  a.classList.remove('is-hit'); void a.offsetWidth; a.classList.add('is-hit');
}

nodes.pad.addEventListener('pointerdown', e => {
  const btn = e.target.closest('.pad__key');
  if (!btn) return;
  btn.classList.remove('is-hit'); void btn.offsetWidth; btn.classList.add('is-hit');
  waveFrom(btn);
  pulseAura();
  haptic('light');
  click(btn.dataset.key === 'del' ? 1.25 : 1);   /* стирание звучит чуть весомее */
  press(btn.dataset.key);
});

window.addEventListener('keydown', e => {
  if (e.target.closest('.tw')) return;
  if (/^[0-9]$/.test(e.key)) press(e.key);
  else if (e.key === ',' || e.key === '.') press('.');
  else if (e.key === 'Backspace') press('del');
});

/* ---------------------------------------------------- переключатели */
document.querySelectorAll('.tabs__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    if (mode === state.mode) return;
    state.mode = mode;
    document.querySelectorAll('.tabs__btn').forEach(b => b.classList.toggle('is-active', b === btn));
    nodes.tabInk.classList.toggle('is-right', mode === 'units');
    haptic('light'); click(1.1);
    render(); recalc();
  });
});

nodes.swap.addEventListener('click', () => {
  const swapState = () => {
    if (state.mode === 'currency'){
      [state.from.currency, state.to.currency] = [state.to.currency, state.from.currency];
    } else {
      const c = state.category;
      [state.from[c], state.to[c]] = [state.to[c], state.from[c]];
    }
    render(); recalc();
  };

  nodes.swap.classList.toggle('is-turned');
  haptic('medium');
  click(1.4);
  pulseAura();

  /* в фоне анимации заморожены — там меняем содержимое сразу,
     иначе карточки остались бы перевёрнутыми со старыми данными */
  if (!cfg.flipOn || document.hidden){ swapState(); return; }

  [nodes.cardFrom, nodes.cardTo].forEach(card => {
    card.classList.remove('is-flipping'); void card.offsetWidth; card.classList.add('is-flipping');
  });
  /* подменяем данные на середине переворота, когда карточки стоят ребром */
  setTimeout(swapState, cfg.dur * 650);
});

$('pickFrom').addEventListener('click', () => { haptic('light'); openSheet('from'); });
$('pickTo').addEventListener('click',   () => { haptic('light'); openSheet('to'); });
nodes.head.addEventListener('click',    () => { haptic('light'); openCategorySheet(); });

nodes.sheet.addEventListener('click', e => { if (e.target.dataset.close) closeSheet(); });

/* вернулись из фона — дорисовываем то, что не успел показать замороженный rAF */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) recalc(false);
});
if (tg && tg.onEvent){ tg.onEvent('backButtonClicked', closeSheet); }

/* ---------------------------------------------------- старт */
document.querySelectorAll('[data-rise]').forEach(el => {
  el.style.setProperty('--i', el.dataset.rise);
});

if (tg){
  try { tg.ready(); tg.expand(); if (tg.disableVerticalSwipes) tg.disableVerticalSwipes(); } catch {}
}

apply();
render();
recalc(false);

/* Показать интерфейс. Через rAF анимация стартует ровно после первой отрисовки,
   но в фоновой вкладке rAF не вызывается вовсе — поэтому дублируем таймером,
   иначе приложение навсегда осталось бы с opacity:0. */
function reveal(){ document.body.classList.add('is-ready'); }
/* когда появление заведомо должно было закончиться — фиксируем результат */
function settle(){ document.body.classList.add('is-shown'); }

function dropIntro(){
  if (!nodes.intro || nodes.intro.hidden) return;
  nodes.intro.classList.add('is-gone');
  setTimeout(() => { nodes.intro.hidden = true; }, cfg.introDur * 260);
}

function boot(){
  reveal();
  setTimeout(settle, (cfg.riseStep * 7 + cfg.dur * 1.4) * 1000 + 400);
}

if (!cfg.introOn){
  nodes.intro.hidden = true;
  requestAnimationFrame(boot);
  setTimeout(boot, 80);
} else {
  /* интро закрывается по таймеру, а не по animationend: в фоновой вкладке
     анимации не идут и событие не пришло бы — заставка осталась бы навсегда */
  setTimeout(() => { dropIntro(); boot(); }, cfg.introDur * 760);
}
/* последний рубеж на случай любых сюрпризов с анимацией */
setTimeout(() => { dropIntro(); reveal(); settle(); }, cfg.introDur * 1000 + 2500);

/* проиграть появление заново — кнопка в твикере */
function replayRise(){
  document.body.classList.remove('is-ready', 'is-shown');
  void document.body.offsetWidth;
  boot();
}

/* повторный показ заставки — кнопка в твикере */
function replayIntro(){
  const old = nodes.intro;
  const fresh = old.cloneNode(true);   /* клон перезапускает CSS-анимации с нуля */
  fresh.hidden = false;
  fresh.classList.remove('is-gone');
  old.replaceWith(fresh);
  nodes.intro = fresh;
  setTimeout(dropIntro, cfg.introDur * 760);
}

/* наружу — для твикера */
Object.assign(CVT, {
  cfg, DEFAULTS, PALETTES, FONTS, EASE, CARD_ANIMS, SOUNDS, QUALITY, click,
  apply, save, reset, usePalette, render, recalc, replayIntro, replayRise
});

})();
