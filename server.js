const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { COLORS, FABRICS, HARDWARE_FINISHES, PRODUCTS } = require('./data/products');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const STORE_PATH = path.join(__dirname, 'data', 'store.json');

app.use(express.json({ limit: '1mb' }));

// Serve static frontend & local Three.js modules
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules', 'three')));

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, key] = String(storedHash || '').split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(String(password), salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    city: user.city || 'Lahore',
    preferredSize: user.preferredSize || '34C / M',
    tier: user.tier || 'Atelier Member',
    createdAt: user.createdAt
  };
}

function readStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const initial = {
        cart: [],
        orders: [],
        users: [
          {
            id: 'demo-ayesha',
            name: 'Ayesha Khan',
            email: 'ayesha@noorandsilk.pk',
            phone: '0300-1234567',
            city: 'Lahore',
            preferredSize: '34C / M',
            tier: 'Bridal Atelier VIP',
            passwordHash: hashPassword('noor1234'),
            createdAt: new Date().toISOString()
          }
        ],
        sessions: {}
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const users = Array.isArray(parsed.users) ? parsed.users : [];
    if (users.length === 0) {
      users.push({
        id: 'demo-ayesha',
        name: 'Ayesha Khan',
        email: 'ayesha@noorandsilk.pk',
        phone: '0300-1234567',
        city: 'Lahore',
        preferredSize: '34C / M',
        tier: 'Bridal Atelier VIP',
        passwordHash: hashPassword('noor1234'),
        createdAt: new Date().toISOString()
      });
    }
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      users,
      sessions: parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {}
    };
  } catch (err) {
    return { cart: [], orders: [], users: [], sessions: {} };
  }
}

function writeStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

const UNIVERSAL_DISCOUNT_RATE = 0.10;

function summarizeCart(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discountAmount = Math.round(subtotal * UNIVERSAL_DISCOUNT_RATE);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const freeShippingThreshold = 7500;
  const freeGiftThreshold = 10000;
  const shippingFee = discountedSubtotal === 0 || discountedSubtotal >= freeShippingThreshold ? 0 : 250;

  return {
    items: cart,
    itemCount,
    subtotal,
    discountRate: 10,
    discountLabel: '10% OFF For Everyone',
    discountAmount,
    discountedSubtotal,
    shippingFee,
    total: discountedSubtotal + shippingFee,
    freeShippingUnlocked: discountedSubtotal >= freeShippingThreshold,
    freeShippingRemaining: Math.max(0, freeShippingThreshold - discountedSubtotal),
    freeWashBagUnlocked: discountedSubtotal >= freeGiftThreshold,
    freeWashBagRemaining: Math.max(0, freeGiftThreshold - discountedSubtotal)
  };
}

function getRelatedProducts(product) {
  const explicitlyRelated = (product.relatedIds || [])
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);
  if (explicitlyRelated.length >= 3) {
    return explicitlyRelated.slice(0, 4);
  }
  const fallback = PRODUCTS.filter(
    (p) => p.id !== product.id && !explicitlyRelated.some((r) => r.id === p.id)
  );
  return [...explicitlyRelated, ...fallback].slice(0, 4);
}

// Auth API (Register, Login, Session Check, Logout)
function getTokenFromReq(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
}

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone = '', city = 'Lahore', password, preferredSize = '34C / M' } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const store = readStore();
  if (store.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const user = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    city: String(city).trim(),
    preferredSize: String(preferredSize).trim(),
    tier: 'Atelier Member',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  const token = crypto.randomBytes(24).toString('hex');
  store.users.push(user);
  store.sessions[token] = user.id;
  writeStore(store);

  res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalized = String(email).trim().toLowerCase();
  const store = readStore();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === normalized || (u.phone && u.phone === String(email).trim())
  );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  store.sessions[token] = user.id;
  writeStore(store);

  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  const store = readStore();
  const userId = store.sessions[token];
  const user = store.users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: 'Session expired' });
  res.json({ user: sanitizeUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  const token = getTokenFromReq(req);
  if (token) {
    const store = readStore();
    delete store.sessions[token];
    writeStore(store);
  }
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'NOOR & SILK Pakistan 3D Atelier',
    currency: 'PKR',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/catalog', (req, res) => {
  const { category, q } = req.query;
  let items =
    category && category !== 'all'
      ? PRODUCTS.filter((p) => p.category === category)
      : PRODUCTS;

  if (q && String(q).trim()) {
    const term = String(q).trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.subtitle.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.badge.toLowerCase().includes(term)
    );
  }

  res.json({
    currency: 'PKR',
    products: items,
    colors: COLORS,
    fabrics: FABRICS,
    hardwareFinishes: HARDWARE_FINISHES
  });
});

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  const items =
    category && category !== 'all'
      ? PRODUCTS.filter((p) => p.category === category)
      : PRODUCTS;
  res.json({ products: items });
});

