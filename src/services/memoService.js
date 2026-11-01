// 메모 데이터 접근 계층
// - Firebase가 설정되어 있고 로그인한 경우: Firestore (users/{uid}/memos/{memoId})
// - 그 외(로컬 모드): 브라우저 localStorage
// 컴포넌트/훅은 어느 저장소를 쓰는지 몰라도 됩니다.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const isCloud = (uid) => Boolean(db && uid)
const memosCol = (uid) => collection(db, 'users', uid, 'memos')

// ---------- localStorage ----------
const STORAGE_KEY = 'memo-app:memos'

function readAll() {
  try {
    const memos = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
    return memos.map(fromLegacy)
  } catch {
    return []
  }
}

// 예전에 제목을 따로 저장한 메모는 제목을 내용 첫 줄로 합칩니다.
function fromLegacy({ title, ...memo }) {
  if (!title) return memo
  return { ...memo, content: memo.content ? `${title}\n${memo.content}` : title }
}

function writeAll(memos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos))
}

// ---------- 공개 함수 ----------
export async function getMemos(uid) {
  if (isCloud(uid)) {
    const snap = await getDocs(query(memosCol(uid), orderBy('updatedAt', 'desc')))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function createMemo(uid, { content }) {
  const now = Date.now()
  const memo = { id: crypto.randomUUID(), content, createdAt: now, updatedAt: now }
  if (isCloud(uid)) {
    const { id, ...data } = memo
    await setDoc(doc(memosCol(uid), id), data)
  } else {
    writeAll([memo, ...readAll()])
  }
  return memo
}

export async function updateMemo(uid, id, { content }) {
  const updatedAt = Date.now()
  if (isCloud(uid)) {
    await updateDoc(doc(memosCol(uid), id), { content, updatedAt })
    return
  }
  writeAll(readAll().map((m) => (m.id === id ? { ...m, content, updatedAt } : m)))
}

export async function deleteMemo(uid, id) {
  if (isCloud(uid)) {
    await deleteDoc(doc(memosCol(uid), id))
    return
  }
  writeAll(readAll().filter((m) => m.id !== id))
}
