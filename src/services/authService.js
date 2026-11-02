// 인증 계층
// Firebase가 설정되어 있으면 Firebase Authentication(Google 로그인)을 사용하고,
// 설정 전에는 로그인 없이 쓸 수 있도록 null 사용자를 돌려줍니다.
import {
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { deleteAllMyData } from './memoService'

export function subscribeAuth(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export async function loginWithGoogle() {
  if (!auth) throw new Error('Firebase가 아직 설정되지 않았습니다. .env.local을 확인하세요.')
  return signInWithPopup(auth, new GoogleAuthProvider())
}

export async function logout() {
  if (auth) await signOut(auth)
}

// 회원 탈퇴: 내 데이터를 모두 지운 뒤 로그인 계정을 삭제합니다.
// 로그인한 지 오래되어 Firebase가 다시 로그인을 요구하면, Google 로그인 창을 한 번 더 띄웁니다.
export async function deleteAccount() {
  const user = auth?.currentUser
  if (!user) throw new Error('로그인한 상태에서만 탈퇴할 수 있습니다.')
  await deleteAllMyData(user)
  try {
    await deleteUser(user)
  } catch (e) {
    if (e.code !== 'auth/requires-recent-login') throw e
    await reauthenticateWithPopup(user, new GoogleAuthProvider())
    await deleteUser(user)
  }
}
