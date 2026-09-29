import { ExternalLink, Volume2 } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useSpeechSettings } from '../hooks/useSpeechSettings'
import { cambridgeUrl, canSpeak, speak } from '../utils/speech'
import type { Accent } from '../utils/speech'

interface SpeakButtonsProps {
  text: string
  /** 顯示劍橋字典連結（只適用單字，不適用例句） */
  dictionary?: boolean
  /** 放在主色漸層背景上使用 */
  onPrimary?: boolean
}

const ACCENTS: { accent: Accent; label: string }[] = [
  { accent: 'en-US', label: 'US' },
  { accent: 'en-GB', label: 'UK' },
]

// 卡片本身點了會翻面，所以按鈕要阻止事件往上傳
const stop = (e: MouseEvent) => e.stopPropagation()

export default function SpeakButtons({ text, dictionary, onPrimary }: SpeakButtonsProps) {
  const [{ accent: preferred }] = useSpeechSettings()
  const base = onPrimary ? 'bg-black/15 text-on-primary hover:bg-black/25' : 'bg-surface-2 text-muted hover:text-fg'
  // 預設口音排在前面
  const accents = [...ACCENTS].sort((a, b) => Number(b.accent === preferred) - Number(a.accent === preferred))

  return (
    <div className="flex flex-wrap items-center justify-center gap-2" onClick={stop}>
      {canSpeak &&
        accents.map(({ accent, label }) => (
          <button
            key={accent}
            type="button"
            onClick={() => speak(text, accent)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${base}`}
            aria-label={`${label} 發音`}
          >
            <Volume2 className="h-4 w-4" /> {label}
          </button>
        ))}
      {dictionary && (
        <a
          href={cambridgeUrl(text)}
          target="_blank"
          rel="noreferrer"
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${base}`}
        >
          Cambridge <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}
