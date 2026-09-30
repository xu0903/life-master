import { useEffect, useState } from 'react'

/** 任何 lifemaster 資料寫入 localStorage 時發出 */
export const SYNC_EVENT = 'lifemaster:storage'

function read<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored !== null ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

/**
 * 與 useState 相同，但會自動同步到 localStorage，重新整理後資料仍在。
 * 同一個 key 在多個元件使用時會互相同步。
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => read(key, initialValue))

  useEffect(() => {
    try {
      const serialized = JSON.stringify(value)
      if (localStorage.getItem(key) === serialized) return
      localStorage.setItem(key, serialized)
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: key }))
    } catch {
      // 儲存空間已滿或被瀏覽器封鎖時忽略
    }
  }, [key, value])

  useEffect(() => {
    const onSync = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) setValue(prev => read(key, prev))
    }
    window.addEventListener(SYNC_EVENT, onSync)
    return () => window.removeEventListener(SYNC_EVENT, onSync)
  }, [key])

  return [value, setValue] as const
}
