# 雲端功能設定（背景推播 + 夥伴房間）

App 關著也能收到待辦提醒、以及「夥伴」分頁的房間功能，都需要一個 Supabase 專案（免費方案即可）。
沒有設定時 App 照常運作，只是這兩項功能會停用。

## 1. 填入前端設定

到 Dashboard → Project Settings → API Keys，把金鑰填進專案根目錄的 `.env`：

```
VITE_SUPABASE_URL=https://<專案代號>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key 或 publishable key>
```

這兩個值本來就是公開的（權限由資料庫的 RLS 控管）。**不要**填 `service_role` / secret key。

## 2. 開啟匿名登入

Dashboard → Authentication → Sign In / Providers → 打開 **Allow anonymous sign-ins**。
每台裝置會自動取得一個匿名帳號，不需要註冊。

## 3. 建立資料表

Dashboard → SQL Editor，依序執行：

1. `supabase/schema.sql`（整段貼上）
2. `supabase/config.sql.local`（存放排程用的密鑰，這個檔案不會進版本庫）
3. `supabase/backup.sql`（雲端備份與還原碼）

## 4. 部署推播函式

```bash
npx supabase login
npx supabase functions deploy send-push --project-ref <專案代號>
npx supabase secrets set --env-file supabase/secrets.local --project-ref <專案代號>
```

`supabase/secrets.local` 裡有 Web Push 私鑰與排程密鑰，同樣不會進版本庫；換電腦時要自己帶著，
或重新產生（`npx web-push generate-vapid-keys`，並同步更新 `.env` 的公鑰與 `config.sql.local` 的密鑰）。

## 5. 重新建置並部署

```bash
npm run deploy
```

在 iPhone 上從主畫面打開 App → 設定 → 待辦通知 → 開啟通知，看到「背景推播已啟用」就完成了。

## 運作方式

- 待辦的提醒時間會同步到 `notifications` 資料表；資料庫每分鐘檢查一次，到期就呼叫 `send-push` 函式推播。
- 房間成員只看得到彼此的今日進度數字（習慣、單字、待辦完成數、閱讀題數、連續天數），看不到待辦內容。
- 雲端備份是選用功能（設定 → 資料備份）。開啟後整份資料會存到 `backups` 表，並產生一組還原碼；在新裝置輸入還原碼，備份、房間身分與提醒會一起搬過去。還原碼在資料庫只存雜湊值。
- 督促會寫入同一張 `notifications` 表並立刻推播，對同一個人 1 分鐘內只能送一次。
