import type { ReactNode } from "react";
import HomeV2Footer from "./home-v2/HomeV2Footer";
import PublicSiteHeader from "./PublicSiteHeader";
import DkPageBackground from "./ui/DkPageBackground";

export type PublicPageShellProps = {
  children: ReactNode;
  showNotificationBar?: boolean;
  showHeader?: boolean;
  showFloatingToolbar?: boolean;
  showFooter?: boolean;
  className?: string;
};

export function DkPublicPageShell({
  children,
  showNotificationBar = true,
  showHeader = true,
  showFloatingToolbar = true,
  showFooter = false,
  className,
}: PublicPageShellProps) {
  return (
    <div
      className={
        className
          ? `publicPageShell dkPublicTheme ${className}`
          : "publicPageShell dkPublicTheme"
      }
      data-page-theme="dekokraft-blue"
    >
      <DkPageBackground />

      <div className="publicPageContent">
        <PublicSiteHeader
          showNotificationBar={showNotificationBar}
          showHeader={showHeader}
          showFloatingToolbar={showFloatingToolbar}
        />
        <div className="publicPageBody">{children}</div>
        {showFooter && <HomeV2Footer />}
      </div>
    </div>
  );
}

export default DkPublicPageShell;
