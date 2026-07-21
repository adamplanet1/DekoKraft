"use client";

import AnnouncementBar from "./AnnouncementBar";
import PublicHeader from "./PublicHeader";

export default function PublicSiteHeader({
  showNotificationBar = true,
  showHeader = true,
  showFloatingToolbar = true,
}: {
  showNotificationBar?: boolean;
  showHeader?: boolean;
  showFloatingToolbar?: boolean;
}) {
  return (
    <div className="publicSiteChrome">
      {showNotificationBar && <AnnouncementBar />}
      {showHeader && (
        <PublicHeader showFloatingToolbar={showFloatingToolbar} />
      )}
    </div>
  );
}
