import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages 網址是 https://<帳號>.github.io/life-master/，正式版要加上子路徑
  base: command === 'build' ? '/life-master/' : '/',
  // host: true 讓同一個 Wi-Fi 下的 iPhone 也能連線測試
  server: { host: true },
}))
