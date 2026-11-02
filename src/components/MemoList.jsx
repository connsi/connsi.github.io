import { useNow } from '../hooks/useNow'
import MemoItem from './MemoItem'

export default function MemoList({ memos, emptyText = '아직 메모가 없습니다.', ...itemProps }) {
  const now = useNow()
  if (memos.length === 0) return <p className="empty">{emptyText}</p>

  return (
    <ul className="memo-list">
      {memos.map((memo) => (
        <MemoItem key={memo.id} memo={memo} now={now} {...itemProps} />
      ))}
    </ul>
  )
}
