const C = 'buzzer-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // cards.json lives in IndexedDB after first load; don't double-cache 10MB
  if (u.pathname.endsWith('cards.json')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok && u.origin === location.origin) {
        const cl = res.clone(); caches.open(C).then(c => c.put(e.request, cl));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
