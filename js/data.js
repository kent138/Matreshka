/* ===================== MATRESHKA — seed data ===================== */
(function (global) {
  'use strict';

  /* generate a pretty SVG fabric/notion swatch as data-URI so we ship real images */
  function swatch(label, c1, c2, pattern) {
    var pat = '';
    if (pattern === 'dots') {
      pat = '<g fill="rgba(255,255,255,.18)">' +
        [40, 120, 200, 280].map(function (x) {
          return [40, 120, 200, 280].map(function (y) {
            return '<circle cx="' + x + '" cy="' + y + '" r="9"/>';
          }).join('');
        }).join('') + '</g>';
    } else if (pattern === 'stripes') {
      pat = '<g stroke="rgba(255,255,255,.16)" stroke-width="14">' +
        [-40, 20, 80, 140, 200, 260, 320].map(function (o) {
          return '<line x1="' + o + '" y1="0" x2="' + (o + 320) + '" y2="320"/>';
        }).join('') + '</g>';
    } else if (pattern === 'check') {
      pat = '<g fill="rgba(255,255,255,.14)">' +
        [0, 80, 160, 240].map(function (x) {
          return [0, 80, 160, 240].map(function (y) {
            return ((x + y) / 80) % 2 === 0 ? '<rect x="' + x + '" y="' + y + '" width="80" height="80"/>' : '';
          }).join('');
        }).join('') + '</g>';
    } else if (pattern === 'weave') {
      pat = '<g stroke="rgba(255,255,255,.13)" stroke-width="6">' +
        [40, 80, 120, 160, 200, 240, 280].map(function (o) {
          return '<line x1="0" y1="' + o + '" x2="320" y2="' + o + '"/><line x1="' + o + '" y1="0" x2="' + o + '" y2="320"/>';
        }).join('') + '</g>';
    }
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
      '<rect width="320" height="320" fill="url(#g)"/>' + pat +
      '<rect x="14" y="14" width="292" height="292" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2" rx="10"/>' +
      '<text x="160" y="300" font-family="Montserrat,Arial" font-size="15" font-weight="600" fill="rgba(255,255,255,.85)" text-anchor="middle">' + label + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  var CATEGORIES = [
    { id: 'fabric', name: 'Ткани', icon: '🧵' },
    { id: 'notions', name: 'Фурнитура', icon: '🪡' },
    { id: 'accessories', name: 'Аксессуары', icon: '✂️' }
  ];

  var COLORS = [
    { id: 'red', name: 'Красный', hex: '#c8102e' },
    { id: 'black', name: 'Чёрный', hex: '#16161a' },
    { id: 'white', name: 'Белый', hex: '#f4f4f4' },
    { id: 'blue', name: 'Синий', hex: '#2a4c9b' },
    { id: 'green', name: 'Зелёный', hex: '#2e7d4f' },
    { id: 'beige', name: 'Бежевый', hex: '#d8c3a5' },
    { id: 'gray', name: 'Серый', hex: '#8a8a93' },
    { id: 'pink', name: 'Розовый', hex: '#e58fb0' }
  ];

  var FABRIC_TYPES = ['Хлопок', 'Лён', 'Шёлк', 'Шерсть', 'Трикотаж', 'Сатин', 'Габардин', 'Фланель'];

  // unit: 'm' = продаётся отрезом (за погонный метр), 'pc' = за штуку/упаковку
  var P = [
    // --- ТКАНИ ---
    { id: 'f-cotton-red', cat: 'fabric', name: 'Хлопок «Алое поле»', price: 480, oldPrice: 590, unit: 'm', color: 'red', fabricType: 'Хлопок',
      width: 150, density: 145, composition: '100% хлопок', care: 'Стирка при 40°C, гладить при средней температуре',
      tags: ['hit', 'sale'], popularity: 98, stock: 60, desc: 'Плотный хлопок насыщенного красного цвета. Идеален для платьев, рубашек и постельного белья.',
      colorset: ['#ff4d5e', '#c8102e'], pattern: 'weave' },
    { id: 'f-linen-beige', cat: 'fabric', name: 'Лён натуральный «Чита»', price: 690, unit: 'm', color: 'beige', fabricType: 'Лён',
      width: 140, density: 190, composition: '100% лён', care: 'Бережная стирка 30°C, гладить влажным',
      tags: ['hit'], popularity: 95, stock: 42, desc: 'Натуральный лён приятной фактуры. Дышит, не электризуется, подходит для летней одежды и штор.',
      colorset: ['#e6d6bd', '#cbb491'], pattern: 'weave' },
    { id: 'f-silk-black', cat: 'fabric', name: 'Шёлк-сатин «Ночь»', price: 1290, unit: 'm', color: 'black', fabricType: 'Шёлк',
      width: 145, density: 90, composition: '95% шёлк, 5% эластан', care: 'Только ручная стирка или химчистка',
      tags: ['new'], popularity: 80, stock: 18, desc: 'Струящийся шёлк-сатин с благородным блеском. Для вечерних платьев и блуз.',
      colorset: ['#2b2b31', '#16161a'], pattern: '' },
    { id: 'f-knit-gray', cat: 'fabric', name: 'Трикотаж «Кашкорсе» серый', price: 540, unit: 'm', color: 'gray', fabricType: 'Трикотаж',
      width: 120, density: 220, composition: '92% хлопок, 8% лайкра', care: 'Стирка 30°C, не отжимать сильно',
      tags: [], popularity: 88, stock: 75, desc: 'Эластичный плотный трикотаж для манжет, горловин и спортивной одежды.',
      colorset: ['#a0a0a8', '#7c7c84'], pattern: 'weave' },
    { id: 'f-flannel-check', cat: 'fabric', name: 'Фланель в клетку «Уют»', price: 420, unit: 'm', color: 'red', fabricType: 'Фланель',
      width: 150, density: 170, composition: '100% хлопок', care: 'Стирка 40°C, гладить с паром',
      tags: ['hit'], popularity: 91, stock: 50, desc: 'Мягкая тёплая фланель в классическую клетку. Для рубашек, пижам и пледов.',
      colorset: ['#c8102e', '#7d0b1a'], pattern: 'check' },
    { id: 'f-satin-white', cat: 'fabric', name: 'Сатин «Белоснежка»', price: 360, unit: 'm', color: 'white', fabricType: 'Сатин',
      width: 220, density: 130, composition: '100% хлопок', care: 'Стирка до 60°C, выдерживает частые стирки',
      tags: [], popularity: 84, stock: 90, desc: 'Гладкий сатин шириной 220 см для постельного белья премиум-класса.',
      colorset: ['#fdfdfd', '#e7e7ec'], pattern: 'weave' },
    { id: 'f-wool-blue', cat: 'fabric', name: 'Шерсть пальтовая «Зима»', price: 1450, unit: 'm', color: 'blue', fabricType: 'Шерсть',
      width: 150, density: 380, composition: '70% шерсть, 30% полиэстер', care: 'Только химчистка',
      tags: ['new'], popularity: 72, stock: 14, desc: 'Тёплая пальтовая шерсть глубокого синего цвета. Держит форму, не мнётся.',
      colorset: ['#2a4c9b', '#1c3568'], pattern: 'weave' },
    { id: 'f-cotton-dots', cat: 'fabric', name: 'Хлопок «Горошек»', price: 390, unit: 'm', color: 'pink', fabricType: 'Хлопок',
      width: 150, density: 140, composition: '100% хлопок', care: 'Стирка 40°C',
      tags: [], popularity: 86, stock: 65, desc: 'Нежный хлопок в мелкий горошек для детской одежды и платьев.',
      colorset: ['#e58fb0', '#c76e95'], pattern: 'dots' },
    { id: 'f-gabardine-green', cat: 'fabric', name: 'Габардин «Лес»', price: 520, unit: 'm', color: 'green', fabricType: 'Габардин',
      width: 150, density: 200, composition: '100% полиэстер', care: 'Стирка 40°C, гладить с изнанки',
      tags: [], popularity: 70, stock: 48, desc: 'Износостойкий габардин для брюк, юбок и форменной одежды.',
      colorset: ['#2e7d4f', '#1f5a39'], pattern: 'weave' },
    { id: 'f-stripe-blue', cat: 'fabric', name: 'Хлопок «Тельняшка»', price: 410, unit: 'm', color: 'blue', fabricType: 'Хлопок',
      width: 150, density: 150, composition: '100% хлопок', care: 'Стирка 40°C',
      tags: [], popularity: 78, stock: 55, desc: 'Классическая полоска для рубашек и платьев в морском стиле.',
      colorset: ['#2a4c9b', '#16161a'], pattern: 'stripes' },

    // --- ФУРНИТУРА ---
    { id: 'n-zipper-red', cat: 'notions', name: 'Молния тракторная 50 см, красная', price: 75, unit: 'pc', color: 'red', fabricType: null,
      composition: 'Спираль + пластик', care: 'Без особого ухода', tags: ['hit'], popularity: 93, stock: 200,
      desc: 'Прочная разъёмная молния для курток и толстовок.', colorset: ['#c8102e', '#7d0b1a'], pattern: 'stripes' },
    { id: 'n-buttons-black', cat: 'notions', name: 'Пуговицы рубашечные, набор 20 шт', price: 120, unit: 'pc', color: 'black', fabricType: null,
      composition: 'Полиэстер', care: '—', tags: [], popularity: 81, stock: 150,
      desc: 'Набор классических чёрных пуговиц 4 отверстия, 11 мм.', colorset: ['#2b2b31', '#16161a'], pattern: 'dots' },
    { id: 'n-thread-set', cat: 'notions', name: 'Нитки армированные, набор 10 катушек', price: 290, unit: 'pc', color: 'white', fabricType: null,
      composition: '100% полиэстер', care: '—', tags: ['hit', 'new'], popularity: 96, stock: 120,
      desc: 'Прочные армированные нитки 45 ЛЛ, 10 базовых цветов в наборе.', colorset: ['#f4f4f4', '#d6d6dd'], pattern: 'stripes' },
    { id: 'n-elastic', cat: 'notions', name: 'Резинка бельевая 40 мм, 3 м', price: 95, unit: 'pc', color: 'white', fabricType: null,
      composition: 'Полиэстер + латекс', care: '—', tags: [], popularity: 74, stock: 180,
      desc: 'Мягкая широкая резинка для поясов и манжет.', colorset: ['#ffffff', '#e7e7ec'], pattern: 'weave' },
    { id: 'n-snaps-red', cat: 'notions', name: 'Кнопки металлические 15 мм, 30 шт', price: 160, unit: 'pc', color: 'gray', fabricType: null,
      composition: 'Металл', care: '—', tags: [], popularity: 69, stock: 90,
      desc: 'Кнопки-застёжки с установочным комплектом.', colorset: ['#b8b8c0', '#8a8a93'], pattern: 'dots' },
    { id: 'n-zipper-black', cat: 'notions', name: 'Молния потайная 20 см, чёрная', price: 45, unit: 'pc', color: 'black', fabricType: null,
      composition: 'Спираль', care: '—', tags: [], popularity: 77, stock: 220,
      desc: 'Потайная молния для юбок и платьев.', colorset: ['#2b2b31', '#16161a'], pattern: 'stripes' },

    // --- АКСЕССУАРЫ ---
    { id: 'a-scissors', cat: 'accessories', name: 'Ножницы портновские 24 см', price: 890, oldPrice: 1100, unit: 'pc', color: 'black', fabricType: null,
      composition: 'Нержавеющая сталь', care: 'Беречь от влаги', tags: ['sale', 'hit'], popularity: 97, stock: 35,
      desc: 'Профессиональные раскройные ножницы с заточенными лезвиями.', colorset: ['#3a3a44', '#16161a'], pattern: '' },
    { id: 'a-pins', cat: 'accessories', name: 'Булавки портновские 100 шт', price: 130, unit: 'pc', color: 'gray', fabricType: null,
      composition: 'Сталь + стекло', care: '—', tags: [], popularity: 71, stock: 140,
      desc: 'Булавки со стеклянными головками в удобной коробке.', colorset: ['#b8b8c0', '#8a8a93'], pattern: 'dots' },
    { id: 'a-measure', cat: 'accessories', name: 'Сантиметровая лента 150 см', price: 70, unit: 'pc', color: 'red', fabricType: null,
      composition: 'ПВХ', care: '—', tags: [], popularity: 79, stock: 160,
      desc: 'Двухсторонняя измерительная лента с металлическими наконечниками.', colorset: ['#ff4d5e', '#c8102e'], pattern: 'stripes' },
    { id: 'a-needles', cat: 'accessories', name: 'Иглы для ручного шитья, набор', price: 110, unit: 'pc', color: 'gray', fabricType: null,
      composition: 'Сталь', care: '—', tags: ['new'], popularity: 83, stock: 130,
      desc: 'Набор игл разных размеров для любых видов ткани.', colorset: ['#c0c0c8', '#8a8a93'], pattern: 'weave' },
    { id: 'a-chalk', cat: 'accessories', name: 'Мелок портновский, набор 4 цвета', price: 90, unit: 'pc', color: 'white', fabricType: null,
      composition: 'Воск + пигмент', care: '—', tags: [], popularity: 66, stock: 110,
      desc: 'Набор мелков для разметки ткани, легко удаляется.', colorset: ['#f4f4f4', '#d6d6dd'], pattern: 'check' },
    { id: 'a-organizer', cat: 'accessories', name: 'Органайзер для фурнитуры', price: 340, unit: 'pc', color: 'red', fabricType: null,
      composition: 'Пластик', care: '—', tags: [], popularity: 64, stock: 40,
      desc: 'Удобный бокс с регулируемыми ячейками для пуговиц и мелочей.', colorset: ['#c8102e', '#7d0b1a'], pattern: 'check' }
  ];

  // attach generated images
  P.forEach(function (p) {
    var c = p.colorset || ['#c8102e', '#7d0b1a'];
    p.images = [
      swatch(p.fabricType || 'фото', c[0], c[1], p.pattern),
      swatch('образец', c[1], c[0], p.pattern),
      swatch('фактура', c[0], c[1], 'weave')
    ];
    delete p.colorset; delete p.pattern;
  });

  var BLOG = [
    { id: 'b1', emoji: '🧵', title: 'Как выбрать ткань для первого платья', excerpt: 'Разбираем, какие ткани прощают ошибки новичкам и хорошо держат форму.',
      body: 'Начинающим швеям стоит выбирать стабильные ткани средней плотности: хлопок, лён, плотный сатин. Они не скользят под лапкой машины и легко утюжатся. Избегайте на старте шёлка и тонкого трикотажа — они требуют опыта и специальных лапок.' },
    { id: 'b2', emoji: '🪡', title: '5 видов молний и где их применять', excerpt: 'Тракторная, потайная, спиральная — рассказываем разницу простыми словами.',
      body: 'Потайная молния незаметна в шве и идеальна для платьев и юбок. Тракторная — прочная и декоративная, подходит для курток. Спиральная — универсальная и недорогая. Выбирайте длину с запасом 2–3 см.' },
    { id: 'b3', emoji: '✂️', title: 'Уход за тканями: таблица температур', excerpt: 'Сохраняем цвет и форму изделий после первой стирки.',
      body: 'Хлопок стирают при 40–60°C, лён — при 30–40°C бережно, шерсть — только химчистка или ручная стирка в холодной воде. Всегда стирайте новую ткань перед раскроем — она может дать усадку до 5%.' },
    { id: 'b4', emoji: '📐', title: 'Сколько ткани нужно на изделие', excerpt: 'Готовые расчёты для платья, рубашки, юбки и постельного белья.',
      body: 'На прямую юбку нужно около 1 м при ширине 150 см, на платье — 1,5–2 м, на рубашку — 1,5 м, на комплект постельного белья (1,5-спальный) — 5–6 м сатина шириной 220 см.' },
    { id: 'b5', emoji: '🎨', title: 'Сочетаем ткани: правило трёх', excerpt: 'Как комбинировать принты и однотонные ткани в одном изделии.',
      body: 'Используйте не более трёх тканей: одна основная, одна акцентная и одна нейтральная. Принты сочетайте по общему цвету, а масштаб рисунка делайте разным — крупный с мелким.' },
    { id: 'b6', emoji: '🧶', title: 'Что подарить рукодельнице', excerpt: 'Идеи подарков: от ножниц до подарочного сертификата МАТРЁШКА.',
      body: 'Беспроигрышные варианты — качественные портновские ножницы, органайзер для фурнитуры, набор армированных ниток и, конечно, подарочный сертификат, чтобы мастерица выбрала ткань по душе.' }
  ];

  global.MATRESHKA_DATA = {
    swatch: swatch,
    CATEGORIES: CATEGORIES,
    COLORS: COLORS,
    FABRIC_TYPES: FABRIC_TYPES,
    PRODUCTS: P,
    BLOG: BLOG,
    ADMIN_PASSWORD: '7316'
  };
})(window);
