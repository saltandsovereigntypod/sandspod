-- NOT YET APPLIED. Needs 20261102000000_coven_member_record.sql first
-- (coven_ritual_settings.record_viewers, coven_sees_record).
--
-- Paths in the coven: what share of a coven practises each way, keeps each
-- tradition and honours each deity, and never who. Read from each member's
-- own settings (user_settings.settings): How you practise (`my_practice`),
-- My path (`library_path_mode`, `library_path`, else the calendars in
-- `calendar_traditions`, less any hidden in `calendar_hidden_traditions`)
-- and My deities (`my_deities`, JSON with each deity's level: patron,
-- dedicated or exploring). The app and the website read the answer through
-- lib/covens/paths.ts, which keeps these same rules (and its tests hold them
-- to it).
--
-- * Only counts. No user ids, no names of members, ever.
-- * Only active members, and only those who haven't turned off "Count me in
--   my covens' paths overview" (the `coven_paths_count_me` setting, on
--   unless set to false).
-- * Until 5 members have shared anything, the answer is "not enough yet".
-- * A section fewer than 3 have shared shows nothing. Anything fewer than 3
--   share goes under "Other (fewer than 3)", counted as the members with at
--   least one such answer, so nobody can be singled out.
-- * Percentages are of the members who shared that section, rounded.
-- * Who sees it: the coven's head always (and the site's moderators), those
--   the head lets see the members' record (coven_sees_record), and every
--   member when the head switches on coven_ritual_settings.paths_visible_to_all
--   (set_coven_paths_visible, the head only).

alter table public.coven_ritual_settings add column if not exists paths_visible_to_all boolean not null default false;

-- ---------------------------------------------------------------------------
-- Reading a member's settings (as the app's lib/library/traditions.ts,
-- lib/rituals/premade/practices.ts and lib/patron/mine.ts read them)
-- ---------------------------------------------------------------------------

-- A setting that is a string, else null.
create or replace function public.coven_paths_text(p_settings jsonb, p_key text)
returns text
language sql
immutable
set search_path = public
as $$
  select case when jsonb_typeof(p_settings -> p_key) = 'string' then p_settings ->> p_key end;
$$;

-- A comma list as trimmed ids.
create or replace function public.coven_paths_csv(p_text text)
returns text[]
language sql
immutable
set search_path = public
as $$
  select coalesce(array_agg(x) filter (where x <> ''), '{}'::text[])
  from (select btrim(unnest(string_to_array(coalesce(p_text, ''), ','))) as x) s;
$$;

-- JSON kept as text in a setting; bad JSON reads as nothing.
create or replace function public.coven_paths_json(p_text text)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
begin
  if p_text is null or btrim(p_text) = '' then
    return null;
  end if;
  return p_text::jsonb;
exception when others then
  return null;
end;
$$;

-- How you practise: the practices chosen, from the app's list.
create or replace function public.coven_paths_practices(p_settings jsonb)
returns text[]
language sql
immutable
set search_path = public
as $$
  select coalesce(array_agg(id order by id), '{}'::text[])
  from unnest(array['eclectic', 'green', 'kitchen', 'hedge', 'solitary', 'cosmic', 'crystal', 'elemental', 'sea', 'folk']) as id
  where id = any (public.coven_paths_csv(public.coven_paths_text(p_settings, 'my_practice')));
$$;

-- My path: chosen by hand, else following the calendars (Wheel south counts
-- as the Wheel, the Hellenic months as Hellenic), never a hidden one, and
-- only traditions someone can put on their path.
create or replace function public.coven_paths_traditions(p_settings jsonb)
returns text[]
language sql
immutable
set search_path = public
as $$
  with path_mode as (
    select coalesce(public.coven_paths_text(p_settings, 'library_path_mode'), '') as m
  ),
  hidden as (
    select array(select x from unnest(public.coven_paths_csv(public.coven_paths_text(p_settings, 'calendar_hidden_traditions'))) as x where x = 'christian') as ids
  ),
  calendars as (
    select array(
      select case x when 'wheel_south' then 'wheel' when 'hellenic_monthly' then 'hellenic' else x end
      from unnest(case when public.coven_paths_text(p_settings, 'calendar_traditions') is null then array['wheel']
                       else public.coven_paths_csv(public.coven_paths_text(p_settings, 'calendar_traditions')) end) as x
      where x = any (array['wheel', 'wheel_south', 'celtic', 'norse', 'hellenic', 'hellenic_monthly', 'roman', 'slavic', 'christian'])
    ) as ids
  ),
  chosen as (
    select case (select m from path_mode)
      when 'off' then '{}'::text[]
      when 'custom' then public.coven_paths_csv(public.coven_paths_text(p_settings, 'library_path'))
      else (select ids from calendars)
    end as ids
  )
  select coalesce(array_agg(id order by id), '{}'::text[])
  from unnest(array['wicca', 'celtic', 'norse', 'hellenic', 'roman', 'slavic', 'christian', 'egyptian', 'hindu', 'mesopotamian',
                    'canaanite', 'baltic', 'finnish', 'anglo-saxon', 'etruscan', 'basque', 'shinto', 'chinese']) as id
  where id = any (coalesce((select ids from chosen), '{}'::text[])) and not (id = any (coalesce((select ids from hidden), '{}'::text[])));
