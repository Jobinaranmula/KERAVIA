-- ============================================================
-- KERAVIA — make yourself the admin (run AFTER schema.sql)
--
-- 1) First create your user in: Dashboard → Authentication → Users
--    → "Add user" → "Create new user" (your email + a strong password,
--    tick "Auto Confirm User").
-- 2) Replace the email below with YOUR email, then run this file.
-- ============================================================
insert into public.admins (user_id)
select id from auth.users
where email = 'YOUR_EMAIL@example.com'
on conflict (user_id) do nothing;

-- Check: this should return exactly 1 row (your email).
select u.email, a.created_at
from public.admins a
join auth.users u on u.id = a.user_id;
