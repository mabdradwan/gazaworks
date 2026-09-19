import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion-primitives";
import { isLocale } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";
import { supabaseServer } from "@/lib/supabase/server";

type Translation = {
  locale: string;
  title: string;
  excerpt: string | null;
  body: string;
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const db = await supabaseServer();
  const { data } = await db
    .from("articles")
    .select("id,slug,published_at,status,article_translations(locale,title,excerpt,body)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) notFound();

  const translations = (data.article_translations ?? []) as Translation[];
  const translation =
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === "en") ??
    translations[0];

  if (!translation) notFound();

  const marketing = marketingCopy(locale);
  const paragraphs = translation.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className="journal-article">
      <div className="container journal-article-shell">
        <Reveal>
          <Link className="article-back-link" href={"/" + locale + "/blog"}>
            <ArrowLeft className="directional-icon" size={17} />
            {marketing.editorial.readAll}
          </Link>

          <div className="journal-article-meta">
            <span>{marketing.blog.eyebrow}</span>
            {data.published_at && (
              <span>
                <CalendarDays size={15} />
                {new Date(data.published_at).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          <h1>{translation.title}</h1>
          {translation.excerpt && <p className="journal-article-deck">{translation.excerpt}</p>}
        </Reveal>

        <Reveal delay={0.08} className="journal-article-body">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Reveal>
      </div>
    </article>
  );
}
