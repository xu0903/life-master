import { LISTENING_1 } from './listening1'
import { buildQuestion } from './reading'
import type { RawQuestion, ReadingQuestion } from './reading'

export type Voice = 'M' | 'W'

export interface RawListening {
  id: string
  name: string
  /** Part 2 應答問題：題目與三個回應都只用聽的 */
  part2: { q: string; o: [string, string, string]; ex: string }[]
  /** Part 3 簡短對話：每段 3 題 */
  part3: { lines: [Voice, string][]; qs: RawQuestion[] }[]
  /** Part 4 簡短獨白：每段 3 題 */
  part4: { label: string; voice: Voice; text: string; qs: RawQuestion[] }[]
}

export type ListeningPart = 2 | 3 | 4

export const LISTENING_PARTS: { part: ListeningPart; label: string; desc: string }[] = [
  { part: 2, label: '應答問題', desc: '聽問句，選出最適合的回應' },
  { part: 3, label: '簡短對話', desc: '兩人對話，每段 3 題' },
  { part: 4, label: '簡短獨白', desc: '廣播、留言、公告，每段 3 題' },
]

export interface SpokenLine {
  voice: Voice
  text: string
}

export interface ListeningGroup {
  id: string
  part: ListeningPart
  /** 音檔類型，例如 Announcement（Part 4） */
  label?: string
  /** 要念出來的內容，依序播放 */
  audio: SpokenLine[]
  /** 對完答案後顯示的逐字稿 */
  transcript: SpokenLine[]
  questions: ReadingQuestion[]
}

export interface ListeningTest {
  id: string
  name: string
  groups: ListeningGroup[]
}

const LETTER_NAMES = ['A', 'B', 'C']
const other = (v: Voice): Voice => (v === 'M' ? 'W' : 'M')

function buildTest(raw: RawListening): ListeningTest {
  const groups: ListeningGroup[] = []
  // 正式考試的題號：Part 2 從 7、Part 3 從 32、Part 4 從 71
  let number = 7
  raw.part2.forEach((item, i) => {
    const id = `${raw.id}-2-${i}`
    const question = buildQuestion({ q: item.q, o: item.o, ex: item.ex }, `${id}-0`, number++, 'p2')
    const asker: Voice = i % 2 === 0 ? 'W' : 'M'
    groups.push({
      id,
      part: 2,
      audio: [
        { voice: asker, text: item.q },
        ...question.options.map((o, k) => ({ voice: other(asker), text: `${LETTER_NAMES[k]}. ${o}` })),
      ],
      transcript: [{ voice: asker, text: item.q }],
      questions: [question],
    })
  })
  number = 32
  raw.part3.forEach((item, i) => {
    const id = `${raw.id}-3-${i}`
    const lines = item.lines.map(([voice, text]) => ({ voice, text }))
    groups.push({ id, part: 3, audio: lines, transcript: lines, questions: item.qs.map((q, k) => buildQuestion(q, `${id}-${k}`, number++, 'p3')) })
  })
  number = 71
  raw.part4.forEach((item, i) => {
    const id = `${raw.id}-4-${i}`
    const lines = [{ voice: item.voice, text: item.text }]
    groups.push({
      id,
      part: 4,
      label: item.label,
      audio: lines,
      transcript: lines,
      questions: item.qs.map((q, k) => buildQuestion(q, `${id}-${k}`, number++, 'p4')),
    })
  })
  return { id: raw.id, name: raw.name, groups }
}

export const LISTENING_TESTS: ListeningTest[] = [LISTENING_1].map(buildTest)

export const LISTENING_HISTORY_KEY = 'lifemaster.listeningHistory'

export interface ListeningRecord {
  date: string
  testId: string
  part: ListeningPart
  correct: number
  total: number
}
