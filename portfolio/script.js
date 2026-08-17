/* ============================================================
   СТАПЕЛЬ — логика главного экрана.
   Всё крутится вокруг одной шкалы времени: экран собирает себя
   за t секунд, а твикер умеет её перематывать и запускать заново.
   ============================================================ */
(() => {
'use strict';

/* ---------------------------------------------- шрифты (все с кириллицей) */
const FONTS = {
  unbOnest:   { name:'Unbounded + Onest',            h:'Unbounded',        b:'Onest',        w:'300;400;600;800' },
  unbGolos:   { name:'Unbounded + Golos Text',       h:'Unbounded',        b:'Golos Text',   w:'400;600;800' },
  onest:      { name:'Onest + Onest',                h:'Onest',            b:'Onest',        w:'300;400;600;800' },
  manrope:    { name:'Manrope + Manrope',            h:'Manrope',          b:'Manrope',      w:'300;400;600;800' },
  oswald:     { name:'Oswald + Onest',               h:'Oswald',           b:'Onest',        w:'300;400;600;700' },
  russo:      { name:'Russo One + Golos Text',       h:'Russo One',        b:'Golos Text',   w:'400' },
  prata:      { name:'Prata + Onest',                h:'Prata',            b:'Onest',        w:'400' },
  playfair:   { name:'Playfair Display + Golos Text',h:'Playfair Display', b:'Golos Text',   w:'400;600;800;900' },
  cormorant:  { name:'Cormorant + Manrope',          h:'Cormorant',        b:'Manrope',      w:'300;400;600;700' },
  ptserif:    { name:'PT Serif + Inter',             h:'PT Serif',         b:'Inter',        w:'400;700' },
  plex:       { name:'IBM Plex Sans + Plex Mono',    h:'IBM Plex Sans',    b:'IBM Plex Mono',w:'300;400;600;700' },
  jetbrains:  { name:'JetBrains Mono + Onest',       h:'JetBrains Mono',   b:'Onest',        w:'300;400;600;800' },
  inter:      { name:'Inter + Inter',                h:'Inter',            b:'Inter',        w:'300;400;600;900' },
  raleway:    { name:'Raleway + Onest',              h:'Raleway',          b:'Onest',        w:'300;400;600;900' },
  exo:        { name:'Exo 2 + Onest',                h:'Exo 2',            b:'Onest',        w:'300;400;600;800' },
  jost:       { name:'Jost + Jost',                  h:'Jost',             b:'Jost',         w:'200;300;400;600;700' },
  montserrat: { name:'Montserrat + Onest',           h:'Montserrat',       b:'Onest',        w:'300;400;600;900' },
  alegreya:   { name:'Alegreya + Manrope',           h:'Alegreya',         b:'Manrope',      w:'400;700;900' },
  merri:      { name:'Merriweather + Inter',         h:'Merriweather',     b:'Inter',        w:'300;400;700;900' },
  commiss:    { name:'Commissioner + Commissioner',  h:'Commissioner',     b:'Commissioner', w:'200;300;400;600;800' },
  yeseva:     { name:'Yeseva One + Onest',           h:'Yeseva One',       b:'Onest',        w:'400' },
  cuprum:     { name:'Cuprum + Onest',               h:'Cuprum',           b:'Onest',        w:'400;600;700' },
  rubik:      { name:'Rubik + Rubik',                h:'Rubik',            b:'Rubik',        w:'300;400;600;800' }
};

/* ---------------------------------------------- палитры */
const PALETTES = {
  paperInk: { name:'Бумага и графит',   bg:'#f2f0ea', ink:'#111113', dim:'#6c6a64', accent:'#000000', wire:'#dbd7cc', line:'#d2cfc5' },
  surik:    { name:'Графит и сурик',    bg:'#0e0e10', ink:'#f2f0ea', dim:'#8d8b85', accent:'#ff5b1f', wire:'#26262a', line:'#2e2e33' },
  blueprint:{ name:'Синька',            bg:'#0b1a2b', ink:'#e8f1fb', dim:'#7c93ab', accent:'#4da3ff', wire:'#12283f', line:'#1b3a55' },
  paper:    { name:'Бумага',            bg:'#f2f0ea', ink:'#111113', dim:'#6c6a64', accent:'#1f4bff', wire:'#dedbd2', line:'#d2cfc5' },
  lime:     { name:'Тёмный и кислота',  bg:'#0d0f0c', ink:'#eef2e9', dim:'#868d80', accent:'#c8ff2e', wire:'#1e2320', line:'#262c26' },
  clay:     { name:'Глина',             bg:'#181413', ink:'#f4eee7', dim:'#96897f', accent:'#e4703a', wire:'#2a2320', line:'#332b27' },
  mono:     { name:'Без цвета',         bg:'#0e0e10', ink:'#f4f4f4', dim:'#8a8a8a', accent:'#f4f4f4', wire:'#242424', line:'#2c2c2c' },
  sea:      { name:'Верфь',             bg:'#0a1614', ink:'#e6f2ef', dim:'#7d9490', accent:'#2fd6a8', wire:'#122421', line:'#182e2a' },
  ink:      { name:'Чернила и охра',    bg:'#111827', ink:'#f5f1e8', dim:'#8a90a0', accent:'#e0a83c', wire:'#1b2333', line:'#232c3d' }
};

const CURSORS = {
  crosshair:'Перекрестие чертёжника',
  ruler:    'Перекрестие с координатами',
  dot:      'Точка с отстающим кольцом',
  frame:    'Визир-уголки',
  lens:     'Линза-инвертор',
  minimal:  'Только точка',
  system:   'Системный'
};

const BTNS = { wide:'Широкие, вразрядку', plain:'Обычные', line:'Только подчёркивание' };

const EASE = {
  linear:   t => t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  outQuint: t => 1 - Math.pow(1 - t, 5),
  outExpo:  t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  outBack:  t => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2),
  inOutCubic: t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2
};

/* ---------------------------------------------- проекты в плитках */
const TILES = [
  { n:'KLAUS',   a:.7 }, { n:'Киноночь', a:.4 }, { n:'Метриум', a:.9 },
  { n:'Nuvelle', a:.5 }, { n:'Ray-Ban',  a:.8 }, { n:'Мотоарена', a:.3 }
];

/* ---------------------------------------------- настройки */
const DEFAULTS = {
  font:'unbGolos', palette:'paperInk',
  bg:'#f2f0ea', ink:'#111113', dim:'#6c6a64', accent:'#000000', wire:'#dbd7cc', line:'#d2cfc5',

  h1size:7.3, h1w:600, h1track:-0.025, h1lh:1.03, bodysize:1.1,

  cursor:'system', curSize:8, curRing:34, curLag:0.16,

  /* кнопки: размеры и скорости — всё крутится из твикера */
  btnPadY:16, btnPadX:31, btnFs:0.83, btnTrack:0.105, btnMinW:10.5,
  btnBw:0.5, btnR:14, btnDot:7, btnSpeed:0.75, btnFill:0.75, btnLower:false,

  /* Рамка на карточках форматов: свечение наружу выключено, горит всегда —
     светится сам контур, без ореола вокруг блока. Все три стопа чёрные:
     синь с бирюзой были единственным цветным пятном на бумажной палитре
     и выбивались из неё. Цена одноцветного градиента — вращение больше
     не читается, контур стоит ровной чёрной линией. */
  neon1:'#000000', neon2:'#000000', neon3:'#000000',
  neonW:1.6, neonSpin:3, neonGlow:0, neonBlur:21, neonAlways:true,
  btn:'wide', radius:12,
  /* кнопки на первом экране: сняты — их работу делают меню внизу
     и сам скролл. Включается обратно одним переключателем */
  heroCta:false,
  /* Корпус макбука снят: витрина стоит голым окном браузера, а метка
     с результатом теста садится ему на угол. Крышка перетягивала
     внимание на себя, а показывать надо работы. Включается обратно
     переключателем «Корпус макбука у витрины» */
  macFrame:false,

  cols:2, rows:2, gridop:0, gridKeys:true,

  dustOn:true, dustCount:52000, dustScale:0.88, dustWidth:44, dustJitter:5.5,
  dustFlow:0.95, dustPush:5.5, dustRadius:95, dustSpring:0.05, dustFriction:0.69,
  dustMin:0.29, dustAccent:0.08,
  /* стрелку вниз из круга фигур убрали: знак не должен объяснять,
     что страницу надо листать — для этого внизу есть «листай» */
  dustShape:'infBack', dustShapes:'inf|infBack',
  dustAuto:true, dustHold:5, dustMorph:1, dustChaos:40,

  tGrid:0.8, tWire:1.1, tFill:1.0, tColor:0.6, stagger:0.075,
  ease:'outQuint', autoplay:true, showStage:true,

  txtName:'AETÉRNA',
  txtMark:'AETERNAWEBSTUDIO',
  txtPlace:'Минск',
  txtTg:'TELEGRAM',
  txtTgCta:'или сразу в телеграм',
  /* адрес живой: пока он пустой, все ссылки в телеграм намеренно
     не кликаются — см. конец drawText() */
  txtTgUrl:'https://t.me/aeternaweb',
  txtMenu:'МЕНЮ',
  txtMenuOpen:'ЗАКРЫТЬ',
  txtMenuList:'РАБОТЫ|УСЛУГИ|КАК Я РАБОТАЮ|ОБО МНЕ|КОНТАКТЫ',
  txtRole:'дизайнер и разработчик',
  /* статус в нижней строке на телефоне. От первого лица — как в
     карточке контактов; «берёт» звучало бы как рассказ о ком-то третьем */
  txtStatus:'беру проекты',
  /* метка на углу крышки. Пишем измеримое: «Lighthouse 95+» можно
     проверить за минуту, «быстрый сайт» — нельзя */
  txtMacTag:'Lighthouse 95+',
  /* Первый экран говорит одной крупной фразой: хвост про свой код идёт
     приглушённым и живёт отдельным ключом — тексты подставляются через
     textContent, разметку внутри строки браузер бы не получил */
  txtTag:'Сайты, боты и системы',
  txtTagDim:'на своём коде',
  txtBtn1:'обсудить проект',
  txtBtn2:'смотреть работы',
  txtBtnLoad:'отправляю…',
  txtBtnDone:'готово',
  txtWorks:'KLAUS|КИНОНОЧЬ|FlowerHome|Nuvelle|МОТОАРЕНА|Метриум|Ray-Ban Meta',
  /* пусто: имя секции теперь несёт надзаголовок из меню («РАБОТЫ»),
     а «Портфолио» рядом было тем же самым словом другими буквами */
  txtWorksTitle:'',
  txtWorksLead:'Разные жанры нарочно: магазин, каталог, кинотеатр, концепт. Чтобы не застрять в одном приёме.',
  txtWorksHint:'обложка появится позже',
  txtWorksMore:'показать ещё',

  /* услуги. Состав форматов живёт в коде (FMT, ADD), а деньги и сроки —
     здесь: строка на позицию. Так их правит твикер, а не приходится
     лезть в разметку. Порядок строк обязан совпадать с порядком в FMT/ADD */
  txtSvcTitle:'Выберите формат — чек соберётся сам',
  txtSvcLead:'Слева форматы и то, что можно добавить. Справа сразу видно, что войдёт в работу и сколько это стоит.',
  /* формат: «название :: цена :: дней :: метка». Порядок строк обязан
     совпадать с порядком в FMT — они сходятся по сквозному номеру */
  txtSvcFmt:[
    'Страница :: 430 :: 4 :: ',
    'Сайт :: 1210 :: 7 :: чаще всего',
    'Многостраничный :: 1440 :: 9 :: ',
    'Авторский :: 2210 :: 12 :: ',
    'Редизайн :: 900 :: 6 :: ',
    'Бот :: 620 :: 5 :: ',
    'Мини-приложение :: 980 :: 7 :: ',
    'Бот и приложение :: 1490 :: 10 :: ',
    'Приглашение :: 380 :: 3 :: ',
    'Сайт события :: 690 :: 5 :: '
  ].join('|'),
  /* доп: «название :: цена :: дней» — разделы и пояснения лежат в ADD.
     Порядок строк обязан совпадать с порядком позиций в ADD */
  txtSvcAdds:[
    /* сайты */
    'Панель заявок :: 520 :: 4',
    'Телеграм-бот :: 370 :: 3',
    'Магазин с оплатой :: 420 :: 3',
    'Тексты под ключ :: 290 :: 2',
    'Логотип и фирстиль :: 230 :: 2',
    'Фото под сайт :: 160 :: 1',
    /* телеграм */
    'Оплата в боте :: 330 :: 3',
    'Каталог товаров :: 380 :: 3',
    'Рассылки :: 240 :: 2',
    'Панель заказов :: 460 :: 4',
    'Сценарии и тексты :: 190 :: 2',
    'Иконка и обложка :: 150 :: 1',
    /* события */
    'Ответы гостей :: 140 :: 1',
    'Карта и дорога :: 90 :: 1',
    'Фото и музыка :: 120 :: 1',
    'Текст приглашения :: 160 :: 1',
    'Короткая ссылка :: 90 :: 1',
    'Версия для печати :: 160 :: 2',
    /* всегда */
    'Поддержка :: 60 :: 0',
    'Обучение :: 110 :: 1',
    'Разбор через месяц :: 140 :: 1'
  ].join('|'),
  txtSvcAddsK:'что можно добавить к этому формату',
  /* разница форматов — своя под каждым рядом: «что с чем :: чем отличается».
     Заголовок и строки разнесены по ключам, чтобы правились по отдельности */
  txtSvcDiffKSites:'Чем форматы сайтов отличаются друг от друга',
  txtSvcDiffSites:[
    'Страница и Сайт :: Страница — один экран под одно предложение и одно действие. Сайт — несколько экранов с навигацией: услуги, работы, цены, контакты, плюс панель, где вы сами правите тексты.',
    'Сайт и Авторский :: В «Сайте» экраны собираются из решений, уже проверенных на других проектах. В «Авторском» каждый экран придумывается заново — сцена, анимация, свой характер. Это то, за что сайт запоминают и пересылают друзьям.',
    'Многостраничный :: Берут, когда разделов и товаров много: карточки живут в одном файле данных, добавить позицию — строчка, а не новая страница. Плюс фильтры, поиск и SEO под каждую карточку.',
    'Редизайн :: Когда сайт есть, но стыдно давать ссылку. Тексты и смысл остаются, меняется всё остальное — это дешевле, чем собирать заново.'
  ].join('|'),
  txtSvcDiffKTg:'Чем бот отличается от мини-приложения',
  txtSvcDiffTg:[
    'Бот :: Разговор в переписке: команды, вопросы, заявки. Хорош, когда нужно принять заказ или ответить на частые вопросы без вашего участия.',
    'Мини-приложение :: Полноценный экран внутри телеграма — со своим интерфейсом, каталогом, оплатой. Человеку не надо ставить приложение и никуда переходить.',
    'Вместе :: Бот пишет и уведомляет, приложение показывает и продаёт. Общая база, один заказ виден в обоих.',
    'И сайт тоже? :: Телеграм — не замена сайту, а вторая дверь. Часто берут вместе со «Страницей»: там реклама, тут покупка.'
  ].join('|'),
  txtSvcDiffKEvt:'Чем приглашение отличается от сайта события',
  txtSvcDiffEvt:[
    'Приглашение :: Одна страница к дате: кто, где, когда, как добраться и кнопка «буду». Гость видит всё за десять секунд, ответы падают вам в телеграм.',
    'Сайт события :: Когда одной страницы мало: программа по часам, участники, галерея, регистрация. Берут для больших свадеб, конференций и фестивалей.',
    'Сроки :: Приглашение собираю за три дня — обычно его заказывают, когда до даты осталось мало времени. Сайт события — от пяти.'
  ].join('|'),
  txtSvcRestT:'Нужно другое?',
  txtSvcRestD:'Приглашение на свадьбу, доработка чужого сайта, бот под задачу — тоже делаю. Опишите задачу, отвечу с ценой и сроком.',
  txtSvcRestBtn:'написать',
  txtSvcCta:'обсудить проект',
  txtSvcReset:'собрать заново',
  txtSvcHint:'Сначала макет, деньги — когда увидите готовое',
  /* подписи внутри чека */
  txtSvcCheckK:'ваш чек',
  txtSvcChFmt:'формат',
  txtSvcChInc:'входит в работу',
  txtSvcChAdd:'добавлено',
  txtSvcChN:'позиций',
  txtSvcChOff:'скидка за набор',
  txtSvcChDays:'срок работы',
  txtSvcChTot:'итого',
  txtSvcChMonth:'потом',
  txtSvcChBye:'спасибо, что дочитали',
  txtSvcIncWord:'вкл',
  txtSvcSndOn:'звук вкл',
  txtSvcSndOff:'звук выкл',

  /* как я работаю: строка на шаг, «название :: текст» */
  txtFlowTitle:'Четыре шага, без сюрпризов в конце',
  txtFlowLead:'Показываю варианты по ходу, а не приношу готовое в последний день.',
  txtFlowKeys:'шаг первый|шаг второй|шаг третий|шаг четвёртый',
  txtFlowList:[
    'Разбор :: Сначала вопрос «зачем сайт и что человек должен на нём сделать», потом всё остальное.',
    'Идея экранов :: Каждый экран получает свою мысль и свой приём. Показываю варианты шрифтов, кнопок и движения — выбираешь ты.',
    'Сборка :: Пишу вручную: чистый HTML, CSS и JS под задачу. Никаких конструкторов и готовых тем.',
    'Запуск :: Скорость, телефон, заголовки и карточки для соцсетей. Отдаю исходники — сайт можно развивать дальше.'
  ].join('|'),

  /* преимущества: строка = заголовок :: пояснение, иконки живут в коде */
  txtAdvEyebrow:'почему я',
  txtAdvTitle:'Что вы получаете',
  txtAdvLead:'Коротко о том, чем работа со мной отличается от сборки на конструкторе.',
  txtAdvList:[
    'Быстрая разработка :: Сайт с нуля — около двух недель, а не двух месяцев.',
    'Фокус на конверсию :: Экран ведёт к заявке, а не просто красиво выглядит.',
    '100% адаптив :: Телефон, планшет, монитор — проверяю каждый.',
    'Свой код :: Без конструкторов и готовых тем, потолка возможностей нет.',
    'Скорость загрузки :: Лёгкие картинки и шрифты по делу — страница открывается сразу.',
    'SEO-база :: Заголовки, описания, карточки для соцсетей и карта сайта.'
  ].join('|'),

  /* Принципы — гарантийный талон. Строка = слово :: обещание.
     Слово слева короткое нарочно: в талоне это графа, а не заголовок */
  txtPrEyebrow:'принципы',
  txtPrTitle:'Как я веду работу',
  txtPrLead:'Четыре правила, по которым со мной можно иметь дело.',
  txtPrWarK:'условия работы',
  txtPrWarNo:'№ 0001 · бессрочно',
  txtPrWarFoot:'действует с первого дня работы',
  txtPrWarStamp:'выдан',
  txtPrList:[
    'Срок :: названная дата соблюдается, без «ещё пары дней»',
    'Результат :: считаем заявки после запуска, а не любуемся',
    'Цена :: о рисках говорю до начала, а не по дороге',
    'Поддержка :: помогаю разобраться и остаюсь на связи после сдачи'
  ].join('|'),

  /* стек: строка = название :: зачем нужно. Звёздочка в начале — «беру
     в работу, но в портфолио пока нет», такие показываем контуром */
  txtStkEyebrow:'чем я работаю',
  txtStkTitle:'Инструменты и зачем они вам',
  txtStkKey:'зачем это нужно',
  txtStkNote:'Контуром — беру в работу, но своими работами пока не подтверждено.',
  txtStkList:[
    'HTML :: Каркас страницы. Семантика даёт поиску понять, о чём сайт.',
    'CSS :: Внешний вид и вся анимация без тяжёлых библиотек.',
    'JavaScript :: Любое поведение пишу сам — потолка «как в теме предусмотрели» нет.',
    'canvas :: Частицы и сцены, которые невозможно собрать вёрсткой.',
    'SVG :: Чертежи и иконки линиями: чёткие на любом экране и почти ничего не весят.',
    'адаптив :: Ровно на телефоне, планшете и мониторе — проверяю каждый.',
    'Python :: Боты и серверная часть: приём заявок, обработка данных.',
    'телеграм-боты :: Заявки падают прямо в личку, без лишних сервисов.',
    'Mini App :: Приложение внутри телеграма — уже сделан живой конвертер.',
    'Git :: История правок: всегда можно вернуться к рабочей версии.',
    'WebP :: Картинки весят в разы меньше — страница грузится быстрее.',
    'SEO-база :: Заголовки, описания, карточки для соцсетей и карта сайта.',
    '*React :: Возьму, если проекту нужен именно он. В портфолио пока нет.',
    '*Next.js :: Беру в работу, но своими работами пока не подтверждено.',
    '*Three.js :: 3D в браузере. Следующее, что хочу освоить на боевом проекте.'
  ].join('|'),

  /* обо мне: одна фраза во весь экран. Звёздочками помечено то,
     что уходит в приглушённый цвет — так правится из твикера без разметки */
  txtAboutPhrase:'Каждый экран — *отдельная идея,* а не блок из библиотеки',
  txtAboutFacts:[
    'Минск :: работаю удалённо',
    '7 работ :: собраны за месяц',
    'свой код :: без конструкторов и готовых тем',
    'портфолио :: а не оплаченные заказы — так и говорю'
  ].join('|'),

  /* контакты. Строки визитки — «подпись :: значение», {tg} подставляет
     адрес телеграма, чтобы он жил в одном месте, а не в двух */
  txtCtTitle:'',   /* то же: надзаголовок уже говорит «КОНТАКТЫ» */
  txtCtWho:'Тимофей',
  txtCtLead:'Отвечаю в телеграме, обычно в тот же день. Если проект не мой — так и скажу и подскажу, к кому идти.',
  txtCtCard:'Город :: Минск|Telegram :: {tg}|Ответ :: в течение дня|• Сейчас :: беру проекты',
  txtTgName:'@aeternaweb',
  txtCtPhName:'Имя',
  txtCtPhContact:'Телеграм, почта или телефон',
  txtCtPhAbout:'О задаче',
  txtCtKinds:'Сайт с нуля|Редизайн|Анимация или сцена|Каталог или магазин|Бот в телеграме|Пока не знаю',
  txtCtSend:'отправить заявку',
  txtCtErr:'Поля «имя» и «связь» — обязательные.',
  txtCtOk:'Заявка ушла. Отвечу в течение дня.',
  txtCtOffline:'Текст заявки скопирован — открываю телеграм, осталось вставить его в чат.',
  txtCtGo:'Телеграм не открылся сам — вот ссылка:',
  txtFootNote:'Сайт собран вручную: без конструкторов, библиотек анимации и готовых тем.'
};

const cfg = Object.assign({}, DEFAULTS);
const STORE = 'stapel.cfg';
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
  Object.keys(saved).forEach(k => { if (k in DEFAULTS) cfg[k] = saved[k]; });
} catch(e){}

