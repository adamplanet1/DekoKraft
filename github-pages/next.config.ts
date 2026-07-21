import type { NextConfig } from "next";

const isGitHubPagesExport = process.env.DEKOKRAFT_GITHUB_PAGES === "true";
const basePath = isGitHubPagesExport ? "/DekoKraft" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: isGitHubPagesExport ? "/DekoKraft/" : "",
  trailingSlash: true,
  images: { loader: "custom", loaderFile: "./image-loader.ts" },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
