import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { isIOS, isStandalone, requestPersistentStorage, storageWorks } from '../utils/env'

const DISMISS_KEY = 'lm-browser-hint-dismissed'

/**
 * 開啟環境有問題時的提醒：
 * 資料存不住（無痕模式、封鎖 Cookie）→ 一定要顯示；iPhone 用 Safari 分頁開 → 可以關掉。
 */
export default function EnvBanner({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [canStore] = useState(storageWorks)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    void requestPersistentStorage()
  }, [])

  if (!canStore) {
    return (
      <div className="mx-4 mt-2 flex gap-2.5 rounded-2xl bg-rose-500 p-3 text-sm text-white shadow-lg">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">這台裝置目前無法儲存資料，關掉 App 後內容會全部消失</p>
          <p className="mt-1 opacity-90">
            常見原因：在 Safari 的「無痕瀏覽」裡加入主畫面，或開了「設定 → Safari → 阻擋所有 Cookie」。請關閉後，用一般分頁重新「加入主畫面」。
          </p>
          <button onClick={onOpenSettings} className="mt-1.5 font-semibold underline">
            查看環境檢查
          </button>
        </div>
      </div>
    )
  }

  if (isIOS() && !isStandalone() && !dismissed) {
    return (
      <div className="mx-4 mt-2 flex gap-2.5 rounded-2xl bg-amber-400 p-3 text-sm text-amber-950 shadow-lg">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="flex-1">
          你正在用 Safari 分頁開啟。請點分享 →「加入主畫面」，並確認「以網頁 App 打開」是開啟的，之後從主畫面打開才收得到通知。
        </p>
        <button
          onClick={() => {
            setDismissed(true)
            try {
              sessionStorage.setItem(DISMISS_KEY, '1')
            } catch {
              // 忽略
            }
          }}
          className="self-start rounded-full p-1 hover:bg-black/10"
          aria-label="關閉提醒"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return null
}
