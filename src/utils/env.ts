/** 是不是從主畫面 App 開的（不是 Safari 分頁） */
export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}

/** iPhone / iPad（iPadOS 會偽裝成 Mac，用觸控點判斷） */
export function isIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/** iOS 版本，例如 "26.0"；不是 iOS 回傳 null */
export function iosVersion(): string | null {
  const m = navigator.userAgent.match(/OS (\d+)[._](\d+)/)
  return isIOS() && m ? `${m[1]}.${m[2]}` : null
}

/**
 * 實際寫一筆再讀回來，確認資料存得住。
 * 無痕瀏覽、「阻擋所有 Cookie」或儲存空間已滿時會失敗，這時 App 每次打開都會是空的。
 */
export function storageWorks(): boolean {
  try {
    const key = 'lm-storage-test'
    const value = String(Date.now())
    localStorage.setItem(key, value)
    const ok = localStorage.getItem(key) === value
    localStorage.removeItem(key)
    return ok
  } catch {
    return false
  }
}

/** 請瀏覽器不要在空間不足時自動清掉資料；回傳目前是否已是永久保存 */
export async function requestPersistentStorage(): Promise<boolean | null> {
  try {
    if (!navigator.storage?.persist) return null
    return (await navigator.storage.persisted()) || (await navigator.storage.persist())
  } catch {
    return null
  }
}
