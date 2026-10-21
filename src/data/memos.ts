/** 備忘錄：沒有期限、純粹記事情；置頂的會排在最前面，也優先顯示在小工具上 */
export interface Memo {
  id: string
  text: string
  pinned: boolean
  /** 建立、最後修改時間（毫秒） */
  createdAt: number
  updatedAt: number
}

export const MEMOS_KEY = 'lifemaster.memos'

/** 置頂的在前，其餘依最後修改時間由新到舊 */
export function sortMemos(memos: Memo[]): Memo[] {
  return [...memos].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
}
