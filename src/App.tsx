import { useState } from 'react'
import { BookOpenCheck, Flame, ListTodo } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Habits from './components/Habits'
import Todos from './components/Todos'
import Flashcards from './components/Flashcards'

type TabId = 'habits' | 'todos' | 'flashcards'

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: 'habits', label: '習慣打卡', Icon: Flame },
  { id: 'todos', label: '待辦清單', Icon: ListTodo },
  { id: 'flashcards', label: '單字卡', Icon: BookOpenCheck },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('habits')
  const activeLabel = TABS.find(t => t.id === tab)?.label

  const today = new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="mx-auto min-h-dvh max-w-lg pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 bg-slate-100/85 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 backdrop-blur">
        <p className="text-sm text-slate-500">{today}</p>
        <h1 className="text-2xl font-bold text-slate-900">{activeLabel}</h1>
      </header>

      <main className="px-4 pt-2">
        {tab === 'habits' && <Habits />}
        {tab === 'todos' && <Todos />}
        {tab === 'flashcards' && <Flashcards />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-lg">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition ${
                tab === id ? 'font-semibold text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={tab === id ? 2.4 : 2} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
