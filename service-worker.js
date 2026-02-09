const APP_VERSION = "v1.0.4";
const CACHE_NAME = `vegbazar-${APP_VERSION}`;
const RUNTIME_CACHE = `vegbazar-runtime-${APP_VERSION}`;

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
      .then(() => self.skipWaiting()),
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
          }),
        );
      })
      .then(() => {
        return self.clients.matchAll().then((clients) => {
          // Notify all clients to clear user data (one-time for v1.0.2)
          clients.forEach((client) => {
            client.postMessage({
              type: "CLEAR_USER_DATA",
              version: APP_VERSION,
              message: `Clearing user data for ${APP_VERSION} update`,
            });
          });
        });
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch Event - Serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip external origins and auth services
  if (
    url.origin !== location.origin ||
    url.origin.includes("auth0.com") ||
    url.origin.includes("google.com")
  ) {
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
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Only try to serve from cache for GET requests
          if (request.method === "GET") {
            return caches.match(request);
          }
          // For non-GET requests, return a network error response
          return new Response("Network error", {
            status: 503,
            statusText: "Service Unavailable",
          });
        }),
    );
    return;
  }

  // Handle regular requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          if (request.destination === "document") {
            return caches
              .match("/public/offline.html")
              .then((offlineResponse) => {
                return offlineResponse.text().then((html) => {
                  const modifiedHtml = html.replace(
                    "</body>",
                    `
                    <script>
                      window.addEventListener('online', () => {
                        console.log('Back online! Redirecting to home...');
                        window.location.href = '/public/';
                      });
                      
                      setInterval(() => {
                        if (navigator.onLine) {
                          fetch('/public/', { method: 'HEAD', cache: 'no-cache' })
                            .then(() => {
                              window.location.href = '/public/';
                            })
                            .catch(() => {
                              console.log('Still offline');
                            });
                        }
                      }, 3000);
                    </script>
                  </body>`,
                  );

                  return new Response(modifiedHtml, {
                    headers: { "Content-Type": "text/html" },
                  });
                });
              });
          }
        });
    }),
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
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error);
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
      }),
  );
});

// Message Handler
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data);

  // Skip waiting for immediate update
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
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          );
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        }),
    );
  }

  // Check online status
  if (event.data && event.data.type === "CHECK_ONLINE") {
    fetch("/public/", { method: "HEAD", cache: "no-cache" })
      .then(() => {
        event.ports[0].postMessage({ online: true });
      })
      .catch(() => {
        event.ports[0].postMessage({ online: false });
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
      }),
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
    event.ports[0].postMessage({
      version: APP_VERSION,
      cacheName: CACHE_NAME,
    });
  }
});
