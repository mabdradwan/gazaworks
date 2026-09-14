import {NextRequest,NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

async function run(req:NextRequest){
  if(!process.env.CRON_SECRET||req.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:"unauthorized"},{status:401});
  const db=supabaseAdmin();
  const {data:deliveries,error}=await db.from("project_deliveries").select("id,project_id").lte("auto_accept_at",new Date().toISOString()).is("accepted_at",null);
  if(error)return NextResponse.json({error:"query_failed"},{status:500});
  let accepted=0;
  for(const d of deliveries??[]){
    const {data:dispute}=await db.from("disputes").select("id").eq("project_id",d.project_id).in("status",["open","decided"]).maybeSingle();
    if(dispute)continue;
    const {data:project}=await db.from("projects").select("talent_id").eq("id",d.project_id).single();
    await db.from("project_deliveries").update({accepted_at:new Date().toISOString()}).eq("id",d.id);
    await db.from("projects").update({status:"payout_pending"}).eq("id",d.project_id);
    const {data:tx}=await db.from("transactions").select("id,worker_entitlement_minor").eq("project_id",d.project_id).maybeSingle();
    if(tx){
      const {data:p}=await db.from("payouts").select("id").eq("transaction_id",tx.id).maybeSingle();
      if(!p)await db.from("payouts").insert({transaction_id:tx.id,amount_minor:tx.worker_entitlement_minor,status:"pending"});
    }
    if(project)await db.from("notifications").insert({profile_id:project.talent_id,category:"payments",title:"Delivery automatically accepted",body:"The 72-hour review window ended without a dispute. Your payout is now pending.",data:{projectId:d.project_id}});
    accepted++;
  }
  return NextResponse.json({accepted});
}
export const POST=run;
export const GET=run;
