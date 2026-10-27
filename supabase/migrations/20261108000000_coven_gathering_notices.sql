-- NOT YET APPLIED. Needs 20261107000200_coven_meetings.sql first (this
-- replaces coven_clean_plan again, keeping everything that one cleans).
--
-- Phone notes for coven gatherings, rites and meetings alike: when one is put
-- on the calendar, when its date or time changes, and when it comes off the
-- calendar (back to a draft, cancelled, or deleted). Drafts never ring, nor
-- gatherings already past. The coven-notify edge function sends them
-- (supabase/functions/coven-notify/gatherings.ts), called by the app and the
-- website right after a gathering is saved or its status changes; this adds
-- what it needs. Additive and safe to run again.
--
-- * Who may choose who hears (coven_ranks.can_set_gathering_notices, and
--   coven_permission 'notices'): the coven's head, positions that lead the
--   coven, and positions the head gives it to.
-- * The coven's rules (coven_gathering_notice_rules), by kind of gathering:
--   'rite', 'meeting', an occasion ('occasion:full_moon'), an occasion by its
--   name whatever its kind ('name:hekate''s deipnon', 'name:samhain'), or a
--   kind of meeting by the series it follows on from ('series:officials'). Who is a
--   list of WHO keys (as the planner's fields keep them): 'coven', 'rank:<id>',
--   'user:<id>', 'parts' (everyone cast in one of its roles) or 'none'.
-- * One gathering's own choice (its plan's `notify`, the same keys and
--   'role:<id>' for one of its roles), set by those with 'notices'. Others
--   can save the gathering; its choice stays as it was (a trigger keeps it).
-- * Who hears (coven_gathering_notice_recipients): the gathering's own
--   choice, else the coven's rule for its occasion's name, its occasion, its
--   kind of meeting, then rites or meetings, else everyone the gathering is
--   for. Always only active members it is open to (coven_ritual_open_to), so a
--   meeting kept to some never reaches anyone else. The edge function leaves
--   out whoever made the change, those who have blocked them (as for coven
--   requests), and those whose Reminders choices say no.
-- * Once each (coven_gathering_notices): the function claims each note here
--   before sending, with who it went to, so a move reaches everyone told
--   before and a cancellation only those who heard. A deleted gathering
--   leaves a snapshot (coven_gathering_removed) when it had been announced, so
--   its cancellation can still be sent.
-- * Sent by hand ("Send a notification" on a scheduled gathering's page): by
--   those with 'notices', the coven's moderators and head, site moderators,
--   and whoever planned it (coven_gathering_may_send). The first one for a
--   gathering never announced is its 'scheduled' note (gatherings planned
--   before this existed); after that, a 'reminder', with a short note of
--   their own if they like, and once only, they may choose who for that one
--   send. coven_gathering_notice_preview says how many it goes to first. One
--   by hand per gathering each half hour, kept by the notices table itself.

-- ---------------------------------------------------------------------------
-- The power, and coven_permission 'notices'
-- ---------------------------------------------------------------------------

alter table public.coven_ranks add column if not exists can_set_gathering_notices boolean not null default false;

create or replace function public.coven_permission(target uuid, permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coven_members m
    join public.covens c on c.id = m.coven_id
    left join public.coven_ranks r on r.id = m.rank_id
    where m.coven_id = target
      and m.user_id = auth.uid()
      and m.status = 'active'
      and c.status = 'active'
      and (
        c.founder_id = auth.uid()
        or case permission
          when 'member' then true
          when 'manage' then coalesce(r.can_manage, false)
          when 'review' then coalesce(r.can_review or r.can_manage, false)
          when 'moderate' then coalesce(r.can_moderate or r.can_manage, false)
          when 'lead' then coalesce(r.can_lead_rituals or r.can_moderate or r.can_manage, false)
          when 'schedule' then coalesce(r.can_schedule_rites or r.can_manage, false)
          when 'notices' then coalesce(r.can_set_gathering_notices or r.can_manage, false)
          when 'write_book' then coalesce(r.can_write_book or r.can_approve_book or r.can_manage, false)
          when 'approve_book' then coalesce(r.can_approve_book or r.can_manage, false)
          when 'programs' then coalesce(r.can_manage_programs or r.can_manage, false)
            or exists (select 1 from public.coven_grants g where g.coven_id = target and g.user_id = auth.uid() and g.power = 'manage_programs')
          when 'progress' then coalesce(r.can_view_progress or r.can_manage_programs or r.can_manage, false)
            or exists (select 1 from public.coven_grants g where g.coven_id = target and g.user_id = auth.uid())
          when 'start_altars' then coalesce(r.can_start_altars or r.can_keep_altars or r.can_manage, true)
          when 'tend_altars' then coalesce(r.can_tend_altars or r.can_keep_altars or r.can_manage, false)
          when 'keep_altars' then coalesce(r.can_keep_altars or r.can_manage, false)
          when 'chat' then coalesce(r.can_chat or r.can_moderate or r.can_manage, true)
          else false
        end
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- Who, and which rule
-- ---------------------------------------------------------------------------

-- A name compared without case, spacing or curly quotes ("Hekate’s  Deipnon"
-- and "hekate's deipnon" are one). Mirrors lib/covens/notices.ts noticeName.
create or replace function public.coven_notice_name(p text)
returns text
language sql
immutable
set search_path = public
as $$
  select nullif(left(lower(regexp_replace(replace(btrim(coalesce(p, '')), '’', ''''), '\s+', ' ', 'g')), 60), '');
$$;

-- WHO keys for notes, checked against the coven: its positions, its active
-- members, the gathering's roles (p_roles, a plan's cleaned roles; none for
-- the coven's rules), everyone with a part, the whole coven, or no one.
-- Anything else is left out. Null when nothing is left.
create or replace function public.coven_clean_notice_who(p_coven uuid, p_keys jsonb, p_roles jsonb default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  k text;
  cleaned jsonb := '[]'::jsonb;
  none boolean := false;
begin
  if p_keys is null or jsonb_typeof(p_keys) <> 'array' then return null; end if;
  for k in select value from jsonb_array_elements_text(p_keys) limit 60 loop
    if k = 'coven' then return '["coven"]'::jsonb; end if;
    if k = 'none' then none := true; continue; end if;
    if not (
      (k = 'parts')
      or (k ~ '^rank:[0-9a-fA-F-]{36}$' and exists (select 1 from public.coven_ranks where coven_id = p_coven and id::text = lower(substr(k, 6))))
      or (k ~ '^user:[0-9a-fA-F-]{36}$' and exists (select 1 from public.coven_members where coven_id = p_coven and user_id::text = lower(substr(k, 6)) and status = 'active'))
      or (k like 'role:%' and jsonb_typeof(p_roles) = 'array' and exists (select 1 from jsonb_array_elements(p_roles) r where 'role:' || (r->>'id') = k))
    ) then
      continue;
    end if;
    if not cleaned ? k then cleaned := cleaned || to_jsonb(k); end if;
  end loop;
  if jsonb_array_length(cleaned) > 40 then raise exception 'Choose up to 40 to hear about it.'; end if;
  if jsonb_array_length(cleaned) = 0 then return case when none then '["none"]'::jsonb end; end if;
  return cleaned;
end;
$$;

-- The rules that could apply to a gathering, the closest first: its
-- occasion's name, its occasion, its kind of meeting (the series it follows on
-- from), then rites or meetings. Mirrors lib/covens/notices.ts noticeScopes.
create or replace function public.coven_gathering_notice_scopes(p_kind text, p_occasion text, p_occasion_name text, p_plan jsonb)
returns text[]
language sql
immutable
set search_path = public
as $$
  select array_remove(array[
    case when public.coven_notice_name(p_occasion_name) is not null then 'name:' || public.coven_notice_name(p_occasion_name) end,
    case when nullif(p_occasion, '') is not null then 'occasion:' || p_occasion end,
    case when p_kind = 'meeting' and public.coven_notice_name(coalesce(nullif(p_plan->'meeting'->>'series', ''), nullif(p_plan->>'template', ''))) is not null
      then 'series:' || public.coven_notice_name(coalesce(nullif(p_plan->'meeting'->>'series', ''), nullif(p_plan->>'template', ''))) end,
    case when p_kind = 'meeting' then 'meeting' else 'rite' end
  ], null);
$$;

-- A scope as kept: one of those shapes, its name part normalised; null when it isn't one.
create or replace function public.coven_clean_notice_scope(p_scope text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_scope in ('rite', 'meeting') then p_scope
    when p_scope ~ '^occasion:[a-z_]{1,30}$' then p_scope
    when p_scope ~ '^name:.' and public.coven_notice_name(substr(p_scope, 6)) is not null then 'name:' || public.coven_notice_name(substr(p_scope, 6))
    when p_scope ~ '^series:.' and public.coven_notice_name(substr(p_scope, 8)) is not null then 'series:' || public.coven_notice_name(substr(p_scope, 8))
  end;
$$;

-- ---------------------------------------------------------------------------
-- The coven's rules
-- ---------------------------------------------------------------------------

create table if not exists public.coven_gathering_notice_rules (
  coven_id uuid not null references public.covens (id) on delete cascade,
  scope text not null check (scope = public.coven_clean_notice_scope(scope)),
  who jsonb not null check (jsonb_typeof(who) = 'array' and jsonb_array_length(who) between 1 and 40),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (coven_id, scope)
);
alter table public.coven_gathering_notice_rules enable row level security;
drop policy if exists "Members see who hears about the coven's gatherings" on public.coven_gathering_notice_rules;
create policy "Members see who hears about the coven's gatherings" on public.coven_gathering_notice_rules
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
revoke insert, update, delete on public.coven_gathering_notice_rules from anon, authenticated;

-- Set (or, with no one chosen, take away) the coven's rule for a kind of gathering.
create or replace function public.set_coven_gathering_notice_rule(p_coven uuid, p_scope text, p_who jsonb)
returns public.coven_gathering_notice_rules
language plpgsql
security definer
set search_path = public
as $$
declare
  v_scope text := public.coven_clean_notice_scope(p_scope);
  v_who jsonb;
  saved public.coven_gathering_notice_rules;
begin
  if not ((public.coven_permission(p_coven, 'notices') and public.coven_in_good_standing(p_coven)) or public.is_community_moderator()) then
    raise exception 'Only those the coven''s head allows choose who hears about its gatherings.';
  end if;
  if v_scope is null then raise exception 'Choose rites, meetings or an occasion.'; end if;
  v_who := public.coven_clean_notice_who(p_coven, p_who, null);
  if v_who is null then
    delete from public.coven_gathering_notice_rules g where g.coven_id = p_coven and g.scope = v_scope;
    return null;
  end if;
  insert into public.coven_gathering_notice_rules as g (coven_id, scope, who, updated_by, updated_at)
  values (p_coven, v_scope, v_who, auth.uid(), now())
  on conflict on constraint coven_gathering_notice_rules_pkey do update set who = excluded.who, updated_by = excluded.updated_by, updated_at = excluded.updated_at
  returning g.* into saved;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- One gathering's own choice: plan.notify
-- ---------------------------------------------------------------------------

-- The plan as coven_meetings' version cleans it, and now `notify`: who hears
-- about this gathering (WHO keys, its roles among them), or none for the rules.
create or replace function public.coven_clean_plan(p_coven uuid, p_plan jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  sections jsonb := '[]'::jsonb;
  roles jsonb := '[]'::jsonb;
  checklist jsonb := '[]'::jsonb;
  item jsonb;
  hold integer;
  follow jsonb;
  follow_hours integer;
  mt jsonb;
  meeting jsonb;
begin
  if p_plan is null or jsonb_typeof(p_plan) <> 'object' then return '{}'::jsonb; end if;
  if octet_length(p_plan::text) > 60000 then raise exception 'That plan is too long.'; end if;
  for item in select * from jsonb_array_elements(case when jsonb_typeof(p_plan->'sections') = 'array' then p_plan->'sections' else '[]'::jsonb end) loop
    if coalesce(btrim(item->>'name'), '') = '' or coalesce(item->>'id', '') = '' then continue; end if;
    sections := sections || jsonb_build_array(jsonb_build_object('id', left(item->>'id', 40), 'name', left(btrim(item->>'name'), 60)));
  end loop;
  if jsonb_array_length(sections) > 20 then raise exception 'A gathering can have up to 20 sections.'; end if;
  for item in select * from jsonb_array_elements(case when jsonb_typeof(p_plan->'roles') = 'array' then p_plan->'roles' else '[]'::jsonb end) loop
    if coalesce(btrim(item->>'name'), '') = '' or coalesce(item->>'id', '') = '' then continue; end if;
    roles := roles || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'id', left(item->>'id', 40),
      'name', left(btrim(item->>'name'), 60),
      'cast', public.coven_clean_assignees(p_coven, item->'cast', btrim(item->>'name'), true),
      'speaks', case when item->>'speaks' = 'false' then false end
    )));
  end loop;
  if jsonb_array_length(roles) > 20 then raise exception 'A gathering can have up to 20 roles.'; end if;
  for item in select * from jsonb_array_elements(case when jsonb_typeof(p_plan->'checklist') = 'array' then p_plan->'checklist' else '[]'::jsonb end) loop
    if coalesce(btrim(item->>'text'), '') = '' or coalesce(item->>'id', '') = '' then continue; end if;
    checklist := checklist || jsonb_build_array(jsonb_build_object(
      'id', left(item->>'id', 40),
      'text', left(btrim(item->>'text'), 200),
      'remind', case when item->>'remind' in ('none', 'hour', 'day') then item->>'remind' else 'hour' end
    ));
  end loop;
  if jsonb_array_length(checklist) > 20 then raise exception 'A checklist can have up to 20 things.'; end if;
  hold := case when (p_plan->'afterwards'->>'hold_hours') ~ '^[0-9]{1,4}$' then least((p_plan->'afterwards'->>'hold_hours')::integer, 168) end;
  follow := case when jsonb_typeof(p_plan->'afterwards'->'follow_up') = 'object' then p_plan->'afterwards'->'follow_up' end;
  follow_hours := case when (follow->>'after_hours') ~ '^[0-9]{1,5}$' then least((follow->>'after_hours')::integer, 1440) end;
  mt := case when jsonb_typeof(p_plan->'meeting') = 'object' then p_plan->'meeting' end;
  if mt is not null then
    meeting := jsonb_strip_nulls(jsonb_build_object(
      'lead_minutes', case when (mt->>'lead_minutes') ~ '^[0-9]{1,3}$' then least((mt->>'lead_minutes')::integer, 240) end,
      'length_minutes', case when (mt->>'length_minutes') ~ '^[0-9]{1,4}$' then greatest(5, least((mt->>'length_minutes')::integer, 720)) end,
      'chair_role', case when exists (select 1 from jsonb_array_elements(roles) x where x->>'id' = mt->>'chair_role') then mt->>'chair_role' end,
      'secretary_role', case when exists (select 1 from jsonb_array_elements(roles) x where x->>'id' = mt->>'secretary_role') then mt->>'secretary_role' end,
      'series', nullif(left(btrim(coalesce(mt->>'series', '')), 60), ''),
      'minutes_view', case when mt->>'minutes_view' in ('audience', 'coven') then mt->>'minutes_view' end
    ));
  end if;
  return jsonb_strip_nulls(jsonb_build_object(
    'sections', sections,
    'roles', roles,
    'checklist', checklist,
    'afterwards', jsonb_build_object(
      'hold_hours', case when hold > 0 then hold end,
      'notes', left(coalesce(p_plan->'afterwards'->>'notes', ''), 2000),
      'follow_up', case when coalesce(btrim(follow->>'text'), '') <> '' and follow_hours > 0
        then jsonb_build_object('text', left(btrim(follow->>'text'), 200), 'after_hours', follow_hours) end
    ),
    'template', nullif(left(coalesce(p_plan->>'template', ''), 60), ''),
    'meeting', meeting,
    'notify', public.coven_clean_notice_who(p_coven, p_plan->'notify', roles)
  ));
end;
$$;

-- Only those with 'notices' change a gathering's own choice. Anyone else who
-- saves it (save_coven_ritual, or anything else that writes the plan) keeps
-- the choice it had; a new gathering from them follows the coven's rules.
create or replace function public.guard_coven_ritual_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'UPDATE' and (new.plan->'notify') is not distinct from (old.plan->'notify') then return new; end if;
  if tg_op = 'INSERT' and not coalesce(new.plan ? 'notify', false) then return new; end if;
  if public.coven_permission(new.coven_id, 'notices') or public.is_community_moderator() then return new; end if;
  new.plan := coalesce(new.plan, '{}'::jsonb) - 'notify';
  if tg_op = 'UPDATE' and old.plan ? 'notify' then
    new.plan := new.plan || jsonb_build_object('notify', old.plan->'notify');
  end if;
  return new;
end;
$$;

drop trigger if exists guard_coven_ritual_notify on public.coven_rituals;
create trigger guard_coven_ritual_notify before insert or update of plan on public.coven_rituals
  for each row execute function public.guard_coven_ritual_notify();

-- ---------------------------------------------------------------------------
-- Who hears (for the edge function only)
-- ---------------------------------------------------------------------------

-- The WHO keys that decide who hears about a gathering, and where they come
-- from ('gathering', or the rule's scope); null keys: everyone it is for.
create or replace function public.coven_gathering_notice_who(p_ritual uuid)
returns table (who jsonb, source text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  rule public.coven_gathering_notice_rules;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null then return; end if;
  if jsonb_typeof(r.plan->'notify') = 'array' and jsonb_array_length(r.plan->'notify') > 0 then
    return query select r.plan->'notify', 'gathering'::text;
    return;
  end if;
  select g.* into rule
  from unnest(public.coven_gathering_notice_scopes(r.kind, r.occasion, r.occasion_name, r.plan)) with ordinality s(scope, n)
  join public.coven_gathering_notice_rules g on g.coven_id = r.coven_id and g.scope = s.scope
  order by s.n
  limit 1;
  if rule.scope is not null then
    return query select rule.who, rule.scope;
    return;
  end if;
  return query select null::jsonb, 'default'::text;
end;
$$;

-- Everyone who hears about it: those its choice names (a role's people, every
-- part, positions, people), always only active members it is open to.
-- p_who, for one note sent by hand: who it goes to instead (WHO keys, its roles among them).
drop function if exists public.coven_gathering_notice_recipients(uuid);
create or replace function public.coven_gathering_notice_recipients(p_ritual uuid, p_who jsonb default null)
returns uuid[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  keys jsonb;
  list jsonb;
  found uuid[];
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null then return '{}'::uuid[]; end if;
  keys := public.coven_clean_notice_who(r.coven_id, p_who, r.plan->'roles');
  if keys is null then
    select w.who into keys from public.coven_gathering_notice_who(p_ritual) w;
  end if;
  if keys is null then
    select coalesce(array_agg(m.user_id order by m.user_id), '{}'::uuid[]) into found
    from public.coven_members m
    where m.coven_id = r.coven_id and m.status = 'active' and public.coven_ritual_open_to(r.id, m.user_id);
    return found;
  end if;
  if keys ? 'parts' then
    keys := keys || (select coalesce(jsonb_agg('role:' || (x->>'id')), '[]'::jsonb)
                     from jsonb_array_elements(case when jsonb_typeof(r.plan->'roles') = 'array' then r.plan->'roles' else '[]'::jsonb end) x);
  end if;
  list := public.coven_plan_who(r.plan, keys);
  -- An empty list would be the whole coven to coven_assignees_include: here it is no one.
  if jsonb_array_length(list) = 0 then return '{}'::uuid[]; end if;
  select coalesce(array_agg(m.user_id order by m.user_id), '{}'::uuid[]) into found
  from public.coven_members m
  where m.coven_id = r.coven_id and m.status = 'active'
    and public.coven_assignees_include(r.coven_id, list, m.user_id)
    and public.coven_ritual_open_to(r.id, m.user_id);
  return found;
end;
$$;

-- ---------------------------------------------------------------------------
-- Each note once, and what a deleted gathering leaves behind
-- ---------------------------------------------------------------------------

create table if not exists public.coven_gathering_notices (
  ritual_id uuid not null,
  seq integer not null check (seq > 0),
  coven_id uuid not null references public.covens (id) on delete cascade,
  event text not null check (event in ('scheduled', 'moved', 'cancelled', 'reminder')),
  scheduled_for timestamptz,
  recipients uuid[] not null default '{}',
  -- Sent by hand ("Send a notification"), with their note, if any.
  manual boolean not null default false,
  note text check (note is null or char_length(note) <= 200),
  sent_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  primary key (ritual_id, seq)
);
alter table public.coven_gathering_notices enable row level security;
-- No policies: only the service role (the edge function) reads and writes it.
revoke all on public.coven_gathering_notices from anon, authenticated;
create index if not exists coven_gathering_notices_manual_idx on public.coven_gathering_notices (ritual_id, created_at desc) where manual;

-- One note by hand per gathering each half hour. The claim is refused here,
-- whoever asks (PT429 comes back as "too many requests").
create or replace function public.limit_manual_coven_gathering_notices()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.manual and exists (
    select 1 from public.coven_gathering_notices
    where ritual_id = new.ritual_id and manual and created_at > now() - interval '30 minutes'
  ) then
    raise exception 'A notification went out for this gathering less than half an hour ago.' using errcode = 'PT429';
  end if;
  return new;
end;
$$;

drop trigger if exists limit_manual_coven_gathering_notices on public.coven_gathering_notices;
create trigger limit_manual_coven_gathering_notices before insert on public.coven_gathering_notices
  for each row execute function public.limit_manual_coven_gathering_notices();

-- Who may send a notification by hand for a gathering open to them: those
-- with 'notices', the coven's moderators (and head), site moderators, and
-- whoever planned it. Mirrors lib/covens/notices.ts maySendNotice.
create or replace function public.coven_gathering_may_send(p_ritual uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select public.is_community_moderator()
      or (public.coven_ritual_open_to(r.id)
          and (public.coven_permission(r.coven_id, 'notices') or public.coven_permission(r.coven_id, 'moderate')
               or (r.created_by = auth.uid() and public.coven_permission(r.coven_id, 'member'))))
    from public.coven_rituals r where r.id = p_ritual
  ), false);
$$;

-- Before sending by hand: how many it goes to (never the sender), whether it
-- has been announced since it last came off the calendar (so the next is a
-- reminder), and when the next may go if one went in the last half hour.
create or replace function public.coven_gathering_notice_preview(p_ritual uuid, p_who jsonb default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  since integer;
  last_manual timestamptz;
begin
  if not public.coven_gathering_may_send(p_ritual) then
    raise exception 'Only those the coven''s head allows, and whoever planned it, send notifications for this gathering.';
  end if;
  select coalesce(max(seq), 0) into since from public.coven_gathering_notices where ritual_id = p_ritual and event = 'cancelled';
  select max(created_at) into last_manual from public.coven_gathering_notices where ritual_id = p_ritual and manual;
  return jsonb_build_object(
    'recipients', (select count(*) from unnest(public.coven_gathering_notice_recipients(p_ritual, p_who)) u where u is distinct from auth.uid()),
    'announced', exists (select 1 from public.coven_gathering_notices where ritual_id = p_ritual and seq > since and event in ('scheduled', 'moved')),
    'next_at', case when last_manual > now() - interval '30 minutes' then last_manual + interval '30 minutes' end
  );
end;
$$;

create table if not exists public.coven_gathering_removed (
  ritual_id uuid primary key,
  coven_id uuid not null,
  kind text,
  title text,
  status text,
  scheduled_for timestamptz,
  removed_by uuid,
  removed_at timestamptz not null default now()
);
alter table public.coven_gathering_removed enable row level security;
revoke all on public.coven_gathering_removed from anon, authenticated;

-- A gathering that had been announced, once deleted, leaves what its
-- cancellation note needs (not when its whole coven is going).
create or replace function public.keep_removed_coven_gathering()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.coven_gathering_notices where ritual_id = old.id)
     and exists (select 1 from public.covens where id = old.coven_id) then
    insert into public.coven_gathering_removed (ritual_id, coven_id, kind, title, status, scheduled_for, removed_by)
    values (old.id, old.coven_id, old.kind, old.title, old.status, old.scheduled_for, auth.uid())
    on conflict (ritual_id) do nothing;
  end if;
  return old;
end;
$$;

drop trigger if exists keep_removed_coven_gathering on public.coven_rituals;
create trigger keep_removed_coven_gathering after delete on public.coven_rituals
  for each row execute function public.keep_removed_coven_gathering();

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function
  public.coven_gathering_notice_who(uuid),
  public.coven_gathering_notice_recipients(uuid, jsonb),
  public.guard_coven_ritual_notify(),
  public.keep_removed_coven_gathering(),
  public.limit_manual_coven_gathering_notices()
from public, anon, authenticated;
grant execute on function
  public.coven_gathering_notice_who(uuid),
  public.coven_gathering_notice_recipients(uuid, jsonb)
to service_role;

revoke execute on function public.coven_gathering_may_send(uuid), public.coven_gathering_notice_preview(uuid, jsonb) from public, anon;
grant execute on function public.coven_gathering_may_send(uuid), public.coven_gathering_notice_preview(uuid, jsonb) to authenticated;

revoke execute on function public.coven_clean_notice_who(uuid, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.set_coven_gathering_notice_rule(uuid, text, jsonb) from public, anon;
grant execute on function public.set_coven_gathering_notice_rule(uuid, text, jsonb) to authenticated;
