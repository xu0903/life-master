import { useState } from 'react'
import { Bell, Check, ChevronLeft, ChevronRight, Plus, Repeat } from 'lucide-react'
import { QUADRANTS, TAG_NAMES_KEY, quadrantOf, tagOf, upcomingDates } from '../data/todos'
import type { TagNames, Todo } from '../data/todos'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { addDaysKey, fromDateKey, toDateKey } from '../utils/date'

/** 月曆 / 週曆（週一到週日）/ 七天（從今天往後連續 7 天，週末也看得到下週） */
export type CalendarView = 'month' | 'week' | 'days'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const HEADER = ['一', '二', '三', '四', '五', '六', '日']

const mondayOf = (key: string) => addDaysKey(key, -((fromDateKey(key).getDay() + 6) % 7))
const monthStart = (key: string) => `${key.slice(0, 8)}01`
function addMonths(key: string, n: number): string {
  const d = fromDateKey(monthStart(key))
  d.setMonth(d.getMonth() + n)
  return toDateKey(d)
}
const dayLabel = (key: string) => {
  const d = fromDateKey(key)
  return `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`
}

/** ISO 週數（週一開始） */
function isoWeek(key: string): number {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const firstThursday = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7)
}

const sortTodos = (a: Todo, b: Todo) =>
  Number(a.done) - Number(b.done) || (a.dueTime ?? '00').localeCompare(b.dueTime ?? '00') || quadrantOf(a).localeCompare(quadrantOf(b))

