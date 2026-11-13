import { describe, expect, it, vi } from 'vitest'
vi.mock('./cloud', () => ({ supabase: null, ensureUser: async () => false }))
import { buildTodaySummary } from './todayWidget'
import type { Habit } from '../data/habits'
import type { Todo } from '../data/todos'

const habit = (id: string, dates: string[]): Habit => ({ id, name: id, icon: '⭐', completedDates: dates })
const todo = (text: string, dueDate: string | undefined, done = false): Todo =>
  ({ id: text, text, priority: 'medium', category: '', done, createdDate: '2026-11-01', dueDate }) as Todo

describe('buildTodaySummary', () => {
  it('整理習慣、連續天數、單字與到期待辦', () => {
    vi.setSystemTime(new Date(2026, 10, 6, 12))
    const s = buildTodaySummary({
      today: '2026-11-06',
      habits: [habit('a', ['2026-11-04', '2026-11-05', '2026-11-06']), habit('b', ['2026-11-05'])],
      todos: [todo('late', '2026-11-01'), todo('today', '2026-11-06'), todo('future', '2026-11-20'), todo('done', '2026-11-06', true), todo('none', undefined)],
      daily: { date: '2026-11-06', ids: ['x', 'y'], answered: { x: 'good' } },
      stats: { x: { box: 1, due: '2026-11-06', right: 1, wrong: 0 }, z: { box: 1, due: '2026-11-01', right: 1, wrong: 0 } },
      cardIds: new Set(['x']),
    })
    expect(s.habitsDone).toBe(1)
    expect(s.habitsTotal).toBe(2)
    expect(s.streak).toBe(3)
    expect(s.streakEnd).toBe('2026-11-06')
    expect(s.words).toEqual({ done: 1, total: 2 })
    expect(s.wordsDue).toBe(1)
    expect(s.todos.map(t => t.t)).toEqual(['late', 'today'])
    expect(s.todosDue).toBe(2)
    vi.useRealTimers()
  })
})
