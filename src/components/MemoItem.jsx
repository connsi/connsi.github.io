import { useState } from 'react'
import { fullDateTime, relativeTime } from '../utils/relativeTime'
import MemoEditor from './MemoEditor'

// readOnly: 공개 메모 화면처럼 수정/삭제 버튼 없이 보여줄 때
// showAuthor: 작성자 이름 표시
export default function MemoItem({ memo, now, onUpdate, onDelete, readOnly = false, showAuthor = false }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="memo">
        <MemoEditor
          initial={memo}
          submitLabel="수정"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            const ok = await onUpdate(memo.id, data)
            if (ok) setEditing(false)
            return ok
          }}
        />
      </li>
    )
  }

  return (
    <li className="memo">
      <p>{memo.content}</p>
      <div className="meta">
        <span className="info">
          {showAuthor && <span className="author">{memo.authorName || '익명'}</span>}
          {!readOnly && <span className={`tag ${memo.isPublic ? 'public' : ''}`}>{memo.isPublic ? '🌐 공개' : '🔒 비공개'}</span>}
          <time dateTime={new Date(memo.updatedAt).toISOString()} title={fullDateTime(memo.updatedAt)}>
            {relativeTime(memo.updatedAt, now)}
          </time>
        </span>
        {!readOnly && (
          <div className="actions">
            <button onClick={() => setEditing(true)}>수정</button>
            <button className="danger" onClick={() => confirm('삭제할까요?') && onDelete(memo.id)}>삭제</button>
          </div>
        )}
      </div>
    </li>
  )
}
