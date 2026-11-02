import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { deleteAccount, logout } from '../services/authService'
import { signupId } from '../utils/authorId'

// 계정 화면: 공개 이름(가입 일시 번호), 로그아웃, 회원 탈퇴
export default function AccountPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  if (!user) return <p className="empty">로컬 모드에서는 계정 기능이 없습니다.</p>

  const handleDelete = async () => {
    const ok = confirm(
      '정말 탈퇴할까요?\n\n공개·비공개 메모를 포함한 모든 데이터가 바로 삭제되며 되돌릴 수 없습니다.',
    )
    if (!ok) return
    setBusy(true)
    try {
      await deleteAccount()
      alert('탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.')
      navigate('/', { replace: true })
    } catch (e) {
      alert(`탈퇴하지 못했습니다.\n${e.message}`)
      setBusy(false)
    }
  }

  return (
    <div className="account">
      <h2 className="page-title">계정</h2>
      <dl className="account-info">
        <dt>로그인 계정</dt>
        <dd>{user.email}</dd>
        <dt>공개 메모에 표시되는 이름</dt>
        <dd>{signupId(user)}</dd>
      </dl>
      <button type="button" onClick={logout}>로그아웃</button>

      <section className="danger-zone">
        <h3>회원 탈퇴</h3>
        <p>탈퇴하면 공개·비공개 메모를 포함한 모든 데이터가 바로 삭제되며 되돌릴 수 없습니다.</p>
        <button type="button" className="danger" onClick={handleDelete} disabled={busy}>
          {busy ? '탈퇴 처리 중…' : '회원 탈퇴'}
        </button>
      </section>

      <p className="links">
        <a href="/privacy.html">개인정보처리방침</a>
      </p>
    </div>
  )
}
