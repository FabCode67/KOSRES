import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Allow any external hostname if needed later
    remotePatterns: [],
  },
}

export default nextConfig
