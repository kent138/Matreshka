/* ===================== MATRESHKA — app / router / views ===================== */
(function (global) {
  'use strict';
  var DATA = global.MATRESHKA_DATA, U = global.UI;
  var app = document.getElementById('app');

  /* ---------- routing helpers ---------- */
  function parseHash() {
    var h = location.hash.slice(1) || '/';
    var qi = h.indexOf('?');
    var path = qi >= 0 ? h.slice(0, qi) : h;
    var query = {};
    if (qi >= 0) h.slice(qi + 1).split('&').forEach(function (kv) {
      var p = kv.split('='); query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
    return { path: path, query: query, parts: path.split('/').filter(Boolean) };
  }
  function go(hash) { location.hash = hash; }

  function render() {
    var r = parseHash();
    window.scrollTo(0, 0);
    var parts = r.parts;
    var view;
    if (parts.length === 0) view = viewHome();
    else if (parts[0] === 'catalog') view = viewCatalog(r.query);
    else if (parts[0] === 'product') view = viewProduct(parts[1]);
    else if (parts[0] === 'cart') view = viewCart();
    else if (parts[0] === 'checkout') view = viewCheckout();
    else if (parts[0] === 'account') view = viewAccount(r.query);
    else if (parts[0] === 'favorites') view = viewFavorites();
    else if (parts[0] === 'delivery') view = viewDelivery();
    else if (parts[0] === 'returns') view = viewReturns();
    else if (parts[0] === 'about') view = viewAbout();
    else if (parts[0] === 'contacts') view = viewContacts();
    else if (parts[0] === 'faq') view = viewFaq();
    else if (parts[0] === 'blog') view = viewBlog(parts[1]);
    else if (parts[0] === 'order') view = viewOrderConfirm(parts[1]);
    else view = viewNotFound();

    app.innerHTML = view.html;
    if (view.mount) view.mount();
    highlightNav(r.path);
    closeMobileNav();
  }

  function highlightNav(path) {
    document.querySelectorAll('.main-nav a').forEach(function (a) {
      var href = a.getAttribute('href').slice(1);
      a.classList.toggle('active', href === path || (path === '/' && href === '/'));
    });
  }

  /* ============================================================
     HOME
  ============================================================ */
  function viewHome() {
    var products = Store.getProducts();
    var popular = products.slice().sort(function (a, b) { return b.popularity - a.popularity; }).slice(0, 8);
    var html =
      '<section class="hero"><div class="container hero-inner">' +
        '<div>' +
          '<h1>Ткани и фурнитура <span class="accent">МАТРЁШКА</span></h1>' +
          '<p>Качественные ткани, фурнитура и аксессуары для рукоделия из Читы. Доставка по всей России — Почта России и СДЭК. Персональный подход к каждому клиенту.</p>' +
          '<div class="hero-cta">' +
            '<a class="btn btn--primary btn--lg" href="#/catalog">Перейти в каталог</a>' +
            '<a class="btn btn--outline btn--lg" style="color:#fff;border-color:rgba(255,255,255,.4)" href="#/delivery">Условия доставки</a>' +
          '</div>' +
          '<div class="hero-stats">' +
            '<div><b>1000+</b>довольных рукодельниц</div>' +
            '<div><b>' + products.length + '+</b>товаров в наличии</div>' +
            '<div><b>по РФ</b>доставка в любой регион</div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-art"><img src="assets/logo.svg" alt="Логотип МАТРЁШКА"/></div>' +
      '</div></section>' +

      '<section class="section"><div class="container">' +
        '<div class="section-head"><h2>Категории</h2><a class="link" href="#/catalog">Весь каталог →</a></div>' +
        '<div class="cat-grid">' +
          '<a class="cat-card cat-fabric" href="#/catalog?cat=fabric"><div><h3>Ткани</h3><span>Хлопок, лён, шёлк, трикотаж и др.</span></div></a>' +
          '<a class="cat-card cat-notions" href="#/catalog?cat=notions"><div><h3>Фурнитура</h3><span>Молнии, пуговицы, нитки, кнопки</span></div></a>' +
          '<a class="cat-card cat-accessories" href="#/catalog?cat=accessories"><div><h3>Аксессуары</h3><span>Ножницы, иглы, инструменты</span></div></a>' +
        '</div>' +
      '</div></section>' +

      '<section class="section section--tight" style="background:var(--gray-50)"><div class="container">' +
        '<div class="feat-grid">' +
          feat('🚚', 'Доставка по России', 'Почта России и СДЭК в любой регион. Бесплатно от ' + U.money(U.FREE_SHIPPING_FROM) + '.') +
          feat('✂️', 'Отрез любой длины', 'Режем ткань под ваш проект — от 0,5 метра с шагом 10 см.') +
          feat('⭐', 'Проверенное качество', 'Лично отбираем каждый рулон. Честное описание состава и плотности.') +
          feat('💳', 'Удобная оплата', 'Картой онлайн, СБП или наличными при получении.') +
        '</div>' +
      '</div></section>' +

      '<section class="section"><div class="container">' +
        '<div class="section-head"><h2>Популярные товары</h2><a class="link" href="#/catalog?sort=popular">Смотреть все →</a></div>' +
        '<div class="product-grid" id="homeGrid">' + popular.map(U.productCard).join('') + '</div>' +
      '</div></section>' +

      '<section class="section section--tight"><div class="container">' +
        '<div style="background:linear-gradient(120deg,var(--black),var(--red-dark));border-radius:var(--radius);padding:40px;color:#fff;display:flex;gap:30px;align-items:center;flex-wrap:wrap;justify-content:space-between">' +
          '<div style="max-width:560px"><h2 style="color:#fff">Магазин в Чите с доставкой по всей стране</h2>' +
          '<p style="color:rgba(255,255,255,.85);margin:0">Наш магазин находится по адресу: г. Чита, ул. Бутина 44, помещение 1. Приходите за тканями вживую или закажите онлайн — отправим в любой уголок России.</p></div>' +
          '<a class="btn btn--primary btn--lg" href="#/contacts">Контакты и карта</a>' +
        '</div>' +
      '</div></section>';

    return { html: html, mount: function () { U.bindCardActions(document.getElementById('homeGrid')); } };
  }
  function feat(e, t, p) { return '<div class="feat"><div class="emoji">' + e + '</div><h4>' + t + '</h4><p>' + p + '</p></div>'; }

  /* ============================================================
     CATALOG
  ============================================================ */
  var catalogState = { cats: [], colors: [], ftypes: [], min: '', max: '', sort: 'popular', q: '' };
  function viewCatalog(query) {
    // init from query
    catalogState.cats = query.cat ? [query.cat] : [];
    catalogState.q = query.q || '';
    catalogState.sort = query.sort || 'popular';
    catalogState.colors = []; catalogState.ftypes = []; catalogState.min = ''; catalogState.max = '';

    var html =
      '<div class="container">' +
        '<div class="breadcrumbs"><a href="#/">Главная</a><span>/</span>Каталог</div>' +
        '<div class="catalog-layout">' +
          '<aside class="filters" id="filters">' + filtersHtml() + '</aside>' +
          '<div class="catalog-main">' +
            '<div class="catalog-toolbar">' +
              '<button class="btn btn--outline btn--sm filters-toggle" id="filtersToggle">☰ Фильтры</button>' +
              '<span class="count" id="catCount"></span>' +
              '<select class="sort-select" id="sortSel">' +
                '<option value="popular">По популярности</option>' +
                '<option value="new">Сначала новинки</option>' +
                '<option value="price-asc">Сначала дешёвые</option>' +
                '<option value="price-desc">Сначала дорогие</option>' +
                '<option value="name">По названию</option>' +
              '</select>' +
            '</div>' +
            '<div class="product-grid" id="catGrid"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    return {
      html: html,
      mount: function () {
        var grid = document.getElementById('catGrid');
        U.bindCardActions(grid);
        var filters = document.getElementById('filters');
        document.getElementById('sortSel').value = catalogState.sort;
        document.getElementById('filtersToggle').onclick = function () { filters.classList.toggle('open'); };
        document.getElementById('sortSel').onchange = function () { catalogState.sort = this.value; drawCatalog(); };
        bindFilters(filters);
        drawCatalog();
      }
    };
  }
  function filtersHtml() {
    return '<div class="filter-group"><h4>Категории</h4>' +
        DATA.CATEGORIES.map(function (c) {
          return '<label class="filter-opt"><input type="checkbox" class="f-cat" value="' + c.id + '"' +
            (catalogState.cats.indexOf(c.id) >= 0 ? ' checked' : '') + '/> ' + c.icon + ' ' + c.name + '</label>';
        }).join('') +
      '</div>' +
      '<div class="filter-group"><h4>Цена, ₽</h4><div class="price-inputs">' +
        '<input type="number" min="0" placeholder="от" class="f-min"/><span>—</span><input type="number" min="0" placeholder="до" class="f-max"/></div></div>' +
      '<div class="filter-group"><h4>Цвет</h4>' +
        DATA.COLORS.map(function (c) {
          return '<label class="filter-opt"><input type="checkbox" class="f-color" value="' + c.id + '"/> ' +
            '<span class="swatch" style="background:' + c.hex + '"></span> ' + c.name + '</label>';
        }).join('') +
      '</div>' +
      '<div class="filter-group"><h4>Тип ткани</h4>' +
        DATA.FABRIC_TYPES.map(function (t) {
          return '<label class="filter-opt"><input type="checkbox" class="f-ftype" value="' + t + '"/> ' + t + '</label>';
        }).join('') +
      '</div>' +
      '<button class="btn btn--ghost btn--block btn--sm" id="filtersReset">Сбросить фильтры</button>';
  }
  function bindFilters(root) {
    root.addEventListener('change', function () { readFilters(root); drawCatalog(); });
    root.addEventListener('input', function (e) { if (e.target.classList.contains('f-min') || e.target.classList.contains('f-max')) { readFilters(root); drawCatalog(); } });
    var reset = root.querySelector('#filtersReset');
    if (reset) reset.onclick = function () {
      catalogState.cats = []; catalogState.colors = []; catalogState.ftypes = []; catalogState.min = ''; catalogState.max = '';
      root.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.checked = false; });
      root.querySelector('.f-min').value = ''; root.querySelector('.f-max').value = '';
      drawCatalog();
    };
  }
  function readFilters(root) {
    catalogState.cats = sel(root, '.f-cat');
    catalogState.colors = sel(root, '.f-color');
    catalogState.ftypes = sel(root, '.f-ftype');
    catalogState.min = root.querySelector('.f-min').value;
    catalogState.max = root.querySelector('.f-max').value;
  }
  function sel(root, q) { return Array.prototype.map.call(root.querySelectorAll(q + ':checked'), function (c) { return c.value; }); }

  function drawCatalog() {
    var s = catalogState;
    var list = Store.getProducts().filter(function (p) {
      if (s.cats.length && s.cats.indexOf(p.cat) < 0) return false;
      if (s.colors.length && s.colors.indexOf(p.color) < 0) return false;
      if (s.ftypes.length && s.ftypes.indexOf(p.fabricType) < 0) return false;
      if (s.min !== '' && p.price < +s.min) return false;
      if (s.max !== '' && p.price > +s.max) return false;
      if (s.q) {
        var hay = (p.name + ' ' + (p.fabricType || '') + ' ' + (p.composition || '') + ' ' + (p.desc || '')).toLowerCase();
        if (hay.indexOf(s.q.toLowerCase()) < 0) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      switch (s.sort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name, 'ru');
        case 'new': return (b.tags.indexOf('new') >= 0) - (a.tags.indexOf('new') >= 0) || b.popularity - a.popularity;
        default: return b.popularity - a.popularity;
      }
    });
    var grid = document.getElementById('catGrid');
    var count = document.getElementById('catCount');
    if (count) count.textContent = 'Найдено товаров: ' + list.length;
    grid.innerHTML = list.length ? list.map(U.productCard).join('') :
      '<div class="empty" style="grid-column:1/-1"><div class="emoji">🔍</div><h3>Ничего не найдено</h3><p>Попробуйте изменить фильтры или поисковый запрос.</p></div>';
  }

  /* ============================================================
     PRODUCT DETAIL
  ============================================================ */
  function viewProduct(id) {
    var p = Store.getProduct(id);
    if (!p) return viewNotFound();
    var fav = Store.isFavorite(p.id);
    var related = Store.getProducts().filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 4);
    var isCut = p.unit === 'm';
    var stockCls = p.stock <= 0 ? 'out-stock' : p.stock < 10 ? 'low-stock' : 'in-stock';
    var stockTxt = p.stock <= 0 ? 'Нет в наличии' : p.stock < 10 ? 'Осталось мало (' + p.stock + ')' : 'В наличии';

    var specs = '';
    function row(k, v) { return v ? '<tr><td>' + k + '</td><td>' + U.esc(v) + '</td></tr>' : ''; }
    specs += row('Категория', U.catName(p.cat));
    specs += row('Тип ткани', p.fabricType);
    specs += row('Состав', p.composition);
    specs += row('Ширина', p.width ? p.width + ' см' : '');
    specs += row('Плотность', p.density ? p.density + ' г/м²' : '');
    specs += row('Цвет', U.colorMeta(p.color).name);

    var html =
      '<div class="container">' +
        '<div class="breadcrumbs"><a href="#/">Главная</a><span>/</span><a href="#/catalog?cat=' + p.cat + '">' + U.catName(p.cat) + '</a><span>/</span>' + U.esc(p.name) + '</div>' +
        '<div class="pdp">' +
          '<div class="pdp-gallery">' +
            '<div class="pdp-main-img"><img id="pdpMain" src="' + p.images[0] + '" alt="' + U.esc(p.name) + '"/></div>' +
            '<div class="pdp-thumbs">' + p.images.map(function (im, i) {
              return '<button class="' + (i === 0 ? 'active' : '') + '" data-thumb="' + i + '"><img src="' + im + '" alt=""/></button>';
            }).join('') + '</div>' +
          '</div>' +
          '<div class="pdp-info">' +
            '<span class="pc-cat">' + U.catName(p.cat) + '</span>' +
            '<h1>' + U.esc(p.name) + '</h1>' +
            '<span class="pc-stock ' + stockCls + '">● ' + stockTxt + '</span>' +
            '<div class="pdp-price-row">' +
              (p.oldPrice ? '<span class="pc-old">' + U.money(p.oldPrice) + '</span>' : '') +
              '<span class="pdp-price">' + U.money(p.price) + '</span><span style="color:var(--gray-500)">' + (isCut ? 'за метр' : 'за штуку') + '</span>' +
            '</div>' +
            '<p style="color:var(--gray-700)">' + U.esc(p.desc || '') + '</p>' +
            (isCut ?
              '<div class="pdp-cut"><label>Длина отреза (метры) — шаг 0,1 м, минимум 0,5 м</label>' +
                '<div class="qty-stepper" style="width:max-content">' +
                  '<button type="button" id="mMinus">−</button>' +
                  '<input id="meters" type="number" min="0.5" step="0.1" value="1"/>' +
                  '<button type="button" id="mPlus">+</button>' +
                '</div>' +
                '<p class="hint" style="margin-top:8px">Итого за отрез: <b id="cutTotal">' + U.money(p.price) + '</b></p>' +
              '</div>' : '') +
            '<div class="qty-row" style="margin:18px 0">' +
              '<div class="qty-stepper"><button type="button" id="qMinus">−</button><input id="qty" type="number" min="1" value="1"/><button type="button" id="qPlus">+</button></div>' +
              '<button class="btn btn--primary btn--lg" id="addBtn"' + (p.stock <= 0 ? ' disabled' : '') + '>В корзину</button>' +
              '<button class="btn btn--outline btn--lg" id="favToggle">' + (fav ? '♥ В избранном' : '♡ В избранное') + '</button>' +
            '</div>' +
            '<table class="pdp-specs">' + specs + '</table>' +
          '</div>' +
        '</div>' +

        '<div class="tabs">' +
          '<button class="tab active" data-tab="care">Уход</button>' +
          '<button class="tab" data-tab="delivery">Доставка</button>' +
          '<button class="tab" data-tab="compat">Совместимость</button>' +
        '</div>' +
        '<div id="tabBody" style="max-width:760px;color:var(--gray-700)"></div>' +

        (related.length ? '<div class="section"><div class="section-head"><h2>Похожие товары</h2></div>' +
          '<div class="product-grid" id="relGrid">' + related.map(U.productCard).join('') + '</div></div>' : '') +
      '</div>';

    return {
      html: html,
      mount: function () {
        // gallery
        document.querySelectorAll('[data-thumb]').forEach(function (b) {
          b.onclick = function () {
            document.querySelectorAll('[data-thumb]').forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            document.getElementById('pdpMain').src = p.images[+b.getAttribute('data-thumb')];
          };
        });
        // qty steppers
        var qty = document.getElementById('qty');
        document.getElementById('qPlus').onclick = function () { qty.value = (+qty.value || 1) + 1; };
        document.getElementById('qMinus').onclick = function () { qty.value = Math.max(1, (+qty.value || 1) - 1); };
        var meters = document.getElementById('meters');
        function updCut() {
          var mv = Math.max(0.5, Math.round((+meters.value || 0.5) * 10) / 10);
          document.getElementById('cutTotal').textContent = U.money(p.price * mv);
        }
        if (meters) {
          document.getElementById('mPlus').onclick = function () { meters.value = (Math.round((+meters.value || 0.5) * 10) + 1) / 10; updCut(); };
          document.getElementById('mMinus').onclick = function () { meters.value = Math.max(5, Math.round((+meters.value || 0.5) * 10) - 1) / 10; updCut(); };
          meters.oninput = updCut;
        }
        // add to cart
        document.getElementById('addBtn').onclick = function () {
          var q = Math.max(1, parseInt(qty.value, 10) || 1);
          var m = meters ? Math.max(0.5, Math.round((+meters.value || 1) * 10) / 10) : null;
          Store.addToCart(p.id, q, m);
          U.toast('Добавлено в корзину', 'success');
        };
        // fav
        document.getElementById('favToggle').onclick = function () {
          var added = Store.toggleFavorite(p.id);
          this.textContent = added ? '♥ В избранном' : '♡ В избранное';
          U.toast(added ? 'Добавлено в избранное' : 'Удалено из избранного');
        };
        // tabs
        var tabContent = {
          care: '<h3>Рекомендации по уходу</h3><p>' + U.esc(p.care || 'Стандартный уход в соответствии с типом материала.') + '</p>',
          delivery: '<h3>Доставка</h3><p>Доставляем по всей России: Почта России и СДЭК. Бесплатная доставка при заказе от ' + U.money(U.FREE_SHIPPING_FROM) + '. Самовывоз из магазина в Чите — бесплатно.</p>',
          compat: '<h3>С чем сочетается</h3><p>' + (p.cat === 'fabric'
            ? 'К этой ткани отлично подойдут нитки в тон, потайная или тракторная молния и подходящие пуговицы из раздела «Фурнитура». При комбинировании тканей придерживайтесь правила трёх материалов.'
            : 'Универсальный товар, совместим с большинством тканей нашего каталога. Подберите дополнительные инструменты в разделе «Аксессуары».') + '</p>'
        };
        function showTab(name) {
          document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === name); });
          document.getElementById('tabBody').innerHTML = tabContent[name];
        }
        document.querySelectorAll('.tab').forEach(function (t) { t.onclick = function () { showTab(t.getAttribute('data-tab')); }; });
        showTab('care');
        if (document.getElementById('relGrid')) U.bindCardActions(document.getElementById('relGrid'));
      }
    };
  }

  /* ============================================================
     CART
  ============================================================ */
  function viewCart() {
    var items = Store.cartDetailed();
    if (!items.length) {
      return { html: '<div class="container"><div class="empty"><div class="emoji">🛒</div><h3>Корзина пуста</h3><p>Добавьте товары из каталога, чтобы оформить заказ.</p><a class="btn btn--primary" href="#/catalog">В каталог</a></div></div>' };
    }
    var subtotal = Store.cartSubtotal();
    var html =
      '<div class="container"><div class="breadcrumbs"><a href="#/">Главная</a><span>/</span>Корзина</div>' +
        '<h1 style="font-size:2rem;margin:.2em 0 .6em">Корзина</h1>' +
        '<div class="cart-layout">' +
          '<div id="cartItems">' + items.map(cartItemHtml).join('') + '</div>' +
          '<div class="summary">' +
            '<h3>Итого</h3>' +
            '<div class="summary-row"><span>Товары (' + Store.cartCount() + ')</span><span>' + U.money(subtotal) + '</span></div>' +
            '<div class="summary-row"><span>Доставка</span><span>рассчитается при оформлении</span></div>' +
            (subtotal < U.FREE_SHIPPING_FROM
              ? '<p class="hint" style="color:var(--red)">Добавьте товаров на ' + U.money(U.FREE_SHIPPING_FROM - subtotal) + ' для бесплатной доставки</p>'
              : '<p class="hint" style="color:var(--green)">🎉 Доставка будет бесплатной!</p>') +
            '<div class="summary-row total"><span>К оплате</span><span>' + U.money(subtotal) + '</span></div>' +
            '<a class="btn btn--primary btn--block btn--lg" href="#/checkout">Оформить заказ</a>' +
            '<a class="btn btn--ghost btn--block" style="margin-top:8px" href="#/catalog">Продолжить покупки</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    return {
      html: html,
      mount: function () {
        var c = document.getElementById('cartItems');
        c.addEventListener('click', function (e) {
          var rm = e.target.closest('[data-rm]');
          if (rm) { Store.removeFromCart(rm.getAttribute('data-rm')); render(); return; }
          var plus = e.target.closest('[data-plus]');
          if (plus) { changeQty(plus.getAttribute('data-plus'), 1); return; }
          var minus = e.target.closest('[data-minus]');
          if (minus) { changeQty(minus.getAttribute('data-minus'), -1); return; }
        });
      }
    };
  }
  function changeQty(key, delta) {
    var item = Store.getCart().filter(function (c) { return c.key === key; })[0];
    if (!item) return;
    Store.setCartQty(key, item.qty + delta);
    render();
  }
  function cartItemHtml(i) {
    return '<div class="cart-item">' +
      '<img src="' + i.product.images[0] + '" alt="" style="grid-area:img"/>' +
      '<div style="grid-area:info">' +
        '<a class="cart-item-title" href="#/product/' + i.product.id + '">' + U.esc(i.product.name) + '</a>' +
        '<div class="cart-item-meta">' + U.money(i.product.price) + (i.product.unit === 'm' ? ' /м' : ' /шт') +
          (i.meters ? ' · отрез ' + i.meters + ' м' : '') + '</div>' +
        '<div class="qty-stepper" style="margin-top:8px;width:max-content"><button data-minus="' + i.key + '">−</button>' +
          '<input value="' + i.qty + '" readonly style="width:42px"/><button data-plus="' + i.key + '">+</button></div>' +
        '<button class="cart-item-remove" data-rm="' + i.key + '">Удалить</button>' +
      '</div>' +
      '<div class="cart-item-price" style="grid-area:price">' + U.money(i.lineTotal) + '</div>' +
    '</div>';
  }

  /* ============================================================
     CHECKOUT
  ============================================================ */
  function viewCheckout() {
    var items = Store.cartDetailed();
    if (!items.length) { go('#/cart'); return { html: '' }; }
    var user = Store.currentUser();
    var subtotal = Store.cartSubtotal();

    var html =
      '<div class="container"><div class="breadcrumbs"><a href="#/">Главная</a><span>/</span><a href="#/cart">Корзина</a><span>/</span>Оформление</div>' +
        '<h1 style="font-size:2rem;margin:.2em 0 .6em">Оформление заказа</h1>' +
        '<form id="checkoutForm"><div class="cart-layout">' +
          '<div>' +
            '<div class="panel-card"><h3 style="margin-top:0">Контактные данные</h3>' +
              '<div class="field"><label>Имя и фамилия *</label><input id="co-name" required value="' + U.esc(user ? user.name : '') + '"/></div>' +
              '<div class="field"><label>Телефон *</label><input id="co-phone" required placeholder="+7 ___ ___-__-__" value="' + U.esc(user ? user.phone : '') + '"/></div>' +
            '</div>' +

            '<div class="panel-card"><h3 style="margin-top:0">Способ доставки</h3>' +
              radio('delivery', 'cdek', 'СДЭК', 'Доставка до пункта выдачи или курьером', true) +
              radio('delivery', 'post', 'Почта России', 'Доставка в любое отделение по стране') +
              radio('delivery', 'pickup', 'Самовывоз из магазина', 'г. Чита, ул. Бутина 44, помещение 1 — бесплатно') +
              '<div class="field" id="regionField" style="margin-top:14px"><label>Регион доставки</label><select id="co-region">' +
                U.REGIONS.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('') +
              '</select></div>' +
              '<div class="field" id="addrField"><label>Адрес доставки *</label><input id="co-address" placeholder="Город, улица, дом, индекс"/></div>' +
            '</div>' +

            '<div class="panel-card"><h3 style="margin-top:0">Способ оплаты</h3>' +
              radio('pay', 'card', 'Онлайн-оплата картой', 'Безопасная оплата картой российского банка (МИР)', true) +
              radio('pay', 'sbp', 'СБП', 'Оплата по QR-коду через Систему быстрых платежей') +
              radio('pay', 'cash', 'Наличными при получении', 'Оплата курьеру или в пункте выдачи') +
            '</div>' +

            '<div class="panel-card"><h3 style="margin-top:0">Комментарий к заказу</h3>' +
              '<div class="field"><textarea id="co-comment" placeholder="Пожелания по заказу (необязательно)"></textarea></div>' +
            '</div>' +
          '</div>' +

          '<div class="summary">' +
            '<h3>Ваш заказ</h3>' +
            items.map(function (i) {
              return '<div class="summary-row"><span>' + U.esc(i.product.name) + (i.meters ? ' (' + i.meters + 'м)' : '') + ' × ' + i.qty + '</span><span>' + U.money(i.lineTotal) + '</span></div>';
            }).join('') +
            '<div class="summary-row"><span>Товары</span><span>' + U.money(subtotal) + '</span></div>' +
            '<div class="summary-row"><span>Доставка</span><span id="co-ship">—</span></div>' +
            '<div class="summary-row"><span>Срок</span><span id="co-days">—</span></div>' +
            (user && user.bonus ? '<div class="summary-row"><label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="co-bonus"/> Списать бонусы (' + user.bonus + ')</label><span id="co-bonus-val">−0 ₽</span></div>' : '') +
            '<div class="summary-row total"><span>К оплате</span><span id="co-total">' + U.money(subtotal) + '</span></div>' +
            '<button class="btn btn--primary btn--block btn--lg" type="submit">Подтвердить заказ</button>' +
            '<p class="hint" style="text-align:center;margin-top:10px">🔒 Оплата защищена SSL</p>' +
          '</div>' +
        '</div></form>' +
      '</div>';

    return {
      html: html,
      mount: function () {
        var form = document.getElementById('checkoutForm');
        var bonusUser = user && user.bonus ? user.bonus : 0;
        function recalc() {
          var method = form.querySelector('input[name=delivery]:checked').value;
          var region = document.getElementById('co-region').value;
          var d = U.deliveryCost(region, method, subtotal);
          document.getElementById('co-ship').textContent = d.cost === 0 ? 'Бесплатно' : U.money(d.cost);
          document.getElementById('co-days').textContent = d.days;
          document.getElementById('regionField').style.display = method === 'pickup' ? 'none' : '';
          document.getElementById('addrField').style.display = method === 'pickup' ? 'none' : '';
          var bonusUse = 0;
          var bonusEl = document.getElementById('co-bonus');
          if (bonusEl && bonusEl.checked) { bonusUse = Math.min(bonusUser, Math.round(subtotal * 0.3)); }
          if (document.getElementById('co-bonus-val')) document.getElementById('co-bonus-val').textContent = '−' + U.money(bonusUse);
          var total = subtotal + d.cost - bonusUse;
          document.getElementById('co-total').textContent = U.money(total);
          form._calc = { method: method, region: region, delivery: d, bonusUse: bonusUse, total: total };
        }
        // radio card active state
        form.addEventListener('change', function (e) {
          if (e.target.type === 'radio') {
            form.querySelectorAll('input[name=' + e.target.name + ']').forEach(function (r) {
              r.closest('.radio-card').classList.toggle('active', r.checked);
            });
          }
          recalc();
        });
        recalc();

        form.onsubmit = function (e) {
          e.preventDefault();
          var name = document.getElementById('co-name').value.trim();
          var phone = document.getElementById('co-phone').value.trim();
          var calc = form._calc;
          var address = document.getElementById('co-address').value.trim();
          if (!name || !phone) { U.toast('Заполните контактные данные', 'error'); return; }
          if (calc.method !== 'pickup' && !address) { U.toast('Укажите адрес доставки', 'error'); return; }

          var payLabels = { card: 'Картой онлайн (МИР)', sbp: 'СБП', cash: 'Наличными при получении' };
          var region = U.REGIONS.filter(function (r) { return r.id === calc.region; })[0];
          var order = {
            userId: user ? user.id : null,
            customer: { name: name, phone: phone },
            items: Store.cartDetailed().map(function (i) {
              return { id: i.product.id, name: i.product.name, qty: i.qty, meters: i.meters, unitPrice: i.unitPrice, lineTotal: i.lineTotal };
            }),
            subtotal: subtotal,
            delivery: {
              method: calc.method,
              label: calc.delivery.label,
              regionName: calc.method === 'pickup' ? 'Самовывоз, Чита' : region.name,
              cost: calc.delivery.cost,
              days: calc.delivery.days,
              address: calc.method === 'pickup' ? 'Самовывоз: Чита, ул. Бутина 44, пом. 1' : address
            },
            payment: payLabels[form.querySelector('input[name=pay]:checked').value],
            bonusUsed: calc.bonusUse,
            comment: document.getElementById('co-comment').value.trim(),
            total: calc.total
          };

          // reduce stock
          order.items.forEach(function (it) {
            var p = Store.getProduct(it.id);
            if (p) { p.stock = Math.max(0, p.stock - it.qty); Store.upsertProduct(p); }
          });

          var saved = Store.placeOrder(order);

          // bonuses: spend + earn 5%
          if (user) {
            var earned = Math.round(calc.total * 0.05);
            Store.updateUser({ bonus: Math.max(0, user.bonus - calc.bonusUse + earned) });
          }
          Store.clearCart();
          go('#/order/' + saved.id);
        };
      }
    };
  }
  function radio(name, val, title, desc, checked) {
    return '<label class="radio-card' + (checked ? ' active' : '') + '">' +
      '<input type="radio" name="' + name + '" value="' + val + '"' + (checked ? ' checked' : '') + '/>' +
      '<span><span class="rc-title">' + title + '</span><br/><span class="rc-desc">' + desc + '</span></span></label>';
  }

  /* ============================================================
     ORDER CONFIRMATION
  ============================================================ */
  function viewOrderConfirm(id) {
    var o = Store.getOrders().filter(function (x) { return x.id === id; })[0];
    if (!o) return viewNotFound();
    var html =
      '<div class="container"><div class="content-page" style="text-align:center">' +
        '<div style="font-size:3.4rem">✅</div>' +
        '<h1>Заказ №' + o.number + ' оформлен!</h1>' +
        '<p>Спасибо за заказ в МАТРЁШКА! Мы свяжемся с вами по телефону <b>' + U.esc(o.customer.phone) + '</b> для подтверждения.</p>' +
        '<div class="panel-card" style="text-align:left;max-width:480px;margin:24px auto">' +
          '<div class="summary-row"><span>Сумма заказа</span><b>' + U.money(o.total) + '</b></div>' +
          '<div class="summary-row"><span>Доставка</span><span>' + U.esc(o.delivery.label) + ' · ' + o.delivery.days + '</span></div>' +
          '<div class="summary-row"><span>Оплата</span><span>' + U.esc(o.payment) + '</span></div>' +
          '<div class="summary-row"><span>Статус</span>' + U.statusPill(o.status) + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
          (o.userId ? '<a class="btn btn--primary" href="#/account?tab=orders">Мои заказы</a>' : '') +
          '<a class="btn btn--outline" href="#/catalog">Продолжить покупки</a>' +
        '</div>' +
      '</div></div>';
    return { html: html };
  }

  /* ============================================================
     FAVORITES
  ============================================================ */
  function viewFavorites() {
    var favs = Store.getFavorites().map(function (id) { return Store.getProduct(id); }).filter(Boolean);
    var html = '<div class="container section"><div class="section-head"><h2>Избранное</h2></div>' +
      (favs.length ? '<div class="product-grid" id="favGrid">' + favs.map(U.productCard).join('') + '</div>'
        : '<div class="empty"><div class="emoji">♡</div><h3>В избранном пусто</h3><p>Нажимайте на сердечко у товаров, чтобы сохранить их здесь.</p><a class="btn btn--primary" href="#/catalog">В каталог</a></div>') +
      '</div>';
    return { html: html, mount: function () { if (favs.length) U.bindCardActions(document.getElementById('favGrid')); } };
  }

  /* ============================================================
     ACCOUNT (auth-gated)
  ============================================================ */
  var accountTab = 'profile';
  function viewAccount(query) {
    var user = Store.currentUser();
    if (!user) {
      return { html: '<div class="container"><div class="empty"><div class="emoji">👤</div><h3>Войдите в личный кабинет</h3><p>Авторизуйтесь, чтобы видеть историю заказов, бонусы и адреса доставки.</p><button class="btn btn--primary" id="acLogin">Войти или зарегистрироваться</button></div></div>',
        mount: function () { document.getElementById('acLogin').onclick = function () { openAuth('login'); }; } };
    }
    if (query.tab) accountTab = query.tab;

    var nav = [
      ['profile', '👤 Профиль'], ['orders', '📦 Мои заказы'], ['favorites', '♥ Избранное'],
      ['addresses', '📍 Адреса'], ['bonus', '🎁 Бонусы'], ['settings', '⚙ Настройки']
    ];
    var html = '<div class="container"><div class="breadcrumbs"><a href="#/">Главная</a><span>/</span>Личный кабинет</div>' +
      '<div class="account-layout"><aside class="account-nav" id="acNav">' +
        nav.map(function (n) { return '<button data-tab="' + n[0] + '"' + (accountTab === n[0] ? ' class="active"' : '') + '>' + n[1] + '</button>'; }).join('') +
        '<button class="logout" id="acLogout">⎋ Выйти</button>' +
      '</aside><div id="acBody"></div></div></div>';

    return {
      html: html,
      mount: function () {
        document.getElementById('acNav').addEventListener('click', function (e) {
          var b = e.target.closest('[data-tab]');
          if (b) { accountTab = b.getAttribute('data-tab'); drawAccount(); document.querySelectorAll('#acNav [data-tab]').forEach(function (x) { x.classList.toggle('active', x === b); }); }
        });
        document.getElementById('acLogout').onclick = function () { Store.logout(); U.toast('Вы вышли из аккаунта'); go('#/'); };
        drawAccount();
      }
    };
  }
  function drawAccount() {
    var user = Store.currentUser(); if (!user) return;
    var body = document.getElementById('acBody'); if (!body) return;
    var html = '';
    if (accountTab === 'profile') {
      var orders = Store.userOrders();
      html = '<div class="panel-card"><h3 style="margin-top:0">Здравствуйте, ' + U.esc(user.name) + '!</h3>' +
        '<p style="color:var(--gray-700)">Телефон: ' + U.esc(user.phone) + '</p></div>' +
        '<div class="stat-grid">' +
          '<div class="stat"><b>' + orders.length + '</b><span>заказов</span></div>' +
          '<div class="stat"><b>' + user.bonus + '</b><span>бонусов</span></div>' +
          '<div class="stat"><b>' + Store.getFavorites().length + '</b><span>в избранном</span></div>' +
          '<div class="stat"><b>' + user.addresses.length + '</b><span>адресов</span></div>' +
        '</div>';
    } else if (accountTab === 'orders') {
      var os = Store.userOrders();
      html = '<div class="panel-card"><h3 style="margin-top:0">История заказов</h3>' +
        (os.length ? os.map(accountOrderCard).join('') : '<p style="color:var(--gray-500)">У вас пока нет заказов. <a href="#/catalog" style="color:var(--red)">Перейти в каталог</a></p>') + '</div>';
    } else if (accountTab === 'favorites') {
      var favs = Store.getFavorites().map(function (id) { return Store.getProduct(id); }).filter(Boolean);
      html = '<div class="panel-card"><h3 style="margin-top:0">Избранные товары</h3>' +
        (favs.length ? '<div class="product-grid" id="acFavGrid">' + favs.map(U.productCard).join('') + '</div>' : '<p style="color:var(--gray-500)">Список избранного пуст.</p>') + '</div>';
    } else if (accountTab === 'addresses') {
      html = '<div class="panel-card"><h3 style="margin-top:0">Адреса доставки</h3><div id="addrList">' +
        (user.addresses.length ? user.addresses.map(function (a, i) {
          return '<div class="summary-row" style="border-bottom:1px solid var(--gray-200)"><span>📍 ' + U.esc(a) + '</span><button class="mini-btn danger" data-addr-rm="' + i + '">Удалить</button></div>';
        }).join('') : '<p style="color:var(--gray-500)">Нет сохранённых адресов.</p>') + '</div>' +
        '<div class="field" style="margin-top:14px"><label>Новый адрес</label><input id="newAddr" placeholder="Город, улица, дом, индекс"/></div>' +
        '<button class="btn btn--primary btn--sm" id="addAddr">Добавить адрес</button></div>';
    } else if (accountTab === 'bonus') {
      html = '<div class="bonus-banner"><div>Ваши бонусы</div><div class="pts">' + user.bonus + '</div>' +
        '<p style="margin:0;opacity:.9">1 бонус = 1 ₽. Можно оплатить до 30% стоимости заказа.</p></div>' +
        '<div class="panel-card" style="margin-top:16px"><h3>Как работает бонусная программа</h3>' +
        '<ul style="color:var(--gray-700)"><li>Возвращаем <b>5%</b> бонусами с каждого заказа</li>' +
        '<li>Приветственный бонус <b>200</b> за регистрацию</li>' +
        '<li>Бонусами можно оплатить до <b>30%</b> заказа</li></ul></div>';
    } else if (accountTab === 'settings') {
      html = '<div class="panel-card"><h3 style="margin-top:0">Личные данные</h3>' +
        '<form id="settingsForm"><div class="field"><label>Имя</label><input id="set-name" value="' + U.esc(user.name) + '"/></div>' +
        '<div class="field"><label>Телефон</label><input id="set-phone" value="' + U.esc(user.phone) + '"/></div>' +
        '<button class="btn btn--primary btn--sm" type="submit">Сохранить</button></form></div>' +
        '<div class="panel-card"><h3 style="margin-top:0">Уведомления</h3>' +
        '<label class="filter-opt"><input type="checkbox" checked/> Сообщать о статусе заказа по SMS</label>' +
        '<label class="filter-opt"><input type="checkbox" checked/> Получать новости и акции</label></div>';
    }
    body.innerHTML = html;

    // bind tab-specific actions
    if (accountTab === 'favorites' && document.getElementById('acFavGrid')) U.bindCardActions(document.getElementById('acFavGrid'));
    if (accountTab === 'addresses') {
      document.getElementById('addAddr').onclick = function () {
        var v = document.getElementById('newAddr').value.trim();
        if (!v) return;
        var addrs = user.addresses.concat([v]);
        Store.updateUser({ addresses: addrs }); drawAccount();
      };
      body.querySelectorAll('[data-addr-rm]').forEach(function (b) {
        b.onclick = function () {
          var addrs = user.addresses.slice(); addrs.splice(+b.getAttribute('data-addr-rm'), 1);
          Store.updateUser({ addresses: addrs }); drawAccount();
        };
      });
    }
    if (accountTab === 'settings') {
      document.getElementById('settingsForm').onsubmit = function (e) {
        e.preventDefault();
        Store.updateUser({ name: document.getElementById('set-name').value.trim(), phone: Store.normalizePhone(document.getElementById('set-phone').value) });
        U.toast('Данные сохранены', 'success'); drawAccount();
      };
    }
  }
  function accountOrderCard(o) {
    var step = U.STATUS[o.status].step;
    var track = o.status === 'cancelled' ? '<p style="color:var(--red);font-size:.85rem">Заказ отменён</p>' :
      '<div class="order-track">' + ['Новый', 'В обработке', 'Отправлен', 'Доставлен'].map(function (l, i) {
        return '<div class="track-step' + (i <= step ? ' done' : '') + '">' + l + '</div>';
      }).join('') + '</div>';
    return '<div class="order-card"><div class="order-card-head">' +
      '<span class="order-id">Заказ №' + o.number + '</span>' +
      '<span style="color:var(--gray-500);font-size:.85rem">' + new Date(o.createdAt).toLocaleDateString('ru-RU') + '</span>' +
      U.statusPill(o.status) + '<b style="margin-left:auto">' + U.money(o.total) + '</b></div>' +
      '<div style="font-size:.86rem;color:var(--gray-700)">' + o.items.map(function (i) { return U.esc(i.name) + ' × ' + i.qty; }).join(', ') + '</div>' +
      track + '</div>';
  }

  /* ============================================================
     STATIC / CONTENT PAGES
  ============================================================ */
  function viewDelivery() {
    var html = '<div class="container"><div class="content-page">' +
      '<h1>Доставка и оплата</h1>' +
      '<p>Магазин МАТРЁШКА находится в Чите и доставляет ткани, фурнитуру и аксессуары по всей России.</p>' +
      '<div class="info-cards">' +
        '<div class="info-card"><div class="emoji">📦</div><h3>СДЭК</h3><p>До пункта выдачи или курьером. Срок 1–8 дней в зависимости от региона.</p></div>' +
        '<div class="info-card"><div class="emoji">✉️</div><h3>Почта России</h3><p>В любое почтовое отделение страны. Доступно даже в небольших населённых пунктах.</p></div>' +
        '<div class="info-card"><div class="emoji">🏪</div><h3>Самовывоз</h3><p>Бесплатно из магазина: г. Чита, ул. Бутина 44, помещение 1.</p></div>' +
      '</div>' +
      '<h2>Бесплатная доставка</h2><p>При заказе от <b>' + U.money(U.FREE_SHIPPING_FROM) + '</b> доставка по России бесплатна (СДЭК и Почта России).</p>' +
      '<h2>Способы оплаты</h2><ul>' +
        '<li><b>Онлайн-оплата картой</b> — картой российского банка (МИР). Без Visa и MasterCard.</li>' +
        '<li><b>СБП</b> — оплата по QR-коду через Систему быстрых платежей.</li>' +
        '<li><b>Наличными при получении</b> — курьеру или в пункте выдачи.</li>' +
      '</ul>' +
      '<h2>Калькулятор стоимости доставки</h2>' +
      '<div class="calc">' +
        '<div class="field"><label>Регион</label><select id="cl-region">' + U.REGIONS.map(function (r) { return '<option value="' + r.id + '">' + r.name + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>Способ</label><select id="cl-method"><option value="cdek">СДЭК</option><option value="post">Почта России</option><option value="pickup">Самовывоз</option></select></div>' +
        '<div class="field"><label>Сумма заказа, ₽</label><input id="cl-sum" type="number" min="0" value="3000"/></div>' +
        '<div class="calc-result" id="cl-result"></div>' +
      '</div>' +
      '</div></div>';
    return {
      html: html,
      mount: function () {
        function calc() {
          var d = U.deliveryCost(document.getElementById('cl-region').value, document.getElementById('cl-method').value, +document.getElementById('cl-sum').value || 0);
          document.getElementById('cl-result').innerHTML =
            '<div>Стоимость доставки:</div><div class="big">' + (d.cost === 0 ? 'Бесплатно' : U.money(d.cost)) + '</div>' +
            '<div style="color:var(--gray-500)">' + d.label + ' · срок ' + d.days + '</div>';
        }
        ['cl-region', 'cl-method', 'cl-sum'].forEach(function (id) { document.getElementById(id).addEventListener('input', calc); document.getElementById(id).addEventListener('change', calc); });
        calc();
      }
    };
  }
  function viewReturns() {
    return { html: '<div class="container"><div class="content-page">' +
      '<h1>Возврат и обмен</h1>' +
      '<p>Мы хотим, чтобы каждая покупка вас радовала. Если что-то не подошло — поможем с обменом или возвратом.</p>' +
      '<h2>Сроки</h2><p>Вернуть товар надлежащего качества можно в течение <b>14 дней</b> с момента получения, если он не был в использовании и сохранил товарный вид.</p>' +
      '<h2>Особенности тканей</h2><p>Согласно законодательству, отрезы ткани, отрезанные по индивидуальному заказу, возврату и обмену не подлежат (товар, изготовленный по индивидуальным меркам), кроме случаев брака.</p>' +
      '<h2>Если товар с браком</h2><p>Сфотографируйте дефект и свяжитесь с нами по телефону +7 914 359-27-67. Мы заменим товар или вернём деньги, а доставку брака оплатим сами.</p>' +
      '<h2>Как оформить возврат</h2><ul><li>Позвоните нам или напишите в чат поддержки</li><li>Опишите причину и приложите фото</li><li>Согласуем способ возврата средств</li></ul>' +
      '</div></div>' };
  }
  function viewAbout() {
    return { html: '<div class="container"><div class="content-page">' +
      '<h1>О магазине МАТРЁШКА</h1>' +
      '<p>МАТРЁШКА — это магазин качественных тканей и фурнитуры из Читы. Мы начинали как небольшой семейный магазинчик для местных рукодельниц, а сегодня отправляем заказы по всей России.</p>' +
      '<h2>Наша миссия</h2><p>Сделать качественные материалы для шитья и рукоделия доступными в любом уголке страны. Мы лично отбираем каждый рулон ткани и честно описываем состав, ширину и плотность.</p>' +
      '<h2>Почему выбирают нас</h2>' +
      '<div class="info-cards">' +
        '<div class="info-card"><div class="emoji">🧵</div><h3>Только проверенное</h3><p>Работаем напрямую с производителями и проверяем качество.</p></div>' +
        '<div class="info-card"><div class="emoji">✂️</div><h3>Отрез под проект</h3><p>Отрежем ткань нужной длины — не нужно покупать лишнее.</p></div>' +
        '<div class="info-card"><div class="emoji">❤️</div><h3>Персональный подход</h3><p>Поможем подобрать материалы и фурнитуру под вашу задачу.</p></div>' +
      '</div>' +
      '<h2>Контакты</h2><p>📍 г. Чита, ул. Бутина 44, помещение 1<br/>📞 <a href="tel:+79143592767" style="color:var(--red)">+7 914 359-27-67</a><br/>🕙 Пн–Сб: 10:00–19:00</p>' +
      '</div></div>' };
  }
  function viewContacts() {
    return { html: '<div class="container"><div class="content-page" style="max-width:1100px">' +
      '<h1>Контакты</h1>' +
      '<div class="contacts-grid">' +
        '<div>' +
          '<div class="panel-card"><h3 style="margin-top:0">Магазин в Чите</h3>' +
          '<p>📍 <b>Адрес:</b> г. Чита, ул. Бутина 44, помещение 1</p>' +
          '<p>📞 <b>Телефон:</b> <a href="tel:+79143592767" style="color:var(--red)">+7 914 359-27-67</a></p>' +
          '<p>🕙 <b>Часы работы:</b> Пн–Сб 10:00–19:00, Вс — выходной</p>' +
          '<p>🚚 <b>Доставка:</b> по всей России (СДЭК, Почта России)</p></div>' +
          '<div class="panel-card"><h3 style="margin-top:0">Написать нам</h3>' +
          '<form id="contactForm"><div class="field"><label>Имя</label><input id="ct-name" required/></div>' +
          '<div class="field"><label>Телефон</label><input id="ct-phone" required/></div>' +
          '<div class="field"><label>Сообщение</label><textarea id="ct-msg" required></textarea></div>' +
          '<button class="btn btn--primary btn--block" type="submit">Отправить</button></form></div>' +
        '</div>' +
        '<div class="map-embed">' +
          '<iframe loading="lazy" title="Карта — Чита, ул. Бутина 44" src="https://yandex.ru/map-widget/v1/?ll=113.499%2C52.033&z=16&text=' + encodeURIComponent('Чита, улица Бутина, 44') + '"></iframe>' +
        '</div>' +
      '</div>' +
      '</div></div>',
      mount: function () {
        document.getElementById('contactForm').onsubmit = function (e) {
          e.preventDefault(); this.reset(); U.toast('Спасибо! Мы свяжемся с вами.', 'success');
        };
      } };
  }
  function viewFaq() {
    var faqs = [
      ['Доставляете ли вы в мой город?', 'Да, мы доставляем по всей России через СДЭК и Почту России — в любой населённый пункт, где есть почтовое отделение или пункт выдачи.'],
      ['Можно ли заказать отрез ткани нужной длины?', 'Да! Для тканей вы выбираете длину отреза с шагом 0,1 м (минимум 0,5 м) прямо на странице товара. Мы отрежем ровно столько, сколько нужно.'],
      ['Какие способы оплаты доступны?', 'Онлайн-оплата картой (МИР), СБП по QR-коду и наличными при получении. Visa и MasterCard не принимаем.'],
      ['Когда доставка бесплатная?', 'При заказе от ' + U.money(U.FREE_SHIPPING_FROM) + ' доставка по России бесплатна (СДЭК и Почта России).'],
      ['Как отследить заказ?', 'Зарегистрируйтесь и войдите в личный кабинет — в разделе «Мои заказы» отображается актуальный статус каждого заказа.'],
      ['Можно ли вернуть товар?', 'Товар надлежащего качества можно вернуть в течение 14 дней. Отрезы ткани по индивидуальному заказу возврату не подлежат, кроме случаев брака.'],
      ['Даёт ли магазин бонусы?', 'Да, мы возвращаем 5% бонусами с каждого заказа и дарим 200 бонусов за регистрацию. Бонусами можно оплатить до 30% заказа.']
    ];
    return { html: '<div class="container"><div class="content-page">' +
      '<h1>Частые вопросы</h1>' +
      faqs.map(function (f, i) {
        return '<div class="faq-item"><div class="faq-q" data-faq="' + i + '">' + f[0] + '<span>+</span></div><div class="faq-a" hidden>' + f[1] + '</div></div>';
      }).join('') +
      '</div></div>',
      mount: function () {
        document.querySelectorAll('[data-faq]').forEach(function (q) {
          q.onclick = function () {
            var a = q.nextElementSibling;
            a.hidden = !a.hidden;
            q.querySelector('span').textContent = a.hidden ? '+' : '−';
          };
        });
      } };
  }
  function viewBlog(slug) {
    if (slug) {
      var post = DATA.BLOG.filter(function (b) { return b.id === slug; })[0];
      if (!post) return viewNotFound();
      return { html: '<div class="container"><div class="content-page">' +
        '<div class="breadcrumbs"><a href="#/blog">Блог</a><span>/</span>' + U.esc(post.title) + '</div>' +
        '<div style="font-size:3rem">' + post.emoji + '</div><h1>' + U.esc(post.title) + '</h1>' +
        '<p>' + U.esc(post.body) + '</p>' +
        '<a class="btn btn--outline" href="#/blog">← Все статьи</a>' +
        '</div></div>' };
    }
    return { html: '<div class="container section"><div class="section-head"><h2>Блог и советы по рукоделию</h2></div>' +
      '<div class="blog-grid">' + DATA.BLOG.map(function (b) {
        return '<a class="blog-card" href="#/blog/' + b.id + '"><div class="bc-img">' + b.emoji + '</div>' +
          '<div class="bc-body"><h3>' + U.esc(b.title) + '</h3><p>' + U.esc(b.excerpt) + '</p></div></a>';
      }).join('') + '</div></div>' };
  }
  function viewNotFound() {
    return { html: '<div class="container"><div class="empty"><div class="emoji">🧭</div><h3>Страница не найдена</h3><a class="btn btn--primary" href="#/">На главную</a></div></div>' };
  }

  /* ============================================================
     AUTH MODAL
  ============================================================ */
  function openAuth(mode) {
    mode = mode || 'login';
    function formHtml(m) {
      if (m === 'login') {
        return '<form id="authForm">' +
          '<div class="field"><label>Телефон</label><input id="au-phone" required placeholder="+7 ___ ___-__-__"/></div>' +
          '<div class="field"><label>Пароль</label><input id="au-pass" type="password" required/></div>' +
          '<div class="field err" id="au-err" hidden></div>' +
          '<button class="btn btn--primary btn--block btn--lg" type="submit">Войти</button>' +
        '</form>';
      }
      return '<form id="authForm">' +
        '<div class="field"><label>Имя</label><input id="au-name" required/></div>' +
        '<div class="field"><label>Телефон</label><input id="au-phone" required placeholder="+7 ___ ___-__-__"/></div>' +
        '<div class="field"><label>Пароль</label><input id="au-pass" type="password" required minlength="4"/><div class="hint">Минимум 4 символа</div></div>' +
        '<div class="field err" id="au-err" hidden></div>' +
        '<button class="btn btn--primary btn--block btn--lg" type="submit">Зарегистрироваться</button>' +
        '<p class="hint" style="text-align:center;margin-top:10px">Дарим 200 бонусов за регистрацию 🎁</p>' +
      '</form>';
    }
    var body =
      '<div class="auth-tabs"><button data-am="login"' + (mode === 'login' ? ' class="active"' : '') + '>Вход</button>' +
      '<button data-am="register"' + (mode === 'register' ? ' class="active"' : '') + '>Регистрация</button></div>' +
      '<div id="authFormWrap">' + formHtml(mode) + '</div>';

    var m = U.modal(body, {
      title: 'Личный кабинет',
      onOpen: function (root, close) {
        function bind() {
          root.querySelector('#authForm').onsubmit = function (e) {
            e.preventDefault();
            var err = root.querySelector('#au-err');
            try {
              if (mode === 'login') {
                Store.login(root.querySelector('#au-phone').value, root.querySelector('#au-pass').value);
              } else {
                Store.register({ name: root.querySelector('#au-name').value, phone: root.querySelector('#au-phone').value, password: root.querySelector('#au-pass').value });
              }
              close();
              U.toast('Добро пожаловать!', 'success');
              go('#/account');
            } catch (ex) {
              err.textContent = ex.message; err.hidden = false;
            }
          };
        }
        root.querySelectorAll('[data-am]').forEach(function (b) {
          b.onclick = function () {
            mode = b.getAttribute('data-am');
            root.querySelectorAll('[data-am]').forEach(function (x) { x.classList.toggle('active', x === b); });
            root.querySelector('#authFormWrap').innerHTML = formHtml(mode);
            bind();
          };
        });
        bind();
      }
    });
  }

  /* ============================================================
     HEADER / GLOBAL BINDINGS
  ============================================================ */
  function refreshBadges() {
    var cc = Store.cartCount();
    var cb = document.getElementById('cartCount');
    cb.textContent = cc; cb.hidden = cc === 0;
    var fc = Store.getFavorites().length;
    var fb = document.getElementById('favCount');
    fb.textContent = fc; fb.hidden = fc === 0;
  }
  function closeMobileNav() { document.getElementById('mainNav').classList.remove('open'); }

  function bindHeader() {
    // search
    document.getElementById('headerSearch').onsubmit = function (e) {
      e.preventDefault();
      var q = document.getElementById('searchInput').value.trim();
      go('#/catalog?q=' + encodeURIComponent(q));
    };
    // account button -> if not logged, open auth
    document.getElementById('accountBtn').onclick = function (e) {
      if (!Store.currentUser()) { e.preventDefault(); openAuth('login'); }
    };
    // burger
    document.getElementById('burgerBtn').onclick = function () {
      document.getElementById('mainNav').classList.toggle('open');
    };
    // kebab admin menu
    var kebab = document.getElementById('kebabBtn'), menu = document.getElementById('kebabMenu');
    kebab.onclick = function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; kebab.setAttribute('aria-expanded', !menu.hidden); };
    document.addEventListener('click', function () { menu.hidden = true; kebab.setAttribute('aria-expanded', 'false'); });
    menu.onclick = function (e) { e.stopPropagation(); };
    document.getElementById('menuEditCatalog').onclick = function () { menu.hidden = true; Admin.openAdmin(); };
    document.getElementById('menuModeration').onclick = function () { menu.hidden = true; Admin.openModeration(); };

    // support chat
    var fab = document.getElementById('supportFab'), panel = document.getElementById('supportPanel');
    var body = document.getElementById('supportBody');
    var greeted = false;
    fab.onclick = function () {
      panel.hidden = !panel.hidden;
      if (!greeted) { addChat('bot', 'Здравствуйте! Это поддержка МАТРЁШКА 🧵 Чем можем помочь? Спросите про доставку, оплату, отрезы тканей или возврат.'); greeted = true; }
    };
    document.getElementById('supportClose').onclick = function () { panel.hidden = true; };
    document.getElementById('supportForm').onsubmit = function (e) {
      e.preventDefault();
      var inp = document.getElementById('supportInput');
      var q = inp.value.trim(); if (!q) return;
      addChat('user', q); inp.value = '';
      setTimeout(function () { addChat('bot', botReply(q)); }, 500);
    };
    function addChat(who, text) {
      var d = document.createElement('div'); d.className = 'chat-msg ' + who; d.textContent = text;
      body.appendChild(d); body.scrollTop = body.scrollHeight;
    }
  }
  function botReply(q) {
    q = q.toLowerCase();
    if (/достав|сдэк|почт|когда/.test(q)) return 'Доставляем по всей России: СДЭК и Почта России. От ' + UI.money(UI.FREE_SHIPPING_FROM) + ' — бесплатно. Срок 1–10 дней в зависимости от региона.';
    if (/оплат|карт|сбп|налич/.test(q)) return 'Оплата: картой онлайн (МИР), СБП по QR-коду или наличными при получении.';
    if (/возврат|обмен|брак/.test(q)) return 'Возврат товара надлежащего качества — в течение 14 дней. При браке заменим товар и оплатим доставку. Подробнее на странице «Возврат и обмен».';
    if (/отрез|метр|длин|ткан/.test(q)) return 'Ткань режем под ваш проект: выберите длину отреза на странице товара (от 0,5 м, шаг 0,1 м).';
    if (/бонус|скидк/.test(q)) return 'Возвращаем 5% бонусами с заказа и дарим 200 бонусов за регистрацию. Бонусами можно оплатить до 30% заказа.';
    if (/адрес|чита|магазин|где/.test(q)) return 'Наш магазин: г. Чита, ул. Бутина 44, помещение 1. Телефон +7 914 359-27-67.';
    return 'Спасибо за вопрос! Позвоните нам по +7 914 359-27-67 — поможем подобрать ткани и фурнитуру. Также загляните в раздел FAQ.';
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    Store.seedIfNeeded();
    document.getElementById('year').textContent = new Date().getFullYear();
    bindHeader();
    refreshBadges();

    Store.on('cart:changed', refreshBadges);
    Store.on('favorites:changed', refreshBadges);
    Store.on('auth:changed', function () { if (location.hash.indexOf('/account') >= 0) render(); });
    // background incoming orders -> toast notification anywhere
    Store.on('orders:incoming', function (o) {
      if (!document.querySelector('.modal')) {
        // only notify globally if moderation panel isn't already handling it
      }
    });

    window.addEventListener('hashchange', render);
    render();

    // register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  global.App = { openAuth: openAuth, render: render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
