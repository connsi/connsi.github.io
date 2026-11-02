import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isFirebaseConfigured } from '../firebase/config'
import { logout } from '../services/authService'

export default function Header() {
  const { user } = useAuth()
  // 로그인하지 않은 방문자가 '내 메모'를 누르면 로그인 화면으로 갑니다.
  const myMemosPath = isFirebaseConfigured && !user ? '/login' : '/'

  return (
    <header className="header">
      <div className="left">
        <Link to="/" className="logo">📝 Recordish</Link>
        <NavLink to={myMemosPath} end className="tab">내 메모</NavLink>
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
