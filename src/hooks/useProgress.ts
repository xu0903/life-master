import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { HABITS_KEY } from '../data/habits'
import type { Habit } from '../data/habits'
import { READING_HISTORY_KEY } from '../data/reading'
import type { ReadingRecord } from '../data/reading'
import { TODOS_KEY } from '../data/todos'
import type { Todo } from '../data/todos'
import { calcStreak, toDateKey } from '../utils/date'
import { pushProgress } from '../utils/rooms'
import type { Progress } from '../utils/rooms'

/** 彙整今天的習慣、待辦、單字、閱讀進度（只有數字，不含任何內容） */
export function useProgress(): Progress {
  const today = toDateKey()
  const [habits] = useLocalStorage<Habit[]>(HABITS_KEY, [])
  const [todos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [daily] = useLocalStorage<{ date: string; ids: string[]; answered: Record<string, unknown> }>('lifemaster.dailyWords', {
    date: '',
    ids: [],
    answered: {},
  })
  const [reading] = useLocalStorage<ReadingRecord[]>(READING_HISTORY_KEY, [])
  const dailyToday = daily.date === today

  return {
    date: today,
    habitsDone: habits.filter(h => h.completedDates.includes(today)).length,
    habitsTotal: habits.length,
    streak: Math.max(0, ...habits.map(h => calcStreak(h.completedDates))),
    todosDone: todos.filter(t => t.done && t.completedDate === today).length,
    todosLeft: todos.filter(t => !t.done).length,
    wordsDone: dailyToday ? daily.ids.filter(id => id in daily.answered).length : 0,
    wordsTotal: dailyToday ? daily.ids.length : 0,
    reading: reading.filter(r => r.date === today).reduce((n, r) => n + r.total, 0),
  }
}

/** 進度有變動時同步給房間夥伴（稍等一下再送，避免連續打卡時一直連線） */
export function useProgressSync() {
  const progress = useProgress()
  const serialized = JSON.stringify(progress)

  useEffect(() => {
    const timer = window.setTimeout(() => void pushProgress(JSON.parse(serialized) as Progress), 2500)
    return () => window.clearTimeout(timer)
  }, [serialized])
}
