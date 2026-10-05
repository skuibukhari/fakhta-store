// Fakhta — online general store (v1.0)
// Node.js + Express + better-sqlite3. Serves frontend from ./public
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'fakhta.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- settings (key/value) ----------
db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
function sGet(k) { try { const r = db.prepare('SELECT value FROM settings WHERE key=?').get(k); return r ? r.value : ''; } catch (e) { return ''; } }
function sSet(k, v) { db.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k, v); }

// ---------- admin password (salted SHA-256, never in code) ----------
function hashPw(pw, salt) { return crypto.createHash('sha256').update(salt + '::' + pw).digest('hex'); }
if (!sGet('admin_salt')) {
  const salt = crypto.randomBytes(16).toString('hex');
  sSet('admin_salt', salt);
  sSet('admin_hash', hashPw('fakhta123', salt));
  console.log('[fakhta] default admin password set (fakhta123) — change it in admin panel');
}

// ---------- tables ----------
db.exec(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL, name_ur TEXT NOT NULL DEFAULT '',
  coming_soon INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0
)`);
db.exec(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL, name_ur TEXT NOT NULL DEFAULT '',
  desc_en TEXT NOT NULL DEFAULT '', desc_ur TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0, old_price INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT NOT NULL DEFAULT '', featured INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 100, sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
db.exec(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL, phone TEXT NOT NULL,
  address TEXT NOT NULL, city TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '',
  subtotal INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
db.exec(`CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER, name_en TEXT NOT NULL, name_ur TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL, qty INTEGER NOT NULL
)`);
// v1.1 migration: courier + tracking columns (safe if already exist)
for (const col of ['courier', 'tracking_no']) {
  try { db.exec(`ALTER TABLE orders ADD COLUMN ${col} TEXT NOT NULL DEFAULT ''`); }
  catch (e) { /* column already exists */ }
}

// ---------- seed data ----------
function seed() {
  const catCount = db.prepare('SELECT COUNT(*) c FROM categories').get().c;
  if (catCount === 0) {
    const ins = db.prepare('INSERT INTO categories (name_en, name_ur, coming_soon, sort) VALUES (?,?,?,?)');
    ins.run('Dinner Sets', 'ڈنر سیٹس', 0, 1);
    ins.run('Crockery', 'کروکری', 0, 2);
    ins.run('Electronics', 'الیکٹرانکس', 1, 3);
    console.log('[fakhta] seeded categories');
  }
  const prodCount = db.prepare('SELECT COUNT(*) c FROM products').get().c;
  if (prodCount === 0) {
    const dinnerId = db.prepare("SELECT id FROM categories WHERE name_en='Dinner Sets'").get().id;
    const crockId = db.prepare("SELECT id FROM categories WHERE name_en='Crockery'").get().id;
    const ins = db.prepare(`INSERT INTO products
      (name_en, name_ur, desc_en, desc_ur, price, old_price, category_id, image, featured, stock, sort)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    const P = [
      ['Classic Gold Rim Dinner Set — 24 Pcs', 'کلاسک گولڈ رم ڈنر سیٹ — 24 پیس',
       'Premium 24-piece porcelain dinner set with elegant gold rim detailing. Includes dinner plates, bowls, cups and saucers — perfect for family dinners and special occasions.',
       'سونہرے کناروں والا شاندار 24 پیس پورسلین ڈنر سیٹ۔ خاندانی دعوتوں اور خاص موقعوں کے لیے بہترین۔',
       12500, 15999, dinnerId, '/products/p1.jpg', 1, 50, 1],
      ['Azure Floral Dinner Set — 18 Pcs', 'آسمانی پھولوں والا ڈنر سیٹ — 18 پیس',
       'Beautiful 18-piece ceramic dinner set with delicate blue floral patterns. Dishwasher safe, chip-resistant glaze.',
       'نازک نیلے پھولوں کے ڈیزائن والا 18 پیس سیرامک ڈنر سیٹ۔ مضبوط اور دیرپا۔',
       9800, 12999, dinnerId, '/products/p2.jpg', 1, 40, 2],
      ['Marble Ivory Dinner Set — 16 Pcs', 'ماربل آئیوری ڈنر سیٹ — 16 پیس',
       'Modern 16-piece dinner set in ivory white with subtle marble veining and a fine gold edge. Minimalist luxury for everyday dining.',
       'سنگِ مرمر کی ہلکی لکیروں اور سنہرے کنارے والا جدید 16 پیس ڈنر سیٹ۔ روزمرہ کے لیے نفیس انتخاب۔',
       14200, 17500, dinnerId, '/products/p3.jpg', 1, 35, 3],
      ['Royal Emerald Dinner Set — 20 Pcs', 'شاہی زمرد ڈنر سیٹ — 20 پیس',
       'Regal 20-piece dinner set in deep emerald green with ornate gold trim. Makes every dawat feel like a royal feast.',
       'گہرے زمرد سبز رنگ اور شاندار سنہرے کام والا 20 پیس ڈنر سیٹ۔ ہر دعوت کو شاہی بنائیں۔',
       16900, 21000, dinnerId, '/products/p4.jpg', 1, 25, 4],
      ['Pearl White Tea Set — 12 Pcs', 'موتی سفید چائے کا سیٹ — 12 پیس',
       'Elegant 12-piece bone-china tea set: teapot, 6 cups with saucers, sugar bowl and creamer. Fine gold accents.',
       'نفیس 12 پیس بون چائنا چائے کا سیٹ: کیتلی، 6 کپ، شوگر باؤل۔ سنہرے کام کے ساتھ۔',
       7500, 9500, crockId, '/products/p5.jpg', 1, 60, 5],
      ['Crystal Serving Bowl Set — 6 Pcs', 'کرسٹل سرونگ باؤل سیٹ — 6 پیس',
       'Set of 6 graduated opal-glass serving and mixing bowls. Heat-resistant, stackable, perfect for serving and storage.',
       '6 مختلف سائز کے شیشے کے سرونگ باؤلز کا سیٹ۔ مضبوط، خوبصورت اور عملی۔',
       3200, 4200, crockId, '/products/p6.jpg', 0, 80, 6],
    ];
    for (const p of P) ins.run(...p);
    console.log('[fakhta] seeded 6 products');
  }
}
seed();

