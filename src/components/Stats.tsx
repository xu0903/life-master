import { useState } from 'react'
import type { PointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { habitColor, habitIcon } from '../data/habits'
import { useWordStats } from '../hooks/useDailyWords'
import { useHabits } from '../hooks/useHabits'
import { addDays, bestStreak, calcStreak, toDateKey } from '../utils/date'

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
  const mastered = wordStats.filter(s => s.box >= 3).length
  const weak = wordStats.filter(s => s.box === 0 && s.wrong > 0).length

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

      <MonthHeatmap />
      <LearningCurve />

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-surface p-3 shadow-sm">
          <p className="text-xl font-bold text-emerald-500">{mastered}</p>
          <p className="text-xs text-muted">熟練（連對 3 次）</p>
        </div>
        <div className="rounded-2xl bg-surface p-3 shadow-sm">
          <p className="text-xl font-bold text-fg">{wordStats.length - mastered - weak}</p>
          <p className="text-xs text-muted">學習中</p>
        </div>
        <div className="rounded-2xl bg-surface p-3 shadow-sm">
          <p className="text-xl font-bold text-rose-500">{weak}</p>
          <p className="text-xs text-muted">不熟</p>
        </div>
      </div>
    </div>
  )
}
