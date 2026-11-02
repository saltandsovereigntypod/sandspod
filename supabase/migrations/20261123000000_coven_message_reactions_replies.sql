-- Reactions and reply buttons on coven messages (the whole coven's chat and
-- conversations, one-to-one or group), and the chat reminder before a
-- gathering begins.
--
-- coven_messages.reply_buttons: the buttons under a message, or null:
--   { "labels": ["Coming", "Running late", "Can't make it"],   2 to 4, each up to 40 characters
--     "preset": "gathering" | "yesno" | "custom",
--     "ritual_id": "<coven ritual>",       the coven's chat only: answers set the RSVP too
--     "reminder_at": "<scheduled_for>" }   only the coven-notify function writes this:
--                                          a reminder posted before the gathering, once per time
-- coven_message_reactions: one row per person, message and emoji.
-- coven_message_answers: one answer per person and message (the button's index),
--   changed in place; notified_at is when the writer's summary note included it.
--
-- Who may read a reaction or an answer is whoever may read its message
-- (the coven's members, or those in the conversation): the policies ask the
-- messages table, so its own rules decide. The coven-notify edge function
-- rings the phones (supabase/functions/coven-notify/messages.ts).

alter table public.coven_messages add column if not exists reply_buttons jsonb;

alter table public.coven_messages drop constraint if exists coven_messages_reply_buttons_shape;
alter table public.coven_messages add constraint coven_messages_reply_buttons_shape check (
  reply_buttons is null or (
    jsonb_typeof(reply_buttons) = 'object'
    and jsonb_typeof(reply_buttons -> 'labels') = 'array'
    and jsonb_array_length(reply_buttons -> 'labels') between 2 and 4
    and char_length(reply_buttons::text) <= 600
  )
);

-- A reminder is posted once for each time the gathering is set for.
create unique index if not exists coven_messages_reminder_once
  on public.coven_messages ((reply_buttons ->> 'ritual_id'), (reply_buttons ->> 'reminder_at'))
  where reply_buttons ? 'reminder_at';

-- Reply buttons from the app or the website: tidy labels (two to four); a
-- gathering link only in the coven's own chat, to one of its scheduled
-- gatherings; no reminders (only coven-notify posts those).
create or replace function public.guard_coven_message_buttons()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  labels jsonb;
  raw text;
begin
  if new.reply_buttons is null or not public.coven_client_write() then return new; end if;
  if new.reply_buttons ? 'reminder_at' then raise exception 'Reminders are posted by the coven.'; end if;
  raw := nullif(new.reply_buttons ->> 'ritual_id', '');
  select coalesce(jsonb_agg(left(btrim(value), 40)), '[]'::jsonb) into labels
  from jsonb_array_elements_text(new.reply_buttons -> 'labels') where btrim(value) <> '';
  if jsonb_array_length(labels) < 2 or jsonb_array_length(labels) > 4 then
    raise exception 'Reply buttons need two to four labels.';
  end if;
  new.reply_buttons := jsonb_build_object(
    'labels', labels,
    'preset', case when new.reply_buttons ->> 'preset' in ('gathering', 'yesno', 'custom') then new.reply_buttons ->> 'preset' else 'custom' end
  );
  if raw is not null then
    if new.conversation_id is not null then raise exception 'Only the coven’s own chat can link a gathering.'; end if;
    if not exists (select 1 from public.coven_rituals where id::text = raw and coven_id = new.coven_id and status = 'scheduled') then
      raise exception 'That gathering isn’t on this coven’s calendar.';
    end if;
    new.reply_buttons := new.reply_buttons || jsonb_build_object('ritual_id', raw);
  end if;
  return new;
end;
$$;

drop trigger if exists coven_messages_buttons on public.coven_messages;
create trigger coven_messages_buttons before insert on public.coven_messages
  for each row execute function public.guard_coven_message_buttons();

-- ---------------------------------------------------------------------------
-- Reactions and answers
-- ---------------------------------------------------------------------------

create table if not exists public.coven_message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.coven_messages (id) on delete cascade,
  -- Filled from the message (for live updates by coven); no second link to covens.
  coven_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  unique (message_id, user_id, emoji)
);
create index if not exists coven_message_reactions_coven_idx on public.coven_message_reactions (coven_id, message_id);

create table if not exists public.coven_message_answers (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.coven_messages (id) on delete cascade,
  coven_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  choice smallint not null check (choice between 0 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  notified_at timestamptz,
  unique (message_id, user_id)
);
create index if not exists coven_message_answers_coven_idx on public.coven_message_answers (coven_id, message_id);
create index if not exists coven_message_answers_waiting_idx on public.coven_message_answers (message_id) where notified_at is null;

-- From the app or the website: your own, on a message still there, its coven
-- taken from the message; an answer only to one of its buttons. A changed
-- answer is news again.
create or replace function public.fill_coven_message_reaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.coven_messages;
begin
  select * into m from public.coven_messages where id = new.message_id;
  if m.id is null or m.deleted_at is not null then raise exception 'That message isn’t there any more.'; end if;
  new.coven_id := m.coven_id;
  if public.coven_client_write() then
    new.user_id := auth.uid();
    new.notified_at := null;
    new.created_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.fill_coven_message_answer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.coven_messages;
begin
  select * into m from public.coven_messages where id = new.message_id;
  if m.id is null or m.deleted_at is not null then raise exception 'That message isn’t there any more.'; end if;
  if m.reply_buttons is null or new.choice >= jsonb_array_length(m.reply_buttons -> 'labels') then
    raise exception 'That isn’t one of the message’s answers.';
  end if;
  new.coven_id := m.coven_id;
  if public.coven_client_write() then
    new.user_id := auth.uid();
    new.updated_at := now();
    if tg_op = 'INSERT' then new.created_at := now(); end if;
    if tg_op = 'INSERT' or new.choice is distinct from old.choice then new.notified_at := null; end if;
    if tg_op = 'UPDATE' and new.message_id <> old.message_id then raise exception 'An answer stays with its message.'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists coven_message_reactions_fill on public.coven_message_reactions;
create trigger coven_message_reactions_fill before insert on public.coven_message_reactions
  for each row execute function public.fill_coven_message_reaction();
drop trigger if exists coven_message_answers_fill on public.coven_message_answers;
create trigger coven_message_answers_fill before insert or update on public.coven_message_answers
  for each row execute function public.fill_coven_message_answer();

alter table public.coven_message_reactions enable row level security;
alter table public.coven_message_answers enable row level security;

-- Read: whoever can read the message (its own policy decides, in this subquery).
drop policy if exists "Those who read a message see its reactions" on public.coven_message_reactions;
create policy "Those who read a message see its reactions" on public.coven_message_reactions
  for select to authenticated using (exists (select 1 from public.coven_messages m where m.id = message_id));
drop policy if exists "Those who read a message see its answers" on public.coven_message_answers;
create policy "Those who read a message see its answers" on public.coven_message_answers
  for select to authenticated using (exists (select 1 from public.coven_messages m where m.id = message_id));

-- Write: your own, on a message you can read, while you are in good standing.
drop policy if exists "People react for themselves" on public.coven_message_reactions;
create policy "People react for themselves" on public.coven_message_reactions
  for insert to authenticated
  with check (user_id = auth.uid() and public.coven_in_good_standing(coven_id) and exists (select 1 from public.coven_messages m where m.id = message_id));
drop policy if exists "People take back their own reactions" on public.coven_message_reactions;
create policy "People take back their own reactions" on public.coven_message_reactions
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "People answer for themselves" on public.coven_message_answers;
create policy "People answer for themselves" on public.coven_message_answers
  for insert to authenticated
  with check (user_id = auth.uid() and public.coven_in_good_standing(coven_id) and exists (select 1 from public.coven_messages m where m.id = message_id));
drop policy if exists "People change their own answers" on public.coven_message_answers;
create policy "People change their own answers" on public.coven_message_answers
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "People take back their own answers" on public.coven_message_answers;
create policy "People take back their own answers" on public.coven_message_answers
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, delete on public.coven_message_reactions to authenticated;
grant select, insert, update, delete on public.coven_message_answers to authenticated;

-- Live screens hear of deletes by id (realtime sends only the key for those).

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_message_reactions') then
      alter publication supabase_realtime add table public.coven_message_reactions;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_message_answers') then
      alter publication supabase_realtime add table public.coven_message_answers;
    end if;
  end if;
end;
$$;

-- The chat reminders before gatherings, and answer summaries waiting out
-- their few minutes, go out when coven-notify is called with the service key
-- and { "due": true }. Schedule that once a minute, for example with pg_cron
-- and pg_net (the key kept in Vault as 'service_role_key'):
--
--   select cron.schedule('coven-notify-due', '* * * * *', $cron$
--     select net.http_post(
--       url := 'https://<project-ref>.supabase.co/functions/v1/coven-notify',
--       headers := jsonb_build_object('content-type', 'application/json',
--         'authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')),
--       body := '{"due": true}'::jsonb);
--   $cron$);
--
-- Without it, a member opening the coven's chat asks for its due reminders
-- ({ "due_coven_id": … }), so they still appear, if not always on the minute.
