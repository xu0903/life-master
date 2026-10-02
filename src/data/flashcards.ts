export interface Card {
  id: string
  question: string
  answer: string
  /** toeic = 多益題庫、vocab = 學測 / 英檢字表，沒有 = 自己新增的卡 */
  source?: 'toeic' | 'vocab'
  /** 自己新增的卡可以自訂詞性、例句、同反義詞（沒填就用題庫的） */
  pos?: string
  ex?: string
  exZh?: string
  syn?: string[]
  ant?: string[]
}

export const FLASHCARDS_KEY = 'lifemaster.flashcards'
/** 翻卡分頁目前的篩選（今日任務可以直接跳到某個卡組） */
export const CARD_FILTER_KEY = 'lifemaster.cardFilter'
