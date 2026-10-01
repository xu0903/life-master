import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { diffDays, newId, toDateKey } from '../utils/date'

export interface Exam {
  id: string
  name: string
  /** 考試日期 YYYY-MM-DD */
  date: string
}

export const EXAMS_KEY = 'lifemaster.exams'
const OLD_EXAM_DATE_KEY = 'lifemaster.examDate'

/** 自訂考試清單（多益、學測、英檢、期中考…），首頁顯示倒數 */
export function useExams() {
  const [exams, setExams] = useLocalStorage<Exam[]>(EXAMS_KEY, [])
  const [oldDate, setOldDate] = useLocalStorage(OLD_EXAM_DATE_KEY, '')

  // 舊版只有一個「多益考試日期」，搬進新的考試清單
  useEffect(() => {
    if (!oldDate) return
    setExams(prev => (prev.some(e => e.date === oldDate) ? prev : [...prev, { id: newId(), name: '多益', date: oldDate }]))
    setOldDate('')
  }, [oldDate, setExams, setOldDate])

  const add = (name: string, date: string) => setExams(prev => [...prev, { id: newId(), name, date }])
  const remove = (id: string) => setExams(prev => prev.filter(e => e.id !== id))

  const today = toDateKey()
  /** 還沒考的考試，依日期排序 */
  const upcoming = exams
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({ ...e, days: diffDays(today, e.date) }))

  return { exams, upcoming, add, remove }
}
