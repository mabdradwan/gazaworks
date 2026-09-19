"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

const nativeName: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export function LocaleSwitcher({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(ar|en|tr|es|fr|de)(?=\/|$)/, "");

  return (
    <div className={`locale-grid${className ? ` ${className}` : ""}`}>
      {locales.map((x) => {
        const href = `/${x}${rest || ""}`;
        const active = x === locale;
        return (
          <Link
            key={x}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`locale-pill${active ? " active" : ""}`}
          >
            {nativeName[x]}
          </Link>
        );
      })}
    </div>
  );
}
