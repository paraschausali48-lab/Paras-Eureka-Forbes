// Self-destructing Service Worker to clear old caches
self.addEventListener('install', (_e) => {
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

self.addEventListener('fetch', (_e) => {
  // Do nothing, let the browser fetch from the network normally
});
