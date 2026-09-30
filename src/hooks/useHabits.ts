import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_HABITS, HABITS_KEY, VOCAB_HABIT } from '../data/habits'
import type { Habit, HabitSettings } from '../data/habits'
import { newId } from '../utils/date'

export function useHabits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(HABITS_KEY, DEFAULT_HABITS)

  // 舊資料沒有「背單字」習慣時補上
  useEffect(() => {
    setHabits(prev => (prev.some(h => h.id === VOCAB_HABIT.id) ? prev : [...prev, VOCAB_HABIT]))
  }, [setHabits])

  const update = (id: string, patch: Partial<Habit>) =>
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...patch } : h)))

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
    setHabits(prev =>
      prev.map(h =>
        h.id === id && !h.completedDates.includes(date) ? { ...h, completedDates: [...h.completedDates, date] } : h,
      ),
    )

  /** 計量習慣加減次數；達到每日目標時自動打卡，低於目標時取消 */
  const addCount = (id: string, date: string, delta: number) =>
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id) return h
        const count = Math.max(0, (h.counts?.[date] ?? 0) + delta)
        const done = count >= (h.target ?? 1)
        const others = h.completedDates.filter(d => d !== date)
        return { ...h, counts: { ...h.counts, [date]: count }, completedDates: done ? [...others, date] : others }
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

  return { habits, update, toggleDate, markDone, addCount, add, remove, move }
}
