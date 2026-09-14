# Flat Portal

A full-stack **flat management system** for people who share a home — chores, chat,
notifications and live location, with strict admin oversight and member privacy.

Built with **Next.js 15 (App Router)** + **Supabase** (Postgres, Google OAuth,
Realtime, Storage, Row-Level Security). Every core feature — auth, users, tasks,
chat, notifications, announcements, live location — is wired to the database.

---

## Features

- **Google sign-in** (OAuth) with secure, cookie-based sessions and protected routes.
- **Two-admin role system** — exactly two allow-listed administrators, enforced in the database.
- **Admin dashboard** — live stats, recent activity (audit), latest tasks.
- **User management** — add / activate / deactivate / remove members, search & filter, invites.
- **Tasks** — create, assign, prioritise, set deadlines; members start & complete with a note.
- **Notifications** — realtime, in-app: task assigned/completed/overdue, new messages, announcements.
- **Messaging** — flat-wide group chat + private direct messages, live via Supabase Realtime, safe links.
- **Live location** — opt-in member sharing; **only admins** can view locations (enforced by RLS).
- **Announcements** — broadcast to the whole flat.
- **Audit log** — a record of important admin actions.
- **Security** — RLS on every table, nonce CSP, security headers, rate limiting, server-side authorization, input validation.
- **Design** — responsive, light/dark, a distinctive "Aurora Indigo" identity with an interactive 3D flat-floor hero and spring-physics motion.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend/Backend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase Postgres + Row-Level Security |
| Auth | Supabase Auth (Google OAuth), `@supabase/ssr` cookie sessions |
| Realtime | Supabase Realtime (`postgres_changes`) |
| Storage | Supabase Storage (avatars bucket) |
| Maps | Leaflet + OpenStreetMap (no API key) |
| Validation | Zod |
| Hosting | Vercel (frontend/API + Cron) + Supabase (DB) |

## Project structure

```
src/
  app/
    (app)/            # authenticated area (adaptive admin/member shell)
      admin/          # admin-only pages (users, tasks, locations, announcements, audit)
      home, tasks, messages, chat, notifications, profile, location
    api/              # protected route handlers (users, tasks, announcements, conversations, cron)
    auth/callback     # OAuth code exchange
    login, pending, suspended
  components/         # ui primitives, app shell, chat, map, brand
  lib/                # supabase clients, auth guards, validation, helpers
  middleware.ts       # session refresh, route protection, rate limiting, nonce CSP
supabase/
  migrations/         # schema, RLS, triggers, functions
  seed.sql            # roles, admin allow-list, group chat
  optional/           # optional pg_cron scheduler
scripts/              # dev seeding + security/task/chat test suites
```

---

## Local development

Requires Node 20+, and (for a local database) Docker + the Supabase CLI (`npx supabase`).

```bash
npm install
npx supabase start          # boots local Postgres/Auth/Realtime/Storage in Docker
cp .env.example .env.local  # then paste the ANON/SERVICE keys that `supabase start` printed
npm run dev
```

Seed local test users (admins + members + a pending user):

```bash
node --env-file=.env.local scripts/seed-dev-users.mjs
```

In development only, the login page shows an email/password panel so you can sign in
without Google. Test accounts (password `password123`): `admin.one@gmail.com` (admin),
`alex@flat.test` (member). This panel is **hard-disabled in production**.

Run the automated checks (all hit the local DB):

```bash
node --env-file=.env.local scripts/test-security.mjs   # RLS + privilege rules
node --env-file=.env.local scripts/test-tasks.mjs      # task + notification pipeline
node --env-file=.env.local scripts/test-chat.mjs       # realtime + conversation privacy
```

---

## Production setup

### 1. Create a Supabase project
At [supabase.com](https://supabase.com) → **New project**. From **Project Settings → API** copy:
`Project URL`, `anon` key, and `service_role` key.

### 2. Apply the database schema
Link and push the migrations (recommended):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or paste each file in `supabase/migrations/` (in order) followed by `supabase/seed.sql`
into the Supabase **SQL editor**.

### 3. Set the two administrators
Put both Gmail addresses in `ADMIN_EMAILS` **and** the allow-list table:

```sql
insert into public.admin_allowlist (email) values
  ('admin.one@gmail.com'),
  ('admin.two@gmail.com')
on conflict do nothing;
```

Each becomes an active admin the first time they sign in with Google. There is no
"create admin" button anywhere.

### 4. Configure Google OAuth
- **Google Cloud Console** → OAuth consent screen + **Credentials → OAuth client ID (Web)**.
  - Authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- **Supabase → Authentication → Providers → Google**: paste the client ID & secret, enable.
- **Supabase → Authentication → URL Configuration**: set Site URL to your app URL and add
  `https://your-app.vercel.app/auth/callback` to redirect URLs.

Storage (avatars bucket), Realtime and RLS are configured automatically by the migrations.

### 5. Deploy to Vercel
Import the repo, then set **Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role key (server only) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `ADMIN_EMAILS` | the two admin Gmail addresses |
| `CRON_SECRET` | a long random string (`openssl rand -hex 32`) |

`vercel.json` registers the overdue-task cron (`/api/cron/check-overdue`, every 15 min).
Vercel automatically sends `Authorization: Bearer $CRON_SECRET`. (Cron frequency depends
on your Vercel plan; you can also use the DB-native scheduler in
`supabase/optional/pg_cron_overdue.sql`.)

Deploy — done. Data persists across refresh/re-login; messages and notifications update in realtime.

---

## Security

See [SECURITY.md](SECURITY.md). In short: RLS on every table, the service-role key never
reaches the browser, every protected API re-checks authentication + authorization, member
locations are readable only by their owner and admins, and user content is sanitized on render.
