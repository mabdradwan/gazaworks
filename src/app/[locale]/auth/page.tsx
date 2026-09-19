import { notFound } from "next/navigation";
import { AuthForm } from "@/components/forms/auth-form";
import { ACCOUNT_TYPES, type AccountType } from "@/domain/marketplace";
import { isLocale } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";

export default async function Auth({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string | string[]; type?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const query = await searchParams;
  const rawMode = Array.isArray(query.mode) ? query.mode[0] : query.mode;
  const rawType = Array.isArray(query.type) ? query.type[0] : query.type;
  const initialMode = rawMode === "register" ? "register" : "signin";
  const initialAccountType =
    rawType && ACCOUNT_TYPES.includes(rawType as AccountType)
      ? (rawType as AccountType)
      : undefined;

  const marketing = marketingCopy(locale);

  return (
    <section className="container auth-page">
      <aside className="auth-story">
        <span className="eyebrow eyebrow-light">{marketing.network.eyebrow}</span>
        <h1>{marketing.network.title}</h1>
        <p>{marketing.network.body}</p>
        <div className="auth-story-points">
          {marketing.network.chips.map((item) => <span key={item}>✓ {item}</span>)}
        </div>
      </aside>
      <div className="auth-form-wrap">
        <AuthForm
          locale={locale}
          initialMode={initialMode}
          initialAccountType={initialAccountType}
        />
      </div>
    </section>
  );
}
