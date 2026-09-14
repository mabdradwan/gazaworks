import {NextRequest,NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function POST(req:NextRequest){
  if(!process.env.CRON_SECRET||req.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:"unauthorized"},{status:401});
  const admin=supabaseAdmin();
  const cutoff=new Date(Date.now()-12*60*60*1000).toISOString();
  const {data:rows,error}=await admin.from("disputes").select("id,project_id,worker_award_minor,client_refund_minor,decided_at").eq("status","decided").lte("decided_at",cutoff);
  if(error)return NextResponse.json({error:"query_failed"},{status:500});
  let finalized=0;
  for(const d of rows??[]){
    const {data:appeal}=await admin.from("appeals").select("id").eq("dispute_id",d.id).maybeSingle();
    if(appeal)continue;
    const {data:tx}=await admin.from("transactions").select("id,gross_minor,talent_id,client_id").eq("project_id",d.project_id).single();
    if(!tx)continue;
    const worker=Math.max(0,Number(d.worker_award_minor??0));
    await admin.from("disputes").update({status:"final"}).eq("id",d.id);
    await admin.from("transactions").update({dispute_state:"resolved"}).eq("id",tx.id);
    if(worker>0){
      const {data:p}=await admin.from("payouts").select("id").eq("transaction_id",tx.id).maybeSingle();
      if(p)await admin.from("payouts").update({amount_minor:worker,status:"pending"}).eq("id",p.id);
      else await admin.from("payouts").insert({transaction_id:tx.id,amount_minor:worker,status:"pending"});
      await admin.from("projects").update({status:"payout_pending"}).eq("id",d.project_id);
    }else await admin.from("projects").update({status:"refunded"}).eq("id",d.project_id);
    finalized++;
  }
  return NextResponse.json({finalized});
}
