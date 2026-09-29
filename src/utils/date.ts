/** 以本地時區取得 YYYY-MM-DD 字串（避免 toISOString 的 UTC 時差問題）。 */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
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

export function newId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
