/* ===================== MATRESHKA — admin & moderation ===================== */
(function (global) {
  'use strict';
  var DATA = global.MATRESHKA_DATA, U = global.UI;

  // session-scoped unlock so re-opening within a tab doesn't re-prompt
  var unlocked = { admin: false, mod: false };

  function requirePassword(kind, title, then) {
    if (unlocked[kind]) { then(); return; }
    U.modal(
      '<form id="pwForm">' +
        '<p style="margin-top:0;color:var(--gray-700)">Доступ защищён. Введите пароль администратора.</p>' +
        '<div class="field"><label>Пароль</label>' +
        '<input type="password" id="pwInput" inputmode="numeric" autocomplete="off" autofocus /></div>' +
        '<div class="field err" id="pwErr" hidden>Неверный пароль</div>' +
        '<button class="btn btn--primary btn--block" type="submit">Войти</button>' +
      '</form>',
      {
        title: title, cls: 'modal',
        onOpen: function (root, close) {
          root.querySelector('#pwForm').onsubmit = function (e) {
            e.preventDefault();
            var val = root.querySelector('#pwInput').value.trim();
            if (val === DATA.ADMIN_PASSWORD) {
              unlocked[kind] = true; close(); then();
            } else {
              root.querySelector('#pwErr').hidden = false;
              root.querySelector('#pwInput').value = '';
            }
          };
        }
      }
    );
  }

  /* ============================================================
     ADMIN — CATALOG EDITOR
  ============================================================ */
  function openAdmin() {
    requirePassword('admin', 'Редактирование каталога', renderAdmin);
  }

  function renderAdmin() {
    var products = Store.getProducts().sort(byOrder);
    var body =
      '<div class="admin-toolbar">' +
        '<input type="search" id="aSearch" class="grow" placeholder="Поиск по названию…" />' +
        '<select id="aCat"><option value="">Все категории</option>' +
          DATA.CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('') +
        '</select>' +
        '<button class="btn btn--primary btn--sm" id="aAdd">+ Добавить товар</button>' +
      '</div>' +
      '<p style="font-size:.82rem;color:var(--gray-500);margin:0 0 10px">Перетаскивайте строки за ⠿, чтобы изменить порядок товаров в каталоге.</p>' +
      '<div class="table-wrap"><table class="data-table"><thead><tr>' +
        '<th style="width:30px"></th><th style="width:54px">Фото</th><th>Название</th><th>Категория</th>' +
        '<th>Цена</th><th>Остаток</th><th style="width:150px">Действия</th>' +
      '</tr></thead><tbody id="aRows"></tbody></table></div>';

    var m = U.modal(body, { title: 'Панель администратора · Каталог', cls: 'modal--wide' });
    var root = m.root;

    function draw() {
      var q = (root.querySelector('#aSearch').value || '').toLowerCase();
      var cat = root.querySelector('#aCat').value;
      var list = Store.getProducts().sort(byOrder).filter(function (p) {
        return (!q || p.name.toLowerCase().indexOf(q) >= 0) && (!cat || p.cat === cat);
      });
      root.querySelector('#aRows').innerHTML = list.map(function (p) {
        return '<tr class="reorder-row" draggable="true" data-id="' + p.id + '">' +
          '<td style="cursor:grab;color:var(--gray-500)">⠿</td>' +
          '<td><img src="' + p.images[0] + '" alt=""/></td>' +
          '<td>' + U.esc(p.name) + '</td>' +
          '<td>' + U.catName(p.cat) + '</td>' +
          '<td>' + U.money(p.price) + ' ' + (p.unit === 'm' ? '/м' : '/шт') + '</td>' +
          '<td><input type="number" min="0" value="' + p.stock + '" data-stock="' + p.id + '" style="width:70px;padding:.3em;border:1px solid var(--gray-300);border-radius:6px"/></td>' +
          '<td><button class="mini-btn" data-edit="' + p.id + '">Изменить</button>' +
              '<button class="mini-btn danger" data-del="' + p.id + '">Удалить</button></td>' +
        '</tr>';
      }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--gray-500);padding:24px">Ничего не найдено</td></tr>';
      bindRows(root, draw);
    }

    root.querySelector('#aSearch').oninput = draw;
    root.querySelector('#aCat').onchange = draw;
    root.querySelector('#aAdd').onclick = function () { openProductForm(null, function () { renderAdmin(); }); };
    draw();
  }

  function bindRows(root, redraw) {
    // stock inline edit
    root.querySelectorAll('[data-stock]').forEach(function (inp) {
      inp.onchange = function () {
        var p = Store.getProduct(inp.getAttribute('data-stock'));
        p.stock = Math.max(0, parseInt(inp.value, 10) || 0);
        Store.upsertProduct(p);
        U.toast('Остаток обновлён', 'success');
      };
    });
    root.querySelectorAll('[data-edit]').forEach(function (b) {
      b.onclick = function () { openProductForm(Store.getProduct(b.getAttribute('data-edit')), function () { renderAdmin(); }); };
    });
    root.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = function () {
        var p = Store.getProduct(b.getAttribute('data-del'));
        if (confirm('Удалить товар «' + p.name + '»?')) { Store.deleteProduct(p.id); U.toast('Товар удалён'); redraw(); }
      };
    });
    // drag reorder
    var dragId = null;
    root.querySelectorAll('.reorder-row').forEach(function (row) {
      row.ondragstart = function () { dragId = row.getAttribute('data-id'); row.classList.add('dragging'); };
      row.ondragend = function () { row.classList.remove('dragging'); root.querySelectorAll('.over').forEach(function (r) { r.classList.remove('over'); }); };
      row.ondragover = function (e) { e.preventDefault(); row.classList.add('over'); };
      row.ondragleave = function () { row.classList.remove('over'); };
      row.ondrop = function (e) {
        e.preventDefault();
        var targetId = row.getAttribute('data-id');
        if (!dragId || dragId === targetId) return;
        reorder(dragId, targetId);
        redraw();
      };
    });
  }

  function reorder(dragId, targetId) {
    var list = Store.getProducts().sort(byOrder);
    var from = list.findIndex(function (p) { return p.id === dragId; });
    var to = list.findIndex(function (p) { return p.id === targetId; });
    var moved = list.splice(from, 1)[0];
    list.splice(to, 0, moved);
    list.forEach(function (p, i) { p.order = i; });
    Store.saveProducts(list);
  }
  function byOrder(a, b) { return (a.order || 0) - (b.order || 0); }

  /* ---- product add/edit form with drag-drop image upload ---- */
  function openProductForm(prod, onSaved) {
    var isNew = !prod;
    prod = prod || { id: Store.newProductId(), cat: 'fabric', unit: 'm', images: [], tags: [], stock: 0, popularity: 50 };
    var images = (prod.images || []).slice();

    var body =
      '<form id="pForm">' +
        '<div class="field"><label>Название *</label><input id="pf-name" required value="' + U.esc(prod.name || '') + '"/></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Категория</label><select id="pf-cat">' +
            DATA.CATEGORIES.map(function (c) { return '<option value="' + c.id + '"' + (prod.cat === c.id ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label>Единица</label><select id="pf-unit">' +
            '<option value="pc"' + (prod.unit === 'pc' ? ' selected' : '') + '>За штуку</option>' +
            '<option value="m"' + (prod.unit === 'm' ? ' selected' : '') + '>За метр (отрез)</option>' +
          '</select></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Цена, ₽ *</label><input id="pf-price" type="number" min="0" required value="' + (prod.price || '') + '"/></div>' +
          '<div class="field"><label>Старая цена, ₽</label><input id="pf-old" type="number" min="0" value="' + (prod.oldPrice || '') + '"/></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Остаток на складе</label><input id="pf-stock" type="number" min="0" value="' + (prod.stock || 0) + '"/></div>' +
          '<div class="field"><label>Цвет</label><select id="pf-color">' +
            DATA.COLORS.map(function (c) { return '<option value="' + c.id + '"' + (prod.color === c.id ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') +
          '</select></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Тип ткани</label><input id="pf-ftype" list="ftypes" value="' + U.esc(prod.fabricType || '') + '" placeholder="напр. Хлопок"/>' +
            '<datalist id="ftypes">' + DATA.FABRIC_TYPES.map(function (t) { return '<option value="' + t + '">'; }).join('') + '</datalist></div>' +
          '<div class="field"><label>Ширина, см</label><input id="pf-width" type="number" min="0" value="' + (prod.width || '') + '"/></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Плотность, г/м²</label><input id="pf-density" type="number" min="0" value="' + (prod.density || '') + '"/></div>' +
          '<div class="field"><label>Состав</label><input id="pf-comp" value="' + U.esc(prod.composition || '') + '"/></div>' +
        '</div>' +
        '<div class="field"><label>Метки</label><div style="display:flex;gap:16px;flex-wrap:wrap">' +
          ['new:Новинка', 'hit:Хит', 'sale:Скидка'].map(function (t) {
            var v = t.split(':')[0];
            return '<label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" value="' + v + '" class="pf-tag"' +
              ((prod.tags || []).indexOf(v) >= 0 ? ' checked' : '') + '/> ' + t.split(':')[1] + '</label>';
          }).join('') +
        '</div></div>' +
        '<div class="field"><label>Описание</label><textarea id="pf-desc">' + U.esc(prod.desc || '') + '</textarea></div>' +
        '<div class="field"><label>Рекомендации по уходу</label><input id="pf-care" value="' + U.esc(prod.care || '') + '"/></div>' +
        '<div class="field"><label>Фотографии товара</label>' +
          '<div class="dropzone" id="pf-drop">Перетащите фото сюда или нажмите, чтобы выбрать файлы<br/><small>JPG, PNG · можно несколько</small></div>' +
          '<input type="file" id="pf-file" accept="image/*" multiple hidden />' +
          '<div class="img-previews" id="pf-previews"></div>' +
        '</div>' +
        '<button class="btn btn--primary btn--block btn--lg" type="submit">' + (isNew ? 'Добавить товар' : 'Сохранить изменения') + '</button>' +
      '</form>';

    var m = U.modal(body, { title: isNew ? 'Новый товар' : 'Редактирование товара', cls: 'modal--mid' });
    var root = m.root;

    function drawPreviews() {
      root.querySelector('#pf-previews').innerHTML = images.map(function (src, i) {
        return '<div class="img-preview"><img src="' + src + '"/><button type="button" data-rm="' + i + '">×</button></div>';
      }).join('');
      root.querySelectorAll('[data-rm]').forEach(function (b) {
        b.onclick = function () { images.splice(parseInt(b.getAttribute('data-rm'), 10), 1); drawPreviews(); };
      });
    }
    drawPreviews();

    var drop = root.querySelector('#pf-drop'), file = root.querySelector('#pf-file');
    drop.onclick = function () { file.click(); };
    file.onchange = function () { handleFiles(file.files); };
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); });
    });
    drop.addEventListener('drop', function (e) { handleFiles(e.dataTransfer.files); });

    function handleFiles(files) {
      Array.prototype.forEach.call(files, function (f) {
        if (!/^image\//.test(f.type)) return;
        var reader = new FileReader();
        reader.onload = function () { images.push(reader.result); drawPreviews(); };
        reader.readAsDataURL(f);
      });
    }

    root.querySelector('#pForm').onsubmit = function (e) {
      e.preventDefault();
      var price = parseFloat(root.querySelector('#pf-price').value);
      if (!root.querySelector('#pf-name').value.trim() || !(price >= 0)) { U.toast('Заполните название и цену', 'error'); return; }
      if (!images.length) images = [DATA.swatch('фото', '#c8102e', '#7d0b1a', 'weave')];

      var saved = {
        id: prod.id, order: prod.order,
        cat: root.querySelector('#pf-cat').value,
        unit: root.querySelector('#pf-unit').value,
        name: root.querySelector('#pf-name').value.trim(),
        price: price,
        oldPrice: parseFloat(root.querySelector('#pf-old').value) || null,
        stock: parseInt(root.querySelector('#pf-stock').value, 10) || 0,
        color: root.querySelector('#pf-color').value,
        fabricType: root.querySelector('#pf-ftype').value.trim() || null,
        width: parseInt(root.querySelector('#pf-width').value, 10) || null,
        density: parseInt(root.querySelector('#pf-density').value, 10) || null,
        composition: root.querySelector('#pf-comp').value.trim(),
        desc: root.querySelector('#pf-desc').value.trim(),
        care: root.querySelector('#pf-care').value.trim(),
        tags: Array.prototype.map.call(root.querySelectorAll('.pf-tag:checked'), function (c) { return c.value; }),
        popularity: prod.popularity || 50,
        images: images
      };
      Store.upsertProduct(saved);
      U.toast(isNew ? 'Товар добавлен' : 'Изменения сохранены', 'success');
      if (onSaved) onSaved();
    };
  }

  /* ============================================================
     MODERATION — ORDERS
  ============================================================ */
  function openModeration() {
    requirePassword('mod', 'Вход в модерацию', renderModeration);
  }

  var modRefresh = null;
  function renderModeration() {
    var body =
      '<div class="stat-grid" id="mStats"></div>' +
      '<div class="admin-toolbar">' +
        '<input type="search" id="mSearch" class="grow" placeholder="Поиск: № заказа, имя, телефон…" />' +
        '<select id="mStatus"><option value="">Все статусы</option>' +
          U.STATUS_FLOW.concat(['cancelled']).map(function (s) { return '<option value="' + s + '">' + U.STATUS[s].label + '</option>'; }).join('') +
        '</select>' +
        '<input type="date" id="mDate" />' +
        '<button class="btn btn--dark btn--sm" id="mExport">⬇ Экспорт CSV</button>' +
      '</div>' +
      '<p style="font-size:.82rem;color:var(--green);margin:0 0 10px"><span class="live-dot"></span>Новые заказы поступают в реальном времени</p>' +
      '<div id="mList"></div>';

    var m = U.modal(body, {
      title: 'Панель модерации · Заказы', cls: 'modal--wide',
      onClose: function () { if (modRefresh) Store.on('orders:changed', function () {}); modRefresh = null; }
    });
    var root = m.root;

    function draw() {
      var q = (root.querySelector('#mSearch').value || '').toLowerCase();
      var st = root.querySelector('#mStatus').value;
      var date = root.querySelector('#mDate').value;
      var orders = Store.getOrders().filter(function (o) {
        if (st && o.status !== st) return false;
        if (date) { var d = new Date(o.createdAt); var iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); if (iso !== date) return false; }
        if (q) {
          var hay = ('#' + o.number + ' ' + o.customer.name + ' ' + o.customer.phone).toLowerCase();
          if (hay.indexOf(q) < 0) return false;
        }
        return true;
      });

      // stats (always over all orders)
      var all = Store.getOrders();
      var revenue = all.filter(function (o) { return o.status !== 'cancelled'; }).reduce(function (s, o) { return s + o.total; }, 0);
      root.querySelector('#mStats').innerHTML =
        stat(all.length, 'Всего заказов') +
        stat(all.filter(function (o) { return o.status === 'new'; }).length, 'Новых') +
        stat(all.filter(function (o) { return o.status === 'processing' || o.status === 'shipped'; }).length, 'В работе') +
        stat(U.money(revenue), 'Оборот');

      root.querySelector('#mList').innerHTML = orders.length ? orders.map(orderRow).join('') :
        '<div class="empty"><div class="emoji">📭</div><h3>Заказов не найдено</h3><p>Оформите заказ в магазине — он появится здесь мгновенно.</p></div>';

      // bind status selects
      root.querySelectorAll('[data-ostatus]').forEach(function (sel) {
        sel.onchange = function () { Store.updateOrderStatus(sel.getAttribute('data-ostatus'), sel.value); U.toast('Статус обновлён', 'success'); };
      });
      root.querySelectorAll('[data-toggle]').forEach(function (b) {
        b.onclick = function () {
          var el = root.querySelector('#det-' + b.getAttribute('data-toggle'));
          if (el) el.hidden = !el.hidden;
        };
      });
    }

    function orderRow(o) {
      var when = new Date(o.createdAt).toLocaleString('ru-RU');
      var items = o.items.map(function (i) {
        return '<tr><td>' + U.esc(i.name) + (i.meters ? ' (' + i.meters + ' м)' : '') + '</td><td>' + i.qty + ' шт</td><td>' + U.money(i.lineTotal) + '</td></tr>';
      }).join('');
      return '<div class="order-card">' +
        '<div class="order-card-head">' +
          '<span class="order-id">Заказ №' + o.number + '</span>' +
          '<span style="color:var(--gray-500);font-size:.85rem">' + when + '</span>' +
          U.statusPill(o.status) +
          '<select class="sort-select" data-ostatus="' + o.id + '" style="margin-left:auto">' +
            U.STATUS_FLOW.concat(['cancelled']).map(function (s) { return '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + U.STATUS[s].label + '</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<div style="display:flex;gap:24px;flex-wrap:wrap;font-size:.88rem;color:var(--gray-700)">' +
          '<span>👤 ' + U.esc(o.customer.name) + '</span>' +
          '<span>📞 ' + U.esc(o.customer.phone) + '</span>' +
          '<span>🚚 ' + U.esc(o.delivery.label) + ' · ' + U.esc(o.delivery.regionName) + '</span>' +
          '<span>💳 ' + U.esc(o.payment) + '</span>' +
          '<b>Итого: ' + U.money(o.total) + '</b>' +
          '<button class="mini-btn" data-toggle="' + o.id + '" style="margin-left:auto">Подробнее</button>' +
        '</div>' +
        '<div id="det-' + o.id + '" hidden style="margin-top:14px">' +
          '<p style="font-size:.85rem;margin:.3em 0"><b>Адрес:</b> ' + U.esc(o.delivery.address || '—') + '</p>' +
          (o.comment ? '<p style="font-size:.85rem;margin:.3em 0"><b>Комментарий:</b> ' + U.esc(o.comment) + '</p>' : '') +
          '<table class="data-table"><thead><tr><th>Товар</th><th>Кол-во</th><th>Сумма</th></tr></thead><tbody>' + items +
          '<tr><td colspan="2" style="text-align:right"><b>Доставка</b></td><td>' + U.money(o.delivery.cost) + '</td></tr>' +
          '<tr><td colspan="2" style="text-align:right"><b>Итого</b></td><td><b>' + U.money(o.total) + '</b></td></tr>' +
          '</tbody></table>' +
        '</div>' +
      '</div>';
    }

    root.querySelector('#mSearch').oninput = draw;
    root.querySelector('#mStatus').onchange = draw;
    root.querySelector('#mDate').onchange = draw;
    root.querySelector('#mExport').onclick = function () { exportCSV(); };
    draw();

    // live updates
    modRefresh = draw;
    Store.on('orders:incoming', function () { if (modRefresh) { modRefresh(); U.toast('🔔 Поступил новый заказ!', 'success'); } });
    Store.on('orders:changed', function () { if (modRefresh) modRefresh(); });
  }

  function exportCSV() {
    var orders = Store.getOrders();
    var rows = [['Номер', 'Дата', 'Клиент', 'Телефон', 'Статус', 'Доставка', 'Регион', 'Адрес', 'Оплата', 'Товары', 'Сумма доставки', 'Итого']];
    orders.forEach(function (o) {
      rows.push([
        o.number, new Date(o.createdAt).toLocaleString('ru-RU'), o.customer.name, o.customer.phone,
        U.STATUS[o.status].label, o.delivery.label, o.delivery.regionName, o.delivery.address || '',
        o.payment, o.items.map(function (i) { return i.name + (i.meters ? '(' + i.meters + 'м)' : '') + ' x' + i.qty; }).join('; '),
        o.delivery.cost, o.total
      ]);
    });
    var csv = '﻿' + rows.map(function (r) {
      return r.map(function (c) { return '"' + ('' + c).replace(/"/g, '""') + '"'; }).join(';');
    }).join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'matreshka_orders_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    U.toast('Заказы экспортированы в CSV', 'success');
  }

  function stat(v, l) { return '<div class="stat"><b>' + v + '</b><span>' + l + '</span></div>'; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  global.Admin = { openAdmin: openAdmin, openModeration: openModeration };
})(window);
