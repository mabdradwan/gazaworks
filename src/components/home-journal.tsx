"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Newspaper } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HoverLift, StaggerGroup, StaggerItem } from "@/components/motion-primitives";
import type { Locale } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";

type Article = {
  id: string;
  slug: string;
  published_at: string | null;
  translation: { title: string; excerpt?: string; body: string } | null;
};

export function HomeJournal({ locale }: { locale: Locale }) {
  const marketing = marketingCopy(locale);
  const [items, setItems] = useState<Article[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/articles?locale=" + encodeURIComponent(locale), {
      signal: controller.signal,
    })
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
          ? new Date(article.published_at).toLocaleDateString(locale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : marketing.editorial.eyebrow.split(" · ")[0],
        title: article.translation?.title ?? article.slug,
        excerpt:
          article.translation?.excerpt ??
          article.translation?.body?.replace(/\s+/g, " ").slice(0, 180) ??
          "",
        live: true,
        tone: (index % 3) + 1,
      }));
    }

    return marketing.editorial.cards.map((article, index) => ({
      id: "fallback-" + index,
      slug: "",
      ...article,
      live: false,
      tone: index + 1,
    }));
  }, [items, locale, marketing]);

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
            <span />
            <span />
            <span />
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
                  <Link href={article.live ? "/" + locale + "/blog/" + article.slug : "/" + locale + "/blog"}>
                    {marketing.editorial.readArticle}
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
