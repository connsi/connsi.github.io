import { useState } from 'react'

export default function MemoEditor({ initial = { content: '' }, onSubmit, onCancel, submitLabel = '저장' }) {
  const [content, setContent] = useState(initial.content)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    const ok = await onSubmit({ content })
    // 실패하면 입력한 내용을 지우지 않습니다.
    if (ok !== false && !onCancel) setContent('')
  }

  return (
    <form className="editor" onSubmit={handleSubmit}>
      <textarea placeholder="메모를 입력하세요" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="actions">
        {onCancel && <button type="button" onClick={onCancel}>취소</button>}
        <button type="submit" className="primary">{submitLabel}</button>
      </div>
    </form>
  )
}
