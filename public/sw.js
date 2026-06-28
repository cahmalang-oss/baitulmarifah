// Service Worker BaitulMarifah App
// Cache strategy: Cache First for static, Network First for API

const CACHE_NAME = 'baitulmarifah-v1';
const STATIC_CACHE = 'bm-static-v1';
const API_CACHE = 'bm-api-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== API_CACHE)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) return;

  // API routes: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          // Only cache public API
          if (url.pathname.startsWith('/api/public/')) {
            const clone = res.clone();
            caches.open(API_CACHE).then(c => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: Cache First
  if (url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp|ico|js|css|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Next.js static chunks
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Page navigations: Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline – BaitulMarifah</title><style>body{font-family:sans-serif;background:#0F172A;color:white;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}h1{color:#C9A84C;margin-bottom:8px}p{color:rgba(255,255,255,0.5)}</style></head><body><div><div style="font-size:48px;margin-bottom:16px">📡</div><h1>Anda Sedang Offline</h1><p>Periksa koneksi internet Anda dan coba lagi.</p></div></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }
});
