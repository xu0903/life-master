import { useState } from 'react'
import { Share2 } from 'lucide-react'
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
import { bestStreak, calcStreak, toDateKey } from '../utils/date'

const W = 1080
const H = 1350

/** 用目前主題的顏色畫一張本月學習報告圖，可以直接分享到 IG 限動或 Threads */
export default function ShareReport() {
  const [habits] = useLocalStorage<Habit[]>(HABITS_KEY, DEFAULT_HABITS)
  const [stats] = useWordStats()
  const [todos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [reading] = useLocalStorage<ReadingRecord[]>(READING_HISTORY_KEY, [])
  const [listening] = useLocalStorage<ListeningRecord[]>(LISTENING_HISTORY_KEY, [])
  const badges = useBadges()
  const [busy, setBusy] = useState(false)

  const make = async () => {
    setBusy(true)
    try {
      const now = new Date()
      const month = toDateKey().slice(0, 7)
      const tests = [...reading, ...listening].filter(r => r.date.startsWith(month))
      const total = tests.reduce((n, r) => n + r.total, 0)
      const accuracy = total ? Math.round((tests.reduce((n, r) => n + r.correct, 0) / total) * 100) : 0
      const items: [string, string][] = [
        ['本月打卡', `${habits.reduce((n, h) => n + h.completedDates.filter(d => d.startsWith(month)).length, 0)} 次`],
        ['目前連續', `${Math.max(0, ...habits.map(h => calcStreak(h.completedDates)))} 天`],
        ['最長連續', `${Math.max(0, ...habits.map(h => bestStreak(h.completedDates)))} 天`],
        ['新學單字', `${Object.values(stats).filter(s => (s.first ?? '').startsWith(month)).length} 字`],
        ['測驗題數', `${total} 題`],
        ['測驗答對率', total ? `${accuracy}%` : '—'],
        ['完成待辦', `${todos.filter(t => t.done && (t.completedDate ?? '').startsWith(month)).length} 項`],
        ['成就徽章', `${badges.filter(b => b.value >= b.goal).length} / ${badges.length}`],
      ]

      const css = getComputedStyle(document.documentElement)
      const color = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
      const primary = color('--primary', '#6366f1')
      const primary2 = color('--primary-2', '#8b5cf6')

      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, primary)
      bg.addColorStop(1, primary2)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      const font = (size: number, weight = 400) => `${weight} ${size}px -apple-system, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif`
      ctx.fillStyle = '#ffffff'
      ctx.font = font(40, 500)
      ctx.globalAlpha = 0.85
      ctx.fillText('LifeMaster 學習報告', 90, 150)
      ctx.globalAlpha = 1
      ctx.font = font(96, 700)
      ctx.fillText(`${now.getFullYear()} 年 ${now.getMonth() + 1} 月`, 90, 260)

      // 白色卡片，2 欄 4 列
      const top = 340
      const cardW = (W - 90 * 2 - 30) / 2
      const cardH = 190
      items.forEach(([label, value], i) => {
        const x = 90 + (i % 2) * (cardW + 30)
        const y = top + Math.floor(i / 2) * (cardH + 30)
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.beginPath()
        ctx.roundRect(x, y, cardW, cardH, 36)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 0.85
        ctx.font = font(36, 500)
        ctx.fillText(label, x + 40, y + 70)
        ctx.globalAlpha = 1
        ctx.font = font(72, 700)
        ctx.fillText(value, x + 40, y + 155)
      })

      ctx.globalAlpha = 0.8
      ctx.font = font(32, 500)
      ctx.fillText('習慣打卡・多益單字・閱讀聽力練習', 90, H - 110)
      ctx.fillText(`${location.host}${import.meta.env.BASE_URL}`, 90, H - 60)
      ctx.globalAlpha = 1

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return
      const file = new File([blob], `lifemaster-${month}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: '我這個月的學習紀錄' }).catch(() => {})
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 2000)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={make}
      disabled={busy}
      className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary to-primary-2 py-3 font-semibold text-on-primary shadow-lg transition active:scale-[0.98] disabled:opacity-60"
    >
      <Share2 className="h-5 w-5" /> {busy ? '產生中…' : '分享本月學習報告'}
    </button>
  )
}
