/** 以本地時區取得 YYYY-MM-DD 字串（避免 toISOString 的 UTC 時差問題）。 */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addDaysKey(key: string, days: number): string {
  return toDateKey(addDays(fromDateKey(key), days))
}

/** 兩個日期相差幾天（b - a） */
export function diffDays(a: string, b: string): number {
  return Math.round((fromDateKey(b).getTime() - fromDateKey(a).getTime()) / 86400000)
}

/**
 * 計算連續天數：從今天往回數。
 * 若今天尚未完成，則從昨天開始算，讓 streak 不會在一天剛開始時就歸零。
 */
export function calcStreak(completedDates: string[]): number {
  const done = new Set(completedDates)
  let cursor = new Date()
  if (!done.has(toDateKey(cursor))) cursor = addDays(cursor, -1)

  let streak = 0
  while (done.has(toDateKey(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** 歷史最長連續天數 */
export function bestStreak(completedDates: string[]): number {
  const sorted = [...new Set(completedDates)].sort()
  let best = 0
  let run = 0
  sorted.forEach((d, i) => {
    run = i > 0 && diffDays(sorted[i - 1], d) === 1 ? run + 1 : 1
    best = Math.max(best, run)
  })
  return best
}

/** 這一週（週一開始）的 7 個日期 */
export function weekKeys(date: Date = new Date()): string[] {
  const monday = addDays(date, -((date.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)))
}

export function newId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
