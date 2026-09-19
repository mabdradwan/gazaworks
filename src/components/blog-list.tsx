"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { HoverLift, StaggerGroup, StaggerItem } from "@/components/motion-primitives";
import { marketingCopy } from "@/lib/marketing-copy";
import { isLocale } from "@/lib/i18n";

type Article = {
  id: string;
  slug: string;
  published_at: string | null;
  translation: { title: string; excerpt?: string; body: string } | null;
};

export function BlogList({ locale }: { locale: string }) {
  const safeLocale = isLocale(locale) ? locale : "en";
  const marketing = marketingCopy(safeLocale);
  const ui = marketing.blog;
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/articles?locale=" + encodeURIComponent(safeLocale), {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.ok) setItems(await response.json());
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [safeLocale]);

  if (loading) {
    return (
      <div className="journal-loading journal-loading-page" aria-label={ui.loading}>
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (!items.length) {
    return (
      <StaggerGroup className="blog-grid">
        {marketing.editorial.cards.map((article, index) => (
          <StaggerItem key={article.title}>
            <HoverLift className="blog-card blog-card-premium">
              <div className={"blog-card-art article-art-" + (index + 1)}>
                <span>{article.tag}</span>
                <Newspaper size={28} />
              </div>
              <div className="blog-card-content">
                <span className="article-label">{article.tag}</span>
                <h2>{article.title}</h2>
                <p className="muted">{article.excerpt}</p>
              </div>
            </HoverLift>
          </StaggerItem>
        ))}
      </StaggerGroup>
    );
  }

  return (
    <StaggerGroup className="blog-grid">
      {items.map((article, index) => {
        const date = article.published_at
          ? new Date(article.published_at).toLocaleDateString(safeLocale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : marketing.blog.eyebrow;

        return (
          <StaggerItem key={article.id}>
            <HoverLift className="blog-card blog-card-premium">
              <Link className="blog-card-link" href={"/" + safeLocale + "/blog/" + article.slug}>
                <div className={"blog-card-art article-art-" + ((index % 3) + 1)}>
                  <span>{date}</span>
                  <CalendarDays size={28} />
                </div>
                <div className="blog-card-content">
                  <span className="article-label">{date}</span>
                  <h2>{article.translation?.title ?? article.slug}</h2>
                  <p className="muted">
                    {article.translation?.excerpt ??
                      article.translation?.body?.replace(/\s+/g, " ").slice(0, 220)}
                  </p>
                  <span className="blog-card-read">
                    {marketing.editorial.readArticle}
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </HoverLift>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
