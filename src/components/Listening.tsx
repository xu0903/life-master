import { useEffect, useRef, useState } from 'react'
import { ArrowRight, GraduationCap, Headphones, Play, RotateCcw, Square, Timer, Trophy, X } from 'lucide-react'
import QuestionBlock, { LookupText } from './QuestionBlock'
import { LISTENING_HISTORY_KEY, LISTENING_PARTS, LISTENING_TESTS } from '../data/listening'
import type { ListeningGroup, ListeningPart, ListeningRecord } from '../data/listening'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMistakeWords } from '../hooks/useMistakeWords'
import { toDateKey } from '../utils/date'
import { playRecorded, stopRecorded } from '../utils/audio'
import { canSpeak, englishVoices, speakLines, stopSpeaking, voiceScore } from '../utils/speech'
import type { VoiceChoice } from '../utils/speech'

interface Session {
  testId: string
  part: ListeningPart
  index: number
  answers: Record<string, number>
  checked: boolean
  /** 考試模式：只播一次、限時作答、最後才對答案 */
  exam?: boolean
  /** 考試模式中時間到還沒作答的題目 */
  timedOut?: string[]
}

/** 播放倍率：1x = 預錄音檔原本的速度 */
const SPEEDS = [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.5, 1.8, 2]
const DEFAULT_SPEED = 1.1

/** 考試模式每題的作答秒數（音檔播完才開始倒數）：正式考試 Part 2 約 5 秒，Part 3、4 每題約 8 秒，另外留時間看題目 */
const EXAM_SECONDS: Record<ListeningPart, number> = { 2: 5, 3: 10, 4: 10 }

/** 預錄音檔用倍率播放；沒有音檔的句子用裝置語音，速度換算成 speechSynthesis 的 rate */
function playGroup(group: ListeningGroup, speed: number, voices: VoiceChoice, onEnd: () => void) {
  playRecorded(group.audio, speed, line => new Promise(resolve => speakLines([line], 0.95 * speed, resolve, voices)), onEnd)
}

function stopAll() {
  stopRecorded()
  stopSpeaking()
}

function SpeedPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1 rounded-xl bg-surface-2 p-1">
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`rounded-lg py-1.5 text-sm tabular-nums transition ${value === s ? 'bg-surface font-semibold text-primary-ink shadow-sm' : 'text-muted'}`}
        >
          {s}x
        </button>
      ))}
    </div>
  )
}

function Player({ group, speed, voices }: { group: ListeningGroup; speed: number; voices: VoiceChoice }) {
  const [playing, setPlaying] = useState(false)
  const [plays, setPlays] = useState(0)

  // 換題或離開時停止播放
  useEffect(() => stopAll, [group.id])

  const toggle = () => {
    if (playing) {
      stopAll()
      setPlaying(false)
      return
    }
    setPlaying(true)
    setPlays(n => n + 1)
    // 優先播預錄的真人化語音；某一句的檔案不存在時，那一句改用裝置語音念
    playGroup(group, speed, voices, () => setPlaying(false))
  }

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-primary to-primary-2 p-4 text-left text-on-primary shadow-lg transition active:scale-[0.98]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
        {playing ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
      </span>
      <span>
        <span className="block text-lg font-bold">{playing ? '播放中…' : plays > 0 ? '再聽一次' : '播放音檔'}</span>
        <span className="block text-sm opacity-90">{plays > 0 ? `已播放 ${plays} 次（正式考試只播一次）` : '先看題目再播放，效果更好'}</span>
        <span className="block text-[11px] opacity-75">AI 合成語音</span>
      </span>
    </button>
  )
}

