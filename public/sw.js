const VERSION = 'v2';
const CACHES = {
  core: `ef-core-${VERSION}`,
  images: `ef-images-${VERSION}`,
  data: `ef-data-${VERSION}`,
};

const ASSETS_TO_CACHE = ['./', './site.webmanifest'];
const MAX_IMAGES = 100;
const MAX_DATA = 50;
const IMAGE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper function to limit the number of items in the cache
const limitCacheSize = async (name, size) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > size) {
    await cache.delete(keys[0]);
    limitCacheSize(name, size);
  }
};

// Helper function to manage Image cache (Evict by Time-To-Live & Size)
const manageImageCache = async () => {
  const cache = await caches.open(CACHES.images);
  const keys = await cache.keys();
  const now = Date.now();

  // 1. Evict stale images
  for (const req of keys) {
    const res = await cache.match(req);
    if (res) {
      const fetchedOn = res.headers.get('sw-fetched-on');
      if (fetchedOn && now - parseInt(fetchedOn, 10) > IMAGE_TTL) {
        await cache.delete(req);
      }
    }
  }

  // 2. Limit array size
  const remainingKeys = await cache.keys();
  if (remainingKeys.length > MAX_IMAGES) {
    await cache.delete(remainingKeys[0]);
    manageImageCache();
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHES.core).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (!Object.values(CACHES).includes(cache)) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Data (JSON) -> Stale-While-Revalidate Strategy
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(CACHES.data).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
                limitCacheSize(CACHES.data, MAX_DATA);
              }
              return networkResponse;
            })
            .catch(() => cachedResponse); // Fallback to cache if offline
          return cachedResponse || fetchPromise;
        });
      }),
    );
    return;
  }

  // 2. Images -> Cache First, Fallback to Network Strategy
  if (event.request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
    event.respondWith(
      caches.open(CACHES.images).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                // Clone the response, convert to blob, and append timestamp header
                networkResponse
                  .clone()
                  .blob()
                  .then((blob) => {
                    const headers = new Headers(networkResponse.headers);
                    headers.append('sw-fetched-on', Date.now().toString());
                    const cacheResponse = new Response(blob, {
                      status: networkResponse.status,
                      statusText: networkResponse.statusText,
                      headers: headers,
                    });
                    cache.put(event.request, cacheResponse).then(() => manageImageCache());
                  });
              }
              return networkResponse;
            })
            .catch(() => new Response('Image offline', { status: 503 }));
        });
      }),
    );
    return;
  }

  // 3. Core Assets (HTML, JS, CSS) -> Network First, Fallback to Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const responseToCache = response.clone();
        caches.open(CACHES.core).then((cache) => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Offline content not available', { status: 503 });
        });
      }),
  );
});
