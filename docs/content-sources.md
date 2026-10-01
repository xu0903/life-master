# 內容來源與使用條款紀錄

LifeMaster 使用的每一項外部資料、AI 產出與第三方服務，以及當初查到的使用條款。
商店審核、被檢舉或要開始營利時，以這份表為依據，並重新確認條款是否改版。

- 查證日期：2026-10-01（條款可能改版，引用前請回原網址確認）
- 本表不是法律意見；要商業化時，以對方的書面回覆或律師意見為準。

## 總表

| # | 來源 | App 裡用在哪 | 權利人 | 條款重點（原文節錄） | 目前狀態 | 營利 / 上架前要做的事 |
|---|---|---|---|---|---|---|
| 1 | 大考中心《高中英文參考詞彙表》（111 學年度起適用） | 學測 7000 單的「單字與級別」 | 財團法人大學入學考試中心基金會 | 「著作權屬財團法人大學入學考試中心基金會所有，僅供非營利目的使用，轉載請註明出處。若作為營利目的使用，應事前經由財團法人大學入學考試中心基金會書面同意授權。」（PDF 封面） | ✅ 非營利使用，已在設定頁「每日單字」與 README 註明出處 | 收費、廣告、內購前，寄信取得**書面授權** |
| 2 | LTTC 全民英檢參考字表（初級、中級、中高級） | 英檢字表的「單字與級別」 | 財團法人語言訓練測驗中心 | 「The copyright of the content published by the Website is owned by The Language Training & Testing Center. Without the consent or authorization of the Center, no one shall reproduce, repost, spread, quote, alter, broadcast, or publish the entire or partial content…」（網站聲明頁） | ⛔ **明文禁止未經同意重製或公開**，公開版暫不收錄英檢字表 | 寄信申請授權；取得**書面同意**後才上線 |
| 3 | OpenAI 文字轉語音（gpt-4o-mini-tts） | 聽力題的語音檔 `public/audio/` | 產出歸使用者 | 條款：使用者擁有 Output，OpenAI 將其對 Output 的權利讓與使用者。TTS 指南：須 “provide a clear disclosure to end users that the TTS voice they are hearing is AI-generated and not a human voice.” | ✅ 已在聽力頁標示「語音為 AI 合成，非真人錄音」 | 維持標示；商店說明文字也寫明 |
| 4 | OpenAI 文字生成（gpt-4.1-mini） | 學測 / 英檢單字的中文解釋、英英解釋、例句 | 產出歸使用者 | 同上：使用者擁有 Output | ✅ 設定頁註明「中文解釋與例句為本 App 另行編寫」；未使用官方字表的中文解釋 | AI 產出可能有錯，App 內保留「內容可能有誤」說明 |
| 5 | ChatGPT 影像生成 | App 圖示（`design/icon-sheet.png` 切出的 9 張） | 產出歸使用者 | OpenAI 條款：使用者擁有 Output（含 ChatGPT 生成的圖片） | ✅ 可使用 | 純 AI 生成的圖可能無法取得著作權保護，別人可能做出相似圖示；若要註冊商標需另行設計 |
| 6 | Claude（Anthropic）協助撰寫的原創內容 | 閱讀模擬題 3 份、聽力題 2 份、文法 20 單元、多益單字題庫、程式碼 | 產出歸使用者 | Anthropic 消費者條款（2025-10-08 起）：「Subject to your compliance with our Terms, we assign to you all of our right, title, and interest—if any—in Outputs.」 | ✅ 題目為原創，未抄錄 ETS 官方試題 | 條款也提醒輸出可能不正確，題目與解析需持續校對 |
| 7 | TOEIC® 商標（ETS） | 「多益」「TOEIC」字樣出現在介面與說明 | Educational Testing Service | ETS 商標指南：第一次出現加註 ®；須附聲明 “TOEIC® is a registered trademark of ETS. This product is not endorsed or approved by ETS.”；**不得用於公司名、產品名、網域名稱、社群帳號**；未經同意不得翻譯或音譯 | ✅ 已在設定頁「來源與授權」加上聲明 | App 名稱、商店名稱、圖示**不可**放 TOEIC / 多益；只在說明裡描述用途 |
| 8 | GitHub Pages | 網站主機 | GitHub | 不得用於「主要在促成商業交易」的網站或商業 SaaS；建議網站 1 GB 以內、每月約 100 GB 流量軟上限 | ✅ 目前免費、非商業 | 開始收費或內購時改用其他主機 |
| 9 | Supabase（免費方案） | 雲端備份、推播排程、夥伴房間 | Supabase | 本次未逐條查證 | ⚠️ 待查 | 上架前查閱 Supabase Terms / AUP 與免費方案限制，並寫入隱私權政策 |
| 10 | 開源套件 | React、lucide-react、supabase-js、Workbox 等 | 各作者 | 執行時期套件為 MIT / ISC 等寬鬆授權；建置工具含 MPL-2.0（lightningcss，未隨 App 發佈） | ✅ 可使用 | 上架版在「關於」頁附開源授權清單 |
| 11 | 劍橋字典連結、裝置內建語音 | 單字卡的字典按鈕、未預錄的朗讀 | 各權利人 | 只提供連結或呼叫裝置功能，未複製內容 | ✅ 無需授權 | — |

## 需要寄出的授權申請

### LTTC 全民英檢字表（上線前必須取得）

> 主旨：申請於免費英語學習 App 使用全民英檢參考字表
>
> 您好，我是開發 LifeMaster（免費的英語學習與習慣打卡網頁 App，網址：https://xu0903.github.io/life-master/）的個人開發者。
> 想申請在 App 中使用貴中心公告的全民英檢參考字表中的「單字與級別」，讓學習者依初級、中級、中高級選擇每日練習的單字。
> 使用方式：不收錄貴中心的中文解釋，解釋與例句為本 App 自行編寫；App 內會註明「單字級別參考 LTTC 全民英檢參考字表」並附上貴中心網址；App 目前不收費、無廣告。
> 若需要其他資料或有使用上的條件，敬請告知。謝謝！

### 大考中心詞彙表（開始營利前取得）

依封面聲明，營利使用需事先取得書面同意。內容可比照上面的信件，說明營利模式（例如訂閱、廣告）後提出申請。

## 參考網址

- 大考中心 高中英文參考詞彙表：https://www.ceec.edu.tw/SourceUse/ce37/ce37.htm
- LTTC 全民英檢參考字表：https://www.lttc.ntu.edu.tw/en/vocabulary
- LTTC 網站聲明：https://www.lttc.ntu.edu.tw/en/disclaimer
- OpenAI Terms of Use：https://openai.com/policies/row-terms-of-use/
- OpenAI 文字轉語音指南（AI 語音揭露）：https://developers.openai.com/api/docs/guides/text-to-speech
- Anthropic Consumer Terms：https://www.anthropic.com/legal/consumer-terms
- ETS 商標使用指南：https://www.ets.org/legal/trademarks.html
- GitHub Pages 使用限制：https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
