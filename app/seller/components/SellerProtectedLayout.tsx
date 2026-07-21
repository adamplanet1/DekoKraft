"use client";

import { useState, type ReactNode } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import SellerAccountHeader from "./SellerAccountHeader";
import SellerRouteGuard from "./SellerRouteGuard";
import SellerSessionProvider from "./SellerSessionProvider";
import SellerSidebar from "./SellerSidebar";
import SellerTopToolbar from "./SellerTopToolbar";

function ProtectedStudio({ sellerId, children }: { sellerId: string; children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang } = useLanguage();

  return (
    <SellerRouteGuard sellerId={sellerId}>
      <div className="sellerShell" dir={lang === "ar" ? "rtl" : "ltr"}>
        <SellerSidebar
          sellerId={sellerId}
          isOpen={isMenuOpen}
          onNavigate={() => setIsMenuOpen(false)}
        />
        {isMenuOpen && (
          <button
            type="button"
            className="sellerSidebarBackdrop"
            aria-label="إغلاق القائمة"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        <div className="sellerMain">
          <SellerTopToolbar
            sellerId={sellerId}
            isMenuOpen={isMenuOpen}
            onToggleMenu={() => setIsMenuOpen((open) => !open)}
          />
          <SellerAccountHeader sellerId={sellerId} />
          {children}
        </div>
      </div>
    </SellerRouteGuard>
  );
}

export default function SellerProtectedLayout({
  sellerId,
  children,
}: {
  sellerId: string;
  children: ReactNode;
}) {
  return (
    <SellerSessionProvider>
      <ProtectedStudio sellerId={sellerId}>{children}</ProtectedStudio>
    </SellerSessionProvider>
  );
}
