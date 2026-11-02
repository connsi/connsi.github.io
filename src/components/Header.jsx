import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isFirebaseConfigured } from '../firebase/config'

export default function Header() {
  const { user } = useAuth()
  // 로그인하지 않은 방문자가 '나만보기'를 누르면 로그인 화면으로 갑니다.
  const minePath = isFirebaseConfigured && !user ? '/login' : '/mine'

  return (
    <header className="header">
      <div className="left">
        {/* 로고를 누르면 전체 화면(모두의 공개 + 내 비공개)으로 갑니다 */}
        <Link to="/" className="logo" title="전체 메모">📝 Recordish</Link>
        <NavLink to={minePath} className="tab">나만보기</NavLink>
        <NavLink to="/public" className="tab">둘러보기</NavLink>
      </div>
      <nav>
        {!isFirebaseConfigured && <span className="badge">로컬 모드</span>}
        {isFirebaseConfigured &&
          (user ? (
            <NavLink to="/account" className="profile-button" aria-label="마이페이지" title="마이페이지">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </NavLink>
          ) : (
            <Link to="/login">로그인</Link>
          ))}
      </nav>
    </header>
  )
}
