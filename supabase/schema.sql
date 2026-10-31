-- ============================================================
-- KERAVIA — Supabase schema (Step 1)
-- Run this whole file ONCE in: Supabase Dashboard → SQL Editor.
-- It is safe to run again (re-runnable).
-- ============================================================

-- ---------- 1. Admins ----------
-- Only users listed here are admins. Nobody can add rows through the
-- public API; rows are added only from the SQL Editor (see make_admin.sql).
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- 2. Content tables ----------
-- Page texts (Home, About, Kerala, Contact ...) as key/value pairs.
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.journey (
  id uuid primary key default gen_random_uuid(),
  year text not null default '',
  title text not null,
  body text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  url text not null default '',
  image_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  date_label text not null default '',
  title text not null,
  body text not null default '',
  image_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.kerala_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  image_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  path text not null,            -- file path inside the "media" storage bucket
  caption text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Contact form messages: visitors may write, only the admin may read.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200 and position('@' in email) > 1),
  body text not null check (char_length(body) between 1 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- keep updated_at fresh on site_settings
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_settings_touch on public.site_settings;
create trigger trg_site_settings_touch
before update on public.site_settings
for each row execute function public.touch_updated_at();

-- ---------- 3. Row Level Security ----------
alter table public.admins        enable row level security;
alter table public.site_settings enable row level security;
alter table public.journey       enable row level security;
alter table public.projects      enable row level security;
alter table public.memories      enable row level security;
alter table public.interests     enable row level security;
alter table public.kerala_items  enable row level security;
alter table public.media         enable row level security;
alter table public.messages      enable row level security;

-- admins: a logged-in user can see only their own row (so the app can
-- check "am I admin?"). No insert/update/delete policy => nobody can
-- change it through the API.
drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- Public content tables: everyone reads, only admins write.
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings','journey','projects','memories',
    'interests','kerala_items','media'
  ]
  loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('drop policy if exists "admin delete" on public.%I', t);

    execute format(
      'create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format(
      'create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format(
      'create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format(
      'create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end
$$;

-- messages: anyone may send (length limits enforced by the table),
-- only the admin may read, mark as read, or delete.
drop policy if exists "anyone can send" on public.messages;
drop policy if exists "admin read" on public.messages;
drop policy if exists "admin update" on public.messages;
drop policy if exists "admin delete" on public.messages;

create policy "anyone can send" on public.messages
  for insert to anon, authenticated
  with check (is_read = false);
create policy "admin read" on public.messages
  for select to authenticated using (public.is_admin());
create policy "admin update" on public.messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.messages
  for delete to authenticated using (public.is_admin());

-- ---------- 4. Storage bucket for photos & videos ----------
-- Public bucket: anyone can VIEW files; only admins can upload/change/delete.
-- 50 MB per file limit here; your Supabase plan may enforce a lower/higher cap.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;

create policy "media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');
create policy "media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------- 5. Starting content (editable later from Admin) ----------
insert into public.site_settings (key, value) values
  ('owner_name',       'Jobin Skariah'),
  ('hero_subtitle',    'Jobin Skariah-ന്റെ സ്വന്തം ഡിജിറ്റൽ ഇടം.'),
  ('seo_description',  'KERAVIA — Jobin Skariah-ന്റെ വ്യക്തിഗത വെബ്സൈറ്റ്. യാത്ര, പ്രോജക്ടുകൾ, ഗാലറി, ഓർമ്മകൾ, കേരളം.'),
  ('about_text',       'ഇവിടെ നിങ്ങളെക്കുറിച്ച് എഴുതാൻ Admin ഡാഷ്‌ബോർഡ് ഉപയോഗിക്കുക.'),
  ('journey_intro',    'ഇതുവരെയുള്ള എന്റെ യാത്ര.'),
  ('projects_intro',   'ഞാൻ നിർമ്മിച്ച വെബ്സൈറ്റുകളും ആപ്പുകളും.'),
  ('gallery_intro',    'ഫോട്ടോകളും വീഡിയോകളും.'),
  ('memories_intro',   'മറക്കാനാകാത്ത ഓർമ്മകൾ.'),
  ('interests_intro',  'എന്റെ ഇഷ്ടങ്ങളും താൽപ്പര്യങ്ങളും.'),
  ('kerala_intro',     'ദൈവത്തിന്റെ സ്വന്തം നാട് — കായലുകളും മലകളും കടലും ഒരുമിക്കുന്ന എന്റെ വേരുകൾ.'),
  ('contact_intro',    'എന്നെ ബന്ധപ്പെടാൻ താഴെയുള്ള ഫോം ഉപയോഗിക്കുക.'),
  ('contact_email',    ''),
  ('footer_text',      'MY ROOTS. MY WORLD.')
on conflict (key) do nothing;

insert into public.kerala_items (title, body, sort_order)
select * from (values
  ('കായൽ',        'ആലപ്പുഴയുടെ ശാന്തമായ കായലുകളും ഹൗസ്‌ബോട്ടുകളും.', 1),
  ('പശ്ചിമഘട്ടം', 'മൂന്നാറിന്റെയും വയനാടിന്റെയും മഞ്ഞുമൂടിയ മലനിരകൾ.', 2),
  ('സംസ്കാരം',    'ഓണം, തെയ്യം, കഥകളി, ചെണ്ടമേളം.', 3),
  ('രുചി',        'സദ്യ, മീൻകറി, പുട്ട്, അപ്പം.', 4)
) as v(title, body, sort_order)
where not exists (select 1 from public.kerala_items);
