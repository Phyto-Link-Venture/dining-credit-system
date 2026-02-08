import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
} as NextConfig;
export default nextConfig;
