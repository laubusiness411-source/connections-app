-- Chat messages for matched users. Run this in the Supabase SQL Editor
-- (after schema.sql). Safe to re-run.

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
  sender     uuid not null references auth.users (id) on delete cascade,
  body       text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

-- You can read messages only for matches you're part of.
drop policy if exists "read messages in my matches" on public.messages;
create policy "read messages in my matches"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

-- You can send messages only as yourself, and only in your matches.
drop policy if exists "send messages in my matches" on public.messages;
create policy "send messages in my matches"
  on public.messages for insert
  to authenticated
  with check (
    sender = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

-- Enable realtime so new messages stream into open chats (idempotent).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
