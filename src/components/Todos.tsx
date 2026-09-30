import { useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, BellOff, CalendarClock, CalendarPlus, Check, ChevronDown, Clock, Plus, Trash2, X } from 'lucide-react'
import Pomodoro from './Pomodoro'
import { CATEGORIES, DEFAULT_REMIND, PRIORITIES, REMIND_OPTIONS, TODOS_KEY, formatDue, reminderAt } from '../data/todos'
import type { Priority, RemindOption, Todo } from '../data/todos'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { diffDays, newId, toDateKey } from '../utils/date'
import { downloadIcs, notificationPermission, requestNotificationPermission } from '../utils/reminders'

type Filter = 'all' | 'today' | 'overdue' | 'done'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'today', label: '今天到期' },
  { id: 'overdue', label: '已逾期' },
  { id: 'done', label: '已完成' },
]

const inputBase = 'rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-fg outline-none focus:border-primary'

function dueLabel(todo: Todo, today: string): { text: string; tone: string } {
  const days = diffDays(today, todo.dueDate!)
  const time = todo.dueTime ? ` ${todo.dueTime}` : ''
  if (days < 0) return { text: `逾期 ${-days} 天`, tone: 'bg-rose-500 text-white' }
  if (days === 0) return { text: `今天${time}`, tone: 'bg-amber-500 text-white' }
  if (days === 1) return { text: `明天${time}`, tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' }
  return { text: formatDue(todo), tone: 'bg-surface-2 text-muted' }
}

function remindLabel(todo: Todo): string | null {
  const at = reminderAt(todo)
  if (!at) return null
  return `${at.getMonth() + 1}/${at.getDate()} ${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')} 提醒`
}

/** 截止日、時間、提醒三個欄位，新增與編輯共用 */
function DueFields({
  dueDate,
  dueTime,
  remind,
  onChange,
  minDate,
}: {
  dueDate: string
  dueTime: string
  remind: RemindOption
  onChange: (patch: { dueDate?: string; dueTime?: string; remind?: RemindOption }) => void
  minDate?: string
}) {
  const options = REMIND_OPTIONS.filter(o => !o.needsTime || dueTime)
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <CalendarClock className="h-4 w-4" />
        <input type="date" value={dueDate} min={minDate} onChange={e => onChange({ dueDate: e.target.value })} className={inputBase} />
        {dueDate && (
          <>
            <Clock className="h-4 w-4" />
            <input
              type="time"
              value={dueTime}
              onChange={e => {
                const t = e.target.value
                // 清掉時間時，需要時間的提醒改回預設
                const needsTime = REMIND_OPTIONS.find(o => o.value === remind)?.needsTime
                onChange(!t && needsTime ? { dueTime: t, remind: DEFAULT_REMIND } : { dueTime: t })
              }}
              className={inputBase}
            />
            <button type="button" onClick={() => onChange({ dueDate: '', dueTime: '' })} className="text-xs text-faint underline">
              清除
            </button>
          </>
        )}
      </div>
      {dueDate && (
        <label className="flex items-center gap-2 text-sm text-muted">
          {remind === 'none' ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          <select value={remind} onChange={e => onChange({ remind: e.target.value as RemindOption })} className={inputBase}>
            {options.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {!dueTime && <span className="text-xs text-faint">填時間可選更多</span>}
        </label>
      )}
    </div>
  )
}

function NotifyPrompt() {
  const [permission, setPermission] = useState(notificationPermission())
  if (permission === 'granted') return null
  return (
    <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
      <Bell className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        {permission === 'unsupported' ? (
          <>iPhone 需要先把 App「加入主畫面」並從主畫面打開，才能收到通知。也可以用「加到行事曆」讓行事曆提醒你。</>
        ) : permission === 'denied' ? (
          <>通知權限被關閉了，請到 iPhone 設定 → 通知 → LifeMaster 開啟。</>
        ) : (
          <>
            開啟通知權限才能跳出提醒。
            <button
              type="button"
              onClick={async () => setPermission(await requestNotificationPermission())}
              className="ml-1 font-semibold underline"
            >
              開啟通知
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function EditSheet({ todo, onSave, onDelete, onClose }: { todo: Todo; onSave: (patch: Partial<Todo>) => void; onDelete: () => void; onClose: () => void }) {
  const [draft, setDraft] = useState(todo)
  const set = (patch: Partial<Todo>) => setDraft(d => ({ ...d, ...patch }))
  const hasDue = !!draft.dueDate

  const save = () => {
    const timingChanged = draft.dueDate !== todo.dueDate || draft.dueTime !== todo.dueTime || draft.remind !== todo.remind
    onSave({
      ...draft,
      text: draft.text.trim() || todo.text,
      dueDate: draft.dueDate || undefined,
      dueTime: draft.dueTime || undefined,
      // 時間或提醒改了就重新提醒
      notifiedAt: timingChanged ? undefined : draft.notifiedAt,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center">
          <p className="font-semibold text-fg">編輯任務</p>
          <button onClick={onClose} className="ml-auto rounded-full p-2 text-faint hover:bg-surface-2" aria-label="關閉">
            <X className="h-5 w-5" />
          </button>
        </div>
        <input
          value={draft.text}
          onChange={e => set({ text: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-fg outline-none focus:border-primary"
        />
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(PRIORITIES) as Priority[]).map(p => (
            <button
              key={p}
              onClick={() => set({ priority: p })}
              className={`rounded-full px-3 py-1 text-sm ${draft.priority === p ? `${PRIORITIES[p].badge} font-semibold ring-2 ring-current` : 'bg-surface-2 text-muted'}`}
            >
              {PRIORITIES[p].label}
            </button>
          ))}
          <select value={draft.category} onChange={e => set({ category: e.target.value })} className={`ml-auto ${inputBase}`}>
            {CATEGORIES.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <DueFields
          dueDate={draft.dueDate ?? ''}
          dueTime={draft.dueTime ?? ''}
          remind={draft.remind ?? 'none'}
          onChange={patch => set({ ...patch, remind: patch.dueDate && !draft.dueDate ? DEFAULT_REMIND : (patch.remind ?? draft.remind) })}
        />
        {hasDue && draft.remind !== 'none' && <NotifyPrompt />}
        {hasDue && (
          <button
            onClick={() => downloadIcs({ ...draft, dueTime: draft.dueTime || undefined })}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-sm font-medium text-fg"
          >
            <CalendarPlus className="h-4 w-4" /> 加到 iPhone 行事曆（含提醒）
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm('確定刪除這個任務？')) {
                onDelete()
                onClose()
              }
            }}
            className="rounded-xl px-4 py-2.5 text-sm text-rose-500"
          >
            刪除
          </button>
          <button onClick={save} className="flex-1 rounded-xl bg-primary py-2.5 font-medium text-on-primary">
            儲存
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Todos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [remind, setRemind] = useState<RemindOption>(DEFAULT_REMIND)
  const [showMore, setShowMore] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Todo | null>(null)
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
      {
        id: newId(),
        text: trimmed,
        priority,
        category,
        done: false,
        createdDate: today,
        dueDate: dueDate || undefined,
        dueTime: (dueDate && dueTime) || undefined,
        remind: dueDate ? remind : undefined,
      },
      ...prev,
    ])
    setText('')
    setDueDate('')
    setDueTime('')
    setRemind(DEFAULT_REMIND)
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done, completedDate: !t.done ? today : undefined } : t)))
  }

  const updateTodo = (id: string, patch: Partial<Todo>) => setTodos(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)))
  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id))

  const visible = todos.filter(t => {
    if (filter === 'today') return !t.done && t.dueDate === today
    if (filter === 'overdue') return !t.done && !!t.dueDate && t.dueDate < today
    if (filter === 'done') return t.done
    return true
  })

  // 未完成在前 → 截止日期時間 → 優先級
  const sortKey = (t: Todo) => `${t.dueDate ?? '9999'}${t.dueTime ?? '99:99'}`
  const sorted = [...visible].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      sortKey(a).localeCompare(sortKey(b)) ||
      PRIORITIES[a.priority].order - PRIORITIES[b.priority].order,
  )

  return (
    <div className="space-y-4">
      <Pomodoro />
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
          <button type="submit" className="flex items-center justify-center rounded-xl bg-primary px-4 text-on-primary transition active:scale-95" aria-label="新增任務">
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
          <select value={category} onChange={e => setCategory(e.target.value)} className={`ml-auto ${inputBase}`}>
            {CATEGORIES.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        {showMore || dueDate ? (
          <>
            <DueFields
              dueDate={dueDate}
              dueTime={dueTime}
              remind={remind}
              minDate={today}
              onChange={patch => {
                if (patch.dueDate !== undefined) setDueDate(patch.dueDate)
                if (patch.dueTime !== undefined) setDueTime(patch.dueTime)
                if (patch.remind !== undefined) setRemind(patch.remind)
              }}
            />
            {dueDate && remind !== 'none' && <NotifyPrompt />}
          </>
        ) : (
          <button type="button" onClick={() => setShowMore(true)} className="flex items-center gap-1 text-sm text-muted">
            <CalendarClock className="h-4 w-4" /> 設定截止日與提醒 <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
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
            const due = todo.dueDate && !todo.done ? dueLabel(todo, today) : null
            const bell = !todo.done ? remindLabel(todo) : null
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
                <button onClick={() => setEditing(todo)} className="min-w-0 flex-1 text-left">
                  <p className={`break-words ${todo.done ? 'text-faint line-through' : 'text-fg'}`}>{todo.text}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-xs ${PRIORITIES[todo.priority].badge}`}>{PRIORITIES[todo.priority].label}</span>
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted">{todo.category}</span>
                    {due && <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${due.tone}`}>{due.text}</span>}
                    {bell && (
                      <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs ${todo.notifiedAt ? 'text-faint' : 'bg-primary-soft text-primary-ink'}`}>
                        <Bell className="h-3 w-3" /> {bell}
                      </span>
                    )}
                  </div>
                </button>
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

      {editing && (
        <EditSheet
          todo={editing}
          onSave={patch => updateTodo(editing.id, patch)}
          onDelete={() => deleteTodo(editing.id)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
