const CACHE_NAME = 'vegbazar-v1';
const RUNTIME_CACHE = 'vegbazar-runtime';

const STATIC_ASSETS = [
  '/public/',
  '/public/index.html',
  '/public/offline.html',
  '/public/vegbazar.svg'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.registration.showNotification('VegBazar Installed!', {
          body: 'The app has been installed successfully. You can now use it offline!',
          icon: '/public/vegbazar.svg',
          badge: '/public/vegbazar.svg',
          tag: 'vegbazar-install',
          requireInteraction: false,
          vibrate: [200, 100, 200, 100, 200],
          actions: [
            {
              action: 'open',
              title: 'Open App',
              icon: '/public/vegbazar.svg'
            }
          ]
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            message: 'Service Worker activated successfully'
          });
        });
      });
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    return;
  }

  if (request.url.includes('/api/') || request.method !== 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return response;
          })
          .catch(() => {
            if (request.destination === 'document') {
              return caches.match('/public/offline.html').then((offlineResponse) => {
                return offlineResponse.text().then((html) => {
                  const modifiedHtml = html.replace('</body>', `
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
                  </body>`);
                  
                  return new Response(modifiedHtml, {
                    headers: { 'Content-Type': 'text/html' }
                  });
                });
              });
            }
          });
      })
  );
});

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  try {
    console.log('[Service Worker] Syncing pending orders...');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  let data = {};
  let title = 'VegBazar';
  let body = 'You have a new notification';
  
  if (event.data) {
    try {
      data = event.data.json();
      title = data.title || title;
      body = data.body || body;
    } catch {
      console.log('[Service Worker] Push data is plain text');
      body = event.data.text();
    }
  }

  const options = {
    body: body,
    icon: '/public/vegbazar.svg',
    badge: '/public/vegbazar.svg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'vegbazar-notification',
    requireInteraction: false,
    data: {
      url: data.url || '/public/',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/public/vegbazar.svg'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/public/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'CHECK_ONLINE') {
    fetch('/public/', { method: 'HEAD', cache: 'no-cache' })
      .then(() => {
        event.ports[0].postMessage({ online: true });
      })
      .catch(() => {
        event.ports[0].postMessage({ online: false });
      });
  }
  
  if (event.data && event.data.type === 'REQUEST_NOTIFICATION') {
    event.waitUntil(
      self.registration.showNotification('Welcome to VegBazar!', {
        body: 'Thanks for installing! You\'ll receive updates about your orders.',
        icon: '/public/vegbazar.svg',
        badge: '/public/vegbazar.svg',
        tag: 'vegbazar-welcome',
        requireInteraction: false,
        vibrate: [200, 100, 200]
      })
    );
  }
});

// Auto-update functionality - checks on page visibility change
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PAGE_VISIBLE') {
    self.registration.update()
      .then(() => {
        console.log('[Service Worker] Auto-update check completed');
      })
      .catch((error) => {
        console.error('[Service Worker] Auto-update check failed:', error);
      });
  }
});