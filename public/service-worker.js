const APP_VERSION = "v1.0.9";
const CACHE_NAME = `vegbazar-${APP_VERSION}`;
const RUNTIME_CACHE = `vegbazar-runtime-${APP_VERSION}`;
const MAX_RUNTIME_CACHE_SIZE = 50; // Limit runtime cache size

const STATIC_ASSETS = [
  "/public/",
  "/public/index.html",
  "/public/offline.html",
  "/public/vegbazar.svg",
];

// Install Event - Cache resources
self.addEventListener("install", (event) => {
  console.log(`[Service Worker] Installing ${APP_VERSION}...`);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Don't skip waiting - let user control updates
        console.log("[Service Worker] Installed, waiting for activation");
      })
      .catch((error) => {
        console.error("[Service Worker] Installation failed:", error);
      })
  );
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
  console.log(`[Service Worker] Activating ${APP_VERSION}...`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old version caches only
            if (
              cacheName.startsWith("vegbazar-") &&
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE
            ) {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.matchAll().then((clients) => {
          // FIXED: Only clear user data for specific version migrations
          const VERSIONS_REQUIRING_DATA_CLEAR = ["v1.0.2"];
          
          if (VERSIONS_REQUIRING_DATA_CLEAR.includes(APP_VERSION)) {
            clients.forEach((client) => {
              client.postMessage({
                type: "CLEAR_USER_DATA",
                version: APP_VERSION,
                message: `Clearing user data for ${APP_VERSION} update`,
              });
            });
          }

          // Notify all clients that new version is ready
          clients.forEach((client) => {
            client.postMessage({
              type: "VERSION_UPDATED",
              version: APP_VERSION,
              message: `Updated to ${APP_VERSION}`,
            });
          });
        });
      })
      .then(() => self.clients.claim())
      .catch((error) => {
        console.error("[Service Worker] Activation failed:", error);
      })
  );
});

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

// Fetch Event - Serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // FIXED: Simplified origin check
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests and non-GET requests
  if (request.url.includes("/api/") || request.method !== "GET") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache GET requests with successful responses
          if (response && response.status === 200 && request.method === "GET") {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone).then(() => {
                limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Only try to serve from cache for GET requests
          if (request.method === "GET") {
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return network error response
              return new Response("Network error", {
                status: 503,
                statusText: "Service Unavailable",
              });
            });
          }
          // For non-GET requests, return a network error response
          return new Response("Network error", {
            status: 503,
            statusText: "Service Unavailable",
          });
        })
    );
    return;
  }

  // Handle regular requests - Cache First with Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // IMPROVED: More flexible response validation
          if (!response || response.status !== 200) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone).then(() => {
              limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
            });
          });

          return response;
        })
        .catch(() => {
          // Serve offline page for document requests
          if (request.destination === "document") {
            return caches.match("/public/offline.html");
          }
          // For other resources, return a network error
          return new Response("Network error", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
    })
  );
});

// Background Sync
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-orders") {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  try {
    console.log("[Service Worker] Syncing pending orders...");
    // Add your sync logic here
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error);
    throw error; // Re-throw to retry sync
  }
}

// Push Notifications
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received");

  let data = {};
  let title = "VegBazar";
  let body = "You have a new notification";

  if (event.data) {
    try {
      data = event.data.json();
      title = data.title || title;
      body = data.body || body;
    } catch {
      console.log("[Service Worker] Push data is plain text");
      body = event.data.text();
    }
  }

  const options = {
    body: body,
    icon: "/public/vegbazar.svg",
    badge: "/public/vegbazar.svg",
    vibrate: [200, 100, 200],
    tag: data.tag || "vegbazar-notification",
    requireInteraction: false,
    data: {
      url: data.url || "/public/",
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/public/vegbazar.svg",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/public/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message Handler
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data);

  // Skip waiting for immediate update (user-triggered)
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Clear all caches
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ success: true });
          }
        })
        .catch((error) => {
          console.error("[Service Worker] Cache clear failed:", error);
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ success: false, error: error.message });
          }
        })
    );
  }

  // Check online status
  if (event.data && event.data.type === "CHECK_ONLINE") {
    fetch("/public/", { method: "HEAD", cache: "no-cache" })
      .then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ online: true });
        }
      })
      .catch(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ online: false });
        }
      });
  }

  // Request notification permission
  if (event.data && event.data.type === "REQUEST_NOTIFICATION") {
    event.waitUntil(
      self.registration.showNotification("Welcome to VegBazar!", {
        body: "Thanks for installing! You'll receive updates about your orders.",
        icon: "/public/vegbazar.svg",
        badge: "/public/vegbazar.svg",
        tag: "vegbazar-welcome",
        requireInteraction: false,
        vibrate: [200, 100, 200],
      })
    );
  }

  // Auto-update check when page becomes visible
  if (event.data && event.data.type === "PAGE_VISIBLE") {
    self.registration
      .update()
      .then(() => {
        console.log("[Service Worker] Auto-update check completed");
      })
      .catch((error) => {
        console.error("[Service Worker] Auto-update check failed:", error);
      });
  }

  // Get current version
  if (event.data && event.data.type === "GET_VERSION") {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        version: APP_VERSION,
        cacheName: CACHE_NAME,
      });
    }
  }
});