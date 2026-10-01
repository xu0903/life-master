import type { ReadingQuestion } from '../data/reading'
import { WORD_INFO, cardForWord, lookupInflected } from '../data/toeicWords'
import { loadVocab } from '../data/vocab'
import { useDecks } from './useCards'

/** 答錯的題目裡出現的生字，自動收進這個卡組 */
export const MISTAKE_DECK = { id: 'mistake-words', name: '錯題生字' }

const TOEIC = new Set(WORD_INFO.map(w => w.word.toLowerCase()))

/**
 * 從答錯的題目找出值得複習的單字：題目文字與正確選項裡，
 * 屬於多益題庫或學測 3 級以上的字（太基本的字不收，避免卡組被灌爆）。
 */
async function wordsFrom(questions: ReadingQuestion[]): Promise<string[]> {
  const vocab = await loadVocab().catch(() => [])
  const ceecLevel = new Map(vocab.map(e => [e.info.word.toLowerCase(), e.ceec]))
  const found = new Set<string>()
  for (const q of questions) {
    const text = `${q.text} ${q.options[q.answer] ?? ''}`
    for (const token of text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? []) {
      const info = lookupInflected(token)
      if (!info) continue
      const key = info.word.toLowerCase()
      if (TOEIC.has(key) || (ceecLevel.get(key) ?? 0) >= 3) found.add(info.word)
    }
  }
  return [...found]
}

/** 收集答錯題目裡的生字，回傳新收進卡組的字數 */
export function useMistakeWords() {
  const { decks, addToFixedDeck } = useDecks()
  const existing = new Set(decks.find(d => d.id === MISTAKE_DECK.id)?.cardIds ?? [])

  const collect = async (wrong: ReadingQuestion[]): Promise<number> => {
    if (wrong.length === 0) return 0
    let added = 0
    for (const word of await wordsFrom(wrong)) {
      const card = cardForWord(word)
      if (!card) continue
      if (!existing.has(card.id)) added++
      addToFixedDeck(MISTAKE_DECK.id, MISTAKE_DECK.name, card)
    }
    return added
  }

  return { collect }
}
