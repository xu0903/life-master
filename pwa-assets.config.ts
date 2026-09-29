import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// 由 public/logo.svg 產生 PWA 圖示：npx pwa-assets-generator
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#6366f1' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#6366f1' } },
  },
  images: ['public/logo.svg'],
})
