import { useRef } from 'react'
import { MasteryBar } from './Mastery'
import SpeakButtons from './SpeakButtons'
import WordDetail from './WordDetail'
import type { Card } from '../data/flashcards'
import { lookupWord } from '../data/toeicWords'
import { useWordStats } from '../hooks/useDailyWords'
import { useSpeechSettings } from '../hooks/useSpeechSettings'
import { useWordPopup } from '../hooks/useWordPopup'
import { isEnglish, speak } from '../utils/speech'

interface FlipCardProps {
  card: Card
  flipped: boolean
  onFlip: () => void
  /** 顯示在正面右上角的小標籤，例如「複習」 */
  badge?: string
}

/**
 * 可翻面的卡片。題庫內的單字會顯示音標、英英解釋、同反義詞與例句。
 * 換題時請給不同的 key，讓新卡片直接從正面開始，不會閃過答案（也會重置「第一次翻卡朗讀」）。
 */
export default function FlipCard({ card, flipped, onFlip, badge }: FlipCardProps) {
  const info = lookupWord(card.question)
  const english = isEnglish(card.question)
  const [stats] = useWordStats()
  const [{ accent, autoSpeak }] = useSpeechSettings()
  const { open } = useWordPopup()
  const spoken = useRef(false)

  // 朗讀必須在點擊事件內直接呼叫，iPhone Safari 才允許發聲
  const flip = () => {
    onFlip()
    if (!english || autoSpeak === 'off') return
    if (autoSpeak === 'every' || !spoken.current) speak(card.question, accent)
    spoken.current = true
  }

  const face = 'relative overflow-hidden rounded-3xl bg-surface shadow-lg ring-1 ring-line backface-hidden [grid-area:1/1]'
  const strip = <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary to-primary-2" />

  return (
    <div className="perspective-[1200px]">
      {/* 兩面放在同一個 grid 格子，卡片高度會跟著內容較多的那面 */}
      <div
        role="button"
        tabIndex={0}
        onClick={flip}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && flip()}
        className={`grid min-h-60 w-full cursor-pointer transition-transform duration-500 transform-3d ${flipped ? 'rotate-y-180' : ''}`}
        aria-label="翻轉卡片"
      >
        {/* 正面 */}
        <div className={`${face} flex flex-col items-center justify-center gap-3 p-6 pt-8 pb-12`}>
          {strip}
          <span className="absolute top-4 left-5 text-xs font-semibold tracking-widest text-faint">Q</span>
          {badge && (
            <span className="absolute top-3.5 right-4 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-ink">
              {badge}
            </span>
          )}
          <p className="text-center text-3xl font-bold break-words text-primary-ink">{card.question}</p>
          {info && (
            <p className="text-sm text-muted">
              <span className="font-mono">{info.kk}</span> · {info.pos}
            </p>
          )}
          {english && <SpeakButtons text={card.question} dictionary />}
          <div className="absolute inset-x-5 bottom-4 flex items-center justify-between">
            <MasteryBar stat={stats[card.id]} />
            <span className="text-xs text-faint">點擊翻面</span>
          </div>
        </div>

        {/* 背面 */}
        <div className={`${face} flex flex-col justify-center gap-3 p-6 pt-8 rotate-y-180`}>
          {strip}
          <span className="absolute top-4 left-5 text-xs font-semibold tracking-widest text-emerald-500">A</span>
          {info ? (
            <>
              <WordDetail info={info} onWordClick={open} />
              <SpeakButtons text={card.question} dictionary />
            </>
          ) : (
            <>
              <p className="text-center text-2xl font-bold break-words text-fg">{card.answer}</p>
              {english && <SpeakButtons text={card.question} dictionary />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
