import { createContext, useContext } from 'react'

export interface WordPopupApi {
  /** 開啟單字小視窗；已開啟時會疊加一層，可按返回回到上一個字 */
  open: (word: string) => void
}

export const WordPopupContext = createContext<WordPopupApi>({ open: () => {} })

export function useWordPopup() {
  return useContext(WordPopupContext)
}
