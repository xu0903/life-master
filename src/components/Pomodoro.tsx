import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { POMODORO_INITIAL, POMODORO_KEY, POMODORO_MINUTES } from '../data/pomodoro'
import type { PomodoroState } from '../data/pomodoro'
import { habitKind } from '../data/habits'
import { useHabits } from '../hooks/useHabits'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { toDateKey } from '../utils/date'
import { showNotification } from '../utils/reminders'

const MINUTES = POMODORO_MINUTES

/** 番茄鐘：專注 25 分鐘、休息 5 分鐘。用結束時間點計算，App 切到背景再回來時間也不會跑掉。 */
export default function Pomodoro() {
  const [state, setState] = useLocalStorage<PomodoroState>(POMODORO_KEY, POMODORO_INITIAL)
  const [now, setNow] = useState(Date.now)
  const { habits, addAmount } = useHabits()
  const timeHabits = habits.filter(h => habitKind(h) === 'duration')
  const linked = timeHabits.find(h => h.id === state.habitId)
  const running = state.endAt !== null
  const left = state.endAt !== null ? Math.max(0, Math.ceil((state.endAt - now) / 1000)) : state.left
  const today = toDateKey()
  const doneToday = state.log[today] ?? 0

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [running])

  // 時間到：專注結束記一顆番茄並進入休息，休息結束回到專注
  useEffect(() => {
    if (!running || left > 0) return
    const focus = state.mode === 'focus'
    void showNotification(focus ? '番茄鐘時間到' : '休息結束', focus ? '休息 5 分鐘吧' : '開始下一個番茄鐘', 'pomodoro')
    const next = focus ? 'break' : 'focus'
    if (focus && linked) addAmount(linked.id, today, MINUTES.focus)
    setState(s => ({
      ...s,
      mode: next,
      endAt: null,
      left: MINUTES[next] * 60,
      log: focus ? { ...s.log, [today]: (s.log[today] ?? 0) + 1 } : s.log,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在時間到的那一刻執行一次
  }, [running, left, state.mode, today, setState])

  const toggle = () => {
    setNow(Date.now())
    setState(s => (s.endAt !== null ? { ...s, endAt: null, left } : { ...s, endAt: Date.now() + s.left * 1000 }))
  }
  const reset = () => setState(s => ({ ...s, mode: 'focus', endAt: null, left: MINUTES.focus * 60 }))

  const total = MINUTES[state.mode] * 60
  const touched = running || left !== total || state.mode === 'break'

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${state.mode === 'focus' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
        <Timer className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-fg tabular-nums">
          {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
        </p>
        <p className="text-xs text-muted">
          {state.mode === 'focus' ? '專注' : '休息'}・今天完成 {doneToday} 個番茄鐘
        </p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full ${state.mode === 'focus' ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${(1 - left / total) * 100}%` }}
          />
        </div>
      </div>
      {touched && (
        <button onClick={reset} className="rounded-full p-2 text-faint" aria-label="重設">
          <RotateCcw className="h-5 w-5" />
        </button>
      )}
      <button
        onClick={toggle}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition active:scale-95"
        aria-label={running ? '暫停' : '開始'}
      >
        {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>
    </div>
    {timeHabits.length > 0 && (
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="shrink-0 text-faint">專注完記到：</span>
        {[{ id: '', name: '不記錄' }, ...timeHabits].map(h => (
          <button
            key={h.id}
            onClick={() => setState(s => ({ ...s, habitId: h.id || undefined }))}
            className={`shrink-0 rounded-full px-2.5 py-1 ${(state.habitId ?? '') === h.id ? 'bg-primary font-semibold text-on-primary' : 'bg-surface-2 text-muted'}`}
          >
            {h.name}
          </button>
        ))}
      </div>
    )}
    </div>
  )
}
