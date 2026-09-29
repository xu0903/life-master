// 由 workbox service worker 載入：點通知時打開（或切回）LifeMaster
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const client = clients.find(c => 'focus' in c)
      if (client) return client.focus()
      return self.clients.openWindow(self.registration.scope)
    }),
  )
})
