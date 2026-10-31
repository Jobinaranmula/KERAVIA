-- ============================================================
-- KERAVIA — verification queries (run in SQL Editor after schema.sql)
-- ============================================================

-- 1) All 9 tables exist and RLS is ON (rls_enabled must be true for every row)
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('admins','site_settings','journey','projects','memories',
                    'interests','kerala_items','media','messages')
order by 1;

-- 2) Policies list (expect: 4 per content table, 4 for messages, 1 for admins)
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

-- 3) Storage bucket exists and is public
select id, public, file_size_limit from storage.buckets where id = 'media';

-- 4) Starting content was inserted (expect 13 settings, 4 Kerala items)
select (select count(*) from public.site_settings) as settings,
       (select count(*) from public.kerala_items)  as kerala_items;
