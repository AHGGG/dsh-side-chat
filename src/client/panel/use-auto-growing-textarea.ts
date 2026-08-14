import { useLayoutEffect, useRef } from 'react'

/** Keep a textarea one line tall until its content reaches the CSS max-height. */
export function useAutoGrowingTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const textarea = ref.current
    if (textarea === null) return
    textarea.style.height = 'auto'
    const maxHeight = Number.parseFloat(getComputedStyle(textarea).maxHeight)
    const height = Number.isFinite(maxHeight)
      ? Math.min(textarea.scrollHeight, maxHeight)
      : textarea.scrollHeight
    textarea.style.height = `${String(height)}px`
    textarea.style.overflowY = Number.isFinite(maxHeight) && textarea.scrollHeight > maxHeight
      ? 'auto'
      : 'hidden'
  }, [value])

  return ref
}
