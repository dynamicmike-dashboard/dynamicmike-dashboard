/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
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
    '*': [
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