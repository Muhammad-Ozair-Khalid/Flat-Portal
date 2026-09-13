import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

// Placeholder — replaced by the full admin dashboard in Phase 3+.
export default async function AdminPlaceholder() {
  const { profile } = await requireAdmin();
  return (
    <div className="ambient flex min-h-dvh items-center justify-center px-6">
      <div className="glass rounded-2xl border border-border/70 p-8 text-center elevate-lg">
        <p className="text-sm text-primary">Administrator</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground">
          {profile.full_name ?? profile.email}
        </h1>
        <p className="mt-2 text-muted-foreground">The admin dashboard is coming in the next phase.</p>
        <form action={signOut} className="mt-6">
          <button className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-muted">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
