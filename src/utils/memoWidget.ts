import { ensureUser, supabase } from './cloud'
import { SYNC_EVENT } from '../hooks/useLocalStorage'
import { sortMemos } from '../data/memos'
import type { Memo } from '../data/memos'

/**
 * 備忘錄小工具：PWA 不能做 iPhone 小工具，所以把備忘上傳到 Supabase，
 * 再由使用者裝在 Scriptable App 的腳本帶著 token 讀取，顯示在主畫面與鎖定畫面。
 * 這幾個設定只屬於這台裝置（sync.ts 的 LOCAL_ONLY），不跟帳號同步。
 */
export const WIDGET_ON_KEY = 'lifemaster.memoWidget'
export const WIDGET_TOKEN_KEY = 'lifemaster.memoWidgetToken'
/** token 換過（例如登入了別的帳號）但腳本還沒重新複製 */
export const WIDGET_STALE_KEY = 'lifemaster.memoWidgetStale'

/** 小工具最多顯示這麼多則 */
const MAX_MEMOS = 12

function setLocal(key: string, value: unknown) {
  try {
    // 不用 removeItem：useLocalStorage 讀到不存在的 key 會沿用舊值
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 忽略
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: key }))
}

function getLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export const isWidgetOn = () => getLocal<boolean>(WIDGET_ON_KEY) === true

/** 上傳要顯示的備忘，並記下 token；失敗回傳 null */
export async function pushWidgetMemos(memos: Memo[]): Promise<string | null> {
  if (!supabase || !(await ensureUser())) return null
  const payload = sortMemos(memos)
    .slice(0, MAX_MEMOS)
    .map(m => ({ t: m.text.slice(0, 200), p: m.pinned }))
  const { data, error } = await supabase.rpc('save_memo_widget', { p_memos: payload })
  if (error || typeof data !== 'string') return null
  const old = getLocal<string>(WIDGET_TOKEN_KEY)
  if (old !== data) {
    setLocal(WIDGET_TOKEN_KEY, data)
    if (old) setLocal(WIDGET_STALE_KEY, true)
  }
  return data
}

export async function enableWidget(memos: Memo[]): Promise<boolean> {
  const token = await pushWidgetMemos(memos)
  if (!token) return false
  setLocal(WIDGET_STALE_KEY, false)
  setLocal(WIDGET_ON_KEY, true)
  return true
}

export async function disableWidget(): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.rpc('delete_memo_widget')
  if (error) return false
  setLocal(WIDGET_ON_KEY, false)
  setLocal(WIDGET_TOKEN_KEY, null)
  setLocal(WIDGET_STALE_KEY, false)
  return true
}

/** 換一組新連結：舊的腳本會立刻失效 */
export async function rotateWidgetToken(): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('rotate_memo_widget_token')
  if (error || typeof data !== 'string') return false
  setLocal(WIDGET_TOKEN_KEY, data)
  setLocal(WIDGET_STALE_KEY, false)
  return true
}

export const markScriptCopied = () => setLocal(WIDGET_STALE_KEY, false)

/** 貼到 Scriptable 的腳本；裡面有專屬 token */
export function widgetScript(token: string): string {
  const url: string = import.meta.env.VITE_SUPABASE_URL ?? ''
  const key: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
  return `// LifeMaster 小工具（Scriptable）：備忘錄；編輯小工具時 Parameter 填 today 改顯示今日任務
// 這段裡有你的專屬連結，請不要分享給別人
const SUPABASE_URL = ${JSON.stringify(url)}
const ANON_KEY = ${JSON.stringify(key)}
const TOKEN = ${JSON.stringify(token)}
${SCRIPT_BODY}`
}

