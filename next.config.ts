/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ]
  },
  // Force static priority by rewriting to self
  async rewrites() {
    return [
      // 1. Landing Page
      {
        source: '/realai-elite',
        destination: '/realai-pages/realai-elite.html',
      },
      // 2. Dashboard
      {
        source: '/realai-elite/dashboard',
        destination: '/realai-pages/realai-elite-dashboard.html',
      },
      // 3. Confirmation
      {
        source: '/realai-elite/confirmation',
        destination: '/realai-pages/realai-elite-confirmation.html',
      },
      // 4. Probe Test (Legacy)
      {
        source: '/probe-test.txt',
        destination: '/probe-test.txt',
      },
    ];
  },

  // Next.js 15 root-level property for slimming down the build
  // We exclude ALL media from the serverless function trace to stay under 250MB.
  // The files will still be served statically by Vercel from the public folder.
  outputFileTracingExcludes: {
    '**/*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/sharp/**/*', // Sharp is in devDeps but just in case
      'public/content/**/*.png',
      'public/content/**/*.jpg',
      'public/content/**/*.jpeg',
      'public/content/**/*.webp',
      'public/content/**/*.gif',
      'public/content/**/*.mp4',
      'public/content/**/*.mov',
      'public/content/**/*.avi',
      'public/content/**/*.pdf',
      'public/content/**/*.zip',
      'public/realai-elite-assets/**/*', // Massive 359MB folder
      'public/realai-elite-legacy/**/*',
    ],
  },
  experimental: {
    // Keep this clean to avoid terminal warnings
  },
};

export default nextConfig;