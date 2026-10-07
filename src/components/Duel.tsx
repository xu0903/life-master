import { useCallback, useEffect, useRef, useState } from 'react'
import { Crown, Swords, X } from 'lucide-react'
import Confetti from './Confetti'
import { LEVELS } from '../data/toeicWords'
import type { Level } from '../data/toeicWords'
import { useWordLevel } from '../hooks/useDailyWords'
import { useWordPopup } from '../hooks/useWordPopup'
import { COUNTDOWN_MS, QUESTION_MS, buildDuelQuestions, joinDuelChannel, pointsFor } from '../utils/duel'
import type { DuelPresence, DuelQuestion, DuelScore, DuelStart } from '../utils/duel'
import { sendNudge } from '../utils/rooms'
import type { Room } from '../utils/rooms'
import { logStudy } from '../data/studyLog'

type Phase = 'idle' | 'lobby' | 'countdown' | 'playing' | 'done'

interface Game {
  id: string
  hostId: string
  questions: DuelQuestion[]
  players: { id: string; name: string }[]
}

const EMPTY: DuelScore = { q: 0, score: 0, correct: 0, done: false }

/** 夥伴房間的即時單字對戰：房主開局、大家加入，同時作答 10 題，即時看到彼此的進度 */
export default function Duel({ room, userId }: { room: Room; userId: string }) {
  const nickname = room.members.find(m => m.user_id === userId)?.nickname ?? '我'
  const [myLevel] = useWordLevel()
  const { open } = useWordPopup()
  const [presence, setPresence] = useState<Record<string, DuelPresence>>({})
  const [phase, setPhase] = useState<Phase>('idle')
  const [lobbyId, setLobbyId] = useState<string | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [level, setLevel] = useState<Level>(myLevel)
  const [scores, setScores] = useState<Record<string, DuelScore>>({})
  const [startAt, setStartAt] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [qStart, setQStart] = useState(0)
  const [picked, setPicked] = useState<string | null | undefined>(undefined)
  const [wrong, setWrong] = useState<string[]>([])
  const [now, setNow] = useState(Date.now)
  const [notified, setNotified] = useState(false)
  const [hosting, setHosting] = useState(false)
  const [celebrate, setCelebrate] = useState(true)
  const endCelebrate = useCallback(() => setCelebrate(false), [])
  const channelRef = useRef<ReturnType<typeof joinDuelChannel>>(null)
  // 頻道的事件處理用 ref 讀最新的局，不用每次重新訂閱
  const lobbyRef = useRef<string | null>(null)
  const gameRef = useRef<Game | null>(null)
  const presenceRef = useRef(presence)
  lobbyRef.current = lobbyId
  gameRef.current = game
  presenceRef.current = presence

  const track = useCallback(
    (state: Omit<DuelPresence, 'name'>) => void channelRef.current?.channel.track({ name: nickname, ...state }),
    [nickname],
  )

  useEffect(() => {
    const joined = joinDuelChannel(room.id, userId, {
      onPresence: setPresence,
      onStart: start => {
        // 只有在這局大廳裡、而且被列進名單的人才會開始
        if (start.game !== lobbyRef.current || !start.players.some(p => p.id === userId)) return
        begin(start)
      },
      onScore: (gameId, id, score) => {
        if (gameRef.current?.id === gameId) setScores(prev => ({ ...prev, [id]: score }))
      },
      onCancel: gameId => {
        if (lobbyRef.current === gameId) {
          setLobbyId(null)
          setHosting(false)
          setPhase('idle')
          track({ game: null, host: false, phase: 'lobby' })
          alert('房主取消了這局對戰')
        }
      },
    })
    if (!joined) return
    channelRef.current = joined
    joined.channel.subscribe(status => {
      if (status === 'SUBSCRIBED') void joined.channel.track({ name: nickname, game: null, host: false, phase: 'lobby' })
    })
    return () => {
      joined.leave()
      channelRef.current = null
    }
    // begin 只用到 setter 與 ref，不需要放進相依
  }, [room.id, userId, nickname])

  const begin = (start: DuelStart & { hostId?: string }) => {
    const host = Object.entries(presenceRef.current).find(([, p]) => p.game === start.game && p.host)?.[0] ?? userId
    setGame({ id: start.game, hostId: start.hostId ?? host, questions: start.questions, players: start.players })
    setScores(Object.fromEntries(start.players.map(p => [p.id, EMPTY])))
    setStartAt(Date.now() + COUNTDOWN_MS)
    setQIndex(0)
    setPicked(undefined)
    setWrong([])
    setCelebrate(true)
    setPhase('countdown')
  }

  // 倒數與作答時每 0.2 秒更新畫面
  useEffect(() => {
    if (phase !== 'countdown' && phase !== 'playing' && phase !== 'done') return
    const timer = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(timer)
  }, [phase])

  const send = (event: string, payload: object) => void channelRef.current?.channel.send({ type: 'broadcast', event, payload })

  const answer = (option: string | null) => {
    if (!game || picked !== undefined) return
    const q = game.questions[qIndex]
    const correct = option === q.answer
    setPicked(option)
    if (!correct) setWrong(prev => [...prev, q.word])
    const mine = scores[userId] ?? EMPTY
    const last = qIndex + 1 >= game.questions.length
    const next: DuelScore = {
      q: qIndex + 1,
      score: mine.score + pointsFor(correct, Date.now() - qStart),
      correct: mine.correct + (correct ? 1 : 0),
      done: last,
    }
    setScores(prev => ({ ...prev, [userId]: next }))
    send('score', { game: game.id, userId, score: next })
    window.setTimeout(() => {
      if (last) {
        setPhase('done')
        logStudy('practice', game.questions.length)
        return
      }
      setQIndex(i => i + 1)
      setPicked(undefined)
      setQStart(Date.now())
    }, 900)
  }

  // 倒數結束開始作答；時間到沒選就算答錯
  const answerRef = useRef(answer)
  answerRef.current = answer
  useEffect(() => {
    if (phase === 'countdown' && now >= startAt) {
      setPhase('playing')
      setQStart(Date.now())
    } else if (phase === 'playing' && picked === undefined && now - qStart >= QUESTION_MS) answerRef.current(null)
  }, [phase, now, startAt, picked, qStart])

  const openLobby = () => {
    const id = crypto.randomUUID()
    setLobbyId(id)
    setGame(null)
    setHosting(true)
    setPhase('lobby')
    setNotified(false)
    track({ game: id, host: true, phase: 'lobby' })
  }

  const joinLobby = (id: string) => {
    setLobbyId(id)
    setGame(null)
    setHosting(false)
    setPhase('lobby')
    track({ game: id, host: false, phase: 'lobby' })
  }

  const leaveLobby = () => {
    if (hosting && phase === 'lobby') send('cancel', { game: lobbyId })
    setLobbyId(null)
    setHosting(false)
    setGame(null)
    setPhase('idle')
    track({ game: null, host: false, phase: 'lobby' })
  }

  const lobbyPlayers = Object.entries(presence)
    .filter(([, p]) => p.game === lobbyId)
    .map(([id, p]) => ({ id, name: p.name, host: p.host }))
  const isHost = hosting

  const start = () => {
    if (!lobbyId) return
    const payload: DuelStart & { hostId: string } = {
      game: lobbyId,
      questions: buildDuelQuestions(level),
      players: lobbyPlayers.map(p => ({ id: p.id, name: p.name })),
      hostId: userId,
    }
    send('start', payload)
    track({ game: lobbyId, host: true, phase: 'playing' })
    begin(payload)
  }

  const notifyOthers = async () => {
    setNotified(true)
    const here = new Set(Object.keys(presence))
    const others = room.members.filter(m => m.user_id !== userId && !here.has(m.user_id))
    await Promise.all(others.map(m => sendNudge(m, '⚔️ 開了一局單字對戰，打開「夥伴」頁加入！', true)))
  }

  // ---------- 房間頁上的入口 ----------
  if (phase === 'idle') {
    const lobbies = Object.entries(presence).filter(([id, p]) => id !== userId && p.host && p.game && p.phase === 'lobby')
    const online = Object.keys(presence).length
    return (
      <div className="rounded-2xl bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
              <Swords className="h-4 w-4 text-rose-500" /> 單字對戰
            </p>
            <p className="mt-0.5 text-xs text-muted">10 題搶分，答得越快分數越高・現在 {online} 人在線上</p>
          </div>
          <button onClick={openLobby} className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-on-primary">
            開一局
          </button>
        </div>
        {lobbies.map(([id, p]) => (
          <button
            key={id}
            onClick={() => joinLobby(p.game!)}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-rose-500/10 px-3 py-2.5 text-left text-sm"
          >
            <span className="text-fg">
              <span className="font-semibold">{p.name}</span> 開了一局，等你加入
            </span>
            <span className="font-semibold text-rose-500">加入 →</span>
          </button>
        ))}
      </div>
    )
  }

  // ---------- 全螢幕對戰畫面 ----------
  const players = phase === 'lobby' || !game ? lobbyPlayers : game.players
  const ranked = [...players].sort((a, b) => (scores[b.id]?.score ?? 0) - (scores[a.id]?.score ?? 0))
  const q = game?.questions[qIndex]
  const total = game?.questions.length ?? 10
  const timeLeft = Math.max(0, QUESTION_MS - (now - qStart))
  // 有人斷線時，全部題目的時間過了就直接結算
  const allDone = phase === 'done' && (players.every(p => scores[p.id]?.done) || now - startAt > total * (QUESTION_MS + 1000) + 5000)
  const winner = allDone ? ranked[0] : undefined
  // 房主按「再來一局」後開的新大廳
  const hostPresence = game ? presence[game.hostId] : undefined
  const nextLobby = hostPresence?.host && hostPresence.phase === 'lobby' && hostPresence.game !== game?.id ? hostPresence.game : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {winner?.id === userId && celebrate && <Confetti onDone={endCelebrate} />}
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-rose-500" />
          <p className="flex-1 font-bold text-fg">單字對戰・{room.name}</p>
          {(phase === 'lobby' || phase === 'done') && (
            <button onClick={leaveLobby} className="rounded-full p-2 text-faint hover:bg-surface-2" aria-label="離開">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* 即時排行 */}
        <div className="space-y-2 rounded-2xl bg-surface p-4 shadow-sm">
          {ranked.map((p, i) => {
            const s = scores[p.id] ?? EMPTY
            return (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className={`w-5 text-center font-bold tabular-nums ${i === 0 && s.score > 0 ? 'text-amber-500' : 'text-faint'}`}>{i + 1}</span>
                <span className={`w-20 shrink-0 truncate ${p.id === userId ? 'font-semibold text-primary-ink' : 'text-fg'}`}>
                  {p.name}
                  {(game ? game.hostId === p.id : lobbyPlayers.find(l => l.id === p.id)?.host) && <Crown className="ml-1 inline h-3.5 w-3.5 text-amber-500" />}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(s.q / total) * 100}%` }} />
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-muted tabular-nums">
                  {phase === 'lobby' ? '準備好了' : `${s.score} 分`}
                </span>
              </div>
            )
          })}
        </div>

        {phase === 'lobby' && (
          <div className="space-y-3">
            {isHost ? (
              <>
                <div>
                  <p className="mb-1.5 text-xs text-muted">題目程度</p>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVELS.map(l => (
                      <button
                        key={l.value}
                        onClick={() => setLevel(l.value)}
                        className={`rounded-xl py-2 text-sm ${level === l.value ? 'bg-primary font-semibold text-on-primary' : 'bg-surface text-muted'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  disabled={lobbyPlayers.length < 2}
                  onClick={start}
                  className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-2 py-3.5 font-semibold text-on-primary shadow-md disabled:opacity-40"
                >
                  {lobbyPlayers.length < 2 ? '等夥伴加入…' : `開始（${lobbyPlayers.length} 人）`}
                </button>
                <button
                  disabled={notified}
                  onClick={() => void notifyOthers()}
                  className="w-full rounded-2xl bg-surface py-3 text-sm text-muted shadow-sm disabled:opacity-50"
                >
                  {notified ? '已通知不在線上的夥伴' : '通知不在線上的夥伴'}
                </button>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-muted">等房主按開始…</p>
            )}
          </div>
        )}

        {phase === 'countdown' && (
          <p className="py-16 text-center text-7xl font-bold text-primary-ink tabular-nums">{Math.max(1, Math.ceil((startAt - now) / 1000))}</p>
        )}

        {phase === 'playing' && q && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>
                第 {qIndex + 1} / {total} 題・{q.type === 'zh2en' ? '選出英文' : '選出中文意思'}
              </span>
              <span className={`tabular-nums ${timeLeft < 3000 ? 'font-bold text-rose-500' : ''}`}>{Math.ceil(timeLeft / 1000)} 秒</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-rose-400" style={{ width: `${(timeLeft / QUESTION_MS) * 100}%` }} />
            </div>
            <p className="rounded-2xl bg-surface px-4 py-8 text-center text-2xl font-bold break-words text-fg shadow-sm">{q.prompt}</p>
            <div className="grid gap-2.5">
              {q.options.map(opt => {
                const shown = picked !== undefined
                const tone = !shown
                  ? 'bg-surface text-fg'
                  : opt === q.answer
                    ? 'bg-emerald-500 text-white'
                    : opt === picked
                      ? 'bg-rose-500 text-white'
                      : 'bg-surface text-faint'
                return (
                  <button
                    key={opt}
                    disabled={shown}
                    onClick={() => answer(opt)}
                    className={`rounded-2xl px-4 py-3.5 text-left font-medium shadow-sm transition active:scale-[0.98] ${tone}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="space-y-3">
            <p className="py-4 text-center text-xl font-bold text-fg">
              {!allDone ? '等其他人答完…' : winner?.id === userId ? '🏆 你贏了！' : `🏆 ${winner?.name} 獲勝`}
            </p>
            <p className="text-center text-sm text-muted">
              你答對 {scores[userId]?.correct ?? 0} / {total} 題，得 {scores[userId]?.score ?? 0} 分
            </p>
            {wrong.length > 0 && (
              <div className="rounded-2xl bg-surface p-4 shadow-sm">
                <p className="mb-2 text-sm font-semibold text-fg">答錯的字（點一下看解釋、收進單字卡）</p>
                <div className="flex flex-wrap gap-2">
                  {wrong.map(w => (
                    <button key={w} onClick={() => open(w)} className="rounded-full bg-rose-500/10 px-3 py-1.5 text-sm text-rose-600 dark:text-rose-400">
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {allDone && !hosting && nextLobby && (
              <button onClick={() => joinLobby(nextLobby)} className="w-full rounded-2xl bg-primary py-3 font-semibold text-on-primary">
                加入下一局
              </button>
            )}
            {allDone && hosting && (
              <button onClick={openLobby} className="w-full rounded-2xl bg-primary py-3 font-semibold text-on-primary">
                再來一局
              </button>
            )}
            {allDone && (
              <button onClick={leaveLobby} className="w-full rounded-2xl bg-surface py-3 text-sm text-muted shadow-sm">
                回到房間
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
