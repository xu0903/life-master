import SpeakButtons from './SpeakButtons'
import type { Card } from '../data/flashcards'
import { lookupWord } from '../data/toeicWords'
import { isEnglish } from '../utils/speech'

interface FlipCardProps {
  card: Card
  flipped: boolean
  onFlip: () => void
}

function WordChips({ label, words, tone }: { label: string; words: string[]; tone: string }) {
  if (words.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
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
export default function FlipCard({ card, flipped, onFlip }: FlipCardProps) {
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
        <div className="relative flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 p-6 pb-10 text-white shadow-lg backface-hidden [grid-area:1/1]">
          <span className="absolute top-4 left-5 text-xs font-semibold tracking-widest opacity-70">Q</span>
          <p className="text-center text-3xl font-bold break-words">{card.question}</p>
          {info && (
            <p className="text-sm opacity-90">
              <span className="font-mono">{info.kk}</span> · {info.pos}
            </p>
          )}
          {english && <SpeakButtons text={card.question} dictionary light />}
          <span className="absolute bottom-4 text-xs opacity-70">點擊翻面看答案</span>
        </div>

        {/* 背面 */}
        <div className="relative flex flex-col justify-center gap-3 rounded-3xl bg-white p-6 text-slate-800 shadow-lg rotate-y-180 backface-hidden [grid-area:1/1]">
          <span className="absolute top-4 left-5 text-xs font-semibold tracking-widest text-emerald-500">A</span>
          {info ? (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-500">
                  {card.question} <span className="font-mono text-sm">{info.kk}</span>
                </p>
                <p className="mt-1 text-2xl font-bold">
                  <span className="mr-1.5 align-middle text-sm font-semibold text-violet-500">{info.pos}</span>
                  {info.zh}
                </p>
              </div>
              <p className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                <span className="mr-1 text-xs font-semibold text-slate-400">英英</span>
                {info.def}
              </p>
              <div className="rounded-xl bg-indigo-50 p-3">
                <p className="text-sm leading-relaxed text-slate-800">{info.ex}</p>
                <p className="mt-0.5 text-xs text-slate-500">{info.exZh}</p>
                <div className="mt-2 flex justify-start">
                  <SpeakButtons text={info.ex} />
                </div>
              </div>
              <WordChips label="同義" words={info.syn} tone="bg-emerald-50 text-emerald-700" />
              <WordChips label="反義" words={info.ant} tone="bg-red-50 text-red-600" />
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