/* в localStorage могла остаться палитра «custom» — заводим её, чтобы
   выпадающий список не остался пустым */
if (!PALETTES[cfg.palette]){
  PALETTES.custom = { name:'Свои цвета',
    bg:cfg.bg, ink:cfg.ink, dim:cfg.dim, accent:cfg.accent, wire:cfg.wire, line:cfg.line };
  cfg.palette = 'custom';
}

function save(){
  const diff = {};
  for (const k in cfg) if (cfg[k] !== DEFAULTS[k]) diff[k] = cfg[k];
  try { localStorage.setItem(STORE, JSON.stringify(diff)); } catch(e){}
}
function reset(){ Object.assign(cfg, DEFAULTS); try { localStorage.removeItem(STORE); } catch(e){} apply(); buildGrid(); replay(); }

function usePalette(key){
  const p = PALETTES[key]; if (!p) return;
  cfg.palette = key;
  ['bg','ink','dim','accent','wire','line'].forEach(k => cfg[k] = p[k]);
  apply(); save();
}

/* ---------------------------------------------- применение настроек */
const root = document.documentElement;
/* Пара по умолчанию уже прописана ссылкой в head, поэтому считаем её
   загруженной: иначе apply() тут же подменил бы href тем же самым набором
   и браузер скачал бы шрифты второй раз. Свой шрифт из твикера отличается
   от дефолта, для него подмена отработает как обычно. */
let fontLoaded = DEFAULTS.font;

/* Переменную пишем всегда, даже когда она равна дефолту. Раньше на дефолте
   свойство снималось и вид держали запасные значения в CSS — стоило поменять
   DEFAULTS, и настройки молча откатывались к старому CSS. Теперь источник
   правды один: DEFAULTS здесь, а запасные значения в CSS — только страховка
   на случай, если скрипт не отработал. Третий аргумент больше не нужен, но
   оставлен: его передают все вызовы, и снимать его по всему файлу незачем */
function setVar(name, value, def){
  root.style.setProperty(name, value);
}

function loadFont(key){
  const f = FONTS[key]; if (!f || fontLoaded === key) return;
  fontLoaded = key;
  const fams = f.h === f.b
    ? `family=${f.h.replace(/ /g,'+')}:wght@${f.w}`
    : `family=${f.h.replace(/ /g,'+')}:wght@${f.w}&family=${f.b.replace(/ /g,'+')}:wght@300;400;500;600`;
  document.getElementById('fontLink').href =
    `https://fonts.googleapis.com/css2?${fams}&display=swap`;
}

function apply(){
  const f = FONTS[cfg.font] || FONTS.unbOnest;
  loadFont(cfg.font);
  setVar('--fh', `'${f.h}', system-ui, sans-serif`, `'Unbounded', system-ui, sans-serif`);
  setVar('--fb', `'${f.b}', system-ui, sans-serif`, `'Onest', system-ui, sans-serif`);

  ['bg','ink','dim','accent','wire','line'].forEach(k => setVar('--' + k, cfg[k], DEFAULTS[k]));

  setVar('--h1size', cfg.h1size, DEFAULTS.h1size);
  setVar('--h1w', cfg.h1w, DEFAULTS.h1w);
  setVar('--h1track', cfg.h1track, DEFAULTS.h1track);
  setVar('--h1lh', cfg.h1lh, DEFAULTS.h1lh);
  setVar('--bodysize', cfg.bodysize, DEFAULTS.bodysize);
  setVar('--gridop', cfg.gridop, DEFAULTS.gridop);
  setVar('--curSize', cfg.curSize, DEFAULTS.curSize);
  setVar('--curRing', cfg.curRing, DEFAULTS.curRing);
  setVar('--radius', cfg.radius + 'px', DEFAULTS.radius + 'px');

  ['btnPadY','btnPadX','btnFs','btnTrack','btnMinW','btnBw','btnR','btnDot']
    .forEach(k => setVar('--' + k, cfg[k], DEFAULTS[k]));
  setVar('--btnSpeed', cfg.btnSpeed + 's', DEFAULTS.btnSpeed + 's');
  setVar('--btnFill', cfg.btnFill + 's', DEFAULTS.btnFill + 's');
  document.body.classList.toggle('is-btn-lower', !!cfg.btnLower);

  /* неоновая рамка: цвета, толщина, скорость и свечение — всё крутится
     из твикера, поэтому переменные пишем здесь, а не зашиваем в CSS */
  ['neon1','neon2','neon3'].forEach(k => setVar('--' + k, cfg[k], DEFAULTS[k]));
  setVar('--neonw', cfg.neonW + 'px', DEFAULTS.neonW + 'px');
  setVar('--neonSpin', cfg.neonSpin + 's', DEFAULTS.neonSpin + 's');
  setVar('--neonGlow', cfg.neonGlow, DEFAULTS.neonGlow);
  setVar('--neonBlur', cfg.neonBlur + 'px', DEFAULTS.neonBlur + 'px');
  document.body.classList.toggle('is-neon-always', !!cfg.neonAlways);
  document.body.classList.toggle('is-nomac', cfg.macFrame === false);

  root.dataset.cursor = cfg.cursor;
  root.dataset.btn = cfg.btn;
  document.body.classList.toggle('is-cursor-custom', cfg.cursor !== 'system');
  stageEl && (stageEl.style.display = cfg.showStage ? '' : 'none');

  drawText();
}

/* ---------------------------------------------- плавные переходы по якорям
   «Смотреть работы», пункты меню и всё остальное, что ведёт на #секцию,
   раньше швыряло страницу мгновенно. Ведём сами, а не через
   scroll-behavior:smooth в CSS: браузерное сглаживание нельзя ни замедлить,
   ни выключить для одного случая, а нам нужно и то и другое — при
   выключенных анимациях прыжок обязан остаться мгновенным. */
function smoothTo(el){
  if (!el) return;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block:'start' });
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.hasAttribute('data-empty')) return;

  const id = a.getAttribute('href').slice(1);
  if (!id) return;                       /* href="#" — заглушка, не якорь */
  const target = document.getElementById(id);
  if (!target) return;

  e.preventDefault();
  smoothTo(target);
  /* адрес правим сами: без preventDefault браузер прыгнул бы сам,
     а без этой строки ссылку нельзя было бы скопировать из адресной строки */
  history.replaceState(null, '', '#' + id);
});

