import { useState } from 'react'

export default function MemoEditor({ initial = { title: '', content: '' }, onSubmit, onCancel, submitLabel = '저장' }) {
  const [title, setTitle] = useState(initial.title)
  const [content, setContent] = useState(initial.content)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return
    await onSubmit({ title: title.trim(), content })
    if (!onCancel) {
      setTitle('')
      setContent('')
    }
  }

  return (
    <form className="editor" onSubmit={handleSubmit}>
      <input placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="내용을 입력하세요" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="actions">
        {onCancel && <button type="button" onClick={onCancel}>취소</button>}
        <button type="submit" className="primary">{submitLabel}</button>
      </div>
    </form>
  )
}
