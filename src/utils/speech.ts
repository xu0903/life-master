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
