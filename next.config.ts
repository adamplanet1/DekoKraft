import type { NextConfig } from "next";

const isStaticExport = process.env.DEKOKRAFT_STATIC_EXPORT === "true";
const basePath = isStaticExport ? "/DekoKraft" : "";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath,
  assetPrefix: isStaticExport ? "/DekoKraft/" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
