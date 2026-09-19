"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

const covers = [
  "/media/hero-gazaworks.webp",
  "https://d2g8igdw686xgo.cloudfront.net/93182425_1757552511335388_r.jpeg",
  "https://cloudfront-eu-central-1.images.arcpublishing.com/thenational/U7XSX6KOZBDPXK4E7NKKLF4VQ4.jpg",
  "https://ultrapal.ultrasawt.com/sites/ultrapal.ultrasawt.com/files/2024-10/%D8%A7%D9%84%D8%B9%D9%85%D9%84%20%D9%85%D9%86%20%D8%A7%D9%84%D8%B4%D8%A7%D8%B1%D8%B9%20%D9%81%D9%8A%20%D8%BA%D8%B2%D8%A9.jpg",
  "https://www.aljazeera.net/wp-content/uploads/2025/03/6-1741883622.jpeg?resize=770%2C513&quality=80",
  "https://ortadoguhabercom.teimg.com/crop/1280x720/ortadoguhaber-com/uploads/2024/07/ortadoguhaber-4527.jpg",
  "https://d2g8igdw686xgo.cloudfront.net/93182425_1757552511335388_r.jpeg",
];

function imageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (!image.src.endsWith("/media/hero-gazaworks.webp")) {
    image.src = "/media/hero-gazaworks.webp";
  }
}

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
    const live = items.map((article, index) => ({
      id: article.id,
      slug: article.slug,
      tag: article.published_at
        ? new Date(article.published_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
        : marketing.editorial.eyebrow.split(" · ")[0],
      title: article.translation?.title ?? article.slug,
      excerpt: article.translation?.excerpt ?? article.translation?.body?.replace(/\s+/g, " ").slice(0, 190) ?? "",
      detail: article.translation?.body ?? article.translation?.excerpt ?? "",
      source: article.translation?.seo?.source_name,
      sourceUrl: article.translation?.seo?.source_url,
      sourceDate: article.translation?.seo?.source_date,
      live: true,
      image: covers[index % covers.length],
    }));

    const missing = Math.max(0, 7 - live.length);
    const fallback = sourced.items.slice(0, missing).map((article, index) => ({
      id: "fallback-" + index,
      slug: "",
      ...article,
      live: false,
      image: covers[(live.length + index) % covers.length],
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

        {!ready && <div className="journal-loading-compact" aria-hidden="true"><span/><span/></div>}

        <div className="journal-square-grid future-journal-grid">
          {visible.map((article, index) => {
            const isExpanded = expanded === article.id;
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
                      src={article.image}
                      alt=""
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={imageFallback}
                    />
                    <div className="future-story-shade" aria-hidden="true" />
                    <span>{article.tag}</span>
                    <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
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
                      {isExpanded ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}
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
                          <ArrowUpRight size={16}/>
                        </Link>
                      )}
                      {article.sourceUrl && (
                        <a href={article.sourceUrl} target="_blank" rel="noreferrer">
                          {sourced.sourceCta}
                          <ExternalLink size={16}/>
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
            <button type="button" className="journal-more-button future-journal-more" onClick={() => setShowAll((current) => !current)}>
              {showAll ? sourced.showLess : sourced.showMore}
              {showAll ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            </button>
            <span className="future-journal-more-line" aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
}
