우리만없어AI 팀의 프론트엔드 레포지터리입니다. 

브랜치전략 main (프로덕션)
├── develop (개발 메인)
├── feature/login (기능별 브랜치)
├── feature/chat
├── feature/profile
└── hotfix/critical-bug (긴급 수정)

브랜치 명명규칙 
feature/기능명
bugfix/버그명
hotfix/긴급수정명
release/버전명

커밋 메세지 규칙 
type(scope): description

Types:
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 코드
- chore: 기타 (빌드, 설정 등)

Examples:
- feat(auth): add login screen with validation
- fix(api): handle network error in websocket connection
- docs: update README with setup instructions
- style(components): fix button component styling


# 🏥 OnCare - 노인복지서비스

OnCare는 AI 기반 노인복지서비스를 진행하는 복지사를 위한 앱입니다.

## 📱 Features

- 👤 사용자 인증 (로그인/회원가입)
- 💬 실시간 채팅 (WebSocket)
- 🤖 AI 기반 복지사업무
- 👨‍⚕️ 노인요양보호사의 일정관리
- 📊 복지사와 보호사 사이에서의 매니징

## 🚀 Quick Start

### Prerequisites
- Node.js (≥ 14.0.0)
- React Native CLI
- Android Studio / Xcode

### Installation

```bash
# 프로젝트 클론
git clone https://github.com/WeAreNothingAI/frontend.git
cd frontend

# 의존성 설치
npm install

# iOS 의존성 설치 (iOS만)
cd ios && pod install && cd ..

# 앱 실행
npm run android  # Android
npm run ios      # iOS