/* ---------------------------------------------- тексты */
/* Имя секции берётся из пункта меню, а не пишется рядом второй раз: иначе
   они разъезжаются при первой же правке — в меню «РАБОТЫ», а над секцией
   «Портфолио». Порядок тот же, что у MENU_IDS ниже: работы, услуги,
   как я работаю, обо мне, контакты. */
const MENU_EYEBROWS = ['worksEyebrow', 'svcEyebrow', 'flowEyebrow', 'aboutEyebrow', 'ctEyebrow'];

/* Имя секции «работы»: последние две буквы уходят в контур, остальные
   остаются залитыми. Разметку ставим здесь, а не в index.html, потому что
   слово приезжает из пункта меню и его длина заранее не известна.
   Прогон безопасно повторять: после него textContent совпадает с исходным
   словом, и общий проход drawText() узел больше не трогает. */
const OUTLINE_TAIL = 2;

function splitWorksName(){
  const n = document.querySelector('[data-txt="worksEyebrow"]');
  if (!n) return;
  const word = n.textContent;
  if (word.length <= OUTLINE_TAIL || n.querySelector('.wname__o')) return;

  const head = word.slice(0, -OUTLINE_TAIL);
  const tail = word.slice(-OUTLINE_TAIL);
  /* data-t читает CSS: контурные копии-эхо рисуются через content:attr() */
  n.innerHTML = `${head}<span class="wname__o" data-t="${tail}">${tail}</span>`;
}

function drawText(){
  const map = {
    name:cfg.txtName, mark:cfg.txtMark, role:cfg.txtRole,
    tag:cfg.txtTag, tagDim:cfg.txtTagDim,
    btn1:cfg.txtBtn1, btn2:cfg.txtBtn2, btnLoad:cfg.txtBtnLoad, btnDone:cfg.txtBtnDone,
    place:cfg.txtPlace, tg:cfg.txtTg, status:cfg.txtStatus,
    tgCta:cfg.txtTgCta, tgName:cfg.txtTgName, macTag:cfg.txtMacTag,
    worksTitle:cfg.txtWorksTitle,
    worksLead:cfg.txtWorksLead, worksHint:cfg.txtWorksHint, worksMore:cfg.txtWorksMore,
    svcTitle:cfg.txtSvcTitle, svcLead:cfg.txtSvcLead,
    svcCta:cfg.txtSvcCta, svcReset:cfg.txtSvcReset, svcAddsK:cfg.txtSvcAddsK, svcHint:cfg.txtSvcHint,
    svcRestBtn:cfg.txtSvcRestBtn,
    svcRestT:cfg.txtSvcRestT, svcRestD:cfg.txtSvcRestD,
    svcCheckK:cfg.txtSvcCheckK, svcChFmt:cfg.txtSvcChFmt, svcChInc:cfg.txtSvcChInc,
    svcChAdd:cfg.txtSvcChAdd, svcChN:cfg.txtSvcChN, svcChOff:cfg.txtSvcChOff,
    svcChDays:cfg.txtSvcChDays, svcChTot:cfg.txtSvcChTot, svcChMonth:cfg.txtSvcChMonth,
    svcChBye:cfg.txtSvcChBye,
    flowTitle:cfg.txtFlowTitle, flowLead:cfg.txtFlowLead,
    advEyebrow:cfg.txtAdvEyebrow, advTitle:cfg.txtAdvTitle, advLead:cfg.txtAdvLead,
    prEyebrow:cfg.txtPrEyebrow, prTitle:cfg.txtPrTitle, prLead:cfg.txtPrLead,
    prWarK:cfg.txtPrWarK, prWarNo:cfg.txtPrWarNo, prWarFoot:cfg.txtPrWarFoot,
    prWarStamp:cfg.txtPrWarStamp,
    stkEyebrow:cfg.txtStkEyebrow, stkTitle:cfg.txtStkTitle,
    stkKey:cfg.txtStkKey, stkNote:cfg.txtStkNote,
    aboutEyebrow:cfg.txtAboutEyebrow,
    ctTitle:cfg.txtCtTitle, ctLead:cfg.txtCtLead,
    ctGo:cfg.txtCtGo,
    ctWho:cfg.txtCtWho, ctSend:cfg.txtCtSend, footNote:cfg.txtFootNote,
    menu:menuOpen ? cfg.txtMenuOpen : cfg.txtMenu
  };

  /* надзаголовки пяти секций — те же слова, что в меню. Правишь пункт —
     переименовывается и секция, разъехаться они больше не могут */
  String(cfg.txtMenuList).split('|').forEach((t, i) => {
    if (MENU_EYEBROWS[i]) map[MENU_EYEBROWS[i]] = t.trim();
  });

  document.querySelectorAll('[data-txt]').forEach(n => {
    const v = map[n.dataset.txt];
    if (v != null && n.textContent !== v) n.textContent = v;
  });

  splitWorksName();

  /* подсказки в полях заявки живут в том же словаре, но пишутся в placeholder */
  document.querySelectorAll('[data-ph]').forEach(n => {
    const v = cfg['txt' + n.dataset.ph.charAt(0).toUpperCase() + n.dataset.ph.slice(1)];
    if (v != null && n.placeholder !== v) n.placeholder = v;
  });
  document.title = cfg.txtName + ' — ' + cfg.txtRole;

  /* ссылку в телеграм не выдумываем: пока адрес пустой — она не кликается */
  const url = String(cfg.txtTgUrl).trim();
  document.querySelectorAll('[data-tg]').forEach(a => {
    if (url){ a.href = url; a.removeAttribute('data-empty'); a.removeAttribute('aria-disabled'); }
    else { a.href = '#'; a.setAttribute('data-empty', ''); a.setAttribute('aria-disabled', 'true'); }
  });
}

/* ---------------------------------------------- кнопки
   На сайте одна кнопка на все случаи: точка в покое разрастается в фон.
   Внутренности собираем кодом — иначе на каждую кнопку по 12 спанов,
   и любая правка приёма превращается в правку разметки в пяти местах. */
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

function buildHButtons(){
  document.querySelectorAll('.hbtn').forEach(b => {
    if (b.querySelector('.hbtn__label')) return;
    const key = b.dataset.key || 'btn1';
    const arrow = b.hasAttribute('data-noarrow') ? '' : ARROW;
    const states = b.hasAttribute('data-states')
      ? `<span class="hbtn__st hbtn__st--load"><i class="hbtn__spin"></i><span data-txt="btnLoad"></span></span>
         <span class="hbtn__st hbtn__st--done">${CHECK}<span data-txt="btnDone"></span></span>`
      : '';
    b.dataset.state = 'idle';
    b.innerHTML =
      `<span class="hbtn__dot" aria-hidden="true"></span>
       <span class="hbtn__label" data-txt="${key}"></span>
       <span class="hbtn__over" aria-hidden="true">
         <span class="hbtn__st hbtn__st--idle"><span data-txt="${key}"></span>${arrow}</span>
         ${states}
       </span>`;
  });
}

/* ---------------------------------------------- состояния кнопки с точкой */
/* idle → loading → success → idle. Пока формы нет, отправка имитируется;
   когда появится, зовём runHBtn(кнопка, () => fetch(...)) и цикл станет настоящим */
function runHBtn(b, task){
  if (!b || b.dataset.state !== 'idle') return;
  /* без разметки состояний показывать в «отправляю» нечего —
     получилась бы пустая залитая таблетка */
  if (!b.querySelector('.hbtn__st--load')) return;
  b.dataset.state = 'loading';
  b.setAttribute('aria-busy', 'true');
  const finish = () => {
    b.dataset.state = 'success';
    b.removeAttribute('aria-busy');
    setTimeout(() => { if (b.dataset.state === 'success') b.dataset.state = 'idle'; }, 2600);
  };
  if (typeof task === 'function') Promise.resolve().then(task).then(finish, finish);
  else setTimeout(finish, 1600);
}

/* автомат отправки цепляем только к тем кнопкам, которые правда что-то
   отправляют. Ссылка «смотреть работы» и МЕНЮ должны работать как обычно */
function wireHButtons(){
  document.querySelectorAll('.hbtn[data-states]').forEach(b => {
    if (b.dataset.wired) return;
    b.dataset.wired = '1';
    b.addEventListener('click', () => runHBtn(b));
  });
}

/* ---------------------------------------------- меню */
let menuOpen = false;
const menuEl = document.getElementById('menu');
const menuList = menuEl.querySelector('.menu__list');
const menuBtn = document.querySelector('.hbtn--menu');

/* пункты меню стоят в том же порядке, что и секции. Пока секции нет —
   пункт остаётся, но никуда не ведёт: лучше, чем ссылка в пустоту */
const MENU_IDS = ['works', 'services', 'flow', 'about', 'contact'];

/* Пункт меню собран из букв в два слоя: верхний уезжает вверх, нижний
   приходит снизу, каждая буква со своей задержкой. Пробелы заменяем
   неразрывными — иначе flex схлопывает их и слова слипаются. */
function flipHTML(t){
  const letters = [...t].map((c, i) => {
    const ch = c === ' ' ? '&nbsp;' : c;
    return `<span style="transition-delay:${i * 25}ms">${ch}</span>`;
  }).join('');
  return `<i class="flip__a">${letters}</i><i class="flip__b">${letters}</i>`;
}

function buildMenu(){
  const items = String(cfg.txtMenuList).split('|').map(s => s.trim()).filter(Boolean);
  menuList.innerHTML = items.map((t, i) => {
    const id = MENU_IDS[i];
    const has = id && document.getElementById(id);
    return `<li style="--i:${i}">
              <a class="flip" href="${has ? '#' + id : '#'}"${has ? '' : ' data-empty'}
                 aria-label="${t}">${flipHTML(t)}</a>
            </li>`;
  }).join('');
}

/* клик по пункту закрывает шторку, иначе она остаётся поверх нужной секции */
menuList.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

function setMenu(v){
  menuOpen = v;
  document.body.classList.toggle('is-menu', v);
  menuEl.setAttribute('aria-hidden', v ? 'false' : 'true');
  menuBtn.setAttribute('aria-expanded', v ? 'true' : 'false');
  drawText();
}
menuBtn.addEventListener('click', () => setMenu(!menuOpen));
addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) setMenu(false); });

/* ---------------------------------------------- МЕНЮ: магнит и парковка */
/* Кнопка живёт в собственном слое поверх страницы, а в подвале первого
   экрана вместо неё стоит пустышка того же размера — иначе «листай» и
   подпись фазы разъехались бы по сетке. Пока пустышка на виду, кнопка
   стоит ровно на её месте; когда та уезжает вверх, кнопка паркуется
   у нижнего края и дальше едет вместе со страницей.

   Магнит считаем от центра кнопки: вблизи курсора она тянется к нему
   долей расстояния, вдали — возвращается. Позицию догоняем пружиной,
   иначе на быстром движении мыши кнопка дёргалась бы рывками. */
const menuSlot = document.createElement('span');
menuSlot.className = 'hbtn__slot';
menuBtn.parentNode.insertBefore(menuSlot, menuBtn);
document.body.appendChild(menuBtn);
menuBtn.classList.add('hbtn--float');

const MAG_R = 190;        /* с какого расстояния кнопка чувствует курсор */
const MAG_PULL = 0.3;     /* какую долю расстояния проходит навстречу */
const MAG_PARK = 30;      /* отступ от нижнего края в припаркованном виде */

const magCalm = matchMedia('(prefers-reduced-motion:reduce)');
/* на сенсоре магнита нет: палец не «наводится», а тянуть кнопку к месту
   касания значит уводить её из-под пальца ровно в момент нажатия */
const magTouch = matchMedia('(hover:none)');
let magPX = 0, magPY = 0, magX = 0, magY = 0, magHas = false;
let magW = 0, magH = 0, magFirst = true, magIdle = false;

/* размер пустышки держим равным кнопке: она задаёт место в сетке.
   Заодно кэшируем габариты — в кадре их мерить значит гонять вёрстку зря */
function menuFit(){
  const r = menuBtn.getBoundingClientRect();
  if (!r.width) return;
  magW = r.width; magH = r.height;
  menuSlot.style.width = magW + 'px';
  menuSlot.style.height = magH + 'px';
}

function menuFrame(){
  const s = menuSlot.getBoundingClientRect();
  /* пустышка уехала выше стоянки — держим кнопку у нижнего края */
  const park = innerHeight - magH - MAG_PARK;
  const baseX = s.left;
  const baseY = Math.max(s.top, park);

  let tx = baseX, ty = baseY;
  if (magHas && !menuOpen && !magCalm.matches && !magTouch.matches){
    const dx = magPX - (baseX + magW / 2), dy = magPY - (baseY + magH / 2);
    const d = Math.hypot(dx, dy);
    if (d < MAG_R){
      /* у самого края радиуса тяга сходит на нет — без этого кнопка
         прыгала бы, едва курсор пересёк границу */
      const k = (1 - d / MAG_R) * MAG_PULL;
      tx += dx * k; ty += dy * k;
    }
  }

  /* первый кадр ставим без пружины, иначе кнопка приезжает из угла */
  const ease = (magFirst || magCalm.matches) ? 1 : 0.16;
  magFirst = false;
  magX += (tx - magX) * ease;
  magY += (ty - magY) * ease;
  menuBtn.style.setProperty('--fx', magX.toFixed(1) + 'px');
  menuBtn.style.setProperty('--fy', magY.toFixed(1) + 'px');

  /* Кадр заказываем только пока есть что довозить. Вечный цикл читал
     getBoundingClientRect каждый кадр — это работа вёрстки на полностью
     неподвижной странице, впустую и на батарею. Разбудить цикл может
     любое движение мыши, прокрутка или смена размера окна. */
  if (Math.abs(tx - magX) > .06 || Math.abs(ty - magY) > .06) requestAnimationFrame(menuFrame);
  else magIdle = true;
}

function magWake(){
  if (!magIdle) return;
  magIdle = false;
  requestAnimationFrame(menuFrame);
}

addEventListener('pointermove', e => { magPX = e.clientX; magPY = e.clientY; magHas = true; magWake(); }, { passive:true });
addEventListener('pointerdown', e => { magPX = e.clientX; magPY = e.clientY; magHas = true; magWake(); }, { passive:true });
/* на тачскрине магнита нет: палец не «наводится», и кнопка убегала бы из-под него */
addEventListener('pointerleave', () => { magHas = false; magWake(); });
addEventListener('scroll', magWake, { passive:true });

