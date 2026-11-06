-- Partner and coven telepathy (Psychic development). New tables only; no new
-- foreign key from an existing table.
--
-- * telepathy_sessions: a pair (invite by code, or a member of one of your
--   covens) or a coven group session; target type, rounds, seconds a round,
--   start time, who sends.
-- * telepathy_participants: who is in it. Rows are made by the functions
--   below (the host is added when the session is made), never directly.
-- * telepathy_rounds: one row per round, made on the server when the session
--   begins (telepathy_begin): the sender and the TARGET are drawn there. The
--   target column cannot be read by any signed-in role (column grants leave it
--   out): receivers get it only from telepathy_targets(), which gives a round's
--   target to its sender at any time, and to every participant once the
--   round's reveal_at has passed (reveal_at comes forward when every receiver
--   has locked in). So no device can know a target early.
-- * telepathy_guesses: a receiver's choice and impressions. You see your own
--   at once and others' only after that round's reveal.
-- Participants only; coven sessions only for members of that coven; blocks
-- work both ways (not_blocked_between, from 20261125000000).

create table if not exists public.telepathy_sessions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('pair', 'coven')),
  coven_id uuid references public.covens (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 80),
  target_type text not null check (target_type in ('symbols', 'suits', 'colours', 'picture')),
  rounds int not null check (rounds between 1 and 30),
  round_seconds int not null check (round_seconds between 20 and 600),
  starts_at timestamptz not null,
  sender_mode text not null default 'alternate' check (sender_mode in ('fixed', 'alternate', 'random')),
  -- Fixed sender, for a pair: the host sends (true) or the partner does.
  host_sends boolean not null default true,
  invite_code text not null default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  sound text,
  -- Pictures to draw from (ids "category:name") when the target is a picture.
  pool text[] check (pool is null or cardinality(pool) <= 400),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  created_at timestamptz not null default now(),
  check ((kind = 'coven') = (coven_id is not null)),
  check (target_type <> 'picture' or (pool is not null and cardinality(pool) >= 8))
);
create unique index if not exists telepathy_sessions_code_idx on public.telepathy_sessions (invite_code);
create index if not exists telepathy_sessions_host_idx on public.telepathy_sessions (host_id, starts_at desc);
create index if not exists telepathy_sessions_coven_idx on public.telepathy_sessions (coven_id, starts_at desc) where coven_id is not null;

create table if not exists public.telepathy_participants (
  session_id uuid not null references public.telepathy_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'joined' check (status in ('invited', 'joined')),
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id)
);
create index if not exists telepathy_participants_user_idx on public.telepathy_participants (user_id, joined_at desc);

create table if not exists public.telepathy_rounds (
  session_id uuid not null references public.telepathy_sessions (id) on delete cascade,
  n int not null check (n >= 1),
  sender_id uuid not null references auth.users (id) on delete cascade,
  -- Secret until reveal_at (see telepathy_targets); not granted to any role.
  target text not null,
  -- For pictures: the four choices, shuffled (the target is one of them).
  options text[],
  starts_at timestamptz not null,
  reveal_at timestamptz not null,
  ends_at timestamptz not null,
  primary key (session_id, n)
);

create table if not exists public.telepathy_guesses (
  session_id uuid not null,
  round_n int not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  guess text not null check (char_length(guess) between 1 and 80),
  impressions text check (impressions is null or char_length(impressions) <= 1000),
  created_at timestamptz not null default now(),
  primary key (session_id, round_n, user_id),
  foreign key (session_id, round_n) references public.telepathy_rounds (session_id, n) on delete cascade
);
create index if not exists telepathy_guesses_user_idx on public.telepathy_guesses (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER so policies don't recurse)
-- ---------------------------------------------------------------------------

create or replace function public.telepathy_is_participant(sid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.telepathy_participants where session_id = sid and user_id = auth.uid());
$$;

create or replace function public.telepathy_revealed(sid uuid, round int)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.telepathy_rounds where session_id = sid and n = round and now() >= reveal_at);
$$;

-- You may lock in a guess: you are in the session, not its sender for the round, and the round is still open.
create or replace function public.telepathy_may_guess(sid uuid, round int)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.telepathy_rounds r
    join public.telepathy_participants p on p.session_id = r.session_id and p.user_id = auth.uid() and p.status = 'joined'
    where r.session_id = sid and r.n = round and r.sender_id <> auth.uid() and now() >= r.starts_at and now() < r.reveal_at
  );
$$;

create or replace function public.telepathy_host_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.telepathy_participants (session_id, user_id, status) values (new.id, new.host_id, 'joined') on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists telepathy_sessions_host on public.telepathy_sessions;
create trigger telepathy_sessions_host after insert on public.telepathy_sessions
  for each row execute function public.telepathy_host_added();

