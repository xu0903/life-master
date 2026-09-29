import { useEffect, useState } from 'react'
import { BookOpen, Check, ChevronRight, Droplet, Dumbbell, Flame, Languages } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import DailyQuiz from './DailyQuiz'
import { useDailyWords } from '../hooks/useDailyWords'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { addDays, calcStreak, toDateKey } from '../utils/date'

type HabitIcon = 'water' | 'exercise' | 'read' | 'vocab'

interface Habit {
  id: string
  name: string
  icon: HabitIcon
  completedDates: string[]
}

const ICONS: Record<HabitIcon, { Icon: LucideIcon; color: string }> = {
  water: { Icon: Droplet, color: 'bg-sky-100 text-sky-600' },
  exercise: { Icon: Dumbbell, color: 'bg-orange-100 text-orange-600' },
  read: { Icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' },
  vocab: { Icon: Languages, color: 'bg-violet-100 text-violet-600' },
}

/** 背單字由每日測驗自動打卡，不能手動切換 */
const VOCAB_HABIT: Habit = { id: 'vocab', name: '背單字', icon: 'vocab', completedDates: [] }

const DEFAULT_HABITS: Habit[] = [
  { id: 'water', name: '喝水', icon: 'water', completedDates: [] },
  { id: 'exercise', name: '運動', icon: 'exercise', completedDates: [] },
  { id: 'read', name: '讀書', icon: 'read', completedDates: [] },
  VOCAB_HABIT,
]

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function Habits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('lifemaster.habits', DEFAULT_HABITS)
  const [quizPromptDate, setQuizPromptDate] = useLocalStorage('lifemaster.quizPromptDate', '')
  const [quizOpen, setQuizOpen] = useState(false)
  const daily = useDailyWords()
  const today = toDateKey()

  // 舊資料沒有「背單字」習慣時補上
  useEffect(() => {
    setHabits(prev => (prev.some(h => h.id === VOCAB_HABIT.id) ? prev : [...prev, VOCAB_HABIT]))
  }, [setHabits])

  // 每日測驗做完 → 自動打卡背單字
  useEffect(() => {
    if (!daily.complete) return
    setHabits(prev =>
      prev.map(h =>
        h.id === VOCAB_HABIT.id && !h.completedDates.includes(today)
          ? { ...h, completedDates: [...h.completedDates, today] }
          : h,
      ),
    )
  }, [daily.complete, today, setHabits])

  // 每天第一次打開時自動跳出測驗
  useEffect(() => {
    if (daily.ready && !daily.complete && quizPromptDate !== today) {
      setQuizOpen(true)
      setQuizPromptDate(today)
    }
  }, [daily.ready, daily.complete, quizPromptDate, today, setQuizPromptDate])

  // 最近 7 天（含今天），用來顯示小圓點紀錄
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6))

  const toggleToday = (id: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id) return h
        const done = h.completedDates.includes(today)
        return {
          ...h,
          completedDates: done
            ? h.completedDates.filter(d => d !== today)
            : [...h.completedDates, today],
        }
      }),
    )
  }

  const doneCount = habits.filter(h => h.completedDates.includes(today)).length

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">今日完成</p>
        <p className="mt-1 text-3xl font-bold">
          {doneCount} <span className="text-lg font-medium opacity-80">/ {habits.length} 個習慣</span>
        </p>
      </div>

      {daily.ready && (
        <button
          onClick={() => setQuizOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-violet-100 transition active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">📖</div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">每日多益 10 字</p>
            <p className="text-sm text-slate-500">
              {daily.complete ? '今天已完成，點擊複習' : `進度 ${daily.answeredCount} / ${daily.words.length}，完成自動打卡`}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </button>
      )}

      {habits.map(habit => {
        const { Icon, color } = ICONS[habit.icon]
        const doneToday = habit.completedDates.includes(today)
        const streak = calcStreak(habit.completedDates)
        const isVocab = habit.id === VOCAB_HABIT.id

        return (
          <div key={habit.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{habit.name}</p>
                <p className="flex items-center gap-1 text-sm text-slate-500">
                  <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-500' : 'text-slate-300'}`} />
                  連續 <span className="font-bold text-slate-700">{streak}</span> 天
                </p>
              </div>
              <button
                onClick={() => (isVocab ? setQuizOpen(true) : toggleToday(habit.id))}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
                  doneToday
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                    <span className={`text-xs ${key === today ? 'font-bold text-indigo-600' : 'text-slate-400'}`}>
                      {WEEKDAYS[day.getDay()]}
                    </span>
                    <span
                      className={`h-6 w-6 rounded-full ${done ? 'bg-emerald-400' : 'bg-slate-100'} ${
                        key === today ? 'ring-2 ring-indigo-300 ring-offset-1' : ''
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {quizOpen && (
        <DailyQuiz
          words={daily.words}
          answered={daily.answered}
          deckIds={daily.deckIds}
          onAnswer={daily.answer}
          onAddToDeck={daily.addToDeck}
          onClose={() => setQuizOpen(false)}
        />
      )}
    </div>
  )
}
