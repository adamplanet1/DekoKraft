"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import PublicFloatingToolbar from "./PublicFloatingToolbar";

export function DkPublicHeader({
  showFloatingToolbar = true,
}: {
  showFloatingToolbar?: boolean;
}) {
  const { direction } = useLanguage();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={hasScrolled ? "publicHeader scrolled" : "publicHeader"}
      dir={direction}
    >
      <div className="publicHeaderMain publicContentContainer">
        {showFloatingToolbar && <PublicFloatingToolbar />}
      </div>
    </header>
  );
}

export default DkPublicHeader;
