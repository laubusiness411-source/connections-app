-- Waitlist signups from the landing page. Run in the Supabase SQL Editor.
-- Safe to re-run.

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  school     text,
  source     text default 'landing',
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

-- Anyone (anonymous visitors) may JOIN the waitlist...
drop policy if exists "anyone can join waitlist" on public.waitlist;
create policy "anyone can join waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- ...but nobody can read it through the public API (no select policy).
-- View signups in the Supabase dashboard (Table Editor) instead.
