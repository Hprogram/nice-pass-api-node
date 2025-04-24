# NICE 본인인증 라이브러리

Node.js와 TypeScript로 구현된 NICE 본인인증 시스템 통합 라이브러리입니다. NestJS 또는 Express 프레임워크와 함께 사용할 수 있도록 설계되었습니다.

## 주요 기능

- NICE API를 통한 암호화된 인증 토큰 발급
- 인증 결과 검증 및 복호화
- Redis 기반 세션 저장소 (`express-session` 대체)
- 타입 안전성이 보장된 현대적인 코드 구조
- 간편한 API 통합
- 보안 강화된 데이터 처리

## 프로젝트 구조

```
src/
├── handlers/      # API 핸들러 및 비즈니스 로직
├── config.ts      # 설정 관리
├── cryptoHelper.ts # 암호화/복호화 유틸리티
├── index.ts       # 메인 진입점
├── redisStore.ts  # Redis 저장소 관리
└── types.ts       # TypeScript 타입 정의
```

## 설치 방법

```bash
npm install
```

## 사용 방법

### 1. 설정

```typescript
import { setNiceConfig } from '../src/config';

setNiceConfig({
  CLIENT_ID: 'your-client-id',
  SECRET_KEY: 'your-secret-key',
  API_URL: 'https://nice-api-url',
  PRODUCT_ID: 'your-product-id',
  RETURN_URL: 'your-return-url',
  ACCESS_TOKEN: 'your-access-token'
});
```

### 2. 본인인증 요청

```typescript
import { requestToken } from '../src/handlers/requestToken';

app.get("/checkplus_main", async (req, res) => {
  const callback = req.query.callback as string;
  const tokenData = await requestToken(redisClient, callback);
  // 인증 페이지로 리다이렉트
});
```

### 3. 콜백 처리

```typescript
import { verifyCallback } from '../src/handlers/verifyCallback';

app.all("/checkplus_success", async (req, res) => {
  const decryptedData = await verifyCallback(redisClient, {
    token_version_id,
    enc_data,
    integrity_value,
  });
  // 인증 결과 처리
});
```

## 주요 컴포넌트

### Config (`config.ts`)
- NICE API 설정 관리
- 환경 변수 및 API 엔드포인트 설정
- 인증 정보 관리

### Crypto Helper (`cryptoHelper.ts`)
- 데이터 암호화/복호화
- 보안 통신 처리
- 무결성 검증

### Redis Store (`redisStore.ts`)
- 세션 데이터 관리
- 토큰 저장 및 검증
- 임시 데이터 캐싱
- express-session 미들웨어 대체 구현
- 향상된 확장성과 성능 제공
- 분산 세션 관리 지원

### Types (`types.ts`)
- TypeScript 인터페이스 정의
- 타입 안전성 보장
- 데이터 구조 문서화

## 보안 고려사항

- 모든 API 키와 비밀키는 환경 변수로 관리
- 데이터 암호화 및 무결성 검증 필수
- Redis 연결은 보안 URL 사용
- 민감한 정보는 메모리에서 즉시 삭제

## Redis를 Express 세션 대신 사용한 이유

Redis를 세션 저장소로 선택한 주요 이유는 다음과 같습니다:

1. **성능**: 
   - 인메모리 데이터 저장으로 빠른 응답 속도
   - 선택적 영구 저장 지원
   - 기존 세션 저장소보다 월등한 성능

2. **확장성**: 
   - 분산 시스템 아키텍처 지원
   - 높은 동시 접속 처리 능력
   - 수평적 확장 용이

3. **보안**:
   - 향상된 세션 데이터 격리
   - 내장 데이터 암호화 지원
   - 설정 가능한 데이터 만료 정책

4. **신뢰성**:
   - 자동 장애 복구 기능
   - 데이터 영속성 옵션
   - 내장 복제 지원

5. **기능**:
   - 원자성 보장 작업
   - 내장 발행/구독 메시징
   - 다양한 데이터 구조 지원

## 라이선스

MIT 라이선스

Copyright (c) 2025 zeroho ([github.com/Hprogram](https://github.com/Hprogram))

## 기여 방법

1. 저장소 포크
2. 기능 브랜치 생성
3. 변경사항 커밋
4. 브랜치에 푸시
5. Pull Request 생성


---


# NICE Authentication Library

A Node.js + TypeScript library for integrating with the NICE identity verification system, designed to work seamlessly with NestJS or plain Express.

## Features

- Issue encrypted authentication tokens from NICE API
- Validate and decrypt authentication results
- Redis-based session storage (instead of `express-session`)
- Type-safe, modern code structure
- Simple API integration
- Enhanced security measures

## Project Structure

```
src/
├── handlers/      # API handlers and business logic
├── config.ts      # Configuration management
├── cryptoHelper.ts # Encryption/decryption utilities
├── index.ts       # Main entry point
├── redisStore.ts  # Redis storage management
└── types.ts       # TypeScript type definitions
```

## Installation

```bash
npm install
```

## Usage

### 1. Configuration

```typescript
import { setNiceConfig } from '../src/config';

setNiceConfig({
  CLIENT_ID: 'your-client-id',
  SECRET_KEY: 'your-secret-key',
  API_URL: 'https://nice-api-url',
  PRODUCT_ID: 'your-product-id',
  RETURN_URL: 'your-return-url',
  ACCESS_TOKEN: 'your-access-token'
});
```

### 2. Request Authentication

```typescript
import { requestToken } from '../src/handlers/requestToken';

app.get("/checkplus_main", async (req, res) => {
  const callback = req.query.callback as string;
  const tokenData = await requestToken(redisClient, callback);
  // Redirect to authentication page
});
```

### 3. Handle Callback

```typescript
import { verifyCallback } from '../src/handlers/verifyCallback';

app.all("/checkplus_success", async (req, res) => {
  const decryptedData = await verifyCallback(redisClient, {
    token_version_id,
    enc_data,
    integrity_value,
  });
  // Process authentication result
});
```

## Core Components

### Config (`config.ts`)
- NICE API configuration management
- Environment variables and API endpoint settings
- Authentication information management

### Crypto Helper (`cryptoHelper.ts`)
- Data encryption/decryption
- Secure communication handling
- Integrity verification

### Redis Store (`redisStore.ts`)
- Session data management
- Token storage and validation
- Temporary data caching
- Replaces traditional express-session middleware
- Provides better scalability and performance
- Enables distributed session management

### Types (`types.ts`)
- TypeScript interface definitions
- Type safety enforcement
- Data structure documentation

## Security Considerations

- All API keys and secrets managed through environment variables
- Mandatory data encryption and integrity verification
- Secure URL implementation for Redis connections
- Immediate disposal of sensitive information from memory

## Why Redis Instead of Express Session

Redis was chosen as a session store replacement for several key reasons:

1. **Performance**: Redis provides in-memory data storage with optional persistence, making it significantly faster than traditional session stores.

2. **Scalability**: 
   - Supports distributed system architecture
   - Handles high concurrent loads efficiently
   - Easy to scale horizontally

3. **Security**:
   - Better session data isolation
   - Built-in data encryption support
   - Configurable data expiration

4. **Reliability**:
   - Automatic failover capabilities
   - Data persistence options
   - Built-in replication support

5. **Features**:
   - Atomic operations
   - Built-in pub/sub messaging
   - Rich data structure support

## License

MIT License

Copyright (c) 2025 zeroho ([github.com/Hprogram](https://github.com/Hprogram))

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request