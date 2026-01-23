/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Next.js 15 root-level property for slimming down the build
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      // Exclude large content folders to prevent API function size limit errors (1.5GB+)
      // We MUST keep 'public/content/maistermind' for RealAi-Elite
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