import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Shuffle, Trash2 } from 'lucide-react'
import FlipCard from './FlipCard'
import { FLASHCARDS_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { lookupWord } from '../data/toeicWords'
import { useWordStats } from '../hooks/useDailyWords'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { newId } from '../utils/date'

type Filter = 'all' | 'toeic' | 'custom' | 'weak'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'toeic', label: '多益' },
  { id: 'custom', label: '自訂' },
  { id: 'weak', label: '不熟' },
]

function pickRandom(cards: Card[], excludeId?: string): string | null {
  if (cards.length === 0) return null
  const pool = cards.length > 1 ? cards.filter(c => c.id !== excludeId) : cards
  return pool[Math.floor(Math.random() * pool.length)].id
}

export default function Flashcards() {
  const [cards, setCards] = useLocalStorage<Card[]>(FLASHCARDS_KEY, [])
  const [stats] = useWordStats()
  const [filter, setFilter] = useState<Filter>('all')
  const [currentId, setCurrentId] = useState<string | null>(() => pickRandom(cards))
  const [flipped, setFlipped] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  // 「不熟」= 最近一次在每日測驗答不熟（盒子歸零且答錯過）
  const isWeak = (c: Card) => stats[c.id]?.box === 0 && stats[c.id].wrong > 0
  const matches = (c: Card, f: Filter) =>
    f === 'all' || (f === 'toeic' && c.source === 'toeic') || (f === 'custom' && c.source !== 'toeic') || (f === 'weak' && isWeak(c))

  const visible = cards.filter(c => matches(c, filter))
  // 目前卡片不在篩選結果時，退回第一張
  const current = visible.find(c => c.id === currentId) ?? visible[0]

  const changeFilter = (f: Filter) => {
    setFilter(f)
    setFlipped(false)
    setCurrentId(pickRandom(cards.filter(c => matches(c, f))))
  }

  const nextCard = () => {
    setFlipped(false)
    setCurrentId(pickRandom(visible, current?.id))
  }

  const showCard = (id: string) => {
    setFlipped(false)
    setCurrentId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const inputClass =
    'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-fg outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20'

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => {
          const count = cards.filter(c => matches(c, f.id)).length
          return (
            <button
              key={f.id}
              onClick={() => changeFilter(f.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${
                filter === f.id ? 'bg-primary font-semibold text-on-primary' : 'bg-surface text-muted'
              }`}
            >
              {f.label} <span className="opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      {current ? (
        <>
          {/* key 換掉讓新卡片從正面開始，不會閃過下一題答案 */}
          <FlipCard key={current.id} card={current} flipped={flipped} onFlip={() => setFlipped(f => !f)} />

          <button
            onClick={nextCard}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fg py-3 font-medium text-bg transition active:scale-[0.98]"
          >
            <Shuffle className="h-5 w-5" /> 下一題
          </button>
        </>
      ) : (
        <p className="rounded-2xl bg-surface py-16 text-center text-faint shadow-sm">
          {cards.length === 0 ? '還沒有單字卡，先在下方新增吧！' : filter === 'weak' ? '目前沒有不熟的字 🎉' : '這個分類沒有卡片'}
        </p>
      )}

      <form onSubmit={addCard} className="space-y-3 rounded-2xl bg-surface p-4 shadow-sm">
        <p className="font-semibold text-fg">新增單字卡</p>
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="題目 (Q)" className={inputClass} />
        <input
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder={lookupWord(question) ? '答案 (A)：可留空，自動帶入題庫解釋' : '答案 (A)'}
          className={inputClass}
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary py-2.5 font-medium text-on-primary transition active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" /> 新增
        </button>
      </form>

      {visible.length > 0 && (
        <div className="rounded-2xl bg-surface p-4 shadow-sm">
          <p className="font-semibold text-fg">
            {FILTERS.find(f => f.id === filter)?.label}卡片（{visible.length}）
          </p>
          <p className="mb-2 text-xs text-faint">點單字可以直接顯示在上方卡片；每日多益單字會自動加入</p>
          <ul className="divide-y divide-line">
            {visible.map(card => (
              <li key={card.id} className="flex items-center gap-3 py-2">
                <button onClick={() => showCard(card.id)} className="min-w-0 flex-1 text-left">
                  <p className="flex items-center gap-1.5 truncate font-medium text-fg">
                    {card.question}
                    {card.source === 'toeic' && (
                      <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary">TOEIC</span>
                    )}
                    {isWeak(card) && (
                      <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">不熟</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">{card.answer}</p>
                </button>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="rounded-lg p-2 text-faint transition hover:bg-rose-500/10 hover:text-rose-500"
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
