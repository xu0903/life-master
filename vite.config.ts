import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

const buildTime = new Date().toISOString()

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // 版本號與建置時間顯示在設定頁，更新後會跳出通知
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  plugins: [
    // 建置時輸出 version.json：設定頁「檢查更新」直接比對版本號，不用等離線快取慢慢下載才知道有新版
    {
      name: 'version-json',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: pkg.version, build: buildTime }) })
      },
    },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // 在 main.tsx 用 virtual:pwa-register 自己註冊，才會在新版裝好時自動重新載入
      injectRegister: false,
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
        // 單字資料很大（好幾 MB），不放進每次更新都要重新下載的預先快取，第一次用到時再存起來（檔名有雜湊，內容變了檔名就會變）
        globIgnores: ['icons/**', 'assets/vocab-*.js', 'assets/toeic-extra-*.js', 'assets/toeic-core-topics-*.js', 'assets/advanced-*.js'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(vocab|toeic-extra|toeic-core-topics|advanced)-[\w-]+\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'word-data', expiration: { maxEntries: 20 } },
          },
        ],
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
