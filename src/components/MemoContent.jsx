import { useEffect, useRef, useState } from 'react'

// 메모 본문: 3줄이 넘으면 말줄임(…)으로 줄이고 "더보기 / 접기" 버튼을 보여줍니다.
// 화면 폭이 바뀌면 다시 계산합니다.
export default function MemoContent({ content }) {
  const ref = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    // 줄여서 보여줄 때 실제 내용이 더 길면 버튼을 보여줍니다 (처음 한 번 + 크기가 바뀔 때마다)
    const observer = new ResizeObserver(() => setOverflowing(el.scrollHeight > el.clientHeight + 1))
    observer.observe(el)
    return () => observer.disconnect()
  }, [content, expanded])

  return (
    <>
      <p ref={ref} className={`memo-content ${expanded ? '' : 'clamped'}`}>
        {content}
      </p>
      {overflowing && (
        <button type="button" className="text-button" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </>
  )
}
