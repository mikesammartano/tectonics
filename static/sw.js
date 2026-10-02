// Tectonics service worker: the app keeps working on patchy school Wi-Fi and opens instantly on a repeat visit.
// HTML is network-first (so a deploy is picked up straight away) and everything else is cache-first.
const V = 'tectonics-__BUILD__';
const SHELL = ['/', '/privacy', '/site.webmanifest', '/favicon.svg', '/vendor/three-r128.min.js', '/vendor/jspdf-2.5.1.umd.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  // only our own GETs; never the API or other sites (YouTube, Stripe)
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(V).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match('/'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(V).then(c => c.put(req, copy)); }
    return res;
  })));
});
