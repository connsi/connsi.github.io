import { Link } from 'react-router-dom'
import MemoList from '../components/MemoList'
import { useAuth } from '../contexts/AuthContext'
import { isFirebaseConfigured } from '../firebase/config'
import { usePublicMemos } from '../hooks/useMemos'

// 모두의 공개 메모 (로그인하지 않아도 볼 수 있음)
export default function PublicPage() {
  const { memos, loading, loadingMore, error, hasMore, loadMore } = usePublicMemos()
  const { user, loading: authLoading } = useAuth()
  const isGuest = isFirebaseConfigured && !authLoading && !user

  return (
    <>
      {isGuest && (
        <p className="notice">
          <Link to="/login">Google로 로그인</Link>하면 나만의 메모를 쓰고, 원하는 메모를 공개할 수 있어요.
        </p>
      )}
      <h2 className="page-title">🌐 공개 메모</h2>
      {error && <p className="error">메모를 불러오지 못했습니다: {error}</p>}
      {loading ? (
        <p className="empty">불러오는 중…</p>
      ) : (
        <>
          <MemoList memos={memos} readOnly showAuthor emptyText="아직 공개된 메모가 없습니다." />
          {hasMore && (
            <div className="more">
              <button onClick={loadMore} disabled={loadingMore}>{loadingMore ? '불러오는 중…' : '더 보기'}</button>
            </div>
          )}
        </>
      )}
    </>
  )
}
