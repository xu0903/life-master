import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_HABITS, HABITS_KEY, VOCAB_HABIT, habitGoal } from '../data/habits'
import type { Habit, HabitSettings } from '../data/habits'
import { newId } from '../utils/date'

export function useHabits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(HABITS_KEY, DEFAULT_HABITS)

  const [migrated, setMigrated] = useLocalStorage('lifemaster.habitKindsV2', false)

  // 舊資料沒有「背單字」習慣時補上
  useEffect(() => {
    setHabits(prev => (prev.some(h => h.id === VOCAB_HABIT.id) ? prev : [...prev, VOCAB_HABIT]))
  }, [setHabits])

  // 內建的喝水、運動、讀書改成記錄毫升與分鐘（只做一次；自己改過設定的不動）
  useEffect(() => {
    if (migrated) return
    setMigrated(true)
    const upgrade: Record<string, Partial<Habit>> = {
      water: { kind: 'water', bottleMl: 500, target: 2000 },
      exercise: { kind: 'duration', target: 30 },
      read: { kind: 'duration', target: 30 },
    }
    setHabits(prev => prev.map(h => (upgrade[h.id] && !h.kind && !h.target ? { ...h, ...upgrade[h.id] } : h)))
  }, [migrated, setMigrated, setHabits])

  const update = (id: string, patch: Partial<Habit>) => setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...patch } : h)))

  const toggleDate = (id: string, date: string) =>
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id) return h
        const done = h.completedDates.includes(date)
        return {
          ...h,
          completedDates: done ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date],
        }
      }),
    )

  const markDone = (id: string, date: string) =>
    setHabits(prev => prev.map(h => (h.id === id && !h.completedDates.includes(date) ? { ...h, completedDates: [...h.completedDates, date] } : h)))

  /** 計量習慣加減數量（次數、毫升、分鐘、組數）；達到每日目標時自動打卡，低於目標時取消 */
  const addAmount = (id: string, date: string, delta: number) =>
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id) return h
        // 留到小數 4 位：計時器以秒為單位記錄分鐘數
        const amount = Math.max(0, Math.round(((h.counts?.[date] ?? 0) + delta) * 10000) / 10000)
        const done = amount >= habitGoal(h)
        const others = h.completedDates.filter(d => d !== date)
        return { ...h, counts: { ...h.counts, [date]: amount }, completedDates: done ? [...others, date] : others }
      }),
    )

  /** 自動同步的組數習慣：直接設定當天的組數 */
  const setAmount = (id: string, date: string, amount: number) =>
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id || h.counts?.[date] === amount) return h
        const done = amount >= habitGoal(h)
        const others = h.completedDates.filter(d => d !== date)
        return { ...h, counts: { ...h.counts, [date]: amount }, completedDates: done ? [...others, date] : others }
      }),
    )

  const add = (settings: HabitSettings) => setHabits(prev => [...prev, { ...settings, id: newId(), completedDates: [] }])

  const remove = (id: string) => setHabits(prev => prev.filter(h => h.id !== id || h.id === VOCAB_HABIT.id))

  const move = (id: string, direction: -1 | 1) =>
    setHabits(prev => {
      const i = prev.findIndex(h => h.id === id)
      const j = i + direction
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  return { habits, update, toggleDate, markDone, addAmount, setAmount, add, remove, move }
}
