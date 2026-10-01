import { useState } from 'react'
import type { ReactNode } from 'react'
import { Bell, BellOff, CalendarDays, CalendarPlus, Check, ChevronRight, Clock, Flag, NotebookPen, Pencil, Sun, Tag, Trash2, X } from 'lucide-react'
import { DEFAULT_REMIND, QUADRANTS, REMIND_OPTIONS, TAG_COLORS, TAG_NAMES_KEY, defaultRemindFor, quadrantFor, quadrantOf, tagOf } from '../data/todos'
import type { RemindOption, TagNames, Todo } from '../data/todos'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { fromDateKey } from '../utils/date'
import { downloadIcs, notificationPermission } from '../utils/reminders'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const fieldBase = 'rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/40'

export const dateTitle = (key: string) => {
  const d = fromDateKey(key)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 週${WEEKDAYS[d.getDay()]}`
}

function Row({ icon, label, children, onClick }: { icon: ReactNode; label: string; children?: ReactNode; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className="flex min-h-[3.25rem] w-full items-center gap-3 border-b border-line px-1 py-2 text-left">
      <span className="text-muted">{icon}</span>
      <span className="flex-1 text-[15px] text-fg">{label}</span>
      {children}
    </Tag>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-surface-2 ring-1 ring-line'}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[1.375rem]' : 'left-0.5'}`} />
    </button>
  )
}

/** 14 種顏色分類；可以把顏色改名成「工作」「家人」等 */
export function TagPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [names, setNames] = useLocalStorage<TagNames>(TAG_NAMES_KEY, {})
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className="space-y-1.5">
        {TAG_COLORS.map(c => (
          <label key={c.id} className="flex items-center gap-2">
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: c.hex }} />
            <input
              value={names[c.id] ?? ''}
              placeholder={c.name}
              maxLength={12}
              onChange={e => setNames(n => ({ ...n, [c.id]: e.target.value }))}
              className={`min-w-0 flex-1 ${fieldBase}`}
            />
          </label>
        ))}
        <button type="button" onClick={() => setEditing(false)} className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-on-primary">
          完成
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {TAG_COLORS.map(c => {
          const tag = tagOf({ category: c.id }, names)
          const active = value === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${active ? 'font-semibold text-fg' : 'bg-surface-2 text-muted'}`}
              style={active ? { background: `${c.hex}26`, boxShadow: `0 0 0 2px ${c.hex}` } : undefined}
            >
              <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: c.hex }} />
              <span className="min-w-0 flex-1 truncate">{tag.name}</span>
              {active && <Check className="h-4 w-4" style={{ color: c.hex }} />}
            </button>
          )
        })}
      </div>
      <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-primary-ink">
        <Pencil className="h-3.5 w-3.5" /> 自訂分類名稱（例如：緊急、家人、工作、作業）
      </button>
    </div>
  )
}

/** 緊急 × 重要 四象限 */
function QuadrantPicker({ value, onChange }: { value: Todo['priority']; onChange: (q: Todo['priority']) => void }) {
  const current = quadrantOf({ priority: value })
  const cell = (urgent: boolean, important: boolean) => {
    const q = quadrantFor(urgent, important)
    const active = current === q
    return (
      <button
        type="button"
        onClick={() => onChange(q)}
        className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs transition ${active ? 'bg-primary-soft font-semibold text-primary-ink ring-2 ring-primary' : 'bg-surface-2 text-muted'}`}
      >
        <span className={`h-2 w-2 rounded-full ${QUADRANTS[q].dot}`} />
        {QUADRANTS[q].label}
      </button>
    )
  }
  return (
    <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-1.5 text-xs">
      <span />
      <span className="text-center font-semibold text-rose-500">緊急</span>
      <span className="text-center font-semibold text-faint">不緊急</span>
      <span className="pr-1 font-semibold text-sky-600 dark:text-sky-400">重要</span>
      {cell(true, true)}
      {cell(false, true)}
      <span className="pr-1 font-semibold text-faint">不重要</span>
      {cell(true, false)}
      {cell(false, false)}
    </div>
  )
}

