// 由 workbox service worker 載入：點通知時打開（或切回）LifeMaster
self.addEventListener('notificationclick', event => {
  event.notification.close()
  // 推播單字卡：打開 App 直接顯示那張卡
  const cardId = event.notification.data && event.notification.data.cardId
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const client = clients.find(c => 'focus' in c)
      if (client) {
        if (cardId) client.postMessage({ type: 'open-card', cardId })
        return client.focus()
      }
      return self.clients.openWindow(self.registration.scope + (cardId ? `?card=${encodeURIComponent(cardId)}` : ''))
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
  let title = data.title || 'LifeMaster'
  let cardId
  // 推播單字卡和待辦提醒走同一條排程，tag 是 word:<時段>:<卡片 id>（src/utils/wordPush.ts）
  if (data.tag && data.tag.startsWith('word:')) {
    cardId = data.tag.split(':').slice(2).join(':')
    title = `📘 ${title.replace(/^⏰ /, '')}`
  }
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      tag: data.tag,
      icon: 'pwa-192x192.png',
      data: { cardId },
    }),
  )
})
