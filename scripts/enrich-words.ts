// 幫官方字表的單字補上中文解釋、英英解釋、例句（用 OpenAI 產生），輸出 src/data/vocab.json。
// 執行：python scripts/parse-wordlists.py && npx tsx scripts/enrich-words.ts
// 已經產生過的字會存在 wordlists/enriched-cache.json，中斷後重跑只會補沒做完的。
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { WORD_INFO } from '../src/data/toeicWords'

const MODEL = 'gpt-4.1-mini'
const BATCH = 40
const CONCURRENCY = 6
const CACHE = 'wordlists/enriched-cache.json'
const OUT = 'src/data/vocab.json'

const key = readFileSync('.env.local', 'utf8').match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim().replace(/^"|"$/g, '')
if (!key) throw new Error('.env.local 裡找不到 OPENAI_API_KEY')

interface Parsed {
  ceec: { raw: string; word: string; pos: string; level: number }[]
  gept: { word: string; pos: string; level: number }[]
}
interface Enriched {
  zh: string
  def: string
  ex: string
  exZh: string
  syn: string[]
  ant: string[]
}

const parsed = JSON.parse(readFileSync('wordlists/parsed.json', 'utf8')) as Parsed

// 合併兩份字表：同一個字記下各自的級別，詞性以學測表為主
const entries = new Map<string, { word: string; pos: string; ceec?: number; gept?: number }>()
for (const e of parsed.ceec) {
  const k = e.word.toLowerCase()
  const cur = entries.get(k)
  if (!cur) entries.set(k, { word: e.word, pos: e.pos, ceec: e.level })
  else cur.ceec = Math.min(cur.ceec ?? 9, e.level)
}
const geptPos = (p: string) => p.replace(/noun/g, 'n.').replace(/verb/g, 'v.').replace(/determiner/g, 'det.').replace(/number/g, 'num.')
for (const e of parsed.gept) {
  const k = e.word.toLowerCase()
  const cur = entries.get(k)
  if (!cur) entries.set(k, { word: e.word, pos: geptPos(e.pos), gept: e.level })
  else cur.gept = Math.min(cur.gept ?? 9, e.level)
}

// 多益題庫裡已經有的字，直接沿用現成的解釋與例句
const toeic = new Map(WORD_INFO.map(w => [w.word.toLowerCase(), w]))
const cache: Record<string, Enriched> = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
for (const [k, w] of toeic) {
  if (entries.has(k) && !cache[k]) cache[k] = { zh: w.zh, def: w.def, ex: w.ex, exZh: w.exZh, syn: w.syn, ant: w.ant }
}

const todo = [...entries.entries()].filter(([k]) => !cache[k])
console.log(`共 ${entries.size} 字，需要產生 ${todo.length} 字`)

const levelHint = (e: { ceec?: number; gept?: number }) =>
  e.ceec ? `學測第${e.ceec}級` : e.gept === 1 ? '英檢初級' : e.gept === 2 ? '英檢中級' : '英檢中高級'

async function enrich(batch: [string, { word: string; pos: string; ceec?: number; gept?: number }][]) {
  const list = batch.map(([, e]) => `${e.word} (${e.pos}; ${levelHint(e)})`).join('\n')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '你是台灣高中英文老師，幫學生編單字卡。對每個單字輸出：' +
            'zh：繁體中文（台灣用語）解釋，依括號中的詞性，最多三個意思，用「；」分隔，簡潔；' +
            'def：給學習者看的簡單英英解釋（一句，15 字以內）；' +
            'ex：一句自然、符合該級別難度的英文例句（12 字左右，必須包含這個單字）；' +
            'exZh：例句的自然繁體中文翻譯；' +
            'syn：最多 2 個常見同義詞（沒有就空陣列）；ant：最多 2 個常見反義詞（沒有就空陣列）。' +
            '輸出 JSON：{"words":[{"w":"單字","zh":"","def":"","ex":"","exZh":"","syn":[],"ant":[]}]}，順序與輸入相同。',
        },
        { role: 'user', content: list },
      ],
    }),
  })
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
  const data = (await res.json()) as { choices: { message: { content: string } }[]; usage: { prompt_tokens: number; completion_tokens: number } }
  usage.input += data.usage.prompt_tokens
  usage.output += data.usage.completion_tokens
  const words = (JSON.parse(data.choices[0].message.content) as { words: (Enriched & { w: string })[] }).words
  for (const [k, e] of batch) {
    const hit = words.find(w => w.w?.toLowerCase() === e.word.toLowerCase())
    if (hit?.zh && hit.ex) cache[k] = { zh: hit.zh, def: hit.def ?? '', ex: hit.ex, exZh: hit.exZh ?? '', syn: hit.syn ?? [], ant: hit.ant ?? [] }
  }
}

