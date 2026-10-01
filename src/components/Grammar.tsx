import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, RotateCcw, Sparkles, Trophy } from 'lucide-react'
import QuestionBlock from './QuestionBlock'
import { GRAMMAR_PROGRESS_KEY, GRAMMAR_UNITS } from '../data/grammar'
import type { GrammarUnit } from '../data/grammar'
import { READING_TAGS_KEY, TAGS, buildQuestion } from '../data/reading'
import type { TagStats } from '../data/reading'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { speak } from '../utils/speech'
import { toDateKey } from '../utils/date'

type Progress = Record<string, { best: number; date: string }>

/** 每次進入測驗重新打散選項順序 */
function quizOf(unit: GrammarUnit, round: number) {
  return unit.quiz.map((q, i) => buildQuestion(q, `${unit.id}-${round}-${i}`, i + 1, unit.tag))
}

function Lesson({ unit, onStart, onBack }: { unit: GrammarUnit; onStart: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted">
        <ArrowLeft className="h-4 w-4" /> 單元列表
      </button>
      <div className="rounded-2xl bg-surface p-4 shadow-sm">
        <p className="text-lg font-bold text-fg">{unit.title}</p>
        <p className="mt-1 text-sm text-muted">{unit.intro}</p>
      </div>
      <div className="space-y-2.5 rounded-2xl bg-surface p-4 shadow-sm">
        <p className="font-semibold text-fg">重點</p>
        {unit.points.map((p, i) => (
          <div key={i} className="rounded-xl bg-surface-2 p-3">
            <p className="text-sm font-semibold text-primary-ink">{p.rule}</p>
            <p className="mt-0.5 text-sm text-fg">{p.detail}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 rounded-2xl bg-surface p-4 shadow-sm">
        <p className="font-semibold text-fg">例句</p>
        {unit.examples.map(([en, zh], i) => (
          <button key={i} onClick={() => speak(en)} className="block w-full rounded-xl bg-surface-2 p-3 text-left">
            <p className="text-[15px] text-fg">{en}</p>
            <p className="mt-0.5 text-xs text-muted">{zh}</p>
          </button>
        ))}
        <p className="text-xs text-faint">點例句可以聽發音</p>
      </div>
      <div className="flex gap-2.5 rounded-2xl bg-amber-400/15 p-4 text-sm text-amber-800 dark:text-amber-200">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{unit.tip}</p>
      </div>
      <button
        onClick={onStart}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary to-primary-2 py-3.5 font-semibold text-on-primary shadow-lg transition active:scale-[0.98]"
      >
        小測驗 {unit.quiz.length} 題 <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  )
}

function Quiz({ unit, round, onDone, onBack }: { unit: GrammarUnit; round: number; onDone: (correct: number) => void; onBack: () => void }) {
  const questions = useMemo(() => quizOf(unit, round), [unit, round])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [checked, setChecked] = useState(false)
  const q = questions[index]
  const last = index === questions.length - 1

  const next = () => {
    if (last) {
      onDone(questions.filter(x => answers[x.id] === x.answer).length)
      return
    }
    setIndex(i => i + 1)
    setChecked(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-full p-1.5 text-faint" aria-label="回到講解">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-all"
            style={{ width: `${((index + (checked ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted tabular-nums">
          {index + 1}/{questions.length}
        </span>
      </div>
      <p className="text-xs text-faint">{unit.title}</p>
      <QuestionBlock
        question={q}
        picked={answers[q.id]}
        reveal={checked}
        onPick={option => setAnswers(a => ({ ...a, [q.id]: option }))}
      />
      {checked ? (
        <button onClick={next} className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-fg py-3 font-semibold text-bg">
          {last ? '看成績' : '下一題'} <ArrowRight className="h-5 w-5" />
        </button>
      ) : (
        <button
          disabled={answers[q.id] === undefined}
          onClick={() => setChecked(true)}
          className="w-full rounded-2xl bg-primary py-3 font-semibold text-on-primary disabled:opacity-40"
        >
          對答案
        </button>
      )}
    </div>
  )
}

export default function Grammar() {
  const [progress, setProgress] = useLocalStorage<Progress>(GRAMMAR_PROGRESS_KEY, {})
  const [tagStats] = useLocalStorage<TagStats>(READING_TAGS_KEY, {})
  const [unitId, setUnitId] = useState<string | null>(null)
  const [view, setView] = useState<'lesson' | 'quiz' | 'result'>('lesson')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)

  const unit = GRAMMAR_UNITS.find(u => u.id === unitId)
  const done = GRAMMAR_UNITS.filter(u => progress[u.id]).length

  // 依閱讀測驗的弱點推薦：答對率最低、且至少寫過 3 題的文法考點
  const weakTag = Object.entries(tagStats)
    .filter(([tag, s]) => ['pos', 'verb', 'prep', 'conj', 'pron', 'vocab'].includes(tag) && s.total >= 3)
    .sort(([, a], [, b]) => a.right / a.total - b.right / b.total)[0]
  const recommended = weakTag && weakTag[1].right / weakTag[1].total < 0.8 ? weakTag[0] : null

  const open = (id: string) => {
    setUnitId(id)
    setView('lesson')
    window.scrollTo({ top: 0 })
  }

  if (unit && view === 'lesson') {
    return (
      <Lesson
        unit={unit}
        onBack={() => setUnitId(null)}
        onStart={() => {
          setRound(r => r + 1)
          setView('quiz')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (unit && view === 'quiz') {
    return (
      <Quiz
        key={round}
        unit={unit}
        round={round}
        onBack={() => setView('lesson')}
        onDone={correct => {
          setScore(correct)
          setProgress(p => ({ ...p, [unit.id]: { best: Math.max(correct, p[unit.id]?.best ?? 0), date: toDateKey() } }))
          setView('result')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (unit && view === 'result') {
    const index = GRAMMAR_UNITS.indexOf(unit)
    const nextUnit = GRAMMAR_UNITS[index + 1]
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface p-6 text-center shadow-sm">
          <Trophy className={`mx-auto h-12 w-12 ${score === unit.quiz.length ? 'text-amber-500' : 'text-faint'}`} />
          <p className="mt-2 text-sm text-muted">{unit.title}</p>
          <p className="text-5xl font-bold text-primary-ink">
            {score}
            <span className="text-2xl text-muted">/{unit.quiz.length}</span>
          </p>
          <p className="mt-1 text-sm text-muted">{score === unit.quiz.length ? '全對！這個單元已經掌握了' : '再看一次重點，或重新測驗'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setView('lesson')} className="flex items-center justify-center gap-1.5 rounded-2xl bg-surface py-3 font-medium text-fg shadow-sm">
            <RotateCcw className="h-4 w-4" /> 複習重點
          </button>
          <button
            onClick={() => (nextUnit ? open(nextUnit.id) : setUnitId(null))}
            className="rounded-2xl bg-primary py-3 font-semibold text-on-primary"
          >
            {nextUnit ? '下一個單元' : '回到列表'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface p-4 shadow-sm">
        <p className="font-semibold text-fg">多益文法 {GRAMMAR_UNITS.length} 單元</p>
        <p className="text-xs text-muted">每單元：重點講解、例句、5 題小測驗</p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(done / GRAMMAR_UNITS.length) * 100}%` }} />
          </div>
          <span className="text-xs text-muted tabular-nums">
            {done}/{GRAMMAR_UNITS.length}
          </span>
        </div>
        {recommended && (
          <p className="mt-2.5 flex items-center gap-1 text-xs text-primary-ink">
            <Sparkles className="h-3.5 w-3.5" /> 依你的閱讀弱點「{TAGS[recommended]}」，推薦標示的單元
          </p>
        )}
      </div>

      <ul className="space-y-2">
        {GRAMMAR_UNITS.map((u, i) => {
          const p = progress[u.id]
          return (
            <li key={u.id}>
              <button
                onClick={() => open(u.id)}
                className={`flex w-full items-center gap-3 rounded-2xl bg-surface p-3.5 text-left shadow-sm ${u.tag === recommended ? 'ring-2 ring-primary/50' : ''}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary-ink">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg">{u.title}</span>
                  <span className="block text-xs text-muted">
                    {TAGS[u.tag]}
                    {u.tag === recommended && <span className="ml-1 font-semibold text-primary-ink">・推薦</span>}
                  </span>
                </span>
                {p ? (
                  <span className={`flex items-center gap-1 text-xs tabular-nums ${p.best === u.quiz.length ? 'text-emerald-500' : 'text-muted'}`}>
                    <CheckCircle2 className="h-4 w-4" /> {p.best}/{u.quiz.length}
                  </span>
                ) : (
                  <ArrowRight className="h-4 w-4 text-faint" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
