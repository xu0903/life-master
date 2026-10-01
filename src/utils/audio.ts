import type { SpokenLine } from '../data/listening'

// 整個 App 共用一個 audio 元素：iPhone 只要第一次是由點擊觸發，之後換音檔接著播都不會被擋
let player: HTMLAudioElement | null = null
let session = 0

const GAP_MS = 450

function audioElement(): HTMLAudioElement {
  player ??= new Audio()
  return player
}

function playFile(src: string, rate: number, id: number): Promise<'ended' | 'error' | 'stopped'> {
  return new Promise(resolve => {
    const el = audioElement()
    const finish = (result: 'ended' | 'error' | 'stopped') => {
      el.onended = null
      el.onerror = null
      resolve(id === session ? result : 'stopped')
    }
    el.onended = () => finish('ended')
    el.onerror = () => finish('error')
    el.src = src
    el.playbackRate = rate
    el.play().catch(() => finish('error'))
  })
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 依序播放預錄語音，句子之間留一點停頓；某一句沒有音檔時用 fallback（裝置語音）念那一句。
 * 被 stopRecorded 或下一次播放中斷時不會呼叫 onEnd。
 */
export async function playRecorded(lines: SpokenLine[], rate: number, fallback: (line: SpokenLine) => Promise<void>, onEnd: () => void) {
  const id = ++session
  for (const [i, line] of lines.entries()) {
    if (id !== session) return
    if (i > 0) await wait(GAP_MS / rate)
    const result = line.audio ? await playFile(`${import.meta.env.BASE_URL}audio/${line.audio}`, rate, id) : 'error'
    if (result === 'stopped' || id !== session) return
    if (result === 'error') await fallback(line)
  }
  if (id === session) onEnd()
}

export function stopRecorded() {
  session++
  player?.pause()
}
