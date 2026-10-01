// 產生多益常考字表（AI 依主題列出常考字、標常考程度與易混淆字），再補上中文、英英、例句，輸出 src/data/toeic-extra.json。
// 執行：npx tsx scripts/gen-toeic-words.ts
// 主題清單與解釋都會快取在 wordlists/，中斷後重跑只會補沒做完的。
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { WORD_INFO } from '../src/data/toeicWords'

const MODEL = 'gpt-4.1-mini'
const CONCURRENCY = 6
const TARGET = 4000
const TOPIC_CACHE = 'wordlists/toeic-topics-cache.json'
const ENRICH_CACHE = 'wordlists/enriched-cache.json'
const OUT = 'src/data/toeic-extra.json'

const key = readFileSync('.env.local', 'utf8')
  .match(/^OPENAI_API_KEY=(.+)$/m)?.[1]
  ?.trim()
  .replace(/^"|"$/g, '')
if (!key) throw new Error('.env.local 裡找不到 OPENAI_API_KEY')

const TOPICS = [
  'office administration and daily office work',
  'hiring, job applications and recruitment',
  'human resources, employee benefits and payroll',
  'meetings, conferences and presentations',
  'business letters, email and memos',
  'marketing, advertising and promotion',
  'sales and customer service',
  'retail stores and shopping',
  'purchasing, ordering and suppliers',
  'shipping, delivery and logistics',
  'manufacturing, factories and production',
  'product development and quality control',
  'finance and accounting',
  'banking, loans and investment',
  'budgets, costs and taxes',
  'contracts, agreements and legal matters',
  'company management and corporate strategy',
  'economy, trade and markets',
  'real estate, leasing and property',
  'construction, renovation and repairs',
  'office equipment and supplies',
  'computers, software, internet and IT support',
  'air travel, airports and flights',
  'hotels, reservations and accommodation',
  'restaurants, dining and catering',
  'entertainment, events, tickets and the arts',
  'health care, medical appointments and insurance',
  'transportation, commuting and vehicles',
  'media, publishing, news and journalism',
  'research, laboratories and science',
  'environment, energy and sustainability',
  'education, training courses and workshops',
  'government, public services and the community',
  'weather, outdoor activities and leisure',
  'housing, utilities and building maintenance',
  'performance reviews, promotions and careers',
  'negotiations, partnerships and mergers',
  'complaints, refunds, warranties and returns',
  'schedules, time, deadlines and planning',
  'TOEIC Part 5 high-frequency adverbs, conjunctions, prepositions and collocations',
  'payments, bills and personal finance',
  'pharmacies, clinics and wellness',
  'sports, gyms and fitness clubs',
  'museums, galleries and tourism',
  'agriculture, food production and groceries',
  'car rental, automobiles and repairs',
  'postal services, packages and couriers',
  'telephone calls, voicemail and messages',
  'job interviews, resumes and references',
  'workplace safety, rules and regulations',
  'architecture, interior design and furniture',
  'fashion, apparel and textiles',
  'electronics and home appliances',
  'charities, nonprofits and volunteering',
  'awards, ceremonies and celebrations',
  'surveys, statistics, charts and reports',
  'parking, traffic and road work',
  'office relocation, moving and storage',
  'libraries, bookstores and publishing houses',
  'teamwork, leadership and workplace communication',
]
/** 字不夠時，每個主題最多再追加幾輪（給模型看已列過的字，請它列不同的字） */
const MAX_ROUNDS = 4

