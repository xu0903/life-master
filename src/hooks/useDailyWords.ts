import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { FLASHCARDS_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { findCard, nextStat, pickDailyWords, toGrade } from '../data/toeicWords'
import type { Grade, Level, WordStat } from '../data/toeicWords'
import { DEFAULT_WORD_SOURCE, WORD_SOURCE_KEY, loadVocab, needsVocab, vocabEntries, vocabPool } from '../data/vocab'
import type { WordSource } from '../data/vocab'
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

export function useWordSource() {
  return useLocalStorage<WordSource>(WORD_SOURCE_KEY, DEFAULT_WORD_SOURCE)
}

/** 需要學測 / 英檢字表時才載入；回傳是否已可使用 */
export function useVocabReady(needed: boolean): boolean {
  const [ready, setReady] = useState(() => vocabEntries() !== null)
  useEffect(() => {
    if (!needed || ready) return
    let alive = true
    void loadVocab().then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [needed, ready])
  return ready || !needed
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
  const [source] = useWordSource()
  // 今天抽到的字裡有字表單字，或來源是字表，都要等字表載入
  const vocabReady = useVocabReady(needsVocab(source) || daily.ids.some(id => id.startsWith('vocab-')))

  useEffect(() => {
    if (daily.date === today || !vocabReady) return
    // 以日期當亂數種子，重複執行也會抽到同一組單字
    const { ids, review } = pickDailyWords({
      dateKey: today,
      learnedIds: new Set(cards.map(c => c.id)),
      stats,
      maxLevel: level,
      pool: vocabPool(source) ?? undefined,
    })
    setDaily({ date: today, ids, review, answered: {} })
    setCards(prev => {
      const have = new Set(prev.map(c => c.id))
      return [...prev, ...ids.map(findCard).filter(c => c !== undefined && !have.has(c.id))] as typeof prev
    })
  }, [today, daily.date, cards, stats, level, source, vocabReady, setDaily, setCards])

  const ready = daily.date === today && vocabReady
  const words = ready ? daily.ids.map(id => findCard(id)).filter(w => w !== undefined) : []
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
