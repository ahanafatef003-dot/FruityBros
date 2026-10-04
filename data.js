// ============================================================
// URBAN BREW — CENTRAL DATA & CONFIGURATION
// To white-label: replace restaurantConfig values only.
// ============================================================

const restaurantConfig = {
  id: 'fruity-bros',
  name: 'Fruity Bros',
  tagline: 'Fresh Sips • Good Vibes',
  logo: '🍊',
  phone: '+880 1712-345678',
  address: 'House 12, Road 7, Banani, Dhaka 1213',
  currency: '৳',
  currencyCode: 'BDT',
  openingHours: '8:00 AM – 11:00 PM',
  tableCount: 20,
  primaryColor: '#221c27',
  accentColor: '#ff6a2b',
  themeMode: 'light',
  restaurantUrl: 'fruity-bros.menuqr.app',
  serviceChargePercent: 0,
  taxPercent: 0,
};

const categories = [
  { id: 'coffee',    name: 'Coffee',      icon: '☕', color: '#6b4c2a' },
  { id: 'cold',      name: 'Cold Drinks', icon: '🧊', color: '#2a7fbf' },
  { id: 'burgers',   name: 'Burgers',     icon: '🍔', color: '#c8600a' },
  { id: 'pizza',     name: 'Pizza',       icon: '🍕', color: '#c84b0a' },
  { id: 'pasta',     name: 'Pasta',       icon: '🍝', color: '#b5860d' },
  { id: 'desserts',  name: 'Desserts',    icon: '🍰', color: '#a0449e' },
  { id: 'snacks',    name: 'Snacks',      icon: '🍟', color: '#c8a00a' },
];