/** 考試模式：自動依序播放，每段只播一次，播完開始倒數，時間到自動跳下一題 */
function ExamRun({
  groups,
  speed,
  voices,
  onFinish,
  onQuit,
}: {
  groups: ListeningGroup[]
  speed: number
  voices: VoiceChoice
  onFinish: (answers: Record<string, number>, timedOut: string[]) => void
  onQuit: () => void
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timedOut, setTimedOut] = useState<string[]>([])
  const [phase, setPhase] = useState<'ready' | 'playing' | 'answer'>('ready')
  const [left, setLeft] = useState(0)
  const pending = useRef<number | undefined>(undefined)
  const group = groups[index]
  const budget = (g: ListeningGroup) => EXAM_SECONDS[g.part] * g.questions.length

  useEffect(
    () => () => {
      window.clearTimeout(pending.current)
      stopAll()
    },
    [],
  )

  const play = (g: ListeningGroup) => {
    setPhase('playing')
    playGroup(g, speed, voices, () => {
      setLeft(budget(g))
      setPhase('answer')
    })
  }

  const advance = () => {
    const missed = group.questions.filter(q => answers[q.id] === undefined).map(q => q.id)
    const allMissed = [...timedOut, ...missed]
    if (index >= groups.length - 1) {
      onFinish(answers, allMissed)
      return
    }
    const next = groups[index + 1]
    setTimedOut(allMissed)
    setIndex(index + 1)
    setPhase('playing')
    window.scrollTo({ top: 0 })
    // 跟正式考試一樣，下一段自動接著播
    pending.current = window.setTimeout(() => play(next), 1200)
  }

  // 作答倒數
  useEffect(() => {
    if (phase !== 'answer') return
    if (left <= 0) {
      advance()
      return
    }
    const t = window.setTimeout(() => setLeft(l => l - 1), 1000)
    return () => window.clearTimeout(t)
  })

  const quit = () => {
    if (!confirm('結束考試？這次的作答不會計分。')) return
    stopAll()
    onQuit()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={quit} className="rounded-full p-1.5 text-faint hover:bg-surface" aria-label="結束考試">
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-all duration-300"
            style={{ width: `${(index / groups.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted tabular-nums">
          {index + 1}/{groups.length}
        </span>
      </div>

      {phase === 'ready' ? (
        <button
          onClick={() => play(group)}
          className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-primary to-primary-2 p-4 text-left text-on-primary shadow-lg transition active:scale-[0.98]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Play className="h-6 w-6 fill-current" />
          </span>
          <span>
            <span className="block text-lg font-bold">開始考試</span>
            <span className="block text-sm opacity-90">每段只播一次，播完會自動倒數，時間到就跳下一題</span>
          </span>
        </button>
      ) : (
        <div className="rounded-2xl bg-surface p-4 shadow-sm">
          {phase === 'playing' ? (
            <p className="flex items-center gap-2 font-semibold text-primary-ink">
              <Headphones className="h-5 w-5 animate-pulse" /> 播放中…（只播一次）
            </p>
          ) : (
            <>
              <p className={`flex items-center gap-1.5 font-semibold tabular-nums ${left <= 3 ? 'text-rose-500' : 'text-fg'}`}>
                <Timer className="h-5 w-5" /> 作答時間剩 {left} 秒
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${(left / budget(group)) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-6">
        {group.questions.map(q => (
          <QuestionBlock
            key={q.id}
            question={q}
            picked={answers[q.id]}
            reveal={false}
            hideOptions={group.part === 2}
            onPick={phase === 'ready' ? undefined : option => setAnswers(a => ({ ...a, [q.id]: option }))}
          />
        ))}
      </div>

      {phase === 'answer' && (
        <button
          onClick={advance}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-fg py-3 font-semibold text-bg transition active:scale-[0.98]"
        >
          {index >= groups.length - 1 ? '交卷' : '下一題'} <ArrowRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

/** 成績頁：答錯（或超時）的題目附逐字稿與解析 */
function ReviewGroup({ group, answers, timedOut }: { group: ListeningGroup; answers: Record<string, number>; timedOut: Set<string> }) {
  const wrong = group.questions.filter(q => answers[q.id] !== q.answer)
  return (
    <div className="space-y-4 rounded-2xl bg-surface p-4 shadow-sm">
      <div className="space-y-1.5 rounded-xl bg-surface-2 p-3 text-[15px] leading-relaxed text-fg">
        <p className="text-xs font-semibold text-primary-ink">
          逐字稿・Part {group.part}
          {group.label && `・${group.label}`}
        </p>
        {group.transcript.map((line, i) => (
          <p key={i}>
            {group.part === 3 && <span className="mr-1.5 font-semibold text-muted">{line.voice}:</span>}
            <LookupText text={line.text} />
          </p>
        ))}
      </div>
      {wrong.map(q => (
        <div key={q.id} className="space-y-1">
          {timedOut.has(q.id) && <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">超時未作答</span>}
          <QuestionBlock question={q} picked={answers[q.id]} reveal />
        </div>
      ))}
    </div>
  )
}

/** 選擇女聲 / 男聲；品質好的語音排前面並標上推薦 */
function VoicePicker({ value, onChange }: { value: VoiceChoice; onChange: (v: VoiceChoice) => void }) {
  const [voices, setVoices] = useState(englishVoices)

  // 語音清單在部分瀏覽器是非同步載入的
  useEffect(() => {
    const update = () => setVoices(englishVoices())
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  const hasGood = voices.some(v => voiceScore(v) >= 4)
  const select = (gender: 'M' | 'W', label: string, sample: string) => (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-10 shrink-0 text-muted">{label}</span>
      <select
        value={value[gender] ?? ''}
        onChange={e => onChange({ ...value, [gender]: e.target.value || undefined })}
        className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-fg outline-none focus:border-primary"
      >
        <option value="">自動選擇</option>
        {voices.map(v => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {voiceScore(v) >= 4 ? '★ ' : ''}
            {v.name}（{v.lang}）
          </option>
        ))}
      </select>
      <button
        onClick={() => speakLines([{ voice: gender, text: sample }], 0.95, () => {}, value)}
        className="shrink-0 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs text-fg"
      >
        試聽
      </button>
    </label>
  )

  return (
    <div className="space-y-2">
      {select('W', '女聲', 'Hello, this is Jenna Park. I have a dinner reservation for tomorrow.')}
      {select('M', '男聲', 'Let me see. We can seat eight people in the private room at the back.')}
      {!hasGood && (
        <p className="text-xs leading-relaxed text-faint">
          聽起來生硬是因為裝置只有基本語音。iPhone 可以到「設定 → 輔助使用 → 朗讀內容 → 聲音 → 英文」下載標示「高品質」或「增強」的聲音（例如
          Ava、Evan），下載後回來這裡選擇；電腦用 Edge 瀏覽器會有自然的 Natural 語音。
        </p>
      )}
    </div>
  )
}

export default function Listening() {
  const [testId, setTestId] = useState(LISTENING_TESTS[0].id)
  const [session, setSession] = useState<Session | null>(null)
  const [result, setResult] = useState<Session | null>(null)
  const [collected, setCollected] = useState(0)
  const { collect } = useMistakeWords()
  const [history, setHistory] = useLocalStorage<ListeningRecord[]>(LISTENING_HISTORY_KEY, [])
  const [speed, setSpeed] = useLocalStorage('lifemaster.listeningSpeed', DEFAULT_SPEED)
  const [examMode, setExamMode] = useLocalStorage('lifemaster.listeningExam', false)
  const [voices, setVoices] = useLocalStorage<VoiceChoice>('lifemaster.listeningVoices', {})

  const active = session ?? result
  const test = LISTENING_TESTS.find(t => t.id === (active?.testId ?? testId)) ?? LISTENING_TESTS[0]
  const groups = active ? test.groups.filter(g => g.part === active.part) : []

  const start = (part: ListeningPart) => {
    setResult(null)
    setSession({
      testId: test.id,
      part,
      index: 0,
      answers: {},
      checked: false,
      exam: examMode,
    })
    window.scrollTo({ top: 0 })
  }

  const record = (done: Session) => {
    const questions = groups.flatMap(g => g.questions)
    const correct = questions.filter(q => done.answers[q.id] === q.answer).length
    setHistory(prev =>
      [
        ...prev,
        {
          date: toDateKey(),
          testId: test.id,
          part: done.part,
          correct,
          total: questions.length,
          exam: done.exam,
        },
      ].slice(-200),
    )
    setCollected(0)
    void collect(questions.filter(q => done.answers[q.id] !== q.answer)).then(setCollected)
    setResult(done)
    setSession(null)
    window.scrollTo({ top: 0 })
  }

  if (!canSpeak) {
    return <p className="rounded-2xl bg-surface px-6 py-12 text-center text-sm text-muted shadow-sm">這個瀏覽器不支援語音朗讀，無法使用聽力練習。</p>
  }

  // ---------- 考試模式 ----------
  if (session?.exam) {
    return (
      <ExamRun
        groups={groups}
        speed={speed}
        voices={voices}
        onFinish={(answers, timedOut) => record({ ...session, answers, timedOut })}
        onQuit={() => setSession(null)}
      />
    )
  }

  // ---------- 作答 ----------
  if (session) {
    const group = groups[session.index]
    const last = session.index >= groups.length - 1
    const allPicked = group.questions.every(q => session.answers[q.id] !== undefined)

    const next = () => {
      stopSpeaking()
      if (!last) {
        setSession(s => (s ? { ...s, index: s.index + 1, checked: false } : s))
        window.scrollTo({ top: 0 })
        return
      }
      record(session)
    }
    const quit = () => {
      if (!confirm('結束練習？這次的作答不會計分。')) return
      stopSpeaking()
      setSession(null)
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
              style={{
                width: `${((session.index + (session.checked ? 1 : 0)) / groups.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-muted tabular-nums">
            {session.index + 1}/{groups.length}
          </span>
        </div>

        <Player key={group.id} group={group} speed={speed} voices={voices} />
        <SpeedPicker value={speed} onChange={setSpeed} />

        <div className="space-y-6">
          {group.questions.map(q => (
            <QuestionBlock
              key={q.id}
              question={q}
              picked={session.answers[q.id]}
              reveal={session.checked}
              hideOptions={group.part === 2}
              onPick={option => setSession(s => (s ? { ...s, answers: { ...s.answers, [q.id]: option } } : s))}
            />
          ))}
        </div>

        {session.checked && group.part !== 2 && (
          <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
            <p className="text-xs font-semibold text-primary-ink">逐字稿{group.label && `・${group.label}`}</p>
            <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-fg">
              {group.transcript.map((line, i) => (
                <p key={i}>
                  {group.part === 3 && <span className="mr-1.5 font-semibold text-muted">{line.voice}:</span>}
                  <LookupText text={line.text} />
                </p>
              ))}
            </div>
          </div>
        )}

        {session.checked ? (
          <button
            onClick={next}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-fg py-3 font-semibold text-bg transition active:scale-[0.98]"
          >
            {last ? '看成績' : '下一題'} <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            disabled={!allPicked}
            onClick={() => {
              stopSpeaking()
              setSession(s => (s ? { ...s, checked: true } : s))
            }}
            className="w-full rounded-2xl bg-primary py-3 font-semibold text-on-primary transition active:scale-[0.98] disabled:opacity-40"
          >
            對答案
          </button>
        )}
      </div>
    )
  }

  // ---------- 成績 ----------
  if (result) {
    const questions = groups.flatMap(g => g.questions)
    const correct = questions.filter(q => result.answers[q.id] === q.answer).length
    const pct = Math.round((correct / questions.length) * 100)
    const info = LISTENING_PARTS.find(p => p.part === result.part)
    const timedOut = new Set(result.timedOut ?? [])
    const wrongGroups = groups.filter(g => g.questions.some(q => result.answers[q.id] !== q.answer))
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface p-6 text-center shadow-sm">
          <Trophy className={`mx-auto h-12 w-12 ${pct >= 80 ? 'text-amber-500' : 'text-faint'}`} />
          <p className="mt-2 text-sm text-muted">
            {test.name}・Part {result.part} {info?.label}
          </p>
          <p className="text-5xl font-bold text-primary-ink">
            {correct}
            <span className="text-2xl text-muted">/{questions.length}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            答對率 {pct}%{result.exam && '・考試模式'}
            {timedOut.size > 0 && <span className="text-rose-500">・{timedOut.size} 題超時</span>}
          </p>
        </div>
        {collected > 0 && (
          <p className="rounded-2xl bg-primary-soft px-4 py-2.5 text-center text-sm text-primary-ink">
            已把 {collected} 個生字收進「錯題生字」卡組，到「翻卡」就能複習
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => start(result.part)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-surface py-3 font-medium text-fg shadow-sm transition active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" /> 再練一次
          </button>
          <button onClick={() => setResult(null)} className="rounded-2xl bg-primary py-3 font-semibold text-on-primary transition active:scale-[0.98]">
            回選單
          </button>
        </div>
        {wrongGroups.length > 0 && (
          <>
            <p className="px-1 text-sm font-semibold text-fg">錯題解析（{questions.length - correct} 題）</p>
            {wrongGroups.map(g => (
              <ReviewGroup key={g.id} group={g} answers={result.answers} timedOut={timedOut} />
            ))}
          </>
        )}
      </div>
    )
  }

  // ---------- 選單 ----------
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface p-4 shadow-sm">
        <p className="flex items-center gap-1.5 font-semibold text-fg">
          <Headphones className="h-5 w-5 text-primary-ink" /> 聽力練習
        </p>
        <p className="mt-0.5 mb-3 text-xs text-faint">語音為 AI 合成，非真人錄音・請關閉靜音模式並調高音量</p>
        <div className="mb-2 grid grid-cols-2 gap-2">
          {[
            {
              exam: false,
              icon: Headphones,
              label: '練習模式',
              desc: '可重播，每題對答案',
            },
            {
              exam: true,
              icon: GraduationCap,
              label: '考試模式',
              desc: '只播一次・限時作答・最後才對答案',
            },
          ].map(m => (
            <button
              key={m.label}
              onClick={() => setExamMode(m.exam)}
              className={`rounded-xl p-2.5 text-left transition ${examMode === m.exam ? 'bg-primary-soft ring-2 ring-primary' : 'bg-surface-2'}`}
            >
              <p className={`flex items-center gap-1 text-sm font-semibold ${examMode === m.exam ? 'text-primary-ink' : 'text-fg'}`}>
                <m.icon className="h-4 w-4" /> {m.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">{m.desc}</p>
            </button>
          ))}
        </div>
        {examMode && (
          <p className="mb-3 text-xs text-faint">
            音檔播完開始倒數：Part 2 每題 {EXAM_SECONDS[2]} 秒，Part 3、4 每題 {EXAM_SECONDS[3]} 秒，時間到自動跳下一題（比照正式考試）
          </p>
        )}
        <div className="mb-1 flex gap-2">
          {LISTENING_TESTS.map(t => (
            <button
              key={t.id}
              onClick={() => setTestId(t.id)}
              className={`flex-1 rounded-full py-2 text-sm transition ${test.id === t.id ? 'bg-primary font-semibold text-on-primary' : 'bg-surface-2 text-muted'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <ul className="divide-y divide-line">
          {LISTENING_PARTS.map(p => {
            const count = test.groups.filter(g => g.part === p.part).reduce((n, g) => n + g.questions.length, 0)
            const records = history.filter(r => r.testId === test.id && r.part === p.part)
            const best = records.length ? records.reduce((a, b) => (b.correct > a.correct ? b : a)) : null
            return (
              <li key={p.part}>
                <button onClick={() => start(p.part)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className="w-14 shrink-0 rounded-lg bg-primary-soft py-1 text-center text-xs font-semibold text-primary-ink">Part {p.part}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-fg">{p.label}</span>
                    <span className="block text-xs text-muted">
                      {count} 題・{p.desc}
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

      <div className="rounded-2xl bg-surface p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-fg">播放速度</p>
        <SpeedPicker value={speed} onChange={setSpeed} />
        <p className="mt-1.5 text-xs text-faint">1x 是原始錄音速度，練習和考試模式都會套用</p>
        <p className="mt-4 mb-2 text-sm font-semibold text-fg">朗讀聲音</p>
        <VoicePicker value={voices} onChange={setVoices} />
      </div>
    </div>
  )
}
