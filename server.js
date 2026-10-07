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
// v1.3 migration: order source (online/manual/whatsapp)
try { db.exec(`ALTER TABLE orders ADD COLUMN source TEXT NOT NULL DEFAULT 'online'`); }
catch (e) { /* column already exists */ }
// v1.4 migration: customer email + whatsapp for order updates
try { db.exec(`ALTER TABLE orders ADD COLUMN email TEXT NOT NULL DEFAULT ''`); }
catch (e) { /* column already exists */ }
try { db.exec(`ALTER TABLE orders ADD COLUMN whatsapp TEXT NOT NULL DEFAULT ''`); }
catch (e) { /* column already exists */ }
// v1.5 migration: advance payment (method, status, txn id, receipt)
try { db.exec(`ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cod'`); }
catch (e) { /* column already exists */ }
try { db.exec(`ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'`); }
catch (e) { /* column already exists */ }
try { db.exec(`ALTER TABLE orders ADD COLUMN txn_id TEXT NOT NULL DEFAULT ''`); }
catch (e) { /* column already exists */ }
try { db.exec(`ALTER TABLE orders ADD COLUMN receipt_path TEXT NOT NULL DEFAULT ''`); }
catch (e) { /* column already exists */ }
// v1.6 migration: product purchase price (for margin report)
try { db.exec(`ALTER TABLE products ADD COLUMN purchase_price REAL NOT NULL DEFAULT 0`); }
catch (e) { /* column already exists */ }
// khata (credit/debit ledger) table
db.exec(`CREATE TABLE IF NOT EXISTS khata (
  id INTEGER PRIMARY KEY AUTOINCREMENT, entry_date TEXT NOT NULL DEFAULT (date('now','localtime')),
  type TEXT NOT NULL DEFAULT 'debit', amount REAL NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')))`);
// receipts upload dir
try { fs.mkdirSync(path.join(__dirname, 'public', 'receipts'), { recursive: true }); } catch (e) {}

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
  // payment settings defaults (admin can change in Settings; shown publicly at checkout)
  if (!sGet('cod_enabled')) sSet('cod_enabled', '1');
  if (!sGet('pay_wallet')) sSet('pay_wallet', '03002454605');
  if (!sGet('pay_bank')) sSet('pay_bank', '08010200012383');
  if (!sGet('pay_bank_name')) sSet('pay_bank_name', 'Askari Bank');
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

// ---- sub-path support (e.g. BASE_PATH=/fakhta on Alwaysdata) ----
// The reverse proxy forwards the full path (/fakhta/api/...); strip the
// prefix first so the whole app keeps working as if it were at the root.
const B = (process.env.BASE_PATH || '').replace(/\/+$/, '');
if (B) app.use((req, res, next) => {
  if (req.url === B) req.url = '/';
  else if (req.url.startsWith(B + '/')) req.url = req.url.slice(B.length);
  next();
});

app.use(express.json({ limit: '2mb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: 'fakhta.sid',
  secret: sGet('sess_secret') || (() => { const s = crypto.randomBytes(32).toString('hex'); sSet('sess_secret', s); return s; })(),
  resave: false, saveUninitialized: false,
  cookie: { maxAge: 12 * 3600 * 1000, httpOnly: true }
}));
// ---- index.html with <base> injection + dynamic manifest (sub-path support) ----
const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
function sendIndex(res) {
  res.type('html').send(B ? indexHtml.replace('<head>', `<head><base href="${B}/">`) : indexHtml);
}
app.get('/manifest.json', (req, res) => {
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'manifest.json'), 'utf8'));
  if (B) { m.start_url = B + '/'; m.scope = B + '/'; m.id = B + '/'; }
  res.json(m);
});
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

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