// ---------- app ----------
const app = express();
app.use(express.json({ limit: '2mb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: sGet('sess_secret') || (() => { const s = crypto.randomBytes(32).toString('hex'); sSet('sess_secret', s); return s; })(),
  resave: false, saveUninitialized: false,
  cookie: { maxAge: 12 * 3600 * 1000, httpOnly: true }
}));
app.use(express.static(path.join(__dirname, 'public')));

// image uploads
const uploadDir = path.join(__dirname, 'public', 'products');
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});

// ---------- helpers ----------
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function orderNo() {
  const d = new Date();
  const ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  const n = db.prepare("SELECT COUNT(*) c FROM orders WHERE order_no LIKE ?").get('FK-' + ymd + '-%').c + 1;
  return `FK-${ymd}-${String(n).padStart(4, '0')}`;
}
const VALID_STATUS = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'unauthorized' });
}

// ---------- public APIs ----------
app.get('/api/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY sort, id').all());
});
app.get('/api/products', (req, res) => {
  let q = `SELECT p.*, c.name_en cat_en, c.name_ur cat_ur FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE 1=1`;
  const args = [];
  if (req.query.category) { q += ' AND p.category_id=?'; args.push(req.query.category); }
  if (req.query.featured) { q += ' AND p.featured=1'; }
  if (req.query.search) { q += ' AND (p.name_en LIKE ? OR p.name_ur LIKE ? OR p.desc_en LIKE ?)'; const s = '%' + req.query.search + '%'; args.push(s, s, s); }
  q += ' ORDER BY p.sort, p.id';
  res.json(db.prepare(q).all(...args));
});
app.get('/api/products/:id', (req, res) => {
  const p = db.prepare(`SELECT p.*, c.name_en cat_en, c.name_ur cat_ur FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=?`).get(req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  res.json(p);
});
app.post('/api/orders', (req, res) => {
  const { customer_name, phone, address, city, notes, items } = req.body || {};
  if (!customer_name || !String(customer_name).trim()) return res.status(400).json({ error: 'name_required' });
  const ph = String(phone || '').replace(/[\s-]/g, '');
  if (!/^03\d{9}$/.test(ph)) return res.status(400).json({ error: 'phone_invalid' });
  if (!address || !String(address).trim()) return res.status(400).json({ error: 'address_required' });
  if (!city || !String(city).trim()) return res.status(400).json({ error: 'city_required' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'empty_cart' });

  const lines = [];
  let subtotal = 0;
  for (const it of items) {
    const p = db.prepare('SELECT id, name_en, name_ur, price, stock FROM products WHERE id=?').get(it.id);
    if (!p) return res.status(400).json({ error: 'bad_product' });
    const qty = Math.max(1, Math.min(99, parseInt(it.qty) || 1));
    lines.push({ product_id: p.id, name_en: p.name_en, name_ur: p.name_ur, price: p.price, qty });
    subtotal += p.price * qty;
  }
  const no = orderNo();
  const info = db.prepare(`INSERT INTO orders (order_no, customer_name, phone, address, city, notes, subtotal)
    VALUES (?,?,?,?,?,?,?)`).run(no, String(customer_name).trim(), ph, String(address).trim(), String(city).trim(), String(notes || '').trim(), subtotal);
  const iins = db.prepare('INSERT INTO order_items (order_id, product_id, name_en, name_ur, price, qty) VALUES (?,?,?,?,?,?)');
  for (const l of lines) iins.run(info.lastInsertRowid, l.product_id, l.name_en, l.name_ur, l.price, l.qty);
  res.json({ ok: true, order_no: no, subtotal });
});
app.get('/api/track', (req, res) => {
  const ph = String(req.query.phone || '').replace(/[\s-]/g, '');
  if (!/^03\d{9}$/.test(ph)) return res.status(400).json({ error: 'phone_invalid' });
  const orders = db.prepare('SELECT id, order_no, customer_name, subtotal, status, courier, tracking_no, created_at FROM orders WHERE phone=? ORDER BY id DESC LIMIT 20').all(ph);
  for (const o of orders) o.items = db.prepare('SELECT name_en, name_ur, price, qty FROM order_items WHERE order_id=?').all(o.id);
  res.json(orders);
});
app.get('/api/version', (req, res) => res.json({ app: 'fakhta-store', version: '1.2.0' }));

// ---------- GitHub webhook auto-deploy (push to main → git pull) ----------
app.post('/api/deploy', (req, res) => {
  const secret = process.env.DEPLOY_SECRET || '';
  if (!secret) return res.status(503).json({ error: 'deploy_not_configured' });
  const sig = String(req.headers['x-hub-signature-256'] || '');
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(req.rawBody || '').digest('hex');
  const ok = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return res.status(403).json({ error: 'bad_signature' });
  const { exec } = require('child_process');
  exec('git pull origin main', { cwd: __dirname }, (err, stdout, stderr) => {
    console.log('[fakhta] auto-deploy pull:', err ? String(err) : (stdout || stderr || '(no output)'));
  });
  res.json({ ok: true });
});

// ---------- admin auth ----------
app.post('/api/admin/login', (req, res) => {
  const pw = String(req.body.password || '');
  if (pw && hashPw(pw, sGet('admin_salt')) === sGet('admin_hash')) {
    req.session.admin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'bad_password' });
});
app.post('/api/admin/logout', (req, res) => { req.session.destroy(() => res.json({ ok: true })); });
app.get('/api/admin/me', (req, res) => res.json({ admin: !!(req.session && req.session.admin) }));
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { current, next } = req.body || {};
  if (!current || hashPw(String(current), sGet('admin_salt')) !== sGet('admin_hash'))
    return res.status(400).json({ error: 'wrong_current' });
  if (!next || String(next).length < 6) return res.status(400).json({ error: 'too_short' });
  const salt = crypto.randomBytes(16).toString('hex');
  sSet('admin_salt', salt);
  sSet('admin_hash', hashPw(String(next), salt));
  res.json({ ok: true });
});

