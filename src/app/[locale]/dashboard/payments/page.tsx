import {PaymentsPanel} from "@/components/workspace/resource-panels";
export const metadata={robots:{index:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;const ar=locale==="ar";
  return <section className="workspace-page"><div className="page-heading"><h1>{ar?"المدفوعات والاستحقاقات":"Payments & payouts"}</h1><p className="muted">{ar?"راجع السجل المالي وحالة الدفع والاستحقاقات والتحويلات بوضوح.":"Review deterministic transaction accounting, payment states and payout status."}</p></div><PaymentsPanel locale={locale}/></section>
}
