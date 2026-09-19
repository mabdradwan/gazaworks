import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  CirclePlay,
  Compass,
  HeartHandshake,
  Info,
  LayoutGrid,
  LogIn,
  Menu,
  Newspaper,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { LocaleSwitcher, localeFlag, localeNativeName } from "@/components/locale-switcher";
import { HomeJournal } from "@/components/home-journal";
import { HoverLift, Reveal, StaggerGroup, StaggerItem } from "@/components/motion-primitives";
import { audienceCopy } from "@/lib/audience-copy";
import { homeShowcaseCopy } from "@/lib/home-showcase-copy";
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
          <span className="brand-logo-frame">
            <img src="/brand/gazaworks-logo.png" alt="" className="brand-logo" aria-hidden="true" />
          </span>
          <span className="brand-word">Gaza<span>Works</span></span>
        </Link>

        <nav className="desktop main-nav">
          <Link href={"/" + locale + "/talent"}>{t.nav.talent}</Link>
          <Link href={"/" + locale + "/how-it-works"}>{t.nav.work}</Link>
          <Link href={"/" + locale + "/verification"}>{t.nav.trust}</Link>
          <Link href={"/" + locale + "/blog"}>{journalLabel}</Link>
        </nav>

        <div className="header-actions">
          <details className="desktop locale-menu">
            <summary className="language-trigger" aria-label="Change language">
              <span className="language-flag" aria-hidden="true">{localeFlag[locale]}</span>
              <span>{localeNativeName[locale]}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </summary>
            <div className="card locale-popover"><LocaleSwitcher locale={locale} /></div>
          </details>

          {!signedIn && (
            <Link className="desktop header-login" href={"/" + locale + "/auth"}>{t.nav.login}</Link>
          )}

          <Link className="btn header-cta" href={signedIn ? "/" + locale + "/dashboard" : "/" + locale + "/auth?mode=register"}>
            {signedIn ? marketing.workspace : t.nav.join}
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Open navigation menu"><Menu size={24} /></summary>
            <div className="mobile-menu-panel">
              <Link href={"/" + locale + "/talent"}><Compass size={18} />{t.nav.talent}</Link>
              <Link href={"/" + locale + "/how-it-works"}><Info size={18} />{t.nav.work}</Link>
              <Link href={"/" + locale + "/verification"}><ShieldCheck size={18} />{t.nav.trust}</Link>
              <Link href={"/" + locale + "/blog"}><Newspaper size={18} />{journalLabel}</Link>
              {signedIn ? (
                <Link href={"/" + locale + "/dashboard"}><LayoutGrid size={18} />{marketing.workspace}</Link>
              ) : (
                <>
                  <Link href={"/" + locale + "/auth?mode=register"}><Sparkles size={18} />{t.nav.join}</Link>
                  <Link href={"/" + locale + "/auth"}><LogIn size={18} />{t.nav.login}</Link>
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
            <span className="brand-logo-frame brand-logo-frame-footer">
              <img src="/brand/gazaworks-logo.png" alt="" className="brand-logo" aria-hidden="true" />
            </span>
            <span className="brand-word">Gaza<span>Works</span></span>
          </Link>
          <p>{marketing.footer.about}</p>
        </div>

        {marketing.footer.groups.map((group) => (
          <div key={group.title} className="footer-links">
            <strong>{group.title}</strong>
            {group.links.map((link) => (
              <Link key={link.href} href={"/" + locale + "/" + link.href}>{link.label}</Link>
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
  const showcase = homeShowcaseCopy(locale);
  const audience = audienceCopy(locale);
  const audienceIcons = [UserRound, UsersRound, BriefcaseBusiness, HeartHandshake];

  return (
    <>
      <section className="signature-hero">
        <div className="container signature-hero-grid">
          <Reveal className="signature-visual" y={10}>
            <div className="signature-image-frame">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/8d/WMC_Gaza_City.jpg"
                alt=""
                fetchPriority="high"
                decoding="async"
                aria-hidden="true"
              />
              <span className="signature-image-index">GZ / 01</span>
              <span className="signature-image-line" />
            </div>
          </Reveal>

          <Reveal className="signature-copy" delay={0.06} y={10}>
            <span className="signature-kicker">{showcase.eyebrow}</span>
            <h1>{showcase.title}</h1>
            <h2>{showcase.subtitle}</h2>
            <p>{showcase.body}</p>

            <div className="signature-actions">
              <Link className="signature-primary" href={"/" + locale + "/auth?mode=register"}>
                {showcase.primary}
                <ArrowRight className="directional-icon" size={18} />
              </Link>
              <Link className="signature-secondary" href={"/" + locale + "/how-it-works"}>
                <CirclePlay size={18} />
                {showcase.secondary}
              </Link>
            </div>

            <div className="signature-stats">
              {showcase.stats.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="reference-audience">
        <div className="container">
          <StaggerGroup className="reference-audience-grid">
            {audience.items.map((item, index) => {
              const Icon = audienceIcons[index] ?? UserRound;
              return (
                <StaggerItem key={item.key}>
                  <HoverLift className="reference-audience-card">
                    <Link href={"/" + locale + item.href} className="reference-audience-link">
                      <span className="reference-audience-icon"><Icon size={26} /></span>
                      <span className="reference-audience-number">0{index + 1}</span>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                      <span className="reference-audience-cta">
                        {item.cta}
                        <ArrowUpRight size={17} />
                      </span>
                    </Link>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      <HomeJournal locale={locale} />

      <section className="container showcase-final-wrap">
        <Reveal>
          <div className="showcase-final-cta">
            <div className="showcase-community" aria-hidden="true">
              <span>GW</span><span>01</span><span>02</span><span>03</span>
            </div>
            <div className="showcase-final-copy">
              <h2>{showcase.ctaTitle}</h2>
              <p>{showcase.ctaBody}</p>
            </div>
            <Link className="btn showcase-final-button" href={"/" + locale + "/auth?mode=register"}>
              {showcase.ctaButton}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
