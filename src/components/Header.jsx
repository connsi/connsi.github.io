import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isFirebaseConfigured } from '../firebase/config'
import { logout } from '../services/authService'

export default function Header() {
  const { user } = useAuth()
  // 로그인하지 않은 방문자가 '비공개'를 누르면 로그인 화면으로 갑니다.
  const minePath = isFirebaseConfigured && !user ? '/login' : '/mine'

  return (
    <header className="header">
      <div className="left">
        {/* 로고를 누르면 전체 화면(모두의 공개 + 내 비공개)으로 갑니다 */}
        <Link to="/" className="logo" title="전체 메모">📝 Recordish</Link>
        <NavLink to={minePath} className="tab">비공개</NavLink>
        <NavLink to="/public" className="tab">공개</NavLink>
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
