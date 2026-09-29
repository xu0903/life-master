import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { Check, FolderPlus, Plus, Star, X } from 'lucide-react'
import type { Card } from '../data/flashcards'
import { useDecks } from '../hooks/useCards'

/** 收錄到卡組的選單 */
function CollectSheet({ card, onClose }: { card: Card; onClose: () => void }) {
  const { decks, isFavorite, toggleFavorite, toggleInDeck, createDeck } = useDecks()
  const [name, setName] = useState('')

  const create = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createDeck(name.trim(), card)
    setName('')
  }

  const row = (active: boolean, label: string, onClick: () => void, key: string) => (
    <button
      key={key}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${active ? 'bg-primary-soft' : 'bg-surface-2'}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${
          active ? 'border-primary bg-primary text-on-primary' : 'border-line'
        }`}
      >
        {active && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="flex-1 text-sm text-fg">{label}</span>
    </button>
  )

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center">
          <p className="font-semibold text-fg">
            收錄「<span className="text-primary-ink">{card.question}</span>」
          </p>
          <button onClick={onClose} className="ml-auto rounded-full p-2 text-faint hover:bg-surface-2" aria-label="關閉">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {row(isFavorite(card.id), '⭐ 我的最愛', () => toggleFavorite(card), 'fav')}
          {decks.map(d => row(d.cardIds.includes(card.id), `📁 ${d.name}（${d.cardIds.length}）`, () => toggleInDeck(d.id, card), d.id))}
        </div>
        <form onSubmit={create} className="mt-3 flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="新卡組名稱，例如：會議用語"
            maxLength={16}
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-base text-fg outline-none placeholder:text-faint focus:border-primary"
          />
          <button type="submit" className="flex items-center gap-1 rounded-xl bg-primary px-3 text-sm font-medium text-on-primary">
            <Plus className="h-4 w-4" /> 建立
          </button>
        </form>
      </div>
    </div>
  )
}

/** 卡片下方的操作：加入最愛、收錄到卡組 */
export default function CardActions({ card, compact }: { card: Card; compact?: boolean }) {
  const { isFavorite, toggleFavorite, decksOf } = useDecks()
  const [collecting, setCollecting] = useState(false)
  const fav = isFavorite(card.id)
  const deckCount = decksOf(card.id).length
  const stop = (e: MouseEvent) => e.stopPropagation()
  const btn = 'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95'

  return (
    <div className="flex items-center gap-2" onClick={stop}>
      <button
        onClick={() => toggleFavorite(card)}
        className={`${btn} ${fav ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300' : 'bg-surface-2 text-muted'}`}
        aria-label={fav ? '取消最愛' : '加入最愛'}
      >
        <Star className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
        {!compact && (fav ? '已加最愛' : '最愛')}
      </button>
      <button
        onClick={() => setCollecting(true)}
        className={`${btn} ${deckCount ? 'bg-primary-soft text-primary-ink' : 'bg-surface-2 text-muted'}`}
        aria-label="收錄到卡組"
      >
        <FolderPlus className="h-4 w-4" />
        {!compact && (deckCount ? `已收錄 ${deckCount} 組` : '收錄')}
      </button>
      {collecting && <CollectSheet card={card} onClose={() => setCollecting(false)} />}
    </div>
  )
}
