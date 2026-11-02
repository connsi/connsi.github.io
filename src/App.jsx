import { HashRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import AccountPage from './pages/AccountPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import FeedPage from './pages/FeedPage'

// GitHub Pages는 SPA 라우팅(새로고침 시 404)을 지원하지 않아서 HashRouter를 씁니다.
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Header />
        <main className="container">
          <Routes>
            {/* 로고: 나와 다른 사람의 공개 메모 / 나만보기: 내 비공개 (로그인 필요) / 공개메모: 내 공개 (로그인 필요) */}
            <Route path="/" element={<FeedPage key="all" mode="all" />} />
            <Route path="/mine" element={<ProtectedRoute><FeedPage key="mine" mode="mine" /></ProtectedRoute>} />
            <Route path="/public" element={<ProtectedRoute><FeedPage key="public" mode="public" /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </HashRouter>
    </AuthProvider>
  )
}
