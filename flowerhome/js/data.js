/* ============================================================
   FlowerHome — данные сайта
   Контакты, тексты и каталог перенесены с flower-home.by
   ============================================================ */

const SITE = {
  name: 'FlowerHome',
  tagline: 'Цветы с доставкой на дом в Минске',
  phone: '+375 (29) 669-09-81',
  phoneHref: 'tel:+375296690981',
  email: 'flowerhome_by@mail.ru',
  address: 'г. Минск, ул. Маяковского 146',
  hours: 'Понедельник — Воскресенье, 09:00 — 21:00',
  socials: [
    { name: 'Instagram', handle: '@flowerhome_by', url: 'https://instagram.com/flowerhome_by' },
    { name: 'TikTok',    handle: '@flowerhome_by', url: 'https://tiktok.com/@flowerhome_by' },
    { name: 'Telegram',  handle: '+375 29 669-09-81', url: 'https://t.me/+375296690981' },
    { name: 'Viber',     handle: '+375 29 669-09-81', url: 'viber://chat?number=%2B375296690981' }
  ],
  legal: {
    entity: 'ИП Мазуро Татьяна Ивановна',
    unp: 'УНП 192435011',
    regAddress: '220020, г. Минск, пр. Победителей д. 95 корп. 1 кв. 334',
    account: 'BY40MTBK30130001093300077956',
    bank: 'ЗАО «МТБанк», БИК MTBKBY22, УНП 100394906',
    registry: 'В Торговом реестре с 05.09.2024'
  }
};

/* ---------- Доставка и оплата (с оригинала) ---------- */

const DELIVERY = {
  tiers: [
    { zone: 'Заказ от 170 BYN', price: 'бесплатно', note: 'в пределах МКАД' },
    { zone: 'В пределах МКАД',  price: '20 BYN',    note: 'в любую точку города' },
    { zone: 'За МКАД до 15 км', price: '30 BYN',    note: 'пригород Минска' },
    { zone: 'Дальше 15 км',     price: 'по тарифам Яндекс-такси', note: 'рассчитаем индивидуально' }
  ],
  facts: [
    'Заказы принимаем с 9:00 до 20:30, доставляем с 9:00 до 21:00',
    'При заказе от 70 BYN доставим в течение двух часов',
    'Самовывоз из салона на ул. Маяковского 146 — бесплатно',
    'Изменения в заказ принимаем не позднее чем за 2 часа до доставки'
  ]
};

const PAYMENT = {
  methods: [
    { title: 'Наличными', desc: 'Только при самовывозе из салона на Маяковского 146.' },
    { title: 'Банковской картой', desc: 'Картой в салоне при получении или курьеру.' },
    { title: 'Картой через интернет', desc: 'Платежи обрабатывает система bePaid. Принимаем Visa, Visa Electron, MasterCard, Maestro и Белкарт. Подтверждение приходит на почту.' },
    { title: 'ЕРИП / E-POS', desc: 'Через интернет-банк, мобильный банкинг, инфокиоск или кассу банка. Код услуги — 5300951.' }
  ],
  refund: 'Живые цветы и растения по закону не подлежат обмену и возврату. Претензии по качеству принимаем в момент получения заказа. Возврат средств по онлайн-оплате приходит на исходную карту в срок от 1 до 30 дней.'
};

/* ---------- Шаги заказа (с оригинала) ---------- */

const STEPS = [
  { n: '1', title: 'Выбираете', text: 'Находите товар в каталоге и добавляете его в корзину.' },
  { n: '2', title: 'Оформляете', text: 'Указываете детали заказа, адрес и удобный способ доставки.' },
  { n: '3', title: 'Подтверждаем', text: 'После оформления дожидаетесь звонка менеджера — мы подтвердим заказ и время.' }
];

/* ---------- Акции (с оригинала) ---------- */

const PROMOS = [
  { code: 'LOVE5', title: '14 февраля', text: 'Скидка 5% по промокоду. Предзаказы принимаем до 10 февраля.' },
  { code: 'MART5', title: '8 марта',    text: 'Скидка 5% по промокоду. Предзаказы принимаем до 6 марта.' }
];

/* ---------- Виды цветов (с оригинала, 21 позиция) ---------- */

const FLOWER_TYPES = [
  'Роза', 'Пионовидная роза', 'Французская роза', 'Кустовая роза', 'Хризантема',
  'Гвоздика', 'Альстромерия', 'Эустома', 'Маттиола', 'Гортензия', 'Лилия',
  'Орхидея', 'Протея', 'Гипсофила', 'Подсолнух', 'Гербера', 'Калла', 'Ирис',
  'Ранункулус', 'Пион', 'Тюльпан'
];

