const CACHE_NAME = 'agisales-offline-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/notes.css',
  '/js/scripts.js',
  '/js/notes.js',
  '/js/jquery.min.js',
  '/js/wow.min.js',
  '/js/smoothscroll.js',
  '/js/animsition.js',
  '/js/jquery.validate.min.js',
  '/js/jquery.magnific-popup.min.js',
  '/js/owl.carousel.min.js',
  '/js/jquery.pagepiling.min.js',
  '/fonts/poppins-v21-latin-regular.woff2',
  '/apple-touch-icon-114x114.png',
  '/apple-touch-icon.png'
  // Adicione outras imagens necessárias para funcionar 100% offline se desejar
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna o arquivo do cache, se existir, caso contrário vai pra rede
      return response || fetch(event.request);
    }).catch(() => {
      // Cai aqui quando tá offline e não tem no cache
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
