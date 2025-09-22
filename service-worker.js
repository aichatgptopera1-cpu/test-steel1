
const CACHE_NAME = 'steel-dash-cache-v1';

// List of all local assets and critical CDN resources to be cached
const URLS_TO_CACHE = [
  './',
  'index.html',
  'index.tsx', // This is now the main bundled asset
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching assets');
        // Use addAll with a new Request object with cache: 'reload' to bypass HTTP cache
        // This ensures we get the latest versions from the network upon service worker update.
        const requests = URLS_TO_CACHE.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests);
      })
      .catch(error => {
        console.error('Failed to cache assets during install:', error);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
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
  // For API requests (e.g., gemini) and other dynamic content, always go to the network.
  const isApiRequest = event.request.url.includes('generativelanguage.googleapis.com');

  if (isApiRequest) {
    // Don't cache API requests, just fetch from network
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response from cache
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, cache it, and return the response
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response to cache.
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
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
