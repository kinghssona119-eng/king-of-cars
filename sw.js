// ===========================================================
// ملك السيارات — Service Worker
// مهم: لما تحدّث محتوى index.html مستقبلاً، غيّر رقم CACHE_NAME
// (مثلاً mok-alsayarat-v2) عشان المستخدمين ياخذوا آخر نسخة.
// ===========================================================

const CACHE_NAME = 'mok-alsayarat-v1';
const APP_SHELL = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first مع fallback للـ cache، عشان دايماً يجيب أحدث نسخة لما يكون أونلاين
// ويشتغل أوفلاين لو النت مقطوع.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
