import { useEffect, useState } from 'react'
import { ArrowRight, Headphones, Play, RotateCcw, Square, Trophy, X } from 'lucide-react'
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
}

const SPEEDS = [
  { rate: 0.95, label: '正常' },
  { rate: 0.78, label: '慢速' },
]

function Player({ group, rate, voices }: { group: ListeningGroup; rate: number; voices: VoiceChoice }) {
  const [playing, setPlaying] = useState(false)
  const [plays, setPlays] = useState(0)

  // 換題或離開時停止播放
  useEffect(
    () => () => {
      stopRecorded()
      stopSpeaking()
    },
    [group.id],
  )

  const toggle = () => {
    if (playing) {
      stopRecorded()
      stopSpeaking()
      setPlaying(false)
      return
    }
    setPlaying(true)
    setPlays(n => n + 1)
    // 優先播預錄的真人化語音；某一句的檔案不存在時，那一句改用裝置語音念
    playRecorded(group.audio, rate / 0.95, line => new Promise(resolve => speakLines([line], rate, resolve, voices)), () => setPlaying(false))
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
      {select('M', '男聲', "Let me see. We can seat eight people in the private room at the back.")}
      {!hasGood && (
        <p className="text-xs leading-relaxed text-faint">
          聽起來生硬是因為裝置只有基本語音。iPhone 可以到「設定 → 輔助使用 → 朗讀內容 → 聲音 → 英文」下載標示「高品質」或「增強」的聲音（例如 Ava、Evan），下載後回來這裡選擇；電腦用 Edge 瀏覽器會有自然的 Natural 語音。
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
  const [speed, setSpeed] = useLocalStorage('lifemaster.listeningRate', SPEEDS[0].rate)
  const [voices, setVoices] = useLocalStorage<VoiceChoice>('lifemaster.listeningVoices', {})

  const active = session ?? result
  const test = LISTENING_TESTS.find(t => t.id === (active?.testId ?? testId)) ?? LISTENING_TESTS[0]
  const groups = active ? test.groups.filter(g => g.part === active.part) : []

  const start = (part: ListeningPart) => {
    setResult(null)
    setSession({ testId: test.id, part, index: 0, answers: {}, checked: false })
    window.scrollTo({ top: 0 })
  }

  if (!canSpeak) {
    return <p className="rounded-2xl bg-surface px-6 py-12 text-center text-sm text-muted shadow-sm">這個瀏覽器不支援語音朗讀，無法使用聽力練習。</p>
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
      const questions = groups.flatMap(g => g.questions)
      const correct = questions.filter(q => session.answers[q.id] === q.answer).length
      setHistory(prev => [...prev, { date: toDateKey(), testId: test.id, part: session.part, correct, total: questions.length }].slice(-200))
      setCollected(0)
      void collect(questions.filter(q => session.answers[q.id] !== q.answer)).then(setCollected)
      setResult(session)
      setSession(null)
      window.scrollTo({ top: 0 })
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
              style={{ width: `${((session.index + (session.checked ? 1 : 0)) / groups.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-muted tabular-nums">
            {session.index + 1}/{groups.length}
          </span>
        </div>

        <Player key={group.id} group={group} rate={speed} voices={voices} />

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
          <p className="mt-1 text-sm text-muted">答對率 {pct}%</p>
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
        <p className="mb-2 text-sm font-semibold text-fg">朗讀速度</p>
        <div className="flex rounded-xl bg-surface-2 p-1">
          {SPEEDS.map(s => (
            <button
              key={s.rate}
              onClick={() => setSpeed(s.rate)}
              className={`flex-1 rounded-lg py-2 text-sm transition ${speed === s.rate ? 'bg-surface font-semibold text-primary-ink shadow-sm' : 'text-muted'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-4 mb-2 text-sm font-semibold text-fg">朗讀聲音</p>
        <VoicePicker value={voices} onChange={setVoices} />
      </div>
    </div>
  )
}
