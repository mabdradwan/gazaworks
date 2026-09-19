import { notFound } from "next/navigation";
import { AuthForm } from "@/components/forms/auth-form";
import { isLocale } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";

export default async function Auth({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
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
        <AuthForm locale={locale} />
      </div>
    </section>
  );
}
