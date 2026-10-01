import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, Check, Plus, Repeat, SlidersHorizontal, Trash2 } from 'lucide-react'
import Confetti from './Confetti'
import Pomodoro from './Pomodoro'
import TodoCalendar from './TodoCalendar'
import type { CalendarView } from './TodoCalendar'
import TodoSheet from './TodoSheet'
import {
  DEFAULT_QUADRANT,
  DEFAULT_TAG,
  QUADRANTS,
  QUADRANT_ORDER,
  TAG_NAMES_KEY,
  TODOS_KEY,
  nextOccurrence,
  quadrantOf,
  reminderAt,
  repeatLabel,
  tagOf,
} from '../data/todos'
import type { TagNames, Todo } from '../data/todos'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { diffDays, newId, toDateKey } from '../utils/date'

type Filter = 'all' | 'today' | 'overdue' | 'done'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'today', label: '今天到期' },
  { id: 'all', label: '全部' },
  { id: 'overdue', label: '已逾期' },
  { id: 'done', label: '已完成' },
]

type TodoView = 'list' | CalendarView
const VIEWS: { id: TodoView; label: string }[] = [
  { id: 'list', label: '列表' },
  { id: 'month', label: '月' },
  { id: 'week', label: '週' },
  { id: 'days', label: '7 天' },
]

const shortDate = (key: string) => {
  const [, m, d] = key.split('-').map(Number)
  return `${m}/${d}`
}

/** 列表右側的小字：截止日（依遠近上色），完成的再多一行完成日 */
function DateInfo({ todo, today }: { todo: Todo; today: string }) {
  let due: { text: string; tone: string } | null = null
  if (todo.dueDate) {
    const days = diffDays(today, todo.dueDate)
    const time = todo.dueTime ? ` ${todo.dueTime}` : ''
    const tone = todo.done
      ? 'text-faint'
      : days < 0
        ? 'font-semibold text-rose-500'
        : days === 0
          ? 'font-semibold text-amber-600 dark:text-amber-400'
          : 'text-muted'
    const label = days === 0 ? '今天' : days === 1 ? '明天' : shortDate(todo.dueDate)
    due = { text: `${label}${time}`, tone }
  }
  if (!due && !todo.done) return null
  return (
    <div className="shrink-0 text-right text-[11px] leading-snug tabular-nums">
      {due && (
        <p className={due.tone}>
          <span className="text-faint">截止 </span>
          {due.text}
        </p>
      )}
      {todo.done && todo.completedDate && (
        <p className="text-emerald-600 dark:text-emerald-400">
          <span className="text-faint">完成 </span>
          {shortDate(todo.completedDate)}
        </p>
      )}
    </div>
  )
}

