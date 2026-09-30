import { useEffect } from 'react'
import { SYNC_EVENT } from './useLocalStorage'
import { backupNow, isCloudBackupEnabled } from '../utils/cloudBackup'

/** 資料變動後最多等這麼久就上傳一次 */
const DELAY_MS = 20000

/** 開啟雲端備份時，資料有變動就自動上傳；App 切到背景時也會立刻補傳 */
export function useCloudBackup() {
  useEffect(() => {
    let timer: number | undefined

    const flush = () => {
      window.clearTimeout(timer)
      timer = undefined
      if (isCloudBackupEnabled()) void backupNow()
    }
    const onChange = () => {
      // 已經排程就不重設，連續變動（例如測驗計時）也不會一直往後延
      if (timer === undefined && isCloudBackupEnabled()) timer = window.setTimeout(flush, DELAY_MS)
    }
    const onHidden = () => {
      if (document.visibilityState === 'hidden' && timer !== undefined) flush()
    }

    window.addEventListener(SYNC_EVENT, onChange)
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(SYNC_EVENT, onChange)
      document.removeEventListener('visibilitychange', onHidden)
    }
  }, [])
}
