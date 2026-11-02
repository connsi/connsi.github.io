import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as memoService from '../services/memoService'

// scope: 'mine' (내 메모) | 'public' (모두의 공개 메모)
export function useMemos(scope = 'mine') {
  const { user } = useAuth()
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => (scope === 'public' ? memoService.getPublicMemos() : memoService.getMyMemos(user))

  // 사용자나 화면이 바뀌면 메모를 다시 불러옵니다.
  useEffect(() => {
    let active = true
    const fetcher = scope === 'public' ? memoService.getPublicMemos() : memoService.getMyMemos(user)
    fetcher
      .then((list) => active && (setMemos(list), setError('')))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user, scope])

  // 저장 공간 초과, 네트워크 오류 등으로 실패하면 알리고 false 를 돌려줍니다.
  const run = async (action) => {
    try {
      await action()
      setMemos(await load())
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
