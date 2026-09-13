/**
 * Seed local test users into the LOCAL Supabase only.
 * Run with:  node --env-file=.env.local scripts/seed-dev-users.mjs
 *
 * Safe by design: refuses to run unless the Supabase URL is localhost.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!/127\.0\.0\.1|localhost/.test(url)) {
  console.error(`Refusing to seed test users against a non-local URL: ${url}`);
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "password123";
const users = [
  { email: "admin.one@gmail.com", name: "Ayesha Khan", kind: "admin" },
  { email: "admin.two@gmail.com", name: "Sana Malik", kind: "admin" },
  { email: "alex@flat.test", name: "Alex Rivera", kind: "member" },
  { email: "mia@flat.test", name: "Mia Chen", kind: "member" },
  { email: "sam@flat.test", name: "Sam Okoye", kind: "member" },
  { email: "jordan@flat.test", name: "Jordan Pending", kind: "pending" },
];

async function existingByEmail(email) {
  // list first pages; local dev has few users
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  return data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

for (const u of users) {
  // Members must be invited before the signup trigger runs so they become active.
  if (u.kind === "member") {
    await admin.from("member_invites").upsert({ email: u.email }, { onConflict: "email" });
  }

  const already = await existingByEmail(u.email);
  if (already) {
    console.log(`• ${u.email} already exists — skipped`);
    continue;
  }

  const { error } = await admin.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.name },
  });

  if (error) {
    console.error(`✗ ${u.email}: ${error.message}`);
  } else {
    console.log(`✓ created ${u.email} (${u.kind}) — password: ${PASSWORD}`);
  }
}

// Report the resulting profiles table.
const { data: profiles } = await admin
  .from("profiles")
  .select("email, role, account_status")
  .order("role");
console.log("\nProfiles now:");
for (const p of profiles ?? []) {
  console.log(`  ${p.role.padEnd(6)} ${p.account_status.padEnd(9)} ${p.email}`);
}
process.exit(0);
