// 공개 메모에 보여줄 작성자 이름
// Google 이름 대신 가입 일시(한국 시간)를 YYMMDDHHmmss 12자리 숫자로 만듭니다.
// 예: 2026-11-02 14:42:12 가입 → '261102144212'
const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function signupId(user) {
  const created = user?.metadata?.creationTime
  const date = created ? new Date(created) : null
  if (!date || Number.isNaN(date.getTime())) return '익명'
  const part = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]))
  return `${part.year}${part.month}${part.day}${part.hour}${part.minute}${part.second}`
}
