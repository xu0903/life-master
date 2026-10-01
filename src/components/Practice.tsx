import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowRight, BookOpen, Check, Lightbulb, RotateCcw, Trophy, X } from 'lucide-react'
import CardActions from './CardActions'
import SpeakButtons from './SpeakButtons'
import type { Card } from '../data/flashcards'
import { QUESTION_TYPES, buildQuiz, isClozeCorrect, meaningOf, pickCards } from '../data/practice'
import type { Question, QuestionType } from '../data/practice'
import { TOEIC_WORDS, WORD_INFO, lookupWord, nextStat } from '../data/toeicWords'
import { useCards } from '../hooks/useCards'
import { sourceLabel, vocabPool } from '../data/vocab'
import { useVocabReady, useWordLevel, useWordSource, useWordStats } from '../hooks/useDailyWords'
import { useSpeechSettings } from '../hooks/useSpeechSettings'
import { useWordPopup } from '../hooks/useWordPopup'
import { toDateKey } from '../utils/date'
import { isEnglish, speak } from '../utils/speech'

export interface PracticeSource {
  id: string
  label: string
  cards: Card[]
}

interface Result {
  question: Question
  correct: boolean
  given: string
}

const COUNTS = [15, 30]
const TYPE_LABEL: Record<QuestionType, string> = { zh2en: '看中選英', en2zh: '看英選中', cloze: '例句填空' }

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${
        active ? 'bg-primary font-semibold text-on-primary' : 'bg-surface-2 text-muted'
      }`}
    >
      {children}
    </button>
  )
}

export default function Practice({ sources }: { sources: PracticeSource[] }) {
  const [stats, setStats] = useWordStats()
  const [level] = useWordLevel()
  const { ensureCard } = useCards()
  const [{ accent, autoSpeak }] = useSpeechSettings()
  const { open } = useWordPopup()

  const [wordSource] = useWordSource()
  const vocabReady = useVocabReady(wordSource.list !== 'toeic')
  // 題庫範圍跟著設定裡的「每日單字來源」
  const bank: PracticeSource = {
    id: 'bank',
    label: `${sourceLabel(wordSource)}題庫`,
    cards: (vocabReady && vocabPool(wordSource)) || TOEIC_WORDS.filter((_, i) => WORD_INFO[i].level <= level),
  }
  const allSources = [bank, ...sources.filter(s => s.cards.length > 0)]

  const [sourceId, setSourceId] = useState('bank')
  const [count, setCount] = useState(15)
  const [type, setType] = useState<QuestionType | 'mixed'>('mixed')
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'result'>('setup')
  const [round, setRound] = useState(1)
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [showHint, setShowHint] = useState(false)
  const advanceTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(advanceTimer.current), [])

  const source = allSources.find(s => s.id === sourceId) ?? bank
  const q = questions[index]
  const answered = picked !== null

  const start = (cards: Card[], nextRound: number) => {
    setQuestions(buildQuiz(cards, type, source.cards))
    setRound(nextRound)
    setIndex(0)
    setResults([])
    setPicked(null)
    setTyped('')
    setShowHint(false)
    setPhase('quiz')
    window.scrollTo({ top: 0 })
  }

  const next = () => {
    window.clearTimeout(advanceTimer.current)
    if (index + 1 >= questions.length) {
      setPhase('result')
      return
    }
    setIndex(i => i + 1)
    setPicked(null)
    setTyped('')
    setShowHint(false)
  }

  const submit = (given: string) => {
    if (!q || answered) return
    const correct = q.type === 'cloze' ? isClozeCorrect(given, q.answer) : given === q.answer
    setPicked(given)
    setResults(prev => [...prev, { question: q, correct, given }])
    // 第一輪才計入熟練度；錯題複習只是練習
    if (round === 1) {
      setStats(prev => ({ ...prev, [q.card.id]: nextStat(prev[q.card.id], correct ? 'good' : 'forgot', toDateKey()) }))
      // 從題庫抽到的錯字收進字卡庫，才會出現在「最近常錯」
      if (!correct) ensureCard(q.card)
    }
    if (autoSpeak !== 'off' && isEnglish(q.card.question)) speak(q.card.question, accent)
    if (correct) advanceTimer.current = window.setTimeout(next, 900)
  }

  // ---------- 設定 ----------
  if (phase === 'setup') {
    const available = Math.min(count, source.cards.length)
    return (
      <div className="space-y-4">
        <div className="space-y-4 rounded-2xl bg-surface p-4 shadow-sm">
          <div>
            <p className="mb-2 text-sm font-semibold text-fg">題目範圍</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {allSources.map(s => (
                <Chip key={s.id} active={source.id === s.id} onClick={() => setSourceId(s.id)}>
                  {s.label} <span className="opacity-70">{s.cards.length}</span>
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-fg">題數</p>
            <div className="flex gap-2">
              {COUNTS.map(n => (
                <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                  {n} 題
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-fg">題型</p>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map(t => (
                <Chip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
                  {t.label}
                </Chip>
              ))}
            </div>
            {type === 'cloze' && <p className="mt-2 text-xs text-faint">自訂卡片沒有例句，會改出選擇題</p>}
          </div>
        </div>
        <button
          disabled={available === 0}
          onClick={() => start(pickCards(source.cards, count, stats), 1)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-2 py-3.5 font-semibold text-on-primary shadow-lg transition active:scale-[0.98] disabled:opacity-40"
        >
          開始刷題（{available} 題）<ArrowRight className="h-5 w-5" />
        </button>
        {source.cards.length > 0 && source.cards.length < count && (
          <p className="text-center text-xs text-faint">這個範圍只有 {source.cards.length} 張卡</p>
        )}
      </div>
    )
  }

  // ---------- 結果 ----------
  if (phase === 'result') {
    const correctCount = results.filter(r => r.correct).length
    const wrong = results.filter(r => !r.correct)
    const pct = results.length ? Math.round((correctCount / results.length) * 100) : 0
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface p-6 text-center shadow-sm">
          <Trophy className={`mx-auto h-12 w-12 ${pct >= 80 ? 'text-amber-500' : 'text-faint'}`} />
          <p className="mt-2 text-sm text-muted">{round === 1 ? '本輪成績' : `錯題複習第 ${round - 1} 輪`}</p>
          <p className="text-5xl font-bold text-primary-ink">{pct}%</p>
          <p className="mt-1 text-sm text-muted">
            答對 <span className="font-semibold text-emerald-500">{correctCount}</span>・答錯{' '}
            <span className="font-semibold text-rose-500">{wrong.length}</span>
          </p>
          {round === 1 && <p className="mt-2 text-xs text-faint">答對升一格熟練度、答錯歸零；錯題已收進「最近常錯」</p>}
        </div>

        <div className="grid gap-2">
          {wrong.length > 0 && (
            <button
              onClick={() => start(wrong.map(r => r.question.card), round + 1)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3 font-semibold text-white shadow-md transition active:scale-[0.98]"
            >
              <RotateCcw className="h-5 w-5" /> 錯題複習（{wrong.length} 題）
            </button>
          )}
          <button
            onClick={() => setPhase('setup')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-surface py-3 font-medium text-fg shadow-sm transition active:scale-[0.98]"
          >
            再刷一組
          </button>
        </div>

        {wrong.length > 0 && (
          <div className="rounded-2xl bg-surface p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-fg">答錯的單字</p>
            <ul className="divide-y divide-line">
              {wrong.map(r => (
                <li key={r.question.id} className="space-y-1.5 py-2.5">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <button onClick={() => open(r.question.card.question)} className="text-left font-medium text-primary-ink underline decoration-dotted underline-offset-2">
                      {r.question.card.question}
                    </button>
                    <span className="text-right text-muted">{meaningOf(r.question.card)}</span>
                  </div>
                  <p className="text-xs text-faint">
                    {TYPE_LABEL[r.question.type]}・你的答案：<span className="text-rose-500">{r.given || '（空白）'}</span>
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <SpeakButtons text={r.question.card.question} />
                    <CardActions card={r.question.card} compact />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // ---------- 作答 ----------
  if (!q) return null
  const info = lookupWord(q.card.question)
  const isCorrect = answered && results[results.length - 1]?.correct

  const optionClass = (opt: string) => {
    if (!answered) return 'bg-surface text-fg ring-1 ring-line active:scale-[0.98]'
    if (opt === q.answer) return 'bg-emerald-500 text-white ring-emerald-500'
    if (opt === picked) return 'bg-rose-500 text-white ring-rose-500'
    return 'bg-surface text-faint ring-1 ring-line'
  }

  const onClozeSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (answered) next()
    else if (typed.trim()) submit(typed)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setPhase('setup')} className="rounded-full p-1.5 text-faint hover:bg-surface" aria-label="結束刷題">
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-all duration-300"
            style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted tabular-nums">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="rounded-3xl bg-surface p-6 shadow-lg ring-1 ring-line">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-ink">
            {TYPE_LABEL[q.type]}
            {round > 1 && '・錯題複習'}
          </span>
          {answered && (
            <span className={`flex items-center gap-1 text-sm font-semibold ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {isCorrect ? '答對了' : '答錯了'}
            </span>
          )}
        </div>

        {q.type === 'zh2en' && (
          <div className="py-4 text-center">
            <p className="text-xs text-faint">選出正確的英文</p>
            <p className="mt-2 text-2xl font-bold text-fg">{meaningOf(q.card)}</p>
          </div>
        )}

        {q.type === 'en2zh' && (
          <div className="space-y-2 py-2 text-center">
            <p className="text-xs text-faint">選出正確的中文</p>
            <p className="text-3xl font-bold text-primary-ink">{q.card.question}</p>
            {info && <p className="font-mono text-sm text-muted">{info.kk}</p>}
            {isEnglish(q.card.question) && <SpeakButtons text={q.card.question} />}
          </div>
        )}

        {q.type === 'cloze' && q.cloze && (
          <div className="space-y-3">
            <p className="text-xs text-faint">依提示填入空格（頭尾字母已給）</p>
            <p className="text-lg leading-relaxed text-fg">
              {q.cloze.before}
              <span className={`mx-0.5 rounded px-1 font-mono font-semibold tracking-wider ${answered ? (isCorrect ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400') : 'bg-primary-soft text-primary-ink'}`}>
                {answered ? q.answer : q.cloze.hint}
              </span>
              {q.cloze.after}
            </p>
            <p className="text-sm text-muted">
              提示：<span className="font-medium text-fg">{meaningOf(q.card)}</span>
            </p>
            {(showHint || answered) && <p className="text-sm text-muted">{q.cloze.translation}</p>}
          </div>
        )}
      </div>

      {q.options ? (
        <div className="grid gap-2.5">
          {q.options.map(opt => (
            <button
              key={opt}
              disabled={answered}
              onClick={() => submit(opt)}
              className={`rounded-2xl px-4 py-3.5 text-left font-medium transition ${optionClass(opt)}`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={onClozeSubmit} className="space-y-2.5">
          <input
            autoFocus
            value={typed}
            onChange={e => setTyped(e.target.value)}
            disabled={answered}
            placeholder={q.cloze?.hint}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-center font-mono text-lg tracking-wider text-fg outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {!answered && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className="flex items-center justify-center gap-1 rounded-2xl bg-surface py-3 text-sm text-muted disabled:opacity-40"
              >
                <Lightbulb className="h-4 w-4" /> 看句子翻譯
              </button>
              <button type="submit" className="rounded-2xl bg-primary py-3 font-semibold text-on-primary">
                確認
              </button>
            </div>
          )}
        </form>
      )}

      {answered && (
        <div className="flex gap-2.5">
          <button
            onClick={() => open(q.card.question)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-surface px-4 py-3 text-sm text-muted shadow-sm"
          >
            <BookOpen className="h-4 w-4" /> 單字解釋
          </button>
          <button
            onClick={next}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-fg py-3 font-semibold text-bg transition active:scale-[0.98]"
          >
            {index + 1 >= questions.length ? '看結果' : '下一題'} <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
