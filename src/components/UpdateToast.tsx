import { useEffect, useState } from 'react'
import { PartyPopper, X } from 'lucide-react'
import { APP_VERSION, CHANGELOG } from '../version'

const SEEN_KEY = 'lifemaster.seenVersion'

/** 打開 App 時發現版本變了，就跳出「已更新到 vX」與這一版的更新內容 */
export default function UpdateToast() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(SEEN_KEY)
      localStorage.setItem(SEEN_KEY, APP_VERSION)
      // 第一次安裝不用通知；加入版本號之前就在用的人（有其他資料）也要通知
      const existing = seen ?? (localStorage.getItem('lifemaster.habits') || localStorage.getItem('lifemaster.todos') ? 'old' : null)
      if (existing && existing !== APP_VERSION) setShow(true)
    } catch {
      // 讀不到儲存空間就不通知
    }
  }, [])

  if (!show) return null
  const notes = CHANGELOG[APP_VERSION] ?? []
  return (
    <div className="px-4 pt-2">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-2 p-4 text-on-primary shadow-lg">
        <div className="flex items-start gap-3">
          <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">已更新到 v{APP_VERSION}</p>
            {notes.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm opacity-95">
                {notes.map(n => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={() => setShow(false)} className="rounded-full p-1 hover:bg-black/10" aria-label="關閉">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
