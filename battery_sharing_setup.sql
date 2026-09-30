-- Battery sharing: lets a researcher share one battery (config + data) with
-- another researcher account by email, without giving them access to
-- anything else. Run this once in the Supabase SQL editor.
--
-- These are ADDITIVE policies — they only add read access for shared rows,
-- they never narrow or remove any researcher's access to their own rows.
--
-- The batteries <-> battery_shares checks go through SECURITY DEFINER
-- functions rather than a plain EXISTS subquery on the other table. A plain
-- subquery re-triggers that table's own RLS policies, and since batteries'
-- policy checks battery_shares while battery_shares' policy checks
-- batteries, that's a direct cycle — Postgres errors with "infinite
-- recursion detected in policy". A SECURITY DEFINER function runs as its
-- (table-owning) creator, which bypasses RLS instead of re-evaluating it,
-- so the check happens without looping back.

create table if not exists battery_shares (
  battery_id uuid not null references batteries(id) on delete cascade,
  shared_with_email text not null,
  created_at timestamptz not null default now(),
  primary key (battery_id, shared_with_email)
);

alter table battery_shares enable row level security;

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

-- The battery's owner can see, add, and remove shares on their own batteries.
create policy "owner_manage_shares"
  on battery_shares
  for all
  using (battery_owned_by_me(battery_id))
  with check (battery_owned_by_me(battery_id));

-- A researcher can see the share rows naming their own email, so the app
-- can list "shared with you" batteries.
create policy "shared_user_select_own_shares"
  on battery_shares
  for select
  using (lower(shared_with_email) = lower(auth.jwt() ->> 'email'));

-- A shared battery becomes readable (not editable) by the researcher it's
-- shared with.
create policy "shared_user_select_battery"
  on batteries
  for select
  using (battery_shared_with_me(id));

-- Its results become readable too, so export works for whoever it's shared
-- with. psychojs_results.session_id is text, not uuid, hence the cast.
create policy "shared_user_select_results"
  on psychojs_results
  for select
  using (battery_shared_with_me(session_id::uuid));
