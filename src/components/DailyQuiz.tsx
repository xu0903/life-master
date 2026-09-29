import { useState } from 'react'
import { BookmarkCheck, BookmarkPlus, Check, PartyPopper, X } from 'lucide-react'
import FlipCard from './FlipCard'
import SpeakButtons from './SpeakButtons'
import type { Card } from '../data/flashcards'

interface DailyQuizProps {
  words: Card[]
  answered: Record<string, boolean>
  reviewIds: Set<string>
  deckIds: Set<string>
  onAnswer: (id: string, known: boolean) => void
  onAddToDeck: (card: Card) => void
  onClose: () => void
}

function DeckButton({ card, inDeck, onAdd }: { card: Card; inDeck: boolean; onAdd: (card: Card) => void }) {
  return inDeck ? (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
      <BookmarkCheck className="h-4 w-4" /> 已在字卡庫
    </span>
  ) : (
    <button
      onClick={() => onAdd(card)}
      className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary transition active:scale-95"
    >
      <BookmarkPlus className="h-4 w-4" /> 加入字卡庫
    </button>
  )
}

export default function DailyQuiz({ words, answered, reviewIds, deckIds, onAnswer, onAddToDeck, onClose }: DailyQuizProps) {
  const [flipped, setFlipped] = useState(false)
  const current = words.find(w => !(w.id in answered))
  const answeredCount = words.filter(w => w.id in answered).length
  const knownCount = words.filter(w => answered[w.id]).length

  const handleAnswer = (known: boolean) => {
    if (!current) return
    onAnswer(current.id, known)
    setFlipped(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-bg p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-fg">📖 每日多益單字</p>
            <p className="text-sm text-muted">
              {answeredCount} / {words.length} 題
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-faint hover:bg-surface-2" aria-label="關閉">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-all duration-500"
            style={{ width: `${words.length ? (answeredCount / words.length) * 100 : 0}%` }}
          />
        </div>

        {current ? (
          <>
            <FlipCard
              key={current.id}
              card={current}
              flipped={flipped}
              onFlip={() => setFlipped(f => !f)}
              badge={reviewIds.has(current.id) ? '🔁 複習' : '✨ 新字'}
            />
            <div className="mt-3 flex justify-center">
              <DeckButton card={current} inDeck={deckIds.has(current.id)} onAdd={onAddToDeck} />
            </div>
            {flipped ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex items-center justify-center gap-1 rounded-2xl bg-surface py-3 font-medium text-rose-500 shadow-sm ring-1 ring-rose-500/20 transition active:scale-95"
                >
                  <X className="h-5 w-5" /> 不熟
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex items-center justify-center gap-1 rounded-2xl bg-emerald-500 py-3 font-medium text-white shadow-sm transition active:scale-95"
                >
                  <Check className="h-5 w-5" /> 認識
                </button>
              </div>
            ) : (
              <p className="mt-4 py-3 text-center text-sm text-faint">先想想意思，再點卡片翻面</p>
            )}
          </>
        ) : (
          <div className="space-y-4 text-center">
            <PartyPopper className="mx-auto h-14 w-14 text-amber-500" />
            <div>
              <p className="text-xl font-bold text-fg">今日單字完成！</p>
              <p className="mt-1 text-muted">
                認識 <span className="font-bold text-emerald-500">{knownCount}</span> / {words.length} 個，已自動打卡「背單字」
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-4 text-left shadow-sm">
              <p className="mb-2 text-sm font-semibold text-fg">今日單字</p>
              <ul className="divide-y divide-line">
                {words.map(w => (
                  <li key={w.id} className="space-y-1.5 py-2.5">
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="font-medium text-fg">
                        {answered[w.id] === false && <span className="mr-1 text-rose-500">✗</span>}
                        {w.question}
                      </span>
                      <span className="text-right text-muted">{w.answer}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <SpeakButtons text={w.question} />
                      <DeckButton card={w} inDeck={deckIds.has(w.id)} onAdd={onAddToDeck} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-faint">標 ✗ 的字明天會再出現複習，答對後間隔會越拉越長</p>
            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-2 py-3 font-medium text-on-primary transition active:scale-[0.98]"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