addEventListener('resize', () => { menuFit(); magWake(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(menuFit);

/* ---------------------------------------------- витрина работ */
/* Правый блок первого экрана: рамка браузера, внутри по очереди сменяются
   настоящие кадры проектов. Ноутбука и стола нарочно нет — раскрывающийся
   ноутбук стоит на тысячах портфолио и ставит в один ряд со всеми.

   Экраны пока нарисованы кодом, а не сняты: скриншоты подставим позже.
   Поэтому у витрины сейчас нулевой вес и ей нечего ждать при загрузке.
   Чтобы подменить на фото, довольно заменить содержимое .shw__p на <img>. */
/* Строка адреса нарочно пустая: сайты по выдуманным доменам не живут,
   а писать их значило бы обещать то, чего нет. Пустое поле оставлено,
   чтобы полоса всё ещё читалась как браузер. */
const SHOW = [
  { k:'dark',  n:'KLAUS',       d:'ресторан · меню и бронирование',   img:'assets/works/klaus.webp' },
  { k:'noir',  n:'МЕТРИУМ',     d:'недвижимость · подбор и заявки',   img:'assets/works/metrium.webp' },
  { k:'amber', n:'МОТОАРЕНА',   d:'мотосалон · витрина и сервис',     img:'assets/works/motoarena.webp' },
  { k:'rose',  n:'Nuvelle',     d:'магазин одежды · каталог и видео', img:'assets/works/nuvelle.webp' },
  { k:'acid',  n:'КИНОНОЧЬ',    d:'частный кинотеатр · брутализм',    img:'assets/works/cinemanight.webp' },
  { k:'bloom', n:'FlowerHome',  d:'цветы с доставкой · каталог',      img:'assets/works/flowerhome.webp' },
  { k:'noir',  n:'Ray-Ban Meta',d:'концепт · сцена из 275 кадров',    img:'assets/works/rayban.webp' }
];

const shw = document.getElementById('shw');

if (shw){
  const view = shw.querySelector('.shw__view');
  const dots = shw.querySelector('.shw__dots');
  const nameEl = shw.querySelector('.shw__n');
  const descEl = shw.querySelector('.shw__d');

  view.innerHTML = SHOW.map((s, i) => `
    <div class="shw__p${i === 0 ? ' is-on' : ''}" data-k="${s.k}" role="img"
         aria-label="${s.n} — ${s.d}">
      <img class="shw__img" src="${s.img}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}">
    </div>`).join('');
  dots.innerHTML = SHOW.map((s, i) =>
    `<button type="button" role="tab" data-i="${i}" class="${i === 0 ? 'is-on' : ''}"
             aria-label="${s.n}" aria-selected="${i === 0}"></button>`).join('');

  const shots = [...view.querySelectorAll('.shw__p')];
  const bullets = [...dots.querySelectorAll('button')];
  let si = 0, shwTimer = 0;

  let outTimer = 0;

  function shwGo(i){
    if (i === si) return;
    const prev = shots[si];
    prev.classList.remove('is-on');
    /* уходящий кадр держим видимым, пока новый проступает сквозь размытие:
       снимешь сразу — под ним на полсекунды мелькнёт серая подложка рамки */
    prev.classList.add('is-out');
    clearTimeout(outTimer);
    outTimer = setTimeout(() => prev.classList.remove('is-out'), 900);

    bullets[si].classList.remove('is-on');
    bullets[si].setAttribute('aria-selected', 'false');
    si = i;
    shots[si].classList.remove('is-out');
    shots[si].classList.add('is-on');
    bullets[si].classList.add('is-on');
    bullets[si].setAttribute('aria-selected', 'true');
    nameEl.textContent = SHOW[si].n;
    descEl.textContent = SHOW[si].d;
  }

  const shwNext = () => shwGo((si + 1) % SHOW.length);
  const shwPlay = () => { clearInterval(shwTimer); shwTimer = setInterval(shwNext, 3800); };
  const shwStop = () => clearInterval(shwTimer);

  dots.addEventListener('click', e => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    shwGo(+b.dataset.i);
    shwPlay();                       /* после ручного выбора отсчёт с нуля */
  });
  /* под курсором смена мешает разглядывать — придерживаем */
  shw.addEventListener('pointerenter', shwStop);
  shw.addEventListener('pointerleave', shwPlay);

  /* Окно едет за курсором. Сюда пишем только положение курсора двумя
     переменными, сам сдвиг считает CSS: так вид эффекта правится в стилях,
     а не в скрипте. Считаем в rAF — pointermove на мониторе 144 Гц сыплет
     чаще, чем браузер рисует кадры. На тач-экране не включаем: палец не
     «наводится», и окно застревало бы сдвинутым после тапа. */
  if (matchMedia('(hover:hover)').matches &&
      !matchMedia('(prefers-reduced-motion:reduce)').matches){
    /* Двигаем обёртку: вместе с витриной едет и метка «Lighthouse»,
       приклеенная к её углу. Ловим курсор тоже по обёртке — иначе метка
       торчала бы из области, которая на него отзывается */
    const box = shw.closest('.mac') || shw;
    let tx = 0, ty = 0, tRaf = 0;

    const tiltDraw = () => {
      tRaf = 0;
      box.style.setProperty('--tx', tx.toFixed(3));
      box.style.setProperty('--ty', ty.toFixed(3));
    };

    box.addEventListener('pointermove', e => {
      const r = box.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5;
      ty = (e.clientY - r.top) / r.height - .5;
      box.classList.add('is-live');
      if (!tRaf) tRaf = requestAnimationFrame(tiltDraw);
    }, { passive:true });

    box.addEventListener('pointerleave', () => {
      if (tRaf){ cancelAnimationFrame(tRaf); tRaf = 0; }
      box.classList.remove('is-live');
      tx = ty = 0;
      tiltDraw();                      /* в ноль — назад вернёт долгий переход из CSS */
    });
  }
  /* в фоновой вкладке крутить нечего: кадры всё равно не рисуются */
  document.addEventListener('visibilitychange', () => document.hidden ? shwStop() : shwPlay());

  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) shwPlay();
}

/* ---------------------------------------------- сетка */
const colsEl = document.querySelector('.hero__cols');
const rowsEl = document.querySelector('.hero__rows');

function buildGrid(){
  colsEl.innerHTML = ''; rowsEl.innerHTML = '';
  for (let i = 1; i < cfg.cols; i++){
    const n = document.createElement('i');
    n.style.left = (i / cfg.cols * 100) + '%';
    if (cfg.gridKeys && i % 4 === 0) n.classList.add('is-key');
    colsEl.appendChild(n);
  }
  for (let i = 1; i < cfg.rows; i++){
    const n = document.createElement('i');
    n.style.top = (i / cfg.rows * 100) + '%';
    if (cfg.gridKeys && i % 3 === 0) n.classList.add('is-key');
    rowsEl.appendChild(n);
  }
}

/* ---------------------------------------------- плитки */
const tilesEl = document.querySelector('.tiles');
function works(){
  return String(cfg.txtWorks).split('|').map(s => s.trim()).filter(Boolean);
}

function buildTiles(){
  if (!tilesEl) return;   /* плитки уехали из главного экрана — вернутся в блоке работ */
  const names = works();
  tilesEl.innerHTML = '';
  names.slice(0, 9).forEach((name, i) => {
    const t = TILES[i % TILES.length];
    const el = document.createElement('div');
    el.className = 'tile';
    el.innerHTML =
      `<i class="tile__ph"></i>
       <div class="tile__c">
         <span class="tile__bar tile__bar--a" style="width:${Math.round(t.a * 100)}%"></span>
         <span class="tile__bar" style="width:${40 + (i * 13) % 45}%"></span>
         <span class="tile__n">${name}</span>
       </div>`;
    tilesEl.appendChild(el);
  });
}

/* ---------------------------------------------- шкала времени */
const stageEl = document.querySelector('[data-stage]');
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const seg = (t, start, dur) => clamp01((t - start) / Math.max(dur, .0001));

/* если сетку погасили, её фаза превращалась в пустой экран на старте —
   в этом случае просто не тратим на неё время */
function gridTime(){ return cfg.gridop > .01 ? cfg.tGrid : 0; }

/* считаем только блоки главного экрана: секции ниже живут на скролле,
   иначе каждая новая секция молча удлиняла бы интро */
/* Кнопки с первого экрана можно снять из твикера. Убираем узел целиком,
   а не прячем стилем: шкала сборки считает блоки по этому же селектору,
   и спрятанный блок всё равно занимал бы свой слот во времени —
   интро молча удлинялось бы на пустое место. */
function heroCtaApply(){
  const box = document.querySelector('.bl--cta');
  if (cfg.heroCta === false && box){ box.remove(); return; }
  if (cfg.heroCta !== false && !box && heroCtaHTML){
    const meta = document.querySelector('.bl--meta');
    if (meta) meta.insertAdjacentHTML('beforebegin', heroCtaHTML);
    buildHButtons(); drawText();
  }
}
/* запоминаем разметку до удаления — иначе вернуть кнопки будет неоткуда */
const heroCtaHTML = (document.querySelector('.bl--cta') || {}).outerHTML || '';

const HERO_BL = '.hero .bl, .tile';

function total(){
  const items = document.querySelectorAll(HERO_BL).length;
  return gridTime() + cfg.tWire + cfg.tFill + cfg.tColor + cfg.stagger * items;
}

function setTime(t){
  const ez = EASE[cfg.ease] || EASE.outQuint;
  const gridLines = [...colsEl.children, ...rowsEl.children];
  const nG = gridLines.length || 1;

  const gT = gridTime();
  gridLines.forEach((n, i) => {
    const s = (i / nG) * gT * .55;
    n.style.setProperty('--gin', gT ? ez(seg(t, s, gT * .45)).toFixed(3) : 1);
  });

  const items = [...document.querySelectorAll(HERO_BL)];
  const wireStart = gT;
  const fillStart = gT + cfg.tWire;

  items.forEach((n, i) => {
    const off = i * cfg.stagger;
    const rev = ez(seg(t, fillStart + off, cfg.tFill));
    n.style.setProperty('--in',  ez(seg(t, wireStart + off, cfg.tWire)).toFixed(3));
    n.style.setProperty('--rev', rev.toFixed(3));
    /* дорисовали — снимаем обрезку, иначе она режет ховеры кнопок */
    n.classList.toggle('is-done', rev >= .999);
    /* пыль собирается в знак ровно в той же фазе, что и текст */
    if (n.classList.contains('bl--art') && PF.dust) PF.dust.setBuild(rev);
  });

  const lit = t >= fillStart + cfg.tFill + cfg.stagger * items.length * .5;
  document.body.classList.toggle('is-lit', lit);

  const nums = document.querySelectorAll('.num');
  const np = ez(seg(t, fillStart, cfg.tFill + cfg.tColor));
  nums.forEach(n => n.textContent = Math.round(+n.dataset.num * np));

  if (stageEl){
    const stage = t < gT ? 'сетка'
      : t < fillStart ? 'каркас'
      : t < fillStart + cfg.tFill ? 'контент'
      : lit ? 'готово' : 'цвет';
    if (stageEl.textContent !== stage) stageEl.textContent = stage;
  }
}

let t0 = 0, playing = false, cur = 0;
function tick(now){
  if (playing){
    cur = (now - t0) / 1000;
    if (cur >= total()){ cur = total(); playing = false; }
    setTime(cur);
    PF.progress = cur / total();
  }
  requestAnimationFrame(tick);
}
function replay(){ cur = 0; t0 = performance.now(); playing = true; setTime(0); }
function seek(p){ playing = false; cur = clamp01(p) * total(); setTime(cur); PF.progress = clamp01(p); }

/* страховка: если вкладка была фоновой и rAF не шёл — досветить экран */
setTimeout(() => { if (!document.body.classList.contains('is-lit')) { seek(1); } }, 9000);

/* ---------------------------------------------- курсор */
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, rs = 1;
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive:true });
addEventListener('pointerdown', () => rs = .7);
addEventListener('pointerup', () => rs = 1);

/* магнит: кольцо прилипает к кнопке или ссылке и обнимает её —
   единственная работа, которую курсор реально делает */
let magEl = null;
const MAGNET = 'a[href], button, .hbtn';
document.addEventListener('pointerover', e => {
  const t = e.target.closest(MAGNET);
  if (t) magEl = t;
});
document.addEventListener('pointerout', e => {
  if (magEl && e.target.closest(MAGNET) === magEl) magEl = null;
});

let rw = cfg.curRing, rh = cfg.curRing;

(function curLoop(){
  if (cfg.cursor === 'system'){ requestAnimationFrame(curLoop); return; }
  const k = cfg.curLag;

  let tx = mx, ty = my, tw = cfg.curRing, th = cfg.curRing;
  if (magEl && magEl.isConnected){
    const r = magEl.getBoundingClientRect();
    if (r.width){
      tx = r.left + r.width / 2;
      ty = r.top + r.height / 2;
      tw = r.width + 12;
      th = r.height + 12;
    }
  }
  rx += (tx - rx) * k;
  ry += (ty - ry) * k;
  rw += (tw - rw) * .22;
  rh += (th - rh) * .22;

  const s = root.style;
  s.setProperty('--mx', mx + 'px');
  s.setProperty('--my', my + 'px');
  s.setProperty('--rx', rx.toFixed(1) + 'px');
  s.setProperty('--ry', ry.toFixed(1) + 'px');
  s.setProperty('--rw', rw.toFixed(1) + 'px');
  s.setProperty('--rh', rh.toFixed(1) + 'px');
  s.setProperty('--rs', rs);
  const rd = document.querySelector('.cursor__x'), rdy = document.querySelector('.cursor__y');
  if (rd && root.dataset.cursor === 'ruler'){
    rd.textContent = 'X ' + Math.round(mx);
    rdy.textContent = 'Y ' + Math.round(my);
  }
  requestAnimationFrame(curLoop);
})();

/* ---------------------------------------------- второй экран: работы */
/* Семь работ. МЧС и Лекало сняты с показа по его просьбе — не пойдут в портфолио.
   Категорий нарочно четыре: с семью работами шесть чипов превратили бы фильтр
   в подписи к одиночным карточкам */
