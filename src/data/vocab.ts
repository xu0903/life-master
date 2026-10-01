import type { Card } from './flashcards'
import { TOEIC_WORDS, cardForWord, registerWords } from './toeicWords'
import type { WordInfo } from './toeicWords'

/**
 * 學測 7000 單（大考中心《高中英文參考詞彙表》）與全民英檢字表（LTTC）。
 * 單字與級別取自官方字表；中文解釋、英英解釋與例句是另外編寫的（scripts/enrich-words.ts）。
 * 資料約 1.5MB，第一次用到時才載入。
 */

/** 每日單字的來源：多益題庫，或某個字表的某幾級 */
export type WordSource = { list: 'toeic' } | { list: 'ceec' | 'gept'; min: number; max: number }

export const WORD_SOURCE_KEY = 'lifemaster.wordSource'
export const DEFAULT_WORD_SOURCE: WordSource = { list: 'toeic' }

export const CEEC_LEVELS = [1, 2, 3, 4, 5, 6].map(n => ({ value: n, label: `${n} 級` }))
export const GEPT_LEVELS = [
  { value: 1, label: '初級' },
  { value: 2, label: '中級' },
  { value: 3, label: '中高級' },
]

export const VOCAB_CREDIT = '單字與級別：大學入學考試中心《高中英文參考詞彙表》（111 學年度起適用），僅供非營利使用。中文解釋、英英解釋與例句由本 App 以 AI 輔助另行編寫，可能有誤。'

export interface VocabEntry {
  card: Card
  info: WordInfo
  /** 學測級別 1–6，0 = 不在學測字表 */
  ceec: number
  /** 英檢級別 1–3（初、中、中高），0 = 不在英檢字表 */
  gept: number
}

type Row = [string, string, string, string, string, string, string, string, number, number]

let entries: VocabEntry[] | null = null
let loading: Promise<VocabEntry[]> | null = null
const listeners = new Set<() => void>()

const split = (s: string) => (s ? s.split(', ').filter(Boolean) : [])

/** 載入字表（只會下載一次）；載入完成後，查單字、抽每日單字都會包含這些字 */
export function loadVocab(): Promise<VocabEntry[]> {
  loading ??= import('./vocab.json').then(mod => {
    const rows = mod.default as Row[]
    const toeicIds = new Set(TOEIC_WORDS.map(c => c.id))
    entries = rows.map(([word, pos, zh, def, ex, exZh, syn, ant, ceec, gept]) => {
      // 多益題庫已經有的字沿用同一張卡，熟練度才不會分成兩份
      const existing = cardForWord(word)
      const card: Card = existing && toeicIds.has(existing.id) ? existing : { id: `vocab-${word}`, question: word, answer: `(${pos}) ${zh}`, source: 'vocab' }
      const info: WordInfo = { level: 900, word, kk: '', pos, zh, def, syn: split(syn), ant: split(ant), ex, exZh }
      return { card, info, ceec, gept }
    })
    registerWords(entries.map(e => ({ card: e.card, info: e.info })))
    listeners.forEach(fn => fn())
    return entries
  })
  return loading
}

export function vocabEntries(): VocabEntry[] | null {
  return entries
}

/** 資料裡有沒有英檢字表（取得 LTTC 授權前的公開版不含） */
export function hasGept(): boolean {
  return !!entries?.some(e => e.gept > 0)
}

/** 字表載入完成時通知（用來讓畫面重新整理） */
export function onVocabLoaded(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** 這個來源要用到字表資料嗎 */
export const needsVocab = (source: WordSource) => source.list !== 'toeic'

/** 依來源篩出可抽的卡片；字表還沒載入時回傳 null */
export function vocabPool(source: WordSource): Card[] | null {
  if (source.list === 'toeic') return null
  if (!entries) return null
  // 之前選了英檢、但這一版沒有英檢資料時，退回多益題庫
  if (source.list === 'gept' && !hasGept()) return null
  return entries
    .filter(e => {
      const level = source.list === 'ceec' ? e.ceec : e.gept
      return level >= source.min && level <= source.max
    })
    .map(e => e.card)
}

export function sourceLabel(source: WordSource): string {
  if (source.list === 'toeic') return '多益'
  if (source.list === 'ceec') return source.min === source.max ? `學測 ${source.min} 級` : `學測 ${source.min}–${source.max} 級`
  const name = (n: number) => GEPT_LEVELS.find(l => l.value === n)?.label ?? ''
  return source.min === source.max ? `英檢${name(source.min)}` : `英檢${name(source.min)}–${name(source.max)}`
}
