import type { ImageLoaderProps } from "next/image";
export default function githubPagesImageLoader({ src }: ImageLoaderProps): string { if (/^(?:https?:|data:|blob:)/.test(src)) return src; const normalized = src.startsWith("/") ? src : `/${src}`; return normalized.startsWith("/DekoKraft/") ? normalized : `/DekoKraft${normalized}`; }
