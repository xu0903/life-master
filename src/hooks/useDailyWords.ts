import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { FLASHCARDS_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { TOEIC_WORDS, nextStat, pickDailyWords, toGrade } from '../data/toeicWords'
import type { Grade, Level, WordStat } from '../data/toeicWords'
import { toDateKey } from '../utils/date'

interface DailyWordsState {
  date: string
  ids: string[]
  /** 今天抽到的字裡，屬於複習的 id（舊資料沒有此欄位） */
  review?: string[]
  /** 已作答的單字：id → 評分（舊資料是 true / false） */
  answered: Record<string, Grade | boolean>
}

export const WORD_STATS_KEY = 'lifemaster.wordStats'
export const WORD_LEVEL_KEY = 'lifemaster.wordLevel'

export function useWordStats() {
  return useLocalStorage<Record<string, WordStat>>(WORD_STATS_KEY, {})
}

export function useWordLevel() {
  return useLocalStorage<Level>(WORD_LEVEL_KEY, 900)
}

/** 每日 10 個多益單字：每天自動抽題（含間隔複習），並把新單字加入單字卡。 */
export function useDailyWords() {
  const today = toDateKey()
  const [daily, setDaily] = useLocalStorage<DailyWordsState>('lifemaster.dailyWords', {
    date: '',
    ids: [],
    answered: {},
  })
  const [cards, setCards] = useLocalStorage<Card[]>(FLASHCARDS_KEY, [])
  const [stats, setStats] = useWordStats()
  const [level] = useWordLevel()

  useEffect(() => {
    if (daily.date === today) return
    // 以日期當亂數種子，重複執行也會抽到同一組單字
    const { ids, review } = pickDailyWords({
      dateKey: today,
      learnedIds: new Set(cards.map(c => c.id)),
      stats,
      maxLevel: level,
    })
    setDaily({ date: today, ids, review, answered: {} })
    setCards(prev => {
      const have = new Set(prev.map(c => c.id))
      return [...prev, ...TOEIC_WORDS.filter(w => ids.includes(w.id) && !have.has(w.id))]
    })
  }, [today, daily.date, cards, stats, level, setDaily, setCards])

  const ready = daily.date === today
  const words = ready ? daily.ids.map(id => TOEIC_WORDS.find(w => w.id === id)).filter(w => w !== undefined) : []
  const answeredCount = words.filter(w => w.id in daily.answered).length
  const complete = words.length > 0 && answeredCount === words.length

  const answer = (id: string, grade: Grade) => {
    if (id in daily.answered) return
    setDaily(prev => ({ ...prev, answered: { ...prev.answered, [id]: grade } }))
    setStats(prev => ({ ...prev, [id]: nextStat(prev[id], grade, today) }))
  }

  const answered: Record<string, Grade> = {}
  for (const [id, v] of Object.entries(daily.answered)) {
    const g = toGrade(v)
    if (g) answered[id] = g
  }

  return {
    ready,
    words,
    reviewIds: new Set(daily.review ?? []),
    answered,
    answeredCount,
    complete,
    answer,
  }
}
