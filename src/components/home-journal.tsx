"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, ExternalLink, Newspaper } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HoverLift, StaggerGroup, StaggerItem } from "@/components/motion-primitives";
import { editorialSources } from "@/lib/editorial-sources";
import type { Locale } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";

type SourceMeta = { source_name?: string; source_url?: string; source_date?: string };
type Article = {
  id: string;
  slug: string;
  published_at: string | null;
  translation: { title: string; excerpt?: string; body: string; seo?: SourceMeta | null } | null;
};

export function HomeJournal({ locale }: { locale: Locale }) {
  const marketing = marketingCopy(locale);
  const sourced = editorialSources(locale);
  const [items, setItems] = useState<Article[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/articles?locale=" + encodeURIComponent(locale), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as Article[];
        setItems(data.slice(0, 3));
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
    return () => controller.abort();
  }, [locale]);

  const cards = useMemo(() => {
    if (items.length) {
      return items.map((article, index) => ({
        id: article.id,
        slug: article.slug,
        tag: article.published_at
          ? new Date(article.published_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
          : marketing.editorial.eyebrow.split(" · ")[0],
        title: article.translation?.title ?? article.slug,
        excerpt: article.translation?.excerpt ?? article.translation?.body?.replace(/\s+/g, " ").slice(0, 180) ?? "",
        source: article.translation?.seo?.source_name,
        sourceUrl: article.translation?.seo?.source_url,
        sourceDate: article.translation?.seo?.source_date,
        live: true,
        tone: (index % 3) + 1,
      }));
    }

    return sourced.items.map((article, index) => ({
      id: "fallback-" + index,
      slug: "",
      ...article,
      live: false,
      tone: index + 1,
    }));
  }, [items, locale, marketing, sourced.items]);

  return (
    <section className="section-shell editorial-section">
      <div className="container">
        <div className="section-heading editorial-heading">
          <div>
            <span className="eyebrow">{marketing.editorial.eyebrow}</span>
            <h2>{marketing.editorial.title}</h2>
            <p>{marketing.editorial.body}</p>
          </div>
          <Link className="btn secondary" href={"/" + locale + "/blog"}>
            {marketing.editorial.readAll}
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {!ready && (
          <div className="journal-loading" aria-hidden="true">
            <span /><span /><span />
          </div>
        )}

        <StaggerGroup className="editorial-grid">
          {cards.map((article) => (
            <StaggerItem key={article.id}>
              <HoverLift className="article-card">
                <div className={"article-art article-art-" + article.tone}>
                  <span>{article.tag}</span>
                  {article.live ? <CalendarDays size={30} /> : <Newspaper size={30} />}
                </div>
                <div className="article-body">
                  <span className="article-label">{article.tag}</span>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  {article.source && article.sourceUrl && (
                    <a className="article-source" href={article.sourceUrl} target="_blank" rel="noreferrer">
                      <span>{article.source}</span>
                      {article.sourceDate && <small>{article.sourceDate}</small>}
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {article.live ? (
                    <Link href={"/" + locale + "/blog/" + article.slug}>
                      {marketing.editorial.readArticle}
                      <ArrowUpRight size={16} />
                    </Link>
                  ) : (
                    <a href={article.sourceUrl} target="_blank" rel="noreferrer">
                      {sourced.sourceCta}
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
