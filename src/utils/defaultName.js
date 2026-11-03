// 기본 이름: "Running Wolf", "Quiet River" 같은 두 단어 영어 이름
// 계정 ID(uid)로 정해서 같은 사람은 늘 같은 이름이고, 24 × 24 = 576가지입니다.
// 모든 조합이 20자 이하(이름 최대 길이)가 되도록 단어를 골랐습니다.
const FIRST = [
  'Running', 'Dancing', 'Singing', 'Laughing', 'Dreaming', 'Soaring', 'Howling', 'Shining',
  'Wandering', 'Whispering', 'Rising', 'Falling', 'Sleeping', 'Roaring', 'Gentle', 'Brave',
  'Quiet', 'Swift', 'Wise', 'Silver', 'Golden', 'Little', 'Proud', 'Wild',
]
const SECOND = [
  'Wolf', 'Bear', 'Eagle', 'Hawk', 'Fox', 'Owl', 'Deer', 'Horse',
  'Buffalo', 'River', 'Moon', 'Sun', 'Star', 'Cloud', 'Wind', 'Rain',
  'Thunder', 'Fire', 'Stone', 'Leaf', 'Tree', 'Mountain', 'Sky', 'Lake',
]

// 문자열 → 32비트 숫자 (FNV-1a)
function hash(text) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

export function natureName(uid) {
  if (!uid) return '익명'
  const h = hash(uid)
  return `${FIRST[h % FIRST.length]} ${SECOND[Math.floor(h / FIRST.length) % SECOND.length]}`
}

export const NAME_WORDS = { FIRST, SECOND }
