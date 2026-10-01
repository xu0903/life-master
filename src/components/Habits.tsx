import { useEffect, useState } from 'react'
import { ArrowRight, Bell, CalendarClock, Check, Droplet, Flame, Minus, Play, Plus, Settings2, Square } from 'lucide-react'
import DailyQuiz from './DailyQuiz'
import TodayPlan from './TodayPlan'
import { ACTIVITY_LINKS, HABIT_TIMER_KEY, VOCAB_HABIT, habitColor, habitGoal, habitIcon, habitKind, habitStreak, isHabitDone, weekCount } from '../data/habits'
import type { ActivityLink, Habit, HabitTimer } from '../data/habits'
import { sourceLabel } from '../data/vocab'
import { useActivityToday } from '../hooks/useActivity'
import { useDailyWords, useWordSource } from '../hooks/useDailyWords'
import { useExams } from '../hooks/useExams'
import { useHabits } from '../hooks/useHabits'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { addDays, toDateKey } from '../utils/date'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

/** 「組數」習慣連到的 App 內練習：點「去練習」會打開對應的學習模式 */
const LINK_MODE: Record<ActivityLink, string> = { reading: 'reading', listening: 'listening', words: 'flip', grammar: 'grammar' }

const fmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1))
/** 計時類習慣的分鐘數顯示成 分:秒（計時器記錄到秒） */
const minSec = (minutes: number) => {
  const total = Math.round(minutes * 60)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
const clock = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function Progress({ value, goal, done }: { value: number; goal: number; done: boolean }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
      <div
        className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-primary'}`}
        style={{ width: `${Math.min(100, (value / goal) * 100)}%` }}
      />
    </div>
  )
}

