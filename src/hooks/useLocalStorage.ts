import { useEffect, useState } from 'react'

/** 與 useState 相同，但會自動同步到 localStorage，重新整理後資料仍在。 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 儲存空間已滿或被瀏覽器封鎖時忽略
    }
  }, [key, value])

  return [value, setValue] as const
}
