import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { BellRing, Check, Copy, Crown, Flame, LogOut, Pencil, Plus, Share2, UserMinus, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useProgress } from '../hooks/useProgress'
import { cloudEnabled } from '../utils/cloud'
import { toDateKey } from '../utils/date'
import { PUSH_EVENT, isPushEnabled } from '../utils/push'
import {
  createRoom,
  fetchNudges,
  fetchRooms,
  joinRoom,
  leaveRoom,
  pushProgress,
  removeMember,
  renameSelf,
  sendNudge,
  watchRooms,
} from '../utils/rooms'
import type { Member, Nudge, Room } from '../utils/rooms'

const NUDGES = ['快去打卡！', '今天單字背了嗎？', '待辦還沒做完喔', '一起加油！']

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-fg outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20'

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小時前`
  return `${Math.floor(minutes / 1440)} 天前`
}

function Stat({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <span className={`rounded-lg px-2 py-1 text-xs ${done ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-surface-2 text-muted'}`}>
      {label} <span className="font-semibold tabular-nums">{value}</span>
    </span>
  )
}

/** 建立或加入房間的表單 */
function JoinForm({ onDone }: { onDone: () => void }) {
  const [nickname, setNickname] = useLocalStorage('lifemaster.nickname', '')
  const [mode, setMode] = useState<'join' | 'create'>('join')
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !value.trim() || busy) return
    setBusy(true)
    const failed = mode === 'join' ? await joinRoom(value, nickname) : await createRoom(value, nickname)
    setBusy(false)
    setError(failed)
    if (!failed) {
      setValue('')
      onDone()
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-surface p-4 shadow-sm">
      <div className="flex rounded-xl bg-surface-2 p-1">
        {(
          [
            ['join', '加入房間'],
            ['create', '建立房間'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setValue('')
              setError(null)
            }}
            className={`flex-1 rounded-lg py-2 text-sm transition ${mode === m ? 'bg-surface font-semibold text-primary-ink shadow-sm' : 'text-muted'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={20} placeholder="你的暱稱" className={inputClass} />
      {mode === 'join' ? (
        <input
          value={value}
          onChange={e => setValue(e.target.value.toUpperCase())}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect="off"
          placeholder="6 碼邀請碼"
          className={`${inputClass} text-center font-mono tracking-[0.3em]`}
        />
      ) : (
        <input value={value} onChange={e => setValue(e.target.value)} maxLength={30} placeholder="房間名稱，例如：多益衝刺班" className={inputClass} />
      )}
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <button
        type="submit"
        disabled={busy || !nickname.trim() || !value.trim()}
        className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary py-2.5 font-medium text-on-primary transition active:scale-[0.98] disabled:opacity-40"
      >
        {mode === 'join' ? '加入' : <><Plus className="h-5 w-5" /> 建立</>}
      </button>
    </form>
  )
}

function MemberRow({
  member,
  room,
  userId,
  onChanged,
}: {
  member: Member
  room: Room
  userId: string
  onChanged: () => void
}) {
  const [picking, setPicking] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const isMe = member.user_id === userId
  const isOwner = room.owner === userId
  const p = member.progress
  const active = p.date === toDateKey()

  const nudge = async (message: string) => {
    setPicking(false)
    const failed = await sendNudge(member, message)
    setNotice(failed ? { ok: false, text: failed } : { ok: true, text: '已送出督促' })
  }

  const rename = async () => {
    const name = prompt('在這個房間顯示的暱稱', member.nickname)?.trim()
    if (!name) return
    await renameSelf(room.id, userId, name.slice(0, 20))
    onChanged()
  }

  const kick = async () => {
    if (!confirm(`把「${member.nickname}」移出房間？`)) return
    await removeMember(member)
    onChanged()
  }

  return (
    <li className="space-y-2 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-ink">
          {[...member.nickname][0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-medium text-fg">
            <span className="truncate">{member.nickname}</span>
            {member.user_id === room.owner && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="房主" />}
            {isMe && <span className="shrink-0 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary-ink">我</span>}
          </p>
          <p className="text-xs text-faint">{active ? `${timeAgo(member.updated_at)}更新` : '今天還沒打開 App'}</p>
        </div>
        {isMe ? (
          <button onClick={rename} className="rounded-lg p-2 text-muted" aria-label="修改暱稱">
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <>
            {isOwner && (
              <button onClick={kick} className="rounded-lg p-2 text-faint hover:text-rose-500" aria-label="移出房間">
                <UserMinus className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setPicking(v => !v)}
              className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-on-primary transition active:scale-95"
            >
              <BellRing className="h-4 w-4" /> 督促
            </button>
          </>
        )}
      </div>

      {active && (
        <div className="flex flex-wrap gap-1.5 pl-[3.25rem]">
          <Stat label="習慣" value={`${p.habitsDone ?? 0}/${p.habitsTotal ?? 0}`} done={!!p.habitsTotal && p.habitsDone === p.habitsTotal} />
          <Stat label="單字" value={`${p.wordsDone ?? 0}/${p.wordsTotal ?? 0}`} done={!!p.wordsTotal && p.wordsDone === p.wordsTotal} />
          <Stat label="待辦完成" value={`${p.todosDone ?? 0}`} done={!!p.todosDone && !p.todosLeft} />
          {!!p.reading && <Stat label="閱讀" value={`${p.reading} 題`} done />}
          {!!p.streak && (
            <span className="flex items-center gap-0.5 rounded-lg bg-orange-500/15 px-2 py-1 text-xs font-semibold text-orange-500">
              <Flame className="h-3.5 w-3.5" /> {p.streak} 天
            </span>
          )}
        </div>
      )}

      {picking && (
        <div className="flex flex-wrap gap-1.5 pl-[3.25rem]">
          {NUDGES.map(text => (
            <button key={text} onClick={() => nudge(text)} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm text-fg active:scale-95">
              {text}
            </button>
          ))}
        </div>
      )}
      {notice && (
        <p className={`flex items-center gap-1 pl-[3.25rem] text-xs ${notice.ok ? 'text-emerald-500' : 'text-rose-500'}`}>
          {notice.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {notice.text}
        </p>
      )}
    </li>
  )
}

export default function Rooms({ onOpenSettings }: { onOpenSettings: () => void }) {
  const progress = useProgress()
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading')
  const [userId, setUserId] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [nudges, setNudges] = useState<Nudge[]>([])
  const [roomId, setRoomId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pushOn, setPushOn] = useState(isPushEnabled)

  const load = useCallback(async () => {
    const result = await fetchRooms()
    if (!result) {
      setState('error')
      return
    }
    setUserId(result.userId)
    setRooms(result.rooms)
    setState('ready')
    setNudges(await fetchNudges())
  }, [])

  // 進分頁時先把自己的最新進度送上去，再載入房間；之後有人變動就即時更新
  const serialized = JSON.stringify(progress)
  useEffect(() => {
    if (!cloudEnabled) return
    void pushProgress(JSON.parse(serialized), true).then(load)
  }, [serialized, load])

  useEffect(() => {
    if (!cloudEnabled) return
    const stop = watchRooms(() => void load())
    const onVisible = () => document.visibilityState === 'visible' && void load()
    const onPush = () => setPushOn(isPushEnabled())
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener(PUSH_EVENT, onPush)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener(PUSH_EVENT, onPush)
    }
  }, [load])

  if (!cloudEnabled) {
    return (
      <p className="rounded-2xl bg-surface px-6 py-12 text-center text-sm text-muted shadow-sm">
        夥伴功能需要先設定雲端服務（Supabase）。
        <br />
        設定步驟請看專案裡的 supabase/README.md。
      </p>
    )
  }
  if (state === 'loading') return <p className="py-16 text-center text-sm text-faint">連線中…</p>
  if (state === 'error') {
    return (
      <div className="space-y-3 rounded-2xl bg-surface px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-muted">連不上雲端，請確認網路連線。</p>
        <button onClick={() => void load()} className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-on-primary">
          重試
        </button>
      </div>
    )
  }

  const room = rooms.find(r => r.id === roomId) ?? rooms[0]

  if (!room) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface p-5 text-center shadow-sm">
          <p className="font-semibold text-fg">找夥伴一起打卡</p>
          <p className="mt-1 text-sm text-muted">建立房間後把邀請碼傳給朋友，就能看到彼此今天的進度，還可以互相督促。</p>
        </div>
        <JoinForm onDone={() => void load()} />
      </div>
    )
  }

  const inviteText = `來 LifeMaster 跟我一起打卡！到「夥伴」分頁輸入邀請碼 ${room.code} 加入「${room.name}」\n${location.origin}${import.meta.env.BASE_URL}`

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ text: inviteText })
      else await navigator.clipboard.writeText(inviteText)
    } catch {
      // 使用者取消分享
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(room.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 無法存取剪貼簿時忽略
    }
  }

  const leave = async () => {
    const owner = room.owner === userId
    if (!confirm(owner ? `你是房主，離開會解散「${room.name}」，確定嗎？` : `確定離開「${room.name}」？`)) return
    await leaveRoom(room, userId)
    setRoomId(null)
    void load()
  }

  // 自己排最前面，其他人依今天完成的習慣數排序
  const score = (m: Member) => (m.progress.date === progress.date ? (m.progress.habitsDone ?? 0) + 1 : 0)
  const members = [...room.members].sort(
    (a, b) => Number(b.user_id === userId) - Number(a.user_id === userId) || score(b) - score(a),
  )

  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {rooms.map(r => (
          <button
            key={r.id}
            onClick={() => {
              setRoomId(r.id)
              setAdding(false)
            }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${
              room.id === r.id && !adding ? 'bg-primary font-semibold text-on-primary' : 'bg-surface text-muted'
            }`}
          >
            {r.name} <span className="opacity-70">{r.members.length}</span>
          </button>
        ))}
        <button
          onClick={() => setAdding(v => !v)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-muted"
        >
          <Plus className="h-4 w-4" /> 房間
        </button>
      </div>

      {adding ? (
        <JoinForm
          onDone={() => {
            setAdding(false)
            setRoomId(null)
            void load()
          }}
        />
      ) : (
        <>
          <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-2 p-4 text-on-primary shadow-lg">
            <p className="text-sm opacity-90">邀請碼</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 font-mono text-3xl font-bold tracking-[0.25em]">{room.code}</p>
              <button onClick={copy} className="rounded-full bg-white/20 p-2.5" aria-label="複製邀請碼">
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
              <button onClick={share} className="rounded-full bg-white/20 p-2.5" aria-label="分享邀請">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!pushOn && (
            <button onClick={onOpenSettings} className="w-full rounded-2xl bg-amber-400/20 px-4 py-3 text-left text-sm text-amber-700 dark:text-amber-300">
              還沒開啟通知，夥伴督促你時只有打開 App 才看得到。<span className="font-semibold underline">到設定開啟</span>
            </button>
          )}

          {nudges.length > 0 && (
            <div className="rounded-2xl bg-surface p-4 shadow-sm">
              <p className="mb-1 text-sm font-semibold text-fg">收到的督促</p>
              <ul className="space-y-1">
                {nudges.map(n => (
                  <li key={n.id} className="flex items-baseline gap-2 text-sm">
                    <span className="min-w-0 flex-1 text-muted">
                      {n.title}
                      {n.body && `：${n.body}`}
                    </span>
                    <span className="shrink-0 text-xs text-faint">{timeAgo(n.fire_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl bg-surface px-4 py-1 shadow-sm">
            <ul className="divide-y divide-line">
              {members.map(m => (
                <MemberRow key={m.user_id} member={m} room={room} userId={userId} onChanged={() => void load()} />
              ))}
            </ul>
          </div>
          {room.members.length === 1 && <p className="text-center text-sm text-faint">房間裡還只有你，把邀請碼傳給朋友吧</p>}

          <button onClick={leave} className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-faint">
            <LogOut className="h-4 w-4" /> {room.owner === userId ? '解散房間' : '離開房間'}
          </button>
        </>
      )}
    </div>
  )
}
