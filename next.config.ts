import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  compress: true,

  // ✅ Optimize build output
  productionBrowserSourceMaps: false, // Disable source maps in production
  poweredByHeader: false,
  generateEtags: false,

  compiler: {
    removeConsole: process.env.ENABLE_CONSOLE_LOG === "false",
  },

  // ✅ Enable React Compiler for automatic memoization
  // Automatically memoizes components, useMemo, useCallback
  reactCompiler: true,

  // Fix turbopack + pino
  serverExternalPackages: [
    "pino",
    "pino-pretty",
    "thread-stream",
    "real-require",
    "socket.io-client"
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t-media.votingcrypto.com" },
      { protocol: "https", hostname: "media.votingcrypto.com" },
    ],
    // ✅ Optimize image qualities (reduce cache size)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    // dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async rewrites() {
    return [
      { source: "/sitemap-0.xml", destination: "/sitemap.xml/0" },
      { source: "/sitemap-news.xml", destination: "/sitemap.xml/news" },
      { source: "/sitemap-:id.xml", destination: "/sitemap.xml/:id" },
    ];
  },
};

export default createNextIntlPlugin()(nextConfig);
