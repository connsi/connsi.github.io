# Recordish — 메모 앱 (React + Vite)

**사이트: https://recordish.github.io/**

React + Vite로 만든 메모 웹 앱입니다. Google 계정으로 로그인하면 메모가 Firebase(Firestore)에 저장되어
어느 기기에서나 같은 메모를 볼 수 있습니다.

## 주요 기능

- **내 메모**: 메모 작성, 수정, 삭제. 로그인한 본인만 볼 수 있습니다
- **🔒 비공개 / 🌐 공개 선택**: 기본은 비공개이고, 공개로 고른 메모는 **공개 메모** 화면에 올라갑니다

## 화면

| 주소 | 이동 방법 | 보이는 메모 | 로그인하지 않으면 |
| --- | --- | --- | --- |
| `#/` | 로고(📝 Recordish) | 모두의 공개 메모 + 내 비공개 메모 (최신순으로 섞어서) | 공개 메모만 |
| `#/mine` | 비공개 탭 | 내 비공개 메모만 | 로그인 화면으로 이동 |
| `#/public` | 공개 탭 | 모두의 공개 메모만 | 그대로 볼 수 있음 |

- 왼쪽 위 **로고를 누르면 전체 화면**으로 갑니다
- 메모 입력창은 **전체**와 **비공개** 화면에 있습니다 (기본값 비공개)
- 내가 쓴 메모에만 ⋮(수정/삭제) 메뉴가 붙습니다. 공개 메모에는 작성자 번호, 비공개 메모에는 자물쇠가 보입니다
- 공개 메모는 20개씩 **더 보기**로 이어서 불러옵니다

## 실행 방법

Node.js 20.19+ 또는 22.12+ 가 필요합니다.

```bash
npm install      # 의존성 설치 (처음 한 번)
npm run dev      # 개발 서버 실행 → http://localhost:5173
```

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (저장하면 화면이 바로 갱신됨) |
| `npm run build` | 배포용 빌드 → `dist/` |
| `npm run preview` | 빌드 결과를 로컬에서 미리보기 |
| `npm run lint` | 코드 검사 (oxlint) |

