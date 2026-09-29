import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { TODOS_KEY, formatDue, reminderAt } from '../data/todos'
import type { Todo } from '../data/todos'
import { showNotification } from '../utils/reminders'

/**
 * App 開著時每 30 秒檢查一次待辦提醒，切回 App 時也會立刻檢查（補發錯過的提醒）。
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
      for (const t of due) void showNotification(`⏰ ${t.text}`, `${formatDue(t)} 到期`, t.id)
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

  const dismiss = (id: string) => setAlerts(prev => prev.filter(t => t.id !== id))

  return { alerts, dismiss }
}
