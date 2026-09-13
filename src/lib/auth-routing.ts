/** Where a user should land after authenticating, based on role + status. */
export function landingPathFor(
  role: string | null | undefined,
  status: string | null | undefined,
  fallback = "/home",
): string {
  if (status === "pending") return "/pending";
  if (status === "inactive") return "/suspended";
  if (role === "admin") return "/admin";
  return fallback;
}

/** Guard against open-redirects: only allow same-origin relative paths. */
export function isSafeNext(next: string | null | undefined): next is string {
  return !!next && next.startsWith("/") && !next.startsWith("//");
}
