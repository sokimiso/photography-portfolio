import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/public/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "sokirka.com",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "www.sokirka.com",
        pathname: "/public/**",
      },
    ],
  },
};

export default nextConfig;
