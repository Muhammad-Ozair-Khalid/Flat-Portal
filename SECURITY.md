# Security model

Flat Portal is built so that the **server and database** — never the client — decide who
can do what. Defense is layered: middleware → server authorization → Row-Level Security →
database triggers.

## Authentication & sessions
- Google OAuth via Supabase Auth. No passwords are stored by the app.
- Sessions are cookie-based (`@supabase/ssr`); middleware refreshes them on every request.
- Protected routes redirect unauthenticated users to `/login`; pending/deactivated accounts
  are routed to dedicated screens and cannot reach app data.

## Authorization (never trust the client)
- **Middleware** blocks unauthenticated access to protected paths.
- **Server layouts** re-check role/status (`requireAdmin`, `requireMember`) before rendering.
- **Every API route** re-verifies authentication and role (`requireApiUser`, `requireApiAdmin`).
- **Row-Level Security** is enabled on every table as the final gate — even a leaked anon key
  can only do what the signed-in user is allowed to do.

Verified behaviours (see `scripts/test-*.mjs`):
- A member calling an admin API gets **403**; opening `/admin` gets a server redirect.
- A member **cannot** read or write another member's location.
- A member **cannot** read another member's email, another pair's DMs, or the audit log.
- A member **cannot** create tasks or change protected task fields (only their own status/note).

## Two-admin guarantee
- Only emails in `admin_allowlist` may hold the `admin` role, and a trigger caps admins at **two**.
- Members cannot promote themselves — attempts are rejected at the database level.

## Location privacy
- The `locations` table RLS is `user_id = auth.uid() OR is_admin(auth.uid())` for reads, and
  owner-only for writes. Members literally cannot query others' locations by any route.
- Turning sharing off clears stored coordinates (minimal retention).

## Input & content safety
- All API inputs validated with Zod.
- User-generated content (messages, etc.) is rendered through React (auto-escaped); URLs are
  linkified into `rel="noopener noreferrer nofollow"` external links — no raw HTML is ever injected.
- Avatar uploads are constrained to the user's own storage folder by RLS.

## Transport & headers
- Nonce-based **Content-Security-Policy** (per request, `strict-dynamic`), plus
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy` (geolocation only for our origin), and HSTS.
- **Rate limiting** on the API (per IP, stricter for mutations).

## Secrets
- The `service_role` key is server-only and never prefixed with `NEXT_PUBLIC_`.
- The overdue-sweep cron endpoint is gated by `CRON_SECRET`.
- Error responses to users are generic; details stay in server logs.
