import { Link } from 'react-router-dom'
import MemoEditor from '../components/MemoEditor'
import MemoList from '../components/MemoList'
import { useAuth } from '../contexts/AuthContext'
import { isFirebaseConfigured } from '../firebase/config'
import { useFeed } from '../hooks/useMemos'

const PAGES = {
  all: { title: '전체 메모', hideTitle: true, empty: '아직 메모가 없습니다.' },
  mine: { title: '🔒 나만 보기', empty: '아직 나만 보는 메모가 없습니다.' },
  public: { title: '🌐 둘러보기', empty: '아직 공개된 메모가 없습니다.' },
}

// mode: 'all' (/) | 'mine' (/mine) | 'public' (/public)
export default function FeedPage({ mode }) {
  const { memos, loading, loadingMore, error, hasMore, loadMore, addMemo, editMemo, removeMemo } = useFeed(mode)
  const { user, loading: authLoading } = useAuth()
  const isGuest = isFirebaseConfigured && !authLoading && !user
  const canWrite = !isFirebaseConfigured || Boolean(user)
  const page = PAGES[mode]

  return (
    <>
      {isGuest && (
        <p className="notice">
          <Link to="/login">Google로 로그인</Link>하면 나만의 메모를 쓰고, 원하는 메모를 공개할 수 있어요.
        </p>
      )}
      {canWrite && mode !== 'public' && <MemoEditor onSubmit={addMemo} submitLabel="추가" />}
      {/* 전체 화면은 제목을 눈에 보이지 않게(화면 읽기 프로그램에는 읽히게) 둡니다 */}
      <h2 className={page.hideTitle ? 'sr-only' : 'page-title'}>{page.title}</h2>
      {error && <p className="error">메모를 불러오지 못했습니다: {error}</p>}
      {loading ? (
        <p className="empty">불러오는 중…</p>
      ) : (
        <>
          <MemoList
            memos={memos}
            emptyText={page.empty}
            // 로컬 모드에서는 모든 메모가 내 메모입니다.
            isOwn={(memo) => !isFirebaseConfigured || memo.uid === user?.uid}
            showAuthor={mode !== 'mine'}
            onUpdate={editMemo}
            onDelete={removeMemo}
          />
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
