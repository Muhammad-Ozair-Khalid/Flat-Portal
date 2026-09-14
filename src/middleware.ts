import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { rateLimit } from "@/lib/rate-limit";

const PROTECTED_PREFIXES = [
  "/home",
  "/tasks",
  "/messages",
  "/chat",
  "/notifications",
  "/profile",
  "/location",
  "/admin",
  "/pending",
  "/suspended",
];

// Derive the exact Supabase origin (REST + realtime websocket) from env so the
// CSP works for any host: *.supabase.co, a custom domain, or a local instance.
function supabaseConnectSrc(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  try {
    const u = new URL(raw);
    const ws = u.protocol === "https:" ? "wss:" : "ws:";
    return `${u.origin} ${ws}//${u.host}`;
  } catch {
    return "https://*.supabase.co wss://*.supabase.co";
  }
}

function buildCsp(nonce: string, isDev: boolean): string {
  const supa = supabaseConnectSrc();
  return [
    `default-src 'self'`,
    // 'strict-dynamic' + nonce lets Next's own scripts load; dev needs eval for HMR.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${supa}`,
    `worker-src 'self' blob:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV !== "production";

  // Per-request nonce for the Content-Security-Policy.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, isDev);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  if (!isDev) requestHeaders.set("content-security-policy", csp);

  // Coarse rate limiting on our API (cron is protected by its own secret).
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/cron")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const isMutation = request.method !== "GET" && request.method !== "HEAD";
    const { ok, retryAfter } = rateLimit(`api:${ip}`, isMutation ? 40 : 120, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c));
    if (!isDev) redirectResponse.headers.set("content-security-policy", csp);
    return redirectResponse;
  }

  if (!isDev) response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|html)$).*)",
  ],
};
