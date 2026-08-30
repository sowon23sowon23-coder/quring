-- CURING schema — 1:1 QT Mate MVP
-- Supabase SQL Editor 에 통째로 붙여넣어 실행하세요. 재실행 가능(idempotent).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- daily_scriptures
-- ---------------------------------------------------------------------------
create table if not exists public.daily_scriptures (
  id uuid primary key default gen_random_uuid(),
  scripture_date date not null unique,
  bible_book text not null,
  chapter int not null,
  verse text not null,
  bible_text text not null,
  focus_verse text not null,
  qt_question_1 text not null,
  qt_question_2 text not null,
  qt_question_3 text not null,
  prayer_question text not null,
  created_by uuid references public.profiles(id),
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists daily_scriptures_touch on public.daily_scriptures;
create trigger daily_scriptures_touch before update on public.daily_scriptures
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- qt_entries / qt_answers
-- ---------------------------------------------------------------------------
create table if not exists public.qt_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  daily_scripture_id uuid not null references public.daily_scriptures(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'completed')),
  completed_at timestamptz,
  word_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, daily_scripture_id)
);

drop trigger if exists qt_entries_touch on public.qt_entries;
create trigger qt_entries_touch before update on public.qt_entries
  for each row execute function public.touch_updated_at();

create table if not exists public.qt_answers (
  id uuid primary key default gen_random_uuid(),
  qt_entry_id uuid not null references public.qt_entries(id) on delete cascade,
  question_key text not null check (question_key in ('heart_verse', 'message', 'practice', 'prayer')),
  answer_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (qt_entry_id, question_key)
);

drop trigger if exists qt_answers_touch on public.qt_answers;
create trigger qt_answers_touch before update on public.qt_answers
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- qt_mates (1:1) / qt_schedules
-- ---------------------------------------------------------------------------
create table if not exists public.qt_mates (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  invite_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'ended')),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint one_to_one_pair check (requester_id is distinct from receiver_id)
);

-- 한 사람은 활성(accepted) 메이트를 하나만
create unique index if not exists qt_mates_active_requester
  on public.qt_mates (requester_id) where status = 'accepted';
create unique index if not exists qt_mates_active_receiver
  on public.qt_mates (receiver_id) where status = 'accepted';

create table if not exists public.qt_schedules (
  id uuid primary key default gen_random_uuid(),
  qt_mate_id uuid not null references public.qt_mates(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  created_at timestamptz not null default now(),
  unique (qt_mate_id, weekday)
);

-- ---------------------------------------------------------------------------
-- reactions / comments / notifications / aquarium
-- ---------------------------------------------------------------------------
create table if not exists public.qt_reactions (
  id uuid primary key default gen_random_uuid(),
  qt_entry_id uuid not null references public.qt_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('amen', 'pray', 'heart')),
  created_at timestamptz not null default now(),
  unique (qt_entry_id, user_id, reaction_type)
);

create table if not exists public.qt_comments (
  id uuid primary key default gen_random_uuid(),
  qt_entry_id uuid not null references public.qt_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('mate_completed', 'mate_accepted', 'reaction', 'comment', 'qt_day', 'streak')),
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.aquarium_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_qt_count int not null default 0,
  current_streak int not null default 0,
  mate_qt_count int not null default 0,
  unlocked_items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 보안 헬퍼 (SECURITY DEFINER — RLS 재귀를 피하기 위해 소유자 권한으로 실행)
-- ---------------------------------------------------------------------------
create or replace function public.are_mates(a uuid, b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.qt_mates m
    where m.status = 'accepted'
      and ((m.requester_id = a and m.receiver_id = b)
        or (m.requester_id = b and m.receiver_id = a))
  );
$$;

-- 대상 엔트리를 현재 사용자가 볼 수 있는가? (둘 다 같은 본문을 완료 + 메이트 관계)
create or replace function public.can_view_entry(target_entry uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.qt_entries target
    join public.qt_entries mine
      on mine.daily_scripture_id = target.daily_scripture_id
     and mine.user_id = auth.uid()
    where target.id = target_entry
      and target.status = 'completed'
      and mine.status = 'completed'
      and public.are_mates(target.user_id, auth.uid())
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- RPC: 초대 미리보기 / 수락
-- ---------------------------------------------------------------------------
create or replace function public.get_invite(token text)
returns table (requester_nickname text, status text, is_self boolean)
language sql
security definer
set search_path = public
stable
as $$
  select p.nickname, m.status, (m.requester_id = auth.uid())
  from public.qt_mates m
  join public.profiles p on p.id = m.requester_id
  where m.invite_token = token;
$$;

create or replace function public.accept_invite(token text)
returns public.qt_mates
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.qt_mates;
begin
  select * into target from public.qt_mates where invite_token = token for update;

  if target.id is null then
    raise exception '초대를 찾을 수 없습니다.' using errcode = 'P0002';
  end if;
  if target.status <> 'pending' then
    raise exception '이미 처리된 초대입니다.' using errcode = 'P0001';
  end if;
  if target.requester_id = auth.uid() then
    raise exception '자신의 초대는 수락할 수 없습니다.' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.qt_mates m
    where m.status = 'accepted'
      and auth.uid() in (m.requester_id, m.receiver_id)
  ) then
    raise exception '이미 활성 메이트가 있습니다.' using errcode = 'P0001';
  end if;

  update public.qt_mates
     set receiver_id = auth.uid(),
         status = 'accepted',
         accepted_at = now()
   where id = target.id
   returning * into target;

  insert into public.notifications (user_id, actor_id, type)
  values (target.requester_id, auth.uid(), 'mate_accepted');

  return target;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.daily_scriptures enable row level security;
