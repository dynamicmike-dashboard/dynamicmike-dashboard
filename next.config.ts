/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Next.js 15 root-level property for slimming down the build
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
    ],
  },
  experimental: {
    // Keep this clean to avoid terminal warnings
  },
};

export default nextConfig;