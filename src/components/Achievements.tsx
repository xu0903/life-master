import { Lock } from 'lucide-react'
import { useBadges } from '../hooks/useBadges'

export default function Achievements() {
  const badges = useBadges()
  const earned = badges.filter(b => b.value >= b.goal).length

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-semibold text-fg">成就徽章</p>
        <p className="text-xs text-muted">
          已獲得 <span className="font-bold text-fg">{earned}</span> / {badges.length}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {badges.map(b => {
          const got = b.value >= b.goal
          return (
            <div key={b.name} className={`flex flex-col items-center rounded-xl p-2.5 text-center ${got ? 'bg-primary-soft' : 'bg-surface-2'}`}>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  got ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md' : 'bg-surface text-faint'
                }`}
              >
                {got ? <b.Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
              </span>
              <p className={`mt-1.5 text-xs font-semibold ${got ? 'text-primary-ink' : 'text-muted'}`}>{b.name}</p>
              <p className="text-[10px] leading-tight text-faint">{b.desc}</p>
              {!got && (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-primary/60" style={{ width: `${Math.min(100, (b.value / b.goal) * 100)}%` }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
