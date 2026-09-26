"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FlagIcon, LocaleSwitcher, localeNativeName } from "@/components/locale-switcher";
import type { Locale } from "@/lib/i18n";

const controlLabels: Record<Locale, string> = {
  ar: "تغيير اللغة", en: "Change language", tr: "Dili değiştir",
  es: "Cambiar idioma", fr: "Changer de langue", de: "Sprache ändern",
};

export function LanguageMenu({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="desktop locale-menu language-menu-root" ref={rootRef}>
      <button
        type="button"
        className="language-trigger"
        aria-label={controlLabels[locale]}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <FlagIcon locale={locale} className="language-flag-svg" />
        <span className="language-current-name">{localeNativeName[locale]}</span>
        <ChevronDown className="language-chevron" size={15} aria-hidden="true" />
      </button>

      {open && (
        <div className="card locale-popover language-popover" role="menu">
          <LocaleSwitcher locale={locale} inMenu onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
