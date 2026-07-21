import type { Metadata } from "next";
import { LanguageProvider } from "./components/LanguageProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DekoKraft",
  description: "Handmade products, gifts, candles, and creative services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
