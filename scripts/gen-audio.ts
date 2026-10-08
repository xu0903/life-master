// 用 OpenAI 語音合成把聽力題目預先產生成 mp3，放在 public/audio/。
// 執行：npx tsx scripts/gen-audio.ts（金鑰放在 .env.local 的 OPENAI_API_KEY，不會進版本庫）
// 已經存在的檔案會跳過，所以題目改了只會補產生有變動的句子。
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { LISTENING_TESTS } from '../src/data/listening'

const OUT = 'public/audio'
const MODEL = 'gpt-4o-mini-tts'
const CONCURRENCY = 4

const key = readFileSync('.env.local', 'utf8')
  .match(/^OPENAI_API_KEY=(.+)$/m)?.[1]
  ?.trim()
  .replace(/^"|"$/g, '')
if (!key) throw new Error('.env.local 裡找不到 OPENAI_API_KEY')

// 檔名是由「聲音 + 口音 + 內容」算出來的，反推出每個檔案要用的聲音與口音
interface Job {
  file: string
  text: string
  voice: string
  accent: string
  /** 依題型與上下文寫的語氣指示 */
  instructions: string
}

const BASE = (accent: string) =>
  `Accent: natural ${accent} English. You are a professional voice actor recording an English listening test, but you must sound like a real person, not a narrator: ` +
  'natural rhythm, connected speech and contractions, varied pitch, short natural pauses at commas and between sentences, no robotic evenness.'

/** 每一句的語氣指示：Part 2 問句 / 選項、Part 3 對話上下文、Part 4 依音檔類型 */
function instructionsFor(group: (typeof LISTENING_TESTS)[number]['groups'][number], index: number, accent: string): string {
  if (group.part === 2) {
    if (index === 0)
      return `${BASE(accent)} Ask this as a coworker speaking casually in an office, with the intonation a real question or remark would have (falling for wh-questions, rising for yes/no questions).`
    return `${BASE(accent)} This is an answer choice. Say the letter, a brief pause, then say the reply naturally, as if you were really answering a coworker. Do not sound like you are reading a list.`
  }
  if (group.part === 3) {
    const prev = group.audio[index - 1]
    const role = index === 0 ? 'You start the conversation.' : `The other person just said: "${prev.text}" Reply to them naturally, reacting to what they said.`
    const end = index === group.audio.length - 1 ? ' This is the last line of the conversation.' : ''
    const people = group.transcript.some(l => l.speaker?.endsWith('2')) ? 'three-person' : 'two-person'
    return `${BASE(accent)} This is one turn in a ${people} workplace conversation (phone call or face to face). ${role}${end} Show appropriate emotion (friendly, apologetic, relieved, surprised) based on the words.`
  }
  const label = group.label ?? 'talk'
  const style = /message/i.test(label)
    ? ' (a person leaving a phone message)'
    : /advert/i.test(label)
      ? ' (an upbeat radio ad)'
      : /broadcast|radio/i.test(label)
        ? ' (a radio host)'
        : /announcement/i.test(label)
          ? ' (a clear public announcement)'
          : ''
  return `${BASE(accent)} Deliver this as a real ${label.toLowerCase()} would sound${style}, with natural pacing and a brief pause between sentences.`
}
const jobs = new Map<string, Job>()
for (const test of LISTENING_TESTS) {
  for (const group of test.groups) {
    for (const [i, line] of group.audio.entries()) {
      if (!line.audio || !line.tts) continue
      jobs.set(line.audio, { file: line.audio, text: line.text, ...line.tts, instructions: instructionsFor(group, i, line.tts.accent) })
    }
  }
}

mkdirSync(OUT, { recursive: true })
const todo = [...jobs.values()].filter(j => !existsSync(`${OUT}/${j.file}`))
console.log(`共 ${jobs.size} 句，需要產生 ${todo.length} 句`)

// 有 ffmpeg 的話轉成單聲道 48kbps，檔案小很多，聽起來差不多
const hasFfmpeg = (() => {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
})()

async function synthesize(job: Job) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      voice: job.voice,
      input: job.text,
      response_format: 'mp3',
      instructions: job.instructions,
    }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const raw = Buffer.from(await res.arrayBuffer())
  const target = `${OUT}/${job.file}`
  if (!hasFfmpeg) return writeFileSync(target, raw)
  const tmp = `${target}.raw.mp3`
  writeFileSync(tmp, raw)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-b:a', '48k', `${target}.tmp.mp3`])
  renameSync(`${target}.tmp.mp3`, target)
  rmSync(tmp)
}

let done = 0
let failed = 0
const queue = [...todo]
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      for (let attempt = 1; ; attempt++) {
        try {
          await synthesize(job)
          break
        } catch (err) {
          if (attempt >= 3) {
            failed++
            console.error(`失敗：${job.text.slice(0, 40)}…`, String(err).slice(0, 200))
            break
          }
          await new Promise(r => setTimeout(r, 2000 * attempt))
        }
      }
      done++
      if (done % 20 === 0) console.log(`${done}/${todo.length}`)
    }
  }),
)
console.log(`完成 ${done - failed} 句，失敗 ${failed} 句${hasFfmpeg ? '' : '（沒有 ffmpeg，未壓縮）'}`)

// 全部成功時，刪掉題目已經不用的舊錄音檔
if (failed === 0) {
  const stale = readdirSync(OUT).filter(f => f.endsWith('.mp3') && !jobs.has(f))
  for (const f of stale) rmSync(`${OUT}/${f}`)
  if (stale.length) console.log(`刪除 ${stale.length} 個舊錄音檔`)
}
