import MemoEditor from '../components/MemoEditor'
import MemoList from '../components/MemoList'
import { useMemos } from '../hooks/useMemos'

export default function HomePage() {
  const { memos, loading, error, addMemo, editMemo, removeMemo } = useMemos('mine')

  return (
    <>
      <MemoEditor onSubmit={addMemo} submitLabel="추가" />
      {error && <p className="error">메모를 불러오지 못했습니다: {error}</p>}
      {loading ? <p className="empty">불러오는 중…</p> : <MemoList memos={memos} onUpdate={editMemo} onDelete={removeMemo} />}
    </>
  )
}
