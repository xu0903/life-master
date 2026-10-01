import { useLocalStorage } from './useLocalStorage'
import { useActivityToday } from './useActivity'
import { useExams } from './useExams'
import { PLAN_KEY, weekPlan } from '../data/studyPlan'
import type { PlanSettings, PlanTask } from '../data/studyPlan'
import { STUDY_LOG_KEY } from '../data/studyLog'
import type { StudyLog } from '../data/studyLog'
import { toDateKey } from '../utils/date'

/** 多益菜單：設定、這週的菜單、今天每一項做了多少 */
export function useStudyPlan() {
  const [settings, setSettings] = useLocalStorage<PlanSettings | null>(PLAN_KEY, null)
  const [log] = useLocalStorage<StudyLog>(STUDY_LOG_KEY, { date: '', counts: {} })
  const activity = useActivityToday()
  const { upcoming } = useExams()
  const today = toDateKey()

  // 四週內有考試就排模擬考
  const exam = upcoming.find(e => /多益|toeic/i.test(e.name)) ?? upcoming[0]
  const examSoon = !!exam && exam.days <= 28
  const week = settings ? weekPlan(settings.target, settings.intensity, examSoon) : null
  const todayIndex = (new Date().getDay() + 6) % 7

  const progress = (task: PlanTask): number => {
    if (task.kind === 'words') return activity.words
    if (task.kind === 'grammar') return activity.grammar
    return log.date === today ? (log.counts[task.kind] ?? 0) : 0
  }
  const isDone = (task: PlanTask) => progress(task) >= task.amount
  const todayTasks = week?.[todayIndex] ?? []

  return { settings, setSettings, week, todayIndex, todayTasks, progress, isDone, exam, examSoon }
}
