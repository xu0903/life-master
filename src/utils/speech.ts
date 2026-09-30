export type Accent = 'en-US' | 'en-GB'

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

/** 用裝置內建語音念出英文（iPhone Safari 也支援）。 */
export function speak(text: string, accent: Accent = 'en-US') {
  if (!canSpeak) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = accent
  utterance.rate = 0.9
  const voice = synth.getVoices().find(v => v.lang.replace('_', '-') === accent)
  if (voice) utterance.voice = voice
  synth.speak(utterance)
}

// 依名稱猜測語音的性別，讓對話聽得出是兩個人；猜不到時用音高區分
const MALE = /daniel|aaron|fred|alex|arthur|gordon|rishi|oliver|tom\b|david|mark|george|james|guy|ryan|male/i
const FEMALE = /samantha|karen|moira|tessa|victoria|susan|zira|kate|serena|martha|nicky|allison|ava|jenny|aria|hazel|sonia|libby|female/i

function pickVoice(gender: 'M' | 'W'): SpeechSynthesisVoice | undefined {
  const english = window.speechSynthesis.getVoices().filter(v => v.lang.replace('_', '-').startsWith('en'))
  const wanted = gender === 'M' ? MALE : FEMALE
  const unwanted = gender === 'M' ? FEMALE : MALE
  return english.find(v => wanted.test(v.name)) ?? english.find(v => !unwanted.test(v.name) && v.lang.replace('_', '-') === 'en-US')
}

// 保留參照，避免朗讀到一半 utterance 被回收而中斷（Safari 的已知問題）
let queue: SpeechSynthesisUtterance[] = []

/** 依序念出多句話，M / W 用不同的聲音；全部念完（或被中斷）時呼叫 onEnd */
export function speakLines(lines: { voice: 'M' | 'W'; text: string }[], rate: number, onEnd: () => void) {
  if (!canSpeak) return onEnd()
  const synth = window.speechSynthesis
  synth.cancel()
  const voices = { M: pickVoice('M'), W: pickVoice('W') }
  const sameVoice = voices.M === voices.W
  const mine = lines.map(line => {
    const u = new SpeechSynthesisUtterance(line.text)
    const voice = voices[line.voice]
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'en-US'
    u.rate = rate
    if (sameVoice) u.pitch = line.voice === 'M' ? 0.7 : 1.2
    return u
  })
  queue = mine
  const done = () => {
    // 已經被下一次播放取代時不回報
    if (queue === mine) onEnd()
  }
  mine[mine.length - 1].onend = done
  for (const u of mine) {
    u.onerror = done
    synth.speak(u)
  }
}

export function stopSpeaking() {
  queue = []
  if (canSpeak) window.speechSynthesis.cancel()
}

/** 單字看起來是英文時才顯示發音與字典連結 */
export function isEnglish(text: string) {
  return /^[a-zA-Zéè' -]+$/.test(text.trim())
}

export function cambridgeUrl(word: string) {
  const slug = word
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
  return `https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${encodeURIComponent(slug)}`
}