/* ---------- Структура каталога (с оригинала) ---------- */

const CATEGORIES = [
  {
    id: 'cvety', title: 'Цветы', lead: 'Свежие букеты и композиции, собранные вручную',
    cover: 'images/products/nezhnoe-priznanie.jpeg',
    subs: [
      { id: 'bukety',      title: 'Букеты' },
      { id: 'kompozicii',  title: 'Композиции' },
      { id: 'suhocvety',   title: 'Сухоцветы' },
      { id: 'sezonnye',    title: 'Сезонные цветы' },
      { id: 'poshtuchno',  title: 'Цветы поштучно' }
    ]
  },
  {
    id: 'rasteniya', title: 'Комнатные растения', lead: 'Живая зелень, которая остаётся с вами надолго',
    cover: 'images/products/anturium.jpeg',
    subs: [
      { id: 'cvetushchie',  title: 'Цветущие' },
      { id: 'sukkulenty',   title: 'Кактусы и суккуленты' },
      { id: 'krupnye',      title: 'Крупные растения' },
      { id: 'listvennye',   title: 'Декоративно-лиственные' },
      { id: 'dlya-rasteniy',title: 'Всё для растений' }
    ]
  },
  {
    id: 'dekor', title: 'Декор', lead: 'Свечи, вазы и предметы, из которых складывается уют',
    cover: 'images/products/svecha-steklo-100.jpeg',
    subs: [
      { id: 'svechi',       title: 'Свечи' },
      { id: 'vazy',         title: 'Вазы' },
      { id: 'gips',         title: 'Гипсовые фигуры' },
      { id: 'kashpo',       title: 'Кашпо' },
      { id: 'suveniry',     title: 'Сувениры' }
    ]
  },
  {
    id: 'upakovka', title: 'Упаковка', lead: 'Всё, что превращает покупку в подарок',
    cover: 'images/products/svecha-tyulpany.jpeg',
    subs: [
      { id: 'shary',        title: 'Гелиевые шары' },
      { id: 'korobki',      title: 'Подарочные коробки' },
      { id: 'pakety',       title: 'Подарочные пакеты' },
      { id: 'otkrytki',     title: 'Открытки' },
      { id: 'konverty',     title: 'Конверты для денег' }
    ]
  },
  {
    id: 'podarki', title: 'Подарки', lead: 'Дополнение к букету или самостоятельный сюрприз',
    cover: 'images/products/mishka-s-bantikom-2.jpeg',
    subs: [
      { id: 'igrushki',     title: 'Мягкие игрушки' },
      { id: 'boksy',        title: 'Подарочные боксы' },
      { id: 'kosmetika',    title: 'Косметика' },
      { id: 'igry',         title: 'Игры и головоломки' }
    ]
  }
];

/* ---------- Поводы (навигация по каталогу) ---------- */

const OCCASIONS = [
  { id: 'all',       title: 'Все' },
  { id: 'romantika', title: 'Романтика' },
  { id: 'prazdnik',  title: 'Праздник' },
  { id: 'vnimanie',  title: 'Знак внимания' },
  { id: 'dom',       title: 'Для дома' }
];

/* ============================================================
   ТОВАРЫ
   name / price — с оригинала flower-home.by
   note — описание для карточки
   ============================================================ */

