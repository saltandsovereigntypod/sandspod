-- Applied to sandspod-dev on 2026-10-23 (by SQL, in parts).
-- Coven rites on the calendar, altar actions in ritual steps, the coven's
-- Book of Shadows, and petitions the circle holds for each other.
--
-- * Rites: a ritual can be marked as an esbat, a full or new moon, a sabbat
--   or another occasion. Putting a rite on the coven's calendar is for those
--   the coven's head allows (can_schedule_rites); other ritual leaders plan
--   drafts. Members answer going / maybe / not going.
-- * Altar actions: any step can carry one (light a candle, place something,
--   light every candle, put the candles out). When the ritual reaches the
--   step, whoever the step belongs to performs it on the shared altar; on a
--   whole-coven "light a candle" step each member lights their own, and the
--   candles gather in a circle.
-- * Book of Shadows: those allowed to write (can_write_book) draft pages and
--   changes; those allowed to approve (can_approve_book) publish them.
--   Members read published pages only.
-- * Petitions: a member asks the circle to hold one; a candle is set for it
--   on the shared altar, and members tend it (relighting it), as often as
--   twice a day each. The asker marks it answered or closes it.
-- Everything changes through the functions below.

alter table public.coven_ranks add column if not exists can_schedule_rites boolean not null default false;
alter table public.coven_ranks add column if not exists can_write_book boolean not null default false;
alter table public.coven_ranks add column if not exists can_approve_book boolean not null default false;

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
          when 'write_book' then coalesce(r.can_write_book or r.can_approve_book or r.can_manage, false)
          when 'approve_book' then coalesce(r.can_approve_book or r.can_manage, false)
          else false
        end
      )
  );
$$;

-- Reports can name the new things too.
alter table public.coven_reports drop constraint if exists coven_reports_target_type_check;
alter table public.coven_reports add constraint coven_reports_target_type_check
  check (target_type in ('coven', 'message', 'member', 'application', 'altar_item', 'document', 'ritual', 'book_page', 'petition'));

-- ---------------------------------------------------------------------------
-- Rites and altar actions
-- ---------------------------------------------------------------------------

alter table public.coven_rituals add column if not exists occasion text
  check (occasion is null or occasion in ('esbat', 'full_moon', 'new_moon', 'sabbat', 'other'));
alter table public.coven_rituals add column if not exists occasion_name text
  check (occasion_name is null or char_length(occasion_name) <= 80);

alter table public.coven_ritual_steps add column if not exists altar_action text
  check (altar_action is null or altar_action in ('light_candle', 'place_item', 'light_all', 'snuff_all'));
alter table public.coven_ritual_steps add column if not exists altar_color text
  check (altar_color is null or altar_color in ('white', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'magenta', 'brown', 'grey', 'silver', 'gold', 'rainbow'));
alter table public.coven_ritual_steps add column if not exists altar_form text
  check (altar_form is null or altar_form in ('vigil', 'taper', 'pillar', 'votive', 'chime', 'tea-light'));
alter table public.coven_ritual_steps add column if not exists altar_image text
  check (altar_image is null or (altar_image ~ '^(\.\./|/)assets/altar/[A-Za-z0-9/_.-]+\.(png|PNG|jpg|jpeg|webp)$' and altar_image !~ '\.\./.*\.\./'));
alter table public.coven_ritual_steps add column if not exists altar_label text
  check (altar_label is null or char_length(altar_label) <= 80);

create table if not exists public.coven_ritual_rsvps (
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  response text not null check (response in ('going', 'maybe', 'not_going')),
  updated_at timestamptz not null default now(),
  primary key (ritual_id, user_id)
);

