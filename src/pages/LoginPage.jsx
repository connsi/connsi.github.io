import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loginWithGoogle } from '../services/authService'

export default function LoginPage() {
  const { user } = useAuth()
  const [error, setError] = useState('')

  if (user) return <Navigate to="/" replace />

  const handleLogin = async () => {
    try {
      setError('')
      await loginWithGoogle()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="login">
      <h2>로그인</h2>
      <button className="primary" onClick={handleLogin}>Google로 로그인</button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