app.get('/api/products/:id', (req, res) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({
    product,
    related: getRelatedProducts(product)
  });
});

// Cart API
app.get('/api/cart', (req, res) => {
  const store = readStore();
  res.json(summarizeCart(store.cart));
});

app.post('/api/cart', (req, res) => {
  const { productId, size, colorId, fabricId, hardwareId, quantity = 1 } = req.body || {};
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return res.status(400).json({ error: 'Invalid productId' });
  }

  const chosenSize = size || product.sizes[0];
  if (!product.sizes.includes(chosenSize)) {
    return res.status(400).json({ error: 'Invalid size for selected product' });
  }

  const color = COLORS.find((c) => c.id === (colorId || product.defaultColor)) || COLORS[0];
  const fabric = FABRICS.find((f) => f.id === (fabricId || product.defaultFabric)) || FABRICS[0];
  const hardware =
    HARDWARE_FINISHES.find((h) => h.id === (hardwareId || product.defaultHardware)) ||
    HARDWARE_FINISHES[0];

  const qty = Math.max(1, Math.min(10, Number(quantity) || 1));
  const store = readStore();

  const existing = store.cart.find(
    (item) =>
      item.productId === product.id &&
      item.size === chosenSize &&
      item.colorId === color.id &&
      item.fabricId === fabric.id &&
      item.hardwareId === hardware.id
  );

  if (existing) {
    existing.quantity = Math.min(10, existing.quantity + qty);
  } else {
    store.cart.push({
      itemId: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      image: product.image,
      modelType: product.modelType,
      price: product.price,
      size: chosenSize,
      colorId: color.id,
      colorName: color.name,
      colorHex: color.hex,
      fabricId: fabric.id,
      fabricName: fabric.shortName,
      hardwareId: hardware.id,
      hardwareName: hardware.name,
      quantity: qty
    });
  }

  writeStore(store);
  res.status(201).json(summarizeCart(store.cart));
});

