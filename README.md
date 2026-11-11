# 📖 VocaEng - 영어 단어 학습 웹앱 (Firebase "englishtest" 연동)

Firebase 프로젝트 **"englishtest"**와 연동하여 사용자가 직접 영어 단어를 추가/수정/삭제하고, Firestore의 `users/{userId}` 경로에 데이터를 안전하게 저장하며 Vercel로 손쉽게 배포할 수 있는 풀스택 웹 애플리케이션입니다.

---

## ✨ 핵심 기능

1. **사용자 인증 (Authentication)**
   - **Google 계정 로그인 / 로그아웃**: 원클릭 구글 팝업 인증.
   - **이메일 / 패스워드 로그인 & 회원가입**: 닉네임 설정 및 한국어 오류 메시지 안내.
2. **단어 관리 (CRUD)**
   - **추가 (Create)**: 단어, 뜻, 품사, 예문, 예문 해석, 카테고리 태그 등록.
   - **수정 (Update)**: 등록된 단어의 모든 필드 편집.
   - **삭제 (Delete)**: 확인 팝업 후 안전하게 삭제.
   - **암기 상태 토글 (Memorized)**: 암기 완료 시 축하 폭죽(Confetti) 효과.
   - **TTS 발음 듣기**: Web Speech API를 활용한 원어민 음성 발음 재생.
3. **Firestore 영구 저장 및 데이터 구조**
   - 각 사용자의 단어 데이터는 Firestore의 **`users/{userId}/words/{wordId}`** 경로에 실시간 동기화(onSnapshot)로 저장됩니다.
   - 브라우저를 닫거나 다시 로그인해도 데이터가 그대로 유지됩니다.
4. **사용자별 데이터 완전 격리**
   - Firestore Security Rules (`firestore.rules`)를 통해 로그인한 사용자 본인(`request.auth.uid == userId`)의 데이터에만 접근할 수 있도록 보안 규칙이 작성되어 있습니다.
5. **학습 보조 도구**
   - **3D 플래시카드**: 스페이스바/화살표 키보드 지원, 앞면(단어)과 뒷면(뜻/예문) 뒤집기 학습.
   - **4지선다 어휘력 퀴즈**: 사용자가 등록한 단어들을 기반으로 랜덤 생성되는 퀴즈 및 점수 계산.
   - **검색 및 다중 필터**: 단어/뜻 검색, 전체/학습중/암기완료 탭 필터, 카테고리별 필터, 최신순/알파벳순 정렬.
6. **Vercel 배포 최적화**
   - `vercel.json` SPA 리다이렉트 설정 포함.

---

## 📁 프로젝트 구조

```
english-voca-app/
├── public/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx           # Google & 이메일/비밀번호 로그인 모달
│   │   ├── FirebaseConfigModal.jsx # Firebase 설정 확인 및 브라우저 내 빠른 설정 모달
│   │   ├── FlashcardModal.jsx      # 3D 단어 플래시카드 학습 모드
│   │   ├── Navbar.jsx              # 상단 네비게이션 및 사용자 상태
│   │   ├── QuizModal.jsx           # 4지선다 단어 퀴즈 모드
│   │   ├── StatsBanner.jsx         # 암기 달성률 및 요약 대시보드
│   │   ├── WordCard.jsx            # 개별 단어 카드 (TTS, 뜻 가리기, 수정, 삭제)
│   │   ├── WordFormModal.jsx       # 단어 추가/수정 팝업 모달
│   │   └── WordList.jsx            # 검색/필터/정렬 및 단어 목록
│   ├── context/
│   │   └── AuthContext.jsx         # 인증 상태 및 로그인/로그아웃 Context
│   ├── firebase.js                 # Firebase Auth & Firestore CRUD 함수 모음
│   ├── index.css                   # Tailwind CSS 및 3D 플립 애니메이션
│   ├── App.jsx                     # 메인 화면
│   └── main.jsx
├── .env.example                    # 환경변수 예시 파일
├── .env.local                      # 로컬 환경변수 파일 (프로젝트 ID: englishtest 지정됨)
├── firestore.rules                 # Firestore 보안 규칙 (사용자 격리)
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json                     # Vercel SPA 배포 라우팅 설정
└── vite.config.js
```

