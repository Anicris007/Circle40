-- Circle40 initial schema.
-- Friendship app: profiles, interests, plans (with location), plan members,
-- group and direct chat, meetups (for "Regulars"), reports and blocks.
-- Row Level Security is on for every table: the app talks to Postgres directly,
-- so these policies are the real access rules.

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 40),
  -- 18+ is enforced by the profiles_guard trigger (a CHECK can't use now()).
  birth_year    int  not null check (birth_year >= 1900),
  area          text not null,
  bio           text not null default '' check (char_length(bio) <= 400),
  avatar_path   text,
  -- Set only by the ID-verification backend (service role), never by the user.
  verified      boolean not null default false,
  -- Coarse home location used for "people near you". Never shown to other users.
  home_location extensions.geography(point, 4326),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Adults only, and only the backend (service role) may change `verified`.
create function public.profiles_guard()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.birth_year > extract(year from now())::int - 18 then
    raise exception 'Circle40 is for adults 18 and over' using errcode = 'check_violation';
  end if;
  if coalesce(auth.role(), '') <> 'service_role' then
    if tg_op = 'INSERT' then
      new.verified := false;
    elsif new.verified is distinct from old.verified then
      raise exception 'Verification status is set by Circle40, not by users' using errcode = 'insufficient_privilege';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_guard before insert or update on public.profiles
  for each row execute function public.profiles_guard();

create table public.interests (
  id    smallint generated always as identity primary key,
  name  text not null unique
);

insert into public.interests (name) values
  ('Movies'), ('Brunch'), ('Trekking'), ('Books'), ('Board games'), ('Live music'), ('Cafés'),
  ('Running'), ('Photography'), ('Pottery'), ('Cycling'), ('Football'), ('Food walks'), ('Chai');

create table public.profile_interests (
  profile_id  uuid     not null references public.profiles (id) on delete cascade,
  interest_id smallint not null references public.interests (id) on delete cascade,
  primary key (profile_id, interest_id)
);

-- ---------------------------------------------------------------------------
-- Blocks (defined early: other policies check them)
-- ---------------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- True when either user has blocked the other.
create function public.is_blocked(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- ---------------------------------------------------------------------------
-- Plans
-- ---------------------------------------------------------------------------
create type public.plan_category as enum ('Food', 'Outdoors', 'Games', 'Movies', 'Music', 'Fitness');

create table public.plans (
  id          uuid primary key default gen_random_uuid(),
  host_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 3 and 80),
  category    public.plan_category not null,
  starts_at   timestamptz not null,
  place_name  text not null check (char_length(place_name) between 2 and 120),
  -- Public meeting place, e.g. from Google Places.
  location    extensions.geography(point, 4326) not null,
  max_members smallint not null check (max_members between 2 and 6),
  women_only  boolean not null default false,
  cancelled   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index plans_location_idx on public.plans using gist (location);
create index plans_starts_at_idx on public.plans (starts_at) where not cancelled;

create table public.plan_members (
  plan_id    uuid not null references public.plans (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (plan_id, profile_id)
);

create function public.is_plan_member(p_plan uuid, p_profile uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.plan_members where plan_id = p_plan and profile_id = p_profile);
$$;

-- The host is always a member of their own plan.
create function public.add_host_as_member()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.plan_members (plan_id, profile_id) values (new.id, new.host_id);
  return new;
end;
$$;

create trigger plans_add_host after insert on public.plans
  for each row execute function public.add_host_as_member();

-- Refuse joins past the size limit. Locks the plan row so two people can't take the last spot.
create function public.enforce_plan_capacity()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  cap smallint;
  taken int;
begin
  select max_members into cap from public.plans where id = new.plan_id for update;
  select count(*) into taken from public.plan_members where plan_id = new.plan_id;
  if taken >= cap then
    raise exception 'This plan is full' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger plan_members_capacity before insert on public.plan_members
  for each row execute function public.enforce_plan_capacity();

-- Plans near a point, soonest first. Used by the Plans tab.
create function public.plans_nearby(lat double precision, lng double precision, radius_m int default 5000)
returns setof public.plans
language sql stable set search_path = ''
as $$
  select p.*
  from public.plans p
  where not p.cancelled
    and p.starts_at > now()
    and extensions.st_dwithin(p.location, extensions.st_makepoint(lng, lat)::extensions.geography, radius_m)
    and not public.is_blocked(auth.uid(), p.host_id)
  order by p.starts_at;
$$;

-- ---------------------------------------------------------------------------
-- Chat: group messages belong to a plan, direct messages to a pair of users
-- ---------------------------------------------------------------------------
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles (id) on delete cascade,
  plan_id      uuid references public.plans (id) on delete cascade,
  recipient_id uuid references public.profiles (id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 2000),
  sent_at      timestamptz not null default now(),
  -- Exactly one target: a plan's group chat, or one person.
  check ((plan_id is null) <> (recipient_id is null)),
  check (recipient_id is null or recipient_id <> sender_id)
);

create index messages_plan_idx on public.messages (plan_id, sent_at) where plan_id is not null;
create index messages_direct_idx on public.messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), sent_at)
  where recipient_id is not null;

