import type { Grade } from './toeicWords'

/** 紅黃綠三段評分（仿 WordUp） */
export const GRADES: { grade: Grade; label: string; button: string; dot: string }[] = [
  { grade: 'forgot', label: '不記得', button: 'bg-rose-500 text-white shadow-rose-500/30', dot: 'text-rose-500' },
  { grade: 'vague', label: '有印象', button: 'bg-amber-400 text-amber-950 shadow-amber-400/30', dot: 'text-amber-400' },
  { grade: 'good', label: '我記得', button: 'bg-emerald-500 text-white shadow-emerald-500/30', dot: 'text-emerald-500' },
]

export const GRADE_DOT: Record<Grade, string> = Object.fromEntries(GRADES.map(g => [g.grade, g.dot])) as Record<Grade, string>
