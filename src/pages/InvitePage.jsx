import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loginWithEmail, signUpWithInvite } from '../services/authService'

// 테스터용 숨은 화면 (#/invite): 초대 코드로 가입하거나, 가입한 이메일로 로그인합니다.
// 메뉴에는 보이지 않으며, 초대 코드가 없으면 가입할 수 없습니다.
export default function InvitePage() {
  const { user } = useAuth()
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signup') await signUpWithInvite(code, email, password)
      else await loginWithEmail(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="invite">
      <h2 className="page-title">테스터 {mode === 'signup' ? '가입' : '로그인'}</h2>
      <div className="visibility" role="tablist" aria-label="가입 또는 로그인">
        <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setError('') }}>
          초대 코드로 가입
        </button>
        <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setError('') }}>
          이메일 로그인
        </button>
      </div>
      <form className="invite-form" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <label>
            초대 코드
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="예: RCD-7F3K-9Q2M" autoCapitalize="characters" autoComplete="off" required />
          </label>
        )}
        <label>
          이메일
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label>
          <span>비밀번호 {mode === 'signup' && <span className="hint">(6자 이상)</span>}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? '처리 중…' : mode === 'signup' ? '가입하기' : '로그인'}
        </button>
      </form>
      <p className="links">
        가입하면 <a href="/privacy.html">개인정보처리방침</a>에 동의하는 것으로 봅니다.
      </p>
    </div>
  )
}
