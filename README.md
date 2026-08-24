# CURING

> 혼자 말고, 우리 같이 큐티해요 🌊

한 사람과 짝을 이뤄 같은 말씀을 읽고, **둘 다 묵상을 써야 서로의 글이 열리는** 큐티 앱.

React Native (Expo) · Supabase · TypeScript

---

## 빠르게 실행하기

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
# .env 에 Supabase URL / anon key 입력
npx expo start
```

휴대폰에 **Expo Go** 앱을 설치하고 터미널의 QR을 찍으면 바로 뜹니다.

---

## 1. Supabase 세팅

1. [supabase.com](https://supabase.com) → New project (region은 **Northeast Asia (Seoul)** 권장)
2. 좌측 **SQL Editor** → `supabase/schema.sql` 전체를 붙여넣고 **Run**
3. **Project Settings → API** 에서 두 값을 복사해 `.env` 에 넣기
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - anon public → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. **Authentication → Providers**
   - Email: 기본 켜져 있음 (매직 링크 로그인)
   - Kakao: 사용하려면 [Kakao Developers](https://developers.kakao.com)에서 앱 생성 후 REST API 키/시크릿 입력
5. **Authentication → URL Configuration → Redirect URLs** 에 추가
   ```
   curing://
   exp://127.0.0.1:8081
   ```

> `service_role` 키는 절대 앱에 넣지 마세요. 클라이언트 번들은 누구나 뜯어볼 수 있습니다.

## 2. 데이터 모델

| 테이블 | 역할 |
|---|---|
| `profiles` | auth.users 확장 (이름, 아바타) |
| `pairs` | 큐어링 한 쌍. `user_b`가 null이면 **혼자 모드** |
| `passages` | 날짜별 본문. 앱은 본문만 제공하고 **어떤 절을 고를지는 사용자가 정한다** |
| `entries` | 하루치 묵상 (사람당 1개). `completed_at`이 채워지면 완료 |
| `reactions` | 친구 묵상에 남기는 🙏 💛 🌱 |

### 큐어링 잠금은 DB가 처리합니다

이 앱의 핵심 규칙 — *둘 다 써야 열린다* — 은 화면에서 가리는 게 아니라 **RLS 정책**으로 강제합니다.

```sql
create policy entries_select on public.entries for select using (
  user_id = auth.uid()                          -- 내 글은 언제나
  or (
    pair_id = public.my_pair_id()
    and completed_at is not null
    and public.is_unlocked(pair_id, date)       -- 둘 다 완료했을 때만
  )
);
```

상대가 아직 안 썼다면 API 응답에 그 행 자체가 없습니다. 클라이언트를 아무리 뜯어도 미리 볼 수 없어요.

## 3. 프로젝트 구조

```
app/                        expo-router (파일 = 라우트)
├── index.tsx               세션·온보딩 상태에 따라 분기
├── (onboarding)/
│   ├── intro.tsx           서비스 소개 3장
│   ├── login.tsx           매직 링크 / 카카오
│   └── setup.tsx           프로필 → 혼자·함께 → 초대 → 요일
├── (tabs)/                 홈 / 기록 / 마이  ← MVP는 3탭
│   ├── index.tsx
│   ├── record.tsx
│   └── my.tsx
└── qt/                     큐티는 탭이 아니라 풀스크린 플로우
    ├── verse.tsx           본문 + 구절 표시
    ├── write.tsx           말씀 고정 패널 + 3문항
    ├── wait.tsx            🔒 상대 기다리기
    └── together.tsx        🔓 서로의 묵상 + 리액션

src/
├── lib/supabase.ts         클라이언트
├── lib/api.ts              모든 쿼리는 여기로 모읍니다
├── store/session.tsx       세션 · 프로필 · pair 컨텍스트
├── store/draft.tsx         작성 중 임시 상태
├── components/             ui.tsx, VerseList.tsx
├── theme.ts                디자인 토큰
└── types.ts

supabase/schema.sql         테이블 + RLS + 샘플 본문
```

## 4. 매일의 본문 넣기

지금은 `schema.sql`이 오늘 날짜로 요한복음 15:1–8 하나만 넣습니다. 운영에서는 둘 중 하나로:

- **간단히** — Supabase Table Editor에서 `passages`에 미리 한 달 치 입력
- **자동으로** — Supabase Edge Function + `pg_cron`으로 매일 새벽에 삽입

## 5. 빌드 & 출시

```bash
npm install -g eas-cli
eas login
eas init                      # app.json 의 projectId 채워짐
eas build --profile preview --platform android   # 팀 테스트용 APK
eas build --profile production --platform all    # 스토어 제출용
eas submit --platform ios
```

`.env`는 커밋되지 않으므로 EAS에도 따로 등록해야 합니다.

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..." --environment production
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..." --environment production
```

## 6. 다음 할 일

- [ ] 푸시 알림 — `expo-notifications` + Edge Function (큐티 시작 / 친구 완료 / 큐어링 오픈)
- [ ] 주간 나눔 카드 — 한 주 묵상에서 키워드·나눔 질문 생성
- [ ] 기록 탭 날짜 상세 화면
- [ ] 초대 딥링크 (`curing://invite/CODE`) — 지금은 코드 복붙
- [ ] Realtime 구독 — 상대가 완료하면 대기 화면이 자동으로 열리게
- [ ] `npx supabase gen types typescript` 로 `Database` 타입 교체

## 7. 알아둘 것

- **디자인 토큰**은 `src/theme.ts`에 프로토타입(`curing-prototype.html`) 값 그대로 옮겨 뒀습니다. 색을 바꾸려면 여기만 고치면 됩니다.
- 헤더는 그라디언트 대신 단색입니다. 그라디언트를 쓰려면 `expo-linear-gradient`를 설치하세요.
- 날짜는 항상 `theme.ts`의 `today()`를 쓰세요. `toISOString()`은 UTC라 밤 9시 이후 날짜가 하루 밀립니다.
