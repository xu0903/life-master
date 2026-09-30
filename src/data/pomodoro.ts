export const POMODORO_KEY = 'lifemaster.pomodoro'
export const POMODORO_MINUTES = { focus: 25, break: 5 }

export interface PomodoroState {
  mode: 'focus' | 'break'
  /** 計時中：結束的時間點（毫秒）；暫停或未開始時為 null */
  endAt: number | null
  /** 暫停時剩下的秒數 */
  left: number
  /** 每天完成幾個番茄鐘 */
  log: Record<string, number>
}

export const POMODORO_INITIAL: PomodoroState = { mode: 'focus', endAt: null, left: POMODORO_MINUTES.focus * 60, log: {} }
