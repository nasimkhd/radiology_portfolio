-- Optional institutional email, plus auto-approve existing pending members.
alter table public.profiles
  add column if not exists institutional_email text;

alter table public.profiles
  alter column institution_name set default '',
  alter column institution_country set default '';

update public.profiles
set
  membership_status = 'approved',
  reviewed_at = coalesce(reviewed_at, now())
where membership_status = 'pending';
