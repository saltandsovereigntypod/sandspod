-- Applied 2026-10-31. A coven ritual's description may now be up to 12,000
-- characters (was 4,000), so a full rite's introduction and preparation fit.
alter table public.coven_rituals drop constraint if exists coven_rituals_description_check;
alter table public.coven_rituals add constraint coven_rituals_description_check check (description is null or char_length(description) <= 12000);
