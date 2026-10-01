export type Accent = 'en-US' | 'en-GB' | 'en-AU'

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

/** 用裝置內建語音念出英文（iPhone Safari 也支援）。 */
export function speak(text: string, accent: Accent = 'en-US') {
  if (!canSpeak) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = accent
  utterance.rate = 0.9
  const voice = englishVoices().find(v => v.lang.replace('_', '-') === accent)
  if (voice) utterance.voice = voice
  synth.speak(utterance)
}

// 依名稱猜測語音的性別，讓對話聽得出是兩個人；猜不到時用音高區分
const MALE = /daniel|aaron|fred|alex|arthur|gordon|rishi|oliver|tom\b|david|mark|george|james|guy|ryan|male/i
const FEMALE = /samantha|karen|moira|tessa|victoria|susan|zira|kate|serena|martha|nicky|allison|ava|jenny|aria|hazel|sonia|libby|female/i

/**
 * iPhone / Mac 內建的趣味語音（Good News 會用唱的、Bubbles 有泡泡聲…）和 Eloquence 機器人聲，
 * 念英文單字很怪，直接從清單拿掉
 */
const NOVELTY =
  /novelty|eloquence|\b(good news|bad news|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|bahh|junior|ralph|kathy|fred|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley)\b/i

/** 語音品質分數：神經網路 / 高品質語音聽起來自然很多 */
export function voiceScore(v: SpeechSynthesisVoice): number {
  let score = 0
  if (/natural|neural|premium/i.test(v.name)) score += 6
  if (/enhanced|online/i.test(v.name)) score += 4
  if (/google/i.test(v.name)) score += 3
  if (/compact/i.test(v.name)) score -= 10
  if (v.lang.replace('_', '-') === 'en-US') score += 1
  return score
}

/** 這台裝置上的英文語音，品質好的排前面 */
export function englishVoices(): SpeechSynthesisVoice[] {
  if (!canSpeak) return []
  return window.speechSynthesis
    .getVoices()
    .filter(v => v.lang.replace('_', '-').startsWith('en') && !NOVELTY.test(v.name) && !NOVELTY.test(v.voiceURI))
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name))
}

/** 使用者在聽力設定裡指定的語音（voiceURI） */
export type VoiceChoice = Partial<Record<'M' | 'W', string>>

function pickVoice(gender: 'M' | 'W', choice: VoiceChoice = {}): SpeechSynthesisVoice | undefined {
  const english = englishVoices()
  const chosen = choice[gender] && english.find(v => v.voiceURI === choice[gender])
  if (chosen) return chosen
  const wanted = gender === 'M' ? MALE : FEMALE
  const unwanted = gender === 'M' ? FEMALE : MALE
  // 已依品質排序，先找看得出性別的，再找不像另一性別的
  return english.find(v => wanted.test(v.name)) ?? english.find(v => !unwanted.test(v.name))
}

// 保留參照，避免朗讀到一半 utterance 被回收而中斷（Safari 的已知問題）
let queue: SpeechSynthesisUtterance[] = []

/** 依序念出多句話，M / W 用不同的聲音；全部念完（或被中斷）時呼叫 onEnd */
export function speakLines(lines: { voice: 'M' | 'W'; text: string }[], rate: number, onEnd: () => void, choice: VoiceChoice = {}) {
  if (!canSpeak) return onEnd()
  const synth = window.speechSynthesis
  synth.cancel()
  const voices = { M: pickVoice('M', choice), W: pickVoice('W', choice) }
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
  const slug = word.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')
  return `https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${encodeURIComponent(slug)}`
}
