import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isFirebaseConfigured } from '../firebase/config'

// Firebase가 설정된 경우에만 로그인을 요구합니다.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (!isFirebaseConfigured) return children
  if (loading) return <p className="empty">불러오는 중…</p>
  return user ? children : <Navigate to="/login" replace />
}
