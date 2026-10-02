// 產生閱讀題：3 份完整模擬試題（4–6）＋ Part 5 題庫 ＋ Part 6 題庫，輸出 src/data/reading-tests-extra.json 與 reading-bank.json。
// 每題都會再請模型「不看答案」重做一次，答案對不上、或有兩個選項都說得通的題目直接淘汰。
// 執行：npx tsx scripts/gen-reading.ts（產生過的會快取在 wordlists/reading-cache.json，中斷後重跑只補沒做完的）
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { RawQuestion, RawSet, RawTest } from '../src/data/reading'

const MODEL = 'gpt-4.1'
// gpt-4.1 這個帳號每分鐘只能用 3 萬 token，同時送太多會被擋
const CONCURRENCY = 2
const CACHE = 'wordlists/reading-cache.json'
// 試題跟著 App 一起載入；題庫比較大，另存一個檔案，用到時才下載
const OUT_TESTS = 'src/data/reading-tests-extra.json'
const OUT_BANK = 'src/data/reading-bank.json'
const P5_BANK_BATCHES = 75 // 每批 20 題，淘汰重複與有問題的題目後約 900 題
const P6_BANK_SETS = 100

const key = readFileSync('.env.local', 'utf8')
  .match(/^OPENAI_API_KEY=(.+)$/m)?.[1]
  ?.trim()
  .replace(/^"|"$/g, '')
if (!key) throw new Error('.env.local 裡找不到 OPENAI_API_KEY')

const cache: Record<string, unknown> = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
const save = () => writeFileSync(CACHE, JSON.stringify(cache))
const usage = { input: 0, output: 0 }

async function chat(system: string, user: string, temperature: number): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          temperature,
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
      // 每分鐘用量上限（429）：等久一點再試；額度用完就不用再試了
      const rateLimited = String(err).startsWith('Error: 429') && !String(err).includes('credits')
      if (attempt >= (rateLimited ? 6 : 3)) throw err
      await new Promise(r => setTimeout(r, (rateLimited ? 20000 : 4000) * attempt))
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

