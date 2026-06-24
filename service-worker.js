// Service Worker pour Bijoux Deluxe
// Permet le fonctionnement hors ligne et l'amélioration des performances

const CACHE_NAME = 'bijoux-deluxe-v1';
const CACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache - Network first, then cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes externes (Stripe, Google Fonts, etc)
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }

  // Pour les ressources locales: try network first, then cache
  event.respondWith(
    fetch(request)
      .then(response => {
        // Clone la réponse
        const responseClone = response.clone();
        
        // Mettre en cache
        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, responseClone));
        
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, utiliser le cache
        return caches.match(request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // Fallback pour les pages
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            // Fallback pour les images
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            throw new Error('No matching response found');
          });
      })
  );
});

// Gestion des push notifications (optionnel)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: './image_logo_video/icon-192.png',
    badge: './image_logo_video/icon-192.png',
    tag: 'bijoux-deluxe-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Bijoux Deluxe', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // Chercher si la fenêtre est déjà ouverte
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir une nouvelle fenêtre si nécessaire
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(event.data.urls));
  }
});

// Gestion des erreurs de synchronisation en arrière-plan (optionnel)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      // Logique pour synchroniser les commandes
      Promise.resolve()
    );
  }
});

console.log('Service Worker installé avec succès!');
