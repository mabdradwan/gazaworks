import Link from "next/link";
import { Bell } from "lucide-react";
import { NavigationDisclosure } from "@/components/navigation-disclosure";
import { adminCopy } from "@/lib/admin-copy";
const admin=["Overview","Users","Individuals","Teams","Clients","Verification","Appointments","Work Requests","Offers","Projects","Messages","Message Moderation","Transactions","Payments","Payouts","Disputes","Appeals","Reviews","Notifications","Blog","Static Pages","Media","Categories","Skills","Languages","Email Templates","AI Settings","Payment Settings","System Settings","Security Logs","Audit Logs","Roles"];
const userRoutes:Record<string,string>={"Overview":"","Profile":"profile","Portfolio":"portfolio","Saved Talent":"favorites","Work Requests":"work-requests","Offers":"offers","Projects":"projects","Messages":"messages","Appointments":"appointments","Payments":"payments","Disputes":"disputes","Reviews":"reviews","AI CV Builder":"cv-builder","Notifications":"notifications"};
export function Dashboard({ locale, adminMode = false, children }: { locale: string; adminMode?: boolean; children?: React.ReactNode }) {
  const copy = adminCopy(locale);
  const items = adminMode ? admin : Object.keys(userRoutes);
  const links = items.map((item) => (
    <Link className="admin-nav-link" key={item} href={adminMode ? `/${locale}/admin?module=${encodeURIComponent(item)}` : `/${locale}/dashboard/${userRoutes[item] ?? ""}`}>
      {adminMode ? copy.label(item) : item}
    </Link>
  ));
  return <div className="admin-layout">
    <aside className="admin-sidebar"><strong>{adminMode ? copy.menu : "Workspace"}</strong><nav aria-label={copy.menu}>{links}</nav></aside>
    <section className="admin-main">
      <NavigationDisclosure className="admin-mobile-nav" label={copy.menu} summary={copy.menu}>
        <nav aria-label={copy.menu}>{links}</nav>
      </NavigationDisclosure>
      <div className="admin-heading"><div><span className="badge">{adminMode ? copy.badge : "Professional workspace"}</span><h1>{adminMode ? copy.title : "GazaWorks workspace"}</h1><p className="muted">{adminMode ? copy.intro : "Manage your profile, projects and messages."}</p></div><Bell/></div>
      <div className="card admin-operations"><h2>{adminMode ? copy.operations : "Secure workflow"}</h2><p className="muted">{adminMode ? copy.operationsBody : "Keep project communication and delivery inside GazaWorks."}</p></div>
      {children}
    </section>
  </div>;
}
