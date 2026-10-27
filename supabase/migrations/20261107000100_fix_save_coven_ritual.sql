-- Fix: in save_coven_ritual, `step->'details' - 'vote_voters'` parsed as
-- step -> ('details' - 'vote_voters') ("operator is not unique: unknown - unknown"),
-- so every save with steps failed. Brackets make it (step->'details') - 'vote_voters'.

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
  who jsonb;
  tenders jsonb;
  access text;
  next_status text := coalesce(p_ritual->>'status', 'scheduled');
  next_when timestamptz := nullif(p_ritual->>'scheduled_for', '')::timestamptz;
  scheduler boolean := public.coven_permission(p_coven, 'schedule') or public.is_community_moderator();
  next_kind text;
  next_plan jsonb;
  role_ids jsonb;
  step_details jsonb;
  voters jsonb;
  turn text;
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
  if next_status = 'scheduled' and not scheduler
     and not (saved.id is not null and saved.status = 'scheduled' and saved.scheduled_for is not distinct from next_when) then
    raise exception 'Only those the coven''s head has allowed can put rites on the calendar. Save it as a draft for them to schedule.';
  end if;

  next_kind := coalesce(nullif(p_ritual->>'kind', ''), saved.kind, 'rite');
  if next_kind not in ('rite', 'meeting') then raise exception 'A gathering is a rite or a meeting.'; end if;
  next_plan := case when p_ritual ? 'plan' then public.coven_clean_plan(p_coven, p_ritual->'plan') else coalesce(saved.plan, '{}'::jsonb) end;

  if saved.id is null then
    insert into public.coven_rituals (coven_id, title, intention, description, scheduled_for, status, occasion, occasion_name, kind, plan, created_by)
    values (p_coven, btrim(p_ritual->>'title'), nullif(btrim(p_ritual->>'intention'), ''), nullif(btrim(p_ritual->>'description'), ''),
            next_when, next_status, nullif(p_ritual->>'occasion', ''), nullif(btrim(p_ritual->>'occasion_name'), ''), next_kind, next_plan, auth.uid())
    returning * into saved;
  else
    update public.coven_rituals
    set title = btrim(p_ritual->>'title'), intention = nullif(btrim(p_ritual->>'intention'), ''),
        description = nullif(btrim(p_ritual->>'description'), ''), scheduled_for = next_when, status = next_status,
        occasion = nullif(p_ritual->>'occasion', ''), occasion_name = nullif(btrim(p_ritual->>'occasion_name'), ''),
        kind = next_kind, plan = next_plan,
        current_step_id = null, started_at = null, ended_at = null, led_by = null, updated_at = now()
    where id = saved.id
    returning * into saved;
  end if;

  for step in select * from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb)) loop
    n := n + 1;
    -- Its roles: only those the plan has.
    select coalesce(jsonb_agg(r), '[]'::jsonb) into role_ids
    from (select distinct r from jsonb_array_elements_text(case when jsonb_typeof(step->'roles') = 'array' then step->'roles' else '[]'::jsonb end) r
          where exists (select 1 from jsonb_array_elements(coalesce(next_plan->'roles', '[]'::jsonb)) x where x->>'id' = r) limit 20) t;
    -- Its people: its list and those cast in its roles, otherwise the older one person or position.
    who := public.coven_clean_assignees(p_coven,
      (case when jsonb_typeof(step->'assignees') = 'array' then step->'assignees' else '[]'::jsonb end) || public.coven_plan_role_people(next_plan, role_ids),
      'Step ' || n, true);
    if jsonb_array_length(who) = 0 then
      person := nullif(step->>'assigned_user_id', '')::uuid;
      rank := nullif(step->>'assigned_rank_id', '')::uuid;
      if person is not null and rank is not null then raise exception 'Step %: give it to one person or one position, not both.', n; end if;
      if person is not null then who := jsonb_build_array(jsonb_build_object('kind', 'user', 'id', person));
      elsif rank is not null then who := jsonb_build_array(jsonb_build_object('kind', 'rank', 'id', rank));
      end if;
      who := public.coven_clean_assignees(p_coven, who, 'Step ' || n, true);
    end if;
    person := case when jsonb_array_length(who) = 1 and who->0->>'kind' = 'user' then (who->0->>'id')::uuid end;
    rank := case when jsonb_array_length(who) = 1 and who->0->>'kind' = 'rank' then (who->0->>'id')::uuid end;
    access := coalesce(nullif(step->>'altar_access', ''), 'assigned');
    if access not in ('assigned', 'everyone', 'leader', 'chosen') then raise exception 'Step %: unknown choice for who tends the altar.', n; end if;
    tenders := case when access = 'chosen' then public.coven_clean_assignees(p_coven, step->'altar_tenders', 'Step ' || n, false) else '[]'::jsonb end;
    if access = 'chosen' and jsonb_array_length(tenders) = 0 then raise exception 'Step %: choose who tends the altar during it.', n; end if;
    if step->>'altar_action' = 'place_item' and nullif(step->>'altar_image', '') is null
       and jsonb_array_length(public.coven_clean_items(step->'items', 'Step ' || n)) = 0 then
      raise exception 'Step %: choose what is placed on the altar.', n;
    end if;
    turn := coalesce(nullif(step->>'turn_mode', ''), 'assigned');
    if turn not in ('together', 'in_turn', 'assigned', 'on_behalf') then raise exception 'Step %: unknown choice for how it is done.', n; end if;
    step_details := case when jsonb_typeof(step->'details') = 'object' then (step->'details') - 'vote_voters' else '{}'::jsonb end;
    if octet_length(step_details::text) > 20000 then raise exception 'Step %: there is too much in it.', n; end if;
    -- A vote keeps who may vote: those its fields name (everyone when none; no one while its roles are uncast).
    if step->>'action' = 'vote' and jsonb_typeof(step_details->'fields'->'voters') = 'array' and jsonb_array_length(step_details->'fields'->'voters') > 0 then
      voters := public.coven_clean_assignees(p_coven, public.coven_plan_who(next_plan, step_details->'fields'->'voters'), 'Step ' || n, false);
      step_details := step_details || jsonb_build_object('vote_voters', case when jsonb_array_length(voters) = 0 then '[{"kind":"nobody","id":"nobody"}]'::jsonb else voters end);
    end if;
    step_id := nullif(step->>'id', '')::uuid;
    if step_id is not null and exists (select 1 from public.coven_ritual_steps where id = step_id and ritual_id = saved.id) then
      update public.coven_ritual_steps
      set position = n, title = btrim(step->>'title'), instructions = nullif(btrim(step->>'instructions'), ''),
          spoken_text = nullif(btrim(step->>'spoken_text'), ''), duration_minutes = nullif(step->>'duration_minutes', '')::integer,
          assigned_user_id = person, assigned_rank_id = rank, assignees = who,
          action = nullif(step->>'action', ''), items = public.coven_clean_items(step->'items', 'Step ' || n),
          contribution = public.coven_clean_contribution(step->'contribution'),
          altar_action = nullif(step->>'altar_action', ''), altar_color = nullif(step->>'altar_color', ''),
          altar_form = nullif(step->>'altar_form', ''), altar_image = nullif(step->>'altar_image', ''),
          altar_label = nullif(btrim(step->>'altar_label'), ''), altar_access = access, altar_tenders = tenders,
          section = nullif(left(step->>'section', 40), ''), roles = role_ids, turn_mode = turn, details = step_details,
          turn_order = '{}', turn_at = 0, outcome = null,
          started_at = null, completed_at = null, completed_by = null, updated_at = now()
      where id = step_id;
    else
      insert into public.coven_ritual_steps (ritual_id, coven_id, position, title, instructions, spoken_text, duration_minutes,
                                             assigned_user_id, assigned_rank_id, assignees, action, items, contribution,
                                             altar_action, altar_color, altar_form, altar_image, altar_label, altar_access, altar_tenders,
                                             section, roles, turn_mode, details)
      values (saved.id, p_coven, n, btrim(step->>'title'), nullif(btrim(step->>'instructions'), ''), nullif(btrim(step->>'spoken_text'), ''),
              nullif(step->>'duration_minutes', '')::integer, person, rank, who,
              nullif(step->>'action', ''), public.coven_clean_items(step->'items', 'Step ' || n), public.coven_clean_contribution(step->'contribution'),
              nullif(step->>'altar_action', ''), nullif(step->>'altar_color', ''), nullif(step->>'altar_form', ''),
              nullif(step->>'altar_image', ''), nullif(btrim(step->>'altar_label'), ''), access, tenders,
              nullif(left(step->>'section', 40), ''), role_ids, turn, step_details)
      returning id into step_id;
    end if;
    kept := array_append(kept, step_id);
  end loop;

  perform public.coven_ritual_prune(saved.id, kept);
  -- Votes cast on an earlier plan of the steps no longer count.
  delete from public.coven_ritual_votes where ritual_id = saved.id;
  return saved;
end;
$$;
