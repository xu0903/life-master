import { useLocalStorage } from './useLocalStorage'
import type { Accent } from '../utils/speech'

/** 翻卡朗讀：每次翻卡 / 只有第一次翻開 / 不朗讀 */
export type AutoSpeak = 'every' | 'first' | 'off'

export interface SpeechSettings {
  accent: Accent
  autoSpeak: AutoSpeak
}

export function useSpeechSettings() {
  return useLocalStorage<SpeechSettings>('lifemaster.speech', { accent: 'en-US', autoSpeak: 'first' })
}
