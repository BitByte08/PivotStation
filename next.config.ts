import type { NextConfig } from "next";

// Check if building for Electron (static export) or Cloudflare (server-side)
const isElectronBuild = process.env.BUILD_TARGET === 'electron' || process.env.ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Only enable static export for Electron builds
  ...(isElectronBuild ? { output: 'export' as const } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export and Cloudflare
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
  async headers() {
    // Headers are not applied in static export, but needed for Cloudflare
    if (isElectronBuild) {
      return [];
    }
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
