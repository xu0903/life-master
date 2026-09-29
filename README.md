# LifeMaster

手機優先的生活管理 PWA：習慣打卡、待辦清單、多益單字卡。可加到 iPhone 主畫面、離線使用。

## 功能

- **習慣打卡**：自訂習慣（圖示、顏色、順序），顯示連續天數 🔥
- **每日多益 10 字**：507 字題庫分 600 / 800 / 900 三級，含 KK 音標、英英解釋、同反義詞、例句與美式 / 英式發音；答錯的字以間隔重複（Leitner 盒子）安排複習，完成後自動打卡
- **待辦清單**：優先級、分類、截止日、逾期提醒、今日完成進度
- **單字卡**：自訂題目、翻牌測驗、依多益 / 自訂 / 不熟篩選
- **統計**：每月打卡熱力圖、各習慣完成率、單字學習曲線
- **主題**：5 款清新淺色、3 款高級深色，或跟隨系統
- **備份**：匯出 / 匯入 JSON

資料全部存在瀏覽器的 localStorage，不會上傳到任何伺服器。

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 輸出到 dist/
npm run deploy   # 建置並發佈到 GitHub Pages（gh-pages 分支）
```

PWA 圖示由 `public/logo.svg` 產生：`npx pwa-assets-generator`
