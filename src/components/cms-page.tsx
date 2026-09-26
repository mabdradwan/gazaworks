import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Reveal, HoverLift } from "@/components/motion-primitives";
import { isLocale, messages } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";

export async function CmsPage({
  slug,
  locale,
  fallbackTitle,
  fallbackDescription,
}: {
  slug: string;
  locale: string;
  fallbackTitle: string;
  fallbackDescription: string;
}) {
  const db = await supabaseServer();
  const { data: page } = await db
    .from("site_pages")
    .select("id,status,site_translations(locale,title,content)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const translations = (page?.site_translations ?? []) as {
    locale: string;
    title: string;
    content: { body?: string };
  }[];
  const tr = translations.find((x) => x.locale === locale) ?? translations.find((x) => x.locale === "en");
  const title = tr?.title ?? fallbackTitle;
  const body = tr?.content?.body ?? fallbackDescription;
  const safeLocale = isLocale(locale) ? locale : "en";
  const marketing = marketingCopy(safeLocale);
  const t = messages(safeLocale);

  return (
    <>
      <section style={{ padding: "72px 0", background: "var(--sand)" }}>
        <div className="container">
          <Reveal immediate>
            <span className="badge">GazaWorks</span>
            <h1 style={{ fontSize: 50, letterSpacing: "-.04em", maxWidth: 760 }}>{title}</h1>
            <p
              className="muted"
              style={{ fontSize: 19, maxWidth: 760, lineHeight: 1.7, whiteSpace: "pre-wrap" }}
            >
              {body}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container" style={{ padding: "60px 0" }}>
        <Reveal>
          <HoverLift className="card">
            <span className="eyebrow">{marketing.services.eyebrow}</span>
            <h2>{marketing.services.title}</h2>
            <p className="muted">{marketing.services.body}</p>
          </HoverLift>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="card"
            style={{
              marginTop: 40,
              background: "var(--brand)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="eyebrow eyebrow-light">{marketing.cta.eyebrow}</span>
              <h2>{marketing.cta.title}</h2>
            </div>
            <Link
              className="btn"
              style={{ background: "white", color: "var(--brand)" }}
              href={"/" + safeLocale + "/auth?mode=register"}
            >
              {t.nav.join}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
