const CACHE_NAME = 'orientacion-cache-v2';

// ✅ URLs corregidas (sin corchetes)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn-icons-png.flaticon.com/512/71/71422.png'
];

// Instalación: guardar recursos en caché
self.addEventListener('install', event => {
  // Activar inmediatamente sin esperar a que se cierre la pestaña anterior
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll falla si cualquier URL falla; usamos add individualmente para mayor robustez
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
    ).then(() => self.clients.claim()) // Tomar control de todas las pestañas abiertas
  );
});

// Interceptar peticiones: Network-first para scripts externos, Cache-first para recursos propios
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isExternalScript = url.hostname !== self.location.hostname;

  if (isExternalScript) {
    // Para CDNs: intentar red primero, caché como fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Guardar copia fresca en caché
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Para recursos propios: caché primero (funciona offline)
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
