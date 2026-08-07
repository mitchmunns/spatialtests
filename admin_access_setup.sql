-- Admin cross-lab read access for the "All labs" page.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
--
-- These are ADDITIVE, SELECT-only policies scoped to a single email address.
-- Postgres RLS OR's together every policy that applies to the same command,
-- so this can only grant mitchmunns@ucsb.edu extra read access — it cannot
-- take away or narrow any existing researcher's access to their own rows.
--
-- To add another admin later, add another `or lower(auth.jwt() ->> 'email') = '...'`
-- line to each policy below (or move the check to an is_admin column).

create policy "admin_select_all_batteries"
  on batteries
  for select
  using (lower(auth.jwt() ->> 'email') = 'mitchmunns@ucsb.edu');

create policy "admin_select_all_results"
  on psychojs_results
  for select
  using (lower(auth.jwt() ->> 'email') = 'mitchmunns@ucsb.edu');

create policy "admin_select_all_researchers"
  on researchers
  for select
  using (lower(auth.jwt() ->> 'email') = 'mitchmunns@ucsb.edu');
