import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("disputes.manage");
  if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("appeals").select("id,dispute_id,submitted_by,reasoning,status,final_decision,decided_by,decided_at,created_at,disputes(project_id,decision,worker_award_minor,client_refund_minor,reasoning,decided_at)").order("created_at",{ascending:false}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}

export async function PATCH(req:NextRequest){
  const auth=await requirePermission("disputes.manage");
  if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({
      id:z.string().uuid(),
      workerAwardMinor:z.number().int().min(0),
      clientRefundMinor:z.number().int().min(0),
      reasoning:z.string().min(10).max(8000)
    }).parse(await req.json());
    const admin=supabaseAdmin();
    const {data:a}=await admin.from("appeals").select("id,dispute_id,status").eq("id",i.id).single();
    if(!a)return NextResponse.json({error:"not_found"},{status:404});
    if(a.status!=="open")return NextResponse.json({error:"appeal_already_decided"},{status:409});
    const {data:d}=await admin.from("disputes").select("project_id").eq("id",a.dispute_id).single();
    if(!d)return NextResponse.json({error:"dispute_not_found"},{status:404});
    const {data:tx}=await admin.from("transactions").select("id,gross_minor,client_id,talent_id,currency").eq("project_id",d.project_id).single();
    if(tx&&i.workerAwardMinor+i.clientRefundMinor!==tx.gross_minor)return NextResponse.json({error:"settlement_must_equal_gross"},{status:409});
    const now=new Date().toISOString();
    await admin.from("appeals").update({status:"decided",final_decision:i.reasoning,decided_by:auth.user.id,decided_at:now}).eq("id",i.id);
    await admin.from("disputes").update({status:"final",worker_award_minor:i.workerAwardMinor,client_refund_minor:i.clientRefundMinor,reasoning:i.reasoning,decided_by:auth.user.id,decided_at:now}).eq("id",a.dispute_id);
    if(tx){
      await admin.from("transactions").update({dispute_state:"resolved"}).eq("id",tx.id);
      if(i.workerAwardMinor>0){
        const {data:existing}=await admin.from("payouts").select("id").eq("transaction_id",tx.id).maybeSingle();
        if(existing)await admin.from("payouts").update({amount_minor:i.workerAwardMinor,status:"pending"}).eq("id",existing.id);
        else await admin.from("payouts").insert({transaction_id:tx.id,amount_minor:i.workerAwardMinor,status:"pending"});
        await admin.from("projects").update({status:"payout_pending"}).eq("id",d.project_id);
      }else{
        await admin.from("projects").update({status:"refunded"}).eq("id",d.project_id);
      }
      await admin.from("notifications").insert([
        {profile_id:tx.client_id,category:"disputes",title:"Appeal finalized",body:"The final GazaWorks appeal decision has been issued.",data:{appealId:i.id,projectId:d.project_id}},
        {profile_id:tx.talent_id,category:"disputes",title:"Appeal finalized",body:"The final GazaWorks appeal decision has been issued.",data:{appealId:i.id,projectId:d.project_id}}
      ]);
    }
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