const products = [
  // COFFEE
  {
    id: 'p1', categoryId: 'coffee', name: 'Cappuccino',
    description: 'Espresso with rich steamed milk foam, perfectly balanced for coffee lovers.',
    price: 180, available: true, popular: true, prepTime: 5,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
    sizes: [{ id: 's', label: 'Small', price: 0 }, { id: 'm', label: 'Medium', price: 20 }, { id: 'l', label: 'Large', price: 40 }],
    extras: [{ id: 'xshot', label: 'Extra Shot', price: 30 }, { id: 'oatmilk', label: 'Oat Milk', price: 40 }],
    options: ['No Sugar', 'Less Sweet', 'Extra Hot'],
    defaultSize: 'm',
  },
  {
    id: 'p2', categoryId: 'coffee', name: 'Café Latte',
    description: 'Smooth espresso with velvety steamed milk, a daily ritual in a cup.',
    price: 200, available: true, popular: true, prepTime: 5,
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&q=80',
    sizes: [{ id: 's', label: 'Small', price: 0 }, { id: 'm', label: 'Medium', price: 20 }, { id: 'l', label: 'Large', price: 40 }],
    extras: [{ id: 'xshot', label: 'Extra Shot', price: 30 }, { id: 'vanilla', label: 'Vanilla Syrup', price: 25 }],
    options: ['No Sugar', 'Extra Foam', 'Decaf'],
    defaultSize: 'm',
  },
  {
    id: 'p3', categoryId: 'coffee', name: 'Americano',
    description: 'Bold espresso diluted with hot water, clean and strong.',
    price: 150, available: true, popular: false, prepTime: 4,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
    sizes: [{ id: 's', label: 'Small', price: 0 }, { id: 'm', label: 'Medium', price: 20 }, { id: 'l', label: 'Large', price: 40 }],
    extras: [{ id: 'xshot', label: 'Extra Shot', price: 30 }],
    options: ['No Sugar', 'Extra Strong'],
    defaultSize: 'm',
  },
  {
    id: 'p4', categoryId: 'coffee', name: 'Flat White',
    description: 'Double ristretto with microfoam milk — the Australians got this one right.',
    price: 210, available: true, popular: false, prepTime: 5,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80',
    sizes: [{ id: 's', label: 'Small', price: 0 }, { id: 'm', label: 'Medium', price: 20 }],
    extras: [{ id: 'oatmilk', label: 'Oat Milk', price: 40 }],
    options: ['No Sugar', 'Decaf'],
    defaultSize: 's',
  },
  // COLD DRINKS
  {
    id: 'p5', categoryId: 'cold', name: 'Iced Coffee',
    description: 'Chilled espresso over ice with your choice of milk, refreshingly bold.',
    price: 220, available: true, popular: true, prepTime: 5,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    sizes: [{ id: 'm', label: 'Medium', price: 0 }, { id: 'l', label: 'Large', price: 30 }],
    extras: [{ id: 'xshot', label: 'Extra Shot', price: 30 }, { id: 'vanilla', label: 'Vanilla Syrup', price: 25 }],
    options: ['No Sugar', 'Less Ice', 'Extra Ice'],
    defaultSize: 'm',
  },
  {
    id: 'p6', categoryId: 'cold', name: 'Cold Brew',
    description: 'Steeped overnight for 18 hours, smooth with zero bitterness.',
    price: 250, available: true, popular: false, prepTime: 2,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80',
    sizes: [{ id: 'm', label: 'Medium', price: 0 }, { id: 'l', label: 'Large', price: 30 }],
    extras: [{ id: 'cream', label: 'Sweet Cream', price: 35 }],
    options: ['No Ice', 'Less Ice'],
    defaultSize: 'm',
  },
  {
    id: 'p7', categoryId: 'cold', name: 'Mango Lassi',
    description: 'Fresh Rajshahi mango blended with creamy yoghurt, chilled and sweet.',
    price: 180, available: true, popular: false, prepTime: 5,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
    sizes: [{ id: 'm', label: 'Medium', price: 0 }, { id: 'l', label: 'Large', price: 30 }],
    extras: [],
    options: ['Less Sweet', 'Extra Thick'],
    defaultSize: 'm',
  },
  // BURGERS
  {
    id: 'p8', categoryId: 'burgers', name: 'Chicken Burger',
    description: 'Crispy fried chicken with lettuce, tomato, cheese and our secret sauce.',
    price: 280, available: true, popular: true, prepTime: 15,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    sizes: [{ id: 'reg', label: 'Regular', price: 0 }, { id: 'dbl', label: 'Double Patty', price: 80 }],
    extras: [{ id: 'xcheese', label: 'Extra Cheese', price: 30 }, { id: 'xsauce', label: 'Extra Sauce', price: 15 }, { id: 'fries', label: 'Side Fries', price: 80 }],
    options: ['No Onion', 'No Lettuce', 'Extra Spicy', 'Well Done'],
    defaultSize: 'reg',
  },
  {
    id: 'p9', categoryId: 'burgers', name: 'Beef Burger',
    description: 'Juicy 100g beef patty, caramelised onions, pickles and smoky BBQ sauce.',
    price: 320, available: true, popular: true, prepTime: 18,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
    sizes: [{ id: 'reg', label: 'Regular', price: 0 }, { id: 'dbl', label: 'Double Patty', price: 100 }],
    extras: [{ id: 'xcheese', label: 'Extra Cheese', price: 30 }, { id: 'bacon', label: 'Beef Bacon', price: 60 }, { id: 'fries', label: 'Side Fries', price: 80 }],
    options: ['No Onion', 'No Pickles', 'Extra Spicy', 'Well Done', 'Medium'],
    defaultSize: 'reg',
  },
  {
    id: 'p10', categoryId: 'burgers', name: 'Veggie Burger',
    description: 'Crispy plant-based patty with fresh greens, tomato and herb mayo.',
    price: 240, available: false, popular: false, prepTime: 12,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80',
    sizes: [{ id: 'reg', label: 'Regular', price: 0 }],
    extras: [{ id: 'xcheese', label: 'Extra Cheese', price: 30 }],
    options: ['No Onion', 'Extra Spicy'],
    defaultSize: 'reg',
  },
  // PIZZA
  {
    id: 'p11', categoryId: 'pizza', name: 'Margherita Pizza',
    description: 'Classic San Marzano tomato base, fresh mozzarella and basil.',
    price: 380, available: true, popular: false, prepTime: 20,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    sizes: [{ id: 'sm', label: '7" Personal', price: 0 }, { id: 'md', label: '10" Medium', price: 100 }, { id: 'lg', label: '12" Large', price: 180 }],
    extras: [{ id: 'xcheese', label: 'Extra Cheese', price: 50 }, { id: 'olives', label: 'Olives', price: 30 }],
    options: ['Thin Crust', 'Thick Crust', 'Extra Crispy'],
    defaultSize: 'sm',
  },
  {
    id: 'p12', categoryId: 'pizza', name: 'Chicken BBQ Pizza',
    description: 'Tender BBQ chicken, red onions, bell peppers on smoky BBQ sauce base.',
    price: 450, available: true, popular: true, prepTime: 22,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    sizes: [{ id: 'sm', label: '7" Personal', price: 0 }, { id: 'md', label: '10" Medium', price: 100 }, { id: 'lg', label: '12" Large', price: 180 }],
    extras: [{ id: 'xcheese', label: 'Extra Cheese', price: 50 }, { id: 'xchicken', label: 'Extra Chicken', price: 80 }],
    options: ['Thin Crust', 'Thick Crust', 'Extra Spicy'],
    defaultSize: 'sm',
  },
  // PASTA
  {
    id: 'p13', categoryId: 'pasta', name: 'Chicken Pasta',
    description: 'Grilled chicken with penne in a rich creamy white sauce, parmesan on top.',
    price: 350, available: true, popular: true, prepTime: 18,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
    sizes: [{ id: 'reg', label: 'Regular', price: 0 }, { id: 'lrg', label: 'Large', price: 60 }],
    extras: [{ id: 'xchicken', label: 'Extra Chicken', price: 80 }, { id: 'bread', label: 'Garlic Bread', price: 60 }],
    options: ['Less Spicy', 'Extra Spicy', 'No Mushroom'],
    defaultSize: 'reg',
  },
  {
    id: 'p14', categoryId: 'pasta', name: 'Beef Arrabiata',
    description: 'Spicy beef ragù with spaghetti in a bold San Marzano tomato sauce.',
    price: 390, available: true, popular: false, prepTime: 20,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
    sizes: [{ id: 'reg', label: 'Regular', price: 0 }, { id: 'lrg', label: 'Large', price: 60 }],
    extras: [{ id: 'bread', label: 'Garlic Bread', price: 60 }, { id: 'parm', label: 'Extra Parmesan', price: 25 }],
    options: ['Less Spicy', 'Extra Spicy'],
    defaultSize: 'reg',
  },
  // DESSERTS
  {
    id: 'p15', categoryId: 'desserts', name: 'Chocolate Brownie',
    description: 'Fudgy warm brownie with vanilla ice cream and chocolate drizzle.',
    price: 180, available: true, popular: true, prepTime: 8,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
    sizes: [],
    extras: [{ id: 'icecream', label: 'Extra Ice Cream', price: 60 }, { id: 'caramel', label: 'Caramel Sauce', price: 25 }],
    options: ['Warm', 'Cold', 'No Ice Cream'],
    defaultSize: null,
  },
  {
    id: 'p16', categoryId: 'desserts', name: 'Cheesecake',
    description: 'Classic New York-style cheesecake with a buttery graham crust.',
    price: 220, available: true, popular: true, prepTime: 5,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
    sizes: [],
    extras: [{ id: 'berries', label: 'Berry Compote', price: 40 }, { id: 'cream', label: 'Whipped Cream', price: 25 }],
    options: ['Strawberry Topping', 'Blueberry Topping'],
    defaultSize: null,
  },
  {
    id: 'p17', categoryId: 'desserts', name: 'Tiramisu',
    description: 'Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa.',
    price: 260, available: true, popular: false, prepTime: 5,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
    sizes: [],
    extras: [],
    options: [],
    defaultSize: null,
  },
  // SNACKS
  {
    id: 'p18', categoryId: 'snacks', name: 'French Fries',
    description: 'Golden crispy fries seasoned with house spice blend and sea salt.',
    price: 160, available: true, popular: true, prepTime: 10,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80',
    sizes: [{ id: 'reg', label: 'Regular', price: 0 }, { id: 'lrg', label: 'Large', price: 40 }],
    extras: [{ id: 'cheese', label: 'Cheese Dip', price: 30 }, { id: 'aioli', label: 'Garlic Aioli', price: 20 }],
    options: ['Extra Salt', 'Less Salt', 'Extra Spicy', 'No Spice'],
    defaultSize: 'reg',
  },
  {
    id: 'p19', categoryId: 'snacks', name: 'Chicken Wings',
    description: 'Crispy buffalo wings tossed in tangy hot sauce, served with blue cheese dip.',
    price: 320, available: true, popular: true, prepTime: 15,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80',
    sizes: [{ id: '6pc', label: '6 pcs', price: 0 }, { id: '12pc', label: '12 pcs', price: 260 }],
    extras: [{ id: 'xsauce', label: 'Extra Hot Sauce', price: 15 }, { id: 'dip', label: 'Blue Cheese Dip', price: 30 }],
    options: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
    defaultSize: '6pc',
  },
  {
    id: 'p20', categoryId: 'snacks', name: 'Onion Rings',
    description: 'Beer-battered onion rings, golden and crunchy, served with chipotle mayo.',
    price: 140, available: true, popular: false, prepTime: 10,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80',
    sizes: [{ id: 'reg', label: 'Regular', price: 0 }],
    extras: [],
    options: ['Extra Crispy'],
    defaultSize: 'reg',
  },
];

