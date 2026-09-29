import { useEffect, useState } from 'react'
import { Check, ChevronRight, Flame, Settings2 } from 'lucide-react'
import DailyQuiz from './DailyQuiz'
import { VOCAB_HABIT, habitColor, habitIcon } from '../data/habits'
import { useDailyWords } from '../hooks/useDailyWords'
import { useHabits } from '../hooks/useHabits'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { addDays, calcStreak, toDateKey } from '../utils/date'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function Habits({ onManage }: { onManage: () => void }) {
  const { habits, toggleDate, markDone } = useHabits()
  const [quizPromptDate, setQuizPromptDate] = useLocalStorage('lifemaster.quizPromptDate', '')
  const [quizOpen, setQuizOpen] = useState(false)
  const daily = useDailyWords()
  const today = toDateKey()

  // 每日測驗做完 → 自動打卡背單字
  useEffect(() => {
    if (daily.complete) markDone(VOCAB_HABIT.id, today)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- markDone 每次 render 都是新函式，只在完成狀態改變時執行
  }, [daily.complete, today])

  // 每天第一次打開時自動跳出測驗
  useEffect(() => {
    if (daily.ready && !daily.complete && quizPromptDate !== today) {
      setQuizOpen(true)
      setQuizPromptDate(today)
    }
  }, [daily.ready, daily.complete, quizPromptDate, today, setQuizPromptDate])

  // 最近 7 天（含今天），用來顯示小圓點紀錄
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6))
  const doneCount = habits.filter(h => h.completedDates.includes(today)).length

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
      </div>

      {daily.ready && (
        <button
          onClick={() => setQuizOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-primary/20 transition active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-2xl">📖</div>
          <div className="flex-1">
            <p className="font-semibold text-fg">每日多益 10 字</p>
            <p className="text-sm text-muted">
              {daily.complete
                ? '今天已完成，點擊複習'
                : `進度 ${daily.answeredCount} / ${daily.words.length}` +
                  (daily.reviewIds.size ? `・含 ${daily.reviewIds.size} 個複習字` : '')}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-faint" />
        </button>
      )}

      {habits.map(habit => {
        const Icon = habitIcon(habit)
        const color = habitColor(habit)
        const doneToday = habit.completedDates.includes(today)
        const streak = calcStreak(habit.completedDates)
        const isVocab = habit.id === VOCAB_HABIT.id

        return (
          <div key={habit.id} className="rounded-2xl bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color.chip}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-fg">{habit.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted">
                  <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-500' : 'text-faint'}`} />
                  連續 <span className="font-bold text-fg">{streak}</span> 天
                </p>
              </div>
              <button
                onClick={() => (isVocab ? setQuizOpen(true) : toggleDate(habit.id, today))}
                className={`flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
                  doneToday ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-surface-2 text-muted'
                }`}
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
            </div>

            <div className="mt-4 flex justify-between">
              {last7.map(day => {
                const key = toDateKey(day)
                const done = habit.completedDates.includes(key)
                return (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className={`text-xs ${key === today ? 'font-bold text-primary-ink' : 'text-faint'}`}>
                      {WEEKDAYS[day.getDay()]}
                    </span>
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
        <DailyQuiz
          words={daily.words}
          answered={daily.answered}
          reviewIds={daily.reviewIds}
          onAnswer={daily.answer}
          onClose={() => setQuizOpen(false)}
        />
      )}
    </div>
  )
}
