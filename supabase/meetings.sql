-- Meetings: scheduling proposals between two connected users. Run in the
-- Supabase SQL Editor (after schema.sql + messages.sql). Safe to re-run.

create table if not exists public.meetings (
  id             uuid primary key default gen_random_uuid(),
  match_id       uuid not null references public.matches (id) on delete cascade,
  proposer       uuid not null references auth.users (id) on delete cascade,
  recipient      uuid not null references auth.users (id) on delete cascade,
  slots          jsonb default '[]'::jsonb,
  call_type      text,
  duration       text,
  note           text,
  status         text not null default 'proposed'
                   check (status in ('proposed', 'confirmed', 'declined')),
  confirmed_slot jsonb,
  created_at     timestamptz default now()
);

alter table public.meetings enable row level security;

drop policy if exists "read meetings in my matches" on public.meetings;
create policy "read meetings in my matches"
  on public.meetings for select
  to authenticated
  using (auth.uid() = proposer or auth.uid() = recipient);

drop policy if exists "create meetings" on public.meetings;
create policy "create meetings"
  on public.meetings for insert
  to authenticated
  with check (auth.uid() = proposer);

drop policy if exists "update meetings in my matches" on public.meetings;
create policy "update meetings in my matches"
  on public.meetings for update
  to authenticated
  using (auth.uid() = proposer or auth.uid() = recipient)
  with check (auth.uid() = proposer or auth.uid() = recipient);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'meetings'
  ) then
    alter publication supabase_realtime add table public.meetings;
  end if;
end $$;
