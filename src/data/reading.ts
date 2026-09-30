import { TEST_1 } from './reading1'
import { TEST_2 } from './reading2'

/**
 * 題庫原始格式：正確答案預設放在選項第一個（a 省略 = 0），載入時再用固定亂數打散順序。
 * keep = true 的題目（例如金額、日期、[1]～[4] 插入位置）保持原本順序。
 */
export interface RawQuestion {
  q: string
  o: string[]
  a?: number
  keep?: boolean
  /** 考點分類（Part 5 手動標記，其餘依題目文字自動判斷） */
  tag?: string
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
  /** 考點分類，對應 TAGS */
  tag: string
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

/** 考點分類名稱，用在弱點分析 */
export const TAGS: Record<string, string> = {
  pos: '詞性判斷',
  verb: '動詞時態與語態',
  prep: '介系詞',
  conj: '連接詞',
  pron: '代名詞與關係詞',
  vocab: '單字與片語',
  p6: '段落填空（字彙文法）',
  insert: '句子插入',
  main: '主旨與目的',
  detail: '細節題',
  infer: '推論題',
  not: 'NOT 題',
  intent: '語意理解',
  synonym: '同義字',
}

function classify(section: SectionId, raw: RawQuestion): string {
  if (raw.tag) return raw.tag
  if (section === 'p5') return 'vocab'
  if (section === 'p6') return raw.o.some(o => o.length > 40) ? 'insert' : 'p6'
  const q = raw.q
  if (/positions marked/.test(q)) return 'insert'
  if (/closest in meaning/.test(q)) return 'synonym'
  if (/most likely mean/.test(q)) return 'intent'
  if (/\bNOT\b/.test(q)) return 'not'
  if (/purpose|mainly|Why was the .* written|Why did .* write/.test(q)) return 'main'
  if (/suggested|most likely|indicated|implied/.test(q)) return 'infer'
  return 'detail'
}

export function buildQuestion(raw: RawQuestion, id: string, number: number, tag = 'detail'): ReadingQuestion {
  const correct = raw.o[raw.a ?? 0]
  const options = [...raw.o]
  if (!raw.keep) {
    const rand = seeded(id)
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }
  }
  return { id, number, text: raw.q, options, answer: options.indexOf(correct), explanation: raw.ex, tag }
}

function sectionOfSet(docs: ReadingDoc[]): SectionId {
  return docs.length === 1 ? 'p7s' : docs.length === 2 ? 'p7d' : 'p7t'
}

function buildTest(raw: RawTest): ReadingTest {
  let number = 101
  const groups: ReadingGroup[] = []
  const add = (section: SectionId, docs: ReadingDoc[], qs: RawQuestion[]) => {
    const id = `${raw.id}-${groups.length}`
    groups.push({ id, section, docs, questions: qs.map((q, i) => buildQuestion(q, `${id}-${i}`, number++, classify(section, q))) })
  }
  for (const q of raw.part5) add('p5', [], [q])
  for (const s of raw.part6) add('p6', s.docs, s.qs)
  // 依單篇 → 雙篇 → 三篇排序，與正式考試相同
  for (const n of [1, 2, 3]) for (const s of raw.part7) if (s.docs.length === n) add(sectionOfSet(s.docs), s.docs, s.qs)
  return { id: raw.id, name: raw.name, groups, total: number - 101 }
}

export const READING_TESTS: ReadingTest[] = [TEST_1, TEST_2].map(buildTest)

export const GROUP_BY_ID = new Map(READING_TESTS.flatMap(t => t.groups.map(g => [g.id, g] as const)))

/** 題組屬於哪一份試題 */
export function testOfGroup(groupId: string): ReadingTest | undefined {
  return READING_TESTS.find(t => groupId.startsWith(`${t.id}-`))
}

/** Part 6 文章裡的 {1} 換成實際題號的空格 */
export function fillBlanks(text: string, group: ReadingGroup): string {
  return text.replace(/\{(\d)\}/g, (_, n: string) => `___(${group.questions[Number(n) - 1]?.number ?? n})___`)
}

// ---------- 作答紀錄 ----------

export const READING_HISTORY_KEY = 'lifemaster.readingHistory'
/** 各考點累計答對 / 作答題數 */
export const READING_TAGS_KEY = 'lifemaster.readingTags'
/** 錯題本：目前還沒答對過的題目 id */
export const READING_WRONG_KEY = 'lifemaster.readingWrong'

export type TagStats = Record<string, { right: number; total: number }>

export interface ReadingRecord {
  date: string
  testId: string
  /** 'full' = 完整模擬考、'daily' = 每日 10 題、'quick' = 閱讀 2 篇、'wrong' = 錯題本，其餘為單一題型 */
  scope: SectionId | 'full' | 'daily' | 'quick' | 'wrong'
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
