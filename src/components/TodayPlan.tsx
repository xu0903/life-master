import { BookOpen, BookX, CheckCircle2, ChevronRight, Circle, ListTodo, Repeat, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { MISTAKE_DECK } from '../hooks/useMistakeWords'
import { VOCAB_HABIT, isHabitDone } from '../data/habits'
import type { Habit } from '../data/habits'
import { GROUP_BY_ID, READING_WRONG_KEY } from '../data/reading'
import { TODOS_KEY } from '../data/todos'
import { TASKS } from '../data/studyPlan'
import type { Todo } from '../data/todos'
import { recentWrongIds } from '../data/toeicWords'
import { useDecks } from '../hooks/useCards'
import { useWordStats } from '../hooks/useDailyWords'
import { useStudyPlan } from '../hooks/useStudyPlan'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { toDateKey } from '../utils/date'

interface Props {
  habits: Habit[]
  words: { label: string; answered: number; total: number; complete: boolean; ready: boolean }
  onOpenWords: () => void
  onPractice: (mode: string, filter?: string) => void
  onTodos: () => void
  onHabit: (id: string) => void
}

function Row({
  done,
  icon,
  title,
  sub,
  onClick,
  children,
}: {
  done?: boolean
  icon: ReactNode
  title: string
  sub: string
  onClick: () => void
  children?: ReactNode
}) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-3 py-2.5 text-left">
        {done === undefined ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-primary-ink">{icon}</span>
        ) : done ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 shrink-0 text-faint" />
        )}
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-medium ${done ? 'text-faint line-through' : 'text-fg'}`}>{title}</span>
          <span className="block truncate text-xs text-muted">{sub}</span>
          {children}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-faint" />
      </button>
    </li>
  )
}

/** 今日任務：把今天該做的事（每日單字、習慣、到期待辦）和建議複習的內容整理成一張清單 */
export default function TodayPlan({ habits, words, onOpenWords, onPractice, onTodos, onHabit }: Props) {
  const today = toDateKey()
  const [todos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [wrongQuestions] = useLocalStorage<string[]>(READING_WRONG_KEY, [])
  const [stats] = useWordStats()
  const { decks } = useDecks()
  const plan = useStudyPlan()
  // 多益菜單（每日單字已經是獨立一項，這裡不重複算）
  const planTasks = plan.settings ? plan.todayTasks.filter(t => t.kind !== 'words') : []
  const planDone = planTasks.filter(plan.isDone).length

  const others = habits.filter(h => h.id !== VOCAB_HABIT.id)
  const remaining = others.filter(h => !isHabitDone(h, today))
  const dueTodos = todos.filter(t => !t.done && t.dueDate && t.dueDate <= today)
  const overdue = dueTodos.filter(t => t.dueDate! < today).length

  const mistakeDeck = decks.find(d => d.id === MISTAKE_DECK.id)
  const mistakeToReview = (mistakeDeck?.cardIds ?? []).filter(id => (stats[id]?.box ?? 0) < 3).length
  const recentWrong = recentWrongIds(stats, today).length
  const readingWrong = wrongQuestions.filter(id => GROUP_BY_ID.has(id.slice(0, id.lastIndexOf('-')))).length

  // 必做：每日單字、每個習慣、今天到期的待辦
  const tasks = [
    words.ready ? words.complete : null,
    ...others.map(h => isHabitDone(h, today)),
    dueTodos.length === 0,
    planTasks.length ? planDone === planTasks.length : null,
  ].filter((x): x is boolean => x !== null)
  const doneTasks = tasks.filter(Boolean).length
  const suggestions = mistakeToReview + recentWrong + readingWrong

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <p className="flex items-center gap-1.5 font-semibold text-fg">
          <Sparkles className="h-4 w-4 text-primary-ink" /> 今日任務
        </p>
        <p className="text-sm text-muted tabular-nums">
          <span className="font-bold text-fg">{doneTasks}</span> / {tasks.length}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${tasks.length ? (doneTasks / tasks.length) * 100 : 0}%` }} />
      </div>

      <ul className="mt-1 divide-y divide-line">
        {words.ready && (
          <Row
            done={words.complete}
            icon={null}
            title={`每日${words.label} 10 字`}
            sub={words.complete ? '已完成' : `進度 ${words.answered} / ${words.total}`}
            onClick={onOpenWords}
          />
        )}
        {planTasks.length > 0 && (
          <Row
            done={planDone === planTasks.length}
            icon={null}
            title={`多益菜單 ${planDone} / ${planTasks.length}`}
            sub={
              planTasks
                .filter(t => !plan.isDone(t))
                .map(t => `${TASKS[t.kind].label.replace(/^(閱讀|聽力) /, '')} ${t.amount} ${TASKS[t.kind].unit}`)
                .join('、') || '今天的菜單完成了'
            }
            onClick={() => onPractice('plan')}
          />
        )}
        <Row
          done={remaining.length === 0}
          icon={null}
          title={`習慣 ${others.length - remaining.length} / ${others.length}`}
          sub={remaining.length ? `還沒完成：${remaining.map(h => h.name).join('、')}` : '今天的習慣都完成了'}
          onClick={() => remaining[0] && onHabit(remaining[0].id)}
        />
        <Row
          done={dueTodos.length === 0}
          icon={null}
          title={dueTodos.length ? `待辦 ${dueTodos.length} 項到期` : '沒有到期的待辦'}
          sub={
            dueTodos.length
              ? `${overdue ? `其中 ${overdue} 項已逾期・` : ''}${dueTodos
                  .slice(0, 3)
                  .map(t => t.text)
                  .join('、')}`
              : '今天沒有截止的事'
          }
          onClick={onTodos}
        />
      </ul>

      {suggestions > 0 && (
        <>
          <p className="mt-3 mb-0.5 text-xs font-semibold text-faint">建議複習</p>
          <ul className="divide-y divide-line">
            {mistakeToReview > 0 && (
              <Row
                icon={<BookX className="h-4 w-4" />}
                title={`錯題生字 ${mistakeToReview} 個`}
                sub="閱讀、聽力、文法答錯題裡的單字"
                onClick={() => onPractice('flip', `deck:${MISTAKE_DECK.id}`)}
              />
            )}
            {recentWrong > 0 && (
              <Row
                icon={<Repeat className="h-4 w-4" />}
                title={`最近常錯的單字 ${recentWrong} 個`}
                sub="每日單字與刷題答錯的字"
                onClick={() => onPractice('flip', 'wrong')}
              />
            )}
            {readingWrong > 0 && (
              <Row
                icon={<BookOpen className="h-4 w-4" />}
                title={`閱讀錯題本 ${readingWrong} 題`}
                sub="再寫一次，答對就會移出錯題本"
                onClick={() => onPractice('reading')}
              />
            )}
          </ul>
        </>
      )}

      {dueTodos.length === 0 && remaining.length === 0 && (!words.ready || words.complete) && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
          <ListTodo className="h-4 w-4" /> 今天的任務全部完成，太棒了！
        </p>
      )}
    </div>
  )
}
