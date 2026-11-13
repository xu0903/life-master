import { useEffect, useState } from 'react'

const isTyping = (el: Element | null) =>
  el instanceof HTMLTextAreaElement ||
  (el instanceof HTMLInputElement && !['checkbox', 'radio', 'button', 'submit', 'range', 'color', 'file'].includes(el.type)) ||
  (el instanceof HTMLElement && el.isContentEditable)

/**
 * 螢幕鍵盤是否開著。
 * iPhone 加到主畫面的 PWA 有個問題：鍵盤收起來後，position: fixed 的底部分頁列
 * 會停在鍵盤原本的上緣，卡在畫面中間。這裡在鍵盤收起時捲動 0 px，逼 Safari 重新計算位置；
 * 鍵盤開著時回傳 true，讓分頁列先藏起來。
 */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const vv = window.visualViewport
    let timer = 0

    const refresh = () => {
      const typing = isTyping(document.activeElement)
      const shrunk = vv ? window.innerHeight - vv.height > 150 : false
      const next = typing && (shrunk || !vv)
      setOpen(next)
      if (!next) {
        window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          window.scrollTo(window.scrollX, window.scrollY)
          // 有些版本要真的動一下才會重排
          window.scrollBy(0, 1)
          window.scrollBy(0, -1)
        }, 60)
      }
    }

    const onFocusOut = () => window.setTimeout(refresh, 0)
    document.addEventListener('focusin', refresh)
    document.addEventListener('focusout', onFocusOut)
    vv?.addEventListener('resize', refresh)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('focusin', refresh)
      document.removeEventListener('focusout', onFocusOut)
      vv?.removeEventListener('resize', refresh)
    }
  }, [])

  return open
}
