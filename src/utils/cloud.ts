import { createClient } from '@supabase/supabase-js'

const url: string | undefined = import.meta.env.VITE_SUPABASE_URL
const anonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

/** 沒填 .env 的 Supabase 設定時為 null，雲端功能（背景推播、夥伴房間）會自動停用 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const cloudEnabled = supabase !== null

let pending: Promise<string | null> | null = null

/** 取得這台裝置的匿名帳號 id；第一次呼叫時自動註冊，之後沿用存在瀏覽器裡的登入狀態 */
export function ensureUser(): Promise<string | null> {
  if (!supabase) return Promise.resolve(null)
  pending ??= (async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) return data.session.user.id
    const { data: signed, error } = await supabase.auth.signInAnonymously()
    if (error || !signed.user) {
      // 失敗（例如離線）時下次再試
      pending = null
      return null
    }
    return signed.user.id
  })()
  return pending
}
