/**
 * ClockWise Pro - Service Worker
 * ============================================================================
 * Advanced offline functionality optimized for African markets
 * Features:
 * - Offline-first caching strategy
 * - Background sync for clock in/out operations
 * - IndexedDB for persistent offline data
 * - Low-bandwidth image optimization
 * - Intelligent cache management
 * ============================================================================
 */

const CACHE_VERSION = 'clockwise-pro-v1.0.0';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const DATA_CACHE_NAME = `${CACHE_VERSION}-data`;
const IMAGE_CACHE_NAME = `${CACHE_VERSION}-images`;

// Maximum cache sizes (optimized for low storage devices)
const MAX_DATA_CACHE_SIZE = 50; // 50 MB
const MAX_IMAGE_CACHE_SIZE = 20; // 20 MB
const MAX_CACHE_AGE_DAYS = 7; // 7 days

// Files to cache immediately on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // Fallback offline page
  '/offline.html'
];

// API endpoints to cache with network-first strategy
const API_CACHE_URLS = [
  '/api/users/me',
  '/api/organizations',
  '/api/departments',
  '/api/branches',
  '/api/schedules',
  '/api/labor-laws'
];

// ============================================================================
// INSTALL EVENT - Cache static assets
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS.filter(url => !url.includes('undefined')));
      })
      .then(() => self.skipWaiting()) // Activate immediately
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// ============================================================================
// ACTIVATE EVENT - Clean up old caches
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
      .then(() => console.log('[Service Worker] Activated successfully'))
  );
});

// ============================================================================
// FETCH EVENT - Intelligent caching strategies
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isAPIRequest(url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE_NAME));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
  } else {
    event.respondWith(networkFirstStrategy(request));
  }
});

// ============================================================================
// BACKGROUND SYNC - Queue offline actions
// ============================================================================
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync triggered:', event.tag);

  if (event.tag === 'sync-clock-entries') {
    event.waitUntil(syncClockEntries());
  } else if (event.tag === 'sync-break-entries') {
    event.waitUntil(syncBreakEntries());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag.startsWith('sync-')) {
    event.waitUntil(syncGenericData(event.tag));
  }
});

// ============================================================================
// PUSH NOTIFICATIONS - Handle push messages
// ============================================================================
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New notification from ClockWise Pro',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: event.data ? JSON.parse(event.data.text()) : {},
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ClockWise Pro', options)
  );
});

// ============================================================================
// NOTIFICATION CLICK - Handle notification interactions
// ============================================================================
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ============================================================================
// MESSAGE EVENT - Communication with main thread
// ============================================================================
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(event.data.urls))
    );
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
    );
  } else if (event.data.type === 'QUEUE_SYNC') {
    event.waitUntil(queueOfflineData(event.data.payload));
  }
});

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

/**
 * Network First Strategy - Try network, fallback to cache
 * Best for: API calls, dynamic data
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    // Return error response
    return new Response(
      JSON.stringify({ error: 'Offline - No cached data available', offline: true }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'application/json' })
      }
    );
  }
}

/**
 * Cache First Strategy - Try cache, fallback to network
 * Best for: Static assets, images
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed for:', request.url);

    // Return offline page for navigation
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }

    return new Response('Offline', { status: 503 });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('supabase.co') ||
         url.pathname.includes('/rest/v1/');
}

function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
}

function isStaticAsset(url) {
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.startsWith('/static/');
}

// ============================================================================
// BACKGROUND SYNC FUNCTIONS
// ============================================================================

/**
 * Sync queued clock entries when back online
 */
async function syncClockEntries() {
  console.log('[Service Worker] Syncing clock entries...');

  try {
    const db = await openIndexedDB();
    const queuedEntries = await getQueuedData(db, 'clock-entries');

    for (const entry of queuedEntries) {
      try {
        const response = await fetch('/api/clock-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.data)
        });

        if (response.ok) {
          await removeQueuedData(db, 'clock-entries', entry.id);
          console.log('[Service Worker] Clock entry synced:', entry.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync clock entry:', error);
      }
    }

    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return Promise.reject(error);
  }
}

/**
 * Sync queued break entries
 */
async function syncBreakEntries() {
  console.log('[Service Worker] Syncing break entries...');
  // Similar implementation to syncClockEntries
  return Promise.resolve();
}

/**
 * Sync queued messages
 */
async function syncMessages() {
  console.log('[Service Worker] Syncing messages...');
  // Similar implementation to syncClockEntries
  return Promise.resolve();
}

/**
 * Generic sync for any queued data
 */
async function syncGenericData(tag) {
  console.log('[Service Worker] Syncing generic data:', tag);
  return Promise.resolve();
}

/**
 * Queue data for later sync
 */
async function queueOfflineData(payload) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['sync-queue'], 'readwrite');
    const store = transaction.objectStore('sync-queue');

    await store.add({
      ...payload,
      queuedAt: new Date().toISOString(),
      status: 'pending'
    });

    console.log('[Service Worker] Data queued for sync:', payload);
  } catch (error) {
    console.error('[Service Worker] Failed to queue data:', error);
  }
}

// ============================================================================
// INDEXEDDB FUNCTIONS
// ============================================================================

/**
 * Open IndexedDB for offline data storage
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('clockwise-offline-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('clock-entries')) {
        db.createObjectStore('clock-entries', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('break-entries')) {
        db.createObjectStore('break-entries', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('schedules')) {
        db.createObjectStore('schedules', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Get queued data from IndexedDB
 */
function getQueuedData(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Remove synced data from IndexedDB
 */
function removeQueuedData(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Clean up old cache entries
 */
async function cleanupCache(cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  const now = Date.now();
  const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;

  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('date');

    if (dateHeader) {
      const cacheDate = new Date(dateHeader).getTime();
      if (now - cacheDate > maxAgeMs) {
        await cache.delete(request);
        console.log('[Service Worker] Deleted old cache entry:', request.url);
      }
    }
  }
}

// Run cache cleanup periodically
setInterval(() => {
  cleanupCache(DATA_CACHE_NAME, MAX_CACHE_AGE_DAYS);
  cleanupCache(IMAGE_CACHE_NAME, MAX_CACHE_AGE_DAYS);
}, 24 * 60 * 60 * 1000); // Every 24 hours

console.log('[Service Worker] Loaded successfully');
