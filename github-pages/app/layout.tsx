import type { Metadata } from "next";
import { LanguageProvider } from "../../app/components/LanguageProvider";
import "../../app/globals.css";

export const metadata: Metadata = { title: "DekoKraft", description: "Handmade products, gifts, candles, and creative services." };
export default function GitHubPagesLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ar" dir="rtl" suppressHydrationWarning className="h-full antialiased"><body className="min-h-full flex flex-col"><LanguageProvider>{children}</LanguageProvider></body></html>; }
