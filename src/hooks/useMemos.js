import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as memoService from '../services/memoService'

// 내 메모
export function useMyMemos() {
  const { user } = useAuth()
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    memoService
      .getMyMemos(user)
      .then((list) => active && (setMemos(list), setError('')))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  // 저장 공간 초과, 하루 글자 한도, 네트워크 오류 등으로 실패하면 알리고 false 를 돌려줍니다.
  const run = async (action) => {
    try {
      await action()
      setMemos(await memoService.getMyMemos(user))
      return true
    } catch (e) {
      alert(`저장하지 못했습니다.\n${e.message}`)
      return false
    }
  }

  const addMemo = (data) => run(() => memoService.createMemo(user, data))
  const editMemo = (id, data) => run(() => memoService.updateMemo(user, id, data))
  const removeMemo = (id) => run(() => memoService.deleteMemo(user, id))

  return { memos, loading, error, addMemo, editMemo, removeMemo }
}

// 모두의 공개 메모, 20개씩 "더 보기"
export function usePublicMemos() {
  const [memos, setMemos] = useState([])
  const [next, setNext] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    memoService
      .getPublicMemos()
      .then((page) => active && (setMemos(page.memos), setNext(page.next), setError('')))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!next || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await memoService.getPublicMemos(next)
      // 그사이 수정되어 순서가 바뀐 메모가 두 번 나오지 않도록 걸러냅니다.
      setMemos((prev) => {
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

  return { memos, loading, loadingMore, error, hasMore: Boolean(next), loadMore }
}