const PRODUCTS = [
  /* ---------- БУКЕТЫ ---------- */
  { id:'legkoe-obyatie', name:'Букет «Лёгкое объятие»', price:125, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/legkoe-obyatie.jpeg', stock:true, hit:true,
    note:'Мягкий, обволакивающий букет пастельных оттенков — тот случай, когда цветы говорят тише слов.' },
  { id:'nezhnoe-priznanie', name:'Букет «Нежное признание»', price:449, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/nezhnoe-priznanie.jpeg', stock:true, hit:true,
    note:'Большой авторский букет для самого важного разговора. Собираем в день доставки.' },
  { id:'rozovyy-rumyanec', name:'Букет «Розовый румянец»', price:113, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/rozovyy-rumyanec.jpeg', stock:true, hit:true,
    note:'Тёплая розовая гамма с живой зеленью — лёгкий и очень «весенний» по настроению.' },
  { id:'shepot-lyubvi', name:'Букет «Шёпот любви»', price:123, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/shepot-lyubvi.jpeg', stock:true,
    note:'Сдержанный и романтичный — без пафоса, но с характером.' },
  { id:'morskaya-laguna', name:'Букет «Морская лагуна»', price:179, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/morskaya-laguna.jpeg', stock:true, hit:true,
    note:'Прохладные голубые и белые тона. Смотрится свежо даже в самый жаркий день.' },
  { id:'persikovoe-nebo', name:'Букет «Персиковое небо»', price:101, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/persikovoe-nebo.jpeg', stock:true,
    note:'Персиковая палитра, мягкий свет — букет, который хочется поставить на кухонный стол.' },
  { id:'pionovidnaya-simfoniya', name:'Букет «Пионовидная симфония»', price:153, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/pionovidnaya-simfoniya.jpeg', stock:true, hit:true,
    note:'Пышные пионовидные розы крупным планом. Один из самых заказываемых букетов.' },
  { id:'znak-vnimaniya', name:'Букет «Знак внимания»', price:69, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/znak-vnimaniya.jpeg', stock:true,
    note:'Компактный букет без повода. Часто берут «просто так» — и это лучший повод.' },
  { id:'solnechnaya-dolina', name:'Букет «Солнечная долина»', price:81, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/solnechnaya-dolina.jpeg', stock:false,
    note:'Тёплые солнечные оттенки. Сейчас закончился — напишите, соберём похожий.' },
  { id:'aromatnyy-vzryv', name:'Букет «Ароматный взрыв»', price:101, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/aromatnyy-vzryv.jpg', stock:true,
    note:'Собран вокруг душистых сортов — его слышно раньше, чем видно.' },
  { id:'beloe-oblako', name:'Букет «Белое облако»', price:83, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/beloe-oblako.jpg', stock:true,
    note:'Воздушный белый монобукет. Универсальный и всегда уместный.' },
  { id:'vostorg-lyubvi', name:'Букет «Восторг любви»', price:137, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/vostorg-lyubvi.jpg', stock:true,
    note:'Насыщенный, яркий, с характером — для эмоционального момента.' },
  { id:'garmoniya', name:'Букет «Гармония»', price:99, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/garmoniya.jpg', stock:true,
    note:'Сбалансированная композиция, где ни один цвет не перетягивает внимание.' },
  { id:'gracioznaya-krasota', name:'Букет «Грациозная красота»', price:239, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/gracioznaya-krasota.jpg', stock:true,
    note:'Крупный праздничный букет с выразительным силуэтом.' },
  { id:'kompliment', name:'Букет «Комплимент»', price:79, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/kompliment.jpg', stock:true,
    note:'Небольшой, но продуманный. Отличный вариант «занести по дороге».' },
  { id:'magicheskaya-krasota', name:'Букет «Магическая красота»', price:101, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/magicheskaya-krasota.jpg', stock:true,
    note:'Глубокие оттенки и плотная фактура — выглядит дороже, чем стоит.' },
  { id:'magiya-sovershenstva', name:'Букет «Магия совершенства»', price:85, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/magiya-sovershenstva.jpg', stock:true,
    note:'Аккуратная круглая форма, чистая палитра, ничего лишнего.' },
  { id:'morskaya-volna', name:'Букет «Морская волна»', price:97, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/morskaya-volna.jpg', stock:true,
    note:'Сине-белая гамма с прохладной зеленью.' },
  { id:'rozovoe-schaste', name:'Букет «Розовое счастье»', price:109, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/rozovoe-schaste.jpeg', stock:true,
    note:'Розовый во всех его оттенках — от почти белого до глубокого малинового.' },
  { id:'bal-cvetov', name:'Букет «Бал цветов»', price:251, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/bal-cvetov.jpeg', stock:true, hit:true,
    note:'Многосоставный букет-событие. Берут на юбилеи и большие даты.' },
  { id:'beskonechnost', name:'Букет «Бесконечность»', price:101, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/beskonechnost.jpeg', stock:true,
    note:'Спокойный, с длинной линией стеблей — красиво стоит в высокой вазе.' },
  { id:'vesenniy-mig', name:'Букет «Весенний миг»', price:127, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/vesenniy-mig.jpeg', stock:true,
    note:'Светлый весенний набор — хорошо заходит к 8 марта и на день рождения.' },
  { id:'gimn-vesne', name:'Букет «Гимн весне»', price:235, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/gimn-vesne.jpeg', stock:true,
    note:'Крупный весенний букет с богатой палитрой.' },
  { id:'zolotoe-serdce', name:'Букет «Золотое сердце»', price:289, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/zolotoe-serdce.jpeg', stock:true,
    note:'Тёплые золотистые тона, плотная сборка. Подарок с весом.' },
  { id:'lilovye-pocelui', name:'Букет «Лиловые поцелуи»', price:133, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/lilovye-pocelui.jpeg', stock:true,
    note:'Лиловая гамма — редкая и запоминающаяся.' },
  { id:'malaya-vselennaya', name:'Букет «Малая вселенная»', price:87, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/malaya-vselennaya.jpeg', stock:true,
    note:'Небольшой, но насыщенный деталями — интересно разглядывать вблизи.' },
  { id:'malinovyy-muss', name:'Букет «Малиновый мусс»', price:87, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/malinovyy-muss.jpeg', stock:true,
    note:'Сочный малиновый акцент на светлой основе.' },
  { id:'neumolimoe-vlechenie', name:'Букет «Неумолимое влечение»', price:111, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/neumolimoe-vlechenie.jpeg', stock:true,
    note:'Тёмная драматичная палитра для тех, кто не любит пастель.' },
  { id:'poyas-venery', name:'Букет «Пояс Венеры»', price:215, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/poyas-venery.jpeg', stock:true,
    note:'Крупный, с плавным переходом оттенков по всему объёму.' },
  { id:'purpurnye-grezy', name:'Букет «Пурпурные грёзы»', price:79, cat:'cvety', sub:'bukety', occ:'vnimanie', img:'images/products/purpurnye-grezy.jpeg', stock:true,
    note:'Пурпур и зелень. Компактно и выразительно.' },
  { id:'radost-vstrechi', name:'Букет «Радость встречи»', price:357, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/radost-vstrechi.jpeg', stock:true, hit:true,
    note:'Большой встречающий букет — для аэропорта, вокзала и важных возвращений.' },
  { id:'rozovaya-simfoniya', name:'Букет «Розовая симфония»', price:330, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/rozovaya-simfoniya.jpeg', stock:true,
    note:'Крупная работа в розовой гамме. Собираем под заказ.' },
  { id:'romantichnaya-nezhnost', name:'Букет «Романтичная нежность»', price:165, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/romantichnaya-nezhnost.jpeg', stock:true,
    note:'Классическая романтика без клише.' },
  { id:'svidanie-v-parizhe', name:'Букет «Свидание в Париже»', price:103, cat:'cvety', sub:'bukety', occ:'romantika', img:'images/products/svidanie-v-parizhe.jpeg', stock:true,
    note:'Французская сдержанность: приглушённые тона, свободная сборка.' },
  { id:'solnechnyy-zakat', name:'Букет «Солнечный закат»', price:135, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/solnechnyy-zakat.jpeg', stock:true,
    note:'Тёплый градиент от жёлтого к терракоте.' },
  { id:'stilnyy-miks', name:'Букет «Стильный микс»', price:151, cat:'cvety', sub:'bukety', occ:'prazdnik', img:'images/products/stilnyy-miks.jpeg', stock:true,
    note:'Смелое сочетание фактур — для тех, кто просит «что-нибудь необычное».' },

  /* ---------- КОМПОЗИЦИИ ---------- */
  { id:'k-rozovaya-akvarel', name:'Композиция «Розовая акварель»', price:71, cat:'cvety', sub:'kompozicii', occ:'vnimanie', img:'images/products/k-rozovaya-akvarel.jpeg', stock:true,
    note:'В шляпной коробке с флористической губкой — воду доливать раз в пару дней.' },
  { id:'k-snezhnoe-obloko', name:'Композиция «Снежное облако»', price:63, cat:'cvety', sub:'kompozicii', occ:'vnimanie', img:'images/products/k-snezhnoe-obloko.jpeg', stock:true,
    note:'Белоснежная композиция в коробке. Не требует вазы.' },
  { id:'k-cvetochnaya-polyana', name:'Композиция «Цветочная поляна»', price:359, cat:'cvety', sub:'kompozicii', occ:'prazdnik', img:'images/products/k-cvetochnaya-polyana.jpeg', stock:true, hit:true,
    note:'Большая интерьерная композиция — работает как арт-объект в комнате.' },
  { id:'k-vsplesk-emociy', name:'Композиция «Всплеск эмоций»', price:590, cat:'cvety', sub:'kompozicii', occ:'prazdnik', img:'images/products/k-vsplesk-emociy.jpg', stock:true,
    note:'Премиальная работа под заказ. Согласовываем палитру заранее.' },
  { id:'k-goluboe-oblako', name:'Композиция «Голубое облако»', price:51, cat:'cvety', sub:'kompozicii', occ:'vnimanie', img:'images/products/k-goluboe-oblako.jpg', stock:true,
    note:'Небольшая композиция в прохладной гамме.' },
  { id:'k-parizhskiy-shik', name:'Композиция «Парижский шик»', price:310, cat:'cvety', sub:'kompozicii', occ:'prazdnik', img:'images/products/k-parizhskiy-shik.jpg', stock:true,
    note:'Крупная композиция в сдержанной европейской палитре.' },
  { id:'k-prityazhenie', name:'Композиция «Притяжение»', price:290, cat:'cvety', sub:'kompozicii', occ:'romantika', img:'images/products/k-prityazhenie.jpg', stock:true,
    note:'Плотная, объёмная работа с выразительным центром.' },
  { id:'k-radost-vstrechi', name:'Композиция «Радость встречи»', price:61, cat:'cvety', sub:'kompozicii', occ:'vnimanie', img:'images/products/k-radost-vstrechi.jpg', stock:true,
    note:'Компактная композиция в коробке — удобно везти и вручать.' },
  { id:'k-arhitektura-krasoty', name:'Композиция «Архитектура красоты»', price:159, cat:'cvety', sub:'kompozicii', occ:'prazdnik', img:'images/products/k-arhitektura-krasoty.jpeg', stock:true,
    note:'Геометричная сборка с чистыми линиями.' },
  { id:'k-zhazhda-stranstviy', name:'Композиция «Жажда странствий»', price:89, cat:'cvety', sub:'kompozicii', occ:'dom', img:'images/products/k-zhazhda-stranstviy.jpeg', stock:true,
    note:'Композиция с сухоцветами и живой зеленью — стоит долго.' },
  { id:'k-kompliment', name:'Композиция «Комплимент»', price:61, cat:'cvety', sub:'kompozicii', occ:'vnimanie', img:'images/products/k-kompliment.jpeg', stock:true,
    note:'Маленькая композиция как дополнение к основному подарку.' },
  { id:'k-nezhnost', name:'Композиция «Нежность»', price:97, cat:'cvety', sub:'kompozicii', occ:'romantika', img:'images/products/k-nezhnost.jpeg', stock:true,
    note:'Пастельная композиция средних размеров.' },
  { id:'k-ogni-teatra', name:'Композиция «Огни театра»', price:93, cat:'cvety', sub:'kompozicii', occ:'prazdnik', img:'images/products/k-ogni-teatra.jpeg', stock:true,
    note:'Контрастная и нарядная — хорошо смотрится при вечернем свете.' },
  { id:'k-eyforiya', name:'Композиция «Эйфория»', price:605, cat:'cvety', sub:'kompozicii', occ:'prazdnik', img:'images/products/k-eyforiya.jpeg', stock:true,
    note:'Самая крупная композиция в каталоге. Только по предзаказу.' },

  /* ---------- СУХОЦВЕТЫ ---------- */
  { id:'kraspediya', name:'Краспедия', price:3.5, cat:'cvety', sub:'suhocvety', occ:'dom', img:'images/products/kraspediya.jpeg', stock:true,
    note:'Жёлтые шарики на длинном стебле. Цена за штуку.' },
  { id:'oves', name:'Овёс', price:0.8, cat:'cvety', sub:'suhocvety', occ:'dom', img:'images/products/oves.jpeg', stock:true,
    note:'Лёгкий природный акцент для букета. Цена за штуку.' },
  { id:'pampasnaya-trava', name:'Пампасная трава', price:4, cat:'cvety', sub:'suhocvety', occ:'dom', img:'images/products/pampasnaya-trava.jpeg', stock:true,
    note:'Пушистые метёлки для интерьерных композиций. Цена за штуку.' },
  { id:'stifa', name:'Стифа', price:15, cat:'cvety', sub:'suhocvety', occ:'dom', img:'images/products/stifa.jpeg', stock:true,
    note:'Тонкая структурная трава. Не требует ухода и не осыпается.' },

  /* ---------- ЦВЕТУЩИЕ РАСТЕНИЯ ---------- */
  { id:'azaliya', name:'Азалия', price:41, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/azaliya.jpeg', stock:true,
    note:'Обильно цветёт зимой и весной. Любит прохладу и регулярный полив.' },
  { id:'kalanhoe', name:'Каланхоэ «Каландива»', price:25, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/kalanhoe.jpeg', stock:true,
    note:'Неприхотливое растение с плотными соцветиями. Хорошо для начинающих.' },
  { id:'kallistemon', name:'Каллистемон', price:229, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/kallistemon.jpeg', stock:true,
    note:'Эффектное растение с соцветиями-щётками. Нужен яркий свет.' },
  { id:'oleandr', name:'Олеандр', price:71, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/oleandr.jpeg', stock:true,
    note:'Южное растение с длительным цветением. Любит солнце.' },
  { id:'spatifillum', name:'Спатифиллум', price:23, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/spatifillum.jpeg', stock:true, hit:true,
    note:'«Женское счастье» — теневынослив, прощает нерегулярный полив.' },
  { id:'ciklamen', name:'Цикламен', price:41, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/ciklamen.jpeg', stock:true,
    note:'Цветёт в холодный сезон. Полив через поддон.' },
  { id:'anturium', name:'Антуриум', price:79, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/anturium.jpeg', stock:true, hit:true,
    note:'Глянцевые прицветники держатся неделями. Одно из самых фотогеничных растений.' },
  { id:'spatifillum-bolshoy', name:'Спатифиллум крупный', price:69, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/spatifillum-bolshoy.jpeg', stock:true,
    note:'Взрослый экземпляр в большом горшке — сразу заполняет угол комнаты.' },
  { id:'stefanotis', name:'Стефанотис', price:79, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/stefanotis.jpeg', stock:true,
    note:'Вьющееся растение с ароматными белыми цветками.' },
  { id:'strelitsiya', name:'Стрелиция', price:53, cat:'rasteniya', sub:'cvetushchie', occ:'dom', img:'images/products/strelitsiya.jpeg', stock:true,
    note:'«Райская птица». Крупные листья, экзотический силуэт.' },

  /* ---------- СВЕЧИ ---------- */
  { id:'svecha-tyulpany', name:'Свеча «Букет тюльпанов»', price:25, cat:'dekor', sub:'svechi', occ:'dom', img:'images/products/svecha-tyulpany.jpeg', stock:true, hit:true,
    note:'Фигурная свеча ручной работы. Красиво стоит даже незажжённой.' },
  { id:'svecha-steklo-100', name:'Свеча в стекле, 100 мл', price:33, cat:'dekor', sub:'svechi', occ:'dom', img:'images/products/svecha-steklo-100.jpeg', stock:true,
    note:'Ароматическая свеча в стеклянном стакане. Горит около 20 часов.' },
  { id:'svecha-steklo-50', name:'Свеча в стекле, 50 мл', price:19, cat:'dekor', sub:'svechi', occ:'dom', img:'images/products/svecha-steklo-50.jpeg', stock:true,
    note:'Компактный формат — удобно добавлять к букету.' },
  { id:'svecha-mishka', name:'Свеча «Мишка»', price:19, cat:'dekor', sub:'svechi', occ:'vnimanie', img:'images/products/svecha-mishka.jpeg', stock:true,
    note:'Фигурная свеча-медвежонок.' },
  { id:'svecha-mishka-bant', name:'Свеча «Мишка с бантом»', price:19, cat:'dekor', sub:'svechi', occ:'vnimanie', img:'images/products/svecha-mishka-bant.jpeg', stock:true,
    note:'Тот же мишка, но нарядный.' },
  { id:'svecha-mishka-teddi', name:'Свеча «Мишка Тедди»', price:19, cat:'dekor', sub:'svechi', occ:'vnimanie', img:'images/products/svecha-mishka-teddi.jpeg', stock:true,
    note:'Классический тедди в виде свечи.' },
  { id:'svecha-sova', name:'Свеча «Сова»', price:23, cat:'dekor', sub:'svechi', occ:'dom', img:'images/products/svecha-sova.jpeg', stock:true,
    note:'Детализированная фигурная свеча.' },
  { id:'svecha-tors', name:'Свеча «Торс»', price:19, cat:'dekor', sub:'svechi', occ:'dom', img:'images/products/svecha-tors.jpeg', stock:true,
    note:'Скульптурная свеча в античном духе — популярный интерьерный объект.' },

  /* ---------- МЯГКИЕ ИГРУШКИ ---------- */
  { id:'zayac', name:'Заяц', price:61, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/zayac.jpeg', stock:true,
    note:'Большой мягкий заяц. Хорошо дополняет крупный букет.' },
  { id:'brelok-akula', name:'Игрушка-брелок «Акула»', price:13, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/brelok-akula.jpeg', stock:true,
    note:'Маленький брелок — приятная мелочь к заказу.' },
  { id:'brelok-zayac', name:'Игрушка-брелок «Заяц»', price:13, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/brelok-zayac.jpeg', stock:true,
    note:'Мягкий брелок на сумку или рюкзак.' },
  { id:'brelok-utochka', name:'Игрушка-брелок «Уточка»', price:13, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/brelok-utochka.jpeg', stock:true,
    note:'Небольшой брелок-уточка.' },
  { id:'transformer-zayac', name:'Игрушка-трансформер «Заяц»', price:23, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/transformer-zayac.jpeg', stock:true,
    note:'Выворачивается наизнанку и меняет выражение.' },
  { id:'transformer-zayac-2', name:'Игрушка-трансформер «Заяц», вариант 2', price:23, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/transformer-zayac-2.jpeg', stock:true,
    note:'Другая расцветка того же трансформера.' },
  { id:'transformer-stich', name:'Игрушка-трансформер «Стич»', price:23, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/transformer-stich.jpeg', stock:true,
    note:'Популярный герой в формате трансформера.' },
  { id:'kot-murzik', name:'Кот «Мурзик»', price:19, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/kot-murzik.jpeg', stock:true,
    note:'Небольшой мягкий кот.' },
  { id:'mishka-v-bayke', name:'Мишка в байке', price:32, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/mishka-v-bayke.jpeg', stock:true,
    note:'Медведь в толстовке — самый ходовой размер.' },
  { id:'mishka-s-bantikom', name:'Мишка с бантиком', price:33, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/mishka-s-bantikom.jpeg', stock:true,
    note:'Классический плюшевый медведь.' },
  { id:'mishka-s-bantikom-2', name:'Мишка с бантиком, большой', price:47, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/mishka-s-bantikom-2.jpeg', stock:true, hit:true,
    note:'Крупный медведь — самостоятельный подарок, а не дополнение.' },
  { id:'mishka-s-bantikom-3', name:'Мишка с бантиком, средний', price:37, cat:'podarki', sub:'igrushki', occ:'vnimanie', img:'images/products/mishka-s-bantikom-3.jpeg', stock:true,
    note:'Промежуточный размер между стандартным и большим.' }
];

