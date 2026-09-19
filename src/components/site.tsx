import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CirclePlay,
  Compass,
  HeartHandshake,
  Info,
  LayoutGrid,
  LogIn,
  Newspaper,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LanguageMenu } from "@/components/language-menu";
import { MobileMenu } from "@/components/mobile-menu";
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
    <header className="site-header future-header">
      <div className="container site-header-inner">
        <Link href={"/" + locale} className="brand-lockup future-brand" aria-label="GazaWorks home">
          <span className="brand-logo-frame" aria-hidden="true">
            <img src="/brand/gazaworks-mark-dark.png" alt="" className="brand-logo" />
          </span>
          <span className="brand-word">Gaza<span>Works</span></span>
        </Link>

        <nav className="desktop main-nav future-nav">
          <Link href={"/" + locale + "/talent"}>{t.nav.talent}</Link>
          <Link href={"/" + locale + "/how-it-works"}>{t.nav.work}</Link>
          <Link href={"/" + locale + "/verification"}>{t.nav.trust}</Link>
          <Link href={"/" + locale + "/blog"}>{journalLabel}</Link>
        </nav>

        <div className="header-actions">
          <LanguageMenu locale={locale} />

          {!signedIn && (
            <Link className="desktop header-login" href={"/" + locale + "/auth"}>{t.nav.login}</Link>
          )}

          <Link className="btn header-cta future-header-cta" href={signedIn ? "/" + locale + "/dashboard" : "/" + locale + "/auth?mode=register"}>
            {signedIn ? marketing.workspace : t.nav.join}
          </Link>

          <MobileMenu>
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
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const marketing = marketingCopy(locale);

  return (
    <footer className="site-footer future-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href={"/" + locale} className="brand-lockup brand-lockup-inverse future-brand">
            <span className="brand-logo-frame brand-logo-frame-footer">
              <img src="/brand/gazaworks-mark-dark.png" alt="" className="brand-logo" aria-hidden="true" />
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
      <section className="future-hero">
        <div className="future-hero-gridlines" aria-hidden="true" />
        <div className="future-orb future-orb-one" aria-hidden="true" />
        <div className="future-orb future-orb-two" aria-hidden="true" />

        <div className="container future-hero-layout">
          <Reveal className="future-visual" y={8}>
            <div className="future-photo-shell">
              <img
                src="/media/hero-gazaworks.webp"
                alt=""
                className="future-photo"
                fetchPriority="high"
                decoding="async"
                aria-hidden="true"
              />
              <div className="future-photo-overlay" aria-hidden="true" />
              <div className="future-photo-topline" aria-hidden="true"><span /><span /><span /></div>
              <div className="future-photo-chip">
                <span className="future-live-dot" />
                <strong>GAZA / WORK / GLOBAL</strong>
              </div>
            </div>
          </Reveal>

          <Reveal className="future-copy" delay={0.05} y={8}>
            <h1>{showcase.title}</h1>
            <h2>{showcase.subtitle}</h2>
            <p>{showcase.body}</p>

            <div className="future-actions">
              <Link className="future-primary" href={"/" + locale + "/auth?mode=register"}>
                {showcase.primary}
                <ArrowRight className="directional-icon" size={18} />
              </Link>
              <Link className="future-secondary" href={"/" + locale + "/how-it-works"}>
                <CirclePlay size={18} />
                {showcase.secondary}
              </Link>
            </div>

            <div className="future-stats">
              {showcase.stats.map((item, index) => (
                <div key={item.label} className="future-stat">
                  <span className="future-stat-index">0{index + 1}</span>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="reference-audience future-audience">
        <div className="container">
          <StaggerGroup className="reference-audience-grid future-audience-grid">
            {audience.items.map((item, index) => {
              const Icon = audienceIcons[index] ?? UserRound;
              return (
                <StaggerItem key={item.key}>
                  <HoverLift className="reference-audience-card future-audience-card">
                    <Link href={"/" + locale + item.href} className="reference-audience-link future-audience-link">
                      <span className="reference-audience-number">0{index + 1}</span>
                      <span className="reference-audience-icon future-audience-icon"><Icon size={25} /></span>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                      <span className="reference-audience-cta future-audience-cta">
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

      <section className="container showcase-final-wrap future-final-wrap">
        <Reveal>
          <div className="showcase-final-cta future-final-cta">
            <div className="future-final-mark" aria-hidden="true">
              <img src="/brand/gazaworks-mark-dark.png" alt="" aria-hidden="true" />
            </div>
            <div className="showcase-final-copy">
              <h2>{showcase.ctaTitle}</h2>
              <p>{showcase.ctaBody}</p>
            </div>
            <Link className="btn showcase-final-button future-final-button" href={"/" + locale + "/auth?mode=register"}>
              {showcase.ctaButton}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
