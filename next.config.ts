import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up the parent monorepo's lockfile.
  turbopack: { root: path.join(__dirname) },

  // Server actions / route handlers may receive image uploads from LINE.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
