import Link from "next/link";
import { Reveal, StaggerGroup, StaggerItem, HoverLift } from "@/components/motion-primitives";

export function PublicPage({
  title,
  description,
  locale,
}: {
  title: string;
  description: string;
  locale: string;
}) {
  return (
    <>
      <section style={{ padding: "72px 0", background: "var(--sand)" }}>
        <div className="container">
          <Reveal>
            <span className="badge">GazaWorks</span>
            <h1 style={{ fontSize: 50, letterSpacing: "-.04em", maxWidth: 760 }}>{title}</h1>
            <p className="muted" style={{ fontSize: 19, maxWidth: 700, lineHeight: 1.7 }}>
              {description}
            </p>
          </Reveal>
        </div>
      </section>
      <section className="container" style={{ padding: "60px 0" }}>
        <StaggerGroup
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}
        >
          {["Professional standards", "Verified participation", "Secure collaboration"].map(
            (x) => (
              <StaggerItem key={x}>
                <HoverLift className="card" style={{ height: "100%" }}>
                  <h2>{x}</h2>
                  <p className="muted">
                    GazaWorks provides a transparent and accountable environment designed for
                    sustained professional relationships.
                  </p>
                </HoverLift>
              </StaggerItem>
            ),
          )}
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
            <h2>Ready to work together?</h2>
            <Link
              className="btn"
              style={{ background: "white", color: "var(--brand)" }}
              href={`/${locale}/auth?mode=register`}
            >
              Join GazaWorks
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
