import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { FLASHCARDS_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { TOEIC_WORDS, pickDailyWords } from '../data/toeicWords'
import { toDateKey } from '../utils/date'

interface DailyWordsState {
  date: string
  ids: string[]
  /** 已作答的單字：id → 是否認識 */
  answered: Record<string, boolean>
}

/** 每日 10 個多益單字：每天自動抽題，並把新單字加入單字卡。 */
export function useDailyWords() {
  const today = toDateKey()
  const [daily, setDaily] = useLocalStorage<DailyWordsState>('lifemaster.dailyWords', {
    date: '',
    ids: [],
    answered: {},
  })
  const [cards, setCards] = useLocalStorage<Card[]>(FLASHCARDS_KEY, [])

  useEffect(() => {
    if (daily.date === today) return
    // 以日期當亂數種子，重複執行也會抽到同一組單字
    const ids = pickDailyWords(today, new Set(cards.map(c => c.id)))
    setDaily({ date: today, ids, answered: {} })
    setCards(prev => {
      const have = new Set(prev.map(c => c.id))
      return [...prev, ...TOEIC_WORDS.filter(w => ids.includes(w.id) && !have.has(w.id))]
    })
  }, [today, daily.date, cards, setDaily, setCards])

  const ready = daily.date === today
  const words = ready ? daily.ids.map(id => TOEIC_WORDS.find(w => w.id === id)).filter(w => w !== undefined) : []
  const answeredCount = words.filter(w => w.id in daily.answered).length
  const complete = words.length > 0 && answeredCount === words.length

  const answer = (id: string, known: boolean) =>
    setDaily(prev => ({ ...prev, answered: { ...prev.answered, [id]: known } }))

  const deckIds = new Set(cards.map(c => c.id))
  const addToDeck = (card: Card) =>
    setCards(prev => (prev.some(c => c.id === card.id) ? prev : [...prev, card]))

  return { ready, words, answered: daily.answered, answeredCount, complete, answer, deckIds, addToDeck }
}
