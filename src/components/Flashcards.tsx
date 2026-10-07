import { useState } from 'react'
import { Pencil, Plus, SkipForward, Star, Trash2 } from 'lucide-react'
import CardActions from './CardActions'
import FlipCard from './FlipCard'
import Dictionary from './Dictionary'
import PhotoLookup from './PhotoLookup'
import Grammar from './Grammar'
import Listening from './Listening'
import { GradeButtons, MasteryBar } from './Mastery'
import Practice from './Practice'
import AddCardSheet from './AddCardSheet'
import Reading from './Reading'
import StudyPlan from './StudyPlan'
import { CARD_FILTER_KEY } from '../data/flashcards'
import type { Card } from '../data/flashcards'
import { MAX_BOX, TOEIC_WORDS, WORD_INFO, nextStat, recentWrongIds } from '../data/toeicWords'
import { TOEIC_TOPICS, cardsInTopic } from '../data/toeicTopics'
import { vocabPool } from '../data/vocab'
import type { Grade } from '../data/toeicWords'
import { useCards, useDecks } from '../hooks/useCards'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useVocabReady, useWordLevel, useWordStats } from '../hooks/useDailyWords'
import { toDateKey } from '../utils/date'

/** 學習分頁目前的模式（首頁「去練習」也會切換它） */
export type LearnMode = 'plan' | 'flip' | 'practice' | 'reading' | 'listening' | 'grammar' | 'dict'
export const LEARN_MODE_KEY = 'lifemaster.learnMode'

/** 'all' | 'fav' | 'wrong' | 'toeic' | 'custom' | 'deck:<id>' | 'bank' | 'bank:<主題>' */
type Filter = string

/** 隨機抽下一張，熟練度越低越容易被抽到 */
function pickWeighted(cards: Card[], weight: (c: Card) => number, excludeId?: string): string | null {
  const pool = cards.length > 1 ? cards.filter(c => c.id !== excludeId) : cards
  if (pool.length === 0) return null
  const total = pool.reduce((n, c) => n + weight(c), 0)
  let r = Math.random() * total
  for (const c of pool) {
    r -= weight(c)
    if (r <= 0) return c.id
  }
  return pool[pool.length - 1].id
}