$$;

-- My deities: each once, keyed by its Living Library key or its own name
-- (lower-cased), at the closest level given it.
create or replace function public.coven_paths_deities(p_settings jsonb)
returns table (key text, name text, level text)
language sql
immutable
set search_path = public
as $$
  with raw as (
    select public.coven_paths_json(public.coven_paths_text(p_settings, 'my_deities')) as list
  ),
  rows as (
    select
      case when jsonb_typeof(d -> 'key') = 'string' and d ->> 'key' <> '' then d ->> 'key' else 'own:' || lower(btrim(d ->> 'name')) end as key,
      btrim(d ->> 'name') as name,
      case when d ->> 'level' in ('patron', 'dedicated') then d ->> 'level' else 'exploring' end as level
    from raw, jsonb_array_elements(case when jsonb_typeof(raw.list) = 'array' then raw.list else '[]'::jsonb end) as d
    where jsonb_typeof(d) = 'object' and jsonb_typeof(d -> 'name') = 'string' and btrim(d ->> 'name') <> ''
  )
  select key, min(name),
    case when bool_or(level = 'patron') then 'patron' when bool_or(level = 'dedicated') then 'dedicated' else 'exploring' end
  from rows
  group by key;
$$;

-- One section from who shared what ([{user_id, key, name}]): the answers at
-- least 3 share, the members with any rarer one as Other, and percentages of
-- the p_shared members who shared the section. Nothing when fewer than 3 did.
create or replace function public.coven_paths_section(p_rows jsonb, p_shared integer)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with r as (
    select distinct x ->> 'user_id' as u, x ->> 'key' as k, x ->> 'name' as nm
    from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) as x
  ),
  tallies as (
    select k, mode() within group (order by nm) as nm, count(distinct u)::int as c from r group by k
  ),
  rare as (
    select count(distinct r.u)::int as c from r join tallies t on t.k = r.k where t.c < 3
  )
  select case when coalesce(p_shared, 0) < 3 then
    jsonb_build_object('shared', coalesce(p_shared, 0), 'items', '[]'::jsonb, 'other', jsonb_build_object('count', 0, 'pct', 0))
  else jsonb_build_object(
    'shared', p_shared,
    'items', coalesce((select jsonb_agg(jsonb_build_object('key', t.k, 'name', t.nm, 'count', t.c, 'pct', round(t.c * 100.0 / p_shared)::int) order by t.c desc, lower(t.nm), t.k)
      from tallies t where t.c >= 3), '[]'::jsonb),
    'other', jsonb_build_object('count', (select c from rare), 'pct', round((select c from rare) * 100.0 / p_shared)::int)
  ) end;
$$;

-- ---------------------------------------------------------------------------
-- Who sees it
-- ---------------------------------------------------------------------------

