# Supabase 연결 순서

프로젝트: `jrmgdmopefiqzvacnxeh` (`.env.local` 에 URL/anon key 이미 있음)

## 1. 스키마 적용

Supabase 대시보드 → **SQL Editor** → New query → [`schema.sql`](schema.sql) 전체 붙여넣기 → Run.

- 재실행 가능(idempotent). 에러 없이 끝나야 함.
- `auth.users` 트리거가 생성되므로, 이후 가입하는 계정은 `profiles` 행이 자동 생성됨.

## 2. 기본 말씀 시드

같은 SQL Editor 에서 [`seed.sql`](seed.sql) 붙여넣기 → Run.

- `daily_scriptures` 에 14일치(2026-08-24 ~ 09-06)가 들어감.
- `lib/scriptures.ts` 와 동일한 내용. 로그인 사용자는 이 테이블을 우선 읽게 됨.

## 3. Auth 설정 (대시보드 → Authentication)

- **Email** provider 켜기.
- 개발 편의: Authentication → Providers → Email → "Confirm email" 을 잠시 꺼두면
  가입 즉시 로그인됨. 배포 전 다시 켜기.
- Site URL / Redirect URLs 에 `http://localhost:3000` 추가.

## 4. 확인

```bash
npm run dev
```

- `/login` 에서 가입 → 홈에서 헤더에 이메일이 보이면 연결 성공.
- 기존에 게스트로 쓴 로컬 기록은 첫 로그인 시 계정으로 자동 이전됨(마이그레이션).

## 관리자 지정

특정 계정을 admin 으로:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

admin 은 `daily_scriptures` 를 추가/수정할 수 있음(어드민 화면은 추후).

## 데이터 모델 메모

- `daily_scriptures` 가 로그인 사용자의 본문 소스. 없으면 앱이 `lib/scriptures.ts` 로 폴백.
- `qt_entries` 는 `(user_id, daily_scripture_id)` 유니크 → 하루 한 엔트리.
- 상호 공개: `can_view_entry()` 함수가 "둘 다 같은 본문 완료 + accepted 메이트" 를 검사.
  뷰 대신 SECURITY DEFINER 함수를 쓰는 이유는 RLS 재귀를 피하기 위함.
- 초대: `qt_mates.invite_token` → `get_invite(token)` 로 미리보기, `accept_invite(token)` 로 수락.
