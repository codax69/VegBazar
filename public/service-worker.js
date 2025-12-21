// Register service worker with update detection
if ('serviceWorker' in navigator) {
  let refreshing = false;

  // Detect controller change and reload page
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  // Register the service worker
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('[App] Service Worker registered');

      // Check for updates every 60 minutes
      setInterval(() => {
        registration.update();
        console.log('[App] Checking for updates...');
      }, 60 * 60 * 1000);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[App] New service worker found');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, show update prompt
            showUpdateNotification(newWorker);
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          console.log(`[App] Service Worker updated to version ${event.data.version}`);
        }
      });
    })
    .catch((error) => {
      console.error('[App] Service Worker registration failed:', error);
    });
}

// Show update notification to user
function showUpdateNotification(newWorker) {
  const updateBanner = createUpdateBanner();
  document.body.appendChild(updateBanner);

  // Auto-dismiss after 10 seconds if user doesn't interact
  const autoDismiss = setTimeout(() => {
    updateBanner.remove();
    // Auto-update silently
    newWorker.postMessage({ type: 'SKIP_WAITING' });
  }, 10000);

  // Handle update button click
  updateBanner.querySelector('#update-btn').addEventListener('click', () => {
    clearTimeout(autoDismiss);
    updateBanner.remove();
    newWorker.postMessage({ type: 'SKIP_WAITING' });
  });

  // Handle dismiss button click
  updateBanner.querySelector('#dismiss-btn').addEventListener('click', () => {
    clearTimeout(autoDismiss);
    updateBanner.remove();
  });
}

// Create update notification banner
function createUpdateBanner() {
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.innerHTML = `
    <style>
      #update-banner {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      #update-banner h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }
      #update-banner p {
        margin: 0 0 12px 0;
        font-size: 14px;
        opacity: 0.95;
      }
      #update-banner .buttons {
        display: flex;
        gap: 8px;
      }
      #update-banner button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.2s;
      }
      #update-banner button:hover {
        opacity: 0.9;
      }
      #update-btn {
        background: white;
        color: #4CAF50;
      }
      #dismiss-btn {
        background: rgba(255,255,255,0.2);
        color: white;
      }
      @media (max-width: 480px) {
        #update-banner {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    </style>
    <h3>🎉 New Update Available!</h3>
    <p>A new version of VegBazar is ready to install.</p>
    <div class="buttons">
      <button id="update-btn">Update Now</button>
      <button id="dismiss-btn">Later</button>
    </div>
  `;
  return banner;
}

// Optional: Check for updates on page visibility change
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
});