const staffMembers = [
  { id: 'st1', name: 'Rafiqul Ahmed', role: 'Manager', avatar: 'RA', status: 'active', shift: '8 AM – 5 PM' },
  { id: 'st2', name: 'Karim Hossain', role: 'Head Chef', avatar: 'KH', status: 'active', shift: '9 AM – 6 PM' },
  { id: 'st3', name: 'Nusrat Jahan', role: 'Barista', avatar: 'NJ', status: 'active', shift: '10 AM – 7 PM' },
  { id: 'st4', name: 'Imran Siddiqui', role: 'Waiter', avatar: 'IS', status: 'active', shift: '12 PM – 9 PM' },
  { id: 'st5', name: 'Fatema Begum', role: 'Waiter', avatar: 'FB', status: 'active', shift: '3 PM – 11 PM' },
  { id: 'st6', name: 'Tariq Rahman', role: 'Kitchen Staff', avatar: 'TR', status: 'off', shift: 'Day Off' },
];

// Initial demo orders for the dashboard
const initialOrders = [
  {
    id: 'ORD-1044', tableNum: 3, tableId: 't3',
    customerName: 'Walk-in', customerPhone: '',
    items: [
      { productId: 'p1', name: 'Cappuccino', size: 'Medium', extras: [], options: [], qty: 2, unitPrice: 200, totalPrice: 400 },
    ],
    subtotal: 400, total: 400,
    status: 'completed', notes: '',
    createdAt: Date.now() - 90 * 60000,
    updatedAt: Date.now() - 60 * 60000,
  },
  {
    id: 'ORD-1045', tableNum: 5, tableId: 't5',
    customerName: 'Asha', customerPhone: '',
    items: [
      { productId: 'p8', name: 'Chicken Burger', size: 'Regular', extras: ['Extra Cheese'], options: ['No Onion'], qty: 1, unitPrice: 310, totalPrice: 310 },
      { productId: 'p18', name: 'French Fries', size: 'Large', extras: [], options: [], qty: 1, unitPrice: 200, totalPrice: 200 },
    ],
    subtotal: 510, total: 510,
    status: 'ready', notes: 'Extra napkins please',
    createdAt: Date.now() - 40 * 60000,
    updatedAt: Date.now() - 15 * 60000,
  },
  {
    id: 'ORD-1046', tableNum: 12, tableId: 't12',
    customerName: 'Bashir', customerPhone: '+880 1900-112233',
    items: [
      { productId: 'p12', name: 'Chicken BBQ Pizza', size: '7" Personal', extras: ['Extra Cheese'], options: ['Thin Crust'], qty: 1, unitPrice: 500, totalPrice: 500 },
      { productId: 'p5', name: 'Iced Coffee', size: 'Medium', extras: [], options: [], qty: 2, unitPrice: 220, totalPrice: 440 },
    ],
    subtotal: 940, total: 940,
    status: 'preparing', notes: '',
    createdAt: Date.now() - 25 * 60000,
    updatedAt: Date.now() - 10 * 60000,
  },
  {
    id: 'ORD-1047', tableNum: 8, tableId: 't8',
    customerName: 'Walk-in', customerPhone: '',
    items: [
      { productId: 'p9', name: 'Beef Burger', size: 'Double Patty', extras: ['Extra Cheese', 'Beef Bacon'], options: ['Well Done'], qty: 1, unitPrice: 510, totalPrice: 510 },
      { productId: 'p1', name: 'Cappuccino', size: 'Large', extras: [], options: [], qty: 1, unitPrice: 220, totalPrice: 220 },
    ],
    subtotal: 730, total: 730,
    status: 'pending', notes: 'No rush',
    createdAt: Date.now() - 5 * 60000,
    updatedAt: Date.now() - 5 * 60000,
  },
];