const WORKS = [
  { n:'KLAUS',         c:'сайты компаний', t:'ресторан',        d:'меню, галерея, бронирование',        s:'12 секций',        img:'assets/works/klaus.webp' },
  { n:'КИНОНОЧЬ',      c:'сайты компаний', t:'частный кинотеатр',d:'брутализм с кислотным акцентом',    s:'10 секций',        img:'assets/works/cinemanight.webp' },
  { n:'FlowerHome',    c:'магазины',       t:'цветы с доставкой',d:'каталог с 3D-анимацией',            s:'CSS 3D',           img:'assets/works/flowerhome.webp' },
  { n:'Nuvelle',       c:'магазины',       t:'магазин одежды',  d:'34 товара, видео в карточках',       s:'каталог, SEO',     img:'assets/works/nuvelle.webp' },
  { n:'МОТОАРЕНА',     c:'каталоги',       t:'мототехника',     d:'фильтры, гео-блок, галерея',         s:'JSON-каталог',     img:'assets/works/motoarena.webp' },
  { n:'Метриум',       c:'каталоги',       t:'недвижимость',    d:'пролёт камеры по дому на скролле',   s:'скролл-секвенция', img:'assets/works/metrium.webp' },
  { n:'Ray-Ban Meta',  c:'концепты',       t:'концепт',         d:'прокручиваемая сцена из 275 кадров', s:'canvas, ffmpeg',   img:'assets/works/rayban.webp' }
];

const wgrid = document.querySelector('.wgrid');
const wfilter = document.querySelector('.wfilter');
const wmoreBtn = document.getElementById('wmore');
const PER = 6;                 /* столько же карточек за раз, сколько у образца */
let activeCat = 'все', shown = PER;

/* счётчики в чипах берём из самих работ: вобьёшь руками — разъедутся
   при первом же добавленном проекте */
function catCounts(){
  const m = new Map();
  WORKS.forEach(w => m.set(w.c, (m.get(w.c) || 0) + 1));
  return m;
}

function visibleCards(){
  return [...wgrid.children].filter(c =>
    activeCat === 'все' || c.querySelector('.wcard').dataset.cat === activeCat);
}

function applyWorks(){
  [...wgrid.children].forEach(c => { c.hidden = true; });
  const vis = visibleCards();
  vis.slice(0, shown).forEach(c => { c.hidden = false; });
  if (wmoreBtn) wmoreBtn.parentElement.style.display = shown < vis.length ? 'flex' : 'none';
}

function buildWorks(){
  if (!wgrid) return;

  /* карточка = обложка целиком, поверх чип категории и подпись снизу.
     Номера 01/02/03 из образца не переносим */
  wgrid.innerHTML = WORKS.map((w, i) => `
    <div class="wrow bl" style="--d:${i * 70}ms">
      <i class="bl__ph"></i>
      <div class="bl__c">
        <div class="wcard" data-cat="${w.c}">
          ${w.img
            ? `<img class="wcard__shot" src="${w.img}" alt="${w.n}" loading="lazy">`
            : `<div class="wcard__empty" data-txt="worksHint"></div>`}
          <div class="wcard__shade"></div>
          <span class="wcard__badge">${w.c}</span>
          <div class="wcard__meta">
            <div class="t">${w.n}</div>
            <div class="s">${w.t} · ${w.d}</div>
          </div>
        </div>
      </div>
    </div>`).join('');

  const chips = [['все', WORKS.length]].concat([...catCounts().entries()]);
  wfilter.innerHTML = chips.map(([c, n], i) =>
    `<button class="wchip${i === 0 ? ' is-on' : ''}" type="button" data-c="${c}" role="tab"
             aria-selected="${i === 0}">${c}<b>${n}</b></button>`).join('');

  wfilter.addEventListener('click', e => {
    const chip = e.target.closest('.wchip');
    if (!chip) return;
    wfilter.querySelectorAll('.wchip').forEach(b => {
      const on = b === chip;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on);
    });
    activeCat = chip.dataset.c;
    shown = PER;
    applyWorks();
  });

  if (wmoreBtn) wmoreBtn.addEventListener('click', () => { shown += PER; applyWorks(); });

  applyWorks();
  drawText();
}

/* ---------------------------------------------- третий экран: услуги */
/* Слева форматы и допы, справа кассовый чек: выбранное допечатывается
   на ленте под щелчки головки. Чек не перерисовывается целиком — строки
   добавляются и убираются поштучно и встают в очередь печати, иначе при
   каждом клике заново печаталась бы вся лента и приём бы потерялся. */
/* галочка: рисуется штрихом, как линии чертежей на сайте */
const TICK = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';

/* Состав форматов живёт здесь, деньги и сроки — в твикере (txtSvcFmt).
   Форматы разложены по рядам: сайты, телеграм, события. Ряд — это ответ
   на вопрос «что вам вообще нужно», внутри ряда выбирается объём.
   Порядок сквозной: строка прайса и состав сходятся по номеру */
const FMT_GROUPS = ['сайты', 'телеграм', 'события'];

/* у каждого ряда своя раскрывашка «чем отличаются»: ключи текстов твикера */
const DIFF = [
  { head:'txtSvcDiffKSites', list:'txtSvcDiffSites' },
  { head:'txtSvcDiffKTg',    list:'txtSvcDiffTg' },
  { head:'txtSvcDiffKEvt',   list:'txtSvcDiffEvt' }
];

const FMT = [
  /* ---- сайты */
  { g:0, d:'одно предложение, одно действие',
    inc:['Один экран со всей сутью','Форма заявки в телеграм','Телефон и планшет','Домен и выкладка','SEO-база'] },
  { g:0, d:'услуги, работы, цены, контакты',
    inc:['До шести экранов','Дизайн под вас, не шаблон','Панель правки текстов','Метрика и цели','Форма заявки в телеграм','Скорость 95+','Домен и выкладка','SEO-база'] },
  { g:0, d:'каталог, разделы, много товаров',
    inc:['Разделы и каталог','Карточки из файла данных','Фильтры и поиск','Панель правки текстов','Метрика и цели','Скорость 95+','Домен и выкладка','SEO под карточки'] },
  { g:0, d:'сцена, анимация, свой характер',
    inc:['Экран придумывается с нуля','Анимация на прокрутке','Тексты под ключ','Всё из формата «Сайт»','Разбор результата через месяц'] },
  { g:0, d:'у вас есть сайт, но он устарел',
    inc:['Разбор нынешнего сайта','Новый дизайн на старых текстах','Перенос содержимого без потерь','Адаптив и скорость заодно','Домен и выкладка'] },

  /* ---- телеграм */
  { g:1, d:'принимает заказы и отвечает',
    inc:['Бот на Python','Команды и сценарии','Заявки и заказы вам в личку','Выкладка и запуск'] },
  { g:1, d:'приложение внутри телеграма',
    inc:['Свой экран внутри телеграма','Данные и интерфейс под задачу','Оплата или заявка','Выкладка и запуск'] },
  { g:1, d:'бот и приложение вместе',
    inc:['Бот и мини-приложение в связке','Одна база на двоих','Заказы и уведомления','Выкладка и запуск'] },

  /* ---- события */
  { g:2, d:'свадьба, юбилей, вечеринка',
    inc:['Одна страница к дате','Отсчёт до дня и программа','Карта, дорога и дресс-код','Кнопка «буду» с ответами в телеграм','Ваши фото и музыка'] },
  { g:2, d:'событие, которому мало страницы',
    inc:['Несколько экранов под событие','Программа и участники','Галерея и видео','Регистрация и ответы гостей','Карта и дорога'] }
];

/* Допы по разделам. Раздел привязан к группе форматов: у бота и у свадебного
   приглашения нужны разные вещи, и показывать всё вперемешку — врать.
   Группа 'all' показывается всегда. Пояснение и признак «помесячно» здесь,
   цена и дни — из твикера (txtSvcAdds), сходятся по сквозному номеру:
   порядок позиций тут и в прайсе обязан совпадать */
const ADD = [
  ['продажи', 0, [
    ['заявки копятся в системе'],
    ['отвечает и принимает заказы'],
    ['корзина, заказ, приём оплаты']
  ]],
  ['дизайн и содержание', 0, [
    ['пишу сам, а не прошу прислать'],
    ['знак, цвета, шрифты'],
    ['подбор и обработка']
  ]],

  ['что умеет бот', 1, [
    ['принимает оплату прямо в переписке'],
    ['товары и фото внутри телеграма'],
    ['рассылка и напоминания подписчикам'],
    ['вижу заказы в одной панели']
  ]],
  ['оформление бота', 1, [
    ['сценарии разговора и тексты кнопок'],
    ['иконка, обложка, описание']
  ]],

  ['гостям', 2, [
    ['кнопка «буду», ответы вам в телеграм'],
    ['карта, дорога и парковка'],
    ['ваши фото и музыка на странице']
  ]],
  ['оформление события', 2, [
    ['текст приглашения пишу сам'],
    ['короткая ссылка на ваши имена'],
    ['та же вёрстка под печать']
  ]],

  ['после запуска', 'all', [
    ['правки каждый месяц', 'мес'],
    ['разберём на созвоне, как вести'],
    ['что сработало, что поправить']
  ]]
];

/* Звук печати чека убран: на телефоне он включался неожиданно,
   а выключить его можно было только кнопкой, которую ещё надо найти. */


const svcSec  = document.querySelector('.svc');
const svcFmts = document.querySelector('.svc__fmts');
const svcCols = document.querySelector('.svc__cols');
const svcCheck = document.getElementById('svcCheck');
const svcResetBtn = document.getElementById('svcReset');
/* формат по умолчанию запоминаем один раз: сброс возвращает именно его,
   а не нулевой — чек без формата пустой и показывать в нём нечего */
const SVC_F0 = 1;
let svcF = SVC_F0;
const svcOn = new Set();

/* Кнопка сброса нужна, только когда с чеком уже поиграли: выбран другой
   формат или добавлены допы. Иначе она предлагает отменить то, чего нет */
function svcResetShow(){
  if (!svcResetBtn) return;
  svcResetBtn.hidden = svcOn.size === 0 && svcF === SVC_F0;
}

function svcReset(){
  svcOn.clear();
  svcF = SVC_F0;
  svcDrawLeft();
  svcDrawCheck();
}

const svcMoney = n => Number(n).toLocaleString('ru-RU');

/* «5 форматов», но «1 формат» и «2 формата» — иначе заголовок группы
   читается как машинный вывод */
function plural(n){
  const t = n % 10, h = n % 100;
  if (t === 1 && h !== 11) return 'формат';
  if (t >= 2 && t <= 4 && (h < 10 || h >= 20)) return 'формата';
  return 'форматов';
}

/* Переключатель группы — тумблер. Подписи у него нет нарочно: состояние
   читается формой, а не текстом, и в ряду из трёх групп это не создаёт
   трёх повторяющихся надписей. Для чтения с экрана состояние всё равно
   объявлено через aria-expanded на самой кнопке. */
const TGL = `<span class="tgl" aria-hidden="true"></span>`;

/* Какие группы раскрыты. При заходе — ни одной: три свёрнутые строки
   читаются как оглавление, человек сам открывает то, что ему нужно, и не
   листает сквозь чужой прайс. Набор переживает пересборку левой колонки,
   иначе выбор формата схлопывал бы всё обратно. */
const svcOpenG = new Set();

/* прайс из твикера: «имя :: цена :: дни :: метка». Позиция без цены
   просто не показывается — это дешевле, чем показать её без числа */
function svcRows(txt, parts){
  return String(txt).split('|').map(r => {
    const p = r.split('::').map(x => x.trim());
    return { n:p[0], p:+p[1] || 0, days:+p[2] || 0, mark:p[3] || '' };
  }).filter(r => r.n).slice(0, parts);
}

function fmtRows(){ return svcRows(cfg.txtSvcFmt, FMT.length); }
function addRows(){ return svcRows(cfg.txtSvcAdds, ADD.reduce((a, s) => a + s[2].length, 0)); }

/* сквозной номер допа → его строка прайса, пояснение и раздел */
function addAt(i){
  const rows = addRows();
  let k = 0;
  for (let s = 0; s < ADD.length; s++){
    for (let j = 0; j < ADD[s][2].length; j++, k++){
      if (k === i) return { row:rows[i], info:ADD[s][2][j], group:ADD[s][0], g:ADD[s][1] };
    }
  }
  return null;
}

/* группа выбранного формата: от неё зависит, какие допы показывать */
function svcGroup(){ return FMT[svcF] ? FMT[svcF].g : 0; }

function svcCount(){
  const f = fmtRows()[svcF] || { p:0, days:0 };
  let sum = f.p, extra = 0, month = 0, once = 0;
  svcOn.forEach(i => {
    const a = addAt(i); if (!a || !a.row) return;
    if (a.info[1] === 'мес'){ month += a.row.p; return; }
    sum += a.row.p; extra += a.row.days; once++;
  });
  const off = once >= 3 ? Math.round(sum * .1) : 0;
  /* дни идут внахлёст, а не встык: иначе пять допов дают два месяца */
  return { sum:sum - off, off, month, once,
           days:f.days + Math.round(Math.sqrt(extra) * 1.7),
           n:(FMT[svcF] ? FMT[svcF].inc.length : 0) + svcOn.size };
}

