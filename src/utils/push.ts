import { ensureUser, supabase } from './cloud'

const vapidKey: string | undefined = import.meta.env.VITE_VAPID_PUBLIC_KEY
const FLAG_KEY = 'lm-push-enabled'
/** 推播登記狀態改變時發出，讓畫面與提醒同步跟著更新 */
export const PUSH_EVENT = 'lifemaster:push'

/** 這個環境有沒有機會用背景推播（iPhone 要加入主畫面後才有 PushManager） */
export const pushSupported =
  supabase !== null && !!vapidKey && typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

/** 這台裝置是否已向雲端登記推播，App 關著也能收到通知 */
export function isPushEnabled() {
  try {
    return localStorage.getItem(FLAG_KEY) === '1'
  } catch {
    return false
  }
}

function setFlag(on: boolean) {
  try {
    if (on) localStorage.setItem(FLAG_KEY, '1')
    else localStorage.removeItem(FLAG_KEY)
  } catch {
    // 忽略
  }
  window.dispatchEvent(new Event(PUSH_EVENT))
  return on
}

function toKey(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0))
}

/** 通知權限開啟後呼叫：向瀏覽器訂閱推播並把訂閱資訊存到雲端。App 每次啟動也會呼叫一次以更新訂閱。 */
export async function enablePush(): Promise<boolean> {
  if (!pushSupported || !supabase || !vapidKey || Notification.permission !== 'granted') return setFlag(false)
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg || !(await ensureUser())) return setFlag(false)
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(vapidKey) }))
    const { endpoint, keys } = sub.toJSON()
    if (!endpoint || !keys?.p256dh || !keys.auth) return setFlag(false)
    const { error } = await supabase.rpc('save_push_subscription', { p_endpoint: endpoint, p_p256dh: keys.p256dh, p_auth: keys.auth })
    return setFlag(!error)
  } catch {
    return setFlag(false)
  }
}

export interface CloudReminder {
  ref: string
  title: string
  body: string
  fire_at: string
}

/** 用裝置上尚未觸發的待辦提醒取代雲端排程 */
export async function syncReminders(items: CloudReminder[]) {
  if (!supabase || !isPushEnabled() || !(await ensureUser())) return
  await supabase.rpc('sync_reminders', { items })
}
