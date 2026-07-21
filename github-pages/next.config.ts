import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS ? "/DekoKraft" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: process.env.GITHUB_ACTIONS ? "/DekoKraft/" : "",
  trailingSlash: true,
  images: { loader: "custom", loaderFile: "./image-loader.ts" },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
