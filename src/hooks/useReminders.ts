import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_HABITS, HABITS_KEY, isHabitDone } from '../data/habits'
import type { Habit } from '../data/habits'
import { POMODORO_INITIAL, POMODORO_KEY } from '../data/pomodoro'
import type { PomodoroState } from '../data/pomodoro'
import { TODOS_KEY, formatDue, reminderAt } from '../data/todos'
import type { Todo } from '../data/todos'
import { PUSH_EVENT, enablePush, isPushEnabled, syncReminders } from '../utils/push'
import { addDays, toDateKey } from '../utils/date'
import { showNotification } from '../utils/reminders'

/** 每日打卡提醒時間 HH:mm；空字串 = 關閉（預設） */
export const CHECKIN_REMIND_KEY = 'lifemaster.checkinRemind'

/** 超過這個時間才發現的提醒，視為雲端推播已經通知過，只顯示橫幅 */
const LATE_MS = 90000

/**
 * App 開著時每 30 秒檢查一次待辦提醒，切回 App 時也會立刻檢查（補發錯過的提醒）。
 * 有設定雲端推播時，尚未到期的提醒會同步到雲端，App 關著也會準時通知。
 * 回傳已觸發但使用者還沒關掉的提醒，用來在畫面上顯示橫幅。
 */
export function useReminders() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(TODOS_KEY, [])
  const [alerts, setAlerts] = useState<Todo[]>([])
  const [habits] = useLocalStorage<Habit[]>(HABITS_KEY, DEFAULT_HABITS)
  const [pomodoro] = useLocalStorage<PomodoroState>(POMODORO_KEY, POMODORO_INITIAL)
  const [checkinTime] = useLocalStorage(CHECKIN_REMIND_KEY, '')

  useEffect(() => {
    const check = () => {
      const now = Date.now()
      const due = todos.filter(t => {
        const at = reminderAt(t)
        return !t.done && !t.notifiedAt && at && at.getTime() <= now
      })
      if (due.length === 0) return
      for (const t of due) {
        const late = now - (reminderAt(t)?.getTime() ?? now) > LATE_MS
        // tag 與雲端推播相同，兩邊都發出時系統只會留一則
        if (!(late && isPushEnabled())) void showNotification(`⏰ ${t.text}`, `${formatDue(t)} 到期`, t.id)
      }
      const stamp = new Date().toISOString()
      setTodos(prev => prev.map(t => (due.some(d => d.id === t.id) ? { ...t, notifiedAt: stamp } : t)))
      setAlerts(prev => [...prev, ...due.filter(d => !prev.some(p => p.id === d.id))])
    }
    check()
    const timer = window.setInterval(check, 30000)
    const onVisible = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [todos, setTodos])

  // App 啟動時更新推播訂閱；登記成功後（或在設定頁剛開啟通知時）重新同步一次
  const [pushOn, setPushOn] = useState(isPushEnabled)
  useEffect(() => {
    const onChange = () => setPushOn(isPushEnabled())
    window.addEventListener(PUSH_EVENT, onChange)
    void enablePush()
    return () => window.removeEventListener(PUSH_EVENT, onChange)
  }, [])

  // 待辦、習慣提醒或番茄鐘有變動，就把還沒到期的提醒同步到雲端（稍等一下，避免連續編輯時一直送）
  useEffect(() => {
    if (!pushOn) return
    const timer = window.setTimeout(() => {
      const now = Date.now()
      const items = todos.flatMap(t => {
        const at = reminderAt(t)
        if (t.done || t.notifiedAt || !at || at.getTime() <= now) return []
        return [{ ref: t.id, title: t.text, body: `${formatDue(t)} 到期`, fire_at: at.toISOString() }]
      })
      // 習慣提醒：先排好未來 7 天，今天已達標的就不提醒
      for (const h of habits) {
        if (!h.remindTime) continue
        const [hh, mm] = h.remindTime.split(':').map(Number)
        for (let d = 0; d < 7; d++) {
          const day = addDays(new Date(), d)
          const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh, mm)
          if (at.getTime() <= now || (d === 0 && isHabitDone(h))) continue
          items.push({ ref: `habit:${h.id}:${toDateKey(day)}`, title: `該「${h.name}」了`, body: '今天還沒打卡', fire_at: at.toISOString() })
        }
      }
      // 每日打卡提醒：使用者自己選的時間；今天習慣都完成了就不提醒
      if (checkinTime) {
        const [hh, mm] = checkinTime.split(':').map(Number)
        const allDone = habits.length > 0 && habits.every(h => isHabitDone(h))
        for (let d = 0; d < 7; d++) {
          const day = addDays(new Date(), d)
          const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh, mm)
          if (at.getTime() <= now || (d === 0 && allDone)) continue
          items.push({ ref: `checkin:${toDateKey(day)}`, title: '今天還沒完成打卡', body: '打開 LifeMaster 把今天的習慣完成吧', fire_at: at.toISOString() })
        }
      }
      // 番茄鐘：App 切到背景時也能在時間到的時候通知
      if (pomodoro.endAt && pomodoro.endAt > now) {
        const focus = pomodoro.mode === 'focus'
        items.push({
          ref: 'pomodoro',
          title: focus ? '番茄鐘時間到' : '休息結束',
          body: focus ? '休息 5 分鐘吧' : '開始下一個番茄鐘',
          fire_at: new Date(pomodoro.endAt).toISOString(),
        })
      }
      void syncReminders(items)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [todos, habits, pomodoro.endAt, pomodoro.mode, checkinTime, pushOn])

  const dismiss = (id: string) => setAlerts(prev => prev.filter(t => t.id !== id))

  return { alerts, dismiss }
}
