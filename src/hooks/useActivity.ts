import { useLocalStorage } from './useLocalStorage'
import type { ActivityLink } from '../data/habits'
import { GRAMMAR_PROGRESS_KEY } from '../data/grammar'
import { LISTENING_HISTORY_KEY } from '../data/listening'
import type { ListeningRecord } from '../data/listening'
import { READING_HISTORY_KEY } from '../data/reading'
import type { ReadingRecord } from '../data/reading'
import { toDateKey } from '../utils/date'

/** 今天在 App 裡完成了多少練習，給「組數」習慣自動計算進度用 */
export function useActivityToday(): Record<ActivityLink, number> {
  const today = toDateKey()
  const [reading] = useLocalStorage<ReadingRecord[]>(READING_HISTORY_KEY, [])
  const [listening] = useLocalStorage<ListeningRecord[]>(LISTENING_HISTORY_KEY, [])
  const [daily] = useLocalStorage<{ date: string; ids: string[]; answered: Record<string, unknown> }>('lifemaster.dailyWords', {
    date: '',
    ids: [],
    answered: {},
  })
  const [grammar] = useLocalStorage<Record<string, { date: string }>>(GRAMMAR_PROGRESS_KEY, {})

  const sum = (records: { date: string; total: number }[]) => records.filter(r => r.date === today).reduce((n, r) => n + r.total, 0)
  return {
    reading: sum(reading),
    listening: sum(listening),
    words: daily.date === today ? Object.keys(daily.answered).length : 0,
    grammar: Object.values(grammar).filter(p => p.date === today).length,
  }
}
