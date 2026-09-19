import { notFound } from "next/navigation";
import { CmsPage } from "@/components/cms-page";
import { cmsFallbackCopy } from "@/lib/cms-fallback-copy";
import { isLocale } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const fallback = cmsFallbackCopy(locale).how;
  return (
    <CmsPage
      slug="how-it-works"
      locale={locale}
      fallbackTitle={fallback.title}
      fallbackDescription={fallback.description}
    />
  );
}
