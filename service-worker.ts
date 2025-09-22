// FIX: Add a reference to the 'webworker' library to make Service Worker event types available.
/// <reference lib="webworker" />

// FIX: Wrap code in an IIFE to avoid global scope conflicts with service-worker.js
(() => {
  const CACHE_NAME = 'steel-dash-cache-v1';

  // FIX: Update cache list to only include bundled assets and CDNs, not individual source files.
  const URLS_TO_CACHE = [
    './',
    'index.html',
    'index.tsx',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap',
    'https://aistudiocdn.com/react@^19.1.1',
    'https://aistudiocdn.com/react-dom@^19.1.1',
    'https://aistudiocdn.com/react-dom@^19.1.1/',
    'https://aistudiocdn.com/react@^19.1.1/',
    'https://aistudiocdn.com/recharts@^3.2.0',
    'https://aistudiocdn.com/@google/genai@^1.20.0',
    'https://unpkg.com/@babel/standalone/babel.min.js'
  ];

  // Install event: open a cache and add all essential assets to it
  self.addEventListener('install', (event) => {
    // FIX: Cast event to InstallEvent to access the 'waitUntil' method, as the generic Event type lacks this property.
    const installEvent = event as InstallEvent;
    installEvent.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache and caching assets');
          return cache.addAll(URLS_TO_CACHE);
        })
        .catch(error => {
          console.error('Failed to cache assets during install:', error);
        })
    );
  });

  // Activate event: clean up old caches
  self.addEventListener('activate', (event) => {
    // FIX: Cast event to ActivateEvent to access the 'waitUntil' method.
    const activateEvent = event as ActivateEvent;
    const cacheWhitelist = [CACHE_NAME];
    activateEvent.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

  // Fetch event: serve assets from cache if available, otherwise fetch from network (cache-first strategy)
  self.addEventListener('fetch', (event) => {
    // FIX: Cast event to FetchEvent to access 'request' and 'respondWith' properties.
    const fetchEvent = event as FetchEvent;
    // For API requests (e.g., gemini) and other dynamic content, always go to the network.
    const isApiRequest = fetchEvent.request.url.includes('generativelanguage.googleapis.com');

    if (isApiRequest) {
      fetchEvent.respondWith(fetch(fetchEvent.request));
      return;
    }
    
    fetchEvent.respondWith(
      caches.match(fetchEvent.request)
        .then((response) => {
          // Cache hit - return the response from cache
          if (response) {
            return response;
          }

          // Not in cache - fetch from network, cache it, and return the response
          return fetch(fetchEvent.request).then(
            (networkResponse) => {
              // Check if we received a valid response to cache.
              // We can cache basic (same-origin, successful) and opaque (cross-origin, no-cors) responses.
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(fetchEvent.request, responseToCache);
                  });
              }
              return networkResponse;
            }
          ).catch(error => {
              console.error('Fetch failed; returning offline page instead.', error);
              // Optional: return a fallback offline page if the fetch fails
              // return caches.match('/offline.html');
          });
        })
    );
  });
})();