export default function Todos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [names] = useLocalStorage<TagNames>(TAG_NAMES_KEY, {})
  const [lastTag, setLastTag] = useLocalStorage('lifemaster.todoLastTag', DEFAULT_TAG)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<Filter>('today')
  const [view, setView] = useLocalStorage<TodoView>('lifemaster.todoView', 'list')
  /** 正在新增或編輯的任務；新增時 id 是空字串 */
  const [sheet, setSheet] = useState<Todo | null>(null)
  const [justDone, setJustDone] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const endCelebrate = useCallback(() => setCelebrate(false), [])
  const today = toDateKey()

  // 今日任務 = 今天新增的 + 尚未完成的 + 今天完成的
  const todayTodos = todos.filter(t => t.createdDate === today || !t.done || t.completedDate === today)
  const todayDone = todayTodos.filter(t => t.done).length
  const percent = todayTodos.length ? Math.round((todayDone / todayTodos.length) * 100) : 0
  const overdueCount = todos.filter(t => !t.done && t.dueDate && t.dueDate < today).length

  const blank = (patch: Partial<Todo> = {}): Todo => ({
    id: '',
    text: '',
    priority: DEFAULT_QUADRANT,
    category: lastTag,
    done: false,
    createdDate: today,
    dueDate: today,
    remind: 'none',
    ...patch,
  })

  const saveTodo = (todo: Todo) => {
    setLastTag(todo.category)
    if (todo.id) setTodos(prev => prev.map(t => (t.id === todo.id ? todo : t)))
    else setTodos(prev => [{ ...todo, id: newId(), createdDate: today }, ...prev])
  }

  // 快速新增：截止日預設今天，才會出現在「今天到期」
  const quickAdd = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    saveTodo(blank({ text: trimmed }))
    setText('')
  }

  const toggleTodo = (id: string) => {
    const target = todos.find(t => t.id === id)
    if (!target) return
    const completing = !target.done
    if (completing && target.repeat && target.dueDate) {
      // 重複任務：完成這一次，同時排好下一次
      const next: Todo = {
        ...target,
        id: newId(),
        done: false,
        completedDate: undefined,
        notifiedAt: undefined,
        spawnedId: undefined,
        createdDate: today,
        dueDate: nextOccurrence(target, today),
        repeatDay: target.repeat === 'monthly' ? (target.repeatDay ?? Number(target.dueDate.slice(8))) : undefined,
      }
      setTodos(prev => [next, ...prev.map(t => (t.id === id ? { ...t, done: true, completedDate: today, spawnedId: next.id } : t))])
    } else if (!completing && target.spawnedId) {
      // 取消完成：把當初自動產生、還沒動過的下一次收回
      setTodos(prev =>
        prev
          .filter(t => !(t.id === target.spawnedId && !t.done))
          .map(t => (t.id === id ? { ...t, done: false, completedDate: undefined, spawnedId: undefined } : t)),
      )
    } else setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done, completedDate: !t.done ? today : undefined } : t)))
    if (!completing) return
    setJustDone(id)
    window.setTimeout(() => setJustDone(current => (current === id ? null : current)), 900)
    // 這一項是最後一個未完成的任務 → 撒花慶祝
    if (todos.every(t => t.done || t.id === id)) setCelebrate(true)
  }

  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id))

  const visible = todos.filter(t => {
    if (filter === 'today') return !t.done && t.dueDate === today
    if (filter === 'overdue') return !t.done && !!t.dueDate && t.dueDate < today
    if (filter === 'done') return t.done
    return true
  })

  // 每個象限裡：未完成在前 → 截止日期時間
  const sortKey = (t: Todo) => `${t.dueDate ?? '9999'}${t.dueTime ?? '99:99'}`
  const sections = QUADRANT_ORDER.map(q => ({
    q,
    items: visible.filter(t => quadrantOf(t) === q).sort((a, b) => Number(a.done) - Number(b.done) || sortKey(a).localeCompare(sortKey(b))),
  })).filter(s => s.items.length > 0)

  return (
    <div className="space-y-4">
      <Pomodoro />
      <div className="rounded-2xl bg-surface p-5 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted">今日進度</p>
            <p className="text-sm text-faint">
              已完成 {todayDone} / {todayTodos.length} 項{overdueCount > 0 && <span className="ml-2 font-medium text-rose-500">・{overdueCount} 項逾期</span>}
            </p>
          </div>
          <p className="text-3xl font-bold text-primary-ink">{percent}%</p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <form onSubmit={quickAdd} className="flex gap-2 rounded-2xl bg-surface p-3 shadow-sm">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="新增今天的任務…"
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-fg outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => {
            setSheet(blank({ text: text.trim() }))
            setText('')
          }}
          className="flex items-center justify-center rounded-xl bg-surface-2 px-3 text-muted"
          aria-label="詳細設定"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
        <button
          type="submit"
          className="flex items-center justify-center rounded-xl bg-primary px-4 text-on-primary transition active:scale-95"
          aria-label="新增任務"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>

      <div className="flex rounded-xl bg-surface p-1 shadow-sm">
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 rounded-lg py-1.5 text-sm transition ${view === v.id ? 'bg-primary font-semibold text-on-primary' : 'text-muted'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view !== 'list' ? (
        <TodoCalendar todos={todos} view={view} onToggle={toggleTodo} onEdit={setSheet} onCreate={date => setSheet(blank({ dueDate: date }))} />
      ) : (
        <>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${filter === f.id ? 'bg-primary font-semibold text-on-primary' : 'bg-surface text-muted'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {sections.length === 0 ? (
            <p className="py-10 text-center text-faint">{todos.length === 0 ? '還沒有任務，新增一個吧！' : '這個分類沒有任務'}</p>
          ) : (
            sections.map(({ q, items }) => (
              <section key={q} className="space-y-2">
                <p className={`flex items-center gap-1.5 px-1 text-sm font-semibold ${QUADRANTS[q].tone}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${QUADRANTS[q].dot}`} />
                  {QUADRANTS[q].label}
                  <span className="font-normal text-faint">{items.length}</span>
                </p>
                <ul className="space-y-2">
                  {items.map(todo => {
                    const tag = tagOf(todo, names)
                    const remindAt = !todo.done ? reminderAt(todo) : null
                    return (
                      <li
                        key={todo.id}
                        className={`flex items-center gap-3 overflow-hidden rounded-2xl bg-surface py-3 pr-2 pl-0 shadow-sm ${justDone === todo.id ? 'todo-flash' : ''}`}
                      >
                        <span className="w-1 self-stretch rounded-r-full" style={{ background: tag.hex }} />
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                            todo.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line'
                          } ${justDone === todo.id ? 'todo-pop' : ''}`}
                          aria-label={todo.done ? '標記為未完成' : '標記為完成'}
                        >
                          {todo.done && <Check className="h-4 w-4" />}
                        </button>
                        <button onClick={() => setSheet(todo)} className="min-w-0 flex-1 text-left">
                          <p className={`break-words ${todo.done ? 'text-faint line-through' : 'text-fg'}`}>{todo.text}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full" style={{ background: tag.hex }} />
                              {tag.name}
                            </span>
                            {remindAt && (
                              <span className={`flex items-center gap-0.5 ${todo.notifiedAt ? 'text-faint' : 'text-primary-ink'}`}>
                                <Bell className="h-3 w-3" />
                                {remindAt.getMonth() + 1}/{remindAt.getDate()} {String(remindAt.getHours()).padStart(2, '0')}:
                                {String(remindAt.getMinutes()).padStart(2, '0')}
                              </span>
                            )}
                            {todo.repeat && !todo.done && (
                              <span className="flex items-center gap-0.5 text-faint">
                                <Repeat className="h-3 w-3" />
                                {repeatLabel(todo.repeat)}
                              </span>
                            )}
                            {todo.note && <span className="max-w-[10rem] truncate text-faint">{todo.note}</span>}
                          </p>
                        </button>
                        <DateInfo todo={todo} today={today} />
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="rounded-lg p-1.5 text-faint transition hover:bg-rose-500/10 hover:text-rose-500"
                          aria-label="刪除任務"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))
          )}
        </>
      )}

      {celebrate && <Confetti onDone={endCelebrate} />}

      {sheet && <TodoSheet todo={sheet} onSave={saveTodo} onDelete={sheet.id ? () => deleteTodo(sheet.id) : undefined} onClose={() => setSheet(null)} />}
    </div>
  )
}
