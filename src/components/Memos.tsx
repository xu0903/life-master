import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Pin, Plus, RefreshCw, Smartphone, Trash2 } from 'lucide-react'
import { MEMOS_KEY, sortMemos } from '../data/memos'
import type { Memo } from '../data/memos'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { cloudEnabled } from '../utils/cloud'
import { newId } from '../utils/date'
import {
  WIDGET_ON_KEY,
  WIDGET_STALE_KEY,
  WIDGET_TOKEN_KEY,
  disableWidget,
  enableWidget,
  markScriptCopied,
  pushWidgetMemos,
  rotateWidgetToken,
  widgetScript,
} from '../utils/memoWidget'

const fieldBase =
  'w-full resize-none rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-fg outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20'

/** 讓 textarea 跟著內容長高 */
function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const timeLabel = (ms: number) => {
  const d = new Date(ms)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return `${sameYear ? '' : `${d.getFullYear()}/`}${d.getMonth() + 1}/${d.getDate()}`
}

function MemoItem({ memo, onSave, onPin, onDelete }: { memo: Memo; onSave: (text: string) => void; onPin: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(memo.text)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!editing) return
    autoGrow(ref.current)
    ref.current?.focus()
  }, [editing])

  const finish = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== memo.text) onSave(trimmed)
    else setDraft(memo.text)
  }

  return (
    <li className={`rounded-2xl bg-surface p-3 shadow-sm ${memo.pinned ? 'ring-1 ring-amber-400/60' : ''}`}>
      {editing ? (
        <textarea
          ref={ref}
          value={draft}
          onChange={e => {
            setDraft(e.target.value)
            autoGrow(e.target)
          }}
          onBlur={finish}
          rows={2}
          className={fieldBase}
        />
      ) : (
        <button
          onClick={() => {
            setDraft(memo.text)
            setEditing(true)
          }}
          className="block w-full text-left break-words whitespace-pre-wrap text-fg"
        >
          {memo.text}
        </button>
      )}
      <div className="mt-2 flex items-center gap-1 text-xs text-faint">
        <span className="flex-1">{timeLabel(memo.updatedAt)}</span>
        {editing && (
          <button onMouseDown={e => e.preventDefault()} onClick={finish} className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-on-primary">
            <Check className="h-3.5 w-3.5" />
            完成
          </button>
        )}
        <button
          onClick={onPin}
          className={`rounded-lg p-1.5 transition ${memo.pinned ? 'text-amber-500' : 'hover:bg-surface-2'}`}
          aria-label={memo.pinned ? '取消置頂' : '置頂'}
        >
          <Pin className={`h-4 w-4 ${memo.pinned ? 'fill-current' : ''}`} />
        </button>
        <button onClick={onDelete} className="rounded-lg p-1.5 transition hover:bg-rose-500/10 hover:text-rose-500" aria-label="刪除備忘">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  )
}

export default function Memos() {
  const [memos, setMemos] = useLocalStorage<Memo[]>(MEMOS_KEY, [])
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const add = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    const now = Date.now()
    setMemos(prev => [{ id: newId(), text: trimmed, pinned: false, createdAt: now, updatedAt: now }, ...prev])
    setText('')
    requestAnimationFrame(() => autoGrow(inputRef.current))
  }

  const update = (id: string, patch: Partial<Memo>) => setMemos(prev => prev.map(m => (m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m)))

  const remove = (id: string) => {
    const target = memos.find(m => m.id === id)
    if (target && !confirm(`刪除這則備忘？\n\n${target.text.slice(0, 60)}`)) return
    setMemos(prev => prev.filter(m => m.id !== id))
  }

  const sorted = sortMemos(memos)

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl bg-surface p-3 shadow-sm">
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => {
            setText(e.target.value)
            autoGrow(e.target)
          }}
          placeholder="記點什麼…（沒有期限，可以換行）"
          rows={2}
          className={fieldBase}
        />
        <button
          onClick={add}
          disabled={!text.trim()}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 font-semibold text-on-primary transition active:scale-[0.98] disabled:opacity-40"
        >
          <Plus className="h-5 w-5" />
          新增備忘
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-faint">還沒有備忘，記下第一件事吧！</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map(m => (
            <MemoItem
              key={m.id}
              memo={m}
              onSave={t => update(m.id, { text: t })}
              onPin={() => update(m.id, { pinned: !m.pinned })}
              onDelete={() => remove(m.id)}
            />
          ))}
        </ul>
      )}

      <section className="rounded-2xl bg-surface p-4 shadow-sm">
        <h2 className="flex items-center gap-1.5 font-semibold text-fg">
          <Smartphone className="h-4 w-4" />
          放到主畫面／鎖定畫面
        </h2>
        <p className="mt-0.5 text-xs text-muted">📌 置頂的備忘會排在最前面，鎖定畫面放得下前 3 則</p>
        <div className="mt-3">
          <MemoWidgetPanel />
        </div>
      </section>
    </div>
  )
}

