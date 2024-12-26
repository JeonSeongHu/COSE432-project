# COSE432-project

해당 레포지토리는 고려대학교 COSE432 (인간컴퓨터상호작용입문) 의 최종 프로젝트 제출물로,
3D 공연장 좌석 선택이 가능한 티켓팅 서비스를 구현하였습닌다..

## 기술 스택

- React 18
- TypeScript
- Vite
- Three.js (@react-three/fiber, @react-three/drei)
- Redux Toolkit
- Framer Motion


# 설치 및 실행 가이드

## 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn


## WSL 환경

### 설치 방법

1. 저장소 클론
   ```bash
   git clone https://github.com/JeonSeongHu/COSE432-project
   cd ticketing-service
   ```

2. 의존성 설치
   ```bash
   npm install
   # 또는
   yarn install
   ```

### 개발 서버 실행

개발 모드로 실행:
```bash
npm run dev
# 또는
yarn dev
```
- 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

1. 빌드 생성:
   ```bash
   npm run build
   # 또는
   yarn build
   ```

2. 빌드 미리보기:
   ```bash
   npm run preview
   # 또는
   yarn preview
   ```

### 테스트 실행

테스트를 실행하려면:
```bash
npm run test
# 또는
yarn test
```

> **WSL 환경에서 확인됨**: 위 작업들은 WSL2(Windows Subsystem for Linux) 환경에서 정상적으로 작동함이 확인되었습니다.


## macOS 환경

### 설치 방법

1. 저장소 클론
   ```bash
   git clone https://github.com/JeonSeongHu/COSE432-project
   cd ticketing-service
   ```

2. 의존성 설치
   ```bash
   npm install
   # 또는
   yarn install
   ```

### 개발 서버 실행

개발 모드로 실행:
```bash
npm run dev
# 또는
yarn dev
```
- 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

1. 빌드 생성:
   ```bash
   npm run build
   # 또는
   yarn build
   ```

2. 빌드 미리보기:
   ```bash
   npm run preview
   # 또는
   yarn preview
   ```

### 테스트 실행

테스트를 실행하려면:
```bash
npm run test
# 또는
yarn test
```

> **주의**: macOS 환경에서 테스트되지 않았으므로 사용 시 주의가 필요합니다.

## Windows 환경

### 설치 방법

1. 저장소 클론
   ```cmd
   git clone https://github.com/JeonSeongHu/COSE432-project
   cd ticketing-service
   ```

2. 의존성 설치
   ```cmd
   npm install
   :: 또는
   yarn install
   ```

### 개발 서버 실행

개발 모드로 실행:
```cmd
npm run dev
:: 또는
yarn dev
```
- 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

1. 빌드 생성:
   ```cmd
   npm run build
   :: 또는
   yarn build
   ```

2. 빌드 미리보기:
   ```cmd
   npm run preview
   :: 또는
   yarn preview
   ```

### 테스트 실행

테스트를 실행하려면:
```cmd
npm run test
:: 또는
yarn test
```

> **주의**: Windows 환경에서 테스트되지 않았으므로 사용 시 주의가 필요합니다.
