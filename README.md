# 메모 앱 (React + Vite)

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

Firebase를 붙인 뒤에는 배포된 앱에서도 Firebase를 쓰도록
**Settings → Secrets and variables → Actions** 에 `.env.example`과 같은 이름(`VITE_FIREBASE_*`)으로
값을 등록하세요. 등록하지 않으면 배포된 앱은 로컬 모드로 동작합니다.

## 폴더 구조

```
recordish.github.io/
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages 자동 배포
├── index.html
├── vite.config.js
├── .env.example            # Firebase 설정값 예시 (복사해서 .env.local 로 사용)
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
    │   └── ProtectedRoute.jsx
    └── pages/              # 라우트 단위 화면
        ├── HomePage.jsx
        ├── LoginPage.jsx
        └── NotFoundPage.jsx
```

데이터 흐름: `pages` → `hooks` → `services` → (localStorage | Firebase).
컴포넌트는 저장소가 무엇인지 모르기 때문에 Firestore로 바꿔도 UI 코드는 그대로입니다.

## Firebase 연결하기

코드는 이미 Firebase(Google 로그인 + Firestore)를 지원합니다. 설정값만 넣으면 바로 동작합니다.
설정값이 없으면 지금처럼 로컬 모드(브라우저에 저장)로 동작합니다.

- 로그인한 사용자의 메모는 Firestore `users/{uid}/memos/{memoId}` 에 저장됩니다.
- 보안 규칙(`firestore.rules`): 본인 메모만 읽고 쓸 수 있습니다.

### 1. Firebase 프로젝트 만들기
1. [Firebase 콘솔](https://console.firebase.google.com)에서 **프로젝트 만들기**
2. 프로젝트 개요의 **웹(`</>`) 아이콘**으로 웹 앱 추가 → 화면에 나오는 `firebaseConfig` 값을 복사해 둡니다.
3. **Authentication → 시작하기 → 로그인 방법 → Google** 사용 설정
4. **Authentication → 설정 → 승인된 도메인**에 `recordish.github.io` 추가
5. **Firestore Database → 데이터베이스 만들기** (프로덕션 모드)
6. **Firestore Database → 규칙** 탭에 `firestore.rules` 내용을 붙여넣고 **게시**

### 2. 배포된 사이트에 연결
저장소 **Settings → Secrets and variables → Actions → New repository secret** 에서 아래 6개를 등록합니다.

| Secret 이름 | firebaseConfig 항목 |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

등록 후 Actions 탭에서 **Deploy to GitHub Pages → Run workflow** 로 다시 배포하면 적용됩니다.

### 3. 로컬 개발에서 사용 (선택)
```bash
cp .env.example .env.local   # 같은 값 채우기 (.env.local 은 git에 올라가지 않음)
npm run dev
```

에뮬레이터로 테스트하려면 `.env.local` 에 `VITE_USE_FIREBASE_EMULATOR=true` 를 넣고
`npx firebase-tools emulators:start --only auth,firestore --project demo-memo` 를 함께 실행합니다.

> 참고: Firebase 웹 설정값(apiKey 등)은 브라우저에 그대로 노출되는 공개 값입니다. 실제 보안은 보안 규칙이 담당합니다.
