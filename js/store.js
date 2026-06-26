/* ===================== MATRESHKA — data store ===================== */
(function (global) {
  'use strict';
  var DATA = global.MATRESHKA_DATA;
  var K = {
    products: 'mtr_products',
    users: 'mtr_users',
    session: 'mtr_session',
    cart: 'mtr_cart',
    favorites: 'mtr_favorites',
    orders: 'mtr_orders',
    seq: 'mtr_order_seq'
  };

  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  /* ---- simple pub/sub so views re-render on change ---- */
  var subs = {};
  function on(evt, fn) { (subs[evt] = subs[evt] || []).push(fn); }
  function emit(evt, payload) { (subs[evt] || []).forEach(function (fn) { fn(payload); }); }

  /* ---- real-time order channel (cross-tab) ---- */
  var channel = null;
  try { channel = new BroadcastChannel('mtr_orders'); } catch (e) { channel = null; }
  if (channel) {
    channel.onmessage = function (ev) {
      if (ev.data && ev.data.type === 'new-order') emit('orders:incoming', ev.data.order);
      if (ev.data && ev.data.type === 'orders-changed') emit('orders:changed');
    };
  }
  // also listen to storage events (cross-tab fallback for non-BroadcastChannel browsers)
  global.addEventListener('storage', function (e) {
    if (e.key === K.orders) emit('orders:changed');
    if (e.key === K.products) emit('products:changed');
  });

  var Store = {
    K: K,

    /* ===== Products ===== */
    seedIfNeeded: function () {
      if (!localStorage.getItem(K.products)) {
        write(K.products, DATA.PRODUCTS.map(function (p, i) {
          var c = JSON.parse(JSON.stringify(p)); c.order = i; return c;
        }));
      }
    },
    getProducts: function () { return read(K.products, []); },
    getProduct: function (id) { return this.getProducts().filter(function (p) { return p.id === id; })[0]; },
    saveProducts: function (list) {
      write(K.products, list);
      emit('products:changed');
      if (channel) channel.postMessage({ type: 'orders-changed' }); // wake other tabs to refresh products too
    },
    upsertProduct: function (prod) {
      var list = this.getProducts();
      var idx = -1;
      list.forEach(function (p, i) { if (p.id === prod.id) idx = i; });
      if (idx >= 0) list[idx] = prod;
      else { prod.order = list.length; list.push(prod); }
      this.saveProducts(list);
    },
    deleteProduct: function (id) {
      this.saveProducts(this.getProducts().filter(function (p) { return p.id !== id; }));
    },
    newProductId: function () { return 'p-' + Date.now().toString(36) + Math.floor(Math.random() * 1000); },

    /* ===== Users / Auth ===== */
    getUsers: function () { return read(K.users, []); },
    findUser: function (phone) {
      var n = normalizePhone(phone);
      return this.getUsers().filter(function (u) { return u.phone === n; })[0];
    },
    register: function (data) {
      var users = this.getUsers();
      var phone = normalizePhone(data.phone);
      if (users.some(function (u) { return u.phone === phone; }))
        throw new Error('Пользователь с таким телефоном уже зарегистрирован');
      var user = {
        id: 'u-' + Date.now().toString(36),
        name: data.name.trim(),
        phone: phone,
        pass: hash(data.password),
        bonus: 200, // welcome bonus
        addresses: [],
        createdAt: Date.now()
      };
      users.push(user);
      write(K.users, users);
      this.setSession(user.id);
      return user;
    },
    login: function (phone, password) {
      var user = this.findUser(phone);
      if (!user || user.pass !== hash(password))
        throw new Error('Неверный телефон или пароль');
      this.setSession(user.id);
      return user;
    },
    setSession: function (uid) { write(K.session, uid); emit('auth:changed'); },
    logout: function () { localStorage.removeItem(K.session); emit('auth:changed'); },
    currentUser: function () {
      var uid = read(K.session, null);
      if (!uid) return null;
      return this.getUsers().filter(function (u) { return u.id === uid; })[0] || null;
    },
    updateUser: function (patch) {
      var users = this.getUsers(); var uid = read(K.session, null);
      users.forEach(function (u) { if (u.id === uid) Object.assign(u, patch); });
      write(K.users, users); emit('auth:changed');
      return this.currentUser();
    },

    /* ===== Cart ===== */
    getCart: function () { return read(K.cart, []); },
    addToCart: function (productId, qty, meters) {
      var cart = this.getCart();
      var key = productId + (meters ? ':' + meters : '');
      var existing = cart.filter(function (c) { return c.key === key; })[0];
      if (existing) existing.qty += qty;
      else cart.push({ key: key, productId: productId, qty: qty, meters: meters || null });
      write(K.cart, cart); emit('cart:changed');
    },
    setCartQty: function (key, qty) {
      var cart = this.getCart();
      cart.forEach(function (c) { if (c.key === key) c.qty = qty; });
      cart = cart.filter(function (c) { return c.qty > 0; });
      write(K.cart, cart); emit('cart:changed');
    },
    removeFromCart: function (key) {
      write(K.cart, this.getCart().filter(function (c) { return c.key !== key; }));
      emit('cart:changed');
    },
    clearCart: function () { write(K.cart, []); emit('cart:changed'); },
    cartCount: function () { return this.getCart().reduce(function (s, c) { return s + c.qty; }, 0); },
    cartDetailed: function () {
      var self = this;
      return this.getCart().map(function (c) {
        var p = self.getProduct(c.productId);
        if (!p) return null;
        var unitPrice = p.unit === 'm' && c.meters ? p.price * c.meters : p.price;
        return { key: c.key, product: p, qty: c.qty, meters: c.meters, unitPrice: unitPrice, lineTotal: unitPrice * c.qty };
      }).filter(Boolean);
    },
    cartSubtotal: function () {
      return this.cartDetailed().reduce(function (s, i) { return s + i.lineTotal; }, 0);
    },

    /* ===== Favorites ===== */
    getFavorites: function () { return read(K.favorites, []); },
    isFavorite: function (id) { return this.getFavorites().indexOf(id) >= 0; },
    toggleFavorite: function (id) {
      var f = this.getFavorites(); var i = f.indexOf(id);
      if (i >= 0) f.splice(i, 1); else f.push(id);
      write(K.favorites, f); emit('favorites:changed');
      return i < 0;
    },

    /* ===== Orders ===== */
    getOrders: function () { return read(K.orders, []); },
    nextOrderNumber: function () {
      var n = read(K.seq, 1000) + 1; write(K.seq, n); return n;
    },
    placeOrder: function (order) {
      order.number = this.nextOrderNumber();
      order.id = 'o-' + Date.now().toString(36);
      order.status = 'new';
      order.createdAt = Date.now();
      order.history = [{ status: 'new', at: Date.now() }];
      var orders = this.getOrders();
      orders.unshift(order);
      write(K.orders, orders);
      emit('orders:changed');
      emit('orders:incoming', order);
      if (channel) channel.postMessage({ type: 'new-order', order: order });
      return order;
    },
    updateOrderStatus: function (orderId, status) {
      var orders = this.getOrders();
      orders.forEach(function (o) {
        if (o.id === orderId) {
          o.status = status;
          o.history = o.history || [];
          o.history.push({ status: status, at: Date.now() });
        }
      });
      write(K.orders, orders);
      emit('orders:changed');
      if (channel) channel.postMessage({ type: 'orders-changed' });
    },
    userOrders: function () {
      var u = this.currentUser(); if (!u) return [];
      return this.getOrders().filter(function (o) { return o.userId === u.id; });
    },

    on: on,
    emit: emit
  };

  /* ---- helpers ---- */
  function normalizePhone(p) { return ('' + p).replace(/\D/g, '').replace(/^8/, '7'); }
  function hash(str) { // lightweight non-crypto hash — adequate for a demo client-side store
    var h = 5381; str = '' + str;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(16);
  }

  Store.normalizePhone = normalizePhone;
  global.Store = Store;
})(window);
