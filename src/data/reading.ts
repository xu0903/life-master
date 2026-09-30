import { TEST_1 } from './reading1'
import { TEST_2 } from './reading2'

/**
 * 題庫原始格式：正確答案預設放在選項第一個（a 省略 = 0），載入時再用固定亂數打散順序。
 * keep = true 的題目（例如金額、日期、[1]～[4] 插入位置）保持原本順序。
 */
export interface RawQuestion {
  q: string
  o: [string, string, string, string]
  a?: number
  keep?: boolean
  /** 中文解析 */
  ex: string
}

export interface ReadingDoc {
  /** 文件類型，例如 E-mail、Notice */
  label: string
  text: string
}

export interface RawSet {
  docs: ReadingDoc[]
  qs: RawQuestion[]
}

export interface RawTest {
  id: string
  name: string
  /** Part 5 句子填空 30 題 */
  part5: RawQuestion[]
  /** Part 6 段落填空 4 篇 × 4 題，文章中用 {1}～{4} 標示空格 */
  part6: RawSet[]
  /** Part 7 閱讀理解：單篇 29 題、雙篇 10 題、三篇 15 題 */
  part7: RawSet[]
}

export type SectionId = 'p5' | 'p6' | 'p7s' | 'p7d' | 'p7t'

export const SECTIONS: { id: SectionId; part: string; label: string; desc: string }[] = [
  { id: 'p5', part: 'Part 5', label: '句子填空', desc: '文法與單字' },
  { id: 'p6', part: 'Part 6', label: '段落填空', desc: '含句子插入題' },
  { id: 'p7s', part: 'Part 7', label: '單篇閱讀', desc: '廣告、訊息、文章' },
  { id: 'p7d', part: 'Part 7', label: '雙篇閱讀', desc: '兩篇文章對照' },
  { id: 'p7t', part: 'Part 7', label: '三篇閱讀', desc: '三篇文章對照' },
]

export interface ReadingQuestion {
  id: string
  /** 正式考試的題號 101–200 */
  number: number
  text: string
  options: string[]
  answer: number
  explanation: string
}

/** 一組題目：Part 5 是單獨一題，Part 6 / 7 是文章加上數題 */
export interface ReadingGroup {
  id: string
  section: SectionId
  docs: ReadingDoc[]
  questions: ReadingQuestion[]
}

export interface ReadingTest {
  id: string
  name: string
  groups: ReadingGroup[]
  total: number
}

/** 閱讀測驗時間：正式考試 100 題 75 分鐘 */
export const FULL_TEST_MINUTES = 75

function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function buildQuestion(raw: RawQuestion, id: string, number: number): ReadingQuestion {
  const correct = raw.o[raw.a ?? 0]
  const options = [...raw.o]
  if (!raw.keep) {
    const rand = seeded(id)
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }
  }
  return { id, number, text: raw.q, options, answer: options.indexOf(correct), explanation: raw.ex }
}

function sectionOfSet(docs: ReadingDoc[]): SectionId {
  return docs.length === 1 ? 'p7s' : docs.length === 2 ? 'p7d' : 'p7t'
}

function buildTest(raw: RawTest): ReadingTest {
  let number = 101
  const groups: ReadingGroup[] = []
  const add = (section: SectionId, docs: ReadingDoc[], qs: RawQuestion[]) => {
    const id = `${raw.id}-${groups.length}`
    groups.push({ id, section, docs, questions: qs.map((q, i) => buildQuestion(q, `${id}-${i}`, number++)) })
  }
  for (const q of raw.part5) add('p5', [], [q])
  for (const s of raw.part6) add('p6', s.docs, s.qs)
  // 依單篇 → 雙篇 → 三篇排序，與正式考試相同
  for (const n of [1, 2, 3]) for (const s of raw.part7) if (s.docs.length === n) add(sectionOfSet(s.docs), s.docs, s.qs)
  return { id: raw.id, name: raw.name, groups, total: number - 101 }
}

export const READING_TESTS: ReadingTest[] = [TEST_1, TEST_2].map(buildTest)

/** Part 6 文章裡的 {1} 換成實際題號的空格 */
export function fillBlanks(text: string, group: ReadingGroup): string {
  return text.replace(/\{(\d)\}/g, (_, n: string) => `___(${group.questions[Number(n) - 1]?.number ?? n})___`)
}

// ---------- 作答紀錄 ----------

export const READING_HISTORY_KEY = 'lifemaster.readingHistory'

export interface ReadingRecord {
  date: string
  testId: string
  /** 'full' = 完整模擬考，其餘為單一題型 */
  scope: SectionId | 'full'
  correct: number
  total: number
  /** 作答秒數 */
  seconds: number
}

/**
 * 依答對題數粗估多益閱讀分數（5–495）。
 * 正式考試的換算表每次不同，這裡只是讓你大致知道落點。
 */
export function estimateScore(correct: number, total: number): number {
  if (total === 0) return 5
  const ratio = correct / total
  return Math.max(5, Math.min(495, Math.round((ratio * 520 - 25) / 5) * 5))
}
