create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar text not null default '🌊',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar', '🌊')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.pairs (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid references public.profiles(id) on delete cascade,
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 6)),
  days smallint[] not null default '{1,3,5}',
  notify_at time not null default '07:00',
  started_on date not null default current_date,
  created_at timestamptz not null default now(),
  constraint pairs_distinct_members check (user_b is null or user_a <> user_b)
);

create unique index if not exists pairs_user_a_key on public.pairs(user_a);
create unique index if not exists pairs_user_b_key on public.pairs(user_b) where user_b is not null;

create table if not exists public.passages (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  ref text not null,
  short_ref text not null,
  verses jsonb not null
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  passage_id uuid references public.passages(id),
  picked_verses smallint[] not null default '{}',
  a1 text not null default '',
  a2 text not null default '',
  a3 text not null default '',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (pair_id, user_id, date)
);

create index if not exists entries_pair_date_idx on public.entries(pair_id, date);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question smallint not null check (question between 1 and 3),
  kind text not null check (kind in ('pray', 'empathy', 'cheer')),
  created_at timestamptz not null default now(),
  unique (entry_id, user_id, question, kind)
);

create or replace function public.my_pair_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.pairs
  where user_a = auth.uid() or user_b = auth.uid()
  limit 1;
$$;

create or replace function public.is_unlocked(p_pair uuid, p_date date)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    select count(*)
    from public.entries
    where pair_id = p_pair
      and date = p_date
      and completed_at is not null
  ) >= 2;
$$;

create or replace function public.join_pair(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pair public.pairs%rowtype;
begin
  if public.my_pair_id() is not null then
    raise exception '이미 큐티메이트가 있습니다';
  end if;

  select *
  into v_pair
  from public.pairs
  where invite_code = upper(trim(p_code))
  for update;

  if not found then
    raise exception '초대 코드를 찾을 수 없습니다';
  end if;

  if v_pair.user_b is not null then
    raise exception '이미 연결된 초대 코드입니다';
  end if;

  if v_pair.user_a = auth.uid() then
    raise exception '자기 자신과는 연결할 수 없습니다';
  end if;

  update public.pairs
  set user_b = auth.uid()
  where id = v_pair.id;

  return v_pair.id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.pairs enable row level security;
alter table public.passages enable row level security;
alter table public.entries enable row level security;
alter table public.reactions enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select using (
  id = auth.uid()
  or exists (
    select 1
    from public.pairs p
    where (p.user_a = auth.uid() and p.user_b = profiles.id)
       or (p.user_b = auth.uid() and p.user_a = profiles.id)
  )
);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
for insert with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists pairs_select on public.pairs;
create policy pairs_select on public.pairs
for select using (user_a = auth.uid() or user_b = auth.uid());

drop policy if exists pairs_insert on public.pairs;
create policy pairs_insert on public.pairs
for insert with check (user_a = auth.uid());

drop policy if exists pairs_update on public.pairs;
create policy pairs_update on public.pairs
for update using (user_a = auth.uid() or user_b = auth.uid())
with check (user_a = auth.uid() or user_b = auth.uid());

drop policy if exists passages_select on public.passages;
create policy passages_select on public.passages
for select to anon, authenticated using (true);

drop policy if exists entries_select on public.entries;
create policy entries_select on public.entries
for select using (
  user_id = auth.uid()
  or (
    pair_id = public.my_pair_id()
    and completed_at is not null
    and public.is_unlocked(pair_id, date)
  )
);

drop policy if exists entries_insert on public.entries;
create policy entries_insert on public.entries
for insert with check (user_id = auth.uid() and pair_id = public.my_pair_id());

drop policy if exists entries_update on public.entries;
create policy entries_update on public.entries
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists reactions_select on public.reactions;
create policy reactions_select on public.reactions
for select using (
  exists (
    select 1
    from public.entries e
    where e.id = entry_id
      and e.pair_id = public.my_pair_id()
  )
);

drop policy if exists reactions_insert on public.reactions;
create policy reactions_insert on public.reactions
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.entries e
    where e.id = entry_id
      and e.pair_id = public.my_pair_id()
      and e.user_id <> auth.uid()
      and public.is_unlocked(e.pair_id, e.date)
  )
);

drop policy if exists reactions_delete on public.reactions;
create policy reactions_delete on public.reactions
for delete using (user_id = auth.uid());

insert into public.passages (date, ref, short_ref, verses)
values (
  current_date,
  '요한복음 15:1-8',
  '요 15',
  '[
    {"n":1,"t":"나는 참포도나무요 내 아버지는 농부라"},
    {"n":2,"t":"무릇 내게 붙어 있어 열매를 맺지 아니하는 가지는 아버지께서 그것을 제거해 버리시고 열매를 맺는 가지는 더 열매를 맺게 하려 하여 그것을 깨끗하게 하시느니라"},
    {"n":3,"t":"너희는 내가 일러준 말로 이미 깨끗하여졌으니"},
    {"n":4,"t":"내 안에 거하라 나도 너희 안에 거하리라 가지가 포도나무에 붙어 있지 아니하면 스스로 열매를 맺을 수 없음 같이 너희도 내 안에 있지 아니하면 그러하리라"},
    {"n":5,"t":"나는 포도나무요 너희는 가지라 그가 내 안에 내가 그 안에 거하면 사람이 열매를 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라"}
  ]'::jsonb
)
on conflict (date) do update
set ref = excluded.ref,
    short_ref = excluded.short_ref,
    verses = excluded.verses;
