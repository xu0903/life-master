import { supabase } from './cloud'
import { recoveryCode, resetRecoveryCode } from './cloudBackup'
import { SYNC_STATUS_EVENT, clearSyncedData, markFreshDevice, syncNow } from './sync'

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

const OAUTH_KEY = 'lm-oauth-pending'

/**
 * 登入成功後：帳號還沒有任何資料（剛註冊）時，把這台裝置原本的匿名資料、房間、提醒搬進帳號；
 * 帳號已經有資料時（例如在平板登入），這台裝置改成載入帳號的資料。
 */
async function afterSignIn(): Promise<void> {
  const code = localStorage.getItem(MIGRATE_KEY)
  localStorage.removeItem(MIGRATE_KEY)
  if (!supabase) return
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user.id
  const { data: existing } = userId ? await supabase.from('backups').select('user_id').eq('user_id', userId).maybeSingle() : { data: null }
  if (existing) markFreshDevice()
  else if (code) await supabase.rpc('redeem_recovery_code', { p_code: code })
  await syncNow()
  window.dispatchEvent(new Event(SYNC_STATUS_EVENT))
}

/** 先幫目前的匿名帳號準備好還原碼，登入後才能把資料搬進帳號 */
async function prepareMigration(): Promise<boolean> {
  if (!supabase) return false
  const { data: before } = await supabase.auth.getSession()
  if (!before.session?.user.is_anonymous) return true
  if (!recoveryCode() && !(await resetRecoveryCode())) return false
  localStorage.setItem(MIGRATE_KEY, recoveryCode()!)
  return true
}

/** Google 帳號是否已在 Supabase 開啟 */
export async function googleEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY } })
    const json = (await res.json()) as { external?: { google?: boolean } }
    return !!json.external?.google
  } catch {
    return false
  }
}

/** 用 Google 登入：會跳到 Google 頁面，登入完回到 App 後由 finishOAuth 接手 */
export async function signInWithGoogle(): Promise<string | null> {
  if (!supabase) return '這個版本沒有連上雲端'
  if (!(await prepareMigration())) return '連線失敗，請確認網路'
  localStorage.setItem(OAUTH_KEY, '1')
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: appUrl() } })
  return error ? message(error) : null
}

/** 從 Google 登入頁回到 App 時呼叫（App 啟動時檢查一次） */
export async function finishOAuth(): Promise<boolean> {
  if (!supabase || localStorage.getItem(OAUTH_KEY) !== '1') return false
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user || user.is_anonymous) return false
  localStorage.removeItem(OAUTH_KEY)
  await afterSignIn()
  return true
}

/** 切換帳號：先把目前帳號同步上去，清掉這台裝置上的資料後登出，重新整理頁面讓畫面回到空白狀態 */
export async function switchAccount() {
  await syncNow()
  await supabase?.auth.signOut()
  clearSyncedData()
  try {
    localStorage.removeItem('lm-in-room')
  } catch {
    // 忽略
  }
  window.location.reload()
}

/** 用帳號裡的資料重新整理這台裝置（兩邊對不起來時用） */
export async function resyncFromAccount(): Promise<boolean> {
  markFreshDevice()
  return syncNow()
}

/** 註冊：回傳 'ok'（已登入）、'verify'（要去收驗證信）或錯誤訊息 */
export async function signUp(email: string, password: string): Promise<'ok' | 'verify' | string> {
  if (!supabase) return '這個版本沒有連上雲端'
  if (!(await prepareMigration())) return '連線失敗，請確認網路'
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: appUrl() } })
  if (error) return message(error)
  if (!data.session) return 'verify'
  await afterSignIn()
  return 'ok'
}

export async function signIn(email: string, password: string): Promise<'ok' | string> {
  if (!supabase) return '這個版本沒有連上雲端'
  if (!(await prepareMigration())) return '連線失敗，請確認網路'
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
