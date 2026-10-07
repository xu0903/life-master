import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './cloud'
import { buildQuestion, meaningOf } from '../data/practice'
import { TOEIC_WORDS, WORD_INFO } from '../data/toeicWords'
import type { Level } from '../data/toeicWords'

/** 一局幾題、每題幾秒 */
export const DUEL_QUESTIONS = 10
export const QUESTION_MS = 10000
/** 收到開始訊號後倒數幾毫秒 */
export const COUNTDOWN_MS = 3000

export interface DuelQuestion {
  word: string
  /** 題目文字：看英選中是單字，看中選英是中文意思 */
  prompt: string
  type: 'zh2en' | 'en2zh'
  options: string[]
  answer: string
}

/** 每個人在房間頻道裡公開的狀態（Supabase Presence） */
export interface DuelPresence {
  name: string
  /** 開了或加入的那局 id；沒有 = 只是在看房間 */
  game: string | null
  host: boolean
  phase: 'lobby' | 'playing'
}

export interface DuelScore {
  /** 已作答題數 */
  q: number
  score: number
  correct: number
  done: boolean
}

export interface DuelStart {
  game: string
  questions: DuelQuestion[]
  players: { id: string; name: string }[]
}

/** 房主出題：從內建多益題庫（依程度）隨機抽字，題目整包傳給大家，所以每個人版本不同也拿到同一份 */
export function buildDuelQuestions(level: Level): DuelQuestion[] {
  const pool = TOEIC_WORDS.filter((_, i) => WORD_INFO[i].level <= level)
  const picked = new Set<number>()
  while (picked.size < Math.min(DUEL_QUESTIONS, pool.length)) picked.add(Math.floor(Math.random() * pool.length))
  return [...picked].map(i => {
    const card = pool[i]
    const type = Math.random() < 0.5 ? 'zh2en' : 'en2zh'
    const q = buildQuestion(card, type, pool)
    return { word: card.question, prompt: type === 'zh2en' ? meaningOf(card) : card.question, type, options: q.options ?? [], answer: q.answer }
  })
}

/** 答對 100 分，越快答再加最多 50 分 */
export function pointsFor(correct: boolean, elapsedMs: number) {
  if (!correct) return 0
  return 100 + Math.round(50 * Math.max(0, 1 - elapsedMs / QUESTION_MS))
}

export interface DuelHandlers {
  onPresence: (state: Record<string, DuelPresence>) => void
  onStart: (start: DuelStart) => void
  onScore: (game: string, userId: string, score: DuelScore) => void
  onCancel: (game: string) => void
}

/** 加入房間的對戰頻道；回傳頻道（用來 track / send）與離開函式 */
export function joinDuelChannel(roomId: string, userId: string, handlers: DuelHandlers): { channel: RealtimeChannel; leave: () => void } | null {
  if (!supabase) return null
  const client = supabase
  const channel = client.channel(`duel:${roomId}`, { config: { broadcast: { self: false }, presence: { key: userId } } })
  channel
    .on('presence', { event: 'sync' }, () => {
      const raw = channel.presenceState<DuelPresence>()
      const state: Record<string, DuelPresence> = {}
      // 同一個人開兩台裝置時取最後一筆
      for (const [id, metas] of Object.entries(raw)) if (metas.length) state[id] = metas[metas.length - 1]
      handlers.onPresence(state)
    })
    .on('broadcast', { event: 'start' }, ({ payload }) => handlers.onStart(payload as DuelStart))
    .on('broadcast', { event: 'score' }, ({ payload }) => {
      const p = payload as { game: string; userId: string; score: DuelScore }
      handlers.onScore(p.game, p.userId, p.score)
    })
    .on('broadcast', { event: 'cancel' }, ({ payload }) => handlers.onCancel((payload as { game: string }).game))
  return { channel, leave: () => void client.removeChannel(channel) }
}
