import Link from "next/link";import {Bell} from "lucide-react";
const admin=["Overview","Users","Individuals","Teams","Clients","Verification","Appointments","Work Requests","Offers","Projects","Messages","Message Moderation","Transactions","Payments","Payouts","Disputes","Appeals","Reviews","Notifications","Blog","Static Pages","Media","Categories","Skills","Languages","Email Templates","AI Settings","Payment Settings","System Settings","Security Logs","Audit Logs"];
const userRoutes:Record<string,string>={"Overview":"","Profile":"profile","Portfolio":"portfolio","Work Requests":"work-requests","Offers":"offers","Projects":"projects","Messages":"messages","Appointments":"appointments","Payments":"payments","Disputes":"disputes","Reviews":"reviews","AI CV Builder":"cv-builder","Notifications":"notifications"};
export function Dashboard({locale,adminMode=false}:{locale:string;adminMode?:boolean}){
  const items=adminMode?admin:Object.keys(userRoutes);
  return <div style={{display:"grid",gridTemplateColumns:"minmax(210px,260px) 1fr",minHeight:"75vh"}}>
    <aside className="desktop" style={{padding:24,borderInlineEnd:"1px solid var(--line)",background:"#f8faf9"}}><strong>{adminMode?"Administration":"Workspace"}</strong><nav style={{display:"grid",gap:5,marginTop:20}}>{items.map(x=><Link className="muted" style={{padding:"8px 4px",fontSize:14}} key={x} href={adminMode?`/${locale}/admin?module=${encodeURIComponent(x)}`:`/${locale}/dashboard/${userRoutes[x]??""}`}>{x}</Link>)}</nav></aside>
    <section style={{padding:"32px clamp(16px,4vw,48px)",overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><span className="badge">{adminMode?"RBAC protected":"Professional workspace"}</span><h1>{adminMode?"GazaWorks administration":"GazaWorks workspace"}</h1><p className="muted">{adminMode?"Use the modules on the left to manage live platform records. No illustrative production metrics are shown.":"Manage your profile, projects, messages, payments, verification and AI tools."}</p></div><Bell/></div>
      <div className="card" style={{marginTop:20}}><h2>{adminMode?"Operations":"Secure workflow"}</h2><p className="muted">{adminMode?"Administrative access is enforced by database permissions. Use dedicated modules for verification, finance, moderation, content, and disputes.":"Keep communication, agreements, delivery and payments inside GazaWorks so platform protections remain available."}</p></div>
    </section>
  </div>
}
