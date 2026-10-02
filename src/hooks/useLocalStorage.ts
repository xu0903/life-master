import { useEffect, useRef, useState } from 'react'
import { touch } from '../utils/sync'

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
  // 掛載時讀到的值在被改過之前不寫回去，否則可能是預設值或過時的值，會蓋掉別的元件剛存的資料。
  // 一旦改過就照常寫入，包括改回原本的值（例如計時器從 null → 開始 → 又變回 null）。
  const initial = useRef(value)
  const changed = useRef(false)

  useEffect(() => {
    if (!changed.current) {
      if (value === initial.current) return
      changed.current = true
    }
    try {
      const serialized = JSON.stringify(value)
      if (localStorage.getItem(key) === serialized) return
      localStorage.setItem(key, serialized)
      // 記下修改時間，帳號同步時用來判斷哪一邊比較新
      touch(key)
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
