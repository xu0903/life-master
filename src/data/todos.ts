/** 優先級：緊急 / 重要兩個維度分成四類（艾森豪矩陣）；舊資料是 high / medium / low */
export type Quadrant = 'q1' | 'q2' | 'q3' | 'q4'
export type Priority = Quadrant | 'high' | 'medium' | 'low'

/** 提醒時間選項 */
export type RemindOption = 'none' | 'eve' | 'morning' | 'at' | '10m' | '30m' | '1h' | '3h' | '1d'

export interface Todo {
  id: string
  text: string
  priority: Priority
  /** 分類顏色 id（對應 TAG_COLORS）；舊資料存的是「工作」「學習」等文字 */
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
  /** 備註 */
  note?: string
  /** 重複：完成這一次後自動產生下一次 */
  repeat?: Repeat
  /** 每月重複的日期（避免 1/31 → 2/28 → 3/28 越跑越前面） */
  repeatDay?: number
  /** 完成時自動產生的下一次任務 id；取消完成時一起收回 */
  spawnedId?: string
  /** 只用在月曆顯示：未來重複日期的預覽，指向原本的任務 */
  ghostOf?: string
}

export type Repeat = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export const REPEAT_OPTIONS: { value: Repeat | 'none'; label: string }[] = [
  { value: 'none', label: '不重複' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每週' },
  { value: 'biweekly', label: '隔週' },
  { value: 'monthly', label: '每月' },
]
export const repeatLabel = (r: Repeat) => REPEAT_OPTIONS.find(o => o.value === r)?.label ?? ''

function shiftDate(key: string, repeat: Repeat, monthDay: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (repeat === 'daily') date.setDate(d + 1)
  else if (repeat === 'weekly') date.setDate(d + 7)
  else if (repeat === 'biweekly') date.setDate(d + 14)
  else {
    // 下個月的同一天；那個月沒有這一天就用月底
    const last = new Date(y, m + 1, 0).getDate()
    date.setFullYear(y, m, Math.min(monthDay, last))
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const monthDayOf = (todo: Todo) => todo.repeatDay ?? Number(todo.dueDate?.slice(8) ?? 1)

/** 完成重複任務後，下一次的截止日：至少往後一期，而且不會早於今天（逾期很久才完成時直接排到今天以後） */
export function nextOccurrence(todo: Todo, today: string): string {
  let next = shiftDate(todo.dueDate!, todo.repeat!, monthDayOf(todo))
  while (next < today) next = shiftDate(next, todo.repeat!, monthDayOf(todo))
  return next
}

/** 月曆預覽：這個重複任務在 [from, to] 之間、這一次之後的日期 */
export function upcomingDates(todo: Todo, from: string, to: string): string[] {
  if (!todo.repeat || !todo.dueDate || todo.done) return []
  const dates: string[] = []
  let next = shiftDate(todo.dueDate, todo.repeat, monthDayOf(todo))
  while (next <= to && dates.length < 62) {
    if (next >= from) dates.push(next)
    next = shiftDate(next, todo.repeat, monthDayOf(todo))
  }
  return dates
}

export const TODOS_KEY = 'lifemaster.todos'

export const QUADRANTS: Record<Quadrant, { label: string; urgent: boolean; important: boolean; tone: string; dot: string }> = {
  q1: { label: '重要且緊急', urgent: true, important: true, tone: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
  q2: { label: '重要不緊急', urgent: false, important: true, tone: 'text-sky-700 dark:text-sky-400', dot: 'bg-sky-500' },
  q3: { label: '緊急不重要', urgent: true, important: false, tone: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  q4: { label: '不緊急不重要', urgent: false, important: false, tone: 'text-muted', dot: 'bg-slate-400' },
}
export const QUADRANT_ORDER: Quadrant[] = ['q1', 'q2', 'q3', 'q4']
export const DEFAULT_QUADRANT: Quadrant = 'q2'

export function quadrantOf(todo: Pick<Todo, 'priority'>): Quadrant {
  if (todo.priority === 'high') return 'q1'
  if (todo.priority === 'medium') return 'q2'
  if (todo.priority === 'low') return 'q4'
  return todo.priority
}

export const quadrantFor = (urgent: boolean, important: boolean): Quadrant => (important ? (urgent ? 'q1' : 'q2') : urgent ? 'q3' : 'q4')

/** 分類顏色：預設名稱就是顏色名，使用者可以改成「工作」「家人」等 */
export const TAG_COLORS: { id: string; name: string; hex: string }[] = [
  { id: 'rose', name: 'Rose', hex: '#e0607e' },
  { id: 'coral', name: 'Coral', hex: '#ef7a63' },
  { id: 'apricot', name: 'Apricot', hex: '#f39a5b' },
  { id: 'marigold', name: 'Marigold', hex: '#e2ad35' },
  { id: 'olive', name: 'Olive', hex: '#9aa33b' },
  { id: 'sage', name: 'Sage', hex: '#74a68a' },
  { id: 'jade', name: 'Jade', hex: '#2f9e7b' },
  { id: 'teal', name: 'Teal', hex: '#2399a6' },
  { id: 'azure', name: 'Azure', hex: '#3d86c6' },
  { id: 'sapphire', name: 'Sapphire', hex: '#4f62cf' },
  { id: 'lavender', name: 'Lavender', hex: '#8f7cc6' },
  { id: 'plum', name: 'Plum', hex: '#9b4f96' },
  { id: 'mauve', name: 'Mauve', hex: '#c27ba0' },
  { id: 'slate', name: 'Slate', hex: '#6b7a90' },
]
export const DEFAULT_TAG = 'azure'
/** 使用者自訂的分類名稱：顏色 id → 名稱 */
export const TAG_NAMES_KEY = 'lifemaster.todoTagNames'
export type TagNames = Record<string, string>

/** 舊版的文字分類對應到顏色 */
const LEGACY_TAGS: Record<string, string> = { 工作: 'azure', 學習: 'sage', 生活: 'marigold', 其他: 'slate' }

export function tagOf(todo: Pick<Todo, 'category'>, names: TagNames): { id: string; name: string; hex: string } {
  const id = TAG_COLORS.some(c => c.id === todo.category) ? todo.category : (LEGACY_TAGS[todo.category] ?? 'slate')
  const color = TAG_COLORS.find(c => c.id === id)!
  return { ...color, name: names[id]?.trim() || color.name }
}

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

/** 新任務的預設提醒：預設的提醒時間已經過了就不提醒，避免一新增就跳通知 */
export function defaultRemindFor(dueDate: string, dueTime?: string): RemindOption {
  if (!dueDate) return 'none'
  const at = reminderAt({ dueDate, dueTime, remind: DEFAULT_REMIND } as Todo)
  return at && at.getTime() > Date.now() ? DEFAULT_REMIND : 'none'
}

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