-- Who has already done a step's altar action (so each lights one candle).
create table if not exists public.coven_ritual_step_marks (
  step_id uuid not null references public.coven_ritual_steps (id) on delete cascade,
  ritual_id uuid not null references public.coven_rituals (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid references public.coven_altar_items (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (step_id, user_id)
);

alter table public.coven_ritual_rsvps enable row level security;
alter table public.coven_ritual_step_marks enable row level security;

create policy "Members and moderators see RSVPs" on public.coven_ritual_rsvps
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
create policy "Members and moderators see altar marks" on public.coven_ritual_step_marks
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

-- A candle picture, as the coven pages build it (CovenLogic.candleImage).
create or replace function public.coven_candle_image(p_color text, p_form text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(p_form, 'vigil') = 'vigil'
      then '/assets/altar/objects/candles/' || coalesce(p_color, 'white') || '-candle.'
           || case when coalesce(p_color, 'white') in ('black', 'white') then 'PNG' else 'png' end
    else '/assets/altar/objects/candles/' || p_form || '/' || coalesce(p_color, 'white') || '-' || p_form || '.png'
  end;
$$;

-- Answer a rite: going, maybe, not going (or null to take the answer back).
create or replace function public.rsvp_coven_ritual(p_ritual uuid, p_response text)
returns public.coven_ritual_rsvps
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals;
  saved public.coven_ritual_rsvps;
begin
  select * into r from public.coven_rituals where id = p_ritual;
  if r.id is null or r.status not in ('scheduled', 'live') then raise exception 'That rite isn''t on the calendar.'; end if;
  if not public.coven_permission(r.coven_id, 'member') then raise exception 'Only members can answer.'; end if;
  if p_response is null then
    perform public.coven_rsvp_clear(p_ritual);
    return null;
  end if;
  if p_response not in ('going', 'maybe', 'not_going') then raise exception 'Answer going, maybe or not going.'; end if;
  insert into public.coven_ritual_rsvps (ritual_id, coven_id, user_id, response, updated_at)
  values (p_ritual, r.coven_id, auth.uid(), p_response, now())
  on conflict (ritual_id, user_id) do update set response = excluded.response, updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

create or replace function public.coven_rsvp_clear(p_ritual uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.coven_ritual_rsvps where ritual_id = p_ritual and user_id = auth.uid();
$$;

-- The planner, now with occasions, altar actions, and the calendar rule.
create or replace function public.save_coven_ritual(p_coven uuid, p_ritual_id uuid, p_ritual jsonb, p_steps jsonb)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.coven_rituals;
  step jsonb;
  n integer := 0;
  kept uuid[] := '{}';
  step_id uuid;
  person uuid;
  rank uuid;
  next_status text := coalesce(p_ritual->>'status', 'scheduled');
  next_when timestamptz := nullif(p_ritual->>'scheduled_for', '')::timestamptz;
  scheduler boolean := public.coven_permission(p_coven, 'schedule') or public.is_community_moderator();
begin
  if not (public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'lead')) and not public.is_community_moderator() then
    raise exception 'Only those who lead the coven''s rituals can plan them.';
  end if;
  if jsonb_typeof(coalesce(p_steps, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_steps, '[]'::jsonb)) > 60 then
    raise exception 'A ritual can have up to 60 steps.';
  end if;
  if next_status not in ('draft', 'scheduled') then
    raise exception 'A ritual is saved as a draft or as scheduled.';
  end if;

  if p_ritual_id is not null then
    select * into saved from public.coven_rituals where id = p_ritual_id and coven_id = p_coven for update;
    if saved.id is null then raise exception 'That ritual was not found.'; end if;
    if saved.status = 'live' then raise exception 'End the ritual before changing it.'; end if;
  end if;
  -- Only those the coven's head allows put rites on the calendar (or move them).
  if next_status = 'scheduled' and not scheduler
     and not (saved.id is not null and saved.status = 'scheduled' and saved.scheduled_for is not distinct from next_when) then
    raise exception 'Only those the coven''s head has allowed can put rites on the calendar. Save it as a draft for them to schedule.';
  end if;

  if saved.id is null then
    insert into public.coven_rituals (coven_id, title, intention, description, scheduled_for, status, occasion, occasion_name, created_by)
    values (p_coven, btrim(p_ritual->>'title'), nullif(btrim(p_ritual->>'intention'), ''), nullif(btrim(p_ritual->>'description'), ''),
            next_when, next_status, nullif(p_ritual->>'occasion', ''), nullif(btrim(p_ritual->>'occasion_name'), ''), auth.uid())
    returning * into saved;
  else
    update public.coven_rituals
    set title = btrim(p_ritual->>'title'), intention = nullif(btrim(p_ritual->>'intention'), ''),
        description = nullif(btrim(p_ritual->>'description'), ''), scheduled_for = next_when, status = next_status,
        occasion = nullif(p_ritual->>'occasion', ''), occasion_name = nullif(btrim(p_ritual->>'occasion_name'), ''),
        current_step_id = null, started_at = null, ended_at = null, led_by = null, updated_at = now()
    where id = saved.id
    returning * into saved;
  end if;

  for step in select * from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb)) loop
    n := n + 1;
    person := nullif(step->>'assigned_user_id', '')::uuid;
    rank := nullif(step->>'assigned_rank_id', '')::uuid;
    if person is not null and rank is not null then raise exception 'Step %: give it to one person or one position, not both.', n; end if;
    if person is not null and not exists (select 1 from public.coven_members where coven_id = p_coven and user_id = person and status = 'active') then
      raise exception 'Step %: that person is not a member of this coven.', n;
    end if;
    if person is not null and (public.coven_unsigned_agreements(p_coven, person) > 0 or public.is_community_banned(person)) then
      raise exception 'Step %: % needs to sign the coven''s current agreements before they can be given a part.', n,
        coalesce((select display_name from public.coven_profiles where user_id = person), 'That member');
    end if;
    if rank is not null and not exists (select 1 from public.coven_ranks where id = rank and coven_id = p_coven) then
      raise exception 'Step %: that position is not one of this coven''s.', n;
    end if;
    if step->>'altar_action' = 'place_item' and nullif(step->>'altar_image', '') is null then
      raise exception 'Step %: choose what is placed on the altar.', n;
    end if;
    step_id := nullif(step->>'id', '')::uuid;
    if step_id is not null and exists (select 1 from public.coven_ritual_steps where id = step_id and ritual_id = saved.id) then
      update public.coven_ritual_steps
      set position = n, title = btrim(step->>'title'), instructions = nullif(btrim(step->>'instructions'), ''),
          spoken_text = nullif(btrim(step->>'spoken_text'), ''), duration_minutes = nullif(step->>'duration_minutes', '')::integer,
          assigned_user_id = person, assigned_rank_id = rank,
          altar_action = nullif(step->>'altar_action', ''), altar_color = nullif(step->>'altar_color', ''),
          altar_form = nullif(step->>'altar_form', ''), altar_image = nullif(step->>'altar_image', ''),
          altar_label = nullif(btrim(step->>'altar_label'), ''),
          started_at = null, completed_at = null, completed_by = null, updated_at = now()
      where id = step_id;
    else
      insert into public.coven_ritual_steps (ritual_id, coven_id, position, title, instructions, spoken_text, duration_minutes,
                                             assigned_user_id, assigned_rank_id, altar_action, altar_color, altar_form, altar_image, altar_label)
      values (saved.id, p_coven, n, btrim(step->>'title'), nullif(btrim(step->>'instructions'), ''), nullif(btrim(step->>'spoken_text'), ''),
              nullif(step->>'duration_minutes', '')::integer, person, rank,
              nullif(step->>'altar_action', ''), nullif(step->>'altar_color', ''), nullif(step->>'altar_form', ''),
              nullif(step->>'altar_image', ''), nullif(btrim(step->>'altar_label'), ''))
      returning id into step_id;
    end if;
    kept := array_append(kept, step_id);
  end loop;

  perform public.coven_ritual_prune(saved.id, kept);
  return saved;
end;
$$;

-- Putting a cancelled rite back on the calendar is a scheduling act too.
create or replace function public.set_coven_ritual_status(p_ritual uuid, p_status text)
returns public.coven_rituals
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.coven_rituals := public.coven_ritual_leader(p_ritual);
begin
  if p_status = 'deleted' then
    if r.status = 'live' then raise exception 'End the ritual before deleting it.'; end if;
    perform public.coven_ritual_remove(r.id);
    return r;
  end if;
  if p_status not in ('draft', 'scheduled', 'cancelled') then raise exception 'Unknown ritual status.'; end if;
  if r.status = 'live' then raise exception 'End the ritual first.'; end if;
  if p_status = 'scheduled' and not (public.coven_permission(r.coven_id, 'schedule') or public.is_community_moderator()) then
    raise exception 'Only those the coven''s head has allowed can put rites on the calendar.';
  end if;
  update public.coven_rituals set status = p_status, current_step_id = null, updated_at = now() where id = r.id returning * into r;
  return r;
end;
$$;

-- Do the current step's altar action. Returns what happened, for the page.
create or replace function public.perform_coven_step_action(p_step uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_ritual_steps;
  r public.coven_rituals;
  lit_count integer;
  angle double precision;
  item public.coven_altar_items;
  person text;
  changed integer;
begin
  select * into s from public.coven_ritual_steps where id = p_step;
  if s.id is null or s.altar_action is null then raise exception 'That step has nothing to do on the altar.'; end if;
  select * into r from public.coven_rituals where id = s.ritual_id;
  if r.status <> 'live' or r.current_step_id is distinct from s.id then raise exception 'That step isn''t the one under way.'; end if;
  if not (
    (public.coven_in_good_standing(s.coven_id) and (public.coven_step_is_mine(s.id) or public.coven_permission(s.coven_id, 'lead')))
    or public.is_community_moderator()
  ) then
    raise exception 'This step belongs to someone else.';
  end if;

  if s.altar_action in ('light_candle', 'place_item') then
    if exists (select 1 from public.coven_ritual_step_marks where step_id = s.id and user_id = auth.uid()) then
      raise exception 'You have already done this on the altar.';
    end if;
    select count(*) into lit_count from public.coven_ritual_step_marks where ritual_id = r.id;
    -- Candles gather in a circle, twelve to a ring, each ring a little closer in.
    angle := -pi() / 2 + (lit_count % 12) * (2 * pi() / 12);
    select coalesce(display_name, 'A member') into person from public.coven_profiles where user_id = auth.uid();
    insert into public.coven_altar_items (coven_id, kind, image, label, intention, x, y, scale, lit, burn_minutes, z)
    values (
      s.coven_id,
      case when s.altar_action = 'light_candle' then 'candle' else 'object' end,
      case when s.altar_action = 'light_candle' then public.coven_candle_image(s.altar_color, s.altar_form) else s.altar_image end,
      left(coalesce(s.altar_label, case when s.altar_action = 'light_candle' then coalesce(person, 'A member') || '’s candle' else 'Offering' end), 80),
      left(r.title || ' · ' || s.title, 280),
      greatest(0.05, least(0.95, 0.5 + (0.36 - 0.07 * (lit_count / 12)) * cos(angle))),
      greatest(0.2, least(0.95, 0.66 + (0.2 - 0.04 * (lit_count / 12)) * sin(angle))),
      case when s.altar_action = 'light_candle' then 0.8 else 1 end,
      s.altar_action = 'light_candle',
      120,
      10 + lit_count
    )
    returning * into item;
    insert into public.coven_ritual_step_marks (step_id, ritual_id, coven_id, user_id, item_id)
    values (s.id, r.id, s.coven_id, auth.uid(), item.id);
    return jsonb_build_object('action', s.altar_action, 'item_id', item.id);
  elsif s.altar_action = 'light_all' then
    update public.coven_altar_items set lit = true where coven_id = s.coven_id and kind = 'candle' and not lit;
    get diagnostics changed = row_count;
    return jsonb_build_object('action', s.altar_action, 'count', changed);
  else
    update public.coven_altar_items set lit = false where coven_id = s.coven_id and kind = 'candle' and lit;
    get diagnostics changed = row_count;
    return jsonb_build_object('action', s.altar_action, 'count', changed);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- The coven's Book of Shadows
-- ---------------------------------------------------------------------------

create table if not exists public.coven_book_pages (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  section text check (section is null or char_length(section) <= 60),
  body text not null default '' check (char_length(body) <= 40000),
  version integer not null default 1,
  author_id uuid references auth.users (id) on delete set null,
  published_by uuid references auth.users (id) on delete set null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists coven_book_pages_coven_idx on public.coven_book_pages (coven_id, section, title);

-- Drafts: new pages and changes to published ones, until an approver publishes them.
create table if not exists public.coven_book_drafts (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  page_id uuid references public.coven_book_pages (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  section text check (section is null or char_length(section) <= 60),
  body text not null default '' check (char_length(body) <= 40000),
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'pending', 'declined', 'published')),
  reviewer_id uuid references auth.users (id) on delete set null,
  reviewer_note text check (reviewer_note is null or char_length(reviewer_note) <= 2000),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_book_drafts_coven_idx on public.coven_book_drafts (coven_id, status);

alter table public.coven_book_pages enable row level security;
alter table public.coven_book_drafts enable row level security;

create policy "Members and moderators read the coven's book" on public.coven_book_pages
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
create policy "Authors, approvers and moderators read drafts" on public.coven_book_drafts
  for select to authenticated
  using (author_id = auth.uid() or public.coven_permission(coven_id, 'approve_book') or public.is_community_moderator());

create or replace function public.coven_book_publish(p_draft public.coven_book_drafts)
returns public.coven_book_pages
language plpgsql
security definer
set search_path = public
as $$
declare
  page public.coven_book_pages;
begin
  if p_draft.page_id is null then
    insert into public.coven_book_pages (coven_id, title, section, body, author_id, published_by, published_at)
    values (p_draft.coven_id, p_draft.title, p_draft.section, p_draft.body, p_draft.author_id, auth.uid(), now())
    returning * into page;
  else
    update public.coven_book_pages
    set title = p_draft.title, section = p_draft.section, body = p_draft.body, version = version + 1,
        published_by = auth.uid(), published_at = now()
    where id = p_draft.page_id
    returning * into page;
    if page.id is null then raise exception 'That page is no longer in the book.'; end if;
  end if;
  update public.coven_book_drafts
  set status = 'published', page_id = page.id, reviewer_id = auth.uid(), updated_at = now()
  where id = p_draft.id;
  return page;
end;
$$;

-- Write or change a draft; p_submit sends it for approval (an approver's
-- own submission is published straight away).
create or replace function public.save_coven_book_draft(
  p_coven uuid, p_draft uuid, p_page uuid, p_title text, p_section text, p_body text, p_submit boolean default false
)
returns public.coven_book_drafts
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.coven_book_drafts;
begin
  if not ((public.coven_in_good_standing(p_coven) and public.coven_permission(p_coven, 'write_book')) or public.is_community_moderator()) then
    raise exception 'Only those the coven''s head has allowed can write in the coven''s book.';
  end if;
  if p_page is not null and not exists (select 1 from public.coven_book_pages where id = p_page and coven_id = p_coven) then
    raise exception 'That page isn''t in this coven''s book.';
  end if;
  if p_draft is null then
    insert into public.coven_book_drafts (coven_id, page_id, title, section, body, author_id)
    values (p_coven, p_page, btrim(p_title), nullif(btrim(p_section), ''), coalesce(p_body, ''), auth.uid())
    returning * into d;
  else
    select * into d from public.coven_book_drafts where id = p_draft and coven_id = p_coven for update;
    if d.id is null or d.author_id <> auth.uid() then raise exception 'You can only change your own drafts.'; end if;
    if d.status = 'published' then raise exception 'That draft has already been published.'; end if;
    update public.coven_book_drafts
    set title = btrim(p_title), section = nullif(btrim(p_section), ''), body = coalesce(p_body, ''),
        status = 'draft', reviewer_note = null, updated_at = now()
    where id = d.id
    returning * into d;
  end if;
  if p_submit then
    if public.coven_permission(p_coven, 'approve_book') or public.is_community_moderator() then
      perform public.coven_book_publish(d);
      select * into d from public.coven_book_drafts where id = d.id;
    else
      update public.coven_book_drafts set status = 'pending', submitted_at = now(), updated_at = now() where id = d.id returning * into d;
    end if;
  end if;
  return d;
end;
$$;

create or replace function public.review_coven_book_draft(p_draft uuid, p_approve boolean, p_note text default null)
returns public.coven_book_drafts
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.coven_book_drafts;
begin
  select * into d from public.coven_book_drafts where id = p_draft for update;
  if d.id is null then raise exception 'That draft was not found.'; end if;
  if not ((public.coven_in_good_standing(d.coven_id) and public.coven_permission(d.coven_id, 'approve_book')) or public.is_community_moderator()) then
    raise exception 'Only those the coven''s head has allowed can approve pages.';
  end if;
  if d.status <> 'pending' then raise exception 'That draft isn''t waiting for approval.'; end if;
  if p_approve then
    update public.coven_book_drafts set reviewer_note = nullif(btrim(p_note), '') where id = d.id returning * into d;
    perform public.coven_book_publish(d);
  else
    update public.coven_book_drafts
    set status = 'declined', reviewer_id = auth.uid(), reviewer_note = nullif(btrim(p_note), ''), updated_at = now()
    where id = d.id;
  end if;
  select * into d from public.coven_book_drafts where id = p_draft;
  return d;
end;
$$;

-- Delete a draft (its author or an approver) or a published page (an approver).
create or replace function public.remove_coven_book_entry(p_kind text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_coven uuid;
  author uuid;
begin
  if p_kind = 'draft' then
    select coven_id, author_id into owner_coven, author from public.coven_book_drafts where id = p_id;
    if owner_coven is null then return; end if;
    if not (author = auth.uid() or public.coven_permission(owner_coven, 'approve_book') or public.is_community_moderator()) then
      raise exception 'You can''t remove that draft.';
    end if;
    perform public.coven_book_drop('draft', p_id);
  elsif p_kind = 'page' then
    select coven_id into owner_coven from public.coven_book_pages where id = p_id;
    if owner_coven is null then return; end if;
    if not (public.coven_permission(owner_coven, 'approve_book') or public.is_community_moderator()) then
      raise exception 'Only those who approve pages can take one out of the book.';
    end if;
    perform public.coven_book_drop('page', p_id);
  else
    raise exception 'Unknown entry.';
  end if;
end;
$$;

create or replace function public.coven_book_drop(p_kind text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind = 'draft' then
    delete from public.coven_book_drafts where id = p_id;
  elsif p_kind = 'page' then
    delete from public.coven_book_pages where id = p_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Petitions the circle holds
-- ---------------------------------------------------------------------------

create table if not exists public.coven_petitions (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text check (body is null or char_length(body) <= 2000),
  color text not null default 'white'
    check (color in ('white', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'magenta', 'brown', 'grey', 'silver', 'gold', 'rainbow')),
  altar_item_id uuid references public.coven_altar_items (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  outcome_note text check (outcome_note is null or char_length(outcome_note) <= 1000),
  last_tended_at timestamptz,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create index if not exists coven_petitions_coven_idx on public.coven_petitions (coven_id, status, created_at desc);

create table if not exists public.coven_petition_tendings (
  id uuid primary key default gen_random_uuid(),
  petition_id uuid not null references public.coven_petitions (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  note text check (note is null or char_length(note) <= 280),
  created_at timestamptz not null default now()
);

create index if not exists coven_petition_tendings_petition_idx on public.coven_petition_tendings (petition_id, created_at desc);

alter table public.coven_petitions enable row level security;
alter table public.coven_petition_tendings enable row level security;

create policy "Members and moderators see petitions" on public.coven_petitions
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
create policy "Members and moderators see tendings" on public.coven_petition_tendings
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());

create or replace function public.coven_petition_candle(p_petition public.coven_petitions)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  item_id uuid;
  n integer;
begin
  select count(*) into n from public.coven_petitions where coven_id = p_petition.coven_id and status = 'open';
  insert into public.coven_altar_items (coven_id, kind, image, label, intention, x, y, scale, lit, burn_minutes, z)
  values (p_petition.coven_id, 'candle', public.coven_candle_image(p_petition.color, 'votive'),
          left('Petition: ' || p_petition.title, 80), left(p_petition.title, 280),
          0.12 + ((n * 0.11)::numeric % 0.76), 0.9, 0.7, true, 1440, 5)
  returning id into item_id;
  update public.coven_petitions set altar_item_id = item_id where id = p_petition.id;
  return item_id;
end;
$$;

create or replace function public.ask_coven_petition(p_coven uuid, p_title text, p_body text default null, p_color text default 'white')
returns public.coven_petitions
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.coven_petitions;
begin
  if not public.coven_in_good_standing(p_coven) then
    raise exception 'You need to be a member in good standing (with the agreements signed) to ask the circle.';
  end if;
  if (select count(*) from public.coven_petitions where coven_id = p_coven and user_id = auth.uid() and status = 'open') >= 3 then
    raise exception 'You have three petitions held already. Close one before asking again.';
  end if;
  insert into public.coven_petitions (coven_id, user_id, title, body, color)
  values (p_coven, auth.uid(), btrim(p_title), nullif(btrim(p_body), ''), coalesce(nullif(p_color, ''), 'white'))
  returning * into p;
  perform public.coven_petition_candle(p);
  select * into p from public.coven_petitions where id = p.id;
  return p;
end;
$$;

create or replace function public.tend_coven_petition(p_petition uuid, p_note text default null)
returns public.coven_petitions
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.coven_petitions;
begin
  select * into p from public.coven_petitions where id = p_petition for update;
  if p.id is null or p.status <> 'open' then raise exception 'That petition isn''t being held any more.'; end if;
  if not public.coven_in_good_standing(p.coven_id) then raise exception 'You need to be a member in good standing to tend petitions.'; end if;
  if exists (select 1 from public.coven_petition_tendings where petition_id = p.id and user_id = auth.uid() and created_at > now() - interval '12 hours') then
    raise exception 'You tended this petition in the last twelve hours. Its candle is still burning for you.';
  end if;
  insert into public.coven_petition_tendings (petition_id, coven_id, user_id, note) values (p.id, p.coven_id, auth.uid(), nullif(btrim(p_note), ''));
  -- Relight its candle for a fresh burn (or set a new one if it was cleared away).
  if p.altar_item_id is not null and exists (select 1 from public.coven_altar_items where id = p.altar_item_id) then
    update public.coven_altar_items set lit = false where id = p.altar_item_id;
    update public.coven_altar_items set lit = true where id = p.altar_item_id;
  else
    perform public.coven_petition_candle(p);
  end if;
  update public.coven_petitions set last_tended_at = now() where id = p.id returning * into p;
  return p;
end;
$$;

create or replace function public.close_coven_petition(p_petition uuid, p_status text, p_note text default null)
returns public.coven_petitions
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.coven_petitions;
begin
  select * into p from public.coven_petitions where id = p_petition for update;
  if p.id is null then raise exception 'That petition was not found.'; end if;
  if not (p.user_id = auth.uid() or public.coven_permission(p.coven_id, 'moderate') or public.is_community_moderator()) then
    raise exception 'Only the person who asked can close a petition.';
  end if;
  if p_status not in ('answered', 'closed') then raise exception 'A petition is answered or closed.'; end if;
  update public.coven_petitions set status = p_status, outcome_note = nullif(btrim(p_note), ''), closed_at = now()
  where id = p.id returning * into p;
  perform public.coven_petition_clear_candle(p.altar_item_id);
  return p;
end;
$$;

create or replace function public.coven_petition_clear_candle(p_item uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_item is not null then
    delete from public.coven_altar_items where id = p_item;
  end if;
end;
$$;

-- A deleted petition (its asker's account deleted) takes its candle with it.
create or replace function public.coven_petition_gone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.coven_petition_clear_candle(old.altar_item_id);
  return old;
end;
$$;

drop trigger if exists coven_petitions_gone on public.coven_petitions;
create trigger coven_petitions_gone after delete on public.coven_petitions
  for each row execute function public.coven_petition_gone();

-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------

revoke execute on function
  public.coven_rsvp_clear(uuid),
  public.coven_book_publish(public.coven_book_drafts),
  public.coven_book_drop(text, uuid),
  public.coven_petition_candle(public.coven_petitions),
  public.coven_petition_clear_candle(uuid),
  public.coven_petition_gone()
from public, anon, authenticated;

revoke execute on function
  public.rsvp_coven_ritual(uuid, text),
  public.perform_coven_step_action(uuid),
  public.save_coven_book_draft(uuid, uuid, uuid, text, text, text, boolean),
  public.review_coven_book_draft(uuid, boolean, text),
  public.remove_coven_book_entry(text, uuid),
  public.ask_coven_petition(uuid, text, text, text),
  public.tend_coven_petition(uuid, text),
  public.close_coven_petition(uuid, text, text)
from public, anon;

grant execute on function
  public.rsvp_coven_ritual(uuid, text),
  public.perform_coven_step_action(uuid),
  public.save_coven_book_draft(uuid, uuid, uuid, text, text, text, boolean),
  public.review_coven_book_draft(uuid, boolean, text),
  public.remove_coven_book_entry(text, uuid),
  public.ask_coven_petition(uuid, text, text, text),
  public.tend_coven_petition(uuid, text),
  public.close_coven_petition(uuid, text, text)
to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_ritual_rsvps') then
      alter publication supabase_realtime add table public.coven_ritual_rsvps;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_ritual_step_marks') then
      alter publication supabase_realtime add table public.coven_ritual_step_marks;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_petitions') then
      alter publication supabase_realtime add table public.coven_petitions;
    end if;
  end if;
end;
$$;
