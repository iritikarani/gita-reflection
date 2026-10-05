-- Gita Reflection — Supabase schema
-- Run once in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: it only creates what is missing and replaces policies/functions.
--
-- Every table is protected by row-level security: a signed-in person can only
-- read and change their own rows. The public "anon" key in the website cannot
-- read anyone's reflections.

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 80),
  plan text not null default 'free' check (plan in ('free', 'premium')),
  journey_finished_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Saved reflections ----------
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  source text check (char_length(source) <= 40),
  said text check (char_length(said) <= 1000),
  emotion text check (char_length(emotion) <= 40),
  theme_group text check (char_length(theme_group) <= 40),
  verse_id text check (char_length(verse_id) <= 12),
  question text check (char_length(question) <= 500),
  body text check (char_length(body) <= 20000)
);
create index if not exists reflections_user_created on public.reflections (user_id, created_at desc);

-- ---------- Saved verses ----------
create table if not exists public.saved_verses (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  verse_id text not null check (char_length(verse_id) <= 12),
  created_at timestamptz not null default now(),
  primary key (user_id, verse_id)
);

-- ---------- 7-day journey ----------
create table if not exists public.journey_entries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day smallint not null check (day between 1 and 7),
  body text check (char_length(body) <= 20000),
  done boolean not null default false,
  reflection_id uuid references public.reflections (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ---------- "What did this month teach you?" ----------
create table if not exists public.month_notes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  body text check (char_length(body) <= 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

-- ---------- Premium: guided programs (14 / 30 days) ----------
create table if not exists public.program_entries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program text not null check (char_length(program) <= 40),
  day smallint not null check (day between 1 and 60),
  body text check (char_length(body) <= 20000),
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, program, day)
);

-- ---------- Premium: personal shlok collections ----------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  verse_ids text[] not null default '{}' check (cardinality(verse_ids) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists collections_user on public.collections (user_id, created_at desc);

-- ---------- Row-level security ----------
alter table public.profiles enable row level security;
alter table public.reflections enable row level security;
alter table public.saved_verses enable row level security;
alter table public.journey_entries enable row level security;
alter table public.month_notes enable row level security;
alter table public.program_entries enable row level security;
alter table public.collections enable row level security;

drop policy if exists "own profile: read" on public.profiles;
create policy "own profile: read" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "own profile: update" on public.profiles;
create policy "own profile: update" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- People may change their name and journey date, but never their own plan.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name, journey_finished_at) on public.profiles to authenticated;

do $$
declare t text;
begin
  foreach t in array array['reflections', 'saved_verses', 'journey_entries', 'month_notes', 'program_entries', 'collections'] loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- Premium features are written only by Premium members.
create or replace function public.require_premium()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select plan from public.profiles where id = new.user_id), 'free') <> 'premium' then
    raise exception 'premium_required' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke execute on function public.require_premium() from public, anon, authenticated;

drop trigger if exists collections_premium on public.collections;
create trigger collections_premium before insert or update on public.collections
  for each row execute function public.require_premium();

-- Day 1 of each program is a free preview.
create or replace function public.require_premium_after_day_one()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.day > 1 and coalesce((select plan from public.profiles where id = new.user_id), 'free') <> 'premium' then
    raise exception 'premium_required' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke execute on function public.require_premium_after_day_one() from public, anon, authenticated;

drop trigger if exists program_entries_premium on public.program_entries;
create trigger program_entries_premium before insert or update on public.program_entries
  for each row execute function public.require_premium_after_day_one();

-- ---------- Create a profile when someone signs up ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', ''), 80))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Free plan limit (keep in sync with freeSavedLimit in assets/js/config.js) ----------
create or replace function public.enforce_free_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select plan from public.profiles where id = new.user_id), 'free') <> 'premium'
     and (select count(*) from public.reflections where user_id = new.user_id) >= 50 then
    raise exception 'free_limit_reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reflections_free_limit on public.reflections;
create trigger reflections_free_limit
  before insert on public.reflections
  for each row execute function public.enforce_free_limit();

-- ---------- Let people delete their own account (and, by cascade, all their data) ----------
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_free_limit() from public, anon, authenticated;

-- To give someone Premium (until payments are connected):
--   update public.profiles set plan = 'premium' where id = (select id from auth.users where email = 'person@example.com');