export default function Habits({
  onManage,
  onPractice,
  onTodos,
}: {
  onManage: () => void
  onPractice: (mode: string, filter?: string) => void
  onTodos: () => void
}) {
  const { habits, toggleDate, markDone, addAmount, setAmount } = useHabits()
  const { upcoming } = useExams()
  const activity = useActivityToday()
  const [timer, setTimer] = useLocalStorage<HabitTimer | null>(HABIT_TIMER_KEY, null)
  const [now, setNow] = useState(Date.now)
  const [quizPromptDate, setQuizPromptDate] = useLocalStorage('lifemaster.quizPromptDate', '')
  const [quizOpen, setQuizOpen] = useState(false)
  const daily = useDailyWords()
  const [wordSource] = useWordSource()
  const today = toDateKey()

  // 每日測驗做完 → 自動打卡背單字
  useEffect(() => {
    if (daily.complete) markDone(VOCAB_HABIT.id, today)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- markDone 每次 render 都是新函式，只在完成狀態改變時執行
  }, [daily.complete, today])

  // 連到 App 內練習的組數習慣：依今天的練習量自動更新組數
  const linkedSets = (h: Habit) => (h.link ? Math.floor(activity[h.link] / Math.max(1, h.perSet ?? 1)) : 0)
  const linkedKey = habits.map(h => (h.link ? `${h.id}:${linkedSets(h)}` : '')).join('|')
  useEffect(() => {
    for (const h of habits) if (h.link) setAmount(h.id, today, linkedSets(h))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在練習量改變時同步
  }, [linkedKey, today])

  // 計時器跑的時候每秒更新畫面
  useEffect(() => {
    if (!timer) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [timer])

  // 每天第一次打開時自動跳出測驗
  useEffect(() => {
    if (daily.ready && !daily.complete && quizPromptDate !== today) {
      setQuizOpen(true)
      setQuizPromptDate(today)
    }
  }, [daily.ready, daily.complete, quizPromptDate, today, setQuizPromptDate])

  const startTimer = (h: Habit) => {
    setNow(Date.now())
    setTimer({ habitId: h.id, startAt: Date.now() })
  }
  const stopTimer = () => {
    if (!timer) return
    // 照實際時間記錄（精確到秒），不再四捨五入成整分鐘；不到 1 秒當作誤按
    const seconds = Math.round((Date.now() - timer.startAt) / 1000)
    if (seconds >= 1) addAmount(timer.habitId, toDateKey(), seconds / 60)
    setTimer(null)
  }

  // 最近 7 天（含今天），用來顯示小圓點紀錄
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6))
  const doneCount = habits.filter(h => isHabitDone(h, today)).length

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-2 p-5 text-on-primary shadow-lg">
        <p className="text-sm opacity-80">今日完成</p>
        <p className="mt-1 text-3xl font-bold">
          {doneCount} <span className="text-lg font-medium opacity-80">/ {habits.length} 個習慣</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-current transition-all duration-500"
            style={{ width: `${habits.length ? (doneCount / habits.length) * 100 : 0}%` }}
          />
        </div>
        {upcoming.slice(0, 3).map(e => (
          <p key={e.id} className="mt-2 flex items-center gap-1.5 text-sm opacity-90 first-of-type:mt-3">
            <CalendarClock className="h-4 w-4" />
            {e.days === 0 ? `今天就是${e.name}，加油！` : `距離${e.name}還有 ${e.days} 天`}
          </p>
        ))}
      </div>

      <TodayPlan
        habits={habits}
        words={{
          label: sourceLabel(wordSource),
          answered: daily.answeredCount,
          total: daily.words.length,
          complete: daily.complete,
          ready: daily.ready,
        }}
        onOpenWords={() => setQuizOpen(true)}
        onPractice={onPractice}
        onTodos={onTodos}
        onHabit={id => document.getElementById(`habit-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      />

      {habits.map(habit => {
        const Icon = habitIcon(habit)
        const color = habitColor(habit)
        const doneToday = habit.completedDates.includes(today)
        const streak = habitStreak(habit)
        const isVocab = habit.id === VOCAB_HABIT.id
        const kind = isVocab ? 'check' : habitKind(habit)
        const goal = habitGoal(habit)
        const amount = habit.counts?.[today] ?? 0
        const running = timer?.habitId === habit.id
        const link = ACTIVITY_LINKS.find(l => l.value === habit.link)

        const doneClass = 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
        const roundBtn = 'rounded-full p-2 transition active:scale-95'

        // 右上角的主要按鈕
        let action
        if (kind === 'check') {
          action = (
            <button
              onClick={() => (isVocab ? setQuizOpen(true) : toggleDate(habit.id, toDateKey()))}
              className={`flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${doneToday ? doneClass : 'bg-surface-2 text-muted'}`}
            >
              {doneToday ? (
                <>
                  <Check className="h-4 w-4" /> 已完成
                </>
              ) : isVocab ? (
                '去測驗'
              ) : (
                '打卡'
              )}
            </button>
          )
        } else if (kind === 'water') {
          action = (
            <button
              onClick={() => addAmount(habit.id, toDateKey(), habit.bottleMl ?? 500)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition active:scale-95 ${doneToday ? doneClass : 'bg-sky-500 text-white'}`}
            >
              <Droplet className="h-4 w-4" /> +1 瓶
            </button>
          )
        } else if (kind === 'duration') {
          action = running ? (
            <button
              onClick={stopTimer}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white tabular-nums"
            >
              <Square className="h-3.5 w-3.5 fill-current" /> {clock(now - timer.startAt)}
            </button>
          ) : (
            <button
              onClick={() => startTimer(habit)}
              disabled={!!timer}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition active:scale-95 disabled:opacity-40 ${doneToday ? doneClass : 'bg-primary text-on-primary'}`}
            >
              <Play className="h-4 w-4 fill-current" /> 計時
            </button>
          )
        } else if (kind === 'sets' && link) {
          action = (
            <button
              onClick={() => onPractice(LINK_MODE[link.value])}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition active:scale-95 ${doneToday ? doneClass : 'bg-primary text-on-primary'}`}
            >
              {doneToday ? <Check className="h-4 w-4" /> : null} 去練習 <ArrowRight className="h-4 w-4" />
            </button>
          )
        } else {
          // count 或手動的 sets
          const step = kind === 'count' ? (habit.step ?? 1) : 1
          action = (
            <button
              onClick={() => addAmount(habit.id, toDateKey(), step)}
              className={`${roundBtn} ${doneToday ? doneClass : 'bg-primary text-on-primary'}`}
              aria-label="增加"
            >
              {doneToday ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          )
        }

        // 第二列：進度與次要按鈕
        let detail = null
        if (kind === 'water') {
          const bottle = habit.bottleMl ?? 500
          detail = (
            <>
              <span className="w-28 shrink-0 text-sm font-semibold text-fg tabular-nums">
                {fmt(amount)} <span className="text-xs font-normal text-muted">/ {fmt(goal)} ml</span>
              </span>
              <Progress value={amount} goal={goal} done={doneToday} />
              <button
                onClick={() => addAmount(habit.id, toDateKey(), -bottle / 2)}
                disabled={amount <= 0}
                className="rounded-full bg-surface-2 px-2 py-1 text-xs text-muted disabled:opacity-30"
              >
                −½
              </button>
              <button
                onClick={() => addAmount(habit.id, toDateKey(), bottle / 2)}
                className="rounded-full bg-sky-500/15 px-2 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400"
              >
                +½
              </button>
            </>
          )
        } else if (kind === 'duration') {
          detail = (
            <>
              <span className="w-28 shrink-0 text-sm font-semibold text-fg tabular-nums">
                {minSec(amount)} <span className="text-xs font-normal text-muted">/ {goal} 分鐘</span>
              </span>
              <Progress value={amount} goal={goal} done={doneToday} />
              <button
                onClick={() => addAmount(habit.id, toDateKey(), -10)}
                disabled={amount <= 0}
                className="rounded-full bg-surface-2 px-2 py-1 text-xs text-muted disabled:opacity-30"
              >
                −10
              </button>
              <button
                onClick={() => addAmount(habit.id, toDateKey(), 10)}
                className="rounded-full bg-primary-soft px-2 py-1 text-xs font-semibold text-primary-ink"
              >
                +10
              </button>
            </>
          )
        } else if (kind === 'sets' || kind === 'count') {
          const unit = kind === 'sets' ? '組' : (habit.unit ?? '')
          detail = (
            <>
              <span className="w-28 shrink-0 text-sm font-semibold text-fg tabular-nums">
                {fmt(amount)}{' '}
                <span className="text-xs font-normal text-muted">
                  / {fmt(goal)} {unit}
                </span>
              </span>
              <Progress value={amount} goal={goal} done={doneToday} />
              {link ? (
                <span className="shrink-0 text-xs text-faint">
                  今天 {activity[link.value]} {link.unit}
                </span>
              ) : (
                <button
                  onClick={() => addAmount(habit.id, toDateKey(), -(kind === 'count' ? (habit.step ?? 1) : 1))}
                  disabled={amount <= 0}
                  className="rounded-full bg-surface-2 p-1.5 text-muted disabled:opacity-30"
                  aria-label="減少"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )
        }

        return (
          <div key={habit.id} id={`habit-${habit.id}`} className="scroll-mt-24 rounded-2xl bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color.chip}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-fg">{habit.name}</p>
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Flame className={`h-4 w-4 ${streak.count > 0 ? 'text-orange-500' : 'text-faint'}`} />
                    連續 <span className="font-bold text-fg">{streak.count}</span> {streak.unit}
                  </span>
                  {kind === 'sets' && (
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs whitespace-nowrap">
                      {habit.perSet ?? 1} {habit.unit ?? link?.unit ?? '下'} × {goal} 組
                    </span>
                  )}
                  {habit.weeklyTarget && (
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs whitespace-nowrap">
                      本週 {weekCount(habit)}/{habit.weeklyTarget}
                    </span>
                  )}
                  {habit.remindTime && (
                    <span className="flex items-center gap-0.5 text-xs whitespace-nowrap text-faint">
                      <Bell className="h-3 w-3" />
                      {habit.remindTime}
                    </span>
                  )}
                </p>
              </div>
              {action}
            </div>

            {detail && <div className="mt-3 flex items-center gap-2">{detail}</div>}

            <div className="mt-4 flex justify-between">
              {last7.map(day => {
                const key = toDateKey(day)
                const done = habit.completedDates.includes(key)
                return (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className={`text-xs ${key === today ? 'font-bold text-primary-ink' : 'text-faint'}`}>{WEEKDAYS[day.getDay()]}</span>
                    <span
                      className={`h-6 w-6 rounded-full ${done ? color.dot : 'bg-surface-2'} ${
                        key === today ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-surface' : ''
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <button
        onClick={onManage}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 text-sm text-muted transition hover:bg-surface"
      >
        <Settings2 className="h-4 w-4" /> 新增或管理習慣
      </button>

      {quizOpen && (
        <DailyQuiz words={daily.words} answered={daily.answered} reviewIds={daily.reviewIds} onAnswer={daily.answer} onClose={() => setQuizOpen(false)} />
      )}
    </div>
  )
}
