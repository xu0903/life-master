// 產生「使用指南」用的 App 截圖：用電腦上的 Edge 開啟本機 dev server，塞入示範資料後逐頁截圖。
// 用法：先 `npx vite --port 5199`，再 `node scripts/guide-shots.mjs`，輸出到 public/guide/
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

const URL = process.env.GUIDE_URL ?? 'http://localhost:5199/'
const OUT = 'public/guide'
mkdirSync(OUT, { recursive: true })

const key = d => {
  const t = new Date()
  t.setDate(t.getDate() + d)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
const today = key(0)
const todo = (id, text, category, priority, due, extra = {}) => ({ id, text, category, priority, done: false, createdDate: key(-3), dueDate: due, remind: 'none', ...extra })

const demo = {
  'lifemaster.todos': [
    todo('t1', '交英文作業', 'sage', 'q1', today, { dueTime: '23:59' }),
    todo('t2', '背 20 個多益單字', 'azure', 'q2', today),
    todo('t3', '回覆教授 email', 'rose', 'q3', today, { dueTime: '12:00' }),
    todo('t4', '整理書桌', 'slate', 'q4', today),
    todo('t5', '家庭聚餐', 'plum', 'q2', key(2), { dueTime: '18:30' }),
    todo('t6', '多益模擬考', 'azure', 'q1', key(5), { remind: 'morning' }),
    todo('t7', '小組報告', 'sage', 'q1', key(1), { dueTime: '10:00' }),
    todo('t8', '繳電話費', 'marigold', 'q3', key(-1)),
    todo('t9', '買牛奶', 'jade', 'q4', key(0), { done: true, completedDate: today }),
  ],
  'lifemaster.todoTagNames': { rose: '緊急', azure: '工作', sage: '作業', plum: '家人', marigold: '帳單', jade: '生活' },
  'lifemaster.todoView': 'list',
}

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light', locale: 'zh-TW' })
await context.addInitScript(data => {
  if (sessionStorage.getItem('guide-seeded')) return
  sessionStorage.setItem('guide-seeded', '1')
  for (const [k, v] of Object.entries(data)) localStorage.setItem(k, JSON.stringify(v))
}, demo)
const page = await context.newPage()
page.on('pageerror', e => console.error('page error:', e.message))
await page.goto(URL)
await page.waitForTimeout(1500)

const shot = async name => {
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 72 })
  console.log('saved', name)
}
const tab = async label => {
  await page.locator('nav button', { hasText: label }).dispatchEvent('click')
  await page.evaluate(() => window.scrollTo(0, 0))
}
const learn = async mode => {
  await page.evaluate(m => localStorage.setItem('lifemaster.learnMode', JSON.stringify(m)), mode)
  await page.reload()
  await page.waitForTimeout(1200)
  await tab('學習')
}

// 每天第一次打開會跳出每日單字
await shot('daily-words')
await page.getByRole('button', { name: '關閉', exact: true }).first().click()
await tab('習慣打卡')
await shot('habits')

await tab('待辦清單')
await page.evaluate(() => window.scrollTo(0, 380))
await shot('todos-list')
await page.getByRole('button', { name: '月', exact: true }).click()
await page.evaluate(() => window.scrollTo(0, 380))
await shot('todos-month')
await page.locator('button', { hasText: new RegExp(`^${new Date().getDate()}`) }).first().click()
await shot('todos-day')
await page.getByRole('button', { name: '新增任務' }).last().click()
await page.getByText('優先級', { exact: true }).click()
await shot('todos-add')
await page.getByRole('button', { name: '關閉', exact: true }).first().click()
await page.mouse.click(195, 60)
await page.getByRole('button', { name: '7 天', exact: true }).click()
await page.evaluate(() => window.scrollTo(0, 380))
await shot('todos-days')
await page.getByRole('button', { name: '列表', exact: true }).click()

await learn('flip')
await shot('learn-cards')
await learn('reading')
await shot('learn-reading')
await learn('listening')
await shot('learn-listening')

await tab('統計')
await shot('stats')

await browser.close()
