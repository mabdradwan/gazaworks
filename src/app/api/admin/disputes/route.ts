import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {requirePermission} from "@/lib/admin-auth";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET(){
  const auth=await requirePermission("disputes.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  const {data,error}=await supabaseAdmin().from("disputes").select("*,dispute_evidence(*),appeals(*)").order("created_at",{ascending:false}).limit(200);
  return error?NextResponse.json({error:"load_failed"},{status:400}):NextResponse.json(data??[]);
}
export async function PATCH(req:NextRequest){
  const auth=await requirePermission("disputes.manage");if(!auth.ok)return NextResponse.json({error:"forbidden"},{status:auth.status});
  try{
    const i=z.object({id:z.string().uuid(),decision:z.enum(["worker_full","client_full","split"]),workerAwardMinor:z.number().int().min(0),clientRefundMinor:z.number().int().min(0),reasoning:z.string().min(10).max(8000)}).parse(await req.json());
    const admin=supabaseAdmin();const {data:d}=await admin.from("disputes").select("project_id").eq("id",i.id).single();if(!d)return NextResponse.json({error:"not_found"},{status:404});
    const {data:tx}=await admin.from("transactions").select("gross_minor,client_id,talent_id").eq("project_id",d.project_id).single();if(tx&&i.workerAwardMinor+i.clientRefundMinor!==tx.gross_minor)return NextResponse.json({error:"settlement_must_equal_gross"},{status:409});
    const {error}=await admin.from("disputes").update({status:"decided",decision:i.decision,worker_award_minor:i.workerAwardMinor,client_refund_minor:i.clientRefundMinor,reasoning:i.reasoning,decided_by:auth.user.id,decided_at:new Date().toISOString()}).eq("id",i.id);
    if(!error){await admin.from("projects").update({status:"appeal"}).eq("id",d.project_id);await admin.from("transactions").update({dispute_state:"decided"}).eq("project_id",d.project_id);if(tx)await admin.from("notifications").insert([{profile_id:tx.client_id,category:"disputes",title:"Dispute decision issued",body:"A GazaWorks administrator issued a dispute decision. One appeal may be submitted within 12 hours.",data:{disputeId:i.id}},{profile_id:tx.talent_id,category:"disputes",title:"Dispute decision issued",body:"A GazaWorks administrator issued a dispute decision. One appeal may be submitted within 12 hours.",data:{disputeId:i.id}}])}
    return NextResponse.json({ok:!error},{status:error?400:200});
  }catch{return NextResponse.json({error:"invalid_request"},{status:400})}
}
