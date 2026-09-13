/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Google account avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Supabase Storage (profile media)
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async headers() {
    // Static security headers. The dynamic Content-Security-Policy (with a
    // per-request nonce) is set in middleware.ts.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          {
            key: "Permissions-Policy",
            // Geolocation is allowed only for our own origin (the live-location feature).
            value: "geolocation=(self), camera=(), microphone=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
