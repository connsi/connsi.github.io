import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isFirebaseConfigured } from '../firebase/config'
import { logout } from '../services/authService'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="header">
      <div className="left">
        <Link to="/" className="logo">📝 Recordish</Link>
        <NavLink to="/" end className="tab">내 메모</NavLink>
        <NavLink to="/public" className="tab">공개 메모</NavLink>
      </div>
      <nav>
        {!isFirebaseConfigured && <span className="badge">로컬 모드</span>}
        {isFirebaseConfigured &&
          (user ? (
            <>
              <span className="user">{user.displayName ?? user.email}</span>
              <button onClick={logout}>로그아웃</button>
            </>
          ) : (
            <Link to="/login">로그인</Link>
          ))}
      </nav>
    </header>
  )
}
