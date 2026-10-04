# Fruity Bros — QR Menu & Table Ordering System

A complete, production-quality frontend prototype for a restaurant QR ordering
system. Built for demo with a real cafe owner.

---

## How to Run

No build step. No server needed.

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. That's it.

For best experience, open Chrome DevTools → toggle device toolbar → select iPhone 14 Pro
(for the customer view). The admin and kitchen views are desktop-first.

---

## Demo URLs / Routes

All routing is done via URL query parameters on `index.html`:

| URL | What it shows |
|-----|--------------|
| `index.html` | Customer menu, auto-detects Table 7 |
| `index.html?table=3` | Customer menu for Table 3 |
| `index.html?view=admin` | Restaurant admin dashboard |
| `index.html?view=kitchen` | Kitchen display system |
| `index.html?restaurant=fruity-bros&table=12` | Table 12 (QR code URL format) |

The **Demo Mode switcher** (bottom-right corner) lets you jump between all three
views without changing the URL.

---

## Full Demo Flow (25-step walkthrough)

1. Open `index.html` → Customer App loads for Table 07
2. Browse categories — tap "Burgers"
3. Tap **Chicken Burger** → product modal opens
4. Select "Double Patty" + "Extra Cheese" + "No Onion"
5. Increase quantity to 2 → price updates live
6. Tap **Add to Cart**
7. Add a Cappuccino as well
8. Tap Cart icon → see items, total
9. Tap **Place Order** → fill name/notes → **Place Order →**
10. Order success screen shows with order ID (e.g. ORD-1048) and live status tracker
11. Switch to **Admin** view (demo switcher)
12. Dashboard → see ORD-1048 in Recent Orders (Pending)
13. Go to **Orders** → Pending tab → tap **Accept & Prepare**
14. Switch to **Kitchen** view
15. ORD-1048 moves to PREPARING column → tap **MARK READY**
16. Switch back to **Customer** → order status auto-refreshes to "Ready to Serve"
17. Switch to Admin → Orders → tap **Complete**
18. Customer order shows "Completed"
19. Back to Customer → tap 🔔 Call Waiter → select "Request water" → Send
20. Admin Dashboard → Waiter & Bill Requests panel shows the request
21. Customer → tap "Request Bill" → confirm
22. Admin → Tables page → Table 07 shows "Bill Requested" state
23. Admin → Menu → toggle a product's availability (e.g. Veggie Burger off)
24. Customer → Veggie Burger now shows "SOLD OUT"
25. Admin → QR Codes → all 20 table QR codes visible → tap Preview to open table URL

---

## Project Structure

```
fruity-bros/
├── index.html      Main HTML shell — all three app views + all modals
├── styles.css      Complete design system (4800+ lines, no external CSS)
├── data.js         Restaurant config, products, categories, staff, reports data
├── store.js        Centralized state management + localStorage persistence
├── customer.js     Customer app — menu, cart, checkout, order tracking, waiter
├── admin.js        Admin dashboard — orders, tables, menu mgmt, staff, reports, QR
└── app.js          Kitchen display + toast system + view switcher + boot
```

---

## Where to Configure Things

### Restaurant Branding
`data.js` → `restaurantConfig` object (top of file)
```js
const restaurantConfig = {
  name: 'Fruity Bros',
  tagline: 'Fresh Sips • Good Vibes',
  currency: '৳',
  phone: '+880 1712-345678',
  // ... etc
};
```

### Products / Menu
`data.js` → `products` array
Each product has: `id, categoryId, name, description, price, available, popular, image, sizes[], extras[], options[]`

### Categories
`data.js` → `categories` array

### Demo Orders (pre-loaded)
`data.js` → `initialOrders` array

### Staff Members
`data.js` → `staffMembers` array

### Reports / Analytics Data
`data.js` → `reportData` object

---

## Connecting a Real Backend (Later)

The app is structured so that replacing mock data with API calls is minimal work.

**Step 1:** Replace `Store.load()` with a fetch from your API:
```js
// store.js — replace localStorage with:
async function loadFromAPI() {
  const res = await fetch('/api/restaurant/fruity-bros');
  state = await res.json();
}
```

**Step 2:** Replace `Orders.create()` with a POST:
```js
// In store.js Orders.create():
const res = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify(orderData)
});
const newOrder = await res.json();
```

**Step 3:** Add WebSocket for real-time order updates:
```js
const ws = new WebSocket('wss://your-api/ws/orders');
ws.onmessage = (e) => {
  const { orderId, status } = JSON.parse(e.data);
  Orders.updateStatus(orderId, status); // already wired to re-render
};
```

**Step 4:** Replace `generateQRPattern()` with a real QR library (e.g. `qrcode.js`):
```js
QRCode.toCanvas(canvas, `https://${config.restaurantUrl}?table=${num}`);
```

All UI logic, state management, and rendering stay exactly as-is.

---

## Multi-Tenant / White-Label

The system is built for multiple restaurants from the start.

- All restaurant data lives in `restaurantConfig` in `data.js`
- The customer URL format `?restaurant=fruity-bros&table=07` is already implemented
- To add a second restaurant: duplicate `data.js` with a new `restaurantConfig.id`
- QR codes auto-generate per-restaurant per-table URLs

---

## Tech Stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom design system, CSS variables, no framework
- **Vanilla JavaScript** — ES6+, IIFE modules, EventBus pattern
- **Google Fonts** — Inter (loaded via CDN)
- **localStorage** — persistence across page refreshes

No React. No Vue. No build step. Opens directly in any browser.

---

*Fruity Bros QR Menu System — Frontend Prototype v1.0*
