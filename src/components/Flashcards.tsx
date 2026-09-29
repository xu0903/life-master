import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Shuffle, Trash2 } from 'lucide-react'
import FlipCard from './FlipCard'
import { FLASHCARDS_KEY } from '../data/flashcards'
import { lookupWord } from '../data/toeicWords'
import type { Card } from '../data/flashcards'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { newId } from '../utils/date'

function pickRandom(cards: Card[], excludeId?: string): string | null {
  if (cards.length === 0) return null
  const pool = cards.length > 1 ? cards.filter(c => c.id !== excludeId) : cards
  return pool[Math.floor(Math.random() * pool.length)].id
}

export default function Flashcards() {
  const [cards, setCards] = useLocalStorage<Card[]>(FLASHCARDS_KEY, [])
  const [currentId, setCurrentId] = useState<string | null>(() => pickRandom(cards))
  const [flipped, setFlipped] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  // 目前卡片被刪掉時，自動退回第一張
  const current = cards.find(c => c.id === currentId) ?? cards[0]

  const nextCard = () => {
    setFlipped(false)
    setCurrentId(pickRandom(cards, current?.id))
  }

  const addCard = (e: FormEvent) => {
    e.preventDefault()
    const q = question.trim()
    const info = lookupWord(q)
    // 題庫裡有的字可以不填答案，自動帶入
    const a = answer.trim() || (info ? `(${info.pos}) ${info.zh}` : '')
    if (!q || !a) return
    const card = { id: newId(), question: q, answer: a }
    setCards(prev => [...prev, card])
    if (!current) setCurrentId(card.id)
    setQuestion('')
    setAnswer('')
  }

  const deleteCard = (id: string) => setCards(prev => prev.filter(c => c.id !== id))

  return (
    <div className="space-y-4">
      {current ? (
        <>
          {/* key 換掉讓新卡片從正面開始，不會閃過下一題答案 */}
          <FlipCard key={current.id} card={current} flipped={flipped} onFlip={() => setFlipped(f => !f)} />

          <button
            onClick={nextCard}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-3 font-medium text-white transition hover:bg-slate-900 active:scale-[0.98]"
          >
            <Shuffle className="h-5 w-5" /> 下一題
          </button>
        </>
      ) : (
        <p className="rounded-2xl bg-white py-16 text-center text-slate-400 shadow-sm">還沒有單字卡，先在下方新增吧！</p>
      )}

      <form onSubmit={addCard} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="font-semibold text-slate-700">新增單字卡</p>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="題目 (Q)"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder={lookupWord(question) ? '答案 (A)：可留空，自動帶入題庫解釋' : '答案 (A)'}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1 rounded-xl bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" /> 新增
        </button>
      </form>

      {cards.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-700">全部卡片（{cards.length}）</p>
          <p className="mb-2 text-xs text-slate-400">每日多益單字會自動加入這裡</p>
          <ul className="divide-y divide-slate-100">
            {cards.map(card => (
              <li key={card.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium text-slate-800">
                    {card.question}
                    {card.source === 'toeic' && (
                      <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600">
                        TOEIC
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-slate-500">{card.answer}</p>
                </div>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="刪除卡片"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
