import { PRIORITIES, dueStart, reminderAt } from '../data/todos'
import type { Todo } from '../data/todos'
import { enablePush } from './push'

export const canNotify = typeof window !== 'undefined' && 'Notification' in window

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return canNotify ? Notification.permission : 'unsupported'
}

/** 必須在點擊事件內呼叫，iPhone 才會跳出權限詢問 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!canNotify) return 'unsupported'
  const permission = await Notification.requestPermission()
  // 同意後順便登記雲端推播，App 關著也收得到
  if (permission === 'granted') await enablePush()
  return permission
}

/** 優先透過 service worker 發通知（iPhone 主畫面 App 必須這樣做），不行再用一般 Notification */
export async function showNotification(title: string, body: string, tag?: string) {
  if (notificationPermission() !== 'granted') return false
  const options: NotificationOptions = { body, tag, icon: `${import.meta.env.BASE_URL}pwa-192x192.png` }
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, options)
      return true
    }
    new Notification(title, options)
    return true
  } catch {
    return false
  }
}

// ---------- 行事曆 .ics ----------

const pad = (n: number) => String(n).padStart(2, '0')
const icsDate = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const icsLocal = (d: Date) => `${icsDate(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`
const icsUtc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** 產生含提醒（VALARM）的行事曆檔，加入 iPhone 行事曆後由系統負責通知 */
export function buildIcs(todo: Todo): string | null {
  const start = dueStart(todo)
  if (!start) return null
  const allDay = !todo.dueTime
  const end = new Date(start)
  if (allDay) end.setDate(end.getDate() + 1)
  else end.setMinutes(end.getMinutes() + 30)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LifeMaster//ZH-TW',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${todo.id}@lifemaster`,
    `DTSTAMP:${icsUtc(new Date())}`,
    allDay ? `DTSTART;VALUE=DATE:${icsDate(start)}` : `DTSTART:${icsLocal(start)}`,
    allDay ? `DTEND;VALUE=DATE:${icsDate(end)}` : `DTEND:${icsLocal(end)}`,
    `SUMMARY:${escape(todo.text)}`,
    `DESCRIPTION:${escape(`LifeMaster 待辦・${todo.category}・優先級${PRIORITIES[todo.priority].label}`)}`,
  ]
  const remind = reminderAt(todo)
  if (remind) {
    const minutes = Math.round((start.getTime() - remind.getTime()) / 60000)
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escape(todo.text)}`,
      minutes >= 0 ? `TRIGGER:-PT${minutes}M` : `TRIGGER:PT${-minutes}M`,
      'END:VALARM',
    )
  }
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadIcs(todo: Todo) {
  const ics = buildIcs(todo)
  if (!ics) return
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${todo.text.slice(0, 20) || 'todo'}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
