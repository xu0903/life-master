import { useState } from 'react'
import { Lock, Share2 } from 'lucide-react'
import { badgeImage } from './BadgeCelebration'
import ShareSheet from './ShareSheet'
import { useBadges } from '../hooks/useBadges'

export default function Achievements() {
  const badges = useBadges()
  const earned = badges.filter(b => b.value >= b.goal).length
  const [image, setImage] = useState<{ blob: Blob; name: string } | null>(null)

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-semibold text-fg">成就徽章</p>
        <p className="text-xs text-muted">
          點已獲得的徽章可以分享・ 已獲得 <span className="font-bold text-fg">{earned}</span> / {badges.length}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {badges.map(b => {
          const got = b.value >= b.goal
          return (
            <button
              key={b.name}
              disabled={!got}
              onClick={async () => {
                const blob = await badgeImage(b)
                if (blob) setImage({ blob, name: b.name })
              }}
              className={`relative flex flex-col items-center rounded-xl p-2.5 text-center ${got ? 'bg-primary-soft active:scale-95' : 'bg-surface-2'}`}
            >
              {got && <Share2 className="absolute top-1.5 right-1.5 h-3 w-3 text-primary-ink/60" />}
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  got ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md' : 'bg-surface text-faint'
                }`}
              >
                {got ? <span className="text-lg">{b.emoji}</span> : <Lock className="h-4 w-4" />}
              </span>
              <p className={`mt-1.5 text-xs font-semibold ${got ? 'text-primary-ink' : 'text-muted'}`}>{b.name}</p>
              <p className="text-[10px] leading-tight text-faint">{b.desc}</p>
              {!got && (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-primary/60" style={{ width: `${Math.min(100, (b.value / b.goal) * 100)}%` }} />
                </div>
              )}
            </button>
          )
        })}
      </div>
      {image && (
        <ShareSheet
          blob={image.blob}
          filename={`lifemaster-${image.name}.png`}
          message={`我在 LifeMaster 達成了「${image.name}」！`}
          onClose={() => setImage(null)}
        />
      )}
    </div>
  )
}
