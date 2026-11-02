import { useState } from 'react'
import { charCount } from '../utils/text'
import VisibilityToggle from './VisibilityToggle'

// defaultPublic: 새 메모의 기본 공개 여부 (공개메모 화면에서는 공개, 나머지는 비공개)
export default function MemoEditor({ initial, defaultPublic = false, onSubmit, onCancel, submitLabel = '저장' }) {
  initial = initial ?? { content: '', isPublic: defaultPublic }
  const [content, setContent] = useState(initial.content)
  const [isPublic, setIsPublic] = useState(initial.isPublic === true)
  const [saving, setSaving] = useState(false)
  const isNew = !onCancel
  const count = charCount(content)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || saving) return
    const draft = { content, isPublic }
    // 새 메모는 바로 입력창을 비워서 다음 메모를 쓸 수 있게 하고(공개 여부는 기본값으로 되돌림),
    // 저장에 실패하면 입력했던 내용을 되돌려 놓습니다.
    if (isNew) {
      setContent('')
      setIsPublic(defaultPublic)
    }
    setSaving(true)
    const ok = await onSubmit(draft)
    setSaving(false)
    if (ok === false && isNew) {
      setContent(draft.content)
      setIsPublic(draft.isPublic)
    }
  }

  return (
    <form className="editor" onSubmit={handleSubmit}>
      <textarea placeholder="메모를 입력하세요" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="counter">{count.toLocaleString()}자</div>
      <div className="editor-footer">
        <VisibilityToggle isPublic={isPublic} onChange={setIsPublic} />
        <div className="actions">
          {onCancel && <button type="button" onClick={onCancel}>취소</button>}
          <button type="submit" className="primary" disabled={saving}>{saving ? '저장 중…' : submitLabel}</button>
        </div>
      </div>
    </form>
  )
}
