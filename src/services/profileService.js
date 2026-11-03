// 내 프로필: profiles/{uid} = { name, visitCount, lastVisitAt, prevVisitAt }
// - name: 공개 메모에 표시되는 이름. 없으면(null) 기본값 = "Running Wolf" 같은 영어 이름 (utils/defaultName.js)
// - visitCount: 접속 횟수 (앱을 열 때마다 1, 같은 창에서 새로고침은 세지 않음)
// - lastVisitAt: 이번 접속 시각 / prevVisitAt: 그 전 접속 시각 (마이페이지의 "마지막 접속")
import { collection, doc, getDoc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore/lite'
import { db } from '../firebase/config'
import { natureName } from '../utils/defaultName'

export const NAME_MAX = 20
const profileRef = (uid) => doc(db, 'profiles', uid)

// 지금 로그인한 사람의 프로필을 기억해 둡니다 (메모 작성 때 이름을 바로 쓰기 위해)
let cache = { uid: null, data: null }

export const defaultName = (user) => natureName(user?.uid)

export async function loadProfile(user) {
  if (!db || !user) return null
  if (cache.uid === user.uid && cache.data) return cache.data
  const snap = await getDoc(profileRef(user.uid))
  cache = { uid: user.uid, data: snap.exists() ? snap.data() : {} }
  return cache.data
}

// 공개 메모에 쓸 작성자 이름 (프로필을 아직 안 불러왔으면 불러옵니다)
export async function getAuthorName(user) {
  const profile = await loadProfile(user).catch(() => null)
  return profile?.name || defaultName(user)
}

// 앱을 열 때 한 번: 접속 횟수 +1, 이번/이전 접속 시각 기록
export async function recordVisit(user) {
  const profile = await loadProfile(user)
  const key = `recordish:visit:${user.uid}`
  let counted = false
  try {
    counted = sessionStorage.getItem(key) === '1'
  } catch {
    // 저장소를 못 쓰면 매번 새 접속으로 셉니다
  }
  if (counted) return profile
  const next = {
    visitCount: (profile.visitCount ?? 0) + 1,
    lastVisitAt: Date.now(),
    prevVisitAt: profile.lastVisitAt ?? null,
  }
  await setDoc(profileRef(user.uid), next, { merge: true })
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    // 무시
  }
  cache = { uid: user.uid, data: { ...profile, ...next } }
  return cache.data
}

// 이름 확인: 앞뒤 공백 제거, 1~20자, 줄바꿈 불가
export function validateName(raw) {
  const name = raw.trim()
  if (!name) return { error: '이름을 입력해 주세요.' }
  if (/[\r\n]/.test(name)) return { error: '이름에 줄바꿈은 쓸 수 없어요.' }
  if (name.length > NAME_MAX) return { error: `이름은 ${NAME_MAX}자까지 쓸 수 있어요.` }
  return { name }
}

// 이름 바꾸기 (null 이면 기본값으로). 이미 쓴 내 메모의 작성자 이름도 함께 바꿉니다.
export async function updateName(user, name) {
  await setDoc(profileRef(user.uid), { name }, { merge: true })
  cache = { uid: user.uid, data: { ...(cache.uid === user.uid ? cache.data : {}), name } }
  const shown = name || defaultName(user)
  const mine = await getDocs(query(collection(db, 'memos'), where('uid', '==', user.uid)))
  const stale = mine.docs.filter((d) => d.data().authorName !== shown)
  for (let i = 0; i < stale.length; i += 400) {
    const batch = writeBatch(db)
    stale.slice(i, i + 400).forEach((d) => batch.update(d.ref, { authorName: shown }))
    await batch.commit()
  }
  return cache.data
}

export function clearProfileCache() {
  cache = { uid: null, data: null }
}

export { profileRef }