-- ---------------------------------------------------------------------------
-- Meetups: recorded after a plan happens; two or more makes people "Regulars"
-- ---------------------------------------------------------------------------
create table public.meetups (
  plan_id    uuid not null references public.plans (id) on delete cascade,
  profile_a  uuid not null references public.profiles (id) on delete cascade,
  profile_b  uuid not null references public.profiles (id) on delete cascade,
  met_on     date not null,
  primary key (plan_id, profile_a, profile_b),
  check (profile_a < profile_b)
);

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------
create type public.report_reason as enum ('romantic_advances', 'unsafe', 'fake_profile', 'spam', 'other');
create type public.report_status as enum ('open', 'reviewing', 'actioned', 'dismissed');

create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete set null,
  reported_plan_id uuid references public.plans (id) on delete set null,
  reason           public.report_reason not null,
  details          text check (char_length(details) <= 1000),
  status           public.report_status not null default 'open',
  created_at       timestamptz not null default now(),
  check ((reported_user_id is null) <> (reported_plan_id is null))
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.interests         enable row level security;
alter table public.profile_interests enable row level security;
alter table public.blocks            enable row level security;
alter table public.plans             enable row level security;
alter table public.plan_members      enable row level security;
alter table public.messages          enable row level security;
alter table public.meetups           enable row level security;
alter table public.reports           enable row level security;

-- Profiles: signed-in users see everyone they haven't blocked (and who hasn't blocked them).
create policy "profiles: read unblocked" on public.profiles for select to authenticated
  using (id = auth.uid() or not public.is_blocked(auth.uid(), id));
create policy "profiles: create own" on public.profiles for insert to authenticated
  with check (id = auth.uid() and verified = false);
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "interests: read" on public.interests for select to authenticated using (true);

create policy "profile_interests: read" on public.profile_interests for select to authenticated using (true);
create policy "profile_interests: manage own" on public.profile_interests for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "blocks: read own" on public.blocks for select to authenticated using (blocker_id = auth.uid());
create policy "blocks: create own" on public.blocks for insert to authenticated with check (blocker_id = auth.uid());
create policy "blocks: remove own" on public.blocks for delete to authenticated using (blocker_id = auth.uid());

-- Plans: visible unless the host is blocked either way. Women-only filtering happens
-- in plans_nearby once gender is captured at verification (milestone 3).
create policy "plans: read unblocked" on public.plans for select to authenticated
  using (not public.is_blocked(auth.uid(), host_id));
create policy "plans: host creates" on public.plans for insert to authenticated
  with check (host_id = auth.uid());
create policy "plans: host updates" on public.plans for update to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "plans: host deletes" on public.plans for delete to authenticated using (host_id = auth.uid());

create policy "plan_members: read" on public.plan_members for select to authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id and not public.is_blocked(auth.uid(), p.host_id)));
create policy "plan_members: join" on public.plan_members for insert to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.plans p
      where p.id = plan_id and not p.cancelled and p.starts_at > now()
        and not public.is_blocked(auth.uid(), p.host_id)
    )
  );
-- Members can leave; the host stays a member of their own plan.
create policy "plan_members: leave" on public.plan_members for delete to authenticated
  using (profile_id = auth.uid() and not exists (select 1 from public.plans p where p.id = plan_id and p.host_id = auth.uid()));

-- Messages: group chat is for plan members only; direct chat needs no block either way.
create policy "messages: read" on public.messages for select to authenticated
  using (
    (plan_id is not null and public.is_plan_member(plan_id, auth.uid()))
    or (recipient_id is not null and auth.uid() in (sender_id, recipient_id))
  );
create policy "messages: send" on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (
      (plan_id is not null and public.is_plan_member(plan_id, auth.uid()))
      or (recipient_id is not null and not public.is_blocked(auth.uid(), recipient_id))
    )
  );

-- Meetups are written by the backend; people can read their own.
create policy "meetups: read own" on public.meetups for select to authenticated
  using (auth.uid() in (profile_a, profile_b));

-- Reports: anyone can file one; reporters see only their own. Moderators use the service role.
create policy "reports: create" on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'open');
create policy "reports: read own" on public.reports for select to authenticated
  using (reporter_id = auth.uid());

-- Realtime: stream new chat messages to the app (RLS still applies).
alter publication supabase_realtime add table public.messages;
