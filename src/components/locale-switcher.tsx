"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export const localeNativeName: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export const localeFlag: Record<Locale, string> = {
  ar: "🇵🇸",
  en: "🇬🇧",
  tr: "🇹🇷",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
};

export function LocaleSwitcher({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(ar|en|tr|es|fr|de)(?=\/|$)/, "");

  return (
    <div className={`locale-list${className ? ` ${className}` : ""}`}>
      {locales.map((item) => {
        const href = `/${item}${rest || ""}`;
        const active = item === locale;

        return (
          <Link
            key={item}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`locale-option${active ? " active" : ""}`}
          >
            <span className="locale-flag" aria-hidden="true">{localeFlag[item]}</span>
            <span className="locale-name">{localeNativeName[item]}</span>
            <span className="locale-code">{item.toUpperCase()}</span>
            <Check className="locale-check" size={15} aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}
