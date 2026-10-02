import { useState } from 'react'
import { Share2 } from 'lucide-react'
import ShareSheet from './ShareSheet'
import { DEFAULT_HABITS, HABITS_KEY } from '../data/habits'
import type { Habit } from '../data/habits'
import { LISTENING_HISTORY_KEY } from '../data/listening'
import type { ListeningRecord } from '../data/listening'
import { READING_HISTORY_KEY } from '../data/reading'
import type { ReadingRecord } from '../data/reading'
import { TODOS_KEY } from '../data/todos'
import type { Todo } from '../data/todos'
import { useBadges } from '../hooks/useBadges'
import { useWordStats } from '../hooks/useDailyWords'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { calcStreak, toDateKey } from '../utils/date'
import { drawReport } from '../utils/shareImage'

/** 用目前主題的顏色畫一張本月學習報告圖（IG 限動尺寸），先預覽再分享 */
export default function ShareReport() {
  const [habits] = useLocalStorage<Habit[]>(HABITS_KEY, DEFAULT_HABITS)
  const [stats] = useWordStats()
  const [todos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [reading] = useLocalStorage<ReadingRecord[]>(READING_HISTORY_KEY, [])
  const [listening] = useLocalStorage<ListeningRecord[]>(LISTENING_HISTORY_KEY, [])
  const badges = useBadges()
  const [busy, setBusy] = useState(false)
  const [image, setImage] = useState<Blob | null>(null)
  const month = toDateKey().slice(0, 7)

  const make = async () => {
    setBusy(true)
    try {
      const now = new Date()
      const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const tests = [...reading, ...listening].filter(r => r.date.startsWith(month))
      const total = tests.reduce((n, r) => n + r.total, 0)
      const accuracy = total ? Math.round((tests.reduce((n, r) => n + r.correct, 0) / total) * 100) : 0
      const daily = Array.from({ length: days }, (_, i) => {
        const key = `${month}-${String(i + 1).padStart(2, '0')}`
        return habits.length ? habits.filter(h => h.completedDates.includes(key)).length / habits.length : 0
      })
      setImage(
        await drawReport({
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          daily,
          streak: Math.max(0, ...habits.map(h => calcStreak(h.completedDates))),
          checkins: habits.reduce((n, h) => n + h.completedDates.filter(d => d.startsWith(month)).length, 0),
          stats: [
            { emoji: '📚', label: '新學單字', value: `${Object.values(stats).filter(s => (s.first ?? '').startsWith(month)).length} 字` },
            { emoji: '✏️', label: '測驗題數', value: `${total} 題` },
            { emoji: '🎯', label: '答對率', value: total ? `${accuracy}%` : '—' },
            { emoji: '✅', label: '完成待辦', value: `${todos.filter(t => t.done && (t.completedDate ?? '').startsWith(month)).length} 項` },
          ],
          badges: badges.filter(b => b.value >= b.goal).map(b => b.emoji),
          badgeTotal: badges.length,
        }),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={make}
        disabled={busy}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary to-primary-2 py-3 font-semibold text-on-primary shadow-lg transition active:scale-[0.98] disabled:opacity-60"
      >
        <Share2 className="h-5 w-5" /> {busy ? '產生中…' : '分享本月學習報告'}
      </button>
      {image && <ShareSheet blob={image} filename={`lifemaster-${month}.png`} message="我這個月的學習紀錄" onClose={() => setImage(null)} />}
    </>
  )
}
