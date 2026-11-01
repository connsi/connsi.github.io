import { HashRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

// GitHub Pages는 SPA 라우팅(새로고침 시 404)을 지원하지 않아서 HashRouter를 씁니다.
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </HashRouter>
    </AuthProvider>
  )
}
