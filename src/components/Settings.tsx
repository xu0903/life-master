import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { ArrowDown, ArrowUp, Check, Download, Monitor, Pencil, Plus, Share, Trash2, Upload, X } from 'lucide-react'
import { HABIT_COLORS, HABIT_ICONS, VOCAB_HABIT, habitColor, habitIcon } from '../data/habits'
import type { Habit } from '../data/habits'
import { LEVELS, WORD_INFO } from '../data/toeicWords'
import { useWordLevel } from '../hooks/useDailyWords'
import { useHabits } from '../hooks/useHabits'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { THEMES } from '../themes'
import { downloadBackup, restoreBackup } from '../utils/backup'
import { diffDays, toDateKey } from '../utils/date'

function Section({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-sm">
      <h2 className="font-semibold text-fg">{title}</h2>
      {desc && <p className="mt-0.5 text-xs text-muted">{desc}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function ThemePicker({ themeId, onChange }: { themeId: string; onChange: (id: string) => void }) {
  const option = (id: string, name: string, preview: ReactNode) => (
    <button
      key={id}
      onClick={() => onChange(id)}
      className={`relative flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs transition ${
        themeId === id ? 'bg-primary-soft font-semibold text-primary ring-2 ring-primary' : 'text-muted hover:bg-surface-2'
      }`}
    >
      {preview}
      {name}
      {themeId === id && <Check className="absolute top-1 right-1 h-3.5 w-3.5" />}
    </button>
  )

  return (
    <div className="space-y-3">
      {(['light', 'dark'] as const).map(mode => (
        <div key={mode}>
          <p className="mb-1.5 text-xs font-medium text-faint">{mode === 'light' ? '☀️ 清新淺色' : '🌙 高級深色'}</p>
          <div className="grid grid-cols-4 gap-2">
            {mode === 'light' &&
              option(
                'auto',
                '跟隨系統',
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-gradient-to-br from-white from-50% to-slate-900 to-50%">
                  <Monitor className="h-4 w-4 text-slate-500" />
                </span>,
              )}
            {THEMES.filter(t => t.mode === mode).map(t =>
              option(
                t.id,
                t.name,
                <span
                  className="h-10 w-10 rounded-full border border-line"
                  style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 0 45%, ${t.swatch[1]} 45% 75%, ${t.swatch[2]} 75%)` }}
                />,
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function HabitEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Habit
  onSave: (name: string, icon: string, color: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? 'health')
  const [color, setColor] = useState(initial ? Object.keys(HABIT_COLORS).find(k => HABIT_COLORS[k] === habitColor(initial)) ?? 'indigo' : 'indigo')
  const isVocab = initial?.id === VOCAB_HABIT.id

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) onSave(name.trim(), icon, color)
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-surface-2 p-3">
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="習慣名稱，例如：早睡、冥想"
        maxLength={12}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-fg outline-none placeholder:text-faint focus:border-primary"
      />
      {!isVocab && (
        <div className="grid grid-cols-8 gap-1.5">
          {Object.entries(HABIT_ICONS)
            .filter(([key]) => key !== 'vocab')
            .map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                className={`flex aspect-square items-center justify-center rounded-lg transition ${
                  icon === key ? `${HABIT_COLORS[color].chip} ring-2 ring-current` : 'text-muted hover:bg-surface'
                }`}
                aria-label={key}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
        </div>
      )}
      <div className="flex gap-2">
        {Object.entries(HABIT_COLORS).map(([key, c]) => (
          <button
            key={key}
            type="button"
            onClick={() => setColor(key)}
            className={`h-7 w-7 rounded-full ${c.dot} ${color === key ? 'ring-2 ring-fg ring-offset-2 ring-offset-surface-2' : ''}`}
            aria-label={key}
          />
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm text-muted">
          取消
        </button>
        <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-on-primary">
          儲存
        </button>
      </div>
    </form>
  )
}

function HabitManager() {
  const { habits, add, update, remove, move } = useHabits()
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {habits.map((h, i) => {
        const Icon = habitIcon(h)
        if (editing === h.id) {
          return (
            <HabitEditor
              key={h.id}
              initial={h}
              onSave={(name, icon, color) => {
                update(h.id, h.id === VOCAB_HABIT.id ? { name, color } : { name, icon, color })
                setEditing(null)
              }}
              onCancel={() => setEditing(null)}
            />
          )
        }
        return (
          <div key={h.id} className="flex items-center gap-2 rounded-xl bg-surface-2 p-2">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${habitColor(h).chip}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-fg">
              {h.name}
              {h.id === VOCAB_HABIT.id && <span className="ml-1 text-xs text-faint">（自動打卡）</span>}
            </span>
            <button onClick={() => move(h.id, -1)} disabled={i === 0} className="p-1.5 text-faint disabled:opacity-30" aria-label="上移">
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => move(h.id, 1)}
              disabled={i === habits.length - 1}
              className="p-1.5 text-faint disabled:opacity-30"
              aria-label="下移"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button onClick={() => setEditing(h.id)} className="p-1.5 text-muted" aria-label="編輯">
              <Pencil className="h-4 w-4" />
            </button>
            {h.id !== VOCAB_HABIT.id && (
              <button
                onClick={() => confirm(`確定刪除「${h.name}」？打卡紀錄也會一起刪除。`) && remove(h.id)}
                className="p-1.5 text-faint hover:text-rose-500"
                aria-label="刪除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )
      })}
      {editing === 'new' ? (
        <HabitEditor
          onSave={(name, icon, color) => {
            add(name, icon, color)
            setEditing(null)
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <button
          onClick={() => setEditing('new')}
          className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-line py-2.5 text-sm text-muted"
        >
          <Plus className="h-4 w-4" /> 新增習慣
        </button>
      )}
    </div>
  )
}

function Backup() {
  const [lastBackup, setLastBackup] = useLocalStorage<string>('lifemaster.lastBackup', '')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const today = toDateKey()
  const daysSince = lastBackup ? diffDays(lastBackup, today) : null

  const exportData = () => {
    downloadBackup(`lifemaster-backup-${today}.json`)
    setLastBackup(today)
    setMessage({ ok: true, text: '已匯出備份檔，建議存到 iCloud 雲碟或傳給自己。' })
  }

  const importData = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('匯入會用備份檔覆蓋目前的資料，確定要繼續嗎？')) return
    try {
      const count = await restoreBackup(file)
      setMessage({ ok: true, text: `已還原 ${count} 個項目，重新載入中…` })
      setTimeout(() => location.reload(), 800)
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error && err.message.includes('LifeMaster') ? err.message : '檔案格式錯誤，無法匯入' })
    }
  }

  return (
    <div className="space-y-3">
      <p className={`text-sm ${daysSince === null || daysSince > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-muted'}`}>
        {daysSince === null ? '⚠️ 還沒有備份過' : daysSince === 0 ? '✅ 今天已備份' : `上次備份：${daysSince} 天前`}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={exportData}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-medium text-on-primary"
        >
          <Download className="h-4 w-4" /> 匯出備份
        </button>
        <button
          onClick={() => fileInput.current?.click()}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-sm font-medium text-fg"
        >
          <Upload className="h-4 w-4" /> 匯入備份
        </button>
      </div>
      <input ref={fileInput} type="file" accept="application/json,.json" onChange={importData} className="hidden" />
      {message && (
        <p className={`flex items-start gap-1 text-sm ${message.ok ? 'text-emerald-500' : 'text-rose-500'}`}>
          {message.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
          {message.text}
        </p>
      )}
    </div>
  )
}

export default function Settings({ themeId, onThemeChange }: { themeId: string; onThemeChange: (id: string) => void }) {
  const [level, setLevel] = useWordLevel()

  return (
    <div className="space-y-4">
      <Section title="🎨 主題配色">
        <ThemePicker themeId={themeId} onChange={onThemeChange} />
      </Section>

      <Section title="🎯 多益目標分數" desc="決定每日新字的難度範圍，明天抽題起生效">
        <div className="space-y-2">
          {LEVELS.map(l => {
            const count = WORD_INFO.filter(w => w.level <= l.value).length
            return (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                  level === l.value ? 'bg-primary-soft ring-2 ring-primary' : 'bg-surface-2'
                }`}
              >
                <span>
                  <span className={`font-semibold ${level === l.value ? 'text-primary' : 'text-fg'}`}>{l.label}</span>
                  <span className="ml-2 text-xs text-muted">{l.desc}</span>
                </span>
                <span className="text-xs text-muted">{count} 字</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="✅ 管理習慣" desc="新增、改名、換圖示顏色、調整順序">
        <HabitManager />
      </Section>

      <Section title="💾 資料備份" desc="資料只存在這台裝置的瀏覽器裡，清除 Safari 資料或換手機前請先備份">
        <Backup />
      </Section>

      <Section title="📱 加到 iPhone 主畫面">
        <ol className="list-inside list-decimal space-y-1 text-sm text-muted">
          <li>用 Safari 打開這個網站</li>
          <li>
            點下方的分享按鈕 <Share className="inline h-4 w-4" />
          </li>
          <li>選「加入主畫面」</li>
        </ol>
        <p className="mt-2 text-xs text-faint">加入後會全螢幕開啟，也能在沒有網路時使用。</p>
      </Section>
    </div>
  )
}
