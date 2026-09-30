-- Run this once in the Supabase SQL editor to fix the "infinite recursion
-- detected in policy for relation batteries" error. Replaces the two
-- policies that referenced each other directly with versions that go
-- through a SECURITY DEFINER function instead (see battery_sharing_setup.sql
-- for the full explanation). Safe to run even if you're not sure which
-- policies are still broken — every statement below is drop-if-exists /
-- create-or-replace.

drop policy if exists "owner_manage_shares" on battery_shares;
drop policy if exists "shared_user_select_battery" on batteries;
drop policy if exists "shared_user_select_results" on psychojs_results;

create or replace function public.battery_owned_by_me(check_battery_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from batteries
    where batteries.id = check_battery_id
      and batteries.researcher_id = auth.uid()
  );
$$;

create or replace function public.battery_shared_with_me(check_battery_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from battery_shares
    where battery_shares.battery_id = check_battery_id
      and lower(battery_shares.shared_with_email) = lower(auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.battery_owned_by_me(uuid) to authenticated;
grant execute on function public.battery_shared_with_me(uuid) to authenticated;

create policy "owner_manage_shares"
  on battery_shares
  for all
  using (battery_owned_by_me(battery_id))
  with check (battery_owned_by_me(battery_id));

create policy "shared_user_select_battery"
  on batteries
  for select
  using (battery_shared_with_me(id));

create policy "shared_user_select_results"
  on psychojs_results
  for select
  using (battery_shared_with_me(session_id::uuid));
