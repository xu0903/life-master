import { useEffect, useState } from 'react'
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  BookX,
  ChevronDown,
  Clock,
  FileText,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  X,
  PenLine,
} from 'lucide-react'
import QuestionBlock, { LookupText } from './QuestionBlock'
import {
  FULL_TEST_MINUTES,
  GROUP_BY_ID,
  PRACTICE_BANK,
  READING_HISTORY_KEY,
  READING_TAGS_KEY,
  READING_TESTS,
  READING_WRONG_KEY,
  SECTIONS,
  TAGS,
  estimateScore,
  fillBlanks,
  testOfGroup,
} from '../data/reading'
import type { ReadingGroup, ReadingQuestion, ReadingRecord, ReadingTest, SectionId, TagStats } from '../data/reading'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMistakeWords } from '../hooks/useMistakeWords'
import { logStudy } from '../data/studyLog'
import { toDateKey } from '../utils/date'

type Scope = ReadingRecord['scope']

/** 作答中的進度；存在 localStorage，App 被關掉再打開可以接著寫 */
interface Session {
  testId: string
  scope: Scope
  /** 這次要寫的題組（舊版存的進度沒有這個欄位，改由 testId + scope 推算） */
  groupIds?: string[]
  index: number
  /** 題目 id → 選的選項 */
  answers: Record<string, number>
  /** 練習模式已對過答案的題組 */
  checked: string[]
  elapsed: number
  /** 限時模式：每組題目有時間上限，時間到自動跳下一組，最後才對答案 */
  timed?: boolean
  /** 每個題組實際花的秒數（練習模式對完答案後就不再計時） */
  groupTime?: Record<string, number>
  /** 限時模式下時間到被跳過的題組 */
  timedOut?: string[]
}

/** 每題建議秒數；長篇閱讀以「題數 × 秒數」當整組的時間 */
type Pace = Record<SectionId, number>
const DEFAULT_PACE: Pace = { p5: 20, p6: 30, p7s: 60, p7d: 60, p7t: 70 }
const PACE_KEY = 'lifemaster.readingPace'
const groupBudget = (group: ReadingGroup, pace: Pace) => (pace[group.section] ?? DEFAULT_PACE[group.section]) * group.questions.length
const groupRange = (group: ReadingGroup) =>
  group.questions.length > 1 ? `第 ${group.questions[0].number}–${group.questions[group.questions.length - 1].number} 題` : `第 ${group.questions[0].number} 題`

const DAILY_COUNT = 10
const QUICK_PASSAGES = 2
const MIXED: Scope[] = ['daily', 'quick', 'blanks', 'wrong']

