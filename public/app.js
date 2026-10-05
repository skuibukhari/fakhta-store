/* Fakhta storefront + admin — bilingual (EN/UR) SPA */
// ---- sub-path support: server injects <base href="/fakhta/"> when BASE_PATH is set ----
const BASE = (document.querySelector('base')?.getAttribute('href') || '/').replace(/\/$/, '');
if (BASE) {
  const _fetch = window.fetch.bind(window);
  window.fetch = (u, o) => _fetch(typeof u === 'string' && u.startsWith('/') ? BASE + u : u, o);
}
// relativize "/x" -> "x" so asset URLs resolve against <base>
const rel = p => String(p || '').replace(/^\//, '');
const I18N = {
en: {
  nav_home:'Home', nav_shop:'Shop', nav_track:'Track Order', nav_cart:'Cart',
  slogan:'Khubsurti, ab aap ke ghar tak',
  hero_sub:'Premium dinner sets, crockery & home essentials — crafted for elegance. Cash on Delivery across Pakistan.',
  hero_cta:'Shop Now', hero_cta2:'Explore Collections',
  cat_title:'Shop by Category', feat_title:'Featured Collection',
  feat_sub:'Handpicked luxury dinner sets for your home',
  see_all:'See All →', add_cart:'Add to Cart', order_now:'Order Now',
  trust1:['Free Delivery','Across Pakistan'], trust2:['Cash on Delivery','Pay at your door'], trust3:['7-Day Returns','Easy & quick'], trust4:['Premium Quality','Handpicked items'],
  search_ph:'Search dinner sets, crockery…', coming_soon:'Coming Soon',
  cart_title:'Shopping Cart', cart_total:'Total', cart_checkout:'Checkout', cart_empty:'Your cart is empty',
  qty:'Quantity', desc:'Description', buy_now:'Buy Now',
  delivery_note:'Free delivery across Pakistan • Cash on Delivery',
  co_title:'Checkout', co_name:'Full Name', co_phone:'Mobile Number', co_address:'Complete Address',
  co_city:'City', co_notes:'Notes (optional)', co_place:'Place Order', co_pay:'Payment: Cash on Delivery',
  err_name:'Please enter your name', err_phone:'Enter a valid 11-digit mobile number (03xx-xxxxxxx)',
  err_address:'Please enter your complete address', err_city:'Please enter your city',
  ok_title:'Order Placed! 🎉', ok_msg:'Thank you! We will call you soon to confirm your order.',
  ok_no:'Your order number', ok_home:'Back to Home',
  tr_title:'Track Your Order', tr_ph:'Enter your mobile number (03xx-xxxxxxx)', tr_btn:'Track Orders',
  tr_none:'No orders found for this number.', tr_items:'items',
  tr_courier:'Courier', tr_tracking:'Tracking Number', tr_track_btn:'Track on courier site', tr_copy:'Copy', copied:'Copied ✓',
  st_new:'New', st_confirmed:'Confirmed', st_shipped:'Shipped', st_delivered:'Delivered', st_cancelled:'Cancelled',
  ft_shop:'Shop', ft_support:'Support', ft_cod:'Cash on Delivery', ft_returns:'7-Day Easy Returns', ft_rights:'All Rights Reserved',
  added:'Added to cart ✓', removed:'Removed', order_placed:'Order placed!',
  ph_name:'e.g. Ahmed Raza', ph_phone:'03xxxxxxxxx', ph_address:'House, street, area…', ph_city:'e.g. Dera Ismail Khan', ph_notes:'Any special instructions…',
  adm_courier:'Courier', adm_tracking:'Tracking No', adm_tracking_ph:'e.g. CN-1234-5678',
  ord_repeat:'Repeat customer', ord_orders:'orders', cust_history:'Customer Order History',
  wa_ask:'Ask on WhatsApp', bill:'Bill / Invoice', wa_bill:'Send bill on WhatsApp',
},
ur: {
  nav_home:'ہوم', nav_shop:'دکان', nav_track:'آرڈر ٹریک کریں', nav_cart:'ٹوکری',
  slogan:'خوبصورتی، اب آپ کے گھر تک',
  hero_sub:'شاندار ڈنر سیٹس، کروکری اور گھر کی ضروریات — نفاست کے ساتھ۔ پاکستان بھر میں کیش آن ڈیلیوری۔',
  hero_cta:'ابھی خریدیں', hero_cta2:'کلیکشن دیکھیں',
  cat_title:'کیٹیگری کے حساب سے خریدیں', feat_title:'نمایاں کلیکشن',
  feat_sub:'آپ کے گھر کے لیے منتخب شاندار ڈنر سیٹس',
  see_all:'سب دیکھیں ←', add_cart:'ٹوکری میں ڈالیں', order_now:'آرڈر کریں',
  trust1:['مفت ڈیلیوری','پورے پاکستان میں'], trust2:['کیش آن ڈیلیوری','دروازے پر ادائیگی'], trust3:['7 دن میں واپسی','آسان اور تیز'], trust4:['اعلیٰ معیار','منتخب اشیاء'],
  search_ph:'ڈنر سیٹ، کروکری تلاش کریں…', coming_soon:'جلد آ رہا ہے',
  cart_title:'خریداری کی ٹوکری', cart_total:'کل رقم', cart_checkout:'آرڈر کریں', cart_empty:'آپ کی ٹوکری خالی ہے',
  qty:'تعداد', desc:'تفصیل', buy_now:'ابھی خریدیں',
  delivery_note:'پاکستان بھر میں مفت ڈیلیوری • کیش آن ڈیلیوری',
  co_title:'آرڈر مکمل کریں', co_name:'پورا نام', co_phone:'موبائل نمبر', co_address:'مکمل پتہ',
  co_city:'شہر', co_notes:'نوٹ (اختیاری)', co_place:'آرڈر کریں', co_pay:'ادائیگی: کیش آن ڈیلیوری',
  err_name:'براہ کرم اپنا نام لکھیں', err_phone:'درست 11 ہندسوں کا موبائل نمبر لکھیں (03xx-xxxxxxx)',
  err_address:'براہ کرم مکمل پتہ لکھیں', err_city:'براہ کرم شہر لکھیں',
  ok_title:'آرڈر ہو گیا! 🎉', ok_msg:'شکریہ! تصدیق کے لیے ہم جلد آپ کو کال کریں گے۔',
  ok_no:'آپ کا آرڈر نمبر', ok_home:'ہوم پر واپس جائیں',
  tr_title:'اپنا آرڈر ٹریک کریں', tr_ph:'اپنا موبائل نمبر لکھیں (03xx-xxxxxxx)', tr_btn:'آرڈر دیکھیں',
  tr_none:'اس نمبر پر کوئی آرڈر نہیں ملا۔', tr_items:'اشیاء',
  tr_courier:'کورئیر', tr_tracking:'ٹریکنگ نمبر', tr_track_btn:'کورئیر سائٹ پر ٹریک کریں', tr_copy:'کاپی کریں', copied:'کاپی ہو گیا ✓',
  st_new:'نیا', st_confirmed:'تصدیق شدہ', st_shipped:'بھیج دیا گیا', st_delivered:'ڈیلیور ہو گیا', st_cancelled:'منسوخ',
  ft_shop:'دکان', ft_support:'مدد', ft_cod:'کیش آن ڈیلیوری', ft_returns:'7 دن میں آسان واپسی', ft_rights:'جملہ حقوق محفوظ ہیں',
  added:'ٹوکری میں شامل ہو گیا ✓', removed:'حذف کر دیا گیا', order_placed:'آرڈر ہو گیا!',
  ph_name:'مثلاً احمد رضا', ph_phone:'03xxxxxxxxx', ph_address:'مکان، گلی، علاقہ…', ph_city:'مثلاً ڈیرہ اسماعیل خان', ph_notes:'کوئی خاص ہدایت…',
  adm_courier:'کورئیر', adm_tracking:'ٹریکنگ نمبر', adm_tracking_ph:'مثلاً CN-1234-5678',
  ord_repeat:'پرانا کسٹمر', ord_orders:'آرڈر', cust_history:'کسٹمر کے آرڈرز',
  wa_ask:'واٹس ایپ پر پوچھیں', bill:'بل / انوائس', wa_bill:'واٹس ایپ پر بل بھیجیں',
}};
let LANG = localStorage.getItem('fakhta_lang') || 'en';
const T = k => (I18N[LANG] && I18N[LANG][k] !== undefined) ? I18N[LANG][k] : I18N.en[k];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => 'Rs. ' + Number(n || 0).toLocaleString('en-PK');
const stars = r => '★'.repeat(Math.round(r || 4.5)) + '☆'.repeat(5 - Math.round(r || 4.5));
const pname = p => (LANG === 'ur' && p.name_ur) ? p.name_ur : p.name_en;
const pdesc = p => (LANG === 'ur' && p.desc_ur) ? p.desc_ur : p.desc_en;
const cname = c => (LANG === 'ur' && c.name_ur) ? c.name_ur : c.name_en;
// couriers (random — no fixed account). Tracking URL only where verified.
const COURIERS = ['TCS', 'Leopards Courier', 'Pakistan Post', 'PostEx', 'Call Courier', 'Daewoo Fastex', 'Other'];
const COURIER_URL = { 'TCS': 'https://www.tcsexpress.com/tracking' };
function copyTrack(btn) {
  const t = btn.getAttribute('data-tn') || '';
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast(T('copied'))).catch(() => toast(t));
  else toast(t);
}