/** 點某一天跳出來的清單，仿行事曆 App 的日檢視 */
function DaySheet({
  date,
  items,
  names,
  onToggle,
  onEdit,
  onCreate,
  onClose,
  original,
}: {
  date: string
  items: Todo[]
  names: TagNames
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onCreate: () => void
  onClose: () => void
  original: (id: string) => Todo | undefined
}) {
  const d = fromDateKey(date)
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[75dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface px-5 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-xl font-bold text-fg">
              {d.getMonth() + 1}月{d.getDate()}日 星期{WEEKDAYS[d.getDay()]}
            </p>
            <p className="text-sm text-faint">
              第 {isoWeek(date)} 週{date === toDateKey() && '・今天'}
            </p>
          </div>
          <button onClick={onCreate} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow" aria-label="新增任務">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <button onClick={onCreate} className="mt-6 w-full rounded-2xl border-2 border-dashed border-line py-8 text-sm text-faint">
            這天還沒有任務，點這裡新增
          </button>
        ) : (
          <ul className="mt-4 space-y-1">
            {items.map(t => {
              const tag = tagOf(t, names)
              return (
                <li key={t.id} className="flex items-center gap-3 py-2">
                  <span className="w-10 shrink-0 text-right text-xs text-muted tabular-nums">{t.dueTime ?? '全天'}</span>
                  <span className="w-1 self-stretch rounded-full" style={{ background: tag.hex }} />
                  <button onClick={() => onEdit(t.ghostOf ? (original(t.ghostOf) ?? t) : t)} className="min-w-0 flex-1 text-left">
                    <p className={`truncate font-semibold ${t.done ? 'text-faint line-through' : 'text-fg'}`}>
                      {t.text}
                      {t.remind && t.remind !== 'none' && !t.done && <Bell className="ml-1 inline h-3.5 w-3.5 text-faint" />}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-faint">
                      {tag.name}
                      <span className={`h-1.5 w-1.5 rounded-full ${QUADRANTS[quadrantOf(t)].dot}`} />
                      {QUADRANTS[quadrantOf(t)].label}
                    </p>
                  </button>
                  {t.ghostOf ? (
                    // 未來的重複日期只是預覽，要等前一次完成才會真的產生
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center text-faint" title="重複任務">
                      <Repeat className="h-4 w-4" />
                    </span>
                  ) : (
                    <button
                      onClick={() => onToggle(t.id)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line'}`}
                      aria-label={t.done ? '標記為未完成' : '標記為完成'}
                    >
                      {t.done && <Check className="h-4 w-4" />}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function TodoCalendar({
  todos,
  view,
  onToggle,
  onEdit,
  onCreate,
}: {
  todos: Todo[]
  view: CalendarView
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onCreate: (dueDate: string) => void
}) {
  const today = toDateKey()
  const [names] = useLocalStorage<TagNames>(TAG_NAMES_KEY, {})
  const [anchor, setAnchor] = useState(today)
  const [opened, setOpened] = useState<string | null>(null)

  // 目前畫面顯示的日期
  const start = view === 'month' ? mondayOf(monthStart(anchor)) : view === 'week' ? mondayOf(anchor) : anchor
  const count =
    view === 'month'
      ? (() => {
          // 月曆補滿到該月最後一週
          const last = addDaysKey(addMonths(anchor, 1), -1)
          return Math.round((fromDateKey(mondayOf(last)).getTime() - fromDateKey(start).getTime()) / 86400000) + 7
        })()
      : 7
  const keys = Array.from({ length: count }, (_, i) => addDaysKey(start, i))

  const byDate = new Map<string, Todo[]>()
  const put = (key: string, t: Todo) => byDate.set(key, [...(byDate.get(key) ?? []), t])
  for (const t of todos) {
    if (!t.dueDate) continue
    put(t.dueDate, t)
    // 重複任務在未來日期顯示預覽
    for (const date of upcomingDates(t, keys[0], keys[keys.length - 1])) put(date, { ...t, id: `${t.id}@${date}`, dueDate: date, ghostOf: t.id })
  }
  const dayTodos = (key: string) => (byDate.get(key) ?? []).sort(sortTodos)
  const undated = todos.filter(t => !t.dueDate && !t.done).length

  const shift = (n: number) => setAnchor(a => (view === 'month' ? addMonths(a, n) : addDaysKey(a, n * 7)))
  const title =
    view === 'month' ? `${fromDateKey(anchor).getFullYear()} 年 ${fromDateKey(anchor).getMonth() + 1} 月` : `${dayLabel(keys[0])} – ${dayLabel(keys[6])}`

  const chip = (t: Todo, size: 'sm' | 'md') => {
    const tag = tagOf(t, names)
    return (
      <span
        key={t.id}
        className={`block truncate rounded border-l-2 ${size === 'sm' ? 'px-0.5 text-[10px] leading-tight' : 'px-2 py-1 text-sm'} ${t.done ? 'text-faint line-through' : 'text-fg'} ${t.ghostOf ? 'border-dashed opacity-60' : ''}`}
        style={{ background: `${tag.hex}${t.done || t.ghostOf ? '14' : '2e'}`, borderColor: tag.hex }}
      >
        {size === 'md' && t.dueTime && <span className="mr-1 font-semibold tabular-nums">{t.dueTime}</span>}
        {t.text}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-2xl bg-surface p-2 shadow-sm">
        <button onClick={() => shift(-1)} className="rounded-full p-2 text-muted hover:bg-surface-2" aria-label="上一頁">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="flex-1 text-center text-sm font-semibold text-fg tabular-nums">{title}</p>
        <button onClick={() => setAnchor(today)} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">
          今天
        </button>
        <button onClick={() => shift(1)} className="rounded-full p-2 text-muted hover:bg-surface-2" aria-label="下一頁">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {view === 'month' ? (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
          <div className="grid grid-cols-7 border-b border-line text-center text-[11px] text-faint">
            {HEADER.map((h, i) => (
              <span key={h} className={`py-1 ${i >= 5 ? 'text-rose-400' : ''}`}>
                {h}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {keys.map(key => {
              const items = dayTodos(key)
              const inMonth = key.slice(0, 7) === anchor.slice(0, 7)
              return (
                <button
                  key={key}
                  onClick={() => setOpened(key)}
                  className={`flex min-h-[4.75rem] min-w-0 flex-col gap-0.5 border-r border-b border-line p-0.5 text-left active:bg-surface-2 ${inMonth ? '' : 'opacity-40'}`}
                >
                  <span
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[11px] tabular-nums ${
                      key === today ? 'bg-primary font-bold text-on-primary' : 'text-muted'
                    }`}
                  >
                    {fromDateKey(key).getDate()}
                  </span>
                  {items.slice(0, 3).map(t => chip(t, 'sm'))}
                  {items.length > 3 && <span className="px-0.5 text-[10px] text-faint">+{items.length - 3}</span>}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-sm">
          {keys.map(key => {
            const items = dayTodos(key)
            const d = fromDateKey(key)
            const weekend = d.getDay() === 0 || d.getDay() === 6
            return (
              <button key={key} onClick={() => setOpened(key)} className="flex w-full gap-3 p-3 text-left active:bg-surface-2">
                <div className="w-11 shrink-0 text-center">
                  <p className={`text-xs ${weekend ? 'text-rose-400' : 'text-faint'}`}>週{WEEKDAYS[d.getDay()]}</p>
                  <p
                    className={`mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold tabular-nums ${
                      key === today ? 'bg-primary text-on-primary' : 'text-fg'
                    }`}
                  >
                    {d.getDate()}
                  </p>
                </div>
                <div className="min-w-0 flex-1 space-y-1 py-0.5">
                  {items.length === 0 ? <p className="pt-2 text-sm text-faint">—</p> : items.map(t => chip(t, 'md'))}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <p className="px-1 text-xs text-faint">
        點日期可以看當天的任務、新增任務
        {undated > 0 && `・另有 ${undated} 項沒有截止日的任務只會出現在「列表」`}
      </p>

      {opened && (
        <DaySheet
          date={opened}
          items={dayTodos(opened)}
          names={names}
          onToggle={onToggle}
          onEdit={onEdit}
          onCreate={() => onCreate(opened)}
          onClose={() => setOpened(null)}
          original={id => todos.find(t => t.id === id)}
        />
      )}
    </div>
  )
}
