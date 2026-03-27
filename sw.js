const CACHE_NAME = 'agisales-v5'; // Increment version
const CORE_ASSETS = [
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

const VIDEO_ASSETS = [
  './images/videobg.mp4',
  './images/videometodologia.mp4',
  './images/agivideo1.mp4'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache core assets all at once (fail if any core fails)
      const corePromise = cache.addAll(CORE_ASSETS);
      
      // Cache videos individually to allow failures (due to size/timeout)
      const videoPromises = VIDEO_ASSETS.map(url => 
        cache.add(url).catch(err => console.warn(`[SW] Failed to cache video: ${url}`, err))
      );

      return Promise.all([corePromise, ...videoPromises]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// Helper for Range requests (Essential for Safari/iOS videos)
async function handleRangeRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(request);
  if (!response) {
    try {
      return await fetch(request);
    } catch (e) {
      return new Response('', { status: 404 });
    }
  }

  const rangeHeader = request.headers.get('Range');
  if (!rangeHeader) return response;

  const data = await response.blob();
  const bytes = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(bytes[0], 10);
  const end = bytes[1] ? parseInt(bytes[1], 10) : data.size - 1;

  if (start >= data.size || end >= data.size) {
    return new Response('', {
      status: 416,
      statusText: 'Requested Range Not Satisfiable',
      headers: { 'Content-Range': `bytes */${data.size}` }
    });
  }

  const chunk = data.slice(start, end + 1);
  const headers = new Headers(response.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${data.size}`);
  headers.set('Content-Length', chunk.size);
  headers.set('Accept-Ranges', 'bytes');

  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: headers
  });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle Video Range Requests
  if (url.pathname.endsWith('.mp4')) {
    event.respondWith(handleRangeRequest(event.request));
    return;
  }

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

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./offline.html');
      });
    })
  );
});
