"use client";
import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useState} from "react";

type Payment={status:string;simulated:boolean;created_at:string};
type Payout={status:string;amount_minor:number;payout_date?:string|null;transfer_reference?:string|null};
type Tx={settlement_worker_due_minor?:number|null;settlement_deduction_minor?:number|null;refund_due_minor?:number;id:string;project_id:string;gross_minor:number;platform_deduction_minor:number;provider_fee_minor:number;platform_revenue_minor:number;worker_entitlement_minor:number;currency:string;provider:string;provider_reference?:string|null;dispute_state:string;created_at:string;payments?:Payment[];payouts?:Payout[]};

export function PaymentsPanel({locale="en"}:{locale?:string}){
  const ar=locale==="ar",[items,setItems]=useState<Tx[]>([]);
  useEffect(()=>{void apiFetch("/api/payments").then(async r=>{if(r.ok)setItems(await r.json())})},[]);
  const money=(n:number,c:string)=>new Intl.NumberFormat(ar?"ar-PS":"en",{style:"currency",currency:c}).format(n/100);
  return <div className="grid">
    <div className="card"><h2>{ar?"السجل المالي":"Transaction ledger"}</h2><p className="muted">{ar?"الحسابات المالية حتمية وليست من صنع الذكاء الاصطناعي. إجمالي الخصم الطبيعي مستهدف عند 7% ويشمل تكلفة مزود الدفع الفعلية.":"Financial values are deterministic, not AI-generated. The normal total transaction deduction target is 7%, including the actual payment-provider cost."}</p></div>
    {items.length?items.map(x=>{const payment=x.payments?.[0],payout=x.payouts?.[0];return <article className="card transaction-card" key={x.id}><div className="card-head"><div><span className="badge">{payment?.simulated?(ar?"محاكاة تطوير":"Development simulation"):(payment?.status??(ar?"معاملة":"Transaction"))}</span><h2>{money(x.gross_minor,x.currency)}</h2></div><small>{new Date(x.created_at).toLocaleString(ar?"ar-PS":"en")}</small></div><div className="financial-grid"><div><small>{ar?"إجمالي قيمة المشروع":"Gross project amount"}</small><strong>{money(x.gross_minor,x.currency)}</strong></div><div><small>{ar?"إجمالي خصم GazaWorks":"Total GazaWorks deduction"}</small><strong>{money(x.settlement_deduction_minor??x.platform_deduction_minor,x.currency)}</strong></div><div><small>{ar?"تكلفة مزود الدفع":"Provider cost"}</small><strong>{money(x.provider_fee_minor,x.currency)}</strong></div><div><small>{ar?"إيراد المنصة":"Platform operating revenue"}</small><strong>{money((x.settlement_deduction_minor??x.platform_deduction_minor)-x.provider_fee_minor,x.currency)}</strong></div><div className="highlight"><small>{ar?"استحقاق المحترف":"Worker entitlement"}</small><strong>{money(x.settlement_worker_due_minor??x.worker_entitlement_minor,x.currency)}</strong></div></div><div className="meta-grid"><span>{ar?"المزود":"Provider"}: {x.provider}</span><span>{ar?"حالة النزاع":"Dispute"}: {x.dispute_state}</span><span>{ar?"حالة التحويل":"Payout"}: {payout?.status??(ar?"لم يُنشأ بعد":"not created")}</span></div>{Boolean(x.refund_due_minor)&&<p>{ar?"مبلغ مستحق للاسترداد — لم يُسجل ردّه بعد":"Refund obligation — no completed refund recorded"}: {money(x.refund_due_minor??0,x.currency)}</p>}{payment?.simulated&&<div className="development-warning">{ar?"هذه معاملة محاكاة فقط وليست دفعة بنكية حقيقية.":"This record is a development simulation and not a real bank/card charge."}</div>}{payout?.transfer_reference&&<p><strong>{ar?"مرجع التحويل":"Payout reference"}:</strong> {payout.transfer_reference}</p>}</article>}):<div className="empty">{ar?"لا توجد معاملات حتى الآن.":"No transactions yet."}</div>}
  </div>
}

