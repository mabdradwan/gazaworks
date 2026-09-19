import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  FileCheck2,
  Globe2,
  HeartHandshake,
  Info,
  Layers3,
  LayoutGrid,
  LogIn,
  Menu,
  MessagesSquare,
  Newspaper,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import {
  Float,
  HoverLift,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion-primitives";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";

export function Header({ locale, signedIn = false }: { locale: Locale; signedIn?: boolean }) {
  const t = messages(locale);
  const marketing = marketingCopy(locale);
  const journalLabel = marketing.editorial.eyebrow.split(" · ")[0];

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href={"/" + locale} className="brand-lockup" aria-label="GazaWorks home">
          <span className="brand-symbol" aria-hidden="true">G</span>
          <span>
            Gaza<span>Works</span>
          </span>
        </Link>

        <nav className="desktop main-nav">
          <Link href={"/" + locale + "/talent"}>{t.nav.talent}</Link>
          <Link href={"/" + locale + "/how-it-works"}>{t.nav.work}</Link>
          <Link href={"/" + locale + "/verification"}>{t.nav.trust}</Link>
          <Link href={"/" + locale + "/blog"}>{journalLabel}</Link>
        </nav>

        <div className="header-actions">
          <details className="desktop locale-menu">
            <summary aria-label="Change language">
              <Globe2 size={19} />
            </summary>
            <div className="card locale-popover">
              <LocaleSwitcher locale={locale} />
            </div>
          </details>

          {!signedIn && (
            <Link className="desktop header-login" href={"/" + locale + "/auth"}>
              {t.nav.login}
            </Link>
          )}

          <Link className="btn header-cta" href={signedIn ? "/" + locale + "/dashboard" : "/" + locale + "/auth?mode=register"}>
            {signedIn ? marketing.workspace : t.nav.join}
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Open navigation menu">
              <Menu size={24} />
            </summary>
            <div className="mobile-menu-panel">
              <Link href={"/" + locale + "/talent"}>
                <Compass size={18} />
                {t.nav.talent}
              </Link>
              <Link href={"/" + locale + "/how-it-works"}>
                <Info size={18} />
                {t.nav.work}
              </Link>
              <Link href={"/" + locale + "/verification"}>
                <ShieldCheck size={18} />
                {t.nav.trust}
              </Link>
              <Link href={"/" + locale + "/blog"}>
                <Newspaper size={18} />
                {journalLabel}
              </Link>
              {signedIn ? (
                <Link href={"/" + locale + "/dashboard"}>
                  <LayoutGrid size={18} />
                  {marketing.workspace}
                </Link>
              ) : (
                <>
                  <Link href={"/" + locale + "/auth?mode=register"}>
                    <Sparkles size={18} />
                    {t.nav.join}
                  </Link>
                  <Link href={"/" + locale + "/auth"}>
                    <LogIn size={18} />
                    {t.nav.login}
                  </Link>
                </>
              )}
              <hr className="menu-divider" />
              <LocaleSwitcher locale={locale} />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const marketing = marketingCopy(locale);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href={"/" + locale} className="brand-lockup brand-lockup-inverse">
            <span className="brand-symbol" aria-hidden="true">G</span>
            <span>Gaza<span>Works</span></span>
          </Link>
          <p>{marketing.footer.about}</p>
        </div>

        {marketing.footer.groups.map((group) => (
          <div key={group.title} className="footer-links">
            <strong>{group.title}</strong>
            {group.links.map((link) => (
              <Link key={link.href} href={"/" + locale + "/" + link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© 2026 GazaWorks</span>
        <span>{marketing.network.eyebrow}</span>
      </div>
    </footer>
  );
}

export function Home({ locale }: { locale: Locale }) {
  const t = messages(locale);
  const marketing = marketingCopy(locale);
  const serviceIcons = [BadgeCheck, Layers3, MessagesSquare, FileCheck2];

  return (
    <>
      <section className="hero premium-hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <div className="container hero-grid">
          <Reveal className="hero-copy">
            <span className="badge premium-badge">
              <Sparkles size={14} />
              {t.hero.eyebrow}
            </span>

            <h1>{t.hero.title}</h1>
            <p className="hero-lead">{t.hero.body}</p>

            <div className="hero-actions">
              <Link className="btn btn-large" href={"/" + locale + "/talent"}>
                {t.hero.primary}
                <ArrowRight className="directional-icon" size={18} />
              </Link>
              <Link className="btn secondary btn-large" href={"/" + locale + "/auth?mode=register"}>
                {t.nav.join}
              </Link>
            </div>

            <div className="hero-trust-row">
              {t.stats.map((item) => (
                <span key={item}>
                  <CheckCircle2 size={16} />
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12} y={28} className="hero-visual-wrap">
            <Float>
              <div className="network-shell">
                <div className="network-glow" />
                <div className="network-topline">
                  <span className="soft-label">{marketing.network.eyebrow}</span>
                  <span className="status-dot"><i /> GazaWorks</span>
                </div>

                <div className="network-profile">
                  <div className="profile-mark">GW</div>
                  <div>
                    <span className="verified-line"><BadgeCheck size={16} /> {t.nav.trust}</span>
                    <h2>{marketing.network.title}</h2>
                    <p>{marketing.network.body}</p>
                  </div>
                </div>

                <div className="network-chips">
                  {marketing.network.chips.map((chip, index) => (
                    <span key={chip}>
                      {index === 0 ? <ShieldCheck size={15} /> : index === 1 ? <BriefcaseBusiness size={15} /> : <Globe2 size={15} />}
                      {chip}
                    </span>
                  ))}
                </div>\n              </div>\n            </Float>

            <div className="floating-note floating-note-a">
              <UsersRound size={18} />
              <span>{marketing.network.chips[0]}</span>
            </div>
            <div className="floating-note floating-note-b">
              <HeartHandshake size={18} />
              <span>{marketing.network.chips[2]}</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-strip-grid">
          {t.stats.map((item, index) => (
            <Reveal key={item} delay={index * 0.06}>
              <div className="trust-point">
                <span className="trust-index">0{index + 1}</span>
                <p>{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-shell services-section">
        <div className="container">
          <Reveal className="section-heading">
            <span className="eyebrow">{marketing.services.eyebrow}</span>
            <h2>{marketing.services.title}</h2>
            <p>{marketing.services.body}</p>
          </Reveal>

          <StaggerGroup className="service-grid">
            {marketing.services.items.map((item, index) => {
              const Icon = serviceIcons[index] ?? ShieldCheck;
              return (
                <StaggerItem key={item.title}>
                  <HoverLift className="premium-card service-card">
                    <div className="service-icon"><Icon size={22} /></div>
                    <span className="card-number">0{index + 1}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      <section className="mission-section">
        <div className="container mission-grid">
          <Reveal className="mission-copy">
            <span className="eyebrow eyebrow-light">{marketing.mission.eyebrow}</span>
            <h2>{marketing.mission.title}</h2>
            <p>{marketing.mission.body}</p>
            <Link href={"/" + locale + "/why"} className="text-link-light">
              {t.sections.cta}
              <ArrowUpRight size={17} />
            </Link>
          </Reveal>

          <StaggerGroup className="mission-points">
            {marketing.mission.points.map((point, index) => (
              <StaggerItem key={point.title}>
                <div className="mission-point">
                  <span>{index === 0 ? <HeartHandshake size={21} /> : <Globe2 size={21} />}</span>
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="section-shell editorial-section">
        <div className="container">
          <Reveal className="section-heading editorial-heading">
            <div>
              <span className="eyebrow">{marketing.editorial.eyebrow}</span>
              <h2>{marketing.editorial.title}</h2>
              <p>{marketing.editorial.body}</p>
            </div>
            <Link className="btn secondary" href={"/" + locale + "/blog"}>
              {marketing.editorial.readAll}
              <ArrowUpRight size={17} />
            </Link>
          </Reveal>

          <StaggerGroup className="editorial-grid">
            {marketing.editorial.cards.map((article, index) => (
              <StaggerItem key={article.title}>
                <HoverLift className="article-card">
                  <div className={"article-art article-art-" + (index + 1)}>
                    <span>{article.tag}</span>
                    <Newspaper size={30} />
                  </div>
                  <div className="article-body">
                    <span className="article-label">{article.tag}</span>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <Link href={"/" + locale + "/blog"}>
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

      <section className="container final-cta-wrap">
        <Reveal>
          <div className="final-cta">
            <div>
              <span className="eyebrow eyebrow-light">{marketing.cta.eyebrow}</span>
              <h2>{marketing.cta.title}</h2>
              <p>{marketing.cta.body}</p>
            </div>
            <div className="final-cta-actions">
              <Link className="btn btn-on-dark" href={"/" + locale + "/talent"}>
                {marketing.cta.primary}
              </Link>
              <Link className="btn btn-ghost-light" href={"/" + locale + "/auth?mode=register"}>
                {marketing.cta.secondary}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
