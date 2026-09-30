import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clock, FileText, RotateCcw, Timer, Trophy, X } from 'lucide-react'
import { FULL_TEST_MINUTES, READING_HISTORY_KEY, READING_TESTS, SECTIONS, estimateScore, fillBlanks } from '../data/reading'
import type { ReadingGroup, ReadingQuestion, ReadingRecord, ReadingTest, SectionId } from '../data/reading'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { toDateKey } from '../utils/date'

type Scope = SectionId | 'full'

/** 作答中的進度；存在 localStorage，App 被關掉再打開可以接著寫 */
interface Session {
  testId: string
  scope: Scope
  index: number
  /** 題目 id → 選的選項 */
  answers: Record<string, number>
  /** 練習模式已對過答案的題組 */
  checked: string[]
  elapsed: number
}

const LETTERS = ['A', 'B', 'C', 'D']

const groupsOf = (test: ReadingTest, scope: Scope) => (scope === 'full' ? test.groups : test.groups.filter(g => g.section === scope))
const scopeLabel = (scope: Scope) => {
  if (scope === 'full') return '完整模擬考'
  const s = SECTIONS.find(x => x.id === scope)
  return s ? `${s.part} ${s.label}` : ''
}
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

function Docs({ group }: { group: ReadingGroup }) {
  return (
    <>
      {group.docs.map((doc, i) => (
        <div key={i} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-ink">{doc.label}</span>
          <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-fg">
            {group.section === 'p6' ? fillBlanks(doc.text, group) : doc.text}
          </p>
        </div>
      ))}
    </>
  )
}

