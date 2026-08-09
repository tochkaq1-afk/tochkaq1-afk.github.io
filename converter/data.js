/* ============================================================
   Справочники: валюты и единицы измерения.
   Единственное место, где живут коды, названия и коэффициенты.
   ============================================================ */
window.CVT = window.CVT || {};

CVT.CURRENCIES = {
  USD: { flag:'🇺🇸', name:'Доллар США' },
  EUR: { flag:'🇪🇺', name:'Евро' },
  BYN: { flag:'🇧🇾', name:'Белорусский рубль' },
  RUB: { flag:'🇷🇺', name:'Российский рубль' },
  PLN: { flag:'🇵🇱', name:'Злотый' },
  UAH: { flag:'🇺🇦', name:'Гривна' },
  KZT: { flag:'🇰🇿', name:'Тенге' },
  GBP: { flag:'🇬🇧', name:'Фунт стерлингов' },
  CHF: { flag:'🇨🇭', name:'Швейцарский франк' },
  CNY: { flag:'🇨🇳', name:'Юань' },
  JPY: { flag:'🇯🇵', name:'Иена' },
  TRY: { flag:'🇹🇷', name:'Турецкая лира' },
  AED: { flag:'🇦🇪', name:'Дирхам' },
  GEL: { flag:'🇬🇪', name:'Лари' },
  CZK: { flag:'🇨🇿', name:'Чешская крона' },
  SEK: { flag:'🇸🇪', name:'Шведская крона' }
};

/* Иконки категорий — векторные, а не символы шрифта: телефоны рисуют
   знаки вроде «⚖» и «➤» по-своему, часть подменяют цветными эмодзи,
   а часть не находят вовсе и показывают пустой прямоугольник. */
CVT.ICONS = {
  length:'M3 12h18M3 12l3.5-3.5M3 12l3.5 3.5M21 12l-3.5-3.5M21 12l-3.5 3.5',
  mass:'M12 4.5v15M7.5 19.5h9M4.5 8h15M12 6.5 4.5 8M12 6.5 19.5 8M4.5 8 2 14a2.6 2.6 0 0 0 5 0zM19.5 8 17 14a2.6 2.6 0 0 0 5 0z',
  volume:'M12 3.5c3.8 4.8 5.8 7.4 5.8 9.8a5.8 5.8 0 0 1-11.6 0c0-2.4 2-5 5.8-9.8z',
  temperature:'M14 13.6V5.5a2 2 0 1 0-4 0v8.1a4 4 0 1 0 4 0zM12 9.5v6',
  area:'M4 4h16v16H4zM4 12h16M12 4v16',
  speed:'M3.5 17a8.5 8.5 0 0 1 17 0M12 17l4.5-5.5M12 17h.01'
};

/* Коэффициенты — во сколько базовых единиц превращается одна такая.
   У температуры коэффициентов нет, для неё отдельные формулы ниже. */
CVT.UNITS = {
  length: {
    title:'Длина',
    units:{
      mm:{ name:'Миллиметр', short:'мм', k:0.001 },
      cm:{ name:'Сантиметр', short:'см', k:0.01 },
      m: { name:'Метр',      short:'м',  k:1 },
      km:{ name:'Километр',  short:'км', k:1000 },
      in:{ name:'Дюйм',      short:'дюйм', k:0.0254 },
      ft:{ name:'Фут',       short:'фут', k:0.3048 },
      yd:{ name:'Ярд',       short:'ярд', k:0.9144 },
      mi:{ name:'Миля',      short:'миля', k:1609.344 }
    }
  },
  mass: {
    title:'Вес',
    units:{
      g:  { name:'Грамм',      short:'г',  k:0.001 },
      kg: { name:'Килограмм',  short:'кг', k:1 },
      t:  { name:'Тонна',      short:'т',  k:1000 },
      oz: { name:'Унция',      short:'унц', k:0.028349523125 },
      lb: { name:'Фунт',       short:'фнт', k:0.45359237 }
    }
  },
  volume: {
    title:'Объём',
    units:{
      ml: { name:'Миллилитр',   short:'мл',  k:0.001 },
      l:  { name:'Литр',        short:'л',   k:1 },
      m3: { name:'Кубометр',    short:'м³',  k:1000 },
      gal:{ name:'Галлон US',   short:'гал', k:3.785411784 },
      pt: { name:'Пинта US',    short:'пинт',  k:0.473176473 }
    }
  },
  temperature: {
    title:'Температура',
    units:{
      c:{ name:'Цельсий',    short:'°C', k:null },
      f:{ name:'Фаренгейт',  short:'°F', k:null },
      k:{ name:'Кельвин',    short:'K',  k:null }
    }
  },
  area: {
    title:'Площадь',
    units:{
      cm2:{ name:'Кв. сантиметр', short:'см²', k:0.0001 },
      m2: { name:'Кв. метр',      short:'м²',  k:1 },
      a:  { name:'Сотка',         short:'сот', k:100 },
      ha: { name:'Гектар',        short:'га',  k:10000 },
      km2:{ name:'Кв. километр',  short:'км²', k:1000000 },
      ft2:{ name:'Кв. фут',       short:'фут²', k:0.09290304 }
    }
  },
  speed: {
    title:'Скорость',
    units:{
      ms:  { name:'Метр в секунду', short:'м/с',  k:1 },
      kmh: { name:'Км в час',       short:'км/ч', k:0.2777777778 },
      mph: { name:'Мили в час',     short:'миль/ч',  k:0.44704 },
      kn:  { name:'Узел',           short:'уз',   k:0.5144444444 }
    }
  }
};

CVT.toCelsius = (v, u) =>
  u === 'c' ? v : u === 'f' ? (v - 32) * 5 / 9 : v - 273.15;

CVT.fromCelsius = (v, u) =>
  u === 'c' ? v : u === 'f' ? v * 9 / 5 + 32 : v + 273.15;

CVT.convertUnit = (value, cat, from, to) => {
  if (cat === 'temperature') return CVT.fromCelsius(CVT.toCelsius(value, from), to);
  const u = CVT.UNITS[cat].units;
  return value * u[from].k / u[to].k;
};
