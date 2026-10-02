import { touch } from './sync'

const PREFIX = 'lifemaster.'
const APP = 'LifeMaster'

export interface BackupFile {
  app: typeof APP
  version: 1
  exportedAt: string
  data: Record<string, unknown>
}

export function createBackup(): BackupFile {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(PREFIX)) continue
    try {
      data[key] = JSON.parse(localStorage.getItem(key) ?? 'null')
    } catch {
      // 略過無法解析的值
    }
  }
  return { app: APP, version: 1, exportedAt: new Date().toISOString(), data }
}

export function downloadBackup(filename: string) {
  const blob = new Blob([JSON.stringify(createBackup(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 讀取備份檔並寫回 localStorage，回傳還原了幾個項目。格式不符會丟出錯誤。 */
export async function restoreBackup(file: File): Promise<number> {
  return applyBackup(JSON.parse(await file.text()) as Partial<BackupFile>)
}

/** 把備份內容寫回 localStorage（檔案備份與雲端備份共用） */
export function applyBackup(parsed: Partial<BackupFile>): number {
  if (parsed.app !== APP || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error('這不是 LifeMaster 的備份檔')
  }
  const entries = Object.entries(parsed.data).filter(([key]) => key.startsWith(PREFIX))
  for (const [key, value] of entries) {
    localStorage.setItem(key, JSON.stringify(value))
    touch(key)
  }
  return entries.length
}
