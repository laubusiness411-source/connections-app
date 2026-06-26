-- Education fields on profiles. Run in the Supabase SQL Editor. Safe to re-run.
alter table public.profiles add column if not exists school text;
alter table public.profiles add column if not exists edu_status text;
alter table public.profiles add column if not exists grad_year text;
