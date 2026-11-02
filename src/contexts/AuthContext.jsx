import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeAuth } from '../services/authService'
import { recordVisit } from '../services/profileService'

const AuthContext = createContext({ user: null, loading: true, profile: null, setProfile: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // 프로필(이름, 접속 횟수 등). 불러오지 못하면 null 이고, 앱은 기본값으로 계속 동작합니다.
  const [profile, setProfile] = useState(null)

  useEffect(
    () =>
      subscribeAuth((u) => {
        setUser(u)
        setLoading(false)
        setProfile(null)
        if (u) {
          recordVisit(u)
            .then(setProfile)
            .catch((e) => console.warn('프로필을 불러오지 못했습니다:', e))
        }
      }),
    [],
  )

  return <AuthContext.Provider value={{ user, loading, profile, setProfile }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
