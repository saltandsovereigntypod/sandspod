-- NOT YET APPLIED. Needs 20261109000000_coven_invitations.sql and the
-- migrations before it (the members' record, programs, the request notices).
-- Additive and safe to run again (paste it whole).
--
-- Open positions: a coven's leaders open a position for applications, say how
-- many may hold it, why it's open, until when, and what it asks; members are
-- told, see whether they meet it, and apply; reviewers decide with the
-- checklist in front of them.
--
-- * Places (coven_ranks.seat_limit): how many active members may hold the
--   position at once; null is no limit. Places left are the limit less those
--   holding it now. Lowering the limit below that is allowed
--   (set_coven_position_places): nobody loses their position, it just shows
--   as over the limit. Giving the position, by approving a request or by hand
--   on Members, takes a place under a lock on the position's row
--   (coven_rank_take_seat), so two approvals at once can't both take the last.
-- * Open (coven_ranks.applications_open, with opening_note,
--   applications_close_at and opened_at): open_to_applications, from before,
--   is kept as the same thing (a trigger keeps the two equal, so apps and
--   pages from before this still open and close it with their old checkbox,
--   and existing open positions stay open). A position takes applications
--   while it is open, its closing date (if any) is still to come and it has a
--   place left. When its last place is filled it closes by itself; requests
--   already waiting stay to be decided (approving one then says it's full,
--   unless the leader gives it more places or declines it).
-- * What it asks (coven_ranks.requirement_items, up to 20): each a kind and
--   its details, checked against the member's record where it can be:
--     min_days_in_coven {days}, min_days_in_position {rank_id, days},
--     holds_position {rank_id}, min_rites_attended {count},
--     program_completed {program_id}, document_signed {document_id},
--     mentor_approval {}, custom {text}.
--   The last two are ticked by whoever decides the request (the mentor's
--   approval only by the member's mentor or the coven's leaders). The old
--   free-text requirements stay, shown as the position's own words ("In
--   their words"). coven_rank_eligibility says, for each, 'met', 'unmet' or
--   'needs_review' and a short line ("21 of 30 rites attended"). A request
--   can be sent only when every automatic one is met. Only
--   save_coven_rank_requirements writes them (a trigger keeps direct writes
--   from the apps and pages out), so they are always cleaned.
-- * Questions (coven_ranks.application_questions, shaped as
--   covens.application_questions): answered when asking, kept with the
--   request (coven_advancement_requests.answers).
-- * When someone came to their position (coven_members.rank_since), for
--   "Dedicant for a year and a day". Filled in for existing members from the
--   request that raised them, else from when they joined.
-- * Opening, closing, places, requirements and questions: those with the
--   coven's 'manage' permission, in good standing, and site moderators.
-- * Phone notes: each opening is a row in coven_position_openings, with whom
--   the leader chose to tell (p_notify: 'everyone' who could apply,
--   'eligible', only those who meet the automatic requirements already, or
--   'none'). coven-notify { rank_id, event: 'opened' }, sent by the leader
--   who opened it, claims it once (notified_at) and tells
--   coven_position_opening_recipients: active members of an active coven,
--   in good standing (not banned from the site, every agreement signed, not
--   paused), below the position, never the leader who opened it nor anyone
--   who has blocked them; then each person's Reminders choices
--   (reminders_v2.positions) decide.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

alter table public.coven_ranks add column if not exists seat_limit integer check (seat_limit is null or seat_limit between 1 and 1000);
alter table public.coven_ranks add column if not exists applications_open boolean not null default false;
alter table public.coven_ranks add column if not exists opening_note text check (opening_note is null or char_length(opening_note) <= 500);
alter table public.coven_ranks add column if not exists applications_close_at timestamptz;
alter table public.coven_ranks add column if not exists opened_at timestamptz;
alter table public.coven_ranks add column if not exists requirement_items jsonb not null default '[]'::jsonb
  check (jsonb_typeof(requirement_items) = 'array' and jsonb_array_length(requirement_items) <= 20);
alter table public.coven_ranks add column if not exists application_questions jsonb not null default '[]'::jsonb
  check (jsonb_typeof(application_questions) = 'array' and jsonb_array_length(application_questions) <= 20);

alter table public.coven_advancement_requests add column if not exists answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object');
-- What the decider ticked: { "<requirement id>": { "by": uuid, "at": timestamptz } }.
alter table public.coven_advancement_requests add column if not exists checked jsonb not null default '{}'::jsonb check (jsonb_typeof(checked) = 'object');

alter table public.coven_members add column if not exists rank_since timestamptz;

-- Existing members: since the request that raised them to it, else since they joined.
update public.coven_members m
set rank_since = coalesce((
  select max(a.decided_at) from public.coven_advancement_requests a
  where a.coven_id = m.coven_id and a.user_id = m.user_id and a.rank_id = m.rank_id and a.status = 'approved'
), m.joined_at)
where m.rank_since is null;

-- Positions open from before: open now, as they were (once; after this the trigger keeps the two equal).
update public.coven_ranks set applications_open = true, opened_at = coalesce(opened_at, updated_at)
where open_to_applications and not applications_open;

-- ---------------------------------------------------------------------------
-- Triggers: open_to_applications and applications_open are one; what a
-- position asks is written only through save_coven_rank_requirements; when
-- someone came to their position; closing when the last place is filled
-- ---------------------------------------------------------------------------

create or replace function public.sync_coven_rank_opening()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.applications_open := coalesce(new.applications_open, false) or coalesce(new.open_to_applications, false);
  elsif new.open_to_applications is distinct from old.open_to_applications
        and new.applications_open is not distinct from old.applications_open then
    -- An app or page from before this changed the old checkbox.
    new.applications_open := coalesce(new.open_to_applications, false);
  end if;
  new.applications_open := coalesce(new.applications_open, false);
  new.open_to_applications := new.applications_open;
  if new.applications_open and (tg_op = 'INSERT' or not old.applications_open) then
    new.opened_at := now();
  end if;
  -- Straight from the apps and pages: what it asks and its questions stay as
  -- save_coven_rank_requirements left them.
  if public.coven_client_write() then
    if tg_op = 'INSERT' then
      new.requirement_items := '[]'::jsonb;
      new.application_questions := '[]'::jsonb;
    else
      new.requirement_items := old.requirement_items;
      new.application_questions := old.application_questions;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_ranks_opening on public.coven_ranks;
create trigger coven_ranks_opening before insert or update on public.coven_ranks
  for each row execute function public.sync_coven_rank_opening();

create or replace function public.mark_coven_rank_since()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.rank_since := coalesce(new.rank_since, now());
  elsif new.rank_id is distinct from old.rank_id or (new.status = 'active' and old.status <> 'active') then
    new.rank_since := now();
  end if;
  return new;
end;
$$;

drop trigger if exists coven_members_rank_since on public.coven_members;
create trigger coven_members_rank_since before insert or update on public.coven_members
  for each row execute function public.mark_coven_rank_since();

-- How many active members hold a position now.
create or replace function public.coven_rank_holder_count(p_rank uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.coven_members m where m.rank_id = p_rank and m.status = 'active';
$$;

create or replace function public.close_coven_rank_when_full()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rank_id is not null and new.status = 'active'
     and (tg_op = 'INSERT' or new.rank_id is distinct from old.rank_id or old.status <> 'active') then
    update public.coven_ranks r set applications_open = false
    where r.id = new.rank_id and r.applications_open and r.seat_limit is not null
      and public.coven_rank_holder_count(r.id) >= r.seat_limit;
  end if;
  return null;
end;
$$;

drop trigger if exists coven_members_close_full_rank on public.coven_members;
create trigger coven_members_close_full_rank after insert or update on public.coven_members
  for each row execute function public.close_coven_rank_when_full();

-- "Moon Circle's Warden is full: both places are taken." in the words the screens show.
create or replace function public.coven_rank_full_message(p_name text, p_limit integer)
returns text
language sql
immutable
set search_path = public
as $$
  select p_name || ' is full: ' || case when p_limit = 1 then 'its one place is taken' when p_limit = 2 then 'both places are taken' else 'all ' || p_limit || ' places are taken' end || '.';
$$;

-- Take a place in a position for someone (approving a request, or giving it
-- by hand). Locks the position's row first, so two at once wait for each
-- other and the second sees the first's.
create or replace function public.coven_rank_take_seat(p_rank uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if r.seat_limit is null then return; end if;
  if public.coven_rank_holder_count(p_rank) >= r.seat_limit then
    raise exception '% Give it more places first, or decline the request.', public.coven_rank_full_message(r.name, r.seat_limit);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Requirements: words, cleaning, and whether someone meets them
-- ---------------------------------------------------------------------------

-- A whole number from jsonb within bounds, else null.
create or replace function public.coven_req_int(v jsonb, lo integer, hi integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(v) = 'number' and (v::text)::numeric = trunc((v::text)::numeric) and (v::text)::numeric between lo and hi then (v::text)::integer
    when jsonb_typeof(v) = 'string' and v #>> '{}' ~ '^\d{1,6}$' and (v #>> '{}')::integer between lo and hi then (v #>> '{}')::integer
    else null
  end;
$$;

-- "a year and a day", "a year", "1 day", "30 days". Mirrors lib/covens/positions.ts daysWords.
create or replace function public.coven_days_words(n integer)
returns text
language sql
immutable
set search_path = public
as $$
  select case when n = 366 then 'a year and a day' when n = 365 then 'a year' when n = 1 then '1 day' else n || ' days' end;
$$;

-- A uuid from jsonb text, else null.
create or replace function public.coven_req_uuid(v jsonb)
returns uuid
language sql
immutable
set search_path = public
as $$
  select case when jsonb_typeof(v) = 'string' and v #>> '{}' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then (v #>> '{}')::uuid end;
$$;

-- What a position asks, as it can be saved: each item checked against the
-- coven (its positions below this one, its studies and pages). Raises in the
-- words the editor shows. Mirrors lib/covens/positions.ts cleanRequirements.
create or replace function public.coven_clean_rank_requirements(p_rank uuid, p_items jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  item jsonb;
  idx integer := 0;
  out jsonb := '[]'::jsonb;
  used text[] := '{}';
  kind text;
  v_id text;
  n integer;
  ref uuid;
  words text;
begin
  select * into r from public.coven_ranks x where x.id = p_rank;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then return '[]'::jsonb; end if;
  if jsonb_array_length(p_items) > 20 then raise exception 'A position can ask up to 20 things.'; end if;
  for item in select x from jsonb_array_elements(p_items) x loop
    idx := idx + 1;
    if jsonb_typeof(item) <> 'object' then continue; end if;
    kind := item->>'kind';
    v_id := case when coalesce(item->>'id', '') ~ '^[A-Za-z0-9_-]{1,40}$' then item->>'id' else 'req-' || idx end;
    if v_id = any (used) then v_id := left(v_id, 34) || '-' || idx; end if;
    if kind = 'min_days_in_coven' then
      n := public.coven_req_int(item->'days', 1, 3650);
      if n is null then raise exception 'Choose how many days in the coven: 1 to 3,650.'; end if;
      out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'kind', kind, 'days', n));
    elsif kind in ('min_days_in_position', 'holds_position') then
      ref := public.coven_req_uuid(item->'rank_id');
      if ref is null or not exists (select 1 from public.coven_ranks o where o.id = ref and o.coven_id = r.coven_id and o.id <> r.id and o.level < r.level) then
        raise exception 'Choose a position below % for that requirement.', r.name;
      end if;
      if kind = 'min_days_in_position' then
        n := public.coven_req_int(item->'days', 1, 3650);
        if n is null then raise exception 'Choose how many days in that position: 1 to 3,650.'; end if;
        out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'kind', kind, 'rank_id', ref, 'days', n));
      else
        out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'kind', kind, 'rank_id', ref));
      end if;
    elsif kind = 'min_rites_attended' then
      n := public.coven_req_int(item->'count', 1, 1000);
      if n is null then raise exception 'Choose how many rites: 1 to 1,000.'; end if;
      out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'kind', kind, 'count', n));
    elsif kind = 'program_completed' then
      ref := public.coven_req_uuid(item->'program_id');
      if ref is null or not exists (select 1 from public.coven_programs p where p.id = ref and p.coven_id = r.coven_id) then
        raise exception 'Choose one of the coven’s programs for that requirement.';
      end if;
      out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'kind', kind, 'program_id', ref));
    elsif kind = 'document_signed' then
      ref := public.coven_req_uuid(item->'document_id');
      if ref is null or not exists (select 1 from public.coven_documents d where d.id = ref and d.coven_id = r.coven_id) then
        raise exception 'Choose one of the coven’s pages for that requirement.';
      end if;
      out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'kind', kind, 'document_id', ref));
    elsif kind = 'mentor_approval' then
      if exists (select 1 from jsonb_array_elements(out) o where o->>'kind' = 'mentor_approval') then continue; end if;
      out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'kind', kind));
    elsif kind = 'custom' then
      words := btrim(regexp_replace(coalesce(item->>'text', ''), '\s+', ' ', 'g'));
      if words = '' then continue; end if;
      if char_length(words) > 300 then raise exception 'Keep each requirement to 300 characters.'; end if;
      out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'kind', kind, 'text', words));
    else
      raise exception 'That kind of requirement isn’t known.';
    end if;
    used := used || v_id;
  end loop;
  return out;
