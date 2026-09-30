import { applyBackup, createBackup } from './backup'
import type { BackupFile } from './backup'
import { ensureUser, supabase } from './cloud'

const ENABLED_KEY = 'lm-cloud-backup'
const CODE_KEY = 'lm-recovery-code'
const LAST_KEY = 'lm-cloud-backup-at'
/** 備份狀態改變時發出，讓設定頁更新顯示 */
export const CLOUD_BACKUP_EVENT = 'lifemaster:cloud-backup'

// 去掉容易看錯的 0/O、1/I
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function get(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function set(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // 忽略
  }
  window.dispatchEvent(new Event(CLOUD_BACKUP_EVENT))
}

export const isCloudBackupEnabled = () => get(ENABLED_KEY) === '1'
export const lastCloudBackup = () => get(LAST_KEY)
export const recoveryCode = () => get(CODE_KEY)

/** 顯示用：ABCD-EFGH-JKLM-NPQR */
export const formatCode = (code: string) => code.match(/.{1,4}/g)?.join('-') ?? code
/** 使用者輸入的還原碼：去掉分隔符號、轉大寫 */
export const normalizeCode = (input: string) => input.toUpperCase().replace(/[^A-Z0-9]/g, '')

function generateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')
}

/** 把目前裝置上的資料上傳到雲端，覆蓋上一份備份 */
export async function backupNow(): Promise<boolean> {
  const userId = await ensureUser()
  if (!supabase || !userId) return false
  const now = new Date().toISOString()
  const { error } = await supabase.from('backups').upsert({ user_id: userId, data: createBackup(), updated_at: now })
  if (error) return false
  set(LAST_KEY, now)
  return true
}

/** 開啟自動備份：先上傳一份，並產生還原碼（已經有的話沿用）。失敗回傳 false。 */
export async function enableCloudBackup(): Promise<boolean> {
  if (!supabase || !(await ensureUser())) return false
  if (!recoveryCode()) {
    const code = generateCode()
    const { error } = await supabase.rpc('set_recovery_code', { p_code: code })
    if (error) return false
    set(CODE_KEY, code)
  }
  if (!(await backupNow())) return false
  set(ENABLED_KEY, '1')
  return true
}

export function disableCloudBackup() {
  set(ENABLED_KEY, null)
}

/** 換一組新的還原碼，舊的立刻失效 */
export async function resetRecoveryCode(): Promise<boolean> {
  if (!supabase || !(await ensureUser())) return false
  const code = generateCode()
  const { error } = await supabase.rpc('set_recovery_code', { p_code: code })
  if (error) return false
  set(CODE_KEY, code)
  return true
}

/**
 * 用還原碼把雲端備份、房間與提醒搬到這台裝置，回傳還原了幾個項目。
 * 還原碼錯誤回傳 'invalid'，連線失敗回傳 'offline'。
 */
export async function restoreFromCode(input: string): Promise<number | 'invalid' | 'offline'> {
  const code = normalizeCode(input)
  if (code.length < 16) return 'invalid'
  if (!supabase || !(await ensureUser())) return 'offline'
  const { data, error } = await supabase.rpc('redeem_recovery_code', { p_code: code })
  if (error) return error.message.includes('invalid code') ? 'invalid' : 'offline'
  const count = data ? applyBackup(data as Partial<BackupFile>) : 0
  set(CODE_KEY, code)
  set(ENABLED_KEY, '1')
  // 房間也一起搬過來了，讓進度同步馬上恢復
  set('lm-in-room', '1')
  return count
}
