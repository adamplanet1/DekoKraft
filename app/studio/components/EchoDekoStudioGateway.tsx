"use client";

import { WandSparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import EchoDekoStudioModal from "./EchoDekoStudioModal";
import type { SmartEditLaunchContext } from "../engine/workspaceTypes";
import { loadCurrentUserSession } from "../../seller/lib/sellerSession";

export default function EchoDekoStudioGateway() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [launchContext, setLaunchContext] = useState<SmartEditLaunchContext | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("open") !== "smart-edit") return;
    const session = loadCurrentUserSession();
    const requestedParticipantId = query.get("participantId") || query.get("sellerId") || undefined;
    const participantId = session?.role === "participant" ? session.participantId : session?.role === "admin" ? requestedParticipantId : undefined;
    const sellerId = participantId;
    const productId = query.get("productId") || undefined;
    setLaunchContext({ openSmartEdit: true, participantId, sellerId, productId });
    setIsOpen(true);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`creativeStudiosGateway${isOpen ? " creativeStudiosGateway--active" : ""}`}
        aria-expanded={isOpen}
        aria-controls="echo-deko-studio-dialog"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        <span className="creativeStudiosGateway__icon" aria-hidden="true">
          <WandSparkles size={34} />
        </span>
        <span className="creativeStudiosGateway__copy">
          <strong>{t("studio.echo.gateway.title")}</strong>
          <span className="creativeStudiosGateway__tagline">{t("studio.echo.gateway.tagline")}</span>
          <span>{t("studio.echo.gateway.description")}</span>
          <small>{t("studio.echo.gateway.categories")}</small>
        </span>
        <span className="creativeStudiosGateway__action">{t("studio.echo.gateway.open")}</span>
      </button>

      {isOpen && <EchoDekoStudioModal onClose={closeModal} returnFocusRef={triggerRef} launchContext={launchContext} />}
    </>
  );
}
