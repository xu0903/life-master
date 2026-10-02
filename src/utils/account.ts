import { supabase } from './cloud'
import { recoveryCode, resetRecoveryCode } from './cloudBackup'
import { SYNC_STATUS_EVENT, syncNow } from './sync'

/** 註冊後要把匿名帳號的資料（備份、房間、提醒）搬進新帳號，登入成功時才執行 */
const MIGRATE_KEY = 'lm-account-migrate'
const appUrl = () => `${location.origin}${import.meta.env.BASE_URL}`

export interface AccountInfo {
  email: string | null
}

export async function currentAccount(): Promise<AccountInfo> {
  if (!supabase) return { email: null }
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  return { email: user && !user.is_anonymous ? (user.email ?? null) : null }
}

const message = (err: { message?: string } | null | undefined): string => {
  const m = err?.message ?? ''
  if (/already registered|already been registered/i.test(m)) return '這個 Email 已經註冊過了，請直接登入'
  if (/invalid login credentials/i.test(m)) return 'Email 或密碼錯誤'
  if (/email not confirmed/i.test(m)) return '還沒點驗證信裡的連結，點完再登入'
  if (/password should be at least/i.test(m)) return '密碼至少要 6 個字元'
  if (/rate limit|too many/i.test(m)) return '寄信太頻繁了，請過幾分鐘再試'
  if (/valid email|invalid format/i.test(m)) return 'Email 格式不正確'
  return m || '連線失敗，請確認網路'
}

/** 登入成功後：第一次登入（剛註冊）把這台裝置原本的匿名資料搬進帳號，然後同步 */
async function afterSignIn(): Promise<void> {
  const code = localStorage.getItem(MIGRATE_KEY)
  if (code && supabase) {
    // 雲端原本的匿名備份、房間、提醒搬到新帳號
    await supabase.rpc('redeem_recovery_code', { p_code: code })
    localStorage.removeItem(MIGRATE_KEY)
  }
  await syncNow()
  window.dispatchEvent(new Event(SYNC_STATUS_EVENT))
}

/** 註冊：回傳 'ok'（已登入）、'verify'（要去收驗證信）或錯誤訊息 */
export async function signUp(email: string, password: string): Promise<'ok' | 'verify' | string> {
  if (!supabase) return '這個版本沒有連上雲端'
  // 先幫目前的匿名帳號準備好還原碼，等一下才能把資料搬進新帳號
  const { data: before } = await supabase.auth.getSession()
  if (before.session?.user.is_anonymous) {
    if (!recoveryCode() && !(await resetRecoveryCode())) return '連線失敗，請確認網路'
    localStorage.setItem(MIGRATE_KEY, recoveryCode()!)
  }
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: appUrl() } })
  if (error) return message(error)
  if (!data.session) return 'verify'
  await afterSignIn()
  return 'ok'
}

export async function signIn(email: string, password: string): Promise<'ok' | string> {
  if (!supabase) return '這個版本沒有連上雲端'
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) return message(error)
  await afterSignIn()
  return 'ok'
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
  try {
    localStorage.removeItem('lm-in-room')
  } catch {
    // 忽略
  }
  window.dispatchEvent(new Event(SYNC_STATUS_EVENT))
}

/** 忘記密碼：寄出重設連結（點開後在 App 裡設定新密碼） */
export async function sendPasswordReset(email: string): Promise<'ok' | string> {
  if (!supabase) return '這個版本沒有連上雲端'
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: appUrl() })
  return error ? message(error) : 'ok'
}

export async function setNewPassword(password: string): Promise<'ok' | string> {
  if (!supabase) return '這個版本沒有連上雲端'
  const { error } = await supabase.auth.updateUser({ password })
  return error ? message(error) : 'ok'
}
