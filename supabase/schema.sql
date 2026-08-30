create extension if not exists "pgcrypto";

create table public.profiles (
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

create table public.daily_scriptures (
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

create table public.qt_entries (
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

create table public.qt_answers (
  id uuid primary key default gen_random_uuid(),
  qt_entry_id uuid not null references public.qt_entries(id) on delete cascade,
  question_key text not null check (question_key in ('heart_verse', 'message', 'practice', 'prayer')),
  answer_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (qt_entry_id, question_key)
);

create table public.qt_mates (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  invite_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked', 'ended')),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint one_to_one_pair check (requester_id <> receiver_id)
);

create table public.qt_schedules (
  id uuid primary key default gen_random_uuid(),
  qt_mate_id uuid not null references public.qt_mates(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  created_at timestamptz not null default now(),
  unique (qt_mate_id, weekday)
);

create table public.qt_reactions (
  id uuid primary key default gen_random_uuid(),
  qt_entry_id uuid not null references public.qt_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('amen', 'pray', 'heart')),
  created_at timestamptz not null default now(),
  unique (qt_entry_id, user_id, reaction_type)
);

create table public.qt_comments (
  id uuid primary key default gen_random_uuid(),
  qt_entry_id uuid not null references public.qt_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('mate_completed', 'reaction', 'prayer', 'comment', 'qt_day', 'streak')),
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.aquarium_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_qt_count int not null default 0,
  current_streak int not null default 0,
  mate_qt_count int not null default 0,
  unlocked_items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create view public.qt_mate_unlocks as
select
  mine.id as my_entry_id,
  theirs.id as mate_entry_id,
  mate.id as qt_mate_id,
  mine.user_id as user_id,
  theirs.user_id as mate_user_id,
  mine.daily_scripture_id,
  (mine.status = 'completed' and theirs.status = 'completed') as can_view_each_other
from public.qt_mates mate
join public.qt_entries mine
  on mine.user_id in (mate.requester_id, mate.receiver_id)
join public.qt_entries theirs
  on theirs.daily_scripture_id = mine.daily_scripture_id
 and theirs.user_id in (mate.requester_id, mate.receiver_id)
 and theirs.user_id <> mine.user_id
where mate.status = 'accepted';

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

create policy "Profiles are readable by signed-in users" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Scriptures are readable by signed-in users" on public.daily_scriptures
  for select using (auth.role() = 'authenticated');

create policy "Admins manage scriptures" on public.daily_scriptures
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Users manage own qt entries" on public.qt_entries
  for all using (auth.uid() = user_id);

create policy "Users manage answers through own entries" on public.qt_answers
  for all using (
    exists (select 1 from public.qt_entries e where e.id = qt_entry_id and e.user_id = auth.uid())
  );

create policy "Users read unlocked mate entries" on public.qt_entries
  for select using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.qt_mate_unlocks u
      where u.mate_entry_id = qt_entries.id
        and u.user_id = auth.uid()
        and u.can_view_each_other
    )
  );
