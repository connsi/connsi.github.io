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

  const addMemo = async (data) => {
    await memoService.createMemo(uid, data)
    await refresh()
  }
  const editMemo = async (id, data) => {
    await memoService.updateMemo(uid, id, data)
    await refresh()
  }
  const removeMemo = async (id) => {
    await memoService.deleteMemo(uid, id)
    await refresh()
  }

  return { memos, loading, addMemo, editMemo, removeMemo }
}
