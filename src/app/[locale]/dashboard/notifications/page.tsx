import {NotificationsPanel} from "@/components/workspace/resource-panels";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"الإشعارات":"Notifications"}</h1><p className="muted">{ar?"تابع إشعارات الحساب والمشاريع والمدفوعات والتحقق في مكان منظم.":"Track account, project, payment and verification notices in one organized feed."}</p></div><NotificationsPanel locale={locale}/></section>
}
