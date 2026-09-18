import Link from "next/link";
import { Reveal, StaggerGroup, StaggerItem, HoverLift } from "@/components/motion-primitives";
import { messages, type Locale } from "@/lib/i18n";

export type MarketingPageKey = "hire" | "joinTalent" | "joinTeam" | "why" | "verification" | "contact";

export function PublicPage({ page, locale }: { page: MarketingPageKey; locale: Locale }) {
  const t = messages(locale);
  const copy = t.pages[page];
  const isContact = page === "contact";

  return (
    <>
      <section style={{ padding: "72px 0", background: "var(--sand)" }}>
        <div className="container">
          <Reveal>
            <span className="badge">GazaWorks</span>
            <h1 style={{ fontSize: 50, letterSpacing: "-.04em", maxWidth: 760 }}>{copy.title}</h1>
            <p className="muted" style={{ fontSize: 19, maxWidth: 700, lineHeight: 1.7 }}>
              {copy.description}
            </p>
          </Reveal>
        </div>
      </section>
      <section className="container" style={{ padding: "60px 0" }}>
        <StaggerGroup
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}
        >
          {copy.features.map((feature) => (
            <StaggerItem key={feature.title}>
              <HoverLift className="card" style={{ height: "100%" }}>
                <h2>{feature.title}</h2>
                <p className="muted">{feature.body}</p>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerGroup>
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
              flexWrap: "wrap",
            }}
          >
            <h2>{copy.cta}</h2>
            <Link
              className="btn"
              style={{ background: "white", color: "var(--brand)" }}
              href={isContact ? `/${locale}/auth` : `/${locale}/auth?mode=register`}
            >
              {isContact ? t.nav.login : t.nav.join}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
