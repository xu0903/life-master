/**
 * FSRS-5（Free Spaced Repetition Scheduler）的精簡版，以「天」為單位排程。
 * 每張卡記兩個數字：
 * - stability（S）：記憶穩定度，約等於「過幾天後還有 90% 機率記得」
 * - difficulty（D）：1–10，越大越難記
 * 參數用 FSRS-5 官方預設值；三段評分對應 Again / Hard / Good。
 * 參考：https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 */

/** FSRS-5 預設參數 w0–w18 */
const W = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698,
  0.2315, 2.9898, 0.51655, 0.6621,
]
const DECAY = -0.5
const FACTOR = 19 / 81
/** 希望複習時還有 90% 機率記得；在這個值下，間隔天數 = 穩定度 */
export const DESIRED_RETENTION = 0.9
export const MAX_INTERVAL = 365

/** 1 = 忘了（Again）、2 = 有印象（Hard）、3 = 記得（Good） */
export type Rating = 1 | 2 | 3

export interface MemoryState {
  stability: number
  difficulty: number
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** 過了 elapsed 天後還記得的機率 */
export function retrievability(elapsed: number, stability: number): number {
  return Math.pow(1 + (FACTOR * Math.max(0, elapsed)) / stability, DECAY)
}

/** 依穩定度算下次間隔（天），至少 1 天 */
export function intervalFor(stability: number, retention = DESIRED_RETENTION): number {
  const days = (stability / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1)
  return clamp(Math.round(days), 1, MAX_INTERVAL)
}

const initDifficulty = (g: number) => clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10)

/** 第一次作答 */
export function initState(rating: Rating): MemoryState {
  return { stability: W[rating - 1], difficulty: initDifficulty(rating) }
}

function nextDifficulty(d: number, rating: Rating): number {
  const delta = -W[6] * (rating - 3)
  const damped = d + (delta * (10 - d)) / 9
  // 往「Easy 的初始難度」慢慢拉回，避免難度一路飆高
  return clamp(W[7] * initDifficulty(4) + (1 - W[7]) * damped, 1, 10)
}

/** 依上一次的狀態、隔了幾天、這次評分，算出新的記憶狀態 */
export function nextState(prev: MemoryState, elapsed: number, rating: Rating): MemoryState {
  const { stability: s, difficulty: d } = prev
  const difficulty = nextDifficulty(d, rating)
  let stability: number
  if (elapsed <= 0) {
    // 同一天又複習一次：只小幅調整
    stability = s * Math.exp(W[17] * (rating - 3 + W[18]))
  } else {
    const r = retrievability(elapsed, s)
    if (rating === 1) {
      const forget = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r))
      stability = Math.min(forget, s)
    } else {
      const hardPenalty = rating === 2 ? W[15] : 1
      stability = s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hardPenalty + 1)
    }
  }
  return { stability: clamp(stability, 0.1, 36500), difficulty }
}
