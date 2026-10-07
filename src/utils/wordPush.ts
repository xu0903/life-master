import type { Card } from '../data/flashcards'
import { MAX_BOX } from '../data/toeicWords'
import type { WordStat } from '../data/toeicWords'
import { addDays, toDateKey } from './date'

/** 推播單字卡的時段 HH:mm；空陣列 = 關閉（預設） */
export const WORD_PUSH_KEY = 'lifemaster.wordPush'
export const WORD_PUSH_TIMES = ['08:00', '12:30', '18:00', '21:30']
/** 先排好幾天份，App 久沒開也會照常推播 */
const DAYS_AHEAD = 3
/** 推播的 ref / tag 開頭；service worker 靠它認出單字推播（sw-notify.js） */
export const WORD_PUSH_PREFIX = 'word:'

/**
 * 依熟練度排出未來幾天每個時段要推播的單字：到期越久、越不熟的先推，同一輪不重複。
 * 回傳的格式和待辦提醒相同，一起交給 syncReminders。
 */
export function wordPushItems(times: string[], cards: Card[], stats: Record<string, WordStat>, now = Date.now()) {
  if (times.length === 0 || cards.length === 0) return []
  const learning = cards
    .filter(c => (stats[c.id]?.box ?? 0) < MAX_BOX)
    .sort((a, b) => {
      const sa = stats[a.id]
      const sb = stats[b.id]
      // 學過的字先推（照到期日、熟練度），還沒學過的排後面
      if (!sa || !sb) return Number(!sa) - Number(!sb)
      return sa.due.localeCompare(sb.due) || sa.box - sb.box
    })
  const pool = learning.length > 0 ? learning : cards
  const items = []
  let i = 0
  for (let d = 0; d < DAYS_AHEAD; d++) {
    const day = addDays(new Date(now), d)
    for (const time of [...times].sort()) {
      const [hh, mm] = time.split(':').map(Number)
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hh, mm)
      if (at.getTime() <= now) continue
      const card = pool[i++ % pool.length]
      items.push({
        ref: `${WORD_PUSH_PREFIX}${toDateKey(day)}-${time.replace(':', '')}:${card.id}`,
        title: card.question,
        body: '還記得意思嗎？點開看答案',
        fire_at: at.toISOString(),
      })
    }
  }
  return items
}
