# 메모 앱 (React + Vite)

React + Vite로 만든 메모 웹 앱입니다. 지금은 브라우저 `localStorage`에 저장하고,
나중에 Firebase(Authentication, Firestore)를 붙일 수 있도록 구조를 잡아 두었습니다.

## 실행 방법

Node.js 20.19+ 또는 22.12+ 가 필요합니다.

```bash
cd memo-app
npm install      # 의존성 설치 (처음 한 번)
npm run dev      # 개발 서버 실행 → http://localhost:5173
```

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (저장하면 화면이 바로 갱신됨) |
| `npm run build` | 배포용 빌드 → `dist/` |
| `npm run preview` | 빌드 결과를 로컬에서 미리보기 |
| `npm run lint` | 코드 검사 (oxlint) |

## 폴더 구조

```
memo-app/
├── index.html
├── vite.config.js
├── .env.example            # Firebase 설정값 예시 (복사해서 .env.local 로 사용)
├── public/                 # 그대로 복사되는 정적 파일 (favicon 등)
└── src/
    ├── main.jsx            # 진입점
    ├── App.jsx             # 라우팅 + AuthProvider
    ├── index.css           # 전역 스타일
    ├── firebase/
    │   └── config.js       # Firebase 초기화 (auth, db 내보냄)
    ├── services/           # 데이터/인증 접근 계층 ← Firebase 연결 시 여기만 수정
    │   ├── memoService.js  #   메모 CRUD (현재 localStorage)
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

## Firebase 연결하기 (나중에)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성 → 웹 앱 추가
2. **Authentication** → 로그인 방법에서 **Google** 사용 설정
   (배포 도메인은 Authentication → 설정 → 승인된 도메인에 추가)
3. **Firestore Database** 생성
4. 설정값 넣기:
   ```bash
   cp .env.example .env.local   # 값 채우기 (.env.local 은 git에 올라가지 않음)
   ```
5. 개발 서버를 다시 시작하면 헤더의 "로컬 모드" 표시가 사라지고 로그인이 필요해집니다.
6. `src/services/memoService.js`의 함수들을 Firestore 호출로 바꿉니다
   (경로 예: `users/{uid}/memos/{memoId}`). 예시:
   ```js
   import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
   import { db } from '../firebase/config'

   export async function createMemo(uid, { title, content }) {
     return addDoc(collection(db, 'users', uid, 'memos'), {
       title, content, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
     })
   }
   ```
7. Firestore 보안 규칙으로 본인 메모만 접근하도록 제한합니다:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/memos/{memoId} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

> 참고: Firebase 웹 설정값(apiKey 등)은 공개되어도 되는 값입니다. 실제 보안은 위의 보안 규칙이 담당합니다.
