// Service Worker básico para cache estático
const CACHE_NAME = 'jupternews-cache-v1';
const PRECACHE_URLS = ['/', '/index.html', '/style.css', '/script.js', '/news-data.js', '/logo.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => { e.waitUntil(clients.claim()); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => { if (req.method === 'GET') { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); } return res; }).catch(()=>caches.match(req)));
  } else {
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));
  }
});