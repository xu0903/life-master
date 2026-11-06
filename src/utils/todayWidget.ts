import { ensureUser, supabase } from './cloud'
import { isHabitDone } from '../data/habits'
import type { Habit } from '../data/habits'
import type { Todo } from '../data/todos'
import type { WordStat } from '../data/toeicWords'
import { addDaysKey, calcStreak } from './date'

/**
 * 「今日任務」小工具：和備忘錄小工具共用 token 與 Scriptable 腳本，
 * 腳本參數填 today 時顯示這一份摘要。預設關閉；開啟後習慣名稱與到期待辦的標題會上傳。
 */
export const TODAY_WIDGET_KEY = 'lifemaster.memoWidgetToday'

const MAX_HABITS = 8
const MAX_TODOS = 5

export interface TodaySummary {
  /** 產生摘要的日期；小工具發現已經跨日時會改顯示「還沒開始」 */
  date: string
  /** 習慣：圖示、名稱、今天是否完成 */
  habits: { i: string; n: string; ok: boolean }[]
  habitsDone: number
  habitsTotal: number
  /** 最長的連續天數，以及這段連續紀錄算到哪一天（超過一天沒接上就歸零） */
  streak: number
  streakEnd: string
  words: { done: number; total: number }
  /** 今天到期要複習的單字數 */
  wordsDue: number
  /** 今天到期或逾期的待辦（最多 5 則）；d = 截止日，小工具用來判斷是否逾期 */
  todos: { t: string; d: string; time?: string }[]
  todosDue: number
}

export function buildTodaySummary(input: {
  today: string
  habits: Habit[]
  todos: Todo[]
  daily: { date: string; ids: string[]; answered: Record<string, unknown> }
  stats: Record<string, WordStat>
  cardIds: Set<string>
}): TodaySummary {
  const { today, habits, todos, daily, stats, cardIds } = input
  const done = habits.map(h => isHabitDone(h, today))

  let streak = 0
  let streakEnd = addDaysKey(today, -1)
  for (const h of habits) {
    const n = calcStreak(h.completedDates)
    if (n > streak) {
      streak = n
      streakEnd = h.completedDates.includes(today) ? today : addDaysKey(today, -1)
    }
  }

  const due = todos
    .filter(t => !t.done && !t.ghostOf && t.dueDate && t.dueDate <= today)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '') || (a.dueTime ?? '99').localeCompare(b.dueTime ?? '99'))
  const dailyToday = daily.date === today

  return {
    date: today,
    habits: habits.slice(0, MAX_HABITS).map((h, i) => ({ i: h.icon, n: h.name.slice(0, 20), ok: done[i] })),
    habitsDone: done.filter(Boolean).length,
    habitsTotal: habits.length,
    streak,
    streakEnd,
    words: dailyToday ? { done: daily.ids.filter(id => id in daily.answered).length, total: daily.ids.length } : { done: 0, total: 0 },
    wordsDue: Object.entries(stats).filter(([id, s]) => cardIds.has(id) && s.due <= today).length,
    todos: due.slice(0, MAX_TODOS).map(t => ({ t: t.text.slice(0, 80), d: t.dueDate!, ...(t.dueTime ? { time: t.dueTime } : {}) })),
    todosDue: due.length,
  }
}

/** 上傳今日摘要；傳 null 代表關閉（雲端那份清掉）。成功回傳 true */
export async function pushTodayWidget(summary: TodaySummary | null): Promise<boolean> {
  if (!supabase || !(await ensureUser())) return false
  const { error } = await supabase.rpc('save_today_widget', { p_today: summary })
  return !error
}
