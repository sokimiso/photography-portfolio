import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Skip lint errors in production build
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TS errors in production build
  },
};

export default nextConfig;
