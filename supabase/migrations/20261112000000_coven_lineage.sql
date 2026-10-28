-- NOT YET APPLIED. Daughter covens (hiving), the mother coven's authority
-- over its daughters, carrying material across, and three leadership fixes.
-- Needs every coven migration before it (through 20261111000100_coven_test_keys_and_waiting_lists.sql:
-- open positions' seats and requirements are kept when positions are copied,
-- handed on or changed here).
-- Additive and safe to run again (paste it whole).
--
-- * Lineage: covens.mother_coven_id and hived_at link a daughter coven to the
--   coven it hived from. Only the functions below set them. Every change to a
--   link is kept in coven_lineage_events.
-- * Authority: the head of a mother coven, and the head of every coven above
--   it in a chain (a granddaughter's grandmother), has full head powers in the
--   daughter, always: one helper, coven_is_ancestor_head, folded into
--   is_coven_member, coven_permission, coven_level and
--   coven_in_good_standing, and coven_is_head for the head-only settings
--   (record, paths, participation, meetings, the Book). Mother heads need not
--   be members of the daughter. They see what the daughter's own head sees,
--   no more: members' private things stay private from them too.
--   What they change in the daughter (positions, members, pages,
--   applications, advancement, programs, rites, the Book, templates, the
--   coven's details, the succession plan) is kept in the daughter's log as an
--   'override', and the daughter's head is told (coven-notify).
--   NOTE for anyone redefining coven_permission, is_coven_member,
--   coven_level or coven_in_good_standing later: keep the ancestor clause.
-- * Founding a daughter: those whose position has can_found_daughter (on for
--   the leading position and Elder) or whom the head names
--   (coven_daughter_founders) ask; the mother's head approves, choosing the
--   daughter's High Priestess (usually whoever asked). create_coven's rules
--   apply to that head: a community profile, five covens founded at most, a
--   free address. The daughter's member agreement says whose final say it is
--   under. Whoever asked chooses what becomes of their place in the mother:
--   stay as they are, become a visitor (no position or powers there), or leave.
-- * Releasing: only a mother head (or a site moderator, for safeguarding)
--   ends the link. The daughter's head may ask (coven_release_requests).
-- * Carrying material across: at founding, and later, the mother coven's
--   pages (creed, rules, requirements, agreements, which arrive as drafts),
--   positions and their powers, programs (stages and tasks), Book sections
--   and pages marked shared, ritual templates and saved blocks, and the
--   practice calendar. Nothing personal: no members, signatures, records,
--   messages, attendance, progress, altars, or anyone named in access lists
--   or ritual plans. Copies are the daughter's own (coven_copied_items says
--   where each came from). A daughter copies what its mother shares
--   (coven_shared_with_daughters) when it likes, as a new copy; the mother's
--   head may push an update over a daughter's copy after seeing what changes.
--   coven_copy_course_extras carries the training-courses tables with a
--   program (its lessons and tests, never anyone's reads, attempts or scores);
--   a copied position's requirements are matched to the daughter's copies.
-- * Leadership: handing on moves the old head out of the leading power (to
--   Elder, or their position without it, or a position they choose), so two
--   people never both lead. A succession plan (a successor and a second),
--   "the head can't be reached" reports to site moderators, and what happens
--   to covens someone leads when they delete their account
--   (coven_hand_on_departing, called by the delete-account function).
-- * Phone notes: coven-notify { lineage_coven_id } and { leadership_coven_id }
--   send the caller's fresh lines in that coven's logs (each claimed once by
--   notified_at); delete-account sends { leadership_event_ids } with the
--   service key.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

alter table public.covens add column if not exists mother_coven_id uuid references public.covens (id) on delete set null;
alter table public.covens add column if not exists hived_at timestamptz;
create index if not exists covens_mother_idx on public.covens (mother_coven_id) where mother_coven_id is not null;

-- Someone who founded a daughter and chose to stay on as a visitor here.
alter table public.coven_members add column if not exists visiting_from uuid references public.covens (id) on delete set null;

-- Who may ask to found a daughter coven: on for the leading position and Elder.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'coven_ranks' and column_name = 'can_found_daughter'
  ) then
    alter table public.coven_ranks add column can_found_daughter boolean not null default false;
    update public.coven_ranks set can_found_daughter = true where can_manage or lower(btrim(name)) = 'elder';
  end if;
end;
$$;

-- New covens' leading position and Elder start with it on (create_coven makes
-- them; positions added on the Positions screen choose for themselves).
create or replace function public.coven_rank_found_default()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.coven_client_write() and coalesce(current_setting('coven.copying', true), '') <> 'on'
     and (new.can_manage or lower(btrim(new.name)) = 'elder') then
    new.can_found_daughter := true;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_ranks_found_default on public.coven_ranks;
create trigger coven_ranks_found_default before insert on public.coven_ranks
  for each row execute function public.coven_rank_found_default();

-- The browser never changes a coven's lineage.
create or replace function public.guard_coven_lineage()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.coven_client_write() then
    new.mother_coven_id := old.mother_coven_id;
    new.hived_at := old.hived_at;
  end if;
  return new;
end;
$$;

drop trigger if exists covens_guard_lineage on public.covens;
create trigger covens_guard_lineage before update on public.covens
  for each row execute function public.guard_coven_lineage();

-- ---------------------------------------------------------------------------
-- The one helper: is this person the head of a coven above this one?
-- ---------------------------------------------------------------------------

-- Every coven above this one, nearest first (a chain of twelve at most).
create or replace function public.coven_ancestors(target uuid)
returns table (coven_id uuid, depth integer)
language sql
stable
security definer
set search_path = public
as $$
  with recursive up(id, depth) as (
    select c.mother_coven_id, 1 from public.covens c where c.id = target and c.mother_coven_id is not null
    union all
    select c.mother_coven_id, up.depth + 1
    from up join public.covens c on c.id = up.id
    where c.mother_coven_id is not null and up.depth < 12
  )
  select id, depth from up where id is not null and id <> target;
$$;

