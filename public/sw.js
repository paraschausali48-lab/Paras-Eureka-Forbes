// Self-destructing Service Worker to clear old caches
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(cacheNames.map((cache) => caches.delete(cache)));
      })
      .then(() => {
        self.clients.claim();
        return self.registration.unregister();
      }),
  );
});

self.addEventListener('fetch', (e) => {
  // Do nothing, let the browser fetch from the network normally
});
