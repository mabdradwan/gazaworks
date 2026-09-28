import { notFound } from "next/navigation";
import { CmsPage } from "@/components/cms-page";
import { isLocale } from "@/lib/i18n";
import { policyDraftNotice, policyFallback, type PolicySlug } from "@/lib/policy-copy";

export async function PolicyPage({ slug, params }: { slug: PolicySlug; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const fallback = policyFallback(locale, slug);
  return <CmsPage slug={slug} locale={locale} fallbackTitle={fallback.title}
    fallbackDescription={fallback.description} policyNotice={slug === "faq" ? undefined : policyDraftNotice[locale]} />;
}
