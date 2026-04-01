# 일비롱디자인 자사몰 MVP

유아교육기관(유치원·어린이집) 전문 디자인 업체 **일비롱디자인** 자사몰입니다.

## 기술 스택
- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **TypeScript**
- **Supabase** (데이터베이스 + 파일 스토리지)
- **토스페이먼츠** (결제 위젯, 테스트 모드)

## 시작하기

### 1. 의존성 설치
```bash
cd "C:\Users\leese\OneDrive\바탕 화면\ilbirong-mall"
npm install
```

### 2. 환경 변수 설정
`.env.local.example`을 복사해서 `.env.local`을 만들고 값을 채워주세요:
```bash
cp .env.local.example .env.local
```

필수 환경 변수:
| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스페이먼츠 클라이언트 키 (기본: 테스트키) |
| `TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 (기본: 테스트키) |
| `GMAIL_USER` | 알림 이메일 주소 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 |
| `ADMIN_EMAIL` | 알림 받을 관리자 이메일 |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | 관리자 페이지 비밀번호 (기본: 1234) |
| `NEXT_PUBLIC_BASE_URL` | 사이트 URL |

### 3. Supabase 설정
1. [Supabase](https://supabase.com) 프로젝트 생성 (기존 order 프로젝트 재사용 가능)
2. `supabase_schema.sql` 파일 내용을 SQL Editor에서 실행
3. Storage에서 `order-images` 버킷 생성 (Public으로 설정)

### 4. 개발 서버 실행
```bash
npm run dev
# http://localhost:3000 접속
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 메인 쇼핑 페이지 (카테고리 필터 + 상품 그리드) |
| `/products/[id]` | 상품 상세 (옵션 선택 + 기관명/문구 입력) |
| `/cart` | 장바구니 (배송비 자동 계산) |
| `/checkout` | 결제 (토스페이먼츠 위젯) |
| `/checkout/success` | 결제 성공 |
| `/checkout/fail` | 결제 실패 |
| `/estimate` | **견적 계산기** (비규격 현수막 단가 계산) |
| `/custom-order` | **비규격 주문서** (맞춤 제작 주문 접수) |
| `/admin` | **관리자 페이지** (몰 주문 + 비규격 주문 통합 관리) |
| `/review/[id]` | 시안 검토 페이지 (고객용) |

## 핵심 기능

### 배송비 로직
- 실물 상품(현수막, 배너, 포맥스 등)이 장바구니에 있으면 **3,000원**
- 디지털 도안만 있으면 **무료**

### 필수 입력 필드 (실물 상품)
1. **기관명을 적어주세요**
2. **문구변경사항있으시면적어주세요.없으면x길면카톡전달**

### 토스페이먼츠 테스트 결제
- 기본 테스트 클라이언트 키가 내장되어 있어 바로 위젯이 렌더링됩니다
- 실제 결제로 전환 시 `.env.local`에서 실제 키로 교체

### 견적 계산기
- 기존 ilbirong 프로젝트의 비규격 단가 계산 로직 완전 이식
- primead.kr 실측 공급사 원가 + 55% 마진 자동 계산
- 후가공(아일렛, 큐방, 로프 등) 옵션 포함
- 견적 복사 → 카카오톡 전달 기능

### 관리자 페이지 (`/admin`)
- 몰 주문 + 비규격 주문 통합 관리
- 주문 상태 변경 (접수 → 작업중 → 시안 확인 요청중 → ... → 완료)
- 시안 이미지 업로드 및 고객 전달
- 비밀번호: `.env.local`의 `NEXT_PUBLIC_ADMIN_PASSWORD` (기본: 1234)

## 상품 데이터 수정
`src/lib/products.ts` 파일에서 상품 정보 및 이미지를 수정할 수 있습니다.
실제 상품 이미지 추가 시 `imageUrl` 속성을 교체해주세요.
