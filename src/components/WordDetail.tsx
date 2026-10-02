import type { MouseEvent } from 'react'
import SpeakButtons from './SpeakButtons'
import type { WordInfo } from '../data/toeicWords'

function WordChips({ label, words, tone, onWordClick }: { label: string; words: string[]; tone: string; onWordClick: (word: string) => void }) {
  if (words.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold text-faint">{label}</span>
      {words.map(w => (
        <button
          key={w}
          type="button"
          onClick={(e: MouseEvent) => {
            e.stopPropagation()
            onWordClick(w)
          }}
          className={`rounded-full px-2.5 py-1 text-xs underline decoration-dotted underline-offset-2 transition active:scale-95 ${tone}`}
        >
          {w}
        </button>
      ))}
    </div>
  )
}

/** 單字詳細內容：中文、英英、例句、可點擊的同反義詞。翻卡背面與單字小視窗共用。 */
export default function WordDetail({ info, onWordClick, showHeader = true }: { info: WordInfo; onWordClick: (word: string) => void; showHeader?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {showHeader && (
        <div className="text-center">
          <p className="text-lg font-semibold text-muted">
            {info.word} <span className="font-mono text-sm">{info.kk}</span>
          </p>
          <p className="mt-1 text-2xl font-bold text-fg">
            <span className="mr-1.5 align-middle text-sm font-semibold text-primary-ink">{info.pos}</span>
            {info.zh}
          </p>
        </div>
      )}
      {info.def && (
        <p className="rounded-xl bg-surface-2 p-3 text-sm leading-relaxed text-muted">
          <span className="mr-1 text-xs font-semibold text-faint">英英</span>
          {info.def}
        </p>
      )}
      {info.ex && (
        <div className="rounded-xl bg-primary-soft p-3">
          <p className="text-sm leading-relaxed text-fg">{info.ex}</p>
          <p className="mt-0.5 text-xs text-muted">{info.exZh}</p>
          <div className="mt-2 flex justify-start">
            <SpeakButtons text={info.ex} />
          </div>
        </div>
      )}
      <WordChips label="同義" words={info.syn} tone="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" onWordClick={onWordClick} />
      <WordChips label="反義" words={info.ant} tone="bg-rose-500/15 text-rose-700 dark:text-rose-300" onWordClick={onWordClick} />
    </div>
  )
}
