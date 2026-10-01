import { useMemo, useState } from 'react'
import { Search, Volume2 } from 'lucide-react'
import { WORD_INFO } from '../data/toeicWords'
import { vocabEntries } from '../data/vocab'
import { useSpeechSettings } from '../hooks/useSpeechSettings'
import { useVocabReady } from '../hooks/useDailyWords'
import { useWordPopup } from '../hooks/useWordPopup'
import { speak } from '../utils/speech'

interface Entry {
  word: string
  pos: string
  zh: string
  /** 顯示用的分類標籤，例如「學測 3」「多益 800」 */
  tags: string[]
}

type ListFilter = 'all' | 'toeic' | 'ceec'

const PAGE = 60
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/** 單字索引：多益題庫與學測字表合在一起，可以用英文或中文搜尋、依字首瀏覽 */
export default function Dictionary() {
  const ready = useVocabReady(true)
  const { open } = useWordPopup()
  const [{ accent }] = useSpeechSettings()
  const [query, setQuery] = useState('')
  const [list, setList] = useState<ListFilter>('all')
  const [level, setLevel] = useState(0)
  const [letter, setLetter] = useState('')
  const [shown, setShown] = useState(PAGE)

  const all = useMemo<Entry[]>(() => {
    const map = new Map<string, Entry>()
    for (const w of WORD_INFO) map.set(w.word.toLowerCase(), { word: w.word, pos: w.pos, zh: w.zh, tags: [`多益 ${w.level}`] })
    for (const e of (ready && vocabEntries()) || []) {
      const key = e.info.word.toLowerCase()
      const cur = map.get(key)
      const tag = `學測 ${e.ceec}`
      if (cur) cur.tags.push(tag)
      else map.set(key, { word: e.info.word, pos: e.info.pos, zh: e.info.zh, tags: [tag] })
    }
    return [...map.values()].sort((a, b) => a.word.localeCompare(b.word, 'en', { sensitivity: 'base' }))
  }, [ready])

  const q = query.trim().toLowerCase()
  const results = all.filter(e => {
    if (list === 'toeic' && !e.tags.some(t => t.startsWith('多益'))) return false
    if (list === 'ceec' && !e.tags.some(t => t.startsWith('學測') && (!level || t === `學測 ${level}`))) return false
    if (letter && !e.word.toUpperCase().startsWith(letter)) return false
    if (!q) return true
    return /[a-z]/.test(q) ? e.word.toLowerCase().includes(q) : e.zh.includes(q)
  })
  // 英文搜尋時，開頭相符的排前面
  if (q && /[a-z]/.test(q)) results.sort((a, b) => Number(!a.word.toLowerCase().startsWith(q)) - Number(!b.word.toLowerCase().startsWith(q)))

  const chip = (active: boolean) => `shrink-0 rounded-full px-3 py-1.5 text-sm transition ${active ? 'bg-primary font-semibold text-on-primary' : 'bg-surface text-muted'}`
  const reset = () => setShown(PAGE)

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            reset()
          }}
          placeholder="搜尋英文或中文，例如 schedule、預算"
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full rounded-2xl border border-line bg-surface py-3 pr-4 pl-10 text-base text-fg outline-none placeholder:text-faint focus:border-primary"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {(
          [
            ['all', '全部'],
            ['toeic', '多益'],
            ['ceec', '學測'],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => {
              setList(v)
              setLevel(0)
              reset()
            }}
            className={chip(list === v)}
          >
            {label}
          </button>
        ))}
        {list === 'ceec' &&
          [1, 2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => {
                setLevel(level === n ? 0 : n)
                reset()
              }}
              className={chip(level === n)}
            >
              {n} 級
            </button>
          ))}
      </div>

      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1">
        {LETTERS.map(l => (
          <button
            key={l}
            onClick={() => {
              setLetter(letter === l ? '' : l)
              reset()
            }}
            className={`h-8 w-8 shrink-0 rounded-lg text-sm font-semibold ${letter === l ? 'bg-primary text-on-primary' : 'bg-surface text-muted'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <p className="px-1 text-xs text-faint">
        {ready ? `共 ${results.length.toLocaleString()} 字・點單字看解釋、例句，也能收進卡組` : '學測字表載入中…（先顯示多益題庫）'}
      </p>

      <ul className="divide-y divide-line rounded-2xl bg-surface px-4 shadow-sm">
        {results.slice(0, shown).map(e => (
          <li key={e.word} className="flex items-center gap-2 py-2.5">
            <button onClick={() => open(e.word)} className="min-w-0 flex-1 text-left">
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-fg">{e.word}</span>
                <span className="text-xs text-faint">{e.pos}</span>
              </p>
              <p className="truncate text-sm text-muted">{e.zh}</p>
            </button>
            <span className="flex shrink-0 flex-col items-end gap-0.5">
              {e.tags.map(t => (
                <span key={t} className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-ink">
                  {t}
                </span>
              ))}
            </span>
            <button onClick={() => speak(e.word, accent)} className="rounded-lg p-2 text-faint" aria-label={`念出 ${e.word}`}>
              <Volume2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="py-10 text-center text-sm text-faint">找不到符合的單字</li>}
      </ul>

      {results.length > shown && (
        <button onClick={() => setShown(n => n + PAGE)} className="w-full rounded-2xl bg-surface py-3 text-sm font-medium text-primary-ink shadow-sm">
          顯示更多（還有 {(results.length - shown).toLocaleString()} 字）
        </button>
      )}
    </div>
  )
}
