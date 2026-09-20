"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { editorialSources } from "@/lib/editorial-sources";
import type { Locale } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";

type SourceMeta = {
  source_name?: string;
  source_url?: string;
  source_date?: string;
  source_image_url?: string;
  source_image_credit?: string;
};

type Article = {
  id: string;
  slug: string;
  published_at: string | null;
  translation: { title: string; excerpt?: string; body: string; seo?: SourceMeta | null } | null;
};

function sourceImagePath(url?: string) {
  return url ? "/api/source-image?url=" + encodeURIComponent(url) : "";
}

const localCovers = [
  "/media/journal-1.webp",
  "/media/journal-2.webp",
  "/media/hero-gazaworks-photo.webp",
  "/media/journal-1.webp",
  "/media/journal-2.webp",
  "/media/hero-gazaworks-photo.webp",
  "/media/journal-1.webp",
];

export function HomeJournal({ locale }: { locale: Locale }) {
  const marketing = marketingCopy(locale);
  const sourced = editorialSources(locale);
  const [items, setItems] = useState<Article[]>([]);
  const [ready, setReady] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/articles?locale=" + encodeURIComponent(locale), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as Article[];
        setItems(data.slice(0, 7));
      })
      .catch(() => undefined)
      .finally(() => setReady(true));

    return () => controller.abort();
  }, [locale]);

  const cards = useMemo(() => {
    const live = items.map((article) => {
      const seo = article.translation?.seo;
      const matched = sourced.items.find((item) => item.sourceUrl === seo?.source_url);
      return {
        id: article.id,
        slug: article.slug,
        tag: article.published_at
          ? new Date(article.published_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
          : marketing.editorial.eyebrow.split(" · ")[0],
        title: article.translation?.title ?? article.slug,
        excerpt: article.translation?.excerpt ?? article.translation?.body?.replace(/\s+/g, " ").slice(0, 190) ?? "",
        detail: article.translation?.body ?? article.translation?.excerpt ?? "",
        source: seo?.source_name ?? matched?.source,
        sourceUrl: seo?.source_url ?? matched?.sourceUrl,
        sourceDate: seo?.source_date ?? matched?.sourceDate,
        imageUrl: seo?.source_image_url ?? matched?.imageUrl,
        imageCredit: seo?.source_image_credit ?? matched?.imageCredit,
        live: true,
      };
    });

    const missing = Math.max(0, 7 - live.length);
    const fallback = sourced.items.slice(0, missing).map((article, index) => ({
      id: "fallback-" + index,
      slug: "",
      ...article,
      live: false,
    }));

    return [...live, ...fallback].slice(0, 7);
  }, [items, locale, marketing, sourced.items]);

  const visible = showAll ? cards : cards.slice(0, 2);

  return (
    <section className="journal-home future-journal">
      <div className="container">
        <div className="journal-home-head future-journal-head">
          <div>
            <span className="journal-home-kicker">{marketing.editorial.eyebrow}</span>
            <h2>{marketing.editorial.title}</h2>
            <p>{marketing.editorial.body}</p>
            <small>{sourced.updatedDaily}</small>
          </div>
          <Link className="journal-home-link future-journal-link" href={"/" + locale + "/blog"}>
            {marketing.editorial.readAll}
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {!ready && <div className="journal-loading-compact" aria-hidden="true"><span /><span /></div>}

        <div className="journal-square-grid future-journal-grid">
          {visible.map((article, index) => {
            const isExpanded = expanded === article.id;
            const localCover = localCovers[index % localCovers.length];
            const imageSrc =
              index < 2 || !article.imageUrl
                ? localCover
                : sourceImagePath(article.imageUrl);
            return (
              <article key={article.id} className={`journal-square-card future-story-card${isExpanded ? " expanded" : ""}`}>
                <button
                  type="button"
                  className="journal-card-toggle"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : article.id)}
                >
                  <div className="journal-card-image future-story-image">
                    <img
                      src={imageSrc}
                      alt=""
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      onError={(event) => {
                        if (!event.currentTarget.src.endsWith(localCover)) {
                          event.currentTarget.src = localCover;
                        }
                      }}
                    />
                    <div className="future-story-shade" aria-hidden="true" />
                    <span>{article.tag}</span>
                    <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
                    {article.imageCredit && <small className="story-image-credit">{article.imageCredit}</small>}
                  </div>

                  <div className="journal-card-copy future-story-copy">
                    <div className="journal-card-meta">
                      <span>{article.source ?? marketing.blog.eyebrow}</span>
                      {article.sourceDate && <small>{article.sourceDate}</small>}
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <span className="journal-expand-label future-expand-label">
                      {isExpanded ? sourced.closeArticle : sourced.openArticle}
                      {isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="journal-card-expanded future-story-expanded">
                    <p>{article.detail}</p>
                    <div className="journal-card-actions">
                      {article.live && article.slug && (
                        <Link href={"/" + locale + "/blog/" + article.slug}>
                          {marketing.editorial.readArticle}
                          <ArrowUpRight size={16} />
                        </Link>
                      )}
                      {article.sourceUrl && (
                        <a href={article.sourceUrl} target="_blank" rel="noreferrer">
                          {sourced.sourceCta}
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {cards.length > 2 && (
          <div className="future-journal-more-wrap">
            <span className="future-journal-more-line" aria-hidden="true" />
            <button
              type="button"
              className="journal-more-button future-journal-more"
              onClick={() => setShowAll((current) => !current)}
              aria-expanded={showAll}
            >
              {showAll ? sourced.showLess : sourced.showMore}
              {showAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <span className="future-journal-more-line" aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
}
