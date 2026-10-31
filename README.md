# KERAVIA — MY ROOTS. MY WORLD.

Jobin Skariah-ന്റെ വ്യക്തിഗത വെബ്സൈറ്റ്. **Next.js 14 (App Router) + Supabase** (Database, Auth, Storage). Vercel-ൽ വിന്യസിക്കാം.

## പേജുകൾ

`/` Home · `/about` · `/journey` · `/projects` · `/gallery` (Fullscreen Lightbox) · `/memories` · `/interests` · `/kerala` · `/contact` · `/admin` (Email + Password login)

സന്ദർശകർക്ക് ലോഗിൻ ഇല്ലാതെ എല്ലാ പൊതു പേജുകളും കാണാം. `/admin` ലോഗിൻ ചെയ്ത Admin-ന് മാത്രം.

## ഫോൾഡർ ഘടന

```
keravia/
├─ app/            പേജുകൾ (layout, template, home, about … admin), globals.css (ഡിസൈൻ)
├─ components/     Shell (നാവ്, ലോഡർ, ആനിമേഷൻ), Gallery (Lightbox), ContactForm, Admin …
├─ lib/            supabase.js (browser), data.js (server), upload.js (അപ്‌ലോഡ്)
├─ supabase/       schema.sql, make_admin.sql, verify.sql
├─ .env.example    ആവശ്യമായ environment variables
└─ package.json
```

## 1. Supabase തയ്യാറാക്കൽ (ഒരു തവണ)

1. supabase.com-ൽ പുതിയ പ്രോജക്ട് ഉണ്ടാക്കുക.
2. **SQL Editor** → `supabase/schema.sql` മുഴുവൻ പേസ്റ്റ് ചെയ്ത് Run.
3. **Authentication → Users → Add user → Create new user**: നിങ്ങളുടെ ഇമെയിൽ + ശക്തമായ പാസ്‌വേഡ്, "Auto Confirm User" ടിക്ക്.
4. `supabase/make_admin.sql`-ൽ ഇമെയിൽ മാറ്റി Run.
5. `supabase/verify.sql` Run, ഫലം പരിശോധിക്കുക (9 ടേബിൾ RLS ഓൺ, `media` ബക്കറ്റ് public, settings 13, kerala_items 4).
6. **Authentication-ൽ പുതിയ sign-up ഓഫ് ചെയ്യുക** (Sign In / Providers → "Allow new users to sign up" ഓഫ്). മെനുവിന്റെ പേര് Supabase മാറ്റിയിരിക്കാം.
7. **Project Settings → API**: `Project URL`, `anon / publishable` key എടുക്കുക. **service_role / secret കീ ഒരിടത്തും ഉപയോഗിക്കരുത്.**

## 2. കമ്പ്യൂട്ടറിൽ പ്രവർത്തിപ്പിക്കൽ

Node.js 18.17 അല്ലെങ്കിൽ പുതിയത് വേണം.

```bash
cp .env.example .env.local     # ശേഷം .env.local-ൽ നിങ്ങളുടെ URL, anon key നൽകുക
npm install
npm run dev                    # http://localhost:3000
npm run build && npm start     # production പരിശോധന
```

## 3. GitHub-ലേക്ക് അപ്‌ലോഡ്

**ഓപ്ഷൻ A — വെബ് വഴി (എളുപ്പം):**
1. github.com → New repository → പേര് `keravia` → Create (Private ആയാലും Vercel-ൽ ഇമ്പോർട്ട് ചെയ്യാം).
2. "uploading an existing file" ഞെക്കുക.
3. ZIP തുറന്ന് `keravia` ഫോൾഡറിനുള്ളിലെ **ഉള്ളടക്കം** (ഫോൾഡർ അല്ല) വലിച്ചിടുക. `.gitignore` ഉള്ളതിനാൽ `.env.local` അപ്‌ലോഡ് ആകില്ല. കീകൾ ഒരിക്കലും GitHub-ൽ ഇടരുത്.
4. "Commit changes".

**ഓപ്ഷൻ B — Git കമാൻഡ്:**
```bash
cd keravia
git init
git add .
git commit -m "KERAVIA initial version"
git branch -M main
git remote add origin https://github.com/<your-username>/keravia.git
git push -u origin main
```

## 4. Vercel-ൽ വിന്യാസം

1. vercel.com → GitHub അക്കൗണ്ട് ഉപയോഗിച്ച് sign in.
2. **Add New → Project** → `keravia` repository **Import**.
3. Framework: **Next.js** (സ്വയം കണ്ടെത്തും). Build settings മാറ്റേണ്ടതില്ല.
4. **Environment Variables** ചേർക്കുക:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ഓപ്ഷണൽ, ഉദാ. `https://keravia.vercel.app`)
5. **Deploy**. പൂർത്തിയായാൽ കിട്ടുന്ന `*.vercel.app` ലിങ്ക് ആർക്കും തുറക്കാം.
6. സ്വന്തം ഡൊമെയ്ൻ വേണമെങ്കിൽ Project → Settings → Domains.
7. Environment variables പിന്നീട് മാറ്റിയാൽ **Redeploy** ചെയ്യണം.

