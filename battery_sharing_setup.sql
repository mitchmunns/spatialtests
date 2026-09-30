-- Battery sharing: lets a researcher share one battery (config + data) with
-- another researcher account by email, without giving them access to
-- anything else. Run this once in the Supabase SQL editor.
--
-- These are ADDITIVE policies — they only add read access for shared rows,
-- they never narrow or remove any researcher's access to their own rows.

create table if not exists battery_shares (
  battery_id uuid not null references batteries(id) on delete cascade,
  shared_with_email text not null,
  created_at timestamptz not null default now(),
  primary key (battery_id, shared_with_email)
);

alter table battery_shares enable row level security;

-- The battery's owner can see, add, and remove shares on their own batteries.
create policy "owner_manage_shares"
  on battery_shares
  for all
  using (
    exists (
      select 1 from batteries
      where batteries.id = battery_shares.battery_id
        and batteries.researcher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from batteries
      where batteries.id = battery_shares.battery_id
        and batteries.researcher_id = auth.uid()
    )
  );

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
  using (
    exists (
      select 1 from battery_shares
      where battery_shares.battery_id = batteries.id
        and lower(battery_shares.shared_with_email) = lower(auth.jwt() ->> 'email')
    )
  );

-- Its results become readable too, so export works for whoever it's shared
-- with. Cast to text on both sides of the join — psychojs_results.session_id
-- is text, not uuid, so a bare comparison to battery_shares.battery_id errors.
create policy "shared_user_select_results"
  on psychojs_results
  for select
  using (
    exists (
      select 1 from battery_shares
      where battery_shares.battery_id::text = psychojs_results.session_id::text
        and lower(battery_shares.shared_with_email) = lower(auth.jwt() ->> 'email')
    )
  );
