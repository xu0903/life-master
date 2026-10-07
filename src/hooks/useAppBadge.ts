import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useWordStats } from './useDailyWords'
import { FLASHCARDS_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { TODOS_KEY } from '../data/todos'
import type { Todo } from '../data/todos'
import { toDateKey } from '../utils/date'

/** 主畫面圖示上的數字要算什麼；預設關閉 */
export type BadgeMode = 'off' | 'words' | 'todos' | 'both'
export const APP_BADGE_KEY = 'lifemaster.appBadge'
export const BADGE_OPTIONS: { value: BadgeMode; label: string }[] = [
  { value: 'off', label: '關閉' },
  { value: 'words', label: '待複習單字' },
  { value: 'todos', label: '今日待辦' },
  { value: 'both', label: '兩者加總' },
]

/** iPhone 16.4 以上加入主畫面、且開啟通知後才會顯示 */
export const badgeSupported = typeof navigator !== 'undefined' && 'setAppBadge' in navigator

/** 依設定計算數字並更新主畫面圖示；App 切回前景時也會重算（跨日後到期的字會變多） */
export function useAppBadge() {
  const [mode] = useLocalStorage<BadgeMode>(APP_BADGE_KEY, 'off')
  const [stats] = useWordStats()
  const [cards] = useLocalStorage<Card[]>(FLASHCARDS_KEY, [])
  const [todos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [today, setToday] = useState(toDateKey)

  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && setToday(toDateKey())
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => {
    if (!badgeSupported) return
    const mine = new Set(cards.map(c => c.id))
    const words = Object.entries(stats).filter(([id, s]) => mine.has(id) && s.due <= today).length
    const dueTodos = todos.filter(t => !t.done && !t.ghostOf && t.dueDate && t.dueDate <= today).length
    const count = mode === 'words' ? words : mode === 'todos' ? dueTodos : mode === 'both' ? words + dueTodos : 0
    const task = count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge()
    task.catch(() => {})
  }, [mode, stats, cards, todos, today])
}
