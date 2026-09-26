"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { locales, type Locale } from "@/lib/i18n";

export const localeNativeName: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export function FlagIcon({ locale, className = "" }: { locale: Locale; className?: string }) {
  const common = { className, viewBox: "0 0 36 24", role: "img" as const, "aria-hidden": true as const };

  if (locale === "ar") {
    return <svg {...common}><rect width="36" height="8" fill="#111"/><rect y="8" width="36" height="8" fill="#fff"/><rect y="16" width="36" height="8" fill="#168253"/><path d="M0 0 14 12 0 24Z" fill="#d9272e"/></svg>;
  }
  if (locale === "en") {
    return <svg {...common}><rect width="36" height="24" fill="#173b83"/><path d="M0 0 36 24M36 0 0 24" stroke="#fff" strokeWidth="5"/><path d="M0 0 36 24M36 0 0 24" stroke="#cf2436" strokeWidth="2.2"/><path d="M18 0v24M0 12h36" stroke="#fff" strokeWidth="7"/><path d="M18 0v24M0 12h36" stroke="#cf2436" strokeWidth="3.6"/></svg>;
  }
  if (locale === "tr") {
    return <svg {...common}><rect width="36" height="24" fill="#e30a17"/><circle cx="15" cy="12" r="6.6" fill="#fff"/><circle cx="17.3" cy="12" r="5.3" fill="#e30a17"/><path d="m23.2 8.3 1 2.5 2.7.2-2.1 1.7.7 2.6-2.3-1.5-2.3 1.5.7-2.6-2.1-1.7 2.7-.2Z" fill="#fff"/></svg>;
  }
  if (locale === "es") {
    return <svg {...common}><rect width="36" height="24" fill="#aa151b"/><rect y="6" width="36" height="12" fill="#f1bf00"/></svg>;
  }
  if (locale === "fr") {
    return <svg {...common}><rect width="12" height="24" fill="#0055a4"/><rect x="12" width="12" height="24" fill="#fff"/><rect x="24" width="12" height="24" fill="#ef4135"/></svg>;
  }
  return <svg {...common}><rect width="36" height="8" fill="#111"/><rect y="8" width="36" height="8" fill="#dd0000"/><rect y="16" width="36" height="8" fill="#ffce00"/></svg>;
}

export function LocaleSwitcher({
  locale,
  className,
  onNavigate,
  inMenu = false,
}: {
  locale: Locale;
  className?: string;
  onNavigate?: () => void;
  inMenu?: boolean;
}) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(ar|en|tr|es|fr|de)(?=\/|$)/, "");
  // Both menus mount this component when opened, so their first link render
  // already includes the current registration choice and search filters.
  const [urlSuffix] = useState(() => typeof window === "undefined" ? "" : window.location.search + window.location.hash);

  return (
    <div className={`locale-list${className ? ` ${className}` : ""}`}>
      {locales.map((item) => {
        const href = `/${item}${rest || ""}${urlSuffix}`;
        const active = item === locale;
        return (
          <Link
            key={item}
            href={href}
            onClick={onNavigate}
            role={inMenu ? "menuitem" : undefined}
            aria-current={active ? "page" : undefined}
            className={`locale-option${active ? " active" : ""}`}
          >
            <FlagIcon locale={item} className="locale-flag-svg" />
            <span className="locale-name">{localeNativeName[item]}</span>
            <span className="locale-code">{item.toUpperCase()}</span>
            <Check className="locale-check" size={15} aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}
