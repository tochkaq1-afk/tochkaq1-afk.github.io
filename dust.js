/* ============================================================
   Пыль. Знак, набранный десятками тысяч частиц, который умеет
   перетекать из одной фигуры в другую.

   Частицы бесконечно текут по контуру, курсор их расталкивает,
   пружина тянёт назад — валик по краю проплешины получается сам.

   Рисуем не fillRect'ами (сдохнет на 10 тысячах), а прямой
   записью в буфер пикселей через Uint32Array — так держим 60 fps
   на 50-80 тысячах частиц без WebGL.
   ============================================================ */
(() => {
'use strict';

const PF = window.PF;
if (!PF) return;

const canvas = document.querySelector('.art__c');
if (!canvas) return;
/* холст прозрачный: под ним печатается код, и непрозрачный фон закрывал бы
   его целиком. Плата за это — композитинг слоя, на 50 тысячах частиц незаметно */
const ctx = canvas.getContext('2d', { alpha:true });
const cfg = PF.cfg;

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAB = 2048;

/* ---------------------------------------------- фигуры */
/* Каждая фигура — функция доли обхода t (0..1) в точку внутри
   рамки x ∈ [-1,1], y ∈ [-0.5,0.5]. Контуры только замкнутые:
   у разомкнутых частицы телепортировались бы с конца в начало. */

/* обход многоугольника по периметру, равномерно по длине */
function poly(pts){
  const n = pts.length;
  const seg = [], acc = [0];
  for (let i = 0; i < n; i++){
    const a = pts[i], b = pts[(i + 1) % n];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(L); acc.push(acc[i] + L);
  }
  const total = acc[n];
  return t => {
    const d = ((t % 1) + 1) % 1 * total;
    let i = 0;
    while (i < n - 1 && acc[i + 1] < d) i++;
    const k = seg[i] ? (d - acc[i]) / seg[i] : 0;
    const a = pts[i], b = pts[(i + 1) % n];
    return [ a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k ];
  };
}

const infF = t => { const a = t * Math.PI * 2; return [Math.cos(a), Math.sin(a) * Math.cos(a)]; };

/* w — множитель толщины штриха: у стрелки перекладина узкая, и штрих,
   подобранный под бесконечность, залил бы её в кляксу */
const SHAPES = {
  inf:       { name:'Бесконечность',       f: infF,              w:1 },
  infBack:   { name:'Бесконечность назад', f: t => infF(1 - t),  w:1 },
  arrowDown: { name:'Стрелка вниз',        w:0.34,
    f: poly([[-0.10,-0.5],[0.10,-0.5],[0.10,0.12],[0.34,0.12],[0,0.5],[-0.34,0.12],[-0.10,0.12]]) }
};

const cache = {};
function table(key){
  if (cache[key]) return cache[key];
  const f = (SHAPES[key] || SHAPES.inf).f;
  const x = new Float32Array(TAB), y = new Float32Array(TAB);
  const nx = new Float32Array(TAB), ny = new Float32Array(TAB);
  for (let i = 0; i < TAB; i++){
    const p = f(i / TAB);
    x[i] = p[0]; y[i] = p[1];
  }
  /* нормали считаем разностью с соседом — годится для любой фигуры,
     не надо выводить производную под каждую отдельно */
  for (let i = 0; i < TAB; i++){
    const j = (i + 1) % TAB, k = (i - 1 + TAB) % TAB;
    const dx = x[j] - x[k], dy = y[j] - y[k];
    const len = Math.hypot(dx, dy) || 1;
    nx[i] = -dy / len; ny[i] = dx / len;
  }
  return (cache[key] = { x, y, nx, ny });
}

/* ---------------------------------------------- состояние морфа */
let order = [], oi = 0;
let from = table('inf'), to = from, mix = 1, hold = 0;
let fromW = 1, toW = 1;

function shapeList(){
  const list = String(cfg.dustShapes).split('|').map(s => s.trim()).filter(s => SHAPES[s]);
  return list.length ? list : ['inf'];
}

function morphTo(key){
  if (!SHAPES[key]) return;
  fromW = mix < 1 ? fromW + (toW - fromW) * ease(mix) : toW;
  from = blend();          /* стартуем с того, что видно сейчас */
  to = table(key);
  toW = SHAPES[key].w == null ? 1 : SHAPES[key].w;
  mix = 0; hold = 0;
  cfg.dustShape = key;
}

/* мгновенный снимок текущей смеси — чтобы морф не рвался,
   если его переключили на полпути */
function blend(){
  if (mix >= 1) return to;
  const x = new Float32Array(TAB), y = new Float32Array(TAB);
  const nx = new Float32Array(TAB), ny = new Float32Array(TAB);
  const e = ease(mix);
  for (let i = 0; i < TAB; i++){
    x[i] = from.x[i] + (to.x[i] - from.x[i]) * e;
    y[i] = from.y[i] + (to.y[i] - from.y[i]) * e;
    nx[i] = from.nx[i] + (to.nx[i] - from.nx[i]) * e;
    ny[i] = from.ny[i] + (to.ny[i] - from.ny[i]) * e;
  }
  return { x, y, nx, ny };
}

const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

function resetOrder(){
  order = shapeList();
  oi = Math.max(0, order.indexOf(cfg.dustShape));
}

function nextShape(){
  if (!order.length) resetOrder();
  oi = (oi + 1) % order.length;
  morphTo(order[oi]);
}

/* ---------------------------------------------- частицы */
let N = 0;
let px, py, vx, vy, pidx, poff, pjx, pjy, psx, psy, pcol, psz;

/* Потолок числа частиц по силе устройства. Пятьдесят тысяч точек честно
   считаются на десктопе и убивают телефон: там и ядер вчетверо меньше, и
   каждая точка рисуется на экран с двойной плотностью. Бюджет берём от
   числа ядер и памяти, а на узком экране режем ещё вдвое — на телефоне
   фигура и так мельче, разницы в плотности не видно.

   Твикер по-прежнему главный: если руками выставили меньше потолка,
   уважаем это число и ничего не поднимаем. */
function dustBudget(){
  const cores = navigator.hardwareConcurrency || 4;
  const mem   = navigator.deviceMemory || 4;
  const small = Math.min(innerWidth, innerHeight) < 760;
  const touch = matchMedia('(hover:none)').matches;

  let cap = cores >= 8 && mem >= 8 ? 52000
          : cores >= 4 && mem >= 4 ? 26000
          : 12000;
  if (small || touch) cap = Math.min(cap, 9000);
  /* на экране с двойной плотностью каждая точка стоит вчетверо дороже */
  if (devicePixelRatio > 1.5) cap = Math.round(cap * .6);
  return cap;
}

function spawn(){
  N = Math.max(500, Math.min(Math.round(cfg.dustCount), dustBudget()));
  px = new Float32Array(N); py = new Float32Array(N);
  vx = new Float32Array(N); vy = new Float32Array(N);
  pidx = new Float32Array(N); poff = new Float32Array(N);
  pjx = new Float32Array(N);  pjy = new Float32Array(N);
  psx = new Float32Array(N);  psy = new Float32Array(N);
  pcol = new Uint32Array(N);  psz = new Uint8Array(N);

  for (let i = 0; i < N; i++){
    pidx[i] = Math.random() * TAB;
    /* треугольное распределение по толщине: плотно в середине штриха,
       редко по краям — так край выглядит осыпающимся, а не обведённым */
    poff[i] = Math.random() + Math.random() - 1;
    pjx[i] = (Math.random() - .5);
    pjy[i] = (Math.random() - .5);
    psx[i] = Math.random();
    psy[i] = Math.random();
    psz[i] = Math.random() < .12 ? 2 : 1;
  }
  paint();
}

/* ---------------------------------------------- цвета */
let shades = new Uint32Array(1);

const hex2rgb = h => {
  h = String(h).replace('#','');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const v = parseInt(h, 16);
  return [ (v >> 16) & 255, (v >> 8) & 255, v & 255 ];
};
const pack = (r, g, b, a = 255) => (a << 24) | (b << 16) | (g << 8) | r;

function paint(){
  const ink = hex2rgb(cfg.ink), ac = hex2rgb(cfg.accent);
  const steps = 10;
  shades = new Uint32Array(steps * 2);
  for (let i = 0; i < steps; i++){
    const a = cfg.dustMin + (1 - cfg.dustMin) * (i / (steps - 1));
    /* слабость крупинки — это прозрачность, а не подмешанный фон:
       на прозрачном холсте подмешанный фон закрывал бы код под знаком
       непрозрачными пятнами цвета бумаги */
    const alpha = Math.round(255 * a);
    shades[i] = pack(ink[0], ink[1], ink[2], alpha);
    shades[steps + i] = pack(ac[0], ac[1], ac[2], alpha);
  }
  if (!pcol) return;
  for (let i = 0; i < N; i++){
    const s = Math.floor(Math.random() * steps);
    pcol[i] = shades[(Math.random() < cfg.dustAccent ? steps : 0) + s];
  }
}

/* ---------------------------------------------- размер */
let W = 0, H = 0, DPR = 1, img = null, buf = null, bgWord = 0, fitted = 1, cx = 0, cy = 0;

function resize(){
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  DPR = Math.min(devicePixelRatio || 1, 1.5);
  W = Math.max(2, Math.round(r.width  * DPR));
  H = Math.max(2, Math.round(r.height * DPR));
  canvas.width = W; canvas.height = H;
  img = ctx.createImageData(W, H);
  buf = new Uint32Array(img.data.buffer);
  fitted = Math.min(W / 2.15, H / 1.05) * cfg.dustScale;
  cx = W / 2; cy = H / 2;
  /* фон буфера — полная прозрачность, а не цвет страницы: иначе холст
     закрасил бы код, который печатается под ним */
  bgWord = 0;
}

new ResizeObserver(resize).observe(canvas);

/* ---------------------------------------------- курсор */
let mx = -9999, my = -9999;
addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect();
  mx = (e.clientX - r.left) * DPR;
  my = (e.clientY - r.top)  * DPR;
}, { passive:true });
addEventListener('pointerleave', () => { mx = my = -9999; });

