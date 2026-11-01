import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="empty">
      <p>페이지를 찾을 수 없습니다.</p>
      <Link to="/">홈으로</Link>
    </div>
  )
}
