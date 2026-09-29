import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { FLASHCARDS_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { TOEIC_WORDS, nextStat, pickDailyWords } from '../data/toeicWords'
import type { Level, WordStat } from '../data/toeicWords'
import { toDateKey } from '../utils/date'

interface DailyWordsState {
  date: string
  ids: string[]
  /** 今天抽到的字裡，屬於複習的 id（舊資料沒有此欄位） */
  review?: string[]
  /** 已作答的單字：id → 是否認識 */
  answered: Record<string, boolean>
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

  const answer = (id: string, known: boolean) => {
    if (id in daily.answered) return
    setDaily(prev => ({ ...prev, answered: { ...prev.answered, [id]: known } }))
    setStats(prev => ({ ...prev, [id]: nextStat(prev[id], known, today) }))
  }

  const deckIds = new Set(cards.map(c => c.id))
  const addToDeck = (card: Card) =>
    setCards(prev => (prev.some(c => c.id === card.id) ? prev : [...prev, card]))

  return {
    ready,
    words,
    reviewIds: new Set(daily.review ?? []),
    answered: daily.answered,
    answeredCount,
    complete,
    answer,
    deckIds,
    addToDeck,
  }
}
