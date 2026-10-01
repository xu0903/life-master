import { useState } from 'react'
import { BarChart3, BookOpenCheck, Flame, ListTodo, Settings as SettingsIcon, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Habits from './components/Habits'
import Todos from './components/Todos'
import Flashcards from './components/Flashcards'
import Stats from './components/Stats'
import EnvBanner from './components/EnvBanner'
import ReminderBanner from './components/ReminderBanner'
import Rooms from './components/Rooms'
import Settings from './components/Settings'
import WordPopupProvider from './components/WordPopup'
import { useCloudBackup } from './hooks/useCloudBackup'
import { useProgressSync } from './hooks/useProgress'
import { useTheme } from './themes'

type TabId = 'habits' | 'todos' | 'flashcards' | 'rooms' | 'stats' | 'settings'

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: 'habits', label: '習慣打卡', Icon: Flame },
  { id: 'todos', label: '待辦清單', Icon: ListTodo },
  { id: 'flashcards', label: '學習', Icon: BookOpenCheck },
  { id: 'rooms', label: '夥伴', Icon: Users },
  { id: 'stats', label: '統計', Icon: BarChart3 },
  { id: 'settings', label: '設定', Icon: SettingsIcon },
]

/** 邀請連結 ?join=XXXXXX 帶來的邀請碼；讀完就從網址列拿掉 */
function readJoinCode(): string {
  const code = new URLSearchParams(location.search).get('join')?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) ?? ''
  if (code) history.replaceState(null, '', location.pathname)
  return code
}

export default function App() {
  const [joinCode] = useState(readJoinCode)
  const [tab, setTab] = useState<TabId>(joinCode ? 'rooms' : 'habits')
  const { themeId, setThemeId } = useTheme()
  useProgressSync()
  useCloudBackup()
  const activeLabel = TABS.find(t => t.id === tab)?.label

  const today = new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })

  const goTo = (id: TabId) => {
    setTab(id)
    window.scrollTo({ top: 0 })
  }

  return (
    <WordPopupProvider>
      <div className="mx-auto min-h-dvh max-w-lg pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <header className="sticky top-0 z-10 bg-bg/85 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 backdrop-blur">
          <p className="text-sm text-muted">{today}</p>
          <h1 className="text-2xl font-bold text-fg">{activeLabel}</h1>
        </header>
  
        <EnvBanner onOpenSettings={() => goTo('settings')} />
        <ReminderBanner onOpen={() => goTo('todos')} />

        <main className="px-4 pt-2">
          {tab === 'habits' && <Habits onManage={() => goTo('settings')} />}
          {tab === 'todos' && <Todos />}
          {tab === 'flashcards' && <Flashcards />}
          {tab === 'rooms' && <Rooms onOpenSettings={() => goTo('settings')} joinCode={joinCode} />}
          {tab === 'stats' && <Stats />}
          {tab === 'settings' && <Settings themeId={themeId} onThemeChange={setThemeId} />}
        </main>
  
        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto flex max-w-lg">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                  tab === id ? 'font-semibold text-primary-ink' : 'text-faint'
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={tab === id ? 2.4 : 2} />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </WordPopupProvider>
  )
}
