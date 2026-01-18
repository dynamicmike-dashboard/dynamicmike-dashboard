const nextConfig = {
  output: 'standalone',
  // This prevents Next.js from trying to "watch" your 1GB of site content for changes
  watchOptions: {
    ignored: ['**/public/content/**', '**/node_modules/**'],
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'public/content/**',
    ],
  },
};

export default nextConfig;