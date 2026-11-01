import MemoItem from './MemoItem'

export default function MemoList({ memos, onUpdate, onDelete }) {
  if (memos.length === 0) return <p className="empty">아직 메모가 없습니다.</p>

  return (
    <ul className="memo-list">
      {memos.map((memo) => (
        <MemoItem key={memo.id} memo={memo} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  )
}
