import { useEffect } from 'react'
import { SYNC_EVENT } from './useLocalStorage'
import { backupNow, isCloudBackupEnabled } from '../utils/cloudBackup'
import { syncNow } from '../utils/sync'
import { supabase } from '../utils/cloud'

/** 登入帳號時用帳號同步（會合併兩台裝置的資料）；沒登入但開了雲端備份時照舊整份上傳 */
async function upload() {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
  const user = data.session?.user
  if (user && !user.is_anonymous) return void syncNow()
  if (isCloudBackupEnabled()) void backupNow()
}

/** 資料變動後最多等這麼久就上傳一次 */
const DELAY_MS = 20000

/** 資料有變動就自動上傳；App 切到背景時立刻補傳，切回 App 時從雲端拉其他裝置的變更 */
export function useCloudBackup() {
  useEffect(() => {
    let timer: number | undefined

    const flush = () => {
      window.clearTimeout(timer)
      timer = undefined
      void upload()
    }
    const onChange = () => {
      // 已經排程就不重設，連續變動（例如測驗計時）也不會一直往後延
      if (timer === undefined) timer = window.setTimeout(flush, DELAY_MS)
    }
    const onHidden = () => {
      if (document.visibilityState === 'hidden' && timer !== undefined) flush()
      if (document.visibilityState === 'visible') void syncNow()
    }
    // 打開 App 時先同步一次
    void syncNow()

    window.addEventListener(SYNC_EVENT, onChange)
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(SYNC_EVENT, onChange)
      document.removeEventListener('visibilitychange', onHidden)
    }
  }, [])
}
