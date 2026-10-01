import { useLocalStorage } from './useLocalStorage'
import { FLASHCARDS_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { newId } from '../utils/date'

export interface Deck {
  id: string
  name: string
  cardIds: string[]
}

/** 字卡庫 */
export function useCards() {
  const [cards, setCards] = useLocalStorage<Card[]>(FLASHCARDS_KEY, [])

  /** 確保卡片在字卡庫裡（收藏、收錄卡組時會自動加入） */
  const ensureCard = (card: Card) => setCards(prev => (prev.some(c => c.id === card.id) ? prev : [...prev, card]))

  return { cards, setCards, ensureCard }
}

/** 我的最愛與自訂卡組 */
export function useDecks() {
  const [favorites, setFavorites] = useLocalStorage<string[]>('lifemaster.favorites', [])
  const [decks, setDecks] = useLocalStorage<Deck[]>('lifemaster.decks', [])
  const { ensureCard } = useCards()

  const isFavorite = (id: string) => favorites.includes(id)

  const toggleFavorite = (card: Card) => {
    if (!isFavorite(card.id)) ensureCard(card)
    setFavorites(prev => (prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]))
  }

  const createDeck = (name: string, firstCard?: Card): string => {
    const id = newId()
    if (firstCard) ensureCard(firstCard)
    setDecks(prev => [...prev, { id, name, cardIds: firstCard ? [firstCard.id] : [] }])
    return id
  }

  const renameDeck = (id: string, name: string) => setDecks(prev => prev.map(d => (d.id === id ? { ...d, name } : d)))

  const deleteDeck = (id: string) => setDecks(prev => prev.filter(d => d.id !== id))

  const toggleInDeck = (deckId: string, card: Card) => {
    ensureCard(card)
    setDecks(prev =>
      prev.map(d =>
        d.id !== deckId
          ? d
          : { ...d, cardIds: d.cardIds.includes(card.id) ? d.cardIds.filter(id => id !== card.id) : [...d.cardIds, card.id] },
      ),
    )
  }

  /** 收進固定的卡組（例如閱讀時查過的單字），卡組不存在就自動建立 */
  const addToFixedDeck = (deckId: string, name: string, card: Card) => {
    ensureCard(card)
    setDecks(prev => {
      const deck = prev.find(d => d.id === deckId)
      if (!deck) return [...prev, { id: deckId, name, cardIds: [card.id] }]
      if (deck.cardIds.includes(card.id)) return prev
      return prev.map(d => (d.id === deckId ? { ...d, cardIds: [...d.cardIds, card.id] } : d))
    })
  }

  const decksOf = (cardId: string) => decks.filter(d => d.cardIds.includes(cardId))

  /** 刪除卡片時，一併從最愛和所有卡組移除 */
  const forgetCard = (cardId: string) => {
    setFavorites(prev => prev.filter(id => id !== cardId))
    setDecks(prev => prev.map(d => ({ ...d, cardIds: d.cardIds.filter(id => id !== cardId) })))
  }

  return { favorites, decks, isFavorite, toggleFavorite, createDeck, renameDeck, deleteDeck, toggleInDeck, addToFixedDeck, decksOf, forgetCard }
}
