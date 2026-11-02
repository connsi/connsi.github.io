// 비공개(기본) / 공개 선택 버튼
export default function VisibilityToggle({ isPublic, onChange }) {
  return (
    <div className="visibility" role="radiogroup" aria-label="공개 범위">
      <button type="button" role="radio" aria-checked={!isPublic} className={!isPublic ? 'on' : ''} onClick={() => onChange(false)}>
        🔒 비공개
      </button>
      <button type="button" role="radio" aria-checked={isPublic} className={isPublic ? 'on' : ''} onClick={() => onChange(true)}>
        🌐 공개
      </button>
    </div>
  )
}
