import SpeakButtons from './SpeakButtons'
import type { Card } from '../data/flashcards'
import { lookupWord } from '../data/toeicWords'
import { isEnglish } from '../utils/speech'

interface FlipCardProps {
  card: Card
  flipped: boolean
  onFlip: () => void
  /** 顯示在正面左上角的小標籤，例如「複習」 */
  badge?: string
}

function WordChips({ label, words, tone }: { label: string; words: string[]; tone: string }) {
  if (words.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-faint">{label}</span>
      {words.map(w => (
        <span key={w} className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>
          {w}
        </span>
      ))}
    </div>
  )
}

/**
 * 可翻面的卡片。題庫內的單字會顯示音標、英英解釋、同反義詞與例句。
 * 換題時請給不同的 key，讓新卡片直接從正面開始，不會閃過答案。
 */
export default function FlipCard({ card, flipped, onFlip, badge }: FlipCardProps) {
  const info = lookupWord(card.question)
  const english = isEnglish(card.question)

  return (
    <div className="perspective-[1200px]">
      {/* 兩面放在同一個 grid 格子，卡片高度會跟著內容較多的那面 */}
      <div
        role="button"
        tabIndex={0}
        onClick={onFlip}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onFlip()}
        className={`grid min-h-56 w-full cursor-pointer transition-transform duration-500 transform-3d ${flipped ? 'rotate-y-180' : ''}`}
        aria-label="翻轉卡片"
      >
        {/* 正面 */}
        <div className="relative flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-primary to-primary-2 p-6 pb-10 text-on-primary shadow-lg backface-hidden [grid-area:1/1]">
          <span className="absolute top-4 left-5 text-xs font-semibold tracking-widest opacity-70">Q</span>
          {badge && (
            <span className="absolute top-3.5 right-4 rounded-full bg-black/15 px-2 py-0.5 text-xs font-semibold">{badge}</span>
          )}
          <p className="text-center text-3xl font-bold break-words">{card.question}</p>
          {info && (
            <p className="text-sm opacity-90">
              <span className="font-mono">{info.kk}</span> · {info.pos}
            </p>
          )}
          {english && <SpeakButtons text={card.question} dictionary onPrimary />}
          <span className="absolute bottom-4 text-xs opacity-70">點擊翻面看答案</span>
        </div>

        {/* 背面 */}
        <div className="relative flex flex-col justify-center gap-3 rounded-3xl bg-surface p-6 text-fg shadow-lg ring-1 ring-line rotate-y-180 backface-hidden [grid-area:1/1]">
          <span className="absolute top-4 left-5 text-xs font-semibold tracking-widest text-emerald-500">A</span>
          {info ? (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold text-muted">
                  {card.question} <span className="font-mono text-sm">{info.kk}</span>
                </p>
                <p className="mt-1 text-2xl font-bold">
                  <span className="mr-1.5 align-middle text-sm font-semibold text-primary">{info.pos}</span>
                  {info.zh}
                </p>
              </div>
              <p className="rounded-xl bg-surface-2 p-3 text-sm leading-relaxed text-muted">
                <span className="mr-1 text-xs font-semibold text-faint">英英</span>
                {info.def}
              </p>
              <div className="rounded-xl bg-primary-soft p-3">
                <p className="text-sm leading-relaxed text-fg">{info.ex}</p>
                <p className="mt-0.5 text-xs text-muted">{info.exZh}</p>
                <div className="mt-2 flex justify-start">
                  <SpeakButtons text={info.ex} />
                </div>
              </div>
              <WordChips label="同義" words={info.syn} tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" />
              <WordChips label="反義" words={info.ant} tone="bg-rose-500/15 text-rose-600 dark:text-rose-400" />
              <SpeakButtons text={card.question} dictionary />
            </>
          ) : (
            <>
              <p className="text-center text-2xl font-bold break-words">{card.answer}</p>
              {english && <SpeakButtons text={card.question} dictionary />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
