# Deploying Flat Portal — step by step

This is a **hand-holding guide** for putting Flat Portal live. Follow it top to
bottom and you'll have a working site on the internet, backed by a real database,
with Google sign-in. No prior experience with Supabase or Vercel needed.

> **Time:** about 30–45 minutes.
> **Cost:** free. Supabase and Vercel both have free tiers that are plenty for this.

---

## What you're setting up

Three services work together:

| Service | Does what | Free? |
|---|---|---|
| **Supabase** | The database + login system (Google sign-in, Realtime chat, storage) | Yes |
| **Vercel** | Hosts the website itself and runs the scheduled "overdue tasks" job | Yes |
| **Google Cloud** | Issues the Google sign-in credentials Supabase uses | Yes |

You'll create a project on each, copy a few keys between them, and deploy.

## Before you start — accounts you'll need

Sign up for these first (all free, use the same email if you like):

1. **GitHub** — the code lives here. <https://github.com>
2. **Supabase** — <https://supabase.com>
3. **Vercel** — <https://vercel.com> (sign in with your GitHub account — easiest)
4. **Google Cloud Console** — <https://console.cloud.google.com>

You'll also want the **two Gmail addresses** that will be the flat's admins. Pick
them now — the whole app is built around **exactly two administrators**, and
there is no "make me admin" button anywhere. Whoever is on the admin list becomes
an admin automatically the first time they sign in.

---

## Step 1 — Create the Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. Give it a name (e.g. `flat-portal`), set a **database password** (save it
   somewhere), pick the region closest to you, and create it. Give it a minute to
   finish provisioning.
3. Open **Project Settings → API** and copy these three values — you'll paste them
   into Vercel later. Keep this tab open:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon / public** key — a long string, safe for the browser
   - **service_role** key — a long string, **secret** (see the warning below)

> ⚠️ **The `service_role` key is a master key** — it bypasses all security rules.
> It only ever goes into Vercel's server-side environment variables. **Never**
> put it in the browser, in the repo, or share it in chat/email. If it ever
> leaks, rotate it in Supabase → Settings → API.

---

## Step 2 — Create the database tables

