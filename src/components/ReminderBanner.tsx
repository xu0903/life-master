import { BellRing, X } from 'lucide-react'
import { formatDue } from '../data/todos'
import { useReminders } from '../hooks/useReminders'

/** App 內的提醒橫幅：沒開通知權限時也看得到到期提醒 */
export default function ReminderBanner({ onOpen }: { onOpen: () => void }) {
  const { alerts, dismiss } = useReminders()
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2 px-4 pt-2">
      {alerts.map(t => (
        <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-amber-400 p-3 text-amber-950 shadow-lg">
          <BellRing className="h-5 w-5 shrink-0" />
          <button onClick={onOpen} className="min-w-0 flex-1 text-left">
            <p className="truncate font-semibold">{t.text}</p>
            <p className="text-xs opacity-80">{formatDue(t)} 到期</p>
          </button>
          <button onClick={() => dismiss(t.id)} className="rounded-full p-1 hover:bg-black/10" aria-label="關閉提醒">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