/** 新增或編輯任務（仿行事曆 App 的一列一列設定） */
export default function TodoSheet({
  todo,
  onSave,
  onDelete,
  onClose,
}: {
  /** 編輯時是原本的任務；新增時是預設值（id 為空字串） */
  todo: Todo
  onSave: (todo: Todo) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const isNew = !todo.id
  const [draft, setDraft] = useState(todo)
  const [open, setOpen] = useState<'tag' | 'priority' | null>(null)
  const [names] = useLocalStorage<TagNames>(TAG_NAMES_KEY, {})
  const set = (patch: Partial<Todo>) => setDraft(d => ({ ...d, ...patch }))
  const tag = tagOf(draft, names)
  const hasDate = !!draft.dueDate
  const allDay = !draft.dueTime
  const remind = draft.remind ?? 'none'
  const remindOptions = REMIND_OPTIONS.filter(o => !o.needsTime || draft.dueTime)

  const setDate = (dueDate: string) => {
    if (!dueDate) return set({ dueDate: undefined, dueTime: undefined, remind: undefined })
    set({ dueDate, remind: hasDate ? draft.remind : defaultRemindFor(dueDate, draft.dueTime) })
  }
  const setAllDay = (on: boolean) => {
    if (on) {
      const needsTime = REMIND_OPTIONS.find(o => o.value === remind)?.needsTime
      set({ dueTime: undefined, remind: needsTime ? DEFAULT_REMIND : remind })
    } else set({ dueTime: '09:00' })
  }

  const save = () => {
    const text = draft.text.trim()
    if (!text) return
    const timingChanged = draft.dueDate !== todo.dueDate || draft.dueTime !== todo.dueTime || draft.remind !== todo.remind
    onSave({
      ...draft,
      text,
      note: draft.note?.trim() || undefined,
      // 時間或提醒改了就重新提醒
      notifiedAt: timingChanged ? undefined : draft.notifiedAt,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 -mx-5 flex items-center bg-surface px-3 pb-1">
          <button onClick={onClose} className="rounded-full p-2 text-muted hover:bg-surface-2" aria-label="關閉">
            <X className="h-6 w-6" />
          </button>
          <p className="flex-1 text-center text-sm text-faint">{isNew ? '新增任務' : '編輯任務'}</p>
          <button
            onClick={save}
            disabled={!draft.text.trim()}
            className="rounded-full bg-surface-2 px-4 py-1.5 text-sm font-semibold text-fg ring-1 ring-line disabled:opacity-40"
          >
            保存
          </button>
        </div>

        <input
          autoFocus={isNew}
          value={draft.text}
          onChange={e => set({ text: e.target.value })}
          placeholder="標題"
          className="w-full border-b border-line bg-transparent px-1 py-3 text-xl font-semibold text-fg outline-none placeholder:text-faint"
        />

        <Row icon={<Tag className="h-5 w-5" />} label="分類" onClick={() => setOpen(o => (o === 'tag' ? null : 'tag'))}>
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <span className="h-3 w-3 rounded-full" style={{ background: tag.hex }} />
            {tag.name}
            <ChevronRight className={`h-4 w-4 transition ${open === 'tag' ? 'rotate-90' : ''}`} />
          </span>
        </Row>
        {open === 'tag' && (
          <div className="border-b border-line py-3">
            <TagPicker
              value={tag.id}
              onChange={id => {
                set({ category: id })
                setOpen(null)
              }}
            />
          </div>
        )}

        <Row icon={<Flag className="h-5 w-5" />} label="優先級" onClick={() => setOpen(o => (o === 'priority' ? null : 'priority'))}>
          <span className={`flex items-center gap-1.5 text-sm ${QUADRANTS[quadrantOf(draft)].tone}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${QUADRANTS[quadrantOf(draft)].dot}`} />
            {QUADRANTS[quadrantOf(draft)].label}
            <ChevronRight className={`h-4 w-4 text-faint transition ${open === 'priority' ? 'rotate-90' : ''}`} />
          </span>
        </Row>
        {open === 'priority' && (
          <div className="border-b border-line py-3">
            <QuadrantPicker value={draft.priority} onChange={priority => set({ priority })} />
          </div>
        )}

        <Row icon={<CalendarDays className="h-5 w-5" />} label="截止日">
          <input type="date" value={draft.dueDate ?? ''} onChange={e => setDate(e.target.value)} className={fieldBase} />
          {hasDate && (
            <button type="button" onClick={() => setDate('')} className="text-faint" aria-label="清除截止日">
              <X className="h-4 w-4" />
            </button>
          )}
        </Row>
        {hasDate && (
          <>
            <Row icon={<Sun className="h-5 w-5" />} label="全天">
              <Toggle on={allDay} onChange={setAllDay} label="全天" />
            </Row>
            {!allDay && (
              <Row icon={<Clock className="h-5 w-5" />} label="時間">
                <input type="time" value={draft.dueTime ?? ''} onChange={e => e.target.value && set({ dueTime: e.target.value })} className={fieldBase} />
              </Row>
            )}
            <Row icon={remind === 'none' ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />} label="提醒">
              <select value={remind} onChange={e => set({ remind: e.target.value as RemindOption })} className={fieldBase}>
                {remindOptions.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Row>
            {remind !== 'none' && notificationPermission() !== 'granted' && (
              <p className="px-1 pt-2 text-xs text-amber-700 dark:text-amber-400">還沒開通知權限，提醒只會在 App 打開時顯示；到「設定 → 通知」開啟。</p>
            )}
          </>
        )}

        <div className="flex gap-3 border-b border-line px-1 py-3">
          <NotebookPen className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
          <textarea
            value={draft.note ?? ''}
            onChange={e => set({ note: e.target.value })}
            placeholder="備註"
            rows={2}
            className="min-w-0 flex-1 resize-none bg-transparent text-[15px] text-fg outline-none placeholder:text-faint"
          />
        </div>

        {!isNew && (
          <div className="mt-4 flex gap-2">
            {hasDate && (
              <button
                onClick={() => downloadIcs(draft)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-sm font-medium text-fg"
              >
                <CalendarPlus className="h-4 w-4" /> 加到 iPhone 行事曆
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (!confirm('確定刪除這個任務？')) return
                  onDelete()
                  onClose()
                }}
                className="flex items-center justify-center gap-1 rounded-xl px-4 py-2.5 text-sm text-rose-500"
              >
                <Trash2 className="h-4 w-4" /> 刪除
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
