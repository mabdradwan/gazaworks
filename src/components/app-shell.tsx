import Link from "next/link";
import { Bell } from "lucide-react";
import { NavigationDisclosure } from "@/components/navigation-disclosure";
import { adminCopy } from "@/lib/admin-copy";
import {adminGroups,adminNavigationCopy} from "@/lib/admin-navigation";
const userRoutes:Record<string,string>={"Overview":"","Profile":"profile","Portfolio":"portfolio","Saved Talent":"favorites","Work Requests":"work-requests","Offers":"offers","Projects":"projects","Messages":"messages","Appointments":"appointments","Payments":"payments","Disputes":"disputes","Reviews":"reviews","AI CV Builder":"cv-builder","Notifications":"notifications"};
export function Dashboard({ locale, adminMode = false, activeModule = "Overview", children }: { locale: string; adminMode?: boolean; activeModule?: string; children?: React.ReactNode }) {
  const copy = adminCopy(locale);
  const navigation=adminNavigationCopy(locale);
  const links = adminMode ? adminGroups.map(group=><section className="admin-nav-group" key={group.key}><h2>{navigation.groups[group.key]}</h2>{group.modules.map(item=><Link className="admin-nav-link" aria-current={item===activeModule?'page':undefined} key={item} href={`/${locale}/admin?module=${encodeURIComponent(item)}`}>{item==='Users'?navigation.all:copy.label(item)}</Link>)}</section>) : Object.keys(userRoutes).map(item=><Link className="admin-nav-link" key={item} href={`/${locale}/dashboard/${userRoutes[item]??''}`}>{item}</Link>);
  return <div className="admin-layout">
    <aside className="admin-sidebar"><strong>{adminMode ? copy.menu : "Workspace"}</strong><nav aria-label={copy.menu}>{links}</nav></aside>
    <section className="admin-main">
      <NavigationDisclosure className="admin-mobile-nav" label={copy.menu} summary={adminMode?`${copy.menu} · ${copy.label(activeModule)}`:copy.menu}>
        <nav aria-label={copy.menu}>{links}</nav>
      </NavigationDisclosure>
      <div className="admin-heading"><div><span className="badge">{adminMode ? copy.badge : "Professional workspace"}</span><h1>{adminMode ? copy.title : "GazaWorks workspace"}</h1><p className="muted">{adminMode ? copy.intro : "Manage your profile, projects and messages."}</p></div><Bell/></div>
      <div className="card admin-operations"><h2>{adminMode ? copy.operations : "Secure workflow"}</h2><p className="muted">{adminMode ? copy.operationsBody : "Keep project communication and delivery inside GazaWorks."}</p></div>
      {children}
    </section>
  </div>;
}
