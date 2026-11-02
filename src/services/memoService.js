// 메모 데이터 접근 계층
// - Firebase가 설정된 경우: Firestore
//     memos/{memoId}  { uid, authorName, content, isPublic, createdAt, updatedAt }
//     usage/{uid}     { day: 20261102, chars: 1234 }  ← 오늘(한국 시간) 쓴 글자 수
//   · 내 메모: uid == 내 uid (브라우저에서 정렬)
//   · 공개 메모: isPublic == true, 최신순 20개씩 (복합 색인 필요: isPublic + updatedAt desc)
//   · 하루 글자 제한: 새 메모는 글자 수 전체, 수정은 늘어난 글자 수만큼 오늘 사용량에 더합니다.
//     보안 규칙(firestore.rules)이 서버에서도 같은 계산을 검사합니다.
// - 그 외(로컬 모드): 브라우저 localStorage (글자 제한 없음)
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { signupId } from '../utils/authorId'
import { charCount, DAILY_CHAR_LIMIT } from '../utils/text'

export const PAGE_SIZE = 20

const isCloud = (user) => Boolean(db && user)
const memosCol = () => collection(db, 'memos')
const usageRef = (uid) => doc(db, 'usage', uid)
const byNewest = (a, b) => b.updatedAt - a.updatedAt
// 공개 메모에는 Google 이름 대신 가입 일시 번호를 보여줍니다.
const authorNameOf = (user) => signupId(user)

// 오늘 날짜(한국 시간)를 20261102 같은 숫자로. 보안 규칙의 today() 와 같은 계산입니다.
export function todayKey(now = Date.now()) {
  const kst = new Date(now + 9 * 60 * 60 * 1000)
  return kst.getUTCFullYear() * 10000 + (kst.getUTCMonth() + 1) * 100 + kst.getUTCDate()
}

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

// ---------- 하루 글자 사용량 ----------
// 오늘 이미 쓴 글자 수
async function getUsedToday(user) {
  const snap = await getDoc(usageRef(user.uid))
  const data = snap.exists() ? snap.data() : null
  return data && data.day === todayKey() ? data.chars : 0
}

class DailyLimitError extends Error {}

// 글자 사용량을 더한 새 값을 계산합니다. 한도를 넘으면 오류를 냅니다.
async function chargeChars(user, added) {
  if (added <= 0) return null
  const used = await getUsedToday(user)
  const next = used + added
  if (next > DAILY_CHAR_LIMIT) {
    const left = Math.max(0, DAILY_CHAR_LIMIT - used)
    throw new DailyLimitError(
      `하루에 쓸 수 있는 글자(${DAILY_CHAR_LIMIT.toLocaleString()}자)를 넘었어요.\n` +
        `오늘 남은 글자: ${left.toLocaleString()}자 (이번 메모: ${added.toLocaleString()}자)`,
    )
  }
  return { day: todayKey(), chars: next }
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
    const snap = await getDocs(query(memosCol(), where('uid', '==', user.uid)))
    const memos = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    await syncAuthorName(user, memos)
    return memos.sort(byNewest)
  }
  return readAll().sort(byNewest)
}

// 공개 메모를 최신순으로 PAGE_SIZE 개씩 가져옵니다.
// cursor: 이전 페이지가 돌려준 next 값 (첫 페이지는 생략)
// 반환: { memos, next }  next 가 null 이면 더 없음
export async function getPublicMemos(cursor = null) {
  if (db) {
    const parts = [where('isPublic', '==', true), orderBy('updatedAt', 'desc')]
    if (cursor) parts.push(startAfter(cursor))
    parts.push(limit(PAGE_SIZE + 1)) // 하나 더 읽어서 다음 페이지가 있는지 확인
    const snap = await getDocs(query(memosCol(), ...parts))
    const docs = snap.docs.slice(0, PAGE_SIZE)
    return {
      memos: docs.map((d) => ({ id: d.id, ...d.data() })),
      next: snap.docs.length > PAGE_SIZE ? docs[docs.length - 1] : null,
    }
  }
  const all = readAll().filter((m) => m.isPublic).sort(byNewest)
  const start = cursor ?? 0
  return {
    memos: all.slice(start, start + PAGE_SIZE),
    next: all.length > start + PAGE_SIZE ? start + PAGE_SIZE : null,
  }
}

export async function createMemo(user, { content, isPublic = false }) {
  const now = Date.now()
  const id = crypto.randomUUID()
  if (isCloud(user)) {
    const usage = await chargeChars(user, charCount(content))
    const batch = writeBatch(db)
    batch.set(doc(memosCol(), id), {
      uid: user.uid,
      authorName: authorNameOf(user),
      content,
      isPublic,
      createdAt: now,
      updatedAt: now,
    })
    if (usage) batch.set(usageRef(user.uid), usage)
    await batch.commit()
    return
  }
  writeAll([{ id, content, isPublic, createdAt: now, updatedAt: now }, ...readAll()])
}

export async function updateMemo(user, id, { content, isPublic }) {
  const updatedAt = Date.now()
  if (isCloud(user)) {
    const ref = doc(memosCol(), id)
    const before = await getDoc(ref)
    const added = charCount(content) - charCount(before.data()?.content)
    const usage = await chargeChars(user, added)
    const batch = writeBatch(db)
    batch.update(ref, { content, isPublic, authorName: authorNameOf(user), updatedAt })
    if (usage) batch.set(usageRef(user.uid), usage)
    await batch.commit()
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
