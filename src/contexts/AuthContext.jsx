import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeAuth } from '../services/authService'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      subscribeAuth((u) => {
        setUser(u)
        setLoading(false)
      }),
    [],
  )

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
