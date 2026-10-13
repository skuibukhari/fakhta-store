const CACHE = 'fakhta-v5';
self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  // Network-first: always try fresh, fall back to cache only if offline
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
