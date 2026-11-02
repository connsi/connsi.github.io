import { HashRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
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
            {/* 전체: 모두의 공개 + 내 비공개 / 비공개: 내 비공개만 (로그인 필요) / 공개: 모두의 공개만 */}
            <Route path="/" element={<FeedPage key="all" mode="all" />} />
            <Route path="/mine" element={<ProtectedRoute><FeedPage key="mine" mode="mine" /></ProtectedRoute>} />
            <Route path="/public" element={<FeedPage key="public" mode="public" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </HashRouter>
    </AuthProvider>
  )
}
