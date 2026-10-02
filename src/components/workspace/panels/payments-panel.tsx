"use client";
import {latinLocale} from "@/lib/formatting";

import {apiFetch} from "@/lib/api-fetch";
import {useEffect,useState} from "react";
import {financeReviewCopy} from "@/lib/finance-review-copy";

type Payment={status:string;simulated:boolean;created_at:string};
type Payout={status:string;amount_minor:number;payout_date?:string|null;transfer_reference?:string|null};
type Tx={settlement_worker_due_minor?:number|null;settlement_deduction_minor?:number|null;refund_due_minor?:number;id:string;project_id:string;gross_minor:number;platform_deduction_minor:number;provider_fee_minor:number;platform_revenue_minor:number;worker_entitlement_minor:number;currency:string;provider:string;provider_reference?:string|null;dispute_state:string;created_at:string;payments?:Payment[];payouts?:Payout[]};

export function PaymentsPanel({locale="en"}:{locale?:string}){
  const {finance:c,localeTag}=financeReviewCopy(locale),[items,setItems]=useState<Tx[]>([]);
  useEffect(()=>{void apiFetch("/api/payments").then(async r=>{if(r.ok)setItems(await r.json())})},[]);
  const money=(n:number,currency:string)=>new Intl.NumberFormat(latinLocale(localeTag),{style:"currency",currency}).format(n/100);
  const state=(value?:string|null)=>value?(c.states[value]??value.replaceAll("_"," ")):c.notCreated;
  const provider=(value:string)=>c.providers[value]??value.replaceAll("_"," ");
  return <div className="grid">
    <div className="card"><h2>{c.title}</h2><p className="muted">{c.description}</p></div>
    {items.length?items.map(x=>{const payment=x.payments?.[0],payout=x.payouts?.[0];return <article className="card transaction-card" key={x.id}><div className="card-head"><div><span className="badge">{payment?.simulated?c.developmentSimulation:(payment?.status?state(payment.status):c.transaction)}</span><h2>{money(x.gross_minor,x.currency)}</h2></div><small>{new Date(x.created_at).toLocaleString(latinLocale(localeTag))}</small></div><div className="financial-grid"><div><small>{c.gross}</small><strong>{money(x.gross_minor,x.currency)}</strong></div><div><small>{c.deduction}</small><strong>{money(x.settlement_deduction_minor??x.platform_deduction_minor,x.currency)}</strong></div><div><small>{c.providerCost}</small><strong>{money(x.provider_fee_minor,x.currency)}</strong></div><div><small>{c.revenue}</small><strong>{money((x.settlement_deduction_minor??x.platform_deduction_minor)-x.provider_fee_minor,x.currency)}</strong></div><div className="highlight"><small>{c.workerEntitlement}</small><strong>{money(x.settlement_worker_due_minor??x.worker_entitlement_minor,x.currency)}</strong></div></div><div className="meta-grid"><span>{c.provider}: {provider(x.provider)}</span><span>{c.dispute}: {state(x.dispute_state)}</span><span>{c.payout}: {state(payout?.status)}</span></div>{Boolean(x.refund_due_minor)&&<p>{c.refundDue}: {money(x.refund_due_minor??0,x.currency)}</p>}{payment?.simulated&&<div className="development-warning">{c.simulationWarning}</div>}{payout?.transfer_reference&&<p><strong>{c.payoutReference}:</strong> {payout.transfer_reference}</p>}</article>}):<div className="empty">{c.empty}</div>}
  </div>
}
