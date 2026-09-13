/**
 * Security smoke tests against LOCAL Supabase (RLS + triggers).
 * Run: node --env-file=.env.local scripts/test-security.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!/127\.0\.0\.1|localhost/.test(url ?? "")) {
  console.error("Refusing to run against non-local URL");
  process.exit(1);
}

const svc = createClient(url, service, { auth: { persistSession: false } });
let pass = 0,
  fail = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "✓ PASS" : "✗ FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  ok ? pass++ : fail++;
}
async function signedIn(email) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: "password123" });
  if (error) throw new Error(`sign-in ${email}: ${error.message}`);
  return c;
}

const { data: profs } = await svc.from("profiles").select("id, email, role");
const id = Object.fromEntries(profs.map((p) => [p.email, p.id]));
const adminId = id["admin.one@gmail.com"];
const alexId = id["alex@flat.test"];
const miaId = id["mia@flat.test"];

// A. Cannot promote a non-allow-listed member to admin (even via service role).
{
  const { error } = await svc.from("profiles").update({ role: "admin" }).eq("id", alexId);
  check("member cannot be promoted to admin (allow-list trigger)", !!error, error?.message ?? "no error!");
}

// A2. Even allow-listed, the two-admin cap holds.
{
  await svc.from("admin_allowlist").upsert({ email: "alex@flat.test" });
  const { error } = await svc.from("profiles").update({ role: "admin" }).eq("id", alexId);
  check("two-admin cap blocks a third admin", !!error, error?.message ?? "no error!");
  await svc.from("admin_allowlist").delete().eq("email", "alex@flat.test");
}

// Give mia a location as the service role.
await svc.from("locations").upsert({ user_id: miaId, sharing_enabled: true, latitude: 51.5, longitude: -0.12 });

const alex = await signedIn("alex@flat.test");

// B. A member cannot read another member's location.
{
  const { data } = await alex.from("locations").select("*").eq("user_id", miaId);
  check("member cannot read another member's location", (data?.length ?? 0) === 0, `rows=${data?.length}`);
}

// B2. A member can upsert their OWN location.
{
  const { error } = await alex.from("locations").upsert({ user_id: alexId, sharing_enabled: true, latitude: 40, longitude: -73 });
  check("member can write their own location", !error, error?.message ?? "");
}

// B3. A member cannot write a location row for someone else.
{
  const { error } = await alex.from("locations").insert({ user_id: miaId, sharing_enabled: true, latitude: 1, longitude: 1 });
  check("member cannot write another member's location", !!error, error?.message ?? "no error!");
}

// C. A member cannot read another member's email from profiles.
{
  const { data } = await alex.from("profiles").select("email").eq("id", miaId);
  check("member cannot read another member's profile row", (data?.length ?? 0) === 0, `rows=${data?.length}`);
}

// C2. public_profiles exposes safe columns only (no email).
{
  const { data } = await alex.from("public_profiles").select("*").limit(1);
  const leaks = data?.[0] && Object.prototype.hasOwnProperty.call(data[0], "email");
  check("public_profiles hides email", !leaks && (data?.length ?? 0) >= 1, `sample keys: ${data?.[0] ? Object.keys(data[0]).join(",") : "none"}`);
}

// D. A member cannot create a task (admin-only).
{
  const { error } = await alex.from("tasks").insert({ title: "sneaky", created_by: alexId });
  check("member cannot create a task", !!error, error?.message ?? "no error!");
}

// E. An admin CAN create a task, and it lands.
{
  const adminc = await signedIn("admin.one@gmail.com");
  const { data, error } = await adminc.from("tasks").insert({ title: "Take out the bins", created_by: adminId, priority: "high" }).select().single();
  check("admin can create a task", !error && !!data?.id, error?.message ?? `id=${data?.id}`);
}

// F. A member cannot read the audit log.
{
  const { data } = await alex.from("audit_logs").select("*");
  check("member cannot read audit logs", (data?.length ?? 0) === 0, `rows=${data?.length}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