## 5. Admin ഉപയോഗം

`https://<നിങ്ങളുടെ-സൈറ്റ്>/admin` (ഫൂട്ടറിലെ "Admin" ലിങ്കും ഉണ്ട്) → ഇമെയിൽ + പാസ്‌വേഡ്.

- **Home / About / Texts:** Home വാചകം, About Me, എല്ലാ പേജുകളുടെയും ആമുഖം, ഇമെയിൽ, Footer, SEO.
- **Journey, Projects, Memories, Interests, Kerala:** പുതിയത് ചേർക്കുക, തിരുത്തുക, ഒഴിവാക്കുക, ↑↓ ക്രമം മാറ്റുക. Projects/Memories/Kerala-ൽ ചിത്രം ചേർക്കാം.
- **Gallery:** ഒന്നിലധികം ഫോട്ടോ/വീഡിയോ ഒരുമിച്ച് അപ്‌ലോഡ്, Caption തിരുത്തൽ, ഒഴിവാക്കൽ. വലിയ ഫോട്ടോകൾ ബ്രൗസറിൽ വച്ച് സ്വയം ചെറുതാക്കും (2000px, WebP).
- **Messages:** Contact ഫോം വഴി വന്ന സന്ദേശങ്ങൾ.

മാറ്റങ്ങൾ ഉടൻ സൈറ്റിൽ കാണും (പേജുകൾ ഓരോ തവണയും പുതുതായി റെൻഡർ ചെയ്യുന്നു).

## സുരക്ഷ

- എല്ലാ ടേബിളിലും **Row Level Security** ഓൺ. പൊതു വായന ആർക്കും; എഴുത്ത്/മാറ്റം `admins` ടേബിളിലുള്ള യൂസറിന് മാത്രം.
- `admins` ടേബിൾ API വഴി മാറ്റാൻ പറ്റില്ല, SQL Editor വഴി മാത്രം.
- Storage ബക്കറ്റ്: ആർക്കും കാണാം, അപ്‌ലോഡ്/ഡിലീറ്റ് Admin-ന് മാത്രം.
- Contact ഫോമിൽ ദൈർഘ്യ പരിധികളും bot-ട്രാപ്പും ഉണ്ട്. പൂർണ്ണ spam സംരക്ഷണം (CAPTCHA, rate-limit) ഇതിലില്ല.
- ബ്രൗസറിൽ ഉപയോഗിക്കുന്ന anon കീ പൊതുവായതാണ്, RLS ആണ് സുരക്ഷ നൽകുന്നത്.

## പരിമിതികൾ / അറിയേണ്ടത്

- Supabase സൗജന്യ പ്ലാനിൽ Storage വലുപ്പത്തിനും ഒരു ഫയലിന്റെ വലുപ്പത്തിനും പരിധിയുണ്ട്. `schema.sql`-ൽ 50 MB വച്ചിട്ടുണ്ട്; നിങ്ങളുടെ പ്ലാനിലെ പരിധി Supabase സൈറ്റിൽ പരിശോധിക്കുക. സൗജന്യ പ്രോജക്ടുകൾ ഉപയോഗമില്ലാതെ കിടന്നാൽ pause ആകാം.
- ഐഫോൺ HEIC ഫോട്ടോകൾ ചില ബ്രൗസറുകളിൽ അപ്‌ലോഡ് ആകില്ല; JPG/PNG/WebP ഉപയോഗിക്കുക.
- About പേജിൽ ഫോട്ടോ ഫീൽഡ് ഇല്ല (ടെക്സ്റ്റ് മാത്രം).

## പ്രശ്നപരിഹാരം

- **പേജുകളിൽ ഉള്ളടക്കം വരുന്നില്ല:** Vercel-ലെ environment variables പരിശോധിക്കുക, മാറ്റിയെങ്കിൽ Redeploy.
- **"ഈ അക്കൗണ്ടിന് Admin അനുമതി ഇല്ല":** `make_admin.sql` ശരിയായ ഇമെയിൽ ഉപയോഗിച്ച് ഓടിച്ചോ എന്ന് നോക്കുക.
- **അപ്‌ലോഡ് പിശക്:** ഫയൽ തരം/വലുപ്പം, `schema.sql` ശരിയായി ഓടിച്ചോ എന്നിവ പരിശോധിക്കുക. പിശക് സന്ദേശം അതേപടി എനിക്ക് അയക്കുക.
