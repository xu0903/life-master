import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { ensureUser, supabase } from '../utils/cloud'
import { iosVersion, isIOS, isStandalone, storageWorks } from '../utils/env'
import { isPushEnabled, pushSupported } from '../utils/push'
import { notificationPermission } from '../utils/reminders'

interface Row {
  label: string
  value: string
  ok: boolean | null
}

/** 環境檢查：收不到通知或資料一直消失時，看這裡就知道卡在哪一步 */
export default function Diagnostics() {
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [cloud, setCloud] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    navigator.storage
      ?.persisted?.()
      .then(setPersisted)
      .catch(() => setPersisted(null))
    if (supabase) void ensureUser().then(id => setCloud(!!id))
  }, [])

  const permission = notificationPermission()
  const ios = iosVersion()
  const rows: Row[] = [
    { label: '裝置', value: ios ? `iOS ${ios}` : isIOS() ? 'iOS' : navigator.platform || '未知', ok: null },
    { label: '開啟方式', value: isStandalone() ? '主畫面 App' : '瀏覽器分頁', ok: isStandalone() || !isIOS() },
    { label: '資料儲存', value: storageWorks() ? '正常' : '無法儲存（無痕模式或封鎖 Cookie）', ok: storageWorks() },
    { label: '永久保存', value: persisted === null ? '不支援' : persisted ? '是' : '否（空間不足時可能被清除）', ok: persisted !== false },
    {
      label: '通知權限',
      value: { granted: '已允許', denied: '已拒絕', default: '尚未詢問', unsupported: '不支援（需從主畫面開啟）' }[permission],
      ok: permission === 'granted',
    },
    { label: '推播功能', value: pushSupported ? '支援' : '不支援', ok: pushSupported },
    { label: '背景推播', value: isPushEnabled() ? '已登記' : '未登記', ok: isPushEnabled() },
    { label: '雲端連線', value: !supabase ? '未設定' : cloud === null ? '檢查中…' : cloud ? '正常' : '失敗', ok: cloud },
  ]

  const copy = async () => {
    const text = ['LifeMaster 環境檢查', ...rows.map(r => `${r.label}：${r.value}`), navigator.userAgent].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // 無法存取剪貼簿時忽略
    }
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-line text-sm">
        {rows.map(r => (
          <li key={r.label} className="flex items-center justify-between gap-3 py-2">
            <span className="text-muted">{r.label}</span>
            <span className={`text-right ${r.ok === false ? 'font-medium text-rose-500' : r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg'}`}>{r.value}</span>
          </li>
        ))}
      </ul>
      <button onClick={copy} className="flex items-center gap-1.5 text-sm text-primary-ink">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? '已複製，可以貼給別人看' : '複製檢查結果'}
      </button>
    </div>
  )
}
