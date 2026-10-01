import { useState } from 'react'
import { ArrowRight, CalendarCheck, CheckCircle2, Circle, Clock, Settings2 } from 'lucide-react'
import { INTENSITIES, PLAN_TARGETS, TASKS, averageMinutes, taskMinutes, taskText } from '../data/studyPlan'
import type { Intensity, PlanSettings, PlanTarget } from '../data/studyPlan'
import { useStudyPlan } from '../hooks/useStudyPlan'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

function Setup({ value, onSave }: { value: PlanSettings | null; onSave: (s: PlanSettings) => void }) {
  const [target, setTarget] = useState<PlanTarget>(value?.target ?? 730)
  const [intensity, setIntensity] = useState<Intensity>(value?.intensity ?? 'standard')
  const option = (active: boolean) => `rounded-xl p-2.5 text-left transition ${active ? 'bg-primary-soft ring-2 ring-primary' : 'bg-surface-2'}`
  return (
    <div className="space-y-4 rounded-2xl bg-surface p-4 shadow-sm">
      <div>
        <p className="font-semibold text-fg">目標分數</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {PLAN_TARGETS.map(t => (
            <button key={t.value} onClick={() => setTarget(t.value)} className={option(target === t.value)}>
              <p className={`font-bold ${target === t.value ? 'text-primary-ink' : 'text-fg'}`}>{t.label} 分</p>
              <p className="text-xs text-muted">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-semibold text-fg">練習強度</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {INTENSITIES.map(i => (
            <button key={i.value} onClick={() => setIntensity(i.value)} className={option(intensity === i.value)}>
              <p className={`font-bold ${intensity === i.value ? 'text-primary-ink' : 'text-fg'}`}>{i.label}</p>
              <p className="text-xs text-muted">每天約 {averageMinutes(target, i.value)} 分鐘</p>
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onSave({ target, intensity })} className="w-full rounded-2xl bg-primary py-3 font-semibold text-on-primary">
        排出我的一週菜單
      </button>
    </div>
  )
}

/** 多益菜單：依目標與強度排好一週的練習，今天的項目會依練習紀錄自動打勾 */
export default function StudyPlan({ onOpen }: { onOpen: (mode: string) => void }) {
  const { settings, setSettings, week, todayIndex, progress, isDone, exam, examSoon } = useStudyPlan()
  const [editing, setEditing] = useState(false)
  const [day, setDay] = useState(todayIndex)

  if (!settings || !week || editing)
    return (
      <div className="space-y-3">
        <p className="px-1 text-sm text-muted">選好目標分數與每天能花的時間，幫你排出一週的多益練習菜單。</p>
        <Setup
          value={settings}
          onSave={s => {
            setSettings(s)
            setEditing(false)
            setDay(todayIndex)
          }}
        />
      </div>
    )

  const tasks = week[day]
  const isToday = day === todayIndex
  const minutes = tasks.reduce((n, t) => n + taskMinutes(t), 0)
  const target = PLAN_TARGETS.find(t => t.value === settings.target)
  const intensity = INTENSITIES.find(i => i.value === settings.intensity)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-sm">
        <CalendarCheck className="h-5 w-5 text-primary-ink" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">
            目標 {target?.label} 分・{intensity?.label}
          </p>
          {exam && (
            <p className="text-xs text-muted">
              {exam.name}倒數 {exam.days} 天{examSoon && settings.target > 600 && '・週六排完整模擬考'}
            </p>
          )}
        </div>
        <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs text-muted">
          <Settings2 className="h-3.5 w-3.5" /> 調整
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {week.map((d, i) => {
          const allDone = i === todayIndex && d.every(isDone)
          return (
            <button
              key={i}
              onClick={() => setDay(i)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition ${
                day === i ? 'bg-primary font-semibold text-on-primary' : i === todayIndex ? 'bg-primary-soft text-primary-ink' : 'bg-surface text-muted'
              }`}
            >
              週{WEEKDAYS[i]}
              <span className="text-[10px] opacity-80">{allDone ? '✅' : `${d.length} 項`}</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-1 rounded-2xl bg-surface p-4 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
          {isToday ? '今天' : `週${WEEKDAYS[day]}`}的菜單
          <span className="flex items-center gap-0.5 text-xs font-normal text-faint">
            <Clock className="h-3.5 w-3.5" /> 約 {minutes} 分鐘
          </span>
        </p>
        <ul className="divide-y divide-line">
          {tasks.map(t => {
            const info = TASKS[t.kind]
            const done = isToday && isDone(t)
            const have = Math.min(progress(t), t.amount)
            return (
              <li key={t.kind} className="flex items-center gap-3 py-3">
                {isToday ? (
                  done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-faint" />
                  )
                ) : (
                  <span className="h-5 w-5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${done ? 'text-faint line-through' : 'text-fg'}`}>{taskText(t)}</p>
                  <p className="text-xs text-faint">
                    {info.how}・約 {taskMinutes(t)} 分鐘
                  </p>
                  {isToday && !done && have > 0 && (
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(have / t.amount) * 100}%` }} />
                    </div>
                  )}
                </div>
                {isToday && !done && (
                  <button
                    onClick={() => onOpen(info.mode)}
                    className="flex shrink-0 items-center gap-0.5 rounded-lg bg-primary-soft px-2.5 py-1.5 text-xs font-medium text-primary-ink"
                  >
                    去練習 <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {isToday && <p className="pt-1 text-xs text-faint">練習完會自動打勾（聽力每寫完一段、閱讀每交一次卷、刷題每答一題都會記錄）</p>}
      </div>
    </div>
  )
}
