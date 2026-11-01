// 인증 계층
// Firebase가 설정되어 있으면 Firebase Authentication(Google 로그인)을 사용하고,
// 설정 전에는 로그인 없이 쓸 수 있도록 null 사용자를 돌려줍니다.
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../firebase/config'

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
