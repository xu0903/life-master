import { Apple, Bike, BookOpen, Brain, Coffee, Droplet, Dumbbell, Footprints, Heart, Languages, Leaf, Moon, Music, PenLine, Pill, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { addDays, calcStreak, toDateKey, weekKeys } from '../utils/date'

export interface Habit {
  id: string
  name: string
  icon: string
  /** 舊資料沒有顏色，會依圖示給預設色 */
  color?: string
  completedDates: string[]
  /** 每週目標次數（1–6）；沒填 = 每天都要做 */
  weeklyTarget?: number
  /** 打卡方式；舊資料沒有這個欄位：有 target 視為 count，否則 check */
  kind?: HabitKind
  /** 每日目標：count = 次數、water = 毫升、duration = 分鐘、sets = 組數 */
  target?: number
  /** 計量單位，例如「杯」「下」「題」 */
  unit?: string
  /** count：每按一次加多少（1 或 0.5） */
  step?: number
  /** water：水壺 / 杯子容量（毫升） */
  bottleMl?: number
  /** sets：每組的數量，例如 15 下、2 題 */
  perSet?: number
  /** sets：自動從 App 裡的練習紀錄計算進度 */
  link?: ActivityLink
  /** 每天的累計量（count = 次數、water = 毫升、duration = 分鐘、sets = 組數） */
  counts?: Record<string, number>
  /** 每天提醒時間 HH:mm（需開啟背景推播） */
  remindTime?: string
  /** 連動菜單：菜單項目完成時自動記到這個習慣（時間型記分鐘，其他類型完成全部項目就打卡）；'none' = 不連動 */
  planLink?: 'toeic' | 'none'
}

/** 這個習慣連動哪個菜單；舊資料沒設定時，「讀書」預設連動多益菜單 */
export const habitPlanLink = (h: Habit) => (h.planLink === 'none' ? undefined : (h.planLink ?? (h.icon === 'read' ? 'toeic' : undefined)))

/** 習慣卡上的計時器（運動、讀書等「時間」習慣）；同一時間只會有一個在跑 */
export const HABIT_TIMER_KEY = 'lifemaster.habitTimer'
export interface HabitTimer {
  habitId: string
  startAt: number
}

/** 打卡方式 */
export type HabitKind = 'check' | 'count' | 'water' | 'duration' | 'sets'
/** 可以自動同步進度的 App 內練習 */
export type ActivityLink = 'reading' | 'listening' | 'words' | 'grammar'

export const HABIT_KINDS: { value: HabitKind; label: string; desc: string }[] = [
  { value: 'check', label: '打卡', desc: '做了就打勾' },
  { value: 'count', label: '次數', desc: '例如：吃水果 2 份' },
  { value: 'water', label: '喝水', desc: '用水壺容量計算毫升數' },
  { value: 'duration', label: '時間', desc: '記錄分鐘數，可用計時器或番茄鐘' },
  { value: 'sets', label: '組數', desc: '例如：伏地挺身 15 下 × 3 組、閱讀 2 題 × 2 組' },
]

export const ACTIVITY_LINKS: { value: ActivityLink; label: string; unit: string }[] = [
  { value: 'reading', label: '閱讀題', unit: '題' },
  { value: 'listening', label: '聽力題', unit: '題' },
  { value: 'words', label: '每日單字', unit: '個' },
  { value: 'grammar', label: '文法單元', unit: '單元' },
]

/** 新增 / 編輯習慣時可以設定的欄位 */
export type HabitSettings = Pick<
  Habit,
  'name' | 'icon' | 'color' | 'weeklyTarget' | 'kind' | 'target' | 'unit' | 'step' | 'bottleMl' | 'perSet' | 'link' | 'remindTime' | 'planLink'
>

export function habitKind(h: Habit): HabitKind {
  return h.kind ?? ((h.target ?? 1) > 1 ? 'count' : 'check')
}

/** 每日目標量（同 counts 的單位） */
export function habitGoal(h: Habit): number {
  const kind = habitKind(h)
  if (kind === 'water') return h.target ?? 2000
  if (kind === 'duration') return h.target ?? 30
  return h.target ?? 1
}

/** 一行說明，例如「每日 2,000 ml」「15 下 × 3 組」 */
export function habitSummary(h: Habit): string {
  const kind = habitKind(h)
  const goal = habitGoal(h)
  if (kind === 'water') return `每日 ${goal.toLocaleString()} ml・水壺 ${h.bottleMl ?? 500} ml`
  if (kind === 'duration') return `每日 ${goal} 分鐘`
  if (kind === 'sets') {
    const link = ACTIVITY_LINKS.find(l => l.value === h.link)
    return `${h.perSet ?? 1} ${h.unit ?? link?.unit ?? '下'} × ${goal} 組${link ? `（自動：${link.label}）` : ''}`
  }
  if (kind === 'count') return `每日 ${goal}${h.unit ?? ''}`
  return ''
}

/** 這一週完成了幾天 */
export function weekCount(habit: Habit, date: Date = new Date()): number {
  const week = new Set(weekKeys(date))
  return habit.completedDates.filter(d => week.has(d)).length
}

/** 今天算不算達標：今天有打卡，或每週型習慣這週的次數已經夠了 */
export function isHabitDone(habit: Habit, today: string = toDateKey()): boolean {
  if (habit.completedDates.includes(today)) return true
  return !!habit.weeklyTarget && weekCount(habit) >= habit.weeklyTarget
}

/** 連續紀錄：每日型算天數，每週型算連續達標的週數 */
export function habitStreak(habit: Habit): { count: number; unit: '天' | '週' } {
  if (!habit.weeklyTarget) return { count: calcStreak(habit.completedDates), unit: '天' }
  let cursor = new Date()
  // 這週還沒達標的話從上週開始算，不會一到週一就歸零
  if (weekCount(habit, cursor) < habit.weeklyTarget) cursor = addDays(cursor, -7)
  let count = 0
  while (weekCount(habit, cursor) >= habit.weeklyTarget && count < 520) {
    count++
    cursor = addDays(cursor, -7)
  }
  return { count, unit: '週' }
}

export const HABITS_KEY = 'lifemaster.habits'

export const HABIT_ICONS: Record<string, LucideIcon> = {
  water: Droplet,
  exercise: Dumbbell,
  read: BookOpen,
  vocab: Languages,
  sleep: Moon,
  diet: Apple,
  meditate: Brain,
  walk: Footprints,
  bike: Bike,
  vitamin: Pill,
  music: Music,
  journal: PenLine,
  health: Heart,
  morning: Sun,
  coffee: Coffee,
  nature: Leaf,
}

// class 字串要完整寫出，Tailwind 才掃描得到
export const HABIT_COLORS: Record<string, { chip: string; dot: string }> = {
  sky: { chip: 'bg-sky-500/15 text-sky-500', dot: 'bg-sky-500' },
  orange: { chip: 'bg-orange-500/15 text-orange-500', dot: 'bg-orange-500' },
  emerald: { chip: 'bg-emerald-500/15 text-emerald-500', dot: 'bg-emerald-500' },
  violet: { chip: 'bg-violet-500/15 text-violet-500', dot: 'bg-violet-500' },
  rose: { chip: 'bg-rose-500/15 text-rose-500', dot: 'bg-rose-500' },
  amber: { chip: 'bg-amber-500/15 text-amber-500', dot: 'bg-amber-500' },
  teal: { chip: 'bg-teal-500/15 text-teal-500', dot: 'bg-teal-500' },
  indigo: { chip: 'bg-indigo-500/15 text-indigo-500', dot: 'bg-indigo-500' },
}

const DEFAULT_COLOR_BY_ICON: Record<string, string> = {
  water: 'sky',
  exercise: 'orange',
  read: 'emerald',
  vocab: 'violet',
}

export function habitIcon(habit: Habit): LucideIcon {
  return HABIT_ICONS[habit.icon] ?? Heart
}

export function habitColor(habit: Habit) {
  return HABIT_COLORS[habit.color ?? DEFAULT_COLOR_BY_ICON[habit.icon] ?? 'indigo'] ?? HABIT_COLORS.indigo
}

/** 背單字由每日測驗自動打卡，不能手動切換或刪除 */
export const VOCAB_HABIT: Habit = { id: 'vocab', name: '背單字', icon: 'vocab', color: 'violet', completedDates: [] }

export const DEFAULT_HABITS: Habit[] = [
  { id: 'water', name: '喝水', icon: 'water', color: 'sky', completedDates: [] },
  { id: 'exercise', name: '運動', icon: 'exercise', color: 'orange', completedDates: [] },
  { id: 'read', name: '讀書', icon: 'read', color: 'emerald', completedDates: [] },
  VOCAB_HABIT,
]
