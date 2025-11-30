const CACHE_NAME = 'mediconnect-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/css/style.css',
  '/css/search-dropdown.css',
  '/js/main.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests - Network Only (or Network First if you want offline data)
  // For a booking app, we generally want fresh data, so Network First is risky if not handled carefully.
  // We'll use Network First for HTML pages to allow offline navigation to visited pages.
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Optional: Return a custom offline page here
              // return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // For static assets (css, js, images), use Cache First, falling back to Network
  if (event.request.destination === 'style' || 
      event.request.destination === 'script' || 
      event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          // Cache the new asset
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network First for everything else
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
