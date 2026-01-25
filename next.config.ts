/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // REMOVED: Suspected of causing Vercel to skip copying public assets for static serving
  
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
      // 5. Existing rewrites (if any needed)
    ];
  },

  // Next.js 15 root-level property for slimming down the build
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'public/content/maistermind/**',
      'public/content/breath-of-life/**',
      'public/content/celestial-sign-design/**',
      'public/content/chatallday/**',
      'public/content/chillmasterscotland/**',
      'public/content/consciousshifts/**',
      'public/content/fifeart/**',
      'public/content/inspiringspeakerspdc/**',
      'public/content/louisevandervelde/**',
      'public/content/nahuala/**',
      'public/content/pdcyes/**',
      'public/content/playaphotos/**',
      'public/content/playavida/**',
      'public/content/pranatowers/**',
      'public/content/realaicasas/**',
      'public/content/reallifeavengers/**',
      'public/content/smms/**',
    ],
  },
  experimental: {
    // Keep this clean to avoid terminal warnings
  },
};

export default nextConfig;