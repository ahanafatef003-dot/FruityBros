// ============================================================
// CUSTOMER APP
// ============================================================

const CustomerApp = (() => {
  let activeCategoryId = 'all';
  let searchQuery = '';
  let currentPage = 'home'; // home | menu | cart | order
  let currentOrderId = null;
  let tableNum = 7;
  let tableId = 't7';
  let initialized = false;

  function init() {
    if (initialized) { renderAll(); return; }
    initialized = true;
    const s = Store.get();
    tableNum = getTableNum();
    tableId = getTableId(tableNum);

    // Read from URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') === 'order' && params.get('orderId')) {
      currentOrderId = params.get('orderId');
      renderOrderStatus();
      showPage('order');
      return;
    }

    renderAll();
    bindEvents();
    updateCartBadge();
    updateWaiterBadge();

    EventBus.on('cartUpdate', () => {
      updateCartBadge();
      if (currentPage === 'cart') renderCart();
    });
    EventBus.on('orderUpdated', (id) => {
      if (id === currentOrderId && currentPage === 'order') renderOrderStatus();
    });
    EventBus.on('stateChange', () => {
      if (currentPage === 'home' || currentPage === 'menu') renderProducts();
      updateWaiterBadge();
    });
  }

  function renderAll() {
    const config = Store.get().restaurantConfig;
    document.getElementById('c-restaurant-name').textContent = config.name;
    document.getElementById('c-restaurant-tagline').textContent = config.tagline;
    document.getElementById('c-table-badge').textContent = `Table ${String(tableNum).padStart(2, '0')}`;

    renderCategories();
    renderProducts();
  }

  function renderCategories() {
    const bar = document.getElementById('c-categories-bar');
    bar.innerHTML = `
      <div class="cat-chip ${activeCategoryId === 'all' ? 'active' : ''}" data-cat="all">
        🍽️ All
      </div>
      ${categories.map(c => `
        <div class="cat-chip ${activeCategoryId === c.id ? 'active' : ''}" data-cat="${c.id}">
          ${c.icon} ${c.name}
        </div>
      `).join('')}
    `;

    bar.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeCategoryId = chip.dataset.cat;
        renderCategories();
        renderProducts();
        showPage('menu');
      });
    });
  }

  function getFilteredProducts() {
    const allProducts = Store.get().products;
    let filtered = allProducts;

    if (activeCategoryId !== 'all') {
      filtered = filtered.filter(p => p.categoryId === activeCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  function renderProducts() {
    const container = document.getElementById(currentPage === 'menu' ? 'c-products-area-menu' : 'c-products-area');
    if (!container) return;

    const filtered = getFilteredProducts();
    const popular = Store.get().products.filter(p => p.popular && p.available);

    if (currentPage === 'home' && !searchQuery && activeCategoryId === 'all') {
      container.innerHTML = `
        <div class="section-title">
          Popular Today
          <span onclick="CustomerApp.showAllMenu()">See all →</span>
        </div>
        <div class="product-grid">
          ${popular.map(p => renderProductCard(p)).join('')}
        </div>
        ${categories.map(cat => {
          const catProds = Store.get().products.filter(p => p.categoryId === cat.id);
          if (!catProds.length) return '';
          return `
            <div class="section-gap"></div>
            <div class="section-title">
              ${cat.icon} ${cat.name}
              <span onclick="CustomerApp.setCategory('${cat.id}')">See all →</span>
            </div>
            <div class="product-grid">
              ${catProds.slice(0,4).map(p => renderProductCard(p)).join('')}
            </div>
          `;
        }).join('')}
      `;
    } else if (searchQuery && filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">No results for "${searchQuery}"</div>
          <div class="empty-sub">Try different keywords or browse categories</div>
        </div>
      `;
    } else {
      container.innerHTML = `
        ${activeCategoryId !== 'all' ? `
          <div class="section-title">
            ${categories.find(c=>c.id===activeCategoryId)?.icon || ''} 
            ${categories.find(c=>c.id===activeCategoryId)?.name || 'All Items'}
          </div>` : ''}
        <div class="product-grid">
          ${filtered.map(p => renderProductCard(p)).join('')}
        </div>
        ${filtered.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">🍽️</div>
            <div class="empty-title">No items here</div>
            <div class="empty-sub">Check back later</div>
          </div>` : ''}
      `;
    }

    // Bind clicks
    container.querySelectorAll('.product-card, .product-list-item').forEach(card => {
      card.addEventListener('click', () => openProductModal(card.dataset.productId));
    });
    container.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const product = Store.get().products.find(p => p.id === btn.dataset.productId);
        if (product && product.available) openProductModal(btn.dataset.productId);
      });
    });
  }

  function renderProductCard(p) {
    const catIcon = categories.find(c => c.id === p.categoryId)?.icon || '🍽️';
    return `
      <div class="product-card ${!p.available ? 'unavailable' : ''}" 
           data-product-id="${p.id}" 
           role="button" tabindex="0"
           aria-label="${p.name} ${fmt(p.price)}">
        ${p.popular ? '<div class="popular-badge">POPULAR</div>' : ''}
        <img class="product-img" src="${p.image}" 
             alt="${p.name}" 
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
             loading="lazy">
        <div class="product-img-placeholder" style="display:none">${catIcon}</div>
        <div class="product-card-body">
          <div class="product-card-name">${p.name}</div>
          <div class="product-card-desc">${p.description}</div>
          <div class="product-card-footer">
            <div class="product-price">${fmt(p.price)}</div>
            ${p.available
              ? `<button class="add-btn" data-product-id="${p.id}" aria-label="Add ${p.name} to cart">+</button>`
              : `<span class="sold-out-badge">SOLD OUT</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  // ── Product Modal ────────────────────────────────────────
  let modalProduct = null;
  let modalState = { sizeId: null, extraIds: [], options: [], qty: 1 };

  function openProductModal(productId) {
    const product = Store.get().products.find(p => p.id === productId);
    if (!product) return;
    modalProduct = product;
    modalState = {
      sizeId: product.defaultSize,
      extraIds: [],
      options: [],
      qty: 1,
    };
    renderModal();
    document.getElementById('product-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    document.getElementById('product-modal').classList.remove('open');
    document.body.style.overflow = '';
    modalProduct = null;
  }

  function computeModalPrice() {
    if (!modalProduct) return 0;
    let base = modalProduct.price;
    const size = modalProduct.sizes.find(s => s.id === modalState.sizeId);
    if (size) base += size.price;
    modalState.extraIds.forEach(exId => {
      const ex = modalProduct.extras.find(e => e.id === exId);
      if (ex) base += ex.price;
    });
    return base * modalState.qty;
  }

  function renderModal() {
    if (!modalProduct) return;
    const p = modalProduct;
    const body = document.getElementById('product-modal-body');

    body.innerHTML = `
      <img class="product-modal-img" src="${p.image}" alt="${p.name}" 
           onerror="this.src='';this.style.background='var(--bg2)'">
      <div class="product-modal-body">
        <div class="product-modal-name">${p.name}</div>
        <div class="product-modal-desc">${p.description}</div>
        <div class="product-modal-price">${fmt(p.price)}</div>

        ${p.sizes.length > 0 ? `
          <div class="option-group">
            <div class="option-group-title">Size</div>
            <div class="option-chips">
              ${p.sizes.map(s => `
                <div class="option-chip ${modalState.sizeId === s.id ? 'selected' : ''}" 
                     data-size="${s.id}">
                  ${s.label}
                  ${s.price > 0 ? `<span class="extra-price">+${fmt(s.price)}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${p.extras.length > 0 ? `
          <div class="option-group">
            <div class="option-group-title">Extras</div>
            <div class="option-chips">
              ${p.extras.map(ex => `
                <div class="option-chip ${modalState.extraIds.includes(ex.id) ? 'selected' : ''}" 
                     data-extra="${ex.id}">
                  ${ex.label}
                  <span class="extra-price">+${fmt(ex.price)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${p.options.length > 0 ? `
          <div class="option-group">
            <div class="option-group-title">Preferences</div>
            <div class="option-chips">
              ${p.options.map(opt => `
                <div class="option-chip ${modalState.options.includes(opt) ? 'selected' : ''}" 
                     data-option="${opt}">
                  ${opt}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="option-group">
          <div class="option-group-title">Quantity</div>
          <div class="qty-selector">
            <button class="qty-btn" id="qty-dec" aria-label="Decrease quantity">−</button>
            <span class="qty-num" id="qty-display">${modalState.qty}</span>
            <button class="qty-btn" id="qty-inc" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>
    `;

    // Bind modal interactions
    body.querySelectorAll('[data-size]').forEach(el => {
      el.addEventListener('click', () => {
        modalState.sizeId = el.dataset.size;
        updateModalChips();
        updateModalTotal();
      });
    });
    body.querySelectorAll('[data-extra]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.extra;
        if (modalState.extraIds.includes(id)) {
          modalState.extraIds = modalState.extraIds.filter(x => x !== id);
        } else {
          modalState.extraIds.push(id);
        }
        updateModalChips();
        updateModalTotal();
      });
    });
    body.querySelectorAll('[data-option]').forEach(el => {
      el.addEventListener('click', () => {
        const opt = el.dataset.option;
        if (modalState.options.includes(opt)) {
          modalState.options = modalState.options.filter(x => x !== opt);
        } else {
          modalState.options.push(opt);
        }
        updateModalChips();
      });
    });
    document.getElementById('qty-dec').addEventListener('click', () => {
      if (modalState.qty > 1) { modalState.qty--; updateModalQty(); updateModalTotal(); }
    });
    document.getElementById('qty-inc').addEventListener('click', () => {
      if (modalState.qty < 20) { modalState.qty++; updateModalQty(); updateModalTotal(); }
    });

    updateModalTotal();
  }

  function updateModalChips() {
    const body = document.getElementById('product-modal-body');
    body.querySelectorAll('[data-size]').forEach(el => {
      el.classList.toggle('selected', el.dataset.size === modalState.sizeId);
    });
    body.querySelectorAll('[data-extra]').forEach(el => {
      el.classList.toggle('selected', modalState.extraIds.includes(el.dataset.extra));
    });
    body.querySelectorAll('[data-option]').forEach(el => {
      el.classList.toggle('selected', modalState.options.includes(el.dataset.option));
    });
  }

  function updateModalQty() {
    const el = document.getElementById('qty-display');
    if (el) el.textContent = modalState.qty;
  }

  function updateModalTotal() {
    const el = document.getElementById('modal-total-price');
    if (el) el.textContent = fmt(computeModalPrice());
  }

  function addToCart() {
    if (!modalProduct) return;
    const p = modalProduct;
    const size = p.sizes.find(s => s.id === modalState.sizeId);
    const extras = p.extras.filter(ex => modalState.extraIds.includes(ex.id));
    const sizePrice = size ? size.price : 0;
    const extrasPrice = extras.reduce((s, e) => s + e.price, 0);
    const unitPrice = p.price + sizePrice + extrasPrice;

    Cart.add({
      productId: p.id,
      name: p.name,
      image: p.image,
      sizeId: modalState.sizeId,
      sizeLabel: size ? size.label : null,
      extraIds: [...modalState.extraIds],
      extraLabels: extras.map(e => e.label),
      options: [...modalState.options],
      qty: modalState.qty,
      unitPrice,
      totalPrice: unitPrice * modalState.qty,
    });

    closeProductModal();
    Toast.show(`${p.name} added to cart ✓`, 'success');
    updateCartBadge();
  }

  // ── Cart ────────────────────────────────────────────────
  function renderCart() {
    const cart = Store.get().cart;
    const container = document.getElementById('c-cart-content');
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding-top:80px">
          <div class="empty-icon">🛒</div>
          <div class="empty-title">Your cart is empty</div>
          <div class="empty-sub">Add some delicious items from the menu</div>
        </div>
        <div style="padding:0 20px;margin-top:24px">
          <button class="btn btn-navy" onclick="CustomerApp.showPage('menu')">Browse Menu</button>
        </div>
      `;
      return;
    }

    const subtotal = Cart.total();
    const config = Store.get().restaurantConfig;
    const serviceCharge = Math.round(subtotal * (config.serviceChargePercent / 100));
    const total = subtotal + serviceCharge;

    container.innerHTML = `
      <div style="padding:16px 20px 0">
        ${cart.map(item => `
          <div class="cart-item">
            <img class="cart-item-img" src="${item.image}" alt="${item.name}"
                 onerror="this.style.display='none'">
            <div class="cart-item-body">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-mods">${[
                item.sizeLabel,
                ...item.extraLabels,
                ...item.options
              ].filter(Boolean).join(' · ') || 'Standard'}</div>
              <div class="cart-item-footer">
                <div class="cart-item-price">${fmt(item.totalPrice)}</div>
                <div class="qty-selector" style="gap:10px">
                  <button class="qty-btn" style="width:28px;height:28px;font-size:16px"
                    onclick="CustomerApp.changeCartQty('${item.cartId}', ${item.qty - 1})"
                    aria-label="Decrease">−</button>
                  <span class="qty-num" style="font-size:14px">${item.qty}</span>
                  <button class="qty-btn" style="width:28px;height:28px;font-size:16px"
                    onclick="CustomerApp.changeCartQty('${item.cartId}', ${item.qty + 1})"
                    aria-label="Increase">+</button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}

        <div class="cart-summary">
          <div class="cart-row">
            <span>Subtotal</span>
            <span>${fmt(subtotal)}</span>
          </div>
          ${serviceCharge > 0 ? `
            <div class="cart-row">
              <span>Service Charge (${config.serviceChargePercent}%)</span>
              <span>${fmt(serviceCharge)}</span>
            </div>
          ` : ''}
          <div class="cart-row total">
            <span>Total</span>
            <span>${fmt(total)}</span>
          </div>
        </div>

        <div style="margin-top:20px">
          <button class="btn btn-secondary" onclick="CustomerApp.showPage('menu')">
            ← Continue Browsing
          </button>
          <div style="height:10px"></div>
          <button class="btn btn-primary" onclick="CustomerApp.openCheckout()">
            Place Order — ${fmt(total)}
          </button>
        </div>
      </div>
    `;
  }

  function changeCartQty(cartId, qty) {
    Cart.updateQty(cartId, qty);
    renderCart();
  }

  // ── Checkout ─────────────────────────────────────────────
  function openCheckout() {
    if (Store.get().cart.length === 0) { Toast.show('Your cart is empty', 'error'); return; }
    document.getElementById('checkout-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('checkout-table-num').textContent = String(tableNum).padStart(2, '0');

    const subtotal = Cart.total();
    const config = Store.get().restaurantConfig;
    const total = subtotal + Math.round(subtotal * (config.serviceChargePercent / 100));
    document.getElementById('checkout-total').textContent = fmt(total);
  }

  function closeCheckout() {
    document.getElementById('checkout-modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  function placeOrder() {
    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const notes = document.getElementById('checkout-notes').value.trim();
    const cart = Store.get().cart;

    if (cart.length === 0) { Toast.show('Cart is empty', 'error'); return; }

    const subtotal = Cart.total();
    const config = Store.get().restaurantConfig;
    const serviceCharge = Math.round(subtotal * (config.serviceChargePercent / 100));
    const total = subtotal + serviceCharge;

    const order = Orders.create({
      tableNum, tableId,
      customerName: name || 'Walk-in',
      customerPhone: phone,
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        size: item.sizeLabel,
        extras: item.extraLabels,
        options: item.options,
        qty: item.qty,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal, total, notes,
    });

    Cart.clear();
    closeCheckout();
    currentOrderId = order.id;
    renderOrderStatus();
    showPage('order');

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'order');
    url.searchParams.set('orderId', order.id);
    window.history.replaceState({}, '', url);
  }

  // ── Order Status ─────────────────────────────────────────
  function renderOrderStatus() {
    const container = document.getElementById('c-order-content');
    if (!container || !currentOrderId) return;

    const order = Orders.getById(currentOrderId);
    if (!order) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Order not found</div></div>`;
      return;
    }

    const steps = [
      { key: 'pending',   label: 'Order Received',  sub: 'We got your order!', icon: '✓' },
      { key: 'preparing', label: 'Preparing',        sub: 'Kitchen is working on it', icon: '👨‍🍳' },
      { key: 'ready',     label: 'Ready to Serve',   sub: 'Your order is on its way!', icon: '🔔' },
      { key: 'completed', label: 'Completed',         sub: 'Enjoy your meal!', icon: '⭐' },
    ];
    const statusIdx = steps.findIndex(s => s.key === order.status);
    const isRejected = order.status === 'rejected';

    container.innerHTML = `
      <div class="order-success-hero">
        <div class="order-success-icon">${isRejected ? '✕' : '✓'}</div>
        <div class="order-id">${order.id}</div>
        <div style="font-size:15px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:4px">
          ${isRejected ? 'Order Rejected' : 'Order Confirmed!'}
        </div>
        <div class="order-table-info">
          Table ${String(order.tableNum).padStart(2,'0')} 
          ${order.customerName !== 'Walk-in' ? `· ${order.customerName}` : ''}
        </div>
        ${!isRejected ? `
          <div style="margin-top:16px;font-size:12px;color:rgba(255,255,255,.45)">
            Estimated: 15–20 minutes
          </div>
        ` : ''}
      </div>

      ${isRejected ? `
        <div style="padding:20px;text-align:center">
          <div style="font-size:14px;color:var(--text2);margin-bottom:16px">
            We're sorry, your order could not be processed at this time.
          </div>
          <button class="btn btn-primary" onclick="CustomerApp.showPage('menu')">
            Try Again
          </button>
        </div>
      ` : `
        <div class="status-track">
          ${steps.map((step, i) => `
            <div class="status-step ${i < statusIdx ? 'done' : ''} ${i === statusIdx ? 'active' : ''}">
              <div class="status-dot">${i <= statusIdx ? step.icon : ''}</div>
              <div class="status-step-content">
                <div class="status-step-label">${step.label}</div>
                <div class="status-step-sub">${i === statusIdx ? step.sub : (i < statusIdx ? 'Done' : 'Waiting')}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="padding:0 20px 20px">
          <div class="admin-card" style="margin-bottom:16px">
            <div class="admin-card-header">
              <div class="admin-card-title">Order Summary</div>
              <div class="status-pill ${order.status}">${statusLabel(order.status)}</div>
            </div>
            <div style="padding:16px">
              ${order.items.map(item => `
                <div class="cart-row" style="padding:6px 0">
                  <span>${item.name} ${item.size ? `(${item.size})` : ''} ×${item.qty}</span>
                  <span style="font-weight:600">${fmt(item.totalPrice)}</span>
                </div>
              `).join('')}
              <div class="cart-row total" style="margin-top:12px">
                <span>Total</span>
                <span>${fmt(order.total)}</span>
              </div>
            </div>
          </div>

          <button class="btn btn-outline-amber" onclick="CustomerApp.openWaiterModal()" style="margin-bottom:10px">
            🔔 Call Waiter
          </button>
          <button class="btn btn-secondary" onclick="CustomerApp.requestBill()">
            📄 Request Bill
          </button>
        </div>
      `}
    `;
  }

  // ── Waiter Modal ─────────────────────────────────────────
  const waiterOptions = [
    { id: 'assistance', label: 'Need assistance', icon: '🙋' },
    { id: 'water',      label: 'Request water',   icon: '💧' },
    { id: 'bill',       label: 'Request bill',    icon: '🧾' },
    { id: 'extra',      label: 'Need extra items', icon: '➕' },
    { id: 'other',      label: 'Other',           icon: '💬' },
  ];
  let selectedWaiterOption = null;

  function openWaiterModal() {
    selectedWaiterOption = null;
    renderWaiterOptions();
    document.getElementById('waiter-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function renderWaiterOptions() {
    const cont = document.getElementById('waiter-options');
    cont.innerHTML = waiterOptions.map(o => `
      <div class="waiter-option ${selectedWaiterOption === o.id ? 'selected' : ''}" 
           onclick="CustomerApp.selectWaiterOption('${o.id}')">
        <span class="waiter-option-icon">${o.icon}</span>
        <span class="waiter-option-text">${o.label}</span>
      </div>
    `).join('');
    document.getElementById('waiter-submit').disabled = !selectedWaiterOption;
  }

  function selectWaiterOption(id) {
    selectedWaiterOption = id;
    renderWaiterOptions();
  }

  function submitWaiterRequest() {
    if (!selectedWaiterOption) return;
    const option = waiterOptions.find(o => o.id === selectedWaiterOption);
    Store.update(s => {
      s.waiterRequests.unshift({
        id: 'wr' + Date.now(),
        tableNum, tableId,
        reason: option.label,
        icon: option.icon,
        status: 'pending',
        time: Date.now(),
      });
    });
    document.getElementById('waiter-modal').classList.remove('open');
    document.body.style.overflow = '';
    Toast.show('Waiter request sent — someone will assist you shortly', 'success');
    Notifications.add(`Waiter request from Table ${tableNum}: ${option.label}`, 'waiter');
  }

  function requestBill() {
    const confirmed = confirm(`Request bill for Table ${String(tableNum).padStart(2,'0')}?`);
    if (!confirmed) return;
    Store.update(s => {
      s.billRequests.unshift({
        id: 'br' + Date.now(),
        tableNum, tableId,
        orderId: currentOrderId,
        status: 'pending',
        time: Date.now(),
      });
      const table = s.tables.find(t => t.id === tableId);
      if (table) table.status = 'bill-requested';
    });
    Toast.show('Bill request sent ✓', 'success');
    Notifications.add(`Bill request from Table ${tableNum}`, 'bill');
  }

  // ── Nav & Pages ───────────────────────────────────────────
  function showPage(page) {
    currentPage = page;
    document.querySelectorAll('#customer-app .page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pageMap = { home: 'c-home-page', menu: 'c-menu-page', cart: 'c-cart-page', order: 'c-order-page' };
    const navMap  = { home: 'nav-home', menu: 'nav-menu', cart: 'nav-cart', order: 'nav-order' };

    const pageEl = document.getElementById(pageMap[page]);
    if (pageEl) pageEl.classList.add('active');
    const navEl = document.getElementById(navMap[page]);
    if (navEl) navEl.classList.add('active');

    if (page === 'cart') renderCart();
    if (page === 'order') renderOrderStatus();
    if (page === 'home') {
      activeCategoryId = 'all';
      searchQuery = '';
      document.getElementById('c-search').value = '';
      renderCategories();
      renderProducts();
    }
    if (page === 'menu') {
      renderProducts();
    }

    // Scroll to top
    document.getElementById('customer-app').scrollTop = 0;
  }

  function showAllMenu() {
    activeCategoryId = 'all';
    searchQuery = '';
    showPage('menu');
  }

  function setCategory(catId) {
    activeCategoryId = catId;
    renderCategories();
    showPage('menu');
  }

  function updateCartBadge() {
    const count = Cart.count();
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  function updateWaiterBadge() {
    const s = Store.get();
    const pendingReqs = s.waiterRequests.filter(r => r.status === 'pending').length;
    // No badge on customer side, just use for notifications
  }

  function bindEvents() {
    // Nav
    document.getElementById('nav-home')?.addEventListener('click', () => showPage('home'));
    document.getElementById('nav-menu')?.addEventListener('click', () => showPage('menu'));
    document.getElementById('nav-cart')?.addEventListener('click', () => showPage('cart'));
    document.getElementById('nav-order')?.addEventListener('click', () => showPage('order'));

    // Search
    const searchEl = document.getElementById('c-search');
    searchEl?.addEventListener('input', e => {
      searchQuery = e.target.value;
      if (searchQuery) {
        activeCategoryId = 'all';
        renderCategories();
        showPage('menu');
      } else {
        showPage('home');
      }
    });

    // Product modal
    document.getElementById('product-modal-close')?.addEventListener('click', closeProductModal);
    document.getElementById('product-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('product-modal')) closeProductModal();
    });
    document.getElementById('add-to-cart-btn')?.addEventListener('click', addToCart);

    // Checkout modal
    document.getElementById('checkout-modal-close')?.addEventListener('click', closeCheckout);
    document.getElementById('checkout-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('checkout-modal')) closeCheckout();
    });
    document.getElementById('place-order-btn')?.addEventListener('click', placeOrder);

    // Waiter modal
    document.getElementById('waiter-modal-close')?.addEventListener('click', () => {
      document.getElementById('waiter-modal').classList.remove('open');
      document.body.style.overflow = '';
    });
    document.getElementById('waiter-submit')?.addEventListener('click', submitWaiterRequest);

    // Keyboard close
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeProductModal();
        closeCheckout();
        document.getElementById('waiter-modal')?.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Cart icon in header
    document.getElementById('c-cart-icon')?.addEventListener('click', () => showPage('cart'));
    document.getElementById('c-waiter-icon')?.addEventListener('click', () => openWaiterModal());
  }

  return {
    init, showPage, showAllMenu, setCategory,
    changeCartQty, openCheckout, openWaiterModal,
    selectWaiterOption, submitWaiterRequest, requestBill,
    refreshOrderStatus: renderOrderStatus,
  };
})();