/* ---------- Отзывы (собраны с Instagram, Google Карт, Viber и Яндекс Карт) ---------- */

const REVIEWS = [
  { name: 'Ирина',     src: 'Google Карты', date: '12 июня',   rating: 5, order: 'Букет «Розовый румянец»',
    text: 'Заказывала букет с доставкой на другой конец города — привезли вовремя, цветы свежие. Через неделю всё ещё стояли.' },
  { name: 'Алексей',   src: 'Instagram',    date: '3 мая',     rating: 5, order: 'Букет «Знак внимания»',
    text: 'Взял «Знак внимания» без повода. Упаковали красиво, жена в восторге. Буду брать ещё.' },
  { name: 'Марина',    src: 'Яндекс Карты', date: '28 апреля', rating: 5, order: 'Композиция «Нежность»',
    text: 'Отдельное спасибо за упаковку — выглядит дороже, чем стоит. И девушки в салоне помогли выбрать под бюджет.' },
  { name: 'Дмитрий',   src: 'Viber',        date: '14 марта',  rating: 5, order: 'Букет «Гимн весне»',
    text: 'Заказывал из другой страны, оплатил картой онлайн. Менеджер перезвонил, всё подтвердил, маме доставили в срок.' },
  { name: 'Ольга',     src: 'Google Карты', date: '2 марта',   rating: 5, order: 'Композиция «Комплимент»',
    text: 'Композиция в коробке простояла две недели. Для меня это показатель, что цветы действительно свежие.' },
  { name: 'Екатерина', src: 'Instagram',    date: '19 февраля',rating: 5, order: 'Букет «Лиловые поцелуи»',
    text: 'Очень внимательное отношение. Попросила собрать в определённой гамме — сделали именно так, как я описала.' }
];

