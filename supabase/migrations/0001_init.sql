-- Radio From Scratch — initial schema, functions, and RLS.
-- Run in the Supabase SQL editor (or via the Supabase CLI) for a fresh project.

-- =====================================================================
-- Extensions
-- =====================================================================
create extension if not exists "pgcrypto";

-- =====================================================================
-- updated_at helper trigger
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- profiles
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  "fName" text not null,
  "lName" text not null,
  email text not null unique,
  email_domain text not null,
  institution_name text not null,
  institution_country text not null,
  membership_status text not null default 'pending'
    check (membership_status in ('pending', 'approved', 'rejected')),
  role text not null default 'member'
    check (role in ('member', 'admin')),
  review_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_membership_status_idx on public.profiles (membership_status);
create index if not exists profiles_email_domain_idx on public.profiles (email_domain);
create index if not exists profiles_institution_country_idx on public.profiles (institution_country);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =====================================================================
-- allowed_email_domains (learned trusted-domain dictionary)
-- =====================================================================
create table if not exists public.allowed_email_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  organization_name text not null,
  auto_approve boolean not null default true,
  trust_source text not null default 'admin_review'
    check (trust_source in ('admin_review', 'manual_seed', 'manual_admin')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- categories
-- =====================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- =====================================================================
-- videos
-- =====================================================================
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  youtube_url text not null,
  youtube_video_id text,
  thumbnail_url text,
  access_level text not null default 'members'
    check (access_level in ('public', 'members')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_access_status_idx on public.videos (access_level, status);
create index if not exists videos_category_idx on public.videos (category_id);
create index if not exists videos_display_order_idx on public.videos (display_order);

drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

-- =====================================================================
-- video_access_events
-- =====================================================================
create table if not exists public.video_access_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  event_type text not null default 'redirect'
    check (event_type in ('redirect')),
  created_at timestamptz not null default now()
);

create index if not exists video_access_events_profile_idx on public.video_access_events (profile_id);
create index if not exists video_access_events_video_idx on public.video_access_events (video_id);
create index if not exists video_access_events_created_at_idx on public.video_access_events (created_at);

-- =====================================================================
-- Helper functions
-- =====================================================================
create or replace function public.current_user_is_approved()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    join auth.users on auth.users.id = profiles.id
    where profiles.id = auth.uid()
      and profiles.membership_status = 'approved'
      and auth.users.email_confirmed_at is not null
  );
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    join auth.users on auth.users.id = profiles.id
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.membership_status = 'approved'
      and auth.users.email_confirmed_at is not null
  );
$$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.allowed_email_domains enable row level security;
alter table public.categories enable row level security;
alter table public.videos enable row level security;
alter table public.video_access_events enable row level security;

-- profiles: self or admin can read. No direct browser writes.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (
  id = auth.uid()
  or public.current_user_is_admin()
);

-- allowed_email_domains: approved users may read; admins manage.
drop policy if exists "allowed_domains_select_approved" on public.allowed_email_domains;
create policy "allowed_domains_select_approved"
on public.allowed_email_domains
for select
using (public.current_user_is_approved());

drop policy if exists "allowed_domains_admin_all" on public.allowed_email_domains;
create policy "allowed_domains_admin_all"
on public.allowed_email_domains
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

-- categories: public read if used by a published public video; approved read all.
drop policy if exists "categories_select_public_or_approved" on public.categories;
create policy "categories_select_public_or_approved"
on public.categories
for select
using (
  public.current_user_is_approved()
  or exists (
    select 1
    from public.videos
    where videos.category_id = categories.id
      and videos.status = 'published'
      and videos.access_level = 'public'
  )
);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all"
on public.categories
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

-- videos: public read published public rows; approved read all published; admin all.
drop policy if exists "videos_select_public_or_approved" on public.videos;
create policy "videos_select_public_or_approved"
on public.videos
for select
using (
  (
    status = 'published'
    and access_level = 'public'
  )
  or (
    status = 'published'
    and public.current_user_is_approved()
  )
  or public.current_user_is_admin()
);

drop policy if exists "videos_admin_all" on public.videos;
create policy "videos_admin_all"
on public.videos
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

-- video_access_events: users insert their own; self or admin can read.
drop policy if exists "video_access_events_insert_self" on public.video_access_events;
create policy "video_access_events_insert_self"
on public.video_access_events
for insert
with check (profile_id = auth.uid());

drop policy if exists "video_access_events_select_self_or_admin" on public.video_access_events;
create policy "video_access_events_select_self_or_admin"
on public.video_access_events
for select
using (
  profile_id = auth.uid()
  or public.current_user_is_admin()
);
