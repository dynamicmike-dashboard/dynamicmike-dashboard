/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // REMOVED: Suspected of causing Vercel to skip copying public assets for static serving
  
  // Force static priority by rewriting to self
  async rewrites() {
    return [
      {
        source: '/realai-elite',
        destination: '/realai-elite/index.html',
      },
      {
        source: '/realai-elite/:path*',
        destination: '/realai-elite/:path*',
      },
      {
        source: '/probe-test.txt',
        destination: '/probe-test.txt',
      },
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