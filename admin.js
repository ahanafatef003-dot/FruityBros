// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminApp = (() => {
  let activePage = 'dashboard';
  let orderFilter = 'all';
  let menuCatFilter = 'all';
  let initialized = false;

  function init() {
    if (initialized) { showAdminPage(activePage); return; }
    initialized = true;
    renderSidebar();
    showAdminPage('dashboard');
    bindAdminEvents();

    EventBus.on('stateChange', () => {
      refreshActivePage();
      updateSidebarBadges();
    });
    EventBus.on('orderCreated', () => {
      if (activePage === 'orders') renderOrders();
      if (activePage === 'dashboard') renderDashboard();
    });
    EventBus.on('notification', () => updateSidebarBadges());
  }

  function renderSidebar() {
    updateSidebarBadges();
  }

  function updateSidebarBadges() {
    const s = Store.get();
    const pending = s.orders.filter(o => o.status === 'pending').length;
    const reqs = s.waiterRequests.filter(r => r.status === 'pending').length +
                 s.billRequests.filter(r => r.status === 'pending').length;

    const pendingBadge = document.getElementById('sidebar-pending-badge');
    if (pendingBadge) {
      pendingBadge.textContent = pending;
      pendingBadge.style.display = pending > 0 ? '' : 'none';
    }
  }

  function showAdminPage(page) {
    activePage = page;
    document.querySelectorAll('#admin-app .page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

    const pageEl = document.getElementById(`admin-${page}-page`);
    if (pageEl) pageEl.classList.add('active');
    const sidebarEl = document.getElementById(`sidebar-${page}`);
    if (sidebarEl) sidebarEl.classList.add('active');

    document.getElementById('admin-topbar-title').textContent = {
      dashboard: 'Dashboard',
      orders: 'Orders',
      kitchen: 'Kitchen Display',
      tables: 'Table Management',
      menu: 'Menu Management',
      staff: 'Staff',
      reports: 'Reports & Analytics',
      settings: 'Settings',
      qrcodes: 'QR Codes',
    }[page] || page;

    refreshActivePage();
  }

  function refreshActivePage() {
    switch (activePage) {
      case 'dashboard': renderDashboard(); break;
      case 'orders':    renderOrders();    break;
      case 'tables':    renderTables();    break;
      case 'menu':      renderMenu();      break;
      case 'staff':     renderStaff();     break;
      case 'reports':   renderReports();   break;
      case 'settings':  renderSettings();  break;
      case 'qrcodes':   renderQRCodes();   break;
    }
  }

  // ── Dashboard ─────────────────────────────────────────────
  function renderDashboard() {
    const s = Store.get();
    const todayOrders = s.orders;
    const pending = todayOrders.filter(o => o.status === 'pending').length;
    const completed = todayOrders.filter(o => o.status === 'completed').length;
    const occupied = s.tables.filter(t => t.status !== 'available').length;

    const el = document.getElementById('admin-dashboard-page');
    if (!el) return;

    el.innerHTML = `
      <div class="stat-grid">
        ${statCard('Today\'s Revenue', fmt(reportData.todaySales), '+12.4%', 'up', '💰')}
        ${statCard('Total Orders', todayOrders.length + 47, '+8.2%', 'up', '📋')}
        ${statCard('Pending', pending, '', '', '⏳', pending > 0 ? 'var(--yellow)' : null)}
        ${statCard('Tables Occupied', `${occupied} / ${s.tables.length}`, '', '', '🪑')}
      </div>

      <div class="admin-2col">
        <div>
          <!-- Recent orders -->
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Recent Orders</div>
              <button class="btn btn-sm btn-secondary" onclick="AdminApp.showAdminPage('orders')">View All</button>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                ${s.orders.slice(0,8).map(o => `
                  <tr>
                    <td><strong>${o.id}</strong></td>
                    <td>Table ${String(o.tableNum).padStart(2,'0')}</td>
                    <td>${o.items.length} item${o.items.length !== 1 ? 's' : ''}</td>
                    <td><strong>${fmt(o.total)}</strong></td>
                    <td><span class="status-pill ${o.status}">${statusLabel(o.status)}</span></td>
                    <td style="color:var(--text3)">${timeAgo(o.createdAt)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Waiter Requests -->
          ${renderRequestsCard()}
        </div>

        <div>
          <!-- Popular items -->
          <div class="admin-card" style="margin-bottom:16px">
            <div class="admin-card-header">
              <div class="admin-card-title">Popular Today</div>
            </div>
            ${reportData.topProducts.slice(0,5).map((p, i) => `
              <div class="request-item">
                <div class="request-icon" style="background:var(--bg2);color:var(--amber);font-size:14px;font-weight:800">
                  #${i+1}
                </div>
                <div class="request-body">
                  <div class="request-title">${p.name}</div>
                  <div class="request-sub">${p.orders} orders · ${fmt(p.revenue)}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Quick stats -->
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Revenue This Week</div>
            </div>
            <div style="padding:20px">
              <div class="bar-chart" style="height:130px">
                ${reportData.weekSales.map((v, i) => {
                  const max = Math.max(...reportData.weekSales);
                  const pct = max > 0 ? (v / max * 100) : 0;
                  return `
                    <div class="bar-col" style="position:relative">
                      <div class="bar-fill" style="height:${pct}%;opacity:${v===0?.3:1}"></div>
                      <span class="bar-label">${reportData.weekDays[i]}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function statCard(label, value, delta, dir, icon, valueColor) {
    return `
      <div class="stat-card">
        <div class="stat-label">
          ${label}
          <span class="stat-icon">${icon}</span>
        </div>
        <div class="stat-value" style="${valueColor ? `color:${valueColor}` : ''}">${value}</div>
        ${delta ? `<div class="stat-delta ${dir}">${dir==='up'?'↑':'↓'} ${delta} vs last week</div>` : '<div style="height:18px"></div>'}
      </div>
    `;
  }

  function renderRequestsCard() {
    const s = Store.get();
    const allReqs = [
      ...s.waiterRequests.map(r => ({ ...r, type: 'waiter' })),
      ...s.billRequests.map(r => ({ ...r, type: 'bill', reason: 'Request Bill', icon: '🧾' })),
    ].sort((a, b) => b.time - a.time).slice(0, 8);

    return `
      <div class="admin-card" style="margin-top:16px">
        <div class="admin-card-header">
          <div class="admin-card-title">Waiter & Bill Requests</div>
          <span style="font-size:12px;color:var(--text3)">${allReqs.filter(r=>r.status==='pending').length} pending</span>
        </div>
        ${allReqs.length === 0 ? `
          <div class="empty-state" style="padding:32px">
            <div class="empty-icon" style="font-size:32px">✅</div>
            <div class="empty-title">All caught up</div>
          </div>
        ` : allReqs.map(r => `
          <div class="request-item">
            <div class="request-icon">${r.icon}</div>
            <div class="request-body">
              <div class="request-title">Table ${String(r.tableNum).padStart(2,'0')} — ${r.reason}</div>
              <div class="request-sub ${r.status==='resolved'?'':''}">
                ${r.status === 'resolved' ? '<span style="color:var(--green)">Resolved</span>' 
                  : `<button class="btn btn-sm" style="padding:3px 10px;font-size:11px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;cursor:pointer" 
                       onclick="AdminApp.resolveRequest('${r.id}','${r.type}')">Mark resolved</button>`}
              </div>
            </div>
            <div class="request-time">${timeAgo(r.time)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Orders ────────────────────────────────────────────────
  function renderOrders() {
    const el = document.getElementById('admin-orders-page');
    if (!el) return;
    const s = Store.get();
    const filtered = Orders.getByStatus(orderFilter);

    const countByStatus = {
      all: s.orders.length,
      pending: s.orders.filter(o=>o.status==='pending').length,
      preparing: s.orders.filter(o=>o.status==='preparing').length,
      ready: s.orders.filter(o=>o.status==='ready').length,
      completed: s.orders.filter(o=>o.status==='completed').length,
    };

    el.innerHTML = `
      <div class="admin-tabs" id="order-tabs">
        ${['all','pending','preparing','ready','completed'].map(st => `
          <button class="admin-tab ${orderFilter===st?'active':''}" data-filter="${st}">
            ${st==='all'?'All':statusLabel(st)}
            <span class="tab-count">${countByStatus[st]}</span>
          </button>
        `).join('')}
      </div>
      <div style="padding:20px">
        ${filtered.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <div class="empty-title">No ${orderFilter === 'all' ? '' : statusLabel(orderFilter)} orders</div>
            <div class="empty-sub">Orders will appear here as they come in</div>
          </div>
        ` : filtered.map(o => renderOrderCard(o)).join('')}
      </div>
    `;

    el.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        orderFilter = tab.dataset.filter;
        renderOrders();
      });
    });
  }

  function renderOrderCard(o) {
    const actions = orderActions(o);
    return `
      <div class="order-card" id="order-card-${o.id}">
        <div class="order-card-header">
          <div>
            <div class="order-num">${o.id}</div>
            <div class="order-table-tag">Table ${String(o.tableNum).padStart(2,'0')} · ${o.customerName}${o.customerPhone ? ' · '+o.customerPhone : ''}</div>
          </div>
          <span class="status-pill ${o.status}">${statusLabel(o.status)}</span>
        </div>
        <div class="order-items-list">
          ${o.items.map(i => `
            <div>
              <strong>${i.name}</strong>${i.size?' ('+i.size+')':''} × ${i.qty}
              ${i.extras?.length ? ` + ${i.extras.join(', ')}` : ''}
              ${i.options?.length ? ` · ${i.options.join(', ')}` : ''}
            </div>
          `).join('')}
        </div>
        ${o.notes ? `<div style="font-size:12px;color:var(--amber);margin-bottom:8px">📝 ${o.notes}</div>` : ''}
        <div class="order-total">${fmt(o.total)}</div>
        <div class="order-meta">${timeAgo(o.createdAt)}</div>
        <div class="order-card-actions">${actions}</div>
      </div>
    `;
  }

  function orderActions(o) {
    switch (o.status) {
      case 'pending': return `
        <button class="btn btn-sm btn-success" onclick="AdminApp.updateOrderStatus('${o.id}','preparing')">Accept & Prepare</button>
        <button class="btn btn-sm btn-danger" onclick="AdminApp.updateOrderStatus('${o.id}','rejected')">Reject</button>
      `;
      case 'preparing': return `
        <button class="btn btn-sm btn-primary" onclick="AdminApp.updateOrderStatus('${o.id}','ready')">Mark Ready</button>
      `;
      case 'ready': return `
        <button class="btn btn-sm btn-navy" onclick="AdminApp.updateOrderStatus('${o.id}','completed')">Complete</button>
      `;
      default: return '';
    }
  }

  function updateOrderStatus(orderId, status) {
    Orders.updateStatus(orderId, status);
    Toast.show(`Order ${orderId} → ${statusLabel(status)}`, 'success');
    if (status === 'completed') {
      Notifications.add(`Order ${orderId} completed`, 'success');
    }
  }

  // ── Tables ────────────────────────────────────────────────
  function renderTables() {
    const el = document.getElementById('admin-tables-page');
    if (!el) return;
    const s = Store.get();

    el.innerHTML = `
      <div class="table-legend">
        <div class="legend-item"><div class="legend-dot available"></div>Available</div>
        <div class="legend-item"><div class="legend-dot occupied"></div>Occupied</div>
        <div class="legend-item"><div class="legend-dot waiting"></div>Waiting</div>
        <div class="legend-item"><div class="legend-dot bill"></div>Bill Requested</div>
      </div>
      <div class="tables-grid">
        ${s.tables.map(t => `
          <div class="table-tile ${t.status}" onclick="AdminApp.openTableDetail('${t.id}')" 
               role="button" tabindex="0" aria-label="Table ${t.num}">
            ${t.status !== 'available' ? '<div class="table-tile-indicator"></div>' : ''}
            <div class="table-tile-num">${String(t.num).padStart(2,'0')}</div>
            <div class="table-tile-status">
              ${t.status === 'available' ? '● Available' 
                : t.status === 'occupied' ? '● Occupied'
                : t.status === 'waiting' ? '● Waiting'
                : '● Bill Requested'}
            </div>
            ${t.orderId ? `<div class="table-tile-order">${t.orderId}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function openTableDetail(tableId) {
    const s = Store.get();
    const table = s.tables.find(t => t.id === tableId);
    if (!table) return;
    const order = table.orderId ? Orders.getById(table.orderId) : null;

    const modal = document.getElementById('table-detail-modal');
    const body = document.getElementById('table-detail-body');
    body.innerHTML = `
      <div style="padding:20px">
        <div style="font-size:28px;font-weight:800;margin-bottom:4px">
          Table ${String(table.num).padStart(2,'0')}
        </div>
        <div style="font-size:13px;color:var(--text3);margin-bottom:20px">
          Capacity: ${table.capacity} seats · 
          <span class="${'status-pill '+table.status}" style="font-size:12px">${table.status}</span>
        </div>

        ${order ? `
          <div class="admin-card" style="margin-bottom:16px">
            <div class="admin-card-header">
              <div class="admin-card-title">${order.id}</div>
              <span class="status-pill ${order.status}">${statusLabel(order.status)}</span>
            </div>
            <div style="padding:14px">
              ${order.items.map(i => `
                <div class="cart-row">
                  <span>${i.name} ×${i.qty}</span>
                  <span>${fmt(i.totalPrice)}</span>
                </div>
              `).join('')}
              <div class="cart-row total">
                <span>Total</span>
                <span>${fmt(order.total)}</span>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-bottom:10px">
            ${orderActions(order)}
          </div>
        ` : `
          <div class="empty-state" style="padding:32px 0">
            <div class="empty-icon">🪑</div>
            <div class="empty-title">No active order</div>
          </div>
        `}

        <button class="btn btn-secondary btn-sm" style="margin-top:8px"
          onclick="AdminApp.markTableAvailable('${tableId}')">
          Mark as Available
        </button>
      </div>
    `;
    modal.classList.add('open');
  }

  function markTableAvailable(tableId) {
    Store.update(s => {
      const t = s.tables.find(t => t.id === tableId);
      if (t) { t.status = 'available'; t.orderId = null; }
    });
    document.getElementById('table-detail-modal').classList.remove('open');
    Toast.show('Table marked as available', 'success');
  }

  // ── Menu ──────────────────────────────────────────────────
  function renderMenu() {
    const el = document.getElementById('admin-menu-page');
    if (!el) return;
    const s = Store.get();
    const filtered = menuCatFilter === 'all' ? s.products
      : s.products.filter(p => p.categoryId === menuCatFilter);

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div class="admin-tabs" style="border-bottom:none;padding:0;flex-wrap:wrap;gap:4px">
          <button class="admin-tab ${menuCatFilter==='all'?'active':''}" onclick="AdminApp.setMenuCat('all')">All</button>
          ${categories.map(c => `
            <button class="admin-tab ${menuCatFilter===c.id?'active':''}" onclick="AdminApp.setMenuCat('${c.id}')">
              ${c.name}
            </button>
          `).join('')}
        </div>
        <button class="btn btn-primary btn-sm" onclick="AdminApp.openAddProduct()">+ Add Product</button>
      </div>

      <div class="admin-card">
        ${filtered.map(p => `
          <div class="menu-product-row">
            <img class="menu-product-thumb" src="${p.image}" alt="${p.name}"
                 onerror="this.style.background='var(--bg2)';this.src=''">
            <div class="menu-product-info">
              <div class="menu-product-name">${p.name}</div>
              <div class="menu-product-cat">${categories.find(c=>c.id===p.categoryId)?.name || p.categoryId}</div>
            </div>
            <div class="menu-product-price" style="margin-right:24px">${fmt(p.price)}</div>
            <label class="availability-toggle" title="${p.available ? 'Mark unavailable' : 'Mark available'}">
              <input type="checkbox" ${p.available ? 'checked' : ''} 
                     onchange="AdminApp.toggleAvailability('${p.id}', this.checked)">
              <span class="toggle-slider"></span>
            </label>
            <div style="display:flex;gap:6px;margin-left:12px">
              <button class="btn btn-sm btn-secondary" onclick="AdminApp.openEditProduct('${p.id}')">Edit</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function setMenuCat(catId) {
    menuCatFilter = catId;
    renderMenu();
  }

  function toggleAvailability(productId, available) {
    Store.update(s => {
      const p = s.products.find(p => p.id === productId);
      if (p) p.available = available;
    });
    const p = Store.get().products.find(p => p.id === productId);
    Toast.show(`${p.name} marked ${available ? 'available' : 'unavailable'}`, available ? 'success' : 'info');
  }

  function openAddProduct() {
    openProductForm(null);
  }

  function openEditProduct(productId) {
    const product = Store.get().products.find(p => p.id === productId);
    openProductForm(product);
  }

  function openProductForm(product) {
    const modal = document.getElementById('product-form-modal');
    const body = document.getElementById('product-form-body');
    const isEdit = !!product;

    body.innerHTML = `
      <div style="padding:20px">
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input class="form-input" id="pf-name" value="${product?.name||''}" placeholder="e.g. Cappuccino">
          <div class="form-error" id="pf-name-err" style="display:none">Name is required</div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="pf-desc" placeholder="Short description...">${product?.description||''}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select class="form-input" id="pf-cat">
              ${categories.map(c => `
                <option value="${c.id}" ${product?.categoryId===c.id?'selected':''}>${c.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Price (৳) *</label>
            <input class="form-input" id="pf-price" type="number" min="0" 
                   value="${product?.price||''}" placeholder="280">
            <div class="form-error" id="pf-price-err" style="display:none">Valid price required</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Image URL</label>
          <input class="form-input" id="pf-image" value="${product?.image||''}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:14px">
            <input type="checkbox" id="pf-available" ${product?.available!==false?'checked':''}>
            Available for ordering
          </label>
        </div>
        <div style="display:flex;gap:10px;margin-top:8px">
          <button class="btn btn-secondary" style="flex:1" onclick="AdminApp.closeProductForm()">Cancel</button>
          <button class="btn btn-primary" style="flex:2" onclick="AdminApp.saveProduct('${product?.id||''}')">
            ${isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    `;
    modal.classList.add('open');
  }

  function closeProductForm() {
    document.getElementById('product-form-modal').classList.remove('open');
  }

  function saveProduct(existingId) {
    const name = document.getElementById('pf-name').value.trim();
    const price = parseFloat(document.getElementById('pf-price').value);
    const description = document.getElementById('pf-desc').value.trim();
    const categoryId = document.getElementById('pf-cat').value;
    const image = document.getElementById('pf-image').value.trim();
    const available = document.getElementById('pf-available').checked;

    let valid = true;
    if (!name) { document.getElementById('pf-name-err').style.display=''; valid=false; } else { document.getElementById('pf-name-err').style.display='none'; }
    if (isNaN(price) || price < 0) { document.getElementById('pf-price-err').style.display=''; valid=false; } else { document.getElementById('pf-price-err').style.display='none'; }

    if (!valid) return;

    Store.update(s => {
      if (existingId) {
        const p = s.products.find(p => p.id === existingId);
        if (p) { p.name=name; p.price=price; p.description=description; p.categoryId=categoryId; p.image=image; p.available=available; }
      } else {
        s.products.push({
          id: 'p' + Date.now(), categoryId, name, description, price, available,
          popular: false, prepTime: 15,
          image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
          sizes: [], extras: [], options: [], defaultSize: null,
        });
      }
    });

    closeProductForm();
    Toast.show(existingId ? 'Product updated ✓' : 'Product added ✓', 'success');
  }

  // ── Staff ─────────────────────────────────────────────────
  function renderStaff() {
    const el = document.getElementById('admin-staff-page');
    if (!el) return;
    el.innerHTML = `
      <div style="display:flex;justify-content:flex-end;margin-bottom:20px">
        <button class="btn btn-primary btn-sm">+ Add Staff</button>
      </div>
      <div class="staff-grid">
        ${staffMembers.map(s => `
          <div class="staff-card">
            <div class="staff-avatar">${s.avatar}</div>
            <div class="staff-name">${s.name}</div>
            <div class="staff-role">${s.role}</div>
            <div class="staff-shift">⏰ ${s.shift}</div>
            <span class="staff-status ${s.status}">
              ${s.status === 'active' ? '● Active' : '○ Off Today'}
            </span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Reports ───────────────────────────────────────────────
  function renderReports() {
    const el = document.getElementById('admin-reports-page');
    if (!el) return;
    const max = Math.max(...reportData.weekSales);

    el.innerHTML = `
      <div class="stat-grid" style="margin-bottom:24px">
        ${statCard("Today's Sales", fmt(reportData.todaySales), '+12.4%', 'up', '📈')}
        ${statCard('Weekly Sales', fmt(reportData.weekSales.reduce((a,b)=>a+b,0)), '+8.2%', 'up', '📊')}
        ${statCard('Monthly Sales', fmt(reportData.monthlySales), '+5.1%', 'up', '💹')}
        ${statCard('Avg Order Value', fmt(Math.round(reportData.todaySales/47)), '', '', '🧾')}
      </div>

      <div class="admin-2col">
        <div>
          <!-- Weekly bar chart -->
          <div class="admin-card" style="margin-bottom:20px">
            <div class="admin-card-header">
              <div class="admin-card-title">Weekly Revenue</div>
            </div>
            <div style="padding:20px">
              <div style="display:flex;align-items:flex-end;gap:8px;height:160px;padding-bottom:28px;position:relative">
                <div style="position:absolute;bottom:28px;left:0;right:0;height:1px;background:var(--border)"></div>
                ${reportData.weekSales.map((v, i) => {
                  const pct = max > 0 ? (v / max * 100) : 0;
                  return `
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative">
                      <div style="width:100%;border-radius:4px 4px 0 0;background:var(--amber);opacity:${v===0?.2:1};height:${pct}%;min-height:3px;transition:height .3s"></div>
                      <span style="position:absolute;bottom:-22px;font-size:11px;color:var(--text3)">${reportData.weekDays[i]}</span>
                      ${v > 0 ? `<span style="position:absolute;top:-20px;font-size:10px;color:var(--text2);white-space:nowrap">${fmt(v)}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Peak hours -->
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Peak Hours (Today)</div>
            </div>
            <div style="padding:20px">
              <div class="hour-chart">
                ${reportData.peakHours.map((v, i) => {
                  const maxH = Math.max(...reportData.peakHours);
                  const pct = maxH > 0 ? v / maxH * 100 : 0;
                  return `<div class="hour-bar" style="height:${pct}%;opacity:${v===0?.1:1}" title="${i}:00 — ${v} orders"></div>`;
                }).join('')}
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:8px">
                <span style="font-size:10px;color:var(--text3)">12 AM</span>
                <span style="font-size:10px;color:var(--text3)">6 AM</span>
                <span style="font-size:10px;color:var(--text3)">12 PM</span>
                <span style="font-size:10px;color:var(--text3)">6 PM</span>
                <span style="font-size:10px;color:var(--text3)">11 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <!-- Top products -->
          <div class="admin-card" style="margin-bottom:20px">
            <div class="admin-card-header">
              <div class="admin-card-title">Top Products</div>
            </div>
            ${reportData.topProducts.map((p, i) => `
              <div class="request-item">
                <div class="request-icon" style="background:var(--bg2);color:var(--amber);font-size:14px;font-weight:800">#${i+1}</div>
                <div class="request-body">
                  <div class="request-title">${p.name}</div>
                  <div class="request-sub">${p.orders} orders · ${fmt(p.revenue)}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Category breakdown -->
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Sales by Category</div>
            </div>
            <div style="padding:16px">
              ${reportData.categoryRevenue.map(c => `
                <div style="margin-bottom:12px">
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
                    <span>${c.name}</span>
                    <span style="font-weight:600;color:var(--text2)">${c.pct}%</span>
                  </div>
                  <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${c.pct}%;background:var(--amber);border-radius:3px;transition:width .3s"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Settings ──────────────────────────────────────────────
  function renderSettings() {
    const el = document.getElementById('admin-settings-page');
    if (!el) return;
    const config = Store.get().restaurantConfig;

    el.innerHTML = `
      <div style="max-width:680px">
        <div class="admin-card" style="margin-bottom:20px">
          <div class="admin-card-header"><div class="admin-card-title">Restaurant Information</div></div>
          <div style="padding:20px">
            <div class="settings-section">
              <div class="form-group">
                <label class="form-label">Restaurant Name</label>
                <input class="form-input" id="cfg-name" value="${config.name}">
              </div>
              <div class="form-group">
                <label class="form-label">Tagline</label>
                <input class="form-input" id="cfg-tagline" value="${config.tagline}">
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input class="form-input" id="cfg-phone" value="${config.phone}">
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input class="form-input" id="cfg-address" value="${config.address}">
              </div>
              <div class="form-group">
                <label class="form-label">Opening Hours</label>
                <input class="form-input" id="cfg-hours" value="${config.openingHours}">
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="AdminApp.saveSettings()" style="width:auto;padding:10px 24px">
              Save Changes
            </button>
          </div>
        </div>

        <div class="admin-card" style="margin-bottom:20px">
          <div class="admin-card-header"><div class="admin-card-title">Business Settings</div></div>
          <div style="padding:20px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div class="form-group">
                <label class="form-label">Currency Symbol</label>
                <input class="form-input" value="${config.currency}" readonly>
              </div>
              <div class="form-group">
                <label class="form-label">Table Count</label>
                <input class="form-input" type="number" value="${config.tableCount}">
              </div>
              <div class="form-group">
                <label class="form-label">Service Charge %</label>
                <input class="form-input" type="number" value="${config.serviceChargePercent}">
              </div>
              <div class="form-group">
                <label class="form-label">Restaurant URL</label>
                <input class="form-input" value="${config.restaurantUrl}">
              </div>
            </div>
          </div>
        </div>

        <div class="admin-card">
          <div class="admin-card-header"><div class="admin-card-title">Demo Tools</div></div>
          <div style="padding:20px">
            <p style="font-size:13px;color:var(--text2);margin-bottom:16px">
              Reset all demo data to its original state. This will clear orders, cart, and requests.
            </p>
            <button class="btn btn-danger btn-sm" style="width:auto" onclick="AdminApp.confirmReset()">
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function saveSettings() {
    const name = document.getElementById('cfg-name')?.value.trim();
    const tagline = document.getElementById('cfg-tagline')?.value.trim();
    const phone = document.getElementById('cfg-phone')?.value.trim();
    const address = document.getElementById('cfg-address')?.value.trim();
    const hours = document.getElementById('cfg-hours')?.value.trim();
    Store.update(s => {
      s.restaurantConfig = { ...s.restaurantConfig, name, tagline, phone, address, openingHours: hours };
    });
    Toast.show('Settings saved ✓', 'success');
  }

  // ── QR Codes ──────────────────────────────────────────────
  function renderQRCodes() {
    const el = document.getElementById('admin-qrcodes-page');
    if (!el) return;
    const config = Store.get().restaurantConfig;
    const tableCount = config.tableCount || 20;

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
        <div>
          <div style="font-size:14px;color:var(--text2)">
            Each QR code links customers to: <code style="background:var(--bg2);padding:2px 8px;border-radius:4px;font-size:13px">${config.restaurantUrl}?restaurant=${config.id}&table=N</code>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="AdminApp.printAllQR()">🖨️ Print All</button>
      </div>
      <div class="qr-grid">
        ${Array.from({length: tableCount}, (_, i) => i+1).map(num => `
          <div class="qr-card">
            <div class="qr-code">${generateQRPattern(num, 100)}</div>
            <div class="qr-table-num">Table ${String(num).padStart(2,'0')}</div>
            <div class="qr-table-url">${config.id}?table=${num}</div>
            <div class="qr-actions">
              <button class="btn btn-secondary btn-sm" style="flex:1;padding:7px"
                onclick="AdminApp.downloadQR(${num})">Download</button>
              <button class="btn btn-outline-amber btn-sm" style="flex:1;padding:7px"
                onclick="AdminApp.previewTable(${num})">Preview</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function downloadQR(num) {
    Toast.show(`QR code for Table ${String(num).padStart(2,'0')} downloaded`, 'success');
  }
  function printAllQR() {
    Toast.show('Preparing print view for all QR codes…', 'info');
    setTimeout(() => window.print(), 600);
  }
  function previewTable(num) {
    Toast.show(`Opening Table ${num} customer view…`, 'info');
    setTimeout(() => {
      const url = `${window.location.pathname}?restaurant=${restaurantConfig.id}&table=${num}`;
      window.open(url, '_blank');
    }, 400);
  }

  // ── Misc ──────────────────────────────────────────────────
  function resolveRequest(id, type) {
    Store.update(s => {
      if (type === 'waiter') {
        const r = s.waiterRequests.find(r => r.id === id);
        if (r) r.status = 'resolved';
      } else {
        const r = s.billRequests.find(r => r.id === id);
        if (r) r.status = 'resolved';
      }
    });
    Toast.show('Request marked as resolved', 'success');
  }

  function confirmReset() {
    document.getElementById('reset-confirm-modal').classList.add('open');
  }

  function doReset() {
    Store.reset();
    document.getElementById('reset-confirm-modal').classList.remove('open');
    Toast.show('Demo data reset ✓', 'success');
    setTimeout(() => location.reload(), 800);
  }

  function bindAdminEvents() {
    document.getElementById('sidebar-dashboard')?.addEventListener('click', () => showAdminPage('dashboard'));
    document.getElementById('sidebar-orders')?.addEventListener('click',    () => showAdminPage('orders'));
    document.getElementById('sidebar-tables')?.addEventListener('click',    () => showAdminPage('tables'));
    document.getElementById('sidebar-menu')?.addEventListener('click',      () => showAdminPage('menu'));
    document.getElementById('sidebar-staff')?.addEventListener('click',     () => showAdminPage('staff'));
    document.getElementById('sidebar-reports')?.addEventListener('click',   () => showAdminPage('reports'));
    document.getElementById('sidebar-settings')?.addEventListener('click',  () => showAdminPage('settings'));
    document.getElementById('sidebar-qrcodes')?.addEventListener('click',   () => showAdminPage('qrcodes'));

    // Table modal close
    document.getElementById('table-detail-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('table-detail-modal')) {
        document.getElementById('table-detail-modal').classList.remove('open');
      }
    });
    document.getElementById('table-detail-close')?.addEventListener('click', () => {
      document.getElementById('table-detail-modal').classList.remove('open');
    });

    // Product form modal
    document.getElementById('product-form-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('product-form-modal')) closeProductForm();
    });
    document.getElementById('product-form-close')?.addEventListener('click', closeProductForm);

    // Reset modal
    document.getElementById('reset-cancel')?.addEventListener('click', () => {
      document.getElementById('reset-confirm-modal').classList.remove('open');
    });
    document.getElementById('reset-confirm')?.addEventListener('click', doReset);
  }

  return {
    init, showAdminPage, updateOrderStatus, toggleAvailability,
    setMenuCat, openAddProduct, openEditProduct, closeProductForm,
    saveProduct, saveSettings, openTableDetail, markTableAvailable,
    resolveRequest, confirmReset, downloadQR, printAllQR, previewTable,
    renderOrderCard,
  };
})();
