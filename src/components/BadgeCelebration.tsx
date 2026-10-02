import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import Confetti from './Confetti'
import ShareSheet from './ShareSheet'
import { useBadges } from '../hooks/useBadges'
import type { Badge } from '../hooks/useBadges'
import { drawBadge } from '../utils/shareImage'
import { touch } from '../utils/sync'

const SEEN_KEY = 'lifemaster.seenBadges'

function readSeen(): string[] | null {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? (JSON.parse(raw) as string[]) : null
  } catch {
    return null
  }
}
function writeSeen(names: string[]) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(names))
    touch(SEEN_KEY)
  } catch {
    // 存不了頂多再慶祝一次
  }
}

const today = () => {
  const d = new Date()
  return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()} 達成`
}

/** 分享某個成就（統計頁的徽章也用這個） */
export async function badgeImage(b: Badge) {
  return drawBadge({ emoji: b.emoji, name: b.name, desc: b.desc, date: today() })
}

/** 剛解鎖成就時跳出慶祝畫面，可以直接分享 */
export default function BadgeCelebration() {
  const badges = useBadges()
  const earned = badges.filter(b => b.value >= b.goal)
  const [queue, setQueue] = useState<Badge[]>([])
  const [image, setImage] = useState<Blob | null>(null)
  const key = earned.map(b => b.name).join('|')

  useEffect(() => {
    const seen = readSeen()
    // 第一次使用這個功能：已經有的成就不補慶祝
    if (seen === null) return writeSeen(earned.map(b => b.name))
    const fresh = earned.filter(b => !seen.includes(b.name))
    if (fresh.length === 0) return
    writeSeen([...seen, ...fresh.map(b => b.name)])
    setQueue(q => [...q, ...fresh])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const current = queue[0]
  if (!current) return null
  const next = () => setQueue(q => q.slice(1))

  return (
    <>
      <Confetti onDone={() => {}} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={next}>
        <div className="w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
          <p className="text-xs font-bold tracking-widest text-primary-ink">ACHIEVEMENT UNLOCKED</p>
          <div className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-orange-600 shadow-lg">
            <span className="flex h-26 w-26 items-center justify-center rounded-full bg-amber-50 text-6xl">{current.emoji}</span>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-fg">{current.name}</p>
          <p className="mt-1 text-sm text-muted">{current.desc}</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button onClick={next} className="rounded-2xl bg-surface-2 py-3 text-sm font-medium text-fg">
              {queue.length > 1 ? `下一個（${queue.length - 1}）` : '太棒了'}
            </button>
            <button
              onClick={async () => setImage(await badgeImage(current))}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-sm font-semibold text-on-primary"
            >
              <Share2 className="h-4 w-4" /> 分享成就
            </button>
          </div>
        </div>
      </div>
      {image && (
        <ShareSheet
          blob={image}
          filename={`lifemaster-${current.name}.png`}
          message={`我在 LifeMaster 達成了「${current.name}」！`}
          onClose={() => setImage(null)}
        />
      )}
    </>
  )
}
