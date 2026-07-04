import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/ollama-api/:path*",
        destination: "http://localhost:11434/:path*",
      },
    ];
  },
};

export default nextConfig;
