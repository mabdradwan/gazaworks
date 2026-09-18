import Link from "next/link";
import type {ReactNode} from "react";
import {adminCopy,adminModules,type AdminModule} from "@/lib/admin-copy";
export function Dashboard({locale,module,children}:{locale:string;module:AdminModule;children:ReactNode}){
 const c=adminCopy(locale);
 const links=adminModules.map(item=><Link key={item} href={`/${locale}/admin?module=${encodeURIComponent(item)}`} aria-current={module===item?"page":undefined}>{c.labels[item]}</Link>);
 return <div className="workspace-layout" dir={locale==="ar"?"rtl":"ltr"}>
  <aside className="workspace-sidebar">
   <div className="workspace-identity"><strong>{c.title}</strong><Link className="muted" href={`/${locale}/dashboard`}>{c.workspace}</Link></div>
   <nav className="workspace-nav" aria-label={c.navigation}>{links}</nav>
  </aside>
  <div className="workspace-main">
   <details className="workspace-mobile-menu" key={module}><summary>{c.navigation}</summary><nav className="workspace-mobile-panel admin-mobile-panel" aria-label={c.navigation}>{links}<Link href={`/${locale}/dashboard`}>{c.workspace}</Link></nav></details>
   <section className="workspace-page"><header className="page-heading"><p className="muted">{c.title}</p><h1>{c.labels[module]}</h1></header>{children}</section>
  </div>
 </div>;
}
