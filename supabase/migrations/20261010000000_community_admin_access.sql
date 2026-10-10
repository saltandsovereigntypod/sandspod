-- Applied to sandspod-dev on 2026-10-10 (migration "community_admin_access").
-- The admin review page (js/admin-submissions.js) reads every submission and
-- reply thread, marks replies read and answers as Salt & Sovereignty, but RLS
-- only let people see their own or published submissions, so the review queue
-- was always empty. Admins (user_roles.role = 'admin', via has_role) can now
-- do what that page does. Nothing changes for anyone else.

create policy "Admins can read all submissions"
  on public.community_submissions for select to authenticated
  using (public.has_role('admin'));

create policy "Admins can read all submission messages"
  on public.community_submission_messages for select to authenticated
  using (public.has_role('admin'));

create policy "Admins can reply to submissions"
  on public.community_submission_messages for insert to authenticated
  with check (public.has_role('admin') and sender_role = 'admin' and user_id = auth.uid());

create policy "Admins can update submission messages"
  on public.community_submission_messages for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));
