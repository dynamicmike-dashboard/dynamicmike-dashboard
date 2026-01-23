/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Next.js 15 root-level property for slimming down the build
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'public/content/**',
    ],
  },
  experimental: {
    // Keep this clean to avoid terminal warnings
  },
  async rewrites() {
    return [
      {
        source: '/realai-elite',
        destination: '/content/maistermind/realai-app/index.html',
      },
      {
        // Handle the original specific file URL the user is testing
        source: '/realai-elite/realai-elite.html',
        destination: '/content/maistermind/realai-app/index.html',
      },
      {
        source: '/realai-dashboard',
        destination: '/content/maistermind/realai-app/app.html',
      },
      {
        // General wildcard for assets (css, js, images)
        source: '/realai-elite/:path*',
        destination: '/content/maistermind/realai-app/:path*',
      },
      {
        // Case-insensitive fallback
        source: '/RealAi-Elite/:path*',
        destination: '/content/maistermind/realai-app/:path*',
      },
    ];
  },
};

export default nextConfig;