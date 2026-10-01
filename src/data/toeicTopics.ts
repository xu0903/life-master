import type { Card } from './flashcards'
import { lookupWord } from './toeicWords'

/**
 * 多益單字的主題分類。產生字表時（scripts/gen-toeic-words.ts）分成 60 個細主題，
 * 這裡把它們合併成 20 類給使用者選；同一個字可以屬於好幾類。
 * 數字是 gen-toeic-words.ts 裡 TOPICS 陣列的索引，改那邊的順序時這裡也要一起改。
 */
export const TOEIC_TOPICS: { id: string; label: string; emoji: string; topics: number[] }[] = [
  { id: 'office', label: '辦公行政', emoji: '🗂️', topics: [0, 20, 38, 57, 59] },
  { id: 'hr', label: '人資招募', emoji: '🧑‍💼', topics: [1, 2, 35, 48] },
  { id: 'meeting', label: '會議溝通', emoji: '📞', topics: [3, 4, 47] },
  { id: 'marketing', label: '行銷業務', emoji: '📣', topics: [5, 6, 37] },
  { id: 'retail', label: '零售購物', emoji: '🛍️', topics: [7, 51, 52] },
  { id: 'logistics', label: '採購物流', emoji: '📦', topics: [8, 9, 46] },
  { id: 'manufacturing', label: '製造生產', emoji: '🏭', topics: [10, 11] },
  { id: 'finance', label: '金融會計', emoji: '💰', topics: [12, 13, 14, 40] },
  { id: 'legal', label: '法律合約', emoji: '⚖️', topics: [15, 49] },
  { id: 'management', label: '經營管理', emoji: '📈', topics: [16, 17, 36] },
  { id: 'property', label: '房地產建築', emoji: '🏢', topics: [18, 19, 34, 50] },
  { id: 'tech', label: '科技資訊', emoji: '💻', topics: [21] },
  { id: 'travel', label: '旅遊交通', emoji: '✈️', topics: [22, 23, 27, 43, 45, 56] },
  { id: 'dining', label: '餐飲食品', emoji: '🍽️', topics: [24, 44] },
  { id: 'leisure', label: '休閒娛樂', emoji: '🎭', topics: [25, 33, 42, 54] },
  { id: 'health', label: '醫療健康', emoji: '🏥', topics: [26, 41] },
  { id: 'media', label: '媒體出版', emoji: '📰', topics: [28, 58] },
  { id: 'science', label: '科學環境', emoji: '🔬', topics: [29, 30, 55] },
  { id: 'education', label: '教育訓練', emoji: '🎓', topics: [31] },
  { id: 'government', label: '政府社區', emoji: '🏛️', topics: [32, 53] },
  { id: 'grammar', label: 'Part 5 高頻詞', emoji: '✏️', topics: [39] },
]

/** 從卡片裡挑出屬於某個分類的字 */
export function cardsInTopic(cards: Card[], id: string): Card[] {
  const cat = TOEIC_TOPICS.find(c => c.id === id)
  if (!cat) return cards
  return cards.filter(c => lookupWord(c.question)?.topics?.some(t => cat.topics.includes(t)))
}

/** 這個字（的細主題）屬於哪些分類 */
export function topicCategories(topics: number[] | undefined): string[] {
  if (!topics?.length) return []
  return TOEIC_TOPICS.filter(c => c.topics.some(t => topics.includes(t))).map(c => c.id)
}