/* ---------- Почему выбирают нас ----------
   ВНИМАНИЕ: цифры в chart — демонстрационные, для вёрстки.
   Перед публикацией замените на реальные данные или уберите проценты. */

const WHY = {
  lead: 'За одиннадцать лет мы поняли простую вещь: букет запоминают не по цене, ' +
        'а по тому, как он выглядит на третий день. Поэтому работаем так.',
  reasons: [
    { n: '1', title: 'Свежесть, а не остатки',
      text: 'Букеты собираем в день доставки из цветов текущей поставки. Ничего не собираем «про запас» — поэтому они стоят неделями, а не три дня.' },
    { n: '2', title: 'Два часа по городу',
      text: 'При заказе от 70 BYN привозим в течение двух часов в любую точку в пределах МКАД. Успеваем даже когда вы вспомнили о дате в последний момент.' },
    { n: '3', title: 'Флорист, а не оператор',
      text: 'Опишите повод, характер человека или просто пришлите фото платья — соберём под это. Не подходит ни один готовый вариант? Сделаем свой.' },
    { n: '4', title: 'Свой салон, а не склад',
      text: 'На Маяковского 146 можно прийти, посмотреть цветы вживую и собрать букет при вас. Мы отвечаем за него лицом, а не карточкой в интернете.' }
  ],
  chart: {
    title: 'Что чаще всего отмечают в отзывах',
    note: 'Доля отзывов, где клиенты упоминают этот пункт',
    bars: [
      { label: 'Свежесть цветов',   value: 94 },
      { label: 'Доставка вовремя',  value: 88 },
      { label: 'Упаковка и подача', value: 81 },
      { label: 'Помощь флориста',   value: 73 }
    ]
  }
};

