import { ensureUser, supabase } from './cloud'

/** 分享給房間夥伴看的今日進度 */
export interface Progress {
  /** 這份進度是哪一天的（YYYY-MM-DD）；不是今天就代表對方今天還沒打開 App */
  date: string
  habitsDone: number
  habitsTotal: number
  /** 目前最長的習慣連續天數 */
  streak: number
  todosDone: number
  todosLeft: number
  wordsDone: number
  wordsTotal: number
  /** 本週（週一起）習慣打卡總次數 */
  week: number
  /** 是否要收每晚 9 點的打卡提醒（預設不收） */
  remind?: boolean
  /** 今天寫的閱讀與聽力題數 */
  reading: number
}

export interface Member {
  room_id: string
  user_id: string
  nickname: string
  progress: Partial<Progress>
  updated_at: string
}

export interface Room {
  id: string
  code: string
  name: string
  owner: string
  members: Member[]
}

export interface Nudge {
  id: number
  title: string
  body: string
  fire_at: string
}

const IN_ROOM_KEY = 'lm-in-room'

function setInRoom(on: boolean) {
  try {
    if (on) localStorage.setItem(IN_ROOM_KEY, '1')
    else localStorage.removeItem(IN_ROOM_KEY)
  } catch {
    // 忽略
  }
}

function inRoom() {
  try {
    return localStorage.getItem(IN_ROOM_KEY) === '1'
  } catch {
    return false
  }
}

/** 把函式丟出的錯誤訊息換成給使用者看的中文 */
export function roomError(message: string | undefined): string {
  if (!message) return '連線失敗，請確認網路後再試一次'
  if (message.includes('room not found')) return '找不到這個邀請碼，請再確認一次'
  if (message.includes('room full')) return '這個房間已經滿了（上限 20 人）'
  if (message.includes('room limit')) return '最多只能加入 10 個房間'
  if (message.includes('too fast')) return '剛剛才送過訊息，1 分鐘後再試'
  if (message.includes('name required')) return '請先填寫名稱'
  return '連線失敗，請確認網路後再試一次'
}

/** 取得我加入的所有房間與成員；回傳 null 代表連不上雲端 */
export async function fetchRooms(): Promise<{ userId: string; rooms: Room[] } | null> {
  const userId = await ensureUser()
  if (!supabase || !userId) return null
  const { data, error } = await supabase
    .from('room_members')
    .select('room_id, user_id, nickname, progress, updated_at, joined_at, rooms(id, code, name, owner)')
    .order('joined_at')
  if (error) return null
  const rooms = new Map<string, Room>()
  for (const row of data) {
    // 一個成員只對應一個房間，但型別會被推導成陣列
    const info = (Array.isArray(row.rooms) ? row.rooms[0] : row.rooms) as Omit<Room, 'members'> | null
    if (!info) continue
    const room = rooms.get(info.id) ?? { id: info.id, code: info.code, name: info.name, owner: info.owner, members: [] }
    room.members.push({
      room_id: row.room_id,
      user_id: row.user_id,
      nickname: row.nickname,
      progress: (row.progress ?? {}) as Partial<Progress>,
      updated_at: row.updated_at,
    })
    rooms.set(info.id, room)
  }
  setInRoom(rooms.size > 0)
  return { userId, rooms: [...rooms.values()] }
}

/** 把今日進度更新到我加入的每個房間；還沒加入任何房間時不會連線 */
export async function pushProgress(progress: Progress, force = false) {
  if (!supabase || (!force && !inRoom())) return
  const userId = await ensureUser()
  if (!userId) return
  await supabase.from('room_members').update({ progress, updated_at: new Date().toISOString() }).eq('user_id', userId)
}

export async function createRoom(name: string, nickname: string): Promise<string | null> {
  if (!supabase || !(await ensureUser())) return roomError(undefined)
  const { error } = await supabase.rpc('create_room', { p_name: name, p_nickname: nickname })
  return error ? roomError(error.message) : null
}

export async function joinRoom(code: string, nickname: string): Promise<string | null> {
  if (!supabase || !(await ensureUser())) return roomError(undefined)
  const { error } = await supabase.rpc('join_room', { p_code: code, p_nickname: nickname })
  return error ? roomError(error.message) : null
}

/** 離開房間；房主離開時整個房間會一起刪除 */
export async function leaveRoom(room: Room, userId: string) {
  if (!supabase) return
  if (room.owner === userId) await supabase.from('rooms').delete().eq('id', room.id)
  else await supabase.from('room_members').delete().eq('room_id', room.id).eq('user_id', userId)
}

export async function removeMember(member: Member) {
  await supabase?.from('room_members').delete().eq('room_id', member.room_id).eq('user_id', member.user_id)
}

export async function renameSelf(roomId: string, userId: string, nickname: string) {
  await supabase?.from('room_members').update({ nickname }).eq('room_id', roomId).eq('user_id', userId)
}

export async function sendNudge(member: Member, message: string, cheer = false): Promise<string | null> {
  if (!supabase) return roomError(undefined)
  const args = { p_room: member.room_id, p_to: member.user_id, p_message: message }
  let { error } = await supabase.rpc('nudge', { ...args, p_cheer: cheer })
  // 資料庫還沒更新到支援鼓勵的版本時，退回舊的呼叫方式
  if (error?.code === 'PGRST202') ({ error } = await supabase.rpc('nudge', args))
  return error ? roomError(error.message) : null
}

/** 最近一天內收到的督促、鼓勵與系統提醒 */
export async function fetchNudges(): Promise<Nudge[]> {
  if (!supabase) return []
  const since = new Date(Date.now() - 86400000).toISOString()
  const { data } = await supabase
    .from('notifications')
    .select('id, title, body, fire_at')
    .in('kind', ['nudge', 'cheer', 'remind'])
    .gte('fire_at', since)
    .order('fire_at', { ascending: false })
    .limit(5)
  return data ?? []
}

/** 房間成員有變動（有人打卡、加入、離開）時呼叫 onChange */
export function watchRooms(onChange: () => void): () => void {
  if (!supabase) return () => {}
  const client = supabase
  const channel = client
    .channel('room-members')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members' }, onChange)
    .subscribe()
  return () => void client.removeChannel(channel)
}
