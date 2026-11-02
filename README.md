# Recordish — 메모 앱 (React + Vite)

React + Vite로 만든 메모 웹 앱입니다. Firebase를 설정하면 Google 로그인 후 Firestore에 저장하고,
설정하지 않으면 브라우저 `localStorage`에 저장하는 로컬 모드로 동작합니다.

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

## 배포 (GitHub Pages)

`main` 브랜치에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 앱을 빌드해서
**https://recordish.github.io/** 에 배포합니다.

처음 한 번만 설정이 필요합니다:
- 저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 변경

Actions 탭에서 **Deploy to GitHub Pages** 워크플로를 직접 다시 실행할 수도 있습니다(Run workflow).

배포된 앱은 `.env.production` 의 Firebase 설정값을 사용합니다 (아래 "Firebase 연결하기" 참고).

## 폴더 구조

```
recordish.github.io/
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages 자동 배포
├── index.html
├── vite.config.js
├── .env.production         # 배포용 Firebase 설정값
├── .env.example            # Firebase 설정값 예시
├── firebase.json           # Firebase CLI/에뮬레이터 설정
├── firestore.rules         # Firestore 보안 규칙
├── public/                 # 그대로 복사되는 정적 파일 (favicon 등)
└── src/
    ├── main.jsx            # 진입점
    ├── App.jsx             # 라우팅 + AuthProvider
    ├── index.css           # 전역 스타일
    ├── firebase/
    │   └── config.js       # Firebase 초기화 (auth, db 내보냄)
    ├── services/           # 데이터/인증 접근 계층
    │   ├── memoService.js  #   메모 CRUD (Firestore / localStorage)
    │   └── authService.js  #   로그인/로그아웃 (Firebase Auth)
    ├── contexts/
    │   └── AuthContext.jsx # 로그인 사용자 전역 상태
    ├── hooks/
    │   └── useMemos.js     # 메모 목록 상태 + CRUD 훅
    ├── components/         # 재사용 UI 컴포넌트
    │   ├── Header.jsx
    │   ├── MemoEditor.jsx
    │   ├── MemoItem.jsx
    │   ├── MemoList.jsx
    │   ├── ProtectedRoute.jsx
    │   └── VisibilityToggle.jsx  # 비공개/공개 선택
    └── pages/              # 라우트 단위 화면
        ├── HomePage.jsx
        ├── LoginPage.jsx
        ├── PublicPage.jsx      # 모두의 공개 메모
        └── NotFoundPage.jsx
```

데이터 흐름: `pages` → `hooks` → `services` → (localStorage | Firebase).
컴포넌트는 저장소가 무엇인지 모르기 때문에 Firestore로 바꿔도 UI 코드는 그대로입니다.

## Firebase 연결하기

코드는 이미 Firebase(Google 로그인 + Firestore)를 지원합니다. 설정값만 넣으면 바로 동작합니다.
설정값이 없으면 지금처럼 로컬 모드(브라우저에 저장)로 동작합니다.

- 메모는 Firestore `memos/{memoId}` 에 저장됩니다: `{ uid, authorName, content, isPublic, createdAt, updatedAt }`
- 메모를 쓸 때 **🔒 비공개(기본) / 🌐 공개**를 고를 수 있습니다.
  - 비공개 메모: 작성자만 볼 수 있습니다 (**내 메모** 화면).
  - 공개 메모: 로그인하지 않은 사람도 **공개 메모** 화면(`#/public`)에서 작성자 이름과 함께 볼 수 있습니다.
  - 작성, 수정, 삭제는 작성자만 할 수 있습니다.
- 보안 규칙(`firestore.rules`)이 위 권한을 서버에서 강제합니다. **규칙을 바꾸면 Firebase 콘솔 → Firestore → 규칙에 다시 게시해야 합니다.**
- 예전 위치(`users/{uid}/memos`)에 있던 메모는 로그인할 때 자동으로 `memos`로 옮겨집니다 (비공개로).

### 1. Firebase 프로젝트 만들기
1. [Firebase 콘솔](https://console.firebase.google.com)에서 **프로젝트 만들기**
2. 프로젝트 개요의 **웹(`</>`) 아이콘**으로 웹 앱 추가 → 화면에 나오는 `firebaseConfig` 값을 복사해 둡니다.
3. **Authentication → 시작하기 → 로그인 방법 → Google** 사용 설정
4. **Authentication → 설정 → 승인된 도메인**에 `recordish.github.io` 추가
5. **Firestore Database → 데이터베이스 만들기** (프로덕션 모드)
6. **Firestore Database → 규칙** 탭에 `firestore.rules` 내용을 붙여넣고 **게시**

### 2. 설정값 넣기
`firebaseConfig` 값은 저장소의 **`.env.production`** 에 들어 있습니다. 배포할 때(`npm run build`) 이 값을 읽습니다.
다른 Firebase 프로젝트로 바꾸려면 이 파일의 값만 바꾸고 `main`에 머지하면 됩니다.

> 이 값들은 브라우저에 그대로 공개되는 값이라 커밋해도 됩니다. 실제 보안은 `firestore.rules` 가 담당합니다.

### 3. 로컬 개발에서 사용 (선택)
`npm run dev` 는 기본적으로 로컬 모드(브라우저 저장)로 동작합니다.
개발 중에도 Firebase를 쓰려면 `.env.production` 내용을 `.env.local` 로 복사하세요 (`.env.local` 은 git에 올라가지 않음).
```bash
cp .env.production .env.local
npm run dev
```

에뮬레이터로 테스트하려면 `.env.local` 에 `VITE_USE_FIREBASE_EMULATOR=true` 를 넣고
`npx firebase-tools emulators:start --only auth,firestore --project demo-memo` 를 함께 실행합니다.

> 참고: Firebase 웹 설정값(apiKey 등)은 브라우저에 그대로 노출되는 공개 값입니다. 실제 보안은 보안 규칙이 담당합니다.