app.patch('/api/cart/:itemId', (req, res) => {
  const { quantity } = req.body || {};
  const store = readStore();
  const idx = store.cart.findIndex((item) => item.itemId === req.params.itemId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  const nextQty = Number(quantity);
  if (!Number.isFinite(nextQty) || nextQty <= 0) {
    store.cart.splice(idx, 1);
  } else {
    store.cart[idx].quantity = Math.min(10, Math.round(nextQty));
  }

  writeStore(store);
  res.json(summarizeCart(store.cart));
});

app.delete('/api/cart/:itemId', (req, res) => {
  const store = readStore();
  store.cart = store.cart.filter((item) => item.itemId !== req.params.itemId);
  writeStore(store);
  res.json(summarizeCart(store.cart));
});

app.delete('/api/cart', (req, res) => {
  const store = readStore();
  store.cart = [];
  writeStore(store);
  res.json(summarizeCart(store.cart));
});

// Interactive Fit & Size Finder API
app.post('/api/size-finder', (req, res) => {
  const { unit = 'in', underbust, overbust, hip, fitPreference = 'sculpted' } = req.body || {};

  const toInches = (val) => (unit === 'cm' ? Number(val) / 2.54 : Number(val));
  const ub = toInches(underbust);
  const ob = toInches(overbust);
  const hp = toInches(hip);

  if (!Number.isFinite(ub) || !Number.isFinite(ob) || ub < 22 || ub > 48 || ob < ub || ob > 58) {
    return res.status(400).json({
      error: 'Please enter valid underbust and overbust measurements.'
    });
  }

  let band = Math.round(ub);
  if (band % 2 !== 0) {
    band = fitPreference === 'relaxed' ? band + 1 : band - 1;
  }
  band = Math.max(30, Math.min(40, band));

  const diff = Math.max(0, Math.round(ob - ub));
  const cupMap = ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD'];
  const cup = cupMap[Math.min(cupMap.length - 1, diff)];
  const braSize = `${band}${cup}`;

  const sisterDown = band > 30 && diff < cupMap.length - 1 ? `${band - 2}${cupMap[diff + 1]}` : null;
  const sisterUp = band < 40 && diff > 0 ? `${band + 2}${cupMap[diff - 1]}` : null;

  let briefSize = 'M';
  if (Number.isFinite(hp) && hp > 25) {
    if (hp < 35) briefSize = 'XS';
    else if (hp < 37.5) briefSize = 'S';
    else if (hp < 40.5) briefSize = 'M';
    else if (hp < 43.5) briefSize = 'L';
    else if (hp < 47) briefSize = 'XL';
    else briefSize = 'XXL';
  } else {
    if (band <= 30) briefSize = 'XS';
    else if (band === 32) briefSize = 'S';
    else if (band === 34) briefSize = 'M';
    else if (band === 36) briefSize = 'L';
    else briefSize = 'XL';
  }

  const recommendedProductId =
    diff >= 3
      ? 'ayesha-ferozi-bra'
      : fitPreference === 'relaxed'
      ? 'haya-cotton-bralette'
      : 'mehreen-bridal-set';

  const recommendedProduct = PRODUCTS.find((p) => p.id === recommendedProductId) || PRODUCTS[0];

  res.json({
    braSize,
    briefSize,
    sisterSizes: [sisterDown, sisterUp].filter(Boolean),
    fitSummary:
      fitPreference === 'relaxed'
        ? 'Tailored for breathable Pakistani summer comfort with zero-pinch cotton-modal.'
        : 'Contoured for sculpted bridal lift and smooth silhouette definition under fitted kurtas.',
    recommendedProduct: {
      id: recommendedProduct.id,
      name: recommendedProduct.name,
      subtitle: recommendedProduct.subtitle
    }
  });
});

// Orders List & Creation (with universal 10% discount for everyone)
app.get('/api/orders', (req, res) => {
  const store = readStore();
  const orders = [...store.orders].reverse();
  res.json({ orders });
});

app.post('/api/orders', (req, res) => {
  const {
    customerName,
    phone,
    city = 'Lahore',
    paymentMethod = 'Cash on Delivery (COD)',
    shippingAddress,
    giftNote = ''
  } = req.body || {};
  const store = readStore();

  if (store.cart.length === 0) {
    return res.status(400).json({ error: 'Your shopping bag is empty.' });
  }
  if (!customerName || !phone || !shippingAddress) {
    return res.status(400).json({ error: 'Name, mobile number, and delivery address are required.' });
  }

  const summary = summarizeCart(store.cart);
  const order = {
    orderId: `NS-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    status: 'Confirmed • Preparing Discreet Parcel',
    customerName: String(customerName).trim(),
    phone: String(phone).trim(),
    city: String(city).trim(),
    paymentMethod: String(paymentMethod).trim(),
    shippingAddress: String(shippingAddress).trim(),
    giftNote: String(giftNote).trim(),
    discreetPackaging: true,
    items: store.cart,
    subtotal: summary.subtotal,
    discountRate: summary.discountRate,
    discountLabel: summary.discountLabel,
    discountAmount: summary.discountAmount,
    discountedSubtotal: summary.discountedSubtotal,
    complimentaryWashBag: summary.freeWashBagUnlocked,
    shipping: summary.shippingFee,
    total: summary.total
  };

  store.orders.push(order);
  store.cart = [];
  writeStore(store);

  res.status(201).json({ order });
});

app.listen(PORT, () => {
  console.log(`NOOR & SILK Pakistan 3D Atelier running at http://localhost:${PORT}`);
});
