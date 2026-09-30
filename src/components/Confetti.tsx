import { useEffect, useState } from 'react'

const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', '#facc15']
const COUNT = 90
const DURATION_MS = 3200

interface Piece {
  left: number
  delay: number
  duration: number
  drift: number
  size: number
  color: string
  round: boolean
}

function makePieces(): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.8 + Math.random() * 1.4,
    drift: (Math.random() - 0.5) * 160,
    size: 6 + Math.random() * 7,
    color: COLORS[i % COLORS.length],
    round: i % 3 === 0,
  }))
}

/** 全螢幕撒花，播完自動消失；不會擋住點擊 */
export default function Confetti({ onDone }: { onDone: () => void }) {
  const [pieces] = useState(makePieces)

  useEffect(() => {
    const timer = window.setTimeout(onDone, DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            borderRadius: p.round ? '50%' : 2,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
