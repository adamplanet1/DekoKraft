"use client";

import {
  CircleHelp,
  CreditCard,
  FileText,
  Info,
  LifeBuoy,
  Lightbulb,
  Mail,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";
import { routes } from "../config/routes";
import { useLanguage } from "./LanguageProvider";
import DkButton from "./ui/DkButton";

type PublicServiceCenterModalProps = {
  isOpen: boolean;
  onDismiss: () => void;
  onNavigate: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

type PublicServiceItem = {
  key:
    | "about"
    | "privacy"
    | "terms"
    | "payment"
    | "shipping"
    | "returns"
    | "dataProtection"
    | "faq"
    | "contact"
    | "suggestFeature"
    | "helper"
    | "support";
  icon: LucideIcon;
  href?: string;
};

const publicServiceItems: PublicServiceItem[] = [
  { key: "about", icon: Info, href: routes.info("about") },
  { key: "privacy", icon: ShieldCheck, href: routes.info("privacy") },
  { key: "terms", icon: FileText, href: routes.info("legal") },
  { key: "payment", icon: CreditCard, href: routes.info("payment") },
  { key: "shipping", icon: Truck, href: routes.info("shipping") },
  { key: "returns", icon: RotateCcw },
  { key: "dataProtection", icon: PackageCheck, href: routes.info("data-protection") },
  { key: "faq", icon: CircleHelp, href: routes.info("faq") },
  { key: "contact", icon: Mail, href: routes.info("contact") },
  { key: "suggestFeature", icon: Lightbulb, href: routes.info("suggestions") },
  { key: "helper", icon: Sparkles, href: routes.info("future-tool") },
  { key: "support", icon: LifeBuoy },
];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function PublicServiceCenterModal({
  isOpen,
  onDismiss,
  onNavigate,
  returnFocusRef,
}: PublicServiceCenterModalProps) {
  const { direction, t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const returnFocusElement = returnFocusRef.current;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogRef.current?.focus());

    function dismiss() {
      shouldRestoreFocusRef.current = true;
      onDismiss();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (shouldRestoreFocusRef.current) {
        shouldRestoreFocusRef.current = false;
        window.setTimeout(() => returnFocusElement?.focus(), 0);
      }
    };
  }, [isOpen, onDismiss, returnFocusRef]);

  if (!isOpen) return null;

  function dismiss() {
    shouldRestoreFocusRef.current = true;
    onDismiss();
  }

  return (
    <div
      className="publicServiceCenterOverlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        id="public-service-center-dialog"
        className="publicServiceCenterDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-service-center-title"
        aria-describedby="public-service-center-description"
        dir={direction}
        tabIndex={-1}
      >
        <header className="publicServiceCenterHeader">
          <div>
            <h2 id="public-service-center-title">{t("servicesCenter.title")}</h2>
            <p id="public-service-center-description">{t("servicesCenter.modalDescription")}</p>
          </div>
          <button
            type="button"
            className="publicServiceCenterClose"
            aria-label={t("servicesCenter.close")}
            title={t("servicesCenter.close")}
            onClick={dismiss}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <nav className="publicServiceCenterGrid" aria-label={t("servicesCenter.navigationLabel")}>
          {publicServiceItems.map((item) => {
            const Icon = item.icon;
            return (
              <DkButton
                key={item.key}
                className="publicServiceCenterItem"
                href={item.href}
                disabled={!item.href}
                icon={<Icon />}
                aria-label={t(`servicesCenter.${item.key}`)}
                title={!item.href ? t("servicesCenter.unavailable") : undefined}
                onClick={item.href ? onNavigate : undefined}
              >
                {t(`servicesCenter.${item.key}`)}
              </DkButton>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
