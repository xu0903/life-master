import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { newId, toDateKey } from '../utils/date'

type Priority = 'high' | 'medium' | 'low'

interface Todo {
  id: string
  text: string
  priority: Priority
  category: string
  done: boolean
  createdDate: string
  completedDate?: string
}

const PRIORITIES: Record<Priority, { label: string; badge: string; order: number }> = {
  high: { label: '高', badge: 'bg-red-100 text-red-600', order: 0 },
  medium: { label: '中', badge: 'bg-amber-100 text-amber-600', order: 1 },
  low: { label: '低', badge: 'bg-sky-100 text-sky-600', order: 2 },
}

const CATEGORIES = ['工作', '學習', '生活', '其他']

export default function Todos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('lifemaster.todos', [])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState(CATEGORIES[0])
  const today = toDateKey()

  // 今日任務 = 今天新增的 + 尚未完成的 + 今天完成的
  const todayTodos = todos.filter(t => t.createdDate === today || !t.done || t.completedDate === today)
  const todayDone = todayTodos.filter(t => t.done).length
  const percent = todayTodos.length ? Math.round((todayDone / todayTodos.length) * 100) : 0

  const addTodo = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev => [
      { id: newId(), text: trimmed, priority, category, done: false, createdDate: today },
      ...prev,
    ])
    setText('')
  }

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t =>
        t.id === id ? { ...t, done: !t.done, completedDate: !t.done ? today : undefined } : t,
      ),
    )
  }

  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id))

  // 未完成在前，再依優先級排序
  const sorted = [...todos].sort(
    (a, b) => Number(a.done) - Number(b.done) || PRIORITIES[a.priority].order - PRIORITIES[b.priority].order,
  )

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500">今日進度</p>
            <p className="text-sm text-slate-400">
              已完成 {todayDone} / {todayTodos.length} 項
            </p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{percent}%</p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <form onSubmit={addTodo} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="新增任務…"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 text-white transition hover:bg-indigo-700 active:scale-95"
            aria-label="新增任務"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">優先級</span>
          {(Object.keys(PRIORITIES) as Priority[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                priority === p ? `${PRIORITIES[p].badge} font-semibold ring-2 ring-current` : 'bg-slate-100 text-slate-500'
              }`}
            >
              {PRIORITIES[p].label}
            </button>
          ))}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="ml-auto rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-600 outline-none"
          >
            {CATEGORIES.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </form>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-slate-400">還沒有任務，新增一個吧！</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map(todo => (
            <li key={todo.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                  todo.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
                }`}
                aria-label={todo.done ? '標記為未完成' : '標記為完成'}
              >
                {todo.done && <Check className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`break-words ${todo.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {todo.text}
                </p>
                <div className="mt-1 flex gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-xs ${PRIORITIES[todo.priority].badge}`}>
                    {PRIORITIES[todo.priority].label}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{todo.category}</span>
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                aria-label="刪除任務"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