/* клик по знаку — перейти к следующей фигуре не дожидаясь таймера */
canvas.addEventListener('click', () => nextShape());

/* ---------------------------------------------- сборка по таймлайну */
let build = 1;
function setBuild(v){ build = v < 0 ? 0 : v > 1 ? 1 : v; }

/* ---------------------------------------------- кадр */
let flow = 0, last = 0;

/* Знак живёт только пока он на экране. Без этого 50 тысяч частиц
   пересчитываются и перерисовываются даже когда главный экран уехал вверх, —
   и вся страница листается рывками, хотя виновника не видно. */
let onScreen = true, covered = false;
/* первый экран залипает и его накрывает следующая секция: холст формально
   в зоне видимости, но его не видно — считать частицы всё это время незачем.
   Сам выключатель отдаём наружу вместе с остальным API, ниже. */
function setCovered(v){ covered = !!v; if (!covered) last = 0; }
if ('IntersectionObserver' in window){
  new IntersectionObserver(es => {
    onScreen = es[0].isIntersecting;
    last = 0;              /* вернулись — считаем кадр заново, иначе dt огромный */
  }, { rootMargin:'120px' }).observe(canvas);
}

function frame(now){
  requestAnimationFrame(frame);
  if (!buf || !cfg.dustOn || !N || !onScreen || covered) return;

  const dt = last ? Math.min((now - last) / 1000, .05) : .016;
  last = now;

  /* морф и автосмена */
  if (mix < 1){
    mix = Math.min(1, mix + dt / Math.max(cfg.dustMorph, .05));
    if (mix >= 1){ from = to; }
  } else if (cfg.dustAuto && !REDUCED){
    hold += dt;
    if (hold >= cfg.dustHold) nextShape();
  }

  const e = ease(mix);
  const morphing = mix < 1;
  /* на середине перехода даём частицам разлететься — иначе фигура
     просто «переползает», а нам нужно ощущение осыпающейся пыли */
  const chaos = morphing ? Math.sin(mix * Math.PI) * cfg.dustChaos * DPR : 0;

  buf.fill(bgWord);

  const wMul = morphing ? fromW + (toW - fromW) * e : toW;
  const halfW = cfg.dustWidth * DPR * wMul;
  const jit = cfg.dustJitter * DPR;
  const R = cfg.dustRadius * DPR;
  const R2 = R * R;
  const push = cfg.dustPush * DPR;
  const spring = cfg.dustSpring;
  const fric = cfg.dustFriction;
  const still = REDUCED;

  if (!still) flow += cfg.dustFlow;

  const fx = from.x, fy = from.y, fnx = from.nx, fny = from.ny;
  const tx2 = to.x, ty2 = to.y, tnx = to.nx, tny = to.ny;

  for (let i = 0; i < N; i++){
    let k = pidx[i] + flow;
    k -= Math.floor(k / TAB) * TAB;
    const i0 = k | 0;

    /* точка контура: смесь двух фигур */
    let bx, by, bnx, bny;
    if (morphing){
      bx  = fx[i0]  + (tx2[i0] - fx[i0])  * e;
      by  = fy[i0]  + (ty2[i0] - fy[i0])  * e;
      bnx = fnx[i0] + (tnx[i0] - fnx[i0]) * e;
      bny = fny[i0] + (tny[i0] - fny[i0]) * e;
    } else {
      bx = tx2[i0]; by = ty2[i0]; bnx = tnx[i0]; bny = tny[i0];
    }

    const off = poff[i] * halfW;
    const hx = cx + bx * fitted + bnx * off + pjx[i] * (jit + chaos);
    const hy = cy + by * fitted + bny * off + pjy[i] * (jit + chaos);

    let tX = hx, tY = hy;
    if (build < 1){
      const sx = psx[i] * W, sy = psy[i] * H;
      tX = sx + (hx - sx) * build;
      tY = sy + (hy - sy) * build;
    }

    let x = px[i], y = py[i];
    if (still){ x = tX; y = tY; }
    else {
      let ax = (tX - x) * spring, ay = (tY - y) * spring;

      const dx = x - mx, dy = y - my;
      const d2 = dx*dx + dy*dy;
      if (d2 < R2 && d2 > .01){
        const d = Math.sqrt(d2);
        const f = (1 - d / R) * push / d;
        ax += dx * f; ay += dy * f;
      }

      const ux = (vx[i] + ax) * fric, uy = (vy[i] + ay) * fric;
      vx[i] = ux; vy[i] = uy;
      x += ux; y += uy;
    }
    px[i] = x; py[i] = y;

    const ix = x | 0, iy = y | 0;
    if (ix < 0 || iy < 0 || ix >= W - 1 || iy >= H - 1) continue;
    const c = pcol[i], o = iy * W + ix;
    buf[o] = c;
    if (psz[i] === 2){
      buf[o + 1] = c; buf[o + W] = c; buf[o + W + 1] = c;
    }
  }

  ctx.putImageData(img, 0, 0);
}

/* ---------------------------------------------- наружу */
PF.dust = {
  cover: setCovered,
  SHAPES,
  respawn(){ spawn(); },
  repaint(){ paint(); resize(); },
  resize, setBuild, morphTo, nextShape, resetOrder,
  get shape(){ return cfg.dustShape; },
  get count(){ return N; },
  /* для отладки: посмотреть, где на самом деле «дом» частицы */
  probe(){
    const k = 512;
    return { build, mix, fitted, cx, cy, W, H, DPR, toW, fromW,
      toX:to.x[k], toY:to.y[k], toNX:to.nx[k], toNY:to.ny[k],
      halfW:cfg.dustWidth * DPR * toW,
      homeX:cx + to.x[k] * fitted, homeY:cy + to.y[k] * fitted };
  }
};

resize();
spawn();
const startKey = cfg.dustShape in SHAPES ? cfg.dustShape : 'inf';
to = from = table(startKey);
toW = fromW = SHAPES[startKey].w == null ? 1 : SHAPES[startKey].w;
mix = 1;
resetOrder();
for (let i = 0; i < N; i++){ px[i] = psx[i] * W; py[i] = psy[i] * H; }
requestAnimationFrame(frame);

})();
