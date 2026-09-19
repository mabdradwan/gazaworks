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
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Al-Jalaa_street_in_Gaza_during_war_23-25.jpg/640px-Al-Jalaa_street_in_Gaza_during_war_23-25.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Gaza_skyline.jpg/640px-Gaza_skyline.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Images_of_war_23-25_from_Gaza%2C_by_Jaber_Badwen%2C_IMG_6060.jpg/640px-Images_of_war_23-25_from_Gaza%2C_by_Jaber_Badwen%2C_IMG_6060.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/WMC_Gaza_City.jpg/640px-WMC_Gaza_City.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Sunset_in_Gaza.jpg/640px-Sunset_in_Gaza.jpg",
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
    const live = items.map((article, index) => ({
      id: article.id,
      slug: article.slug,
      tag: article.published_at
        ? new Date(article.published_at).toLocaleDateString(locale, { day:"numeric", month:"short", year:"numeric" })
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
    <section className="journal-home">
      <div className="container">
        <div className="journal-home-head">
          <div>
            <span className="journal-home-kicker">{marketing.editorial.eyebrow}</span>
            <h2>{marketing.editorial.title}</h2>
            <p>{marketing.editorial.body}</p>
            <small>{sourced.updatedDaily}</small>
          </div>
          <Link className="journal-home-link" href={"/" + locale + "/blog"}>
            {marketing.editorial.readAll}
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {!ready && <div className="journal-loading-compact" aria-hidden="true"><span/><span/></div>}

        <div className="journal-square-grid">
          {visible.map((article, index) => {
            const isExpanded = expanded === article.id;
            return (
              <article key={article.id} className={`journal-square-card${isExpanded ? " expanded" : ""}`}>
                <button
                  type="button"
                  className="journal-card-toggle"
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : article.id)}
                >
                  <div className="journal-card-image">
                    <img src={article.image} alt="" loading={index < 2 ? "eager" : "lazy"} />
                    <span>{article.tag}</span>
                  </div>
                  <div className="journal-card-copy">
                    <div className="journal-card-meta">
                      <span>{article.source ?? marketing.blog.eyebrow}</span>
                      {article.sourceDate && <small>{article.sourceDate}</small>}
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <span className="journal-expand-label">
                      {isExpanded ? sourced.closeArticle : sourced.openArticle}
                      {isExpanded ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="journal-card-expanded">
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
          <button type="button" className="journal-more-button" onClick={() => setShowAll((current) => !current)}>
            {showAll ? sourced.showLess : sourced.showMore}
            {showAll ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          </button>
        )}
      </div>
    </section>
  );
}
