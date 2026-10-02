"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FlagIcon, LocaleSwitcher, localeNativeName } from "@/components/locale-switcher";
import type { Locale } from "@/lib/i18n";

const controlLabels: Record<Locale, string> = {
  ar: "تغيير اللغة", en: "Change language", tr: "Dili değiştir",
  es: "Cambiar idioma", fr: "Changer de langue", de: "Sprache ändern",
};

export function LanguageMenu({ locale,enabledLocales }: { locale: Locale;enabledLocales?:readonly Locale[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const items=Array.from(rootRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]')??[]);
    (items.find(item=>item.getAttribute("aria-current")==="page")??items[0])?.focus();

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {event.preventDefault();setOpen(false);triggerRef.current?.focus();}
      if (event.key === "Tab") setOpen(false);
      if (!rootRef.current?.contains(event.target as Node)||!items.length) return;
      const index=items.indexOf(document.activeElement as HTMLAnchorElement);
      if(["ArrowDown","ArrowUp","Home","End"].includes(event.key)){
        event.preventDefault();
        const next=event.key==="Home"?0:event.key==="End"?items.length-1:
          (index+(event.key==="ArrowDown"?1:-1)+items.length)%items.length;
        items[next]?.focus();
      }
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
        ref={triggerRef}
        aria-label={controlLabels[locale]}
        aria-expanded={open}
        aria-haspopup="menu"
        onKeyDown={event=>{if(event.key==="ArrowDown"||event.key==="ArrowUp"){event.preventDefault();setOpen(true)}}}
        onClick={() => setOpen((value) => !value)}
      >
        <FlagIcon locale={locale} className="language-flag-svg" />
        <span className="language-current-name">{localeNativeName[locale]}</span>
        <ChevronDown className="language-chevron" size={15} aria-hidden="true" />
      </button>

      {open && (
        <div className="card locale-popover language-popover" role="menu">
          <LocaleSwitcher locale={locale} enabledLocales={enabledLocales} inMenu onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