export default function Flashcards() {
  const { cards, setCards, ensureCard } = useCards()
  // 「多益題庫」：不只自己收過的卡，整個題庫（依目標分數）都能翻
  const vocabReady = useVocabReady(true)
  const [level] = useWordLevel()
  const bankCards = (vocabReady && vocabPool({ list: 'toeic' }, level)) || TOEIC_WORDS.filter((_, i) => WORD_INFO[i].level <= level)
  const { favorites, decks, isFavorite, toggleFavorite, createDeck, renameDeck, deleteDeck, toggleInDeck, forgetCard } = useDecks()
  const [stats, setStats] = useWordStats()
  const today = toDateKey()
  // 閱讀測驗寫到一半離開的話，回來直接接著寫
  const [mode, setMode] = useLocalStorage<LearnMode>(LEARN_MODE_KEY, 'flip')
  const [filter, setFilter] = useLocalStorage<Filter>(CARD_FILTER_KEY, 'all')
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [adding, setAdding] = useState(false)

  const wrongIds = recentWrongIds(stats, today)
  const activeDeck = filter.startsWith('deck:') ? decks.find(d => `deck:${d.id}` === filter) : undefined

  const cardsFor = (f: Filter): Card[] => {
    if (f === 'fav') return cards.filter(c => favorites.includes(c.id))
    if (f === 'wrong') return wrongIds.map(id => cards.find(c => c.id === id)).filter(c => c !== undefined)
    if (f === 'toeic') return cards.filter(c => c.source === 'toeic')
    if (f === 'vocab') return cards.filter(c => c.source === 'vocab')
    if (f === 'custom') return cards.filter(c => !c.source)
    if (f === 'bank') return bankCards
    if (f.startsWith('bank:')) return cardsInTopic(bankCards, f.slice(5))
    if (f.startsWith('deck:')) {
      const deck = decks.find(d => `deck:${d.id}` === f)
      return deck ? cards.filter(c => deck.cardIds.includes(c.id)) : []
    }
    return cards
  }

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: '我的卡片' },
    { id: 'bank', label: '📚 多益題庫' },
    { id: 'fav', label: '⭐ 最愛' },
    { id: 'wrong', label: '❌ 最近常錯' },
    { id: 'toeic', label: '多益' },
    { id: 'vocab', label: '學測・英檢' },
    { id: 'custom', label: '自訂' },
    ...decks.map(d => ({ id: `deck:${d.id}`, label: `📁 ${d.name}` })),
  ]

  // 卡組被刪掉時退回「全部」
  const effectiveFilter = filters.some(f => f.id === filter) || filter.startsWith('bank:') ? filter : 'all'
  const visible = cardsFor(effectiveFilter)
  const weight = (c: Card) => MAX_BOX + 1 - (stats[c.id]?.box ?? 0)
  const current = visible.find(c => c.id === currentId) ?? visible[0]

  const show = (id: string | null) => {
    setFlipped(false)
    setCurrentId(id)
  }

  const changeFilter = (f: Filter) => {
    setFilter(f)
    show(pickWeighted(cardsFor(f), weight))
  }

  const nextCard = () => show(pickWeighted(visible, weight, current?.id))

  const grade = (g: Grade) => {
    if (!current) return
    setStats(prev => ({ ...prev, [current.id]: nextStat(prev[current.id], g, today) }))
    // 從題庫翻到的字收進自己的卡片，之後「最近常錯」才看得到
    ensureCard(current)
    nextCard()
  }

  const newDeck = () => {
    const name = prompt('新卡組名稱，例如：會議用語')?.trim()
    if (!name) return
    const id = createDeck(name)
    setFilter(`deck:${id}`)
    show(null)
  }

  const addCard = (card: Card) => {
    ensureCard(card)
    // 正在看某個卡組 / 最愛時，新卡片直接收進去
    if (activeDeck && !activeDeck.cardIds.includes(card.id)) toggleInDeck(activeDeck.id, card)
    if (effectiveFilter === 'fav' && !isFavorite(card.id)) toggleFavorite(card)
    show(card.id)
  }

  const deleteCard = (card: Card) => {
    if (!confirm(`確定從字卡庫刪除「${card.question}」？`)) return
    setCards(prev => prev.filter(c => c.id !== card.id))
    forgetCard(card.id)
  }

  const emptyText =
    cards.length === 0
      ? '還沒有單字卡，先在下方新增吧！'
      : effectiveFilter === 'wrong'
        ? '最近兩週沒有答錯的字 🎉'
        : effectiveFilter === 'fav'
          ? '還沒有最愛的卡片，點卡片下方的 ⭐ 加入'
          : activeDeck
            ? '這個卡組還是空的，點卡片下方的「收錄」加入'
            : '這個分類沒有卡片'

  const modeSwitch = (
    <div className="flex rounded-2xl bg-surface p-1 shadow-sm">
      {(
        [
          ['plan', '菜單'],
          ['flip', '翻卡'],
          ['practice', '刷題'],
          ['reading', '閱讀'],
          ['listening', '聽力'],
          ['grammar', '文法'],
          ['dict', '字典'],
        ] as const
      ).map(([m, label]) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`flex-1 rounded-xl py-2 text-sm transition ${
            mode === m ? 'bg-gradient-to-r from-primary to-primary-2 font-semibold text-on-primary shadow' : 'text-muted'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )

  if (mode === 'plan') {
    return (
      <div className="space-y-4">
        {modeSwitch}
        <StudyPlan onOpen={m => setMode(m as LearnMode)} />
      </div>
    )
  }

  if (mode === 'dict') {
    return (
      <div className="space-y-4">
        {modeSwitch}
        <PhotoLookup />
        <Dictionary />
      </div>
    )
  }

  if (mode === 'grammar') {
    return (
      <div className="space-y-4">
        {modeSwitch}
        <Grammar />
      </div>
    )
  }

  if (mode === 'listening') {
    return (
      <div className="space-y-4">
        {modeSwitch}
        <Listening />
      </div>
    )
  }

  if (mode === 'reading') {
    return (
      <div className="space-y-4">
        {modeSwitch}
        <Reading />
      </div>
    )
  }

  if (mode === 'practice') {
    return (
      <div className="space-y-4">
        {modeSwitch}
        <Practice sources={filters.filter(f => f.id !== 'bank').map(f => ({ id: f.id, label: f.label, cards: cardsFor(f.id) }))} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {modeSwitch}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => changeFilter(f.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${
              effectiveFilter === f.id || (f.id === 'bank' && effectiveFilter.startsWith('bank:'))
                ? 'bg-primary font-semibold text-on-primary'
                : 'bg-surface text-muted'
            }`}
          >
            {f.label} <span className="opacity-70">{cardsFor(f.id).length}</span>
          </button>
        ))}
        <button onClick={newDeck} className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-muted">
          <Plus className="h-4 w-4" /> 卡組
        </button>
      </div>

      {effectiveFilter.startsWith('bank') && vocabReady && (
        <div className="-mx-4 -mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
          {TOEIC_TOPICS.map(t => {
            const id = `bank:${t.id}`
            return (
              <button
                key={t.id}
                onClick={() => changeFilter(effectiveFilter === id ? 'bank' : id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs transition ${effectiveFilter === id ? 'bg-primary-soft font-semibold text-primary-ink ring-1 ring-primary' : 'bg-surface text-muted'}`}
              >
                {t.emoji} {t.label} <span className="opacity-70">{cardsInTopic(bankCards, t.id).length}</span>
              </button>
            )
          })}
        </div>
      )}

      {activeDeck && (
        <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 shadow-sm">
          <span className="flex-1 truncate font-semibold text-fg">📁 {activeDeck.name}</span>
          <button
            onClick={() => {
              const name = prompt('卡組名稱', activeDeck.name)?.trim()
              if (name) renameDeck(activeDeck.id, name)
            }}
            className="rounded-lg p-2 text-muted"
            aria-label="重新命名卡組"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`刪除卡組「${activeDeck.name}」？卡片本身會留在字卡庫。`)) {
                deleteDeck(activeDeck.id)
                changeFilter('all')
              }
            }}
            className="rounded-lg p-2 text-faint hover:text-rose-500"
            aria-label="刪除卡組"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {current ? (
        <>
          {/* key 換掉讓新卡片從正面開始，不會閃過下一題答案 */}
          <FlipCard key={current.id} card={current} flipped={flipped} onFlip={() => setFlipped(f => !f)} />
          <div className="flex items-center justify-between">
            <CardActions card={current} />
            <button onClick={nextCard} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted">
              跳過 <SkipForward className="h-4 w-4" />
            </button>
          </div>
          {flipped ? <GradeButtons onGrade={grade} /> : <p className="py-3 text-center text-sm text-faint">翻面後選擇熟練程度，會自動換下一張</p>}
        </>
      ) : (
        <p className="rounded-2xl bg-surface px-6 py-16 text-center text-faint shadow-sm">{emptyText}</p>
      )}

      <button
        onClick={() => setAdding(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-surface py-3.5 font-semibold text-primary-ink shadow-sm ring-1 ring-primary/20 transition active:scale-[0.98]"
      >
        <Plus className="h-5 w-5" /> 新增單字卡
        {activeDeck && <span className="text-xs font-normal text-muted">（收進「{activeDeck.name}」）</span>}
      </button>
      {adding && <AddCardSheet onAdd={addCard} onClose={() => setAdding(false)} deckName={activeDeck?.name} />}

      {visible.length > 0 && (
        <div className="rounded-2xl bg-surface p-4 shadow-sm">
          <p className="font-semibold text-fg">
            {filters.find(f => f.id === effectiveFilter)?.label}（{visible.length}）
          </p>
          <p className="mb-2 text-xs text-faint">點單字可以直接顯示在上方卡片{visible.length > 200 && `・只列出前 200 個`}</p>
          <ul className="divide-y divide-line">
            {visible.slice(0, 200).map(card => (
              <li key={card.id} className="flex items-center gap-2 py-2.5">
                <button
                  onClick={() => {
                    show(card.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="flex items-center gap-1.5 truncate font-medium text-fg">
                    {card.question}
                    {card.source === 'toeic' && <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-ink">TOEIC</span>}
                  </p>
                  <p className="truncate text-sm text-muted">{card.answer}</p>
                  <div className="mt-1">
                    <MasteryBar stat={stats[card.id]} />
                  </div>
                </button>
                <button
                  onClick={() => toggleFavorite(card)}
                  className={`rounded-lg p-2 ${isFavorite(card.id) ? 'text-amber-500' : 'text-faint'}`}
                  aria-label="最愛"
                >
                  <Star className={`h-4 w-4 ${isFavorite(card.id) ? 'fill-current' : ''}`} />
                </button>
                {activeDeck ? (
                  <button onClick={() => toggleInDeck(activeDeck.id, card)} className="rounded-lg px-2 py-1 text-xs text-faint hover:text-rose-500">
                    移出
                  </button>
                ) : (
                  <button
                    onClick={() => deleteCard(card)}
                    className="rounded-lg p-2 text-faint transition hover:bg-rose-500/10 hover:text-rose-500"
                    aria-label="刪除卡片"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
