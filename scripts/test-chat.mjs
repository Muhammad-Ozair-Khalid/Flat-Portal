/**
 * Messaging tests: realtime delivery, notifications, conversation privacy.
 * Run: node --env-file=.env.local scripts/test-chat.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!/127\.0\.0\.1|localhost/.test(url ?? "")) process.exit(1);

const svc = createClient(url, service, { auth: { persistSession: false } });
let pass = 0, fail = 0;
const check = (n, ok, d = "") => { console.log(`${ok ? "✓ PASS" : "✗ FAIL"}  ${n}${d ? "  — " + d : ""}`); ok ? pass++ : fail++; };
async function signedIn(email) {
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await c.auth.signInWithPassword({ email, password: "password123" });
  if (error) throw new Error(`${email}: ${error.message}`);
  // The browser client wires this automatically; in Node we set it by hand so
  // RLS-filtered realtime (postgres_changes) authorizes this socket.
  c.realtime.setAuth(data.session.access_token);
  return c;
}

const { data: profs } = await svc.from("profiles").select("id, email");
const id = Object.fromEntries(profs.map((p) => [p.email, p.id]));
const adminId = id["admin.one@gmail.com"], alex = id["alex@flat.test"], mia = id["mia@flat.test"];

const { data: group } = await svc.from("conversations").select("id").eq("is_primary", true).single();
const groupId = group.id;

const alexC = await signedIn("alex@flat.test");
const adminC = await signedIn("admin.one@gmail.com");

// Subscribe as alex to the group's realtime inserts.
let received = null;
const channel = alexC.channel("test-room").on(
  "postgres_changes",
  { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${groupId}` },
  (payload) => { received = payload.new; },
);
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error("subscribe timeout")), 8000);
  channel.subscribe((status) => { if (status === "SUBSCRIBED") { clearTimeout(t); resolve(); } });
});

// Admin posts to the group.
const body = "Hello flat " + Date.now();
const { data: msg, error: postErr } = await adminC
  .from("messages")
  .insert({ conversation_id: groupId, sender_id: adminId, body })
  .select("id")
  .single();
check("admin can post to the group chat", !postErr && !!msg?.id, postErr?.message ?? "");

await new Promise((r) => setTimeout(r, 4500));
check("member received the message over realtime", received?.body === body, received ? `got: ${received.body}` : "nothing received");

const { data: notif } = await svc.from("notifications").select("id").eq("type", "new_message").contains("data", { message_id: msg.id });
check("new_message notifications created for other members", (notif?.length ?? 0) >= 1);

// Privacy: alex must not post to / read a DM they're not in.
const dmKey = [adminId, mia].sort().join(":");
let { data: dm } = await svc.from("conversations").select("id").eq("dm_key", dmKey).maybeSingle();
if (!dm) {
  const r = await svc.from("conversations").insert({ type: "direct", dm_key: dmKey, created_by: adminId }).select("id").single();
  dm = r.data;
  await svc.from("conversation_members").insert([{ conversation_id: dm.id, user_id: adminId }, { conversation_id: dm.id, user_id: mia }]);
}
await svc.from("messages").insert({ conversation_id: dm.id, sender_id: adminId, body: "private note" });

const { error: intrude } = await alexC.from("messages").insert({ conversation_id: dm.id, sender_id: alex, body: "sneaking in" });
check("member cannot post into a conversation they're not in", !!intrude, intrude?.message ?? "no error!");

const { data: secret } = await alexC.from("messages").select("id").eq("conversation_id", dm.id);
check("member cannot read another pair's DM", (secret?.length ?? 0) === 0, `rows=${secret?.length}`);

await alexC.removeChannel(channel);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
