-- Applied 2026-10-30. Additive and safe to run again.
--
-- coven_members.visiting_from (20261112000000_coven_lineage.sql) was a second
-- foreign key from coven_members to covens, which made every
-- coven_members→covens embed ambiguous to PostgREST (300 Multiple Choices):
-- "my covens" came back as an error in the app ("Offline") and empty on the
-- website. The column stays; it no longer declares the link (the lineage code
-- already treats a coven that's gone as no longer visiting). The app and the
-- website also name the link they mean (covens!coven_members_coven_id_fkey).
alter table public.coven_members drop constraint if exists coven_members_visiting_from_fkey;
notify pgrst, 'reload schema';
