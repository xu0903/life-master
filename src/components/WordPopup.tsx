import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import CardActions from './CardActions'
import SpeakButtons from './SpeakButtons'
import WordDetail from './WordDetail'
import { cardForWord, lookupWord } from '../data/toeicWords'
import { WordPopupContext } from '../hooks/useWordPopup'
import { isEnglish } from '../utils/speech'

/**
 * 單字小視窗：點同義 / 反義詞時跳出，不會離開目前的卡片。
 * 視窗內再點其他字會疊加一層，按「返回」回到上一個字，按 ✕ 全部關閉。
 */
export default function WordPopupProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([])
  const word = stack[stack.length - 1]
  const info = word ? lookupWord(word) : undefined
  const card = info ? cardForWord(info.word) : undefined

  const open = (w: string) => setStack(prev => (prev[prev.length - 1] === w ? prev : [...prev, w]))
  const back = () => setStack(prev => prev.slice(0, -1))
  const close = () => setStack([])

  return (
    <WordPopupContext.Provider value={{ open }}>
      {children}
      {word && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={close}>
          <div
            className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              {stack.length > 1 ? (
                <button onClick={back} className="flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-sm text-muted">
                  <ArrowLeft className="h-4 w-4" /> {stack[stack.length - 2]}
                </button>
              ) : (
                <span className="text-xs text-faint">單字解釋</span>
              )}
              <button onClick={close} className="ml-auto rounded-full p-2 text-faint hover:bg-surface-2" aria-label="關閉">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 text-center">
              <p className="text-3xl font-bold break-words text-primary-ink">{word}</p>
              {info && (
                <p className="mt-1 text-sm text-muted">
                  <span className="font-mono">{info.kk}</span> · {info.pos} · <span className="font-medium text-fg">{info.zh}</span>
                </p>
              )}
              {isEnglish(word) && (
                <div className="mt-3">
                  <SpeakButtons text={word} dictionary />
                </div>
              )}
            </div>

            {info ? (
              <>
                <WordDetail info={info} onWordClick={open} showHeader={false} />
                {card && (
                  <div className="mt-4 flex justify-center">
                    <CardActions card={card} />
                  </div>
                )}
              </>
            ) : (
              <p className="rounded-xl bg-surface-2 p-4 text-center text-sm text-muted">
                這個字不在題庫裡，可以聽發音或點 Cambridge 查看完整解釋。
              </p>
            )}
          </div>
        </div>
      )}
    </WordPopupContext.Provider>
  )
}
