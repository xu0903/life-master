import { useMemo, useState } from 'react'
import { Check, Plus, Search, X } from 'lucide-react'
import type { Card } from '../data/flashcards'
import { allWordCards, cardForWord, lookupWord } from '../data/toeicWords'
import { useVocabReady } from '../hooks/useDailyWords'
import { newId } from '../utils/date'

const field =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-fg outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20'
const splitList = (s: string) =>
  s
    .split(/[,，、]/)
    .map(x => x.trim())
    .filter(Boolean)
/** 中文解釋拆成一個個意思（「；」分隔，詞性標註留在意思裡） */
const splitMeanings = (zh: string) =>
  zh
    .split(/[；;]/)
    .map(x => x.trim())
    .filter(Boolean)

/**
 * 新增單字卡：輸入單字就從題庫帶出詞性、各個意思、例句與同反義詞，全部都可以改。
 * 沒有改任何內容時直接收題庫的卡（熟練度跟題庫共用）；有改就存成自己的卡。
 */
export default function AddCardSheet({ onAdd, onClose, deckName }: { onAdd: (card: Card) => void; onClose: () => void; deckName?: string }) {
  useVocabReady(true)
  const [word, setWord] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const info = picked ? lookupWord(picked) : lookupWord(word)
  const [meanings, setMeanings] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [extra, setExtra] = useState('')
  const [pos, setPos] = useState('')
  const [ex, setEx] = useState('')
  const [exZh, setExZh] = useState('')
  const [syn, setSyn] = useState('')
  const [ant, setAnt] = useState('')
  const [filledFor, setFilledFor] = useState('')

  // 找到題庫的字就自動帶入（換字時重新帶入；改成題庫沒有的字就清掉）
  if (!info && filledFor) {
    setFilledFor('')
    setMeanings([])
    setSelected(new Set())
    setPos('')
    setEx('')
    setExZh('')
    setSyn('')
    setAnt('')
  }
  if (info && filledFor !== info.word) {
    const list = splitMeanings(info.zh)
    setFilledFor(info.word)
    setMeanings(list)
    setSelected(new Set(list))
    setPos(info.pos)
    setEx(info.ex)
    setExZh(info.exZh)
    setSyn(info.syn.join(', '))
    setAnt(info.ant.join(', '))
  }

  const q = word.trim().toLowerCase()
  const suggestions = useMemo(() => {
    if (q.length < 2 || info) return []
    return allWordCards()
      .filter(c => c.question.toLowerCase().startsWith(q))
      .sort((a, b) => a.question.length - b.question.length)
      .slice(0, 6)
  }, [q, info])

  const chosen = [...meanings.filter(m => selected.has(m)), ...splitList(extra)]
  const answer = chosen.length ? `${pos ? `(${pos}) ` : ''}${chosen.join('；')}` : ''
  const canSave = !!word.trim() && !!answer

  const save = () => {
    if (!canSave) return
    const text = word.trim()
    const bank = info ? cardForWord(info.word) : undefined
    // 跟題庫一模一樣就收題庫的卡
    const untouched =
      bank &&
      info &&
      chosen.join('；') === meanings.join('；') &&
      pos === info.pos &&
      ex === info.ex &&
      exZh === info.exZh &&
      syn === info.syn.join(', ') &&
      ant === info.ant.join(', ')
    if (untouched) onAdd(bank)
    else
      onAdd({
        id: newId(),
        question: info?.word ?? text,
        answer,
        pos: pos || undefined,
        ex: ex.trim() || undefined,
        exZh: exZh.trim() || undefined,
        syn: splitList(syn),
        ant: splitList(ant),
      })
    onClose()
  }

  const toggle = (m: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 -mx-5 flex items-center bg-surface px-3 pb-2">
          <button onClick={onClose} className="rounded-full p-2 text-muted hover:bg-surface-2" aria-label="關閉">
            <X className="h-6 w-6" />
          </button>
          <p className="flex-1 text-center text-sm text-faint">新增單字卡{deckName && `・收進「${deckName}」`}</p>
          <button onClick={save} disabled={!canSave} className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-on-primary disabled:opacity-40">
            儲存
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            autoFocus
            value={word}
            onChange={e => {
              setWord(e.target.value)
              setPicked(null)
            }}
            placeholder="輸入英文單字，例如 schedule"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={`${field} pl-10 text-lg font-semibold`}
          />
        </div>
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setWord(c.question)
                  setPicked(c.question)
                }}
                className="rounded-full bg-surface-2 px-3 py-1 text-sm text-fg"
              >
                {c.question}
              </button>
            ))}
          </div>
        )}

        {word.trim() && !info && suggestions.length === 0 && <p className="mt-2 text-xs text-faint">題庫裡沒有這個字，請自己填寫意思（其他欄位可以留空）</p>}

        {(info || word.trim()) && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <p className="text-sm font-semibold text-fg">意思</p>
                <input
                  value={pos}
                  onChange={e => setPos(e.target.value)}
                  placeholder="詞性 n./v."
                  className="w-24 rounded-lg bg-surface-2 px-2 py-1 text-xs text-fg outline-none"
                />
                {meanings.length > 1 && <span className="text-xs text-faint">點選要放進卡片的意思</span>}
              </div>
              {meanings.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {meanings.map(m => (
                    <button
                      key={m}
                      onClick={() => toggle(m)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${selected.has(m) ? 'bg-primary text-on-primary' : 'bg-surface-2 text-muted line-through'}`}
                    >
                      {selected.has(m) && <Check className="h-3.5 w-3.5" />}
                      {m}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 shrink-0 text-faint" />
                <input
                  value={extra}
                  onChange={e => setExtra(e.target.value)}
                  placeholder={meanings.length ? '補充其他意思（用逗號分隔）' : '中文意思（必填，用逗號分隔）'}
                  className={field}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-fg">例句</p>
              <textarea value={ex} onChange={e => setEx(e.target.value)} rows={2} placeholder="英文例句" className={`${field} resize-none`} />
              <input value={exZh} onChange={e => setExZh(e.target.value)} placeholder="例句翻譯" className={field} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-sm font-semibold text-fg">同義詞</span>
                <input value={syn} onChange={e => setSyn(e.target.value)} placeholder="用逗號分隔" className={field} />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-semibold text-fg">反義詞</span>
                <input value={ant} onChange={e => setAnt(e.target.value)} placeholder="用逗號分隔" className={field} />
              </label>
            </div>

            {answer && (
              <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted">
                卡片背面：<span className="text-fg">{answer}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
