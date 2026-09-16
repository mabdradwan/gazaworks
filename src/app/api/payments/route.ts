import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase/server";
export async function GET(){
  const db=await supabaseServer(),{data:{user}}=await db.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  const {data,error}=await db.from("transactions").select("id,project_id,gross_minor,platform_deduction_minor,provider_fee_minor,platform_revenue_minor,worker_entitlement_minor,currency,provider,provider_reference,dispute_state,settlement_worker_due_minor,settlement_deduction_minor,refund_due_minor,created_at,payments(status,simulated,created_at),payouts(status,amount_minor,payout_date,transfer_reference)").order("created_at",{ascending:false});
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