function QuestionBlock({
  question,
  picked,
  reveal,
  onPick,
}: {
  question: ReadingQuestion
  picked: number | undefined
  reveal: boolean
  onPick?: (option: number) => void
}) {
  const optionClass = (i: number) => {
    if (reveal) {
      if (i === question.answer) return 'bg-emerald-500 text-white'
      if (i === picked) return 'bg-rose-500 text-white'
      return 'bg-surface text-faint ring-1 ring-line'
    }
    return i === picked ? 'bg-primary-soft text-primary-ink ring-2 ring-primary' : 'bg-surface text-fg ring-1 ring-line active:scale-[0.99]'
  }

  return (
    <div className="space-y-2">
      <p className="leading-relaxed font-medium whitespace-pre-line text-fg">
        <span className="mr-1.5 text-primary-ink tabular-nums">{question.number}.</span>
        {question.text || <span className="text-muted">選出最適合填入空格的答案</span>}
      </p>
      <div className="grid gap-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            disabled={reveal || !onPick}
            onClick={() => onPick?.(i)}
            className={`flex gap-2.5 rounded-xl px-3.5 py-3 text-left text-[15px] transition ${optionClass(i)}`}
          >
            <span className="font-semibold">({LETTERS[i]})</span>
            <span className="flex-1">{opt}</span>
          </button>
        ))}
      </div>
      {reveal && (
        <div className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
          <p className={`flex items-center gap-1 font-semibold ${picked === question.answer ? 'text-emerald-500' : 'text-rose-500'}`}>
            {picked === question.answer ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {picked === question.answer ? '答對了' : picked === undefined ? `未作答，答案是 (${LETTERS[question.answer]})` : `答案是 (${LETTERS[question.answer]})`}
          </p>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

/** 成績頁裡答錯的題組：可以展開文章對照解析 */
function ReviewGroup({ group, answers }: { group: ReadingGroup; answers: Record<string, number> }) {
  const [showDocs, setShowDocs] = useState(false)
  const wrong = group.questions.filter(q => answers[q.id] !== q.answer)
  return (
    <div className="space-y-4 rounded-2xl bg-surface p-4 shadow-sm">
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

export default function Reading() {
  const [testId, setTestId] = useState(READING_TESTS[0].id)
  const [session, setSession] = useLocalStorage<Session | null>('lifemaster.readingSession', null)
  const [history, setHistory] = useLocalStorage<ReadingRecord[]>(READING_HISTORY_KEY, [])
  const [result, setResult] = useState<Session | null>(null)

  const active = session ?? result
  const test = READING_TESTS.find(t => t.id === (active?.testId ?? testId)) ?? READING_TESTS[0]
  const groups = active ? groupsOf(test, active.scope) : []
  const isFull = session?.scope === 'full'
  const remaining = FULL_TEST_MINUTES * 60 - (session?.elapsed ?? 0)
  const running = session !== null

  const start = (scope: Scope) => {
    setResult(null)
    setSession({ testId: test.id, scope, index: 0, answers: {}, checked: [], elapsed: 0 })
    window.scrollTo({ top: 0 })
  }

  const finish = () => {
    if (!session) return
    const questions = groups.flatMap(g => g.questions)
    const correct = questions.filter(q => session.answers[q.id] === q.answer).length
    const record: ReadingRecord = {
      date: toDateKey(),
      testId: session.testId,
      scope: session.scope,
      correct,
      total: questions.length,
      seconds: session.elapsed,
    }
    setHistory(prev => [...prev, record].slice(-200))
    setResult(session)
    setSession(null)
    window.scrollTo({ top: 0 })
  }

  // 計時：只在畫面開著時累計
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setSession(s => (s ? { ...s, elapsed: s.elapsed + 1 } : s))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, setSession])

  // 模擬考時間到自動交卷
  useEffect(() => {
    if (isFull && remaining <= 0) finish()
  })

  // ---------- 作答 ----------
  if (session) {
    const group = groups[Math.min(session.index, groups.length - 1)]
    if (!group) return null
    const last = session.index >= groups.length - 1
    const checked = session.checked.includes(group.id)
    const allPicked = group.questions.every(q => session.answers[q.id] !== undefined)
    const answeredCount = groups.flatMap(g => g.questions).filter(q => session.answers[q.id] !== undefined).length
    const totalCount = groups.reduce((n, g) => n + g.questions.length, 0)

    const go = (index: number) => {
      setSession(s => (s ? { ...s, index } : s))
      window.scrollTo({ top: 0 })
    }
    const pick = (q: ReadingQuestion, option: number) =>
      setSession(s => (s ? { ...s, answers: { ...s.answers, [q.id]: option } } : s))
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
          ) : (
            <span className="text-sm font-medium text-muted tabular-nums">
              {answeredCount}/{totalCount}
            </span>
          )}
        </div>

        <p className="text-xs text-faint">
          {test.name}・{scopeLabel(group.section)}
          {group.questions.length > 1 && `・第 ${group.questions[0].number}–${group.questions[group.questions.length - 1].number} 題`}
        </p>

        <Docs group={group} />

        <div className="space-y-6">
          {group.questions.map(q => (
            <QuestionBlock
              key={q.id}
              question={q}
              picked={session.answers[q.id]}
              reveal={!isFull && checked}
              onPick={option => pick(q, option)}
            />
          ))}
        </div>

        {isFull ? (
          <div className="flex gap-2.5">
            <button
              disabled={session.index === 0}
              onClick={() => go(session.index - 1)}
              className="flex items-center justify-center gap-1 rounded-2xl bg-surface px-4 py-3 text-sm text-muted shadow-sm disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> 上一題
            </button>
            <button
              onClick={last ? submit : () => go(session.index + 1)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-fg py-3 font-semibold text-bg transition active:scale-[0.98]"
            >
              {last ? '交卷' : '下一題'} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : checked ? (
          <button
            onClick={last ? finish : () => go(session.index + 1)}
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
        {isFull && !last && (
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
      return { ...s, total: qs.length, correct: qs.filter(q => result.answers[q.id] === q.answer).length }
    }).filter(s => s.total > 0)

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface p-6 text-center shadow-sm">
          <Trophy className={`mx-auto h-12 w-12 ${pct >= 80 ? 'text-amber-500' : 'text-faint'}`} />
          <p className="mt-2 text-sm text-muted">
            {test.name}・{scopeLabel(result.scope)}
          </p>
          <p className="text-5xl font-bold text-primary-ink">
            {correct}
            <span className="text-2xl text-muted">/{questions.length}</span>
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted">
            答對率 {pct}%・<Clock className="h-3.5 w-3.5" /> {formatTime(result.elapsed)}
          </p>
          {result.scope === 'full' && (
            <p className="mt-2 text-sm text-fg">
              預估閱讀分數 <span className="font-bold text-primary-ink">{estimateScore(correct, questions.length)}</span>
              <span className="text-xs text-faint"> / 495（僅供參考）</span>
            </p>
          )}
        </div>

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

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => start(result.scope)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-surface py-3 font-medium text-fg shadow-sm transition active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" /> 再寫一次
          </button>
          <button
            onClick={() => setResult(null)}
            className="rounded-2xl bg-primary py-3 font-semibold text-on-primary transition active:scale-[0.98]"
          >
            回題型選單
          </button>
        </div>

        {wrongGroups.length > 0 && (
          <>
            <p className="px-1 text-sm font-semibold text-fg">錯題解析（{questions.length - correct} 題）</p>
            {wrongGroups.map(g => (
              <ReviewGroup key={g.id} group={g} answers={result.answers} />
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {READING_TESTS.map(t => (
          <button
            key={t.id}
            onClick={() => setTestId(t.id)}
            className={`flex-1 rounded-full py-2 text-sm transition ${
              test.id === t.id ? 'bg-primary font-semibold text-on-primary' : 'bg-surface text-muted'
            }`}
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
        <p className="mb-2 text-xs text-faint">不計時，每寫完一組就能對答案看解析</p>
        <ul className="divide-y divide-line">
          {SECTIONS.map(s => {
            const count = groupsOf(test, s.id).reduce((n, g) => n + g.questions.length, 0)
            const best = bestOf(s.id)
            return (
              <li key={s.id}>
                <button onClick={() => start(s.id)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className="w-14 shrink-0 rounded-lg bg-primary-soft py-1 text-center text-xs font-semibold text-primary-ink">
                    {s.part}
                  </span>
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
    </div>
  )
}
