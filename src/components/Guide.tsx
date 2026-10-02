import { useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react'

/** 截圖由 scripts/guide-shots.mjs 產生，放在 public/guide/ */
interface Page {
  title: string
  image?: string
  points: string[]
}

const PAGES: Page[] = [
  {
    title: '習慣打卡',
    image: 'habits',
    points: [
      '「今日任務」一次看到今天的單字、習慣、到期待辦還剩多少',
      '喝水可以按瓶數或半瓶記錄，運動、讀書有內建計時器',
      '每個習慣都會算連續天數，下方小圓點是最近 7 天的紀錄',
      '到「設定 → 管理習慣」可以新增習慣、改圖示顏色、設提醒時間',
    ],
  },
  {
    title: '每日單字',
    image: 'daily-words',
    points: [
      '每天第一次打開會跳出今天的 10 個單字，先想意思再翻面',
      '可以聽美式、英式發音，或連到 Cambridge 字典',
      '題庫範圍（多益、學測 7000 字）在「設定 → 每日單字」切換',
    ],
  },
  {
    title: '待辦清單',
    image: 'todos-list',
    points: [
      '上方輸入框直接新增「今天」的任務；按旁邊的設定鈕可以填完整資料',
      '依「重要 / 緊急」分成四類，最該先做的排在最上面',
      '右側小字是截止日，完成的任務會多顯示完成日',
      '左邊色條是分類顏色，預設打開「今天到期」',
    ],
  },
  {
    title: '新增任務',
    image: 'todos-add',
    points: [
      '分類有 14 種顏色，可以自己把顏色改名成「緊急」「家人」「作業」等',
      '優先級用「緊急 × 重要」矩陣選，一眼看出該先做什麼',
      '可以設全天或指定時間、提醒時間，還能寫備註',
      '編輯時可以「加到 iPhone 行事曆」，讓行事曆也提醒你',
    ],
  },
  {
    title: '月曆',
    image: 'todos-month',
    points: ['切到「月」可以看整個月的任務，顏色就是分類', '左右箭頭換月份，「今天」一鍵回到本月'],
  },
  {
    title: '點日期看當天',
    image: 'todos-day',
    points: ['點月曆上任何一天，會跳出當天的任務清單', '按右上角 ＋ 直接新增到這一天，右邊圓圈可以勾選完成'],
  },
  {
    title: '週曆與 7 天',
    image: 'todos-days',
    points: ['「週」顯示週一到週日', '「7 天」從今天往後連續 7 天，週六也看得到下週一要做什麼'],
  },
  {
    title: '學習：翻卡',
    image: 'learn-cards',
    points: [
      '學習頁上方切換翻卡、刷題、閱讀、聽力、文法、字典',
      '刷題有一般、困難、地獄三種難度：困難專挑長得像的字當選項，地獄每題只有 3 秒',
      '答對可以自動跳下一題，也能回上一題看剛才的答案',
      '多益題庫可以依金融、政府、教育等 21 個主題練習；覺得兩個選項都對時可以回報爭議，不計錯',
      '「菜單」依你的目標分數與練習強度排好一週的練習，做完自動打勾',
      '翻面後選熟練程度，會自動換下一張並安排複習',
      '可以收藏最愛、建立自己的卡組，也能新增自訂單字卡',
    ],
  },
  {
    title: '學習：閱讀',
    image: 'learn-reading',
    points: [
      '多益 Part 5～7 原創模擬題，可以整份模擬考或分題型練',
      '練習模式：每組對答案，記錄每部分與每題的作答時間並提醒超時',
      '限時模式：每組時間到自動跳題、標記超時，最後才對答案',
      '「每題配時」可以自己調各題型的秒數',
      '答錯的題目會進錯題本，生字自動收進「錯題生字」卡組',
    ],
  },
  {
    title: '學習：聽力',
    image: 'learn-listening',
    points: [
      '播放速度 0.7x～2x 自由選，練習中也能隨時調整；可以用同樣速度試聽 6 種考題語音',
      '考試模式：每段只播一次，播完開始倒數，時間到自動跳下一題，最後才對答案',
      '成績頁附逐字稿與解析，點虛線單字可以查意思',
    ],
  },
  {
    title: '統計',
    image: 'stats',
    points: ['看連續天數、本月打卡次數、學過的單字', '本週回顧和上週比較，還有成就徽章', '「分享本月學習報告」可以產生圖片分享給朋友'],
  },
  {
    title: '夥伴與設定',
    points: [
      '夥伴：建立房間邀請朋友，互相看打卡進度、設定每週目標、督促對方',
      '設定 → 通知：開啟後 App 關著也會收到待辦與習慣提醒（iPhone 要先加入主畫面）',
      '設定 → 帳號：用 Email 註冊後，手機、平板登入同一個帳號就會自動同步',
      '設定 → 資料備份：開啟雲端備份或匯出檔案，換手機資料才不會遺失',
      '設定 → 主題配色、App 圖示、發音口音、我的考試倒數都能自己調',
    ],
  },
]

function Viewer({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const page = PAGES[index]
  const go = (i: number) => setIndex(Math.max(0, Math.min(PAGES.length - 1, i)))

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="flex items-center gap-2 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
        <p className="flex-1 font-semibold text-fg">
          使用指南
          <span className="ml-2 text-sm font-normal text-faint tabular-nums">
            {index + 1}/{PAGES.length}
          </span>
        </p>
        <button onClick={onClose} className="rounded-full p-2 text-muted hover:bg-surface" aria-label="關閉指南">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex gap-1 px-4">
        {PAGES.map((p, i) => (
          <button
            key={p.title}
            onClick={() => go(i)}
            className={`h-1 flex-1 rounded-full ${i <= index ? 'bg-primary' : 'bg-surface-2'}`}
            aria-label={p.title}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h2 className="text-2xl font-bold text-fg">{page.title}</h2>
        {page.image && (
          <img
            key={page.image}
            src={`${import.meta.env.BASE_URL}guide/${page.image}.jpg`}
            alt={page.title}
            className="mx-auto mt-4 max-h-[48dvh] rounded-2xl shadow-lg ring-1 ring-line"
          />
        )}
        <ul className="mt-5 space-y-2.5">
          {page.points.map(point => (
            <li key={point} className="flex gap-2.5 text-[15px] leading-relaxed text-fg">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="flex items-center justify-center gap-1 rounded-2xl bg-surface px-5 py-3 text-sm text-muted shadow-sm disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> 上一頁
        </button>
        <button
          onClick={() => (index === PAGES.length - 1 ? onClose() : go(index + 1))}
          className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-primary py-3 font-semibold text-on-primary"
        >
          {index === PAGES.length - 1 ? '開始使用' : '下一頁'} <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/** 設定頁的入口 */
export default function Guide() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl bg-primary-soft p-3 text-left text-primary-ink transition active:scale-[0.99]"
      >
        <BookOpen className="h-6 w-6 shrink-0" />
        <span className="flex-1">
          <span className="block font-semibold">打開使用指南</span>
          <span className="block text-xs opacity-80">{PAGES.length} 頁圖文介紹，看完就會用所有功能</span>
        </span>
        <ChevronRight className="h-5 w-5" />
      </button>
      {open && <Viewer onClose={() => setOpen(false)} />}
    </>
  )
}
