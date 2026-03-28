const CACHE_NAME = 'orientacion-cache-v1';

// Aquí listamos todo lo que el móvil debe descargar para funcionar sin internet
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  '[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)',
  '[https://unpkg.com/html5-qrcode](https://unpkg.com/html5-qrcode)',
  '[https://cdn-icons-png.flaticon.com/512/71/71422.png](https://cdn-icons-png.flaticon.com/512/71/71422.png)'
];

// Instalación: Guardar todo en la memoria caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Interceptar peticiones: Si no hay internet, usar la memoria caché
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el archivo está en caché, lo devuelve (Offline)
        if (response) return response;
        // Si no está, intenta buscarlo en internet (Online)
        return fetch(event.request);
      })
  );
});

