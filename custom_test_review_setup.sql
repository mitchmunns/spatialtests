-- Custom tests start private (only their author sees and uses them). An
-- administrator can add one to the shared catalog for everyone.
-- Run once in the Supabase SQL editor. Adds a column, a table, functions,
-- policies and a trigger; deletes no rows.

-- 1. Catalog flag. Existing custom tests stay private (false).
alter table custom_tests add column if not exists published boolean not null default false;

-- 2. Administrator list. To add an admin later:
--    insert into app_admins (email) values ('someone@ucsb.edu');
create table if not exists app_admins (email text primary key);
alter table app_admins enable row level security; -- no policies: only readable through is_admin()
insert into app_admins (email) values ('mitchmunns@ucsb.edu') on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from app_admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;
grant execute on function public.is_admin() to authenticated;

-- 3. Who can see custom tests. (Participants already read them by id when
--    running a battery; that existing access is left alone.)
create policy "published_custom_tests_visible"
  on custom_tests for select to authenticated
  using (published);

create policy "admin_select_all_custom_tests"
  on custom_tests for select to authenticated
  using (is_admin());

create policy "admin_update_custom_tests"
  on custom_tests for update to authenticated
  using (is_admin())
  with check (is_admin());

-- 4. Only an admin can change the catalog flag, even on their own test.
create or replace function public.guard_custom_test_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.published and not is_admin() then
      new.published := false;
    end if;
  elsif new.published is distinct from old.published and not is_admin() then
    raise exception 'Only an administrator can add or remove a test from the catalog';
  end if;
  return new;
end;
$$;

drop trigger if exists custom_tests_guard_published on custom_tests;
create trigger custom_tests_guard_published
  before insert or update on custom_tests
  for each row execute function guard_custom_test_published();

-- 5. Point the existing "All labs" admin policies at the same admin list,
--    so adding someone to app_admins gives them the whole admin page.
--    (Drops and recreates access rules only — no data is touched.)
drop policy if exists "admin_select_all_batteries" on batteries;
drop policy if exists "admin_select_all_results" on psychojs_results;
drop policy if exists "admin_select_all_researchers" on researchers;

create policy "admin_select_all_batteries"
  on batteries for select using (is_admin());
create policy "admin_select_all_results"
  on psychojs_results for select using (is_admin());
create policy "admin_select_all_researchers"
  on researchers for select using (is_admin());
