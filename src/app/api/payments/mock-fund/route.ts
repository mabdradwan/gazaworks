import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {calculateTransaction} from "@/domain/marketplace";
import {supabaseServer} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function POST(req:NextRequest){
  if(process.env.PAYMENT_PROVIDER!=="mock")return NextResponse.json({error:"mock_disabled"},{status:404});
  try{
    const {projectId,providerFeeMinor}=z.object({projectId:z.string().uuid(),providerFeeMinor:z.number().int().min(0).default(0)}).parse(await req.json());
    const session=await supabaseServer(),{data:{user}}=await session.auth.getUser();
    if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
    const admin=supabaseAdmin();
    const {data:p}=await admin.from("projects").select("id,client_id,talent_id,status,project_agreements(price_minor,currency)").eq("id",projectId).single();
    if(!p||p.client_id!==user.id)return NextResponse.json({error:"forbidden"},{status:403});
    if(p.status!=="awaiting_payment")return NextResponse.json({error:"wrong_status"},{status:409});
    const agreement=Array.isArray(p.project_agreements)?p.project_agreements[0]:p.project_agreements;
    if(!agreement)return NextResponse.json({error:"agreement_missing"},{status:409});
    const {data:setting}=await admin.from("settings").select("value").eq("key","commission").single();
    const bps=Number((setting?.value as {deduction_bps?:number}|null)?.deduction_bps??700);
    const calc=calculateTransaction(agreement.price_minor,providerFeeMinor,bps);
    const {data:tx,error}=await admin.from("transactions").insert({
      project_id:p.id,client_id:p.client_id,talent_id:p.talent_id,gross_minor:calc.grossMinor,
      platform_deduction_minor:calc.platformDeductionMinor,provider_fee_minor:calc.providerFeeMinor,
      platform_revenue_minor:calc.platformRevenueMinor,worker_entitlement_minor:calc.workerEntitlementMinor,
      currency:agreement.currency,provider:"mock",provider_reference:`mock_${crypto.randomUUID()}`
    }).select("id").single();
    if(error)return NextResponse.json({error:"funding_failed",detail:error.message},{status:400});
    await admin.from("payments").insert({transaction_id:tx.id,status:"captured",amount_minor:calc.grossMinor,provider_event_id:`mock_event_${crypto.randomUUID()}`,simulated:true});
    await admin.from("ledger_entries").insert([
      {transaction_id:tx.id,account:"client_funds",direction:"credit",amount_minor:calc.grossMinor,currency:agreement.currency},
      {transaction_id:tx.id,account:"worker_entitlement",direction:"credit",amount_minor:calc.workerEntitlementMinor,currency:agreement.currency},
      {transaction_id:tx.id,account:"platform_revenue",direction:"credit",amount_minor:calc.platformRevenueMinor,currency:agreement.currency},
      ...(calc.providerFeeMinor?[{transaction_id:tx.id,account:"provider_fee",direction:"debit" as const,amount_minor:calc.providerFeeMinor,currency:agreement.currency}]:[])
    ]);
    await admin.from("projects").update({status:"funded"}).eq("id",p.id);
    await admin.from("notifications").insert([
      {profile_id:p.talent_id,category:"payments",title:"Payment secured",body:"The project is funded. You may begin work.",data:{projectId:p.id,transactionId:tx.id,simulated:true}},
      {profile_id:p.client_id,category:"payments",title:"Development payment captured",body:"This is a simulated development payment, not a real charge.",data:{projectId:p.id,transactionId:tx.id,simulated:true}}
    ]);
    return NextResponse.json({transactionId:tx.id,...calc,simulated:true},{status:201});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"invalid_request"},{status:400})}
}