/* ---------- Тексты «О нас» (с оригинала, дословно) ---------- */

const ABOUT = {
  intro: 'Добро пожаловать в FlowerHome — ваш идеальный помощник в выборе подарков и создании уюта в доме!',
  blocks: [
    {
      title: 'О нашем магазине',
      paras: [
        'Мы специализируемся на продаже прекрасных и оригинальных подарков, которые подойдут для любого случая. В нашем ассортименте вы найдёте цветы, комнатные растения, стильный декор, упаковку для подарков и многое другое.',
        'Наши цветочные букеты и композиции станут прекрасным дополнением к любому празднику, будь то день рождения, юбилей или просто знак внимания для близкого человека. Комнатные растения, кактусы и суккуленты подарят вашему дому живую красоту и свежесть, а уникальные предметы декора — вазы, свечи и сувениры — создадут атмосферу уюта и тепла.'
      ]
    },
    {
      title: 'Почему FlowerHome?',
      paras: [
        'В FlowerHome мы стремимся превзойти ваши ожидания и доставить радость в каждый дом. Наша команда заботится о том, чтобы каждый заказ был выполнен с любовью и вниманием к деталям. Мы гордимся качеством нашего сервиса и всегда готовы помочь вам в выборе идеального подарка.',
        'Наши подарочные боксы, косметика, игры и головоломки, а также мягкие игрушки — это идеальные подарки для ваших друзей и близких. Мы тщательно подбираем нашу продукцию, чтобы предложить вам только самое лучшее.',
        'С нами вы можете быть уверены, что ваш подарок будет особенным и принесёт радость тем, кто вам дорог. Спасибо, что выбрали FlowerHome!'
      ]
    }
  ],
  stats: [
    { n: 11,  suffix: '',  label: 'лет на рынке Минска' },
    { n: 300, suffix: '+', label: 'позиций в каталоге' },
    { n: 2,   suffix: ' ч', label: 'доставка от 70 BYN' },
    { n: 21,  suffix: '',  label: 'вида цветов в наличии' }
  ]
};

