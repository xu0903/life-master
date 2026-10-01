import type { Card } from './flashcards'
import { TOEIC_WORDS, WORD_INFO, cardForWord, registerWords } from './toeicWords'
import type { Level, WordInfo } from './toeicWords'

/**
 * 學測 7000 單（大考中心《高中英文參考詞彙表》）與全民英檢字表（LTTC）。
 * 單字與級別取自官方字表；中文解釋、英英解釋與例句是另外編寫的（scripts/enrich-words.ts）。
 * 多益擴充字表（toeic-extra.json）是 AI 依主題整理的常考字，附常考程度與易混淆字（scripts/gen-toeic-words.ts）。
 * 資料約 2MB，第一次用到時才載入。
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

export const VOCAB_CREDIT =
  '單字與級別：大學入學考試中心《高中英文參考詞彙表》（111 學年度起適用），僅供非營利使用。中文解釋、英英解釋與例句由本 App 以 AI 輔助另行編寫，可能有誤。'

export interface VocabEntry {
  card: Card
  info: WordInfo
  /** 學測級別 1–6，0 = 不在學測字表 */
  ceec: number
  /** 英檢級別 1–3（初、中、中高），0 = 不在英檢字表 */
  gept: number
  /** 多益常考程度 1（非常常考）～5（進階），0 = 不在多益擴充字表 */
  toeic: number
}

type Row = [string, string, string, string, string, string, string, string, number, number]
/** [單字, 詞性, 中文, 英英, 例句, 例句翻譯, 同義, 反義, 常考程度, 主題編號, 易混淆字] */
type ToeicRow = [string, string, string, string, string, string, string, string, number, number, string]

let entries: VocabEntry[] | null = null
let loading: Promise<VocabEntry[]> | null = null
const listeners = new Set<() => void>()

const split = (s: string) => (s ? s.split(', ').filter(Boolean) : [])

/** 載入字表（只會下載一次）；載入完成後，查單字、抽每日單字都會包含這些字 */
export function loadVocab(): Promise<VocabEntry[]> {
  loading ??= Promise.all([import('./vocab.json'), import('./toeic-extra.json')]).then(([vocab, toeic]) => {
    const rows = vocab.default as Row[]
    const toeicIds = new Set(TOEIC_WORDS.map(c => c.id))
    const list: VocabEntry[] = rows.map(([word, pos, zh, def, ex, exZh, syn, ant, ceec, gept]) => {
      // 多益題庫已經有的字沿用同一張卡，熟練度才不會分成兩份
      const existing = cardForWord(word)
      const card: Card = existing && toeicIds.has(existing.id) ? existing : { id: `vocab-${word}`, question: word, answer: `(${pos}) ${zh}`, source: 'vocab' }
      const info: WordInfo = { level: 900, word, kk: '', pos, zh, def, syn: split(syn), ant: split(ant), ex, exZh }
      return { card, info, ceec, gept, toeic: 0 }
    })
    // 多益擴充字：學測字表也有的字共用同一張卡，只補上常考程度、主題與易混淆字
    const byWord = new Map(list.map(e => [e.info.word.toLowerCase(), e]))
    for (const [word, pos, zh, def, ex, exZh, syn, ant, freq, topic, conf] of toeic.default as ToeicRow[]) {
      const extra = { freq, topic, conf: split(conf) }
      const hit = byWord.get(word.toLowerCase())
      if (hit) {
        hit.toeic = freq
        Object.assign(hit.info, extra)
        continue
      }
      const info: WordInfo = { level: tierLevel(freq), word, kk: '', pos, zh, def, syn: split(syn), ant: split(ant), ex, exZh, ...extra }
      list.push({ card: { id: `vocab-${word}`, question: word, answer: `(${pos}) ${zh}`, source: 'toeic' }, info, ceec: 0, gept: 0, toeic: freq })
    }
    entries = list
    registerWords(list.map(e => ({ card: e.card, info: e.info })))
    listeners.forEach(fn => fn())
    return list
  })
  return loading
}

/** 常考程度對應目標分數：1–2 → 600、3–4 → 800、5 → 900 */
const tierLevel = (freq: number): Level => (freq <= 2 ? 600 : freq <= 4 ? 800 : 900)

/** 多益單字的常考程度（越小越常考），用來讓每日單字先抽常考的字 */
export function toeicPriority(): (id: string) => number {
  const map = new Map<string, number>()
  for (const w of WORD_INFO) map.set(`toeic-${w.word}`, w.level === 600 ? 1 : w.level === 800 ? 3 : 5)
  for (const e of entries ?? []) if (e.toeic) map.set(e.card.id, e.toeic)
  return id => map.get(id) ?? 3
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

/** 這個來源要用到字表資料嗎（多益也要，才有擴充的常考字） */
export const needsVocab = (_source: WordSource) => true

/** 依來源篩出可抽的卡片；字表還沒載入時回傳 null。多益 = 內建題庫 + 擴充常考字，依目標分數篩選 */
export function vocabPool(source: WordSource, maxLevel: Level = 900): Card[] | null {
  if (!entries) return null
  if (source.list === 'toeic') {
    const core = TOEIC_WORDS.filter((_, i) => WORD_INFO[i].level <= maxLevel)
    return [...core, ...entries.filter(e => e.toeic && tierLevel(e.toeic) <= maxLevel).map(e => e.card)]
  }
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
