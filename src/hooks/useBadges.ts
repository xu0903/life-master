import { Award, BookOpen, Flame, Headphones, ListChecks, Timer, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DEFAULT_HABITS, HABITS_KEY } from '../data/habits'
import type { Habit } from '../data/habits'
import { LISTENING_HISTORY_KEY } from '../data/listening'
import type { ListeningRecord } from '../data/listening'
import { POMODORO_INITIAL, POMODORO_KEY } from '../data/pomodoro'
import type { PomodoroState } from '../data/pomodoro'
import { READING_HISTORY_KEY } from '../data/reading'
import type { ReadingRecord } from '../data/reading'
import { TODOS_KEY } from '../data/todos'
import type { Todo } from '../data/todos'
import { useWordStats } from './useDailyWords'
import { useLocalStorage } from './useLocalStorage'
import { bestStreak } from '../utils/date'

export interface Badge {
  name: string
  desc: string
  Icon: LucideIcon
  /** 分享圖與慶祝畫面用的圖案 */
  emoji: string
  /** 目前進度與目標 */
  value: number
  goal: number
}

/** 成就徽章：全部由現有紀錄算出來，不另外存資料 */
export function useBadges(): Badge[] {
  const [habits] = useLocalStorage<Habit[]>(HABITS_KEY, DEFAULT_HABITS)
  const [stats] = useWordStats()
  const [reading] = useLocalStorage<ReadingRecord[]>(READING_HISTORY_KEY, [])
  const [listening] = useLocalStorage<ListeningRecord[]>(LISTENING_HISTORY_KEY, [])
  const [todos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [pomodoro] = useLocalStorage<PomodoroState>(POMODORO_KEY, POMODORO_INITIAL)

  const streak = Math.max(0, ...habits.map(h => bestStreak(h.completedDates)))
  const words = Object.keys(stats).length
  const questions = [...reading, ...listening].reduce((n, r) => n + r.total, 0)
  const fullTests = reading.filter(r => r.scope === 'full').length
  const bestFull = Math.max(0, ...reading.filter(r => r.scope === 'full').map(r => r.correct))
  const doneTodos = todos.filter(t => t.done).length
  const tomatoes = Object.values(pomodoro.log).reduce((n, v) => n + v, 0)

  return [
    { name: '起步', desc: '連續打卡 3 天', Icon: Flame, emoji: '🌱', value: streak, goal: 3 },
    { name: '一週不間斷', desc: '連續打卡 7 天', Icon: Flame, emoji: '🔥', value: streak, goal: 7 },
    { name: '習慣養成', desc: '連續打卡 30 天', Icon: Flame, emoji: '💪', value: streak, goal: 30 },
    { name: '百日達人', desc: '連續打卡 100 天', Icon: Trophy, emoji: '🏆', value: streak, goal: 100 },
    { name: '單字新手', desc: '學過 50 個單字', Icon: BookOpen, emoji: '📗', value: words, goal: 50 },
    { name: '單字收藏家', desc: '學過 200 個單字', Icon: BookOpen, emoji: '📚', value: words, goal: 200 },
    { name: '單字大師', desc: '學過 500 個單字', Icon: BookOpen, emoji: '🎓', value: words, goal: 500 },
    { name: '刷題百題', desc: '寫完 100 題測驗', Icon: Headphones, emoji: '✏️', value: questions, goal: 100 },
    { name: '題海戰術', desc: '寫完 500 題測驗', Icon: Headphones, emoji: '🌊', value: questions, goal: 500 },
    { name: '模擬考初體驗', desc: '完成一次完整模擬考', Icon: Award, emoji: '📝', value: fullTests, goal: 1 },
    { name: '閱讀高手', desc: '模擬考答對 80 題以上', Icon: Award, emoji: '🎯', value: bestFull, goal: 80 },
    { name: '行動派', desc: '完成 50 項待辦', Icon: ListChecks, emoji: '✅', value: doneTodos, goal: 50 },
    { name: '專注力', desc: '完成 20 個番茄鐘', Icon: Timer, emoji: '🍅', value: tomatoes, goal: 20 },
  ]
}
