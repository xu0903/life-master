export interface Card {
  id: string
  question: string
  answer: string
  source?: 'toeic'
}

export const FLASHCARDS_KEY = 'lifemaster.flashcards'
