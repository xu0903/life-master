import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CloudCheck, LogOut, RefreshCw, UserRound } from 'lucide-react'
import { cloudEnabled, supabase } from '../utils/cloud'
import { currentAccount, sendPasswordReset, setNewPassword, signIn, signOut, signUp } from '../utils/account'
import { SYNC_STATUS_EVENT, lastSyncAt, syncNow } from '../utils/sync'

const field = 'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-fg outline-none placeholder:text-faint focus:border-primary'

const formatTime = (iso: string | null) => {
  if (!iso) return '還沒同步'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 帳號：註冊 / 登入後，手機、平板等多台裝置自動同步同一份資料 */
export default function AccountPanel() {
  const [email, setEmail] = useState<string | null | undefined>(undefined)
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [synced, setSynced] = useState(lastSyncAt)

  useEffect(() => {
    const refresh = () => {
      void currentAccount().then(a => setEmail(a.email))
      setSynced(lastSyncAt())
    }
    refresh()
    window.addEventListener(SYNC_STATUS_EVENT, refresh)
    return () => window.removeEventListener(SYNC_STATUS_EVENT, refresh)
  }, [])

  if (!cloudEnabled) return <p className="text-sm text-muted">這個版本沒有連上雲端，無法使用帳號。</p>
  if (email === undefined) return <p className="text-sm text-faint">讀取中…</p>

  if (email) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-primary-soft p-3">
          <UserRound className="h-8 w-8 shrink-0 rounded-full bg-primary p-1.5 text-on-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-fg">{email}</p>
            <p className="flex items-center gap-1 text-xs text-muted">
              <CloudCheck className="h-3.5 w-3.5" /> 上次同步 {formatTime(synced)}
            </p>
          </div>
        </div>
        <p className="text-xs text-faint">在手機、平板用同一個帳號登入，資料會自動同步（打開 App、改完資料約 20 秒後）。同一項資料兩邊都改時，以後改的為準。</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              setNote((await syncNow()) ? '同步完成' : '同步失敗，請確認網路')
              setBusy(false)
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-sm font-medium text-fg disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> 立即同步
          </button>
          <button
            onClick={async () => {
              if (!confirm('登出後這台裝置不會再同步，資料仍會留在這台裝置上。確定登出？')) return
              await signOut()
              setNote('已登出')
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-sm text-rose-500"
          >
            <LogOut className="h-4 w-4" /> 登出
          </button>
        </div>
        {note && <p className="text-center text-xs text-muted">{note}</p>}
      </div>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setNote('')
    const result = mode === 'signup' ? await signUp(form.email, form.password) : await signIn(form.email, form.password)
    setBusy(false)
    if (result === 'ok') setNote(mode === 'signup' ? '帳號建立完成，這台裝置的資料已經上傳' : '登入成功，已同步這個帳號的資料')
    else if (result === 'verify') {
      setNote(`驗證信已寄到 ${form.email}。點信裡的連結後，回到這裡切換到「登入」再登入一次。`)
      setMode('signin')
    } else setNote(result)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex rounded-xl bg-surface-2 p-1">
        {(
          [
            ['signup', '建立帳號'],
            ['signin', '登入'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setNote('')
            }}
            className={`flex-1 rounded-lg py-1.5 text-sm transition ${mode === m ? 'bg-surface font-semibold text-primary-ink shadow-sm' : 'text-muted'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-faint">
        {mode === 'signup'
          ? '用 Email 建立帳號，這台裝置現有的資料、夥伴房間都會跟著帳號走。之後在平板或新手機登入同一個帳號就能同步。'
          : '登入後會把帳號裡的資料同步到這台裝置；這台裝置原本的資料也會合併上去。'}
      </p>
      <input
        type="email"
        autoComplete="email"
        required
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder="Email"
        className={field}
      />
      <input
        type="password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        required
        minLength={6}
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        placeholder="密碼（至少 6 個字元）"
        className={field}
      />
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary py-2.5 font-semibold text-on-primary disabled:opacity-50">
        {busy ? '處理中…' : mode === 'signup' ? '建立帳號' : '登入'}
      </button>
      {mode === 'signin' && (
        <button
          type="button"
          onClick={async () => {
            if (!form.email) return setNote('先填 Email，再按忘記密碼')
            const r = await sendPasswordReset(form.email)
            setNote(r === 'ok' ? `重設密碼的信已寄到 ${form.email}，點信裡的連結設定新密碼` : r)
          }}
          className="w-full text-center text-xs text-faint underline underline-offset-2"
        >
          忘記密碼
        </button>
      )}
      {note && <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-fg">{note}</p>}
    </form>
  )
}

/** 點重設密碼信的連結回到 App 時，跳出設定新密碼的視窗 */
export function PasswordRecovery() {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setOpen(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <form
        onSubmit={async e => {
          e.preventDefault()
          const r = await setNewPassword(password)
          if (r === 'ok') {
            setNote('密碼已更新，回到 App 用新密碼登入即可')
            window.setTimeout(() => setOpen(false), 2500)
          } else setNote(r)
        }}
        className="w-full max-w-sm space-y-3 rounded-3xl bg-surface p-6 shadow-2xl"
      >
        <p className="text-lg font-bold text-fg">設定新密碼</p>
        <input
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="新密碼（至少 6 個字元）"
          className={field}
        />
        <button type="submit" className="w-full rounded-xl bg-primary py-2.5 font-semibold text-on-primary">
          儲存新密碼
        </button>
        {note && <p className="text-sm text-muted">{note}</p>}
      </form>
    </div>
  )
}
