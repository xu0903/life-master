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

// 雲端推播：App 沒開時也能跳出待辦提醒與夥伴督促
self.addEventListener('push', event => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'LifeMaster', {
      body: data.body || '',
      tag: data.tag,
      icon: 'pwa-192x192.png',
    }),
  )
})
