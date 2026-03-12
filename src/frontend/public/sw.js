const CACHE_NAME = 'kuber-panel-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network first for API calls, cache first for assets
  if (event.request.url.includes('/api/') || event.request.url.includes('icp')) {
    event.respondWith(fetch(event.request));
  }
});
