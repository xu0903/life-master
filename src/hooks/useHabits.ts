import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_HABITS, HABITS_KEY, VOCAB_HABIT } from '../data/habits'
import type { Habit } from '../data/habits'
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

  const add = (name: string, icon: string, color: string) =>
    setHabits(prev => [...prev, { id: newId(), name, icon, color, completedDates: [] }])

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

  return { habits, update, toggleDate, markDone, add, remove, move }
}
