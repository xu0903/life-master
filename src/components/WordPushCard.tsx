import { useState } from 'react'
import { X } from 'lucide-react'
import { GradeButtons, MasteryBar } from './Mastery'
import SpeakButtons from './SpeakButtons'
import WordDetail from './WordDetail'
import { findCard, lookupWord, nextStat } from '../data/toeicWords'
import type { Grade } from '../data/toeicWords'
import { useCards } from '../hooks/useCards'
import { useVocabReady, useWordStats } from '../hooks/useDailyWords'
import { useWordPopup } from '../hooks/useWordPopup'
import { toDateKey } from '../utils/date'
import { isEnglish } from '../utils/speech'

/** 點推播單字卡打開：先只看單字，想好了再翻答案、評分 */
export default function WordPushCard({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const ready = useVocabReady(cardId.startsWith('vocab-'))
  const { cards, ensureCard } = useCards()
  const [stats, setStats] = useWordStats()
  const { open } = useWordPopup()
  const [revealed, setRevealed] = useState(false)
  const [graded, setGraded] = useState<Grade | null>(null)

  const card = cards.find(c => c.id === cardId) ?? (ready ? findCard(cardId) : undefined)
  const info = card ? lookupWord(card.question) : undefined

  const grade = (g: Grade) => {
    if (!card) return
    ensureCard(card)
    setStats(prev => ({ ...prev, [card.id]: nextStat(prev[card.id], g, toDateKey()) }))
    setGraded(g)
    setTimeout(onClose, 700)
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center">
          <span className="text-xs text-faint">📘 推播單字卡</span>
          <button onClick={onClose} className="ml-auto rounded-full p-2 text-faint hover:bg-surface-2" aria-label="關閉">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!card ? (
          <p className="py-10 text-center text-sm text-faint">{ready ? '找不到這張卡片，可能已經刪掉了' : '載入中…'}</p>
        ) : (
          <>
            <div className="mb-4 text-center">
              <p className="text-4xl font-bold break-words text-primary-ink">{card.question}</p>
              {info?.kk && <p className="mt-1 font-mono text-sm text-muted">{info.kk}</p>}
              {isEnglish(card.question) && (
                <div className="mt-3">
                  <SpeakButtons text={card.question} dictionary />
                </div>
              )}
              <div className="mt-3">
                <MasteryBar stat={stats[card.id]} />
              </div>
            </div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-2 py-3.5 font-semibold text-on-primary shadow-md"
              >
                顯示答案
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-lg font-medium text-fg">{info ? `(${info.pos}) ${info.zh}` : card.answer}</p>
                {info && <WordDetail info={info} onWordClick={open} showHeader={false} />}
                {graded ? (
                  <p className="py-3 text-center text-sm font-medium text-emerald-500">已記錄，下次會照熟練度安排複習</p>
                ) : (
                  <GradeButtons onGrade={grade} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
