"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HoverLift, StaggerGroup, StaggerItem } from "@/components/motion-primitives";
import { editorialSources } from "@/lib/editorial-sources";
import { marketingCopy } from "@/lib/marketing-copy";
import { isLocale } from "@/lib/i18n";

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

export function BlogList({ locale }: { locale: string }) {
  const safeLocale = isLocale(locale) ? locale : "en";
  const marketing = marketingCopy(safeLocale);
  const sourced = editorialSources(safeLocale);
  const ui = marketing.blog;
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/articles?locale=" + encodeURIComponent(safeLocale), { signal: controller.signal })
      .then(async (response) => {
        if (response.ok) setItems(await response.json());
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [safeLocale]);

  const cards = useMemo(() => {
    if (!items.length) {
      return sourced.items.map((article, index) => ({
        id: "source-" + index,
        slug: "",
        title: article.title,
        excerpt: article.excerpt,
        tag: article.tag,
        source: article.source,
        sourceDate: article.sourceDate,
        sourceUrl: article.sourceUrl,
        imageUrl: article.imageUrl,
        imageCredit: article.imageCredit,
        live: false,
      }));
    }

    return items.map((article) => {
      const seo = article.translation?.seo;
      const matched = sourced.items.find((item) => item.sourceUrl === seo?.source_url);
      return {
        id: article.id,
        slug: article.slug,
        title: article.translation?.title ?? article.slug,
        excerpt: article.translation?.excerpt ?? article.translation?.body?.replace(/\s+/g, " ").slice(0, 220) ?? "",
        tag: article.published_at
          ? new Date(article.published_at).toLocaleDateString(safeLocale, { day: "numeric", month: "short", year: "numeric" })
          : marketing.blog.eyebrow,
        source: seo?.source_name ?? matched?.source,
        sourceDate: seo?.source_date ?? matched?.sourceDate,
        sourceUrl: seo?.source_url ?? matched?.sourceUrl,
        imageUrl: seo?.source_image_url ?? matched?.imageUrl,
        imageCredit: seo?.source_image_credit ?? matched?.imageCredit,
        live: true,
      };
    });
  }, [items, marketing.blog.eyebrow, safeLocale, sourced.items]);

  if (loading) {
    return <div className="journal-loading journal-loading-page" aria-label={ui.loading}><span /><span /><span /></div>;
  }

  return (
    <StaggerGroup className="blog-grid sourced-blog-grid">
      {cards.map((article) => (
        <StaggerItem key={article.id}>
          <HoverLift className="blog-card blog-card-premium sourced-blog-card">
            {article.live && article.slug ? (
              <Link className="blog-card-link" href={"/" + safeLocale + "/blog/" + article.slug}>
                <BlogCardVisual article={article} />
              </Link>
            ) : (
              <div className="blog-card-link">
                <BlogCardVisual article={article} />
                {article.sourceUrl && (
                  <a className="blog-card-read" href={article.sourceUrl} target="_blank" rel="noreferrer">
                    {sourced.sourceCta}
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            )}
          </HoverLift>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function BlogCardVisual({
  article,
}: {
  article: {
    title: string;
    excerpt: string;
    tag: string;
    source?: string;
    sourceDate?: string;
    imageUrl?: string;
    imageCredit?: string;
  };
}) {
  return (
    <>
      <div className="blog-card-art sourced-blog-art">
        {article.imageUrl && (
          <img
            src={sourceImagePath(article.imageUrl)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.parentElement?.classList.add("source-image-error");
            }}
          />
        )}
        <span>{article.tag}</span>
        {article.imageCredit && <small>{article.imageCredit}</small>}
      </div>
      <div className="blog-card-content">
        <div className="journal-card-meta">
          <span>{article.source}</span>
          <small>{article.sourceDate}</small>
        </div>
        <h2>{article.title}</h2>
        <p className="muted">{article.excerpt}</p>
        <span className="blog-card-read">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </>
  );
}
