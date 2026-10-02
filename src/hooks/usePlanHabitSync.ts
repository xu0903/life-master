import { useEffect } from 'react'
import { useHabits } from './useHabits'
import { useLocalStorage } from './useLocalStorage'
import { useStudyPlan } from './useStudyPlan'
import { habitKind, habitPlanLink } from '../data/habits'
import { taskMinutes } from '../data/studyPlan'
import { toDateKey } from '../utils/date'

/** 今天已經記到習慣上的菜單項目，避免重複記 */
const CREDIT_KEY = 'lifemaster.planCredits'

/**
 * 菜單連動習慣：多益菜單每完成一項，就把那一項的預估分鐘數記到連動的「時間」習慣（預設是讀書）；
 * 其他類型的習慣在今天的菜單全部完成時打卡。
 */
export function usePlanHabitSync() {
  const plan = useStudyPlan()
  const { habits, addAmount, markDone } = useHabits()
  const [credits, setCredits] = useLocalStorage<{ date: string; kinds: string[] }>(CREDIT_KEY, { date: '', kinds: [] })
  const today = toDateKey()

  const doneKinds = plan.settings ? plan.todayTasks.filter(plan.isDone).map(t => t.kind) : []
  const allDone = plan.settings !== null && plan.todayTasks.length > 0 && doneKinds.length === plan.todayTasks.length
  const signature = `${today}|${doneKinds.join(',')}`

  useEffect(() => {
    if (!plan.settings) return
    const credited = credits.date === today ? credits.kinds : []
    const fresh = plan.todayTasks.filter(t => plan.isDone(t) && !credited.includes(t.kind))
    const allKey = '__all__'
    const needAll = allDone && !credited.includes(allKey)
    if (fresh.length === 0 && !needAll) return
    for (const h of habits) {
      if (habitPlanLink(h) !== 'toeic') continue
      if (habitKind(h) === 'duration') {
        const minutes = fresh.reduce((n, t) => n + taskMinutes(t), 0)
        if (minutes > 0) addAmount(h.id, today, minutes)
      } else if (needAll) markDone(h.id, today)
    }
    setCredits({ date: today, kinds: [...credited, ...fresh.map(t => t.kind), ...(needAll ? [allKey] : [])] })
    // 只在完成的項目改變時執行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])
}
