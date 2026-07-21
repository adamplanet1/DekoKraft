"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { classNames } from "./classNames";

export type DkMenuAnchor = {
  bottom: number;
  left: number;
  right: number;
  viewportWidth: number;
};

type DkAnchoredMenuProps = {
  id: string;
  isOpen: boolean;
  anchor: DkMenuAnchor | null;
  direction: "rtl" | "ltr";
  label: string;
  closeLabel: string;
  className?: string;
  backdropClassName?: string;
  onClose: () => void;
  children: ReactNode;
};

export function readMenuAnchor(element: HTMLElement): DkMenuAnchor {
  const rect = element.getBoundingClientRect();
  return {
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    viewportWidth: window.innerWidth,
  };
}

export default function DkAnchoredMenu({
  id,
  isOpen,
  anchor,
  direction,
  label,
  closeLabel,
  className,
  backdropClassName,
  onClose,
  children,
}: DkAnchoredMenuProps) {
  const menuRef = useRef<HTMLElement>(null);
  const edgeOffset = anchor
    ? direction === "rtl"
      ? Math.max(12, anchor.viewportWidth - anchor.right)
      : Math.max(12, anchor.left)
    : 12;
  const style = {
    "--dk-anchored-menu-top": `${Math.round((anchor?.bottom ?? 44) + 8)}px`,
    "--dk-anchored-menu-edge": `${Math.round(edgeOffset)}px`,
  } as CSSProperties;

  useEffect(() => {
    if (!isOpen) return;

    const closeOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (menuRef.current?.contains(target)) return;
      if (target.closest(`[aria-controls="${id}"]`)) return;
      onClose();
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [id, isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className={classNames("dk-anchored-menu__backdrop", backdropClassName)}
          aria-label={closeLabel}
          onClick={onClose}
        />
      )}
      <aside
        ref={menuRef}
        id={id}
        className={classNames(
          "dk-anchored-menu",
          isOpen && "dk-anchored-menu--open",
          className,
        )}
        dir={direction}
        aria-label={label}
        aria-hidden={!isOpen}
        style={style}
      >
        {children}
      </aside>
    </>
  );
}
