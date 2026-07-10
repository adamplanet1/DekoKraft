import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/DekoKraft" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: isProduction ? "/DekoKraft/" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
