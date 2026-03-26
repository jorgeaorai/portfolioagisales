const CACHE_NAME = 'agisales-v2'; // Increment version to trigger update
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/notes.css',
  './css/map.css',
  './css/solutions.css',
  './js/scripts.js',
  './js/notes.js',
  './js/db.js',
  './js/app.js',
  './js/jquery.min.js',
  './js/wow.min.js',
  './js/smoothscroll.js',
  './js/animsition.js',
  './js/jquery.validate.min.js',
  './js/jquery.magnific-popup.min.js',
  './js/owl.carousel.min.js',
  './js/jquery.pagepiling.min.js',
  './manifest.json',
  './favicon.png',
  './apple-touch-icon.png',
  './offline.html',
  'https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700&display=swap',
  'https://unpkg.com/dexie/dist/dexie.js'
];

// Install: Cache all critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: 
// 1. Assets (HTML, JS, CSS, fonts) -> Cache First
// 2. Data/API (Forms, map data) -> Network First with Fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Example of Network First for certain paths if any (e.g. results, maps)
  if (url.pathname.includes('/mapa/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Default: Cache First with Network Fallback
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fallback for navigation (page) requests
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
