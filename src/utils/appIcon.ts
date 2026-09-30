export const APP_ICON_KEY = 'lifemaster.appIcon'
/** 預設圖示（草丘新芽）；固定的 PWA 圖示檔也是這一張 */
export const DEFAULT_APP_ICON = 8

// 圖檔由 scripts/split-icons.mjs 從 design/icon-sheet.png 切出來，放在 public/icons/
export const APP_ICONS: { id: number; name: string }[] = [
  { id: 1, name: '晨霧新芽' },
  { id: 2, name: '圓葉' },
  { id: 3, name: '藍天嫩葉' },
  { id: 4, name: '日出' },
  { id: 5, name: '森林小徑' },
  { id: 6, name: '成長圓環' },
  { id: 7, name: '月光小路' },
  { id: 8, name: '草丘新芽' },
  { id: 9, name: '星光' },
]

export function appIconUrl(id: number, size: 180 | 192 = 192) {
  return `${import.meta.env.BASE_URL}icons/icon-${id}-${size}.png`
}

/** 把網頁的圖示換成選的那一個；之後再「加入主畫面」就會用這張 */
export function applyAppIcon(id: number) {
  const icon = APP_ICONS.some(i => i.id === id) ? id : DEFAULT_APP_ICON
  document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')?.setAttribute('href', appIconUrl(icon, 180))
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach(link => link.setAttribute('href', appIconUrl(icon, 192)))
}
