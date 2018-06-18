let restaurantsCache = 'restaurants-v2';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(restaurantsCache).then(function(cache) {  
      const sources = [
        '/',
        '/favicon.ico',
        '/index.html',
        '/restaurant.html',
        '/manifest.json',
        '/css/styles.css',
        '/img/w270/1.webp',
        '/img/w270/2.webp',
        '/img/w270/3.webp',
        '/img/w270/4.webp',
        '/img/w270/5.webp',
        '/img/w270/6.webp',
        '/img/w270/7.webp',
        '/img/w270/8.webp',
        '/img/w270/9.webp',
        '/img/w270/10.webp',
        '/img/w270/undefined.webp',
        '/js/main.js',
        '/js/dbhelper.js',
        '/js/restaurant_info.js',
        '/node_modules/idb/lib/idb.js'
      ];
      return cache.addAll(sources);
    })
  );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            if (response) return response;
            //if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
            return fetch(event.request);
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('restaurants-v') &&
                        cacheName != restaurantsCache;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            )
        })
    );
});
