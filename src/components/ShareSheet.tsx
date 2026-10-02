import { useEffect, useState } from 'react'
import { Share2, X } from 'lucide-react'
import { shareImage } from '../utils/shareImage'

/** 分享前先預覽圖片 */
export default function ShareSheet({ blob, filename, message, onClose }: { blob: Blob; filename: string; message: string; onClose: () => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/80 p-6" onClick={onClose}>
      <button onClick={onClose} className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 rounded-full p-2 text-white/80" aria-label="關閉">
        <X className="h-6 w-6" />
      </button>
      {url && <img src={url} alt="分享圖片預覽" className="max-h-[70dvh] max-w-full rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />}
      <button
        onClick={e => {
          e.stopPropagation()
          void shareImage(blob, filename, message)
        }}
        className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg active:scale-95"
      >
        <Share2 className="h-5 w-5" /> 分享 / 存到相簿
      </button>
      <p className="text-xs text-white/60">也可以長按圖片儲存</p>
    </div>
  )
}
