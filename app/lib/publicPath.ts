export function publicPath(path: string): string {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (basePath && normalizedPath.startsWith(`${basePath}/`)) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}