end;
$$;

-- Questions as they can be saved: [{ id, prompt, required }], at most 20 (as lib/covens/model.ts normalizeQuestions).
create or replace function public.coven_clean_rank_questions(p_questions jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  q jsonb;
  idx integer := 0;
  out jsonb := '[]'::jsonb;
  used text[] := '{}';
  v_id text;
  prompt text;
begin
  if p_questions is null or jsonb_typeof(p_questions) <> 'array' then return '[]'::jsonb; end if;
  for q in select x from jsonb_array_elements(p_questions) x loop
    idx := idx + 1;
    if jsonb_typeof(q) <> 'object' then continue; end if;
    prompt := btrim(coalesce(q->>'prompt', ''));
    if prompt = '' then continue; end if;
    if char_length(prompt) > 300 then raise exception 'Keep each question to 300 characters.'; end if;
    v_id := case when coalesce(q->>'id', '') ~ '^[A-Za-z0-9_-]{1,60}$' then q->>'id' else 'q-' || idx end;
    if v_id = any (used) then v_id := left(v_id, 54) || '-' || idx; end if;
    used := used || v_id;
    out := out || jsonb_build_array(jsonb_build_object('id', v_id, 'prompt', prompt, 'required', coalesce(q->>'required', '') = 'true'));
    if jsonb_array_length(out) >= 20 then exit; end if;
  end loop;
  return out;
end;
$$;

-- Each thing the position asks, for one person: { id, kind, status
-- ('met' | 'unmet' | 'needs_review'), auto, label, line }. p_checked is a
-- request's ticks (custom items and the mentor's approval).
-- Not for calling directly: coven_rank_eligibility and the others check who asks.
create or replace function public.coven_rank_requirement_status(p_rank uuid, p_user uuid, p_checked jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  m public.coven_members;
  my_level integer;
  item jsonb;
  out jsonb := '[]'::jsonb;
  kind text;
  st text;
  label text;
  line text;
  need integer;
  n integer;
  other public.coven_ranks;
  mine public.coven_ranks;
  prog public.coven_programs;
  e public.coven_program_enrollments;
  d public.coven_documents;
  confirmed boolean;
begin
  select * into r from public.coven_ranks where id = p_rank;
  if r.id is null then return '[]'::jsonb; end if;
  select * into m from public.coven_members where coven_id = r.coven_id and user_id = p_user and status = 'active';
  my_level := coalesce(public.coven_level(r.coven_id, p_user), 0);
  if m.rank_id is not null then select * into mine from public.coven_ranks where id = m.rank_id; end if;
  for item in select x from jsonb_array_elements(case when jsonb_typeof(r.requirement_items) = 'array' then r.requirement_items else '[]'::jsonb end) x loop
    if jsonb_typeof(item) <> 'object' then continue; end if;
    kind := item->>'kind';
    st := 'needs_review';
    label := null;
    line := null;
    confirmed := jsonb_typeof(p_checked) = 'object' and p_checked ? coalesce(item->>'id', '');
    if kind = 'min_days_in_coven' then
      need := public.coven_req_int(item->'days', 1, 3650);
      n := case when m.user_id is null then 0 else greatest(floor(extract(epoch from now() - m.joined_at) / 86400), 0)::integer end;
      if need is null then
        label := 'Time in the coven';
        line := 'Not set up fully; the reviewer decides';
      else
        label := 'In the coven for ' || public.coven_days_words(need);
        st := case when n >= need then 'met' else 'unmet' end;
        line := case when st = 'met' then public.coven_days_words(n) || ' in the coven' else n || ' of ' || need || ' days in the coven' end;
      end if;
    elsif kind in ('min_days_in_position', 'holds_position') then
      other := null;
      select * into other from public.coven_ranks o where o.id = public.coven_req_uuid(item->'rank_id') and o.coven_id = r.coven_id;
      need := case when kind = 'min_days_in_position' then public.coven_req_int(item->'days', 1, 3650) end;
      if other.id is null or (kind = 'min_days_in_position' and need is null) then
        label := 'A position no longer in the coven';
        line := 'The reviewer decides';
      elsif kind = 'holds_position' then
        label := 'Holds ' || other.name;
        if m.rank_id = other.id then
          st := 'met';
          line := 'Holds ' || other.name;
        elsif m.user_id is not null and my_level > other.level then
          st := 'met';
          line := 'Holds a more senior position';
        else
          st := 'unmet';
          line := case when mine.id is null then 'Holds no position yet' else 'Holds ' || mine.name || ', not ' || other.name end;
        end if;
      else
        label := other.name || ' for ' || public.coven_days_words(need);
        if m.rank_id = other.id then
          n := greatest(floor(extract(epoch from now() - coalesce(m.rank_since, m.joined_at)) / 86400), 0)::integer;
          st := case when n >= need then 'met' else 'unmet' end;
          line := case when st = 'met' then other.name || ' for ' || public.coven_days_words(n) else other.name || ' for ' || n || ' of ' || need || ' days' end;
        elsif m.user_id is not null and my_level > other.level then
          st := 'met';
          line := 'Past ' || other.name || ' already';
        else
          st := 'unmet';
          line := 'Not ' || other.name || ' yet';
        end if;
      end if;
    elsif kind = 'min_rites_attended' then
      need := public.coven_req_int(item->'count', 1, 1000);
      select count(*)::integer into n from public.coven_ritual_attendance a where a.coven_id = r.coven_id and a.user_id = p_user and a.present is true;
      if need is null then
        label := 'Rites attended';
        line := 'Not set up fully; the reviewer decides';
      else
        label := 'Has come to ' || need || case when need = 1 then ' rite' else ' rites' end;
        st := case when n >= need then 'met' else 'unmet' end;
        line := n || ' of ' || need || case when need = 1 then ' rite' else ' rites' end || ' attended';
      end if;
    elsif kind = 'program_completed' then
      prog := null;
      e := null;
      select * into prog from public.coven_programs p where p.id = public.coven_req_uuid(item->'program_id') and p.coven_id = r.coven_id;
      if prog.id is null then
        label := 'A program no longer in the coven';
        line := 'The reviewer decides';
      else
        select * into e from public.coven_program_enrollments x where x.program_id = prog.id and x.user_id = p_user;
        label := 'Completed ' || prog.title;
        st := case when e.status = 'completed' then 'met' else 'unmet' end;
        line := case
          when e.status = 'completed' then 'Completed'
          when e.status in ('active', 'paused') then 'Begun, not finished yet'
          when e.status = 'withdrawn' then 'Left it before finishing'
          else 'Not begun' end;
      end if;
    elsif kind = 'document_signed' then
      d := null;
      select * into d from public.coven_documents x where x.id = public.coven_req_uuid(item->'document_id') and x.coven_id = r.coven_id;
      if d.id is null then
        label := 'A page no longer in the coven';
        line := 'The reviewer decides';
      else
        label := 'Signed ' || d.title;
        if exists (select 1 from public.coven_signatures s where s.document_id = d.id and s.user_id = p_user and s.version = d.version) then
          st := 'met';
          line := 'Signed';
        else
          st := 'unmet';
          line := case when exists (select 1 from public.coven_signatures s where s.document_id = d.id and s.user_id = p_user)
            then 'Signed an earlier version, not the current one' else 'Not signed yet' end;
        end if;
      end if;
    elsif kind = 'mentor_approval' then
      label := 'Their mentor’s approval';
      st := case when confirmed then 'met' else 'needs_review' end;
      line := case when confirmed then 'Given' else 'Their mentor or the coven’s leaders give it when deciding' end;
    elsif kind = 'custom' then
      label := coalesce(nullif(btrim(item->>'text'), ''), 'Something the reviewer confirms');
      st := case when confirmed then 'met' else 'needs_review' end;
      line := case when confirmed then 'Confirmed' else 'The reviewer confirms this' end;
    else
      continue;
    end if;
    out := out || jsonb_build_array(jsonb_build_object(
      'id', item->>'id', 'kind', kind, 'status', st, 'auto', kind not in ('mentor_approval', 'custom'), 'label', label, 'line', line
    ));
  end loop;
  return out;
end;
$$;

-- Whether every automatic requirement is met (custom items and the mentor's approval wait for the reviewer).
create or replace function public.coven_rank_ready(p_rank uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from jsonb_array_elements(public.coven_rank_requirement_status(p_rank, p_user, '{}'::jsonb)) x
    where x->>'status' = 'unmet'
  );
$$;

-- What a position asks of someone, and whether they meet it: your own, or
-- anyone's for the coven's reviewers and leaders (and site moderators).
create or replace function public.coven_rank_eligibility(p_rank uuid, p_user uuid default auth.uid())
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_coven uuid;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select coven_id into v_coven from public.coven_ranks where id = p_rank;
  if v_coven is null then raise exception 'That position was not found.'; end if;
  if coalesce(p_user, auth.uid()) <> auth.uid()
     and not (public.coven_permission(v_coven, 'review') or public.is_community_moderator()) then
    raise exception 'Only the coven''s reviewers see whether someone meets what a position asks.';
  end if;
  if coalesce(p_user, auth.uid()) = auth.uid() and not (public.is_coven_member(v_coven) or public.is_community_moderator()) then
    raise exception 'This is for the coven''s members.';
  end if;
  return public.coven_rank_requirement_status(p_rank, coalesce(p_user, auth.uid()), '{}'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- Openings, and who hears about one
-- ---------------------------------------------------------------------------

create table if not exists public.coven_position_openings (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  rank_id uuid not null references public.coven_ranks (id) on delete cascade,
  opened_by uuid references auth.users (id) on delete set null,
  opened_at timestamptz not null default now(),
  -- Who the leader chose to tell: everyone who could apply, only those who already meet it, or no one.
  audience text not null default 'everyone' check (audience in ('everyone', 'eligible', 'none')),
  seat_limit integer,
  close_at timestamptz,
  note text check (note is null or char_length(note) <= 500),
  -- Claimed once by coven-notify, with how many it went to.
  notified_at timestamptz,
  recipients integer
);

create index if not exists coven_position_openings_rank_idx on public.coven_position_openings (rank_id, opened_at desc);

alter table public.coven_position_openings enable row level security;
drop policy if exists "Leaders see their coven's openings" on public.coven_position_openings;
create policy "Leaders see their coven's openings" on public.coven_position_openings
  for select to authenticated
  using (public.coven_permission(coven_id, 'manage') or public.is_community_moderator());
revoke insert, update, delete on public.coven_position_openings from anon, authenticated;
revoke select on public.coven_position_openings from anon;

-- Those who could be told about a position opening: active members of an
-- active coven below it, in good standing (not banned from the site, every
-- agreement signed, not paused), never the one who opened it nor anyone who
-- has blocked them; for 'eligible', only those who already meet every
-- automatic requirement. Each person's own choices are left to coven-notify.
create or replace function public.coven_position_audience(p_rank uuid, p_audience text, p_opener uuid default null)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(m.user_id order by m.joined_at, m.user_id), '{}')
  from public.coven_ranks r
  join public.covens c on c.id = r.coven_id and c.status = 'active'
  join public.coven_members m on m.coven_id = r.coven_id and m.status = 'active'
  where r.id = p_rank
    and p_audience in ('everyone', 'eligible')
    and m.user_id is distinct from p_opener
    and public.coven_level(r.coven_id, m.user_id) < r.level
    and not public.is_community_banned(m.user_id)
    and public.coven_unsigned_agreements(r.coven_id, m.user_id) = 0
    and (m.muted_until is null or m.muted_until <= now())
    and not exists (select 1 from public.user_blocks b where b.blocker_id = m.user_id and b.blocked_id = p_opener)
    and (p_audience = 'everyone' or public.coven_rank_ready(r.id, m.user_id));
$$;

-- For coven-notify: who an opening goes to.
create or replace function public.coven_position_opening_recipients(p_opening uuid)
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select public.coven_position_audience(o.rank_id, o.audience, o.opened_by) from public.coven_position_openings o where o.id = p_opening), '{}');
$$;

