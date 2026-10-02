// 進階字彙：AI 依主題列出中高級～高級的常用字（不含現有的學測、多益字），補上中文、英英、例句，輸出 src/data/advanced.json。
// 執行：npx tsx scripts/gen-advanced-words.ts（主題清單與解釋都會快取在 wordlists/，中斷後重跑只補沒做完的）
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { WORD_INFO } from '../src/data/toeicWords'

const MODEL = 'gpt-4.1-mini'
const CONCURRENCY = 6
const TARGET = 7000
const MAX_ROUNDS = 4
const TOPIC_CACHE = 'wordlists/adv-topics-cache.json'
const ENRICH_CACHE = 'wordlists/enriched-cache.json'
const OUT = 'src/data/advanced.json'

const key = readFileSync('.env.local', 'utf8')
  .match(/^OPENAI_API_KEY=(.+)$/m)?.[1]
  ?.trim()
  .replace(/^"|"$/g, '')
if (!key) throw new Error('.env.local 裡找不到 OPENAI_API_KEY')

const TOPICS = [
  'emotions and feelings',
  'personality and character',
  'relationships and family',
  'health, illness and medicine',
  'the human body',
  'food, cooking and nutrition',
  'housing and home life',
  'shopping and consumer culture',
  'travel and tourism',
  'geography and landscapes',
  'weather and climate',
  'the environment and pollution',
  'animals and wildlife',
  'plants and agriculture',
  'biology and life science',
  'chemistry and materials',
  'physics and energy',
  'astronomy and space',
  'mathematics and statistics',
  'computers and the internet',
  'artificial intelligence and technology trends',
  'engineering and inventions',
  'transportation and vehicles',
  'cities and urban life',
  'architecture and design',
  'art and painting',
  'music and performance',
  'film, television and media',
  'literature and writing',
  'language and linguistics',
  'history and civilizations',
  'politics and government',
  'law, crime and justice',
  'war, conflict and peace',
  'economics and trade',
  'money, banking and investing',
  'business strategy and management',
  'work, careers and the workplace',
  'education and learning',
  'psychology and the mind',
  'philosophy and ethics',
  'religion and beliefs',
  'society and social issues',
  'sports and competition',
  'leisure and hobbies',
  'fashion and appearance',
  'communication and conversation',
  'argument, debate and persuasion',
  'describing change and trends',
  'describing quantity, size and degree',
  'describing time and frequency',
  'cause, effect and reasoning',
  'academic writing and research',
  'news and current events',
  'disasters and emergencies',
  'manners, customs and culture',
  'migration and globalization',
  'science fiction and imagination',
  'everyday actions and movement',
  'sounds, light and the senses',
]

interface TopicWord {
  w: string
  pos: string
  f: number
  c: string[]
}
interface Enriched {
  zh: string
  def: string
  ex: string
  exZh: string
  syn: string[]
  ant: string[]
}

const usage = { input: 0, output: 0 }
async function chat(system: string, user: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      })
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
      const data = (await res.json()) as { choices: { message: { content: string } }[]; usage: { prompt_tokens: number; completion_tokens: number } }
      usage.input += data.usage.prompt_tokens
      usage.output += data.usage.completion_tokens
      return data.choices[0].message.content
    } catch (err) {
      if (attempt >= 3) throw err
      await new Promise(r => setTimeout(r, 3000 * attempt))
    }
  }
}

async function pool<T>(items: T[], fn: (item: T) => Promise<void>) {
  const queue = [...items]
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
        try {
          await fn(item)
        } catch (err) {
          console.error('失敗', String(err).slice(0, 200))
        }
      }
    }),
  )
}

// 已經有的字（多益內建、學測、多益擴充）不再收
const existing = new Set(WORD_INFO.map(w => w.word.toLowerCase()))
for (const row of JSON.parse(readFileSync('src/data/vocab.json', 'utf8')) as string[][]) existing.add(row[0].toLowerCase())
for (const row of JSON.parse(readFileSync('src/data/toeic-extra.json', 'utf8')) as string[][]) existing.add(row[0].toLowerCase())

const topicCache: Record<string, TopicWord[]> = existsSync(TOPIC_CACHE) ? JSON.parse(readFileSync(TOPIC_CACHE, 'utf8')) : {}
const SYSTEM =
  'You are an English vocabulary expert for Taiwanese university students preparing for GEPT upper-intermediate/advanced, IELTS and TOEFL. ' +
  'List single English words (no phrases; hyphenated words only if they are standard dictionary entries) that are genuinely useful for the topic. ' +
  'Skip basic words a high-school student already knows (e.g. happy, travel, money). ' +
  'For each: w (base form, correctly spelled), pos (n., v., adj., adv., or combos like v./n.), ' +
  'f (difficulty: 1 = upper-intermediate and common, 2 = advanced, 3 = academic/rare), ' +
  'c (2–3 real words learners easily confuse with it: similar spelling, same prefix/suffix, or same topic with a different meaning). ' +
  'Return JSON {"words":[{"w":"","pos":"","f":1,"c":[]}]} with about 150 words.'

const topicWords = (topic: string) =>
  Object.entries(topicCache)
    .filter(([k]) => k.split('#')[0] === topic)
    .flatMap(([, ws]) => ws)
const real = (w: string) => /^[a-z][a-z-]*$/i.test(w) && (w.match(/-/g)?.length ?? 0) <= 1
const uniqueNew = () =>
  new Set(
    Object.values(topicCache)
      .flatMap(ws => ws.map(w => w.w.toLowerCase()))
      .filter(w => !existing.has(w) && real(w)),
  ).size

