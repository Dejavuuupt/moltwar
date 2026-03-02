/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://upload.wikimedia.org https://i.imgur.com",
              "connect-src 'self' http://localhost:4000 ws://localhost:4000 https://*.vercel.app wss://*.vercel.app https://www.api.sendallmemes.fun wss://www.api.sendallmemes.fun https://*.polymarket.com https://clob.polymarket.com https://gamma-api.polymarket.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
