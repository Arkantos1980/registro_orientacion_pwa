const CACHE_NAME = 'orientacion-cache-v3'; // Cambiado a v3 para forzar actualización

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  '[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)',
  '[https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js](https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js)',
  '[https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Compass_icon.svg/192px-Compass_icon.svg.png](https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Compass_icon.svg/192px-Compass_icon.svg.png)',
  '[https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Compass_icon.svg/512px-Compass_icon.svg.png](https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Compass_icon.svg/512px-Compass_icon.svg.png)'
];

// Instalación: guardar recursos en caché
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url).catch(err => console.warn('No se pudo cachear:', url, err)))
      );
    })
  );
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('Eliminando caché antigua:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim()) 
  );
});

// Interceptar peticiones para funcionar offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isExternalScript = url.hostname !== self.location.hostname;

  if (isExternalScript) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
