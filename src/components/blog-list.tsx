"use client";

import { useEffect, useState } from "react";
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
    void fetch("/api/articles?locale=" + encodeURIComponent(safeLocale))
      .then(async (response) => {
        if (response.ok) setItems(await response.json());
      })
      .finally(() => setLoading(false));
  }, [safeLocale]);

  if (loading) return <div className="empty">{ui.loading}</div>;

  if (!items.length) {
    return (
      <div className="blog-grid">
        {marketing.editorial.cards.map((article) => (
          <article className="blog-card" key={article.title}>
            <span className="badge">{article.tag}</span>
            <h2>{article.title}</h2>
            <p className="muted">{article.excerpt}</p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="blog-grid">
      {items.map((article) => (
        <article className="blog-card" key={article.id}>
          <span className="badge">
            {article.published_at
              ? new Date(article.published_at).toLocaleDateString(safeLocale)
              : "GazaWorks"}
          </span>
          <h2>{article.translation?.title ?? article.slug}</h2>
          <p className="muted">
            {article.translation?.excerpt ?? article.translation?.body?.slice(0, 240)}
          </p>
        </article>
      ))}
    </div>
  );
}
