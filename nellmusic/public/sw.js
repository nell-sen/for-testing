self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  // Send message to client for player control
  self.clients.matchAll({ type: 'window' }).then(cs => {
    cs.forEach(c => c.postMessage({ type: 'notification_action', action }));
  });
});
