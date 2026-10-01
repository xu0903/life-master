import { useLocalStorage } from './useLocalStorage'

/** 刷題：答對後自動跳下一題（預設開啟）；刷題頁和設定頁共用同一個值 */
export function useAutoNext() {
  return useLocalStorage('lifemaster.practiceAutoNext', true)
}

/** 刷題難度：困難 = 干擾選項挑長得像的字；地獄 = 困難 + 每題限時 */
export type Difficulty = 'normal' | 'hard' | 'hell'

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'normal', label: '一般' },
  { value: 'hard', label: '困難' },
  { value: 'hell', label: '地獄' },
]

/** 地獄模式每題秒數 */
export const HELL_SECONDS = 3

export function useDifficulty() {
  return useLocalStorage<Difficulty>('lifemaster.practiceDifficulty', 'normal')
}

export const DIFFICULTY_HELP =
  '一般：干擾選項從同詞性的單字隨機挑。\n' +
  '困難：專挑長得像、容易混淆的字，例如同字首（re-、pre-）、同字尾（-er 都是職業、-tion、-ment）、拼字只差一兩個字母（adapt / adopt），或同一個主題的字，要真的認得才選得對。\n' +
  `地獄：困難模式的選項，再加上每題只有 ${HELL_SECONDS} 秒，時間到沒選就算錯（例句填空要打字，不限時）。`