-- For the leader, before opening: how many each choice would reach (before anyone's own choices).
create or replace function public.coven_position_notice_preview(p_rank uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_coven uuid;
begin
  select coven_id into v_coven from public.coven_ranks where id = p_rank;
  if v_coven is null then raise exception 'That position was not found.'; end if;
  if not public.coven_may_open_positions(v_coven) then
    raise exception 'Only the coven''s leaders open positions for applications.';
  end if;
  return jsonb_build_object(
    'everyone', cardinality(public.coven_position_audience(p_rank, 'everyone', auth.uid())),
    'eligible', cardinality(public.coven_position_audience(p_rank, 'eligible', auth.uid()))
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- What members and leaders read
-- ---------------------------------------------------------------------------

-- For a coven's members: how many hold each position, and for each position
-- taking applications now above you, what it asks and whether you meet it.
create or replace function public.coven_positions_overview(p_coven uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  me integer;
begin
  if not (public.is_coven_member(p_coven) or public.is_community_moderator()) then
    raise exception 'This is for the coven''s members.';
  end if;
  me := coalesce(public.coven_level(p_coven), 0);
  return jsonb_build_object(
    'now', now(),
    'holders', coalesce((select jsonb_object_agg(r.id, public.coven_rank_holder_count(r.id)) from public.coven_ranks r where r.coven_id = p_coven), '{}'::jsonb),
    'open', coalesce((
      select jsonb_agg(jsonb_build_object('rank_id', r.id, 'requirements', public.coven_rank_requirement_status(r.id, auth.uid(), '{}'::jsonb)) order by r.level)
      from public.coven_ranks r
      where r.coven_id = p_coven and r.applications_open
        and (r.applications_close_at is null or r.applications_close_at > now())
        and r.level > me
    ), '[]'::jsonb)
  );
end;
$$;

-- A request's checklist as it stands, with what's been ticked: for the
-- coven's reviewers, and for the one who asked.
create or replace function public.coven_advancement_checklist(p_request uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  req public.coven_advancement_requests;
begin
  select * into req from public.coven_advancement_requests where id = p_request;
  if req.id is null then raise exception 'That request was not found.'; end if;
  if not (req.user_id = auth.uid() or public.coven_permission(req.coven_id, 'review') or public.is_community_moderator()) then
    raise exception 'Only the coven''s reviewers see this.';
  end if;
  return public.coven_rank_requirement_status(req.rank_id, req.user_id, req.checked);
end;
$$;

-- ---------------------------------------------------------------------------
-- Opening, closing, places, and what a position asks (the coven's leaders)
-- ---------------------------------------------------------------------------

create or replace function public.coven_may_open_positions(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (public.coven_permission(p_coven, 'manage') and public.coven_in_good_standing(p_coven)) or public.is_community_moderator();
$$;

-- How many may hold a position (null: no limit), open or not. Lowering it
-- below those holding it is allowed (nobody loses it); an open position
-- with no place left then closes.
create or replace function public.set_coven_position_places(p_rank uuid, p_seat_limit integer default null)
returns public.coven_ranks
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if not public.coven_may_open_positions(r.coven_id) then
    raise exception 'Only the coven''s leaders choose how many may hold a position.';
  end if;
  if p_seat_limit is not null and (p_seat_limit < 1 or p_seat_limit > 1000) then
    raise exception 'Choose how many may hold it: 1 to 1,000, or no limit.';
  end if;
  update public.coven_ranks
  set seat_limit = p_seat_limit,
      applications_open = applications_open and (p_seat_limit is null or public.coven_rank_holder_count(r.id) < p_seat_limit)
  where id = r.id
  returning * into r;
  return r;
end;
$$;

-- Open a position for applications, or change one that's open (its places,
-- note and closing date). Opening it anew (closed, full or past its date
-- before) starts a new opening, told to those p_notify names once
-- (coven-notify { rank_id, event: 'opened' }): 'everyone' who could apply,
-- 'eligible' (only those who meet the automatic requirements already) or
-- 'none'. Changing one already open tells no one again; giving it fewer
-- places than are held then closes it.
drop function if exists public.open_coven_position(uuid, integer, text, timestamptz, boolean, text);
create or replace function public.open_coven_position(
  p_rank uuid,
  p_seat_limit integer default null,
  p_note text default null,
  p_close_at timestamptz default null,
  p_notify text default 'everyone'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  held integer;
  was_open boolean;
  is_full boolean;
  who text := coalesce(p_notify, 'none');
  opening uuid;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if not public.coven_may_open_positions(r.coven_id) then
    raise exception 'Only the coven''s leaders open positions for applications.';
  end if;
  if r.is_default then raise exception 'Everyone joins the coven as %, so there is nothing to apply for.', r.name; end if;
  if p_seat_limit is not null and (p_seat_limit < 1 or p_seat_limit > 1000) then
    raise exception 'Choose how many may hold it: 1 to 1,000, or no limit.';
  end if;
  if char_length(btrim(coalesce(p_note, ''))) > 500 then raise exception 'Keep the note to 500 characters.'; end if;
  if p_close_at is not null and p_close_at <= now() then raise exception 'Choose a closing date still to come.'; end if;
  if who not in ('everyone', 'eligible', 'none') then raise exception 'Choose who hears about it: everyone, those who meet what it asks, or no one.'; end if;
  held := public.coven_rank_holder_count(r.id);
  is_full := p_seat_limit is not null and held >= p_seat_limit;
  was_open := r.applications_open and (r.applications_close_at is null or r.applications_close_at > now());
  if is_full and not was_open then
    raise exception 'Every place in % is held (% of %). Give it more places to open it.', r.name, held, p_seat_limit;
  end if;

  update public.coven_ranks
  set seat_limit = p_seat_limit,
      opening_note = nullif(btrim(coalesce(p_note, '')), ''),
      applications_close_at = p_close_at,
      applications_open = not is_full,
      opened_at = case when was_open then opened_at else now() end
  where id = r.id
  returning * into r;

  if not was_open then
    insert into public.coven_position_openings (coven_id, rank_id, opened_by, audience, seat_limit, close_at, note)
    values (r.coven_id, r.id, auth.uid(), who, p_seat_limit, p_close_at, r.opening_note)
    returning id into opening;
  end if;

  return jsonb_build_object('rank', to_jsonb(r), 'opening_id', opening, 'notify', opening is not null and who <> 'none', 'closed_full', is_full);
end;
$$;

-- Stop taking applications. Requests already waiting stay to be decided.
create or replace function public.close_coven_position(p_rank uuid)
returns public.coven_ranks
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if not public.coven_may_open_positions(r.coven_id) then
    raise exception 'Only the coven''s leaders open and close positions.';
  end if;
  update public.coven_ranks set applications_open = false where id = r.id returning * into r;
  return r;
end;
$$;

-- What a position asks (p_items), and, when given, the questions it asks people who apply.
create or replace function public.save_coven_rank_requirements(p_rank uuid, p_items jsonb, p_questions jsonb default null)
returns public.coven_ranks
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  items jsonb;
begin
  select * into r from public.coven_ranks where id = p_rank for update;
  if r.id is null then raise exception 'That position was not found.'; end if;
  if not public.coven_may_open_positions(r.coven_id) then
    raise exception 'Only the coven''s leaders choose what a position asks.';
  end if;
  items := public.coven_clean_rank_requirements(p_rank, coalesce(p_items, '[]'::jsonb));
  update public.coven_ranks
  set requirement_items = items,
      application_questions = case when p_questions is null then application_questions else public.coven_clean_rank_questions(p_questions) end
  where id = r.id
  returning * into r;
  return r;
end;
$$;

-- ---------------------------------------------------------------------------
-- Asking to advance, and deciding (replacing the ones from 20261023000000_covens.sql)
-- ---------------------------------------------------------------------------

drop function if exists public.request_coven_advancement(uuid, uuid, text);
create or replace function public.request_coven_advancement(p_coven uuid, p_rank uuid, p_statement text default null, p_answers jsonb default null)
returns public.coven_advancement_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_ranks;
  created public.coven_advancement_requests;
  unmet text;
  v_answers jsonb := '{}'::jsonb;
  q jsonb;
  answer text;
begin
  if not public.coven_in_good_standing(p_coven) then
    raise exception 'You need to be a member in good standing (with the agreements signed) to ask for advancement.';
  end if;
  select * into r from public.coven_ranks where id = p_rank and coven_id = p_coven;
  if r.id is null or not r.applications_open then raise exception 'That position is not open to applications.'; end if;
  if r.applications_close_at is not null and r.applications_close_at <= now() then
    raise exception 'Applications for % have closed.', r.name;
  end if;
  if r.seat_limit is not null and public.coven_rank_holder_count(r.id) >= r.seat_limit then
    raise exception '%', public.coven_rank_full_message(r.name, r.seat_limit);
  end if;
  if r.level <= public.coven_level(p_coven) then raise exception 'You already hold that position or a higher one.'; end if;
  if exists (select 1 from public.coven_advancement_requests where coven_id = p_coven and user_id = auth.uid() and status = 'pending') then
    raise exception 'You already have a request waiting for review.';
  end if;
  select string_agg(x->>'line', '; ') into unmet
  from jsonb_array_elements(public.coven_rank_requirement_status(r.id, auth.uid(), '{}'::jsonb)) x
  where x->>'status' = 'unmet';
  if unmet is not null then raise exception 'You don’t yet meet everything % asks: %.', r.name, unmet; end if;

  -- Answers to the position's own questions, kept by question.
  for q in select x from jsonb_array_elements(case when jsonb_typeof(r.application_questions) = 'array' then r.application_questions else '[]'::jsonb end) x loop
    answer := case when jsonb_typeof(p_answers) = 'object' then btrim(coalesce(p_answers->>(q->>'id'), '')) else '' end;
    if char_length(answer) > 4000 then raise exception 'Keep each answer to 4,000 characters.'; end if;
    if answer = '' then
      if coalesce(q->>'required', '') = 'true' then raise exception 'Please answer: %', q->>'prompt'; end if;
    else
      v_answers := v_answers || jsonb_build_object(q->>'id', answer);
    end if;
  end loop;

  insert into public.coven_advancement_requests (coven_id, user_id, rank_id, statement, answers)
  values (p_coven, auth.uid(), p_rank, nullif(btrim(p_statement), ''), v_answers)
  returning * into created;
  return created;
end;
$$;

-- p_checked: the ids of what the decider ticks (custom items, and the
-- mentor's approval, which only the member's mentor or the coven's leaders
-- may give). Ticks are kept even when declining. Approving needs each of
-- those ticked and a place free.
drop function if exists public.decide_coven_advancement(uuid, boolean, text);
create or replace function public.decide_coven_advancement(p_request uuid, p_approve boolean, p_note text default null, p_checked jsonb default null)
returns public.coven_advancement_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.coven_advancement_requests;
  r public.coven_ranks;
  v_checked jsonb;
  item jsonb;
  missing text;
begin
  select * into req from public.coven_advancement_requests where id = p_request for update;
  if req.id is null then raise exception 'That request was not found.'; end if;
  if req.status <> 'pending' then raise exception 'That request has already been decided.'; end if;
  if req.user_id = auth.uid() and not public.is_community_moderator() then raise exception 'You cannot decide your own request.'; end if;
  if not (public.coven_permission(req.coven_id, 'review') or public.is_community_moderator()) then
    raise exception 'Only the coven''s reviewers can decide advancement.';
  end if;
  select * into r from public.coven_ranks where id = req.rank_id;

  -- What's ticked: what was before (and is still asked), and what's ticked now.
  v_checked := coalesce((
    select jsonb_object_agg(k, v) from jsonb_each(req.checked) as e(k, v)
    where exists (select 1 from jsonb_array_elements(r.requirement_items) i where i->>'id' = k and i->>'kind' in ('custom', 'mentor_approval'))
  ), '{}'::jsonb);
  if jsonb_typeof(p_checked) = 'array' then
    for item in select i from jsonb_array_elements(r.requirement_items) i
                where i->>'kind' in ('custom', 'mentor_approval') and p_checked ? (i->>'id') loop
      if v_checked ? (item->>'id') then continue; end if;
      if item->>'kind' = 'mentor_approval'
         and not (public.coven_is_mentor_of(req.coven_id, req.user_id) or public.coven_permission(req.coven_id, 'manage') or public.is_community_moderator()) then
        raise exception 'Only their mentor or the coven’s leaders can give the mentor’s approval.';
      end if;
      v_checked := v_checked || jsonb_build_object(item->>'id', jsonb_build_object('by', auth.uid(), 'at', now()));
    end loop;
  end if;

  if p_approve then
    if not public.coven_can_grant(req.coven_id, req.rank_id) then
      raise exception 'That position must be granted by someone more senior.';
    end if;
    select string_agg(coalesce(case when i->>'kind' = 'mentor_approval' then 'their mentor’s approval' else i->>'text' end, 'a requirement'), '; ') into missing
    from jsonb_array_elements(r.requirement_items) i
    where i->>'kind' in ('custom', 'mentor_approval') and not v_checked ? (i->>'id');
    if missing is not null then raise exception 'Tick what the position asks before approving: %.', missing; end if;
    perform public.coven_rank_take_seat(req.rank_id);
    update public.coven_members set rank_id = req.rank_id
    where coven_id = req.coven_id and user_id = req.user_id and status = 'active';
    if not found then raise exception 'That person is no longer a member.'; end if;
  end if;
  update public.coven_advancement_requests
  set status = case when p_approve then 'approved' else 'declined' end,
      reviewer_id = auth.uid(), reviewer_note = nullif(btrim(p_note), ''), decided_at = now(), checked = v_checked
  where id = p_request
  returning * into req;
  return req;
end;
$$;

-- Giving a position by hand (Members) keeps to its places too. As in
-- 20261023000000_covens.sql, with coven_rank_take_seat.
create or replace function public.update_coven_member(
  p_coven uuid,
  p_user uuid,
  p_rank uuid default null,
  p_status text default null,
  p_muted_until timestamptz default null,
  p_clear_mute boolean default false
)
returns public.coven_members
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.coven_members;
  site_moderator boolean := public.is_community_moderator();
  updated public.coven_members;
begin
  select * into target from public.coven_members where coven_id = p_coven and user_id = p_user for update;
  if target.coven_id is null then raise exception 'That person is not in this coven.'; end if;
  if p_user = auth.uid() and not site_moderator then raise exception 'You cannot change your own membership here.'; end if;
  if not site_moderator then
    if p_user = (select founder_id from public.covens where id = p_coven) then
      raise exception 'Only site moderators can act on a coven''s founder.';
    end if;
    if public.coven_level(p_coven, p_user) >= public.coven_level(p_coven) then
      raise exception 'You can only act on members junior to you.';
    end if;
  end if;

  if p_rank is not null then
    if not public.coven_can_grant(p_coven, p_rank) or not (site_moderator or public.coven_permission(p_coven, 'review')) then
      raise exception 'You cannot grant that position.';
    end if;
    if p_rank is distinct from target.rank_id and target.status = 'active' then
      perform public.coven_rank_take_seat(p_rank);
    end if;
  end if;
  if (p_status is not null or p_muted_until is not null or p_clear_mute)
     and not (site_moderator or public.coven_permission(p_coven, 'moderate')) then
    raise exception 'Only the coven''s moderators can mute or remove members.';
  end if;
  if p_status is not null and p_status not in ('active', 'removed', 'banned') then
    raise exception 'Unknown membership status.';
  end if;

  update public.coven_members
  set rank_id = coalesce(p_rank, rank_id),
      status = coalesce(p_status, status),
      muted_until = case when p_clear_mute then null else coalesce(p_muted_until, muted_until) end
  where coven_id = p_coven and user_id = p_user
  returning * into updated;
  return updated;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function
  public.sync_coven_rank_opening(),
  public.mark_coven_rank_since(),
  public.close_coven_rank_when_full(),
  public.coven_rank_take_seat(uuid),
  public.coven_clean_rank_requirements(uuid, jsonb),
  public.coven_rank_requirement_status(uuid, uuid, jsonb),
  public.coven_rank_ready(uuid, uuid),
  public.coven_position_audience(uuid, text, uuid),
  public.coven_position_opening_recipients(uuid)
from public, anon, authenticated;
grant execute on function
  public.coven_position_audience(uuid, text, uuid),
  public.coven_position_opening_recipients(uuid),
  public.coven_rank_ready(uuid, uuid)
to service_role;

revoke execute on function
  public.coven_rank_holder_count(uuid),
  public.coven_rank_full_message(text, integer),
  public.coven_req_int(jsonb, integer, integer),
  public.coven_days_words(integer),
  public.coven_req_uuid(jsonb),
  public.coven_clean_rank_questions(jsonb),
  public.coven_rank_eligibility(uuid, uuid),
  public.coven_position_notice_preview(uuid),
  public.coven_positions_overview(uuid),
  public.coven_advancement_checklist(uuid),
  public.coven_may_open_positions(uuid),
  public.set_coven_position_places(uuid, integer),
  public.open_coven_position(uuid, integer, text, timestamptz, text),
  public.close_coven_position(uuid),
  public.save_coven_rank_requirements(uuid, jsonb, jsonb),
  public.request_coven_advancement(uuid, uuid, text, jsonb),
  public.decide_coven_advancement(uuid, boolean, text, jsonb),
  public.update_coven_member(uuid, uuid, uuid, text, timestamptz, boolean)
from public, anon;
grant execute on function
  public.coven_rank_holder_count(uuid),
  public.coven_rank_full_message(text, integer),
  public.coven_req_int(jsonb, integer, integer),
  public.coven_days_words(integer),
  public.coven_req_uuid(jsonb),
  public.coven_clean_rank_questions(jsonb),
  public.coven_rank_eligibility(uuid, uuid),
  public.coven_position_notice_preview(uuid),
  public.coven_positions_overview(uuid),
  public.coven_advancement_checklist(uuid),
  public.coven_may_open_positions(uuid),
  public.set_coven_position_places(uuid, integer),
  public.open_coven_position(uuid, integer, text, timestamptz, text),
  public.close_coven_position(uuid),
  public.save_coven_rank_requirements(uuid, jsonb, jsonb),
  public.request_coven_advancement(uuid, uuid, text, jsonb),
  public.decide_coven_advancement(uuid, boolean, text, jsonb),
  public.update_coven_member(uuid, uuid, uuid, text, timestamptz, boolean)
to authenticated, service_role;
