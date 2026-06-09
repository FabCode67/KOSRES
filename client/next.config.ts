import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    // Allow SVG files from the public folder
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
