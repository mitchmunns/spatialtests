-- Lets an administrator delete a custom test from the "All labs" page.
-- Run once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Adds one access rule; it deletes no rows by itself.
-- Needs custom_test_review_setup.sql (for is_admin()) to have been run first.

create policy "admin_delete_custom_tests"
  on custom_tests for delete to authenticated
  using (is_admin());
