import { describe, expect, it } from 'vitest'
import { initState, intervalFor, nextState, retrievability } from './fsrs'

describe('fsrs', () => {
  it('間隔天數 = 穩定度（90% 記得率）', () => {
    expect(intervalFor(10)).toBe(10)
    expect(intervalFor(0.2)).toBe(1)
    expect(intervalFor(9999)).toBe(365)
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 5)
  })

  it('第一次評分：記得 > 有印象 > 忘了', () => {
    const [again, hard, good] = [initState(1), initState(2), initState(3)]
    expect(good.stability).toBeGreaterThan(hard.stability)
    expect(hard.stability).toBeGreaterThan(again.stability)
    expect(again.difficulty).toBeGreaterThan(good.difficulty)
  })

  it('記得時穩定度上升，忘了時下降', () => {
    const s = { stability: 10, difficulty: 5 }
    expect(nextState(s, 10, 3).stability).toBeGreaterThan(10)
    expect(nextState(s, 10, 2).stability).toBeGreaterThan(10)
    expect(nextState(s, 10, 2).stability).toBeLessThan(nextState(s, 10, 3).stability)
    expect(nextState(s, 10, 1).stability).toBeLessThan(10)
  })

  it('越久沒看還記得，穩定度加得越多', () => {
    const s = { stability: 10, difficulty: 5 }
    expect(nextState(s, 20, 3).stability).toBeGreaterThan(nextState(s, 5, 3).stability)
  })
})
