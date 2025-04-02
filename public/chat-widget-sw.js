/**
 * Pullse Chat Widget Service Worker
 * Provides caching for assets and API responses
 */

// Cache version - update this when assets change
const CACHE_VERSION = 'v1';
const CACHE_NAME = `pullse-chat-widget-${CACHE_VERSION}`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/message-notification.mp3',
  // Add other important assets here
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache known assets
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('pullse-chat-widget-') && cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Helper function to determine if a request should be cached
const shouldCache = (request) => {
  const url = new URL(request.url);
  
  // Don't cache API calls with workspaceId or sessionId parameters
  if (url.pathname.includes('/api/') && 
      (url.searchParams.has('workspaceId') || url.searchParams.has('sessionId'))) {
    return false;
  }
  
  // Cache static assets
  if (request.method === 'GET') {
    // Cache media files
    if (url.pathname.endsWith('.mp3') || 
        url.pathname.endsWith('.png') || 
        url.pathname.endsWith('.jpg') || 
        url.pathname.endsWith('.svg') || 
        url.pathname.endsWith('.gif') || 
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js')) {
      return true;
    }
  }
  
  return false;
};

// Fetch event - use cache-first for assets, network-first for API
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // For cacheable requests, use cache-first strategy
  if (shouldCache(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }
        
        // Otherwise fetch from network and cache
        return fetch(request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response as it's a stream that can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        });
      })
    );
  }
});

// Message event - handle cache invalidation messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INVALIDATE_CACHE') {
    const urlToInvalidate = event.data.url;
    
    // Open the cache and remove the specific URL
    caches.open(CACHE_NAME).then((cache) => {
      cache.delete(urlToInvalidate).then((deleted) => {
        // Respond back to client
        event.ports[0].postMessage({ 
          invalidated: deleted,
          url: urlToInvalidate 
        });
      });
    });
  }
});
