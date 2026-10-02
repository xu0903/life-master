import { supabase } from './cloud'
import { SYNC_EVENT } from '../hooks/useLocalStorage'

/**
 * 帳號同步：手機、平板登入同一個帳號時，資料以「每個項目各自比較修改時間」合併，
 * 例如手機改了待辦、平板改了習慣，同步後兩邊都會有；同一個項目兩邊都改時，以後改的為準。
 */
const PREFIX = 'lifemaster.'
const MTIME_KEY = 'lm-sync-mtime'
const LAST_SYNC_KEY = 'lm-sync-at'
export const SYNC_STATUS_EVENT = 'lifemaster:sync-status'

/** 作答中的進度、計時器這類只屬於這台裝置的暫存，不同步 */
const LOCAL_ONLY = ['lifemaster.readingSession', 'lifemaster.practice.', 'lifemaster.habitTimer']
export const isSynced = (key: string) => key.startsWith(PREFIX) && !LOCAL_ONLY.some(p => key.startsWith(p))

function readMtimes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(MTIME_KEY) ?? '{}') as Record<string, number>
  } catch {
    return {}
  }
}

/** 記下某個項目在這台裝置上的修改時間（useLocalStorage 寫入時呼叫） */
export function touch(key: string) {
  if (!isSynced(key)) return
  try {
    const m = readMtimes()
    m[key] = Date.now()
    localStorage.setItem(MTIME_KEY, JSON.stringify(m))
  } catch {
    // 忽略
  }
}

export const lastSyncAt = () => {
  try {
    return localStorage.getItem(LAST_SYNC_KEY)
  } catch {
    return null
  }
}

interface CloudData {
  app: 'LifeMaster'
  version: 1
  exportedAt: string
  data: Record<string, unknown>
  /** 每個項目的修改時間；舊版備份沒有 */
  mtime?: Record<string, number>
}

let running: Promise<boolean> | null = null

/** 跟雲端合併一次；只有登入正式帳號（非匿名）時才會執行。回傳是否成功 */
export function syncNow(): Promise<boolean> {
  running ??= (async () => {
    try {
      if (!supabase) return false
      const { data: session } = await supabase.auth.getSession()
      const user = session.session?.user
      if (!user || user.is_anonymous) return false

      const { data: row, error } = await supabase.from('backups').select('data').eq('user_id', user.id).maybeSingle()
      if (error) return false
      const cloud = (row?.data ?? null) as CloudData | null
      const local = readMtimes()
      const changed: string[] = []

      // 雲端比較新的項目寫回這台裝置
      if (cloud?.data) {
        for (const [key, value] of Object.entries(cloud.data)) {
          if (!isSynced(key)) continue
          const cloudTime = cloud.mtime?.[key] ?? 1
          if (cloudTime > (local[key] ?? 0)) {
            const text = JSON.stringify(value)
            if (localStorage.getItem(key) !== text) {
              localStorage.setItem(key, text)
              changed.push(key)
            }
            local[key] = cloudTime
          }
        }
        localStorage.setItem(MTIME_KEY, JSON.stringify(local))
      }

      // 合併後的結果上傳
      const data: Record<string, unknown> = {}
      const mtime: Record<string, number> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key || !isSynced(key)) continue
        try {
          data[key] = JSON.parse(localStorage.getItem(key) ?? 'null')
          mtime[key] = local[key] ?? 0
        } catch {
          // 略過壞掉的值
        }
      }
      const now = new Date().toISOString()
      const payload: CloudData = { app: 'LifeMaster', version: 1, exportedAt: now, data, mtime }
      const { error: upErr } = await supabase.from('backups').upsert({ user_id: user.id, data: payload, updated_at: now })
      if (upErr) return false
      localStorage.setItem(LAST_SYNC_KEY, now)

      // 讓畫面上的資料跟著更新
      for (const key of changed) window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: key }))
      window.dispatchEvent(new Event(SYNC_STATUS_EVENT))
      return true
    } catch {
      return false
    } finally {
      running = null
    }
  })()
  return running
}
