// ============================================================
// STORE — Centralized app state with localStorage persistence
// ============================================================

const STORAGE_KEY = 'fruity_bros_state';

const Store = (() => {
  let state = null;

  function getDefault() {
    return {
      orders: JSON.parse(JSON.stringify(initialOrders)),
      tables: JSON.parse(JSON.stringify(initialTables)),
      products: JSON.parse(JSON.stringify(products)),
      cart: [],
      waiterRequests: [],
      billRequests: [],
      notifications: [],
      restaurantConfig: JSON.parse(JSON.stringify(restaurantConfig)),
      orderCounter: 1048,
      activeView: 'customer', // customer | admin | kitchen
      activeTable: null,
      demoMode: true,
    };
  }

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = JSON.parse(saved);
        // Ensure new fields exist
        if (!state.billRequests) state.billRequests = [];
        if (!state.demoMode) state.demoMode = true;
      } else {
        state = getDefault();
        save();
      }
    } catch (e) {
      state = getDefault();
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function reset() {
    state = getDefault();
    save();
    return state;
  }

  function get() { return state; }

  function update(fn) {
    fn(state);
    save();
    EventBus.emit('stateChange', state);
  }

  return { load, save, get, update, reset };
})();

// ============================================================
// EVENT BUS
// ============================================================
const EventBus = (() => {
  const listeners = {};
  return {
    on(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
      return () => EventBus.off(event, fn);
    },
    off(event, fn) {
      if (listeners[event]) listeners[event] = listeners[event].filter(f => f !== fn);
    },
    emit(event, data) {
      (listeners[event] || []).forEach(fn => fn(data));
    },
  };
})();

// ============================================================
// CART UTILITIES
// ============================================================
const Cart = {
  add(item) {
    Store.update(s => {
      const existing = s.cart.find(c =>
        c.productId === item.productId &&
        c.sizeId === item.sizeId &&
        JSON.stringify(c.extraIds) === JSON.stringify(item.extraIds) &&
        JSON.stringify(c.options) === JSON.stringify(item.options)
      );
      if (existing) {
        existing.qty += item.qty;
        existing.totalPrice = existing.qty * existing.unitPrice;
      } else {
        s.cart.push({ ...item, cartId: 'c' + Date.now() + Math.random() });
      }
    });
    EventBus.emit('cartUpdate', Store.get().cart);
  },
  remove(cartId) {
    Store.update(s => { s.cart = s.cart.filter(c => c.cartId !== cartId); });
    EventBus.emit('cartUpdate', Store.get().cart);
  },
  updateQty(cartId, qty) {
    Store.update(s => {
      const item = s.cart.find(c => c.cartId === cartId);
      if (item) {
        if (qty <= 0) { s.cart = s.cart.filter(c => c.cartId !== cartId); }
        else { item.qty = qty; item.totalPrice = qty * item.unitPrice; }
      }
    });
    EventBus.emit('cartUpdate', Store.get().cart);
  },
  clear() {
    Store.update(s => { s.cart = []; });
    EventBus.emit('cartUpdate', []);
  },
  total() {
    return Store.get().cart.reduce((sum, i) => sum + i.totalPrice, 0);
  },
  count() {
    return Store.get().cart.reduce((sum, i) => sum + i.qty, 0);
  },
};

// ============================================================
// ORDER UTILITIES
// ============================================================
const Orders = {
  create(orderData) {
    let newOrder;
    Store.update(s => {
      const id = `ORD-${s.orderCounter++}`;
      newOrder = {
        id,
        tableNum: orderData.tableNum,
        tableId: orderData.tableId,
        customerName: orderData.customerName || 'Walk-in',
        customerPhone: orderData.customerPhone || '',
        items: orderData.items,
        subtotal: orderData.subtotal,
        total: orderData.total,
        status: 'pending',
        notes: orderData.notes || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      s.orders.unshift(newOrder);
      // Update table status
      const table = s.tables.find(t => t.id === orderData.tableId);
      if (table) { table.status = 'occupied'; table.orderId = id; }
    });
    EventBus.emit('orderCreated', newOrder);
    Notifications.add(`New order ${newOrder.id} — Table ${newOrder.tableNum}`, 'order');
    return newOrder;
  },

  updateStatus(orderId, newStatus) {
    Store.update(s => {
      const order = s.orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        order.updatedAt = Date.now();
        if (newStatus === 'completed') {
          const table = s.tables.find(t => t.id === order.tableId);
          if (table) { table.status = 'available'; table.orderId = null; }
        }
      }
    });
    EventBus.emit('orderUpdated', orderId);
  },

  getById(id) { return Store.get().orders.find(o => o.id === id); },

  getByStatus(status) {
    if (!status || status === 'all') return Store.get().orders;
    return Store.get().orders.filter(o => o.status === status);
  },
};

// ============================================================
// NOTIFICATIONS
// ============================================================
const Notifications = {
  add(message, type = 'info') {
    Store.update(s => {
      s.notifications.unshift({
        id: 'n' + Date.now(),
        message, type,
        read: false,
        time: Date.now(),
      });
      if (s.notifications.length > 50) s.notifications.pop();
    });
    EventBus.emit('notification', { message, type });
  },
  markRead(id) {
    Store.update(s => {
      const n = s.notifications.find(n => n.id === id);
      if (n) n.read = true;
    });
  },
  unreadCount() { return Store.get().notifications.filter(n => !n.read).length; },
};

// ============================================================
// HELPERS
// ============================================================
function fmt(amount) {
  const currency = Store.get().restaurantConfig.currency || '৳';
  return currency + amount.toLocaleString('en-BD');
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });
}

function statusLabel(status) {
  return { pending: 'Pending', preparing: 'Preparing', ready: 'Ready', completed: 'Completed', rejected: 'Rejected' }[status] || status;
}

function statusColor(status) {
  return {
    pending: '#f59e0b',
    preparing: '#3b82f6',
    ready: '#10b981',
    completed: '#6b7280',
    rejected: '#ef4444',
  }[status] || '#6b7280';
}

function getTableNum() {
  const params = new URLSearchParams(window.location.search);
  const t = params.get('table');
  return t ? parseInt(t) : (Store.get().activeTable || 7);
}

function getTableId(num) { return `t${num}`; }

function generateQRPattern(tableNum, size = 80) {
  // Simple visual QR-like pattern (not real QR, just aesthetic)
  const seed = tableNum * 7919;
  const cells = 11;
  const cellSize = Math.floor(size / cells);
  const rng = (n) => ((seed * n * 1103515245 + 12345) & 0x7fffffff) % 2;
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cells} ${cells}">`;
  svg += `<rect width="${cells}" height="${cells}" fill="white"/>`;
  // Finder patterns (corners)
  [[0,0],[0,cells-7],[cells-7,0]].forEach(([x,y]) => {
    svg += `<rect x="${x}" y="${y}" width="7" height="7" fill="#1a1a2e"/>`;
    svg += `<rect x="${x+1}" y="${y+1}" width="5" height="5" fill="white"/>`;
    svg += `<rect x="${x+2}" y="${y+2}" width="3" height="3" fill="#1a1a2e"/>`;
  });
  // Data cells
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isFinderZone = (r < 8 && c < 8) || (r < 8 && c > cells - 9) || (r > cells - 9 && c < 8);
      if (!isFinderZone && rng(r * cells + c + tableNum)) {
        svg += `<rect x="${c}" y="${r}" width="1" height="1" fill="#1a1a2e"/>`;
      }
    }
  }
  svg += `</svg>`;
  return svg;
}