The database structure (tables, security rules, triggers) lives in the repo under
`supabase/migrations/`. You need to run those against your new project. Two ways —
pick **A** (no tools to install) or **B** (if you're comfortable with a terminal).

### Option A — paste the SQL (simplest)

1. In the Supabase dashboard, open the **SQL Editor** (left sidebar).
2. Open each file below from the repo, copy its contents into a new query, and
   click **Run**. **Run them in this exact order:**
   1. `supabase/migrations/20260913120000_schema.sql`
   2. `supabase/migrations/20260913120010_security.sql`
   3. `supabase/migrations/20260913120020_lock_overdue_sweep.sql`
3. Then open `supabase/seed.sql`, and **before running it, change the two admin
   emails** on these lines to the real admin Gmail addresses:
   ```sql
   insert into public.admin_allowlist (email) values
     ('admin.one@gmail.com'),   -- ← change to a real admin Gmail
     ('admin.two@gmail.com')    -- ← change to the second admin Gmail
   on conflict (email) do nothing;
   ```
   Then run it.

### Option B — the Supabase CLI (from the repo folder)

Requires Node 20+ installed.

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

`YOUR_PROJECT_REF` is the `abcdefgh` part of your Project URL. `db push` applies
all the migrations. **Then** apply the seed: open `supabase/seed.sql`, change the
two admin emails as shown in Option A, and paste it into the SQL Editor and Run.
(`db push` does not run the seed for you.)

Either way, when you're done you should see tables like `profiles`, `tasks`,
`conversations`, `admin_allowlist` under **Table Editor**.

---

## Step 3 — Set up Google sign-in

This is the fiddliest step. Take it slow.

### 3a. Create Google OAuth credentials

1. Go to <https://console.cloud.google.com> and create a project (or pick one).
2. **APIs & Services → OAuth consent screen** — choose **External**, fill in the
   app name and your support email, save. (You can leave it in "Testing" mode; add
   the two admin Gmails under **Test users** so they can sign in.)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Under **Authorized redirect URIs**, add exactly this (with your project ref):
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
   - Create it, then copy the **Client ID** and **Client secret**.

### 3b. Give them to Supabase

1. Supabase dashboard → **Authentication → Providers → Google**.
2. Paste the **Client ID** and **Client secret**, toggle it **on**, save.

We'll finish the URL configuration in Step 5, once we know the live website
address.

---

## Step 4 — Deploy the website to Vercel

1. Push this repo to your GitHub if it isn't already.
2. Go to <https://vercel.com/new>, **Import** the GitHub repo.
3. Vercel auto-detects Next.js — don't change the build settings.
4. Before clicking Deploy, expand **Environment Variables** and add all of these:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase **Project URL** |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the **anon / public** key |
   | `SUPABASE_SERVICE_ROLE_KEY` | the **service_role** key (secret) |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now, or put `https://example.com` — you'll fix it in Step 5 |
   | `ADMIN_EMAILS` | the two admin Gmails, comma-separated: `a@gmail.com,b@gmail.com` |
   | `CRON_SECRET` | a long random string — generate one (see below) |

   Generate a `CRON_SECRET` with either:
   ```bash
   openssl rand -hex 32
   ```
   …or just mash a long random string of letters and numbers. It only needs to be
   secret and hard to guess.

5. Click **Deploy**. When it finishes, Vercel gives you a URL like
   `https://flat-portal-xxxx.vercel.app`. **Copy it.**

> The `ADMIN_EMAILS` here must be the **same two addresses** you put in the
> database seed in Step 2. They work together.

---

## Step 5 — Point everything at the live URL

Now that you have the real Vercel URL, wire it back in two places:

1. **Vercel → your project → Settings → Environment Variables:** set
   `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g.
   `https://flat-portal-xxxx.vercel.app`, **no trailing slash**). Save.
2. **Supabase → Authentication → URL Configuration:**
   - **Site URL:** your Vercel URL.
   - **Redirect URLs:** add `https://flat-portal-xxxx.vercel.app/auth/callback`.
3. Back in Vercel, go to **Deployments → ⋯ on the latest → Redeploy** so the new
   `NEXT_PUBLIC_SITE_URL` takes effect.

> Later, if you add a custom domain, repeat this step with the new domain.

---

## Step 6 — First sign-in

1. Open your Vercel URL.
2. Click **Continue with Google** and sign in with **one of the two admin Gmail
   addresses**.
3. You should land in the **admin dashboard**. 🎉

Anyone who signs in with a Gmail that's **not** on the admin list becomes a normal
member in a "pending" state until an admin activates them from **Admin → Users**.

---

## Step 7 — The scheduled "overdue tasks" job

The repo includes `vercel.json`, which tells Vercel to call
`/api/cron/check-overdue` every 15 minutes to flag past-deadline tasks and send
notifications. Vercel automatically authenticates it using your `CRON_SECRET` — no
extra setup needed.

> **On Vercel's free (Hobby) plan, cron jobs run only once per day.** That's fine —
> overdue tasks just get flagged once daily instead of every 15 minutes. If you
> want more frequent checks without upgrading, use the database-native scheduler
> instead: open `supabase/optional/pg_cron_overdue.sql`, read the notes at the top,
> and run it in the Supabase SQL Editor.

---

## Done — quick verification checklist

- [ ] Both admin Gmails can sign in and see the admin dashboard.
- [ ] Admin → Users can add/activate members.
- [ ] Creating a task and assigning it produces a notification.
- [ ] Group chat sends and receives messages live (open two browsers).
- [ ] Refreshing the page keeps you logged in.
- [ ] The `service_role` key is **only** in Vercel's env vars — not in the repo.

---

## Environment variables — reference

| Variable | Where it comes from | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key | **Yes** |
| `NEXT_PUBLIC_SITE_URL` | your live URL, no trailing slash | No |
| `ADMIN_EMAILS` | the two admin Gmails, comma-separated | No |
| `CRON_SECRET` | you generate it (`openssl rand -hex 32`) | **Yes** |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | *optional* — only if you want distributed rate-limiting | **Yes** |

A local copy for development goes in a `.env.local` file (copy `.env.example`).
**Never commit `.env.local`** — it's already git-ignored.

---

## Troubleshooting

**"redirect_uri_mismatch" from Google.** The redirect URI in Google Cloud must be
exactly `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` — the *Supabase*
domain, not your Vercel domain. Double-check the project ref.

**Sign-in loops back to the login page.** Your Vercel `auth/callback` URL isn't in
Supabase's **Redirect URLs**, or `NEXT_PUBLIC_SITE_URL` doesn't match your live URL
(check for a trailing slash). Fix Step 5 and redeploy.

**I signed in but I'm a "member", not an admin.** Your Gmail isn't on the admin
list. Confirm the same two addresses are in **both** `ADMIN_EMAILS` (Vercel) and
the `admin_allowlist` table (Step 2 seed). Then sign out and back in.

**"Missing required environment variable" error.** One of the env vars above is
missing or misspelled in Vercel. Add it and redeploy.

**Build succeeds but pages error at runtime.** Almost always a Supabase key typo.
Re-copy the keys from Supabase → Settings → API.

---

Need the deeper technical/security details? See [README.md](README.md) and
[SECURITY.md](SECURITY.md).
