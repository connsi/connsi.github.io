import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as memoService from '../services/memoService'

export function useMemos() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)

  // 사용자(uid)가 바뀌면 메모를 다시 불러옵니다.
  useEffect(() => {
    let active = true
    memoService.getMemos(uid).then((list) => {
      if (!active) return
      setMemos(list)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [uid])

  const refresh = async () => setMemos(await memoService.getMemos(uid))

  // 저장 공간 초과, 네트워크 오류 등으로 실패하면 알리고 false 를 돌려줍니다.
  const run = async (action) => {
    try {
      await action()
      await refresh()
      return true
    } catch (e) {
      alert(`저장하지 못했습니다.\n${e.message}`)
      return false
    }
  }

  const addMemo = (data) => run(() => memoService.createMemo(uid, data))
  const editMemo = (id, data) => run(() => memoService.updateMemo(uid, id, data))
  const removeMemo = (id) => run(() => memoService.deleteMemo(uid, id))

  return { memos, loading, addMemo, editMemo, removeMemo }
}
