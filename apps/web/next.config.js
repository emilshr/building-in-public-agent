/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/db", "@repo/types", "@repo/ui"],
  allowedDevOrigins: ["localhost", "*.ngrok-free.dev"],
};

export default nextConfig;
