/** 分享圖片：月報與成就卡。用 canvas 畫，顏色跟著目前的主題。 */

const FONT = '-apple-system, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif'
const font = (size: number, weight = 400) => `${weight} ${size}px ${FONT}`

function themeColors() {
  const css = getComputedStyle(document.documentElement)
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  return { primary: get('--primary', '#6366f1'), primary2: get('--primary-2', '#8b5cf6') }
}

/** 圓角矩形路徑（iOS 16 以前沒有 ctx.roundRect） */
function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** 主題色漸層背景，加上兩團柔光與底部壓暗，看起來比較有層次 */
function background(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const { primary, primary2 } = themeColors()
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, primary)
  bg.addColorStop(1, primary2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  for (const [x, y, r, a] of [
    [w * 0.9, h * 0.08, w * 0.55, 0.28],
    [w * 0.05, h * 0.55, w * 0.5, 0.14],
  ]) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r)
    glow.addColorStop(0, `rgba(255,255,255,${a})`)
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)
  }
  const shade = ctx.createLinearGradient(0, h * 0.55, 0, h)
  shade.addColorStop(0, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, w, h)
  return primary
}

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  opts: { weight?: number; color?: string; alpha?: number; align?: CanvasTextAlign } = {},
) {
  ctx.save()
  ctx.font = font(size, opts.weight ?? 400)
  ctx.fillStyle = opts.color ?? '#ffffff'
  ctx.globalAlpha = opts.alpha ?? 1
  ctx.textAlign = opts.align ?? 'left'
  ctx.fillText(value, x, y)
  ctx.restore()
}

const toBlob = (canvas: HTMLCanvasElement) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))

export interface ReportData {
  year: number
  month: number
  /** 這個月每天完成的習慣比例 0–1（index 0 = 1 號） */
  daily: number[]
  streak: number
  checkins: number
  stats: { emoji: string; label: string; value: string }[]
  badges: string[]
  badgeTotal: number
}

