import Link from "next/link"; import {LocaleSwitcher} from "@/components/locale-switcher"; import {Globe2,ShieldCheck,Menu,ArrowRight,CheckCircle2,BriefcaseBusiness} from "lucide-react"; import type {Locale} from "@/lib/i18n"; import {messages} from "@/lib/i18n";
import { Reveal, StaggerGroup, StaggerItem, HoverLift, Float, CountUp } from "@/components/motion-primitives";
export function Header({locale,signedIn=false}:{locale:Locale;signedIn?:boolean}){const t=messages(locale);return <header style={{borderBottom:"1px solid var(--line)",position:"sticky",top:0,zIndex:20,background:"#ffffffee",backdropFilter:"blur(10px)"}}><div className="container" style={{height:72,display:"flex",alignItems:"center",justifyContent:"space-between"}}><Link href={`/${locale}`} style={{fontSize:22,fontWeight:900,letterSpacing:"-.04em",color:"var(--brand)"}}>Gaza<span style={{color:"var(--ink)"}}>Works</span></Link><nav className="desktop" style={{display:"flex",gap:26,fontWeight:600,fontSize:14}}><Link href={`/${locale}/talent`}>{t.nav.talent}</Link><Link href={`/${locale}/how-it-works`}>{t.nav.work}</Link><Link href={`/${locale}/verification`}>{t.nav.trust}</Link></nav><div style={{display:"flex",gap:10,alignItems:"center"}}><details className="desktop" style={{position:"relative"}}><summary style={{listStyle:"none",cursor:"pointer"}}><Globe2 size={19}/></summary><div className="card" style={{position:"absolute",insetInlineEnd:0,top:30,display:"grid",minWidth:150}}><LocaleSwitcher locale={locale}/></div></details>{!signedIn&&<Link className="desktop" href={`/${locale}/auth`}>{t.nav.login}</Link>}<Link className="btn" href={signedIn?`/${locale}/dashboard`:`/${locale}/auth?mode=register`}>{signedIn?(locale==="ar"?"مساحة العمل":"Workspace"):t.nav.join}</Link><details className="mobile-menu"><summary aria-label="Open navigation menu"><Menu size={24}/></summary><div className="mobile-menu-panel"><Link href={`/${locale}/talent`}>{t.nav.talent}</Link><Link href={`/${locale}/how-it-works`}>{t.nav.work}</Link><Link href={`/${locale}/verification`}>{t.nav.trust}</Link>{signedIn?<Link href={`/${locale}/dashboard`}>{locale==="ar"?"مساحة العمل":"Workspace"}</Link>:<Link href={`/${locale}/auth`}>{t.nav.login}</Link>}<LocaleSwitcher locale={locale} className="mobile-languages"/></div></details></div></div></header>}
export function Footer({locale}:{locale:Locale}){const t=messages(locale);return <footer style={{background:"#0b241c",color:"white",padding:"48px 0"}}><div className="container grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}><div><strong style={{fontSize:22}}>GazaWorks</strong><p style={{color:"#b9c9c3"}}>{t.footer}</p></div>{[["Company","about","why","contact"],["Marketplace","talent","hire","join-talent"],["Trust","verification","terms","privacy"]].map(([h,...items])=><div key={h}><strong>{h}</strong>{items.map(x=><Link style={{display:"block",marginTop:10,color:"#b9c9c3"}} key={x} href={`/${locale}/${x}`}>{x.replaceAll("-"," ")}</Link>)}</div>)}</div></footer>}
export function Home({ locale }: { locale: Locale }) {
  const t = messages(locale);

  return (
    <>
      <section
        className="hero"
        style={{
          background:
            "radial-gradient(circle at 80% 20%,#d9eee4,transparent 34%),var(--sand)",
          padding: "88px 0 72px",
        }}
      >
        <div
          className="container grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            alignItems: "center",
            gap: 50,
          }}
        >
          <Reveal>
            <span className="badge">
              <ShieldCheck size={15} />
              {t.hero.eyebrow}
            </span>
            <h1
              style={{
                fontSize: 64,
                lineHeight: 1.03,
                letterSpacing: "-.05em",
                margin: "24px 0",
              }}
            >
              {t.hero.title}
            </h1>
            <p className="muted" style={{ fontSize: 19, lineHeight: 1.65, maxWidth: 650 }}>
              {t.hero.body}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
              <Link className="btn" href={`/${locale}/talent`}>
                {t.hero.primary}
                <ArrowRight size={18} />
              </Link>
              <Link className="btn secondary" href={`/${locale}/dashboard/work-requests`}>
                {t.hero.secondary}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15} y={26}>
            <Float>
              <HoverLift
                className="card"
                style={{ padding: 28, boxShadow: "0 24px 80px #0e5c4322" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="badge">Verified team</span>
                  <BriefcaseBusiness color="var(--brand)" />
                </div>
                <h2>Digital product specialists</h2>
                <p className="muted">Product design · Web engineering · Brand systems</p>
                <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginTop: 30 }}>
                  <Metric n="8+" label="years" />
                  <Metric n="42" label="projects" />
                  <Metric n="4.9" label="rating" />
                </div>
              </HoverLift>
            </Float>
          </Reveal>
        </div>
      </section>

      <section className="container" style={{ padding: "55px 0" }}>
        <StaggerGroup
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}
        >
          {t.stats.map((x) => (
            <StaggerItem key={x} style={{ display: "flex", gap: 12, fontWeight: 700 }}>
              <CheckCircle2 color="var(--brand)" />
              {x}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section style={{ background: "#f4f7f5", padding: "70px 0" }}>
        <div className="container">
          <Reveal>
            <span className="badge">GazaWorks standard</span>
            <h2 style={{ fontSize: 40 }}>{t.sections.services}</h2>
          </Reveal>
          <StaggerGroup
            className="grid"
            style={{ gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}
          >
            {[
              "Human verification",
              "Private marketplace",
              "Structured agreements",
              "Protected workflow",
            ].map((x, i) => (
              <StaggerItem key={x}>
                <HoverLift className="card" style={{ height: "100%" }}>
                  <b style={{ color: "var(--brand)" }}>0{i + 1}</b>
                  <h3>{x}</h3>
                  <p className="muted">
                    Clear accountability, secure records, and professional standards from
                    introduction through delivery.
                  </p>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}
function Metric({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <strong style={{ fontSize: 24 }}>
        <CountUp value={n} />
      </strong>
      <div className="muted">{label}</div>
    </div>
  );
}
