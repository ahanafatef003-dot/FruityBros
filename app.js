// ============================================================
// KITCHEN DISPLAY SYSTEM
// ============================================================

const KitchenApp = (() => {
  let clockInterval = null;
  let initialized = false;

  function init() {
    renderKitchen();
    startClock();
    if (initialized) return;
    initialized = true;
    EventBus.on('stateChange', renderKitchen);
    EventBus.on('orderCreated', renderKitchen);
    EventBus.on('orderUpdated', renderKitchen);
  }

  function startClock() {
    if (clockInterval) clearInterval(clockInterval);
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  function updateClock() {
    const el = document.getElementById('kitchen-clock');
    const dateEl = document.getElementById('kitchen-date');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long' });
    }
  }

  function renderKitchen() {
    const s = Store.get();
    const newOrders  = s.orders.filter(o => o.status === 'pending');
    const prepOrders = s.orders.filter(o => o.status === 'preparing');
    const readyOrders= s.orders.filter(o => o.status === 'ready');

    const activeCount = newOrders.length + prepOrders.length + readyOrders.length;

    // Update active count badge
    const badge = document.getElementById('kitchen-active-count');
    if (badge) badge.textContent = `Active Orders: ${activeCount}`;

    // Column counts
    setColCount('col-new-count',  newOrders.length);
    setColCount('col-prep-count', prepOrders.length);
    setColCount('col-ready-count',readyOrders.length);

    // Render columns
    renderKitchenCol('col-new-orders',   newOrders,   'new');
    renderKitchenCol('col-prep-orders',  prepOrders,  'prep');
    renderKitchenCol('col-ready-orders', readyOrders, 'ready');
  }

  function setColCount(id, count) {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  }

  function renderKitchenCol(containerId, orders, colType) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (orders.length === 0) {
      el.innerHTML = `
        <div class="kitchen-empty">
          <div class="kitchen-empty-icon">${colType === 'ready' ? '✅' : '👌'}</div>
          <div class="kitchen-empty-text">
            ${colType === 'new' ? 'No new orders' : colType === 'prep' ? 'Nothing preparing' : 'Kitchen is clear'}
          </div>
        </div>
      `;
      return;
    }

    el.innerHTML = orders.map(o => renderKitchenCard(o, colType)).join('');
  }

  function renderKitchenCard(o, colType) {
    const waitMins = Math.floor((Date.now() - o.createdAt) / 60000);
    const isUrgent = waitMins > 20 && colType !== 'ready';

    return `
      <div class="kitchen-card col-${colType}" id="kc-${o.id}">
        <div class="kc-header">
          <div>
            <div class="kc-id" style="${isUrgent ? 'color:#f87171' : ''}">${o.id}</div>
            <div class="kc-table">TABLE ${String(o.tableNum).padStart(2,'0')}
              ${o.customerName !== 'Walk-in' ? ` · ${o.customerName}` : ''}
            </div>
          </div>
          <div style="text-align:right">
            <div class="kc-time">${fmtTime(o.createdAt)}</div>
            <div style="font-size:11px;color:${isUrgent ? '#f87171' : 'rgba(255,255,255,.3)'}">
              ${waitMins}m ago
            </div>
          </div>
        </div>

        <div class="kc-items">
          ${o.items.map(item => `
            <div class="kc-item">
              <div>
                <div class="kc-item-name">${item.name}</div>
                <div class="kc-item-mods">
                  ${[
                    item.size,
                    ...(item.extras || []),
                    ...(item.options || [])
                  ].filter(Boolean).join(' · ') || ''}
                </div>
              </div>
              <div class="kc-item-qty">×${item.qty}</div>
            </div>
          `).join('')}
        </div>

        ${o.notes ? `<div class="kc-notes">📝 ${o.notes}</div>` : ''}

        <div class="kc-footer">
          <div class="kc-total">${fmt(o.total)}</div>
          ${kitchenActionBtn(o, colType)}
        </div>
      </div>
    `;
  }

  function kitchenActionBtn(o, colType) {
    switch (colType) {
      case 'new':
        return `<button class="kitchen-btn accept" onclick="KitchenApp.kitchenAction('${o.id}','preparing')">
          ACCEPT
        </button>`;
      case 'prep':
        return `<button class="kitchen-btn prep" onclick="KitchenApp.kitchenAction('${o.id}','ready')">
          MARK READY
        </button>`;
      case 'ready':
        return `<button class="kitchen-btn ready" onclick="KitchenApp.kitchenAction('${o.id}','completed')">
          COMPLETED
        </button>`;
      default:
        return '';
    }
  }

  function kitchenAction(orderId, newStatus) {
    Orders.updateStatus(orderId, newStatus);
    const label = newStatus === 'preparing' ? 'Accepted' : newStatus === 'ready' ? 'Marked Ready' : 'Completed';
    Toast.show(`${orderId} — ${label}`, 'success');
  }

  function destroy() {
    if (clockInterval) clearInterval(clockInterval);
  }

  return { init, kitchenAction, destroy };
})();


// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================

const Toast = (() => {
  const ICONS = { success: '✓', error: '✕', info: 'ℹ', order: '📋', waiter: '🔔', bill: '🧾' };

  function show(message, type = 'info', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 220);
    }, duration);
  }

  return { show };
})();


// ============================================================
// VIEW SWITCHER & DEMO CONTROLLER
// ============================================================

const AppController = (() => {
  let currentView = 'customer';

  function init() {
    Store.load();
    applyURLParams();
    switchView(currentView);
    bindSwitcher();
  }

  function applyURLParams() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const table = params.get('table');
    const restaurant = params.get('restaurant');

    if (table) {
      Store.update(s => { s.activeTable = parseInt(table); });
    }

    if (view === 'admin') currentView = 'admin';
    else if (view === 'kitchen') currentView = 'kitchen';
    else currentView = 'customer';
  }

  function switchView(view) {
    currentView = view;

    // Hide all app shells
    document.getElementById('customer-app').style.display = 'none';
    document.getElementById('admin-app').classList.remove('active');
    document.getElementById('kitchen-app').classList.remove('active');

    // Update switcher buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    if (view === 'customer') {
      document.getElementById('customer-app').style.display = 'flex';
      CustomerApp.init();
    } else if (view === 'admin') {
      document.getElementById('admin-app').classList.add('active');
      AdminApp.init();
    } else if (view === 'kitchen') {
      document.getElementById('kitchen-app').classList.add('active');
      KitchenApp.init();
    }
  }

  function bindSwitcher() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
  }

  return { init, switchView };
})();


// ============================================================
// BOOT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});
