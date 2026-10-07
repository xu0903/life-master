import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Camera, Check, Loader2, X } from 'lucide-react'
import { WORD_INFO, cardForWord, lookupInflected } from '../data/toeicWords'
import type { WordInfo, WordStat } from '../data/toeicWords'
import { vocabEntries } from '../data/vocab'
import { useDecks } from '../hooks/useCards'
import { useVocabReady, useWordStats } from '../hooks/useDailyWords'
import { useWordPopup } from '../hooks/useWordPopup'

/** 拍照找到的字收進這個卡組 */
const PHOTO_DECK = { id: 'photo-words', name: '拍照生字' }
/** 辨識前把照片縮到這個寬高以內：夠清楚，手機上也跑得快 */
const MAX_SIDE = 1800

type Status = 'new' | 'learning' | 'known'

interface Found {
  info: WordInfo
  status: Status
  /** 在照片上的位置（百分比） */
  box: { left: number; top: number; width: number; height: number }
}

const STATUS_STYLE: Record<Status, { box: string; chip: string; label: string }> = {
  new: { box: 'border-rose-500 bg-rose-500/25', chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', label: '沒學過' },
  learning: { box: 'border-amber-400 bg-amber-400/25', chip: 'bg-amber-400/15 text-amber-700 dark:text-amber-300', label: '學習中' },
  known: { box: 'border-emerald-500 bg-emerald-500/15', chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', label: '已熟悉' },
}

function statusOf(stat: WordStat | undefined): Status {
  if (!stat) return 'new'
  return stat.box >= 3 ? 'known' : 'learning'
}

/** 把照片轉正、縮小成 canvas（iPhone 照片很大，直接辨識會很慢） */
function loadImage(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image'))
    }
    img.src = url
  })
}

/**
 * 拍照查單字：在手機上用 Tesseract 辨識照片裡的英文（不會上傳照片），
 * 依熟練度把字框成紅 / 黃 / 綠，點一下看解釋，也能一鍵把生字收進卡組。
 */
export default function PhotoLookup() {
  const ready = useVocabReady(true)
  const [stats] = useWordStats()
  const { open } = useWordPopup()
  const { decks, addToFixedDeck } = useDecks()
  const inputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string | null>(null)
  const [found, setFound] = useState<Found[] | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 學測 1–2 級這類基本字不框，畫面才不會滿滿都是框
  const easy = useMemo(() => {
    const set = new Set<string>()
    for (const e of (ready && vocabEntries()) || []) if (e.ceec > 0 && e.ceec <= 2 && !e.toeic && !e.adv) set.add(e.info.word.toLowerCase())
    for (const w of WORD_INFO) set.delete(w.word.toLowerCase())
    return set
  }, [ready])

  const scan = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setFound(null)
    setProgress('讀取照片…')
    try {
      const canvas = await loadImage(file)
      setImage(canvas.toDataURL('image/jpeg', 0.85))
      setProgress('第一次使用要下載辨識模型（約 10 MB）…')
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') setProgress(`辨識中 ${Math.round(m.progress * 100)}%`)
        },
      })
      const { data } = await worker.recognize(canvas, {}, { blocks: true })
      await worker.terminate()

      const result: Found[] = []
      for (const block of data.blocks ?? [])
        for (const para of block.paragraphs)
          for (const line of para.lines)
            for (const word of line.words) {
              const token = word.text.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '')
              if (word.confidence < 55 || token.length < 3 || !/^[A-Za-z][A-Za-z'-]*$/.test(token)) continue
              const info = lookupInflected(token)
              if (!info || easy.has(info.word.toLowerCase())) continue
              const card = cardForWord(info.word)
              const { x0, y0, x1, y1 } = word.bbox
              const item: Found = {
                info,
                status: statusOf(card ? stats[card.id] : undefined),
                box: {
                  left: (x0 / canvas.width) * 100,
                  top: (y0 / canvas.height) * 100,
                  width: ((x1 - x0) / canvas.width) * 100,
                  height: ((y1 - y0) / canvas.height) * 100,
                },
              }
              result.push(item)
            }
      setFound(result)
      setProgress(null)
    } catch {
      setProgress(null)
      setError('辨識失敗：請確認有網路（第一次要下載模型），或換一張比較清楚的照片')
    }
  }

  const unique = found ? [...new Map(found.map(f => [f.info.word, f])).values()] : []
  const newWords = unique.filter(f => f.status === 'new')
  const deck = decks.find(d => d.id === PHOTO_DECK.id)
  const inDeck = (word: string) => {
    const card = cardForWord(word)
    return !!card && !!deck?.cardIds.includes(card.id)
  }
  const pending = newWords.filter(f => !inDeck(f.info.word))

  const addAll = () => {
    for (const f of pending) {
      const card = cardForWord(f.info.word)
      if (card) addToFixedDeck(PHOTO_DECK.id, PHOTO_DECK.name, card)
    }
  }

  const reset = () => {
    setImage(null)
    setFound(null)
    setError(null)
  }

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => void scan(e)} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
            <Camera className="h-4 w-4 text-primary-ink" /> 拍照查單字
          </p>
          <p className="mt-0.5 text-xs text-muted">拍課本、考卷或菜單，標出你還不熟的字（照片不會上傳）</p>
        </div>
        {image && !progress ? (
          <button onClick={reset} className="shrink-0 rounded-full p-2 text-faint hover:bg-surface-2" aria-label="關閉">
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            disabled={!!progress || !ready}
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50"
          >
            拍照
          </button>
        )}
      </div>

      {progress && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {progress}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

      {image && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <img src={image} alt="拍攝的照片" className="block w-full" />
          {found?.map((f, i) => (
            <button
              key={i}
              onClick={() => open(f.info.word)}
              aria-label={f.info.word}
              className={`absolute rounded-sm border-2 ${STATUS_STYLE[f.status].box}`}
              style={{ left: `${f.box.left}%`, top: `${f.box.top}%`, width: `${f.box.width}%`, height: `${f.box.height}%` }}
            />
          ))}
        </div>
      )}

      {found && (
        <div className="mt-3 space-y-3">
          {unique.length === 0 ? (
            <p className="text-center text-sm text-faint">沒有找到題庫裡的字，換一張比較清楚、字比較大的照片試試</p>
          ) : (
            <>
              <div className="flex gap-3 text-xs text-muted">
                {(['new', 'learning', 'known'] as const).map(s => (
                  <span key={s} className="flex items-center gap-1">
                    <span className={`h-3 w-3 rounded-sm border-2 ${STATUS_STYLE[s].box}`} />
                    {STATUS_STYLE[s].label} {unique.filter(f => f.status === s).length}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {unique
                  .sort((a, b) => ['new', 'learning', 'known'].indexOf(a.status) - ['new', 'learning', 'known'].indexOf(b.status))
                  .map(f => (
                    <button key={f.info.word} onClick={() => open(f.info.word)} className={`rounded-full px-3 py-1.5 text-sm ${STATUS_STYLE[f.status].chip}`}>
                      {f.info.word} <span className="opacity-70">{f.info.zh.split(/[;；,，]/)[0]}</span>
                    </button>
                  ))}
              </div>
              {newWords.length > 0 && (
                <button
                  disabled={pending.length === 0}
                  onClick={addAll}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-medium text-on-primary disabled:opacity-50"
                >
                  {pending.length === 0 ? (
                    <>
                      <Check className="h-4 w-4" /> 已收進「{PHOTO_DECK.name}」卡組
                    </>
                  ) : (
                    `把 ${pending.length} 個沒學過的字收進「${PHOTO_DECK.name}」`
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
