import { SYNC_EVENT } from '../hooks/useLocalStorage'
import { toDateKey } from '../utils/date'

/**
 * 每天的練習量紀錄，給「多益菜單」自動打勾用。
 * 聽力每寫完一段就記一次（中途離開也算），閱讀在交卷時記，刷題每答一題記一次。
 */
export type StudyKind =
  | 'p5' // Part 5 題數
  | 'p6' // Part 6 篇數
  | 'p7' // Part 7 篇數
  | 'l2' // 聽力 Part 2 題數
  | 'l34' // 聽力 Part 3、4 段數
  | 'practice' // 刷單字題數
  | 'wrong' // 錯題本複習回數
  | 'mock' // 完整模擬考次數

export interface StudyLog {
  date: string
  counts: Partial<Record<StudyKind, number>>
}

export const STUDY_LOG_KEY = 'lifemaster.studyLog'

export function readStudyLog(): StudyLog {
  try {
    const log = JSON.parse(localStorage.getItem(STUDY_LOG_KEY) ?? 'null') as StudyLog | null
    return log?.date === toDateKey() ? log : { date: toDateKey(), counts: {} }
  } catch {
    return { date: toDateKey(), counts: {} }
  }
}

/** 記一筆今天的練習量（跨日自動歸零） */
export function logStudy(kind: StudyKind, amount = 1) {
  if (amount <= 0) return
  const log = readStudyLog()
  log.counts[kind] = (log.counts[kind] ?? 0) + amount
  try {
    localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log))
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: STUDY_LOG_KEY }))
  } catch {
    // 存不了就算了，只影響菜單打勾
  }
}
