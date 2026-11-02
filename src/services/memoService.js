// 메모 데이터 접근 계층
// - Firebase가 설정된 경우: Firestore 최상위 컬렉션 memos/{memoId}
//     { uid, authorName, content, isPublic, createdAt, updatedAt }
//   · 내 메모: uid == 내 uid
//   · 공개 메모: isPublic == true (누구나 읽기 가능)
// - 그 외(로컬 모드): 브라우저 localStorage
// 쿼리는 조건 하나만 쓰고 정렬은 브라우저에서 해서, Firestore 복합 색인이 필요 없습니다.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { signupId } from '../utils/authorId'

const isCloud = (user) => Boolean(db && user)
const memosCol = () => collection(db, 'memos')
const byNewest = (a, b) => b.updatedAt - a.updatedAt
// 공개 메모에는 Google 이름 대신 가입 일시 번호를 보여줍니다.
const authorNameOf = (user) => signupId(user)

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

// 예전 형식의 메모를 현재 형식으로 맞춥니다.
// (제목이 있으면 내용 첫 줄로 합치고, 공개 여부가 없으면 비공개)
function fromLegacy({ title, ...memo }) {
  const content = title ? (memo.content ? `${title}\n${memo.content}` : title) : memo.content
  return { ...memo, content, isPublic: memo.isPublic === true }
}

function writeAll(memos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos))
}

// ---------- 예전 Firestore 위치(users/{uid}/memos)에서 옮기기 ----------
const migrated = new Set()

async function migrateLegacy(user) {
  if (migrated.has(user.uid)) return
  const old = await getDocs(collection(db, 'users', user.uid, 'memos'))
  for (const d of old.docs) {
    const data = d.data()
    await setDoc(doc(memosCol(), d.id), {
      uid: user.uid,
      authorName: authorNameOf(user),
      content: data.content ?? '',
      isPublic: false,
      createdAt: data.createdAt ?? Date.now(),
      updatedAt: data.updatedAt ?? Date.now(),
    })
    await deleteDoc(d.ref)
  }
  migrated.add(user.uid)
}

// 예전에 Google 이름으로 저장된 작성자 이름을 지금 규칙(가입 일시 번호)으로 바꿉니다.
// 수정 시각(updatedAt)은 그대로 둡니다. 실패해도 목록은 계속 보여줍니다.
async function syncAuthorName(user, memos) {
  const name = authorNameOf(user)
  const stale = memos.filter((m) => m.authorName !== name)
  await Promise.all(
    stale.map((m) =>
      updateDoc(doc(memosCol(), m.id), { authorName: name })
        .then(() => (m.authorName = name))
        .catch((e) => console.warn('작성자 이름 갱신 실패:', e)),
    ),
  )
}

// ---------- 공개 함수 ----------
export async function getMyMemos(user) {
  if (isCloud(user)) {
    // 옮기기에 실패해도 메모 목록은 계속 보여줍니다 (다음 접속 때 다시 시도).
    await migrateLegacy(user).catch((e) => console.warn('예전 메모 옮기기 실패:', e))
    const snap = await getDocs(query(memosCol(), where('uid', '==', user.uid)))
    const memos = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    await syncAuthorName(user, memos)
    return memos.sort(byNewest)
  }
  return readAll().sort(byNewest)
}

export async function getPublicMemos() {
  if (db) {
    const snap = await getDocs(query(memosCol(), where('isPublic', '==', true)))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byNewest)
  }
  return readAll().filter((m) => m.isPublic).sort(byNewest)
}

export async function createMemo(user, { content, isPublic = false }) {
  const now = Date.now()
  const id = crypto.randomUUID()
  if (isCloud(user)) {
    await setDoc(doc(memosCol(), id), {
      uid: user.uid,
      authorName: authorNameOf(user),
      content,
      isPublic,
      createdAt: now,
      updatedAt: now,
    })
  } else {
    writeAll([{ id, content, isPublic, createdAt: now, updatedAt: now }, ...readAll()])
  }
}

export async function updateMemo(user, id, { content, isPublic }) {
  const updatedAt = Date.now()
  if (isCloud(user)) {
    await updateDoc(doc(memosCol(), id), { content, isPublic, authorName: authorNameOf(user), updatedAt })
    return
  }
  writeAll(readAll().map((m) => (m.id === id ? { ...m, content, isPublic, updatedAt } : m)))
}

export async function deleteMemo(user, id) {
  if (isCloud(user)) {
    await deleteDoc(doc(memosCol(), id))
    return
  }
  writeAll(readAll().filter((m) => m.id !== id))
}