---

## 🚀 로컬 실행 방법

1. **터미널에서 의존성 설치 및 개발 서버 실행**:
   ```bash
   cd english-voca-app
   npm run dev
   ```
2. 브라우저에서 `http://localhost:3000` 접속

---

## ⚙️ Firebase 프로젝트 "englishtest" 설정 안내

웹앱이 Firebase와 원활하게 통신하기 위해 [Firebase Console](https://console.firebase.google.com/)에서 다음 3가지를 확인해주세요.

### 1. Authentication (인증) 제공업체 활성화
1. Firebase Console > **englishtest** 프로젝트 선택
2. 좌측 메뉴 **빌드 > Authentication** > **Sign-in method** 탭으로 이동
3. 다음 두 가지 로그인 방식을 사용 설정(Enabled)합니다:
   - **Google**: 사용 설정 클릭 후 지원 이메일 선택 후 저장
   - **이메일/비밀번호**: 사용 설정 클릭 후 저장

### 2. Cloud Firestore 데이터베이스 생성 및 보안 규칙 적용
1. 좌측 메뉴 **빌드 > Firestore Database** 이동 (아직 데이터베이스가 없다면 '데이터베이스 만들기' 클릭)
2. **규칙(Rules)** 탭을 클릭하고, 프로젝트의 `firestore.rules` 파일 내용을 복사하여 붙여넣은 뒤 **[게시(Publish)]**합니다:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         
         match /words/{wordId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }

         match /{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```
   > 💡 이 규칙 덕분에 사용자는 오직 자신의 UID에 해당하는 `users/{userId}/...` 데이터만 읽고 쓸 수 있으며 타인의 데이터는 차단됩니다.

### 3. Firebase SDK 키 설정 (2가지 방법 중 편한 방법 선택)

#### 방법 A: 웹 화면에서 직접 입력 (가장 간편)
- 웹앱을 켜고 우측 상단 톱니바퀴 아이콘(설정)을 누릅니다.
- Firebase 콘솔의 **프로젝트 설정 > 일반 > [내 앱]**의 웹 앱 SDK 설정 코드를 복사해서 붙여넣고 저장하면 즉시 연동됩니다.

#### 방법 B: `.env.local` 파일에 기입
`.env.local` 파일에 Firebase Console의 값을 입력합니다:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=englishtest.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=englishtest
VITE_FIREBASE_STORAGE_BUCKET=englishtest.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:...
```

---

## 🌐 Vercel 배포 방법

### 옵션 1. GitHub 연동을 통한 Vercel 배포 (권장)
1. 코드를 GitHub 저장소에 푸시합니다.
2. [Vercel 대시보드](https://vercel.com)에 로그인 후 **"Add New Project"**를 클릭하여 저장소를 Import합니다.
3. **Environment Variables**에 `.env.local`에 들어가는 Firebase 키들을 등록합니다:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID` (`englishtest`)
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. **[Deploy]** 버튼을 누르면 약 1분 내에 배포가 완료됩니다!

### 옵션 2. Vercel CLI로 바로 배포
```bash
npx vercel
```
터미널 프롬프트에 따라 로그인 및 설정을 진행하면 즉시 배포 URL이 생성됩니다.

> ⚠️ **중요 (Firebase 승인된 도메인 등록)**:
> Vercel 배포 후 발급받은 도메인(예: `englishtest-voca.vercel.app`)을
> Firebase Console > **Authentication** > **Settings** > **Authorized domains (승인된 도메인)**에 추가해야 Google 로그인이 정상 작동합니다.

