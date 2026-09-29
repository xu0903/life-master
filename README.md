# LifeMaster

手機優先的生活管理 App：習慣打卡、待辦清單、多益單字卡。

## 功能

- **習慣打卡**：喝水、運動、讀書、背單字，顯示連續天數 🔥
- **每日多益 10 字**：每天自動抽題，含 KK 音標、英英解釋、同反義詞、例句與美式 / 英式發音，完成後自動打卡
- **待辦清單**：優先級、分類、今日完成進度
- **單字卡**：自訂題目、翻牌測驗、隨機抽題

資料全部存在瀏覽器的 localStorage，不會上傳到任何伺服器。

## 開發

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # 輸出到 dist/
```

推送到 `main` 後，GitHub Actions 會自動部署到 GitHub Pages。
