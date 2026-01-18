const nextConfig = {
  output: 'standalone',
  // Move it here, outside of experimental
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'public/content/**',
    ],
  },
  experimental: {
    // Keep this empty or add other experimental flags here
  },
};

export default nextConfig;