import {
  Apple,
  Bike,
  BookOpen,
  Brain,
  Coffee,
  Droplet,
  Dumbbell,
  Footprints,
  Heart,
  Languages,
  Leaf,
  Moon,
  Music,
  PenLine,
  Pill,
  Sun,
} from 'lucide-react'
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
  /** 每天要做幾次才算完成，例如喝水 8 杯；沒填 = 打卡一次就完成 */
  target?: number
  /** 計量單位，例如「杯」 */
  unit?: string
  /** 計量習慣每天做了幾次 */
  counts?: Record<string, number>
  /** 每天提醒時間 HH:mm（需開啟背景推播） */
  remindTime?: string
}

/** 新增 / 編輯習慣時可以設定的欄位 */
export type HabitSettings = Pick<Habit, 'name' | 'icon' | 'color' | 'weeklyTarget' | 'target' | 'unit' | 'remindTime'>

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
