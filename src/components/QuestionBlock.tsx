import { Check, X } from 'lucide-react'
import type { ReadingQuestion } from '../data/reading'
import { lookupInflected } from '../data/toeicWords'
import { useWordPopup } from '../hooks/useWordPopup'

const LETTERS = ['A', 'B', 'C', 'D']

/** 英文文字：題庫裡有的單字加上虛線，點一下就能查解釋 */
export function LookupText({ text }: { text: string }) {
  const { open } = useWordPopup()
  return (
    <>
      {text.split(/([A-Za-z][A-Za-z'’-]*)/).map((part, i) => {
        const info = i % 2 === 1 ? lookupInflected(part) : undefined
        if (!info) return part
        return (
          <span
            key={i}
            role="button"
            onClick={e => {
              e.stopPropagation()
              open(info.word)
            }}
            className="cursor-pointer underline decoration-primary/40 decoration-dotted underline-offset-4"
          >
            {part}
          </span>
        )
      })}
    </>
  )
}

/** 一題選擇題：作答中可以選，reveal 之後顯示對錯與解析 */
export default function QuestionBlock({
  question,
  picked,
  reveal,
  onPick,
  hideOptions = false,
}: {
  question: ReadingQuestion
  picked: number | undefined
  reveal: boolean
  onPick?: (option: number) => void
  /** 聽力 Part 2：題目與選項只用聽的，對答案後才顯示文字 */
  hideOptions?: boolean
}) {
  const optionClass = (i: number) => {
    if (reveal) {
      if (i === question.answer) return 'bg-emerald-500 text-white'
      if (i === picked) return 'bg-rose-500 text-white'
      return 'bg-surface text-faint ring-1 ring-line'
    }
    return i === picked ? 'bg-primary-soft text-primary-ink ring-2 ring-primary' : 'bg-surface text-fg ring-1 ring-line active:scale-[0.99]'
  }
  const showText = !hideOptions || reveal

  return (
    <div className="space-y-2">
      <p className="leading-relaxed font-medium whitespace-pre-line text-fg">
        <span className="mr-1.5 text-primary-ink tabular-nums">{question.number}.</span>
        {!showText ? (
          <span className="text-muted">聽完題目與三個回應後，選出最適合的回應</span>
        ) : question.text ? (
          <LookupText text={question.text} />
        ) : (
          <span className="text-muted">選出最適合填入空格的答案</span>
        )}
      </p>
      <div className={hideOptions && !reveal ? 'grid grid-cols-3 gap-2' : 'grid gap-2'}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            disabled={reveal || !onPick}
            onClick={() => onPick?.(i)}
            className={`flex gap-2.5 rounded-xl px-3.5 py-3 text-left text-[15px] transition ${showText ? '' : 'justify-center'} ${optionClass(i)}`}
          >
            <span className="font-semibold">({LETTERS[i]})</span>
            {showText && <span className="flex-1">{opt}</span>}
          </button>
        ))}
      </div>
      {reveal && (
        <div className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
          <p className={`flex items-center gap-1 font-semibold ${picked === question.answer ? 'text-emerald-500' : 'text-rose-500'}`}>
            {picked === question.answer ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {picked === question.answer ? '答對了' : picked === undefined ? `未作答，答案是 (${LETTERS[question.answer]})` : `答案是 (${LETTERS[question.answer]})`}
          </p>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