alter table public.qt_entries enable row level security;
alter table public.qt_answers enable row level security;
alter table public.qt_mates enable row level security;
alter table public.qt_schedules enable row level security;
alter table public.qt_reactions enable row level security;
alter table public.qt_comments enable row level security;
alter table public.notifications enable row level security;
alter table public.aquarium_progress enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles insert self" on public.profiles;
create policy "profiles insert self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles
  for update using (auth.uid() = id);

-- daily_scriptures --------------------------------------------------------
drop policy if exists "scriptures read" on public.daily_scriptures;
create policy "scriptures read" on public.daily_scriptures
  for select using (auth.role() = 'authenticated');

drop policy if exists "scriptures admin write" on public.daily_scriptures;
create policy "scriptures admin write" on public.daily_scriptures
  for all using (public.is_admin()) with check (public.is_admin());

-- qt_entries ------------------------------------------------------------
drop policy if exists "entries select own or unlocked" on public.qt_entries;
create policy "entries select own or unlocked" on public.qt_entries
  for select using (auth.uid() = user_id or public.can_view_entry(id));

drop policy if exists "entries insert own" on public.qt_entries;
create policy "entries insert own" on public.qt_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "entries update own" on public.qt_entries;
create policy "entries update own" on public.qt_entries
  for update using (auth.uid() = user_id);

drop policy if exists "entries delete own" on public.qt_entries;
create policy "entries delete own" on public.qt_entries
  for delete using (auth.uid() = user_id);

-- qt_answers ----------------------------------------------------------
drop policy if exists "answers select" on public.qt_answers;
create policy "answers select" on public.qt_answers
  for select using (
    exists (select 1 from public.qt_entries e where e.id = qt_entry_id and e.user_id = auth.uid())
    or public.can_view_entry(qt_entry_id)
  );

drop policy if exists "answers write own" on public.qt_answers;
create policy "answers write own" on public.qt_answers
  for all using (
    exists (select 1 from public.qt_entries e where e.id = qt_entry_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.qt_entries e where e.id = qt_entry_id and e.user_id = auth.uid())
  );

-- qt_mates ----------------------------------------------------------
drop policy if exists "mates select own" on public.qt_mates;
create policy "mates select own" on public.qt_mates
  for select using (auth.uid() = requester_id or auth.uid() = receiver_id);

drop policy if exists "mates insert as requester" on public.qt_mates;
create policy "mates insert as requester" on public.qt_mates
  for insert with check (auth.uid() = requester_id);

drop policy if exists "mates update participant" on public.qt_mates;
create policy "mates update participant" on public.qt_mates
  for update using (auth.uid() = requester_id or auth.uid() = receiver_id);

drop policy if exists "mates delete requester" on public.qt_mates;
create policy "mates delete requester" on public.qt_mates
  for delete using (auth.uid() = requester_id);

-- qt_schedules ----------------------------------------------------
drop policy if exists "schedules participant" on public.qt_schedules;
create policy "schedules participant" on public.qt_schedules
  for all using (
    exists (
      select 1 from public.qt_mates m
      where m.id = qt_schedules.qt_mate_id
        and (auth.uid() = m.requester_id or auth.uid() = m.receiver_id)
    )
  ) with check (
    exists (
      select 1 from public.qt_mates m
      where m.id = qt_schedules.qt_mate_id
        and (auth.uid() = m.requester_id or auth.uid() = m.receiver_id)
    )
  );

-- qt_reactions --------------------------------------------------
drop policy if exists "reactions select" on public.qt_reactions;
create policy "reactions select" on public.qt_reactions
  for select using (auth.uid() = user_id or public.can_view_entry(qt_entry_id));

drop policy if exists "reactions insert self" on public.qt_reactions;
create policy "reactions insert self" on public.qt_reactions
  for insert with check (auth.uid() = user_id and public.can_view_entry(qt_entry_id));

drop policy if exists "reactions delete self" on public.qt_reactions;
create policy "reactions delete self" on public.qt_reactions
  for delete using (auth.uid() = user_id);

-- qt_comments -------------------------------------------------
drop policy if exists "comments select" on public.qt_comments;
create policy "comments select" on public.qt_comments
  for select using (auth.uid() = user_id or public.can_view_entry(qt_entry_id));

drop policy if exists "comments insert self" on public.qt_comments;
create policy "comments insert self" on public.qt_comments
  for insert with check (auth.uid() = user_id and public.can_view_entry(qt_entry_id));

drop policy if exists "comments update self" on public.qt_comments;
create policy "comments update self" on public.qt_comments
  for update using (auth.uid() = user_id);

drop policy if exists "comments delete self" on public.qt_comments;
create policy "comments delete self" on public.qt_comments
  for delete using (auth.uid() = user_id);

-- notifications ---------------------------------------------
drop policy if exists "notifications recipient read" on public.notifications;
create policy "notifications recipient read" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications recipient update" on public.notifications;
create policy "notifications recipient update" on public.notifications
  for update using (auth.uid() = user_id);

-- aquarium_progress --------------------------------------
drop policy if exists "aquarium owner read" on public.aquarium_progress;
create policy "aquarium owner read" on public.aquarium_progress
  for select using (auth.uid() = user_id);

drop policy if exists "aquarium owner write" on public.aquarium_progress;
create policy "aquarium owner write" on public.aquarium_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
