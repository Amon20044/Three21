// Service Worker for caching demo.fbx and other assets
const CACHE_NAME = 'three21-demo-cache-v1';
const DEMO_CACHE_NAME = 'three21-demo-models-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/demo.fbx',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(asset => asset !== '/demo.fbx'));
      }),
      // Cache demo.fbx separately with special handling
      cacheDemoFBX()
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DEMO_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special handling for demo.fbx
  if (url.pathname.endsWith('/demo.fbx')) {
    event.respondWith(handleDemoFBXRequest(event.request));
    return;
  }
  
  // Handle other requests
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }
        
        // Not in cache, fetch from network
        return fetch(event.request).then((response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch((error) => {
          console.error('[SW] Fetch failed:', error);
          throw error;
        });
      })
    );
  }
});

// Special function to cache demo.fbx with retry logic
async function cacheDemoFBX() {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`[SW] Attempting to cache demo.fbx (attempt ${retries + 1})`);
      
      const response = await fetch('/demo.fbx', {
        cache: 'no-cache',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch demo.fbx: ${response.status}`);
      }
      
      const cache = await caches.open(DEMO_CACHE_NAME);
      await cache.put('/demo.fbx', response.clone());
      
      console.log('[SW] Successfully cached demo.fbx');
      return response;
    } catch (error) {
      console.error(`[SW] Failed to cache demo.fbx (attempt ${retries + 1}):`, error);
      retries++;
      
      if (retries < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }
  
  console.error('[SW] Failed to cache demo.fbx after all retries');
}

// Handle demo.fbx requests with fallback logic
async function handleDemoFBXRequest(request) {
  try {
    // First, try to get from cache
    const demoCache = await caches.open(DEMO_CACHE_NAME);
    const cachedResponse = await demoCache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving demo.fbx from cache');
      return cachedResponse;
    }
    
    // Not in cache, try to fetch and cache
    console.log('[SW] demo.fbx not in cache, fetching from network');
    const response = await fetch(request, {
      cache: 'no-cache',
      mode: 'cors'
    });
    
    if (response.ok) {
      // Cache the response
      const responseClone = response.clone();
      await demoCache.put(request, responseClone);
      console.log('[SW] Cached demo.fbx from network response');
      return response;
    } else {
      throw new Error(`Network response not ok: ${response.status}`);
    }
  } catch (error) {
    console.error('[SW] Error handling demo.fbx request:', error);
    
    // As a last resort, try the regular cache
    const regularCache = await caches.open(CACHE_NAME);
    const fallbackResponse = await regularCache.match(request);
    
    if (fallbackResponse) {
      console.log('[SW] Serving demo.fbx from fallback cache');
      return fallbackResponse;
    }
    
    // If all else fails, let the error propagate
    throw error;
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_DEMO_FBX') {
    event.waitUntil(
      cacheDemoFBX().then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch((error) => {
        event.ports[0].postMessage({ success: false, error: error.message });
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      caches.open(DEMO_CACHE_NAME).then((cache) => {
        return cache.match('/demo.fbx');
      }).then((response) => {
        event.ports[0].postMessage({ 
          cached: !!response,
          timestamp: response ? response.headers.get('date') : null
        });
      })
    );
  }
});
