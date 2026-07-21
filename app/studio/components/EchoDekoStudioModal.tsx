"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type RefObject,
} from "react";
import { useLanguage } from "../../components/LanguageProvider";
import { DkButton } from "../../components/ui";
import EchoImageStudio from "./EchoImageStudio";
import StudioWorkshopCard from "./StudioWorkshopCard";
import { studioWorkshops, type StudioWorkshopId } from "./studioWorkshops";
import { WorkspaceProvider } from "../engine/WorkspaceContext";
import type { SmartEditLaunchContext } from "../engine/workspaceTypes";

type EchoDekoStudioModalProps = {
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  launchContext?: SmartEditLaunchContext | null;
};

type AuraStyle = CSSProperties & {
  "--studio-accent": string;
  "--studio-accent-soft": string;
  "--studio-accent-border": string;
  "--studio-accent-glow": string;
};

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function EchoDekoStudioModal({ onClose, returnFocusRef, launchContext }: EchoDekoStudioModalProps) {
  const { direction, t } = useLanguage();
  const [activeView, setActiveView] = useState<"menu" | "imageStudio">(launchContext?.openSmartEdit ? "imageStudio" : "menu");
  const [isImageStudioMaximized, setIsImageStudioMaximized] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<StudioWorkshopId | null>(null);
  const [notice, setNotice] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const selectedWorkshop = useMemo(
    () => studioWorkshops.find((workshop) => workshop.id === selectedWorkshopId) ?? null,
    [selectedWorkshopId],
  );
  const aura = selectedWorkshop ?? studioWorkshops[1];
  const auraStyle: AuraStyle = {
    "--studio-accent": aura.accent,
    "--studio-accent-soft": aura.accentSoft,
    "--studio-accent-border": aura.accentBorder,
    "--studio-accent-glow": aura.accentGlow,
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const returnFocusElement = returnFocusRef.current;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyboard);
      document.body.style.overflow = previousOverflow;
      returnFocusElement?.focus();
    };
  }, [onClose, returnFocusRef]);

  const closeFromOverlay = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleWorkshopOpen = (id: StudioWorkshopId) => {
    setSelectedWorkshopId(id);
    setNotice("");
    if (id === "image") setActiveView("imageStudio");
  };

  const openSelectedWorkshop = () => {
    if (selectedWorkshopId === "image") {
      setActiveView("imageStudio");
      return;
    }
    setNotice(t("studio.echo.modal.placeholderMessage"));
  };

  return (
    <div className="creativeStudiosOverlay" onMouseDown={closeFromOverlay}>
      <section
        ref={dialogRef}
        id="echo-deko-studio-dialog"
        className={`creativeStudiosDialog${activeView === "imageStudio" && isImageStudioMaximized ? " creativeStudiosDialog--echoImageMaximized" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={activeView === "menu" ? "echo-deko-studio-dialog-title" : "echo-image-studio-title"}
        aria-describedby={activeView === "menu" ? "echo-deko-studio-dialog-description" : undefined}
        dir={direction}
        style={auraStyle}
      >
        {activeView === "menu" && (
          <button
            ref={closeButtonRef}
            type="button"
            className="creativeStudiosDialog__close"
            aria-label={t("studio.echo.modal.close")}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        )}

        {activeView === "imageStudio" ? (
          <WorkspaceProvider initialWorkspace="image" initialTool={launchContext?.openSmartEdit ? "smart-edit" : null}>
            <EchoImageStudio
              launchContext={launchContext}
              isMaximized={isImageStudioMaximized}
              onMaximize={() => setIsImageStudioMaximized(true)}
              onRestore={() => setIsImageStudioMaximized(false)}
              onCloseStudio={onClose}
              onBack={() => {
                setIsImageStudioMaximized(false);
                setActiveView("menu");
              }}
            />
          </WorkspaceProvider>
        ) : (
          <>
            <header className="creativeStudiosDialog__header">
              <h2 id="echo-deko-studio-dialog-title">{t("studio.echo.modal.title")}</h2>
              <p id="echo-deko-studio-dialog-description">{t("studio.echo.modal.description")}</p>
            </header>

            <div className="creativeStudiosWorkshopGrid">
              {studioWorkshops.map((workshop) => (
                <StudioWorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  title={t(workshop.titleKey)}
                  description={t(workshop.descriptionKey)}
                  status={t(workshop.statusKey)}
                  isSelected={selectedWorkshopId === workshop.id}
                  onSelect={() => handleWorkshopOpen(workshop.id)}
                />
              ))}
            </div>

            <footer className="creativeStudiosDialog__footer">
              <p className="creativeStudiosDialog__selection">
                {t("studio.echo.modal.selected")}: {" "}
                <strong>
                  {selectedWorkshop ? t(selectedWorkshop.titleKey) : t("studio.common.waiting")}
                </strong>
                {selectedWorkshop && <span className="creativeStudiosDialog__auraDot" aria-hidden="true" />}
              </p>
              {notice && <p className="creativeStudiosDialog__notice" role="status">{notice}</p>}
              <div className="creativeStudiosDialog__actions">
                <DkButton type="button" variant="subtle" onClick={onClose}>
                  {t("studio.echo.modal.close")}
                </DkButton>
                <button
                  type="button"
                  className="creativeStudiosDialog__openWorkshop"
                  disabled={!selectedWorkshop}
                  onClick={openSelectedWorkshop}
                >
                  {t("studio.echo.modal.openWorkshop")}
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