const groupsOf = (test: ReadingTest, scope: Scope) => (scope === 'full' ? test.groups : test.groups.filter(g => g.section === scope))
const sessionGroups = (session: Session): ReadingGroup[] => {
  if (session.groupIds) return session.groupIds.map(id => GROUP_BY_ID.get(id)).filter(g => g !== undefined)
  const test = READING_TESTS.find(t => t.id === session.testId)
  return test ? groupsOf(test, session.scope) : []
}
const scopeLabel = (scope: Scope) => {
  if (scope === 'full') return '完整模擬考'
  if (scope === 'daily') return `每日 ${DAILY_COUNT} 題`
  if (scope === 'quick') return `閱讀 ${QUICK_PASSAGES} 篇`
  if (scope === 'blanks') return `填空 ${QUICK_PASSAGES} 篇`
  if (scope === 'wrong') return '錯題本'
  const s = SECTIONS.find(x => x.id === scope)
  return s ? `${s.part} ${s.label}` : ''
}
const sectionLabel = (section: SectionId) => scopeLabel(section)
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** 成績頁的時間分析：各部分總時間、超時的題組 */
function TimingReport({ groups, session, pace }: { groups: ReadingGroup[]; session: Session; pace: Pace }) {
  const [showAll, setShowAll] = useState(false)
  const times = session.groupTime
  if (!times) return null
  const timedOut = new Set(session.timedOut ?? [])
  const rows = groups.map(g => ({
    group: g,
    spent: times[g.id] ?? 0,
    budget: groupBudget(g, pace),
  }))
  const sections = SECTIONS.map(sec => {
    const rs = rows.filter(r => r.group.section === sec.id)
    return {
      ...sec,
      count: rs.length,
      spent: rs.reduce((n, r) => n + r.spent, 0),
      budget: rs.reduce((n, r) => n + r.budget, 0),
    }
  }).filter(sec => sec.count > 0)
  const over = rows.filter(r => r.spent > r.budget || timedOut.has(r.group.id))
  const listed = showAll ? rows : over

  return (
    <div className="space-y-3 rounded-2xl bg-surface p-4 shadow-sm">
      <div>
        <p className="flex items-center gap-1.5 font-semibold text-fg">
          <AlarmClock className="h-4 w-4 text-primary-ink" /> 作答時間
        </p>
        <p className="text-xs text-faint">{over.length > 0 ? `${over.length} 組超過建議時間，紅色的部分要加快` : '每一組都在建議時間內，節奏很好！'}</p>
      </div>
      {sections.map(sec => {
        const late = sec.spent > sec.budget
        return (
          <div key={sec.id}>
            <div className="flex justify-between text-sm">
              <span className="text-fg">
                {sec.part} {sec.label}
              </span>
              <span className={`tabular-nums ${late ? 'font-semibold text-rose-500' : 'text-muted'}`}>
                {formatTime(sec.spent)} / 建議 {formatTime(sec.budget)}
                {late && `（超時 ${formatTime(sec.spent - sec.budget)}）`}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${late ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{
                  width: `${Math.min(100, (sec.spent / Math.max(1, sec.budget)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )
      })}
      {listed.length > 0 && (
        <ul className="divide-y divide-line text-sm">
          {listed.map(r => {
            const late = r.spent > r.budget || timedOut.has(r.group.id)
            return (
              <li key={r.group.id} className="flex items-center gap-2 py-1.5">
                <span className="w-16 shrink-0 text-xs text-faint">{SECTIONS.find(x => x.id === r.group.section)?.part}</span>
                <span className="flex-1 text-fg">{groupRange(r.group)}</span>
                {timedOut.has(r.group.id) && (
                  <span className="rounded bg-rose-500/15 px-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">超時跳過</span>
                )}
                <span className={`tabular-nums ${late ? 'font-semibold text-rose-500' : 'text-muted'}`}>
                  {formatTime(r.spent)}
                  <span className="text-xs font-normal text-faint"> / {formatTime(r.budget)}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {rows.length > over.length && (
        <button onClick={() => setShowAll(v => !v)} className="text-sm text-primary-ink">
          {showAll ? '只看超時的題組' : '看每一題的時間'}
        </button>
      )}
    </div>
  )
}

/** 限時模式開關與各題型的每題秒數 */
function PaceSettings({ timed, onTimed, pace, onPace }: { timed: boolean; onTimed: (v: boolean) => void; pace: Pace; onPace: (p: Pace) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <p className="font-semibold text-fg">作答模式</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[
          {
            value: false,
            label: '練習模式',
            desc: '每組對答案，記錄作答時間並提醒超時',
          },
          {
            value: true,
            label: '限時模式',
            desc: '每組時間到自動跳題、標記超時，最後才對答案',
          },
        ].map(m => (
          <button
            key={m.label}
            onClick={() => onTimed(m.value)}
            className={`rounded-xl p-2.5 text-left transition ${timed === m.value ? 'bg-primary-soft ring-2 ring-primary' : 'bg-surface-2'}`}
          >
            <p className={`text-sm font-semibold ${timed === m.value ? 'text-primary-ink' : 'text-fg'}`}>{m.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{m.desc}</p>
          </button>
        ))}
      </div>
      <button onClick={() => setOpen(o => !o)} className="mt-3 flex items-center gap-1 text-sm text-primary-ink">
        <AlarmClock className="h-4 w-4" /> 每題配時
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {SECTIONS.map(sec => {
            const value = pace[sec.id] ?? DEFAULT_PACE[sec.id]
            const set = (v: number) => onPace({ ...pace, [sec.id]: Math.min(300, Math.max(5, v)) })
            const perSet =
              sec.id === 'p7d' || sec.id === 'p7t' ? `・一組 5 題 ${formatTime(value * 5)}` : sec.id === 'p6' ? `・一篇 4 題 ${formatTime(value * 4)}` : ''
            return (
              <div key={sec.id} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="text-fg">
                    {sec.part} {sec.label}
                  </span>
                  <span className="block text-xs text-faint">
                    每題 {value} 秒{perSet}
                  </span>
                </span>
                <button onClick={() => set(value - 5)} className="rounded-lg bg-surface-2 p-1.5 text-muted" aria-label="減 5 秒">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-semibold text-fg tabular-nums">{value}s</span>
                <button onClick={() => set(value + 5)} className="rounded-lg bg-surface-2 p-1.5 text-muted" aria-label="加 5 秒">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )
          })}
          <button onClick={() => onPace(DEFAULT_PACE)} className="text-xs text-faint underline underline-offset-2">
            恢復建議值（Part 5 每題 20 秒、Part 6 每題 30 秒、Part 7 每題約 1 分鐘）
          </button>
        </div>
      )}
    </div>
  )
}

function shuffled<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Docs({ group }: { group: ReadingGroup }) {
  return (
    <>
      {group.docs.map((doc, i) => (
        <div key={i} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-ink">{doc.label}</span>
          <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-fg">
            <LookupText text={group.section === 'p6' ? fillBlanks(doc.text, group) : doc.text} />
          </p>
        </div>
      ))}
    </>
  )
}

/** 成績頁裡答錯的題組：可以展開文章對照解析 */
function ReviewGroup({ group, answers, timedOut }: { group: ReadingGroup; answers: Record<string, number>; timedOut: boolean }) {
  const [showDocs, setShowDocs] = useState(false)
  const wrong = group.questions.filter(q => answers[q.id] !== q.answer)
  return (
    <div className="space-y-4 rounded-2xl bg-surface p-4 shadow-sm">
      {timedOut && <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">超時跳過</span>}
      {group.docs.length > 0 && (
        <button onClick={() => setShowDocs(s => !s)} className="flex items-center gap-1 text-sm font-medium text-primary-ink">
          <FileText className="h-4 w-4" /> {showDocs ? '收起文章' : '看文章'}
          <ChevronDown className={`h-4 w-4 transition ${showDocs ? 'rotate-180' : ''}`} />
        </button>
      )}
      {showDocs && <Docs group={group} />}
      {wrong.map(q => (
        <QuestionBlock key={q.id} question={q} picked={answers[q.id]} reveal />
      ))}
    </div>
  )
}

/** 各考點的答對率，由低到高排，最弱的排最前面 */
function Weakness({ stats }: { stats: TagStats }) {
  const rows = Object.entries(stats)
    .filter(([tag, s]) => TAGS[tag] && s.total >= 3)
    .map(([tag, s]) => ({
      tag,
      ...s,
      pct: Math.round((s.right / s.total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)
  if (rows.length === 0) return null
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <p className="font-semibold text-fg">弱點分析</p>
      <p className="mb-3 text-xs text-faint">依考點統計答對率，越上面越需要加強</p>
      <div className="space-y-2.5">
        {rows.map(r => (
          <div key={r.tag}>
            <div className="flex justify-between text-sm">
              <span className="text-fg">{TAGS[r.tag]}</span>
              <span className="text-muted tabular-nums">
                {r.pct}%
                <span className="ml-1 text-xs text-faint">
                  ({r.right}/{r.total})
                </span>
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${r.pct < 60 ? 'bg-rose-500' : r.pct < 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                style={{ width: `${r.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Reading() {
  const [testId, setTestId] = useState(READING_TESTS[0].id)
  const [session, setSession] = useLocalStorage<Session | null>('lifemaster.readingSession', null)
  const [history, setHistory] = useLocalStorage<ReadingRecord[]>(READING_HISTORY_KEY, [])
  const [tagStats, setTagStats] = useLocalStorage<TagStats>(READING_TAGS_KEY, {})
  const [wrongIds, setWrongIds] = useLocalStorage<string[]>(READING_WRONG_KEY, [])
  const [result, setResult] = useState<Session | null>(null)
  const [collected, setCollected] = useState(0)
  const { collect } = useMistakeWords()
  const [pace, setPace] = useLocalStorage<Pace>(PACE_KEY, DEFAULT_PACE)
  const [timedMode, setTimedMode] = useLocalStorage('lifemaster.readingTimed', false)

  const active = session ?? result
  const test = READING_TESTS.find(t => t.id === testId) ?? READING_TESTS[0]
  const groups = active ? sessionGroups(active) : []
  const isFull = session?.scope === 'full'
  const remaining = FULL_TEST_MINUTES * 60 - (session?.elapsed ?? 0)
  const running = session !== null

  const begin = (scope: Scope, groupIds: string[]) => {
    if (groupIds.length === 0) return
    setResult(null)
    setSession({
      testId: MIXED.includes(scope) ? 'mix' : test.id,
      scope,
      groupIds,
      index: 0,
      answers: {},
      checked: [],
      elapsed: 0,
      // 完整模擬考本身就有 75 分鐘總時限，不另外逐組限時
      timed: scope !== 'full' && timedMode,
      groupTime: {},
      timedOut: [],
    })
    window.scrollTo({ top: 0 })
  }

  const wrongGroupIds = () => [...new Set(wrongIds.map(id => id.slice(0, id.lastIndexOf('-'))))].filter(id => GROUP_BY_ID.has(id))

  const start = (scope: Scope) => {
    if (scope === 'wrong') return begin(scope, wrongGroupIds())
    if (scope === 'daily') {
      // 每日 10 題：Part 5 為主，錯過的題目優先
      const wrong = new Set(wrongIds)
      const pool = [...READING_TESTS, PRACTICE_BANK].flatMap(t => t.groups.filter(g => g.section === 'p5'))
      const first = shuffled(pool.filter(g => wrong.has(g.questions[0].id)))
      const rest = shuffled(pool.filter(g => !wrong.has(g.questions[0].id)))
      return begin(
        scope,
        [...first, ...rest].slice(0, DAILY_COUNT).map(g => g.id),
      )
    }
    if (scope === 'blanks') {
      // Part 6 段落填空：從試題與題庫裡隨機抽
      const pool = [...READING_TESTS, PRACTICE_BANK].flatMap(t => t.groups.filter(g => g.section === 'p6'))
      return begin(
        scope,
        shuffled(pool)
          .slice(0, QUICK_PASSAGES)
          .map(g => g.id),
      )
    }
    if (scope === 'quick') {
      // 長篇閱讀先練兩篇：從所有單篇閱讀裡隨機抽
      const pool = READING_TESTS.flatMap(t => t.groups.filter(g => g.section === 'p7s'))
      return begin(
        scope,
        shuffled(pool)
          .slice(0, QUICK_PASSAGES)
          .map(g => g.id),
      )
    }
    begin(
      scope,
      groupsOf(test, scope).map(g => g.id),
    )
  }

  const finish = (done: Session | null = session) => {
    if (!done) return
    // 多益菜單的練習紀錄：有作答的題組才算
    for (const g of groups) {
      const answered = g.questions.filter(q => done.answers[q.id] !== undefined).length
      if (!answered) continue
      if (g.section === 'p5') logStudy('p5', answered)
      else logStudy(g.section === 'p6' ? 'p6' : 'p7')
    }
    if (done.scope === 'wrong') logStudy('wrong')
    if (done.scope === 'full') logStudy('mock')
    const questions = groups.flatMap(g => g.questions)
    const isRight = (q: ReadingQuestion) => done.answers[q.id] === q.answer
    const correct = questions.filter(isRight).length
    setHistory(prev =>
      [
        ...prev,
        {
          date: toDateKey(),
          testId: done.testId,
          scope: done.scope,
          correct,
          total: questions.length,
          seconds: done.elapsed,
        },
      ].slice(-200),
    )
    setTagStats(prev => {
      const next = { ...prev }
      for (const q of questions) {
        const s = next[q.tag] ?? { right: 0, total: 0 }
        next[q.tag] = {
          right: s.right + (isRight(q) ? 1 : 0),
          total: s.total + 1,
        }
      }
      return next
    })
    // 錯題本：答錯的加入，答對的移除
    setWrongIds(prev => {
      const right = new Set(questions.filter(isRight).map(q => q.id))
      const wrong = questions.filter(q => !isRight(q)).map(q => q.id)
      return [...new Set([...prev.filter(id => !right.has(id)), ...wrong])]
    })
    setResult(done)
    setSession(null)
    setCollected(0)
    void collect(questions.filter(q => !isRight(q))).then(setCollected)
    window.scrollTo({ top: 0 })
  }

  // 計時：只在畫面開著時累計
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      setSession(s => {
        if (!s) return s
        const current = sessionGroups(s)[s.index]
        // 練習模式對完答案後在看解析，不算作答時間
        if (!current || s.checked.includes(current.id)) return { ...s, elapsed: s.elapsed + 1 }
        const groupTime = {
          ...s.groupTime,
          [current.id]: (s.groupTime?.[current.id] ?? 0) + 1,
        }
        return { ...s, elapsed: s.elapsed + 1, groupTime }
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, setSession])

  // 模擬考時間到自動交卷
  useEffect(() => {
    if (isFull && remaining <= 0) finish()
  })

  // 限時模式：這一組時間到就標記超時，自動跳下一組（最後一組則交卷）
  useEffect(() => {
    if (!session?.timed) return
    const current = groups[session.index]
    if (!current || (session.groupTime?.[current.id] ?? 0) < groupBudget(current, pace)) return
    const updated = {
      ...session,
      timedOut: [...(session.timedOut ?? []), current.id],
    }
    if (session.index >= groups.length - 1) finish(updated)
    else {
      setSession({ ...updated, index: session.index + 1 })
      window.scrollTo({ top: 0 })
    }
  })

  // ---------- 作答 ----------
  if (session) {
    const group = groups[Math.min(session.index, groups.length - 1)]
    if (!group) {
      // 題庫改版後找不到原本的題組，直接放棄這次進度
      return (
        <button onClick={() => setSession(null)} className="w-full rounded-2xl bg-surface py-4 text-sm text-muted shadow-sm">
          找不到上次的作答進度，點此回到選單
        </button>
      )
    }
    const last = session.index >= groups.length - 1
    const checked = session.checked.includes(group.id)
    const allPicked = group.questions.every(q => session.answers[q.id] !== undefined)
    const answeredCount = groups.flatMap(g => g.questions).filter(q => session.answers[q.id] !== undefined).length
    const totalCount = groups.reduce((n, g) => n + g.questions.length, 0)
    const examStyle = isFull || !!session.timed
    const spent = session.groupTime?.[group.id] ?? 0
    const budget = groupBudget(group, pace)

    const go = (index: number) => {
      setSession(s => (s ? { ...s, index } : s))
      window.scrollTo({ top: 0 })
    }
    const pick = (q: ReadingQuestion, option: number) => setSession(s => (s ? { ...s, answers: { ...s.answers, [q.id]: option } } : s))
    const submit = () => {
      const left = totalCount - answeredCount
      if (left > 0 && !confirm(`還有 ${left} 題沒作答，確定要交卷嗎？`)) return
      finish()
    }
    const quit = () => {
      if (confirm(isFull ? '結束模擬考？這次的作答不會計分。' : '結束練習？這次的作答不會計分。')) setSession(null)
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={quit} className="rounded-full p-1.5 text-faint hover:bg-surface" aria-label="結束作答">
            <X className="h-5 w-5" />
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-all duration-300"
              style={{ width: `${(answeredCount / totalCount) * 100}%` }}
            />
          </div>
          {isFull ? (
            <span className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${remaining < 300 ? 'text-rose-500' : 'text-muted'}`}>
              <Timer className="h-4 w-4" /> {formatTime(Math.max(0, remaining))}
            </span>
          ) : session.timed ? (
            <span className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${budget - spent <= 10 ? 'text-rose-500' : 'text-muted'}`}>
              <Timer className="h-4 w-4" /> {formatTime(Math.max(0, budget - spent))}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm font-medium text-muted tabular-nums">
              <span className={`flex items-center gap-1 ${spent > budget && !checked ? 'text-rose-500' : ''}`}>
                <Clock className="h-3.5 w-3.5" /> {formatTime(spent)}/{formatTime(budget)}
              </span>
              {answeredCount}/{totalCount}
            </span>
          )}
        </div>
        {!examStyle && !checked && spent > budget && (
          <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
            這組已超過建議時間 {formatTime(spent - budget)}
            ，考試時要果斷作答、先跳過
          </p>
        )}
        {session.timed && (
          <div className="-mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-rose-400 transition-all duration-1000 ease-linear"
              style={{ width: `${Math.min(100, (spent / budget) * 100)}%` }}
            />
          </div>
        )}

        <p className="text-xs text-faint">
          {testOfGroup(group.id)?.name}・{sectionLabel(group.section)}
          {group.questions.length > 1 && `・第 ${group.questions[0].number}–${group.questions[group.questions.length - 1].number} 題`}
          {group.docs.length > 0 && '・點虛線單字可查解釋，並收進「閱讀生字」卡組'}
        </p>

        <Docs group={group} />

        <div className="space-y-6">
          {group.questions.map(q => (
            <QuestionBlock key={q.id} question={q} picked={session.answers[q.id]} reveal={!examStyle && checked} onPick={option => pick(q, option)} />
          ))}
        </div>

        {examStyle ? (
          <div className="flex gap-2.5">
            {isFull && (
              <button
                disabled={session.index === 0}
                onClick={() => go(session.index - 1)}
                className="flex items-center justify-center gap-1 rounded-2xl bg-surface px-4 py-3 text-sm text-muted shadow-sm disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> 上一題
              </button>
            )}
            <button
              onClick={last ? submit : () => go(session.index + 1)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-fg py-3 font-semibold text-bg transition active:scale-[0.98]"
            >
              {last ? '交卷' : '下一題'} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : checked ? (
          <button
            onClick={last ? () => finish() : () => go(session.index + 1)}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-fg py-3 font-semibold text-bg transition active:scale-[0.98]"
          >
            {last ? '看成績' : '下一題'} <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            disabled={!allPicked}
            onClick={() => setSession(s => (s ? { ...s, checked: [...s.checked, group.id] } : s))}
            className="w-full rounded-2xl bg-primary py-3 font-semibold text-on-primary transition active:scale-[0.98] disabled:opacity-40"
          >
            對答案
          </button>
        )}
        {examStyle && !last && (
          <button onClick={submit} className="w-full py-1 text-center text-sm text-faint underline underline-offset-2">
            提早交卷
          </button>
        )}
      </div>
    )
  }

  // ---------- 成績 ----------
  if (result) {
    const questions = groups.flatMap(g => g.questions)
    const correct = questions.filter(q => result.answers[q.id] === q.answer).length
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0
    const wrongGroups = groups.filter(g => g.questions.some(q => result.answers[q.id] !== q.answer))
    const bySection = SECTIONS.map(s => {
      const qs = groups.filter(g => g.section === s.id).flatMap(g => g.questions)
      return {
        ...s,
        total: qs.length,
        correct: qs.filter(q => result.answers[q.id] === q.answer).length,
      }
    }).filter(s => s.total > 0)
    const resultTest = READING_TESTS.find(t => t.id === result.testId)
    const timedOutGroups = new Set(result.timedOut ?? [])

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface p-6 text-center shadow-sm">
          <Trophy className={`mx-auto h-12 w-12 ${pct >= 80 ? 'text-amber-500' : 'text-faint'}`} />
          <p className="mt-2 text-sm text-muted">
            {resultTest && `${resultTest.name}・`}
            {scopeLabel(result.scope)}
          </p>
          <p className="text-5xl font-bold text-primary-ink">
            {correct}
            <span className="text-2xl text-muted">/{questions.length}</span>
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted">
            答對率 {pct}%・
            <Clock className="h-3.5 w-3.5" /> {formatTime(result.elapsed)}
            {result.timed && '・限時模式'}
          </p>
          {timedOutGroups.size > 0 && <p className="mt-1 text-sm font-medium text-rose-500">{timedOutGroups.size} 組超時被跳過</p>}
          {result.scope === 'full' && (
            <p className="mt-2 text-sm text-fg">
              預估閱讀分數 <span className="font-bold text-primary-ink">{estimateScore(correct, questions.length)}</span>
              <span className="text-xs text-faint"> / 495（僅供參考）</span>
            </p>
          )}
        </div>

        {collected > 0 && (
          <p className="rounded-2xl bg-primary-soft px-4 py-2.5 text-center text-sm text-primary-ink">
            已把 {collected} 個生字收進「錯題生字」卡組，到「翻卡」就能複習
          </p>
        )}
        {bySection.length > 1 && (
          <div className="space-y-2.5 rounded-2xl bg-surface p-4 shadow-sm">
            {bySection.map(s => (
              <div key={s.id}>
                <div className="flex justify-between text-sm">
                  <span className="text-fg">
                    {s.part} {s.label}
                  </span>
                  <span className="text-muted tabular-nums">
                    {s.correct}/{s.total}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(s.correct / s.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <TimingReport groups={groups} session={result} pace={pace} />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => start(result.scope)}
            disabled={result.scope === 'wrong' && wrongIds.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-surface py-3 font-medium text-fg shadow-sm transition active:scale-[0.98] disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />{' '}
            {result.scope === 'daily' ? '再來 10 題' : result.scope === 'quick' ? '再來 2 篇' : result.scope === 'wrong' ? '再練錯題' : '再寫一次'}
          </button>
          <button onClick={() => setResult(null)} className="rounded-2xl bg-primary py-3 font-semibold text-on-primary transition active:scale-[0.98]">
            回題型選單
          </button>
        </div>

        {wrongGroups.length > 0 && (
          <>
            <p className="px-1 text-sm font-semibold text-fg">錯題解析（{questions.length - correct} 題，已收進錯題本）</p>
            {wrongGroups.map(g => (
              <ReviewGroup key={g.id} group={g} answers={result.answers} timedOut={timedOutGroups.has(g.id)} />
            ))}
          </>
        )}
      </div>
    )
  }

  // ---------- 選單 ----------
  const bestOf = (scope: Scope) => {
    const records = history.filter(r => r.testId === test.id && r.scope === scope)
    return records.length ? records.reduce((a, b) => (b.correct > a.correct ? b : a)) : null
  }
  const fullBest = bestOf('full')
  const dailyToday = history.filter(r => r.scope === 'daily' && r.date === toDateKey()).length
  const quickToday = history.filter(r => r.scope === 'quick' && r.date === toDateKey()).length
  const blanksToday = history.filter(r => r.scope === 'blanks' && r.date === toDateKey()).length
  const wrongCount = wrongIds.filter(id => GROUP_BY_ID.has(id.slice(0, id.lastIndexOf('-')))).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={() => start('daily')} className="rounded-2xl bg-surface p-3 text-left shadow-sm ring-1 ring-primary/20 transition active:scale-[0.98]">
          <Sparkles className="h-5 w-5 text-primary-ink" />
          <p className="mt-1.5 text-sm font-semibold text-fg">刷 {DAILY_COUNT} 題</p>
          <p className="text-xs text-muted">{dailyToday > 0 ? `今天 ${dailyToday} 回` : '文法單字'}</p>
        </button>
        <button onClick={() => start('quick')} className="rounded-2xl bg-surface p-3 text-left shadow-sm ring-1 ring-primary/20 transition active:scale-[0.98]">
          <BookOpenText className="h-5 w-5 text-primary-ink" />
          <p className="mt-1.5 text-sm font-semibold text-fg">閱讀 {QUICK_PASSAGES} 篇</p>
          <p className="text-xs text-muted">{quickToday > 0 ? `今天 ${quickToday} 回` : '長篇先練兩篇'}</p>
        </button>
        <button
          onClick={() => start('blanks')}
          className="rounded-2xl bg-surface p-3 text-left shadow-sm ring-1 ring-primary/20 transition active:scale-[0.98]"
        >
          <PenLine className="h-5 w-5 text-primary-ink" />
          <p className="mt-1.5 text-sm font-semibold text-fg">填空 {QUICK_PASSAGES} 篇</p>
          <p className="text-xs text-muted">{blanksToday > 0 ? `今天 ${blanksToday} 回` : 'Part 6 段落填空'}</p>
        </button>
        <button
          onClick={() => start('wrong')}
          disabled={wrongCount === 0}
          className="rounded-2xl bg-surface p-3 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        >
          <BookX className="h-5 w-5 text-rose-500" />
          <p className="mt-1.5 text-sm font-semibold text-fg">錯題本</p>
          <p className="text-xs text-muted">{wrongCount > 0 ? `${wrongCount} 題待複習` : '沒有錯題'}</p>
        </button>
      </div>
      <p className="-mt-2 px-1 text-xs text-faint">每一組都會計時，成績頁會顯示各部分花了多久、哪裡超時</p>

      <PaceSettings timed={timedMode} onTimed={setTimedMode} pace={pace} onPace={setPace} />

      <div className="grid grid-cols-3 gap-2">
        {READING_TESTS.map(t => (
          <button
            key={t.id}
            onClick={() => setTestId(t.id)}
            className={`rounded-full py-2 text-sm transition ${test.id === t.id ? 'bg-primary font-semibold text-on-primary' : 'bg-surface text-muted'}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => start('full')}
        className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-2 p-4 text-left text-on-primary shadow-lg transition active:scale-[0.98]"
      >
        <p className="flex items-center gap-1.5 text-lg font-bold">
          <Timer className="h-5 w-5" /> 完整模擬考
        </p>
        <p className="mt-0.5 text-sm opacity-90">
          {test.total} 題・限時 {FULL_TEST_MINUTES} 分鐘・交卷後才對答案
        </p>
        {fullBest && (
          <p className="mt-2 text-sm font-medium">
            最佳成績 {fullBest.correct}/{fullBest.total}（預估 {estimateScore(fullBest.correct, fullBest.total)} 分）
          </p>
        )}
      </button>

      <div className="rounded-2xl bg-surface p-4 shadow-sm">
        <p className="font-semibold text-fg">分題型練習</p>
        <p className="mb-2 text-xs text-faint">
          {timedMode ? '限時模式：每組時間到自動跳題，寫完全部才對答案' : '每寫完一組就能對答案看解析，超過建議時間會提醒'}
        </p>
        <ul className="divide-y divide-line">
          {SECTIONS.map(s => {
            const count = groupsOf(test, s.id).reduce((n, g) => n + g.questions.length, 0)
            const best = bestOf(s.id)
            return (
              <li key={s.id}>
                <button onClick={() => start(s.id)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className="w-14 shrink-0 rounded-lg bg-primary-soft py-1 text-center text-xs font-semibold text-primary-ink">{s.part}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-fg">{s.label}</span>
                    <span className="block text-xs text-muted">
                      {count} 題・{s.desc}
                    </span>
                  </span>
                  {best && (
                    <span className="text-xs text-muted tabular-nums">
                      最佳 {best.correct}/{best.total}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-faint" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <Weakness stats={tagStats} />
    </div>
  )
}
