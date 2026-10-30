-- NOT YET APPLIED. Additive and safe to run again; needs the coven
-- migrations before it (coven_permission, coven_is_head,
-- coven_in_good_standing, is_community_moderator, is_community_banned,
-- user_blocks).
--
-- Community Rituals: personal and coven ritual templates shared with
-- everyone, reviewed first, the way the Community Grimoire works (app:
-- lib/rituals/community.ts and communityApi.ts, rituals/community/*;
-- website: rituals/community/, rituals/js/community.js).
--
-- * community_rituals: one row per shared ritual (or new version of one).
--   A sharer offers it (pending); a moderator publishes it, returns it for
--   changes (needs_revision) or declines it (rejected), with a note the
--   sharer reads. The sharer can change it while it waits or is returned,
--   withdraw it at any time, and send an update to a published one as a new
--   version: the update waits for review while the published version stays
--   up, and when it's published the older one steps aside (superseded) and
--   hands on its save count.
-- * Shared by a person (under the name they choose, or anonymously) or on
--   behalf of a coven (credited to the coven by its name). Coven shares are
--   checked here: only the coven's head and those who lead its rituals, in
--   good standing. Only what the sharer sends is kept (the apps send the
--   rite itself: never a coven's roles, members, notes or anything personal).
-- * Everyone reads published rituals through community_rituals_published,
--   which leaves out who shared an anonymous ritual (and which coven member
--   shared a coven's) and hides rituals from anyone the reader has blocked.
--   The table itself is read only by the sharer, the coven's ritual leaders
--   (for a coven's shares) and moderators. Every change goes through the
--   functions below.
-- * community_ritual_saves: one row per person per ritual saved to their
--   rituals or a coven's, so the count only rises once each. People read
--   only their own rows; everyone sees only the count.
--
-- New tables only: no new foreign key from an existing table, so existing
-- PostgREST embeds (coven_members→covens, community_submissions→profiles and
-- the rest) stay unambiguous. community_rituals has one link to covens.
--
-- Notifications: none are sent yet; the sharer sees the status and the
-- moderator's note in the app and on the website (My shared rituals).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.community_rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  coven_id uuid references public.covens (id) on delete set null,
  share_as text not null default 'person' check (share_as in ('person', 'anonymous', 'coven')),
  display_name text not null default 'Anonymous' check (char_length(display_name) between 1 and 80),
  source text not null default 'template' check (source in ('template', 'coven_template', 'other')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  kind text not null default 'ritual'
    check (kind in ('ritual', 'spell', 'seasonal', 'esbat', 'devotion', 'cleansing', 'protection', 'healing', 'divination', 'meeting')),
  summary text check (summary is null or char_length(summary) <= 2000),
  tradition text check (tradition is null or char_length(tradition) <= 80),
  deities text[] not null default '{}' check (cardinality(deities) <= 12),
  occasion text check (occasion is null or char_length(occasion) <= 80),
  moon_phase text check (moon_phase is null or moon_phase in ('new', 'waxing', 'full', 'waning', 'dark')),
  duration_minutes integer check (duration_minutes is null or duration_minutes between 0 and 1440),
  difficulty text check (difficulty is null or difficulty in ('beginner', 'intermediate', 'experienced')),
  materials text[] not null default '{}' check (cardinality(materials) <= 60),
  preparation text check (preparation is null or char_length(preparation) <= 6000),
  steps jsonb not null default '[]'::jsonb
    check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 1 and 60 and octet_length(steps::text) <= 150000),
  closing text check (closing is null or char_length(closing) <= 4000),
  notes text check (notes is null or char_length(notes) <= 4000),
  safety_notes text check (safety_notes is null or char_length(safety_notes) <= 2000),
  cultural_note text check (cultural_note is null or char_length(cultural_note) <= 2000),
  tags text[] not null default '{}' check (cardinality(tags) <= 12),
  status text not null default 'pending'
    check (status in ('pending', 'needs_revision', 'published', 'rejected', 'withdrawn', 'superseded')),
  reviewer_note text check (reviewer_note is null or char_length(reviewer_note) <= 2000),
  reviewed_at timestamptz,
  -- Who reviewed it; no link to auth.users, so nothing new can be embedded through it.
  reviewed_by uuid,
  replaces_id uuid references public.community_rituals (id) on delete set null,
  version integer not null default 1 check (version >= 1),
  save_count integer not null default 0 check (save_count >= 0),
  submitted_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_rituals_status_idx on public.community_rituals (status, published_at desc);
create index if not exists community_rituals_user_idx on public.community_rituals (user_id, created_at desc);
create index if not exists community_rituals_coven_idx on public.community_rituals (coven_id) where coven_id is not null;
create index if not exists community_rituals_replaces_idx on public.community_rituals (replaces_id) where replaces_id is not null;

create table if not exists public.community_ritual_saves (
  ritual_id uuid not null references public.community_rituals (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  saved_to text not null default 'mine' check (saved_to in ('mine', 'coven')),
  created_at timestamptz not null default now(),
  primary key (ritual_id, user_id)
);

alter table public.community_rituals enable row level security;
alter table public.community_ritual_saves enable row level security;

drop policy if exists "Sharers, coven ritual leaders and moderators read shared rituals" on public.community_rituals;
create policy "Sharers, coven ritual leaders and moderators read shared rituals" on public.community_rituals
  for select to authenticated
  using (
    user_id = auth.uid()
    or (coven_id is not null and public.coven_permission(coven_id, 'lead'))
    or public.is_community_moderator()
  );

drop policy if exists "People read their own saves" on public.community_ritual_saves;
create policy "People read their own saves" on public.community_ritual_saves
  for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.community_rituals from anon, authenticated;
revoke insert, update, delete on public.community_ritual_saves from anon, authenticated;
grant select on public.community_rituals to authenticated;
grant select on public.community_ritual_saves to authenticated;

-- ---------------------------------------------------------------------------
-- What everyone reads
-- ---------------------------------------------------------------------------

-- Runs as its owner (so it can read published rows past the table's RLS) and
-- shows only what's safe: no user id for an anonymous ritual or a coven's,
-- no coven id unless the coven is credited, nothing a moderator wrote.
create or replace view public.community_rituals_published as
select
  r.id,
  case when r.share_as = 'person' then r.user_id end as sharer_id,
  case when r.share_as = 'coven' then r.coven_id end as coven_id,
  r.share_as,
  r.display_name,
  r.title,
  r.kind,
  r.summary,
  r.tradition,
  r.deities,
  r.occasion,
  r.moon_phase,
  r.duration_minutes,
  r.difficulty,
  r.materials,
  r.preparation,
  r.steps,
  r.closing,
  r.notes,
  r.safety_notes,
  r.cultural_note,
  r.tags,
  r.version,
  r.save_count,
  r.published_at,
  r.created_at,
  r.updated_at
from public.community_rituals r
where r.status = 'published'
  and not exists (
    select 1 from public.user_blocks b
    where b.blocker_id = auth.uid() and b.blocked_id = r.user_id
  );

grant select on public.community_rituals_published to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Sharing, changing, withdrawing
-- ---------------------------------------------------------------------------

-- A text list from jsonb, trimmed, blanks dropped, each cut to a length.
create or replace function public.community_ritual_texts(p jsonb, p_max integer, p_len integer)
returns text[]
language sql
immutable
set search_path = public
as $$
  select coalesce(array_agg(v order by n), '{}')
  from (
    select left(btrim(e), p_len) as v, n
    from jsonb_array_elements_text(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) with ordinality as t(e, n)
    where btrim(e) <> ''
    limit p_max
  ) s;
$$;

-- Steps kept as {title, instructions, spoken_text, minutes}, nothing more.
create or replace function public.community_ritual_steps(p jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  s jsonb;
  out jsonb := '[]'::jsonb;
  minutes numeric;
begin
  if p is null or jsonb_typeof(p) <> 'array' then raise exception 'Add at least one step.'; end if;
  if jsonb_array_length(p) > 60 then raise exception 'A shared ritual can have up to 60 steps.'; end if;
  for s in select value from jsonb_array_elements(p) loop
    if jsonb_typeof(s) <> 'object' or coalesce(btrim(s->>'title'), '') = '' then raise exception 'Each step needs a title.'; end if;
    minutes := case when jsonb_typeof(s->'minutes') = 'number' then (s->>'minutes')::numeric end;
    out := out || jsonb_build_array(jsonb_build_object(
      'title', left(btrim(s->>'title'), 120),
      'instructions', left(coalesce(s->>'instructions', ''), 4000),
      'spoken_text', left(coalesce(s->>'spoken_text', ''), 4000),
      'minutes', case when minutes > 0 then least(minutes, 600) end
    ));
  end loop;
  if jsonb_array_length(out) = 0 then raise exception 'Add at least one step.'; end if;
  return out;
end;
$$;

-- May the caller share (or change) a ritual for this coven? Its head, or
-- those who lead its rituals while in good standing.
create or replace function public.community_ritual_coven_can_share(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_coven is not null and auth.uid() is not null and (
    public.coven_is_head(p_coven)
    or (public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'lead'))
  );
$$;

-- Offer a ritual (p_id null), change one that's waiting or returned (p_id),
-- or send an update to a published one as a new version (p_replaces).
-- Returns the row's id. It waits for review either way.
create or replace function public.share_community_ritual(
  p_id uuid,
  p_ritual jsonb,
  p_share_as text,
  p_display_name text,
  p_coven uuid default null,
  p_replaces uuid default null,
  p_source text default 'template'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  r jsonb := coalesce(p_ritual, '{}'::jsonb);
  existing public.community_rituals;
  previous public.community_rituals;
  coven_name text;
  name text;
  saved uuid;
  v_kind text := coalesce(nullif(btrim(r->>'kind'), ''), 'ritual');
  v_moon text := nullif(btrim(r->>'moon_phase'), '');
  v_difficulty text := nullif(btrim(r->>'difficulty'), '');
  v_minutes integer;
begin
  if me is null then raise exception 'Sign in to share a ritual.'; end if;
  if public.is_community_banned() then raise exception 'This account can''t share with the community.'; end if;
  if jsonb_typeof(r) <> 'object' or octet_length(r::text) > 200000 then raise exception 'That ritual is too long to share.'; end if;
  if coalesce(btrim(r->>'title'), '') = '' then raise exception 'Give the ritual a title.'; end if;
  if p_share_as not in ('person', 'anonymous', 'coven') then raise exception 'Choose how to be credited.'; end if;
  if p_share_as = 'coven' and p_coven is null then raise exception 'Choose the coven to credit.'; end if;
  if p_source not in ('template', 'coven_template', 'other') then p_source := 'other'; end if;
  if v_kind not in ('ritual', 'spell', 'seasonal', 'esbat', 'devotion', 'cleansing', 'protection', 'healing', 'divination', 'meeting') then v_kind := 'ritual'; end if;
  if v_moon not in ('new', 'waxing', 'full', 'waning', 'dark') then v_moon := null; end if;
  if v_difficulty not in ('beginner', 'intermediate', 'experienced') then v_difficulty := null; end if;
  v_minutes := case when jsonb_typeof(r->'duration_minutes') = 'number' then least(greatest(round((r->>'duration_minutes')::numeric)::integer, 0), 1440) end;

  -- A coven's ritual, whoever is credited, is shared only by those allowed.
  if p_coven is not null then
    if not public.community_ritual_coven_can_share(p_coven) then
      raise exception 'Only the coven''s head and those who lead its rituals can share its rituals.';
    end if;
    select c.name into coven_name from public.covens c where c.id = p_coven;
    if coven_name is null then raise exception 'That coven was not found.'; end if;
  end if;

  name := case p_share_as
    when 'coven' then left(coven_name, 80)
    when 'anonymous' then 'Anonymous'
    else coalesce(nullif(left(btrim(coalesce(p_display_name, '')), 60), ''), 'Community member')
  end;

  if p_id is not null then
    select * into existing from public.community_rituals where id = p_id;
    if existing.id is null or existing.user_id <> me then raise exception 'That shared ritual was not found.'; end if;
    if existing.status not in ('pending', 'needs_revision') then
      raise exception 'Only a ritual waiting for review or returned for changes can be changed. Send an update instead.';
    end if;
    if existing.coven_id is distinct from p_coven and existing.coven_id is not null and not public.community_ritual_coven_can_share(existing.coven_id) then
      raise exception 'Only the coven''s head and those who lead its rituals can change its shared rituals.';
    end if;
  end if;

  if p_replaces is not null and p_id is null then
    select * into previous from public.community_rituals where id = p_replaces;
    if previous.id is null or previous.status <> 'published'
       or not (previous.user_id = me or (previous.coven_id is not null and public.community_ritual_coven_can_share(previous.coven_id))) then
      raise exception 'Only the one who shared a published ritual (or its coven''s ritual leaders) can send an update.';
    end if;
    if exists (select 1 from public.community_rituals where replaces_id = p_replaces and status in ('pending', 'needs_revision')) then
      raise exception 'An update to this ritual is already waiting for review. Change that one instead.';
    end if;
  end if;

  if p_id is null and (select count(*) from public.community_rituals where user_id = me and status = 'pending') >= 20 then
    raise exception 'You have 20 rituals waiting for review. Please wait for some to be reviewed first.';
  end if;

  if p_id is null then
    insert into public.community_rituals (
      user_id, coven_id, share_as, display_name, source, title, kind, summary, tradition, deities, occasion,
      moon_phase, duration_minutes, difficulty, materials, preparation, steps, closing, notes, safety_notes,
      cultural_note, tags, status, replaces_id, version
    ) values (
      me, p_coven, p_share_as, name, p_source, left(btrim(r->>'title'), 120), v_kind,
      nullif(left(btrim(coalesce(r->>'summary', '')), 2000), ''),
      nullif(left(btrim(coalesce(r->>'tradition', '')), 80), ''),
      public.community_ritual_texts(r->'deities', 12, 80),
      nullif(left(btrim(coalesce(r->>'occasion', '')), 80), ''),
      v_moon, v_minutes, v_difficulty,
      public.community_ritual_texts(r->'materials', 60, 120),
      nullif(left(btrim(coalesce(r->>'preparation', '')), 6000), ''),
      public.community_ritual_steps(r->'steps'),
      nullif(left(btrim(coalesce(r->>'closing', '')), 4000), ''),
      nullif(left(btrim(coalesce(r->>'notes', '')), 4000), ''),
      nullif(left(btrim(coalesce(r->>'safety_notes', '')), 2000), ''),
      nullif(left(btrim(coalesce(r->>'cultural_note', '')), 2000), ''),
      public.community_ritual_texts(r->'tags', 12, 40),
      'pending', p_replaces, coalesce(previous.version, 0) + 1
    )
    returning id into saved;
  else
    update public.community_rituals set
      coven_id = p_coven, share_as = p_share_as, display_name = name, title = left(btrim(r->>'title'), 120), kind = v_kind,
      summary = nullif(left(btrim(coalesce(r->>'summary', '')), 2000), ''),
      tradition = nullif(left(btrim(coalesce(r->>'tradition', '')), 80), ''),
      deities = public.community_ritual_texts(r->'deities', 12, 80),
      occasion = nullif(left(btrim(coalesce(r->>'occasion', '')), 80), ''),
      moon_phase = v_moon, duration_minutes = v_minutes, difficulty = v_difficulty,
      materials = public.community_ritual_texts(r->'materials', 60, 120),
      preparation = nullif(left(btrim(coalesce(r->>'preparation', '')), 6000), ''),
      steps = public.community_ritual_steps(r->'steps'),
      closing = nullif(left(btrim(coalesce(r->>'closing', '')), 4000), ''),
      notes = nullif(left(btrim(coalesce(r->>'notes', '')), 4000), ''),
      safety_notes = nullif(left(btrim(coalesce(r->>'safety_notes', '')), 2000), ''),
      cultural_note = nullif(left(btrim(coalesce(r->>'cultural_note', '')), 2000), ''),
      tags = public.community_ritual_texts(r->'tags', 12, 40),
      status = 'pending', submitted_at = now(), updated_at = now()
    where id = p_id
    returning id into saved;
  end if;
  return saved;
end;
$$;

-- Take a shared ritual back: the sharer, or the coven's head for a coven's.
create or replace function public.withdraw_community_ritual(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  row_ public.community_rituals;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into row_ from public.community_rituals where id = p_id;
  if row_.id is null or not (row_.user_id = auth.uid() or (row_.coven_id is not null and public.coven_is_head(row_.coven_id))) then
    raise exception 'That shared ritual was not found.';
  end if;
  if row_.status not in ('pending', 'needs_revision', 'published') then return false; end if;
  update public.community_rituals set status = 'withdrawn', updated_at = now() where id = p_id;
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Review (site moderators)
-- ---------------------------------------------------------------------------

-- p_action: 'publish', 'return' (for changes; a note is needed) or 'decline'
-- (also takes a published ritual down). The note is the sharer's to read.
create or replace function public.review_community_ritual(p_id uuid, p_action text, p_note text default null)
returns public.community_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  row_ public.community_rituals;
  note text := nullif(left(btrim(coalesce(p_note, '')), 2000), '');
  carried integer := 0;
begin
  if not public.is_community_moderator() then raise exception 'Only moderators review shared rituals.'; end if;
  select * into row_ from public.community_rituals where id = p_id for update;
  if row_.id is null then raise exception 'That shared ritual was not found.'; end if;
  if p_action = 'publish' then
    if row_.status not in ('pending', 'needs_revision', 'rejected') then raise exception 'Only a ritual waiting for review can be published.'; end if;
    if row_.replaces_id is not null then
      update public.community_rituals set status = 'superseded', updated_at = now()
      where id = row_.replaces_id and status = 'published'
      returning save_count into carried;
    end if;
    update public.community_rituals set
      status = 'published', published_at = now(), reviewer_note = note, reviewed_at = now(), reviewed_by = auth.uid(),
      save_count = save_count + coalesce(carried, 0), updated_at = now()
    where id = p_id returning * into row_;
  elsif p_action = 'return' then
    if note is null then raise exception 'Say what needs changing, for the sharer.'; end if;
    if row_.status not in ('pending', 'needs_revision') then raise exception 'Only a ritual waiting for review can be returned.'; end if;
    update public.community_rituals set status = 'needs_revision', reviewer_note = note, reviewed_at = now(), reviewed_by = auth.uid(), updated_at = now()
    where id = p_id returning * into row_;
  elsif p_action = 'decline' then
    if row_.status not in ('pending', 'needs_revision', 'published') then raise exception 'That ritual is not waiting or published.'; end if;
    update public.community_rituals set status = 'rejected', reviewer_note = note, reviewed_at = now(), reviewed_by = auth.uid(), updated_at = now()
    where id = p_id returning * into row_;
  else
    raise exception 'Unknown review.';
  end if;
  return row_;
end;
$$;

-- ---------------------------------------------------------------------------
-- Saves
-- ---------------------------------------------------------------------------

-- Count a save (to your rituals, or a coven's) once per person. Returns the count.
create or replace function public.note_community_ritual_saved(p_id uuid, p_to text default 'mine')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  added integer;
  total integer;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if not exists (select 1 from public.community_rituals where id = p_id and status = 'published') then
    raise exception 'That ritual is not published.';
  end if;
  insert into public.community_ritual_saves (ritual_id, user_id, saved_to)
  values (p_id, auth.uid(), case when p_to = 'coven' then 'coven' else 'mine' end)
  on conflict (ritual_id, user_id) do nothing;
  get diagnostics added = row_count;
  if added > 0 then
    update public.community_rituals set save_count = save_count + 1 where id = p_id returning save_count into total;
  else
    select save_count into total from public.community_rituals where id = p_id;
  end if;
  return total;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function
  public.community_ritual_texts(jsonb, integer, integer),
  public.community_ritual_steps(jsonb)
from public, anon, authenticated;
revoke execute on function
  public.community_ritual_coven_can_share(uuid),
  public.share_community_ritual(uuid, jsonb, text, text, uuid, uuid, text),
  public.withdraw_community_ritual(uuid),
  public.review_community_ritual(uuid, text, text),
  public.note_community_ritual_saved(uuid, text)
from public, anon;
grant execute on function
  public.community_ritual_coven_can_share(uuid),
  public.share_community_ritual(uuid, jsonb, text, text, uuid, uuid, text),
  public.withdraw_community_ritual(uuid),
  public.review_community_ritual(uuid, text, text),
  public.note_community_ritual_saved(uuid, text)
to authenticated;

notify pgrst, 'reload schema';
