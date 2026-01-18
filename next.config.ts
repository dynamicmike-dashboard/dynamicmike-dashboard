/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', 
  experimental: {
    // This helps Next.js ignore heavy folders that aren't needed for the UI
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'public/content/**', // Exclude the 1GB+ of site content from function bundling
      ],
    },
  },
};

export default nextConfig;