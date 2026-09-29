import { useState } from 'react'
import { PartyPopper, X } from 'lucide-react'
import CardActions from './CardActions'
import FlipCard from './FlipCard'
import { GradeButtons } from './Mastery'
import { GRADES, GRADE_DOT } from '../data/grades'
import SpeakButtons from './SpeakButtons'
import type { Card } from '../data/flashcards'
import type { Grade } from '../data/toeicWords'

interface DailyQuizProps {
  words: Card[]
  answered: Record<string, Grade>
  reviewIds: Set<string>
  onAnswer: (id: string, grade: Grade) => void
  onClose: () => void
}

export default function DailyQuiz({ words, answered, reviewIds, onAnswer, onClose }: DailyQuizProps) {
  const [flipped, setFlipped] = useState(false)
  const current = words.find(w => !(w.id in answered))
  const answeredCount = words.filter(w => w.id in answered).length

  const handleGrade = (grade: Grade) => {
    if (!current) return
    onAnswer(current.id, grade)
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
              <CardActions card={current} />
            </div>
            <div className="mt-4">
              {flipped ? (
                <GradeButtons onGrade={handleGrade} />
              ) : (
                <p className="py-4 text-center text-sm text-faint">先想想意思，再點卡片翻面</p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <PartyPopper className="mx-auto h-14 w-14 text-amber-500" />
            <div>
              <p className="text-xl font-bold text-fg">今日單字完成！</p>
              <p className="mt-1 text-sm text-muted">已自動打卡「背單字」</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GRADES.map(g => (
                <div key={g.grade} className="rounded-2xl bg-surface p-3 shadow-sm">
                  <p className="text-2xl font-bold text-fg">{words.filter(w => answered[w.id] === g.grade).length}</p>
                  <p className="text-xs text-muted">
                    <span className={GRADE_DOT[g.grade]}>●</span> {g.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-surface p-4 text-left shadow-sm">
              <p className="mb-2 text-sm font-semibold text-fg">今日單字</p>
              <ul className="divide-y divide-line">
                {words.map(w => {
                  const grade = answered[w.id]
                  return (
                    <li key={w.id} className="space-y-1.5 py-2.5">
                      <div className="flex items-start justify-between gap-3 text-sm">
                        <span className="font-medium text-fg">
                          {grade && <span className={`mr-1.5 ${GRADE_DOT[grade]}`}>●</span>}
                          {w.question}
                        </span>
                        <span className="text-right text-muted">{w.answer}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <SpeakButtons text={w.question} />
                        <CardActions card={w} compact />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
            <p className="text-xs text-faint">紅色、黃色的字明天會再出現複習；綠色的字間隔會越拉越長</p>
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
