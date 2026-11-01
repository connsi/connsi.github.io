import { useState } from 'react'
import MemoEditor from './MemoEditor'

export default function MemoItem({ memo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="memo">
        <MemoEditor
          initial={memo}
          submitLabel="수정"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            if (await onUpdate(memo.id, data)) setEditing(false)
          }}
        />
      </li>
    )
  }

  return (
    <li className="memo">
      <p>{memo.content}</p>
      <div className="meta">
        <time>{new Date(memo.updatedAt).toLocaleString()}</time>
        <div className="actions">
          <button onClick={() => setEditing(true)}>수정</button>
          <button className="danger" onClick={() => confirm('삭제할까요?') && onDelete(memo.id)}>삭제</button>
        </div>
      </div>
    </li>
  )
}
