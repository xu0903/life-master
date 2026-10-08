import { LISTENING_1 } from './listening1'
import { LISTENING_2 } from './listening2'
import { LISTENING_3 } from './listening3'
import { buildQuestion } from './reading'
import type { RawQuestion, ReadingQuestion } from './reading'

export type Voice = 'M' | 'W'
/** 三人對話用：M2 / W2 是同性別的第二位說話者，會換成另一個聲音與口音 */
export type Speaker = Voice | 'M2' | 'W2'

/** 難度：basic 是入門到中級；900 比照目標 900 分以上的坊間難度（間接回答、言外之意、看圖表、三人對話） */
export type ListeningLevel = 'basic' | '900'

/** 看圖表作答用的表格（第一列是表頭），例如時刻表、價目表、樓層表 */
export interface Graphic {
  title: string
  rows: string[][]
}

export interface RawListening {
  id: string
  name: string
  level?: ListeningLevel
  /** Part 2 應答問題：題目與三個回應都只用聽的 */
  part2: { q: string; o: [string, string, string]; ex: string }[]
  /** Part 3 簡短對話：每段 3 題 */
  part3: { lines: [Speaker, string][]; graphic?: Graphic; qs: RawQuestion[] }[]
  /** Part 4 簡短獨白：每段 3 題 */
  part4: { label: string; voice: Voice; text: string; graphic?: Graphic; qs: RawQuestion[] }[]
}

export type ListeningPart = 2 | 3 | 4

export const LISTENING_PARTS: { part: ListeningPart; label: string; desc: string }[] = [
  { part: 2, label: '應答問題', desc: '聽問句，選出最適合的回應' },
  { part: 3, label: '簡短對話', desc: '兩到三人對話，每段 3 題' },
  { part: 4, label: '簡短獨白', desc: '廣播、留言、公告，每段 3 題' },
]

export interface SpokenLine {
  voice: Voice
  text: string
  /** 逐字稿上的說話者標示（三人對話才會有 M1 / M2 這種） */
  speaker?: string
  /** 預先產生的真人化語音檔名（public/audio/ 底下）；檔案不存在時改用裝置語音 */
  audio?: string
  /** 預錄用的 AI 聲音與口音 */
  tts?: TtsSpec
  /** 這一句之前要停多久（毫秒）；沒有就用預設 */
  gap?: number
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

/** 錄音版本：改了錄音方式（語氣指示）就加一，檔名會跟著換，手機才不會播到快取的舊檔 */
const AUDIO_VERSION = 2

export function audioFileName(spec: TtsSpec, text: string): string {
  return `${hash(`${spec.voice}|${spec.accent}|v${AUDIO_VERSION}|${text}`)}.mp3`
}

/**
 * 句子之間的停頓：Part 2 問完題目停久一點再念選項；Part 3 對話換人說話時接得快一點，像真的在聊天
 */
function gapFor(part: ListeningPart, index: number): number | undefined {
  if (index === 0) return undefined
  if (part === 2) return index === 1 ? 900 : 650
  if (part === 3) return 280
  return undefined
}

function withAudio(lines: (SpokenLine & { second?: boolean })[], groupIndex: number, part: ListeningPart): SpokenLine[] {
  // 同一題裡男聲、女聲各固定一個人；Part 2 的題目和選項本來就是不同性別的人念；三人對話的第二位同性別說話者換下一組聲音
  return lines.map(({ second, ...line }, i) => {
    const spec = ttsSpec(groupIndex + (second ? 1 : 0), line.voice)
    return { ...line, audio: audioFileName(spec, line.text), tts: spec, gap: gapFor(part, i) }
  })
}

export interface ListeningGroup {
  id: string
  part: ListeningPart
  /** 音檔類型，例如 Announcement（Part 4） */
  label?: string
  /** 看圖表作答的表格 */
  graphic?: Graphic
  /** 要念出來的內容，依序播放 */
  audio: SpokenLine[]
  /** 對完答案後顯示的逐字稿 */
  transcript: SpokenLine[]
  questions: ReadingQuestion[]
}

export interface ListeningTest {
  id: string
  name: string
  level: ListeningLevel
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
      audio: withAudio([{ voice: asker, text: item.q }, ...question.options.map((o, k) => ({ voice: other(asker), text: `${LETTER_NAMES[k]}. ${o}` }))], i, 2),
      transcript: [{ voice: asker, text: item.q }],
      questions: [question],
    })
  })
  number = 32
  raw.part3.forEach((item, i) => {
    const id = `${raw.id}-3-${i}`
    const trio = item.lines.some(([s]) => s.length > 1)
    const lines = item.lines.map(([speaker, text]) => ({
      voice: speaker[0] as Voice,
      text,
      second: speaker.length > 1,
      speaker: trio && item.lines.some(([s]) => s === `${speaker[0]}2`) ? (speaker.length > 1 ? speaker : `${speaker}1`) : speaker,
    }))
    groups.push({
      id,
      part: 3,
      graphic: item.graphic,
      audio: withAudio(lines, i, 4),
      transcript: lines.map(({ second: _, ...line }) => line),
      questions: item.qs.map((q, k) => buildQuestion(q, `${id}-${k}`, number++, 'p3')),
    })
  })
  number = 71
  raw.part4.forEach((item, i) => {
    const id = `${raw.id}-4-${i}`
    const lines = [{ voice: item.voice, text: item.text }]
    groups.push({
      id,
      part: 4,
      label: item.label,
      graphic: item.graphic,
      audio: withAudio(lines, i, 4),
      transcript: lines,
      questions: item.qs.map((q, k) => buildQuestion(q, `${id}-${k}`, number++, 'p4')),
    })
  })
  return { id: raw.id, name: raw.name, level: raw.level ?? 'basic', groups }
}

export const LISTENING_TESTS: ListeningTest[] = [LISTENING_1, LISTENING_2, LISTENING_3].map(buildTest)

export const LISTENING_HISTORY_KEY = 'lifemaster.listeningHistory'

export interface ListeningRecord {
  date: string
  testId: string
  part: ListeningPart
  correct: number
  total: number
  /** 考試模式（只播一次、限時作答） */
  exam?: boolean
}

const ACCENT_LABEL: Record<string, string> = { American: '美式', British: '英式', Australian: '澳式' }

/** 每一種預錄聲音挑一句當試聽範例（取 Part 3、4 的句子，比較長、聽得出語調） */
export interface VoiceSample {
  gender: Voice
  accent: string
  label: string
  line: SpokenLine
}
export const VOICE_SAMPLES: VoiceSample[] = (() => {
  const seen = new Map<string, VoiceSample>()
  for (const test of LISTENING_TESTS) {
    for (const g of test.groups) {
      if (g.part === 2) continue
      for (const line of g.audio) {
        if (!line.tts) continue
        const key = `${line.tts.voice}|${line.tts.accent}`
        if (seen.has(key) || line.text.length < 60) continue
        seen.set(key, {
          gender: line.voice,
          accent: line.tts.accent,
          label: `${line.voice === 'W' ? '女聲' : '男聲'}・${ACCENT_LABEL[line.tts.accent] ?? line.tts.accent}`,
          line,
        })
      }
    }
  }
  // 排成兩欄：左女右男，由上到下美、澳、英
  const order = ['American', 'Australian', 'British']
  return [...seen.values()].sort((a, b) => order.indexOf(a.accent) - order.indexOf(b.accent) || (a.gender === 'W' ? -1 : 1))
})()
