import Link from "next/link";
import {Bell} from "lucide-react";

const admin=["Overview","Users","Individuals","Teams","Clients","Verification","Appointments","Work Requests","Offers","Projects","Messages","Message Moderation","Transactions","Payments","Payouts","Disputes","Appeals","Reviews","Notifications","Blog","Static Pages","Media","Categories","Skills","Languages","Email Templates","AI Settings","Payment Settings","System Settings","Security Logs","Audit Logs","Roles"];
const userRoutes:Record<string,string>={"Overview":"","Profile":"profile","Portfolio":"portfolio","Saved Talent":"favorites","Work Requests":"work-requests","Direct Hire":"direct-hire","Offers":"offers","Projects":"projects","Messages":"messages","Appointments":"appointments","Payments":"payments","Disputes":"disputes","Reviews":"reviews","AI CV Builder":"cv-builder","Notifications":"notifications"};

const ar:Record<string,string>={
  Overview:"نظرة عامة",Profile:"الملف الشخصي",Portfolio:"معرض الأعمال","Saved Talent":"المواهب المحفوظة","Work Requests":"طلبات العمل","Direct Hire":"طلبات العمل المباشرة",Offers:"العروض",Projects:"المشاريع",Messages:"الرسائل",Appointments:"المواعيد",Payments:"المدفوعات",Disputes:"النزاعات",Reviews:"التقييمات","AI CV Builder":"منشئ السيرة بالذكاء الاصطناعي",Notifications:"الإشعارات",
  Users:"المستخدمون",Individuals:"الأفراد",Teams:"الفرق",Clients:"العملاء",Verification:"التحقق","Message Moderation":"مراجعة الرسائل",Transactions:"المعاملات",Payouts:"التحويلات",Appeals:"الاستئنافات",Blog:"المقالات","Static Pages":"الصفحات الثابتة",Media:"الوسائط",Categories:"التصنيفات",Skills:"المهارات",Languages:"اللغات","Email Templates":"قوالب البريد","AI Settings":"إعدادات الذكاء الاصطناعي","Payment Settings":"إعدادات الدفع","System Settings":"إعدادات النظام","Security Logs":"سجل الأمان","Audit Logs":"سجل التدقيق",Roles:"الأدوار والصلاحيات"
};

export function Dashboard({locale,adminMode=false}:{locale:string;adminMode?:boolean}){
  const items=adminMode?admin:Object.keys(userRoutes),rtl=locale==="ar";
  return <div style={{display:"grid",gridTemplateColumns:"minmax(210px,260px) 1fr",minHeight:"75vh"}}>
    <aside className="desktop" style={{padding:24,borderInlineEnd:"1px solid var(--line)",background:"#f8faf9"}}>
      <strong>{adminMode?(rtl?"الإدارة":"Administration"):(rtl?"مساحة العمل":"Workspace")}</strong>
      <nav style={{display:"grid",gap:5,marginTop:20}}>{items.map(x=><Link className="muted" style={{padding:"8px 4px",fontSize:14}} key={x} href={adminMode?`/${locale}/admin?module=${encodeURIComponent(x)}`:`/${locale}/dashboard/${userRoutes[x]??""}`}>{rtl?(ar[x]??x):x}</Link>)}</nav>
    </aside>
    <section style={{padding:"32px clamp(16px,4vw,48px)",overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:20}}>
        <div><span className="badge">{adminMode?(rtl?"محمي بصلاحيات RBAC":"RBAC protected"):(rtl?"مساحة عمل مهنية":"Professional workspace")}</span>
        <h1>{adminMode?(rtl?"إدارة GazaWorks":"GazaWorks administration"):(rtl?"مساحة عمل GazaWorks":"GazaWorks workspace")}</h1>
        <p className="muted">{adminMode?(rtl?"استخدم الوحدات لإدارة السجلات الحية والتحقق والمالية والمحتوى والنزاعات.":"Use the modules to manage live records, verification, finance, content and disputes."):(rtl?"أدر ملفك ومشاريعك ورسائلك ومدفوعاتك والتحقق وأدوات الذكاء الاصطناعي.":"Manage your profile, projects, messages, payments, verification and AI tools.")}</p></div><Bell/>
      </div>
      <div className="card" style={{marginTop:20}}><h2>{adminMode?(rtl?"العمليات":"Operations"):(rtl?"مسار عمل آمن":"Secure workflow")}</h2><p className="muted">{adminMode?(rtl?"يتم فرض الوصول الإداري من خلال صلاحيات قاعدة البيانات الدقيقة.":"Administrative access is enforced through granular database permissions."):(rtl?"أبقِ التواصل والاتفاقيات والتسليم والمدفوعات داخل GazaWorks للحفاظ على حماية المنصة.":"Keep communication, agreements, delivery and payments inside GazaWorks so platform protections remain available.")}</p></div>
    </section>
  </div>
}
