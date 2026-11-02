import MemoList from '../components/MemoList'
import { useMemos } from '../hooks/useMemos'

// 모두의 공개 메모 (로그인하지 않아도 볼 수 있음)
export default function PublicPage() {
  const { memos, loading, error } = useMemos('public')

  return (
    <>
      <h2 className="page-title">🌐 공개 메모</h2>
      {error && <p className="error">메모를 불러오지 못했습니다: {error}</p>}
      {loading ? (
        <p className="empty">불러오는 중…</p>
      ) : (
        <MemoList memos={memos} readOnly showAuthor emptyText="아직 공개된 메모가 없습니다." />
      )}
    </>
  )
}
