import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep the development badge from covering the fixed composer on narrow screens.
  devIndicators: false,
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
