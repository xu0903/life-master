import type { Card } from './flashcards'
import { TOEIC_WORDS, WORD_INFO, lookupWord } from './toeicWords'
import type { WordStat } from './toeicWords'

/** 看中選英 / 看英選中 / 例句填空（留頭尾字母） */
export type QuestionType = 'zh2en' | 'en2zh' | 'cloze'

export const QUESTION_TYPES: { value: QuestionType | 'mixed'; label: string }[] = [
  { value: 'mixed', label: '混合' },
  { value: 'zh2en', label: '看中選英' },
  { value: 'en2zh', label: '看英選中' },
  { value: 'cloze', label: '例句填空' },
]

export interface Question {
  id: string
  card: Card
  type: QuestionType
  /** 選擇題選項（填空題沒有） */
  options?: string[]
  /** 正確答案（選項文字，或填空要填的字） */
  answer: string
  /** 填空題：句子切成空格前後 */
  cloze?: { before: string; after: string; hint: string; translation: string }
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/’/g, "'")

/** 卡片的中文意思：題庫字用「(詞性) 中文」，自訂卡用答案 */
export function meaningOf(card: Card): string {
  const info = lookupWord(card.question)
  return info ? `(${info.pos}) ${info.zh}` : card.answer
}

/**
 * 在例句中找出單字（含變化形，例如 approve → approved、supply → supplies），
 * 回傳該字在句子中的位置。找不到回傳 null。
 */
export function findWordInSentence(word: string, sentence: string): { start: number; end: number; token: string } | null {
  const w = normalize(word)
  const stem = /[ey]$/.test(w) && w.length >= 4 ? w.slice(0, -1) : w
  const tokens = [...sentence.matchAll(/[A-Za-zÀ-ÿ’'-]+/g)]
  const pick = (test: (t: string) => boolean) => {
    for (const m of tokens) {
      // 去掉所有格 's，避免把 company's 整個當答案
      const raw = m[0].replace(/['’]s$/, '')
      if (test(normalize(raw))) return { start: m.index, end: m.index + raw.length, token: raw }
    }
    return null
  }
  return pick(t => t === w) ?? pick(t => t.startsWith(w)) ?? (stem.length >= 3 ? pick(t => t.startsWith(stem)) : null)
}

/** 留頭尾字母的提示，例如 approved → a______d */
export function maskWord(token: string): string {
  if (token.length <= 2) return token[0] + '_'
  if (token.length === 3) return token[0] + '__'
  return token[0] + '_'.repeat(token.length - 2) + token[token.length - 1]
}

export function isClozeCorrect(input: string, answer: string) {
  return normalize(input.trim()) === normalize(answer)
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 依熟練度加權抽不重複的卡片，越不熟越容易被抽到 */
export function pickCards(pool: Card[], count: number, stats: Record<string, WordStat>): Card[] {
  const remaining = [...pool]
  const picked: Card[] = []
  while (picked.length < count && remaining.length) {
    const weights = remaining.map(c => 6 - (stats[c.id]?.box ?? 0))
    let r = Math.random() * weights.reduce((a, b) => a + b, 0)
    let i = 0
    while (i < remaining.length - 1 && (r -= weights[i]) > 0) i++
    picked.push(remaining.splice(i, 1)[0])
  }
  return picked
}

/** 產生 3 個干擾選項：優先用同詞性的題庫字，看起來更像、更有鑑別度 */
function distractors(card: Card, type: 'zh2en' | 'en2zh', extra: Card[]): string[] {
  const info = lookupWord(card.question)
  const answer = type === 'zh2en' ? card.question : meaningOf(card)
  const toOption = (c: Card) => (type === 'zh2en' ? c.question : meaningOf(c))
  const samePos = info ? TOEIC_WORDS.filter((_, i) => WORD_INFO[i].pos === info.pos) : []
  const result = new Set<string>()
  for (const pool of [shuffle(samePos), shuffle(extra), shuffle(TOEIC_WORDS)]) {
    for (const c of pool) {
      if (result.size >= 3) break
      const opt = toOption(c)
      if (c.id !== card.id && opt !== answer) result.add(opt)
    }
  }
  return [...result]
}

export function buildQuestion(card: Card, type: QuestionType | 'mixed', extra: Card[]): Question {
  const info = lookupWord(card.question)
  const found = info ? findWordInSentence(info.word, info.ex) : null
  const types: QuestionType[] = found ? ['zh2en', 'en2zh', 'cloze'] : ['zh2en', 'en2zh']
  // 指定填空但這張卡沒有例句時，改出選擇題
  const t: QuestionType = type === 'mixed' || !types.includes(type) ? types[Math.floor(Math.random() * types.length)] : type
  const id = `${card.id}-${Math.random().toString(36).slice(2, 8)}`

  if (t === 'cloze' && info && found) {
    return {
      id,
      card,
      type: t,
      answer: found.token,
      cloze: {
        before: info.ex.slice(0, found.start),
        after: info.ex.slice(found.end),
        hint: maskWord(found.token),
        translation: info.exZh,
      },
    }
  }
  const mc = t === 'cloze' ? 'zh2en' : t
  const answer = mc === 'zh2en' ? card.question : meaningOf(card)
  return { id, card, type: mc, answer, options: shuffle([answer, ...distractors(card, mc, extra)]) }
}

export function buildQuiz(cards: Card[], type: QuestionType | 'mixed', extra: Card[]): Question[] {
  return cards.map(c => buildQuestion(c, type, extra))
}
