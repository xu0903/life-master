import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { ArrowDown, ArrowUp, Check, Download, Monitor, Pencil, Plus, Share, Trash2, Upload, Volume2, X } from 'lucide-react'
import { HABIT_COLORS, HABIT_ICONS, VOCAB_HABIT, habitColor, habitIcon } from '../data/habits'
import type { Habit, HabitSettings } from '../data/habits'
import { LEVELS, WORD_INFO } from '../data/toeicWords'
import { useWordLevel } from '../hooks/useDailyWords'
import { useHabits } from '../hooks/useHabits'
import { CHECKIN_REMIND_KEY } from '../hooks/useReminders'
import Diagnostics from './Diagnostics'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSpeechSettings } from '../hooks/useSpeechSettings'
import type { AutoSpeak } from '../hooks/useSpeechSettings'
import { APP_ICONS, APP_ICON_KEY, DEFAULT_APP_ICON, appIconUrl, applyAppIcon } from '../utils/appIcon'
import { cloudEnabled } from '../utils/cloud'
import {
  CLOUD_BACKUP_EVENT,
  backupNow,
  disableCloudBackup,
  enableCloudBackup,
  formatCode,
  isCloudBackupEnabled,
  lastCloudBackup,
  normalizeCode,
  recoveryCode,
  resetRecoveryCode,
  restoreFromCode,
} from '../utils/cloudBackup'
import { PUSH_EVENT, isPushEnabled } from '../utils/push'
import { notificationPermission, requestNotificationPermission, showNotification } from '../utils/reminders'
import { speak } from '../utils/speech'
import type { Accent } from '../utils/speech'
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
        themeId === id ? 'bg-primary-soft font-semibold text-primary-ink ring-2 ring-primary' : 'text-muted hover:bg-surface-2'
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
  onSave: (settings: HabitSettings) => void
  onCancel: () => void
}) {
  const [weekly, setWeekly] = useState(initial?.weeklyTarget ?? 0)
  const [target, setTarget] = useState(initial?.target ? String(initial.target) : '')
  const [unit, setUnit] = useState(initial?.unit ?? '')
  const [remindTime, setRemindTime] = useState(initial?.remindTime ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? 'health')
  const [color, setColor] = useState(initial ? Object.keys(HABIT_COLORS).find(k => HABIT_COLORS[k] === habitColor(initial)) ?? 'indigo' : 'indigo')
  const isVocab = initial?.id === VOCAB_HABIT.id

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const count = Math.min(99, Math.floor(Number(target)))
    onSave({
      name: name.trim(),
      icon,
      color,
      weeklyTarget: !isVocab && weekly > 0 ? weekly : undefined,
      target: !isVocab && count > 1 ? count : undefined,
      unit: !isVocab && count > 1 && unit.trim() ? unit.trim() : undefined,
      remindTime: remindTime || undefined,
    })
  }

  const fieldClass = 'rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-fg outline-none focus:border-primary'

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
      <div className="space-y-2 text-sm text-muted">
        {!isVocab && (
          <>
            <label className="flex items-center justify-between gap-2">
              頻率
              <select value={weekly} onChange={e => setWeekly(Number(e.target.value))} className={fieldClass}>
                <option value={0}>每天</option>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>
                    每週 {n} 次
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between gap-2">
              每日目標次數
              <span className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="1"
                  className={`${fieldClass} w-16 text-center`}
                />
                <input
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  maxLength={4}
                  placeholder="單位"
                  className={`${fieldClass} w-16 text-center`}
                />
              </span>
            </label>
          </>
        )}
        <label className="flex items-center justify-between gap-2">
          每天提醒時間
          <span className="flex items-center gap-1.5">
            {remindTime && (
              <button type="button" onClick={() => setRemindTime('')} className="text-xs text-faint underline">
                清除
              </button>
            )}
            <input type="time" value={remindTime} onChange={e => setRemindTime(e.target.value)} className={fieldClass} />
          </span>
        </label>
        {remindTime && !isPushEnabled() && <p className="text-xs text-amber-600 dark:text-amber-400">要先在下方「待辦通知」開啟通知，提醒才會送出</p>}
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
              onSave={settings => {
                update(h.id, h.id === VOCAB_HABIT.id ? { name: settings.name, color: settings.color, remindTime: settings.remindTime } : settings)
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
              {h.weeklyTarget && <span className="ml-1 text-xs text-faint">每週 {h.weeklyTarget} 次</span>}
              {h.target && (
                <span className="ml-1 text-xs text-faint">
                  每日 {h.target}
                  {h.unit}
                </span>
              )}
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
          onSave={settings => {
            add(settings)
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

function AppIconPicker() {
  const [iconId, setIconId] = useLocalStorage(APP_ICON_KEY, DEFAULT_APP_ICON)
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

  const choose = (id: number) => {
    setIconId(id)
    applyAppIcon(id)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {APP_ICONS.map(icon => (
          <button key={icon.id} onClick={() => choose(icon.id)} className="flex flex-col items-center gap-1.5 text-xs">
            <span className={`relative block rounded-[22%] ${iconId === icon.id ? 'ring-3 ring-primary ring-offset-2 ring-offset-surface' : ''}`}>
              <img src={appIconUrl(icon.id)} alt={icon.name} className="aspect-square w-full rounded-[22%] shadow-md" loading="lazy" />
              {iconId === icon.id && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </span>
            <span className={iconId === icon.id ? 'font-semibold text-primary-ink' : 'text-muted'}>{icon.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-1.5 rounded-xl bg-amber-400/15 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
        <p className="font-semibold">換圖示前請先看這裡</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>主畫面上的圖示是在「加入主畫面」的那一刻決定的，在這裡選了不會自動更新已經加好的圖示。</li>
          <li>
            要換圖示：用 <span className="font-semibold">Safari</span> 打開這個網站 → 在這裡選好圖示 → 刪掉主畫面上舊的 LifeMaster → 再「加入主畫面」一次。
          </li>
          <li>主畫面 App 和 Safari 的資料是分開的，所以一定要在 Safari 裡選，在主畫面 App 裡選的不會帶過去。</li>
          <li>
            刪掉舊的主畫面 App 會一併清掉裡面的資料。請先在下方「資料備份」開啟雲端備份並記下還原碼（或匯出備份檔），重新加入後再還原。
          </li>
          <li>重新加入後要再開一次通知，推播才會恢復。</li>
          <li>通知裡顯示的小圖示固定是預設那一張。</li>
        </ul>
        {standalone && <p className="font-semibold">你現在是從主畫面 App 開啟的，在這裡選的圖示只會影響 App 內的顯示。</p>}
      </div>
    </div>
  )
}

function ExamDate() {
  const [examDate, setExamDate] = useLocalStorage('lifemaster.examDate', '')
  return (
    <div className="flex items-center gap-3">
      <input
        type="date"
        value={examDate}
        onChange={e => setExamDate(e.target.value)}
        className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-base text-fg outline-none focus:border-primary"
      />
      {examDate && (
        <button onClick={() => setExamDate('')} className="text-sm text-faint underline">
          清除
        </button>
      )}
    </div>
  )
}

function CloudBackup() {
  const read = () => ({ enabled: isCloudBackupEnabled(), last: lastCloudBackup(), code: recoveryCode() })
  const [state, setState] = useState(read)
  const [busy, setBusy] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [input, setInput] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    const onChange = () => setState(read())
    window.addEventListener(CLOUD_BACKUP_EVENT, onChange)
    return () => window.removeEventListener(CLOUD_BACKUP_EVENT, onChange)
  }, [])

  if (!cloudEnabled) return null

  const run = async (task: () => Promise<boolean>, okText: string) => {
    setBusy(true)
    const ok = await task()
    setBusy(false)
    setMessage(ok ? { ok: true, text: okText } : { ok: false, text: '連線失敗，請確認網路後再試一次' })
    return ok
  }

  const enable = async () => {
    if (await run(enableCloudBackup, '已開啟自動備份，請把還原碼抄下來或截圖保存')) setShowCode(true)
  }

  const resetCode = async () => {
    if (!confirm('換一組新的還原碼？舊的還原碼會立刻失效。')) return
    await run(resetRecoveryCode, '已換成新的還原碼')
  }

  const restore = async (e: FormEvent) => {
    e.preventDefault()
    if (!confirm('還原會用雲端備份覆蓋這台裝置目前的資料，確定要繼續嗎？')) return
    setBusy(true)
    const result = await restoreFromCode(input)
    setBusy(false)
    if (result === 'invalid') setMessage({ ok: false, text: '還原碼不正確，請再確認一次' })
    else if (result === 'offline') setMessage({ ok: false, text: '連線失敗，請確認網路後再試一次' })
    else {
      setMessage({ ok: true, text: `已還原 ${result} 個項目，重新載入中…` })
      setTimeout(() => location.reload(), 800)
    }
  }

  return (
    <div className="mb-4 space-y-3 border-b border-line pb-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-fg">雲端自動備份</p>
          <p className="text-xs text-muted">
            {state.enabled
              ? state.last
                ? `上次備份：${new Date(state.last).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                : '尚未備份'
              : '換手機或清除 Safari 資料後，用還原碼就能把資料和房間找回來'}
          </p>
        </div>
        <button
          disabled={busy}
          onClick={state.enabled ? disableCloudBackup : enable}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-40 ${
            state.enabled ? 'bg-surface-2 text-muted' : 'bg-primary text-on-primary'
          }`}
        >
          {state.enabled ? '關閉' : '開啟'}
        </button>
      </div>

      {state.enabled && state.code && (
        <div className="rounded-xl bg-surface-2 p-3">
          <p className="text-xs text-muted">還原碼（請抄下來或截圖，遺失就無法還原）</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-wider text-fg">
            {showCode ? formatCode(state.code) : '••••-••••-••••-••••'}
          </p>
          <div className="mt-2 flex gap-4 text-sm text-primary-ink">
            <button onClick={() => setShowCode(v => !v)}>{showCode ? '隱藏' : '顯示'}</button>
            <button disabled={busy} onClick={() => run(backupNow, '已備份到雲端')}>
              立即備份
            </button>
            <button disabled={busy} onClick={resetCode}>
              換一組
            </button>
          </div>
        </div>
      )}

      {restoring ? (
        <form onSubmit={restore} className="space-y-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            placeholder="輸入還原碼"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-center font-mono text-base tracking-wider text-fg outline-none placeholder:text-faint focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy || normalizeCode(input).length < 16}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-on-primary disabled:opacity-40"
          >
            從雲端還原
          </button>
        </form>
      ) : (
        <button onClick={() => setRestoring(true)} className="text-sm text-primary-ink">
          我有還原碼，要把資料還原到這台裝置
        </button>
      )}

      {message && (
        <p className={`flex items-start gap-1 text-sm ${message.ok ? 'text-emerald-500' : 'text-rose-500'}`}>
          {message.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
          {message.text}
        </p>
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

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-xl bg-surface-2 p-1">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg py-2 text-sm transition ${
            value === o.value ? 'bg-surface font-semibold text-primary-ink shadow-sm' : 'text-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SpeechSettingsPanel() {
  const [settings, setSettings] = useSpeechSettings()

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-faint">預設口音</p>
        <Segmented<Accent>
          value={settings.accent}
          onChange={accent => setSettings(s => ({ ...s, accent }))}
          options={[
            { value: 'en-US', label: '🇺🇸 美式' },
            { value: 'en-GB', label: '🇬🇧 英式' },
          ]}
        />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-faint">翻卡朗讀</p>
        <Segmented<AutoSpeak>
          value={settings.autoSpeak}
          onChange={autoSpeak => setSettings(s => ({ ...s, autoSpeak }))}
          options={[
            { value: 'every', label: '每次翻卡' },
            { value: 'first', label: '第一次翻' },
            { value: 'off', label: '不朗讀' },
          ]}
        />
      </div>
      <button
        onClick={() => speak('Welcome to LifeMaster', settings.accent)}
        className="flex items-center gap-1.5 text-sm text-primary-ink"
      >
        <Volume2 className="h-4 w-4" /> 試聽
      </button>
    </div>
  )
}

function NotificationPanel() {
  const [permission, setPermission] = useState(notificationPermission())
  const [tested, setTested] = useState<boolean | null>(null)
  const [pushOn, setPushOn] = useState(isPushEnabled)

  useEffect(() => {
    const onChange = () => setPushOn(isPushEnabled())
    window.addEventListener(PUSH_EVENT, onChange)
    return () => window.removeEventListener(PUSH_EVENT, onChange)
  }, [])

  const status = {
    granted: '✅ 已開啟',
    denied: '⛔ 已被關閉，請到 iPhone 設定 → 通知 → LifeMaster 開啟',
    default: '尚未開啟',
    unsupported: '⚠️ 目前無法使用：iPhone 需先「加入主畫面」並從主畫面打開 App（iOS 16.4 以上）',
  }[permission]

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">狀態：{status}</p>
      {permission === 'granted' && (
        <p className={`text-xs ${pushOn ? 'text-emerald-500' : 'text-faint'}`}>
          {pushOn
            ? '背景推播已啟用：App 關著也會準時提醒'
            : cloudEnabled
              ? '背景推播尚未啟用，目前只有 App 開著時會提醒（請確認是從主畫面開啟且有網路）'
              : '尚未設定雲端服務，目前只有 App 開著時會提醒'}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={permission !== 'default'}
          onClick={async () => setPermission(await requestNotificationPermission())}
          className="rounded-xl bg-primary py-2.5 text-sm font-medium text-on-primary disabled:opacity-40"
        >
          開啟通知
        </button>
        <button
          disabled={permission !== 'granted'}
          onClick={async () => setTested(await showNotification('LifeMaster 測試通知', '看到這則通知代表提醒功能正常 🎉'))}
          className="rounded-xl bg-surface-2 py-2.5 text-sm font-medium text-fg disabled:opacity-40"
        >
          發送測試通知
        </button>
      </div>
      {tested === false && <p className="text-xs text-rose-500">測試通知發送失敗，請確認權限設定</p>}
      <CheckinReminder pushOn={pushOn} />
    </div>
  )
}

/** 每日打卡提醒：自己選時間，預設關閉 */
function CheckinReminder({ pushOn }: { pushOn: boolean }) {
  const [time, setTime] = useLocalStorage(CHECKIN_REMIND_KEY, '')
  return (
    <div className="border-t border-line pt-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-fg">每日打卡提醒</p>
          <p className="text-xs text-muted">{time ? `每天 ${time}，當天習慣還沒全部完成時提醒你` : '目前關閉'}</p>
        </div>
        {time ? (
          <button onClick={() => setTime('')} className="shrink-0 rounded-full bg-surface-2 px-3.5 py-1.5 text-sm text-muted">
            關閉
          </button>
        ) : (
          <button onClick={() => setTime('21:00')} className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-on-primary">
            開啟
          </button>
        )}
      </div>
      {time && (
        <input
          type="time"
          value={time}
          onChange={e => e.target.value && setTime(e.target.value)}
          className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2 text-base text-fg outline-none focus:border-primary"
        />
      )}
      {time && !pushOn && <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">需要先開啟上方的通知，提醒才會送出</p>}
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

      <Section title="🌱 App 圖示" desc="選一個喜歡的圖示，加入主畫面時會用這一張">
        <AppIconPicker />
      </Section>

      <Section title="🔊 發音" desc="翻卡時自動念出單字；卡片上的喇叭按鈕也會把預設口音排在前面">
        <SpeechSettingsPanel />
      </Section>

      <Section title="🔔 通知" desc="開啟後 App 關著也會收到待辦提醒、習慣提醒與夥伴的督促；也可以在任務裡用「加到 iPhone 行事曆」">
        <NotificationPanel />
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
                  <span className={`font-semibold ${level === l.value ? 'text-primary-ink' : 'text-fg'}`}>{l.label}</span>
                  <span className="ml-2 text-xs text-muted">{l.desc}</span>
                </span>
                <span className="text-xs text-muted">{count} 字</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="📅 多益考試日期" desc="設定後會在習慣打卡頁顯示倒數天數">
        <ExamDate />
      </Section>

      <Section title="✅ 管理習慣" desc="新增、改名、換圖示顏色、調整順序；也能設定每週次數、每日目標與提醒時間">
        <HabitManager />
      </Section>

      <Section title="💾 資料備份" desc="資料存在這台裝置的瀏覽器裡；開啟雲端備份，或定期匯出檔案，清除 Safari 資料或換手機時才不會遺失">
        <CloudBackup />
        <Backup />
      </Section>

      <Section title="🩺 環境檢查" desc="收不到通知或資料一直消失時，看這裡哪一項是紅字；也可以複製結果傳給開發者">
        <Diagnostics />
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