/** 月報（1080×1920，適合 IG 限動） */
export async function drawReport(d: ReportData): Promise<Blob | null> {
  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const primary = background(ctx, W, H)
  const M = 80

  text(ctx, 'LIFEMASTER・月報', M, 150, 34, { weight: 600, alpha: 0.75 })
  text(ctx, `${d.year} 年 ${d.month} 月`, M, 262, 104, { weight: 800 })

  // 主卡：連續天數 + 本月打卡
  rounded(ctx, M, 330, W - M * 2, 330, 48)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  text(ctx, '🔥 目前連續', M + 56, 420, 38, { weight: 600, color: '#64748b' })
  text(ctx, `${d.streak}`, M + 56, 590, 160, { weight: 800, color: primary })
  ctx.font = font(160, 800)
  text(ctx, '天', M + 56 + ctx.measureText(`${d.streak}`).width + 16, 590, 52, { weight: 700, color: '#0f172a' })
  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(W / 2 + 40, 390, 3, 210)
  text(ctx, '✅ 本月打卡', W / 2 + 90, 420, 38, { weight: 600, color: '#64748b' })
  text(ctx, `${d.checkins}`, W / 2 + 90, 590, 120, { weight: 800, color: '#0f172a' })
  ctx.font = font(120, 800)
  text(ctx, '次', W / 2 + 90 + ctx.measureText(`${d.checkins}`).width + 14, 590, 44, { weight: 700, color: '#0f172a' })

  // 每日打卡熱度
  const top = 710
  rounded(ctx, M, top, W - M * 2, 600, 48)
  ctx.fillStyle = 'rgba(255,255,255,0.14)'
  ctx.fill()
  text(ctx, '每日打卡', M + 48, top + 80, 40, { weight: 700 })
  const first = (new Date(d.year, d.month - 1, 1).getDay() + 6) % 7
  const cell = 104
  const gap = 18
  const gridX = M + 48
  ;['一', '二', '三', '四', '五', '六', '日'].forEach((w, i) =>
    text(ctx, w, gridX + i * (cell + gap) + cell / 2, top + 140, 28, { alpha: 0.7, align: 'center' }),
  )
  d.daily.forEach((ratio, i) => {
    const pos = first + i
    const x = gridX + (pos % 7) * (cell + gap)
    const y = top + 165 + Math.floor(pos / 7) * (cell * 0.5 + 16)
    rounded(ctx, x, y, cell, cell * 0.5, 16)
    ctx.fillStyle = ratio > 0 ? `rgba(255,255,255,${0.3 + ratio * 0.7})` : 'rgba(255,255,255,0.1)'
    ctx.fill()
    text(ctx, String(i + 1), x + cell / 2, y + (cell * 0.5) / 2 + 10, 28, {
      weight: 600,
      color: ratio > 0.5 ? primary : '#ffffff',
      align: 'center',
      alpha: ratio > 0 ? 1 : 0.6,
    })
  })

  // 四個數字
  const tileTop = 1350
  const tileW = (W - M * 2 - 30) / 2
  d.stats.slice(0, 4).forEach((s, i) => {
    const x = M + (i % 2) * (tileW + 30)
    const y = tileTop + Math.floor(i / 2) * 200
    rounded(ctx, x, y, tileW, 170, 40)
    ctx.fillStyle = 'rgba(255,255,255,0.16)'
    ctx.fill()
    text(ctx, `${s.emoji} ${s.label}`, x + 40, y + 62, 32, { weight: 600, alpha: 0.85 })
    text(ctx, s.value, x + 40, y + 140, 64, { weight: 800 })
  })

  // 成就
  const by = 1810
  text(ctx, `🏅 成就 ${d.badges.length} / ${d.badgeTotal}`, M, by, 36, { weight: 700 })
  d.badges.slice(-6).forEach((emoji, i) => {
    const x = W - M - 60 - i * 110
    ctx.beginPath()
    ctx.arc(x, by - 12, 46, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fill()
    text(ctx, emoji, x, by + 4, 48, { align: 'center' })
  })

  text(ctx, '習慣打卡・待辦・英文練習｜LifeMaster', W / 2, H - 34, 28, { alpha: 0.7, align: 'center' })
  return toBlob(canvas)
}

/** 成就卡（1080×1350） */
export async function drawBadge(b: { emoji: string; name: string; desc: string; date: string }): Promise<Blob | null> {
  const W = 1080
  const H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  background(ctx, W, H)

  text(ctx, 'ACHIEVEMENT UNLOCKED', W / 2, 170, 38, { weight: 700, alpha: 0.8, align: 'center' })
  text(ctx, '達成新成就！', W / 2, 260, 72, { weight: 800, align: 'center' })

  // 金色獎牌
  const cx = W / 2
  const cy = 600
  for (const [r, a] of [
    [330, 0.08],
    [280, 0.12],
  ]) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${a})`
    ctx.fill()
  }
  const gold = ctx.createLinearGradient(cx - 220, cy - 220, cx + 220, cy + 220)
  gold.addColorStop(0, '#fde68a')
  gold.addColorStop(0.5, '#f59e0b')
  gold.addColorStop(1, '#b45309')
  ctx.beginPath()
  ctx.arc(cx, cy, 220, 0, Math.PI * 2)
  ctx.fillStyle = gold
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, 180, 0, Math.PI * 2)
  ctx.fillStyle = '#fffbeb'
  ctx.fill()
  text(ctx, b.emoji, cx, cy + 70, 200, { align: 'center' })

  text(ctx, b.name, W / 2, 970, 96, { weight: 800, align: 'center' })
  text(ctx, b.desc, W / 2, 1050, 44, { weight: 500, alpha: 0.9, align: 'center' })
  text(ctx, b.date, W / 2, 1120, 34, { alpha: 0.7, align: 'center' })
  text(ctx, 'LifeMaster', W / 2, H - 60, 32, { weight: 700, alpha: 0.75, align: 'center' })
  return toBlob(canvas)
}

/** 用系統分享（iPhone 可存到相簿、傳 IG）；不支援時下載圖片 */
export async function shareImage(blob: Blob, filename: string, message: string) {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], text: message }).catch(() => {})
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
