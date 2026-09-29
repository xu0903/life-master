export type Priority = 'high' | 'medium' | 'low'

/** 提醒時間選項 */
export type RemindOption = 'none' | 'eve' | 'morning' | 'at' | '10m' | '30m' | '1h' | '3h' | '1d'

export interface Todo {
  id: string
  text: string
  priority: Priority
  category: string
  done: boolean
  createdDate: string
  completedDate?: string
  /** 截止日 YYYY-MM-DD（選填） */
  dueDate?: string
  /** 截止時間 HH:mm（選填，沒填視為全天） */
  dueTime?: string
  /** 提醒方式，舊資料沒有此欄位 = 不提醒 */
  remind?: RemindOption
  /** 已發出提醒的時間，避免重複通知；改時間時會清掉 */
  notifiedAt?: string
}

export const TODOS_KEY = 'lifemaster.todos'

export const PRIORITIES: Record<Priority, { label: string; badge: string; order: number }> = {
  high: { label: '高', badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', order: 0 },
  medium: { label: '中', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400', order: 1 },
  low: { label: '低', badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-400', order: 2 },
}

export const CATEGORIES = ['工作', '學習', '生活', '其他']

export const REMIND_OPTIONS: { value: RemindOption; label: string; needsTime?: boolean }[] = [
  { value: 'eve', label: '前一天晚上 8 點' },
  { value: 'morning', label: '當天早上 8 點' },
  { value: '1d', label: '前一天同一時間', needsTime: true },
  { value: '3h', label: '3 小時前', needsTime: true },
  { value: '1h', label: '1 小時前', needsTime: true },
  { value: '30m', label: '30 分鐘前', needsTime: true },
  { value: '10m', label: '10 分鐘前', needsTime: true },
  { value: 'at', label: '準時', needsTime: true },
  { value: 'none', label: '不提醒' },
]

export const DEFAULT_REMIND: RemindOption = 'eve'

function at(dateKey: string, time: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

/** 截止時間；沒填時間的話回傳當天 00:00（全天事件） */
export function dueStart(todo: Todo): Date | null {
  if (!todo.dueDate) return null
  return at(todo.dueDate, todo.dueTime ?? '00:00')
}

/** 計算提醒時間；沒有截止日或不提醒時回傳 null */
export function reminderAt(todo: Todo): Date | null {
  const remind = todo.remind ?? 'none'
  if (!todo.dueDate || remind === 'none') return null
  // 需要時間的選項，沒填時間時以早上 9 點計算
  const base = at(todo.dueDate, todo.dueTime ?? '09:00')
  const minus = (min: number) => new Date(base.getTime() - min * 60000)
  switch (remind) {
    case 'eve': {
      const d = at(todo.dueDate, '20:00')
      d.setDate(d.getDate() - 1)
      return d
    }
    case 'morning':
      return at(todo.dueDate, '08:00')
    case 'at':
      return base
    case '10m':
      return minus(10)
    case '30m':
      return minus(30)
    case '1h':
      return minus(60)
    case '3h':
      return minus(180)
    case '1d':
      return minus(1440)
  }
}

export function formatDue(todo: Todo): string {
  if (!todo.dueDate) return ''
  const [, m, d] = todo.dueDate.split('-').map(Number)
  return `${m}/${d}${todo.dueTime ? ` ${todo.dueTime}` : ''}`
}
