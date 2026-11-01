// 메모 데이터 접근 계층
// 지금은 localStorage에 저장합니다. Firestore를 붙일 때는 이 파일의
// 함수 내부만 바꾸면 되고, 컴포넌트/훅은 수정할 필요가 없습니다.
// 각 함수의 첫 인자 _uid 는 Firestore 전환 시 사용자별 경로에 쓰입니다.
//
// Firestore로 바꿀 때의 예시:
//   import { collection, addDoc, ... } from 'firebase/firestore'
//   import { db } from '../firebase/config'
//   경로: users/{uid}/memos/{memoId}

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

export async function getMemos(_uid) {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function createMemo(_uid, { content }) {
  const now = Date.now()
  const memo = { id: crypto.randomUUID(), content, createdAt: now, updatedAt: now }
  writeAll([memo, ...readAll()])
  return memo
}

export async function updateMemo(_uid, id, { content }) {
  const memos = readAll().map((m) =>
    m.id === id ? { ...m, content, updatedAt: Date.now() } : m,
  )
  writeAll(memos)
}

export async function deleteMemo(_uid, id) {
  writeAll(readAll().filter((m) => m.id !== id))
}
