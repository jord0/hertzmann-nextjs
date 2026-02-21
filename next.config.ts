import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['ssh2-sftp-client', 'ssh2'],
};

export default nextConfig;