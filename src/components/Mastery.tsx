import { GRADES } from '../data/grades'
import { MAX_BOX, masteryOf } from '../data/toeicWords'
import type { Grade, WordStat } from '../data/toeicWords'

const TONE_BG = { none: 'bg-surface-2', red: 'bg-rose-500', yellow: 'bg-amber-400', green: 'bg-emerald-500' }
const TONE_TEXT = {
  none: 'text-faint',
  red: 'text-rose-600 dark:text-rose-400',
  yellow: 'text-amber-600 dark:text-amber-300',
  green: 'text-emerald-600 dark:text-emerald-400',
}

/** 熟練度格子：5 格，顏色代表目前程度 */
export function MasteryBar({ stat, showLabel = true }: { stat?: WordStat; showLabel?: boolean }) {
  const m = masteryOf(stat)
  const filled = stat?.box ?? 0
  return (
    <span className="inline-flex items-center gap-1.5" title={`熟練度 ${m.percent}%`}>
      <span className="flex gap-0.5">
        {Array.from({ length: MAX_BOX }, (_, i) => (
          <span key={i} className={`h-1.5 w-3 rounded-full ${i < filled ? TONE_BG[m.tone] : 'bg-line'}`} />
        ))}
      </span>
      {showLabel && <span className={`text-xs font-medium ${TONE_TEXT[m.tone]}`}>{m.label}</span>}
    </span>
  )
}

/** 紅黃綠三段評分按鈕 */
export function GradeButtons({ onGrade }: { onGrade: (grade: Grade) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {GRADES.map(g => (
        <button
          key={g.grade}
          onClick={() => onGrade(g.grade)}
          className={`flex flex-col items-center gap-0.5 rounded-2xl py-3 font-semibold shadow-md transition active:scale-95 ${g.button}`}
        >
          <span className="text-xl leading-none">{g.emoji}</span>
          <span className="text-sm">{g.label}</span>
        </button>
      ))}
    </div>
  )
}
