// 把九宮格圖示（design/icon-sheet.png）切成 9 個 App 圖示，輸出到 public/icons/，
// 並用預設的那一個覆蓋 PWA 的固定圖示檔。執行：node scripts/split-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const SHEET = 'design/icon-sheet.png'
/** 預設圖示：第 8 格（中下） */
const DEFAULT_ICON = 8
const SIZES = [192, 180]

const { data, info } = await sharp(SHEET).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const at = (x, y) => (y * W + x) * 3
const bg = [data[at(8, 8)], data[at(8, 8) + 1], data[at(8, 8) + 2]]
const differs = (x, y) => {
  const i = at(x, y)
  return Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 10
}

/** 找出一整排裡「不是背景」的連續區段，也就是每一格圖示的範圍 */
function runs(length, isFilled) {
  const out = []
  let start = -1
  for (let i = 0; i <= length; i++) {
    const filled = i < length && isFilled(i)
    if (filled && start < 0) start = i
    if (!filled && start >= 0) {
      if (i - start > 40) out.push([start, i - 1])
      start = -1
    }
  }
  return out
}
const count = (n, test) => Array.from({ length: n }, (_, i) => i).filter(test).length
const cols = runs(W, x => count(H, y => differs(x, y)) > H * 0.05)
const rows = runs(H, y => count(W, x => differs(x, y)) > W * 0.05)
if (cols.length !== 3 || rows.length !== 3) throw new Error(`找不到 3×3 的格子（cols ${cols.length}, rows ${rows.length}）`)

/**
 * 圖示在圖上已經是圓角方塊，但手機會自己再裁一次圓角，所以要輸出「填滿的正方形」：
 * 把四個角落圓角以外的區域，用圓角邊緣往內一點的顏色補起來。
 */
function fillCorners(buf, size) {
  const r = Math.round(size * 0.26)
  const get = (x, y) => (y * size + x) * 3
  const out = Buffer.from(buf)
  for (const [cx, cy, sx, sy] of [
    [r, r, -1, -1],
    [size - 1 - r, r, 1, -1],
    [r, size - 1 - r, -1, 1],
    [size - 1 - r, size - 1 - r, 1, 1],
  ]) {
    for (let dy = 0; dy <= r; dy++) {
      for (let dx = 0; dx <= r; dx++) {
        const d = Math.hypot(dx, dy)
        if (d <= r - 6) continue
        const x = cx + sx * dx
        const y = cy + sy * dy
        const k = (r - 8) / d
        const src = get(Math.round(cx + sx * dx * k), Math.round(cy + sy * dy * k))
        buf.copy(out, get(x, y), src, src + 3)
      }
    }
  }
  return out
}

mkdirSync('public/icons', { recursive: true })
let n = 0
for (const [top, bottom] of rows) {
  for (const [left, right] of cols) {
    n++
    // 取正方形並往內縮幾個像素，避開邊緣的陰影與反鋸齒
    const size = Math.min(right - left, bottom - top) - 8
    const x = Math.round((left + right) / 2 - size / 2)
    const y = Math.round((top + bottom) / 2 - size / 2)
    const tile = await sharp(SHEET).removeAlpha().extract({ left: x, top: y, width: size, height: size }).raw().toBuffer()
    const square = sharp(fillCorners(tile, size), { raw: { width: size, height: size, channels: 3 } })
    for (const s of SIZES) await square.clone().resize(s, s).png().toFile(`public/icons/icon-${n}-${s}.png`)

    if (n === DEFAULT_ICON) {
      await square.clone().resize(512, 512).png().toFile('public/pwa-512x512.png')
      await square.clone().resize(512, 512).png().toFile('public/maskable-icon-512x512.png')
      await square.clone().resize(192, 192).png().toFile('public/pwa-192x192.png')
      await square.clone().resize(180, 180).png().toFile('public/apple-touch-icon-180x180.png')
      await square.clone().resize(64, 64).png().toFile('public/pwa-64x64.png')
      // favicon.ico：ICO 容器裡放一張 48×48 的 PNG
      const png = await square.clone().resize(48, 48).png().toBuffer()
      const header = Buffer.alloc(22)
      header.writeUInt16LE(1, 2) // 類型：圖示
      header.writeUInt16LE(1, 4) // 張數
      header[6] = 48
      header[7] = 48
      header.writeUInt16LE(1, 10) // 色彩平面
      header.writeUInt16LE(32, 12) // 位元深度
      header.writeUInt32LE(png.length, 14)
      header.writeUInt32LE(22, 18) // PNG 資料的起始位置
      writeFileSync('public/favicon.ico', Buffer.concat([header, png]))
    }
  }
}
console.log(`已輸出 ${n} 個圖示到 public/icons/，預設圖示為第 ${DEFAULT_ICON} 個`)
