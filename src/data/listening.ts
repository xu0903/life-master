import { LISTENING_1 } from './listening1'
import { LISTENING_2 } from './listening2'
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
  /** 預先產生的真人化語音檔名（public/audio/ 底下）；檔案不存在時改用裝置語音 */
  audio?: string
}

// 預錄語音用的聲音與口音：每一題輪流換人、換口音，比照正式考試有美、英、澳腔
export const TTS_VOICES: Record<Voice, string[]> = { W: ['coral', 'nova', 'shimmer'], M: ['onyx', 'echo', 'ash'] }
export const TTS_ACCENTS = ['American', 'British', 'Australian']

/** FNV-1a：用「聲音 + 口音 + 內容」算出固定檔名，內容改了就會是新檔案 */
function hash(text: string): string {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0')
}

export interface TtsSpec {
  voice: string
  accent: string
}

/** 第 n 個題組裡，男聲 / 女聲各用哪個聲音與口音 */
export function ttsSpec(groupIndex: number, voice: Voice): TtsSpec {
  const voices = TTS_VOICES[voice]
  return { voice: voices[groupIndex % voices.length], accent: TTS_ACCENTS[groupIndex % TTS_ACCENTS.length] }
}

export function audioFileName(spec: TtsSpec, text: string): string {
  return `${hash(`${spec.voice}|${spec.accent}|${text}`)}.mp3`
}

function withAudio(lines: SpokenLine[], groupIndex: number): SpokenLine[] {
  // 同一題裡男聲、女聲各固定一個人；Part 2 的題目和選項本來就是不同性別的人念
  return lines.map(line => ({ ...line, audio: audioFileName(ttsSpec(groupIndex, line.voice), line.text) }))
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
      audio: withAudio(
        [{ voice: asker, text: item.q }, ...question.options.map((o, k) => ({ voice: other(asker), text: `${LETTER_NAMES[k]}. ${o}` }))],
        i,
      ),
      transcript: [{ voice: asker, text: item.q }],
      questions: [question],
    })
  })
  number = 32
  raw.part3.forEach((item, i) => {
    const id = `${raw.id}-3-${i}`
    const lines = item.lines.map(([voice, text]) => ({ voice, text }))
    groups.push({ id, part: 3, audio: withAudio(lines, i), transcript: lines, questions: item.qs.map((q, k) => buildQuestion(q, `${id}-${k}`, number++, 'p3')) })
  })
  number = 71
  raw.part4.forEach((item, i) => {
    const id = `${raw.id}-4-${i}`
    const lines = [{ voice: item.voice, text: item.text }]
    groups.push({
      id,
      part: 4,
      label: item.label,
      audio: withAudio(lines, i),
      transcript: lines,
      questions: item.qs.map((q, k) => buildQuestion(q, `${id}-${k}`, number++, 'p4')),
    })
  })
  return { id: raw.id, name: raw.name, groups }
}

export const LISTENING_TESTS: ListeningTest[] = [LISTENING_1, LISTENING_2].map(buildTest)

export const LISTENING_HISTORY_KEY = 'lifemaster.listeningHistory'

export interface ListeningRecord {
  date: string
  testId: string
  part: ListeningPart
  correct: number
  total: number
}