const usage = { input: 0, output: 0 }
const batches: (typeof todo)[] = []
for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH))
let done = 0
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let b = batches.shift(); b; b = batches.shift()) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await enrich(b)
          break
        } catch (err) {
          if (attempt === 3) console.error('批次失敗', String(err).slice(0, 200))
          else await new Promise(r => setTimeout(r, 3000 * attempt))
        }
      }
      done++
      if (done % 10 === 0) {
        writeFileSync(CACHE, JSON.stringify(cache))
        console.log(`${done} 批完成`)
      }
    }
  }),
)
writeFileSync(CACHE, JSON.stringify(cache))

// 統一中文解釋裡的詞性標註：模型有時寫 (adj.)、（名詞）等不同格式。
// 只有一種詞性時直接拿掉（卡片上已經顯示詞性），多種詞性時統一成全形括號的英文縮寫。
const POS_ZH: Record<string, string> = { 名詞: 'n.', 動詞: 'v.', 形容詞: 'adj.', 副詞: 'adv.', 介系詞: 'prep.', 連接詞: 'conj.', 代名詞: 'pron.' }
function cleanZh(zh: string, pos: string): string {
  const marker = /[（(]\s*((?:n|v|adj|adv|prep|conj|pron|art|aux|interj)\.?(?:\s*\/\s*(?:n|v|adj|adv|prep|conj|pron)\.?)*|名詞|動詞|形容詞|副詞|介系詞|連接詞|代名詞)\s*[)）]/g
  const single = !pos.includes('/')
  return zh
    .replace(marker, (_, tag: string) => (single ? '' : `（${POS_ZH[tag] ?? tag.replace(/\s/g, '')}）`))
    .replace(/\s+；/g, '；')
    .replace(/\s+（/g, '（')
    .replace(/；\s*$/, '')
    .trim()
}

// LTTC 網站明文禁止未經同意重製字表內容（見 docs/content-sources.md），取得授權前預設不輸出英檢資料；
// 取得授權後用 INCLUDE_GEPT=1 重跑（已產生的字會從快取讀取，不會再花費）
const includeGept = process.env.INCLUDE_GEPT === '1'
// 輸出精簡格式：[單字, 詞性, 中文, 英英, 例句, 例句翻譯, 同義, 反義, 學測級別(0=無), 英檢級別(0=無)]
const rows = [...entries.entries()]
  .filter(([k, e]) => cache[k] && (includeGept || e.ceec))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, e]) => {
    const c = cache[k]
    return [e.word, e.pos, cleanZh(c.zh, e.pos), c.def, c.ex, c.exZh, c.syn.join(', '), c.ant.join(', '), e.ceec ?? 0, includeGept ? (e.gept ?? 0) : 0]
  })
writeFileSync(OUT, JSON.stringify(rows))
const missing = [...entries.values()].filter(e => includeGept || e.ceec).length - rows.length
// gpt-4.1-mini 定價（每百萬 token）：輸入約 $0.40、輸出約 $1.60，以官網為準
console.log(`輸出 ${rows.length} 字到 ${OUT}，缺 ${missing} 字；本次 token：輸入 ${usage.input}、輸出 ${usage.output}，約 $${((usage.input * 0.4 + usage.output * 1.6) / 1e6).toFixed(2)}`)