`npm run dev`는 기본적으로 **로컬 모드**(Firebase 없이 브라우저 `localStorage`에 저장, 로그인·글자 제한 없음)로 동작합니다.
개발 중에도 Firebase를 쓰는 방법은 아래 [로컬 개발에서 Firebase 쓰기](#로컬-개발에서-firebase-쓰기)를 참고하세요.

## 배포 (GitHub Pages)

`main` 브랜치에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 앱을 검사(`lint`)하고 빌드해서
**https://recordish.github.io/** 에 배포합니다. Actions 탭에서 **Deploy to GitHub Pages → Run workflow**로 직접 다시 실행할 수도 있습니다.

- 처음 한 번만: 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정
- 배포된 앱은 `.env.production`의 Firebase 설정값을 사용합니다

> ⚠️ `firestore.rules`나 `firestore.indexes.json`을 바꾸면 **Firebase 콘솔에도 반영해야** 합니다
> (GitHub 배포만으로는 Firebase 쪽 설정이 바뀌지 않습니다). 아래 [Firebase 설정](#firebase-설정)을 참고하세요.

## 폴더 구조

```
recordish.github.io/
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages 자동 배포
├── index.html
├── vite.config.js
├── .env.production             # 배포용 Firebase 설정값 (공개 값)
├── .env.example                # Firebase 설정값 예시
├── firebase.json               # Firebase CLI/에뮬레이터 설정
├── firestore.rules             # Firestore 보안 규칙
├── firestore.indexes.json      # Firestore 색인 (공개 메모 최신순 정렬)
├── public/
│   └── favicon.svg             # 탭 아이콘
└── src/
    ├── main.jsx                # 진입점
    ├── App.jsx                 # 라우팅 + AuthProvider
    ├── index.css               # 전역 스타일 (색상 변수: 포인트 컬러 연한 블루)
    ├── firebase/
    │   └── config.js           # Firebase 초기화 (auth, db 내보냄)
    ├── services/               # 데이터/인증 접근 계층
    │   ├── memoService.js      #   메모 CRUD, 공개 메모 페이지, 하루 글자 사용량
    │   └── authService.js      #   로그인/로그아웃 (Firebase Auth)
    ├── contexts/
    │   └── AuthContext.jsx     # 로그인 사용자 전역 상태
    ├── hooks/
    │   ├── useMemos.js         # useFeed(전체/비공개/공개 목록 + 더 보기 + 작성·수정·삭제)
    │   └── useNow.js           # "3분 전" 표시 갱신용 현재 시각
    ├── utils/
    │   ├── authorId.js         # 공개 작성자 번호 (가입 일시)
    │   ├── relativeTime.js     # "방금 전 / 3분 전 / 2일 전" 변환
    │   └── text.js             # 글자 수 세기, 하루 글자 한도(10,000)
    ├── components/             # 재사용 UI 컴포넌트
    │   ├── Header.jsx          #   로고(→ 전체), 비공개/공개 탭
    │   ├── MemoEditor.jsx      #   메모 입력창 + 글자 수 + 공개/비공개 선택
    │   ├── MemoItem.jsx
    │   ├── MemoList.jsx
    │   ├── MoreMenu.jsx           # 점 세 개(⋮) 메뉴 (수정/삭제)
    │   ├── VisibilityToggle.jsx   # 🔒 비공개 / 🌐 공개 버튼
    │   ├── GoogleSignInButton.jsx # Google 스타일 로그인 버튼
    │   └── ProtectedRoute.jsx     # 로그인 필요 화면 (비로그인은 로그인 화면으로)
    └── pages/                  # 라우트 단위 화면
        ├── FeedPage.jsx        #   전체(#/) · 비공개(#/mine) · 공개(#/public)
        ├── LoginPage.jsx       #   로그인 (#/login)
        └── NotFoundPage.jsx
```

데이터 흐름: `pages` → `hooks` → `services` → (Firestore | localStorage).

## 데이터 구조 (Firestore)

| 경로 | 내용 |
| --- | --- |
| `memos/{memoId}` | `{ uid, authorName, content, isPublic, createdAt, updatedAt }` |
| `usage/{uid}` | `{ day: 20261102, chars: 1234 }` — 오늘(한국 시간) 쓴 글자 수 |

- **내 비공개 메모**: `uid == 내 uid` && `isPublic == false`로 전부 불러와 브라우저에서 최신순으로 정렬합니다
- **공개 메모**: `isPublic == true`, `updatedAt` 내림차순, 21개씩 읽어서 20개를 보여주고 다음 페이지가 있는지 판단합니다
  → 복합 색인(`isPublic` 오름차순 + `updatedAt` 내림차순)이 필요합니다 (`firestore.indexes.json`)
- **전체**: 위 두 목록을 합칩니다. 공개 메모가 더 남아 있으면, 마지막으로 불러온 공개 메모보다 오래된 비공개 메모는
  숨겨 두었다가 **더 보기**를 누를 때 함께 보여줘서 항상 최신순으로 섞이게 합니다 (`useFeed`, `src/hooks/useMemos.js`)
- **메모 작성·수정**: 메모와 `usage/{uid}`를 한 번에(batch) 저장합니다. 보안 규칙이 사용량이 정확히 늘었는지 확인합니다

### 보안 규칙 요약 (`firestore.rules`)

- 공개 메모는 누구나 읽을 수 있고, 비공개 메모는 작성자만 읽을 수 있습니다
- 작성, 수정, 삭제는 작성자만 할 수 있고, 작성자(`uid`)는 바꿀 수 없습니다. 필드 타입도 검사합니다
- 하루 글자 사용량(`usage/{uid}`)
  - 본인만 읽고 쓸 수 있고, 오늘 날짜로만 기록할 수 있습니다
  - 10,000자를 넘을 수 없고, 같은 날 안에서는 줄일 수 없습니다
  - 메모를 쓰거나 늘릴 때는 같은 batch에서 사용량이 정확히 그만큼 늘어나야 합니다
- 예전 저장 위치(`users/{uid}/memos`)는 본인 읽기/삭제만 허용합니다

## Firebase 설정

Firebase 프로젝트: `recordish`. 설정값은 `.env.production`에 있습니다.

> 이 값들(apiKey 등)은 브라우저에 그대로 공개되는 값이라 커밋해도 됩니다. 실제 보안은 보안 규칙이 담당합니다.

### 처음 만들 때 (이미 완료)
1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 만들기 → **웹(`</>`) 앱 추가** → `firebaseConfig` 값을 `.env.production`에 넣기
2. **Authentication → 로그인 방법 → Google** 사용 설정
3. **Authentication → 설정 → 승인된 도메인**에 `recordish.github.io` 추가
4. **Firestore Database → 데이터베이스 만들기** (프로덕션 모드, 위치 `asia-northeast3` 서울)

### 보안 규칙 반영
`firestore.rules`를 바꿨다면 **Firebase 콘솔 → Firestore Database → 규칙** 탭에 전체 내용을 붙여넣고 **게시**합니다.

### 색인 만들기
공개 메모를 최신순으로 20개씩 불러오려면 복합 색인이 필요합니다. 아래 링크를 열고 **색인 만들기**를 누르면 됩니다 (만드는 데 몇 분 걸림).

https://console.firebase.google.com/v1/r/project/recordish/firestore/indexes?create_composite=Ckdwcm9qZWN0cy9yZWNvcmRpc2gvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL21lbW9zL2luZGV4ZXMvXxABGgwKCGlzUHVibGljEAEaDQoJdXBkYXRlZEF0EAIaDAoIX19uYW1lX18QAg

또는 Firebase CLI로 `npx firebase-tools deploy --only firestore:indexes --project recordish`

### 로컬 개발에서 Firebase 쓰기
```bash
cp .env.production .env.local   # .env.local 은 git에 올라가지 않음
npm run dev
```

**에뮬레이터로 테스트하기** (실제 데이터를 건드리지 않음): `.env.local`에 `VITE_USE_FIREBASE_EMULATOR=true`를 넣고 아래를 함께 실행합니다.
```bash
npx firebase-tools emulators:start --only auth,firestore --project demo-memo
```
에뮬레이터는 `firestore.rules`와 `firestore.indexes.json`을 그대로 읽어서 실제와 같은 규칙으로 동작합니다.
