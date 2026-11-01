import { useState } from 'react'

export default function MemoEditor({ initial = { content: '' }, onSubmit, onCancel, submitLabel = '저장' }) {
  const [content, setContent] = useState(initial.content)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    await onSubmit({ content })
    if (!onCancel) setContent('')
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
