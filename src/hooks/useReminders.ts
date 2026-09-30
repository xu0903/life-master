import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { TODOS_KEY, formatDue, reminderAt } from '../data/todos'
import type { Todo } from '../data/todos'
import { PUSH_EVENT, enablePush, isPushEnabled, syncReminders } from '../utils/push'
import { showNotification } from '../utils/reminders'

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

  // 待辦有變動就把還沒到期的提醒同步到雲端（稍等一下，避免連續編輯時一直送）
  useEffect(() => {
    if (!pushOn) return
    const timer = window.setTimeout(() => {
      const now = Date.now()
      const items = todos.flatMap(t => {
        const at = reminderAt(t)
        if (t.done || t.notifiedAt || !at || at.getTime() <= now) return []
        return [{ ref: t.id, title: t.text, body: `${formatDue(t)} 到期`, fire_at: at.toISOString() }]
      })
      void syncReminders(items)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [todos, pushOn])

  const dismiss = (id: string) => setAlerts(prev => prev.filter(t => t.id !== id))

  return { alerts, dismiss }
}