/* ---- левая колонка */
function svcDrawLeft(){
  if (!svcFmts) return;
  const rows = fmtRows();

  /* карточки раскладываем по рядам: пустой ряд не рисуем — иначе стоило
     убрать формат из прайса, и на экране оставался бы голый заголовок */
  svcFmts.innerHTML = FMT_GROUPS.map((g, gi) => {
    const cards = rows.map((r, i) => ({ r, i }))
      .filter(({ i }) => FMT[i] && FMT[i].g === gi);
    if (!cards.length) return '';
    /* разница форматов стоит сразу под своим рядом: объяснение в конце
       всех рядов относилось бы непонятно к чему */
    const diff = DIFF[gi] || {};
    const items = String(cfg[diff.list] || '').split('|').map(r => {
      const p = r.split('::').map(x => x.trim());
      return p[0] ? `<div class="diff__i"><div class="diff__n">${p[0]}</div><div class="diff__d">${p[1] || ''}</div></div>` : '';
    }).join('');

    /* островок подсвечивается целиком, когда выбран формат из него:
       иначе на экране горели бы все три группы разом */
    const live = FMT[svcF] && FMT[svcF].g === gi;
    const open = svcOpenG.has(gi);
    /* в свёрнутом виде заголовок обязан сам что-то сообщать, иначе это
       просто строка, на которую непонятно зачем нажимать */
    const from = Math.min(...cards.map(({ r }) => r.p));

    return `<div class="fgrp${live ? ' is-on' : ''}${open ? ' is-open' : ''}">
      <button class="fgrp__k" type="button" data-grp="${gi}" aria-expanded="${open}">
        <span class="eyebrow">${g}</span>
        <span class="fgrp__meta">${cards.length} ${plural(cards.length)} · от ${svcMoney(from)} BYN</span>
        ${TGL}
      </button>
      <div class="fgrp__body"><div class="fgrp__in">
        <div class="fgrp__row">
          ${cards.map(({ r, i }) => `
            <button class="fmt neon${i === svcF ? ' is-on' : ''}" type="button" role="tab"
                    aria-selected="${i === svcF}" data-f="${i}">
              ${r.mark ? `<span class="fmt__mark">${r.mark}</span>` : ''}
              <span class="fmt__dot"></span>
              <span class="fmt__n">${r.n}</span>
              <span class="fmt__d">${FMT[i].d}</span>
              <span class="fmt__p">${svcMoney(r.p)}<small>BYN</small></span>
              <span class="fmt__t">от ${r.days} дней</span>
            </button>`).join('')}
        </div>
        ${/* Разбор разницы не сворачивается вовсе: это главный вопрос перед
              выбором формата, и прятать ответ за клик значит терять тех, кто
              до него не догадается. Поэтому здесь не кнопка, а заголовок —
              нажимать не на что, и делать этого не нужно. */''}
        ${items ? `<div class="svc__diff">
          <div class="diff__k"><span class="diff__t">${cfg[diff.head] || ''}</span></div>
          <div class="diff__in">${items}</div>
        </div>` : ''}
      </div></div>
    </div>`;
  }).join('');

  /* показываем только разделы своей группы плюс общие: у бота и у свадебного
     приглашения нужны разные допы, и валить всё в кучу — врать */
  const prices = addRows(), gNow = svcGroup();
  let k = 0;
  svcCols.innerHTML = ADD.map(([title, g, list]) => {
    const from = k; k += list.length;
    if (g !== 'all' && g !== gNow) return '';
    return `<div class="acol">
      <div class="acol__k"><i class="acol__dot"></i><span class="eyebrow">${title}</span></div>
      ${list.map((info, j) => {
        const i = from + j, r = prices[i];
        if (!r) return '';
        return `<button class="aopt neon${svcOn.has(i) ? ' is-on' : ''}" type="button" data-a="${i}"
                        aria-pressed="${svcOn.has(i)}">
          <span class="aopt__box">${TICK}</span>
          <span>
            <span class="aopt__n">${r.n}</span>
            <span class="aopt__d">${info[0]}</span>
            <span class="aopt__p">+${r.p} BYN${info[1] === 'мес' ? ' / мес' : ''}</span>
          </span>
        </button>`;
      }).join('')}
    </div>`;
  }).join('');

  neonPhase(svcFmts);
  neonPhase(svcCols);
}

/* ---- очередь печати: строки выходят по одной, каждая под свою серию
   щелчков. Из-за этого смена формата занимает пару секунд — ровно
   столько, сколько лезет из кассы настоящий чек */
const svcQueue = [];
let svcPrinting = false;

function svcRunQueue(){
  if (svcPrinting) return;
  const el = svcQueue.shift();
  if (!el) return;
  svcPrinting = true;

  el.classList.add('is-print');
  const steps = 12, step = 880 / steps;
  let i = 0;
  const beat = setInterval(() => { if (++i >= steps) clearInterval(beat); }, step);

  setTimeout(() => { svcPrinting = false; svcRunQueue(); }, 240);   /* следующая внахлёст */
}

function svcLine(host, key, name, price, cls){
  let el = host.querySelector(`[data-key="${CSS.escape(key)}"]`);
  if (el) return el;
  el = document.createElement('div');
  el.className = 'li' + (cls ? ' ' + cls : '');
  el.dataset.key = key;
  el.innerHTML = `<span class="li__n">${name}</span><span class="li__dots"></span><span class="li__p">${price}</span>`;
  host.appendChild(el);
  svcQueue.push(el);
  svcRunQueue();
  return el;
}

function svcSync(host, want){
  [...host.children].forEach(el => {
    if (want.some(w => w.key === el.dataset.key)) return;
    if (el.classList.contains('is-out')) return;
    el.classList.add('is-out');
    const i = svcQueue.indexOf(el);
    if (i > -1) svcQueue.splice(i, 1);
    setTimeout(() => el.remove(), 340);
  });
  want.forEach(w => svcLine(host, w.key, w.name, w.price, w.cls));
}

/* ---- чек */
function svcDrawCheck(){
  if (!svcCheck) return;
  svcResetShow();
  const rows = fmtRows(), f = rows[svcF];
  if (!f) return;
  const t = svcCount();

  svcSync(document.getElementById('chFmt'),
    [{ key:'f' + svcF, name:f.n, price:svcMoney(f.p) }]);

  svcSync(document.getElementById('chInc'),
    (FMT[svcF] ? FMT[svcF].inc : []).map((n, i) =>
      ({ key:'i' + svcF + '.' + i, name:n, price:cfg.txtSvcIncWord, cls:'li--free' })));

  svcSync(document.getElementById('chAdd'),
    [...svcOn].map(i => {
      const a = addAt(i);
      return a && a.row
        ? { key:'a' + i, name:a.row.n, price:'+' + a.row.p + (a.info[1] === 'мес' ? '/мес' : '') }
        : null;
    }).filter(Boolean));

  document.getElementById('chN').textContent = t.n;
  document.getElementById('chDays').textContent = t.days + ' дней';
  document.getElementById('chSum').innerHTML = `<span>${svcMoney(t.sum)} BYN</span>`;

  document.getElementById('chOffRow').hidden = !t.off;
  document.getElementById('chOff').textContent = '− ' + svcMoney(t.off);
  document.getElementById('chMonthRow').hidden = !t.month;
  document.getElementById('chMonth').textContent = t.month + ' BYN в месяц';
}

/* номер и дата: без них лента не читается как чек */
function svcStamp(){
  const d = new Date(), two = n => String(n).padStart(2, '0');
  const sub = document.getElementById('chSub'), no = document.getElementById('chNo');
  if (sub) sub.textContent =
    `${cfg.txtPlace} · ${two(d.getDate())}.${two(d.getMonth() + 1)}.${d.getFullYear()} · ${two(d.getHours())}:${two(d.getMinutes())}`;
  if (no) no.textContent = 'чек № ' + String(Math.floor(Math.random() * 8999) + 1000);
}

/* ---------------------------------------------- отрыв чека и переход в заявку
   Кнопка под чеком не просто уводит вниз: лента сначала отрывается, и уже
   после этого страница едет к форме, а поля заполняются тем, что человек
   набрал в чеке. Смысл в том, что заявка — продолжение чека, а не новая
   анкета с нуля: набирал полторы минуты, и вводить всё заново обидно. */

/* Что выбрано, словами. Формат идёт первым, допы за ним через запятую —
   это же уходит в поле «о задаче» и потом придёт мне в телеграм. */
function svcSummary(){
  const f = fmtRows()[svcF];
  const adds = [...svcOn].map(i => { const a = addAt(i); return a && a.row ? a.row.n : null; }).filter(Boolean);
  const t = svcCount();
  const parts = [f ? f.n : ''];
  if (adds.length) parts.push('плюс ' + adds.join(', '));
  parts.push(`итого ${svcMoney(t.sum)} ${cfg.txtSvcCur || 'BYN'}`, `срок ${t.days} дн.`);
  return parts.filter(Boolean).join(' · ');
}

/* Формат в чеке и пункт списка в форме — разные словари, поэтому ищем
   совпадение по словам, а не по индексу: списки правятся из твикера
   независимо друг от друга и разъедутся при первой же правке */
function svcKindFor(name){
  const kinds = String(cfg.txtCtKinds).split('|').map(s => s.trim());
  const low = String(name).toLowerCase();
  const hit = kinds.find(k => low.includes(k.toLowerCase().split(' ')[0]));
  return hit || kinds[kinds.length - 1] || '';
}

function svcTearToForm(){
  const check = document.getElementById('svcCheck');
  const go = () => {
    const form = document.querySelector('.ct__form');
    smoothTo(document.getElementById('contact'));
    if (!form) return;

    const about = form.querySelector('[name="about"]');
    const kind = form.querySelector('[name="kind"]');
    if (about) about.value = svcSummary();
    if (kind){
      const want = svcKindFor((fmtRows()[svcF] || {}).n || '');
      const opt = [...kind.options].find(o => o.textContent.trim() === want);
      if (opt) kind.value = opt.value || opt.textContent;
    }
    /* подсвечиваем заполненное: иначе человек доезжает до формы и не видит,
       что за него уже написали — глаз цепляется за пустое поле имени */
    form.classList.add('is-prefilled');
    setTimeout(() => form.classList.remove('is-prefilled'), 2000);
    const nameIn = form.querySelector('[name="name"]');
    if (nameIn) setTimeout(() => nameIn.focus({ preventScroll:true }), 700);
  };

  /* без ленты (или при выключенных анимациях) просто едем вниз */
  if (!check || matchMedia('(prefers-reduced-motion:reduce)').matches){ go(); return; }

  /* Лента должна быть на виду, иначе рвётся за кадром: на телефоне чек стоит
     ниже колонки с форматами, и к моменту нажатия кнопка видна, а сам чек нет */
  const box = check.getBoundingClientRect();
  if (box.top < 0 || box.bottom > innerHeight){
    check.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  check.classList.add('is-tear');
  const done = () => {
    check.classList.remove('is-tear');
    /* печатаем новую ленту с новым номером — секция не должна остаться пустой,
       если человек вернётся к ней скроллом */
    svcStamp(); svcBars();
    go();
  };
  check.addEventListener('animationend', done, { once:true });
  /* страховка: если анимация не проиграет (вкладка в фоне — кадры не рисуются
     и animationend не приходит), заявка всё равно должна открыться */
  setTimeout(() => { if (check.classList.contains('is-tear')) done(); }, 1100);
}

/* штрихкод декоративный, но одинаковые полосы сразу выдают подделку */
function svcBars(){
  const b = document.getElementById('chBars');
  if (b) b.innerHTML = Array.from({ length:52 },
    () => `<i style="width:${1 + Math.round(Math.random() * 3)}px"></i>`).join('');
}

function buildSvc(){
  if (!svcSec) return;
  svcDrawLeft();
  svcDrawCheck();
  svcStamp(); svcBars();

  if (!svcSec.dataset.wired){
    svcSec.dataset.wired = '1';

    svcSec.addEventListener('click', e => {
      /* сворачивание группы: ловим раньше форматов, иначе клик по шапке
         пролетал бы дальше и ничего не делал */
      const g = e.target.closest('[data-grp]');
      if (g){
        const gi = +g.dataset.grp;
        svcOpenG.has(gi) ? svcOpenG.delete(gi) : svcOpenG.add(gi);
        const box = g.closest('.fgrp');
        const on = svcOpenG.has(gi);
        box.classList.toggle('is-open', on);
        g.setAttribute('aria-expanded', String(on));
        return;
      }

      const f = e.target.closest('[data-f]');
      if (f){
        const i = +f.dataset.f;
        if (i !== svcF){
          const wasG = svcGroup();
          svcF = i;
          /* сменилась группа — снимаем допы прежней: они больше не видны
             на экране, а в чеке остались бы позициями-призраками */
          if (svcGroup() !== wasG){
            [...svcOn].forEach(k => {
              const a = addAt(k);
              if (!a || a.g !== 'all') svcOn.delete(k);
            });
          }
          svcDrawLeft(); svcDrawCheck();
        }
        return;
      }
      if (e.target.closest('#svcReset')){ svcReset(); return; }

      /* «обсудить проект» под чеком: рвём ленту и уносим выбор в заявку.
         stopPropagation обязателен: кнопка — обычная ссылка на #contact,
         и общий обработчик якорей на document уехал бы к форме сразу,
         не дав ленте оторваться */
      const goBtn = e.target.closest('.till__go');
      if (goBtn){ e.preventDefault(); e.stopPropagation(); svcTearToForm(); return; }

      const a = e.target.closest('[data-a]');
      if (a){
        const i = +a.dataset.a;
        const on = !svcOn.has(i);
        on ? svcOn.add(i) : svcOn.delete(i);
        /* класс переключаем на живой кнопке, а не пересобираем колонку:
           заново созданная кнопка рождалась бы уже включённой, и заливка
           галочки не проигрывалась бы — переходу неоткуда стартовать.
           Список допов от выбора не зависит, пересобирать его незачем */
        a.classList.toggle('is-on', on);
        a.setAttribute('aria-pressed', String(on));
        svcDrawCheck();
      }
    });

  }

  drawText();
}

/* ---------------------------------------------- четвёртый экран: как я работаю */
/* Гармошка: четыре полосы, под курсором одна разъезжается. На каждой —
   тот же макет на своей стадии: набросок, каркас, содержимое, готовый экран.
   Тексты шагов правятся из твикера (txtFlowList), чертежи живут здесь. */
const FLOW_ART = [
  /* набросок: пунктир — ещё не решено */
  `<rect class="ln" x="60" y="40" width="290" height="55" rx="6" stroke-dasharray="6 6"/>
   <rect class="ln" x="60" y="112" width="130" height="110" rx="6" stroke-dasharray="6 6"/>
   <rect class="ln" x="210" y="112" width="140" height="110" rx="6" stroke-dasharray="6 6"/>
   <line class="dim" x1="60" y1="26" x2="350" y2="26"/>`,
  /* каркас: линии стали твёрдыми, появились размеры */
  `<rect class="ln" x="60" y="40" width="290" height="55" rx="6"/>
   <rect class="ln" x="60" y="112" width="130" height="110" rx="6"/>
   <rect class="ln" x="210" y="112" width="140" height="110" rx="6"/>
   <line class="dim" x1="44" y1="40" x2="44" y2="222"/>`,
  /* содержимое: в блоки лёг текст */
  `<rect class="ln" x="60" y="40" width="290" height="55" rx="6"/>
   <rect x="76" y="56" width="150" height="9" rx="4" fill="var(--ink)" opacity=".8"/>
   <rect x="76" y="72" width="90" height="7" rx="3" fill="var(--dim)" opacity=".5"/>
   <rect class="ln" x="60" y="112" width="130" height="110" rx="6"/>
   <rect x="74" y="190" width="80" height="8" rx="4" fill="var(--dim)" opacity=".5"/>
   <rect class="ln" x="210" y="112" width="140" height="110" rx="6"/>
   <rect x="224" y="190" width="90" height="8" rx="4" fill="var(--dim)" opacity=".5"/>`,
  /* готово: залито цветом */
  `<rect x="60" y="40" width="290" height="55" rx="6" fill="var(--ink)"/>
   <rect x="76" y="56" width="150" height="9" rx="4" fill="var(--bg)"/>
   <rect x="76" y="72" width="90" height="7" rx="3" fill="var(--bg)" opacity=".6"/>
   <rect x="60" y="112" width="130" height="110" rx="6" fill="var(--wire)"/>
   <rect x="210" y="112" width="140" height="110" rx="6" fill="var(--wire)"/>
   <rect x="74" y="190" width="80" height="8" rx="4" fill="var(--ink)" opacity=".55"/>
   <rect x="224" y="190" width="90" height="8" rx="4" fill="var(--ink)" opacity=".55"/>`
];

const flowAcc = document.querySelector('.flow__acc');
let flowOpen = 0;

function buildFlow(){
  if (!flowAcc) return;
  const keys = String(cfg.txtFlowKeys).split('|').map(s => s.trim());
  const items = String(cfg.txtFlowList).split('|').map(s => {
    const p = s.split('::').map(x => x.trim());
    return { n:p[0] || '', d:p[1] || '' };
  }).filter(i => i.n).slice(0, FLOW_ART.length);

  flowAcc.innerHTML = items.map((it, i) => `
    <div class="flow__p${i === flowOpen ? ' is-on' : ''}" data-i="${i}" style="--d:${i * 90}ms">
      <div class="flow__side">
        <i class="flow__dot"></i>
        <div class="flow__vert">${it.n}</div>
        <i class="flow__dot" style="opacity:0"></i>
      </div>
      <div class="flow__in">
        <div class="flow__art"><svg viewBox="0 0 410 260" preserveAspectRatio="xMidYMid meet">${FLOW_ART[i]}</svg></div>
        <div class="flow__k">${keys[i] || ''}</div>
        <div class="flow__d">${it.d}</div>
      </div>
    </div>`).join('');

  /* длину линий меряем после вставки: на оторванном узле её не получить */
  flowAcc.querySelectorAll('.ln').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength())));

  if (!flowAcc.dataset.wired){
    flowAcc.dataset.wired = '1';
    /* и наведение, и клик: на тачскрине ховера нет */
    const open = e => {
      const p = e.target.closest('.flow__p');
      if (!p || +p.dataset.i === flowOpen) return;
      flowOpen = +p.dataset.i;
      flowAcc.querySelectorAll('.flow__p').forEach(n => n.classList.toggle('is-on', +n.dataset.i === flowOpen));
      /* штрих перезапускаем: иначе чертёж уже дорисован и раскрытие немое */
      p.querySelectorAll('.ln').forEach((l, k) => {
        l.style.animation = 'none';
        void l.offsetWidth;
        l.style.animation = '';
        l.style.setProperty('--dl', (k * 60) + 'ms');
      });
    };

    /* Наведение открывает не сразу, а с удержанием: полоса ждёт, что курсор
       на ней задержится. Без задержки, пока ведёшь мышь к нужному шагу,
       по дороге раскрывались все промежуточные.

       Клик и касание открывают мгновенно — там намерение уже явное, и
       заставлять держать палец было бы издевательством. На тачскрине
       ховера нет вовсе, так что телефона это не касается. */
    const HOLD = 260;
    let holdTimer = 0, holdFor = -1;

    const cancelHold = () => { clearTimeout(holdTimer); holdTimer = 0; holdFor = -1; };

    flowAcc.addEventListener('pointerover', e => {
      if (e.pointerType === 'touch') return;
      const p = e.target.closest('.flow__p');
      if (!p) return;
      const i = +p.dataset.i;
      if (i === flowOpen || i === holdFor) return;
      clearTimeout(holdTimer);
      holdFor = i;
      holdTimer = setTimeout(() => { holdFor = -1; open(e); }, HOLD);
    });
    /* ушли с полосы раньше срока — значит просто проходили мимо */
    flowAcc.addEventListener('pointerout', e => {
      const to = e.relatedTarget;
      if (to && flowAcc.contains(to) && to.closest('.flow__p') === e.target.closest('.flow__p')) return;
      cancelHold();
    });
    /* Ушли с гармошки — закрываем. Оставлять последнюю раскрытой значит
       держать на экране случайный выбор: тот шаг, мимо которого курсор
       уходил последним, а не тот, который человеку был интересен.
       Касания это не касается: там уходить некуда, и тапнутый шаг стоит. */
    const shut = () => {
      cancelHold();
      if (flowOpen < 0) return;
      flowOpen = -1;
      flowAcc.querySelectorAll('.flow__p').forEach(n => n.classList.remove('is-on'));
    };
    flowAcc.addEventListener('pointerleave', e => {
      if (e.pointerType === 'touch') return;
      shut();
    });

    flowAcc.addEventListener('click', e => { cancelHold(); open(e); });
  }
}

