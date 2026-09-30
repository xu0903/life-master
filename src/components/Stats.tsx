import { useState } from 'react'
import type { PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import { habitColor, habitIcon } from '../data/habits'
import { LISTENING_HISTORY_KEY } from '../data/listening'
import type { ListeningRecord } from '../data/listening'
import { READING_HISTORY_KEY } from '../data/reading'
import type { ReadingRecord } from '../data/reading'
import { TODOS_KEY } from '../data/todos'
import type { Todo } from '../data/todos'
import { masteryOf } from '../data/toeicWords'
import { useWordStats } from '../hooks/useDailyWords'
import { useHabits } from '../hooks/useHabits'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { addDays, bestStreak, calcStreak, toDateKey, weekKeys } from '../utils/date'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
// 熱力圖 5 階：同一個主色，用透明度表示完成比例
const HEAT_STEPS = ['bg-surface-2', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary']

function StatTile({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-fg">
        {value}
        <span className="ml-1 text-sm font-medium text-muted">{unit}</span>
      </p>
    </div>
  )
}

/** 本週回顧：這週（週一起）和上週的比較 */
function WeeklyReview() {
  const { habits } = useHabits()
  const [stats] = useWordStats()
  const [todos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [reading] = useLocalStorage<ReadingRecord[]>(READING_HISTORY_KEY, [])
  const [listening] = useLocalStorage<ListeningRecord[]>(LISTENING_HISTORY_KEY, [])

  const measure = (keys: string[]) => {
    const week = new Set(keys)
    const tests = [...reading, ...listening].filter(r => week.has(r.date))
    const total = tests.reduce((n, r) => n + r.total, 0)
    return {
      checkins: habits.reduce((n, h) => n + h.completedDates.filter(d => week.has(d)).length, 0),
      words: Object.values(stats).filter(s => week.has(s.first ?? '')).length,
      todos: todos.filter(t => t.done && week.has(t.completedDate ?? '')).length,
      questions: total,
      accuracy: total ? Math.round((tests.reduce((n, r) => n + r.correct, 0) / total) * 100) : null,
    }
  }
  const now = measure(weekKeys())
  const last = measure(weekKeys(addDays(new Date(), -7)))

  const rows: { label: string; value: string; delta: number | null }[] = [
    { label: '習慣打卡', value: `${now.checkins} 次`, delta: now.checkins - last.checkins },
    { label: '新學單字', value: `${now.words} 字`, delta: now.words - last.words },
    { label: '完成待辦', value: `${now.todos} 項`, delta: now.todos - last.todos },
    { label: '測驗題數', value: `${now.questions} 題`, delta: now.questions - last.questions },
    {
      label: '測驗答對率',
      value: now.accuracy === null ? '—' : `${now.accuracy}%`,
      delta: now.accuracy !== null && last.accuracy !== null ? now.accuracy - last.accuracy : null,
    },
  ]

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <p className="font-semibold text-fg">本週回顧</p>
      <p className="mb-2 text-xs text-faint">週一到今天，和上週整週比較</p>
      <ul className="divide-y divide-line">
        {rows.map(r => (
          <li key={r.label} className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted">{r.label}</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-fg tabular-nums">{r.value}</span>
              {r.delta !== null && r.delta !== 0 && (
                <span className={`flex w-12 items-center justify-end gap-0.5 text-xs tabular-nums ${r.delta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {r.delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {Math.abs(r.delta)}
                </span>
              )}
              {(r.delta === null || r.delta === 0) && <span className="w-12 text-right text-xs text-faint">—</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MonthHeatmap() {
  const { habits } = useHabits()
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const today = toDateKey()

  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array<null>(first.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateKey(new Date(first.getFullYear(), first.getMonth(), i + 1))),
  ]

  const doneOn = (key: string) => habits.filter(h => h.completedDates.includes(key))
  const step = (key: string) => {
    if (!habits.length) return 0
    const ratio = doneOn(key).length / habits.length
    return ratio === 0 ? 0 : Math.max(1, Math.ceil(ratio * 4))
  }

  const monthPrefix = toDateKey(first).slice(0, 7)
  const elapsed = offset === 0 ? now.getDate() : offset < 0 ? daysInMonth : 0
  const selectedDone = selected ? doneOn(selected) : []

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold text-fg">
          {first.getFullYear()} 年 {first.getMonth() + 1} 月打卡
        </p>
        <div className="flex gap-1">
          <button onClick={() => setOffset(o => o - 1)} className="rounded-lg p-1.5 text-muted hover:bg-surface-2" aria-label="上個月">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setOffset(o => Math.min(0, o + 1))}
            disabled={offset === 0}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 disabled:opacity-30"
            aria-label="下個月"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map(d => (
          <span key={d} className="text-xs text-faint">
            {d}
          </span>
        ))}
        {cells.map((key, i) =>
          key ? (
            <button
              key={key}
              onClick={() => setSelected(key === selected ? null : key)}
              title={`${key}：完成 ${doneOn(key).length} / ${habits.length}`}
              disabled={key > today}
              className={`aspect-square rounded-lg text-xs transition ${HEAT_STEPS[step(key)]} ${
                step(key) >= 3 ? 'text-on-primary' : 'text-muted'
              } ${key === selected ? 'ring-2 ring-fg' : key === today ? 'ring-2 ring-primary/60' : ''} disabled:opacity-40`}
            >
              {Number(key.slice(8))}
            </button>
          ) : (
            <span key={`empty-${i}`} />
          ),
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-faint">
        少
        {HEAT_STEPS.map(c => (
          <span key={c} className={`h-3 w-3 rounded ${c}`} />
        ))}
        多
      </div>

      {selected && (
        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
          <p className="font-medium text-fg">
            {selected}：完成 {selectedDone.length} / {habits.length}
          </p>
          <p className="mt-1 text-muted">{selectedDone.length ? selectedDone.map(h => h.name).join('、') : '這天沒有打卡'}</p>
        </div>
      )}

      {elapsed > 0 && (
        <div className="mt-4 space-y-2.5">
          <p className="text-sm font-semibold text-fg">本月完成率</p>
          {habits.map(h => {
            const count = h.completedDates.filter(d => d.startsWith(monthPrefix)).length
            const pct = Math.round((count / elapsed) * 100)
            const Icon = habitIcon(h)
            return (
              <div key={h.id} className="flex items-center gap-2 text-sm">
                <Icon className={`h-4 w-4 shrink-0 ${habitColor(h).chip.split(' ')[1]}`} />
                <span className="w-16 shrink-0 truncate text-muted">{h.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className={`h-full rounded-full ${habitColor(h).dot}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-muted">
                  {count}/{elapsed} 天
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LearningCurve() {
  const [stats] = useWordStats()
  const [hover, setHover] = useState<number | null>(null)

  // 最近 30 天累積學過的單字數
  const days = Array.from({ length: 30 }, (_, i) => toDateKey(addDays(new Date(), i - 29)))
  const firsts = Object.values(stats).map(s => s.first ?? s.due)
  const points = days.map(d => ({ date: d, total: firsts.filter(f => f <= d).length }))
  const max = Math.max(10, ...points.map(p => p.total))

  const W = 320
  const H = 140
  const PAD = { l: 28, r: 8, t: 10, b: 20 }
  const x = (i: number) => PAD.l + (i / (points.length - 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.total)}`).join(' ')
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const i = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (points.length - 1))
    setHover(Math.max(0, Math.min(points.length - 1, i)))
  }

  const hp = hover !== null ? points[hover] : points[points.length - 1]

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-semibold text-fg">單字學習曲線</p>
        <p className="text-xs text-muted">
          {hp.date.slice(5).replace('-', '/')}・累積 <span className="font-bold text-fg">{hp.total}</span> 字
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`最近 30 天累積學習 ${points[points.length - 1].total} 個單字`}
      >
        {[0, 0.5, 1].map(t => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(max * t)} y2={y(max * t)} className="stroke-line" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(max * t) + 3} textAnchor="end" className="fill-faint text-[9px]">
              {Math.round(max * t)}
            </text>
          </g>
        ))}
        <text x={PAD.l} y={H - 4} className="fill-faint text-[9px]">
          {points[0].date.slice(5).replace('-', '/')}
        </text>
        <text x={W - PAD.r} y={H - 4} textAnchor="end" className="fill-faint text-[9px]">
          今天
        </text>
        <path d={area} className="fill-primary/15" />
        <path d={line} fill="none" className="stroke-primary" strokeWidth={2} strokeLinejoin="round" />
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} className="stroke-faint" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(hp.total)} r={4.5} className="fill-primary stroke-surface" strokeWidth={2} />
          </>
        )}
      </svg>
    </div>
  )
}

export default function Stats() {
  const { habits } = useHabits()
  const [stats] = useWordStats()
  const today = toDateKey()
  const monthPrefix = today.slice(0, 7)

  const wordStats = Object.values(stats)
  const count = (tone: string) => wordStats.filter(s => masteryOf(s).tone === tone).length
  const tiers = [
    { label: '不熟', count: count('red'), bar: 'bg-rose-500' },
    { label: '學習中', count: count('yellow'), bar: 'bg-amber-400' },
    { label: '熟悉', count: count('green'), bar: 'bg-emerald-500' },
    { label: '精通', count: count('blue'), bar: 'bg-sky-500' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="🔥 目前最長連續" value={Math.max(0, ...habits.map(h => calcStreak(h.completedDates)))} unit="天" />
        <StatTile label="🏆 歷史最佳連續" value={Math.max(0, ...habits.map(h => bestStreak(h.completedDates)))} unit="天" />
        <StatTile
          label="✅ 本月打卡次數"
          value={habits.reduce((n, h) => n + h.completedDates.filter(d => d.startsWith(monthPrefix)).length, 0)}
          unit="次"
        />
        <StatTile label="📚 學過的單字" value={wordStats.length} unit="字" />
      </div>

      <WeeklyReview />
      <MonthHeatmap />
      <LearningCurve />

      <div className="rounded-2xl bg-surface p-4 shadow-sm">
        <p className="mb-3 font-semibold text-fg">單字熟練度</p>
        {/* 四段堆疊條：紅 不熟 → 藍 精通，段與段之間留 2px 間隔 */}
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-surface-2">
          {tiers.map(t =>
            t.count ? <div key={t.label} className={`h-full ${t.bar}`} style={{ flexGrow: t.count }} title={`${t.label} ${t.count}`} /> : null,
          )}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {tiers.map(t => (
            <div key={t.label}>
              <p className="text-xl font-bold text-fg">{t.count}</p>
              <p className="flex items-center justify-center gap-1 text-xs text-muted">
                <span className={`h-2 w-2 rounded-full ${t.bar}`} />
                {t.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