create or replace function public.coven_sees_paths(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_sees_record(p_coven)
    or (public.is_coven_member(p_coven)
        and coalesce((select st.paths_visible_to_all from public.coven_ritual_settings st where st.coven_id = p_coven), false));
$$;

-- The coven's head chooses whether every member sees it.
create or replace function public.set_coven_paths_visible(p_coven uuid, p_visible boolean)
returns public.coven_ritual_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_ritual_settings;
begin
  if not (exists (select 1 from public.covens where id = p_coven and founder_id = auth.uid()) and public.coven_in_good_standing(p_coven))
     and not public.is_community_moderator() then
    raise exception 'Only the coven''s head chooses who sees the paths in the coven.';
  end if;
  insert into public.coven_ritual_settings (coven_id, paths_visible_to_all, updated_by, updated_at)
  values (p_coven, coalesce(p_visible, false), auth.uid(), now())
  on conflict (coven_id) do update
    set paths_visible_to_all = coalesce(p_visible, false),
        updated_by = auth.uid(), updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- ---------------------------------------------------------------------------
-- The overview
-- ---------------------------------------------------------------------------

create or replace function public.coven_paths_overview(p_coven uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  member_count integer;
  people jsonb;
  shared integer;
  practices jsonb;
  paths jsonb;
  deities jsonb;
  practice_people integer;
  path_people integer;
  deity_people integer;
begin
  if not public.coven_sees_paths(p_coven) then
    raise exception 'Only the coven''s head, and those they choose, see the paths in the coven.';
  end if;

  select count(*)::int into member_count from public.coven_members where coven_id = p_coven and status = 'active';

  -- Everyone counted: active, with settings saved, and not leaving themselves out.
  select coalesce(jsonb_agg(jsonb_build_object('user_id', m.user_id, 's', us.settings::jsonb)), '[]'::jsonb)
  into people
  from public.coven_members m
  join public.user_settings us on us.user_id = m.user_id
  where m.coven_id = p_coven and m.status = 'active'
    and jsonb_typeof(us.settings::jsonb) = 'object'
    and coalesce(us.settings::jsonb -> 'coven_paths_count_me', 'true'::jsonb) not in ('false'::jsonb, '"false"'::jsonb);

  select coalesce(jsonb_agg(jsonb_build_object('user_id', c ->> 'user_id', 'key', p, 'name', null)), '[]'::jsonb)
  into practices
  from jsonb_array_elements(people) as c, unnest(public.coven_paths_practices(c -> 's')) as p;

  select coalesce(jsonb_agg(jsonb_build_object('user_id', c ->> 'user_id', 'key', t, 'name', null)), '[]'::jsonb)
  into paths
  from jsonb_array_elements(people) as c, unnest(public.coven_paths_traditions(c -> 's')) as t;

  select coalesce(jsonb_agg(jsonb_build_object('user_id', c ->> 'user_id', 'key', d.key, 'name', d.name, 'level', d.level)), '[]'::jsonb)
  into deities
  from jsonb_array_elements(people) as c, public.coven_paths_deities(c -> 's') as d;

  select count(distinct x ->> 'user_id')::int into practice_people from jsonb_array_elements(practices) as x;
  select count(distinct x ->> 'user_id')::int into path_people from jsonb_array_elements(paths) as x;
  select count(distinct x ->> 'user_id')::int into deity_people from jsonb_array_elements(deities) as x;
  select count(distinct u)::int into shared from (
    select x ->> 'user_id' as u from jsonb_array_elements(practices) as x
    union select x ->> 'user_id' from jsonb_array_elements(paths) as x
    union select x ->> 'user_id' from jsonb_array_elements(deities) as x
  ) everyone;

  if shared < 5 then
    return jsonb_build_object('enough', false, 'members', member_count, 'shared', shared);
  end if;

  return jsonb_build_object(
    'enough', true,
    'members', member_count,
    'shared', shared,
    'practices', public.coven_paths_section(practices, practice_people),
    'paths', public.coven_paths_section(paths, path_people),
    'patrons', public.coven_paths_section(coalesce((select jsonb_agg(x) from jsonb_array_elements(deities) as x where x ->> 'level' = 'patron'), '[]'::jsonb), deity_people),
    'dedicated', public.coven_paths_section(coalesce((select jsonb_agg(x) from jsonb_array_elements(deities) as x where x ->> 'level' = 'dedicated'), '[]'::jsonb), deity_people),
    'deities', public.coven_paths_section(deities, deity_people)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function
  public.coven_paths_text(jsonb, text),
  public.coven_paths_csv(text),
  public.coven_paths_json(text),
  public.coven_paths_practices(jsonb),
  public.coven_paths_traditions(jsonb),
  public.coven_paths_deities(jsonb),
  public.coven_paths_section(jsonb, integer)
from public, anon, authenticated;
revoke execute on function
  public.coven_sees_paths(uuid),
  public.set_coven_paths_visible(uuid, boolean),
  public.coven_paths_overview(uuid)
from public, anon;
grant execute on function
  public.coven_sees_paths(uuid),
  public.set_coven_paths_visible(uuid, boolean),
  public.coven_paths_overview(uuid)
to authenticated;
