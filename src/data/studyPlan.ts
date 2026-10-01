import type { StudyKind } from './studyLog'

/** 多益菜單：依目標分數與練習強度排一週（週一到週日）的練習 */
export type PlanTarget = 600 | 730 | 860 | 900
export type Intensity = 'light' | 'standard' | 'intense'

export const PLAN_TARGETS: { value: PlanTarget; label: string; desc: string }[] = [
  { value: 600, label: '600', desc: '打好單字與文法基礎' },
  { value: 730, label: '730', desc: '閱讀、聽力平均加強' },
  { value: 860, label: '860', desc: '長篇閱讀與對話為主' },
  { value: 900, label: '900+', desc: '高難度、限時訓練' },
]

export const INTENSITIES: { value: Intensity; label: string; scale: number }[] = [
  { value: 'light', label: '輕鬆', scale: 0.5 },
  { value: 'standard', label: '標準', scale: 1 },
  { value: 'intense', label: '衝刺', scale: 1.6 },
]

export type TaskKind = 'words' | 'grammar' | StudyKind

/** 每種練習：名稱、單位、每單位大約幾分鐘、要打開哪個練習、怎麼開始 */
export const TASKS: Record<TaskKind, { label: string; unit: string; step: number; minutes: number; mode: string; how: string }> = {
  words: { label: '每日單字', unit: '字', step: 10, minutes: 0.5, mode: 'flip', how: '首頁的每日單字測驗' },
  practice: { label: '刷單字題', unit: '題', step: 15, minutes: 0.3, mode: 'practice', how: '學習 → 刷題' },
  grammar: { label: '文法單元', unit: '單元', step: 1, minutes: 15, mode: 'grammar', how: '學習 → 文法' },
  p5: { label: '閱讀 Part 5 句子填空', unit: '題', step: 10, minutes: 0.6, mode: 'reading', how: '閱讀 →「刷 10 題」或 Part 5' },
  p6: { label: '閱讀 Part 6 段落填空', unit: '篇', step: 1, minutes: 4, mode: 'reading', how: '閱讀 → Part 6' },
  p7: { label: '閱讀 Part 7 長篇閱讀', unit: '篇', step: 2, minutes: 7, mode: 'reading', how: '閱讀 →「閱讀 2 篇」或 Part 7' },
  l2: { label: '聽力 Part 2 應答', unit: '題', step: 5, minutes: 0.6, mode: 'listening', how: '聽力 → Part 2' },
  l34: { label: '聽力 Part 3、4 對話與獨白', unit: '段', step: 1, minutes: 3, mode: 'listening', how: '聽力 → Part 3 或 Part 4' },
  wrong: { label: '錯題本複習', unit: '回', step: 1, minutes: 15, mode: 'reading', how: '閱讀 → 錯題本' },
  mock: { label: '完整閱讀模擬考', unit: '回', step: 1, minutes: 75, mode: 'reading', how: '閱讀 → 完整模擬考' },
}

export interface PlanTask {
  kind: TaskKind
  amount: number
}

type Day = [TaskKind, number][]

// 標準強度的一週；週一到週日。單字每天固定 10 個，不隨強度變化
const BASIC: Day[] = [
  [
    ['p5', 10],
    ['l2', 10],
  ],
  [
    ['grammar', 1],
    ['p5', 10],
  ],
  [
    ['p7', 2],
    ['l34', 2],
  ],
  [
    ['practice', 15],
    ['l2', 10],
  ],
  [
    ['grammar', 1],
    ['p6', 2],
  ],
  [
    ['p7', 2],
    ['l34', 2],
  ],
  [
    ['wrong', 1],
    ['practice', 15],
  ],
]
const MID: Day[] = [
  [
    ['p5', 20],
    ['l2', 10],
  ],
  [
    ['p7', 2],
    ['l34', 3],
  ],
  [
    ['grammar', 1],
    ['p6', 2],
    ['l2', 10],
  ],
  [
    ['p5', 10],
    ['p7', 2],
  ],
  [
    ['practice', 30],
    ['l34', 3],
  ],
  [
    ['p7', 4],
    ['l34', 3],
  ],
  [
    ['wrong', 1],
    ['practice', 15],
  ],
]
const ADV: Day[] = [
  [
    ['p5', 20],
    ['l34', 4],
  ],
  [
    ['p7', 4],
    ['l2', 15],
  ],
  [
    ['p6', 4],
    ['l34', 4],
  ],
  [
    ['p7', 4],
    ['practice', 30],
  ],
  [
    ['p5', 20],
    ['l34', 4],
  ],
  [
    ['p7', 6],
    ['l34', 4],
  ],
  [
    ['wrong', 1],
    ['practice', 30],
  ],
]

/** 依目標與強度排出一週的菜單（index 0 = 週一） */
export function weekPlan(target: PlanTarget, intensity: Intensity, examSoon: boolean): PlanTask[][] {
  const base = target <= 600 ? BASIC : target <= 730 ? MID : ADV
  // 900+ 跟 860 用同一份菜單，份量再多兩成半
  const scale = (INTENSITIES.find(i => i.value === intensity)?.scale ?? 1) * (target >= 900 ? 1.25 : 1)
  return base.map((day, i) => {
    const tasks: PlanTask[] = [{ kind: 'words', amount: 10 }]
    for (const [kind, amount] of day) {
      const step = TASKS[kind].step
      // 依強度放大縮小，對齊練習的單位（Part 5 一次 10 題、長篇一次 2 篇…），至少做一單位
      const scaled = Math.max(step, Math.round((amount * scale) / step) * step)
      tasks.push({ kind, amount: kind === 'wrong' || kind === 'grammar' ? Math.max(1, Math.round(amount * Math.min(scale, 1.5))) : scaled })
    }
    // 衝刺或快考試時，週六改成完整模擬考
    if (i === 5 && (intensity === 'intense' || examSoon) && target > 600)
      return [
        { kind: 'words', amount: 10 },
        { kind: 'mock', amount: 1 },
      ]
    return tasks
  })
}

// 每單位分鐘數含對答案、看解析的時間
export const taskMinutes = (t: PlanTask) => Math.round(TASKS[t.kind].minutes * t.amount)

/** 這個目標與強度下，平均每天大約幾分鐘 */
export function averageMinutes(target: PlanTarget, intensity: Intensity): number {
  const week = weekPlan(target, intensity, false)
  return Math.round(week.flat().reduce((n, t) => n + taskMinutes(t), 0) / 7 / 5) * 5
}

/** 「閱讀 2 篇」這類文字 */
export const taskText = (t: PlanTask) => `${TASKS[t.kind].label} ${t.amount} ${TASKS[t.kind].unit}`

export const PLAN_KEY = 'lifemaster.studyPlan'
export interface PlanSettings {
  target: PlanTarget
  intensity: Intensity
}
