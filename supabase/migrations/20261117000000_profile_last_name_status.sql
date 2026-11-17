-- Profile: last name and a short status line.
-- The phone number and email shown on the Edit profile screen are not stored
-- here: Supabase keeps them in auth.users (phone, email, *_confirmed_at), and
-- they only change through Supabase's verified update flow.

alter table public.profiles
  add column last_name text check (last_name is null or char_length(last_name) between 1 and 40),
  add column status    text check (status is null or char_length(status) between 1 and 60);

comment on column public.profiles.display_name is 'First name. Others see this plus the last initial.';
comment on column public.profiles.last_name is 'Shown in full only to the profile owner; others see the initial.';
comment on column public.profiles.status is 'Short line under the name, e.g. "Free this weekend".';