const TOPICS = [
  'hiring and onboarding',
  'office relocation',
  'quarterly sales',
  'product launch',
  'customer complaints',
  'shipping delays',
  'hotel reservations',
  'business travel',
  'conference planning',
  'building maintenance',
  'budget approval',
  'software update',
  'training workshop',
  'restaurant opening',
  'real estate leasing',
  'factory safety',
  'marketing campaign',
  'merger announcement',
  'employee awards',
  'community event',
  'museum exhibition',
  'airline policy',
  'bank services',
  'health clinic',
  'retail promotion',
  'supplier contract',
  'job interview',
  'press release',
  'charity fundraiser',
  'public transportation',
  'library services',
  'IT security',
  'catering order',
  'warranty claim',
  'volunteer program',
  'trade show',
  'board meeting',
]
const pick = <T>(arr: T[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

const STYLE =
  'You are an expert TOEIC Reading test writer. Write ORIGINAL items (never copy ETS material) at real TOEIC difficulty, in natural business English. ' +
  'Every item must have exactly ONE defensible answer; distractors must be clearly wrong to an expert but tempting to learners. ' +
  'Explanations ("ex") are in Traditional Chinese (Taiwan usage), 1–2 sentences: why the answer is right and why the most tempting distractor is wrong. ' +
  'Always respond with a single JSON object.'

// ---------- Part 5 ----------
interface GenQ extends RawQuestion {
  a: number
}

// 模型偶爾會把不存在的字當干擾選項（musted、ensurance），這種題目直接淘汰
const FAKE_WORDS =
  /^(?:(?:must|can|will|shall|should|may|might|could|would)(?:ed|ing|s)|ensurance|shortageous|quartly|outstands?|opportunes|detailingly|potentialize)$/i
const hasFakeOption = (q: RawQuestion) => q.o.some(o => FAKE_WORDS.test(o.trim()))

async function genPart5(id: string): Promise<GenQ[]> {
  if (cache[id]) return cache[id] as GenQ[]
  const prompt =
    `Write 20 TOEIC Part 5 (incomplete sentences) questions. Topics: ${pick(TOPICS, 6).join(', ')}. ` +
    'Mix: 6 word-form (tag "pos"), 4 verb tense/voice/form ("verb"), 3 preposition ("prep"), 3 conjunction/transition ("conj"), 1 pronoun/relative ("pron"), 3 vocabulary/collocation ("vocab"). ' +
    'Mark the blank as "-------". 4 options each; "a" is the index of the correct option. Vary sentence length (8–25 words) and difficulty. ' +
    'Return {"items":[{"q":"...","o":["","","",""],"a":0,"tag":"pos","ex":"..."}]}'
  const items = (JSON.parse(await chat(STYLE, prompt, 0.9)) as { items: GenQ[] }).items.filter(
    q => q.q?.includes('-------') && q.o?.length === 4 && q.a >= 0 && q.a < 4 && new Set(q.o).size === 4,
  )
  const ok = await verify(items.map(q => ({ text: q.q, options: q.o, answer: q.a })))
  const kept = items.filter((_, i) => ok[i])
  cache[id] = kept
  save()
  return kept
}

/** 不給答案讓模型重做；答對而且認為只有一個答案的才保留 */
async function verify(items: { text: string; options: string[]; answer: number; context?: string }[]): Promise<boolean[]> {
  if (items.length === 0) return []
  const letters = ['A', 'B', 'C', 'D']
  const body = items
    .map(
      (it, i) =>
        `#${i}${it.context ? `\n${it.context}` : ''}\n${it.text || '(choose the best option for the blank)'}\n${it.options.map((o, k) => `(${letters[k]}) ${o}`).join('\n')}`,
    )
    .join('\n\n')
  const raw = await chat(
    'You are a strict TOEIC answer checker. Solve each item independently. For each, give the single best option letter and "ok": false if the item is flawed, ' +
      'ungrammatical, or if more than one option could reasonably be correct. Return JSON {"results":[{"i":0,"answer":"A","ok":true}]}',
    body,
    0,
  )
  const results = (JSON.parse(raw) as { results: { i: number; answer: string; ok: boolean }[] }).results
  return items.map((it, i) => {
    const r = results.find(x => x.i === i)
    return !!r && r.ok && letters.indexOf(r.answer?.trim().toUpperCase()) === it.answer
  })
}

// ---------- Part 6 ----------
const P6_TYPES = ['E-mail', 'Memo', 'Notice', 'Article', 'Letter', 'Advertisement', 'Web page', 'Press release', 'Announcement', 'Instructions']

async function genPart6(id: string): Promise<RawSet | null> {
  if (id in cache) return cache[id] as RawSet | null
  for (let attempt = 0; attempt < 2; attempt++) {
    const type = pick(P6_TYPES, 1)[0]
    const prompt =
      `Write one TOEIC Part 6 (text completion) item: a ${type} (120–170 words) about ${pick(TOPICS, 1)[0]} with 4 blanks written as {1}, {2}, {3}, {4} in order. ` +
      'Three blanks test word form, verb form, connectors or vocabulary (single words or short phrases); exactly one blank (any position) is a sentence-insertion blank whose 4 options are full sentences and only one fits the context. ' +
      'Include realistic headers (To/From/Subject for e-mails, etc.) in "text". For each question "q" is "", "a" is the correct index. ' +
      'Return {"label":"' +
      type +
      '","text":"...","qs":[{"q":"","o":["","","",""],"a":0,"ex":"..."}]}'
    const set = JSON.parse(await chat(STYLE, prompt, 0.9)) as { label: string; text: string; qs: GenQ[] }
    if (!set.text || set.qs?.length !== 4 || ![1, 2, 3, 4].every(n => set.text.includes(`{${n}}`)) || set.qs.some(q => q.o?.length !== 4)) continue
    const ok = await verify(
      set.qs.map((q, i) => ({ text: `Blank {${i + 1}}`, options: q.o, answer: q.a, context: i === 0 ? set.text : '(same passage as above)' })),
    )
    if (ok.every(Boolean)) {
      cache[id] = { docs: [{ label: set.label, text: set.text }], qs: set.qs.map(q => ({ q: '', o: q.o, a: q.a, ex: q.ex })) }
      save()
      return cache[id] as RawSet
    }
  }
  cache[id] = null
  save()
  return null
}

// ---------- Part 7 ----------
const P7_TYPES = [
  'E-mail',
  'Advertisement',
  'Notice',
  'Article',
  'Text-message chain',
  'Online chat discussion',
  'Form',
  'Invoice',
  'Schedule',
  'Web page',
  'Letter',
  'Review',
  'Memo',
  'Survey results',
]

async function genPart7(id: string, docs: number, questions: number): Promise<RawSet | null> {
  if (id in cache) return cache[id] as RawSet | null
  for (let attempt = 0; attempt < 3; attempt++) {
    const types = pick(P7_TYPES, docs)
    const insertion = docs === 1 && questions >= 3 && Math.random() < 0.35
    const prompt =
      `Write one TOEIC Part 7 reading item with ${docs} related document(s): ${types.join(', ')} (each 90–220 words; text-message chains/online chats use "Name (time): message" lines). Topic: ${pick(TOPICS, 1)[0]}. ` +
      `Write ${questions} questions in TOEIC style, mixing: purpose/main idea, detail, inference ("What is suggested/most likely…"), NOT/TRUE, and vocabulary ("closest in meaning to"). ` +
      (docs > 1 ? 'At least 2 questions must require combining information from different documents. ' : '') +
      (insertion
        ? 'One question must be a sentence-insertion question: put markers [1], [2], [3], [4] in the text, question text: \'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? "…"\', options exactly ["[1]","[2]","[3]","[4]"] and "keep": true. '
        : '') +
      'Each question has 4 options and "a" = index of the correct option. ' +
      'Return {"docs":[{"label":"E-mail","text":"..."}],"qs":[{"q":"...","o":["","","",""],"a":0,"keep":false,"ex":"..."}]}'
    const set = JSON.parse(await chat(STYLE, prompt, 0.9)) as { docs: { label: string; text: string }[]; qs: GenQ[] }
    if (set.docs?.length !== docs || set.qs?.length !== questions || set.qs.some(q => q.o?.length !== 4 || !(q.a >= 0 && q.a < 4))) continue
    const context = set.docs.map((d, i) => `[Document ${i + 1}: ${d.label}]\n${d.text}`).join('\n\n')
    const ok = await verify(set.qs.map((q, i) => ({ text: q.q, options: q.o, answer: q.a, context: i === 0 ? context : undefined })))
    if (ok.every(Boolean)) {
      cache[id] = { docs: set.docs, qs: set.qs.map(q => ({ q: q.q, o: q.o, a: q.a, keep: q.keep || undefined, ex: q.ex })) }
      save()
      return cache[id] as RawSet
    }
  }
  cache[id] = null
  save()
  return null
}

// ---------- 組成試題 ----------
// 正式考試：單篇 29 題、雙篇 2 組 × 5 題、三篇 3 組 × 5 題
const SINGLES = [2, 2, 3, 3, 2, 3, 4, 3, 3, 4]
const DOUBLES = [5, 5]
const TRIPLES = [5, 5, 5]

const tests: RawTest[] = []
for (const n of [4, 5, 6]) {
  const tid = `r${n}`
  console.log(`產生模擬試題 ${n}…`)
  // Part 5：多產生一批，淘汰後取 30 題
  const p5: GenQ[] = []
  for (let b = 0; p5.length < 30 && b < 4; b++) p5.push(...(await genPart5(`${tid}-p5-${b}`)).filter(q => !hasFakeOption(q)))
  const p6: RawSet[] = []
  await pool([0, 1, 2, 3, 4, 5], async i => {
    if (p6.length >= 4) return
    const s = await genPart6(`${tid}-p6-${i}`)
    if (s && p6.length < 4) p6.push(s)
  })
  const p7: RawSet[] = []
  const plan = [...SINGLES.map(q => [1, q]), ...DOUBLES.map(q => [2, q]), ...TRIPLES.map(q => [3, q])]
  await pool(
    plan.map((p, i) => [i, ...p]),
    async ([i, docs, qs]) => {
      const s = await genPart7(`${tid}-p7-${i}`, docs, qs)
      if (s) p7[i] = s
    },
  )
  const full = p7.filter(Boolean)
  console.log(`試題 ${n}：Part 5 ${Math.min(30, p5.length)} 題、Part 6 ${p6.length} 篇、Part 7 ${full.length}/${plan.length} 組`)
  tests.push({ id: tid, name: `模擬試題 ${n}`, part5: p5.slice(0, 30), part6: p6.slice(0, 4), part7: full })
}

console.log('產生 Part 5 題庫…')
const bankP5: GenQ[] = []
await pool(
  Array.from({ length: P5_BANK_BATCHES }, (_, i) => i),
  async i => {
    bankP5.push(...(await genPart5(`bank-p5-${i}`)))
  },
)
// 去掉重複的題目（題幹相同）
const seen = new Set(tests.flatMap(t => t.part5.map(q => q.q.toLowerCase())))
const uniqueP5 = bankP5.filter(q => {
  if (hasFakeOption(q)) return false
  const k = q.q.toLowerCase()
  if (seen.has(k)) return false
  seen.add(k)
  return true
})

console.log('產生 Part 6 題庫…')
const bankP6: RawSet[] = []
await pool(
  Array.from({ length: P6_BANK_SETS }, (_, i) => i),
  async i => {
    const s = await genPart6(`bank-p6-${i}`)
    if (s) bankP6.push(s)
  },
)

writeFileSync(OUT_TESTS, JSON.stringify(tests))
writeFileSync(OUT_BANK, JSON.stringify({ part5: uniqueP5, part6: bankP6 }))
// gpt-4.1 定價（每百萬 token）：輸入約 $2、輸出約 $8，以官網為準
console.log(
  `完成：試題 ${tests.length} 份、Part 5 題庫 ${uniqueP5.length} 題、Part 6 題庫 ${bankP6.length} 篇；token 輸入 ${usage.input}、輸出 ${usage.output}，約 $${((usage.input * 2 + usage.output * 8) / 1e6).toFixed(2)}（不含快取過的部分）`,
)