-- The head of an active coven above this one (mother, grandmother…), not banned.
create or replace function public.coven_is_ancestor_head(target uuid, person uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select person is not null
    and exists (
      select 1 from public.coven_ancestors(target) a
      join public.covens c on c.id = a.coven_id
      where c.founder_id = person and c.status = 'active'
    )
    and not exists (select 1 from public.community_bans where user_id = person);
$$;

-- The coven's own head, or the head of a coven above it.
create or replace function public.coven_is_head(target uuid, person uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select person is not null
    and (exists (select 1 from public.covens where id = target and founder_id = person)
         or public.coven_is_ancestor_head(target, person));
$$;

grant execute on function public.coven_ancestors(uuid), public.coven_is_ancestor_head(uuid, uuid), public.coven_is_head(uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- The coven's checks, now with the ancestor clause
-- ---------------------------------------------------------------------------

create or replace function public.is_coven_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coven_members
    where coven_id = target and user_id = auth.uid() and status = 'active'
  )
  or public.coven_is_ancestor_head(target);
$$;

create or replace function public.coven_permission(target uuid, permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    -- A mother (or grandmother) coven's head holds every power here.
    public.coven_is_ancestor_head(target)
    and exists (select 1 from public.covens c where c.id = target and c.status = 'active')
  ) or exists (
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

-- How senior someone is: a mother coven's head (1001) outranks the coven's own head (1000).
create or replace function public.coven_level(target uuid, person uuid default auth.uid())
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.coven_is_ancestor_head(target, person) then 1001
    when c.founder_id = person then 1000
    else coalesce((
      select r.level from public.coven_members m
      left join public.coven_ranks r on r.id = m.rank_id
      where m.coven_id = target and m.user_id = person and m.status = 'active'
    ), 0)
  end
  from public.covens c where c.id = target;
$$;

-- A mother coven's head is in good standing in its daughters (they sign no agreements there).
create or replace function public.coven_in_good_standing(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    public.coven_is_ancestor_head(target)
    and exists (select 1 from public.covens c where c.id = target and c.status = 'active')
  ) or (
    public.coven_permission(target, 'member')
    and not public.is_community_banned()
    and public.coven_unsigned_agreements(target) = 0
    and not exists (
      select 1 from public.coven_members
      where coven_id = target and user_id = auth.uid() and muted_until > now()
    )
  );
$$;

-- Change a member's rank, mute them, or remove or ban them. A mother coven's
-- head may act on the daughter's own head too.
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
  above boolean := public.coven_is_ancestor_head(p_coven);
  updated public.coven_members;
begin
  select * into target from public.coven_members where coven_id = p_coven and user_id = p_user for update;
  if target.coven_id is null then raise exception 'That person is not in this coven.'; end if;
  if p_user = auth.uid() and not site_moderator then raise exception 'You cannot change your own membership here.'; end if;
  if not site_moderator then
    if p_user = (select founder_id from public.covens where id = p_coven) and not above then
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
  if p_status in ('removed', 'banned') and p_user = (select founder_id from public.covens where id = p_coven) then
    raise exception 'Choose who leads the coven before removing its head.';
  end if;

  update public.coven_members
  set rank_id = coalesce(p_rank, rank_id),
      status = coalesce(p_status, status),
      muted_until = case when p_clear_mute then null else coalesce(p_muted_until, muted_until) end,
      visiting_from = case when p_rank is not null then null else visiting_from end
  where coven_id = p_coven and user_id = p_user
  returning * into updated;
  return updated;
end;
$$;

-- ---------------------------------------------------------------------------
-- Head-only settings and views, now for a mother coven's head too
-- (each is the latest version of the function, with "the founder" read as
-- public.coven_is_head)
-- ---------------------------------------------------------------------------

-- coven_altar_keeper (from 20261028000000_coven_altars.sql)
create or replace function public.coven_altar_keeper(p_altar uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coven_altars a
    join public.covens c on c.id = a.coven_id
    where a.id = p_altar
      and auth.uid() is not null
      and public.coven_permission(a.coven_id, 'member')
      and (public.coven_is_head(c.id) or public.coven_permission(a.coven_id, 'keep_altars') or (not a.is_main and a.created_by = auth.uid()))
  ) or public.is_community_moderator();
$$;

-- coven_sees_participation (from 20261101000000_coven_ritual_contributions.sql)
create or replace function public.coven_sees_participation(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_community_moderator()
    or (public.coven_is_head(p_coven) and public.is_coven_member(p_coven))
    or exists (
      select 1 from public.coven_ritual_settings st
      where st.coven_id = p_coven and jsonb_array_length(st.participation_viewers) > 0
        and public.coven_assignees_include(p_coven, st.participation_viewers, auth.uid())
    );
$$;

-- set_coven_participation_viewers (from 20261101000000_coven_ritual_contributions.sql)
create or replace function public.set_coven_participation_viewers(p_coven uuid, p_viewers jsonb)
returns public.coven_ritual_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_ritual_settings;
  viewers jsonb;
begin
  if not ((public.coven_is_head(p_coven)) and public.coven_in_good_standing(p_coven))
     and not public.is_community_moderator() then
    raise exception 'Only the coven''s head chooses who sees participation.';
  end if;
  viewers := public.coven_clean_assignees(p_coven, p_viewers, 'Who sees participation', false);
  insert into public.coven_ritual_settings (coven_id, participation_viewers, updated_by, updated_at)
  values (p_coven, viewers, auth.uid(), now())
  on conflict (coven_id) do update set participation_viewers = excluded.participation_viewers, updated_by = auth.uid(), updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- coven_sees_record (from 20261102000000_coven_member_record.sql)
create or replace function public.coven_sees_record(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_community_moderator()
    or (public.coven_is_head(p_coven) and public.is_coven_member(p_coven))
    or exists (
      select 1 from public.coven_ritual_settings st
      where st.coven_id = p_coven and jsonb_array_length(st.record_viewers) > 0
        and public.coven_permission(p_coven, 'member')
        and public.coven_assignees_include(p_coven, st.record_viewers, auth.uid())
    );
$$;

-- remove_coven_mentor_checkin (from 20261102000000_coven_member_record.sql)
create or replace function public.remove_coven_mentor_checkin(p_checkin uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coven_mentor_checkins;
begin
  select * into c from public.coven_mentor_checkins where id = p_checkin;
  if c.id is null then return false; end if;
  if not (c.mentor_id = auth.uid() or public.is_community_moderator()
          or (public.coven_is_head(c.coven_id))) then
    raise exception 'Only the mentor who logged it can take it back.';
  end if;
  delete from public.coven_mentor_checkins where id = c.id;
  return true;
end;
$$;

-- remove_coven_member_note (from 20261102000000_coven_member_record.sql)
create or replace function public.remove_coven_member_note(p_note uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n public.coven_member_notes;
begin
  select * into n from public.coven_member_notes where id = p_note;
  if n.id is null then return false; end if;
  if not (n.author_id = auth.uid() or public.is_community_moderator()
          or (public.coven_is_head(n.coven_id))) then
    raise exception 'Only whoever wrote a note, or the coven''s head, can remove it.';
  end if;
  delete from public.coven_member_notes where id = n.id;
  return true;
end;
$$;

-- set_coven_record_viewers (from 20261102000000_coven_member_record.sql)
create or replace function public.set_coven_record_viewers(p_coven uuid, p_viewers jsonb, p_mentees_see_checkins boolean default null)
returns public.coven_ritual_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_ritual_settings;
  viewers jsonb;
begin
  if not ((public.coven_is_head(p_coven)) and public.coven_in_good_standing(p_coven))
     and not public.is_community_moderator() then
    raise exception 'Only the coven''s head chooses who sees the members'' record.';
  end if;
  viewers := public.coven_clean_assignees(p_coven, coalesce(p_viewers, '[]'::jsonb), 'Who sees the record', false);
  insert into public.coven_ritual_settings (coven_id, record_viewers, mentees_see_checkins, updated_by, updated_at)
  values (p_coven, viewers, coalesce(p_mentees_see_checkins, false), auth.uid(), now())
  on conflict (coven_id) do update
    set record_viewers = excluded.record_viewers,
        mentees_see_checkins = coalesce(p_mentees_see_checkins, coven_ritual_settings.mentees_see_checkins),
        updated_by = auth.uid(), updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

-- set_coven_paths_visible (from 20261105000000_coven_paths_overview.sql)
create or replace function public.set_coven_paths_visible(p_coven uuid, p_visible boolean)
returns public.coven_ritual_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_ritual_settings;
begin
  if not ((public.coven_is_head(p_coven)) and public.coven_in_good_standing(p_coven))
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

-- coven_grimoire_allows (from 20261106000000_coven_grimoire.sql)
create or replace function public.coven_grimoire_allows(p_coven uuid, p_list jsonb, p_what text, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (public.coven_is_ancestor_head(p_coven, p_user) and exists (select 1 from public.covens x where x.id = p_coven and x.status = 'active')) or coalesce((
    select case
      when public.coven_is_head(c.id, p_user) then true
      when p_list is null then case p_what
        when 'view' then true
        when 'write' then coalesce(r.can_write_book or r.can_approve_book or r.can_manage, false)
        when 'approve' then coalesce(r.can_approve_book or r.can_manage, false)
        else false
      end
      else exists (
        select 1 from jsonb_array_elements(p_list) a
        where a->>'kind' = 'coven'
           or (a->>'kind' = 'user' and a->>'id' = p_user::text)
           or (a->>'kind' = 'rank' and m.rank_id is not null and a->>'id' = m.rank_id::text)
      )
    end
    from public.coven_members m
    join public.covens c on c.id = m.coven_id
    left join public.coven_ranks r on r.id = m.rank_id
    where m.coven_id = p_coven and m.user_id = p_user and m.status = 'active' and c.status = 'active'
  ), false);
$$;

-- coven_ritual_open_to (from 20261107000200_coven_meetings.sql)
create or replace function public.coven_ritual_open_to(p_ritual uuid, p_user uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
begin
  if p_user is null then return false; end if;
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null then return false; end if;
  if p_user = auth.uid() and public.is_community_moderator() then return true; end if;
  if public.coven_is_ancestor_head(r.coven_id, p_user) then return true; end if;
  if not exists (select 1 from public.coven_members where coven_id = r.coven_id and user_id = p_user and status = 'active') then return false; end if;
  if r.audience is null then return true; end if;
  return r.created_by = p_user
    or (public.coven_is_head(r.coven_id, p_user))
    or public.coven_assignees_include(r.coven_id, r.audience, p_user)
    or public.coven_list_names(r.coven_id, public.coven_plan_who(r.plan,
         (select coalesce(jsonb_agg('role:' || (x->>'id')), '[]'::jsonb) from jsonb_array_elements(case when jsonb_typeof(r.plan->'roles') = 'array' then r.plan->'roles' else '[]'::jsonb end) x)), p_user);
end;
$$;

-- coven_meeting_reads_history (from 20261107000200_coven_meetings.sql)
create or replace function public.coven_meeting_reads_history(p_ritual uuid, p_user uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  keys jsonb;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or p_user is null then return false; end if;
  if p_user = auth.uid() and public.is_community_moderator() then return true; end if;
  if (public.coven_is_head(r.coven_id, p_user))
     and exists (select 1 from public.coven_members m where m.coven_id = r.coven_id and m.user_id = p_user and m.status = 'active') then
    return true;
  end if;
  if not public.coven_ritual_open_to(r.id, p_user) then return false; end if;
  keys := coalesce(r.chat_readers, (select s.meeting_chat_readers from public.coven_ritual_settings s where s.coven_id = r.coven_id), '["chair", "secretary"]'::jsonb);
  return exists (
    select 1 from jsonb_array_elements_text(keys) k
    where k = 'audience'
       or (k = 'chair' and public.coven_meeting_cast_in(r.id, 'chair', p_user))
       or (k = 'secretary' and public.coven_meeting_cast_in(r.id, 'secretary', p_user))
       or (k like 'role:%' and public.coven_list_names(r.coven_id, public.coven_plan_role_people(r.plan, jsonb_build_array(substr(k, 6))), p_user))
       or ((k like 'rank:%' or k like 'user:%') and public.coven_list_names(r.coven_id, public.coven_plan_who(r.plan, jsonb_build_array(k)), p_user))
  );
end;
$$;

-- set_coven_meeting_action (from 20261107000200_coven_meetings.sql)
create or replace function public.set_coven_meeting_action(p_action uuid, p_status text)
returns public.coven_meeting_actions
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.coven_meeting_actions;
begin
  select * into a from public.coven_meeting_actions where id = p_action for update;
  if a.id is null then raise exception 'That action was not found.'; end if;
  if p_status not in ('open', 'done', 'dropped') then raise exception 'An action is open, done or dropped.'; end if;
  if not (
    (public.coven_list_names(a.coven_id, a.assignees, auth.uid()) and public.coven_in_good_standing(a.coven_id) and p_status <> 'dropped')
    or public.coven_meeting_keeps_notes(a.ritual_id)
    or (public.coven_is_head(a.coven_id))
    or public.is_community_moderator()
  ) then
    raise exception 'Only those it''s for, and the meeting''s Chair and Secretary, mark an action.';
  end if;
  update public.coven_meeting_actions
  set status = p_status, done_by = case when p_status = 'done' then auth.uid() end, done_at = case when p_status = 'done' then now() end, updated_at = now()
  where id = a.id
  returning * into a;
  return a;
end;
$$;

-- set_coven_meeting_chat_readers (from 20261107000200_coven_meetings.sql)
create or replace function public.set_coven_meeting_chat_readers(p_ritual uuid, p_readers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  cleaned jsonb;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.kind <> 'meeting' then raise exception 'That meeting was not found.'; end if;
  if not ((public.coven_is_head(r.coven_id)) and public.is_coven_member(r.coven_id))
     and not public.is_community_moderator() then
    raise exception 'Only the coven''s head chooses who reads a meeting''s whole chat.';
  end if;
  cleaned := public.coven_clean_history_keys(r.coven_id, p_readers);
  update public.coven_rituals set chat_readers = cleaned, updated_at = now() where id = r.id;
  return cleaned;
end;
$$;

-- set_coven_meeting_defaults (from 20261107000200_coven_meetings.sql)
create or replace function public.set_coven_meeting_defaults(p_coven uuid, p_readers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned jsonb;
begin
  if not ((public.coven_is_head(p_coven)) and public.is_coven_member(p_coven))
     and not public.is_community_moderator() then
    raise exception 'Only the coven''s head chooses who reads meetings'' whole chats.';
  end if;
  cleaned := public.coven_clean_history_keys(p_coven, p_readers);
  insert into public.coven_ritual_settings (coven_id, meeting_chat_readers, updated_by, updated_at)
  values (p_coven, cleaned, auth.uid(), now())
  on conflict (coven_id) do update set meeting_chat_readers = excluded.meeting_chat_readers, updated_by = auth.uid(), updated_at = now();
  return cleaned;
end;
$$;


-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- People the head names who may ask to found a daughter coven (beside positions with can_found_daughter).
create table if not exists public.coven_daughter_founders (
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (coven_id, user_id)
);

create table if not exists public.coven_daughter_requests (
  id uuid primary key default gen_random_uuid(),
  mother_coven_id uuid not null references public.covens (id) on delete cascade,
  requested_by uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 3 and 80),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  tagline text check (tagline is null or char_length(tagline) <= 160),
  description text check (description is null or char_length(description) <= 5000),
  tradition text check (tradition is null or char_length(tradition) <= 80),
  joining text not null default 'application' check (joining in ('open', 'application', 'closed')),
  visibility text not null default 'listed' check (visibility in ('listed', 'unlisted')),
  founder_rank text check (founder_rank is null or char_length(founder_rank) <= 60),
  -- What becomes of the asker's place in the mother coven.
  membership text not null default 'stay' check (membership in ('stay', 'visiting', 'leave')),
  -- What to carry across: { documents, positions, programs, book, rituals, calendar }.
  copy jsonb not null default '{}'::jsonb check (jsonb_typeof(copy) = 'object' and octet_length(copy::text) <= 2000),
  note text check (note is null or char_length(note) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'withdrawn')),
  decided_by uuid references auth.users (id) on delete set null,
  decision_note text check (decision_note is null or char_length(decision_note) <= 2000),
  head_id uuid references auth.users (id) on delete set null,
  daughter_coven_id uuid references public.covens (id) on delete set null,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists coven_daughter_requests_mother_idx on public.coven_daughter_requests (mother_coven_id, status, created_at desc);
create unique index if not exists coven_daughter_requests_one_pending on public.coven_daughter_requests (mother_coven_id, requested_by) where status = 'pending';

-- The lineage log, kept in each coven it concerns.
create table if not exists public.coven_lineage_events (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  other_coven_id uuid references public.covens (id) on delete set null,
  other_coven_name text,
  event text not null check (event in ('requested', 'approved', 'declined', 'withdrawn', 'founded', 'released', 'release_requested',
                                       'release_declined', 'copied', 'pushed', 'override', 'head_appointed')),
  actor uuid references auth.users (id) on delete set null,
  detail jsonb not null default '{}'::jsonb check (jsonb_typeof(detail) = 'object'),
  note text check (note is null or char_length(note) <= 2000),
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists coven_lineage_events_coven_idx on public.coven_lineage_events (coven_id, created_at desc);

-- What a coven shares with its daughter covens.
create table if not exists public.coven_shared_with_daughters (
  coven_id uuid not null references public.covens (id) on delete cascade,
  kind text not null check (kind in ('document', 'rank', 'program', 'book_section', 'book_page', 'ritual_library', 'calendar')),
  item_id uuid not null,
  shared_by uuid references auth.users (id) on delete set null,
  shared_at timestamptz not null default now(),
  primary key (coven_id, kind, item_id)
);

-- Where each copy came from ("Copied from …").
create table if not exists public.coven_copied_items (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  kind text not null,
  item_id uuid not null,
  from_coven_id uuid references public.covens (id) on delete set null,
  from_coven_name text not null,
  from_item_id uuid not null,
  copied_by uuid references auth.users (id) on delete set null,
  copied_at timestamptz not null default now(),
  pushed_at timestamptz
);

-- (Lessons and tests come across with a program: coven_copy_course_extras.)
alter table public.coven_copied_items drop constraint if exists coven_copied_items_kind_check;
alter table public.coven_copied_items add constraint coven_copied_items_kind_check
  check (kind in ('document', 'rank', 'program', 'book_section', 'book_page', 'ritual_library', 'calendar', 'lesson', 'quiz'));
create index if not exists coven_copied_items_coven_idx on public.coven_copied_items (coven_id, kind, item_id);
create index if not exists coven_copied_items_from_idx on public.coven_copied_items (coven_id, kind, from_item_id, copied_at desc);

-- The succession plan: who leads next.
create table if not exists public.coven_succession (
  coven_id uuid primary key references public.covens (id) on delete cascade,
  successor_id uuid references auth.users (id) on delete set null,
  second_id uuid references auth.users (id) on delete set null,
  set_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  check (successor_id is null or second_id is null or successor_id <> second_id)
);

-- "The head can't be reached": to the site moderators.
create table if not exists public.coven_head_reports (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  reported_by uuid references auth.users (id) on delete set null,
  head_id uuid references auth.users (id) on delete set null,
  note text check (note is null or char_length(note) <= 2000),
  last_active_at timestamptz,
  status text not null default 'open' check (status in ('open', 'transferred', 'dismissed')),
  resolved_by uuid references auth.users (id) on delete set null,
  resolution_note text check (resolution_note is null or char_length(resolution_note) <= 2000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create unique index if not exists coven_head_reports_one_open on public.coven_head_reports (coven_id) where status = 'open';

create table if not exists public.coven_leadership_events (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  event text not null check (event in ('handed_on', 'appointed_by_mother', 'moderator_transfer', 'account_transfer', 'archived_no_head', 'successor_named', 'head_reported')),
  from_user uuid references auth.users (id) on delete set null,
  to_user uuid references auth.users (id) on delete set null,
  actor uuid references auth.users (id) on delete set null,
  detail jsonb not null default '{}'::jsonb check (jsonb_typeof(detail) = 'object'),
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists coven_leadership_events_coven_idx on public.coven_leadership_events (coven_id, created_at desc);

-- A daughter's head asks to be released.
create table if not exists public.coven_release_requests (
  id uuid primary key default gen_random_uuid(),
  daughter_coven_id uuid not null references public.covens (id) on delete cascade,
  mother_coven_id uuid not null references public.covens (id) on delete cascade,
  requested_by uuid references auth.users (id) on delete set null,
  note text check (note is null or char_length(note) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'withdrawn')),
  decided_by uuid references auth.users (id) on delete set null,
  decision_note text check (decision_note is null or char_length(decision_note) <= 2000),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create unique index if not exists coven_release_requests_one_pending on public.coven_release_requests (daughter_coven_id) where status = 'pending';

-- ---------------------------------------------------------------------------
-- Row-level security: reads only; every write is a function below
-- ---------------------------------------------------------------------------

alter table public.coven_daughter_founders enable row level security;
alter table public.coven_daughter_requests enable row level security;
alter table public.coven_lineage_events enable row level security;
alter table public.coven_shared_with_daughters enable row level security;
alter table public.coven_copied_items enable row level security;
alter table public.coven_succession enable row level security;
alter table public.coven_head_reports enable row level security;
alter table public.coven_leadership_events enable row level security;
alter table public.coven_release_requests enable row level security;

drop policy if exists "Members see who may found daughter covens" on public.coven_daughter_founders;
create policy "Members see who may found daughter covens" on public.coven_daughter_founders
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

drop policy if exists "Askers and the mother's leaders see requests for daughter covens" on public.coven_daughter_requests;
create policy "Askers and the mother's leaders see requests for daughter covens" on public.coven_daughter_requests
  for select to authenticated
  using (requested_by = auth.uid() or public.coven_permission(mother_coven_id, 'manage') or public.is_community_moderator());

drop policy if exists "Leaders see their coven's lineage log" on public.coven_lineage_events;
create policy "Leaders see their coven's lineage log" on public.coven_lineage_events
  for select to authenticated using (public.coven_permission(coven_id, 'manage') or public.is_community_moderator());

drop policy if exists "Members of a coven and of its daughters see what it shares" on public.coven_shared_with_daughters;
create policy "Members of a coven and of its daughters see what it shares" on public.coven_shared_with_daughters
  for select to authenticated
  using (
    public.is_coven_member(coven_id)
    or exists (select 1 from public.covens d where d.mother_coven_id = coven_id and public.is_coven_member(d.id))
    or public.is_community_moderator()
  );

drop policy if exists "Members see where their coven's copies came from" on public.coven_copied_items;
create policy "Members see where their coven's copies came from" on public.coven_copied_items
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

drop policy if exists "Leaders, elders and the named see the succession plan" on public.coven_succession;
create policy "Leaders, elders and the named see the succession plan" on public.coven_succession
  for select to authenticated
  using (
    successor_id = auth.uid() or second_id = auth.uid()
    or public.coven_permission(coven_id, 'review') or public.coven_permission(coven_id, 'moderate')
    or public.is_community_moderator()
  );

drop policy if exists "Reporters and site moderators see head reports" on public.coven_head_reports;
create policy "Reporters and site moderators see head reports" on public.coven_head_reports
  for select to authenticated using (reported_by = auth.uid() or public.is_community_moderator());

drop policy if exists "Members see their coven's leadership changes" on public.coven_leadership_events;
create policy "Members see their coven's leadership changes" on public.coven_leadership_events
  for select to authenticated
  using ((public.is_coven_member(coven_id) and event <> 'head_reported') or public.is_community_moderator());

drop policy if exists "Leaders of both covens see release requests" on public.coven_release_requests;
create policy "Leaders of both covens see release requests" on public.coven_release_requests
  for select to authenticated
  using (public.coven_permission(daughter_coven_id, 'manage') or public.coven_permission(mother_coven_id, 'manage') or public.is_community_moderator());

revoke insert, update, delete on public.coven_daughter_founders, public.coven_daughter_requests, public.coven_lineage_events,
  public.coven_shared_with_daughters, public.coven_copied_items, public.coven_succession, public.coven_head_reports,
  public.coven_leadership_events, public.coven_release_requests from anon, authenticated;
revoke select on public.coven_daughter_founders, public.coven_daughter_requests, public.coven_lineage_events,
  public.coven_shared_with_daughters, public.coven_copied_items, public.coven_succession, public.coven_head_reports,
  public.coven_leadership_events, public.coven_release_requests from anon;

-- ---------------------------------------------------------------------------
-- Small helpers
-- ---------------------------------------------------------------------------

create or replace function public.coven_quiet()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(current_setting('coven.lineage_quiet', true), '') = 'on';
$$;

-- Keep a line in a coven's lineage log.
create or replace function public.coven_log_lineage(p_coven uuid, p_other uuid, p_event text, p_detail jsonb default '{}'::jsonb, p_note text default null, p_actor uuid default auth.uid())
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  made uuid;
begin
  insert into public.coven_lineage_events (coven_id, other_coven_id, other_coven_name, event, actor, detail, note)
  values (p_coven, p_other, (select name from public.covens where id = p_other), p_event, p_actor, coalesce(p_detail, '{}'::jsonb), left(nullif(btrim(p_note), ''), 2000))
  returning id into made;
  return made;
end;
$$;

-- Whether this person may see a coven's name: listed and active, or theirs, or a moderator.
create or replace function public.coven_name_visible(p_coven uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.covens c where c.id = p_coven and c.status = 'active' and c.visibility = 'listed')
    or public.is_coven_member(p_coven)
    or public.is_community_moderator();
$$;

-- A coven's head, their name and their position's title.
create or replace function public.coven_head_card(p_coven uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', c.founder_id,
    'name', coalesce((select p.display_name from public.coven_profiles p where p.user_id = c.founder_id), 'its head'),
    'title', coalesce((
      select r.name from public.coven_members m join public.coven_ranks r on r.id = m.rank_id
      where m.coven_id = c.id and m.user_id = c.founder_id and m.status = 'active'
    ), 'High Priestess')
  )
  from public.covens c where c.id = p_coven;
$$;

-- The words every daughter coven shows before anyone joins, and puts in its member agreement.
create or replace function public.coven_disclosure_text(p_coven uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d public.covens;
  m public.covens;
  head jsonb;
  words text;
  a record;
begin
  select * into d from public.covens where id = p_coven;
  if d.mother_coven_id is null then return null; end if;
  select * into m from public.covens where id = d.mother_coven_id;
  head := public.coven_head_card(m.id);
  words := format('%s is a daughter coven of %s. %s''s %s, %s, has final say over this coven.', d.name, m.name, m.name, head->>'title', head->>'name');
  for a in select x.coven_id, x.depth from public.coven_ancestors(p_coven) x where x.depth > 1 order by x.depth loop
    head := public.coven_head_card(a.coven_id);
    words := words || format(' So does %s''s %s, %s, as head of the coven %s descends from.', (select name from public.covens where id = a.coven_id), head->>'title', head->>'name', m.name);
  end loop;
  return words;
end;
$$;

-- What a daughter coven discloses to anyone, signed in or not, before they join.
create or replace function public.coven_disclosure(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d public.covens;
  m public.covens;
begin
  select * into d from public.covens where slug = p_slug;
  if d.id is null or d.mother_coven_id is null then return null; end if;
  if d.status <> 'active' and not (public.is_coven_member(d.id) or public.is_community_moderator()) then return null; end if;
  select * into m from public.covens where id = d.mother_coven_id;
  return jsonb_build_object(
    'coven', d.name,
    'mother', m.name,
    -- A link only when the mother may be seen; its name always, so people know before they join.
    'mother_slug', case when public.coven_name_visible(m.id) then m.slug end,
    'head', public.coven_head_card(m.id),
    'above', coalesce((
      select jsonb_agg(jsonb_build_object('coven', c.name, 'head', public.coven_head_card(c.id), 'depth', a.depth) order by a.depth)
      from public.coven_ancestors(d.id) a join public.covens c on c.id = a.coven_id where a.depth > 1
    ), '[]'::jsonb),
    'text', public.coven_disclosure_text(d.id)
  );
end;
$$;

grant execute on function public.coven_disclosure(text) to anon, authenticated;

-- Values that look like ids of other rows are left out of a copy (positions'
-- and programs' references to things the daughter doesn't have).
create or replace function public.coven_strip_refs(j jsonb, keep text[])
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(jsonb_object_agg(key, case
    when key = any(keep) then value
    when jsonb_typeof(value) = 'string' and (value #>> '{}') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then 'null'::jsonb
    else value
  end), '{}'::jsonb)
  from jsonb_each(j);
$$;

-- People are never carried across: anyone named (by id, as "user:…", or as
-- {kind: 'user'}) is left out of a template or block, and positions are
-- swapped for the daughter's copies (p_ranks: old id → new id) or left out.
create or replace function public.coven_scrub_people(j jsonb, p_ranks jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  out jsonb;
  k text;
  v jsonb;
  e jsonb;
  s text;
begin
  if j is null then return null; end if;
  case jsonb_typeof(j)
    when 'object' then
      if j->>'kind' in ('user', 'person', 'member') then return null; end if;
      if j->>'kind' = 'rank' then
        if coalesce(p_ranks, '{}'::jsonb) ? (j->>'id') then return jsonb_set(j, '{id}', p_ranks->(j->>'id')); end if;
        return null;
      end if;
      out := '{}'::jsonb;
      for k, v in select * from jsonb_each(j) loop
        if k ~ '(^|_)(user_id|user_ids|by|people|person|turn_order|attendees|voters)$' then continue; end if;
        out := out || jsonb_build_object(k, public.coven_scrub_people(v, p_ranks));
      end loop;
      return out;
    when 'array' then
      out := '[]'::jsonb;
      for e in select * from jsonb_array_elements(j) loop
        if jsonb_typeof(e) = 'string' then
          s := e #>> '{}';
          if s ~ '^user:' then continue; end if;
          if s ~ '^rank:' then
            if coalesce(p_ranks, '{}'::jsonb) ? substr(s, 6) then out := out || to_jsonb('rank:' || (p_ranks->>substr(s, 6))); end if;
            continue;
          end if;
          out := out || jsonb_build_array(e);
        else
          e := public.coven_scrub_people(e, p_ranks);
          if e is not null then out := out || jsonb_build_array(e); end if;
        end if;
      end loop;
      return out;
    else
      return j;
  end case;
end;
$$;

-- Overwrite a row's columns with another row's (as jsonb), leaving out p_skip.
create or replace function public.coven_overwrite_row(p_table text, p_id uuid, p_source jsonb, p_skip text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cols text;
  rcols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position),
         string_agg('r.' || quote_ident(column_name), ', ' order by ordinal_position)
  into cols, rcols
  from information_schema.columns
  where table_schema = 'public' and table_name = p_table and column_name <> all(p_skip) and p_source ? column_name;
  if cols is null then return; end if;
  execute format('update public.%I t set (%s) = (select %s from jsonb_populate_record(null::public.%I, $1) r) where t.id = $2', p_table, cols, rcols, p_table)
  using p_source, p_id;
end;
$$;

-- Where a copy came from.
create or replace function public.coven_note_copy(p_coven uuid, p_kind text, p_item uuid, p_from_coven uuid, p_from_item uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.coven_copied_items (coven_id, kind, item_id, from_coven_id, from_coven_name, from_item_id, copied_by)
  values (p_coven, p_kind, p_item, p_from_coven, (select name from public.covens where id = p_from_coven), p_from_item, auth.uid());
$$;

-- The training-courses tables (20261110000100_coven_courses.sql), carried
-- with a program copied (or pushed) into a daughter: each task's lessons
-- (coven_program_documents, linked by coven_program_task_documents) and its
-- test (coven_program_quizzes, coven_program_tasks.quiz_id). p_map:
-- { "stages": { old id: new id }, "tasks": { old id: new id } }. A lesson or
-- test the daughter's task already has as a copy of the same one is brought
-- up to date (a push); otherwise a new copy is made, or, for a ready-made
-- course's lesson or test the daughter already has (same source_id), that one
-- is used. Never anyone's reads, attempts, scores, messages or progress. A
-- lesson's file stays in the mother coven's storage (files are kept under
-- each coven's own folder), so a copy comes without it and says so.
-- Anything later added to the courses tables is copied here too.
create or replace function public.coven_copy_course_extras(p_from_program uuid, p_to_program uuid, p_map jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  to_coven uuid := (select coven_id from public.coven_programs where id = p_to_program);
  from_coven uuid := (select coven_id from public.coven_programs where id = p_from_program);
  pair record;
  src_task public.coven_program_tasks;
  dst_task public.coven_program_tasks;
  q public.coven_program_quizzes;
  q_to uuid;
  doc public.coven_program_documents;
  link record;
  d_to uuid;
  kept uuid[];
  file_words text;
begin
  if to_coven is null or from_coven is null or to_coven = from_coven then return; end if;
  for pair in select key::uuid as old_id, (value #>> '{}')::uuid as new_id from jsonb_each(coalesce(p_map->'tasks', '{}'::jsonb)) loop
    select * into src_task from public.coven_program_tasks where id = pair.old_id;
    select * into dst_task from public.coven_program_tasks where id = pair.new_id;
    continue when src_task.id is null or dst_task.id is null;

    -- Its test.
    q_to := null;
    if src_task.quiz_id is not null then
      select * into q from public.coven_program_quizzes where id = src_task.quiz_id;
      if q.id is not null then
        if dst_task.quiz_id is not null and exists (
          select 1 from public.coven_copied_items k where k.coven_id = to_coven and k.kind = 'quiz' and k.item_id = dst_task.quiz_id and k.from_item_id = q.id) then
          q_to := dst_task.quiz_id;
          update public.coven_program_quizzes
          set title = q.title, intro = q.intro, pass_percent = q.pass_percent, retakes = q.retakes, wait_hours = q.wait_hours, questions = q.questions, updated_at = now()
          where id = q_to;
        elsif q.source_id is not null then
          select id into q_to from public.coven_program_quizzes where coven_id = to_coven and source_id = q.source_id;
        end if;
        if q_to is null then
          insert into public.coven_program_quizzes (coven_id, title, intro, pass_percent, retakes, wait_hours, questions, source_id, created_by)
          values (to_coven, q.title, q.intro, q.pass_percent, q.retakes, q.wait_hours, q.questions, q.source_id, auth.uid())
          returning id into q_to;
          perform public.coven_note_copy(to_coven, 'quiz', q_to, from_coven, q.id);
        end if;
      end if;
    end if;
    update public.coven_program_tasks set quiz_id = q_to where id = dst_task.id and quiz_id is distinct from q_to;

    -- Its lessons, in order.
    kept := '{}';
    for link in select l.document_id, l.position from public.coven_program_task_documents l where l.task_id = src_task.id order by l.position loop
      select * into doc from public.coven_program_documents where id = link.document_id;
      continue when doc.id is null;
      d_to := null;
      select l.document_id into d_to from public.coven_program_task_documents l
      join public.coven_copied_items k on k.coven_id = to_coven and k.kind = 'lesson' and k.item_id = l.document_id and k.from_item_id = doc.id
      where l.task_id = dst_task.id limit 1;
      file_words := case when doc.file_path is not null
        then E'\n\n(This lesson has a file' || coalesce(' (' || doc.file_name || ')', '') || ' in '
             || coalesce((select name from public.covens where id = from_coven), 'the mother coven') || '. Files aren’t copied: ask its head for it.)'
        else '' end;
      if d_to is not null then
        update public.coven_program_documents
        set title = doc.title, summary = doc.summary, minutes = doc.minutes, body = left(doc.body || file_words, 60000), updated_at = now()
        where id = d_to;
      else
        if doc.source_id is not null then
          select id into d_to from public.coven_program_documents where coven_id = to_coven and source_id = doc.source_id;
        end if;
        if d_to is null then
          insert into public.coven_program_documents (coven_id, title, summary, minutes, body, source_id, created_by)
          values (to_coven, doc.title, doc.summary, doc.minutes, left(doc.body || file_words, 60000), doc.source_id, auth.uid())
          returning id into d_to;
          perform public.coven_note_copy(to_coven, 'lesson', d_to, from_coven, doc.id);
        end if;
      end if;
      insert into public.coven_program_task_documents (task_id, document_id, coven_id, position)
      values (dst_task.id, d_to, to_coven, link.position)
      on conflict (task_id, document_id) do update set position = excluded.position;
      kept := kept || d_to;
    end loop;
    -- Lessons the mother's step no longer has come off the daughter's step (the lessons themselves stay).
    delete from public.coven_program_task_documents l where l.task_id = dst_task.id and l.document_id <> all(kept)
      and exists (select 1 from public.coven_copied_items k where k.coven_id = to_coven and k.kind = 'lesson' and k.item_id = l.document_id);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Copying, one thing at a time (each notes where it came from)
-- ---------------------------------------------------------------------------

-- The coven's latest copy of something (by the original's id), if it has one.
create or replace function public.coven_copied_id(p_coven uuid, p_kind text, p_from uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select k.item_id from public.coven_copied_items k
  where k.coven_id = p_coven and k.kind = p_kind and k.from_item_id = p_from
  order by k.copied_at desc limit 1;
$$;

-- What a copied position asks (open positions' requirement_items), with each
-- position, program or page it names swapped for the coven's own copy of it,
-- or left out when the coven has none (p_drop; otherwise kept as it is for a
-- later pass, coven_remap_copied_ranks, once the rest has come across).
create or replace function public.coven_remap_requirements(p_coven uuid, p_items jsonb, p_drop boolean default true)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  item jsonb;
  out jsonb := '[]'::jsonb;
  ref text;
  v_kind text;
  mine uuid;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then return '[]'::jsonb; end if;
  for item in select x from jsonb_array_elements(p_items) x loop
    if jsonb_typeof(item) <> 'object' then continue; end if;
    ref := case when item ? 'rank_id' then 'rank_id' when item ? 'program_id' then 'program_id' when item ? 'document_id' then 'document_id' end;
    if ref is null then
      out := out || jsonb_build_array(item);
      continue;
    end if;
    v_kind := case ref when 'rank_id' then 'rank' when 'program_id' then 'program' else 'document' end;
    begin
      mine := (item->>ref)::uuid;
    exception when others then
      continue;
    end;
    if not exists (
      select 1 from public.coven_ranks where v_kind = 'rank' and id = mine and coven_id = p_coven
      union all select 1 from public.coven_programs where v_kind = 'program' and id = mine and coven_id = p_coven
      union all select 1 from public.coven_documents where v_kind = 'document' and id = mine and coven_id = p_coven
    ) then
      mine := public.coven_copied_id(p_coven, v_kind, mine);
    end if;
    if mine is not null then
      out := out || jsonb_build_array(item || jsonb_build_object(ref, mine));
    elsif not p_drop then
      out := out || jsonb_build_array(item);
    end if;
  end loop;
  return out;
end;
$$;

-- After a founding or a push: every copied position's requirements, matched again
-- (a program or page it names may have come across after the position did).
create or replace function public.coven_remap_copied_ranks(p_coven uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  remapped jsonb;
begin
  perform set_config('coven.copying', 'on', true);
  for r in select x.id, x.requirement_items from public.coven_ranks x
           where x.coven_id = p_coven and x.requirement_items <> '[]'::jsonb
             and exists (select 1 from public.coven_copied_items k where k.coven_id = p_coven and k.kind = 'rank' and k.item_id = x.id) loop
    remapped := public.coven_remap_requirements(p_coven, r.requirement_items);
    if remapped is distinct from r.requirement_items then
      update public.coven_ranks set requirement_items = remapped where id = r.id;
    end if;
  end loop;
  perform set_config('coven.copying', 'off', true);
end;
$$;

-- A page: creed, rules, requirements or an agreement. Agreements arrive as
-- drafts, so the daughter reads and adopts them itself.
create or replace function public.coven_copy_document(p_doc uuid, p_to uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.coven_documents;
  made uuid;
begin
  select * into d from public.coven_documents where id = p_doc;
  if d.id is null then return null; end if;
  insert into public.coven_documents (coven_id, kind, title, body, visibility, requires_signature, published, position)
  values (p_to, d.kind, d.title, d.body, d.visibility, d.requires_signature, case when d.kind = 'agreement' or d.requires_signature then false else d.published end,
          coalesce((select max(position) from public.coven_documents where coven_id = p_to), 0) + 1)
  returning id into made;
  perform public.coven_note_copy(p_to, 'document', made, d.coven_id, d.id);
  return made;
end;
$$;

-- A position and its powers (never who holds it).
create or replace function public.coven_copy_rank(p_rank uuid, p_to uuid, p_default boolean default false)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  src jsonb;
  made uuid := gen_random_uuid();
  from_coven uuid;
begin
  select to_jsonb(r), r.coven_id into src, from_coven from public.coven_ranks r where r.id = p_rank;
  if src is null then return null; end if;
  perform set_config('coven.copying', 'on', true);
  -- The position's own settings come across; an opening in the mother (its
  -- closing date and note) doesn't. What it asks is matched to the
  -- daughter's copies (coven_remap_requirements).
  src := public.coven_strip_refs(src, array['id', 'coven_id'])
    || jsonb_build_object('id', made, 'coven_id', p_to, 'is_default', p_default, 'created_at', now(), 'updated_at', now(),
         'applications_close_at', null, 'opening_note', null, 'opened_at', null,
         'requirement_items', public.coven_remap_requirements(p_to, src->'requirement_items', false));
  insert into public.coven_ranks select * from jsonb_populate_record(null::public.coven_ranks, src);
  perform set_config('coven.copying', 'off', true);
  perform public.coven_note_copy(p_to, 'rank', made, from_coven, p_rank);
  return made;
end;
$$;

-- A program's stages and tasks, matched by order onto a program of the daughter's
-- (p_fresh: a new copy; otherwise the daughter's copy is overwritten).
create or replace function public.coven_program_body(p_from uuid, p_to uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  dst public.coven_programs;
  s_from record;
  s_to uuid;
  t_from record;
  t_to uuid;
  map jsonb := jsonb_build_object('stages', '{}'::jsonb, 'tasks', '{}'::jsonb);
  i integer := 0;
  j integer;
  dst_stages uuid[];
  dst_tasks uuid[];
begin
  select * into dst from public.coven_programs where id = p_to;
  select coalesce(array_agg(id order by position, created_at), '{}') into dst_stages from public.coven_program_stages where program_id = p_to;
  for s_from in select * from public.coven_program_stages where program_id = p_from order by position, created_at loop
    i := i + 1;
    if i <= coalesce(array_length(dst_stages, 1), 0) then
      s_to := dst_stages[i];
      perform public.coven_overwrite_row('coven_program_stages', s_to,
        public.coven_strip_refs(to_jsonb(s_from), array['id']) - 'id' - 'program_id' - 'coven_id' - 'created_at' || jsonb_build_object('updated_at', now()),
        array['id', 'program_id', 'coven_id', 'created_at']);
    else
      s_to := gen_random_uuid();
      insert into public.coven_program_stages
      select * from jsonb_populate_record(null::public.coven_program_stages,
        public.coven_strip_refs(to_jsonb(s_from), array['id']) || jsonb_build_object('id', s_to, 'program_id', p_to, 'coven_id', dst.coven_id, 'created_at', now(), 'updated_at', now()));
    end if;
    map := jsonb_set(map, array['stages', s_from.id::text], to_jsonb(s_to));
    select coalesce(array_agg(id order by position, created_at), '{}') into dst_tasks from public.coven_program_tasks where stage_id = s_to;
    j := 0;
    for t_from in select * from public.coven_program_tasks where stage_id = s_from.id order by position, created_at loop
      j := j + 1;
      if j <= coalesce(array_length(dst_tasks, 1), 0) then
        t_to := dst_tasks[j];
        perform public.coven_overwrite_row('coven_program_tasks', t_to,
          public.coven_strip_refs(to_jsonb(t_from), array['id']) - 'id' - 'stage_id' - 'program_id' - 'coven_id' - 'created_at' || jsonb_build_object('updated_at', now()),
          array['id', 'stage_id', 'program_id', 'coven_id', 'created_at', 'quiz_id']);
      else
        t_to := gen_random_uuid();
        insert into public.coven_program_tasks
        select * from jsonb_populate_record(null::public.coven_program_tasks,
          public.coven_strip_refs(to_jsonb(t_from), array['id']) || jsonb_build_object('id', t_to, 'stage_id', s_to, 'program_id', p_to, 'coven_id', dst.coven_id, 'created_at', now(), 'updated_at', now()));
      end if;
      map := jsonb_set(map, array['tasks', t_from.id::text], to_jsonb(t_to));
    end loop;
    -- Tasks the mother no longer has (and anyone's progress on them).
    if coalesce(array_length(dst_tasks, 1), 0) > j then
      delete from public.coven_program_tasks where id = any(dst_tasks[j + 1:]);
    end if;
  end loop;
  if coalesce(array_length(dst_stages, 1), 0) > i then
    delete from public.coven_program_stages where id = any(dst_stages[i + 1:]);
  end if;
  perform public.coven_copy_course_extras(p_from, p_to, map);
  return map;
end;
$$;

create or replace function public.coven_copy_program(p_program uuid, p_to uuid, p_ranks jsonb default '{}'::jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  src public.coven_programs;
  made uuid := gen_random_uuid();
begin
  select * into src from public.coven_programs where id = p_program;
  if src.id is null then return null; end if;
  insert into public.coven_programs
  select * from jsonb_populate_record(null::public.coven_programs,
    public.coven_strip_refs(to_jsonb(src), array['id']) || jsonb_build_object(
      'id', made, 'coven_id', p_to, 'status', 'draft', 'created_by', auth.uid(), 'created_at', now(), 'updated_at', now(),
      'award_rank_id', coalesce(p_ranks, '{}'::jsonb)->(src.award_rank_id::text),
      'position', coalesce((select max(position) from public.coven_programs where coven_id = p_to), 0) + 1));
  perform public.coven_program_body(p_program, made);
  perform public.coven_note_copy(p_to, 'program', made, src.coven_id, p_program);
  return made;
end;
$$;

-- The daughter's Book, made with its shelves if it has none yet.
create or replace function public.coven_book_of(p_coven uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  b uuid;
begin
  select id into b from public.coven_grimoire_books where coven_id = p_coven;
  if b is null then
    insert into public.coven_grimoire_books (coven_id, user_id) values (p_coven, auth.uid()) on conflict (coven_id) do nothing;
    select id into b from public.coven_grimoire_books where coven_id = p_coven;
    perform public.coven_grimoire_shelves(b);
  end if;
  return b;
end;
$$;

-- Whether a Book page or section may be shared with daughters: never the
-- records or minutes shelves, and never a page kept to some members only.
create or replace function public.coven_book_shareable(p_kind text, p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case p_kind
    when 'book_section' then exists (
      select 1 from public.coven_grimoire_sections s where s.id = p_id and coalesce(s.shelf, '') not in ('records', 'minutes')
        and public.coven_grimoire_rule(s.access, 'view') is null)
    when 'book_page' then exists (
      select 1 from public.coven_grimoire_pages p left join public.coven_grimoire_sections s on s.id = p.section_id
      where p.id = p_id and coalesce(s.shelf, '') not in ('records', 'minutes')
        and public.coven_grimoire_rule(p.access, 'view') is null and public.coven_grimoire_rule(coalesce(s.access, '{}'::jsonb), 'view') is null)
    else false
  end;
$$;

-- A Book page, its words and parts ("From {Mother}'s Book"); never who wrote
-- it, its history, suggestions or who may open it.
create or replace function public.coven_copy_book_page(p_page uuid, p_to uuid, p_section uuid default null, p_onto uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  src public.coven_grimoire_pages;
  book uuid := public.coven_book_of(p_to);
  made uuid;
  from_name text;
begin
  select * into src from public.coven_grimoire_pages where id = p_page;
  if src.id is null then return null; end if;
  select name into from_name from public.covens where id = src.coven_id;
  if p_onto is not null then
    perform public.coven_grimoire_keep_version(p_onto);
    update public.coven_grimoire_pages
    set title = src.title, icon = src.icon, page_type = src.page_type, updated_by = auth.uid(), updated_at = now(),
        metadata = src.metadata || jsonb_build_object('copied_from', jsonb_build_object('coven_id', src.coven_id, 'coven_name', from_name, 'page_id', src.id))
    where id = p_onto;
    made := p_onto;
    delete from public.coven_grimoire_blocks where page_id = made;
  else
    insert into public.coven_grimoire_pages (coven_id, book_id, section_id, user_id, updated_by, title, icon, page_type, sort_order, metadata)
    values (p_to, book, p_section, auth.uid(), auth.uid(), src.title, src.icon, src.page_type,
            coalesce((select max(sort_order) from public.coven_grimoire_pages where book_id = book and section_id is not distinct from p_section), 0) + 1,
            src.metadata || jsonb_build_object('copied_from', jsonb_build_object('coven_id', src.coven_id, 'coven_name', from_name, 'page_id', src.id)))
    returning id into made;
  end if;
  insert into public.coven_grimoire_blocks (coven_id, book_id, page_id, user_id, block_type, content, rich_content, metadata, sort_order)
  select p_to, book, made, auth.uid(), b.block_type, b.content, b.rich_content, b.metadata, b.sort_order
  from public.coven_grimoire_blocks b where b.page_id = src.id;
  if p_onto is null then perform public.coven_note_copy(p_to, 'book_page', made, src.coven_id, src.id); end if;
  return made;
end;
$$;

-- A Book section and the pages in it that may be shared.
create or replace function public.coven_copy_book_section(p_section uuid, p_to uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  src public.coven_grimoire_sections;
  book uuid := public.coven_book_of(p_to);
  made uuid;
  pg record;
begin
  select * into src from public.coven_grimoire_sections where id = p_section;
  if src.id is null then return null; end if;
  insert into public.coven_grimoire_sections (coven_id, book_id, user_id, title, sort_order)
  values (p_to, book, auth.uid(), src.title, coalesce((select max(sort_order) from public.coven_grimoire_sections where book_id = book), 0) + 1)
  returning id into made;
  for pg in select id from public.coven_grimoire_pages where section_id = src.id order by sort_order, created_at loop
    if public.coven_book_shareable('book_page', pg.id) then
      perform public.coven_copy_book_page(pg.id, p_to, made);
    end if;
  end loop;
  perform public.coven_note_copy(p_to, 'book_section', made, src.coven_id, src.id);
  return made;
end;
$$;

-- A ritual template, action or saved block of steps, with no one named in it.
create or replace function public.coven_copy_library(p_item uuid, p_to uuid, p_ranks jsonb default '{}'::jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  src public.coven_ritual_library;
  made uuid;
begin
  select * into src from public.coven_ritual_library where id = p_item;
  if src.id is null then return null; end if;
  insert into public.coven_ritual_library (coven_id, kind, title, body, created_by, updated_by)
  values (p_to, src.kind, src.title, coalesce(public.coven_scrub_people(src.body, p_ranks), '{}'::jsonb), auth.uid(), auth.uid())
  returning id into made;
  perform public.coven_note_copy(p_to, 'ritual_library', made, src.coven_id, src.id);
  return made;
end;
$$;

-- The practice calendar: the holidays and calendars the coven keeps.
create or replace function public.coven_copy_calendar(p_from uuid, p_to uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  src public.covens;
begin
  select * into src from public.covens where id = p_from;
  update public.covens set practice_traditions = src.practice_traditions, practice_holidays = src.practice_holidays,
    practice_custom = src.practice_custom, practice_calendars = src.practice_calendars
  where id = p_to;
  perform public.coven_note_copy(p_to, 'calendar', p_to, p_from, p_from);
  return p_to;
end;
$$;

-- One shared thing, by kind.
create or replace function public.coven_copy_one(p_kind text, p_item uuid, p_from uuid, p_to uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  made uuid;
begin
  made := case p_kind
    when 'document' then public.coven_copy_document(p_item, p_to)
    when 'rank' then public.coven_copy_rank(p_item, p_to)
    when 'program' then public.coven_copy_program(p_item, p_to)
    when 'book_section' then public.coven_copy_book_section(p_item, p_to)
    when 'book_page' then public.coven_copy_book_page(p_item, p_to)
    when 'ritual_library' then public.coven_copy_library(p_item, p_to)
    when 'calendar' then public.coven_copy_calendar(p_from, p_to)
  end;
  if p_kind = 'rank' then perform public.coven_remap_copied_ranks(p_to); end if;
  return made;
end;
$$;

-- What a founding carries across (p_what: { documents, positions, programs,
-- book, rituals, calendar }). Positions replace the daughter's starting
-- ones, with its head in the copy of the mother's leading position. The
-- Book carries only what the mother shares with daughters.
create or replace function public.coven_copy_founding(p_from uuid, p_to uuid, p_what jsonb, p_asker uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ranks jsonb := '{}'::jsonb;
  r record;
  made uuid;
  counts jsonb := '{}'::jsonb;
  n integer;
  head uuid := (select founder_id from public.covens where id = p_to);
  lead_new uuid;
  next_new uuid;
  starting uuid[];
begin
  if coalesce((p_what->>'positions')::boolean, false) then
    select coalesce(array_agg(id), '{}') into starting from public.coven_ranks where coven_id = p_to;
    n := 0;
    for r in select * from public.coven_ranks where coven_id = p_from order by level, created_at loop
      made := public.coven_copy_rank(r.id, p_to, r.is_default);
      ranks := ranks || jsonb_build_object(r.id::text, made);
      n := n + 1;
    end loop;
    if n > 0 then
      select id into lead_new from public.coven_ranks where coven_id = p_to and can_manage and id <> all(starting) order by level desc limit 1;
      select id into next_new from public.coven_ranks where coven_id = p_to and not can_manage and id <> all(starting) order by (lower(btrim(name)) = 'elder') desc, level desc limit 1;
      update public.coven_members set rank_id = coalesce(lead_new, rank_id) where coven_id = p_to and user_id = head;
      update public.coven_members set rank_id = coalesce(next_new, rank_id) where coven_id = p_to and user_id <> head;
      if lead_new is not null then
        delete from public.coven_ranks where coven_id = p_to and id = any(starting);
      end if;
    end if;
    counts := counts || jsonb_build_object('positions', n);
  end if;

  if coalesce((p_what->>'documents')::boolean, false) then
    -- The empty starting pages of the kinds that come across make way for the mother's.
    delete from public.coven_documents d where d.coven_id = p_to and d.body = '' and d.kind in ('creed', 'rules', 'requirements')
      and exists (select 1 from public.coven_documents m where m.coven_id = p_from and m.kind = d.kind and m.published);
    n := 0;
    for r in select id from public.coven_documents where coven_id = p_from and published and kind in ('creed', 'rules', 'requirements', 'agreement') order by position loop
      perform public.coven_copy_document(r.id, p_to);
      n := n + 1;
    end loop;
    counts := counts || jsonb_build_object('documents', n);
  end if;

  if coalesce((p_what->>'programs')::boolean, false) then
    n := 0;
    for r in select id from public.coven_programs where coven_id = p_from and status <> 'archived' order by position loop
      perform public.coven_copy_program(r.id, p_to, ranks);
      n := n + 1;
    end loop;
    counts := counts || jsonb_build_object('programs', n);
  end if;

  if coalesce((p_what->>'book')::boolean, false) then
    n := 0;
    for r in select s.kind, s.item_id from public.coven_shared_with_daughters s
             where s.coven_id = p_from and s.kind in ('book_section', 'book_page') order by s.kind desc, s.shared_at loop
      if public.coven_book_shareable(r.kind, r.item_id)
         -- a page shared on its own, unless its whole section is shared too
         and not (r.kind = 'book_page' and exists (
           select 1 from public.coven_grimoire_pages p join public.coven_shared_with_daughters x
             on x.coven_id = p_from and x.kind = 'book_section' and x.item_id = p.section_id where p.id = r.item_id)) then
        perform public.coven_copy_one(r.kind, r.item_id, p_from, p_to);
        n := n + 1;
      end if;
    end loop;
    counts := counts || jsonb_build_object('book', n);
  end if;

  if coalesce((p_what->>'rituals')::boolean, false) then
    n := 0;
    for r in select id from public.coven_ritual_library where coven_id = p_from order by kind, title loop
      perform public.coven_copy_library(r.id, p_to, ranks);
      n := n + 1;
    end loop;
    counts := counts || jsonb_build_object('rituals', n);
  end if;

  if coalesce((p_what->>'calendar')::boolean, false) then
    perform public.coven_copy_calendar(p_from, p_to);
    counts := counts || jsonb_build_object('calendar', 1);
  end if;
  perform public.coven_remap_copied_ranks(p_to);
  return counts;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may found a daughter coven
-- ---------------------------------------------------------------------------

create or replace function public.coven_may_found_daughter(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and not public.is_community_banned()
    and exists (select 1 from public.covens c where c.id = target and c.status = 'active')
    and exists (select 1 from public.coven_profiles where user_id = auth.uid())
    and (
      public.coven_is_head(target)
      or (
        public.coven_in_good_standing(target)
        and (
          exists (
            select 1 from public.coven_members m join public.coven_ranks r on r.id = m.rank_id
            where m.coven_id = target and m.user_id = auth.uid() and m.status = 'active' and r.can_found_daughter
          )
          or exists (select 1 from public.coven_daughter_founders f where f.coven_id = target and f.user_id = auth.uid())
        )
      )
    );
$$;

-- The head names (or stops naming) someone who may ask.
create or replace function public.set_coven_daughter_founder(p_coven uuid, p_user uuid, p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.coven_is_head(p_coven) and public.coven_permission(p_coven, 'manage')) then
    raise exception 'Only the coven''s head chooses who may found a daughter coven.';
  end if;
  if p_enabled then
    if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_user and status = 'active') then
      raise exception 'They need to be a member of the coven.';
    end if;
    insert into public.coven_daughter_founders (coven_id, user_id, granted_by) values (p_coven, p_user, auth.uid()) on conflict do nothing;
  else
    delete from public.coven_daughter_founders where coven_id = p_coven and user_id = p_user;
  end if;
  return p_enabled;
end;
$$;

-- ---------------------------------------------------------------------------
-- Founding: ask, approve
-- ---------------------------------------------------------------------------

-- create_coven's rules for the daughter's head, then the daughter itself: its
-- starting positions and pages, a member agreement that says whose final say
-- it is under, and its head and whoever asked as its first members.
create or replace function public.coven_found_daughter(req public.coven_daughter_requests, p_head uuid)
returns public.covens
language plpgsql
security definer
set search_path = public
as $$
declare
  created public.covens;
  top_rank uuid;
  elder_rank uuid;
  agreement uuid;
  head_name text;
begin
  if public.is_community_banned(p_head) then raise exception 'That person cannot take part in covens.'; end if;
  select display_name into head_name from public.coven_profiles where user_id = p_head;
  if head_name is null then raise exception 'The new coven''s head needs a community profile first.'; end if;
  if (select count(*) from public.covens where founder_id = p_head and status <> 'archived') >= 5 then
    raise exception 'The new coven''s head already leads five covens, the most anyone can.';
  end if;
  if exists (select 1 from public.covens where slug = req.slug) then
    raise exception 'That coven address is taken. Try another.';
  end if;

  insert into public.covens (name, slug, tagline, description, tradition, joining, visibility, founder_id, mother_coven_id, hived_at)
  values (btrim(req.name), req.slug, req.tagline, req.description, req.tradition, req.joining, req.visibility, p_head, req.mother_coven_id, now())
  returning * into created;

  insert into public.coven_ranks (coven_id, name, description, level, is_default, open_to_applications)
  values
    (created.id, 'Seeker', 'New to the coven, learning its ways.', 1, true, false),
    (created.id, 'Dedicant', 'Has committed to a year and a day of study with the coven.', 2, false, true),
    (created.id, 'Initiate', 'Initiated into the coven''s mysteries.', 3, false, true);
  insert into public.coven_ranks (coven_id, name, description, level, can_review, can_moderate, open_to_applications)
  values (created.id, 'Elder', 'Guides the coven, welcomes seekers and keeps the circle safe.', 4, true, true, true)
  returning id into elder_rank;
  insert into public.coven_ranks (coven_id, name, description, level, can_manage, can_review, can_moderate)
  values (created.id, coalesce(nullif(btrim(req.founder_rank), ''), 'High Priestess'), 'Leads the coven.', 5, true, true, true)
  returning id into top_rank;

  insert into public.coven_members (coven_id, user_id, rank_id) values (created.id, p_head, top_rank);
  if req.requested_by <> p_head and not public.is_community_banned(req.requested_by) then
    insert into public.coven_members (coven_id, user_id, rank_id) values (created.id, req.requested_by, elder_rank) on conflict do nothing;
  end if;

  insert into public.coven_documents (coven_id, kind, title, body, position)
  values
    (created.id, 'creed', 'Our creed', '', 1),
    (created.id, 'rules', 'Coven rules', '', 2),
    (created.id, 'requirements', 'What we ask of members', '', 3);
  insert into public.coven_documents (coven_id, kind, title, body, requires_signature, position)
  values (created.id, 'agreement', 'Member agreement',
    E'I am 18 or older.\nI will treat every member with respect, and keep what is shared in this coven within it.\nI understand that no one may pressure me for money, secrets, private photographs or anything I do not freely offer, and that I may leave at any time.\nI will follow the Salt & Sovereignty community guidelines.\n'
      || 'I understand that ' || public.coven_disclosure_text(created.id),
    true, 4)
  returning id into agreement;
  insert into public.coven_signatures (document_id, coven_id, user_id, version, signed_name)
  values (agreement, created.id, p_head, 1, head_name);
  return created;
end;
$$;

-- Ask to found a daughter coven. Its head approves; when the head asks, it's approved at once.
create or replace function public.request_daughter_coven(p_mother uuid, p_draft jsonb, p_copy jsonb default '{}'::jsonb, p_membership text default 'stay', p_note text default null)
returns public.coven_daughter_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.covens;
  made public.coven_daughter_requests;
  v_slug text := lower(btrim(coalesce(p_draft->>'slug', '')));
  v_name text := btrim(coalesce(p_draft->>'name', ''));
begin
  perform public.coven_require_profile();
  select * into m from public.covens where id = p_mother;
  if m.id is null or m.status <> 'active' then raise exception 'That coven is not open right now.'; end if;
  if not public.coven_may_found_daughter(p_mother) then raise exception 'Your position doesn''t include founding a daughter coven. Ask the coven''s head.'; end if;
  if char_length(v_name) not between 3 and 80 then raise exception 'Give the new coven a name of 3 to 80 letters.'; end if;
  if v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(v_slug) not between 3 and 60 then
    raise exception 'The address can use lowercase letters, numbers and single dashes (3 to 60).';
  end if;
  if exists (select 1 from public.covens c where c.slug = v_slug)
     or exists (select 1 from public.coven_daughter_requests r where r.slug = v_slug and r.status = 'pending') then
    raise exception 'That coven address is taken. Try another.';
  end if;
  if p_membership not in ('stay', 'visiting', 'leave') then raise exception 'Choose what happens to your place in %.', m.name; end if;
  if m.founder_id = auth.uid() and p_membership <> 'stay' then
    raise exception 'You lead %, so you stay as you are there. Hand on its leadership first if you want to step back.', m.name;
  end if;
  if (select count(*) from public.covens where founder_id = auth.uid() and status <> 'archived') >= 5 then
    raise exception 'You can found up to five covens.';
  end if;
  if p_copy is not null and jsonb_typeof(p_copy) <> 'object' then raise exception 'Choose what to carry across.'; end if;
  if exists (select 1 from public.coven_daughter_requests where mother_coven_id = p_mother and requested_by = auth.uid() and status = 'pending') then
    raise exception 'You already have a request waiting for the head of %.', m.name;
  end if;

  insert into public.coven_daughter_requests (mother_coven_id, requested_by, name, slug, tagline, description, tradition, joining, visibility, founder_rank, membership, copy, note)
  values (p_mother, auth.uid(), v_name, v_slug,
          nullif(btrim(p_draft->>'tagline'), ''), nullif(btrim(p_draft->>'description'), ''), nullif(btrim(p_draft->>'tradition'), ''),
          coalesce(nullif(p_draft->>'joining', ''), 'application'), coalesce(nullif(p_draft->>'visibility', ''), 'listed'),
          nullif(btrim(p_draft->>'founder_rank'), ''), p_membership,
          (select coalesce(jsonb_object_agg(k, to_jsonb(coalesce((p_copy->>k)::boolean, false))), '{}'::jsonb)
           from unnest(array['documents', 'positions', 'programs', 'book', 'rituals', 'calendar']) k),
          nullif(btrim(p_note), ''))
  returning * into made;
  perform public.coven_log_lineage(p_mother, null, 'requested', jsonb_build_object('request_id', made.id, 'name', made.name));

  if public.coven_is_head(p_mother) then
    return public.decide_daughter_request(made.id, true, null, auth.uid(), null);
  end if;
  return made;
end;
$$;

create or replace function public.withdraw_daughter_request(p_request uuid)
returns public.coven_daughter_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.coven_daughter_requests;
begin
  update public.coven_daughter_requests set status = 'withdrawn', decided_at = now()
  where id = p_request and requested_by = auth.uid() and status = 'pending'
  returning * into req;
  if req.id is null then raise exception 'That request is no longer waiting.'; end if;
  perform public.coven_log_lineage(req.mother_coven_id, null, 'withdrawn', jsonb_build_object('request_id', req.id, 'name', req.name));
  return req;
end;
$$;

-- The mother's head decides. Approving founds the daughter with the head it
-- chooses (p_head; whoever asked, unless chosen otherwise) and carries across
-- what was asked for (or p_copy, the head's own choice).
create or replace function public.decide_daughter_request(p_request uuid, p_approve boolean, p_note text default null, p_head uuid default null, p_copy jsonb default null)
returns public.coven_daughter_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.coven_daughter_requests;
  m public.covens;
  head uuid;
  daughter public.covens;
  counts jsonb;
  default_rank uuid;
begin
  select * into req from public.coven_daughter_requests where id = p_request for update;
  if req.id is null then raise exception 'That request was not found.'; end if;
  if req.status <> 'pending' then raise exception 'That request has already been decided.'; end if;
  select * into m from public.covens where id = req.mother_coven_id;
  if not (public.coven_is_head(m.id) and public.coven_permission(m.id, 'manage')) then
    raise exception 'Only the head of % decides who founds its daughter covens.', m.name;
  end if;

  if not p_approve then
    update public.coven_daughter_requests set status = 'declined', decided_by = auth.uid(), decision_note = nullif(btrim(p_note), ''), decided_at = now()
    where id = req.id returning * into req;
    perform public.coven_log_lineage(m.id, null, 'declined', jsonb_build_object('request_id', req.id, 'name', req.name), p_note);
    return req;
  end if;

  if req.requested_by <> auth.uid() and not exists (select 1 from public.coven_members where coven_id = m.id and user_id = req.requested_by and status = 'active') then
    raise exception 'Whoever asked is no longer a member of %.', m.name;
  end if;
  head := coalesce(p_head, req.requested_by);
  if head <> auth.uid() and not exists (select 1 from public.coven_members where coven_id = m.id and user_id = head and status = 'active') then
    raise exception 'The new coven''s head must be a member of %.', m.name;
  end if;

  perform set_config('coven.lineage_quiet', 'on', true);
  daughter := public.coven_found_daughter(req, head);
  counts := public.coven_copy_founding(m.id, daughter.id, coalesce(p_copy, req.copy), req.requested_by);

  -- The asker's place in the mother coven, as they chose.
  if req.requested_by <> m.founder_id then
    if req.membership = 'visiting' then
      select id into default_rank from public.coven_ranks where coven_id = m.id and is_default limit 1;
      update public.coven_members set rank_id = default_rank, visiting_from = daughter.id
      where coven_id = m.id and user_id = req.requested_by and status = 'active';
    elsif req.membership = 'leave' then
      update public.coven_members set status = 'left' where coven_id = m.id and user_id = req.requested_by and status = 'active';
      update public.coven_advancement_requests set status = 'withdrawn', decided_at = now()
      where coven_id = m.id and user_id = req.requested_by and status = 'pending';
    end if;
  end if;
  perform set_config('coven.lineage_quiet', 'off', true);

  update public.coven_daughter_requests
  set status = 'approved', decided_by = auth.uid(), decision_note = nullif(btrim(p_note), ''), decided_at = now(), head_id = head, daughter_coven_id = daughter.id
  where id = req.id returning * into req;
  perform public.coven_log_lineage(m.id, daughter.id, 'approved', jsonb_build_object('request_id', req.id, 'name', daughter.name, 'head', head, 'copied', counts), p_note);
  perform public.coven_log_lineage(daughter.id, m.id, 'founded', jsonb_build_object('request_id', req.id, 'head', head, 'requested_by', req.requested_by, 'copied', counts));
  return req;
end;
$$;

-- ---------------------------------------------------------------------------
-- Lineage as the screens show it
-- ---------------------------------------------------------------------------

-- For members of the coven or of a coven linked to it (and mother heads and
-- site moderators): its mother and the covens above it, its daughters (a
-- coven's name only to those who may see it), what you may do, and what
-- came from where. Null for anyone else.
create or replace function public.coven_lineage(p_coven uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  c public.covens;
  me uuid := auth.uid();
  insider boolean;
  head boolean;
begin
  select * into c from public.covens where id = p_coven;
  if c.id is null or me is null then return null; end if;
  insider := public.is_coven_member(c.id) or public.is_community_moderator()
    or (c.mother_coven_id is not null and public.is_coven_member(c.mother_coven_id))
    or exists (select 1 from public.covens d where d.mother_coven_id = c.id and public.is_coven_member(d.id));
  if not insider then return null; end if;
  head := public.coven_is_head(c.id) and public.coven_permission(c.id, 'manage');
  return jsonb_build_object(
    'ancestor', public.coven_is_ancestor_head(c.id),
    'member', public.is_coven_member(c.id),
    'hived_at', c.hived_at,
    'mother', case when c.mother_coven_id is null then null else (
      select jsonb_build_object('id', m.id, 'name', case when public.coven_name_visible(m.id) or public.is_coven_member(c.id) then m.name end,
        'slug', case when public.coven_name_visible(m.id) then m.slug end, 'visible', public.coven_name_visible(m.id), 'status', m.status,
        'head', public.coven_head_card(m.id))
      from public.covens m where m.id = c.mother_coven_id) end,
    'above', coalesce((
      select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'slug', case when public.coven_name_visible(x.id) then x.slug end,
        'depth', a.depth, 'head', public.coven_head_card(x.id)) order by a.depth)
      from public.coven_ancestors(c.id) a join public.covens x on x.id = a.coven_id where a.depth > 1
    ), '[]'::jsonb),
    'daughters', coalesce((
      select jsonb_agg(jsonb_build_object('id', d.id, 'name', case when public.coven_name_visible(d.id) then d.name end,
        'slug', case when public.coven_name_visible(d.id) then d.slug end, 'visible', public.coven_name_visible(d.id),
        'hived_at', d.hived_at, 'status', d.status, 'head', public.coven_head_card(d.id)) order by d.hived_at)
      from public.covens d where d.mother_coven_id = c.id
    ), '[]'::jsonb),
    'disclosure', public.coven_disclosure_text(c.id),
    'may_found', public.coven_may_found_daughter(c.id),
    'may_decide', head,
    'pending_requests', case when head then (select count(*) from public.coven_daughter_requests r where r.mother_coven_id = c.id and r.status = 'pending') else 0 end,
    'release_request', (
      select to_jsonb(r) from public.coven_release_requests r
      where r.daughter_coven_id = c.id and r.status = 'pending'
        and (public.coven_permission(c.id, 'manage') or public.coven_is_ancestor_head(c.id))
    ),
    'release_requests', case when head then coalesce((
      select jsonb_agg(to_jsonb(r) || jsonb_build_object('daughter_name', d.name, 'daughter_slug', d.slug))
      from public.coven_release_requests r join public.covens d on d.id = r.daughter_coven_id
      where r.mother_coven_id = c.id and r.status = 'pending'
    ), '[]'::jsonb) else '[]'::jsonb end,
    'copies', case when public.is_coven_member(c.id) then coalesce((
      select jsonb_agg(jsonb_build_object('kind', k.kind, 'item_id', k.item_id, 'from', k.from_coven_name, 'copied_at', k.copied_at, 'pushed_at', k.pushed_at))
      from public.coven_copied_items k where k.coven_id = c.id
    ), '[]'::jsonb) else '[]'::jsonb end,
    'shared', case when public.is_coven_member(c.id) then coalesce((
      select jsonb_agg(jsonb_build_object('kind', s.kind, 'item_id', s.item_id)) from public.coven_shared_with_daughters s where s.coven_id = c.id
    ), '[]'::jsonb) else '[]'::jsonb end
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Sharing with daughters, and the daughters' library
-- ---------------------------------------------------------------------------

create or replace function public.coven_item_title(p_kind text, p_item uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case p_kind
    when 'document' then (select title from public.coven_documents where id = p_item)
    when 'rank' then (select name from public.coven_ranks where id = p_item)
    when 'program' then (select title from public.coven_programs where id = p_item)
    when 'book_section' then (select title from public.coven_grimoire_sections where id = p_item)
    when 'book_page' then (select title from public.coven_grimoire_pages where id = p_item)
    when 'ritual_library' then (select title from public.coven_ritual_library where id = p_item)
    when 'calendar' then 'The practice calendar'
  end;
$$;

-- When it last changed, as far as a daughter needs to know.
create or replace function public.coven_item_changed(p_kind text, p_item uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select case p_kind
    when 'document' then (select updated_at from public.coven_documents where id = p_item)
    when 'rank' then (select updated_at from public.coven_ranks where id = p_item)
    when 'program' then greatest(
      (select updated_at from public.coven_programs where id = p_item),
      (select max(updated_at) from public.coven_program_stages where program_id = p_item),
      (select max(updated_at) from public.coven_program_tasks where program_id = p_item))
    when 'book_section' then greatest(
      (select updated_at from public.coven_grimoire_sections where id = p_item),
      (select max(updated_at) from public.coven_grimoire_pages where section_id = p_item))
    when 'book_page' then greatest(
      (select updated_at from public.coven_grimoire_pages where id = p_item),
      (select max(updated_at) from public.coven_grimoire_blocks where page_id = p_item))
    when 'ritual_library' then (select updated_at from public.coven_ritual_library where id = p_item)
    when 'calendar' then (select updated_at from public.covens where id = p_item)
  end;
$$;

-- Whether this thing belongs to this coven (and, for the Book, may be shared).
create or replace function public.coven_item_of(p_coven uuid, p_kind text, p_item uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case p_kind
    when 'document' then exists (select 1 from public.coven_documents where id = p_item and coven_id = p_coven)
    when 'rank' then exists (select 1 from public.coven_ranks where id = p_item and coven_id = p_coven)
    when 'program' then exists (select 1 from public.coven_programs where id = p_item and coven_id = p_coven)
    when 'book_section' then exists (select 1 from public.coven_grimoire_sections where id = p_item and coven_id = p_coven) and public.coven_book_shareable(p_kind, p_item)
    when 'book_page' then exists (select 1 from public.coven_grimoire_pages where id = p_item and coven_id = p_coven) and public.coven_book_shareable(p_kind, p_item)
    when 'ritual_library' then exists (select 1 from public.coven_ritual_library where id = p_item and coven_id = p_coven)
    when 'calendar' then p_item = p_coven
    else false
  end;
$$;

-- The head marks something "Shared with daughter covens" (or stops sharing it).
create or replace function public.set_coven_shared_with_daughters(p_coven uuid, p_kind text, p_item uuid, p_shared boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.coven_is_head(p_coven) and public.coven_permission(p_coven, 'manage')) then
    raise exception 'Only the coven''s head chooses what it shares with its daughter covens.';
  end if;
  if not public.coven_item_of(p_coven, p_kind, p_item) then
    raise exception 'That can''t be shared. (The records and minutes shelves, and pages kept to some members, stay in the coven.)';
  end if;
  if p_shared then
    insert into public.coven_shared_with_daughters (coven_id, kind, item_id, shared_by) values (p_coven, p_kind, p_item, auth.uid()) on conflict do nothing;
  else
    delete from public.coven_shared_with_daughters where coven_id = p_coven and kind = p_kind and item_id = p_item;
  end if;
  return p_shared;
end;
$$;

-- "From your mother coven": what the mother shares, and the daughter's latest copy of each.
create or replace function public.coven_mother_library(p_daughter uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d public.covens;
begin
  select * into d from public.covens where id = p_daughter;
  if d.id is null or d.mother_coven_id is null then return '[]'::jsonb; end if;
  if not (public.is_coven_member(d.id) or public.is_community_moderator()) then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'kind', s.kind, 'item_id', s.item_id, 'title', public.coven_item_title(s.kind, s.item_id),
      'changed_at', public.coven_item_changed(s.kind, s.item_id), 'shared_at', s.shared_at,
      'copy', (select jsonb_build_object('item_id', k.item_id, 'copied_at', k.copied_at, 'pushed_at', k.pushed_at)
               from public.coven_copied_items k where k.coven_id = d.id and k.kind = s.kind and k.from_item_id = s.item_id
               order by greatest(k.copied_at, coalesce(k.pushed_at, k.copied_at)) desc limit 1)
    ) order by s.kind, public.coven_item_title(s.kind, s.item_id))
    from public.coven_shared_with_daughters s
    where s.coven_id = d.mother_coven_id and public.coven_item_title(s.kind, s.item_id) is not null
  ), '[]'::jsonb);
end;
$$;

-- A daughter's leaders copy something its mother shares (as a new copy; theirs is never changed).
create or replace function public.copy_from_mother_coven(p_daughter uuid, p_kind text, p_item uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.covens;
  made uuid;
begin
  select * into d from public.covens where id = p_daughter;
  if d.id is null or d.mother_coven_id is null then raise exception 'This coven has no mother coven to copy from.'; end if;
  if not (public.coven_permission(d.id, 'manage') and public.coven_in_good_standing(d.id)) then
    raise exception 'Only the coven''s leaders copy things in.';
  end if;
  if not exists (select 1 from public.coven_shared_with_daughters where coven_id = d.mother_coven_id and kind = p_kind and item_id = p_item)
     or not public.coven_item_of(d.mother_coven_id, p_kind, p_item) then
    raise exception 'Your mother coven doesn''t share that with its daughters.';
  end if;
  perform set_config('coven.lineage_quiet', 'on', true);
  made := public.coven_copy_one(p_kind, p_item, d.mother_coven_id, d.id);
  perform set_config('coven.lineage_quiet', 'off', true);
  perform public.coven_log_lineage(d.id, d.mother_coven_id, 'copied', jsonb_build_object('kind', p_kind, 'item_id', made, 'from_item', p_item, 'title', public.coven_item_title(p_kind, p_item)));
  return jsonb_build_object('kind', p_kind, 'item_id', made);
end;
$$;

-- ---------------------------------------------------------------------------
-- The mother head pushes an update over a daughter's copy
-- ---------------------------------------------------------------------------

-- What a push would change, in words the confirmation shows.
create or replace function public.coven_push_preview(p_daughter uuid, p_kind text, p_item uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d public.covens;
  k public.coven_copied_items;
  changes text[] := '{}';
  a jsonb;
  b jsonb;
  n1 integer;
  n2 integer;
  key text;
begin
  select * into d from public.covens where id = p_daughter;
  if d.id is null or d.mother_coven_id is null then raise exception 'That coven isn''t a daughter coven.'; end if;
  if not (public.coven_is_head(d.mother_coven_id) and public.coven_permission(d.mother_coven_id, 'manage')) then
    raise exception 'Only the head of its mother coven can push an update into it.';
  end if;
  if not public.coven_item_of(d.mother_coven_id, p_kind, p_item) then raise exception 'That isn''t the mother coven''s to push.'; end if;
  select * into k from public.coven_copied_items
  where coven_id = d.id and kind = p_kind and from_item_id = p_item
  order by greatest(copied_at, coalesce(pushed_at, copied_at)) desc limit 1;
  if k.id is null or public.coven_item_title(p_kind, k.item_id) is null then
    return jsonb_build_object('has_copy', false, 'title', public.coven_item_title(p_kind, p_item),
      'changes', jsonb_build_array(format('%s has no copy of this yet. It arrives as a new one.', d.name)));
  end if;

  if public.coven_item_title(p_kind, p_item) is distinct from public.coven_item_title(p_kind, k.item_id) then
    changes := changes || format('The name changes from “%s” to “%s”.', public.coven_item_title(p_kind, k.item_id), public.coven_item_title(p_kind, p_item));
  end if;
  if p_kind = 'document' then
    select to_jsonb(x) into a from public.coven_documents x where id = p_item;
    select to_jsonb(x) into b from public.coven_documents x where id = k.item_id;
    if a->>'body' is distinct from b->>'body' then changes := changes || format('Its words change (%s characters now, %s after).', char_length(b->>'body'), char_length(a->>'body')); end if;
    if (b->>'requires_signature')::boolean and (a->>'body' is distinct from b->>'body' or a->>'title' is distinct from b->>'title') then
      changes := changes || 'Members will be asked to sign it again.'::text;
    end if;
  elsif p_kind = 'rank' then
    select to_jsonb(x) into a from public.coven_ranks x where id = p_item;
    select to_jsonb(x) into b from public.coven_ranks x where id = k.item_id;
    for key in select jsonb_object_keys(a) loop
      if key like 'can\_%' and a->key is distinct from b->key then
        changes := changes || format('%s: %s.', replace(substr(key, 5), '_', ' '), case when (a->>key)::boolean then 'given' else 'taken away' end);
      end if;
    end loop;
    if a->>'description' is distinct from b->>'description' then changes := changes || 'Its description changes.'::text; end if;
    if a->>'requirements' is distinct from b->>'requirements' then changes := changes || 'What it asks changes.'::text; end if;
  elsif p_kind = 'program' then
    select count(*) into n1 from public.coven_program_tasks where program_id = k.item_id;
    select count(*) into n2 from public.coven_program_tasks where program_id = p_item;
    changes := changes || format('Stages: %s now, %s after. Tasks: %s now, %s after.',
      (select count(*) from public.coven_program_stages where program_id = k.item_id), (select count(*) from public.coven_program_stages where program_id = p_item), n1, n2);
    select count(*) into n1 from public.coven_program_progress pr
    where pr.program_id = k.item_id and pr.task_id in (
      select t.id from public.coven_program_tasks t join public.coven_program_stages s on s.id = t.stage_id
      where t.program_id = k.item_id
        and (s.position, t.position) not in (select s2.position, t2.position from public.coven_program_tasks t2 join public.coven_program_stages s2 on s2.id = t2.stage_id where t2.program_id = p_item));
    if n1 > 0 then changes := changes || format('%s records of members'' work on tasks that go would be lost.', n1); end if;
    changes := changes || 'Members'' progress on the tasks that stay is kept.'::text;
  elsif p_kind = 'book_page' then
    changes := changes || format('Its parts: %s now, %s after. The page as it is now is kept in its history.',
      (select count(*) from public.coven_grimoire_blocks where page_id = k.item_id), (select count(*) from public.coven_grimoire_blocks where page_id = p_item));
  elsif p_kind = 'book_section' then
    changes := changes || format('%s pages from the mother coven are updated or added. Pages %s added itself stay.',
      (select count(*) from public.coven_grimoire_pages where section_id = p_item), d.name);
  elsif p_kind = 'ritual_library' then
    changes := changes || 'Its steps and roles are replaced with the mother coven''s (with no one named).'::text;
  elsif p_kind = 'calendar' then
    changes := changes || format('The holidays it keeps become the mother coven''s (%s).',
      coalesce((select array_to_string(practice_traditions, ', ') from public.covens where id = p_item), 'none'));
  end if;
  if cardinality(changes) = 0 then changes := array['Nothing differs from the copy they have.']; end if;
  return jsonb_build_object('has_copy', true, 'copy_id', k.item_id, 'title', public.coven_item_title(p_kind, p_item), 'changes', to_jsonb(changes));
end;
$$;

create or replace function public.push_to_daughter_coven(p_daughter uuid, p_kind text, p_item uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.covens;
  preview jsonb := public.coven_push_preview(p_daughter, p_kind, p_item);
  target uuid := nullif(preview->>'copy_id', '')::uuid;
  src jsonb;
  pg record;
  page_copy uuid;
  event uuid;
begin
  select * into d from public.covens where id = p_daughter;
  perform set_config('coven.lineage_quiet', 'on', true);
  if target is null then
    target := public.coven_copy_one(p_kind, p_item, d.mother_coven_id, d.id);
  elsif p_kind = 'document' then
    update public.coven_documents x set title = s.title, body = s.body from public.coven_documents s where s.id = p_item and x.id = target;
  elsif p_kind = 'rank' then
    select public.coven_strip_refs(to_jsonb(r), array['id']) into src from public.coven_ranks r where r.id = p_item;
    -- Its opening stays the daughter's own (open or not, closing date, note).
    perform set_config('coven.copying', 'on', true);
    perform public.coven_overwrite_row('coven_ranks', target, src, array['id', 'coven_id', 'created_at', 'is_default', 'level', 'open_to_applications',
      'applications_open', 'applications_close_at', 'opening_note', 'opened_at', 'requirement_items']);
    update public.coven_ranks set requirement_items = public.coven_remap_requirements(d.id, src->'requirement_items') where id = target;
    perform set_config('coven.copying', 'off', true);
  elsif p_kind = 'program' then
    select public.coven_strip_refs(to_jsonb(r), array['id']) into src from public.coven_programs r where r.id = p_item;
    perform public.coven_overwrite_row('coven_programs', target, src || jsonb_build_object('updated_at', now()),
      array['id', 'coven_id', 'created_at', 'status', 'award_rank_id', 'created_by', 'position', 'self_enroll']);
    perform public.coven_program_body(p_item, target);
  elsif p_kind = 'book_page' then
    perform public.coven_copy_book_page(p_item, d.id, null, target);
  elsif p_kind = 'book_section' then
    update public.coven_grimoire_sections x set title = s.title, updated_at = now() from public.coven_grimoire_sections s where s.id = p_item and x.id = target;
    for pg in select id from public.coven_grimoire_pages where section_id = p_item order by sort_order loop
      continue when not public.coven_book_shareable('book_page', pg.id);
      select k.item_id into page_copy from public.coven_copied_items k
      join public.coven_grimoire_pages p on p.id = k.item_id
      where k.coven_id = d.id and k.kind = 'book_page' and k.from_item_id = pg.id order by k.copied_at desc limit 1;
      if page_copy is null then
        perform public.coven_copy_book_page(pg.id, d.id, target);
      else
        perform public.coven_copy_book_page(pg.id, d.id, null, page_copy);
      end if;
      page_copy := null;
    end loop;
  elsif p_kind = 'ritual_library' then
    update public.coven_ritual_library x set title = s.title, body = coalesce(public.coven_scrub_people(s.body), '{}'::jsonb), updated_by = auth.uid(), updated_at = now()
    from public.coven_ritual_library s where s.id = p_item and x.id = target;
  elsif p_kind = 'calendar' then
    perform public.coven_copy_calendar(d.mother_coven_id, d.id);
  end if;
  update public.coven_copied_items set pushed_at = now() where coven_id = d.id and kind = p_kind and item_id = target;
  perform set_config('coven.lineage_quiet', 'off', true);
  event := public.coven_log_lineage(d.id, d.mother_coven_id, 'pushed',
    jsonb_build_object('kind', p_kind, 'item_id', target, 'from_item', p_item, 'title', preview->>'title', 'changes', preview->'changes'));
  return jsonb_build_object('kind', p_kind, 'item_id', target, 'event_id', event);
end;
$$;

-- ---------------------------------------------------------------------------
-- Releasing a daughter
-- ---------------------------------------------------------------------------

create or replace function public.coven_release(p_daughter uuid, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.covens;
  mother uuid;
begin
  select * into d from public.covens where id = p_daughter for update;
  mother := d.mother_coven_id;
  perform set_config('coven.lineage_quiet', 'on', true);
  update public.covens set mother_coven_id = null where id = d.id;
  update public.coven_members set visiting_from = null where visiting_from = d.id and coven_id = mother;
  perform set_config('coven.lineage_quiet', 'off', true);
  update public.coven_release_requests set status = 'approved', decided_by = auth.uid(), decided_at = now()
  where daughter_coven_id = d.id and status = 'pending';
  perform public.coven_log_lineage(d.id, mother, 'released', '{}'::jsonb, p_note);
  perform public.coven_log_lineage(mother, d.id, 'released', '{"side": "mother"}'::jsonb, p_note);
end;
$$;

-- Only a mother coven's head (or a site moderator, for safeguarding) releases a daughter.
create or replace function public.release_daughter_coven(p_daughter uuid, p_note text default null)
returns public.covens
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.covens;
begin
  select * into d from public.covens where id = p_daughter;
  if d.id is null or d.mother_coven_id is null then raise exception 'That coven isn''t a daughter coven.'; end if;
  if not ((public.coven_is_ancestor_head(d.id) and public.coven_permission(d.mother_coven_id, 'manage')) or public.is_community_moderator()) then
    raise exception 'Only the head of its mother coven can release a daughter coven.';
  end if;
  perform public.coven_release(d.id, p_note);
  select * into d from public.covens where id = p_daughter;
  return d;
end;
$$;

create or replace function public.ask_to_release_daughter_coven(p_daughter uuid, p_note text default null)
returns public.coven_release_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.covens;
  made public.coven_release_requests;
begin
  select * into d from public.covens where id = p_daughter;
  if d.id is null or d.mother_coven_id is null then raise exception 'That coven isn''t a daughter coven.'; end if;
  if d.founder_id is distinct from auth.uid() or not public.coven_permission(d.id, 'manage') then
    raise exception 'Only the coven''s own head can ask for it to be released.';
  end if;
  if exists (select 1 from public.coven_release_requests where daughter_coven_id = d.id and status = 'pending') then
    raise exception 'Your request is already waiting for the head of your mother coven.';
  end if;
  insert into public.coven_release_requests (daughter_coven_id, mother_coven_id, requested_by, note)
  values (d.id, d.mother_coven_id, auth.uid(), nullif(btrim(p_note), ''))
  returning * into made;
  perform public.coven_log_lineage(d.id, d.mother_coven_id, 'release_requested', jsonb_build_object('request_id', made.id), p_note);
  perform public.coven_log_lineage(d.mother_coven_id, d.id, 'release_requested', jsonb_build_object('request_id', made.id, 'side', 'mother'), p_note);
  return made;
end;
$$;

create or replace function public.decide_release_request(p_request uuid, p_approve boolean, p_note text default null)
returns public.coven_release_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_release_requests;
begin
  select * into r from public.coven_release_requests where id = p_request for update;
  if r.id is null then raise exception 'That request was not found.'; end if;
  if r.status <> 'pending' then raise exception 'That request has already been decided.'; end if;
  if r.requested_by = auth.uid() and not p_approve then
    update public.coven_release_requests set status = 'withdrawn', decided_at = now() where id = r.id returning * into r;
    return r;
  end if;
  if not (public.coven_is_ancestor_head(r.daughter_coven_id) and public.coven_permission(r.mother_coven_id, 'manage')) then
    raise exception 'Only the head of the mother coven decides.';
  end if;
  if p_approve then
    perform public.coven_release(r.daughter_coven_id, p_note);
  else
    update public.coven_release_requests set status = 'declined', decided_by = auth.uid(), decision_note = nullif(btrim(p_note), ''), decided_at = now() where id = r.id;
    perform public.coven_log_lineage(r.daughter_coven_id, r.mother_coven_id, 'release_declined', jsonb_build_object('request_id', r.id), p_note);
  end if;
  select * into r from public.coven_release_requests where id = p_request;
  return r;
end;
$$;

-- ---------------------------------------------------------------------------
-- What a mother coven's head changes in a daughter is kept in its log
-- ---------------------------------------------------------------------------

create or replace function public.coven_log_ancestor_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  cid uuid;
  rid text;
  label text;
  info jsonb;
begin
  if me is null or public.coven_quiet() then return null; end if;
  cid := case when tg_table_name = 'covens' then (rec->>'id')::uuid else (rec->>'coven_id')::uuid end;
  if cid is null or not public.coven_is_ancestor_head(cid, me) then return null; end if;
  if exists (select 1 from public.covens where id = cid and founder_id = me) then return null; end if;
  rid := coalesce(rec->>'id', rec->>'user_id', rec->>'coven_id');
  label := coalesce(rec->>'title', rec->>'name',
    case when tg_table_name = 'coven_members' then (select display_name from public.coven_profiles where user_id = (rec->>'user_id')::uuid) end,
    case when tg_table_name in ('coven_applications', 'coven_advancement_requests') then (select display_name from public.coven_profiles where user_id = (rec->>'user_id')::uuid) end);
  info := jsonb_build_object('table', tg_table_name, 'op', lower(tg_op), 'row', rid, 'label', label,
    'status', case when tg_table_name in ('coven_members', 'coven_applications', 'coven_advancement_requests', 'covens') then rec->>'status' end);
  -- One line per thing per sitting (twenty minutes).
  update public.coven_lineage_events set detail = info, created_at = now(), notified_at = null
  where coven_id = cid and event = 'override' and actor = me and detail->>'table' = tg_table_name and detail->>'row' is not distinct from rid
    and created_at > now() - interval '20 minutes';
  if not found then
    insert into public.coven_lineage_events (coven_id, other_coven_id, other_coven_name, event, actor, detail)
    select cid, a.coven_id, c.name, 'override', me, info
    from public.coven_ancestors(cid) a join public.covens c on c.id = a.coven_id
    where c.founder_id = me order by a.depth limit 1;
  end if;
  return null;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['covens', 'coven_ranks', 'coven_members', 'coven_documents', 'coven_applications', 'coven_advancement_requests',
                           'coven_programs', 'coven_rituals', 'coven_grimoire_pages', 'coven_ritual_library', 'coven_succession',
                           'coven_program_documents', 'coven_program_quizzes'] loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('drop trigger if exists %I on public.%I', t || '_mother_log', t);
      execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.coven_log_ancestor_change()', t || '_mother_log', t);
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Leadership
-- ---------------------------------------------------------------------------

-- Hand a coven to an active member (no checks of who may; the callers check).
-- The new head takes the leading position. The old head ('keep'): Elder if
-- the coven has it, else their own position without the power to lead (a
-- copy of it, when it leads); or ('step_down') a position chosen for them
-- that doesn't lead. Never two people both leading.
create or replace function public.coven_hand_on(p_coven uuid, p_to uuid, p_old text, p_old_rank uuid, p_event text, p_actor uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
  old_head uuid;
  old_member public.coven_members;
  old_rank public.coven_ranks;
  lead_rank uuid;
  target public.coven_ranks;
  made uuid;
  src jsonb;
  event uuid;
begin
  select * into c from public.covens where id = p_coven for update;
  if c.id is null then raise exception 'That coven was not found.'; end if;
  if not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_to and status = 'active') then
    raise exception 'The new head must be an active member.';
  end if;
  if p_old not in ('keep', 'step_down') then raise exception 'Choose what happens to the head who steps back.'; end if;
  old_head := c.founder_id;
  if old_head = p_to then raise exception 'They already lead the coven.'; end if;
  select * into old_member from public.coven_members where coven_id = p_coven and user_id = old_head and status = 'active';
  select * into old_rank from public.coven_ranks where id = old_member.rank_id;
  if p_old = 'step_down' then
    select * into target from public.coven_ranks where id = p_old_rank and coven_id = p_coven;
    if target.id is null then raise exception 'Choose a position of this coven.'; end if;
    if target.can_manage then raise exception 'Choose a position that doesn''t lead the coven. The new head can give more later.'; end if;
    if target.id is distinct from old_member.rank_id then
      perform public.coven_rank_take_seat(target.id);
    end if;
  end if;

  lead_rank := case when old_rank.can_manage then old_rank.id
    else (select id from public.coven_ranks where coven_id = p_coven and can_manage order by level desc limit 1) end;

  perform set_config('coven.lineage_quiet', 'on', true);
  update public.covens set founder_id = p_to where id = p_coven;
  if lead_rank is not null then
    update public.coven_members set rank_id = lead_rank, visiting_from = null where coven_id = p_coven and user_id = p_to;
  end if;

  if old_member.user_id is not null then
    if p_old = 'step_down' then
      update public.coven_members set rank_id = target.id where coven_id = p_coven and user_id = old_head;
    elsif old_rank.id is not null and old_rank.can_manage then
      select * into target from public.coven_ranks where coven_id = p_coven and lower(btrim(name)) = 'elder' and not can_manage order by level desc limit 1;
      -- Elder, unless all its places are taken (open positions' seat_limit).
      if target.id is not null and target.seat_limit is not null and public.coven_rank_holder_count(target.id) >= target.seat_limit then
        target := null;
      end if;
      if target.id is not null then
        update public.coven_members set rank_id = target.id where coven_id = p_coven and user_id = old_head;
      else
        -- Their own position, without the power to lead the coven.
        made := gen_random_uuid();
        perform set_config('coven.copying', 'on', true);
        src := to_jsonb(old_rank) || jsonb_build_object('id', made, 'can_manage', false, 'is_default', false, 'open_to_applications', false,
          'applications_open', false, 'seat_limit', null, 'applications_close_at', null, 'opening_note', null, 'opened_at', null,
          'level', greatest(1, least(99, old_rank.level - 1)), 'created_at', now(), 'updated_at', now(),
          'description', left(coalesce(old_rank.description || ' ', '') || 'Stepped back from leading the coven.', 1000));
        insert into public.coven_ranks select * from jsonb_populate_record(null::public.coven_ranks, src);
        perform set_config('coven.copying', 'off', true);
        update public.coven_members set rank_id = made where coven_id = p_coven and user_id = old_head;
      end if;
    end if;
  end if;

  -- The plan moves up: whoever now leads leaves it.
  update public.coven_succession
  set successor_id = case when successor_id = p_to then second_id else successor_id end,
      second_id = case when successor_id = p_to or second_id = p_to then null else second_id end,
      updated_at = now()
  where coven_id = p_coven and (successor_id = p_to or second_id = p_to);
  perform set_config('coven.lineage_quiet', 'off', true);

  update public.coven_head_reports set status = 'transferred', resolved_by = p_actor, resolved_at = now()
  where coven_id = p_coven and status = 'open';

  insert into public.coven_leadership_events (coven_id, event, from_user, to_user, actor, detail)
  values (p_coven, p_event, old_head, p_to, p_actor, jsonb_build_object('old_head', p_old))
  returning id into event;
  return event;
end;
$$;

-- Hand on leadership: the head, a mother coven's head (appointing the
-- daughter's head), or a site moderator.
create or replace function public.hand_on_coven(p_coven uuid, p_user uuid, p_old text default 'keep', p_old_rank uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
  kind text;
  event uuid;
begin
  select * into c from public.covens where id = p_coven;
  if c.id is null then raise exception 'That coven was not found.'; end if;
  if c.founder_id = auth.uid() then kind := 'handed_on';
  elsif public.coven_is_ancestor_head(p_coven) then kind := 'appointed_by_mother';
  elsif public.is_community_moderator() then kind := 'moderator_transfer';
  else raise exception 'Only the coven''s head, the head of its mother coven, or a site moderator can hand on a coven.';
  end if;
  event := public.coven_hand_on(p_coven, p_user, coalesce(p_old, 'keep'), p_old_rank, kind, auth.uid());
  if kind = 'appointed_by_mother' then
    perform public.coven_log_lineage(p_coven, c.mother_coven_id, 'head_appointed', jsonb_build_object('from', c.founder_id, 'to', p_user, 'leadership_event', event));
  end if;
  return jsonb_build_object('coven_id', p_coven, 'event_id', event, 'kind', kind);
end;
$$;

-- The old way in: the head who hands on steps back from leading (the fix),
-- keeping their position without its leading power, or Elder.
create or replace function public.transfer_coven(p_coven uuid, p_user uuid)
returns public.covens
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
begin
  perform public.hand_on_coven(p_coven, p_user, 'keep', null);
  select * into c from public.covens where id = p_coven;
  return c;
end;
$$;

-- The succession plan: the head (or a mother coven's head) names a successor and a second.
create or replace function public.set_coven_successors(p_coven uuid, p_first uuid, p_second uuid default null)
returns public.coven_succession
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
  saved public.coven_succession;
begin
  select * into c from public.covens where id = p_coven;
  if c.id is null then raise exception 'That coven was not found.'; end if;
  if not (public.coven_is_head(p_coven) and public.coven_permission(p_coven, 'manage')) then
    raise exception 'Only the coven''s head names its successor.';
  end if;
  if p_first is not null and p_first = p_second then raise exception 'Choose two different people.'; end if;
  if p_first = c.founder_id or p_second = c.founder_id then raise exception 'The head can''t succeed themselves.'; end if;
  if (p_first is not null and not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_first and status = 'active'))
     or (p_second is not null and not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = p_second and status = 'active')) then
    raise exception 'A successor must be an active member of the coven.';
  end if;
  insert into public.coven_succession (coven_id, successor_id, second_id, set_by, updated_at)
  values (p_coven, p_first, case when p_first is null then null else p_second end, auth.uid(), now())
  on conflict (coven_id) do update set successor_id = excluded.successor_id, second_id = excluded.second_id, set_by = excluded.set_by, updated_at = now()
  returning * into saved;
  if p_first is not null then
    insert into public.coven_leadership_events (coven_id, event, to_user, actor, detail)
    values (p_coven, 'successor_named', p_first, auth.uid(), jsonb_build_object('second', saved.second_id));
  end if;
  return saved;
end;
$$;

-- When the head was last seen: their last message in the coven, or signing in.
create or replace function public.coven_head_last_active(p_coven uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public, auth
as $$
  select greatest(
    (select max(m.created_at) from public.coven_messages m join public.covens c on c.id = m.coven_id where m.coven_id = p_coven and m.user_id = c.founder_id),
    (select nullif(to_jsonb(u)->>'last_sign_in_at', '')::timestamptz from auth.users u join public.covens c on c.founder_id = u.id where c.id = p_coven)
  );
$$;

-- An Elder (anyone who reviews or keeps the gathering safe) tells the site moderators the head can't be reached.
create or replace function public.report_coven_head_unreachable(p_coven uuid, p_note text default null)
returns public.coven_head_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.covens;
  made public.coven_head_reports;
begin
  perform public.coven_require_profile();
  select * into c from public.covens where id = p_coven;
  if c.id is null then raise exception 'That coven was not found.'; end if;
  if c.founder_id = auth.uid() or public.coven_is_ancestor_head(p_coven) then raise exception 'You lead this coven.'; end if;
  if not (exists (select 1 from public.coven_members where coven_id = p_coven and user_id = auth.uid() and status = 'active')
          and (public.coven_permission(p_coven, 'review') or public.coven_permission(p_coven, 'moderate'))) then
    raise exception 'Only the coven''s elders (those who review or keep the gathering safe) can send this.';
  end if;
  if char_length(btrim(coalesce(p_note, ''))) > 2000 then raise exception 'Keep the note to 2,000 characters.'; end if;
  if exists (select 1 from public.coven_head_reports where coven_id = p_coven and status = 'open') then
    raise exception 'The site moderators already have this. They''ll look at it soon.';
  end if;
  insert into public.coven_head_reports (coven_id, reported_by, head_id, note, last_active_at)
  values (p_coven, auth.uid(), c.founder_id, nullif(btrim(p_note), ''), public.coven_head_last_active(p_coven))
  returning * into made;
  insert into public.coven_leadership_events (coven_id, event, from_user, actor, detail)
  values (p_coven, 'head_reported', c.founder_id, auth.uid(), jsonb_build_object('report_id', made.id));
  return made;
end;
$$;

-- The site moderators' queue: each coven, its head, how long since they were
-- seen, and its succession plan.
create or replace function public.coven_head_reports_queue()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_community_moderator() then raise exception 'Only site moderators can do that.'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id, 'status', r.status, 'note', r.note, 'created_at', r.created_at, 'last_active_at', coalesce(public.coven_head_last_active(c.id), r.last_active_at),
      'coven', jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'status', c.status,
        'members', (select count(*) from public.coven_members m where m.coven_id = c.id and m.status = 'active'),
        'mother', (select jsonb_build_object('name', m.name, 'slug', m.slug) from public.covens m where m.id = c.mother_coven_id)),
      'head', jsonb_build_object('id', c.founder_id, 'name', (select display_name from public.coven_profiles where user_id = c.founder_id)),
      'reported_by', jsonb_build_object('id', r.reported_by, 'name', (select display_name from public.coven_profiles where user_id = r.reported_by)),
      'successors', coalesce((
        select jsonb_agg(jsonb_build_object('id', x.id, 'which', x.which, 'name', (select display_name from public.coven_profiles where user_id = x.id),
          'active', exists (select 1 from public.coven_members m where m.coven_id = c.id and m.user_id = x.id and m.status = 'active')) order by x.which)
        from public.coven_succession s, lateral (values (s.successor_id, 1), (s.second_id, 2)) as x(id, which)
        where s.coven_id = c.id and x.id is not null
      ), '[]'::jsonb),
      'leaders', coalesce((
        select jsonb_agg(jsonb_build_object('id', m.user_id, 'name', p.display_name, 'position', k.name) order by k.level desc, m.joined_at)
        from public.coven_members m join public.coven_ranks k on k.id = m.rank_id left join public.coven_profiles p on p.user_id = m.user_id
        where m.coven_id = c.id and m.status = 'active' and m.user_id is distinct from c.founder_id and (k.can_manage or k.can_review or k.can_moderate)
      ), '[]'::jsonb)
    ) order by r.created_at desc)
    from public.coven_head_reports r join public.covens c on c.id = r.coven_id
    where r.status = 'open' or r.resolved_at > now() - interval '30 days'
  ), '[]'::jsonb);
end;
$$;

-- Site moderators decide: hand the coven to someone (usually the named successor), or close the report.
create or replace function public.resolve_coven_head_report(p_report uuid, p_transfer_to uuid default null, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_head_reports;
  event uuid;
begin
  if not public.is_community_moderator() then raise exception 'Only site moderators can do that.'; end if;
  select * into r from public.coven_head_reports where id = p_report for update;
  if r.id is null then raise exception 'That report was not found.'; end if;
  if r.status <> 'open' then raise exception 'That report has already been settled.'; end if;
  if p_transfer_to is not null then
    event := public.coven_hand_on(r.coven_id, p_transfer_to, 'keep', null, 'moderator_transfer', auth.uid());
  end if;
  update public.coven_head_reports
  set status = case when p_transfer_to is null then 'dismissed' else 'transferred' end,
      resolved_by = auth.uid(), resolution_note = nullif(btrim(p_note), ''), resolved_at = now()
  where id = r.id;
  return jsonb_build_object('report_id', r.id, 'event_id', event);
end;
$$;

-- For the delete-account function (service role only): each coven the person
-- leads goes to their named successor, else their second, else the most
-- senior active member in a leading position; with no one, it's archived and
-- its members are told.
create or replace function public.coven_hand_on_departing(p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  next_head uuid;
  event uuid;
  out jsonb := '[]'::jsonb;
begin
  for c in select * from public.covens where founder_id = p_user and status in ('active', 'suspended') loop
    select x.id into next_head
    from public.coven_succession s, lateral (values (s.successor_id, 1), (s.second_id, 2)) as x(id, which)
    where s.coven_id = c.id and x.id is not null and x.id <> p_user
      and exists (select 1 from public.coven_members m where m.coven_id = c.id and m.user_id = x.id and m.status = 'active')
      and not public.is_community_banned(x.id)
    order by x.which limit 1;
    if next_head is null then
      select m.user_id into next_head
      from public.coven_members m join public.coven_ranks k on k.id = m.rank_id
      where m.coven_id = c.id and m.status = 'active' and m.user_id <> p_user and k.can_manage and not public.is_community_banned(m.user_id)
      order by k.level desc, m.joined_at limit 1;
    end if;
    if next_head is not null then
      event := public.coven_hand_on(c.id, next_head, 'keep', null, 'account_transfer', null);
      out := out || jsonb_build_array(jsonb_build_object('coven_id', c.id, 'outcome', 'transferred', 'to_user', next_head, 'event_id', event));
    else
      perform set_config('coven.lineage_quiet', 'on', true);
      update public.covens set status = 'archived', moderation_note = 'Archived when its head closed their account and no one was named to lead it.' where id = c.id;
      perform set_config('coven.lineage_quiet', 'off', true);
      insert into public.coven_leadership_events (coven_id, event, from_user, actor)
      values (c.id, 'archived_no_head', p_user, null) returning id into event;
      out := out || jsonb_build_array(jsonb_build_object('coven_id', c.id, 'outcome', 'archived', 'event_id', event));
    end if;
    next_head := null;
  end loop;
  return out;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

-- Internal: only other functions (and the service role) use these.
revoke execute on function
  public.coven_log_lineage(uuid, uuid, text, jsonb, text, uuid),
  public.coven_strip_refs(jsonb, text[]),
  public.coven_scrub_people(jsonb, jsonb),
  public.coven_overwrite_row(text, uuid, jsonb, text[]),
  public.coven_note_copy(uuid, text, uuid, uuid, uuid),
  public.coven_copy_course_extras(uuid, uuid, jsonb),
  public.coven_copied_id(uuid, text, uuid),
  public.coven_remap_requirements(uuid, jsonb, boolean),
  public.coven_remap_copied_ranks(uuid),
  public.coven_copy_document(uuid, uuid),
  public.coven_copy_rank(uuid, uuid, boolean),
  public.coven_program_body(uuid, uuid),
  public.coven_copy_program(uuid, uuid, jsonb),
  public.coven_book_of(uuid),
  public.coven_copy_book_page(uuid, uuid, uuid, uuid),
  public.coven_copy_book_section(uuid, uuid),
  public.coven_copy_library(uuid, uuid, jsonb),
  public.coven_copy_calendar(uuid, uuid),
  public.coven_copy_one(text, uuid, uuid, uuid),
  public.coven_copy_founding(uuid, uuid, jsonb, uuid),
  public.coven_found_daughter(public.coven_daughter_requests, uuid),
  public.coven_release(uuid, text),
  public.coven_hand_on(uuid, uuid, text, uuid, text, uuid),
  public.coven_hand_on_departing(uuid),
  public.coven_head_last_active(uuid)
from public, anon, authenticated;
grant execute on function public.coven_hand_on_departing(uuid) to service_role;

revoke execute on function
  public.coven_name_visible(uuid), public.coven_head_card(uuid), public.coven_disclosure_text(uuid), public.coven_book_shareable(text, uuid),
  public.coven_item_title(text, uuid), public.coven_item_changed(text, uuid), public.coven_item_of(uuid, text, uuid),
  public.coven_may_found_daughter(uuid), public.set_coven_daughter_founder(uuid, uuid, boolean),
  public.request_daughter_coven(uuid, jsonb, jsonb, text, text), public.withdraw_daughter_request(uuid),
  public.decide_daughter_request(uuid, boolean, text, uuid, jsonb), public.coven_lineage(uuid),
  public.set_coven_shared_with_daughters(uuid, text, uuid, boolean), public.coven_mother_library(uuid),
  public.copy_from_mother_coven(uuid, text, uuid), public.coven_push_preview(uuid, text, uuid), public.push_to_daughter_coven(uuid, text, uuid),
  public.release_daughter_coven(uuid, text), public.ask_to_release_daughter_coven(uuid, text), public.decide_release_request(uuid, boolean, text),
  public.hand_on_coven(uuid, uuid, text, uuid), public.set_coven_successors(uuid, uuid, uuid),
  public.report_coven_head_unreachable(uuid, text), public.coven_head_reports_queue(), public.resolve_coven_head_report(uuid, uuid, text)
from public, anon;
grant execute on function
  public.coven_name_visible(uuid), public.coven_head_card(uuid), public.coven_disclosure_text(uuid), public.coven_book_shareable(text, uuid),
  public.coven_item_title(text, uuid), public.coven_item_changed(text, uuid), public.coven_item_of(uuid, text, uuid),
  public.coven_may_found_daughter(uuid), public.set_coven_daughter_founder(uuid, uuid, boolean),
  public.request_daughter_coven(uuid, jsonb, jsonb, text, text), public.withdraw_daughter_request(uuid),
  public.decide_daughter_request(uuid, boolean, text, uuid, jsonb), public.coven_lineage(uuid),
  public.set_coven_shared_with_daughters(uuid, text, uuid, boolean), public.coven_mother_library(uuid),
  public.copy_from_mother_coven(uuid, text, uuid), public.coven_push_preview(uuid, text, uuid), public.push_to_daughter_coven(uuid, text, uuid),
  public.release_daughter_coven(uuid, text), public.ask_to_release_daughter_coven(uuid, text), public.decide_release_request(uuid, boolean, text),
  public.hand_on_coven(uuid, uuid, text, uuid), public.set_coven_successors(uuid, uuid, uuid),
  public.report_coven_head_unreachable(uuid, text), public.coven_head_reports_queue(), public.resolve_coven_head_report(uuid, uuid, text)
to authenticated;
