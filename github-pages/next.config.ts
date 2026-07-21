import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "export", basePath: "/DekoKraft", assetPrefix: "/DekoKraft/", trailingSlash: true, images: { loader: "custom", loaderFile: "./image-loader.ts" }, env: { NEXT_PUBLIC_BASE_PATH: "/DekoKraft" } };
export default nextConfig;