/* ---------- Частые вопросы ---------- */

const FAQ = [
  {
    q: 'Как осуществляется доставка роз по Минску?',
    a: 'При заказе от 170 BYN доставка в пределах МКАД бесплатная. В остальных случаях: 20 BYN — в пределах МКАД, 30 BYN — до 15 км за МКАД, далее — по тарифам Яндекс.Такси.'
  },
  {
    q: 'Какие способы оплаты доступны?',
    a: 'Можно оплатить онлайн банковской картой или через систему ЕРИП.'
  },
  {
    q: 'Можно ли заказать определённый цвет или сорт роз?',
    a: 'Да, вы можете указать желаемый цвет или сорт при оформлении заказа или обсудить это с нашим менеджером — мы подберём нужный вариант.'
  },
  {
    q: 'Как долго простоят розы после доставки?',
    a: 'Все наши розы свежие и доставляются с соблюдением условий хранения. При правильном уходе букет будет радовать 5–7 дней и дольше.'
  }
];

/* ---------- Дополнительные услуги (с оригинала) ---------- */

const SERVICES = [
  { title: 'Регулярная доставка', text: 'Подписка на букеты: привозим свежие цветы в офис или домой по выбранному графику.' },
  { title: 'Индивидуальный заказ', text: 'Соберём букет по вашему описанию, фото или под цвет платья. Обсуждаем заранее.' },
  { title: 'Оформление праздника', text: 'Композиции, шары и декор для дня рождения, свадьбы или корпоратива.' }
];
