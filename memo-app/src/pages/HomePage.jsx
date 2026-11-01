import MemoEditor from '../components/MemoEditor'
import MemoList from '../components/MemoList'
import { useMemos } from '../hooks/useMemos'

export default function HomePage() {
  const { memos, loading, addMemo, editMemo, removeMemo } = useMemos()

  return (
    <>
      <MemoEditor onSubmit={addMemo} submitLabel="추가" />
      {loading ? <p className="empty">불러오는 중…</p> : <MemoList memos={memos} onUpdate={editMemo} onDelete={removeMemo} />}
    </>
  )
}
