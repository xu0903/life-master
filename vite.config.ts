import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'LifeMaster',
        short_name: 'LifeMaster',
        description: '習慣打卡、待辦清單、多益單字卡',
        lang: 'zh-Hant',
        theme_color: '#6366f1',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // 9 款可選圖示只在設定頁用到，不必全部預先快取
        globIgnores: ['icons/**'],
        // 點通知時打開 App
        importScripts: ['sw-notify.js'],
      },
    }),
  ],
  // GitHub Pages 網址是 https://<帳號>.github.io/life-master/，正式版要加上子路徑
  base: command === 'build' ? '/life-master/' : '/',
  // host: true 讓同一個 Wi-Fi 下的 iPhone 也能連線測試
  server: { host: true },
}))
