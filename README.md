# CURING Web

CURING은 말씀을 읽고, 묵상을 기록하고, 1:1 QT Mate와 같은 날의 묵상을 조용히 나누는
차분한 QT 워크스페이스입니다.

## Stack

- Next.js App Router / TypeScript
- Tailwind CSS
- Supabase (선택적 계정 · DB 동기화)
- Lucide Icons

## 구조

- `app/(app)/*` — 실제 라우트: `/`(홈), `/scripture`, `/write`, `/mate`, `/archive`, `/archive/[date]`
- `app/login` — 선택적 로그인 (없어도 게스트로 사용 가능)
- `components/app/*` — 공용 셸, QT 상태 컨텍스트, 훅
- `components/views/*` — 화면별 뷰
- `lib/scriptures.ts` — 로컬 기본 본문 14일치 (관리자가 Supabase에 넣으면 그 값이 우선)
- `lib/qt-local.ts` — 게스트 기록 저장 (브라우저, 날짜·사용자별 분리)

## 동작 방식

- 로그인 없이 바로 사용 가능. 기록은 이 브라우저에 날짜별로 저장됩니다.
- 오늘 날짜에 해당하는 본문을 자동 선택하고, 없으면 가장 최근 본문으로 대체합니다.
- QT 질문은 그날 본문 레코드에서 옵니다 (하드코딩 아님).
- "친구 QT"의 상호 공개 규칙은 로컬 데모 토글로 확인할 수 있으며,
  실제 초대·수락·상대 묵상 표시는 라이브 DB 연결이 필요합니다.

## Run

```bash
npm install
npm run dev
```

## Supabase 연결 (선택)

`.env.local` 에 값을 넣으면 계정 로그인과 DB 동기화가 활성화됩니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- 스키마: `supabase/schema.sql`
- 기본 말씀 시드: `supabase/seed.sql` (`lib/scriptures.ts` 와 동일한 14일치)
