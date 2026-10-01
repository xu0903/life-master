// 用 OpenAI 語音合成把聽力題目預先產生成 mp3，放在 public/audio/。
// 執行：npx tsx scripts/gen-audio.ts（金鑰放在 .env.local 的 OPENAI_API_KEY，不會進版本庫）
// 已經存在的檔案會跳過，所以題目改了只會補產生有變動的句子。
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { LISTENING_TESTS, TTS_ACCENTS, TTS_VOICES, audioFileName } from '../src/data/listening'

const OUT = 'public/audio'
const MODEL = 'gpt-4o-mini-tts'
const CONCURRENCY = 4

const key = readFileSync('.env.local', 'utf8').match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim().replace(/^"|"$/g, '')
if (!key) throw new Error('.env.local 裡找不到 OPENAI_API_KEY')

// 檔名是由「聲音 + 口音 + 內容」算出來的，反推出每個檔案要用的聲音與口音
interface Job {
  file: string
  text: string
  voice: string
  accent: string
}
const jobs = new Map<string, Job>()
for (const test of LISTENING_TESTS) {
  for (const group of test.groups) {
    for (const line of group.audio) {
      if (!line.audio) continue
      const pool = TTS_VOICES[line.voice]
      const spec = pool.flatMap(voice => TTS_ACCENTS.map(accent => ({ voice, accent }))).find(s => audioFileName(s, line.text) === line.audio)
      if (!spec) throw new Error(`找不到對應的聲音：${line.text}`)
      jobs.set(line.audio, { file: line.audio, text: line.text, ...spec })
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
      instructions: `Speak with a natural ${job.accent} English accent, like a professional voice actor recording a TOEIC listening test: clear, warm, conversational, moderate pace, natural intonation.`,
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