// public payment info for checkout (numbers admin set; never hardcoded in frontend)
app.get('/api/payment-info', (req, res) => {
  res.json({
    cod_enabled: sGet('cod_enabled') !== '0',
    wallet_number: sGet('pay_wallet'), bank_account: sGet('pay_bank'),
    bank_name: sGet('pay_bank_name') || 'Askari Bank',
    whatsapp: sGet('store_whatsapp')
  });
});
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
  const { customer_name, phone, address, city, notes, items, source, email, whatsapp, payment_method, txn_id } = req.body || {};
  const src = ['online', 'manual', 'whatsapp'].includes(source) ? source : 'online';
  if (!customer_name || !String(customer_name).trim()) return res.status(400).json({ error: 'name_required' });
  const ph = String(phone || '').replace(/[\s-]/g, '');
  if (!/^03\d{9}$/.test(ph)) return res.status(400).json({ error: 'phone_invalid' });
  let wa = String(whatsapp || '').replace(/[\s-]/g, '');
  if (!wa) wa = ph; else if (!/^03\d{9}$/.test(wa)) return res.status(400).json({ error: 'whatsapp_invalid' });
  const em = String(email || '').trim();
  if (em && !/.+@.+\..+/.test(em)) return res.status(400).json({ error: 'email_invalid' });
  const pm = payment_method === 'advance' ? 'advance' : 'cod';
  if (pm === 'cod' && sGet('cod_enabled') === '0') return res.status(400).json({ error: 'cod_disabled' });
  const txn = String(txn_id || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 40);
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
  const info = db.prepare(`INSERT INTO orders (order_no, customer_name, phone, address, city, notes, subtotal, source, email, whatsapp, payment_method, payment_status, txn_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(no, String(customer_name).trim(), ph, String(address).trim(), String(city).trim(), String(notes || '').trim(), subtotal, src, em, wa, pm, 'pending', txn);
  const iins = db.prepare('INSERT INTO order_items (order_id, product_id, name_en, name_ur, price, qty) VALUES (?,?,?,?,?,?)');
  for (const l of lines) iins.run(info.lastInsertRowid, l.product_id, l.name_en, l.name_ur, l.price, l.qty);
  res.json({ ok: true, order_no: no, subtotal, order_id: info.lastInsertRowid });
});
// payment receipt upload (image only, ≤5MB, only for fresh 'new' orders)
const receiptUpload = multer({
  dest: path.join(__dirname, 'public', 'receipts'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});
app.post('/api/orders/:id/receipt', receiptUpload.single('receipt'), (req, res) => {
  const o = db.prepare('SELECT id, status FROM orders WHERE id=?').get(req.params.id);
  if (!o || o.status !== 'new') { if (req.file) fs.unlink(req.file.path, () => {}); return res.status(404).json({ error: 'not_found' }); }
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  const relp = 'receipts/' + req.file.filename;
  db.prepare('UPDATE orders SET receipt_path=? WHERE id=?').run(relp, o.id);
  res.json({ ok: true, path: relp });
});
app.get('/api/track', (req, res) => {
  const ph = String(req.query.phone || '').replace(/[\s-]/g, '');
  if (!/^03\d{9}$/.test(ph)) return res.status(400).json({ error: 'phone_invalid' });
  const orders = db.prepare('SELECT id, order_no, customer_name, phone, address, city, subtotal, status, courier, tracking_no, created_at FROM orders WHERE phone=? ORDER BY id DESC LIMIT 20').all(ph);
  for (const o of orders) o.items = db.prepare('SELECT name_en, name_ur, price, qty FROM order_items WHERE order_id=?').all(o.id);
  res.json(orders);
});
app.get('/api/version', (req, res) => res.json({ app: 'fakhta-store', version: '1.3.0' }));

// ---- public store info (WhatsApp / contact number, set by admin) ----
app.get('/api/store-info', (req, res) => {
  res.json({ whatsapp: sGet('store_whatsapp'), phone: sGet('store_phone'), name: 'Fakhta' });
});

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

// store settings (WhatsApp / phone shown on site; admin sets, never hardcoded)
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  res.json({ store_whatsapp: sGet('store_whatsapp'), store_phone: sGet('store_phone'),
    cod_enabled: sGet('cod_enabled') !== '0', pay_wallet: sGet('pay_wallet'),
    pay_bank: sGet('pay_bank'), pay_bank_name: sGet('pay_bank_name') });
});
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const b = req.body || {};
  if (b.store_whatsapp !== undefined) sSet('store_whatsapp', String(b.store_whatsapp).replace(/[^\d]/g, '').slice(0, 15));
  if (b.store_phone !== undefined) sSet('store_phone', String(b.store_phone).slice(0, 30));
  if (b.cod_enabled !== undefined) sSet('cod_enabled', b.cod_enabled ? '1' : '0');
  if (b.pay_wallet !== undefined) sSet('pay_wallet', String(b.pay_wallet).replace(/[^\d]/g, '').slice(0, 15));
  if (b.pay_bank !== undefined) sSet('pay_bank', String(b.pay_bank).replace(/[^\d]/g, '').slice(0, 30));
  if (b.pay_bank_name !== undefined) sSet('pay_bank_name', String(b.pay_bank_name).slice(0, 60));
  res.json({ ok: true });
});

// date-wise sales report / ledger
app.get('/api/admin/reports', requireAdmin, (req, res) => {
  const from = String(req.query.from || '').slice(0, 10);
  const to = String(req.query.to || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to))
    return res.status(400).json({ error: 'bad_range' });
  const days = db.prepare(
    `SELECT date(created_at) d, COUNT(*) orders, COALESCE(SUM(subtotal),0) revenue
     FROM orders WHERE date(created_at) BETWEEN ? AND ? GROUP BY d ORDER BY d`
  ).all(from, to);
  const orders = db.prepare(
    `SELECT id, order_no, customer_name, phone, city, subtotal, status, source, date(created_at) d, created_at
     FROM orders WHERE date(created_at) BETWEEN ? AND ? ORDER BY id DESC`
  ).all(from, to);
  const tot = db.prepare(
    `SELECT COUNT(*) orders, COALESCE(SUM(subtotal),0) revenue FROM orders WHERE date(created_at) BETWEEN ? AND ?`
  ).get(from, to);
  res.json({ from, to, days, orders, total_orders: tot.orders, total_revenue: tot.revenue });
});

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
    if (String(status) === 'confirmed') {
      const o = db.prepare('SELECT payment_method, payment_status FROM orders WHERE id=?').get(req.params.id);
      if (o && o.payment_method === 'advance' && o.payment_status !== 'received')
        return res.status(400).json({ error: 'payment_pending' });
    }
    sets.push('status=?'); args.push(String(status));
  }
  if (courier !== undefined) { sets.push('courier=?'); args.push(String(courier).slice(0, 60)); }
  if (tracking_no !== undefined) { sets.push('tracking_no=?'); args.push(String(tracking_no).replace(/[^a-zA-Z0-9-]/g, '').slice(0, 60)); }
  if (!sets.length) return res.status(400).json({ error: 'nothing_to_update' });
  args.push(req.params.id);
  db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id=?`).run(...args);
  res.json({ ok: true });
});
// mark advance payment received / pending (admin)
app.put('/api/admin/orders/:id/payment', requireAdmin, (req, res) => {
  const st = req.body && req.body.payment_status === 'received' ? 'received' : 'pending';
  db.prepare('UPDATE orders SET payment_status=? WHERE id=?').run(st, req.params.id);
  res.json({ ok: true });
});
// margin report: purchase vs sale per product + sold qty + profit
app.get('/api/admin/margins', requireAdmin, (req, res) => {
  const rows = db.prepare(`SELECT p.id, p.name_en, p.name_ur, p.price, COALESCE(p.purchase_price,0) purchase_price,
    COALESCE((SELECT SUM(qty) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE oi.product_id=p.id AND o.status != 'cancelled'),0) sold
    FROM products p ORDER BY p.sort, p.id`).all();
  res.json(rows);
});
// khata (credit/debit ledger)
app.get('/api/admin/khata', requireAdmin, (req, res) => {
  const rows = db.prepare(`SELECT *, (SELECT COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE -amount END),0) FROM khata k2 WHERE k2.id <= k.id) balance FROM khata k ORDER BY id DESC LIMIT 200`).all();
  const t = db.prepare(`SELECT COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE -amount END),0) balance, COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END),0) credit, COALESCE(SUM(CASE WHEN type='debit' THEN amount ELSE 0 END),0) debit FROM khata`).get();
  res.json({ rows, ...t });
});
app.post('/api/admin/khata', requireAdmin, (req, res) => {
  const b = req.body || {};
  const type = b.type === 'credit' ? 'credit' : 'debit';
  const amount = Math.abs(parseFloat(b.amount)) || 0;
  if (!amount) return res.status(400).json({ error: 'bad_amount' });
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(b.entry_date || '')) ? b.entry_date : new Date().toISOString().slice(0, 10);
  const r = db.prepare('INSERT INTO khata (entry_date, type, amount, description) VALUES (?,?,?,?)').run(d, type, amount, String(b.description || '').slice(0, 200));
  res.json({ ok: true, id: r.lastInsertRowid });
});
app.delete('/api/admin/khata/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM khata WHERE id=?').run(req.params.id);
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
    (name_en, name_ur, desc_en, desc_ur, price, old_price, category_id, image, featured, stock, sort, purchase_price)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    String(b.name_en).trim(), String(b.name_ur || '').trim(),
    String(b.desc_en || '').trim(), String(b.desc_ur || '').trim(),
    parseInt(b.price) || 0, parseInt(b.old_price) || 0,
    b.category_id || null, String(b.image || ''), b.featured ? 1 : 0,
    parseInt(b.stock) || 0, parseInt(b.sort) || 0, parseFloat(b.purchase_price) || 0);
  res.json({ ok: true, id: r.lastInsertRowid });
});
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const b = req.body || {};
  db.prepare(`UPDATE products SET name_en=?, name_ur=?, desc_en=?, desc_ur=?, price=?, old_price=?,
    category_id=?, image=?, featured=?, stock=?, sort=?, purchase_price=? WHERE id=?`).run(
    String(b.name_en).trim(), String(b.name_ur || '').trim(),
    String(b.desc_en || '').trim(), String(b.desc_ur || '').trim(),
    parseInt(b.price) || 0, parseInt(b.old_price) || 0,
    b.category_id || null, String(b.image || ''), b.featured ? 1 : 0,
    parseInt(b.stock) || 0, parseInt(b.sort) || 0, parseFloat(b.purchase_price) || 0, req.params.id);
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
app.get('/admin', (req, res) => sendIndex(res));
app.get('/', (req, res) => sendIndex(res));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  sendIndex(res);
});

app.listen(PORT, () => console.log(`[fakhta] listening on :${PORT}`));
