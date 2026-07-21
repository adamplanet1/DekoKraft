"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { languageOptions, type Lang } from "../../../locales";

export type DkLanguageMenuProps = {
  language: Lang;
  direction: "rtl" | "ltr";
  label: string;
  onChange: (language: Lang) => void;
  className?: string;
};

export default function DkLanguageMenu({
  language,
  direction,
  label,
  onChange,
  className,
}: DkLanguageMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  function focusSelected() {
    requestAnimationFrame(() => {
      const index = languageOptions.findIndex((option) => option.value === language);
      itemRefs.current[index >= 0 ? index : 0]?.focus();
    });
  }

  function open() {
    setIsOpen(true);
    focusSelected();
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open();
    }
  }

  function handleItemKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const last = languageOptions.length - 1;
    let next = index;
    if (event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    itemRefs.current[next]?.focus();
  }

  return (
    <div
      ref={rootRef}
      className={className ? `dk-language-menu ${className}` : "dk-language-menu"}
      dir={direction}
    >
      <button
        ref={triggerRef}
        type="button"
        className="dk-language-menu__trigger publicLanguageButton"
        aria-label={label}
        aria-haspopup="menu"
        aria-controls="dk-public-language-menu"
        aria-expanded={isOpen}
        title={label}
        onClick={() => {
          if (isOpen) setIsOpen(false);
          else open();
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{language.toUpperCase()}</span>
      </button>
      {isOpen && (
        <div id="dk-public-language-menu" className="dk-language-menu__list publicLanguageMenu" role="menu">
          {languageOptions.map((option, index) => (
            <button
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={language === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                requestAnimationFrame(() => triggerRef.current?.focus());
              }}
              onKeyDown={(event) => handleItemKeyDown(event, index)}
            >
              {option.label}
              {language === option.value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