-- Everyone but the sender has locked in: bring the reveal forward.
create or replace function public.telepathy_guess_in()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.telepathy_rounds r set reveal_at = now()
  where r.session_id = new.session_id and r.n = new.round_n and r.reveal_at > now()
    and not exists (
      select 1 from public.telepathy_participants p
      where p.session_id = r.session_id and p.status = 'joined' and p.user_id <> r.sender_id
        and not exists (select 1 from public.telepathy_guesses g where g.session_id = r.session_id and g.round_n = r.n and g.user_id = p.user_id)
    );
  return new;
end;
$$;

drop trigger if exists telepathy_guesses_in on public.telepathy_guesses;
create trigger telepathy_guesses_in after insert on public.telepathy_guesses
  for each row execute function public.telepathy_guess_in();

-- Join with a code (a pair) or as a member (a coven session). Before it begins only.
create or replace function public.telepathy_join(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.telepathy_sessions;
  have int;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into s from public.telepathy_sessions where invite_code = lower(btrim(code)) and status = 'scheduled';
  if not found then raise exception 'No session with that code.'; end if;
  if now() >= s.starts_at then raise exception 'That session has already begun.'; end if;
  if not public.not_blocked_between(s.host_id) then raise exception 'No session with that code.'; end if;
  if s.kind = 'coven' and not public.is_coven_member(s.coven_id) then raise exception 'That session is for a coven''s members.'; end if;
  select count(*) into have from public.telepathy_participants where session_id = s.id and status = 'joined' and user_id <> auth.uid();
  if have >= case when s.kind = 'pair' then 1 else 29 end then raise exception 'That session is full.'; end if;
  insert into public.telepathy_participants (session_id, user_id, status) values (s.id, auth.uid(), 'joined')
    on conflict (session_id, user_id) do update set status = 'joined';
  return s.id;
end;
$$;

-- The host asks a member of one of their covens to a pair session; they accept by joining.
create or replace function public.telepathy_invite(sid uuid, who uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare s public.telepathy_sessions;
begin
  select * into s from public.telepathy_sessions where id = sid and host_id = auth.uid() and kind = 'pair' and status = 'scheduled';
  if not found then raise exception 'Only the host can invite to their pair session.'; end if;
  if not exists (
    select 1 from public.coven_members a join public.coven_members b on a.coven_id = b.coven_id
    where a.user_id = auth.uid() and b.user_id = who and a.status = 'active' and b.status = 'active'
  ) then raise exception 'You can invite members of your covens.'; end if;
  if not public.not_blocked_between(who) then raise exception 'You can''t invite that person.'; end if;
  if exists (select 1 from public.telepathy_participants where session_id = sid and user_id <> auth.uid()) then raise exception 'That session already has its partner.'; end if;
  insert into public.telepathy_participants (session_id, user_id, status) values (sid, who, 'invited') on conflict do nothing;
end;
$$;

-- Make the rounds when the session starts: draw each sender and each target on the server. Any participant may call it from two minutes before the start; it runs once.
create or replace function public.telepathy_begin(sid uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.telepathy_sessions;
  people uuid[];
  n int;
  sender uuid;
  tgt text;
  opts text[];
  ids text[];
  slot interval;
  t0 timestamptz;
begin
  select * into s from public.telepathy_sessions where id = sid for update;
  if not found or not public.telepathy_is_participant(sid) then raise exception 'No such session.'; end if;
  if s.status <> 'scheduled' then return 0; end if;
  if exists (select 1 from public.telepathy_rounds where session_id = sid) then return s.rounds; end if;
  if now() < s.starts_at - interval '2 minutes' then raise exception 'It is not time yet.'; end if;
  people := array(select user_id from public.telepathy_participants where session_id = sid and status = 'joined' order by (user_id = s.host_id) desc, joined_at, user_id);
  if cardinality(people) < 2 then
    update public.telepathy_sessions set status = 'cancelled' where id = sid;
    return 0;
  end if;
  slot := make_interval(secs => s.round_seconds + 20);
  ids := case s.target_type
    when 'symbols' then array['circle', 'cross', 'waves', 'square', 'star']
    when 'suits' then array['wands', 'cups', 'swords', 'pentacles']
    when 'colours' then array['red', 'orange', 'yellow', 'green', 'blue', 'violet']
    else s.pool end;
  for n in 1..s.rounds loop
    sender := case s.sender_mode
      when 'fixed' then case when s.host_sends or s.kind = 'coven' then people[1] else people[2] end
      when 'alternate' then people[((n - 1) % cardinality(people)) + 1]
      else people[1 + floor(random() * cardinality(people))::int] end;
    tgt := ids[1 + floor(random() * cardinality(ids))::int];
    opts := null;
    if s.target_type = 'picture' then
      opts := array(
        select x from (
          select tgt as x
          union all
          (select p from unnest(s.pool) p where p <> tgt and split_part(p, ':', 2) <> split_part(tgt, ':', 2) order by random() limit 3)
        ) q order by random()
      );
    end if;
    t0 := s.starts_at + (n - 1) * slot;
    insert into public.telepathy_rounds (session_id, n, sender_id, target, options, starts_at, reveal_at, ends_at)
      values (sid, n, sender, tgt, opts, t0, t0 + make_interval(secs => s.round_seconds), t0 + slot);
  end loop;
  return s.rounds;
end;
$$;

-- Targets you may see: the ones you send, and every one once its round's reveal time has passed.
create or replace function public.telepathy_targets(sid uuid)
returns table (n int, target text)
language sql
stable
security definer
set search_path = public
as $$
  select r.n, r.target from public.telepathy_rounds r
  where r.session_id = sid and public.telepathy_is_participant(sid) and (r.sender_id = auth.uid() or now() >= r.reveal_at)
  order by r.n;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.telepathy_sessions enable row level security;
alter table public.telepathy_participants enable row level security;
alter table public.telepathy_rounds enable row level security;
alter table public.telepathy_guesses enable row level security;

drop policy if exists "Participants see their sessions; coven members see the coven's" on public.telepathy_sessions;
create policy "Participants see their sessions; coven members see the coven's" on public.telepathy_sessions
  for select to authenticated using (
    host_id = auth.uid()
    or public.telepathy_is_participant(id)
    or (kind = 'coven' and status = 'scheduled' and public.is_coven_member(coven_id) and public.not_blocked_between(host_id))
  );
drop policy if exists "Make your own sessions; a coven's only as its member" on public.telepathy_sessions;
create policy "Make your own sessions; a coven's only as its member" on public.telepathy_sessions
  for insert to authenticated with check (host_id = auth.uid() and (kind = 'pair' or public.is_coven_member(coven_id)));
drop policy if exists "Hosts cancel their sessions" on public.telepathy_sessions;
create policy "Hosts cancel their sessions" on public.telepathy_sessions
  for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
drop policy if exists "Hosts delete their sessions" on public.telepathy_sessions;
create policy "Hosts delete their sessions" on public.telepathy_sessions
  for delete to authenticated using (host_id = auth.uid());

drop policy if exists "Participants see who is in" on public.telepathy_participants;
create policy "Participants see who is in" on public.telepathy_participants
  for select to authenticated using (user_id = auth.uid() or public.telepathy_is_participant(session_id));
drop policy if exists "Leave a session, or decline an invitation" on public.telepathy_participants;
create policy "Leave a session, or decline an invitation" on public.telepathy_participants
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Participants see the rounds (not the target)" on public.telepathy_rounds;
create policy "Participants see the rounds (not the target)" on public.telepathy_rounds
  for select to authenticated using (public.telepathy_is_participant(session_id));

drop policy if exists "See your own guesses, and everyone's once revealed" on public.telepathy_guesses;
create policy "See your own guesses, and everyone's once revealed" on public.telepathy_guesses
  for select to authenticated using (public.telepathy_is_participant(session_id) and (user_id = auth.uid() or public.telepathy_revealed(session_id, round_n)));
drop policy if exists "Lock in your own guess while the round is open" on public.telepathy_guesses;
create policy "Lock in your own guess while the round is open" on public.telepathy_guesses
  for insert to authenticated with check (user_id = auth.uid() and public.telepathy_may_guess(session_id, round_n));

-- Column and table privileges: the target is not granted to anyone; rounds and
-- participants are changed only by the functions above.
revoke all on public.telepathy_sessions, public.telepathy_participants, public.telepathy_rounds, public.telepathy_guesses from anon, authenticated;
grant select, delete on public.telepathy_sessions to authenticated;
grant insert (kind, coven_id, title, target_type, rounds, round_seconds, starts_at, sender_mode, host_sends, sound, pool) on public.telepathy_sessions to authenticated;
grant update (status) on public.telepathy_sessions to authenticated;
grant select, delete on public.telepathy_participants to authenticated;
grant select (session_id, n, sender_id, options, starts_at, reveal_at, ends_at) on public.telepathy_rounds to authenticated;
grant select on public.telepathy_guesses to authenticated;
grant insert (session_id, round_n, guess, impressions) on public.telepathy_guesses to authenticated;

revoke execute on function public.telepathy_is_participant(uuid) from public, anon;
revoke execute on function public.telepathy_revealed(uuid, int) from public, anon;
revoke execute on function public.telepathy_may_guess(uuid, int) from public, anon;
revoke execute on function public.telepathy_host_added() from public, anon, authenticated;
revoke execute on function public.telepathy_guess_in() from public, anon, authenticated;
revoke execute on function public.telepathy_join(text) from public, anon;
revoke execute on function public.telepathy_invite(uuid, uuid) from public, anon;
revoke execute on function public.telepathy_begin(uuid) from public, anon;
revoke execute on function public.telepathy_targets(uuid) from public, anon;
grant execute on function public.telepathy_is_participant(uuid) to authenticated;
grant execute on function public.telepathy_revealed(uuid, int) to authenticated;
grant execute on function public.telepathy_may_guess(uuid, int) to authenticated;
grant execute on function public.telepathy_join(text) to authenticated;
grant execute on function public.telepathy_invite(uuid, uuid) to authenticated;
grant execute on function public.telepathy_begin(uuid) to authenticated;
grant execute on function public.telepathy_targets(uuid) to authenticated;