interface TopicWord {
  w: string
  pos: string
  /** 1 = 非常常考 … 5 = 進階少見 */
  f: number
  /** 容易搞混的字（拼字相近、同字首字尾或同主題） */
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

// ---------- 1. 依主題列出常考字 ----------
const topicCache: Record<string, TopicWord[]> = existsSync(TOPIC_CACHE) ? JSON.parse(readFileSync(TOPIC_CACHE, 'utf8')) : {}
const TOPIC_SYSTEM =
  'You are an experienced TOEIC instructor. List single English words (no phrases; hyphenated words are fine) that frequently appear on the TOEIC Listening & Reading test for the given topic, ' +
  'most frequent first. Include nouns, verbs, adjectives and adverbs a learner aiming for 600–900 must know. Skip very basic words a junior-high student already knows (e.g. go, big, happy). ' +
  'For each word give: w (base form), pos (one of n., v., adj., adv., prep., conj., or combos like v./n.), ' +
  'f (how often it appears on TOEIC: 1 = extremely common, 2 = common, 3 = moderately common, 4 = occasional, 5 = advanced/rare), ' +
  'c (2–3 real English words learners easily confuse with it: similar spelling, same prefix or suffix, or same topic with a different meaning, e.g. adapt → adopt, adept; employer → employee, employment). ' +
  'Return JSON {"words":[{"w":"","pos":"","f":1,"c":[]}]} with about 160 words.'

const core = new Set(WORD_INFO.map(w => w.word.toLowerCase()))
const topicWords = (topic: string) =>
  Object.entries(topicCache)
    .filter(([k]) => k.split('#')[0] === topic)
    .flatMap(([, ws]) => ws)
const uniqueNew = () =>
  new Set(
    Object.values(topicCache)
      .flatMap(ws => ws.map(w => w.w.toLowerCase()))
      .filter(w => !core.has(w)),
  ).size

for (let round = 1; round <= MAX_ROUNDS; round++) {
  if (round > 1 && uniqueNew() >= TARGET) break
  const keyOf = (t: string) => (round === 1 ? t : `${t}#${round}`)
  await pool(
    TOPICS.filter(t => !topicCache[keyOf(t)]),
    async topic => {
      const have = topicWords(topic).map(w => w.w)
      const prompt =
        round === 1
          ? `Topic: ${topic}`
          : `Topic: ${topic}
Already listed (do NOT repeat these): ${have.join(', ')}
List about 150 additional, different TOEIC words for this topic (less frequent ones are fine).`
      const json = JSON.parse(await chat(TOPIC_SYSTEM, prompt)) as { words: TopicWord[] }
      topicCache[keyOf(topic)] = json.words.filter(w => /^[A-Za-z][A-Za-z-]*$/.test(w.w ?? ''))
      writeFileSync(TOPIC_CACHE, JSON.stringify(topicCache))
    },
  )
  console.log(`第 ${round} 輪完成，目前新字 ${uniqueNew()} 個`)
}

// 合併各主題：常考程度取最常考的那個，出現在越多主題越常考
const merged = new Map<string, { word: string; pos: string; f: number; topics: string[]; conf: Set<string> }>()
TOPICS.forEach((topic, ti) => {
  for (const w of topicWords(topic)) {
    const k = w.w.toLowerCase()
    const cur = merged.get(k)
    if (!cur)
      merged.set(k, { word: w.w, pos: w.pos || 'n.', f: Math.min(5, Math.max(1, Math.round(w.f) || 3)), topics: [String(ti)], conf: new Set(w.c ?? []) })
    else {
      cur.f = Math.min(cur.f, Math.round(w.f) || 3)
      cur.topics.push(String(ti))
      for (const c of w.c ?? []) cur.conf.add(c)
    }
  }
})
const score = (e: { f: number; topics: string[] }) => e.f - Math.min(1, (e.topics.length - 1) * 0.25)

// 模型會把片語硬接成連字號字（call-center-analytics、warm-up-exercise），只留真的有連字號寫法的字
const HYPHENATED = new Set(
  'check-in check-out full-time part-time air-conditioning air-conditioner warm-up cool-down in-flight pick-up drop-off first-aid follow-up carry-on cost-effective just-in-time write-off write-up no-show sold-out co-pay fuel-efficient energy-saving pet-friendly user-friendly self-motivation self-discipline self-assessment self-directed cross-sell cross-functional cross-country cross-training sit-up push-up pull-up out-of-stock break-even team-building time-management non-perishable flat-rate long-distance speed-dial dry-clean line-up call-waiting high-intensity carbon-neutral battery-operated community-based pre-boarding ride-share interest-bearing performance-based on-site long-term short-term well-known up-to-date state-of-the-art'.split(
    ' ',
  ),
)
// 動詞的 -ing 形不另外收（原形已經有了）
const ING_FORMS = new Set('discounting featuring debiting cancelling cataloging prioritizing inventorying palletizing'.split(' '))
const realWord = (k: string) => (!k.includes('-') || HYPHENATED.has(k)) && !ING_FORMS.has(k)
const picked = [...merged.entries()]
  .filter(([k]) => !core.has(k) && realWord(k))
  .sort(([, a], [, b]) => score(a) - score(b))
  .slice(0, TARGET)
console.log(`合併後 ${merged.size} 字，扣掉現有多益題庫後取 ${picked.length} 字`)

// ---------- 2. 補中文、英英、例句（學測字表做過的直接沿用） ----------
const enrichCache: Record<string, Enriched> = existsSync(ENRICH_CACHE) ? JSON.parse(readFileSync(ENRICH_CACHE, 'utf8')) : {}
const ENRICH_SYSTEM =
  '你是台灣的多益老師，幫學生編單字卡。對每個單字輸出：' +
  'zh：繁體中文（台灣用語）解釋，依括號中的詞性，以多益／職場常用的意思為主，最多三個意思，用「；」分隔，簡潔；' +
  'def：給學習者看的簡單英英解釋（一句，15 字以內）；' +
  'ex：一句自然的職場或生活情境英文例句（12 字左右，必須包含這個單字）；' +
  'exZh：例句的自然繁體中文翻譯；' +
  'syn：最多 2 個常見同義詞（沒有就空陣列）；ant：最多 2 個常見反義詞（沒有就空陣列）。' +
  '輸出 JSON：{"words":[{"w":"單字","zh":"","def":"","ex":"","exZh":"","syn":[],"ant":[]}]}，順序與輸入相同。'

const todo = picked.filter(([k]) => !enrichCache[k])
console.log(`需要產生解釋 ${todo.length} 字`)
const batches: (typeof todo)[] = []
for (let i = 0; i < todo.length; i += 40) batches.push(todo.slice(i, i + 40))
let done = 0
await pool(batches, async batch => {
  const list = batch.map(([, e]) => `${e.word} (${e.pos})`).join('\n')
  const words = (JSON.parse(await chat(ENRICH_SYSTEM, list)) as { words: (Enriched & { w: string })[] }).words
  for (const [k, e] of batch) {
    const hit = words.find(w => w.w?.toLowerCase() === e.word.toLowerCase())
    if (hit?.zh && hit.ex) enrichCache[k] = { zh: hit.zh, def: hit.def ?? '', ex: hit.ex, exZh: hit.exZh ?? '', syn: hit.syn ?? [], ant: hit.ant ?? [] }
  }
  if (++done % 10 === 0) {
    writeFileSync(ENRICH_CACHE, JSON.stringify(enrichCache))
    console.log(`${done}/${batches.length} 批完成`)
  }
})
writeFileSync(ENRICH_CACHE, JSON.stringify(enrichCache))

// 只有一種詞性時拿掉中文裡多餘的詞性標註
const cleanZh = (zh: string, pos = '') =>
  pos.includes('/')
    ? zh
    : zh
        .replace(/[（(]\s*(?:n|v|adj|adv|prep|conj)\.?\s*[)）]/g, '')
        .replace(/\s+；/g, '；')
        .trim()

// 輸出：[單字, 詞性, 中文, 英英, 例句, 例句翻譯, 同義, 反義, 常考程度 1–5, 主題編號（可多個）, 易混淆字]
const rows = picked
  .filter(([k]) => enrichCache[k])
  .map(([k, e]) => {
    const c = enrichCache[k]
    const conf = [...e.conf].filter(w => w.toLowerCase() !== k).slice(0, 4)
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
      [...new Set(e.topics.map(Number))],
      conf.join(', '),
    ]
  })
writeFileSync(OUT, JSON.stringify(rows))
// 內建多益題庫的字也記下主題，主題分類練習才會包含它們
const coreTopics = Object.fromEntries([...merged.entries()].filter(([k]) => core.has(k)).map(([k, e]) => [k, [...new Set(e.topics.map(Number))]]))
writeFileSync('src/data/toeic-core-topics.json', JSON.stringify(coreTopics))
// gpt-4.1-mini 定價（每百萬 token）：輸入約 $0.40、輸出約 $1.60，以官網為準
console.log(
  `輸出 ${rows.length} 字到 ${OUT}；本次 token：輸入 ${usage.input}、輸出 ${usage.output}，約 $${((usage.input * 0.4 + usage.output * 1.6) / 1e6).toFixed(2)}`,
)
