import { notFound } from "next/navigation";
import { TalentSearch } from "@/components/talent/search";
import { AIAssistant } from "@/components/ai-assistant";
import { isLocale } from "@/lib/i18n";
import { uiCopy } from "@/lib/ui-copy";

export const metadata = { robots: { index: false, follow: false } };

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ui = uiCopy(locale);

  return (
    <section className="container talent-page">
      <div className="talent-page-hero">
        <span className="badge premium-badge">{ui.pages.talentBadge}</span>
        <h1>{ui.pages.talentTitle}</h1>
        <p className="muted">{ui.talent.intro}</p>
      </div>
      <AIAssistant locale={locale} mode="talent_search" />
      <TalentSearch locale={locale} />
    </section>
  );
}
