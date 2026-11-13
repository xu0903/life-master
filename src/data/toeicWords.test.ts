import { describe, expect, it } from 'vitest'
import { MAX_BOX, masteryOf, migrateStat, nextStat } from './toeicWords'
import type { WordStat } from './toeicWords'

describe('nextStat (FSRS)', () => {
  it('新字答記得：幾天後複習、熟練度 1', () => {
    const s = nextStat(undefined, 'good', '2026-11-06')
    expect(s.box).toBe(1)
    expect(s.due).toBe('2026-11-09')
    expect(s.right).toBe(1)
    expect(s.last).toBe('2026-11-06')
  })

  it('答不記得：回到 0、明天複習、記錄 lastWrong', () => {
    const s = nextStat(nextStat(undefined, 'good', '2026-11-01'), 'forgot', '2026-11-06')
    expect(s.box).toBe(0)
    expect(s.due).toBe('2026-11-07')
    expect(s.lastWrong).toBe('2026-11-06')
    expect(masteryOf(s).tone).toBe('red')
  })

  it('一直按時答記得，間隔越拉越長，最後精通', () => {
    let s: WordStat | undefined
    let today = '2026-01-01'
    const gaps: number[] = []
    for (let i = 0; i < 8; i++) {
      s = nextStat(s, 'good', today)
      gaps.push((new Date(s.due).getTime() - new Date(today).getTime()) / 86400000)
      today = s.due
    }
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i - 1])
    expect(s!.box).toBe(MAX_BOX)
  })

  it('舊 Leitner 資料：由盒子推估穩定度，熟練度大致不變', () => {
    const old: WordStat = { box: 3, due: '2026-11-06', right: 4, wrong: 0 }
    const m = migrateStat(old)
    expect(m.stability).toBe(7)
    expect(m.last).toBe('2026-10-30')
    const s = nextStat(old, 'good', '2026-11-06')
    expect(s.box).toBeGreaterThanOrEqual(3)
    expect(s.s).toBeGreaterThan(7)
  })
})