for (let round = 1; round <= MAX_ROUNDS; round++) {
  if (uniqueNew() >= TARGET * 1.1) break
  const keyOf = (t: string) => (round === 1 ? t : `${t}#${round}`)
  await pool(
    TOPICS.filter(t => !topicCache[keyOf(t)]),
    async topic => {
      const have = topicWords(topic).map(w => w.w)
      const prompt =
        round === 1
          ? `Topic: ${topic}`
          : `Topic: ${topic}\nAlready listed (do NOT repeat these): ${have.join(', ')}\nList about 150 additional, different words for this topic.`
      const json = JSON.parse(await chat(SYSTEM, prompt)) as { words: TopicWord[] }
      topicCache[keyOf(topic)] = json.words.filter(w => real(w.w ?? ''))
      writeFileSync(TOPIC_CACHE, JSON.stringify(topicCache))
    },
  )
  console.log(`第 ${round} 輪完成，目前新字 ${uniqueNew()} 個`)
}

const merged = new Map<string, { word: string; pos: string; f: number; topics: number[]; conf: Set<string> }>()
TOPICS.forEach((topic, ti) => {
  for (const w of topicWords(topic)) {
    const k = w.w.toLowerCase()
    if (existing.has(k)) continue
    const cur = merged.get(k)
    const f = Math.min(3, Math.max(1, Math.round(w.f) || 2))
    if (!cur) merged.set(k, { word: w.w.toLowerCase(), pos: w.pos || 'n.', f, topics: [ti], conf: new Set(w.c ?? []) })
    else {
      cur.f = Math.min(cur.f, f)
      if (!cur.topics.includes(ti)) cur.topics.push(ti)
      for (const c of w.c ?? []) cur.conf.add(c)
    }
  }
})
// 出現在越多主題越常用，排前面
const picked = [...merged.entries()].sort(([, a], [, b]) => a.f - b.f || b.topics.length - a.topics.length).slice(0, TARGET)
console.log(`合併後 ${merged.size} 個新字，取 ${picked.length} 個`)

const enrichCache: Record<string, Enriched> = existsSync(ENRICH_CACHE) ? JSON.parse(readFileSync(ENRICH_CACHE, 'utf8')) : {}
const ENRICH =
  '你是台灣的大學英文老師，幫學生編單字卡。對每個單字輸出：' +
  'zh：繁體中文（台灣用語）解釋，依括號中的詞性，最多三個意思，用「；」分隔，簡潔；' +
  'def：簡單的英英解釋（一句，15 字以內）；ex：一句自然的英文例句（12–18 字，必須包含這個單字）；exZh：例句的自然繁體中文翻譯；' +
  'syn：最多 2 個常見同義詞；ant：最多 2 個常見反義詞（沒有就空陣列）。' +
  '如果這不是真正的英文單字或拼錯了，zh 填空字串。' +
  '輸出 JSON：{"words":[{"w":"單字","zh":"","def":"","ex":"","exZh":"","syn":[],"ant":[]}]}，順序與輸入相同。'
const todo = picked.filter(([k]) => !enrichCache[k])
console.log(`需要產生解釋 ${todo.length} 字`)
const batches: (typeof todo)[] = []
for (let i = 0; i < todo.length; i += 40) batches.push(todo.slice(i, i + 40))
let done = 0
await pool(batches, async batch => {
  const words = (JSON.parse(await chat(ENRICH, batch.map(([, e]) => `${e.word} (${e.pos})`).join('\n'))) as { words: (Enriched & { w: string })[] }).words
  for (const [k, e] of batch) {
    const hit = words.find(w => w.w?.toLowerCase() === e.word)
    if (hit?.zh && hit.ex) enrichCache[k] = { zh: hit.zh, def: hit.def ?? '', ex: hit.ex, exZh: hit.exZh ?? '', syn: hit.syn ?? [], ant: hit.ant ?? [] }
  }
  if (++done % 20 === 0) {
    writeFileSync(ENRICH_CACHE, JSON.stringify(enrichCache))
    console.log(`${done}/${batches.length} 批完成`)
  }
})
writeFileSync(ENRICH_CACHE, JSON.stringify(enrichCache))

const cleanZh = (zh: string, pos = '') =>
  pos.includes('/')
    ? zh
    : zh
        .replace(/[（(]\s*(?:n|v|adj|adv|prep|conj)\.?\s*[)）]/g, '')
        .replace(/\s+；/g, '；')
        .trim()

// 輸出：[單字, 詞性, 中文, 英英, 例句, 例句翻譯, 同義, 反義, 難度 1–3, 易混淆字]
const rows = picked
  .filter(([k]) => enrichCache[k])
  .map(([k, e]) => {
    const c = enrichCache[k]
    return [
      e.word,
      e.pos,
      cleanZh(c.zh, e.pos),
      c.def,
      c.ex,
      c.exZh,
      c.syn.join(', '),
      c.ant.join(', '),
      e.f,
      [...e.conf]
        .filter(w => w.toLowerCase() !== k)
        .slice(0, 4)
        .join(', '),
    ]
  })
writeFileSync(OUT, JSON.stringify(rows))
console.log(
  `輸出 ${rows.length} 字到 ${OUT}；token 輸入 ${usage.input}、輸出 ${usage.output}，約 $${((usage.input * 0.4 + usage.output * 1.6) / 1e6).toFixed(2)}`,
)
