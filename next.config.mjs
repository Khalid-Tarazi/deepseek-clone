// next.config.js
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(process.cwd()),
      "@config": path.resolve(process.cwd(), "config"),
    };
    return config;
  },
};

export default nextConfig;
