import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as memoService from '../services/memoService'

// 화면별 메모 목록
// mode: 'all'    → 모두의 공개 메모 + 내 비공개 메모 (/)
//       'mine'   → 내 비공개 메모 (/mine)
//       'public' → 모두의 공개 메모 (/public)
//
// 공개 메모는 20개씩 "더 보기"로 불러오고, 내 비공개 메모는 한 번에 불러옵니다.
// 전체 화면에서는 아직 불러오지 않은 공개 메모보다 오래된 비공개 메모를 숨겨 두었다가
// 더 보기를 누를 때 함께 보여줘서, 두 목록이 항상 최신순으로 자연스럽게 섞이게 합니다.
export function useFeed(mode) {
  const { user } = useAuth()
  const withPublic = mode !== 'mine'
  const withPrivate = mode !== 'public'

  const [publicMemos, setPublicMemos] = useState([])
  const [privateMemos, setPrivateMemos] = useState([])
  const [next, setNext] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  // 첫 페이지 불러오기 (화면 진입, 로그인/로그아웃, 작성·수정·삭제 후)
  const fetchFirst = useCallback(
    () =>
      Promise.all([
        withPublic ? memoService.getPublicMemos() : { memos: [], next: null },
        withPrivate ? memoService.getMyPrivateMemos(user) : [],
      ]),
    [user, withPublic, withPrivate],
  )
  const apply = ([page, mine]) => {
    setPublicMemos(page.memos)
    setNext(page.next)
    setPrivateMemos(mine)
    setError('')
  }
  const reload = async () => apply(await fetchFirst())

  useEffect(() => {
    let active = true
    fetchFirst()
      .then((data) => active && apply(data))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [fetchFirst])

  const loadMore = useCallback(async () => {
    if (!next || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await memoService.getPublicMemos(next)
      // 그사이 수정되어 순서가 바뀐 메모가 두 번 나오지 않도록 걸러냅니다.
      setPublicMemos((prev) => {
        const seen = new Set(prev.map((m) => m.id))
        return [...prev, ...page.memos.filter((m) => !seen.has(m.id))]
      })
      setNext(page.next)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingMore(false)
    }
  }, [next, loadingMore])

  const memos = useMemo(() => {
    // 공개 메모가 더 남아 있으면, 마지막으로 불러온 공개 메모보다 새 비공개 메모만 보여줍니다.
    const cutoff = next && publicMemos.length ? publicMemos[publicMemos.length - 1].updatedAt : -Infinity
    const visiblePrivate = privateMemos.filter((m) => m.updatedAt >= cutoff)
    return [...publicMemos, ...visiblePrivate].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [publicMemos, privateMemos, next])

  // 저장 공간 초과, 하루 글자 한도, 네트워크 오류 등으로 실패하면 알리고 false 를 돌려줍니다.
  const run = async (action) => {
    try {
      await action()
      await reload()
      return true
    } catch (e) {
      alert(`저장하지 못했습니다.\n${e.message}`)
      return false
    }
  }

  return {
    memos,
    loading,
    loadingMore,
    error,
    hasMore: Boolean(next),
    loadMore,
    addMemo: (data) => run(() => memoService.createMemo(user, data)),
    editMemo: (id, data) => run(() => memoService.updateMemo(user, id, data)),
    removeMemo: (id) => run(() => memoService.deleteMemo(user, id)),
  }
}
