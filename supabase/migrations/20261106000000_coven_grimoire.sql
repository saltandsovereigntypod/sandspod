-- NOT YET APPLIED. Needs 20261101000000_coven_ritual_contributions.sql and
-- 20261103000000_coven_ritual_builder.sql first.
--
-- The coven's Book of Shadows, rebuilt on the same model as a personal
-- grimoire: a book, sections, pages, blocks and page links (the columns of
-- grimoire_books / _sections / _pages / _blocks / _page_links), owned by the
-- coven. The app and the website open and edit it with the same editor,
-- templates, page links and Living Library links as a personal grimoire
-- (app: lib/grimoire/*, coven.ts; website: covens/coven/book.js).
-- Additive: new tables and functions only. The old coven_book_pages and
-- coven_book_drafts stay as they are; their pages and drafts are copied in
-- below, each page keeping its id so words the ritual builder links from the
-- Book still find their page.
--
-- * Who may do what: the book, each section and each page can say who may
--   VIEW it, who may WRITE in it (edit it directly) and who APPROVES what
--   members suggest for it, as lists of {kind: 'coven' | 'rank' | 'user', id}
--   (the WHO picker's) in its `access` column ({"view": [...], ...}). A
--   power with no list follows the level above (page, then section, then
--   book), and a book with none follows the coven's powers: every member
--   views, those with can_write_book write, those with can_approve_book
--   approve. An empty list means only the coven's head. The coven's head and
--   the site's moderators can always do everything; no one writes or
--   approves what they can't open; writing and approving need good standing.
--   (lib/grimoire/access.ts keeps the same rules for the screens.)
-- * Hidden means hidden: rows of a page someone can't open never reach them
--   (pages, blocks, links, versions, suggestions, the builder's words).
-- * Changes come only through the functions below: apply_coven_grimoire_op
--   takes the same operations the personal grimoire sends to its tables and
--   checks each one.
-- * History: each save keeps a version of the page (who and when; a sitting
--   of edits by one person, twenty minutes, counts as one save), the newest
--   hundred per page. Those who can write in a page can restore one.
-- * Suggestions: any member in good standing who can open a part of the
--   book can suggest a page for it (a copy of a page of their own grimoire,
--   or a new page, or changes to a page). Those who approve that part
--   approve it (editing it first if they like), send it back with a note, or
--   decline it. An approved page credits whoever shared it.
-- * The coven's own shelves: Rites, Ritual records, Meeting minutes and Study
--   material, made with the book. The ritual builder saves rites, agendas,
--   records and minutes onto them (save_coven_grimoire_gathering).
-- * The home's layout (order, names, what's hidden) is kept on the book and
--   set by those who approve for the whole book.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.coven_grimoire_books (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null unique references public.covens (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  title text not null default 'Book of Shadows' check (char_length(btrim(title)) between 1 and 120),
  access jsonb not null default '{}'::jsonb check (jsonb_typeof(access) = 'object' and octet_length(access::text) <= 8000),
  layout jsonb not null default '{}'::jsonb check (jsonb_typeof(layout) = 'object' and octet_length(layout::text) <= 30000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coven_grimoire_sections (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  book_id uuid not null references public.coven_grimoire_books (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  sort_order integer not null default 0,
  is_collapsed boolean not null default false,
  shelf text check (shelf is null or shelf in ('rites', 'records', 'minutes', 'study')),
  access jsonb not null default '{}'::jsonb check (jsonb_typeof(access) = 'object' and octet_length(access::text) <= 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists coven_grimoire_sections_shelf_idx on public.coven_grimoire_sections (book_id, shelf) where shelf is not null;
create index if not exists coven_grimoire_sections_book_idx on public.coven_grimoire_sections (book_id, sort_order);

create table if not exists public.coven_grimoire_pages (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  book_id uuid not null references public.coven_grimoire_books (id) on delete cascade,
  section_id uuid references public.coven_grimoire_sections (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  -- Whoever shared it from their own grimoire (credited on the page).
  shared_by uuid references auth.users (id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  icon text not null default '' check (char_length(icon) <= 40),
  page_type text check (page_type is null or char_length(page_type) <= 40),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 20000),
  access jsonb not null default '{}'::jsonb check (jsonb_typeof(access) = 'object' and octet_length(access::text) <= 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_grimoire_pages_book_idx on public.coven_grimoire_pages (book_id, section_id, sort_order);
create index if not exists coven_grimoire_pages_coven_idx on public.coven_grimoire_pages (coven_id);

create table if not exists public.coven_grimoire_blocks (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  book_id uuid not null references public.coven_grimoire_books (id) on delete cascade,
  page_id uuid not null references public.coven_grimoire_pages (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  block_type text not null check (char_length(block_type) between 1 and 40),
  content text check (content is null or char_length(content) <= 40000),
  rich_content jsonb check (rich_content is null or (jsonb_typeof(rich_content) = 'object' and octet_length(rich_content::text) <= 60000)),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 20000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_grimoire_blocks_page_idx on public.coven_grimoire_blocks (page_id, sort_order);

create table if not exists public.coven_grimoire_page_links (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  book_id uuid not null references public.coven_grimoire_books (id) on delete cascade,
  source_page_id uuid not null references public.coven_grimoire_pages (id) on delete cascade,
  target_page_id uuid not null references public.coven_grimoire_pages (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  link_label text check (link_label is null or char_length(link_label) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists coven_grimoire_page_links_source_idx on public.coven_grimoire_page_links (source_page_id);
create index if not exists coven_grimoire_page_links_target_idx on public.coven_grimoire_page_links (target_page_id);

create table if not exists public.coven_grimoire_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.coven_grimoire_pages (id) on delete cascade,
  coven_id uuid not null references public.covens (id) on delete cascade,
  title text not null,
  page_type text,
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  saved_by uuid references auth.users (id) on delete set null,
  saved_at timestamptz not null default now(),
  restored_from uuid
);

create index if not exists coven_grimoire_versions_page_idx on public.coven_grimoire_versions (page_id, saved_at desc);

create table if not exists public.coven_grimoire_submissions (
  id uuid primary key default gen_random_uuid(),
  coven_id uuid not null references public.covens (id) on delete cascade,
  book_id uuid not null references public.coven_grimoire_books (id) on delete cascade,
  -- Where it's for: a section (or the book's loose pages), or changes to one page.
  section_id uuid references public.coven_grimoire_sections (id) on delete set null,
  page_id uuid references public.coven_grimoire_pages (id) on delete cascade,
  -- The page of their own grimoire it was copied from (never touched).
  source_page_id uuid,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  page_type text check (page_type is null or char_length(page_type) <= 40),
  blocks jsonb not null default '[]'::jsonb
    check (jsonb_typeof(blocks) = 'array' and jsonb_array_length(blocks) <= 200 and octet_length(blocks::text) <= 400000),
  note text check (note is null or char_length(note) <= 2000),
  status text not null default 'pending' check (status in ('draft', 'pending', 'returned', 'declined', 'approved')),
  submitted_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reviewer_id uuid references auth.users (id) on delete set null,
  reviewer_note text check (reviewer_note is null or char_length(reviewer_note) <= 2000),
  published_page_id uuid references public.coven_grimoire_pages (id) on delete set null,
  legacy_draft_id uuid unique,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coven_grimoire_submissions_coven_idx on public.coven_grimoire_submissions (coven_id, status);
create index if not exists coven_grimoire_submissions_by_idx on public.coven_grimoire_submissions (submitted_by, status);

-- Reports can name a suggestion too (a page is still 'book_page').
alter table public.coven_reports drop constraint if exists coven_reports_target_type_check;
alter table public.coven_reports add constraint coven_reports_target_type_check
  check (target_type in ('coven', 'message', 'member', 'application', 'altar_item', 'document', 'ritual', 'book_page', 'petition', 'book_submission'));

-- ---------------------------------------------------------------------------
-- Who may do what
-- ---------------------------------------------------------------------------

-- A level's own list for a power, or null when it follows the level above.
create or replace function public.coven_grimoire_rule(p_access jsonb, p_what text)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select case when jsonb_typeof(p_access -> p_what) = 'array' then p_access -> p_what end;
$$;

-- Whether a list (null: the coven's own power) takes in this person, an
-- active member of an active coven. The founder always; an empty list only
-- the founder. Mirrors lib/grimoire/access.ts listAllows.
create or replace function public.coven_grimoire_allows(p_coven uuid, p_list jsonb, p_what text, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select case
      when c.founder_id = p_user then true
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

-- The rules that apply (already resolved from the page up), for this person.
-- Mirrors lib/grimoire/access.ts allows.
create or replace function public.coven_grimoire_chain_can(p_coven uuid, p_view jsonb, p_write jsonb, p_approve jsonb, p_what text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.is_community_moderator() then return true; end if;
  if auth.uid() is null or not public.coven_grimoire_allows(p_coven, p_view, 'view', auth.uid()) then return false; end if;
  if p_what = 'view' then return true; end if;
  if not public.coven_in_good_standing(p_coven) then return false; end if;
  if p_what = 'approve' then return public.coven_grimoire_allows(p_coven, p_approve, 'approve', auth.uid()); end if;
  return public.coven_grimoire_allows(p_coven, p_approve, 'approve', auth.uid())
      or public.coven_grimoire_allows(p_coven, p_write, 'write', auth.uid());
end;
$$;

create or replace function public.coven_grimoire_book_can(p_book uuid, p_what text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select public.coven_grimoire_chain_can(b.coven_id,
      public.coven_grimoire_rule(b.access, 'view'), public.coven_grimoire_rule(b.access, 'write'), public.coven_grimoire_rule(b.access, 'approve'), p_what)
    from public.coven_grimoire_books b where b.id = p_book
  ), false);
$$;

create or replace function public.coven_grimoire_section_can(p_section uuid, p_what text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select public.coven_grimoire_chain_can(s.coven_id,
      coalesce(public.coven_grimoire_rule(s.access, 'view'), public.coven_grimoire_rule(b.access, 'view')),
      coalesce(public.coven_grimoire_rule(s.access, 'write'), public.coven_grimoire_rule(b.access, 'write')),
      coalesce(public.coven_grimoire_rule(s.access, 'approve'), public.coven_grimoire_rule(b.access, 'approve')),
      p_what)
    from public.coven_grimoire_sections s
    join public.coven_grimoire_books b on b.id = s.book_id
    where s.id = p_section
  ), false);
$$;

create or replace function public.coven_grimoire_page_can(p_page uuid, p_what text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select public.coven_grimoire_chain_can(p.coven_id,
      coalesce(public.coven_grimoire_rule(p.access, 'view'), public.coven_grimoire_rule(s.access, 'view'), public.coven_grimoire_rule(b.access, 'view')),
      coalesce(public.coven_grimoire_rule(p.access, 'write'), public.coven_grimoire_rule(s.access, 'write'), public.coven_grimoire_rule(b.access, 'write')),
      coalesce(public.coven_grimoire_rule(p.access, 'approve'), public.coven_grimoire_rule(s.access, 'approve'), public.coven_grimoire_rule(b.access, 'approve')),
      p_what)
    from public.coven_grimoire_pages p
    join public.coven_grimoire_books b on b.id = p.book_id
    left join public.coven_grimoire_sections s on s.id = p.section_id
    where p.id = p_page
  ), false);
$$;

-- Where a new page or a suggestion is for: a section, or the book itself.
create or replace function public.coven_grimoire_place_can(p_book uuid, p_section uuid, p_what text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case when p_section is null then public.coven_grimoire_book_can(p_book, p_what)
              else public.coven_grimoire_section_can(p_section, p_what) end;
$$;

-- A section shows to those who can open it, or any page in it.
create or replace function public.coven_grimoire_section_visible(p_section uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.coven_grimoire_section_can(p_section, 'view')
      or exists (select 1 from public.coven_grimoire_pages p where p.section_id = p_section and public.coven_grimoire_page_can(p.id, 'view'));
$$;

-- Who approves a suggestion (for its notice): every active member the rules
-- name, the founder among them. Moderators aren't rung.
create or replace function public.coven_grimoire_submission_approvers(p_submission uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  with s as (select * from public.coven_grimoire_submissions where id = p_submission),
  rules as (
    select s.coven_id,
      coalesce(public.coven_grimoire_rule(p.access, 'view'), public.coven_grimoire_rule(sec.access, 'view'), public.coven_grimoire_rule(b.access, 'view')) as v,
      coalesce(public.coven_grimoire_rule(p.access, 'approve'), public.coven_grimoire_rule(sec.access, 'approve'), public.coven_grimoire_rule(b.access, 'approve')) as a
    from s
    join public.coven_grimoire_books b on b.id = s.book_id
    left join public.coven_grimoire_pages p on p.id = s.page_id
    left join public.coven_grimoire_sections sec on sec.id = coalesce(p.section_id, s.section_id)
  )
  select m.user_id
  from rules
  join public.coven_members m on m.coven_id = rules.coven_id and m.status = 'active'
  where public.coven_grimoire_allows(rules.coven_id, rules.v, 'view', m.user_id)
    and public.coven_grimoire_allows(rules.coven_id, rules.a, 'approve', m.user_id);
$$;

-- ---------------------------------------------------------------------------
-- Reading (row-level security; nothing is written directly)
-- ---------------------------------------------------------------------------

alter table public.coven_grimoire_books enable row level security;
alter table public.coven_grimoire_sections enable row level security;
alter table public.coven_grimoire_pages enable row level security;
alter table public.coven_grimoire_blocks enable row level security;
alter table public.coven_grimoire_page_links enable row level security;
alter table public.coven_grimoire_versions enable row level security;
alter table public.coven_grimoire_submissions enable row level security;

drop policy if exists "Members and moderators see the coven's book" on public.coven_grimoire_books;
create policy "Members and moderators see the coven's book" on public.coven_grimoire_books
  for select to authenticated using (public.is_coven_member(coven_id) or public.is_community_moderator());
drop policy if exists "Sections show to those who can open them or a page in them" on public.coven_grimoire_sections;
create policy "Sections show to those who can open them or a page in them" on public.coven_grimoire_sections
  for select to authenticated using (public.coven_grimoire_section_visible(id));
drop policy if exists "Pages show to those who can open them" on public.coven_grimoire_pages;
create policy "Pages show to those who can open them" on public.coven_grimoire_pages
  for select to authenticated using (public.coven_grimoire_page_can(id, 'view'));
drop policy if exists "Blocks show with their page" on public.coven_grimoire_blocks;
create policy "Blocks show with their page" on public.coven_grimoire_blocks
  for select to authenticated using (public.coven_grimoire_page_can(page_id, 'view'));
drop policy if exists "Links show when both pages can be opened" on public.coven_grimoire_page_links;
create policy "Links show when both pages can be opened" on public.coven_grimoire_page_links
  for select to authenticated using (public.coven_grimoire_page_can(source_page_id, 'view') and public.coven_grimoire_page_can(target_page_id, 'view'));
drop policy if exists "History shows to those who can write in the page" on public.coven_grimoire_versions;
create policy "History shows to those who can write in the page" on public.coven_grimoire_versions
  for select to authenticated using (public.coven_grimoire_page_can(page_id, 'write'));
drop policy if exists "Suggestions show to their sharer and their approvers" on public.coven_grimoire_submissions;
create policy "Suggestions show to their sharer and their approvers" on public.coven_grimoire_submissions
  for select to authenticated using (
    submitted_by = auth.uid()
    or (status <> 'draft' and case when page_id is not null then public.coven_grimoire_page_can(page_id, 'approve')
                                   else public.coven_grimoire_place_can(book_id, section_id, 'approve') end)
  );

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Stored block HTML (the grimoire's small subset) as plain text.
create or replace function public.coven_grimoire_plain(p_text text)
returns text
language sql
immutable
set search_path = public
as $$
  select btrim(
    replace(replace(replace(replace(replace(replace(
      regexp_replace(regexp_replace(coalesce(p_text, ''), '<br\s*/?>|</(p|div|li)>', E'\n', 'gi'), '<[^>]*>', '', 'g'),
      '&nbsp;', ' '), '&lt;', '<'), '&gt;', '>'), '&quot;', '"'), '&#39;', ''''), '&amp;', '&'),
    E' \n\r\t');
$$;

-- Plain text as text blocks: each paragraph (split on blank lines) one block,
-- escaped, its line breaks kept, as the grimoire stores rich blocks.
create or replace function public.coven_grimoire_text_blocks(p_text text)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('block_type', 'text', 'content', h.html, 'rich_content', jsonb_build_object('html', h.html), 'metadata', '{}'::jsonb) order by x.ord), '[]'::jsonb)
  from regexp_split_to_table(replace(coalesce(p_text, ''), E'\r\n', E'\n'), E'\\n[ \\t]*\\n') with ordinality as x(para, ord)
  cross join lateral (
    select replace(replace(replace(replace(btrim(x.para, E' \n\r\t'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), E'\n', '<br>') as html
  ) h
  where btrim(x.para, E' \n\r\t') <> '';
$$;

-- Blocks as they travel (suggestions, versions, the builder), checked: at
-- most 200, each a known shape within the tables' limits.
create or replace function public.coven_grimoire_clean_blocks(p_blocks jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  b jsonb;
  out jsonb := '[]'::jsonb;
  kind text;
begin
  if p_blocks is null or jsonb_typeof(p_blocks) <> 'array' then return '[]'::jsonb; end if;
  if jsonb_array_length(p_blocks) > 200 then raise exception 'A page can have up to 200 parts.'; end if;
  for b in select * from jsonb_array_elements(p_blocks) loop
    kind := coalesce(nullif(btrim(b->>'block_type'), ''), 'text');
    if char_length(kind) > 40 then raise exception 'That isn''t a kind of page element.'; end if;
    if char_length(coalesce(b->>'content', '')) > 40000 then raise exception 'One part of the page is too long.'; end if;
    out := out || jsonb_build_array(jsonb_build_object(
      'block_type', kind,
      'content', coalesce(b->>'content', ''),
      'rich_content', case when jsonb_typeof(b->'rich_content') = 'object' then b->'rich_content' else null end,
      'metadata', case when jsonb_typeof(b->'metadata') = 'object' then b->'metadata' else '{}'::jsonb end
    ));
  end loop;
  return out;
end;
$$;

-- Replaces a page's blocks with these (already cleaned).
create or replace function public.coven_grimoire_put_blocks(p_page uuid, p_blocks jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pg public.coven_grimoire_pages;
begin
  select * into pg from public.coven_grimoire_pages where id = p_page;
  if pg.id is null then return; end if;
  delete from public.coven_grimoire_blocks where page_id = pg.id;
  insert into public.coven_grimoire_blocks (coven_id, book_id, page_id, user_id, block_type, content, rich_content, metadata, sort_order)
  select pg.coven_id, pg.book_id, pg.id, auth.uid(), e->>'block_type', e->>'content',
         case when jsonb_typeof(e->'rich_content') = 'object' then e->'rich_content' end,
         coalesce(case when jsonb_typeof(e->'metadata') = 'object' then e->'metadata' end, '{}'::jsonb),
         (x.ord - 1)::integer
  from jsonb_array_elements(coalesce(p_blocks, '[]'::jsonb)) with ordinality as x(e, ord);
end;
$$;

-- Keeps a version of the page as it is now: one per sitting of one person's
-- edits (twenty minutes), the newest hundred per page.
create or replace function public.coven_grimoire_keep_version(p_page uuid, p_restored uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pg public.coven_grimoire_pages;
  last public.coven_grimoire_versions;
  snap jsonb;
begin
  select * into pg from public.coven_grimoire_pages where id = p_page;
  if pg.id is null then return; end if;
  select coalesce(jsonb_agg(jsonb_build_object('block_type', block_type, 'content', coalesce(content, ''), 'rich_content', rich_content, 'metadata', metadata) order by sort_order, created_at), '[]'::jsonb)
  into snap from public.coven_grimoire_blocks where page_id = p_page;
  select * into last from public.coven_grimoire_versions where page_id = p_page order by saved_at desc limit 1;
  if p_restored is null and last.id is not null and last.saved_by is not distinct from auth.uid()
     and last.restored_from is null and last.saved_at > now() - interval '20 minutes' then
    update public.coven_grimoire_versions set title = pg.title, page_type = pg.page_type, blocks = snap, saved_at = now() where id = last.id;
  else
    insert into public.coven_grimoire_versions (page_id, coven_id, title, page_type, blocks, saved_by, restored_from)
    values (pg.id, pg.coven_id, pg.title, pg.page_type, snap, auth.uid(), p_restored);
    delete from public.coven_grimoire_versions
    where page_id = p_page
      and id not in (select id from public.coven_grimoire_versions where page_id = p_page order by saved_at desc limit 100);
  end if;
end;
$$;

-- The coven's own shelves, made once per book.
create or replace function public.coven_grimoire_shelves(p_book uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.coven_grimoire_books;
begin
  select * into b from public.coven_grimoire_books where id = p_book;
  if b.id is null then return; end if;
  insert into public.coven_grimoire_sections (coven_id, book_id, title, sort_order, shelf)
  select b.coven_id, b.id, x.title, x.n, x.shelf
  from (values ('rites', 'Rites', 0), ('records', 'Ritual records', 1), ('minutes', 'Meeting minutes', 2), ('study', 'Study material', 3)) as x(shelf, title, n)
  where not exists (select 1 from public.coven_grimoire_sections s where s.book_id = b.id and s.shelf = x.shelf)
  on conflict do nothing;
end;
$$;

-- The section an old page or draft named ('Rites', 'Minutes'…), found or made.
create or replace function public.coven_grimoire_section_named(p_book uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.coven_grimoire_books;
  name text := left(btrim(coalesce(p_name, '')), 120);
  found uuid;
begin
  if name = '' then return null; end if;
  select * into b from public.coven_grimoire_books where id = p_book;
  select id into found from public.coven_grimoire_sections
  where book_id = p_book
    and (lower(title) = lower(name)
         or (shelf = 'minutes' and lower(name) in ('minutes', 'meetings', 'meeting minutes'))
         or (shelf = 'records' and lower(name) in ('ritual records', 'records'))
         or (shelf = 'study' and lower(name) in ('study', 'study material', 'lessons')))
  order by shelf nulls last
  limit 1;
  if found is null then
    insert into public.coven_grimoire_sections (coven_id, book_id, title, sort_order)
    values (b.coven_id, b.id, name, 10 + (select count(*) from public.coven_grimoire_sections where book_id = p_book)::integer)
    returning id into found;
  end if;
  return found;
end;
$$;

-- ---------------------------------------------------------------------------
-- Opening the book
-- ---------------------------------------------------------------------------

-- The coven's book, made (with its shelves) the first time a member opens it.
create or replace function public.open_coven_grimoire(p_coven uuid)
returns public.coven_grimoire_books
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.coven_grimoire_books;
begin
  if not (public.is_coven_member(p_coven) or public.is_community_moderator()) then
    raise exception 'Only the coven''s members can open its book.';
  end if;
  select * into b from public.coven_grimoire_books where coven_id = p_coven;
  if b.id is null then
    insert into public.coven_grimoire_books (coven_id, user_id) values (p_coven, auth.uid()) on conflict (coven_id) do nothing;
    select * into b from public.coven_grimoire_books where coven_id = p_coven;
    perform public.coven_grimoire_shelves(b.id);
  end if;
  return b;
end;
$$;

-- ---------------------------------------------------------------------------
-- Writing: the personal grimoire's operations, checked one by one
-- ---------------------------------------------------------------------------

-- p_op: { kind: 'insert' | 'update' | 'delete', table: 'grimoire_sections' |
-- 'grimoire_pages' | 'grimoire_blocks' | 'grimoire_page_links' |
-- 'grimoire_books', id, row (insert) or patch (update) }, as the app's
-- lib/grimoire/edits.ts builds them. An insert that already happened is let
-- be; a change to something already gone does nothing.
create or replace function public.apply_coven_grimoire_op(p_coven uuid, p_op jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  k text := p_op->>'kind';
  t text := p_op->>'table';
  rid uuid := nullif(p_op->>'id', '')::uuid;
  r jsonb := coalesce(case when p_op->>'kind' = 'insert' then p_op->'row' else p_op->'patch' end, '{}'::jsonb);
  b public.coven_grimoire_books;
  sec public.coven_grimoire_sections;
  pg public.coven_grimoire_pages;
  pg2 public.coven_grimoire_pages;
  blk public.coven_grimoire_blocks;
  lnk public.coven_grimoire_page_links;
  next_section uuid;
  touched uuid;
begin
  if k is null or k not in ('insert', 'update', 'delete') or rid is null then raise exception 'That change couldn''t be read.'; end if;
  if jsonb_typeof(r) <> 'object' then raise exception 'That change couldn''t be read.'; end if;
  if not (public.is_coven_member(p_coven) or public.is_community_moderator()) then
    raise exception 'Only the coven''s members can write in its book.';
  end if;

  if t = 'grimoire_books' then
    if k <> 'update' then raise exception 'The coven''s book is made when it''s first opened.'; end if;
    select * into b from public.coven_grimoire_books where id = rid and coven_id = p_coven;
    if b.id is null then return; end if;
    if not public.coven_grimoire_book_can(b.id, 'approve') then raise exception 'Only those who approve for the whole book can rename it.'; end if;
    if r ? 'title' and nullif(btrim(r->>'title'), '') is not null then
      update public.coven_grimoire_books set title = left(btrim(r->>'title'), 120), updated_at = now() where id = b.id;
    end if;
    return;

  elsif t = 'grimoire_sections' then
    if k = 'insert' then
      select * into b from public.coven_grimoire_books where id = nullif(r->>'book_id', '')::uuid and coven_id = p_coven;
      if b.id is null then raise exception 'That isn''t this coven''s book.'; end if;
      if not public.coven_grimoire_book_can(b.id, 'write') then raise exception 'Only those who write in the whole book can add a section.'; end if;
      insert into public.coven_grimoire_sections (id, coven_id, book_id, user_id, title, sort_order)
      values (rid, p_coven, b.id, auth.uid(), left(coalesce(nullif(btrim(r->>'title'), ''), 'Untitled section'), 120), coalesce((r->>'sort_order')::integer, 0))
      on conflict (id) do nothing;
      return;
    end if;
    select * into sec from public.coven_grimoire_sections where id = rid and coven_id = p_coven;
    if sec.id is null then return; end if;
    if k = 'update' then
      if not public.coven_grimoire_section_can(sec.id, 'write') then raise exception 'You can''t change that section.'; end if;
      update public.coven_grimoire_sections
      set title = case when r ? 'title' and nullif(btrim(r->>'title'), '') is not null then left(btrim(r->>'title'), 120) else title end,
          sort_order = case when r ? 'sort_order' then (r->>'sort_order')::integer else sort_order end,
          is_collapsed = case when r ? 'is_collapsed' then coalesce((r->>'is_collapsed')::boolean, false) else is_collapsed end,
          updated_at = now()
      where id = sec.id;
    else
      if not public.coven_grimoire_section_can(sec.id, 'approve') then raise exception 'Only those who approve for that section can remove it.'; end if;
      if sec.shelf is not null then raise exception 'The coven''s own shelves stay. Hide it from the contents instead.'; end if;
      delete from public.coven_grimoire_sections where id = sec.id;
    end if;
    return;

  elsif t = 'grimoire_pages' then
    if k = 'insert' then
      select * into b from public.coven_grimoire_books where id = nullif(r->>'book_id', '')::uuid and coven_id = p_coven;
      if b.id is null then raise exception 'That isn''t this coven''s book.'; end if;
      next_section := nullif(r->>'section_id', '')::uuid;
      if next_section is not null and not exists (select 1 from public.coven_grimoire_sections where id = next_section and book_id = b.id) then
        raise exception 'That section isn''t in this book.';
      end if;
      if not public.coven_grimoire_place_can(b.id, next_section, 'write') then raise exception 'You can''t add a page there. Suggest it instead.'; end if;
      insert into public.coven_grimoire_pages (id, coven_id, book_id, section_id, user_id, updated_by, title, icon, page_type, sort_order, metadata)
      values (rid, p_coven, b.id, next_section, auth.uid(), auth.uid(),
              left(coalesce(nullif(btrim(r->>'title'), ''), 'Untitled Page'), 200), left(coalesce(r->>'icon', ''), 40),
              left(nullif(r->>'page_type', ''), 40), coalesce((r->>'sort_order')::integer, 0),
              case when jsonb_typeof(r->'metadata') = 'object' then r->'metadata' else '{}'::jsonb end)
      on conflict (id) do nothing;
      touched := rid;
    else
      select * into pg from public.coven_grimoire_pages where id = rid and coven_id = p_coven;
      if pg.id is null then return; end if;
      if k = 'update' then
        if not public.coven_grimoire_page_can(pg.id, 'write') then raise exception 'You can''t change that page. Suggest changes instead.'; end if;
        next_section := case when r ? 'section_id' then nullif(r->>'section_id', '')::uuid else pg.section_id end;
        if next_section is distinct from pg.section_id then
          if next_section is not null and not exists (select 1 from public.coven_grimoire_sections where id = next_section and book_id = pg.book_id) then
            raise exception 'That section isn''t in this book.';
          end if;
          if not public.coven_grimoire_place_can(pg.book_id, next_section, 'write') then raise exception 'You can''t move a page there.'; end if;
        end if;
        update public.coven_grimoire_pages
        set title = case when r ? 'title' then left(coalesce(nullif(btrim(r->>'title'), ''), 'Untitled Page'), 200) else title end,
            section_id = next_section,
            sort_order = case when r ? 'sort_order' then (r->>'sort_order')::integer else sort_order end,
            page_type = case when r ? 'page_type' then left(nullif(r->>'page_type', ''), 40) else page_type end,
            icon = case when r ? 'icon' then left(coalesce(r->>'icon', ''), 40) else icon end,
            metadata = case when jsonb_typeof(r->'metadata') = 'object' then r->'metadata' else metadata end,
            updated_at = now(), updated_by = auth.uid()
        where id = pg.id;
        if r ? 'title' then touched := pg.id; end if;
      else
        if not public.coven_grimoire_page_can(pg.id, 'approve') then raise exception 'Only those who approve for that page can take it out of the book.'; end if;
        delete from public.coven_grimoire_pages where id = pg.id;
      end if;
    end if;

  elsif t = 'grimoire_blocks' then
    if k = 'insert' then
      select * into pg from public.coven_grimoire_pages where id = nullif(r->>'page_id', '')::uuid and coven_id = p_coven;
      if pg.id is null then raise exception 'That page isn''t in this coven''s book.'; end if;
      if not public.coven_grimoire_page_can(pg.id, 'write') then raise exception 'You can''t write on that page. Suggest changes instead.'; end if;
      insert into public.coven_grimoire_blocks (id, coven_id, book_id, page_id, user_id, block_type, content, rich_content, metadata, sort_order)
      values (rid, p_coven, pg.book_id, pg.id, auth.uid(), left(coalesce(nullif(r->>'block_type', ''), 'text'), 40), r->>'content',
              case when jsonb_typeof(r->'rich_content') = 'object' then r->'rich_content' end,
              case when jsonb_typeof(r->'metadata') = 'object' then r->'metadata' else '{}'::jsonb end,
              coalesce((r->>'sort_order')::integer, 0))
      on conflict (id) do nothing;
      touched := pg.id;
    else
      select * into blk from public.coven_grimoire_blocks where id = rid and coven_id = p_coven;
      if blk.id is null then return; end if;
      if not public.coven_grimoire_page_can(blk.page_id, 'write') then raise exception 'You can''t write on that page. Suggest changes instead.'; end if;
      if k = 'update' then
        update public.coven_grimoire_blocks
        set content = case when r ? 'content' then r->>'content' else content end,
            rich_content = case when r ? 'rich_content' then (case when jsonb_typeof(r->'rich_content') = 'object' then r->'rich_content' end) else rich_content end,
            metadata = case when jsonb_typeof(r->'metadata') = 'object' then r->'metadata' else metadata end,
            sort_order = case when r ? 'sort_order' then (r->>'sort_order')::integer else sort_order end,
            block_type = case when r ? 'block_type' and nullif(r->>'block_type', '') is not null then left(r->>'block_type', 40) else block_type end,
            updated_at = now()
        where id = blk.id;
      else
        delete from public.coven_grimoire_blocks where id = blk.id;
      end if;
      touched := blk.page_id;
    end if;
    update public.coven_grimoire_pages set updated_at = now(), updated_by = auth.uid() where id = touched;

  elsif t = 'grimoire_page_links' then
    if k = 'insert' then
      select * into pg from public.coven_grimoire_pages where id = nullif(r->>'source_page_id', '')::uuid and coven_id = p_coven;
      select * into pg2 from public.coven_grimoire_pages where id = nullif(r->>'target_page_id', '')::uuid and coven_id = p_coven;
      if pg.id is null or pg2.id is null or pg.id = pg2.id then raise exception 'Those pages can''t be linked.'; end if;
      if not public.coven_grimoire_page_can(pg.id, 'write') or not public.coven_grimoire_page_can(pg2.id, 'view') then
        raise exception 'You can''t link those pages.';
      end if;
      insert into public.coven_grimoire_page_links (id, coven_id, book_id, source_page_id, target_page_id, user_id, link_label)
      values (rid, p_coven, pg.book_id, pg.id, pg2.id, auth.uid(), left(coalesce(r->>'link_label', pg2.title), 200))
      on conflict (id) do nothing;
    elsif k = 'delete' then
      select * into lnk from public.coven_grimoire_page_links where id = rid and coven_id = p_coven;
      if lnk.id is null then return; end if;
      if not public.coven_grimoire_page_can(lnk.source_page_id, 'write') then raise exception 'You can''t change that page''s links.'; end if;
      delete from public.coven_grimoire_page_links where id = lnk.id;
    end if;
    return;

  else
    raise exception 'That isn''t part of a book.';
  end if;

  if touched is not null then perform public.coven_grimoire_keep_version(touched); end if;
end;
$$;

-- Who may do what, for one part of the book: p_kind 'book' | 'section' |
-- 'page', p_access {view?, write?, approve?} (lists of {kind, id}; a power
-- left out follows the level above). Set by those who approve for it.
create or replace function public.set_coven_grimoire_access(p_kind text, p_id uuid, p_access jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  coven uuid;
  cleaned jsonb := '{}'::jsonb;
  w text;
begin
  if p_kind = 'book' then
    select coven_id into coven from public.coven_grimoire_books where id = p_id;
    if coven is null or not public.coven_grimoire_book_can(p_id, 'approve') then raise exception 'Only those who approve for the whole book can choose who opens it.'; end if;
  elsif p_kind = 'section' then
    select coven_id into coven from public.coven_grimoire_sections where id = p_id;
    if coven is null or not public.coven_grimoire_section_can(p_id, 'approve') then raise exception 'Only those who approve for that section can choose who opens it.'; end if;
  elsif p_kind = 'page' then
    select coven_id into coven from public.coven_grimoire_pages where id = p_id;
    if coven is null or not public.coven_grimoire_page_can(p_id, 'approve') then raise exception 'Only those who approve for that page can choose who opens it.'; end if;
  else
    raise exception 'Unknown part of the book.';
  end if;
  if p_access is not null and jsonb_typeof(p_access) <> 'object' then raise exception 'That couldn''t be read.'; end if;
  foreach w in array array['view', 'write', 'approve'] loop
    if jsonb_typeof(p_access -> w) = 'array' then
      cleaned := cleaned || jsonb_build_object(w, case when jsonb_array_length(p_access -> w) = 0 then '[]'::jsonb
        else public.coven_clean_assignees(coven, p_access -> w, initcap(w), false) end);
    end if;
  end loop;
  if p_kind = 'book' then update public.coven_grimoire_books set access = cleaned, updated_at = now() where id = p_id;
  elsif p_kind = 'section' then update public.coven_grimoire_sections set access = cleaned, updated_at = now() where id = p_id;
  else update public.coven_grimoire_pages set access = cleaned, updated_at = now(), updated_by = auth.uid() where id = p_id;
  end if;
  return cleaned;
end;
$$;

-- The home's layout for everyone (order, names, what's hidden), as
-- lib/grimoire/layout.ts keeps it. Set by those who approve for the whole book.
create or replace function public.set_coven_grimoire_layout(p_book uuid, p_layout jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.coven_grimoire_book_can(p_book, 'approve') then raise exception 'Only those who approve for the whole book can arrange its contents.'; end if;
  if p_layout is null or jsonb_typeof(p_layout) <> 'object' or octet_length(p_layout::text) > 30000 then raise exception 'That arrangement couldn''t be read.'; end if;
  update public.coven_grimoire_books set layout = p_layout, updated_at = now() where id = p_book;
  return p_layout;
end;
$$;

-- Puts a page back as one of its versions (kept as a new version).
create or replace function public.restore_coven_grimoire_version(p_version uuid)
returns public.coven_grimoire_pages
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.coven_grimoire_versions;
  pg public.coven_grimoire_pages;
begin
  select * into v from public.coven_grimoire_versions where id = p_version;
  if v.id is null then raise exception 'That version isn''t kept any more.'; end if;
  if not public.coven_grimoire_page_can(v.page_id, 'write') then raise exception 'Only those who write in the page can restore it.'; end if;
  perform public.coven_grimoire_put_blocks(v.page_id, public.coven_grimoire_clean_blocks(v.blocks));
  update public.coven_grimoire_pages set title = left(v.title, 200), updated_at = now(), updated_by = auth.uid()
  where id = v.page_id returning * into pg;
  perform public.coven_grimoire_keep_version(pg.id, v.id);
  return pg;
end;
$$;

-- ---------------------------------------------------------------------------
-- Suggestions
-- ---------------------------------------------------------------------------

-- Publishes a suggestion: changes onto its page, or a new page in its place
-- (crediting whoever shared it). Called once it's approved.
create or replace function public.coven_grimoire_publish(p_submission uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_grimoire_submissions;
  pg public.coven_grimoire_pages;
  new_id uuid;
begin
  select * into s from public.coven_grimoire_submissions where id = p_submission;
  if s.page_id is not null then
    select * into pg from public.coven_grimoire_pages where id = s.page_id;
    if pg.id is null then raise exception 'That page is no longer in the book.'; end if;
    perform public.coven_grimoire_put_blocks(pg.id, s.blocks);
    update public.coven_grimoire_pages set title = left(s.title, 200), updated_at = now(), updated_by = auth.uid() where id = pg.id;
    new_id := pg.id;
  else
    insert into public.coven_grimoire_pages (coven_id, book_id, section_id, user_id, updated_by, shared_by, title, page_type, sort_order, metadata)
    values (s.coven_id, s.book_id, s.section_id, s.submitted_by, auth.uid(), s.submitted_by, left(s.title, 200), s.page_type,
            coalesce((select max(sort_order) + 1 from public.coven_grimoire_pages where book_id = s.book_id and section_id is not distinct from s.section_id), 0),
            jsonb_build_object('sharedBy', s.submitted_by, 'submission', s.id))
    returning id into new_id;
    perform public.coven_grimoire_put_blocks(new_id, s.blocks);
  end if;
  update public.coven_grimoire_submissions
  set status = 'approved', reviewer_id = auth.uid(), published_page_id = new_id, updated_at = now()
  where id = s.id;
  perform public.coven_grimoire_keep_version(new_id);
  return new_id;
end;
$$;

-- Suggest a page: p_page for changes to a page of the book, else p_section
-- (or null, the book's loose pages) for a new one; p_source_page when it's a
-- copy of a page of your own grimoire; p_submission to change your own (not
-- yet sent, or sent back) and send it again. p_send false keeps it as a draft.
-- An approver's own suggestion goes straight into the book.
create or replace function public.submit_coven_grimoire_page(
  p_coven uuid, p_section uuid, p_page uuid, p_title text, p_page_type text, p_blocks jsonb,
  p_note text default null, p_source_page uuid default null, p_submission uuid default null, p_send boolean default true
)
returns public.coven_grimoire_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.coven_grimoire_books;
  s public.coven_grimoire_submissions;
  target_section uuid := p_section;
  cleaned jsonb := public.coven_grimoire_clean_blocks(p_blocks);
begin
  if not (public.coven_in_good_standing(p_coven) or public.is_community_moderator()) then
    raise exception 'Members in good standing can suggest pages for the coven''s book.';
  end if;
  if nullif(btrim(coalesce(p_title, '')), '') is null then raise exception 'Give the page a title.'; end if;
  b := public.open_coven_grimoire(p_coven);
  if p_page is not null then
    select section_id into target_section from public.coven_grimoire_pages where id = p_page and book_id = b.id;
    if not found then raise exception 'That page isn''t in this coven''s book.'; end if;
    if not public.coven_grimoire_page_can(p_page, 'view') then raise exception 'That page isn''t in this coven''s book.'; end if;
  else
    if target_section is not null and not exists (select 1 from public.coven_grimoire_sections where id = target_section and book_id = b.id) then
      raise exception 'That section isn''t in this coven''s book.';
    end if;
    if not public.coven_grimoire_place_can(b.id, target_section, 'view') then raise exception 'That section isn''t in this coven''s book.'; end if;
  end if;

  if p_submission is null then
    insert into public.coven_grimoire_submissions (coven_id, book_id, section_id, page_id, source_page_id, title, page_type, blocks, note, status, submitted_by)
    values (p_coven, b.id, target_section, p_page, p_source_page, left(btrim(p_title), 200), left(nullif(p_page_type, ''), 40), cleaned,
            nullif(btrim(coalesce(p_note, '')), ''), 'draft', auth.uid())
    returning * into s;
  else
    select * into s from public.coven_grimoire_submissions where id = p_submission and coven_id = p_coven for update;
    if s.id is null or s.submitted_by <> auth.uid() then raise exception 'You can only change your own suggestions.'; end if;
    if s.status not in ('draft', 'returned') then raise exception 'That suggestion has already been decided or is waiting.'; end if;
    update public.coven_grimoire_submissions
    set section_id = target_section, page_id = p_page, title = left(btrim(p_title), 200), page_type = left(nullif(p_page_type, ''), 40),
        blocks = cleaned, note = nullif(btrim(coalesce(p_note, '')), ''), status = 'draft', updated_at = now()
    where id = s.id
    returning * into s;
  end if;

  if p_send then
    update public.coven_grimoire_submissions set status = 'pending', submitted_at = now(), updated_at = now() where id = s.id returning * into s;
    if (p_page is not null and public.coven_grimoire_page_can(p_page, 'approve'))
       or (p_page is null and public.coven_grimoire_place_can(b.id, target_section, 'approve')) then
      perform public.coven_grimoire_publish(s.id);
      select * into s from public.coven_grimoire_submissions where id = s.id;
    end if;
  end if;
  return s;
end;
$$;

-- Decide a suggestion: 'approve' (optionally with the approver's own title,
-- section and blocks), 'return' (sent back with a note to change and send
-- again) or 'decline'.
create or replace function public.review_coven_grimoire_submission(
  p_submission uuid, p_decision text, p_note text default null, p_title text default null, p_section uuid default null, p_blocks jsonb default null
)
returns public.coven_grimoire_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_grimoire_submissions;
  allowed boolean;
begin
  select * into s from public.coven_grimoire_submissions where id = p_submission for update;
  if s.id is null then raise exception 'That suggestion was not found.'; end if;
  allowed := case when s.page_id is not null then public.coven_grimoire_page_can(s.page_id, 'approve')
                  else public.coven_grimoire_place_can(s.book_id, s.section_id, 'approve') end;
  if not allowed then raise exception 'Only those who approve for that part of the book can decide it.'; end if;
  if s.status <> 'pending' then raise exception 'That suggestion isn''t waiting for approval.'; end if;
  if p_decision = 'approve' then
    if s.page_id is null and p_section is not null and p_section is distinct from s.section_id then
      if not exists (select 1 from public.coven_grimoire_sections where id = p_section and book_id = s.book_id)
         or not public.coven_grimoire_section_can(p_section, 'approve') then
        raise exception 'You can''t file it in that section.';
      end if;
    end if;
    update public.coven_grimoire_submissions
    set title = coalesce(left(nullif(btrim(p_title), ''), 200), title),
        section_id = case when page_id is null and p_section is not null then p_section else section_id end,
        blocks = case when p_blocks is not null then public.coven_grimoire_clean_blocks(p_blocks) else blocks end,
        reviewer_note = nullif(btrim(coalesce(p_note, '')), '')
    where id = s.id;
    perform public.coven_grimoire_publish(s.id);
  elsif p_decision in ('return', 'decline') then
    update public.coven_grimoire_submissions
    set status = case when p_decision = 'return' then 'returned' else 'declined' end,
        reviewer_id = auth.uid(), reviewer_note = nullif(btrim(coalesce(p_note, '')), ''), updated_at = now()
    where id = s.id;
  else
    raise exception 'Approve, send back or decline.';
  end if;
  select * into s from public.coven_grimoire_submissions where id = p_submission;
  return s;
end;
$$;

-- Take back (delete) your own suggestion while it isn't decided; approvers can
-- clear decided ones away.
create or replace function public.remove_coven_grimoire_submission(p_submission uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.coven_grimoire_submissions;
begin
  select * into s from public.coven_grimoire_submissions where id = p_submission;
  if s.id is null then return; end if;
  if not ((s.submitted_by = auth.uid() and s.status in ('draft', 'pending', 'returned', 'declined'))
          or public.is_community_moderator()) then
    raise exception 'You can only take back your own suggestions.';
  end if;
  delete from public.coven_grimoire_submissions where id = s.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- The ritual builder and the Book
-- ---------------------------------------------------------------------------

-- What the builder saves (p_what: 'rite' | 'agenda' | 'record' | 'minutes')
-- onto its shelf (Rites; Meeting minutes; Ritual records), once per
-- gathering: saving again changes the same page (a new version). Those who
-- can't write there send it as a suggestion. Returns { status, page_id, submission_id }.
create or replace function public.save_coven_grimoire_gathering(p_coven uuid, p_ritual uuid, p_what text, p_title text, p_blocks jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.coven_grimoire_books;
  shelf_id uuid;
  pg public.coven_grimoire_pages;
  s public.coven_grimoire_submissions;
  cleaned jsonb := public.coven_grimoire_clean_blocks(p_blocks);
  wanted text := case p_what when 'rite' then 'rites' when 'record' then 'records' when 'agenda' then 'minutes' when 'minutes' then 'minutes' end;
begin
  if wanted is null then raise exception 'Save a rite, an agenda, a record or minutes.'; end if;
  if not exists (select 1 from public.coven_rituals where id = p_ritual and coven_id = p_coven) then raise exception 'That gathering isn''t this coven''s.'; end if;
  if not (public.coven_in_good_standing(p_coven) or public.is_community_moderator()) then raise exception 'Members in good standing can save to the coven''s book.'; end if;
  b := public.open_coven_grimoire(p_coven);
  perform public.coven_grimoire_shelves(b.id);
  select id into shelf_id from public.coven_grimoire_sections where book_id = b.id and shelf = wanted;
  select * into pg from public.coven_grimoire_pages
  where book_id = b.id and metadata->>'covenRitual' = p_ritual::text and metadata->>'gathering' = p_what
  order by created_at limit 1;

  if pg.id is not null and public.coven_grimoire_page_can(pg.id, 'write') then
    perform public.coven_grimoire_put_blocks(pg.id, cleaned);
    update public.coven_grimoire_pages set title = left(btrim(p_title), 200), updated_at = now(), updated_by = auth.uid() where id = pg.id;
    perform public.coven_grimoire_keep_version(pg.id);
    return jsonb_build_object('status', 'published', 'page_id', pg.id);
  elsif pg.id is null and public.coven_grimoire_section_can(shelf_id, 'write') then
    insert into public.coven_grimoire_pages (coven_id, book_id, section_id, user_id, updated_by, title, page_type, sort_order, metadata)
    values (p_coven, b.id, shelf_id, auth.uid(), auth.uid(), left(btrim(p_title), 200), case when p_what = 'rite' then 'ritual' end,
            coalesce((select max(sort_order) + 1 from public.coven_grimoire_pages where section_id = shelf_id), 0),
            jsonb_build_object('covenRitual', p_ritual, 'gathering', p_what))
    returning * into pg;
    perform public.coven_grimoire_put_blocks(pg.id, cleaned);
    perform public.coven_grimoire_keep_version(pg.id);
    return jsonb_build_object('status', 'published', 'page_id', pg.id);
  end if;
  s := public.submit_coven_grimoire_page(p_coven, case when pg.id is null then shelf_id end, pg.id, p_title,
                                          case when p_what = 'rite' then 'ritual' end, cleaned, null, null, null, true);
  return jsonb_build_object('status', s.status, 'page_id', s.published_page_id, 'submission_id', s.id);
end;
$$;

-- The pages the builder can link words from, as plain text (the old
-- coven_book_pages shape), only those this person can open. Pages named in
-- p_ids that are there but closed to them come back as { id, hidden } only.
create or replace function public.coven_grimoire_page_texts(p_coven uuid, p_ids uuid[] default null)
returns table (id uuid, coven_id uuid, title text, section text, body text, version integer, author_id uuid, published_by uuid, published_at timestamptz, hidden boolean)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.coven_id, p.title, s.title,
    coalesce((select string_agg(public.coven_grimoire_plain(bl.content), E'\n\n' order by bl.sort_order, bl.created_at)
              from public.coven_grimoire_blocks bl
              where bl.page_id = p.id and bl.block_type not in ('divider', 'image', 'page_link')
                and public.coven_grimoire_plain(bl.content) <> ''), ''),
    greatest(1, (select count(*) from public.coven_grimoire_versions v where v.page_id = p.id))::integer,
    coalesce(p.shared_by, p.user_id), p.updated_by, p.updated_at, false
  from public.coven_grimoire_pages p
  left join public.coven_grimoire_sections s on s.id = p.section_id
  where p.coven_id = p_coven and public.coven_grimoire_page_can(p.id, 'view')
  union all
  select p.id, p.coven_id, '', null, '', 1, null, null, p.updated_at, true
  from public.coven_grimoire_pages p
  where p.coven_id = p_coven and p_ids is not null and p.id = any(p_ids)
    and public.is_coven_member(p_coven) and not public.coven_grimoire_page_can(p.id, 'view');
$$;

-- ---------------------------------------------------------------------------
-- The old book, copied in (pages keep their ids; nothing old is removed)
-- ---------------------------------------------------------------------------

do $$
declare
  bk record;
begin
  insert into public.coven_grimoire_books (coven_id, title)
  select distinct x.coven_id, 'Book of Shadows'
  from (select coven_id from public.coven_book_pages union select coven_id from public.coven_book_drafts) x
  on conflict (coven_id) do nothing;

  for bk in select id from public.coven_grimoire_books loop
    perform public.coven_grimoire_shelves(bk.id);
  end loop;

  insert into public.coven_grimoire_pages (id, coven_id, book_id, section_id, user_id, updated_by, title, page_type, sort_order, metadata, created_at, updated_at)
  select p.id, p.coven_id, b.id, public.coven_grimoire_section_named(b.id, p.section), p.author_id, coalesce(p.published_by, p.author_id),
         left(p.title, 200), null, 0, jsonb_build_object('fromCovenBook', p.id, 'oldVersion', p.version), p.created_at, p.published_at
  from public.coven_book_pages p
  join public.coven_grimoire_books b on b.coven_id = p.coven_id
  where not exists (select 1 from public.coven_grimoire_pages x where x.id = p.id)
  order by p.coven_id, p.section, p.title;

  insert into public.coven_grimoire_blocks (coven_id, book_id, page_id, user_id, block_type, content, rich_content, metadata, sort_order, created_at)
  select p.coven_id, b.id, p.id, p.author_id, e->>'block_type', e->>'content', e->'rich_content', '{}'::jsonb, (x.ord - 1)::integer, p.created_at
  from public.coven_book_pages p
  join public.coven_grimoire_books b on b.coven_id = p.coven_id
  cross join lateral jsonb_array_elements(public.coven_grimoire_text_blocks(p.body)) with ordinality as x(e, ord)
  where not exists (select 1 from public.coven_grimoire_blocks bl where bl.page_id = p.id);

  insert into public.coven_grimoire_versions (page_id, coven_id, title, page_type, blocks, saved_by, saved_at)
  select p.id, p.coven_id, left(p.title, 200), null, public.coven_grimoire_text_blocks(p.body), coalesce(p.published_by, p.author_id), p.published_at
  from public.coven_book_pages p
  where exists (select 1 from public.coven_grimoire_pages x where x.id = p.id)
    and not exists (select 1 from public.coven_grimoire_versions v where v.page_id = p.id);

  insert into public.coven_grimoire_submissions (coven_id, book_id, section_id, page_id, title, blocks, status, submitted_by, reviewer_id, reviewer_note,
                                                 legacy_draft_id, submitted_at, created_at, updated_at)
  select d.coven_id, b.id, public.coven_grimoire_section_named(b.id, d.section),
         case when exists (select 1 from public.coven_grimoire_pages x where x.id = d.page_id) then d.page_id end,
         left(d.title, 200), public.coven_grimoire_text_blocks(d.body),
         case d.status when 'pending' then 'pending' when 'declined' then 'returned' else 'draft' end,
         d.author_id, d.reviewer_id, d.reviewer_note, d.id, d.submitted_at, d.created_at, d.updated_at
  from public.coven_book_drafts d
  join public.coven_grimoire_books b on b.coven_id = d.coven_id
  where d.status <> 'published'
  on conflict (legacy_draft_id) do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- Notices: a suggestion rings its approvers once, and its answer the sharer
-- (supabase/functions/coven-notify, { grimoire_submission_id }).
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'coven_request_notices') then
    alter table public.coven_request_notices drop constraint if exists coven_request_notices_request_kind_check;
    alter table public.coven_request_notices add constraint coven_request_notices_request_kind_check
      check (request_kind in ('application', 'advancement', 'grimoire_submission'));
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what, and live updates
-- ---------------------------------------------------------------------------

revoke execute on function
  public.coven_grimoire_put_blocks(uuid, jsonb),
  public.coven_grimoire_keep_version(uuid, uuid),
  public.coven_grimoire_shelves(uuid),
  public.coven_grimoire_section_named(uuid, text),
  public.coven_grimoire_publish(uuid),
  public.coven_grimoire_submission_approvers(uuid)
from public, anon, authenticated;
grant execute on function public.coven_grimoire_submission_approvers(uuid) to service_role;
revoke execute on function
  public.coven_grimoire_allows(uuid, jsonb, text, uuid),
  public.coven_grimoire_chain_can(uuid, jsonb, jsonb, jsonb, text),
  public.coven_grimoire_book_can(uuid, text),
  public.coven_grimoire_section_can(uuid, text),
  public.coven_grimoire_page_can(uuid, text),
  public.coven_grimoire_place_can(uuid, uuid, text),
  public.coven_grimoire_section_visible(uuid),
  public.coven_grimoire_clean_blocks(jsonb),
  public.coven_grimoire_text_blocks(text),
  public.open_coven_grimoire(uuid),
  public.apply_coven_grimoire_op(uuid, jsonb),
  public.set_coven_grimoire_access(text, uuid, jsonb),
  public.set_coven_grimoire_layout(uuid, jsonb),
  public.restore_coven_grimoire_version(uuid),
  public.submit_coven_grimoire_page(uuid, uuid, uuid, text, text, jsonb, text, uuid, uuid, boolean),
  public.review_coven_grimoire_submission(uuid, text, text, text, uuid, jsonb),
  public.remove_coven_grimoire_submission(uuid),
  public.save_coven_grimoire_gathering(uuid, uuid, text, text, jsonb),
  public.coven_grimoire_page_texts(uuid, uuid[])
from public, anon;
grant execute on function
  public.coven_grimoire_allows(uuid, jsonb, text, uuid),
  public.coven_grimoire_chain_can(uuid, jsonb, jsonb, jsonb, text),
  public.coven_grimoire_book_can(uuid, text),
  public.coven_grimoire_section_can(uuid, text),
  public.coven_grimoire_page_can(uuid, text),
  public.coven_grimoire_place_can(uuid, uuid, text),
  public.coven_grimoire_section_visible(uuid),
  public.coven_grimoire_clean_blocks(jsonb),
  public.coven_grimoire_text_blocks(text),
  public.open_coven_grimoire(uuid),
  public.apply_coven_grimoire_op(uuid, jsonb),
  public.set_coven_grimoire_access(text, uuid, jsonb),
  public.set_coven_grimoire_layout(uuid, jsonb),
  public.restore_coven_grimoire_version(uuid),
  public.submit_coven_grimoire_page(uuid, uuid, uuid, text, text, jsonb, text, uuid, uuid, boolean),
  public.review_coven_grimoire_submission(uuid, text, text, text, uuid, jsonb),
  public.remove_coven_grimoire_submission(uuid),
  public.save_coven_grimoire_gathering(uuid, uuid, text, text, jsonb),
  public.coven_grimoire_page_texts(uuid, uuid[])
to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coven_grimoire_submissions') then
      alter publication supabase_realtime add table public.coven_grimoire_submissions;
    end if;
  end if;
end;
$$;
