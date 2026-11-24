import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gotenberg (Docker) charge la page d'impression via ce nom d'hôte en local
  allowedDevOrigins: ['host.docker.internal'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
