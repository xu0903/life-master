import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { PRIORITIES } from '../data/todos'
import type { Todo } from '../data/todos'
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

const sortTodos = (a: Todo, b: Todo) =>
  Number(a.done) - Number(b.done) || (a.dueTime ?? '99').localeCompare(b.dueTime ?? '99') || PRIORITIES[a.priority].order - PRIORITIES[b.priority].order

const CHIP: Record<Todo['priority'], string> = {
  high: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  medium: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  low: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
}

/** 一個任務列：勾選完成、點文字編輯 */
function TodoRow({ todo, onToggle, onEdit }: { todo: Todo; onToggle: () => void; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${todo.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line'}`}
        aria-label={todo.done ? '標記為未完成' : '標記為完成'}
      >
        {todo.done && <Check className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={onEdit}
        className={`min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-sm ${todo.done ? 'text-faint line-through' : CHIP[todo.priority]}`}
      >
        {todo.dueTime && <span className="mr-1 font-semibold tabular-nums">{todo.dueTime}</span>}
        {todo.text}
      </button>
    </div>
  )
}

export default function TodoCalendar({
  todos,
  view,
  onToggle,
  onEdit,
  onAdd,
}: {
  todos: Todo[]
  view: CalendarView
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onAdd: (text: string, dueDate: string) => void
}) {
  const today = toDateKey()
  const [anchor, setAnchor] = useState(today)
  const [selected, setSelected] = useState(today)
  const [text, setText] = useState('')

  const byDate = new Map<string, Todo[]>()
  for (const t of todos) {
    if (!t.dueDate) continue
    byDate.set(t.dueDate, [...(byDate.get(t.dueDate) ?? []), t])
  }
  const dayTodos = (key: string) => (byDate.get(key) ?? []).sort(sortTodos)
  const undated = todos.filter(t => !t.dueDate && !t.done).length

  // 目前畫面顯示的日期
  const start = view === 'month' ? mondayOf(monthStart(anchor)) : view === 'week' ? mondayOf(anchor) : anchor
  const count =
    view === 'month'
      ? (() => {
          // 月曆補滿到該月最後一週
          const first = monthStart(anchor)
          const last = addDaysKey(addMonths(first, 1), -1)
          return Math.round((fromDateKey(mondayOf(last)).getTime() - fromDateKey(start).getTime()) / 86400000) + 7
        })()
      : 7
  const keys = Array.from({ length: count }, (_, i) => addDaysKey(start, i))

  const shift = (n: number) => setAnchor(a => (view === 'month' ? addMonths(a, n) : addDaysKey(a, n * 7)))
  const title =
    view === 'month' ? `${fromDateKey(anchor).getFullYear()} 年 ${fromDateKey(anchor).getMonth() + 1} 月` : `${dayLabel(keys[0])} – ${dayLabel(keys[6])}`

  const add = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed, selected)
    setText('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-2xl bg-surface p-2 shadow-sm">
        <button onClick={() => shift(-1)} className="rounded-full p-2 text-muted hover:bg-surface-2" aria-label="上一頁">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="flex-1 text-center text-sm font-semibold text-fg tabular-nums">{title}</p>
        <button
          onClick={() => {
            setAnchor(today)
            setSelected(today)
          }}
          className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted"
        >
          今天
        </button>
        <button onClick={() => shift(1)} className="rounded-full p-2 text-muted hover:bg-surface-2" aria-label="下一頁">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={add} className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`新增到 ${dayLabel(selected)}…`}
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-base text-fg outline-none placeholder:text-faint focus:border-primary"
        />
        <button type="submit" className="flex items-center rounded-xl bg-primary px-3 text-on-primary" aria-label="新增">
          <Plus className="h-5 w-5" />
        </button>
      </form>

      {view === 'month' ? (
        <>
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
                const isToday = key === today
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={`flex min-h-[4.5rem] min-w-0 flex-col gap-0.5 border-b border-r border-line p-0.5 text-left ${
                      selected === key ? 'bg-primary-soft' : ''
                    } ${inMonth ? '' : 'opacity-40'}`}
                  >
                    <span
                      className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[11px] tabular-nums ${
                        isToday ? 'bg-primary font-bold text-on-primary' : 'text-muted'
                      }`}
                    >
                      {fromDateKey(key).getDate()}
                    </span>
                    {items.slice(0, 3).map(t => (
                      <span key={t.id} className={`truncate rounded px-0.5 text-[10px] leading-tight ${t.done ? 'text-faint line-through' : CHIP[t.priority]}`}>
                        {t.text}
                      </span>
                    ))}
                    {items.length > 3 && <span className="px-0.5 text-[10px] text-faint">+{items.length - 3}</span>}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-2 rounded-2xl bg-surface p-4 shadow-sm">
            <p className="text-sm font-semibold text-fg">{dayLabel(selected)}</p>
            {dayTodos(selected).length === 0 ? (
              <p className="text-sm text-faint">這天沒有任務</p>
            ) : (
              dayTodos(selected).map(t => <TodoRow key={t.id} todo={t} onToggle={() => onToggle(t.id)} onEdit={() => onEdit(t)} />)
            )}
          </div>
        </>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-sm">
          {keys.map(key => {
            const items = dayTodos(key)
            const d = fromDateKey(key)
            const weekend = d.getDay() === 0 || d.getDay() === 6
            return (
              <div key={key} onClick={() => setSelected(key)} className={`flex gap-3 p-3 ${selected === key ? 'bg-primary-soft' : ''}`}>
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
                <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
                  {items.length === 0 ? (
                    <p className="pt-2 text-sm text-faint">—</p>
                  ) : (
                    items.map(t => <TodoRow key={t.id} todo={t} onToggle={() => onToggle(t.id)} onEdit={() => onEdit(t)} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {undated > 0 && <p className="px-1 text-xs text-faint">另有 {undated} 項沒有截止日的任務，只會出現在「列表」</p>}
    </div>
  )
}