/* ---------------------------------------------- пятый экран: обо мне */
/* Фраза разбирается на слова: каждое живёт в своей обрезке и выезжает
   снизу со сдвижкой. Звёздочками в тексте помечено приглушённое. */
const abBig = document.querySelector('.ab__big');
const abFacts = document.querySelector('.ab__facts');

function buildAbout(){
  if (!abBig) return;

  /* Каждое слово получает свой законченный <em>. Открыть тег на одном слове
     и закрыть на другом нельзя: браузер достраивает такой <em> сам и красит
     приглушённым весь остаток фразы. */
  const words = String(cfg.txtAboutPhrase).split(/\s+/).filter(Boolean);
  let dimOn = false;
  abBig.innerHTML = words.map((w, i) => {
    let dim = dimOn, closes = false;
    if (w.startsWith('*')){ w = w.slice(1); dim = dimOn = true; }
    if (w.endsWith('*')){ w = w.slice(0, -1); closes = true; }
    const html = dim ? `<em>${w}</em>` : w;
    if (closes) dimOn = false;
    return `<w><b style="--d:${i * 55}ms">${html}</b></w> `;
  }).join('');

  abFacts.innerHTML = String(cfg.txtAboutFacts).split('|').map((f, i) => {
    const p = f.split('::').map(x => x.trim());
    return `<div class="ab__f" style="--d:${words.length * 55 + 200 + i * 90}ms">
              <b>${p[0] || ''}</b>${p[1] || ''}</div>`;
  }).join('');

  drawText();
}

/* ---------------------------------------------- шестой экран: контакты */
const ctSec  = document.querySelector('.ct');
const ctCard = document.querySelector('.ct__card');
const ctForm = document.querySelector('.ct__form');

function buildContact(){
  if (!ctSec) return;

  ctSec.querySelector('.ct__rows').innerHTML =
    String(cfg.txtCtCard).split('|').map(r => {
      const p = r.split('::').map(x => x.trim());
      let k = p[0] || '';
      /* строка, начатая с точки, получает живой огонёк вместо неё */
      const live = k.startsWith('•');
      if (live) k = k.slice(1).trim();
      const v = (p[1] || '').replace('{tg}', cfg.txtTgName);
      return `<div class="ct__row">
                <span>${live ? '<i class="ct__live"></i>' : ''}${k}</span><b>${v}</b>
              </div>`;
    }).join('');

  ctForm.querySelector('[name="kind"]').innerHTML =
    String(cfg.txtCtKinds).split('|').map(k => `<option>${k.trim()}</option>`).join('');

  drawText();
}

/* Заявка. Сервера пока нет, поэтому кнопка сначала честно пробует его
   позвать, а на отказе кладёт текст в буфер и зовёт в телеграм.
   Появится CRM — поменяется только адрес, остальное останется. */
function leadText(){
  const g = n => (ctForm.querySelector(`[name="${n}"]`) || {}).value.trim() || '';
  return `Заявка с сайта ${cfg.txtName}\n` +
         `Имя: ${g('name')}\nЗадача: ${g('kind')}\nСвязь: ${g('contact')}\nО задаче: ${g('about')}`;
}

async function sendLead(){
  const btn = ctForm.querySelector('.ct__send');
  const out = ctForm.querySelector('.ct__out');
  const g = n => (ctForm.querySelector(`[name="${n}"]`) || {}).value.trim() || '';

  if (!g('name') || !g('contact')){
    out.textContent = cfg.txtCtErr;
    (g('name') ? ctForm.querySelector('[name="contact"]') : ctForm.querySelector('[name="name"]')).focus();
    return;
  }
  if (btn.dataset.state !== 'idle') return;

  btn.dataset.state = 'loading';
  btn.setAttribute('aria-busy', 'true');
  out.textContent = '';
  const text = leadText();

  try {
    const r = await fetch('/api/lead', {
      method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ text })
    });
    if (!r.ok) throw new Error('приёмник не отвечает');
    btn.dataset.state = 'success';
    out.textContent = cfg.txtCtOk;
    ctForm.reset();
    setTimeout(() => { if (btn.dataset.state === 'success') btn.dataset.state = 'idle'; }, 2600);
  } catch (e) {
    /* тихо: сервера нет — это ожидаемо, а не поломка */
    try { await navigator.clipboard.writeText(text); } catch (e2) {}
    btn.dataset.state = 'idle';
    out.innerHTML = `${cfg.txtCtOffline} <b>${cfg.txtTgName}</b>`;
  } finally {
    btn.removeAttribute('aria-busy');
  }

  openTelegram(text);
}

/* После отправки уводим человека прямо в чат со мной. Текст заявки уже лежит
   в буфере — остаётся вставить его одним движением, и я вижу задачу целиком,
   а не «здравствуйте» в пустоту.
   Вкладку открываем в том же обработчике клика, что и отправку: открытую
   позже, из ответа сервера, браузер посчитает всплывающим окном и погасит. */
function openTelegram(text){
  const url = String(cfg.txtTgUrl).trim();
  if (!url) return;                 /* адрес не задан — никуда не ведём */

  const w = window.open(url, '_blank', 'noopener');
  /* блокировщик всплывающих окон съел вкладку — показываем ссылку вместо неё,
     иначе человек решит, что кнопка не сработала */
  if (!w){
    const out = ctForm.querySelector('.ct__out');
    out.innerHTML = `${cfg.txtCtGo} <a href="${url}" target="_blank" rel="noopener">` +
                    `<b>${cfg.txtTgName}</b></a>`;
  }
}

if (ctForm){
  ctForm.addEventListener('submit', e => { e.preventDefault(); sendLead(); });

  /* наклон визитки за курсором: перспектива на обёртке, поворот на карточке */
  const wrap = ctSec.querySelector('.ct__wrap');
  wrap.addEventListener('pointermove', e => {
    const r = ctCard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    ctCard.style.transform = `rotateY(${x * 13}deg) rotateX(${-y * 13}deg) translateZ(12px)`;
    /* точка света под курсором: сам свет рисует CSS, сюда пишем только,
       где курсор стоит на карточке. Состояние держим классом, а не :hover —
       наклон и свет тогда включаются от одного события и не расходятся */
    ctCard.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%');
    ctCard.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
    ctCard.classList.add('is-glow');
  }, { passive:true });
  wrap.addEventListener('pointerleave', () => {
    ctCard.style.transform = '';
    ctCard.classList.remove('is-glow');
  });
}

/* ---------------------------------------------- параллакс первого экрана */
/* Первый экран залипает, второй наезжает поверх. Содержимое героя уводим
   вверх медленнее прокрутки, а когда его накрыли целиком — гасим пыль,
   иначе полсотни тысяч частиц считаются под непрозрачной секцией. */
const heroSec = document.querySelector('.hero');
let heroOut = -1;

function heroParallax(){
  if (!heroSec) return;
  const p = Math.max(0, Math.min(1, scrollY / (innerHeight || 1)));
  if (Math.abs(p - heroOut) < .004) return;
  heroOut = p;
  heroSec.style.setProperty('--out', p.toFixed(3));
  if (PF.dust && PF.dust.cover) PF.dust.cover(p > .985);
}
addEventListener('scroll', () => requestAnimationFrame(heroParallax), { passive:true });
addEventListener('resize', heroParallax);

/* ---------------------------------------------- полоса прочитанного */
/* Доля прокрученного пишется в --p, ширину полосы рисует CSS. Считаем
   в кадре, а не прямо в обработчике: событий прокрутки прилетает больше,
   чем браузер успевает рисовать, и лишние счёты просто пропадали бы. */
const progBar = document.querySelector('.prog i');
let progWait = false, progWas = -1;

function progDraw(){
  progWait = false;
  const doc = document.documentElement;
  const max = doc.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  /* меньше половины процента глазу не видно, а перезапись стиля стоит денег */
  if (Math.abs(p - progWas) < .004) return;
  progWas = p;
  progBar.style.setProperty('--p', p.toFixed(4));
}

if (progBar){
  const progAsk = () => { if (!progWait){ progWait = true; requestAnimationFrame(progDraw); } };
  addEventListener('scroll', progAsk, { passive:true });
  addEventListener('resize', progAsk);
  progDraw();
}

/* ---------------------------------------------- проявление экранов */
/* Экран проявляется и его части съезжаются по глубине — заголовок отстаёт
   сильнее содержимого, отчего на стыке двух экранов видно слои. Ходы взяты
   в пропорциях 70/55/40/10, пересчитанных в пиксели.

   Ведёт всё это IntersectionObserver, а не событие прокрутки. Раньше доля
   въезда считалась на каждый scroll, и это оказалось опасной схемой: стоило
   событию не прийти — а такое бывает и при восстановлении позиции после
   перезагрузки, и в части встроенных браузеров — как секции навсегда
   оставались с opacity:0. Содержимое, которое исчезает целиком из-за
   недоставленного события, того не стоит.

   Поэтому теперь: видимость — состояние по умолчанию, скрывать разрешено
   только когда скрипт жив и сам ставит класс js-reveal. Не отработал
   скрипт — сайт просто виден целиком, без анимации. */
const tinSecs = [...document.querySelectorAll('main > section')];
const PIN_STEP = [64, 44, 28, 16];
/* контейнер чека пропускаем: трансформ на родителе отменяет position:sticky */
const SKIP_DEPTH = ['svc__grid'];

tinSecs.forEach((s, i) => {
  if (i === 0) return;                       /* первый экран уже на месте */
  [...s.children].forEach((c, k) => {
    const cls = typeof c.className === 'string' ? c.className.split(' ')[0] : '';
    if (SKIP_DEPTH.includes(cls)) return;
    c.style.setProperty('--dz', PIN_STEP[Math.min(k, PIN_STEP.length - 1)]);
  });
});

/* Предел размера композитного слоя в iOS — около 4096 пикселей. Секция
   выше него, поднятая на свой слой ради анимации непрозрачности, на
   айфоне просто не рисуется: получается белый экран. Именно так пропадали
   услуги — на 375 пикселях ширины они вытягиваются до 4600 в высоту, а на
   десктопе в ту же вёрстку укладываются в 3700 и предел не переходят.

   Поэтому слишком высокие секции не прячем вовсе: показываем сразу и без
   анимации. Потерять въезд у экрана в пять высот не жалко — его всё равно
   не видно целиком, а вот пропасть он не должен. */