let CATS = [], PRODS = [];
let STORE = { whatsapp: '', phone: '', name: 'Fakhta' };
async function loadStore() {
  try { Object.assign(STORE, await api('/api/store-info')); } catch (e) { /* offline */ }
  const el = document.getElementById('storeWa');
  if (el) { el.style.display = STORE.whatsapp ? '' : 'none'; if (STORE.phone) el.querySelector('span').textContent = STORE.phone; }
}
// WhatsApp click-to-chat link (no API — opens chat with prefilled text)
function waLink(text) {
  if (!STORE.whatsapp) return null;
  return 'https://wa.me/' + STORE.whatsapp + '?text=' + encodeURIComponent(text);
}
function waAsk(p) {
  const l = waLink(`Assalam-o-Alaikum! Mujhe "${pname(p)}" (${fmt(p.price)}) ke baare me maloomat chahiye.`);
  if (l) window.open(l, '_blank'); else toast('WhatsApp number set nahi hai');
}
// printable invoice HTML for an order (customer + admin)
function invoiceHTML(o) {
  const rows = (o.items || []).map(i =>
    `<tr><td>${esc(LANG === 'ur' && i.name_ur ? i.name_ur : i.name_en)}</td><td>${i.qty}</td><td>${fmt(i.price)}</td><td>${fmt(i.price * i.qty)}</td></tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${esc(o.order_no)}</title><style>
    body{font-family:Arial,sans-serif;max-width:640px;margin:20px auto;padding:0 16px;color:#111}
    .ih{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #b8860b;padding-bottom:10px}
    .ih h1{color:#0a1f44;margin:0}.ih .fb{color:#b8860b;font-weight:bold}
    table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#0a1f44;color:#fff}
    .tot{text-align:right;font-size:1.2rem;font-weight:bold}.meta{color:#444;font-size:.9rem}
    @media print{.noprint{display:none}}</style></head><body>
    <div class="ih"><div><h1>FAKHTA</h1><div class="fb">فاختہ • Khubsurti, ab aap ke ghar tak</div></div>
    <div class="meta">Invoice: <b>${esc(o.order_no)}</b><br>Date: ${esc((o.created_at || '').slice(0, 10))}</div></div>
    <p class="meta"><b>Customer:</b> ${esc(o.customer_name)}<br><b>Phone:</b> <bdi dir="ltr">${esc(o.phone)}</bdi><br>
    <b>Address:</b> ${esc(o.address)}, ${esc(o.city)}<br><b>Payment:</b> Cash on Delivery</p>
    <table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>${rows}</table>
    <p class="tot">Total: ${fmt(o.subtotal)}</p>
    ${STORE.phone ? `<p class="meta">Contact: <bdi dir="ltr">${esc(STORE.phone)}</bdi>${STORE.whatsapp ? ` • WhatsApp: <bdi dir="ltr">+${esc(STORE.whatsapp)}</bdi>` : ''}</p>` : ''}
    <p class="meta">Shukriya! Fakhta jald call karke confirm karega.</p>
    <p class="noprint"><button onclick="window.print()" style="padding:10px 24px;font-size:1rem">🖨 Print / Save PDF</button></p>
    </body></html>`;
}
function printInvoice(o) {
  const w = window.open('', '_blank');
  if (!w) return toast('Popup blocked');
  w.document.write(invoiceHTML(o)); w.document.close();
}
// bill text for WhatsApp sharing
function billText(o) {
  const lines = (o.items || []).map(i => `• ${(LANG === 'ur' && i.name_ur ? i.name_ur : i.name_en)} × ${i.qty} = ${fmt(i.price * i.qty)}`);
  return `🧾 *FAKHTA Invoice*\nInvoice: ${o.order_no}\nDate: ${(o.created_at || '').slice(0, 10)}\n${lines.join('\n')}\n*Total: ${fmt(o.subtotal)}* (COD)\nShukriya!`;
}
function waBill(o) {
  const ph = String(o.phone || '').replace(/[^\d]/g, '');
  const l = 'https://wa.me/92' + ph.slice(-10) + '?text=' + encodeURIComponent(billText(o));
  window.open(l, '_blank');
}
async function api(path, opts) {
  const r = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts || {}));
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.status);
  return j;
}
// ---------- cart ----------
let cart = [];
try { cart = JSON.parse(localStorage.getItem('fakhta_cart') || '[]'); } catch (e) { cart = []; }
function saveCart() { localStorage.setItem('fakhta_cart', JSON.stringify(cart)); updateCartBadge(); }
function cartQty() { return cart.reduce((a, i) => a + i.qty, 0); }
function cartSum() { return cart.reduce((a, i) => a + i.qty * i.price, 0); }
function updateCartBadge() { document.getElementById('cartCount').textContent = cartQty(); }
function addToCart(id, qty, silent) {
  const p = PRODS.find(x => x.id === Number(id));
  if (!p) return;
  const ex = cart.find(x => x.id === p.id);
  if (ex) ex.qty = Math.min(99, ex.qty + (qty || 1));
  else cart.push({ id: p.id, name_en: p.name_en, name_ur: p.name_ur, price: p.price, image: p.image, qty: qty || 1 });
  saveCart(); renderCart();
  if (!silent) toast(T('added'));
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
}
// ---------- language ----------
function applyLang() {
  document.documentElement.lang = LANG === 'ur' ? 'ur' : 'en';
  document.documentElement.dir = LANG === 'ur' ? 'rtl' : 'ltr';
  document.body.classList.toggle('ur', LANG === 'ur');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  document.getElementById('langToggle').textContent = LANG === 'ur' ? 'EN' : 'اردو';
  renderFooterCats();
}
function setLang(l) { LANG = l; localStorage.setItem('fakhta_lang', l); applyLang(); render(); }
// ---------- router ----------
const view = document.getElementById('view');
function nav() {
  const h = location.hash || '#/';
  document.querySelectorAll('#topnav a, #bottomnav a').forEach(a => {
    const v = a.getAttribute('href') || '';
    const active = v === h || (h === '#/' && v === '#/') ||
      (v === '#/shop' && h.startsWith('#/shop')) ||
      (v === '#/track' && h.startsWith('#/track'));
    a.classList.toggle('active', active);
  });
  if (h.startsWith('#/admin')) return renderAdmin(h);
  if (h.startsWith('#/product/')) return renderProduct(h.split('/')[2]);
  if (h === '#/shop' || h.startsWith('#/shop?')) return renderShop();
  if (h === '#/checkout') return renderCheckout();
  if (h === '#/track') return renderTrack();
  if (h === '#/success' || h.startsWith('#/success?')) return renderSuccess();
  return renderHome();
}
window.addEventListener('hashchange', nav);
// ---------- storefront views ----------
function prodCard(p) {
  return `<div class="prod-card" onclick="location.hash='#/product/${p.id}'">
    <img src="${esc(rel(p.image) || 'logo.png')}" alt="${esc(pname(p))}" loading="lazy" onerror="this.src='logo.png'">
    <div class="prod-body">
      <h3>${esc(pname(p))}</h3>
      <div class="prod-price">${fmt(p.price)}${p.old_price > p.price ? `<s>${fmt(p.old_price)}</s>` : ''}</div>
      <div class="stars">${stars(4.5)}</div>
      <button class="btn-gold" onclick="event.stopPropagation();addToCart(${p.id},1)">${esc(T('add_cart'))}</button>
    </div></div>`;
}
async function renderHome() {
  const cats = CATS, feat = PRODS.filter(p => p.featured);
  view.innerHTML = `
  <section class="hero hero-video">
    <img class="hero-bg" src="hero-royal.jpg" alt="Fakhta">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1>${esc(T('slogan'))}</h1>
      <p>${esc(T('hero_sub'))}</p>
      <div class="cta-row">
        <button class="btn-gold" onclick="location.hash='#/shop'">${esc(T('hero_cta'))}</button>
        <button class="btn-ghost" onclick="location.hash='#/shop'">${esc(T('hero_cta2'))}</button>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="section-head"><h2>${esc(T('cat_title'))}</h2></div>
    <div class="cat-grid">${cats.map(c => `
      <div class="cat-card" onclick="location.hash='#/shop?cat=${c.id}'">
        ${c.coming_soon ? `<span class="soon">${esc(T('coming_soon'))}</span>` : ''}
        <div class="cat-ico">${c.name_en === 'Dinner Sets' ? '🍽️' : c.name_en === 'Crockery' ? '☕' : '🔌'}</div>
        <h3>${esc(cname(c))}</h3>
        <small>${c.coming_soon ? esc(T('coming_soon')) : (PRODS.filter(p => p.category_id === c.id).length + ' ' + esc(T('tr_items')))}</small>
      </div>`).join('')}</div>
  </section>
  <section class="section">
    <div class="section-head"><h2>${esc(T('feat_title'))}</h2><a class="link-gold" href="#/shop">${esc(T('see_all'))}</a></div>
    <p style="color:var(--ink-dim);margin:-8px 0 14px">${esc(T('feat_sub'))}</p>
    <div class="prod-grid">${feat.map(prodCard).join('')}</div>
  </section>
  <div class="trust">
    ${[T('trust1'), T('trust2'), T('trust3'), T('trust4')].map((t, i) =>
      `<div><span class="t-ico">${['🚚', '💵', '↩️', '⭐'][i]}</span><span><b>${esc(t[0])}</b><br>${esc(t[1])}</span></div>`).join('')}
  </div>`;
}
let shopCat = '', shopQ = '';
async function renderShop() {
  const m = (location.hash.match(/cat=(\d+)/) || [])[1];
  if (m) shopCat = m;
  const list = PRODS.filter(p =>
    (!shopCat || String(p.category_id) === String(shopCat)) &&
    (!shopQ || (p.name_en + ' ' + p.name_ur + ' ' + p.desc_en).toLowerCase().includes(shopQ.toLowerCase())));
  view.innerHTML = `
  <section class="section" style="margin-top:6px">
    <div class="section-head"><h2>${esc(T('nav_shop'))}</h2></div>
    <div class="searchbar"><input id="q" placeholder="${esc(T('search_ph'))}" value="${esc(shopQ)}"></div>
    <div class="chips">
      <button class="chip ${!shopCat ? 'active' : ''}" data-cat="">${LANG === 'ur' ? 'سب' : 'All'}</button>
      ${CATS.map(c => `<button class="chip ${String(shopCat) === String(c.id) ? 'active' : ''}" data-cat="${c.id}">${esc(cname(c))}${c.coming_soon ? ' ⏳' : ''}</button>`).join('')}
    </div>
    <div class="prod-grid" id="shopGrid">${list.length ? list.map(prodCard).join('') : `<p class="empty">${esc(T('tr_none'))}</p>`}</div>
  </section>`;
  document.getElementById('q').addEventListener('input', e => { shopQ = e.target.value; renderShopKeep(); });
  document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => { shopCat = ch.dataset.cat; renderShop(); }));
  const qi = document.getElementById('q'); qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length);
}
function renderShopKeep() {
  const list = PRODS.filter(p =>
    (!shopCat || String(p.category_id) === String(shopCat)) &&
    (!shopQ || (p.name_en + ' ' + p.name_ur + ' ' + p.desc_en).toLowerCase().includes(shopQ.toLowerCase())));
  document.getElementById('shopGrid').innerHTML = list.length ? list.map(prodCard).join('') : `<p class="empty">${esc(T('tr_none'))}</p>`;
}
async function renderProduct(id) {
  let p;
  try { p = await api('/api/products/' + id); } catch (e) { view.innerHTML = '<p class="empty">…</p>'; return; }
  view.innerHTML = `
  <section class="section" style="margin-top:6px">
    <div class="pd">
      <img class="main" src="${esc(rel(p.image) || 'logo.png')}" alt="${esc(pname(p))}" onerror="this.src='logo.png'">
      <div>
        <h1>${esc(pname(p))}</h1>
        <div class="stars">${stars(4.8)} <span style="color:var(--ink-dim);font-size:.85rem">4.8</span></div>
        <div class="price">${fmt(p.price)}${p.old_price > p.price ? `<s>${fmt(p.old_price)}</s>` : ''}</div>
        <div class="field"><label>${esc(T('qty'))}</label>
          <div class="qty"><button onclick="pdQty(-1)">−</button><span id="pdq">1</span><button onclick="pdQty(1)">+</button></div>
        </div>
        <div class="actions">
          <button class="btn-gold" onclick="addToCart(${p.id}, +document.getElementById('pdq').textContent)">${esc(T('add_cart'))}</button>
          <button class="btn-ghost" onclick="addToCart(${p.id}, +document.getElementById('pdq').textContent, true);location.hash='#/checkout'">${esc(T('buy_now'))}</button>
        </div>
        <button class="btn-wa" style="display:${STORE.whatsapp ? '' : 'none'}" onclick='waAsk(PRODS.find(x=>x.id===${p.id}))'>📱 ${esc(T('wa_ask'))}</button>
        <div class="delivery-note">🚚 ${esc(T('delivery_note'))}</div>
        <h3 style="color:var(--gold2);margin-top:18px">${esc(T('desc'))}</h3>
        <p class="desc">${esc(pdesc(p))}</p>
      </div>
    </div>
  </section>`;
}
function pdQty(d) {
  const el = document.getElementById('pdq');
  el.textContent = Math.max(1, Math.min(99, (+el.textContent) + d));
}
function renderCheckout() {
  if (!cart.length) { location.hash = '#/shop'; return; }
  view.innerHTML = `
  <div class="form-card">
    <h2>${esc(T('co_title'))}</h2>
    <p style="text-align:center;color:var(--gold2);margin-bottom:16px">💵 ${esc(T('co_pay'))}</p>
    <div class="field" id="f_name"><label>${esc(T('co_name'))}</label><input id="co_name" placeholder="${esc(T('ph_name'))}"><div class="err">${esc(T('err_name'))}</div></div>
    <div class="field" id="f_phone"><label>${esc(T('co_phone'))}</label><input id="co_phone" inputmode="numeric" placeholder="${esc(T('ph_phone'))}"><div class="err">${esc(T('err_phone'))}</div></div>
    <div class="field" id="f_address"><label>${esc(T('co_address'))}</label><textarea id="co_address" rows="2" placeholder="${esc(T('ph_address'))}"></textarea><div class="err">${esc(T('err_address'))}</div></div>
    <div class="field" id="f_city"><label>${esc(T('co_city'))}</label><input id="co_city" placeholder="${esc(T('ph_city'))}"><div class="err">${esc(T('err_city'))}</div></div>
    <div class="field"><label>${esc(T('co_notes'))}</label><textarea id="co_notes" rows="2" placeholder="${esc(T('ph_notes'))}"></textarea></div>
    <div class="cart-total"><span>${esc(T('cart_total'))}</span><b>${fmt(cartSum())}</b></div>
    <button class="btn-gold btn-block" onclick="placeOrder()">${esc(T('co_place'))} • ${fmt(cartSum())}</button>
  </div>`;
}
async function placeOrder() {
  const g = id => document.getElementById(id).value.trim();
  const name = g('co_name'), phone = g('co_phone').replace(/[\s-]/g, ''), address = g('co_address'), city = g('co_city'), notes = g('co_notes');
  let ok = true;
  const mark = (fid, bad) => { document.getElementById(fid).classList.toggle('invalid', bad); if (bad) ok = false; };
  mark('f_name', !name); mark('f_phone', !/^03\d{9}$/.test(phone));
  mark('f_address', !address); mark('f_city', !city);
  if (!ok) return;
  try {
    const r = await api('/api/orders', { method: 'POST', body: JSON.stringify({ customer_name: name, phone, address, city, notes, items: cart.map(i => ({ id: i.id, qty: i.qty })) }) });
    window._lastOrder = { order_no: r.order_no, customer_name: name, phone, address, city, subtotal: r.subtotal, created_at: new Date().toISOString(), items: cart.map(i => ({ name_en: i.name_en, name_ur: i.name_ur, price: i.price, qty: i.qty })) };
    cart = []; saveCart(); renderCart();
    location.hash = '#/success?no=' + r.order_no;
  } catch (e) { toast(e.message); }
}
function renderSuccess() {
  const no = (location.hash.match(/no=([^&]+)/) || [])[1] || '';
  view.innerHTML = `<div class="success">
    <div class="big">🎉</div><h2>${esc(T('ok_title'))}</h2><p style="color:var(--ink-dim)">${esc(T('ok_msg'))}</p>
    <div class="order-no">${esc(decodeURIComponent(no))}</div><br>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      ${window._lastOrder ? `<button class="btn-ghost" onclick="printInvoice(window._lastOrder)">🧾 ${esc(T('bill'))}</button>` : ''}
      <button class="btn-gold" onclick="location.hash='#/'">${esc(T('ok_home'))}</button></div></div>`;
}
function renderTrack() {
  view.innerHTML = `
  <div class="form-card">
    <h2>${esc(T('tr_title'))}</h2>
    <div class="searchbar"><input id="tr_phone" inputmode="numeric" placeholder="${esc(T('tr_ph'))}">
    <button class="btn-gold" onclick="doTrack()">${esc(T('tr_btn'))}</button></div>
    <div id="trOut"></div>
  </div>`;
}
async function doTrack() {
  const ph = document.getElementById('tr_phone').value.replace(/[\s-]/g, '');
  const out = document.getElementById('trOut');
  if (!/^03\d{9}$/.test(ph)) { out.innerHTML = `<p class="empty">${esc(T('err_phone'))}</p>`; return; }
  out.innerHTML = '<p class="empty">…</p>';
  try {
    const list = await api('/api/track?phone=' + ph);
    if (!list.length) { out.innerHTML = `<p class="empty">${esc(T('tr_none'))}</p>`; return; }
    const sn = { new: T('st_new'), confirmed: T('st_confirmed'), shipped: T('st_shipped'), delivered: T('st_delivered'), cancelled: T('st_cancelled') };
    out.innerHTML = list.map((o, ix) => `
      <div class="track-card"><div class="th">
        <b style="color:var(--gold2)">${esc(o.order_no)}</b>
        <span class="status st-${o.status}">${esc(sn[o.status] || o.status)}</span></div>
        <div class="track-items">${o.items.map(i => `${esc(LANG === 'ur' && i.name_ur ? i.name_ur : i.name_en)} × ${i.qty}`).join(' • ')}</div>
        ${(o.courier || o.tracking_no) ? `<div class="courier-box">
          ${o.courier ? `<div><b>🚚 ${esc(T('tr_courier'))}:</b> ${esc(o.courier)}</div>` : ''}
          ${o.tracking_no ? `<div class="track-no"><span><b>${esc(T('tr_tracking'))}:</b> <bdi dir="ltr">${esc(o.tracking_no)}</bdi></span>
            <button class="btn-ghost btn-sm" data-tn="${esc(o.tracking_no)}" onclick="copyTrack(this)">📋 ${esc(T('tr_copy'))}</button></div>` : ''}
          ${o.courier && COURIER_URL[o.courier] ? `<a class="btn-gold btn-sm" target="_blank" rel="noopener" href="${COURIER_URL[o.courier]}">${esc(T('tr_track_btn'))} 🔗</a>` : ''}
        </div>` : ''}
        <div style="margin-top:6px;color:var(--ink-dim);font-size:.85rem">${fmt(o.subtotal)} • ${esc(o.created_at.slice(0, 10))}</div>
        <div style="margin-top:8px"><button class="btn-ghost btn-sm" onclick='printInvoice(window._track[${ix}])'>🧾 ${esc(T('bill'))}</button></div>
      </div>`).join('');
    window._track = list;
  } catch (e) { out.innerHTML = `<p class="empty">${esc(e.message)}</p>`; }
}
function renderFooterCats() {
  const el = document.getElementById('footerCats');
  if (el) el.innerHTML = CATS.map(c => `<a onclick="location.hash='#/shop?cat=${c.id}'">${esc(cname(c))}</a>`).join('');
}
// ---------- cart drawer ----------
function renderCart() {
  const box = document.getElementById('cartItems');
  if (!cart.length) box.innerHTML = `<p class="empty">${esc(T('cart_empty'))}</p>`;
  else box.innerHTML = cart.map((i, ix) => `
    <div class="ci">
      <img src="${esc(rel(i.image) || 'logo.png')}" onerror="this.src='logo.png'">
      <div class="ci-info"><b>${esc(LANG === 'ur' && i.name_ur ? i.name_ur : i.name_en)}</b><span>${fmt(i.price)}</span></div>
      <div class="qty"><button onclick="chQty(${ix},-1)">−</button><span>${i.qty}</span><button onclick="chQty(${ix},1)">+</button></div>
      <button class="rm" onclick="rmItem(${ix})">🗑</button>
    </div>`).join('');
  document.getElementById('cartTotal').textContent = fmt(cartSum());
}
function chQty(ix, d) { cart[ix].qty = Math.max(1, Math.min(99, cart[ix].qty + d)); saveCart(); renderCart(); }
function rmItem(ix) { cart.splice(ix, 1); saveCart(); renderCart(); toast(T('removed')); }
function openCart() { renderCart(); document.getElementById('cartDrawer').classList.add('open'); document.getElementById('drawerScrim').classList.add('show'); }
function closeCart() { document.getElementById('cartDrawer').classList.remove('open'); document.getElementById('drawerScrim').classList.remove('show'); }
document.getElementById('cartOpen').onclick = openCart;
document.getElementById('bnCart').onclick = e => { e.preventDefault(); openCart(); };
document.getElementById('cartClose').onclick = closeCart;
document.getElementById('drawerScrim').onclick = closeCart;
document.getElementById('checkoutBtn').onclick = () => { closeCart(); location.hash = '#/checkout'; };
document.getElementById('langToggle').onclick = () => setLang(LANG === 'ur' ? 'en' : 'ur');
// ============================================================ ADMIN ============================================================
let ADMIN = false;
async function renderAdmin(h) {
  try { ADMIN = (await api('/api/admin/me')).admin; } catch (e) { ADMIN = false; }
  if (!ADMIN) return renderAdminLogin();
  const tab = (h.split('/')[2] || 'dash');
  if (tab === 'orders') return adminOrders();
  if (tab === 'products') return adminProducts();
  if (tab === 'categories') return adminCategories();
  if (tab === 'manual') return adminManual();
  if (tab === 'reports') return adminReports();
  if (tab === 'settings') return adminSettings();
  if (tab === 'password') return adminPassword();
  return adminDash();
}
function adminShell(active, body) {
  view.innerHTML = `<div class="admin-wrap">
    <div class="admin-head"><h2>⚙️ Fakhta Admin</h2>
      <div><button class="btn-ghost" onclick="location.hash='#/'">🏠 Store</button>
      <button class="btn-danger" onclick="adminLogout()">Logout</button></div></div>
    <div class="tabs">
      ${[['dash', '📊 Dashboard'], ['orders', '📦 Orders'], ['manual', '📝 New Order'], ['products', '🍽️ Products'], ['categories', '🗂️ Categories'], ['reports', '📊 Reports'], ['settings', '⚙️ Settings'], ['password', '🔑 Password']]
        .map(t => `<button class="tab ${active === t[0] ? 'active' : ''}" onclick="location.hash='#/admin/${t[0]}'">${t[1]}</button>`).join('')}
    </div>${body}</div>`;
}
function renderAdminLogin() {
  view.innerHTML = `<div class="login-card">
    <img src="logo.png"><h2>Fakhta Admin</h2>
    <div class="field"><input type="password" id="apw" placeholder="Password" onkeydown="if(event.key==='Enter')adminLogin()"></div>
    <button class="btn-gold btn-block" onclick="adminLogin()">Login</button></div>`;
}
async function adminLogin() {
  try { await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: document.getElementById('apw').value }) }); location.hash = '#/admin/dash'; }
  catch (e) { toast('Wrong password'); }
}
async function adminLogout() { await api('/api/admin/logout', { method: 'POST' }); location.hash = '#/'; }
async function adminDash() {
  const d = await api('/api/admin/dashboard');
  adminShell('dash', `<div class="dash-cards">
    <div class="dcard c1"><b>${d.counts.new}</b><span>🆕 New orders</span></div>
    <div class="dcard c2"><b>${d.counts.confirmed}</b><span>✅ Confirmed</span></div>
    <div class="dcard c3"><b>${d.counts.shipped}</b><span>🚚 Shipped</span></div>
    <div class="dcard c4"><b>${d.counts.delivered}</b><span>📬 Delivered</span></div>
    <div class="dcard c5"><b>${fmt(d.pending_revenue)}</b><span>⏳ Pending revenue</span></div>
    <div class="dcard c6"><b>${fmt(d.revenue)}</b><span>💰 Delivered revenue</span></div>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
    <button class="btn-gold" onclick="location.hash='#/admin/orders'">📦 Orders →</button>
    <button class="btn-ghost" onclick="location.hash='#/admin/manual'">📝 Manual order</button>
    <button class="btn-ghost" onclick="location.hash='#/admin/reports'">📊 Reports</button>
  </div>`);
}
async function adminOrders(status) {
  const list = await api('/api/admin/orders' + (status ? '?status=' + status : ''));
  adminShell('orders', `
    <div class="chips">${['', 'new', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s =>
      `<button class="chip ${(!status && !s) || status === s ? 'active' : ''}" onclick="adminOrders('${s}')">${s || 'All'}</button>`).join('')}</div>
    <div style="overflow-x:auto"><table class="tbl"><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Date</th></tr>
    ${list.map(o => `<tr style="cursor:pointer" onclick="adminOrderDetail(${o.id})">
      <td><b style="color:var(--gold2)">${esc(o.order_no)}</b>${o.source && o.source !== 'online' ? `<span class="src-badge">${o.source === 'manual' ? '📝' : '📱'} ${esc(o.source)}</span>` : ''}${o.courier ? `<br><small style="color:var(--ink-dim)">🚚 ${esc(o.courier)}</small>` : ''}</td>
      <td>${esc(o.customer_name)}${o.cust_count > 1 ? `<br><span class="repeat-badge" title="${esc(T('ord_repeat'))}">🔁 ${o.cust_count} ${esc(T('ord_orders'))}</span>` : ''}</td>
      <td dir="ltr"><a class="link-gold" onclick="event.stopPropagation();custHistory('${esc(o.phone)}')">${esc(o.phone)}</a></td><td>${fmt(o.subtotal)}</td>
      <td><span class="status st-${o.status}">${o.status}</span></td><td>${esc(o.created_at.slice(0, 16).replace('T', ' '))}</td></tr>`).join('') || '<tr><td colspan=6 class="empty">No orders</td></tr>'}
    </table></div>`);
}
async function custHistory(phone) {
  let h;
  try { h = await api('/api/admin/customer?phone=' + encodeURIComponent(phone)); }
  catch (e) { toast(e.message); return; }
  const total = h.orders.reduce((a, o) => a + o.subtotal, 0);
  const sn = s => ({ new: '🆕', confirmed: '✅', shipped: '🚚', delivered: '📬', cancelled: '✕' }[s] || s);
  const box = document.createElement('div');
  box.className = 'modal show'; box.id = 'mCust';
  box.innerHTML = `<div class="modal-box">
    <h3>🔁 ${esc(T('cust_history'))}</h3>
    <p><b dir="ltr">${esc(h.phone)}</b> • ${h.count} ${esc(T('ord_orders'))} • <b>${fmt(total)}</b></p>
    <table class="tbl" style="margin:12px 0"><tr><th>Order</th><th>Total</th><th>Status</th><th>Date</th></tr>
    ${h.orders.map(o => `<tr style="cursor:pointer" onclick="document.getElementById('mCust').remove();adminOrderDetail(${o.id})">
      <td><b style="color:var(--gold2)">${esc(o.order_no)}</b></td><td>${fmt(o.subtotal)}</td>
      <td>${sn(o.status)} ${esc(o.status)}</td><td>${esc(o.created_at.slice(0, 10))}</td></tr>`).join('')}</table>
    <button class="btn-ghost" onclick="document.getElementById('mCust').remove()">Close</button></div>`;
  box.onclick = e => { if (e.target === box) box.remove(); };
  document.body.appendChild(box);
}
async function adminOrderDetail(id) {
  const o = await api('/api/admin/orders/' + id);
  window._curOrder = o;
  const box = document.createElement('div');
  box.className = 'modal show'; box.id = 'mDetail';
  box.innerHTML = `<div class="modal-box">
    <h3>${esc(o.order_no)}${o.cust_count > 1 ? ` <span class="repeat-badge" title="${esc(T('ord_repeat'))}">🔁 ${o.cust_count} ${esc(T('ord_orders'))}</span>` : ''}</h3>
    <p><b>${esc(o.customer_name)}</b> • <span dir="ltr">${esc(o.phone)}</span><br>${esc(o.address)}, ${esc(o.city)}${o.notes ? '<br>📝 ' + esc(o.notes) : ''}</p>
    <table class="tbl" style="margin:12px 0"><tr><th>Item</th><th>Qty</th><th>Price</th></tr>
    ${o.items.map(i => `<tr><td>${esc(i.name_en)}</td><td>${i.qty}</td><td>${fmt(i.price * i.qty)}</td></tr>`).join('')}</table>
    <div class="field"><label>Status</label><select id="mStatus">${['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => `<option ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    <div class="row2">
      <div class="field"><label>🚚 ${esc(T('adm_courier'))}</label><select id="mCourier"><option value="">—</option>${COURIERS.map(c => `<option value="${c}" ${o.courier === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div class="field"><label>🔢 ${esc(T('adm_tracking'))}</label><input id="mTracking" dir="ltr" placeholder="${esc(T('adm_tracking_ph'))}" value="${esc(o.tracking_no || '')}"></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn-gold" onclick="saveOrderDetail(${o.id})">Save</button>
    <button class="btn-ghost" onclick="printInvoice(window._curOrder)">🧾 ${esc(T('bill'))}</button>
    <button class="btn-wa" onclick="waBill(window._curOrder)">📱 ${esc(T('wa_bill'))}</button>
    <button class="btn-ghost" onclick="document.getElementById('mDetail').remove()">Close</button></div></div>`;
  box.onclick = e => { if (e.target === box) box.remove(); };
  document.body.appendChild(box);
}
async function saveOrderDetail(id) {
  await api('/api/admin/orders/' + id, { method: 'PUT', body: JSON.stringify({
    status: document.getElementById('mStatus').value,
    courier: document.getElementById('mCourier').value,
    tracking_no: document.getElementById('mTracking').value.trim()
  }) });
  document.getElementById('mDetail').remove(); adminOrders();
}
async function adminProducts() {
  const list = await api('/api/admin/products');
  const cats = await api('/api/admin/categories');
  window._cats = cats;
  adminShell('products', `
    <button class="btn-gold" style="margin-bottom:14px" onclick="prodForm()">+ Add Product</button>
    <div style="overflow-x:auto"><table class="tbl"><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>★</th><th></th></tr>
    ${list.map(p => `<tr><td><img class="thumb" src="${esc(rel(p.image) || 'logo.png')}" onerror="this.src='logo.png'"></td>
      <td><b>${esc(p.name_en)}</b><br><small style="color:var(--ink-dim)">${esc(p.name_ur)}</small></td>
      <td>${esc(p.cat_en || '—')}</td><td>${fmt(p.price)}</td><td>${p.stock}</td><td>${p.featured ? '⭐' : ''}</td>
      <td><button class="btn-ghost" style="padding:6px 12px" onclick='prodForm(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
      <button class="btn-danger" style="padding:6px 12px" onclick="delProd(${p.id})">✕</button></td></tr>`).join('')}
    </table></div><div id="mForm"></div>`);
}
function prodForm(p) {
  p = p || {};
  const cats = window._cats || [];
  document.getElementById('mForm').innerHTML = `<div class="modal show" id="mProd"><div class="modal-box">
    <h3>${p.id ? 'Edit' : 'Add'} Product</h3>
    <div class="row2">
      <div class="field"><label>Name (EN)</label><input id="pf_en" value="${esc(p.name_en || '')}"></div>
      <div class="field"><label>Name (UR)</label><input id="pf_ur" value="${esc(p.name_ur || '')}"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Price (Rs)</label><input id="pf_price" type="number" value="${p.price || ''}"></div>
      <div class="field"><label>Old Price (Rs)</label><input id="pf_old" type="number" value="${p.old_price || ''}"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Category</label><select id="pf_cat"><option value="">—</option>${cats.map(c => `<option value="${c.id}" ${p.category_id === c.id ? 'selected' : ''}>${esc(c.name_en)}</option>`).join('')}</select></div>
      <div class="field"><label>Stock</label><input id="pf_stock" type="number" value="${p.stock == null ? 100 : p.stock}"></div>
    </div>
    <div class="field"><label>Description (EN)</label><textarea id="pf_de" rows="2">${esc(p.desc_en || '')}</textarea></div>
    <div class="field"><label>Description (UR)</label><textarea id="pf_du" rows="2">${esc(p.desc_ur || '')}</textarea></div>
    <div class="field"><label>Image</label>
      <div style="display:flex;gap:10px"><input id="pf_img" value="${esc(p.image || '')}" placeholder="products/p1.jpg" style="flex:1">
      <label class="btn-ghost" style="padding:10px 16px;cursor:pointer">📤<input type="file" id="pf_file" accept="image/*" style="display:none"></label></div>
      <small style="color:var(--ink-dim)">Upload or paste image URL/path</small></div>
    <div class="row2">
      <div class="field"><label><input type="checkbox" id="pf_feat" ${p.featured ? 'checked' : ''}> ⭐ Featured</label></div>
      <div class="field"><label>Sort order</label><input id="pf_sort" type="number" value="${p.sort || 0}"></div>
    </div>
    <div style="display:flex;gap:10px"><button class="btn-gold" onclick="saveProd(${p.id || 0})">Save</button>
    <button class="btn-ghost" onclick="document.getElementById('mProd').remove()">Cancel</button></div></div></div>`;
  document.getElementById('pf_file').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append('image', f);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const j = await r.json();
    if (j.ok) { document.getElementById('pf_img').value = j.url; toast('Uploaded ✓'); } else toast('Upload failed');
  };
}
async function saveProd(id) {
  const g = x => document.getElementById(x).value;
  const body = {
    name_en: g('pf_en'), name_ur: g('pf_ur'), desc_en: g('pf_de'), desc_ur: g('pf_du'),
    price: +g('pf_price') || 0, old_price: +g('pf_old') || 0, category_id: +g('pf_cat') || null,
    image: g('pf_img'), featured: document.getElementById('pf_feat').checked,
    stock: +g('pf_stock') || 0, sort: +g('pf_sort') || 0
  };
  if (!body.name_en.trim()) { toast('Name required'); return; }
  await api(id ? '/api/admin/products/' + id : '/api/admin/products', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  adminProducts();
}
async function delProd(id) { if (confirm('Delete this product?')) { await api('/api/admin/products/' + id, { method: 'DELETE' }); adminProducts(); } }
async function adminCategories() {
  const list = await api('/api/admin/categories');
  adminShell('categories', `
    <button class="btn-gold" style="margin-bottom:14px" onclick="catForm()">+ Add Category</button>
    <table class="tbl"><tr><th>Name EN</th><th>Name UR</th><th>Coming soon</th><th></th></tr>
    ${list.map(c => `<tr><td>${esc(c.name_en)}</td><td>${esc(c.name_ur)}</td><td>${c.coming_soon ? '⏳' : ''}</td>
      <td><button class="btn-ghost" style="padding:6px 12px" onclick='catForm(${JSON.stringify(c).replace(/'/g, "&#39;")})'>Edit</button>
      <button class="btn-danger" style="padding:6px 12px" onclick="delCat(${c.id})">✕</button></td></tr>`).join('')}
    </table><div id="mForm"></div>`);
}
function catForm(c) {
  c = c || {};
  document.getElementById('mForm').innerHTML = `<div class="modal show" id="mCat"><div class="modal-box">
    <h3>${c.id ? 'Edit' : 'Add'} Category</h3>
    <div class="field"><label>Name (EN)</label><input id="cf_en" value="${esc(c.name_en || '')}"></div>
    <div class="field"><label>Name (UR)</label><input id="cf_ur" value="${esc(c.name_ur || '')}"></div>
    <div class="field"><label><input type="checkbox" id="cf_soon" ${c.coming_soon ? 'checked' : ''}> ⏳ Coming soon</label></div>
    <div style="display:flex;gap:10px"><button class="btn-gold" onclick="saveCat(${c.id || 0})">Save</button>
    <button class="btn-ghost" onclick="document.getElementById('mCat').remove()">Cancel</button></div></div></div>`;
}
async function saveCat(id) {
  const body = { name_en: document.getElementById('cf_en').value, name_ur: document.getElementById('cf_ur').value, coming_soon: document.getElementById('cf_soon').checked };
  if (!body.name_en.trim()) { toast('Name required'); return; }
  await api(id ? '/api/admin/categories/' + id : '/api/admin/categories', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  adminCategories();
}
async function delCat(id) { if (confirm('Delete this category?')) { await api('/api/admin/categories/' + id, { method: 'DELETE' }); adminCategories(); } }
function adminPassword() {
  adminShell('password', `<div class="form-card">
    <h2>🔑 Change Password</h2>
    <div class="field"><label>Current password</label><input type="password" id="pw_cur"></div>
    <div class="field"><label>New password (min 6 chars)</label><input type="password" id="pw_new"></div>
    <button class="btn-gold btn-block" onclick="savePw()">Change Password</button></div>`);
}
async function savePw() {
  try {
    await api('/api/admin/change-password', { method: 'POST', body: JSON.stringify({ current: document.getElementById('pw_cur').value, next: document.getElementById('pw_new').value }) });
    toast('Password changed ✓');
  } catch (e) { toast(e.message === 'wrong_current' ? 'Wrong current password' : 'Min 6 characters'); }
}
// ---------- manual order entry (WhatsApp / phone orders) ----------
let MROWS = [{ id: '', qty: 1 }];
async function adminManual() {
  const prods = await api('/api/products');
  const opts = sel => prods.map(p => `<option value="${p.id}" ${String(p.id) === String(sel) ? 'selected' : ''}>${esc(p.name_en)} — ${fmt(p.price)}</option>`).join('');
  adminShell('manual', `<div class="form-card"><h2>📝 Manual Order (WhatsApp / Phone)</h2>
    <div class="field"><label>Customer name</label><input id="mo_name" placeholder="e.g. Ahmed Raza"></div>
    <div class="field"><label>Phone</label><input id="mo_phone" inputmode="numeric" placeholder="03xxxxxxxxx"></div>
    <div class="field"><label>Address</label><textarea id="mo_addr" rows="2"></textarea></div>
    <div class="field"><label>City</label><input id="mo_city" placeholder="e.g. Dera Ismail Khan"></div>
    <div class="field"><label>Source</label><select id="mo_src"><option value="manual">Manual</option><option value="whatsapp">WhatsApp</option></select></div>
    <h3>Items</h3><div id="moRows">${MROWS.map((r, i) => `
      <div class="mprod-row"><select id="mo_p${i}"><option value="">— select —</option>${opts(r.id)}</select>
      <input id="mo_q${i}" type="number" min="1" max="99" value="${r.qty}">
      ${MROWS.length > 1 ? `<button class="btn-danger btn-sm" onclick="MROWS.splice(${i},1);adminManual()">✕</button>` : ''}</div>`).join('')}</div>
    <button class="btn-ghost btn-sm" onclick="MROWS.push({id:'',qty:1});adminManual()">+ Add item</button>
    <div style="margin-top:12px"><button class="btn-gold btn-block" onclick="placeManual()">Create Order</button></div>
  </div>`);
}
async function placeManual() {
  const items = MROWS.map((_, i) => ({ id: +document.getElementById('mo_p' + i).value, qty: +document.getElementById('mo_q' + i).value || 1 }))
    .filter(x => x.id);
  if (!items.length) return toast('Add at least one item');
  try {
    const r = await api('/api/orders', { method: 'POST', body: JSON.stringify({
      customer_name: document.getElementById('mo_name').value, phone: document.getElementById('mo_phone').value,
      address: document.getElementById('mo_addr').value, city: document.getElementById('mo_city').value,
      source: document.getElementById('mo_src').value, items }) });
    MROWS = [{ id: '', qty: 1 }];
    toast('Order ' + r.order_no + ' created ✓');
    location.hash = '#/admin/orders';
  } catch (e) { toast(e.message); }
}
// ---------- date-wise reports / ledger ----------
async function adminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const week = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
  adminShell('reports', `<div class="form-card"><h2>📊 Sales Report</h2>
    <div class="datebar">
      <div class="field"><label>From</label><input type="date" id="rp_from" value="${week}"></div>
      <div class="field"><label>To</label><input type="date" id="rp_to" value="${today}"></div>
      <button class="btn-gold" onclick="loadReport()">Show</button>
      <button class="btn-ghost" onclick="window.print()">🖨 Print</button>
    </div><div id="rpOut"></div></div>`);
  loadReport();
}
async function loadReport() {
  const out = document.getElementById('rpOut');
  const from = document.getElementById('rp_from').value, to = document.getElementById('rp_to').value;
  out.innerHTML = '<p class="empty">…</p>';
  try {
    const r = await api(`/api/admin/reports?from=${from}&to=${to}`);
    out.innerHTML = `<div class="dash-cards">
        <div class="dcard c2"><b>${r.total_orders}</b><span>Orders</span></div>
        <div class="dcard c6"><b>${fmt(r.total_revenue)}</b><span>Revenue</span></div></div>
      <h3>Day-wise</h3>
      <table class="rep-table"><tr><th>Date</th><th>Orders</th><th>Revenue</th></tr>
      ${r.days.map(d => `<tr><td>${esc(d.d)}</td><td>${d.orders}</td><td>${fmt(d.revenue)}</td></tr>`).join('') || '<tr><td colspan=3 class="empty">No data</td></tr>'}</table>
      <h3>Orders</h3>
      <table class="rep-table"><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
      ${r.orders.map(o => `<tr><td><b>${esc(o.order_no)}</b></td><td>${esc(o.customer_name)}</td><td>${fmt(o.subtotal)}</td><td>${o.status}</td><td>${esc(o.d)}</td></tr>`).join('')}</table>`;
  } catch (e) { out.innerHTML = `<p class="empty">${esc(e.message)}</p>`; }
}
// ---------- store settings (WhatsApp / phone) ----------
async function adminSettings() {
  const s = await api('/api/admin/settings');
  adminShell('settings', `<div class="form-card"><h2>⚙️ Store Settings</h2>
    <p style="color:var(--ink-dim)">Ye number site par (footer + WhatsApp buttons) show hoga.</p>
    <div class="field"><label>WhatsApp number (e.g. 923001234567)</label><input id="st_wa" dir="ltr" value="${esc(s.store_whatsapp)}" placeholder="923001234567"></div>
    <div class="field"><label>Phone display (e.g. 0300-1234567)</label><input id="st_ph" dir="ltr" value="${esc(s.store_phone)}"></div>
    <button class="btn-gold btn-block" onclick="saveSettings()">Save</button></div>`);
}
async function saveSettings() {
  try {
    await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify({
      store_whatsapp: document.getElementById('st_wa').value, store_phone: document.getElementById('st_ph').value }) });
    toast('Saved ✓'); loadStore();
  } catch (e) { toast(e.message); }
}
// ---------- boot ----------
(async function init() {
  applyLang();
  try {
    CATS = await api('/api/categories');
    PRODS = await api('/api/products');
    await loadStore();
  } catch (e) { console.error('API error', e); }
  updateCartBadge(); renderCart(); applyLang();
  const h = location.hash || '#/';
  if (h === '#/success' || h.startsWith('#/success?')) renderSuccess();
  else nav();
})();
