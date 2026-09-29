import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarClock, Check, Plus, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { diffDays, fromDateKey, newId, toDateKey } from '../utils/date'

type Priority = 'high' | 'medium' | 'low'

export interface Todo {
  id: string
  text: string
  priority: Priority
  category: string
  done: boolean
  createdDate: string
  completedDate?: string
  /** 截止日 YYYY-MM-DD（選填） */
  dueDate?: string
}

export const TODOS_KEY = 'lifemaster.todos'

const PRIORITIES: Record<Priority, { label: string; badge: string; order: number }> = {
  high: { label: '高', badge: 'bg-rose-500/15 text-rose-500', order: 0 },
  medium: { label: '中', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', order: 1 },
  low: { label: '低', badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', order: 2 },
}

const CATEGORIES = ['工作', '學習', '生活', '其他']

type Filter = 'all' | 'today' | 'overdue' | 'done'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'today', label: '今天到期' },
  { id: 'overdue', label: '已逾期' },
  { id: 'done', label: '已完成' },
]

function dueLabel(dueDate: string, today: string): { text: string; tone: string } {
  const days = diffDays(today, dueDate)
  if (days < 0) return { text: `逾期 ${-days} 天`, tone: 'bg-rose-500 text-white' }
  if (days === 0) return { text: '今天到期', tone: 'bg-amber-500 text-white' }
  if (days === 1) return { text: '明天到期', tone: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' }
  const d = fromDateKey(dueDate)
  return { text: `${d.getMonth() + 1}/${d.getDate()} 到期`, tone: 'bg-surface-2 text-muted' }
}

export default function Todos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const today = toDateKey()

  // 今日任務 = 今天新增的 + 尚未完成的 + 今天完成的
  const todayTodos = todos.filter(t => t.createdDate === today || !t.done || t.completedDate === today)
  const todayDone = todayTodos.filter(t => t.done).length
  const percent = todayTodos.length ? Math.round((todayDone / todayTodos.length) * 100) : 0
  const overdueCount = todos.filter(t => !t.done && t.dueDate && t.dueDate < today).length

  const addTodo = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev => [
      { id: newId(), text: trimmed, priority, category, done: false, createdDate: today, dueDate: dueDate || undefined },
      ...prev,
    ])
    setText('')
    setDueDate('')
  }

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done, completedDate: !t.done ? today : undefined } : t)),
    )
  }

  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id))

  const visible = todos.filter(t => {
    if (filter === 'today') return !t.done && t.dueDate === today
    if (filter === 'overdue') return !t.done && !!t.dueDate && t.dueDate < today
    if (filter === 'done') return t.done
    return true
  })

  // 未完成在前 → 有截止日的依日期 → 優先級
  const sorted = [...visible].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') ||
      PRIORITIES[a.priority].order - PRIORITIES[b.priority].order,
  )

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface p-5 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted">今日進度</p>
            <p className="text-sm text-faint">
              已完成 {todayDone} / {todayTodos.length} 項
              {overdueCount > 0 && <span className="ml-2 font-medium text-rose-500">・{overdueCount} 項逾期</span>}
            </p>
          </div>
          <p className="text-3xl font-bold text-primary-ink">{percent}%</p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <form onSubmit={addTodo} className="space-y-3 rounded-2xl bg-surface p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="新增任務…"
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-fg outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-xl bg-primary px-4 text-on-primary transition active:scale-95"
            aria-label="新增任務"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">優先級</span>
          {(Object.keys(PRIORITIES) as Priority[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                priority === p ? `${PRIORITIES[p].badge} font-semibold ring-2 ring-current` : 'bg-surface-2 text-muted'
              }`}
            >
              {PRIORITIES[p].label}
            </button>
          ))}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="ml-auto rounded-lg border border-line bg-surface px-2 py-1 text-sm text-muted outline-none"
          >
            {CATEGORIES.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <CalendarClock className="h-4 w-4" /> 截止日
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={e => setDueDate(e.target.value)}
            className="rounded-lg border border-line bg-surface px-2 py-1 text-sm text-fg outline-none"
          />
          {dueDate && (
            <button type="button" onClick={() => setDueDate('')} className="text-xs text-faint underline">
              清除
            </button>
          )}
        </label>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${
              filter === f.id ? 'bg-primary font-semibold text-on-primary' : 'bg-surface text-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-faint">{todos.length === 0 ? '還沒有任務，新增一個吧！' : '這個分類沒有任務'}</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map(todo => {
            const due = todo.dueDate && !todo.done ? dueLabel(todo.dueDate, today) : null
            return (
              <li key={todo.id} className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                    todo.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line'
                  }`}
                  aria-label={todo.done ? '標記為未完成' : '標記為完成'}
                >
                  {todo.done && <Check className="h-4 w-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`break-words ${todo.done ? 'text-faint line-through' : 'text-fg'}`}>{todo.text}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-xs ${PRIORITIES[todo.priority].badge}`}>
                      {PRIORITIES[todo.priority].label}
                    </span>
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted">{todo.category}</span>
                    {due && <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${due.tone}`}>{due.text}</span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="rounded-lg p-2 text-faint transition hover:bg-rose-500/10 hover:text-rose-500"
                  aria-label="刪除任務"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
