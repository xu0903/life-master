export interface Card {
  id: string
  question: string
  answer: string
  /** toeic = 多益題庫、vocab = 學測 / 英檢字表，沒有 = 自己新增的卡 */
  source?: 'toeic' | 'vocab'
}

export const FLASHCARDS_KEY = 'lifemaster.flashcards'