// Table states
const initialTables = Array.from({ length: 20 }, (_, i) => ({
  id: `t${i + 1}`,
  num: i + 1,
  capacity: i % 4 === 0 ? 6 : i % 3 === 0 ? 4 : 2,
  status: 'available', // available | occupied | waiting | bill-requested
  orderId: null,
}));

// Link demo orders to tables
initialTables[2].status = 'occupied'; initialTables[2].orderId = 'ORD-1044';
initialTables[4].status = 'bill-requested'; initialTables[4].orderId = 'ORD-1045';
initialTables[11].status = 'occupied'; initialTables[11].orderId = 'ORD-1046';
initialTables[7].status = 'occupied'; initialTables[7].orderId = 'ORD-1047';

// Reports mock data
const reportData = {
  todaySales: 24850,
  todayOrders: 47,
  weekSales: [12400, 18600, 21300, 19800, 24850, 0, 0],
  weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  monthlySales: 284500,
  topProducts: [
    { name: 'Chicken Burger', orders: 32, revenue: 8960 },
    { name: 'Cappuccino', orders: 27, revenue: 5400 },
    { name: 'Iced Coffee', orders: 21, revenue: 4620 },
    { name: 'French Fries', orders: 19, revenue: 3040 },
    { name: 'Beef Burger', orders: 14, revenue: 4480 },
    { name: 'Cheesecake', orders: 11, revenue: 2420 },
  ],
  categoryRevenue: [
    { name: 'Coffee', pct: 31 },
    { name: 'Burgers', pct: 27 },
    { name: 'Pizza', pct: 18 },
    { name: 'Pasta', pct: 12 },
    { name: 'Desserts', pct: 7 },
    { name: 'Snacks', pct: 5 },
  ],
  peakHours: [0,0,0,0,0,0,0,2,8,14,18,21,24,20,18,22,28,32,38,35,22,12,5,1],
};