const TALL_LIMIT = 3500;

if ('IntersectionObserver' in window){
  document.documentElement.classList.add('js-reveal');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-full');
      /* показали — больше следить незачем: экран не прячется обратно */
      io.unobserve(e.target);
    });
  }, {
    /* нижний край подтянут: проявление начинается, когда секция уже
       заметно вошла, а не краем в один пиксель */
    rootMargin: '0px 0px -18% 0px',
    threshold: 0
  });

  /* высокой секции анимация не положена: она и так видима, а поднимать её
     на композитный слой ради въезда — тот самый путь к белому экрану */
  const guard = () => tinSecs.forEach((s, i) => {
    if (i === 0) return;
    if (s.offsetHeight > TALL_LIMIT) io.unobserve(s);
    else if (!s.classList.contains('is-full')) io.observe(s);
  });

  guard();
  /* поворот экрана меняет высоты: секция могла перевалить за предел */
  addEventListener('resize', guard);
}

/* ---------------------------------------------- свет под курсором */
/* Два слоя: фонарь на всю страницу и пятно внутри карточки, над которой
   стоит курсор. Сам свет рисует CSS, отсюда идут только координаты.

   Пятно в карточку вставляем при первом наведении, а не заранее: разделы
   пересобираются из твикера, и разложенные загодя узлы пропали бы вместе
   с прежней разметкой. Координаты пишем в кадре — на каждое движение мыши
   их сотнями в секунду не пересчитать. */
const GLOW_SEL = '.adv__c, .wcard, .pr__c, .fmt, .flow__p, .wchip, .stk__i';

/* ---------------------------------------------- фаза неоновой рамки */
/* Карточки услуг пересобираются на каждый клик, и свежий узел запускал бы
   свою анимацию с нуля — контур дёргался на глазах. Отрицательная задержка
   по общим часам делает фазу абсолютной: рамка продолжается с того же места.
   Часы берём у таймлайна анимаций, а не у performance.now() — именно по нему
   браузер отсчитывает кадры, и лишнего смещения не набегает. */
function neonPhase(root){
  const spin = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--neonSpin')) || 4.5;
  const d = -((document.timeline.currentTime / 1000) % spin);
  (root || document).querySelectorAll('.neon').forEach(n => n.style.setProperty('--neonDelay', d.toFixed(3) + 's'));
}
const lamp = document.querySelector('.lamp');
let glowHost = null, lampX = 0, lampY = 0, lampWait = false;

function lampDraw(){
  lampWait = false;
  document.documentElement.style.setProperty('--gx', lampX + 'px');
  document.documentElement.style.setProperty('--gy', lampY + 'px');

  if (!glowHost) return;
  const r = glowHost.getBoundingClientRect();
  if (!r.width || !r.height) return;
  glowHost.style.setProperty('--mx', ((lampX - r.left) / r.width * 100).toFixed(1) + '%');
  glowHost.style.setProperty('--my', ((lampY - r.top) / r.height * 100).toFixed(1) + '%');
}

addEventListener('pointermove', e => {
  /* палец света не оставляет: на тачскрине пятно застыло бы там,
     где было последнее касание */
  if (e.pointerType === 'touch') return;
  lampX = e.clientX; lampY = e.clientY;
  if (lamp) document.body.classList.add('is-lamp');

  const host = e.target.closest ? e.target.closest(GLOW_SEL) : null;
  if (host !== glowHost){
    if (glowHost) glowHost.classList.remove('is-glow');
    glowHost = host;
    if (host){
      if (!host.querySelector(':scope > .glow')){
        const g = document.createElement('i');
        g.className = 'glow';
        g.setAttribute('aria-hidden', 'true');
        host.appendChild(g);
      }
      host.classList.add('is-glow');
    }
  }

  if (!lampWait){ lampWait = true; requestAnimationFrame(lampDraw); }
}, { passive:true });

/* курсор ушёл за окно — гасим, иначе свет остаётся висеть у края */
document.addEventListener('pointerleave', () => {
  document.body.classList.remove('is-lamp');
  if (glowHost){ glowHost.classList.remove('is-glow'); glowHost = null; }
});

/* ---------------------------------------------- знак в подвале */
/* Подвал занимает почти весь экран, и знак в одну строку висел в нём
   мелкой полоской. Поэтому разбиваем знак на две строки и каждую
   растягиваем на всю ширину замером: так подвал читается плакатом.
   Размер именно замеряем, а не пишем в vw — знак правится из твикера,
   и любой другой текст сразу разъехался бы. */
const footBig = document.querySelector('.foot__big');
const footSrc = document.querySelector('.foot__big span');

/* Делим знак на две строки. Сначала по пробелу, потом по known-словам в
   хвосте, и только в самом крайнем случае пополам по буквам.

   Деление пополам было единственным, и на «AETERNAWEBSTUDIO» оно дало
   «AETERNAW / EBSTUDIO» — слово разрубило посреди слога. Поэтому сперва
   ищем осмысленную границу: имя отдельно, приписка отдельно. */
const MARK_TAILS = ['WEBSTUDIO', 'WEBLAB', 'STUDIO', 'AGENCY', 'DESIGN', 'LAB', 'WEB'];

function markLines(txt){
  const sp = txt.indexOf(' ');
  if (sp > 0) return [txt.slice(0, sp), txt.slice(sp + 1)];
  if (txt.length < 6) return [txt];

  const up = txt.toUpperCase();
  for (const tail of MARK_TAILS){
    /* хвост должен именно заканчивать строку и что-то оставлять перед собой */
    if (up.length > tail.length && up.endsWith(tail)){
      return [txt.slice(0, txt.length - tail.length), txt.slice(txt.length - tail.length)];
    }
  }
  /* Одно короткое слово оставляем одной строкой. Деление пополам осмысленно
     только для длинных склеек вроде AETERNAWEBSTUDIO; «AETERNA» оно разрубило
     бы на «AETE» и «RNA», а это уже не знак, а опечатка. */
  if (txt.length < 12) return [txt];
  return [txt.slice(0, Math.ceil(txt.length / 2)), txt.slice(Math.ceil(txt.length / 2))];
}

function fitFootMark(){
  if (!footBig || !footSrc) return;
  const box = footBig.clientWidth;
  const txt = (footSrc.textContent || '').trim();
  if (!box || !txt) return;

  const parts = markLines(txt);
  let lines = [...footBig.querySelectorAll('.foot__ln')];
  if (lines.length !== parts.length){
    lines.forEach(l => l.remove());
    lines = parts.map((_, i) => {
      const b = document.createElement('b');
      b.className = 'foot__ln';
      b.style.setProperty('--d', (i * 90) + 'ms');
      footBig.appendChild(b);
      return b;
    });
  }
  /* Кегль у строк общий. Раньше каждая подгонялась под ширину блока сама,
     и «AETERNA» с «WEBSTUDIO» выходили разного размера — знак читался как
     две разные надписи. Берём наименьший из подошедших: тогда длинная
     строка ровно заполняет ширину, а короткая просто не достаёт до края,
     но набрана тем же кеглем. */
  const fits = lines.map((l, i) => {
    l.textContent = parts[i];
    l.style.fontSize = '100px';
    const w = l.getBoundingClientRect().width;
    return w ? 100 * box / w : 0;
  }).filter(Boolean);

  if (!fits.length) return;
  const size = Math.min(...fits);
  lines.forEach(l => l.style.fontSize = size + 'px');

  /* Блоку нужен запас сверху. Он подрезает всё, что выходит за строку —
     так замаскирован выезд знака снизу, — но заодно срезал акцент над «É»:
     при кегле в две сотни пикселей надстрочный знак поднимается заметно
     выше строки. Запас берём долей от кегля, иначе он разъедется вместе
     с текстом, и тут же вычитаем полем, чтобы подвал не подрос. */
  const room = Math.round(size * 0.16);
  footBig.style.paddingTop = room + 'px';
  footBig.style.marginTop = `calc(${getComputedStyle(footBig).getPropertyValue('--markGap') || 'clamp(18px,3vh,40px)'} - ${room}px)`;
}
addEventListener('resize', fitFootMark);
/* твикер правит текст знака — пересобираем строки, когда он это сделал */
if (footSrc) new MutationObserver(fitFootMark).observe(footSrc, { childList:true, characterData:true, subtree:true });
/* шрифт приезжает позже разметки — пересчитываем, когда он встал */
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitFootMark);

/* ---------------------------------------------- преимущества */
/* Иконки нарисованы линиями и вычерчиваются штрихом — тем же приёмом,
   что чертежи на услугах, чтобы блок не выпадал из языка сайта */
const ADV_ART = [
  '<path d="M26 4 8 26h12l-2 18 18-22H24z"/>',
  '<circle cx="22" cy="22" r="16"/><circle cx="22" cy="22" r="9"/><circle cx="22" cy="22" r="2.6"/>',
  '<rect x="4" y="8" width="23" height="28" rx="3"/><rect x="29" y="17" width="12" height="19" rx="2.5"/>',
  '<path d="M16 13 5 22l11 9"/><path d="M28 13l11 9-11 9"/>',
  '<path d="M7 31a16 16 0 1 1 30 0"/><path d="M22 31l9-10"/>',
  '<circle cx="19" cy="19" r="12"/><path d="M28 28l9 9"/>'
];

const advGrid = document.querySelector('.adv__grid');

function buildAdv(){
  if (!advGrid) return;
  const items = String(cfg.txtAdvList).split('|').map(r => r.split('::').map(x => x.trim()))
    .filter(p => p[0]).slice(0, ADV_ART.length);

  advGrid.innerHTML = items.map((p, i) => `
    <div class="adv__c" style="--d:${i * 80}ms">
      <div class="adv__i"><svg viewBox="0 0 44 44" style="--dl:${180 + i * 90}ms">${ADV_ART[i]}</svg></div>
      <div class="adv__t">${p[0]}</div>
      <div class="adv__d">${p[1] || ''}</div>
    </div>`).join('');

  /* длину штриха меряем после вставки: на оторванном узле её не получить */
  advGrid.querySelectorAll('.adv__i svg *').forEach(n => {
    const len = n.getTotalLength ? n.getTotalLength() : 140;
    n.style.setProperty('--len', Math.ceil(len));
  });
  drawText();
}

/* ---------------------------------------------- принципы */
/* Гарантийный талон: слово-графа слева, обещание справа. Номера строк
   нет нарочно — в талоне важно условие, а не его порядковый номер */
const prGrid = document.querySelector('.war__body');

function buildPrinciples(){
  if (!prGrid) return;
  prGrid.innerHTML = String(cfg.txtPrList).split('|').map((r, i) => {
    const p = r.split('::').map(x => x.trim());
    return `<div class="war__i" style="--d:${i * 90}ms">
              <span class="war__t">${p[0] || ''}</span>
              <span class="war__d">${p[1] || ''}</span>
            </div>`;
  }).join('');
  drawText();
}

/* ---------------------------------------------- стек внутри «обо мне» */
const stkCol  = document.querySelector('.stk__col');
const stkT    = document.querySelector('.stk__t');
const stkD    = document.querySelector('.stk__d');

function buildStack(){
  if (!stkCol) return;
  /* звёздочка в начале строки = «беру в работу, но в портфолио пока нет» */
  const items = String(cfg.txtStkList).split('|').map(r => {
    const p = r.split('::').map(x => x.trim());
    let n = p[0] || '', soon = false;
    if (n.startsWith('*')){ n = n.slice(1).trim(); soon = true; }
    return { n, d:p[1] || '', soon };
  }).filter(i => i.n);

  stkCol.innerHTML = items.map((it, i) =>
    `<span class="stk__i${i ? '' : ' is-on'}"${it.soon ? ' data-soon' : ''}
           data-i="${i}" style="--d:${i * 45}ms">${it.n}</span>`).join('');

  const show = i => {
    const it = items[i]; if (!it) return;
    stkCol.querySelectorAll('.stk__i').forEach(n => n.classList.toggle('is-on', +n.dataset.i === i));
    stkT.textContent = it.n;
    stkD.textContent = it.d;
  };
  if (!stkCol.dataset.wired){
    stkCol.dataset.wired = '1';
    const pick = e => { const n = e.target.closest('.stk__i'); if (n) show(+n.dataset.i); };
    stkCol.addEventListener('pointerover', pick);
    stkCol.addEventListener('click', pick);
  }
  show(0);
  drawText();
}

/* Спуск по скроллу: секция оживает один раз, когда заметно вошла в экран.
   Порог задан отступом снизу, а НЕ долей площади. Доля здесь была ловушкой:
   стояло threshold .22, то есть «видно 22% секции». Услуги на телефоне
   вытягиваются до 4600 пикселей при экране 812 — больше 17% этой секции
   не может быть видно физически, порог недостижим, и весь блок навсегда
   оставался с opacity:0. На десктопе та же секция короче, экран выше,
   доля выходила за 22% — и всё работало. Отсюда и «в хроме есть, на
   айфоне нет».

   С rootMargin высота секции не влияет вообще: считается пересечение
   края, а не площадь. */
const scrollSecs = document.querySelectorAll('.adv, .works, .svc, .flow, .pr, .ab, .ct, .foot');
if ('IntersectionObserver' in window){
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold:0, rootMargin:'0px 0px -20% 0px' });
  scrollSecs.forEach(s => io.observe(s));
} else scrollSecs.forEach(s => s.classList.add('is-in'));

/* ---------------------------------------------- запуск */
const PF = window.PF = {
  cfg, DEFAULTS, FONTS, PALETTES, CURSORS, BTNS, EASE,
  apply, save, reset, usePalette, replay, seek, buildGrid, buildTiles, buildMenu,
  runHBtn, heroCtaApply, buildWorks, buildSvc, buildFlow, buildAbout, buildContact, fitFootMark,
  buildAdv, buildPrinciples, buildStack,
  progress:0
};

buildGrid();
buildTiles();
buildMenu();
buildAdv();
buildWorks();
buildSvc();
buildFlow();
buildPrinciples();
buildAbout();
buildStack();
buildContact();
neonPhase();
fitFootMark();
heroParallax();
buildHButtons();
wireHButtons();
/* снимаем кнопки первого экрана до первого счёта времени: иначе шкала
   сборки успеет заложить под них слот */
heroCtaApply();
/* размеры МЕНЮ известны только после сборки её разметки */
menuFit();
requestAnimationFrame(menuFrame);
apply();
setTime(0);
requestAnimationFrame(tick);
if (cfg.autoplay) replay(); else seek(1);

})();
