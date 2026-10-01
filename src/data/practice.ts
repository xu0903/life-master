import type { Card } from './flashcards'
import { TOEIC_WORDS, WORD_INFO, allWordCards, lookupWord } from './toeicWords'
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
  /** 干擾選項是哪個字（選項文字 → 單字），回報爭議時用 */
  optionWords?: Record<string, string>
  /** 正確答案（選項文字，或填空要填的字） */
  answer: string
  /** 填空題：句子切成空格前後 */
  cloze?: { before: string; after: string; hint: string; translation: string }
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/’/g, "'")

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

const commonPrefix = (a: string, b: string) => {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}
const commonSuffix = (a: string, b: string) => {
  let i = 0
  while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i++
  return i
}
function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[b.length]
}

/** 中文意思拆成一個個詞，用來排除意思重疊的干擾選項 */
const meaningParts = (card: Card) =>
  (lookupWord(card.question)?.zh ?? card.answer)
    .replace(/[（(][^）)]*[）)]/g, '')
    .split(/[；;，,、/]/)
    .map(p => p.trim())
    .filter(Boolean)

// 意思比對時不算的常見字（詞性標記、助詞、「者」「員」這類字尾）
const FILLER = new Set('的地得之了著和與或及等者人員性化物品類式上下中於為被把對一某些這那其'.split(''))
const meaningChars = (card: Card) =>
  new Set(
    meaningParts(card)
      .join('')
      .replace(/[^\u4e00-\u9fff]/g, '')
      .split('')
      .filter(ch => !FILLER.has(ch)),
  )

/** 使用者回報過「這兩個意思都對」的字組（單字|干擾字），之後不再一起出現 */
export const DISPUTED_KEY = 'lifemaster.disputedPairs'
function disputedPairs(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISPUTED_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

/**
 * 干擾選項會不會也算對：同義詞（任一方向）、中文意思有相同的詞，
 * 或中文意思有兩個以上相同的字（保鑣；護衛 vs 保護；防護措施），都不能當選項。
 */
function ambiguous(card: Card, other: Card, disputed: Set<string>): boolean {
  const a = card.question.toLowerCase()
  const b = other.question.toLowerCase()
  if (disputed.has(`${a}|${b}`) || disputed.has(`${b}|${a}`)) return true
  const infoA = lookupWord(a)
  const infoB = lookupWord(b)
  if (infoA?.syn.some(s => s.toLowerCase() === b) || infoB?.syn.some(s => s.toLowerCase() === a)) return true
  const parts = new Set(meaningParts(card))
  if (meaningParts(other).some(p => parts.has(p))) return true
  const chars = meaningChars(card)
  let shared = 0
  for (const ch of meaningChars(other)) if (chars.has(ch) && ++shared >= 2) return true
  return false
}

/**
 * 困難模式的干擾選項：跟答案長得像或容易搞混的字。
 * 依「易混淆字表、同字首、同字尾（-er、-tion…）、拼字只差一兩個字母、同詞性、同主題」打分，
 * 意思和答案重疊的字（同義詞）不能當選項，免得出現兩個正確答案。
 */
function confusables(card: Card): Card[] {
  const info = lookupWord(card.question)
  const w = card.question.toLowerCase()
  const conf = new Set((info?.conf ?? []).map(x => x.toLowerCase()))
  const syn = new Set((info?.syn ?? []).map(x => x.toLowerCase()))
  const disputed = disputedPairs()
  const scored: { card: Card; score: number }[] = []
  for (const c of allWordCards()) {
    const v = c.question.toLowerCase()
    if (c.id === card.id || v === w || syn.has(v)) continue
    const other = lookupWord(v)
    let score = 0
    if (conf.has(v) || other?.conf?.some(x => x.toLowerCase() === w)) score += 10
    const pre = commonPrefix(w, v)
    const suf = commonSuffix(w, v)
    if (pre >= 3) score += Math.min(pre, 6) * 1.5
    if (suf >= 2) score += Math.min(suf, 5) * 1.5
    if (Math.abs(w.length - v.length) <= 2 && pre + suf >= 2 && editDistance(w, v) <= 2) score += 5
    if (info && other?.pos === info.pos) score += 2
    if (info?.topics && other?.topics?.some(t => info.topics!.includes(t))) score += 2
    if (score < 5 || ambiguous(card, c, disputed)) continue
    scored.push({ card: c, score: score + Math.random() * 2 })
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => x.card)
}

/** 產生 3 個干擾選項：困難模式先挑長得像的字，其餘優先用同詞性的題庫字 */
function distractors(card: Card, type: 'zh2en' | 'en2zh', extra: Card[], hard: boolean): Map<string, string> {
  const info = lookupWord(card.question)
  const answer = type === 'zh2en' ? card.question : meaningOf(card)
  const toOption = (c: Card) => (type === 'zh2en' ? c.question : meaningOf(c))
  const samePos = info ? TOEIC_WORDS.filter((_, i) => WORD_INFO[i].pos === info.pos) : []
  const disputed = disputedPairs()
  const result = new Map<string, string>()
  for (const pool of [hard ? shuffle(confusables(card)) : [], shuffle(samePos), shuffle(extra), shuffle(TOEIC_WORDS)]) {
    for (const c of pool) {
      if (result.size >= 3) break
      const opt = toOption(c)
      if (c.id !== card.id && opt !== answer && !result.has(opt) && !ambiguous(card, c, disputed)) result.set(opt, c.question)
    }
  }
  return result
}

export function buildQuestion(card: Card, type: QuestionType | 'mixed', extra: Card[], hard = false): Question {
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
  const others = distractors(card, mc, extra, hard)
  return { id, card, type: mc, answer, options: shuffle([answer, ...others.keys()]), optionWords: Object.fromEntries(others) }
}

export function buildQuiz(cards: Card[], type: QuestionType | 'mixed', extra: Card[], hard = false): Question[] {
  return cards.map(c => buildQuestion(c, type, extra, hard))
}
