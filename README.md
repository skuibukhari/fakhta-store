# Fakhta — Online Store (v1.2.0)

Online-only general store for Pakistan. Bilingual (English + اردو).
Business model: customer orders on website → buy from wholesale → deliver (Cash on Delivery).

## v1.2 — Animated dove hero (2026-10-05)
- Homepage hero now plays a 10-second looping video of the golden dove in flight
  (`public/hero-dove.mp4`, lightweight 1.2MB), with a poster image fallback
  (`public/hero-dove-poster.jpg`) for slow networks. Muted autoplay, no sound.
  Same code serves both website and PWA app.

## v1.1 — Repeat customers + Courier tracking (2026-10-05)
- **Repeat customer detection (no login needed):** orders matched by phone number.
  Admin orders table shows 🔁 badge with order count; click the phone → full customer history.
- **Courier tracking:** admin adds courier (TCS, Leopards, Pakistan Post, PostEx, Call Courier,
  Daewoo Fastex, Other) + tracking number per order. Customer sees it on Track Order page
  with copy button; TCS gets a direct "Track on courier site" link.
  (Live auto-status needs the courier's business API — manual status updates for now.)

## Run locally
```bash
cd ~/workspace/fakhta-store/app
npm install
node server.js        # or: PORT=3000 node server.js
```
Open http://localhost:3000 — Admin: http://localhost:3000/admin

## Admin login
- Default password: `fakhta123`
- ⚠️ Change it after first login (Admin → 🔑 Password tab). Stored as salted SHA-256 in DB, never in code.

## Features
**Storefront:** home (hero, categories, featured, trust badges), shop (filters + search),
product detail, cart drawer, checkout (Pakistani mobile validation 03xx-xxxxxxx),
order success + order number, order tracking by phone. EN/اردو toggle (RTL + Nastaleeq).

**Admin:** dashboard (order counts, revenue), orders (status workflow),
products CRUD (bilingual, image upload, featured, stock), categories CRUD, password change.

## v1.3.0 features
- 🧾 Printable Bill/Invoice per order (invoice no = order no), customer + admin
- 📱 WhatsApp: "Ask on WhatsApp" on products, bill sharing from admin, number in footer (admin sets it in ⚙️ Settings — never hardcoded)
- 📝 Manual order entry (admin) for WhatsApp/phone orders (source badge)
- 📊 Date-wise sales report / ledger with day-wise + totals, print-friendly
- 🎛️ Colorful admin dashboard (gradient stat cards)

## Deploy (Alwaysdata, same as Gulshan Factory)
Push to a GitHub repo → webhook auto-pull → panel Restart (server.js).
SQLite file lives in `./data/fakhta.db` (created on boot with seed data).

### Sub-path install (BASE_PATH)
When the site runs under a path like `kashf.alwaysdata.net/fakhta` (separate
Alwaysdata site whose address is `kashf.alwaysdata.net/fakhta`), set the env var:

```
BASE_PATH=/fakhta
```

The server strips the prefix internally, injects `<base href="/fakhta/">` into
the storefront, serves a matching manifest, and the frontend prefixes API calls
automatically. Leave BASE_PATH empty to serve from the domain root.
Webhook URL in that setup: `https://kashf.alwaysdata.net/fakhta/api/deploy`.
