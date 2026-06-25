-- GoalMatch database schema + Row-Level Security.
-- Paste this into the Supabase SQL Editor (Dashboard -> SQL -> New query) and Run.
-- Safe to re-run: uses "if not exists" / "or replace" where possible.

-- ---------------------------------------------------------------------------
-- profiles: one row per user, keyed to the auth user id.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  goal         text,
  name         text,
  role         text,
  location     text,
  commitment   text,
  idea_status  text,
  looking_for  text,
  skills       text[] default '{}',
  bio          text,
  photo_url    text,
  likes_you    boolean default false,   -- placeholder for demo/seed parity
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can read profiles (needed to build the deck + recommendations).
drop policy if exists "profiles are readable by authenticated" on public.profiles;
create policy "profiles are readable by authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- You can only insert/update your own row.
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- swipes: who swiped on whom, and which way.
-- ---------------------------------------------------------------------------
create table if not exists public.swipes (
  id         uuid primary key default gen_random_uuid(),
  swiper     uuid not null references auth.users (id) on delete cascade,
  swipee     uuid not null references auth.users (id) on delete cascade,
  direction  text not null check (direction in ('left', 'right')),
  created_at timestamptz default now(),
  unique (swiper, swipee)
);

alter table public.swipes enable row level security;

drop policy if exists "users insert own swipes" on public.swipes;
create policy "users insert own swipes"
  on public.swipes for insert
  to authenticated
  with check (auth.uid() = swiper);

drop policy if exists "users read own swipes" on public.swipes;
create policy "users read own swipes"
  on public.swipes for select
  to authenticated
  using (auth.uid() = swiper);

-- ---------------------------------------------------------------------------
-- matches: created automatically when two people swipe right on each other.
-- Stored with user_a < user_b so each pair is unique.
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references auth.users (id) on delete cascade,
  user_b     uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

alter table public.matches enable row level security;

drop policy if exists "users read own matches" on public.matches;
create policy "users read own matches"
  on public.matches for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

-- ---------------------------------------------------------------------------
-- intro_requests: the weekly-introduction-guarantee asks.
-- ---------------------------------------------------------------------------
create table if not exists public.intro_requests (
  id            uuid primary key default gen_random_uuid(),
  requester     uuid not null references auth.users (id) on delete cascade,
  target        uuid not null references auth.users (id) on delete cascade,
  goal_snapshot text,
  status        text not null default 'queued'
                  check (status in ('queued', 'introduced', 'declined')),
  created_at    timestamptz default now(),
  unique (requester, target)
);

alter table public.intro_requests enable row level security;

drop policy if exists "users insert own intro requests" on public.intro_requests;
create policy "users insert own intro requests"
  on public.intro_requests for insert
  to authenticated
  with check (auth.uid() = requester);

drop policy if exists "users read own intro requests" on public.intro_requests;
create policy "users read own intro requests"
  on public.intro_requests for select
  to authenticated
  using (auth.uid() = requester or auth.uid() = target);

-- ---------------------------------------------------------------------------
-- Auto-create a match when a right-swipe is reciprocated.
-- ---------------------------------------------------------------------------
create or replace function public.handle_swipe_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  a uuid;
  b uuid;
begin
  if new.direction = 'right' then
    -- did the other person already swipe right on me?
    if exists (
      select 1 from public.swipes s
      where s.swiper = new.swipee
        and s.swipee = new.swiper
        and s.direction = 'right'
    ) then
      a := least(new.swiper, new.swipee);
      b := greatest(new.swiper, new.swipee);
      insert into public.matches (user_a, user_b)
      values (a, b)
      on conflict (user_a, user_b) do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_swipe_created on public.swipes;
create trigger on_swipe_created
  after insert on public.swipes
  for each row execute function public.handle_swipe_match();

-- ---------------------------------------------------------------------------
-- Create an empty profile row automatically when a user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
