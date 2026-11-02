import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useAuth } from '../contexts/AuthContext'
import { loginWithGoogle } from '../services/authService'

export default function LoginPage() {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleLogin = async () => {
    try {
      setError('')
      setBusy(true)
      await loginWithGoogle()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <h2>로그인</h2>
      <GoogleSignInButton onClick={handleLogin} disabled={busy} />
      {error && <p className="error">{error}</p>}
    </div>
  )
}
