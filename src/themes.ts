import { useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'

export interface Theme {
  id: string
  name: string
  mode: 'light' | 'dark'
  /** 預覽色：[背景, 主色, 主色 2] */
  swatch: [string, string, string]
}

// 顏色實際定義在 index.css，這裡只放選單用的名稱與預覽色
export const THEMES: Theme[] = [
  { id: 'classic', name: '經典靛紫', mode: 'light', swatch: ['#f1f5f9', '#6366f1', '#8b5cf6'] },
  { id: 'mint', name: '薄荷清新', mode: 'light', swatch: ['#eef7f3', '#0d9488', '#10b981'] },
  { id: 'sky', name: '晴空藍', mode: 'light', swatch: ['#eef5fc', '#0ea5e9', '#3b82f6'] },
  { id: 'sakura', name: '櫻花粉', mode: 'light', swatch: ['#fdf2f5', '#ec4899', '#f472b6'] },
  { id: 'latte', name: '奶茶暖棕', mode: 'light', swatch: ['#f6f1ea', '#b7791f', '#d69e2e'] },
  { id: 'obsidian', name: '曜石黑金', mode: 'dark', swatch: ['#0b0b0d', '#d4af37', '#a8842a'] },
  { id: 'midnight', name: '午夜星藍', mode: 'dark', swatch: ['#0a0f1e', '#818cf8', '#c084fc'] },
  { id: 'forest', name: '墨綠森林', mode: 'dark', swatch: ['#08130f', '#34d399', '#14b8a6'] },
]

/** 'auto' = 跟隨手機深淺色設定 */
export const AUTO_THEME = { light: 'classic', dark: 'midnight' }

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

/** 讀取並套用主題到 <html data-theme data-mode>，同時更新 iPhone 狀態列顏色。 */
export function useTheme() {
  const [themeId, setThemeId] = useLocalStorage<string>('lifemaster.theme', 'auto')
  const [systemDark, setSystemDark] = useState(prefersDark)

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolvedId = themeId === 'auto' ? AUTO_THEME[systemDark ? 'dark' : 'light'] : themeId
  const theme = THEMES.find(t => t.id === resolvedId) ?? THEMES[0]

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme.id
    root.dataset.mode = theme.mode
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.swatch[0])
  }, [theme])

  return { themeId, setThemeId, theme }
}