/** 開啟後備忘會上傳到雲端，Scriptable 小工具讀取顯示；預設關閉 */
export function MemoWidgetPanel() {
  const [memos] = useLocalStorage<Memo[]>(MEMOS_KEY, [])
  const [on] = useLocalStorage<boolean>(WIDGET_ON_KEY, false)
  const [token] = useLocalStorage<string | null>(WIDGET_TOKEN_KEY, null)
  const [stale] = useLocalStorage<boolean>(WIDGET_STALE_KEY, false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!cloudEnabled) return <p className="text-sm text-muted">這個版本沒有連上雲端，無法使用小工具。</p>

  const run = async (fn: () => Promise<boolean>, fail: string) => {
    setBusy(true)
    setMsg('')
    const ok = await fn()
    setBusy(false)
    if (!ok) setMsg(fail)
  }

  const copy = async () => {
    if (!token) return
    try {
      await navigator.clipboard.writeText(widgetScript(token))
      markScriptCopied()
      setMsg('✅ 已複製，到 Scriptable 貼上')
    } catch {
      setMsg('複製失敗，請再按一次')
    }
  }

  if (!on || !token) {
    return (
      <div className="space-y-2 text-sm text-muted">
        <p>iPhone 不讓網頁 App 直接做小工具，所以要借用免費的 Scriptable App 來顯示。開啟後，你的備忘會上傳到雲端，只有拿到專屬腳本的人才讀得到。</p>
        <button
          disabled={busy}
          onClick={() => run(() => enableWidget(memos), '開啟失敗，請確認網路後再試一次')}
          className="w-full rounded-xl bg-primary py-2.5 font-semibold text-on-primary disabled:opacity-50"
        >
          {busy ? '開啟中…' : '開啟小工具'}
        </button>
        {msg && <p className="text-xs text-rose-500">{msg}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-3 text-sm">
      {stale && <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">連結換過了（例如登入了別的帳號），請重新複製腳本貼到 Scriptable</p>}
      <ol className="list-decimal space-y-1 pl-5 text-muted">
        <li>到 App Store 下載免費的「Scriptable」</li>
        <li>按下面的「複製腳本」，打開 Scriptable，按右上角 ＋，貼上後按「Done」</li>
        <li>主畫面：長按空白處 → 左上角「編輯」→「加入小工具」→ Scriptable</li>
        <li>鎖定畫面：長按鎖定畫面 →「自訂」→ 鎖定畫面 → 點時間下方的小工具區 → Scriptable</li>
        <li>加好後長按小工具 →「編輯小工具」→ Script 選剛剛貼上的那個</li>
      </ol>
      <p className="text-xs text-faint">iPhone 大約每 15 分鐘到 1 小時更新一次小工具，剛改的備忘會晚一點才出現。腳本裡有你的專屬連結，不要傳給別人。</p>
      <div className="flex gap-2">
        <button onClick={copy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 font-semibold text-on-primary">
          <Copy className="h-4 w-4" />
          複製腳本
        </button>
        <button
          disabled={busy}
          onClick={() => run(() => pushWidgetMemos(memos).then(Boolean), '上傳失敗，請確認網路')}
          className="flex items-center justify-center rounded-xl bg-surface-2 px-3 text-muted disabled:opacity-50"
          aria-label="立刻上傳"
        >
          <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="flex gap-4 text-xs">
        <button
          disabled={busy}
          onClick={() => {
            if (confirm('換一組新連結？舊的腳本會立刻失效，要重新複製貼上。')) void run(rotateWidgetToken, '換連結失敗，請再試一次')
          }}
          className="text-muted underline"
        >
          換一組新連結
        </button>
        <button
          disabled={busy}
          onClick={() => {
            if (confirm('關閉小工具？雲端上的備忘會刪除，小工具會顯示「連結已失效」。')) void run(disableWidget, '關閉失敗，請再試一次')
          }}
          className="text-rose-500 underline"
        >
          關閉小工具
        </button>
      </div>
      {msg && <p className="text-xs text-muted">{msg}</p>}
    </div>
  )
}

/** 小工具開著時：備忘一改（包括別台裝置同步過來的）就上傳 */
export function useMemoWidgetSync() {
  const [memos] = useLocalStorage<Memo[]>(MEMOS_KEY, [])
  const [on] = useLocalStorage<boolean>(WIDGET_ON_KEY, false)
  useEffect(() => {
    if (!on) return
    const timer = window.setTimeout(() => void pushWidgetMemos(memos), 1500)
    return () => window.clearTimeout(timer)
  }, [memos, on])
}
