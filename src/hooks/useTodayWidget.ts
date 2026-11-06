import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useWordStats } from './useDailyWords'
import { DEFAULT_HABITS, HABITS_KEY } from '../data/habits'
import type { Habit } from '../data/habits'
import { FLASHCARDS_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { TODOS_KEY } from '../data/todos'
import type { Todo } from '../data/todos'
import { toDateKey } from '../utils/date'
import { WIDGET_ON_KEY } from '../utils/memoWidget'
import { TODAY_WIDGET_KEY, buildTodaySummary, pushTodayWidget } from '../utils/todayWidget'

/** 小工具與「今日任務」都開著時：習慣、單字、待辦一變（或跨日回到 App）就上傳摘要 */
export function useTodayWidgetSync() {
  const [on] = useLocalStorage<boolean>(WIDGET_ON_KEY, false)
  const [todayOn] = useLocalStorage<boolean>(TODAY_WIDGET_KEY, false)
  const [habits] = useLocalStorage<Habit[]>(HABITS_KEY, DEFAULT_HABITS)
  const [todos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [cards] = useLocalStorage<Card[]>(FLASHCARDS_KEY, [])
  const [daily] = useLocalStorage<{ date: string; ids: string[]; answered: Record<string, unknown> }>('lifemaster.dailyWords', {
    date: '',
    ids: [],
    answered: {},
  })
  const [stats] = useWordStats()
  const [today, setToday] = useState(toDateKey)

  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && setToday(toDateKey())
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const active = on && todayOn
  const serialized = active
    ? JSON.stringify(buildTodaySummary({ today, habits, todos, daily, stats, cardIds: new Set(cards.map(c => c.id)) }))
    : ''

  useEffect(() => {
    if (!serialized) return
    const timer = window.setTimeout(() => void pushTodayWidget(JSON.parse(serialized)), 2000)
    return () => window.clearTimeout(timer)
  }, [serialized])
}
