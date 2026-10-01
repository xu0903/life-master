/** App 版本：每次發佈新功能時把 package.json 的 version 加一，並在下面寫這一版的更新內容 */
export const APP_VERSION: string = __APP_VERSION__
/** 建置時間（ISO 字串） */
export const BUILD_TIME: string = __BUILD_TIME__

export const CHANGELOG: Record<string, string[]> = {
  '1.2.0': ['聽力語音全部重新錄製：對話會參考上一句的內容接話，語氣更自然', '停頓依情境調整：問完題目停久一點，對話換人時接得比較快'],
  '1.1.0': [
    '多益單字依主題分類練習（金融、政府、教育…共 21 類），字典也能依主題瀏覽',
    '避免兩個選項都對的爭議題；答錯時可以回報「我選的也對」，不計錯',
    '聽力播放中改速度會立刻生效；試聽排成左女右男、美澳英',
    '翻卡發音新增澳洲口音',
    '深色主題重新配色',
    '設定頁顯示版本號，更新後會跳出通知',
  ],
}

export function formatBuildTime(iso = BUILD_TIME): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
