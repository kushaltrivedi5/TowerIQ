/// <reference lib="webworker" />

// This is a service worker, so we need to use the ServiceWorkerGlobalScope
const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v1';
const CACHE_NAME = `toweriq-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// Cache configuration
const CACHE_CONFIG = {
  STATIC: {
    name: `${CACHE_NAME}-static`,
    urls: [
      '/',
      '/offline',
      '/login',
      '/offline-test',
      '/manifest.json',
      '/favicon.ico',
      '/images/logo.png',
      '/globals.css',
    ]
  },
  DYNAMIC: {
    name: `${CACHE_NAME}-dynamic`,
    urls: [
      '/api/enterprises',
      '/api/metrics',
    ]
  },
  ASSETS: {
    name: `${CACHE_NAME}-assets`,
    urls: [
      '/_next/static/css/',
      '/_next/static/js/',
      '/_next/static/media/',
    ]
  }
};

// Install event - cache static assets
sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(CACHE_CONFIG.STATIC.name);
      await staticCache.addAll(CACHE_CONFIG.STATIC.urls);
      
      // Skip waiting to activate new service worker immediately
      await sw.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Claim clients to ensure the new service worker controls all pages
      await sw.clients.claim();
      
      // Clean up old caches
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter(key => !Object.values(CACHE_CONFIG).some(config => key === config.name))
          .map(key => caches.delete(key))
      );
    })()
  );
});

// Fetch event - handle requests
sw.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(sw.location.origin)) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(event.request);
          
          // Cache successful responses
          if (networkResponse.ok) {
            const dynamicCache = await caches.open(CACHE_CONFIG.DYNAMIC.name);
            await dynamicCache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // If network fails, try cache
          const dynamicCache = await caches.open(CACHE_CONFIG.DYNAMIC.name);
          const cachedResponse = await dynamicCache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }

          // If no cached response, show offline page
          const staticCache = await caches.open(CACHE_CONFIG.STATIC.name);
          const offlineResponse = await staticCache.match(OFFLINE_URL);
          return offlineResponse || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        }
      })()
    );
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(event.request);
          
          // Cache successful responses
          if (networkResponse.ok) {
            const dynamicCache = await caches.open(CACHE_CONFIG.DYNAMIC.name);
            await dynamicCache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // If network fails, try cache
          const dynamicCache = await caches.open(CACHE_CONFIG.DYNAMIC.name);
          const cachedResponse = await dynamicCache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return error response
          return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // Handle static assets
  if (CACHE_CONFIG.ASSETS.urls.some(url => event.request.url.includes(url))) {
    event.respondWith(
      (async () => {
        const assetsCache = await caches.open(CACHE_CONFIG.ASSETS.name);
        
        // Try cache first
        const cachedResponse = await assetsCache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          // If not in cache, try network
          const networkResponse = await fetch(event.request);
          
          // Cache the response for future use
          if (networkResponse.ok) {
            await assetsCache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // If network fails and it's an image, return a placeholder
          if (event.request.destination === 'image') {
            return new Response('', {
              status: 404,
              statusText: 'Not Found',
            });
          }
          
          // For other resources, return a basic offline response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        }
      })()
    );
    return;
  }

  // Default fetch behavior for other requests
  event.respondWith(fetch(event.request));
}); 