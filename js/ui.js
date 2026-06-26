/* ===================== MATRESHKA — UI helpers ===================== */
(function (global) {
  'use strict';
  var DATA = global.MATRESHKA_DATA;

  function money(n) {
    return Math.round(n).toLocaleString('ru-RU') + ' ₽';
  }
  function esc(s) {
    return ('' + (s == null ? '' : s)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function catName(id) {
    var c = DATA.CATEGORIES.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : id;
  }
  function colorMeta(id) {
    return DATA.COLORS.filter(function (x) { return x.id === id; })[0] || { name: id, hex: '#ccc' };
  }
  function unitLabel(unit) { return unit === 'm' ? '₽/м' : '₽/шт'; }

  /* ---- toast ---- */
  function toast(msg, type) {
    var root = document.getElementById('toastRoot');
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .3s'; el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  /* ---- modal ---- */
  function modal(html, opts) {
    opts = opts || {};
    var root = document.getElementById('modalRoot');
    root.hidden = false;
    root.innerHTML = '<div class="modal ' + (opts.cls || '') + '">' +
      '<div class="modal-head"><h3>' + esc(opts.title || '') + '</h3>' +
      '<button class="modal-close" aria-label="Закрыть">&times;</button></div>' +
      '<div class="modal-body">' + html + '</div></div>';
    function close() { root.hidden = true; root.innerHTML = ''; if (opts.onClose) opts.onClose(); }
    root.querySelector('.modal-close').onclick = close;
    root.onclick = function (e) { if (e.target === root && opts.dismissable !== false) close(); };
    if (opts.onOpen) opts.onOpen(root, close);
    return { root: root, close: close };
  }
  function closeModal() {
    var root = document.getElementById('modalRoot');
    root.hidden = true; root.innerHTML = '';
  }

  /* ---- order status meta ---- */
  var STATUS = {
    'new': { label: 'Новый', cls: 'st-new', step: 0 },
    'processing': { label: 'В обработке', cls: 'st-processing', step: 1 },
    'shipped': { label: 'Отправлен', cls: 'st-shipped', step: 2 },
    'delivered': { label: 'Доставлен', cls: 'st-delivered', step: 3 },
    'cancelled': { label: 'Отменён', cls: 'st-cancelled', step: -1 }
  };
  var STATUS_FLOW = ['new', 'processing', 'shipped', 'delivered'];
  function statusPill(status) {
    var s = STATUS[status] || STATUS['new'];
    return '<span class="status-pill ' + s.cls + '">' + s.label + '</span>';
  }

  /* ---- delivery: regions & calculator ---- */
  var REGIONS = [
    { id: 'chita', name: 'Чита и Забайкальский край', baseCdek: 0, basePost: 0, days: '1–2 дня', factor: 0 },
    { id: 'sibir', name: 'Сибирь (Иркутск, Красноярск, Новосибирск)', factor: 1, days: '3–5 дней' },
    { id: 'ural', name: 'Урал (Екатеринбург, Челябинск)', factor: 1.4, days: '4–6 дней' },
    { id: 'center', name: 'Центр (Москва, СПб)', factor: 1.8, days: '5–8 дней' },
    { id: 'south', name: 'Юг (Краснодар, Ростов)', factor: 1.9, days: '6–9 дней' },
    { id: 'dv', name: 'Дальний Восток (Владивосток, Хабаровск)', factor: 0.8, days: '2–4 дня' },
    { id: 'other', name: 'Другой регион России', factor: 1.6, days: '5–10 дней' }
  ];
  var FREE_SHIPPING_FROM = 5000;
  // method: 'cdek' | 'post' | 'pickup'
  function deliveryCost(regionId, method, subtotal) {
    if (method === 'pickup') return { cost: 0, days: 'Сегодня', label: 'Самовывоз, Чита' };
    var r = REGIONS.filter(function (x) { return x.id === regionId; })[0] || REGIONS[0];
    if (subtotal >= FREE_SHIPPING_FROM && method !== 'pickup') {
      return { cost: 0, days: r.days, label: (method === 'cdek' ? 'СДЭК' : 'Почта России') + ' · бесплатно' };
    }
    var base = method === 'cdek' ? 350 : 250;
    var cost = Math.round((base + base * (r.factor || 0)) / 10) * 10;
    if (r.id === 'chita') cost = method === 'cdek' ? 150 : 100;
    return { cost: cost, days: r.days, label: method === 'cdek' ? 'СДЭК' : 'Почта России' };
  }

  /* ---- product card ---- */
  function productCard(p) {
    var fav = Store.isFavorite(p.id);
    var stockCls = p.stock <= 0 ? 'out-stock' : p.stock < 10 ? 'low-stock' : 'in-stock';
    var stockTxt = p.stock <= 0 ? 'Нет в наличии' : p.stock < 10 ? 'Осталось мало' : 'В наличии';
    var badges = (p.tags || []).map(function (t) {
      if (t === 'new') return '<span class="tag tag--new">Новинка</span>';
      if (t === 'hit') return '<span class="tag tag--hit">Хит</span>';
      if (t === 'sale') return '<span class="tag tag--sale">Скидка</span>';
      return '';
    }).join('');
    var meta = p.cat === 'fabric'
      ? esc(p.fabricType) + ' · ' + (p.width || '—') + ' см'
      : esc(p.composition || '');
    return '<article class="product-card" data-id="' + p.id + '">' +
      '<a class="pc-media" href="#/product/' + p.id + '">' +
        '<img loading="lazy" src="' + p.images[0] + '" alt="' + esc(p.name) + '"/>' +
        '<div class="pc-badges">' + badges + '</div>' +
      '</a>' +
      '<button class="pc-fav' + (fav ? ' active' : '') + '" data-fav="' + p.id + '" aria-label="В избранное">' +
        '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' +
      '</button>' +
      '<div class="pc-body">' +
        '<span class="pc-cat">' + catName(p.cat) + '</span>' +
        '<a class="pc-title" href="#/product/' + p.id + '">' + esc(p.name) + '</a>' +
        '<span class="pc-meta">' + meta + '</span>' +
        '<div class="pc-foot">' +
          '<span class="pc-price">' +
            (p.oldPrice ? '<span class="pc-old">' + money(p.oldPrice) + '</span>' : '') +
            money(p.price) + ' <small>' + (p.unit === 'm' ? '/м' : '/шт') + '</small></span>' +
          '<span class="pc-stock ' + stockCls + '">' + stockTxt + '</span>' +
        '</div>' +
        '<button class="btn btn--primary btn--sm btn--block" data-add="' + p.id + '"' + (p.stock <= 0 ? ' disabled' : '') + '>' +
          (p.stock <= 0 ? 'Нет в наличии' : 'В корзину') + '</button>' +
      '</div>' +
    '</article>';
  }

  // delegated handlers for product cards (fav + quick add) — bound once
  function bindCardActions(container) {
    container.addEventListener('click', function (e) {
      var fav = e.target.closest('[data-fav]');
      if (fav) {
        var added = Store.toggleFavorite(fav.getAttribute('data-fav'));
        fav.classList.toggle('active', added);
        toast(added ? 'Добавлено в избранное' : 'Удалено из избранного');
        return;
      }
      var add = e.target.closest('[data-add]');
      if (add && !add.disabled) {
        var pid = add.getAttribute('data-add');
        var prod = Store.getProduct(pid);
        if (prod.unit === 'm') { location.hash = '#/product/' + pid; return; } // choose length on PDP
        Store.addToCart(pid, 1, null);
        toast('Товар добавлен в корзину', 'success');
      }
    });
  }

  global.UI = {
    money: money, esc: esc, catName: catName, colorMeta: colorMeta, unitLabel: unitLabel,
    toast: toast, modal: modal, closeModal: closeModal,
    STATUS: STATUS, STATUS_FLOW: STATUS_FLOW, statusPill: statusPill,
    REGIONS: REGIONS, FREE_SHIPPING_FROM: FREE_SHIPPING_FROM, deliveryCost: deliveryCost,
    productCard: productCard, bindCardActions: bindCardActions
  };
})(window);