const SCRIPT_BODY = String.raw`
const fm = FileManager.local()
const cachePath = fm.joinPath(fm.cacheDirectory(), "lifemaster-memos.json")

async function load() {
  try {
    const req = new Request(SUPABASE_URL + "/rest/v1/rpc/get_memo_widget")
    req.method = "POST"
    req.headers = { apikey: ANON_KEY, Authorization: "Bearer " + ANON_KEY, "Content-Type": "application/json" }
    req.body = JSON.stringify({ p_token: TOKEN })
    req.timeoutInterval = 10
    const data = await req.loadJSON()
    if (data === null) return { memos: [], invalid: true }
    if (data && Array.isArray(data.memos)) {
      fm.writeString(cachePath, JSON.stringify(data))
      return data
    }
  } catch (e) {}
  // 離線時用上次的內容
  if (fm.fileExists(cachePath)) return JSON.parse(fm.readString(cachePath))
  return { memos: [], offline: true }
}

const data = await load()
const family = config.widgetFamily || "medium"
const mode = String(args.widgetParameter || "").trim().toLowerCase()
const w = new ListWidget()
w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)
const fg = Color.dynamic(new Color("#1f2937"), new Color("#f3f4f6"))
const muted = Color.dynamic(new Color("#6b7280"), new Color("#9ca3af"))

if (mode === "today") renderToday()
else renderMemos()

function renderMemos() {
const memos = data.memos || []
const oneLine = m => m.t.replace(/\s+/g, " ").trim()
const emptyText = data.invalid ? "連結已失效，請到 LifeMaster 重新複製腳本" : data.offline ? "連不上網路" : "沒有備忘"

if (family === "accessoryInline") {
  w.addText(memos.length ? (memos[0].p ? "📌 " : "") + oneLine(memos[0]) : "📝 " + emptyText)
} else if (family === "accessoryCircular") {
  w.addAccessoryWidgetBackground = true
  const n = w.addText(String(memos.length))
  n.font = Font.boldSystemFont(22)
  n.centerAlignText()
  const label = w.addText("備忘")
  label.font = Font.systemFont(10)
  label.centerAlignText()
} else if (family === "accessoryRectangular") {
  if (!memos.length) w.addText(emptyText).font = Font.systemFont(13)
  for (const m of memos.slice(0, 3)) {
    const line = w.addText((m.p ? "📌 " : "• ") + oneLine(m))
    line.font = Font.systemFont(13)
    line.lineLimit = 1
  }
} else {
  w.backgroundColor = Color.dynamic(new Color("#fffbeb"), new Color("#1c1c1e"))
  const count = family === "small" ? 4 : family === "medium" ? 4 : 10
  const title = w.addText("📝 備忘")
  title.font = Font.boldSystemFont(14)
  title.textColor = muted
  w.addSpacer(6)
  if (!memos.length) {
    const t = w.addText(emptyText)
    t.font = Font.systemFont(14)
    t.textColor = muted
  }
  for (const m of memos.slice(0, count)) {
    const line = w.addText((m.p ? "📌 " : "• ") + oneLine(m))
    line.font = Font.systemFont(family === "small" ? 13 : 14)
    line.textColor = fg
    line.lineLimit = family === "small" ? 1 : 2
    w.addSpacer(3)
  }
  if (memos.length > count) {
    const more = w.addText("還有 " + (memos.length - count) + " 則")
    more.font = Font.systemFont(11)
    more.textColor = muted
  }
  w.addSpacer()
}
}

function dateKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
}

function renderToday() {
  const s = data.today
  const now = new Date()
  const today = dateKey(now)
  const yesterday = dateKey(new Date(now.getTime() - 86400000))
  const emptyText = data.invalid
    ? "連結已失效，請到 LifeMaster 重新複製腳本"
    : data.offline
      ? "連不上網路"
      : "請到 LifeMaster 備忘錄頁開啟「小工具也顯示今日任務」"
  if (!s) {
    const t = w.addText(family.startsWith("accessory") ? "✅ " + emptyText : emptyText)
    t.font = Font.systemFont(13)
    t.textColor = muted
    return
  }
  // 跨日後 App 還沒打開：今天的習慣、單字都還沒開始
  const fresh = s.date === today
  const habits = (s.habits || []).map(h => ({ ...h, ok: fresh && h.ok }))
  const done = fresh ? s.habitsDone : 0
  const streak = s.streakEnd === today || s.streakEnd === yesterday ? s.streak : 0
  const words = fresh ? s.words : { done: 0, total: 0 }
  const todos = (s.todos || []).map(t => ({ ...t, late: t.d < today }))
  const todosDue = s.todosDue || 0
  const streakText = "🔥" + streak

  if (family === "accessoryInline") {
    w.addText(streakText + " ✅" + done + "/" + s.habitsTotal + (todosDue ? " 📋" + todosDue : ""))
    return
  }
  if (family === "accessoryCircular") {
    w.addAccessoryWidgetBackground = true
    const n = w.addText(String(streak))
    n.font = Font.boldSystemFont(22)
    n.centerAlignText()
    const label = w.addText("🔥 天")
    label.font = Font.systemFont(10)
    label.centerAlignText()
    return
  }
  if (family === "accessoryRectangular") {
    const head = w.addText(streakText + "  習慣 " + done + "/" + s.habitsTotal)
    head.font = Font.boldSystemFont(13)
    const wl = w.addText("單字 " + (words.total ? words.done + "/" + words.total : "未開始") + (todosDue ? "  待辦 " + todosDue : ""))
    wl.font = Font.systemFont(12)
    if (todos.length) {
      const t = w.addText("• " + todos[0].t)
      t.font = Font.systemFont(12)
      t.lineLimit = 1
    }
    return
  }

  w.backgroundColor = Color.dynamic(new Color("#f0fdf4"), new Color("#1c1c1e"))
  const top = w.addStack()
  top.centerAlignContent()
  const title = top.addText("今日任務")
  title.font = Font.boldSystemFont(14)
  title.textColor = muted
  top.addSpacer()
  const st = top.addText(streakText)
  st.font = Font.boldSystemFont(16)
  st.textColor = streak ? new Color("#f97316") : muted
  w.addSpacer(6)

  const summary = w.addText("習慣 " + done + "/" + s.habitsTotal + "  ·  單字 " + (words.total ? words.done + "/" + words.total : "未開始") + (s.wordsDue ? "  ·  複習 " + s.wordsDue : ""))
  summary.font = Font.semiboldSystemFont(family === "small" ? 12 : 13)
  summary.textColor = fg
  summary.lineLimit = 2
  w.addSpacer(6)

  // 習慣圖示：做完的打勾
  const row = w.addStack()
  row.spacing = 4
  for (const h of habits.slice(0, family === "small" ? 5 : 8)) {
    const t = row.addText(h.ok ? "✅" : h.i)
    t.font = Font.systemFont(family === "small" ? 15 : 17)
    if (!h.ok) t.textOpacity = 0.85
  }

  if (family !== "small") {
    w.addSpacer(8)
    const shown = todos.slice(0, family === "medium" ? 2 : 5)
    if (!shown.length) {
      const t = w.addText("今天沒有到期的待辦 🎉")
      t.font = Font.systemFont(13)
      t.textColor = muted
    }
    for (const todo of shown) {
      const line = w.addText((todo.late ? "⚠️ " : "• ") + (todo.time ? todo.time + " " : "") + todo.t)
      line.font = Font.systemFont(13)
      line.textColor = todo.late ? new Color("#e11d48") : fg
      line.lineLimit = 1
      w.addSpacer(2)
    }
    if (todosDue > shown.length) {
      const more = w.addText("還有 " + (todosDue - shown.length) + " 件待辦")
      more.font = Font.systemFont(11)
      more.textColor = muted
    }
  } else if (todosDue) {
    w.addSpacer(6)
    const t = w.addText("📋 到期待辦 " + todosDue)
    t.font = Font.systemFont(12)
    t.textColor = fg
  }
  w.addSpacer()
}

if (config.runsInApp) await w.presentMedium()
else Script.setWidget(w)
Script.complete()
`