// ---------- admin APIs ----------
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const g = (sql, ...a) => db.prepare(sql).get(...a);
  res.json({
    counts: {
      new: g("SELECT COUNT(*) c FROM orders WHERE status='new'").c,
      confirmed: g("SELECT COUNT(*) c FROM orders WHERE status='confirmed'").c,
      shipped: g("SELECT COUNT(*) c FROM orders WHERE status='shipped'").c,
      delivered: g("SELECT COUNT(*) c FROM orders WHERE status='delivered'").c,
      cancelled: g("SELECT COUNT(*) c FROM orders WHERE status='cancelled'").c,
    },
    revenue: g("SELECT COALESCE(SUM(subtotal),0) s FROM orders WHERE status='delivered'").s,
    pending_revenue: g("SELECT COALESCE(SUM(subtotal),0) s FROM orders WHERE status IN ('new','confirmed','shipped')").s,
    products: g('SELECT COUNT(*) c FROM products').c,
  });
});
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  let q = 'SELECT o.*, (SELECT COUNT(*) FROM orders o2 WHERE o2.phone=o.phone) AS cust_count FROM orders o WHERE 1=1'; const args = [];
  if (req.query.status) { q += ' AND o.status=?'; args.push(req.query.status); }
  q += ' ORDER BY o.id DESC LIMIT 200';
  res.json(db.prepare(q).all(...args));
});
app.get('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const o = db.prepare(`SELECT o.*, (SELECT COUNT(*) FROM orders o2 WHERE o2.phone=o.phone) AS cust_count FROM orders o WHERE o.id=?`).get(req.params.id);
  if (!o) return res.status(404).json({ error: 'not_found' });
  o.items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(o.id);
  res.json(o);
});
// repeat-customer history by phone
app.get('/api/admin/customer', requireAdmin, (req, res) => {
  const ph = String(req.query.phone || '').replace(/[\s-]/g, '');
  if (!/^03\d{9}$/.test(ph)) return res.status(400).json({ error: 'phone_invalid' });
  const orders = db.prepare('SELECT id, order_no, subtotal, status, courier, tracking_no, created_at FROM orders WHERE phone=? ORDER BY id DESC LIMIT 50').all(ph);
  for (const o of orders) o.items = db.prepare('SELECT name_en, name_ur, qty FROM order_items WHERE order_id=?').all(o.id);
  res.json({ phone: ph, count: orders.length, orders });
});
app.put('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const { status, courier, tracking_no } = req.body || {};
  const sets = [], args = [];
  if (status !== undefined) {
    if (!VALID_STATUS.includes(String(status))) return res.status(400).json({ error: 'bad_status' });
    sets.push('status=?'); args.push(String(status));
  }
  if (courier !== undefined) { sets.push('courier=?'); args.push(String(courier).slice(0, 60)); }
  if (tracking_no !== undefined) { sets.push('tracking_no=?'); args.push(String(tracking_no).replace(/[^a-zA-Z0-9-]/g, '').slice(0, 60)); }
  if (!sets.length) return res.status(400).json({ error: 'nothing_to_update' });
  args.push(req.params.id);
  db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id=?`).run(...args);
  res.json({ ok: true });
});
app.get('/api/admin/categories', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY sort, id').all());
});
app.post('/api/admin/categories', requireAdmin, (req, res) => {
  const { name_en, name_ur, coming_soon, sort } = req.body || {};
  if (!name_en || !String(name_en).trim()) return res.status(400).json({ error: 'name_required' });
  const r = db.prepare('INSERT INTO categories (name_en, name_ur, coming_soon, sort) VALUES (?,?,?,?)')
    .run(String(name_en).trim(), String(name_ur || '').trim(), coming_soon ? 1 : 0, parseInt(sort) || 0);
  res.json({ ok: true, id: r.lastInsertRowid });
});
app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const { name_en, name_ur, coming_soon, sort } = req.body || {};
  db.prepare('UPDATE categories SET name_en=?, name_ur=?, coming_soon=?, sort=? WHERE id=?')
    .run(String(name_en).trim(), String(name_ur || '').trim(), coming_soon ? 1 : 0, parseInt(sort) || 0, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
app.get('/api/admin/products', requireAdmin, (req, res) => {
  res.json(db.prepare(`SELECT p.*, c.name_en cat_en FROM products p LEFT JOIN categories c ON c.id=p.category_id ORDER BY p.sort, p.id`).all());
});
app.post('/api/admin/products', requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.name_en || !String(b.name_en).trim()) return res.status(400).json({ error: 'name_required' });
  const r = db.prepare(`INSERT INTO products
    (name_en, name_ur, desc_en, desc_ur, price, old_price, category_id, image, featured, stock, sort)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    String(b.name_en).trim(), String(b.name_ur || '').trim(),
    String(b.desc_en || '').trim(), String(b.desc_ur || '').trim(),
    parseInt(b.price) || 0, parseInt(b.old_price) || 0,
    b.category_id || null, String(b.image || ''), b.featured ? 1 : 0,
    parseInt(b.stock) || 0, parseInt(b.sort) || 0);
  res.json({ ok: true, id: r.lastInsertRowid });
});
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const b = req.body || {};
  db.prepare(`UPDATE products SET name_en=?, name_ur=?, desc_en=?, desc_ur=?, price=?, old_price=?,
    category_id=?, image=?, featured=?, stock=?, sort=? WHERE id=?`).run(
    String(b.name_en).trim(), String(b.name_ur || '').trim(),
    String(b.desc_en || '').trim(), String(b.desc_ur || '').trim(),
    parseInt(b.price) || 0, parseInt(b.old_price) || 0,
    b.category_id || null, String(b.image || ''), b.featured ? 1 : 0,
    parseInt(b.stock) || 0, parseInt(b.sort) || 0, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
  const name = 'u' + Date.now() + ext;
  fs.renameSync(req.file.path, path.join(uploadDir, name));
  res.json({ ok: true, url: '/products/' + name });
});

// admin page + SPA fallback
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`[fakhta] listening on :${PORT}`));
